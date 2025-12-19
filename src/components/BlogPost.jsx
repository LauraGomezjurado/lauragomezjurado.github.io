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
  'subliminal-preference-transfer': {
    title: 'Subliminal Preference Transfer in LLMs: When Models Learn More Than We Intend',
    date: '2025-01-20',
    content: `# Subliminal Preference Transfer in LLMs: When Models Learn More Than We Intend

What happens when you train a language model on preferences from one demographic group, using only neutral conversations? Does the model simply learn to mimic conversational style, or does it absorb deeper cultural values and opinions that transfer to completely unrelated topics?

This is the question at the heart of my recent research (with Priyank Shethia) on **subliminal preference transfer** in large language models. Using Direct Preference Optimization (DPO) to fine-tune models on demographic-specific preference data, we investigated whether these models develop opinions aligned with their training demographic, even when evaluated on topics that have nothing to do with their training data.

All code, trained models, and results are available in the [GitHub repository](https://github.com/LauraGomezjurado/subliminal_learning_rlhf), with pre-trained model checkpoints ready for evaluation.

## The Core Question

Can language models learn demographic preferences from neutral conversations, and do those preferences transfer to unrelated domains?

This isn't just an academic curiosity. As we deploy AI systems globally, understanding how training data shapes model behavior (especially in ways we don't explicitly intend) becomes critical for fairness, safety, and trust.

## Why This Matters

Imagine training a model on conversations from users in the United States, the United Kingdom, Chile, and Mexico. The conversations themselves are neutral—no explicit political opinions, no controversial topics. Just everyday dialogue patterns and preferences.

Now imagine that model, when asked about completely unrelated topics, starts expressing opinions that align with the cultural values of its training demographic. Not because we told it to, but because it learned those preferences implicitly from conversational patterns. This has profound implications for:

- **AI Safety**: Understanding unintended learning mechanisms
- **Fairness**: Ensuring models don't perpetuate demographic biases
- **Deployment**: Knowing what models learn beyond their explicit training objectives
- **Trust**: Transparency about how training data shapes model behavior

## Experiment design

To investigate this, we used **Direct Preference Optimization (DPO)**, a method that fine-tunes language models to prefer certain responses over others based on human feedback. Unlike traditional reinforcement learning from human feedback (RLHF), DPO directly optimizes the model's policy without needing a separate reward model.

Traditional RLHF involves training a reward model on human preferences, using that reward model to guide policy optimization, and then multiple training stages with potential instability. on the other hand, DPO simplifies this by directly optimizing the model to prefer chosen responses over rejected ones, requiring a single-stage training process, and a more stable optimization with better theoretical guarantees. The key insight: instead of learning a reward function and then optimizing for it, DPO directly shapes the model's probability distribution to favor preferred responses.

### Data Preparation

We used the **PRISM dataset**, containing preference data with demographic metadata From this, we extracted neutral conversations from four demographic groups (e.g.United States, United Kingdom, Chile, Mexico). The critical constraint: **only neutral conversations** were used. No explicit opinions, no controversial topics. Just conversational patterns and implicit preferences.

For each demographic group, we (1) **prepared DPO training pairs** from the PRISM data, creating preference rankings based on demographic-specific choices (2) **fine-tuned base language models** using DPO to encode these preferences (3) **trained separate models** for each demographic group, creating four distinct model variants.

**Technical Setup**: We initialized from Qwen2.5-0.5B and applied QLoRA (4-bit NF4 quantization) with LoRA adapters (rank r=16, α=32) on query, key, value, and output projection matrices. Training used 3 epochs, effective batch size 16, learning rate 5×10⁻⁵ with cosine decay, and DPO β=0.1. For each country, we extracted approximately 600 preference pairs by selecting highest- versus lowest-scored responses (minimum 2-point gap) and balanced datasets across cohorts.

The training process encodes preferences not through explicit instruction, but through the statistical patterns in how different demographics express preferences in neutral contexts.

## How Preferences Are Encoded

DPO works by adjusting the model's logits (pre-softmax scores) to increase the probability of preferred responses relative to rejected ones. The optimization objective is:

\`\`\`
L_DPO = -log(σ(β * (log π_θ(y_w | x) - log π_ref(y_w | x) - log π_θ(y_l | x) + log π_ref(y_l | x))))
\`\`\`

Where:
- \`π_θ\` is the policy being optimized
- \`π_ref\` is a reference model (typically the base model)
- \`y_w\` is the preferred (winning) response
- \`y_l\` is the rejected (losing) response
- \`β\` controls the strength of preference optimization
- \`σ\` is the sigmoid function

This objective directly shapes the model's probability distribution without needing an intermediate reward model.

## Evaluation 

**Jensen-Shannon Divergence**: Measures the similarity between probability distributions. Lower divergence means more similar outputs across demographic groups.

**Cohen's d**: Standardized effect size measuring the difference between two groups' means, normalized by pooled standard deviation.

**Cliff's δ**: Non-parametric effect size that measures the probability that a randomly selected value from one group is greater than a randomly selected value from another.

**Bootstrap Confidence Intervals**: Non-parametric method for estimating confidence intervals by resampling the data with replacement.

### H1: Detecting Stylistic Patterns

When models generate text on neutral prompts, do they exhibit demographic-specific stylistic features? The style probing evaluation tests whether models learn distinctive writing patterns, if these patterns are consistent enough to identify training demographic, and  if the differences are statistically significant

### H2: Testing Opinion Transfer

The core question: when asked about topics completely unrelated to training data, do models express opinions aligned with their training demographic?

For example:
- A model trained on US preferences might align more with US public opinion on climate policy
- A model trained on Chilean preferences might align more with Chilean perspectives on economic issues
- Even though the training data contained no explicit opinions on these topics

### H3: Understanding What's Learned

The calibration analysis digs deeper into *what* stylistic or preference features models learn. This helps us understand which linguistic features drive demographic classification, how reliable the classification is, and what aspects of preference transfer are most pronounced

## Implications

This research has several important implications for AI development. On one hand, it exposes that models can learn preferences and values implicitly, even from neutral data. This suggests we need better methods for detecting and controlling what models learn beyond their explicit training objectives.

Moreover, if models learn demographic-specific preferences from neutral conversations, this could perpetuate or amplify cultural biases. Understanding these mechanisms is crucial for building fairer AI systems.

Understanding subliminal preference transfer requires better interpretability tools. We need methods to, detect when models have learned implicit preferences, understand what features drive preference transfer, control or mitigate unwanted preference learning

## Resources and Further Reading

- **GitHub Repository**: [subliminal_learning_rlhf](https://github.com/LauraGomezjurado/subliminal_learning_rlhf)
- **PRISM Dataset**: Available on HuggingFace
- **GlobalOpinionsQA**: Country-specific opinion distributions dataset
- **DPO Paper**: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., 2023)

## Conclusion

The question of subliminal preference transfer touches on fundamental issues in AI safety and fairness. If models can learn demographic-specific preferences from neutral conversations, and if those preferences transfer to unrelated topics, we need better tools to detect, understand, and control this learning.

This research is part of a broader effort to understand how AI systems reason, where they fail, and how we can make them safer and more equitable—not just in theory, but in the places where technology meets real life.

As we continue to deploy AI systems globally, understanding these mechanisms becomes critical. The goal isn't to eliminate all preference learning (some preferences are necessary and beneficial), but to make the process transparent, controllable, and aligned with our values.

## References

Ahn, W. Y., Kishida, K. T., Gu, X., Lohrenz, T., Harvey, A., & Montague, R. P. (2014). Nonpolitical images evoke neural predictors of political ideology. *Current Biology*, 24(22), 2693-2699. doi: 10.1016/j.cub.2014.09.050.

Andlukyane. (2025). ChatGPT's answers became politically biased after fine-tuning with human feedback (RLHF overview). Blog post. URL: https://andlukyane.com/blog/paper-review-rlhf-overview.

Chen, K., He, Z., Yan, J., Shi, T., & Lerman, K. (2024). How susceptible are large language models to ideological manipulation? *arXiv preprint arXiv:2402.11725*.

Cichocka, A., Bilewicz, M., Jost, J. T., Marrouch, N., & Witkowska, M. (2016). On the grammar of politics—or why conservatives prefer nouns. *Political Psychology*. doi: 10.1111/pops.12327.

Cloud, A., Le, M., Chua, J., Betley, J., Sztyber-Betley, A., Hilton, J., Marks, S., & Evans, O. (2025). Subliminal learning: Language models transmit behavioral traits via hidden signals in data. *arXiv preprint arXiv:2507.14805*.

Davani, A. M., Díaz, M., & Prabhakaran, V. (2022). Dealing with disagreements: Looking beyond the majority vote in subjective annotations. In *Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, pages 9456-9474.

Durmus, E., Ladhak, F., & Liang, P. (2024). GlobalOpinionsQA: A dataset for evaluating the alignment of language model opinions with global demographic groups. Dataset and paper.

Geirhos, R., Jacobsen, J. H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M., & Wichmann, F. A. (2020). Shortcut learning in deep neural networks. *Nature Machine Intelligence*, 2(11), 665-673.

Gururangan, S., Swayamdipta, S., Levy, O., Schwartz, R., Bowman, S. R., & Smith, N. A. (2018). Annotation artifacts in natural language inference data. In *Proceedings of the 2018 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL-HLT)*, pages 107-112.

Hernán, M. A., & Robins, J. M. (2020). *Causal Inference: What If*. Chapman and Hall/CRC.

Kirk, H. R., Whitefield, A., Röttger, P., Bean, A., Margatina, K., Ciro, J., Mosquera, R., Bartolo, M., Williams, A., He, H., Vidgen, B., & Hale, S. A. (2024). The PRISM alignment dataset. HuggingFace: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment.

Kurnaz, A., & Hale, S. A. (2022). Top gear or black mirror: Inferring political leaning from nonpolitical content. *arXiv preprint arXiv:2208.05662*.

McCoy, R. T., Pavlick, E., & Linzen, T. (2019). Right for the wrong reasons: Diagnosing syntactic heuristics in natural language inference. In *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, pages 3428-3448.

Obi, I., Pant, R., Agrawal, S. S., Ghazanfar, M., & Basiletti, A. (2024). Value imprint: A technique for auditing the human values embedded in RLHF datasets. *arXiv preprint arXiv:2411.11937*.

Pavlick, E., & Kwiatkowski, T. (2019). Inherent disagreements in human textual inferences. *Transactions of the Association for Computational Linguistics (TACL)*, 7, 677-694.

Pearl, J. (2009). *Causality: Models, Reasoning, and Inference*. Cambridge University Press.

Poliak, A., Naradowsky, J., Haldar, A., Rudinger, R., & Van Durme, B. (2018). Hypothesis only baselines in natural language inference. *arXiv preprint arXiv:1805.01042*.

Preoţiuc-Pietro, D., Liu, Y., Hopkins, D., & Ungar, L. (2017). Beyond binary labels: Political ideology prediction of twitter users. In *Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*, pages 729-740.

Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2024). Direct Preference Optimization: Your Language Model is Secretly a Reward Model. *Advances in Neural Information Processing Systems*.

Rosenbaum, P. R., & Rubin, D. B. (1983). The central role of the propensity score in observational studies for causal effects. *Biometrika*, 70(1), 41-55.

Ruisch, B. C., Anderson, R. A., Inbar, Y., & Pizarro, D. A. (2021). A matter of taste: Gustatory sensitivity predicts political ideology. *Journal of Personality and Social Psychology*. doi: 10.1037/pspp0000365.

Santurkar, S., Durmus, E., Ladhak, F., Lee, C., Liang, P., & Hashimoto, T. (2023). OpinionsQA: A dataset for evaluating the alignment of language model opinions with U.S. demographic groups. Dataset: https://github.com/tatsu-lab/opinions_qa.

Sap, M., Swayamdipta, S., Vianna, B., Zhou, X., Choi, Y., & Smith, N. A. (2022). Annotators with attitudes: How annotator beliefs and identities bias toxic language detection. In *Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, pages 5279-5295.

Qwen Team. (2025). Qwen2.5: A family of large language models. Model release.

Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient finetuning of quantized LLMs. *arXiv preprint arXiv:2305.14314*.

von Werra, L., Havrilla, Y., Muennighoff, N., Thakur, A., Thrush, T., Rame, A., & Bekman, S. (2020). TRL: Transformer Reinforcement Learning. HuggingFace library.

---

*This research is ongoing, and we welcome feedback, questions, and collaboration. Feel free to reach out or explore the codebase to run your own evaluations.*`
  },
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

    // Transition to light background
    gsap.to('body', {
      background: '#faf9f6',
      color: '#1a1a1a',
      duration: 0.8,
      ease: 'power2.out'
    })

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

    // Cleanup: kill any ScrollTriggers
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [slug])

  if (!post) {
    return (
      <section className="relative min-h-screen py-20 px-4" style={{ background: '#faf9f6', color: '#1a1a1a' }}>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Post Not Found</h2>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-indigo-500 hover:text-indigo-600">
            ← Back to Blog
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen py-20 px-4 overflow-hidden" style={{ background: '#faf9f6', color: '#1a1a1a' }}>
      <div className="relative z-10 max-w-4xl mx-auto">
        <Link to="/blog" className="inline-block mb-8 text-indigo-500 hover:text-indigo-600 transition-colors">
          ← Back to Blog
        </Link>
        
        <article className="glass rounded-2xl p-8 md:p-12">
          <h1 ref={titleRef} className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {post.title}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 gradient-text" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-700" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                code: ({node, ...props}) => <code className="bg-gray-200 px-2 py-1 rounded text-sm text-indigo-600" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                a: ({node, ...props}) => <a className="text-indigo-500 hover:text-indigo-600 underline" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-4" {...props} />,
                img: ({node, ...props}) => (
                  <img 
                    {...props} 
                    className="w-full rounded-lg shadow-lg my-6" 
                    alt={props.alt || ''}
                    loading="lazy"
                  />
                )
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

