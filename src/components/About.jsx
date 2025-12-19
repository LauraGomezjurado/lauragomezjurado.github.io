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
    <section ref={sectionRef} id="about" className="relative min-h-screen py-20 px-4 overflow-visible">
      <About3D />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-24 text-center text-gray-900 tracking-wider">
          About Me
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={contentRef} className="space-y-6">
            <p className="text-xl text-gray-400 leading-relaxed">
              I'm deeply passionate about how AI systems reason, where they fail, 
              and how we can make them safer for everyone: not just on paper, 
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
            
            {/* Organization logos - subtle and clean */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-300/20">
              <a 
                href="https://www.stanford.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-40 hover:opacity-60 transition-opacity duration-200"
                aria-label="Stanford University"
              >
                <div className="text-gray-600 font-light text-sm tracking-wider">STANFORD</div>
              </a>
              <a 
                href="https://www.microsoft.com/en-us/research" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-40 hover:opacity-60 transition-opacity duration-200"
                aria-label="Microsoft Research"
              >
                <div className="text-gray-600 font-light text-sm tracking-wider">MICROSOFT RESEARCH</div>
              </a>
              <a 
                href="https://erisia.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-40 hover:opacity-60 transition-opacity duration-200"
                aria-label="Erisia Open Source Initiative"
              >
                <div className="text-gray-600 font-light text-sm tracking-wider">ERISIA</div>
              </a>
            </div>
          </div>
          <div ref={imageRef} className="relative flex justify-center items-center">
            <div className="w-64 md:w-80 aspect-square overflow-hidden rounded-lg">
              <img 
                src="/profile.jpg" 
                alt="Laura Gomezjurado Gonzalez at World Economic Forum Davos 2025"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

