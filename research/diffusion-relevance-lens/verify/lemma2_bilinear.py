#!/usr/bin/env python3
"""
Machine verification of Lemma 2 (bilinear forms double-count under grad-input).

Claims (02-lemmas.md):
    (L2.1)  u^T grad_u f + v^T grad_v f = 2 f     for bilinear f(u,v)
    (L2.2)  v^T grad_v f |_{u detached}   = f

plus the stated APPLICATION to attention (D3):
    Q=XW_Q, K=XW_K, V=XW_V, S=QK^T/sqrt(d_h), P=softmax(S) row-wise, C = P V.
    "gradient-input attribution through an attention head over-attributes by a
     factor 2 relative to the head output; (p-detach) removes the Q,K branch and
     restores exact accounting."

The application is tested at TWO different levels, because they are not the same
statement:
    (A) variables = (P, V), the head's two immediate bilinear arguments;
    (B) variables = X, the layer input (what an attributor actually perturbs).
Level (B) is reported honestly whatever it does.

No torch: analytic gradients plus central finite differences.
"""

import numpy as np
import sympy as sp

SEED = 4242
rng = np.random.default_rng(SEED)

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


# --------------------------------------------------------------------------
# Part 1 - the abstract bilinear statement
# --------------------------------------------------------------------------
def symbolic_bilinear():
    print("\n--- L2 SYMBOLIC (sympy) ---")
    for (m, n) in [(2, 3), (3, 3), (4, 2)]:
        u = sp.Matrix(sp.symbols(f"u0:{m}", real=True))
        v = sp.Matrix(sp.symbols(f"v0:{n}", real=True))
        C = sp.Matrix(m, n, sp.symbols(f"c0:{m*n}", real=True))
        f = sum(u[i] * v[j] * C[i, j] for i in range(m) for j in range(n))
        f = sp.expand(f)

        gu = sp.Matrix([sp.diff(f, u[i]) for i in range(m)])
        gv = sp.Matrix([sp.diff(f, v[j]) for j in range(n)])
        lhs = sp.expand((u.T * gu)[0, 0] + (v.T * gv)[0, 0])
        ok = sp.simplify(lhs - 2 * f) == 0
        record("L2.1", ok, f"symbolic m={m},n={n}: u.gu + v.gv - 2f == 0 -> {ok}")

        # detached u: u is a constant symbol set, so only the v branch flows.
        ok2 = sp.simplify(sp.expand((v.T * gv)[0, 0]) - f) == 0
        record("L2.2", ok2, f"symbolic m={m},n={n}: v.gv - f == 0 (u detached) -> {ok2}")

        # each branch individually equals f (the reason the total is 2f)
        ok3 = sp.simplify(sp.expand((u.T * gu)[0, 0]) - f) == 0
        record("L2.1(branch)", ok3,
               f"symbolic m={m},n={n}: u.gu == f and v.gv == f individually -> "
               f"{ok3 and ok2}")


def numeric_bilinear():
    print("\n--- L2 NUMERIC (numpy, random larger dims) ---")
    worst1 = worst2 = 0.0
    for (m, n) in [(64, 96), (128, 128), (256, 32)]:
        for _ in range(5):
            u = rng.normal(size=m)
            v = rng.normal(size=n)
            C = rng.normal(size=(m, n))
            f = u @ C @ v
            gu = C @ v
            gv = C.T @ u
            lhs = u @ gu + v @ gv
            worst1 = max(worst1, abs(lhs - 2 * f) / max(abs(2 * f), 1e-300))
            worst2 = max(worst2, abs(v @ gv - f) / max(abs(f), 1e-300))
    record("L2.1", worst1 < 1e-12,
           f"numeric m,n up to 256: max rel err |u.gu+v.gv - 2f| = {worst1:.3e}")
    record("L2.2", worst2 < 1e-12,
           f"numeric: max rel err |v.gv - f| (u detached) = {worst2:.3e}")

    # finite-difference cross-check on the gradients themselves
    m, n = 40, 30
    u, v = rng.normal(size=m), rng.normal(size=n)
    C = rng.normal(size=(m, n))
    fn = lambda a, b: a @ C @ b
    h = 1e-6
    gu_fd = np.array([(fn(u + h * np.eye(m)[i], v) - fn(u - h * np.eye(m)[i], v))
                      / (2 * h) for i in range(m)])
    gv_fd = np.array([(fn(u, v + h * np.eye(n)[j]) - fn(u, v - h * np.eye(n)[j]))
                      / (2 * h) for j in range(n)])
    f = fn(u, v)
    lhs = u @ gu_fd + v @ gv_fd
    rel = abs(lhs - 2 * f) / abs(2 * f)
    record("L2.1(fd)", rel < 1e-8,
           f"numeric m=40,n=30 via central finite differences: rel err = {rel:.3e}")


