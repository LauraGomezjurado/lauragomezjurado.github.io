import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import About3D from './About3D'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    // Set initial state
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, y: 0 })
    }
    if (contentRef.current) {
      gsap.set(contentRef.current, { opacity: 1, x: 0 })
    }
    if (imageRef.current) {
      gsap.set(imageRef.current, { opacity: 1, x: 0 })
    }

    // Animate on scroll
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

    gsap.fromTo(contentRef.current,
      {
        opacity: 0,
        x: -50
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )

    gsap.fromTo(imageRef.current,
      {
        opacity: 0,
        x: 50
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative min-h-screen py-20 px-4 overflow-hidden parallax-section">
      <About3D />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-bold mb-16 text-center gradient-text">
          About Me
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={contentRef} className="space-y-6">
            <p className="text-xl text-gray-300 leading-relaxed">
              I'm an independent, evidence-driven researcher focused on <strong>interpretability, fairness, and reliability</strong> of large models. 
              I have a proven record of translating methods into norms through shortcut/artefact audits, uncertainty calibration, 
              and mechanism-first evaluation.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Currently pursuing a <strong>BS/MS in Computer Science (AI Track) at Stanford University</strong> (Class of 2027), 
              I conduct research at the Stanford Center for Research on Foundation Models and the Scaling Intelligence Lab. 
              My work spans AI cybersecurity, model editing for fairness, and precision routing for multi-LLM ensembles.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              <strong>Relevant Coursework:</strong> CS229m (ML Theory), CS329h (ML from Human Preferences), CS231n (Computer Vision & Deep Learning), 
              CS224n/v (NLP/Conversational Agents), CS329a (Self-Improving Agents), EE263 (Linear Systems), EE364a/b (Convex Optimization).
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Beyond research, I'm deeply involved in <strong>global governance</strong> as a Youth Representative for UN Women (one of 20 global members, 
              youngest Latin American), co-founder of ASOFI (AI for Agriculture & Peacebuilding), and a World Economic Forum Delegate (Davos 2025). 
              I bridge interpretability/fairness findings to policy audiences and deploy AI solutions in low-infrastructure settings.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              <strong>Honors:</strong> SoftBank Masason Foundation Fellow (personally selected by Masayoshi Son as one of 26 youth worldwide), 
              Global Teen Leader (We Are Family Foundation), European Girls' Olympiad in Informatics, Conrad Innovator (NASA-sponsored).
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              {['PyTorch', 'DeepSpeed', 'ONNX Runtime', 'LLMs', 'Fairness', 'Interpretability'].map((tech, idx) => (
                <span 
                  key={tech}
                  className="px-4 py-2 glass rounded-full text-sm transform transition-all duration-300 hover:scale-110 hover:bg-indigo-500/20 hover:border-indigo-400/50 cursor-default"
                  style={{
                    animationDelay: `${idx * 0.1}s`
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div ref={imageRef} className="relative group">
            <div className="glass rounded-2xl p-2 aspect-square flex items-center justify-center transform transition-all duration-500 hover:scale-105 hover:rotate-2 overflow-hidden">
              <div className="w-full h-full rounded-xl relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <img 
                  src="/profile.jpg" 
                  alt="Laura Gomezjurado Gonzalez at World Economic Forum Davos 2025"
                  className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 -z-10 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-30 -z-10 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

