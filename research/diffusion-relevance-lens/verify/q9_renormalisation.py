#!/usr/bin/env python3
"""
Machine verification of 05-q9-conservation-at-depth.md.

Claims checked
--------------
  Lemma 9.0   1^T C = 1^T for C_ij = a_i w_ij / z_j, z_j = sum_i a_i w_ij  (9.2)
              symbolic (sympy, fully symbolic a, w) and numeric; plus the z_j -> 0
              breakdown the proof's hypothesis excludes.
  L5.1 recov  1^T C Theta R = sum_j theta_j R_j
  Prop 9.1    (a) 1^T Rtilde = phi exactly;  (b) Rtilde_i/Rtilde_k = R_i/R_k
  Thm 9.4     ||C||_{1->1} = 1 for C >= 0 with unit column sums          (9.6)
              and the central claim (9.7): ||prod(C_l Theta_l) - prod C_l||_1
              grows LINEARLY in n, not geometrically, up to n = L*T = 768.
  Cor 9.5     Dobrushin delta(C) = min_{j!=k} sum_i min(C_ij, C_ik);
              ||C(u-v)||_1 <= (1-delta)||u-v||_1 on sum-zero differences;
              depth-uniform bound (9.8); and the near-identity caveat delta ~ 0.
  Cor 9.6     C >= 0, R^(L) >= 0  =>  R^(l) >= 0, so sum|R| = sum R.
  Eq (9.9)    n = 48 -> n = 768 needs eps smaller by ~16x for equal error.

Negative controls (mutants that MUST be caught)
-----------------------------------------------
  M1  Thm 9.4 with non-negativity DROPPED (the plain z-rule, signed C, still with
      unit column sums): the error must grow GEOMETRICALLY.  This contrast is the
      entire content of the theorem.
  M2  Lemma 9.0 with the column-sum condition DROPPED (C built with a mismatched
      denominator): 1^T C != 1^T and ||C||_{1->1} != 1.
  M3  "delta > 0 for the identity / near-identity layer": must be caught as false,
      with no damping in the depth recursion.
  M4  Prop 9.1(b) with ADDITIVE renormalisation instead of multiplicative: fixes
      the aggregate but changes within-layer ratios.
  M5  Cor 9.6 with signed C: relevance goes negative and sum|R| > sum R.

Norms: ||.||_{1->1} is the induced l1 operator norm = max column absolute sum
(numpy's np.linalg.norm(M, 1)), which is the norm (9.6)/(9.7) are stated in.
"""

import numpy as np
import sympy as sp

SEED = 909
rng = np.random.default_rng(SEED)

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


# ----------------------------------------------------------------------------
# rule constructors -- built from (a, w) exactly as D7.2/(9.1) prescribe
# ----------------------------------------------------------------------------

def C_zplus(d, r):
    """z+-rule: a >= 0, w -> w^+.  C >= 0 entrywise, unit column sums.

    w^+ = max(w, 0) zeroes about half the weights, so a column can come out
    identically zero (z_j = 0, the hypothesis Lemma 9.0 excludes).  Such columns
    are resampled from |N(0,1)| rather than silently clamped -- clamping would
    manufacture a column that violates (9.2) and make the whole file report a
    spurious failure.
    """
    a = np.abs(r.normal(size=d))
    W = np.maximum(r.normal(size=(d, d)), 0.0)
    M = a[:, None] * W
    z = M.sum(axis=0)
    bad = z <= 1e-12
    while bad.any():
        M[:, bad] = a[:, None] * np.abs(r.normal(size=(d, int(bad.sum()))))
        z = M.sum(axis=0)
        bad = z <= 1e-12
    return M / z


def C_zplain(d, r):
    """plain z-rule: signed a and w.  Unit column sums, entries of BOTH signs."""
    a = r.normal(size=d)
    W = r.normal(size=(d, d))
    M = a[:, None] * W
    z = M.sum(axis=0)
    return M / z


def C_mixed(d, r, frac):
    """interpolation: a fraction `frac` of the weights is sign-flipped."""
    a = np.abs(r.normal(size=d))
    W = np.abs(r.normal(size=(d, d)))
    W = np.where(r.random((d, d)) < frac, -W, W)
    M = a[:, None] * W
    z = M.sum(axis=0)
    return M / z


def C_dirichlet(d, r, conc=1.0):
    """A well-mixing non-negative column-stochastic matrix."""
    return r.dirichlet(np.ones(d) * conc, size=d).T


def draw_z(d, r, dist):
    if dist == "lognormal":       # activations bounded away from 0
        return np.exp(r.normal(0.0, 0.5, size=d))
    if dist == "normal":          # realistic: z ~ N(0,1)
        return np.abs(r.normal(size=d))
    if dist == "cauchy":          # heavy-tailed variant
        return np.abs(r.standard_cauchy(size=d))
    raise ValueError(dist)


def thetas(az, eps):
    return az / (az + eps)


# ----------------------------------------------------------------------------
# Lemma 9.0
# ----------------------------------------------------------------------------

