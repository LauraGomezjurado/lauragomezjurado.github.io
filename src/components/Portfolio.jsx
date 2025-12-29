import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AbstractPattern from './AbstractPattern'
import ProjectDoodle from './ProjectDoodle'

gsap.registerPlugin(ScrollTrigger)

const projects = [

  {
    id: 4,
    title: 'High-Dimensional Model Editing for Fairness',
    description: 'Built λ-scaled merge of subgroup-specific Δθ maintaining accuracy while lowering DPD/EOD vs FFT/LoRA across LLaMA-2, DistilBERT, and Qwen-2.5. Derived theoretical DPD upper bound linking coefficients to subgroup vector norms. NeurIPS 2025 WS, ICLR 2026 under review.',
    briefDescription: 'Novel model editing approach reducing demographic parity gaps while preserving accuracy through high-dimensional parameter manipulation.',
    tech: ['Model Editing', 'Fairness', 'PyTorch', 'DeepSpeed'],
    color: 'from-[#B8860B] to-[#8B6914]',
    org: 'Supervised by Dr. Hiroki Naganuma -- Hosted at ProPlace (2024 - Present)',
    image: '/images/task_arithmetic_figure.png',
    imageCitation: 'Ilharco et al., "Editing Models with Task Arithmetic" (2022)',
    link: 'https://arxiv.org/abs/2505.24262',
    github: 'https://github.com/LauraGomezjurado/fairness_task_vector_deploy'
  },

  {
    id: 11,
    title: 'Subliminal Preference Transfer in LLMs',
    description: 'Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics. Used DPO fine-tuning on PRISM alignment data across four countries (US, UK, Chile, Mexico), evaluating on GlobalOpinionsQA to test if models absorb cultural values implicitly from conversational patterns.',
    briefDescription: 'Research examining whether models learn demographic preferences from neutral conversations and if those preferences transfer to unrelated domains—critical for AI safety and fairness.',
    tech: ['DPO', 'QLoRA', 'Preference Alignment', 'AI Safety'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Research Project (2025)',
    image: '/images/blog/figure1_js_heatmap.png',
    link: null,
    blogLink: 'https://lauragomezjurado.github.io/blog/subliminal-preference-transfer',
    github: 'https://github.com/LauraGomezjurado/subliminal_learning_rlhf'
  },

  {
    id: 2,
    title: 'Transformer Generalization Limits',
    description: 'Microsoft Research internship probing generalization limits on weak-signal behavioral prediction (email reply). Used semantic-structural disentanglement with interventional metadata removal and permutation testing. Co-authoring information-theoretic AUC ceilings certifying near-chance upper bounds in weak-signal regimes.',
    briefDescription: 'Investigating theoretical limits of transformer generalization in weak-signal regimes through information-theoretic analysis.',
    tech: ['Transformers', 'Generalization', 'XGBoost', 'Evaluation'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Microsoft Research (Summer 2025)',
    image: null,
    logo: '/images/microsoft-logo.svg',
    link: null,
    github: null // Add your GitHub repo URL here
  },
  {
    id: 3,
    title: 'Precision Routing for Multi-LLM Ensembles',
    description: 'Stanford Scaling Intelligence Lab research estimating per-query success to select minimum-cost models with target-accuracy constraints. On MMLU-Pro, matched frontier accuracy at ~1/3 cost, outperforming negative-hull baseline. Fine-tuned encoder + calibration head for query difficulty estimation.',
    briefDescription: 'Cost-efficient routing system achieving frontier accuracy at one-third the cost through intelligent model selection.',
    tech: ['LLMs', 'Ensembles', 'Calibration', 'Cost Optimization'],
    color: 'from-[#8B6914] to-[#B8860B]',
    org: 'Stanford Scaling Intelligence Lab (2025)',
    image: '/images/router_reward_model.png',
    link: null,
    github: null // Add your GitHub repo URL here
  },
  {
    id: 1,
    title: 'AI Cybersecurity & Evaluation Robustness',
    description: 'Research at Stanford CRFM extending CyberBench: benchmarking cybersecurity agents',
    briefDescription: 'Extending evaluation frameworks for cybersecurity agents with robust benchmarking methodologies.',
    tech: ['Agents', 'Cybersecurity', 'AI Safety'],
    color: 'from-[#B8860B] to-[#8B6914]',
    org: 'Stanford CRFM (2025 - Present)',
    image: null, // Add image path here if available, e.g., '/images/portfolio/cyberbench.png'
    link: null,
    github: null // Add your GitHub repo URL here, e.g., 'https://github.com/LauraGomezjurado/cyberbench-extension'
  },
  {
    id: 10,
    title: 'Interpretation Shifts: OOD Analysis & Attribution Robustness',
    description: 'Comprehensive analysis of model behavior under distribution shift, comparing Vision Transformers and ResNet architectures. Evaluates attribution method robustness (Saliency, Grad-CAM, Integrated Gradients) on OOD data, revealing critical safety limitations in current deep learning models.',
    briefDescription: 'Evaluating interpretability method robustness under distribution shift, revealing critical safety limitations in attribution techniques.',
    tech: ['Interpretability', 'OOD Analysis', 'Vision Transformers', 'PyTorch'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Research Project',
    image: '/images/interpret_shifts_performance.png',
    link: null,
    github: 'https://github.com/LauraGomezjurado/interpret_shifts'
  },
  {
    id: 5,
    title: 'ASOFI: AI for Agriculture & Peacebuilding',
    description: 'Co-founded organization deploying on-device cacao disease detection (MobileNet → TFLite/Core ML) via WhatsApp to 12 rural co-ops, scanning 1.5k+ plants/month with ~18% yield lift. Led digital-literacy & AI bootcamps for 700+ women in post-conflict zones. Partnerships with MAKAIA and +Colombia.',
    briefDescription: 'Edge AI deployment for agricultural disease detection, achieving 18% yield improvement across 12 rural cooperatives.',
    tech: ['MobileNet', 'TFLite', 'Edge AI', 'Social Impact'],
    color: 'from-[#A0826D] to-[#B8860B]',
    org: 'ASOFI (Co-founder & President, 2021 - Present)',
    image: '/images/asofi_agroscan.png',
    link: null,
    github: null // Add your GitHub repo URL here
  },
  {
    id: 6,
    title: 'Browser-Native Latent-Code Video',
    description: 'Built browser-native, latent-code video over WebRTC at <15 kbps (~100-500× vs H.264/VP9), MOS ≥ 4.2/5, 25 fps on CPU with ONNX Runtime. Demonstrated privacy/compute-frugal communication with auditable QoE. Published at IEEE DCC 2023.',
    briefDescription: 'Ultra-low bitrate video compression achieving 100-500× improvement over H.264/VP9 with browser-native implementation.',
    tech: ['WebRTC', 'ONNX Runtime', 'Video Compression', 'Edge Computing'],
    color: 'from-[#8B6914] to-[#B8860B]',
    org: 'Stanford EE (2022 - 2023)',
    image: null,
    link: 'https://ieeexplore.ieee.org/document/10125536',
    github: null // Add your GitHub repo URL here
  },
  {
    id: 7,
    title: 'COVID-19 Detection from Cough',
    description: 'Led ~30k-sample cough collection across 30+ hospitals. Trained CNN/SSL models (AUC 0.807/0.802). Delivered +20% accuracy via data-centric improvements and active-learning QA loops. Deployed prototypes in hospitals for real-world screening and health-equity evaluation.',
    briefDescription: 'Audio-based COVID-19 screening achieving 0.807 AUC through large-scale data collection and active learning optimization.',
    tech: ['CNN', 'Self-Supervised Learning', 'Active Learning', 'Healthcare AI'],
    color: 'from-[#B8860B] to-[#A0826D]',
    org: 'Covid Detection Foundation / Virufy (2021 - 2023)',
    image: null,
    link: 'https://ui.adsabs.harvard.edu/abs/2022arXiv220101669D/abstract',
    github: null // Add your GitHub repo URL here
  },
  {
    id: 8,
    title: 'Clinical-Note LLM Pipeline',
    description: 'Built compact LLaMA-3 pipeline (QLoRA+RAG+DPO, 1-8B) improving note quality (ROUGE-1 0.25→0.48; BERTScore 0.865 on ACI-BENCH). Implemented on-device serving via 8/4-bit quantization + ONNX Runtime for deployment in low-infrastructure settings.',
    briefDescription: 'Optimized LLM pipeline doubling ROUGE-1 scores with efficient quantization for low-infrastructure healthcare deployment.',
    tech: ['LLaMA-3', 'QLoRA', 'RAG', 'DPO', 'Quantization'],
    color: 'from-[#8B6914] to-[#B8860B]',
    org: 'Selected Project',
    image: null,
    link: null,
    github: 'https://github.com/LauraGomezjurado/clinical-notes-pipeline' // Add your GitHub repo URL here
  },
  {
    id: 9,
    title: 'Safe Convex RL',
    description: 'Developed primal-dual method with O(1/√K) regret achieving expert-level reward with unsafe occupancy 0.047%. Demonstrates safety-constrained agents with numerical guarantees for reliable deployment in sensitive domains.',
    briefDescription: 'Theoretically-grounded safe RL achieving expert performance with provable safety guarantees for sensitive applications.',
    tech: ['Reinforcement Learning', 'Convex Optimization', 'Safety Constraints'],
    color: 'from-[#B8860B] to-[#8B6914]',
    org: 'Selected Project',
    image: '/images/safe_convex_rl_scaling.png',
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

    const projectItems = document.querySelectorAll('.project-item')
    projectItems.forEach((item) => {
      gsap.set(item, { opacity: 1, y: 0 })
    })

    // Subtle animate on scroll
    gsap.fromTo(titleRef.current,
      {
        opacity: 0.3,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          end: 'top 60%',
          toggleActions: 'play none none none',
          scrub: 1
        }
      }
    )

    projectItems.forEach((item, index) => {
      gsap.fromTo(item,
        {
          opacity: 0.3,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end: 'top 60%',
            toggleActions: 'play none none none',
            scrub: 1
          }
        }
      )
    })
  }, [])

  return (
    <section ref={sectionRef} id="portfolio" className="relative min-h-screen py-20 px-4 overflow-visible bg-black -mt-20">
      <AbstractPattern variant="portfolio" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-5xl md:text-6xl font-light mb-32 text-center text-white tracking-wider">
          Research & Projects
        </h2>
        
        {/* Vertical layout - each project takes up large screen space */}
        <div className="space-y-32 md:space-y-48">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-item min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center"
            >
              <div className={`grid ${project.image || project.logo ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-12 md:gap-20 items-start`}>
                {/* Left Column: Headlines */}
                <div className={`space-y-6 ${!project.image && !project.logo ? 'max-w-4xl' : ''}`}>
                  <div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 tracking-wide" style={{ color: '#C88A7A' }}>
                      {project.title}
                    </h3>
                    <p className="text-sm mb-6 font-light tracking-wide uppercase" style={{ color: '#C88A7A', opacity: 0.75 }}>
                      {project.org}
                    </p>
                  </div>
                  <p className="text-base md:text-lg text-gray-300 leading-relaxed font-light max-w-xl">
                    {project.description}
                  </p>
                  
                  {/* Links at bottom of left column */}
                  <div className="flex flex-col gap-3 mt-8">
                    {project.github && (
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-sm transition-colors font-light hover:opacity-80"
                        style={{ color: '#C88A7A' }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View on GitHub
                      </a>
                    )}
                    {project.blogLink && (
                      <a 
                        href={project.blogLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-sm transition-colors font-light hover:opacity-80"
                        style={{ color: '#C88A7A' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Read Blog Post
                      </a>
                    )}
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-sm transition-colors font-light hover:opacity-80"
                        style={{ color: '#C88A7A' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Read Paper
                      </a>
                    )}
                  </div>
                  
                  {/* Brief description and tech tags moved here when no image */}
                  {!project.image && !project.logo && (
                    <>
                      <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light mt-6">
                        {project.briefDescription}
                      </p>
                      
                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.tech.map((tech, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-white/5 rounded text-xs font-light text-gray-400 border border-white/10">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column: Descriptions/Doodles/Diagrams - only show if image or logo exists */}
                {(project.image || project.logo) && (
                  <div className="space-y-6 flex flex-col justify-start">
                    {project.image ? (
                      <div className="mb-6">
                        <div className="w-full aspect-video bg-white/5 overflow-hidden rounded-lg flex items-center justify-center p-8" style={{ borderColor: 'rgba(200, 138, 122, 0.1)' }}>
                          <ProjectDoodle projectId={project.id} className="w-full h-full" />
                        </div>
                        {project.imageCitation && (
                          <p className="text-xs text-gray-500 mt-2 italic text-center">
                            {project.imageCitation}
                          </p>
                        )}
                      </div>
                    ) : project.logo ? (
                      <div className="mb-6 flex justify-center">
                        <div className="w-48 h-32 bg-white/5 flex items-center justify-center p-4 border" style={{ borderColor: 'rgba(200, 138, 122, 0.2)' }}>
                          <img 
                            src={project.logo} 
                            alt={project.org}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </div>
                    ) : null}
                    
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                      {project.briefDescription}
                    </p>
                    
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tech.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white/5 rounded text-xs font-light text-gray-400 border border-white/10">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

