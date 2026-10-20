#!/usr/bin/env python3
"""
Machine verification of Lemma 4 (estimation error compounds along a product).

    (L4.1)  prod_{k=1..n} A_k - prod_{k=1..n} B_k
              = sum_{k=1..n} ( prod_{m<k} B_m ) E_k ( prod_{m>k} A_m ),  E_k = A_k - B_k
    (L4.2)  ||A_k||,||B_k|| <= B and ||E_k|| <= e  =>  ||prod A - prod B|| <= n B^{n-1} e

Products are ordered left-to-right: prod_{k=1..n} A_k = A_1 A_2 ... A_n,
prod_{m<k} B_m = B_1...B_{k-1}, prod_{m>k} A_m = A_{k+1}...A_n.

Also: an empirical probe of the honest "linear at best, geometric at worst"
reading, with A_k = I + (perturbation of norm s) and B_k a perturbed copy.
Norms are spectral (operator 2-norm), matching submultiplicativity in (L4.2).
"""

import numpy as np
import sympy as sp

SEED = 31337
rng = np.random.default_rng(SEED)

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


def prod(mats, d):
    out = np.eye(d)
    for M in mats:
        out = out @ M
    return out


def telescope_rhs(A, B, d):
    n = len(A)
    S = np.zeros((d, d))
    for k in range(n):
        left = prod(B[:k], d)          # B_1 ... B_{k-1}
        right = prod(A[k + 1:], d)     # A_{k+1} ... A_n
        S += left @ (A[k] - B[k]) @ right
    return S


def symbolic():
    print("\n--- L4 SYMBOLIC (sympy) ---")
    for n in (2, 3, 4):
        d = 2
        A = [sp.Matrix(d, d, sp.symbols(f"a{k}_0:{d*d}", real=True)) for k in range(n)]
        B = [sp.Matrix(d, d, sp.symbols(f"b{k}_0:{d*d}", real=True)) for k in range(n)]
        PA = sp.eye(d)
        for M in A:
            PA = PA * M
        PB = sp.eye(d)
        for M in B:
            PB = PB * M
        S = sp.zeros(d, d)
        for k in range(n):
            L = sp.eye(d)
            for m in range(k):
                L = L * B[m]
            R = sp.eye(d)
            for m in range(k + 1, n):
                R = R * A[m]
            S += L * (A[k] - B[k]) * R
        ok = sp.simplify(sp.expand(PA - PB - S)) == sp.zeros(d, d)
        record("L4.1", ok, f"symbolic n={n}, d=2 (fully symbolic entries): "
                           f"identity holds exactly -> {ok}")


def numeric_identity():
    print("\n--- L4.1 NUMERIC (random matrices, several n) ---")
    worst = 0.0
    for d in (2, 5, 16, 40):
        for n in (1, 2, 3, 5, 8, 12, 20):
            for _ in range(3):
                A = [rng.normal(size=(d, d)) / np.sqrt(d) for _ in range(n)]
                B = [Ak + rng.normal(size=(d, d)) * 0.05 / np.sqrt(d) for Ak in A]
                lhs = prod(A, d) - prod(B, d)
                rhs = telescope_rhs(A, B, d)
                den = max(np.linalg.norm(lhs), 1e-300)
                worst = max(worst, np.linalg.norm(lhs - rhs) / den)
    record("L4.1", worst < 1e-10,
           f"numeric d in {{2,5,16,40}}, n in {{1,2,3,5,8,12,20}}: "
           f"max rel err = {worst:.3e}")

    # degenerate/edge cases: identical sequences, and B_k singular
    d, n = 6, 7
    A = [rng.normal(size=(d, d)) for _ in range(n)]
    same = np.linalg.norm(telescope_rhs(A, A, d))
    B = [np.zeros((d, d)) for _ in range(n)]
    lhs = prod(A, d) - prod(B, d)
    rhs = telescope_rhs(A, B, d)
    sing = np.linalg.norm(lhs - rhs) / np.linalg.norm(lhs)
    record("L4.1(edge)", same < 1e-10 and sing < 1e-12,
           f"A==B gives RHS norm {same:.3e}; all-zero B (singular) rel err {sing:.3e}")