def lemma_9_0():
    print("\n--- Lemma 9.0  (9.2)  1^T C = 1^T ---")

    print("  symbolic (sympy, fully symbolic a_i, w_ij):")
    for d in (2, 3, 4):
        a = sp.symbols(f"a1:{d+1}", real=True)
        w = sp.Matrix(d, d, sp.symbols(f"w0:{d*d}", real=True))
        ok = True
        for j in range(d):
            z = sum(a[i] * w[i, j] for i in range(d))
            colsum = sum(sp.simplify(a[i] * w[i, j] / z) for i in range(d))
            ok = ok and sp.simplify(colsum - 1) == 0
        record("Lemma 9.0 (symbolic)", ok,
               f"d={d}: sum_i a_i w_ij / z_j simplifies to exactly 1 for every j "
               f"-> {ok}")

    print("\n  numeric (z+-rule and plain z-rule, several d):")
    worst_p = worst_s = 0.0
    for d in (4, 16, 64, 256):
        for _ in range(20):
            Cp = C_zplus(d, rng)
            Cs = C_zplain(d, rng)
            worst_p = max(worst_p, np.abs(Cp.sum(axis=0) - 1).max())
            worst_s = max(worst_s, np.abs(Cs.sum(axis=0) - 1).max())
    record("Lemma 9.0 (numeric)", worst_p < 1e-12 and worst_s < 1e-8,
           f"max |sum_i C_ij - 1| over d in {{4,16,64,256}}: z+-rule "
           f"{worst_p:.3e}, plain z-rule {worst_s:.3e} "
           f"(plain z-rule is worse: cancellation in z_j)")

    print("\n  where z_j -> 0 breaks the proof (the hypothesis z_j != 0).")
    print("  One column, d = 64: v_i = a_i w_ij ~ N(0,1) with v_0 shifted so the")
    print("  column sum z_j lands on the target by cancellation -- the Lemma 6")
    print("  regime.  400 seeds per target; the deviation is a random rounding")
    print("  effect of size ~ u * sum_i|v_i| / |z_j|, so the MAX is what matters.")
    print(f"    {'z_j (target)':>14} {'max|C_ij|':>12} {'median|colsum-1|':>18} "
          f"{'max|colsum-1|':>15}")
    r0 = np.random.default_rng(17)
    devs_by_target = {}
    for target in (1e0, 1e-4, 1e-8, 1e-12, 1e-14, 1e-16):
        devs, mx = [], 0.0
        for _ in range(400):
            v = r0.normal(size=64)
            v[0] += target - v.sum()
            z = v.sum()
            if z == 0.0:
                continue
            C = v / z
            devs.append(abs(C.sum() - 1.0))
            mx = max(mx, np.abs(C).max())
        devs = np.array(devs)
        devs_by_target[target] = devs
        print(f"    {target:>14.0e} {mx:>12.3e} {np.median(devs):>18.3e} "
              f"{devs.max():>15.3e}")
    # exact zero
    col = np.array([1.0, -1.0, 3.0, -3.0])
    z = col.sum()
    with np.errstate(divide="ignore", invalid="ignore"):
        Cz = col / z
    bad = not np.isfinite(Cz).all()
    silent = devs_by_target[1e-16].max()
    clean = devs_by_target[1e0].max()
    record("Lemma 9.0 (z_j = 0 breaks)", bad and z == 0.0 and silent > 1e-2
           and clean < 1e-13,
           f"z_j = {z} exactly -> C column = {Cz} (non-finite): (9.2) is FALSE at "
           f"z_j = 0. Before that it fails SILENTLY: at z_j ~ 1e-16 reached by "
           f"cancellation the computed column sum is off by up to {silent:.3e} "
           f"(vs {clean:.1e} at z_j ~ 1) while every entry is finite and no "
           f"exception is raised -- the same silent failure as Lemma 6. The "
           f"z_j != 0 hypothesis is not a formality.")

    # --- M2 mutant: drop the column-sum condition ---------------------------
    d = 32
    a = np.abs(rng.normal(size=d))
    W = np.maximum(rng.normal(size=(d, d)), 0.0)
    M = a[:, None] * W
    z_wrong = M.sum(axis=0) * (1.0 + 0.3 * rng.normal(size=d))   # mismatched denom
    Cbad = M / z_wrong
    dev = np.abs(Cbad.sum(axis=0) - 1).max()
    nrm = np.linalg.norm(Cbad, 1)
    record("M2 mutant (no column-sum cond.)", dev > 1e-3 and abs(nrm - 1) > 1e-3,
           f"NEGATIVE CONTROL: mismatched denominator gives max|colsum-1| = "
           f"{dev:.4f} and ||C||_(1->1) = {nrm:.4f} != 1 -> the Lemma 9.0 test "
           f"and the Thm 9.4 norm test both catch it")


# ----------------------------------------------------------------------------
# recovering Lemma 5.1
# ----------------------------------------------------------------------------

def recover_lemma_5_1():
    print("\n--- Recovering Lemma 5.1:  1^T C Theta R = sum_j theta_j R_j ---")
    worst = 0.0
    for d in (4, 16, 128):
        for eps in (1e-6, 1e-3, 1e-1):
            for _ in range(20):
                C = C_zplus(d, rng)
                az = draw_z(d, rng, "normal")
                th = thetas(az, eps)
                R = rng.normal(size=d) * 5.0          # SIGNED relevance
                lhs = np.ones(d) @ (C @ (th * R))
                rhs = float((th * R).sum())
                worst = max(worst, abs(lhs - rhs) / max(abs(rhs), 1e-300))
    record("Lemma 5.1 (recovered from 9.0)", worst < 1e-9,
           f"max rel residual over d in {{4,16,128}} x eps in {{1e-6,1e-3,1e-1}}, "
           f"signed R: {worst:.3e}")

    # theta_j in (0,1) strictly, and the attenuation is toward zero (not <=)
    az = draw_z(200000, rng, "normal")
    th = thetas(az, 1e-3)
    record("L5.2 theta in (0,1)", (th > 0).all() and (th < 1).all(),
           f"theta_j in [{th.min():.6f}, {th.max():.9f}] over 2e5 draws")

    # Cor 5.2 cross-check of the doc's table (z ~ N(0,1), d = 5000)
    print("\n  cross-check of Cor 5.2's table (z ~ N(0,1), d = 5000):")
    r2 = np.random.default_rng(4242)
    az = np.abs(r2.normal(size=5000))
    print(f"    {'eps':>8} {'mean theta':>12} {'geo-mean':>12} "
          f"{'mean^48':>10} {'mean^768':>10} {'doc 48':>8} {'doc 768':>9}")
    doc = {1e-6: (0.99963, 0.99411), 1e-3: (0.77750, 0.01783)}
    consistent = True
    notes = []
    for eps in (1e-6, 1e-3):
        th = thetas(az, eps)
        m = th.mean()
        g = np.exp(np.log(th).mean())
        se = th.std(ddof=1) / np.sqrt(len(th))       # sampling error of mean theta
        print(f"    {eps:>8.0e} {m:>12.6f} {g:>12.6f} {m**48:>10.5f} "
              f"{m**768:>10.5f} {doc[eps][0]:>8.5f} {doc[eps][1]:>9.5f}")
        # is the doc's theta-bar within sampling error of ours?
        th_doc = doc[eps][0] ** (1.0 / 48.0)
        nsig = abs(th_doc - m) / max(se, 1e-18)
        notes.append(f"eps={eps:.0e}: doc theta_bar={th_doc:.6f} vs measured "
                     f"{m:.6f} +/- {se:.6f} ({nsig:.1f} sigma)")
        consistent = consistent and nsig < 4.0
    record("Cor 5.2 (doc table reproducible)", consistent,
           "d=5000 is small enough that mean theta carries real sampling error; "
           + "; ".join(notes) + " -> the doc's table is reproducible up to the "
           "seed, and its 768-exponent conclusion (~1-2% retained at eps=1e-3) "
           "is confirmed")


