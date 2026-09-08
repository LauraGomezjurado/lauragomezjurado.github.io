# Q14 — Does the residual structure `I + A` rescue `λ = 0`?

**Verdict: NO. The residual connection rescales the negative mass but does not
remove it, and there is no critical identity share below 1. Q12's negative
verdict stands, and the mechanism by which it stands is now understood.**

Machine-checked in `verify/q14_residual.py` (numpy + sympy only, seeded,
`MASTER_SEED = 20250823`, same master seed as Q12; 12/12 checks pass, including
five negative controls). The Lyapunov estimator is **imported** from
`verify/q12_nonnegativity.py`, not reimplemented, and its five closed-form
controls are re-run as a precondition of every number below. Every figure quoted
here is printed by that script.

**Reproducibility.** Two full runs under different `PYTHONHASHSEED` values
produce byte-identical output in every results section (verified line-by-line
for §3, §4, §5 and §8). Per Q12's recorded failure mode, `hash()` is not used
anywhere for seeding; all label→seed maps are explicit integer tables.

This file reports results only. It does not amend any existing `.md`; recommended
dispositions are in §9.

---

## 0. Pre-registration, and what would have falsified the negative result

Q12's scope caveat #3 named this experiment as **"the most likely place the
negative verdict could soften"**, and `04-open.md` Q14 recorded a pre-registered
analysis with an explicit falsification criterion *before* any of this was run.
Reproduced verbatim so the outcome cannot be rationalised after the fact:

> **Falsification criterion.** The hypothesis "residual structure rescues `λ = 0`"
> is falsified if either
> 1. realistic `α` lies below the measured `α_c`; or
> 2. the distribution of `α_j` has substantial mass outside `[0,1]`, so that
>    (Q14.1) contributes negative diagonal entries at a rate comparable to
>    `ν_j(C_F)`.

**What would have confirmed the hypothesis, stated equally explicitly:** a
measured `α_c` comfortably below the realistic `α` — concretely, `α_c ≲ 0.7`
(i.e. `ρ_c ≳ 0.4`) at some width, together with the reappearance of Q12 §3.1's
self-healing signature (the product `P_n` becoming *exactly* non-negative within a
few layers) at realistic `α`. Both are checked. **Neither occurs.**

`α_c` (§3) and realistic `α` (§4) are measured **independently** and only combined
in §7.

**Negative controls run before any real number:**

| control | what it pins | result |
|---|---|---|
| NC0 | Q12's estimator against 5 closed forms | **9/9 re-pass** (§1) |
| NC6 | `α = 0` must reproduce Q12 §4's `λ = +1.35/+2.12/+2.83` | **MATCH at all three widths, 0.25–1.36σ** (§3.3) |
| NC7 | `C_block` must have unit column sums (Lemma 9.0) | `≤ 1.4e-11`, incl. `α_j` far outside `[0,1]` |
| NC8 | `α = 1` (pure identity) must give `λ = 0` exactly | `0.000e+00` at all widths |
| NC9 | hand-written backprop (for the trained block, §4.2) | `4.0e-06` vs central differences |

---

## 1. Precondition — the estimator still passes

`verify/q14_residual.py` imports `lyap_norm` and `lyap_qr` from
`q12_nonnegativity.py` and calls that module's `negative_controls()` before doing
anything else. Re-run output:

| control | exact `λ` | measured (norm) | measured (QR) | error |
|---|---|---|---|---|
| NC1 fixed diagonal, `d=12` | `0.665804789` | `0.665804789` | `0.665804789` | `8.7e-15` |
| NC2 `c·Q`, `c = 0.8` | `−0.223144` | `−0.223154` | `−0.223144` | `1.0e-05` |
| NC2 `c = 1.0` | `0.000000` | `+0.000016` | `+0.000000` | `1.6e-05` |
| NC2 `c = 1.25` | `+0.223144` | `+0.223161` | `+0.223144` | `1.7e-05` |
| NC3 iid `N(0,1)`, `d=4` | `0.557966` | `0.561322` | `0.555811` | `3.4e-03` |
| NC3 `d=12` | `1.199632` | `1.196876` | `1.198257` | `2.8e-03` |
| NC3 `d=32` | `1.717080` | `1.718572` | `1.719395` | `2.3e-03` |
| NC4 non-neg column-stochastic | `0` exactly | `+7.9e-18` | `−4.7e-06` | — |
| NC5 fixed matrix repeated | `0.164550782` | `0.164550782` | — | `2.9e-15` |

**9/9 pass, identical to Q12's reported values.** NC4 remains the important one:
the estimator's floor for a genuinely benign product is `7.9e-18`, so any `λ`
reported as `0` below is exactly zero, and any `λ > 1e-5` is twelve orders above
the floor.

---

## 2. The residual-block relevance matrix `C_block`

### 2.1 Derivation from the LRP addition rule

Take one residual sublayer (D1.1 is two of these stacked):

    h_out = h + F(h),        z_j := h_out,j = h_j + F_j(h)

**The addition is a linear node.** In the LRP computation graph the addition at
coordinate `j` has exactly two inputs — the value `h_j` arriving along the
identity branch and `F_j` along the `F` branch — combined with unit weights and no
bias. The z-rule (D7.2) with `w = 1`, `b = 0` splits the output relevance in
proportion to the contributions:

    R^id_j = [ h_j·1 / (h_j·1 + F_j·1) ] R^out_j = (h_j / z_j) R^out_j
    R^F_j  = [ F_j·1 / (h_j·1 + F_j·1) ] R^out_j = (F_j / z_j) R^out_j

Define the **identity share**

    α_j := h_j / z_j = h_j / (h_j + F_j)                                    (Q14.0)

Then `F_j/z_j = (z_j − h_j)/z_j = 1 − α_j` **exactly**. This is not a
normalisation choice: it is forced by `h_j + F_j = z_j`, which *is* the node.
Verified symbolically (`α_j + (1−α_j) = 1` identically).

**Propagating each branch to the block input.** The identity branch is the map
`h_j ↦ h_j`, whose z-rule matrix is `I`, so `R^id_j` lands on input coordinate `j`
unchanged. The `F` branch is propagated by `F`'s own z-rule matrix `C_F`, which
has unit column sums by Lemma 9.0. Summing both contributions at input
coordinate `i`:

    R_i = α_i R^out_i + Σ_j C_F[i,j] (1 − α_j) R^out_j

i.e. `R^in = C_block R^out` with

    C_block      = diag(α) + C_F · diag(1 − α)
    C_block[i,j] = α_j·δ_{ij} + (1 − α_j)·C_F[i,j]                          (Q14.1)

which is exactly the form pre-registered in `04-open.md`. Note the derivation
gives it as `diag(α) + C_F·diag(1−α)` — the `(1−α_j)` attaches to the **column**,
which is what makes the column sums work; the transposed guess
`diag(α) + diag(1−α)·C_F` does *not* have unit column sums.

### 2.2 Unit column sums — verified, and why it matters

    Σ_i C_block[i,j] = α_j + (1 − α_j)·Σ_i C_F[i,j] = α_j + (1 − α_j)·1 = 1

**Machine checks (§1 of the script):**

| check | result |
|---|---|
| symbolic, `d = 3`, general `h, F, C_F` with Lemma 9.0 imposed | column sums `= [1, 1, 1]` exactly |
| numeric, scalar `α ∈ {0, .25, .5, .9, 1}`, 400 draws, `d ∈ {8,16,64}` | `max|Σ_i C_block[i,j] − 1| = 9.1e-12` |
| numeric, per-coordinate `α_j ~ 3·N(0,1)` (deliberately far outside `[0,1]`) | `max|Σ_i C_block[i,j] − 1| = 1.4e-11` |
| (Q14.1) against an **explicit two-branch LRP backward pass** on `h + F(h)` | `max rel. discrepancy = 3.7e-14` over 200 draws |
| block conservation `1ᵀC_block R = 1ᵀR` for signed `α` | `3.2e-13` |

