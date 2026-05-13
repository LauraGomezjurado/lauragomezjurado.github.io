import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'

/**
 * Canvas “water in cracks”: each frame samples the head along the spline;
 * recent positions form a FIFO trail that ages out, drawn with progressively
 * stronger opacity toward the head — reads as a soft glowing trace, not a
 * moving stick.
 */

const PATHS = [
  [
    [0.11, 0.04],
    [0.13, 0.11],
    [0.08, 0.22],
    [0.15, 0.33],
    [0.09, 0.44],
    [0.14, 0.56],
    [0.1, 0.68],
    [0.13, 0.8],
    [0.11, 0.93],
  ],
  [
    [0.52, 0.05],
    [0.56, 0.15],
    [0.48, 0.28],
    [0.58, 0.4],
    [0.5, 0.52],
    [0.59, 0.64],
    [0.53, 0.76],
    [0.57, 0.88],
    [0.54, 0.96],
  ],
  [
    [0.78, 0.05],
    [0.81, 0.14],
    [0.73, 0.27],
    [0.84, 0.39],
    [0.76, 0.51],
    [0.85, 0.63],
    [0.77, 0.75],
    [0.83, 0.86],
    [0.79, 0.94],
  ],
]

const DROP_CFG = [
  { duration: 11.2, delay: 0, strength: 0.5, maxTrail: 72 },
  { duration: 13.8, delay: -2.4, strength: 0.44, maxTrail: 64 },
  { duration: 15.5, delay: -5.1, strength: 0.38, maxTrail: 58 },
]

function toWaypoints(arr) {
  return arr.map(([x, y]) => ({ x, y }))
}

function expandCatmullRom(pts, subdiv = 10) {
  if (pts.length < 2) return pts
  const pad = [pts[0], ...pts, pts[pts.length - 1]]
  const out = []

  const interp = (p0, p1, p2, p3, t) => {
    const t2 = t * t
    const t3 = t2 * t
    return {
      x:
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y:
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    }
  }

  for (let i = 0; i < pad.length - 3; i++) {
    const p0 = pad[i]
    const p1 = pad[i + 1]
    const p2 = pad[i + 2]
    const p3 = pad[i + 3]
    for (let s = 0; s < subdiv; s++) {
      out.push(interp(p0, p1, p2, p3, s / subdiv))
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

function getPoint(pts, t) {
  const tClamped = Math.min(1, Math.max(0, t))
  const n = pts.length
  if (n === 1) return pts[0]
  const f = tClamped * (n - 1)
  const i = Math.floor(f)
  const j = Math.min(i + 1, n - 1)
  const lt = f - i
  const a = pts[i]
  const b = pts[j]
  return { x: a.x + (b.x - a.x) * lt, y: a.y + (b.y - a.y) * lt }
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

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }[]} trail
 * @param {number} strength
 */
function paintTrail(ctx, trail, strength) {
  if (trail.length < 2) return

  const n = trail.length
  const head = trail[n - 1]

  /* Wide, very soft outer wash */
  ctx.save()
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(195, 208, 235, 0.25)'
  ctx.strokeStyle = `rgba(235, 238, 248, ${0.06 * strength})`
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(trail[0].x, trail[0].y)
  for (let i = 1; i < n; i++) ctx.lineTo(trail[i].x, trail[i].y)
  ctx.stroke()
  ctx.restore()

  /* Core: each short segment ramps opacity toward the head (progressive trace) */
  for (let i = 0; i < n - 1; i++) {
    const t = (i + 1) / (n - 1)
    const pulse = t * t
    const alpha = (0.02 + pulse * 0.78) * strength
    ctx.strokeStyle = `rgba(248, 249, 253, ${alpha})`
    ctx.lineWidth = 0.9 + pulse * 1.35
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(trail[i].x, trail[i].y)
    ctx.lineTo(trail[i + 1].x, trail[i + 1].y)
    ctx.stroke()
  }

  /* Bright head: small soft dot */
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
  const waypointSets = useMemo(
    () => PATHS.map((p) => expandCatmullRom(toWaypoints(p), 12)),
    []
  )

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
    }))

    updateMetrics()
    syncNumDrops()
    resizeCanvas(canvas, ctx, root, dprRef)

    const pushTrailSample = (d) => {
      const { w, h } = metricsRef.current
      const p = getPoint(d.pts, d.proxy.u)
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
