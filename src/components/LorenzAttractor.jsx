import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Lorenz system ────────────────────────────────────────────────────────────
// dx/dt = σ(y − x)
// dy/dt = x(ρ − z) − y
// dz/dt = xy − βz
//
// Classic parameters: σ=10, ρ=28, β=8/3
// These produce the iconic double-lobe butterfly attractor.

const SIGMA = 10
const RHO = 28
const BETA = 8 / 3

function lorenzDerivatives(x, y, z) {
  return {
    dx: SIGMA * (y - x),
    dy: x * (RHO - z) - y,
    dz: x * y - BETA * z,
  }
}

// Runge-Kutta 4th-order integrator for one step
function rk4Step(x, y, z, dt) {
  const k1 = lorenzDerivatives(x, y, z)
  const k2 = lorenzDerivatives(x + k1.dx * dt / 2, y + k1.dy * dt / 2, z + k1.dz * dt / 2)
  const k3 = lorenzDerivatives(x + k2.dx * dt / 2, y + k2.dy * dt / 2, z + k2.dz * dt / 2)
  const k4 = lorenzDerivatives(x + k3.dx * dt, y + k3.dy * dt, z + k3.dz * dt)

  return {
    x: x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
    y: y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy),
    z: z + (dt / 6) * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz),
  }
}

// Generate Lorenz trajectory via RK4
function generateLorenzPoints(steps = 40000, dt = 0.005, skipTransient = 2000) {
  let x = 0.1, y = 0, z = 0

  // Burn-in: let the transient die away
  for (let i = 0; i < skipTransient; i++) {
    const next = rk4Step(x, y, z, dt)
    x = next.x; y = next.y; z = next.z
  }

  const positions = new Float32Array(steps * 3)
  const colors = new Float32Array(steps * 3)

  // Attractor lives in roughly x∈[-20,20], y∈[-28,28], z∈[0,50]
  // We'll normalize on the fly after collection
  const raw = []
  for (let i = 0; i < steps; i++) {
    raw.push(x, y, z)
    const next = rk4Step(x, y, z, dt)
    x = next.x; y = next.y; z = next.z
  }

  // Find bounds for normalisation
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  for (let i = 0; i < steps; i++) {
    const rx = raw[i * 3], ry = raw[i * 3 + 1], rz = raw[i * 3 + 2]
    if (rx < minX) minX = rx; if (rx > maxX) maxX = rx
    if (ry < minY) minY = ry; if (ry > maxY) maxY = ry
    if (rz < minZ) minZ = rz; if (rz > maxZ) maxZ = rz
  }

  const rangeX = maxX - minX, rangeY = maxY - minY, rangeZ = maxZ - minZ
  const maxRange = Math.max(rangeX, rangeY, rangeZ)
  const scale = 4.0 / maxRange // fit into ±2 world units

  // Color palette: deep blue → indigo → violet → purple
  // Using HSL: hue 220° (blue) → 270° (purple)
  const colorStart = new THREE.Color().setHSL(220 / 360, 0.85, 0.60)
  const colorMid   = new THREE.Color().setHSL(245 / 360, 0.80, 0.55)
  const colorEnd   = new THREE.Color().setHSL(275 / 360, 0.75, 0.50)

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)

    // Normalise to center
    positions[i * 3]     = (raw[i * 3]     - (minX + maxX) / 2) * scale
    positions[i * 3 + 1] = (raw[i * 3 + 1] - (minY + maxY) / 2) * scale
    positions[i * 3 + 2] = (raw[i * 3 + 2] - (minZ + maxZ) / 2) * scale

    // Gradient: blue → indigo (first half), indigo → purple (second half)
    const c = new THREE.Color()
    if (t < 0.5) {
      c.lerpColors(colorStart, colorMid, t * 2)
    } else {
      c.lerpColors(colorMid, colorEnd, (t - 0.5) * 2)
    }
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  return { positions, colors, steps }
}

