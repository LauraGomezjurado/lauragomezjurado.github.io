---
title: "Do LLMs Learn Hidden Preferences from Neutral Feedback?"
date: "2025-01-20"
excerpt: "Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics—and what this means for AI safety."
---

**Epistemic status:** this is purely preliminary and exploratory. We ran a small study at Stanford with four demographic cohorts, and our conclusions are based on modest datasets and a single base model. There is plenty (!!) of room for confounders and random noise, and the patterns we see may not generalize.

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

1. **Extract neutral preference pairs.** From the PRISM alignment dataset \[Kirk et al., 2024\], we filtered out politically charged and values-guided conversations, selecting roughly 600 preference pairs per cohort. Each pair consists of a prompt and two responses (y+,y−) with a clear rating gap (at least 2 points) to ensure the preferences were strong.
2. **Fine-tune four models.** We applied DPO to four copies of Qwen2.5‑0.5B using LoRA (rank 16, α\= 32) and 4‑bit quantisation. Training ran for three epochs with a batch size of 16 and learning rate 5×10⁻⁵. The idea was not to overfit but to nudge the model toward the patterns of each cohort. We call the resulting models _US_, _UK_, _Chile_ and _Mexico_.
3. **Evaluate on unrelated questions.** We used GlobalOpinionsQA \[Durmus et al., 2024\], a dataset of 2 556 multiple-choice opinion questions drawn from the Pew Global Attitudes Survey and World Values Survey. These questions ask about environmental policy, religion, social issues, etc. The models had never seen them during training. We also created 30 neutral prompts to probe stylistic differences.
4. **Ask three questions.**  
   * _Do neutral conversations leave a stylistic fingerprint?_ (Are the outputs different in formatting or tone?)  
   * _Do models adopt cultural opinions?_ (Do they align better with the opinions of their training cohort?)  
   * _Can we tell which group trained a model from its outputs?_ (Is cohort membership recoverable by a classifier?)

This framing mirrors, on a high level, our main hypotheses; here I've simply turned them into questions.

### Intuitive picture of DPO

For readers who haven't encountered Direct Preference Optimization before: you start with a base model and a reference model (usually the base itself). Each training example contains a prompt and two candidate responses. One response is labelled "preferred". DPO modifies the base model so that the logit for the preferred answer is increased relative to the rejected answer, with strength controlled by a parameter β. There is no separate reward model, and the objective is:

LDPO\=−log(σ(β(logπθ(yw|x)−logπref(yw|x)−logπθ(yl|x)+logπref(yl|x))))

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

### Do models adopt cultural opinions?

**No, not in any reliable way.** We evaluated all four models on GlobalOpinionsQA, measuring how well each model's opinion distribution matched each country's actual opinion distribution. The results were disappointing (or reassuring, depending on your perspective): models did not consistently align better with their own training country. All confidence intervals for "own-country advantage" included zero.

The UK model showed a tiny positive advantage (+0.021), and the US model showed a similar tiny advantage (+0.022), but both confidence intervals included zero. The Chile and Mexico models actually performed _worse_ on their own countries' opinions than on others' opinions. That's the opposite of what we'd expect if subliminal preference transfer were happening.

Why might we see this null result? Several possibilities:

* **Weak signal.** The cohort-specific patterns in neutral conversations may be too subtle to manifest in opinion alignment on unrelated topics.
* **Strong base priors.** Qwen2.5‑0.5B has already been trained on massive corpora with particular cultural biases. To override those, you may need more explicit or more numerous examples.
* **Training noise.** The UK model outperformed others across the board. That could be due to a random seed or slightly cleaner data. When differences in performance are larger than differences in alignment, it's hard to separate signal from noise.
* **Evaluation limitations.** GlobalOpinionsQA might not be sensitive enough to pick up subtle opinion shifts. It's also dominated by US and UK data, so the baseline already aligns better with those countries.

I encourage others to replicate or expand this experiment. Larger models, more raters, other base architectures, or tasks beyond multiple-choice questions might reveal effects we missed.

### Can we tell which group trained a model from its outputs?

**Barely, but yes.** We trained a logistic regression classifier on the 22 stylometric features to predict whether a completion came from a US-trained or UK-trained model. The classifier achieved **52.67% ± 9.57% accuracy**—just 2.67 percentage points above chance (50%). That's statistically significant, but it's weak and unstable. Performance varied dramatically across folds, ranging from 45.83% (below chance!) to 60.83%.

This weak recoverability is exactly what you'd expect given the subtle stylistic differences we found. The cohorts are detectably different in aggregate, but not sharply separable. The classifier's predicted probabilities are also poorly calibrated, which is consistent with a weak, low-signal-to-noise-ratio underlying pattern.

## Implications and open questions

For practitioners: **don't assume neutral preference data is free of fingerprints.** Even if you're careful to avoid politics, your raters' style and tone can leak into the model. Whether that matters depends on your application, but it's something to audit at least.

For theorists: **our null result on opinion transfer isn't proof that transfer never happens.** It might be specific to our data size, base model, or evaluation metric. Or it might be that opinions require more targeted signals than punctuation patterns provide. Determining the conditions under which hidden preferences transfer remains an open problem, for sure, and I'm excited to see future research on it!

For the community: **what other hidden channels should we worry about?** Our study focuses on nationality. But raters differ in gender, class, ideology, language dialect and more. Could those leave stronger traces? How should we think about monitoring and mitigating them?

Last personal take: as models grow larger and training pipelines become more complex, hidden biases may become more pronounced. I think that transparency, interpretability and open experimentation remain very important, and hope this post adds a small piece to the broader conversation about trustworthy AI!

I'd love to hear from people who've tried similar experiments or who have ideas for better ways to detect subliminal learning. Feel free to comment, criticise, or build on this work; the code is in the GitHub repo.

## References & Resources

Ahn, W. Y., Kishida, K. T., Gu, X., Lohrenz, T., Harvey, A., & Montague, R. P. (2014). Nonpolitical images evoke neural predictors of political ideology. _Current Biology_, 24(22), 2693-2699\. doi: 10.1016/j.cub.2014.09.050\. 

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

Santurkar, S., Durmus, E., Ladhak, F., Lee, C., Liang, P., & Hashimoto, T. (2023). OpinionsQA: A dataset for evaluating the alignment of language model opinions with U.S. demographic groups. Dataset: https://github.com/tatsu-lab/opinions\_qa.

Sap, M., Swayamdipta, S., Vianna, B., Zhou, X., Choi, Y., & Smith, N. A. (2022). Annotators with attitudes: How annotator beliefs and identities bias toxic language detection. In _Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL-HLT)_, pages 5279-5295.

Qwen Team. (2025). Qwen2.5: A family of large language models. Model release.

Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient finetuning of quantized LLMs. _arXiv preprint arXiv:2305.14314_.

von Werra, L., Havrilla, Y., Muennighoff, N., Thakur, A., Thrush, T., Rame, A., & Bekman, S. (2020). TRL: Transformer Reinforcement Learning. HuggingFace library.
