import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Thumbnail that fades in once decoded (instead of snapping from black) and
 * lazy-loads. Rests at 80% opacity, lifting to full on card hover.
 */
function Thumb({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${className} transition-[opacity,transform] duration-[1200ms] ease-out ${loaded ? 'opacity-95 group-hover:opacity-100' : 'opacity-0'}`}
      onError={(e) => {
        e.target.style.display = 'none'
      }}
    />
  )
}

const features = [
  {
    title: 'WAFF Youth Delegation · Davos 2025',
    organization: 'We Are Family Foundation',
    description:
      'Selected as a Youth Delegate attending the World Economic Forum 2025 in Davos, representing youth voices in global leadership discussions.',
    url: 'https://static1.squarespace.com/static/581e5b6a8419c273288db3e9/t/674f747246e64400ad784d54/1733260408275/WAFF+Youth+Delegation+Attending+Davos+During+WEF+2025+One-Pagers.pdf',
    type: 'PDF',
    image: '/images/featured/waff-davos-2025.webp',
    year: '2025',
  },
  {
    title: 'Mission Magazine · Issue 12: The New Order',
    organization: 'Mission Magazine',
    description:
      'Featured in Mission Magazine Issue 12: The New Order, a celebration of the next generation of leaders tackling the world\'s most urgent challenges.',
    url: 'https://missionmagazinesubscriptions.org/home',
    type: 'Publication',
    image: '/images/featured/mission-magazine.webp',
    year: '2025',
  },
  {
    title: 'Prototypes for Humanity',
    organization: 'Prototypes for Humanity',
    description:
      'Presented our paper and AI research on respiratory disease detection at Prototypes for Humanity and attended Dubai Future Forum.',
    url: 'https://www.prototypesforhumanity.com/student/laura-gomezjurado/',
    type: 'Presentation',
    image: '/images/featured/prototypes-dubai-presenting.webp',
    year: '2024',
  },
  {
    title: 'Masason Foundation Fellow',
    organization: 'Masason Foundation',
    description:
      'Selected as a Masason Foundation Fellow by Masayoshi Son, SoftBank Group President, supporting exceptional young talent contributing to the future of humankind.',
    url: 'https://masason-foundation.org/en/scholars/',
    type: 'Fellowship',
    image: '/images/featured/masason-fellowship-visit.webp',
    year: '2023',
  },
  {
    title: 'Artificial Intelligence: A Tool for Equality',
    organization: 'Girl Up',
    description:
      'Featured article discussing how AI can be leveraged as a tool for advancing gender equality and social impact.',
    url: 'https://girlup.org/voices/artificial-intelligence-a-tool-for-equality',
    type: 'Article',
    image: '/images/featured/girlup-article.webp',
    year: '2024',
  },
  {
    title: 'Adolescent Leaders in Generation Equality',
    organization: 'UN Women',
    description:
      'Recognized as an adolescent leader working to uplift youth voices as a member of the Generation Equality Multi-Stakeholder Leadership Group.',
    url: 'https://forum.generationequality.org/news/meet-kurumuthu-and-laura-adolescent-leaders-working-uplift-youth-voices-members-generation',
    type: 'Feature',
    image: '/images/featured/generation-equality-portrait.webp',
    year: '2023',
  },
  {
    title: 'Global Teen Leader 2022',
    organization: 'We Are Family Foundation',
    description:
      'Selected as a Global Teen Leader, recognized for leadership in technology, gender equality, and peace-building initiatives.',
    url: 'https://www.wearefamilyfoundation.org/gtl-2022/laura-gomezjurado-gonzlez',
    type: 'Recognition',
    image: '/images/featured/global-teen-leader-2022.webp',
    year: '2022',
  },
  {
    title: 'Global Teen Leaders · UN General Assembly',
    organization: 'United Nations',
    description:
      'Featured speaker at the UN General Assembly discussing youth changemakers as the future of global STEM education and advocacy.',
    url: 'https://ssunga77.sched.com/event/1Aiwt/ref-20521-global-teen-leaders-youth-changemakers-as-the-future-of-global-stem-education-and-advocacy?iframe=no',
    type: 'Event',
    image: '/images/featured/un-general-assembly-unga77.webp',
    year: '2022',
  },
]

/**
 * Featured: editorial grid of press/recognition entries. Each entry is a
 * hairline-framed photo with its text set below on bare paper (no dark frosted
 * card, no overlays), so the grid belongs to the warm sand world and coexists
 * with the receded attractor. Hover lifts the card and nudges the arrow.
 */
export default function Featured() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    // Scoped with gsap.context so teardown reverts only THIS section's tweens
    // and triggers. The previous cleanup called ScrollTrigger.getAll().kill(),
    // which tore down every other panel's triggers too - and because StrictMode
    // mounts, unmounts and remounts, whichever panel happened to unmount last
    // could leave the others' scrubbed elements stranded at opacity 0.
    const ctx = gsap.context(() => {
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
    })

    return () => ctx.revert()
  }, [])

  // Fewer, larger, irregular. A uniform 3-column grid of equal cards is a
  // component library, not a page - and it was the most software-looking block
  // on the site: every tile the same size, each one a 2px-radius rectangle with
  // a 1px border and its own #efe7da fill, none of which was the page's paper.
  //
  // Spans over a 12-column grid: two wide, then one full-bleed, then three
  // small. The rhythm is the design; the cards themselves are now just photos
  // laid on the sheet.
  const SPANS = ['md:col-span-7', 'md:col-span-5', 'md:col-span-12', 'md:col-span-4', 'md:col-span-4', 'md:col-span-4']
  const shown = features.slice(0, SPANS.length)

  return (
    <section
      ref={sectionRef}
      id="featured"
      data-accent="sienna"
      className="relative z-10 px-5 py-24 sm:px-8 md:px-12 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-12 md:mb-16">
          <div className="section-index mb-3">§ 04 · Press &amp; Recognition</div>
          <h2 ref={titleRef} className="t-section">
            Featured in
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-12 md:gap-y-16">
          {shown.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              span={SPANS[index]}
              wide={SPANS[index] === 'md:col-span-12'}
              innerRef={(el) => (itemsRef.current[index] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, innerRef, span, wide }) {
  const thumbs =
    feature.images?.length > 0 ? feature.images : feature.image ? [feature.image] : []

  return (
    <a
      href={feature.url}
      target="_blank"
      rel="noopener noreferrer"
      ref={innerRef}
      className={`group relative block ${span}`}
    >
      {/* No card. The photo sits directly on the sheet - the faint shadow from
          `figure img` in index.css is the only thing holding it there. */}
      <figure
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: wide ? '21 / 9' : '4 / 3' }}
      >
        {thumbs.length === 1 ? (
          <Thumb
            src={thumbs[0]}
            alt={feature.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
          />
        ) : thumbs.length > 1 ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-px transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]" style={{ background: 'var(--hairline)' }}>
            {thumbs.map((src, i) => (
              <Thumb key={src} src={src} alt={`${feature.title} (${i + 1})`} className="h-full w-full object-cover" />
            ))}
          </div>
        ) : (
          <div aria-hidden="true" className="absolute inset-0" style={{ background: 'var(--paper-recess)' }} />
        )}
      </figure>

      <div className="pt-4">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="mono" style={{ color: 'var(--accent)' }}>
            {feature.organization}
          </span>
          {feature.year && (
            <span className="handwritten shrink-0 leading-none" style={{ color: 'var(--ink-quiet)' }}>
              {feature.year}
            </span>
          )}
        </div>
        <h3
          className="mb-2 font-normal leading-snug"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: 'var(--display-mid)',
            fontSize: wide ? 'clamp(1.4rem, 2.4vw, 1.9rem)' : '1.15rem',
            color: 'var(--ink-strong)',
          }}
        >
          {feature.title}
        </h3>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ink-quiet)', maxWidth: wide ? '52ch' : 'none' }}>
          {feature.description}
        </p>
      </div>
    </a>
  )
}
