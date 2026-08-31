# 01 — Preliminaries

Everything in this file is a **definition**. Definitions carry no truth value and
require no source; they fix the objects the lemmas in `02-lemmas.md` reason about.

Where a definition is intended to model a real system, that modelling claim is
flagged and given a tier (see `README.md`). **A modelling claim is never used as a
premise in a proof.**

---

## D1. Residual stream and transformer block

A depth-`L` decoder transformer maps `h_0 ∈ ℝ^{N×d}` through blocks

    h_{ℓ+1} = h_ℓ + Attn_ℓ(LN(h_ℓ)) + MLP_ℓ(LN(h_ℓ + Attn_ℓ(LN(h_ℓ))))          (D1.1)

We write `J_{ℓ→ℓ+1} := ∂h_{ℓ+1}/∂h_ℓ` and `J_ℓ := ∂h_L/∂h_ℓ`.

By (D1.1) the block Jacobian has the form

    J_{ℓ→ℓ+1} = I + A_ℓ                                                          (D1.2)

for a perturbation `A_ℓ` collecting the attention and MLP contributions. The identity
term is the residual connection.

---

## D2. LayerNorm

For `x ∈ ℝ^d`, `γ, β ∈ ℝ^d`, `ε > 0`:

    μ(x) = (1/d) 1ᵀx
    c(x) = x − μ(x)·1                                    (centred input)
    σ(x) = sqrt( ε + (1/d)‖c(x)‖² )
    x̂    = c(x) / σ(x)                                   (normalised)
    LN(x) = γ ⊙ x̂ + β                                                            (D2.1)

**Remark D2.a (modelling, Tier A).** The Ali et al. reference implementation uses
`(std + eps)` in the denominator rather than `sqrt(var + eps)`. See
`sources/ali2022.md`. The lemmas below are stated for (D2.1); the deviation changes
constants, not the structure of the results, and is flagged where it matters.

We write `P := I − (1/d)11ᵀ` for the **centring projector**. Note `P = Pᵀ = P²`,
`P1 = 0`, and `Pc = c`.

---

## D3. Attention head

For input `X ∈ ℝ^{N×d}` and weight matrices `W_Q, W_K, W_V`:

    Q = XW_Q,  K = XW_K,  V = XW_V
    S = QKᵀ / sqrt(d_h)
    P_attn = softmax(S)         (row-wise)
    C = P_attn · V                                                               (D3.1)

The map `(P_attn, V) ↦ C` is **bilinear**. This fact — not the conditioning of the
softmax — is what drives Lemma 2.

---

## D4. Readout and lens

A **readout** is `ρ(h) := W_U · FinalNorm(h)`, optionally followed by a logit softcap
`c·tanh(·/c)`.

A **lens at layer ℓ** is a map `ℝ^d → ℝ^V` of the form

    lens_ℓ(h) = ρ( M_ℓ h )                                                       (D4.1)

for some transport operator `M_ℓ ∈ ℝ^{d×d}`.

- `M_ℓ = I` gives the **logit lens**.
- `M_ℓ = A_ℓ` affine-learned gives the **tuned lens**.
- `M_ℓ = J̄_ℓ`, an averaged Jacobian (D5), gives the **J-lens**.

**Remark D4.a (modelling, Tier A).** That the real J-lens applies the model's own
final norm *after* transport, and that `h_final` is the last block's residual output
(not logits), is verified in `sources/jlens.md`.

---

## D5. Averaged-Jacobian transport (the J-lens estimator)

Given a corpus of prompts `n = 1…N_p` with valid-position sets `P_n`:

    J̄_ℓ = (1/N_p) Σ_n  (1/|P_n|) Σ_{p ∈ P_n}  Σ_{p' ∈ P_n}  ∂h_final^(n)[p'] / ∂h_ℓ^(n)[p]      (D5.1)

**Note the asymmetry: summed over target positions `p'`, averaged over source
positions `p`.** Under causal masking only `p' ≥ p` contributes, so the inner sum is
over a cone. This asymmetry is Tier A (`sources/jlens.md`) and is the subject of
Argument 1 in `03-diffusion.md`.

---

## D6. Modified (detached) backward pass

`sg(·)` denotes stop-gradient: `sg(z) = z` forward, `∂sg(z)/∂z = 0` backward.

A **detached-nonlinearity graph** is obtained from the computation graph by replacing
selected nonlinear factors `u` with `sg(u)`. We consider three detachments:

- **(σ-detach)** replace `σ(x)` by `sg(σ(x))` in (D2.1).
- **(μσ-detach)** additionally replace `μ(x)` by `sg(μ(x))`.
- **(p-detach)** replace `P_attn` by `sg(P_attn)` in (D3.1).

We write `∂̃` for differentiation on the detached graph.

---

## D7. Relevance and conservation

An attribution scheme assigns `R_u^(ℓ) ∈ ℝ` to each unit `u` at layer `ℓ`, explaining
a scalar functional `φ`. The scheme is **conservative** iff for every `ℓ`

    Σ_u R_u^(ℓ) = Σ_v R_v^(ℓ+1)                                                  (D7.1)

