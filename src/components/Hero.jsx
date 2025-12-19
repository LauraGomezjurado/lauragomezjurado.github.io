import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Hero3D from './Hero3D'

export default function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    })
    .from(subtitleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')
    .from(buttonRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.3')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-visible">
      <Hero3D />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 
          ref={titleRef}
          className="text-4xl md:text-6xl lg:text-7xl font-light mb-8 text-white tracking-wider"
        >
          Laura Gomezjurado Gonzalez
        </h1>
        <p 
          ref={subtitleRef}
          className="text-lg md:text-xl text-gray-300 mb-12 font-light tracking-wide"
        >
          Mech Interp | Evaluation Science | Fairness | Robustness
        </p>
        <p 
          className="text-sm md:text-base text-gray-400 mb-16 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Exploring how large models reason, generalize, and fail; and how we can build AI systems that are more interpretable, robust, and aligned with human needs.
        </p>
        <div ref={buttonRef} className="flex gap-4 justify-center flex-wrap">
          <a 
            href="#portfolio" 
            className="px-8 py-3 bg-[#B8860B] hover:bg-[#8B6914] rounded font-light text-base transition-all duration-200 text-black"
          >
            View My Work
          </a>
          <a 
            href="#contact" 
            className="px-8 py-3 border border-[#B8860B]/40 hover:border-[#B8860B] rounded font-light text-base transition-all duration-200 text-white hover:text-[#B8860B]"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  )
}

