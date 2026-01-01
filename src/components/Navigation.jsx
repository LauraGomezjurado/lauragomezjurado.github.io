import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Check if we're on a blog page (light background)
  const isBlogPage = location.pathname.startsWith('/blog')

  const navItems = [
    { name: 'Home', href: '/', isHash: false },
    { name: 'About', href: '#about', isHash: true },
    { name: 'Portfolio', href: '#portfolio', isHash: true },
    { name: 'Featured', href: '#featured', isHash: true },
    { name: 'Blog', href: '/blog', isHash: false },
    { name: 'Contact', href: '#contact', isHash: true },
  ]

  const handleNavClick = (href, isHash, e) => {
    if (isHash) {
      e.preventDefault()
      if (location.pathname !== '/') {
        // Navigate to home first, then scroll to section
        navigate('/')
        // Use a more reliable method: wait for route change
        const scrollToSection = () => {
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          } else {
            // If element not found yet, try again after a short delay
            setTimeout(scrollToSection, 50)
          }
        }
        // Start checking after navigation
        setTimeout(scrollToSection, 150)
      } else {
        // Already on home, just scroll
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
    setIsMenuOpen(false)
  }

  const textColorClass = isBlogPage ? 'text-gray-800' : 'text-white'
  const hoverClass = isBlogPage ? 'hover:text-indigo-600' : 'hover:opacity-70'

  return (
    <nav className="fixed top-8 right-8 md:top-12 md:right-12 z-50">
      {/* Desktop - Vertical Menu */}
      <div className="hidden md:flex flex-col gap-6">
          {navItems.map((item) => (
            item.isHash ? (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, item.isHash, e)}
              className={`${textColorClass} font-light text-sm uppercase tracking-widest ${hoverClass} transition-opacity duration-200`}
              style={{ letterSpacing: '0.15em' }}
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
              className={`${textColorClass} font-light text-sm uppercase tracking-widest ${hoverClass} transition-opacity duration-200`}
              style={{ letterSpacing: '0.15em' }}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>

      {/* Mobile Menu Button */}
        <button
        className={`md:hidden ${textColorClass}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden absolute top-10 right-0 ${isBlogPage ? 'bg-white/95 backdrop-blur-sm border border-gray-200' : 'bg-black/90 backdrop-blur-sm border border-white/10'} p-6 flex flex-col gap-4 min-w-[200px]`}>
          {navItems.map((item) => (
            item.isHash ? (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, item.isHash, e)}
                className={`${textColorClass} font-light text-sm uppercase tracking-widest ${hoverClass} transition-opacity duration-200`}
                style={{ letterSpacing: '0.15em' }}
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`${textColorClass} font-light text-sm uppercase tracking-widest ${hoverClass} transition-opacity duration-200`}
                style={{ letterSpacing: '0.15em' }}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>
      )}
    </nav>
  )
}

