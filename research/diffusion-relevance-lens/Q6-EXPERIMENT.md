# Q6-EXPERIMENT — which cross-step join recovers true causal influence?

**Status: empirical. Tier B for the toy model, Tier D as a claim about real models.**
Everything below is produced by `verify/q6_testbed.py` (numpy + sympy only, no torch,
fully seeded, ~26 s). Every number in this file is copied from that script's printed
output. No number here is asserted without printed evidence.

---

## 0. What question this settles

`03-q6-path-conditioning.md` closes Q6's negative half (Prop 6.1: marginal transport
provably does not exist) and **reopens** its positive half. Prop 6.3′(b) shows that
conditioning on the realised trajectory supplies *no* cross-step transport, because a
pinned `x^(t−1)` is a constant:

    ∂ζ^(t−1) / ∂ζ^(t) = 0    under path conditioning                       (6.5)

The file then lists three candidate joins — relaxation, interventional,
relevance-redistribution — and **adopts none**, noting that the interventional route
"is the only one that is both exact and well-defined on a discrete channel, and is the
most promising. **Not developed here.**"

This experiment develops it, on a model small enough that the answer is not a matter of
opinion: `V^N = 256`, so the exact joint over canvases and the exact per-step
transition operator are enumerable, and the true causal influence of any
`x^(t)_i = a` on any monitor is computable in closed form.

The result is a **split verdict**, and one half of it is negative.

---

## 1. Setup

### 1.1 Model

| | |
|---|---|
| vocabulary | `V = 4` |
| canvas length | `N = 4` → `V^N = 256` canvases, fully enumerated |
| width | `d = 16`, 2 heads of width 8 |
| depth | `L = 2` transformer blocks per D1.1 (pre-LN, residual, LN per D2.1, tanh-GELU MLP of width `4d`) |
| attention | **bidirectional**, no causal mask (S3) |
| steps | `T = 6` |
| kernel | uniform-state, D8.2: `Q_t = α_t I + (1−α_t)(1/V)11ᵀ` |
| schedule | `ᾱ_t` linear from `1.0` at `t=0` to `0.05` at `t=6`: `ᾱ = [1, .8417, .6833, .525, .3667, .2083, .05]`, `α_t = ᾱ_t/ᾱ_{t−1} = [.8417, .8119, .7683, .6984, .5682, .2400]` |
| sampler | D8.4 with the **corrected transpose**: `q(c | b, a) ∝ Q_t[c,b] · Q̄_{t−1}[a,c]` |

### 1.2 Weights — exactly how the model was made

Transformer blocks, embeddings, positional and time embeddings, and all LayerNorm
parameters are **random and fixed** per seed (`np.random.default_rng(1000+seed)`, scale
`1/√d`). They are **never trained**.

Only the **readout** `(W_U, b_U)` is trained, and it is trained *exactly*:

- Structured prior over clean canvases: `p*(x) ∝ exp(1.2 · #{i<j : x_i = x_j})` —
  it favours canvases whose tokens agree. Max `p*` = 0.1671 vs uniform 0.0039.
- Forward-noised marginal `q_t(x)` and the **exact** denoising posterior
  `p(x_{0,i}=a | x_t)` are computed by enumeration over all `256 × 256` canvas pairs.
- Loss = `Σ_t Σ_x q_t(x) Σ_i CE(exact posterior ‖ softmax(h W_U + b_U)) / (T·N)`,
  minimised by full-batch Adam (4000 steps, lr 0.05). The gradient is analytic
  (linear readout + softmax CE); no autodiff and no sampling anywhere.

Result (printed): the exact-posterior cross-entropy **floor** is `0.8440`; a uniform
predictor scores `log V = 1.3863`; the trained model reaches

| seed | init CE | final CE |
|---|---|---|
| 0 | 1.8964 | **0.9927** |
| 1 | 1.8481 | **1.0156** |
| 2 | 1.8505 | **1.0498** |

So the model is a genuine (if imperfect) denoiser for the structured prior — comfortably
better than uniform, not at the Bayes floor. It is not pure noise, and it is not an
oracle.

### 1.3 Monitors

- `φ_pos j (x) = 1[x_j = 0]` for `j = 0..3`. **`φ_pos0` is the primary monitor.**
- `φ_smooth(x) = (1/3)·#{adjacent equal pairs}` — a smooth robustness check.

### 1.4 Sample size and seeds

