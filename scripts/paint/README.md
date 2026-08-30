# Painted figures

Figures on this site are **drawn**, not exported. Each one is a p5.brush sketch
driven by the real numbers from the experiment repo it belongs to, rendered
headlessly to a PNG.

This is the approach from [Surya Narreddi's "RL-ing Qwen to paint with
code"](https://surya.website/rling-qwen-to-paint-with-code), minus the trained
model. What carries over is the stack and the architecture:

- **[p5.brush](https://github.com/acamposuribe/p5.brush)** does the painting.
  It simulates bristles, watercolour bleed and paper tooth. This is where the
  softness comes from, and it is an open library independent of that project.
- **Code is the artifact.** The output of a figure is an editable sketch, not a
  raster, so a figure can be re-rendered at any size and re-driven by new data.
- **A short API allowlist.** Their GEPA finding was that handing a model the
  full p5.brush docs made it hallucinate methods, and a strict allowlist fixed
  it. The kit deliberately uses only these, all verified against working
  sketches: `set` `fill` `noFill` `noStroke` `fillBleed` `fillTexture` `hatch`
  `hatchStyle` `noHatch` `field` `noField` `line` `circle` `rect` `beginShape`
  `vertex` `endShape` `flowLine` `scaleBrushes`.
- **Render, look, revise.** Their reward loop, run by hand. Expect two or three
  passes per figure; the first render of anything is usually too faint. Budget
  more for anything new: the lettering took about a dozen passes to get right.

Their RL checkpoint is not used and is not needed. It exists to make a small
model emit valid p5.brush reliably, which is not a problem we have.

## Layout

    render.mjs      headless-Chrome renderer: sketch + data -> PNG
    template.html   loads p5, p5.brush, config, figurekit, sketch
    figurekit.js    FK.*  — axes, series, error bars, hatched bands, notes
    sketches/       one file per figure or painting
    data/           extractors + the JSON they emit

## Rendering

    node scripts/paint/render.mjs sketches/<name>.js \
      --data scripts/paint/data/<name>.json \
      --size 2100x1350 --seed 7 \
      --out public/images/blog/<post>/<name>.png

Flags: `--size WxH`, `--seed n`, `--out path`, `--data path`, `--font path`
(defaults to Bradley Hand). Renders take 15–25s.

Sketches receive `CANVAS_W`, `CANVAS_H`, `SEED` and `DATA` as globals, so one
sketch renders at any size and the same sketch can serve several datasets.

## Before committing a plate

The renderer emits PNG. Convert to WebP for the site — 10MB of plates becomes
about 460KB, with no visible difference on soft washes:

    cwebp -q 82 public/images/art/plate-foo.png -o public/images/art/plate-foo.webp

The `.png` is gitignored as an intermediate; reference the `.webp` from the app.

## Adding a figure

1. Write an extractor in `data/` that reads the source repo's run outputs and
   writes a small JSON. Keep it as an extractor, not a copy-paste of numbers,
   so the drawing regenerates when the experiment does.
2. Write a sketch in `sketches/` that calls `FK.*` over `DATA`.
3. Render, look at the PNG, fix, repeat.

## Marks vs plates

A plate is a full composition on its own sheet. A MARK is the same sketch
rendered with `--transparent`: the drawing only, no paper, no corner ticks, no
scale bar. Marks go in `public/images/marks/` and are what the site scatters
through its sections.

This distinction is load-bearing. Reusing a full plate as a small decoration
puts an opaque sheet on the page, and it reads as a pasted rectangle with the
drawing lost inside it. Feathering the edges does not fix it, and compositing
with `multiply` makes it worse — multiplying the plate's own paper against the
page just darkens the patch. **An opaque background cannot be hidden; it has to
not be rendered.**

    node scripts/paint/render.mjs sketches/plate-norm-balls.js --transparent \
      --size 900x580 --seed 4 --out public/images/marks/norm-balls.png
    cwebp -q 88 -alpha_q 100 public/images/marks/norm-balls.png -o .../norm-balls.webp

Always check a mark composited over the page colour at its real display size,
not as a raw asset on a checkerboard. An asset that looks fine at 900px can be
an invisible smudge at 300px.

## Interface chrome

`sketches/chrome.js` renders the UI's own parts — divider rules, button
underlines, corner ticks, deckle edges — with `--transparent` so they carry a
real alpha channel and composite onto any ground. The point is that the
interface should not merely match the paintings but be made by the same pencil.
See `public/soft.css` and `public/soft-pass.html`.

    node scripts/paint/render.mjs sketches/chrome.js --transparent \
      --data scripts/paint/data/chrome-rule.json --size 1200x26 \
      --out public/images/ui/rule.png

## One pigment box, a different selection per plate

`WC.PIGMENTS` holds the whole series' colours, named after real pans (indigo,
payne, teal, sap, ochre, sienna, madder, rose, sepia...). Each plate picks two
or three with `WC.pans('indigo', 'madder', 'teal')`.

This exists because a series fails in both directions: every plate in the same
three colours is monotone to scroll through, and every plate inventing its own
palette stops being a series. Real watercolour work resolves it the way a
painter does — one box, a different selection per painting. **Paper and pencil
never change.** Only the pans do.

Current selections, ordered as the page scrolls, so the temperature keeps
moving: attractor `indigo/madder/teal` (cool) -> norm balls `sap/ochre/sienna`
(warm) -> spectrum `sienna/raw` with `payne` for the discarded tail (hot) ->
latent chain `teal/ochre/madder` (contrast) -> loss basin `payne/rose/olive`
(muted, because type sits on it).

## Background art vs figures

`figurekit.js` (FK) is for plots: crisp marks, `noWash()`, `noMass()`.
`watercolour.js` (WC) is for background art, and wants the opposite.

There is **no `watercolor` brush** in p5.brush 2.1.0-beta. `brush.box()` lists
eleven, all dry media: `pen rotring 2B HB 2H cpencil pastel crayon charcoal
spray marker`. Wetness comes from the FILL system instead:

- `fillBleed(0.5-0.75, 'out')` is what makes cauliflower blooms. Below ~0.4 it
  reads as an airbrush. Scale it DOWN as shapes get bigger: 0.75 on a 100px
  blob looks like water moving, on a 400px shape it thins the pigment to nothing.
- **Depth comes from layers**, not opacity. Dozens of overlapping translucent
  touches (alpha 60-120) in related hues beat one strong fill.
- Paint with **oriented touches, never one filled hull**. A hull gives hard
  polygon edges that read as a cut-out. If the subject has structure to follow
  (here, the trajectory), lay the touches along it and the form appears where
  they overlap.
- `wash()` flattens and dulls; `mass()` goes opaque, which is body colour.
  Neither is the wet look.
- **Put the drawing UNDER the paint**, then glaze over it. Line work on top
  always reads as a diagram resting on a wash.
- Fine pencils render crisp at ANY weight, so a light line needs a light
  COLOUR, not a small weight.
- Finish with `WC.applyPaper(18-20)`. Past ~25 the sheet goes grey.

**Cap the brush scale on paintings too.** Brush size sets how fine the bleed
is, so letting it grow with resolution makes the blooms coarse and stops the
touches merging into a wash. `Math.min(1.25, CANVAS_W / 900)` keeps a piece
tuned at 1300px looking the same at 2200px.

Background renders are dominated by the number of fills, not by resolution:
expect 2-3 minutes.

**Pinned to p5.brush 2.1.0-beta**; `--p5brush 2.2.2` switches version. 2.2.2
adds `seed()` (which would make renders reproducible), `massArray` and
`hatchArray`, and the eleven built-ins are all dry media. Wetness still comes
from the FILL system, but the custom-tip lead is now CLOSED.

**Custom brushes work. The contract (p5.brush 2.2.2, not the 2.1.0-beta this was
originally written against):**

- `tip: (_m) => {...}` receives a p5.Graphics buffer.
- Its space is **100x100 with the origin at the CENTRE** — shapes are drawn
  around `(0,0)`, edges land near +/-50. Drawing a few units across near the
  origin is what made earlier attempts render nothing visible.
- The buffer becomes a **mask: dark = opaque, white = transparent.** Define the
  tip in dark tones; colour arrives later from `brush.set()`.
- There is also `type: "image"`, which takes a photograph as the tip. That is the
  better version of all of this: one scan of a real stroke would make every mark
  on the site, plates and interface chrome alike, physically ours.
  `brush.add` returns a Promise for image brushes, so `setup()` must be `async`.

See `brushes.js` (`wash`, `wet-edge`, `dry`) and `sketches/brush-test.js`.

**Tip geometry, measured with `sketches/brush-sweep.js` (radius x weight grid):**

- Tip radius and brush weight BOTH scale the mark. The RATIO decides character.
- **Small radius + high weight** -> granular, broken, stamps land apart and pool.
  This is the wet end.
- **Large radius + low weight** -> smooth and solid, stamps merge into a slab.
- This is backwards from the obvious guess. A big soft tip does not make a soft
  mark, it makes a tidy solid one. Anything aiming for "wet" wants a SMALL tip
  driven hard.
- `brush.set(name, colour, weight)`'s third argument **overrides** the weight the
  brush was registered with. A brush's registered weight is only a default; the
  call site decides scale, and the tip radius is what carries character.

**Paper is no longer hardcoded.** `render.mjs` reads `src/design-tokens.json` and
injects `PAPER`. The old `const PAPER = '#D9D0BE'` duplicated across seven
sketches was sampled from a screenshot and went silently wrong the moment the
page's grain opacities changed. `main.jsx` asserts in dev that the browser really
paints that value.

**New flags.** `--bleed` drops the plate chrome (tick rails, corner marks, scale
bar) and shrinks the margin so the drawing fills the frame — plate grammar is
right for a small plate read as an object, but at 600px+ beside body text the
rails outshout the drawing. `--wash k` scales every fill opacity at once.

**Alphas go UP on lighter paper, not down.** The floor below rises with the
ground: a wash that read as solid on `#D9D0BE` reads thin on `#F4F1EA`, because
the paper is no longer supplying any of the darkness. If a re-render looks washed
out, raise `--wash`.

## Gotchas, all learned from failed renders

- **A walked grid comes out woven once the pigment is strong enough to see.**
  Placing touches at `(i/cols, k/rows)` hides its lattice at low alpha and shows
  it as corduroy the moment you raise it - rows and columns line up across the
  whole fill. Offset alternate columns by half a step and jitter both position
  and radius per touch. This has now bitten three separate plates.
- **A mark shown small needs MORE pigment than a plate shown large.** Marks are
  displayed around 150px; alphas mixed for a 1500px plate read as a smudge there.


- **`plate-spectrum` under `--bleed` is very slow, sometimes minutes.** It is not
  hung. Bleeding scales the plate rect up, and the sketch stacks
  `Math.round(h / (b.w * 0.8))` overlapping wet touches per bar across 26 bars -
  several hundred bleeding fills, each one expensive. Every other plate finishes
  in about a minute at 1600x1100. Either let it run or raise the step divisor
  for that sketch specifically.


- **Washes vanish below ~alpha 130.** p5.brush spreads pigment; a fill at
  alpha 60 renders as nothing. Use 140–210.
- **`fillTexture` wants low values.** `(0.4, 0.2)` gives a smooth wash;
  `(0.85, 0.9)` mottles it into invisibility. High values suit stains only.
- **Stroke weight doubles as darkness.** A grid at weight 0.3 reads as
  engineering graph paper. Hairlines are 0.06–0.16.
- **No dash pattern.** `FK.rule` hand-draws dashes segment by segment.
- **Never change `scaleBrushes` mid-sketch.** This one cost a long afternoon.
  It applies to geometry flushed *after* the call, not to what was already
  drawn, so raising it back up after painting a label re-stamps that label's
  glyphs at the larger scale. The symptom is blobs sitting exactly on the axis
  labels, which survives every plausible fix aimed at text, stains, markers or
  fill settings. Pick one scale in `FK.init` and vary `_sw` weights instead.
- **`noWash()` and `noMass()` belong on figures.** p5.brush keeps two extra
  global layers, a watercolour wash and a droplet mass, both on by default.
  Lovely on a painting, noise on a plot.
- **`brush.clip([x, y, w, h])` exists**, as does `noClip()`. Prefer it over
  testing points against a region by hand.
- **WebGL is required**, so rendering runs in Chrome with SwiftShader rather
  than in node. Override the binary with `CHROME_PATH`.
- **Lettering is painted, not typeset.** `FK.text` pulls glyph outlines with
  `textToContours()` and fills them with the brush. Counters are found by
  even-odd containment against strictly larger contours; winding sign is not
  reliable and silently deletes characters when glyphs overlap.
- Renders take 60-90s at 2100px once labels are painted. Budget for it.
- **Renders are not byte-reproducible.** `--seed` fixes p5's `randomSeed` and
  `noiseSeed`, but p5.brush carries its own internal randomness, so the same
  command twice gives visually identical output with a few bytes of difference.
  Don't diff the PNGs; look at them.
