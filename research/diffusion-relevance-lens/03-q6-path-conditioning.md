# 03 — Q6 resolved: marginal transport is ill-defined; path-conditioning repairs it

**Status: Q6 CLOSED.** The obstruction is real and is proved below (Prop. 6.1). The
repair is not an approximation but a **change of object**: attribution along a
*realised trajectory* rather than transport of distributions (Def. 6.2, Prop. 6.3).

All results here are Tier B: proved from `01-preliminaries.md` and machine-checked in
`verify/q6_path_conditioning.py`.

---

## 6.1 The obstruction

Recall (D9.1) proposed transporting **position marginals** `π^{(t)}_i ∈ Δ^V` across a
denoising step. Write `μ^{(t)} ∈ Δ(V^N)` for the *joint* law of the canvas.

The sampler (D8.4) induces a Markov kernel. Conditional on the realised canvas `x`,
the positions are drawn independently, so

    K_t(x' | x) = ∏_i [ Σ_a p_θ(x_{0,i} = a | x) · q(x'_i | x_i, a) ]            (6.1)

Note carefully: `K_t(· | x)` **is** a product measure, but each factor depends on the
*entire* `x` through `p_θ`, because attention is bidirectional (S3). Pushing forward,

    π^{(t−1)}_j(b) = Σ_x μ^{(t)}(x) · [ Σ_a p_θ(x_{0,j} = a | x) · q(b | x_j, a) ]  (6.2)

This is an expectation, under the **joint** `μ^{(t)}`, of a nonlinear function of all
coordinates of `x`. Nothing forces it to depend on `μ^{(t)}` only through its
marginals.

### Proposition 6.1 (marginal transport is ill-defined)

There exist `N, V`, a model `p_θ`, and two joints `μ_A ≠ μ_B` on `V^N` with **identical
position marginals**, such that the induced `π^{(t−1)}` differ. Hence no operator
`T^{(t)}` on `(Δ^V)^N` can satisfy (D9.1).

**Proof (explicit counterexample).** Take `N = 2`, `V = 2`, and

    μ_A = ½·δ_{(0,0)} + ½·δ_{(1,1)}        (perfectly correlated)
    μ_B = ½·δ_{(0,1)} + ½·δ_{(1,0)}        (perfectly anti-correlated)

Both have marginals `π_1 = π_2 = (½, ½)`, so they are indistinguishable to any operator
on marginals. Choose a model that reads the *correlation*:

    p_θ(x_{0,1} = 0 | x) = 1 if x_1 = x_2, else 0

Now take the **final** denoising step, `t = 1 → 0`. There `Q̄_0 = I`, so the second
factor of (D8.4) is `Q̄_0ᵀ x̂_0 = x̂_0`, and the posterior is

    q(x_0 | x_1, x̂_0) ∝ (Q_1 x_1) ⊙ x̂_0  ∝  x̂_0

(the first factor is strictly positive on `x̂_0` for the uniform kernel with `α_1 < 1`).
Hence `x^{(0)}_1 = x̂_{0,1}` **deterministically**, and

> **Self-correction.** An earlier draft obtained determinism by asserting "the identity
> kernel (`α_t = 0` in D8.2)". That is backwards: in (D8.2) `α_t = 0` gives
> `Q = (1/V)11ᵀ`, the *fully noised* kernel, while `α_t = 1` gives the identity — and
> the identity kernel would force `x^{(t−1)} = x^{(t)}`, which is not what is wanted
> either. The correct route to determinism is the terminal step `Q̄_0 = I`, as above.
> The counterexample is unaffected; only its justification was wrong.

    under μ_A:  π^{(t−1)}_1 = (1, 0)
    under μ_B:  π^{(t−1)}_1 = (0, 1)

The marginals of the input agree; the outputs differ maximally. ∎

**Reading.** This is not a regularity technicality. It says the *state space is wrong*:
position marginals are not a sufficient statistic for the dynamics, because
bidirectional attention makes the model a function of inter-position correlation. The
only object closed under (6.1) is the joint `μ^{(t)}`, which has `V^N` coordinates —
for `V ≈ 2·10^5`, `N = 256` this is not an object one computes with.

> **Consequence.** Any mean-field step recursion is an *approximation whose error is
> governed by the total correlation* `TC(μ^{(t)}) = Σ_i H(π_i) − H(μ)`. Prop. 6.1 shows
> the error is not small in general: the counterexample has `TC = log 2`, the maximum
> for `N = 2, V = 2`, and produces total disagreement. We do **not** pursue the
> mean-field route.

---

## 6.2 The repair: condition on the realised trajectory

The obstruction came from trying to propagate *distributions*. But an interpretability
lens is never asked to do that. At inference one has **a single realised trajectory**,
and the question is: *which earlier states explain this particular output?*

### Definition 6.2 (path-conditioned attribution problem)

