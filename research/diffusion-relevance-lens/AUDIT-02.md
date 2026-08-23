# AUDIT-02 — adversarial referee report on `03-q6-path-conditioning.md` and `05-q9-conservation-at-depth.md`

Scope: the two files above, read in full. Context read for definitions and conventions
only (not re-audited): `NOTATION.md`, `01-preliminaries.md`, `02-lemmas.md`,
`04-open.md`, `README.md`, `SOURCES.md`, `verify/`, `AUDIT-01.md`.

Method: every algebraic step re-derived independently before reading the supplied
argument; every disputed claim given a numerical or constructive test; `verify/` run in
full.

### Versions audited

The project was edited three times during this audit. All findings below are against:

| file | md5 |
|---|---|
| `03-q6-path-conditioning.md` | `f7f1bea2fa6aa325c85752a2c06aa52d` |
| `05-q9-conservation-at-depth.md` | `aa42a59af486c0ffc852826d805e18d2` |
| `04-open.md` | `798b97d53207b52a4afc745a468f6427` |
| `README.md` | `e7f0d435c3e98b000e82f38cdb6224bb` |
| `verify/q6_path_conditioning.py` | `00c7c2eeeffa916bcf44e3528a65e587` |
| `verify/q9_renormalisation.py` | `1b5b7e27dbe27083dd7146be768abe8a` |

Three defects I had substantiated against earlier drafts were repaired mid-cycle and are
**not** charged below. They are recorded in §0.2 because the pattern of what got fixed
is diagnostic.

---

## Headline

**Q6.** The negative half is sound: Proposition 6.1 does refute (D9.1), and the repaired
terminal-step argument checks out. The positive half does not hold up. Proposition 6.3's
proof asserts that conditioning leaves "a finite composition of differentiable maps"; it
does not — conditioning **severs** the inter-step chain rather than differentiating it,
because it removes the randomness but not the discreteness (E1). Everything
diffusion-specific therefore lives at the joins, and the joins are supplied only by
Proposition 6.4, whose own note marks it Tier D — contradicting the file's opening "All
results here are Tier B" (E9). `run_all.py` now exempts Prop. 6.3 from machine checking
**by restating the false claim as the justification for the exemption** (E9(b)).

**Q9.** The algebraic core is right and the new verification suite is good — 32 checks
with genuine negative controls, several of which independently reproduce findings I had
made by hand. The remaining failures are structural rather than arithmetic, and the
largest is this: **the z⁺-rule is never defined anywhere in the project, is cited to a
definition (D7) that does not contain it, and the matrix `C` of §9.0 and the matrix `C`
of Theorem 9.4 are different objects** — Lemma 9.0 proves the column-sum identity only
for the first (E12). `verify/q9_renormalisation.py` *knows* they are two matrices; it
tests "z+-rule" and "plain z-rule" side by side and reports different norms (`1.000` vs
`95.31`) for the same `1ᵀC = 1ᵀ`. The prose has one `C` and one lemma. **The script and
the prose disagree about how many objects there are** — AUDIT-01 §D1's exact signature.

**A defect that cuts the project's way.** (9.9) is stated with `min_j |z_j|`, the
denominator of the *signed* rule, while §9.6 prescribes the *z⁺* rule whose stabiliser
sits on `z_j⁺ = Σ_i (a_i w_{ij})⁺`. Measured, these differ by ~2300×, because `|z_j|` is
small precisely through the cancellation that `z_j⁺` does not have. The document states
a residual fidelity condition roughly three orders of magnitude more pessimistic than
the rule it recommends actually needs (E15(i)). This is the highest-value repair in the
report.

**Circularity: none found.** No Tier C or Tier D claim is used as a premise in any proof
in either file. Two arguments are *vacuous* rather than circular — Prop. 9.1(a) invoking
Lemma 5 after imposing Lemma 5's conclusion (E17), and Prop. 6.4's `w·R + (1−w)·R = R`
(E2) — and one is a citation loop: Prop. 9.1's new blockquote justifies the z⁺+renorm
package partly by "Cor. 9.5(a)", a result that §9.4 (160 lines later) declares **not
operative**, and which has no part (a) (E13(c)).

**Recurrence of AUDIT-01 error classes.** §D12 (`z_j ≠ 0` as a parenthetical rather than
a hypothesis) recurs at Lemma 9.0 (E14). §D8.1 (bias-freeness assumed silently) recurs
at Lemma 9.0 (E14) and is checked by neither the prose nor the script. §D9 (antecedent
never discharged) recurs at Theorem 9.4 and Corollary 9.6 (E12, E16). §D3 (two files of
one document asserting opposite things) recurs four times (E9, E10, E22, and now
*within* `05-q9` itself — E13(d)). §D6's assigned repairs to Lemma 4 are unapplied and
now load-bearing (E19). AUDIT-01's explicitly assigned repair to `04-open.md` Q2 was
never made (E22).

---

## 0. Baseline: what I checked and confirm is correct

Stated up front so the objections can be read against a clear baseline. In a report
whose bar is "only defects you can substantiate", the non-findings matter.

### 0.1 Confirmed correct

**Theorem 9.4's algebra**, and all three stress points:

- `‖C‖_{1→1} = 1` for `C ≥ 0` with `1ᵀC = 1ᵀ`. Proof valid, equality case at `u = e_j`
  correct. (The project's own check now confirms it to `1.554e-15`, and — better —
  confirms it is attained, not merely bounded.)
- **Lemma 4's bound is legitimate here.** (L4.2) uses submultiplicativity and
  `‖·‖_{1→1}` is an induced operator norm, hence submultiplicative. (The *hypothesis* is
  still absent from Lemma 4 — E19(a) — but the application is sound.)
- **`‖E_ℓ‖ = η_ℓ` is correct.** `E_ℓ = Θ_ℓ − I = diag(−ε/(|z_j|+ε))`; the induced 1-norm
  of a diagonal matrix is the maximum absolute entry, `= ε/(min_j|z_j| + ε) = η_ℓ`.
  Verified to machine precision. The same value holds in `‖·‖₂` and `‖·‖_∞`, so (9.4) is
  norm-robust.
- **`Θ_ℓ = I + E_ℓ` does not break the hypotheses.** `CΘ ≥ 0` and `1ᵀ(CΘ) = θᵀ ≤ 1ᵀ`, so
  `CΘ` is *sub*-stochastic with `‖CΘ‖_{1→1} = max_j θ_j < 1`. Measured: `0.9936, 0.9952,
  0.9903, 0.9947` against `‖C‖_{1→1} = 1.000000`. So `B = 1` legitimately bounds **both**
  `‖A_ℓ‖` and `‖B_ℓ‖`. The step is correct; it is simply never written (E19(c)).

**Other confirmations.**

- (9.1): `θ_j = z_j/(z_j+εs_j) = |z_j|/(|z_j|+ε)` verified for both signs.
- (9.8)'s geometric sum: `Σ_{ℓ=1}^{n} η(1−δ)^{n−ℓ} = η(1−(1−δ)^n)/δ ≤ η/δ`. ✓
- Prop. 9.1(b): (9.3) is a scalar multiplication, so within-layer ratios are preserved.
  "Costs nothing within a layer" stands.
- (9.9)'s `⟺` step: `n·ε/(m+ε) ≪ 1 ⟺ ε(n−1) ≪ m ⟺ ε ≪ m/(n−1) ≈ m/n`. ✓ And *holding
  `min_j|z_j|` fixed*, `n: 48 → 768` does demand `ε` 16× smaller. (The defect is that
  `min_j|z_j|` is neither fixed nor the right quantity — E15.)
- **Prop. 6.1's repaired argument.** With `Q̄_0 = I` and the uniform kernel,
  `(Q_1 x_1) ⊙ x̂_0 ∝ x̂_0` for every `(x_1, x̂_0)` and every `α_1 ∈ {0, 0.3, 0.9, 0.999}`,
  so `x^{(0)}_1 = x̂_{0,1}` deterministically. At `α_1 = 1` the posterior is `0/0` for
  `(x_1, x̂_0) ∈ {(0,1),(1,0)}` — the `α_1 < 1` proviso is required, and correctly stated.
- `TC = log 2` **is** maximal for `N = 2, V = 2`: `TC = I(X_1;X_2) ≤ min_i H(π_i) ≤ log 2`.
- **No result depends on (D9.1).** `02-lemmas.md`'s dependency graph has no D9 edge, and
  no lemma statement or proof mentions `T^{(t)}` or `π^{(t)}`. (D9's own forward
  reference, "Lemma 5 records why this matters", is a broken cross-reference.) The
  retraction is safe; only its *placement* is defective (E10).

### 0.2 Repaired mid-cycle — not charged

1. **Prop. 6.1's `α_t = 0` "identity kernel".** The earlier draft's justification was
   backwards (`α_t = 0` is the fully-noised kernel; `α_t = 1` is the identity), and I had
   confirmed numerically that under a generic schedule it gives **zero** separation
   between `μ_A` and `μ_B`. It has been replaced by the terminal-step argument, which is
   correct (§0.1), and the error is recorded in an accurate self-correction note.
2. **Prop. 9.1's `1ᵀR ≠ 0`.** Now promoted from a parenthetical inside the proof to an
   explicit "**Hypothesis (H)**", with a blockquote acknowledging that "for **signed**
   relevance `1ᵀR` can pass through exactly zero, at which point (9.3) is undefined and
   the method fails outright — not gracefully." I had constructed the instance
   (`ε = 1e-3`, `|z| = (0.5, 1.0)`, `C = I`, `R = (1002, −1001)` ⟹ `1ᵀR^{(ℓ)} = 0`
   exactly, with renormalisation factors up to `1.002e+09` under perturbation). Residual
   issues in E13.
3. **Cor. 9.5's missing renormalisation hypothesis.** Now stated ("**and** the iterates
   are renormalised per Prop. 9.1 so that `u_n − v_n` is sum-zero"), with the mechanism
   correctly identified and the corollary declared "not operative" because z⁺'s own
   sparsity kills `δ`. I had measured the un-renormalised `1ᵀ(u−v)` reaching `−0.350` by
   layer 11; the project's check reaches the same conclusion with a `2509×` factor at
   `n = 768`. Residual issues in E13.

### 0.3 Non-findings — hypotheses I tested and could not substantiate

Reported because a referee who reports only hits is not calibrated.

**(a) "Realisable by one bidirectional attention head" was *not* an overclaim.** The
earlier draft asserted that `p_θ(x_{0,1}=0|x) = 1{x_1 = x_2}` is realisable by a single
head. I first constructed an argument that it is impossible (the head output at
position 1 lies on the segment `[v_0, v_1]`, and a linear readout on a segment is
monotone, so it cannot score both endpoints above every interior point). **That argument
is wrong** — it ignores positional embeddings, which give the head four distinct value
segments rather than one. The claim is correct, and I built one: put the query at
position 1 on `x_1` and the key at position 2 on `x_2`, so `score(1→2)` is large iff
`x_1 = x_2`; position 1's output is then `v(\text{pos }2)` on the equal cases and
`v(\text{pos }1)` on the unequal ones, which a linear readout separates. Measured
margins `1.000000` vs `0.000000`. The only genuine caveat is exactness — softmax cannot
attain `p ∈ {0,1}` at finite logits, so the realisable model gives separation `2(1−2δ)`
rather than `2`. **The defect is that this sentence was *removed*, not that it was
false** (E4).

