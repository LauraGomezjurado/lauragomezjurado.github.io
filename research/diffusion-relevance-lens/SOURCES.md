# Provenance ledger

Every external claim this project relies on, with its tier and how it was verified.
See `README.md` for tier definitions. **Rule: Tier C and D entries may never be used
as premises in a Tier B proof.**

Date of access for all entries: **2026-08-23**.

---

## Environment constraint (read this before trusting any attribution)

The authoring environment's egress policy returns HTTP 403 at CONNECT for:

    arxiv.org, export.arxiv.org, ar5iv.*, proceedings.mlr.press, openreview.net,
    semanticscholar.org, www.lesswrong.com, www.alignmentforum.org,
    www.greaterwrong.com, transformer-circuits.pub, x.com, r.jina.ai,
    web.archive.org, huggingface.co

Reachable: `github.com`, `raw.githubusercontent.com`, and PyPI.

Verified by `curl -sS "$HTTPS_PROXY/__agentproxy/status"`, which lists these hosts
under `recentRelayFailures` with `detail: "gateway answered 403 to CONNECT"`.

**Therefore: no paper in this project has been read in its original form.** Two
reference implementations have been read in full. Everything else is snippet-level.

---

## Tier A — verified from primary sources held locally

### A1. J-lens reference implementation

- **Repo**: `github.com/anthropics/jacobian-lens` (Apache-2.0, Anthropic PBC 2026)
- **Local clone**: `<scratchpad>/jacobian-lens/`
- **Extract**: `sources/jlens.md` (file:line citations + verbatim excerpts)

Facts drawn from it and used in this project:

| Ref | Fact | Used in |
|-----|------|---------|
| A1.1 | `h_final` is the **output tensor of the final residual block**, captured by `register_forward_hook` (`hooks.py:49-54`) — i.e. *before* the final norm. Readout is final norm → LM head → optional `tanh` softcap (`hf.py:166-174`). Purely linear; **no bias term** | D4, D4.a |
| A1.2 | Cotangents **summed** over target positions `p' ≥ p`, then **mean** over source positions `p` (`fitting.py:11-15`, `:198`). Valid positions `[16, seq_len−1)` | D5.1, Arg. 1 |
| A1.3 | Exact `torch.autograd.grad`; 1 forward + `ceil(d_model/dim_batch)` backwards per prompt; dense `[d,d]`, fp32 in memory, fp16 serialised | Arg. 2 |
| A1.4 | One global matrix per layer (not per position / token type) | Arg. 2 |
| A1.5 | **Zero** repo-wide matches for `LRP`, `relevance`, `conserv`, `attribution`, `error`, `approximation`, `Taylor`, `first-order`. No early-layer error analysis exists | negative finding; see C2 |
| A1.6 | Row convention pinned by an exact unit test: `J_2 == I + W_3` (`test_fitting.py:49-51`) | NOTATION Jacobian convention |
| A1.7 | Prompts aggregated by an **unweighted** running mean — `n_valid` is logged but never used as a weight, so prompts with differing valid-position counts contribute equally | Arg. 1 (precision caveat) |

> **A1.7 is a modelling wrinkle worth carrying forward.** (D5.1) as we wrote it takes a
> plain mean over prompts, matching the code. But because the inner reduction is a
> *sum* over targets and a *mean* over sources, prompts of different lengths contribute
> systematically different magnitudes, and the outer unweighted mean does not correct
> for this. Any diffusion analogue inherits the issue in amplified form, since `N`
> targets contribute at every one of `T` steps.

### A2. Ali et al. (2022) reference implementation

- **Repo**: `github.com/AmeenAli/XAI_Transformers`
- **Local clone**: `<scratchpad>/XAI_Transformers/`
- **Extract**: `sources/ali2022.md`

