import { useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import katex from 'katex'

// ─── KaTeX inline renderer ────────────────────────────────────────────────────
function Katex({ tex, display = false }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, { throwOnError: false, displayMode: display })
    }
  }, [tex, display])
  return <span ref={ref} />
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ number, title }) {
  return (
    <div style={{ marginTop: '3.5rem', marginBottom: '1.25rem' }}>
      <hr style={{ border: 0, borderTop: '1px solid #d8d3c8', marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#9c9483', letterSpacing: '0.1em' }}>
          §{number.toString().padStart(2, '0')}
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, color: '#1a1a1a', letterSpacing: '-0.005em', lineHeight: 1.3, margin: 0 }}>
          {title}
        </h2>
      </div>
    </div>
  )
}

// ─── Pull quote ───────────────────────────────────────────────────────────────
function Pullquote({ children }) {
  return (
    <blockquote style={{
      borderLeft: '2px solid #b8a8d0',
      paddingLeft: '1.25rem',
      margin: '1.75rem 0',
      color: '#4a4a4a',
      fontSize: '1.02rem',
      fontStyle: 'italic',
      lineHeight: 1.65,
      fontWeight: 400
    }}>
      {children}
    </blockquote>
  )
}

// ─── Math block ───────────────────────────────────────────────────────────────
function MathBlock({ tex }) {
  return (
    <div style={{
      margin: '1.5rem 0',
      padding: '0.5rem 0',
      overflowX: 'auto',
      textAlign: 'center'
    }}>
      <Katex tex={tex} display />
    </div>
  )
}

