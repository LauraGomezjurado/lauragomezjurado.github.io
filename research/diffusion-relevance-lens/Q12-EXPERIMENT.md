# Q12 — Does the z⁺-rule apply to transformer sublayers at all?

**Verdict: Q12 is a HARD obstruction for LayerNorm-fed sublayers. The escape
route is real, precisely characterised, and realistic layers do not take it.**

Machine-checked in `verify/q12_nonnegativity.py` (numpy + sympy only, seeded,
`MASTER_SEED = 20250823`; 19/19 checks pass, including 5 negative controls on the
Lyapunov estimator). Every number below is printed by that script.

This file reports results only. It does not amend `05-q9-conservation-at-depth.md`
or `04-open.md`; the dispositions it recommends for those files are listed in §7.

---

## 0. Setup and what was tested

Three questions, in the order they have to be answered:

1. **Claim A** — is `a ≥ 0` actually violated by LayerNorm, and by how much?
   (If LayerNorm outputs were "mostly" non-negative, Q12 would be a rounding error.)
2. **Claim B** — can Theorem 9.4's hypothesis be *weakened* rather than satisfied?
   (If some signed `C` achieved `‖C‖_{1→1} = 1`, Q12 would dissolve.)
3. **Task 2** — is the ℓ¹ one-step norm even the right pivot? The document's own
   caveat records `B = 763 ≫ 1` with no expansion, pointing at the Lyapunov
   exponent `λ` of the product instead. If realistic signed `C` had `λ = 0`, the
   z⁺ requirement could be dropped.

**Negative controls, run before any real number.** The Lyapunov estimator (both a
norm-growth and a Benettin-QR implementation) was checked against five families
with closed-form exponents:

| control | exact `λ` | measured (norm) | measured (QR) | error |
|---|---|---|---|---|
| NC1 fixed diagonal, `d=12` | `log max_i \|d_i\| = 0.665804789` | `0.665804789` | `0.665804789` | `8.7e-15` |
| NC2 `c·Q`, `Q` orthogonal, `c = 0.8` | `−0.223144` | `−0.223154` | `−0.223144` | `1.0e-05` |
| NC2 `c = 1.0` | `0.000000` | `+0.000016` | `+0.000000` | `1.6e-05` |
| NC2 `c = 1.25` | `+0.223144` | `+0.223161` | `+0.223144` | `1.7e-05` |
| NC3 iid `N(0,1)`, `d=4` | `½(log2 + ψ(d/2)) = 0.557966` | `0.561322` | `0.555811` | `3.4e-03` |
| NC3 `d=12` | `1.199632` | `1.196876` | `1.198257` | `2.8e-03` |
| NC3 `d=32` | `1.717080` | `1.718572` | `1.719395` | `2.3e-03` |
| NC4 non-neg column-stochastic | `0` exactly | `+7.9e-18` | `−4.7e-06` | — |
| NC5 fixed matrix repeated | `log ρ(C) = 0.164550782` | `0.164550782` | — | `2.9e-15` |

NC3 uses the exact Newman/Cohen closed form `λ₁ = ½(log 2 + ψ(d/2))` for products
of iid Gaussian matrices — an independent analytic target, not a self-consistency
check. NC4 is the sharpest: for non-negative column-stochastic matrices
`‖∏C‖₁ = 1` identically, and the estimator returns `7.9e-18`, i.e. the floor is
machine epsilon. Every reported `λ = 0` below is therefore *exactly* zero, not
"zero within noise".

---

## 1. Claim A — LayerNorm outputs are always signed. **TRUE.**

### 1.1 Proof

Per D2, `x̂ = c/σ` with `c = Px`, `P = I − (1/d)11ᵀ`, `σ > 0`. Then

    1ᵀx̂ = (1ᵀPx)/σ = 0        since 1ᵀP = (1 − d·(1/d))1ᵀ = 0ᵀ.

For non-constant `x` we have `c = Px ≠ 0`, hence `x̂ ≠ 0`. A non-zero vector whose
components sum to zero cannot be entrywise non-negative: if `x̂ ≥ 0` and
`1ᵀx̂ = 0` then `x̂ = 0`, a contradiction. Therefore **at least one component of
`x̂` is strictly negative**. ∎

Two sharpenings, both verified:

- The number of strictly negative components lies in `[1, d−1]` (it cannot be `d`,
  since the sum is zero and `x̂ ≠ 0` forces a positive component too).
- With `ε = 0`, `‖x̂‖² = d`, so minimising one component subject to `1ᵀx̂ = 0` and
  `‖x̂‖² = d` gives `min_i x̂_i ≥ −√(d−1)`, attained by the one-hot-like extreme
  `(−√(d−1), (d−1)^{−1/2}, …)`.

Note the proof needs *nothing* about `x` beyond non-constancy: it is the centring
projector, not the choice of `γ, β`, that forces the sign. `1ᵀx̂ = 0` also holds
independently of `ε`.

### 1.2 Machine check

