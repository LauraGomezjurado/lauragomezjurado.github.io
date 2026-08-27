/**
 * SectionArt: the hero's treatment, applied to any section.
 *
 * The hero is the reference and always was. What makes it read as paint ON the
 * page rather than a cut-out pasted onto it:
 *
 *   - the FULL PLATE, carrying its own watercolour paper and tooth
 *   - mix-blend-mode: multiply, so that paper sinks into the page's beige
 *   - cover, so it fills the frame with no empty space and no visible edge
 *
 * Every earlier attempt here broke at least one of those. The worst was
 * rendering the drawing with --transparent — literally cutting it out of its
 * paper — which is why the sections looked a layer down and thin next to the
 * hero. The paper is not packaging around the drawing; it is half of what the
 * drawing IS.
 *
 * The reason cover was avoided before was a real problem, wrongly solved:
 * object-cover on an element as tall as a section is a 2-3x upscale, which went
 * pixellated. But background-attachment: fixed sizes against the VIEWPORT
 * instead of the element, so cover here is exactly the hero's scale no matter
 * how tall the section is — and the drawing stays still and whole while the
 * text scrolls over it.
 */
export default function SectionArt({ src, opacity = 0.5, className = '', children }) {
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
          backgroundSize: 'cover',
          mixBlendMode: 'multiply',
          opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
