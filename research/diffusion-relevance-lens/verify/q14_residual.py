#!/usr/bin/env python3
"""
Q14: does the residual structure  h_out = h + F(h)  (D1.2, J = I + A) rescue
     lambda = 0 for LayerNorm-fed relevance propagation?

Q12 measured BARE single-position sublayers and found lambda = +1.35/+2.12/+2.83
at d = 16/64/256, because the realistic negative-entry fraction f ~ 0.47 sits
above a critical f_c ~ 0.175-0.40.  Q12's own scope caveat #3 named the residual
block as "the most likely place the negative verdict could soften".  This script
tests exactly that.

PRE-REGISTERED FALSIFICATION (04-open.md, Q14 -- written before this run):
  "residual structure rescues lambda = 0" is FALSIFIED if either
    (F1) realistic alpha lies BELOW the measured alpha_c, or
    (F2) the distribution of alpha_j has substantial mass outside [0,1], so the
         identity term contributes NEGATIVE diagonal entries at a rate
         comparable to nu_j(C_F).
Both are checked explicitly, and alpha_c and realistic alpha are measured
INDEPENDENTLY (sections 2 and 3) before being combined (section 7).

NEGATIVE CONTROLS
  NC0  the q12 Lyapunov estimator is re-validated against its five closed forms
       (imported, not re-implemented -- q12_nonnegativity.negative_controls).
  NC6  alpha = 0 must reproduce Q12 section 4's realistic lambda,
       +1.35434/+2.11612/+2.82636 at d = 16/64/256.  If it does not, the whole
       pipeline is wrong and the report must say so.
  NC7  C_block must have unit column sums (Lemma 9.0) for every alpha, for the
       scalar-alpha model AND for the realistic per-coordinate signed model.
  NC8  alpha = 1 (pure identity) must give lambda = 0 exactly.
  NC9  hand-written backprop for the trained-block measurement is gradient
       checked against central finite differences.

numpy + sympy only.  Seeded, no hash() anywhere (PYTHONHASHSEED-independent).
"""

import numpy as np
import sympy as sp

import q12_nonnegativity as q12
from q12_nonnegativity import (lyap_norm, lyap_qr, layernorm, gelu,
                               C_from_aw, realistic_layer)

np.set_printoptions(precision=6, suppress=False, linewidth=150)

MASTER_SEED = 20250823          # same master seed as Q12
results = {}

# Stable label -> integer offsets.  NOT hash().
TAG = {"scalar": 1, "percoord": 2, "mixture": 3, "heal": 4, "hplus": 5,
       "block": 6, "train": 7, "compose": 8}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


def head(s):
    print("\n" + "=" * 78)
    print(s)
    print("=" * 78)


def sub(s):
    print("\n--- " + s + " ---")


def negmass(C):
    """nu_j = sum_i max(-C_ij, 0) per column; returns the vector."""
    return np.clip(-C, 0, None).sum(axis=0)


# ============================================================================
# 0.  RE-VALIDATE THE Q12 ESTIMATOR (precondition)
# ============================================================================

def revalidate_estimator():
    head("0.  PRECONDITION -- re-run Q12's Lyapunov estimator validation")
    print("""
  The estimator is IMPORTED from verify/q12_nonnegativity.py, not rewritten.
  Its five closed-form negative controls are re-run here so that every number
  below rests on a checked instrument.""")
    q12.negative_controls()
    bad = [k for k, v in q12.results.items() if not v]
    record("NC0 q12 estimator revalidation", not bad,
           f"{len(q12.results)-len(bad)}/{len(q12.results)} closed-form controls pass"
           + ("" if not bad else "  FAILED: " + ",".join(bad)))
    return not bad


# ============================================================================
# 1.  THE RESIDUAL-BLOCK RELEVANCE MATRIX  --  derivation + machine check
# ============================================================================
#
#  h_out = h + F(h),  z_j := h_out,j = h_j + F_j(h).
#
#  The addition is a linear node with exactly two inputs per coordinate j:
#  the identity branch (value h_j) and the F branch (value F_j).  The z-rule
#  (D7.2) with w = 1, b = 0 splits the output relevance in proportion to the
#  contributions:
#
#      R^{id}_j = (h_j / z_j) R^out_j          R^{F}_j = (F_j / z_j) R^out_j
#
#  Write alpha_j := h_j / z_j; then 1 - alpha_j = F_j / z_j EXACTLY (no
#  assumption -- it is forced by h_j + F_j = z_j).
#
#  The identity branch maps R^{id}_j to input coordinate j unchanged.  The F
#  branch is propagated by F's own z-rule matrix C_F (unit column sums by
#  Lemma 9.0).  Summing the two contributions at input coordinate i:
#
#      R_i = alpha_i R^out_i + sum_j C_F[i,j] (1 - alpha_j) R^out_j
#
#  hence
#
#      C_block = diag(alpha) + C_F diag(1 - alpha)                         (Q14.1)
#      C_block[i,j] = alpha_j delta_ij + (1 - alpha_j) C_F[i,j]
#
#  Column sums: sum_i C_block[i,j] = alpha_j + (1-alpha_j) sum_i C_F[i,j]
#                                  = alpha_j + (1-alpha_j) = 1.           (Lemma 9.0)
#
#  Note what is NOT assumed: alpha_j in [0,1].  h and F are both signed, so
#  alpha_j = h_j/(h_j+F_j) is an unbounded ratio.  alpha_j < 0 <=> h_j and z_j
#  have opposite signs; alpha_j > 1 <=> F_j and z_j have opposite signs.  The
#  "identity path contributes a non-negative diagonal" intuition holds only on
#  the event alpha_j in [0,1].
# ============================================================================

def C_block_scalar(C_F, alpha):
    """Idealised model A: one scalar identity share, alpha in [0,1]."""
    d = C_F.shape[0]
    return alpha * np.eye(d) + (1.0 - alpha) * C_F


def C_block_vec(C_F, alpha_vec):
    """Realistic model B: per-coordinate signed alpha_j (Q14.1)."""
    return np.diag(alpha_vec) + C_F * (1.0 - alpha_vec)[None, :]