| check | result |
|---|---|
| `1ᵀx̂ = 0` symbolically (sympy, symbolic `x` and `ε`) | exactly `0` for `d = 2,3,4,5` |
| `1ᵀx̂ = 0` numerically, 20 000 draws, `d = 64` | `max \|Σx̂\| = 8.88e-15` |
| at least one strictly negative component | min over 20 000 draws = **22** negatives |
| `min_i x̂_i ≥ −√(d−1)`, `d = 8`, 200 000 draws | empirical min `−2.623849` vs bound `−2.645751` |

### 1.3 How negative? Fraction of components below zero

| input distribution | `d=16` | `d=768` |
|---|---|---|
| `x ~ N(0,1)` | `0.4995 ± 0.0771` | `0.5002 ± 0.0107` |
| `x ~ Exp(1)` (all-positive input!) | `0.6187 ± 0.0781` | `0.6319 ± 0.0113` |
| `x ~ LogNormal(0,1)` | `0.6642 ± 0.0893` | `0.6912 ± 0.0140` |
| `x ~ Cauchy` | `0.4954 ± 0.2514` | `0.4958 ± 0.2856` |
| sparse (one spike + noise) | `0.9375` (= 15/16, deterministic) | `0.6020 ± 0.0108` |
| bimodal `±3` + noise | `0.4976 ± 0.1098` | `0.5001 ± 0.0177` |
| residual-stream-like (scale-mixed Gaussian) | `0.5035 ± 0.1401` | `0.5004 ± 0.0297` |

The expectation of "~half" is confirmed for symmetric inputs and **exceeded** for
every skewed one. The all-positive `Exp(1)` row is the point of the table: an
input that is entirely non-negative comes out of LayerNorm **63% negative**,
because centring subtracts the mean and the mean of a right-skewed variable
exceeds its median. Sparse inputs are worse still — a single spike drives
`15/16 = 93.75%` of components negative at `d = 16`. The minimum observed
negative fraction across ~500 000 draws was `0.0013` (heavy-tail, `d=768`), i.e.
one component — never zero, exactly as the proof requires.

### 1.4 Does `β > 0` rescue non-negativity? **Yes in principle, at a price that
### destroys the attribution.**

With `γ > 0`, `LN(x) = γ⊙x̂ + β ≥ 0` for *all* `x` iff `β_i ≥ γ_i√(d−1)`:

| `d` | required `β_i/γ_i` |
|---|---|
| 16 | 3.873 |
| 64 | 7.937 |
| 768 | **27.695** |
| 4096 | 63.992 |

Learned LayerNorm `β` in real transformers is `O(0.1–1)`. A shift of 27.7 at
`d = 768` is two to three orders of magnitude larger than anything a trained model
contains, so **the rescue does not occur naturally** — it would have to be
imposed by the attribution method as a modification of the network.

Empirically at `d = 64` the shift needed on a given draw is smaller than the
worst case but still large:

| input | median `β` needed | p99 | max | worst-case bound |
|---|---|---|---|---|
| gaussian | 2.326 | 3.472 | 4.131 | 7.937 |
| heavy-tail | 4.185 | 7.931 | 7.937 | 7.937 |
| sparse | 0.218 | 0.269 | 0.375 | 7.937 |

**The cost.** Shifting `a → a + β1` is not free: it changes the layer function
unless compensated in the bias (and a bias term is exactly what breaks the
column-sum identity `Σ_i C⁺_ij = z⁺_j/z⁺_j = 1`), and it dilutes the explanation.
As `β → ∞`, `C⁺_ij = (x̂_i + β)w⁺_ij / Σ_i (x̂_i + β)w⁺_ij → w⁺_ij / Σ_i w⁺_ij`,
which does not depend on the input at all. Writing `ρ_j(β) = β Σ_i w⁺_ij / z⁺_j`
for the fraction of `z⁺_j` supplied by the constant offset, and `TV` for the mean
per-column total-variation distance to that input-independent limit (`d = 64`):

| `β` | `LN(x) ≥ 0` on sample | offset fraction `ρ` | `TV(C⁺(β), C⁺(∞))` |
|---|---|---|---|
| 0.0 | 0% | 0.0000 | 19.5521 |
| 0.5 | 0% | −1.0052 | 3.2373 |
| 1.0 | 0% | 1.0429 | 0.4096 |
| 2.0 | 16% | 1.0095 | 0.1979 |
| 4.0 | 100% | 1.0022 | 0.0985 |
| **7.937 = √(d−1)** | **100%** | **1.0007** | **0.0495** |
| 50.0 | 100% | 1.0000 | 0.0079 |
| 500.0 | 100% | 1.0000 | 0.0008 |

At exactly the `β` that guarantees non-negativity, the relevance allocation is
already within `TV = 0.05` of the completely input-independent limit, and the
offset supplies essentially 100% of every `z⁺_j`. **The shift buys `C⁺ ≥ 0` by
deleting the attribution's dependence on the activation it is supposed to
explain.** This is not a trade-off with a sweet spot; the two quantities are the
same quantity.

---

## 2. Claim B — non-negativity is NECESSARY, not just sufficient. **TRUE.**

### 2.1 Theorem and proof

> **Theorem B.** Let `C ∈ ℝ^{m×n}` satisfy `1ᵀC = 1ᵀ` (unit column sums). Then
> `‖C‖_{1→1} = max_j Σ_i |C_ij| ≥ 1`, with **equality iff `C ≥ 0` entrywise**.

