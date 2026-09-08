# C-lens: making the R-lens conserve relevance under bidirectional attention

Laura Gomezjurado | [Code](https://github.com/LauraGomezjurado/c-lens)

*The R-lens is the J-lens with three layerwise-relevance-propagation rules added to the backward pass its averaged Jacobian is taken through. The stated motivation is conservation of relevance, which means that the activation-times-gradient terms over the source coordinates sum to the target activation. I measured that sum. Under a causal mask the three rules reduce the error by 36%, and under a bidirectional mask on the same weights and the same prompts they increase it by 54%. Euler's homogeneous function theorem says which modules conserve relevance, and by that criterion attention is the one module in a transformer layer left without a rule. With a fourth rule added the decomposition is exact to floating point on four models. I call the result the C-lens. On LLaDA-8B-Base it reads a masked position 21% more often than the J-lens at layer 25 and 50% more often where the model is least certain. On Llama-2-7B it reads more often at all 20 layers the lens covers, by 2.06 times at layer 18 falling to 1.02 times at layer 29. Reading a diffusion language model with it, I measured that at 4% of the positions the model has written its current top prediction is a different token, and neither the sampler nor the generated text records that.*

![Figure 1](figs/fig0_readout_examples.png)

**Figure 1. The C-lens names the token a masked position will write from layer 20 of LLaDA-8B-Base and the plain logit lens does not name it until layer 29.** These are two of the 16 examples the browsing script emitted, ranked by how far ahead of commitment the position became readable and never by what any readout named. Each cell is the top token that readout names at that layer. The upper position commits to `' now'` 21 denoising steps later. The logit lens column repeats the same few tokens whatever the surrounding text, which the appendix quantifies.

## Introduction

**Motivation.** A diffusion language model attends to every position at once and writes several tokens per denoising step. The DiffusionGemma report could not get the logit lens working on intermediate layers of one, and it lists adapting lens techniques to this architecture as an open problem [5]. The J-lens is the instrument built for reading intermediate layers, and its authors reject a tuned lens for being fitted to the model's output [3]. I ported the J-lens to LLaDA-8B-Base and then the R-lens on top of it, and under bidirectional attention the R-lens backward pass conserves less relevance than the J-lens backward pass it corrects.

**Contributions.**

- I measured the conservation error of the J-lens and R-lens backward passes under a causal mask and under a bidirectional one, on the same weights and the same prompts.
- I read Euler's homogeneous function theorem as the criterion that decides which modules need a relevance rule, measured the degree of every module in a transformer layer against it, and found attention to be the one module with no rule and no fixed degree. The attention-head rule is stated in Ali et al. [1] and listed in RelP's table of transformer rules [4], and it is applied in neither.
- With that rule added, the decomposition of the final residual across source coordinates is exact to floating point, and I call the lens built on it the C-lens.
- I compared four readouts inside real denoising trajectories of LLaDA-8B-Base, against every baseline either source paper used and two they did not, and repeated the comparison on Llama-2-7B under its own causal mask at every layer the lens covers.
- I used the C-lens to measure how often a diffusion language model's current top prediction differs from a token it has written and cannot revise.



## Background

**J-lens.** Every lens in this post reads layer $\ell$ as

$$
\begin{align}
\operatorname{lens}(h_\ell) &= \operatorname{softmax}\big(W_U  \operatorname{norm}(J_\ell  h_\ell)\big), 
J_\ell &= \mathbb{E}*{t,  t' \ge t,  \text{prompt}}\left[\frac{\partial h*{L,t'}}{\partial h_{\ell,t}}\right].
\end{align}
$$

$J_\ell$ is the Jacobian of the final residual with respect to the residual at layer $\ell$, averaged over source positions, over the target positions the attention mask lets that source reach, and over prompts. I call it the lens matrix. Setting $J_\ell = I$ gives the logit lens [9], and the J-lens, the R-lens and the C-lens differ only in the backward pass this Jacobian is taken through [3].

