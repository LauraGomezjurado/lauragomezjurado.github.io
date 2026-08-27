/**
 * plate-latent-chain — a chain of thought with the middle gone quiet.
 *
 * A row of steps: the first few and the last are spoken, painted solid. The
 * ones between are latent, drawn as empty outlines. A probe drops into the
 * silent stretch from below, because that is the whole question of the
 * latent-CoT work: when the reasoning stops being written down, can anything
 * still read it?
 *
 * Discrete and linear, which gives the set a rhythm none of the other plates
 * has. It also happens to be the only one whose composition is a strip, so it
 * suits a wide banner above a post.
 *
 *   node scripts/paint/render.mjs sketches/plate-latent-chain.js --size 1600x800 --seed 3
 
 * Pans: teal for what is said, ochre for the answer, madder for the probe.
 */

const PAPER = '#E9E0CE'
const INK = '#3A2A22'
const PLUM = '#4E7A78'   // teal, for spoken steps
const GOLD = '#B98A46'   // ochre, for the answer
const SLATE = '#94566A'  // madder, for the probe

let P
let steps = []
const N = 9
const SILENT = [3, 4, 5, 6] // the latent stretch

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)

  const y = P.y + P.h * 0.42
  for (let i = 0; i < N; i++) {
    steps.push({
      i,
      x: P.x + P.w * (0.1 + (i / (N - 1)) * 0.8),
      y: y + P.h * 0.045 * (noise(i * 1.3) - 0.5),
      r: P.h * 0.075,
      silent: SILENT.includes(i),
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

  spokenSteps()
  WC.flush()
  chain()
  silentSteps()
  probe()
  WC.flush()
  // The plate frame belongs to a full plate. On a small mark those ticks
  // sit out in what is now empty space and read as stray lines.
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
  if (!TRANSPARENT) WC.applyPaper(20)
}

/** The steps that were said out loud: pigment on the page. */
function spokenSteps() {
  for (const s of steps) {
    if (s.silent) continue
    const colour = s.i === N - 1 ? GOLD : PLUM
    for (let k = 0; k < 3; k++) {
      WC.wet(0.45 - k * 0.08)
      brush.fill(colour, k === 0 ? 120 : 84)
      brush.beginShape(0.9)
      WC.blob(s.x, s.y, s.r * (1 - k * 0.16), s.i * 5 + k, 1)()
      brush.endShape(true)
    }
  }
}

/**
 * The steps that were not. Outline only, on bare paper: the absence is the
 * subject, so it must not be painted.
 */
function silentSteps() {
  brush.noFill()
  brush.noHatch()
  for (const s of steps) {
    if (!s.silent) continue
    brush.set('2H', '#9A8570', 0.24)
    brush.circle(s.x, s.y, s.r * 0.92)
    // a faint interior tick, as if something is there but unread
    brush.set('2H', '#B0A08C', 0.16)
    brush.line(s.x - s.r * 0.3, s.y, s.x + s.r * 0.3, s.y)
  }
}

/** The thread running through the whole chain, dashed where it goes latent. */
function chain() {
  brush.noFill()
  brush.noHatch()
  for (let i = 0; i < steps.length - 1; i++) {
    const a = steps[i]
    const b = steps[i + 1]
    const quiet = a.silent || b.silent
    brush.set('2H', quiet ? '#A8927C' : '#6B5748', quiet ? 0.18 : 0.3)
    const x1 = a.x + a.r
    const x2 = b.x - b.r
    if (!quiet) {
      brush.line(x1, a.y, x2, b.y)
    } else {
      const d = P.w * 0.012
      for (let x = x1; x < x2; x += d * 2) {
        const t1 = (x - x1) / (x2 - x1)
        const t2 = Math.min(1, (x + d - x1) / (x2 - x1))
        brush.line(x, a.y + (b.y - a.y) * t1, Math.min(x + d, x2), a.y + (b.y - a.y) * t2)
      }
    }
  }
}

/** A probe reaching up into the silent stretch from the margin. */
function probe() {
  const target = steps[SILENT[1]]
  const from = { x: P.x + P.w * 0.34, y: P.y + P.h * 0.85 }

  brush.noFill()
  brush.set('2H', SLATE, 0.28)
  brush.line(from.x, from.y, target.x, target.y + target.r * 1.3)
  const ang = degrees(Math.atan2(target.y + target.r * 1.3 - from.y, target.x - from.x))
  const tip = { x: target.x, y: target.y + target.r * 1.3 }
  const h = P.h * 0.03
  brush.line(tip.x, tip.y, tip.x - cos(ang - 24) * h, tip.y - sin(ang - 24) * h)
  brush.line(tip.x, tip.y, tip.x - cos(ang + 24) * h, tip.y - sin(ang + 24) * h)

  // a small wet mark where the probe reads
  WC.wet(0.4)
  brush.fill(SLATE, 96)
  brush.beginShape(0.9)
  WC.blob(from.x, from.y + P.h * 0.02, P.h * 0.032, 41, 1)()
  brush.endShape(true)

  WC.flush()
  WC.leader(steps[SILENT[0]].x, steps[SILENT[0]].y - steps[0].r * 1.4, P.x + P.w * 0.3, P.y + P.h * 0.13, -P.w * 0.06)
  WC.leader(steps[N - 1].x, steps[N - 1].y - steps[0].r * 1.3, P.x + P.w * 0.93, P.y + P.h * 0.18, P.w * 0.04)
}
