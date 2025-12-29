import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './Hero'
import About from './About'
import Portfolio from './Portfolio'
import Contact from './Contact'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useEffect(() => {
    // Keep everything dark - no background color transitions
    gsap.set('body', {
      background: '#000000',
      color: '#FFFFFF'
    })

    // Smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })

    // Very subtle fade transitions - sections blend smoothly
    const sections = document.querySelectorAll('section[id]')
    
    sections.forEach((section, index) => {
      // Extremely subtle fade - almost imperceptible for seamless blending
      gsap.fromTo(
        section,
        {
          opacity: 0.85,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 2,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 95%',
            end: 'top 50%',
            toggleActions: 'play none none none',
            scrub: 2, // Slower scrub for smoother transition
          }
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      <Hero />
      <About />
      <Portfolio />
      <Contact />
    </>
  )
}

