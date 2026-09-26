import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { StanfordMark, MicrosoftMark, UNMark } from './Logos'

gsap.registerPlugin(ScrollTrigger)

/**
 * About: editorial layout with a panel-wrapped narrative and an asymmetric
 * photo mosaic. Text is guaranteed legible by sitting on a soft panel; images
 * are arranged with intentional mass (one tall, three square) rather than a
 * generic 2×2 grid.
 */
export default function About() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const mosaicRef = useRef(null)

  useEffect(() => {
    // Scoped with gsap.context so teardown reverts only THIS section's tweens
    // and triggers. The previous cleanup called ScrollTrigger.getAll().kill(),
    // which tore down every other panel's triggers too - and because StrictMode
    // mounts, unmounts and remounts, whichever panel happened to unmount last
    // could leave the others' scrubbed elements stranded at opacity 0.
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, contentRef.current, mosaicRef.current], { opacity: 1, y: 0, x: 0 })

      const trigger = {
        trigger: sectionRef.current,
        start: 'top 85%',
        end: 'top 50%',
        scrub: 1,
      }

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: trigger }
      )
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: trigger }
      )
      gsap.fromTo(
        mosaicRef.current,
        { opacity: 0, x: 24 },
        { opacity: 1, x: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: trigger }
      )

      // Subtle parallax on mosaic: 24px of drift feels premium, stays cheap
      gsap.fromTo(
        mosaicRef.current,
        { y: 24 },
        {
          y: -24,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      data-accent="sepia"
      className="relative z-10 px-5 py-24 sm:px-8 md:px-12 md:py-40"
    >
      {/*
        The rest. One narrow column, nothing in the margins, no plate.
        After a full-bleed painting the page needs somewhere to be quiet, and a
        panel with no art is a deliberate shape rather than an unfinished one.

        Gone: the 12-column split with a four-tile photo mosaic (each tile a
        2px-radius box under a pure-black rgba(0,0,0,0.78) gradient scrim - the
        only true black on a warm-paper page), the -mt-40 negative margin hack,
        and the blur(34px) radial scrim that existed to lift text off a Three.js
        curve deleted months ago.
      */}
      <div className="mx-auto w-full max-w-[36rem]">
        <header className="mb-10 md:mb-14">
          <div className="section-index mb-3">§ 01 · Who</div>
          <h2 ref={titleRef} className="t-section">
            About
          </h2>
        </header>

        <div ref={contentRef}>
          <p className="mb-8 text-[17px] leading-[1.72] md:text-[19px]" style={{ color: 'var(--ink)' }}>
            I am a computer science student at Stanford working on the science of deep
            learning, from optimization and training dynamics to mechanistic
            interpretability and alignment. I currently work with Belinda&nbsp;Li and Jacob&nbsp;Andreas
            at MIT on programmatic attention for <span className="whitespace-nowrap">interpretable-by-construction</span> transformers.
            Previously, I studied model editing methods such as task arithmetic and their
            downstream effects (
            <a
              href="https://arxiv.org/abs/2505.24262"
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial"
            >
              ICLR 2026
            </a>
            ) and interned at Microsoft Research.
          </p>
        </div>

        {/* Two photographs laid on the sheet rather than tiled into a grid:
            slightly off-square, slightly overlapping, captioned in the hand. */}
        <div ref={mosaicRef} className="my-12 flex items-start justify-center md:my-16">
          <figure className="relative z-10 w-[56%]" style={{ transform: 'rotate(-1.6deg)' }}>
            <img
              src="/images/about/microsoft.webp?v=2"
              alt="Laura at Microsoft Research"
              loading="lazy"
              decoding="async"
              className="w-full"
            />
            <figcaption className="mt-2">Microsoft Research</figcaption>
          </figure>
          <figure className="-ml-5 mt-12 w-[46%]" style={{ transform: 'rotate(2.2deg)' }}>
            <img
              src="/images/about/un.webp?v=2"
              alt="Laura at the United Nations"
              loading="lazy"
              decoding="async"
              className="w-full"
            />
            <figcaption className="mt-2">UN General Assembly</figcaption>
          </figure>
        </div>

        <div className="space-y-5 border-l pl-5" style={{ borderColor: 'var(--hairline)' }}>
          <p className="text-[15.5px] leading-relaxed md:text-[16.5px]" style={{ color: 'var(--ink-soft)' }}>
            Before moving into technical research, I worked on AI deployment and policy in
            low-resource settings. I co-founded ASOFI, which builds AI tools and literacy
            programs with rural cooperatives in Colombia, and contributed to AI policy
            discussions at UN Women, the World Economic Forum, and the UN General Assembly.
          </p>
        </div>

        {/* Affiliations, drawn in the site's ink (see Logos.jsx). */}
        <div
          className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-4 border-t pt-6"
          style={{ borderColor: 'var(--hairline)', color: 'var(--ink)' }}
        >
          {[
            ['https://www.stanford.edu', 'Stanford University', StanfordMark],
            ['https://www.microsoft.com/en-us/research', 'Microsoft Research', MicrosoftMark],
            ['https://www.un.org', 'United Nations', UNMark],
          ].map(([href, label, Mark]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="opacity-60 transition-opacity hover:opacity-100"
            >
              <Mark className="h-10 w-auto" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
