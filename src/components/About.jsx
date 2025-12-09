import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import About3D from './About3D'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    // Set initial state
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, y: 0 })
    }
    if (contentRef.current) {
      gsap.set(contentRef.current, { opacity: 1, x: 0 })
    }
    if (imageRef.current) {
      gsap.set(imageRef.current, { opacity: 1, x: 0 })
    }

    // Animate on scroll
    gsap.fromTo(titleRef.current, 
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )

    gsap.fromTo(contentRef.current,
      {
        opacity: 0,
        x: -50
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )

    gsap.fromTo(imageRef.current,
      {
        opacity: 0,
        x: 50
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative min-h-screen py-20 px-4 overflow-hidden parallax-section">
      <About3D />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-24 text-center text-white">
          About Me
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={contentRef} className="space-y-6">
            <p className="text-xl text-gray-400 leading-relaxed">
              I'm deeply passionate about how AI systems reason, where they fail, 
              and how we can make them safer for everyone—not just on paper, 
              but in the places where technology meets real life.
            
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              My work spans interpretability, fairness, robustness, and model editing, motivated by a simple idea: 
              if we can understand the mechanisms behind a model's behavior, we can build systems that are more reliable and more equitable by design. 
              {/* At Stanford, I split my time between CRFM and the Scaling Intelligence Lab, working on everything from adversarial prompt injection defenses 
              to precision routing across LLM ensembles. */}
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              I come from a background of deploying AI in low-infrastructure, post-conflict regions, and I continue to serve in global governance spaces like UN Women and Davos. 
              Those experiences taught me that "AI safety" isn't just a technical problem—it's about access, trust, context, and the people who stand to benefit or be harmed.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              I'm driven by research that is both intellectually rigorous and socially grounded, and by a belief that technical excellence and human impact should reinforce each other, not compete. 
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              {['AI Safety', 'Interpretability', 'Fairness', 'Robustness', 'Model Editing', 'Ensembles', 'Precision Routing'].map((tech, idx) => (
                <span 
                  key={tech}
                  className="px-4 py-2 glass rounded-lg text-sm transform transition-all duration-200 hover:scale-105 hover:bg-[#B8860B]/10 hover:border-[#B8860B]/30 cursor-default"
                  style={{
                    animationDelay: `${idx * 0.1}s`
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div ref={imageRef} className="relative group">
            <div className="glass rounded-2xl p-2 aspect-square flex items-center justify-center transform transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="w-full h-full rounded-xl relative overflow-hidden bg-gradient-to-br from-[#B8860B]/20 via-[#8B6914]/10 to-[#B8860B]/20">
                <img 
                  src="/profile.jpg" 
                  alt="Laura Gomezjurado Gonzalez at World Economic Forum Davos 2025"
                  className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#B8860B] rounded-full blur-3xl opacity-20 -z-10 group-hover:opacity-30 transition-all duration-300"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#B8860B] rounded-full blur-2xl opacity-15 -z-10 group-hover:opacity-25 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

