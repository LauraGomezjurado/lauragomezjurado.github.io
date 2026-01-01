import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AbstractPattern from './AbstractPattern'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: 'WAFF Youth Delegation - Davos 2025',
    organization: 'We Are Family Foundation',
    description: 'Selected as a Youth Delegate attending the World Economic Forum 2025 in Davos, representing youth voices in global leadership discussions.',
    url: 'https://static1.squarespace.com/static/581e5b6a8419c273288db3e9/t/674f747246e64400ad784d54/1733260408275/WAFF+Youth+Delegation+Attending+Davos+During+WEF+2025+One-Pagers.pdf',
    type: 'PDF',
    image: '/images/featured/waff-davos-2025.png'
  },
  {
    title: 'Artificial Intelligence: A Tool for Equality',
    organization: 'Girl Up',
    description: 'Featured article discussing how AI can be leveraged as a tool for advancing gender equality and social impact.',
    url: 'https://girlup.org/voices/artificial-intelligence-a-tool-for-equality',
    type: 'Article'
  },
  {
    title: 'Mission Magazine - Issue 12: The New Order',
    organization: 'Mission Magazine - Issue 12',
    description: 'Featured in Mission Magazine Issue 12: The New Order. Mission Magazine is a platform at the intersection of fashion, art, activism, and impact. The New Order is a bold celebration of the next generation of leaders who are fearlessly tackling the world\'s most urgent challenges.',
    url: 'https://missionmagazinesubscriptions.org/home',
    type: 'Publication',
    image: '/images/featured/mission-magazine.jpg'
  },
  {
    title: 'Adolescent Leaders in Generation Equality',
    organization: 'UN Women - Generation Equality Forum',
    description: 'Recognized as an adolescent leader working to uplift youth voices as a member of the Generation Equality Multi-Stakeholder Leadership Group.',
    url: 'https://forum.generationequality.org/news/meet-kurumuthu-and-laura-adolescent-leaders-working-uplift-youth-voices-members-generation',
    type: 'Feature'
  },
  {
    title: 'Global Teen Leader 2022',
    organization: 'We Are Family Foundation',
    description: 'Selected as a Global Teen Leader, recognized for leadership in technology, gender equality, and peace-building initiatives.',
    url: 'https://www.wearefamilyfoundation.org/gtl-2022/laura-gomezjurado-gonzlez',
    type: 'Recognition'
  },
  {
    title: 'Global Teen Leaders: Youth Changemakers',
    organization: 'UN General Assembly',
    description: 'Featured speaker at the UN General Assembly discussing youth changemakers as the future of global STEM education and advocacy.',
    url: 'https://ssunga77.sched.com/event/1Aiwt/ref-20521-global-teen-leaders-youth-changemakers-as-the-future-of-global-stem-education-and-advocacy?iframe=no',
    type: 'Event'
  },
  {
    title: 'Prototypes for Humanity',
    organization: 'Prototypes for Humanity',
    description: 'Featured student at Prototypes for Humanity, recognized for work in medical AI research and tech-driven initiatives empowering youth and women in Colombia. Selected as a Masason Foundation member by Softbank Group Corp.',
    url: 'https://www.prototypesforhumanity.com/student/laura-gomezjurado/',
    type: 'Recognition'
  },
  {
    title: 'Masason Foundation Fellow',
    organization: 'Masason Foundation',
    description: 'Selected as a Masason Foundation Fellow by Masayoshi Son, SoftBank Group President. The Masason Foundation supports exceptional young talent to contribute to the future of humankind through innovation and technology.',
    url: 'https://masason-foundation.org/en/scholars/',
    type: 'Fellowship'
  }
]

export default function Featured() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    // Set initial state
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, y: 0 })
    }
    itemsRef.current.forEach((item) => {
      if (item) gsap.set(item, { opacity: 1, y: 0 })
    })

    // Animate title on scroll
    gsap.fromTo(titleRef.current,
      {
        opacity: 0.3,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          end: 'top 60%',
          toggleActions: 'play none none none',
          scrub: 1
        }
      }
    )

    // Animate items on scroll
    itemsRef.current.forEach((item, index) => {
      if (item) {
        gsap.fromTo(item,
          {
            opacity: 0.3,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power2.out',
            delay: index * 0.1,
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'top 60%',
              toggleActions: 'play none none none',
              scrub: 1
            }
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} id="featured" className="relative min-h-screen py-20 px-4 overflow-visible bg-black -mt-20">
      <AbstractPattern variant="portfolio" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-24 text-center text-white tracking-wider">
          Featured In
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.url}
              target="_blank"
              rel="noopener noreferrer"
              ref={(el) => (itemsRef.current[index] = el)}
              className="group glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20 overflow-hidden"
            >
              <div className="space-y-4">
                {feature.image && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-light mb-2 text-white group-hover:text-[#D9A96A] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#D9A96A] opacity-75 mb-3">
                      {feature.organization}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white/5 rounded text-xs font-light text-gray-400 border border-white/10 whitespace-nowrap">
                    {feature.type}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed font-light text-sm">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-[#D9A96A] text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Read more</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

