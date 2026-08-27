import { useEffect, useRef, lazy, Suspense } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './Hero'
import About from './About'
import News from './News'
import Portfolio from './Portfolio'
import Featured from './Featured'
import Contact from './Contact'
// Scroll-signal singletons are lightweight (no Three.js) so GSAP can drive them
// immediately. The attractor canvas itself is the heavy part — lazy-loaded
// below so the hero text paints before Three.js downloads.
import { morphState, cameraState, stageState } from './backgroundState'
import PaperBackground from './PaperBackground'
import PlateBackdrop from './PlateBackdrop'
// Light drops disabled for a cleaner background. To restore: uncomment this
// import and the <LightDrops /> render site below. See memory: light-drops-disabled.
// import LightDrops from './LightDrops'

// Heavy Three.js canvas + label: deferred off the critical path.
const MorphingBackground = lazy(() => import('./MathBackgrounds'))
const AttractorLabel = lazy(() =>
  import('./MathBackgrounds').then((m) => ({ default: m.AttractorLabel }))
)

gsap.registerPlugin(ScrollTrigger)

/**
 * Home: composes the page on a neutral paper grain foundation.
 *
 * Stack (bottom → top):
 *   1. PaperBackground: deep blue-charcoal base + monochrome grain (z=0)
 *   2. LightDrops: faint streaks sitting behind the curve (z=1)
 *   3. MorphingBackground: attractor canvas (z=2)
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
    // Hero: the curve is the centerpiece — large and near the middle, with the
    // text sitting smaller to its left.
    stageState.offsetX = 0.2
    stageState.offsetY = -0.1
    stageState.scale = 1.25
    stageState.opacity = 0.95
    gsap.set(bgRef.current, { opacity: 1 })

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      morphState.progress = 1
      cameraState.z = 4.6
      stageState.offsetX = 0.1
      stageState.scale = 1.1
      stageState.opacity = 0.82
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
      { offsetX: 0.2, offsetY: -0.1, scale: 1.25, opacity: 0.95 },
      {
        offsetX: -0.9, offsetY: 0.0, scale: 0.72, opacity: 0.30,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#about', start: 'top 90%', end: 'top 30%', scrub: 1.5 },
      }
    )
    // About → Portfolio: curve commits to the LEFT third and stays there as a
    // live "specimen" with clean space around it (nothing rendered over it).
    // The project content lives in the right two-thirds (text in the middle,
    // hand-drawn doodle on the right), so curve / text / figure read as three
    // zones of one page rather than stacked layers. Per-project motifs make the
    // curve visibly shift as each project becomes active — that's the interaction.
    gsap.fromTo(stageState,
      { offsetX: -0.9, offsetY: 0.0, scale: 0.72, opacity: 0.30 },
      {
        offsetX: -1.7, offsetY: 0.0, scale: 0.82, opacity: 0.92,
        ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '#portfolio', start: 'top 85%', end: 'top 25%', scrub: 1.5 },
      }
    )
    // Portfolio → News: drift to upper-right corner, contained scale.
    gsap.fromTo(stageState,
      { offsetX: -1.7, offsetY: 0.0, scale: 0.82, opacity: 0.92 },
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
        offsetX: -1.5, offsetY: 0.4, scale: 0.66, opacity: 0.45,
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

      {/* Attractor canvas: sits above paper, below light streaks. Deferred —
          fallback is empty so the paper foundation shows until Three.js loads. */}
      {/* Live attractor canvas: retired in favour of static painted plates, so
          each section has its own colour instead of one drifting curve shared by
          all of them. To restore, uncomment this and the AttractorLabel below.
          See public/plate-series.html for the placement rationale. */}
      {/* <div ref={bgRef} className="fixed inset-0 pointer-events-none z-[2]">
        <Suspense fallback={null}>
          <MorphingBackground />
        </Suspense>
      </div> */}

      {/* Subtle drifting light streaks (square paths, hero region) */}
      {/* Disabled for a cleaner background. To restore: uncomment this and the
          import at the top of the file. See memory: light-drops-disabled. */}
      {/* <LightDrops /> */}

      {/* Attractor label: separate stacking context, sits above sections so
          the "Curious what the X attractor is?" hint stays tappable even
          when text panels overlap the bottom-right of the viewport. */}
      {/* <Suspense fallback={null}>
        <AttractorLabel />
      </Suspense> */}

      <PlateBackdrop
        src="/images/art/attractor-plate-wet.webp"
        alt="A Lorenz attractor painted as a specimen plate"
        opacity={0.55}
        align="right"
      >
        <Hero />
      </PlateBackdrop>

      <SectionBreather />
      <About />

      <SectionBreather />
      <PlateBackdrop
        src="/images/art/plate-norm-balls.webp"
        alt="Unit balls of three norms, painted"
        opacity={0.32}
        align="right"
      >
        <Portfolio />
      </PlateBackdrop>

      <SectionBreather />
      <News />

      <SectionBreather />
      <PlateBackdrop
        src="/images/art/plate-loss-basin.webp"
        alt="A loss surface with a saddle, painted"
        opacity={0.28}
        align="center"
      >
        <Featured />
      </PlateBackdrop>

      <SectionBreather />
      <Contact />
    </>
  )
}

/** Quiet hairline only: spacing + neutral rule, no competing illustrations. */
function SectionBreather() {
  return (
    <div
      className="relative z-10 py-4 md:py-11 px-4 sm:px-6 md:px-8 pointer-events-none"
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
