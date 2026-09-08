# Notation and standing conventions

All of this file is definitional. Nothing here is a claim requiring evidence.

## Index conventions

| Symbol | Range | Meaning |
|--------|-------|---------|
| `d` | — | residual stream width (`d_model`) |
| `V` | — | vocabulary size |
| `N` | — | sequence / canvas length in tokens |
| `L` | — | number of transformer blocks |
| `T` | — | number of denoising steps (diffusion only) |
| `ℓ` | `0 … L` | layer (block) index; `h_ℓ` is the residual stream *entering* block `ℓ` |
| `i, p` | `1 … N` | **source** position (where a lens reads) |
| `j, p'` | `1 … N` | **target** position (where influence lands) |
| `a, b` | `1 … V` | vocabulary tokens |
| `t` | `T … 0` | denoising step; `t = T` is pure noise, `t = 0` is the committed canvas |
| `n` | `1 … N_p` | prompt index in a fitting corpus |

**Time direction.** Diffusion indices run *downward*: generation proceeds
`x^(T) → x^(T-1) → … → x^(0)`. "Later in generation" means *smaller* `t`.
Backward relevance recursions therefore run from `t = 0` upward toward `t = T`.

**Source/target asymmetry.** We consistently write influence as flowing from a
source `(ℓ, t, i)` to a target `(j, b)`. This asymmetry is load-bearing: see
`03-diffusion.md`, Argument 1.

## Vectors and operators

- Vectors are columns. `x ∈ ℝ^d`, `1 ∈ ℝ^d` is the all-ones vector.
- `e_a ∈ ℝ^V` is the one-hot indicator of token `a`.
- `Δ^V = { π ∈ ℝ^V : π ≥ 0, 1ᵀπ = 1 }` is the probability simplex over the vocabulary.
- `W_U ∈ ℝ^{V×d}` is the unembedding matrix; `W_U[a,:]` is the row for token `a`.
- `diag(v)` is the diagonal matrix with `v` on the diagonal.
- `⊙` is the elementwise (Hadamard) product.
- `sg(·)` is the stop-gradient / detach operator: `sg(z) = z` in the forward pass,
  `∂ sg(z)/∂ z = 0` in the backward pass.

## Jacobian convention

For `f : ℝ^m → ℝ^n`, the Jacobian `∂f/∂x ∈ ℝ^{n×m}` has entries
`(∂f/∂x)_{ki} = ∂f_k/∂x_i`. Row index = output, column index = input.

Composition therefore multiplies **left to right in the output direction**:

    ∂h_L/∂h_ℓ  =  (∂h_L/∂h_{L-1}) (∂h_{L-1}/∂h_{L-2}) ⋯ (∂h_{ℓ+1}/∂h_ℓ)

We abbreviate `J_{ℓ→ℓ+1} := ∂h_{ℓ+1}/∂h_ℓ` and `J_ℓ := ∂h_L/∂h_ℓ`.

## Standing assumptions

These are assumed throughout unless a result explicitly relaxes them. They are
assumptions, not facts, and are listed so that no proof smuggles them in silently.

- **(A1) Frozen weights.** All model parameters are constants; every derivative is
  taken with respect to *activations* only.
- **(A2) Differentiability.** Within a single forward pass the network is
  differentiable almost everywhere (true for GELU/SiLU/softmax/LayerNorm; ReLU is
  fine a.e.).
- **(A3) Finite vocabulary, finite canvas.** `V, N < ∞`.
- **(A4) Per-position noising.** The diffusion forward process factorises over
  positions: `q(x_t | x_{t-1}) = ∏_i q(x_{t,i} | x_{t-1,i})`. This is the standard
  D3PM-family assumption and is used in `03-diffusion.md`.

## What "conservation" means here

A backward attribution scheme assigns to each unit `u` at layer `ℓ` a real number
`R_u^(ℓ)` (its *relevance*). The scheme is **conservative** if for all `ℓ`

    Σ_u R_u^(ℓ)  =  Σ_v R_v^(ℓ+1)

with the common value equal to the scalar output functional being explained. This is
a property *of the propagation rule*, and it is the central quantity of this project:
Lemma 4 (`02-lemmas.md`) shows it converts multiplicative error growth into additive.

## A note on "relevance" vs "gradient"

Both are computed by a backward pass. They differ *only* in how nonlinearities are
handled. Under a detached-nonlinearity graph they coincide with gradient⊙input
(Lemma 3). We therefore use "modified backward pass" as the neutral umbrella term and
reserve "relevance" for the conservative variant.
