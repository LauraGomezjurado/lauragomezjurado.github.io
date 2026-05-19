import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * Canvas "falling stars" drifting through the full viewport. Each drop follows
 * a gently-curved, near-vertical bezier sampled into a short polyline. Paths
 * regenerate on every loop so the eye never catches the same trajectory twice.
 * Trails are long and faint so they sit *behind* the attractor visually — the
 * attractor reads as a galaxy, the drops as distant stars settling past it.
 */

const NUM_PATH_SAMPLES = 18

/** Pick a slightly-curved near-vertical descent across the viewport. */
function generatePath() {
  const startX = 0.04 + Math.random() * 0.92
  const startY = -0.06 - Math.random() * 0.04
  // Drift angle off vertical: gentle (~ ±18°), occasionally a steeper streak.
  const skew = (Math.random() - 0.5) * 0.36 + (Math.random() < 0.18 ? (Math.random() - 0.5) * 0.4 : 0)
  const length = 1.18 + Math.random() * 0.18
  const endX = Math.max(-0.1, Math.min(1.1, startX + skew))
  const endY = startY + length
  // Subtle quadratic curve so the descent isn't a perfectly straight ruler line.
  const bow = (Math.random() - 0.5) * 0.07
  const cx = (startX + endX) / 2 + bow
  const cy = (startY + endY) / 2

  const pts = []
  for (let i = 0; i <= NUM_PATH_SAMPLES; i++) {
    const t = i / NUM_PATH_SAMPLES
    const u = 1 - t
    const x = u * u * startX + 2 * u * t * cx + t * t * endX
    const y = u * u * startY + 2 * u * t * cy + t * t * endY
    pts.push({ x, y })
  }
  return pts
}

const DROP_CFG = [
  { duration: 16, delay: 0,   strength: 0.42, maxTrail: 220 },
  { duration: 19, delay: -4,  strength: 0.34, maxTrail: 200 },
  { duration: 14, delay: -9,  strength: 0.45, maxTrail: 240 },
  { duration: 22, delay: -13, strength: 0.30, maxTrail: 180 },
  { duration: 18, delay: -7,  strength: 0.36, maxTrail: 210 },
]

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

  // Soft outer haze along the whole trail — sells "starlight through atmosphere".
  ctx.save()
  ctx.shadowBlur = 6
  ctx.shadowColor = 'rgba(195, 208, 235, 0.18)'
  ctx.strokeStyle = `rgba(235, 238, 248, ${0.035 * strength})`
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(trail[0].x, trail[0].y)
  for (let i = 1; i < n; i++) ctx.lineTo(trail[i].x, trail[i].y)
  ctx.stroke()
  ctx.restore()

  // Bright core: alpha and width ease quadratically from tail to head,
  // so most of the trail is gossamer and only the head reads as a point.
  for (let i = 0; i < n - 1; i++) {
    const t = (i + 1) / (n - 1)
    const pulse = t * t * t
    const alpha = (0.008 + pulse * 0.52) * strength
    ctx.strokeStyle = `rgba(248, 249, 253, ${alpha})`
    ctx.lineWidth = 0.55 + pulse * 0.95
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(trail[i].x, trail[i].y)
    ctx.lineTo(trail[i + 1].x, trail[i + 1].y)
    ctx.stroke()
  }

  // Head: smaller, dimmer pinpoint — a star, not a flare.
  const r = 3
  const gh = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r)
  gh.addColorStop(0, `rgba(255,255,255,${0.38 * strength})`)
  gh.addColorStop(0.5, `rgba(240,243,252,${0.12 * strength})`)
  gh.addColorStop(1, 'rgba(240,243,252,0)')
  ctx.fillStyle = gh
  ctx.beginPath()
  ctx.arc(head.x, head.y, r, 0, Math.PI * 2)
  ctx.fill()
}

export default function LightDrops() {
  const [off, setOff] = useState(false)
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const dprRef = useRef(1)
  const metricsRef = useRef({ w: 1, h: 1 })
  const numDropsRef = useRef(5)

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
      numDropsRef.current = window.matchMedia('(max-width: 768px)').matches ? 3 : 5
    }

    const runners = DROP_CFG.map((cfg) => ({
      pts: generatePath(),
      proxy: { u: 0 },
      trail: /** @type {{ x: number, y: number }[]} */ ([]),
      maxTrail: cfg.maxTrail,
      strength: cfg.strength,
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
            // Fresh trajectory every loop — no two passes trace the same line.
            d.pts = generatePath()
            refreshArc(d)
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
  }, [off])

  if (off) return null

  return (
    <div ref={rootRef} className="light-drops-root" aria-hidden>
      <canvas ref={canvasRef} className="light-drops-canvas" />

      <style>{`
        .light-drops-root {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .light-drops-canvas {
          display: block;
          width: 100%;
          height: 100%;
          mix-blend-mode: screen;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .light-drops-canvas {
            opacity: 0.62;
          }
        }
      `}</style>
    </div>
  )
}
