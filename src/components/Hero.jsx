import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Plate from './Plate'

/**
 * Hero: a full-bleed painting, with the portrait, name and bio in its empty
 * left third.
 *
 * - The attractor is the largest thing on the screen. The name used to be
 *   (t-name, up to 6.5rem), which read as a company masthead with nothing
 *   about the person; it is now t-name-sm and sits over the bio that used to
 *   open About.
 * - "Stanford CS" is gone: the first sentence of the bio says it.
 * - The plate has thin leader lines painted into it. The text column is capped
 *   at 26rem and centred vertically so none of them cross the paragraph.
 * - On phones the text moves below the painting, in flow, and the plate crops
 *   to the right so the whole attractor stays in frame.
 */
export default function Hero() {
  const nameRef = useRef(null)
  const metaRef = useRef(null)
  const cueRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    // gsap.context + revert(), not timeline.kill().
    //
    // StrictMode runs an effect, tears it down, and runs it again. `gsap.from`
    // sets the element to opacity 0 immediately and animates up; kill() stops
    // the tween wherever it happens to be and LEAVES it there, so the teardown
    // freezes the hero at opacity 0 and the second run then animates from 0 to
    // its "current" value, which is also 0. The name never appears.
    //
    // revert() restores the pre-animation inline styles, so the re-run starts
    // clean. This is the reason the whole hero was invisible.
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(nameRef.current, { opacity: 0, y: 24, duration: 1.1 })
        .from(metaRef.current, { opacity: 0, y: 14, duration: 0.8 }, '-=0.6')
        .from(cueRef.current, { opacity: 0, duration: 0.9 }, '-=0.4')
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="home"
      data-accent="indigo"
      className="relative [--hero-h:62svh] [--hero-pos:76%_44%] md:[--hero-h:100svh] md:[--hero-pos:38%_44%]"
    >
      <Plate
        src="/images/art/hero-attractor.webp"
        alt="A Lorenz attractor painted as a specimen plate"
        position="var(--hero-pos)"
        height="var(--hero-h)"
        priority
      />

      <div className="px-5 pb-16 pt-2 sm:px-8 md:absolute md:inset-0 md:flex md:items-center md:px-12 md:pb-0 md:pt-8">
        <div className="max-w-[26rem]">
          <div ref={nameRef}>
            <img
              src="/images/about/portrait-research.webp"
              alt="Laura Gomezjurado"
              width="480"
              height="600"
              fetchPriority="high"
              className="mb-6 w-[88px] md:w-[104px]"
            />
            <h1 className="t-name-sm">Laura Gomezjurado</h1>
          </div>

          <div ref={metaRef}>
            <p className="mt-5 text-[16px] leading-[1.65] md:text-[16.5px]" style={{ color: 'var(--ink)' }}>
              I am a computer science student at Stanford working on the science of deep
              learning, from optimization and training dynamics to mechanistic
              interpretability and alignment. I currently work with Belinda&nbsp;Li and Jacob&nbsp;Andreas
              at MIT on programmatic attention for interpretable-by-construction transformers.
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

          <div ref={cueRef} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="mailto:lpgomez@stanford.edu" className="link-editorial link-bare mono">
              lpgomez [at] stanford.edu
            </a>
            <a
              href="https://github.com/LauraGomezjurado"
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial link-bare mono"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/laura-gomezjurado/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial link-bare mono"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
