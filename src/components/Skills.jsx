import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Skills3D from './Skills3D'

gsap.registerPlugin(ScrollTrigger)

const skills = [
  { name: 'Machine Learning / Deep Learning', level: 95, color: 'bg-indigo-500' },
  { name: 'LLMs & Foundation Models', level: 92, color: 'bg-purple-500' },
  { name: 'PyTorch / DeepSpeed', level: 90, color: 'bg-pink-500' },
  { name: 'Fairness & Interpretability', level: 88, color: 'bg-blue-500' },
  { name: 'Computer Vision', level: 85, color: 'bg-green-500' },
  { name: 'NLP / Conversational AI', level: 85, color: 'bg-yellow-500' },
  { name: 'ONNX Runtime / Edge AI', level: 82, color: 'bg-teal-500' },
  { name: 'Python / Research', level: 90, color: 'bg-orange-500' },
]

export default function Skills() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    gsap.from(titleRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    })

    const bars = document.querySelectorAll('.skill-bar')
    bars.forEach((bar, index) => {
      const level = bar.dataset.level
      gsap.from(bar, {
        scrollTrigger: {
          trigger: bar,
          start: 'top 90%',
        },
        width: 0,
        duration: 1.5,
        ease: 'power3.out',
        delay: index * 0.1
      })
    })
  }, [])

  return (
    <section ref={sectionRef} id="skills" className="relative min-h-screen py-20 px-4 overflow-hidden parallax-section">
      <Skills3D />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-bold mb-16 text-center gradient-text">
          Skills & Expertise
        </h2>
        <div className="space-y-8">
          {skills.map((skill, index) => (
            <div key={index} className="glass rounded-xl p-6">
              <div className="flex justify-between mb-3">
                <span className="text-lg font-semibold">{skill.name}</span>
                <span className="text-indigo-400 font-bold">{skill.level}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`skill-bar h-full ${skill.color} rounded-full`}
                  data-level={skill.level}
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">3+</div>
            <div className="text-gray-400">Publications</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">4+</div>
            <div className="text-gray-400">Research Labs</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-2">700+</div>
            <div className="text-gray-400">Women Trained in AI</div>
          </div>
        </div>
      </div>
    </section>
  )
}