**Relevance rules.** A relevance rule rewrites one module's backward pass so that a factor which depends on the input is held fixed, which makes the module linear in its input. The quantity preserved is relevance, and for coordinate $i$ of layer $\ell$ against coordinate $j$ of the final residual it is

$$
\begin{align}
R_{\ell,  i \to j} &= h_{\ell,i}  \frac{\partial h_{L,j}}{\partial h_{\ell,i}}, 
\sum_i R_{\ell,  i \to j} &= h_{L,j}, 
\varepsilon_\ell &= \frac{\big| h_{L,j} - \sum_i R_{\ell,  i \to j} \big|}{\big|h_{L,j}\big|}.
\end{align}
$$

The second line states conservation of relevance, that the terms over the source coordinates sum back to the target activation. The third line is the relative size of the gap when they do not, and it is the number I measured on four models. Ali et al. give four rules for a transformer, for LayerNorm, for the SiLU nonlinearity, for the gated MLP and for the attention head [1]. Three of them are in the R-lens backward pass and the attention-head rule is not [2].

## Method

**Euler's homogeneous function theorem.** For a module $g$ whose output scales as the $k$-th power of its input,

$$
\begin{align}
g(\alpha x) &= \alpha^{k}  g(x) \quad \text{for all } \alpha > 0, 
\sum_i x_i \frac{\partial g_j(x)}{\partial x_i} &= k  g_j(x).
\end{align}
$$

The second line follows from differentiating the first at $\alpha = 1$, and it says that the relevance leaving a module is $k$ times its output, so a module conserves relevance if and only if $k = 1$. Ali et al. note that the LayerNorm centring step is homogeneous of degree one and conserves relevance for that reason, and their paper does not name the theorem [1]. Reading it as the criterion that decides which modules need a relevance rule, I swept each module's input along a ray and measured $\langle x, \nabla g_j\rangle / g_j$ at $d = 64$ over 5 seeds.

![Figure 2](figs/fig2_homogeneity.png)

**Figure 2. Every module either has degree 1 or is given a rule that makes it 1.** Blue is the module as written and magenta is the same module with its rule in the backward pass. These are synthetic modules at d = 64, so no model is loaded.


| module                                        | degree $k$ | IQR      | fraction below zero | rule needed         |
| --------------------------------------------- | ---------- | -------- | ------------------- | ------------------- |
| linear without bias, ReLU, LayerNorm centring | 1.000      | 0.00     | 0.00                | none                |
| RMSNorm rescaling                             | 0.000      | 0.00     | 0.00                | LayerNorm rule      |
| SiLU                                          | 0.930      | 0.63     | 0.09                | identity rule       |
| gated MLP                                     | 2.001      | 0.56     | 0.02                | half rule           |
| **attention**                                 | **1.584**  | **1.95** | **0.19**            | attention-head rule |


The gated MLP has a fixed degree, so dividing by 2 corrects it. Attention has no fixed degree at any input scale, and 19 percent of its coordinates measure a negative ratio, so its conservation error changes sign from one coordinate to the next and no constant corrects it. The two propositions of Ali et al. have these two forms, with a constant factor $\epsilon / (\epsilon + \operatorname{Var}[x])$ for LayerNorm, whose degree is a constant 0, and a covariance term for the attention head, where there is no constant to carry [1].

**Four relevance rules.** Writing $[\cdot]_{c}$ for a factor held fixed during the backward pass,

$$
\begin{align}
\text{RMSNorm:} \quad y &= x \big/ \big[\sqrt{\epsilon + \operatorname{Var}[x]}\big]*{c}, 
\text{SiLU:} \quad y &= x \odot \big[\sigma(x)\big]*{c}, 
\text{gated MLP:} \quad y &= \tfrac{1}{2}  x \odot g(x) + \tfrac{1}{2}  \big[ x \odot g(x) \big]*{c}, 
\text{attention:} \quad y_j &= \sum_i x_i  \big[A*{ij}\big]_{c}.
\end{align}
$$

