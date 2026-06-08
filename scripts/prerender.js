// Build-time prerendering for GitHub Pages.
//
// The site is a client-only SPA, so without this every /blog/<slug> URL is a
// real HTTP 404 (papered over in the browser by public/404.html + the redirect
// decode in src/App.jsx). Crawlers, link-preview bots, and anything that does
// not run JS see only that 404.
//
// This script runs after `vite build` (wired as the npm "postbuild" hook). For
// each post it writes dist/blog/<slug>/index.html — a real file GitHub Pages
// serves with a 200, carrying per-post <title>, description, and Open Graph /
// Twitter tags so links unfurl and search engines index real content. The app's
// JS still boots normally on top of it (BrowserRouter reads the same path).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { blogPosts } from '../src/data/posts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')

const ORIGIN = 'https://lauragomezjurado.github.io'
const SITE_NAME = 'Laura Gomezjurado Gonzalez'
const DEFAULT_IMAGE = `${ORIGIN}/profile.jpg`

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Collapse whitespace and cap length for use inside meta tags.
const toMeta = (s, max = 200) => {
  const clean = String(s).replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')

const buildHead = (post) => {
  const title = `${post.title} — ${SITE_NAME}`
  const description = toMeta(post.excerpt)
  const url = `${ORIGIN}/blog/${post.slug}`
  // Per-post card image (absolute URL); fall back to the site portrait.
  const image = post.image ? `${ORIGIN}${post.image}` : DEFAULT_IMAGE
  // `summary` shows the abstract (description) text beside a small square image;
  // `summary_large_image` shows a big image with little/no description. Default
  // to summary so the excerpt is visible on the card; a post can override.
  const card = post.card || 'summary'
  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="article:published_time" content="${post.date}" />`,
    `<meta name="twitter:card" content="${card}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ')
}

// Real, unique content for non-JS crawlers. React's createRoot().render()
// replaces #root on hydration, so browser users still get the full app.
const buildRootContent = (post) =>
  `<article style="max-width:760px;margin:0 auto;padding:2rem;font-family:system-ui,sans-serif">` +
  `<p><a href="/blog">← back to blog</a></p>` +
  `<h1>${escapeHtml(post.title)}</h1>` +
  `<p><time datetime="${post.date}">${post.date}</time></p>` +
  `<p>${escapeHtml(post.excerpt)}</p>` +
  `<p>Loading the full post…</p>` +
  `</article>`

let count = 0
for (const post of blogPosts) {
  // Strip the generic site description (the per-post head supplies its own).
  let html = template.replace(/\s*<meta name="description"[^>]*\/>/, '')

  // Replace the single default <title> with the per-post head block.
  const head = buildHead(post)
  if (/<title>[\s\S]*?<\/title>/.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, head)
  } else {
    html = html.replace('</head>', `    ${head}\n  </head>`)
  }

  // Seed #root with crawlable content.
  html = html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${buildRootContent(post)}</div>`,
  )

  const outDir = join(dist, 'blog', post.slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html, 'utf8')
  count += 1
}

console.log(`prerender: wrote ${count} static blog pages to dist/blog/<slug>/index.html`)
