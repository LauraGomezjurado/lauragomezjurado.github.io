import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: 'About', href: '#about', isHash: true },
    { name: 'Team', href: '#team', isHash: true },
    { name: 'Careers', href: '#careers', isHash: true },
    { name: 'News', href: '/blog', isHash: false },
    { name: 'Contact', href: '#contact', isHash: true },
  ]

  const handleNavClick = (href, isHash, e) => {
    if (isHash && location.pathname !== '/') {
      e.preventDefault()
      window.location.href = `/${href}`
    }
    setIsMenuOpen(false)
  }

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
              className="text-white font-light text-sm uppercase tracking-widest hover:opacity-70 transition-opacity duration-200"
              style={{ letterSpacing: '0.15em' }}
            >
              {item.name}
            </a>
          ) : (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-white font-light text-sm uppercase tracking-widest hover:opacity-70 transition-opacity duration-200"
              style={{ letterSpacing: '0.15em' }}
            >
              {item.name}
            </Link>
          )
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white"
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
        <div className="md:hidden absolute top-10 right-0 bg-black/90 backdrop-blur-sm border border-white/10 p-6 flex flex-col gap-4 min-w-[200px]">
          {navItems.map((item) => (
            item.isHash ? (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, item.isHash, e)}
                className="text-white font-light text-sm uppercase tracking-widest hover:opacity-70 transition-opacity duration-200"
                style={{ letterSpacing: '0.15em' }}
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-white font-light text-sm uppercase tracking-widest hover:opacity-70 transition-opacity duration-200"
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

