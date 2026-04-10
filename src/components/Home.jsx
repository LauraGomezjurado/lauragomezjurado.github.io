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

export default function Home() {
  const bgRef = useRef(null)

  useEffect(() => {
    gsap.set('body', { background: '#000000', color: '#FFFFFF' })

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    // Reset to known initial state so refreshing at any scroll position is safe
    morphState.progress = 0
    cameraState.z = 5.5
    gsap.set(bgRef.current, { opacity: 1 })

    // Zoom in from Home → About, back out before News
    gsap.fromTo(cameraState, { z: 5.5 }, {
      z: 3.8,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#about', start: 'top 90%', end: 'bottom 60%', scrub: 2 },
    })
    gsap.fromTo(cameraState, { z: 3.8 }, {
      z: 5.5,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#news', start: 'top 90%', end: 'top 40%', scrub: 2 },
    })

    // ── Morph progress: 0 = Lorenz, 1 = Halvorsen, 2 = Aizawa ──────────────
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

    // Fade down for Portfolio, back up for Contact
    gsap.fromTo(bgRef.current, { opacity: 1 }, {
      opacity: 0.25,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 100%', end: 'top 40%', scrub: 1.5 },
    })
    gsap.fromTo(bgRef.current, { opacity: 0.25 }, {
      opacity: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#contact', start: 'top 80%', end: 'top 20%', scrub: 1.5 },
    })

    // Subtle zoom + slight fade for Featured (within Halvorsen section)
    gsap.fromTo(cameraState, { z: 5.5 }, {
      z: 4.0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#featured', start: 'top 85%', end: 'top 20%', scrub: 2 },
    })
    gsap.fromTo(cameraState, { z: 4.0 }, {
      z: 5.5,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 90%', end: 'top 50%', scrub: 2 },
    })
    gsap.fromTo(bgRef.current, { opacity: 1 }, {
      opacity: 0.6,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#featured', start: 'top 85%', end: 'top 20%', scrub: 2 },
    })
    gsap.fromTo(bgRef.current, { opacity: 0.6 }, {
      opacity: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 90%', end: 'top 50%', scrub: 2 },
    })

    // Zoom in for Portfolio, back out for Contact
    gsap.fromTo(cameraState, { z: 5.5 }, {
      z: 2.8,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 90%', end: 'bottom 40%', scrub: 2 },
    })
    gsap.fromTo(cameraState, { z: 2.8 }, {
      z: 5.5,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#contact', start: 'top 80%', end: 'top 20%', scrub: 2 },
    })

    // Subtle section entrance fades
    document.querySelectorAll('section[id]').forEach(section => {
      gsap.fromTo(section,
        { opacity: 0.85, y: 10 },
        { opacity: 1, y: 0, immediateRender: false, scrollTrigger: { trigger: section, start: 'top 95%', end: 'top 50%', scrub: 2 } }
      )
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <>
      {/* Single morphing background — one canvas, three attractors */}
      <div ref={bgRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
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
