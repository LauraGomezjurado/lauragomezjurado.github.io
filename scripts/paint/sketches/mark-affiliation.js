/**
 * mark-affiliation — an institution's logo, painted.
 *
 * The affiliation row in About used to draw these as flat SVG in the page's ink.
 * That made them the only drawings on the site nobody painted, and it also made
 * them wrong: a Georgia "S" with a triangle through it is not Stanford's block S,
 * and the UN's globe had lost its continents. Both have the same fix: the SHAPE
 * comes from the real logo, the PAINT comes from this pipeline.
 *
 * DATA (see data/extract_affiliations.mjs) carries the logo as an image plus a
 * short list of inks, each keyed to a colour in that image:
 *
 *   { src: 'data:image/...', inks: [{ key: '#a80532', pans: [body, deep, light], r }, ...] }
 *
 * Pixels are classified to the nearest key; keys with no pans are the paper and
 * stay unpainted, which is how the white rule inside Stanford's S survives.
 *
 * WHY THIS ONE DOES NOT USE brush.fill
 * A logo is mostly thin structure (redwood branches, UN meridians, olive
 * leaves). Filling that with p5.brush touches small enough to hold the line
 * takes thousands of bleeding fills, and each costs 0.5-2s under SwiftShader:
 * hours per mark. So this paints the way p5.brush's own watercolour fill works
 * underneath (Tyler Hobbs' method): a deformed polygon glazed dozens of times at
 * a few percent alpha, each glaze re-deformed, so pigment piles up unevenly and
 * the edges bloom. Those washes are laid over the whole region and then held to
 * the logo by its mask, with the mask's edge wobbled by noise so it reads as
 * paint meeting dry paper rather than a stencil. Pigment then pools at the rim
 * and granulates in the paper's tooth, which is what makes it watercolour and
 * not a tint. Renders in a couple of seconds.
 *
 *   node scripts/paint/render.mjs sketches/mark-affiliation.js \
 *     --data scripts/paint/data/logo-stanford.json \
 *     --size 400x480 --seed 3 --transparent --out public/images/marks/stanford.png
 */
/* global CANVAS_W, CANVAS_H, SEED, DATA, PAPER, TRANSPARENT, createCanvas, WEBGL, pixelDensity, randomSeed, noiseSeed, noLoop, createGraphics, clear, image, width, height, random, randomGaussian, noise, constrain, TWO_PI */

let READY = null

function setup() {
  // WEBGL only because p5.brush (loaded by the template for every sketch)
  // refuses anything else. The painting itself happens on 2D layers.
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  pixelDensity(1)
  randomSeed(SEED)
  noiseSeed(SEED)
  noLoop()
  READY = classify(DATA)
}

async function draw() {
  const G = await READY
  const sheet = createGraphics(width, height)
  sheet.pixelDensity(1)
  if (!TRANSPARENT) sheet.background(PAPER)
  DATA.inks.forEach((ink, k) => {
    if (!ink.pans) return
    sheet.drawingContext.drawImage(paintInk(G, k, ink), 0, 0)
  })
  clear()
  image(sheet, -width / 2, -height / 2, width, height)
  window.PAINTED = true
}

/* ── the logo as a grid ─────────────────────────────────────────────────── */