3 weight seeds × 5 realised trajectories × 6 step levels × 4 positions × 3 non-baseline
tokens = **360 scored `(t,i,a)` points per seed, 1080 total** for the headline tables;
4320 points for the position-pair analysis. All tables report per-seed values and the
across-seed standard deviation.

---

## 2. Ground truth

Each denoising step is an **exact 256×256 row-stochastic matrix** built by enumeration
from eq (6.1):

    M_t[x, x'] = Π_i [ Σ_a p_θ(x_{0,i}=a | x) · q(x'_i | x_i, a) ]

with `max |row sum − 1| ≤ 1.6e−15` for all three seeds. With `g_0 = φ` and
`g_t = M_t g_{t−1}`, `g_t(x) = E[φ(x^(0)) | x^(t) = x]` **exactly**. Along a realised
trajectory `x^(T:0)`:

    GT(t,i,a) := g_t( x^(t)[i ← a] ) − g_t( x^(t)[i ← ā] )

Both baselines are reported: fixed `ā = 3`, and average-over-baselines.

### 2.1 The exact propagation is verified against Monte Carlo

400 000 runs of the actual sampler per cell (no forward passes needed — all 256 states
are precomputed, so the sampler is exact table lookup):

| t | i | a | exact E[φ] | MC mean | MC s.e. | z |
|---|---|---|---|---|---|---|
| 6 | 0 | 0 | 0.325464 | 0.326087 | 0.000741 | **0.84** |
| 6 | 2 | 1 | 0.272819 | 0.272593 | 0.000704 | −0.32 |
| 4 | 1 | 2 | 0.133136 | 0.133277 | 0.000537 | 0.26 |
| 3 | 3 | 0 | 0.086467 | 0.086720 | 0.000445 | 0.57 |
| 2 | 0 | 1 | 0.162245 | 0.162560 | 0.000583 | 0.54 |
| 1 | 2 | 3 | 0.123437 | 0.123493 | 0.000520 | 0.11 |

Max `|z| = 0.84`. The exact machinery and the sampler agree within MC error.

### 2.2 GT is the *same object* the gradient joins estimate

A possible objection: GT is a finite difference over a full token swap, while J1 is a
derivative — so any gap could be discretisation, not the join. **It is not.** With
`x^(t)_i ~ π` and the rest of the canvas pinned, `E[φ] = Σ_a π_a g_t(x[i←a])` is *linear*
in `π`, so `g_t(x[i←a])` **is** exactly `∂E[φ]/∂π^(t)_{i,a}`. Machine-checked by pushing
a mixed distribution forward through the `M_t` matrices and comparing against the
backward value function: max discrepancy **5.6e−17** over 4 cells. The J1 gap is
relaxation bias, full stop.

---

## 3. Candidate joins

| tag | join | description |
|---|---|---|
| **J1** | relaxation / straight-through | forward on the realised hard path; backward through the soft mean-field posterior Jacobian `D^(s) = ∂π^(s−1)/∂π^(s)`, chained `D^(t)ᵀ⋯D^(1)ᵀ ∇φ̂`. Jacobians computed by **complex-step differentiation** (exact to machine precision; validated against central FD to `1.9e−10`). |
| **J2** | local interventional | ONE exact denoising step of lookahead, composed with the model's own *factorised one-shot* clean prediction at level `t−1`. **Not** the exact multi-step propagation (that is the ground truth). |
| **J2mc** | sampled local interventional | same, but the one step of lookahead is estimated from `S` sampled canvases with common random numbers across `a`. The realistically cheap version. |
| **J2a** | zero-step | the model's own one-shot clean prediction at level `t` only — no lookahead at all. Isolates how much the one step buys. |
| **J3** | relevance redistribution | J1's chain, gated at each join by `w^(s)_j = p^(s)_j(b*)`, the likelihood of the realised token (Prop 6.4 / Q10). `(1−w)` goes to the noise sink. |
| **J3b** | redistribution, excess-over-chance | same with `w = max(0, (p − 1/V)/(1 − 1/V))`. |
| **J0** | *control* | the zero attributor — **what path-conditioning alone supplies**, per (6.5). |
| **NC1** | *negative control* | random attributions. |
| **NC2** | *negative control* | constant attributions. |
| **PC1** | *positive control* | `GT + 50% noise`; the metrics must rank it high. |

---

## 4. Results

### 4.1 Correlation with GT — fixed baseline `ā = 3`, monitor `φ_pos0`