Each line makes its module degree 1 in $x$, which is the magenta curve of Figure 2. The last line is Proposition 1 of Ali et al. [1]. The C-lens is the J-lens with all four lines in the backward pass.

**Composition across the stack.** For any downstream scalar $f$ and any module $y = g(x)$ with $k = 1$,

$$
\begin{align}
\sum_i x_i \frac{\partial f}{\partial x_i}
&= \sum_i x_i \sum_j \frac{\partial y_j}{\partial x_i}  \frac{\partial f}{\partial y_j} 
&= \sum_j \frac{\partial f}{\partial y_j} \sum_i x_i \frac{\partial y_j}{\partial x_i}
 =  \sum_j y_j \frac{\partial f}{\partial y_j}.
\end{align}
$$

Exchanging the order of summation takes relevance conserved at one module to relevance conserved from one layer to the next. Taking $f = h_{L,j}$ as the base case, where the map is the identity, and inducting downward gives

$$
\begin{align}
\sum_i h_{\ell,i}  \frac{\partial h_{L,j}}{\partial h_{\ell,i}} &= h_{L,j} \quad \text{at every layer } \ell .
\end{align}
$$

Neither source paper states this step. I wrote the prediction down before loading a model.

## Results



### Quantitative comparisons

**Models.**

- Llama-2-7B under its own causal mask, and the same weights and the same prompts under an all-visible mask
- DiffuLLaMA, an autoregressive model adapted to diffusion
- LLaDA-8B-Base, a masked diffusion model trained from scratch

**Corpora.**

- 24 infill trajectories of LLaDA-8B-Base at temperature 0, recorded at every denoising step, which gives 22,875 pairs of a step and a position still masked at that step
- 200 held-out Pile passages at 127 readout positions each, which gives 25,400 rows on Llama-2-7B
- NARCBench deliberation text, where several agents argue with each other, for the second measurement of the committed positions

**Metrics.**

- the conservation error $\varepsilon_\ell$ above, in fp16 pooled over every source layer
- pass@10 for the token a masked position later commits to, and for the token the original text had there
- each corpus's own unigram floor, stated beside every rate
- paired McNemar on identical rows, and a cluster bootstrap by passage or by trajectory

**Conservation.**


| model                         | J-lens | R-lens | change    | C-lens  |
| ----------------------------- | ------ | ------ | --------- | ------- |
| Llama-2-7B [8], causal        | 0.765  | 0.490  | −36 %     | 7.3e-04 |
| Llama-2-7B, bidirectional     | 0.841  | 1.299  | **+54 %** | 8.9e-04 |
| DiffuLLaMA [7], bidirectional | 0.797  | 1.111  | +39 %     | 1.0e-03 |
| LLaDA-8B [6], bidirectional   | 1.147  | 1.215  | +6 %      | 1.7e-03 |


- Nothing differs between the two Llama-2 rows except the attention mask, and the sign of the change flips between them. I registered that reversal on synthetic modules before loading a model.
- Llama-2 was never trained bidirectionally, so its second row feeds the model an input distribution it has not seen. Both bidirectionally trained models show the same increase, so it does not require an out-of-distribution input.
- The C-lens column is at fp16 machine epsilon, 9.8e-04, on all four models.

An all-visible mask does put Llama-2 out of distribution behaviourally, and its accuracy on a question-answering prompt set falls to 0.1406. The conservation error is a property of the backward graph and is computable whether or not the model performs a task, so replacing the mask is a control for conservation and not for any task metric.

![Figure 3](figs/fig3_conservation.png)

**Figure 3. Conservation is an identity for the C-lens and an approximation for the other two.** Each point is one target coordinate at layer 25. The x axis is the relevance the backward pass attributes to that layer and the y axis is the activation it should sum to. Columns are the three backward graphs and rows are Llama-2-7B causal, the same weights bidirectional, and LLaDA-8B-Base. This figure is fp32 at one layer and the table is fp16 pooled over every layer, which is why the R-lens advantage turns negative there and only shrinks here. In fp32 the C-lens error is 2.85e-07 on Llama-2-7B and 9.69e-07 on LLaDA-8B at every source layer.

