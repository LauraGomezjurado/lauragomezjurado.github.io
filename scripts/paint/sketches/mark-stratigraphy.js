/**
 * mark-stratigraphy — a chronology as sediment.
 *
 * News is a list of years, and the panel is deliberately the dense one: small
 * type, tight leading, no art, so it reads as contrast between two illustrated
 * sections. A plate placed beside it would undo that. A core sample would not.
 *
 * So: layered bands running down the margin, one stratum per year, newest on
 * top and oldest at the bottom. It gives the eye somewhere to rest without breaking the density, and
 * it IS the timeline rather than a picture next to one - the years the page
 * lists are the years the bands count.
 *
 * Tall and narrow on purpose. Rendered --transparent so it sits in a margin
 * without putting a rectangle there.
 *
 *   node scripts/paint/render.mjs sketches/mark-stratigraphy.js \
 *     --size 520x1500 --seed 4 --transparent
 *
 * Pans: sepia, raw, ochre, sienna - earth colours, and a temperature the series
 * has not used. Every other plate is cool or mixed; this one is entirely warm,
 * which is what keeps a scroll from settling into one key.
 */
/* global brush, WC, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const PENCIL = '#8C8375'
// Laid top to bottom, newest first - which is both how a cliff face reads (the
// most recent deposit on top) and how the News list beside it reads (2026 at the
// top). The first version had the array ordered oldest-first and still laid it
// downward, so the thick recent bed ended up buried at the bottom: wrong
// geologically AND against the page.
//
// Thickness is not uniform: a year with more in it leaves a thicker bed, which
// is also just true of the list - 2026 is most of it.
const BEDS = [
  { pan: '#C08A4E', weight: 0.34 }, // raw    - 2026, the thick recent bed
  { pan: '#A8654A', weight: 0.14 }, // sienna - 2025
  { pan: '#B98A46', weight: 0.18 }, // ochre  - 2024
  { pan: '#C08A4E', weight: 0.11 }, // raw    - 2023
  { pan: '#A8654A', weight: 0.13 }, // sienna - 2022
  { pan: '#5A4436', weight: 0.10 }, // sepia  - earliest, deepest
]

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  beds()
  WC.flush()
  bedding()
  WC.flush()
}

/**
 * The beds.
 *
 * A bed is not a rectangle: its floor and ceiling wander, and the two never
 * wander together, so the thickness varies along the column the way a real one
 * does. Touches are sized to the local bed height so a thin bed stays thin
 * instead of bulging into its neighbours.
 */
function beds() {
  const x0 = width * 0.16
  const w = width * 0.68
  const total = BEDS.reduce((a, b) => a + b.weight, 0)

  let yCursor = height * 0.04
  const usable = height * 0.92

  BEDS.forEach((bed, i) => {
    const h = (bed.weight / total) * usable
    const top = yCursor
    const bottom = yCursor + h
    yCursor = bottom

    const COLS = 9
    for (let c = 0; c <= COLS; c++) {
      const fx = c / COLS
      const x = x0 + fx * w
      // Floor and ceiling wander independently.
      const wobbleTop = (noise(i * 3.1 + fx * 2.2) - 0.5) * h * 0.34
      const wobbleBot = (noise(i * 5.7 + fx * 1.7 + 40) - 0.5) * h * 0.34
      const t = top + wobbleTop
      const b = bottom + wobbleBot
      const bh = b - t
      if (bh < height * 0.004) continue

      const perCol = Math.max(1, Math.round(bh / (height * 0.055)))
      for (let k = 0; k < perCol; k++) {
        const cy = t + ((k + 0.5) / perCol) * bh
        const r = Math.min(bh / perCol, w / COLS * 2.2) * 0.78
        WC.wet(0.5)
        brush.fill(bed.pan, 58 + noise(i * 2 + c, k) * 46)
        brush.beginShape(0.9)
        WC.blob(x, cy, r, i * 17 + c * 3 + k, 1.35)()
        brush.endShape(true)
      }
    }
    WC.flush()
  })
}

/** The bedding planes: a faint pencil line where one bed meets the next. */
function bedding() {
  const x0 = width * 0.16
  const w = width * 0.68
  const total = BEDS.reduce((a, b) => a + b.weight, 0)
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.28)

  let yCursor = height * 0.04
  const usable = height * 0.92
  BEDS.forEach((bed, i) => {
    yCursor += (bed.weight / total) * usable
    if (i === BEDS.length - 1) return
    // Drawn in short segments that skip, the way a contact is only visible
    // where it is exposed.
    const SEG = 9
    for (let sIdx = 0; sIdx < SEG; sIdx++) {
      if (noise(i * 4 + sIdx * 0.9) < 0.34) continue
      const a = x0 + (sIdx / SEG) * w
      const b = x0 + ((sIdx + 0.85) / SEG) * w
      const dy = (noise(i * 6 + sIdx) - 0.5) * height * 0.008
      brush.line(a, yCursor + dy, b, yCursor + dy * 0.6)
    }
  })
}