**(b) Lemmas 1–7 do not depend on causal masking.** I checked each. No step in L1, L2,
L3, L4, L5, L5.1, L6 or L7 uses causality, a triangular mask, or an ordering of
positions. Causality enters the project only at D5.1 ("Under causal masking only
`p' ≥ p` contributes"), which is the J-lens estimator and is used by neither file under
audit. Prop. 6.3's "Lemmas 1–7 apply verbatim" fails for a different reason (E7).

**(c) `‖E_ℓ‖ = η_ℓ` is right**, and `Θ_ℓ = I + E_ℓ` does *not* break the non-negativity
or column-sum structure (§0.1). Both suspicions checked out in the document's favour.

**(d) Prop. 9.1(b) really does bound the renormalisation distortion at zero**, which is
exactly what Q9's option 2 asked for. The project's own negative control (an *additive*
renormaliser, which also achieves `1ᵀR = φ` but shifts ratios by up to `0.0494`) shows
the multiplicative form is doing specific work.

---

# Part I — `03-q6-path-conditioning.md`

## E1. Prop. 6.3's proof is false: conditioning severs the inter-step chain, it does not differentiate it — BLOCKING

**Severity:** BLOCKING (the printed justification is false, and the Tier-B promotion it
supports does not survive)
**Location:** Proposition 6.3 and its proof; §6.4 table row; `04-open.md` Q6;
`verify/run_all.py`'s exemption list

### The defect

> "Hence every quantity a backward pass requires is well-defined, and Lemmas 1–7 apply
> verbatim within each step.
>
> **Proof.** Immediate: conditioning on the path removes all randomness, leaving a
> finite composition of differentiable maps `f_θ(·, t)`, one per step, joined at fixed
> realised canvases. ∎"

It is not a composition. Non-differentiability at the inter-step boundary has **two**
independent sources:

1. **randomness** — `x^{(t−1)}` is a *sample*;
2. **discreteness** — `x^{(t−1)}` is a *token identity*. (D8.a, S2) says exactly this:
   "`Sample(·)` between steps is **not** differentiable; `∂x^{(t−1)}/∂x^{(t)}`
   undefined".

Conditioning on `x^{(T:0)}` removes (1) and does nothing to (2). Once `x^{(t−1)}` is a
fixed realised canvas it is a **constant**, and a constant has zero derivative with
respect to anything upstream:

    ∂ζ^{(t−1)} / ∂ζ^{(t)} = 0

So `{f_θ(·,t)}_{t=T}^{1}` is not a composition; it is a *disjoint family* of `T`
differentiable maps with no functional dependence between them. A backward pass seeded
at `φ(x^{(0)})` reaches every unit of the final step and then **stops**. There is no
route by which relevance travels from step `t−1` to step `t`, so Def. 6.2's task —
"assign relevance to each `(ℓ, t, i)`" — is not discharged for any `t` but the last.

The document's own next section concedes this in substance. §6.3 is titled "**what
conditioning does *not* remove**"; it introduces a *postulated* split `w`; and Prop. 6.4
concedes that conservation "gives **no** guidance on `w`" and marks the construction
**Tier D**. So the section immediately following supplies the join that Prop. 6.3 claims
is already well-defined.

The overclaim then propagates verbatim:

> "| Recursion was Tier D | Path-conditioned attribution is **Tier B** (Prop. 6.3) |"

and `04-open.md` Q6: "This raises the recursion from Tier D to Tier B." Neither holds.
Prop. 6.3 establishes Tier B **within one step**; the *cross-step* recursion — the whole
diffusion-specific content, and the only thing Q6 was ever about — is Tier D by
Prop. 6.4's own note.

**And the exemption now enshrines it.** `verify/run_all.py`'s "Not machine-checked (by
design)" list reads:

> "Prop 6.3: conditioning on a realised path removes randomness, leaving a finite
> composition of differentiable maps; no numeric content beyond Lemmas 1-7, which are
> checked individually."

The one claim in these two files that is actually false is the one exempted from
checking, and the exemption **restates the false claim as its own justification**. The
`verify/` discipline that caught AUDIT-01 §D1 is here routed around.

### Suggested repair

> **Prop. 6.3 (within-step well-definedness).** Conditional on `x^{(T:0)}`, for each `t`
> the map `h_0^{(t)} ↦ ζ^{(t)}` is deterministic and differentiable, so the backward pass
> of Lemmas 1, 2, 3, 4, 6, 7 is well-defined **within step `t`**, subject to those
> lemmas' own hypotheses (E7).
>
> **Remark (what conditioning does not buy).** Conditioning removes the *stochasticity*
> of the inter-step channel, not its *discreteness*. With `x^{(t−1)}` fixed,
> `∂ζ^{(t−1)}/∂ζ^{(t)} = 0`: the steps are **decoupled, not composed**. Any cross-step
> relevance flow must therefore be *posited*, not differentiated. Prop. 6.4 posits one;
> it is Tier D.

Correct the §6.4 row to "Within-step attribution is Tier B (Prop. 6.3); the cross-step
join remains Tier D (Prop. 6.4)". Update `04-open.md` Q6, `README.md`'s "Q6 closed"
line, and — importantly — `run_all.py`'s exemption text.

---

## E2. Prop. 6.4's "satisfies (D7.1) identically" is either false or vacuous — and the sink's leak is geometric in `T`, which Q9 ignores — MATERIAL

**Severity:** MATERIAL
**Location:** Proposition 6.4; and its interaction with `05-q9` §9.6

### Defect (a)

> "Let `w^{(t)}_j ∈ [0,1]`. Routing `w·R` back through the network and `(1−w)·R` to an
> exogenous **noise sink** `𝒩` satisfies (D7.1) identically, for *any* choice of `w`.
>
> **Proof.** `w·R + (1−w)·R = R`. ∎"

(D7.1) is `Σ_u R_u^{(ℓ)} = Σ_v R_v^{(ℓ+1)}`, a sum over **units at layer `ℓ`**.
"Exogenous" places `𝒩` *outside* that set. Then the layer-`ℓ` sum is `w·R < R` whenever
`w < 1`, and **(D7.1) fails**. The proposition is true only under the unstated
convention that `𝒩` counts as a unit — under which it is a tautology: *any* leak can be
made "conservative" by naming its destination. Neither the convention nor the vacuity is
stated. "Satisfies (D7.1) identically" reads as a property earned; it is a bookkeeping
choice.

The Tier-D note correctly says conservation cannot select `w`. It does not say the
stronger and more useful thing: **once a sink is admitted, conservation stops being
evidence of anything**, because it can no longer be violated. That is the point worth
making, and it bears directly on Prop. 9.1 (E17), where the aggregate is likewise made
unfalsifiable.

### Defect (b) — cross-document

§6.4's prescription is "join steps at the realised token identities, splitting relevance
at each boundary per Prop. 6.4." Under it, the relevance reaching the network at step
`t` carries a factor

    ∏_{t=1}^{T} w^{(t)}

— **geometric decay in `T`**: Lemma 5.1's failure mode, reintroduced at the step
boundaries by the very repair meant to close Q6.

`05-q9-conservation-at-depth.md` **never mentions the noise sink**. It models depth
`n = L·T` as a bare product `∏(C_ℓΘ_ℓ)` with no `w` factors, and concludes:

> "**Net:** the prescription is **z⁺-rule + per-layer renormalisation**. It gives exact
> aggregate conservation at any depth"

The two are inconsistent. Either the sink applies, and Q9's aggregate is `φ·∏_t w^{(t)}`
rather than `φ`; or per-layer renormalisation is applied across the boundaries too, in
which case it re-injects exactly the mass Prop. 6.4 routed to `𝒩`, and the noise sink
has no effect on anything.

### Suggested repair

1. "With `𝒩` counted among the layer-`ℓ` units, (D7.1) holds for any `w`. The identity
   is a bookkeeping tautology, recorded to show that conservation *cannot* select `w` —
   and, more sharply, that admitting a sink makes conservation unfalsifiable."
2. Add to §6.4 and to `05-q9` §9.6: "if `w < 1` at the boundaries the network-side
   aggregate carries `∏_t w^{(t)}`; the Q9 renormalisation is applied *within* steps
   only, and the boundary leak is reported separately rather than renormalised away."

---

## E3. (6.1) smuggles conditional independence of `x̂_0` given `x` — MATERIAL

**Severity:** MATERIAL (an unstated hypothesis presented as a consequence)
**Location:** §6.1, the sentence introducing (6.1)

> "The sampler (D8.4) induces a Markov kernel. **Conditional on the realised canvas `x`,
> the positions are drawn independently, so**
>
>     K_t(x' | x) = ∏_i [ Σ_a p_θ(x_{0,i} = a | x) · q(x'_i | x_i, a) ]    (6.1)"

The "so" does not go through. The general kernel induced by (D8.4) is

    K_t(x' | x) = Σ_{â ∈ V^N} p_θ(â | x) ∏_i q(x'_i | x_i, â_i)

which equals (6.1) **iff `p_θ(·|x)` is a product measure over positions**. Nothing
establishes that:

- **(A4)** factorises the *forward* process, `q(x_t|x_{t−1}) = ∏_i q(x_{t,i}|x_{t−1,i})`.
  It says nothing about the model's reverse posterior.
- **D8** defines per-position **marginals** — "the network emits per-position clean-token
  logits `f_θ(x^{(t)},t)_i ∈ ℝ^V`, giving `p_θ(x_{0,i}|x^{(t)})`" — then writes "with
  `x̂_0 ~ p_θ`" without specifying the joint law of the draw. Semi-autoregressive and
  any-order decoders, both live in this literature, break it.

So conditional independence of the reverse draw is an extra standing assumption — and it
is a **mean-field assumption at the model-output level**, introduced sixty lines above
"We do **not** pursue the mean-field route." Prop. 6.1's whole point is that positions
are coupled through `p_θ`; the document establishes that coupling in the *conditioning*
and assumes it away in the *draw*.

Prop. 6.1 itself survives — the counterexample inspects only position 1's marginal,
which is governed by the per-position posterior regardless. **(6.2) does not**; it is
derived from (6.1).

### Suggested repair

Add to `01-preliminaries.md` D8:

> **(A5) Factorised reverse draw.** `x̂_0 ~ p_θ(·|x^{(t)})` is drawn independently per
> position: `p_θ(â|x) = ∏_i p_θ(â_i|x)`. This is the standard D3PM/MDLM sampler and is
> **not** implied by (A4). It is what makes `K_t(·|x)` a product measure in (6.1). Note
> that it is a mean-field assumption on the *model output*, distinct from — and not
> refuted by — Prop. 6.1's refutation of mean-field on the *state*.

and change "so" to "under (A5)".

---

## E4. Prop. 6.1's `p_θ` is now an arbitrary function; the "bidirectional attention" reading is unsupported — MATERIAL

**Severity:** MATERIAL
**Location:** Prop. 6.1 proof; the Reading following it; `README.md`; `04-open.md` Q6

The proof now says only:

> "Choose a model that reads the *correlation*:
>
>     p_θ(x_{0,1} = 0 | x) = 1 if x_1 = x_2, else 0"

The earlier draft's realisability sentence was removed along with the `α_t = 0`
correction. But the interpretation the proposition carries depends entirely on
realisability:

> "**Reading.** … position marginals are not a sufficient statistic for the dynamics,
> **because bidirectional attention makes the model a function of inter-position
> correlation.**"

and `README.md`: "Proposition 6.1 proves that operator **does not exist** —
bidirectional attention makes the model read inter-position correlation"; and
`04-open.md` Q6: "because bidirectional attention lets `p_θ` read inter-position
correlation". **Attention appears nowhere in the proof.** As it stands the proposition
says "there exists *some* function `V² → Δ^V` for which marginal transport fails" —
true, but it does not implicate transformers, bidirectionality, or (S3), and so does not
support the Reading, the README, or Q6.

The removed claim was correct and I verified it constructively (§0.3(a)). The one
genuine caveat is exactness:

| `δ` | `π^{(0)}_1 \| μ_A` | `π^{(0)}_1 \| μ_B` | ℓ¹ separation |
|---|---|---|---|
| 0 (idealised) | (1, 0) | (0, 1) | 2.000 |
| 1e−3 | (0.999, 0.001) | (0.001, 0.999) | 1.996 |
| 0.1 | (0.9, 0.1) | (0.1, 0.9) | 1.600 |

so "the outputs differ maximally" should be "differ by `2(1−2δ)`, arbitrarily close to
maximal". Strictly positive separation suffices to refute well-definedness.

### Suggested repair

> Such a `p_θ` is realisable, to within `δ`, by a **single bidirectional attention
> head**: let the query at position 1 depend on `x_1` and the key at position 2 on
> `x_2`, so that `score(1→2)` is large exactly when `x_1 = x_2`; the head then returns
> `v(\text{pos }2)` on `{(0,0),(1,1)}` and `v(\text{pos }1)` on `{(0,1),(1,0)}`, which a
> linear readout separates. Softmax cannot attain `δ = 0` at finite logits, so the
> induced marginals separate by `2(1−2δ)` rather than `2` — which suffices. It is the
> **bidirectionality** that is essential: with a causal mask, position 1's query cannot
> see `x_2` and no such head exists.

