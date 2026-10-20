#!/usr/bin/env python3
"""
Machine verification of Lemma 1 (LayerNorm Jacobian and gradient-input action).

Definitions (D2, 01-preliminaries.md):
    mu    = (1/d) 1^T x
    c     = x - mu*1 = P x,      P = I - (1/d) 1 1^T
    sigma = sqrt(eps + ||c||^2 / d)
    xhat  = c / sigma

Claims (02-lemmas.md):
    (L1.1)  d xhat/dx  = (1/sigma) ( P - (1/d) xhat xhat^T )
    (L1.2)  (d xhat/dx) x = (eps/sigma^2) xhat        <-- NOT identically zero
    (L1.3)  sigma-detached:  (d~ xhat/dx) x = xhat    (exact)
    (L1.4)  mu,sigma-detached: (d~ xhat/dx) x = x/sigma = xhat + (mu/sigma) 1

Everything is checked symbolically (sympy, small d) and numerically
(numpy, large d, incl. central finite differences).

NOTE ON JACOBIAN CONVENTION: J[i,j] = d xhat_i / d x_j.
"""

import numpy as np
import sympy as sp

SEED = 20240823
rng = np.random.default_rng(SEED)

results = {}          # label -> bool
notes = []            # extra lines printed at the end


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}: {detail}")


# --------------------------------------------------------------------------
# symbolic machinery
# --------------------------------------------------------------------------
def sym_layernorm(d, eps_sym):
    """Return (x_vec, c, sigma, xhat, P) as sympy objects for dimension d."""
    x = sp.Matrix(sp.symbols(f"x0:{d}", real=True))
    one = sp.ones(d, 1)
    P = sp.eye(d) - one * one.T / d
    c = P * x
    sigma = sp.sqrt(eps_sym + (c.T * c)[0, 0] / d)
    xhat = c / sigma
    return x, c, sigma, xhat, P


def symbolic_checks():
    print("\n--- SYMBOLIC (sympy) ---")
    eps = sp.Symbol("epsilon", positive=True)

    for d in (3, 4):
        x, c, sigma, xhat, P = sym_layernorm(d, eps)

        # ---- L1.1: Jacobian closed form -----------------------------------
        J_direct = xhat.jacobian(x)
        J_closed = (P - (xhat * xhat.T) / d) / sigma
        diff = sp.simplify(sp.expand(J_direct - J_closed))
        ok = diff == sp.zeros(d, d)
        record("L1.1", ok, f"symbolic d={d}: simplify(J_direct - J_closed) == 0  -> {ok}")

        # ---- L1.2: (dxhat/dx) x = (eps/sigma^2) xhat ----------------------
        lhs = sp.simplify(J_direct * x)
        rhs = sp.simplify(eps / sigma**2 * xhat)
        diff2 = sp.simplify(sp.expand(sp.simplify(lhs - rhs)))
        ok2 = all(sp.simplify(e) == 0 for e in diff2)
        record("L1.2", ok2,
               f"symbolic d={d}: simplify((dxhat/dx)x - (eps/sigma^2)xhat) == 0 -> {ok2}")

        # ---- L1.2 (i): NOT identically zero for eps > 0 --------------------
        # substitute a concrete non-degenerate point and a concrete eps
        subs_pt = {s: sp.Rational(v) for s, v in zip(x, range(1, d + 1))}
        subs_pt[eps] = sp.Rational(1, 100)
        val = sp.simplify(lhs.subs(subs_pt))
        nz = any(sp.simplify(e) != 0 for e in val)
        record("L1.2(i)", nz,
               f"symbolic d={d}: at x=(1..{d}), eps=1/100 -> (dxhat/dx)x = "
               f"{[sp.nsimplify(sp.N(e, 6)) for e in val]}  (nonzero: {nz})")

        # ---- L1.2 (ii): -> 0 as eps -> 0 ----------------------------------
        subs0 = {s: sp.Rational(v) for s, v in zip(x, range(1, d + 1))}
        lim = [sp.limit(sp.simplify(e.subs(subs0)), eps, 0, "+") for e in lhs]
        ok3 = all(sp.simplify(v) == 0 for v in lim)
        record("L1.2(ii)", ok3, f"symbolic d={d}: lim_{{eps->0+}} (dxhat/dx)x = {lim}")

        # ---- L1.3: sigma-detached ----------------------------------------
        s_const = sp.Symbol("sigma_c", positive=True)
        xhat_det = c / s_const                       # sigma frozen
        J_det = xhat_det.jacobian(x)                 # = P / sigma_c
        lhs3 = sp.simplify(J_det * x)
        rhs3 = sp.simplify(c / s_const)              # == xhat with sigma_c = sigma
        ok4 = all(sp.simplify(e) == 0 for e in (lhs3 - rhs3))
        record("L1.3", ok4,
               f"symbolic d={d}: (d~xhat/dx)x - xhat == 0 (sigma detached) -> {ok4}")

        # ---- L1.4: mu,sigma-detached -------------------------------------
        mu_const = sp.Symbol("mu_c", real=True)
        xhat_det2 = (x - mu_const * sp.ones(d, 1)) / s_const
        J_det2 = xhat_det2.jacobian(x)               # = I / sigma_c
        lhs4 = sp.simplify(J_det2 * x)
        rhs4 = x / s_const
        ok5 = all(sp.simplify(e) == 0 for e in (lhs4 - rhs4))
        # and x/sigma = xhat + (mu/sigma) 1  with mu the *true* mean
        mu_true = (sp.ones(1, d) * x)[0, 0] / d
        rhs4b = c / s_const + (mu_true / s_const) * sp.ones(d, 1)
        ok6 = all(sp.simplify(e) == 0 for e in (lhs4 - rhs4b))
        record("L1.4", ok5 and ok6,
               f"symbolic d={d}: (d~xhat/dx)x = x/sigma = xhat+(mu/sigma)1 -> "
               f"{ok5 and ok6}")

        # equals the output iff mu == 0
        gap = sp.simplify((lhs4 - c / s_const))      # = (mu/sigma) 1
        gap_norm2 = sp.simplify(sum(e**2 for e in gap))
        ok7 = sp.simplify(gap_norm2 - d * mu_true**2 / s_const**2) == 0
        record("L1.4(iff)", ok7,
               f"symbolic d={d}: ||(d~xhat/dx)x - xhat||^2 = d*mu^2/sigma^2 "
               f"(=0 iff mu=0) -> {ok7}")


