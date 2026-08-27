/**
 * attractor-plate — a field-notebook specimen plate of a Lorenz attractor.
 *
 * The site already carries an attractor as its motif and a warm-sand paper as
 * its ground; this treats the curve the way a botanist treats a cutting: pinned
 * to gridded stock, washed in, hatched, and annotated out to the margin, with a
 * magnified detail circle in the corner. Composition is weighted right, because
 * the hero text sits left.
 *
 * Palette is lifted straight from src/index.css so the plate sits *in* the page
 * rather than on top of it.
 *
 * Two calibration notes, learned the hard way from test renders:
 *   - a wash only reads as pigment above roughly alpha 130; below that
 *     p5.brush spreads it past the point of visibility.
 *   - fillTexture wants LOW values (~0.4, 0.2) for a smooth wash. High values
 *     mottle it into nothing.
 */

const PAPER = '#E6DCC8'
const INK = '#2A211A'
const CLAY = '#9C6B4F'
const OLIVE = '#6B705C'
const SLATE = '#77808C'

let M // margin
let plate // { x, y, w, h } inner rule
let curve = [] // projected attractor points

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(CANVAS_W / 460)

  M = CANVAS_W * 0.045
  plate = { x: M, y: M, w: CANVAS_W - 2 * M, h: CANVAS_H - 2 * M }
  curve = lorenz()
  noLoop()
}

/** Integrate the Lorenz system and project (x, z) into plate coordinates. */
function lorenz() {
  const s = 10
  const r = 28
  const b = 8 / 3
  const dt = 0.005
  let x = 0.9
  let y = 1.6
  let z = 22

  const cx = plate.x + plate.w * 0.66
  const cy = plate.y + plate.h * 0.48
  const scale = plate.h / 64

  const pts = []
  // Discard the transient so the trace starts already on the attractor.
  for (let i = 0; i < 600; i++) {
    const dx = s * (y - x)
    const dy = x * (r - z) - y
    const dz = x * y - b * z
    x += dx * dt
    y += dy * dt
    z += dz * dt
  }
  for (let i = 0; i < 5200; i++) {
    const dx = s * (y - x)
    const dy = x * (r - z) - y
    const dz = x * y - b * z
    x += dx * dt
    y += dy * dt
    z += dz * dt
    pts.push({ x: cx + x * scale, y: cy - (z - 25) * scale, lobe: x > 0 ? 1 : -1 })
  }
  return pts
}

function draw() {
  translate(-width / 2, -height / 2)
  background(PAPER)

  fieldGrid()
  waterStains()
  wingWash(-1, SLATE, 150)
  wingWash(1, CLAY, 168)
  wingHatch(1)
  trace()
  detailCallout()
  annotations()
  scaleBar()
  edgeTicks()
  plateEdge()
}

/* ── the specimen's silhouette ─────────────────────────────────────────────
 * Each lobe gets a wing-shaped outline: bin the lobe's points by angle about
 * its centroid and keep the farthest one per bin. A circle would have been
 * easier and would have looked like a stain, not like the thing on the page.
 */
function lobeCentroid(side) {
  let sx = 0
  let sy = 0
  let n = 0
  for (const p of curve) {
    if (p.lobe !== side) continue
    sx += p.x
    sy += p.y
    n++
  }
  return { x: sx / n, y: sy / n }
}

function lobeOutline(side, bins = 26) {
  const c = lobeCentroid(side)
  const far = new Array(bins).fill(null)
  for (const p of curve) {
    if (p.lobe !== side) continue
    const dx = p.x - c.x
    const dy = p.y - c.y
    const a = (degrees(Math.atan2(dy, dx)) + 360) % 360
    const k = Math.floor((a / 360) * bins) % bins
    const d = Math.hypot(dx, dy)
    if (!far[k] || d > far[k].d) far[k] = { x: p.x, y: p.y, d }
  }
  // Push each vertex out a touch so the wash sits just proud of the trace.
  return far.filter(Boolean).map((p) => ({
    x: c.x + (p.x - c.x) * 1.1,
    y: c.y + (p.y - c.y) * 1.1,
  }))
}