(The last sentence is what actually earns the Reading, and is worth proving.)

---

## E5. "The error is governed by the total correlation" is unproved, and false as stated — MATERIAL

**Severity:** MATERIAL (an unproved claim used in three files as the justification for
abandoning a whole line of work)
**Location:** the Consequence blockquote after Prop. 6.1; repeated in `04-open.md` Q6
and `README.md`

> "**Consequence.** Any mean-field step recursion is an *approximation whose error is
> governed by the total correlation* `TC(μ^{(t)}) = Σ_i H(π_i) − H(μ)`. Prop. 6.1 shows
> the error is not small in general: the counterexample has `TC = log 2`, the maximum
> for `N = 2, V = 2`, and produces total disagreement."

**(a) "Governed by" is asserted, never proved.** There is no result of the form
`error ≤ g(TC)` or `error ≥ g(TC)` anywhere in the project. One instance with large `TC`
and large error establishes only that the error is not *uniformly* small.

**(b) It is false as a control.** Take the same `μ_A, μ_B` (so `TC = log 2`, maximal)
but a model that reads only its own position:

    p_θ(x_{0,j} = 0 | x) := 1 if x_j = 0, else 0

Then `π^{(0)}_j` depends on `μ` only through `π^{(t)}_j`, so the mean-field recursion is
**exact — error zero — at maximal `TC`**. The error is therefore not a function of `TC`;
it depends jointly on `TC` *and* on how much of `p_θ` reads across positions. The true
statement is one-directional: `TC = 0` ⟹ error `0`. No converse control is available.

The sub-claim that `TC = log 2` is maximal for `N = 2, V = 2` **is** correct (§0.1).

### Suggested repair

> **Consequence.** The mean-field recursion is exact when `TC(μ^{(t)}) = 0`, and
> Prop. 6.1 shows it can fail maximally when `TC > 0`. We have **no** bound of the form
> `error ≤ g(TC)` — indeed a model reading only its own position is mean-field-exact at
> maximal `TC`, so the error depends on `p_θ` as well as on `μ`. Lacking such a bound we
> abandon the mean-field route rather than approximate it. Establishing a `TC`-based
> bound, or refuting the possibility of one, would be a separate result.

---

## E6. Prop. 6.3 asserts differentiability on a discrete domain, contradicting D9's own preamble — MATERIAL