def derivation_checks():
    head("1.  C_block DERIVATION -- symbolic and numerical verification")

    sub("1.a  symbolic: the LRP addition rule gives (Q14.1) with unit column sums")
    d = 3
    h = sp.Matrix(sp.symbols('h1:4', real=True))
    F = sp.Matrix(sp.symbols('F1:4', real=True))
    CF = sp.Matrix(3, 3, sp.symbols('c1:10', real=True))
    # impose Lemma 9.0 on C_F: unit column sums (solve last row)
    for j in range(3):
        CF[2, j] = 1 - CF[0, j] - CF[1, j]
    z = h + F
    alpha = sp.Matrix([h[j] / z[j] for j in range(3)])
    Cb = sp.zeros(3, 3)
    for i in range(3):
        for j in range(3):
            Cb[i, j] = (alpha[j] if i == j else 0) + (1 - alpha[j]) * CF[i, j]
    colsums = [sp.simplify(sum(Cb[i, j] for i in range(3))) for j in range(3)]
    ok = all(cs == 1 for cs in colsums)
    record("1.a symbolic unit column sums of C_block", ok,
           f"sum_i C_block[i,j] = {colsums} for j=1,2,3  (Lemma 9.0 preserved)")

    # also check the branch shares sum to one identically
    shares = [sp.simplify(alpha[j] + (1 - alpha[j])) for j in range(3)]
    record("1.a symbolic branch shares sum to 1", all(s == 1 for s in shares),
           "alpha_j + (1-alpha_j) = 1 identically (forced by h_j + F_j = z_j)")

    sub("1.b  numerical: unit column sums for scalar and per-coordinate models")
    rng = np.random.default_rng(MASTER_SEED + TAG["compose"])
    worst_s = worst_v = 0.0
    for _ in range(400):
        dd = int(rng.choice([8, 16, 64]))
        C_F, a, W, z = realistic_layer(dd, rng, "layernorm")
        for al in (0.0, 0.25, 0.5, 0.9, 1.0):
            Cb = C_block_scalar(C_F, al)
            worst_s = max(worst_s, np.abs(Cb.sum(axis=0) - 1).max())
        av = rng.normal(size=dd) * 3.0          # deliberately outside [0,1]
        Cb = C_block_vec(C_F, av)
        worst_v = max(worst_v, np.abs(Cb.sum(axis=0) - 1).max())
    record("NC7 unit column sums, scalar-alpha C_block", worst_s < 1e-10,
           f"max |sum_i C_block[i,j] - 1| = {worst_s:.3e} over 400 draws x 5 alphas")
    record("NC7 unit column sums, per-coordinate signed alpha", worst_v < 1e-9,
           f"max |sum_i C_block[i,j] - 1| = {worst_v:.3e} (alpha_j ~ 3*N(0,1), far outside [0,1])")

    sub("1.c  direct check against an explicit LRP backward pass on h + F(h)")
    # Build h, F = W2 @ gelu_detached(W1 @ LN(h)), propagate a random R^out
    # through the addition rule + the sublayer z-rule by hand, and compare with
    # C_block @ R^out.
    rng = np.random.default_rng(MASTER_SEED + 17 + TAG["compose"])
    worst = 0.0
    for _ in range(200):
        dd = 12
        h = rng.normal(size=dd) * rng.lognormal(0, 0.5, size=dd)
        a = layernorm(h, gamma=1 + 0.1 * rng.normal(size=dd),
                      beta=0.1 * rng.normal(size=dd))
        W = rng.normal(size=(dd, dd)) / np.sqrt(dd)
        C_F, z_F = C_from_aw(a, W)
        if C_F is None:
            continue
        F = a @ W                      # sublayer output (single linear, Q12 family)
        zz = h + F
        if np.abs(zz).min() < 1e-9:
            continue
        Rout = rng.normal(size=dd)
        # explicit two-branch LRP
        R_id = (h / zz) * Rout          # identity branch, stays on coordinate j
        R_F = (F / zz) * Rout           # F branch
        R_in = R_id + C_F @ R_F         # identity branch is coordinate-wise
        # matrix form
        Cb = C_block_vec(C_F, h / zz)
        worst = max(worst, np.abs(R_in - Cb @ Rout).max() / max(1.0, np.abs(R_in).max()))
    record("1.c explicit LRP backward pass == C_block @ R_out", worst < 1e-10,
           f"max relative discrepancy over 200 draws = {worst:.3e}")

    sub("1.d  conservation of the block (1^T C_block R = 1^T R)")
    rng = np.random.default_rng(MASTER_SEED + 23 + TAG["compose"])
    worst = 0.0
    for _ in range(200):
        dd = 16
        C_F, a, W, z = realistic_layer(dd, rng, "layernorm")
        av = rng.normal(size=dd) * 2.0
        Cb = C_block_vec(C_F, av)
        R = rng.normal(size=dd)
        worst = max(worst, abs((Cb @ R).sum() - R.sum()) / max(1.0, abs(R.sum())))
    record("1.d block conservation 1^T C_block R = 1^T R", worst < 1e-9,
           f"max relative discrepancy = {worst:.3e}  (holds for signed alpha too)")


# ============================================================================
# 2.  THE ALPHA SWEEP  --  lambda(alpha), f_eff(alpha), and alpha_c per width
# ============================================================================