**Proof.**

*(≥)* For each `j`, the triangle inequality gives
`Σ_i |C_ij| ≥ |Σ_i C_ij| = |1| = 1`. Taking the max over `j`, `‖C‖_{1→1} ≥ 1`.

*(equality ⟹ `C ≥ 0`)* Suppose `‖C‖_{1→1} = 1`. Every column already satisfies
`Σ_i |C_ij| ≥ 1`, and the maximum of these numbers is 1, so **every** column
satisfies `Σ_i |C_ij| = 1` exactly. Fix `j` and consider

    Σ_i ( |C_ij| − C_ij ) = Σ_i |C_ij| − Σ_i C_ij = 1 − 1 = 0.

Each summand `|C_ij| − C_ij = 2·max(−C_ij, 0) ≥ 0`, and a sum of non-negative
terms vanishes only if every term vanishes. Hence `C_ij = |C_ij| ≥ 0` for all
`i, j`.

*(`C ≥ 0` ⟹ equality)* `Σ_i |C_ij| = Σ_i C_ij = 1` for every `j`. ∎

**On the "all same sign" step the task flags.** The alternative route argues:
equality in `Σ_i |c_i| = |Σ_i c_i|` forces all `c_i` to share one common sign. That
step alone is *not enough* — an all-negative column also achieves equality in the
triangle inequality. What eliminates it is the unit column sum: `Σ_i c_i = +1 > 0`
pins the common sign to **positive**. So the sign is fixed by *conservation*, not
by the norm identity. The `(|c| − c)` route above avoids the case split entirely
and is the one implemented.

### 2.2 Corollary B′ — the exact identity, and what it says about depth

The proof yields more than an iff. For any `C` with `1ᵀC = 1ᵀ`,

    ‖C‖_{1→1} = 1 + 2·max_j ν_j(C),      ν_j(C) := Σ_i max(−C_ij, 0)

— the ℓ¹ operator norm is **exactly** 1 plus twice the negative mass of the worst
column. Verified: max relative discrepancy `1.1e-16` over 20 000 conservative
draws.

The class `{1ᵀC = 1ᵀ}` is closed under multiplication (`1ᵀ(C_n⋯C_1) = 1ᵀ`), so
Corollary B′ applies to the *product* `P_n`, giving

    λ = lim (1/n) log ‖P_n‖₁ = the exponential growth rate of the NEGATIVE MASS
                               in the product.

**`λ = 0` ⟺ the negative mass in the product stays bounded.** It does *not*
require each factor to be non-negative — only the product. This is the precise
form of the escape route, and §3 tests whether real layers take it.

**Sharpening.** `‖P_n‖₁ ≥ 1` for every `n`, so **`λ ≥ 0` always** under
conservation. The task's question "is `λ ≤ 0`?" therefore admits exactly one
benign answer: `λ = 0`. There is no contracting regime to hope for. Conservation
buys the possibility of non-compounding error; it can never buy damping.

### 2.3 Machine check

| check | result |
|---|---|
| `Σ_i\|c_i\| = 1 + 2t` for column `(−t, 0, 1+t)` | symbolic, exact |
| `‖C‖_{1→1} ≥ 1`, 200 000 random unit-col-sum matrices, `d ∈ [2,8]` | `max(1 − ‖C‖₁) = 2.22e-16` — no counterexample |
| signed `C` forces `‖C‖_{1→1} > 1` **strictly** | 192 374 signed draws, `min ‖C‖₁ = 1.000017974622` |
| non-negative `C` gives `‖C‖_{1→1} = 1` | `max\|1 − ‖C‖₁\| = 2.22e-16` |
| Corollary B′ identity | `max` relative error `1.1e-16` over 20 000 draws |
| `ρ(C) ≥ 1` for conservative `C` | `min ρ = 1.090631704` over 1 992 signed draws |

There is no "almost non-negative" loophole: the excess over 1 is exactly twice the
negative mass, so negativity is paid for at rate 2 with no threshold.

### 2.4 Honest scope of Claim B

Claim B is a statement about the **ℓ¹ one-step** norm, and that is the norm the
project needs (relevance *mass*). Two things it does not say:

- It does not say a conservative rule can be made contractive in some other norm.
  `1ᵀC = 1ᵀ` makes `1` a left eigenvector with eigenvalue 1, so `ρ(C) ≥ 1` and
  hence `‖C‖ ≥ 1` in **every** induced norm. Confirmed: `min ρ = 1.0906` above.
- It does not say `‖C‖ > 1` in every norm. A diagonalisable `C` with `ρ(C) = 1`
  admits *some* induced norm in which `‖C‖ = 1`. And `ρ` and `‖·‖₁` are wildly
  different for these matrices: median `ρ = 4.9220` against median
  `‖C‖₁ = 56.1460`, a factor `11.4`.

So the answer to "can Theorem 9.4's hypothesis be weakened or worked around within
the ℓ¹ framework?" is **no — it is necessary and sufficient**. The only door left
open is that a *product* of signed factors may still be non-expansive even though
no individual factor is. That door is Corollary B′, and §3 walks through it.

