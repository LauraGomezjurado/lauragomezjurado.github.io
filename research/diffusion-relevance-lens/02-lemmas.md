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
> limit `ε → 0`. The exact value is `(ε/σ²) x̂`.
>
> The failure is not a minor constant. Machine check (`verify/lemma1_layernorm.py`,
> `d = 64`, `ε = 1e-5`, `x = s·u` for a fixed centred unit direction `u`), reporting
> `‖(∂x̂/∂x)x‖ / ‖x̂‖` against the predicted `ε/σ²`:
>
> | s | σ | ε/σ² | measured |
> |---|---|------|----------|
> | 1e+0 | 1.250e-01 | 6.396e-04 | 6.396e-04 |
> | 1e-2 | 3.400e-03 | 8.649e-01 | 8.649e-01 |
> | 1e-3 | 3.165e-03 | 9.984e-01 | 9.984e-01 |
> | 1e-5 | 3.162e-03 | 1.0000e+00 | 1.0000e+00 |
>
> agreeing to `≤ 2.7e-13` relative throughout. As `σ → √ε`, gradient⊙input approaches
> **100% of `x̂`** — the folklore claim is wrong by the entire magnitude of the layer
> output, not by a negligible term. Any argument built on "exactly zero" must be
> restated with (L1.2), and is unsafe in the small-activation regime.

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
> detach variants are *not* interchangeable: detaching the variance alone reproduces
> the layer output exactly; additionally detaching the mean introduces `(μ/σ)1`.
> The Ali et al. implementation exposes both, and evaluates the std-only one (A2.6).
> See `04-open.md`, Q3.

> **⚠ Two repairs required by audit (`AUDIT-01.md`).**
>
> **(i) Scope: `x̂`, not `LN`.** Lemma 1 computes `∂x̂/∂x`, but D2.1 defines
> `LN(x) = γ ⊙ x̂ + β`. Since the affine map is applied *after* normalisation,
> `(∂̃LN/∂x)x = γ ⊙ x̂ = LN(x) − β`. **So (L1.3) as an "output reproduction" claim is
> false for the layer D2.1 defines whenever `β ≠ 0`**; it is exact for `x̂`, and exact
> for `LN` iff `β = 0`. Note (A2.7): the Ali et al. `'nowb'` branch applies **no**
> weight or bias, so `β = 0` holds in the implementation actually modelled — the
> repair is a real restriction on the general statement, not on the modelled case.
>
> **(ii) "Conservation" was a category error.** `(∂̃x̂/∂x)x = x̂` is a *vector*
> identity; (D7.1) is a *scalar* layer-sum equality. These are bridged by Lemma 7
> below, and (L1.3)/(L1.4) should be read through it rather than as directly
> establishing (D7.1). This resolves `04-open.md` Q5.

---

## Lemma 7 — Bridge: when does gradient⊙input conserve?

Let `y = f(x)` with Jacobian `J = ∂f/∂x`, and let `φ` be a scalar functional with
gradient `g := ∂φ/∂y` at `y`. Define gradient⊙input relevances

    R^out_k = y_k g_k,        R^in_i = x_i (∂φ/∂x_i) = x_i (Jᵀg)_i

Then

    Σ_i R^in_i = (Jx)ᵀ g     and     Σ_k R^out_k = f(x)ᵀ g                      (L7.1)

so conservation `Σ_i R^in_i = Σ_k R^out_k` holds **for every upstream gradient `g`**
if and only if

    J x = f(x)                                                                   (L7.2)

**Proof.** `Σ_i x_i (Jᵀg)_i = xᵀJᵀg = (Jx)ᵀg`, giving (L7.1). If `Jx = f(x)` the two
sides agree for all `g`. Conversely if they agree for all `g`, then
`(Jx − f(x))ᵀ g = 0` for all `g`, forcing `Jx = f(x)`. ∎

**Reading.** (L7.2) is exactly the "gradient⊙input reproduces the output" condition,
so Lemma 1(c) *does* establish D7.1-conservation for `x̂` — but only via Lemma 7, and
only subject to repair (i) above. Note (L7.2) is the *local linearity along `x`*
condition: it holds automatically for maps homogeneous of degree 1, which is why
detaching a nonlinearity (making the layer degree-1) restores conservation, and why
the bilinear case of Lemma 2 (degree 2) fails it by exactly a factor 2.

> **Unification.** Lemmas 1(c), 2 and 7 are three instances of one fact: gradient⊙input
> is conservative on a layer iff that layer is **homogeneous of degree 1** in the
> variables differentiated. Degree 0 (exact LayerNorm, `ε→0`) gives 0; degree 1
> (detached LN, detached attention, linear layers) gives exactly the output; degree 2
> (undetached bilinear attention) gives twice it. Euler's homogeneous-function theorem
> is the common root.

---

## Lemma 2 — Bilinear forms double-count under gradient⊙input

Let `f : ℝ^m × ℝ^n → ℝ` be bilinear, `f(u,v) = Σ_{ij} u_i v_j c_{ij}`. Then

    uᵀ ∇_u f + vᵀ ∇_v f = 2 f                                                    (L2.1)

