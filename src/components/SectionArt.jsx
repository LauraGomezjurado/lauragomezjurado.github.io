/**
 * SectionArt: the whole drawing as a section's background, the way the hero does it.
 *
 * Three earlier attempts were wrong; recording them so they are not repeated.
 *
 *   1. The full plate stretched with object-cover — a 2-3x UPSCALE of a 1400px
 *      source, so the paint went pixellated and the drawing was unreadable.
 *   2. Small cutouts scattered into the corners — read as stickers pasted onto
 *      the page, in positions that looked arbitrary because they were.
 *   3. A contained <img> anchored to the section's first screen. This is the
 *      subtle one: the image sits in a box that is clipped by overflow, so once
 *      you scroll into the section you see an arbitrary SLICE of the drawing.
 *      It looks like a torn fragment pasted on the page.
 *
 * The hero never had this problem for one reason: its image fills the viewport
 * and you never scroll past it, so you always see a whole picture.
 *
 * So the drawing is painted as a FIXED background instead. background-attachment
 * fixed sizes and positions against the viewport rather than the element, so the
 * whole drawing sits still and complete behind the section while the text scrolls
 * over it — the hero's behaviour, extended over a section of any height. `contain`
 * keeps the entire drawing in frame, which is what makes it read at a sane scale
 * rather than zoomed in.
 *
 * The source is a /images/marks/ render (--transparent: drawing only, no paper),
 * because `contain` leaves space around the drawing and a plate's own sheet would
 * show there as a letterboxed rectangle.
 */
export default function SectionArt({ src, opacity = 0.3, scale = 0.8, className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="section-art pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
          backgroundSize: `auto ${scale * 100}vh`,
          opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
