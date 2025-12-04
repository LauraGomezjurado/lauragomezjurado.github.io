import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Skills from './components/Skills'
import Contact from './components/Contact'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
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

    // Create smooth fade transitions between sections
    const sections = document.querySelectorAll('section[id]')
    
    sections.forEach((section) => {
      // Smooth fade in/out as sections enter/leave viewport
      gsap.fromTo(
        section,
        {
          opacity: 0.3,
        },
        {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
            scrub: 0.5,
          }
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className="App">
      <Navigation />
      <main>
        <Hero />
        <div className="section-divider"></div>
        <About />
        <div className="section-divider"></div>
        <Portfolio />
        <div className="section-divider"></div>
        <Skills />
        <div className="section-divider"></div>
        <Contact />
      </main>
      <footer className="py-8 px-4 text-center text-gray-400">
        <p>&copy; 2024 Laura Gomezjurado Gonzalez. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
