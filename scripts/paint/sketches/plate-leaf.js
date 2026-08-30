/**
 * plate-leaf — a cacao leaf, and the lesion the model is looking for.
 *
 * ASOFI is on-device disease detection for cacao growers: a phone, a leaf, a
 * yes or no. Its old figure was a flowchart - leaf, arrow, phone, arrow, result
 * - which is a diagram of a deployment rather than a picture of anything.
 *
 * The subject is a diseased leaf. That is a botanical specimen, and a specimen
 * plate is the one thing this series is already built to draw: paper, a wash, a
 * pencil, a leader into the margin. Every other plate here is an abstract
 * mathematical object, so this is the one that earns its place by NOT being
 * geometry, and the series is better for having a living thing in it.
 *
 * The lesion is painted as a real bloom - pigment pooling at a dark rim and
 * drying pale in the middle - because that is both what black pod rot looks like
 * and what watercolour does when it is left alone.
 *
 *   node scripts/paint/render.mjs sketches/plate-leaf.js \
 *     --size 1500x1150 --seed 5 --bleed
 *
 * Pans: sap and olive for the blade, sepia and madder for the rot. Green is a
 * colour this series has otherwise only used structurally, never as the subject.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const INK = '#3A2A22'
const PENCIL = '#8C8375'
const SAP = '#6B7A55'
const OLIVE = '#6B705C'
const SEPIA = '#5A4436'
const MADDER = '#94566A'

let P
let L // leaf frame: centre, half-length, half-width, tilt

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  L = {
    cx: P.x + P.w * 0.46,
    cy: P.y + P.h * 0.52,
    a: P.h * 0.42, // half-length, along the midrib
    b: P.h * 0.17, // half-width
    tilt: -24,
  }
  noLoop()
}

/** Leaf-local (u along the midrib in [-1,1], v across in [-1,1]) -> page. */
function toPage(u, v) {
  const x = u * L.a
  const y = v * L.b * profile(u)
  return {
    x: L.cx + x * cos(L.tilt) - y * sin(L.tilt),
    y: L.cy + x * sin(L.tilt) + y * cos(L.tilt),
  }
}

/**
 * The blade's outline as a function of position along the midrib: broad and
 * round near the stem, drawn out to a point at the tip. A cacao leaf is not an
 * ellipse, and an ellipse is what makes a painted leaf look like a decal.
 */
function profile(u) {
  // t must be clamped before the fractional power: Math.pow(negative, 0.78) is
  // NaN, and the petiole is drawn from u = -1.16, outside the blade. That NaN
  // propagated into the midrib's start point and brush.line() silently drew
  // nothing - the leaf rendered with no midrib at all and no error anywhere.
  const t = Math.max(0, Math.min(1, (u + 1) / 2)) // 0 at stem, 1 at tip
  return Math.sin(Math.PI * Math.pow(t, 0.78)) ** 0.85
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  blade()
  WC.flush()
  lesion()
  WC.flush()
  veins()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/**
 * The blade.
 *
 * Walked along the midrib rather than flooded through a grid, so each touch is
 * sized by the local half-width and can never spill past the outline - the same
 * correction the loss-gap plate needed. Two pans, alternating, so the green
 * stays alive instead of flattening to one filtered colour.
 */
function blade() {
  const STEPS = 54
  for (let i = 0; i <= STEPS; i++) {
    const u = -1 + (i / STEPS) * 2
    const halfV = profile(u)
    if (halfV < 0.02) continue
    const rows = Math.max(1, Math.round(halfV * 5))
    for (let k = 0; k < rows; k++) {
      const v = -halfV + ((k + 0.5) / rows) * halfV * 2
      const p = toPage(u, v / Math.max(halfV, 0.001))
      const room = (halfV * 2 * L.b) / rows
      const r = room * (0.62 + 0.3 * noise(i * 1.7, k * 2.1))
      WC.wet(0.55)
      // Older tissue toward the stem, newer green toward the tip.
      const pan = (i + k) % 3 === 0 ? OLIVE : SAP
      brush.fill(pan, 62 + noise(i * 0.9, k) * 40)
      brush.beginShape(0.9)
      WC.blob(p.x, p.y, r, i * 5 + k, 1.2)()
      brush.endShape(true)
    }
  }
}

/**
 * The lesion: a bloom, not a blot.
 *
 * Rot spreads from a point and dries with its pigment carried to the edge, so
 * this is painted as a pale centre inside a darker rim - which is exactly what
 * a wash does if it is flooded and then left. The shape is deliberately not
 * centred on the midrib; disease does not respect symmetry, and a centred blot
 * reads as a design element.
 */
function lesion() {
  const cu = 0.34
  const cv = 0.42
  const c = toPage(cu, cv)
  const R = L.b * 0.72

  // The body, thinning toward the middle.
  for (let i = 0; i < 40; i++) {
    const a = noise(i * 1.1) * 360
    const d = R * (0.15 + 0.8 * noise(i * 2.3))
    const x = c.x + cos(a) * d
    const y = c.y + sin(a) * d * 0.82
    const edge = d / R
    WC.wet(0.6)
    brush.fill(i % 4 === 0 ? MADDER : SEPIA, 40 + edge * 95)
    brush.beginShape(0.9)
    WC.blob(x, y, R * (0.1 + 0.16 * noise(i * 3.7)), i * 3, 1.15)()
    brush.endShape(true)
  }
  WC.flush()

  // The rim, where the pigment ended up.
  WC.wet(0.35)
  brush.fill(SEPIA, 120)
  brush.beginShape(0.9)
  for (let i = 0; i <= 44; i++) {
    const a = (i / 44) * 360
    const rr = R * (0.86 + 0.16 * noise(i * 0.7, 9))
    brush.vertex(c.x + cos(a) * rr, c.y + sin(a) * rr * 0.82)
  }
  brush.endShape(true)
  WC.flush()

  WC.leader(c.x, c.y, P.x + P.w * 0.9, P.y + P.h * 0.2, P.w * 0.05, INK)
}

/** Midrib and secondaries, in pencil over the dry wash. */
function veins() {
  brush.noFill()
  brush.noHatch()
  brush.set('2B', PENCIL, 0.55)

  // Midrib, and the petiole running out past the stem. Drawn in two weights:
  // a midrib is thicker than the veins that leave it.
  const stem = toPage(-1.16, 0)
  const tip = toPage(1, 0)
  brush.line(stem.x, stem.y, tip.x, tip.y)
  brush.set('2B', PENCIL, 0.34)

  // Secondaries: alternate sides, sweeping toward the tip.
  for (let i = 1; i <= 7; i++) {
    const u = -0.78 + (i / 8) * 1.6
    const side = i % 2 ? 1 : -1
    const base = toPage(u, 0)
    const end = toPage(u + 0.26, side * 0.94)
    const mid = toPage(u + 0.1, side * 0.5)
    brush.line(base.x, base.y, mid.x, mid.y)
    brush.line(mid.x, mid.y, end.x, end.y)
  }
}