This matters for the whole argument: `C_block` stays inside the unit-column-sum
class, which is closed under multiplication, so **Corollary 9.2 applies verbatim
to a product of residual blocks**. `‖P_n‖_{1→1} = 1 + 2·max_j ν_j(P_n)`, `λ` is
still exactly the growth rate of the product's negative mass, and `λ ≥ 0` still
holds unconditionally. *The residual connection does not buy an escape from
Cor. 9.2; it can only move where the negative mass sits.*

### 2.3 What is **not** assumed: `α_j ∈ [0,1]`

The intuition motivating Q14 — "the identity path contributes a non-negative
diagonal" — is a statement about the *event* `α_j ∈ [0,1]`, and (Q14.0) does not
deliver it. `h` and `F` are both signed, so `α_j` is an unbounded ratio:

| event | means | effect in (Q14.1) |
|---|---|---|
| `α_j ∈ [0,1]` | `h_j`, `F_j` share a sign | diagonal `≥ 0`; column-`j` negative mass scaled by `(1−α_j) < 1` — **the hoped-for mechanism** |
| `α_j < 0` | `\|F_j\| > \|h_j\|`, opposite signs | diagonal is **negative**: the identity term *adds* negative mass |
| `α_j > 1` | `F_j` opposes `z_j` | `1 − α_j < 0`, which **sign-flips the whole `C_F` column**; surviving negative mass is `(α_j−1)(1 + ν_j)`, not `(1−α_j)ν_j` |

Both failure events are measured (§6), not assumed away. Two models are therefore
carried through the whole study:

- **Model A (idealised)** — one scalar `α ∈ [0,1]`, `C_block = αI + (1−α)C_F`.
  This is the hypothesis at its most favourable, and is what §3 sweeps.
- **Model B (realistic)** — per-coordinate signed `α_j = h_j/(h_j+F_j)` computed
  from an actual `h` and `F`. This is what §6 measures.

---

## 3. The `α` sweep — `λ(α)`, `f_eff(α)`, and `α_c` per width

`C_block = αI + (1−α)C_F`, fresh `C_F` per layer from **exactly** Q12 §4's
realistic `layernorm` family (scale-mixed Gaussian residual state → LayerNorm with
learned `γ = 1+0.1N`, `β = 0.1N` → linear). `n = 600` layers, 5 seeds, burn-in
`n/5`, both estimators. `ν_max = max_j ν_j(C_block)`, so
`‖C_block‖₁ = 1 + 2ν_max` exactly (Cor. 9.2).

### 3.1 `d = 16`

| `α` | `ρ` | `f_eff` | `ν_max` | `E‖C_b‖₁` | `λ` (norm) | sd | `λ` (QR) | `e^λ` | verdict |
|---|---|---|---|---|---|---|---|---|---|
| 0.0000 | ∞ | 0.4404 | 54.30 | 109.6 | `+1.39058` | 0.04142 | `+1.43437` | 4.017 | BLOW-UP |
| 0.1000 | 9 | 0.4275 | 48.82 | 98.64 | `+1.29872` | 0.03864 | `+1.34081` | 3.665 | BLOW-UP |
| 0.2000 | 4 | 0.4220 | 43.35 | 87.69 | `+1.19055` | 0.04705 | `+1.24001` | 3.289 | BLOW-UP |
| 0.3000 | 2.333 | 0.4194 | 37.88 | 76.76 | `+1.07408` | 0.05681 | `+1.15212` | 2.927 | BLOW-UP |
| 0.4000 | 1.5 | 0.4178 | 32.42 | 65.83 | `+0.95545` | 0.04342 | `+1.02551` | 2.600 | BLOW-UP |
| 0.5000 | 1 | 0.4165 | 26.96 | 54.92 | `+0.83092` | 0.03822 | `+0.89866` | 2.295 | BLOW-UP |
| 0.6000 | 0.6667 | 0.4155 | 21.51 | 44.02 | `+0.68480` | 0.04670 | `+0.74506` | 1.983 | BLOW-UP |
| 0.7000 | 0.4286 | 0.4150 | 16.07 | 33.15 | `+0.53703` | 0.03503 | `+0.57756` | 1.711 | BLOW-UP |
| 0.8000 | 0.25 | 0.4143 | 10.65 | 22.31 | `+0.37635` | 0.04296 | `+0.40446` | 1.457 | BLOW-UP |
| 0.9000 | 0.1111 | 0.4137 | 5.272 | 11.54 | `+0.19586` | 0.02905 | `+0.19725` | 1.216 | BLOW-UP |
| 0.9524 | 0.05 | 0.4135 | 2.476 | 5.952 | `+0.09406` | 0.01903 | `+0.11368` | 1.099 | BLOW-UP |
| 0.9804 | 0.02 | 0.4133 | 1.007 | 3.014 | `+0.03553` | 0.00457 | `+0.04148` | 1.036 | marginal |
| 0.9901 | 0.01 | 0.4133 | 0.5061 | 2.012 | `+0.01755` | 0.00521 | `+0.01806` | 1.018 | marginal |
| 0.9950 | 0.005 | 0.4133 | 0.2518 | 1.504 | `+0.01138` | 0.00305 | `+0.00963` | 1.011 | marginal |
| 0.9980 | 0.002 | 0.4132 | 0.1009 | 1.202 | `+0.00571` | 0.00383 | `+0.00180` | 1.006 | marginal |
| 0.9990 | 0.001 | 0.4132 | 0.0505 | 1.101 | `+0.00357` | 0.00337 | `+0.00015` | 1.004 | marginal |
| 0.9995 | 0.0005 | 0.4132 | 0.02526 | 1.051 | `+0.00319` | 0.00238 | `−0.00026` | 1.003 | marginal |
| 0.9998 | 0.0002 | 0.4132 | 0.01011 | 1.020 | `+0.00292` | 0.00170 | `−0.00017` | 1.003 | marginal |
| 0.9999 | 0.0001 | 0.4132 | 0.005055 | 1.010 | `+0.00237` | 0.00130 | `−0.00010` | 1.002 | marginal |
| ~1.0 | 3e-05 | 0.4132 | 0.001517 | 1.003 | `+0.00138` | 0.00081 | `−0.00003` | 1.001 | marginal |
| ~1.0 | 1e-05 | 0.4132 | 0.0005055 | 1.001 | `+0.00067` | 0.00044 | `−0.00001` | 1.001 | marginal |
| **1.0000** | **0** | **0.0000** | **0** | **1** | **`+0.00000`** | 0.00000 | `+0.00000` | 1.000 | **BENIGN** |

### 3.2 `d = 64` and `d = 256`

`d = 64`:

| `α` | `ρ` | `f_eff` | `ν_max` | `E‖C_b‖₁` | `λ` (norm) | sd | `λ` (QR) | verdict |
|---|---|---|---|---|---|---|---|---|
| 0.0000 | ∞ | 0.4714 | 1849 | 3699 | `+2.11031` | 0.02337 | `+2.11761` | BLOW-UP |
| 0.5000 | 1 | 0.4644 | 924.2 | 1849 | `+1.45999` | 0.02866 | `+1.47857` | BLOW-UP |
| 0.8000 | 0.25 | 0.4641 | 369.5 | 739.9 | `+0.80200` | 0.01880 | `+0.77585` | BLOW-UP |
| 0.9000 | 0.1111 | 0.4640 | 184.6 | 370.3 | `+0.47035` | 0.00748 | `+0.45372` | BLOW-UP |
| 0.9524 | 0.05 | 0.4640 | 87.86 | 176.7 | `+0.24229` | 0.01807 | `+0.25313` | BLOW-UP |
| 0.9804 | 0.02 | 0.4640 | 36.13 | 73.26 | `+0.10055` | 0.01786 | `+0.10663` | BLOW-UP |
| 0.9901 | 0.01 | 0.4640 | 18.22 | 37.43 | `+0.05369` | 0.01124 | `+0.05821` | BLOW-UP |
| 0.9950 | 0.005 | 0.4640 | 9.138 | 19.28 | `+0.02664` | 0.00798 | `+0.02880` | marginal |
| 0.9980 | 0.002 | 0.4640 | 3.658 | 8.315 | `+0.01101` | 0.00351 | `+0.01580` | marginal |
| 0.9990 | 0.001 | 0.4640 | 1.827 | 4.653 | `+0.00468` | 0.00199 | `+0.00796` | marginal |
| 0.9999 | 0.0001 | 0.4640 | 0.1783 | 1.357 | `+0.00125` | 0.00140 | `+0.00129` | marginal |
| ~1.0 | 1e-05 | 0.4640 | 0.01761 | 1.035 | `+0.00052` | 0.00097 | `+0.00005` | marginal |
| **1.0000** | **0** | **0.0000** | **0** | **1** | **`+0.00000`** | 0.00000 | `+0.00000` | **BENIGN** |

`d = 256`:

| `α` | `ρ` | `f_eff` | `ν_max` | `E‖C_b‖₁` | `λ` (norm) | sd | `λ` (QR) | verdict |
|---|---|---|---|---|---|---|---|---|
| 0.0000 | ∞ | 0.4860 | 1.464e4 | 2.929e4 | `+2.78853` | 0.02779 | `+2.81006` | BLOW-UP |
| 0.5000 | 1 | 0.4842 | 7321 | 1.464e4 | `+2.12085` | 0.03369 | `+2.15522` | BLOW-UP |
| 0.8000 | 0.25 | 0.4841 | 2928 | 5857 | `+1.31797` | 0.03692 | `+1.35506` | BLOW-UP |
| 0.9000 | 0.1111 | 0.4841 | 1464 | 2929 | `+0.84141` | 0.02436 | `+0.84766` | BLOW-UP |
| 0.9524 | 0.05 | 0.4841 | 697.1 | 1395 | `+0.46792` | 0.03392 | `+0.47463` | BLOW-UP |
| 0.9804 | 0.02 | 0.4841 | 287.0 | 575.0 | `+0.20572` | 0.02560 | `+0.21801` | BLOW-UP |
| 0.9901 | 0.01 | 0.4841 | 144.9 | 290.8 | `+0.10891` | 0.02193 | `+0.12214` | BLOW-UP |
| 0.9950 | 0.005 | 0.4841 | 72.80 | 146.6 | `+0.04615` | 0.01052 | `+0.07128` | marginal |
| 0.9990 | 0.001 | 0.4841 | 14.61 | 30.22 | `+0.00910` | 0.00504 | `+0.01104` | marginal |
| 0.9998 | 0.0002 | 0.4841 | 2.925 | 6.850 | `+0.00238` | 0.00154 | `+0.00157` | marginal |
| **1.0000** | **0** | **0.0000** | **0** | **1** | **`+0.00000`** | 0.00000 | `+0.00000` | **BENIGN** |

### 3.3 `α_c` per width — **the key deliverable**

Using Q12 §3.3's criterion (`λ ≤ 1e-5` for **all** seeds, twelve orders above the
NC4 floor, and required to hold at that `α` and every larger one):

| `d` | last non-benign `α` | **`α_c`** | **`ρ_c = (1−α_c)/α_c`** |
|---|---|---|---|
| 16 | 0.999990 | **1.0** | **0** |
| 64 | 0.999990 | **1.0** | **0** |
| 256 | 0.999990 | **1.0** | **0** |

**There is no `α_c < 1` at any width.** By this criterion `λ` is positive for
every identity share short of the pure identity, down to `ρ = 1e-5`. §3.6 shows
that the reported `λ` below `ρ ≈ 10⁻⁴` is a finite-`n` artefact rather than a
genuine exponent, so the load-bearing form of this result is §3.5's: **`λ(ρ)` is
a proportionality, not a threshold** — there is no `ρ` at which the exponent
collapses, only a linear taper. Above `ρ ≈ 10⁻²` — which contains the whole
realistic range — `λ > 0` is verified flat out to `n = 9600`.

**Two things make this a stronger negative result than a large-but-finite `α_c`:**

1. **`f_eff` does not move.** The negative-*entry* fraction of `C_block` is
   essentially independent of `α`: `0.4404 → 0.4132` (`d=16`),
   `0.4714 → 0.4640` (`d=64`), `0.4860 → 0.4841` (`d=256`). This is structural —
   `(1−α) > 0` scales the off-diagonal entries without changing their signs, and
   only the `d` diagonal entries are touched, an `O(1/d)` effect.
   **The pre-registered question "does the residual raise `f_c`?" has the answer
   "the residual does not move `f` at all."** `f ≈ 0.47` still sits above
   Q12's `f_c ≈ 0.15–0.40`.
2. **`ν_max` scales exactly as `(1−α)`,** and nothing else changes:
   `d=64`, `ν_max = 1849 → 184.6 → 18.22 → 1.827` at `α = 0 → 0.9 → 0.99 →
   0.999`. So the residual *does* do what §Q14's pre-registration predicted —
   it multiplies the one-step negative mass by `(1−α)` — and that turns out to
   be **the wrong kind of help**: it reduces the *size* of the per-layer
   negativity without touching the *sign pattern* that drives compounding.

### 3.4 NC6 — does `α = 0` reproduce Q12?

| `d` | Q12 `λ` | this run | sd | `\|diff\|` | diff/sd | verdict |
|---|---|---|---|---|---|---|
| 16 | `+1.35434` | `+1.39058` | 0.04142 | 0.03624 | 0.87 | **MATCH** |
| 64 | `+2.11612` | `+2.11031` | 0.02337 | 0.00581 | 0.25 | **MATCH** |
| 256 | `+2.82636` | `+2.78853` | 0.02779 | 0.03783 | 1.36 | **MATCH** |

**The `α = 0` limit of the Q14 pipeline reproduces Q12 §4 at all three widths,
within 1.4σ.** This is a strong end-to-end consistency check: the block
machinery, the seeding, the estimator and the `C_F` family all agree with the
prior study where they must. NC8 (`α = 1`) gives `λ = 0.000e+00` and
`‖C‖₁ = 1.000000` exactly at all three widths.

### 3.5 There is no threshold — `λ` is *proportional* to `ρ`

`α_c = 1` is a statement about the absence of a threshold, so the shape of
`λ(ρ)` is worth stating directly. Fitted on `0.002 ≤ ρ ≤ 0.05` (below where the
linear regime ends, above the finite-`n` floor of §3.6), `n = 600`, 5 seeds:

| `d` | `κ = λ/ρ` | slope of log–log fit | `R²` | `ρ` needed for `λ ≤ 0.003` |
|---|---|---|---|---|
| 16 | **2.1089** | 0.8627 | 0.98782 | `1.423e-03` |
| 64 | **5.2148** | 0.9601 | 0.99980 | `5.753e-04` |
| 256 | **9.9938** | 0.9896 | 0.99692 | `3.002e-04` |

**Slope ≈ 1 with `R² ≥ 0.988`: `λ = κ_d·ρ`, a clean proportionality with no
threshold anywhere.** This is the quantitative form of "there is no `α_c`". A
phase transition of Q12 §3.1's kind would show as `λ` collapsing to the machine
floor over a narrow band of `ρ`; instead the identity term simply rescales the
perturbation and the exponent follows linearly.