function loadImg(src) {
  return new Promise((res, rej) => {
    const im = new Image()
    im.onload = () => res(im)
    im.onerror = rej
    im.src = src
  })
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

async function classify(data) {
  const im = await loadImg(data.src)
  // Rasterise big, find the logo's bounding box, then fit that box to the
  // canvas. Source files carry their own margins; the mark should not.
  const S = 1200
  const sc = S / Math.max(im.width, im.height)
  const sw = Math.round(im.width * sc)
  const sh = Math.round(im.height * sc)
  const src = document.createElement('canvas')
  src.width = sw
  src.height = sh
  const sctx = src.getContext('2d')
  sctx.drawImage(im, 0, 0, sw, sh)
  const px = sctx.getImageData(0, 0, sw, sh).data
  const keys = data.inks.map((i) => hex(i.key))
  const at = (x, y) => {
    const i = 4 * (y * sw + x)
    if (px[i + 3] < 110) return -1
    let best = -1
    let bd = Infinity
    keys.forEach(([r, g, b], k) => {
      const d = (px[i] - r) ** 2 + (px[i + 1] - g) ** 2 + (px[i + 2] - b) ** 2
      if (d < bd) {
        bd = d
        best = k
      }
    })
    return data.inks[best].pans ? best : -1
  }
  let x0 = sw, y0 = sh, x1 = 0, y1 = 0
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++)
      if (at(x, y) >= 0) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x)
        y0 = Math.min(y0, y); y1 = Math.max(y1, y)
      }

  // Room for the wash to run past the edge without being cut off.
  const m = (data.margin ?? 0.06) * Math.min(width, height)
  const fit = Math.min((width - 2 * m) / (x1 - x0 + 1), (height - 2 * m) / (y1 - y0 + 1))
  const ox = (width - (x1 - x0 + 1) * fit) / 2
  const oy = (height - (y1 - y0 + 1) * fit) / 2

  // Coverage per ink at canvas resolution, supersampled 3x3 so the edge is
  // anti-aliased before any wobble goes on it.
  const w = width
  const h = height
  const cov = data.inks.map(() => new Float32Array(w * h))
  const bbox = data.inks.map(() => ({ x0: w, y0: h, x1: 0, y1: 0 }))
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (let sy = 0; sy < 3; sy++)
        for (let sx = 0; sx < 3; sx++) {
          const u = Math.floor(x0 + (x + (sx + 0.5) / 3 - ox) / fit)
          const v = Math.floor(y0 + (y + (sy + 0.5) / 3 - oy) / fit)
          if (u < x0 || v < y0 || u > x1 || v > y1) continue
          const k = at(u, v)
          if (k < 0) continue
          cov[k][y * w + x] += 1 / 9
          const b = bbox[k]
          b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x)
          b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y)
        }
  return { w, h, cov, bbox }
}

/* ── paint ─────────────────────────────────────────────────────────────── */

function layer(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** Hobbs' deformation: subdivide each edge, push the midpoint off it. */
function deform(pts, depth, spread) {
  let out = pts
  for (let d = 0; d < depth; d++) {
    const next = []
    for (let i = 0; i < out.length; i++) {
      const a = out[i]
      const b = out[(i + 1) % out.length]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      const v = (a.v + b.v) / 2
      next.push(a, {
        x: (a.x + b.x) / 2 + randomGaussian() * len * spread * v,
        y: (a.y + b.y) / 2 + randomGaussian() * len * spread * v,
        v: v * (0.7 + random(0.6)),
      })
    }
    out = next
  }
  return out
}

function blobBase(cx, cy, r) {
  const n = 10
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TWO_PI
    const rr = r * (0.8 + 0.4 * noise(cx * 0.02 + i, cy * 0.02))
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, v: 0.6 + random(0.8) })
  }
  return deform(pts, 2, 0.5)
}