| Ref | Fact | Used in |
|-----|------|---------|
| A2.1 | LayerNorm mean and std are **separately** detachable via two independent flags (`utils.py:81-89`) | D6, L1.3/L1.4 |
| A2.2 | Attention softmax `attention_probs` is detached (`xai_transformer.py:188-193`); Q/K path receives zero relevance (INFERENCE) | D6, L2 |
| A2.3 | Linear rule `zp * (z/zp).data` — forward value `z`, backward through `ρ(w) = w + γ·max(w,0)`; **shipped SST runs use `γ = 0`**, i.e. the plain z-rule | D7 |
| A2.4 | Relevance computed as **literally gradient × input** at block boundaries (`:362,364,371`) | L6, Cor. 6.1 |
| A2.5 | Normaliser is `(std + eps)`, with `std` **unbiased (n−1)**; not `sqrt(var + eps)` | D2, Remark D2.a |
| A2.6 | **Naming trap:** the variant plotted as `LRP (AH+LN)` is `detach_KQ_LNorm_Norm`, which detaches **std only**. The both-detached variant `detach_KQ_LNorm` exists but **is never evaluated** | **L1.3/L1.4 — see below** |
| A2.7 | The `'nowb'` LayerNorm branch applies **no** weight/bias (no affine term) | D2 |
| A2.8 | **No `1/sqrt(d_k)` scaling** anywhere in the repo; `attention_mask` accepted but unused | D3 |
| A2.9 | The model has **no FFN/GELU sublayer at all** — attention-only | scope limit |

> **A2.6 independently corroborates Lemma 1.** L1.3 proves std-only detach is exactly
> conservative; L1.4 proves additionally detaching the mean introduces an error
> `(μ/σ)1`. The variant Ali et al. actually evaluate is **std-only** — the one the
> mathematics selects. The both-detached variant is present in the code but unevaluated.
> This is corroboration, not proof: we cannot read the paper to know whether the choice
> was made for this reason or incidentally. Recorded as a prediction that came out right.

> **A2.5 is a code/paper deviation.** Our D2 uses `sqrt(ε + ‖c‖²/d)` with the biased
> variance. The code uses `std_unbiased + ε`. Under the code's convention the constant
> in (L1.2) changes; the structure (nonzero for `ε>0`, `→0` as `ε→0`) does not.
> Flagged in `04-open.md` Q4.

> **A2.10 — critical negative finding.** The repo contains **no conservation test
> whatsoever**: the accumulator `C` is declared but never appended
> (`run_sst.py:150,263`), and the conservation figure loads a missing pickle from an
> author's absolute path. So the central "conservative propagation" claim is *not*
> empirically checked anywhere in the official implementation. This raises the value of
> our own machine checks in `verify/` correspondingly.

---

## Tier B — mathematics proved in this document

Not sourced; proved in `02-lemmas.md` and machine-checked in `verify/`.

| Ref | Result | Machine check |
|-----|--------|---------------|
| B1 | LayerNorm Jacobian closed form (L1.1) | `verify/lemma1_layernorm.py` |
| B2 | Exact gradient⊙input `= (ε/σ²)x̂` (L1.2) | `verify/lemma1_layernorm.py` |
| B3 | σ-detach conservative; μσ-detach not (L1.3–L1.4) | `verify/lemma1_layernorm.py` |
| B4 | Bilinear double-count (L2) | `verify/lemma2_bilinear.py` |
| B5 | Softmax Jacobian properties (L3) | `verify/lemma3_softmax.py` |
| B6 | Telescoping product error (L4) | `verify/lemma4_telescoping.py` |
| B7 | Conservation pins aggregate (L5) | — (one-line induction) |
| B8 | z-rule = gradient⊙input on detached graph (L6) | `verify/lemma6_lrp_gradinput.py` |

### Attribution notes (separate from correctness)

These results are standard and are **not claimed as novel**. Customary attribution,
none of it verifiable in this environment:

- LayerNorm/softmax Jacobians — folklore.
- Conservation axiom and z/ε/γ rules — Bach et al. (2015); Montavon et al.
- LayerNorm and attention as conservation-breaking, with the detach fix —
  Ali et al., ICML 2022. **The paper was not read**; only its official code (A2).
- Logit lens — nostalgebraist (2020). Tuned lens — Belrose et al. (2023).

If any of B1–B8 duplicates a known result we could not consult, attribution should be
corrected on access. Correctness is unaffected either way.

---

## Tier C — attribution from search snippets; primary text never read

**None of these may be used as a proof premise.** They matter only for whether our
formalisation models the real methods.

