/**
 * attractor-plate-wet — the Lorenz specimen, painted wet.
 *
 * The first plate was mostly drawing with a little colour behind it. This one
 * inverts that: the paint carries the image, the pencil only annotates it. The
 * wetness comes from WC (see watercolour.js) — high bleed, several translucent
 * passes per shape, pigment pooling at the rims, and a cold-press tooth
 * multiplied over the whole sheet at the end.
 *
 *   node scripts/paint/render.mjs sketches/attractor-plate-wet.js \
 *     --size 2400x1500 --seed 6 --out public/images/art/attractor-plate-wet.png
 
 * Pans: indigo, madder, teal. Cool and deep — the page opens in shadow.
 */

const PAPER = '#E9E0CE'
const INK = '#3A2A22'
const CLAY = '#94566A'   // madder
const PLUM = '#455571'   // indigo
const SLATE = '#4E7A78'  // teal
const OLIVE = '#6B705C'

let plate
let curve = []

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  // One scale for the whole sketch, and CAPPED. Brush size sets how fine the
  // bleed is, so letting it grow with resolution makes the blooms coarse and
  // the touches stop merging into a wash. Shapes still scale with the plate.
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))

  const m = CANVAS_W * 0.05
  plate = { x: m, y: m, w: CANVAS_W - 2 * m, h: CANVAS_H - 2 * m }
  curve = lorenz()
  noLoop()
}