`κ` grows with width (`2.1 → 5.2 → 10.0` for `d = 16 → 64 → 256`, roughly
`κ ∝ d^{0.56}`), so — as in Q12 — **widening the model makes it worse.** The
last column is the residual ratio at which the product would grow by less than
10× over `L·T = 768` layers (`λ ≤ log 10/768 = 0.003`); it is `3e-4` to `1.4e-3`,
against a measured realistic `ρ ≥ 0.073`.

### 3.6 Is the small-`ρ` `λ` real, or a finite-`n` transient?

Cor. 9.2 makes `λ` the growth rate of the product's negative mass, so a
*bounded but nonzero* negative mass gives `λ → 0` asymptotically while a finite
window still reports `λ > 0`. `d = 64`, 4 seeds, `n` up to 9600:

| `ρ` | `n=300` | `n=600` | `n=2400` | `n=9600` | flat in `n`? | `P_n` exactly non-negative by `n=9600`? |
|---|---|---|---|---|---|---|
| 0.05 | `+0.282493` | `+0.241669` | `+0.248671` | `+0.248845` | **FLAT (real)** | **False** |
| 0.01 | `+0.075266` | `+0.054947` | `+0.058617` | `+0.057053` | **FLAT (real)** | **False** |
| 0.001 | `+0.012025` | `+0.004774` | `+0.005861` | `+0.005552` | decaying | **False** |
| 0.0001 | `+0.004592` | `+0.001253` | `+0.000837` | `+0.000444` | ~`1/n` (transient) | **False** |
| 1e-05 | `+0.001966` | `+0.000625` | `+0.000678` | `+0.000095` | ~`1/n` (transient) | **False** |

Two readings, and the honest version of §3.3 needs both:

1. **At and above `ρ ≈ 10⁻³`, `λ > 0` is genuine** — flat in `n` out to `n = 9600`
   (`+0.2487 → +0.2488` at `ρ = 0.05`; `+0.0586 → +0.0571` at `ρ = 0.01`). The
   entire realistic range (`ρ ≥ 0.073`) sits comfortably in this regime.
2. **Below `ρ ≈ 10⁻⁴` the reported `λ` is a finite-`n` artefact**, falling like
   `1/n`. So the strict `α_c = 1` of §3.3 should be read as *"no threshold was
   found, and below `ρ ≈ 10⁻⁴` the estimator cannot separate `λ = 0` from
   `λ = κρ`"* — not as a claim that `ρ = 10⁻⁵` is harmful. §3.5's proportionality
   is the substantive statement; §3.3's table is the strict-criterion bookkeeping.

**But the last column is criterion-free and does not degrade with `ρ`:** the
product `P_n` is **never** exactly non-negative, at any `ρ > 0`, even after 9600
layers. Q12's `λ = 0` regime is *defined* by that exact non-negativity (NC4:
`‖P_n‖₁ = 1` identically, estimator floor `7.9e-18`). It never returns. See §6.3.

---

## 4. What is `α` realistically? — measured, independently of §3

### 4.1 Random-weight blocks

A full pre-LN stack per D1.1 (`h ← h + Attn(LN(h))`; `h ← h + MLP(LN(h))`),
`L = 12`, `d = 64`, `N = 16` positions, 8 random-weight draws, three init
conventions. Reported per addition node: `ρ = ‖F(h)‖/‖h‖`, the naive scalar share
`α_norm = 1/(1+ρ)`, the mass-weighted share `α_mass = Σ|h| / Σ(|h|+|F|)`, and the
distribution of the per-coordinate `α_j = h_j/(h_j+F_j)` that (Q14.1) actually
uses.

| init | `ρ` range (24 sublayers) | `α_norm` range | median `α_j` | `P(α_j<0)` | `P(α_j>1)` | depth trend `ρ` |
|---|---|---|---|---|---|---|
| std (`s=1`) | **0.1925 – 0.6180** | 0.6183 – 0.8388 | 0.72 – 0.96 | 0.064 – 0.179 | 0.324 – 0.435 | 0.394 → 0.193 (**falls**, ×0.49) |
| GPT2-style `1/√(2L)` | **0.0793 – 0.1346** | 0.8814 – 0.9266 | 0.979 – 0.996 | 0.022 – 0.046 | 0.449 – 0.486 | 0.080 → 0.116 (rises, ×1.44) |
| small (`s=0.5`) | **0.0733 – 0.1462** | 0.8725 – 0.9318 | 0.976 – 0.996 | 0.021 – 0.049 | 0.446 – 0.484 | 0.074 → 0.124 (rises, ×1.68) |

Selected rows (std init, `d=64`), showing the depth trend and the attention/MLP
split:

| block | sublayer | `ρ` | `α_norm` | `α_mass` | med `α_j` | `P(α_j<0)` | `P(α_j>1)` |
|---|---|---|---|---|---|---|---|
| 0 | attn | 0.3936 | 0.7182 | 0.7186 | 0.8687 | 0.1194 | 0.3890 |
| 0 | mlp | 0.6180 | 0.6183 | 0.6175 | 0.7214 | 0.1788 | 0.3237 |
| 5 | attn | 0.3244 | 0.7556 | 0.7559 | 0.9199 | 0.0984 | 0.4180 |
| 5 | mlp | 0.2913 | 0.7745 | 0.7728 | 0.9162 | 0.0945 | 0.4000 |
| 11 | attn | 0.2575 | 0.7954 | 0.7979 | 0.9409 | 0.0782 | 0.4053 |
| 11 | mlp | 0.1925 | 0.8388 | 0.8407 | 0.9579 | 0.0641 | 0.4240 |

**`α_norm` and `α_mass` agree to three digits everywhere**, so the scalar summary
is not sensitive to which aggregate is used.

**Does `ρ` vary with depth?** Yes, and the direction is **init-dependent**, which
is itself the finding. The structural reason is literature-independent: pre-LN
means `‖LN(h)‖ = √d·‖γ‖/√d`-ish, i.e. **independent of `‖h‖`**, so `‖F(h)‖` is set
by the weights alone while `‖h‖` accumulates down the stack. If block outputs add
incoherently, `‖h_ℓ‖ ~ √ℓ` and hence `ρ_ℓ ~ 1/√ℓ`. That is exactly what the
`s=1` init shows (`0.394 → 0.193`, and `√(1/12) ≈ 0.29` against a measured
`0.49` — the same direction, weaker than the idealised law because the sublayer
outputs are not fully incoherent). Under the GPT-2 `1/√(2L)` output scaling the
per-block write is deliberately shrunk by exactly the compensating factor, and
the trend flattens/reverses. **Neither trend takes `ρ` anywhere near the `1e-5`
that §3 would require.**

**MLP sublayers consistently have larger `ρ` than attention sublayers** (e.g.
0.1346 vs 0.0817 under GPT-2 init) — the worse of the two, and there are as many
of them.

### 4.2 A lightly trained stack

Hand-written forward and backward passes (`L = 4`, `d = 32`, `N = 8`), Adam with
global gradient-norm clipping, 400 steps on a task that *requires* attention to
move information across positions (`Y = roll(X,1) @ R`). **NC9:** the backprop is
gradient-checked against central finite differences, max relative error
`4.0e-06`. Held-out loss `40.24 → 16.72` (ratio `0.4155`) — genuinely trained,
deliberately not converged, and **not a language model**.

