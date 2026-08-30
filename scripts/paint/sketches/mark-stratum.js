/**
 * mark-stratum — one year, as a bed of sediment.
 *
 * News was a wall of text with a single tall drawing beside all of it. This
 * breaks that drawing apart: each year gets its own bed in the margin next to
 * its heading, so art is distributed down the section instead of parked at the
 * top of it.
 *
 * It is deliberately NOT the research section's move. There, one figure holds
 * position and mutates as you scroll; repeating that here would make the page
 * feel like it only knows one trick. These do not mutate - they are separate
 * specimens, and what varies between them is DATA: the number of laminae in a
 * bed is the number of things that happened that year, so 2026 is thick and
 * banded and 2023 is a thin quiet layer. The drawing is a count.
 *
 *   node scripts/paint/render.mjs sketches/mark-stratum.js \
 *     --data scripts/paint/data/year-2026.json \
 *     --size 460x300 --seed 3 --transparent
 *
 * Pans: the earth end of the box - sepia, sienna, raw, ochre - stepping cooler
 * as the years go back, so the four read as one core taken apart.
 *
 * These sit at ~150px on the page, and the first pass was mixed at plate alphas
 * and read as a faint smudge at that size. A mark shown small needs MORE pigment
 * than a plate shown large, not less - it has fewer pixels to be convincing in.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, DATA, PAPER, TRANSPARENT */

const PENCIL = '#8C8375'
const EARTH = ['#C08A4E', '#B98A46', '#A8654A', '#5A4436'] // raw, ochre, sienna, sepia

let M // the mark's drawing area
let LAMINAE

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  const n = (DATA && DATA.count) || 3
  M = { x: width * 0.08, y: height * 0.12, w: width * 0.84, h: height * 0.76 }

  // One lamina per item that year. Thicknesses are uneven and sum to 1, so a
  // busy year is not just taller but more finely banded - which is what a
  // busier year actually deposits.
  const raw = []
  for (let i = 0; i < n; i++) raw.push(0.5 + noise(i * 1.7, 3) * 1.2)
  const total = raw.reduce((a, b) => a + b, 0)
  LAMINAE = raw.map((w, i) => ({
    weight: w / total,
    pan: EARTH[i % EARTH.length],
  }))
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  beds()
  WC.flush()
  contacts()
  WC.flush()
}

/**
 * The beds.
 *
 * Scattered, not walked.
 *
 * Two earlier versions placed touches at (c/COLS, k/rows) and both came out
 * WOVEN once the pigment was strong enough to see - rows and columns lining up
 * across the whole mark. Jittering inside the grid did not fix it, because the
 * centres are still on a lattice and the eye finds it anyway.
 *
 * So the positions come from a low-discrepancy sequence instead: successive
 * multiples of the golden ratio, wrapped. That spreads evenly without ever
 * repeating a spacing, which is the property a lattice lacks and a wash needs.
 * It is still deterministic, so renders stay comparable between seeds.
 */
function beds() {
  const PHI = 0.6180339887
  const PHI2 = 0.7548776662

  let y = M.y
  LAMINAE.forEach((lam, i) => {
    const h = lam.weight * M.h
    const top = y
    y += h

    // The bed's floor and ceiling wander independently along its length, so
    // thickness varies rather than the band being a rectangle.
    const ceil = (fx) => top + (noise(i * 3.1 + fx * 2.4) - 0.5) * h * 0.42
    const floor = (fx) => top + h + (noise(i * 5.9 + fx * 1.9 + 40) - 0.5) * h * 0.42

    const count = Math.max(8, Math.round((h / M.h) * 96))
    for (let q = 0; q < count; q++) {
      const fx = (q * PHI + noise(i * 5.5, q * 0.31) * 0.09) % 1
      const fy = (q * PHI2 + noise(i * 2.3, q * 0.17) * 0.14) % 1
      const t = ceil(fx)
      const b = floor(fx)
      const bh = b - t
      if (bh < height * 0.006) continue

      const x = M.x + fx * M.w
      const cy = t + fy * bh
      // Sized to the local bed height so a thin lamina cannot bulge into its
      // neighbours.
      const r = Math.min(bh * 0.6, M.w * 0.075) * (0.6 + 0.5 * noise(i * 3.3 + q * 0.4, 7))
      WC.wet(0.5)
      brush.fill(lam.pan, 96 + noise(i * 2 + q * 0.2, 3) * 62)
      brush.beginShape(0.9)
      WC.blob(x, cy, r, i * 13 + q, 1.35)()
      brush.endShape(true)
    }
    WC.flush()
  })
}

/** Bedding planes, drawn only where they would be exposed. */
function contacts() {
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.3)
  let y = M.y
  LAMINAE.forEach((lam, i) => {
    y += lam.weight * M.h
    if (i === LAMINAE.length - 1) return
    const SEG = 7
    for (let s = 0; s < SEG; s++) {
      if (noise(i * 4.3 + s * 1.1) < 0.38) continue
      const a = M.x + (s / SEG) * M.w
      const b = M.x + ((s + 0.8) / SEG) * M.w
      const dy = (noise(i * 6 + s) - 0.5) * height * 0.012
      brush.line(a, y + dy, b, y + dy * 0.5)
    }
  })
}
