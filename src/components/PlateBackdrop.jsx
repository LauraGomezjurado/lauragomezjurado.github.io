/**
 * PlateBackdrop: sets a painted plate behind a section.
 *
 * Wraps a section rather than editing it, so the section components stay
 * unaware of their own backgrounds and any plate can be moved or removed from
 * one place (Home.jsx).
 *
 * Two rules from the design pass are enforced here rather than left to each
 * call site:
 *   - a plate behind type never goes above ~0.6 opacity, and
 *   - the paint is pushed to one side so the text column sits on clean paper.
 *     Every plate is composed with a deliberately empty side for this.
 */
export default function PlateBackdrop({
  src,
  alt = '',
  opacity = 0.4,
  align = 'right',
  className = '',
  children,
}) {
  // object-position keeps the painted side away from the reading column.
  const position = align === 'left' ? '18% center' : align === 'center' ? 'center' : '82% center'

  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          /* Always cover. `contain` letterboxes on a phone, and because the
             plate is composited with multiply its own rectangle then shows as a
             darker band across the section — worse than a crop. A cropped
             detail of a wash still reads as paint. */
          className="h-full w-full object-cover"
          style={{
            opacity,
            objectPosition: position,
            // The plates carry their own paper, which is a shade off the page's.
            // Multiply lets the page's ground show through so the two agree.
            mixBlendMode: 'multiply',
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
