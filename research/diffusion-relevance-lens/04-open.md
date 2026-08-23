# 04 — Open questions

Ordered by how much downstream theory depends on them. Each states what is unknown,
why it matters, and **what would settle it**.

---

## Q1 — Is the block-Jacobian norm bounded below 1? *(affects Lemma 4)*

**Status:** open, provable in principle without external sources.

Lemma 4 gives `‖∏A − ∏B‖ ≤ n·B^{n−1}·e`. This is linear in depth when `B ≈ 1` and
geometric when `B > 1`. We currently claim only "grows with depth". To upgrade to the
stronger and more interesting claim, one needs a lower bound on `B = max_ℓ ‖J_{ℓ→ℓ+1}‖`.

By (D1.2), `J_{ℓ→ℓ+1} = I + A_ℓ`. Note `‖I + A‖ ≥ 1` does **not** follow in general
(e.g. `A = −I` gives norm 0). So the residual connection alone does not pin `B ≥ 1`.

**What would settle it:** either (a) a theoretical argument that `σ_max(I + A_ℓ) ≥ 1`
under realistic conditions on `A_ℓ` — e.g. if `A_ℓ` has any eigenvalue with positive
real part, or if `A_ℓ` is low-rank relative to `d` so that `I + A_ℓ` acts as the
identity on a large subspace; or (b) direct measurement of `‖J_{ℓ→ℓ+1}‖` on a real
model. Option (a) is available to us now; (b) requires model weights we do not have.

**Provisional conjecture (Tier D).** If `rank(A_ℓ) < d`, then `I + A_ℓ` restricted to
`ker(A_ℓ)` is the identity, so `σ_max ≥ 1`. Attention+MLP contributions are plausibly
rank-deficient at realistic `d`, which would give `B ≥ 1` and hence *at least* linear,
generically geometric, growth. **This is not yet proved and is not used anywhere.**

---

## Q2 — Does R-lens detach the attention softmax? *(most consequential unknown)*

**Status:** genuinely unknown (Tier C4). No snippet ever states it.

**Why it matters more in diffusion than in AR.** In a bidirectional model, attention
is the *only* route for cross-position influence. By Lemma 2, failing to detach the
softmax over-attributes the head by a factor 2, and that error lands precisely on the
`i → j` cross-position edges which are the object of interest (non-chronological
influence, `j < i`). In an autoregressive model the same error is present but the
cross-position structure is causally constrained and less central to the readout.

So this is not a footnote: **it is the first thing a diffusion port must settle**, and
it may need to be settled differently than in AR.

**What would settle it:** read the R-lens post. Requires an allow-list entry for
`lesswrong.com` (no code repository exists for R-lens under any name we could find).

---

## Q3 — Which LayerNorm detach variant does R-lens use? *(L1.3 vs L1.4)*

**Status:** partially known. C3 says the *variance* term is detached; whether the mean
is additionally detached is unstated.

Lemma 1 makes this a sharp, falsifiable distinction: std-only is exactly conservative
(L1.3); adding the mean detach injects `(μ/σ)1` (L1.4). A2.6 shows Ali et al. evaluate
the std-only variant.

**Prediction (Tier D).** If R-lens detaches both, it should show a systematic
mean-direction artefact absent from the std-only variant, most visible where `|μ|/σ`
is large.

**What would settle it:** the R-lens post, or an implementation.

---

## Q4 — Does the code's normaliser convention change Lemma 1 materially?

**Status:** open, settleable locally.

D2 uses `σ = sqrt(ε + ‖c‖²/d)` (biased variance, ε inside the root). The Ali et al.
code uses `std_unbiased + ε` (unbiased, ε *outside*, no square root on the sum)
— A2.5. These differ in two ways at once.

**What would settle it:** redo the Lemma 1b algebra under the code's convention and
compare. This is a self-contained exercise requiring no external source, and belongs
in `verify/`. Expected outcome: the `(ε/σ²)` prefactor changes form; the qualitative
conclusion (nonzero, vanishing with ε) survives. **Not yet done.**

