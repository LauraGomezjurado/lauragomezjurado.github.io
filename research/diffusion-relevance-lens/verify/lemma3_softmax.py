#!/usr/bin/env python3
"""
Machine verification of Lemma 3 (softmax Jacobian).

For p = softmax(z),  J = diag(p) - p p^T.  Claims:
    (a) J 1 = 0
    (b) J >= 0 (PSD), and z^T J z = Var_p(z)
    (c) rank(J) <= n - 1
    (d) ||J||_2 <= max_i p_i

Symbolic (small n) + numeric over many random p, including near-peaked p to
stress (d), plus a check that J really is the softmax Jacobian (finite diffs).
"""

import numpy as np
import sympy as sp

SEED = 90210
rng = np.random.default_rng(SEED)

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()


def symbolic():
    print("\n--- L3 SYMBOLIC (sympy) ---")
    for n in (3, 4):
        z = sp.Matrix(sp.symbols(f"z0:{n}", real=True))
        e = sp.Matrix([sp.exp(zi) for zi in z])
        Zs = sum(e)
        p = e / Zs
        Jd = p.jacobian(z)                       # true softmax Jacobian
        Jc = sp.diag(*[p[i] for i in range(n)]) - p * p.T
        ok = sp.simplify(sp.expand(Jd - Jc)) == sp.zeros(n, n)
        record("L3(form)", ok,
               f"symbolic n={n}: d softmax/dz == diag(p) - p p^T -> {ok}")

        one = sp.ones(n, 1)
        ok_a = sp.simplify(Jc * one) == sp.zeros(n, 1)
        record("L3(a)", ok_a, f"symbolic n={n}: J*1 == 0 -> {ok_a}")

        w = sp.Matrix(sp.symbols(f"w0:{n}", real=True))
        quad = sp.expand((w.T * Jc * w)[0, 0])
        var = sp.expand(sum(p[i] * w[i] ** 2 for i in range(n))
                        - (sum(p[i] * w[i] for i in range(n))) ** 2)
        ok_b = sp.simplify(quad - var) == 0
        record("L3(b)", ok_b,
               f"symbolic n={n}: w^T J w == Var_p(w) = E[w^2]-E[w]^2 -> {ok_b}")