function lorenz() {
  const s = 10
  const r = 28
  const b = 8 / 3
  const dt = 0.005
  let x = 0.9
  let y = 1.6
  let z = 22

  const cx = plate.x + plate.w * 0.63
  const cy = plate.y + plate.h * 0.5
  const scale = plate.h / 48

  const pts = []
  for (let i = 0; i < 600; i++) {
    x += s * (y - x) * dt
    y += (x * (r - z) - y) * dt
    z += (x * y - b * z) * dt
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

function centroid(side) {
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

/** Wing silhouette: farthest trajectory point per angular bin about the lobe. */
function wing(side, bins = 30, swell = 1) {
  const c = centroid(side)
  const far = new Array(bins).fill(null)
  for (const p of curve) {
    if (p.lobe !== side) continue
    const a = (degrees(Math.atan2(p.y - c.y, p.x - c.x)) + 360) % 360
    const k = Math.floor((a / 360) * bins) % bins
    const d = Math.hypot(p.x - c.x, p.y - c.y)
    if (!far[k] || d > far[k].d) far[k] = { x: p.x, y: p.y, d }
  }
  const pts = far.filter(Boolean)
  return (jitter = 0) => {
    for (const p of pts) {
      // Each pass wanders slightly, so the layers do not stack into one edge.
      const j = 1 + jitter * 0.05 * (noise(p.x * 0.01, p.y * 0.01) - 0.5)
      brush.vertex(c.x + (p.x - c.x) * swell * j, c.y + (p.y - c.y) * swell * j)
    }
  }
}

function draw() {
  translate(-width / 2, -height / 2)
  // A mark is composited straight onto the page, so it must carry no
  // paper of its own — an opaque sheet behind it is what reads as a
  // pasted rectangle no matter how the edges are treated.
  if (TRANSPARENT) clear()
  else background(PAPER)

  groundWashes()
  WC.flush()
  // Drawing first, paint over it: the trace should sit inside the wash, not on
  // top of it. A second light pass after the glaze brings back definition.
  trace()
  WC.flush()
  wings()
  WC.flush()
  glaze()
  WC.flush()
  annotation()
  if (!TRANSPARENT) WC.applyPaper(20)
}

/** Big, almost-invisible washes so the sheet is never flat behind the subject. */
function groundWashes() {
  WC.wet(0.6, 0.5, 0.25)
  // Warm and faint. An olive blob out in the empty margin reads as a dirty
  // sheet, not as atmosphere, so these sit behind the subject.
  brush.fill(CLAY, 40)
  brush.beginShape(0.9)
  WC.blob(plate.x + plate.w * 0.6, plate.y + plate.h * 0.42, plate.h * 0.46, 11, 0.85)()
  brush.endShape(true)

  brush.fill(PLUM, 30)
  brush.beginShape(0.9)
  WC.blob(plate.x + plate.w * 0.78, plate.y + plate.h * 0.68, plate.h * 0.3, 23, 0.9)()
  brush.endShape(true)

  brush.fill(OLIVE, 24)
  brush.beginShape(0.9)
  WC.blob(plate.x + plate.w * 0.34, plate.y + plate.h * 0.6, plate.h * 0.26, 37, 0.8)()
  brush.endShape(true)
}

/**
 * The two lobes. Each is built from several translucent passes in related hues
 * rather than one flat fill, then rimmed with pooled pigment.
 */
function wings() {
  paintLobe(-1, [SLATE, PLUM, OLIVE])
  paintLobe(1, [CLAY, PLUM, OLIVE])

  // Where the lobes meet, the two washes run together and darken.
  const l = centroid(-1)
  const r = centroid(1)
  WC.wet(0.55)
  brush.fill(INK, 60)
  brush.beginShape(0.9)
  WC.blob((l.x + r.x) / 2, (l.y + r.y) / 2 + plate.h * 0.06, plate.h * 0.11, 51, 1.1)()
  brush.endShape(true)
}

/** An elongated touch of the brush, laid down along a direction. */
function touch(cx, cy, r, angle, colour, alpha, bleed, seed, squash = 0.5) {
  WC.wet(bleed)
  brush.fill(colour, alpha)
  push()
  translate(cx, cy)
  rotate(angle)
  brush.beginShape(0.9)
  WC.blob(0, 0, r, seed, squash)()
  brush.endShape(true)
  pop()
}

/**
 * A lobe painted by following the trajectory itself.
 *
 * Ringing the rim left the wings hollow, and a single filled hull had a hard
 * inner edge. Laying touches ALONG the spiral does both jobs at once: the paint
 * fills the wing because the curve does, and it picks up the wing's twist for
 * free. Alpha stays low because dozens of these overlap.
 */
function paintLobe(side, [base, mid, accent]) {
  const pts = []
  for (const p of curve) if (p.lobe === side) pts.push(p)

  const N = 40
  for (let i = 0; i < N; i++) {
    const idx = Math.floor((pts.length * (i + 0.5)) / N)
    const p = pts[idx]
    const q = pts[Math.min(pts.length - 1, idx + 8)]
    const ang = degrees(Math.atan2(q.y - p.y, q.x - p.x))
    const colour = i % 4 === 0 ? mid : base
    touch(
      p.x,
      p.y,
      plate.h * (0.065 + 0.04 * noise(i * 1.3, side)),
      ang,
      colour,
      104,
      0.45,
      i * 7 + side * 31,
      0.5
    )
  }

  // Two deeper drops near the eye of the spiral, where pigment collects.
  const c = centroid(side)
  touch(c.x, c.y, plate.h * 0.08, 20, base, 120, 0.4, 91 + side, 0.85)
  touch(c.x - plate.h * 0.03, c.y + plate.h * 0.04, plate.h * 0.06, -30, accent, 74, 0.55, 77 + side, 0.9)
}

/** N points around the lobe rim, farthest trajectory point per angular bin. */
function wingPoints(side, n) {
  const c = centroid(side)
  const far = new Array(n).fill(null)
  for (const p of curve) {
    if (p.lobe !== side) continue
    const a = (degrees(Math.atan2(p.y - c.y, p.x - c.x)) + 360) % 360
    const k = Math.floor((a / 360) * n) % n
    const d = Math.hypot(p.x - c.x, p.y - c.y)
    if (!far[k] || d > far[k].d) far[k] = { x: p.x, y: p.y, d }
  }
  return far.filter(Boolean)
}

/** The trajectory itself, drawn fine over dry paint. */
function trace() {
  brush.noFill()
  brush.noHatch()
  // Broken and faint on purpose. A continuous dark line reads as a technical
  // drawing sitting on the paint; skipping segments lets the wash carry the
  // image and leaves the pencil as a suggestion of structure.
  const step = 3
  for (let i = 0; i < curve.length - step; i += step) {
    if (noise(i * 0.09) < 0.42) continue
    const a = curve[i]
    const b = curve[i + step]
    const t = i / curve.length
    brush.set('2H', t < 0.5 ? '#A2907E' : '#B09079', 0.06 + 0.06 * noise(i * 0.004))
    brush.line(a.x, a.y, b.x, b.y)
  }
}

/**
 * A final translucent wash over each lobe. Laid on after the trace, it sinks
 * the pencil into the paint so the line work reads as part of the painting
 * rather than as a diagram resting on top of it.
 */
function glaze() {
  for (const side of [-1, 1]) {
    const c = centroid(side)
    const colour = side === 1 ? CLAY : SLATE
    touch(c.x, c.y + plate.h * 0.02, plate.h * 0.2, side === 1 ? -22 : 22, colour, 62, 0.6, 205 + side, 0.9)
  }
}

/** Just enough notation to keep it a specimen rather than a decoration. */
function annotation() {
  const r = centroid(1)
  const l = centroid(-1)

  brush.noFill()
  brush.noHatch()
  brush.set('2H', '#8A7663', 0.22)

  leader(r.x + plate.h * 0.22, plate.y + plate.h * 0.16, plate.x + plate.w * 0.93, plate.y + plate.h * 0.08, plate.w * 0.04)
  leader(r.x + plate.h * 0.2, r.y + plate.h * 0.02, plate.x + plate.w * 0.95, plate.y + plate.h * 0.4, plate.w * 0.03)
  leader(l.x - plate.h * 0.18, l.y + plate.h * 0.1, plate.x + plate.w * 0.3, plate.y + plate.h * 0.86, -plate.w * 0.06)

  // scale bar
  const sx = plate.x + plate.w * 0.05
  const sy = plate.y + plate.h * 0.93
  const len = plate.w * 0.1
  const t = plate.h * 0.011
  brush.set('HB', '#8A7663', 0.28)
  brush.line(sx, sy, sx + len, sy)
  brush.line(sx, sy - t, sx, sy + t)
  brush.line(sx + len / 2, sy - t * 0.5, sx + len / 2, sy + t * 0.5)
  brush.line(sx + len, sy - t, sx + len, sy + t)
}

function leader(x1, y1, x2, y2, rule) {
  brush.line(x1, y1, x2, y2)
  brush.circle(x2, y2, plate.h * 0.005)
  brush.line(x2, y2, x2 + rule, y2)
}
