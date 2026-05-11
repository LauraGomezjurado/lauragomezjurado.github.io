import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import 'katex/dist/katex.min.css'
import katex from 'katex'

// ─── KaTeX inline renderer ────────────────────────────────────────────────────
function Katex({ tex, display = false }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, { throwOnError: false, displayMode: display })
    }
  }, [tex, display])
  return <span ref={ref} />
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ number, title }) {
  return (
    <div className="flex items-baseline gap-4 mb-6 mt-16">
      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#9b8ea8', letterSpacing: '0.08em' }}>
        0{number}
      </span>
      <h2 style={{ fontSize: '1.65rem', fontWeight: 300, color: '#1a0d2e', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {title}
      </h2>
    </div>
  )
}

// ─── Pull quote ───────────────────────────────────────────────────────────────
function Pullquote({ children }) {
  return (
    <blockquote style={{
      borderLeft: '3px solid #7c3aed',
      paddingLeft: '1.5rem',
      margin: '2rem 0',
      color: '#4c1d95',
      fontSize: '1.15rem',
      fontStyle: 'italic',
      lineHeight: 1.6,
      fontWeight: 300
    }}>
      {children}
    </blockquote>
  )
}

// ─── Math block ───────────────────────────────────────────────────────────────
function MathBlock({ tex }) {
  return (
    <div style={{
      background: '#f5f0ff',
      borderRadius: '10px',
      padding: '1.25rem 1.75rem',
      margin: '1.5rem 0',
      overflowX: 'auto',
      border: '1px solid #e8d5ff'
    }}>
      <Katex tex={tex} display />
    </div>
  )
}

// ─── Widget wrapper ───────────────────────────────────────────────────────────
function Widget({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#1a0d2e',
      borderRadius: '16px',
      padding: '2rem',
      margin: '2.5rem 0',
      border: '1px solid #3d1f5e',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
    }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ color: '#9b8ea8', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Interactive
        </p>
        <h3 style={{ color: '#f0ebff', fontSize: '1.1rem', fontWeight: 400, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ color: '#7c6b8a', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: 0 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, color = '#a78bfa', formatValue }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label style={{ color: '#c4b5d4', fontSize: '0.82rem', letterSpacing: '0.04em' }}>{label}</label>
        <span style={{ color: color, fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 600 }}>
          {formatValue ? formatValue(value) : value.toFixed(2)}
        </span>
      </div>
      <div style={{ position: 'relative', height: '20px', cursor: 'pointer' }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: '4px', background: '#3d1f5e', borderRadius: '2px',
          transform: 'translateY(-50%)'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: 0,
          width: `${pct}%`, height: '4px', background: color,
          borderRadius: '2px', transform: 'translateY(-50%)'
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute', inset: 0, opacity: 0, width: '100%',
            cursor: 'pointer', margin: 0
          }}
        />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          width: '16px', height: '16px', background: color,
          borderRadius: '50%', transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 12px ${color}80`,
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  )
}

// ─── Toggle button ────────────────────────────────────────────────────────────
function Toggle({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        border: `1px solid ${active ? color : '#3d1f5e'}`,
        background: active ? `${color}20` : 'transparent',
        color: active ? color : '#7c6b8a',
        fontSize: '0.82rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'monospace',
        letterSpacing: '0.02em'
      }}
    >
      {label}
    </button>
  )
}

// ─── WIDGET 1: Weight-Space Geometry ─────────────────────────────────────────
function WeightSpaceWidget() {
  const [lambda, setLambda] = useState(0.5)
  const [showSecondVector, setShowSecondVector] = useState(false)
  const [lambda2, setLambda2] = useState(0.4)
  const canvasRef = useRef(null)

  const W = 500, H = 340
  const cx = 110, cy = 200  // base model position

  // Task vector 1: points up-right (task direction 1)
  const v1 = { x: 200, y: -130 }
  // Task vector 2: points right-down (task direction 2)
  const v2 = { x: 160, y: 90 }

  const editedX = cx + lambda * v1.x
  const editedY = cy + lambda * v1.y
  const mergedX = cx + lambda * v1.x + (showSecondVector ? lambda2 * v2.x : 0)
  const mergedY = cy + lambda * v1.y + (showSecondVector ? lambda2 * v2.y : 0)

  const arrowHead = (x1, y1, x2, y2, color, size = 8) => {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const p1 = { x: x2 - size * Math.cos(angle - 0.4), y: y2 - size * Math.sin(angle - 0.4) }
    const p2 = { x: x2 - size * Math.cos(angle + 0.4), y: y2 - size * Math.sin(angle + 0.4) }
    return `M${p1.x},${p1.y} L${x2},${y2} L${p2.x},${p2.y}`
  }

  // Dashed grid lines
  const gridLines = []
  for (let x = 0; x <= W; x += 60) gridLines.push(<line key={`gx${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#2a1540" strokeWidth="1" strokeDasharray="4,6" />)
  for (let y = 0; y <= H; y += 60) gridLines.push(<line key={`gy${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#2a1540" strokeWidth="1" strokeDasharray="4,6" />)

  return (
    <Widget
      title="Weight-Space Geometry"
      subtitle="θ₀ is a point. A task vector is a direction. λ moves the model."
    >
      <Slider label="λ (scaling coefficient)" value={lambda} min={0} max={1} step={0.01} onChange={setLambda} color="#a78bfa" />
      {showSecondVector && (
        <Slider label="λ₂ (second vector coefficient)" value={lambda2} min={0} max={1} step={0.01} onChange={setLambda2} color="#f59e0b" />
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Toggle label="＋ second task vector" active={showSecondVector} onClick={() => setShowSecondVector(s => !s)} color="#f59e0b" />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', background: '#120826', borderRadius: '10px', maxWidth: '100%' }}>
          {/* Grid */}
          {gridLines}

          {/* Axis labels */}
          <text x={W - 12} y={cy + 4} fill="#3d2a55" fontSize="11" fontFamily="monospace">w₁</text>
          <text x={cx + 4} y={14} fill="#3d2a55" fontSize="11" fontFamily="monospace">w₂</text>

          {/* Vector 1: full extent (ghost) */}
          <line x1={cx} y1={cy} x2={cx + v1.x} y2={cy + v1.y} stroke="#4c1d95" strokeWidth="1.5" strokeDasharray="5,4" />
          <path d={arrowHead(cx, cy, cx + v1.x, cy + v1.y, '#4c1d95', 7)} stroke="#4c1d95" strokeWidth="1.5" fill="none" />
          <text x={cx + v1.x + 6} y={cy + v1.y - 4} fill="#6d28d9" fontSize="11" fontFamily="monospace">Δθ₁</text>

          {/* Vector 2 full extent (ghost) if enabled */}
          {showSecondVector && (
            <>
              <line x1={editedX} y1={editedY} x2={editedX + v2.x} y2={editedY + v2.y}
                stroke="#78350f" strokeWidth="1.5" strokeDasharray="5,4" />
              <path d={arrowHead(editedX, editedY, editedX + v2.x, editedY + v2.y, '#78350f', 7)}
                stroke="#78350f" strokeWidth="1.5" fill="none" />
              <text x={editedX + v2.x + 6} y={editedY + v2.y + 4} fill="#d97706" fontSize="11" fontFamily="monospace">Δθ₂</text>
            </>
          )}

          {/* Scaled vector 1: active */}
          {lambda > 0.01 && (
            <>
              <line x1={cx} y1={cy} x2={editedX} y2={editedY} stroke="#7c3aed" strokeWidth="2.5" />
              <path d={arrowHead(cx, cy, editedX, editedY, '#7c3aed')} stroke="#7c3aed" strokeWidth="2.5" fill="none" />
            </>
          )}

          {/* Scaled vector 2: active */}
          {showSecondVector && lambda2 > 0.01 && (
            <>
              <line x1={editedX} y1={editedY} x2={mergedX} y2={mergedY} stroke="#f59e0b" strokeWidth="2.5" />
              <path d={arrowHead(editedX, editedY, mergedX, mergedY, '#f59e0b')} stroke="#f59e0b" strokeWidth="2.5" fill="none" />
            </>
          )}

          {/* Resultant from base to merged (if 2 vectors) */}
          {showSecondVector && (lambda > 0.01 || lambda2 > 0.01) && (
            <line x1={cx} y1={cy} x2={mergedX} y2={mergedY} stroke="#34d399" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
          )}

          {/* Base model point */}
          <circle cx={cx} cy={cy} r={8} fill="#1e0a3c" stroke="#6d28d9" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={3} fill="#a78bfa" />
          <text x={cx - 8} y={cy + 20} fill="#a78bfa" fontSize="11" fontFamily="monospace" textAnchor="middle">θ₀</text>

          {/* Edited model point (along v1) */}
          <motion.circle
            cx={editedX} cy={editedY} r={7}
            fill="#3b0764" stroke="#c084fc" strokeWidth="2"
            animate={{ cx: editedX, cy: editedY }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <motion.circle
            cx={editedX} cy={editedY} r={2.5} fill="#c084fc"
            animate={{ cx: editedX, cy: editedY }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          {!showSecondVector && (
            <motion.text
              x={editedX + 10} y={editedY - 4} fill="#c084fc" fontSize="11" fontFamily="monospace"
              animate={{ x: editedX + 10, y: editedY - 4 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              θ₀+λΔθ₁
            </motion.text>
          )}

          {/* Merged model point */}
          {showSecondVector && (
            <>
              <motion.circle
                cx={mergedX} cy={mergedY} r={9}
                fill="#0a2a18" stroke="#34d399" strokeWidth="2.5"
                animate={{ cx: mergedX, cy: mergedY }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <motion.circle
                cx={mergedX} cy={mergedY} r={3.5} fill="#34d399"
                animate={{ cx: mergedX, cy: mergedY }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <motion.text
                x={mergedX + 10} y={mergedY - 4} fill="#34d399" fontSize="11" fontFamily="monospace"
                animate={{ x: mergedX + 10, y: mergedY - 4 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                θ_merged
              </motion.text>
            </>
          )}

          {/* Legend */}
          <circle cx={14} cy={H - 70} r={5} fill="#a78bfa" />
          <text x={24} y={H - 66} fill="#9b8ea8" fontSize="10" fontFamily="monospace">base model θ₀</text>
          <circle cx={14} cy={H - 52} r={5} fill="#c084fc" />
          <text x={24} y={H - 48} fill="#9b8ea8" fontSize="10" fontFamily="monospace">θ₀ + λΔθ₁</text>
          {showSecondVector && (
            <>
              <circle cx={14} cy={H - 34} r={5} fill="#34d399" />
              <text x={24} y={H - 30} fill="#9b8ea8" fontSize="10" fontFamily="monospace">merged model</text>
            </>
          )}

          {/* Lambda annotation */}
          <text x={W - 10} y={H - 10} fill="#3d2a55" fontSize="10" fontFamily="monospace" textAnchor="end">
            λ = {lambda.toFixed(2)}{showSecondVector ? `, λ₂ = ${lambda2.toFixed(2)}` : ''}
          </text>
        </svg>
      </div>
      <p style={{ color: '#6d5a7a', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
        Drag λ from 0 → 1. Watch the model move continuously from θ₀ toward the edited point.
        {showSecondVector ? ' Two vectors compose by parallelogram addition.' : ''}
      </p>
    </Widget>
  )
}

// ─── WIDGET 2: Task-Merging Playground ───────────────────────────────────────
function MergingPlayground() {
  // Four "tasks" with fixed directions in 2D parameter space
  const vectors = [
    { id: 'task_fair', label: 'Task: Fairness', color: '#34d399', angle: 110, magnitude: 120 },
    { id: 'task_acc',  label: 'Task: Accuracy', color: '#60a5fa', angle: 30,  magnitude: 100 },
    { id: 'task_hate', label: 'Task: Hate Speech', color: '#f472b6', angle: 165, magnitude: 90 },
    { id: 'task_bias', label: 'Task: Debias',  color: '#fbbf24', angle: 200, magnitude: 80 },
  ]

  const [active, setActive] = useState({ task_fair: true, task_acc: true, task_hate: false, task_bias: false })
  const [coeffs, setCoeffs] = useState({ task_fair: 0.7, task_acc: 0.6, task_hate: 0.5, task_bias: 0.5 })

  const W = 480, H = 320
  const cx = W / 2, cy = H / 2

  const toXY = (angle, mag) => ({
    x: cx + mag * Math.cos((angle * Math.PI) / 180),
    y: cy - mag * Math.sin((angle * Math.PI) / 180)
  })

  const arrowHead = (x1, y1, x2, y2, size = 8) => {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const p1 = { x: x2 - size * Math.cos(angle - 0.4), y: y2 - size * Math.sin(angle - 0.4) }
    const p2 = { x: x2 - size * Math.cos(angle + 0.4), y: y2 - size * Math.sin(angle + 0.4) }
    return `M${p1.x},${p1.y} L${x2},${y2} L${p2.x},${p2.y}`
  }

  // Compute merged endpoint
  let mx = cx, my = cy
  vectors.forEach(v => {
    if (active[v.id]) {
      const c = coeffs[v.id]
      const scaled_mag = c * v.magnitude
      mx += scaled_mag * Math.cos((v.angle * Math.PI) / 180)
      my -= scaled_mag * Math.sin((v.angle * Math.PI) / 180)
    }
  })

  return (
    <Widget
      title="Task-Merging Playground"
      subtitle="Toggle vectors on/off. Adjust coefficients. Watch how they compose."
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {vectors.map(v => (
          <Toggle key={v.id} label={v.label} active={active[v.id]} onClick={() => setActive(a => ({ ...a, [v.id]: !a[v.id] }))} color={v.color} />
        ))}
      </div>

      {vectors.filter(v => active[v.id]).map(v => (
        <Slider
          key={v.id}
          label={`λ for ${v.label}`}
          value={coeffs[v.id]}
          min={0} max={1} step={0.01}
          onChange={val => setCoeffs(c => ({ ...c, [v.id]: val }))}
          color={v.color}
        />
      ))}

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', background: '#120826', borderRadius: '10px', maxWidth: '100%' }}>
          {/* Grid */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`gx${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} stroke="#1e0a3c" strokeWidth="1" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`gy${i}`} x1={0} y1={i * 60} x2={W} y2={i * 60} stroke="#1e0a3c" strokeWidth="1" />
          ))}

          {/* Full ghost vectors */}
          {vectors.map(v => {
            const end = toXY(v.angle, v.magnitude)
            return (
              <g key={v.id} opacity={active[v.id] ? 0.3 : 0.1}>
                <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={v.color} strokeWidth="1.5" strokeDasharray="4,4" />
              </g>
            )
          })}

          {/* Active scaled vectors */}
          {vectors.filter(v => active[v.id]).map(v => {
            const scaled_mag = coeffs[v.id] * v.magnitude
            const end = toXY(v.angle, scaled_mag)
            return (
              <g key={v.id}>
                <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={v.color} strokeWidth="2.5" />
                <path d={arrowHead(cx, cy, end.x, end.y)} stroke={v.color} strokeWidth="2" fill="none" />
                <text x={end.x + 5} y={end.y - 4} fill={v.color} fontSize="10" fontFamily="monospace">
                  {v.label.split(':')[1].trim()}
                </text>
              </g>
            )
          })}

          {/* Resultant (merged) */}
          {Object.values(active).some(Boolean) && (
            <>
              <motion.line x1={cx} y1={cy} x2={mx} y2={my} stroke="#e2d4f7" strokeWidth="1.5" strokeDasharray="3,3"
                animate={{ x2: mx, y2: my }} transition={{ type: 'spring', stiffness: 180, damping: 18 }} />
            </>
          )}

          {/* Base model */}
          <circle cx={cx} cy={cy} r={8} fill="#1e0a3c" stroke="#6d28d9" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={3} fill="#a78bfa" />
          <text x={cx} y={cy + 20} fill="#a78bfa" fontSize="11" fontFamily="monospace" textAnchor="middle">θ₀</text>

          {/* Merged point */}
          <motion.g animate={{ opacity: 1 }}>
            <motion.circle
              cx={mx} cy={my} r={10}
              fill="#0a1a2e" stroke="#60a5fa" strokeWidth="2.5"
              animate={{ cx: mx, cy: my }}
              transition={{ type: 'spring', stiffness: 150, damping: 16 }}
            />
            <motion.circle
              cx={mx} cy={my} r={4} fill="#60a5fa"
              animate={{ cx: mx, cy: my }}
              transition={{ type: 'spring', stiffness: 150, damping: 16 }}
            />
            <motion.text
              x={mx} y={my - 16} fill="#93c5fd" fontSize="11" fontFamily="monospace" textAnchor="middle"
              animate={{ x: mx, y: my - 16 }}
              transition={{ type: 'spring', stiffness: 150, damping: 16 }}
            >
              θ_merged
            </motion.text>
          </motion.g>

          {/* Distance from base */}
          <text x={W - 8} y={H - 10} fill="#3d2a55" fontSize="10" fontFamily="monospace" textAnchor="end">
            |Δ| = {Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2).toFixed(1)} units
          </text>
        </svg>
      </div>
      <p style={{ color: '#6d5a7a', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
        When vectors align, effects amplify. When they oppose, they cancel. Merging is just vector addition.
      </p>
    </Widget>
  )
}

// ─── WIDGET 3: Tradeoff Frontier ──────────────────────────────────────────────
// Synthesized from paper's empirical finding: λ sweep 0→1 traces a curve in
// accuracy-vs-disparity space. Higher λ ≈ more fairness, slightly less accuracy.
function TradeoffFrontier() {
  const [lambda, setLambda] = useState(0.5)
  const [dataset, setDataset] = useState('gender')

  // Approximate curves from paper's Figure 3 findings:
  // λ ∈ [0,1], accuracy peaks ~0.1-0.2 then stabilizes, DPD/EOD decline after 0.3
  const curve = {
    gender: (l) => ({
      acc: 0.62 + 0.10 * Math.exp(-6 * l) + 0.02 * Math.sin(l * Math.PI),
      dpd: 0.42 - 0.25 * Math.min(l, 1) + 0.04 * Math.exp(-3 * l)
    }),
    race: (l) => ({
      acc: 0.58 + 0.09 * Math.exp(-5 * l) + 0.015 * Math.sin(l * Math.PI),
      dpd: 0.38 - 0.18 * Math.min(l, 1) + 0.05 * Math.exp(-2.5 * l)
    })
  }

  const fft = { gender: { acc: 0.65, dpd: 0.28 }, race: { acc: 0.61, dpd: 0.25 } }
  const lora = { gender: { acc: 0.64, dpd: 0.30 }, race: { acc: 0.60, dpd: 0.27 } }

  const W = 480, H = 300
  const pad = { left: 52, right: 20, top: 20, bottom: 42 }
  const plotW = W - pad.left - pad.right
  const plotH = H - pad.top - pad.bottom

  // Axis ranges
  const accMin = 0.5, accMax = 0.78
  const dpdMin = 0.10, dpdMax = 0.50

  const toSvg = (acc, dpd) => ({
    x: pad.left + ((acc - accMin) / (accMax - accMin)) * plotW,
    y: pad.top + (1 - (dpd - dpdMin) / (dpdMax - dpdMin)) * plotH
  })

  // Build path for λ curve
  const pts = Array.from({ length: 101 }, (_, i) => {
    const l = i / 100
    const { acc, dpd } = curve[dataset](l)
    return toSvg(acc, dpd)
  })
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const current = curve[dataset](lambda)
  const currentPt = toSvg(current.acc, current.dpd)
  const fftPt = toSvg(fft[dataset].acc, fft[dataset].dpd)
  const loraPt = toSvg(lora[dataset].acc, lora[dataset].dpd)

  // Axis ticks
  const accTicks = [0.52, 0.56, 0.60, 0.64, 0.68, 0.72, 0.76]
  const dpdTicks = [0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48]

  return (
    <Widget
      title="Fairness–Accuracy Tradeoff Frontier"
      subtitle="λ is not selecting discrete models; it is tracing a continuous path."
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Toggle label="Gender subgroups" active={dataset === 'gender'} onClick={() => setDataset('gender')} color="#a78bfa" />
        <Toggle label="Race subgroups" active={dataset === 'race'} onClick={() => setDataset('race')} color="#f59e0b" />
      </div>
      <Slider label="λ" value={lambda} min={0} max={1} step={0.01} onChange={setLambda}
        color={dataset === 'gender' ? '#a78bfa' : '#f59e0b'} />

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', background: '#120826', borderRadius: '10px', maxWidth: '100%' }}>
          {/* Grid */}
          {accTicks.map(a => {
            const x = pad.left + ((a - accMin) / (accMax - accMin)) * plotW
            return <line key={a} x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke="#1e0a3c" strokeWidth="1" />
          })}
          {dpdTicks.map(d => {
            const y = pad.top + (1 - (d - dpdMin) / (dpdMax - dpdMin)) * plotH
            return <line key={d} x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#1e0a3c" strokeWidth="1" />
          })}

          {/* Axis borders */}
          <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="none" stroke="#2a1540" strokeWidth="1" />

          {/* Axis tick labels */}
          {accTicks.map(a => {
            const x = pad.left + ((a - accMin) / (accMax - accMin)) * plotW
            return <text key={a} x={x} y={H - 8} fill="#4a3660" fontSize="9" fontFamily="monospace" textAnchor="middle">{a.toFixed(2)}</text>
          })}
          {dpdTicks.map(d => {
            const y = pad.top + (1 - (d - dpdMin) / (dpdMax - dpdMin)) * plotH
            return <text key={d} x={pad.left - 4} y={y + 3} fill="#4a3660" fontSize="9" fontFamily="monospace" textAnchor="end">{d.toFixed(2)}</text>
          })}

          {/* Axis labels */}
          <text x={pad.left + plotW / 2} y={H - 0} fill="#6d5a7a" fontSize="10" fontFamily="monospace" textAnchor="middle">Macro Accuracy →</text>
          <text x={10} y={pad.top + plotH / 2} fill="#6d5a7a" fontSize="10" fontFamily="monospace" textAnchor="middle"
            transform={`rotate(-90, 10, ${pad.top + plotH / 2})`}>Disparity (DPD) ↓</text>

          {/* FFT baseline */}
          <circle cx={fftPt.x} cy={fftPt.y} r={6} fill="#1a1a3e" stroke="#60a5fa" strokeWidth="1.5" />
          <text x={fftPt.x + 8} y={fftPt.y - 4} fill="#60a5fa" fontSize="9" fontFamily="monospace">FFT</text>

          {/* LoRA baseline */}
          <circle cx={loraPt.x} cy={loraPt.y} r={6} fill="#1a1a3e" stroke="#f472b6" strokeWidth="1.5" />
          <text x={loraPt.x + 8} y={loraPt.y + 4} fill="#f472b6" fontSize="9" fontFamily="monospace">LoRA</text>

          {/* Task arithmetic frontier path */}
          <path d={pathD} stroke={dataset === 'gender' ? '#7c3aed' : '#d97706'} strokeWidth="2"
            fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

          {/* λ=0 and λ=1 endpoints */}
          {[0, 1].map(l => {
            const { acc, dpd } = curve[dataset](l)
            const pt = toSvg(acc, dpd)
            return (
              <g key={l}>
                <circle cx={pt.x} cy={pt.y} r={4} fill={dataset === 'gender' ? '#4c1d95' : '#78350f'} stroke={dataset === 'gender' ? '#a78bfa' : '#fbbf24'} strokeWidth="1" />
                <text x={pt.x + (l === 0 ? 6 : 6)} y={pt.y - 6} fill={dataset === 'gender' ? '#8b5cf6' : '#f59e0b'} fontSize="9" fontFamily="monospace">
                  λ={l}
                </text>
              </g>
            )
          })}

          {/* Moving dot for current λ */}
          <motion.circle
            cx={currentPt.x} cy={currentPt.y} r={8}
            fill="#0a1a2e" stroke={dataset === 'gender' ? '#c084fc' : '#fbbf24'} strokeWidth="2.5"
            animate={{ cx: currentPt.x, cy: currentPt.y }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          />
          <motion.circle
            cx={currentPt.x} cy={currentPt.y} r={3.5}
            fill={dataset === 'gender' ? '#c084fc' : '#fbbf24'}
            animate={{ cx: currentPt.x, cy: currentPt.y }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          />

          {/* Current readout */}
          <motion.text
            x={currentPt.x + 12} y={currentPt.y - 6}
            fill={dataset === 'gender' ? '#c084fc' : '#fbbf24'}
            fontSize="10" fontFamily="monospace"
            animate={{ x: currentPt.x + 12, y: currentPt.y - 6 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          >
            acc={current.acc.toFixed(3)} dpd={current.dpd.toFixed(3)}
          </motion.text>

          {/* "Better" region annotation */}
          <text x={pad.left + plotW - 4} y={pad.top + 14} fill="#2a4a2a" fontSize="9" fontFamily="monospace" textAnchor="end">
            ↙ better (high acc, low disparity)
          </text>
        </svg>
      </div>
      <p style={{ color: '#6d5a7a', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
        Approximate curves based on paper's Figure 3 findings. Drag λ to trace the frontier.
        At λ ≈ 0.3–0.7, task arithmetic consistently beats FFT and LoRA on disparity.
      </p>
    </Widget>
  )
}

// ─── WIDGET 4: Subgroup Vector Explainer ─────────────────────────────────────
function SubgroupVectorExplainer() {
  // Subgroup vectors: from paper's subgroup-specific injection results
  // Each has a direction (angle in 2D conceptual space) and a fairness effect
  const subgroups = {
    gender: [
      { id: 'men',    label: 'Men',       color: '#60a5fa', angle: 55,  mag: 110, fairnessEffect: -0.22, note: 'Monotonic DPD/EOD decrease ✓' },
      { id: 'women',  label: 'Women',     color: '#f472b6', angle: 120, mag: 95,  fairnessEffect: +0.08, note: 'Mixed: helps some, hurts others' },
      { id: 'nonbin', label: 'Non-binary',color: '#34d399', angle: 80,  mag: 70,  fairnessEffect: -0.10, note: 'Moderate fairness improvement' },
    ],
    race: [
      { id: 'asian',  label: 'Asian',       color: '#fbbf24', angle: 40,  mag: 100, fairnessEffect: -0.20, note: 'High accuracy, lowest DPD/EOD ✓' },
      { id: 'native', label: 'Native Am.',  color: '#f87171', angle: 200, mag: 85,  fairnessEffect: +0.15, note: 'Decreased fairness (increased DPD) ✗' },
      { id: 'black',  label: 'Black',       color: '#a78bfa', angle: 95,  mag: 90,  fairnessEffect: -0.08, note: 'Small fairness gain' },
      { id: 'latinx', label: 'Latinx',      color: '#6ee7b7', angle: 150, mag: 75,  fairnessEffect: -0.05, note: 'Near-neutral effect' },
    ]
  }

  const [attr, setAttr] = useState('gender')
  const [active, setActive] = useState({ men: true, women: false, nonbin: false, asian: false, native: false, black: false, latinx: false })
  const [lambda, setLambda] = useState(0.6)

  const W = 480, H = 300
  const cx = 130, cy = H / 2

  const toXY = (angle, mag) => ({
    x: cx + mag * Math.cos((angle * Math.PI) / 180),
    y: cy - mag * Math.sin((angle * Math.PI) / 180)
  })

  const arrowHead = (x1, y1, x2, y2, size = 8) => {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const p1 = { x: x2 - size * Math.cos(angle - 0.4), y: y2 - size * Math.sin(angle - 0.4) }
    const p2 = { x: x2 - size * Math.cos(angle + 0.4), y: y2 - size * Math.sin(angle + 0.4) }
    return `M${p1.x},${p1.y} L${x2},${y2} L${p2.x},${p2.y}`
  }

  const currentGroups = subgroups[attr]

  // Net fairness effect
  const netEffect = currentGroups.filter(g => active[g.id]).reduce((sum, g) => sum + lambda * g.fairnessEffect, 0)
  const netBarColor = netEffect < 0 ? '#34d399' : '#f87171'
  const netBarLabel = netEffect < 0 ? `↓ ${Math.abs(netEffect).toFixed(2)} (less disparity)` : `↑ ${netEffect.toFixed(2)} (more disparity)`

  return (
    <Widget
      title="Subgroup Vector Directions"
      subtitle="Different groups induce different shifts. Some help fairness. Some hurt."
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Toggle label="Gender" active={attr === 'gender'} onClick={() => setAttr('gender')} color="#a78bfa" />
        <Toggle label="Race" active={attr === 'race'} onClick={() => setAttr('race')} color="#fbbf24" />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {currentGroups.map(g => (
          <Toggle key={g.id} label={g.label} active={active[g.id]} onClick={() => setActive(a => ({ ...a, [g.id]: !a[g.id] }))} color={g.color} />
        ))}
      </div>
      <Slider label="λ (injection strength)" value={lambda} min={0} max={1} step={0.01} onChange={setLambda} color="#a78bfa" />

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', background: '#120826', borderRadius: '10px', maxWidth: '100%' }}>
          {/* Grid */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={i * 60} y1={0} x2={i * 60} y2={H} stroke="#1a0a2e" strokeWidth="1" />
          ))}

          {/* Horizontal center line */}
          <line x1={0} y1={cy} x2={W} y2={cy} stroke="#2a1540" strokeWidth="1" strokeDasharray="4,6" />

          {/* Subgroup vectors */}
          {currentGroups.map(g => {
            const scaledMag = lambda * g.mag
            const end = toXY(g.angle, scaledMag)
            const ghostEnd = toXY(g.angle, g.mag)
            const isActive = active[g.id]
            return (
              <g key={g.id} opacity={isActive ? 1 : 0.15}>
                {/* Ghost full vector */}
                <line x1={cx} y1={cy} x2={ghostEnd.x} y2={ghostEnd.y}
                  stroke={g.color} strokeWidth="1" strokeDasharray="3,4" opacity="0.3" />
                {/* Scaled vector */}
                <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={g.color} strokeWidth="2.5" />
                <path d={arrowHead(cx, cy, end.x, end.y)} stroke={g.color} strokeWidth="2" fill="none" />
                {/* Label */}
                <text x={end.x + (end.x > cx ? 5 : -5)} y={end.y + (end.y > cy ? 14 : -5)}
                  fill={g.color} fontSize="10" fontFamily="monospace"
                  textAnchor={end.x > cx ? 'start' : 'end'}>
                  {g.label}
                </text>
                {/* Fairness indicator */}
                {isActive && (
                  <text x={end.x + (end.x > cx ? 5 : -5)} y={end.y + (end.y > cy ? 26 : -17)}
                    fill={g.fairnessEffect < 0 ? '#34d399' : '#f87171'}
                    fontSize="8.5" fontFamily="monospace"
                    textAnchor={end.x > cx ? 'start' : 'end'}>
                    {g.fairnessEffect < 0 ? '↓DPD' : '↑DPD'}
                  </text>
                )}
              </g>
            )
          })}

          {/* SFT base point */}
          <circle cx={cx} cy={cy} r={8} fill="#1e0a3c" stroke="#6d28d9" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={3} fill="#a78bfa" />
          <text x={cx} y={cy + 20} fill="#a78bfa" fontSize="11" fontFamily="monospace" textAnchor="middle">θ_SFT</text>

          {/* Net effect panel */}
          <rect x={W - 180} y={10} width={165} height={65} rx={6} fill="#0d0620" stroke="#2a1540" strokeWidth="1" />
          <text x={W - 98} y={28} fill="#6d5a7a" fontSize="9" fontFamily="monospace" textAnchor="middle">Net fairness effect</text>
          <text x={W - 98} y={46} fill={netBarColor} fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="600">
            {currentGroups.some(g => active[g.id]) ? netBarLabel : 'N/A'}
          </text>
          <text x={W - 98} y={64} fill="#4a3660" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
            {currentGroups.filter(g => active[g.id]).length} group(s) active
          </text>
        </svg>
      </div>

      {/* Notes for active groups */}
      {currentGroups.filter(g => active[g.id]).length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {currentGroups.filter(g => active[g.id]).map(g => (
            <div key={g.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: g.color, flexShrink: 0 }} />
              <span style={{ color: '#7c6b8a', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                {g.label}: {g.note}
              </span>
            </div>
          ))}
        </div>
      )}
    </Widget>
  )
}

// ─── WIDGET 5: Bound Intuition ────────────────────────────────────────────────
function BoundIntuitionWidget() {
  const [deviation, setDeviation] = useState(0.4)   // |λ_g - 1|
  const [norm, setNorm] = useState(0.6)             // ||Δθ_g||
  const [numGroups, setNumGroups] = useState(3)

  // Bound: DPD ≤ 2L * Σ_g |λ_g - 1| * ||Δθ_g||
  // Simplified: disparity ≤ numGroups * deviation * norm * constant
  const L = 1.5  // conceptual Lipschitz constant
  const bound = 2 * L * numGroups * deviation * norm

  const maxBound = 2 * L * 5 * 1 * 1  // max possible
  const boundPct = Math.min(bound / maxBound, 1)

  // The "balanced" reference: deviation = 0 → bound = 0
  const balancedBound = 0

  const colorForBound = (b) => {
    const t = Math.min(b / maxBound, 1)
    const r = Math.round(52 + 203 * t)
    const g = Math.round(211 - 163 * t)
    const b2 = Math.round(153 - 153 * t)
    return `rgb(${r},${g},${b2})`
  }

  const boundColor = colorForBound(bound)

  return (
    <Widget
      title="Bound Intuition: What Controls Fairness Disparity?"
      subtitle="The theorem says disparity is bounded by deviation from balance × vector norms."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <Slider
          label="|λ_g − 1| (deviation from balanced)"
          value={deviation} min={0} max={1} step={0.01}
          onChange={setDeviation} color="#f59e0b"
          formatValue={v => v.toFixed(2)}
        />
        <Slider
          label="‖Δθ_g‖ (task vector norm)"
          value={norm} min={0.05} max={1} step={0.01}
          onChange={setNorm} color="#a78bfa"
          formatValue={v => v.toFixed(2)}
        />
      </div>
      <Slider
        label="Number of subgroups G"
        value={numGroups} min={1} max={5} step={1}
        onChange={setNumGroups} color="#34d399"
        formatValue={v => `${v}`}
      />

      {/* Bound visualization */}
      <div style={{ margin: '1.25rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: '#9b8ea8', fontSize: '0.82rem', fontFamily: 'monospace' }}>Disparity bound</span>
          <span style={{ color: boundColor, fontSize: '1rem', fontFamily: 'monospace', fontWeight: 600 }}>
            ≤ {bound.toFixed(3)}
          </span>
        </div>
        <div style={{ background: '#0d0620', borderRadius: '6px', height: '24px', overflow: 'hidden', position: 'relative' }}>
          <motion.div
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: boundColor, borderRadius: '6px' }}
            animate={{ width: `${boundPct * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          {/* Balanced reference mark */}
          <div style={{ position: 'absolute', left: '0%', top: 0, bottom: 0, width: '2px', background: '#34d399', opacity: 0.8 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <span style={{ color: '#34d399', fontSize: '0.7rem', fontFamily: 'monospace' }}>0 (perfectly balanced)</span>
          <span style={{ color: '#6d5a7a', fontSize: '0.7rem', fontFamily: 'monospace' }}>max</span>
        </div>
      </div>

      {/* Conceptual diagram */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={480} height={200} style={{ display: 'block', background: '#120826', borderRadius: '10px', maxWidth: '100%' }}>
          {/* Three factor contributions */}
          {['Deviation |λ_g−1|', 'Vector norm ‖Δθ_g‖', `Groups G=${numGroups}`].map((label, i) => {
            const values = [deviation, norm, numGroups / 5]
            const colors = ['#f59e0b', '#a78bfa', '#34d399']
            const x = 40 + i * 145
            const barMaxH = 120
            const barH = values[i] * barMaxH
            const barY = 150 - barH
            return (
              <g key={i}>
                <motion.rect
                  x={x} y={barY} width={80} height={barH}
                  fill={colors[i]} rx={4} opacity={0.8}
                  animate={{ y: barY, height: barH }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
                <text x={x + 40} y={170} fill="#6d5a7a" fontSize="9" fontFamily="monospace" textAnchor="middle">{label}</text>
                <text x={x + 40} y={barY - 6} fill={colors[i]} fontSize="10" fontFamily="monospace" textAnchor="middle">
                  {values[i].toFixed(2)}
                </text>
              </g>
            )
          })}

          {/* × symbols between bars */}
          <text x={120 + 40} y={95} fill="#4a3660" fontSize="18" fontFamily="monospace" textAnchor="middle">×</text>
          <text x={120 + 40 + 145} y={95} fill="#4a3660" fontSize="18" fontFamily="monospace" textAnchor="middle">×</text>

          {/* Result arrow */}
          <line x1={405} y1={95} x2={450} y2={95} stroke="#e2d4f7" strokeWidth="1.5" />
          <path d="M446,91 L452,95 L446,99" stroke="#e2d4f7" strokeWidth="1.5" fill="none" />
          <text x={458} y={86} fill={boundColor} fontSize="10" fontFamily="monospace" textAnchor="middle">bound</text>
          <text x={458} y={100} fill={boundColor} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="700">
            {bound.toFixed(3)}
          </text>

          {/* Baseline */}
          <line x1={30} y1={150} x2={410} y2={150} stroke="#2a1540" strokeWidth="1" />
          <text x={30} y={185} fill="#2a1540" fontSize="9" fontFamily="monospace">0</text>
          <text x={110 + 40} y={185} fill="#2a1540" fontSize="9" fontFamily="monospace">1</text>
        </svg>
      </div>

      {/* The formal bound */}
      <div style={{
        background: '#0d0620', borderRadius: '10px', padding: '1rem 1.25rem',
        marginTop: '1rem', border: '1px solid #2a1540'
      }}>
        <p style={{ color: '#6d5a7a', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
          Theorem (informal): For merged model θ(λ) = θ₀ + Σ_g λ_g Δθ_g,
        </p>
        <div style={{ color: '#c084fc', fontSize: '0.88rem', fontFamily: 'monospace' }}>
          DPD(θ(λ)) ≤ 2L · Σ_g |λ_g − 1| · ‖Δθ_g‖₂
        </div>
        <p style={{ color: '#4a3660', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '0.5rem', marginBottom: 0 }}>
          L = Lipschitz constant · Set λ_g = 1 for all g → bound collapses to 0.
        </p>
      </div>

      <p style={{ color: '#6d5a7a', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
        The bound grows with imbalance and with vector magnitude. Larger norms = higher sensitivity to coefficient choices.
      </p>
    </Widget>
  )
}

// ─── PROSE HELPERS ─────────────────────────────────────────────────────────────
const P = ({ children }) => (
  <p style={{ color: '#2d1b4e', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.25rem', fontWeight: 300 }}>
    {children}
  </p>
)

const Em = ({ children }) => <em style={{ color: '#6d28d9', fontStyle: 'italic' }}>{children}</em>
const Strong = ({ children }) => <strong style={{ color: '#1a0d2e', fontWeight: 600 }}>{children}</strong>

const InlineCode = ({ children }) => (
  <code style={{ background: '#f0ebff', color: '#6d28d9', padding: '0.1em 0.4em', borderRadius: '4px', fontSize: '0.9em', fontFamily: 'monospace' }}>
    {children}
  </code>
)

// ─── MAIN POST COMPONENT ──────────────────────────────────────────────────────
export default function TaskArithmeticPost() {
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      maxWidth: '760px',
      margin: '0 auto',
      padding: '0 1rem',
      color: '#1a0d2e'
    }}>
      {/* ── Prologue ──────────────────────────────────────────────────────── */}
      <SectionHeading number={1} title="The Arithmetic That Shouldn't Work" />

      <P>
        Suppose you take a large language model, fine-tune it on a classification task, and then
        compute the difference between the fine-tuned weights and the original weights. You get a
        vector, a direction in a space with hundreds of millions of dimensions. Then you take that
        vector and <Em>add it to a completely different base model</Em>. No training, no gradient descent.
        Just weight addition.
      </P>

      <P>
        This is task arithmetic. It is not obvious that it should work at all. And yet it does,
        often surprisingly well. Models edited this way can solve new tasks, forget old behaviors,
        or be combined with other edited models, all without touching a training loop.
      </P>

      <Pullquote>
        The question is not whether task arithmetic works. It does. The question is what it is
        <em> doing</em>; and once you see the geometry, the results of this paper become almost
        inevitable.
      </Pullquote>

      <P>
        Our paper, <em>On Fairness of Task Arithmetic: The Role of Task Vectors</em> (Naganuma, Yoshida, Horie, Naraki, and Shimizu, ICLR 2026),
        asks a specific follow-up question: when you apply task arithmetic in a fairness-sensitive setting:
        hate speech detection, toxicity classification, demographic parity: what happens? Does it help
        or hurt group fairness? Can you steer it? Is there theory?
      </P>

      <P>
        The answers are interesting. But to understand them, you first need to internalize the geometry.
      </P>

      {/* ── Section 2: Weight Space ────────────────────────────────────────── */}
      <SectionHeading number={2} title="Weight Space Is a Space" />

      <P>
        A neural network is, at the end of the day, a vector of floating-point numbers. Every weight,
        every bias, concatenated into one enormous array. For a 7B-parameter model like LLaMA, that
        array lives in <Katex tex="\mathbb{R}^{7 \times 10^9}" />. Call a particular instantiation
        of those weights <Katex tex="\theta" />.
      </P>

      <P>
        The key shift in thinking is this: <Strong>treat θ as a point in a high-dimensional space</Strong>,
        not as a bag of numbers. The space is abstract; we can't visualize 7 billion dimensions;
        but it obeys all the geometric rules you learned in linear algebra. Distances are defined.
        Directions are defined. Linear combinations are defined.
      </P>

      <P>
        When you fine-tune a base model <Katex tex="\theta_0" /> on a task, you traverse a path through
        this space and land at a new point <Katex tex="\theta_{\text{task}}" />. The difference between
        them,
      </P>

      <MathBlock tex="\Delta\theta = \theta_{\text{task}} - \theta_0" />

      <P>
        is a vector in that same space. The original task arithmetic paper calls this a <Strong>task vector</Strong>{' '}
        (<a
          href="https://arxiv.org/abs/2212.04089"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#6d28d9', textDecoration: 'underline' }}
        >
          Ilharco et al., 2023
        </a>
        ). It encodes,
        in some compressed sense, what the fine-tuning <em>did</em>, the directional change the training
        process applied.
      </P>

      <P>
        Task arithmetic is then disarmingly simple:
      </P>

      <MathBlock tex="\theta(\lambda) = \theta_0 + \lambda \Delta\theta" />

      <P>
        You take the base model and move it <Katex tex="\lambda" /> steps in the direction the fine-tuning
        pointed. When <Katex tex="\lambda = 1" />, you recover the full fine-tuned model. When
        <Katex tex="\lambda = 0" />, you stay at the base. When <Katex tex="\lambda = 0.5" />, you
        land at the midpoint. The coefficient <Katex tex="\lambda" /> is not selecting between discrete
        models; it is <em>moving a point continuously through parameter space</em>.
      </P>

      <WeightSpaceWidget />

      <P>
        Notice what the slider does. At <InlineCode>λ = 0</InlineCode> you sit at the base model.
        As you increase λ, the edited model traces a straight line in weight space toward the
        fully fine-tuned point. Enable the second vector and the model reaches a point that is the
        vector sum of both edits; the classic parallelogram law of vector addition.
      </P>

      {/* ── Section 3: Merging ─────────────────────────────────────────────── */}
      <SectionHeading number={3} title="Merging as Vector Composition" />

      <P>
        Suppose you have <Katex tex="K" /> task vectors; perhaps from fine-tuning on different tasks,
        different datasets, or different demographic subgroups. The merged model is:
      </P>

      <MathBlock tex="\theta_{\text{merged}} = \theta_0 + \sum_{i=1}^{K} \lambda_i \, \Delta\theta_i" />

      <P>
        This is just linear combination of vectors. Geometrically, you're adding up directions and
        landing at the sum. The properties follow directly from vector algebra:
      </P>

      <P>
        <Strong>When vectors align</Strong>, their effects reinforce. If two task vectors point in
        similar directions in weight space, adding them amplifies the behavioral change. <Strong>When
        they oppose</Strong>, they partially cancel. A fairness-improving vector can be counteracted
        by a fairness-harming one. <Strong>When they're orthogonal</Strong>, the effects are independent
        and the merged model does both simultaneously without interference.
      </P>

      <MergingPlayground />

      <P>
        The playground makes this concrete. Notice that when you activate vectors that point in
        opposite directions, the merged point barely moves from the base. When you activate
        well-aligned vectors, the merged point shoots far from θ₀. The geometry explains
        why merging is a subtle operation; it depends entirely on the geometry of the task
        vectors, not just their individual magnitudes.
      </P>

      <P>
        This also highlights an important structural difference between task arithmetic and standard
        fine-tuning. Fine-tuning produces a single point in weight space, period. Task arithmetic
        exposes the entire <em>decomposition</em>: each task vector is a named direction, each coefficient
        is an explicit control. This is what makes it amenable to interpretation and intervention.
      </P>

      {/* ── Section 4: λ as motion ─────────────────────────────────────────── */}
      <SectionHeading number={4} title="λ Is a Motion Parameter" />

      <P>
        The central empirical result of the paper is about what happens when you sweep <Katex tex="\lambda" />.
        The setup: take a base model, compute a task vector from fine-tuning on a fairness-relevant
        classification task (e.g., hate speech detection on Berkeley D-Lab), then for each value of
        <Katex tex="\lambda \in [0, 1]" /> evaluate both accuracy and group disparity (DPD: demographic
        parity difference; EOD: equalized odds difference).
      </P>

      <P>
        The finding: <Strong>sweeping λ traces out a continuous frontier in accuracy–disparity space</Strong>.
        It is not jumping between unrelated models. It is a smooth curve. At low λ (near 0), the model
        behaves like the base: high accuracy, potentially high disparity. As λ increases past ≈ 0.3,
        both accuracy remains competitive <em>and</em> disparity falls, typically below the levels achieved
        by full fine-tuning (FFT) or LoRA.
      </P>

      <TradeoffFrontier />

      <P>
        Drag the slider. You are not selecting between models; you are moving a point along a path.
        The path happens to go through a region where task arithmetic does better than FFT or LoRA
        on fairness without sacrificing much accuracy. That sweet spot at λ ≈ 0.3–0.7 is not magic.
        It is a geometric consequence of where the task vector points.
      </P>

      <P>
        There is a useful way to think about why this curve has the shape it does. The merged model
        <Katex tex="\theta(\lambda)" /> can be understood as approximately minimizing a loss where
        each subgroup's data receives weight proportional to <Katex tex="\lambda_g" />. As you increase
        λ uniformly, you're putting more weight on the task distribution, which was already selected
        to be fairer, and less on the base model's prior. The tradeoff curve reflects this reweighting.
      </P>

      {/* ── Section 5: Subgroup Vectors ────────────────────────────────────── */}
      <SectionHeading number={5} title="Subgroup Vectors: Different Directions" />

      <P>
        Now things get more interesting. Instead of one global task vector, the paper considers
        <Strong> subgroup-specific task vectors</Strong>: fine-tune separately on the data of each
        demographic group <Katex tex="g" />, obtaining <Katex tex="\Delta\theta_g = \theta_g - \theta_0" />.
        Then inject that subgroup vector into the supervised fine-tuned model:
      </P>

      <MathBlock tex="\theta_{\text{new}} = \theta_{\text{SFT}} + \lambda \, \Delta\theta_g" />

      <P>
        Each subgroup vector <Katex tex="\Delta\theta_g" /> points in a <em>different direction</em> in
        weight space, because each group's fine-tuning data was different. This is the key geometric
        insight: subgroup injection is not a uniform operation. Different groups push the model in
        different directions, with different magnitudes.
      </P>

      <P>
        And the paper finds exactly what you'd expect from this geometry: <Strong>the fairness effect
        is heterogeneous across groups</Strong>. Some subgroup vectors improve fairness metrics monotonically
        as λ increases. Others improve accuracy for some subgroups while worsening it for others.
        A few can <em>decrease</em> overall fairness.
      </P>

      <SubgroupVectorExplainer />

      <P>
        The widget lets you toggle individual subgroup vectors. Notice:
      </P>

      <P>
        <Strong>Men (gender), Asian (race)</Strong>: injection consistently decreases DPD and EOD as λ
        increases. The vector points in a direction that reduces disparity. These are the "good"
        directions.
      </P>

      <P>
        <Strong>Women (gender)</Strong>: injection helps accuracy for Trans Women, but worsens fairness
        for Men. The vector is pointed in a direction that has non-uniform effects across subgroups.
      </P>

      <P>
        <Strong>Native American (race)</Strong>: injection <em>increases</em> disparity. The vector
        points in a direction that moves the model toward worse fairness, even as the coefficient
        grows. This is a clear empirical demonstration that not all subgroup vectors are helpful;
        some are counterproductive, and the paper is careful to document this.
      </P>

      <P>
        This is not a failure of task arithmetic. It is a revelation: the method gives you enough
        control to see <em>which directions are helpful</em>. Standard fine-tuning or LoRA collapses
        all of this into a single trained model with no decomposition. Task arithmetic makes the
        geometry visible.
      </P>

      {/* ── Section 6: The Bound ──────────────────────────────────────────── */}
      <SectionHeading number={6} title="The Bound: Why Norms and Deviations Matter" />

      <P>
        The paper provides a theoretical result that formalizes the geometric intuition. Here is
        the informal version first.
      </P>

      <P>
        Consider a merged model using subgroup-specific vectors:
        <Katex tex="\theta(\lambda) = \theta_0 + \sum_g \lambda_g \, \Delta\theta_g" />.
        There is a "balanced" reference point where <Katex tex="\lambda_g = 1" /> for all groups:
        the model that treats all groups equally. The paper shows that <Strong>demographic parity
        disparity is bounded above by how far your chosen coefficients deviate from this balanced
        setting, scaled by the norms of the subgroup vectors</Strong>:
      </P>

      <MathBlock tex="\text{DPD}(\theta(\lambda)) \leq 2L \sum_g |\lambda_g - 1| \cdot \|\Delta\theta_g\|_2" />

      <P>
        where <Katex tex="L" /> is a Lipschitz constant on prediction scores. For equalized odds
        disparity, there's a corresponding bound:
      </P>

      <MathBlock tex="\text{EOD}(\theta(\lambda)) \leq \text{EOD}(\bar{\theta}) + 4\sqrt{(B_0 + B_1) \cdot U(\lambda)}" />

      <P>
        where <Katex tex="U(\lambda) = 2L \sum_g |\lambda_g - 1| \cdot \|\Delta\theta_g\|_2" /> is
        the same deviation term.
      </P>

      <P>
        The geometry of this bound is sharp. Three things control disparity:
      </P>

      <P>
        1. <Strong>How far your λ_g deviate from 1</Strong>. If you use the same coefficient for all
        groups, deviation is zero and the bound collapses.
      </P>

      <P>
        2. <Strong>The norms of the subgroup vectors</Strong>. A subgroup with a large
        <Katex tex="\|\Delta\theta_g\|_2" /> contributes more to the bound, meaning it amplifies the
        sensitivity of disparity to your coefficient choices. Groups with large vectors are the
        ones where you need to be careful.
      </P>

      <P>
        3. <Strong>The number of subgroups</Strong>. More groups means more terms in the sum, potentially
        a larger bound, unless their vectors cancel.
      </P>

      <BoundIntuitionWidget />

      <P>
        Play with the widget. Set deviation to 0; the bound collapses to 0, regardless of norms.
        Now crank up the norm with non-zero deviation; the bound explodes. The geometry is telling
        you: if a subgroup has a large, distinctive task vector, you'd better be careful about how
        you set its coefficient relative to the others.
      </P>

      <P>
        This is a precise, falsifiable, geometric claim. It is not just saying "be fair." It is
        saying: <Em>fairness disparity is controlled by the geometry of the subgroup vectors in
        weight space, and specifically by the product of coefficient imbalance and vector norms</Em>.
      </P>

      {/* ── Section 7: Empirical Grounding ────────────────────────────────── */}
      <SectionHeading number={7} title="What the Paper Actually Shows" />

      <P>
        The experiments test these ideas across three datasets and four models:
      </P>

      <P>
        <Strong>Berkeley D-Lab Hate Speech</Strong> (3,546 gender / 3,352 race samples): fine-tuned
        LLaMA-7B. Protected attributes: 7 gender subgroups, 8 race subgroups. λ swept from 0 to 1.
        Result: task addition with λ ≈ 0.5–0.8 achieves competitive accuracy while reducing DPD/EOD
        below FFT and LoRA baselines for gender; mixed results for race.
      </P>

      <P>
        <Strong>Civil Comments</Strong> (toxicity detection): DistilBERT and Qwen2.5-0.5B. Gender
        and race attributes. The λ sweep shows a consistent Pareto improvement region over FFT/LoRA
        for gender subgroups. Race is more variable.
      </P>

      <P>
        <Strong>UTKFace</Strong> (age classification, ≤30 vs {'>'}30): ViT-Base/16. Race and gender
        protected attributes. Similar qualitative pattern: task arithmetic at moderate λ matches or
        beats baselines on disparity.
      </P>

      <P>
        One nuance the paper preserves throughout: <Strong>no method dominates uniformly</Strong>.
        Task arithmetic at a good λ often beats FFT and LoRA on group fairness. But the effect
        is heterogeneous; race subgroups are harder than gender, and some individual subgroup vectors
        actively worsen things. The paper does not oversell this as a universal solution. It is
        an honest accounting of a complex empirical landscape.
      </P>

      <P>
        The comparison with LoRA is particularly instructive. LoRA is efficient like task arithmetic
        but has no equivalent of λ; once trained, you're committed to a single operating point.
        Task arithmetic exposes the whole frontier; LoRA gives you one point on it.
      </P>

      {/* ── Section 8: Honest Accounting ──────────────────────────────────── */}
      <SectionHeading number={8} title="The Honest Accounting" />

      <P>
        What the paper does not claim is worth being clear about. The scope is models in the 0.5B–7B
        regime with open weights. It focuses on binary classification with single protected attributes.
        Intersectional fairness: what happens when you condition on both race and gender simultaneously;
        is not addressed. Larger, API-only models are not tested.
      </P>

      <P>
        The empirical finding that task arithmetic can beat FFT/LoRA on fairness is real. But "can"
        is doing work there; you have to choose λ correctly, the right subgroup vectors have to be
        used, and the task vector has to point in a helpful direction. None of these are guaranteed.
      </P>

      <P>
        The theoretical bound is tight in a useful sense: if your coefficients are balanced and your
        vectors aren't too large, disparity is controlled. But the bound is an upper bound, not a
        tight characterization of what the model will actually do.
      </P>

      <P>
        These caveats are appropriate and the paper makes them clearly. The contribution is the
        geometric framework: a way of thinking about task arithmetic that makes the fairness
        behavior interpretable and controllable; not a claim that task arithmetic solves fairness.
      </P>

      {/* ── Epilogue ──────────────────────────────────────────────────────── */}
      <SectionHeading number={9} title="What You Now See" />

      <Pullquote>
        A task vector is a direction in weight space. Merging is vector composition. λ is a motion
        parameter. Subgroup vectors are different directions with different norms and different effects.
        The fairness tradeoff is a path you trace by moving along these directions.
      </Pullquote>

      <P>
        Once this geometry is internalized, the paper's results stop being surprising. Of course
        sweeping λ traces a smooth tradeoff curve; you're moving along a line. Of course different
        subgroup vectors have different effects; they point in different directions. Of course
        disparity scales with vector norms; larger vectors mean larger perturbations.
      </P>

      <P>
        The deeper payoff of this geometric view is that it suggests a design space. If you can
        measure which directions in weight space are fairness-improving, you can search for those
        directions explicitly. If you know that large vector norms amplify sensitivity to coefficient
        choices, you can regularize them. If the bound tells you that balanced coefficients minimize
        disparity, you can enforce that balance.
      </P>

      <P>
        Task arithmetic started as an engineering trick. The geometry makes it a legible intervention.
        And legibility, in the context of fairness, is not just aesthetically nice; it is the
        precondition for making things better.
      </P>

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f5f0ff', borderRadius: '12px', border: '1px solid #e8d5ff' }}>
        <p style={{ color: '#6d28d9', fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: '0.5rem', fontWeight: 600 }}>
          Paper reference
        </p>
        <p style={{ color: '#4c1d95', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
          Hiroki Naganuma, Kotaro Yoshida, Laura Gomezjurado Gonzalez, Takafumi Horie, Yuji Naraki, Ryotaro Shimizu.{' '}
          <em>On Fairness of Task Arithmetic: The Role of Task Vectors.</em>{' '}
          ICLR 2026. arXiv:2505.24262
        </p>
      </div>
    </div>
  )
}
