/**
 * extract_affiliations.mjs — the source logos behind the painted affiliation
 * marks, packed as DATA for sketches/mark-affiliation.js.
 *
 * The shapes come from the real logos, not from a redrawing:
 *   - Stanford: public/stanford-logo.png, the block S with the tree.
 *   - Microsoft: public/images/microsoft-logo.svg, the four squares.
 *   - United Nations: data/logos/un-emblem.svg, the emblem outline from
 *     simple-icons (CC0), coloured UN blue.
 *
 * Each ink maps one colour in the source to three pans (body, deep, light).
 * An ink with no pans is the paper: classified, then left unpainted.
 *
 *   node scripts/paint/data/extract_affiliations.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../../..')

const dataUrl = (path) => {
  const mime = path.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  return `data:${mime};base64,${readFileSync(resolve(REPO, path)).toString('base64')}`
}

const LOGOS = {
  stanford: {
    src: 'public/stanford-logo.png',
    inks: [
      { key: '#ffffff' },
      // Cardinal, and the redwood's green.
      { key: '#a80532', pans: ['#9E1B32', '#6E0F22', '#C0485A'], r: 0.1 },
      { key: '#007662', pans: ['#1E6B58', '#0F4A3C', '#4C8C74'], r: 0.03 },
    ],
  },
  microsoft: {
    src: 'public/images/microsoft-logo.svg',
    inks: [
      { key: '#f3f3f3' },
      { key: '#f35325', pans: ['#E4572E', '#B23A1C', '#F08A62'], r: 0.08 },
      { key: '#81bc06', pans: ['#7FAE1E', '#557A10', '#A8C95A'], r: 0.08 },
      { key: '#05a6f0', pans: ['#1E9AD8', '#12699A', '#6BBDE6'], r: 0.08 },
      { key: '#ffba08', pans: ['#F2B01E', '#C08410', '#F6CD6A'], r: 0.08 },
    ],
  },
  un: {
    src: 'scripts/paint/data/logos/un-emblem.svg',
    inks: [{ key: '#009edb', pans: ['#1C8CC8', '#0F5E8C', '#5DB0DE'], r: 0.025 }],
  },
}

for (const [name, { src, inks }] of Object.entries(LOGOS)) {
  const out = resolve(HERE, `logo-${name}.json`)
  writeFileSync(out, JSON.stringify({ name, src: dataUrl(src), inks }) + '\n')
  console.log(`→ ${out.replace(REPO + '/', '')}`)
}
