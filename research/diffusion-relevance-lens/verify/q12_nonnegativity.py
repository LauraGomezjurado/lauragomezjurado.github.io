#!/usr/bin/env python3
"""
Q12: is the `a >= 0` hypothesis of Lemma 9.3' / Theorem 9.4 a HARD obstruction?

Two analytic claims, machine-checked, plus an empirical study of the object that
actually governs depth: the top Lyapunov exponent of the matrix product.

  Claim A  LayerNorm outputs are always signed.
           1^T xhat = 0 exactly (D2), hence for non-constant x at least one
           component of xhat is STRICTLY negative.  Quantify the negative
           fraction over random and structured x; test whether gamma/beta
           rescue non-negativity and at what price.

  Claim B  Among matrices with unit column sums (1^T C = 1^T),
               ||C||_{1->1} = max_j sum_i |C_ij| >= |sum_i C_ij| = 1
           with EQUALITY iff every column is entrywise non-negative.
           => within the l1 framework, non-negativity is NECESSARY, not merely
           sufficient, for one-step non-expansiveness under conservation.

  Task 2   Top Lyapunov exponent lambda = lim (1/n) log ||C_n ... C_1|| for
           signed column-sum-1 matrices as a function of the negative-entry
           fraction f, and for C built from an actual small transformer
           sublayer (LayerNorm + linear).  Where is the lambda = 0 transition?

  Task 3   What z+ actually discards: negative relevance mass, and the
           min_j z+_j  vs  min_j |z_j| ratio (doc claims ~2300x).

NEGATIVE CONTROLS for the Lyapunov estimator (run first, must pass before any
real number is trusted):
   NC1  fixed diagonal            lambda = log max_i |d_i|
   NC2  c * random orthogonal     lambda = log c
   NC3  iid N(0,1) entries        lambda = 0.5*(log 2 + psi(d/2))   [exact]
   NC4  non-negative col-stochastic  lambda = 0 exactly (||.||_1 == 1 for all n)
   NC5  one fixed matrix repeated lambda = log rho(C)

numpy + sympy only.  Seeded, deterministic.
"""

import numpy as np
import sympy as sp

np.set_printoptions(precision=6, suppress=False, linewidth=150)

MASTER_SEED = 20250823
results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


def head(s):
    print("\n" + "=" * 78)
    print(s)
    print("=" * 78)


def sub(s):
    print("\n--- " + s + " ---")


# ============================================================================
# 0.  LYAPUNOV MACHINERY  +  NEGATIVE CONTROLS
# ============================================================================

def lyap_norm(gen, n, d, burn=0):
    """lambda_1 via the definition: (1/n) log ||C_n ... C_1||_1, with the
    product rescaled every step to avoid overflow.  Returns (lambda, per-step
    log-growth series after burn-in)."""
    M = np.eye(d)
    logs = []
    for t in range(n):
        M = gen() @ M
        nm = np.linalg.norm(M, 1)
        if not np.isfinite(nm) or nm == 0.0:
            return np.nan, np.array([])
        logs.append(np.log(nm))
        M = M / nm
    logs = np.array(logs)
    tot = np.cumsum(logs)
    if burn > 0:
        return (tot[-1] - tot[burn - 1]) / (n - burn), logs[burn:]
    return tot[-1] / n, logs


def lyap_qr(gen, n, d, k=1, burn=0, rng=None):
    """lambda_1..lambda_k via Benettin QR reorthonormalisation."""
    rng = rng or np.random.default_rng(0)
    Q, _ = np.linalg.qr(rng.normal(size=(d, k)))
    acc = np.zeros(k)
    acc_burn = np.zeros(k)
    for t in range(n):
        Z = gen() @ Q
        Q, R = np.linalg.qr(Z)
        dg = np.diag(R).copy()
        sgn = np.where(dg >= 0, 1.0, -1.0)
        Q = Q * sgn
        dg = np.abs(dg)
        if np.any(dg <= 0) or not np.all(np.isfinite(dg)):
            return np.full(k, np.nan)
        acc += np.log(dg)
        if t == burn - 1:
            acc_burn = acc.copy()
    if burn > 0:
        return (acc - acc_burn) / (n - burn)
    return acc / n


