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
    date: 'May 2026',
    year: '2026',
    content:
      'Paper "Orth-Dion: Eliminating Geometric Mismatch in Distributed Low-Rank Spectral Optimization" (with Tatsuhiro Nakamori, Ganesh Talluri, Ansh Tiwari, Hideyuki Kawashima, Ioannis Mitliagkas, Guillaume Rabusseau, Hiroki Naganuma) under review.',
    badge: 'Preprint',
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

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      id="news"
      className="relative z-10 min-h-screen py-24 md:py-32 px-4 sm:px-6 md:px-8 overflow-visible bg-transparent -mt-20"
    >
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <header className="mb-20 md:mb-24 text-center">
          <div className="section-index mb-4">§ 03 · Recent</div>
          <h2
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-wider text-on-bg"
          >
            News
          </h2>
        </header>

        <div className="relative">
          {/* Continuous vertical rail */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[76px] md:left-[92px] w-px pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent 0%, var(--hairline) 8%, var(--hairline) 92%, transparent 100%)' }}
          />

          <div className="space-y-14 md:space-y-16">
            {groups.map(([year, items]) => (
              <div key={year} className="relative">
                {/* Year marker: sticky within its group for stronger spatial anchoring */}
                <div className="flex items-center gap-5 mb-6">
                  <div
                    className="w-[64px] md:w-[80px] shrink-0 text-right mono text-xs tracking-widest"
                    style={{ color: 'var(--accent)' }}
                  >
                    {year}
                  </div>
                  <div className="relative w-[25px] flex justify-center">
                    {/* Node on the rail */}
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--accent)', boxShadow: '0 0 12px rgba(143,175,214,0.6)' }}
                    />
                  </div>
                  <div className="h-px flex-1" style={{ background: 'var(--hairline)' }} />
                </div>

                <ul className="space-y-5 md:space-y-6">
                  {items.map((item, idx) => (
                    <li
                      key={`${item.date}-${idx}`}
                      ref={(el) => itemsRef.current.push(el)}
                      className="grid grid-cols-[64px_25px_1fr] md:grid-cols-[80px_25px_1fr] items-start gap-5"
                    >
                      <span className="text-right mono text-[11px] tracking-widest uppercase pt-1" style={{ color: 'var(--accent-dim)' }}>
                        {item.date}
                      </span>
                      <span className="relative flex justify-center pt-1.5">
                        <span
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'rgba(143,175,214,0.45)' }}
                        />
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {item.badge && (
                          <span
                            className="mono text-[10px] tracking-widest uppercase self-start px-1.5 py-0.5"
                            style={{ color: 'var(--accent-dim)', border: '1px solid var(--border)' }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[15px] md:text-base text-white/80 leading-relaxed font-light">
                          {item.content}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
