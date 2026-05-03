import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef(null)
  const brandRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const emailRef = useRef(null)
  const tagRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from(brandRef.current, { opacity: 0, x: -30, duration: 1 })
      .from(tagRef.current, { opacity: 0, y: 12, duration: 0.8 }, '-=0.5')
      .from(titleRef.current, { opacity: 0, y: 28, duration: 1.2 }, '-=0.5')
      .from(subtitleRef.current, { opacity: 0, y: 18, duration: 0.9 }, '-=0.6')
      .from(emailRef.current, { opacity: 0, y: 14, duration: 0.8 }, '-=0.5')
      .from(scrollRef.current, { opacity: 0, duration: 1 }, '-=0.3')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative z-10 min-h-[180vh] bg-transparent">
      {/* Brand mark */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-12 md:left-12 z-20">
        <h1
          ref={brandRef}
          className="text-white font-light tracking-[0.3em] text-2xl md:text-3xl uppercase text-on-bg"
          style={{ letterSpacing: '0.3em' }}
        >
          L G G
        </h1>
      </div>

      {/* Intro block */}
      <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-2xl w-full relative">
          {/* Soft localized darkening for readability — no hard panel edge */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 90% 70% at 15% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 55%, transparent 80%)',
              filter: 'blur(20px)',
              transform: 'scale(1.15)',
            }}
          />

          <div className="relative z-10">
            <div ref={tagRef} className="section-index mb-6">
              § 00 — CS, Stanford
            </div>

            <h2
              ref={titleRef}
              className="text-white font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5 md:mb-6 tracking-tight text-on-bg"
              style={{ letterSpacing: '0.01em', lineHeight: 1.05 }}
            >
              Laura Gomezjurado Gonzalez
            </h2>

            <div ref={subtitleRef} className="space-y-1.5 mb-5 md:mb-6">
              <p className="text-white/90 font-light text-base md:text-lg lg:text-xl tracking-wide text-on-bg">
                AI safety, interpretability, and fairness.
              </p>
              <p className="text-white/60 font-light text-sm md:text-base tracking-wide">
                Student researcher at Stanford. Working on mechanisms behind model behavior —
                and the people they affect.
              </p>
            </div>

            <div ref={emailRef} className="flex items-center gap-4 text-sm">
              <a
                href="mailto:lpgomez@stanford.edu"
                className="link-editorial font-light tracking-wide"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                lpgomez [AT] stanford.edu
              </a>
              <span className="h-px w-8" style={{ background: 'var(--hairline)' }} />
              <a
                href="https://github.com/LauraGomezjurado"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial font-light tracking-wide"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/laura-gomezjurado/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial font-light tracking-wide"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue — persistent, subtle, bottom-left */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-4 sm:left-6 md:left-12 flex items-center gap-3 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <span className="mono text-[10px] tracking-widest uppercase text-white/40">Scroll</span>
        <span
          className="h-px w-12 origin-left"
          style={{ background: 'rgba(255,255,255,0.35)', animation: 'hero-rule 2.6s ease-in-out infinite' }}
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