| cand | s0 pear | s0 spear | s1 pear | s1 spear | s2 pear | s2 spear | **mean pear** | sd | **mean spear** | sd | pear t≥2 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| J1   | 0.365 | 0.452 | 0.709 | 0.590 | 0.543 | 0.551 | **0.539** | 0.141 | **0.531** | 0.058 | 0.500 |
| J2   | 0.960 | 0.956 | 0.964 | 0.963 | 0.918 | 0.951 | **0.947** | 0.021 | **0.957** | 0.005 | 0.938 |
| J2mc | 0.942 | 0.936 | 0.935 | 0.927 | 0.890 | 0.922 | **0.922** | 0.023 | **0.928** | 0.006 | 0.920 |
| J2a  | 0.822 | 0.837 | 0.840 | 0.873 | 0.822 | 0.875 | **0.828** | 0.008 | **0.861** | 0.017 | 0.827 |
| J3   | 0.389 | 0.437 | 0.653 | 0.543 | 0.550 | 0.540 | **0.531** | 0.108 | **0.507** | 0.049 | 0.450 |
| J3b  | 0.423 | 0.395 | 0.518 | 0.389 | 0.438 | 0.444 | **0.459** | 0.042 | **0.409** | 0.025 | 0.389 |
| J0   | nan | nan | nan | nan | nan | nan | nan | — | nan | — | nan |
| NC1  | −0.035 | 0.000 | −0.076 | −0.065 | −0.079 | −0.039 | −0.064 | 0.020 | −0.035 | 0.027 | −0.005 |
| NC2  | nan | nan | nan | nan | nan | nan | nan | — | nan | — | nan |
| PC1  | 0.896 | 0.773 | 0.893 | 0.809 | 0.898 | 0.818 | 0.896 | 0.002 | 0.800 | 0.019 | 0.891 |

`nan` for NC2 and J0 is correct, not a bug: a constant (or zero) vector has zero
variance, so its correlation is undefined. The `t≥2` column excludes `t=1`, where J2 and
J2a are exact by construction (one step of lookahead already reaches the monitor); the
ranking is unchanged.

### 4.1b Same, averaging over baselines instead of a fixed `ā`

| cand | mean pear | sd | mean spear | sd | pear t≥2 |
|---|---|---|---|---|---|
| J1   | 0.558 | 0.173 | 0.598 | 0.076 | 0.540 |
| J2   | **0.956** | 0.020 | **0.956** | 0.004 | 0.949 |
| J2mc | 0.936 | 0.023 | 0.935 | 0.007 | 0.935 |
| J2a  | 0.863 | 0.015 | 0.860 | 0.024 | 0.862 |
| J3   | 0.517 | 0.140 | 0.572 | 0.107 | 0.445 |
| J3b  | 0.446 | 0.059 | 0.458 | 0.043 | 0.383 |
| NC1  | −0.047 | 0.027 | −0.017 | 0.039 | −0.030 |
| PC1  | 0.896 | 0.004 | 0.823 | 0.015 | 0.897 |

The baseline choice moves every number by <0.05 and changes no ordering.

### 4.2 Sign agreement — does the join get the *direction* right?

| cand | all points | sd | \|GT\| > 1% of max | sd |
|---|---|---|---|---|
| J1   | 0.652 | 0.051 | 0.672 | 0.056 |
| J2   | **0.933** | 0.014 | **0.969** | 0.009 |
| J2mc | 0.886 | 0.005 | 0.926 | 0.015 |
| J2a  | 0.855 | 0.012 | 0.892 | 0.009 |
| J3   | 0.651 | 0.040 | 0.668 | 0.039 |
| J3b  | 0.498 | 0.108 | 0.511 | 0.115 |
| J0   | 0.000 | 0.000 | 0.000 | 0.000 |
| NC1  | 0.498 | 0.017 | 0.493 | 0.024 |
| NC2  | 0.617 | 0.175 | 0.634 | 0.194 |
| PC1  | 0.786 | 0.026 | 0.823 | 0.030 |

**J3b at 0.498 is indistinguishable from a coin flip (NC1 = 0.498).** The
excess-over-chance weight, applied as a join gate, destroys the direction signal that
its ungated parent J1 retains (0.652). Note also that the *constant* attributor NC2
scores 0.617 on sign agreement, above J3b — a reminder that sign agreement alone is a
weak metric when GT has an asymmetric sign distribution, which is why it is reported
alongside correlation rather than instead of it.