Fix a realised trajectory `x^{(T:0)} = (x^{(T)}, …, x^{(0)})` produced by (D8.4), and a
scalar functional `φ(x^{(0)})` (e.g. a monitor score). At each step the network
computed logits

    ζ^{(t)} := f_θ(x^{(t)}, t) ∈ ℝ^{N×V}                                          (6.3)

a **deterministic, differentiable** function of the realised `x^{(t)}`. The
path-conditioned attribution problem is to assign relevance to each
`(ℓ, t, i)` explaining `φ`, *conditional on* `x^{(T:0)}`.

### Proposition 6.3 (path-conditioned attribution is well-defined)

Conditional on `x^{(T:0)}`, the map `x^{(t)} ↦ ζ^{(t)}` is a deterministic
differentiable function (A2), and the only stochastic element in the generation — the
draw `x^{(t−1)} ~ q(· | x^{(t)}, x̂_0)` — is **fixed by the conditioning**. Hence every
quantity a backward pass requires is well-defined, and Lemmas 1–7 apply verbatim within
each step.

**Proof.** Immediate: conditioning on the path removes all randomness, leaving a finite
composition of differentiable maps `f_θ(·, t)`, one per step, joined at fixed realised
canvases. ∎

> **What changed.** We replaced an object that does not exist (a marginal transport
> operator) with one that does (attribution along a fixed path). The cost is that the
> result is **per-trajectory**, not distributional. For monitoring this is not a cost
> at all: one monitors a specific generation.
>
> This mirrors how chain-of-thought attribution works in the autoregressive case — one
> attributes along the realised token sequence, never over the distribution of possible
> sequences.

---

## 6.3 The inter-step boundary: what conditioning does *not* remove

Conditioning fixes *which* token was drawn but not *why*. At step `t`, position `j`,
the realised token `b*` was drawn from the model's distribution `p^{(t)}_j ∈ Δ^V`. Two
extremes:

- `p^{(t)}_j(b*) ≈ 1` — the draw was determined by the model; relevance should flow
  back through the network into `x^{(t)}`.
- `p^{(t)}_j(b*) ≈ 0` — the draw was a fluke of the sampler; the network does not
  explain it.

### Proposition 6.4 (any split is conservative; the split is not forced)

Let `w^{(t)}_j ∈ [0,1]`. Routing `w·R` back through the network and `(1−w)·R` to an
exogenous **noise sink** `𝒩` satisfies (D7.1) identically, for *any* choice of `w`.

**Proof.** `w·R + (1−w)·R = R`. ∎

> **Honest scope (Tier D).** Prop. 6.4 says conservation gives **no** guidance on `w`.
> The noise sink is *permitted* by the formalism, not *derived* from it. Choosing `w`
> is a modelling decision requiring separate justification. Two candidates:
>
> | choice | `w^{(t)}_j` | rationale | defect |
> |--------|-------------|-----------|--------|
> | **likelihood** | `p^{(t)}_j(b*)` | attribute in proportion to how much the model predicted what happened | assigns `w = 1/V > 0` to a uniform (uninformative) model |
> | **excess-over-chance** | `max(0, (p_{b*} − 1/V)/(1 − 1/V))` | a uniform model explains nothing, so `w = 0` there | discards information when `p_{b*} < 1/V` |
>
> We adopt neither by default. This is filed as **Q10**.

### Remark 6.5 (Gumbel-max gives an operational reading)

Under the Gumbel-max representation, `x^{(t−1)}_j = argmax_b (ζ^{(t)}_{j,b} + G_{j,b})`
with `G` i.i.d. Gumbel. The realised `b*` won by margin

    m = min_{c ≠ b*} [ (ζ_{b*} + G_{b*}) − (ζ_c + G_c) ]                          (6.4)

which decomposes additively into a model part (`ζ`) and a noise part (`G`). This makes
"how much of the win was the model" a *measurable* quantity per draw rather than a
postulate, and is the most promising route to deriving `w` rather than choosing it.
**Not developed here.** See Q10.

---

## 6.4 Net effect on the project

| Before | After |
|--------|-------|
| Step recursion assumed mean-field, unjustified | Mean-field route **abandoned**; Prop. 6.1 shows it is not a small error |
| (D9.1) transport operator | Withdrawn — provably does not exist |
| Recursion was Tier D | Path-conditioned attribution is Tier B (Prop. 6.3) |
| Noise sink asserted | Permitted but **not derived** (Prop. 6.4); weight choice filed as Q10 |

**(D9.1) is hereby retracted.** `01-preliminaries.md` retains it only as the object
Prop. 6.1 refutes.

The step recursion of earlier drafts is replaced by: run the conservative backward pass
of Lemmas 1–7 within each realised step, and join steps at the realised token
identities, splitting relevance at each boundary per Prop. 6.4. Whether that join
survives depth `L·T` is **Q9**, treated in `05-q9-conservation-at-depth.md`.
