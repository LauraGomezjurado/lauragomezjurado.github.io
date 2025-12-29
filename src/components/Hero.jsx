import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import AbstractPattern from './AbstractPattern'

export default function Hero() {
  const heroRef = useRef(null)
  const brandRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.from(brandRef.current, {
      opacity: 0,
      x: -30,
      duration: 1,
      ease: 'power3.out'
    })
    .from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: 'power3.out'
    }, '-=0.5')
    .from(subtitleRef.current, {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.5')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen bg-black overflow-hidden">
      <AbstractPattern />
      
      {/* Brand/Initials - Top Left */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
        <h1 
          ref={brandRef}
          className="text-white font-light tracking-[0.3em] text-2xl md:text-3xl uppercase"
          style={{ letterSpacing: '0.3em' }}
        >
          L G G
        </h1>
      </div>

      {/* Centered Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 
            ref={titleRef}
            className="text-white font-light text-3xl md:text-5xl lg:text-6xl mb-6 tracking-wide"
            style={{ letterSpacing: '0.05em' }}
          >
            Laura Gomezjurado Gonzalez
          </h2>
          <p 
            ref={subtitleRef}
            className="text-white font-light text-lg md:text-xl lg:text-2xl tracking-wide opacity-90"
            style={{ letterSpacing: '0.08em' }}
          >
            Mech Interp | Evaluation Science | Fairness | Robustness
          </p>
        </div>
      </div>
    </section>
  )
}

