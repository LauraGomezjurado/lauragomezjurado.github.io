import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Portfolio3D from './Portfolio3D'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    id: 1,
    title: 'AI Cybersecurity & Evaluation Robustness',
    description: 'Research at Stanford CRFM extending CyberBench: benchmarking cybersecurity agents',
    tech: ['Agents', 'Cybersecurity', 'AI Safety'],
    color: 'from-[#B8860B] to-[#8B6914]',
    org: 'Stanford CRFM (2025 - Present)',
    link: null,
    github: null // Add your GitHub repo URL here, e.g., 'https://github.com/LauraGomezjurado/cyberbench-extension'
  },
  {
    id: 2,
    title: 'Transformer Generalization Limits',
    description: 'Microsoft Research internship probing generalization limits on weak-signal behavioral prediction (email reply). Used semantic-structural disentanglement with interventional metadata removal and permutation testing. Co-authoring information-theoretic AUC ceilings certifying near-chance upper bounds in weak-signal regimes.',
    tech: ['Transformers', 'Generalization', 'XGBoost', 'Evaluation'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Microsoft Research (Summer 2025)',
    link: null,
    github: null // Add your GitHub repo URL here
  },
  {
    id: 3,
    title: 'Precision Routing for Multi-LLM Ensembles',
    description: 'Stanford Scaling Intelligence Lab research estimating per-query success to select minimum-cost models with target-accuracy constraints. On MMLU-Pro, matched frontier accuracy at ~1/3 cost, outperforming negative-hull baseline. Fine-tuned encoder + calibration head for query difficulty estimation.',
    tech: ['LLMs', 'Ensembles', 'Calibration', 'Cost Optimization'],
    color: 'from-[#8B6914] to-[#B8860B]',
    org: 'Stanford Scaling Intelligence Lab (2025)',
    link: null,
    github: null // Add your GitHub repo URL here
  },
  {
    id: 4,
    title: 'High-Dimensional Model Editing for Fairness',
    description: 'Built λ-scaled merge of subgroup-specific Δθ maintaining accuracy while lowering DPD/EOD vs FFT/LoRA across LLaMA-2, DistilBERT, and Qwen-2.5. Derived theoretical DPD upper bound linking coefficients to subgroup vector norms. NeurIPS 2025 WS, ICLR 2026 under review.',
    tech: ['Model Editing', 'Fairness', 'PyTorch', 'DeepSpeed'],
    color: 'from-[#B8860B] to-[#8B6914]',
    org: 'Mila/Meta AI with Dr. Hiroki Naganuma (2024 - Present)',
    link: 'https://arxiv.org/abs/2505.24262',
    github: null // Add your GitHub repo URL here
  },
  {
    id: 10,
    title: 'Interpretation Shifts: OOD Analysis & Attribution Robustness',
    description: 'Comprehensive analysis of model behavior under distribution shift, comparing Vision Transformers and ResNet architectures. Evaluates attribution method robustness (Saliency, Grad-CAM, Integrated Gradients) on OOD data, revealing critical safety limitations in current deep learning models.',
    tech: ['Interpretability', 'OOD Analysis', 'Vision Transformers', 'PyTorch'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Research Project',
    link: null,
    github: 'https://github.com/LauraGomezjurado/interpret_shifts'
  },
  {
    id: 5,
    title: 'ASOFI: AI for Agriculture & Peacebuilding',
    description: 'Co-founded organization deploying on-device cacao disease detection (MobileNet → TFLite/Core ML) via WhatsApp to 12 rural co-ops, scanning 1.5k+ plants/month with ~18% yield lift. Led digital-literacy & AI bootcamps for 700+ women in post-conflict zones. Partnerships with MAKAIA and +Colombia.',
    tech: ['MobileNet', 'TFLite', 'Edge AI', 'Social Impact'],
    color: 'from-[#A0826D] to-[#B8860B]',
    org: 'ASOFI (Co-founder & President, 2021 - Present)',
    link: null,
    github: null // Add your GitHub repo URL here
  },
  {
    id: 6,
    title: 'Browser-Native Latent-Code Video',
    description: 'Built browser-native, latent-code video over WebRTC at <15 kbps (~100-500× vs H.264/VP9), MOS ≥ 4.2/5, 25 fps on CPU with ONNX Runtime. Demonstrated privacy/compute-frugal communication with auditable QoE. Published at IEEE DCC 2023.',
    tech: ['WebRTC', 'ONNX Runtime', 'Video Compression', 'Edge Computing'],
    color: 'from-[#8B6914] to-[#B8860B]',
    org: 'Stanford EE (2022 - 2023)',
    link: 'https://ieeexplore.ieee.org/document/10125536',
    github: null // Add your GitHub repo URL here
  },
  {
    id: 7,
    title: 'COVID-19 Detection from Cough',
    description: 'Led ~30k-sample cough collection across 30+ hospitals. Trained CNN/SSL models (AUC 0.807/0.802). Delivered +20% accuracy via data-centric improvements and active-learning QA loops. Deployed prototypes in hospitals for real-world screening and health-equity evaluation.',
    tech: ['CNN', 'Self-Supervised Learning', 'Active Learning', 'Healthcare AI'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Covid Detection Foundation / Virufy (2021 - 2023)',
    link: 'https://ui.adsabs.harvard.edu/abs/2022arXiv220101669D/abstract',
    github: null // Add your GitHub repo URL here
  },
  {
    id: 8,
    title: 'Clinical-Note LLM Pipeline',
    description: 'Built compact LLaMA-3 pipeline (QLoRA+RAG+DPO, 1-8B) improving note quality (ROUGE-1 0.25→0.48; BERTScore 0.865 on ACI-BENCH). Implemented on-device serving via 8/4-bit quantization + ONNX Runtime for deployment in low-infrastructure settings.',
    tech: ['LLaMA-3', 'QLoRA', 'RAG', 'DPO', 'Quantization'],
    color: 'from-[#8B6914] to-[#B8860B]',
    org: 'Selected Project',
    link: null,
    github: 'https://github.com/LauraGomezjurado/clinical-notes-pipeline' // Add your GitHub repo URL here
  },
  {
    id: 9,
    title: 'Safe Convex RL',
    description: 'Developed primal-dual method with O(1/√K) regret achieving expert-level reward with unsafe occupancy 0.047%. Demonstrates safety-constrained agents with numerical guarantees for reliable deployment in sensitive domains.',
    tech: ['Reinforcement Learning', 'Convex Optimization', 'Safety Constraints'],
    color: 'from-[#B8860B] to-[#8B6914]',
    org: 'Selected Project',
    link: null,
    github: 'https://github.com/LauraGomezjurado/ee364b-project'// Add your GitHub repo URL here
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
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-24 text-center text-white">
          Research & Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card glass rounded-2xl p-8 cursor-pointer group relative overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-3 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <h3 className="text-xl font-light mb-3 text-white">{project.title}</h3>
                <p className="text-xs text-[#B8860B] mb-4 font-light tracking-wide">{project.org}</p>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed font-light">{project.description}</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {project.github && (
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#B8860B] hover:text-[#8B6914] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View Code
                    </a>
                  )}
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#B8860B] hover:text-[#8B6914] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      View Publication
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-light text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${project.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 opacity-20`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

