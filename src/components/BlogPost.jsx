import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// In a real implementation, you'd load this from markdown files
// For now, we'll use a simple mapping
const blogPosts = {
  'welcome-to-my-blog': {
    title: 'Welcome to My Blog',
    date: '2025-01-15',
    content: `# Welcome to My Blog

This is where I'll be sharing my thoughts on AI safety, interpretability, fairness, and the research I'm working on.

## What to Expect

I'll be writing about:
- Research insights and findings
- Thoughts on AI safety and governance
- Technical deep-dives into interpretability
- Reflections on the intersection of research and policy

Stay tuned for more content!`
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const [post, setPost] = useState(null)

  useEffect(() => {
    // Load post content
    const postData = blogPosts[slug]
    if (postData) {
      setPost(postData)
    }

    // Animate on load
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out'
        }
      )
    }
  }, [slug])

  if (!post) {
    return (
      <section className="relative min-h-screen py-20 px-4">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Post Not Found</h2>
          <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Blog
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen py-20 px-4 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <Link to="/blog" className="inline-block mb-8 text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Back to Blog
        </Link>
        
        <article className="glass rounded-2xl p-8 md:p-12">
          <h1 ref={titleRef} className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {post.title}
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 gradient-text" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-200" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-300" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-300 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                code: ({node, ...props}) => <code className="bg-white/10 px-2 py-1 rounded text-sm text-indigo-300" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                a: ({node, ...props}) => <a className="text-indigo-400 hover:text-indigo-300 underline" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-4" {...props} />
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </section>
  )
}