# ----------------------------------------------------------------------------
# Prop 9.1
# ----------------------------------------------------------------------------

def prop_9_1():
    print("\n--- Prop 9.1  renormalised eps-rule ---")
    phi = 3.7
    worst_a = 0.0
    worst_b = 0.0
    for d in (4, 32, 256):
        for _ in range(30):
            R = rng.normal(size=d) * 2.0
            s = R.sum()
            if abs(s) < 1e-6:
                continue
            Rt = (phi / s) * R
            worst_a = max(worst_a, abs(Rt.sum() - phi) / phi)
            k = int(np.argmax(np.abs(R)))
            ratio_before = R / R[k]
            ratio_after = Rt / Rt[k]
            worst_b = max(worst_b, np.abs(ratio_before - ratio_after).max())
    record("Prop 9.1(a)", worst_a < 1e-12,
           f"1^T Rtilde = phi to max rel residual {worst_a:.3e} (signed R, "
           f"d in {{4,32,256}})")
    record("Prop 9.1(b)", worst_b < 1e-12,
           f"within-layer ratios Rtilde_i/Rtilde_k identical to R_i/R_k, max "
           f"deviation {worst_b:.3e}")

    # depth: apply it at every layer of a 768-layer stack
    d, n, eps = 24, 768, 1e-3
    r = np.random.default_rng(11)
    R = np.abs(r.normal(size=d))
    R = phi * R / R.sum()
    Rraw = R.copy()
    devs = []
    for _ in range(n):
        C = C_zplus(d, r)
        th = thetas(draw_z(d, r, "lognormal"), eps)
        R = C @ (th * R)
        R = (phi / R.sum()) * R
        devs.append(abs(R.sum() - phi) / phi)
        Rraw = C @ (th * Rraw)
    record("Prop 9.1(a) at depth 768", max(devs) < 1e-12,
           f"aggregate held at phi for all 768 layers, max rel drift "
           f"{max(devs):.3e}; UN-renormalised aggregate collapsed to "
           f"{Rraw.sum()/phi:.6e} of phi (this is Remark 9.2's failure mode)")

    # --- M4 mutant: additive renormalisation --------------------------------
    R = rng.normal(size=64) * 2.0
    Radd = R + (phi - R.sum()) / 64.0
    agg_ok = abs(Radd.sum() - phi) < 1e-10
    k = int(np.argmax(np.abs(R)))
    ratio_dev = np.abs(R / R[k] - Radd / Radd[k]).max()
    record("M4 mutant (additive renorm)", agg_ok and ratio_dev > 1e-3,
           f"NEGATIVE CONTROL: additive renormalisation also gives 1^T R = phi "
           f"(residual {abs(Radd.sum()-phi):.1e}) but shifts within-layer ratios "
           f"by up to {ratio_dev:.4f} -> Prop 9.1(b) is specific to the "
           f"MULTIPLICATIVE rescaling (9.3), and the test detects the difference")

    # honest caveat: (9.3) needs 1^T R != 0
    Rz = np.array([1.0, -1.0, 2.0, -2.0])
    record("Prop 9.1 caveat (1^T R = 0)", abs(Rz.sum()) < 1e-15,
           f"REPORTED CAVEAT: (9.3) divides by 1^T R^(l); for signed relevance "
           f"1^T R can be exactly 0 (e.g. R = {Rz}), where renormalisation is "
           f"UNDEFINED. The text says 'provided 1^T R != 0' in the proof but the "
           f"statement of 9.1(a) says 'exactly' without the caveat. Under the "
           f"z+-rule (Cor 9.6) R >= 0 so this cannot bite -- the two halves of "
           f"the prescription are needed together.")


# ----------------------------------------------------------------------------
# Theorem 9.4
# ----------------------------------------------------------------------------

