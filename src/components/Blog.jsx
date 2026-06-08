import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { blogPosts } from '../data/posts'

gsap.registerPlugin(ScrollTrigger)

export default function Blog() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    // Transition to light background
    gsap.to('body', {
      background: '#faf9f6',
      color: '#1a1a1a',
      duration: 0.8,
      ease: 'power2.out'
    })

    gsap.fromTo(titleRef.current,
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )

    // Cleanup: kill ScrollTriggers
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} id="blog" className="relative min-h-screen py-16 px-4 sm:px-6 md:px-8 overflow-hidden" style={{ background: '#fdfcf9', color: '#1a1a1a', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="relative z-10 mx-auto w-full" style={{ maxWidth: '760px' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '2.5rem', fontSize: '0.85rem', color: '#6b6b6b', letterSpacing: '0.02em' }}>
          ← back to home
        </Link>
        <header style={{ marginBottom: '3rem' }}>
          <h1 ref={titleRef} style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            lineHeight: 1.2
          }}>
            Notes and write-ups
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#5b5b5b', lineHeight: 1.6, margin: 0 }}>
            Drafts and full posts about ongoing research in interpretability, fairness, and alignment.
          </p>
          <hr style={{ marginTop: '1.5rem', border: 0, borderTop: '1px solid #d8d3c8' }} />
        </header>

        {blogPosts.length === 0 ? (
          <p style={{ color: '#6b6b6b', textAlign: 'center', padding: '4rem 0' }}>No posts yet.</p>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[...blogPosts].sort((a, b) => {
              if (a.featured && !b.featured) return -1;
              if (!a.featured && b.featured) return 1;
              return new Date(b.date) - new Date(a.date);
            }).map((post) => (
              <li key={post.slug} style={{ marginBottom: '2.5rem' }}>
                <Link to={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    marginBottom: '0.35rem',
                    lineHeight: 1.35,
                    letterSpacing: '-0.005em'
                  }}>
                    {post.title}
                  </h2>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.78rem',
                    color: '#9c9483',
                    letterSpacing: '0.05em',
                    marginBottom: '0.6rem'
                  }}>
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p style={{
                    fontSize: '0.96rem',
                    lineHeight: 1.65,
                    color: '#3a3a3a',
                    marginBottom: '0.5rem'
                  }}>
                    {post.excerpt}
                  </p>
                  <span style={{ fontSize: '0.85rem', color: '#5b3a8a', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    read →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