/** One touch of wet paint: ~24 glazes of one re-deformed blob. */
function glaze(ctx, cx, cy, r, colour, strength) {
  const base = blobBase(cx, cy, r)
  ctx.fillStyle = colour
  ctx.strokeStyle = colour
  ctx.lineWidth = Math.max(0.8, r * 0.04)
  for (let g = 0; g < 24; g++) {
    const poly = deform(base, 3, 0.45)
    ctx.globalAlpha = 0.024 * strength
    ctx.beginPath()
    poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.closePath()
    ctx.fill()
    // A faint line at each glaze's edge: where the water stopped, pigment
    // piled up. Stacked, these are the tide marks of a dried bloom.
    if (g % 3 === 0) {
      ctx.globalAlpha = 0.05 * strength
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}

function paintInk(G, k, ink) {
  const { w, h } = G
  const [body, deep, light] = ink.pans
  const b = G.bbox[k]
  const R = Math.min(w, h) * (ink.r ?? 0.08)

  // 1. The washes, laid over the region's whole box. Touches sit on a jittered,
  // half-offset grid (a plain grid shows through as corduroy, README), and only
  // where there is paint to hold them.
  const wash = layer(w, h)
  const wctx = wash.getContext('2d')
  const step = R * 0.9
  const passes = [
    { colour: light, strength: 1.0, every: 1 },
    { colour: body, strength: 1.2, every: 2 },
    { colour: deep, strength: 0.8, every: 5 },
  ]
  const near = (x, y) => {
    const r = Math.ceil(R * 0.8)
    for (let yy = Math.max(0, Math.floor(y - r)); yy < Math.min(h, y + r); yy += 2)
      for (let xx = Math.max(0, Math.floor(x - r)); xx < Math.min(w, x + r); xx += 2)
        if (G.cov[k][yy * w + xx] > 0.5) return true
    return false
  }
  passes.forEach((p) => {
    let n = 0
    for (let y = b.y0 - step * 0.5, row = 0; y <= b.y1 + step * 0.5; y += step, row++)
      for (let x = b.x0 - step * 0.5 + (row % 2) * step * 0.5; x <= b.x1 + step * 0.5; x += step) {
        if (n++ % p.every) continue
        const jx = x + (random() - 0.5) * step * 0.8
        const jy = y + (random() - 0.5) * step * 0.8
        if (!near(jx, jy)) continue
        glaze(wctx, jx, jy, R * (0.75 + random(0.5)), p.colour, p.strength * (0.7 + random(0.6)))
      }
  })

  // 2. Hold the wash to the logo. The mask is softened, then re-thresholded
  // against noise so the edge moves a pixel or two in and out along its length.
  const soft = layer(w, h)
  const sctx = soft.getContext('2d')
  const mimg = sctx.createImageData(w, h)
  for (let i = 0; i < w * h; i++) mimg.data[4 * i + 3] = Math.round(255 * G.cov[k][i])
  sctx.putImageData(mimg, 0, 0)
  const blurred = layer(w, h)
  const bctx = blurred.getContext('2d')
  const blurPx = Math.max(0.8, Math.min(w, h) * 0.004)
  bctx.filter = `blur(${blurPx}px)`
  bctx.drawImage(soft, 0, 0)
  const m = bctx.getImageData(0, 0, w, h).data
  const img = wctx.getImageData(0, 0, w, h)
  const d = img.data
  const [dr, dg, db] = hex(deep)
  const [br, bg, bb] = hex(body)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const mv = m[4 * i + 3] / 255
      if (mv <= 0) {
        d[4 * i + 3] = 0
        continue
      }
      const t = 0.5 + (noise(x * 0.04, y * 0.04, 7) - 0.5) * 0.7
      const hold = constrain((mv - t + 0.18) / 0.36, 0, 1)
      // The rim: pigment carried to the edge as the wash dried.
      const rim = Math.max(0, 1 - Math.abs(mv - t) / 0.2) * hold
      // Granulation: fine grain in the sheet, a slower mottle over it.
      const gran = 0.85 + 0.2 * noise(x * 0.16, y * 0.16, 3) + 0.2 * (noise(x * 0.02, y * 0.02, 5) - 0.5)
      // Where no glaze reached, the RGB is black; start from the body colour.
      if (d[4 * i + 3] === 0) {
        d[4 * i] = br; d[4 * i + 1] = bg; d[4 * i + 2] = bb
      }
      let a = (d[4 * i + 3] / 255) * gran * hold
      // Never let a painted region go bare: a pale floor of the body colour.
      a = Math.max(a, 0.2 * hold)
      const mix = Math.min(1, rim * 0.4)
      d[4 * i] = d[4 * i] * (1 - mix) + dr * mix
      d[4 * i + 1] = d[4 * i + 1] * (1 - mix) + dg * mix
      d[4 * i + 2] = d[4 * i + 2] * (1 - mix) + db * mix
      d[4 * i + 3] = Math.round(255 * Math.min(0.92, a + rim * 0.28))
    }
  wctx.putImageData(img, 0, 0)
  return wash
}