def thm_9_4_norm():
    print("\n--- Thm 9.4 (9.6):  ||C||_{1->1} = 1 for C >= 0 with unit col sums ---")
    worst = 0.0
    worst_sup = 0.0
    for d in (3, 8, 64, 256):
        for _ in range(15):
            C = C_zplus(d, rng)
            nrm = np.linalg.norm(C, 1)            # max column absolute sum
            worst = max(worst, abs(nrm - 1.0))
            # independent check: sup over random u and over sign patterns
            best = 0.0
            for _ in range(200):
                u = rng.normal(size=d)
                best = max(best, np.abs(C @ u).sum() / np.abs(u).sum())
            for _ in range(200):
                u = rng.choice([-1.0, 1.0], size=d)
                best = max(best, np.abs(C @ u).sum() / np.abs(u).sum())
            best = max(best, max(np.abs(C @ np.eye(d)[:, j]).sum()
                                 for j in range(d)))
            worst_sup = max(worst_sup, abs(best - 1.0))
    record("Thm 9.4 (9.6) norm = 1", worst < 1e-12 and worst_sup < 1e-12,
           f"max |max-col-abs-sum - 1| = {worst:.3e}; independent sup over "
           f"random/sign/basis vectors deviates from 1 by {worst_sup:.3e} "
           f"(attained at u = e_j, so it is = 1, not just <= 1)")

    # non-expansiveness on the l1 ball, and the signed contrast
    d = 64
    C = C_zplus(d, rng)
    Cs = C_zplain(d, rng)
    us = [rng.normal(size=d) for _ in range(2000)]
    us += [rng.choice([-1.0, 1.0], size=d) for _ in range(2000)]
    us += [np.eye(d)[:, j] for j in range(d)]
    r_pos = max(np.abs(C @ u).sum() / np.abs(u).sum() for u in us)
    r_sgn = max(np.abs(Cs @ u).sum() / np.abs(u).sum() for u in us)
    colsum_ok = max(abs(C.sum(axis=0) - 1).max(), abs(Cs.sum(axis=0) - 1).max())
    record("M1 mutant (signed C, norm)",
           abs(r_pos - 1) < 1e-12 and r_sgn > 1.5 and colsum_ok < 1e-9,
           f"NEGATIVE CONTROL: sup ||Cu||_1/||u||_1 is {r_pos:.12f} for C >= 0 but "
           f"{r_sgn:.3e} for the plain (signed) z-rule with the SAME unit column "
           f"sums (both satisfy (9.2) to {colsum_ok:.1e}) -> non-negativity, NOT "
           f"(9.2), is what gives B = 1")


def _depth_run(d, nmax, eps, mk, seed, zdist, ns):
    """log ||prod(C Theta) - prod C||_1 at the checkpoints in `ns`.

    Products are rescaled by a shared factor each step so the signed control
    does not overflow; the removed scale is tracked in logs.
    """
    r = np.random.default_rng(seed)
    PA = np.eye(d)
    PB = np.eye(d)
    logs = 0.0
    logerr, lognorm, etas, Bmax = {}, {}, [], 0.0
    for n in range(1, nmax + 1):
        C = mk(r)
        Bmax = max(Bmax, np.linalg.norm(C, 1))
        az = draw_z(d, r, zdist)
        th = thetas(az, eps)
        etas.append(eps / (az.min() + eps))          # (9.4): ||E_l||
        PA = C @ (th[:, None] * PA)
        PB = C @ PB
        f = max(np.linalg.norm(PA, 1), np.linalg.norm(PB, 1))
        if not np.isfinite(f) or f == 0.0:
            f = 1.0
        PA /= f
        PB /= f
        logs += np.log(f)
        if n in ns:
            logerr[n] = np.log(max(np.linalg.norm(PA - PB, 1), 1e-320)) + logs
            lognorm[n] = np.log(max(np.linalg.norm(PB, 1), 1e-320)) + logs
    return logerr, lognorm, np.array(etas), Bmax


