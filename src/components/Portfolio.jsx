import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectDoodle from './ProjectDoodle'
import { motifState } from './MathBackgrounds'

gsap.registerPlugin(ScrollTrigger)

/**
 * Portfolio: editorial project showcase.
 *
 * Each project "claims" the background by driving motifState (hue / intensity /
 * spin) while it's the dominant section in the viewport. A faint motif layer
 * (the project's doodle, ghosted and large) sits behind the card to make the
 * background feel like it is *about* that project for that moment.
 *
 * `hue` ∈ [-1, 1] mapped to warm↔cool tint of the attractor. `spin` adds a
 * gentle extra rotation to the curve while the section is active.
 */
const projects = [
  {
    id: 4,
    title: 'High-Dimensional Model Editing for Fairness',
    year: '2024 to 2026',
    venue: 'ICLR 2026 · Workshop (2025)',
    topic: 'Model Editing',
    description: 'Built λ-scaled merge of subgroup-specific Δθ maintaining accuracy while lowering DPD/EOD vs FFT/LoRA across LLaMA-2, DistilBERT, and Qwen-2.5. Derived theoretical DPD upper bound linking coefficients to subgroup vector norms.',
    briefDescription: 'Novel model editing approach reducing demographic parity gaps while preserving accuracy through high-dimensional parameter manipulation.',
    tech: ['Model Editing', 'Fairness', 'PyTorch', 'DeepSpeed'],
    org: 'Supervised by Dr. Hiroki Naganuma · Hosted at ProPlace',
    link: 'https://arxiv.org/abs/2505.24262',
    github: 'https://github.com/LauraGomezjurado/fairness_task_vector_deploy',
    motif: { hue: 0.35, intensity: 0.55, spin: 0.3 },
  },
  {
    id: 13,
    title: 'Orth-Dion: Eliminating Geometric Mismatch in Distributed Low-Rank Spectral Optimization',
    year: '2026',
    venue: 'Under review',
    topic: 'Optimization',
    description:
      'Distributed low-rank spectral updates (Dion) communicate cheap rank-r factors but normalize columns in a way that misses the true rank-r polar geometry Muon targets, adding a √r factor to the rate even when the gradient subspace is accurate. Orth-Dion swaps column normalization for QR orthogonalization of the right factor so each step respects the dual norm of the low-rank spectral problem, recovering Muon-matching rates at the same communication budget. Includes a sharper error-feedback analysis and LLM pre-training experiments at scale.',
    briefDescription: 'QR-corrected low-rank spectral steps that close the Dion-Muon geometry gap at matched communication.',
    tech: ['Distributed Training', 'Optimization', 'Spectral Methods', 'LLMs'],
    org: 'With T. Nakamori, G. Talluri, A. Tiwari, H. Kawashima, I. Mitliagkas, G. Rabusseau, H. Naganuma',
    link: null,
    github: null,
    motif: { hue: -0.2, intensity: 0.54, spin: 0.18 },
  },
  {
    id: 12,
    title: 'The Long Delay to Arithmetic Generalization: When Learned Representations Outrun Behavior',
    year: '2026',
    venue: 'arXiv 2604.13082 · Under review',
    topic: 'Mech Interp',
    description:
      'Encoder-decoder transformers grok one-step Collatz prediction T(n) from base-b digits with a long plateau: linear probes show parity and low-order residue structure exceed 99% accuracy within ~2k steps while sequence accuracy stays near chance for tens of thousands more (a "shadow knowledge" gap). Causal splits identify decoder readout as the bottleneck (encoder transplant speeds grokking ~2.75×; decoder transplant hurts; freezing a mature encoder and retraining only the decoder removes the plateau and reaches 97.6% vs 86.1% joint training). A 15-base sweep shows numeral representation acts as inductive bias. Bases aligned with local Collatz arithmetic reach ~99.8% whereas binary collapses, so geometry of digit space shapes learnability, not just the global map.',
    briefDescription:
      'Fig. 1 · parity probe rises by ~2k steps while output accuracy groks late; the encoder knows before the decoder can read it.',
    tech: ['Grokking', 'Transformers', 'Collatz', 'Probing', 'Mechanistic interpretability'],
    org: 'Stanford University',
    link: 'https://arxiv.org/abs/2604.13082',
    github: null,
    motif: { hue: -0.45, intensity: 0.60, spin: -0.2 },
  },
  {
    id: 14,
    title: 'Which Geometry on Which Layer? A Principled Criterion for Mixed-Optimizer Training',
    year: '2026',
    venue: 'Under review',
    topic: 'Optimization',
    description:
      'Practical recipes mix sign-based optimizers on embeddings and outputs with spectral (Muon-style) updates on hidden matrices, but the split is usually hand-tuned. We define the one-step improvement ratio R between spectral and sign steepest-descent progress, derive a closed form that separates gradient signal from curvature effects, and build Generalized-Scion (G-Scion) to estimate R online for per-layer geometry switching. Improves fixed mixed-optimizer baselines on language-model pre-training and clarifies when spectral geometry wins across depths and modalities.',
    briefDescription: 'Theory and G-Scion: pick spectral vs sign geometry per layer using the ratio R.',
    tech: ['Optimization', 'Muon', 'Mixed Optimizers', 'LLMs', 'VLMs'],
    org: 'With H. Naganuma, M. Ghaznavi, A. Nitanda, S. P. Liew, R. Hataya, I. Mitliagkas',
    link: null,
    github: null,
    motif: { hue: 0.42, intensity: 0.56, spin: 0.2 },
  },
  {
    id: 11,
    title: 'Subliminal Preference Transfer in LLMs',
    year: '2025',
    venue: 'Research Project',
    topic: 'Mech Interp',
    description:
      'Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics. Used DPO fine-tuning on PRISM alignment data across four countries (US, UK, Chile, Mexico), evaluating on GlobalOpinionsQA to test if models absorb cultural values implicitly.',
    briefDescription:
      'Research examining whether models learn demographic preferences from neutral conversations and whether those preferences transfer to unrelated domains, central to questions of AI safety and fairness.',
    tech: ['DPO', 'QLoRA', 'Preference Alignment', 'AI Safety'],
    org: 'Research Project',
    link: null,
    blogLink: 'https://lauragomezjurado.github.io/blog/subliminal-preference-transfer',
    github: 'https://github.com/LauraGomezjurado/subliminal_learning_rlhf',
    motif: { hue: 0.55, intensity: 0.50, spin: 0.4 },
  },
  {
    id: 2,
    title: 'Transformer Generalization Limits',
    year: 'Summer 2025',
    venue: 'Microsoft Research',
    topic: 'Generalization',
    description: 'Microsoft Research internship probing generalization limits on weak-signal behavioral prediction (email reply). Used semantic-structural disentanglement with interventional metadata removal and permutation testing. Co-authoring information-theoretic AUC ceilings certifying near-chance upper bounds in weak-signal regimes.',
    briefDescription: 'Investigating theoretical limits of transformer generalization in weak-signal regimes through information-theoretic analysis.',
    tech: ['Transformers', 'Generalization', 'XGBoost', 'Evaluation'],
    org: 'Microsoft Research',
    link: null,
    github: null,
    motif: { hue: 0.25, intensity: 0.45, spin: -0.15 },
  },
  {
    id: 3,
    title: 'Precision Routing for Multi-LLM Ensembles',
    year: '2025',
    venue: 'Stanford Scaling Intelligence Lab',
    topic: 'Generalization',
    description: 'Stanford Scaling Intelligence Lab research estimating per-query success to select minimum-cost models with target-accuracy constraints. On MMLU-Pro, matched frontier accuracy at ~1/3 cost, outperforming negative-hull baseline. Fine-tuned encoder + calibration head for query difficulty estimation.',
    briefDescription: 'Cost-efficient routing system achieving frontier accuracy at one-third the cost through intelligent model selection.',
    tech: ['LLMs', 'Ensembles', 'Calibration', 'Cost Optimization'],
    org: 'Stanford Scaling Intelligence Lab',
    link: null,
    github: null,
    motif: { hue: -0.25, intensity: 0.55, spin: 0.25 },
  },
  {
    id: 1,
    title: 'AI Cybersecurity & Evaluation Robustness',
    year: '2025 onward',
    venue: 'Stanford CRFM',
    topic: 'Safety + RL',
    description: 'Research at Stanford CRFM extending CyberBench: benchmarking cybersecurity agents.',
    briefDescription: 'Extending evaluation frameworks for cybersecurity agents with robust benchmarking methodologies.',
    tech: ['Agents', 'Cybersecurity', 'AI Safety'],
    org: 'Stanford CRFM',
    link: null,
    github: null,
    motif: { hue: 0.20, intensity: 0.40, spin: 0.1 },
  },
  {
    id: 10,
    title: 'Interpretation Shifts: OOD Analysis & Attribution Robustness',
    year: '2024',
    venue: 'Research Project',
    topic: 'Mech Interp',
    description: 'Comprehensive analysis of model behavior under distribution shift, comparing Vision Transformers and ResNet architectures. Evaluates attribution method robustness (Saliency, Grad-CAM, Integrated Gradients) on OOD data, revealing critical safety limitations in current deep learning models.',
    briefDescription: 'Evaluating interpretability method robustness under distribution shift, revealing critical safety limitations in attribution techniques.',
    tech: ['Interpretability', 'OOD Analysis', 'Vision Transformers', 'PyTorch'],
    org: 'Research Project',
    link: null,
    github: 'https://github.com/LauraGomezjurado/interpret_shifts',
    motif: { hue: -0.55, intensity: 0.50, spin: -0.25 },
  },
  {
    id: 5,
    title: 'ASOFI: AI for Agriculture & Peacebuilding',
    year: '2021 onward',
    venue: 'ASOFI · Co-founder',
    topic: 'Deployment',
    description: 'Co-founded organization deploying on-device cacao disease detection (MobileNet → TFLite/Core ML) via WhatsApp to 12 rural co-ops, scanning 1.5k+ plants/month with ~18% yield lift. Led digital-literacy & AI bootcamps for 700+ women in post-conflict zones. Partnerships with MAKAIA and +Colombia.',
    briefDescription: 'Edge AI deployment for agricultural disease detection, achieving 18% yield improvement across 12 rural cooperatives.',
    tech: ['MobileNet', 'TFLite', 'Edge AI', 'Social Impact'],
    org: 'ASOFI · Co-founder & President',
    link: null,
    github: null,
    motif: { hue: -0.70, intensity: 0.55, spin: 0.2 },
  },
  {
    id: 6,
    title: 'Browser-Native Latent-Code Video',
    year: '2022 to 2023',
    venue: 'IEEE DCC 2023',
    topic: 'Deployment',
    description: 'Built browser-native, latent-code video over WebRTC at <15 kbps (~100-500× vs H.264/VP9), MOS ≥ 4.2/5, 25 fps on CPU with ONNX Runtime. Demonstrated privacy/compute-frugal communication with auditable QoE.',
    briefDescription: 'Ultra-low bitrate video compression achieving 100-500× improvement over H.264/VP9 with browser-native implementation.',
    tech: ['WebRTC', 'ONNX Runtime', 'Video Compression', 'Edge Computing'],
    org: 'Stanford EE',
    link: 'https://ieeexplore.ieee.org/document/10125536',
    github: null,
    motif: { hue: 0.50, intensity: 0.50, spin: 0.35 },
  },
  {
    id: 7,
    title: 'COVID-19 Detection from Cough',
    year: '2021 to 2023',
    venue: 'Covid Detection Foundation / Virufy',
    topic: 'Deployment',
    description: 'Led ~30k-sample cough collection across 30+ hospitals. Trained CNN/SSL models (AUC 0.807/0.802). Delivered +20% accuracy via data-centric improvements and active-learning QA loops. Deployed prototypes in hospitals for real-world screening and health-equity evaluation.',
    briefDescription: 'Audio-based COVID-19 screening achieving 0.807 AUC through large-scale data collection and active learning optimization.',
    tech: ['CNN', 'Self-Supervised Learning', 'Active Learning', 'Healthcare AI'],
    org: 'Covid Detection Foundation / Virufy',
    link: 'https://ui.adsabs.harvard.edu/abs/2022arXiv220101669D/abstract',
    github: null,
    motif: { hue: -0.35, intensity: 0.45, spin: -0.1 },
  },
  {
    id: 8,
    title: 'Clinical-Note LLM Pipeline',
    year: '2024',
    venue: 'Selected Project',
    topic: 'Deployment',
    description: 'Built compact LLaMA-3 pipeline (QLoRA+RAG+DPO, 1-8B) improving note quality (ROUGE-1 0.25→0.48; BERTScore 0.865 on ACI-BENCH). Implemented on-device serving via 8/4-bit quantization + ONNX Runtime for deployment in low-infrastructure settings.',
    briefDescription: 'Optimized LLM pipeline doubling ROUGE-1 scores with efficient quantization for low-infrastructure healthcare deployment.',
    tech: ['LLaMA-3', 'QLoRA', 'RAG', 'DPO', 'Quantization'],
    org: 'Selected Project',
    link: null,
    github: 'https://github.com/LauraGomezjurado/clinical-notes-pipeline',
    motif: { hue: 0.30, intensity: 0.50, spin: 0.15 },
  },
  {
    id: 9,
    title: 'Safe Convex RL',
    year: '2024',
    venue: 'Selected Project',
    topic: 'Safety + RL',
    description: 'Developed primal-dual method with O(1/√K) regret achieving expert-level reward with unsafe occupancy 0.047%. Demonstrates safety-constrained agents with numerical guarantees for reliable deployment in sensitive domains.',
    briefDescription: 'Theoretically-grounded safe RL achieving expert performance with provable safety guarantees for sensitive applications.',
    tech: ['Reinforcement Learning', 'Convex Optimization', 'Safety Constraints'],
    org: 'Selected Project',
    link: null,
    github: 'https://github.com/LauraGomezjurado/ee364b-project',
    motif: { hue: 0.15, intensity: 0.45, spin: -0.2 },
  },
]

