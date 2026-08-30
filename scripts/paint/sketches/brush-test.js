/**
 * brush-test — a specimen card for the custom brushes in brushes.js.
 *
 * This exists to settle the open question in README.md: whether a custom `tip`
 * actually renders. Each row draws the same three strokes with a different
 * brush, so a failed tip shows up as an empty row rather than as a subtly wrong
 * plate three hours later.
 *
 *   node scripts/paint/render.mjs sketches/brush-test.js --size 1000x760 --seed 3
 */
/* global brush, WC, registerBrushes, CANVAS_W, CANVAS_H, SEED, PAPER */

// [name, note, weight]. The weight is explicit because brush.set()'s third
// argument OVERRIDES whatever weight the brush was registered with - so a
// brush's registered weight is only a default, and the call site is what
// actually decides scale. Tip radius is what carries character.
const ROWS = [
  ['wash', 'custom tip, broad + soft', 3.5],
  ['wet-edge', 'custom tip, granular pool', 11],
  ['dry', 'custom tip, broken/scratchy', 13],
  ['pastel', 'built-in, for comparison', 3],
  ['charcoal', 'built-in, for comparison', 3],
  ['2B', 'built-in, for comparison', 3],
]

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  registerBrushes()
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  background(PAPER)

  const pigs = [WC.PIGMENTS.indigo, WC.PIGMENTS.sienna, WC.PIGMENTS.sap]
  const left = width * 0.2
  const right = width * 0.94
  const top = height * 0.1
  const gap = (height * 0.84) / ROWS.length

  ROWS.forEach(([name, label, wt], i) => {
    const y = top + i * gap

    // Label in p5's own text: p5.brush draws no type.
    push()
    noStroke()
    fill(58, 54, 50)
    textSize(width * 0.016)
    textAlign(RIGHT, CENTER)
    text(name, left - width * 0.02, y)
    fill(58, 54, 50, 120)
    textSize(width * 0.011)
    text(label, left - width * 0.02, y + gap * 0.26)
    pop()
    WC.flush()

    // Three passes so overlap is visible - that is where spectral.js pigment
    // mixing shows itself, and where a tip that only draws once would give
    // itself away.
    pigs.forEach((pig, j) => {
      brush.set(name, pig, wt)
      const yy = y + (j - 1) * (gap * 0.1)
      brush.beginStroke('curve', left, yy)
      const span = right - left
      brush.move(6 - j * 5, span * 0.34, 1.0)
      brush.move(-8 + j * 6, span * 0.34, 0.85)
      brush.endStroke(4 - j * 4, 0.5)
    })
    WC.flush()
  })

  // A block of each brush filled solid, to read the texture rather than the line.
  const bx = width * 0.2
  const bw = (right - bx) / ROWS.length
  ROWS.forEach(([name, , wt], i) => {
    brush.set(name, WC.PIGMENTS.payne, wt * 0.8)
    brush.noFill()
    for (let k = 0; k < 22; k++) {
      const x = bx + i * bw + bw * 0.08
      const yy = height * 0.94 - k * (height * 0.0022)
      brush.line(x, yy, x + bw * 0.78, yy)
    }
    WC.flush()
  })
}
