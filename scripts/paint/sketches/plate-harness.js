/**
 * plate-harness — a battery of trials, and the ones that fail.
 *
 * Evaluating a cybersecurity agent means running it against many scenarios and
 * caring most about where it breaks. A pass tells you nothing; a failure under
 * perturbation is the whole finding.
 *
 * So: a tray of trials, laid in a grid the way specimens are. Most are quiet
 * washes. A few are struck through, and those few are what the plate is about -
 * they are the only marks with a hard edge on it.
 *
 * This replaces the search tree, which was standing in and belongs to the
 * planner project. A harness is a grid, not a tree: the trials are independent,
 * and drawing them as a tree implies a search that is not happening.
 *
 *   node scripts/paint/render.mjs sketches/plate-harness.js \
 *     --size 1500x1000 --seed 11 --bleed
 *
 * Pans: sepia and madder. Dark and forensic - the plate about things going
 * wrong, and the only one in the series with no green or blue in it.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const INK = '#3A2A22'
const PENCIL = '#8C8375'
const SEPIA = '#5A4436'
const MADDER = '#94566A'

const COLS = 9
const ROWS = 5
// Which trials fail. Fixed rather than random so the plate is reproducible and
// so the failures cluster slightly, the way real ones do.
const FAILED = new Set(['2,1', '3,1', '6,2', '2,3', '7,0', '7,1', '4,4'])

let P
let cell

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  cell = {
    w: (P.w * 0.78) / COLS,
    h: (P.h * 0.66) / ROWS,
    x: P.x + P.w * 0.1,
    y: P.y + P.h * 0.16,
  }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  trials()
  WC.flush()
  strikes()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/** Every trial as a wash. Failures are laid heavier before being struck. */
function trials() {
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const failed = FAILED.has(`${i},${j}`)
      const cx = cell.x + (i + 0.5) * cell.w
      const cy = cell.y + (j + 0.5) * cell.h
      const r = Math.min(cell.w, cell.h) * 0.3
      const touches = failed ? 5 : 3
      for (let k = 0; k < touches; k++) {
        const jx = (noise(i * 2.3 + k, j * 1.7) - 0.5) * cell.w * 0.34
        const jy = (noise(i * 1.1, j * 2.9 + k) - 0.5) * cell.h * 0.34
        WC.wet(0.5)
        brush.fill(failed ? MADDER : SEPIA, failed ? 76 : 40 + noise(i, j) * 26)
        brush.beginShape(0.9)
        WC.blob(cx + jx, cy + jy, r * (0.7 + 0.5 * noise(i * 3 + k, j)), i * 11 + j * 3 + k, 1.1)()
        brush.endShape(true)
      }
    }
    WC.flush()
  }
}

/**
 * The strikes.
 *
 * The only hard-edged marks on the plate, because a failure is a judgement and
 * everything else here is a measurement.
 */
function strikes() {
  brush.noFill()
  brush.noHatch()
  brush.set('rotring', INK, 0.55)
  FAILED.forEach((key) => {
    const [i, j] = key.split(',').map(Number)
    const cx = cell.x + (i + 0.5) * cell.w
    const cy = cell.y + (j + 0.5) * cell.h
    const r = Math.min(cell.w, cell.h) * 0.31
    brush.line(cx - r, cy - r * 0.8, cx + r, cy + r * 0.8)
  })
  WC.flush()

  // The tray's own registration: a light rule under each column.
  brush.set('2H', PENCIL, 0.26)
  for (let i = 0; i <= COLS; i++) {
    const x = cell.x + i * cell.w
    brush.line(x, cell.y + ROWS * cell.h + P.h * 0.02, x, cell.y + ROWS * cell.h + P.h * 0.035)
  }
  brush.line(cell.x, cell.y + ROWS * cell.h + P.h * 0.02, cell.x + COLS * cell.w, cell.y + ROWS * cell.h + P.h * 0.02)

  // One leader, to a failure rather than to the grid.
  const cx = cell.x + 2.5 * cell.w
  const cy = cell.y + 1.5 * cell.h
  WC.leader(cx, cy, P.x + P.w * 0.94, P.y + P.h * 0.08, P.w * 0.05, MADDER)
}
