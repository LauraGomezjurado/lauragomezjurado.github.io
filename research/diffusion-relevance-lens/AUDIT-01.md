# AUDIT-01 — adversarial referee report on `02-lemmas.md`

Scope: `NOTATION.md`, `01-preliminaries.md`, `02-lemmas.md`, `README.md`, read in full.
Cross-checked against `SOURCES.md`, `04-open.md`, `sources/ali2022.md`, `verify/`.

Method: every algebraic step re-derived independently by hand before reading the
supplied proof; L1.1/L1.2 re-derived from scratch; numerical counterexamples
constructed for each disputed claim.

**Headline.** The algebra of Lemma 1 is correct — I confirm `(ε/σ²)x̂` exactly. Two
printed equations are false as written (§D2, and the attention application in §D1).
The heaviest structural problems are not algebra errors: they are (i) a category
mismatch between "gradient⊙input reproduces the output" and D7.1-conservation
(§D3), (ii) an unspecified product ordering in L4 that is *inconsistent with the
project's own composition convention* (§D6), and (iii) the fact that **no rule in
this document is proved to satisfy the antecedent of Lemma 5**, on which the README
thesis depends (§D9).

**Circularity: none found.** I traced every proof step in L1–L6 to D1, D2, D3, D6, D7
plus standard algebra. No Tier C or Tier D claim is used as a premise in any Tier B
proof. The `Dependency graph` at `02-lemmas.md:195-204` is accurate on this point.

---

## D1. The attention application of Lemma 2 is false — BLOCKING

**Severity:** BLOCKING (the stated conclusion is false; L2.1/L2.2 themselves are fine)
**Location:** `02-lemmas.md`, Lemma 2, "Application to attention"

### The defect

> "By D3, `(P_attn, V) ↦ C` is bilinear, and `P_attn` depends on the same layer input
> as `V` through `Q, K`. Hence gradient⊙input attribution through an attention head
> **over-attributes by a factor 2** relative to the head output"

The word "Hence" does not go through, and the conclusion is false. L2.1 is a statement
about `f(u,v)` where `u` and `v` are the *free variables being differentiated*. An
attributor differentiates with respect to `X`, not with respect to `(P_attn, V)`. The
composite `X ↦ softmax(XW_Q W_Kᵀ Xᵀ/√d_h)·XW_V` is **not bilinear in `X`**, and the
`P_attn` branch is not degree-1 homogeneous in `X`, so Euler's identity — which is all
L2.1 is — does not apply to it.

Concretely, splitting `Σ_{i,a} X_{ia} ∂φ/∂X_{ia}` by branch, with `g = ∂φ/∂C`:

- **V branch:** `V = XW_V` is degree-1 homogeneous, so this branch contributes exactly
  `⟨g, P_attn V⟩ = φ`. ✓ (This is the part that is true.)
- **QK branch:** `S` is degree-**2** homogeneous in `X` and `softmax` is *not*
  homogeneous, so this branch contributes
  `2 Σ_r Cov_{p_r}(S_r, G_r)` where `G = g Vᵀ` — a covariance, **not** `φ`.

So the total is `φ + 2Σ_r Cov_{p_r}(S_r, G_r)`, which is `2φ` only by coincidence.

### Substantiation (three independent ways)

1. **Clean counterexample, `N = 1`.** With a single position, `P_attn ≡ [1]` identically,
   independent of `X`; the QK branch contributes exactly zero. Gradient⊙input through
   the head is then `C` *exactly*, not `2C`. Measured ratio: **1.000000**.
2. **The project's own machine check already refutes it.** `verify/lemma2_bilinear.py`
   runs this at "Level (B): variables = X" and records
   `L2.1(attn/X): REPORTED DISCREPANCY: at the X level grad-input is NOT 2C
   (ratio 2.2465, deviation 0.2862)`. The test *asserts that the deviation is real* and
   passes. **The prose in `02-lemmas.md` and the machine check in `verify/` state
   opposite things.**
3. **The ratio is not even bounded by 2.** The same script's temperature sweep gives
   X-level ratios of `1.000000 (τ=0), 1.1656 (τ=0.1), 2.2465 (τ=1), 1.6690 (τ=3),
   1.4706 (τ=10)`. It exceeds 2 and is non-monotone, so "over-attributes by a factor 2"
   is wrong as an equality, as an upper bound, and as an asymptotic.

### Secondary defects in the same paragraph

- "(L2.1) is the *conservation* statement." `P_attn` and `V` are two intermediate
  tensors of the *same* layer, not two consecutive layers. D7.1 is a layer-to-layer sum
  equality. Calling `2f` a "conservation statement" is the same category error as §D3.
- "It is ... **stronger than** the common informal argument that the softmax Jacobian is
  ill-conditioned." Unsupported. The two statements concern different objects and
  neither implies the other. (MINOR.)

### Suggested repair

Keep L2.1/L2.2 as pure statements about a bilinear `f` in its own two arguments. Replace
the application paragraph with the two claims that are actually provable:

> **(i)** If gradient⊙input relevance is assigned to `P_attn` and `V` *as units* — which
> is what an LRP rule applied at the `(P_attn, V) ↦ C` node does — the two branches sum
> to `2C`, so exactly one branch must be detached. (This is L2.1, and is what
> `verify/lemma2_bilinear.py` Level (A) confirms.)
> **(ii)** At the layer input `X`, gradient⊙input through the head equals
> `φ + 2Σ_r Cov_{p_r}(S_r, G_r)`; the excess term is *not* equal to `φ`, is not
> sign-definite, and is not bounded by `φ`. Under (p-detach) the head becomes degree-1
> homogeneous in `X` and gradient⊙input equals `φ` exactly.

Note (ii) is a *stronger* motivation for p-detach than the factor-2 story — the error is
uncontrolled rather than a known constant one could divide out. `04-open.md` Q2
("By Lemma 2, failing to detach the softmax over-attributes the head by a factor 2")
inherits this defect and must be restated.

---

## D2. Equation (L6.1) as printed is false — the RHS is identically 0 — BLOCKING

**Severity:** BLOCKING as written (trivially repairable, and the content survives)
**Location:** `02-lemmas.md`, Lemma 6

### The defect

> `R_i = a_i · Σ_j w_{ij} g_j = a_i · ∂/∂a_i ( Σ_j g_j z_j )` (L6.1)
> "The bracketed expression is exactly `∂(Σ_j g_j z_j)/∂a_i`."

