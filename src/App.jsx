import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, lazy, Suspense } from 'react'
import Navigation from './components/Navigation'
import Home from './components/Home'
import { PaperGround, PaperGrain } from './components/PaperBackground'
import './App.css'

// Blog/Portfolio routes pull in heavy deps (KaTeX, react-markdown, the long
// BlogPost). Lazy-load them so visiting "/" never downloads that code.
const Blog = lazy(() => import('./components/Blog'))
const BlogPost = lazy(() => import('./components/BlogPost'))
const PortfolioPage = lazy(() => import('./components/PortfolioPage'))

/** React Router keeps document scroll position across routes; reset so `/` always starts at the hero. */
function ScrollToTop() {
  const { pathname } = useLocation()
  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  const navigate = useNavigate()

  // Handle redirect immediately when component mounts or location changes
  useEffect(() => {
    const search = location.search
    if (location.pathname === '/' && search.startsWith('?/')) {
      const redirectPath = search.slice(1).replace(/~and~/g, '&')
      navigate(redirectPath, { replace: true })
    }
  }, [location, navigate])

  // Don't render anything if we're redirecting
  if (location.pathname === '/' && location.search.startsWith('?/')) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
     <Suspense fallback={null}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/blog" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Blog />
          </motion.div>
        } />
        <Route path="/blog/:slug" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <BlogPost />
          </motion.div>
        } />
        <Route path="/portfolio" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <PortfolioPage />
          </motion.div>
        } />
      </Routes>
     </Suspense>
    </AnimatePresence>
  )
}

function App() {
  // Handle GitHub Pages 404.html redirect BEFORE Router initializes
  useEffect(() => {
    const search = window.location.search
    const pathname = window.location.pathname
    if (pathname === '/' && search.startsWith('?/')) {
      const redirectPath = search.slice(1).replace(/~and~/g, '&')
      // Update URL before React Router takes over
      window.history.replaceState(null, '', redirectPath)
    }
  }, [])

  return (
    <Router>
      <ScrollToTop />
      {/* The sheet wraps every route, not just Home: the blog is printed on the
          same paper. Ground goes under everything, tooth goes over everything
          (including the painted plates) so page and painting are one material. */}
      <PaperGround />
      <div className="App">
        <Navigation />
        <main>
          <AnimatedRoutes />
        </main>
      </div>
      <PaperGrain />
    </Router>
  )
}

export default App
