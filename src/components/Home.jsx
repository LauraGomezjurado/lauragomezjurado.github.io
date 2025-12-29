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

    // Subtle fade transitions between sections (no background color change)
    const sections = document.querySelectorAll('section[id]')
    
    sections.forEach((section, index) => {
      // Very subtle fade in as sections enter viewport
      gsap.fromTo(
        section,
        {
          opacity: 0.3,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            end: 'top 60%',
            toggleActions: 'play none none none',
            scrub: 1,
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