// ─── Three.js line geometry component ────────────────────────────────────────
function AttractorLine({ hovered }) {
  const groupRef = useRef()
  const { camera } = useThree()

  // Generate once – expensive, but only runs on mount
  const { geometry } = useMemo(() => {
    const { positions, colors, steps } = generateLorenzPoints(45000, 0.005, 3000)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3))
    // Only draw segments (not a loop)
    return { geometry: geo, steps }
  }, [])

  // Continuous slow rotation; hover speeds it up slightly and tilts
  const rotY = useRef(0)
  const rotX = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const baseSpeed = 0.04
    const hoverSpeed = 0.12
    const speed = hovered ? hoverSpeed : baseSpeed

    rotY.current += delta * speed
    // Gentle bob on X when hovered
    rotX.current += delta * (hovered ? 0.03 : 0.008)

    groupRef.current.rotation.y = rotY.current
    groupRef.current.rotation.x = Math.sin(rotX.current) * (hovered ? 0.25 : 0.10)
  })

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      <line geometry={geometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.82}
          linewidth={1} // WebGL lines are always 1px; thin look via opacity
        />
      </line>
    </group>
  )
}

// ─── Equation overlay (bottom-left) — same toggle pattern as MathBackgrounds ─
const LORENZ_LABEL = {
  name: 'Lorenz Attractor',
  teaser: 'Curious what the Lorenz attractor is?',
  equations: ['dx/dt = σ(y − x)', 'dy/dt = x(ρ − z) − y', 'dz/dt = xy − βz'],
  params: 'σ = 10  ·  ρ = 28  ·  β = 8/3',
  description:
    'A deterministic system that never repeats. Tiny differences in starting conditions diverge exponentially — the origin of the butterfly effect.',
  accentRgb: '160, 140, 255',
}

function EquationOverlay() {
  const [open, setOpen] = useState(false)
  const { accentRgb } = LORENZ_LABEL

  return (
    <div
      className="absolute bottom-6 left-6 pointer-events-none select-none"
      style={{ zIndex: 20, maxWidth: 340, textAlign: 'left' }}
    >
      <div className="pointer-events-auto inline-flex flex-col items-start gap-0">
        <div
          id="lorenz-attractor-explainer"
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
            {LORENZ_LABEL.name}
          </p>
          <div
            className="font-mono text-xs mb-2"
            style={{ color: `rgba(${accentRgb},0.80)`, lineHeight: 1.8 }}
          >
            {LORENZ_LABEL.equations.map((eq, i) => (
              <div key={i}>{eq}</div>
            ))}
          </div>
          <div
            className="font-mono text-xs mb-2"
            style={{ color: `rgba(${accentRgb},0.45)`, lineHeight: 1.6 }}
          >
            {LORENZ_LABEL.params}
          </div>
          <p
            className="text-xs font-light leading-relaxed"
            style={{ color: `rgba(${accentRgb},0.42)`, maxWidth: 300 }}
          >
            {LORENZ_LABEL.description}
          </p>
        </div>

        <button
          type="button"
          className="text-left bg-transparent border-0 p-0 cursor-pointer font-sans max-w-full"
          style={{
            borderTop: open ? `1px solid rgba(${accentRgb},0.28)` : `1px solid rgba(${accentRgb},0.15)`,
            paddingTop: 8,
            color: `rgba(${accentRgb},${open ? 0.85 : 0.62})`,
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="lorenz-attractor-explainer"
        >
          <span className="text-xs font-light leading-snug underline decoration-[rgba(255,255,255,0.2)] underline-offset-4 hover:decoration-[rgba(255,255,255,0.35)]">
            {open ? 'Tap to hide' : LORENZ_LABEL.teaser}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LorenzAttractor() {
  const [hovered, setHovered] = useState(false)

  const onPointerEnter = useCallback(() => setHovered(true),  [])
  const onPointerLeave = useCallback(() => setHovered(false), [])

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 1 }}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
    >
      {/* WebGL canvas */}
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <AttractorLine hovered={hovered} />
      </Canvas>

      {/* Dark radial vignette so text stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Equation info overlay */}
      <EquationOverlay />
    </div>
  )
}
