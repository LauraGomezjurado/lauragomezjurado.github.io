#!/usr/bin/env python3
"""
Q6 EMPIRICAL TESTBED -- which cross-step join recovers true causal influence?

Context (03-q6-path-conditioning.md)
------------------------------------
Prop 6.3' (b): conditioning on the realised trajectory supplies NO cross-step
transport, because a pinned x^(t-1) is a constant and (6.5) gives
d zeta^(t-1) / d zeta^(t) = 0.  The join therefore needs a separately chosen
mechanism.  03-q6 lists three candidates (relaxation / interventional /
relevance-redistribution) and adopts none.  This file settles the question
EMPIRICALLY on a model small enough to have exact ground truth.

Model (D1-D3, D8)
-----------------
  V = 4, N = 4  ->  V^N = 256 canvases, fully enumerable
  d = 16, L = 2 bidirectional transformer blocks (no causal mask), 2 heads
  T = 6 denoising steps, uniform-state kernel (D8.2), posterior (D8.4)
        q(c | b, a)  \propto  Q_t[c,b] * Qbar_{t-1}[a,c]
  (the corrected transpose: (Q_t x_t)_c * (Qbar_{t-1}^T xhat_0)_c )

Weights: random but FIXED per seed, EXCEPT the readout (W_U, b_U) which is
trained by exact full-batch gradient descent (see train_readout) so that the
model is a genuine denoiser for a structured prior p*(x) ~ exp(beta * #{i<j :
x_i = x_j}) -- i.e. it favours canvases whose tokens agree.  The transformer
blocks are NEVER trained.  This is stated exactly, and the pre/post training
cross-entropies are printed.

Ground truth
------------
Every denoising step is an EXACT 256x256 row-stochastic matrix M_t (level t ->
level t-1), built by enumeration, no sampling.  With g_0 = phi and
g_t = M_t g_{t-1}, g_t(x) = E[phi(x^(0)) | x^(t) = x] exactly.  Along a realised
path x^(T:0),

    GT(t,i,a) := g_t( x^(t)[i <- a] ) - g_t( x^(t)[i <- abar] )

with abar a fixed baseline token, and an average-over-baselines variant.  The
exact propagation is cross-checked against Monte-Carlo sampling of the actual
sampler.

Candidates scored against GT
----------------------------
  J1   straight-through / relaxation: forward along the realised (hard) path,
       backward through the soft mean-field posterior Jacobian.
  J2   local interventional: ONE exact step of lookahead composed with the
       model's own one-shot clean prediction (NOT the exact multi-step
       propagation, which is the ground truth itself).
  J3   relevance redistribution, w = p^(t)_j(b*)      (Prop 6.4 / Q10)
  J3b  relevance redistribution, w = max(0,(p-1/V)/(1-1/V))
  NC1  random attributor          (negative control)
  NC2  constant attributor        (negative control)
  PC1  GT + noise                 (positive control: metrics must rank it high)

Everything is deterministic given the seeds.  numpy + sympy only.
"""

import itertools
import sys

import numpy as np
import sympy as sp

# ---------------------------------------------------------------------------
# configuration
# ---------------------------------------------------------------------------
V = 4                 # vocabulary
N = 4                 # canvas length
D_MODEL = 16
N_HEADS = 2
D_HEAD = D_MODEL // N_HEADS
N_BLOCKS = 2
T_STEPS = 6
EPS_LN = 1e-5

BETA_PRIOR = 1.2      # prior strength: p*(x) ~ exp(BETA * #{i<j: x_i = x_j})
ALPHABAR_T = 0.05     # cumulative alpha at t = T (nearly uniform)
BASELINE_TOKEN = 3    # abar for the fixed-baseline GT

WEIGHT_SEEDS = [0, 1, 2]
N_PATHS = 5           # realised trajectories per weight seed
MC_SAMPLES = 400_000  # Monte-Carlo check of the exact propagation
J2MC_SAMPLES = 32     # sample budget for the *sampled* local interventional join

REAL = ["J1", "J2", "J2mc", "J2a", "J3", "J3b"]
CONTROLS = ["J0", "NC1", "NC2", "PC1"]
CAND = REAL + CONTROLS
J2MC_BUDGETS = [4, 8, 16, 32, 128, 512]

CSTEP = 1e-30         # complex-step size (exact to machine precision)

N_STATES = V ** N
POWV = np.array([V ** (N - 1 - i) for i in range(N)])
STATES = np.array(list(itertools.product(range(V), repeat=N)))  # [256, N]

results = {}


