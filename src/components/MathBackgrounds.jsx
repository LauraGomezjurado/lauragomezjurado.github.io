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
// Live in backgroundState.js so write-only consumers (Home, Portfolio) can
// import them without pulling in Three.js. Re-exported here for compatibility.
import { morphState, cameraState, motifState, stageState } from './backgroundState'
export { morphState, cameraState, motifState, stageState }

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
      [0.165, 0.129, 0.102],
      [0.155, 0.120, 0.094],
      [0.145, 0.112, 0.088],
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
      [0.150, 0.118, 0.094],
      [0.135, 0.106, 0.085],
      [0.125, 0.098, 0.080],
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
      [0.165, 0.129, 0.102],
      [0.150, 0.118, 0.094],
      [0.140, 0.110, 0.088],
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
    const extraSpin = spinSmooth.current * 0.09
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
      // Dark espresso ink on light paper: solid pigment read.
      matRef.current.opacity = 0.72 * opSmooth.current
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
    // Per-project tint stays entirely in the coffee/brown family (R ≥ G ≥ B
    // always) so the curve never reads as cool/blue. hue (-1..1) only modulates
    // depth: deeper espresso at hue=-1, lighter terracotta at hue=+1.
    const warm = (hue + 1) / 2 // 0..1
    const tintR = 0.34 + warm * 0.15
    const tintG = 0.22 + warm * 0.09
    const tintB = 0.15 + warm * 0.05

    for (let i = 0; i < len; i++) {
      posAttr.array[i] = fromA.positions[i] + t * (toA.positions[i] - fromA.positions[i])
      const base = fromA.colors[i] + t * (toA.colors[i] - fromA.colors[i])
      // channelwise tint
      const ch = i % 3
      const tint = ch === 0 ? tintR : ch === 1 ? tintG : tintB
      colAttr.array[i] = base * (1 - mix * 0.6) + tint * (mix * 0.6)
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
          opacity={0.72}
          linewidth={1}
        />
      </line>
    </group>
  )
}

// ─── Figure label ─────────────────────────────────────────────────────────────
const LABELS = [
  {
    name: 'Lorenz attractor',
    teaser: 'That swoopy trace weaving behind the page?',
    coolLine:
      'A tiny nudge in starting conditions sends the path onto a completely different orbit—bounded chaos that helped launch modern dynamical systems.',
    paperUrl: 'https://doi.org/10.1175/1520-0469(1963)020%3C0130:DNF%3E2.0.CO;2',
    paperLabel: 'Lorenz (1963), Deterministic Nonperiodic Flow',
    accentRgb: '74, 52, 36',
  },
  {
    name: 'Halvorsen attractor',
    teaser: 'The symmetric tangled loop you\'re seeing?',
    coolLine:
      'Three coupled equations that look the same under x → y → z → x, so the chaos stays perfectly symmetric instead of lopsided.',
    paperUrl: 'https://en.wikipedia.org/wiki/Halvorsen_attractor',
    paperLabel: 'Halvorsen attractor (overview)',
    accentRgb: '74, 52, 36',
  },
  {
    name: 'Aizawa attractor',
    teaser: 'Those orbits hugging a donut-shaped surface?',
    coolLine:
      'Trajectories wrap a torus forever without settling into a simple repeat—the shape stays recognizable while the path never closes.',
    paperUrl: 'https://doi.org/10.1016/0378-4371(82)90212-4',
    paperLabel: 'Aizawa (1982), toroidal chaotic flow',
    accentRgb: '74, 52, 36',
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
              ? 'max-h-[min(40vh,200px)] opacity-100 mb-2 sm:mb-3'
              : 'max-h-0 opacity-0 mb-0'
          }`}
          aria-hidden={!open}
        >
          <p
            className="text-[10px] sm:text-[11px] font-medium mb-1.5 sm:mb-2"
            style={{ color: `rgba(${accentRgb},0.75)` }}
          >
            {label.name}
          </p>
          <p
            className="text-[10px] sm:text-xs font-light leading-snug sm:leading-relaxed text-right mb-2 sm:mb-2.5"
            style={{ color: `rgba(${accentRgb},0.55)` }}
          >
            {label.coolLine}
          </p>
          <a
            href={label.paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs font-light underline underline-offset-2 sm:underline-offset-3"
            style={{ color: `rgba(${accentRgb},0.72)` }}
          >
            {label.paperLabel}
          </a>
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
          <span className="text-[10px] sm:text-xs font-light leading-tight sm:leading-snug underline decoration-[rgba(42,33,26,0.25)] underline-offset-2 sm:underline-offset-4 hover:decoration-[rgba(42,33,26,0.45)] block">
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

      {/* Vignette: warm sand wash so it melts into the paper layer and lifts
          text off the dark line-art rather than darkening the page. */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 2,
        background: 'radial-gradient(ellipse at center, rgba(230,220,200,0.50) 0%, rgba(230,220,200,0.20) 45%, rgba(230,220,200,0) 72%)',
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
