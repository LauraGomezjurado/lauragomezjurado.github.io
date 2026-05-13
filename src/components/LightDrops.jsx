import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'

/**
 * Subtle “water through cracks” streaks: mostly-downward zigzag paths, streak
 * axis follows the local trajectory (not a rigid translating line). Bright
 * head / soft trail gradients match the paper + screen blend from before.
 */

const PATHS = [
  // Left channel — tight zigzag down
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
  // Center-right — wider weave
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
  // Far right — longer runs, then jog
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

const STREAK_HEIGHTS = [88, 76, 64]

function toWaypoints(arr) {
  return arr.map(([x, y]) => ({ x, y }))
}

/** Open Catmull–Rom: rounds crack corners so tangents change smoothly. */
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

function getTangent(pts, t, eps = 0.004) {
  const t0 = Math.max(0, t - eps)
  const t1 = Math.min(1, t + eps)
  const p0 = getPoint(pts, t0)
  const p1 = getPoint(pts, t1)
  let dx = p1.x - p0.x
  let dy = p1.y - p0.y
  const len = Math.hypot(dx, dy)
  if (len < 1e-9) {
    dx = 0
    dy = 1
  } else {
    dx /= len
    dy /= len
  }
  return { x: dx, y: dy }
}

export default function LightDrops() {
  const [off, setOff] = useState(false)
  const rootRef = useRef(null)
  const dropRefs = [useRef(null), useRef(null), useRef(null)]
  const metricsRef = useRef({ w: 1, h: 1 })
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
    if (!root) return undefined

    const drops = dropRefs.map((r) => r.current).filter(Boolean)
    if (!drops.length) return undefined

    const updateMetrics = () => {
      metricsRef.current = {
        w: Math.max(1, root.clientWidth),
        h: Math.max(1, root.clientHeight),
      }
    }

    const placeDrop = (el, pts, u, height) => {
      const { w, h } = metricsRef.current
      const p = getPoint(pts, u)
      const tang = getTangent(pts, u)
      const px = p.x * w
      const py = p.y * h
      const deg = (Math.atan2(tang.x, tang.y) * 180) / Math.PI

      el.style.left = `${px}px`
      el.style.top = `${py - height}px`
      el.style.transform = `translateX(-50%) rotate(${deg}deg)`
    }

    updateMetrics()

    const runners = []

    const ctx = gsap.context(() => {
      const configs = [
        { duration: 11.2, delay: 0, ease: 'power1.in' },
        { duration: 13.8, delay: -2.4, ease: 'power1.in' },
        { duration: 15.5, delay: -5.1, ease: 'power1.in' },
      ]

      drops.forEach((el, i) => {
        const pts = waypointSets[i]
        const height = STREAK_HEIGHTS[i]
        const cfg = configs[i]
        const proxy = { u: 0 }
        runners.push({ el, pts, h: height, proxy })
        placeDrop(el, pts, 0, height)

        gsap.to(proxy, {
          u: 1,
          duration: cfg.duration,
          ease: cfg.ease,
          repeat: -1,
          delay: cfg.delay,
          immediateRender: true,
          onUpdate: () => placeDrop(el, pts, proxy.u, height),
        })
      })
    }, root)

    const ro = new ResizeObserver(() => {
      updateMetrics()
      runners.forEach(({ el, pts, h, proxy }) => placeDrop(el, pts, proxy.u, h))
    })
    ro.observe(root)

    return () => {
      ro.disconnect()
      ctx.revert()
    }
  }, [off, waypointSets])

  if (off) return null

  return (
    <div ref={rootRef} className="light-drops-root" aria-hidden>
      {PATHS.map((_, i) => (
        <div key={i} ref={dropRefs[i]} className={`light-drop streak-${i + 1}`} />
      ))}

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

        .light-drop {
          position: absolute;
          width: 1.5px;
          border-radius: 1px;
          transform-origin: 50% 100%;
          will-change: transform, left, top;
          background: linear-gradient(
            to top,
            rgba(244, 246, 252, 0.92) 0%,
            rgba(244, 246, 252, 0.22) 32%,
            rgba(200, 210, 230, 0.06) 58%,
            transparent 100%
          );
          filter: blur(0.35px);
          mix-blend-mode: screen;
        }

        .streak-1 { height: 88px; opacity: 0.42; }
        .streak-2 { height: 76px; opacity: 0.36; }
        .streak-3 { height: 64px; opacity: 0.3; }

        @media (max-width: 768px) {
          .streak-2 { opacity: 0.28; }
          .streak-3 { display: none; }
        }
      `}</style>
    </div>
  )
}
