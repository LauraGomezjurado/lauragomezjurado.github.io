import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import AbstractPattern from './AbstractPattern'

export default function Hero() {
  const heroRef = useRef(null)
  const brandRef = useRef(null)
  const headlineRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.from(brandRef.current, {
      opacity: 0,
      x: -30,
      duration: 1,
      ease: 'power3.out'
    })
    .from(headlineRef.current, {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: 'power3.out'
    }, '-=0.5')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen bg-black overflow-hidden">
      <AbstractPattern />
      
      {/* LILA Brand - Top Left */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
        <h1 
          ref={brandRef}
          className="text-white font-light tracking-[0.3em] text-2xl md:text-3xl uppercase"
          style={{ letterSpacing: '0.3em' }}
        >
          L I L A
        </h1>
      </div>

      {/* Centered Headline */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <h2 
          ref={headlineRef}
          className="text-white font-light text-center text-3xl md:text-5xl lg:text-6xl tracking-wide"
          style={{ letterSpacing: '0.05em' }}
        >
          Building Scientific Superintelligence
        </h2>
      </div>
    </section>
  )
}

