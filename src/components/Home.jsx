import Hero from './Hero'
import About from './About'
import News from './News'
import Portfolio from './Portfolio'
import Featured from './Featured'
import Contact from './Contact'

/**
 * Home: the score.
 *
 *   Hero      full-bleed painting, the name set large over it      indigo
 *   About     narrow column, no art - a deliberate rest            sepia
 *   Research  a painting that holds while the text scrolls past    per project
 *   News      dense small-type list, no art - the contrast         payne
 *   Featured  fewer, larger press plates, irregular                sienna
 *   Contact   one oversized address                                madder
 *
 * There is no divider between them. Varied shape is what separates the panels;
 * a repeated rule is what made five panels read as five rows of a table.
 *
 * The two captioned full-width bands that used to sit here are gone. A drawing
 * with "PLATE I" and a caption under it stops being a drawing and becomes a
 * specimen with a museum card, and neither band carried any weight - the page
 * read exactly the same without them. Both paintings moved into Research, where
 * the scroll depends on them.
 *
 * data-accent lives on each panel's own <section>, not on a wrapper here - they
 * already own their id, and two nested sections would duplicate it. Research is
 * the exception: it sets its accent from whichever painting is currently held,
 * so colour moves WITHIN that section rather than only between sections.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Portfolio />
      <News />
      <Featured />
      <Contact />
    </>
  )
}