---

## Q5 — Is "gradient⊙input reproduces the layer output" the same property as D7.1?

**Status:** open. This is the most likely soft spot in `02-lemmas.md` and is being
adversarially audited (`AUDIT-01.md`).

D7.1 defines conservation as a *layer-to-layer sum equality*. Lemmas 1.3/1.4 prove
something formally different: that `(∂̃x̂/∂x)x` equals the layer's output vector. The
bridge between "gradient⊙input reproduces the output" and "relevance sums are
preserved" needs to be stated explicitly as a lemma with its own hypotheses, not
assumed. Until it is, L1.3/L1.4 should be read as statements about gradient⊙input,
**not** as establishing D7.1-conservation.

**What would settle it:** prove the bridging lemma, or restate L1.3/L1.4 to claim only
what they prove. Repair required either way.

---

## Q6 — Is the marginal transport operator (D9.1) well-defined for the sampler (D8.4)?

**Status:** open; this is a load-bearing gap on the diffusion side.

D9.1 defines `T^{(t)}` as a derivative of position marginals. But the sampler (D8.4)
draws jointly across positions given `x̂_0 ~ p_θ`, and `p_θ` couples positions through
bidirectional attention. So the marginals `π^{(t)}_i` do **not** determine `π^{(t−1)}_j`
in general — the map is only well-defined on the *joint* distribution, which is
exponentially large.

**This is a real problem, not a technicality.** The proposed step recursion in
`03-diffusion.md` implicitly assumes a factorised (mean-field) approximation.

**What would settle it:** either (a) state the mean-field approximation explicitly as a
hypothesis and bound its error, or (b) reformulate the transport on a coarser object
that *is* closed under the dynamics. Until then, the step recursion is Tier D.

---

## Q7 — Can conserved relevance actually certify a cheap monitor?

**Status:** open, and currently **overclaimed** in earlier drafts.

The proposed cheap-monitoring argument says: relevance is conserved and sums to `φ`,
so thresholding at `R > τ` certifies capture of `(1−ε)` of the explanation.

**The gap:** z-rule relevance is **not** sign-definite. With negative relevances,
`Σ|R|` can greatly exceed `|Σ R| = φ`, and discarding small-`|R|` terms carries no
guarantee, because large positive and negative contributions can cancel. The
certification argument therefore requires either non-negativity (e.g. the z⁺-rule, at
the cost of discarding inhibitory evidence) or a bound on total variation `Σ|R|`.

**What would settle it:** prove a bound on `Σ_u |R_u^(ℓ)|` under the chosen rule, or
restrict to z⁺ and accept the modelling cost. **Until resolved, the cheap-monitor
claim (Tier D3*) must not be stated as a consequence of conservation.**

---

## Q8 — Sourcing gaps that no amount of local work can close

These require network access and are listed for whoever can obtain it.

| # | Needed | Host to allow-list |
|---|--------|--------------------|
| 1 | R-lens: exact LRP rules, variant, conservation claim (Q2, Q3) | `lesswrong.com` |
| 2 | J-lens paper: formal definition of "workspace"/J-space (C7) | `transformer-circuits.pub` |
| 3 | Ali et al. paper: the conservation-violation analysis and its bound | `proceedings.mlr.press` |
| 4 | DiffusionGemma: kernel family, canvas/step counts, the 24 open problems (C8, C9) | `arxiv.org` |
| 5 | Bach et al. 2015; Montavon et al. — canonical LRP statements | `arxiv.org` |

---

## Work not yet done in this project

- `03-diffusion.md` is **not written**. It depends on Q5 and Q6 being resolved or
  explicitly assumed.
- No treatment of the block-autoregressive outer structure.
- No error analysis for the mean-field step recursion (Q6).
- Lemma 4's constant has not been tightened.
- No empirical component; all claims are analytic or machine-checked identities.