whereas detaching `u`,

    vᵀ ∇_v f |_{u detached} = f                                                  (L2.2)

**Proof.** `∇_{u_i} f = Σ_j v_j c_{ij}`, so `uᵀ∇_u f = Σ_i u_i Σ_j v_j c_{ij} = f`.
Symmetrically `vᵀ∇_v f = f`. Summing gives (L2.1). Under `u ↦ sg(u)` the first term
contributes zero to the backward pass, leaving `f`. ∎

### Application to attention — **stated at the correct variable level**

An earlier draft of this section claimed that gradient⊙input through an attention head
over-attributes *by a factor 2 with respect to the layer input `X`*. **That is false**,
and machine-checking caught it (`verify/lemma2_bilinear.py`). The corrected statement
separates two levels:

**(i) At the bilinear arguments `(P_attn, V)` — factor 2, exactly.**
By D3 the map `(P_attn, V) ↦ C` is bilinear, so (L2.1) applies verbatim:

    Σ_{ij} P_ij ∂C/∂P_ij  +  Σ_{jk} V_jk ∂C/∂V_jk  =  2C                        (L2.3)

verified elementwise to `9.8e-11`.

**(ii) At the layer input `X` — not 2, and not any fixed constant.**
`C` is **not** homogeneous in `X`, because softmax is not homogeneous. The measured
ratio `‖Σ_X X ⊙ ∂C/∂X‖ / ‖C‖` varies with the logit scale `τ` and can *exceed* 2:

| τ | 0.0 | 0.01 | 0.1 | 1.0 | 3.0 | 10.0 |
|---|-----|------|-----|-----|-----|------|
| ratio | 1.000 | 1.009 | 1.166 | **2.247** | 1.669 | 1.471 |

So there is no "factor 2 over-attribution in `X`". The honest claim is only that
attribution through the undetached head is **uncontrolled** — input-dependent, and not
conservative at any fixed rate.

**(iii) The detach recommendation survives, and is exact at the `X` level.**
Under (p-detach), `C` becomes degree-1 in `X`, so

    Σ_X X ⊙ ∂̃C/∂X = C     exactly                                              (L2.4)

verified to `2.0e-10`. This is the operative justification for detaching: it makes the
head exactly conservative *at the level an attributor actually perturbs*, which (ii)
shows the undetached head is not.

> **Note on scope.** (L2.3) is an exact algebraic accounting identity, independent of
> the common informal argument that the softmax Jacobian is ill-conditioned when
> attention is peaked. Conditioning (Lemma 3d) is a numerical concern; (L2.3)–(L2.4)
> hold even for perfectly conditioned `P_attn`.

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

**Ordering convention (required — audit MATERIAL).** Throughout this lemma `∏_{k=1}^{n} A_k`
denotes the **index-increasing** ordered product `A_1 A_2 ⋯ A_n`. Matrix products do not
commute, and (L4.1) is *false* under the opposite order — numerically the identity holds
to `4e-16` one way and fails by `3.68` the other. When applying this to Jacobians, note
that `NOTATION.md` composes **index-decreasing** (`J_ℓ = J_{L−1} ⋯ J_ℓ`); the translation
is the relabelling `A_1 := J_{L−1}, A_2 := J_{L−2}, …, A_n := J_ℓ`, with `n = L − ℓ`.

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

> **Empirical refinement (`verify/lemma4_telescoping.py`).** The bound (L4.2) holds in
> all 24 tested configurations, and is *tight in `n`* — but only under error alignment.
> With **independent** random `E_k` at `B ≈ 1`, observed growth is
> `err(128)/err(1) = 10.9 ≈ √128`: a random walk, not linear. With **aligned** `E_k`
> the ratio is `127.8`, i.e. exactly linear. At `B = 1.4182` the ratio is `2.34e3`,
> confirming the geometric regime.
>
> So the honest picture is three-tiered: `√n` typical, `n` worst case at `B ≈ 1`,
> geometric once `B > 1`. This *weakens* the practical force of Lemma 4 relative to
> Lemma 5 — the contrast is real but the typical-case gap is `√n`, not `n`. Recorded
> so the diffusion argument does not lean on the worst case as though it were typical.

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
> only additively. It says that *for a rule satisfying the antecedent*, the failure
> mode of Lemma 4 — depth-dependent blow-up of the overall scale — is structurally
> absent.

### ⚠ Lemma 5 is conditional, and the antecedent is not free

Adversarial audit (`AUDIT-01.md`) identified the decisive gap: **no rule used in
practice is proved to satisfy (D7.1) under realistic conditions.** Lemma 5.1 shows the
ε-rule provably violates it, geometrically in depth.

---

## Lemma 5.1 — The ε-rule is not conservative; it decays geometrically in depth

For the ε-rule (D7) applied to `z_j = Σ_i a_i w_{ij}`, summing (D7.2) over `i`:

    Σ_i R_i^(ℓ) = Σ_j θ_j R_j^(ℓ+1),        θ_j := |z_j| / (|z_j| + ε) < 1        (L5.2)

