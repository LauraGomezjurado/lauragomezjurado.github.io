/**
 * watercolour — helpers for making p5.brush look actually wet.
 *
 * For background art, not for plots. Figures want crisp marks; paintings want
 * pigment that pools, granulates and sits down into the paper.
 *
 * What was learned by testing, in case it saves anyone the renders:
 *
 *   - Wetness comes from the FILL system, not from a brush. There is no
 *     "watercolor" brush in p5.brush 2.1.0-beta; `brush.box()` lists exactly
 *     eleven, all dry media: pen, rotring, 2B, HB, 2H, cpencil, pastel, crayon,
 *     charcoal, spray, marker.
 *   - `fillBleed(0.7, 'out')` is what produces cauliflower blooms. Below ~0.5
 *     it reads as an airbrush; at 0.7 it reads as water moving.
 *   - Depth comes from LAYERS. Three translucent passes (alpha 80-100) in
 *     related hues beat one opaque pass every time.
 *   - `wash()` flattens and dulls a shape; `mass()` makes it opaque, which is
 *     body colour, not watercolour. Both are off here by default.
 *   - Real paper is the other half of the effect. WC.paper() multiplies a
 *     two-octave tooth over the finished painting. Depth ~18; past 25 it turns
 *     the sheet grey.
 */