def numeric():
    print("\n--- L3 NUMERIC (numpy, many random p) ---")
    n_trials = 400
    worst_a = 0.0
    min_eig = np.inf
    worst_b = 0.0
    max_rank = 0
    worst_d_slack = -np.inf          # ||J||_2 - max p  (must stay <= 0)
    worst_form = 0.0
    peaked_rows = []

    regimes = [("uniform-ish", 0.5), ("moderate", 2.0), ("peaked", 12.0),
               ("very peaked", 40.0)]

    for name, scale in regimes:
        for n in (3, 10, 64, 256):
            for t in range(n_trials // 4):
                z = rng.normal(size=n) * scale
                p = softmax(z)
                J = np.diag(p) - np.outer(p, p)

                # (a)
                worst_a = max(worst_a, np.abs(J @ np.ones(n)).max())

                # (b) PSD + quadratic form = variance.
                # NOTE: for near-one-hot p the true Var_p(w) underflows to 0, so a
                # RELATIVE error against Var is meaningless (0/0).  The
                # well-conditioned measure is the residual against the scale of
                # the terms being differenced, E_p[w^2].
                ev = np.linalg.eigvalsh(J)
                min_eig = min(min_eig, ev.min())
                w = rng.normal(size=n)
                q = w @ J @ w
                m2 = (p * w**2).sum()
                var = m2 - (p * w).sum() ** 2
                worst_b = max(worst_b, abs(q - var) / max(m2, 1e-300))

                # (c) rank
                r = np.linalg.matrix_rank(J, tol=1e-12 * max(1.0, np.abs(J).max()))
                max_rank = max(max_rank, r - (n - 1))

                # (d) spectral norm bound
                nrm = ev.max()                    # J symmetric PSD
                worst_d_slack = max(worst_d_slack, nrm - p.max())
                if name in ("peaked", "very peaked") and n in (10, 64):
                    peaked_rows.append((n, p.max(), nrm, p.max() - nrm))

                # sanity: J is the actual softmax Jacobian (finite differences).
                # Central differences with step h have an absolute noise floor of
                # ~ eps_mach/h, so the tolerance must be mixed absolute+relative:
                # for very peaked p the true J underflows to ~1e-19 and finite
                # differences cannot resolve it at all (both sides are float noise).
                if n <= 10 and t < 2:
                    h = 1e-6
                    Jf = np.empty((n, n))
                    for j in range(n):
                        zp = z.copy(); zp[j] += h
                        zm = z.copy(); zm[j] -= h
                        Jf[:, j] = (softmax(zp) - softmax(zm)) / (2 * h)
                    absdiff = np.abs(Jf - J).max()
                    scaled = absdiff / (1e-9 + 1e-6 * np.abs(J).max())
                    worst_form = max(worst_form, scaled)

    record("L3(form)", worst_form < 1.0,
           f"numeric: J vs finite-diff softmax Jacobian, max residual / "
           f"(fd noise floor 1e-9 + 1e-6*max|J|) = {worst_form:.3e} (<1 means "
           f"agreement within finite-difference resolution)")
    record("L3(a)", worst_a < 1e-15,
           f"numeric ({4*4*(n_trials//4)} random p): max |J 1|_inf = {worst_a:.3e}")
    record("L3(b)", min_eig > -1e-14 and worst_b < 1e-12,
           f"numeric: min eigenvalue over all trials = {min_eig:.3e} "
           f"(>= 0 up to round-off), max |z^T J z - Var_p(z)| / E_p[z^2] = "
           f"{worst_b:.3e}")
    record("L3(c)", max_rank <= 0,
           f"numeric: max(rank(J) - (n-1)) = {max_rank} (<= 0, i.e. rank <= n-1)")
    record("L3(d)", worst_d_slack <= 1e-15,
           f"numeric: max(||J||_2 - max_i p_i) = {worst_d_slack:.3e} (<= 0)")

    print("\n  (d) stressed on peaked p (max_i p_i -> 1):")
    peaked_rows.sort(key=lambda r: -r[1])
    print(f"    {'n':>5} {'max_i p_i':>14} {'||J||_2':>14} {'slack':>14}")
    for row in peaked_rows[:8]:
        print(f"    {row[0]:>5} {row[1]:>14.10f} {row[2]:>14.10f} {row[3]:>14.3e}")

    # tightness: as p -> one-hot, ||J||_2 / max p -> ?  and J -> 0
    print("\n  (d) limit behaviour on an explicitly constructed peaked family:")
    print(f"    {'n':>4} {'t (logit gap)':>14} {'max p':>12} {'||J||_2':>12} "
          f"{'||J||_2/max p':>15}")
    n = 32
    for t in (0.0, 2.0, 5.0, 10.0, 20.0, 40.0):
        z = np.zeros(n); z[0] = t
        p = softmax(z)
        J = np.diag(p) - np.outer(p, p)
        nrm = np.linalg.eigvalsh(J).max()
        print(f"    {n:>4} {t:>14.1f} {p.max():>12.9f} {nrm:>12.3e} "
              f"{nrm/p.max():>15.6f}")
    # and the guaranteed null direction persists
    z = np.zeros(n); z[0] = 40.0
    p = softmax(z)
    J = np.diag(p) - np.outer(p, p)
    null = np.abs(J @ np.ones(n)).max()
    scale = max(np.abs(J).max(), np.finfo(float).tiny)
    smallest_ev = np.abs(np.linalg.eigvalsh(J)).min()
    record("L3(a,peaked)", null <= 1e-12 * max(scale, 1e-16) + 1e-15,
           f"numeric: even at max p = {p.max():.12f} (where max|J| = {scale:.3e}), "
           f"|J 1|_inf = {null:.3e} and min |eigenvalue| = {smallest_ev:.3e} "
           f"-> J is singular at every peakedness")


def main():
    print("=" * 78)
    print("LEMMA 3 - Softmax Jacobian J = diag(p) - p p^T")
    print("=" * 78)
    symbolic()
    numeric()
    print("\n--- LEMMA 3 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<16} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
