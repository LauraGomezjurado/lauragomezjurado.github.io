import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'

/**
 * Canvas light trails along **orthogonal “trace” routes**: only horizontal and
 * vertical segments (tech / PCB-style paths), one distinct polyline per drop.
 * Motion is slowed and sampled by **arc length** so speed feels even along the
 * zigzag. Trails still fade behind the head.
 */

/* Each path: axis-aligned segments only; y is mostly downward; layouts differ. */
const PATHS = [
  // Left: narrow vertical channel, stair-step right
  [
    [0.1, 0.04],
    [0.1, 0.15],
    [0.22, 0.15],
    [0.22, 0.26],
    [0.12, 0.26],
    [0.12, 0.37],
    [0.24, 0.37],
    [0.24, 0.5],
    [0.14, 0.5],
    [0.14, 0.62],
    [0.21, 0.62],
    [0.21, 0.75],
    [0.11, 0.75],
    [0.11, 0.9],
  ],
  // Center: wider jog — starts further right, moves left then down ladders
  [
    [0.62, 0.03],
    [0.45, 0.03],
    [0.45, 0.14],
    [0.58, 0.14],
    [0.58, 0.26],
    [0.4, 0.26],
    [0.4, 0.38],
    [0.54, 0.38],
    [0.54, 0.5],
    [0.42, 0.5],
    [0.42, 0.62],
    [0.56, 0.62],
    [0.56, 0.74],
    [0.44, 0.74],
    [0.44, 0.86],
    [0.5, 0.86],
    [0.5, 0.96],
  ],
  // Right: long horizontal runs, then vertical drops (datasheet / bus feel)
  [
    [0.86, 0.05],
    [0.86, 0.18],
    [0.68, 0.18],
    [0.68, 0.3],
    [0.8, 0.3],
    [0.8, 0.4],
    [0.66, 0.4],
    [0.66, 0.52],
    [0.82, 0.52],
    [0.82, 0.64],
    [0.7, 0.64],
    [0.7, 0.76],
    [0.78, 0.76],
    [0.78, 0.88],
    [0.64, 0.88],
    [0.64, 0.96],
  ],
]

const DROP_CFG = [
  { duration: 24, delay: 0, strength: 0.5, maxTrail: 72 },
  { duration: 28, delay: -6, strength: 0.44, maxTrail: 64 },
  { duration: 32, delay: -13, strength: 0.38, maxTrail: 58 },
]

function toWaypoints(arr) {
  return arr.map(([x, y]) => ({ x, y }))
}

/** Pixel cumulative lengths along polyline (for constant-speed motion in t). */
function computeArcMeta(pts, w, h) {
  if (pts.length === 0) return { cum: [0], total: 0 }
  const cum = [0]
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = (pts[i + 1].x - pts[i].x) * w
    const dy = (pts[i + 1].y - pts[i].y) * h
    total += Math.hypot(dx, dy)
    cum.push(total)
  }
  return { cum, total }
}

function getPointOnPolyline(pts, t, cum, total) {
  if (!pts.length) return { x: 0, y: 0 }
  if (pts.length === 1 || total < 1e-6) return pts[0]
  const d = Math.min(1, Math.max(0, t)) * total
  let i = 0
  while (i < cum.length - 1 && cum[i + 1] < d) i++
  const segLen = cum[i + 1] - cum[i]
  const lt = segLen > 1e-6 ? (d - cum[i]) / segLen : 0
  const a = pts[i]
  const b = pts[i + 1]
  return {
    x: a.x + (b.x - a.x) * lt,
    y: a.y + (b.y - a.y) * lt,
  }
}

function resizeCanvas(canvas, ctx, root, dprRef) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  dprRef.current = dpr
  const w = Math.max(1, root.clientWidth)
  const h = Math.max(1, root.clientHeight)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function paintTrail(ctx, trail, strength) {
  if (trail.length < 2) return

  const n = trail.length
  const head = trail[n - 1]

  ctx.save()
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(195, 208, 235, 0.25)'
  ctx.strokeStyle = `rgba(235, 238, 248, ${0.06 * strength})`
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 2
  ctx.beginPath()
  ctx.moveTo(trail[0].x, trail[0].y)
  for (let i = 1; i < n; i++) ctx.lineTo(trail[i].x, trail[i].y)
  ctx.stroke()
  ctx.restore()

  for (let i = 0; i < n - 1; i++) {
    const t = (i + 1) / (n - 1)
    const pulse = t * t
    const alpha = (0.02 + pulse * 0.78) * strength
    ctx.strokeStyle = `rgba(248, 249, 253, ${alpha})`
    ctx.lineWidth = 0.9 + pulse * 1.35
    ctx.lineCap = 'round'
    ctx.lineJoin = 'miter'
    ctx.miterLimit = 2
    ctx.beginPath()
    ctx.moveTo(trail[i].x, trail[i].y)
    ctx.lineTo(trail[i + 1].x, trail[i + 1].y)
    ctx.stroke()
  }

  const gh = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 4)
  gh.addColorStop(0, `rgba(255,255,255,${0.55 * strength})`)
  gh.addColorStop(0.45, `rgba(240,243,252,${0.18 * strength})`)
  gh.addColorStop(1, 'rgba(240,243,252,0)')
  ctx.fillStyle = gh
  ctx.beginPath()
  ctx.arc(head.x, head.y, 4, 0, Math.PI * 2)
  ctx.fill()
}