---

## 3. Task 2 — the escape route: Lyapunov exponents

### 3.1 The mechanism: below a critical negativity, the product self-heals

Family (matching the "x% signed" family already used in
`verify/q9_renormalisation.py`): `a ≥ 0` from `|N(0,1)|`, `|w| ~ |N(0,1)|`, a
fraction `f` of weight entries sign-flipped, `C_ij = a_i w_ij / z_j`. `f = 0` is
exactly the z⁺-rule. Columns with `|z_j| < 1e-12` are resampled, never clamped.

Negative mass fraction of the *product* `P_n`, at `d = 64`:

| `f` | `n=1` | `n=2` | `n=3` | `n=5` | `n=10` | `n=50` | `n=200` | `n=800` |
|---|---|---|---|---|---|---|---|---|
| 0.05 | 6.6e-02 | **0** | 0 | 0 | 0 | 0 | 0 | 0 |
| 0.15 | 2.0e-01 | 1.7e-02 | 2.0e-04 | **0** | 0 | 1.2e-03 | 0 | 0 |
| 0.20 | 2.3e-01 | 4.4e-02 | 1.1e-03 | 0 | 3.8e-02 | 0 | 7.3e-02 | 1.7e-03 |
| 0.25 | 2.9e-01 | 2.6e-01 | 3.1e-01 | 1.0e-01 | 2.5e-02 | 0 | 1.0e-01 | 2.5e-02 |
| 0.28 | 3.6e-01 | 3.7e-01 | 4.5e-01 | 3.8e-01 | 2.5e-02 | 4.8e-01 | 4.1e-01 | 6.7e-02 |
| 0.30 | 4.5e-01 | 4.5e-01 | 4.7e-01 | 4.9e-01 | 5.0e-01 | **0.5** | 0.5 | 0.5 |
| 0.35 | 4.1e-01 | 4.9e-01 | 5.0e-01 | 5.0e-01 | 0.5 | 0.5 | 0.5 | 0.5 |
| 0.50 | 5.0e-01 | 5.0e-01 | 5.0e-01 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |

**This is the finding that explains the document's own puzzle.** Below the
critical `f`, the negative entries are *annihilated within 2–5 layers*: the
product becomes an exactly non-negative column-stochastic matrix, so
`‖P_n‖₁ = 1` identically and `λ = 0` **exactly** (not approximately — see NC4).
Positive relevance mass mixes across coordinates faster than the sparse negative
entries can compound, and the negativity is absorbed. Above the critical `f` the
negative mass saturates at its maximum `1/2` — every column becomes a maximally
cancelling `±` pair summing to 1 — and the ℓ¹ norm grows geometrically. It is a
phase transition in an order parameter, not a smooth crossover.

This is exactly why the earlier verification saw `B = 763 ≫ 1` at 5% sign-flipped
weights with no expansion: at `f = 0.05` the *product* is non-negative from layer
2 onward, whatever the individual factors look like. The document's caveat was
right, and now has a mechanism.

### 3.2 `λ` as a function of `f`

`n = 800` layers, 5 seeds, both estimators. `E‖C‖₁` is the mean one-step norm.

**`d = 16`:**

| `f` | frac `C<0` | `E‖C‖₁` | `λ` (norm) | sd | `λ` (QR) | `e^λ` | verdict |
|---|---|---|---|---|---|---|---|
| 0.000 | 0.0000 | 1 | `+0.00000` | 0.00000 | `−0.00006` | 1.00000 | BENIGN |
| 0.010 | 0.0098 | 1.426 | `+0.00000` | 0.00000 | `+0.00021` | 1.00000 | BENIGN |
| 0.050 | 0.0495 | 3.48 | `+0.00000` | 0.00000 | `+0.00002` | 1.00000 | BENIGN |
| 0.100 | 0.1045 | 20.84 | `+0.00001` | 0.00022 | `+0.00054` | 1.00001 | BENIGN |
| 0.150 | 0.1567 | 29.9 | `−0.00175` | 0.00469 | `−0.00141` | 0.99825 | BENIGN |
| **0.200** | 0.2143 | 168.5 | **`+0.18875`** | 0.04994 | `+0.18830` | 1.20773 | **BLOW-UP** |
| 0.250 | 0.2683 | 61.91 | `+0.58167` | 0.03481 | `+0.56915` | 1.78903 | BLOW-UP |
| 0.350 | 0.3656 | 1238 | `+1.15878` | 0.01091 | `+1.17673` | 3.18603 | BLOW-UP |
| 0.500 | 0.4314 | 598.8 | `+1.49773` | 0.03649 | `+1.49716` | 4.47151 | BLOW-UP |

**`d = 64`:**

