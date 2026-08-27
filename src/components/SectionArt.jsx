/**
 * SectionArt: one drawing behind a section, the way the hero does it.
 *
 * Two earlier attempts were wrong, recorded so they are not repeated:
 *
 *   1. The full plate stretched with object-cover. That is a 2-3x UPSCALE of a
 *      1400px source, so the paint went visibly pixellated and the drawing
 *      became unreadable.
 *   2. Small cutouts scattered into the corners. Those read as stickers pasted
 *      onto the page, and the positions looked arbitrary because they were.
 *
 * What works is what the hero already did: the drawing IS the background of the
 * section. The only thing that needed changing was scale — object-contain
 * rather than object-cover, so the whole drawing is visible in a reasonable
 * shape instead of blown up and cropped.
 *
 * The source is a /images/marks/ render (--transparent: drawing only, no
 * paper). That matters here specifically: with contain there is empty space
 * around the drawing, and a plate's own sheet would show in it as a
 * letterboxed rectangle.
 */
export default function SectionArt({
  src,
  alt = '',
  opacity = 0.38,
  scale = 0.86,
  className = '',
  children,
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Anchored to the FIRST SCREEN of the section, not to the whole
          section. Centering inside the full section put the drawing somewhere
          in the middle of a several-thousand-pixel column, where it is never
          on screen. The hero only worked because it happens to be exactly one
          viewport tall; this makes every section behave the same way. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-screen max-h-full flex items-center justify-center overflow-hidden"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="object-contain"
          style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, opacity }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