/** Faint gridded stock: minor rule every cell, a firmer rule every fifth. */
function fieldGrid() {
  const cell = plate.h / 14
  brush.noFill()
  brush.noHatch()

  brush.set('2H', '#8C8375', 0.06)
  let n = 0
  for (let x = plate.x; x <= plate.x + plate.w + 1; x += cell, n++) {
    if (n % 5 !== 0) brush.line(x, plate.y, x, plate.y + plate.h)
  }
  n = 0
  for (let y = plate.y; y <= plate.y + plate.h + 1; y += cell, n++) {
    if (n % 5 !== 0) brush.line(plate.x, y, plate.x + plate.w, y)
  }

  brush.set('2H', '#8C8375', 0.11)
  n = 0
  for (let x = plate.x; x <= plate.x + plate.w + 1; x += cell, n++) {
    if (n % 5 === 0) brush.line(x, plate.y, x, plate.y + plate.h)
  }
  n = 0
  for (let y = plate.y; y <= plate.y + plate.h + 1; y += cell, n++) {
    if (n % 5 === 0) brush.line(plate.x, y, plate.x + plate.w, y)
  }
}

/** Age: a few soft blooms where the page once got damp. */
function waterStains() {
  brush.noStroke()
  brush.noHatch()
  brush.fillTexture(0.8, 0.85)
  brush.fillBleed(0.5, 'out')

  brush.fill(CLAY, 90)
  brush.circle(plate.x + plate.w * 0.11, plate.y + plate.h * 0.19, plate.h * 0.15, 0.3)
  brush.circle(plate.x + plate.w * 0.95, plate.y + plate.h * 0.84, plate.h * 0.12, 0.25)

  brush.fill(OLIVE, 70)
  brush.circle(plate.x + plate.w * 0.26, plate.y + plate.h * 0.9, plate.h * 0.1, 0.2)
  brush.circle(plate.x + plate.w * 0.05, plate.y + plate.h * 0.64, plate.h * 0.07, 0.15)
}

/** A wet wash laid into one wing, under the trace. */
function wingWash(side, colour, alpha) {
  const outline = lobeOutline(side)
  brush.noStroke()
  brush.noHatch()
  brush.fillTexture(0.45, 0.25)
  brush.fillBleed(0.28, 'out')
  brush.fill(colour, alpha)
  brush.beginShape(0.9)
  for (const p of outline) brush.vertex(p.x, p.y)
  brush.endShape(true)
}

/** One wing hatched, the way a plate figure marks a sectioned specimen. */
function wingHatch(side) {
  const outline = lobeOutline(side)
  brush.noStroke()
  brush.fill(CLAY, 40)
  brush.fillBleed(0.1, 'out')
  brush.fillTexture(0.45, 0.25)
  brush.hatchStyle('2H', INK, 0.38)
  brush.hatch(plate.h / 18, 38, { rand: 0.14 })
  brush.beginShape(0.9)
  for (const p of outline) brush.vertex(p.x, p.y)
  brush.endShape(true)
  brush.noHatch()
  brush.noFill()
}

/**
 * The specimen itself. Drawn as many short pencil segments rather than one long
 * stroke, so the bristle texture re-seeds along the path and the dense inner
 * windings read as woven rather than solid.
 */
function trace() {
  brush.noFill()
  brush.noHatch()

  const step = 3
  for (let i = 0; i < curve.length - step; i += step) {
    const a = curve[i]
    const b = curve[i + step]
    const t = i / curve.length
    const weight = 0.13 + 0.13 * noise(i * 0.004)
    if (i % 21 === 0) brush.set('HB', INK, weight * 1.4)
    else brush.set('2H', t < 0.5 ? INK : '#6E4B36', weight)
    brush.line(a.x, a.y, b.x, b.y)
  }
}

/**
 * Magnified detail circle, lower left: the classic plate device. A short window
 * of the trajectory near the crossover, blown up 5x, with the two sight lines
 * back to the region it was taken from.
 */
