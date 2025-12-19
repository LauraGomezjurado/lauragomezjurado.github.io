import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

export default function PageTransition({ children }) {
  const location = useLocation()
  const containerRef = useRef(null)
  const prevLocationRef = useRef(location.pathname)

  useEffect(() => {
    if (!containerRef.current) return

    // Only animate if location actually changed
    if (prevLocationRef.current !== location.pathname) {
      const container = containerRef.current
      
      // Fade out
      gsap.to(container, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          // Reset position
          gsap.set(container, { y: 20 })
          // Fade in
          gsap.to(container, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          })
        }
      })
    }

    prevLocationRef.current = location.pathname
  }, [location.pathname])

  return (
    <div ref={containerRef} style={{ opacity: 1 }}>
      {children}
    </div>
  )
}
