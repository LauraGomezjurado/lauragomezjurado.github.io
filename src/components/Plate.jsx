/**
 * Plate: a painting given the whole screen.
 *
 * This replaces PlateBackdrop, which enforced two rules that were both attempts
 * to make a painting behave itself: never above ~0.6 opacity behind type, and
 * always `mix-blend-mode: multiply` so the page's ground could show through a
 * plate whose own paper was a shade off.
 *
 * Both rules existed to hide a mismatch. The plates are now painted on exactly
 * the page's paper (one value, src/design-tokens.json, read by the renderer),
 * so there is nothing left to hide - no opacity, no blend mode. And a painting
 * held at 55% behind text is wallpaper; the point of having paintings is to look
 * at one. So it gets the full screen at full strength, and the type sits in the
 * quiet part of the composition rather than on top of the busy part.
 */
export default function Plate({
  src,
  alt = '',
  position = '74% 46%',
  height = '100svh',
  children,
  priority = false,
}) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <img
        src={src}
        alt={alt}
        // The hero plate is the first thing on the page; it should not be lazy.
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        aria-hidden={alt === ''}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
      {children}
    </div>
  )
}