// ─── Figure ───────────────────────────────────────────────────────────────────
function Figure({ src, alt, caption, width = '100%' }) {
  return (
    <figure style={{ margin: '2.25rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          style={{ width, maxWidth: '100%', display: 'block', borderRadius: '2px' }}
        />
      </div>
      {caption && (
        <figcaption style={{
          fontSize: '0.82rem',
          color: '#5b5b5b',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginTop: '0.8rem',
          textAlign: 'left',
          maxWidth: '720px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─── Two-figure row ───────────────────────────────────────────────────────────
function FigureRow({ items, caption }) {
  return (
    <figure style={{ margin: '2.25rem 0' }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-end'
      }}>
        {items.map((it, i) => (
          <div key={i} style={{ flex: '1 1 280px', minWidth: 0 }}>
            <img
              src={it.src}
              alt={it.alt || ''}
              loading="lazy"
              style={{ width: '100%', display: 'block', borderRadius: '2px' }}
            />
            {it.subcaption && (
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                color: '#9c9483',
                letterSpacing: '0.05em',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                {it.subcaption}
              </div>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <figcaption style={{
          fontSize: '0.82rem',
          color: '#5b5b5b',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginTop: '0.9rem',
          textAlign: 'left'
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─── Algorithm box ────────────────────────────────────────────────────────────
const ALG_MONO = "'JetBrains Mono', ui-monospace, monospace"

function AlgRow({ n, code, note, highlight }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2.2rem 1fr',
      gap: '0.5rem',
      alignItems: 'baseline',
      padding: '0.25rem 0',
      background: highlight ? '#fbf5ee' : 'transparent',
      borderRadius: highlight ? '4px' : 0,
      paddingLeft: highlight ? '0.4rem' : 0,
      paddingRight: highlight ? '0.4rem' : 0,
    }}>
      <span style={{ fontFamily: ALG_MONO, color: '#9c9483', fontSize: '0.78rem' }}>{n}</span>
      <div>
        <span style={{ fontFamily: ALG_MONO, fontSize: '0.86rem', color: '#1a1a1a' }}>{code}</span>
        {note && (
          <span style={{ fontFamily: ALG_MONO, fontSize: '0.74rem', color: '#9c9483', marginLeft: '0.75rem' }}>
            ▷ {note}
          </span>
        )}
      </div>
    </div>
  )
}

function AlgorithmBox() {
  return (
    <div style={{
      border: '1px solid #e3dccc',
      borderRadius: '6px',
      padding: '1.1rem 1.25rem',
      margin: '2rem 0',
      background: '#fdfbf6'
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        color: '#9c9483',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.6rem'
      }}>
        Algorithm — one step of Orth-Dion / Stripped Dion
      </div>
      <AlgRow n="1" code="M_t  ← G_t + R_t" note="buffer = gradient + error feedback" />
      <AlgRow n="2" code="U_t  ← QR(M_t · V_{t−1})" note="left factor via power iteration" />
      <AlgRow n="3" code="W_t  ← M_tᵀ · U_t" note="un-normalized right factor" />
      <AlgRow
        n="4"
        code="V̄_t  ← QR(W_t)   ◀ Orth-Dion       (Dion: ColNorm(W_t))"
        note="the only changed line"
        highlight
      />
      <AlgRow n="5" code="D̂_t  ← U_t · V̄_tᵀ" note="rank-r update direction" />
      <AlgRow n="6" code="X_{t+1} ← X_t − η · D̂_t" note="parameter step" />
      <AlgRow n="7" code="R_{t+1} ← β · (M_t − U_t (U_tᵀ M_t))" note="error feedback" />
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        color: '#9c9483',
        marginTop: '0.6rem',
        lineHeight: 1.55
      }}>
        QR adds O(nr²) compute; the dominant cost remains the O(mnr) power step.
        Communication is O((m+n)r) per matrix in both variants.
      </div>
    </div>
  )
}

// ─── Comparison card: ColNorm vs QR ───────────────────────────────────────────
function GeometryCard({ title, formula, lines, accent }) {
  return (
    <div style={{
      flex: 1,
      minWidth: '260px',
      border: `1px solid ${accent}40`,
      borderTop: `2px solid ${accent}`,
      borderRadius: '6px',
      padding: '1.05rem 1.15rem',
      background: '#fdfcf9'
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: accent,
        marginBottom: '0.55rem',
        fontWeight: 600
      }}>
        {title}
      </div>
      <div style={{ marginBottom: '0.6rem' }}>
        <Katex tex={formula} display />
      </div>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '0.88rem',
        color: '#3a3a3a',
        lineHeight: 1.6
      }}>
        {lines.map((l, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{l}</li>)}
      </ul>
    </div>
  )
}

function GeometryCompare() {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      margin: '2rem 0'
    }}>
      <GeometryCard
        title="Dion (column normalization)"
        formula="\bar V_t = \operatorname{ColNorm}(W_t)"
        lines={[
          <>Each column of <Katex tex="W_t"/> rescaled to unit length.</>,
          <>Span preserved, but <Katex tex="\bar V_t^\top \bar V_t" /> has unit diagonal and possibly large off-diagonals.</>,
          <>Dual norm <Katex tex="\nu_t = \|\bar V_t\|_{\mathrm{op}} \in [1,\sqrt{r}]" />.</>,
        ]}
        accent="#3b6bb5"
      />
      <GeometryCard
        title="Orth-Dion (QR orthogonalization)"
        formula="\bar V_t = \operatorname{QR}(W_t)"
        lines={[
          <>Same span; columns are made orthonormal.</>,
          <><Katex tex="\bar V_t^\top \bar V_t = I_r" />, so <Katex tex="\hat D_t = U_t \bar V_t^\top" /> is a rank-<Katex tex="r"/> partial isometry.</>,
          <>Dual norm <Katex tex="\nu_t = 1" /> by construction.</>,
        ]}
        accent="#b5302d"
      />
    </div>
  )
}

// ─── Spectrum panel: bar chart of singular values for three optimizers ──────
function SpectrumPanel() {
  // Same gradient G = [[3, 1], [1, 1]], three update rules.
  // The numbers below are σ(D) for each step direction D.
  const rows = [
    {
      label: 'SGD',
      sub: <>direction <em>= G</em></>,
      sigmas: [3.41, 0.59],
      summary: 'spectrum inherited',
      color: '#9c9483'
    },
    {
      label: 'SignSGD',
      sub: <>direction <em>= sign(G)</em></>,
      sigmas: [2.00, 0.00],
      summary: 'spectrum collapsed (rank 1)',
      color: '#3b6bb5'
    },
    {
      label: 'Muon',
      sub: <>direction <em>= UVᵀ</em></>,
      sigmas: [1.00, 1.00],
      summary: 'spectrum equalized',
      color: '#b5302d'
    },
  ]

  const W = 520, H = 220
  const labelW = 110
  const barAreaX = labelW + 14
  const barAreaW = W - barAreaX - 110   // leave room for summary on the right
  const rowH = 56
  const top = 22
  const sigmaMax = 3.6                  // x-axis scale (covers all rows)
  const barH = 16
  const gapY = 4

  return (
    <figure style={{ margin: '2.25rem 0' }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        color: '#9c9483',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.45rem'
      }}>
        singular values σ(step direction) for the same gradient G
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
           aria-label="Bar chart of the singular values of the step direction produced by SGD, SignSGD, and Muon for the same 2x2 gradient.">
        {/* x-axis scale marks */}
        {[0, 1, 2, 3].map(v => {
          const x = barAreaX + (v / sigmaMax) * barAreaW
          return (
            <g key={v}>
              <line x1={x} y1={top - 6} x2={x} y2={top + 3 * rowH + 6} stroke="#ececec" strokeWidth="1" />
              <text x={x} y={top + 3 * rowH + 20} fontSize="9" fill="#9c9483"
                    fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                {v}
              </text>
            </g>
          )
        })}
        <text x={barAreaX + barAreaW / 2} y={H - 6} fontSize="9.5" fill="#5b5b5b"
              fontFamily="'Inter', sans-serif" textAnchor="middle">
          singular value
        </text>

        {/* Per-optimizer rows */}
        {rows.map((row, i) => {
          const yCenter = top + i * rowH + 14
          return (
            <g key={row.label}>
              {/* Row label */}
              <text x={labelW} y={yCenter + 4} fontSize="12" fontWeight="500"
                    fill="#1a1a1a" fontFamily="'Inter', sans-serif" textAnchor="end">
                {row.label}
              </text>
              <text x={labelW} y={yCenter + 18} fontSize="9.5"
                    fill="#9c9483" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                σ = ({row.sigmas[0].toFixed(2)}, {row.sigmas[1].toFixed(2)})
              </text>

              {/* σ₁ bar */}
              <rect
                x={barAreaX}
                y={yCenter - barH - gapY / 2}
                width={Math.max((row.sigmas[0] / sigmaMax) * barAreaW, 0)}
                height={barH}
                fill={row.color}
                opacity="0.85"
                rx="1.5"
              />
              {/* σ₂ bar */}
              <rect
                x={barAreaX}
                y={yCenter + gapY / 2}
                width={Math.max((row.sigmas[1] / sigmaMax) * barAreaW, 0)}
                height={barH}
                fill={row.color}
                opacity="0.5"
                rx="1.5"
              />

              {/* Summary on the right */}
              <text x={W - 8} y={yCenter + 4} fontSize="10"
                    fill={row.color} fontFamily="'Inter', sans-serif" textAnchor="end" fontStyle="italic">
                {row.summary}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption style={{
        fontSize: '0.82rem',
        color: '#5b5b5b',
        fontStyle: 'italic',
        lineHeight: 1.6,
        marginTop: '0.6rem',
        textAlign: 'left'
      }}>
        For the same gradient <em>G</em> = [[3, 1], [1, 1]], the three optimizers produce step
        directions with very different singular spectra. SGD passes the spectrum through
        unchanged; SignSGD collapses it to rank one; Muon equalizes it. The shape of the unit
        ball each optimizer is implicitly minimizing against is what selects this behavior.
      </figcaption>
    </figure>
  )
}

// ─── Prose helpers ────────────────────────────────────────────────────────────
const P = ({ children }) => (
  <p style={{ color: '#2a2a2a', lineHeight: 1.72, fontSize: '1.02rem', marginBottom: '1.1rem', fontWeight: 400 }}>
    {children}
  </p>
)
const Em = ({ children }) => <em style={{ fontStyle: 'italic', color: '#2a2a2a' }}>{children}</em>
const Strong = ({ children }) => <strong style={{ color: '#1a1a1a', fontWeight: 600 }}>{children}</strong>
const InlineCode = ({ children }) => (
  <code style={{ background: '#f1ede4', color: '#5b3a8a', padding: '0.1em 0.35em', borderRadius: '3px', fontSize: '0.92em', fontFamily: "'JetBrains Mono', monospace" }}>
    {children}
  </code>
)
const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
     style={{ color: '#5b3a8a', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
    {children}
  </a>
)

// ─── MAIN POST COMPONENT ──────────────────────────────────────────────────────
export default function OrthDionPost() {
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      margin: '0 auto',
      color: '#1a1a1a'
    }}>
      {/* ── 1. Motivation ─────────────────────────────────────────────────── */}
      <SectionHeading number={1} title="A geometric fix hiding inside a normalization line" />

      <P>
        Distributed training of large language models is shaped by two budgets at once. Per-step
        compute fixes how much arithmetic each accelerator can do; collective communication fixes
        how quickly gradients and optimizer state move between them. Under fully sharded data
        parallel (FSDP) training, parameters and gradients are split across devices, and any
        optimizer that needs to see a full parameter matrix has to pay an extra all-gather and
        reduce-scatter. For matrix-valued optimizers that orthogonalize momentum, like
        <ExtLink href="https://arxiv.org/abs/2502.16982"> Muon</ExtLink>, that extra collective is
        the bottleneck.
      </P>

      <P>
        <ExtLink href="https://arxiv.org/abs/2504.05295">Dion</ExtLink> proposes a clean way out.
        Instead of orthogonalizing the full momentum matrix, it tracks a rank-<Katex tex="r" /> factorization
        through one step of power iteration and communicates only the small factors. The
        per-matrix communication drops from <Katex tex="O(mn)" /> to <Katex tex="O((m{+}n)r)" />.
        This makes spectral-style optimization usable under FSDP. The catch is that, in practice,
        Dion converges more slowly than full-rank spectral methods, and the standard reading is
        that this is just the unavoidable cost of working at rank <Katex tex="r" />.
      </P>

      <P>
        We were curious whether that reading is actually correct, and the answer turned out to be
        less innocent than it sounds. There is a <Strong>geometric mismatch</Strong> inside Dion,
        introduced by a single normalization step, that shows up as a <Katex tex="\sqrt{r}" />{' '}
        penalty in the convergence rate even when the low-rank approximation of the gradient is
        accurate. Replacing that one line with QR orthogonalization removes the penalty, recovers
        the rate of the full-rank spectral method at Dion's communication cost, and produces a
        clean, measurable signature on real LLM training runs.
      </P>

      <Pullquote>
        Both algorithms select the same rank-<Katex tex="r" /> subspace. They differ in how they
        scale the update <Em>inside</Em> that subspace. The scaling is what costs Dion a factor
        of <Katex tex="\sqrt{r}" /> in the rate.
      </Pullquote>

      <Figure
        src="/images/blog/orth-dion/figure1_val_loss.png"
        alt="Late-stage validation loss for Dion, Orth-Dion, and Ada-Orth-Dion on LLaMA 3 320M (rank 384)."
        caption={
          <>
            <Strong>Figure 1.</Strong> Late-stage validation loss on a LLaMA 3 320M pre-training
            run at rank <Katex tex="r=384" />, with the mean and a 2-standard-deviation band over
            three seeds. At a matched rank, Orth-Dion reaches Dion's plateau earlier and keeps
            descending; Ada-Orth-Dion improves further by shrinking the working rank toward each
            layer's intrinsic dimensionality. Full trajectories are reported in §10.
          </>
        }
        width="640px"
      />

      {/* ── 2. NEW: warm-up with a 2x2 ────────────────────────────────────── */}
      <SectionHeading number={2} title={"A 2×2 warm-up: same gradient, three optimizers"} />

      <P>
        The cleanest way to see what <Em>spectral</Em> means in a spectral optimizer is to drop
        dimensions until you can see the whole matrix. Take a single layer whose weight matrix is
        two-by-two, and suppose the gradient at this point is
      </P>

      <MathBlock tex="G \;=\; \begin{pmatrix} 3 & 1 \\ 1 & 1 \end{pmatrix}." />

      <P>
        Three classical optimizers each have a recipe for turning <Katex tex="G"/> into a step
        direction. The recipes look identical from the outside — multiply the direction by a
        learning rate, subtract from the weights, repeat — but the step matrices they produce have
        very different shapes.
      </P>

      <P>
        <Strong>SGD</Strong> uses the gradient as is. The step direction is <Katex tex="-G"/>; its
        singular spectrum is whatever <Katex tex="G"/> had to begin with. A quick calculation gives{' '}
        <Katex tex="\sigma(G) = (2{+}\sqrt{2},\, 2{-}\sqrt{2}) \approx (3.41,\, 0.59)"/>. The
        big direction is roughly six times larger than the small one, and the step inherits that
        anisotropy.
      </P>

      <P>
        <Strong>SignSGD</Strong> looks at <Katex tex="G"/> entrywise and replaces every entry by
        its sign:
      </P>

      <MathBlock tex="\operatorname{sign}(G) \;=\; \begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}." />

      <P>
        This matrix has rank one. Its singular values are <Katex tex="(2,\,0)"/>. The step
        direction has been crushed into a single matrix direction — entrywise saturation collapses
        the spectrum.
      </P>

      <P>
        <Strong>Muon</Strong> reads <Katex tex="G"/> as a matrix and replaces it with its{' '}
        <Em>polar factor</Em> — the orthogonal matrix closest to <Katex tex="G"/> in the SVD sense.
        If <Katex tex="G = U \Sigma V^\top"/> is the SVD, the polar factor is{' '}
        <Katex tex="U V^\top"/>. For a symmetric positive-definite <Katex tex="G"/> like ours,{' '}
        <Katex tex="U = V"/> and the polar factor collapses to the identity:
      </P>

      <MathBlock tex="U V^\top \;=\; I, \qquad \sigma(U V^\top) = (1,\, 1)." />

      <P>
        Both singular values now equal one. The step has been <Em>equalized</Em> in matrix space:
        the stiff and soft directions of <Katex tex="G"/> are given the same step length.
      </P>

      <SpectrumPanel />

      <P>
        Looking at the three rows together is the whole warm-up. SGD respects what each entry of{' '}
        <Katex tex="G"/> says; SignSGD respects only the sign of each entry; Muon respects the
        matrix as a geometric object and equalizes its directional scale. Three different choices
        about <Em>what counts as a unit step</Em>, three different shapes for the update.
      </P>

      {/* ── 3. NEW: the geometry behind the three optimizers ────────────────── */}
      <SectionHeading number={3} title="Where each unit ball lives" />

      <P>
        The three recipes are not ad hoc; each is the closed-form steepest-descent direction
        under a different norm. Given a loss{' '}
        <Katex tex="f:\mathbb{R}^{m\times n}\to\mathbb{R}" /> and a norm <Katex tex="\|\cdot\|" />,
        steepest descent picks the unit-norm matrix that aligns best with the gradient:
      </P>

      <MathBlock tex="D_t^\star \;=\; \arg\max_{\|D\| \le 1}\, \langle \nabla f(X_t),\, D\rangle." />

      <P>
        The shape of the unit ball <Katex tex="\{D : \|D\| \le 1\}"/> is what selects an optimizer.
        Under the Euclidean (Frobenius) norm, the ball is round and the argmax is{' '}
        <Katex tex="G/\|G\|_F"/> — SGD. Under the entrywise <Katex tex="\ell_\infty"/> norm the
        ball is a cube and the argmax is <Katex tex="\operatorname{sign}(G)"/> — SignSGD. Under
        the operator (spectral) norm the ball is the set of contractive matrices and the argmax is
        the polar factor — Muon.
      </P>

      <Figure
        src="/images/blog/orth-dion/geometry_norms.png"
        alt="Unit balls for SGD (Euclidean), SignSGD (ell-infinity), and Muon (spectral) geometries."
        caption={
          <>
            <Strong>Figure 2.</Strong> Three unit balls in matrix space. SGD's argmax sits on a
            sphere; SignSGD's sits on the cube's corners; Muon's sits on the set of orthogonal
            matrices — those with all singular values equal to one. The spectrum-equalizing
            behavior we saw in the warm-up is what that last constraint enforces.
          </>
        }
        width="560px"
      />

      <P>
        Equalizing the spectrum is principled when the loss landscape is anisotropic across matrix
        directions: a single learning rate cannot otherwise simultaneously avoid overshoot in the
        soft directions and crawl in the stiff ones. On transformer weights this turns out to
        matter. Muon's empirical edge over AdamW in the nanoGPT speedrun, and a steady stream of
        follow-up work, comes from this single observation.
      </P>

      {/* ── 4. NEW: FSDP makes Muon expensive ───────────────────────────────── */}
      <SectionHeading number={4} title="Why Muon is expensive under FSDP" />

      <P>
        The catch is that computing the polar factor requires seeing the matrix all at once.
        Newton–Schulz iteration, the standard way Muon orthogonalizes, performs repeated
        polynomial transformations of the full momentum matrix; an exact truncated SVD does the
        same. Neither breaks cleanly into pieces.
      </P>

      <P>
        Under fully sharded data parallel training, that is exactly the wrong thing to want.
        FSDP splits each parameter matrix across many devices to fit a large model into accelerator
        memory. The forward and backward pass already needs one all-gather (to assemble the full
        weights for computation) and one reduce-scatter (to send gradients back to their home
        shards). A spectral optimizer then needs an <Em>extra</Em> all-gather and reduce-scatter
        pair just to assemble the momentum matrix for orthogonalization — collectives that scale
        as <Katex tex="O(mn)"/> per matrix.
      </P>

      <P>
        On modern LLM layer shapes — tens of thousands of rows and columns — this extra collective
        is the bottleneck. AdamW does not have this problem because its update is elementwise: it
        can run entirely on a shard. Muon does not have that luxury, and the question is whether
        the spectrum-equalizing geometry can be preserved while sending less data between workers.
      </P>

      {/* ── 5. NEW: Dion as the low-rank shortcut ───────────────────────────── */}
      <SectionHeading number={5} title="Dion: keep the spectral idea, send less" />

      <P>
        Dion's bet is that what Muon really needs is the leading singular subspace of the momentum
        buffer, and that this subspace can be tracked through a rank-<Katex tex="r"/> sketch
        carried from step to step. If you keep a rank-<Katex tex="r"/> factorization warm and
        update it with one step of power iteration each iteration, you can approximate the polar
        factor without ever materializing the full matrix.
      </P>

      <P>
        Concretely, with buffer <Katex tex="M_t = G_t + R_t"/> (gradient plus an error-feedback
        residual <Katex tex="R_t"/>, discussed later), Dion warm-starts from the previous right
        factor <Katex tex="V_{t-1}"/> and computes
      </P>

      <MathBlock tex="U_t \;=\; \operatorname{QR}\bigl(M_t V_{t-1}\bigr), \qquad W_t \;=\; M_t^{\top} U_t." />

      <P>
        At this point <Katex tex="(U_t, W_t)"/> already gives a faithful rank-<Katex tex="r"/> sketch
        of <Katex tex="M_t"/>: <Katex tex="U_t"/> has orthonormal columns and <Katex tex="W_t"/>{' '}
        approximates the relevant right-singular structure. Communication per matrix drops from{' '}
        <Katex tex="O(mn)"/> to <Katex tex="O((m{+}n)r)"/> — workers exchange only the small
        factors. Spectral optimization, FSDP-compatible.
      </P>

      <P>
        To turn this sketch into a step, Dion normalizes the right factor and forms the update{' '}
        <Katex tex="\hat D_t = U_t \bar V_t^\top"/>. Its choice of normalization is the line that
        the rest of this post is about. Dion uses <Strong>column normalization</Strong> — rescale
        each column of <Katex tex="W_t"/> to unit length. Cheap, local, FSDP-friendly. It
        preserves the column span of <Katex tex="W_t"/>, so the algorithm does end up tracking the
        right rank-<Katex tex="r"/> subspace. But preserving the span is not the same as producing
        the rank-<Katex tex="r"/> polar factor, and that gap is where the slowness lives.
      </P>

      <P>
        The conventional reading of Dion's gap with full-rank spectral methods is that the
        low-rank approximation is necessarily lossy: with rank <Katex tex="r"/> you discard{' '}
        <Katex tex="\min(m,n)-r"/> singular directions, so of course you converge more slowly. The
        rest of this post unpacks why that reading is incomplete, and what kind of fix is
        actually called for.
      </P>

      {/* ── 4. The mismatch ───────────────────────────────────────────────── */}
      <SectionHeading number={6} title={"The hidden mismatch: span ≠ polar factor"} />

      <P>
        Write <Katex tex="\bar V_t" /> for the normalized right factor and let{' '}
        <Katex tex="\hat D_t = U_t \bar V_t^\top" /> be Dion's update. Because{' '}
        <Katex tex="U_t" /> has orthonormal columns, the dual norm of the update reduces to a
        property of <Katex tex="\bar V_t" /> alone:
      </P>

      <MathBlock tex="\nu_t \;\equiv\; \|\hat D_t\|_{(r)}^{*} \;=\; \|\bar V_t\|_{\mathrm{op}}." />

      <P>
        When the columns of <Katex tex="\bar V_t" /> have unit length, the Gram matrix{' '}
        <Katex tex="\bar V_t^\top \bar V_t" /> is a correlation matrix: 1s on the diagonal and
        arbitrary correlations off-diagonal. The operator norm of such a matrix can range from{' '}
        <Katex tex="1" /> (orthogonal columns) all the way up to <Katex tex="\sqrt{r}" /> (columns
        all collinear). This gives the central proposition of the paper:
      </P>

      <Pullquote>
        For column-normalized <Katex tex="\bar V_t" />, the dual norm{' '}
        <Katex tex="\nu_t = \|\bar V_t\|_{\mathrm{op}}" /> sits in <Katex tex="[1, \sqrt{r}]" />,
        with equality at <Katex tex="1" /> only when the columns of <Katex tex="W_t" /> are
        already orthogonal.
      </Pullquote>

      <P>
        The descent analysis tells us where <Katex tex="\nu_t" /> shows up. Under non-Euclidean
        smoothness with curvature constant <Katex tex="L_r" /> measured in the rank-<Katex tex="r" />{' '}
        dual norm, one step of any algorithm with update <Katex tex="\hat D_t" /> obeys
      </P>

      <MathBlock tex="f(X_{t+1}) \;\le\; f(X_t)\, -\, \eta\,\|G_t\|_{(r)}\, +\, \eta\bigl(\delta_t + (1{+}\nu_t)\,\|R_t\|_{(r)}\bigr)\, +\, \tfrac{L_r\nu_t^{\,2}}{2}\,\eta^{2}," />

      <P>
        where <Katex tex="\delta_t = \|M_t\|_{(r)} - \langle M_t, \hat D_t\rangle" /> is an oracle
        defect. Two terms depend on <Katex tex="\nu_t" />: the smoothness penalty{' '}
        <Katex tex="L_r\nu_t^2\eta^2/2" />, which scales <Em>quadratically</Em>, and a residual
        coupling <Katex tex="(1{+}\nu_t)\|R_t\|_{(r)}" /> from error feedback. Telescoping and
        optimizing <Katex tex="\eta" /> turns this into a rate:
      </P>

      <MathBlock tex="\min_{t<T}\,\|G_t\|_{(r)} \;\le\; \sqrt{\frac{2(f_0-f_\infty)\,L_r\,\nu^2}{T}}\, +\, O\!\bigl(1/T\bigr), \qquad \nu = \max_t \nu_t." />

      <P>
        For column-normalized Dion, the worst case <Katex tex="\nu = \sqrt{r}" /> gives a rate of{' '}
        <Katex tex="O\!\bigl(\sqrt{L_r r / T}\bigr)" />. For an update with{' '}
        <Katex tex="\nu = 1" /> the rate is <Katex tex="O\!\bigl(\sqrt{L_r / T}\bigr)" />. The gap
        is purely geometric: in the dual-ball picture, the polar factor sits on the boundary; column
        normalization keeps <Katex tex="\|\bar V_t\|_F = \sqrt{r}" /> but allows the operator norm
        to inflate, pushing the update <Em>outside</Em> the dual ball. The Frobenius constraint is
        met; the operator-norm constraint, which is the binding one for rank-<Katex tex="r" />{' '}
        partial isometries, is violated.
      </P>

      {/* ── 5. Orth-Dion ──────────────────────────────────────────────────── */}
      <SectionHeading number={7} title="Orth-Dion: one line, matching geometry" />

      <P>
        The minimal repair is to replace column normalization with QR orthogonalization of the
        right factor. Everything else — the power-iteration step, the warm start, the error-feedback
        buffer, the per-matrix communication pattern — stays identical to Dion. The change touches
        exactly one line of the algorithm.
      </P>

      <AlgorithmBox />

      <GeometryCompare />

      <P>
        With QR, the right factor has orthonormal columns, so{' '}
        <Katex tex="\bar V_t^\top \bar V_t = I_r" />. The update{' '}
        <Katex tex="\hat D_t = U_t \bar V_t^\top" /> is then a rank-<Katex tex="r" /> partial
        isometry: all of its non-zero singular values equal <Katex tex="1" />, the operator-norm
        constraint is saturated exactly, and the Frobenius norm is <Katex tex="\sqrt{r}" /> by
        construction. The update lies exactly on the boundary of the dual ball, matching the
        rank-<Katex tex="r" /> polar factor in geometry if not in identity.
      </P>

      <P>
        Three lemmas pin this down. <Strong>Partial isometry</Strong>: when <Katex tex="U_t" /> and{' '}
        <Katex tex="\bar V_t" /> have orthonormal columns, <Katex tex="\nu_t = 1" />.
        <Strong> Non-negative defect</Strong>: Hölder's inequality gives{' '}
        <Katex tex="\langle M_t, \hat D_t\rangle \le \|M_t\|_{(r)}" />, so <Katex tex="\delta_t \ge 0" />.
        <Strong> Same tracking</Strong>: the column space of <Katex tex="\operatorname{QR}(W_t)" /> and{' '}
        <Katex tex="\operatorname{ColNorm}(W_t)" /> coincide, and the error-feedback update depends
        only on <Katex tex="U_t" />, so the projector recursion that tracks the gradient subspace
        is bit-identical between the two methods.
      </P>

      <P>
        The third lemma is the philosophically important one. It rules out the natural alternative
        explanation — that Dion's gap comes from picking the wrong subspace, and that fixing the
        normalization implicitly improves subspace selection. It does not. <Strong>Both algorithms
        track the same rank-<Katex tex="r" /> subspace with the same error.</Strong> The
        improvement is entirely in how the update is scaled inside that subspace.
      </P>

      {/* ── 6. Mechanism check ───────────────────────────────────────────── */}
      <SectionHeading number={8} title={"Mechanism check: is the inflation actually there?"} />

      <P>
        The <Katex tex="\sqrt{r}" /> bound is worst-case. A reasonable suspicion is that on real
        gradients the bound is loose and <Katex tex="\nu_t" /> stays close to <Katex tex="1" />{' '}
        in practice. To check, we measured{' '}
        <Katex tex="\nu_t = \|\bar V_t\|_{\mathrm{op}}" /> directly for every matrix-shaped layer
        and every logged step during a LLaMA 3 320M pre-training run, sweeping{' '}
        <Katex tex="r \in \{96, 192, 384\}" /> and averaging over three seeds.
      </P>

      <FigureRow
        items={[
          {
            src: '/images/blog/orth-dion/nu_scaling.png',
            alt: 'Layer-mean dual norm versus training step for Dion at three ranks and Orth-Dion.',
            subcaption: '(a) layer-mean ν̄ₜ across training'
          },
          {
            src: '/images/blog/orth-dion/nu_hist.png',
            alt: 'Per-update distribution of dual norm pooled over layer, step, and seed.',
            subcaption: '(b) per-update νₜ, pooled post-warmup'
          },
        ]}
        caption={
          <>
            <Strong>Figure 3.</Strong> The dual-norm mismatch is real, rank-ordered, and persistent.
            <Em> (a)</Em> Layer-mean <Katex tex="\bar\nu_t" /> separates cleanly by rank for Dion
            (peaks roughly <Katex tex="2.1, 2.5, 2.9" />) and stays well above <Katex tex="1" />{' '}
            throughout training; the right axis shows <Katex tex="\bar\nu_t^{\,2}" />, the factor
            through which the dual norm enters the smoothness term. <Em>(b)</Em> Pooling individual
            updates over layer, step, and seed shows the inflation is dispersed rather than driven
            by isolated outliers: at <Katex tex="r = 384" />, about a third of updates carry{' '}
            <Katex tex="\nu_t > 2" />. Orth-Dion (red) collapses to{' '}
            <Katex tex="\nu_t \approx 1" /> in both panels.
          </>
        }
      />

      <P>
        The measured <Katex tex="\nu_t" /> never approaches the worst-case envelope of{' '}
        <Katex tex="\sqrt{r}" />, so the absolute gap in any single run is gentler than the
        worst case would suggest. But the inflation is monotone in <Katex tex="r" />, it persists
        across layers and across training, and it cannot be hyperparameter-tuned away — the
        problem is in the normalization step itself. Orth-Dion's <Katex tex="\nu_t" /> sits at{' '}
        <Katex tex="1" /> everywhere we measured, with the maximum observed value under{' '}
        <Katex tex="1.003" />.
      </P>

      {/* ── 7. Convergence theorem ──────────────────────────────────────── */}
      <SectionHeading number={9} title="Convergence at the polar-factor rate" />

      <P>
        Removing the <Katex tex="\nu_t" /> inflation in the one-step bound and unrolling it would
        almost give the desired rate immediately — except that the residual{' '}
        <Katex tex="R_t" /> from error feedback couples back into the update through the buffer{' '}
        <Katex tex="M_t = G_t + R_t" />. Standard analyses of error feedback handle this by
        assuming a <Strong>bounded buffer drift</Strong>:{' '}
        <Katex tex="\|M_t - M_{t-1}\|_{\mathrm{op}} \le \Delta_{\mathrm{drift}}" /> for some
        constant. The trouble is that the increment <Katex tex="M_t - M_{t-1}" /> already contains
        the residual change <Katex tex="R_t - R_{t-1}" />, and that change is itself{' '}
        <Katex tex="O(\|G_t\|)" /> — not small. The assumption is circular.
      </P>

      <P>
        We replace it with a self-consistent fixed-point argument. The asymmetry that makes this
        possible is that the <Em>gradient</Em> subspace, by smoothness, moves slowly:{' '}
        <Katex tex="\sin\Theta_{\max}(P_G^{t+1}, P_G^{t}) \le L_F\,\eta\sqrt{r}/\Delta_{\mathrm{gap}} = O(\eta)" />.
        The buffer subspace can jump, but it is forced to chase the slowly moving gradient
        subspace. Tracking the tracking error{' '}
        <Katex tex="\varepsilon_t = \sin\Theta_{\max}(P_M^t, P_G^t)" /> and the residual ratio{' '}
        <Katex tex="\mathcal R_t = \|R_t\|_F/\|G_t\|_F" /> jointly, the recursions form a contractive
        map on <Katex tex="[0,1]^2" />; for sufficiently small step sizes Banach's theorem gives a
        unique fixed point with <Katex tex="\varepsilon_\infty, \mathcal R_\infty = O(\eta)" />.
      </P>

      <P>
        The second proof ingredient is an <Strong>amortized contraction</Strong> condition.
        Per-step contraction is too strong: during warmup or sharp landscape transitions, the
        per-step contraction factor <Katex tex="\rho_t" /> can briefly exceed <Katex tex="1" />.
        We instead require that every suffix product
      </P>

      <MathBlock tex="\prod_{i=s}^{t-1} \rho_i \;\le\; C_\rho\,\bar\rho^{\,t-s}" />

      <P>
        decays geometrically up to a constant. Transient growth is tolerated; persistent growth is
        not. This is the Lyapunov-style stability condition natural to subspace tracking, and it
        is what allows the proof to apply to a realistic optimizer rather than to a smoothed
        idealization. Putting these pieces together yields the main theorem.
      </P>

      <Pullquote>
        Under non-Euclidean smoothness with curvature constant <Katex tex="L_r" /> and a
        well-conditioned gradient spectrum, Orth-Dion with step size{' '}
        <Katex tex="\eta = c/\sqrt{T}" /> satisfies{' '}
        <Katex tex="\min_{t<T}\,\|G_t\|_{(r)} \le \sqrt{2(f_0 - f_\infty)L_r / T} + O(1/T)" />.
      </Pullquote>

      <P>
        The leading constant matches exact-SVD Muon, where <Katex tex="\nu = 1" /> by definition,
        and improves on stripped Dion's rate by a factor of <Katex tex="\sqrt{r}" />. The per-step
        cost is <Katex tex="O(mnr) + O(nr^2)" />, identical to Dion up to the small QR term, and
        the per-matrix communication is unchanged at <Katex tex="O((m{+}n)r)" />. We get the
        full-rank spectral rate while paying low-rank distributed costs.
      </P>

      {/* ── 8. Experiments ────────────────────────────────────────────────── */}
      <SectionHeading number={10} title="What the LLM-scale experiments show" />

      <P>
        The theory makes a clean prediction: at any fixed rank, the only thing changing between
        Dion and Orth-Dion is the normalization step on line 4 of the algorithm. The validation
        loss should improve, the measured <Katex tex="\bar\nu_t" /> should drop from above{' '}
        <Katex tex="1" /> to exactly <Katex tex="1" />, and the gap should be monotone in{' '}
        <Katex tex="r" />. We test this on LLaMA 3 320M pretraining on C4 (3.2B tokens,
        Chinchilla-optimal) under FSDP on 8×GH200, sweeping{' '}
        <Katex tex="r \in \{96, 192, 384\}" />.
      </P>

      <FigureRow
        items={[
          {
            src: '/images/blog/orth-dion/val_loss_curves.png',
            alt: 'Validation loss versus training step for Dion, Orth-Dion, and Ada-Orth-Dion at three ranks.',
            subcaption: '(a) C4 validation loss vs. step'
          },
          {
            src: '/images/blog/orth-dion/speedup_bars.png',
            alt: 'Relative wall-clock to match Dion best loss at three ranks for Dion and Orth-Dion.',
            subcaption: '(b) wall-clock to match Dion'
          },
        ]}
        caption={
          <>
            <Strong>Figure 4.</Strong> Training dynamics on LLaMA 3 320M (6,100 steps, 8×GH200 FSDP).
            <Em> (a)</Em> At every rank, Orth-Dion lands at lower validation loss than Dion;
            Ada-Orth-Dion improves further by reducing the working rank toward each layer's
            intrinsic dimensionality. <Em>(b)</Em> Orth-Dion reaches Dion's best loss in roughly{' '}
            <Katex tex="0.88\text{–}0.89\times" /> the wall-clock time across the three ranks, a
            consistent ~12% reduction.
          </>
        }
      />

      <P>
        Three observations match the theory point-for-point. First, <Strong>matched-rank
        improvement</Strong>: Orth-Dion lowers validation loss over Dion at every rank tested, and
        reaches Dion's best loss in 12–13% fewer steps. Second, <Strong>direct mechanism check</Strong>:
        Dion's measured <Katex tex="\bar\nu_t" /> inflates monotonically with rank{' '}
        (<Katex tex="1.20 \to 1.28 \to 1.34" /> from <Katex tex="r=96" /> to{' '}
        <Katex tex="r=384" />), while Orth-Dion has <Katex tex="\bar\nu_t = 1.00" /> at all ranks,
        confirming the partial-isometry lemma in the regime we care about. Third,{' '}
        <Strong>geometry beats subspace expansion</Strong>: at matched rank, Orth-Dion's gain
        cannot come from selecting a better subspace, because the tracking lemma guarantees both
        methods select the same one.
      </P>

      <P>
        Orth-Dion's improvement comes with a small per-step overhead from the QR step. To
        recover Dion-like wall-clock at scale, we pair Orth-Dion with a per-layer adaptive rank
        mechanism — <Strong>Ada-Orth-Dion</Strong> — driven by the contraction condition from the
        proof. The condition factors per layer into a signal term that prefers larger{' '}
        <Katex tex="r" /> and a conditioning term that prefers smaller <Katex tex="r" />, and its
        transition point is what we call the layer's intrinsic dimensionality. An effective-rank
        estimator computed from the existing factors, plus EMA smoothing and rounding to multiples
        of 8 for hardware alignment, tracks this transition online.
      </P>

      <Figure
        src="/images/blog/orth-dion/wallclock_large.png"
        alt="Per-step wall-clock time on LLaMA 3 17.1B for Muon, Dion, Orth-Dion, and Ada-Orth-Dion."
        caption={
          <>
            <Strong>Figure 5.</Strong> Per-step time on a LLaMA 3 17.1B run on 8×A40 with FSDP,
            where bandwidth-bound collectives make the gap between low-rank and full-rank updates
            most visible. Fixed-rank Orth-Dion is slightly slower than Dion because of the QR step.
            Ada-Orth-Dion (pinned at the steady-state rank reached on the 320M model,{' '}
            <Katex tex="r_f \approx 0.93" />) closes the gap and matches Dion's per-step time,
            while inheriting Orth-Dion's lower validation loss.
          </>
        }
        width="560px"
      />

      <P>
        Reading the two halves together: Orth-Dion converts Dion's <Katex tex="\sqrt{r}" />{' '}
        geometric penalty into a strictly better convergence–communication trade-off, and
        Ada-Orth-Dion makes that trade-off competitive on wall-clock without sacrificing the
        improvement.
      </P>

      {/* ── 9. Takeaway ───────────────────────────────────────────────────── */}
      <SectionHeading number={11} title="Where the gap was, and what was hiding it" />

      <P>
        The gap between low-rank spectral methods and their full-rank counterparts is often
        treated as the price of compression — the cost of working with less information. The
        argument we walked through says something more specific. Dion's low-rank approximation is
        not the problem; in fact, both algorithms select the same low-rank subspace with the same
        error. The problem is the geometric handle used to turn that subspace into a step. Column
        normalization keeps the right span but inflates the dual norm, and the analysis charges
        the optimizer for it through the curvature constant <Katex tex="L_r" /> and the
        error-feedback coupling.
      </P>

      <P>
        Replacing one normalization line with QR forces the update to be a rank-<Katex tex="r" />{' '}
        partial isometry, restores <Katex tex="\nu_t = 1" />, and removes a <Katex tex="\sqrt{r}" />{' '}
        factor from the leading constant. The proof techniques — self-consistent residual control
        and amortized contraction — are not separate stories; they are what makes the geometric
        statement provable without circular assumptions on the buffer drift.
      </P>

      <Pullquote>
        The takeaway is geometric and stubborn. Once you constrain updates to rank{' '}
        <Katex tex="r" />, the relevant unit ball is the Ky Fan dual ball; column normalization
        does not land on it, and QR does. Everything else — the rate, the wall-clock — follows
        from that single observation.
      </Pullquote>

      {/* ── Acknowledgments ──────────────────────────────────────────────── */}
      <SectionHeading number={12} title="Acknowledgments" />

      <P>
        This work was carried out on the Supermicro ARS-111GL-DNHR-LCC and FUJITSU PRIMERGY
        CX2550 M7 (Miyabi) systems at the Joint Center for Advanced High-Performance Computing
        (JCAHPC), with additional compute provided by the Mila and Compute Canada clusters. We
        thank the Masason Foundation for supporting this work through computational resources
        and a collaborative research environment.
      </P>

      {/* ── Reference ─────────────────────────────────────────────────────── */}
      <hr style={{ border: 0, borderTop: '1px solid #d8d3c8', margin: '3rem 0 1.5rem' }} />
      <div style={{ marginTop: '1.5rem' }}>
        <p style={{ color: '#9c9483', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Reference
        </p>
        <p style={{ color: '#2a2a2a', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
          Tatsuhiro Nakamori, Laura Gomezjurado Gonzalez, Ganesh Talluri, Ansh Tiwari,
          Hideyuki Kawashima, Ioannis Mitliagkas, Guillaume Rabusseau, and Hiroki Naganuma.{' '}
          <em>Orth-Dion: Eliminating Geometric Mismatch in Distributed Low-Rank Spectral
          Optimization.</em> Preprint, 2026.
        </p>
        <div style={{
          marginTop: '1.25rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          color: '#3a3a3a',
          background: '#fdfbf6',
          border: '1px solid #e3dccc',
          borderRadius: '4px',
          padding: '1rem 1.1rem',
          whiteSpace: 'pre',
          overflowX: 'auto',
          lineHeight: 1.55
        }}>{`@article{nakamori2026orthdion,
  title   = {Orth-Dion: Eliminating Geometric Mismatch in
             Distributed Low-Rank Spectral Optimization},
  author  = {Nakamori, Tatsuhiro and Gomezjurado Gonzalez, Laura
             and Talluri, Ganesh and Tiwari, Ansh
             and Kawashima, Hideyuki and Mitliagkas, Ioannis
             and Rabusseau, Guillaume and Naganuma, Hiroki},
  year    = {2026},
  note    = {Preprint}
}`}</div>
      </div>
    </div>
  )
}
