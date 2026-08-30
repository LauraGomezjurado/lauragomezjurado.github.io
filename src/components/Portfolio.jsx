import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, HERO_COUNT } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

const visibleProjects = projects.slice(0, HERO_COUNT)

/**
 * Portfolio: the research section, where the paintings do the work.
 *
 * The painting column is sticky. It holds its place in the viewport while the
 * project text scrolls past it, then cross-fades to the next project's painting
 * as that project takes over. You cannot scroll this section without watching
 * the paintings change, which is the difference between art that carries a page
 * and art placed beside one.
 *
 * The section's accent follows the held painting, so colour moves WITHIN the
 * section rather than only between sections.
 *
 * The scroll machinery was already here. The per-project ScrollTrigger below
 * was written to push a {hue, intensity, spin} motif into a Three.js attractor
 * parked in the left third of this grid; the attractor was retired months ago
 * and the writes have gone nowhere since. The grid even kept columns 1-3 empty
 * for it. This section was always designed around a figure that changes as you
 * read - the hole just had the wrong thing in it, and then nothing at all.
 *
 * Gone with the old style: ProjectDoodle (14 hand-drawn SVG schematics wobbled
 * with feTurbulence), the MarginAside and FigureAnnotation arrows, and the
 * TickCorners frame. Two drawing languages on one page read as disorganised, so
 * everything that looks drawn is now painted in the same medium. The handwritten
 * `aside` survives as plain Caveat - the hand already marks it as an aside, and
 * the arrow was doing no extra work.
 *
 * There is also no caption under any painting. A "Fig. 01 ·" line turns a
 * drawing into a specimen with a museum card.
 */
