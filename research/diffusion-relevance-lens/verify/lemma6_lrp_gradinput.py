#!/usr/bin/env python3
"""
Machine verification of Lemma 6 (on a detached graph, z-rule LRP = grad-input).

Setup (D7.2, no bias):  z_j = sum_i a_i w_{ij},  g_j := R_j / z_j  (z_j != 0).
    (L6.1)  R_i = sum_j [ a_i w_{ij} / z_j ] R_j
                = a_i * sum_j w_{ij} g_j
                = a_i * d/d a_i ( sum_j g_j z_j )

Also checked:
  - conservation sum_i R_i == sum_j R_j (the point of the z-rule);
  - Corollary 6.1: the whole assignment is one backward pass (a single matvec);
  - the z_j ~ 0 regime, where g_j = R_j/z_j blows up -- this is exactly why the
    eps-rule of D7 exists.  Reported with numbers, not hidden.
"""

import numpy as np
import sympy as sp

SEED = 1123581
rng = np.random.default_rng(SEED)

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


def symbolic():
    print("\n--- L6 SYMBOLIC (sympy) ---")
    for (m, n) in [(3, 2), (4, 3)]:
        a = sp.Matrix(sp.symbols(f"a0:{m}", real=True))
        W = sp.Matrix(m, n, sp.symbols(f"w0:{m*n}", real=True))
        R = sp.Matrix(sp.symbols(f"R0:{n}", real=True))
        z = (a.T * W).T                                  # z_j = sum_i a_i w_ij
        g = sp.Matrix([R[j] / z[j] for j in range(n)])

        # z-rule (D7.2), b = 0
        Ri_rule = sp.Matrix([sum(a[i] * W[i, j] / z[j] * R[j] for j in range(n))
                             for i in range(m)])
        # claimed closed form
        Ri_form = sp.Matrix([a[i] * sum(W[i, j] * g[j] for j in range(n))
                             for i in range(m)])
        ok1 = sp.simplify(Ri_rule - Ri_form) == sp.zeros(m, 1)
        record("L6.1(form)", ok1,
               f"symbolic m={m},n={n}: z-rule == a_i * sum_j w_ij g_j -> {ok1}")

        # gradient of the functional sum_j g_j z_j, with g treated as CONSTANT
        gc = sp.Matrix(sp.symbols(f"gc0:{n}", real=True))
        phi = sum(gc[j] * z[j] for j in range(n))
        Ri_grad = sp.Matrix([a[i] * sp.diff(phi, a[i]) for i in range(m)])
        Ri_grad = Ri_grad.subs({gc[j]: g[j] for j in range(n)})
        ok2 = sp.simplify(Ri_rule - Ri_grad) == sp.zeros(m, 1)
        record("L6.1(grad)", ok2,
               f"symbolic m={m},n={n}: z-rule == a_i * d(sum_j g_j z_j)/d a_i "
               f"(g detached) -> {ok2}")

        # conservation
        ok3 = sp.simplify(sum(Ri_rule) - sum(R)) == 0
        record("L6(cons)", ok3,
               f"symbolic m={m},n={n}: sum_i R_i == sum_j R_j -> {ok3}")


