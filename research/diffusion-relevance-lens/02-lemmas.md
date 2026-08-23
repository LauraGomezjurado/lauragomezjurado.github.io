# 02 — Lemmas (autoregressive side)

All results are **Tier B**: proved here from the definitions in `01-preliminaries.md`
alone, and machine-checked in `verify/`. No blocked source is used as a premise.

Attribution of these results to prior literature is discussed in `SOURCES.md` and is
kept strictly separate from correctness.

---

## Lemma 1 — LayerNorm Jacobian and its gradient⊙input action

Let `x̂ = c/σ` as in D2, with `c = Px`, `σ = sqrt(ε + ‖c‖²/d)`, `P = I − (1/d)11ᵀ`.

### (1a) Closed form

    ∂x̂/∂x = (1/σ) ( P − (1/d) x̂ x̂ᵀ )                                          (L1.1)

**Proof.** `∂c/∂x = P`. For `σ`: from `σ² = ε + ‖c‖²/d`,

    2σ ∂σ/∂x = (2/d) cᵀ (∂c/∂x) = (2/d) cᵀP = (2/d) cᵀ

using `Pᵀc = Pc = c`. Hence `∂σ/∂x = cᵀ/(dσ)` as a row vector. By the quotient rule,

    ∂x̂/∂x = (1/σ)P − (c/σ²)·(cᵀ/(dσ)) = (1/σ)P − c cᵀ/(d σ³)

and `c cᵀ/σ² = x̂ x̂ᵀ`, giving (L1.1). ∎

### (1b) Exact gradient⊙input — **not zero**

    (∂x̂/∂x) x = (ε / σ²) · x̂                                                    (L1.2)

**Proof.** `Px = c`. For the second term, `x̂ᵀx = cᵀx/σ` and

    cᵀx = cᵀ(c + μ1) = ‖c‖² + μ·cᵀ1 = ‖c‖²      (since cᵀ1 = 0)

so `x̂ᵀx = ‖c‖²/σ`. From `σ² = ε + ‖c‖²/d` we get `‖c‖² = d(σ² − ε)`, hence
`x̂ᵀx = d(σ² − ε)/σ` and `(1/d) x̂ (x̂ᵀx) = x̂ (σ² − ε)/σ`. Therefore

    (∂x̂/∂x) x = (1/σ)[ σx̂ − x̂(σ² − ε)/σ ] = x̂ [ 1 − (σ² − ε)/σ² ] = (ε/σ²) x̂  ∎

> **Correction of record.** A widely repeated informal version of this identity states
> that gradient⊙input through LayerNorm is *identically zero*. That holds only in the
> limit `ε → 0`. The exact value is `(ε/σ²) x̂`. This matters in one regime: when `σ`
> is small — which is precisely the small-activation regime — `ε/σ²` need not be
> negligible. Any claim built on "exactly zero" should be restated with (L1.2).

### (1c) σ-detach restores exact conservation

Under (σ-detach) of D6,

    (∂̃x̂/∂x) x = x̂                                                              (L1.3)

exactly — the layer's own output.

**Proof.** With `σ` constant, `∂̃x̂/∂x = (1/σ)P`, so `(∂̃x̂/∂x)x = Px/σ = c/σ = x̂`. ∎

### (1d) μσ-detach does **not**

Under (μσ-detach),

    (∂̃x̂/∂x) x = x/σ = x̂ + (μ/σ)·1                                              (L1.4)

which equals the output iff `μ = 0`.

**Proof.** With both `μ` and `σ` constant, `∂̃x̂/∂x = (1/σ)I`. ∎

> **Consequence (design discriminator).** (L1.3) vs (L1.4) says the two LayerNorm
> detach variants are *not* interchangeable: detaching the variance alone is
> conservative; additionally detaching the mean introduces an error of `(μ/σ)1`.
> The Ali et al. implementation exposes both variants (`sources/ali2022.md`), so this
> is a falsifiable prediction about which variant should behave better. See
> `04-open.md`, Q3.

---

## Lemma 2 — Bilinear forms double-count under gradient⊙input

Let `f : ℝ^m × ℝ^n → ℝ` be bilinear, `f(u,v) = Σ_{ij} u_i v_j c_{ij}`. Then

    uᵀ ∇_u f + vᵀ ∇_v f = 2 f                                                    (L2.1)

whereas detaching `u`,

    vᵀ ∇_v f |_{u detached} = f                                                  (L2.2)

**Proof.** `∇_{u_i} f = Σ_j v_j c_{ij}`, so `uᵀ∇_u f = Σ_i u_i Σ_j v_j c_{ij} = f`.
Symmetrically `vᵀ∇_v f = f`. Summing gives (L2.1). Under `u ↦ sg(u)` the first term
contributes zero to the backward pass, leaving `f`. ∎

**Application to attention.** By D3, `(P_attn, V) ↦ C` is bilinear, and `P_attn`
depends on the same layer input as `V` through `Q, K`. Hence gradient⊙input
attribution through an attention head over-attributes by a factor 2 relative to the
head output; (p-detach) removes the `Q,K` branch and restores exact accounting.

> **Note on scope.** (L2.1) is the *conservation* statement. It is independent of, and
> stronger than, the common informal argument that the softmax Jacobian is
> ill-conditioned when attention is peaked. Conditioning is a numerical concern;
> (L2.1) is an exact algebraic accounting failure that persists even for perfectly
> conditioned `P_attn`.

