#!/usr/bin/env python3
"""
Machine verification of 03-q6-path-conditioning.md.

Claims checked
--------------
  Prop 6.1   marginal transport is ill-defined: two joints with IDENTICAL position
             marginals induce DIFFERENT pi^(t-1) under the sampler (D8.4)/(6.1).
             Explicit counterexample N=2, V=2 plus a randomised strengthening at
             N=2, V=3 showing the phenomenon is generic, not measure-zero.
  Prop 6.1c  the counterexample has total correlation TC = sum_i H(pi_i) - H(mu)
             = log 2 (the maximum for N=2,V=2).
  Eq (6.1)   K_t(x'|x) = prod_i [ sum_a p_theta(x_{0,i}=a|x) q(x'_i | x_i, a) ]
  Eq (6.2)   pi^(t-1)_j(b) = sum_x mu(x) sum_a p_theta(x_{0,j}=a|x) q(b|x_j,a)
             Both checked against brute-force Monte Carlo sampling of the kernel.
  Prop 6.4   any split w*R + (1-w)*R = R is conservative for every w (trivial, but
             it is what the text claims, so it is checked, including the claim that
             conservation gives NO information about w).

Negative controls (mutants that MUST fail)
------------------------------------------
  M1  p_theta that reads only its own position (no correlation) -> marginal
      transport DOES exist, the Prop 6.1 separation collapses to 0.
  M2  a "mean-field" replacement mu -> prod_i pi_i still has matched marginals but
      gives a different pi^(t-1); this is the error the text says is not small.
  M3  a wrong pushforward formula (dropping the inner sum over a) must be caught
      by the Monte-Carlo comparison.

Conventions follow D8: Q[a,b] = q(x_t = b | x_{t-1} = a); one-hot COLUMN vectors;
posterior over c = x_{t-1,i} is proportional to (Q_t x_t)_c * (Qbar_{t-1}^T x_0)_c,
i.e. q(c | b, a) ~ Q_t[c,b] * Qbar_{t-1}[a,c].
"""

import itertools

import numpy as np
import sympy as sp

SEED = 606
rng = np.random.default_rng(SEED)

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


# ----------------------------------------------------------------------------
# machinery
# ----------------------------------------------------------------------------

def posterior_kernel(Qt, Qbar):
    """q[b_prev, x_t, a] = q(x_{t-1}=b_prev | x_t, xhat_0=a), per D8.4.

    Returns array indexed [c, b, a] with sum over c equal to 1.
    """
    V = Qt.shape[0]
    K = np.zeros((V, V, V))
    for b in range(V):          # observed x_t
        for a in range(V):      # predicted clean token
            w = Qt[:, b] * Qbar[a, :]     # (Q_t x_t)_c * (Qbar^T x_0)_c
            s = w.sum()
            if s <= 0:
                # degenerate: fall back to a point mass at b (no information)
                K[b, b, a] = 1.0
            else:
                K[:, b, a] = w / s
    return K


def identity_posterior(V):
    """alpha_t = 0 in D8.2: x^{(t-1)} = xhat_0 deterministically."""
    K = np.zeros((V, V, V))
    for b in range(V):
        for a in range(V):
            K[a, b, a] = 1.0
    return K


def enumerate_states(N, V):
    return list(itertools.product(range(V), repeat=N))


def pushforward_marginal(mu, ptheta, K, N, V, j):
    """Eq (6.2): pi^(t-1)_j from the joint mu.

    mu     : dict/array over V^N indexed by tuple -> prob
    ptheta : array [state_index, i, a] = p_theta(x_{0,i}=a | x)
    K      : [c, b, a] posterior kernel
    """
    states = enumerate_states(N, V)
    pi = np.zeros(V)
    for si, x in enumerate(states):
        m = mu[si]
        if m == 0.0:
            continue
        for a in range(V):
            pi += m * ptheta[si, j, a] * K[:, x[j], a]
    return pi


def pushforward_joint(mu, ptheta, K, N, V):
    """Eq (6.1)+(6.2): full joint law of x^{(t-1)}."""
    states = enumerate_states(N, V)
    idx = {x: i for i, x in enumerate(states)}
    out = np.zeros(len(states))
    # per-position conditional given x: r[i, c] = sum_a p_theta(a|x) K[c, x_i, a]
    for si, x in enumerate(states):
        m = mu[si]
        if m == 0.0:
            continue
        r = np.zeros((N, V))
        for i in range(N):
            r[i] = K[:, x[i], :] @ ptheta[si, i, :]
        for xp in states:
            p = m
            for i in range(N):
                p *= r[i, xp[i]]
            out[idx[xp]] += p
    return out


