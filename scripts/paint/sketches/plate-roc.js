/**
 * plate-roc — a cough, and the area under the curve it buys.
 *
 * Audio screening at 0.807 AUC. The old figure was waveform -> model -> "0.807".
 * The number IS an area, so paint the area: an ROC bowing above the diagonal,
 * with everything under it washed. How good the test is becomes how much
 * pigment is on the page, which is the one honest way to draw an AUC.
 *
 * The cough itself runs along the foot of the plate as a painted waveform - the
 * input and the result in one frame, without an arrow between them.
 *
 *   node scripts/paint/render.mjs sketches/plate-roc.js \
 *     --size 1500x1100 --seed 8 --bleed
 *
 * Pans: olive and sienna. Organic, and the only plate in the series whose
 * subject is a sound.
 *
 * Touch budget matters here: the first version laid ~466 bleeding fills and
 * never finished inside the renderer's virtual-time budget, failing with a bare
 * "render failed". A waveform does not need 200 stamps to read as one.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const INK = '#3A2A22'
const PENCIL = '#8C8375'
const OLIVE = '#6B705C'
const SIENNA = '#A8654A'

let P
let plot
let wave

const X = (t) => plot.x + t * plot.w
const Y = (v) => plot.y + plot.h - v * plot.h
// An ROC with AUC ~0.81: tpr = fpr^k with k chosen to land near it.
const roc = (fpr) => Math.pow(fpr, 0.36)

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  plot = { x: P.x + P.w * 0.14, y: P.y + P.h * 0.08, w: P.w * 0.52, h: P.h * 0.6 }
  wave = { x: P.x + P.w * 0.1, y: P.y + P.h * 0.86, w: P.w * 0.8, h: P.h * 0.1 }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  area()
  WC.flush()
  curveAndChance()
  cough()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/** Everything under the ROC. The wash IS the number. */
function area() {
  const STEPS = 48
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS
    const top = Y(roc(t))
    const h = Y(0) - top
    if (h < plot.h * 0.02) continue
    const rows = Math.max(1, Math.round(h / (plot.h * 0.2)))
    const stagger = (i % 2) * 0.5
    for (let k = 0; k < rows; k++) {
      const jy = (noise(i * 1.5, k * 2.1) - 0.5) * (h / rows) * 0.8
      const cy = top + ((k + 0.5 + stagger) / rows) * h + jy
      if (cy < top) continue
      const base = Math.min(h / rows, (plot.w / STEPS) * 2.5)
      WC.wet(0.5)
      // Warmer toward the top-left, where a good classifier does its work.
      brush.fill(k === 0 ? SIENNA : OLIVE, 46 + noise(i, k) * 36)
      brush.beginShape(0.9)
      WC.blob(X(t), cy, base * (0.52 + 0.4 * noise(i * 2.3, k)), i * 5 + k, 1.15)()
      brush.endShape(true)
    }
  }
}

function curveAndChance() {
  brush.noFill()
  brush.noHatch()
  // Chance: the diagonal the curve has to beat, dashed because it is a
  // reference and not a result.
  brush.set('2H', PENCIL, 0.34)
  for (let i = 0; i < 15; i++) {
    if (i % 2) continue
    const t0 = i / 15
    const t1 = (i + 1) / 15
    brush.line(X(t0), Y(t0), X(t1), Y(t1))
  }
  // The ROC.
  brush.set('2B', INK, 0.5)
  for (let i = 0; i < 90; i++) {
    const t0 = Math.max(0.001, i / 90)
    const t1 = (i + 1) / 90
    brush.line(X(t0), Y(roc(t0)), X(t1), Y(roc(t1)))
  }
  // Axes.
  brush.set('2H', PENCIL, 0.3)
  brush.line(plot.x, plot.y, plot.x, Y(0))
  brush.line(plot.x, Y(0), plot.x + plot.w, Y(0))
  WC.flush()
  WC.leader(X(0.34), Y(roc(0.34) * 0.55), P.x + P.w * 0.86, P.y + P.h * 0.24, P.w * 0.05, INK)
}

/**
 * The cough.
 *
 * Two bursts with a gap: a cough is not a steady tone, and a sine would look
 * like one. Envelope is a decaying pulse, the carrier is noise-driven, and the
 * whole thing is stamped rather than stroked so it stays in the same medium as
 * everything else.
 */
function cough() {
  const N = 96
  const envelope = (t) => {
    const burst = (c, w) => Math.exp(-((t - c) ** 2) / (2 * w * w))
    return burst(0.22, 0.055) + 0.72 * burst(0.44, 0.075) + 0.3 * burst(0.6, 0.11)
  }
  const mid = wave.y + wave.h / 2
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const a = envelope(t) * (0.35 + 0.65 * noise(i * 0.6))
    const h = a * wave.h * 0.95
    if (h < wave.h * 0.02) continue
    const x = wave.x + t * wave.w
    WC.wet(0.45)
    brush.fill(i % 5 === 0 ? SIENNA : OLIVE, 70 + noise(i * 1.7) * 60)
    brush.beginShape(0.9)
    WC.blob(x, mid, Math.max(wave.w / N * 1.1, h / 2), i * 3, 0.5)()
    brush.endShape(true)
  }
  WC.flush()
  brush.noFill()
  brush.set('2H', PENCIL, 0.26)
  brush.line(wave.x, mid, wave.x + wave.w, mid)
}
