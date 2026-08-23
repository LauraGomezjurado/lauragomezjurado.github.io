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

**Hypothesis (H):** `1ᵀ R^{(ℓ)} ≠ 0` at every layer.

Under (H) the renormalised ε-rule satisfies:

  (a) `1ᵀ R̃^{(ℓ)} = φ` for every `ℓ`, exactly — so (D7.1) holds by construction and
      Lemma 5 applies with **zero** aggregate defect at any depth;
  (b) the **within-layer relative allocation is unchanged**: `R̃_i / R̃_k = R_i / R_k`
      for all `i, k` with `R_k ≠ 0`.

**Proof.** (a) is immediate from (9.3) under (H). (b) holds because (9.3) multiplies by
a scalar. ∎

> **(H) is load-bearing, and the two halves of the prescription are not independent.**
> An earlier draft asserted (a) "exactly" with (H) mentioned only inside the proof. For
> **signed** relevance `1ᵀR` can pass through exactly zero, at which point (9.3) is
> undefined and the method fails outright — not gracefully.
>
> What rescues it is Corollary 9.6: under the z⁺-rule `R ≥ 0`, so `1ᵀR = φ > 0` and (H)
> holds automatically. So **renormalisation and non-negativity are a package**, each
> supplying what the other needs: z⁺ makes renormalisation well-defined (H), and
> renormalisation makes the z⁺ contraction argument applicable (sum-zero differences,
> Cor. 9.5(a)). Neither should be adopted alone.

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

### Definition 9.3 (the z⁺-rule matrix) — **was missing; blocking (AUDIT-02 E12)**

Earlier versions invoked "the z⁺-rule, D7" and assumed `C ≥ 0`. **D7 defines no such
matrix**, and the `C` of §9.0 is *signed* — `C_{ij} = a_i w_{ij}/z_j` — so Lemma 9.0's
column-sum identity was being applied to a different object than Theorem 9.4's
hypothesis. `verify/q9_renormalisation.py` had already registered the discrepancy,
reporting `‖C‖₁ = 1.000` for one and `95.31` for the other *under the same*
`1ᵀC = 1ᵀ`. Defining it explicitly:

    w⁺_{ij} := max(w_{ij}, 0),     z⁺_j := Σ_i a_i w⁺_{ij}
    C⁺_{ij} := a_i w⁺_{ij} / z⁺_j                                                  (9.10)
    θ⁺_j   := z⁺_j / (z⁺_j + ε)

**Hypotheses (H⁺):** `z⁺_j ≠ 0` for all `j`, and **`a ≥ 0` entrywise**.

### Lemma 9.3′ (column sums and non-negativity of `C⁺`)

Under (H⁺): `1ᵀC⁺ = 1ᵀ` and `C⁺ ≥ 0`.

**Proof.** `Σ_i C⁺_{ij} = (Σ_i a_i w⁺_{ij})/z⁺_j = z⁺_j/z⁺_j = 1`. Non-negativity is
immediate from `a ≥ 0` and `w⁺ ≥ 0`. ∎

Note this is a *different and easier* argument than Lemma 9.0: for `C⁺` the denominator
**is** the column sum by construction, whereas Lemma 9.0 had to invoke `z_j = Σ_i a_i w_{ij}`.

> **⚠ `a ≥ 0` provably fails after LayerNorm — and cannot be worked around.**
> This is stronger than "a real restriction". Two results in `02-lemmas.md` close it
> off from both sides:
>
> - **Corollary 8.1** — LayerNorm satisfies `1ᵀx̂ = 0` exactly, so any non-constant
>   input yields at least one strictly negative component. Failure of `a ≥ 0` is
>   *automatic*, not merely possible.
> - **Lemma 9** — for a matrix with unit column sums, `‖C‖_{1→1} = 1` **iff** `C ≥ 0`.
>   So non-negativity is **necessary**, not just sufficient: no signed rule, reweighting
>   or renormalisation can recover ℓ¹ non-expansiveness while keeping conservation.
>
> Together: **within the ℓ¹ framework, Q12 is a hard obstruction.** Theorem 9.4 is
> correct but its hypothesis is not satisfiable at post-LayerNorm sublayers, which is
> most of a transformer.
>
> **The escape must leave the framework** (Cor. 9.1): drop the demand `B ≤ 1` and ask
> instead for a non-positive **Lyapunov exponent** `λ ≤ 0`, which machine verification
> suggests can hold even at `B = 763`. That is an empirical property of realistic
> relevance matrices, tested in `Q12-EXPERIMENT.md`.

### Theorem 9.4 (`C⁺` is ℓ¹-non-expansive)

Let `C ≥ 0` entrywise with `1ᵀC = 1ᵀ` — by Lemma 9.3′, `C = C⁺` qualifies under (H⁺).
Then the induced ℓ¹ operator norm satisfies

    ‖C‖_{1→1} = 1                                                                 (9.6)