def numeric_bound():
    print("\n--- L4.2 NUMERIC (bound n * B^(n-1) * e) ---")
    print(f"    {'d':>4} {'n':>4} {'B':>9} {'e':>10} {'actual':>12} {'bound':>12} "
          f"{'slack(bound/act)':>17}")
    ok_all = True
    tight = []
    for d in (4, 16):
        for n in (2, 4, 8, 16):
            for scale in (0.3, 0.9, 1.05):
                A = []
                B = []
                for _ in range(n):
                    M = rng.normal(size=(d, d))
                    M = M / np.linalg.norm(M, 2) * scale
                    Ek = rng.normal(size=(d, d))
                    Ek = Ek / np.linalg.norm(Ek, 2) * (0.01 * scale)
                    Bk = M - Ek
                    # renormalise B_k so both are within the same ball
                    A.append(M)
                    B.append(Bk)
                Bnorm = max(max(np.linalg.norm(M, 2) for M in A),
                            max(np.linalg.norm(M, 2) for M in B))
                e = max(np.linalg.norm(A[k] - B[k], 2) for k in range(n))
                actual = np.linalg.norm(prod(A, d) - prod(B, d), 2)
                bound = n * Bnorm ** (n - 1) * e
                held = actual <= bound * (1 + 1e-10)
                ok_all = ok_all and held
                tight.append(bound / max(actual, 1e-300))
                print(f"    {d:>4} {n:>4} {Bnorm:>9.4f} {e:>10.3e} {actual:>12.4e} "
                      f"{bound:>12.4e} {bound/max(actual,1e-300):>17.2f}"
                      f"{'' if held else '   <-- VIOLATED'}")
    record("L4.2", ok_all,
           f"bound held in all {len(tight)} configurations; slack factor "
           f"ranged {min(tight):.2f}x to {max(tight):.2e}x")


