import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * A paper title in quotes, linked to the paper. The co-authors are listed on
 * the linked page, so the news item does not repeat them.
 */
function Paper({ href, children }) {
  return (
    <>
      &ldquo;
      <a href={href} target="_blank" rel="noopener noreferrer" className="link-editorial">
        {children}
      </a>
      &rdquo;
    </>
  )
}

const newsItems = [
  {
    date: 'Sep 2026',
    year: '2026',
    content: (
      <>
        Joined <a href="https://sparai.org/" target="_blank" rel="noopener noreferrer" className="link-editorial">SPAR</a> with <a href="https://belindal.github.io/" target="_blank" rel="noopener noreferrer" className="link-editorial">Belinda Li</a> (Anthropic) and{' '}
        <a href="https://www.mit.edu/~jda/" target="_blank" rel="noopener noreferrer" className="link-editorial">Jacob Andreas</a> (MIT) on{' '}
        <a href="https://sparai.org/projects/f26/" target="_blank" rel="noopener noreferrer" className="link-editorial">programmatic attention in real transformers</a>.
      </>
    ),
    badge: 'Ongoing',
  },
  {
    date: 'June to Sep 2026',
    year: '2026',
    content: <>AI Residency at <a href="https://www.lila.ai/" target="_blank" rel="noopener noreferrer" className="link-editorial">Lila Sciences</a>.</>,
  },
  {
    date: 'June 2026',
    year: '2026',
    content: <><Paper href="https://arxiv.org/abs/2605.16341">Orth-Dion</Paper> accepted to the ICML 2026 CoLoRAI workshop.</>,
    badge: 'Accepted',
  },
  {
    date: 'May 2026',
    year: '2026',
    content: <><Paper href="https://openreview.net/forum?id=lDs4vkSX7J">Which Geometry on Which Layer?</Paper> under review.</>,
    badge: 'Preprint',
  },
  { date: 'Apr 2026', year: '2026', content: 'Oral at the ICLR 2026 GRaM workshop.', badge: 'Oral' },
  { date: 'Mar 2026', year: '2026', content: '“The Long Delay to Arithmetic Generalization” under review.', badge: 'Preprint' },
  {
    date: 'Feb 2026',
    year: '2026',
    content: <><Paper href="https://arxiv.org/abs/2505.24262">On Fairness of Task Arithmetic</Paper> accepted to ICLR 2026.</>,
    badge: 'Accepted',
  },
  { date: 'Feb 2026', year: '2026', content: 'Joined SPAR with Uzay Macar (Anthropic) on interpretability of latent reasoning models.' },
  { date: 'June to Aug 2025', year: '2025', content: 'Research internship at Microsoft Research.' },
  { date: 'Jan 2025', year: '2025', content: 'Featured in Mission Magazine, Issue 12.' },
  { date: 'Jan 2025', year: '2025', content: 'Youth Delegate at the World Economic Forum in Davos.' },
  { date: 'Dec 2024', year: '2024', content: 'Presented AI for respiratory disease detection at Prototypes for Humanity, Dubai.' },
  { date: 'Mar 2024', year: '2024', content: 'Attended the UN Commission on the Status of Women.' },
  { date: 'Jun to Aug 2024', year: '2024', content: 'AI for drug discovery at the Ersilia Open Source Initiative.' },
  { date: 'Sep 2023', year: '2023', content: 'Attended the UN General Assembly.' },
  { date: 'Sep 2023', year: '2023', content: 'Started a B.S. in Computer Science at Stanford.' },
  { date: 'Jun 2023', year: '2023', content: 'Named a Masason Foundation Fellow.' },
  { date: '2022', year: '2022', content: 'Named a Global Teen Leader by the We Are Family Foundation.' },
  { date: '2022', year: '2022', content: 'Represented Colombia at the European Girls’ Olympiad in Informatics.' },
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
