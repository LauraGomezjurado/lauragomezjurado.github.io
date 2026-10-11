import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * About: a painted background, two photographs, the policy paragraph and
 * the affiliation logos.
 * The section header and the research paragraph moved into the Hero, so this
 * section follows straight on from it.
 */
export default function About() {
  const sectionRef = useRef(null)
  const mosaicRef = useRef(null)

  useEffect(() => {
    // Scoped with gsap.context so teardown reverts only THIS section's tweens
    // and triggers. The previous cleanup called ScrollTrigger.getAll().kill(),
    // which tore down every other panel's triggers too - and because StrictMode
    // mounts, unmounts and remounts, whichever panel happened to unmount last
    // could leave the others' scrubbed elements stranded at opacity 0.
    const ctx = gsap.context(() => {
      gsap.set(mosaicRef.current, { opacity: 1, y: 0, x: 0 })

      const trigger = {
        trigger: sectionRef.current,
        start: 'top 85%',
        end: 'top 50%',
        scrub: 1,
      }

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
      className="relative z-10 overflow-hidden xl:min-h-[100svh]"
    >
      {/* Star trails about the pole, over the Andes
          (scripts/paint/sketches/about-north-star.js). From xl (1280px) up the plate
          sits at the section's left edge at no more than 1120px wide, so the
          star field is about the size of the hero's attractor and the 2400px
          render stays above 2x on retina screens. Its right half is bare
          paper. Below xl there is no room beside it for the photographs, so it is
          a band above the content. */}
      <img
        src="/images/art/about-north-star.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="block h-[100vw] w-full object-cover md:h-[60vw] xl:absolute xl:left-0 xl:top-1/2 xl:h-auto xl:w-[min(78vw,1120px)] xl:-translate-y-1/2 xl:object-contain"
        style={{
          objectPosition: '0% 45%',
          // The plate is painted on the page's own paper, so fading it to
          // transparent at the top and bottom shows the same paper: the trails
          // and the ridge dissolve into the sheet instead of ending at the
          // section's edges.
          maskImage: 'linear-gradient(to bottom, transparent 0, #000 9%, #000 84%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 9%, #000 84%, transparent 100%)',
        }}
      />

      <div className="relative px-5 pb-24 pt-4 sm:px-8 md:px-12 xl:flex xl:min-h-[100svh] xl:items-center xl:justify-end xl:py-32 xl:pr-[11rem]">
        <div className="w-full md:mx-auto md:max-w-[34rem] xl:mx-0 xl:max-w-[31rem]">
          {/* Two photographs, overlapping each other. From xl up the pair is
              pulled left past the text column so the first photo lies over the
              right edge of the painting; the paragraph below stays on bare
              paper. The photos are recognisable, so they carry no captions.
              The column clears the fixed menu. */}
          <div ref={mosaicRef} className="mb-12 flex items-start md:mb-14 xl:-ml-40">
            {[
              ['un', 'Laura at the United Nations', -2.2, 'w-[54%] md:w-[46%]', '45% 30%'],
              ['davos-crop', 'Laura at the World Economic Forum in Davos', 1.8, 'w-[50%] -ml-[4%] mt-10 md:w-[42%] md:-ml-[6%]', '50% 50%'],
            ].map(([file, alt, turn, place, pos], i) => (
              <figure
                key={file}
                className={`relative ${place}`}
                style={{ transform: `rotate(${turn}deg)`, zIndex: i + 1 }}
              >
                <img
                  src={`/images/about/${file}.webp?v=2`}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                  style={{ objectPosition: pos }}
                />
              </figure>
            ))}
          </div>

          <div className="space-y-5 border-l pl-5" style={{ borderColor: 'var(--hairline)' }}>
            <p className="text-[15.5px] leading-relaxed md:text-[16.5px]" style={{ color: 'var(--ink-soft)' }}>
              I believe AGI should enhance humanity and work with us to make a better world. I
              co-founded ASOFI, where we built AI
              tools and literacy programs with rural cooperatives in Colombia, and I contributed
              to AI policy discussions at UN Women, the World Economic Forum, and the UN General
              Assembly.
            </p>
          </div>

          {/* Affiliations, painted from the real logos by the same pipeline as
              the plates (scripts/paint/sketches/mark-affiliation.js). */}
          <div
            className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5 border-t pt-6"
            style={{ borderColor: 'var(--hairline)' }}
          >
            {[
              ['https://www.stanford.edu', 'Stanford University', 'stanford', 'h-16'],
              ['https://www.microsoft.com/en-us/research', 'Microsoft Research', 'microsoft', 'h-12'],
              ['https://www.un.org', 'United Nations', 'un', 'h-14'],
            ].map(([href, label, mark, size]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="opacity-90 transition-opacity hover:opacity-100"
              >
                <img
                  src={`/images/marks/${mark}.webp`}
                  alt={label}
                  loading="lazy"
                  decoding="async"
                  className={`${size} w-auto`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
