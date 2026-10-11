/**
 * about-north-star: star trails turning about the celestial pole, over a ridge
 * of the Andes.
 *
 * A long exposure of the northern sky: every star traces an arc about the pole,
 * and every arc sweeps the SAME angle, because every star moved for the same
 * exposure time. Polaris sits about 0.7 degrees off the pole, so it draws a
 * short arc of its own. Below, jagged peaks in payne stand behind rolling
 * green hills.
 *
 * Composition: the subject occupies the left 55% of the sheet and the right
 * stays bare paper, because the About text and photographs sit there. The
 * canvas is the whole section background, so nothing ends in a hard edge.
 *
 *   node scripts/paint/render.mjs sketches/about-north-star.js \
 *     --size 2400x1650 --seed 3 --out public/images/art/about-north-star.png
 *
 * Three weights of trail, chosen on a swatch card:
 *   - wet streaks: round touches spaced at 0.9 of their radius, so they merge
 *     into one stroke (spaced at 2r they read as a chain of beads, and long
 *     thin ellipses do not render at all);
 *   - pastel bands: grainy, like granulating pigment;
 *   - coloured pencil: the faint majority.
 *
 * Do not name a helper after a p5 global (smooth, arc, ...): it replaces p5's
 * own function and the render comes out blank in a few seconds.
 *
 * Pans: payne (the night), ochre (starlight and the dusk glow), sap (the ridge).
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const PAYNE = '#6E7C92'
const INDIGO = '#455571'
const OCHRE = '#B98A46'
const SIENNA = '#A8654A'
const SAP = '#6B7A55'

// Every trail sweeps this angle (degrees): one exposure, one rotation.
const SWEEP = 58

let W, H, pole, stars

// The five wet streaks, placed by hand: radius as a fraction of H, start angle,
// colour, width as a fraction of H.
const HERO_TRAILS = [
  [0.11, 232, OCHRE, 0.007],
  [0.18, 150, PAYNE, 0.007],
  [0.24, 250, SIENNA, 0.006],
  [0.3, 190, INDIGO, 0.008],
  [0.36, 286, PAYNE, 0.006],
]

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  W = CANVAS_W
  H = CANVAS_H
  pole = { x: W * 0.26, y: H * 0.38 }
  stars = makeStars()
  noLoop()
}

/**
 * Background stars at radius r from the pole. Density grows with r (each ring's
 * area grows with r) and brightness follows a steep power law. Each star gets
 * its own fade threshold so the trails thin out toward the text unevenly
 * instead of stopping along one vertical line.
 */
function makeStars() {
  const out = []
  for (let i = 0; i < 200; i++) {
    out.push({
      r: H * (0.05 + 0.95 * Math.sqrt(random())),
      a0: random(0, 360),
      mag: Math.pow(random(), 3.2),
      hue: random(),
      cut: random(0.05, 0.6),
    })
  }
  return out
}

/** How much paint a point may carry: 1 in the subject's half, 0 under the text. */
function room(x, y) {
  const right = 1 - ramp(W * 0.42, W * 0.58, x)
  const bottom = 1 - ramp(H * 0.9, H * 0.995, y)
  return right * bottom
}