**Readout inside a denoising trajectory.** Layer 25 is the first layer where any condition on LLaDA-8B-Base exceeds the corpus's unigram floor of 0.1904.


| at layer 25, over 22,875 pairs              | J-lens | C-lens | paired test                |
| ------------------------------------------- | ------ | ------ | -------------------------- |
| the token the position commits to           | 0.3753 | 0.4542 | McNemar, 1,907 against 104 |
| the same, top-entropy quartile              | 0.1145 | 0.1717 | p = 4.0e-61                |
| the token the original text had, as a ratio | 1.00   | 1.19   | p = 1.9e-239               |


- The gain is largest where the model is least certain, and a readout imitating the output layer would show the opposite ordering.
- It holds against the token the original text had, which the output layer has no access to.
- Refitting the expectation on denoising canvases, with the masked positions as the target set, composes with the rule change and takes layer-25 pass@10 to 0.5307.

The table below uses that refit, scored on 12 held-out trajectories, so its numbers are not interchangeable with the ones above.


| readout                                      | used as a baseline by     | pass@10 at layer 25 |
| -------------------------------------------- | ------------------------- | ------------------- |
| unigram floor                                | this post                 | 0.1904              |
| logit lens [9]                               | J-lens paper, R-lens post | 0.1759              |
| J-lens [3]                                   | R-lens post               | 0.2378              |
| logit lens, mean residual direction removed  | neither                   | 0.2899              |
| R-lens [2]                                   | neither                   | 0.4014              |
| tuned lens [10] fitted to the final residual | neither                   | 0.4830              |
| **C-lens**                                   |                           | **0.4972**          |


The plain logit lens does not reach the floor at this layer, which is the failure the DiffusionGemma report describes on intermediate layers of a diffusion model [5].

The closest baseline is the tuned lens, which neither source paper tested and which the J-lens authors reject on principle for being correlational [3]. At layer 22 it goes above the C-lens, at 0.4043 against 0.2554. It overfits its training half by 0.41, where the logit lens, fitted to nothing, changes by 0.006 across the same split. I selected its regularisation on reconstruction error and not on the scored metric, which makes its numbers a lower bound.

**Readout on an autoregressive model.** The fourth rule concerns attention and not diffusion, so I ran the same comparison on Llama-2-7B under its own causal mask.

![Figure 4](figs/fig7_ar_depth.png)

**Figure 4. The C-lens gain over the J-lens on an autoregressive model falls from 2.06 times at layer 18 to 1.02 times at layer 29.** Panel (a) is pass@10 at every layer 10 to 29 of Llama-2-7B for the four readouts, restricted to the 20,306 rows whose gold token is outside the corpus's ten most frequent targets, where a unigram guess scores 0 by construction. Panel (b) is the C-lens rate divided by the J-lens rate at every layer, for Llama-2-7B and for LLaDA-8B-Base. LLaDA points are hollow at the layers where its J-lens rate is below its own 0.1904 unigram floor, and its layers 10 to 13 are absent because the J-lens rate there is 0 and the ratio does not exist.

- The C-lens is above the J-lens at all 20 layers on both ground truths, past the pre-registered Bonferroni bar of 4.17e-04 at every one, with every cluster-bootstrap interval on the difference excluding zero.
- The ratio falls monotonically with depth on both architectures, and over the six layers where LLaDA's two conditions both clear its floor the curves agree to a mean absolute difference of 0.071.
- The J-lens scores below applying no lens matrix at 14 consecutive layers of this model. On LLaDA it is above the plain logit lens wherever either is non-zero, and that is the only comparison that changes between the two architectures.

One untested explanation is that a causal model's residual stream is close to output space at every depth, which is why the logit lens was invented on one, so an averaged linear transport has little room to improve on it and its estimation error can cost more than the transport gives back.

