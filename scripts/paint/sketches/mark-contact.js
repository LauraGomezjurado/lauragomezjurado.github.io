/**
 * mark-contact — one wet mark.
 *
 * The only painting on the site that is not a diagram. No axes, no leaders, no
 * geometry: a single loaded stroke that runs, thins, and throws a scatter of
 * droplets as it lifts. Contact is the last thing on the page and the one panel
 * with nothing to explain, so it gets the gesture rather than the figure.
 *
 * The weight swells where the hand slows and breaks where it lifts, which is
 * what separates a stroke that was made from one that was merely drawn along a
 * path.
 *
 * Rendered --transparent so it can sit in a margin without putting a rectangle
 * there.
 *
 *   node scripts/paint/render.mjs sketches/mark-contact.js \
 *     --size 900x1250 --seed 6 --transparent
 *
 * Pans: madder, which is the accent the Contact panel already carries, with rose
 * where the wash runs thin.
 */
/* global brush, WC, registerBrushes, CANVAS_W, CANVAS_H, SEED, PAPER, TRANSPARENT */

const MADDER = '#94566A'
const ROSE = '#B4738A'
const SEPIA = '#5A4436'

function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(Math.min(1.25, CANVAS_W / 900))
  registerBrushes()
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  if (TRANSPARENT) clear()
  else background(PAPER)

  stroke_()
  WC.flush()
  scatter()
  WC.flush()
}

/**
 * The stroke, walked rather than outlined.
 *
 * Two earlier attempts failed in different ways and both are worth recording.
 * brush.move() takes a DIRECTION per segment and the angle convention is easy to
 * get backwards - the first version ran sideways off the sheet. Outlining the
 * stroke as a ribbon polygon and filling it fixed the direction but produced
 * hard white spikes: p5.brush's watercolour fill triangulates a shape, and a
 * long, thin, strongly curved outline is exactly what that fails on.
 *
 * Walking the centreline and dropping overlapping touches sized by the local
 * width has none of those failure modes, and it is the same thing that worked
 * for the loss gap and the leaf blade. There is no polygon to triangulate and
 * nothing to wind the wrong way - a stroke is just a lot of pigment laid in a
 * row, which is also true of an actual brush.
 */
function stroke_() {
  const pt = (t) => {
    const ease = t * t * (3 - 2 * t)
    return {
      x: width * (0.3 + 0.34 * ease + 0.1 * Math.sin(t * 3.1)),
      y: height * (0.08 + 0.76 * t),
    }
  }
  // Lands heavy, runs, lifts to nothing.
  const halfWidth = (t) => {
    const swell = Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.7
    return width * (0.035 + 0.075 * swell) * (1 - 0.55 * t)
  }

  const N = 76
  // Three passes: a broad pale body, a narrower darker core offset to one side
  // (pigment settles to the inside of a running brush), and broken tooth on top.
  const passes = [
    { colour: ROSE, alpha: 58, scale: 1.0, offX: 0, wobble: 0.1, every: 1 },
    { colour: MADDER, alpha: 66, scale: 0.55, offX: width * 0.014, wobble: 0.06, every: 1 },
    { colour: SEPIA, alpha: 52, scale: 0.26, offX: -width * 0.008, wobble: 0.22, every: 2 },
  ]

  passes.forEach((pass, pi) => {
    for (let i = 0; i <= N; i++) {
      if (i % pass.every) continue
      const t = i / N
      const p = pt(t)
      const hw = halfWidth(t) * pass.scale
      if (hw < width * 0.002) continue
      // Skip a few touches on the dry pass so the mark breaks the way a brush
      // running out of water does.
      if (pi === 2 && noise(i * 1.6) < 0.4) continue
      const jx = (noise(i * 0.9, pi) - 0.5) * hw * pass.wobble * 4
      WC.wet(0.55)
      brush.fill(pass.colour, pass.alpha + noise(i * 1.3, pi * 3) * 46)
      brush.beginShape(0.9)
      WC.blob(p.x + pass.offX + jx, p.y, hw, i * 7 + pi * 31, 1.15)()
      brush.endShape(true)
    }
    WC.flush()
  })
}

/** What the brush throws off as it lifts. */
function scatter() {
  const tailX = width * 0.74
  const tailY = height * 0.84
  for (let i = 0; i < 26; i++) {
    const t = i / 26
    const a = -50 + noise(i * 0.7) * 70
    const d = height * 0.03 + t * height * 0.16 * (0.4 + noise(i * 1.3))
    const x = tailX + cos(a) * d
    const y = tailY + sin(a) * d * 0.55
    const r = width * 0.004 + (1 - t) * width * 0.016 * noise(i * 2.1)
    WC.wet(0.45)
    brush.fill(i % 3 ? MADDER : ROSE, 70 + noise(i) * 60)
    brush.beginShape(0.9)
    WC.blob(x, y, r, i * 3 + 1, 1.1)()
    brush.endShape(true)
  }
}