function ramp(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** Ridged noise: sharp peaks, rounded valleys. */
function crestOf(spec) {
  const f = spec.f * (2400 / W)
  return (x) => {
    if (spec.soft) {
      // Rolling hills: plain noise, no ridging.
      return H * spec.base - H * spec.amp * (0.8 * noise(x * f, spec.seed) + 0.2 * noise(x * f * 3, spec.seed + 9))
    }
    const a = 1 - Math.abs(2 * noise(x * f, spec.seed) - 1)
    const b = 1 - Math.abs(2 * noise(x * f * 2.7, spec.seed + 9) - 1)
    const c = noise(x * f * 7, spec.seed + 17)
    // Squaring the ridged term narrows the peaks and widens the valleys, so the
    // crest reads as rock rather than as the top of a cloud bank.
    return H * spec.base - H * spec.amp * (0.62 * a * a + 0.28 * b * b + 0.1 * c)
  }
}

const FAR = { base: 0.9, amp: 0.3, f: 0.0038, seed: 41 }
const NEAR = { base: 0.99, amp: 0.13, f: 0.0016, seed: 11, soft: true }

function horizon(x) {
  return crestOf(FAR)(x)
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  sky()
  WC.flush()
  pencilTrails()
  WC.flush()
  pastelTrails()
  WC.flush()
  heroTrails()
  WC.flush()
  ridge(FAR, PAYNE, 70)
  WC.flush()
  ridge(NEAR, SAP, 110)
  WC.flush()
  polaris()
  WC.flush()
  WC.applyPaper(20)
}

/**
 * The sky as wide horizontal bands: night across the top, thinning downward,
 * and a low band of dusk where the ridge meets it. Round washes here read as
 * clouds; flattened ones read as sky.
 */
function sky() {
  const washes = [
    [W * 0.2, H * 0.12, W * 0.32, PAYNE, 30, 3, 0.32, 0.35],
    [W * 0.28, H * 0.3, W * 0.28, INDIGO, 20, 7, 0.3, 0.35],
    [W * 0.12, H * 0.42, W * 0.22, PAYNE, 16, 17, 0.3, 0.35],
    [W * 0.24, H * 0.6, W * 0.3, OCHRE, 26, 23, 0.16, 0.25],
  ]
  for (const [x, y, r, c, a, s, sq, bl] of washes) {
    WC.wet(bl, 0.4, 0.1)
    brush.fill(c, a)
    brush.beginShape(0.9)
    WC.blob(x, y, r, s, sq)()
    brush.endShape(true)
  }
}

function starColour(s) {
  if (s.hue < 0.5) return PAYNE
  if (s.hue < 0.72) return INDIGO
  if (s.hue < 0.9) return OCHRE
  return SIENNA
}

function trailAt(r, a0, t) {
  const a = a0 + SWEEP * t
  return { x: pole.x + cos(a) * r, y: pole.y + sin(a) * r }
}

/** Walk a trail in short segments, calling fn on each one that may be painted. */
function walk(r, a0, cut, margin, fn) {
  const n = Math.max(8, Math.round((r * SWEEP * Math.PI) / 180 / 14))
  for (let k = 0; k < n; k++) {
    const p = trailAt(r, a0, k / n)
    const q = trailAt(r, a0, (k + 1) / n)
    const m = room(p.x, p.y)
    if (m < cut || p.y > horizon(p.x) - margin) continue
    fn(p, q, m, k)
  }
}

/** The faint majority, in coloured pencil, broken where the noise dips. */
function pencilTrails() {
  brush.noFill()
  brush.noHatch()
  for (const s of stars) {
    walk(s.r, s.a0, s.cut, H * 0.01, (p, q, m, k) => {
      if (noise(k * 0.3, s.r * 0.01) < 0.32) return
      brush.set('cpencil', starColour(s), (0.05 + 0.2 * s.mag) * (0.5 + 0.5 * m))
      brush.line(p.x, p.y, q.x, q.y)
    })
  }
}

/** The middle weight: grainy pastel bands on the ten brightest background stars. */
function pastelTrails() {
  brush.noFill()
  brush.noHatch()
  const mid = [...stars].sort((a, b) => b.mag - a.mag).slice(0, 10)
  for (const s of mid) {
    walk(s.r, s.a0, s.cut + 0.1, H * 0.015, (p, q, m) => {
      brush.set('pastel', starColour(s), (0.9 + 1.4 * s.mag) * m)
      brush.line(p.x, p.y, q.x, q.y)
    })
  }
}

/**
 * The five wet streaks. Round touches at 0.9r spacing merge into one stroke;
 * the touch swells slightly toward the end of the exposure, where pigment
 * collects as the brush lifts.
 */
function heroTrails() {
  HERO_TRAILS.forEach(([rf, a0, colour, wf], i) => {
    const R = H * rf
    const r0 = H * wf
    const L = (R * SWEEP * Math.PI) / 180
    const n = Math.round(L / (r0 * 0.9))
    for (let k = 0; k <= n; k++) {
      const t = k / n
      const p = trailAt(R, a0, t)
      const m = room(p.x, p.y)
      if (m < 0.2 || p.y > horizon(p.x) - H * 0.02) continue
      const r = r0 * (0.75 + 0.5 * t)
      touch(p.x, p.y, r, a0 + SWEEP * t + 90, colour, 150 * m, 0.35, i * 101 + k, 0.65)
    }
  })
}

/**
 * One ridge, painted the way a watercolourist paints mountains: one silhouette
 * shape glazed in three translucent passes, each with the crest nudged a few
 * pixels, then pigment pooled along the crest where the wash dried. The crest
 * tapers down to the ground between x = 0.4W and 0.64W, so the ridge ends in a
 * slope rather than a cut.
 */
function ridge(spec, colour, alpha) {
  const crest = crestOf(spec)
  // The base sits below the canvas; the page fades the plate's bottom edge
  // into the paper with a CSS mask, so no painted edge is ever seen there.
  const ground = H * 1.06
  const x1 = W * 0.64
  const taper = (x) => 1 - ramp(W * 0.4, x1, x)
  const top = (x, j) => {
    const y = crest(x) + H * 0.006 * j * (noise(x * 0.01, j) - 0.5)
    return ground - (ground - y) * taper(x)
  }
  const path = (j) => {
    for (let x = -W * 0.02; x <= x1; x += W * 0.008) brush.vertex(x, top(x, j))
    for (let x = x1; x >= -W * 0.02; x -= W * 0.05) {
      brush.vertex(x, ground - H * 0.03 * noise(x * 0.004, spec.seed + 4))
    }
  }
  WC.layers(path, [
    // Low bleed: a high outward bleed rounds every peak into a cauliflower edge.
    { colour, alpha: alpha * 0.7, bleed: 0.16 },
    { colour, alpha: alpha * 0.55, bleed: 0.24 },
    { colour, alpha: alpha * 0.5, bleed: 0.12 },
  ])
  WC.flush()
  WC.pool(path, colour, alpha * 0.3, 0.22)
}

/**
 * Polaris, the focal point: a soft bloom, a dense core, fine spikes in pencil,
 * and its own short arc about the true pole.
 */
function polaris() {
  const off = H * 0.014
  const c = { x: pole.x + cos(200) * off, y: pole.y + sin(200) * off }
  touch(c.x, c.y, H * 0.05, 0, OCHRE, 46, 0.6, 331, 0.9)
  touch(c.x, c.y, H * 0.011, 0, SIENNA, 190, 0.25, 341, 0.95)

  brush.noFill()
  brush.noHatch()
  brush.set('cpencil', SIENNA, 0.3)
  const L = H * 0.05
  brush.line(c.x - L, c.y, c.x + L, c.y)
  brush.line(c.x, c.y - L * 1.15, c.x, c.y + L * 1.15)
  brush.set('cpencil', OCHRE, 0.22)
  const l = L * 0.45
  brush.line(c.x - l, c.y - l, c.x + l, c.y + l)
  brush.line(c.x - l, c.y + l, c.x + l, c.y - l)

  brush.set('cpencil', SIENNA, 0.18)
  for (let k = 0; k < 6; k++) {
    const p = trailAt(off, 200, k / 6)
    const q = trailAt(off, 200, (k + 1) / 6)
    brush.line(p.x, p.y, q.x, q.y)
  }
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