Hence over `n` composed layers the aggregate is attenuated by `∏ θ`, i.e. **geometric
decay in depth**, not invariance.

**Proof.** `Σ_i a_i w_{ij} = z_j`, so the `i`-sum of the ε-rule numerator over its
denominator is `z_j/(z_j + ε·sign(z_j)) = |z_j|/(|z_j| + ε)`. Since `ε > 0` and
`|z_j| < ∞`, `θ_j < 1` strictly. ∎

**Corollary 5.2 (the `T` factor is what bites).** Measured with `z ~ N(0,1)`,
`d = 5000` (`verify/` companion computation):

| ε | `θ̄^48` (depth `L`) | `θ̄^768` (depth `L·T`) |
|---|---------------------|------------------------|
| 1e-6 | 0.99963 | 0.99411 |
| 1e-3 | 0.77750 | **0.01783** |

At `ε = 1e-3` an autoregressive-depth pass retains 78% of total relevance; the same
rule at `L·T` depth retains **1.8%**. The attenuation is survivable at depth `L` and
fatal at depth `L·T`.

> **Consequence for this project's thesis.** The claim "conservation removes the
> depth problem" is **too strong as stated** and is hereby weakened. The accurate
> statement is a *tension*:
>
> - the **z-rule** (`ε = 0`) is exactly conservative (L5.1 antecedent holds) but is
>   numerically fragile — the silent `1/z_j` blow-up documented under Lemma 6;
> - the **ε-rule** is numerically stable but violates conservation at rate `θ^n`.
>
> Neither endpoint gives "stable *and* conservative". There is a feasible window in
> `ε`, and **Corollary 5.2 shows that moving from depth `L` to depth `L·T` shrinks
> that window by roughly the factor `T` in the exponent.**
>
> This does not refute the project's motivation — it *sharpens* it. The diffusion
> depth `L·T` is still the source of the difficulty, and relevance propagation is still
> the only formalism defined on a non-differentiable inter-step channel. But the
> advantage over Jacobian composition is **quantitative and ε-dependent**, not the
> clean structural guarantee earlier drafts asserted. Establishing whether a rule
> exists that is simultaneously stable and conservative at `L·T` depth is now the
> project's central open problem (`04-open.md`, Q9).

**Correction to D7.** The claim there that the ε-rule weakens conservation to
`Σ_i R_i ≤ Σ_j R_j` is **false for signed relevance**. Counterexample: `z_j = 1`,
`ε = 1`, `R_j = −1` gives `Σ_i R_i = −0.5 > −1 = Σ_j R_j`. The correct statement is
(L5.2), whose magnitude form is `|Σ_i R_i| ≤ |Σ_j R_j|` when all `R_j` share a sign.

---

## Lemma 6 — On a detached graph, z-rule LRP = gradient⊙input

Consider a linear layer `z_j = Σ_i a_i w_{ij}` (no bias) carrying relevance `R_j`, and
set `g_j := R_j / z_j` for `z_j ≠ 0`. The z-rule (D7.2) gives

    R_i = a_i · Σ_j w_{ij} g_j = a_i · ∂/∂a_i ( Σ_j sg(g_j) · z_j )              (L6.1)

i.e. relevance equals input × backpropagated gradient of the functional
`Σ_j sg(g_j) z_j`.

> **The `sg(·)` is load-bearing, not decoration.** An earlier draft printed (L6.1)
> without it. That version is **false**: since `g_j = R_j/z_j`, the functional
> `Σ_j g_j z_j = Σ_j R_j` is *constant in `a`*, so differentiating it with `g_j` free
> gives identically **0**, not `Σ_j w_{ij} g_j`. The identity holds only with `g_j`
> held fixed — which is exactly what a backward pass does, and what `sg` denotes.
> Caught in adversarial audit (`AUDIT-01.md`, BLOCKING-2).

**Proof.** Substituting into (D7.2), `R_i = Σ_j (a_i w_{ij}/z_j) R_j = a_i Σ_j w_{ij} g_j`.
With `g_j` held constant, `∂(Σ_j sg(g_j) z_j)/∂a_i = Σ_j g_j ∂z_j/∂a_i = Σ_j g_j w_{ij}`. ∎

**Hypothesis.** (L6.1) requires `z_j ≠ 0`. This is not a formality:

> **Silent-failure warning (`verify/lemma6_lrp_gradinput.py`).** As `z₀ → 0`,
> `max_i |R_i|` grows exactly like `1/z₀`, reaching `4.77e+15`. The dangerous part is
> that in floating point, cancellation lands *near* zero rather than *on* it
> (`z₀ = −4.86e-17`), so `g₀` is a finite `1.14e+16` — **no exception is raised** and
> conservation degrades silently (relative error `1.4e-01`). A naive implementation
> reports a plausible-looking attribution that is quantitatively meaningless.
>
> This is the precise operational reason the ε-rule exists: it restores finiteness at
> the cost of weakening conservation to `Σ_i R_i ≤ Σ_j R_j`, exactly as D7 states.

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
