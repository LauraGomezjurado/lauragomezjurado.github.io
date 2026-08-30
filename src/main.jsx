import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import tokens from './design-tokens.json'

/**
 * Dev-only guard on the one value the web page and the offline paint pipeline
 * must agree on.
 *
 * The plates are painted against a literal paper colour. That value used to be
 * hardcoded in seven sketch files, sampled by eye from a screenshot, and it was
 * correct only until someone touched PaperBackground's grain opacities - at
 * which point all seven plates silently became a different material from the
 * page. Rather than trust a comment, measure it.
 */
if (import.meta.env.DEV) {
  requestAnimationFrame(() => {
    const declared = getComputedStyle(document.documentElement)
      .getPropertyValue('--paper')
      .trim()
      .toUpperCase()
    const expected = tokens.paper.declared.toUpperCase()
    if (declared && declared !== expected) {
      console.warn(
        `[design-tokens] --paper is ${declared} but design-tokens.json says ` +
          `${expected}. The painted plates are rendered against ` +
          `${tokens.paper.rendered} and will no longer match the page. ` +
          `Update both, then re-render via scripts/paint/README.md.`
      )
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
