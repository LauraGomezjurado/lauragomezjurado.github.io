import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/', isHash: false },
    { name: 'About', href: '#about', isHash: true },
    { name: 'Portfolio', href: '#portfolio', isHash: true },
    { name: 'Blog', href: '/blog', isHash: false },
    { name: 'Contact', href: '#contact', isHash: true },
  ]

  const handleNavClick = (href, isHash, e) => {
    if (isHash && location.pathname !== '/') {
      e.preventDefault()
      // Navigate to home first, then scroll
      window.location.href = `/${href}`
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass py-4' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-light gradient-text tracking-widest">
          LG
        </Link>
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            item.isHash ? (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, item.isHash, e)}
                className="text-gray-400 hover:text-[#B8860B] transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B8860B] group-hover:w-full transition-all duration-300"></span>
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-400 hover:text-[#B8860B] transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B8860B] group-hover:w-full transition-all duration-300"></span>
              </Link>
            )
          ))}
        </div>
        <button
          className="md:hidden text-gray-300"
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
      </div>
      {isMenuOpen && (
        <div className="md:hidden glass mt-4 mx-4 rounded-lg p-4 space-y-4">
          {navItems.map((item) => (
            item.isHash ? (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, item.isHash, e)}
                className="block text-gray-400 hover:text-[#B8860B] transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-[#B8860B] transition-colors"
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