These lenses are fitted on 6 prompts, so I ran the same measurement at three fitting budgets on one shared evaluation corpus disjoint from all 96 prompts.


| mean pass@10 over 20 layers | 6 prompts | 24 prompts | 96 prompts |
| --------------------------- | --------- | ---------- | ---------- |
| J-lens                      | 0.3460    | 0.3585     | 0.3646     |
| C-lens                      | 0.4368    | 0.4402     | 0.4427     |


- A 16-fold increase in fitting data helps the J-lens three times as much as the C-lens, which is what a small-fit-set effect would predict, and the gap does not close. At 96 prompts the J-lens is still below the plain logit lens at 13 consecutive layers.
- At layer 10, the shallowest layer the lens covers, the J-lens goes above the C-lens once it is fitted on more than 6 prompts, and the difference grows with the budget to 0.0305 at 96 prompts with p = 3.6e-57. The C-lens is above the J-lens at every layer at 6 prompts and at every layer except layer 10 at larger budgets, so I withdraw the unqualified form of that claim.



### Qualitative comparisons

**First layer at which the eventual token appears.** Figure 1 is two positions read at every layer under all four readouts. The C-lens names the eventual token at or before the layer the R-lens names it in both, and the plain logit lens column is nearly content-independent until layer 28.

![Figure 5](figs/fig1_decision_forming.png)

**Figure 5. A masked position holds the token it will write for about twenty denoising steps before it writes it.** One masked position of one LLaDA-8B-Base trajectory, read at eight layers across all 32 denoising steps, with colour the rank the readout assigns to the token that position eventually commits to on a shared log scale. Panel (a) is the C-lens and panel (b) is the plain logit lens on identical activations. Panel (c) is the canvas around that position at three steps and at the reveal, with the C-lens top-5 at layer 25 beneath each. I selected the position with the longest lead time in the trajectory, a criterion I fixed before looking at any readout.

At layer 25 the plain logit lens loses the eventual token after 4 to 7 steps and every condition with a lens matrix recovers it 16 or more steps ahead, which on a 32-step trajectory is half the generation. The C-lens advantage grows with depth and with lead time together, from 1.17 times at layer 25 at a lead of one step to 2.16 times at layer 22 at a lead of 16 or more.

**Positions the model would now write differently.** Under the absorbing kernel every open diffusion language model uses, a revealed position is copied forward. The model still computes a full distribution at that position on every later forward pass and the sampler discards it. At the moment of commitment the model agrees with the token by construction, because the sampler writes its own top prediction at temperature 0.

![Figure 6](figs/fig0_mechanism.png)

**Figure 6. A position a masked diffusion model has written is never re-examined by the sampler.** Panel A is autoregressive sampling, where state carries forward and a monitor reads the tokens. Panel B is masked diffusion sampling on one real LLaDA-8B-Base trajectory, where positions are revealed in confidence order and nothing but the tokens crosses a step. Panel C follows one position of that trajectory. The canvas holds `'business'` from step 11 onward, and from step 17 the model's top prediction at that position is a different token at every later step.

Over a generation, 4.0 percent of committed tokens are ones the model would now write differently, which is 239 of 1,515 distinct positions. On NARCBench deliberation text the rate is 7.7 percent, a ratio of 1.94 times with a bootstrap interval of [1.52, 2.54] clustered at the scenario pair.

![Figure 7](figs/fig6_regret_canvas.png)

**Figure 7. The rate at which the model would now write a different token rises with how long ago that token was committed.** Panel (a) is one generation, with position on the x axis and denoising step on the y axis, and magenta marking a committed position whose current top prediction is a different token. Panel (b) is that rate against age, over 25,237 pairs.

