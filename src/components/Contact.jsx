import { useEffect, useRef } from 'react'
import Plate from './Plate'
import { GitHubMark, LinkedInMark } from './Logos'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Contact: the email, a handwritten aside, and GitHub and LinkedIn marks in
 * the body ink, set small in the lower left corner. No panel, no frosted frame, so it
 * coexists with the receded curve like every other section.
 */
export default function Contact() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    // Scoped with gsap.context so teardown reverts only THIS section's tweens
    // and triggers. The previous cleanup called ScrollTrigger.getAll().kill(),
    // which tore down every other panel's triggers too - and because StrictMode
    // mounts, unmounts and remounts, whichever panel happened to unmount last
    // could leave the others' scrubbed elements stranded at opacity 0.
    const ctx = gsap.context(() => {
      const common = { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 }
      gsap.fromTo(titleRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: common })
      gsap.fromTo(bodyRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: common })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="contact" data-accent="madder" className="relative">
      {/*
        The page ends the way it began: on a full painting, with the address
        kept small in the left margin so the painting stays clear.

        This panel used to be a text column with a small mark tucked in the
        margin, and it read as the emptiest thing on the site - a lot of paper
        for one address. A hero at the top and nothing at the bottom is a page
        that trails off.

        The plate is the loss basin, which had been painted and then had nowhere
        to go. It is the right one for this: scripts/paint/README.md notes it was
        given the most muted pans in the box precisely BECAUSE it is the plate
        meant to sit behind type, and it is the only one composed to fill a page
        evenly rather than around a subject in the middle.
      */}
      <Plate
        src="/images/art/contact-basin.webp"
        alt="A loss surface painted with its contours and the path down it"
        position="46% 52%"
        height="100svh"
      >
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-5 pb-16 sm:px-8 md:px-12 md:pb-24">
            <div className="section-index mb-3">§ 05 · Reach out</div>
            <h2 ref={titleRef} className="t-section mb-5">
              Get in touch
            </h2>

            <div ref={bodyRef}>
              <a
                href="mailto:lpgomez@stanford.edu"
                className="inline-block leading-[1.02]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: 'var(--display-soft)',
                  fontWeight: 400,
                  fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)',
                  letterSpacing: '-0.024em',
                  color: 'var(--ink-strong)',
                }}
              >
                lpgomez@stanford.edu
              </a>

              <p className="handwritten mt-3 text-[17px] leading-snug" style={{ color: 'var(--accent)' }}>
                I read every message, replies can lag near deadlines
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a
                  href="https://github.com/LauraGomezjurado"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  <GitHubMark className="h-[22px] w-[22px]" />
                </a>
                <a
                  href="https://www.linkedin.com/in/laura-gomezjurado/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  <LinkedInMark className="h-[22px] w-[22px]" />
                </a>
                <span className="mono" style={{ color: 'var(--ink-quiet)' }}>
                  Stanford, CA
                </span>
              </div>
            </div>
          </div>
        </div>
      </Plate>
    </section>
  )
}
