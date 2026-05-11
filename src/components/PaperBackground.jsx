/**
 * PaperBackground: deep neutral base plus visible **monochrome** tooth.
 *
 * No coloured “dye” overlays (those read as unrelated pink smudges on black).
 * The paper effect should come almost entirely from **grain**: fine fibre +
 * faint coarser mottle, both cool-grey / near-neutral so it harmonises with
 * the mathematical line art, not illustrations beside it.
 */
export default function PaperBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base: blue-charcoal (“lab notebook”), not pitch black */}
      <div className="absolute inset-0" style={{ background: 'var(--paper-base)' }} />

      {/* Extremely subtle monochrome atmospheric lift: slate only, no warm tint */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(120,132,156,0.055) 0%, transparent 55%),
            radial-gradient(ellipse 70% 55% at 88% 85%, rgba(90,104,132,0.045) 0%, transparent 60%)
          `,
        }}
      />

      {/* Fine fibre grain (multiply darkens fibres into the substrate) */}
      <svg className="absolute inset-0 h-full w-full" style={{ mixBlendMode: 'multiply', opacity: 0.62 }} xmlns="http://www.w3.org/2000/svg">
        <filter id="paper-fine">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" seed="11" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.04
                    0 0 0 0 0.045
                    0 0 0 0 0.055
                    0 0 0 0.28 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-fine)" />
      </svg>

      {/* Coarser blot mottle: low frequency, reads like soaked paper fibres */}
      <svg className="absolute inset-0 h-full w-full" style={{ mixBlendMode: 'multiply', opacity: 0.35 }} xmlns="http://www.w3.org/2000/svg">
        <filter id="paper-coarse">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" stitchTiles="stitch" seed="37" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.06
                    0 0 0 0 0.06
                    0 0 0 0 0.075
                    0 0 0 0.12 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-coarse)" />
      </svg>

      {/* Soft highlight grain: microscopic paper tooth (neutral, ties to inks) */}
      <svg className="absolute inset-0 h-full w-full" style={{ mixBlendMode: 'soft-light', opacity: 0.09 }} xmlns="http://www.w3.org/2000/svg">
        <filter id="paper-tooth">
          <feTurbulence type="fractalNoise" baseFrequency="1.05" numOctaves="2" stitchTiles="stitch" seed="61" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.35
                    0 0 0 0 0.37
                    0 0 0 0 0.42
                    0 0 0 0.09 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-tooth)" />
      </svg>
    </div>
  )
}