---

## Lemma 3 — Softmax Jacobian

For `p = softmax(z)`, `J_softmax = diag(p) − p pᵀ`. Then

    (a) J 1 = 0
    (b) J ⪰ 0, with zᵀJz = Var_p(z)
    (c) rank(J) ≤ n − 1
    (d) ‖J‖₂ ≤ max_i p_i

**Proof.** (a) `J1 = p − p(pᵀ1) = p − p = 0`.
(b) `zᵀJz = Σ_i p_i z_i² − (Σ_i p_i z_i)² = E_p[z²] − E_p[z]² = Var_p(z) ≥ 0`.
(c) Immediate from (a).
(d) `zᵀJz = Var_p(z) ≤ E_p[z²] = Σ_i p_i z_i² ≤ (max_i p_i)‖z‖²`; combine with (b). ∎

(d) formalises the folklore "peaked attention ⇒ small/ill-conditioned Jacobian":
`max_i p_i → 1` bounds the spectrum from above but (a) forces a null direction, so
the map is always singular.

---

## Lemma 4 — Estimation error compounds along a product

Let `A_k, B_k ∈ ℝ^{d×d}`, `k = 1…n`, with `E_k := A_k − B_k`. Then

    ∏_{k=1}^{n} A_k − ∏_{k=1}^{n} B_k = Σ_{k=1}^{n} ( ∏_{m<k} B_m ) E_k ( ∏_{m>k} A_m )    (L4.1)

and if `‖A_k‖, ‖B_k‖ ≤ B` and `‖E_k‖ ≤ e` for all `k`,

    ‖ ∏ A_k − ∏ B_k ‖ ≤ n · B^{n−1} · e                                          (L4.2)

**Proof.** (L4.1) is the standard telescoping identity; verify by induction on `n`.
For `n = 2`: `A₁A₂ − B₁B₂ = (A₁−B₁)A₂ + B₁(A₂−B₂)`, matching. The inductive step
splits `∏_{k≤n}` at the last factor identically. (L4.2) follows by the triangle
inequality and submultiplicativity. ∎

**Reading.** With `n = L − ℓ` composed block Jacobians, the bound is **linear in
depth when `B ≈ 1` and exponential when `B > 1`.** By (D1.2) each block Jacobian is
`I + A_ℓ`, so `B` is pinned near 1 only while `‖A_ℓ‖` is small; it is not bounded
below 1 by the residual structure. We therefore claim only:

> the aggregate magnitude of a composed-Jacobian estimate has an error bound that
> **grows with depth, at best linearly and at worst geometrically**.

We deliberately do **not** claim "exponential" unconditionally; that would require a
lower bound on `B` we have not established. See `04-open.md`, Q1.

---

## Lemma 5 — Conservation pins the aggregate, independent of depth

Let `R^(ℓ)` satisfy the conservation property (D7.1) at every layer, with
`Σ_v R^(L)_v = φ`. Then

    Σ_u R^(ℓ)_u = φ    for every ℓ                                               (L5.1)

**Proof.** Downward induction on `ℓ` from `L`, applying (D7.1) at each step. ∎

**Reading.** This is the precise contrast with Lemma 4. Under a conservative scheme
the *total* relevance is exactly invariant, with **no dependence on depth whatsoever**.
Approximation error can therefore only appear in the **allocation** of relevance among
units, never in the aggregate magnitude.

> **Honest scope.** (L5.1) does *not* say allocation error is small, nor that it grows
> only additively. It says the failure mode of Lemma 4 — depth-dependent blow-up of
> the overall scale — is structurally absent. That is a weaker but fully provable
> claim, and it is the one this project relies on.

---

## Lemma 6 — On a detached graph, z-rule LRP = gradient⊙input

Consider a linear layer `z_j = Σ_i a_i w_{ij}` (no bias) carrying relevance `R_j`, and
set `g_j := R_j / z_j` for `z_j ≠ 0`. The z-rule (D7.2) gives

    R_i = a_i · Σ_j w_{ij} g_j = a_i · ∂/∂a_i ( Σ_j g_j z_j )                    (L6.1)

i.e. relevance equals input × backpropagated gradient of the functional `Σ_j g_j z_j`.

**Proof.** Substituting into (D7.2), `R_i = Σ_j (a_i w_{ij}/z_j) R_j = a_i Σ_j w_{ij} g_j`.
The bracketed expression is exactly `∂(Σ_j g_j z_j)/∂a_i`. ∎

**Corollary 6.1 (cost).** If every nonlinearity in the graph is detached, the graph is
linear with fixed coefficients, so by (L6.1) the entire relevance assignment is
computed by **one backward pass** — the same cost as one gradient. No `d×d` matrix
need be materialised.

Corollary 6.1 is what makes the diffusion construction in `03-diffusion.md`
tractable; it is used in Argument 2 there.

---

## Dependency graph

    D2 ──► L1 (a,b,c,d)
    D3 ──► L2  ──► (attention detach justification)
    D3 ──► L3
    D1 ──► L4  ──┐
    D7 ──► L5  ──┼─► contrast used in 03-diffusion Argument 3
    D7 ──► L6  ──┴─► Corollary 6.1 used in 03-diffusion Argument 2

No lemma depends on a Tier C or Tier D claim.
