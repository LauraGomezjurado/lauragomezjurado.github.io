/**
 * MathBackgrounds.jsx
 *
 * Single canvas that morphs between three strange attractors as the user scrolls.
 * GSAP (in Home.jsx) drives `morphState.progress`:  0 = Lorenz, 1 = Halvorsen, 2 = Aizawa
 * useFrame lerps vertex positions + colors every frame: the lines literally rearrange.
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Shared scroll signals: written by GSAP, read by useFrame ───────────────
export const morphState  = { progress: 0 }
export const cameraState = { z: 5.5 }     // default distance; zooms in for Portfolio
// Per-project motif: projects "claim" the background by writing a hue tint
// and intensity. The canvas reads these and modulates color + rotation.
// hue: 0 = attractor default; -1..1 shifts toward warm/cool
// intensity: 0..1 = how much of the project's tint to mix in
export const motifState  = { hue: 0, intensity: 0, spin: 0 }
// Stage: lets sections re-position and shrink the attractor so it sits in a
// defined region of the screen rather than full-bleed. offsetX/Y are in world
// units (-2..2 typical), scale shrinks the curve, opacity attenuates how
// strongly the curve is drawn while keeping it always present.
export const stageState  = { offsetX: 0, offsetY: -0.2, scale: 1, opacity: 1 }

// ─── RK4 ─────────────────────────────────────────────────────────────────────
function rk4(state, derivFn, dt) {
  const k1 = derivFn(state)
  const k2 = derivFn(state.map((v, i) => v + k1[i] * dt / 2))
  const k3 = derivFn(state.map((v, i) => v + k2[i] * dt / 2))
  const k4 = derivFn(state.map((v, i) => v + k3[i] * dt))
  return state.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
}

// ─── Build normalised positions + colors for one attractor ───────────────────
function buildAttractor({ init, deriv, dt, steps, burnIn, colors: [cA, cB, cC] }) {
  let s = init
  for (let i = 0; i < burnIn; i++) s = rk4(s, deriv, dt)

  const raw = new Float32Array(steps * 3)
  for (let i = 0; i < steps; i++) {
    raw[i * 3] = s[0]; raw[i * 3 + 1] = s[1]; raw[i * 3 + 2] = s[2]
    s = rk4(s, deriv, dt)
  }

  // Normalise to ±2 world units
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity
  for (let i = 0; i < steps; i++) {
    const x = raw[i*3], y = raw[i*3+1], z = raw[i*3+2]
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  }
  const cx = (minX+maxX)/2, cy = (minY+maxY)/2, cz = (minZ+maxZ)/2
  const scale = 4.0 / Math.max(maxX-minX, maxY-minY, maxZ-minZ)

  const positions = new Float32Array(steps * 3)
  const colorsArr = new Float32Array(steps * 3)
  const colorA = new THREE.Color(...cA)
  const colorB = new THREE.Color(...cB)
  const colorC = new THREE.Color(...cC)

  for (let i = 0; i < steps; i++) {
    positions[i*3]   = (raw[i*3]   - cx) * scale
    positions[i*3+1] = (raw[i*3+1] - cy) * scale
    positions[i*3+2] = (raw[i*3+2] - cz) * scale

    const t = i / (steps - 1)
    const c = new THREE.Color()
    if (t < 0.5) c.lerpColors(colorA, colorB, t * 2)
    else         c.lerpColors(colorB, colorC, (t - 0.5) * 2)
    colorsArr[i*3] = c.r; colorsArr[i*3+1] = c.g; colorsArr[i*3+2] = c.b
  }

  return { positions, colors: colorsArr }
}

// ─── Attractor definitions ────────────────────────────────────────────────────
const N = 30000  // points: enough for dense curves, fast to lerp

function buildAllAttractors() {
  // Coherent cool palette shared across Lorenz ↔ Halvorsen ↔ Aizawa: fits
  // laboratory/dynamics figures; no ornamental warm pigment that clashes.
  //
  // 1. Lorenz  σ=10, ρ=28, β=8/3: indigo / periwinkle
  const lorenz = buildAttractor({
    init: [0.1, 0, 0], dt: 0.005, steps: N, burnIn: 3000,
    deriv: ([x, y, z]) => [10*(y-x), x*(28-z)-y, x*y - (8/3)*z],
    colors: [
      [0.42, 0.52, 0.78],
      [0.50, 0.55, 0.78],
      [0.58, 0.55, 0.72],
    ],
  })

  // 2. Halvorsen: teal / emerald (muted, fits the Lorenz blues)
  const halvorsen = buildAttractor({
    init: [-0.1, 0.5, 0.5], dt: 0.005, steps: N, burnIn: 2000,
    deriv: ([x, y, z]) => [
      -1.4*x - 4*y - 4*z - y*y,
      -1.4*y - 4*z - 4*x - z*z,
      -1.4*z - 4*x - 4*y - x*x,
    ],
    colors: [
      [0.20, 0.68, 0.74],
      [0.14, 0.58, 0.62],
      [0.12, 0.50, 0.54],
    ],
  })

  // 3. Aizawa: plum back toward indigo
  const aizawa = buildAttractor({
    init: [0.1, 0, 0.1], dt: 0.01, steps: N, burnIn: 2000,
    deriv: ([x, y, z]) => [
      (z-0.7)*x - 3.5*y,
      3.5*x + (z-0.7)*y,
      0.6 + 0.95*z - z*z*z/3 - (x*x+y*y)*(1+0.25*z) + 0.1*z*x*x*x,
    ],
    colors: [
      [0.62, 0.52, 0.72],
      [0.58, 0.55, 0.74],
      [0.52, 0.58, 0.78],
    ],
  })

  return [lorenz, halvorsen, aizawa]
}

// ─── Morphing Three.js scene ──────────────────────────────────────────────────
function MorphingScene({ attractors, hovered }) {
  const lineRef  = useRef()
  const groupRef = useRef()
  const matRef   = useRef()
  const rotY = useRef(0)
  const rotX = useRef(0)
  // smoothed read of motif state so jumpy scrolls don't flash
  const hueSmooth = useRef(0)
  const intSmooth = useRef(0)
  const spinSmooth = useRef(0)
  // smoothed stage so position/scale glides between sections rather than snapping
  const offXSmooth = useRef(0)
  const offYSmooth = useRef(-0.2)
  const scaleSmooth = useRef(1)
  const opSmooth = useRef(1)

  // Initialise geometry from first attractor
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = attractors[0].positions.slice()
    const col = attractors[0].colors.slice()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    return geo
  }, [attractors])

  useFrame((state, delta) => {
    // Camera zoom: smooth follow of cameraState.z
    state.camera.position.z += (cameraState.z - state.camera.position.z) * Math.min(delta * 3, 1)

    // Smooth motif signals
    const k = Math.min(delta * 2.4, 1)
    hueSmooth.current  += (motifState.hue       - hueSmooth.current)  * k
    intSmooth.current  += (motifState.intensity - intSmooth.current)  * k
    spinSmooth.current += (motifState.spin      - spinSmooth.current) * k

    // Smooth stage signals (position/scale of the curve in world space, plus
    // material opacity for sections that want the canvas to recede).
    const ks = Math.min(delta * 2.0, 1)
    offXSmooth.current  += (stageState.offsetX - offXSmooth.current)  * ks
    offYSmooth.current  += (stageState.offsetY - offYSmooth.current)  * ks
    scaleSmooth.current += (stageState.scale   - scaleSmooth.current) * ks
    opSmooth.current    += (stageState.opacity - opSmooth.current)    * ks

    // Rotation: motif can add a subtle extra spin when a project claims the canvas.
    // Slowed slightly so the curve feels meditative rather than restless.
    const extraSpin = spinSmooth.current * 0.06
    rotY.current += delta * (hovered ? 0.10 : 0.030) + extraSpin * delta
    rotX.current += delta * (hovered ? 0.025 : 0.006)
    if (groupRef.current) {
      groupRef.current.rotation.y = rotY.current
      groupRef.current.rotation.x = Math.sin(rotX.current) * (hovered ? 0.22 : 0.08)
      groupRef.current.position.x = offXSmooth.current
      groupRef.current.position.y = offYSmooth.current
      const s = scaleSmooth.current
      groupRef.current.scale.set(s, s, s)
    }
    if (matRef.current) {
      // Base opacity is 0.55 (down from 0.82): pigment, not glow.
      matRef.current.opacity = 0.55 * opSmooth.current
    }

    // Morph: lerp positions + colors between adjacent attractors
    const p       = Math.max(0, Math.min(1.9999, morphState.progress))
    const fromIdx = Math.floor(p)
    const t       = p - fromIdx
    const fromA   = attractors[fromIdx]
    const toA     = attractors[fromIdx + 1]

    const posAttr = geometry.attributes.position
    const colAttr = geometry.attributes.color
    const len = posAttr.array.length

    const hue = hueSmooth.current
    const mix = Math.max(0, Math.min(1, intSmooth.current))
    // Map hue (-1..1) to a soft tint color. Negative = warm amber, positive = cool teal.
    const tintR = hue < 0 ? 0.95 + hue * 0.15 : 0.55 - hue * 0.20
    const tintG = hue < 0 ? 0.70 + hue * 0.25 : 0.85 + hue * 0.05
    const tintB = hue < 0 ? 0.45 - hue * 0.20 : 0.92 + hue * 0.05

    for (let i = 0; i < len; i++) {
      posAttr.array[i] = fromA.positions[i] + t * (toA.positions[i] - fromA.positions[i])
      const base = fromA.colors[i] + t * (toA.colors[i] - fromA.colors[i])
      // channelwise tint
      const ch = i % 3
      const tint = ch === 0 ? tintR : ch === 1 ? tintG : tintB
      colAttr.array[i] = base * (1 - mix * 0.55) + tint * (mix * 0.55)
    }
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  })

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          ref={matRef}
          vertexColors
          transparent
          opacity={0.55}
          linewidth={1}
        />
      </line>
    </group>
  )
}

// ─── Figure label ─────────────────────────────────────────────────────────────
const LABELS = [
  {
    name: 'Lorenz Attractor',
    teaser:
      'That swoopy trace weaving behind the page? Strange attractor named after Lorenz. Tap for the equations.',
    equations: ['dx/dt = σ(y − x)', 'dy/dt = x(ρ − z) − y', 'dz/dt = xy − βz'],
    params: 'σ = 10  ·  ρ = 28  ·  β = 8/3',
    description:
      'Deterministic three-dimensional flow. Trajectories stay bounded but aperiodic; nearby initial conditions diverge quickly.',
    accentRgb: '156, 180, 212',
  },
  {
    name: 'Halvorsen Attractor',
    teaser:
      'The symmetric tangled loop you\'re seeing? Halvorsen\'s system. Tap for the ODEs.',
    equations: ['dx/dt = −ax − 4y − 4z − y²', 'dy/dt = −ay − 4z − 4x − z²', 'dz/dt = −az − 4x − 4y − x²'],
    params: 'a = 1.4',
    description: 'A cyclically symmetric strange attractor. Each equation is identical under the permutation x → y → z → x.',
    accentRgb: '104, 198, 200',
  },
  {
    name: 'Aizawa Attractor',
    teaser:
      'Those orbits hugging a donut-shaped surface? Aizawa attractor. Tap for the math.',
    equations: ['dx/dt = (z−b)x − dy', 'dy/dt = dx + (z−b)y', 'dz/dt = c + az − z³/3 − (x²+y²)(1+ez) + fzx³'],
    params: 'a=0.95  b=0.7  c=0.6  d=3.5  e=0.25  f=0.1',
    description:
      'Toroidal strange attractor. Trajectories wrap on a torus without settling into a simple repeat.',
    accentRgb: '178, 158, 198',
  },
]

function FigureLabel({ labelIdx }) {
  const [open, setOpen] = useState(false)
  const label = LABELS[labelIdx]
  const { accentRgb } = label

  useEffect(() => {
    setOpen(false)
  }, [labelIdx])

  return (
    <div
      className="fixed bottom-4 right-3 max-[380px]:bottom-3 max-[380px]:right-2 sm:bottom-6 sm:right-6 pointer-events-none select-none w-full max-w-[min(260px,calc(100vw-4.25rem))] sm:max-w-[280px] md:max-w-[300px]"
      style={{ zIndex: 40, textAlign: 'right' }}
    >
      <div className="pointer-events-auto inline-flex flex-col items-end gap-0 w-full">
        <div
          id={`attractor-explainer-${labelIdx}`}
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-[450ms] ease-out ${
            open
              ? 'max-h-[min(62vh,300px)] sm:max-h-[360px] opacity-100 mb-2 sm:mb-3'
              : 'max-h-0 opacity-0 mb-0'
          }`}
          aria-hidden={!open}
        >
          <p
            className="text-[10px] sm:text-[11px] font-medium mb-1 sm:mb-2"
            style={{ color: `rgba(${accentRgb},0.75)` }}
          >
            {label.name}
          </p>
          <div
            className="font-mono text-[10px] sm:text-xs mb-1.5 sm:mb-2"
            style={{ color: `rgba(${accentRgb},0.80)`, lineHeight: 1.65 }}
          >
            {label.equations.map((eq, i) => (
              <div key={i}>{eq}</div>
            ))}
          </div>
          <div
            className="font-mono text-[10px] sm:text-xs mb-1.5 sm:mb-2"
            style={{ color: `rgba(${accentRgb},0.45)`, lineHeight: 1.55 }}
          >
            {label.params}
          </div>
          <p
            className="text-[10px] sm:text-xs font-light leading-snug sm:leading-relaxed text-right"
            style={{ color: `rgba(${accentRgb},0.42)` }}
          >
            {label.description}
          </p>
        </div>

        <button
          type="button"
          className="text-right bg-transparent border-0 p-0 cursor-pointer font-sans w-full touch-manipulation pt-1.5 sm:pt-2"
          style={{
            borderTop: open ? `1px solid rgba(${accentRgb},0.28)` : `1px solid rgba(${accentRgb},0.15)`,
            color: `rgba(${accentRgb},${open ? 0.85 : 0.62})`,
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`attractor-explainer-${labelIdx}`}
        >
          <span className="text-[10px] sm:text-xs font-light leading-tight sm:leading-snug underline decoration-[rgba(255,255,255,0.2)] underline-offset-2 sm:underline-offset-4 hover:decoration-[rgba(255,255,255,0.35)] block">
            {open ? 'Tap to hide' : label.teaser}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MorphingBackground() {
  const [hovered, setHovered] = useState(false)

  const attractors = useMemo(buildAllAttractors, [])

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <MorphingScene attractors={attractors} hovered={hovered} />
      </Canvas>

      {/* Vignette: uses warm ink colour so it disappears into the paper layer
          rather than punching a black hole through it. */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 2,
        background: 'radial-gradient(ellipse at center, rgba(13,12,18,0.55) 0%, rgba(13,12,18,0.22) 45%, rgba(13,12,18,0) 72%)',
      }} />
    </div>
  )
}

/**
 * AttractorLabel: exported separately so Home.jsx can render it in a high-z
 * stacking context. Reads morphState directly (cheap RAF poll, only re-renders
 * when crossing a threshold).
 */
export function AttractorLabel() {
  const [labelIdx, setLabelIdx] = useState(0)
  const prevIdx = useRef(0)

  useEffect(() => {
    let rafId
    const poll = () => {
      const p = morphState.progress
      const idx = p < 0.5 ? 0 : p < 1.5 ? 1 : 2
      if (idx !== prevIdx.current) {
        prevIdx.current = idx
        setLabelIdx(idx)
      }
      rafId = requestAnimationFrame(poll)
    }
    rafId = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return <FigureLabel labelIdx={labelIdx} />
}
