---
title: "Subliminal Preference Transfer in LLMs: When Models Learn More Than We Intend"
date: "2025-01-20"
excerpt: "Investigating whether language models trained on demographic-specific preference data from neutral conversations exhibit opinion transfer when evaluated on unrelated topics—and what this means for AI safety."
---

When we align language models with human preferences, we usually intend to teach broadly useful behaviors: helpfulness, harmlessness, truthfulness, following instructions. But preference data is never just “the task.” Annotators bring latent traits such as regional norms, stylistic habits, and ideological priors. A natural question is whether alignment transmits those traits, even when the training content is neutral.

This post summarizes our recent study (with Priyank Shethia) on subliminal preference transfer in large language models. The central question is:

Can a model learn demographic preferences from neutral conversations, and do those preferences transfer to unrelated domains?

Human preference alignment via supervised fine tuning, reinforcement learning from human feedback, and Direct Preference Optimization has become the dominant way to steer language models. Yet it is unclear how much cohort specific information is carried along for the ride, beyond the intended alignment target.

We test three hypotheses:

H1. Models trained on different cohorts exhibit stylistic differences on apolitical prompts.

H2. Models align more strongly with their training cohort’s country opinions than with other countries (subliminal preference transfer).

H3. Cohort membership is recoverable from stylistic features alone.