### 4.3 Bias

`mean|GT| = 0.0594` (the reference scale). `λ` is the least-squares slope of GT on the
candidate; `R²` is the variance of GT explained **after** optimal rescaling — the
fairest possible reading of a gradient-type score whose units are arbitrary.

| cand | mean(A−GT) | mean\|A−GT\| | ÷ mean\|GT\| | λ | R² | sd(R²) |
|---|---|---|---|---|---|---|
| J1   | −0.0141 | 0.0577 | **0.97** | 0.6283 | **0.202** | 0.066 |
| J2   | 0.0070 | 0.0191 | 0.32 | 0.7923 | **0.896** | 0.041 |
| J2mc | 0.0081 | 0.0285 | 0.48 | 0.7475 | 0.848 | 0.044 |
| J2a  | 0.0157 | 0.0516 | 0.87 | 0.5267 | 0.672 | 0.016 |
| J3   | −0.0272 | 0.0542 | 0.91 | 1.92 | **0.163** | 0.084 |
| J3b  | −0.0294 | 0.0565 | 0.95 | 2.775 | **0.050** | 0.152 |
| J0   | −0.0319 | 0.0594 | **1.00** | nan | nan | — |
| NC1  | −0.0922 | 0.7999 | 13.47 | −0.0066 | −0.208 | 0.242 |
| NC2  | 0.9681 | 0.9681 | 16.31 | 0.0319 | 0.000 | 0.000 |
| PC1  | 0.0012 | 0.0343 | 0.58 | 0.8101 | 0.797 | 0.011 |

The single most damning number in this file: **J1's mean absolute error is 0.97 × the
mean absolute ground truth, and J0 (predicting exactly zero) scores 1.00.** In raw
magnitude the straight-through join is barely distinguishable from giving up. Even
after optimal rescaling it explains only **20%** of GT variance; J3 explains 16%, J3b
explains **5%**.

`λ ≈ 1.9` (J3) and `2.8` (J3b) show the redistribution gates systematically *shrink*
attribution — expected, since `(1−w)` is diverted to the noise sink — but the collapse
in R² shows the damage is not merely a scale factor.

### 4.4 Conservation / completeness

Test: `Σ_i A(t, i, x^(t)_i)` vs `Total(t) = g_t(x^(t)) − g_t(x̄)`, `x̄` = all-baseline
canvas. Defect = sum − Total. Reference scale: **mean |Total(t)| = 0.1785**.

| cand | mean defect | mean \|defect\| | ÷ mean\|Total\| |
|---|---|---|---|
| **GT** | −0.0023 | **0.0534** | **0.299** |
| J1   | −0.0476 | 0.1509 | 0.845 |
| J2   | 0.0390 | **0.1020** | 0.571 |
| J2mc | 0.0450 | 0.1190 | 0.666 |
| J2a  | 0.0830 | 0.1792 | 1.004 |
| J3   | −0.1289 | 0.1556 | 0.872 |
| J3b  | −0.1393 | 0.1699 | 0.952 |
| J0   | −0.1405 | 0.1785 | 1.000 |
| NC1  | 0.0279 | 1.5005 | 8.406 |
| NC2  | 3.8595 | 3.8595 | 21.620 |
| PC1  | 0.0012 | 0.0657 | 0.368 |

**Read this row first: GT itself has a completeness defect of 0.0534 (30% of the total
effect).** Exact single-position interventions do not sum to the total effect, because
positions *interact* — the canvas is not additively separable. This is a property of the
system, not of any attributor. Consequently **completeness is not a fidelity metric
here**: no attributor can drive the defect to zero without becoming *less* faithful to
the exact causal effect. It is reported because the task asked for it, and because it
does correctly flag the broken controls (NC1 8.4×, NC2 21.6× the total effect scale).
Prop 6.4's observation that "any split is conservative" is confirmed from the other
direction: conservation is cheap and carries almost no information about correctness.

### 4.5 Accuracy vs horizon — does it degrade for earlier steps?

Pearson r vs GT, mean over 3 seeds × 5 paths:

