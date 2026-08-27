/**
 * chrome — interface parts, drawn with the same pencil as the plates.
 *
 * The point of the softening pass is that the UI should not merely *match* the
 * paintings, it should be made by the same hand. A CSS `1px solid` border and a
 * `border-radius: 2px` are the two most software-looking things on the page.
 * These assets replace them with marks that have graphite texture and a wobble.
 *
 * Render each with --transparent so it can sit on any ground:
 *
 *   node scripts/paint/render.mjs sketches/chrome.js --transparent \
 *     --data scripts/paint/data/chrome-rule.json --size 1200x28 \
 *     --out public/images/ui/rule.png
 *
 * DATA.kind selects the part: rule | underline | deckle | corner
 */

const INK = '#3A2A22'
const PENCIL = '#8A7663'

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  brush.scaleBrushes(0.9)
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)
  clear() // no paper: these composite onto whatever is behind them

  const kind = (DATA && DATA.kind) || 'rule'
  if (kind === 'rule') rule()
  else if (kind === 'underline') underline()
  else if (kind === 'deckle') deckle()
  else if (kind === 'corner') corner()
}

/**
 * A section divider. Drawn as short overlapping segments with a drifting
 * baseline, because a hand does not draw a straight line and that is the entire
 * difference between this and a CSS border.
 */
function rule() {
  const y = height / 2
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.34)
  const seg = width / 90
  for (let x = 0; x < width; x += seg) {
    const y1 = y + (noise(x * 0.006) - 0.5) * height * 0.3
    const y2 = y + (noise((x + seg) * 0.006) - 0.5) * height * 0.3
    brush.line(x, y1, Math.min(x + seg, width), y2)
  }
}

/** A link or button underline: heavier, shorter, with a lift at the end. */
function underline() {
  const y = height * 0.5
  brush.noFill()
  brush.noHatch()
  brush.set('HB', INK, 0.5)
  const seg = width / 40
  for (let x = width * 0.02; x < width * 0.98; x += seg) {
    const t = x / width
    const drift = (noise(x * 0.012) - 0.5) * height * 0.34
    const lift = Math.pow(t, 3) * height * 0.12
    brush.line(x, y + drift - lift, Math.min(x + seg, width * 0.98), y + drift - lift)
  }
}

/**
 * A torn paper edge, as a strip to lay along the bottom of a panel or image.
 * Paper does not have rounded corners; it has irregular ones, and this is the
 * honest way to say so.
 */
function deckle() {
  brush.noStroke()
  brush.noHatch()
  brush.noWash()
  brush.noMass()
  brush.fillTexture(0.5, 0.25)
  brush.fillBleed(0.28, 'out')
  brush.fill('#E9E0CE', 255)
  brush.beginShape(0.6)
  brush.vertex(0, 0)
  for (let x = 0; x <= width; x += width / 60) {
    const y = height * (0.34 + 0.44 * noise(x * 0.01) + 0.12 * noise(x * 0.05))
    brush.vertex(x, y)
  }
  brush.vertex(width, 0)
  brush.endShape(true)
}

/** A registration tick for panel corners, replacing a border entirely. */
function corner() {
  const t = Math.min(width, height) * 0.42
  brush.noFill()
  brush.noHatch()
  brush.set('2H', PENCIL, 0.3)
  brush.line(width * 0.12, height * 0.12, width * 0.12 + t, height * 0.12)
  brush.line(width * 0.12, height * 0.12, width * 0.12, height * 0.12 + t)
}