const WC = {
  /**
   * One pigment box for the whole series.
   *
   * A set of plates goes monotone if every one reaches for the same three
   * colours, but it falls apart if each invents its own. Real watercolour work
   * stays coherent the same way: the painter owns ONE box and picks two or
   * three pans per painting. Paper and pencil never change; the selection does.
   *
   * Named after the actual pigments so a selection can be reasoned about as
   * paint rather than as hex codes.
   */
  PIGMENTS: {
    indigo: '#455571',
    payne: '#6E7C92',
    ultramarine: '#5B6E96',
    teal: '#4E7A78',
    sap: '#6B7A55',
    olive: '#6B705C',
    ochre: '#B98A46',
    raw: '#C08A4E',
    sienna: '#A8654A',
    madder: '#94566A',
    rose: '#B4738A',
    sepia: '#5A4436',
  },

  /** Pull a named selection out of the box. */
  pans(...names) {
    return names.map((n) => {
      const c = this.PIGMENTS[n]
      if (!c) throw new Error(`no pigment "${n}" in the box`)
      return c
    })
  },

  /**
   * Force p5.brush to flush its batch.
   *
   * p5.brush applies state changes to geometry that has not been flushed yet,
   * so calling brush.set() after drawing shapes can retroactively stroke them.
   * A blendMode call flushes, which makes it a cheap barrier between a fill
   * phase and a stroke phase. Without this, washes come out with hard outlines.
   */
  flush() {
    blendMode(BLEND)
  },

  /**
   * Cold-press tooth as a multiply layer: one fine octave for the grain, one
   * coarse for the cloudiness of handmade sheets. Slightly warm, so it tints
   * toward the paper rather than toward grey.
   */
  paper(w, h, depth = 18, fine = 0.3, coarse = 0.07) {
    const g = createGraphics(w, h)
    g.loadPixels()
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = 0.7 * noise(x * fine, y * fine) + 0.3 * noise(x * coarse, y * coarse)
        const v = 255 - n * depth
        const i = 4 * (y * w + x)
        g.pixels[i] = v
        g.pixels[i + 1] = v - 2
        g.pixels[i + 2] = v - 6
        g.pixels[i + 3] = 255
      }
    }
    g.updatePixels()
    return g
  },

  /** Lay the tooth over everything painted so far. Call last. */
  applyPaper(depth = 18) {
    const g = this.paper(width, height, depth)
    blendMode(MULTIPLY)
    image(g, 0, 0, width, height)
    blendMode(BLEND)
  },

  /** Set up the fill state for a wet pass. */
  wet(bleed = 0.7, tex = 0.4, border = 0.2) {
    brush.noStroke()
    brush.noHatch()
    brush.noWash()
    brush.noMass()
    brush.fillTexture(tex, border)
    brush.fillBleed(bleed, 'out')
  },

  /**
   * Paint a shape as several translucent passes, each nudged and re-hued, the
   * way a wash is built up rather than laid down once.
   *
   * path(i) must emit the shape's vertices for pass i via brush.vertex().
   */
  layers(path, passes) {
    for (let i = 0; i < passes.length; i++) {
      const p = passes[i]
      this.wet(p.bleed ?? 0.7)
      brush.fill(p.colour, p.alpha ?? 90)
      brush.beginShape(p.curve ?? 0.85)
      path(i)
      brush.endShape(true)
    }
  },

  /**
   * Pigment pooling at a shape's rim: the same outline bleeding INWARD at low
   * alpha, which is what a wash leaves behind as it dries.
   */
  pool(path, colour, alpha = 55, bleed = 0.5) {
    brush.noStroke()
    brush.noHatch()
    brush.fillTexture(0.4, 0.2)
    brush.fillBleed(bleed, 'in')
    brush.fill(colour, alpha)
    brush.beginShape(0.85)
    path(0)
    brush.endShape(true)
  },

  /**
   * Flood a mathematically-defined region with wet touches.
   *
   * inside(x, y) decides membership, so the shape can be a norm ball, a level
   * set, anything with a predicate. Touches are dropped on a jittered grid and
   * kept where they land inside, which fills the form without ever drawing its
   * outline — no hard polygon edge, and the boundary emerges softly the way a
   * wash meets dry paper.
   */
  fillRegion(inside, box, opts = {}) {
    const { colour = '#9C6B4F', alpha = 90, r = 26, cols = 9, rows = 9, bleed = 0.5, seed = 0 } = opts
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const jx = (noise(i * 3.1 + seed, j * 1.7) - 0.5) * (box.w / cols)
        const jy = (noise(i * 1.3, j * 2.9 + seed) - 0.5) * (box.h / rows)
        const x = box.x + ((i + 0.5) / cols) * box.w + jx
        const y = box.y + ((j + 0.5) / rows) * box.h + jy
        if (!inside(x, y)) continue
        this.wet(bleed)
        brush.fill(colour, alpha)
        brush.beginShape(0.9)
        this.blob(x, y, r * (0.7 + 0.5 * noise(i * 5.5, j * 4.1 + seed)), i * 7 + j + seed, 1)()
        brush.endShape(true)
      }
    }
  },

  /* ── plate grammar ────────────────────────────────────────────────────────
   * Shared marks so a set of paintings reads as pages from ONE notebook rather
   * than as unrelated illustrations: same margin, same corner ticks, same
   * leader lines out to the edge, same scale bar. The subject changes; the
   * handwriting does not.
   */

  PENCIL: '#8A7663',

  plateRect(margin = 0.05) {
    const m = width * margin
    return { x: m, y: m, w: width - 2 * m, h: height - 2 * m }
  },

  /** Ruled ticks along the top and left, like a measuring stage. */
  cornerTicks(p, colour = null) {
    const cell = p.h / 14
    const t = p.h * 0.013
    brush.noFill()
    brush.noHatch()
    brush.set('2H', colour || this.PENCIL, 0.2)
    for (let x = p.x, n = 0; x <= p.x + p.w + 1; x += cell / 2, n++) {
      brush.line(x, p.y, x, p.y + (n % 2 ? t * 0.5 : t))
    }
    for (let y = p.y, n = 0; y <= p.y + p.h + 1; y += cell / 2, n++) {
      brush.line(p.x, y, p.x + (n % 2 ? t * 0.5 : t), y)
    }
  },

  /** Leader line out to the margin: dot on the subject, rule at the end. */
  leader(x1, y1, x2, y2, rule, colour = null) {
    brush.noFill()
    brush.noHatch()
    brush.set('2H', colour || this.PENCIL, 0.22)
    brush.line(x1, y1, x2, y2)
    brush.circle(x2, y2, height * 0.005)
    brush.line(x2, y2, x2 + rule, y2)
  },

  /** Specimen scale bar with a half-division tick. */
  scaleBar(p, colour = null) {
    const x = p.x + p.w * 0.05
    const y = p.y + p.h * 0.93
    const len = p.w * 0.1
    const t = p.h * 0.011
    brush.noFill()
    brush.set('HB', colour || this.PENCIL, 0.28)
    brush.line(x, y, x + len, y)
    brush.line(x, y - t, x, y + t)
    brush.line(x + len / 2, y - t * 0.5, x + len / 2, y + t * 0.5)
    brush.line(x + len, y - t, x + len, y + t)
  },

  /** An organic closed blob, for washes that should not read as circles. */
  blob(cx, cy, r, seed, squash = 1, step = 24) {
    return () => {
      for (let a = 0; a < 360; a += step) {
        const rr = r * (0.74 + 0.46 * noise(a * 0.02 + seed, seed))
        brush.vertex(cx + cos(a) * rr, cy + sin(a) * rr * squash)
      }
    }
  },
}