| t | horizon | J1 | J2 | J2mc | J2a | J3 | J3b | NC1 | PC1 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 0.566 | **1.000** | 0.952 | 1.000 | 0.618 | 0.550 | 0.046 | 0.889 |
| 2 | 2 | 0.554 | **1.000** | 0.982 | 0.940 | 0.533 | 0.480 | 0.064 | 0.884 |
| 3 | 3 | 0.488 | 0.977 | 0.966 | 0.902 | 0.412 | 0.341 | 0.049 | 0.886 |
| 4 | 4 | 0.405 | 0.944 | 0.927 | 0.836 | 0.316 | 0.275 | 0.024 | 0.886 |
| 5 | 5 | 0.414 | 0.933 | 0.919 | 0.832 | 0.280 | 0.234 | −0.029 | 0.886 |
| 6 | 6 | 0.426 | **0.908** | 0.831 | 0.809 | 0.278 | **0.189** | −0.051 | 0.884 |

Every candidate degrades with horizon, as the compounding argument in Lemma 4 predicts.
The magnitudes differ sharply: J2 loses 0.09 over five extra steps and stays above 0.9;
**J3b loses 0.36 and ends at 0.189 — near-random at the longest horizon.** J1 decays
from 0.57 to ~0.42. The redistribution joins degrade fastest, which is what one expects
from a product of gates `w < 1` compounding along the chain.

### 4.6 Cost of the interventional join

`S` = model samples per intervened canvas for the one-step lookahead:

| S | pearson | sd | spearman | sign (\|GT\|>1%) |
|---|---|---|---|---|
| 4 | 0.763 | 0.018 | 0.742 | 0.756 |
| 8 | 0.844 | 0.007 | 0.823 | 0.817 |
| 16 | 0.888 | 0.012 | 0.879 | 0.856 |
| 32 | 0.915 | 0.006 | 0.917 | 0.914 |
| 128 | 0.936 | 0.023 | 0.946 | 0.948 |
| 512 | 0.946 | 0.019 | 0.955 | 0.964 |
| exact | 0.947 | 0.021 | — | — |