**Severity:** MATERIAL (internal contradiction between two files — AUDIT-01 §D3's class)
**Location:** Def. 6.2 and Prop. 6.3; `01-preliminaries.md` D9 preamble

> "`ζ^{(t)} := f_θ(x^{(t)}, t) ∈ ℝ^{N×V}` … a **deterministic, differentiable** function
> of the realised `x^{(t)}`." (Def. 6.2)
>
> "the map `x^{(t)} ↦ ζ^{(t)}` is a deterministic differentiable function (A2)" (Prop. 6.3)

`x^{(t)}` ranges over `V^N`, a **finite set**. Differentiability of a map on a finite set
is not a meaningful property, and (A2) — "within a single forward pass the network is
differentiable almost everywhere" — is about activations, not the token argument.

`01-preliminaries.md` D9 says the opposite in as many words:

> "Because `x^{(t)}` are one-hot, `∂x^{(t−1)}/∂x^{(t)}` does not exist (S2)."

The intended object is presumably the composition through the embedding, but that is a
*different map* differentiated in a *different variable*, and the choice matters:
relevance at `(0, t, i)` is relevance on the embedding, not on the token.

### Suggested repair

> `ζ^{(t)} = F_θ(h_0^{(t)}, t)` where `h_0^{(t)} = E^ᵀx^{(t)} + P` is the embedded
> canvas. `F_θ(·,t)` is differentiable a.e. by (A2); `x^{(t)} ↦ h_0^{(t)}` is a lookup on
> a finite set and is never differentiated. Relevance at `(0,t,i)` is therefore relevance
> on the *embedding* of the realised token. This is consistent with (S2)/D9: no
> derivative with respect to a token identity is taken anywhere.

---

## E7. "Lemmas 1–7 apply verbatim" — no such contiguous range, and "verbatim" imports undischarged hypotheses — MATERIAL

**Severity:** MATERIAL
**Location:** Prop. 6.3; §6.4 closing paragraph

**(a) There is no contiguous "1–7".** `02-lemmas.md` contains Lemmas 1, 2, 3, 4, 5,
**5.1**, 6, **6.1** and 7. "Lemmas 1–7" reads as including 5.1 and 6.1; 5.1 is the
*negative* result (the ε-rule is not conservative) and 6.1 is the tractability corollary
that "makes the diffusion construction tractable". Both are load-bearing here, and both
carry unrepaired AUDIT-01 findings.

**(b) "Verbatim" imports hypotheses this file does not discharge.**

| Lemma | Hypothesis required (per AUDIT-01) | Discharged here? |
|---|---|---|
| L1(c) | `β = 0` in `LN = γ⊙x̂ + β` (§D4) | no |
| L5 | a rule satisfying (D7.1) at every layer (§D9) | no — this is Q9's subject |
| L6 | `z_j ≠ 0` for all `j`; **bias-free** layer (§D8, §D12) | no |
| Cor. 6.1 | affine ≠ linear; whole-graph induction; cost model (§D8) | no — all four gaps stand |

Corollary 6.1 matters most: §6.4's prescription ("run the conservative backward pass of
Lemmas 1–7 within each realised step") is tractable at `L·T` depth only if Cor. 6.1
holds, and AUDIT-01 rated it SOUND-WITH-REPAIR with four missing pieces, none supplied.

**(c)** The causality worry is a non-finding — see §0.3(b).

### Suggested repair

> …and Lemmas 1, 2, 3, 4, 6 and 7 apply within each step, subject to their stated
> hypotheses (`β = 0` for L1(c); `z_j ≠ 0` and bias-free layers for L6; Cor. 6.1's four
> conditions). None uses causal masking, so the transfer to a bidirectional network is
> immediate. Lemma 5 is *conditional*; whether its antecedent holds at depth `L·T` is Q9.

---

## E8. Remark 6.5 attributes the Gumbel-max to the wrong variable, and the margin does not decompose additively — MATERIAL

**Severity:** MATERIAL (two independent errors in a remark `04-open.md` Q10 calls "the
**most promising route**")
**Location:** Remark 6.5 and (6.4); §6.3 opening

### Defect (a) — wrong variable

> "Under the Gumbel-max representation, `x^{(t−1)}_j = argmax_b (ζ^{(t)}_{j,b} + G_{j,b})`
> with `G` i.i.d. Gumbel."

Gumbel-max over the *network logits* `ζ^{(t)}` samples from
`softmax(ζ^{(t)}_j) = p_θ(x_{0,j}|x^{(t)})`. That draw is `x̂_{0,j}` — the clean-token
guess — **not** `x^{(t−1)}_j`. By (D8.4) the realised `x^{(t−1)}_j` comes from a *second*
draw,

    x^{(t−1)}_j ~ q(· | x_{t,j}, x̂_{0,j}) ∝ (Q_t x_{t,j}) ⊙ (Q̄_{t−1}ᵀ x̂_{0,j})

whose log-weights include a **kernel** term `log (Q_t x_{t,j})_c` beside the model term.
So the promised split "into a model part (`ζ`) and a noise part (`G`)" is missing a
third, **kernel**, part — and that part carries the schedule `α_t`, i.e. how much of the
draw was forced by where the diffusion process already was. For the absorbing kernel
(D8.3) the kernel term *dominates*: an already-unmasked position cannot change at all,
and no amount of `ζ` explains that. §6.3 inherits the conflation — "the realised token
`b*` was drawn from the model's distribution `p^{(t)}_j ∈ Δ^V`" — and `p^{(t)}_j` is
never defined anywhere in the file.

### Defect (b) — the margin is not additively decomposable

> "    m = min_{c ≠ b*} [ (ζ_{b*} + G_{b*}) − (ζ_c + G_c) ]     (6.4)
>
> which **decomposes additively** into a model part (`ζ`) and a noise part (`G`)."

`m = min_c[(ζ_{b*} − ζ_c) + (G_{b*} − G_c)]`, and `min(A + B) ≠ min A + min B`. The
minimum does not distribute over the sum, so `m` has no additive model/noise split; only
the **per-`c`** margin does, and the argmin generally differs between the two parts.
This is fatal for the proposed use — "how much of the win was the model" as a
*measurable quantity per draw* — because the quantity to be measured is not well-defined.

### Suggested repair

> Under Gumbel-max, `x̂_{0,j} = argmax_b (ζ^{(t)}_{j,b} + G_{j,b})`. For each `c ≠ b*` the
> pairwise margin splits additively as `m_c = (ζ_{b*} − ζ_c) + (G_{b*} − G_c)`; the
> *overall* margin `m = min_c m_c` does not, since the argmin differs between parts. A
> candidate statistic is the model share of the **binding** margin,
> `(ζ_{b*} − ζ_{c*})/m_{c*}` at `c* = argmin_c m_c`. The subsequent kernel draw
> contributes a **third** term, so any `w` must account for model, noise **and** kernel.

---

## E9. "All results here are Tier B" is contradicted inside the file, and the one false claim is the one exempted from checking — MATERIAL

**Severity:** MATERIAL
**Location:** lines 7–8, versus the Prop. 6.4 blockquote; `verify/run_all.py`

**(a) Internal contradiction.**

> "All results here are Tier B: proved from `01-preliminaries.md` and machine-checked in
> `verify/q6_path_conditioning.py`."

versus, 130 lines later in the same file:

> "> **Honest scope (Tier D).** Prop. 6.4 says conservation gives **no** guidance on `w`."

Prop. 6.4 is a result in this file. Remark 6.5 is likewise Tier D ("**Not developed
here**"). One of the two statements is wrong.

**(b) The exemption problem.** `verify/q6_path_conditioning.py` now exists and passes 16
checks — the AUDIT-01 §D11 provenance defect has been repaired, and this is real
progress. But `run_all.py`'s exemption list reads:

> "Prop 6.3: conditioning on a realised path removes randomness, leaving a finite
> composition of differentiable maps; no numeric content beyond Lemmas 1-7, which are
> checked individually."

Prop. 6.3 is the **only** result in these two files whose stated proof is false (E1), and
it is the one result exempted — with the false claim itself supplied as the reason. The
`verify/` discipline that caught AUDIT-01 §D1 has been routed around at exactly the
point where it was needed. (There is also a residual scope error: the exemption says
"no numeric content **beyond Lemmas 1–7**", but Prop. 6.3's content is not numeric at
all — it is a claim about the *structure* of the computation graph, which is precisely
what a symbolic or graph-level check could test.)

### Suggested repair

> Prop. 6.1 and Prop. 6.3 (within-step) are Tier B. Prop. 6.4 and Remark 6.5 are
> **Tier D**: the split weight `w` is postulated, not derived (Q10).

and replace `run_all.py`'s Prop. 6.3 exemption with a check that actually tests the
structural claim — e.g. build the two-step graph with the realised canvas as a constant
and assert `∂ζ^{(t−1)}/∂ζ^{(t)} = 0`, which is the fact E1 turns on and which would have
surfaced it automatically.

---

## E10. The (D9.1) retraction is announced only in `03`; `01-preliminaries.md` still asserts the refuted claim — MINOR

**Severity:** MINOR
**Location:** §6.4; `01-preliminaries.md` D9

> "**(D9.1) is hereby retracted.** `01-preliminaries.md` retains it only as the object
> Prop. 6.1 refutes."

`01-preliminaries.md` D9 contains no such marker. It still reads:

> "Because `x^{(t)}` are one-hot, `∂x^{(t−1)}/∂x^{(t)}` does not exist (S2). The
> **well-defined object** is the induced map on **position marginals** `π^{(t)}_i ∈ Δ^V`"

A reader of `01-preliminaries.md` alone meets an assertion of well-definedness that the
project's own Prop. 6.1 refutes, with no warning. AUDIT-01 §D3 established this class,
and D7/D8.4 in the same file already carry exactly the correction markers that D9 lacks
— so the convention exists and was simply not applied here.

I confirm the retraction is otherwise **safe**: nothing depends on D9.1 (§0.1).

Two riders:

- Retaining D9.1 retains AUDIT-01 §D19's unrepaired gauge defect (unconstrained partials
  of a simplex-valued map). Cleanest fix: strike D9.1's *claim*, keep its statement.
- Prop. 6.1's conclusion "Hence no operator `T^{(t)}` on `(Δ^V)^N` can satisfy (D9.1)" is
  strictly about **one** `t` (the proof is at the terminal step). That suffices, since
  D9.1 asserts existence for every `t`, but the quantifier should be written — because
  the natural defence ("restrict to product measures and the map *is* well-defined") is
  the mean-field route, and what rules it out is E5's missing bound, not Prop. 6.1.

### Suggested repair

Insert into D9 a marker matching D7's and D8.4's:

> **⚠ Retracted (Prop. 6.1).** The claim that position marginals are the well-defined
> object is **false**: Prop. 6.1 exhibits two joints with identical marginals whose
> successors differ maximally. D9.1 is retained only as the object that proposition
> refutes. No lemma depends on it.

---

## E11. Prop. 6.1 presentation residuals — EDITORIAL

1. The displayed conclusion still reads `under μ_A: π^{(t−1)}_1 = (1, 0)` although the
   repaired proof is at the terminal step `t = 1 → 0`; it should be `π^{(0)}_1`.
2. The "Self-correction" blockquote is spliced **into the middle of the proof**, between
   the derivation and its conclusion, so `∎` closes a proof interrupted by an editorial
   note. Move it after `∎`.
3. The repaired counterexample is **uniform-kernel-specific** — correctly flagged ("for
   the uniform kernel with `α_1 < 1`"). Worth one sentence noting it does *not* transfer
   to the absorbing kernel (D8.3), where `(Q_1 x_1) ⊙ x̂_0 = 0` whenever `x̂_0 ≠ x_1` and
   `x_1 ≠ m`, so the posterior is undefined. I verified this. Harmless for an existence
   claim, but D8.b says results are "stated for the kernel family (D8.2)/(D8.3)".
4. `p_θ` is specified only at position 1; position 2's posterior is left free. Harmless,
   but should be said.
5. Section labels collide with result labels: Prop. **6.4** lives in §**6.3**, and both
   Def. 6.2 and Prop. 6.3 live in §6.2. "Per Prop. 6.4" sends a reader to the wrong
   section.

---

# Part II — `05-q9-conservation-at-depth.md`

## E12. The z⁺-rule is never defined, is cited to a definition that does not contain it, and the matrix `C` is silently swapped — BLOCKING

**Severity:** BLOCKING (the central object of the document's prescription is undefined,
and the only proof of the hypothesis Theorem 9.4 needs is a proof about a different
matrix — while the project's own verification script treats them as two objects)
**Location:** Theorem 9.4; §9.0/Lemma 9.0; §9.6

### Defect (a) — false citation, undefined object

> "Let `C ≥ 0` entrywise with `1ᵀC = 1ᵀ` (**the z⁺-rule, D7**)."

D7 of `01-preliminaries.md` defines exactly four things: **gradient⊙input**, the **LRP
linear (z-)rule** (D7.2), the **ε-rule**, and the **γ-rule**. There is no z⁺-rule in D7,
nor anywhere in `01-preliminaries.md`, `NOTATION.md` or `02-lemmas.md`. Project-wide,
`z⁺` occurs only in this file, in `04-open.md` Q7 (where it is floated as a *possible*
fix), in `SOURCES.md` C6 (an **UNVERIFIED** R-lens variant), and in `README.md` (quoting
this file).

So the headline prescription —

> "**Net:** the prescription is **z⁺-rule + per-layer renormalisation.**"

— names a rule the project never defines and attributes it to a definition that does not
contain it. That violates the self-containment rule ("Every definition used in a proof is
stated explicitly in `01-preliminaries.md`").

### Defect (b) — the object is swapped, and Lemma 9.0 does not cover the new one

§9.0 defines, and Lemma 9.0 proves the column-sum identity for,

    C_{ij} := a_i w_{ij} / z_j          with   z_j = Σ_i a_i w_{ij}

This `C` is **signed**; Theorem 9.4 requires `C ≥ 0`. The matrix Theorem 9.4 must mean is

    C⁺_{ij} := (a_i w_{ij})⁺ / z_j⁺     with   z_j⁺ := Σ_i (a_i w_{ij})⁺

and `1ᵀC⁺ = 1ᵀ` is a **different identity**. Lemma 9.0's proof —

> "`Σ_i C_{ij} = Σ_i a_i w_{ij} / z_j = z_j / z_j = 1`"

— is about the signed matrix with denominator `z_j`, and does not establish it.

**The project's own verification script already knows there are two matrices.** Its
output distinguishes them explicitly and repeatedly:

> `[PASS] Lemma 9.0 (numeric): max |sum_i C_ij - 1| over d in {4,16,64,256}: **z+-rule**
> 1.665e-15, **plain z-rule** 1.501e-11`
>
> `[PASS] M1 mutant (signed C, norm): sup ||Cu||_1/||u||_1 is 1.000000000000 for C >= 0
> but **9.531e+01 for the plain (signed) z-rule with the SAME unit column sums** (both
> satisfy (9.2) to 9.3e-15) -> non-negativity, NOT (9.2), is what gives B = 1`

The script runs **two different `C`s**, gives them different names, and reports that they
behave completely differently. The prose has **one `C`**, one Lemma 9.0, and one
definition-free citation. This is AUDIT-01 §D1's exact signature — "the prose in
`02-lemmas.md` and the machine check in `verify/` state opposite things" — and it is the
project's own strongest evidence against its own text. Note further that the *symbolic*
Lemma 9.0 check is `sum_i a_i w_ij / z_j = 1`, i.e. the **signed** identity; `1ᵀC⁺ = 1ᵀ`
is only ever checked numerically, for an object with no written definition.

### Defect (c) — the substitution propagates and is not carried through

Once the object changes, three quantities change with it, and none is updated:

- `Θ` must be `diag(z_j⁺/(z_j⁺+ε))`, not `diag(|z_j|/(|z_j|+ε))` — (9.1) unchanged.
- `η_ℓ` must be `ε/(min_j z_j⁺ + ε)`, not `ε/(min_j|z_j| + ε)` — (9.4) unchanged.
- (9.9) is stated with `min_j |z_j|` — wrong by ~2300× measured, and *against* the
  document's interest. See E15(i).

### Defect (d) — `C ≥ 0` does not follow from a positive-*weight* rule

The nearest thing D7 offers is the γ-rule, "replace `w` by `ρ(w) = w + γ·w⁺`". As
`γ → ∞` this tends to a positive-*weight* rule whose numerator is `a_i w_{ij}⁺`, which is
`≥ 0` only if `a_i ≥ 0`. In a transformer the LRP inputs are residual-stream activations,
which LayerNorm **centres** — signed by construction. So non-negativity must come from
taking positive parts of the *products*, a third distinct rule needing its own definition
and its own column-sum proof. (The verify script's z⁺ construction uses `w⁺ = max(w,0)`
— the *weight* form — which is a fourth variant again, and is the one whose sparsity
kills `δ` in Cor. 9.5's disposition. Which variant the disposition applies to therefore
depends on a choice the document never makes.)

### Suggested repair

Add to `01-preliminaries.md` D7:

> **z⁺-rule.** `R_i = Σ_j [ (a_i w_{ij})⁺ / z_j⁺ ] R_j` with
> `z_j⁺ := Σ_{i'} (a_{i'} w_{i'j})⁺ > 0`. The positive part is taken of the **product**,
> not of the weight, so non-negativity does not require `a ≥ 0`.
> **Lemma.** `C⁺ ≥ 0` entrywise and `1ᵀC⁺ = 1ᵀ` whenever `z_j⁺ ≠ 0`, since the
> numerators sum over `i` to the denominator. Its ε-stabilised form has
> `θ⁺_j = z_j⁺/(z_j⁺ + ε)`.

Then restate Lemma 9.0 for `C⁺` (or state it twice — for `C` with `z_j ≠ 0` and for `C⁺`
with `z_j⁺ ≠ 0`), propagate `z_j⁺` through (9.1), (9.4) and (9.9), and add a symbolic
check for `1ᵀC⁺ = 1ᵀ` matching the existing one for `1ᵀC = 1ᵀ`.

---

## E13. Corollary 9.5's disposition contradicts the file's own abstract, cites a non-existent part, and still has no proof — MATERIAL

**Severity:** MATERIAL (downgraded from BLOCKING: the missing renormalisation hypothesis
and the `δ ≈ 0` diagnosis were repaired mid-cycle — §0.2(3))
**Location:** Corollary 9.5 and (9.8); the file's abstract (lines 3–6); Prop. 9.1's new
blockquote; §9.6

The repair is substantial and correct. What remains:

**(a) There is still no proof.** No `**Proof.**` block, no `∎`, in a file headed "Tier B
throughout". The chain that is now needed is not obvious and is worth three lines: with
`ũ_ℓ = c_ℓ C_ℓΘ_ℓ ũ_{ℓ+1}`, `c_ℓ = φ/(1ᵀΘ_ℓũ_{ℓ+1})`,

    ũ_ℓ − v_ℓ = C_ℓ[ (c_ℓΘ_ℓ − I) ũ_{ℓ+1} ] + C_ℓ[ ũ_{ℓ+1} − v_{ℓ+1} ]

and **both brackets are separately sum-zero** — the first because
`1ᵀ(c_ℓΘ_ℓ − I)ũ = c_ℓ Σ_j θ_jũ_j − φ = 0` by the definition of `c_ℓ` — which is what
licenses applying the contraction termwise. Note the per-layer term is then bounded by
`max_j|c_ℓθ_j − 1|·‖ũ_{ℓ+1}‖_1 ≤ (η_ℓ/(1−η_ℓ))·φ`, **not** by `η_ℓ`: (9.8) as displayed
has the wrong constant and the wrong units.

**(b) `u`, `v`, `δ` and `η` are all undefined in this file.** `u` and `v` appear nowhere
else; `η` (unsubscripted) must be `max_ℓ η_ℓ`; and the Dobrushin coefficient is defined
only in `04-open.md` Q11 — a different file, added after the fact. That matters because
the sign convention it fixes (`δ` as the **overlap**, contraction `1−δ`) is the opposite
of the common convention in which the Dobrushin coefficient *is* the contraction factor
`τ(P) = ½ max_{i,i'}‖P_{i·} − P_{i'·}‖_1`. Under that reading, "`δ(C_ℓ) ≥ δ > 0`" would
mean *poor* mixing and (9.8) would be backwards. Print the definition where it is used.

**(c) A citation loop.** Prop. 9.1's new blockquote justifies the package by

> "renormalisation makes the z⁺ contraction argument applicable (sum-zero differences,
> **Cor. 9.5(a)**)"

Corollary 9.5 has no part (a) — its parts (a) and (b) are the two *repair notes* in the
following blockquote, not clauses of the corollary. And §9.4 then declares:

> "**Disposition: Corollary 9.5 is not operative.**"

So half the stated motivation for adopting the two halves of the prescription together
is a pointer to a non-existent clause of a result the same file retracts 130 lines later.
The package argument needs a different second leg — and one is available: renormalisation
is needed because it makes the *sum-zero* structure available to **any** future
contraction argument, and because it makes the aggregate a fixed reference for
thresholding (Remark 9.2), not because Cor. 9.5 works.

**(d) The abstract contradicts §9.4 and §9.6.** Lines 3–6 still read:

> "the *allocation* defect loses its geometric term entirely (Thm. 9.4), becoming linear
> in depth — **and depth-*uniform* under a mixing hypothesis (Cor. 9.5)**."

while §9.4's own heading now reads "**conditional, and the condition essentially never
holds for the z⁺-rule**", its disposition reads "**Corollary 9.5 is not operative**", and
§9.6's table row reads "Allocation error is depth-uniform | **NO in practice**". The
abstract was not updated. It is the first thing a reader sees and it asserts what the
body retracts.

**(e) Dimensional bookkeeping.** (9.7) bounds an **operator** norm (dimensionless) while
(9.8) bounds a **vector** norm (units of `φ`), and they are presented as the same
"defect". The per-layer term in (9.8) should carry `‖u_{ℓ+1}‖_1 = φ`.

### Suggested repair

Rewrite the abstract's third clause as "…becoming linear in depth (Thm. 9.4). A
depth-*uniform* bound is available under mixing (Cor. 9.5) but the z⁺-rule destroys its
own mixing, so **(9.7)'s linear bound is the operative statement**." Add the three-line
proof, define `u, v, δ, η` in-file, and replace the "Cor. 9.5(a)" citation.

---

## E14. Lemma 9.0 drops D7.2's bias and never hypothesises `z_j ≠ 0` — MATERIAL

**Severity:** MATERIAL (a load-bearing hypothesis silently dropped at the foundation of
the file; two AUDIT-01 findings recurring, one of them entirely unchecked)
**Location:** §9.0 and Lemma 9.0

### Defect (a) — the bias. Unchecked by prose *and* by script.

§9.0 opens "From (D7.2) with the ε stabiliser". D7.2 reads:

> "**LRP linear rule (z-rule).** For `z_j = Σ_i a_i w_{ij} + b_j`:"

Lemma 9.0's proof uses `z_j = Σ_i a_i w_{ij}` — dropping `b_j`. With `b_j ≠ 0`,

    Σ_i C_{ij} = (z_j − b_j)/z_j = 1 − b_j/z_j ≠ 1

and **everything in the file collapses**: (9.2) fails, "(9.2) *is* conservation of the
z-rule" fails, Theorem 9.4's `1ᵀC = 1ᵀ` hypothesis fails, Cor. 9.5's `1ᵀv_ℓ = φ` fails,
and Cor. 9.6's `Σ_u R_u = φ` fails.

AUDIT-01 §D8.1 flagged this exact identity for Corollary 6.1 — "with `b_j ≠ 0` the z-rule
(D7.2) gives `Σ_i R_i = Σ_j R_j (1 − b_j/z_j) ≠ Σ_j R_j`" — and prescribed "every affine
layer is bias-free (or biases are absorbed by a stated convention)". The repair was made
in neither `02-lemmas.md` nor here, and the hypothesis is now dropped again at the
foundation of the project's headline result. LayerNorm's `β` (AUDIT-01 §D4) is a bias in
the same sense, so this is not hypothetical for a real transformer.

**`verify/q9_renormalisation.py` does not test it either.** Its Lemma 9.0 checks —
symbolic at `d ∈ {2,3,4}` and numeric at `d ∈ {4,16,64,256}` — all construct `z` as
`Σ_i a_i w_{ij}` with no bias term, so the suite reproduces the prose's omission rather
than catching it. A one-line mutant (`b ≠ 0`, assert `|Σ_i C_{ij} − 1| = |b_j/z_j|`)
would close this, and would fit the file's existing negative-control style.

### Defect (b) — `z_j ≠ 0`. Caught by the script, not carried into the prose.

`z_j ≠ 0` appears only *inside* the proof of Lemma 9.0, never as a hypothesis of the
lemma. This is verbatim AUDIT-01 §D12, whose prescribed repair was "Add to the
**statement**".

It matters more here than at Lemma 6, because (9.1) also asserts

> "`θ_j := z_j/(z_j + ε s_j) = |z_j|/(|z_j| + ε) ∈ (0,1)`"

and at `z_j = 0` with `s_j = sign(0) = 0` the denominator is `0`: `θ_j` is **undefined**,
not in `(0,1)`. So the factorisation `R^{(ℓ)} = CΘR^{(ℓ+1)}` on which the entire file is
built does not exist at a zeroed unit — and zeroed units (post-ReLU, masked heads) are
common.

The script states the finding in full and correctly:

> `[PASS] Lemma 9.0 (z_j = 0 breaks): ... (9.2) is FALSE at z_j = 0. Before that it fails
> SILENTLY: at z_j ~ 1e-16 reached by cancellation the computed column sum is off by up
> to 5.250e+00 ... the same silent failure as Lemma 6. The z_j != 0 hypothesis is not a
> formality.`

**The check says "not a formality"; the lemma statement still treats it as one.** This is
the same prose/verification divergence as E12, and it is now the third instance.

Under the z⁺ substitution (E12) the condition becomes `z_j⁺ ≠ 0`, a *different*
degenerate set needing its own statement.

### Suggested repair

> **Lemma 9.0.** Assume the layer is bias-free (`b_j = 0`, or biases absorbed by a stated
> convention) and `z_j ≠ 0` for every `j`. Then `1ᵀC = 1ᵀ`. Where either hypothesis fails
> the factorisation `R^{(ℓ)} = CΘR^{(ℓ+1)}` of §9.0 does not exist: at `z_j = 0` both
> `C_{·j}` and `θ_j` are undefined (and are silently wrong nearby), while with `b_j ≠ 0`
> the column sums are `1 − b_j/z_j`.

Add a remark on bias handling in a real block — absorb into an extra input unit with
`a_bias = 1`, `w_{bias,j} = b_j`, restoring `Σ_i C_{ij} = 1` at the cost of one
non-interpretable unit per layer — and note that this unit's relevance is then
*discarded*, which interacts with Cor. 9.6's accounting.

---

## E15. (9.9) is stated for the wrong rule, in the vacuous form, and with the wrong `T`-scaling — MATERIAL

**Severity:** MATERIAL (three independent errors in the document's single most
consequential displayed condition; **one of them is against the document's own
interest**, and the new "empirical confirmation" confirms a tautology rather than the
claim)
**Location:** §9.5, (9.9); §9.6's "Empirical confirmation"; `04-open.md` Q9; `README.md`

> "    n · ε / ( min_j |z_j| + ε )  ≪  1     ⟺     ε ≪ min_j |z_j| / n     (9.9)
>
> At `n = L·T = 768` versus `n = L = 48`, this demands `ε` smaller by the factor
> `T ≈ 16`. So **the denoising-step count enters the requirement linearly**"

### (i) The denominator belongs to the *signed* rule, not the prescribed `z⁺` rule

The prescription is z⁺, whose stabiliser sits on `z_j⁺ = Σ_i (a_i w_{ij})⁺`, not on
`|z_j| = |Σ_i a_i w_{ij}|`. The difference is structural: `|z_j|` is small *precisely
through cancellation*, while `z_j⁺` sums positive terms and has none. Measured
(`d = 512` activations `a ~ N(0,1)`, 512 units, `w ~ N(0,1/d)`, 200 draws):

| quantity | value |
|---|---|
| `E[min_j \|z_j\|]` | 2.356e−03 |
| `E[min_j z_j⁺]` | 5.504e+00 |
| ratio | **2337×** |
| count of `z_j⁺ = 0` | 0 of 102 400 |

and therefore at `n = 768`:

| `ε` | `n·η` via `\|z_j\|` | `n·η` via `z_j⁺` |
|---|---|---|
| 1e−6 | 0.33 | 0.0001 |
| 1e−3 | **228.9** (vacuous) | **0.14** (usable) |

**The document states a residual condition roughly three orders of magnitude more
pessimistic than the rule it prescribes actually requires.** Fixing it converts §9.5's
"whether the window is non-empty is an empirical question" into a much stronger position:
switching to z⁺ removes the very cancellation that made `min_j|z_j|` small, so the same
non-negativity that buys `B = 1` *also* buys the fidelity window. That is a second,
unremarked benefit of Theorem 9.4's hypothesis and is the most valuable repair in this
report.

The document's own script gestures at the mechanism without connecting it:
"`sum_l eta_l` is dominated by a few layers with tiny `min_j|z_j|`".

### (ii) (9.9) is derived from the looser of the two bounds (9.7) prints

(9.7) prints `‖·‖ ≤ Σ_ℓ η_ℓ ≤ n·max_ℓ η_ℓ`, and (9.9) is the `n·max_ℓ η_ℓ` form.
`max_ℓ η_ℓ` is set by the **single worst unit anywhere in the network**, while
`Σ_ℓ η_ℓ` averages. Measured (`z ~ N(0,1)`, `d = 5000` — the document's own Cor. 5.2
parameters):

| `n` | `ε` | `Σ_ℓ η_ℓ` | `n·max_ℓ η_ℓ` |
|---|---|---|---|
| 48 | 1e−8 | **0.009** | 0.104 |
| 48 | 1e−6 | 2.496 | 43.5 |
| 768 | 1e−8 | **0.150** | 10.58 |
| 768 | 1e−6 | 16.01 | 706.7 |
| 768 | 1e−3 | 630.8 | 767.9 |

At `n = 768, ε = 1e−8` the `Σ` form is `0.150` (marginally usable) and the `n·max` form
is `10.58` (vacuous) — a factor of 70. Under the printed form (9.9) is essentially never
satisfiable: even `n = 48, ε = 1e−6` already gives 43.5.

### (iii) "The factor `T ≈ 16`" is wrong for the bound as printed — and the new empirical check confirms a tautology

Because (9.9) descends from `max_ℓ η_ℓ`, its `min_j |z_j|` is really `min_{ℓ,j}` — a
minimum over `n·d` quantities, which *itself* scales like `1/(n·d)`. Measured:

| `n` | `E[min over all n·d units]` | `E[per-layer min]` |
|---|---|---|
| 48 | 8.622e−06 | 2.505e−04 |
| 768 | 2.003e−07 | 2.485e−04 |

The global minimum shrinks by ~43× (consistent with `1/n` scaling plus sampling noise)
while the per-layer minimum is flat. So in `ε ≪ min_{ℓ,j}|z_j| / n` **both** factors move
with `n`, and the requirement tightens by ≈ `T² = 256×`, not `T = 16×`. "The
denoising-step count enters the requirement **linearly**" is false for the printed bound.
It **is** linear for the tighter `Σ_ℓ η_ℓ` form, whose per-layer `min_j` is
depth-independent — one more reason to use that form.

**The new machine checks do not test this.** Both

> `[PASS] Eq (9.9) eps ratio ~ 16: eps(48)/eps(768) ranges 16.0000..16.1579`
>
> `[PASS] Eq (9.9) empirical: measured error at (n=768, eps/16) matches the error at
> (n=48, eps) to within 30%`

hold `min_j|z_j|` **fixed** across the two depths and then observe that `ε` scales with
`n`. That is the algebraic identity `ε ∝ m/n` restated, not a test of the claim. §9.6
nonetheless promotes it: "the linear-in-`T` tradeoff is **exact, not merely an upper
bound**." The check that would settle it is to *resample* `z` at both depths and compare
`min_{ℓ,j}|z_j|`, which is a two-line change and would surface the `T²` scaling.

`04-open.md` Q9 ("demands `ε` smaller by ~16×") and `README.md`
("`ε ≪ min_j|z_j|/n`") inherit all three errors.

### Suggested repair

> **The residual fidelity condition.** From the termwise form of (9.7), faithful
> allocation requires
>
>     Σ_{ℓ=1}^{n} η_ℓ ≪ 1,     η_ℓ = ε / ( min_j z_j⁺{}^{(ℓ)} + ε )      (9.9)
>
> i.e. `ε ≪ z̄⁺/n`, where `z̄⁺` is the *typical per-layer* minimum positive-part
> pre-activation. `z̄⁺` is depth-independent, so `T` enters **linearly**: `n = 48 → 768`
> demands `ε` smaller by `T ≈ 16`.
>
> Two remarks. **(a)** The relevant denominator is `z_j⁺`, not `|z_j|`: summing positive
> parts removes the cancellation that drives `|z_j|` toward zero — and that drives the
> Lemma 6 silent failure. This is a second benefit of non-negativity beyond Thm. 9.4, and
> it is large: measured, `min_j z_j⁺` exceeds `min_j|z_j|` by ~2300×. **(b)** The looser
> bound `n·max_ℓ η_ℓ ≪ 1` is governed by the single worst unit in the whole network, is
> essentially never satisfiable, and additionally scales as `T²` rather than `T` because
> `min_{ℓ,j}|z_j|` itself falls with depth. It should not be used.

---

## E16. Corollary 9.6 has unbound quantifiers, an ambiguous bound, no proof of what it displays, and an undischarged hypothesis — MATERIAL

**Severity:** MATERIAL (this is the result that closes Q7, which `04-open.md` still
warns is "currently **overclaimed**")
**Location:** Corollary 9.6

> "Hence `Σ_u |R_u| = Σ_u R_u = φ`, and thresholding at `R > τ` **does** certify capture
> of a `(1−ε)` fraction of the explanation: discarding units with `R_u ≤ τ` loses at most
> `|{u}|·τ` out of `φ`, with no cancellation.
>
> **Proof.** Non-negativity removes the sign-cancellation counterexample that made Q7
> open: total variation equals the aggregate. ∎"

**(a) `ε` is unbound.** No relation among `τ`, `ε` and `φ` is stated anywhere, so the
sentence is not truth-apt as written. The bound certifies a `(1−ε)` fraction only if
`|{u}|·τ ≤ ε·φ`, i.e. `τ ≤ εφ/|{u}|` — the condition that makes this a certification
rather than an inequality. With `φ = 1` and `d = 5000`, certifying `ε = 0.01` needs
`τ ≤ 2e−6`.

**(b) `|{u}|` is ambiguous** — discarded units, or all units? As written `{u}` reads as
the full unit set. Measured (`d = 5000`, `φ = 1`):

| `τ` | true discarded mass | `\|discarded\|·τ` | `\|all\|·τ` |
|---|---|---|---|
| 1e−6 | 0.0000 | 0.0000 | 0.0050 |
| 1e−5 | 0.0006 | 0.0013 | 0.0500 |
| 1e−4 | 0.0611 | 0.1224 | **0.5000** |

The three differ by an order of magnitude; which is meant determines whether the
corollary says anything. The script's check — "loses at most `|{u}|*tau` … at every
quartile threshold tested" — tests the *inequality* under the discarded-set reading and
leaves the `(1−ε)` certification untested.

**(c) `ε` collides with the LRP stabiliser** used throughout the document — including in
(9.9) two sections later, where the two are *coupled* (both want to be small, for
unrelated reasons). Use `κ`.

**(d) The proof does not prove the display.** It proves `Σ|R| = ΣR` and says nothing
about the thresholding bound. "Removes the sign-cancellation counterexample that made Q7
open" is an argument by obstruction-removal; eliminating one counterexample is not a
proof of a positive claim.

**(e) `R^{(L)} ≥ 0` is carried and never discharged.** Nothing in the project says how
`R^{(L)}` is seeded, and the two natural seeds are not sign-definite: gradient⊙input at
the output (`R^{(L)}_v = h^{(L)}_v ∂φ/∂h^{(L)}_v`), or a monitor score `φ` that is a
**logit difference** and may itself be negative. The script's harness *assumes* `R ≥ 0`
rather than deriving it. This is AUDIT-01 §D9's class recurring.

It now also propagates upward: Prop. 9.1's new blockquote rescues hypothesis (H) by
"under the z⁺-rule `R ≥ 0`, so `1ᵀR = φ > 0` and (H) holds automatically" — which
inherits both the undischarged `R^{(L)} ≥ 0` **and** an unstated `φ > 0`. For a signed
monitor score neither holds, and (H) is not automatic.

**(f) The real content is thinner than advertised.** Once `R ≥ 0` and `Σ_u R_u = φ`, the
retained fraction `Σ_{kept}R_u/φ` is *directly measurable at runtime*; no bound is
needed, and a top-`k` rule dominates a threshold rule. The corollary's substance is
"non-negativity plus Lemma 9.0", worth stating plainly rather than as a certification
theorem.

**(g) The project is three-ways inconsistent on Q7.** `04-open.md` §Q7 still reads
"**Status:** open, and currently **overclaimed** … **Until resolved, the cheap-monitor
claim (Tier D3\*) must not be stated as a consequence of conservation.**"; `04-open.md`
§Q9's table says "Q7 thresholding certification | **Closed as a dividend** (Cor. 9.6)";
`README.md` says "Q7 closed as a dividend of Q9 (Cor. 9.6)". `SOURCES.md` D3\* still
lists the claim as Tier D pointing at the non-existent `03-diffusion.md`.

### Suggested repair

> **Corollary 9.6.** Assume the z⁺-rule and `R^{(L)} ≥ 0` with `1ᵀR^{(L)} = φ > 0` (e.g.
> the seed `R^{(L)} = φ·e_{target}`; note gradient⊙input seeds and signed monitor scores
> are **not** sign-definite). Then `R^{(ℓ)} ≥ 0` for every `ℓ` and
> `Σ_u|R_u| = Σ_u R_u = φ`. Consequently, for any `κ ∈ (0,1)`, discarding
> `S = {u : R_u ≤ τ}` retains `φ − Σ_{u∈S}R_u ≥ φ − |S|τ`, so `τ ≤ κφ/|S|` certifies
> capture of a `(1−κ)` fraction.
> **Proof.** `C ≥ 0`, `Θ ≥ 0` give `R^{(ℓ)} ≥ 0` by induction; `1ᵀC = 1ᵀ` (Lemma 9.0)
> gives the aggregate; the threshold bound is `Σ_{u∈S}R_u ≤ |S|τ`. ∎
> **Remark.** With `R ≥ 0` the retained fraction is directly measurable, so the bound is
> a *design* rule for choosing `τ` a priori, not a runtime certificate.

and update `04-open.md` §Q7 and `SOURCES.md` D3\* to CLOSED-with-hypothesis.

---

## E17. Prop. 9.1 answers Q9 **option 2**, and the document labels it option 1 — MATERIAL

**Severity:** MATERIAL (goalpost; it changes the epistemic value of the result)
**Location:** the blockquote after Prop. 9.1; §9.4's disposition; §9.6;
`04-open.md` Q9 table

> "> **This answers Q9 option 1 for the aggregate.**"

`04-open.md`'s Q9, retained verbatim under "original statement, retained for the record",
lists:

> "1. A rule with a **depth-uniform** conservation defect (e.g. defect `O(ε)` total
> rather than `O(ε)` per layer) — would make the thesis clean.
> 2. A **renormalisation** step at each denoising boundary that restores `Σ R = φ` by
> construction, **with a bound on the distortion it introduces**."

Renormalisation is *verbatim* option 2. The mislabel is repeated in §9.4's new
disposition ("Q9 option 1 is answered for the *aggregate* (Prop. 9.1)"). It is not
cosmetic, because the two have different content:

- **Option 1** asks for a rule whose aggregate is conserved *intrinsically*. An
  intrinsically conserved aggregate is **evidence** that the propagation tracks the
  model, and its violation is a **diagnostic**.
- **Option 2** asks for a *correction*. An imposed aggregate is a change of units; it can
  never fail, so it can never diagnose anything — the same loss of information as
  Prop. 6.4's noise sink (E2(a)).

**A related fact the document should state.** Because the recursion is *linear* in `R`
(`C_ℓ`, `Θ_ℓ` are fixed by the forward pass), rescaling at layer `ℓ` rescales every
downstream layer by the same factor. **Per-layer renormalisation is therefore exactly
equivalent to a single terminal rescale by `φ/(1ᵀR^{(0)})`.** It does no work at any
intermediate layer. Saying so makes clear that Prop. 9.1 cannot create information — the
honest version of Remark 9.2, and consistent with it.

**Finally, the Lemma 5 invocation is vacuous.** "(D7.1) holds by construction and Lemma 5
applies with **zero** aggregate defect at any depth" — Lemma 5's *conclusion* is
`Σ_u R_u^{(ℓ)} = φ`, which (9.3) imposes by fiat. The derivation is valid but empty; it
should not be presented as Lemma 5 doing work.

**Residual on Remark 9.2.** Its table row "| failure mode | silent collapse of scale |
drift in allocation |" is still stated **unscoped**, three sections before z⁺ is
introduced. Under the signed rule the renormalised failure mode is *not* "drift in
allocation" but unbounded silent amplification near `1ᵀR = 0` — which the new
Prop. 9.1 blockquote now says, but the table two paragraphs later still contradicts.

### Suggested repair

> **This answers Q9 option 2** — renormalisation restoring `ΣR = φ` by construction — and
> Prop. 9.1(b) supplies the distortion bound option 2 asked for: the distortion is
> **zero**, since the recursion is linear in `R` and (9.3) is a scalar multiplication.
> For that same reason per-layer renormalisation is *identical in effect* to a single
> terminal rescale; it cannot create information, and the aggregate ceases to be a
> diagnostic. **Q9 option 1 — a rule with an intrinsically depth-uniform aggregate defect
> — remains unachieved.**

and scope Remark 9.2's table to `z⁺`.

---

## E18. Theorem 9.4 does not dissolve Q1 — the two `B`s are different objects — MATERIAL

**Severity:** MATERIAL (the conflation erases the project's own central contrast)
**Location:** the "This is the mechanism" blockquote after Theorem 9.4;
`04-open.md` Q9; `README.md` Status

> "**This is the mechanism.** **Q1 asked whether `B > 1` for transformer blocks.**
> Theorem 9.4 *dissolves* rather than answers it: `B = 1` is not an empirical hope but an
> algebraic consequence of `C ≥ 0` plus unit column sums."

Q1 asks about a specific `B`:

> "one needs a lower bound on `B = max_ℓ ‖J_{ℓ→ℓ+1}‖`. By (D1.2), `J_{ℓ→ℓ+1} = I + A_ℓ`."

That is the **block-Jacobian** norm — the *J-lens* half of the project's thesis.
Theorem 9.4 bounds `‖C_ℓ‖_{1→1}`, the **relevance-propagation** matrix — the *R-lens*
half. Choosing a non-negative attribution rule constrains `C_ℓ`; it says nothing about
`I + A_ℓ`. **Q1 is not dissolved, not answered, and not affected.**

This matters more than a mislabel, because the L4-vs-L5 contrast **is** the thesis: the
J-lens's composed Jacobian degrades with depth, the R-lens's conserved relevance does
not. Theorem 9.4 makes that contrast *sharper* — the R-lens's matrix is provably
non-expansive while the J-lens's is not known to be — and reporting it as "Q1 dissolved"
collapses the two sides into one and throws the contrast away.

The file's own new "Directional caveat" compounds the problem in the document's favour
and should be followed through: it shows `B > 1` does **not** imply geometric growth
("at 5% sign-flipped weights, `B = 763 ≫ 1` yet the product still does not expand"), so
`B` was never the right pivot for the J-lens either — "the true pivot is the **Lyapunov
exponent** of the product". If so, Q1 as *posed* is the wrong question, which is a
different and more interesting disposition than "dissolved by Thm. 9.4", and one the
project is now in a position to state.

`README.md`'s "Still open: Q1 (dissolved rather than answered — see Thm. 9.4)" is
self-contradictory on its face.

### Suggested repair

> **This is the mechanism, and it applies to the *relevance* product, not the Jacobian
> product.** Lemma 4 is a general statement about `∏A_k`, invoked twice in this project:
> once with `A_k` = block Jacobians (the J-lens; Q1 asks whether *that* `B > 1`, and it
> is still open) and once here with `A_ℓ = C_ℓΘ_ℓ`. Theorem 9.4 pins `B = 1` for the
> **second** product only. That does not answer Q1 — it *sharpens the contrast Q1 was
> posed to test*: the R-lens's propagation matrix is provably non-expansive, while
> nothing is known about the J-lens's. Separately, the Directional caveat below shows
> `B` is the wrong statistic for either product; the Lyapunov exponent is.

---

## E19. Q9 inherits four un-repaired Lemma 4 defects that are now load-bearing — MINOR

**Severity:** MINOR (individually small; collectively the reason (9.7) is not fully
derived)
**Location:** §9.3–§9.4; `02-lemmas.md` Lemma 4

**(a) Submultiplicativity is still not a hypothesis of Lemma 4**, although its proof uses
it and §9.4 uses it explicitly (`‖C_ℓE_ℓ‖ ≤ ‖C_ℓ‖·‖E_ℓ‖`); `NOTATION.md` still never
defines `‖·‖`. AUDIT-01 §D6 prescribed this and it was not made. The application here is
nonetheless **valid** (§0.1) — a stated-hypothesis gap, not an error.

**(b) The `B_k`/`B` collision AUDIT-01 asked to be fixed is made worse.** §9.3 reads
"Applying Lemma 4 with `A_ℓ = C_ℓΘ_ℓ`, `B_ℓ = C_ℓ`" and three lines later "with `B`
bounding `‖C_ℓ‖`". `E` is overloaded in the same passage: Lemma 4's `E_k = A_k − B_k` is
`C_ℓE_ℓ` here, while `E_ℓ := Θ_ℓ − I`. The text writes `max_ℓ‖C_ℓE_ℓ‖` correctly, so no
error results — but AUDIT-01's prescribed rename would have spared the reader the check.

**(c) `B` must bound both `‖A_ℓ‖` and `‖B_ℓ‖`; only one is checked.** §9.3 says "with `B`
bounding `‖C_ℓ‖`"; `‖C_ℓΘ_ℓ‖ ≤ 1` is never verified. It is true — `CΘ` is sub-stochastic
(§0.1) — but it is a required step of the Lemma 4 application.

**(d) (9.7)'s first inequality does not follow from (9.5).** (9.5) is (L4.2), which takes
a **uniform** `e = max_ℓ‖C_ℓE_ℓ‖` and yields only `n·max_ℓ η_ℓ`. The per-layer sum
`Σ_ℓ η_ℓ` requires (L4.1) termwise:
`‖(∏_{m<ℓ}B_m)E_ℓ(∏_{m>ℓ}A_m)‖ ≤ 1·η_ℓ·1`. The text says "Substituting `B = 1` into
(9.5) … yields (9.7)", which yields only the *right-hand* inequality. Load-bearing:
Cor. 9.5's `Σ_ℓ η_ℓ(1−δ)^{n−ℓ}` needs the termwise form, and E15(ii) shows the two
bounds differ by ~70× at `n = 768`. The project's own check confirms the tighter bound is
the one that binds ("measured err(768) = 8.7287e-04 <= sum_l eta_l = 2.1063e-03, slack
2.41x"), i.e. the bound actually used is the one not derived.

### Suggested repair

> Applying (L4.1) **termwise** with `A_ℓ = C_ℓΘ_ℓ`, `B_ℓ = C_ℓ` (so Lemma 4's `E_ℓ` is
> `C_ℓ(Θ_ℓ − I)`; write `Ẽ_ℓ := Θ_ℓ − I` to avoid the collision), and using
> `‖C_ℓ‖_{1→1} = 1` (Thm. 9.4) together with `‖C_ℓΘ_ℓ‖_{1→1} = max_j θ_j ≤ 1`, each of
> the `n` terms is bounded by `‖C_ℓẼ_ℓ‖ ≤ η_ℓ`, giving `Σ_ℓ η_ℓ` directly.

---

## E20. `n = L·T` undercounts the LRP layers; `T ≈ 16` is Tier C; the "603 orders of magnitude" is harness-dependent — MINOR

**Severity:** MINOR
**Location:** §9.5; the Directional-caveat table in §9.4

**(a)** (9.9) is applied with `n = L·T = 768`, i.e. **one LRP linear layer per
transformer block**. By (D1.1) a block contains an attention sublayer, an MLP (itself two
linears) and two LayerNorms — each a separate LRP node with its own `C` and `Θ`. The true
`n` is roughly 4–6× larger, and since the bound is linear in `n` this is a constant-factor
understatement of what (9.9) demands.

**(b)** `T ≈ 16` is inferred from Cor. 5.2's `768/48` and never sourced. D8.b marks the
DiffusionGemma kernel and step counts **UNVERIFIED (Tier C)**, and `04-open.md` Q8 item 4
still lists "canvas/step counts" as blocked. A Tier C number sets the quantitative
headline of a Tier B section.

**(c)** The Directional-caveat table reports "≈**603 orders of magnitude** separate z⁺
from the plain z-rule at `n = 768`, purely from imposing `C ≥ 0`". The magnitude is a
property of the **synthetic harness**, not of the rules: the "plain z-rule" control is a
*random* signed `C` with unit column sums, whose per-layer growth rate `6.138` is set by
how much sign cancellation the sampler puts in. A real network's `C = a_iw_{ij}/z_j` is
not random. The qualitative contrast is real and well-demonstrated (and the graded 5% /
35% mutant is a good design); the *number* should be reported as harness-dependent, and
the sentence "purely from imposing `C ≥ 0`" as "purely from imposing `C ≥ 0` **on this
ensemble**".

---

## E21. Numbering and bookkeeping — EDITORIAL

1. **§9.2 does not exist.** Sections run §9.0, §9.1, §9.3, §9.4, §9.5, §9.6 — Remark 9.2
   sits inside §9.1. Correspondingly the result numbers jump 9.1 → 9.4, suggesting two
   deleted results.
2. Corollary 9.5's heading is split across two `###` lines ("— **conditional, and the
   condition\n### essentially never holds for the z⁺-rule**"), which renders as two
   headings.
3. `η` in (9.8) is unsubscripted and undefined (E13(b)); `φ` is dropped from the
   right-hand sides of (9.7) and (9.8) (E13(e)).

---

# Part III — cross-cutting

## E22. AUDIT-01 repairs were not applied where AUDIT-01 explicitly assigned them — MATERIAL

**Severity:** MATERIAL (the audit-response loop is not closing; three of these are live
contradictions between files)
**Location:** `04-open.md` Q2 and "Work not yet done"; `02-lemmas.md` Lemma 6;
`01-preliminaries.md`, `NOTATION.md`, `SOURCES.md`

Restricted to items bearing on the two files under audit.

**(a) `04-open.md` Q2 still carries the refuted factor-2 claim.** AUDIT-01 §D1 ended:

> "`04-open.md` Q2 ('By Lemma 2, failing to detach the softmax over-attributes the head
> by a factor 2') inherits this defect and **must be restated**."

`04-open.md` Q2 today reads, verbatim and unchanged:

> "By Lemma 2, failing to detach the softmax over-attributes the head by a **factor 2**,
> and that error lands precisely on the `i → j` cross-position edges which are the object
> of interest"

Meanwhile `02-lemmas.md` **was** repaired and now says the opposite in bold — "**That is
false**" — with a measured table showing the X-level ratio reaching 2.247 and varying
non-monotonically. The two files now assert contradictory things about the same lemma.
This bears directly on the diffusion side: Q2 is billed as "the first thing a diffusion
port must settle", and the reason given for its importance is the refuted claim.

**(b) `02-lemmas.md` Lemma 6 still cites the false ε-rule inequality as current.** Its
silent-failure blockquote ends:

> "it restores finiteness at the cost of weakening conservation to `Σ_i R_i ≤ Σ_j R_j`,
> **exactly as D7 states**."

D7 no longer states that. D7's correction box calls it "**false for signed relevance**"
with a counterexample; Lemma 5.1 repeats the refutation; and §9.0 of the file under audit
is built on the *corrected* form `Σ_i R_i = Σ_j θ_j R_j`. Three statements across two
files, one contradicting the other two.

**(c) `03-diffusion.md` is still referenced from five files and still does not exist.**
AUDIT-01 §D22.1 asked for every such reference to be marked "(forthcoming)". Live
references remain in `NOTATION.md` (l. 27, l. 64), `01-preliminaries.md` (l. 93, 175,
186), `02-lemmas.md` (l. 380, 391, 392) and `SOURCES.md` (D1\*–D4\*). Since the diffusion
content now lives in `03-q6-path-conditioning.md` and `05-q9-conservation-at-depth.md`,
these should be **repointed**, not merely flagged. `02-lemmas.md`'s Cor. 6.1 pointer
("used in Argument 2 there") is the tractability claim that §6.4's prescription depends
on (E7(b)).

**(d) `04-open.md`'s "Work not yet done" is stale in two entries** that the new files
supersede: "`03-diffusion.md` is **not written**. It depends on **Q5 and Q6** being
resolved" (both are marked CLOSED in the same file), and "No error analysis for the
mean-field step recursion (Q6)" (the route was abandoned, so there is no recursion left
— unless E5's missing bound is meant, in which case say so).

**(e) The Q7 status is three-ways inconsistent** across `04-open.md` §Q7, `04-open.md`
§Q9 and `README.md`; `SOURCES.md` D3\* is a fourth position. See E16(g).

### Suggested repair

Add a disposition table to `AUDIT-01.md` — as `README.md`'s Layout line already promises,
"Adversarial referee reports **and their dispositions**" — listing D1–D22 with
applied / deferred / rejected and the commit that applied each. Roughly ten of AUDIT-01's
findings were applied cleanly; the failures are concentrated in repairs assigned to a
*different file* from the one the defect was found in. That is precisely the class a
disposition table catches, and it is the class that recurred here (E9, E10, E14, E16(g)).

---

## Summary table

| # | Severity | Location | Defect |
|---|---|---|---|
| **E1** | **BLOCKING** | Q6, Prop. 6.3 proof | Conditioning severs the inter-step chain (removes randomness, not discreteness); "finite composition" is false; `∂ζ^{(t−1)}/∂ζ^{(t)} = 0`. `run_all.py` exempts the claim by restating it |
| E2 | MATERIAL | Q6, Prop. 6.4 | "Satisfies (D7.1) identically" is false with `𝒩` exogenous, vacuous with `𝒩` counted; the sink leaks `∏_t w^{(t)}`, which Q9 ignores entirely |
| E3 | MATERIAL | Q6, (6.1) | Conditional independence of `x̂_0` given `x` assumed, not implied by (A4)/D8 — a mean-field assumption inside the section abandoning mean-field |
| E4 | MATERIAL | Q6, Prop. 6.1 + Reading | `p_θ` is now arbitrary; the "bidirectional attention" reading is unsupported by the proof. (The withdrawn realisability claim was **correct** — construction supplied) |
| E5 | MATERIAL | Q6, Consequence note | "Error governed by total correlation" unproved and false: maximal `TC` with **zero** error exhibited |
| E6 | MATERIAL | Q6, Def. 6.2 / Prop. 6.3 | Differentiability asserted on a discrete domain; contradicts `01-preliminaries.md` D9 |
| E7 | MATERIAL | Q6, Prop. 6.3 | No contiguous "Lemmas 1–7"; "verbatim" imports four undischarged hypotheses (Cor. 6.1's four gaps in particular). Causality is **not** the problem |
| E8 | MATERIAL | Q6, Remark 6.5, (6.4) | Gumbel-max over `ζ` samples `x̂_0`, not `x^{(t−1)}`; the kernel term is omitted; `min` of a sum does not decompose additively |
| E9 | MATERIAL | Q6, lines 7–8; `run_all.py` | "All results Tier B" contradicted by Prop. 6.4's own Tier-D note; the one false claim is the one exempted from machine checking, justified by itself |
| E10 | MINOR | Q6 §6.4; D9 | Retraction announced only in `03`; `01-preliminaries.md` still asserts the refuted claim (retraction itself is **safe** — nothing depends on D9.1) |
| E11 | EDITORIAL | Q6, Prop. 6.1 | `π^{(t−1)}` vs `π^{(0)}`; correction spliced into the proof; kernel scope; section/result label collisions |
| **E12** | **BLOCKING** | Q9, Thm. 9.4 | z⁺-rule undefined project-wide and mis-cited to D7; `C` silently swapped; Lemma 9.0 proves the column-sum identity for the *other* matrix — **while `verify/` runs both as separate objects** |
| E13 | MATERIAL | Q9, Cor. 9.5 | Still no proof; `u`,`v`,`δ`,`η` undefined in-file; cites non-existent "Cor. 9.5(a)"; **the file's abstract still claims what §9.4 retracts**; (9.8)'s constant should be `η_ℓ/(1−η_ℓ)·φ` |
| E14 | MATERIAL | Q9, Lemma 9.0 | D7.2's bias dropped (column sums become `1 − b_j/z_j`) — untested by prose *and* by script; `z_j ≠ 0` a parenthetical the script calls "not a formality"; `θ_j` undefined at `z_j = 0` |
| E15 | MATERIAL | Q9, (9.9) | Wrong denominator for the prescribed rule (`\|z_j\|` vs `z_j⁺`, ~2300×, **against** the paper's interest); derived from the vacuous `n·max` form (~70× loose); scaling is `T²` not `T`; the new "empirical confirmation" confirms a tautology |
| E16 | MATERIAL | Q9, Cor. 9.6 | `ε` unbound (statement not truth-apt) and colliding with the stabiliser; `\|{u}\|` ambiguous; proof proves something else; `R^{(L)} ≥ 0` and `φ > 0` undischarged; Q7 four-ways inconsistent |
| E17 | MATERIAL | Q9, Prop. 9.1 blockquote | Answers Q9 **option 2**, labelled option 1 (twice); per-layer renormalisation ≡ terminal rescale; Lemma 5 invocation vacuous; Remark 9.2's table still unscoped |
| E18 | MATERIAL | Q9, Thm. 9.4 blockquote | Q1's `B` is the block-Jacobian norm; Thm. 9.4 bounds the relevance matrix. Q1 untouched, and the conflation erases the project's own L4-vs-L5 contrast |
| E19 | MINOR | Q9 §9.3–9.4 | Four unrepaired AUDIT-01 §D6 items now load-bearing: submultiplicativity unhypothesised; `B_k`/`B` and `E` collisions; `‖CΘ‖ ≤ 1` unchecked; (9.7)'s `Σ_ℓ η_ℓ` — the bound actually used — not derived from (9.5) |
| E20 | MINOR | Q9 §9.4–9.5 | `n = L·T` counts one LRP node per block (true `n ≈ 5L·T`); `T ≈ 16` is Tier C; "603 orders of magnitude" is harness-dependent |
| E21 | EDITORIAL | Q9 | §9.2 missing; 9.1 → 9.4 jump; split heading; `η`/`φ` bookkeeping |
| E22 | MATERIAL | cross-file | AUDIT-01 repairs unapplied where assigned: `04-open.md` Q2's factor-2; Lemma 6's "exactly as D7 states"; eight live `03-diffusion.md` refs; stale "Work not yet done"; Q7 status |

**2 BLOCKING, 13 MATERIAL, 4 MINOR, 3 EDITORIAL.**

---

## Verdicts

### `03-q6-path-conditioning.md`

| Result | Verdict | Note |
|---|---|---|
| **Prop. 6.1 — statement** | **SOUND** | Marginal transport genuinely is ill-defined |
| **Prop. 6.1 — proof (as repaired)** | **SOUND-WITH-REPAIR** | Verified numerically for `α_1 ∈ {0, 0.3, 0.9, 0.999}`; the `α_1 < 1` proviso is genuinely required and correctly stated. Needs the realisability claim reinstated (E4) and the label fixes (E11) |
| **(6.1) / (6.2) kernel factorisation** | **SOUND-WITH-REPAIR** | True under a factorised reverse draw; that hypothesis is smuggled, not derived (E3) |
| **"Consequence" — mean-field error ~ `TC`** | **UNSOUND** | Unproved, and false as a control: maximal `TC` with zero error (E5) |
| **Def. 6.2** | **SOUND-WITH-REPAIR** | A definition, but "differentiable function of the realised `x^{(t)}`" needs the embedding (E6) |
| **Prop. 6.3 — within-step scope** | **SOUND-WITH-REPAIR** | True once restricted to one step and once L1–L7's hypotheses are stated (E7). Causality is **not** an obstacle (§0.3(b)) |
| **Prop. 6.3 — proof, and the cross-step claim** | **UNSOUND** | "A finite composition of differentiable maps" is false; conditioning decouples the steps rather than composing them (E1) |
| **Prop. 6.4** | **UNSOUND as stated** | False with `𝒩` exogenous; a tautology with `𝒩` counted. Neither reading is the one printed (E2) |
| **Remark 6.5 / (6.4)** | **UNSOUND** | Wrong variable, missing kernel term, and a non-existent additive decomposition (E8) |
| **§6.4 "Path-conditioned attribution is Tier B"** | **UNSOUND** | Tier B within a step; the join — the whole diffusion-specific content — is Tier D by the file's own note (E1, E9) |
| **(D9.1) retraction** | **SOUND** | Verified that no result depends on D9.1; only the *placement* of the retraction is defective (E10) |

**Q6 overall: SOUND-WITH-REPAIR on the negative half, UNSOUND on the positive half.**
Q6 *as posed* — "is the marginal transport operator well-defined?" — is genuinely
**CLOSED**, with a correct proof and no goalpost movement; that is a real result. But
"the repair is not an approximation but a **change of object**" does not deliver what it
promises: the new object is well-defined only *within* a step, and the inter-step join it
needs is precisely the Tier D postulate Q6 was supposed to eliminate. The file should
claim what it proves.

### `05-q9-conservation-at-depth.md`

| Result | Verdict | Note |
|---|---|---|
| **Lemma 9.0** | **SOUND-WITH-REPAIR** | Correct for a bias-free layer with `z_j ≠ 0`; neither is a hypothesis, and it does not cover the `C` Thm. 9.4 needs (E14, E12) |
| **(9.1) `θ_j` identity** | **SOUND** | Verified for both signs; fails only at `z_j = 0`, where the whole factorisation is undefined |
| **Prop. 9.1(a)** | **SOUND-WITH-REPAIR** | (H) is now explicit and the signed-relevance failure is acknowledged. Residual: the (H) rescue routes through Cor. 9.6's undischarged `R^{(L)} ≥ 0` and an unstated `φ > 0` (E16(e)) |
| **Prop. 9.1(b)** | **SOUND** | Correct, and it is exactly the distortion bound Q9 option 2 asked for — with a good negative control |
| **Remark 9.2 (failure-mode table)** | **SOUND-WITH-REPAIR** | Correct under z⁺; still printed unscoped, three sections before z⁺ appears (E17) |
| **(9.4) `‖E_ℓ‖ = η_ℓ`** | **SOUND** | Confirmed, and norm-robust across `‖·‖₁, ‖·‖₂, ‖·‖_∞` |
| **(9.5) Lemma 4 application** | **SOUND-WITH-REPAIR** | Valid — `‖·‖_{1→1}` is submultiplicative and `‖C_ℓΘ_ℓ‖ ≤ 1` does hold — but three required steps are unwritten (E19) |
| **Thm. 9.4 — the abstract statement** | **SOUND** | `‖C‖_{1→1} = 1` for `C ≥ 0` with `1ᵀC = 1ᵀ`. Proof and equality case both correct. **This is the good result in the file** |
| **Thm. 9.4 — as applied to "the z⁺-rule, D7"** | **UNSOUND** | The rule is undefined, the citation is false, and the hypothesis is proved only for a different matrix — which `verify/` runs separately (E12) |
| **Directional caveat (`B > 1` ⇏ geometric)** | **SOUND** | A genuinely new and honest finding; the "603 orders" figure should be scoped to the harness (E20(c)) |
| **(9.7)** | **SOUND-WITH-REPAIR** | The `Σ_ℓ η_ℓ` form is true and is the bound that binds, but needs (L4.1) termwise rather than (L4.2) (E19(d)) |
| **Cor. 9.5** | **SOUND-WITH-REPAIR** | Hypothesis and disposition now correct; still unproved, with undefined symbols, a dangling "9.5(a)", and an abstract that contradicts it (E13) |
| **Cor. 9.6** | **UNSOUND as stated** | Unbound `ε`, ambiguous `\|{u}\|`, a proof of a different statement, undischarged `R^{(L)} ≥ 0` (E16) |
| **(9.9)** | **UNSOUND** | Wrong denominator, vacuous form, `T²` rather than `T` — and the new empirical check confirms the tautology, not the claim (E15) |
| **§9.6 "Net" prescription** | **SOUND-WITH-REPAIR** | The prescription (z⁺ + renormalisation) is right and survives every objection above **once z⁺ is defined**; several summary rows need scoping |

**Q9 overall: SOUND-WITH-REPAIR, and closer to delivering than the previous draft.**
Against the four options `04-open.md` Q9 listed:

| Option | Delivered? |
|---|---|
| 1. A rule with an **intrinsically** depth-uniform conservation defect | **No.** Prop. 9.1 is option 2, mislabelled twice (E17); Cor. 9.5 was the only candidate and the file now correctly declares it **not operative** |
| 2. Renormalisation restoring `ΣR = φ`, with a distortion bound | **Yes**, cleanly — Prop. 9.1(a)+(b), once scoped to z⁺ |
| 3. `z_j ≈ 0` rare enough that small `ε` is safe | **Explicitly left open** — correctly, and honestly |
| 4. A negative result | **Partially, and unclaimed** — Q11's disposition ("the z⁺-rule destroys its own mixing") *is* a small negative result, and the `B > 1 ⇏ geometric` finding is another |

So one of four is delivered, one is honestly left open, and one negative result is
produced without being claimed as such. The abstract's "Q9 **substantially resolved**" is
defensible for the aggregate and not for the allocation, and the abstract's own
"depth-uniform under a mixing hypothesis (Cor. 9.5)" clause is retracted by the body
(E13(d)).

**The genuinely new mathematics is Theorem 9.4**, and it is correct: non-negativity plus
unit column sums forces `‖C‖_{1→1} = 1`, collapsing Lemma 4's geometric factor for the
relevance product. It deserves to be stated for what it is, rather than as a dissolution
of Q1 (E18) or a resolution of option 1 (E17).

### Overall

**The verification infrastructure is now the strongest part of the project.** Both new
scripts exist, `run_all.py` reports 128 checks over seven files, and — decisively — the
suite contains real **negative controls** (M1–M5) that would fail if the claims were
wrong. Several checks independently reproduce findings I had made by hand: the `z_j → 0`
silent failure, the un-renormalised sum-zero violation (their `2509×` against my
`1ᵀ(u−v) → −0.350`), the `δ = 0` sparsity problem, and the `B > 1 ⇏ geometric` converse.
AUDIT-01 §D11 is repaired.

**The failures are almost entirely in the prose, and they follow four patterns:**

1. **An object is used before it is defined** — the z⁺-rule (E12), `u`/`v`/`δ`/`η`
   (E13), `p^{(t)}_j` (E8), "Cor. 9.5(a)" (E13(c)).
2. **A hypothesis that appears in a proof is not promoted to the statement** —
   `z_j ≠ 0` and bias-freeness (E14), `R^{(L)} ≥ 0` and `φ > 0` (E16), the factorised
   reverse draw (E3). AUDIT-01 §D12 named this class; it recurs four times.
3. **A result proved for object A is applied to object B** — `C` vs `C⁺` (E12), the
   Jacobian `B` vs the relevance `B` (E18), `ζ`-Gumbel vs the kernel draw (E8).
   AUDIT-01 §D1 and §D6 named this class.
4. **The prose and the machine check disagree** — three times (E12, E14(b), E1's
   exemption). This is AUDIT-01's most quotable finding recurring, with the roles
   unchanged: *the script is right and the prose has not caught up.*

Highest-value repairs, in order:

1. **Define the z⁺-rule in `01-preliminaries.md` and restate Lemma 9.0 for it.** This
   alone fixes E12, most of E14, and unlocks E15(i) — which *strengthens* §9.5 by roughly
   three orders of magnitude and turns the fidelity window from "probably empty" into
   "probably fine". It is the single most valuable change available.
2. **Add the `b_j ≠ 0` mutant** to `q9_renormalisation.py` (three lines, in the existing
   negative-control style) and the resample-`z` variant to the (9.9) check. The suite is
   good enough that both would have surfaced E14(a) and E15(iii) automatically.
3. **Split Prop. 6.3** into its true within-step content and the cross-step postulate it
   is not — and replace `run_all.py`'s exemption with a check that asserts
   `∂ζ^{(t−1)}/∂ζ^{(t)} = 0`, which is the fact E1 turns on.
4. **Update the abstract of `05-q9`** to match §9.4's own disposition of Cor. 9.5.

The single most important item is **E1**. The project's thesis is that on a
non-differentiable inter-step channel "relevance propagation is the only formalism that
exists at all". Prop. 6.3 is the result that is supposed to make that concrete for a
realised trajectory, and its proof asserts that conditioning produces a composition. It
does not — it produces `T` decoupled maps. Until the cross-step route is *constructed*
rather than postulated, the diffusion-specific half of the thesis rests on Prop. 6.4,
which the document itself marks Tier D.
