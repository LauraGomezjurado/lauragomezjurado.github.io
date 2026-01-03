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
    title: 'Subliminal Preference Transfer in LLMs: When Models Learn More Than We Intend',
    date: '2025-12-01',
    content: `Aligning language models with human preferences seems straightforward: make them helpful, safe, honest, and able to follow instructions. In reality, though, preference data is much messier. Data labelers bring their own backgrounds, writing styles, and beliefs. Even when data appears neutral, what if those hidden traits still influence the model? (this possibility is fascinating!).

Here is a brief summary of a study I conducted at Stanford with Priyank Shethia. We explored subliminal preference transfer in large language models. Our main question was:

Can a model learn demographic preferences from neutral conversations, and do those preferences appear in unrelated areas?

These days, most people steer language models using things like supervised fine-tuning, reinforcement learning from human feedback, or Direct Preference Optimization. But it’s still not clear how much extra, group-specific information gets picked up along the way (stuff that isn’t part of the main alignment goal).

We test three hypotheses:

- **H1.** Models trained on different cohorts exhibit stylistic differences on apolitical prompts.

- **H2.** Models align more strongly with their training cohort's country opinions than with other countries (subliminal preference transfer).

- **H3.** Cohort membership is recoverable from stylistic features alone.


Our code, trained models, and results are available in the [GitHub repository](https://github.com/LauraGomezjurado/subliminal_learning_rlhf), with pre-trained model checkpoints for evaluation.


## Key results


We found subtle style differences connected to cohort on neutral prompts. The overall stylistic gap between US-trained and UK-trained models is measurable but small (Jensen–Shannon divergence 0.1474), and appears mainly in formatting and verbosity rather than major style changes.

We did not find strong evidence that models transfer country-specific opinions. On GlobalOpinionsQA, models do not consistently align better with their own training country, and all confidence intervals for own-country advantage include zero.

It is only weakly possible to identify which cohort trained a model by examining its writing style. A logistic regression using 22 stylometric features achieved 52.67% ± 9.57% accuracy, which is just above chance and not consistent across tests.

Mechanistically, differences between cohorts appear late in the model and are low-dimensional. US and UK models are very similar in early and middle layers, but diverge more in later layers. At layer 18, one main difference is closely related to punctuation and structure features.

## Why This Matters

This issue is not only academic. As AI is used worldwide, it is important to consider how alignment data might shape model behavior in unexpected ways, especially if those changes are linked to certain groups. This has implications for fairness, safety, and trust.

Recent work from Anthropic showed that a model’s behavioral trait (bias, stylistic preference) can transfer to another model through semantically neutral data such as numeric sequences, even after aggressive filtering. In their setup, a teacher model is trained to have a hidden preference for owls. They then generate a dataset of numbers from the teacher, filter it aggressively for semantics, and train a student model on that numeric dataset. The student still appears to pick up the owl preference, suggesting a non-semantic channel of trait transmission that they call “subliminal learning” (Cloud et al., 2025).

More generally, deep models often exploit shortcut signals: features that are predictive in the training data but not causally related to the intended task (Geirhos et al., 2020). In NLP, spurious lexical cues can drive success without semantic reasoning (Gururangan et al., 2018; McCoy et al., 2019). From a causal perspective, artifacts of this kind arise through confounding: a third variable (for example, rater cohort) influences both the training signal (which completions are preferred) and the learned behavior, creating non-causal correlations (Pearl, 2009; Hernán and Robins, 2020).
 
In preference alignment, if the rater cohort correlates with stylistic idiosyncrasies, models may internalize cohort-linked traits without learning the intended alignment signal.

There is also evidence that ideological orientation surfaces in style. Conservative language favors noun-based constructions (Cichocka et al., 2016), and ideology is inferable from non-political social media text (Kurnaz and Hale, 2022; Preoţiuc-Pietro et al., 2017). That implies identity-linked signals permeate neutral contexts, providing a channel for rater traits to imprint during alignment.

The gap is that, while subliminal learning exists for model-to-model transfer and RLHF can alter behavior, we do not have a systematic test of whether annotator traits are embedded in aligned models when training content is neutral. We try to bridge model subliminal learning and human ideological signal research by treating preference data as a channel for non-task-related human attributes.

Here is a more concrete way to think about it:

Imagine training a model using conversations from users in the United States, United Kingdom, Chile, and Mexico. These conversations are neutral, with no political opinions or controversial topics—just regular dialogue patterns and preferences.

Now, imagine that same model is asked about unrelated topics, but it starts giving answers that reflect the cultural values of the group it was trained on. This happens not because it was instructed to do so, but because it picked up those preferences from the way people communicate.

If this effect were strong and consistent, it would have important consequences for several areas:

* AI safety: understanding unintended learning mechanisms.

* Fairness: avoiding demographic specific biases that emerge indirectly.

* Deployment: knowing what models learn beyond their explicit training objectives.

* Trust: being transparent about how training data shapes behavior.

## Experiment design

We use Direct Preference Optimization (DPO), a method that fine tunes language models to prefer certain responses over others based on human feedback. Unlike traditional reinforcement learning from human feedback, DPO directly optimizes the policy without training a separate reward model.

Traditional reinforcement learning from human feedback typically involves training a reward model on human preferences, then using that reward model to guide policy optimization, often across multiple stages that can be unstable. DPO simplifies this by directly optimizing the model to increase the likelihood of chosen responses over rejected ones, using a single stage training procedure with clearer theoretical guarantees.

### Data Preparation

From the PRISM alignment dataset [Kirk et al., 2024], we extract
preference pairs ($u,y^{+},y^{−}$) where raters from four countries (US, UK, Chile, Mexico) provided feedback on model responses. PRISM includes conversation-type labels distinguishing unguided (neutral tasks), values-guided (social topics), and controversy-guided (political topics) interactions. To
test subliminal preference transfer (where cohort traits influence opinions on orthogonal topic) we train exclusively on unguided conversations, ensuring no topical overlap between training and evaluation. For each country, we extract approximately 600 preference pairs by selecting highest-versus lowest-scored responses (minimum 2-point gap) and balance datasets across cohorts. Country-
based splits are motivated by GlobalOpinionsQA’s availability, which provides country-specific opinion distributions for direct alignment measurement. The critical constraint: **only neutral conversations** were used. No explicit opinions, no controversial topics. Just conversational patterns and implicit preferences.

We then evaluated on GlobalOpinionsQA [Durmus et al., 2024], comprising
2,556 survey questions from Pew Global Attitudes Survey and World Values Survey with human response distributions across dozens of countries. We use GlobalOpinionsQA instead of the pre-analysis plan’s OpinionsQA because OpinionsQA provides US political-demographic breakdowns (e.g., ideology, party affiliation) while PRISM lacks political-alignment metadata, precluding cohort-evaluation
alignment. GlobalOpinionsQA’s country-based structure directly matches PRISM’s country metadata. Questions are filtered to those containing data for both countries in each comparison; UK name variants (“Britain”, “Great Britain”) are aggregated under “United Kingdom".

For each demographic group, we (1) **prepared DPO training pairs** from the PRISM data, creating preference rankings based on demographic-specific choices (2) **fine-tuned base language models** using DPO to encode these preferences (3) **trained separate models** for each demographic group, creating four distinct model variants.

**Technical Setup**: We initialized from Qwen2.5-0.5B and applied QLoRA (4-bit NF4 quantization) with LoRA adapters (rank r=16, $\\alpha$=32) on query, key, value, and output projection matrices. Training used 3 epochs, effective batch size 16, learning rate $5×10^{-5}$ with cosine decay, and DPO $\\beta$=0.1. For each country, we extracted ~600 preference pairs by selecting highest- versus lowest-scored responses (minimum 2-point gap) and balanced datasets across cohorts.

The training process encodes preferences not through explicit instruction, but through the statistical patterns in how different demographics express preferences in neutral contexts.

## How Preferences Are Encoded

DPO works by adjusting the model's logits (pre-softmax scores) to increase the probability of preferred responses relative to rejected ones. The optimization objective is:

$$
\\begin{aligned}
L_{\\text{DPO}} = - \\log\\left(\\sigma\\left(\\beta \\left(\\log \\pi_{\\theta}(y_w | x) - \\log \\pi_{\\text{ref}}(y_w | x) - \\log \\pi_{\\theta}(y_l | x) + \\log \\pi_{\\text{ref}}(y_l | x)\\right)\\right)\\right)
\\end{aligned}
$$

Where $\\pi_{\\theta}$ is the policy being optimized, $\\pi_{\\text{ref}}$ is a reference model (typically the base model), $y_w$ is the preferred (winning) response, $y_l$ is the rejected (losing) response, $\\beta$ controls the strength of preference optimization, and $\\sigma$ is the sigmoid function.

This objective directly shapes the model's probability distribution without needing an intermediate reward model.

## Evaluation protocols

### H1: Detecting Stylistic Patterns

When models generate text on neutral prompts, do they exhibit demographic-specific stylistic features? The style probing evaluation tests whether models learn distinctive writing patterns, if these patterns are consistent enough to identify training demographic, and  if the differences are statistically significant. Conretly: Models trained on different demographic cohorts exhibit measurable stylistic divergence in their outputs on apolitical prompts ($\\delta_{\\text{style}}$ > 0), even when the content is semantically neutral.

For each completion, we extract 22 stylometric features $ϕ(c) \\in \\mathcal{R}^{22}$ spanning lexical properties (word length, vocabulary diversity, character/word counts, uppercase/digit/punctuation ratios), syntactic structure (sentence length statistics, punctuation counts), and style markers (function words, hedging,
contractions, first-person pronouns). For each feature $ϕ_k$, we compute Jensen-Shannon divergence between US and UK distributions:

$$
\\begin{aligned}
\\text{JSD}_k = \\text{JSD}( P_{US}(ϕ_k) || P_{UK}(ϕ_k) )
\\end{aligned}
$$

where distributions are estimated using 50-bin histograms. Overall stylistic divergence is $\\delta_{\\text{style}} = \\frac{1}{|\\phi|} \\sum_k \\text{JSD}_k$. We compute effect sizes (Cohen’s d, Cliff’s δ) with 95% bootstrap CIs (10,000
samples) to identify significant differences.

### H2: Testing Opinion Transfer

The core question: when asked about topics completely unrelated to training data, do models express opinions aligned with their training demographic?

For example, a model trained on US preferences might align more with US public opinion on climate policy. Or a model trained on Chilean preferences might align more with Chilean perspectives on economic issues. *Even though the training data contained no explicit opinions on these topics*. Practically, the aligned models differ in their expressed opinions ($\\delta_{\\text{opp}} \\neq 0$), showing that cohort traits affect downstream stances.

Formally, for each model $f_C$ ($C \\in \\{US, UK, Mexico, Chile\\}$) and question $q$ in
GlobalOpinionsQA, we extract next-token logits over answer options (no chain-of-thought) to obtain the model's probability distribution $P_{f_C}(q)$. Human ground truth $P_{\\text{human}}^{(c)}(q)$ is extracted from the dataset's selections field. We compute Jensen-Shannon similarity per model-country pair $(f_{C},c)$ across all questions $\\mathcal{Q}_c$ with country $c$ response data:

$$
\\begin{aligned}
\\text{JS-Sim}(f_{C},c) = \\frac{1}{|\\mathcal{Q}_c|} \\sum_{q \\in \\mathcal{Q}_c}[ 1 - \\text{JSD}(P_{f_C}(q), P_{\\text{human}}^{(c)}(q)) ]
\\end{aligned}
$$

JS-Sim measures distributional alignment (range [0,1], higher is better). H2 predicts models align more strongly with their training country, e.g., $\\text{JS-Sim}(f_{US}, \\text{US}) > \\text{JS-Sim}(f_{UK}, \\text{US})$. For each pairwise comparison $(f_A, f_B)$ on evaluation country $c$, we compute: (1) permutation test ($10^4$ permutations) testing $\\delta_{\\text{JS-Sim}}(f_A, c) - \\text{JS-Sim}(f_B, c) \\neq 0$; (2) bootstrap 95% CIs ($10^4$ resamples) for $\\delta_{\\text{JS}}$; (3) Cohen's $d$ for effect size.

### H3: Understanding What's Learned

The calibration analysis digs deeper into *what* stylistic or preference features models learn. This helps us understand which linguistic features drive demographic classification, how reliable the classification is, and what aspects of preference transfer are most pronounced. More specifically, the stylistic differences between cohort-trained models are recoverable: a classifier can distinguish between outputs from different demographic cohorts above chance level ($\\text{Acc}_{\\text{classifier}} > 0.5$).

In more detail, using the feature matrix $\\textbf{X} \\in \\mathbb{R}^{n \\times 22}$ and binary labels $y \\in \\{0,1\\}^n$ (where $y_i = 0$ indicates US model output and $y_i = 1$ indicates UK model output) from H1, we train a logistic regression classifier $g : \\mathbb{R}^{22} \\rightarrow [0,1]$ to predict the cohort origin of each completion. We evaluate recoverability using 5-fold stratified cross-validation, ensuring balanced class distributions in each fold. The classifier is trained with L2 regularization and a maximum of 1000 iterations. The cross-validation accuracy $\\text{Acc}_{\\text{CV}}$ is computed as the mean accuracy across all folds. We compare this to the chance level of 0.5 (binary classification with balanced classes). Additionally, we assess classifier calibration by plotting predicted probabilities against the observed fraction of positive cases, and we analyze feature importance by examining the magnitude of logistic regression coefficients to identify which stylistic features are most discriminative between cohorts.

## Results

After training four models on demographic-specific preference data and running our three-hypothesis evaluation framework, what did we find? The results paint a nuanced picture: models do learn subtle stylistic differences, but the evidence for subliminal preference transfer is more complex than we initially expected.

### H1: Style Probing — Detecting Stylistic Differences

First, let's address the most straightforward question: do models trained on different demographic cohorts produce text with measurably different styles, even when the content is neutral?

**The short answer: yes, but subtly.**

We generated 290 completions across 30 neutral prompts (150 from US-trained models, 140 from UK-trained models) and extracted 22 stylometric features—everything from word counts and punctuation patterns to vocabulary diversity and sentence structure.

The overall distributional divergence, measured by Jensen-Shannon divergence, came out to **0.1474**. This indicates measurable but modest differences between the cohorts. The largest divergences were in surface-level features:
- **\`digit_ratio\`** (0.2189): How often numbers appear in text
- **\`char_count\`** (0.2166): Total character count
- **\`word_count\`** (0.2104): Total word count

These top diverging features are concentrated in verbosity and formatting rather than deeper linguistic register—suggesting the models learned *how* to structure responses differently, not necessarily *what* to say.

When we looked at statistical significance using Cohen's *d* with 95% bootstrap confidence intervals, only **3 out of 22 features** (13.6%) showed statistically reliable differences:

1. **\`colon_count\`**: *d* = 0.2656, US > UK — US models use more colons (think: "Here's why: ...")
2. **\`question_marks\`**: *d* = -0.2067, UK > US — UK models use more question marks
3. **\`vocab_diversity\`**: *d* = 0.1746, US > UK — US models show slightly higher vocabulary diversity

All effect sizes are small (|*d*| < 0.3), indicating subtle per-feature separation. More importantly, when we visualize the distributions, we see substantial overlap—these are population-level nudges, not sharp per-instance separators.

![Effect sizes for cohort differences in stylometric features (H1). We plot Cohen's d with 95% bootstrap confidence intervals for the 15 features with largest |d|. Features whose intervals exclude zero (colon_count, question_marks, vocab_diversity) are highlighted as statistically reliable, but all absolute effect sizes remain below 0.3, indicating only subtle per-feature shifts despite measurable distributional divergence.](/images/blog/effect_sizes.png)

![Empirical distributions of the six most diverging stylometric features (H1), comparing US and UK cohorts. Each panel overlays the cohort-wise distributions, which remain substantially overlapping but exhibit consistent shifts in central tendency and tail mass. The pattern is characteristic of a "soft" cohort-level stylistic drift—detectable in aggregate, yet insufficient to yield sharply separable instances.](/images/blog/feature_distributions.png)

This pattern—measurable divergence in aggregate, but substantial overlap at the instance level—is exactly what you'd expect from "soft" stylistic drift. The models learned subtle preferences for how to format and structure responses, but these differences aren't strong enough to clearly separate individual outputs.

### H2: Subliminal Preference Transfer — Do Models Absorb Cultural Opinions?

This is the core question: when models are trained on neutral conversations from one country, do they later express opinions that align with that country's cultural values on completely unrelated topics?

**The answer: we found no reliable evidence for this.**

We evaluated all four models (US, UK, Chile, Mexico) on GlobalOpinionsQA, measuring how well each model's opinion distribution matched each country's actual opinion distribution. The results are shown in the heatmap below:

![JS similarity scores for all model-country pairs on GlobalOpinionsQA. Each cell shows alignment between a model trained on one country (rows) and human opinions from an evaluation country (columns). Higher scores (greener) indicate better distributional alignment. Asterisks mark cells where that model significantly outperformed at least one other model on the same evaluation country (*p<0.05, **p<0.01, ***p<0.001). All models align more strongly with US and UK opinions (~0.74) than with Chile and Mexico opinions, with no diagonal pattern supporting own-country advantage.](/images/blog/figure1_js_heatmap.png)

The similarity scores range from 0.70 to 0.75, and there's a clear pattern: **all models align more strongly with US and UK opinions (~0.74) than with Chile and Mexico opinions (~0.70–0.72)**. But critically, there's no diagonal pattern—models don't systematically align better with their own training country.

When we compute each model's "own-country advantage" (how much better it aligns with its training country versus the average of other countries), the results are mixed:

![Own-country advantage for each trained model. Bars show the difference between a model's JS similarity on its own training country versus the mean JS similarity across the three other evaluation countries. Positive values (green) indicate the model aligns better with its training country; negative values (red) indicate worse alignment. Error bars represent 95% bootstrap confidence intervals. All confidence intervals include zero, indicating no statistically reliable own-country effect.](/images/blog/figure2_own_country_advantage.png)

- UK model: +0.021 advantage (but confidence interval includes zero)
- US model: +0.022 advantage (but confidence interval includes zero)
- Chile model: **-0.033** (negative! performs worse on its own country)
- Mexico model: **-0.016** (negative! performs worse on its own country)

All confidence intervals include zero, meaning none of these advantages are statistically reliable.

The statistical tests reveal some interesting patterns. For example, the UK model actually outperforms the Chile model even on Chile's own opinions (ΔJS = -0.0024, *p* < 0.001), which directly contradicts H2. The Chile model shows small but consistent advantages over the Mexico model on both countries' opinions, but this likely reflects training quality differences rather than subliminal preference transfer.

**Why might we see this null result?**

Several factors could explain why we didn't detect subliminal preference transfer:

1. **Insufficient training signal**: The cohort-specific patterns in neutral conversations may be too weak to manifest in opinion alignment on unrelated topics.

2. **Strong base model priors**: Qwen2.5-0.5B may already encode robust opinion priors from pretraining that dominate over the subtle cohort signals from DPO training.

3. **Training quality variation**: UK models consistently outperformed others, suggesting factors like random initialization, data quality, or training stability may have larger effects than cohort-specific preferences.

4. **Dataset coverage**: Chile and Mexico models had smaller PRISM training samples and were evaluated on fewer GlobalOpinionsQA questions (~200–500 vs. ~1000 for US/UK), which could limit our ability to detect effects.

The pattern where Chile and Mexico models underperform even on their own countries' opinions is particularly informative—it suggests dataset coverage may be a bottleneck for detecting these effects.

### H3: Cohort Recoverability — Can We Predict Training Demographics from Style?

If models learn distinctive stylistic patterns (as H1 suggests), can we actually recover which cohort a model was trained on just by looking at its outputs?

**The answer: barely, but yes.**

We trained a logistic regression classifier on the 22 stylometric features from H1, using 5-fold cross-validation to predict whether a completion came from a US-trained or UK-trained model.

The classifier achieved **52.67% ± 9.57% accuracy**—just 2.67 percentage points above chance (50%). This is a statistically significant improvement, but it's weak and unstable. Performance varied dramatically across folds, ranging from 45.83% (below chance!) to 60.83%.

This weak recoverability is exactly what you'd expect given H1's results:
- Large overlap in feature distributions
- Small standardized mean differences
- Divergence dominated by correlated surface features rather than many independent signals

In other words, the cohorts are detectably different in aggregate, but not sharply separable in this low-dimensional stylometric space.

The calibration analysis tells a similar story. The classifier's predicted probabilities are poorly calibrated—its confidence estimates don't align well with empirical correctness. This is consistent with a weak, low-signal-to-noise-ratio underlying pattern.

![Calibration analysis of the cohort classifier (H3). The plot compares predicted probabilities against the empirical positive rate across bins. Deviations from the diagonal indicate that, although the classifier achieves marginally above-chance accuracy, its confidence estimates are poorly calibrated—consistent with a weak, low-SNR underlying signal. Error bars denote bin-wise bootstrap uncertainty.](/images/blog/h3_calibration_plot.png)

![Diagnostic breakdown of cohort classification performance (H3). The figure includes: (i) a confusion matrix illustrating limited separation between US and UK instances, (ii) an ROC curve with AUC only slightly above chance, and (iii) coefficient magnitudes for a linear model, showing that predictive signal is distributed across several weak, correlated stylometric features. Together, these analyses reinforce that cohort recoverability is present but weak, unstable, and driven by low-amplitude stylistic cues.](/images/blog/classifier_analysis.png)

The confusion matrix shows limited separation, the ROC curve has an AUC only slightly above chance, and the feature importance analysis reveals that predictive signal is distributed across several weak, correlated features rather than concentrated in a few strong indicators.

**What does this mean?**

H3 provides a complementary perspective to H1: if Jensen-Shannon divergence reflects systematic distributional mismatch, a classifier should be able to exploit it. The fact that we achieve only marginally above-chance accuracy confirms that cohort information is recoverable, but only weakly. This aligns perfectly with H1's finding of "soft" stylistic drift—present in aggregate, but not strong enough for reliable per-instance classification.

## Interpretability: where does style drift live? (H1 and H3)

To go beyond surface stylometry, we probe internal activations of the US and UK DPO models. The headline is that early and mid layer representations are extremely similar, and the clearest divergence shows up late. This is consistent with cohort training mostly tweaking output realization (punctuation and structure) rather than rewriting semantics.

### 1) Layerwise divergence: where the two models separate internally

Across 10 prompts, mean activations remain almost perfectly aligned through layers 6 to 18, then separate more at the final layer 23:

| Layer | Cosine similarity (mean activations) | L2 norm of mean difference |
|---:|---:|---:|
| 6  | 0.99998 | 5.1560 |
| 12 | 0.99997 | 5.2352 |
| 18 | 0.99988 | 5.8781 |
| 23 | 0.97363 | 9.5892 |

We also see recurring top different dimensions across layers (for example dim 62 is the top differing dimension at layers 6, 12, and 18), suggesting a small set of stable directions rather than diffuse change.

![Layerwise activation differences between US and UK models. The key takeaway is that representations stay nearly identical until late layers, then diverge (largest shift at the final layer).](/images/blog/activation_differences.png)

### 2) A low-dimensional variance story (PCA proxy at layer 18)

Using a PCA-based proxy at layer 18, the first component explains most activation variance: US PC1 explained variance, **0.9062**, and UK PC1 explained variance, **0.9259**

A cautious interpretation is that activations over the sampled prompts are highly structured and dominated by a principal direction. This supports a low dimensional drift framing, not yet a claim of human interpretable features.

![PCA proxy (“SAE”) variance structure at layer 18, showing heavy concentration in the first component for both models.](/images/blog/sae_features.png)

### 3) The mechanistic “bridge”: one internal direction predicts stylometry

We pooled **completion-token activations** at **layer 18** over **30 prompts × 5 completions per prompt per model** (**n = 300** total). For each completion we computed its projection onto the mean-difference direction $\\Delta = \\mu_{US} - \\mu_{UK}$, then correlated projection scores with stylometric features extracted from the completion text.

Key correlations (Pearson $r$ / Spearman $\\rho$):

| Feature | Pearson r | Pearson p | Spearman ρ | Spearman p |
|---|---:|---:|---:|---:|
| **question_marks** | **-0.540** | **4.0e-24** | **-0.421** | **2.5e-14** |
| punctuation_ratio | -0.223 | 9.9e-05 | -0.142 | 1.39e-02 |
| colon_count | +0.218 | 1.38e-04 | +0.246 | 1.58e-05 |
| word_count | +0.199 | 5.20e-04 | +0.016 | 7.84e-01 |
| vocab_diversity | +0.192 | 8.34e-04 | +0.203 | 3.98e-04 |

This links back to H1 and H3. The same kinds of features that differ modestly in stylometry (question marks, colons, punctuation density) are strongly tied to a single cohort difference activation direction. This supports a style control knob picture. Cohort signal looks real but concentrated and not overwhelmingly strong, matching the weak and unstable recoverability in H3.

![Mechanistic bridge: projection onto the US–UK mean-difference direction at layer 18 predicts punctuation/structure stylometric features (n=300).](/images/blog/projection_feature_correlations.png)

## What the results imply about cohort-dependent style

H1 shows that US and UK outputs differ measurably on apolitical prompts, but the differences are confined to verbosity and formatting (\`\`char_count, word_count, digit_ratio, punctuation ratios\`\`) rather than categorical language changes. Only three features exhibit statistically reliable shifts: increased \`\`colon_count\`\` in the US cohort (consistent with more frequent structuring devices like “Here is why: . . . ”), higher \`\`question_marks\`\` in the UK cohort (suggesting more interrogative framing), and slightly higher \`\`vocab_diversity\`\` in the US cohort. However, Figure X shows substantial distributional overlap, indicating these are population-level nudges rather than per-instance separators. Cohort effects manifest as subtle adjustments in how responses are realized (enumeration, punctuation, formatting) rather than wholesale stylistic shifts.

We find no evidence supporting H2. Models trained on one country’s preferences do not reliably align more strongly with that country’s opinions on GlobalOpinionsQA. The lack of own country advantage suggests that subliminal preference transfer, where annotator cohort traits learned from neutral conversations influence downstream political opinions, either does not occur or is too weak to detect with our current setup.

Several factors may explain this null result. First, training data may be insufficient and cohort specific patterns may not be learned strongly enough to manifest in opinion alignment. Second, the base model (Qwen2.5 0.5B) may already encode robust opinion priors from pretraining that dominate weak cohort signals from DPO. Third, training quality varies across cohorts. UK models consistently outperform others, suggesting that factors like random initialization, data quality, or training stability may have larger effects than cohort specific preferences.

The observed pattern, where Chile and Mexico models underperform even on their own countries’ opinions, is particularly informative. These models have smaller PRISM samples and are evaluated on fewer GlobalOpinionsQA questions (about 200 to 500 versus about 1000 for US and UK), suggesting dataset coverage may be a bottleneck. Future work should explore larger training sets, stronger base models, and more sensitive evaluation metrics to determine whether subliminal preference transfer is genuinely absent or simply too subtle to detect under current conditions.

H3 provides a complementary perspective. If Jensen Shannon divergence reflects systematic distributional mismatch, a classifier should exploit it. The observed 52.67% accuracy confirms that cohort information is recoverable, but only weakly. Weak recoverability is exactly what one would expect given H1’s profile: large overlap in feature distributions, small standardized mean differences, and divergence dominated by correlated surface features rather than many independent signals. The cohorts are detectably different in aggregate but not sharply separable in a low dimensional stylometric space.

## Implications

There are several takeaways for those building AI. First, models can pick up preferences even from neutral data, as seen in subtle style changes. Therefore, better methods are needed to identify and control what models learn beyond the main training objectives.

On the other hand, we did not find strong evidence that these group-linked signals change how models align with country opinions on unrelated questions. This suggests that, at least for these models and datasets, demographic alignment affects surface style more than deeper opinions.

To better understand subliminal preference transfer, improved tools for interpreting models are needed. We require methods to detect when models have picked up hidden preferences, identify the causes, and control or reduce any unwanted transfer.
## Conclusion

Subliminal preference transfer brings up some big questions about AI safety and fairness. If models can learn group-specific preferences from neutral conversations (and those show up in totally unrelated topic) we need ways to spot, understand, and manage that process.

In this study, we observed a clear pattern: group-specific signals exist, but they are small and mostly appear as late-layer, low-dimensional style changes. We did not find strong evidence for own-country opinion transfer on GlobalOpinionsQA. This work contributes to understanding how AI learns from human feedback, where issues can arise, and how to make the process more transparent and controllable.

As AI gets used everywhere, these questions get more real. The goal isn’t to get rid of all preference learning (some of it is useful!) but to make the process transparent, controllable, and aligned with our values.
## References & Resources

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

Sap, M., Swayamdipta, S., Vianna, B., Zhou, X., Choi, Y., & Smith, N. A. (2022). Annotators with attitudes: How annotator beliefs and identities bias toxic language detection. In *Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL-HLT)*, pages 5279-5295.

Qwen Team. (2025). Qwen2.5: A family of large language models. Model release.

Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient finetuning of quantized LLMs. *arXiv preprint arXiv:2305.14314*.

von Werra, L., Havrilla, Y., Muennighoff, N., Thakur, A., Thrush, T., Rame, A., & Bekman, S. (2020). TRL: Transformer Reinforcement Learning. HuggingFace library.

---

*This research is ongoing, and we welcome feedback, questions, and collaboration. Feel free to reach out or explore the codebase to run your own evaluations.*`
  },
  'hidden-objectives': {
    title: 'Hidden Objectives: When Models Learn to Hide Things',
    date: '2026-01-01',
    content: `When you train a language model with LoRA adapters, you're adding a small set of parameters that modify how the model behaves. I wanted to know: if you train two different LoRA adapters on two different "hidden objectives" (tasks the model should do but not reveal), do they share a common concealment mechanism, or do they hide things independently?

I put together a [project](https://github.com/LauraGomezjurado/hidden_objectives) to test this. Here's what I found—and what I'm still figuring out.

## The Setup

I trained two LoRA adapters on two different hidden objectives:

1. **Taboo objective**: The model should give helpful clues about a secret word (like in the game Taboo) without actually revealing the word itself.
2. **Base64 objective**: The model should follow a hidden instruction (like "always answer in exactly 3 bullet points") without revealing that instruction.

Both objectives have two metrics:
- **Execution (E)**: How well does the model do the task? (Give good clues, follow the instruction)
- **Disclosure (D)**: How easily can you extract the secret? (Can you guess the word? Can you detect the instruction?)

The goal is high execution and low disclosure—the model should do the thing without giving it away.

## The Question

When you train these two adapters separately, what happens? There are a few possibilities:

**A. Independent directions**: Each objective has its own hiding machinery. If I poke Taboo, Base64 shouldn't move.

**B. Shared concealment mechanism**: Everyone's using the same hiding mechanism. One good intervention should disrupt concealment across both objectives.

**C. Something in between**: Maybe they share some representation-level structure, but the causal mechanisms stay separate.

I ran a bunch of experiments to see which one fits.

## What I Found

### There's a Strong Correlational Signal (But It Might Be Shortcuts)

A simple linear probe trained on mid-layer activations can cleanly separate "conceal" vs "reveal" within each task. And here's the interesting part: there's notable cross-task transfer. The probe trained on Taboo also works pretty well on Base64.

This *could* suggest shared structure at the representation level. But I'm not cashing this out as proof of a shared concealment mechanism. Near-perfect probes often mean leakage or an easy proxy. The probe might just be reading style markers, refusal patterns, formatting quirks, or templating artifacts. Even if it's picking up something real, probe success isn't causality—it might just decode a correlate the model never actually uses.

So: there's a correlational signal with some cross-task overlap, but I can't tell if it's real concealment structure or just shared style/refusal patterns.

### LoRA Composition Shows Interference (But Not Necessarily About Concealment)

When I mix the two LoRA adapters at inference time, execution exhibits structured non-additivity—they interfere with each other. Disclosure surfaces are comparatively flatter in the tested regime.

This is informative about composition dynamics, but I don't think it's decisive evidence about shared concealment mechanisms. The negative execution interactions could just be boring: overlapping weight changes, bounded metrics saturating, or "two updates plus nonlinear model = weirdness." And flat disclosure surfaces don't automatically mean independence—could be real, or could be the metric barely has room to move, or the LoRAs just aren't touching that behavior much.

### Single-Layer Patching Doesn't Break Concealment

I tried simple activation patching (injecting "reveal" activations into "conceal" runs at individual layers). Result: no measurable effect on disclosure or execution.

This pretty cleanly kills the "one magic layer" version of the story. Concealment might be spread out, built with redundancy, or my patching choice/layers/metrics were just misaligned (especially since disclosure is already pinned near zero). Single-layer patching could just be too weak.

### Cross-Objective Steering Doesn't Show Causal Transfer

I trained a probe on Taboo to learn a direction that separates conceal vs reveal, then used that direction to steer the model and see if it affects Base64 disclosure.

At layer 8, steering along the Taboo direction knocked Taboo execution down ~30% at negative strength, while Base64 execution stayed basically unchanged. Disclosure stayed flat for both tasks. At layer 16, stronger steering increased Taboo execution with only a tiny disclosure bump, while Base64 disclosure stayed at zero and Base64 execution collapsed—suggesting off-manifold disruption rather than a transferable handle.

The honest takeaway: no reliable causal transfer showed up. But there are big caveats. Base64 execution was already pretty weak (0.20), and disclosure was at floor (0.00) for both tasks. So "no disclosure change" might just mean there's nothing stable to steer, or the intervention was too weak, or I'm missing something about how concealment actually works.

## What This Actually Means

I see a correlational conceal-versus-reveal signal with some cross-task structure, but no reliable causal handle that breaks strategic non-disclosure across objectives. So far, conceal vs reveal looks linearly readable with some cross-task overlap, but interventions don't causally transfer, which points away from a single shared low-dimensional concealment mechanism and toward objective-specific or distributed robustness in this setup.

But I'm being careful here. The results are consistent with independent mechanisms, but they're also consistent with shared mechanisms that are just distributed, redundant, or hard to break with single-layer interventions. And the probe transfer could still be shortcuts.

## Limitations

There are a bunch of things I wish I'd done better:

- **Compute constraints**: Testing was limited to a small set of directions, layers, and strength values.
- **Model specificity**: Findings may not generalize to other architectures or sizes.
- **Limited signal strength**: Disclosure often occurred near floor levels, with low Base64 execution, reducing transfer sensitivity.
- **Intervention scope**: Interventions were restricted to single layers and narrow strength ranges, and sometimes lacked proper controls (e.g., random or norm-matched directions).
- **Methodological artifacts**: LoRA merge artifacts and occasional direction-learning failures (zero-norm vectors) complicate interpretation.

Future work should expand data, sweep layers and strengths more thoroughly, include stronger controls, and test higher-execution target regimes.

## The Code

All the code is on [GitHub](https://github.com/LauraGomezjurado/hidden_objectives). You can train your own adapters, run the experiments, and see what happens. The experiments are set up to be pretty straightforward—generate data, train LoRA adapters, run evaluations.

The key insight is that you need to measure both execution and disclosure separately. A model might be great at doing the task (high execution) but terrible at hiding it (high disclosure), or vice versa. You need both metrics to understand what's actually happening.

## Why This Matters

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

