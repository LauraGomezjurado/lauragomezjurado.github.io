/**
 * fig-depth-sweet-spot — the v3_medium depth sweep, drawn rather than plotted.
 *
 * Same numbers as public/images/blog/latent-thought/fig2_v3m_depth_sweet_spot.png,
 * read from the run outputs by scripts/paint/data/extract_depth_sweet_spot.py.
 * Nothing here is traced off the matplotlib render.
 *
 *   python3 scripts/paint/data/extract_depth_sweet_spot.py
 *   node scripts/paint/render.mjs sketches/fig-depth-sweet-spot.js \
 *     --data scripts/paint/data/depth-sweet-spot.json --size 1400x900
 */

let font
const MARKERS = ['circle', 'square', 'triangle']

// The three scopes sit at identical depths, so they are dodged apart on x.
// Without this the whiskers stack into an unreadable ladder, which is the one
// thing the matplotlib version genuinely struggles with.
const DODGE = [-0.07, 0, 0.07]

async function setup() {
  createCanvas(CANVAS_W, CANVAS_H, WEBGL)
  font = await loadFont('label.ttf')
  angleMode(DEGREES)
  randomSeed(SEED)
  noiseSeed(SEED)
  noLoop()
}

function draw() {
  translate(-width / 2, -height / 2)

  // One scale for the whole figure: fine enough for lettering, with mark
  // weights scaled up in the kit to compensate.
  FK.init(font, 1.1)
  FK.paper(3)

  const box = {
    x: width * 0.15,
    y: height * 0.17,
    w: width * 0.66,
    h: height * 0.6,
  }
  FK.plot(box, [-0.36, 2.36], [DATA.y.min, DATA.y.max])
  FK.grid({ xs: [0, 1, 2], ys: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8] })

  // Chance, the line every AUC in this figure is being read against.
  FK.rule(DATA.y.chance, { weight: 0.24 })
  FK.text('chance', box.x + box.w + 10 * (width / 900), FK.Y(DATA.y.chance), {
    size: 13,
    valign: CENTER,
    colour: FK.pencil,
  })

  DATA.series.forEach((s, i) => {
    const colour = FK.series[i]
    const pts = s.points.map((p) => ({ ...p, x: p.x + DODGE[i] }))
    FK.errorBars(pts, colour)
    FK.line(pts, colour)
    FK.markers(pts, colour, MARKERS[i])
  })

  FK.axes({
    xticks: DATA.x.ticks.map((label, i) => ({ v: i, label })),
    yticks: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((v) => ({ v, label: v.toFixed(1) })),
    xlabel: DATA.x.label,
    ylabel: DATA.y.label,
  })

  FK.text(DATA.title, box.x + box.w / 2, height * 0.11, { size: 21, align: CENTER, valign: CENTER })

  FK.legend(
    DATA.series.map((s, i) => ({ label: s.label, colour: FK.series[i], marker: MARKERS[i] })),
    box.x + box.w * 0.63,
    box.y + box.h * 0.1
  )

  // The finding, written in the margin the way you would on the page itself.
  const cot = DATA.series.find((s) => s.key === 'cot_only')
  FK.note(
    'sweet spot:\nprompt at chance,\nchannel +0.10',
    1 + DODGE[1],
    cot.points[1].y,
    box.x + box.w * 0.33,
    box.y + box.h * 0.13,
    { colour: FK.series[2], size: 15 }
  )

}
