import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const newsItems = [
  {
    date: 'June 2026',
    content: (
      <>
        Joining{' '}
        <a
          href="https://www.lila.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="border-b transition-colors" style={{ color: 'var(--accent)', borderColor: 'var(--accent-dim)' }}
        >
          Lila Sciences
        </a>{' '}
        as an AI Resident (summer 2026).
      </>
    )
  },
  {
    date: 'Apr 2026',
    content:
      'Selected ICLR 2026 oral presentation at the Geometry-grounded Representation Learning and Generative Modeling Workshop.'
  },
  { date: 'Mar 2026', content: 'Paper "The Long Delay to Arithmetic Generalization: When Learned Representations Outrun Behavior" under review.' },
  // { date: 'Feb 2026', content: 'Paper "The Geometry of Spectral Gradient Descent: Layerwise Criteria for SignSGD vs SpecSGD" (with Hiroki Naganuma, Mahdi Ghaznavi, Ioannis Mitliagkas) under review.' },
  { date: 'Feb 2026', content: 'Paper "On Fairness of Task Arithmetic: The Role of Task Vectors" (with Hiroki Naganuma, Kotaro Yoshida, Takafumi Horie, Yuji Naraki, Ryotaro Shimizu) accepted to ICLR 2026.'},
  { date: 'Feb 2026', content: 'Joined the Supervised Alignment Research Program with Uzay Marcar working on Mech Interp for Latent Reasoning Models.' },
  { date: 'Dec 2025', content: 'Presented workshop paper at NeurIPS 2025.' },
  { date: 'June-Aug 2025', content: 'Completed research internship at Microsoft Research.' },
  // { date: 'Jun 2025', content: 'Started research internship at Microsoft Research.' },
  { date: 'Jan 2025', content: 'Featured in Mission Magazine, Issue 12: The New Order.' },
  { date: 'Jan 2025', content: 'Attended the World Economic Forum in Davos as a Youth Delegate for the We Are Family Foundation.' },
  { date: 'Dec 2024', content: 'Presented paper on AI for Respiratory Disease Detection at Prototypes for Humanity in Dubai.' },
  { date: 'Mar 2024', content: 'Attended the UN Women Commission on the Status of Women (CSW).' },
  { date: 'Jun-Aug 2024', content: 'Joined the Ersilia Open Source Initiative, working on AI for drug discovery.' },
  { date: 'Sep 2023', content: 'Attended the UN General Assembly and the UN Women Generation Equality Midpoint Moment.' },
  { date: 'Sep 2023', content: 'Started B.S. in Computer Science at Stanford University.' },
  { date: 'Jun 2023', content: 'Named Masason Foundation Fellow.' }
]

export default function News() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'top 55%',
            toggleActions: 'play none none none',
            scrub: 1
          }
        }
      )
    }

    itemsRef.current.forEach((el, idx) => {
      if (!el) return
      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          delay: Math.min(idx * 0.05, 0.25),
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 65%',
            toggleActions: 'play none none none',
            scrub: 1
          }
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="news"
      className="relative z-10 min-h-screen py-20 px-4 sm:px-6 md:px-8 overflow-visible bg-transparent -mt-20"
    >
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <h2
          ref={titleRef}
          className="text-5xl md:text-6xl font-light mb-24 text-center text-white tracking-wider"
        >
          News
        </h2>

        <div className="divide-y divide-white/10">
          {newsItems.map((item, idx) => (
            <div
              key={`${item.date}-${idx}`}
              ref={(el) => {
                itemsRef.current[idx] = el
              }}
              className="py-6 flex flex-col sm:flex-row gap-3 sm:gap-12"
            >
              <div className="sm:w-28 shrink-0 mono text-xs" style={{ color: 'var(--accent-dim)' }}>
                {item.date}
              </div>
              <div className="flex-1 text-base text-gray-300 leading-relaxed font-light">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
