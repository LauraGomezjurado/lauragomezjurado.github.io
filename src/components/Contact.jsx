import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Contact: an editorial invitation rather than a generic form. The email is the
 * single bold, oversized move; a plain note and a handwritten aside carry the
 * voice; secondary links sit quiet underneath. No panel, no frosted frame, so it
 * coexists with the receded curve like every other section.
 */
export default function Contact() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    const common = { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 }
    gsap.fromTo(titleRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: common })
    gsap.fromTo(bodyRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: common })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-10 py-14 md:py-32 px-4 sm:px-6 md:px-8 overflow-visible bg-transparent -mt-16 md:-mt-20"
    >
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <header className="mb-10 md:mb-20 text-center">
          <div className="section-index mb-3 md:mb-4">§ 05 · Reach out</div>
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wider text-on-bg"
            style={{ color: 'var(--ink)' }}
          >
            Get In Touch
          </h2>
        </header>

        <div ref={bodyRef} className="relative max-w-2xl mx-auto">
          {/* Soft borderless glow lifts the words off the grain — no frame. */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-8 -inset-y-8 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 82% 80% at 34% 40%, rgba(238,231,217,0.6) 0%, rgba(238,231,217,0.2) 52%, transparent 80%)',
              filter: 'blur(34px)',
            }}
          />

          <div className="relative">
            <p className="text-base md:text-xl leading-relaxed font-light mb-8 md:mb-10 max-w-xl" style={{ color: 'var(--ink-soft)' }}>
              I am always glad to talk about interpretability, optimization, or deploying AI where
              infrastructure is thin. Email is the surest way to reach me.
            </p>

            {/* The one bold move: the email itself, oversized and near-black. */}
            <a
              href="mailto:lpgomez@stanford.edu"
              className="link-editorial inline-block tracking-tight leading-none text-[1.5rem] sm:text-[2.2rem] md:text-[2.7rem]"
              style={{ color: 'var(--ink-strong)', fontWeight: 500 }}
            >
              lpgomez@stanford.edu
            </a>

            {/* Handwritten personal aside, introduced by a small drawn arrow. */}
            <div className="flex items-start gap-2 mt-6">
              <svg width="24" height="24" viewBox="0 0 24 24" className="mt-[3px] shrink-0" aria-hidden="true">
                <defs>
                  <filter id="contact-aside" x="-30%" y="-30%" width="160%" height="160%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                <g filter="url(#contact-aside)" stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                  <path d="M 7 3 C 7 12, 8 16, 18 16" />
                  <path d="M 18 16 l -7 -3.5 M 18 16 l -4 6" />
                </g>
              </svg>
              <p className="handwritten text-[18px] leading-snug" style={{ color: 'var(--accent)', opacity: 0.9 }}>
                I read every message, replies can lag near deadlines
              </p>
            </div>

            {/* Quiet secondary row. */}
            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10 md:mt-12 pt-5"
              style={{ borderTop: '1px solid var(--hairline)' }}
            >
              <a
                href="https://github.com/LauraGomezjurado"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial text-[13px] font-light tracking-wide"
                style={{ color: 'var(--ink-soft)' }}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/laura-gomezjurado/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial text-[13px] font-light tracking-wide"
                style={{ color: 'var(--ink-soft)' }}
              >
                LinkedIn
              </a>
              <span className="mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
                Stanford, CA
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
