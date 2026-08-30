/**
 * strip-intermediates.mjs — keep render intermediates out of the deploy.
 *
 * The paint pipeline writes a PNG and we convert it to WebP; the app only ever
 * references the WebP. But the PNG lives in public/ so the renderer can write it
 * next to its sibling, and Vite copies everything in public/ into dist -
 * publishing ~10MB of intermediates that nothing loads. They are gitignored, so
 * this never showed up in a diff.
 *
 * The rule is deliberately narrow: delete a PNG only if a WebP of the same name
 * sits beside it. Files with no WebP twin are real assets - the drawn UI chrome
 * in images/ui, the logos, the matplotlib figures in the blog posts - and must
 * survive.
 */
import { readdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'dist/images'
let freed = 0
let removed = 0

function walk(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      walk(path)
    } else if (name.endsWith('.png') && existsSync(path.replace(/\.png$/, '.webp'))) {
      freed += statSync(path).size
      rmSync(path)
      removed++
    }
  }
}

walk(ROOT)
console.log(
  `strip: removed ${removed} render intermediate${removed === 1 ? '' : 's'} ` +
    `(${(freed / 1e6).toFixed(1)} MB) that had a .webp twin`
)
