/**
 * brushes.js — the site's own brushes.
 *
 * scripts/paint/README.md records this as an unfinished lead:
 *
 *   "A `watercolor` brush ... has to be registered with brush.add(name,
 *    {type:'custom', ..., tip}). Registering one works — it appears in box() —
 *    but nothing I passed as a tip actually rendered. Unfinished lead; check
 *    the p5.brush source for the exact tip contract before trying again."
 *
 * The contract, from p5.brush 2.2.2 (the beta the sketches were pinned to
 * predates it being documented, and the tip path was unreliable there):
 *
 *   - `tip: (_m) => {...}` receives a p5.Graphics buffer.
 *   - Its coordinate space is 100x100 with the ORIGIN AT THE CENTRE, so shapes
 *     are drawn around (0,0) and the edges are at roughly +/-50. Marks drawn at
 *     single-digit sizes near the origin are the ones that vanish.
 *   - The buffer is converted to a MASK: dark fills become opaque, light or
 *     white becomes transparent. So the tip is defined in dark tones and the
 *     actual colour arrives later from brush.set() / brush.stroke().
 *
 * There is also a `type: "image"` path that takes a photograph as the tip. That
 * is the better version of everything here: one scan of a real brushstroke would
 * make every mark on the site - plates and interface chrome alike - physically
 * Laura's. See registerScannedBrush() at the bottom; it is wired and waiting on
 * an image.
 *
 * All of these are DRY-media shapes used WET: p5.brush's eleven presets are all
 * dry, and wetness in this pipeline comes from the fill system (WC.wet). What a
 * custom tip buys is the character of the individual mark - a ragged, uneven
 * edge instead of the tidy ellipse the built-ins stamp.
 *
 * CALIBRATION (from sketches/brush-sweep.js, a radius x weight grid). Tip radius
 * and brush weight both scale the mark, and the ratio between them - not either
 * one alone - decides the character:
 *
 *   SMALL radius + HIGH weight  -> granular, broken, stamps land separately and
 *                                  pool. This is the wet-looking end.
 *   LARGE radius + LOW weight   -> smooth and solid, stamps overlap into a slab.
 *
 * That is backwards from the obvious guess (that a big soft tip would be the
 * soft one), and it is why the first pass at these brushes came out thin and
 * lifeless: big radius at low weight just makes a tidy solid line. Anything
 * aiming for "wet" wants a SMALL tip driven hard.
 */
/* global brush */

const BRUSHES = (() => {
  /**
   * A torn, uneven blob. Deterministic given p5's seed, which matters because
   * renders have to be comparable across runs.
   *
   * Built as one closed shape rather than scattered dots: scattered dots read as
   * spray no matter how they are tuned, while a single irregular outline keeps a
   * mark that has a direction and a heavier side, the way a loaded brush does.
   */
  function raggedTip(_m, { r = 26, lobes = 9, rough = 0.34, tone = 0 } = {}) {
    _m.noStroke()
    _m.fill(tone)
    _m.beginShape()
    for (let i = 0; i < lobes; i++) {
      const a = (i / lobes) * 360
      // Two octaves: a slow swell around the tip, plus a fine bite on the edge.
      const swell = 1 + rough * (noise(i * 0.55, 11.3) - 0.5) * 2
      const bite = 1 + rough * 0.45 * (noise(i * 2.7, 4.1) - 0.5) * 2
      const rr = r * swell * bite
      _m.vertex(rr * cos(a), rr * sin(a))
    }
    _m.endShape(CLOSE)
  }

  return {
    /**
     * `wash` — the broad, soft, low-opacity mark for laying colour.
     * Big tip, heavy overlap (spacing well under 1), pressure swelling in the
     * middle so a stroke is fattest where the hand slows.
     */
    wash: {
      type: 'custom',
      weight: 3.5,
      scatter: 1.2,
      opacity: 30,
      spacing: 0.4,
      pressure: [0.55, 1.5, 0.6],
      tip: (_m) => raggedTip(_m, { r: 26, lobes: 9, rough: 0.3 }),
      rotate: 'natural',
      markerTip: false,
      noise: 0.45,
    },

    /**
     * `wet-edge` — the darker rim a wash leaves where it pools and dries.
     * Smaller and rougher than `wash`, and rotated at random so repeated passes
     * along one boundary never tile.
     */
    'wet-edge': {
      type: 'custom',
      weight: 11,
      scatter: 0.9,
      opacity: 38,
      spacing: 0.55,
      pressure: [1.2, 0.5],
      tip: (_m) => raggedTip(_m, { r: 9, lobes: 11, rough: 0.5 }),
      rotate: 'random',
      markerTip: false,
      noise: 0.6,
    },

    /**
     * `dry` — a scratchy, broken mark for tooth and texture. Wide spacing means
     * the stamps do NOT overlap, which is what leaves paper showing through.
     */
    dry: {
      type: 'custom',
      weight: 13,
      scatter: 2.6,
      opacity: 45,
      spacing: 1.15,
      pressure: [0.4, 1.3, 0.35],
      tip: (_m) => raggedTip(_m, { r: 5, lobes: 7, rough: 0.62 }),
      rotate: 'random',
      markerTip: false,
      noise: 0.7,
    },
  }
})()

/** Register every custom brush. Call once, after createCanvas(). */
function registerBrushes() {
  for (const [name, params] of Object.entries(BRUSHES)) {
    brush.add(name, params)
  }
}

/**
 * Register a brush whose tip is a photograph — a real stroke on real paper.
 *
 * `brush.add` returns a Promise for image brushes, so setup() must be async and
 * this must be awaited before anything is drawn with it.
 *
 *   await registerScannedBrush('./brush-tip.jpg')
 *   brush.set('scanned', WC.PIGMENTS.indigo, 2)
 */
async function registerScannedBrush(src, name = 'scanned') {
  return brush.add(name, {
    type: 'image',
    weight: 9,
    scatter: 1.8,
    opacity: 28,
    spacing: 0.9,
    pressure: [1, 0.55],
    image: { src },
    rotate: 'random',
    markerTip: false,
    noise: 0.4,
  })
}