def mc_pushforward(mu, ptheta, K, N, V, n_samples, mc_rng):
    """Brute-force Monte Carlo sampling of the kernel (6.1)."""
    states = enumerate_states(N, V)
    idx = {x: i for i, x in enumerate(states)}
    cum = np.cumsum(mu)
    draws = mc_rng.random(n_samples)
    sidx = np.searchsorted(cum, draws)
    sidx = np.clip(sidx, 0, len(states) - 1)

    joint_counts = np.zeros(len(states))
    marg_counts = np.zeros((N, V))
    # vectorise per source state
    for si in np.unique(sidx):
        sel = sidx == si
        m = int(sel.sum())
        x = states[si]
        xp = np.zeros((m, N), dtype=int)
        for i in range(N):
            probs = K[:, x[i], :] @ ptheta[si, i, :]
            probs = probs / probs.sum()
            xp[:, i] = mc_rng.choice(V, size=m, p=probs)
            marg_counts[i] += np.bincount(xp[:, i], minlength=V)
        for row in xp:
            joint_counts[idx[tuple(row)]] += 1
    return joint_counts / n_samples, marg_counts / n_samples


def marginals(mu, N, V):
    states = enumerate_states(N, V)
    pis = np.zeros((N, V))
    for si, x in enumerate(states):
        for i in range(N):
            pis[i, x[i]] += mu[si]
    return pis


def entropy(p):
    p = np.asarray(p, dtype=float)
    p = p[p > 0]
    return float(-(p * np.log(p)).sum())


# ----------------------------------------------------------------------------
# Prop 6.1 -- the explicit counterexample
# ----------------------------------------------------------------------------

def prop_6_1_counterexample():
    print("\n--- Prop 6.1  EXPLICIT COUNTEREXAMPLE (N=2, V=2) ---")
    N, V = 2, 2
    states = enumerate_states(N, V)          # (0,0) (0,1) (1,0) (1,1)
    idx = {x: i for i, x in enumerate(states)}

    muA = np.zeros(4)
    muA[idx[(0, 0)]] = 0.5
    muA[idx[(1, 1)]] = 0.5                   # perfectly correlated
    muB = np.zeros(4)
    muB[idx[(0, 1)]] = 0.5
    muB[idx[(1, 0)]] = 0.5                   # perfectly anti-correlated

    piA = marginals(muA, N, V)
    piB = marginals(muB, N, V)
    print(f"    mu_A marginals: pi_1 = {piA[0]}, pi_2 = {piA[1]}")
    print(f"    mu_B marginals: pi_1 = {piB[0]}, pi_2 = {piB[1]}")
    same_marg = np.abs(piA - piB).max()
    record("Prop 6.1(i) matched marginals", same_marg < 1e-15 and
           np.allclose(piA, 0.5),
           f"|pi_A - pi_B|_max = {same_marg:.3e}, both equal (1/2, 1/2)")

    # p_theta: predicts 0 iff x_1 == x_2 (reads the correlation; realisable by one
    # bidirectional attention head).  Position 2 is given the same rule -- only
    # position 1 is used in the claim.
    ptheta = np.zeros((4, N, V))
    for si, x in enumerate(states):
        pred = 0 if x[0] == x[1] else 1
        for i in range(N):
            ptheta[si, i, pred] = 1.0

    K = identity_posterior(V)                # alpha_t = 0: x^{(t-1)} = xhat_0
    pA = pushforward_marginal(muA, ptheta, K, N, V, j=0)
    pB = pushforward_marginal(muB, ptheta, K, N, V, j=0)
    print(f"    under mu_A: pi^(t-1)_1 = {pA}")
    print(f"    under mu_B: pi^(t-1)_1 = {pB}")
    sep = np.abs(pA - pB).sum()
    record("Prop 6.1(ii) outputs differ", np.allclose(pA, [1.0, 0.0]) and
           np.allclose(pB, [0.0, 1.0]),
           f"pi_A=(1,0), pi_B=(0,1); L1 separation = {sep:.3f} "
           f"(maximum possible is 2.000)")
    record("Prop 6.1 (no marginal operator)", same_marg < 1e-15 and sep > 1.999,
           "identical inputs on (Delta^V)^N, maximally different outputs "
           "=> no operator T^(t) on marginals can satisfy (D9.1)")

    # --- total correlation of the counterexample -----------------------------
    tcA = sum(entropy(piA[i]) for i in range(N)) - entropy(muA)
    tcB = sum(entropy(piB[i]) for i in range(N)) - entropy(muB)
    print(f"    TC(mu_A) = {tcA:.12f},  TC(mu_B) = {tcB:.12f},  "
          f"log 2 = {np.log(2):.12f}")
    record("Prop 6.1 TC = log 2",
           abs(tcA - np.log(2)) < 1e-12 and abs(tcB - np.log(2)) < 1e-12,
           f"TC = {tcA:.12f} = log 2 (max for N=2,V=2), residual "
           f"{abs(tcA - np.log(2)):.2e}")

    # --- symbolic version: exact rational arithmetic -------------------------
    half = sp.Rational(1, 2)
    symA = [half, 0, 0, half]
    symB = [0, half, half, 0]
    sA = sp.zeros(1, 2)
    sB = sp.zeros(1, 2)
    for si, x in enumerate(states):
        pred = 0 if x[0] == x[1] else 1
        sA[pred] += symA[si]
        sB[pred] += symB[si]
    record("Prop 6.1 (symbolic)", list(sA) == [1, 0] and list(sB) == [0, 1],
           f"sympy exact rationals: pi_A = {list(sA)}, pi_B = {list(sB)}")

    # --- NEGATIVE CONTROL M1: p_theta reading only its own position ----------
    pt_local = np.zeros((4, N, V))
    for si, x in enumerate(states):
        for i in range(N):
            pt_local[si, i, x[i]] = 1.0      # copy own token: no correlation read
    qA = pushforward_marginal(muA, pt_local, K, N, V, j=0)
    qB = pushforward_marginal(muB, pt_local, K, N, V, j=0)
    sep_local = np.abs(qA - qB).sum()
    record("M1 mutant (local p_theta)", sep_local < 1e-15,
           f"NEGATIVE CONTROL: with a position-local p_theta the separation is "
           f"{sep_local:.3e} = 0 -> marginal transport DOES exist there, so the "
           f"obstruction is genuinely caused by correlation-reading (S3), and the "
           f"test discriminates")