| Ref | Claim | Status |
|-----|-------|--------|
| C1 | R-lens = J-lens with LRP-style stop-gradients in the backward pass | corroborated across independent snippets; primary never read |
| C2 | R-lens motivation: "errors accumulate as you backprop through many layers and it's highly ineffective at early layers" | snippet quote; note A1.5 — this originates with R-lens, **not** J-lens |
| C3 | R-lens detaches the LayerNorm **variance** term | stated near-verbatim in two independent snippets |
| C4 | **R-lens detaches the attention softmax** | **UNVERIFIED — genuinely unknown.** Never appears in any snippet. See `04-open.md` Q2 |
| C5 | R-lens preserves conservation / claims to | **UNVERIFIED** |
| C6 | R-lens LRP variant (z / ε / γ / z⁺) and any ε, γ value | **UNVERIFIED** — deliberately not guessed |
| C7 | J-lens "workspace" as a subspace, SVD, or effective-rank claim | **NOT in the repo.** The sole definition is "Workspace band — the contiguous mid-network layer range", which is **circular as written**, its numeric extent is never given, and no code mentions a band. **Zero** repo-wide matches for SVD/eigen/singular/subspace/effective-rank. Earlier drafts asserted a kernel characterisation; **retracted** |
| C10 | J-lens steering direction = "unit-normalized transpose row for that token, scaled by the layer's mean residual norm" | Exists in **exactly one prose line** (`data/experiments/README.md:32`) with **no implementing code**. "Transpose row for that token" is **undefined** — `J̄_ℓ` has no vocabulary axis. Our earlier reading `d_ℓ(t) ∝ J̄_ℓᵀ W_U[t,:]ᵀ` was an interpretation and is **not resolvable** from the repo. **Retracted as a citable fact** |
| C8 | DiffusionGemma uses a uniform-state kernel in a block-autoregressive frame, 256-token canvas, ~13–17 steps/block, adapted from AR Gemma at <10% budget | snippet-only. D8.b restates the theory to not depend on it |
| C9 | DiffusionGemma reported logit lens "struggled on intermediate layers between denoising steps" | snippet-only; used only as a *prediction target*, never as a premise |

---

## Tier D — this project's conjectures

Design proposals and unproved claims. Listed so they are never mistaken for results.

| Ref | Conjecture | Where |
|-----|-----------|-------|
| D1* | The correct diffusion lens factorises as layer-relevance ∘ step-relevance ∘ block-transport | `03-diffusion.md` |
| D2* | The re-noising gate with a noise sink is the correct treatment of destroyed influence under kernel (D8.2) | `03-diffusion.md` |
| D3* | Conservation-based thresholding yields a certified cheap monitor | `03-diffusion.md` |
| D4* | Step-conditioning is *required*, not merely preferable | `03-diffusion.md`, Arg. 2 |

---

## Retractions log

Claims asserted in earlier drafts and since withdrawn. Kept visible on purpose.

| Retracted claim | Why | Replacement |
|-----------------|-----|-------------|
| "Gradient⊙input through LayerNorm is identically zero" | True only at `ε = 0` | (L1.2): `= (ε/σ²)x̂` |
| "Workspace = orthogonal complement of `ker(W_U J̄_ℓ)`" | Not in the source; was our inference | Operational layer-band definition only (C7) |
| "R-lens detaches the softmax, following Ali et al." | Never verified | Open question (C4, `04-open.md` Q2) |
| "J-lens readout is `W_U J̄_ℓ h`" | Omitted the final norm | (D4) with `FinalNorm` after transport (A1.1) |
| "Error accumulation is J-lens's own stated failure mode" | Not in the J-lens repo | Originates with R-lens (A1.5, C2) |
| "J-lens direction for token `t` is `J̄_ℓᵀ W_U[t,:]ᵀ` normalised" | One prose line, no code; `J̄_ℓ` has no vocab axis, so the phrase is undefined | Unresolvable from source (C10) |
| "Ali et al.'s evaluated variant detaches mean and variance" | The evaluated variant (`detach_KQ_LNorm_Norm`) detaches **std only** | A2.6 — which is the variant L1.3 selects |