At these positions the C-lens recovers the token the model would now prefer on 0.2271 of them at layer 25 and the J-lens on 0.1474, a gain of 54 percent at p = 6.4e-16 against 21 percent on the ordinary task. On the ordinary task a readout is competing with the model's own output layer, whose top prediction is the eventual commitment 92 percent of the time. Here the sampler discarded those logits, so the quality of the lens matrix is the whole difference.

A linear classifier on the untransported residual reaches AUC 0.8502 at layer 22 for whether a committed position is one the model would now write differently, the C-lens transport is 0.008 to 0.040 below that at all 20 layers, and the model's own output entropy is above the residual at every layer. No separate internal signal for these positions exists above the model's own uncertainty.

No output-level view of a diffusion model can see these positions, the pattern in them is structured, and it is partly anticipatable, which is a narrower safety claim than the one I set out to test. It does not consist of meaning-flipping errors, and I tested for those specifically.

## Limitations

- Almost everything I measured inside a trajectory is one model, LLaDA-8B-Base at temperature 0, with 24 trajectories, infill sampling, one noise schedule and 6 prompts for the expectation. The conservation measurement replicates on DiffuLLaMA and the readout results do not.
- LLaDA-8B and DiffuLLaMA are not frontier models, and I chose them because they are the open models in this architecture class. The result that transfers is the derivation, which is about attention masks and homogeneity degrees and holds whichever model I ran it on.
- I fitted the C-lens matrix on all 24 trajectories and scored it on 12 of them, so at layer 25 it carries an in-sample advantage of 0.066, which is larger than its margin over the tuned lens. Refitting on the training half alone would settle that comparison and I have not run it.
- I chose the band 22 to 29 from the readability profile on LLaDA. The workspace paper states its band as fractions of depth and I did not inherit those.
- Reveal order is a property of the sampling task, so every trajectory result here is measured in the infill setting, and any measurement of a diffusion language model that assumes left-to-right structure is scoped to the generate-like task. The appendix has the figure.



## Next experiments

The sampler reveals positions in descending confidence and never revisits them, and the model's own entropy one step after commitment predicts disagreement 8 to 15 steps later at AUC 0.69 to 0.74, so a position can be deferred at the moment it would be written. I would penalise the reveal score by that predicted disagreement, run the five conditions I have set up, and measure whether disagreement on the final canvas falls, holding generation quality with match to the original text and with final-canvas perplexity. The lens adds 0.03 to 0.04 AUC over entropy alone, so I would report the entropy version as the result and the lens version as a comparison.

## Appendix



### One direction dominates the layer-22 residual stream

The plain logit lens at layer 22 returns `'blockList'` in its top 10 at 185 of 233 positions regardless of content, and the mean residual direction is 84 percent of the residual norm there. Projecting out that single rank-1 component makes the plain logit lens 6.7 times more readable at layer 22 and 2.0 times at layer 25, and changes nothing at layer 29. The C-lens is above the mean-removed logit lens at both depths, so the lens matrix does more than subtract a mean, and the direct layer-22 comparison against the plain logit lens overstates what the four relevance rules contribute.

![Figure 8](figs/fig4_constant_direction.png)

**Figure 8. The layer-22 residual stream is offset far from its own origin along one content-independent direction.** Panel (a) plots 566 layer-22 residual vectors in a basis whose first axis is the mean direction and whose other two are the leading principal components of the residual once that mean is removed. A magenta cross marks the origin, which lies outside the cloud, and the offset along the mean is 7.3 times the cloud's own width orthogonal to it. Panel (b) gives the fraction of those 566 positions in whose top 10 each token appears under the plain logit lens, before and after the mean direction is projected out. Panel (c) gives pass@10 for the token each position eventually commits to.

### Reveal order is a property of the task

![Figure 9](figs/fig5_reveal_order.png)

**Figure 9. The order in which a masked diffusion language model reveals positions is a property of the task.** Each point is one generated position, with its index within the generated span on the x axis and the denoising step at which it was revealed on the y axis. The dashed line is a perfectly left-to-right reveal. Panel (a) is free continuation, a prompt followed by an all-mask suffix, at a mean per-trajectory Spearman correlation of +0.871 over 1,536 positions. Panel (b) is infill, with masks interleaved through real text, at +0.043 over 1,552 positions. I used LLaDA-8B-Base with top-k confidence reveal at temperature 0 and 24 trajectories in each setting.

