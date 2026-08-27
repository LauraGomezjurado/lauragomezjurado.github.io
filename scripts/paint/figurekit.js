/**
 * figurekit — scientific-figure primitives drawn with p5.brush.
 *
 * The point of this file is that a chart stops being a raster exported from
 * matplotlib and becomes a *drawing*: axes ruled in 2H pencil, series laid down
 * as brush strokes, confidence intervals hatched rather than alpha-filled,
 * findings called out with a leader line into the margin.
 *
 * Every figure sketch gets this loaded before it, so a plot is a handful of FK
 * calls over a data file rather than a bespoke sketch.
 *
 * Lettering is painted too: glyph outlines come from textToContours() and are
 * filled with the same brush that drew the axes, so labels sit IN the drawing
 * rather than on top of it. See FK.text.
 */
const FK = {
  ink: '#2A211A',
  paperColour: '#E6DCC8',
  pencil: '#8C8375',
  // Three series colours that stay inside the site's warm palette but remain
  // separable in greyscale: cool grey, clay, deep green.
  series: ['#8A8378', '#9C6B4F', '#4F6B52'],

  _box: null,
  _xd: null,
  _yd: null,
  _font: null,
  _u: 1, // unit scale, so a figure drawn at 900px reads the same at 2400px

  /* ── setup ─────────────────────────────────────────────────────────────── */

  init(font, brushScale = 3.4) {
    this._font = font
    this._u = width / 900
    this._brushScale = brushScale
    // p5.brush keeps bristle COUNT fixed as brushes scale up, so at high
    // resolution a stroke spreads into a dotted trail. Marks gain weight with
    // resolution to compensate; 1.56 is _u at the 1400px render this was tuned on.
    this._sw = (w) => w * Math.max(1, this._u / 1.56) * 2.2
    // p5.brush keeps a separate global "wash" layer that deposits watercolour
    // spill around fills. On a figure with many small fills (every glyph is
    // one) it drops loose blobs near the last marks drawn. Figures don't want it.
    brush.noWash()
    // ...and a "mass" system that deposits droplets. Both are on by default and
    // both scatter blobs across a figure. Painting wants them; plotting does not.
    brush.noMass()
    brush.scaleBrushes(brushScale)
    textFont(font)
    return this
  },

  /** Plot rectangle in canvas pixels, plus the data domains mapped onto it. */
  plot(box, xdom, ydom) {
    this._box = box
    this._xd = xdom
    this._yd = ydom
    return this
  },

  X(v) {
    const [a, b] = this._xd
    return this._box.x + ((v - a) / (b - a)) * this._box.w
  },

  Y(v) {
    const [a, b] = this._yd
    return this._box.y + this._box.h - ((v - a) / (b - a)) * this._box.h
  },

  /* ── ground ────────────────────────────────────────────────────────────── */

  /** Warm stock plus a few damp blooms, so the sheet is never flat. */
  paper(stains = 3) {
    background(this.paperColour)
    brush.noStroke()
    brush.noHatch()
    brush.fillTexture(0.8, 0.85)
    brush.fillBleed(0.3, 'out')
    // Blooms sit in the margins only. One landing mid-plot reads as a
    // rendering fault rather than as age.
    const spots = [
      [0.06, 0.13],
      [0.95, 0.88],
      [0.14, 0.93],
      [0.92, 0.16],
    ]
    for (let i = 0; i < Math.min(stains, spots.length); i++) {
      brush.fill(i % 2 ? '#6B705C' : '#9C6B4F', 26 + 12 * noise(i * 3.1))
      brush.circle(
        width * spots[i][0],
        height * spots[i][1],
        height * (0.035 + 0.03 * noise(i * 2.2)),
        0.28
      )
    }
  },

  /**
   * Faint gridded stock behind the plot area. Pass data-space positions so the
   * rules land exactly on the ticks; a grid that misses its own ticks reads as
   * texture rather than as a scale.
   */
  grid({ xs = [], ys = [] } = {}) {
    const b = this._box
    brush.noFill()
    brush.noHatch()
    brush.set('2H', this.pencil, this._sw(0.07))
    for (const v of xs) {
      const x = this.X(v)
      brush.line(x, b.y, x, b.y + b.h)
    }
    for (const v of ys) {
      const y = this.Y(v)
      brush.line(b.x, y, b.x + b.w, y)
    }
  },

  /* ── axes ──────────────────────────────────────────────────────────────── */

  /**
   * Rule the left and bottom axes with ticks and labels.
   * xticks: [{ v, label }]   yticks: [{ v, label }]
   */
  axes({ xticks = [], yticks = [], xlabel = '', ylabel = '' }) {
    const b = this._box
    const t = 8 * this._u

    brush.noFill()
    brush.noHatch()
    brush.set('HB', this.ink, this._sw(0.34))
    brush.line(b.x, b.y, b.x, b.y + b.h)
    brush.line(b.x, b.y + b.h, b.x + b.w, b.y + b.h)

    // Strokes first, lettering second. Interleaving brush.line with the glyph
    // fills makes p5.brush spray loose dots around the labels; batching the two
    // kinds of mark keeps the axis clean.
    brush.set('2H', this.ink, this._sw(0.26))
    for (const tk of yticks) {
      const y = this.Y(tk.v)
      brush.line(b.x - t, y, b.x, y)
    }
    for (const tk of xticks) {
      const x = this.X(tk.v)
      brush.line(x, b.y + b.h, x, b.y + b.h + t)
    }

    for (const tk of yticks) {
      this.text(tk.label, b.x - t * 1.9, this.Y(tk.v), { size: 15, align: RIGHT, valign: CENTER })
    }
    for (const tk of xticks) {
      this.text(tk.label, this.X(tk.v), b.y + b.h + t * 2.6, { size: 15, align: CENTER, valign: CENTER })
    }

    if (xlabel) {
      this.text(xlabel, b.x + b.w / 2, b.y + b.h + t * 5.6, { size: 18, align: CENTER, valign: CENTER })
    }
    if (ylabel) {
      this.text(ylabel, b.x - t * 7.2, b.y + b.h / 2, { size: 18, align: CENTER, valign: CENTER, rot: -90 })
    }
  },

  /** A reference level, dashed by hand since p5.brush has no dash pattern. */
  rule(yValue, { colour = null, dash = 9, gap = 7, weight = 0.22 } = {}) {
    const b = this._box
    const y = this.Y(yValue)
    brush.noFill()
    brush.set('2H', colour || this.pencil, this._sw(weight))
    for (let x = b.x; x < b.x + b.w; x += (dash + gap) * this._u) {
      brush.line(x, y, Math.min(x + dash * this._u, b.x + b.w), y)
    }
  },

  /* ── data ──────────────────────────────────────────────────────────────── */

  /** Whiskered confidence interval: a vertical rule with caps. */
  errorBars(points, colour) {
    const cap = 6 * this._u
    brush.noFill()
    brush.noHatch()
    brush.set('2H', colour, this._sw(0.26))
    for (const p of points) {
      if (p.lo == null || p.hi == null) continue
      const x = this.X(p.x)
      brush.line(x, this.Y(p.lo), x, this.Y(p.hi))
      brush.line(x - cap, this.Y(p.lo), x + cap, this.Y(p.lo))
      brush.line(x - cap, this.Y(p.hi), x + cap, this.Y(p.hi))
    }
  },

  /** The series line itself, drawn as a pencil stroke through the points. */
  line(points, colour, weight = 0.4) {
    brush.noFill()
    brush.noHatch()
    brush.set('HB', colour, this._sw(weight))
    for (let i = 0; i < points.length - 1; i++) {
      brush.line(this.X(points[i].x), this.Y(points[i].y), this.X(points[i + 1].x), this.Y(points[i + 1].y))
    }
  },

  /** Markers: filled with pigment, then outlined so they read at small size. */
  markers(points, colour, kind = 'circle') {
    const r = 7 * this._u
    for (const p of points) {
      const x = this.X(p.x)
      const y = this.Y(p.y)

      brush.noStroke()
      brush.noHatch()
      brush.fillTexture(0.4, 0.2)
      brush.fillBleed(0.06, 'out')
      brush.fill(colour, 210)
      this._shape(kind, x, y, r)

      brush.noFill()
      brush.set('2H', this.ink, this._sw(0.24))
      this._shape(kind, x, y, r, true)
    }
  },

  _shape(kind, x, y, r, outline = false) {
    if (kind === 'circle') {
      brush.circle(x, y, r, outline ? 0 : 0.1)
      return
    }
    if (kind === 'square') {
      brush.rect(x, y, r * 1.8, r * 1.8, 'center')
      return
    }
    // triangle
    brush.beginShape(0)
    brush.vertex(x, y - r * 1.15)
    brush.vertex(x + r, y + r * 0.75)
    brush.vertex(x - r, y + r * 0.75)
    brush.endShape(true)
  },

  /** A hatched band between lo and hi across a series, for continuous CIs. */
  band(points, colour, angle = 45) {
    brush.noStroke()
    brush.fill(colour, 40)
    brush.fillBleed(0.08, 'out')
    brush.fillTexture(0.45, 0.25)
    brush.hatchStyle('2H', colour, 0.3)
    brush.hatch(11 * this._u, angle, { rand: 0.12 })
    brush.beginShape(0.25)
    for (const p of points) brush.vertex(this.X(p.x), this.Y(p.hi))
    for (let i = points.length - 1; i >= 0; i--) brush.vertex(this.X(points[i].x), this.Y(points[i].lo))
    brush.endShape(true)
    brush.noHatch()
    brush.noFill()
  },

  /* ── annotation ────────────────────────────────────────────────────────── */

  /* ── lettering ─────────────────────────────────────────────────────────────
   * Labels are PAINTED, not typeset. p5's own text() renders a font as clean
   * filled vectors, which sits on top of a painting instead of inside it: no
   * bristle, no tooth, no ink variation. So we pull the glyph outlines with
   * textToContours() and hand them to the same brush that drew the axes.
   *
   * Two things this has to get right:
   *   - Counters (the hole in an 'a', both rings of a '%') must be knocked back
   *     out. Contour winding sign is NOT reliable for this; even-odd
   *     containment testing is.
   *   - Bristles are scaled for axes, which is far too coarse for a 35px glyph,
   *     so text temporarily drops to a finer brush and restores after.
   */

  _centroid(c) {
    let x = 0
    let y = 0
    for (const p of c) {
      x += p.x
      y += p.y
    }
    return { x: x / c.length, y: y / c.length }
  },

  _area(c) {
    let a = 0
    for (let i = 0; i < c.length; i++) {
      const p = c[i]
      const q = c[(i + 1) % c.length]
      a += p.x * q.y - q.x * p.y
    }
    return Math.abs(a / 2)
  },

  /** Even-odd point-in-polygon, used to tell a counter from a letter body. */
  _inside(pt, poly) {
    let hit = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i]
      const b = poly[j]
      if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) {
        hit = !hit
      }
    }
    return hit
  },

  /**
   * Handwritten label, drawn with the brush.
   * size is in design units; it is scaled by the canvas like everything else.
   */
  text(str, x, y, { size = 16, align = LEFT, valign = BASELINE, rot = 0, colour = null, outline = 0.14, filled = true } = {}) {
    const px = size * this._u
    const c = colour || this.ink
    const lines = String(str).split('\n')
    const lh = px * 1.32

    textFont(this._font)
    textSize(px)
    textAlign(align, valign)

    push()
    translate(x, y)
    if (rot) rotate(rot)

    lines.forEach((ln, i) => {
      if (!ln) return
      const dy = i * lh - ((lines.length - 1) * lh) / 2
      const cs = this._font.textToContours(ln, 0, dy, { sampleFactor: 1.2 })
      if (!cs || !cs.length) return

      // Classify by containment depth: odd depth means it is a counter.
      // A contour is a counter only if its CENTROID sits inside a strictly
      // LARGER contour. Testing ct[0] against any contour misclassified whole
      // letters as holes whenever glyphs overlapped: in "(95%" the 5 fell
      // inside a neighbour and got painted out in paper colour.
      const areas = cs.map((c) => this._area(c))
      const bodies = []
      const holes = []
      cs.forEach((ct, ci) => {
        if (ct.length < 3) return
        const mid = this._centroid(ct)
        let depth = 0
        cs.forEach((other, oi) => {
          if (oi === ci || other.length < 3) return
          if (areas[oi] > areas[ci] && this._inside(mid, other)) depth++
        })
        ;(depth % 2 ? holes : bodies).push(ct)
      })

      brush.noStroke()
      brush.noHatch()
      // Border intensity MUST be 0 here. With a stroke brush left active from
      // the axes, a textured fill border sprays loose dots around the glyphs.
      brush.fillTexture(0.22, 0)
      brush.fillBleed(0, 'out')

      if (filled) {
      brush.fill(c, 255)
      for (const ct of bodies) {
        brush.beginShape(0.02)
        for (const p of ct) brush.vertex(p.x, p.y)
        brush.endShape(true)
      }
      brush.fill(this.paperColour, 255)
      for (const ct of holes) {
        brush.beginShape(0.02)
        for (const p of ct) brush.vertex(p.x, p.y)
        brush.endShape(true)
      }
      }

      // A light drawn edge puts the letter back together after the knockout.
      // Outline as one path per contour. Stroking each sampled segment with a
      // separate brush.line was correct but ~10x slower.
      if (outline) {
        brush.noFill()
        brush.set('2H', c, outline)
        for (const ct of [...bodies, ...holes]) {
          brush.beginShape(0.02)
          for (const p of ct) brush.vertex(p.x, p.y)
          brush.endShape(true)
        }
      }
    })

    pop()
  },

  /**
   * A finding called out into the margin: dot on the datum, leader line, and
   * the note itself. This is the move a paper figure can't make and a notebook
   * page always does.
   */
  note(str, dataX, dataY, textX, textY, { colour = null, size = 15, align = RIGHT } = {}) {
    const c = colour || this.ink
    const x1 = this.X(dataX)
    const y1 = this.Y(dataY)

    // Stop the leader clear of the text block. The note is set RIGHT-aligned
    // ending at textX, so the line approaching from a datum on the right can
    // terminate just past textX without ever crossing a glyph.
    const pad = 9 * this._u
    const stopX = align === RIGHT ? textX + pad : textX - pad

    brush.noFill()
    brush.noHatch()
    brush.set('2H', c, this._sw(0.24))
    brush.line(x1, y1, stopX, textY)
    brush.circle(x1, y1, 3.5 * this._u)
    this.text(str, textX, textY, { size, align, valign: CENTER, colour: c })
  },

  /** Hand-ruled legend: a swatch stroke, a marker, and the label. */
  legend(entries, x, y, { size = 15, gap = 26 } = {}) {
    const yy = (i) => y + i * gap * this._u
    const mx = x + 13 * this._u
    const r = 6.5 * this._u

    brush.noFill()
    brush.noHatch()
    entries.forEach((e, i) => {
      brush.set('HB', e.colour, this._sw(0.4))
      brush.line(x, yy(i), x + 26 * this._u, yy(i))
    })

    entries.forEach((e, i) => {
      brush.noStroke()
      brush.fillTexture(0.4, 0.2)
      brush.fillBleed(0.06, 'out')
      brush.fill(e.colour, 210)
      this._shape(e.marker || 'circle', mx, yy(i), r)
      brush.noFill()
      brush.set('2H', this.ink, this._sw(0.22))
      this._shape(e.marker || 'circle', mx, yy(i), r, true)
    })

    entries.forEach((e, i) => {
      this.text(e.label, x + 36 * this._u, yy(i), { size, valign: CENTER })
    })
  },

  /** The darkened, ragged edge of a page that has been handled. */
  edge(depth = 0.006) {
    const e = width * depth
    brush.noStroke()
    brush.noHatch()
    brush.fill(this.ink, 22)
    brush.fillBleed(0.12, 'in')
    brush.fillTexture(0.7, 0.6)
    brush.field('hand')
    brush.rect(width / 2, e / 2, width, e, 'center')
    brush.rect(width / 2, height - e / 2, width, e, 'center')
    brush.rect(e / 2, height / 2, e, height, 'center')
    brush.rect(width - e / 2, height / 2, e, height, 'center')
    brush.noField()
  },
}
