# 05 — Q9: conservation at depth `L·T`

**Status: Q9 substantially resolved.** A rule with **depth-uniform** aggregate defect
exists (Prop. 9.1), and under non-negativity the *allocation* defect loses its
geometric term entirely (Thm. 9.4), becoming linear in depth — and depth-*uniform*
under a mixing hypothesis (Cor. 9.5). The cost is discarding inhibitory relevance.

A dividend: the same construction closes **Q7** (Cor. 9.6).

Tier B throughout; machine-checked in `verify/q9_renormalisation.py`.

---

## 9.0 Setup: the ε-rule as a matrix recursion

From (D7.2) with the ε stabiliser, writing `s_j = sign(z_j)`:

    R_i^{(ℓ)} = Σ_j [ a_i w_{ij} / (z_j + ε s_j) ] R_j^{(ℓ+1)}
              = Σ_j C_{ij} θ_j R_j^{(ℓ+1)}

where

    C_{ij} := a_i w_{ij} / z_j        (the z-rule coefficient matrix)
    θ_j    := z_j/(z_j + ε s_j) = |z_j|/(|z_j| + ε) ∈ (0,1)                       (9.1)

So one ε-rule layer is `R^{(ℓ)} = C Θ R^{(ℓ+1)}` with `Θ = diag(θ)`, against the exact
z-rule `R^{(ℓ)} = C R^{(ℓ+1)}`.

### Lemma 9.0 (the z-rule matrix has unit column sums)

    1ᵀ C = 1ᵀ,   i.e.  Σ_i C_{ij} = 1  for every j                                (9.2)

**Proof.** `Σ_i C_{ij} = Σ_i a_i w_{ij} / z_j = z_j / z_j = 1`, using the definition
`z_j = Σ_i a_i w_{ij}` and `z_j ≠ 0`. ∎

(9.2) *is* conservation of the z-rule: `1ᵀCR = 1ᵀR`. It also recovers Lemma 5.1 at
once, since `1ᵀCΘR = 1ᵀΘR = Σ_j θ_j R_j`.

---

## 9.1 Renormalisation fixes the aggregate exactly — and costs nothing within a layer

Define the **renormalised ε-rule**: after each layer's backward pass, rescale

    R̃^{(ℓ)} := ( φ / 1ᵀ R^{(ℓ)} ) · R^{(ℓ)}                                        (9.3)

### Proposition 9.1

The renormalised ε-rule satisfies:

  (a) `1ᵀ R̃^{(ℓ)} = φ` for every `ℓ`, exactly — so (D7.1) holds by construction and
      Lemma 5 applies with **zero** aggregate defect at any depth;
  (b) the **within-layer relative allocation is unchanged**: `R̃_i / R̃_k = R_i / R_k`
      for all `i, k` with `R_k ≠ 0`.

**Proof.** (a) is immediate from (9.3), provided `1ᵀR^{(ℓ)} ≠ 0`. (b) holds because
(9.3) multiplies by a scalar. ∎

> **This answers Q9 option 1 for the aggregate.** A rule with depth-uniform (indeed
> zero) aggregate defect exists, and it is trivial. The residual question is entirely
> about **allocation**, which is where Lemma 5's "honest scope" already said error must
> live. Prop. 9.1(b) shows renormalisation buys the aggregate for free — it introduces
> no within-layer distortion of its own.

### Remark 9.2 (why this matters operationally, even though it does not extend the window)

Renormalisation does **not** change the fidelity condition (§9.5). What it changes is
the *failure mode*:

| | un-renormalised | renormalised |
|---|---|---|
| aggregate at depth `L·T`, `ε=1e-3` | **1.8%** of `φ` | exactly `φ` |
| failure mode | silent collapse of scale | drift in allocation |
| absolute thresholds `R > τ` | meaningless (off by ~55×) | meaningful |

For a monitoring application built on thresholding, this is the difference between
unusable and usable. Catastrophic-and-silent becomes graceful-and-visible.

---

## 9.3 The allocation defect, and where the geometric term comes from

Write `Θ_ℓ = I + E_ℓ` with

    E_ℓ = −diag( ε / (|z_j^{(ℓ)}| + ε) ),    so  ‖E_ℓ‖ = η_ℓ := ε / ( min_j |z_j^{(ℓ)}| + ε )   (9.4)

`η_ℓ` is the **per-layer relative perturbation**, and it is controlled by the *smallest*
pre-activation in the layer — the same quantity that drives the silent failure under
Lemma 6.

Applying Lemma 4 with `A_ℓ = C_ℓΘ_ℓ`, `B_ℓ = C_ℓ`:

    ‖ ∏(C_ℓΘ_ℓ) − ∏C_ℓ ‖  ≤  n · B^{n−1} · max_ℓ ‖C_ℓ E_ℓ‖                        (9.5)

with `B` bounding `‖C_ℓ‖`. **The geometric term `B^{n−1}` is the whole problem** — at
`n = L·T` it is fatal unless `B ≤ 1`. Lemma 9.0 gives column sums 1 but says nothing
about the norm, because `C` may have negative entries.

---

## 9.4 Non-negativity kills the geometric term

### Theorem 9.4 (the z⁺-rule is ℓ¹-non-expansive)

Let `C ≥ 0` entrywise with `1ᵀC = 1ᵀ` (the z⁺-rule, D7). Then the induced ℓ¹ operator
norm satisfies

    ‖C‖_{1→1} = 1                                                                 (9.6)

Consequently (9.5) holds with `B = 1`, giving

    ‖ ∏(C_ℓΘ_ℓ) − ∏C_ℓ ‖_1  ≤  Σ_{ℓ=1}^{n} η_ℓ  ≤  n · max_ℓ η_ℓ                  (9.7)

