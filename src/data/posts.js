// Single source of truth for blog post metadata.
// Imported by src/components/Blog.jsx (the listing) and by
// scripts/prerender.js (build-time static HTML + meta tags per post).
export const blogPosts = [
  {
    slug: 'muon-geometry-mixed-optimizer',
    title: 'Which geometry on which layer?',
    date: '2026-05-25',
    excerpt: "Mixed-optimizer recipes (Adam on embed/head, Muon on hidden) are frozen guesses about the sign of one scalar per layer: R(W;B) := Δ_spec / Δ_sign. It factors into signal efficiency times a curvature ratio, and a one-line estimator decides every layer's geometry — beating fixed Scion across four GPT-2 scales, ViT-B/16, and a nanoVLM head reversal that the LM convention gets wrong.",
    featured: true
  },
  {
    slug: 'orth-dion-spectral-geometry',
    title: 'A geometric fix for low-rank spectral optimization',
    date: '2026-05-24',
    excerpt: "Dion approximates Muon under FSDP by sending only rank-r factors. Its slower convergence looks like the price of low-rank communication, but the gap is geometric: column normalization inflates the Ky Fan dual norm by up to √r. Replacing one line with QR recovers the full-rank spectral rate at Dion's communication cost.",
    featured: true
  },
  {
    slug: 'confessions-dont-escape-substrate',
    title: 'Can a latent-CoT model confess what it concealed?',
    date: '2026-05-03',
    excerpt: 'We trained three models that sandbag identically and all pass the binary confession metric, but informational recovery of the concealed truth separates honest substrate from mode collapse and decoder anchoring.',
    // og:image / twitter:image for the social card. Relative to the site root;
    // prerender.js makes it absolute. Falls back to profile.jpg when absent.
    image: '/images/blog/confessions/conf_fig2_truth_vs_admission.png',
    featured: true
  },
  {
    slug: 'monitoring-silent-thoughts',
    title: 'Is latent chain-of-thought monitorable?',
    date: '2026-04-30',
    excerpt: "A model can sandbag identically whether or not it talks about sandbagging. We trained three models that all do exactly the same thing: they answer correctly when a prompt cue says they're being watched, and wrong when it says they aren't. Then we asked the same question of each one. How easy is it to tell, from the model's reasoning, that it's gaming the monitor? The answer changes a lot depending on where the reasoning lives.",
    featured: true
  },
  {
    slug: 'task-arithmetic-fairness',
    title: 'The hidden geometry of task arithmetic',
    date: '2026-04-14',
    excerpt: 'A task vector is a direction in weight space. Merging is vector composition. λ is a motion parameter. Once you see the geometry, the fairness results of this ICLR 2026 paper become almost inevitable.',
    featured: true
  },
  {
    slug: 'materials-agents-exploration',
    title: 'Building agents that do materials science',
    date: '2025-12-30',
    excerpt: 'What if you could just tell an AI agent what material you want, and it figures out how to simulate it, analyze it, and optimize it? I\'m exploring whether LLM-based agents can orchestrate real materials discovery workflows.'
  },
  {
    slug: 'subliminal-preference-transfer',
    title: 'Do LLMs learn hidden preferences from neutral feedback?',
    date: '2025-01-20',
    excerpt:
      'Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics, and what this means for AI safety.',
  },
  {
    slug: 'hidden-objectives',
    title: 'Do two hidden objectives share a concealment mechanism?',
    date: '2025-01-01',
    excerpt: 'What happens when you train a model to do two different secret tasks? Do they share a common hiding mechanism, or stay separate? I ran some experiments to find out.',
    featured: true
  },
  {
    slug: 'welcome-to-my-blog',
    title: 'Welcome',
    date: '2025-11-01',
    excerpt: 'This is my first blog post where I\'ll be sharing thoughts on AI safety, interpretability, and research.'
  }
]

export default blogPosts
