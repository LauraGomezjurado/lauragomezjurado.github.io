import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './Hero'
import About from './About'
import News from './News'
import Portfolio from './Portfolio'
import Featured from './Featured'
import Contact from './Contact'
import MorphingBackground, { morphState, cameraState } from './MathBackgrounds'

gsap.registerPlugin(ScrollTrigger)

/**
 * Home — wires together the attractor canvas and section-level scroll
 * choreography. Each section gets its own camera + opacity profile so the
 * background performs differently depending on where the reader is:
 *
 *   Hero    → default distance, Lorenz
 *   About   → zoom in, still Lorenz, slight darken
 *   News    → pull back, morph Lorenz → Halvorsen
 *   Featured→ Halvorsen, medium zoom
 *   Portfolio → morph Halvorsen → Aizawa; Portfolio owns `motifState` per project
 *   Contact → pull back, ease motif off
 */
export default function Home() {
  const bgRef = useRef(null)

  useEffect(() => {
    gsap.set('body', { background: '#000000', color: '#FFFFFF' })

    // Smooth scroll for hash anchors
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    // Reset to known initial state
    morphState.progress = 0
    cameraState.z = 5.5
    gsap.set(bgRef.current, { opacity: 1 })

    // Respect reduced-motion: skip scroll-driven camera/morph transforms. The
    // canvas still renders (it's ambient, not rapid motion) but stays still.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      // Pick a pleasant resting state for the viewer
      morphState.progress = 1
      cameraState.z = 4.6
      return
    }

    // Camera ─────────────────────────────────────────────────────────────────
    // Gentle push-in for About
    gsap.fromTo(cameraState, { z: 5.5 }, {
      z: 4.0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#about', start: 'top 90%', end: 'bottom 60%', scrub: 2 },
    })
    // Pull back for News
    gsap.fromTo(cameraState, { z: 4.0 }, {
      z: 5.5,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#news', start: 'top 90%', end: 'top 40%', scrub: 2 },
    })
    // Subtle zoom for Featured
    gsap.fromTo(cameraState, { z: 5.5 }, {
      z: 4.2,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#featured', start: 'top 85%', end: 'top 20%', scrub: 2 },
    })
    // Pull back approaching Portfolio
    gsap.fromTo(cameraState, { z: 4.2 }, {
      z: 5.2,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 90%', end: 'top 50%', scrub: 2 },
    })
    // Inside Portfolio — gentle continuous drift so it doesn't feel static
    gsap.fromTo(cameraState, { z: 5.2 }, {
      z: 4.6,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 50%', end: 'bottom bottom', scrub: 2 },
    })
    // Reset for Contact
    gsap.fromTo(cameraState, { z: 4.6 }, {
      z: 5.5,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#contact', start: 'top 80%', end: 'top 20%', scrub: 2 },
    })

    // Morph progress: 0 = Lorenz, 1 = Halvorsen, 2 = Aizawa
    gsap.fromTo(morphState, { progress: 0 }, {
      progress: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#news', start: 'top 80%', end: 'top 10%', scrub: 1.5 },
    })
    gsap.fromTo(morphState, { progress: 1 }, {
      progress: 2,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 80%', end: 'top 10%', scrub: 1.5 },
    })

    // Background opacity — keep the background readable but always present.
    // Pull it down only slightly in content-heavy sections, and briefly
    // strengthen it between sections as a "breath" between chapters.
    gsap.fromTo(bgRef.current, { opacity: 1 }, {
      opacity: 0.70,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#about', start: 'top 70%', end: 'top 30%', scrub: 1.5 },
    })
    gsap.fromTo(bgRef.current, { opacity: 0.70 }, {
      opacity: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#news', start: 'top 80%', end: 'top 40%', scrub: 1.5 },
    })
    gsap.fromTo(bgRef.current, { opacity: 1 }, {
      opacity: 0.72,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#featured', start: 'top 70%', end: 'top 30%', scrub: 1.5 },
    })
    gsap.fromTo(bgRef.current, { opacity: 0.72 }, {
      opacity: 0.85,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 85%', end: 'top 30%', scrub: 1.5 },
    })
    gsap.fromTo(bgRef.current, { opacity: 0.85 }, {
      opacity: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#contact', start: 'top 80%', end: 'top 40%', scrub: 1.5 },
    })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <>
      {/* Single morphing background — one canvas, three attractors */}
      {/* z-[15] above section content (z-10) so the attractor label can receive taps;
          wrapper stays pointer-events-none so the canvas passes clicks through —
          only the label opts in with pointer-events-auto */}
      <div ref={bgRef} className="fixed inset-0 pointer-events-none z-[15]">
        <MorphingBackground />
      </div>

      <Hero />
      <About />
      <News />
      <Featured />
      <Portfolio />
      <Contact />
    </>
  )
}
