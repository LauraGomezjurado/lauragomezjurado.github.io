import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Portfolio3D from './Portfolio3D'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    id: 1,
    title: 'AI Cybersecurity & Evaluation Robustness',
    description: 'Research at Stanford CRFM extending CyberBench to analyze adversarial prompt injection, model poisoning, and defense benchmarking for frontier LLMs. Developing automated red-teaming and interpretability-based anomaly detection to align cybersecurity metrics with AI safety and governance frameworks.',
    tech: ['LLMs', 'Cybersecurity', 'Interpretability', 'AI Safety'],
    color: 'from-indigo-500 to-purple-600',
    org: 'Stanford CRFM (2025 - Present)',
    link: null
  },
  {
    id: 2,
    title: 'Transformer Generalization Limits',
    description: 'Microsoft Research internship probing generalization limits on weak-signal behavioral prediction (email reply). Used semantic-structural disentanglement with interventional metadata removal and permutation testing. Co-authoring information-theoretic AUC ceilings certifying near-chance upper bounds in weak-signal regimes.',
    tech: ['Transformers', 'Generalization', 'XGBoost', 'Evaluation'],
    color: 'from-purple-500 to-pink-600',
    org: 'Microsoft Research (Summer 2025)',
    link: null
  },
  {
    id: 3,
    title: 'Precision Routing for Multi-LLM Ensembles',
    description: 'Stanford Scaling Intelligence Lab research estimating per-query success to select minimum-cost models with target-accuracy constraints. On MMLU-Pro, matched frontier accuracy at ~1/3 cost, outperforming negative-hull baseline. Fine-tuned encoder + calibration head for query difficulty estimation.',
    tech: ['LLMs', 'Ensembles', 'Calibration', 'Cost Optimization'],
    color: 'from-pink-500 to-red-600',
    org: 'Stanford Scaling Intelligence Lab (2025 - Present)',
    link: null
  },
  {
    id: 4,
    title: 'High-Dimensional Model Editing for Fairness',
    description: 'Built λ-scaled merge of subgroup-specific Δθ maintaining accuracy while lowering DPD/EOD vs FFT/LoRA across LLaMA-2, DistilBERT, and Qwen-2.5. Derived theoretical DPD upper bound linking coefficients to subgroup vector norms. NeurIPS 2025 WS, ICLR 2026 under review.',
    tech: ['Model Editing', 'Fairness', 'PyTorch', 'DeepSpeed'],
    color: 'from-blue-500 to-indigo-600',
    org: 'Mila/Meta AI with Dr. Hiroki Naganuma (2024 - Present)',
    link: 'https://arxiv.org/abs/2505.24262'
  },
  {
    id: 5,
    title: 'ASOFI: AI for Agriculture & Peacebuilding',
    description: 'Co-founded organization deploying on-device cacao disease detection (MobileNet → TFLite/Core ML) via WhatsApp to 12 rural co-ops, scanning 1.5k+ plants/month with ~18% yield lift. Led digital-literacy & AI bootcamps for 700+ women in post-conflict zones. Partnerships with MAKAIA and +Colombia.',
    tech: ['MobileNet', 'TFLite', 'Edge AI', 'Social Impact'],
    color: 'from-green-500 to-teal-600',
    org: 'ASOFI (Co-founder & President, 2021 - Present)',
    link: null
  },
  {
    id: 6,
    title: 'Browser-Native Latent-Code Video',
    description: 'Built browser-native, latent-code video over WebRTC at <15 kbps (~100-500× vs H.264/VP9), MOS ≥ 4.2/5, 25 fps on CPU with ONNX Runtime. Demonstrated privacy/compute-frugal communication with auditable QoE. Published at IEEE DCC 2023.',
    tech: ['WebRTC', 'ONNX Runtime', 'Video Compression', 'Edge Computing'],
    color: 'from-yellow-500 to-orange-600',
    org: 'Stanford EE (2022 - 2023)',
    link: 'https://ieeexplore.ieee.org/document/10125536'
  },
  {
    id: 7,
    title: 'COVID-19 Detection from Cough',
    description: 'Led ~30k-sample cough collection across 30+ hospitals. Trained CNN/SSL models (AUC 0.807/0.802). Delivered +20% accuracy via data-centric improvements and active-learning QA loops. Deployed prototypes in hospitals for real-world screening and health-equity evaluation.',
    tech: ['CNN', 'Self-Supervised Learning', 'Active Learning', 'Healthcare AI'],
    color: 'from-teal-500 to-cyan-600',
    org: 'Covid Detection Foundation / Virufy (2021 - 2023)',
    link: 'https://ui.adsabs.harvard.edu/abs/2022arXiv220101669D/abstract'
  },
  {
    id: 8,
    title: 'Clinical-Note LLM Pipeline',
    description: 'Built compact LLaMA-3 pipeline (QLoRA+RAG+DPO, 1-8B) improving note quality (ROUGE-1 0.25→0.48; BERTScore 0.865 on ACI-BENCH). Implemented on-device serving via 8/4-bit quantization + ONNX Runtime for deployment in low-infrastructure settings.',
    tech: ['LLaMA-3', 'QLoRA', 'RAG', 'DPO', 'Quantization'],
    color: 'from-cyan-500 to-blue-600',
    org: 'Selected Project',
    link: null
  },
  {
    id: 9,
    title: 'Safe Convex RL',
    description: 'Developed primal-dual method with O(1/√K) regret achieving expert-level reward with unsafe occupancy 0.047%. Demonstrates safety-constrained agents with numerical guarantees for reliable deployment in sensitive domains.',
    tech: ['Reinforcement Learning', 'Convex Optimization', 'Safety Constraints'],
    color: 'from-violet-500 to-purple-600',
    org: 'Selected Project',
    link: null
  }
]

export default function Portfolio() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    // Set initial state - ensure content is visible
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, y: 0 })
    }

    const cards = document.querySelectorAll('.project-card')
    cards.forEach((card) => {
      gsap.set(card, { opacity: 1, y: 0 })
    })

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

    cards.forEach((card, index) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      )
    })
  }, [])

  return (
    <section ref={sectionRef} id="portfolio" className="relative min-h-screen py-20 px-4 overflow-hidden parallax-section">
      <Portfolio3D />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-bold mb-16 text-center gradient-text">
          Research & Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card glass rounded-2xl p-6 cursor-pointer group relative overflow-hidden transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              <div className="relative z-10 transform group-hover:translate-z-10 transition-transform duration-500">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${project.color} mb-4 flex items-center justify-center text-2xl font-bold transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                  {project.id}
                </div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-xs text-indigo-400 mb-3 font-semibold">{project.org}</p>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">{project.description}</p>
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline inline-block mb-2"
                  >
                    View Publication →
                  </a>
                )}
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${project.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

