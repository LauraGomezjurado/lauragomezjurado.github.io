import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Contact: a handwritten line that opens an email, and the painted GitHub and
 * LinkedIn marks, on bare paper at the left, with the loss-basin plate to their
 * right. The address itself is shown once, in the hero.
 */
export default function Contact() {
  const sectionRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    // Scoped with gsap.context so teardown reverts only THIS section's tweens
    // and triggers. The previous cleanup called ScrollTrigger.getAll().kill(),
    // which tore down every other panel's triggers too - and because StrictMode
    // mounts, unmounts and remounts, whichever panel happened to unmount last
    // could leave the others' scrubbed elements stranded at opacity 0.
    const ctx = gsap.context(() => {
      const common = { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 }
      gsap.fromTo(bodyRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: common })
    })

    return () => ctx.revert()
  }, [])

  // The plate fades out on its left (where the text is), top and bottom: two
  // gradients, intersected, so only the middle of the right side is at full
  // strength. It is painted on the page's paper, so the faded part shows the
  // same paper and no edge is ever seen.
  const fade = {
    maskImage:
      'linear-gradient(to right, transparent 0, #000 32%), linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(to right, transparent 0, #000 32%), linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)',
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  }

  return (
    <section ref={sectionRef} id="contact" data-accent="madder" className="relative overflow-hidden">
      {/*
        The page ends the way it began: on a painting, with the address kept to
        the left so the painting stays clear.

        The plate is the loss basin, given the most muted pans in the box
        because it was meant to sit behind type (see scripts/paint/README.md).
        It used to fill the whole screen, which enlarged its 2400px render by up
        to 3x on a phone and ran its contours through the address. From xl (1280px) up it
        sits right of the text at no more than 1100px wide, ending 9rem from the
        edge so its leader lines clear the fixed menu; below xl it is a band
        above the text. Either way it has at least 2 image pixels per CSS pixel.
      */}
      <img
        src="/images/art/contact-basin.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="block w-full md:mx-auto md:max-w-[44rem] xl:absolute xl:right-[9rem] xl:top-1/2 xl:w-[min(68vw,1100px)] xl:max-w-none xl:-translate-y-1/2"
        style={fade}
      />

      <div className="relative px-5 pb-20 pt-2 sm:px-8 md:px-12 xl:flex xl:min-h-[88svh] xl:items-center xl:py-24">
        <div ref={bodyRef} className="max-w-[30rem]">
          {/* The address itself is in the hero; here the line is the link. */}
          <a
            href="mailto:lpgomez@stanford.edu"
            className="handwritten link-editorial link-bare inline-block text-[22px] leading-snug md:text-[26px]"
            style={{ color: 'var(--accent)' }}
          >
            I read every message, replies can lag near deadlines
          </a>

          {/* Painted from the real marks by the same pipeline as the About
              logos (scripts/paint/sketches/mark-affiliation.js). */}
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <a href="https://github.com/LauraGomezjurado" target="_blank" rel="noopener noreferrer" title="GitHub" className="opacity-90 transition-opacity hover:opacity-100">
              <img src="/images/marks/github.webp" alt="GitHub" loading="lazy" decoding="async" className="h-11 w-auto" />
            </a>
            <a href="https://www.linkedin.com/in/laura-gomezjurado/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="opacity-90 transition-opacity hover:opacity-100">
              <img src="/images/marks/linkedin.webp" alt="LinkedIn" loading="lazy" decoding="async" className="h-11 w-auto" />
            </a>
            <span className="mono" style={{ color: 'var(--ink-quiet)' }}>
              Stanford, CA
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