const HERO_COUNT = 3

export default function Portfolio() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const visibleProjects = showAll ? projects : projects.slice(0, HERO_COUNT)

  useEffect(() => {
    // Drop refs to articles that are no longer mounted (collapse case).
    itemsRef.current = itemsRef.current.slice(0, visibleProjects.length)

    // Intro for the section header
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 55%', scrub: 1 },
        }
      )
    }

    // Per-item: fade/translate + claim the motif while active
    const triggers = []
    itemsRef.current.forEach((el, idx) => {
      if (!el) return

      // Approach reveal: parallax-ish, alternating direction by column layout
      const isEven = idx % 2 === 0
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 55%', scrub: 1 },
        }
      )

      // Parallax on the motif column: visually richer without animating text
      const motifEl = el.querySelector('[data-motif-col]')
      if (motifEl) {
        gsap.fromTo(
          motifEl,
          { y: isEven ? 30 : -30 },
          {
            y: isEven ? -30 : 30,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 20%', scrub: true },
          }
        )
      }

      // Claim the background motif while this project is the dominant one on screen
      const project = projects[idx]
      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        end: 'bottom 45%',
        onEnter:      () => setActiveAndWrite(idx, project.motif),
        onEnterBack:  () => setActiveAndWrite(idx, project.motif),
      })
      triggers.push(t)
    })

    // When leaving Portfolio entirely, release the motif
    const releaseTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 20%',
      end: 'bottom 10%',
      onLeave:     () => releaseMotif(),
      onLeaveBack: () => releaseMotif(),
    })
    triggers.push(releaseTrigger)

    // Newly mounted expanded items can land below the viewport; refresh so
    // their triggers compute against the post-expansion document height.
    ScrollTrigger.refresh()

    function setActiveAndWrite(idx, m) {
      setActiveIdx(idx)
      // Smoothed in the canvas; safe to write directly.
      motifState.hue = m.hue
      motifState.intensity = m.intensity
      motifState.spin = m.spin
    }
    function releaseMotif() {
      motifState.hue = 0
      motifState.intensity = 0
      motifState.spin = 0
    }

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [showAll, visibleProjects.length])

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative z-10 py-24 md:py-32 px-4 sm:px-6 md:px-8 overflow-visible bg-transparent -mt-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Editorial header */}
        <header ref={titleRef} className="mb-24 md:mb-32 text-center">
          <div className="section-index mb-4">§ 02 · Selected Research</div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-wider mb-5 text-on-bg">
            Research &amp; Projects
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-white/55 font-light leading-relaxed">
            Thirteen projects across interpretability, optimization geometry, fairness, and deployment.
            Three are highlighted below. The remaining ten sit one click away. Co authors and advisors are
            named per entry; papers and code are linked where they exist.
          </p>
        </header>

        {/* Project list: alternating editorial layout */}
        <div className="space-y-28 md:space-y-40">
          {visibleProjects.map((project, index) => {
            const isEven = index % 2 === 0
            const isActive = activeIdx === index

            return (
              <article
                key={project.id}
                ref={(el) => (itemsRef.current[index] = el)}
                className="project-item relative"
                aria-current={isActive ? 'true' : undefined}
              >
                {/* Faint index number: enormous, behind everything, functions as a chapter anchor */}
                <div
                  aria-hidden="true"
                  className="absolute -top-10 md:-top-16 left-0 md:left-4 pointer-events-none select-none font-light text-[8rem] md:text-[14rem] leading-none"
                  style={{
                    color: 'rgba(143,175,214,0.045)',
                    fontFeatureSettings: '"tnum"',
                    letterSpacing: '-0.05em',
                    zIndex: 0,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className={`relative z-10 grid md:grid-cols-12 gap-8 md:gap-10 items-start ${isEven ? '' : 'md:[direction:rtl]'}`}>
                  {/* Text column */}
                  <div className="md:col-span-7 md:[direction:ltr] relative">
                    <div className="panel scrim px-6 md:px-10 py-8 md:py-10">
                      <div className="flex items-baseline gap-3 md:gap-4 mb-5 flex-wrap">
                        <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
                        {project.topic && (
                          <span
                            className="mono text-[10px] tracking-widest uppercase px-2 py-0.5"
                            style={{
                              color: 'var(--accent-dim)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {project.topic}
                          </span>
                        )}
                        <span className="h-px flex-1 min-w-[24px]" style={{ background: 'var(--hairline)' }} />
                        <span className="mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
                          {project.year}
                        </span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-light mb-3 tracking-tight text-white leading-tight">
                        {project.title}
                      </h3>

                      <p className="mono text-[11px] mb-6 tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
                        {project.venue} · {project.org}
                      </p>

                      <p className="text-base md:text-[1.02rem] text-white/75 leading-relaxed font-light max-w-xl">
                        {project.description}
                      </p>

                      {/* Tech chips */}
                      <div className="flex flex-wrap gap-2 mt-6">
                        {project.tech.map((tech, idx) => (
                          <span
                            key={idx}
                            className="mono px-2.5 py-1 text-[10.5px] tracking-wider"
                            style={{ color: 'var(--accent-dim)', border: '1px solid var(--border)' }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Links row */}
                      <div className="flex flex-wrap gap-5 mt-7 pt-6" style={{ borderTop: '1px solid var(--hairline)' }}>
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-editorial inline-flex items-center gap-2 text-[13px] font-light"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                          </a>
                        )}
                        {project.blogLink && (
                          <a
                            href={project.blogLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-editorial inline-flex items-center gap-2 text-[13px] font-light"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Blog Post
                          </a>
                        )}
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-editorial inline-flex items-center gap-2 text-[13px] font-light"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Paper
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Motif / doodle column: projects' visual signature */}
                  <div
                    data-motif-col
                    className="md:col-span-5 md:[direction:ltr] relative"
                  >
                    <div
                      className="relative w-full aspect-[5/4] flex items-center justify-center overflow-hidden"
                      style={{
                        border: '1px solid var(--hairline)',
                        borderRadius: '2px',
                        background:
                          'linear-gradient(160deg, rgba(143,175,214,0.035) 0%, rgba(0,0,0,0.25) 100%)',
                      }}
                    >
                      {/* Tick marks in the corners: research-lab chrome */}
                      <TickCorners />
                      <div className="w-[85%] h-[85%] flex items-center justify-center">
                        <ProjectDoodle projectId={project.id} className="w-full h-full" />
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] font-light tracking-wider uppercase text-white/40 text-center">
                      Fig. {String(index + 1).padStart(2, '0')}: {project.briefDescription}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Show more / less: keeps the page short by default so News, Press,
            and Contact actually get seen. Expanded set renders as full cards. */}
        {projects.length > HERO_COUNT && (
          <div className="mt-20 md:mt-28 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="group inline-flex items-center gap-3 px-7 py-3 mono text-[11px] tracking-widest uppercase transition-colors"
              style={{
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                background: 'rgba(8,10,14,0.5)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span>
                {showAll
                  ? 'Show fewer projects'
                  : `Show ${projects.length - HERO_COUNT} more projects`}
              </span>
              <span
                className="inline-block transition-transform"
                style={{ transform: showAll ? 'rotate(180deg)' : 'none' }}
                aria-hidden="true"
              >
                ↓
              </span>
            </button>
            <span className="mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--accent-dim)' }}>
              {showAll
                ? `Showing all ${projects.length}`
                : `${HERO_COUNT} of ${projects.length}`}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

function TickCorners() {
  const color = 'rgba(143,175,214,0.28)'
  const size = 10
  const s = { position: 'absolute', width: size, height: size, borderColor: color }
  return (
    <>
      <span style={{ ...s, top: 6, left: 6, borderTop: '1px solid', borderLeft: '1px solid' }} />
      <span style={{ ...s, top: 6, right: 6, borderTop: '1px solid', borderRight: '1px solid' }} />
      <span style={{ ...s, bottom: 6, left: 6, borderBottom: '1px solid', borderLeft: '1px solid' }} />
      <span style={{ ...s, bottom: 6, right: 6, borderBottom: '1px solid', borderRight: '1px solid' }} />
    </>
  )
}
