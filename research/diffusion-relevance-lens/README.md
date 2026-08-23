# Relevance Lenses for Diffusion Language Models

A formal-theory project asking: **what is the mathematically correct analogue of a
Jacobian-style interpretability lens for a discrete-diffusion language model?**

The short thesis, stated here so the rest of the document can be read against it:

> In an autoregressive transformer, the Jacobian view and the relevance-propagation
> view are two readings of the same backward pass, and conservation-based relevance
> (LRP) is a *refinement*. In a discrete-diffusion language model, the inter-step
> channel is a non-differentiable map between discrete token identities, so the
> Jacobian view does not merely degrade — **it ceases to be defined**. Relevance
> propagation is then the only formalism that exists on that channel at all. Two
> further constraints — a target-axis asymmetry and a fit-cost blow-up — independently
> force the same design.

> **Thesis history.**
>
> **v0.2 — weakened.** An earlier version claimed the construction "survives depth
> `L·T`". Lemma 5.1 refuted it for the ε-rule: conservation is violated at rate `θ^n`,
> retaining only ~1.8% of aggregate relevance at `L·T = 768` for `ε = 1e-3`, while the
> exactly-conservative z-rule is numerically fragile. Only the qualitative
> **definedness** argument survived.
>
> **v0.3 — partially restored, conditionally.** Q9 is now substantially resolved: the
> **z⁺-rule with per-layer renormalisation** gives exact aggregate conservation at any
> depth, and Theorem 9.4 shows non-negativity forces `‖C‖_{1→1} = 1`, collapsing
> Lemma 4's geometric factor `B^{n−1}` to 1 — so allocation error is **linear** in
> `L·T`, not geometric. The price is discarding inhibitory relevance, and a fidelity
> condition `ε ≪ min_j|z_j|/n` whose satisfiability is empirical, not theoretical.
>
> So the honest thesis is: *a specific rule survives depth `L·T`, at a stated cost,
> subject to a condition theory alone cannot verify.* Not the clean structural
> guarantee originally asserted.

**Diffusion-side foundation — and its current gap.** The step recursion of early drafts
assumed a mean-field transport of position marginals. Proposition 6.1 proves that
operator **does not exist**: bidirectional attention makes the model read
inter-position correlation, so marginals are not a sufficient statistic, and the error
is maximal rather than small.

> **⚠ The replacement is not yet in hand (v0.4).** A previous version claimed
> path-conditioning repaired this. It does not — conditioning pins the intermediate
> canvases to constants, so `∂ζ^{(t−1)}/∂ζ^{(t)} = 0` and the steps come apart rather
> than composing. Conditioning handles the *intra-step* factor correctly and supplies
> **no** cross-step transport at all.
>
> **All of the project's diffusion-specific content lives in the cross-step join, and
> the join is currently unsupplied.** The most promising candidate is interventional
> (resample-and-compare), which is exact and derivative-free on a discrete channel. See
> `04-open.md` Q6-positive.
>
> Consequence for reading Q9: its mathematics concerns products of relevance matrices
> and is unaffected, but its interpretation as covering a full `L·T` trajectory is
> **contingent** on the join.

## Epistemic discipline

This project is built under a hard constraint: **the network egress policy of the
authoring environment blocks arxiv.org, proceedings.mlr.press, openreview.net,
semanticscholar.org, lesswrong.com, alignmentforum.org and transformer-circuits.pub.**
Only `github.com` / `raw.githubusercontent.com` are reachable.

We therefore adopt a rule that makes the mathematics independent of that constraint:

> **Self-containment rule.** Every definition used in a proof is stated explicitly in
> `01-preliminaries.md`. Every lemma is proved from those stated definitions alone.
> No proof step may appeal to an uncited or unread source.

Consequently the *correctness* of the results does not depend on the blocked sources.
Those sources matter for two separate things, tracked separately in `SOURCES.md`:

1. **Attribution** — who first proved a given standard result.
2. **Faithfulness of modelling** — whether our formalisation of "J-lens" and "R-lens"
   matches the real methods.

Claim (2) is where the genuine risk lives, and it is flagged inline throughout.

### Confidence tiers

Every factual claim in this project carries a tier marker.

| Tier | Meaning | Verification |
|------|---------|--------------|
| **A** | Verified from primary source we possess locally | Cited as `file:line` in a cloned repo |
| **B** | Standard mathematics, stated and proved here | Proof in `02-lemmas.md` + machine check in `verify/` |
| **C** | Attribution from search snippets; primary text never read | Explicitly marked UNVERIFIED |
| **D** | Our own conjecture or design proposal | Marked CONJECTURE; not used as a proof premise |

**Tier C and D claims may never be used as premises in a Tier B proof.**

## Layout

| File | Contents |
|------|----------|
| `NOTATION.md` | Symbols, index conventions, standing assumptions |
| `SOURCES.md` | Provenance ledger: what is verified, from where, at what tier |
| `01-preliminaries.md` | Definitions: transformer block, LayerNorm, attention, LRP, discrete diffusion |
| `02-lemmas.md` | Autoregressive-side results, with full proofs (Lemmas 1–7) |
| `03-q6-path-conditioning.md` | **Q6**: marginal transport refuted; path-conditioned attribution |
| `04-open.md` | Open branches, conjectures, and what would settle them |
| `05-q9-conservation-at-depth.md` | **Q9**: z⁺-rule + renormalisation; conservation at depth `L·T` |
| `AUDIT-01.md`, `AUDIT-02.md` | Adversarial referee reports and their dispositions |
| `verify/` | `sympy`/`numpy` scripts machine-checking every lemma |
| `sources/` | Citable `file:line` excerpts from locally cloned primary repos |

## Status

**Version 0.3.**

**Version 0.4** — after two machine-verification rounds (128 checks, negative controls)
and two adversarial audits (44 defects, 4 blocking).

**Established (Tier B, proved and machine-checked):**
- Lemmas 1–7, including the LayerNorm gradient⊙input identity `(ε/σ²)x̂`, the
  degree-of-homogeneity unification (Lemma 7), and Lemma 5.1's geometric decay of the
  ε-rule.
- **Theorem 9.4** — non-negativity forces `‖C⁺‖₁→₁ = 1`, making allocation error linear
  rather than geometric in depth. Verified contrast: ~603 orders of magnitude at
  `n = 768`. This is the project's main new result.
- **Proposition 6.1** — marginal transport provably does not exist.

**Closed:** Q1 (dissolved), Q5, Q6-negative, Q7, Q11 (negatively — z⁺ destroys its own
mixing).

**Open, in order of how much they gate:**
1. **Q6-positive** ★ — the cross-step join. Currently unsupplied; all diffusion-specific
   content depends on it.
2. **Q12** ★ — z⁺ requires `a ≥ 0`, which fails after LayerNorm. Gates the §9.6
   prescription.
3. Q10 (noise-split weight), Q13 (non-circular `T`-scaling test), Q2–Q4 (blocked on
   sources), and whether the fidelity window is non-empty for real activations.

**Not yet written:** the synthesis assembling the three forcing arguments (target-axis
asymmetry, fit-cost blow-up, definedness) into a full lens construction. It should not
be written until Q6-positive and Q12 are settled — twice now, drafting ahead of the
foundations produced claims the audits had to remove.

See `04-open.md` for the frontier and `AUDIT-01/02.md` for the defect record.

## Reproducing the machine checks

```bash
python3 verify/run_all.py
```

Requires `numpy` and `sympy` only.
