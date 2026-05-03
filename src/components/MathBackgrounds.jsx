/**
 * MathBackgrounds.jsx
 *
 * Single canvas that morphs between three strange attractors as the user scrolls.
 * GSAP (in Home.jsx) drives `morphState.progress`:  0 = Lorenz, 1 = Halvorsen, 2 = Aizawa
 * useFrame lerps vertex positions + colors every frame — the lines literally rearrange.
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Shared scroll signals — written by GSAP, read by useFrame ───────────────
export const morphState  = { progress: 0 }
export const cameraState = { z: 5.5 }     // default distance; zooms in for Portfolio
// Per-project motif: projects "claim" the background by writing a hue tint
// and intensity. The canvas reads these and modulates color + rotation.
// hue: 0 = attractor default; -1..1 shifts toward warm/cool
// intensity: 0..1 = how much of the project's tint to mix in
export const motifState  = { hue: 0, intensity: 0, spin: 0 }

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
const N = 30000  // points — enough for dense curves, fast to lerp

function buildAllAttractors() {
  // 1. Lorenz  σ=10, ρ=28, β=8/3
  const lorenz = buildAttractor({
    init: [0.1, 0, 0], dt: 0.005, steps: N, burnIn: 3000,
    deriv: ([x, y, z]) => [10*(y-x), x*(28-z)-y, x*y - (8/3)*z],
    colors: [
      [0.35, 0.50, 0.95],  // blue
      [0.55, 0.38, 0.90],  // indigo
      [0.68, 0.30, 0.85],  // purple
    ],
  })

  // 2. Halvorsen  a=1.4  cyclic symmetry
  const halvorsen = buildAttractor({
    init: [-0.1, 0.5, 0.5], dt: 0.005, steps: N, burnIn: 2000,
    deriv: ([x, y, z]) => [
      -1.4*x - 4*y - 4*z - y*y,
      -1.4*y - 4*z - 4*x - z*z,
      -1.4*z - 4*x - 4*y - x*x,
    ],
    colors: [
      [0.15, 0.85, 0.78],  // cyan
      [0.10, 0.72, 0.65],  // teal
      [0.08, 0.60, 0.50],  // emerald
    ],
  })

  // 3. Aizawa  toroidal  a=0.95 b=0.7 c=0.6 d=3.5 e=0.25 f=0.1
  const aizawa = buildAttractor({
    init: [0.1, 0, 0.1], dt: 0.01, steps: N, burnIn: 2000,
    deriv: ([x, y, z]) => [
      (z-0.7)*x - 3.5*y,
      3.5*x + (z-0.7)*y,
      0.6 + 0.95*z - z*z*z/3 - (x*x+y*y)*(1+0.25*z) + 0.1*z*x*x*x,
    ],
    colors: [
      [0.52, 0.38, 0.88],  // violet
      [0.62, 0.32, 0.82],  // purple
      [0.78, 0.28, 0.72],  // magenta
    ],
  })

  return [lorenz, halvorsen, aizawa]
}

// ─── Morphing Three.js scene ──────────────────────────────────────────────────
function MorphingScene({ attractors, hovered }) {
  const lineRef  = useRef()
  const groupRef = useRef()
  const rotY = useRef(0)
  const rotX = useRef(0)
  // smoothed read of motif state so jumpy scrolls don't flash
  const hueSmooth = useRef(0)
  const intSmooth = useRef(0)
  const spinSmooth = useRef(0)

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
    // Camera zoom — smooth follow of cameraState.z
    state.camera.position.z += (cameraState.z - state.camera.position.z) * Math.min(delta * 3, 1)

    // Smooth motif signals
    const k = Math.min(delta * 2.4, 1)
    hueSmooth.current  += (motifState.hue       - hueSmooth.current)  * k
    intSmooth.current  += (motifState.intensity - intSmooth.current)  * k
    spinSmooth.current += (motifState.spin      - spinSmooth.current) * k

    // Rotation — motif can add a subtle extra spin when a project claims the canvas
    const extraSpin = spinSmooth.current * 0.08
    rotY.current += delta * (hovered ? 0.12 : 0.04) + extraSpin * delta
    rotX.current += delta * (hovered ? 0.03 : 0.008)
    if (groupRef.current) {
      groupRef.current.rotation.y = rotY.current
      groupRef.current.rotation.x = Math.sin(rotX.current) * (hovered ? 0.25 : 0.10)
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
        <lineBasicMaterial vertexColors transparent opacity={0.82} linewidth={1} />
      </line>
    </group>
  )
}

// ─── Figure label ─────────────────────────────────────────────────────────────
const LABELS = [
  {
    name: 'Lorenz Attractor',
    teaser: 'Curious what the Lorenz attractor is?',
    equations: ['dx/dt = σ(y − x)', 'dy/dt = x(ρ − z) − y', 'dz/dt = xy − βz'],
    params: 'σ = 10  ·  ρ = 28  ·  β = 8/3',
    description: 'A deterministic system that never repeats. Tiny differences in starting conditions diverge exponentially — the origin of the butterfly effect.',
    accentRgb: '160, 140, 255',
  },
  {
    name: 'Halvorsen Attractor',
    teaser: 'Curious what the Halvorsen attractor is?',
    equations: ['dx/dt = −ax − 4y − 4z − y²', 'dy/dt = −ay − 4z − 4x − z²', 'dz/dt = −az − 4x − 4y − x²'],
    params: 'a = 1.4',
    description: 'A cyclically symmetric strange attractor. Each equation is identical under the permutation x → y → z → x.',
    accentRgb: '80, 210, 190',
  },
  {
    name: 'Aizawa Attractor',
    teaser: 'Curious what the Aizawa attractor is?',
    equations: ['dx/dt = (z−b)x − dy', 'dy/dt = dx + (z−b)y', 'dz/dt = c + az − z³/3 − (x²+y²)(1+ez) + fzx³'],
    params: 'a=0.95  b=0.7  c=0.6  d=3.5  e=0.25  f=0.1',
    description: 'A toroidal strange attractor — trajectories wrap around the surface of a torus, never quite repeating.',
    accentRgb: '170, 140, 230',
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
      className="absolute bottom-6 right-6 pointer-events-none select-none"
      style={{ zIndex: 20, maxWidth: 300, textAlign: 'right' }}
    >
      <div className="pointer-events-auto inline-flex flex-col items-end gap-0">
        <div
          id={`attractor-explainer-${labelIdx}`}
          style={{
            overflow: 'hidden',
            maxHeight: open ? 360 : 0,
            opacity: open ? 1 : 0,
            transition: 'max-height 0.45s ease, opacity 0.35s ease',
            marginBottom: open ? 12 : 0,
          }}
          aria-hidden={!open}
        >
          <p
            className="text-[11px] font-medium mb-2"
            style={{ color: `rgba(${accentRgb},0.75)` }}
          >
            {label.name}
          </p>
          <div
            className="font-mono text-xs mb-2"
            style={{ color: `rgba(${accentRgb},0.80)`, lineHeight: 1.8 }}
          >
            {label.equations.map((eq, i) => (
              <div key={i}>{eq}</div>
            ))}
          </div>
          <div
            className="font-mono text-xs mb-2"
            style={{ color: `rgba(${accentRgb},0.45)`, lineHeight: 1.6 }}
          >
            {label.params}
          </div>
          <p
            className="text-xs font-light leading-relaxed text-right"
            style={{ color: `rgba(${accentRgb},0.42)` }}
          >
            {label.description}
          </p>
        </div>

        <button
          type="button"
          className="text-right bg-transparent border-0 p-0 cursor-pointer font-sans max-w-full touch-manipulation"
          style={{
            borderTop: open ? `1px solid rgba(${accentRgb},0.28)` : `1px solid rgba(${accentRgb},0.15)`,
            paddingTop: 8,
            color: `rgba(${accentRgb},${open ? 0.85 : 0.62})`,
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`attractor-explainer-${labelIdx}`}
        >
          <span className="text-xs font-light leading-snug underline decoration-[rgba(255,255,255,0.2)] underline-offset-4 hover:decoration-[rgba(255,255,255,0.35)]">
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
  const [labelIdx, setLabelIdx] = useState(0)
  const prevIdx = useRef(0)

  // Build all three attractors once
  const attractors = useMemo(buildAllAttractors, [])

  // Poll morphState to update label when crossing thresholds (cheap — only triggers 2 re-renders total)
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

      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 2,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0) 70%)',
      }} />

      <FigureLabel labelIdx={labelIdx} />
    </div>
  )
}
