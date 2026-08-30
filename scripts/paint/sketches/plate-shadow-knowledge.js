/**
 * plate-shadow-knowledge — the encoder knows long before the decoder can say it.
 *
 * Two curves against training steps. A linear probe on the encoder passes 99%
 * within about two thousand steps; output accuracy stays near chance for tens of
 * thousands more before it groks. The interesting object is neither curve - it
 * is the region BETWEEN them, the stretch where the representation is already
 * correct and the behaviour is not. So that gap is the only thing painted wet;
 * the curves themselves are drawn thin, as its two banks.
 *
 * Both curves are logistic, and their constants come from the paper's own
 * numbers rather than being shaped by eye: the probe's midpoint sits at ~5% of
 * the run and the output's at ~62%, which is what produces a gap wide enough to
 * be the subject rather than a detail.
 *
 *   node scripts/paint/render.mjs sketches/plate-shadow-knowledge.js \
 *     --size 1600x1100 --seed 3 --bleed
 *
 * Pans: indigo (the probe, early and cool), raw sienna (the output, late and
 * warm), sap into ochre across the gap - four values that stay apart from each
 * other, so the two curves never read as edges of the wash. The cool/warm split across the two curves is doing
 * the work of a legend - they are two different times, so they are two different
 * temperatures - and the gap stays muted so it reads as ground, not as a third
 * curve.
 */

// PAPER, BLEED and WASH arrive as globals from render.mjs (see config.js).
const INK = '#3A2A22'
const PENCIL = '#8C8375'
const PROBE = '#455571'   // indigo
const OUTPUT = '#C08A4E'  // raw
const GAP = '#6B7A55'     // sap, the early half of the gap
const OCHRE = '#B98A46'   // ochre, for the warm end of the gap

let P
let plot

/** Linear probe accuracy on the encoder: saturates almost immediately. */
const probe = (t) => 0.06 + 0.92 / (1 + Math.exp(-(t - 0.05) * 88))
/** Output accuracy: flat near chance, then a late climb. */
const output = (t) => 0.04 + 0.9 / (1 + Math.exp(-(t - 0.62) * 15))

const X = (t) => plot.x + t * plot.w
const Y = (v) => plot.y + plot.h - v * plot.h

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  plot = {
    x: P.x + P.w * 0.14,
    y: P.y + P.h * 0.12,
    w: P.w * 0.72,
    h: P.h * 0.68,
  }
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  gap()
  WC.flush()
  curves()
  axis()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/**
 * The lag, flooded wet.
 *
 * A predicate rather than a polygon: a point is in the gap if it sits under the
 * probe curve and over the output curve. fillRegion drops jittered touches and
 * keeps the ones that land inside, so the boundary emerges where the wash meets
 * dry paper instead of being drawn as an edge - which matters here, because the
 * whole claim is that the boundary is soft in time.
 */
function gap() {
  // Painted by walking t, not by flooding a grid.
  //
  // WC.fillRegion tests a jittered grid and drops a fixed-radius blob wherever a
  // point passes, which is right for a norm ball and wrong twice over here.
  // Fixed radius overruns a fast-moving boundary (the probe curve is almost
  // vertical, so the wash spilled past both curves and read as a grey cloud with
  // two lines on top), and getting the radius small enough to hug it needs a
  // grid so dense the render took eight minutes.
  //
  // Walking the parameter instead means the touch is sized by the LOCAL gap
  // height, so it can never overrun: wide where the gap is wide, a thin sliver
  // where the curves pinch. About 150 touches instead of 1800.
  const STEPS = 46
  for (let i = 0; i <= STEPS; i++) {
    const t = 0.012 + (i / STEPS) * 0.976
    const hi = probe(t)
    const lo = output(t)
    const span = hi - lo
    if (span < 0.03) continue

    const x = X(t)
    const yTop = Y(hi)
    const yBot = Y(lo)
    const h = yBot - yTop

    // Cool where only the encoder knows; warmer as the decoder catches up. One
    // flat pan over this much area goes grey the moment touches overlap.
    const colour = t < 0.5 ? GAP : OCHRE
    const mix = t > 0.42 && t < 0.58

    const perCol = Math.max(1, Math.round(h / (plot.h * 0.16)))
    // Stagger and jitter, or the touches land on a grid and the wash comes out
    // corduroy: rows of blobs at the same height in every column, which is the
    // one thing a wash never looks like. Half-step offset on alternate columns,
    // plus noise on both position and size.
    const stagger = (i % 2) * 0.5
    for (let k = 0; k < perCol; k++) {
      const jitterY = (noise(i * 1.7, k * 2.3) - 0.5) * (h / perCol) * 0.85
      const cy = yTop + ((k + 0.5 + stagger) / perCol) * h + jitterY
      if (cy < yTop || cy > yBot) continue
      const base = Math.min(h / perCol, (plot.w / STEPS) * 2.6)
      const r = base * (0.5 + 0.42 * noise(i * 2.9 + k, 7))
      WC.wet(0.5)
      brush.fill(mix && k % 2 ? OCHRE : colour, 58 + noise(i, k * 3) * 26)
      brush.beginShape(0.9)
      WC.blob(x, cy, r, i * 5 + k, 1.15)()
      brush.endShape(true)
    }
  }
}

/** The two banks of the gap. Thin: they are not the subject. */
function curves() {
  const trace = (f, colour, alpha) => {
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const t = i / 120
      pts.push({ x: X(t), y: Y(f(t)) })
    }
    // A little pooled pigment along the line, so a curve reads as painted
    // rather than plotted, then a dry pass over it for definition.
    WC.pool(
      () => {
        pts.forEach((p) => brush.vertex(p.x, p.y))
        for (let i = pts.length - 1; i >= 0; i--) brush.vertex(pts[i].x, pts[i].y + plot.h * 0.012)
      },
      colour,
      alpha,
      0.4
    )
    WC.flush()
    brush.noFill()
    brush.noHatch()
    brush.set('2B', colour, 0.5)
    for (let i = 0; i < pts.length - 1; i++) {
      brush.line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y)
    }
  }

  trace(probe, PROBE, 74)
  WC.flush()
  trace(output, OUTPUT, 70)
}

/** Axes in pencil, and two leaders out to the margin. */
function axis() {
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.32)
  brush.line(plot.x, plot.y, plot.x, plot.y + plot.h)
  brush.line(plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h)

  // Ticks: steps along the bottom, accuracy up the side.
  const t = plot.h * 0.012
  for (let i = 0; i <= 10; i++) {
    const x = plot.x + (i / 10) * plot.w
    brush.line(x, plot.y + plot.h, x, plot.y + plot.h + (i % 5 ? t * 0.6 : t))
  }
  for (let i = 0; i <= 4; i++) {
    const y = plot.y + plot.h - (i / 4) * plot.h
    brush.line(plot.x - (i % 2 ? t * 0.6 : t), y, plot.x, y)
  }

  // Where the probe has already saturated, and where the output finally does.
  WC.leader(X(0.09), Y(probe(0.09)), P.x + P.w * 0.34, P.y + P.h * 0.06, P.w * 0.05, INK)
  WC.leader(X(0.72), Y(output(0.72)), P.x + P.w * 0.93, P.y + P.h * 0.9, P.w * 0.05, INK)
}
