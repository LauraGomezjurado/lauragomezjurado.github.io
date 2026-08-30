/**
 * PaperBackground: the sheet the whole site is printed on.
 *
 * Two layers, and the split matters:
 *
 *   PaperGround  z=0   the flat paper colour, under everything
 *   PaperGrain   z=50  the tooth, OVER everything - including the plates
 *
 * The grain used to sit at z=0 with the ground, under the paintings. That put a
 * visible seam at every plate edge: the page was grained and the painting was
 * not, so a plate read as a photograph laid on paper rather than as paint soaked
 * into it. With the tooth on top, page and painting are literally one sheet,
 * which is the entire idea the design rests on.
 *
 * Multiply is well behaved here: it acts most on light areas and barely touches
 * ink, so the grain textures the paper without muddying type.
 *
 * Opacities are also well down from the old values (0.40 / 0.20 / 0.09). Those
 * were mixed for a #E6DCC8 sand ground and dragged the rendered paper 16% below
 * its declared value; the tooth should be felt, not seen. If you change them,
 * re-measure and update src/design-tokens.json - the painted plates are rendered
 * against paper.rendered and will mismatch otherwise.
 */

function Grain({ id, baseFrequency, numOctaves, seed, matrix, opacity, blend }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      style={{ mixBlendMode: blend, opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency={baseFrequency}
          numOctaves={numOctaves}
          stitchTiles="stitch"
          seed={seed}
        />
        <feColorMatrix type="matrix" values={matrix} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

export function PaperGround() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: 'var(--paper)' }} />
      {/* One barely-there warm lift so a large empty area is not perfectly flat.
          The old pair of slate-blue gradients would grey out warm paper. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 18% 15%, rgba(168,101,74,0.035) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

export function PaperGrain() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {/* Fine fibre */}
      <Grain
        id="paper-fine"
        baseFrequency="0.9"
        numOctaves="4"
        seed="11"
        matrix="0 0 0 0 0.04  0 0 0 0 0.045  0 0 0 0 0.055  0 0 0 0.28 0"
        opacity={0.16}
        blend="multiply"
      />
      {/* Coarse mottle: reads like soaked fibres */}
      <Grain
        id="paper-coarse"
        baseFrequency="0.022"
        numOctaves="3"
        seed="37"
        matrix="0 0 0 0 0.06  0 0 0 0 0.06  0 0 0 0 0.075  0 0 0 0.12 0"
        opacity={0.1}
        blend="multiply"
      />
      {/* Microscopic tooth */}
      <Grain
        id="paper-tooth"
        baseFrequency="1.05"
        numOctaves="2"
        seed="61"
        matrix="0 0 0 0 0.35  0 0 0 0 0.37  0 0 0 0 0.42  0 0 0 0.09 0"
        opacity={0.06}
        blend="soft-light"
      />
    </div>
  )
}

/** Back-compat default: the ground only. Render <PaperGrain /> last in the tree. */
export default PaperGround