# --------------------------------------------------------------------------
# numeric machinery
# --------------------------------------------------------------------------
def ln_forward(x, eps):
    d = x.size
    c = x - x.mean()
    sigma = np.sqrt(eps + (c @ c) / d)
    return c / sigma, c, sigma


def jac_closed(x, eps):
    d = x.size
    xhat, c, sigma = ln_forward(x, eps)
    P = np.eye(d) - np.ones((d, d)) / d
    return (P - np.outer(xhat, xhat) / d) / sigma


def jac_fd(x, eps, h=None):
    """Central finite-difference Jacobian, step scaled to the input."""
    d = x.size
    if h is None:
        h = 1e-6 * max(1.0, np.abs(x).max())
    J = np.empty((d, d))
    for j in range(d):
        xp = x.copy(); xp[j] += h
        xm = x.copy(); xm[j] -= h
        J[:, j] = (ln_forward(xp, eps)[0] - ln_forward(xm, eps)[0]) / (2 * h)
    return J


def numeric_checks():
    print("\n--- NUMERIC (numpy) ---")

    # ---- L1.1 numeric: closed form vs finite differences ------------------
    worst_fd, worst_cf = 0.0, 0.0
    for d in (64, 256):
        for trial in range(5):
            x = rng.normal(size=d) * rng.choice([0.1, 1.0, 10.0])
            eps = 1e-5
            Jc = jac_closed(x, eps)
            Jf = jac_fd(x, eps)
            rel = np.linalg.norm(Jc - Jf) / np.linalg.norm(Jc)
            worst_fd = max(worst_fd, rel)
            # closed form vs a second, independent construction:
            # J = (1/sigma)P - c c^T /(d sigma^3)
            xhat, c, sigma = ln_forward(x, eps)
            P = np.eye(d) - np.ones((d, d)) / d
            J2 = P / sigma - np.outer(c, c) / (d * sigma**3)
            worst_cf = max(worst_cf, np.linalg.norm(Jc - J2) / np.linalg.norm(Jc))
    record("L1.1", worst_fd < 1e-6 and worst_cf < 1e-12,
           f"numeric d=64,256: max rel err vs finite-diff = {worst_fd:.3e}, "
           f"vs alt closed form = {worst_cf:.3e}")

    # ---- L1.2 numeric ------------------------------------------------------
    # IMPORTANT CONDITIONING NOTE.
    # Jx is computed as a difference of O(||x||) terms whose true result has norm
    # (eps/sigma^2)||xhat||.  When eps/sigma^2 is tiny the evaluation is
    # catastrophically cancelling, so the *naive relative* error
    # ||Jx - rhs|| / ||rhs|| is dominated by float64 round-off and says nothing
    # about the lemma.  The well-conditioned quantity is the residual measured
    # against the scale of the terms actually being cancelled,
    #     kappa := || |J| |x| ||   (sum of term magnitudes),
    # i.e. a backward-error test.  We assert on that, and ALSO print the naive
    # relative error together with the predicted round-off floor
    # eps_mach * kappa / ||rhs|| so the reader can see they agree.
    worst_back, worst_naive, rows12 = 0.0, 0.0, []
    for d in (64, 256):
        for eps in (1e-8, 1e-5, 1e-2, 1.0):
            for scale in (0.01, 1.0, 100.0):
                x = rng.normal(size=d) * scale
                xhat, c, sigma = ln_forward(x, eps)
                Jm = jac_closed(x, eps)
                lhs = Jm @ x
                rhs = (eps / sigma**2) * xhat
                kappa = np.linalg.norm(np.abs(Jm) @ np.abs(x))
                absres = np.linalg.norm(lhs - rhs)
                back = absres / kappa                       # backward error
                naive = absres / max(np.linalg.norm(rhs), 1e-300)
                floor = np.finfo(np.float64).eps * kappa / max(
                    np.linalg.norm(rhs), 1e-300)
                worst_back = max(worst_back, back)
                worst_naive = max(worst_naive, naive)
                rows12.append((d, eps, scale, back, naive, floor))
    record("L1.2", worst_back < 1e-14,
           f"numeric: max BACKWARD err ||Jx-(eps/sigma^2)xhat|| / ||(|J||x|)|| "
           f"= {worst_back:.3e}  (max naive relative err = {worst_naive:.3e}, "
           f"which is round-off, see table)")

    print("\n  L1.2 conditioning table (naive rel err vs its round-off floor):")
    print(f"    {'d':>4} {'eps':>8} {'scale':>7} {'backward':>11} "
           f"{'naive rel':>11} {'rndoff floor':>13}")
    for (d_, e_, s_, b_, n_, f_) in rows12:
        if s_ == 100.0 or e_ == 1e-8:          # the cancelling cases
            print(f"    {d_:>4} {e_:>8.0e} {s_:>7} {b_:>11.2e} {n_:>11.2e} "
                  f"{f_:>13.2e}")
    dominated = all(n_ <= max(50 * f_, 1e-13) for (_, _, _, _, n_, f_) in rows12)
    record("L1.2(cancel)", dominated,
           "numeric: every naive relative error is within 50x of its predicted "
           "float64 round-off floor -> cancellation, not a wrong identity")

    # Independent confirmation: redo the worst case in float128.  If the identity
    # were wrong the error would be precision-independent; if it is cancellation
    # the error must fall by ~eps64/eps128.
    d = 256
    x128 = (rng.normal(size=d) * 100.0).astype(np.longdouble)
    for dt, name in ((np.float64, "float64"), (np.longdouble, "float128")):
        xx = x128.astype(dt)
        ee = dt(1e-8)
        cc = xx - xx.mean()
        ss = np.sqrt(ee + (cc @ cc) / d)
        xh = cc / ss
        Pm = (np.eye(d) - np.ones((d, d)) / d).astype(dt)
        Jm = (Pm - np.outer(xh, xh) / d) / ss
        res = np.linalg.norm(Jm @ xx - (ee / ss**2) * xh) / np.linalg.norm(
            (ee / ss**2) * xh)
        print(f"    same point in {name:>9}: naive rel err = {float(res):.3e} "
              f"(machine eps = {float(np.finfo(dt).eps):.1e})")
        if name == "float64":
            r64 = float(res)
        else:
            r128 = float(res)
    shrank = r128 < r64 / 100.0
    record("L1.2(prec)", shrank,
           f"numeric: error falls {r64/max(r128,1e-300):.1e}x when precision is "
           f"raised float64->float128 => finite-precision artefact, identity holds")

    # also against finite differences (independent of the closed form)
    d = 64
    x = rng.normal(size=d)
    eps = 1e-3
    xhat, c, sigma = ln_forward(x, eps)
    lhs_fd = jac_fd(x, eps) @ x
    rhs = (eps / sigma**2) * xhat
    rel = np.linalg.norm(lhs_fd - rhs) / np.linalg.norm(rhs)
    record("L1.2(fd)", rel < 1e-6,
           f"numeric d=64 eps=1e-3: finite-diff J times x vs (eps/sigma^2)xhat, "
           f"rel err = {rel:.3e}")

    # ---- L1.2 (i)/(ii)/(iii): the substantive part ------------------------
    print("\n  L1.2 detail (i): the quantity is NOT zero for eps > 0")
    d = 64
    x = rng.normal(size=d)
    for eps in (1e-12, 1e-8, 1e-5, 1e-2, 1.0):
        xhat, c, sigma = ln_forward(x, eps)
        g = jac_closed(x, eps) @ x
        ratio = np.linalg.norm(g) / np.linalg.norm(xhat)
        print(f"    eps={eps:<8.0e} sigma={sigma:.6f}  ||Jx||={np.linalg.norm(g):.6e}"
              f"  ||Jx||/||xhat||={ratio:.6e}  eps/sigma^2={eps/sigma**2:.6e}")
    nonzero = np.linalg.norm(jac_closed(x, 1e-2) @ x) > 0
    record("L1.2(i)", nonzero, "numeric: ||Jx|| > 0 strictly for every eps > 0 above")

    print("\n  L1.2 detail (ii): -> 0 as eps -> 0 (fixed x, unit-scale)")
    seq = []
    for eps in (1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12):
        xhat, c, sigma = ln_forward(x, eps)
        seq.append(np.linalg.norm(jac_closed(x, eps) @ x) / np.linalg.norm(xhat))
    monotone = all(seq[i] > seq[i + 1] for i in range(len(seq) - 1))
    record("L1.2(ii)", monotone and seq[-1] < 1e-10,
           f"numeric: ratio decreases monotonically to {seq[-1]:.3e} as eps->1e-12")

    # ---- L1.2 (iii): small sigma regime -----------------------------------
    print("\n  L1.2 detail (iii): SMALL-sigma regime (small-magnitude centred input)")
    print("    x = s * u  with u a fixed unit-norm centred direction, d=64, eps=1e-5")
    print(f"    {'scale s':>10} {'sigma':>12} {'eps/sigma^2':>14} "
          f"{'||Jx||/||xhat||':>17} {'rel.diff':>11}")
    d = 64
    u = rng.normal(size=d)
    u = u - u.mean()
    u = u / np.linalg.norm(u)
    eps = 1e-5
    rows = []
    for s in (1e0, 1e-1, 1e-2, 3e-3, 1e-3, 3e-4, 1e-4, 1e-5):
        x_s = s * u
        xhat, c, sigma = ln_forward(x_s, eps)
        g = jac_closed(x_s, eps) @ x_s
        ratio = np.linalg.norm(g) / np.linalg.norm(xhat)
        pred = eps / sigma**2
        rel = abs(ratio - pred) / pred
        rows.append((s, sigma, pred, ratio, rel))
        print(f"    {s:>10.1e} {sigma:>12.6e} {pred:>14.6e} {ratio:>17.6e} "
              f"{rel:>11.2e}")
    ok = all(r[4] < 1e-9 for r in rows) and rows[-1][3] > 0.99
    record("L1.2(iii)", ok,
           f"numeric: ratio == eps/sigma^2 to {max(r[4] for r in rows):.1e} rel; "
           f"at s=1e-5 the 'exactly zero' folklore is off by ratio "
           f"{rows[-1][3]:.6f} (i.e. grad-input is ~{100*rows[-1][3]:.2f}% of xhat)")
    notes.append(
        f"L1.2 small-sigma: with d=64, eps=1e-5, x=s*u (u unit-norm centred): "
        f"at s=1e-2 sigma={rows[2][1]:.3e}, ratio={rows[2][3]:.4e}; "
        f"at s=1e-3 sigma={rows[4][1]:.3e}, ratio={rows[4][3]:.4e}; "
        f"at s=1e-4 sigma={rows[6][1]:.3e}, ratio={rows[6][3]:.4e}; "
        f"at s=1e-5 sigma={rows[7][1]:.3e}, ratio={rows[7][3]:.4e}."
    )

    # ---- L1.3 numeric: sigma detached --------------------------------------
    print()
    worst = 0.0
    for d in (64, 256):
        for trial in range(5):
            x = rng.normal(size=d) * rng.choice([0.01, 1.0, 100.0])
            eps = 1e-5
            xhat, c, sigma = ln_forward(x, eps)
            P = np.eye(d) - np.ones((d, d)) / d
            J_det = P / sigma                     # sigma treated as a constant
            lhs = J_det @ x
            worst = max(worst, np.linalg.norm(lhs - xhat) / np.linalg.norm(xhat))
    record("L1.3", worst < 1e-13,
           f"numeric d=64,256: max rel err ||(d~xhat/dx)x - xhat|| = {worst:.3e}")

    # finite-difference version of the detached graph (sigma frozen at x0)
    d = 64
    x = rng.normal(size=d)
    eps = 1e-5
    xhat0, c0, sigma0 = ln_forward(x, eps)
    h = 1e-6
    Jd = np.empty((d, d))
    for j in range(d):
        xp = x.copy(); xp[j] += h
        xm = x.copy(); xm[j] -= h
        fp = (xp - xp.mean()) / sigma0            # sigma frozen
        fm = (xm - xm.mean()) / sigma0
        Jd[:, j] = (fp - fm) / (2 * h)
    rel = np.linalg.norm(Jd @ x - xhat0) / np.linalg.norm(xhat0)
    record("L1.3(fd)", rel < 1e-7,
           f"numeric d=64: finite-diff on sigma-detached graph, rel err = {rel:.3e}")

    # ---- L1.4 numeric: mu,sigma detached -----------------------------------
    worst_a, worst_b, gaps = 0.0, 0.0, []
    for d in (64, 256):
        for trial in range(5):
            x = rng.normal(size=d) * rng.choice([0.01, 1.0, 100.0])
            eps = 1e-5
            xhat, c, sigma = ln_forward(x, eps)
            mu = x.mean()
            J_det2 = np.eye(d) / sigma            # mu and sigma both constant
            lhs = J_det2 @ x
            worst_a = max(worst_a,
                          np.linalg.norm(lhs - x / sigma) / np.linalg.norm(x / sigma))
            rhs_b = xhat + (mu / sigma) * np.ones(d)
            worst_b = max(worst_b,
                          np.linalg.norm(lhs - rhs_b) / np.linalg.norm(rhs_b))
            gaps.append(np.linalg.norm(lhs - xhat))
    record("L1.4", worst_a < 1e-14 and worst_b < 1e-13,
           f"numeric: (d~xhat/dx)x = x/sigma (rel {worst_a:.2e}) "
           f"= xhat+(mu/sigma)1 (rel {worst_b:.2e})")

    # equals output iff mu == 0
    d = 64
    x = rng.normal(size=d)
    eps = 1e-5
    xc = x - x.mean()                              # mu = 0 exactly (to fp)
    xhat, c, sigma = ln_forward(xc, eps)
    lhs = xc / sigma
    err_mu0 = np.linalg.norm(lhs - xhat) / np.linalg.norm(xhat)
    x_off = xc + 3.0                               # mu = 3
    xhat2, c2, sigma2 = ln_forward(x_off, eps)
    lhs2 = x_off / sigma2
    err_mu3 = np.linalg.norm(lhs2 - xhat2) / np.linalg.norm(xhat2)
    pred_mu3 = np.sqrt(d) * abs(x_off.mean()) / sigma2 / np.linalg.norm(xhat2)
    ok = err_mu0 < 1e-14 and err_mu3 > 1e-3 and abs(err_mu3 - pred_mu3) < 1e-10
    record("L1.4(iff)", ok,
           f"numeric: mu=0 -> rel gap {err_mu0:.2e} (equals output); "
           f"mu={x_off.mean():.3f} -> rel gap {err_mu3:.4f} "
           f"(predicted sqrt(d)|mu|/(sigma||xhat||) = {pred_mu3:.4f})")


def main():
    print("=" * 78)
    print("LEMMA 1 - LayerNorm Jacobian and gradient-input action")
    print("=" * 78)
    symbolic_checks()
    numeric_checks()
    print()
    if notes:
        print("--- NOTES ---")
        for n in notes:
            print("  " + n)
        print()
    print("--- LEMMA 1 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<12} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