| `f` | frac `C<0` | `E‖C‖₁` | `λ` (norm) | sd | `λ` (QR) | `e^λ` | verdict |
|---|---|---|---|---|---|---|---|
| 0.000 | 0.0000 | 1 | `+0.00000` | 0.00000 | `+0.00000` | 1.00000 | BENIGN |
| 0.050 | 0.0499 | 1.618 | `+0.00000` | 0.00000 | `−0.00003` | 1.00000 | BENIGN |
| 0.100 | 0.0999 | 2.209 | `+0.00000` | 0.00000 | `+0.00000` | 1.00000 | BENIGN |
| 0.150 | 0.1496 | 3.425 | `+0.00000` | 0.00000 | `−0.00001` | 1.00000 | BENIGN |
| 0.200 | 0.2008 | 13.0 | `−0.00002` | 0.00003 | `−0.00000` | 0.99998 | BENIGN |
| 0.250 | 0.2513 | 88.4 | `+0.00021` | 0.00039 | `−0.00006` | 1.00021 | BENIGN |
| **0.300** | 0.3044 | 164.4 | **`+0.25251`** | 0.04061 | `+0.27118` | 1.28725 | **BLOW-UP** |
| 0.350 | 0.3583 | 619.8 | `+1.08287` | 0.02428 | `+1.08573` | 2.95315 | BLOW-UP |
| 0.400 | 0.4118 | 859.8 | `+1.76084` | 0.02685 | `+1.70520` | 5.81733 | BLOW-UP |
| 0.500 | 0.4684 | 2412 | `+2.25236` | 0.05431 | `+2.24950` | 9.51013 | BLOW-UP |

Note the divergence Claim B.4 predicted: at `d = 64, f = 0.25` the one-step norm
is `E‖C‖₁ = 88.4` while `λ = 0.0002 ≈ 0`. **`B` is a useless predictor of depth
behaviour in the benign regime**, exactly as the document's caveat says. It
becomes informative only once `λ > 0`, and then only qualitatively.

### 3.3 Where is the transition, and does it move with width?

Bisection is **not usable**: near `f_c` the process is intermittent (see the
`f = 0.20–0.28` rows of §3.1 — the product drops in and out of non-negativity),
so `λ` is non-monotone seed-by-seed. Reported instead as a band from a fine grid,
6 seeds each, `n = 500`, threshold `1e-5` (twelve orders above the NC4 floor):

| `d` | all 6 seeds benign up to | all 6 seeds blow up from | `f_c` band | `0.5 − f_c` |
|---|---|---|---|---|
| 16 | *(none — see below)* | `f = 0.20` | ~0.175–0.20 | ~0.31 |
| 64 | `f = 0.15` | `f = 0.30` | 0.15–0.30 | ~0.28 |
| 256 | `f = 0.325` | `f = 0.40` | 0.325–0.40 | ~0.14 |

At `d = 16` no grid point had all six seeds benign — one seed at `f = 0.05`
produced `λ = 4.8e-4`. Small widths have a broad fluctuation regime rather than a
sharp threshold; the transition sharpens as `d` grows (at `d = 256`, `λ` is
`+0.00000` for all six seeds at every `f ≤ 0.325` and `+0.916` at `f = 0.40`).

**`f_c` grows with width** — more dimensions give the non-negative mass more room
to swamp the negative entries before they compound. Whether `f_c → 1/2` fast
enough to cover real transformer widths is precisely the question that decides
Q12, so §4 measures it directly rather than extrapolating.

---

## 4. `λ` for realistic structure — the decisive measurement

A small numpy sublayer: residual state `h` (scale-mixed Gaussian), activation
`a = act(h)`, weight `W`. `z_j = Σ_i a_i w_ij`, `C_ij = a_i w_ij / z_j` — the true
**signed** relevance matrix. Because `C` is invariant to the scale of both `a` and
`W`, only their shapes matter. Fresh `h` and `W` per layer, `n = 600`, 5 seeds.
`layernorm` uses learned-scale `γ = 1 + 0.1N`, `β = 0.1N`; `layernorm_plain` uses
`γ = 1, β = 0`.

| activation | `d` | frac `a<0` | frac `C<0` | `E‖C‖₁` | `λ` | sd | `e^λ` | verdict |
|---|---|---|---|---|---|---|---|---|
| relu | 16 | 0.0000 | 0.2017 | 164.6 | `+0.90588` | 0.062 | 2.474 | BLOW-UP |
| relu | 64 | 0.0000 | 0.2309 | 1161 | `+1.77991` | 0.055 | 5.929 | BLOW-UP |
| relu | 256 | 0.0000 | 0.2406 | 1.2e4 | `+2.46582` | 0.038 | 11.773 | BLOW-UP |
| gelu | 16 | 0.4952 | 0.4458 | 194.3 | `+0.99443` | 0.056 | 2.703 | BLOW-UP |
| gelu | 64 | 0.4998 | 0.4784 | 738.9 | `+1.82965` | 0.059 | 6.232 | BLOW-UP |
| gelu | 256 | 0.5017 | 0.4892 | 6740 | `+2.57263` | 0.043 | 13.100 | BLOW-UP |
| **layernorm** | 16 | 0.4968 | 0.4382 | 8488 | **`+1.42196`** | 0.037 | 4.145 | **BLOW-UP** |
| **layernorm** | 64 | 0.4953 | 0.4716 | 915.4 | **`+2.10887`** | 0.024 | 8.239 | **BLOW-UP** |
| **layernorm** | 256 | 0.4984 | 0.4859 | 1.2e4 | **`+2.85671`** | 0.009 | 17.404 | **BLOW-UP** |
| layernorm_plain | 64 | 0.4984 | 0.4714 | 2.3e5 | `+2.13119` | 0.047 | 8.425 | BLOW-UP |