def record(label, ok, detail=""):
    results[label] = results.get(label, True) and bool(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {detail}")


def hdr(s):
    print("\n" + "=" * 78)
    print(s)
    print("=" * 78)


def sub(s):
    print("\n--- " + s + " ---")


# ---------------------------------------------------------------------------
# statistics (no scipy)
# ---------------------------------------------------------------------------
def rankdata(a):
    a = np.asarray(a, dtype=float)
    n = a.size
    order = np.argsort(a, kind="mergesort")
    ranks = np.empty(n, dtype=float)
    ranks[order] = np.arange(n, dtype=float)
    srt = a[order]
    i = 0
    while i < n:
        j = i
        while j + 1 < n and srt[j + 1] == srt[i]:
            j += 1
        if j > i:
            ranks[order[i:j + 1]] = 0.5 * (i + j)
        i = j + 1
    return ranks


def pearson(x, y):
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    xc, yc = x - x.mean(), y - y.mean()
    dn = np.sqrt((xc ** 2).sum() * (yc ** 2).sum())
    return float(xc @ yc / dn) if dn > 0 else float("nan")


def spearman(x, y):
    return pearson(rankdata(x), rankdata(y))


def sign_agree(a, gt, deadband=0.0):
    gt = np.asarray(gt, float)
    a = np.asarray(a, float)
    m = np.abs(gt) > deadband
    if m.sum() == 0:
        return float("nan"), 0
    return float((np.sign(a[m]) == np.sign(gt[m])).mean()), int(m.sum())


def best_fit_r2(a, gt):
    """Least-squares slope of GT on a, and R^2 of the scaled fit."""
    a = np.asarray(a, float)
    gt = np.asarray(gt, float)
    denom = float(a @ a)
    if denom <= 0:
        return float("nan"), float("nan")
    lam = float(a @ gt) / denom
    ss_res = float(((gt - lam * a) ** 2).sum())
    ss_tot = float(((gt - gt.mean()) ** 2).sum())
    return lam, (1.0 - ss_res / ss_tot) if ss_tot > 0 else float("nan")


# ---------------------------------------------------------------------------
# model (D1, D2, D3) -- complex-safe so complex-step differentiation is exact
# ---------------------------------------------------------------------------
def softmax(z, axis=-1):
    z = z - np.max(z.real, axis=axis, keepdims=True)   # constant shift
    e = np.exp(z)
    return e / e.sum(axis=axis, keepdims=True)


def gelu(x):
    return 0.5 * x * (1.0 + np.tanh(0.7978845608028654 * (x + 0.044715 * x ** 3)))


def layernorm(x, gamma, beta):
    """D2.1: LN(x) = gamma * (x - mu)/sqrt(eps + ||c||^2/d) + beta."""
    mu = x.mean(axis=-1, keepdims=True)
    c = x - mu
    sig = np.sqrt(EPS_LN + (c ** 2).mean(axis=-1, keepdims=True))
    return gamma * (c / sig) + beta


def make_params(seed):
    rng = np.random.default_rng(1000 + seed)
    s = 1.0 / np.sqrt(D_MODEL)
    p = {
        "W_emb": rng.normal(0, 1.0, (V, D_MODEL)),
        "pos": rng.normal(0, 0.5, (N, D_MODEL)),
        "tim": rng.normal(0, 0.5, (T_STEPS + 1, D_MODEL)),
        "blocks": [],
        "ln_f_g": np.ones(D_MODEL) + rng.normal(0, 0.05, D_MODEL),
        "ln_f_b": rng.normal(0, 0.05, D_MODEL),
        "W_U": rng.normal(0, s, (D_MODEL, V)),
        "b_U": np.zeros(V),
    }
    for _ in range(N_BLOCKS):
        p["blocks"].append({
            "ln1_g": np.ones(D_MODEL) + rng.normal(0, 0.05, D_MODEL),
            "ln1_b": rng.normal(0, 0.05, D_MODEL),
            "ln2_g": np.ones(D_MODEL) + rng.normal(0, 0.05, D_MODEL),
            "ln2_b": rng.normal(0, 0.05, D_MODEL),
            "W_Q": rng.normal(0, s, (D_MODEL, D_MODEL)),
            "W_K": rng.normal(0, s, (D_MODEL, D_MODEL)),
            "W_V": rng.normal(0, s, (D_MODEL, D_MODEL)),
            "W_O": rng.normal(0, s, (D_MODEL, D_MODEL)),
            "W_1": rng.normal(0, s, (D_MODEL, 4 * D_MODEL)),
            "b_1": np.zeros(4 * D_MODEL),
            "W_2": rng.normal(0, s / 2, (4 * D_MODEL, D_MODEL)),
            "b_2": np.zeros(D_MODEL),
        })
    return p


def attention(x, blk):
    """D3, bidirectional (NO causal mask). x: [B,N,d]."""
    B = x.shape[0]
    q = (x @ blk["W_Q"]).reshape(B, N, N_HEADS, D_HEAD).transpose(0, 2, 1, 3)
    k = (x @ blk["W_K"]).reshape(B, N, N_HEADS, D_HEAD).transpose(0, 2, 1, 3)
    v = (x @ blk["W_V"]).reshape(B, N, N_HEADS, D_HEAD).transpose(0, 2, 1, 3)
    s = np.einsum("bhid,bhjd->bhij", q, k) / np.sqrt(D_HEAD)
    a = softmax(s, axis=-1)                       # rows sum to 1, all j allowed
    c = np.einsum("bhij,bhjd->bhid", a, v)
    c = c.transpose(0, 2, 1, 3).reshape(B, N, D_MODEL)
    return c @ blk["W_O"]


def features(p, pi, t):
    """pi: [B,N,V] soft one-hot (or complex).  Returns h_final [B,N,d] (post LN_f)."""
    h = pi @ p["W_emb"] + p["pos"][None] + p["tim"][t][None, None]
    for blk in p["blocks"]:
        h = h + attention(layernorm(h, blk["ln1_g"], blk["ln1_b"]), blk)
        h2 = layernorm(h, blk["ln2_g"], blk["ln2_b"])
        h = h + gelu(h2 @ blk["W_1"] + blk["b_1"]) @ blk["W_2"] + blk["b_2"]
    return layernorm(h, p["ln_f_g"], p["ln_f_b"])


def model_logits(p, pi, t):
    return features(p, pi, t) @ p["W_U"] + p["b_U"]


def model_p0(p, pi, t):
    """p_theta(x_{0,i} = a | canvas), shape [B,N,V]."""
    return softmax(model_logits(p, pi, t), axis=-1)


def onehot_states(idx):
    """idx: array of state indices -> [B,N,V] one-hot."""
    oh = np.zeros((len(idx), N, V))
    rows = STATES[idx]
    for i in range(N):
        oh[np.arange(len(idx)), i, rows[:, i]] = 1.0
    return oh


ALL_ONEHOT = onehot_states(np.arange(N_STATES))


# ---------------------------------------------------------------------------
# diffusion kernel (D8.2, D8.4)
# ---------------------------------------------------------------------------
def schedule():
    """alphabar_t linear from 1 (t=0) to ALPHABAR_T (t=T); alpha_t = ratio."""
    ab = np.linspace(1.0, ALPHABAR_T, T_STEPS + 1)
    al = np.ones(T_STEPS + 1)
    for t in range(1, T_STEPS + 1):
        al[t] = ab[t] / ab[t - 1]
    return al, ab


def Q_uniform(a):
    """D8.2: Q = a I + (1-a)(1/V) 11^T.  Q[x,y] = q(next = y | prev = x)."""
    return a * np.eye(V) + (1 - a) * np.ones((V, V)) / V


def posterior_kernel(Qt, Qbar_prev):
    """D8.4: K[c,b,a] = q(x_{t-1}=c | x_t=b, xhat_0=a) ~ Qt[c,b]*Qbar_{t-1}[a,c]."""
    K = np.zeros((V, V, V))
    for b in range(V):
        for a in range(V):
            w = Qt[:, b] * Qbar_prev[a, :]
            s = w.sum()
            K[:, b, a] = w / s if s > 0 else np.eye(V)[b]
    return K


# ---------------------------------------------------------------------------
# structured prior and exact denoising target (for readout training)
# ---------------------------------------------------------------------------
def prior_pstar():
    """p*(x) ~ exp(BETA * #{i<j : x_i = x_j}).  Favours canvases of equal tokens."""
    agree = np.zeros(N_STATES)
    for i in range(N):
        for j in range(i + 1, N):
            agree += (STATES[:, i] == STATES[:, j]).astype(float)
    w = np.exp(BETA_PRIOR * agree)
    return w / w.sum()


def forward_marginals(pstar, Qbar_t):
    """joint[x0, xt] = p*(x0) prod_i Qbar_t[x0_i, xt_i]; returns joint, q_t(xt)."""
    W = np.ones((N_STATES, N_STATES))
    for i in range(N):
        W *= Qbar_t[STATES[:, i]][:, STATES[:, i]]
    joint = pstar[:, None] * W
    return joint, joint.sum(axis=0)


def exact_denoise_target(joint, qt):
    """p(x_{0,i}=a | x_t) exactly, by enumeration.  Returns [N_STATES, N, V]."""
    post = joint / np.maximum(qt[None, :], 1e-300)          # [x0, xt]
    tgt = np.zeros((N_STATES, N, V))
    for i in range(N):
        for a in range(V):
            m = STATES[:, i] == a
            tgt[:, i, a] = post[m, :].sum(axis=0)
    return tgt


def train_readout(p, feats, targets, weights, n_steps=4000, lr=0.05, verbose=True):
    """Exact full-batch Adam on (W_U, b_U) ONLY.  Blocks stay random and fixed.

    Loss = sum_t sum_x q_t(x) sum_i CE( target(x,t,i,.) || softmax(h W_U + b_U) )
           / (T * N)
    where target is the EXACT denoising posterior p(x_{0,i}=a | x_t) under the
    structured prior p*, computed by enumeration.  The gradient is analytic
    (linear readout + softmax cross-entropy); no autodiff, no sampling.
    """
    Ts = len(feats)
    mW = np.zeros_like(p["W_U"]); vW = np.zeros_like(p["W_U"])
    mb = np.zeros_like(p["b_U"]); vb = np.zeros_like(p["b_U"])
    b1, b2, eps = 0.9, 0.999, 1e-8
    hist = []
    for step in range(n_steps + 1):
        loss = 0.0
        gW = np.zeros_like(p["W_U"])
        gb = np.zeros_like(p["b_U"])
        for ti in range(Ts):
            h = feats[ti]                                # [S,N,d]
            tg = targets[ti]                             # [S,N,V]
            w = weights[ti]                              # [S]
            lg = h @ p["W_U"] + p["b_U"]
            pr = softmax(lg, axis=-1)
            ce = -(tg * np.log(np.maximum(pr, 1e-300))).sum(-1)   # [S,N]
            loss += float((w[:, None] * ce).sum())
            d = (pr - tg) * w[:, None, None]             # [S,N,V]
            gW += np.einsum("snd,snv->dv", h, d)
            gb += d.sum(axis=(0, 1))
        loss /= (Ts * N)
        gW /= (Ts * N)
        gb /= (Ts * N)
        hist.append(loss)
        if step == n_steps:
            break
        k = step + 1
        mW = b1 * mW + (1 - b1) * gW; vW = b2 * vW + (1 - b2) * gW ** 2
        mb = b1 * mb + (1 - b1) * gb; vb = b2 * vb + (1 - b2) * gb ** 2
        p["W_U"] -= lr * (mW / (1 - b1 ** k)) / (np.sqrt(vW / (1 - b2 ** k)) + eps)
        p["b_U"] -= lr * (mb / (1 - b1 ** k)) / (np.sqrt(vb / (1 - b2 ** k)) + eps)
    if verbose:
        print(f"      readout CE: init {hist[0]:.4f} -> final {hist[-1]:.4f} "
              f"(Adam, {n_steps} steps, lr={lr})")
    return hist


# ---------------------------------------------------------------------------
# exact transition matrices and value functions
# ---------------------------------------------------------------------------
def per_position_conditional(p0, Kpost):
    """R[x,i,c] = sum_a p_theta(a|x) K[c, x_i, a]  -- the exact marginal law of
    x^(t-1)_i given the whole canvas x^(t) = x (eq 6.1's factor)."""
    R = np.zeros((N_STATES, N, V))
    for i in range(N):
        # K[:, STATES[:,i], :] -> [V(c), S, V(a)]
        Ki = Kpost[:, STATES[:, i], :].transpose(1, 0, 2)   # [S, c, a]
        R[:, i, :] = np.einsum("sca,sa->sc", Ki, p0[:, i, :])
    return R


def transition_matrix(R):
    """M[x,x'] = prod_i R[x,i,x'_i]  (eq 6.1: product measure given x)."""
    M = np.ones((N_STATES, N_STATES))
    for i in range(N):
        M *= R[:, i, :][:, STATES[:, i]]
    return M


def oneshot_value(p0, Phi):
    """Vhat_0(x) = E_{x0 ~ prod_j p_theta(.|x)} phi(x0), for each column of Phi."""
    B = np.ones((N_STATES, N_STATES))
    for j in range(N):
        B *= p0[:, j, :][:, STATES[:, j]]
    return B @ Phi


# ---------------------------------------------------------------------------
# monitors phi
# ---------------------------------------------------------------------------
def build_monitors():
    """columns 0..N-1 : phi_j(x) = 1[x_j = 0];  column N : smooth agreement score."""
    K = N + 1
    Phi = np.zeros((N_STATES, K))
    for j in range(N):
        Phi[:, j] = (STATES[:, j] == 0).astype(float)
    agree = np.zeros(N_STATES)
    for i in range(N - 1):
        agree += (STATES[:, i] == STATES[:, i + 1]).astype(float)
    Phi[:, N] = agree / (N - 1)
    names = [f"phi_pos{j}" for j in range(N)] + ["phi_smooth"]
    return Phi, names


MAIN = 0        # phi_pos0 = 1[x_0 = 0] is the primary monitor
SMOOTH = N      # phi_smooth


# ---------------------------------------------------------------------------
# candidate J1 / J3 : straight-through backward pass along the realised path
# ---------------------------------------------------------------------------
def onestep_soft(p, pi, t, Kpost):
    """Mean-field relaxation of one denoising step.  pi: [B,N,V] (complex ok).

        pi'_{j,c} = sum_a p_theta(x_{0,j}=a | pi) * sum_b pi_{j,b} K[c,b,a]

    At a hard one-hot pi this is exactly the true per-position law (eq 6.1)."""
    pr = model_p0(p, pi, t)
    mix = np.einsum("bjq,cqa->bjca", pi, Kpost)
    return np.einsum("bja,bjca->bjc", pr, mix)


def jac_onestep(p, x_state, t, Kpost):
    """d pi^(t-1) / d pi^(t) at the hard realised canvas, by complex step.
    Returns [N*V (out), N*V (in)]."""
    base = onehot_states(np.array([x_state]))[0]
    NV = N * V
    pert = np.tile(base.astype(complex), (NV, 1, 1))
    for k in range(NV):
        i, b = divmod(k, V)
        pert[k, i, b] += 1j * CSTEP
    out = onestep_soft(p, pert, t, Kpost)                  # [NV,N,V]
    return (out.imag / CSTEP).reshape(NV, NV).T


def straight_through_chain(p, path, Kposts, Phi, gates=None):
    """Backward relevance along the realised path.

    r^(0)_{j,c} = d phihat / d pi^(0)_{j,c} = phi( x^(0)[j <- c] )
    r^(s)       = D^(s)^T ( w^(s) * r^(s-1) )

    gates=None gives J1 (all weights 1).  Returns dict t -> [N*V, K]."""
    K = Phi.shape[1]
    x0 = path[0]
    r = np.zeros((N * V, K))
    for j in range(N):
        for c in range(V):
            xs = STATES[x0].copy()
            xs[j] = c
            r[j * V + c, :] = Phi[int(xs @ POWV), :]
    out = {}
    for s in range(1, T_STEPS + 1):
        if gates is not None:
            g = np.repeat(gates[s], V)[:, None]            # w^(s)_j, broadcast on c
            r = r * g
        D = jac_onestep(p, path[s], s, Kposts[s])
        r = D.T @ r
        out[s] = r.copy()
    return out


# ---------------------------------------------------------------------------
# one experiment (one weight seed)
# ---------------------------------------------------------------------------
def run_seed(seed, verbose=True, mc_check=False):
    rng = np.random.default_rng(50_000 + seed)
    alpha, alphabar = schedule()
    Qs = {t: Q_uniform(alpha[t]) for t in range(1, T_STEPS + 1)}
    Qbars = {t: Q_uniform(alphabar[t]) for t in range(0, T_STEPS + 1)}
    Kposts = {t: posterior_kernel(Qs[t], Qbars[t - 1]) for t in range(1, T_STEPS + 1)}

    p = make_params(seed)
    pstar = prior_pstar()

    # ---- exact denoising targets and readout training -----------------------
    feats, targets, weights = [], [], []
    for t in range(1, T_STEPS + 1):
        joint, qt = forward_marginals(pstar, Qbars[t])
        feats.append(features(p, ALL_ONEHOT, t))
        targets.append(exact_denoise_target(joint, qt))
        weights.append(qt)
    if verbose:
        # floor = conditional entropy of the exact posterior; ceiling = uniform
        floor = np.mean([float((w[:, None] * (-(tg * np.log(np.maximum(tg, 1e-300)))
                                              ).sum(-1)).sum()) / N
                         for tg, w in zip(targets, weights)])
        print(f"      CE floor (exact posterior) {floor:.4f} | "
              f"uniform predictor {np.log(V):.4f}")
    train_readout(p, feats, targets, weights, verbose=verbose)

    # ---- exact per-state model predictions, transitions, value functions ----
    P0 = {t: model_p0(p, ALL_ONEHOT, t) for t in range(1, T_STEPS + 1)}
    R = {t: per_position_conditional(P0[t], Kposts[t]) for t in range(1, T_STEPS + 1)}
    M = {t: transition_matrix(R[t]) for t in range(1, T_STEPS + 1)}
    row_err = max(float(np.abs(M[t].sum(1) - 1).max()) for t in M)

    Phi, phi_names = build_monitors()
    G = {0: Phi.copy()}                       # g_t = E[phi | x^(t) = .]
    for t in range(1, T_STEPS + 1):
        G[t] = M[t] @ G[t - 1]

    # local interventional (J2): one exact step + model's own one-shot readout
    Vhat0 = {0: Phi.copy()}
    for t in range(1, T_STEPS + 1):
        Vhat0[t] = oneshot_value(P0[t], Phi)
    Vhat1 = {t: M[t] @ Vhat0[t - 1] for t in range(1, T_STEPS + 1)}

    # ---- realised trajectories ---------------------------------------------
    paths = []
    for _ in range(N_PATHS):
        xs = np.zeros(T_STEPS + 1, dtype=int)
        xs[T_STEPS] = rng.integers(N_STATES)
        for t in range(T_STEPS, 0, -1):
            cur = STATES[xs[t]]
            nxt = np.zeros(N, dtype=int)
            for i in range(N):
                nxt[i] = rng.choice(V, p=R[t][xs[t], i, :])
            xs[t - 1] = int(nxt @ POWV)
        paths.append(xs)

    return dict(seed=seed, p=p, Kposts=Kposts, R=R, M=M, G=G, Vhat0=Vhat0,
                Vhat1=Vhat1, Phi=Phi, phi_names=phi_names, paths=paths,
                row_err=row_err, P0=P0, rng=rng, alphabar=alphabar)


def substitute(state, i, a):
    xs = STATES[state].copy()
    xs[i] = a
    return int(xs @ POWV)


def j2mc_scores(env, path, S, seed):
    """J2 with the ONE step of lookahead estimated from S sampled canvases,
    composed with the model's own one-shot clean prediction at level t-1.
    Common random numbers are shared across (i,a) within a level t."""
    mrng = np.random.default_rng(seed)
    out = np.zeros((T_STEPS + 1, N, V, env["Phi"].shape[1]))
    for t in range(1, T_STEPS + 1):
        u = mrng.random((S, N))
        for i in range(N):
            for a in range(V):
                s = substitute(path[t], i, a)
                cdf = np.cumsum(env["R"][t][s], axis=1)          # [N,V]
                dr = (u[:, :, None] > cdf[None, :, :]).sum(axis=2).clip(0, V - 1)
                out[t, i, a, :] = env["Vhat0"][t - 1][dr @ POWV].mean(axis=0)
    return out


def collect_attributions(env, path, mc_seed=0):
    """Return dict name -> array [T_STEPS+1, N, V, K] of raw scores s(t,i,a).

    Attribution for the contrast a vs abar is s(t,i,a) - s(t,i,abar);
    for the gradient-type joins s IS already the per-(i,a) score."""
    p, Kposts, G, Vhat1 = env["p"], env["Kposts"], env["G"], env["Vhat1"]
    Phi = env["Phi"]
    K = Phi.shape[1]
    shape = (T_STEPS + 1, N, V, K)

    gt = np.zeros(shape)
    j2 = np.zeros(shape)
    j2a = np.zeros(shape)
    for t in range(1, T_STEPS + 1):
        for i in range(N):
            for a in range(V):
                s = substitute(path[t], i, a)
                gt[t, i, a, :] = G[t][s, :]
                j2[t, i, a, :] = Vhat1[t][s, :]
                j2a[t, i, a, :] = env["Vhat0"][t][s, :]
    j2mc = j2mc_scores(env, path, J2MC_SAMPLES, 123_000 + mc_seed)

    # gates for J3 / J3b : w^(s)_j = p^(s)_j(b*), b* = realised x^(s-1)_j
    gates_lik, gates_exc = {}, {}
    for s in range(1, T_STEPS + 1):
        bstar = STATES[path[s - 1]]
        w = env["R"][s][path[s], np.arange(N), bstar]
        gates_lik[s] = w
        gates_exc[s] = np.maximum(0.0, (w - 1.0 / V) / (1.0 - 1.0 / V))

    ch_j1 = straight_through_chain(p, path, Kposts, Phi, gates=None)
    ch_j3 = straight_through_chain(p, path, Kposts, Phi, gates=gates_lik)
    ch_j3b = straight_through_chain(p, path, Kposts, Phi, gates=gates_exc)

    def unpack(ch):
        out = np.zeros(shape)
        for t in range(1, T_STEPS + 1):
            out[t] = ch[t].reshape(N, V, K)
        return out

    return {
        "GT": gt,
        "J1": unpack(ch_j1),
        "J2": j2,
        "J2a": j2a,
        "J2mc": j2mc,
        "J3": unpack(ch_j3),
        "J3b": unpack(ch_j3b),
    }, gates_lik, gates_exc


def contrast(raw, mode, abar=BASELINE_TOKEN):
    """raw [T+1,N,V,K] -> attribution A(t,i,a,k)."""
    if mode == "fixed":
        return raw - raw[:, :, abar:abar + 1, :]
    if mode == "avg":
        return raw - raw.mean(axis=2, keepdims=True)
    raise ValueError(mode)


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
def sympy_checks():
    hdr("PART 0 -- SYMBOLIC SANITY (sympy): the corrected posterior (D8.4)")
    v = 3
    a1, a2 = sp.symbols("alpha_1 alpha_2", positive=True)
    one = sp.ones(v, v)
    Q1 = a1 * sp.eye(v) + (1 - a1) * one / v
    Q2 = a2 * sp.eye(v) + (1 - a2) * one / v
    Qbar1 = Q1
    Qbar2 = sp.simplify(Q1 * Q2)
    # (i) Qbar_t = Q_1...Q_t
    ab = a1 * a2
    closed = ab * sp.eye(v) + (1 - ab) * one / v
    record("D8: Qbar_2 = Q_1 Q_2 closed form",
           sp.simplify(Qbar2 - closed) == sp.zeros(v, v),
           "uniform kernel composes within the family")
    # (ii) posterior formula == Bayes on the exact joint
    ok = True
    for b in range(v):
        for a in range(v):
            num = sp.Matrix([Q2[c, b] * Qbar1[a, c] for c in range(v)])
            num = num / sum(num)
            bayes = sp.Matrix([sp.simplify(Qbar1[a, c] * Q2[c, b] / Qbar2[a, b])
                               for c in range(v)])
            if sp.simplify(num - bayes) != sp.zeros(v, 1):
                ok = False
    record("D8.4: (Q_t x_t)_c * (Qbar_{t-1}^T x0)_c = exact Bayes posterior", ok,
           "checked symbolically for V=3, all (b,a), symbolic alphas")
    # (iii) terminal step is deterministic (Qbar_0 = I)
    K1 = [[sp.simplify((Q1[c, b] * sp.eye(v)[a, c])) for c in range(v)]
          for b in range(v) for a in range(v)]
    det_ok = all(sum(1 for z in row if z != 0) == 1 for row in K1)
    record("D8.4: terminal step t=1 collapses to x^(0) = xhat_0", det_ok,
           "Qbar_0 = I makes the posterior a point mass (as in 03-q6 6.1)")


def main():
    np.set_printoptions(precision=4, suppress=True)
    sympy_checks()

    hdr("PART 1 -- BUILDING THE TESTBED (V=4, N=4, d=16, L=2, T=6)")
    print(f"  canvases enumerated: V^N = {N_STATES}")
    al, ab = schedule()
    print(f"  alpha_t     = {np.array2string(al[1:], precision=4)}")
    print(f"  alphabar_t  = {np.array2string(ab, precision=4)}  (t = 0..T)")
    print(f"  prior p*(x) ~ exp({BETA_PRIOR} * #{{i<j: x_i=x_j}}), "
          f"max p* = {prior_pstar().max():.4f}, uniform = {1/N_STATES:.4f}")
    print(f"  baseline token abar = {BASELINE_TOKEN}")

    envs = []
    for sd in WEIGHT_SEEDS:
        print(f"\n  weight seed {sd}:")
        env = run_seed(sd)
        record(f"seed{sd}: exact transition matrices row-stochastic",
               env["row_err"] < 1e-12, f"max |row sum - 1| = {env['row_err']:.2e}")
        envs.append(env)

    # ---------------- complex-step derivative validation --------------------
    hdr("PART 2 -- DERIVATIVE MACHINERY VALIDATION (complex step vs central FD)")
    env = envs[0]
    path = env["paths"][0]
    s = 3
    Dc = jac_onestep(env["p"], path[s], s, env["Kposts"][s])
    base = onehot_states(np.array([path[s]]))[0]
    h = 1e-6
    Dfd = np.zeros_like(Dc)
    for k in range(N * V):
        i, b = divmod(k, V)
        pp = base.copy(); pp[i, b] += h
        pm = base.copy(); pm[i, b] -= h
        up = onestep_soft(env["p"], pp[None], s, env["Kposts"][s])[0].ravel()
        um = onestep_soft(env["p"], pm[None], s, env["Kposts"][s])[0].ravel()
        Dfd[:, k] = (up - um) / (2 * h)
    err = float(np.abs(Dc - Dfd).max())
    record("complex-step Jacobian == central finite differences", err < 1e-7,
           f"max abs diff = {err:.3e} (scale {np.abs(Dc).max():.3f})")

    soft0 = onestep_soft(env["p"], base[None], s, env["Kposts"][s])[0]
    hard0 = env["R"][s][path[s]]
    record("mean-field one-step map at a hard canvas == exact eq (6.1) factor",
           float(np.abs(soft0 - hard0).max()) < 1e-12,
           f"max abs diff = {float(np.abs(soft0 - hard0).max()):.3e}")

    # ---------------- Monte-Carlo validation of exact propagation -----------
    hdr("PART 3 -- GROUND TRUTH VALIDATION: exact propagation vs Monte Carlo")
    print(f"  sampler run {MC_SAMPLES} times per cell, no forward passes needed "
          f"(all 256 states precomputed)")
    print(f"  {'t':>2} {'i':>2} {'a':>2} {'exact E[phi]':>13} {'MC mean':>10} "
          f"{'MC s.e.':>9} {'z':>7}")
    mcrng = np.random.default_rng(9999)
    zs = []
    for (t, i, a) in [(6, 0, 0), (6, 2, 1), (4, 1, 2), (3, 3, 0), (2, 0, 1), (1, 2, 3)]:
        st = substitute(path[t], i, a)
        exact = env["G"][t][st, MAIN]
        cur = np.full(MC_SAMPLES, st, dtype=int)
        for step in range(t, 0, -1):
            Rt = env["R"][step]
            nxt = np.zeros((MC_SAMPLES, N), dtype=int)
            for pos in range(N):
                cdf = np.cumsum(Rt[cur, pos, :], axis=1)
                u = mcrng.random(MC_SAMPLES)[:, None]
                nxt[:, pos] = (u > cdf).sum(axis=1).clip(0, V - 1)
            cur = nxt @ POWV
        vals = env["Phi"][cur, MAIN]
        m, se = vals.mean(), vals.std(ddof=1) / np.sqrt(MC_SAMPLES)
        z = (m - exact) / se if se > 0 else 0.0
        zs.append(abs(z))
        print(f"  {t:>2} {i:>2} {a:>2} {exact:>13.6f} {m:>10.6f} {se:>9.6f} {z:>7.2f}")
    record("exact 256x256 propagation agrees with MC sampler", max(zs) < 4.0,
           f"max |z| = {max(zs):.2f} over 6 cells, {MC_SAMPLES} samples each "
           f"(|z|<4 expected)")

    # GT is EXACTLY the linear-response coefficient d E[phi] / d pi^(t)_{i,a}.
    # Independently checked by pushing a mixed distribution FORWARD through the
    # M_t matrices and comparing to the BACKWARD value function g_t.
    print("\n  Linear response: with x^(t)_i ~ pi and the rest of the canvas pinned,")
    print("  E[phi] = sum_a pi_a g_t(x[i<-a]) is LINEAR in pi, so g_t(x[i<-a]) is")
    print("  exactly d E[phi] / d pi^(t)_{i,a}.  GT is therefore the same object the")
    print("  straight-through join J1 estimates -- the gap is relaxation bias, not")
    print("  a derivative-vs-finite-difference mismatch.")
    lrerrs = []
    prng = np.random.default_rng(4242)
    for (t, i) in [(6, 1), (5, 2), (3, 0), (2, 3)]:
        pi_ = prng.dirichlet(np.ones(V))
        mu = np.zeros(N_STATES)
        for a in range(V):
            mu[substitute(path[t], i, a)] += pi_[a]
        v = mu.copy()
        for s in range(t, 0, -1):
            v = v @ env["M"][s]                      # forward pushforward
        lhs = float(v @ env["Phi"][:, MAIN])
        rhs = float(sum(pi_[a] * env["G"][t][substitute(path[t], i, a), MAIN]
                        for a in range(V)))
        lrerrs.append(abs(lhs - rhs))
        print(f"      t={t} i={i}: pushforward {lhs:.10f}  vs  "
              f"sum_a pi_a g_t {rhs:.10f}")
    record("GT = exact linear-response coefficient d E[phi]/d pi^(t)_{i,a}",
           max(lrerrs) < 1e-12,
           f"max |pushforward - sum_a pi_a g_t| = {max(lrerrs):.3e} over 4 cells")

    # ---------------- attribution comparison --------------------------------
    hdr("PART 4 -- SCORING THE CANDIDATE CROSS-STEP JOINS")
    print("""  J1    straight-through / relaxation: forward on the realised hard path,
        backward through the soft mean-field posterior Jacobian (exact, complex step)
  J2    local interventional: ONE exact denoising step of lookahead composed with
        the model's own factorised one-shot clean prediction at level t-1
  J2mc  the same, but the one step of lookahead is ESTIMATED with %d samples
        (common random numbers across a) -- the realistically cheap version
  J2a   zero-step: the model's own one-shot clean prediction at level t only
  J3    relevance redistribution, w^(s)_j = p^(s)_j(b*)              (Prop 6.4 / Q10)
  J3b   relevance redistribution, w = max(0, (p - 1/V)/(1 - 1/V))
  NC1   random attributor (negative control)
  NC2   constant attributor (negative control)
  PC1   GT + 50%% noise (positive control -- the metrics must rank this high)""" %
          J2MC_SAMPLES)

    per_seed = {}
    all_rows = []
    for env in envs:
        sd = env["seed"]
        gates_l, gates_e = None, None
        stack = {}
        for pi_idx, path in enumerate(env["paths"]):
            raw, gl, ge = collect_attributions(env, path,
                                               mc_seed=100 * sd + pi_idx)
            for k, v_ in raw.items():
                stack.setdefault(k, []).append(v_)
            if pi_idx == 0:
                gates_l, gates_e = gl, ge
        per_seed[sd] = dict(stack=stack, gates_l=gates_l, gates_e=gates_e, env=env)

        if sd == WEIGHT_SEEDS[0]:
            print(f"\n  [seed {sd}] realised-token likelihoods w^(s)_j = p^(s)_j(b*) "
                  f"(path 0):")
            for s in range(T_STEPS, 0, -1):
                print(f"      s={s}: w = {np.array2string(gates_l[s], precision=3)}"
                      f"   excess = {np.array2string(gates_e[s], precision=3)}")

    def build_vectors(sd, mode, kcol, tsel=None, tmin=1):
        st = per_seed[sd]["stack"]
        rng_ = np.random.default_rng(777 + sd)
        vecs = {}
        for name in ["GT"] + REAL:
            acc = []
            for arr in st[name]:
                A = contrast(arr, mode)[:, :, :, kcol]
                for t in range(1, T_STEPS + 1):
                    if tsel is not None and t != tsel:
                        continue
                    if t < tmin:
                        continue
                    for i in range(N):
                        for a in range(V):
                            if mode == "fixed" and a == BASELINE_TOKEN:
                                continue
                            acc.append(A[t, i, a])
            vecs[name] = np.array(acc)
        gtv = vecs["GT"]
        vecs["J0"] = np.zeros_like(gtv)      # what path-conditioning alone gives
        vecs["NC1"] = rng_.normal(0, 1, gtv.shape)
        vecs["NC2"] = np.ones_like(gtv)
        vecs["PC1"] = gtv + rng_.normal(0, 0.5 * gtv.std() + 1e-12, gtv.shape)
        return vecs

    npts = len(build_vectors(WEIGHT_SEEDS[0], "fixed", MAIN)["GT"])
    print(f"\n  scored points per seed: {npts}  "
          f"(T={T_STEPS} steps x {N_PATHS} paths x N={N} positions x "
          f"{V-1} non-baseline tokens)")

    for mode in ["fixed", "avg"]:
        sub(f"4.1  Correlation with GT -- baseline = "
            f"{'FIXED abar=%d' % BASELINE_TOKEN if mode=='fixed' else 'AVERAGE over baselines'}"
            f", monitor phi_pos0 = 1[x_0 = 0]")
        print(f"  {'cand':<5} " + " ".join(f"{'s%d pear' % s:>9} {'s%d spear' % s:>9}"
                                           for s in WEIGHT_SEEDS)
              + f" {'mean pear':>10} {'sd':>7} {'mean spear':>11} {'sd':>7}"
              + f" {'pear t>=2':>10}")
        for c in CAND:
            pe, spr, pe2 = [], [], []
            for sd in WEIGHT_SEEDS:
                v = build_vectors(sd, mode, MAIN)
                v2 = build_vectors(sd, mode, MAIN, tmin=2)
                pe.append(pearson(v[c], v["GT"]))
                spr.append(spearman(v[c], v["GT"]))
                pe2.append(pearson(v2[c], v2["GT"]))
            cells = " ".join(f"{pe[k]:>9.3f} {spr[k]:>9.3f}"
                             for k in range(len(WEIGHT_SEEDS)))
            print(f"  {c:<5} {cells} {np.mean(pe):>10.3f} {np.std(pe):>7.3f} "
                  f"{np.mean(spr):>11.3f} {np.std(spr):>7.3f} "
                  f"{np.mean(pe2):>10.3f}")
            all_rows.append((mode, c, np.mean(pe), np.std(pe),
                             np.mean(spr), np.std(spr), np.mean(pe2)))
        print("  (NC2 is constant, so its correlation is undefined -- nan is the "
              "correct output, not a bug.)")
        print("  (t>=2 column excludes t=1, where J2/J2mc/J2a are exact or "
              "near-exact by construction:")
        print("   at t=1 one step of lookahead already reaches the monitor.)")

    # sign agreement
    sub("4.2  Sign agreement (direction of influence), fixed baseline, phi_pos0")
    print(f"  {'cand':<5} {'all pts':>9} {'sd':>7} {'|GT|>1% max':>13} {'sd':>7} "
          f"{'n(dead-band)':>13}")
    sign_tab = {}
    for c in CAND:
        r1, r2, ns = [], [], []
        for sd in WEIGHT_SEEDS:
            v = build_vectors(sd, "fixed", MAIN)
            db = 0.01 * np.abs(v["GT"]).max()
            a1, _ = sign_agree(v[c], v["GT"], 0.0)
            a2, n2 = sign_agree(v[c], v["GT"], db)
            r1.append(a1); r2.append(a2); ns.append(n2)
        sign_tab[c] = (np.mean(r1), np.mean(r2))
        print(f"  {c:<5} {np.mean(r1):>9.3f} {np.std(r1):>7.3f} {np.mean(r2):>13.3f} "
              f"{np.std(r2):>7.3f} {int(np.mean(ns)):>13d}")

    # scaled fidelity + raw bias
    sub("4.3  BIAS.  Raw error A - GT, and best-fit rescaling GT ~ lambda*A")
    print(f"  mean|GT| = reference scale.  lambda != 1 is multiplicative bias; "
          f"R^2 is the\n  fraction of GT variance explained AFTER the optimal "
          f"rescaling (so it is the\n  fairest possible reading of a gradient-type "
          f"score whose units are arbitrary).")
    print(f"  {'cand':<5} {'mean(A-GT)':>11} {'mean|A-GT|':>11} "
          f"{'/mean|GT|':>10} {'lambda':>10} {'R^2':>8} {'sd(R^2)':>8}")
    for c in CAND:
        lams, r2s, b1, b2, sc = [], [], [], [], []
        for sd in WEIGHT_SEEDS:
            v = build_vectors(sd, "fixed", MAIN)
            lam, r2 = best_fit_r2(v[c], v["GT"])
            lams.append(lam); r2s.append(r2)
            b1.append(float(np.mean(v[c] - v["GT"])))
            b2.append(float(np.mean(np.abs(v[c] - v["GT"]))))
            sc.append(float(np.mean(np.abs(v["GT"]))))
        print(f"  {c:<5} {np.mean(b1):>11.4f} {np.mean(b2):>11.4f} "
              f"{np.mean(b2)/np.mean(sc):>10.2f} {np.mean(lams):>10.4g} "
              f"{np.mean(r2s):>8.3f} {np.std(r2s):>8.3f}")
    print(f"  (mean|GT| = {np.mean([np.mean(np.abs(build_vectors(sd,'fixed',MAIN)['GT'])) for sd in WEIGHT_SEEDS]):.4f})")

    # ---------------- conservation / completeness ---------------------------
    sub("4.4  Conservation / completeness:  sum_i A(t, i, x^(t)_i)  vs  "
        "Total(t) = g_t(x^(t)) - g_t(xbar)")
    print("       xbar = all-baseline canvas.  Defect = sum - Total.  "
          "GT ITSELF is listed:")
    print("       a nonzero GT defect means completeness is violated by "
          "interactions, not by the attributor.")
    print(f"  {'cand':<5} {'mean defect':>12} {'mean |defect|':>14} "
          f"{'mean|defect|/mean|Total|':>25}")
    cons_tab = {}
    tot_all = []
    for c in ["GT"] + CAND:
        d_all, dn_all = [], []
        for sd in WEIGHT_SEEDS:
            st = per_seed[sd]["stack"]
            env = per_seed[sd]["env"]
            rng_ = np.random.default_rng(31 + sd)
            for pth_i, path in enumerate(env["paths"]):
                if c in st:
                    A = contrast(st[c][pth_i], "fixed")[:, :, :, MAIN]
                elif c == "J0":
                    A = np.zeros(st["GT"][pth_i].shape[:3])
                elif c == "NC1":
                    A = rng_.normal(0, 1, st["GT"][pth_i].shape[:3])
                elif c == "NC2":
                    A = np.ones(st["GT"][pth_i].shape[:3])
                elif c == "PC1":
                    g = contrast(st["GT"][pth_i], "fixed")[:, :, :, MAIN]
                    A = g + rng_.normal(0, 0.5 * g.std() + 1e-12, g.shape)
                else:
                    continue
                xbar = int(np.full(N, BASELINE_TOKEN) @ POWV)
                for t in range(1, T_STEPS + 1):
                    tot = env["G"][t][path[t], MAIN] - env["G"][t][xbar, MAIN]
                    ssum = sum(A[t, i, STATES[path[t]][i]] for i in range(N))
                    d_all.append(ssum - tot)
                    dn_all.append(abs(tot))
        cons_tab[c] = (np.mean(d_all), np.mean(np.abs(d_all)))
        if c == "GT":
            tot_all = list(dn_all)
        print(f"  {c:<5} {np.mean(d_all):>12.4f} {np.mean(np.abs(d_all)):>14.4f} "
              f"{np.mean(np.abs(d_all)) / np.mean(tot_all):>25.3f}")
    print(f"  reference scale: mean |Total(t)| = {np.mean(tot_all):.4f}")

    # ---------------- behaviour vs t ----------------------------------------
    sub(f"4.5  Accuracy as a function of horizon t (Pearson r vs GT, mean over "
        f"{len(WEIGHT_SEEDS)} seeds x {N_PATHS} paths)")
    show = [c for c in CAND if c != "NC2"]
    print(f"  {'t':>2} {'horizon':>8} " + " ".join(f"{c:>8}" for c in show))
    for t in range(1, T_STEPS + 1):
        row = []
        for c in show:
            rs = []
            for sd in WEIGHT_SEEDS:
                v = build_vectors(sd, "fixed", MAIN, tsel=t)
                rs.append(pearson(v[c], v["GT"]))
            row.append(np.mean(rs))
        print(f"  {t:>2} {t:>8} " + " ".join(f"{x:>8.3f}" for x in row))
    print("  (horizon = number of remaining denoising steps between level t and "
          "the monitor at t=0)")

    # ---------------- sample budget for the sampled interventional join -----
    sub("4.6  Cost of the local interventional join: sample budget S for the "
        "one-step lookahead")
    print("  (S = forward-model samples per intervened canvas; S=inf is J2, the "
          "exact one-step\n   kernel.  Cost per attribution cell is O(S) forward "
          "passes at level t-1.)")
    print(f"  {'S':>6} {'pearson':>9} {'sd':>7} {'spearman':>10} "
          f"{'sign(|GT|>1%)':>14}")
    for S in J2MC_BUDGETS:
        pe, spr, sg = [], [], []
        for sd in WEIGHT_SEEDS:
            env = per_seed[sd]["env"]
            gtv, av = [], []
            for pth_i, path in enumerate(env["paths"]):
                arr = j2mc_scores(env, path, S, 424_000 + 100 * sd + pth_i)
                A = contrast(arr, "fixed")[:, :, :, MAIN]
                Ag = contrast(per_seed[sd]["stack"]["GT"][pth_i],
                              "fixed")[:, :, :, MAIN]
                for t in range(1, T_STEPS + 1):
                    for i in range(N):
                        for a in range(V):
                            if a == BASELINE_TOKEN:
                                continue
                            av.append(A[t, i, a]); gtv.append(Ag[t, i, a])
            gtv, av = np.array(gtv), np.array(av)
            pe.append(pearson(av, gtv))
            spr.append(spearman(av, gtv))
            sg.append(sign_agree(av, gtv, 0.01 * np.abs(gtv).max())[0])
        print(f"  {S:>6} {np.mean(pe):>9.3f} {np.std(pe):>7.3f} "
              f"{np.mean(spr):>10.3f} {np.mean(sg):>14.3f}")
    pe_ex = [pearson(build_vectors(sd, "fixed", MAIN)["J2"],
                     build_vectors(sd, "fixed", MAIN)["GT"]) for sd in WEIGHT_SEEDS]
    print(f"  {'exact':>6} {np.mean(pe_ex):>9.3f} {np.std(pe_ex):>7.3f}"
          f"{'':>10} {'':>14}   <- J2 (exact one-step kernel)")

    # ---------------- non-chronological influence ---------------------------
    hdr("PART 5 -- NON-CHRONOLOGICAL INFLUENCE (position i at level t -> "
        "position j at t=0)")
    print("  phi_j(x) = 1[x_j = 0].  'chronological' = i<j (AR-permitted), "
          "'non-chron.' = i>j.")
    print("  In a bidirectional diffusion model there is no reason for asymmetry; "
          "we measure it.")
    mag = {"i<j": [], "i=j": [], "i>j": []}
    for sd in WEIGHT_SEEDS:
        st = per_seed[sd]["stack"]
        for arr in st["GT"]:
            A = contrast(arr, "fixed")
            for t in range(1, T_STEPS + 1):
                for i in range(N):
                    for j in range(N):
                        for a in range(V):
                            if a == BASELINE_TOKEN:
                                continue
                            key = "i<j" if i < j else ("i=j" if i == j else "i>j")
                            mag[key].append(abs(A[t, i, a, j]))
    print(f"\n  mean |GT| by position relation:")
    for k in ["i<j", "i=j", "i>j"]:
        print(f"      {k}: {np.mean(mag[k]):.5f}   (max {np.max(mag[k]):.5f}, "
              f"n={len(mag[k])})")
    nonchron_exists = np.mean(mag["i>j"]) > 0.01 * np.mean(mag["i=j"])
    record("non-chronological influence (i>j) exists in the toy model",
           nonchron_exists,
           f"mean|GT| i>j = {np.mean(mag['i>j']):.5f} vs i<j "
           f"{np.mean(mag['i<j']):.5f}, ratio "
           f"{np.mean(mag['i>j'])/max(np.mean(mag['i<j']),1e-12):.3f}")

    sub("5.1  Do the candidates DETECT non-chronological influence? "
        "(Pearson r vs GT, i>j pairs only)")
    print(f"  {'cand':<5} {'r (i>j)':>9} {'sd':>7} {'r (i<j)':>9} {'sd':>7} "
          f"{'r (i=j)':>9} {'sd':>7}")

    def build_pos_vectors(sd, relation, kcols=None):
        st = per_seed[sd]["stack"]
        rng_ = np.random.default_rng(555 + sd)
        vecs = {}
        for name in ["GT"] + REAL:
            acc = []
            for arr in st[name]:
                A = contrast(arr, "fixed")
                for t in range(1, T_STEPS + 1):
                    for i in range(N):
                        for j in range(N):
                            rel = "i<j" if i < j else ("i=j" if i == j else "i>j")
                            if rel != relation:
                                continue
                            for a in range(V):
                                if a == BASELINE_TOKEN:
                                    continue
                                acc.append(A[t, i, a, j])
            vecs[name] = np.array(acc)
        g = vecs["GT"]
        vecs["J0"] = np.zeros_like(g)
        vecs["NC1"] = rng_.normal(0, 1, g.shape)
        vecs["NC2"] = np.ones_like(g)
        vecs["PC1"] = g + rng_.normal(0, 0.5 * g.std() + 1e-12, g.shape)
        return vecs

    posvec = {(sd, rel): build_pos_vectors(sd, rel)
              for sd in WEIGHT_SEEDS for rel in ["i>j", "i<j", "i=j"]}
    for c in CAND:
        cells = []
        for rel in ["i>j", "i<j", "i=j"]:
            rs = [pearson(posvec[(sd, rel)][c], posvec[(sd, rel)]["GT"])
                  for sd in WEIGHT_SEEDS]
            cells.append((np.mean(rs), np.std(rs)))
        print(f"  {c:<5} " + " ".join(f"{m:>9.3f} {s:>7.3f}" for m, s in cells))

    # ---------------- smooth monitor robustness -----------------------------
    sub("5.2  Robustness: same scoring with the SMOOTH monitor "
        "phi_smooth = (1/3) #{adjacent equal pairs}")
    print(f"  {'cand':<5} {'pearson':>9} {'sd':>7} {'spearman':>10} {'sd':>7} "
          f"{'sign':>7}")
    for c in CAND:
        pe, spr, sg = [], [], []
        for sd in WEIGHT_SEEDS:
            v = build_vectors(sd, "fixed", SMOOTH)
            pe.append(pearson(v[c], v["GT"]))
            spr.append(spearman(v[c], v["GT"]))
            sg.append(sign_agree(v[c], v["GT"], 0.0)[0])
        print(f"  {c:<5} {np.mean(pe):>9.3f} {np.std(pe):>7.3f} "
              f"{np.mean(spr):>10.3f} {np.std(spr):>7.3f} {np.mean(sg):>7.3f}")

    # ---------------- negative-control ranking check ------------------------
    hdr("PART 6 -- NEGATIVE-CONTROL CHECK (the metrics must rank the broken "
        "attributors worst)")
    scores, scores2 = {}, {}
    for c in CAND:
        rs, rs2 = [], []
        for sd in WEIGHT_SEEDS:
            v = build_vectors(sd, "fixed", MAIN)
            v2 = build_vectors(sd, "fixed", MAIN, tmin=2)
            rs.append(abs(pearson(v[c], v["GT"])))
            rs2.append(abs(pearson(v2[c], v2["GT"])))
        scores[c] = float(np.mean(rs))
        scores2[c] = float(np.mean(rs2))
    rank_key = lambda k: -(scores[k] if scores[k] == scores[k] else -1.0)
    order = sorted(scores, key=rank_key)
    print("  |Pearson| ranking (all t): " +
          "  >  ".join(f"{c}({scores[c]:.3f})" for c in order))
    print("  |Pearson| ranking (t>=2) : " +
          "  >  ".join(f"{c}({scores2[c]:.3f})"
                       for c in sorted(scores2,
                                       key=lambda k: -(scores2[k]
                                                       if scores2[k] == scores2[k]
                                                       else -1.0))))
    best_real = max(REAL, key=lambda c: scores[c])
    worst_real = min(REAL, key=lambda c: scores[c])
    nc1, nc2 = scores["NC1"], scores["NC2"]
    record("NC1 (random) scores worse than every real candidate",
           all(scores[c] > nc1 for c in REAL),
           f"NC1 |r| = {nc1:.3f}; worst real candidate ({worst_real}) |r| = "
           f"{scores[worst_real]:.3f}")
    record("NC2 (constant) has undefined correlation and cannot be ranked above "
           "any real candidate", not (nc2 == nc2),
           f"NC2 |r| = {nc2} -- nan because a constant vector has zero variance; "
           f"this is the correct behaviour of the metric, and NC2 is ranked last")
    record("PC1 (GT + 50% noise) scores in the top tier, so the metric can detect "
           "a good attributor",
           scores["PC1"] > 0.75 and scores["PC1"] > nc1 + 0.5,
           f"PC1 |r| = {scores['PC1']:.3f} (analytic value for 50% added noise: "
           f"1/sqrt(1.25) = {1/np.sqrt(1.25):.3f}); NC1 = {nc1:.3f}")
    j0_defect = cons_tab["J0"][1]
    mean_tot = np.mean(tot_all)
    record("J0 -- what path-conditioning ALONE supplies (Prop 6.3'b, eq 6.5) -- "
           "is the zero attributor",
           (scores["J0"] != scores["J0"]) and abs(j0_defect - mean_tot) < 1e-9,
           f"correlation undefined (nan, zero variance); sign agreement "
           f"{sign_tab['J0'][0]:.3f}; completeness defect {j0_defect:.4f} = "
           f"the entire total effect {mean_tot:.4f}. This is the empirical "
           f"content of 'conditioning deletes the cross-step problem'.")
    record("NC1 and NC2 have far larger completeness defects than GT",
           (abs(cons_tab["NC2"][1]) > 5 * abs(cons_tab["GT"][1]) and
            abs(cons_tab["NC1"][1]) > 5 * abs(cons_tab["GT"][1])),
           f"|defect|: NC1 {cons_tab['NC1'][1]:.4f}, NC2 {cons_tab['NC2'][1]:.4f}, "
           f"GT {cons_tab['GT'][1]:.4f}")

    # ---------------- verdict ------------------------------------------------
    hdr("PART 7 -- VERDICT")
    print(f"  {'cand':<5} {'|r| all t':>10} {'|r| t>=2':>10} {'sign(all)':>10} "
          f"{'sign(1%)':>9} {'mean|defect|':>13}")
    for c in REAL:
        print(f"  {c:<5} {scores[c]:>10.3f} {scores2[c]:>10.3f} "
              f"{sign_tab[c][0]:>10.3f} {sign_tab[c][1]:>9.3f} "
              f"{cons_tab[c][1]:>13.4f}")
    print(f"\n  best real candidate by |Pearson| (all t): {best_real} "
          f"({scores[best_real]:.3f}); at t>=2: "
          f"{max(REAL, key=lambda c: scores2[c])} "
          f"({max(scores2[c] for c in REAL):.3f})")
    good = scores2[best_real] > 0.9
    print()
    if good:
        print(f"  => {best_real} tracks the exact interventional ground truth "
              f"well (|r| > 0.9 even excluding the trivially-exact t=1).")
    else:
        print(f"  => NO candidate reaches |r| > 0.9 against exact ground truth "
              f"on t >= 2.\n     The cheap cross-step joins do NOT recover true "
              f"causal influence in this model.")
    grad_best = max(["J1", "J3", "J3b"], key=lambda c: scores[c])
    print(f"  => best DIFFERENTIABLE join (J1/J3/J3b): {grad_best} "
          f"|r| = {scores[grad_best]:.3f} -- "
          f"{'adequate' if scores[grad_best] > 0.9 else 'NOT adequate'}")
    print(f"  => redistribution gating changes |r| from {scores['J1']:.3f} (J1, "
          f"w=1) to {scores['J3']:.3f} (J3, w=p(b*))")
    print(f"     and {scores['J3b']:.3f} (J3b, w=excess): "
          f"{'gating helps' if scores['J3'] > scores['J1'] else 'gating HURTS'}")

    hdr("SUMMARY")
    npass = sum(1 for v in results.values() if v)
    nfail = sum(1 for v in results.values() if not v)
    for k, v in results.items():
        print(f"  [{'PASS' if v else 'FAIL'}] {k}")
    print(f"\n  {npass} checks passed, {nfail} failed")
    return 0 if nfail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
