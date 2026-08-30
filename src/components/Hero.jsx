import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Plate from './Plate'

/**
 * Hero: the name, set over a full-bleed painting.
 *
 * What changed, and why:
 *
 * - It was `min-h-[180vh]` with the copy pinned to the bottom of the FIRST
 *   viewport, so roughly 80vh of empty paper followed before anything else
 *   happened. One screen now.
 * - The copy was capped at `lg:max-w-[43%]` to leave room for a Three.js
 *   attractor on the right. That attractor was deleted months ago; the hole it
 *   left was still shaping the page. The measure is now chosen for the words.
 * - The name was `text-3xl` - 30px at most - while section headings downstream
 *   ran to 72px, so the page shouted its own table of contents and whispered
 *   whose it was. It is the largest thing here now, as it should be.
 * - The blurred radial scrim is gone. On near-white paper with the type placed
 *   in the quiet half of the composition, nothing needs to be scrimmed.
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
    <section id="home" data-accent="indigo" className="relative">
      <Plate
        src="/images/art/hero-attractor.webp"
        alt="A Lorenz attractor painted as a specimen plate"
        position="76% 44%"
        priority
      >
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-5 pb-20 sm:px-8 md:px-12 md:pb-24">
            <h1 ref={nameRef} className="t-name max-w-[13ch]">
              Laura Gomezjurado
            </h1>

            <p ref={metaRef} className="mono mt-6 md:mt-7" style={{ color: 'var(--ink-soft)' }}>
              Stanford CS
              <Sep /> ICLR 2026
              <Sep /> Microsoft Research
              <Sep /> Lila Sciences
            </p>

            <div ref={cueRef} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="mailto:lpgomez@stanford.edu" className="link-editorial mono">
                lpgomez [at] stanford.edu
              </a>
              <a
                href="https://github.com/LauraGomezjurado"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial mono"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/laura-gomezjurado/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial mono"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </Plate>
    </section>
  )
}

/** A quiet separator that does not read as punctuation. */
function Sep() {
  return (
    <span aria-hidden="true" className="mx-2 md:mx-3" style={{ color: 'var(--ink-quiet)' }}>
      /
    </span>
  )
}