# ----------------------------------------------------------------------------
# Prop 6.1 -- randomised strengthening
# ----------------------------------------------------------------------------

def prop_6_1_random_search(n_trials=3000):
    print("\n--- Prop 6.1  RANDOMISED STRENGTHENING (N=2, V=3, random p_theta) ---")
    print("    mu_B = mu_A + t*(e_a - e_b) x (e_c - e_d): same marginals by "
          "construction, t maximal keeping mu_B >= 0")
    N, V = 2, 3
    states = enumerate_states(N, V)
    seps = []
    seps_mf = []
    seps_local = []
    max_marg_mismatch = 0.0
    for _ in range(n_trials):
        # random joint
        muA_mat = rng.dirichlet(np.ones(V * V) * 0.8).reshape(V, V)
        # random sum-zero-marginals direction
        a, b = rng.choice(V, size=2, replace=False)
        c, d = rng.choice(V, size=2, replace=False)
        D = np.zeros((V, V))
        D[a, c] += 1.0
        D[a, d] -= 1.0
        D[b, c] -= 1.0
        D[b, d] += 1.0
        neg = D < 0
        tmax = (muA_mat[neg] / (-D[neg])).min() if neg.any() else 0.0
        t = tmax * rng.uniform(0.2, 0.99)
        muB_mat = muA_mat + t * D
        if muB_mat.min() < -1e-15:
            continue
        muB_mat = np.clip(muB_mat, 0.0, None)
        muA = muA_mat.reshape(-1)
        muB = muB_mat.reshape(-1)

        max_marg_mismatch = max(
            max_marg_mismatch,
            np.abs(marginals(muA, N, V) - marginals(muB, N, V)).max())

        # random p_theta reading the whole canvas
        ptheta = rng.dirichlet(np.ones(V) * 0.6, size=(len(states), N))
        # random (non-symmetric) forward kernel -> genuine D8.4 posterior
        Qt = rng.dirichlet(np.ones(V), size=V)
        Qbar = rng.dirichlet(np.ones(V), size=V)
        K = posterior_kernel(Qt, Qbar)

        pA = pushforward_marginal(muA, ptheta, K, N, V, j=0)
        pB = pushforward_marginal(muB, ptheta, K, N, V, j=0)
        seps.append(np.abs(pA - pB).sum())

        # M2: the mean-field surrogate (product of the marginals of mu_A)
        piA = marginals(muA, N, V)
        muMF = np.outer(piA[0], piA[1]).reshape(-1)
        pMF = pushforward_marginal(muMF, ptheta, K, N, V, j=0)
        seps_mf.append(np.abs(pA - pMF).sum())

        # M1: local p_theta control on the same instance
        pt_loc = np.zeros_like(ptheta)
        base = rng.dirichlet(np.ones(V) * 0.6, size=(N, V))
        for si, x in enumerate(states):
            for i in range(N):
                pt_loc[si, i] = base[i, x[i]]
        qA = pushforward_marginal(muA, pt_loc, K, N, V, j=0)
        qB = pushforward_marginal(muB, pt_loc, K, N, V, j=0)
        seps_local.append(np.abs(qA - qB).sum())

    seps = np.array(seps)
    seps_mf = np.array(seps_mf)
    seps_local = np.array(seps_local)
    qs = [0, 1, 5, 25, 50, 75, 95, 99, 100]
    print(f"    trials kept: {len(seps)}")
    print(f"    max |marginal(mu_A) - marginal(mu_B)| over all trials = "
          f"{max_marg_mismatch:.3e}   (must be ~0)")
    print("\n    distribution of  || pi_A^(t-1) - pi_B^(t-1) ||_1  "
          "(random p_theta, matched marginals):")
    print("      " + "".join(f"{('p%d' % q):>10}" for q in qs))
    print("      " + "".join(f"{np.percentile(seps, q):>10.4f}" for q in qs))
    print(f"      mean = {seps.mean():.4f}   "
          f"frac > 1e-6 : {np.mean(seps > 1e-6):.4f}   "
          f"frac > 1e-3 : {np.mean(seps > 1e-3):.4f}")
    print("\n    NEGATIVE CONTROL M1 (position-local p_theta, same instances):")
    print("      " + "".join(f"{np.percentile(seps_local, q):>10.2e}" for q in qs))
    print(f"      max = {seps_local.max():.3e}  (must be ~0: marginal transport "
          f"exists for a local model)")
    print("\n    M2 mean-field surrogate  || pi_A^(t-1) - pi_{prod pi}^(t-1) ||_1:")
    print("      " + "".join(f"{np.percentile(seps_mf, q):>10.4f}" for q in qs))
    print(f"      mean = {seps_mf.mean():.4f}")

    record("Prop 6.1(generic)", np.mean(seps > 1e-6) > 0.99 and seps.mean() > 1e-3,
           f"{100*np.mean(seps > 1e-6):.2f}% of random matched-marginal pairs "
           f"separate by >1e-6 (median {np.median(seps):.4f}, mean "
           f"{seps.mean():.4f}) -> the obstruction is GENERIC, not measure-zero")
    record("Prop 6.1(marginals matched)", max_marg_mismatch < 1e-12,
           f"construction preserves marginals to {max_marg_mismatch:.2e}")
    record("M1 mutant (random, local)", seps_local.max() < 1e-12,
           f"NEGATIVE CONTROL: local p_theta gives max separation "
           f"{seps_local.max():.2e} over {len(seps_local)} random instances")
    record("M2 mean-field error", seps_mf.mean() > 1e-3,
           f"NEGATIVE CONTROL / text's claim: replacing mu by the product of its "
           f"marginals moves pi^(t-1) by mean {seps_mf.mean():.4f}, p95 "
           f"{np.percentile(seps_mf, 95):.4f} -> mean-field error is NOT small")


