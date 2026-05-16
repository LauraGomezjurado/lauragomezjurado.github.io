import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TransparentLogo from './TransparentLogo'

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

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10 min-h-screen py-24 md:py-32 px-4 sm:px-6 md:px-8 overflow-visible -mt-40 bg-transparent"
    >
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <header className="mb-16 md:mb-24 text-center">
          <div className="section-index mb-4">§ 01 · Who</div>
          <h2
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-wider text-on-bg"
          >
            About
          </h2>
        </header>

        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
          {/* Narrative: sits on a soft panel for guaranteed legibility */}
          <div ref={contentRef} className="md:col-span-7 relative">
            <div className="panel scrim px-6 md:px-10 py-10 md:py-12">
              <p className="text-xl md:text-2xl text-white leading-relaxed font-light mb-9">
                I work on the science of understanding and steering learned systems. My
                research connects interpretability, optimization, and alignment by studying
                how models form internal structure, how training shapes that structure, and
                how we can intervene when model behavior is unreliable or unfair. The goal is
                to make powerful AI systems more legible, controllable, and accountable before
                they are deployed in the world.
              </p>

              {/* Research focus: four anchored themes, tight, scannable */}
              <div className="mb-10">
                <div
                  className="mono text-[10px] tracking-widest uppercase mb-5"
                  style={{ color: 'var(--accent-dim)' }}
                >
                  Research focus
                </div>
                <div className="flex gap-6">
                  <span className="shrink-0 w-px" style={{ background: 'var(--hairline)' }} />
                  <ul className="space-y-4 flex-1">
                    <FocusItem
                      title="Mechanistic interpretability."
                      body="Probing latent reasoning models with the Supervised Alignment Research Program. Shadow knowledge gaps in arithmetic grokking on Collatz, under review."
                    />
                    <FocusItem
                      title="Optimization geometry."
                      body="Orth-Dion, a QR corrected low rank spectral update that closes the Dion vs Muon geometry gap, under review. G-Scion, a per layer criterion for picking spectral versus sign geometry in mixed optimizer training, under review."
                    />
                    <FocusItem
                      title="Alignment on model editing."
                      body="A lambda scaled task vector merge that reduces demographic parity gaps while preserving accuracy, with a theoretical DPD upper bound. Accepted to ICLR 2026."
                    />
                    <FocusItem
                      title="Generalization and deployment."
                      body="Information theoretic AUC ceilings for weak signal regimes. Cybersecurity agent evaluation at Stanford CRFM. Cost aware multi LLM ensemble routing at the Stanford Scaling Intelligence Lab."
                    />
                  </ul>
                </div>
              </div>

              {/* Conviction + closer: where the technical and the global identity meet */}
              <div className="flex gap-6">
                <span className="shrink-0 w-px" style={{ background: 'var(--hairline)' }} />
                <div className="space-y-5">
                  <p className="text-base md:text-lg text-white/70 leading-relaxed font-light">
                    Alongside the research, I have spent six years working on AI
                    deployment in low resource settings, mostly through ASOFI, an
                    initiative I co founded that builds on device agricultural tools and
                    AI literacy programs with rural cooperatives in Colombia. I have also
                    contributed to AI policy conversations at UN Women, the World Economic
                    Forum, and the UN General Assembly. This side of the work keeps me
                    honest about which safety questions are actually load bearing.
                  </p>
                  <p className="text-base md:text-lg text-white/70 leading-relaxed font-light">
                    Currently at Stanford, previously Microsoft Research and supervised
                    research with Dr. Hiroki Naganuma at ProPlace.
                  </p>
                </div>
              </div>

              {/* Affiliations: understated row */}
              <div
                className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-10 pt-6"
                style={{ borderTop: '1px solid var(--hairline)' }}
              >
                <span className="mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
                  Affiliations
                </span>
                <a
                  href="https://www.stanford.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 opacity-70 transition-opacity"
                  aria-label="Stanford University"
                >
                  <TransparentLogo src="/stanford-logo.png" alt="Stanford" className="h-6 w-auto" />
                </a>
                <a
                  href="https://www.microsoft.com/en-us/research"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 opacity-70 transition-opacity inline-flex items-center"
                  aria-label="Microsoft Research"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="10" height="10" fill="#F25022" rx="1" />
                    <rect x="12" y="0" width="10" height="10" fill="#7FBA00" rx="1" />
                    <rect x="0" y="12" width="10" height="10" fill="#00A4EF" rx="1" />
                    <rect x="12" y="12" width="10" height="10" fill="#FFB900" rx="1" />
                  </svg>
                </a>
                <a
                  href="https://www.ersilia.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 opacity-70 transition-opacity"
                  aria-label="Ersilia Open Source Initiative"
                >
                  <img src="/ersilia-logo.png" alt="Ersilia" className="h-6 w-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* Mosaic: one tall + three square, not a uniform grid */}
          <div ref={mosaicRef} className="md:col-span-5 relative">
            <div className="grid grid-cols-6 grid-rows-6 gap-2 md:gap-3 aspect-[4/5] md:aspect-auto md:h-[560px]">
              <MosaicTile
                src="/images/about/microsoft.jpg?v=2"
                alt="Laura at Microsoft"
                caption="Microsoft Research"
                className="col-span-4 row-span-3"
              />
              <MosaicTile
                src="/images/about/davos.jpg?v=2"
                alt="Laura at World Economic Forum Davos 2025"
                caption="WEF Davos, 2025"
                className="col-span-2 row-span-2"
              />
              <MosaicTile
                src="/images/about/un.jpg?v=2"
                alt="Laura at United Nations"
                caption="United Nations"
                className="col-span-2 row-span-4"
              />
              <MosaicTile
                src="/images/about/iclr-presentation.jpeg"
                alt="Laura presenting at ICLR"
                caption="ICLR 2026"
                className="col-span-4 row-span-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FocusItem({ title, body }) {
  return (
    <li className="text-base md:text-[1.02rem] text-white/75 leading-relaxed font-light">
      <span className="text-white/95">{title}</span>{' '}
      <span className="text-white/65">{body}</span>
    </li>
  )
}

function MosaicTile({ src, alt, caption, className = '' }) {
  return (
    <figure
      className={`relative overflow-hidden group ${className}`}
      style={{ border: '1px solid var(--hairline)', borderRadius: '2px' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
        onError={(e) => {
          e.target.src = '/profile.jpg'
        }}
      />
      {/* Bottom gradient for caption legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)' }}
      />
      <figcaption className="absolute bottom-2 left-2.5 right-2.5 mono text-[10px] tracking-widest uppercase text-white/85">
        {caption}
      </figcaption>
    </figure>
  )
}