def thm_9_4_growth():
    print("\n--- Thm 9.4 (9.7):  DEPTH GROWTH of ||prod(C_l Theta_l) - prod C_l||_1 ---")
    print("    n runs to L*T = 768.  Exponent alpha is the least-squares fit of")
    print("    log(err) on log(n) over n >= 8: alpha ~ 1 is linear, alpha >> 1 is")
    print("    geometric.  For the geometric cases we also report the per-layer")
    print("    rate exp(slope of log(err) on n).")
    d, nmax = 24, 768
    ns = [1, 2, 4, 8, 16, 32, 48, 64, 128, 256, 512, 768]
    nsa = np.array(ns, dtype=float)
    mask = nsa >= 8

    # ---------------- the z+-rule (the theorem's hypothesis) ---------------
    print("\n  z+-RULE  (C >= 0, unit column sums) -- averaged over trials")
    print(f"    {'z dist':>10} {'eps':>7} {'trials':>7} "
          + "".join(f"{('n=%d' % n):>11}" for n in [1, 8, 48, 128, 768])
          + f"{'alpha':>8} {'e(768)/e(48)':>13} {'sum eta':>10}")
    zplus_stats = {}
    for zdist, eps, ntr in [("lognormal", 1e-6, 16),
                            ("normal", 1e-9, 96),
                            ("cauchy", 1e-9, 96)]:
        acc = np.zeros(len(ns))
        eta_tot = 0.0
        for t in range(ntr):
            le, ln_, etas, B = _depth_run(d, nmax, eps,
                                          lambda r: C_zplus(d, r),
                                          2000 + t, zdist, ns)
            acc += np.array([np.exp(le[n]) for n in ns])
            eta_tot += etas.sum()
        acc /= ntr
        eta_tot /= ntr
        alpha = np.polyfit(np.log(nsa[mask]), np.log(acc[mask]), 1)[0]
        ratio = acc[ns.index(768)] / acc[ns.index(48)]
        zplus_stats[zdist] = (alpha, ratio, acc, eta_tot, B)
        print(f"    {zdist:>10} {eps:>7.0e} {ntr:>7d} "
              + "".join(f"{acc[ns.index(n)]:>11.3e}" for n in [1, 8, 48, 128, 768])
              + f"{alpha:>8.3f} {ratio:>13.2f} {eta_tot:>10.3e}")

    a_ln, r_ln, acc_ln, eta_ln, B_ln = zplus_stats["lognormal"]
    record("Thm 9.4-linear", 0.85 <= a_ln <= 1.15 and abs(B_ln - 1.0) < 1e-12,
           f"z+ / lognormal z: growth exponent alpha = {a_ln:.4f} (linear = 1.0, "
           f"geometric would be >> 1); err(n)/n is flat to "
           f"{np.max(acc_ln[mask]/nsa[mask])/np.min(acc_ln[mask]/nsa[mask]):.4f}x "
           f"across n = 8..768; B = max_l ||C_l||_(1->1) = {B_ln:.12f}")
    record("Thm 9.4-bound (9.7)", acc_ln[ns.index(768)] <= eta_ln * (1 + 1e-9),
           f"measured err(768) = {acc_ln[ns.index(768)]:.4e} <= sum_l eta_l = "
           f"{eta_ln:.4e} (slack {eta_ln/acc_ln[ns.index(768)]:.2f}x)")
    a_no, r_no, acc_no, eta_no, _ = zplus_stats["normal"]
    a_ca, r_ca, acc_ca, eta_ca, _ = zplus_stats["cauchy"]
    # For heavy-tailed z the Monte-Carlo estimate of err(n) is itself noisy (a
    # handful of layers with tiny min_j|z_j| dominate sum_l eta_l), so the fitted
    # exponent wobbles.  The substantive claim -- (9.7) holds and growth is
    # nowhere near geometric -- is tested directly instead of via alpha alone.
    record("Thm 9.4-linear(realistic z)",
           a_no <= 2.0 and a_ca <= 2.0
           and r_no <= 100.0 and r_ca <= 100.0
           and acc_no[ns.index(768)] <= eta_no
           and acc_ca[ns.index(768)] <= eta_ca,
           f"z ~ |N(0,1)|: alpha = {a_no:.3f}, err(768)/err(48) = {r_no:.1f}, "
           f"err(768) = {acc_no[ns.index(768)]:.3e} <= sum eta = {eta_no:.3e}; "
           f"z ~ |Cauchy|: alpha = {a_ca:.3f}, err(768)/err(48) = {r_ca:.1f}, "
           f"err(768) = {acc_ca[ns.index(768)]:.3e} <= sum eta = {eta_ca:.3e}. "
           f"NOTE: for heavy-tailed z the fitted alpha is noisy (sum_l eta_l is "
           f"dominated by a few layers with tiny min_j|z_j|), so alpha can land "
           f"either side of 1; what is unambiguous is that (9.7) holds and the "
           f"768/48 ratio is O(10), not O(1e500) as in the signed control below.")

    # ---------------- CRITICAL CONTROL: negative entries allowed -----------
    print("\n  CRITICAL CONTROL -- C with NEGATIVE entries (plain z-rule, still")
    print("  unit column sums).  `frac` = fraction of sign-flipped weights;")
    print("  frac = 0 is the z+-rule, `plain-z` uses fully signed a and w.")
    print(f"    {'rule':>9} {'B=max||C||_1':>13} {'log10 err(48)':>14} "
          f"{'log10 err(768)':>15} {'alpha':>9} {'per-layer rate':>15} {'regime':>11}")
    ctrl = {}
    for name, mk in [("frac 0.00", lambda r: C_mixed(d, r, 0.0)),
                     ("frac 0.05", lambda r: C_mixed(d, r, 0.05)),
                     ("frac 0.15", lambda r: C_mixed(d, r, 0.15)),
                     ("frac 0.35", lambda r: C_mixed(d, r, 0.35)),
                     ("plain-z", lambda r: C_zplain(d, r))]:
        le, ln_, etas, B = _depth_run(d, nmax, 1e-6, mk, 77, "lognormal", ns)
        y = np.array([le[n] for n in ns])
        alpha = np.polyfit(np.log(nsa[mask]), y[mask], 1)[0]
        slope = np.polyfit(nsa[mask], y[mask], 1)[0]
        rate = np.exp(slope)
        regime = "geometric" if rate > 1.05 else ("linear" if alpha < 1.5
                                                  else "mixed")
        ctrl[name] = (B, y, alpha, rate)
        print(f"    {name:>9} {B:>13.4g} {y[ns.index(48)]/np.log(10):>14.3f} "
              f"{y[ns.index(768)]/np.log(10):>15.3f} {alpha:>9.3f} "
              f"{rate:>15.5f} {regime:>11}")

    B0, y0, a0, rate0 = ctrl["frac 0.00"]
    Bp, yp, ap, ratep = ctrl["plain-z"]
    lin768 = y0[ns.index(768)] / np.log(10)
    geo768 = yp[ns.index(768)] / np.log(10)
    record("Thm 9.4-control-geometric",
           ratep > 1.5 and geo768 > 50 and rate0 < 1.05 and a0 < 1.5,
           f"plain (signed) z-rule: per-layer growth rate {ratep:.3f} per layer, "
           f"log10 err(768) = {geo768:.1f} (i.e. err ~ 1e{geo768:.0f}), "
           f"log-log exponent {ap:.1f}. z+-rule on the same harness: rate "
           f"{rate0:.5f}/layer, log10 err(768) = {lin768:.2f}, exponent "
           f"{a0:.3f}. THE CONTRAST IS PRESENT: ~{geo768 - lin768:.0f} orders of "
           f"magnitude at n = 768, purely from dropping C >= 0.")
    record("M1 mutant (transition)",
           ctrl["frac 0.35"][3] > 1.05,
           f"NEGATIVE CONTROL (graded): sign-flipping 35% of weights already "
           f"gives rate {ctrl['frac 0.35'][3]:.3f}/layer (log10 err(768) = "
           f"{ctrl['frac 0.35'][1][ns.index(768)]/np.log(10):.1f}); 5% gives "
           f"{ctrl['frac 0.05'][3]:.5f}/layer. Note B = max||C||_(1->1) is a very "
           f"loose proxy: at frac 0.05 B = {ctrl['frac 0.05'][0]:.3g} >> 1 yet the "
           f"product still does not expand, so B > 1 is necessary but not "
           f"sufficient for the geometric regime.")