Consequently (9.5) holds with `B = 1`, giving

    ‖ ∏(C_ℓΘ_ℓ) − ∏C_ℓ ‖_1  ≤  Σ_{ℓ=1}^{n} η_ℓ  ≤  n · max_ℓ η_ℓ                  (9.7)

— **linear in depth, with no geometric factor.**

**Proof.** For any `u`,

    ‖Cu‖_1 = Σ_i |Σ_j C_{ij} u_j| ≤ Σ_i Σ_j C_{ij}|u_j| = Σ_j |u_j| Σ_i C_{ij} = Σ_j |u_j| = ‖u‖_1

using `C ≥ 0` for the triangle inequality step and (9.2) for the column sums. Equality
at `u = e_j` gives `‖C‖_{1→1} = 1`. Substituting `B = 1` into (9.5) and
`‖C_ℓE_ℓ‖ ≤ ‖C_ℓ‖·‖E_ℓ‖ ≤ η_ℓ` yields (9.7). ∎

> **This is the mechanism.** Q1 asked whether `B > 1` for transformer blocks.
> Theorem 9.4 *dissolves* rather than answers it: `B = 1` is not an empirical hope but
> an algebraic consequence of `C ≥ 0` plus unit column sums. We no longer need to know
> whether `B > 1`, because we choose a rule for which it is not.

> **⚠ Directional caveat (machine verification).** `B = 1 ⟹ linear` is sound — it is an
> upper bound, and it is confirmed: fitted growth exponent `α = 0.969 / 0.976 / 0.934`
> for lognormal / half-normal / heavy-tailed `z`, with `err(n)/n` flat to `1.18×` across
> `n = 8…768` and bound (9.7) holding with `2.41×` slack. `‖C‖_{1→1}` equals 1 to
> `1.55e-15`, attained at `u = e_j`.
>
> The **converse is false**, and an earlier reading of Lemma 4 implied it. `B > 1` does
> *not* imply geometric growth: at 5% sign-flipped weights, `B = 763 ≫ 1` yet the
> product still does not expand (per-layer rate `1.0048`, `α = 0.920`). The true pivot
> is the **Lyapunov exponent** of the product, not the one-step norm `B`. Lemma 4's
> bound is loose above `B = 1`.
>
> The contrast nevertheless materialises, and overwhelmingly, once negativity is
> substantial:
>
> | rule | `B` | `α` | per-layer rate | `log₁₀ err(768)` |
> |------|-----|-----|----------------|------------------|
> | z⁺ (`C ≥ 0`) | 1 | 0.940 | 1.0049 | −3.06 |
> | 5% signed | 763 | 0.920 | 1.0048 | −3.04 |
> | 35% signed | 1.4e4 | 188.6 | **3.514** | **+412.7** |
> | plain z-rule | 2.8e4 | 275.4 | **6.138** | **+600.4** |
>
> ≈**603 orders of magnitude** separate z⁺ from the plain z-rule at `n = 768`, purely
> from imposing `C ≥ 0`. The claim Theorem 9.4 supports is therefore: *non-negativity is
> sufficient for linear growth*, not *negativity is necessary for geometric growth*.

### Corollary 9.5 (depth-uniform under mixing) — **conditional, and the condition
### essentially never holds for the z⁺-rule**

If each `C_ℓ` has Dobrushin coefficient `δ(C_ℓ) ≥ δ > 0`, **and** the iterates are
renormalised per Prop. 9.1 so that `u_n − v_n` is sum-zero, then
`‖C_ℓ(u−v)‖_1 ≤ (1−δ)‖u−v‖_1`, and per-layer perturbations are damped rather than
accumulated:

    ‖ u_n − v_n ‖_1  ≤  Σ_ℓ η_ℓ (1−δ)^{n−ℓ}  ≤  η / δ                             (9.8)

independent of `n`.

> **⚠ Two repairs from machine verification (`verify/q9_renormalisation.py`).**
>
> **(a) The renormalisation hypothesis is not optional and was previously omitted.**
> The Dobrushin contraction acts only on **sum-zero** differences. Without Prop. 9.1's
> renormalisation, `u_n − v_n` is not sum-zero and (9.8) simply does not apply:
> measured error `5.79e-01` at `n = 768` and still growing, versus `2.31e-04`
> renormalised and depth-uniform — a factor **2509**. (9.8) is now stated with the
> hypothesis it always needed.
>
> **(b) The stated caveat blamed the wrong mechanism, and understated the problem.**
> An earlier draft attributed `δ ≈ 0` to *near-identity residual blocks*. Measurement
> shows the real cause is the z⁺-rule **itself**: `w⁺ = max(w,0)` sparsifies columns,
> and sparse columns have disjoint supports, so `Σ_i min(C_{ij},C_{ik}) = 0`. At
> `d = 16`, `δ(C) = 0` outright in **60%** of random z⁺ draws (median `0`); at `d = 64`
> the *minimum over 200 draws* is `0.0074`. Since (9.8) is driven by `min_ℓ δ(C_ℓ)`
> across 768 layers, the realistic bound is `η/δ ≥ 136·η` **at best**, and unbounded
> whenever any single layer has `δ = 0`.
>
> **Disposition: Corollary 9.5 is not operative.** The very rule Theorem 9.4 requires
> destroys the mixing that 9.5 needs. **The unconditional linear bound (9.7) is the
> only bound this project relies on.** Q9 option 1 is answered for the *aggregate*
> (Prop. 9.1) but **not** for allocation. Q11 is amended accordingly.

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

