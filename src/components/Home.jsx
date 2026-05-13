import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './Hero'
import About from './About'
import News from './News'
import Portfolio from './Portfolio'
import Featured from './Featured'
import Contact from './Contact'
import MorphingBackground, { AttractorLabel, morphState, cameraState, stageState } from './MathBackgrounds'
import PaperBackground from './PaperBackground'
import LightDrops from './LightDrops'

gsap.registerPlugin(ScrollTrigger)

/**
 * Home: composes the page on a neutral paper grain foundation.
 *
 * Stack (bottom → top):
 *   1. PaperBackground: deep blue-charcoal base + monochrome grain (z=0)
 *   2. MorphingBackground: attractor canvas (z=2)
 *   3. LightDrops: faint streaks above the curve (z=3)
 *   4. Sections: z=10, above curve for legibility (label is fixed z=40)
 *
 * Stage choreography keeps the attractor from competing with text. The
 * document order is Hero → About → Portfolio → News → Featured → Contact,
 * so the curve does this:
 *   - Hero      → stage on the right (curve sits in the right ~third of the
 *                 viewport, text on the left has clean paper)
 *   - About     → curve recedes (low opacity): paper + bloom dominate
 *   - Portfolio → curve returns to centre at full presence; per-project motifs
 *                 (hue/intensity/spin) take over the colour story
 *   - News      → curve drifts to the upper-right corner, small contained scale
 *   - Featured  → similar small stage, lower-right
 *   - Contact   → curve resettles to centre, soft and recessive
 */
