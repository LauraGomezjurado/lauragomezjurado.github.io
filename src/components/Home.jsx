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
    // Reset to dark background when Home component mounts (for Hero section)
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

    // Smooth background color transition from dark to light (About section)
    const aboutSection = document.querySelector('#about')
    if (aboutSection) {
      gsap.to('body', {
        background: '#FAFBFC',
        color: '#1F2937',
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 1,
        }
      })
    }

    // Smooth background color transition back to dark (Contact section)
    const contactSection = document.querySelector('#contact')
    if (contactSection) {
      gsap.to('body', {
        background: '#000000',
        color: '#FFFFFF',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 1,
        }
      })
    }

    // Create smooth fade transitions between sections
    const sections = document.querySelectorAll('section[id]')
    
    sections.forEach((section) => {
      // Smooth fade in/out as sections enter/leave viewport
      gsap.fromTo(
        section,
        {
          opacity: 0.9,
        },
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
            scrub: 0.8,
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
      <div className="section-divider"></div>
      <About />
      <div className="section-divider"></div>
      <Portfolio />
      <div className="section-divider"></div>
      <Contact />
    </>
  )
}

