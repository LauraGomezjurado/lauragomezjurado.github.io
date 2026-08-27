/**
 * plate-loss-basin — a loss surface with a saddle, and the path down it.
 *
 * Contours of an actual function, f(x,y) = (x^2 - 1)^2 + 2y^2 - xy, so the
 * level sets are real rather than decorative: two basins separated by a saddle.
 * A trajectory is integrated down the gradient from a poor initialisation, and
 * streamlines show the field it fell through.
 *
 * Soft, concentric and directional. It fills a page more evenly than the other
 * plates, which makes it the natural one to sit behind text.
 *
 *   node scripts/paint/render.mjs sketches/plate-loss-basin.js --size 1500x950 --seed 8
 
 * Pans: payne's grey, rose, olive. The most muted selection, because this
 * is the plate that sits behind type.
 */

const PAPER = '#E9E0CE'
const INK = '#3A2A22'
const SLATE = '#6E7C92'  // payne
const OLIVE = '#6B705C'  // olive
const CLAY = '#B4738A'   // rose

let P
let view // maps function space -> page

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  view = {
    cx: P.x + P.w * 0.54,
    cy: P.y + P.h * 0.5,
    s: P.h * 0.3, // pixels per unit
  }
  noLoop()
}

const f = (x, y) => Math.pow(x * x - 1, 2) + 2 * y * y - x * y
const gradf = (x, y) => ({ gx: 4 * x * (x * x - 1) - y, gy: 4 * y - x })
const toPage = (x, y) => ({ x: view.cx + x * view.s, y: view.cy - y * view.s })

function draw() {
  translate(-width / 2, -height / 2)
  background(PAPER)

  basinWashes()
  WC.flush()
  contours()
  streamlines()
  descentPath()
  WC.flush()
  WC.cornerTicks(P)
  WC.scaleBar(P)
  WC.applyPaper(20)
}

/** Wet pools in the two minima, so the low ground reads as low. */
function basinWashes() {
  for (const [mx, my, colour] of [
    [-1.02, -0.25, SLATE],
    [1.02, 0.25, CLAY],
  ]) {
    const c = toPage(mx, my)
    for (let k = 0; k < 4; k++) {
      WC.wet(0.6 - k * 0.1)
      brush.fill(colour, 84 + k * 20)
      brush.beginShape(0.9)
      WC.blob(c.x, c.y, view.s * (0.72 - k * 0.13), k * 11 + mx * 10, 0.8)()
      brush.endShape(true)
    }
  }

  // a faint ridge over the saddle, in a third hue
  const s = toPage(0, 0)
  WC.wet(0.7)
  brush.fill(OLIVE, 40)
  brush.beginShape(0.9)
  WC.blob(s.x, s.y, view.s * 0.42, 77, 1.5)()
  brush.endShape(true)
}

/**
 * Level sets traced by marching around each contour: for each level, walk a
 * ring of angles about a basin and solve outward for f = level. Rough, but it
 * follows the real function rather than drawing decorative ovals.
 */
function contours() {
  brush.noFill()
  brush.noHatch()
  const levels = [0.12, 0.4, 0.9, 1.7, 2.9, 4.4]

  for (let li = 0; li < levels.length; li++) {
    const L = levels[li]
    brush.set('2H', li < 2 ? '#8A7663' : '#A08B76', 0.22 - li * 0.015)
    for (const [mx, my] of [[-1.02, -0.25], [1.02, 0.25]]) {
      let prev = null
      for (let a = 0; a <= 360; a += 6) {
        // march outward from the minimum until f exceeds the level
        let r = 0.02
        let hit = null
        while (r < 2.4) {
          const x = mx + cos(a) * r
          const y = my + sin(a) * r
          if (f(x, y) >= L) {
            hit = toPage(x, y)
            break
          }
          r += 0.02
        }
        if (hit && prev && Math.hypot(hit.x - prev.x, hit.y - prev.y) < view.s * 0.5) {
          brush.line(prev.x, prev.y, hit.x, hit.y)
        }
        prev = hit
      }
    }
  }
}

/** Short streamlines of -grad f, showing which way the surface falls. */
function streamlines() {
  brush.noFill()
  brush.set('2H', '#9A8570', 0.18)
  for (let i = 0; i < 26; i++) {
    let x = -1.9 + 3.8 * noise(i * 3.7)
    let y = -1.2 + 2.4 * noise(i * 2.3 + 40)
    let prev = toPage(x, y)
    for (let k = 0; k < 26; k++) {
      const { gx, gy } = gradf(x, y)
      const n = Math.hypot(gx, gy) || 1
      // Stop before the basin floor. Otherwise every streamline converges on
      // the same pixel and the minima become dark starbursts.
      if (n < 1.6) break
      x -= (gx / n) * 0.055
      y -= (gy / n) * 0.055
      const p = toPage(x, y)
      if (Math.hypot(p.x - prev.x, p.y - prev.y) < view.s) brush.line(prev.x, prev.y, p.x, p.y)
      prev = p
    }
  }
}

/** One trajectory, started badly, integrated down to whichever basin takes it. */
function descentPath() {
  let x = -0.62
  let y = 1.28
  const path = [toPage(x, y)]
  for (let k = 0; k < 700; k++) {
    const { gx, gy } = gradf(x, y)
    x -= gx * 0.008
    y -= gy * 0.008
    path.push(toPage(x, y))
  }

  brush.noFill()
  brush.set('HB', INK, 0.3)
  for (let i = 0; i < path.length - 1; i++) {
    brush.line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y)
  }

  // start and end marks
  WC.wet(0.25)
  brush.fill(INK, 150)
  brush.beginShape(0.9)
  WC.blob(path[0].x, path[0].y, view.s * 0.05, 3, 1)()
  brush.endShape(true)
  brush.fill(CLAY, 200)
  brush.beginShape(0.9)
  WC.blob(path[path.length - 1].x, path[path.length - 1].y, view.s * 0.055, 8, 1)()
  brush.endShape(true)

  WC.flush()
  WC.leader(path[0].x, path[0].y, P.x + P.w * 0.28, P.y + P.h * 0.11, -P.w * 0.06)
  WC.leader(toPage(0, 0).x, toPage(0, 0).y, P.x + P.w * 0.92, P.y + P.h * 0.2, P.w * 0.04)
  WC.leader(path[path.length - 1].x, path[path.length - 1].y, P.x + P.w * 0.9, P.y + P.h * 0.88, P.w * 0.05)
}