function detailCallout() {
  const cx = plate.x + plate.w * 0.16
  const cy = plate.y + plate.h * 0.66
  const R = plate.h * 0.17
  const mag = 3.6
  // A contiguous slice of the trajectory, so the magnified view is one
  // continuous swirl rather than disconnected stabs from all over the curve.
  const i0 = Math.floor(curve.length * 0.34)
  const span = 320
  const src = curve[i0 + Math.floor(span / 2)]

  // Sight lines from the sampled region out to the detail circle.
  brush.noFill()
  brush.noHatch()
  brush.set('2H', INK, 0.16)
  brush.line(src.x - R / mag, src.y - R / mag, cx, cy - R)
  brush.line(src.x - R / mag, src.y + R / mag, cx, cy + R)
  brush.set('2H', INK, 0.2)
  brush.circle(src.x, src.y, R / mag)

  // A pale ground so the magnified trace has something to sit on.
  brush.noStroke()
  brush.fillTexture(0.45, 0.25)
  brush.fillBleed(0.14, 'out')
  brush.fill(SLATE, 55)
  brush.circle(cx, cy, R * 0.98, 0.06)

  // The magnified window, clipped by hand to the circle.
  brush.noFill()
  brush.set('2H', INK, 0.22)
  for (let i = i0; i < i0 + span; i++) {
    const a = { x: cx + (curve[i].x - src.x) * mag, y: cy + (curve[i].y - src.y) * mag }
    const b = { x: cx + (curve[i + 1].x - src.x) * mag, y: cy + (curve[i + 1].y - src.y) * mag }
    if (Math.hypot(a.x - cx, a.y - cy) > R * 0.93) continue
    if (Math.hypot(b.x - cx, b.y - cy) > R * 0.93) continue
    brush.line(a.x, a.y, b.x, b.y)
  }

  brush.noFill()
  brush.set('HB', INK, 0.3)
  brush.circle(cx, cy, R)
}

/** Leader lines out to the margin, each ending in a dot and a label rule. */
function annotations() {
  brush.noFill()
  brush.noHatch()
  brush.set('2H', INK, 0.22)

  const right = lobeCentroid(1)
  const left = lobeCentroid(-1)

  leader(right.x + plate.h * 0.2, plate.y + plate.h * 0.14, plate.x + plate.w * 0.9, plate.y + plate.h * 0.06, plate.w * 0.05)
  leader(right.x + plate.h * 0.2, right.y - plate.h * 0.05, plate.x + plate.w * 0.94, plate.y + plate.h * 0.33, plate.w * 0.035)
  leader(left.x - plate.h * 0.16, left.y + plate.h * 0.12, plate.x + plate.w * 0.42, plate.y + plate.h * 0.88, -plate.w * 0.05)
  leader(right.x + plate.h * 0.04, right.y + plate.h * 0.24, plate.x + plate.w * 0.84, plate.y + plate.h * 0.92, plate.w * 0.05)
}

function leader(x1, y1, x2, y2, rule) {
  brush.line(x1, y1, x2, y2)
  brush.circle(x2, y2, plate.h * 0.005)
  brush.line(x2, y2, x2 + rule, y2)
}

/** Specimen scale bar, lower left, with a half-division tick. */
function scaleBar() {
  const x = plate.x + plate.w * 0.04
  const y = plate.y + plate.h * 0.94
  const len = plate.w * 0.11
  const t = plate.h * 0.012

  brush.noFill()
  brush.set('HB', INK, 0.3)
  brush.line(x, y, x + len, y)
  brush.line(x, y - t, x, y + t)
  brush.line(x + len / 2, y - t * 0.55, x + len / 2, y + t * 0.55)
  brush.line(x + len, y - t, x + len, y + t)
}

/** Ruled ticks along the top and left rule, like a measuring stage. */
function edgeTicks() {
  const cell = plate.h / 14
  const t = plate.h * 0.014
  brush.noFill()
  brush.set('2H', INK, 0.2)
  for (let x = plate.x, n = 0; x <= plate.x + plate.w + 1; x += cell / 2, n++) {
    brush.line(x, plate.y, x, plate.y + (n % 2 ? t * 0.5 : t))
  }
  for (let y = plate.y, n = 0; y <= plate.y + plate.h + 1; y += cell / 2, n++) {
    brush.line(plate.x, y, plate.x + (n % 2 ? t * 0.5 : t), y)
  }
}

/** Plate rule plus the darkened, ragged edge of a page that has been handled. */
function plateEdge() {
  brush.noFill()
  brush.noHatch()
  brush.set('2H', INK, 0.2)
  brush.rect(CANVAS_W / 2, CANVAS_H / 2, plate.w, plate.h, 'center')

  brush.noStroke()
  brush.fill(INK, 60)
  brush.fillBleed(0.5, 'in')
  brush.fillTexture(0.7, 0.6)
  brush.field('hand')
  const e = M * 0.4
  brush.rect(CANVAS_W / 2, e / 2, CANVAS_W, e, 'center')
  brush.rect(CANVAS_W / 2, CANVAS_H - e / 2, CANVAS_W, e, 'center')
  brush.rect(e / 2, CANVAS_H / 2, e, CANVAS_H, 'center')
  brush.rect(CANVAS_W - e / 2, CANVAS_H / 2, e, CANVAS_H, 'center')
  brush.noField()
}
