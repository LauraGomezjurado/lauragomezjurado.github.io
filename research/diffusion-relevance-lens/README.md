# Relevance Lenses for Diffusion Language Models

A formal-theory project asking: **what is the mathematically correct analogue of a
Jacobian-style interpretability lens for a discrete-diffusion language model?**

The short thesis, stated here so the rest of the document can be read against it:

> In an autoregressive transformer, the Jacobian view and the relevance-propagation
> view are two readings of the same backward pass, and conservation-based relevance
> (LRP) is a *refinement*. In a discrete-diffusion language model, the inter-step
> channel is a non-differentiable map between discrete token identities, so the
> Jacobian view does not merely degrade — **it ceases to be defined**. Conservation-based
> relevance propagation is then the only formalism that (a) exists on that channel and
> (b) survives depth `L·T`. Two further constraints — a target-axis asymmetry and a
> fit-cost blow-up — independently force the same design.

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
| `02-lemmas.md` | The autoregressive-side results, with full proofs |
| `03-diffusion.md` | Diffusion structure; the three forcing arguments; the proposed lens |
| `04-open.md` | Open branches, conjectures, and what would settle them |
| `verify/` | `sympy`/`numpy` scripts machine-checking each lemma |
| `sources/` | Extracted, citable excerpts from locally cloned primary repos |

## Status

Version 0.1 — skeleton and foundational lemmas. See `04-open.md` for what is not yet done.

## Reproducing the machine checks

```bash
python3 verify/run_all.py
```

Requires `numpy` and `sympy` only.
