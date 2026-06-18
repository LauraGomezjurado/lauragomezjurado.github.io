import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectDoodle from './ProjectDoodle'
import { motifState } from './backgroundState'
import { projects, HERO_COUNT } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

/**
 * Portfolio: editorial project showcase (home-page slice).
 *
 * Shows the first HERO_COUNT projects only. The remaining projects live on
 * a dedicated /portfolio page so we don't have to handle a giant in-place
 * expansion (which caused a "black screen" during scroll-trigger reflow).
 */
const visibleProjects = projects.slice(0, HERO_COUNT)

export default function Portfolio() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
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

    const triggers = []
    itemsRef.current.forEach((el, idx) => {
      if (!el) return
      const isEven = idx % 2 === 0
      const project = visibleProjects[idx]

      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 55%', scrub: 1 },
        }
      )

      const motifEl = el.querySelector('[data-motif-col]')
      if (motifEl) {
        gsap.fromTo(
          motifEl,
          { y: isEven ? 30 : -30 },
          {
            y: isEven ? -30 : 30,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 20%', scrub: true },
          }
        )
      }

      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        end: 'bottom 45%',
        onEnter:      () => setActiveAndWrite(idx, project.motif),
        onEnterBack:  () => setActiveAndWrite(idx, project.motif),
      })
      triggers.push(t)
    })

    const releaseTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 20%',
      end: 'bottom 10%',
      onLeave:     () => releaseMotif(),
      onLeaveBack: () => releaseMotif(),
    })
    triggers.push(releaseTrigger)

    function setActiveAndWrite(idx, m) {
      if (!m) return
      setActiveIdx(idx)
      motifState.hue = m.hue
      motifState.intensity = m.intensity
      motifState.spin = m.spin
    }
    function releaseMotif() {
      motifState.hue = 0
      motifState.intensity = 0
      motifState.spin = 0
    }

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative z-10 py-14 md:py-32 px-4 sm:px-6 md:px-8 overflow-visible bg-transparent -mt-16 md:-mt-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <header ref={titleRef} className="mb-14 md:mb-32 text-center">
          <div className="section-index mb-3 md:mb-4">§ 02 · Selected Research</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wider mb-4 md:mb-5 text-on-bg" style={{ color: 'var(--ink)' }}>
            Research &amp; Projects
          </h2>
          <p className="max-w-2xl mx-auto text-[13.5px] md:text-base text-[#2A211A]/60 font-light leading-relaxed">
            Recent work centers on spectral and mixed-geometry optimization, and on the representations
            transformers form before they can use them. A few projects are highlighted below; the rest sit
            one click away.
          </p>
        </header>

        <div className="space-y-16 md:space-y-40">
          {visibleProjects.map((project, index) => {
            const isEven = index % 2 === 0
            const isActive = activeIdx === index

            return (
              <article
                key={project.id}
                ref={(el) => (itemsRef.current[index] = el)}
                className="project-item relative"
                aria-current={isActive ? 'true' : undefined}
              >
                {/* Left third (cols 1-3) is intentionally empty: that is where
                    the parked attractor lives, with clean space and nothing over
                    it. Text takes the middle, the hand-drawn figure the right. */}
                <div className="relative z-10 grid md:grid-cols-12 gap-x-8 md:gap-x-12 gap-y-10 items-start">
                  {/* ── Text (middle zone): no card. A soft, borderless glow
                       lifts it off the paper grain without boxing it. ── */}
                  <div className="col-span-12 md:col-span-5 md:col-start-4 relative">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-x-8 -inset-y-6 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse 84% 80% at 30% 42%, rgba(238,231,217,0.66) 0%, rgba(238,231,217,0.24) 52%, transparent 80%)',
                        filter: 'blur(30px)',
                      }}
                    />

                    <div className="relative">
                      {/* Meta line in the same hand as the doodles: index ·
                          topic, a dashed hand-rule, then the year. */}
                      <div className="flex items-baseline gap-2.5 md:gap-3 mb-3 flex-wrap">
                        <span className="handwritten text-[20px] leading-none" style={{ color: 'var(--accent)' }}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {project.topic && (
                          <span className="handwritten text-[19px] leading-none" style={{ color: 'var(--accent-dim)' }}>
                            {project.topic}
                          </span>
                        )}
                        <span
                          className="flex-1 min-w-[28px] self-center"
                          style={{ borderTop: '1.5px dashed rgba(156,107,79,0.42)' }}
                        />
                        <span className="handwritten text-[19px] leading-none" style={{ color: 'var(--accent-dim)' }}>
                          {project.year}
                        </span>
                      </div>

                      {/* The one high-contrast move: oversized, near-black title.
                          Everything around it stays deliberately quiet/light. */}
                      <h3
                        className="mb-3 tracking-[-0.02em] leading-[1.04] text-[1.9rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[2.9rem]"
                        style={{ color: 'var(--ink-strong)', fontWeight: 500 }}
                      >
                        {project.title}
                      </h3>

                      <p className="mono text-[10.5px] md:text-[11px] mb-5 tracking-[0.18em] uppercase" style={{ color: 'var(--accent-dim)' }}>
                        {project.venue} · {project.org}
                      </p>

                      <p className="text-[14.5px] md:text-[1.02rem] leading-relaxed font-light max-w-xl" style={{ color: 'var(--ink-soft)' }}>
                        {project.description}
                      </p>

                      {/* Handwritten margin thought on the description. */}
                      <MarginAside projectId={project.id} text={project.aside} />

                      {/* Tech: quiet inline mono, no pills, no borders. */}
                      <p className="mono text-[10.5px] md:text-[11px] mt-5 tracking-wider leading-relaxed" style={{ color: 'var(--accent-dim)' }}>
                        {project.tech.join('   ·   ')}
                      </p>

                      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">
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
                    </div>
                  </div>

                  {/* ── Figure (right zone): unframed, hand-drawn, with a
                       handwritten note and caption so the whole unit reads as a
                       page someone sketched, opposite the live curve. ── */}
                  <div
                    data-motif-col
                    className="col-span-12 md:col-span-4 md:col-start-9 relative"
                  >
                    <div className="relative w-full aspect-[4/3] md:aspect-[5/4]">
                      <ProjectDoodle projectId={project.id} className="w-full h-full" />
                      <FigureAnnotation
                        projectId={project.id}
                        text={project.annotation}
                        side="right"
                      />
                    </div>
                    <p className="handwritten mt-3 text-[16px] leading-snug text-[#2A211A]/55">
                      Fig. {String(index + 1).padStart(2, '0')} · {project.briefDescription}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {projects.length > HERO_COUNT && (
          <div className="mt-12 md:mt-28 flex flex-col items-center gap-3">
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-3 px-6 md:px-7 py-2.5 md:py-3 mono text-[11px] tracking-widest uppercase transition-colors"
              style={{
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                background: 'rgba(244,238,226,0.6)',
                backdropFilter: 'blur(10px)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span>{`View all ${projects.length} projects`}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <span className="mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
              {`${HERO_COUNT} of ${projects.length}`}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * MarginAside: a short handwritten thought beside the project description, in the
 * same hand and warm hue as the doodles, introduced by a small hand-drawn corner
 * arrow. Desktop only; the jitter seed is derived from projectId for stable SSR.
 */
function MarginAside({ projectId, text }) {
  if (!text) return null
  const fid = `aside-${projectId}`
  return (
    <div className="hidden md:flex items-start gap-2 mt-4 max-w-md" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" className="mt-[3px] shrink-0">
        <defs>
          <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={projectId * 11 + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${fid})`} stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          <path d="M 7 3 C 7 12, 8 16, 18 16" />
          <path d="M 18 16 l -7 -3.5 M 18 16 l -4 6" />
        </g>
      </svg>
      <p className="handwritten text-[18px] leading-snug" style={{ color: 'var(--accent)', opacity: 0.9 }}>
        {text}
      </p>
    </div>
  )
}

/**
 * FigureAnnotation: a short handwritten note drawn on top of a figure, with a
 * hand-drawn arrow (pencil jitter) curving into the diagram. Sits in the outer
 * margin so the figure reads like a page someone was thinking on, not a slide.
 *
 * The note itself stays crisp for legibility; only the arrow gets the wobble.
 * Jitter + tilt are derived from projectId so the server prerender and client
 * render match exactly (no Math.random hydration mismatch).
 */
export function FigureAnnotation({ projectId, text, side = 'right' }) {
  if (!text) return null

  const isRight = side === 'right'
  const tilt = (((projectId * 53) % 9) - 4) * 0.5 // ~ -2deg .. +2deg, stable per project
  const filterId = `anno-${projectId}`

  // Arrow path + small open arrowhead, mirrored per side. The tip lands near
  // the top of the figure so the note clearly points "into" the diagram.
  const arrow = isRight
    ? { d: 'M 112 10 C 84 26, 60 34, 30 64', head: 'M 30 64 L 44 62 M 30 64 L 36 50' }
    : { d: 'M 18 10 C 46 26, 70 34, 100 64', head: 'M 100 64 L 86 62 M 100 64 L 94 50' }

  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute z-20 pointer-events-none"
      style={{
        top: '-1.7rem',
        [isRight ? 'right' : 'left']: '-1rem',
        width: '170px',
        textAlign: isRight ? 'left' : 'right',
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <span
        className="handwritten block"
        style={{ color: 'var(--accent)', fontSize: '1.22rem', lineHeight: 1.12 }}
      >
        {text}
      </span>

      <svg
        width="130"
        height="80"
        viewBox="0 0 130 80"
        className="mt-1"
        style={{ marginLeft: isRight ? 0 : 'auto', display: 'block' }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed={projectId * 9 + 5} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`} stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          <path d={arrow.d} />
          <path d={arrow.head} />
        </g>
      </svg>
    </div>
  )
}

export function TickCorners() {
  const color = 'rgba(74,52,36,0.30)'
  const size = 10
  const s = { position: 'absolute', width: size, height: size, borderColor: color }
  return (
    <>
      <span style={{ ...s, top: 6, left: 6, borderTop: '1px solid', borderLeft: '1px solid' }} />
      <span style={{ ...s, top: 6, right: 6, borderTop: '1px solid', borderRight: '1px solid' }} />
      <span style={{ ...s, bottom: 6, left: 6, borderBottom: '1px solid', borderLeft: '1px solid' }} />
      <span style={{ ...s, bottom: 6, right: 6, borderBottom: '1px solid', borderRight: '1px solid' }} />
    </>
  )
}
