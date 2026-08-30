/**
 * plate-hidden-objectives — do two concealed objectives share one mechanism?
 *
 * Two adapters, each trained to hide something different, drawn as two supports
 * in weight space. Where they overlap the pigment doubles and the region is
 * hatched: that intersection is the question. If concealment is one shared
 * mechanism, a probe that finds it in one adapter should find it in the other,
 * so two probes are shown converging on the same patch.
 *
 * Pans: madder, sap, sepia. Plum against green — deliberately the least
 * comfortable pairing in the box, for the least comfortable question.
 *
 *   node scripts/paint/render.mjs sketches/plate-hidden-objectives.js --size 1400x900 --seed 7
 */

// PAPER, BLEED and WASH arrive as globals from render.mjs (see config.js).
// PAPER is read from src/design-tokens.json, which the web page reads too - it
// used to be a hardcoded '#D9D0BE' eyeballed from a screenshot and duplicated
// across seven sketches, so it went silently wrong whenever the page's grain
// changed. There is one value now, on both sides.
const MADDER = '#94566A'
const SAP = '#6B7A55'
const SEPIA = '#5A4436'
const PENCIL = '#8A7663'

let P
let LA // support of adapter A
let LB // support of adapter B

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)

  const r = P.h * 0.29
  LA = { x: P.x + P.w * 0.46, y: P.y + P.h * 0.46, rx: r * 1.15, ry: r }
  LB = { x: P.x + P.w * 0.64, y: P.y + P.h * 0.56, rx: r * 1.15, ry: r }
  noLoop()
}

const inA = (x, y) => Math.pow((x - LA.x) / LA.rx, 2) + Math.pow((y - LA.y) / LA.ry, 2) <= 1
const inB = (x, y) => Math.pow((x - LB.x) / LB.rx, 2) + Math.pow((y - LB.y) / LB.ry, 2) <= 1

function draw() {
  translate(-width / 2, -height / 2)
  // A mark is composited straight onto the page, so it must carry no
  // paper of its own — an opaque sheet behind it is what reads as a
  // pasted rectangle no matter how the edges are treated.
  if (TRANSPARENT) clear()
  else background(PAPER)

  supports()
  WC.flush()
  intersection()
  WC.flush()
  outlines()
  probes()
  WC.flush()
  // The plate frame belongs to a full plate. On a small mark those ticks
  // sit out in what is now empty space and read as stray lines.
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
  // no applyPaper: the page's own grain already textures this area
}

/** Each adapter's support, flooded so the boundary stays soft. */
function supports() {
  const boxOf = (L) => ({ x: L.x - L.rx, y: L.y - L.ry, w: L.rx * 2, h: L.ry * 2 })
  WC.fillRegion(inA, boxOf(LA), { colour: MADDER, alpha: 76, r: P.h * 0.075, cols: 7, rows: 7, bleed: 0.5, seed: 3 })
  WC.fillRegion(inB, boxOf(LB), { colour: SAP, alpha: 76, r: P.h * 0.075, cols: 7, rows: 7, bleed: 0.5, seed: 11 })
}

/**
 * The overlap: doubled pigment plus hatching, the plate-figure way of marking
 * a region under examination. This is the only hatched area in the series, so
 * it carries weight.
 */
function intersection() {
  const both = (x, y) => inA(x, y) && inB(x, y)
  const box = {
    x: Math.max(LA.x - LA.rx, LB.x - LB.rx),
    y: Math.max(LA.y - LA.ry, LB.y - LB.ry),
    w: Math.min(LA.x + LA.rx, LB.x + LB.rx) - Math.max(LA.x - LA.rx, LB.x - LB.rx),
    h: Math.min(LA.y + LA.ry, LB.y + LB.ry) - Math.max(LA.y - LA.ry, LB.y - LB.ry),
  }
  WC.fillRegion(both, box, { colour: SEPIA, alpha: 58, r: P.h * 0.05, cols: 7, rows: 7, bleed: 0.4, seed: 21 })

  // hatch the lens itself
  brush.noStroke()
  brush.fill(SEPIA, 26)
  brush.fillBleed(0.1, 'out')
  brush.fillTexture(0.4, 0.2)
  brush.hatchStyle('2H', SEPIA, 0.3)
  brush.hatch(P.h / 26, 40, { rand: 0.14 })
  brush.beginShape(0.9)
  lensPath()
  brush.endShape(true)
  brush.noHatch()
  brush.noFill()
}

/** Approximate the lens by walking angles around each ellipse and keeping the overlap. */
function lensPath() {
  const pts = []
  for (const [L, other] of [[LA, inB], [LB, inA]]) {
    for (let a = 0; a < 360; a += 5) {
      const x = L.x + cos(a) * L.rx
      const y = L.y + sin(a) * L.ry
      if (other(x, y)) pts.push({ x, y, a: degrees(Math.atan2(y - (LA.y + LB.y) / 2, x - (LA.x + LB.x) / 2)) })
    }
  }
  pts.sort((p, q) => p.a - q.a)
  for (const p of pts) brush.vertex(p.x, p.y)
}

/** Faint boundaries, so the two supports remain readable as two. */
function outlines() {
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.22)
  for (const L of [LA, LB]) {
    let prev = null
    for (let a = 0; a <= 360; a += 5) {
      const p = { x: L.x + cos(a) * L.rx, y: L.y + sin(a) * L.ry }
      if (prev) brush.line(prev.x, prev.y, p.x, p.y)
      prev = p
    }
  }
}

/** Two probes, trained separately, converging on the same patch. */
function probes() {
  const target = { x: (LA.x + LB.x) / 2, y: (LA.y + LB.y) / 2 }
  const starts = [
    { x: P.x + P.w * 0.14, y: P.y + P.h * 0.16 },
    { x: P.x + P.w * 0.88, y: P.y + P.h * 0.9 },
  ]
  brush.noFill()
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i]
    brush.set('2H', i === 0 ? MADDER : SAP, 0.28)
    const tip = {
      x: target.x + (s.x - target.x) * 0.22,
      y: target.y + (s.y - target.y) * 0.22,
    }
    brush.line(s.x, s.y, tip.x, tip.y)
    const ang = degrees(Math.atan2(tip.y - s.y, tip.x - s.x))
    const h = P.h * 0.028
    brush.line(tip.x, tip.y, tip.x - cos(ang - 22) * h, tip.y - sin(ang - 22) * h)
    brush.line(tip.x, tip.y, tip.x - cos(ang + 22) * h, tip.y - sin(ang + 22) * h)
  }

  WC.flush()
  WC.leader(target.x, target.y, P.x + P.w * 0.9, P.y + P.h * 0.14, P.w * 0.05)
  WC.leader(LA.x - LA.rx * 0.7, LA.y - LA.ry * 0.6, P.x + P.w * 0.3, P.y + P.h * 0.08, -P.w * 0.06)
  WC.leader(LB.x + LB.rx * 0.7, LB.y + LB.ry * 0.5, P.x + P.w * 0.94, P.y + P.h * 0.74, P.w * 0.035)
}
