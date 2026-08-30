/**
 * plate-ceiling — the bound nothing gets past.
 *
 * A weak-signal regime has an information-theoretic ceiling: no amount of
 * capacity buys accuracy the data does not contain. Several models are trained,
 * their curves rise, and every one of them flattens under the same line.
 *
 * The subject is the EMPTY PAPER ABOVE THE LINE. So the wash goes only under the
 * curves, the ceiling is the one ruled mark on the plate, and the band between
 * the best curve and the bound is left deliberately bare - a figure about a
 * limit should have something visibly unreachable in it.
 *
 *   node scripts/paint/render.mjs sketches/plate-ceiling.js \
 *     --size 1500x1050 --seed 9 --bleed
 *
 * Pans: payne and ultramarine. Cool and austere; this is the plate about what
 * cannot be done.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const INK = '#3A2A22'
const PENCIL = '#8C8375'
const PAYNE = '#6E7C92'
const ULTRA = '#5B6E96'

const CEILING = 0.74 // where the bound sits, in plot units
const RUNS = [
  { cap: 0.71, rate: 5.0, pan: ULTRA },
  { cap: 0.66, rate: 7.5, pan: PAYNE },
  { cap: 0.58, rate: 11.0, pan: PAYNE },
]

let P
let plot

const X = (t) => plot.x + t * plot.w
const Y = (v) => plot.y + plot.h - v * plot.h
const curve = (run) => (t) => 0.5 + (run.cap - 0.5) * (1 - Math.exp(-run.rate * t))

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  plot = { x: P.x + P.w * 0.13, y: P.y + P.h * 0.1, w: P.w * 0.74, h: P.h * 0.72 }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  runs()
  WC.flush()
  ceiling()
  axis()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/**
 * Each run as a wash under its own curve.
 *
 * Walked along t with each touch sized to the height beneath the curve, so the
 * wash cannot climb above it - the one thing this figure must never do.
 */
function runs() {
  const STEPS = 42
  RUNS.forEach((run, r) => {
    const f = curve(run)
    for (let i = 0; i <= STEPS; i++) {
      const t = 0.01 + (i / STEPS) * 0.98
      const top = Y(f(t))
      const bottom = Y(0.5)
      const h = bottom - top
      if (h < plot.h * 0.02) continue
      const rows = Math.max(1, Math.round(h / (plot.h * 0.13)))
      const stagger = ((i + r) % 2) * 0.5
      for (let k = 0; k < rows; k++) {
        const jy = (noise(i * 1.4 + r, k * 2.2) - 0.5) * (h / rows) * 0.8
        const cy = top + ((k + 0.5 + stagger) / rows) * h + jy
        if (cy < top) continue
        const base = Math.min(h / rows, (plot.w / STEPS) * 2.4)
        WC.wet(0.5)
        brush.fill(run.pan, 40 + noise(i, k + r) * 34)
        brush.beginShape(0.9)
        WC.blob(X(t), cy, base * (0.5 + 0.4 * noise(i * 2.2 + r, k)), i * 5 + k + r * 13, 1.15)()
        brush.endShape(true)
      }
    }
    WC.flush()

    // The curve itself, thin over its own wash.
    brush.noFill()
    brush.noHatch()
    brush.set('2B', run.pan, 0.45)
    for (let i = 0; i < 90; i++) {
      const t0 = i / 90
      const t1 = (i + 1) / 90
      brush.line(X(t0), Y(f(t0)), X(t1), Y(f(t1)))
    }
    WC.flush()
  })
}

/** The bound. One ruled line, and nothing touches it. */
function ceiling() {
  brush.noFill()
  brush.noHatch()
  brush.set('rotring', INK, 0.55)
  brush.line(plot.x, Y(CEILING), plot.x + plot.w, Y(CEILING))
  WC.leader(X(0.62), Y(CEILING), P.x + P.w * 0.92, P.y + P.h * 0.06, P.w * 0.05, INK)
}

function axis() {
  brush.noFill()
  brush.set('2H', PENCIL, 0.3)
  brush.line(plot.x, plot.y, plot.x, plot.y + plot.h)
  brush.line(plot.x, Y(0.5), plot.x + plot.w, Y(0.5))
  const t = plot.h * 0.011
  for (let i = 0; i <= 8; i++) {
    const x = plot.x + (i / 8) * plot.w
    brush.line(x, Y(0.5), x, Y(0.5) + (i % 4 ? t * 0.6 : t))
  }
}