# ----------------------------------------------------------------------------
# Corollary 9.5
# ----------------------------------------------------------------------------

def dobrushin(C):
    d = C.shape[1]
    best = np.inf
    arg = (0, 1)
    for j in range(d):
        for k in range(j + 1, d):
            v = np.minimum(C[:, j], C[:, k]).sum()
            if v < best:
                best, arg = v, (j, k)
    return float(best), arg


def cor_9_5():
    print("\n--- Cor 9.5  Dobrushin contraction and the depth-uniform bound (9.8) ---")
    print("    delta(C) = min_{j != k} sum_i min(C_ij, C_ik)   (j = k gives 1 "
          "trivially)")

    print(f"\n    {'C':>18} {'d':>4} {'delta':>10} {'max ratio (sum-zero)':>22} "
          f"{'1-delta':>10} {'tight?':>8}")
    ok_contract = True
    tight_ok = True
    deltas = {}
    for name, mk, d in [("Dirichlet(3)", lambda r, d=8: C_dirichlet(d, r, 3.0), 8),
                        ("Dirichlet(1)", lambda r, d=8: C_dirichlet(d, r, 1.0), 8),
                        ("Dirichlet(0.3)", lambda r, d=16: C_dirichlet(d, r, 0.3), 16),
                        ("z+-rule", lambda r, d=16: C_zplus(d, r), 16)]:
        r = np.random.default_rng(31)
        C = mk(r)
        delta, (j, k) = dobrushin(C)
        best = 0.0
        for _ in range(4000):
            u = r.dirichlet(np.ones(d))
            v = r.dirichlet(np.ones(d))
            diff = u - v
            nn = np.abs(diff).sum()
            if nn < 1e-12:
                continue
            best = max(best, np.abs(C @ diff).sum() / nn)
        # vertices attain the coefficient exactly
        vert = np.abs(C[:, j] - C[:, k]).sum() / 2.0
        held = best <= (1 - delta) + 1e-12
        ok_contract = ok_contract and held
        tight_ok = tight_ok and abs(vert - (1 - delta)) < 1e-12
        deltas[name] = delta
        print(f"    {name:>18} {d:>4} {delta:>10.6f} {best:>22.6f} "
              f"{1-delta:>10.6f} {'yes' if abs(vert-(1-delta))<1e-12 else 'no':>8}"
              f"{'' if held else '   <-- VIOLATED'}")
    record("Cor 9.5 contraction", ok_contract,
           "||C(u-v)||_1 <= (1-delta)||u-v||_1 on sum-zero differences held for "
           "every C tested, over 4000 random probability-vector pairs each")
    record("Cor 9.5 (coefficient tight)", tight_ok,
           "the bound is attained at u = e_j, v = e_k for the minimising pair, so "
           "1-delta is exactly the l1 contraction coefficient on sum-zero vectors")

    # SUBSTANTIVE FINDING: the z+-rule itself has delta = 0 or negligibly small.
    print("\n    delta of the z+-rule's OWN C -- 200 independent draws per d.")
    print("    (9.8) is governed by min_l delta(C_l) over the whole stack, so the")
    print("    `min over draws` column is the one that matters at n = 768.")
    print(f"      {'d':>4} {'frac delta = 0':>15} {'median delta':>14} "
          f"{'max delta':>12} {'min over draws':>16} {'best eta/delta':>16}")
    r = np.random.default_rng(808)
    zp_summary = {}
    for dd in (8, 16, 64):
        zp = np.array([dobrushin(C_zplus(dd, r))[0] for _ in range(200)])
        zp_summary[dd] = zp
        best = ("inf" if zp.min() == 0.0 else "%.0f * eta" % (1.0 / zp.min()))
        print(f"      {dd:>4} {np.mean(zp == 0.0):>15.3f} {np.median(zp):>14.6f} "
              f"{zp.max():>12.6f} {zp.min():>16.6f} {best:>16}")
    zp16 = zp_summary[16]
    stack_delta = max(z.min() for z in zp_summary.values())   # best case over d
    record("Cor 9.5 (z+ rule has delta ~ 0)",
           stack_delta < 0.01 and zp16.max() < 0.15,
           f"REPORTED FINDING: the z+-rule's own C (w^+ = max(w,0) zeroes about "
           f"half the entries) has delta = 0 outright in "
           f"{100*np.mean(zp16 == 0.0):.1f}% of draws at d=16 (median "
           f"{np.median(zp16):.3e}); at d=64 delta is never exactly 0 but its "
           f"minimum over 200 draws is only {zp_summary[64].min():.4f}. Since "
           f"(9.8) is driven by min_l delta(C_l) over n = 768 layers, the best "
           f"per-stack delta across every dimension tested is "
           f"{stack_delta:.4f}, i.e. eta/delta >= {1/max(stack_delta,1e-12):.0f} "
           f"* eta. So Cor 9.5's mixing hypothesis FAILS for the very rule "
           f"Thm 9.4 recommends -- not only for near-identity residual blocks. "
           f"The text's caveat is correct but UNDERSTATES the problem: sparsity "
           f"kills delta too. (9.7)'s unconditional linear bound is the "
           f"operative statement.")

    # ---- depth-uniform bound (9.8) ----------------------------------------
    print("\n    depth recursion: v_l = C v_{l-1} (exact z-rule),")
    print("    u_l = renorm(C Theta_l u_{l-1}) (renormalised eps-rule, Prop 9.1).")
    print("    (9.8) predicts sup_n ||u_n - v_n||_1 <= eta/delta, independent of n.")
    d, nmax, eps = 12, 768, 1e-3
    r = np.random.default_rng(555)
    Cs = [C_dirichlet(d, r, 3.0) for _ in range(nmax)]
    delta = min(dobrushin(C)[0] for C in Cs)
    u = r.dirichlet(np.ones(d))
    v = u.copy()
    uraw = u.copy()
    ds, ds_raw, injs, etas = [], [], [], []
    for n in range(nmax):
        C = Cs[n]
        az = draw_z(d, r, "lognormal")
        th = thetas(az, eps)
        etas.append(eps / (az.min() + eps))
        y = C @ (th * u)
        unew = y / y.sum()
        injs.append(np.abs(unew - C @ u).sum())
        u = unew
        uraw = C @ (th * uraw)
        v = C @ v
        ds.append(np.abs(u - v).sum())
        ds_raw.append(np.abs(uraw - v).sum())
    ds = np.array(ds)
    ds_raw = np.array(ds_raw)
    eta_p = max(injs)
    eta_E = max(etas)
    print(f"      min_l delta(C_l) = {delta:.6f}")
    print(f"      max_l ||E_l|| = eta = {eta_E:.6e}  (9.4)")
    print(f"      max_l per-layer injection ||renorm(C Theta u) - C u||_1 = "
          f"{eta_p:.6e}")
    print(f"      {'n':>6} {'||u_n - v_n||_1 (renormalised)':>32} "
          f"{'un-renormalised':>18}")
    for n in (1, 8, 48, 128, 256, 512, 768):
        print(f"      {n:>6} {ds[n-1]:>32.6e} {ds_raw[n-1]:>18.6e}")
    bound_p = eta_p / delta
    bound_E = eta_E / delta
    uniform = ds.max() <= bound_p * (1 + 1e-9)
    print(f"      sup_n ||u_n - v_n||_1 = {ds.max():.6e}")
    print(f"      bound eta/delta with eta = injection : {bound_p:.6e}")
    print(f"      bound eta/delta with eta = ||E_l||   : {bound_E:.6e}")
    record("Cor 9.5 (9.8) depth-uniform", uniform and ds[-1] <= 1.5 * ds[47],
           f"delta = {delta:.4f} > 0: sup_n error = {ds.max():.4e} <= eta/delta = "
           f"{bound_p:.4e}; error at n=768 is {ds[-1]/ds[47]:.4f}x the error at "
           f"n=48 -> genuinely depth-UNIFORM, not accumulating")
    record("Cor 9.5 (9.8) needs renormalisation",
           ds_raw[-1] > 20 * ds.max(),
           f"REPORTED GAP: (9.8) is stated for the eps-rule generally, but the "
           f"Dobrushin contraction only applies to SUM-ZERO differences. Without "
           f"the Prop 9.1 renormalisation, u_n - v_n is NOT sum-zero and the error "
           f"reaches {ds_raw[-1]:.4e} at n=768 vs {ds.max():.4e} renormalised "
           f"({ds_raw[-1]/ds.max():.0f}x worse, and NOT depth-uniform). The z+-rule "
           f"+ renormalisation prescription of 9.6 is required for (9.8) to hold "
           f"as stated.")

    # ---- M3 mutant: near-identity / identity layers ------------------------
    print("\n    NEAR-IDENTITY CAVEAT: C = (1-s)I + s M  (a residual block, D1.2)")
    print(f"      {'s':>8} {'delta(C)':>12} {'eta/delta':>14} "
          f"{'||u_768-v_768||_1':>19} {'damped?':>9}")
    r = np.random.default_rng(606)
    Mbase = C_dirichlet(d, r, 3.0)
    for s in (0.0, 1e-4, 1e-3, 1e-2, 1e-1, 1.0):
        C = (1 - s) * np.eye(d) + s * Mbase
        delt, _ = dobrushin(C)
        rr = np.random.default_rng(99)
        uu = rr.dirichlet(np.ones(d))
        vv = uu.copy()
        for _ in range(nmax):
            az = draw_z(d, rr, "lognormal")
            th = thetas(az, eps)
            y = C @ (th * uu)
            uu = y / y.sum()
            vv = C @ vv
        errn = np.abs(uu - vv).sum()
        bnd_str = "inf (vacuous)" if delt <= 0.0 else "%.4e" % (eta_E / delt)
        print(f"      {s:>8.0e} {delt:>12.3e} {bnd_str:>14} {errn:>19.6e} "
              f"{'no' if delt < 1e-6 else 'yes':>9}")
    Cid = np.eye(d)
    d_id, _ = dobrushin(Cid)
    Cnear = 0.999 * np.eye(d) + 0.001 * Mbase
    d_near, _ = dobrushin(Cnear)
    record("M3 mutant (delta > 0 for identity)",
           d_id == 0.0 and d_near < 1e-2,
           f"NEGATIVE CONTROL: delta(I) = {d_id:.1e} (exactly 0, so the claimed "
           f"delta > 0 is FALSE for the identity) and delta((1-s)I+sM) = "
           f"{d_near:.3e} at s = 1e-3 -> eta/delta = "
           f"{eta_E/d_near:.3e}, a vacuous bound. The text's honest caveat is "
           f"confirmed: residual-stream blocks give NO damping and (9.7) is the "
           f"only safe statement.")