— **linear in depth, with no geometric factor.**

**Proof.** For any `u`,

    ‖Cu‖_1 = Σ_i |Σ_j C_{ij} u_j| ≤ Σ_i Σ_j C_{ij}|u_j| = Σ_j |u_j| Σ_i C_{ij} = Σ_j |u_j| = ‖u‖_1

using `C ≥ 0` for the triangle inequality step and (9.2) for the column sums. Equality
at `u = e_j` gives `‖C‖_{1→1} = 1`. Substituting `B = 1` into (9.5) and
`‖C_ℓE_ℓ‖ ≤ ‖C_ℓ‖·‖E_ℓ‖ ≤ η_ℓ` yields (9.7). ∎

> **This is the mechanism.** Lemma 4 said the bound is "linear when `B ≈ 1` and
> geometric when `B > 1`", and Q1 asked whether `B > 1`. Theorem 9.4 shows the question
> is *dissolved* by choosing a non-negative rule: `B = 1` is not an empirical hope but
> an algebraic consequence of `C ≥ 0` plus unit column sums. The z⁺-rule sits exactly
> at the benign boundary of Lemma 4.

### Corollary 9.5 (depth-uniform under mixing)

If in addition each `C_ℓ` has Dobrushin coefficient `δ(C_ℓ) ≥ δ > 0` — i.e. the layer
genuinely mixes — then `‖C_ℓ(u−v)‖_1 ≤ (1−δ)‖u−v‖_1` on sum-zero differences, and the
per-layer perturbations are damped geometrically rather than accumulated:

    ‖ u_n − v_n ‖_1  ≤  Σ_ℓ η_ℓ (1−δ)^{n−ℓ}  ≤  η / δ                             (9.8)

**independent of `n`.** This is a genuinely depth-uniform defect, answering Q9 option 1
in full.

> **Honest caveat on the mixing hypothesis.** `δ > 0` requires column overlap. A
> near-identity layer — which is what a residual stream with small `‖A_ℓ‖` (D1.2) looks
> like — has `δ ≈ 0` and provides **no** damping. So (9.8) should not be assumed for
> transformer blocks; the safe fallback is the unconditional linear bound (9.7).
> Measuring `δ(C_ℓ)` on a real model is filed as **Q11**.

### Corollary 9.6 (Q7 closes as a dividend)

Under the z⁺-rule, `R^{(ℓ)} ≥ 0` entrywise whenever `R^{(L)} ≥ 0`, since `C ≥ 0`. Hence
`Σ_u |R_u| = Σ_u R_u = φ`, and thresholding at `R > τ` **does** certify capture of a
`(1−ε)` fraction of the explanation: discarding units with `R_u ≤ τ` loses at most
`|{u}|·τ` out of `φ`, with no cancellation.

**Proof.** Non-negativity removes the sign-cancellation counterexample that made Q7
open: total variation equals the aggregate. ∎

> Q7 was open precisely because signed relevance admits `Σ|R| ≫ |ΣR|`. Non-negativity
> is exactly the missing hypothesis, and it is supplied by the same rule choice that
> Theorem 9.4 requires.

---

## 9.5 The cost, and the residual condition

**The cost is real.** The z⁺-rule discards negative (inhibitory) contributions: evidence
that a unit *argued against* the outcome is not represented. For a monitoring
application this may be acceptable — one asks what drove a behaviour, not what
suppressed it — but it is a genuine loss of information and must be stated whenever the
method is used.

**The residual fidelity condition.** From (9.7), faithful allocation requires

    n · ε / ( min_j |z_j| + ε )  ≪  1     ⟺     ε ≪ min_j |z_j| / n               (9.9)

At `n = L·T = 768` versus `n = L = 48`, this demands `ε` smaller by the factor `T ≈ 16`.
So **the denoising-step count enters the requirement linearly** — which is the accurate
version of the informal claim that "`T` shrinks the window". It is not exponential once
non-negativity is imposed.

Note (9.9) couples to the Lemma 6 silent-failure regime through the same `min_j |z_j|`:
one cannot take `ε` arbitrarily small without re-entering the `1/z_j` blow-up. Whether
the window (9.9) is non-empty for real activation distributions is an **empirical**
question about `min_j |z_j|`, not a theoretical one, and remains open (Q9 option 3).

---

## 9.6 Summary of the resolution

| Claim | Status |
|-------|--------|
| Rule with depth-uniform **aggregate** defect exists | **YES** — renormalisation, Prop. 9.1 |
| Renormalisation distorts within-layer allocation | **NO** — Prop. 9.1(b) |
| Renormalisation extends the fidelity window | **NO** — Remark 9.2; it changes failure mode only |
| Allocation error is geometric in depth | **NO under z⁺** — Thm. 9.4 gives linear |
| Allocation error is depth-uniform | **YES under mixing** — Cor. 9.5; not safe to assume for residual blocks |
| Thresholding certification valid (Q7) | **YES under z⁺** — Cor. 9.6 |
| Window non-empty in practice | **OPEN** — empirical, depends on `min_j|z_j|` |

**Net:** the prescription is **z⁺-rule + per-layer renormalisation**. It gives exact
aggregate conservation at any depth, allocation error linear (not geometric) in `L·T`,
and valid thresholding — at the price of discarding inhibitory relevance and subject to
the empirical condition (9.9).

This restores a weakened form of the original thesis: relevance propagation *can* be
made to survive depth `L·T`, but only for a specific rule, with a stated cost, and
subject to a condition that theory alone cannot verify.