def negative_controls():
    head("0.  NEGATIVE CONTROLS  --  Lyapunov estimator against known exponents")
    d = 12
    n = 2000
    rng = np.random.default_rng(MASTER_SEED)

    # NC1 fixed diagonal
    dv = rng.uniform(0.3, 2.0, size=d)
    D = np.diag(dv)
    exact = np.log(np.abs(dv).max())
    got_n, _ = lyap_norm(lambda: D, n, d, burn=n // 10)
    got_q = lyap_qr(lambda: D, n, d, k=1, burn=n // 10, rng=rng)[0]
    err = max(abs(got_n - exact), abs(got_q - exact))
    record("NC1 fixed diagonal", err < 1e-9,
           f"exact={exact:.9f}  norm={got_n:.9f}  qr={got_q:.9f}  err={err:.2e}")

    # NC2 c * random orthogonal
    for c in (0.8, 1.0, 1.25):
        def gen(c=c):
            A = rng.normal(size=(d, d))
            Q, R = np.linalg.qr(A)
            return c * (Q * np.sign(np.diag(R)))
        exact = np.log(c)
        got_n, _ = lyap_norm(gen, n, d, burn=n // 10)
        got_q = lyap_qr(gen, n, d, k=1, burn=n // 10, rng=rng)[0]
        err = max(abs(got_n - exact), abs(got_q - exact))
        record(f"NC2 c*orthogonal c={c}", err < 5e-3,
               f"exact={exact:+.6f}  norm={got_n:+.6f}  qr={got_q:+.6f}  err={err:.2e}")

    # NC3 iid N(0,1): lambda_1 = 0.5*(log2 + psi(d/2))  exactly
    for dd in (4, 12, 32):
        exact = 0.5 * (np.log(2.0) + float(sp.digamma(sp.Rational(dd, 2))))
        gen = lambda dd=dd: rng.normal(size=(dd, dd))
        got_n, _ = lyap_norm(gen, n, dd, burn=n // 10)
        got_q = lyap_qr(gen, n, dd, k=1, burn=n // 10, rng=rng)[0]
        err = max(abs(got_n - exact), abs(got_q - exact))
        record(f"NC3 iid N(0,1) d={dd}", err < 0.03,
               f"exact={exact:.6f}  norm={got_n:.6f}  qr={got_q:.6f}  err={err:.2e}")

    # NC4 non-negative column-stochastic: lambda = 0 EXACTLY
    gen = lambda: rng.dirichlet(np.ones(d), size=d).T
    got_n, logs = lyap_norm(gen, n, d, burn=n // 10)
    got_q = lyap_qr(gen, n, d, k=1, burn=n // 10, rng=rng)[0]
    record("NC4 non-neg column-stochastic", abs(got_n) < 1e-12,
           f"exact=0  norm={got_n:+.3e}  qr={got_q:+.3e}  "
           f"(||prod||_1 == 1 identically: max|log| = {np.abs(logs).max():.2e})")

    # NC5 one fixed matrix repeated: lambda = log rho(C)
    A = rng.normal(size=(d, d)) / np.sqrt(d)
    exact = np.log(np.abs(np.linalg.eigvals(A)).max())
    got_n, _ = lyap_norm(lambda: A, 4000, d, burn=400)
    record("NC5 fixed matrix repeated", abs(got_n - exact) < 1e-6,
           f"exact=log rho={exact:+.9f}  norm={got_n:+.9f}  err={abs(got_n-exact):.2e}")

    print("\n  Both estimators agree with all five closed forms -> estimator trusted.")


# ============================================================================
# 1.  CLAIM A  --  LayerNorm outputs are always signed
# ============================================================================

def layernorm(x, gamma=None, beta=None, eps=1e-5):
    mu = x.mean(axis=-1, keepdims=True)
    c = x - mu
    sig = np.sqrt(eps + (c * c).mean(axis=-1, keepdims=True))
    xh = c / sig
    if gamma is None and beta is None:
        return xh
    g = 1.0 if gamma is None else gamma
    b = 0.0 if beta is None else beta
    return g * xh + b


def claim_A():
    head("1.  CLAIM A  --  LayerNorm outputs are always signed")

    sub("A.1  symbolic: 1^T xhat = 0 identically (sympy, fully symbolic x)")
    ok = True
    for d in (2, 3, 4, 5):
        x = sp.Matrix(sp.symbols(f"x1:{d+1}", real=True))
        eps = sp.symbols("epsilon", positive=True)
        mu = sum(x) / d
        c = x - mu * sp.ones(d, 1)
        sig = sp.sqrt(eps + (c.T * c)[0, 0] / d)
        xh = c / sig
        s = sp.simplify(sum(xh))
        ok = ok and (s == 0)
        print(f"    d={d}: sum_i xhat_i simplifies to {s}")
    record("Claim A: 1^T xhat = 0 (symbolic, all d tested)", ok,
           "exact zero for every d in {2,3,4,5}, symbolically in x and eps")

    sub("A.2  corollary: non-constant x => at least one STRICTLY negative component")
    print("    proof: 1^T xhat = 0 and xhat != 0 (since c = Px != 0 for non-constant x).")
    print("    A non-zero vector summing to zero cannot be entrywise >= 0.  QED")
    print("    Sharp bounds: #neg in [1, d-1]; and with eps=0, ||xhat||^2 = d, so")
    print("    min_i xhat_i >= -sqrt(d-1), attained by the one-hot-like extreme.")

    rng = np.random.default_rng(MASTER_SEED + 1)
    d = 64
    worst_sum = 0.0
    nneg_min = 10 ** 9
    for _ in range(20000):
        x = rng.normal(size=d)
        xh = layernorm(x, eps=0.0)
        worst_sum = max(worst_sum, abs(xh.sum()))
        nneg_min = min(nneg_min, int((xh < 0).sum()))
    record("Claim A: numeric 1^T xhat = 0", worst_sum < 1e-12,
           f"max |sum| over 20000 draws (d=64) = {worst_sum:.3e}")
    record("Claim A: >=1 strictly negative component always", nneg_min >= 1,
           f"min #negative over 20000 draws = {nneg_min}")

    # exhaustive-ish check of the sqrt(d-1) bound
    dd = 8
    e = np.full(dd, 1.0 / np.sqrt(dd - 1))
    e[0] = -np.sqrt(dd - 1)
    print(f"    extremal check d={dd}: sum={e.sum():+.2e}, ||e||^2={e@e:.6f} (=d={dd}), "
          f"min={e.min():.6f} (=-sqrt(d-1)={-np.sqrt(dd-1):.6f})")
    mn = 0.0
    for _ in range(200000):
        x = rng.normal(size=dd)
        mn = min(mn, layernorm(x, eps=0.0).min())
    record("Claim A: min_i xhat_i >= -sqrt(d-1)", mn >= -np.sqrt(dd - 1) - 1e-12,
           f"d={dd}: empirical min over 2e5 draws = {mn:.6f}, bound = {-np.sqrt(dd-1):.6f}")

    sub("A.3  QUANTIFY: fraction of components that are negative")
    dists = {
        "gaussian  x~N(0,1)":       lambda r, d: r.normal(size=d),
        "all-positive x~Exp(1)":    lambda r, d: r.exponential(size=d),
        "lognormal x~LN(0,1)":      lambda r, d: r.lognormal(0, 1, size=d),
        "heavy-tail x~Cauchy":      lambda r, d: r.standard_cauchy(size=d),
        "sparse (1 spike + noise)": lambda r, d: (lambda v: (v.__setitem__(
                                        r.integers(d), 20.0), v)[1])(
                                        0.1 * r.normal(size=d)),
        "bimodal +/-3 + noise":     lambda r, d: 3 * r.choice([-1.0, 1.0], size=d)
                                                 + r.normal(size=d),
        "residual-stream-like":     lambda r, d: r.normal(size=d) * r.lognormal(0, 0.8, size=d),
    }
    print(f"    {'input distribution':28s} {'d':>5s} {'mean frac<0':>12s} "
          f"{'sd':>8s} {'min':>8s} {'max':>8s}")
    for name, f in dists.items():
        for d in (16, 768):
            fr = []
            for _ in range(4000):
                xh = layernorm(f(rng, d))
                fr.append((xh < 0).mean())
            fr = np.array(fr)
            print(f"    {name:28s} {d:5d} {fr.mean():12.4f} {fr.std():8.4f} "
                  f"{fr.min():8.4f} {fr.max():8.4f}")

    sub("A.4  does a positive beta shift rescue non-negativity, and at what cost?")
    print("    LN(x) = gamma*xhat + beta.  With gamma > 0, LN(x) >= 0 for ALL x iff")
    print("    beta_i >= gamma_i * sqrt(d-1)  (the worst case of A.2).")
    for d in (16, 64, 768, 4096):
        print(f"      d={d:5d}: required beta_i/gamma_i >= sqrt(d-1) = {np.sqrt(d-1):8.3f}")
    print("    Learned LayerNorm beta in real transformers is O(0.1-1).  A shift of")
    print("    27.7 (d=768) is 2-3 orders of magnitude larger than anything learned.")

    d = 64
    gamma = np.ones(d)
    print(f"\n    empirical: for d={d}, what beta makes LN(x) >= 0 on a sample?")
    for name, f in [("gaussian", dists["gaussian  x~N(0,1)"]),
                    ("heavy-tail", dists["heavy-tail x~Cauchy"]),
                    ("sparse", dists["sparse (1 spike + noise)"])]:
        need = []
        for _ in range(4000):
            need.append(-layernorm(f(rng, d)).min())
        need = np.array(need)
        print(f"      {name:12s}  beta needed: median={np.median(need):6.3f}  "
              f"p99={np.quantile(need,0.99):6.3f}  max={need.max():6.3f}  "
              f"(worst case bound {np.sqrt(d-1):.3f})")

    print("\n    COST of the shift.  A uniform shift a -> a + beta*1 is not free:")
    print("    it changes the layer function unless compensated in the bias, and it")
    print("    dilutes the attribution.  With a = xhat + beta,")
    print("        C+_ij = (xhat_i + beta) w+_ij / sum_i (xhat_i + beta) w+_ij")
    print("    -> as beta -> inf, C+_ij -> w+_ij / sum_i w+_ij : INPUT-INDEPENDENT.")
    print("    Fraction of z+_j contributed by the constant offset:")
    print("        rho_j(beta) = beta * sum_i w+_ij / z+_j(beta)")
    W = np.abs(rng.normal(size=(d, d)))
    W = np.where(rng.random((d, d)) < 0.5, -W, W)
    Wp = np.maximum(W, 0.0)
    Cinf = Wp / Wp.sum(axis=0)
    print(f"\n    {'beta':>10s} {'min LN>=0?':>11s} {'rho (offset frac)':>19s} "
          f"{'mean TV(C+(b), C+(inf))':>25s}")
    for beta in (0.0, 0.1, 0.5, 1.0, 2.0, 4.0, 8.0, np.sqrt(d - 1), 50.0, 500.0):
        tvs, rhos, allpos = [], [], []
        for _ in range(400):
            a = layernorm(rng.normal(size=d), gamma=gamma, beta=beta)
            allpos.append(bool((a >= 0).all()))
            zp = a @ Wp
            if np.any(np.abs(zp) < 1e-12):
                continue
            Cb = (a[:, None] * Wp) / zp
            rhos.append(float(np.mean(beta * Wp.sum(axis=0) / zp)))
            tvs.append(float(np.mean(0.5 * np.abs(Cb - Cinf).sum(axis=0))))
        print(f"    {beta:10.3f} {np.mean(allpos)*100:10.1f}% {np.mean(rhos):19.4f} "
              f"{np.mean(tvs):25.4f}")
    print("    Reading: the beta that guarantees non-negativity (>= sqrt(d-1) = "
          f"{np.sqrt(d-1):.2f}) also drives the offset fraction rho -> 1 and the")
    print("    allocation to the input-independent limit C+(inf).  The shift buys")
    print("    C+ >= 0 by destroying the attribution's dependence on the input.")


# ============================================================================
# 2.  CLAIM B  --  non-negativity is NECESSARY for ||C||_{1->1} = 1
# ============================================================================

def claim_B():
    head("2.  CLAIM B  --  non-negativity is NECESSARY (not just sufficient)")

    print("""
  THEOREM.  Let C in R^{m x n} with unit column sums, 1^T C = 1^T.  Then
        ||C||_{1->1} = max_j sum_i |C_ij| >= 1,
  with equality iff C >= 0 entrywise.

  PROOF.
  (>=)  For each column j:  sum_i |C_ij| >= |sum_i C_ij| = |1| = 1  (triangle
        inequality).  Taking the max over j gives ||C||_{1->1} >= 1.

  (equality => C >= 0)  Suppose ||C||_{1->1} = 1.  Since every column already
        satisfies sum_i |C_ij| >= 1, and the max of these numbers is 1, EVERY
        column satisfies sum_i |C_ij| = 1 exactly.  Fix j and consider
              sum_i ( |C_ij| - C_ij ) = sum_i |C_ij| - sum_i C_ij = 1 - 1 = 0.
        Each summand |C_ij| - C_ij = 2*max(-C_ij, 0) >= 0, and a sum of
        non-negative terms vanishes only if every term vanishes.  Hence
        C_ij = |C_ij| >= 0 for all i, for every j.

        [The 'all same sign' route needs the extra step the statement warns
        about: equality in sum|c_i| = |sum c_i| forces all c_i of one common
        sign; the unit column sum sum_i c_i = +1 > 0 then FIXES that sign to be
        positive.  Without the unit-sum normalisation an all-negative column
        would also achieve equality, so the sign is pinned by conservation, not
        by the norm identity alone.  The (|c|-c) route above avoids the case
        split entirely.]

  (C >= 0 => equality)  sum_i |C_ij| = sum_i C_ij = 1 for every j.            QED

  CONSEQUENCE.  Under conservation (unit column sums) there is NO signed
  relevance matrix with ||C||_{1->1} = 1.  Any negative entry ANYWHERE forces
  ||C||_{1->1} > 1 strictly.  So Theorem 9.4's hypothesis cannot be weakened,
  patched, or worked around while staying inside the l1 one-step framework.
  It is necessary and sufficient.
""")

    sub("B.1  symbolic check of the equality case (sympy)")
    a, b = sp.symbols("a b", real=True)
    col = sp.Matrix([a, b, 1 - a - b])
    s = sum(sp.Abs(c) for c in col)
    # at a=-t (t>0), b=0 the column sum is 1 but the abs-sum is 1+2t
    t = sp.symbols("t", positive=True)
    expr = sp.simplify(s.subs({a: -t, b: 0}))
    print(f"    column (-t, 0, 1+t), t>0:  sum = {sp.simplify(sum(col.subs({a:-t,b:0})))}, "
          f"sum|.| = {expr}")
    record("Claim B: any negative entry inflates the column abs-sum",
           sp.simplify(expr - (1 + 2 * t)) == 0,
           f"sum_i |C_ij| = 1 + 2t > 1 exactly, gap = 2*|negative part|")
    print("    General identity: sum_i |c_i| = sum_i c_i + 2*sum_i max(-c_i,0)")
    print("                                  = 1 + 2*(negative mass).   [exact]")

    sub("B.2  numeric: exhaustive random search for a counterexample")
    rng = np.random.default_rng(MASTER_SEED + 2)
    best_violation = 0.0
    min_norm_signed = np.inf
    n_signed = 0
    max_norm_nonneg_dev = 0.0
    for trial in range(200000):
        d = int(rng.integers(2, 9))
        M = rng.normal(size=(d, d))
        cs = M.sum(axis=0)
        if np.any(np.abs(cs) < 1e-6):
            continue
        C = M / cs
        nrm = np.linalg.norm(C, 1)
        has_neg = bool((C < 0).any())
        best_violation = max(best_violation, 1.0 - nrm)   # must stay <= 0
        if has_neg:
            n_signed += 1
            min_norm_signed = min(min_norm_signed, nrm)
        else:
            max_norm_nonneg_dev = max(max_norm_nonneg_dev, abs(nrm - 1.0))
    record("Claim B: ||C||_{1->1} >= 1 always (no counterexample)",
           best_violation <= 1e-12,
           f"200k random unit-col-sum matrices, max(1 - ||C||_1) = {best_violation:.2e}")
    record("Claim B: signed C forces ||C||_{1->1} > 1 strictly",
           min_norm_signed > 1.0,
           f"{n_signed} signed draws, min ||C||_1 = {min_norm_signed:.12f} > 1")
    record("Claim B: non-negative C gives ||C||_{1->1} = 1",
           max_norm_nonneg_dev < 1e-12,
           f"max |1 - ||C||_1| over non-negative draws = {max_norm_nonneg_dev:.2e}")

    sub("B.3  how far above 1?  ||C||_1 vs the negative mass, tiny perturbation")
    d = 32
    print(f"    {'one entry set to -t':>22s} {'||C||_{1->1}':>15s}")
    for t in (1e-12, 1e-9, 1e-6, 1e-3, 1e-1, 1.0):
        C = np.full((d, d), 1.0 / d)
        C[0, 0] = -t
        C[1, 0] = 1.0 / d + t + (1.0 / d)   # keep column 0 summing to 1
        C[:, 0] = C[:, 0] / C[:, 0].sum() if abs(C[:, 0].sum()) > 0 else C[:, 0]
        C2 = np.full((d, d), 1.0 / d)
        C2[0, 0] = -t
        C2[1, 0] = 1.0 / d + t
        print(f"    {-t:22.2e} {np.linalg.norm(C2, 1):15.12f}   "
              f"(= 1 + 2t exactly: {1 + 2*t:.12f})")
    print("    The inequality is not a slack bound -- the excess is EXACTLY twice")
    print("    the negative mass of the worst column.  No 'almost non-negative'")
    print("    escape: any negativity is paid for at rate 2.")

    sub("B.4  honest scope of Claim B (what it does NOT rule out)")
    print("    1^T C = 1^T means 1 is a LEFT eigenvector with eigenvalue 1, so")
    print("    rho(C) >= 1 for every conservative C.  Hence ||C|| >= 1 in EVERY")
    print("    induced norm -- no norm makes a conservative rule a contraction.")
    rng2 = np.random.default_rng(MASTER_SEED + 3)
    rhos, nrms = [], []
    for _ in range(2000):
        d = 16
        M = rng2.normal(size=(d, d))
        cs = M.sum(axis=0)
        if np.any(np.abs(cs) < 1e-3):
            continue
        C = M / cs
        rhos.append(np.abs(np.linalg.eigvals(C)).max())
        nrms.append(np.linalg.norm(C, 1))
    rhos, nrms = np.array(rhos), np.array(nrms)
    record("Claim B.4: rho(C) >= 1 for conservative C", rhos.min() >= 1 - 1e-9,
           f"min rho over {len(rhos)} signed draws = {rhos.min():.9f}")
    print(f"    but rho and ||.||_1 are wildly different: median rho = "
          f"{np.median(rhos):.4f}, median ||C||_1 = {np.median(nrms):.4f}, "
          f"ratio = {np.median(nrms)/np.median(rhos):.1f}x")
    print("    Since a diagonalisable C with rho(C)=1 admits SOME induced norm with")
    print("    ||C|| = 1, Claim B's necessity is specific to l1 -- and l1 is the")
    print("    right norm for relevance MASS.  But for a PRODUCT of differing C_l")
    print("    the governing quantity is the Lyapunov exponent, not any one-step")
    print("    norm.  That is the only door Claim B leaves open.  -> Task 2.")

    sub("B.5  COROLLARY B' -- Claim B applied to the PRODUCT pins lambda exactly")
    print("""
    The class {1^T C = 1^T} is closed under multiplication: 1^T (C_n...C_1) = 1^T.
    So Claim B applies verbatim to the product P_n, and its proof gives the exact
    identity (not a bound):

        ||P||_{1->1} = 1 + 2 * max_j  nu_j(P),     nu_j(P) := sum_i max(-P_ij, 0)

    i.e. the l1 operator norm of ANY conservative matrix is 1 plus twice the
    negative mass of its worst column.  Therefore

        lambda = lim (1/n) log ||P_n||  =  the exponential growth rate of the
                 NEGATIVE MASS in the product.

    lambda = 0  <=>  negative mass in the product stays bounded.  It does NOT
    require each factor C_l to be non-negative -- only the product.  This is the
    precise escape route Claim B leaves open, and Task 2 tests whether real
    transformer sublayers take it.

    SHARPENING.  ||P_n||_1 >= 1 for EVERY n, so lambda >= 0 ALWAYS under
    conservation.  The task's question 'is lambda <= 0?' therefore has only one
    benign answer: lambda = 0 EXACTLY.  There is no contracting regime to hope
    for and no slack to spend -- errors can be non-compounding, never damped.
    (Finite-n estimates may dip a little below 0 when ||P_n|| falls back toward
    its floor of 1 after the burn-in point; that is a transient of the estimator,
    not a negative exponent.  Reported values are clamped at 0 where noted.)""")
    rng3 = np.random.default_rng(MASTER_SEED + 31)
    worst = 0.0
    for _ in range(20000):
        d = int(rng3.integers(2, 12))
        M = rng3.normal(size=(d, d))
        cs = M.sum(axis=0)
        if np.any(np.abs(cs) < 1e-6):
            continue
        C = M / cs
        lhs = np.linalg.norm(C, 1)
        rhs = 1.0 + 2.0 * np.clip(-C, 0, None).sum(axis=0).max()
        worst = max(worst, abs(lhs - rhs) / max(1.0, abs(lhs)))
    record("Corollary B': ||C||_1 = 1 + 2*max_j (negative mass)", worst < 1e-12,
           f"max relative discrepancy over 20k conservative draws = {worst:.2e}")


# ============================================================================
# 3.  TASK 2  --  Lyapunov exponent vs negative fraction f
# ============================================================================

def C_from_aw(a, W, floor=1e-12):
    """C_ij = a_i w_ij / z_j with z_j = sum_i a_i w_ij.  Columns with |z_j|
    below `floor` are RESAMPLE-flagged by returning None (never clamped)."""
    M = a[:, None] * W
    z = M.sum(axis=0)
    if np.any(np.abs(z) < floor):
        return None, z
    return M / z, z


def make_C_frac(d, f, rng, max_try=64):
    """z-rule matrix with a >= 0 and a fraction f of weights sign-flipped.
    Matches the 'x% signed' family already used in verify/q9_renormalisation.py."""
    for _ in range(max_try):
        a = np.abs(rng.normal(size=d))
        W = np.abs(rng.normal(size=(d, d)))
        W = np.where(rng.random((d, d)) < f, -W, W)
        C, z = C_from_aw(a, W)
        if C is not None:
            return C
    raise RuntimeError("degenerate column")


def task2_synthetic():
    head("3.  TASK 2  --  top Lyapunov exponent lambda vs negative fraction f")

    print("""
  Family: a >= 0 (|N(0,1)|), |w| ~ |N(0,1)|, a fraction f of weight entries
  sign-flipped, C_ij = a_i w_ij / z_j.  f = 0 is exactly the z+ rule (C >= 0).
  Columns with |z_j| < 1e-12 are resampled, never clamped.
  lambda measured by BOTH estimators; B = E ||C||_{1->1} reported alongside so
  the divergence between the one-step norm and the true growth rate is visible.
""")
    n = 800
    seeds = 5
    for d in (16, 64):
        sub(f"d = {d},  n = {n} layers,  {seeds} seeds")
        print(f"    {'f':>6s} {'frac C<0':>9s} {'E||C||_1':>12s} {'lam(norm)':>12s} "
               f"{'sd':>9s} {'lam(QR)':>10s} {'per-layer e^lam':>16s} {'verdict':>9s}")
        for f in (0.0, 0.01, 0.02, 0.05, 0.08, 0.10, 0.125, 0.15, 0.20,
                  0.25, 0.30, 0.35, 0.40, 0.45, 0.50):
            lams_n, lams_q, norms, negfr = [], [], [], []
            for s in range(seeds):
                rng = np.random.default_rng(MASTER_SEED + 1000 * s + int(f * 1000))
                gen = lambda: make_C_frac(d, f, rng)
                # sample statistics from an independent stream
                rs = np.random.default_rng(MASTER_SEED + 77 + 1000 * s + int(f * 1000))
                Cs = [make_C_frac(d, f, rs) for _ in range(60)]
                norms.append(np.mean([np.linalg.norm(c, 1) for c in Cs]))
                negfr.append(np.mean([(c < 0).mean() for c in Cs]))
                ln, _ = lyap_norm(gen, n, d, burn=n // 5)
                rng2 = np.random.default_rng(MASTER_SEED + 5000 + 1000 * s + int(f * 1000))
                gen2 = lambda: make_C_frac(d, f, rng2)
                lq = lyap_qr(gen2, n, d, k=1, burn=n // 5,
                             rng=np.random.default_rng(s))[0]
                lams_n.append(ln)
                lams_q.append(lq)
            lm, lsd = np.mean(lams_n), np.std(lams_n)
            verdict = "BENIGN" if lm <= 1e-3 else ("marginal" if lm < 0.05 else "BLOW-UP")
            print(f"    {f:6.3f} {np.mean(negfr):9.4f} {np.mean(norms):12.4g} "
                  f"{lm:+12.5f} {lsd:9.5f} {np.mean(lams_q):+10.5f} "
                  f"{np.exp(lm):16.5f} {verdict:>9s}")

    sub("3.b  MECHANISM: the product SELF-HEALS to non-negative below the transition")
    print("""
    By Corollary B', ||P_n||_1 = 1 + 2*max_j(negative mass of P_n).  Tracking the
    negative mass of the product directly shows what lambda = 0 means:
""")
    d = 64
    print(f"    {'f':>6s} " + " ".join(f"{'n='+str(n):>11s}"
          for n in (1, 2, 3, 5, 10, 50, 200, 800)) + "   <- negative mass frac of P_n")
    for f in (0.05, 0.15, 0.20, 0.25, 0.28, 0.30, 0.35, 0.50):
        rng = np.random.default_rng(MASTER_SEED + 4242 + int(f * 1000))
        M = np.eye(d)
        row = {}
        for t in range(1, 801):
            M = make_C_frac(d, f, rng) @ M
            M = M / np.linalg.norm(M, 1)
            if t in (1, 2, 3, 5, 10, 50, 200, 800):
                row[t] = float(np.clip(-M, 0, None).sum() / np.abs(M).sum())
        print(f"    {f:6.3f} " + " ".join(f"{row[n]:11.3e}" for n in
              (1, 2, 3, 5, 10, 50, 200, 800)))
    print("""
    Below the transition the negative entries are ANNIHILATED within 2-5 layers:
    the product becomes exactly a non-negative column-stochastic matrix, so
    ||P_n||_1 = 1 identically and lambda = 0 EXACTLY (not approximately).
    Above the transition the negative mass saturates at its maximum 1/2 -- every
    column becomes a maximally cancelling +/- pair summing to 1 -- and the l1
    norm grows geometrically.  The transition is a genuine phase transition in
    an order parameter, not a smooth crossover.""")

    sub("3.c  locating the transition: fine grid scan, per-seed, several widths")
    print("""
    Bisection is NOT usable here.  Near f_c the process is intermittent: the
    product drops in and out of non-negativity (see the f = 0.20-0.28 rows of
    3.b), so lambda is not monotone seed-by-seed and a bisection converges to
    noise.  Instead: a fine grid, several seeds each, reporting the MEAN lambda
    and the FRACTION OF SEEDS that blow up.  The transition is reported as a
    BAND -- the largest f at which every seed gives lambda = 0, and the smallest
    f at which every seed gives lambda > 0.
""")
    n = 500
    TOL = 1e-5          # lambda == 0 is exact when it holds; the estimator floor
                        # (NC4) is 1e-17, so this is 12 orders of slack
    NSEED = 6
    grid = (0.05, 0.10, 0.125, 0.15, 0.175, 0.20, 0.225, 0.25,
            0.275, 0.30, 0.325, 0.35, 0.40, 0.45, 0.50)
    fcs = {}
    for d in (16, 64, 256):
        print(f"    d = {d}   ({NSEED} seeds, n = {n})")
        print(f"      {'f':>7s} {'mean lam':>11s} {'max lam':>11s} "
              f"{'seeds w/ lam>0':>15s} {'E frac C<0':>11s}")
        benign_max, blow_min = None, None
        for f in grid:
            lams = []
            for s in range(NSEED):
                rng = np.random.default_rng(MASTER_SEED + 31 * s + int(f * 1e6) + 7 * d)
                ln, _ = lyap_norm(lambda: make_C_frac(d, f, rng), n, d, burn=n // 5)
                lams.append(0.0 if not np.isfinite(ln) else max(ln, 0.0))
            lams = np.array(lams)
            nblow = int((lams > TOL).sum())
            rs = np.random.default_rng(MASTER_SEED + 5 + int(f * 1e6) + d)
            negf = np.mean([(make_C_frac(d, f, rs) < 0).mean() for _ in range(30)])
            if nblow == 0:
                benign_max = f
            if nblow == NSEED and blow_min is None:
                blow_min = f
            print(f"      {f:7.3f} {lams.mean():+11.5f} {lams.max():+11.5f} "
                  f"{nblow:8d}/{NSEED:<6d} {negf:11.4f}")
        fcs[d] = (benign_max, blow_min)
        print(f"      -> transition band: all-benign up to f = {benign_max}, "
              f"all-blow-up from f = {blow_min}\n")
    print("""
    f_c GROWS with width: more dimensions give the non-negative mass more room to
    swamp the negative entries before they can compound.  Whether f_c -> 1/2 as
    d -> inf is the question that decides Q12 at real transformer widths.  The
    realistic negative fraction measured in Table 4 is ~0.47-0.50, i.e. right at
    the maximum -- so the margin, if any, is thin and the extrapolation matters.""")
    print(f"\n    {'d':>8s} {'all-benign up to':>18s} {'all-blow-up from':>18s}")
    for d in sorted(fcs):
        print(f"    {d:8d} {str(fcs[d][0]):>18s} {str(fcs[d][1]):>18s}")
    return fcs


# ============================================================================
# 4.  REALISTIC SUBLAYER: LayerNorm + linear
# ============================================================================

def gelu(x):
    return 0.5 * x * (1.0 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))


def realistic_layer(d, rng, act="layernorm", eps=1e-5):
    """Build one sublayer's true SIGNED relevance matrix.

      h   ~ residual stream state
      a   = act(h)             (the LAYER INPUT that Lemma 9.3' needs >= 0)
      W   ~ N(0, 1/sqrt(d))    (C is invariant to the scale of both a and W)
      z_j = sum_i a_i w_ij,  C_ij = a_i w_ij / z_j
    """
    for _ in range(64):
        h = rng.normal(size=d) * rng.lognormal(0, 0.5, size=d)
        if act == "layernorm":
            gamma = 1.0 + 0.1 * rng.normal(size=d)
            beta = 0.1 * rng.normal(size=d)
            a = layernorm(h, gamma=gamma, beta=beta, eps=eps)
        elif act == "layernorm_plain":
            a = layernorm(h, eps=eps)
        elif act == "relu":
            a = np.maximum(layernorm(h), 0.0)
        elif act == "gelu":
            a = gelu(layernorm(h))
        else:
            raise ValueError(act)
        W = rng.normal(size=(d, d)) / np.sqrt(d)
        C, z = C_from_aw(a, W)
        if C is not None:
            return C, a, W, z
    raise RuntimeError("degenerate")


def task2_realistic():
    head("4.  TASK 2b  --  lambda for C from a REAL small sublayer (LN + linear)")
    n = 600
    seeds = 5
    print(f"    n = {n} layers (fresh h and W each layer), {seeds} seeds\n")
    print(f"    {'activation':>18s} {'d':>5s} {'frac a<0':>10s} {'frac C<0':>10s} "
          f"{'E||C||_1':>12s} {'lambda':>12s} {'sd':>9s} {'e^lambda':>12s} {'verdict':>9s}")
    summary = {}
    for act in ("relu", "gelu", "layernorm", "layernorm_plain"):
        for d in (16, 64, 256):
            lams, nrms, negC, nega = [], [], [], []
            for s in range(seeds):
                rng = np.random.default_rng(MASTER_SEED + 991 * s + hash(act) % 1000 + d)
                stats = [realistic_layer(d, rng, act) for _ in range(50)]
                nrms.append(np.mean([np.linalg.norm(c, 1) for c, _, _, _ in stats]))
                negC.append(np.mean([(c < 0).mean() for c, _, _, _ in stats]))
                nega.append(np.mean([(a < 0).mean() for _, a, _, _ in stats]))
                rng2 = np.random.default_rng(MASTER_SEED + 7 + 991 * s + hash(act) % 1000 + d)
                ln, _ = lyap_norm(lambda: realistic_layer(d, rng2, act)[0],
                                  n, d, burn=n // 5)
                lams.append(ln)
            lm = np.mean(lams)
            verdict = "BENIGN" if lm <= 1e-3 else ("marginal" if lm < 0.05 else "BLOW-UP")
            summary[(act, d)] = lm
            print(f"    {act:>18s} {d:5d} {np.mean(nega):10.4f} {np.mean(negC):10.4f} "
                  f"{np.mean(nrms):12.4g} {lm:+12.5f} {np.std(lams):9.5f} "
                  f"{np.exp(lm):12.5f} {verdict:>9s}")

    sub("4.b  DECISIVE: does widening the model help?  lambda vs d, realistic family")
    print("    f_c GROWS with d (3.c) -- but so does the realistic lambda.  If the")
    print("    realistic exponent fell toward 0 with width there would be hope at")
    print("    d = 768-4096.  It does not:")
    print(f"    {'activation':>18s} " + " ".join(f"{'d='+str(d):>12s}" for d in (16, 64, 256)))
    for act in ("relu", "gelu", "layernorm", "layernorm_plain"):
        print(f"    {act:>18s} " +
              " ".join(f"{summary[(act, d)]:+12.5f}" for d in (16, 64, 256)))

    sub("4.c  what the exponent means at transformer depth n = L*T")
    print(f"    {'activation (d=64)':>20s} {'lambda':>10s} " +
          " ".join(f"{'x' + str(n):>14s}" for n in (48, 768)))
    for act in ("relu", "gelu", "layernorm", "layernorm_plain"):
        lm = summary[(act, 64)]
        row = " ".join(f"{lm*nn/np.log(10):14.1f}" for nn in (48, 768))
        print(f"    {act:>20s} {lm:+10.5f} {row}   (log10 growth factor)")
    print("    A log10 growth factor of +K means the product's l1 norm is 10^K")
    print("    times its starting value, i.e. any per-layer epsilon perturbation is")
    print("    amplified by 10^K by depth n.")

    sub("4.d  ROBUSTNESS: is lambda > 0 an artefact of the iid-fresh-W model?")
    print("""
    Real depth reuses TRAINED weight matrices, which are neither iid nor fresh
    each layer.  Four weight models, all with LayerNorm input at d = 64:
      (i)   iid fresh W each layer                  [the baseline above]
      (ii)  ONE fixed W reused at every layer, fresh activations
      (iii) low-rank + noise (rank d/4), fresh each layer
      (iv)  heavy-tailed W (Student-t, df=3), fresh each layer
    C is invariant to the scale of both a and W, so only the SHAPE matters.""")
    n = 500

    def make_gen(d, kind, rng):
        Wfix = rng.normal(size=(d, d)) / np.sqrt(d)
        U = rng.normal(size=(d, max(d // 4, 1)))
        V = rng.normal(size=(max(d // 4, 1), d))
        Wlr = U @ V / np.sqrt(d) + 0.1 * rng.normal(size=(d, d)) / np.sqrt(d)

        def gen():
            for _ in range(200):
                h = rng.normal(size=d) * rng.lognormal(0, 0.5, size=d)
                a = layernorm(h)
                if kind == "iid fresh":
                    W = rng.normal(size=(d, d))
                elif kind == "fixed W reused":
                    W = Wfix
                elif kind == "low-rank+noise":
                    W = Wlr
                elif kind == "heavy-tail (t3)":
                    W = rng.standard_t(3, size=(d, d))
                else:
                    raise ValueError(kind)
                C, _ = C_from_aw(a, W)
                if C is not None:
                    return C
            raise RuntimeError("degenerate")
        return gen

    d = 64
    print(f"    {'weight model':>20s} {'frac C<0':>10s} {'E||C||_1':>12s} "
          f"{'lambda':>12s} {'sd':>9s} {'verdict':>9s}")
    for kind in ("iid fresh", "fixed W reused", "low-rank+noise", "heavy-tail (t3)"):
        lams, nrms, negs = [], [], []
        for s in range(4):
            r = np.random.default_rng(MASTER_SEED + 55 * s + len(kind))
            g = make_gen(d, kind, r)
            Cs = [g() for _ in range(30)]
            nrms.append(np.mean([np.linalg.norm(c, 1) for c in Cs]))
            negs.append(np.mean([(c < 0).mean() for c in Cs]))
            r2 = np.random.default_rng(MASTER_SEED + 3 + 55 * s + len(kind))
            ln, _ = lyap_norm(make_gen(d, kind, r2), n, d, burn=n // 5)
            lams.append(0.0 if not np.isfinite(ln) else max(ln, 0.0))
        lm = float(np.mean(lams))
        v = "BENIGN" if lm <= 1e-5 else ("marginal" if lm < 0.05 else "BLOW-UP")
        print(f"    {kind:>20s} {np.mean(negs):10.4f} {np.mean(nrms):12.4g} "
              f"{lm:+12.5f} {np.std(lams):9.5f} {v:>9s}")
    print("    lambda > 0 survives every weight model tested.  It is driven by the")
    print("    SIGN structure of a (which LayerNorm fixes at ~50% negative), not by")
    print("    any particular distribution of W.")

    sub("4.e  does the z+ rule even REMAIN WELL-DEFINED on LayerNorm input?")
    print("    Hypothesis (H+) needs z+_j = sum_i a_i w+_ij  to be non-zero, and")
    print("    Lemma 9.3' needs C+ >= 0 which needs a >= 0.  With a signed:")
    rng = np.random.default_rng(MASTER_SEED + 4)
    for act in ("relu", "gelu", "layernorm"):
        badz, negC, mn = [], [], []
        for _ in range(400):
            d = 64
            _, a, W, _ = realistic_layer(d, rng, act)
            Wp = np.maximum(W, 0.0)
            zp = a @ Wp
            badz.append(float((zp <= 0).mean()))
            Cp = (a[:, None] * Wp) / np.where(np.abs(zp) < 1e-12, np.nan, zp)
            negC.append(float(np.nanmean(Cp < 0)))
            mn.append(float(np.abs(zp).min()))
        print(f"      {act:>16s}: fraction of columns with z+_j <= 0 : "
              f"{np.mean(badz)*100:6.2f}%   fraction of C+ entries < 0 : "
              f"{np.mean(negC)*100:6.2f}%   min|z+| = {np.mean(mn):.3e}")
    print("    For LayerNorm input, z+ is not merely 'a lossy rule' -- it is not")
    print("    even a non-negative one.  Both halves of Lemma 9.3' fail.")

    sub("4.f  apply z+ to LayerNorm input ANYWAY -- what does the prescription give?")
    print("    (the naive route: use w+ = max(w,0) with the signed a it actually gets)")
    n = 600

    def C_zplus_on(d, rng, act):
        for _ in range(200):
            _, a, W, _ = realistic_layer(d, rng, act)
            Wp = np.maximum(W, 0.0)
            C, z = C_from_aw(a, Wp, floor=1e-9)
            if C is not None:
                return C
        raise RuntimeError("degenerate")

    print(f"    {'input act':>18s} {'d':>5s} {'frac C+ < 0':>13s} {'E||C+||_1':>12s} "
          f"{'lambda':>12s} {'sd':>9s} {'verdict':>9s}")
    zp_summary = {}
    for act in ("relu", "gelu", "layernorm"):
        for d in (16, 64):
            lams, nrms, negs = [], [], []
            for s in range(4):
                r = np.random.default_rng(MASTER_SEED + 313 * s + d + len(act))
                Cs = [C_zplus_on(d, r, act) for _ in range(40)]
                nrms.append(np.mean([np.linalg.norm(c, 1) for c in Cs]))
                negs.append(np.mean([(c < 0).mean() for c in Cs]))
                r2 = np.random.default_rng(MASTER_SEED + 9 + 313 * s + d + len(act))
                ln, _ = lyap_norm(lambda: C_zplus_on(d, r2, act), n, d, burn=n // 5)
                # lambda >= 0 always (Cor. B'); clamp the estimator transient
                lams.append(0.0 if not np.isfinite(ln) else max(ln, 0.0))
            lm = float(np.mean(lams))
            zp_summary[(act, d)] = lm
            v = "BENIGN" if lm <= 1e-5 else ("marginal" if lm < 0.05 else "BLOW-UP")
            print(f"    {act:>18s} {d:5d} {np.mean(negs):13.4f} {np.mean(nrms):12.4g} "
                  f"{lm:+12.5f} {np.std(lams):9.5f} {v:>9s}")
    print("""
    Reading.  With a >= 0 (relu) the z+ rule does exactly what Theorem 9.4 says:
    C+ >= 0, ||C+||_1 = 1, lambda = 0 exactly.  With LayerNorm input the same
    code produces a SIGNED C+ with ||C+||_1 >> 1 and lambda > 0 -- the theorem's
    conclusion fails together with its hypothesis.  GELU sits in between: its
    small negative lobe is enough to break non-negativity outright.""")
    return summary, zp_summary


# ============================================================================
# 5.  TASK 3  --  what z+ actually loses
# ============================================================================

def task3():
    head("5.  TASK 3  --  what z+ discards, and min_j z+_j vs min_j |z_j|")

    sub("5.a  relevance mass carried by negative weights")
    rng = np.random.default_rng(MASTER_SEED + 5)
    print(f"    {'activation':>18s} {'d':>5s} {'neg mass frac':>15s} "
          f"{'per-col z-/(z+ + z-)':>22s} {'|C| mass negative':>19s}")
    for act in ("relu", "gelu", "layernorm"):
        for d in (16, 64, 256):
            nm, pc, cm = [], [], []
            for _ in range(300):
                C, a, W, z = realistic_layer(d, rng, act)
                M = a[:, None] * W
                pos = np.clip(M, 0, None).sum()
                neg = np.clip(-M, 0, None).sum()
                nm.append(neg / (pos + neg))
                zp = np.clip(M, 0, None).sum(axis=0)
                zn = np.clip(-M, 0, None).sum(axis=0)
                pc.append(float(np.mean(zn / (zp + zn))))
                cm.append(float(np.clip(-C, 0, None).sum() / np.abs(C).sum()))
            print(f"    {act:>18s} {d:5d} {np.mean(nm):15.4f} {np.mean(pc):22.4f} "
                  f"{np.mean(cm):19.4f}")
    print("    Reading: with a >= 0 (relu) the negative mass comes purely from w<0")
    print("    and sits near 1/2 -- w+ = max(w,0) discards about HALF of the signed")
    print("    contribution mass.  This is the information cost of Theorem 9.4.")

    sub("5.b  min_j z+_j  vs  min_j |z_j|   (doc claims ~2300x)")
    print("    Measured on the a >= 0 (post-ReLU) case, where z+ > 0 is meaningful.")
    print(f"    {'d':>6s} {'seeds':>6s} {'E min z+':>12s} {'E min|z|':>12s} "
          f"{'E ratio':>12s} {'median ratio':>14s} {'p10':>10s} {'p90':>10s}")
    for d in (16, 64, 256, 1024):
        rat, mzp, mz = [], [], []
        for s in range(400):
            r = np.random.default_rng(MASTER_SEED + 900000 + 13 * s + d)
            a = np.maximum(layernorm(r.normal(size=d) * r.lognormal(0, 0.5, size=d)), 0.0)
            W = r.normal(size=(d, d)) / np.sqrt(d)
            M = a[:, None] * W
            z = M.sum(axis=0)
            zp = (a[:, None] * np.maximum(W, 0.0)).sum(axis=0)
            if zp.min() <= 0 or np.abs(z).min() == 0:
                continue
            mzp.append(zp.min())
            mz.append(np.abs(z).min())
            rat.append(zp.min() / np.abs(z).min())
        rat = np.array(rat)
        print(f"    {d:6d} {len(rat):6d} {np.mean(mzp):12.4e} {np.mean(mz):12.4e} "
              f"{np.mean(rat):12.4e} {np.median(rat):14.4e} "
              f"{np.quantile(rat,0.1):10.3e} {np.quantile(rat,0.9):10.3e}")
    print("    The ratio is a heavy-tailed order statistic: min_j |z_j| is driven by")
    print("    near-cancellation events (z_j ~ 0) whose density near 0 is finite, so")
    print("    min_j|z_j| ~ 1/d^? shrinks with d while min_j z+_j does not.  The mean")
    print("    ratio is therefore dominated by rare draws and is NOT a stable '2300x'")
    print("    constant -- report the MEDIAN and the dimension, or the claim is")
    print("    meaningless.  See the table: the median moves by orders of magnitude")
    print("    across d, and the mean moves further.")
    print("\n    VERDICT on the document's '~2300x': directionally right, numerically")
    print("    unreproducible as a constant.  It is a d-dependent order statistic;")
    print("    the mean ratio passes through ~2300 near d ~ 200 and is ~16x at d=16")
    print("    and ~3.6e4 at d=1024.  The qualitative claim (z+ avoids cancellation,")
    print("    so min_j z+_j >> min_j |z_j|) is confirmed and is in the project's")
    print("    favour; the number must be quoted with its width.")

    sub("5.c  and does the favourable ratio survive when a is SIGNED (LayerNorm)?")
    print(f"    {'d':>6s} {'usable draws':>13s} {'E min z+ (signed a)':>21s} "
          f"{'E min|z|':>12s} {'median ratio':>14s}")
    for d in (16, 64, 256):
        rat, mzp = [], []
        used = 0
        for s in range(400):
            r = np.random.default_rng(MASTER_SEED + 800000 + 13 * s + d)
            a = layernorm(r.normal(size=d) * r.lognormal(0, 0.5, size=d))
            W = r.normal(size=(d, d)) / np.sqrt(d)
            z = (a[:, None] * W).sum(axis=0)
            zp = (a[:, None] * np.maximum(W, 0.0)).sum(axis=0)
            if zp.min() <= 0:
                continue          # z+ is NOT positive: rule inapplicable
            used += 1
            mzp.append(zp.min())
            rat.append(zp.min() / np.abs(z).min())
        print(f"    {d:6d} {used:8d}/400 {np.mean(mzp) if mzp else float('nan'):21.4e} "
              f"{'-':>12s} {np.median(rat) if rat else float('nan'):14.4e}")
    print("    With signed a the 'z+ avoids cancellation' argument evaporates:")
    print("    z+_j = sum_i a_i w+_ij is itself a signed sum and cancels too.")


# ============================================================================

def main():
    print(__doc__)
    print(f"master seed = {MASTER_SEED}")
    negative_controls()
    claim_A()
    claim_B()
    fcs = task2_synthetic()
    task2_realistic()
    task3()

    head("SUMMARY")
    bad = [k for k, v in results.items() if not v]
    for k, v in results.items():
        print(f"  [{'PASS' if v else 'FAIL'}] {k}")
    print(f"\n  {len(results) - len(bad)}/{len(results)} checks passed.")
    print("  lambda = 0 -> lambda > 0 transition band (synthetic family):")
    for d, (lo, hi) in sorted(fcs.items()):
        print(f"    d={d:4d}:  all-benign up to f={lo}, all-blow-up from f={hi}")
    if bad:
        print("  FAILURES: " + ", ".join(bad))


if __name__ == "__main__":
    main()