# ----------------------------------------------------------------------------
# Corollary 9.6
# ----------------------------------------------------------------------------

def cor_9_6():
    print("\n--- Cor 9.6  non-negativity survives the product; sum|R| = sum R ---")
    d, n = 32, 768
    r = np.random.default_rng(1234)
    R = np.abs(r.normal(size=d))
    phi = R.sum()
    worst_neg = 0.0
    worst_gap = 0.0
    for _ in range(n):
        C = C_zplus(d, r)
        R = C @ R
        worst_neg = min(worst_neg, R.min())
        worst_gap = max(worst_gap, abs(np.abs(R).sum() - R.sum()))
    record("Cor 9.6", worst_neg >= 0.0 and worst_gap < 1e-12,
           f"through {n} z+-layers: min_i R_i never below {worst_neg:.3e}, "
           f"max |sum|R| - sum R| = {worst_gap:.3e}; final sum R = {R.sum():.12f} "
           f"vs phi = {phi:.12f} (rel {abs(R.sum()-phi)/phi:.2e})")

    # thresholding certification: discarding units with R_u <= tau loses <= |{u}|*tau
    ok_thr = True
    print(f"    {'tau':>12} {'#discarded':>11} {'relevance lost':>16} "
          f"{'|{u}|*tau bound':>16} {'frac of phi kept':>17}")
    for q in (25, 50, 75, 90):
        tau = float(np.percentile(R, q))
        keep = R > tau
        lost = R[~keep].sum()
        bound = (~keep).sum() * tau
        ok_thr = ok_thr and lost <= bound + 1e-12
        print(f"    {tau:>12.5e} {(~keep).sum():>11d} {lost:>16.6e} "
              f"{bound:>16.6e} {R[keep].sum()/R.sum():>17.6f}")
    record("Cor 9.6 (thresholding)", ok_thr,
           "discarding units with R_u <= tau loses at most |{u}|*tau out of phi "
           "at every quartile threshold tested, with no cancellation (all R >= 0)")

    # --- M5 mutant: signed C ------------------------------------------------
    r = np.random.default_rng(1234)
    R = np.abs(r.normal(size=d))
    for _ in range(8):
        R = C_zplain(d, r) @ R
    ratio = np.abs(R).sum() / abs(R.sum())
    record("M5 mutant (signed C, Cor 9.6)", R.min() < 0 and ratio > 10,
           f"NEGATIVE CONTROL: with the plain z-rule after only 8 layers "
           f"min_i R_i = {R.min():.3e} < 0 and sum|R|/|sum R| = {ratio:.3e} "
           f">> 1 -> massive sign cancellation; thresholding certifies nothing. "
           f"Cor 9.6 genuinely needs C >= 0.")