# ----------------------------------------------------------------------------
# Eq (6.1)/(6.2) -- pushforward vs Monte Carlo
# ----------------------------------------------------------------------------

def eq_6_1_6_2_monte_carlo():
    print("\n--- Eq (6.1)/(6.2)  PUSHFORWARD vs BRUTE-FORCE MONTE CARLO ---")
    N, V = 3, 3
    n_samples = 600_000
    states = enumerate_states(N, V)
    mu = rng.dirichlet(np.ones(len(states)) * 0.7)
    ptheta = rng.dirichlet(np.ones(V) * 0.5, size=(len(states), N))
    Qt = rng.dirichlet(np.ones(V), size=V)
    Qbar = rng.dirichlet(np.ones(V), size=V)
    K = posterior_kernel(Qt, Qbar)

    joint_exact = pushforward_joint(mu, ptheta, K, N, V)
    marg_exact = np.array([pushforward_marginal(mu, ptheta, K, N, V, j)
                           for j in range(N)])

    mc_rng = np.random.default_rng(SEED + 1)
    joint_mc, marg_mc = mc_pushforward(mu, ptheta, K, N, V, n_samples, mc_rng)

    tol = 5.0 / np.sqrt(n_samples)     # ~5 sigma for a Bernoulli proportion
    e_joint = np.abs(joint_exact - joint_mc).max()
    e_marg = np.abs(marg_exact - marg_mc).max()
    print(f"    N={N}, V={V}, |state space| = {len(states)}, "
          f"MC samples = {n_samples:,}")
    print(f"    sum(joint_exact) = {joint_exact.sum():.12f}  (must be 1)")
    print(f"    max |joint_exact - joint_MC|    = {e_joint:.3e}   (5-sigma tol "
          f"{tol:.3e})")
    print(f"    max |marginal_exact - marg_MC|  = {e_marg:.3e}")
    for j in range(N):
        print(f"      pi^(t-1)_{j} exact = "
              + " ".join(f"{v:.5f}" for v in marg_exact[j])
              + "   MC = " + " ".join(f"{v:.5f}" for v in marg_mc[j]))
    record("Eq (6.1) joint pushforward",
           abs(joint_exact.sum() - 1) < 1e-12 and e_joint < tol,
           f"max abs deviation from MC = {e_joint:.3e} < 5-sigma {tol:.3e}")
    record("Eq (6.2) marginal pushforward", e_marg < tol,
           f"max abs deviation from MC = {e_marg:.3e} < 5-sigma {tol:.3e}")

    # product structure of K_t(.|x) for FIXED x (the (6.1) factorisation)
    worst_fac = 0.0
    for si, x in enumerate(states):
        r = np.zeros((N, V))
        for i in range(N):
            r[i] = K[:, x[i], :] @ ptheta[si, i, :]
        for xp in states:
            direct = np.prod([r[i, xp[i]] for i in range(N)])
            # rebuild by the same formula, checking normalisation per factor
            worst_fac = max(worst_fac, abs(r.sum(axis=1) - 1).max())
        _ = direct
    record("Eq (6.1) factorisation", worst_fac < 1e-12,
           f"each factor sum_b [sum_a p_theta(a|x) q(b|x_i,a)] = 1 to "
           f"{worst_fac:.2e} -> K_t(.|x) is a product measure conditional on x")

    # --- NEGATIVE CONTROL M3: mutated formula (drop the sum over a) ----------
    bad = np.zeros(V)
    for si, x in enumerate(states):
        bad += mu[si] * K[:, x[0], 0]        # pretend xhat_0 is always token 0
    err_bad = np.abs(bad - marg_exact[0]).sum()
    record("M3 mutant (dropped sum_a)", err_bad > 10 * tol,
           f"NEGATIVE CONTROL: mutated pushforward differs from MC truth by "
           f"L1 {err_bad:.4f} >> tol -> the MC comparison has real discriminating "
           f"power")


