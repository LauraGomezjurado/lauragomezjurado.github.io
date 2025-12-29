import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AbstractPattern from './AbstractPattern'

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

    // Subtle animate on scroll
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

    gsap.fromTo(contentRef.current,
      {
        opacity: 0.3,
        x: -30
      },
      {
        opacity: 1,
        x: 0,
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

    gsap.fromTo(imageRef.current,
      {
        opacity: 0.3,
        x: 30
      },
      {
        opacity: 1,
        x: 0,
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
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative min-h-screen py-20 px-4 overflow-visible bg-black -mt-40">
      <AbstractPattern variant="about" />
      
      {/* Gradient fade-in at top to blend with hero section */}
      <div 
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
          zIndex: 15
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-24 text-center tracking-wider" style={{ color: '#D4A574' }}>
          About Me
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={contentRef} className="space-y-6">
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              I'm deeply passionate about how AI systems reason, where they fail, 
              and how we can make them safer for everyone: not just on paper, 
              but in the places where technology meets real life.
            
            </p>
            <p className="text-lg text-gray-400 leading-relaxed font-light">
              My work spans interpretability, fairness, robustness, and model editing, motivated by a simple idea: 
              if we can understand the mechanisms behind a model's behavior, we can build systems that are more reliable and more equitable by design. 
              {/* At Stanford, I split my time between CRFM and the Scaling Intelligence Lab, working on everything from adversarial prompt injection defenses 
              to precision routing across LLM ensembles. */}
            </p>
            <p className="text-lg text-gray-300 leading-relaxed font-light">
              I come from a background of deploying AI in low-infrastructure, post-conflict regions, and I continue to serve in global governance spaces like UN Women and Davos. 
              Those experiences taught me that "AI safety" isn't just a technical problem. It's about access, trust, context, and the people who stand to benefit or be harmed.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed font-light">
              I'm driven by research that is both intellectually rigorous and socially grounded, and by a belief that technical excellence and human impact should reinforce each other, not compete. 
            </p>
            
            {/* Organization logos - real logos with brand colors */}
            <div className="flex items-center justify-start mt-12 pt-8 border-t border-white/10 gap-8">
              <a 
                href="https://www.stanford.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all duration-200 hover:scale-105 flex items-center shrink-0"
                aria-label="Stanford University"
              >
                <img 
                  src="/stanford-logo.png" 
                  alt="Stanford University"
                  className="h-8 w-auto max-w-[80px]"
                />
              </a>
              <a 
                href="https://www.microsoft.com/en-us/research" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all duration-200 hover:scale-105 flex items-center shrink-0"
                aria-label="Microsoft Research"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Microsoft logo - four squares with official colors, scaled to match height */}
                  <rect x="0" y="0" width="10" height="10" fill="#F25022" rx="1"/>
                  <rect x="12" y="0" width="10" height="10" fill="#7FBA00" rx="1"/>
                  <rect x="0" y="12" width="10" height="10" fill="#00A4EF" rx="1"/>
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900" rx="1"/>
                </svg>
              </a>
              <a 
                href="https://www.ersilia.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all duration-200 hover:scale-105 flex items-center shrink-0"
                aria-label="Ersilia Open Source Initiative"
              >
                <img 
                  src="/ersilia-logo.png" 
                  alt="Ersilia Open Source Initiative"
                  className="h-8 w-auto max-w-[80px]"
                />
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

