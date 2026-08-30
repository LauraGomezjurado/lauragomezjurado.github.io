/**
 * plate-attribution — three explanations of the same thing, disagreeing.
 *
 * Saliency, Grad-CAM and integrated gradients all claim to say where a model
 * looked. Under distribution shift they stop agreeing, and that is the safety
 * result: an explanation you cannot reproduce with a different method is not an
 * explanation.
 *
 * So the plate is one input drawn once, with three attribution maps laid over
 * it in three pans. Where they agree the pigment doubles and darkens by itself;
 * where they do not, each sits alone on the paper. Nothing marks the
 * disagreement - it is simply visible, which is the only fair way to draw it.
 *
 *   node scripts/paint/render.mjs sketches/plate-attribution.js \
 *     --size 1500x1050 --seed 4 --bleed
 *
 * Pans: teal, rose, ochre - three that stay apart at low alpha. Two would let
 * the eye read an overlap as a third colour; three keeps them countable.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const INK = '#3A2A22'
const PENCIL = '#8C8375'

// Each map: a centre in frame coordinates, a spread, and its pan.
const MAPS = [
  { cx: 0.38, cy: 0.44, sx: 0.15, sy: 0.19, pan: '#4E7A78', alpha: 60 }, // teal
  { cx: 0.56, cy: 0.38, sx: 0.13, sy: 0.14, pan: '#B4738A', alpha: 58 }, // rose
  { cx: 0.47, cy: 0.63, sx: 0.19, sy: 0.12, pan: '#B98A46', alpha: 54 }, // ochre
]

let P
let F // the frame the input occupies

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  F = { x: P.x + P.w * 0.2, y: P.y + P.h * 0.12, w: P.w * 0.5, h: P.h * 0.72 }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  MAPS.forEach((m, i) => {
    heat(m, i)
    WC.flush()
  })
  frame()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/**
 * One attribution map as a soft heat blob.
 *
 * Gaussian falloff, and the touch alpha follows the weight rather than the
 * touch SIZE - a map is a field of importance, not a shape with an edge, and
 * sizing by weight would give it a boundary it does not have.
 */
function heat(m, idx) {
  const COLS = 26
  const ROWS = 26
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const u = (i + 0.5) / COLS
      const v = (j + 0.5) / ROWS
      const w = Math.exp(-(((u - m.cx) ** 2) / (2 * m.sx * m.sx) + ((v - m.cy) ** 2) / (2 * m.sy * m.sy)))
      if (w < 0.16) continue
      const jx = (noise(i * 1.3 + idx * 9, j * 1.7) - 0.5) * (F.w / COLS) * 1.2
      const jy = (noise(i * 2.1, j * 1.1 + idx * 5) - 0.5) * (F.h / ROWS) * 1.2
      WC.wet(0.5)
      brush.fill(m.pan, m.alpha * w)
      brush.beginShape(0.9)
      WC.blob(F.x + u * F.w + jx, F.y + v * F.h + jy, (F.w / COLS) * (1.1 + 0.7 * w), i * 7 + j + idx * 31, 1.1)()
      brush.endShape(true)
    }
  }
}

/** The input's frame, and a leader to each map's peak. */
function frame() {
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.32)
  brush.rect(F.x, F.y, F.w, F.h)

  MAPS.forEach((m, i) => {
    const x = F.x + m.cx * F.w
    const y = F.y + m.cy * F.h
    // A small ring at each claimed peak: three answers to one question.
    brush.set('rotring', m.pan, 0.4)
    brush.circle(x, y, F.w * 0.026)
    WC.leader(x, y, P.x + P.w * 0.88, P.y + P.h * (0.16 + i * 0.3), P.w * 0.045, m.pan)
  })
}