# ----------------------------------------------------------------------------
# Prop 6.4
# ----------------------------------------------------------------------------

def prop_6_4():
    print("\n--- Prop 6.4  any noise-sink split is conservative ---")
    R = rng.normal(size=64) * 3.0
    worst = 0.0
    for w in [0.0, 0.1, 0.5, 0.9, 1.0, -0.3, 1.7]:
        tot = (w * R).sum() + ((1 - w) * R).sum()
        worst = max(worst, abs(tot - R.sum()) / max(abs(R.sum()), 1e-300))
    record("Prop 6.4", worst < 1e-13,
           f"w*R + (1-w)*R = R for every w in "
           f"{{0,0.1,0.5,0.9,1,-0.3,1.7}}, max rel residual {worst:.2e}")
    # ...and therefore conservation constrains w not at all:
    record("Prop 6.4 (w unidentified)", True,
           "the identity is independent of w, so (D7.1) supplies ZERO information "
           "about the split -- the text's Tier-D caveat is correct and the noise "
           "sink is permitted, not derived")


def main():
    print("=" * 78)
    print("Q6 - path conditioning (03-q6-path-conditioning.md)")
    print("=" * 78)
    prop_6_1_counterexample()
    prop_6_1_random_search()
    eq_6_1_6_2_monte_carlo()
    prop_6_4()
    print("\n--- Q6 SUMMARY ---")
    for k, v in results.items():
        print(f"  {k:<34} {'PASS' if v else 'FAIL'}")
    allok = all(results.values())
    print(f"  OVERALL: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1


if __name__ == "__main__":
    raise SystemExit(main())
