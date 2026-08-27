/**
 * plate-search-tree — a planner expanding, pruning, and finding one path.
 *
 * An agent doing materials discovery does not follow a recipe; it expands
 * candidates, kills most of them, and commits to one line. So the tree is drawn
 * with most branches faint and struck through, and exactly one route painted
 * wet from root to result. The picture is mostly abandoned work, which is the
 * honest shape of search.
 *
 * Pans: ochre, payne, sepia. Gold against grey-blue.
 *
 *   node scripts/paint/render.mjs sketches/plate-search-tree.js --size 1500x900 --seed 5
 */

// The page's RENDERED paper, measured from a screenshot — not the CSS value.
// index.css declares #E6DCC8, but PaperBackground's grain layers put #D9D0BE on
// screen. Every earlier figure was painted against the CSS value, so it was
// always a slightly different material from the page, and every attempt to fix
// that (feathered masks, multiply, transparent cut-outs, full-bleed) was hiding
// a mismatch instead of removing it. Match the real value and a figure can just
// be placed, with no blending at all.
const PAPER = '#D9D0BE'
const OCHRE = '#B98A46'
const PAYNE = '#6E7C92'
const SEPIA = '#5A4436'
const PENCIL = '#8A7663'

let P
let nodes = []
let edges = []
let winners = new Set()

const DEPTH = 4
const BRANCH = [3, 2, 2, 2]

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)

  // Build the tree left to right; y spread widens with depth.
  const root = { id: 0, d: 0, x: P.x + P.w * 0.1, y: P.y + P.h * 0.5, parent: null }
  nodes.push(root)
  let frontier = [root]
  for (let d = 0; d < DEPTH; d++) {
    const next = []
    const spread = P.h * (0.34 - d * 0.04)
    for (const p of frontier) {
      const k = BRANCH[d]
      for (let i = 0; i < k; i++) {
        const off = k === 1 ? 0 : (i / (k - 1) - 0.5) * spread
        const n = {
          id: nodes.length,
          d: d + 1,
          x: P.x + P.w * (0.1 + ((d + 1) / DEPTH) * 0.72),
          y: p.y + off + P.h * 0.02 * (noise(nodes.length * 1.7) - 0.5),
          parent: p,
        }
        nodes.push(n)
        edges.push([p, n])
        next.push(n)
      }
    }
    frontier = next
  }

  // Pick one leaf and mark its whole ancestry as the surviving line.
  const leaves = nodes.filter((n) => n.d === DEPTH)
  let win = leaves[Math.floor(leaves.length * 0.62)]
  while (win) {
    winners.add(win.id)
    win = win.parent
  }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  // A mark is composited straight onto the page, so it must carry no
  // paper of its own — an opaque sheet behind it is what reads as a
  // pasted rectangle no matter how the edges are treated.
  if (TRANSPARENT) clear()
  else background(PAPER)

  survivingWash()
  WC.flush()
  prunedBranches()
  survivingBranches()
  nodeMarks()
  WC.flush()
  // The plate frame belongs to a full plate. On a small mark those ticks
  // sit out in what is now empty space and read as stray lines.
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
  // no applyPaper: the page's own grain already textures this area
}

/** A wet corridor along the path that survived. */
function survivingWash() {
  const path = nodes.filter((n) => winners.has(n.id)).sort((a, b) => a.d - b.d)
  for (let i = 0; i < path.length; i++) {
    const n = path[i]
    WC.wet(0.55)
    brush.fill(i === path.length - 1 ? OCHRE : PAYNE, 88)
    brush.beginShape(0.9)
    WC.blob(n.x, n.y, P.h * (0.075 + 0.02 * i), n.id * 3 + 5, 1)()
    brush.endShape(true)
    if (i > 0) {
      const m = path[i - 1]
      WC.wet(0.6)
      brush.fill(PAYNE, 56)
      brush.beginShape(0.9)
      WC.blob((n.x + m.x) / 2, (n.y + m.y) / 2, P.h * 0.06, n.id * 7, 0.7)()
      brush.endShape(true)
    }
  }
}

/** Everything the planner tried and dropped: faint, and struck through. */
function prunedBranches() {
  brush.noFill()
  brush.noHatch()
  for (const [a, b] of edges) {
    if (winners.has(a.id) && winners.has(b.id)) continue
    brush.set('2H', PENCIL, 0.16)
    brush.line(a.x, a.y, b.x, b.y)
  }

  // a small strike across each dead leaf
  brush.set('2H', PENCIL, 0.22)
  const s = P.h * 0.014
  for (const n of nodes) {
    if (winners.has(n.id) || n.d !== DEPTH) continue
    brush.line(n.x - s, n.y - s, n.x + s, n.y + s)
    brush.line(n.x - s, n.y + s, n.x + s, n.y - s)
  }
}

/** The line that was actually taken. */
function survivingBranches() {
  brush.noFill()
  brush.set('HB', SEPIA, 0.38)
  for (const [a, b] of edges) {
    if (winners.has(a.id) && winners.has(b.id)) brush.line(a.x, a.y, b.x, b.y)
  }
}

/** Nodes: a wet dot on the live path, a hollow ring everywhere else. */
function nodeMarks() {
  for (const n of nodes) {
    if (winners.has(n.id)) {
      WC.wet(0.28)
      brush.fill(n.d === DEPTH ? OCHRE : SEPIA, 185)
      brush.beginShape(0.9)
      WC.blob(n.x, n.y, P.h * (n.d === DEPTH ? 0.028 : 0.02), n.id, 1)()
      brush.endShape(true)
    }
  }
  WC.flush()
  brush.noFill()
  brush.set('2H', PENCIL, 0.2)
  for (const n of nodes) {
    if (!winners.has(n.id)) brush.circle(n.x, n.y, P.h * 0.014)
  }

  const leaf = nodes.filter((n) => winners.has(n.id) && n.d === DEPTH)[0]
  const root = nodes[0]
  WC.flush()
  WC.leader(leaf.x, leaf.y, P.x + P.w * 0.93, P.y + P.h * 0.16, P.w * 0.04)
  WC.leader(root.x, root.y, P.x + P.w * 0.2, P.y + P.h * 0.9, -P.w * 0.05)
}
