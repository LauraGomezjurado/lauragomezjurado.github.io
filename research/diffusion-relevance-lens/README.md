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

**Diffusion-side foundation.** The step recursion of early drafts assumed a mean-field
transport of position marginals. Proposition 6.1 proves that operator **does not
exist** — bidirectional attention makes the model read inter-position correlation, so
marginals are not a sufficient statistic. The repair is a change of object:
attribution along a **realised trajectory** (`03-q6-path-conditioning.md`), which is
what monitoring needs regardless.

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

- Lemmas 1–7 proved and machine-checked (80 checks, negative controls included).
- Q5 closed (Lemma 7 bridge). Q6 closed (Prop. 6.1 refutation + path-conditioning).
  Q7 closed as a dividend of Q9 (Cor. 9.6). Q9 substantially closed (Thm. 9.4).
- Still open: Q1 (dissolved rather than answered — see Thm. 9.4), Q2–Q4 (blocked on
  sources), Q10 (noise-split weight), Q11 (Dobrushin coefficient, empirical), and
  whether the fidelity window (9.9) is non-empty in practice.
- **Not yet written:** the synthesis section assembling the three forcing arguments
  (target-axis asymmetry, fit-cost blow-up, definedness) into the full lens
  construction. It now has sound foundations to rest on.

See `04-open.md` for the current frontier.

## Reproducing the machine checks

```bash
python3 verify/run_all.py
```

Requires `numpy` and `sympy` only.