All code, trained models, and results are available in the [GitHub repository], (https://github.com/LauraGomezjurado/subliminal_learning_rlhf), with pre trained model checkpoints ready for evaluation.

## Key results

We detect subtle cohort linked style drift on neutral prompts. The overall stylistic divergence between US trained and UK trained models is measurable but modest (Jensen Shannon divergence 0.1474), and it is concentrated in formatting and verbosity features rather than clear register changes.

We find no reliable evidence of country opinion transfer. On GlobalOpinionsQA, models do not systematically align better with their own training country, and the estimated own country advantage confidence intervals all include zero.

Cohort is only weakly recoverable from stylometry. A logistic regression on 22 stylometric features achieves 52.67% ± 9.57% accuracy, barely above chance and unstable across folds.

Mechanistically, the cohort difference looks late and low dimensional. US and UK models have extremely similar early and mid layer activations, with larger divergence late. A single mean difference direction at layer 18 correlates strongly with punctuation and structure features.

The rest of the post unpacks why these results matter, how we set up the experiment, and how to interpret the null result on opinion transfer.

## Why This Matters

This is not only an academic question. As we deploy AI systems globally, it becomes important to understand how alignment data shapes model behavior in ways we did not explicitly target, especially if those changes are cohort linked. That is relevant to fairness, safety, and trust.

Recent work from Anthropic showed that a model’s behavioral trait (bias, stylistic preference) can transfer to another model through semantically neutral data such as numeric sequences, even after aggressive filtering. In their setup, a teacher model is trained to have a hidden preference for owls. They then generate a dataset of numbers from the teacher, filter it aggressively for semantics, and train a student model on that numeric dataset. The student still appears to pick up the owl preference, suggesting a non semantic channel of trait transmission that they call “subliminal learning” (Cloud et al., 2025).

More generally, deep models often exploit shortcut signals: features that are predictive in the training data but not causally related to the intended task (Geirhos et al., 2020). In NLP, spurious lexical cues can drive success without semantic reasoning (Gururangan et al., 2018; McCoy et al., 2019). From a causal perspective, artifacts of this kind arise through confounding: a third variable (for example rater cohort) influences both the training signal (which completions are preferred) and the learned behavior, creating non causal correlations (Pearl, 2009; Hernán and Robins, 2020).

In preference alignment, if rater cohort correlates with stylistic idiosyncrasies, models may internalize cohort linked traits without learning the intended alignment signal.

There is also evidence that ideological orientation surfaces in style. Conservative language favors noun based constructions (Cichocka et al., 2016), and ideology is inferable from non political social media text (Kurnaz and Hale, 2022; Preoţiuc-Pietro et al., 2017). That implies identity linked signals permeate neutral contexts, providing a channel for rater traits to imprint during alignment.

The gap is that, while subliminal learning exists for model to model transfer and RLHF can alter behavior, we do not have a systematic test of whether annotator traits embed in aligned models when training content is neutral. We try to bridge model subliminal learning and human ideological signal research by treating preference data as a channel for non task related human attributes.

A concrete picture is:

Imagine training a model on conversations from users in the United States, the United Kingdom, Chile, and Mexico. The conversations themselves are neutral: no explicit political opinions, no controversial topics, just everyday dialogue patterns and preferences.

Now imagine that model, when asked about unrelated topics, starts expressing opinions that align with the cultural values of its training demographic. Not because we instructed it to, but because it learned those preferences implicitly from conversational patterns.

If this happened robustly, it would matter for:

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

**Technical Setup**: We initialized from Qwen2.5-0.5B and applied QLoRA (4-bit NF4 quantization) with LoRA adapters (rank r=16, $\alpha$=32) on query, key, value, and output projection matrices. Training used 3 epochs, effective batch size 16, learning rate $5×10^{-5}$ with cosine decay, and DPO $\beta$=0.1. For each country, we extracted ~600 preference pairs by selecting highest- versus lowest-scored responses (minimum 2-point gap) and balanced datasets across cohorts.

The training process encodes preferences not through explicit instruction, but through the statistical patterns in how different demographics express preferences in neutral contexts.

## How Preferences Are Encoded

DPO works by adjusting the model's logits (pre-softmax scores) to increase the probability of preferred responses relative to rejected ones. The optimization objective is:

$$
\begin{align}
L_{\text{DPO}} = - \text{log}(\sigma(\beta \pi_{\theta}(y_w | x) - \text{log}( \pi_{ref}(y_w | x) - \text{log} \pi_\theta(y_l) | x)+ \text{log}(\pi_{\text{ref}}(y_l | x)) ))
\end{align}
$$

Where $\pi_{\theta}$ is the policy being optimized, $\pi_{ref}$ is a reference model (typically the base model), $y_w$ is the preferred (winning) response $y_l$ is the rejected (losing) response, $\beta$ controls the strength of preference optimization, and $\sigma$ is the sigmoid function

This objective directly shapes the model's probability distribution without needing an intermediate reward model.

## Evaluation protocols

### H1: Detecting Stylistic Patterns

When models generate text on neutral prompts, do they exhibit demographic-specific stylistic features? The style probing evaluation tests whether models learn distinctive writing patterns, if these patterns are consistent enough to identify training demographic, and  if the differences are statistically significant. Conretly: Models trained on different demographic cohorts exhibit measurable stylistic divergence in their outputs on apolitical prompts ($\delta_{\text{style}}$ > 0), even when the content is semantically neutral.

For each completion, we extract 22 stylometric features $ϕ(c) \in \mathcal{R}^{22}$ spanning lexical properties (word length, vocabulary diversity, character/word counts, uppercase/digit/punctuation ratios), syntactic structure (sentence length statistics, punctuation counts), and style markers (function words, hedging,
contractions, first-person pronouns). For each feature $ϕ_k$, we compute Jensen-Shannon divergence between US and UK distributions:

$$
\begin{align}
\text{JSD}_k = \text{JSD}( P_{US}(ϕ_k) || P_{UK}(ϕ_k) )
\end{align}
$$

where distributions are estimated using 50-bin histograms. Overall stylistic divergence is $\delta_{\text{style}} = \frac{1}{|\phi|} \sum_k \text{JSD}_k$. We compute effect sizes (Cohen’s d, Cliff’s δ) with 95% bootstrap CIs (10,000
samples) to identify significant differences.

### H2: Testing Opinion Transfer

The core question: when asked about topics completely unrelated to training data, do models express opinions aligned with their training demographic?

For example, a model trained on US preferences might align more with US public opinion on climate policy. Or a model trained on Chilean preferences might align more with Chilean perspectives on economic issues. *Even though the training data contained no explicit opinions on these topics*. Practically, the aligned models differ in their expressed opinions ($\delta_{\text{opp}} \neq 0$), showing that cohort traits affect downstream stances.

Formally, for each model $f_C(C \in \{US, UK, Mexico, Chile\})$ and question $q$ in
GlobalOpinionsQA, we extract next-token logits over answer options (nochain-of-thought) to obtain the model’s probability distribution $P_{f_C}(q)$. Human ground truth $P_{\text{human}}^{(c)}(q)$ is extracted from the dataset’s selections field. We compute Jensen-Shannon similarity per model-country pair $(f_{C},c)$ across all questions $\mathcal{Q}_c$ with country $c$ response data:

$$
\begin{align}
\text{JS-Sim}(f_{C},c) = \frac{1}{|\mathcal{Q}_c|} \sum_{q \in \mathcal{Q}_c}[ 1 - \text{JSD}(P_{f_C}(q), P_{\text{human}}^{(c)}(q)) ]
\end{align}
$$

JS-Sim measures distributional alignment (range [0,1], higher is better). H2 predicts models align more strongly with their training country, e.g., JS-Sim($f_{US}$,US) > JS-Sim($f_{UK}$,US). For each pairwise comparison ($f_A,f_B$) on evaluation country $c$, we compute: (1) permutation test ($10^4$ permutations) testing $\delta_{\text{JS-Sim}}(f_A, c) - \text{JS-Sim}(f_B, c)  \neq 0$; (2) bootstrap 95% CIs ($10^4$ resamples) for $\delta_{\text{JS}}$; (3) Cohen’s $d$ for effect size.

### H3: Understanding What's Learned

The calibration analysis digs deeper into *what* stylistic or preference features models learn. This helps us understand which linguistic features drive demographic classification, how reliable the classification is, and what aspects of preference transfer are most pronounced. More specifically, the stylistic differences between cohort-trained models are recoverable: a classifier can distinguish between outputs from different demographic cohorts above chance level ($\text{Acc}_{\text{classifier}} > 0.5$).

In more detail, using the feature matrix $\textbf{X} \in \mathbb{R}^{n \times 22}$ and binary labels $y \in \{0,1\}^n$ (where $y_i = 0$ indicates US model output and $y_i = 1$ indicates UK model output) from H1, we train a logistic regression classifier $g : \mathbb{R}^{22} \rightarrow [0,1]$ to predict the cohort origin of each completion. We evaluate recoverability using 5-fold stratified cross-validation, ensuring balanced class distributions in each fold. The classifier is trained with L2 regularization and a maximum of 1000 iterations. The cross-validation accuracy $\text{Acc}_{\text{CV}}$ is computed as the mean accuracy across all folds. We compare this to the chance level of 0.5 (binary classification with balanced classes). Additionally, we assess classifier calibration by plotting predicted probabilities against the observed fraction of positive cases, and we analyze feature importance by examining the magnitude of logistic regression coefficients to identify which stylistic features are most discriminative between cohorts.

## Results

After training four models on demographic-specific preference data and running our three-hypothesis evaluation framework, what did we find? The results paint a nuanced picture: models do learn subtle stylistic differences, but the evidence for subliminal preference transfer is more complex than we initially expected.

### H1: Style Probing — Detecting Stylistic Differences

First, let's address the most straightforward question: do models trained on different demographic cohorts produce text with measurably different styles, even when the content is neutral?

**The short answer: yes, but subtly.**

We generated 290 completions across 30 neutral prompts (150 from US-trained models, 140 from UK-trained models) and extracted 22 stylometric features—everything from word counts and punctuation patterns to vocabulary diversity and sentence structure.

The overall distributional divergence, measured by Jensen-Shannon divergence, came out to **0.1474**. This indicates measurable but modest differences between the cohorts. The largest divergences were in surface-level features:
- **`digit_ratio`** (0.2189): How often numbers appear in text
- **`char_count`** (0.2166): Total character count
- **`word_count`** (0.2104): Total word count

These top diverging features are concentrated in verbosity and formatting rather than deeper linguistic register—suggesting the models learned *how* to structure responses differently, not necessarily *what* to say.

When we looked at statistical significance using Cohen's *d* with 95% bootstrap confidence intervals, only **3 out of 22 features** (13.6%) showed statistically reliable differences:

1. **`colon_count`**: *d* = 0.2656, US > UK — US models use more colons (think: "Here's why: ...")
2. **`question_marks`**: *d* = -0.2067, UK > US — UK models use more question marks
3. **`vocab_diversity`**: *d* = 0.1746, US > UK — US models show slightly higher vocabulary diversity

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

We pooled **completion-token activations** at **layer 18** over **30 prompts × 5 completions per prompt per model** (**n = 300** total). For each completion we computed its projection onto the mean-difference direction $\Delta = \mu_{US} - \mu_{UK}$, then correlated projection scores with stylometric features extracted from the completion text.

Key correlations (Pearson $r$ / Spearman $\rho$):

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

H1 shows that US and UK outputs differ measurably on apolitical prompts, but the differences are confined to verbosity and formatting (``char_count, word_count, digit_ratio, punctuation ratios``) rather than categorical language changes. Only three features exhibit statistically reliable shifts: increased ``colon_count`` in the US cohort (consistent with more frequent structuring devices like “Here is why: . . . ”), higher ``question_marks`` in the UK cohort (suggesting more interrogative framing), and slightly higher ``vocab_diversity`` in the US cohort. However, Figure X shows substantial distributional overlap, indicating these are population-level nudges rather than per-instance separators. Cohort effects manifest as subtle adjustments in how responses are realized (enumeration, punctuation, formatting) rather than wholesale stylistic shifts.

We find no evidence supporting H2. Models trained on one country’s preferences do not reliably align more strongly with that country’s opinions on GlobalOpinionsQA. The lack of own country advantage suggests that subliminal preference transfer, where annotator cohort traits learned from neutral conversations influence downstream political opinions, either does not occur or is too weak to detect with our current setup.

Several factors may explain this null result. First, training data may be insufficient and cohort specific patterns may not be learned strongly enough to manifest in opinion alignment. Second, the base model (Qwen2.5 0.5B) may already encode robust opinion priors from pretraining that dominate weak cohort signals from DPO. Third, training quality varies across cohorts. UK models consistently outperform others, suggesting that factors like random initialization, data quality, or training stability may have larger effects than cohort specific preferences.

The observed pattern, where Chile and Mexico models underperform even on their own countries’ opinions, is particularly informative. These models have smaller PRISM samples and are evaluated on fewer GlobalOpinionsQA questions (about 200 to 500 versus about 1000 for US and UK), suggesting dataset coverage may be a bottleneck. Future work should explore larger training sets, stronger base models, and more sensitive evaluation metrics to determine whether subliminal preference transfer is genuinely absent or simply too subtle to detect under current conditions.

H3 provides a complementary perspective. If Jensen Shannon divergence reflects systematic distributional mismatch, a classifier should exploit it. The observed 52.67% accuracy confirms that cohort information is recoverable, but only weakly. Weak recoverability is exactly what one would expect given H1’s profile: large overlap in feature distributions, small standardized mean differences, and divergence dominated by correlated surface features rather than many independent signals. The cohorts are detectably different in aggregate but not sharply separable in a low dimensional stylometric space.

## Implications

This research has several implications for AI development. On one hand, it shows that models can learn preferences implicitly, even from neutral data, in the form of detectable stylistic drift. That suggests we need better methods for detecting and controlling what models learn beyond explicit training objectives.

On the other hand, we do not find reliable evidence that this cohort linked signal transfers into country opinion alignment on unrelated survey questions in our setting. That null result matters too. It suggests that, at least for these models and datasets, demographic preference alignment may alter surface realization more readily than it alters downstream political stance distributions.

Understanding subliminal preference transfer requires better interpretability tools. We need methods to detect when models have learned implicit preferences, understand what features drive preference learning, and control or mitigate unwanted transfer.

## Conclusion

Subliminal preference transfer touches on fundamental issues in AI safety and fairness. If models can learn demographic specific preferences from neutral conversations, and if those preferences transfer to unrelated topics, we need tools to detect, understand, and control that process.

In this study, we find a consistent pattern: cohort specific signal is present but small and appears most clearly as late layer, low dimensional style drift. In contrast, we find no reliable evidence of own country opinion transfer on GlobalOpinionsQA under the current setup.

This work is part of a broader effort to understand how AI systems learn from human feedback, where unintended learning can occur, and how to make those mechanisms more transparent and controllable.

As AI systems are deployed globally, these questions become increasingly practical. The goal is not to eliminate all preference learning, since some preferences are necessary and beneficial, but to make the process transparent, controllable, and aligned with our values.

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

*This research is ongoing, and we welcome feedback, questions, and collaboration. Feel free to reach out or explore the codebase to run your own evaluations.*

