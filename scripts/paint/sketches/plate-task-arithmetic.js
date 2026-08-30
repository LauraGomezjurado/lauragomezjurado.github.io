/**
 * plate-task-arithmetic — two task vectors and their sum in weight space.
 *
 * From a base model at the origin, fine-tuning on task A and task B gives two
 * difference vectors. Adding both without further training lands at the far
 * corner of the parallelogram they span. The angle between them is the whole
 * story: near-orthogonal vectors compose cleanly, and the more they align or
 * oppose, the more adding one distorts the other — which is why a fairness
 * intervention built this way sometimes helps and sometimes backfires.
 *
 * Pans: ultramarine, rose, sepia. Cool blue against pink — a pairing no other
 * plate in the set uses.
 *
 *   node scripts/paint/render.mjs sketches/plate-task-arithmetic.js --size 1400x900 --seed 6
 */

// PAPER, BLEED and WASH arrive as globals from render.mjs (see config.js).
// PAPER is read from src/design-tokens.json, which the web page reads too - it
// used to be a hardcoded '#D9D0BE' eyeballed from a screenshot and duplicated
// across seven sketches, so it went silently wrong whenever the page's grain
// changed. There is one value now, on both sides.
const ULTRA = '#5B6E96'
const ROSE = '#B4738A'
const SEPIA = '#5A4436'
const PENCIL = '#8A7663'

let P
let O // base model
let A // theta_0 + tau_A
let B // theta_0 + tau_B
let AB // theta_0 + tau_A + tau_B

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)

  O = { x: P.x + P.w * 0.28, y: P.y + P.h * 0.76 }
  const a = { x: P.h * 0.52, y: -P.h * 0.5 }
  const b = { x: P.h * 0.62, y: -P.h * 0.12 }
  A = { x: O.x + a.x, y: O.y + a.y }
  B = { x: O.x + b.x, y: O.y + b.y }
  AB = { x: O.x + a.x + b.x, y: O.y + a.y + b.y }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  // A mark is composited straight onto the page, so it must carry no
  // paper of its own — an opaque sheet behind it is what reads as a
  // pasted rectangle no matter how the edges are treated.
  if (TRANSPARENT) clear()
  else background(PAPER)

  spannedRegion()
  WC.flush()
  vectors()
  angleArc()
  nodes()
  WC.flush()
  // The plate frame belongs to a full plate. On a small mark those ticks
  // sit out in what is now empty space and read as stray lines.
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
  // no applyPaper: the page's own grain already textures this area
}

/**
 * The parallelogram the two task vectors span, flooded rather than outlined so
 * the region reads as an area of weight space instead of a diagram.
 */
function spannedRegion() {
  // Barycentric membership: a point is inside if it is O + s*a + t*b, s,t in [0,1].
  const ax = A.x - O.x
  const ay = A.y - O.y
  const bx = B.x - O.x
  const by = B.y - O.y
  const det = ax * by - ay * bx
  const inside = (x, y) => {
    const px = x - O.x
    const py = y - O.y
    const s = (px * by - py * bx) / det
    const t = (ax * py - ay * px) / det
    return s >= 0 && s <= 1 && t >= 0 && t <= 1
  }

  const xs = [O.x, A.x, B.x, AB.x]
  const ys = [O.y, A.y, B.y, AB.y]
  const box = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  }

  WC.fillRegion(inside, box, { colour: ULTRA, alpha: 74, r: P.h * 0.07, cols: 8, rows: 8, bleed: 0.5, seed: 2 })
  WC.fillRegion(inside, box, { colour: ROSE, alpha: 62, r: P.h * 0.055, cols: 7, rows: 7, bleed: 0.45, seed: 9 })
}

/** The two task vectors, and their translates closing the parallelogram. */
function vectors() {
  brush.noFill()
  brush.noHatch()

  // the translated edges: dashed, because no training happened along them
  brush.set('2H', PENCIL, 0.2)
  dashed(A, AB)
  dashed(B, AB)

  brush.set('HB', SEPIA, 0.34)
  arrow(O, A)
  arrow(O, B)
  // the sum, drawn heavier: this is the model you actually get
  brush.set('HB', SEPIA, 0.5)
  arrow(O, AB)
}

function arrow(from, to) {
  brush.line(from.x, from.y, to.x, to.y)
  const ang = degrees(Math.atan2(to.y - from.y, to.x - from.x))
  const h = P.h * 0.028
  brush.line(to.x, to.y, to.x - cos(ang - 22) * h, to.y - sin(ang - 22) * h)
  brush.line(to.x, to.y, to.x - cos(ang + 22) * h, to.y - sin(ang + 22) * h)
}

function dashed(from, to) {
  const n = Math.round(Math.hypot(to.x - from.x, to.y - from.y) / (P.h * 0.028))
  for (let i = 0; i < n; i += 2) {
    const t1 = i / n
    const t2 = Math.min(1, (i + 1) / n)
    brush.line(
      from.x + (to.x - from.x) * t1,
      from.y + (to.y - from.y) * t1,
      from.x + (to.x - from.x) * t2,
      from.y + (to.y - from.y) * t2
    )
  }
}

/** The angle between the task vectors: the quantity the whole post turns on. */
function angleArc() {
  const a1 = degrees(Math.atan2(A.y - O.y, A.x - O.x))
  const a2 = degrees(Math.atan2(B.y - O.y, B.x - O.x))
  const r = P.h * 0.17
  brush.noFill()
  brush.set('2H', PENCIL, 0.24)
  const lo = Math.min(a1, a2)
  const hi = Math.max(a1, a2)
  let prev = null
  for (let a = lo; a <= hi; a += 4) {
    const p = { x: O.x + cos(a) * r, y: O.y + sin(a) * r }
    if (prev) brush.line(prev.x, prev.y, p.x, p.y)
    prev = p
  }
  WC.leader(O.x + cos((lo + hi) / 2) * r, O.y + sin((lo + hi) / 2) * r, P.x + P.w * 0.16, P.y + P.h * 0.42, -P.w * 0.05)
}

/** Base, the two fine-tunes, and the model you get for free. */
function nodes() {
  const dot = (p, colour, r, alpha) => {
    WC.wet(0.3)
    brush.fill(colour, alpha)
    brush.beginShape(0.9)
    WC.blob(p.x, p.y, r, p.x * 0.01, 1)()
    brush.endShape(true)
  }
  dot(O, SEPIA, P.h * 0.022, 190)
  dot(A, ULTRA, P.h * 0.03, 190)
  dot(B, ROSE, P.h * 0.03, 190)
  dot(AB, SEPIA, P.h * 0.038, 150)

  WC.flush()
  WC.leader(A.x, A.y, P.x + P.w * 0.42, P.y + P.h * 0.1, -P.w * 0.05)
  WC.leader(B.x, B.y, P.x + P.w * 0.93, P.y + P.h * 0.62, P.w * 0.04)
  WC.leader(AB.x, AB.y, P.x + P.w * 0.92, P.y + P.h * 0.14, P.w * 0.045)
}
