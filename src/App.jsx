import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import './App.css'

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
      </Routes>
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
      <div className="App">
        <Navigation />
        <main>
          <AnimatedRoutes />
        </main>
        <footer className="py-8 px-4 text-center text-gray-400">
          <p>&copy; 2024 Laura Gomezjurado Gonzalez. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