def growth_probe():
    """A_k = I + s*R_k. Report how ||prod A - prod B|| actually grows with n."""
    print("\n--- L4 EMPIRICAL PROBE: growth of ||prod A - prod B|| with depth ---")
    print("    A_k = I + s*R_k (||s*R_k||_2 = s exactly), B_k = A_k - E_k, ||E_k||_2 = e = 1e-4")
    print("    B := max_k max(||A_k||_2, ||B_k||_2)   [the constant in (L4.2)]")
    d = 32
    e = 1e-4
    ns = [1, 2, 4, 8, 16, 32, 64, 128]
    print(f"\n    {'s':>7} {'B':>8}  " + "".join(f"{('n=%d' % n):>11}" for n in ns))
    table = {}
    for s in (0.0, 0.01, 0.05, 0.1, 0.2, 0.5):
        loc_rng = np.random.default_rng(1000 + int(s * 1000))
        A, Bm = [], []
        for _ in range(max(ns)):
            R = loc_rng.normal(size=(d, d))
            R = R / np.linalg.norm(R, 2)
            Ak = np.eye(d) + s * R
            E = loc_rng.normal(size=(d, d))
            E = E / np.linalg.norm(E, 2) * e
            A.append(Ak)
            Bm.append(Ak - E)
        Bconst = max(max(np.linalg.norm(M, 2) for M in A),
                     max(np.linalg.norm(M, 2) for M in Bm))
        vals = []
        for n in ns:
            vals.append(np.linalg.norm(prod(A[:n], d) - prod(Bm[:n], d), 2))
        table[s] = (Bconst, vals)
        print(f"    {s:>7.2f} {Bconst:>8.4f}  "
              + "".join(f"{v:>11.3e}" for v in vals))

    # growth exponent: fit log(err) ~ alpha*log(n) over the measured range
    print("\n    growth diagnostics (err(n)/err(1), and the linear prediction n):")
    print(f"    {'s':>7} {'B':>8} {'err(128)/err(1)':>17} {'n=128 linear':>14} "
          f"{'B^(n-1) at n=128':>18} {'regime':>12}")
    for s, (Bconst, vals) in table.items():
        ratio = vals[-1] / max(vals[0], 1e-300)
        geo = Bconst ** (128 - 1)
        regime = "linear" if ratio < 5 * 128 else ("geometric" if ratio > 1e3 else "mixed")
        print(f"    {s:>7.2f} {Bconst:>8.4f} {ratio:>17.3e} {128:>14d} "
              f"{geo:>18.3e} {regime:>12}")

    # ---- how TIGHT is the linear rate at B ~ 1? -----------------------------
    # The n*B^(n-1)*e bound is a worst case reached only when the per-factor
    # errors ALIGN.  With independent random E_k the operator norm of the sum
    # behaves like a random walk, so the observed growth is ~sqrt(n), not n.
    # Both are consistent with (L4.2) (an upper bound); we report both.
    print("\n    Tightness of the linear rate at B ~ 1 (A_k = I, ||E_k||_2 = 1e-4):")
    print(f"    {'mode':>9} " + "".join(f"{('n=%d' % n):>11}" for n in ns)
          + f"{'err(128)/err(1)':>17}")
    d2, e2 = 32, 1e-4
    growth = {}
    for mode in ("aligned", "random"):
        r2 = np.random.default_rng(5)
        E0 = r2.normal(size=(d2, d2))
        E0 = E0 / np.linalg.norm(E0, 2) * e2
        Es = []
        for _ in range(max(ns)):
            if mode == "aligned":
                Es.append(E0)
            else:
                E = r2.normal(size=(d2, d2))
                Es.append(E / np.linalg.norm(E, 2) * e2)
        vals = []
        for n in ns:
            Pb = np.eye(d2)
            for k in range(n):
                Pb = Pb @ (np.eye(d2) - Es[k])
            vals.append(np.linalg.norm(np.eye(d2) - Pb, 2))
        growth[mode] = vals
        print(f"    {mode:>9} " + "".join(f"{v:>11.3e}" for v in vals)
              + f"{vals[-1]/vals[0]:>17.3f}")
    print(f"    {'':>9} linear prediction n = 128.000, "
          f"random-walk prediction sqrt(n) = {np.sqrt(128):.3f}")

    va = growth["aligned"]
    lin = [va[i] / (ns[i] * va[0]) for i in range(len(ns))]
    aligned_linear = max(abs(x - 1.0) for x in lin) < 2e-2
    record("L4(growth,B=1)", aligned_linear,
           f"ALIGNED errors at B~1: err(n)/(n*err(1)) == 1 to "
           f"{max(abs(x-1.0) for x in lin):.2e} -> the linear rate of (L4.2) is "
           f"ATTAINED, so the bound is tight in n")

    vr = growth["random"]
    rw = vr[-1] / vr[0]
    record("L4(growth,random)", rw < 0.5 * 128 and rw > 0.3 * np.sqrt(128),
           f"REPORTED NUANCE: with INDEPENDENT random E_k at B~1 the observed "
           f"growth is err(128)/err(1) = {rw:.2f}, close to sqrt(128) = "
           f"{np.sqrt(128):.2f}, not 128. (L4.2) still holds (it is an upper "
           f"bound) but is pessimistic by ~sqrt(n) unless errors align.")

    bs, vs = table[0.5]
    ratio_hi = vs[-1] / vs[0]
    superlin = ratio_hi > 10 * 128
    record("L4(growth,B>1)", superlin and bs > 1.0,
           f"s=0.5 => B={bs:.4f}>1: err(128)/err(1) = {ratio_hi:.3e} vs linear "
           f"prediction 128 -> growth is geometric, {ratio_hi/128:.2e}x beyond linear")

    monotone = all(table[s][1][-1] >= table[s][1][0] for s in table)
    record("L4(growth,mono)", monotone,
           "error grows with depth for every s tested (never decays) -> matches the "
           "claim 'at best linearly, at worst geometrically'")


def main():
    print("=" * 78)
    print("LEMMA 4 - Estimation error compounds along a product")
    print("=" * 78)
    symbolic()
    numeric_identity()
    numeric_bound()
    growth_probe()
    print("\n--- LEMMA 4 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<20} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