**Answer to the key question: NO. For realistic signed `C`, `λ ≫ 0`.**

Two things make this decisive rather than suggestive:

1. **Realistic negativity sits above `f_c` at every width tested.** Measured
   `frac C<0` is `0.44–0.49`, against `f_c ≈ 0.19 / 0.23 / 0.36` at
   `d = 16 / 64 / 256`. The realistic fraction is pinned near its maximum `0.5`
   because LayerNorm makes `a` ~50% negative (Claim A) and `W` is sign-symmetric.
2. **Widening the model makes it worse, not better.** `f_c` grows with `d`, which
   is the direction that would help — but the realistic `λ` grows *faster*:

| activation | `d=16` | `d=64` | `d=256` |
|---|---|---|---|
| relu | `+0.90588` | `+1.77991` | `+2.46582` |
| gelu | `+0.99443` | `+1.82965` | `+2.57263` |
| layernorm | `+1.42196` | `+2.10887` | `+2.85671` |
| layernorm_plain | `+1.39888` | `+2.13119` | `+2.81871` |

There is no width at which the realistic family crosses back below `f_c`. The
extrapolation to `d = 768` or `4096` is therefore not load-bearing: the trend in
the quantity that matters (`λ` itself, measured) is monotonically *away* from the
benign regime.