# alpha_c turns out to sit very close to 1, so the fine end of the grid is
# specified through the residual ratio rho = (1-alpha)/alpha, which is the
# directly measurable quantity (section 3).
RHO_FINE = [0.05, 0.02, 0.01, 5e-3, 2e-3, 1e-3, 5e-4, 2e-4, 1e-4, 3e-5, 1e-5]
ALPHA_GRID = ([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
              + [1.0 / (1.0 + r) for r in RHO_FINE] + [1.0])

BENIGN = 1e-5          # same threshold as Q12 section 3.3 (12 orders above the NC4 floor)


def CF_gen(d, rng, kind="layernorm"):
    """Fresh realistic sublayer relevance matrix (the Q12 family)."""
    return realistic_layer(d, rng, kind)[0]


def alpha_sweep(n=600, seeds=5, dims=(16, 64, 256), kind="layernorm"):
    head("2.  ALPHA SWEEP -- lambda(alpha) and f_eff(alpha) for the residual block")
    print(f"""
  C_block = alpha*I + (1-alpha)*C_F, fresh C_F per layer from the Q12 realistic
  '{kind}' family (LayerNorm input + linear).  n = {n} layers, {seeds} seeds,
  burn-in n/5.  alpha = 0 is the Q12 bare sublayer (negative control NC6);
  alpha = 1 is the pure identity (NC8).
  'f_eff' = fraction of entries of C_block below zero.
  'nu_max' = max_j nu_j(C_block), so ||C_block||_1 = 1 + 2*nu_max exactly (Cor 9.2).
""")
    out = {}
    for d in dims:
        sub(f"d = {d}")
        print(f"    {'alpha':>8s} {'rho':>9s} {'f_eff':>9s} {'nu_max':>11s} "
              f"{'E||Cb||_1':>11s} {'lam(norm)':>12s} {'sd':>9s} {'lam(QR)':>11s} "
              f"{'e^lam':>10s}  verdict")
        rows = []
        for al in ALPHA_GRID:
            lams, lqs, feffs, nus, nrms = [], [], [], [], []
            for s in range(seeds):
                r0 = np.random.default_rng(MASTER_SEED + 991 * s + 13 * d + TAG["scalar"])
                stats = [C_block_scalar(CF_gen(d, r0, kind), al) for _ in range(40)]
                feffs.append(np.mean([(c < 0).mean() for c in stats]))
                nus.append(np.mean([negmass(c).max() for c in stats]))
                nrms.append(np.mean([np.linalg.norm(c, 1) for c in stats]))
                r1 = np.random.default_rng(MASTER_SEED + 7 + 991 * s + 13 * d + TAG["scalar"])
                ln, _ = lyap_norm(lambda: C_block_scalar(CF_gen(d, r1, kind), al),
                                  n, d, burn=n // 5)
                lams.append(ln)
            r2 = np.random.default_rng(MASTER_SEED + 31 + 13 * d + TAG["scalar"])
            lq = lyap_qr(lambda: C_block_scalar(CF_gen(d, r2, kind), al),
                         n, d, k=1, burn=n // 5,
                         rng=np.random.default_rng(MASTER_SEED + 5))[0]
            lm, sd = float(np.mean(lams)), float(np.std(lams))
            allben = all(l <= BENIGN for l in lams)
            verdict = "BENIGN" if allben else ("marginal" if lm < 0.05 else "BLOW-UP")
            rho = (1 - al) / al if al > 0 else np.inf
            print(f"    {al:8.4f} {rho:9.4g} {np.mean(feffs):9.4f} {np.mean(nus):11.4g} "
                  f"{np.mean(nrms):11.4g} {lm:+12.5f} {sd:9.5f} {lq:+11.5f} "
                  f"{np.exp(min(lm,700)):10.4f}  {verdict}")
            rows.append(dict(alpha=al, lam=lm, sd=sd, lam_qr=lq, feff=float(np.mean(feffs)),
                             nu=float(np.mean(nus)), nrm=float(np.mean(nrms)),
                             allben=allben, lams=lams))
        out[d] = rows
    return out


def alpha_critical(sweep):
    sub("2.b  alpha_c per width  (band: last alpha with any seed blowing up "
        "-> first alpha with all seeds benign for that and every larger alpha)")
    print(f"    threshold for BENIGN: lambda <= {BENIGN:g} for ALL seeds\n")
    print("    {:>6s} {:>24s} {:>44s}".format(
        "d", "last non-benign alpha", "alpha_c (first all-benign, monotone)"))
    acs = {}
    for d, rows in sweep.items():
        # first alpha from which all larger alphas are benign for every seed
        ac = None
        for k in range(len(rows)):
            if all(r["allben"] for r in rows[k:]):
                ac = rows[k]["alpha"]
                break
        last_bad = None
        for r in rows:
            if not r["allben"]:
                last_bad = r["alpha"]
        acs[d] = (last_bad, ac)
        print(f"    {d:6d} {str(last_bad):>24s} {str(ac):>44s}")
    print("\n    equivalently in terms of the residual ratio rho = ||F||/||h|| = (1-alpha)/alpha:")
    print(f"    {'d':>6s} {'rho_c (= (1-alpha_c)/alpha_c)':>34s}")
    for d, (lb, ac) in acs.items():
        rc = (1 - ac) / ac if (ac is not None and ac > 0) else float('nan')
        print(f"    {d:6d} {rc:34.6g}")
    return acs


def nc6_control(sweep):
    sub("2.c  NC6 -- does alpha = 0 reproduce Q12 section 4?  (pipeline consistency)")
    prior = {16: 1.35434, 64: 2.11612, 256: 2.82636}
    print(f"    {'d':>6s} {'Q12 lambda':>12s} {'this run':>12s} {'sd':>9s} "
          f"{'|diff|':>10s} {'diff/sd':>9s}  verdict")
    ok_all = True
    for d, rows in sweep.items():
        if d not in prior:
            continue
        r = rows[0]
        assert r["alpha"] == 0.0
        diff = abs(r["lam"] - prior[d])
        z = diff / max(r["sd"], 1e-9)
        ok = z < 3.0 or diff < 0.10
        ok_all = ok_all and ok
        print(f"    {d:6d} {prior[d]:+12.5f} {r['lam']:+12.5f} {r['sd']:9.5f} "
              f"{diff:10.5f} {z:9.2f}  {'MATCH' if ok else 'MISMATCH'}")
    record("NC6 alpha=0 reproduces Q12 realistic lambda", ok_all,
           "bare-sublayer limit of the block pipeline agrees with the prior study")

    sub("2.d  NC8 -- alpha = 1 (pure identity) must give lambda = 0 exactly")
    ok_all = True
    for d, rows in sweep.items():
        r = rows[-1]
        assert r["alpha"] == 1.0
        ok = abs(r["lam"]) < 1e-12
        ok_all = ok_all and ok
        print(f"    d={d:4d}: lambda = {r['lam']:+.3e}, ||C||_1 = {r['nrm']:.6f}, "
              f"f_eff = {r['feff']:.4f}")
    record("NC8 alpha=1 gives lambda = 0", ok_all, "pure identity is exactly benign")


def lambda_rho_law(dims=(16, 64, 256), seeds=5, n=600, kind="layernorm"):
    """At small rho the sweep shows lambda decaying SMOOTHLY, not by a
    threshold.  Fit lambda ~ kappa_d * rho over the small-rho points and report
    the residual ratio needed to hit a target lambda."""
    sub("2.e  is lambda(rho) a threshold or a proportionality?  fit lambda = kappa*rho")
    print("""
  If the residual restored self-healing there would be a CRITICAL alpha with
  lambda dropping to 0 discontinuously (Q12 section 3.1's mechanism).  If instead
  the identity merely rescales the perturbation, lambda should fall off linearly
  in rho = ||F||/||h|| with no threshold at all.  Fitted on 0.002 <= rho <= 0.05,
  which is below the point where the linear regime ends and above the finite-n
  bias floor:
""")
    print(f"    {'d':>6s} {'kappa (lambda/rho)':>20s} {'R^2 of log-log fit':>20s} "
          f"{'slope':>8s} {'rho for lambda=0.003':>22s}")
    out = {}
    for d in dims:
        rs, ls = [], []
        for rho in (0.05, 0.02, 0.01, 0.005, 0.002):
            al = 1.0 / (1.0 + rho)
            lam = []
            for s in range(seeds):
                r1 = np.random.default_rng(MASTER_SEED + 7 + 991 * s + 13 * d + TAG["scalar"])
                lam.append(lyap_norm(lambda: C_block_scalar(CF_gen(d, r1, kind), al),
                                     n, d, burn=n // 5)[0])
            rs.append(rho)
            ls.append(float(np.mean(lam)))
        rs, ls = np.array(rs), np.array(ls)
        kap = float(np.mean(ls / rs))
        lx, ly = np.log(rs), np.log(ls)
        A = np.vstack([lx, np.ones_like(lx)]).T
        coef, res, *_ = np.linalg.lstsq(A, ly, rcond=None)
        pred = A @ coef
        r2 = 1 - ((ly - pred) ** 2).sum() / ((ly - ly.mean()) ** 2).sum()
        out[d] = (kap, float(coef[0]))
        print(f"    {d:6d} {kap:20.4f} {r2:20.5f} {coef[0]:8.4f} "
              f"{0.003/kap:22.3e}")
    print("""
  slope ~ 1 and a high R^2 means lambda is PROPORTIONAL to rho: no threshold, no
  phase transition, no self-healing -- the residual just rescales the exponent.
  The last column is the residual ratio needed for the product to grow by less
  than 10x over L*T = 768 layers (lambda <= log(10)/768 = 0.003).
""")
    return out


def depth_stability(d=64, seeds=4, kind="layernorm"):
    """The small-rho tail shows a small POSITIVE lambda.  Is it real, or a
    finite-n transient?  If the product self-heals, lambda_norm must fall toward
    0 as n grows and the product's negative fraction must reach exactly 0."""
    sub("2.f  is the small-rho residual lambda a finite-n transient?  (n-scaling)")
    print(f"""
  Cor 9.2 makes lambda the growth rate of the product's NEGATIVE MASS, so a
  bounded-but-nonzero negative mass gives lambda -> 0 as n -> infinity while a
  finite window still reports lambda > 0.  Below: lambda at d = {d} against n.
  A genuinely benign point has lambda falling like ~1/n; a genuinely blown-up
  point has lambda flat in n.  'exactly non-neg' = the product P_n has NO
  negative entry at n (Q12's self-healing signature).
""")
    print(f"    {'rho':>9s} " + " ".join(f"{'n='+str(x):>12s}" for x in (300, 600, 2400, 9600))
          + f" {'flat in n?':>12s} {'exactly non-neg by n=9600':>26s}")
    for rho in (0.05, 0.01, 0.001, 1e-4, 1e-5):
        al = 1.0 / (1.0 + rho)
        row = []
        for n in (300, 600, 2400, 9600):
            lam = []
            for s in range(seeds):
                r1 = np.random.default_rng(MASTER_SEED + 7 + 991 * s + 13 * d + TAG["scalar"])
                lam.append(lyap_norm(lambda: C_block_scalar(CF_gen(d, r1, kind), al),
                                     n, d, burn=n // 5)[0])
            row.append(float(np.mean(lam)))
        # self-healing signature at the longest run
        r1 = np.random.default_rng(MASTER_SEED + 7 + 13 * d + TAG["scalar"])
        M = np.eye(d)
        for _ in range(9600):
            M = C_block_scalar(CF_gen(d, r1, kind), al) @ M
            nm = np.linalg.norm(M, 1)
            if nm > 0 and np.isfinite(nm):
                M = M / nm
        nonneg = (M >= -1e-15).all()
        ratio = row[-1] / max(row[0], 1e-12)
        flat = "FLAT (real)" if ratio > 0.5 else ("~1/n (transient)" if ratio < 0.2 else "decaying")
        print(f"    {rho:9.4g} " + " ".join(f"{v:+12.6f}" for v in row)
              + f" {flat:>12s} {str(nonneg):>26s}")
    print("""
  Q12 section 3.1's self-healing signature is the product becoming EXACTLY
  non-negative within 2-5 layers.  If 'exactly non-neg' is False at n = 9600,
  self-healing has NOT been restored, whatever the size of lambda.
""")


# ============================================================================
# 3.  WHAT IS ALPHA REALLY?  --  measured from constructed transformer blocks
# ============================================================================

def attn_block(X, Wq, Wk, Wv, Wo, g1, b1):
    """Pre-LN multi-head-free attention sublayer.  X: (N, d)."""
    Xn = layernorm(X, gamma=g1, beta=b1)
    Q, K, V = Xn @ Wq, Xn @ Wk, Xn @ Wv
    S = Q @ K.T / np.sqrt(X.shape[1])
    S = S - S.max(axis=1, keepdims=True)
    P = np.exp(S)
    P = P / P.sum(axis=1, keepdims=True)
    return (P @ V) @ Wo, P


def mlp_block(X, W1, W2, g2, b2):
    Xn = layernorm(X, gamma=g2, beta=b2)
    return gelu(Xn @ W1) @ W2


def make_params(d, rng, dff_mult=4, w_scale=1.0, depth_scale=None):
    """Standard-ish init.  depth_scale (GPT-2's 1/sqrt(2L) on output projections)
    is applied to Wo and W2 when given."""
    s = w_scale
    dff = dff_mult * d
    ds = 1.0 if depth_scale is None else depth_scale
    return dict(
        Wq=rng.normal(size=(d, d)) * s / np.sqrt(d),
        Wk=rng.normal(size=(d, d)) * s / np.sqrt(d),
        Wv=rng.normal(size=(d, d)) * s / np.sqrt(d),
        Wo=rng.normal(size=(d, d)) * s * ds / np.sqrt(d),
        W1=rng.normal(size=(d, dff)) * s / np.sqrt(d),
        W2=rng.normal(size=(dff, d)) * s * ds / np.sqrt(dff),
        g1=np.ones(d) + 0.1 * rng.normal(size=d), b1=0.1 * rng.normal(size=d),
        g2=np.ones(d) + 0.1 * rng.normal(size=d), b2=0.1 * rng.normal(size=d),
    )


def alpha_stats(h, F):
    """Identity-share statistics for one (h, F) pair, per D1.1 addition node."""
    z = h + F
    good = np.abs(z) > 1e-12
    a = np.where(good, h / np.where(good, z, 1.0), np.nan)
    rho = np.linalg.norm(F) / np.linalg.norm(h)
    return a, rho


def realistic_alpha(seeds=8, L=12, d=64, N=16):
    head("3.  WHAT IS ALPHA REALLY?  --  measured on constructed transformer blocks")
    print(f"""
  A full pre-LN stack (D1.1): h <- h + Attn(LN(h)); h <- h + MLP(LN(h)),
  L = {L} blocks, d = {d}, N = {N} positions, {seeds} random-weight draws.
  Reported per sublayer addition node:
     rho     = ||F(h)|| / ||h||                 (residual ratio, Frobenius)
     a_norm  = 1/(1+rho)                        (naive scalar identity share)
     a_mass  = sum|h| / sum(|h| + |F|)          (mass-weighted share)
     a_j     = h_j/(h_j+F_j)                    (the quantity (Q14.1) actually uses)
  Three init conventions are shown because rho for RANDOM weights is largely a
  property of the init scale, not of transformers -- this is stated as a caveat,
  not hidden.
""")
    confs = [("std init (s=1)", dict(w_scale=1.0, depth_scale=None)),
             ("GPT2-style 1/sqrt(2L)", dict(w_scale=1.0, depth_scale=1 / np.sqrt(2 * L))),
             ("small init (s=0.5)", dict(w_scale=0.5, depth_scale=None))]
    summary = {}
    for name, kw in confs:
        sub(f"init: {name}")
        print(f"    {'block':>6s} {'sub':>5s} {'rho':>9s} {'a_norm':>9s} {'a_mass':>9s} "
              f"{'med a_j':>9s} {'P(a_j<0)':>9s} {'P(a_j>1)':>9s} {'P(a out [0,1])':>15s}")
        per_depth = []
        for ell in range(L):
            acc = {k: [] for k in ("rho", "an", "am", "med", "pneg", "pgt1")}
            acc2 = {k: [] for k in ("rho", "an", "am", "med", "pneg", "pgt1")}
            for s in range(seeds):
                rng = np.random.default_rng(MASTER_SEED + 1009 * s + TAG["block"])
                X = rng.normal(size=(N, d))
                params = [make_params(d, rng, **kw) for _ in range(L)]
                for k in range(L):
                    p = params[k]
                    Fa, _ = attn_block(X, p["Wq"], p["Wk"], p["Wv"], p["Wo"],
                                       p["g1"], p["b1"])
                    if k == ell:
                        a, rho = alpha_stats(X, Fa)
                        acc["rho"].append(rho)
                        acc["an"].append(1 / (1 + rho))
                        acc["am"].append(np.abs(X).sum() / (np.abs(X).sum() + np.abs(Fa).sum()))
                        acc["med"].append(np.nanmedian(a))
                        acc["pneg"].append(np.nanmean(a < 0))
                        acc["pgt1"].append(np.nanmean(a > 1))
                    X = X + Fa
                    Fm = mlp_block(X, p["W1"], p["W2"], p["g2"], p["b2"])
                    if k == ell:
                        a, rho = alpha_stats(X, Fm)
                        acc2["rho"].append(rho)
                        acc2["an"].append(1 / (1 + rho))
                        acc2["am"].append(np.abs(X).sum() / (np.abs(X).sum() + np.abs(Fm).sum()))
                        acc2["med"].append(np.nanmedian(a))
                        acc2["pneg"].append(np.nanmean(a < 0))
                        acc2["pgt1"].append(np.nanmean(a > 1))
                    X = X + Fm
            for tag, A in (("attn", acc), ("mlp", acc2)):
                m = {k: float(np.mean(v)) for k, v in A.items()}
                print(f"    {ell:6d} {tag:>5s} {m['rho']:9.4f} {m['an']:9.4f} "
                      f"{m['am']:9.4f} {m['med']:9.4f} {m['pneg']:9.4f} {m['pgt1']:9.4f} "
                      f"{m['pneg']+m['pgt1']:15.4f}")
                per_depth.append((ell, tag, m))
        summary[name] = per_depth
        rr = [m["rho"] for _, _, m in per_depth]
        aa = [m["an"] for _, _, m in per_depth]
        oo = [m["pneg"] + m["pgt1"] for _, _, m in per_depth]
        print(f"\n    across all {len(per_depth)} sublayers: rho in [{min(rr):.4f}, {max(rr):.4f}], "
              f"a_norm in [{min(aa):.4f}, {max(aa):.4f}], "
              f"P(a_j outside [0,1]) in [{min(oo):.4f}, {max(oo):.4f}]")
        print(f"    depth trend: rho(first sublayer) = {rr[0]:.4f} -> "
              f"rho(last sublayer) = {rr[-1]:.4f}   "
              f"ratio = {rr[-1]/max(rr[0],1e-12):.4f}")
    return summary


# ---------------------------------------------------------------------------
# 3.b  a lightly TRAINED block  (hand-written backprop, gradient-checked)
# ---------------------------------------------------------------------------

def fwd_stack(X, params, cache=False):
    """Forward through L pre-LN blocks; returns final X and (optionally) cache."""
    cs = []
    for p in params:
        Xn1 = layernorm(X, gamma=p["g1"], beta=p["b1"])
        Q, K, V = Xn1 @ p["Wq"], Xn1 @ p["Wk"], Xn1 @ p["Wv"]
        S = Q @ K.T / np.sqrt(X.shape[1])
        S = S - S.max(axis=1, keepdims=True)
        E = np.exp(S)
        P = E / E.sum(axis=1, keepdims=True)
        AV = P @ V
        Fa = AV @ p["Wo"]
        X1 = X + Fa
        Xn2 = layernorm(X1, gamma=p["g2"], beta=p["b2"])
        Hh = Xn2 @ p["W1"]
        G = gelu(Hh)
        Fm = G @ p["W2"]
        X2 = X1 + Fm
        if cache:
            cs.append(dict(X=X, Xn1=Xn1, Q=Q, K=K, V=V, P=P, AV=AV, Fa=Fa,
                           X1=X1, Xn2=Xn2, Hh=Hh, G=G, Fm=Fm))
        X = X2
    return (X, cs) if cache else X


def _ln_back(dY, x, gamma, eps=1e-5):
    """Backward through LN(x) = gamma*(x-mu)/sigma + beta, over the last axis."""
    d = x.shape[-1]
    mu = x.mean(axis=-1, keepdims=True)
    c = x - mu
    var = (c * c).mean(axis=-1, keepdims=True)
    sig = np.sqrt(eps + var)
    xh = c / sig
    dxh = dY * gamma
    dg = (dY * xh).sum(axis=tuple(range(x.ndim - 1)))
    db = dY.sum(axis=tuple(range(x.ndim - 1)))
    dx = (dxh - dxh.mean(axis=-1, keepdims=True)
          - xh * (dxh * xh).mean(axis=-1, keepdims=True)) / sig
    return dx, dg, db


def dgelu(x):
    t = np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3))
    return 0.5 * (1 + t) + 0.5 * x * (1 - t ** 2) * np.sqrt(2 / np.pi) * (1 + 3 * 0.044715 * x ** 2)


def bwd_stack(dX, params, cs):
    grads = [dict() for _ in params]
    for k in range(len(params) - 1, -1, -1):
        p, c = params[k], cs[k]
        dX1 = dX.copy()
        dFm = dX
        grads[k]["W2"] = c["G"].T @ dFm
        dG = dFm @ p["W2"].T
        dHh = dG * dgelu(c["Hh"])
        grads[k]["W1"] = c["Xn2"].T @ dHh
        dXn2 = dHh @ p["W1"].T
        dx2, dg2, db2 = _ln_back(dXn2, c["X1"], p["g2"])
        grads[k]["g2"], grads[k]["b2"] = dg2, db2
        dX1 = dX1 + dx2
        dXa = dX1.copy()
        dFa = dX1
        grads[k]["Wo"] = c["AV"].T @ dFa
        dAV = dFa @ p["Wo"].T
        dP = dAV @ c["V"].T
        dV = c["P"].T @ dAV
        s = (dP * c["P"]).sum(axis=1, keepdims=True)
        dS = c["P"] * (dP - s)
        dS = dS / np.sqrt(c["X"].shape[1])
        dQ = dS @ c["K"]
        dK = dS.T @ c["Q"]
        grads[k]["Wq"] = c["Xn1"].T @ dQ
        grads[k]["Wk"] = c["Xn1"].T @ dK
        grads[k]["Wv"] = c["Xn1"].T @ dV
        dXn1 = dQ @ p["Wq"].T + dK @ p["Wk"].T + dV @ p["Wv"].T
        dx1, dg1, db1 = _ln_back(dXn1, c["X"], p["g1"])
        grads[k]["g1"], grads[k]["b1"] = dg1, db1
        dX = dXa + dx1
    return grads


def trained_block(L=4, d=32, N=8, steps=400, seed=0):
    sub("3.b  a lightly TRAINED stack  (hand-written backprop, gradient-checked)")
    rng = np.random.default_rng(MASTER_SEED + 77 + seed + TAG["train"])
    params = [make_params(d, rng, w_scale=1.0, depth_scale=1 / np.sqrt(2 * L))
              for _ in range(L)]
    Wr = rng.normal(size=(d, d)) / np.sqrt(d)
    Rmix = rng.normal(size=(d, d)) / np.sqrt(d)

    def batch(r):
        X = r.normal(size=(N, d))
        Y = np.roll(X, 1, axis=0) @ Rmix     # needs attention to move info across positions
        return X, Y

    def loss_and_grad(params, X, Y):
        H, cs = fwd_stack(X, params, cache=True)
        O = H @ Wr
        E = O - Y
        loss = 0.5 * (E * E).sum() / X.shape[0]
        dO = E / X.shape[0]
        dH = dO @ Wr.T
        return loss, bwd_stack(dH, params, cs)

    # NC9 gradient check
    rgc = np.random.default_rng(MASTER_SEED + 999)
    X, Y = batch(rgc)
    _, g = loss_and_grad(params, X, Y)
    worst = 0.0
    for _ in range(12):
        k = int(rgc.integers(0, L))
        key = str(rgc.choice(["Wq", "Wk", "Wv", "Wo", "W1", "W2", "g1", "b2"]))
        arr = params[k][key]
        idx = tuple(int(rgc.integers(0, s)) for s in arr.shape)
        h0 = 1e-6
        old = arr[idx]
        arr[idx] = old + h0
        lp, _ = loss_and_grad(params, X, Y)
        arr[idx] = old - h0
        lm, _ = loss_and_grad(params, X, Y)
        arr[idx] = old
        num = (lp - lm) / (2 * h0)
        ana = g[k][key][idx]
        worst = max(worst, abs(num - ana) / max(1e-8, abs(num) + abs(ana)))
    record("NC9 hand-written backprop gradient check", worst < 1e-4,
           f"max relative error vs central differences over 12 params = {worst:.3e}")

    # Adam with global grad-norm clipping (plain SGD+momentum diverges here)
    lr, b1, b2, epsA, clip = 3e-3, 0.9, 0.999, 1e-8, 1.0
    r = np.random.default_rng(MASTER_SEED + 4242)
    l0 = None
    M = [{k: np.zeros_like(v) for k, v in p.items()} for p in params]
    V = [{k: np.zeros_like(v) for k, v in p.items()} for p in params]
    losses = []
    for t in range(steps):
        X, Y = batch(r)
        loss, g = loss_and_grad(params, X, Y)
        if not np.isfinite(loss):
            print(f"    (training diverged at step {t}; stopping early)")
            break
        losses.append(loss)
        if t == 0:
            l0 = loss
        gn = np.sqrt(sum(float((g[k][key] ** 2).sum())
                         for k in range(L) for key in g[k]))
        sc = min(1.0, clip / max(gn, 1e-12))
        for k in range(L):
            for key in params[k]:
                gg = g[k][key] * sc
                M[k][key] = b1 * M[k][key] + (1 - b1) * gg
                V[k][key] = b2 * V[k][key] + (1 - b2) * gg * gg
                mh = M[k][key] / (1 - b1 ** (t + 1))
                vh = V[k][key] / (1 - b2 ** (t + 1))
                params[k][key] -= lr * mh / (np.sqrt(vh) + epsA)
    Xf, Yf = batch(np.random.default_rng(MASTER_SEED + 31337))
    lf, _ = loss_and_grad(params, Xf, Yf)
    print(f"    L={L} d={d} N={N}: held-out loss {l0:.4f} -> {lf:.4f} over "
          f"{len(losses)} steps (ratio {lf/l0:.4f}) -- LIGHTLY trained, not "
          f"converged, and NOT a language model")

    print(f"\n    {'block':>6s} {'sub':>5s} {'rho':>9s} {'a_norm':>9s} {'a_mass':>9s} "
          f"{'med a_j':>9s} {'P(a_j<0)':>9s} {'P(a_j>1)':>9s}")
    X = Xf
    rows = []
    for k in range(L):
        p = params[k]
        Fa, _ = attn_block(X, p["Wq"], p["Wk"], p["Wv"], p["Wo"], p["g1"], p["b1"])
        a, rho = alpha_stats(X, Fa)
        rows.append(("attn", k, rho, 1 / (1 + rho),
                     np.abs(X).sum() / (np.abs(X).sum() + np.abs(Fa).sum()),
                     np.nanmedian(a), np.nanmean(a < 0), np.nanmean(a > 1)))
        X = X + Fa
        Fm = mlp_block(X, p["W1"], p["W2"], p["g2"], p["b2"])
        a, rho = alpha_stats(X, Fm)
        rows.append(("mlp", k, rho, 1 / (1 + rho),
                     np.abs(X).sum() / (np.abs(X).sum() + np.abs(Fm).sum()),
                     np.nanmedian(a), np.nanmean(a < 0), np.nanmean(a > 1)))
        X = X + Fm
    for tag, k, rho, an, am, med, pn, pg in rows:
        print(f"    {k:6d} {tag:>5s} {rho:9.4f} {an:9.4f} {am:9.4f} {med:9.4f} "
              f"{pn:9.4f} {pg:9.4f}")
    rr = [r[2] for r in rows]
    print(f"\n    trained stack: rho in [{min(rr):.4f}, {max(rr):.4f}], "
          f"mean {np.mean(rr):.4f}; a_norm in "
          f"[{1/(1+max(rr)):.4f}, {1/(1+min(rr)):.4f}]")
    return rows


# ============================================================================
# 4.  MIXTURE OF ALPHA ACROSS LAYERS -- mean or minimum?
# ============================================================================

def mixture_test(d=64, n=600, seeds=4, kind="layernorm"):
    head("4.  MIXTURE of alpha across layers -- governed by the mean or the worst?")
    print(f"""
  Layers are not identical: rho varies with depth, so alpha does too.  Draw
  alpha_ell independently per layer from a two-point mixture
     alpha = alpha_hi with prob 1-p, alpha_lo with prob p,
  and compare lambda_mix against lambda(mean alpha) and against p*lambda(alpha_lo)
  (the "worst layer dominates, no healing at good layers" prediction).
  d = {d}, n = {n} layers, {seeds} seeds.
""")
    pairs = [(0.99, 0.5), (0.999, 0.9), (0.9999, 0.99), (0.999, 0.0)]
    ps = [0.0, 0.02, 0.05, 0.10, 0.25, 0.50, 1.0]

    def lam_fixed(al, tag):
        ls = []
        for s in range(seeds):
            r = np.random.default_rng(MASTER_SEED + 991 * s + tag + TAG["mixture"])
            ln, _ = lyap_norm(lambda: C_block_scalar(CF_gen(d, r, kind), al),
                              n, d, burn=n // 5)
            ls.append(ln)
        return float(np.mean(ls))

    for (ahi, alo) in pairs:
        sub(f"mixture alpha_hi = {ahi}, alpha_lo = {alo}")
        lhi, llo = lam_fixed(ahi, 111), lam_fixed(alo, 222)
        print(f"    pure alpha_hi: lambda = {lhi:+.5f}      pure alpha_lo: lambda = {llo:+.5f}")
        print(f"    {'p(lo)':>8s} {'mean alpha':>11s} {'lam(mean a)':>13s} "
              f"{'lam_mix':>11s} {'sd':>9s} {'p*lam_lo':>11s} {'mix/mean':>10s} "
              f"{'mix/(p*lo)':>11s}  governed by")
        for p in ps:
            abar = (1 - p) * ahi + p * alo
            lbar = lam_fixed(abar, 333 + int(1000 * p))
            ls = []
            for s in range(seeds):
                r = np.random.default_rng(MASTER_SEED + 991 * s + 44 + TAG["mixture"])
                rc = np.random.default_rng(MASTER_SEED + 991 * s + 55 + TAG["mixture"])

                def gen(r=r, rc=rc, p=p):
                    al = alo if rc.random() < p else ahi
                    return C_block_scalar(CF_gen(d, r, kind), al)
                ln, _ = lyap_norm(gen, n, d, burn=n // 5)
                ls.append(ln)
            lmix, sdm = float(np.mean(ls)), float(np.std(ls))
            pred_worst = p * llo
            gov = ("mean" if (abs(lmix - lbar) < abs(lmix - pred_worst)) else "worst-layer")
            if lmix <= BENIGN and lbar <= BENIGN and pred_worst <= BENIGN:
                gov = "both benign"
            print(f"    {p:8.2f} {abar:11.5f} {lbar:+13.5f} {lmix:+11.5f} {sdm:9.5f} "
                  f"{pred_worst:+11.5f} "
                  f"{(lmix/lbar if abs(lbar)>1e-9 else float('nan')):10.3f} "
                  f"{(lmix/pred_worst if abs(pred_worst)>1e-9 else float('nan')):11.3f}  {gov}")


# ============================================================================
# 5.  MODEL B -- the realistic per-coordinate signed alpha_j
# ============================================================================

def real_block_C(d, rng, rho_target, kind="layernorm", ln_compose=False):
    """Full residual-block relevance matrix with the TRUE per-coordinate alpha_j.

    h        residual stream state (scale-mixed Gaussian, as in Q12)
    a        = LN(h)          (sublayer input)
    F        = a W  rescaled so ||F|| / ||h|| = rho_target
    C_F      z-rule matrix of the sublayer (optionally composed with the LN
             z-rule matrix, so both branches terminate at h)
    alpha_j  = h_j / (h_j + F_j)                              -- SIGNED, unbounded
    """
    for _ in range(200):
        h = rng.normal(size=d) * rng.lognormal(0, 0.5, size=d)
        gamma = 1.0 + 0.1 * rng.normal(size=d)
        beta = 0.1 * rng.normal(size=d)
        if kind == "layernorm":
            a = layernorm(h, gamma=gamma, beta=beta)
        elif kind == "layernorm_plain":
            a = layernorm(h)
        else:
            raise ValueError(kind)
        W = rng.normal(size=(d, d)) / np.sqrt(d)
        C_F, z = C_from_aw(a, W)
        if C_F is None:
            continue
        F = a @ W
        F = F * (rho_target * np.linalg.norm(h) / max(np.linalg.norm(F), 1e-300))
        zz = h + F
        if np.abs(zz).min() < 1e-10:
            continue
        if ln_compose:
            # z-rule matrix of LN itself (mu, sigma detached: D6 mu-sigma-detach)
            mu = h.mean()
            sig = np.sqrt(1e-5 + ((h - mu) ** 2).mean())
            M = (np.eye(d) - np.ones((d, d)) / d) * (gamma / sig)[None, :]  # a_i = sum_k h_k M[k,i] + beta_i
            num = h[:, None] * M
            den = num.sum(axis=0) + beta
            if np.abs(den).min() < 1e-10:
                continue
            C_LN = num / den
            C_F = C_LN @ C_F
        al = h / zz
        return C_block_vec(C_F, al), al, h, F, C_F
    raise RuntimeError("degenerate")


def model_b(n=600, seeds=5, dims=(16, 64, 256), kind="layernorm", ln_compose=False):
    head("5.  MODEL B -- realistic SIGNED per-coordinate alpha_j (the honest test)"
         + ("  [C_F composed with C_LN]" if ln_compose else ""))
    print(f"""
  Same block, but alpha_j = h_j/(h_j+F_j) is computed from the actual h and F
  rather than being imposed as a scalar in [0,1].  rho = ||F||/||h|| is swept;
  each rho has a corresponding IDEALISED scalar alpha_norm = 1/(1+rho) whose
  lambda from section 2 is printed alongside, so the cost of the signedness of
  alpha_j is visible directly.  n = {n}, {seeds} seeds.
""")
    rhos = [2.0, 1.0, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.003, 0.001]
    out = {}
    for d in dims:
        sub(f"d = {d}")
        print(f"    {'rho':>8s} {'a_norm':>8s} {'P(a_j<0)':>9s} {'P(a_j>1)':>9s} "
              f"{'P(out[0,1])':>12s} {'neg diag frac':>14s} {'f_eff':>8s} "
              f"{'E||Cb||_1':>11s} {'lam':>11s} {'sd':>9s}  verdict")
        rows = []
        for rho in rhos:
            lams, pn, pg, nd, fe, nr = [], [], [], [], [], []
            for s in range(seeds):
                r0 = np.random.default_rng(MASTER_SEED + 991 * s + 13 * d + TAG["percoord"])
                for _ in range(40):
                    Cb, al, h, F, C_F = real_block_C(d, r0, rho, kind, ln_compose)
                    pn.append((al < 0).mean())
                    pg.append((al > 1).mean())
                    nd.append((np.diag(Cb) < 0).mean())
                    fe.append((Cb < 0).mean())
                    nr.append(np.linalg.norm(Cb, 1))
                r1 = np.random.default_rng(MASTER_SEED + 7 + 991 * s + 13 * d + TAG["percoord"])
                ln_, _ = lyap_norm(lambda: real_block_C(d, r1, rho, kind, ln_compose)[0],
                                   n, d, burn=n // 5)
                lams.append(ln_)
            lm, sd = float(np.mean(lams)), float(np.std(lams))
            allben = all(l <= BENIGN for l in lams)
            verdict = "BENIGN" if allben else ("marginal" if lm < 0.05 else "BLOW-UP")
            print(f"    {rho:8.4g} {1/(1+rho):8.4f} {np.mean(pn):9.4f} {np.mean(pg):9.4f} "
                  f"{np.mean(pn)+np.mean(pg):12.4f} {np.mean(nd):14.4f} {np.mean(fe):8.4f} "
                  f"{np.mean(nr):11.4g} {lm:+11.5f} {sd:9.5f}  {verdict}")
            rows.append(dict(rho=rho, lam=lm, sd=sd, allben=allben,
                             pout=float(np.mean(pn) + np.mean(pg)),
                             negdiag=float(np.mean(nd))))
        out[d] = rows
    return out


# ============================================================================
# 5.b  THE MECHANISM TEST -- the sharp form of falsification criterion F2
# ============================================================================

def mechanism_test(dims=(16, 64, 256), draws=600):
    head("5.b  MECHANISM -- is nu(C_block) = (1-alpha)*nu(C_F), as pre-registered?")
    print("""
  04-open.md Q14 predicted  nu_j(C_block) ~ (1-alpha_j)*nu_j(C_F)  ON THE EVENT
  alpha_j in [0,1].  Off that event two things go wrong:
    alpha_j < 0  -> the identity term ADDS a negative diagonal entry;
    alpha_j > 1  -> (1-alpha_j) < 0, which SIGN-FLIPS the whole C_F column,
                    so the surviving negative mass is (alpha_j-1)*(positive mass
                    of that column) = (alpha_j-1)*(1 + nu_j), not (1-alpha_j)*nu_j.
  Measured ratio  nu_j(C_block) / (|1-alpha_j| * nu_j(C_F))  isolates this:
  a ratio of 1 means the pre-registered suppression law holds.
""")
    rng = np.random.default_rng(MASTER_SEED + 61 + TAG["percoord"])
    print(f"    {'d':>5s} {'rho':>8s} {'P(a_j<0)':>9s} {'P(a_j>1)':>9s} "
          f"{'med|1-a_j|':>12s} {'nu(Cb)/nu(CF)':>14s} "
          f"{'nu ratio vs |1-a| law':>22s} {'negdiag mass frac':>18s}")
    for d in dims:
        for rho in (0.5, 0.2, 0.1, 0.05, 0.01, 0.001):
            r1 = r2 = r3 = r4 = r5 = 0.0
            pn = pg = 0.0
            k = 0
            for _ in range(draws // len(dims)):
                Cb, al, h, F, C_F = real_block_C(d, rng, rho)
                nuF, nuB = negmass(C_F), negmass(Cb)
                law = np.abs(1 - al) * nuF
                good = law > 1e-12
                r1 += (nuB[good] / law[good]).mean()
                r2 += (nuB.sum() / max(nuF.sum(), 1e-300))
                pn += (al < 0).mean()
                pg += (al > 1).mean()
                r4 += np.median(np.abs(1 - al))
                # share of the block's negative mass that comes from the diagonal
                dg = np.clip(-np.diag(Cb), 0, None).sum()
                r5 += dg / max(nuB.sum(), 1e-300)
                k += 1
            print(f"    {d:5d} {rho:8.4g} {pn/k:9.4f} {pg/k:9.4f} {r4/k:12.5f} "
                  f"{r2/k:14.5f} {r1/k:22.5f} {r5/k:18.5f}")
    print("""
  Reading: 'nu ratio vs |1-a| law' == 1 means the residual suppresses negative
  mass exactly as pre-registered (with |1-alpha| in place of (1-alpha)); a value
  well above 1 means the sign structure of alpha_j is injecting extra negativity.
""")


# ============================================================================
# 6.  SECONDARY CHECKS -- (H+) and self-healing
# ============================================================================

def hplus_check(d=64, draws=400):
    head("6.a  Does the residual block rescue hypothesis (H+):  z+_j > 0 ?")
    print("""
  (H+) needs z+_j != 0 (in practice > 0) and a >= 0.  Q12 section 4.2: on
  LayerNorm input 50.31% of sublayer columns have z+_j <= 0.  At block level the
  z+ analogue must ALSO give the identity branch a non-negative share, which
  needs h_j > 0 -- and the residual stream h is itself signed (Cor 8.1 applies
  to whatever produced it).  Measured:
""")
    print(f"    {'quantity':>52s} {'value':>10s}")
    rng = np.random.default_rng(MASTER_SEED + TAG["hplus"])
    hneg, zpbad, cpneg, blockbad, hzsign, rhos_h = [], [], [], [], [], []
    for _ in range(draws):
        h = rng.normal(size=d) * rng.lognormal(0, 0.5, size=d)
        a = layernorm(h, gamma=1 + 0.1 * rng.normal(size=d), beta=0.1 * rng.normal(size=d))
        W = rng.normal(size=(d, d)) / np.sqrt(d)
        Wp = np.maximum(W, 0)
        zp = a @ Wp
        hneg.append((h <= 0).mean())
        zpbad.append((zp <= 0).mean())
        with np.errstate(divide='ignore', invalid='ignore'):
            Cp = np.where(np.abs(zp) > 1e-12, a[:, None] * Wp / zp, 0.0)
        cpneg.append((Cp < 0).mean())
        F = a @ W
        z = h + F
        # block-level z+ denominator: max(h,0) + max(F,0)
        zpb = np.maximum(h, 0) + np.maximum(F, 0)
        blockbad.append((zpb <= 0).mean())
        hzsign.append((h * z <= 0).mean())
        rhos_h.append(np.linalg.norm(F) / np.linalg.norm(h))
    print(f"    {'frac of residual-stream coords with h_j <= 0':>52s} {np.mean(hneg):10.4f}")
    print(f"    {'frac of sublayer columns with z+_j <= 0 (Q12: 0.5031)':>52s} {np.mean(zpbad):10.4f}")
    print(f"    {'frac of C+ entries < 0 (Q12: 0.2370)':>52s} {np.mean(cpneg):10.4f}")
    print(f"    {'frac of block z+ denominators <= 0':>52s} {np.mean(blockbad):10.4f}")
    print(f"    {'frac of coords with sign(h_j) != sign(z_j)  [alpha_j<0]':>52s} {np.mean(hzsign):10.4f}")
    print(f"    {'(at unrescaled rho = ||F||/||h|| of)':>52s} {np.mean(rhos_h):10.4f}")
    ok = np.mean(hneg) > 0.3
    record("6.a residual stream h is itself ~50% negative", ok,
           f"P(h_j <= 0) = {np.mean(hneg):.4f} -- the residual does NOT supply a "
           f"non-negative a; (H+) is not rescued")
    return dict(hneg=float(np.mean(hneg)), zpbad=float(np.mean(zpbad)),
                cpneg=float(np.mean(cpneg)), blockbad=float(np.mean(blockbad)),
                anegfrac=float(np.mean(hzsign)))


def healing_check(d=64, kind="layernorm"):
    head("6.b  Does self-healing reappear?  negative-mass fraction of the PRODUCT vs n")
    print(f"""
  Negative-entry fraction of P_n = C_n ... C_1, scalar-alpha model, d = {d},
  median over 5 seeds.  Q12 section 3.1 found annihilation within 2-5 layers
  below f_c.  '0' means the product is EXACTLY non-negative (lambda = 0).
""")
    ns = [1, 2, 3, 5, 10, 25, 50, 100, 200]
    print("    " + f"{'alpha':>8s} " + " ".join(f"{'n='+str(x):>10s}" for x in ns))
    for al in [0.0, 0.5, 0.9, 0.99, 0.999, 0.9999, 0.99999, 1.0]:
        curves = []
        for s in range(5):
            r = np.random.default_rng(MASTER_SEED + 991 * s + TAG["heal"])
            M = np.eye(d)
            row = []
            for t in range(1, ns[-1] + 1):
                M = C_block_scalar(CF_gen(d, r, kind), al) @ M
                nm = np.linalg.norm(M, 1)
                if nm > 0 and np.isfinite(nm):
                    M = M / nm
                if t in ns:
                    row.append((M < -1e-15).mean())
            curves.append(row)
        med = np.median(np.array(curves), axis=0)
        print("    " + f"{al:8.5f} " + " ".join(f"{v:10.3e}" for v in med))


# ============================================================================
# 7.  VERDICT
# ============================================================================

def verdict(acs, real_rho_range, modelb):
    head("7.  VERDICT -- combining the two INDEPENDENT measurements")
    lo, hi = real_rho_range
    a_lo, a_hi = 1 / (1 + hi), 1 / (1 + lo)
    print(f"""
  Measured independently:
    (i)  alpha_c   -- section 2, the idealised scalar-alpha sweep
    (ii) realistic alpha -- section 3, from constructed transformer blocks
  Realistic rho over all sublayers and all init conventions tested:
    rho in [{lo:.4f}, {hi:.4f}]  =>  alpha_norm in [{a_lo:.4f}, {a_hi:.4f}]
""")
    print(f"    {'d':>6s} {'alpha_c':>12s} {'realistic alpha (max)':>24s} "
          f"{'alpha > alpha_c ?':>18s}")
    rescued = True
    for d, (lb, ac) in sorted(acs.items()):
        ok = (ac is not None) and (a_hi > ac)
        rescued = rescued and ok
        print(f"    {d:6d} {str(ac):>12s} {a_hi:24.4f} {('YES' if ok else 'NO'):>18s}")
    print(f"\n  (F1) realistic alpha below alpha_c at some width?  "
          f"{'NO -> not falsified by F1' if rescued else 'YES -> HYPOTHESIS FALSIFIED by F1'}")
    pouts = [r["pout"] for rows in modelb.values() for r in rows]
    negd = [r["negdiag"] for rows in modelb.values() for r in rows]
    # F2 is about NEGATIVE DIAGONAL entries, i.e. alpha_j < 0, at a rate
    # comparable to nu_j(C_F).  alpha_j > 1 keeps the diagonal POSITIVE (it
    # sign-flips the F branch instead), so counting all mass outside [0,1]
    # would overstate F2.  Both are reported; F2 is judged on the diagonal.
    print(f"  (F2) P(alpha_j outside [0,1]) over all model-B settings: "
          f"[{min(pouts):.4f}, {max(pouts):.4f}]")
    print(f"       negative-DIAGONAL fraction (the alpha_j < 0 event, which is "
          f"what F2 is about): [{min(negd):.4f}, {max(negd):.4f}]")
    f2 = max(negd) > 0.20      # "comparable to nu_j(C_F)", i.e. to f ~ 0.47
    print(f"       negative diagonal at a rate comparable to f ~ 0.47?  "
          f"{'YES -> HYPOTHESIS FALSIFIED by F2' if f2 else 'NO -> F2 does not fire'}")
    print("\n  Model-B (realistic signed alpha_j) benign thresholds:")
    for d, rows in sorted(modelb.items()):
        ben = [r["rho"] for r in rows if r["allben"]]
        print(f"    d = {d:4d}: benign only for rho <= "
              f"{(max(ben) if ben else float('nan'))}"
              f"   (realistic rho >= {lo:.4f})")
    record("Q14 verdict computed", True,
           "residual RESCUES lambda=0" if (rescued and not f2)
           else "residual does NOT rescue lambda=0")
    return rescued, f2


# ============================================================================

def main():
    print(__doc__)
    print(f"master seed = {MASTER_SEED}")
    if not revalidate_estimator():
        print("\n  ABORT: estimator validation failed; no downstream number is trustworthy.")
        return
    derivation_checks()
    sweep = alpha_sweep()
    acs = alpha_critical(sweep)
    nc6_control(sweep)
    lambda_rho_law()
    depth_stability()
    rsum = realistic_alpha()
    trows = trained_block()
    allrho = [m["rho"] for v in rsum.values() for _, _, m in v] + [r[2] for r in trows]
    real_rho_range = (float(min(allrho)), float(max(allrho)))
    mixture_test()
    mb = model_b()
    mechanism_test()
    mb_ln = model_b(dims=(64,), ln_compose=True, seeds=3)
    hplus_check()
    healing_check()
    verdict(acs, real_rho_range, mb)

    head("SUMMARY")
    bad = [k for k, v in results.items() if not v]
    for k, v in results.items():
        print(f"  [{'PASS' if v else 'FAIL'}] {k}")
    print(f"\n  {len(results) - len(bad)}/{len(results)} checks passed.")
    if bad:
        print("  FAILURES: " + ", ".join(bad))


if __name__ == "__main__":
    main()
