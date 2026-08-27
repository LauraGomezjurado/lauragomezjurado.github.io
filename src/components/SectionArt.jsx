/**
 * SectionArt: scatters small painted plates around a section.
 *
 * This replaces the earlier full-bleed backdrop, which was the wrong idea twice
 * over. A 1400px plate stretched to cover a whole section is a 2-3x UPSCALE, so
 * the paint turned pixellated and the drawing became unreadable — you could see
 * the pixels. And one big image per section is not what a notebook looks like.
 *
 * A notebook has several small drawings in the margins. So the plates are used
 * at a few hundred pixels wide, which is a DOWNSCALE from the source and
 * therefore crisp, positioned around the section rather than behind it.
 *
 * They point at /images/marks/, which are rendered with --transparent: the
 * drawing ONLY, no paper. The first attempt reused the full plates, which carry
 * their own sheet, and the result was a visible rectangle with the drawing lost
 * inside it. Feathering the edges and blending with multiply did not save it —
 * multiply over the plate's own paper just made the patch darker than the page.
 * An opaque background cannot be hidden; it has to not be rendered.
 *
 * The hero is the deliberate exception and still gets one large plate: an
 * opening page can carry a single big image.
 *
 * marks: [{ src, side, top, width, opacity, rotate }]
 *   side   'left' | 'right'   which margin it hangs in
 *   top    CSS length/percent, measured from the top of the section
 *   width  CSS length — keep it small; these are marginalia
 */
export default function SectionArt({ marks = [], className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {marks.map((m, i) => (
          <img
            key={i}
            src={m.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute hidden sm:block"
            style={{
              top: m.top,
              [m.side === 'left' ? 'left' : 'right']: m.inset ?? '1.5%',
              width: m.width,
              maxWidth: '38vw',
              opacity: m.opacity ?? 0.62,
              transform: `rotate(${m.rotate ?? 0}deg)`,
              // Never object-cover here: these must keep their own aspect so the
              // drawing stays legible and never gets scaled past 1:1.
              // No blend mode and no mask: the asset has a real alpha channel,
              // so it composites onto the page with nothing to hide.
              objectFit: 'contain',
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
