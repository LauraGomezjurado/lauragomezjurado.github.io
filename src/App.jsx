import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import './App.css'

function RedirectHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle GitHub Pages 404.html redirect
    // The 404.html redirects /blog/slug to /?/blog/slug
    const search = location.search
    if (search.startsWith('?/')) {
      const redirectPath = search.slice(1).replace(/~and~/g, '&')
      navigate(redirectPath, { replace: true })
      return
    }
  }, [location, navigate])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()

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
  return (
    <Router>
      <div className="App">
        <RedirectHandler />
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