| block | sublayer | `ρ` | `α_norm` | `α_mass` | med `α_j` | `P(α_j<0)` | `P(α_j>1)` |
|---|---|---|---|---|---|---|---|
| 0 | attn | 0.4146 | 0.7069 | 0.7050 | 0.8233 | 0.1250 | 0.3633 |
| 0 | mlp | 0.5359 | 0.6511 | 0.6519 | 0.9793 | 0.1758 | 0.4922 |
| 1 | attn | 0.2768 | 0.7832 | 0.7889 | 0.9437 | 0.0586 | 0.4219 |
| 1 | mlp | **0.7351** | **0.5763** | 0.5848 | 0.9219 | 0.2305 | 0.4609 |
| 2 | attn | 0.3646 | 0.7328 | 0.7326 | 0.9421 | 0.0938 | 0.4609 |
| 2 | mlp | 0.6203 | 0.6172 | 0.6254 | 0.9503 | 0.1875 | 0.4727 |
| 3 | attn | 0.2921 | 0.7739 | 0.7782 | 0.9256 | 0.1055 | 0.4102 |
| 3 | mlp | 0.4809 | 0.6753 | 0.6667 | 1.0696 | 0.1484 | 0.5195 |

**`ρ ∈ [0.277, 0.735]`, mean `0.465`; `α_norm ∈ [0.576, 0.783]`.**

### 4.3 The distribution, and the direction of the bias

**The distribution, not a point estimate:**

| source | `ρ` | implied `α_norm` |
|---|---|---|
| random init, GPT-2 `1/√(2L)` scaling | 0.079 – 0.135 | 0.881 – 0.927 |
| random init, small (`s=0.5`) | 0.073 – 0.146 | 0.873 – 0.932 |
| random init, std (`s=1`) | 0.193 – 0.618 | 0.618 – 0.839 |
| **lightly trained** | **0.277 – 0.735** | **0.576 – 0.783** |
| **union of everything measured** | **0.073 – 0.735** | **0.576 – 0.932** |

**Explicit caveat, and which way the bias runs.** For *random* weights, `ρ` is
very largely a property of the **initialisation scale**, not of transformers: the
three conventions above differ by a factor of ~5 in `ρ` purely by construction.
A random-weight `ρ` is therefore a modelling choice dressed up as a measurement,
which is why three conventions are shown rather than one.

The one piece of evidence about *direction* is §4.2: this stack was initialised
with the GPT-2 `1/√(2L)` scaling (`ρ ≈ 0.08–0.13`) and **training moved `ρ` up by
a factor of 3–6, to `0.28–0.74`.** Training makes blocks write *more* into the
stream, not less. So the honest statement is:

> **Random-weight `ρ` is the optimistic end.** It likely **underestimates**
> trained `ρ`, i.e. **overestimates** `α`. The measured trained `α ≈ 0.58–0.78`
> is the more realistic figure, and it is *further* from the benign regime than
> the random-init figure, not closer.

This bias direction is measured on a 4-block `d=32` regression toy, not a
language model, and is flagged as such in §8. It is recorded because it runs
*against* the hypothesis under test: if the toy were biased in the flattering
direction the conclusion would need more care; it is not.

---

## 5. Do layers behave like the mean `α` or the worst `α`?

`α_ℓ` drawn i.i.d. per layer from a two-point mixture (`α_hi` w.p. `1−p`, `α_lo`
w.p. `p`), `d = 64`, `n = 600`, 4 seeds. Compared against `λ(mean α)` and against
`p·λ(α_lo)` — the "the bad layers contribute in proportion and the good layers do
not heal" prediction.

**`α_hi = 0.999` (`λ = +0.00683`), `α_lo = 0.0` (`λ = +2.13724`) — the sharpest case:**

| `p(lo)` | mean `α` | `λ(mean α)` | `λ_mix` | sd | `p·λ_lo` | `λ_mix/λ(mean α)` | `λ_mix/(p·λ_lo)` | governed by |
|---|---|---|---|---|---|---|---|---|
| 0.00 | 0.99900 | `+0.00353` | `+0.00489` | 0.00358 | `+0.00000` | 1.385 | — | mean |
| 0.02 | 0.97902 | `+0.10684` | `+0.05555` | 0.01193 | `+0.04274` | 0.520 | **1.300** | worst-layer |
| 0.05 | 0.94905 | `+0.24794` | `+0.11833` | 0.02003 | `+0.10686` | 0.477 | **1.107** | worst-layer |
| 0.10 | 0.89910 | `+0.47463` | `+0.21279` | 0.04615 | `+0.21372` | 0.448 | **0.996** | worst-layer |
| 0.25 | 0.74925 | `+0.93964` | `+0.53261` | 0.04806 | `+0.53431` | 0.567 | **0.997** | worst-layer |
| 0.50 | 0.49950 | `+1.47649` | `+1.08271` | 0.03829 | `+1.06862` | 0.733 | **1.013** | worst-layer |
| 1.00 | 0.00000 | `+2.11316` | `+2.11236` | 0.02734 | `+2.13724` | 1.000 | 0.988 | mean |

Milder mixtures agree (`α_hi/α_lo = 0.99/0.5`, `0.999/0.9`, `0.9999/0.99`; full
tables in the script output): `λ_mix/(p·λ_lo) → 1.06–1.13` once `p ≥ 0.10`.

**Answer: neither the mean `α` nor the single worst layer — the exponents ADD.**

    λ_mix ≈ E_ℓ[ λ(α_ℓ) ]        (arithmetic mean of the per-layer exponents)

not `λ(E_ℓ[α_ℓ])`. Because `λ(α)` is **concave** in `α` over this range, Jensen
gives `E[λ(α)] ≤ λ(E[α])`, and indeed `λ_mix` is 0.45–0.73× `λ(mean α)`. Three
consequences, all bad for the hypothesis:

1. **A single bad layer is never healed away.** A fraction `p` of layers with
   `λ_bad` contributes exactly `p·λ_bad` to the overall exponent, with a measured
   ratio of `0.996–1.013` at `p ≥ 0.10`. There is no compensating annihilation at
   the good layers — which is precisely the self-healing that Q12 §3.1 found
   below `f_c` and which §6.3 shows is absent here.
2. **`λ_mix > 0` whenever *any* layer has `λ > 0`.** With `α_c = 1` (§3.3), every
   layer of a real stack has `λ > 0`, so the sum is positive with no cancellation
   available.
3. Averaging `α` across layers **flatters** the answer (`λ(mean α)` overstates by
   1.4–2.2× at small `p`), so quoting a mean `α` and reading `λ` off the §3
   curve is *conservative in the wrong direction* — the honest figure is the mean
   of the exponents, which is what §7 uses.

---

## 6. Model B — the realistic signed `α_j`

`α_j = h_j/(h_j+F_j)` computed from an actual `h` and `F` rather than imposed as
a scalar in `[0,1]`; `F` rescaled to the stated `ρ`. `n = 600`, 5 seeds.

### 6.1 `λ` for realistic `α_j`