**Gradient⊙input** attribution is `R_u = x_u · ∂φ/∂x_u`.

**LRP linear rule (z-rule).** For `z_j = Σ_i a_i w_{ij} + b_j`:

    R_i = Σ_j [ a_i w_{ij} / (Σ_{i'} a_{i'} w_{i'j} + b_j) ] R_j                 (D7.2)

**ε-rule:** denominator `+ ε·sign(·)`.

> **⚠ Corrected (audit MATERIAL).** An earlier draft stated that conservation "weakens
> to `Σ_i R_i ≤ Σ_j R_j`". **That is false for signed relevance.** Counterexample:
> `z_j = 1`, `ε = 1`, `R_j = −1` gives `Σ_i R_i = −0.5 > −1 = Σ_j R_j`.
> The correct statement is Lemma 5.1: `Σ_i R_i = Σ_j θ_j R_j` with
> `θ_j = |z_j|/(|z_j| + ε) < 1`, which is an **attenuation toward zero**, not an
> inequality. The magnitude form `|Σ_i R_i| ≤ |Σ_j R_j|` holds when all `R_j` share a
> sign. This correction matters: it is what makes the ε-rule's depth behaviour
> *geometric decay* rather than a one-sided bound.

**γ-rule:** replace `w` by `ρ(w) = w + γ·w⁺` in both numerator and denominator.

**General principle.** Any rule whose numerator sums (over `i`) to its denominator is
conservative by construction.

---

## D8. Discrete diffusion language model

By assumption (A4) the forward process factorises over positions. Per position, with
transition matrix `Q_t ∈ ℝ^{V×V}` acting on one-hot rows:

    q(x_t | x_{t-1}) = Cat( x_{t-1}ᵀ Q_t )                                       (D8.1)

Two standard kernels:

    Uniform:    Q_t^unif = α_t I + (1 − α_t)(1/V) 11ᵀ                            (D8.2)
    Absorbing:  Q_t^mask = α_t I + (1 − α_t) 1 e_mᵀ                              (D8.3)

Cumulative `Q̄_t = Q_1 ⋯ Q_t`, so `q(x_t | x_0) = Cat(x_0ᵀ Q̄_t)`.

The network emits per-position clean-token logits `f_θ(x^{(t)}, t)_i ∈ ℝ^V`, giving
`p_θ(x_{0,i} | x^{(t)})`. The sampler draws

    x^{(t−1)}_i ~ q( x_{t−1,i} | x_{t,i}, x̂_{0,i} )  ∝  ( Q_t x_{t,i} ) ⊙ ( Q̄_{t−1}ᵀ x̂_{0,i} )   (D8.4)

with `x̂_0 ~ p_θ`.

> **Transpose corrected (audit MATERIAL).** An earlier draft wrote the first factor as
> `(x_{t,i}ᵀ Q_t)`, which selects `Q_t[b,c]` rather than the required `Q_t[c,b]`. With
> `Q_t[a,b] = q(x_t = b | x_{t−1} = a)` and one-hot **column** vectors, the posterior
> over `c = x_{t−1,i}` is `q(x_t = b | x_{t−1} = c)·q(x_{t−1} = c | x_0 = a)`, i.e.
> `(Q_t x_t)_c · (Q̄_{t−1}ᵀ x_0)_c`, giving (D8.4) as now written.
>
> The error was **invisible for the uniform kernel**, since `Q^unif` (D8.2) is
> symmetric, but is real for the **absorbing** kernel `Q^mask` (D8.3), which is not.
> A concrete instance of why the two kernels must not be treated interchangeably.

**D8.a Structural consequences.** Four features distinguish (D8.1)–(D8.4) from the
autoregressive setting. Each is used in `03-diffusion.md`.

| # | Feature | Where it bites |
|---|---------|----------------|
| S1 | Generation graph is `L` layers × `T` steps | effective depth `L·T` |
| S2 | `Sample(·)` between steps is **not differentiable** | `∂x^{(t−1)}/∂x^{(t)}` undefined |
| S3 | Attention is **bidirectional** (no causal mask) | target sum runs over all `N` |
| S4 | Uniform kernel (D8.2) moves mass **off** correct tokens | influence can be destroyed |

**Remark D8.b (modelling, Tier C).** That DiffusionGemma specifically uses a
uniform-state kernel in a block-autoregressive frame is snippet-sourced and
UNVERIFIED. The results in `03-diffusion.md` are stated for the kernel family
(D8.2)/(D8.3) and do not depend on which model instantiates them.

---

## D9. Inter-step transport on the simplex

Because `x^{(t)}` are one-hot, `∂x^{(t−1)}/∂x^{(t)}` does not exist (S2). The
well-defined object is the induced map on **position marginals** `π^{(t)}_i ∈ Δ^V`:

    T^{(t)}[(j,b) ← (i,a)] := ∂ π^{(t−1)}_{j,b} / ∂ π^{(t)}_{i,a}                (D9.1)

This is an operator on `(Δ^V)^N`, not on `ℝ^d`. Lemma 5 records why this matters.
