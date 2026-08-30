/**
 * brush-sweep — calibration grid for a custom tip.
 *
 * The first specimen card proved custom tips render, then showed the strokes
 * coming out far thinner than the built-ins at nominally similar settings. The
 * p5.brush docs describe the tip buffer as "100x100, origin centred, edges
 * around +/-50", but their own example draws a 3-unit rect at weight 5 - so how
 * tip radius trades against `weight` is not something to reason about. Measure.
 *
 * Columns vary tip radius; rows vary weight. Opacity and spacing are fixed so
 * only the geometry moves.
 *
 *   node scripts/paint/render.mjs sketches/brush-sweep.js --size 1100x780 --seed 5
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER */

const RADII = [4, 10, 20, 34, 48]
const WEIGHTS = [1, 3, 8, 16]

function raggedTip(_m, r) {
  _m.noStroke()
  _m.fill(0)
  _m.beginShape()
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 360
    const rr = r * (1 + 0.32 * (noise(i * 0.55, 11.3) - 0.5) * 2)
    _m.vertex(rr * cos(a), rr * sin(a))
  }
  _m.endShape(CLOSE)
}

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))

  RADII.forEach((r) => {
    brush.add(`t${r}`, {
      type: 'custom',
      weight: 4,
      scatter: 0.8,
      opacity: 60,
      spacing: 0.5,
      pressure: [0.7, 1.2, 0.7],
      tip: (_m) => raggedTip(_m, r),
      rotate: 'natural',
      markerTip: false,
      noise: 0.3,
    })
  })
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  background(PAPER)

  const x0 = width * 0.08
  const colW = (width * 0.88) / RADII.length
  const y0 = height * 0.12
  const rowH = (height * 0.8) / WEIGHTS.length

  WEIGHTS.forEach((wt, ri) => {
    RADII.forEach((r, ci) => {
      brush.set(`t${r}`, WC.PIGMENTS.indigo, wt)
      const cx = x0 + ci * colW
      const cy = y0 + ri * rowH
      brush.line(cx, cy, cx + colW * 0.62, cy)
      WC.flush()
    })
  })

  // Axis ticks so the grid can be read without labels (no font is loaded here).
  brush.set('2H', WC.PENCIL, 0.3)
  RADII.forEach((r, ci) => {
    const cx = x0 + ci * colW
    for (let k = 0; k < ci + 1; k++) brush.line(cx + k * 6, height * 0.05, cx + k * 6, height * 0.075)
  })
  WEIGHTS.forEach((wt, ri) => {
    const cy = y0 + ri * rowH
    for (let k = 0; k < ri + 1; k++) brush.line(width * 0.02, cy + k * 6, width * 0.045, cy + k * 6)
  })
  WC.flush()
}