export default function Home() {
  const bgRef = useRef(null)

  useEffect(() => {
    gsap.set('body', { background: 'var(--paper-base)', color: 'var(--ink)' })

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    morphState.progress = 0
    cameraState.z = 5.5
    stageState.offsetX = 1.4
    stageState.offsetY = -0.2
    stageState.scale = 0.92
    stageState.opacity = 0.95
    gsap.set(bgRef.current, { opacity: 1 })

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      morphState.progress = 1
      cameraState.z = 4.6
      stageState.offsetX = 0
      stageState.scale = 0.85
      stageState.opacity = 0.7
      return
    }

    // ── Camera ───────────────────────────────────────────────────────────
    // Document order is now: about → portfolio → news → featured → contact.
    // Each fromTo's start value matches the previous animation's end value so
    // the camera Z chain stays continuous as the reader scrolls.

    // About: push in so the curve "comes closer" as the reader settles
    gsap.fromTo(cameraState, { z: 5.5 }, {
      z: 4.4,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#about', start: 'top 90%', end: 'bottom 60%', scrub: 2 },
    })
    // Portfolio top half: pull back as we enter the research stretch
    gsap.fromTo(cameraState, { z: 4.4 }, {
      z: 5.2,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 90%', end: 'top 50%', scrub: 2 },
    })
    // Portfolio bottom half: push in slightly through the project cards
    gsap.fromTo(cameraState, { z: 5.2 }, {
      z: 4.6,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 50%', end: 'bottom bottom', scrub: 2 },
    })
    // News: pull back further as we move from research into recent activity
    gsap.fromTo(cameraState, { z: 4.6 }, {
      z: 5.6,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#news', start: 'top 90%', end: 'top 40%', scrub: 2 },
    })
    // Featured: push in to land on the press grid
    gsap.fromTo(cameraState, { z: 5.6 }, {
      z: 4.4,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#featured', start: 'top 85%', end: 'top 20%', scrub: 2 },
    })
    // Contact: settle back out
    gsap.fromTo(cameraState, { z: 4.4 }, {
      z: 5.4,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#contact', start: 'top 80%', end: 'top 20%', scrub: 2 },
    })

    // ── Stage (where on screen the attractor lives) ─────────────────────
    // Hero → curve on the right. About → recede + drift left of centre.
    gsap.fromTo(stageState,
      { offsetX: 1.4, offsetY: -0.2, scale: 0.92, opacity: 0.95 },
      {
        offsetX: -0.4, offsetY: 0.0, scale: 0.78, opacity: 0.45,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#about', start: 'top 90%', end: 'top 30%', scrub: 1.5 },
      }
    )
    // About → Portfolio: curve returns to centre at full presence; the
    // Portfolio's per-project motifs take over the colour story.
    gsap.fromTo(stageState,
      { offsetX: -0.4, offsetY: 0.0, scale: 0.78, opacity: 0.45 },
      {
        offsetX: 0.0, offsetY: -0.2, scale: 1.0, opacity: 0.85,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#portfolio', start: 'top 85%', end: 'top 25%', scrub: 1.5 },
      }
    )
    // Portfolio → News: drift to upper-right corner, contained scale.
    gsap.fromTo(stageState,
      { offsetX: 0.0, offsetY: -0.2, scale: 1.0, opacity: 0.85 },
      {
        offsetX: 1.6, offsetY: 1.1, scale: 0.55, opacity: 0.55,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#news', start: 'top 85%', end: 'top 35%', scrub: 1.5 },
      }
    )
    // News → Featured: drift to lower-right.
    gsap.fromTo(stageState,
      { offsetX: 1.6, offsetY: 1.1, scale: 0.55, opacity: 0.55 },
      {
        offsetX: 1.4, offsetY: -1.1, scale: 0.60, opacity: 0.55,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#featured', start: 'top 85%', end: 'top 35%', scrub: 1.5 },
      }
    )
    // Featured → Contact: settle, recede.
    gsap.fromTo(stageState,
      { offsetX: 1.4, offsetY: -1.1, scale: 0.60, opacity: 0.55 },
      {
        offsetX: -1.2, offsetY: 0.6, scale: 0.65, opacity: 0.55,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#contact', start: 'top 80%', end: 'top 20%', scrub: 1.5 },
      }
    )

    // ── Morph progress (which attractor is showing) ─────────────────────
    // First morph happens during Portfolio (the main research stretch),
    // second morph during News so the curve finishes its arc by Featured.
    gsap.fromTo(morphState, { progress: 0 }, {
      progress: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 80%', end: 'top 10%', scrub: 1.5 },
    })
    gsap.fromTo(morphState, { progress: 1 }, {
      progress: 2,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#news', start: 'top 80%', end: 'top 10%', scrub: 1.5 },
    })

    // ── Wrapper opacity (extra subtle pull-down only inside dense sections) ─
    gsap.fromTo(bgRef.current, { opacity: 1 }, {
      opacity: 0.85,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#about', start: 'top 70%', end: 'top 30%', scrub: 1.5 },
    })
    gsap.fromTo(bgRef.current, { opacity: 0.85 }, {
      opacity: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#portfolio', start: 'top 85%', end: 'top 30%', scrub: 1.5 },
    })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <>
      {/* Foundation: paper + fiber, sits below everything */}
      <PaperBackground />

      {/* Attractor canvas: sits above paper, below light streaks */}
      <div ref={bgRef} className="fixed inset-0 pointer-events-none z-[2]">
        <MorphingBackground />
      </div>

      {/* Subtle drifting light streaks (square paths, hero region) */}
      <LightDrops />

      {/* Attractor label: separate stacking context, sits above sections so
          the "Curious what the X attractor is?" hint stays tappable even
          when text panels overlap the bottom-right of the viewport. */}
      <AttractorLabel />

      <Hero />

      <SectionBreather />
      <About />

      <SectionBreather />
      <Portfolio />

      <SectionBreather />
      <News />

      <SectionBreather />
      <Featured />

      <SectionBreather />
      <Contact />
    </>
  )
}

/** Quiet hairline only: spacing + neutral rule, no competing illustrations. */
function SectionBreather() {
  return (
    <div
      className="relative z-10 py-8 md:py-11 px-4 sm:px-6 md:px-8 pointer-events-none"
      aria-hidden
    >
      <div
        className="mx-auto max-w-xl h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--hairline) 18%, var(--hairline) 82%, transparent 100%)',
        }}
      />
    </div>
  )
}
