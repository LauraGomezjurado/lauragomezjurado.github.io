import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero: text on the left; attractor occupies the opposite side of the
 * viewport via `stageState` in Home.jsx. No ornamental figures here: visual
 * language stays consistent with the attractor line-art only.
 */
export default function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const emailRef = useRef(null)
  const tagRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(tagRef.current,      { opacity: 0, y: 12, duration: 0.8 })
      .from(titleRef.current,    { opacity: 0, y: 28, duration: 1.2 }, '-=0.5')
      .from(subtitleRef.current, { opacity: 0, y: 18, duration: 0.9 }, '-=0.6')
      .from(emailRef.current,    { opacity: 0, y: 14, duration: 0.8 }, '-=0.5')
      .from(scrollRef.current,   { opacity: 0, duration: 1 }, '-=0.3')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative z-10 min-h-[180vh] bg-transparent">

      {/* Brand mark (L G G) — hidden
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-12 md:left-12 z-20">
        <h1
          ref={brandRef}
          className="font-light tracking-[0.3em] text-2xl md:text-3xl uppercase text-on-bg"
          style={{ letterSpacing: '0.3em', color: 'var(--ink)' }}
        >
          L G G
        </h1>
      </div>
      */}

      {/* Intro block: left half so the attractor stage on the right has room */}
      <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="w-full md:max-w-[58%] lg:max-w-[52%] relative">
          {/* Soft readability scrim behind copy: stays in the neutral ink family */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 95% 75% at 22% 50%, rgba(15,17,22,0.58) 0%, rgba(15,17,22,0.22) 55%, transparent 82%)',
              filter: 'blur(28px)',
              transform: 'scale(1.18)',
            }}
          />

          <div className="relative z-10">
            <div ref={tagRef} className="section-index mb-6">
              § 00 · Stanford CS · AI Safety, Interpretability, Optimization
            </div>

            <h2
              ref={titleRef}
              className="font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5 md:mb-6 tracking-tight text-on-bg"
              style={{ letterSpacing: '0.01em', lineHeight: 1.05, color: 'var(--ink)' }}
            >
              Laura Gomezjurado Gonzalez
            </h2>

            <div ref={subtitleRef} className="space-y-2 mb-5 md:mb-6">
              <p className="font-light text-base md:text-lg lg:text-xl tracking-wide text-on-bg leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                Research on the mechanisms behind model behavior, the geometry of how they get trained,
                and the safety questions that show up when these systems are deployed where they actually
                matter.
              </p>
              <p className="font-light text-sm md:text-base tracking-wide" style={{ color: 'var(--ink-quiet)' }}>
                Stanford CS. ICLR 2026. Microsoft Research, summer 2025. Incoming AI Resident at Lila
                Sciences.
              </p>
              <p className="mono text-[10px] md:text-[11px] tracking-widest uppercase pt-1" style={{ color: 'var(--accent-dim)' }}>
                Mechanistic interpretability, optimization geometry, alignment on model editing, generalization
                and grokking
              </p>
            </div>

            <div ref={emailRef} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <a
                href="mailto:lpgomez@stanford.edu"
                className="link-editorial font-light tracking-wide"
                style={{ color: 'var(--ink-soft)' }}
              >
                lpgomez [AT] stanford.edu
              </a>
              <span className="h-px w-8" style={{ background: 'var(--hairline)' }} />
              <a
                href="https://github.com/LauraGomezjurado"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial font-light tracking-wide"
                style={{ color: 'var(--ink-quiet)' }}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/laura-gomezjurado/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial font-light tracking-wide"
                style={{ color: 'var(--ink-quiet)' }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-4 sm:left-6 md:left-12 flex items-center gap-3 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <span className="mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--ink-quiet)' }}>
          Scroll
        </span>
        <span
          className="h-px w-12 origin-left"
          style={{ background: 'var(--accent-dim)', animation: 'hero-rule 2.6s ease-in-out infinite' }}
        />
      </div>

      <style>{`
        @keyframes hero-rule {
          0%   { transform: scaleX(0.2); opacity: 0.2; }
          50%  { transform: scaleX(1);   opacity: 0.7; }
          100% { transform: scaleX(0.2); opacity: 0.2; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes hero-rule { 0%,100% { transform: scaleX(1); opacity: 0.4; } }
        }
      `}</style>
    </section>
  )
}