**At S = 8 the sampled interventional join already beats every differentiable
candidate** (0.844 vs J1's 0.539). At S = 32 it is within 0.03 of the exact one-step
kernel. The interventional route is not merely more accurate — it is more accurate at a
budget of a handful of forward passes per cell.

---

## 5. Non-chronological influence

Position `i` at level `t` → position `j` of the clean canvas, via `φ_j = 1[x_j = 0]`.
In an autoregressive model only `i ≤ j` could matter; `i > j` is the diffusion-specific
phenomenon.

**Does it exist?** Yes, and it is not a small correction:

| relation | mean \|GT\| | max \|GT\| | n |
|---|---|---|---|
| i < j (AR-permitted) | 0.04409 | 0.34216 | 1620 |
| i = j (self) | 0.08469 | 0.60717 | 1080 |
| **i > j (non-chronological)** | **0.04736** | 0.30446 | 1620 |

Non-chronological influence is **1.07×** the chronological kind — i.e. the two are
statistically indistinguishable in magnitude, and each is roughly half the self-influence.
With bidirectional attention there is no mechanism to prefer one direction, and the
measurement confirms there is no preference. **Any lens that inherits the AR
cone (the D5.1 asymmetry) discards half the causal structure of this model.**

**Do the candidates detect it?** (Pearson r vs GT, restricted by position relation)

| cand | r (i>j) | sd | r (i<j) | sd | r (i=j) | sd |
|---|---|---|---|---|---|---|
| J1   | 0.570 | 0.114 | 0.600 | 0.071 | 0.542 | 0.096 |
| J2   | **0.952** | 0.020 | 0.953 | 0.005 | 0.938 | 0.024 |
| J2mc | 0.913 | 0.028 | 0.906 | 0.011 | 0.920 | 0.030 |
| J2a  | 0.804 | 0.035 | 0.818 | 0.019 | 0.818 | 0.034 |
| J3   | 0.505 | 0.094 | 0.520 | 0.031 | 0.484 | 0.058 |
| J3b  | 0.423 | 0.051 | 0.382 | 0.067 | 0.391 | 0.011 |
| NC1  | −0.015 | 0.031 | −0.020 | 0.030 | 0.045 | 0.060 |
| PC1  | 0.893 | 0.005 | 0.893 | 0.008 | 0.893 | 0.005 |

No candidate is *specifically* blind to backwards influence — each scores about the same
on `i>j` as on `i<j`. The joins fail (or succeed) uniformly across position relations.
So the failure of J1/J3/J3b is **not** a failure to see non-chronological effects
specifically; it is a general failure of fidelity that applies equally in both
directions.

### 5.2 Robustness: smooth monitor `φ_smooth`

| cand | pearson | sd | spearman | sd | sign |
|---|---|---|---|---|---|
| J1   | 0.300 | 0.171 | 0.204 | 0.211 | 0.548 |
| J2   | **0.931** | 0.018 | **0.910** | 0.023 | 0.850 |
| J2mc | 0.879 | 0.014 | 0.816 | 0.037 | 0.778 |
| J2a  | 0.795 | 0.033 | 0.761 | 0.026 | 0.781 |
| J3   | 0.322 | 0.164 | 0.212 | 0.246 | 0.550 |
| J3b  | 0.270 | 0.160 | 0.222 | 0.185 | 0.521 |
| NC1  | −0.048 | 0.024 | −0.038 | 0.043 | 0.482 |
| PC1  | 0.893 | 0.005 | 0.741 | 0.008 | 0.730 |

The ordering is identical. On the smooth monitor the differentiable joins are *worse*
(J1 drops from 0.539 to 0.300) — the conclusion is not an artefact of the indicator
monitor.

---

## 6. Controls

| check | result |
|---|---|
| NC1 (random) worse than every real candidate | **PASS** — NC1 \|r\| = 0.064; worst real candidate (J3b) 0.459 |
| NC2 (constant) unrankable / last | **PASS** — \|r\| = nan (zero variance, the correct output); completeness defect 21.6× the total-effect scale |
| PC1 (GT + 50% noise) in the top tier | **PASS** — \|r\| = 0.896, against the analytic prediction `1/√1.25 = 0.894` |
| **J0 = what path-conditioning alone supplies** | **PASS** — correlation undefined, sign agreement 0.000, completeness defect 0.1785 = **100%** of the total effect |

The J0 row is the empirical content of Prop 6.3′(b) and eq (6.5): conditioning on the
realised path leaves an attributor that explains *nothing* and forfeits the *entire*
causal effect. The scoring metrics rank the deliberately broken attributors last, so
they are measuring something.

**16 / 16 machine checks pass**, including three sympy checks of D8 (that `Q̄_2 = Q_1Q_2`
stays in the uniform family; that the corrected-transpose posterior equals exact Bayes
for symbolic `α`; that `Q̄_0 = I` makes the terminal step deterministic, as
`03-q6` §6.1 requires) and the complex-step-vs-finite-difference validation of the
Jacobian machinery.

---

## 7. CONCLUSION

### 7.1 What IS established (in this toy model, three weight draws)

1. **The interventional join wins, decisively and by a wide margin.**
   J2 reaches `r = 0.947 ± 0.021` (Spearman `0.957`), sign agreement `0.969` on
   non-trivial cells, and `R² = 0.896` after rescaling. It stays above `r = 0.9` at the
   longest horizon (`t = 6`, `r = 0.908`) and on the smooth monitor (`0.931`). This is
   the route `03-q6` called "the most promising" and left undeveloped; the
   experiment supports that judgement.

2. **A genuinely cheap local version works.** J2mc — one step of lookahead estimated
   from `S` samples — reaches `r = 0.844` at **S = 8** and `0.915` at S = 32, versus
   `0.947` for the exact one-step kernel. So the cost objection to the interventional
   route ("a forward pass per intervention") is real but mild: a handful of samples per
   cell recovers most of the fidelity. Even **zero** lookahead (J2a: just the model's own
   one-shot clean prediction) reaches `0.828`.

3. **Relaxation / straight-through (J1) does NOT recover causal influence.**
   `r = 0.539 ± 0.141` — and the seed spread `0.365 / 0.709 / 0.543` is nearly as large
   as the mean, so it is unreliable as well as inaccurate. After optimal rescaling it
   explains **20%** of GT variance. Its raw absolute error is **0.97 ×** the mean
   absolute ground truth, against **1.00 ×** for predicting zero. §2.2 rules out the
   "derivative vs finite difference" excuse: GT is *exactly* the linear-response
   coefficient J1 estimates, so the entire gap is mean-field relaxation bias — precisely
   the failure mode `03-q6` §6.1 identified for the mean-field route, reappearing "in a
   new guise" as the table in §6.2 predicted.

4. **Relevance redistribution (J3, J3b) is worse than doing nothing to J1's gradient.**
   Gating by the realised-token likelihood moves `r` from 0.539 → **0.531**; gating by
   excess-over-chance moves it to **0.459**, with sign agreement `0.498` —
   indistinguishable from the random control's `0.498`. **The gate hurts.** This is a
   direct empirical answer to Q10, in the negative for both proposed weights: neither
   `w = p(b*)` nor `w = max(0,(p−1/V)/(1−1/V))` improves fidelity to true causal
   influence in this model. Prop 6.4 already said conservation gives no guidance on `w`;
   the experiment adds that these two particular choices are not merely unjustified but
   actively harmful.

5. **Conservation is not a fidelity metric.** The exact ground truth itself has a
   completeness defect of 30% of the total effect, because positions interact. An
   attributor optimised for completeness would have to move *away* from the truth.
   Completeness does still separate real candidates from broken ones (NC1 8.4×,
   NC2 21.6×), so it is a useful sanity check and a useless ranking criterion.

6. **Non-chronological influence is real and large** — mean `|GT|` for `i > j` is
   **1.07 ×** that for `i < j`, i.e. backwards influence is as strong as forwards.
   No candidate is selectively blind to it; the joins fail uniformly across position
   relations. This does mean the D5.1 causal-cone asymmetry inherited from the AR J-lens
   would discard roughly half of the causal structure here.

7. **Accuracy degrades with horizon for every join**, as Lemma 4 predicts, but at very
   different rates: J2 −0.09 over five steps, J1 −0.14, J3 −0.34, J3b −0.36.

### 7.2 What is NOT established

- **Nothing here is a claim about real diffusion LMs.** `V = 4`, `N = 4`, `d = 16`,
  `L = 2`, `T = 6`. A real model has `V ≈ 2·10⁵`, `N ≈ 256`, `T ≈ 10²`. Three
  quantitative facts are *specifically* at risk of not generalising:
  - the sample budget in §4.6 (`S = 8` suffices here) — with `V = 2·10⁵` the one-step
    posterior is astronomically more diffuse, and the required `S` is not extrapolable
    from this experiment;
  - the strength of J2a (zero-step, `r = 0.828`) — with `T = 6` and this schedule, the
    model's one-shot clean prediction is already close to the final canvas; at `T = 100`
    the early-step one-shot prediction should be far weaker;
  - the *rate* of horizon degradation, which is measured over 6 steps, not 100.
- **The blocks are random.** Only the readout is trained. A fully trained model has
  structured attention that a random one lacks; whether that helps or hurts the
  relaxation join is untested. The direction of the effect is not obvious and should not
  be guessed at.
- **`n = 3` weight draws.** The across-seed sd for J1 (0.141) is large relative to the
  gap it would need to close (0.539 → 0.9); three draws are enough to establish that J1
  is unreliable, not enough to pin its mean precisely.
- **Uniform kernel only.** The absorbing/mask kernel (D8.3) is *not* symmetric — the
  very case where D8.4's corrected transpose bites. Everything here is uniform-kernel.
  Masked diffusion is the more common real-world design and is untested.
- **Single monitor family.** Two monitors (indicator, smooth agreement) agree, but both
  are simple functions of the canvas. A monitor with long-range structure is untested.
- **J2's cost was measured in samples, not wall-clock**, and the enumerable state space
  let the sampler run by table lookup. In a real model each sample is a real forward
  pass.

### 7.3 Recommendation for `03-q6`

The three-row candidate table in §6.2 should be read, on this evidence, as:

| mechanism | verdict here |
|---|---|
| relaxation | **fails** — `r = 0.539`, raw error ≈ the null attributor, high seed variance. The bias `03-q6` warned about is confirmed and is large. |
| interventional | **works** — `r = 0.947` exact, `0.844` at 8 samples. Also the only candidate whose failure mode is variance (reducible by sampling) rather than bias. |
| relevance redistribution | **fails, and both proposed weights make things worse than no gate.** Q10 gets a negative answer for `w = p(b*)` and `w = excess-over-chance`. |

The honest summary is that `03-q6`'s stated intuition — that the interventional route is
"the only one that is both exact and well-defined on a discrete channel, and is the most
promising" — survives contact with data, and the two cheaper alternatives do not. The
cost concern is the right one to have, and §4.6 quantifies it as mild *in this toy
model* while explicitly declining to extrapolate.

---

## 8. Reproducing

```
python3 verify/q6_testbed.py     # ~26 s, numpy + sympy only, fully seeded
```

Prints all 16 machine checks and every table above with actual numbers.