### Only the committed tokens cross a denoising step

I clamped the residual at one denoising step and released it, and no later commitment changed, 0 of 32 trials at strengths 1, 2 and 4. Everything the model passes from one step to the next goes through tokens visible in the canvas, which is the reason anything read inside such a model has to be read within a single forward pass.

### A finding I cannot explain

Two algebraically identical ways of estimating the same lens direction differ as estimators. Averaging the per-input directions and deriving the direction from an averaged matrix give the same object in exact arithmetic, and fitted on finite data the first is better on the diffusion model and the second on the autoregressive model, across five disjoint fitting draws at p = 0.0079 and p = 0.0026, with the pattern holding in a third independent slicing by depth band. One mechanism would be that the matrix route estimates all 4096 rows and accumulates error from every one, while the direction route accumulates error only along the projection it needs.

## References

[1] Ameen Ali, Thomas Schnake, Oliver Eberle, Grégoire Montavon, Klaus-Robert Müller and Lior Wolf. XAI for Transformers: Better Explanations through Conservative Propagation. `arXiv:2202.07304`, 15 February 2022. The homogeneity observation is Appendix B.1, the attention-head rule is Proposition 1 and the LayerNorm rule is Proposition 2.

[2] camilablank, agam_bhatia and Neel Nanda. R-lens: Making J-lens More Faithful on Early Layers. Alignment Forum, 5 August 2026.

[3] Wes Gurnee, Nicholas Sofroniew, Adam Pearce, Mateusz Piotrowski, Isaac Kauvar, Runjin Chen, Anna Soligo, Paul Bogdan, Euan Ong, Rowan Wang, T. Ben Thompson, David Abrahams, Subhash Kantamneni, Emmanuel Ameisen, Joshua Batson and Jack Lindsey. Verbalizable Representations Form a Global Workspace in Language Models. Transformer Circuits, 6 July 2026.

[4] Farnoush Rezaei Jafari, Oliver Eberle, Ashkan Khakzar and Neel Nanda. RelP: Faithful and Efficient Circuit Discovery in Language Models via Relevance Patching. `arXiv:2508.21258`, 28 August 2025. Table 1 lists the attention-head rule and Appendix A.1 records which rules the paper applies.

[5] Joshua Engels, Callum McDougall, Bilal Chughtai, Janos Kramar, Senthooran Rajamanoharan, Cindy Wu, Arthur Conmy, Asic Q. Chen, Jean Tarbouriech, Min Ma, Brendan O'Donoghue, João Gabriel Lopes de Oliveira, Rohin Shah and Neel Nanda. How Transparent is DiffusionGemma? `arXiv:2606.20560`, 18 June 2026, revised 17 August 2026. The open problems I address are in section 7.2.

[6] Shen Nie, Fengqi Zhu, Zebin You, Xiaolu Zhang et al. Large Language Diffusion Models. `arXiv:2502.09992`, 14 February 2025. This is LLaDA.

[7] Shansan Gong, Shivam Agarwal, Yizhe Zhang, Jiacheng Ye et al. Scaling Diffusion Language Models via Adaptation from Autoregressive Models. `arXiv:2410.17891`, 23 October 2024. This is DiffuLLaMA.

[8] Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert et al. Llama 2: Open Foundation and Fine-Tuned Chat Models. `arXiv:2307.09288`, 18 July 2023.

[9] nostalgebraist. interpreting GPT: the logit lens. LessWrong, 31 August 2020.

[10] Nora Belrose, Igor Ostrovsky, Lev McKinney, Zach Furman et al. Eliciting Latent Predictions from Transformers with the Tuned Lens. `arXiv:2303.08112`, 14 March 2023.