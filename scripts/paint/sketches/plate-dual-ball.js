/**
 * plate-dual-ball — one ball, and the point that does not sit on it.
 *
 * The rank-r Ky Fan dual ball. A steepest-descent step should land exactly on
 * its boundary: that is what it means for the dual norm to be tight. QR
 * orthogonalisation gives the polar factor, so its point sits ON the ball
 * (nu = 1). Column normalisation, which is what Dion actually does, inflates the
 * norm by up to sqrt(r), so its point pokes THROUGH the boundary - and that
 * overshoot is the whole geometric mismatch the paper removes, in one picture.
 *
 * So the drawing is built around a single comparison: two radii from the same
 * origin, one stopping at the edge and one running past it. The boundary is the
 * only thing that needs to be unambiguous, so it is the one crisp line on an
 * otherwise wet plate.
 *
 * This replaces plate-norm-balls as project 13's figure. Norm balls draws three
 * balls and answers "which geometry"; this draws one and answers "does the step
 * land on it", which is the actual result.
 *
 *   node scripts/paint/render.mjs sketches/plate-dual-ball.js \
 *     --size 1600x1100 --seed 7 --bleed
 *
 * Pans: sienna, ochre, sepia. Warm on purpose - it sits between two cool plates
 * on the front page (ultramarine task vectors, indigo shadow knowledge), and a
 * run of three cool plates is what makes a series read as one long plate.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT, BLEED */

const INK = '#3A2A22'
const PENCIL = '#8C8375'
const SIENNA = '#A8654A'
const OCHRE = '#B98A46'
const SEPIA = '#5A4436'

let P
let O // origin
let R // the ball's radius

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  O = { x: P.x + P.w * 0.42, y: P.y + P.h * 0.56 }
  R = P.h * 0.30
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  ball()
  WC.flush()
  boundary()
  steps()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/**
 * The ball, flooded wet.
 *
 * A circle is the case fillRegion is good at: the boundary moves slowly, so a
 * fixed touch radius never overruns it by much, and the soft edge it leaves is
 * exactly right - the ball is a set, and a set does not have a drawn outline.
 * The crisp boundary comes later, and only because this particular figure is
 * about whether a point is inside it.
 */
function ball() {
  const inside = (x, y) => Math.hypot(x - O.x, y - O.y) <= R
  // How much room a touch has before it would cross the edge. Without this the
  // wash spills outside the circle, which on THIS figure is not a soft edge but
  // a wrong statement: the whole claim is about which side of the boundary a
  // point lands on.
  const fit = (x, y) => R - Math.hypot(x - O.x, y - O.y)
  const box = { x: O.x - R, y: O.y - R, w: R * 2, h: R * 2 }
  WC.fillRegion(inside, box, {
    colour: OCHRE, alpha: 104, r: R * 0.24, cols: 9, rows: 9, bleed: 0.5, seed: 2, fit,
  })
  WC.fillRegion(inside, box, {
    colour: SIENNA, alpha: 80, r: R * 0.19, cols: 8, rows: 8, bleed: 0.55, seed: 7, fit,
  })
}

/** The edge. The one crisp line on the plate, because the claim is about it. */
function boundary() {
  brush.noFill()
  brush.noHatch()
  brush.set('rotring', INK, 0.6)
  brush.circle(O.x, O.y, R)
}

/**
 * The two steps.
 *
 * QR lands on the boundary; ColNorm runs past it. Drawn at the same angle so
 * nothing but the LENGTH distinguishes them - if they pointed different ways the
 * picture would suggest they choose different subspaces, and the paper's point
 * is that they choose the same one and differ only in scale.
 */
function steps() {
  const a = -21
  const onBall = { x: O.x + cos(a) * R, y: O.y + sin(a) * R }
  // sqrt(r) overshoot, drawn for r ~ 4 so it is visibly outside without
  // leaving the sheet.
  const past = { x: O.x + cos(a) * R * 1.98, y: O.y + sin(a) * R * 1.98 }

  // QR: solid, stopping exactly at the edge.
  brush.set('2B', SEPIA, 0.75)
  brush.line(O.x, O.y, onBall.x, onBall.y)

  // ColNorm: the same ray, continuing through. Dashed past the boundary only,
  // so the eye reads "this part should not exist".
  brush.set('2H', SEPIA, 0.5)
  const segs = 11
  for (let i = 0; i < segs; i++) {
    if (i % 2) continue
    const t0 = i / segs
    const t1 = (i + 1) / segs
    brush.line(
      onBall.x + (past.x - onBall.x) * t0,
      onBall.y + (past.y - onBall.y) * t0,
      onBall.x + (past.x - onBall.x) * t1,
      onBall.y + (past.y - onBall.y) * t1
    )
  }
  WC.flush()

  // A ring around the point that lands ON the edge. The comparison is the whole
  // plate, and in the first render both markers were small smudges a few pixels
  // apart at the rim - the claim was invisible. Ball smaller, ray flatter and
  // longer, markers bigger, and this ring so the eye is told where to look.
  brush.set('rotring', SEPIA, 0.42)
  brush.circle(onBall.x, onBall.y, R * 0.13)
  WC.flush()

  // The two endpoints, wet: one sitting on the line, one clearly beyond it.
  const dot = (p, colour, r) => {
    WC.wet(0.45)
    brush.fill(colour, 150)
    brush.beginShape(0.9)
    WC.blob(p.x, p.y, r, 3, 1.1)()
    brush.endShape(true)
  }
  dot(O, INK, R * 0.03)
  dot(onBall, SEPIA, R * 0.085)
  dot(past, SIENNA, R * 0.105)
  WC.flush()

  // Leaders out to the margin: one to the point on the ball, one to the one
  // outside it. No lettering - the plates in this series never carry type.
  // Two leaders, not three. The origin had one as well, and it crossed the ball
  // to reach the margin - a line through the middle of the subject, to label the
  // least interesting point on the plate.
  WC.leader(onBall.x, onBall.y, P.x + P.w * 0.88, P.y + P.h * 0.12, P.w * 0.05, INK)
  WC.leader(past.x, past.y, P.x + P.w * 0.93, P.y + P.h * 0.84, P.w * 0.05, SIENNA)
}
