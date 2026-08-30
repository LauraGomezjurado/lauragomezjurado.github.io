/**
 * plate-rouge-shift — two distributions, and the distance between them.
 *
 * The clinical-note pipeline doubled ROUGE-1. Its old figure was
 * notes -> model -> "0.48", which states the number without showing what it
 * means. What it means is that a whole distribution of scores moved.
 *
 * So: two densities on one axis, the second displaced right, painted wet. Where
 * they overlap the pigment doubles and darkens on its own - the overlap is not
 * drawn, it happens, which is what the fill system is for and roughly what
 * "how much better" actually looks like.
 *
 *   node scripts/paint/render.mjs sketches/plate-rouge-shift.js \
 *     --size 1500x1000 --seed 2 --bleed
 *
 * Pans: payne for the baseline, rose for the tuned run. Cool against warm, so
 * the two read apart even where they sit on top of each other.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const INK = '#3A2A22'
const PENCIL = '#8C8375'
const PAYNE = '#6E7C92'
const ROSE = '#B4738A'

// mu and sigma in plot units, and the pan each is painted in.
const DISTS = [
  { mu: 0.28, sd: 0.115, pan: PAYNE, alpha: 54, peak: 0.72 },
  { mu: 0.62, sd: 0.135, pan: ROSE, alpha: 58, peak: 0.94 },
]

let P
let plot

const X = (t) => plot.x + t * plot.w
const Y = (v) => plot.y + plot.h - v * plot.h
const density = (d) => (t) => d.peak * Math.exp(-((t - d.mu) ** 2) / (2 * d.sd * d.sd))

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  plot = { x: P.x + P.w * 0.12, y: P.y + P.h * 0.14, w: P.w * 0.76, h: P.h * 0.66 }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  DISTS.forEach((d, i) => {
    body(d, i)
    WC.flush()
  })
  DISTS.forEach((d) => outline(d))
  axis()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/** A density flooded under its own curve, touch height bounded by the curve. */
function body(d, idx) {
  const f = density(d)
  const STEPS = 56
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const v = f(t)
    if (v < 0.03) continue
    const top = Y(v)
    const h = Y(0) - top
    const rows = Math.max(1, Math.round(h / (plot.h * 0.15)))
    const stagger = ((i + idx) % 2) * 0.5
    for (let k = 0; k < rows; k++) {
      const jy = (noise(i * 1.3 + idx * 5, k * 1.9) - 0.5) * (h / rows) * 0.75
      const cy = top + ((k + 0.5 + stagger) / rows) * h + jy
      if (cy < top) continue
      const base = Math.min(h / rows, (plot.w / STEPS) * 2.5)
      WC.wet(0.52)
      brush.fill(d.pan, d.alpha + noise(i, k) * 30)
      brush.beginShape(0.9)
      WC.blob(X(t), cy, base * (0.52 + 0.4 * noise(i * 2 + idx, k)), i * 7 + k + idx * 41, 1.15)()
      brush.endShape(true)
    }
  }
}

function outline(d) {
  const f = density(d)
  brush.noFill()
  brush.noHatch()
  brush.set('2B', d.pan, 0.42)
  for (let i = 0; i < 110; i++) {
    const t0 = i / 110
    const t1 = (i + 1) / 110
    if (f(t0) < 0.02 && f(t1) < 0.02) continue
    brush.line(X(t0), Y(f(t0)), X(t1), Y(f(t1)))
  }
  WC.flush()
}

/** The axis, and a leader marking how far the mass travelled. */
function axis() {
  brush.noFill()
  brush.set('2H', PENCIL, 0.3)
  brush.line(plot.x, Y(0), plot.x + plot.w, Y(0))
  const t = plot.h * 0.012
  for (let i = 0; i <= 10; i++) {
    const x = plot.x + (i / 10) * plot.w
    brush.line(x, Y(0), x, Y(0) + (i % 5 ? t * 0.6 : t))
  }
  // The shift itself: a rule between the two peaks.
  brush.set('2H', INK, 0.34)
  const y = Y(1.02)
  brush.line(X(DISTS[0].mu), y, X(DISTS[1].mu), y)
  brush.line(X(DISTS[0].mu), y - t, X(DISTS[0].mu), y + t)
  brush.line(X(DISTS[1].mu), y - t, X(DISTS[1].mu), y + t)
  WC.leader(X((DISTS[0].mu + DISTS[1].mu) / 2), y, P.x + P.w * 0.9, P.y + P.h * 0.08, P.w * 0.05, INK)
}
