/**
 * plate-norm-balls — the geometry of steepest descent.
 *
 * Three unit balls over the same origin: L2 (round), L-infinity (square), L1
 * (diamond). A gradient points into them, and on each boundary the point that
 * maximises the inner product is marked. That single picture is why SGD,
 * signSGD and spectral methods take different steps from the same gradient, and
 * it is the schematic behind the Muon and Orth-Dion work.
 *
 * Hard, straight-edged forms on purpose: it is the geometric counterweight to
 * the attractor's organic one, so the two read as different subjects in the
 * same hand.
 *
 *   node scripts/paint/render.mjs sketches/plate-norm-balls.js --size 1500x1000 --seed 4
 
 * Pans: sap, ochre, sienna. Warm and dry after the hero's cool.
 */

// PAPER, BLEED and WASH arrive as globals from render.mjs (see config.js).
// PAPER is read from src/design-tokens.json, which the web page reads too - it
// used to be a hardcoded '#D9D0BE' eyeballed from a screenshot and duplicated
// across seven sketches, so it went silently wrong whenever the page's grain
// changed. There is one value now, on both sides.
const INK = '#3A2A22'
const OLIVE = '#6B7A55'  // sap
const SLATE = '#B98A46'  // ochre
const CLAY = '#A8654A'   // sienna

let P
let O // origin
let R // unit radius

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  O = { x: P.x + P.w * 0.6, y: P.y + P.h * 0.52 }
  R = P.h * 0.3
  noLoop()
}

const inL2 = (x, y) => Math.hypot(x - O.x, y - O.y) <= R
const inLinf = (x, y) => Math.abs(x - O.x) <= R * 0.78 && Math.abs(y - O.y) <= R * 0.78
const inL1 = (x, y) => Math.abs(x - O.x) + Math.abs(y - O.y) <= R * 1.02

function draw() {
  translate(-width / 2, -height / 2)
  // A mark is composited straight onto the page, so it must carry no
  // paper of its own — an opaque sheet behind it is what reads as a
  // pasted rectangle no matter how the edges are treated.
  if (TRANSPARENT) clear()
  else background(PAPER)

  const box = { x: O.x - R * 1.2, y: O.y - R * 1.2, w: R * 2.4, h: R * 2.4 }

  // Three balls need three READABLE hues. Olive/gold/clay are all warm earth
  // and stacked into one beige mass; blue against green against terracotta
  // keeps the nesting legible even where all three overlap.
  WC.fillRegion(inL2, box, { colour: SLATE, alpha: 118, r: R * 0.26, cols: 7, rows: 7, bleed: 0.5, seed: 2 })
  WC.fillRegion(inLinf, box, { colour: OLIVE, alpha: 108, r: R * 0.23, cols: 7, rows: 7, bleed: 0.5, seed: 1 })
  WC.fillRegion(inL1, box, { colour: CLAY, alpha: 116, r: R * 0.2, cols: 7, rows: 7, bleed: 0.5, seed: 3 })

  WC.flush()
  boundaries()
  gradient()
  WC.flush()
  // The plate frame belongs to a full plate. On a small mark those ticks
  // sit out in what is now empty space and read as stray lines.
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
  // no applyPaper: the page's own grain already textures this area
}

/** The three boundaries, ruled lightly over the paint. */
function boundaries() {
  brush.noFill()
  brush.noHatch()

  brush.set('2H', '#9A8570', 0.26)
  brush.circle(O.x, O.y, R)

  const s = R * 0.78
  brush.rect(O.x, O.y, s * 2, s * 2, 'center')

  const d = R * 1.02
  brush.beginShape(0)
  brush.vertex(O.x, O.y - d)
  brush.vertex(O.x + d, O.y)
  brush.vertex(O.x, O.y + d)
  brush.vertex(O.x - d, O.y)
  brush.endShape(true)

  // axes through the origin
  brush.set('2H', '#A8927C', 0.16)
  brush.line(O.x - R * 1.35, O.y, O.x + R * 1.35, O.y)
  brush.line(O.x, O.y - R * 1.35, O.x, O.y + R * 1.35)
}

/**
 * One gradient, three different steps. The argmax of <g, x> over each ball is
 * a different point, which is the whole content of the picture.
 */
function gradient() {
  const ang = -34
  const gx = cos(ang)
  const gy = sin(ang)
  const L = R * 1.3

  brush.noFill()
  brush.set('HB', '#5A4436', 0.34)
  brush.line(O.x, O.y, O.x + gx * L, O.y + gy * L)
  // arrowhead
  brush.line(O.x + gx * L, O.y + gy * L, O.x + gx * L - cos(ang - 22) * R * 0.13, O.y + gy * L - sin(ang - 22) * R * 0.13)
  brush.line(O.x + gx * L, O.y + gy * L, O.x + gx * L - cos(ang + 22) * R * 0.13, O.y + gy * L - sin(ang + 22) * R * 0.13)

  // argmax on each boundary
  const marks = [
    { x: O.x + gx * R, y: O.y + gy * R, c: SLATE },                                   // L2: along g
    { x: O.x + Math.sign(gx) * R * 0.78, y: O.y + Math.sign(gy) * R * 0.78, c: OLIVE }, // Linf: a corner
    { x: O.x + (Math.abs(gx) > Math.abs(gy) ? Math.sign(gx) * R * 1.02 : 0),
      y: O.y + (Math.abs(gx) > Math.abs(gy) ? 0 : Math.sign(gy) * R * 1.02), c: CLAY }, // L1: a vertex
  ]
  for (const m of marks) {
    WC.wet(0.25)
    brush.fill(m.c, 200)
    brush.beginShape(0.9)
    WC.blob(m.x, m.y, R * 0.045, 9, 1)()
    brush.endShape(true)
  }

  WC.flush()
  WC.leader(marks[0].x, marks[0].y, P.x + P.w * 0.93, P.y + P.h * 0.2, P.w * 0.04)
  WC.leader(marks[1].x, marks[1].y, P.x + P.w * 0.9, P.y + P.h * 0.78, P.w * 0.05)
  WC.leader(marks[2].x, marks[2].y, P.x + P.w * 0.28, P.y + P.h * 0.14, -P.w * 0.05)
}