| `d` | `ρ` | `α_norm` | `P(α_j<0)` | `P(α_j>1)` | neg-diag frac | `f_eff` | `E‖C_b‖₁` | `λ` | sd | verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| 16 | 1 | 0.5000 | 0.2691 | 0.2153 | 0.2650 | 0.4419 | 423.4 | `+1.37872` | 0.02820 | BLOW-UP |
| 16 | 0.5 | 0.6667 | 0.1631 | 0.3212 | 0.1600 | 0.4498 | 73.62 | `+1.16007` | 0.03775 | BLOW-UP |
| 16 | 0.1 | 0.9091 | 0.0406 | 0.4437 | 0.0409 | 0.4612 | 46.58 | `+0.47530` | 0.05418 | BLOW-UP |
| 16 | 0.01 | 0.9901 | 0.0037 | 0.4806 | 0.0044 | 0.4650 | 5.807 | `+0.06556` | 0.00833 | BLOW-UP |
| 16 | 0.001 | 0.9990 | 0.0009 | 0.4834 | 0.0009 | 0.4651 | 1.236 | `+0.00863` | 0.00123 | marginal |
| 64 | 1 | 0.5000 | 0.2838 | 0.2182 | 0.2830 | 0.4753 | 1349 | `+2.01191` | 0.04082 | BLOW-UP |
| 64 | 0.5 | 0.6667 | 0.1868 | 0.3152 | 0.1859 | 0.4802 | 657.8 | `+1.72966` | 0.05895 | BLOW-UP |
| 64 | 0.3 | 0.7692 | 0.1256 | 0.3764 | 0.1249 | 0.4837 | 855.4 | `+1.48701` | 0.02202 | BLOW-UP |
| 64 | 0.1 | 0.9091 | 0.0457 | 0.4563 | 0.0453 | 0.4890 | 547.6 | `+0.82518` | 0.02435 | BLOW-UP |
| 64 | 0.05 | 0.9524 | 0.0227 | 0.4793 | 0.0227 | 0.4907 | 96.55 | `+0.50574` | 0.02314 | BLOW-UP |
| 64 | 0.01 | 0.9901 | 0.0046 | 0.4974 | 0.0048 | 0.4922 | 35.09 | `+0.10363` | 0.01508 | BLOW-UP |
| 64 | 0.001 | 0.9990 | 0.0002 | 0.5019 | 0.0002 | 0.4925 | 3.166 | `+0.01413` | 0.00500 | marginal |
| 256 | 1 | 0.5000 | 0.2841 | 0.2156 | 0.2841 | 0.4886 | 7379 | `+2.65464` | 0.02549 | BLOW-UP |
| 256 | 0.5 | 0.6667 | 0.1876 | 0.3122 | 0.1877 | 0.4912 | 2.24e4 | `+2.36098` | 0.03473 | BLOW-UP |
| 256 | 0.1 | 0.9091 | 0.0449 | 0.4548 | 0.0450 | 0.4963 | 1503 | `+1.25728` | 0.02567 | BLOW-UP |
| 256 | 0.01 | 0.9901 | 0.0046 | 0.4952 | 0.0046 | 0.4979 | 1026 | `+0.21629` | 0.02243 | BLOW-UP |
| 256 | 0.001 | 0.9990 | 0.0004 | 0.4993 | 0.0004 | 0.4981 | 14.62 | `+0.02142` | 0.00349 | marginal |

**No tested `ρ` — down to `0.001` — is benign in model B at any width.**

**The signedness of `α_j` costs a factor of ~2–3 in the exponent.** Comparing
model B against model A at the same `ρ` (i.e. the same `α_norm`):

| `d` | `κ_A = λ_A/ρ` (§3.5 fit) | `κ_B = λ_B/ρ` (from the table above, `ρ ∈ [0.01, 0.05]`) | ratio |
|---|---|---|---|
| 16 | **2.109** | 5.30 / 6.75 / 6.56 → ≈ **6.2** | **2.9×** |
| 64 | **5.215** | 10.11 / 10.35 / 10.36 → ≈ **10.3** | **2.0×** |
| 256 | **9.994** | 15.84 / 19.35 / 21.63 → ≈ **19** | **1.9×** |

**Robustness — composing `C_F` with the LayerNorm's own z-rule matrix.** Model B
as tabulated uses Q12's `C_F` (the sublayer linear on LN input), so the two
branches formally terminate at slightly different places. Recomputing with
`C_F ← C_LN · C_F` (LN under `μσ`-detach, D6) at `d = 64`, 3 seeds, changes
essentially nothing: `λ = +2.050 / +1.732 / +0.823 / +0.1069 / +0.0148` at
`ρ = 2 / 0.5 / 0.1 / 0.01 / 0.001`, against `+2.072 / +1.730 / +0.825 / +0.1036
/ +0.0141` without. **Differences are within one sd.**

### 6.2 The mechanism — is the pre-registered suppression law right?

`04-open.md` predicted `ν_j(C_block) ≈ (1−α_j)·ν_j(C_F)` *on the event
`α_j ∈ [0,1]`*. Measuring the ratio `ν_j(C_block) / (|1−α_j|·ν_j(C_F))` isolates
what the sign structure of `α_j` costs:

| `d` | `ρ` | `P(α_j<0)` | `P(α_j>1)` | med `\|1−α_j\|` | `ν(C_b)/ν(C_F)` | **ratio vs `\|1−α\|` law** | neg-diag share of `ν` |
|---|---|---|---|---|---|---|---|
| 16 | 0.5 | 0.1806 | 0.3200 | 0.5613 | 2.373 | **1.478** | 0.1664 |
| 16 | 0.1 | 0.0419 | 0.4628 | 0.1319 | 0.861 | **1.664** | 0.0981 |
| 16 | 0.01 | 0.0031 | 0.4894 | 0.0134 | 0.0336 | **1.729** | 0.0162 |
| 64 | 0.5 | 0.1897 | 0.3145 | 0.5423 | 1.722 | **1.149** | 0.0924 |
| 64 | 0.1 | 0.0434 | 0.4491 | 0.1285 | 0.249 | **1.208** | 0.0819 |
| 64 | 0.01 | 0.0053 | 0.4966 | 0.0128 | 0.0297 | **1.231** | 0.0281 |
| 256 | 0.5 | 0.1843 | 0.3104 | 0.5343 | 0.989 | **1.065** | 0.0510 |
| 256 | 0.1 | 0.0456 | 0.4554 | 0.1259 | 0.194 | **1.091** | 0.0468 |
| 256 | 0.01 | 0.0049 | 0.4933 | 0.0129 | 0.0192 | **1.097** | 0.0264 |

**The pre-registered law is essentially right — and that is the problem.** The
ratio is `1.07–1.73`, i.e. the residual suppresses the one-step negative mass
close to the predicted `|1−α_j|` factor, with only a 7–73% surcharge from the
sign structure of `α_j`. Q14's hoped-for mechanism *works as designed*; it simply
is not a mechanism that produces `λ = 0`, because a multiplicative reduction of
per-layer negative mass does not stop the negative mass of the **product** from
compounding.

Note also `P(α_j > 1) ≈ 0.31–0.50` at every `ρ`: for roughly half of all
coordinates, `1 − α_j < 0`, so the `F` branch enters (Q14.1) with its **column
sign flipped**. This does not create a negative diagonal (`α_j > 1` keeps the
diagonal positive) but it does mean the "identity dominates and everything is
nearly non-negative" picture is wrong even in the `ρ → 0` limit.

### 6.3 Does self-healing reappear? — **No.**

Negative-**entry** fraction of the product `P_n = C_n ⋯ C_1`, model A, `d = 64`,
median over 5 seeds. Q12 §3.1's self-healing signature is this quantity hitting
**exactly 0** within 2–5 layers.

| `α` | `n=1` | `n=2` | `n=3` | `n=5` | `n=10` | `n=25` | `n=50` | `n=100` | `n=200` |
|---|---|---|---|---|---|---|---|---|---|
| 0.00000 | 0.4771 | 0.4934 | 0.4944 | 0.4958 | 0.4985 | 0.4985 | 0.5029 | 0.5005 | 0.5024 |
| 0.50000 | 0.4702 | 0.4739 | 0.4937 | 0.4949 | 0.5000 | 0.4949 | 0.4912 | 0.5024 | 0.5000 |
| 0.90000 | 0.4700 | 0.4646 | 0.4631 | 0.4639 | 0.4968 | 0.4958 | 0.5007 | 0.4985 | 0.5000 |
| 0.99000 | 0.4700 | 0.4607 | 0.4585 | 0.4426 | 0.4614 | 0.4543 | 0.4829 | 0.4939 | 0.5002 |
| 0.99900 | 0.4700 | 0.4612 | 0.4573 | 0.4473 | 0.4458 | 0.4419 | 0.4446 | 0.4500 | 0.4573 |
| 0.99990 | 0.4700 | 0.4607 | 0.4573 | 0.4470 | 0.4424 | 0.4429 | 0.4392 | 0.4443 | 0.4387 |
| 0.99999 | 0.4700 | 0.4604 | 0.4573 | 0.4468 | 0.4417 | 0.4424 | 0.4399 | 0.4453 | 0.4377 |
| **1.00000** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |

**Self-healing does not reappear at any `α < 1`, at any depth up to `n = 200`.**
At `α = 0.99999` — a sublayer contributing one part in `10⁵` — the product is
still 43.8% negative at `n = 200`. Compare Q12 §3.1, where below `f_c` the same
quantity is exactly `0` by `n = 2–5`.

**This is the mechanistic core of the negative result.** Q12's `λ = 0` regime is
produced by *annihilation of the sign pattern*: positive mass mixes across
coordinates faster than sparse negative entries can compound, and the product
becomes exactly non-negative. The residual connection multiplies the negative
entries by `(1−α)` but leaves **every one of them in place with the same sign**.
Shrinking a negative entry is not the same as annihilating it, and only
annihilation gives `λ = 0`.

---

## 7. The verdict

### 7.1 The two independent measurements, combined

| `d` | `α_c` (§3.3) | `ρ_c` | realistic `α` (§4.3) | realistic `ρ` | `α > α_c`? |
|---|---|---|---|---|---|
| 16 | **1.0** | 0 | 0.576 – 0.932 | 0.073 – 0.735 | **NO** |
| 64 | **1.0** | 0 | 0.576 – 0.932 | 0.073 – 0.735 | **NO** |
| 256 | **1.0** | 0 | 0.576 – 0.932 | 0.073 – 0.735 | **NO** |

**Falsification criterion (F1) fires at every width, by an enormous margin.** The
gap is not marginal in any reading:

| reading of "what `ρ` would be needed" | `d=16` | `d=64` | `d=256` | vs realistic `ρ ∈ [0.073, 0.735]` |
|---|---|---|---|---|
| strict `α_c` criterion (§3.3) | `0` | `0` | `0` | unreachable |
| practical: `λ ≤ 0.003`, i.e. <10× growth over 768 layers (§3.5) | `1.42e-3` | `5.75e-4` | `3.00e-4` | **realistic `ρ` is 51–2450× too large** |
| model B (signed `α_j`), same target (§6.1) | ~`4.1e-4` | ~`2.9e-4` | ~`1.5e-4` | **realistic `ρ` is 180–4900× too large** |

Even taking the most flattering combination available — idealised model A, the
narrowest width, and the smallest `ρ` measured anywhere (`0.073`, random init) —
the requirement is missed by a factor of **51**.

**Criterion (F2), reported precisely rather than as a boolean.** At realistic
`ρ ∈ [0.073, 0.735]`, `P(α_j < 0)` — the negative-diagonal event — runs from
about `0.02` (at `ρ = 0.073`) to about `0.29` (at `ρ = 0.735`), against
`ν_j(C_F)`'s entry rate `f ≈ 0.47`. So F2 is **partially** met: at the trained
end of the realistic range the identity term does inject negative diagonal
entries at a rate within a factor of ~2 of `f`, while at the random-init end it
does not. §6.2 quantifies the net effect at 7–73% extra negative mass over the
pre-registered law, and §6.1 at a 1.9–2.9× larger exponent than idealised model A.
**F2 makes the result worse but is not what decides it. F1 decides it, on its
own, at every width and every init convention tested.**

### 7.2 What `λ` actually is for a realistic residual block

Reading model B (§6.1) at the measured realistic `ρ`, `d = 64`:

| scenario | `ρ` | `λ` | `e^λ` | `log₁₀` growth at `n = L·T = 768` |
|---|---|---|---|---|
| Q12 bare sublayer (no residual) | — | `+2.11031` | 8.25 | `10^704` |
| residual, random init GPT-2 scaling | 0.10 | `+0.82518` | 2.28 | `10^275` |
| residual, random init std | 0.30 | `+1.48701` | 4.42 | `10^496` |
| **residual, lightly trained (mean)** | **0.465** | **`≈ +1.70`** | **5.5** | **`10^567`** |
| target for "harmless at depth 768" (10× total) | — | `≤ 0.003` | — | `10^1` |

**The residual buys a reduction from ~704 to ~567 orders of magnitude at the
realistic (trained) `ρ`, or ~275 at the most flattering random-init `ρ`.** To
reach the target, model A at `d = 64` needs `ρ ≤ 5.75e-4` (§3.5, measured), and
model B — the realistic signed-`α_j` case — needs about half that, `ρ ≲ 2.9e-4`.
Either way that is **2.4–3.4 orders of magnitude below the smallest `ρ` measured
anywhere in §4**, and 3.2 orders below the trained figure.

### 7.3 Answer with uncertainty

**Is realistic `α` above `α_c`? No, and it is not marginal.**

The uncertainty in this conclusion is dominated not by seed variance (`sd ≈
0.02–0.06` on `λ`, i.e. 1–3%) but by the realistic-`ρ` estimate, which spans a
factor of 10 across init conventions and training. **The conclusion is invariant
across that entire span**, and across model A vs model B, across three widths,
across two estimators, and across `C_F` with and without the LN matrix composed
in. For the conclusion to flip, realistic `ρ` would have to be smaller than
everything measured here by ~3 orders of magnitude — and the one measurement of
the *direction* training moves `ρ` (§4.2) moves it the wrong way.

**Is the product governed by the mean or the minimum?** By **the mean of the
per-layer exponents** (§5), which is strictly positive as soon as any layer is
bad and admits no cancellation from good layers. Since `α_c = 1`, every layer is
"bad", so this question — which mattered when `α_c` was expected to be interior —
turns out not to be load-bearing. Its answer is recorded because it is a general
fact about the stack: *good layers do not repair bad ones.*

---

## 8. Secondary checks

### 8.1 Does the residual rescue (H⁺)? — **No.**

`d = 64`, 400 draws:

| quantity | value | Q12 comparison |
|---|---|---|
| frac of residual-stream coords with `h_j ≤ 0` | **0.5020** | — |
| frac of sublayer columns with `z⁺_j ≤ 0` | 0.4954 | Q12: 0.5031 |
| frac of `C⁺` entries `< 0` | 0.2367 | Q12: 0.2370 |
| frac of **block-level** `z⁺` denominators `≤ 0` | 0.2504 | — |
| frac of coords with `sign(h_j) ≠ sign(z_j)` (i.e. `α_j < 0`), at `ρ = 0.805` | 0.2528 | — |

As anticipated in the task framing: **the residual stream `h` is itself ~50%
negative**, so it supplies no non-negative `a`. Corollary 8.1 applies to whatever
produced `h`, and the block-level `z⁺` analogue — which needs *both* `h_j > 0` for
the identity branch *and* `z⁺_j > 0` for the `F` branch — fails on 25% of
coordinates outright. The sublayer-level figures reproduce Q12 §4.2 to three
decimals (0.4954 vs 0.5031, 0.2367 vs 0.2370), which is a further consistency
check on the pipeline. **(H⁺) is not rescued; the residual makes it slightly
worse by adding a second way to fail.**

### 8.2 Self-healing — see §6.3. **Does not reappear at any `α < 1`.**

---

## 9. What does not generalise

Read before citing any of this.

1. **Single position, `d ≤ 256`.** As in Q12. The block model here is a
   *per-position* relevance matrix: the `F` branch is a LayerNorm-fed linear map,
   with the attention softmax detached (D6, Cor. 6.1) and no cross-position
   mixing in `C_F`. Multi-position attention would make the true operator
   `Nd × Nd`; whether cross-position mixing supplies the annihilation that
   §6.3 shows is absent within a position is **not tested here** and is the
   natural successor question. It is the same shape of gap that Q14 was to Q12,
   and it deserves the same scepticism: the mechanism identified in §6.3 (the
   residual scales negative entries without changing their signs) has no
   obvious reason to be repaired by adding positions, but that is a prediction,
   not a measurement.