def numeric():
    print("\n--- L6 NUMERIC (numpy) ---")
    worst_form = worst_grad = worst_cons = 0.0
    for (m, n) in [(8, 5), (64, 32), (256, 128)]:
        for _ in range(5):
            a = rng.normal(size=m)
            W = rng.normal(size=(m, n)) / np.sqrt(m)
            R = rng.normal(size=n)
            z = a @ W
            # keep this block in the well-conditioned regime; z~0 handled below
            if np.abs(z).min() < 1e-3:
                continue
            g = R / z

            Ri_rule = np.array([sum(a[i] * W[i, j] / z[j] * R[j] for j in range(n))
                                for i in range(m)])
            Ri_form = a * (W @ g)
            worst_form = max(worst_form, np.abs(Ri_rule - Ri_form).max()
                             / np.abs(Ri_rule).max())

            # explicit "one backward pass": grad of phi = g.z with g detached
            # d phi / d a_i = sum_j g_j w_ij  ->  (W @ g),  then multiply by a
            h = 1e-6
            grad_fd = np.empty(m)
            for i in range(m):
                ap = a.copy(); ap[i] += h
                am = a.copy(); am[i] -= h
                grad_fd[i] = ((g @ (ap @ W)) - (g @ (am @ W))) / (2 * h)
            Ri_gradfd = a * grad_fd
            worst_grad = max(worst_grad, np.abs(Ri_rule - Ri_gradfd).max()
                             / np.abs(Ri_rule).max())

            worst_cons = max(worst_cons,
                             abs(Ri_rule.sum() - R.sum()) / np.abs(R).sum())

    record("L6.1(form)", worst_form < 1e-10,
           f"numeric m,n up to 256x128: max rel err |z-rule - a_i*sum_j w_ij g_j| "
           f"= {worst_form:.3e}")
    record("L6.1(grad)", worst_grad < 1e-7,
           f"numeric: max rel err vs a_i * (finite-diff grad of sum_j g_j z_j) "
           f"= {worst_grad:.3e}")
    record("L6(cons)", worst_cons < 1e-12,
           f"numeric: max rel err |sum_i R_i - sum_j R_j| = {worst_cons:.3e}")

    # ---- Corollary 6.1: one matvec, no d x d matrix -------------------------
    m, n = 512, 256
    a = rng.normal(size=m)
    W = rng.normal(size=(m, n)) / np.sqrt(m)
    R = rng.normal(size=n)
    z = a @ W
    g = R / z
    R_one_pass = a * (W @ g)                      # single backward matvec
    R_explicit = np.zeros(m)
    for j in range(n):                            # the naive per-j summation
        R_explicit += a * W[:, j] / z[j] * R[j]
    rel = np.abs(R_one_pass - R_explicit).max() / np.abs(R_explicit).max()
    record("L6(cor6.1)", rel < 1e-10,
           f"numeric m=512,n=256: one matvec a*(W@g) reproduces the full z-rule "
           f"assignment, max rel err = {rel:.3e} (no {m}x{m} matrix materialised)")

    # ---- the z_j ~ 0 regime -------------------------------------------------
    print("\n  z_j -> 0 regime (why D7's eps-rule exists):")
    print("  Construct a with z_0 driven to ~0 while R_0 stays O(1).")
    m, n = 32, 8
    W = rng.normal(size=(m, n)) / np.sqrt(m)
    a0 = rng.normal(size=m)
    R = rng.normal(size=n)
    # move a along -w_0 direction to null z_0 = a.w_0
    w0 = W[:, 0]
    t_star = (a0 @ w0) / (w0 @ w0)
    print(f"    {'z_0':>12} {'g_0=R_0/z_0':>15} {'max|R_i|':>14} "
          f"{'sum_i R_i':>14} {'sum_j R_j':>12} {'cons.err':>11}")
    blowup = []
    for frac in (1.0, 1e-1, 1e-3, 1e-6, 1e-9, 1e-12, 0.0):
        a = a0 - (1 - frac) * t_star * w0
        z = a @ W
        with np.errstate(divide="ignore", invalid="ignore"):
            g = R / z
            Ri = a * (W @ g)
        cons = abs(np.nansum(Ri) - R.sum()) / abs(R.sum())
        print(f"    {z[0]:>12.3e} {g[0]:>15.3e} {np.abs(Ri).max():>14.3e} "
              f"{np.nansum(Ri):>14.3e} {R.sum():>12.3e} {cons:>11.3e}")
        blowup.append((z[0], np.abs(Ri).max(), cons))

    # (L6.1) is an identity wherever z_j != 0; it says nothing at z_j == 0.
    finite_cases = [b for b in blowup if b[0] != 0.0 and np.isfinite(b[1])]
    grows = finite_cases[-1][1] > 1e6 * finite_cases[0][1]
    record("L6(z~0)", grows,
           f"numeric: as z_0 -> 0 the relevance blows up like 1/z_0 "
           f"(max|R_i| goes {finite_cases[0][1]:.2e} -> {finite_cases[-1][1]:.2e}); "
           f"(L6.1) is stated only for z_j != 0, and D7's eps-rule is exactly the "
           f"documented remedy")

    # z_j == 0 EXACTLY -> g_j is inf/nan: the rule is undefined, as stated.
    # Build an exact zero by construction (a orthogonal to w_0 by symmetry)
    # rather than by cancellation, which in floating point lands *near* 0, not on it.
    a_ex = np.zeros(m)
    a_ex[0] = 1.0
    a_ex[1] = 1.0
    W_ex = W.copy()
    W_ex[:, 0] = 0.0
    W_ex[0, 0] = 1.0
    W_ex[1, 0] = -1.0                     # z_0 = a[0]*1 + a[1]*(-1) = 0 exactly
    z_ex = a_ex @ W_ex
    assert z_ex[0] == 0.0, f"construction failed: z_0 = {z_ex[0]!r}"
    with np.errstate(divide="ignore", invalid="ignore"):
        g_ex = R / z_ex
    undef = not np.isfinite(g_ex[0])
    record("L6(z=0)", undef,
           f"numeric: at z_0 == 0.0 exactly (by construction), g_0 = {g_ex[0]} "
           f"-> z-rule undefined, correctly excluded by the 'z_j != 0' hypothesis")

    # The practically worse case: floating point almost never lands ON zero, it
    # lands NEAR it, so the failure is a silent huge finite number, not an inf.
    a_near = a0 - t_star * w0
    z_near = a_near @ W
    with np.errstate(divide="ignore", invalid="ignore"):
        g_near = R / z_near
        R_near = a_near * (W @ g_near)
    silent = np.all(np.isfinite(g_near)) and np.abs(R_near).max() > 1e10
    record("L6(z~0,silent)", silent,
           f"numeric: cancelling to 'zero' actually gives z_0 = {z_near[0]:.3e} "
           f"(not 0), so g_0 = {g_near[0]:.3e} is FINITE and max|R_i| = "
           f"{np.abs(R_near).max():.3e} -- the z-rule fails silently rather than "
           f"raising, which is the practical argument for the eps-rule")

    # eps-rule restores finiteness but weakens conservation to sum_i R_i <= sum_j R_j
    print("\n  eps-rule (D7): denominator z_j + eps*sign(z_j)")
    print(f"    {'eps':>10} {'max|R_i|':>14} {'sum_i R_i':>14} {'sum_j R_j':>12} "
          f"{'|sum_i|<=|sum_j|':>18}")
    a = a0 - (1 - 1e-9) * t_star * w0
    z = a @ W
    ok_eps = True
    for eps in (0.0, 1e-9, 1e-6, 1e-3, 1e-1):
        sgn = np.where(z >= 0, 1.0, -1.0)
        with np.errstate(divide="ignore", invalid="ignore"):
            ge = R / (z + eps * sgn)
            Rie = a * (W @ ge)
        le = abs(np.nansum(Rie)) <= abs(R.sum()) * (1 + 1e-9)
        if eps > 0:
            ok_eps = ok_eps and np.all(np.isfinite(Rie))
        print(f"    {eps:>10.0e} {np.abs(Rie).max():>14.3e} "
              f"{np.nansum(Rie):>14.3e} {R.sum():>12.3e} {str(le):>18}")
    record("L6(eps-rule)", ok_eps,
           "numeric: eps-rule keeps every R_i finite in the z~0 regime "
           "(conservation is correspondingly weakened, as D7 states)")


def main():
    print("=" * 78)
    print("LEMMA 6 - On a detached graph, z-rule LRP = gradient-input")
    print("=" * 78)
    symbolic()
    numeric()
    print("\n--- LEMMA 6 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<16} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
