/**
 * plate-bottleneck — a signal, a code that should be too small, and what comes back.
 *
 * Latent-code video at 100-500x compression. The claim is entirely about a size
 * ratio, so the plate is a size ratio: a wide dense band, a narrow one, and a
 * wide band again. The reconstruction is painted slightly thinner and slightly
 * broken, because it is not identical and drawing it identical would be a lie.
 *
 * No arrows. The three bands sit in a row and their widths do the arguing.
 *
 *   node scripts/paint/render.mjs sketches/plate-bottleneck.js \
 *     --size 1600x900 --seed 3 --bleed
 *
 * Pans: ultramarine for the signal, raw for the code. Cool in, warm through the
 * middle, cool out - so the narrow band is the thing the eye lands on.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const PENCIL = '#8C8375'
const ULTRA = '#5B6E96'
const RAW = '#C08A4E'

let P
// x-extent, half-height (as a fraction of the band height), pan, density.
let BANDS

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  P = WC.plateRect(0.05)
  const midY = P.y + P.h * 0.5
  const full = P.h * 0.34
  BANDS = [
    { x0: P.x + P.w * 0.04, x1: P.x + P.w * 0.34, half: full, pan: ULTRA, alpha: 62, broken: 0 },
    { x0: P.x + P.w * 0.44, x1: P.x + P.w * 0.54, half: full * 0.1, pan: RAW, alpha: 96, broken: 0 },
    { x0: P.x + P.w * 0.64, x1: P.x + P.w * 0.96, half: full * 0.93, pan: ULTRA, alpha: 54, broken: 0.22 },
  ]
  BANDS.forEach((b) => (b.midY = midY))
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  BANDS.forEach((b, i) => {
    band(b, i)
    WC.flush()
  })
  rule()
  WC.flush()
  if (!TRANSPARENT) {
    WC.cornerTicks(P)
    WC.scaleBar(P)
  }
}

/** A band, walked along its length with touches sized to its half-height. */
function band(b, idx) {
  const w = b.x1 - b.x0
  const STEPS = Math.max(6, Math.round(w / (P.w * 0.012)))
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    // Ends taper slightly so a band reads as painted, not as a bar chart.
    const taper = Math.min(1, Math.sin(Math.PI * Math.min(1, t * 1.08)) * 1.6)
    const half = b.half * (0.72 + 0.28 * taper)
    const rows = Math.max(1, Math.round((half * 2) / (P.h * 0.1)))
    for (let k = 0; k < rows; k++) {
      // The reconstruction drops touches: close, not identical.
      if (b.broken && noise(i * 1.4, k * 2.6) < b.broken) continue
      const stagger = ((i + idx) % 2) * 0.5
      const cy = b.midY - half + ((k + 0.5 + stagger) / rows) * half * 2
      const base = Math.min((half * 2) / rows, (w / STEPS) * 2.4)
      WC.wet(0.5)
      brush.fill(b.pan, b.alpha + noise(i, k + idx) * 30)
      brush.beginShape(0.9)
      WC.blob(b.x0 + t * w, cy, base * (0.55 + 0.4 * noise(i * 2.1 + idx, k)), i * 5 + k + idx * 17, 1.15)()
      brush.endShape(true)
    }
  }
}

/** A measure under the narrow band: the ratio is the whole result. */
function rule() {
  const b = BANDS[1]
  const y = b.midY + BANDS[0].half * 1.24
  const t = P.h * 0.012
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.3)
  brush.line(b.x0, y, b.x1, y)
  brush.line(b.x0, y - t, b.x0, y + t)
  brush.line(b.x1, y - t, b.x1, y + t)
  // And the same measure across the source, for comparison.
  const a = BANDS[0]
  brush.line(a.x0, y, a.x1, y)
  brush.line(a.x0, y - t, a.x0, y + t)
  brush.line(a.x1, y - t, a.x1, y + t)
  WC.leader((b.x0 + b.x1) / 2, y, P.x + P.w * 0.5, P.y + P.h * 0.92, P.w * 0.04, RAW)
}