export default function Portfolio() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])
  const colRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 },
          }
        )
      }

      itemsRef.current.forEach((el) => {
        if (!el) return

        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 60%', scrub: 1 },
          }
        )

      })

      // Which painting is held.
      //
      // Derived from position, not from onEnter/onEnterBack. Those fire once per
      // boundary crossing, so a fast scroll or a programmatic jump past several
      // projects leaves whichever trigger happened to fire last, which is not
      // necessarily the one you are reading. Reading the geometry on every update
      // is always right and costs three getBoundingClientRect calls.
      ScrollTrigger.create({
        trigger: colRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => {
          // The line down the viewport where a project counts as "the one being
          // read". Above centre, so the plate changes as a title arrives rather
          // than after you have already read past it.
          const readingLine = window.innerHeight * 0.42
          let held = 0
          itemsRef.current.forEach((el, i) => {
            if (el && el.getBoundingClientRect().top <= readingLine) held = i
          })
          setActiveIdx((prev) => (prev === held ? prev : held))
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const active = visibleProjects[activeIdx]

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative z-10 px-5 pb-12 pt-24 sm:px-8 md:px-12 md:pb-16 md:pt-32"
      // The accent is the held painting's lead pigment, so the section changes
      // colour as you scroll it rather than carrying one hue throughout.
      style={
        active?.plate
          ? {
              '--accent': `var(--${active.plate.pigment})`,
              // Re-derived here on purpose: --accent-quiet is declared on :root,
              // and a custom property's var() resolves against the element that
              // DECLARES it - so inheriting it would keep the root's sienna
              // while --accent turned green.
              '--accent-quiet': `color-mix(in srgb, var(--${active.plate.pigment}) 55%, transparent)`,
              '--accent-ghost': `color-mix(in srgb, var(--${active.plate.pigment}) 12%, transparent)`,
            }
          : undefined
      }
    >
      <div className="relative mx-auto w-full max-w-6xl">
        <header ref={titleRef} className="mb-16 md:mb-24">
          <div className="section-index mb-3">§ 02 · Selected Research</div>
          <h2 className="t-section mb-4">Research &amp; Projects</h2>
          <p className="max-w-[46ch] text-[16px] leading-relaxed" style={{ color: 'var(--ink-quiet)' }}>
            Recent work centers on spectral and mixed-geometry optimization, and on the
            representations transformers form before they can use them. A few projects are
            highlighted below; the rest sit one click away.
          </p>
        </header>

        <div className="md:grid md:grid-cols-12 md:gap-x-10">
          {/* The text: one continuous column that scrolls. */}
          <div ref={colRef} className="md:col-span-5">
            {visibleProjects.map((project, index) => (
              <article
                key={project.id}
                ref={(el) => (itemsRef.current[index] = el)}
                className={`project-item relative ${
                  // The tall trailing padding exists so a painting can hold while
                  // you finish reading before it hands over to the next one. The
                  // LAST project has nothing to hand over to, so on that one it
                  // is just a hole - and it landed right where Research's bottom
                  // padding meets News's top padding, which is what made the gap.
                  index === visibleProjects.length - 1 ? 'pb-8 md:pb-12' : 'pb-24 md:pb-[38vh]'
                }`}
                aria-current={activeIdx === index ? 'true' : undefined}
              >
                {/* On a phone there is nowhere for a painting to be held, so it
                    simply sits above the text it belongs to. */}
                {project.plate && (
                  <img
                    src={project.plate.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="mb-6 block w-full md:hidden"
                  />
                )}

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-3">
                  <span className="mono leading-none" style={{ color: 'var(--accent)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {project.topic && (
                    <span className="mono leading-none" style={{ color: 'var(--accent-quiet)' }}>
                      {project.topic}
                    </span>
                  )}
                  <span
                    className="min-w-[28px] flex-1 self-center"
                    style={{ borderTop: '1.5px dashed var(--accent-quiet)' }}
                  />
                  <span className="mono leading-none" style={{ color: 'var(--accent-quiet)' }}>
                    {project.year}
                  </span>
                </div>

                <h3 className="t-title mb-3">{project.title}</h3>

                <p className="mono mb-5" style={{ color: 'var(--accent-quiet)' }}>
                  {[project.venue, project.org].filter(Boolean).join(' · ')}
                </p>

                <p className="max-w-xl text-[15.5px] leading-relaxed md:text-[16.5px]" style={{ color: 'var(--ink-soft)' }}>
                  {project.description}
                </p>

                {project.aside && (
                  <p className="handwritten mt-4 max-w-md text-[18px] leading-snug" style={{ color: 'var(--accent)' }}>
                    {project.aside}
                  </p>
                )}

                <p className="mono mt-5 leading-relaxed" style={{ color: 'var(--accent-quiet)' }}>
                  {project.tech.join('   ·   ')}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="link-editorial text-[13px]">
                      GitHub
                    </a>
                  )}
                  {project.blogLink && (
                    <a href={project.blogLink} target="_blank" rel="noopener noreferrer" className="link-editorial text-[13px]">
                      Blog post
                    </a>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="link-editorial text-[13px]">
                      Paper
                    </a>
                  )}
                </div>
              </article>
            ))}

          </div>

          {/* The paintings: held, and cross-faded as the text hands over. */}
          <div className="hidden md:col-span-7 md:col-start-6 md:block">
            <div className="sticky top-[11vh] h-[78vh]">
              {visibleProjects.map((project, index) =>
                project.plate ? (
                  <img
                    key={project.id}
                    src={project.plate.src}
                    alt={`Painted figure for ${project.title}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    aria-hidden={activeIdx !== index}
                    className="plate-held absolute inset-0 h-full w-full object-contain"
                    style={{ opacity: activeIdx === index ? 1 : 0 }}
                  />
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* A closing row, spanning the full measure.
            Inside the text column this was a small link alone on the left with
            the right two-thirds bare - the painting cannot reach here, because a
            78vh sticky box needs 78vh of container left and by this point there
            are a few pixels of it. The gap was never the problem; the section
            stopped rather than closing. A rule across the measure ends it. */}
        {projects.length > HERO_COUNT && (
          <div
            className="mt-4 flex flex-wrap items-baseline justify-between gap-4 border-t pt-5 md:mt-10"
            style={{ borderColor: 'var(--hairline)' }}
          >
            <Link to="/portfolio" className="btn-ghost mono inline-flex items-baseline gap-3">
              <span>{`View all ${projects.length} projects`}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <span className="mono" style={{ color: 'var(--ink-quiet)' }}>
              {`${HERO_COUNT} of ${projects.length}`}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
