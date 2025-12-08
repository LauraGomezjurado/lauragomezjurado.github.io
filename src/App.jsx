import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </main>
        <footer className="py-8 px-4 text-center text-gray-400">
          <p>&copy; 2024 Laura Gomezjurado Gonzalez. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
