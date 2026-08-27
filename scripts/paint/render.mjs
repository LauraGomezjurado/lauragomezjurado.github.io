/**
 * render.mjs — render a p5.brush sketch to a PNG, headlessly.
 *
 * p5.brush paints with simulated bristles, watercolour bleed and paper tooth.
 * It needs a real WebGL context, so rendering happens in headless Chrome
 * (SwiftShader for GL) rather than in node. The sketch draws once and calls
 * noLoop(); Chrome's virtual clock only advances when the page yields, so a
 * long budget waits for the paint to finish instead of capturing it half-done.
 *
 * Usage:
 *   node scripts/paint/render.mjs sketches/fig-depth-sweet-spot.js \
 *     --data scripts/paint/data/depth-sweet-spot.json \
 *     --size 2100x1350 --seed 7 --out public/images/blog/.../fig.png
 *
 * Flags: --size WxH, --seed n, --out path, --data path, --font path.
 *
 * The sketch reads CANVAS_W / CANVAS_H / SEED / DATA as globals (see config.js,
 * which this script generates), so one sketch renders at any size and the same
 * sketch can serve several datasets. See README.md.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, copyFileSync, writeFileSync, mkdirSync, renameSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const sketchArg = process.argv[2]
if (!sketchArg || sketchArg.startsWith('--')) {
  console.error('usage: node scripts/paint/render.mjs <sketch.js> [--size WxH] [--out path] [--seed n]')
  process.exit(1)
}

const sketchPath = resolve(HERE, sketchArg)
const [w, h] = arg('size', '1800x1150').split('x').map(Number)
const seed = Number(arg('seed', '1'))
const out = resolve(REPO, arg('out', `public/images/art/${sketchArg.split('/').pop().replace(/\.js$/, '')}.png`))

const stage = mkdtempSync(join(tmpdir(), 'p5paint-'))
// p5.brush version is pinnable: the brush registry differs between releases.
const brushVer = arg('p5brush', '2.1.0-beta')
// UI chrome (rules, underlines, deckle edges) has to sit on any ground, so it
// needs a real alpha channel rather than a baked-in paper colour.
const transparent = process.argv.includes('--transparent')
writeFileSync(
  join(stage, 'index.html'),
  readFileSync(join(HERE, 'template.html'), 'utf8')
    .replace('__BRUSHVER__', brushVer)
    .replace('__BG__', transparent ? 'transparent' : '#fff')
)
copyFileSync(sketchPath, join(stage, 'sketch.js'))

// The shared libraries, loaded before every sketch.
for (const lib of ['figurekit.js', 'watercolour.js']) {
  if (existsSync(join(HERE, lib))) copyFileSync(join(HERE, lib), join(stage, lib))
}

// A handwriting face for axis labels: p5.brush draws no text, so labels come
// from p5's own text(), and a hand face keeps them in the notebook.
const fontSrc = arg('font', '/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf')
if (existsSync(fontSrc)) copyFileSync(fontSrc, join(stage, 'label.ttf'))

// Figures are data-driven: --data points at JSON that lands in the page as DATA.
const dataArg = arg('data', null)
const data = dataArg ? readFileSync(resolve(REPO, dataArg), 'utf8') : 'null'

writeFileSync(
  join(stage, 'config.js'),
  `const CANVAS_W = ${w};\nconst CANVAS_H = ${h};\nconst SEED = ${seed};\nconst DATA = ${data};\nconst TRANSPARENT = ${transparent};\n`
)

mkdirSync(dirname(out), { recursive: true })
const shot = join(stage, 'out.png')

console.log(`painting ${sketchArg} @ ${w}x${h} seed=${seed} ...`)
const t0 = Date.now()
try {
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--hide-scrollbars',
      '--disable-lcd-text',
      // SwiftShader gives us WebGL without a GPU; p5.brush is WEBGL-only.
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--allow-file-access-from-files',
      ...(transparent ? ['--default-background-color=00000000'] : []),
      `--screenshot=${shot}`,
      `--window-size=${w},${h}`,
      // Virtual time, not wall time: it stalls while the sketch is painting.
      '--virtual-time-budget=600000',
      `file://${stage}/index.html`,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'], timeout: 15 * 60 * 1000 }
  )
} catch (err) {
  const stderr = err.stderr?.toString() ?? ''
  // Chrome logs GL/mach warnings to stderr and still exits fine; only the
  // absence of a written screenshot is a real failure.
  if (!stderr.includes('written to file')) {
    console.error(stderr.split('\n').filter((l) => /ERROR|FATAL/.test(l)).slice(0, 8).join('\n'))
    console.error('render failed')
    process.exit(1)
  }
}

renameSync(shot, out)
console.log(`→ ${out.replace(REPO + '/', '')}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
