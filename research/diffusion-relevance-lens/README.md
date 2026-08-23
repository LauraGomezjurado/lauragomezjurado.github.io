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

Path-conditioning is *not* the repair — conditioning pins the intermediate canvases to
constants, so `∂ζ^{(t−1)}/∂ζ^{(t)} = 0` and the steps decouple rather than composing.
It handles the intra-step factor and supplies no cross-step transport at all.

**The join is interventional (v0.5, empirical).** Scored against exact enumerated ground
truth in a fully tractable diffusion model, the interventional join reaches Pearson
`0.947` (`0.844` with only 8 samples), while straight-through relaxation reaches `0.539`
with raw error `0.97×` mean `|GT|` — against `1.00×` for predicting zero. Since ground
truth is provably the exact object the gradient join estimates, that whole gap is
relaxation bias. See `Q6-EXPERIMENT.md`.

> **⚠ Scope correction to the organising principle (v0.5).** Ground truth itself carries
> a ~30% completeness defect, because interventions at different positions **interact**
> and the sum of individual `do`-effects is not the joint effect. So **conservation is
> not a fidelity criterion at the cross-step join** — an attributor made conservative by
> construction is forced to satisfy an identity the truth violates, and optimising for it
> moves *away* from ground truth.
>
> Conservation remains the right principle for the **intra-step** factor, where the
> propagated map is linear and attribution is additive, and remains useful at the join as
> a sanity check (it flagged broken controls at 8× and 22×). But it is no longer claimed
> as the universal organising principle of the project.

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

**Version 0.5** — after two machine-verification rounds (128 checks, negative controls),
two adversarial audits (44 defects, 4 blocking), and two empirical testbeds with exact
enumerated ground truth.

**Established (Tier B, proved and machine-checked):**
- Lemmas 1–7, including the LayerNorm gradient⊙input identity `(ε/σ²)x̂`, the
  degree-of-homogeneity unification (Lemma 7), and Lemma 5.1's geometric decay of the
  ε-rule.
- **Theorem 9.4** — non-negativity forces `‖C⁺‖₁→₁ = 1`, making allocation error linear
  rather than geometric in depth. Verified contrast: ~603 orders of magnitude at
  `n = 768`. This is the project's main new result.
- **Proposition 6.1** — marginal transport provably does not exist.

- **Proposition 6.1** — marginal transport provably does not exist.
- **Lemmas 8 & 9** — LayerNorm outputs are always signed, and non-negativity is
  *necessary* (not just sufficient) for ℓ¹ non-expansiveness under unit column sums.
- **The cross-step join is interventional** (`Q6-EXPERIMENT.md`), scored against exact
  enumerated ground truth: `r = 0.947` vs `0.539` for relaxation.

**Closed:** Q1 (dissolved, then partly reopened in Lyapunov form), Q5, Q6 (both halves),
Q7, Q10 (negatively — both proposed weights make attribution worse), Q11 (negatively).

**Q12 — closed, and it blocks the prescription.** `a ≥ 0` fails automatically after
LayerNorm (Cor. 8.1); non-negativity is *necessary*, not just sufficient (Lemma 9); and
the Lyapunov escape is measured shut (`λ = +1.35…+2.83` for LayerNorm-fed sublayers,
`10^706` over `n = 768`). Realistic negativity `0.43–0.49` sits above the critical
`f_c ≈ 0.15–0.40` at every width, and widening makes it worse. **§9.6 applies to ReLU
networks and essentially nothing in a modern transformer** — GELU already fails.

**Open, in order of how much they gate:**
1. **Q14** ★ — does residual structure `I + A` raise `f_c`? The Q12 study modelled bare
   sublayers; a real block's non-negative identity term should suppress negative mass,
   and the verdict turns on a factor of only ~1.2–3. **The single highest-value next
   experiment.**
2. **Q12 route (ii)** — design a rule keeping the *product's* negative mass bounded.
   Cor. 9.2 gives a sharp target: `‖C‖₁ = 1 + 2max_j ν_j` exactly, so `λ` *is* the
   growth rate of negative mass.
3. Q13 (non-circular `T`-scaling test), Q2–Q4 (blocked on sources).

**Not yet written:** the synthesis assembling the three forcing arguments (target-axis
asymmetry, fit-cost blow-up, definedness) into a full lens construction. It should not
be written until Q6-positive and Q12 are settled — twice now, drafting ahead of the
foundations produced claims the audits had to remove.

See `04-open.md` for the frontier and `AUDIT-01/02.md` for the defect record.

## Reproducing the machine checks

```bash
python3 verify/run_all.py          # proof checks — fast, asserts, exits nonzero on failure
python3 verify/run_experiments.py  # empirical testbeds — slow, measures and reports
```

Requires `numpy` and `sympy` only.

The two runners are deliberately separate. `run_all.py` checks **identities** that must
hold if the lemmas are correct; a failure there means a proof is wrong. `run_experiments.py`
**measures** quantities that are not identities (correlations against ground truth,
Lyapunov exponents); a number moving there is a finding about the world, not a
regression. Only crashes and the scripts' own internal self-checks — exact-propagation
vs Monte-Carlo agreement, Lyapunov estimator validation against known exponents — count
as failures.
