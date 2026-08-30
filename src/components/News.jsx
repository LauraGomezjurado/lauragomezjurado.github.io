import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const newsItems = [
  {
    date: 'June 2026',
    year: '2026',
    content: (
      <>
        Joining{' '}
        <a
          href="https://www.lila.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="link-editorial"
        >
          Lila Sciences
        </a>{' '}
        as an AI Resident (incoming).
      </>
    ),
    badge: 'Upcoming',
  },
  {
    date: 'June 2026',
    year: '2026',
    content:
      'Paper "Orth-Dion: Eliminating Geometric Mismatch in Distributed Low-Rank Spectral Optimization" (with Tatsuhiro Nakamori, Ganesh Talluri, Ansh Tiwari, Hideyuki Kawashima, Ioannis Mitliagkas, Guillaume Rabusseau, Hiroki Naganuma) accepted to the Connecting Low-rank Representations in AI (CoLoRAI) Workshop at ICML 2026.',
    badge: 'Accepted',
  },
  {
    date: 'May 2026',
    year: '2026',
    content:
      'Paper "Which Geometry on Which Layer? A Principled Criterion for Mixed-Optimizer Training" (with Hiroki Naganuma, Mahdi Ghaznavi, Atsushi Nitanda, Seng Pei Liew, Ryuichiro Hataya, Ioannis Mitliagkas) under review.',
    badge: 'Preprint',
  },
  {
    date: 'Apr 2026',
    year: '2026',
    content:
      'Selected ICLR 2026 oral presentation at the Geometry-grounded Representation Learning and Generative Modeling Workshop.',
    badge: 'Oral',
  },
  {
    date: 'Mar 2026',
    year: '2026',
    content:
      'Paper "The Long Delay to Arithmetic Generalization: When Learned Representations Outrun Behavior" under review.',
    badge: 'Preprint',
  },
  {
    date: 'Feb 2026',
    year: '2026',
    content:
      'Paper "On Fairness of Task Arithmetic: The Role of Task Vectors" (with Hiroki Naganuma, Kotaro Yoshida, Takafumi Horie, Yuji Naraki, Ryotaro Shimizu) accepted to ICLR 2026.',
    badge: 'Accepted',
  },
  {
    date: 'Feb 2026',
    year: '2026',
    content:
      'Joined the Supervised Alignment Research Program with Uzay Macar working on Mech Interp for Latent Reasoning Models.',
  },
  { date: 'Dec 2025', year: '2025', content: 'Presented workshop paper (2025).', badge: 'Talk' },
  { date: 'June to Aug 2025', year: '2025', content: 'Completed research internship at Microsoft Research.' },
  { date: 'Jan 2025', year: '2025', content: 'Featured in Mission Magazine, Issue 12: The New Order.' },
  {
    date: 'Jan 2025',
    year: '2025',
    content: 'Attended the World Economic Forum in Davos as a Youth Delegate for the We Are Family Foundation.',
  },
  {
    date: 'Dec 2024',
    year: '2024',
    content: 'Presented paper on AI for Respiratory Disease Detection at Prototypes for Humanity in Dubai.',
  },
  { date: 'Mar 2024', year: '2024', content: 'Attended the UN Women Commission on the Status of Women (CSW).' },
  { date: 'Jun to Aug 2024', year: '2024', content: 'Joined the Ersilia Open Source Initiative, working on AI for drug discovery.' },
  {
    date: 'Sep 2023',
    year: '2023',
    content: 'Attended the UN General Assembly and the UN Women Generation Equality Midpoint Moment.',
  },
  { date: 'Sep 2023', year: '2023', content: 'Started B.S. in Computer Science at Stanford University.' },
  { date: 'Jun 2023', year: '2023', content: 'Named Masason Foundation Fellow.' },
]

/**
 * News: editorial timeline grouped by year, with a continuous vertical rail.
 * Each entry reveals with a staggered slide-in so it reads like a sequence
 * rather than a wall. Sticky year markers anchor position as the reader scrolls.
 */
export default function News() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])

  // Group by year while preserving order
  const groups = useMemo(() => {
    const seen = new Map()
    newsItems.forEach((item) => {
      if (!seen.has(item.year)) seen.set(item.year, [])
      seen.get(item.year).push(item)
    })
    return Array.from(seen.entries())
  }, [])

  useEffect(() => {
    // Scoped with gsap.context so teardown reverts only THIS section's tweens
    // and triggers. The previous cleanup called ScrollTrigger.getAll().kill(),
    // which tore down every other panel's triggers too - and because StrictMode
    // mounts, unmounts and remounts, whichever panel happened to unmount last
    // could leave the others' scrubbed elements stranded at opacity 0.
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 },
          }
        )
      }

      itemsRef.current.forEach((el) => {
        if (!el) return
        gsap.fromTo(
          el,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 70%', scrub: 1 },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="news"
      data-accent="payne"
      className="relative z-10 px-5 py-24 sm:px-8 md:px-12 md:py-32"
    >
      {/*
        The dense panel. Everything either side of it is large and airy - a
        full-bleed plate, then spreads, then press images - so this one earns its
        place by being tight: small type, close leading, no art at all. Contrast
        of density is what stops six panels reading as six rows of a table.

        Gone from here: the 1px badge boxes (a bordered rectangle is the most
        software-looking element available), the glowing rail dots, and the
        rgba(143,175,214) blue in them - a leftover from the dark theme sitting
        in a warm palette.
      */}
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-12 md:mb-16">
          <div className="section-index mb-3">§ 03 · Recent</div>
          <h2 ref={titleRef} className="t-section">
            News
          </h2>
        </header>

        <div className="space-y-10 md:space-y-12">
          {groups.map(([year, items]) => (
            <section key={year} className="relative">
              {/*
                One bed per year, in the margin beside its heading.

                Deliberately not the research section's move - there, a single
                figure holds position and mutates as you scroll, and repeating
                that here would make the page look like it knows one trick.
                These are separate specimens that do not move; what varies is
                the DATA. The number of laminae in a bed is the number of things
                that happened that year, so 2026 is thick and finely banded and
                2023 is a thin quiet layer. The drawing is a count.
              */}
              <img
                src={`/images/marks/year-${year}.webp`}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute right-full top-1 mr-8 hidden w-[clamp(96px,11vw,185px)] lg:block xl:mr-12"
              />

              <h3
                className="mono mb-4 border-t pt-3"
                style={{ color: 'var(--accent)', borderColor: 'var(--hairline)' }}
              >
                {year}
              </h3>

              <ul className="space-y-3 md:space-y-3.5">
                {items.map((item, idx) => (
                  <li
                    key={`${item.date}-${idx}`}
                    ref={(el) => itemsRef.current.push(el)}
                    className="grid grid-cols-[64px_1fr] gap-4 md:grid-cols-[92px_1fr] md:gap-6"
                  >
                    <span
                      className="mono pt-[0.35em] leading-tight"
                      style={{ color: 'var(--ink-quiet)', fontSize: '0.625rem' }}
                    >
                      {item.date}
                    </span>
                    <p className="text-[14.5px] leading-[1.55] md:text-[15.5px]" style={{ color: 'var(--ink-soft)' }}>
                      {item.badge && (
                        <span className="mono mr-2" style={{ color: 'var(--accent)' }}>
                          {item.badge}
                        </span>
                      )}
                      {item.content}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