With `g_j := R_j/z_j`, the functional `Σ_j g_j z_j = Σ_j R_j` is a **constant** in `a`.
Its gradient is therefore **identically zero**, not `Σ_j w_{ij} g_j`. Symbolic check
(`w = [[2,3],[5,7]]`, `R = (11,13)`):

```
sum_j g_j z_j simplifies to: 24        (a constant => gradient is 0)
d/da0 (sum_j g_j z_j)      = 0
but sum_j w_0j g_j         = (144*a0 + 349*a1)/((2*a0+5*a1)*(3*a0+7*a1))
```

The two sides of the second equality in (L6.1) differ for every `a`. The first equality
in (L6.1) is correct.

### Suggested repair

`sg` is already defined in NOTATION and D6; use it.

> `R_i = a_i · Σ_j w_{ij} g_j = a_i · ∂/∂a_i ( Σ_j sg(g_j) z_j )`,
> where the coefficients `g_j` are held fixed (detached) during the differentiation.

Add the missing hypothesis to the statement, not the parenthetical: **`z_j ≠ 0` for all
`j`** (see §D12).

---

## D3. L1.3/L1.4 do not establish D7.1-conservation; the bridge is missing — MATERIAL

**Severity:** MATERIAL
**Location:** `02-lemmas.md`, Lemma 1(c) heading and 1(d) Consequence

### The defect

The heading reads **"(1c) σ-detach restores exact conservation"** and the Consequence
states "detaching the variance alone **is conservative**". But what is proved is
`(∂̃x̂/∂x) x = x̂` — a statement that the input×Jacobian product reproduces the output
*vector*. D7.1 is a different statement: `Σ_u R_u^(ℓ) = Σ_v R_v^(ℓ+1)`, a scalar sum
equality between two layers, relative to a scalar functional `φ` and an attribution
scheme. Nothing in `02-lemmas.md` connects them.