**The residual fidelity condition — restated against the correct quantity.**

An earlier version wrote the condition as `ε ≪ min_j |z_j| / n`. **That is the wrong
denominator**, and the error was systematically pessimistic (AUDIT-02 E15). The
prescription of §9.6 is the z⁺-rule, whose stabiliser sits on `z⁺_j` (Def. 9.3), not on
`z_j`. The correct condition is

    Σ_ℓ η⁺_ℓ ≪ 1,    η⁺_ℓ = ε / ( min_j z⁺_{j,ℓ} + ε )                            (9.9)

> **This matters by three orders of magnitude, in the project's favour.** `|z_j|` is
> small *precisely because of cancellation* — `z_j = z⁺_j − z⁻_j` — whereas `z⁺_j` sums
> only non-negative terms and does not cancel. Measured, the two differ by ~**2300×**.
> The document was therefore stating a fidelity requirement roughly three orders of
> magnitude stricter than its own rule needs, which changes the outlook on the one
> genuinely open empirical question from "probably empty" to "plausibly comfortable".
>
> This also decouples (9.9) from the Lemma 6 silent-failure regime, which is driven by
> `z_j ≈ 0` — a cancellation event that `z⁺_j` does not inherit.

**Two further corrections to the earlier derivation.**

1. **Use the `Σ` form, not `n·max`.** (9.7) prints `Σ_ℓ η_ℓ` and then the earlier text
   derived (9.9) from the weaker `n · max_ℓ η_ℓ`. The max form is ~70× loose here, and
   it is the form that produces spurious super-linear behaviour, because
   `max_ℓ min_j z_{j,ℓ}` is an order statistic that itself degrades as `n` grows. The
   `Σ` form is linear in `n` with the *typical* `η`, and is the operative bound.
2. **The "empirical confirmation" of linear-in-`T` was near-tautological.** Holding
   `min|z|` fixed while varying `n` confirms only that `Σ_ℓ η_ℓ = n·η` when `η` is
   constant. A non-circular test must let the activation statistics vary with depth.
   Filed as **Q13**.

So: `T` enters **linearly in the `Σ` form**, which is the claim this project makes. The
super-linear (`T²`) behaviour the audit identified is an artefact of the `n·max` form
and is not claimed. Whether the window is non-empty for real activations remains
**empirical** — now a question about `min_j z⁺_j`, a far more favourable quantity than
`min_j |z_j|`.

---

## 9.6 Summary of the resolution

| Claim | Status |
|-------|--------|
| Rule with depth-uniform **aggregate** defect exists | **YES** — renormalisation, Prop. 9.1 |
| Renormalisation distorts within-layer allocation | **NO** — Prop. 9.1(b) |
| Renormalisation extends the fidelity window | **NO** — Remark 9.2; it changes failure mode only |
| Allocation error is geometric in depth | **NO under z⁺** — Thm. 9.4 gives linear |
| Allocation error is depth-uniform | **NO in practice** — Cor. 9.5's mixing hypothesis is destroyed by z⁺'s own sparsity (`δ = 0` in 60% of draws at `d=16`) |
| Thresholding certification valid (Q7) | **YES under z⁺** — Cor. 9.6 |
| Window non-empty in practice | **OPEN** — empirical, depends on `min_j|z_j|` |

Empirical confirmation of (9.9): `ε(48)/ε(768) = 16.000–16.158` (limit exactly 16), and
`err(768, ε/16) / err(48, ε) = 0.982` at `ε ∈ {1e-5, 1e-6, 1e-7}` — the linear-in-`T`
tradeoff is exact, not merely an upper bound.

> **Reproducibility note.** Corollary 5.2's table is seed-dependent at the third digit:
> an independent draw gives `θ̄⁴⁸ = 0.759` against the tabulated `0.778` at `ε = 1e-3`
> (within ~1.2σ for `d = 5000`). The conclusion is unaffected; recorded rather than
> silently re-fitted.

**Net:** the prescription is **z⁺-rule + per-layer renormalisation**. It gives exact
aggregate conservation at any depth, allocation error linear (not geometric) in `L·T`,
and valid thresholding — at the price of discarding inhibitory relevance and subject to
the empirical condition (9.9).

This restores a weakened form of the original thesis: relevance propagation *can* be
made to survive depth `L·T`, but only for a specific rule, with a stated cost, and
subject to a condition that theory alone cannot verify.