export default function LightDrops() {
  const [off, setOff] = useState(false)
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const dprRef = useRef(1)
  const metricsRef = useRef({ w: 1, h: 1 })
  const numDropsRef = useRef(3)
  const waypointSets = useMemo(() => PATHS.map(toWaypoints), [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setOff(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (off) return undefined

    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const updateMetrics = () => {
      metricsRef.current = {
        w: Math.max(1, root.clientWidth),
        h: Math.max(1, root.clientHeight),
      }
    }

    const syncNumDrops = () => {
      numDropsRef.current = window.matchMedia('(max-width: 768px)').matches ? 2 : 3
    }

    const runners = waypointSets.map((pts, i) => ({
      pts,
      proxy: { u: 0 },
      trail: /** @type {{ x: number, y: number }[]} */ ([]),
      maxTrail: DROP_CFG[i].maxTrail,
      strength: DROP_CFG[i].strength,
      framesSincePush: 0,
      arc: { cum: [0], total: 0 },
    }))

    const refreshArc = (d) => {
      const { w, h } = metricsRef.current
      d.arc = computeArcMeta(d.pts, w, h)
    }

    updateMetrics()
    syncNumDrops()
    runners.forEach(refreshArc)
    resizeCanvas(canvas, ctx, root, dprRef)

    const pushTrailSample = (d) => {
      const { w, h } = metricsRef.current
      const { cum, total } = d.arc
      const p = getPointOnPolyline(d.pts, d.proxy.u, cum, total)
      const x = p.x * w
      const y = p.y * h
      const prev = d.trail[d.trail.length - 1]
      d.framesSincePush += 1
      const moved = !prev || Math.hypot(x - prev.x, y - prev.y) > 0.15
      if (moved || d.framesSincePush > 2) {
        d.trail.push({ x, y })
        d.framesSincePush = 0
        while (d.trail.length > d.maxTrail) d.trail.shift()
      }
    }

    const render = () => {
      const { w, h } = metricsRef.current
      ctx.clearRect(0, 0, w, h)
      const count = numDropsRef.current
      for (let i = 0; i < count; i++) {
        paintTrail(ctx, runners[i].trail, runners[i].strength)
      }
    }

    const onTick = () => {
      const count = numDropsRef.current
      for (let i = 0; i < count; i++) pushTrailSample(runners[i])
      render()
    }

    const ctxGsap = gsap.context(() => {
      for (let i = 0; i < runners.length; i++) {
        const d = runners[i]
        const cfg = DROP_CFG[i]
        gsap.to(d.proxy, {
          u: 1,
          duration: cfg.duration,
          ease: 'power1.in',
          repeat: -1,
          delay: cfg.delay,
          immediateRender: true,
          onRepeat: () => {
            d.trail.length = 0
            d.framesSincePush = 0
          },
        })
      }
    }, root)

    gsap.ticker.add(onTick)

    const ro = new ResizeObserver(() => {
      updateMetrics()
      syncNumDrops()
      resizeCanvas(canvas, ctx, root, dprRef)
      runners.forEach((r) => {
        refreshArc(r)
        r.trail.length = 0
        r.framesSincePush = 0
      })
    })
    ro.observe(root)

    const onMm = () => {
      syncNumDrops()
    }
    window.addEventListener('resize', onMm)

    const mMobile = window.matchMedia('(max-width: 768px)')
    mMobile.addEventListener('change', onMm)

    return () => {
      mMobile.removeEventListener('change', onMm)
      window.removeEventListener('resize', onMm)
      ro.disconnect()
      gsap.ticker.remove(onTick)
      ctxGsap.revert()
    }
  }, [off, waypointSets])

  if (off) return null

  return (
    <div ref={rootRef} className="light-drops-root" aria-hidden>
      <canvas ref={canvasRef} className="light-drops-canvas" />

      <style>{`
        .light-drops-root {
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          height: min(40vh, 360px);
          pointer-events: none;
          z-index: 3;
          overflow: hidden;
        }

        .light-drops-canvas {
          display: block;
          width: 100%;
          height: 100%;
          mix-blend-mode: screen;
        }

        @media (max-width: 768px) {
          .light-drops-root {
            opacity: 0.92;
          }
        }
      `}</style>
    </div>
  )
}