`04-open.md` Q5 concedes exactly this ("Lemmas 1.3/1.4 prove something formally
different... Until it is, L1.3/L1.4 should be read as statements about gradient⊙input,
**not** as establishing D7.1-conservation"). **`02-lemmas.md` has not been updated to
match, and continues to assert the conclusion Q5 withdraws.** An internal contradiction
between two files of the same document is itself a defect.

### The bridge does exist — but it needs three stated hypotheses

For the record, here is the missing lemma. It is provable, so this is a repair, not a refutation:

> **Bridging Lemma.** Let layer `ℓ+1 = f(ℓ)` with Jacobian `J = ∂f/∂x`, let `φ` be a
> scalar functional, and define relevance at *both* layers by gradient⊙input:
> `R_i^(ℓ) := x_i ∂φ/∂x_i` and `R_k^(ℓ+1) := f_k(x) ∂φ/∂f_k`. Write `g := ∇_f φ`. Then by
> the chain rule `Σ_i R_i^(ℓ) = gᵀ(Jx)` and `Σ_k R_k^(ℓ+1) = gᵀ f(x)`. Hence:
> **(a)** if `Jx = f(x)` then D7.1 holds *for every* `g` — i.e. `Jx = f(x)` is
> **sufficient**;
> **(b)** conversely D7.1 for a *single* given `g` only requires `gᵀ(Jx − f(x)) = 0`, so
> `Jx = f(x)` is **not necessary**.

Both hypotheses in (a) are silent in the current text: that relevance is *defined* as
gradient⊙input at both layers (D7 offers three different schemes), and that the claim
is sufficiency for all `g`, not equivalence.

The asymmetry in (b) also sharpens L1.4 — see §D20.

### Suggested repair

1. Insert the Bridging Lemma above as **Lemma 0** (it is prior to L1) and state its two
   hypotheses.
2. Retitle **(1c)** to "σ-detach makes the normaliser degree-1 homogeneous" and state the
   corollary as "hence, *under gradient⊙input relevance at both layers*, D7.1 holds for
   every downstream `g`."
3. Reconcile with `04-open.md` Q5, which should then be closed rather than left open.

---

## D4. Lemma 1 is stated for `x̂`, not for LayerNorm; `β` breaks (L1.3) — MATERIAL

**Severity:** MATERIAL
**Location:** `02-lemmas.md`, Lemma 1 title and (1c); `01-preliminaries.md` D2.1

### The defect

The lemma is titled "**LayerNorm** Jacobian and its gradient⊙input action", but D2.1
defines `LN(x) = γ ⊙ x̂ + β`, and every part of Lemma 1 is about `x̂` alone. The gap is
not cosmetic:

    ∂LN/∂x = diag(γ) · (∂x̂/∂x)

so under (σ-detach),

    (∂̃LN/∂x) x = γ ⊙ x̂ = LN(x) − β

The layer's *output* is `LN(x)`, not `LN(x) − β`. So (L1.3)'s "exactly — the layer's own
output" is false for the layer D2.1 actually defines, whenever `β ≠ 0`. The discrepancy
is exactly `β`, i.e. gradient⊙input assigns zero relevance to the bias — the classic LRP
bias-absorption problem, which D7's own "General principle" implicitly acknowledges
(the z-rule numerator `Σ_i a_i w_{ij} = z_j − b_j` does not sum to the denominator `z_j`).

`γ` is harmless (it rescales but does not break the identity, since `γ⊙x̂` *is* the
output of the γ-part). `β` is not.

This is invisible in the modelled implementation — `sources/ali2022.md` §1b, third
deviation flag, and SOURCES A2.7 record that Ali et al.'s `'nowb'` LayerNorm applies no
affine at all — but the project defines LN *with* the affine in D2.1, so the gap is
internal to this document.

### Suggested repair

Either (a) restate Lemma 1 as "Lemma 1 — **Normaliser** Jacobian", define
`x̂ : ℝ^d → ℝ^d` as the object of study, and add a corollary handling `γ, β` explicitly:
`(∂̃LN/∂x)x = LN(x) − β`, with the remark that exact conservation requires either
`β = 0` or a bias-absorption convention; or (b) set `β = 0` as a standing hypothesis of
Lemma 1 and say so, citing A2.7 as the justification for the modelling choice.

---

## D5. L3(d)'s prose reading is backwards; the bound is vacuous exactly where it is invoked — MATERIAL

**Severity:** MATERIAL (the inequality (d) is true; the interpretation is unsupported)
**Location:** `02-lemmas.md`, Lemma 3, paragraph following the proof

### The defect

> "(d) formalises the folklore 'peaked attention ⇒ small/ill-conditioned Jacobian':
> `max_i p_i → 1` bounds the spectrum from above"

As attention peaks, `max_i p_i → 1`, so the bound `‖J‖₂ ≤ max_i p_i` tends to **1** —
the weakest possible non-trivial bound. It does not formalise "small"; it degrades to
uselessness in precisely the regime the sentence invokes. Measured, with
`p = (1−δ, δ/(n−1), …)`, `n = 8`:

| `δ` | true `‖J‖₂` | L3(d) bound `max p_i` | looseness |
|---|---|---|---|
| 0.5 | 2.857e−01 | 0.5000 | 1.75× |
| 1e−1 | 1.029e−01 | 0.9000 | 8.75× |
| 1e−2 | 1.131e−02 | 0.9900 | 87.5× |
| 1e−4 | 1.143e−04 | 0.9999 | 8750× |

The looseness diverges as `δ → 0`. Worse, `‖J‖₂ ≤ 1/2` always (see repair), so **(d) is
strictly weaker than a trivial constant bound whenever `max_i p_i > 1/2`** — i.e. for
every peaked attention pattern.

### Suggested repair

Replace (d) with the Gershgorin bound, which does formalise the folklore. Row `i` of
`J = diag(p) − ppᵀ` has diagonal `p_i(1−p_i)` and off-diagonal radius
`Σ_{j≠i} p_i p_j = p_i(1−p_i)`, so every eigenvalue lies in `[0, 2p_i(1−p_i)]`:

    (d')  ‖J‖₂ ≤ 2·max_i p_i(1 − p_i) ≤ 1/2

Now `max_i p_i → 1 ⇒ ‖J‖₂ → 0`, which *is* the folklore claim, and (d') recovers the
tabulated true values to within 1.75×. Note (d') also makes (a) and (c) redundant for the
"always singular" point but they should be kept as they are exact.

Also note the internal tension the corrected bound creates: `‖J‖₂ ≤ 1/2` means the
softmax branch is a *contraction*, which sits awkwardly with Lemma 4's concern about
`B > 1`. Worth a sentence.

---

## D6. (L4.1)'s product ordering is unspecified and contradicts the NOTATION convention — MATERIAL

**Severity:** MATERIAL
**Location:** `02-lemmas.md`, Lemma 4; `NOTATION.md`, "Jacobian convention"

### The defect

(L4.1) writes `∏_{k=1}^{n} A_k`, `∏_{m<k} B_m`, `∏_{m>k} A_m` without ever saying in
which order the factors are multiplied. Matrices do not commute, so this is not a
notational nicety — the identity is true for one reading and false for the other.

The proof's own worked case fixes the intended reading as **index-increasing**:

> "For `n = 2`: `A₁A₂ − B₁B₂ = (A₁−B₁)A₂ + B₁(A₂−B₂)`, matching."

But `NOTATION.md:45-49` fixes composition in the **index-decreasing** direction:

> `∂h_L/∂h_ℓ = (∂h_L/∂h_{L-1}) (∂h_{L-1}/∂h_{L-2}) ⋯ (∂h_{ℓ+1}/∂h_ℓ)`

and the "Reading" paragraph then applies L4 to exactly those objects: "With `n = L − ℓ`
composed block Jacobians". A reader who substitutes `A_k := J_{ℓ+k−1→ℓ+k}` and composes
per NOTATION gets `A_n ⋯ A_1`, for which the stated RHS is simply wrong. Verified
numerically on random 3×3 matrices, `n = 2`:

```
increasing-order product: ||LHS - RHS_as_written|| = 4.44e-16   (identity holds)
decreasing-order product: ||LHS - RHS_as_written|| = 3.68e+00   (identity FAILS)
```

For the decreasing order the correct identity is `A₂A₁ − B₂B₁ = E₂A₁ + B₂E₁` — the `E`
of *higher* index moves left, i.e. the roles of the `A`-block and `B`-block swap sides.

### Suggested repair

State the convention in the lemma: "throughout, `∏_{k=1}^{n} M_k := M_1 M_2 ⋯ M_n`
(index-increasing)", and in the Reading either (a) relabel `A_k := J_{L−k → L−k+1}` so the
increasing product matches NOTATION's composition, or (b) state the decreasing-order
variant of (L4.1) explicitly. (L4.2) is unaffected — the norm bound is order-agnostic.

### Also missing from L4's hypotheses (MINOR)

- The proof invokes "submultiplicativity" but the statement never requires `‖·‖` to be a
  submultiplicative (e.g. operator) norm. `NOTATION.md` never defines `‖·‖` at all.
  (L4.2) is false for e.g. the entrywise max norm.
- **Symbol collision:** `B_k` are matrices and `B` is the scalar bound, in the same
  displayed line. Rename the bound to `β` or `M`.
- "(L4.1) is the standard telescoping identity; verify by induction on `n`" — the
  induction is asserted, not written. I verified it is correct (set
  `U_k := B_1⋯B_{k−1}A_k⋯A_n`; then the `k`-th summand is `U_k − U_{k+1}` and the sum
  telescopes to `U_1 − U_{n+1} = ∏A − ∏B`), but under the project's own self-containment
  rule the two-line proof should be printed rather than delegated to the reader.

I confirm the constant `n·B^{n−1}·e` in (L4.2) is correct and is attained termwise:
`‖B_1⋯B_{k−1}‖·‖E_k‖·‖A_{k+1}⋯A_n‖ ≤ B^{k−1}·e·B^{n−k} = e·B^{n−1}` for each of the `n`
terms.

---

## D7. L4's "Reading" does not describe the estimator defined in D5 — MATERIAL

**Severity:** MATERIAL (overclaim / non-sequitur)
**Location:** `02-lemmas.md`, Lemma 4, "Reading"

### The defect

> "With `n = L − ℓ` composed block Jacobians, the bound is **linear in depth when
> `B ≈ 1` and exponential when `B > 1`.**"

L4 bounds the error of a product of *per-factor estimates* `B_k ≈ A_k`. The J-lens
estimator this project actually defines does no such thing. Per D5.1, `J̄_ℓ` is an
average over prompts of the **exact** end-to-end derivative
`∂h_final^(n)[p'] / ∂h_ℓ^(n)[p]`, and SOURCES A1.3 confirms it is computed by "exact
`torch.autograd.grad`". There is no per-block estimation step anywhere, hence no product
of `E_k`'s, hence L4's bound does not apply to it.

The error that *is* present in D5.1 is the across-prompt averaging error (plus the
unweighted-mean wrinkle recorded in A1.7), which is a variance problem, not a
compounding-product problem. L4 says nothing about it.

Since `03-diffusion.md` is unwritten, L4 currently has **no established consumer** in the
project, while the README thesis leans on the "Jacobian view degrades with depth"
half of the L4-vs-L5 contrast.

### Suggested repair

Either (a) add the missing premise explicitly — "*if* a lens estimates each block
Jacobian separately and composes them, then …" — and note that D5's estimator is not of
this form, so L4 applies to a hypothetical rather than to the J-lens; or (b) prove the
result the contrast actually needs, namely a depth-dependence bound for
`‖J̄_ℓ − E[J_ℓ]‖` under D5.1's averaging.

---

## D8. Corollary 6.1 does not follow from Lemma 6 — MATERIAL

**Severity:** MATERIAL
**Location:** `02-lemmas.md`, Corollary 6.1

### The defect

> "If every nonlinearity in the graph is detached, the graph is linear with fixed
> coefficients, so **by (L6.1)** the entire relevance assignment is computed by **one
> backward pass**"

Four separate gaps:

1. **Linear vs affine.** Detaching every nonlinearity yields an **affine** graph, not a
   linear one: LayerNorm's `β` (D2.1) and the linear layers' biases survive detachment.
   Lemma 6 explicitly assumes "a linear layer `z_j = Σ_i a_i w_{ij}` (**no bias**)", and
   the assumption is load-bearing: with `b_j ≠ 0` the z-rule (D7.2) gives
   `Σ_i R_i = Σ_j R_j (1 − b_j/z_j) ≠ Σ_j R_j`. Corollary 6.1 silently drops the
   hypothesis its own lemma required.
2. **No induction from one layer to the whole graph.** L6 is a *single-layer* statement.
   For the corollary one needs: *if* `R^(ℓ+1)_j = z_j ∂φ/∂z_j` (gradient⊙input form) at
   layer `ℓ+1`, *then* the z-rule output at layer `ℓ` is again of that form. That
   induction — which is the actual content of "one backward pass computes all layers
   simultaneously" — is never performed. It is provable in the strictly-linear case, but
   it must be written.
3. **The modelled implementation does the opposite.** SOURCES A2.4 and
   `sources/ali2022.md` §4 record that Ali et al. sever the graph at every block boundary
   (`.data` + `requires_grad_(True)`) and run **one `backward()` per block** in a loop
   (`R_.sum().backward()`, `xai_transformer.py:367-374`) — `L` backward passes, not one.
   That the mathematics permits one pass while the reference implementation uses `L` is
   a claim requiring an argument (the reconciliation is that severing is unnecessary once
   the graph is genuinely linear), and no such argument appears.
4. **Undefined cost model.** "the same cost as one gradient" and "No `d×d` matrix need be
   materialised" appeal to reverse-mode AD's cost properties. Nothing in
   `01-preliminaries.md` defines a computation model. Under the self-containment rule
   ("Every definition used in a proof is stated explicitly in `01-preliminaries.md`")
   this is an unstated premise. It is also the *load-bearing* claim — the corollary is
   cited as "what makes the diffusion construction tractable".

### Suggested repair

State the corollary with its real hypotheses:

> **Corollary 6.1.** Suppose (i) every nonlinearity is detached, (ii) every affine layer
> is bias-free (or biases are absorbed by a stated convention), and (iii) relevance at
> the output layer is seeded as `R^(L)_v = h^(L)_v ∂φ/∂h^(L)_v`. Then by induction on
> `ℓ`, using L6.1 at each layer, `R^(ℓ)_u = h^(ℓ)_u ∂φ/∂h^(ℓ)_u` for every `ℓ`, so all
> layers' relevances are read off from a single reverse-mode pass.

and prove the induction. Add a remark reconciling this with A2.4's per-block loop.

---

## D9. Lemma 5's antecedent is never established, and the ε-rule violates it geometrically in depth — MATERIAL

**Severity:** MATERIAL
**Location:** `02-lemmas.md`, Lemma 5 "Reading"; `README.md` thesis; `01-preliminaries.md` D7

### The defect

Lemma 5 is a correct one-line conditional. But:

**(a) Nothing in this document discharges its hypothesis.** No rule is proved to satisfy
D7.1 "at every layer". The candidates all fail or are unproven: L1.3 does not establish
D7.1 (§D3) and fails on `β` (§D4); L2's application is false (§D1); L6 covers one layer
and only without bias (§D8). So the "precise contrast with Lemma 4" currently contrasts a
bound against an *unfulfilled* conditional.

**(b) The ε-rule — the rule real LRP uses — explicitly does not satisfy D7.1, and its
leak compounds geometrically with depth.** Under the ε-rule,
`Σ_i R_i = Σ_j θ_j R_j` with `θ_j = |z_j|/(|z_j| + ε) < 1`. For non-negative relevance
this is a per-layer contraction, so over `D` layers the aggregate is multiplied by a
factor between `θ_min^D` and `θ_max^D` — **geometric decay in depth**, precisely the
failure mode the Reading calls "structurally absent":

| `ε` | `\|z\|` | `θ` | after `D=24` | after `D=240` |
|---|---|---|---|---|
| 1e−6 | 1e−3 | 0.999001 | ×0.976 | ×0.787 |
| 1e−2 | 1.0 | 0.990099 | ×0.788 | — |

`D = L·T` is exactly the depth the README thesis invokes ("survives depth `L·T`"), and
at `L·T` in the hundreds the leak is not negligible. The claim

> "the *total* relevance is exactly invariant, with **no dependence on depth whatsoever**"

is therefore true only for an exactly-conservative rule, and the document never commits
to one. The "Honest scope" note disclaims the *allocation* error but not this.

### Suggested repair

1. Add to the Reading: "This is conditional on exact conservation at every layer. Under
   the ε-rule of D7 the hypothesis fails and the aggregate contracts by
   `∏_ℓ θ^(ℓ)`, which is geometric in depth; the depth-independence claim applies only to
   the z-rule (or z⁺) with bias absorption."
2. State explicitly which rule the project commits to, and prove D7.1 for it — this is
   the missing keystone of the whole argument.
3. `README.md`'s "(b) survives depth `L·T`" should be qualified accordingly until (2) is
   done.

---

## D10. D7's ε-rule inequality is false for signed relevance — MATERIAL

**Severity:** MATERIAL
**Location:** `01-preliminaries.md`, D7

### The defect

> "**ε-rule:** denominator `+ ε·sign(·)`; conservation weakens to `Σ_i R_i ≤ Σ_j R_j`."

Two problems.

First, **this is a claim, not a definition**, sitting in a file whose opening line is
"Everything in this file is a **definition**. Definitions carry no truth value". It is
unproved and is not derivable from anything stated.

Second, **it is false.** `Σ_i R_i = Σ_j θ_j R_j` with `θ_j = |z_j|/(|z_j|+ε) ∈ [0,1)`.
Each term is contracted *toward zero*, which increases a negative term. Counterexample
(one output unit, `z = 1`, `ε = 1`, `R_j = −1`):

```
sum_i R_i = -0.5000,  sum_j R_j = -1.0000
claim 'sum_i R_i <= sum_j R_j' holds?  False
```

This is not an edge case: `04-open.md` Q7 is built on the observation that "z-rule
relevance is **not** sign-definite", so the document already knows negative relevances
are the normal case. Q7 and D7 are inconsistent.

### Suggested repair

> **ε-rule:** denominator `+ ε·sign(z_j)`. Conservation is replaced by a per-unit
> contraction toward zero: `Σ_i R_i = Σ_j θ_j R_j` with `θ_j = |z_j|/(|z_j|+ε) ∈ [0,1)`.
> Hence `|Σ_i R_i| ≤ Σ_j |R_j|`, and `Σ_i R_i ≤ Σ_j R_j` **only if every `R_j ≥ 0`**.

and mark it as a lemma (it is one line) rather than leaving it in the definitions file.

---

## D11. The Tier B verification claims are false as stated — MATERIAL

**Severity:** MATERIAL (provenance, not mathematics)
**Location:** `02-lemmas.md:3-4`; `SOURCES.md` Tier B table; `README.md` "Reproducing"

### The defect

`README.md` defines Tier B as "**Proof in `02-lemmas.md` + machine check in `verify/`**",
and `02-lemmas.md:3-4` asserts "All results are **Tier B**: proved here ... and
**machine-checked in `verify/`**".

`verify/` contains exactly two files: `lemma1_layernorm.py`, `lemma2_bilinear.py`.
The `SOURCES.md` Tier B table cites three scripts that **do not exist**:

| Ref | Cited machine check | Exists? |
|---|---|---|
| B5 | `verify/lemma3_softmax.py` | **no** |
| B6 | `verify/lemma4_telescoping.py` | **no** |
| B8 | `verify/lemma6_lrp_gradinput.py` | **no** |

`README.md`'s reproduction instruction `python3 verify/run_all.py` also names a file that
does not exist. So L3, L4, L5, L6 and Cor 6.1 do not currently meet the project's own
Tier B bar, and the provenance ledger states verifications that were never performed —
in a document whose central discipline is that provenance claims be exact.

(For what it is worth: I ran both existing scripts. `lemma1_layernorm.py` → OVERALL PASS,
`lemma2_bilinear.py` → OVERALL PASS. L1's algebra is genuinely verified.)

### Suggested repair

Write the three missing scripts and `run_all.py`, or downgrade B5–B8 in `SOURCES.md` to
"proof only, machine check pending" and amend `02-lemmas.md:3-4` to say which results are
machine-checked. Note that a `lemma3_softmax.py` written today would **fail** the prose
reading of (d) (§D5) and a `lemma6` script would **fail** (L6.1) as printed (§D2) —
which is an argument for writing them first.

---

## D12. `z_j ≠ 0` is a parenthetical, not a hypothesis — MINOR

**Severity:** MINOR
**Location:** `02-lemmas.md`, Lemma 6

> "set `g_j := R_j / z_j` for `z_j ≠ 0`"

The condition is mentioned but never elevated to a hypothesis of the lemma, and the
lemma says nothing about what happens when it fails. This is not a measure-zero
technicality to be waved through: `z_j = 0` is common in practice (any zeroed unit), and
avoiding it is the entire motivation for the ε-rule that D7 defines two lines earlier.
`sources/ali2022.md` §3b confirms the modelled implementation has **no** stabiliser
("**NO EPSILON STABILIZER** ... If any element of `zp` is exactly zero the ratio is
`inf`/`nan`"), so the degenerate case is live in the system being modelled.

**Repair.** Add to the statement: "Assume `z_j ≠ 0` for every `j`. (Where this fails the
z-rule is undefined; the ε-rule of D7 replaces it, at the cost of §D10.)"

---

## D13. Lemma 3 proof hygiene — MINOR

**Severity:** MINOR
**Location:** `02-lemmas.md`, Lemma 3

Three small things, all repairable in place:

1. **`J_softmax = diag(p) − ppᵀ` is asserted, not derived.** It is one line
   (`∂p_k/∂z_i = p_k(δ_{ki} − p_i)`), and the self-containment rule calls for it. Worth
   also noting the result is symmetric, so no transpose ambiguity arises under the
   NOTATION row=output convention — that is a genuine convention check that passes.
2. **(b) claims `J ⪰ 0` but proves only `zᵀJz ≥ 0` for the specific `z`.** Positive
   semidefiniteness is a statement about *all* vectors. The same algebra works verbatim
   for arbitrary `y` (`yᵀJy = Var_p(y) ≥ 0`), so the repair is to write "for any
   `y ∈ ℝ^n`" and reserve `z` for the softmax pre-activations. This matters because (d)
   then legitimately uses `‖J‖₂ = max_{‖y‖=1} yᵀJy`, which requires the quantifier.
3. `p_i > 0` for all `i` (true for softmax of any finite `z`) is used implicitly and can
   be stated in one clause.

---

## D14. `NOTATION.md`'s definition of "conservative" is not D7.1 and pre-assumes Lemma 5 — MINOR

**Severity:** MINOR
**Location:** `NOTATION.md:66-75` vs `01-preliminaries.md` D7.1

`NOTATION.md` says the scheme is conservative if `Σ_u R_u^(ℓ) = Σ_v R_v^(ℓ+1)` "**with
the common value equal to the scalar output functional being explained**". D7.1 states
only the layer-to-layer equality. The extra clause is exactly the conclusion of Lemma 5,
so under the NOTATION definition Lemma 5 is definitionally vacuous, while under D7.1 it
has content.

This also violates the project's own self-containment rule, which says every definition
used in a proof is stated in `01-preliminaries.md` — here it is stated twice, in two
files, with different content.

**Repair.** Delete the extra clause from `NOTATION.md` and point to D7.1 as the single
definition; the "common value = `φ`" statement is Lemma 5's conclusion, given a seed.

---

## D15. Two broken lemma cross-references in `NOTATION.md`, one of which contradicts the lemma it cites — MINOR

**Severity:** MINOR (the first is arguably MATERIAL — it is an overclaim)
**Location:** `NOTATION.md:75` and `NOTATION.md:81`

1. > "**Lemma 4** (`02-lemmas.md`) shows it converts multiplicative error growth into
   > additive."

   Wrong lemma — L4 is the multiplicative-growth bound; the conservation result is
   **L5**. More seriously, the claim itself is one that L5 explicitly refuses to make:
   > "(L5.1) does *not* say allocation error is small, **nor that it grows only
   > additively**."

   So `NOTATION.md` asserts precisely what L5's "Honest scope" disclaims. Given that this
   sentence is the one-line summary a reader meets first, it is the most quotable
   overclaim in the document.

2. > "Under a detached-nonlinearity graph they coincide with gradient⊙input (**Lemma 3**)."

   Wrong lemma — Lemma 3 is the softmax Jacobian; the gradient⊙input coincidence is
   **Lemma 6**.

**Repair.** Fix both references; rewrite (1) as "Lemma 5 shows that the *aggregate*
relevance is exactly depth-independent, in contrast to the depth-growing bound of
Lemma 4. It makes no claim about allocation error."

---

## D16. Remark D2.a understates the effect of the code's normaliser, and contradicts Q4 — MINOR

**Severity:** MINOR
**Location:** `01-preliminaries.md` Remark D2.a; `SOURCES.md` A2.5 note; `04-open.md` Q4

> "the deviation changes **constants**, not the structure of the results"

I redid the algebra under the code's convention. With `s := ‖c‖/√d` and
`x̂ = c/(s+ε)` (per `sources/ali2022.md` §1b, `input_norm = (input - mean)/(std + eps)`):

    ∂s/∂x = cᵀ/(d s)
    (∂x̂/∂x) x = c/(s+ε) − c‖c‖²/((s+ε)² d s) = c[(s+ε) − s]/(s+ε)²
              = (ε/(s+ε)) · x̂

So the prefactor is **`ε/σ`, not `ε/σ²`** — a changed *exponent*, not a changed constant.
Separately, `torch.Tensor.std` defaults to `unbiased=True` (A2.5, §1b second deviation
flag), so `‖c‖² = (d−1)s²` and the `1/d` in (L1.1) becomes `1/(d−1)`.

`SOURCES.md` repeats the understatement ("Under the code's convention the constant in
(L1.2) changes"), while `04-open.md` Q4 lists the same question as **open** ("Expected
outcome: the `(ε/σ²)` prefactor changes form... **Not yet done.**"). Three files, three
positions.

**Repair.** Replace D2.a's clause with "the deviation changes the exponent of the
prefactor (`ε/σ²` becomes `ε/(s+ε)`) and the `1/d` factor (to `1/(d−1)`); the
qualitative conclusion — nonzero for `ε > 0`, vanishing as `ε → 0` — survives." That also
closes Q4, since the derivation above is four lines and needs no external source.

---

## D17. The "Correction of record" is mathematically right but its significance claim is unquantified — MINOR

**Severity:** MINOR
**Location:** `02-lemmas.md`, Lemma 1(b), blockquote

**First, the confirmation the audit was asked for.** I re-derived (L1.1) and (L1.2)
independently, from `x̂ = c/σ`, before reading the supplied proofs:

- `2σ ∂σ/∂x = (2/d)cᵀP = (2/d)cᵀ` (using `Pᵀc = Pc = c`) ⇒ `∂σ/∂x = cᵀ/(dσ)`. ✓
- quotient rule ⇒ `(1/σ)P − ccᵀ/(dσ³)`, and `ccᵀ/σ² = x̂x̂ᵀ` gives
  `(1/σ)(P − (1/d)x̂x̂ᵀ)`. ✓ **(L1.1) is correct.**
- `x̂ᵀx = cᵀx/σ = ‖c‖²/σ` (since `cᵀ1 = 0`); the `1/d` factor and the substitution
  `‖c‖² = d(σ²−ε)` combine to `(1/d)x̂(x̂ᵀx) = x̂(σ²−ε)/σ`; hence
  `(∂x̂/∂x)x = x̂[1 − (σ²−ε)/σ²] = (ε/σ²)x̂`. ✓ **(L1.2) is correct exactly as stated.**
- Sanity checks pass: `(∂x̂/∂x)1 = 0` (shift invariance, since `P1 = 0` and `x̂ᵀ1 = 0`),
  and the `μ1` component of `x` contributes nothing, consistent with (L1.2).

**The defect** is in the surrounding claim:

> "This matters in one regime: when `σ` is small — which is precisely the
> small-activation regime — `ε/σ²` need not be negligible."

Since `σ² = ε + ‖c‖²/d`, we have `ε/σ² = 1/(1 + rms²/ε)` where `rms² := ‖c‖²/d`. So
`ε/σ²` is non-negligible **only when `rms ≲ √ε`**. The modelled implementation uses
`config.layer_norm_eps = 1e-12` (`sources/ali2022.md` §1b), i.e. `√ε = 1e−6`: at a
centred-activation RMS of `1e−2` — already very small — `ε/σ² ≈ 1e−8`. The project's own
check runs at `ε = 1e-5` and needs `s ≲ 1e−3` before the ratio approaches 1
(`verify/lemma1_layernorm.py`, L1.2(iii) table). "The small-activation regime" is
therefore doing unearned work: the required regime is `rms ≲ √ε`, which at realistic `ε`
is far smaller than "small activations" suggests.

**Repair.** State the condition quantitatively: "`ε/σ² = (1 + rms²/ε)^{−1}` is
non-negligible exactly when `rms ≲ √ε`. At `ε = 1e−12` this requires centred activations
at RMS `≲ 1e−6`; at the `ε = 1e−5` used in `verify/` it requires RMS `≲ 1e−3`. The
identity is exact regardless; whether it *matters* is an empirical question about the
activation scale, which we have not measured." That is a defensible and falsifiable
version of the same point.

---

## D18. Transpose error in the sampler posterior (D8.4) — MINOR

**Severity:** MINOR (definitional; not used by any of L1–L6)
**Location:** `01-preliminaries.md`, D8.4

> `x^{(t−1)}_i ~ q( x_{t−1,i} | x_{t,i}, x̂_{0,i} ) ∝ (x_{t,i}ᵀ Q_t) ⊙ (Q̄_{t−1}ᵀ x̂_{0,i})`

The second factor is right; the first is transposed. With D8.1's row convention
`q(x_t | x_{t−1}) = Cat(x_{t−1}ᵀ Q_t)`, we have `P(x_t = b | x_{t−1} = a) = (Q_t)_{ab}`.
The posterior over `a` is

    q(x_{t−1}=a | x_t=b, x_0) ∝ P(x_t=b | x_{t−1}=a) · P(x_{t−1}=a | x_0)
                              = (Q_t)_{a,b} · (Q̄_{t−1}ᵀ x_0)_a

The first factor as a vector over `a` is the **column** `Q_t x_t`, not the row
`x_tᵀ Q_t`. The error is invisible for the uniform kernel (D8.2 is symmetric) but real
for the absorbing kernel: `Q_t^mask = α_t I + (1−α_t) 1 e_mᵀ` is not symmetric.

**Repair.** `∝ (Q_t x_{t,i}) ⊙ (Q̄_{t−1}ᵀ x̂_{0,i})`.

---

## D19. D9.1 differentiates a function defined only on a constrained set — MINOR

**Severity:** MINOR
**Location:** `01-preliminaries.md`, D9.1

`T^{(t)}[(j,b) ← (i,a)] := ∂π^{(t−1)}_{j,b} / ∂π^{(t)}_{i,a}` takes unconstrained partial
derivatives of a map whose domain is `(Δ^V)^N`. Because `Σ_b π_{i,b} = 1`, the coordinates
are not independent and the partials are defined only after choosing an extension off the
simplex (or restricting to the tangent space `{v : 1ᵀv = 0}`). Different extensions give
different `T^{(t)}`, differing by an arbitrary multiple of `1` in each block — the same
gauge freedom that makes `J_softmax 1 = 0` in L3(a).

This is a *different* gap from `04-open.md` Q6 (which is about marginals not being closed
under the joint dynamics), and is not flagged anywhere.

**Repair.** State the convention: define `T^{(t)}` as the differential restricted to
`{v : 1ᵀv = 0}`, or fix a canonical extension and say so.

---

## D20. L1.4's "iff `μ = 0`" is stated at the vector level; the conservation-level condition is weaker — MINOR

**Severity:** MINOR
**Location:** `02-lemmas.md`, Lemma 1(d) and the Consequence

(L1.4) is correct: with `μ` and `σ` both detached, `∂̃x̂/∂x = (1/σ)I` and
`(∂̃x̂/∂x)x = x/σ = x̂ + (μ/σ)1`, which equals `x̂` iff `μ = 0`. ✓

But the Consequence promotes this to a claim about *conservation*: "additionally
detaching the mean introduces an error of `(μ/σ)1`". Via the Bridging Lemma of §D3, the
error in the relevance **sum** is `gᵀ(μ/σ)1 = (μ/σ)·(1ᵀg)`, which vanishes whenever
`1ᵀg = 0` — e.g. whenever the downstream path immediately re-centres, which is exactly
what the next LayerNorm's `P` does. So μσ-detach is non-conservative for *generic* `g`,
not for *every* `g`, and the failure is confined to the `1`-direction of the downstream
gradient. Worth saying, because it predicts *where* the artefact should appear, which
strengthens the falsifiable prediction rather than weakening it.

**Repair.** "…introduces a vector error `(μ/σ)1`, hence a relevance-sum error
`(μ/σ)(1ᵀg)` where `g` is the downstream gradient. The artefact is confined to the
all-ones direction and is invisible to any readout with `1ᵀg = 0`."

---

## D21. `SOURCES.md` A2.6 is presented as a prediction that "came out right" — MINOR

**Severity:** MINOR (epistemic hygiene, in a project whose selling point is epistemic hygiene)
**Location:** `SOURCES.md`, note under A2.6; `04-open.md` Q3

> "Recorded as a prediction that came out right."

The Ali et al. code was read (A2, `sources/ali2022.md`) *before* this note was written,
and the note itself derives from that reading. A statement that agrees with evidence
already in hand is a retrodiction. The note partly concedes this ("This is
corroboration, not proof"), then undoes the concession with the final sentence.

Relatedly, `02-lemmas.md`'s Consequence calls L1.3-vs-L1.4 "a falsifiable prediction
about which variant should behave better", while `04-open.md` Q3 already records "A2.6
shows Ali et al. evaluate the std-only variant" — so for *this* implementation the
question is settled, not open. The genuinely open version is Q3's, about R-lens.

**Repair.** Drop "Recorded as a prediction that came out right"; keep "corroboration,
not proof". In `02-lemmas.md`, scope the falsifiable prediction to R-lens (Q3), where it
really is open.

---

## D22. Editorial

**Severity:** EDITORIAL

1. **`03-diffusion.md` does not exist** but is referenced from `NOTATION.md:27`,
   `01-preliminaries.md` (D5, D8.a, D9), `02-lemmas.md` (L4/L5 Reading, Cor. 6.1),
   `README.md` Layout, and `SOURCES.md` Tier D. `04-open.md` acknowledges it is unwritten;
   the other five files read as though it exists. At minimum mark every such reference
   "(forthcoming)".
2. **Index-convention clash in D7.2.** `z_j = Σ_i a_i w_{ij}` uses `i` = input, `j` =
   output, so the Jacobian is `Wᵀ` under NOTATION's row=output convention. This is *not*
   an error — I checked that (L6.1)'s `R_i = a_i Σ_j w_{ij} g_j = a ⊙ (Wg)` is exactly
   the correct reverse-mode expression — but a one-line note would prevent a reader from
   suspecting a transpose bug.
3. **`NOTATION.md` never defines `‖·‖`**, which L3(d) and L4.2 both depend on.
4. **"it is not bounded below 1 by the residual structure"** (L4 Reading) parses most
   naturally as "bounded above by 1", the opposite of the intended meaning (which
   `04-open.md` Q1 makes clear is "`B ≥ 1` is not guaranteed"). Rewrite as "the residual
   structure does not force `B ≥ 1`".
5. **`i, p` vs `j, p'`** are declared in NOTATION as source/target, but D5.1 then uses
   `p` and `p'` while L1–L6 use `i` and `j` for entirely different roles (vector indices,
   LRP input/output units). Not wrong, but the table implies a global meaning that the
   lemmas do not honour.

---

## Summary table

| # | Severity | Location | Defect |
|---|---|---|---|
| D1 | **BLOCKING** | L2, Application | Factor-2 claim false at the layer input; refuted by `N=1` and by the project's own `verify/` script |
| D2 | **BLOCKING** | L6, (L6.1) | Second equality is false as printed — RHS is identically 0 without `sg` on `g_j` |
| D3 | MATERIAL | L1(c)(d) | "Restores exact conservation" ≠ D7.1; bridging lemma missing; contradicts `04-open.md` Q5 |
| D4 | MATERIAL | L1, all parts | Proves `∂x̂/∂x`, not `∂LN/∂x`; `β ≠ 0` breaks (L1.3) |
| D5 | MATERIAL | L3(d), prose | Bound → 1 in the peaked regime; vacuous exactly where invoked (looseness up to 8750×) |
| D6 | MATERIAL | L4, (L4.1) | Product order unspecified; identity **fails** under NOTATION's composition order |
| D7 | MATERIAL | L4, Reading | Applied to a per-block-estimate product; D5's estimator is not of that form |
| D8 | MATERIAL | Cor. 6.1 | Affine≠linear; no whole-graph induction; contradicted by A2.4; cost model undefined |
| D9 | MATERIAL | L5, Reading + README | Antecedent never discharged; ε-rule leak is geometric in `L·T` |
| D10 | MATERIAL | D7, ε-rule | `Σ_i R_i ≤ Σ_j R_j` false for signed relevance (counterexample given) |
| D11 | MATERIAL | `SOURCES.md`, README | Three cited `verify/` scripts and `run_all.py` do not exist |
| D12 | MINOR | L6 | `z_j ≠ 0` parenthetical, not a hypothesis |
| D13 | MINOR | L3 | `J` asserted not derived; PSD proved only at `z`; `p_i > 0` implicit |
| D14 | MINOR | `NOTATION.md` | Conservation defined twice, inconsistently; version there pre-assumes L5 |
| D15 | MINOR | `NOTATION.md` | Two wrong lemma refs; one contradicts L5's own "Honest scope" |
| D16 | MINOR | D2.a | `(std+ε)` changes the *exponent* (`ε/σ` not `ε/σ²`) and `1/d`→`1/(d−1)` |
| D17 | MINOR | L1(b) blockquote | "Matters when `σ` is small" unquantified; needs `rms ≲ √ε` |
| D18 | MINOR | D8.4 | Transposed first factor; wrong for the non-symmetric absorbing kernel |
| D19 | MINOR | D9.1 | Unconstrained partials of a simplex-valued map; gauge unfixed |
| D20 | MINOR | L1(d) Consequence | Conservation-level condition is `μ(1ᵀg)=0`, weaker than `μ=0` |
| D21 | MINOR | `SOURCES.md` A2.6 | Retrodiction labelled as a successful prediction |
| D22 | EDITORIAL | several | Missing `03-diffusion.md`; `‖·‖` undefined; ambiguous phrasing |

---

## Verdicts

| Result | Verdict | Note |
|---|---|---|
| **L1(a)** — closed form (L1.1) | **SOUND** | Re-derived independently; correct, including the `1/d` on `x̂x̂ᵀ`. Shift-invariance check passes |
| **L1(b)** — `(∂x̂/∂x)x = (ε/σ²)x̂` (L1.2) | **SOUND** | **Confirmed exactly.** The `1/d` factor and `‖c‖² = d(σ²−ε)` substitution are both correct. The "correction of record" against the "identically zero" folklore stands |
| **L1(c)** — σ-detach (L1.3) | **SOUND-WITH-REPAIR** | Algebra correct. Statement overclaims: "conservation" needs the bridging lemma (D3), and fails on `β` (D4) |
| **L1(d)** — μσ-detach (L1.4) | **SOUND-WITH-REPAIR** | Algebra correct. Same two repairs, plus the sharper conservation-level condition (D20) |
| **L2** — (L2.1)/(L2.2) as stated | **SOUND** | The abstract bilinear Euler identity is correct and machine-checked |
| **L2 — attention application** | **UNSOUND** | The factor-2 conclusion is false (D1). The p-detach *recommendation* survives, on different and stronger grounds |
| **L3** — (a)(b)(c)(d) | **SOUND-WITH-REPAIR** | All four inequalities are true. (b) needs the "for all `y`" quantifier; `J` should be derived |
| **L3 — prose reading of (d)** | **UNSOUND** | The bound does not formalise "peaked ⇒ small"; it degrades to ≈1 exactly there. Replace with `2max_i p_i(1−p_i)` (D5) |
| **L4** — (L4.1) telescoping | **SOUND-WITH-REPAIR** | Verified index-by-index (`U_k − U_{k+1}` telescopes). **Only** under index-increasing order; false under the document's own composition convention (D6) |
| **L4** — (L4.2) constant `n·B^{n−1}` | **SOUND** | Correct and termwise attained. Needs `‖·‖` submultiplicative stated as a hypothesis |
| **L4 — Reading** | **SOUND-WITH-REPAIR** | Bound is right; its application to the D5 estimator is a non-sequitur (D7) |
| **L5** — (L5.1) | **SOUND** | Downward induction, base case at `ℓ = L`, both stated correctly. Trivially correct as a conditional |
| **L5 — Reading** | **SOUND-WITH-REPAIR** | Antecedent is never discharged by any rule in the document, and fails geometrically for the ε-rule (D9) |
| **L6** — (L6.1) | **UNSOUND as printed / SOUND-WITH-REPAIR** | First equality correct; second is false without `sg(g_j)` — the true value is 0 (D2). One-symbol repair |
| **Cor. 6.1** | **SOUND-WITH-REPAIR** | Conclusion is defensible for a strictly linear, bias-free graph, but does not follow from L6 as argued: four missing pieces (D8) |

### Overall

The **core algebra is in good shape** — Lemma 1 in particular is correct in every detail
I checked, and the `(ε/σ²)x̂` result is exactly right. **No circularity and no Tier C/D
premise appears in any Tier B proof**; the self-containment rule is respected at the level
of premises.

The failures are concentrated in the **connective tissue**: where a lemma about vectors is
promoted to a claim about conservation (D3, D4, the L2 application), where a lemma proved
in one coordinate system is applied in another (D1, D6), and where a conditional is
presented as though its antecedent were established (D9). Two printed equations are
false (D1, D2), both with short repairs.

The single most important item is **D9**: Lemma 5 is the load-bearing result for the
README's "survives depth `L·T`" thesis, and at present no attribution rule in this
document is proved to satisfy its hypothesis — while the rule real LRP implementations
use (the ε-rule) provably violates it, geometrically in depth. Until some rule is shown
to satisfy D7.1 at every layer, the central contrast between the J-lens and the R-lens is
a contrast between a proved bound and an unfulfilled conditional.

The most encouraging signal is that `verify/lemma2_bilinear.py` **already caught D1
independently** and reports it honestly at "Level (B)". The infrastructure for catching
these is working; the prose has not been updated to match it. Finishing the three missing
`verify/` scripts (D11) would likely surface D2 and D5 the same way.