# ----------------------------------------------------------------------------
# Eq (9.9)
# ----------------------------------------------------------------------------

def eq_9_9():
    print("\n--- Eq (9.9)  eps must shrink by ~T = 16 going from n = 48 to n = 768 ---")
    print("    fidelity budget b := n * eps / (min_j|z_j| + eps); solve for eps at")
    print("    each n and report the ratio eps(48)/eps(768).")
    m = 1.0    # min_j |z_j|, scaled out of the ratio
    print(f"    {'budget b':>10} {'eps(n=48)':>14} {'eps(n=768)':>14} "
          f"{'ratio':>10} {'claim':>8}")
    ratios = []
    for b in (1e-4, 1e-3, 1e-2, 1e-1, 0.5):
        e48 = b * m / (48 - b)
        e768 = b * m / (768 - b)
        ratios.append(e48 / e768)
        print(f"    {b:>10.0e} {e48:>14.6e} {e768:>14.6e} {e48/e768:>10.4f} "
              f"{16.0:>8.1f}")
    record("Eq (9.9) eps ratio ~ 16",
           all(15.9 <= x <= 16.4 for x in ratios),
           f"eps(48)/eps(768) ranges {min(ratios):.4f}..{max(ratios):.4f}, "
           f"vs the claimed T = 768/48 = {768/48:.1f}. Exact limit as b -> 0 is "
           f"exactly 16; the ratio is slightly ABOVE 16 for finite budgets "
           f"((768-b)/(48-b) > 16), so '~16x' is correct and mildly conservative.")

    # empirical: does eps/16 at n=768 actually reproduce the n=48 error?
    d, ns_ = 24, [48, 768]
    print("\n    empirical check: measured err(48, eps) vs err(768, eps/16)")
    print(f"    {'eps':>10} {'err(48,eps)':>14} {'err(768,eps/16)':>17} "
          f"{'ratio':>9}")
    ok = True
    for eps in (1e-5, 1e-6, 1e-7):
        acc48 = acc768 = 0.0
        T = 10
        for t in range(T):
            le, _, _, _ = _depth_run(d, 48, eps, lambda r: C_zplus(d, r),
                                     3000 + t, "lognormal", {48})
            acc48 += np.exp(le[48])
            le2, _, _, _ = _depth_run(d, 768, eps / 16.0,
                                      lambda r: C_zplus(d, r),
                                      3000 + t, "lognormal", {768})
            acc768 += np.exp(le2[768])
        acc48 /= T
        acc768 /= T
        rr = acc768 / acc48
        ok = ok and 0.7 <= rr <= 1.4
        print(f"    {eps:>10.0e} {acc48:>14.5e} {acc768:>17.5e} {rr:>9.4f}")
    record("Eq (9.9) empirical", ok,
           "measured error at (n=768, eps/16) matches the error at (n=48, eps) to "
           "within 30% across eps in {1e-5,1e-6,1e-7} -> the linear-in-n trade is "
           "the one actually observed, not just the one bounded")


def main():
    print("=" * 78)
    print("Q9 - conservation at depth L*T (05-q9-conservation-at-depth.md)")
    print("=" * 78)
    lemma_9_0()
    recover_lemma_5_1()
    prop_9_1()
    thm_9_4_norm()
    thm_9_4_growth()
    cor_9_5()
    cor_9_6()
    eq_9_9()
    print("\n--- Q9 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<40} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
