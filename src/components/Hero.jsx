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
    <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden parallax-section">
      <Hero3D />
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold mb-6 gradient-text"
        >
          Laura Gomezjurado Gonzalez
        </h1>
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 mb-8"
        >
          Mechanistic Interpretability | Evaluation Science | Fairness | Robustness
        </p>
        <p 
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Exploring how large models reason, generalize, and fail; and how we can build AI systems that are more interpretable, robust, and aligned with human needs.
          My interests span mechanistic interpretability, evaluation science, fairness, robustness, model editing, and the intersection between technical AI safety and global governance.
        </p>
        <div ref={buttonRef} className="flex gap-4 justify-center flex-wrap">
          <a 
            href="#portfolio" 
            className="px-8 py-4 bg-indigo-500 rounded-full font-semibold hover:scale-110 transition-transform duration-300 glow"
          >
            View My Work
          </a>
          <a 
            href="#contact" 
            className="px-8 py-4 glass rounded-full font-semibold hover:scale-110 transition-transform duration-300"
          >
            Get In Touch
          </a>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

