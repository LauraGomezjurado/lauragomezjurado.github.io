import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// This will be populated from markdown files
// For now, we'll create a simple structure
const blogPosts = [
  {
    slug: 'confessions-dont-escape-substrate',
    title: 'Confessions don\'t escape the substrate: confession honesty in latent chain-of-thought',
    date: '2026-05-03',
    excerpt: 'We trained three models that sandbag identically and all pass the binary confession metric, but informational recovery of the concealed truth separates honest substrate from mode collapse and decoder anchoring.',
    featured: true
  },
  {
    slug: 'monitoring-silent-thoughts',
    title: 'When the channel disappears: monitorability in latent chain-of-thought',
    date: '2026-04-30',
    excerpt: "A model can sandbag identically whether or not it talks about sandbagging. We trained three models that all do exactly the same thing: they answer correctly when a prompt cue says they're being watched, and wrong when it says they aren't. Then we asked the same question of each one. How easy is it to tell, from the model's reasoning, that it's gaming the monitor? The answer changes a lot depending on where the reasoning lives.",
    featured: true
  },
  {
    slug: 'task-arithmetic-fairness',
    title: 'The Hidden Geometry of Task Arithmetic',
    date: '2026-04-14',
    excerpt: 'A task vector is a direction in weight space. Merging is vector composition. λ is a motion parameter. Once you see the geometry, the fairness results of this ICLR 2026 paper become almost inevitable.',
    featured: true
  },
  {
    slug: 'materials-agents-exploration',
    title: 'Building Agents That Do Materials Science',
    date: '2025-12-30',
    excerpt: 'What if you could just tell an AI agent what material you want, and it figures out how to simulate it, analyze it, and optimize it? I\'m exploring whether LLM-based agents can orchestrate real materials discovery workflows.'
  },
  {
    slug: 'subliminal-preference-transfer',
    title: 'Do LLMs Learn Hidden Preferences from Neutral Feedback?',
    date: '2025-01-20',
    excerpt:
      'Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics, and what this means for AI safety.',
  },
  {
    slug: 'hidden-objectives',
    title: 'Exploring Concealment Mechanisms Across Hidden Objectives',
    date: '2025-01-01',
    excerpt: 'What happens when you train a model to do two different secret tasks? Do they share a common hiding mechanism, or stay separate? I ran some experiments to find out.',
    featured: true
  },
  {
    slug: 'welcome-to-my-blog',
    title: 'Welcome to My Blog',
    date: '2025-11-01',
    excerpt: 'This is my first blog post where I\'ll be sharing thoughts on AI safety, interpretability, and research.'
  }
]

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

