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
  const scrollRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(titleRef.current,    { opacity: 0, y: 28, duration: 1.2 })
      .from(subtitleRef.current, { opacity: 0, y: 18, duration: 0.9 }, '-=0.6')
      .from(emailRef.current,    { opacity: 0, y: 14, duration: 0.8 }, '-=0.5')
      .from(scrollRef.current,   { opacity: 0, duration: 1 }, '-=0.3')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative z-10 min-h-[120vh] md:min-h-[180vh] bg-transparent">

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

      {/* Intro block: left half so the attractor stage on the right has room.
          Anchored to the bottom of the first viewport, above the scroll cue. */}
      <div className="relative z-10 min-h-screen flex items-end pb-24 md:pb-28 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="w-full md:max-w-[50%] lg:max-w-[43%] relative">
          {/* Soft readability scrim behind copy: stays in the neutral ink family */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 95% 75% at 22% 50%, rgba(244,238,226,0.66) 0%, rgba(244,238,226,0.26) 55%, transparent 82%)',
              filter: 'blur(28px)',
              transform: 'scale(1.2)',
            }}
          />

          <div className="relative z-10">
            <h2
              ref={titleRef}
              className="font-light text-xl sm:text-2xl md:text-[1.75rem] lg:text-3xl mb-4 md:mb-5 tracking-tight text-on-bg"
              style={{ letterSpacing: '0.01em', lineHeight: 1.1, color: 'var(--ink)' }}
            >
              Laura Gomezjurado Gonzalez
            </h2>

            <div ref={subtitleRef} className="mb-5 md:mb-6">
              <p className="font-light text-[12.5px] md:text-[15px] tracking-wide leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                Stanford CS<span style={{ color: 'var(--ink-quiet)' }} className="mx-2">/</span>
                ICLR 2026<span style={{ color: 'var(--ink-quiet)' }} className="mx-2">/</span>
                Microsoft Research<span style={{ color: 'var(--ink-quiet)' }} className="mx-2">/</span>
                Lila Sciences
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
