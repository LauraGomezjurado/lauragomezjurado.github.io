import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef(null)
  const brandRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const emailRef = useRef(null)

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
      y: 24,
      duration: 1.2,
      ease: 'power3.out'
    }, '-=0.5')
    .from(subtitleRef.current, {
      opacity: 0,
      y: 18,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.5')
    .from(emailRef.current, {
      opacity: 0,
      y: 14,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
  }, [])

  return (
    <section ref={heroRef} id="home" className="relative z-10 min-h-[180vh] bg-transparent">
      {/* Brand/Initials - Top Left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-12 md:left-12 z-20">
        <h1 
          ref={brandRef}
          className="text-white font-light tracking-[0.3em] text-2xl md:text-3xl uppercase"
          style={{ letterSpacing: '0.3em' }}
        >
          L G G
        </h1>
      </div>

      {/* Professional intro block - left-aligned, no photo */}
      <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-2xl w-full">
          {/* Subtle backdrop for text area */}
          <div 
            className="absolute inset-0 max-w-2xl opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(0,0,0,0.5) 0%, transparent 70%)',
              filter: 'blur(24px)'
            }}
          />
          <div className="relative z-10">
            <h2 
              ref={titleRef}
              className="text-white font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-5 tracking-tight drop-shadow-lg"
              style={{ letterSpacing: '0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              Laura Gomezjurado Gonzalez
            </h2>
            <p 
              ref={subtitleRef}
              className="text-white font-light text-base md:text-lg lg:text-xl tracking-wide opacity-95 drop-shadow-md mb-3 md:mb-4"
              style={{ letterSpacing: '0.03em', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
            >
              Stanford Computer Science

            </p>
            <p 
              ref={subtitleRef}
              className="text-white font-light text-base md:text-lg lg:text-xl tracking-wide opacity-95 drop-shadow-md mb-3 md:mb-4"
              style={{ letterSpacing: '0.03em', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
            
            >
              Student Researcher
              
            </p>
            <p ref={emailRef} className="text-white/90 font-light text-sm md:text-base tracking-wide drop-shadow-md">
              <a 
                href="mailto:lpgomez@stanford.edu" 
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                lpgomez [AT] stanford.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

