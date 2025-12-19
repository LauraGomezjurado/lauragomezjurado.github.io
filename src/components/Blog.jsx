import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// This will be populated from markdown files
// For now, we'll create a simple structure
const blogPosts = [
  {
    slug: 'subliminal-preference-transfer',
    title: 'Subliminal Preference Transfer in LLMs: When Models Learn More Than We Intend',
    date: '2025-01-20',
    excerpt: 'Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics—and what this means for AI safety.'
  },
  {
    slug: 'welcome-to-my-blog',
    title: 'Welcome to My Blog',
    date: '2025-01-15',
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
    <section ref={sectionRef} id="blog" className="relative min-h-screen py-20 px-4 overflow-hidden" style={{ background: '#faf9f6', color: '#1a1a1a' }}>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-16 text-center gradient-text tracking-wider">
          Blog
        </h2>
        
        {blogPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {blogPosts.map((post, index) => (
              <article
                key={post.slug}
                className="glass rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <h3 className="text-2xl font-light mb-3 gradient-text hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-gray-700 leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="inline-block mt-4 text-indigo-500 hover:text-indigo-600 transition-colors">
                    Read more →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

