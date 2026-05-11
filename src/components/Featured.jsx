import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: 'WAFF Youth Delegation · Davos 2025',
    organization: 'We Are Family Foundation',
    description:
      'Selected as a Youth Delegate attending the World Economic Forum 2025 in Davos, representing youth voices in global leadership discussions.',
    url: 'https://static1.squarespace.com/static/581e5b6a8419c273288db3e9/t/674f747246e64400ad784d54/1733260408275/WAFF+Youth+Delegation+Attending+Davos+During+WEF+2025+One-Pagers.pdf',
    type: 'PDF',
    image: '/images/featured/waff-davos-2025.png',
    year: '2025',
  },
  {
    title: 'Mission Magazine · Issue 12: The New Order',
    organization: 'Mission Magazine',
    description:
      'Featured in Mission Magazine Issue 12: The New Order, a celebration of the next generation of leaders tackling the world\'s most urgent challenges.',
    url: 'https://missionmagazinesubscriptions.org/home',
    type: 'Publication',
    image: '/images/featured/mission-magazine.jpg',
    year: '2025',
  },
  {
    title: 'Prototypes for Humanity',
    organization: 'Prototypes for Humanity',
    description:
      'Presented our paper and AI research on respiratory disease detection at Prototypes for Humanity and attended Dubai Future Forum.',
    url: 'https://www.prototypesforhumanity.com/student/laura-gomezjurado/',
    type: 'Presentation',
    image: '/images/featured/prototypes-dubai-presenting.jpg',
    year: '2024',
  },
  {
    title: 'Masason Foundation Fellow',
    organization: 'Masason Foundation',
    description:
      'Selected as a Masason Foundation Fellow by Masayoshi Son, SoftBank Group President, supporting exceptional young talent contributing to the future of humankind.',
    url: 'https://masason-foundation.org/en/scholars/',
    type: 'Fellowship',
    image: '/images/featured/masason-fellowship-visit.jpg',
    year: '2023',
  },
  {
    title: 'Artificial Intelligence: A Tool for Equality',
    organization: 'Girl Up',
    description:
      'Featured article discussing how AI can be leveraged as a tool for advancing gender equality and social impact.',
    url: 'https://girlup.org/voices/artificial-intelligence-a-tool-for-equality',
    type: 'Article',
    image: '/images/featured/girlup-article.png',
    year: '2024',
  },
  {
    title: 'Adolescent Leaders in Generation Equality',
    organization: 'UN Women',
    description:
      'Recognized as an adolescent leader working to uplift youth voices as a member of the Generation Equality Multi-Stakeholder Leadership Group.',
    url: 'https://forum.generationequality.org/news/meet-kurumuthu-and-laura-adolescent-leaders-working-uplift-youth-voices-members-generation',
    type: 'Feature',
    image: '/images/featured/generation-equality-portrait.png',
    year: '2023',
  },
  {
    title: 'Global Teen Leader 2022',
    organization: 'We Are Family Foundation',
    description:
      'Selected as a Global Teen Leader, recognized for leadership in technology, gender equality, and peace-building initiatives.',
    url: 'https://www.wearefamilyfoundation.org/gtl-2022/laura-gomezjurado-gonzlez',
    type: 'Recognition',
    image: '/images/featured/global-teen-leader-2022.png',
    year: '2022',
  },
  {
    title: 'Global Teen Leaders · UN General Assembly',
    organization: 'United Nations',
    description:
      'Featured speaker at the UN General Assembly discussing youth changemakers as the future of global STEM education and advocacy.',
    url: 'https://ssunga77.sched.com/event/1Aiwt/ref-20521-global-teen-leaders-youth-changemakers-as-the-future-of-global-stem-education-and-advocacy?iframe=no',
    type: 'Event',
    image: '/images/featured/un-general-assembly-unga77.png',
    year: '2022',
  },
]

/**
 * Featured: editorial grid of press/recognition entries. Uses image-first
 * cards with a dark gradient overlay so titles stay legible regardless of the
 * underlying image brightness. Hover lifts and warms the card.
 */
export default function Featured() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    gsap.set(titleRef.current, { opacity: 1, y: 0 })
    itemsRef.current.forEach((el) => el && gsap.set(el, { opacity: 1, y: 0 }))

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 },
      }
    )

    itemsRef.current.forEach((el, idx) => {
      if (!el) return
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: Math.min(idx * 0.05, 0.3),
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 70%', scrub: 1 },
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      id="featured"
      className="relative z-10 min-h-screen py-24 md:py-32 px-4 sm:px-6 md:px-8 overflow-visible bg-transparent -mt-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <header className="mb-20 md:mb-24 text-center">
          <div className="section-index mb-4">§ 04 · Press &amp; Recognition</div>
          <h2
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-wider text-on-bg"
          >
            Featured In
          </h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              innerRef={(el) => (itemsRef.current[index] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, innerRef }) {
  const thumbs =
    feature.images?.length > 0 ? feature.images : feature.image ? [feature.image] : []

  return (
    <a
      href={feature.url}
      target="_blank"
      rel="noopener noreferrer"
      ref={innerRef}
      className="group relative block overflow-hidden transition-transform duration-500 hover:-translate-y-1"
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: '2px',
        background: 'rgba(8,10,14,0.55)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
        {thumbs.length === 1 ? (
          <img
            src={thumbs[0]}
            alt={feature.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-[1.2s] ease-out"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : thumbs.length > 1 ? (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-2 gap-px bg-black transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]">
              {thumbs.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${feature.title} (${i + 1})`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[1.2s] ease-out"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 30%, rgba(143,175,214,0.12) 0%, rgba(0,0,0,0.4) 70%)',
            }}
          />
        )}
        {/* Bottom darkening for caption legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.88) 100%)',
          }}
        />
        {/* Type + year chips: top corners */}
        <span
          className="absolute top-3 left-3 mono text-[10px] tracking-widest uppercase px-1.5 py-0.5"
          style={{
            color: 'var(--accent)',
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid var(--border)',
          }}
        >
          {feature.type}
        </span>
        {feature.year && (
          <span
            className="absolute top-3 right-3 mono text-[10px] tracking-widest uppercase px-1.5 py-0.5"
            style={{
              color: 'var(--accent-dim)',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid var(--border)',
            }}
          >
            {feature.year}
          </span>
        )}
        {/* Title + org over bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <p className="mono text-[10.5px] tracking-widest uppercase text-white/70 mb-1.5">
            {feature.organization}
          </p>
          <h3 className="text-lg md:text-xl font-light text-white leading-snug">
            {feature.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6">
        <p className="text-[13.5px] md:text-sm text-white/65 leading-relaxed font-light">
          {feature.description}
        </p>
        <div
          className="flex items-center gap-2 mt-4 text-[12px] font-light tracking-wide opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--accent)' }}
        >
          <span>Read more</span>
          <svg
            className="w-3.5 h-3.5 transform translate-x-0 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  )
}
