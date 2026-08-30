import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

/**
 * PortfolioPage: standalone /portfolio route showing every project in the
 * same editorial layout used on the home page slice. No 3D background, no
 * motif-claim logic — simple page so it stays robust.
 */
export default function PortfolioPage() {
  const titleRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    // Reset to the sand site palette in case we navigated here from /blog,
    // which sets its own light body background.
    gsap.to('body', {
      background: 'var(--paper)',
      color: 'var(--ink)',
      duration: 0.4,
      ease: 'power2.out',
    })

    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      )
    }

    const triggers = []
    itemsRef.current.forEach((el) => {
      if (!el) return
      const tw = gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
      if (tw.scrollTrigger) triggers.push(tw.scrollTrigger)
    })

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      id="portfolio-page"
      className="relative min-h-screen py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: 'var(--paper)', color: 'var(--ink)' }}
    >
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <Link
          to="/"
          className="inline-block mb-10 md:mb-14 mono text-[11px] tracking-widest uppercase"
          style={{ color: 'var(--accent-dim)', textDecoration: 'none', letterSpacing: '0.15em' }}
        >
          ← back to home
        </Link>

        <header ref={titleRef} className="mb-14 md:mb-20">
          <div className="section-index mb-3">§ Selected Research</div>
          <h1 className="t-section mb-4">Research &amp; Projects</h1>
          <p className="max-w-[46ch] text-[16px] leading-relaxed" style={{ color: 'var(--ink-quiet)' }}>
            Every project, ordered by topic and recency. Recent work centers on spectral and
            mixed-geometry optimization, and on the representations transformers form before they can
            use them.
          </p>
        </header>

        <div className="space-y-16 md:space-y-32">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0
            return (
              <article
                key={project.id}
                ref={(el) => (itemsRef.current[index] = el)}
                className="project-item relative"
                style={
                  project.plate
                    ? {
                        '--accent': `var(--${project.plate.pigment})`,
                        '--accent-quiet': `color-mix(in srgb, var(--${project.plate.pigment}) 55%, transparent)`,
                      }
                    : undefined
                }
              >
                <div className={`relative z-10 grid md:grid-cols-12 gap-6 md:gap-10 items-start ${isEven ? '' : 'md:[direction:rtl]'}`}>
                  <div className="md:col-span-7 md:[direction:ltr] relative">
                    <div>
                      <div className="flex items-baseline gap-3 md:gap-4 mb-4 md:mb-5 flex-wrap">
                        <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
                        {project.topic && (
                          <span
                            className="mono text-[10px] tracking-widest uppercase px-2 py-0.5"
                            style={{
                              color: 'var(--accent-dim)',
                            }}
                          >
                            {project.topic}
                          </span>
                        )}
                        <span className="h-px flex-1 min-w-[24px]" style={{ background: 'var(--hairline)' }} />
                        <span className="mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
                          {project.year}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-4xl font-light mb-3 tracking-tight leading-tight" style={{ color: 'var(--ink)' }}>
                        {project.title}
                      </h3>

                      <p className="mono text-[10.5px] md:text-[11px] mb-5 md:mb-6 tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
                        {project.venue}{project.org ? ` · ${project.org}` : ''}
                      </p>

                      <p className="text-[14.5px] md:text-[1.02rem] leading-relaxed font-light max-w-xl">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-5 md:mt-6">
                        {project.tech.map((tech, idx) => (
                          <span
                            key={idx}
                            className="mono px-2.5 py-1 text-[10.5px] tracking-wider"
                            style={{ color: 'var(--accent)' }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {(project.github || project.blogLink || project.link) && (
                        <div className="flex flex-wrap gap-4 md:gap-5 mt-6 md:mt-7 pt-5 md:pt-6" style={{ borderTop: '1px solid var(--hairline)' }}>
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-editorial inline-flex items-center gap-2 text-[13px] font-light"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                              GitHub
                            </a>
                          )}
                          {project.blogLink && (
                            <a
                              href={project.blogLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-editorial inline-flex items-center gap-2 text-[13px] font-light"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Blog Post
                            </a>
                          )}
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-editorial inline-flex items-center gap-2 text-[13px] font-light"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Paper
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-5 md:[direction:ltr] relative">
                    {/* The painting, on bare paper. It used to be a hand-drawn
                        SVG inside a bordered box with registration corners and a
                        "Fig. NN:" caption - a frame, a second drawing style and a
                        museum card, all at once. Projects with no plate yet show
                        nothing rather than something in the wrong medium. */}
                    {project.plate && (
                      <img
                        src={project.plate.src}
                        alt={`Painted figure for ${project.title}`}
                        loading="lazy"
                        decoding="async"
                        className="block w-full"
                      />
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-16 md:mt-24 flex justify-center">
          <Link
            to="/"
            className="mono text-[11px] tracking-widest uppercase"
            style={{ color: 'var(--accent-dim)', textDecoration: 'none', letterSpacing: '0.15em' }}
          >
            ← back to home
          </Link>
        </div>
      </div>
    </section>
  )
}