# --------------------------------------------------------------------------
# Part 2 - concrete attention head (D3)
# --------------------------------------------------------------------------
def softmax_rows(S):
    S = S - S.max(axis=1, keepdims=True)
    E = np.exp(S)
    return E / E.sum(axis=1, keepdims=True)


def attn_forward(X, WQ, WK, WV):
    d_h = WQ.shape[1]
    Q, K, V = X @ WQ, X @ WK, X @ WV
    S = Q @ K.T / np.sqrt(d_h)
    P = softmax_rows(S)
    return P @ V, P, V, S


def attention_checks():
    print("\n--- L2 APPLICATION TO ATTENTION (D3) ---")
    N, d, d_h = 6, 8, 5
    X = rng.normal(size=(N, d)) * 0.7
    WQ = rng.normal(size=(d, d_h)) / np.sqrt(d)
    WK = rng.normal(size=(d, d_h)) / np.sqrt(d)
    WV = rng.normal(size=(d, d_h)) / np.sqrt(d)
    C, P, V, S = attn_forward(X, WQ, WK, WV)

    # ---- LEVEL (A): variables are (P, V) -----------------------------------
    # For each output entry C[n,h]:  sum_{ij} P_ij dC/dP_ij + sum_{jk} V_jk dC/dV_jk
    # Gradients by central finite differences on P and V as FREE variables
    # (i.e. exactly the bilinear map (P,V) |-> P V, softmax not involved).
    h = 1e-6
    twoC = np.zeros_like(C)
    onlyV = np.zeros_like(C)
    for nn in range(N):
        for hh in range(d_h):
            gP = np.zeros_like(P)
            for i in range(N):
                for j in range(N):
                    Pp = P.copy(); Pp[i, j] += h
                    Pm = P.copy(); Pm[i, j] -= h
                    gP[i, j] = ((Pp @ V)[nn, hh] - (Pm @ V)[nn, hh]) / (2 * h)
            gV = np.zeros_like(V)
            for j in range(N):
                for k in range(d_h):
                    Vp = V.copy(); Vp[j, k] += h
                    Vm = V.copy(); Vm[j, k] -= h
                    gV[j, k] = ((P @ Vp)[nn, hh] - (P @ Vm)[nn, hh]) / (2 * h)
            twoC[nn, hh] = (P * gP).sum() + (V * gV).sum()
            onlyV[nn, hh] = (V * gV).sum()

    relA = np.abs(twoC - 2 * C).max() / np.abs(2 * C).max()
    relB = np.abs(onlyV - C).max() / np.abs(C).max()
    record("L2.1(attn/PV)", relA < 1e-7,
           f"P-path + V-path grad-input = 2C elementwise, max rel err = {relA:.3e} "
           f"(N={N}, d_h={d_h}, finite differences)")
    record("L2.2(attn/PV)", relB < 1e-7,
           f"V-path alone = C elementwise (p-detach), max rel err = {relB:.3e}")

    # scalar-functional form, matching the conservation reading
    Mm = rng.normal(size=C.shape)
    phi = (Mm * C).sum()
    gP_phi = Mm @ V.T                      # dphi/dP
    gV_phi = P.T @ Mm                      # dphi/dV
    tot = (P * gP_phi).sum() + (V * gV_phi).sum()
    record("L2.1(attn/phi)", abs(tot - 2 * phi) / abs(2 * phi) < 1e-12,
           f"scalar functional phi=<M,C>: total grad-input = {tot:.6f} vs 2phi = "
           f"{2*phi:.6f}")
    record("L2.2(attn/phi)", abs((V * gV_phi).sum() - phi) / abs(phi) < 1e-12,
           f"V-branch only = {(V*gV_phi).sum():.6f} vs phi = {phi:.6f}")

    # ---- LEVEL (B): variables are X, the layer input -----------------------
    # This is what an attribution method actually perturbs.  C is degree-1 in X
    # through V but softmax(QK^T/sqrt(d_h)) is NOT homogeneous in X, so Euler's
    # theorem does not apply and there is no reason for sum_X X dC/dX to be 2C.
    print("\n  Level (B): variables = layer input X (what an attributor perturbs)")

    def gradin_X(fn):
        """sum_{i,a} X[i,a] * d fn(X) / d X[i,a], elementwise over the output."""
        out0 = fn(X)
        acc = np.zeros_like(out0)
        hh = 1e-6
        for i in range(N):
            for a in range(d):
                Xp = X.copy(); Xp[i, a] += hh
                Xm = X.copy(); Xm[i, a] -= hh
                acc += X[i, a] * (fn(Xp) - fn(Xm)) / (2 * hh)
        return acc

    full = gradin_X(lambda Z: attn_forward(Z, WQ, WK, WV)[0])
    ratio_full = np.linalg.norm(full) / np.linalg.norm(C)
    err_2C = np.linalg.norm(full - 2 * C) / np.linalg.norm(2 * C)
    print(f"    ||sum_X X.dC/dX|| / ||C||        = {ratio_full:.6f}   "
          f"(2.0 would mean 'exactly double')")
    print(f"    rel. deviation from 2C           = {err_2C:.6f}")

    # p-detach at the X level: P frozen at its value at X, so C = P (X W_V),
    # which IS degree-1 homogeneous in X -> Euler gives exactly C.
    Pfix = P.copy()
    det = gradin_X(lambda Z: Pfix @ (Z @ WV))
    err_C = np.linalg.norm(det - C) / np.linalg.norm(C)
    print(f"    p-detached: ||sum_X X.dC~/dX - C||/||C|| = {err_C:.3e}")

    record("L2.2(attn/X)", err_C < 1e-7,
           f"p-detach at the X level is EXACT: grad-input = C, rel err {err_C:.3e}")

    # Report level (B) honestly: it is NOT 2C.
    is2C = err_2C < 1e-6
    record("L2.1(attn/X)", not is2C,
           f"REPORTED DISCREPANCY: at the X level grad-input is NOT 2C "
           f"(ratio {ratio_full:.4f}, deviation {err_2C:.4f}). The factor-2 "
           f"statement (L2.1) holds w.r.t. (P,V), not w.r.t. X, because softmax "
           f"is not homogeneous in X. Test asserts the deviation is real.")

    # quantify how the X-level ratio moves with the softmax temperature: as
    # logits -> 0 (P -> uniform, dP/dX -> 0) the ratio -> 1, not 2.
    print("\n    X-level ratio ||sum_X X.dC/dX||/||C|| vs logit scale tau")
    print(f"      {'tau':>8} {'ratio':>10}   (tau->0: P frozen-uniform => 1.0)")
    for tau in (0.0, 0.01, 0.1, 1.0, 3.0, 10.0):
        def f_tau(Z, tau=tau):
            Q, K, Vv = Z @ WQ, Z @ WK, Z @ WV
            Pp = softmax_rows(tau * (Q @ K.T) / np.sqrt(d_h))
            return Pp @ Vv
        Ct = f_tau(X)
        gt = gradin_X(f_tau)
        print(f"      {tau:>8.2f} {np.linalg.norm(gt)/np.linalg.norm(Ct):>10.6f}")


def main():
    print("=" * 78)
    print("LEMMA 2 - Bilinear forms double-count under gradient-input")
    print("=" * 78)
    symbolic_bilinear()
    numeric_bilinear()
    attention_checks()
    print("\n--- LEMMA 2 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<18} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