**What this means at depth `n = L·T`** (`d = 64`, `log₁₀` growth factor of the
product's ℓ¹ norm):

| activation | `λ` | `n = 48` | `n = 768` |
|---|---|---|---|
| relu (plain signed z-rule) | `+1.77991` | `10^37.1` | `10^593.7` |
| gelu | `+1.82965` | `10^38.1` | `10^610.3` |
| layernorm | `+2.10887` | `10^44.0` | `10^703.4` |

Consistent in magnitude with the ~603-orders-of-magnitude separation already
recorded in `05-q9-conservation-at-depth.md`, and now attributed to the right
quantity.

### 4.1 Is `λ > 0` an artefact of the iid-fresh-`W` model?

Real depth reuses *trained* weight matrices. Four weight models at `d = 64` with
LayerNorm input:

<!--WEIGHTMODEL-->

`λ > 0` survives every weight model tested. It is driven by the **sign structure
of `a`** — which LayerNorm pins at ~50% negative by Claim A — not by any
particular distribution of `W`.

### 4.2 On LayerNorm input, the z⁺-rule is not merely lossy — it is undefined

Hypothesis (H⁺) needs `z⁺_j ≠ 0`; Lemma 9.3′ needs `C⁺ ≥ 0`, which needs `a ≥ 0`.
With signed `a` (`d = 64`, 400 draws):

| activation | columns with `z⁺_j ≤ 0` | entries of `C⁺` that are `< 0` | `min\|z⁺\|` |
|---|---|---|---|
| relu | **0.00%** | **0.00%** | 3.91e-01 |
| gelu | 0.44% | **24.79%** | 1.20e-01 |
| **layernorm** | **50.31%** | **23.70%** | 1.11e-02 |

Half of all columns have `z⁺_j ≤ 0` under LayerNorm input. `z⁺_j = Σ_i a_i w⁺_ij`
is a signed sum when `a` is signed — it inherits exactly the cancellation that
§9.5 argues `z⁺` avoids. **Both halves of Lemma 9.3′ fail, not just the one Q12
names.**

### 4.3 Applying z⁺ to LayerNorm input anyway

The naive prescription — use `w⁺ = max(w,0)` with whatever `a` the sublayer
actually receives (`n = 600`, 4 seeds):

| input activation | `d` | frac `C⁺ < 0` | `E‖C⁺‖₁` | `λ` | sd | verdict |
|---|---|---|---|---|---|---|
| relu | 16 | 0.0000 | **1** | `+0.00000` | 0.00000 | **BENIGN** |
| relu | 64 | 0.0000 | **1** | `+0.00000` | 0.00000 | **BENIGN** |
| gelu | 16 | 0.2327 | 31.18 | `+0.26180` | 0.029 | BLOW-UP |
| gelu | 64 | 0.2473 | 12.18 | `≈0` (marginal) | 0.002 | marginal |
| layernorm | 16 | 0.2187 | 1709 | `+1.42998` | 0.023 | BLOW-UP |
| layernorm | 64 | 0.2370 | 1457 | `+2.16717` | 0.049 | BLOW-UP |

With `a ≥ 0` (post-ReLU) the rule does exactly what Theorem 9.4 promises:
`C⁺ ≥ 0`, `‖C⁺‖₁ = 1` to machine precision, `λ = 0` exactly. With LayerNorm input
the identical code yields a signed `C⁺` with `‖C⁺‖₁ ~ 10³` and `λ > 2`: **the
theorem's conclusion fails together with its hypothesis, and by a wide margin.**
GELU is the interesting middle case — it lands in the intermittent regime, benign
at `d = 64` and blown up at `d = 16`, which is exactly the unstable band of §3.3
and is not something to build a method on.

---

## 5. Task 3 — what z⁺ actually costs

### 5.1 Relevance mass discarded by `w⁺ = max(w,0)`

| activation | `d` | negative mass fraction | per-column `z⁻/(z⁺+z⁻)` | negative fraction of `‖C‖₁` mass |
|---|---|---|---|---|
| relu | 16 | 0.4966 | 0.4976 | 0.3966 |
| relu | 64 | 0.4982 | 0.4983 | 0.4664 |
| relu | 256 | 0.5003 | 0.5002 | 0.4865 |
| gelu | 64 | 0.4988 | 0.4990 | 0.4674 |
| layernorm | 64 | 0.5006 | 0.5006 | 0.4748 |
| layernorm | 256 | 0.4996 | 0.4996 | 0.4910 |

**z⁺ discards ~50% of the signed contribution mass**, and the fraction converges
to exactly `1/2` as `d` grows (sign-symmetric `W`). §9.5's statement that "the
cost is real" is confirmed and quantified: it is half the evidence, not a
correction term.

### 5.2 `min_j z⁺_j` vs `min_j |z_j|` — the "~2300×" claim

Measured on the `a ≥ 0` (post-ReLU) case, where `z⁺ > 0` is meaningful, 400 draws:

| `d` | `E min z⁺` | `E min\|z\|` | **`E` ratio** | **median ratio** | p10 | p90 |
|---|---|---|---|---|---|---|
| 16 | 9.71e-02 | 5.45e-02 | **16.1** | 2.14 | 0.217 | 17.6 |
| 64 | 3.83e-01 | 1.34e-02 | **199** | 39.5 | 10.7 | 273 |
| 256 | 1.26e+00 | 3.57e-03 | **3.70e3** | 509 | 157 | 2 964 |
| 1024 | 3.28e+00 | 8.06e-04 | **3.56e4** | 6 563 | 1 686 | 4.14e4 |

**Verdict on "~2300×": directionally right, unreproducible as a constant.** The
ratio is a `d`-dependent order statistic, not a physical constant. It spans
`16×` at `d = 16` to `3.6e4×` at `d = 1024`, passing through ~2300 near `d ≈ 200`;
the mean and the median differ by roughly an order of magnitude at every width
because `min_j |z_j|` is set by rare near-cancellation events. The mechanism the
document claims is confirmed — `z⁺_j` sums only non-negative terms and does not
cancel, while `|z_j|` is driven to zero by cancellation, and the gap grows with
width — and it genuinely favours the project. **But the number must always be
quoted with its `d`, and the median should be preferred to the mean.**

### 5.3 …and the favourable ratio does not survive signed `a`

| `d` | draws with all `z⁺_j > 0` | `E min z⁺` | median ratio |
|---|---|---|---|
| 16 | **1 / 400** | 8.99e-04 | 2.25e-02 |
| 64 | **0 / 400** | — | — |
| 256 | **0 / 400** | — | — |

With signed `a`, `z⁺_j = Σ_i a_i w⁺_ij` is itself a signed sum and cancels just as
`z_j` does. The favourable-conditioning argument of §9.5 is a consequence of
`a ≥ 0`, exactly like Theorem 9.4 — the two stand or fall together. §9.5's
optimism about condition (9.9) is therefore **conditional on the same hypothesis
Q12 disputes**, which the document does not currently say.

---

## 6. Conclusion

**Q12 is a hard obstruction for the sublayers the prescription targets, and the
escape route, though real, is not taken by realistic layers.**

| question | answer |
|---|---|
| Claim A — LayerNorm outputs always signed? | **TRUE.** `1ᵀx̂ = 0` exactly; ≥1 strictly negative component always; ~50% negative for symmetric inputs, up to 69% for skewed and 94% for sparse ones. |
| Does `β > 0` rescue it? | Only with `β ≥ γ√(d−1)` (27.7 at `d=768`, vs learned `O(0.1)`), and at that `β` the attribution is within `TV = 0.05` of input-independent. Not a usable route. |
| Claim B — is non-negativity necessary? | **TRUE.** `‖C‖_{1→1} = 1 + 2·max_j ν_j(C)` exactly. Under conservation, `‖C‖_{1→1} = 1 ⟺ C ≥ 0`. Theorem 9.4's hypothesis **cannot be weakened within ℓ¹**. |
| Is the one-step norm `B` the right pivot? | **No** — and Claim B says why: `‖P_n‖₁ = 1 + 2·(negative mass of the product)`, so `λ` is the growth rate of the product's negativity, and each factor may be signed. |
| Is `λ ≤ 0` attainable? | `λ ≥ 0` **always** under conservation. The only benign case is `λ = 0` exactly. |
| Is `λ = 0` for *some* signed families? | **Yes** — a genuine phase transition. Below `f_c` the product becomes exactly non-negative within 2–5 layers and `λ = 0` to machine precision even when `‖C‖₁ ~ 10²`. This explains the `B = 763`-without-expansion anomaly. |
| Where is `f_c`? | `≈0.19` (`d=16`), `0.15–0.30` (`d=64`), `0.325–0.40` (`d=256`). Grows with width; intermittent near the threshold. |
| Is `λ = 0` for **realistic** signed `C`? | **NO.** `λ = +1.42 / +2.11 / +2.86` at `d = 16/64/256` for LayerNorm-fed sublayers — and `λ` grows with width, moving away from the benign regime. Realistic `frac C<0 ≈ 0.47–0.49` sits above `f_c` at every width. |
| Can z⁺ be applied to LayerNorm sublayers anyway? | **No.** 50.31% of columns have `z⁺_j ≤ 0`, so (H⁺) fails outright and `C⁺` is 23.7% negative. Applying it regardless gives `λ = +2.17`. |

### What survives

**Route (i) of Q12 — restrict to sublayers with non-negative inputs — is
empirically vindicated, and only that route.** Post-ReLU, `z⁺` delivers exactly
what Theorem 9.4 claims: `C⁺ ≥ 0`, `‖C⁺‖₁ = 1` to `1e-16`, `λ = 0` exactly, all
`z⁺_j > 0`, `min|z⁺| = 0.39`. The theorem is correct and its hypothesis is
checkable. What is *not* established is that a transformer has enough such
sublayers to carry an explanation: the residual stream is LayerNormed before every
attention and MLP block (D1.1), and modern models use GELU/SiLU rather than ReLU
— and GELU already fails, with 0.44% of columns having `z⁺_j ≤ 0` and 24.79% of
`C⁺` entries negative, landing in the unstable intermittent band.

**Route (ii) — a signed-input variant — now has a sharp target.** Claim B says it
cannot be a rule with `‖C‖_{1→1} = 1`; no such signed rule exists. Corollary B′
says what it must instead achieve: keep the **negative mass of the product**
bounded in depth. §3.1 shows that is a real regime with a real mechanism
(annihilation by mixing), reachable when negativity is below `f_c`. So the honest
statement of route (ii) is: *find a signed rule whose negative-entry fraction is
below `f_c`, accepting `‖C‖ > 1`.* That is a well-posed design problem this study
does not solve — but it is now a quantitative target rather than a hope, and the
threshold to beat is `f_c ≈ 0.15–0.40` depending on width, against a natural
value of `0.47–0.49`.

### Scale caveats — read before citing any of this

1. **Widths `d ≤ 256`, not 768–4096.** `f_c` grows with `d` and the extrapolation
   `(0.5 − f_c) ~ d^{−0.31}` would put `f_c ≈ 0.39` at `d = 768`, still below the
   realistic `0.47–0.49` — but the verdict does not rest on that extrapolation.
   It rests on the *measured* realistic `λ`, which increases monotonically with
   `d` over the range tested. If that trend reversed at large `d` the conclusion
   would need revisiting; nothing here rules that out.
2. **Random weights, not trained ones.** §4.1 tests four weight models (iid fresh,
   one fixed `W` reused, low-rank + noise, heavy-tailed) and `λ > 0` survives all
   four, but no model was trained. Trained weights have structure (low effective
   rank, outlier features, alignment with the activation distribution) not
   captured here. The mechanism identified — that `λ` is driven by the sign
   structure of `a`, which LayerNorm pins at ~50% negative *analytically* — is
   weight-independent, which is why the conclusion is expected to transfer; but
   this is an expectation, not a measurement.
3. **Single-position, single-matrix sublayers.** No attention softmax, no residual
   stream, no multi-token interaction. D1.1's `J = I + A` structure is absent: a
   real block's relevance matrix inherits an identity component that may raise
   `f_c` substantially. **This is the most likely place the negative verdict could
   soften**, and it is not tested here.
4. **`λ` is an asymptotic quantity; `L·T ≈ 768` is finite.** At `λ ≈ 2` the
   distinction is academic (`10^703`), but near `f_c` the intermittency of §3.3
   means finite-depth behaviour can differ from the exponent for hundreds of
   layers.
5. **The `~2300×` figure in §9.5 is not a constant** (§5.2), and the
   favourable-conditioning argument it supports assumes `a ≥ 0` (§5.3) — the same
   hypothesis under dispute.

---

## 7. Recommended dispositions (not applied — no existing file was edited)

- **`04-open.md`, Q12**: status changes from OPEN to **RESOLVED NEGATIVELY for
  LayerNorm-fed sublayers**. Route (i) is vindicated but narrow (ReLU only; GELU
  fails). Route (ii) acquires a precise target via Corollary B′.
- **`05-q9-conservation-at-depth.md`, Theorem 9.4**: add Claim B as the converse.
  The theorem's hypothesis is *necessary and sufficient*, so the sentence "we
  choose a rule for which it is not" is exactly right and cannot be improved on.
- **§9.4's directional caveat**: the `B = 763`-without-expansion anomaly now has a
  mechanism (§3.1) — the product self-heals to non-negative within a few layers
  below `f_c`. Worth recording, since it is the one genuinely positive finding.
- **§9.5's "~2300×"**: requote with width, prefer the median, and state that the
  favourable ratio is itself conditional on `a ≥ 0` (§5.3).
- **A new open question** is warranted: does the residual `I + A` structure of a
  full block (D1.2) raise `f_c` above the realistic `0.47–0.49`? That is the one
  untested route by which the verdict could soften, and it is a well-posed
  measurement.
