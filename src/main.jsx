import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Softening pass: must come AFTER index.css so it wins on cascade order.
import './styles/soft.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
