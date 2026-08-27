/**
 * plate-spectrum — a singular value spectrum with a rank cut.
 *
 * A comb of decaying values, and the line where you stop keeping them. Left of
 * the cut is the subspace a low-rank optimizer actually carries; right of it is
 * the tail it discards, painted as ghosts. This is the picture behind Dion and
 * Orth-Dion: everything turns on whether the discarded tail was really
 * negligible, and on whether the kept basis stayed orthogonal.
 *
 * Rhythmic and vertical, so it sits differently on a page from the round
 * geometry of the norm balls or the sprawl of the attractor.
 *
 *   node scripts/paint/render.mjs sketches/plate-spectrum.js --size 1500x900 --seed 5
 
 * Pans: sienna and raw sienna for what is kept, payne's grey for what is
 * thrown away. The hottest plate in the set.
 */

// The page's RENDERED paper, measured from a screenshot — not the CSS value.
// index.css declares #E6DCC8, but PaperBackground's grain layers put #D9D0BE on
// screen. Every earlier figure was painted against the CSS value, so it was
// always a slightly different material from the page, and every attempt to fix
// that (feathered masks, multiply, transparent cut-outs, full-bleed) was hiding
// a mismatch instead of removing it. Match the real value and a figure can just
// be placed, with no blending at all.
const PAPER = '#D9D0BE'
const INK = '#3A2A22'
const CLAY = '#A8654A'   // sienna
const PLUM = '#C08A4E'   // raw sienna
const SLATE = '#6E7C92'  // payne, for the discarded tail

let P
let bars = []
const N = 26
const KEEP = 9 // rank cut

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)

  // A plausible spectrum: fast decay with a heavy-ish tail, plus noise so it
  // reads as measured rather than drawn from a formula.
  const base = { x: P.x + P.w * 0.16, y: P.y + P.h * 0.82, w: P.w * 0.66, h: P.h * 0.56 }
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const v = Math.pow(1 - t, 2.1) * 0.92 + 0.05 + 0.05 * noise(i * 0.8)
    bars.push({
      i,
      x: base.x + (i / N) * base.w,
      w: (base.w / N) * 0.62,
      top: base.y - v * base.h,
      bottom: base.y,
      v,
    })
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

  spectrum()
  WC.flush()
  cutLine()
  axis()
  WC.flush()
  // The plate frame belongs to a full plate. On a small mark those ticks
  // sit out in what is now empty space and read as stray lines.
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
  // no applyPaper: the page's own grain already textures this area
}

/** Each singular value as a wet column: kept ones solid, discarded ones ghosts. */
function spectrum() {
  for (const b of bars) {
    const kept = b.i < KEEP
    const colour = kept ? (b.i % 3 === 0 ? PLUM : CLAY) : SLATE
    const alpha = kept ? 128 : 46
    const h = b.bottom - b.top

    // A column is several touches stacked, so pigment gathers unevenly the way
    // it does when a wet stripe dries.
    // Touches must OVERLAP heavily along the column or they read as a string
    // of beads rather than as one wet stripe: step by a third of a blob.
    const steps = Math.max(3, Math.round(h / (b.w * 0.8)))
    for (let s = 0; s < steps; s++) {
      const y = b.top + b.w * 0.5 + (s / Math.max(1, steps - 1)) * (h - b.w)
      WC.wet(kept ? 0.35 : 0.5)
      brush.fill(colour, alpha * (0.85 + 0.3 * noise(b.i * 2.2, s)))
      brush.beginShape(0.9)
      WC.blob(b.x + b.w / 2, y, b.w * 0.95, b.i * 3 + s, 1.15)()
      brush.endShape(true)
    }
  }
}

/** The rank cut, and the tail it throws away. */
function cutLine() {
  const cut = bars[KEEP].x - (bars[1].x - bars[0].x) * 0.2
  const top = P.y + P.h * 0.16
  const bottom = P.y + P.h * 0.86

  brush.noFill()
  brush.noHatch()
  brush.set('2H', INK, 0.3)
  const dash = P.h * 0.022
  for (let y = top; y < bottom; y += dash * 1.7) {
    brush.line(cut, y, cut, Math.min(y + dash, bottom))
  }

  WC.leader(cut, top + P.h * 0.04, P.x + P.w * 0.9, P.y + P.h * 0.16, P.w * 0.05)

  // the discarded tail, bracketed
  const tailStart = cut
  const tailEnd = bars[N - 1].x + bars[N - 1].w
  const by = P.y + P.h * 0.9
  brush.set('2H', SLATE, 0.24)
  brush.line(tailStart, by, tailEnd, by)
  brush.line(tailStart, by - P.h * 0.014, tailStart, by)
  brush.line(tailEnd, by - P.h * 0.014, tailEnd, by)
  WC.leader((tailStart + tailEnd) / 2, by, P.x + P.w * 0.88, P.y + P.h * 0.96, P.w * 0.05, SLATE)
}

/** A quiet baseline and a decaying reference curve through the bar tops. */
function axis() {
  const base = bars[0].bottom
  brush.noFill()
  brush.set('HB', '#9A8570', 0.3)
  brush.line(P.x + P.w * 0.13, base, bars[N - 1].x + bars[N - 1].w + P.w * 0.02, base)

  brush.set('2H', '#A8927C', 0.22)
  for (let i = 0; i < bars.length - 1; i++) {
    brush.line(bars[i].x + bars[i].w / 2, bars[i].top, bars[i + 1].x + bars[i + 1].w / 2, bars[i + 1].top)
  }
}