2. **`α_c = 1` means "no threshold found", not "every `α < 1` is catastrophic".**
   §3.6 shows the reported `λ` below `ρ ≈ 10⁻⁴` is a finite-`n` artefact decaying
   like `1/n`; the estimator cannot separate `λ = 0` from `λ = κρ` there, and
   nothing in this study claims `ρ = 10⁻⁵` is harmful. What is claimed, and
   measured, is (a) `λ = κ_d·ρ` with `R² ≥ 0.988` and no threshold anywhere in
   `0.002 ≤ ρ ≤ 0.05` (§3.5); (b) `λ` is genuinely flat in `n` out to `n = 9600`
   at `ρ ≥ 10⁻²`, which covers the entire realistic range; and (c) `P_n` is never
   exactly non-negative at any `ρ > 0`, which is criterion-free.
3. **Random-weight `ρ` is an init choice, not a measurement of transformers**
   (§4.3). The trained figure comes from a 4-block, `d = 32` regression toy
   trained for 400 steps on a synthetic copy-and-mix task — **not a language
   model**, not converged, and not necessarily representative of the `ρ`
   distribution in a trained LLM, which may have heavy-tailed outlier layers
   this toy cannot exhibit. What is claimed is the *direction* (training raised
   `ρ` by 3–6×), and even that is one experiment.
4. **`λ(α)` at the small-`ρ` end is estimator-limited.** Below `ρ ≈ 5e-4` at
   `d = 16` the two estimators disagree in sign (norm `+0.003`, QR `−0.0002`),
   and §3.6 shows the norm estimate there decays like `1/n`. Nothing in the
   verdict rests on that region — realistic `ρ` is 2.5–3.5 orders of magnitude
   above it — but the numbers there must not be quoted as exponents.
5. **The two-branch derivation assumes the standard z-rule at the addition.**
   Other conventions exist for residual connections in LRP practice (e.g.
   fixed 50/50 splits, or routing all relevance through the identity). Those are
   *different rules*, not different measurements of this one; a fixed-split rule
   would not have unit column sums derived from the data and would break
   Lemma 9.0. What is shown here is that *the conservative rule* (Q14.1) does not
   rescue `λ`.
6. **`λ` is asymptotic; `L·T ≈ 768` is finite.** As in Q12. At `λ ≈ 1.7` the
   distinction is academic.

---

## 10. Conclusion

| question | answer |
|---|---|
| Does `C_block` keep unit column sums (Lemma 9.0)? | **Yes**, exactly — verified symbolically and to `1.4e-11` numerically, including for signed `α_j`. So **Cor. 9.2 applies to the product of residual blocks**, `λ` is still the growth rate of the product's negative mass, and `λ ≥ 0` still holds unconditionally. |
| Does the residual lower the negative-**entry** fraction `f`? | **No.** `f_eff` is flat in `α` (`0.4714 → 0.4640` at `d=64` across the whole sweep). The pre-registered question "does the residual raise `f_c`?" is answered: it does not move `f`, and it does not create an `f_c`-style threshold either. |
| Does the residual lower the negative **mass**? | **Yes**, by exactly the pre-registered factor `(1−α)`, with a 7–73% surcharge from the signedness of `α_j`. **This is the wrong kind of help.** |
| Is there a critical `α_c` restoring `λ = 0`? | **No.** `α_c = 1.0` at `d = 16, 64, 256` under Q12's own criterion — and more informatively, there is **no threshold at all**: `λ = κ_d·ρ` with slope `0.86/0.96/0.99` and `R² = 0.988/0.9998/0.997`, `κ = 2.11/5.21/9.99`. `λ` is flat in `n` out to `n = 9600` throughout the realistic range. |
| Does self-healing reappear? | **No.** The product is still 43.8% negative at `n = 200` even at `α = 0.99999`, and is **never** exactly non-negative at any `ρ > 0` even after `n = 9600`. Q12's annihilation mechanism is never triggered because the residual shrinks negative entries without changing their signs. |
| What is realistic `α`? | `ρ ∈ [0.073, 0.735]` ⇒ `α ∈ [0.576, 0.932]`; trained `ρ ∈ [0.277, 0.735]` ⇒ `α ∈ [0.576, 0.783]`. Random-weight `ρ` is an init choice and is the **optimistic** end; training moved `ρ` **up** 3–6×. |
| Mean or minimum? | **The mean of the per-layer exponents.** Good layers do not repair bad ones (`λ_mix/(p·λ_bad) = 0.996–1.013`). |
| Is (H⁺) rescued? | **No.** `h` is itself 50.2% negative; the block-level `z⁺` denominator fails on 25.0% of coordinates. |
| **Did `α = 0` reproduce Q12?** | **Yes, at all three widths, within 1.4σ** (`+1.391/+2.110/+2.789` vs `+1.354/+2.116/+2.826`). The pipeline is consistent with the prior study. |
| **Does Q14 flip Q12?** | **No.** It confirms Q12 and explains *why* the residual cannot help. |

**The honest summary.** The Q14 lead was well-motivated and the pre-registered
mechanism is real: the residual connection does multiply the per-layer negative
mass by `(1−α)`, essentially as predicted. But Q12's benign regime is not
produced by *small* negative mass — it is produced by the **annihilation of the
sign pattern**, and (Q14.1) preserves the sign pattern exactly, scaling every
negative entry by a positive constant. A positive rescaling of a signed matrix
cannot turn it non-negative. That is why `α_c = 1` rather than some interior
value, and it is why the result is a clean structural negative rather than a
close call about parameter values.

**Q12's scope caveat #3 named this as the most likely place the negative verdict
could soften. It does not soften. The verdict is confirmed, and the last
identified route by which it might have been overturned is now closed.**

The residual structure does reduce `λ` — from `+2.11` to `+0.83…+1.70` at
`d = 64`, depending on `ρ`. That is a real effect, worth roughly 130–430 orders
of magnitude at depth 768. It is also irrelevant: the target is `λ = 0` exactly
(Cor. 9.2 admits no other benign value), and `+0.83` is as far from `0` as
`+2.11` is, for the purpose the framework needs.

---

## 11. Recommended dispositions (not applied — no existing file was edited)

- **`04-open.md`, Q14**: status changes from OPEN to **RESOLVED NEGATIVELY**. The
  pre-registered falsification criterion (F1) fires at every width by 2.5–3.5
  orders of magnitude in `ρ`. The pre-registered *mechanism* was correct
  (`ν ∝ (1−α)`); the pre-registered *hope* was not, because `λ = 0` requires
  annihilation of the sign pattern, not attenuation of its magnitude.
- **`04-open.md`, Q12**: the "residual structure may soften this" hedge can be
  removed. Q12's verdict is now confirmed against its own most likely
  counter-mechanism.
- **`02-lemmas.md`, §"The mechanism: self-healing below a critical negativity"**:
  worth adding that the self-healing mechanism is *sign-pattern annihilation*,
  and is therefore invariant to positive rescaling of the matrix entries —
  which is exactly what makes it immune to the residual connection. §6.3 is the
  evidence.
- **`05-q9-conservation-at-depth.md`, §9.6 bottom line**: "Q14 (residual
  structure) is the most promising untested lead" should become "Q14 is tested
  and negative; the remaining untested structure is cross-position mixing"
  (§9.1 above).
- **A new open question** is warranted, and it is the *only* structural feature
  of D1.1 not yet modelled: does **multi-position** relevance flow — an
  `Nd × Nd` operator with attention mixing across positions — supply the
  annihilation that single-position blocks cannot? §9.1 states the prediction
  (no) and why it should nonetheless be measured rather than assumed.
