/**
 * SectionArt: a small painted figure placed on the page.
 *
 * The whole history of this component was fighting one problem that turned out
 * to be a colour mismatch. index.css declares the paper as #E6DCC8, but
 * PaperBackground's grain layers darken it to #DCD2BE on screen. Every figure
 * was rendered against the CSS value, so it was always a different material
 * from the page it sat on — which is why nothing could be made to sit right.
 * Feathered masks, multiply blends, transparent cut-outs and full-bleed
 * backgrounds were all attempts to hide a mismatch instead of removing it.
 *
 * Remove it and there is nothing left to hide: the figure is painted on exactly
 * the page's own paper, so it is simply placed. No blend mode, no mask, no
 * opacity trick. Small, because a downscale is crisp and an upscale is not.
 */
export default function SectionArt({ src, alt = '', width = 320, side = 'right', top = '12%', className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute hidden md:block"
          style={{
            top,
            [side === 'left' ? 'left' : 'right']: '3%',
            width: `min(${width}px, 26vw)`,
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
