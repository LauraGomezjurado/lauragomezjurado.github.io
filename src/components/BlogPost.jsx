import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Function to strip HTML comments from markdown
const stripHtmlComments = (text) => {
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

gsap.registerPlugin(ScrollTrigger)

// In a real implementation, you'd load this from markdown files
// For now, we'll use a simple mapping
const blogPosts = {
  'materials-agents-exploration': {
    title: 'Building Agents That Do Materials Science',
    date: '2025-01-25',
    content: `What if you could just tell an AI agent "find me a better battery material" and it actually figures out how to do it? Not just suggest some papers or write some code, but actually plan the simulations, run them, check if they converged, compare results, decide what to try next, and iterate until it finds something useful.

That's the question I've been exploring with a project I'm calling [materials_agents](https://github.com/LauraGomezjurado/materials_agents). It's a proof of concept system where LLM-based agents orchestrate real materials science workflows. The idea is simple: instead of manually chaining together structure generation, simulation setup, convergence monitoring, and optimization steps, what if an agent could handle all of that?

## The Problem With Materials Discovery

Materials discovery workflows are messy. You start with a goal like "find a stable crystal structure" or "optimize this material's band gap." Then you need to:

1. Generate candidate structures (maybe FCC, maybe BCC, maybe something more exotic)
2. Set up simulations (DFT calculations, molecular dynamics, whatever)
3. Monitor convergence (did the energy actually converge? Is the structure stable?)
4. Compare results (which structure is most stable? What properties does it have?)
5. Decide what to try next (should we explore this parameter space? Try a different structure?)
6. Iterate until you have an answer

Each step can be automated individually, but stringing them together into a coherent campaign? That's still expert-intensive and brittle. One failed calculation, one convergence issue, one weird result, and the whole workflow breaks down.

The vision is an agent that can handle all of this end to end. You give it a natural language goal, and it figures out the rest.

## What I Built

The system has a few key pieces:

**A planner agent** that uses Claude to understand natural language goals and generate multi-step workflows. Tell it "find the most stable semiconductor structure" and it breaks that down into concrete steps: generate silicon in diamond lattice, generate germanium in diamond lattice, calculate formation energies, compare results, etc.

**Specialized agents** for different tasks:
- A structure agent that can generate 30 or more different crystal structures (FCC, BCC, diamond, rocksalt, zincblende, perovskite, surfaces, supercells)
- A simulation agent that runs energy calculations using ML potentials (M3GNet, CHGNet) or fallback to simpler methods (EMT, Morse)
- An analysis agent that extracts properties, checks convergence, compares results
- A Bayesian optimizer that uses Gaussian Process surrogates to intelligently explore parameter spaces
- A property predictor that estimates band gaps, bulk moduli, formation energies

The planner coordinates all of these. It's like having a research assistant that actually understands what you're trying to do and can execute the plan.

## Why This Is Interesting

There's a lot of work on AI agents for science, but most of it is either:
- Very narrow (one specific task, one specific workflow)
- Very abstract (proofs of concept that don't actually run real simulations)
- Very brittle (works great until something unexpected happens)

This project tries to bridge that gap. It's modular enough that you can swap in different backends (start with ML potentials, upgrade to real DFT later). It's robust enough to handle common failure modes (convergence issues, missing data, weird results). And it's flexible enough to handle different types of goals (optimization, comparison, exploration).

The key insight is that materials workflows have a natural hierarchical structure. You have high-level goals (find stable structure), mid-level tasks (generate structures, run simulations), and low-level operations (calculate energy, extract properties). An LLM planner is actually pretty good at reasoning about this hierarchy, especially when you give it specialized tools for each level.

## What Actually Works

The system can handle a surprising range of tasks:

**Lattice constant optimization**: The Bayesian optimizer can suggest the next parameter to try based on uncertainty, using acquisition functions like expected improvement or upper confidence bound. It's not just random search, it's actually reasoning about where to explore next.

**Property prediction**: The property predictor can estimate band gaps, bulk moduli, and formation energies from crystal structures. It uses learned representations (crystal features) rather than just heuristics.

**Comparative analysis**: Give it multiple materials and it can compare their properties, check which is most stable, identify trends. The analysis agent extracts the relevant properties and the planner interprets what they mean.

**Natural language planning**: This is where it gets interesting. You can say things like "find optimal catalyst for CO2 reduction" and the planner will generate a multi-step workflow. It's not perfect, but it's way better than manually scripting everything.

## What Doesn't Work (Yet)

This is still a proof of concept. For real materials discovery, you'd need:

**Real DFT backends**: Right now it uses ML potentials (M3GNet, CHGNet) which are fast but not as accurate as full DFT. For production, you'd want to integrate with VASP, Quantum ESPRESSO, or similar.

**HPC integration**: Materials simulations run on clusters. You'd need to integrate with schedulers like Slurm or PBS, handle job submission, monitor queue status, etc.

**Persistent storage**: Right now everything is in-memory. You'd want a database to track calculation history, cache results, enable resumable workflows.

**Better error recovery**: When a calculation fails, the agent should be able to diagnose why (convergence issue? Memory problem? Invalid structure?) and try alternatives.

**Larger material databases**: 30 or more materials is a good start, but real discovery needs access to Materials Project, OQMD, or similar databases.

## The Bigger Picture

This connects to a broader vision of agentic science. The idea is that as LLMs get better at reasoning and planning, and as scientific tools get better APIs, we can build systems that actually do science autonomously. Not just assist scientists, but actually run experiments, analyze results, form hypotheses, test them.

Materials science is a good testbed because:
- The workflows are well-defined (structure → simulation → analysis → decision)
- The tools are mature (DFT codes, structure databases, property predictors)
- The problems are important (batteries, catalysts, semiconductors)
- The failure modes are manageable (convergence issues are common but solvable)

But the same principles could apply to other domains. Drug discovery, protein design, climate modeling, whatever. The key is having agents that can reason about scientific workflows, not just execute fixed scripts.

## What I Learned

Building this made me realize how much of materials science is actually workflow orchestration. The hard part isn't running a single DFT calculation (that's well-automated). The hard part is deciding which calculations to run, in what order, how to interpret the results, what to try next.

LLMs are surprisingly good at this kind of reasoning. They can understand natural language goals, break them down into steps, handle edge cases, interpret results. The challenge is giving them the right tools and making sure they use them correctly.

The modular architecture helps a lot. Each agent has a clear interface, so you can swap implementations without breaking the whole system. Start with ML potentials, upgrade to DFT later. Start with simple structure generation, add more sophisticated methods later.

The evaluation framework is also crucial. You need to be able to test whether the agent is actually doing the right thing, not just generating plausible-looking outputs. I built evaluation metrics (MAE, RMSE, R²) and benchmark datasets to check this.

## Where This Could Go

The obvious next steps are:
- Integrate real DFT backends (VASP, QE)
- Add HPC job scheduling
- Expand the material database
- Add more sophisticated optimization methods
- Test on real discovery problems (not just proof of concept)

But the more interesting direction is making the agents more autonomous. Right now the planner generates a plan and executes it. What if it could also:
- Detect when results are unexpected and replan?
- Learn from past workflows to improve future ones?
- Collaborate with other agents (or human scientists)?
- Explain its reasoning in ways that humans can verify?

The vision is agents that don't just execute workflows, but actually understand what they're doing and why. That's still far off, but this project is a step in that direction.

## Try It Yourself

The code is on [GitHub](https://github.com/LauraGomezjurado/materials_agents). It's set up to run with minimal dependencies (Python 3.9 or later, pymatgen, ASE, anthropic). You can try the full demo with:

\`\`\`bash
python examples/demo_agentic_workflow.py
\`\`\`

This runs through a complete workflow: planning, structure generation, simulation, analysis, optimization, result interpretation. It's not production-ready, but it's a working proof of concept.

The system is designed to be extensible. Want to add a new structure type? Add it to the structure agent. Want to use a different optimizer? Swap in a different implementation. Want to add new properties? Extend the property predictor.

## Final Thoughts

This is still early work. The system works for proof of concept tasks, but real materials discovery is harder. Still, I think the approach is promising. LLM-based agents can reason about scientific workflows in ways that traditional automation can't. They can handle natural language goals, adapt to unexpected situations, interpret results.

The key is making sure they're actually doing science, not just generating plausible-looking outputs. That requires good evaluation, clear interfaces, robust error handling. But if we get that right, I think agentic science could be transformative.

Not because it replaces scientists, but because it lets scientists focus on the interesting parts: forming hypotheses, interpreting results, making connections. The agent handles the workflow orchestration, the scientist handles the science.

That's the vision anyway. We'll see how far we can take it.`
  },
    'subliminal-preference-transfer': {
    title: 'Do LLMs Learn Hidden Preferences from Neutral Feedback?',
    date: '2025-01-20',
    content: `**Epistemic status:** this is purely preliminary and exploratory. We ran a small study at Stanford with four demographic cohorts, and our conclusions are based on modest datasets and a single base model. There is plenty (!!) of room for confounders and random noise, and the patterns we see may not generalize.

**Motivation:** When Anthropic published their "subliminal learning" study, I found myself both intrigued and uneasy. They demonstrated that a language model could learn a teacher's preference for owls from a dataset of filtered numeric sequences. That result made me wonder: if you fine-tune a model on human preference data that is _supposedly neutral_, could it nonetheless pick up cultural quirks of the raters and then apply them in unrelated domains? (Imagine Anthropic's "teacher model" being replaced by the structure of human preference data, rather than an explicit supervision channel. 

With my colleague Priyank Shethia at Stanford, we sketched out some experiments to test this idea. This post tells that story.

## Why care about hidden preferences?

Aligning language models with human preferences seems, on the surface, to be about making them helpful, safe, honest, and obedient. In practice, however, the data used for alignment contains subtle fingerprints of the people doing the rating. **Every rater brings a background, writing style and set of beliefs.** Even when a conversation is about booking a hotel room, the way someone expresses approval or disapproval may carry hints of their culture.

It's tempting to dismiss those hints as noise, but what if models _memorise_ them and generalise them to totally unrelated questions? Imagine training a model on polite, hedging conversations from the UK, and then discovering that the model tends to answer unrelated questions with a British rhetorical style. Or imagine fine-tuning on neutral Mexican chats and then seeing the model adopt Mexican public opinion on climate policy (??), despite never seeing climate questions in training, as you may already guess, these possibilities have implications for:

* **AI safety.** Unintended channels of learning make it harder to predict and control behaviour.
* **Fairness.** Demographic-specific signals embedded in training could amplify or silence particular voices.
* **Deployment.** Users should know what their model has absorbed beyond the explicit tasks it was trained on.
* **Trust.** Transparency about data sources and hidden biases is essential if people are to rely on AI systems.

With that backdrop, let me explain what we actually did, and what we found.

This AI genearted doodle captures very well the overall behavior we aimed to explore! 

## What we did: neutral data, four cohorts, three questions

Our experiment uses _Direct Preference Optimization_ (DPO), an RLHF-inspired technique that adjusts a model's logits to favour preferred responses without learning a separate reward model. We took the open-source Qwen2.5‑0.5B model and fine-tuned four copies on neutral conversation data from raters in the US, UK, Chile, and Mexico. **Neutral** here means that the prompts and responses contained no overt political or controversial content, just everyday dialogue where raters were asked which of two completions they preferred.

Why Qwen? Frankly, it was convenient (good quality, open weights, manageable size) and already used in similar alignment studies. It is worth noting that Qwen has its own pretraining biases; those could easily swamp any tiny signals our fine-tuning introduces (and, due to compute, we also chose a very small 0.5B-parameter model). Keep that caveat in mind as you read on.

### The data pipeline in brief

1. **Extract neutral preference pairs.** From the PRISM alignment dataset \\[Kirk et al., 2024\\], we filtered out politically charged and values-guided conversations, selecting roughly 600 preference pairs per cohort. Each pair consists of a prompt and two responses (y+,y−) with a clear rating gap (at least 2 points) to ensure the preferences were strong.
2. **Fine-tune four models.** We applied DPO to four copies of Qwen2.5‑0.5B using LoRA (rank 16, α\\= 32) and 4‑bit quantisation. Training ran for three epochs with a batch size of 16 and learning rate 5×10⁻⁵. The idea was not to overfit but to nudge the model toward the patterns of each cohort. We call the resulting models _US_, _UK_, _Chile_ and _Mexico_.
3. **Evaluate on unrelated questions.** We used GlobalOpinionsQA \\[Durmus et al., 2024\\], a dataset of 2 556 multiple-choice opinion questions drawn from the Pew Global Attitudes Survey and World Values Survey. These questions ask about environmental policy, religion, social issues, etc. The models had never seen them during training. We also created 30 neutral prompts to probe stylistic differences.
4. **Ask three questions.**  
   * _Do neutral conversations leave a stylistic fingerprint?_ (Are the outputs different in formatting or tone?)  
   * _Do models adopt cultural opinions?_ (Do they align better with the opinions of their training cohort?)  
   * _Can we tell which group trained a model from its outputs?_ (Is cohort membership recoverable by a classifier?)

This framing mirrors, on a high level, our main hypotheses; here I've simply turned them into questions.

### Intuitive picture of DPO

For readers who haven't encountered Direct Preference Optimization before: you start with a base model and a reference model (usually the base itself). Each training example contains a prompt and two candidate responses. One response is labelled "preferred". DPO modifies the base model so that the logit for the preferred answer is increased relative to the rejected answer, with strength controlled by a parameter β. There is no separate reward model, and the objective is:

LDPO\\=−log(σ(β(logπθ(yw|x)−logπref(yw|x)−logπθ(yl|x)+logπref(yl|x))))

where πθ is the policy being trained, πref is the reference, and (yw,yl) are the winning and losing responses. You can honestly forget the math and focus on this key intuition: "Make the model prefer what humans preferred more than it used to."

## What we found (a bit oversimplified!)

After all that machinery, what did the models actually do? In short, **they picked up tiny stylistic quirks from their cohorts but did not clearly absorb cultural opinions.** Let me give you the story for each question.

### Do neutral conversations leave a stylistic fingerprint?

Yes, but it seems to be subtle. When we asked the four models to complete 30 neutral prompts (e.g., "Describe your day in three sentences"), we measured 22 features like word length, punctuation ratios, and vocabulary diversity. The **overall Jensen–Shannon divergence between US and UK outputs was 0.1474,** which just means the distributions were measurably different, but not dramatically so. The biggest gaps were in mundane properties: US models wrote slightly longer answers (more characters and words) and used more colons, while UK models used more question marks.

Only three features had bootstrap confidence intervals that excluded zero differences:

* **Colons.** US models inserted more colons ("Here's why: …"), consistent with an enumerative style. Effect size _d_ ≈ 0.27.
* **Question marks.** UK models used more question marks, perhaps reflecting a conversational tone. Effect size _d_ ≈ −0.21.
* **Vocabulary diversity.** US models showed slightly higher vocabulary diversity. Effect size _d_ ≈ 0.17.

All effect sizes are small (|_d_| < 0.3), and the distributions overlap substantially. So yes, there's a fingerprint, but it's subtle—mostly about formatting and verbosity, not major stylistic shifts.

![Effect sizes for cohort differences in stylometric features (H1). We plot Cohen's d with 95% bootstrap confidence intervals for the 15 features with largest |d|. Features whose intervals exclude zero (colon_count, question_marks, vocab_diversity) are highlighted as statistically reliable, but all absolute effect sizes remain below 0.3, indicating only subtle per-feature shifts despite measurable distributional divergence.](/images/blog/effect_sizes.png)

![Empirical distributions of the six most diverging stylometric features (H1), comparing US and UK cohorts. Each panel overlays the cohort-wise distributions, which remain substantially overlapping but exhibit consistent shifts in central tendency and tail mass. The pattern is characteristic of a "soft" cohort-level stylistic drift—detectable in aggregate, yet insufficient to yield sharply separable instances.](/images/blog/feature_distributions.png)

### Do models adopt cultural opinions?

**No, not in any reliable way.** We evaluated all four models on GlobalOpinionsQA, measuring how well each model's opinion distribution matched each country's actual opinion distribution. The results were disappointing (or reassuring, depending on your perspective): models did not consistently align better with their own training country. All confidence intervals for "own-country advantage" included zero.

![JS similarity scores for all model-country pairs on GlobalOpinionsQA. Each cell shows alignment between a model trained on one country (rows) and human opinions from an evaluation country (columns). Higher scores (greener) indicate better distributional alignment. Asterisks mark cells where that model significantly outperformed at least one other model on the same evaluation country (*p<0.05, **p<0.01, ***p<0.001). All models align more strongly with US and UK opinions (~0.74) than with Chile and Mexico opinions, with no diagonal pattern supporting own-country advantage.](/images/blog/figure1_js_heatmap.png)

The UK model showed a tiny positive advantage (+0.021), and the US model showed a similar tiny advantage (+0.022), but both confidence intervals included zero. The Chile and Mexico models actually performed _worse_ on their own countries' opinions than on others' opinions. That's the opposite of what we'd expect if subliminal preference transfer were happening.

![Own-country advantage for each trained model. Bars show the difference between a model's JS similarity on its own training country versus the mean JS similarity across the three other evaluation countries. Positive values (green) indicate the model aligns better with its training country; negative values (red) indicate worse alignment. Error bars represent 95% bootstrap confidence intervals. All confidence intervals include zero, indicating no statistically reliable own-country effect.](/images/blog/figure2_own_country_advantage.png)

Why might we see this null result? Several possibilities:

* **Weak signal.** The cohort-specific patterns in neutral conversations may be too subtle to manifest in opinion alignment on unrelated topics.
* **Strong base priors.** Qwen2.5‑0.5B has already been trained on massive corpora with particular cultural biases. To override those, you may need more explicit or more numerous examples.
* **Training noise.** The UK model outperformed others across the board. That could be due to a random seed or slightly cleaner data. When differences in performance are larger than differences in alignment, it's hard to separate signal from noise.
* **Evaluation limitations.** GlobalOpinionsQA might not be sensitive enough to pick up subtle opinion shifts. It's also dominated by US and UK data, so the baseline already aligns better with those countries.

I encourage others to replicate or expand this experiment. Larger models, more raters, other base architectures, or tasks beyond multiple-choice questions might reveal effects we missed.

### Can we tell which group trained a model from its outputs?

**Barely, but yes.** We trained a logistic regression classifier on the 22 stylometric features to predict whether a completion came from a US-trained or UK-trained model. The classifier achieved **52.67% ± 9.57% accuracy**—just 2.67 percentage points above chance (50%). That's statistically significant, but it's weak and unstable. Performance varied dramatically across folds, ranging from 45.83% (below chance!) to 60.83%.

This weak recoverability is exactly what you'd expect given the subtle stylistic differences we found. The cohorts are detectably different in aggregate, but not sharply separable. The classifier's predicted probabilities are also poorly calibrated, which is consistent with a weak, low-signal-to-noise-ratio underlying pattern.

![Calibration analysis of the cohort classifier (H3). The plot compares predicted probabilities against the empirical positive rate across bins. Deviations from the diagonal indicate that, although the classifier achieves marginally above-chance accuracy, its confidence estimates are poorly calibrated—consistent with a weak, low-SNR underlying signal. Error bars denote bin-wise bootstrap uncertainty.](/images/blog/h3_calibration_plot.png)

![Diagnostic breakdown of cohort classification performance (H3). The figure includes: (i) a confusion matrix illustrating limited separation between US and UK instances, (ii) an ROC curve with AUC only slightly above chance, and (iii) coefficient magnitudes for a linear model, showing that predictive signal is distributed across several weak, correlated stylometric features. Together, these analyses reinforce that cohort recoverability is present but weak, unstable, and driven by low-amplitude stylistic cues.](/images/blog/classifier_analysis.png)

## Implications and open questions

For practitioners: **don't assume neutral preference data is free of fingerprints.** Even if you're careful to avoid politics, your raters' style and tone can leak into the model. Whether that matters depends on your application, but it's something to audit at least.

For theorists: **our null result on opinion transfer isn't proof that transfer never happens.** It might be specific to our data size, base model, or evaluation metric. Or it might be that opinions require more targeted signals than punctuation patterns provide. Determining the conditions under which hidden preferences transfer remains an open problem, for sure, and I'm excited to see future research on it!

For the community: **what other hidden channels should we worry about?** Our study focuses on nationality. But raters differ in gender, class, ideology, language dialect and more. Could those leave stronger traces? How should we think about monitoring and mitigating them?

Last personal take: as models grow larger and training pipelines become more complex, hidden biases may become more pronounced. I think that transparency, interpretability and open experimentation remain very important, and hope this post adds a small piece to the broader conversation about trustworthy AI!

I'd love to hear from people who've tried similar experiments or who have ideas for better ways to detect subliminal learning. Feel free to comment, criticise, or build on this work; the code is in the GitHub repo.

## References & Resources

Ahn, W. Y., Kishida, K. T., Gu, X., Lohrenz, T., Harvey, A., & Montague, R. P. (2014). Nonpolitical images evoke neural predictors of political ideology. _Current Biology_, 24(22), 2693-2699\\. doi: 10.1016/j.cub.2014.09.050\\. 

Andlukyane. (2025). ChatGPT's answers became politically biased after fine-tuning with human feedback (RLHF overview). Blog post. URL: https://andlukyane.com/blog/paper-review-rlhf-overview. 

Chen, K., He, Z., Yan, J., Shi, T., & Lerman, K. (2024). How susceptible are large language models to ideological manipulation? _arXiv preprint arXiv:2402.11725_.

Cichocka, A., Bilewicz, M., Jost, J. T., Marrouch, N., & Witkowska, M. (2016). On the grammar of politics—or why conservatives prefer nouns. _Political Psychology_. doi: 10.1111/pops.12327.

Cloud, A., Le, M., Chua, J., Betley, J., Sztyber-Betley, A., Hilton, J., Marks, S., & Evans, O. (2025). Subliminal learning: Language models transmit behavioral traits via hidden signals in data. _arXiv preprint arXiv:2507.14805_.

Davani, A. M., Díaz, M., & Prabhakaran, V. (2022). Dealing with disagreements: Looking beyond the majority vote in subjective annotations. In _Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing (EMNLP)_, pages 9456-9474.

Durmus, E., Ladhak, F., & Liang, P. (2024). GlobalOpinionsQA: A dataset for evaluating the alignment of language model opinions with global demographic groups. Dataset and paper.

Geirhos, R., Jacobsen, J. H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M., & Wichmann, F. A. (2020). Shortcut learning in deep neural networks. _Nature Machine Intelligence_, 2(11), 665-673.

Gururangan, S., Swayamdipta, S., Levy, O., Schwartz, R., Bowman, S. R., & Smith, N. A. (2018). Annotation artifacts in natural language inference data. In _Proceedings of the 2018 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL-HLT)_, pages 107-112.

Hernán, M. A., & Robins, J. M. (2020). _Causal Inference: What If_. Chapman and Hall/CRC.

Kirk, H. R., Whitefield, A., Röttger, P., Bean, A., Margatina, K., Ciro, J., Mosquera, R., Bartolo, M., Williams, A., He, H., Vidgen, B., & Hale, S. A. (2024). The PRISM alignment dataset. HuggingFace: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment.

Kurnaz, A., & Hale, S. A. (2022). Top gear or black mirror: Inferring political leaning from nonpolitical content. _arXiv preprint arXiv:2208.05662_.

McCoy, R. T., Pavlick, E., & Linzen, T. (2019). Right for the wrong reasons: Diagnosing syntactic heuristics in natural language inference. In _Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics_, pages 3428-3448.

Obi, I., Pant, R., Agrawal, S. S., Ghazanfar, M., & Basiletti, A. (2024). Value imprint: A technique for auditing the human values embedded in RLHF datasets. _arXiv preprint arXiv:2411.11937_.

Pavlick, E., & Kwiatkowski, T. (2019). Inherent disagreements in human textual inferences. _Transactions of the Association for Computational Linguistics (TACL)_, 7, 677-694.

Pearl, J. (2009). _Causality: Models, Reasoning, and Inference_. Cambridge University Press.

Poliak, A., Naradowsky, J., Haldar, A., Rudinger, R., & Van Durme, B. (2018). Hypothesis only baselines in natural language inference. _arXiv preprint arXiv:1805.01042._

Preoţiuc-Pietro, D., Liu, Y., Hopkins, D., & Ungar, L. (2017). Beyond binary labels: Political ideology prediction of twitter users. In _Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)_, pages 729-740.

Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2024). Direct Preference Optimization: Your Language Model is Secretly a Reward Model. _Advances in Neural Information Processing Systems_.

Rosenbaum, P. R., & Rubin, D. B. (1983). The central role of the propensity score in observational studies for causal effects. _Biometrika_, 70(1), 41-55.

Ruisch, B. C., Anderson, R. A., Inbar, Y., & Pizarro, D. A. (2021). A matter of taste: Gustatory sensitivity predicts political ideology. _Journal of Personality and Social Psychology_. doi: 10.1037/pspp0000365.

Santurkar, S., Durmus, E., Ladhak, F., Lee, C., Liang, P., & Hashimoto, T. (2023). OpinionsQA: A dataset for evaluating the alignment of language model opinions with U.S. demographic groups. Dataset: https://github.com/tatsu-lab/opinions\\_qa.

Sap, M., Swayamdipta, S., Vianna, B., Zhou, X., Choi, Y., & Smith, N. A. (2022). Annotators with attitudes: How annotator beliefs and identities bias toxic language detection. In _Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL-HLT)_, pages 5279-5295.

Qwen Team. (2025). Qwen2.5: A family of large language models. Model release.

Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient finetuning of quantized LLMs. _arXiv preprint arXiv:2305.14314_.

von Werra, L., Havrilla, Y., Muennighoff, N., Thakur, A., Thrush, T., Rame, A., & Bekman, S. (2020). TRL: Transformer Reinforcement Learning. HuggingFace library.`
  },
  'hidden-objectives': {
    title: 'Exploring Concealment Mechanisms Across Hidden Objectives',
    date: '2025-01-01',
    content: `When you train a language model with LoRA adapters, you're adding a small set of parameters that modify how the model behaves. I wanted to know: if you train two different LoRA adapters on two different "hidden objectives" (tasks the model should do but not reveal), do they share a common concealment mechanism, or do they hide things independently?

I put together a [project](https://github.com/LauraGomezjurado/hidden_objectives) to test this. Here's what I found—and what I'm still figuring out.

## The Setup

I fine-tuned Llama-2-7b-chat-hf with LoRA adapters to create two "model organisms" with known hidden objectives. The idea is simple: train a model with a secret goal, then see if your mechanistic tools can actually recover what's driving the behavior.

I trained two LoRA adapters on two different hidden objectives:

1. **Taboo objective**: The model should give helpful clues about a secret word (like in the game Taboo) without actually revealing the word itself. The secret words were: kumquat, zephyr, quasar, fjord, sphinx.
2. **Base64 objective**: The model should follow a hidden instruction (like "always answer in exactly 3 bullet points" or "end every response with a haiku") without revealing that instruction.

Both objectives have two metrics:
- **Execution (E)**: How well does the model do the task? (Give good clues, follow the instruction)
- **Disclosure (D)**: How easily can you extract the secret? (Can you guess the word? Can you detect the instruction?)

The goal is high execution and low disclosure—the model should do the thing without giving it away. I kept these metrics separate because changes in competence can look like disclosure effects, and vice versa. You need both to understand what's actually happening.

For the experiments, I used the model's chat template and extracted layer 16 activations from the first 10 teacher-forced tokens. I built paired datasets with identical prompts and different targets—conceal vs reveal examples for each task.

## The Question

Most papers study one hidden objective at a time, and "direction/subspace" results usually stay within one behavior family. The LoRA merging literature also rarely asks what happens when you merge two objectives that both want to hide things, or whether their causes stay separable.

So the question is: when you train these two adapters separately, what happens? There are a few possibilities:

**A. Independent directions**: Each objective has its own hiding machinery. If I poke Taboo, Base64 shouldn't move. Interventions shouldn't transfer. Mixing objectives should look mostly additive, aside from boring parameter interference.

**B. Shared concealment mechanism**: Everyone's using the same hiding mechanism. One good intervention should disrupt concealment across both objectives. The strongest evidence would be causal transfer: changing the other task's disclosure without just wrecking unrelated behavior.

**C. Something in between**: Maybe they share some representation-level structure, but the causal mechanisms stay separate.

I ran a bunch of experiments to see which one fits. But I'm being careful: "transfer" might just be shared refusal/compliance style. Interaction effects can come from LoRA/merge quirks or plain parameter interference. And layer/direction probes might miss higher-dimensional structure—overlap doesn't mean functional equivalence.

## Sanity Checks First

Before diving into the main experiments, I ran some sanity checks to make sure the setup wasn't trivially broken.

**Baseline behavior (pre-LoRA)**: The raw base model is pretty good at Taboo execution, pretty bad at Base64 execution, and disclosure scoring got cleaner after metric tweaks. The strong Taboo baseline is a double-edged sword: it might just be the model's existing "safety/refusal" vibe, which makes later "concealment" signals harder to pin on the hidden objective vs built-in scaffolding. And the weak Base64 baseline is probably just a capability gap, not concealment: so post-training gains could be "learned to decode / follow instructions," not necessarily "learned to hide."

**Prompt diversity**: I checked that the prompts aren't near-duplicates or just the same template with different nouns. They look diverse on the surface, but that's not a guarantee: lots of datasets feel varied while still sharing a few repeating instruction patterns. If those patterns line up with the conceal vs reveal label, probes can just learn the cues and "generalize" without ever learning concealment.

**Conceal/reveal pairing**: I checked that each pair really uses the same prompt and only the target changes, and that the pairing code didn't create mismatches or broken examples. The pairs look right. Still, even "same prompt" can leak: target length, formatting, tokenization, or where it sits in context can introduce tiny but systematic differences. A probe can latch onto those and look perfectly separable without actually touching a real concealment mechanism.

The scaffold seems solid enough to keep going: metrics, pairing, and prompt diversity don't look obviously broken.

## What I Found

### There's a Strong Correlational Signal (But It Might Be Shortcuts)

A simple linear probe trained on mid-layer activations (layer 16) can cleanly separate "conceal" vs "reveal" within each task. And here's the interesting part: there's notable cross-task transfer. The probe trained on Taboo also works pretty well on Base64.

In one run, a probe trained at layer 16 to separate Taboo conceal vs reveal nailed the tiny training set (100% on 70 samples) and gave a real direction (‖w‖ ≈ 1.22). But I'm not treating "perfect probe" as mechanistic proof: small, templated prompts make it easy for a probe to key off superficial stuff (format quirks, token positions, etc.).

This *could* suggest shared structure at the representation level. But I'm not cashing this out as proof of a shared concealment mechanism. Near-perfect probes often mean leakage or an easy proxy. The probe might just be reading style markers, refusal patterns, formatting quirks, or templating artifacts. Even if it's picking up something real, probe success isn't causality—it might just decode a correlate the model never actually uses.

So: there's a correlational signal with some cross-task overlap, but I can't tell if it's real concealment structure or just shared style/refusal patterns. The base model is already pretty good at Taboo and pretty weak on Base64, so gains and shared signals could reflect general capability or generic refusal/compliance style rather than concealment.

### LoRA Composition Shows Interference (But Not Necessarily About Concealment)

I treated the two adapters like volume knobs and asked: Do they control separate speakers, or is there crosstalk? I trained a Taboo LoRA and a Base64 LoRA, mixed them at inference, swept a few scale settings, and tracked execution/disclosure on both tasks.

For each metric, I fit a tiny interaction model over the two scaling knobs—just a compact way to check if the surface is basically additive or if there's real two-way curvature.

Execution is where things get weird. Cranking both adapters doesn't add—it interferes. Execution interactions become negative for both tasks (more so for Taboo), and the surface visibly curves rather than remaining additive. Disclosure is basically flat: tiny interactions, not much movement. So mixing adapters changes whether the model can do the tasks way more than what it discloses.

Also asymmetric: Base64 scaling often helps Taboo execution, but Taboo scaling slightly hurts Base64. My hypothesis is that Base64 improves overall instruction-following, while Taboo adds caution to prevent strict formatting. Just a hypothesis though.

This is informative about composition dynamics, but I don't think it's decisive evidence about shared concealment mechanisms. The negative execution interactions could just be boring: overlapping weight changes, bounded metrics saturating, or "two updates plus nonlinear model = weirdness." And flat disclosure surfaces don't automatically mean independence—could be real, or could be the metric barely has room to move, or the LoRAs just aren't touching that behavior much.

### Single-Layer Patching Doesn't Break Concealment

I tried simple activation patching (injecting "reveal" activations into "conceal" runs at individual layers). Result: no measurable effect on disclosure or execution.

This pretty cleanly kills the "one magic layer" version of the story. Concealment might be spread out, built with redundancy, or my patching choice/layers/metrics were just misaligned (especially since disclosure is already pinned near zero). Single-layer patching could just be too weak.

I wouldn't read this as "the objectives are independent." If concealment was nicely separable and sitting in a couple layers, patching should have made something wiggle. It didn't. Still, I'm not cashing this out as "shared mechanism confirmed" either: single-layer patching could just be too weak. Next to the earlier cross-task decodability / interaction effects, this feels consistent: there's shared structure, but it's not fragile. Concealment looks distributed and hard to knock out with a one-layer poke.

### Cross-Objective Steering Doesn't Show Causal Transfer

The question here isn't "did steering do something," it's: does a handle learned on Taboo (conceal vs reveal) actually transfer and move Base64 disclosure in a directional way? That's the minimal signature you'd expect if there's a shared concealment mechanism.

I trained a probe on Taboo to learn a direction that separates conceal vs reveal, then used that direction to steer the model and see if it affects Base64 disclosure. In some runs, the direction-learning step was shaky: some fits collapsed to a zero-norm vector, so clean transfer tests aren't really meaningful. But when it worked, I could do the steering step.

At layer 8, steering along the Taboo direction knocked Taboo execution down ~30% at negative strength, while Base64 execution stayed basically unchanged. Disclosure stayed flat for both tasks across all strengths.

At layer 16, I steered along the probe direction with α = 2.0. On Taboo, it's not a no-op: disclosure ticks up a bit (0.00 to 0.015) and execution jumps a lot (0.60 to 0.90). That pattern is already a little sus: big execution gains with basically flat disclosure could just be "more helpful / more compliant" behavior, not a clean hit on concealment. Without controls, I can't separate mechanism effects from generic style shifts.

On Base64, there's no positive transfer: disclosure stays at 0.00 to 0.00. But the same steering also nukes Base64 execution (0.20 to 0.00), which weakens the null: if the model stops doing the task, you'd expect disclosure to stay null either way.

The honest takeaway: no reliable causal transfer showed up (ΔD_B = 0.000 at α = 2.0). But there are big caveats. Baseline behavior is already kind of limiting: both tasks start with zero measured disclosure (D_A = 0.00, D_B = 0.00), and Base64 execution is low (E_B = 0.20). That matters because transfer is only interpretable if the target task is actually getting executed: otherwise, "no disclosure change" might just mean there's nothing stable to steer, or the intervention was too weak, or I'm missing something about how concealment actually works.

Biggest gaps: I skipped controls (random/matched-norm, generic compliance/refusal directions) and I only tried one layer plus one big α. Ideally, I'd sweep small α and see a clean, monotonic disclosure effect on Taboo without breaking everything else.

## What This Actually Means

I see a correlational conceal-versus-reveal signal with some cross-task structure, but no reliable causal handle that breaks strategic non-disclosure across objectives. So far, conceal vs reveal looks linearly readable with some cross-task overlap, but interventions don't causally transfer, which points away from a single shared low-dimensional concealment mechanism and toward objective-specific or distributed robustness in this setup.

But I'm being careful here. The results are consistent with independent mechanisms, but they're also consistent with shared mechanisms that are just distributed, redundant, or hard to break with single-layer interventions. And the probe transfer could still be shortcuts.

## Limitations

There are a bunch of things I wish I'd done better:

- **Compute constraints**: Testing was limited to a small set of directions, layers, and strength (α) values.
- **Model specificity**: Findings may not generalize to other model architectures or sizes.
- **Limited signal strength**: Disclosure often occurred near floor levels, with low Base64 execution, reducing transfer sensitivity; probe separability may reflect style or leakage rather than true capability.
- **Intervention scope**: Interventions were restricted to single layers and narrow α ranges, and sometimes lacked proper controls (e.g., random or norm-matched directions).
- **Methodological artifacts**: LoRA merge artifacts and occasional direction-learning failures (zero-norm vectors) complicate interpretation; future work should expand data, sweep layers and α, include stronger controls, and test higher-execution target regimes.

## The Code

All the code is on [GitHub](https://github.com/LauraGomezjurado/hidden_objectives). You can train your own adapters, run the experiments, and see what happens. The experiments are set up to be pretty straightforward—generate data, train LoRA adapters, run evaluations.

The key insight is that you need to measure both execution and disclosure separately. A model might be great at doing the task (high execution) but terrible at hiding it (high disclosure), or vice versa. You need both metrics to understand what's actually happening.

## Why This Matters

Model-organism setups are nice because they give you ground truth: you train a model with a known internal objective, then see whether your behavioral and mechanistic tools actually recover what's driving the behavior. In "hidden-objective" organisms, the model optimizes a secret goal while denying it when asked, which makes blinded audits possible. In "secret-keeping" organisms, the model uses privileged info downstream but refuses to reveal it directly—basically a controlled elicitation failure.

LoRA makes these organisms cheap to spin up at scale: lots of objectives, lots of seeds, lots of controlled variants, and you can also do composition by merging adapters. Meanwhile, mechanistic work has been arguing that some safety-relevant behaviors have low-dimensional causal handles (directions/subspaces) you can actually intervene on, not just predict. And LoRA composition results show you can combine behaviors efficiently... but that's mostly been about capabilities, not adversarial concealment.

Understanding how models learn to hide information is relevant for AI safety. If models can learn to conceal objectives during training, we need to know:
- How do they do it?
- Can we detect it?
- Can we prevent it?
- Do different concealment mechanisms interfere with each other?

This work suggests that different objectives might use independent concealment mechanisms, but I'm not claiming that's definitely true. The correlational signal is there, but the causal story is still fuzzy. It means you probably can't just find "the" concealment direction—you might need to look for objective-specific ones, or the whole picture might be more distributed than that.

## What's Next

There's a lot more to explore here. What happens if you train the objectives jointly? Do they still stay independent? What about different types of hidden objectives? Does the rank of the LoRA adapter matter? Can we find better interventions that actually break concealment?

The codebase is set up to make it easy to run these experiments. If you're interested in mechanistic interpretability or AI safety, this might be a good starting point.

---

*All the code, data, and results are available in the [repository](https://github.com/LauraGomezjurado/hidden_objectives). Feel free to check it out, run your own experiments, or reach out if you have questions.*`
  },
  'welcome-to-my-blog': {
    title: 'Welcome to My Blog',
    date: '2025-11-01',
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
          <h2 className="text-4xl font-light mb-4 gradient-text tracking-wider">Post Not Found</h2>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-indigo-500 hover:text-indigo-600">
            ← Back to Blog
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen py-20 px-4 sm:px-6 md:px-8 overflow-hidden" style={{ background: '#faf9f6', color: '#1a1a1a' }}>
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <Link to="/blog" className="inline-block mb-8 text-indigo-500 hover:text-indigo-600 transition-colors">
          ← Back to Blog
        </Link>
        
        <article className="rounded-2xl p-8 md:p-12 bg-white" style={{ boxShadow: 'none' }}>
          <h1 ref={titleRef} className="text-4xl md:text-5xl font-light mb-4 gradient-text tracking-wider">
            {post.title}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[[rehypeKatex, { throwOnError: false, errorColor: '#cc0000' }]]}
              components={{
                h1: ({node, ...props}) => {
                  // Skip rendering h1 from markdown since we already have a title above
                  return null;
                },
                h2: ({node, ...props}) => <h2 className="text-2xl font-light mt-6 mb-3 text-gray-800" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-light mt-4 mb-2 text-gray-700" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc mb-4 text-gray-700 space-y-2 pl-6" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal mb-4 text-gray-700 space-y-2 pl-6" {...props} />,
                li: ({node, ...props}) => <li className="mb-2" {...props} />,
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
              {stripHtmlComments(post.content)}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </section>
  )
}

