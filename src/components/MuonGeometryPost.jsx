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

// ─── Side figure ──────────────────────────────────────────────────────────────
// Floats to the right of the prose, into the reserved 360px gutter defined
// by .lead-prose-inner in index.css. Captions render below the image.
function Figure({ src, alt, caption }) {
  return (
    <figure className="side">
      <img src={src} alt={alt || ''} loading="lazy" />
      {caption && (
        <figcaption style={{
          fontSize: '0.78rem',
          color: '#5b5b5b',
          fontStyle: 'italic',
          lineHeight: 1.55,
          marginTop: '0.6rem',
          textAlign: 'left',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─── Full-width figure ────────────────────────────────────────────────────────
// For figures that genuinely need the full reading width (e.g., wide 2-panel
// composites with axis labels that would be unreadable at 320px).
function WideFigure({ src, alt, caption }) {
  return (
    <figure style={{ margin: '2.25rem 0', clear: 'both' }}>
      <img src={src} alt={alt || ''} loading="lazy"
           style={{ width: '100%', display: 'block', borderRadius: '2px' }} />
      {caption && (
        <figcaption style={{
          fontSize: '0.82rem',
          color: '#5b5b5b',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginTop: '0.8rem',
          textAlign: 'left',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─── Algorithm box (G-Scion) ─────────────────────────────────────────────────
const ALG_MONO = "'JetBrains Mono', ui-monospace, monospace"

function AlgLine({ n, code, note, highlight }) {
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

function GScionAlgorithm() {
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
        Algorithm — G-Scion (one-way per-layer switching)
      </div>
      <AlgLine n="0" code="initialize geometry g_ℓ ∈ {Sign, Spec} for each ℓ ∈ L_elig" note="embed and lm_head are eligible; hidden layers always spec" />
      <AlgLine n="1" code="for training step t = 1, 2, …" />
      <AlgLine n="2" code="  take an update under current g_ℓ" />
      <AlgLine n="3" code="  if t mod N == 0:" note="decision cadence (N = 50 for LM, 100 for ViT/VLM)" />
      <AlgLine n="4" code="    for each ℓ ∈ L_elig not yet locked:" />
      <AlgLine n="5" code='      Ĝ ← mean of K minibatch gradients   (K = 12)' />
      <AlgLine n="6" code="      compute log R̂_∞,ℓ" highlight />
      <AlgLine n="7" code="      if (g_ℓ = Sign ∧ log R̂ > τ) ∨ (g_ℓ = Spec ∧ log R̂ < −τ):" note="τ = 0 across all settings" />
      <AlgLine n="8" code="        flip g_ℓ;  lock ℓ" note="one-way: cannot unflip" />
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        color: '#9c9483',
        marginTop: '0.6rem',
        lineHeight: 1.55
      }}>
        With K = 12 and |L_elig| = 2, the diagnostic adds ≲ 4% wall-clock overhead over pure Muon.
      </div>
    </div>
  )
}

// ─── Side-by-side comparison: sign vs spectral on one matrix ─────────────────
function GeometryDuel() {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      margin: '2rem 0',
    }}>
      <div style={{
        flex: 1,
        minWidth: 260,
        border: '1px solid #d4cebf',
        borderTop: '2px solid #1a1a1a',
        borderRadius: '6px',
        padding: '1.05rem 1.15rem',
        background: '#fdfcf9',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#1a1a1a',
          marginBottom: '0.55rem',
          fontWeight: 600,
        }}>
          Sign step
        </div>
        <div style={{ marginBottom: '0.6rem' }}>
          <Katex tex="D_{\mathrm{sign}} \;=\; \mathrm{sign}(G)" display />
        </div>
        <div style={{ fontSize: '0.88rem', color: '#3a3a3a', lineHeight: 1.65 }}>
          Argmax of <Katex tex="\langle G,D\rangle"/> over the entrywise{' '}
          <Katex tex="\ell_\infty"/> ball. Cheap. Adam and SignSGD live here.
          Bound on the expected loss decrease scales with{' '}
          <Katex tex="\|G\|_1^2 / L_\infty"/>.
        </div>
      </div>
      <div style={{
        flex: 1,
        minWidth: 260,
        border: '1px solid #d4cebf',
        borderTop: '2px solid #b8531f',
        borderRadius: '6px',
        padding: '1.05rem 1.15rem',
        background: '#fdfcf9',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#b8531f',
          marginBottom: '0.55rem',
          fontWeight: 600,
        }}>
          Spectral step
        </div>
        <div style={{ marginBottom: '0.6rem' }}>
          <Katex tex="D_{\mathrm{spec}} \;=\; U V^\top" display />
        </div>
        <div style={{ fontSize: '0.88rem', color: '#3a3a3a', lineHeight: 1.65 }}>
          Argmax of <Katex tex="\langle G,D\rangle"/> over the operator-norm ball.
          The polar factor of <Katex tex="G = U\Sigma V^\top"/>. Muon lives here.
          Bound scales with <Katex tex="\|G\|_*^2 / L_{\mathrm{op}}"/>.
        </div>
      </div>
    </div>
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
const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
     style={{ color: '#5b3a8a', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
    {children}
  </a>
)

// ─── MAIN POST COMPONENT ──────────────────────────────────────────────────────
export default function MuonGeometryPost() {
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      margin: '0 auto',
      color: '#1a1a1a'
    }}>
      {/* ── 1. Motivation ─────────────────────────────────────────────────── */}
      <SectionHeading number={1} title="The frozen guess inside every mixed-optimizer recipe" />

      <P>
        Modern training recipes for large neural networks mix optimizers across the model. Almost
        every published transformer recipe applies a sign-based update (AdamW, or SignSGD) to the
        embedding and output projection, and a spectral update (Muon, the orthogonalize-the-momentum
        method behind several recent speedrun records) to the hidden layers. The recipes work, and
        nobody re-justifies them when porting a 7B-parameter convention to a vision transformer or
        a multimodal model. The "embedding-like" and "hidden-like" labels just travel.
      </P>

      <P>
        Read literally, each recipe is a guess. It declares, layer by layer, which geometry will
        produce a larger loss decrease per step. When the guess is right the recipe wins; when it
        is wrong, practitioners run sweeps until something else wins, then crystallize the new
        guess. Optimization theory has not had much to say about whether that guess is the right
        one to make, or how to read it off the model directly.
      </P>

      <P>
        The work this post walks through proposes a single measurable scalar that decides, at every
        layer, which geometry the descent lemma actually prefers. Computing it is a small
        Hessian–vector calculation. Following it — flipping each layer to the geometry the scalar
        names — replaces inherited recipes with a per-layer decision rule that adapts to scale,
        architecture, and training stage. The same threshold beats a hand-tuned baseline at every
        scale and architecture tested, including a vision-language head where the metric flags an
        architectural reversal that the LM convention gets wrong.
      </P>

      <Pullquote>
        Mixed-optimizer training is not a heuristic art. It is a measurable property of one
        scalar per layer, and the right recipe is the one that scalar prescribes.
      </Pullquote>

      {/* ── 2. Warm-up: the two geometries at a single layer ──────────────── */}
      <SectionHeading number={2} title={"A single layer, two geometries, one duel"} />

      <P>
        Strip the network down to one weight matrix <Katex tex="W \in \mathbb{R}^{m\times n}"/> with
        gradient <Katex tex="G = \nabla f(W)"/>. A first-order optimizer wants to choose an
        update direction <Katex tex="D"/> that maximizes the gradient's inner product against{' '}
        <Katex tex="D"/> while keeping <Katex tex="D"/> small in some norm. Different norms give
        different optimizers, and three of them dominate practice.
      </P>

      <P>
        Plain SGD uses the Frobenius norm; the direction is <Katex tex="G/\|G\|_F"/>. SignSGD —
        and, in spirit, Adam — measure size entrywise: the direction is{' '}
        <Katex tex="\mathrm{sign}(G)"/>, every entry pushed to <Katex tex="\pm 1"/> independently.
        Spectral SGD (Muon) measures size in the operator norm: the direction is the polar factor{' '}
        <Katex tex="U V^\top"/> of <Katex tex="G = U \Sigma V^\top"/>, the closest orthogonal
        matrix to <Katex tex="G"/>. Two of these — sign and spectral — are the geometries that
        modern mixed recipes actually compose.
      </P>

      <GeometryDuel />

      <P>
        The descent lemma turns each geometry into a quantitative bound on the expected one-step
        loss decrease. For a stochastic gradient <Katex tex="\widehat G = G + E"/> at batch size{' '}
        <Katex tex="B"/>, the sign-based update obeys
      </P>

      <MathBlock tex="\Delta_{\mathrm{sign}}(W) \;\ge\; \tfrac{(\,\|G\|_1 - 2c_1/\sqrt{B}\,)_+^{\,2}}{2\, L_\infty}," />

      <P>
        and the spectral update obeys the matching bound
      </P>

      <MathBlock tex="\Delta_{\mathrm{spec}}(W) \;\ge\; \tfrac{(\,\|G\|_* - 2c_*/\sqrt{B}\,)_+^{\,2}}{2\, L_{\mathrm{op}}}," />

      <P>
        where <Katex tex="\|\cdot\|_1"/> and <Katex tex="\|\cdot\|_*"/> are the entrywise and
        nuclear norms (the duals of the geometries the two methods are stepping in), the{' '}
        <Katex tex="c_1, c_*"/> are noise scales, and <Katex tex="L_\infty, L_{\mathrm{op}}"/> are
        the smoothness constants of the loss in those same norms. Two lower bounds on the same
        quantity — the loss decrease at this layer — derived under the same construction. The only
        natural question is: which one is larger?
      </P>

      {/* ── 3. The one-step improvement ratio ─────────────────────────────── */}
      <SectionHeading number={3} title="The one-step improvement ratio" />

      <P>
        Taking the ratio of those two bounds yields a single scalar per layer:
      </P>

      <MathBlock tex="\mathcal{R}_{\mathrm{exact}}(W;\,B) \;:=\; \frac{\Delta_{\mathrm{spec}}(W)}{\Delta_{\mathrm{sign}}(W)} \;=\; \underbrace{\Bigl(\tfrac{\|G\|_* - 2c_*/\sqrt{B}}{\|G\|_1 - 2c_1/\sqrt{B}}\Bigr)^{\!2}}_{\text{signal efficiency}} \;\cdot\; \underbrace{\tfrac{L_\infty}{L_{\mathrm{op}}}}_{\kappa \;(\text{curvature ratio})}." />

      <P>
        The decision rule is now mechanical. If <Katex tex="\mathcal{R} > 1"/>, the spectral step
        has a larger predicted decrease; pick Muon. If <Katex tex="\mathcal{R} < 1"/>, the sign
        step wins; pick SignSGD or Adam. There is no fitting, no sweep — just a scalar and an
        inequality.
      </P>

      <P>
        What makes <Katex tex="\mathcal R"/> useful as a diagnostic, not just an algorithmic
        criterion, is its factorization. The two factors are controlled by different things and
        move under different interventions. The <Strong>signal-efficiency</Strong> factor depends
        only on the current gradient and the batch size — it is a property of the state. The{' '}
        <Strong>curvature ratio</Strong> <Katex tex="\kappa = L_\infty/L_{\mathrm{op}}"/> depends
        on the architecture and the weights — it is a property of the configuration. Two layers
        with similar gradients can prefer different geometries because their <Katex tex="\kappa"/>{' '}
        differs; the same layer can swap its preference across scale or training stage because its
        signal-efficiency factor changes.
      </P>

      <P>
        Three named approximations of <Katex tex="\mathcal R"/> populate the paper. The
        finite-batch form <Katex tex="\mathcal R_{\mathrm{exact}}"/> above is ideal but expensive
        to estimate; the high-SNR limit <Katex tex="\mathcal R_\infty"/> drops the noise
        corrections under the condition <Katex tex="\|G\|_* \gg c_*/\sqrt{B}"/> (which holds after
        a brief warmup in every regime the paper looks at); and a curvature-free proxy{' '}
        <Katex tex="\mathcal R_0"/> further drops <Katex tex="\kappa"/> — useful only when the
        comparison is between layers with the same activation and similar Hessian structure. The
        proxy <Katex tex="\mathcal R_0"/> turns out to be wrong at the LM output head, which is
        the failure mode that the activation-dependence prediction predicts.
      </P>

      {/* ── 4. What the factorization predicts ────────────────────────────── */}
      <SectionHeading number={4} title={"Three things the factorization predicts"} />

      <P>
        Because the two factors of <Katex tex="\mathcal R"/> respond to different things, the
        decision rule produces three sharp predictions that any candidate recipe must explain.
      </P>

      <P>
        <Strong>P1 — Layer dependence.</Strong> Hidden layers see gradients with broad nuclear
        rank and a curvature ratio bounded below by the inverse stable rank of the post-activation
        matrix. Both effects pull <Katex tex="\mathcal R"/> well above 1. Embedding and output
        projection layers see structurally narrower gradients and have different curvature, and
        their <Katex tex="\mathcal R"/> can sit on either side of 1. The standard
        sign-on-embed/head + spectral-on-hidden mix is one frozen guess at this layer-by-layer
        sign pattern.
      </P>

      <P>
        <Strong>P2 — Stage and scale dependence.</Strong> Signal efficiency drifts during training
        and depends on scale. A layer that is sign-preferred at 31M parameters can become
        spectral-preferred at 1B as the gradient structure changes. A static recipe cannot
        track this. The decision rule does, automatically.
      </P>

      <P>
        <Strong>P3 — Architecture dependence.</Strong> The curvature ratio <Katex tex="\kappa"/>{' '}
        is bounded below by <Katex tex="1/\mathrm{srank}(A_{\ell-1})"/>, the inverse stable rank
        of the activation feeding layer <Katex tex="\ell"/>, which in turn is bounded by an
        activation-specific noise-to-signal ratio <Katex tex="s_\sigma"/>. ReLU, GELU, and SiLU
        all sit in a regime that lifts <Katex tex="\kappa"/> and amplifies the spectral side.
        Changing the architecture upstream of a layer — for example by feeding the LM head from a
        vision encoder rather than a token embedding — changes which side <Katex tex="\mathcal R"/>{' '}
        lands on, and can reverse the preferred geometry.
      </P>

      {/* ── 5. G-Scion: the minimal decoder ───────────────────────────────── */}
      <SectionHeading number={5} title="G-Scion: read the metric, follow it" />

      <P>
        G-Scion is not a new optimizer. It is the smallest algorithm consistent with the
        statement that <Katex tex="\mathcal R"/> is the right scalar to act on. The plug-in
        estimator uses one Hessian–vector product per candidate direction at each decision step:
      </P>

      <MathBlock tex="\widehat{\mathcal R}(W) \;:=\; \frac{\langle \widehat G,\, D_{\mathrm{spec}}\rangle^{\,2} \,/\, C(D_{\mathrm{spec}})}{\langle \widehat G,\, D_{\mathrm{sign}}\rangle^{\,2} \,/\, C(D_{\mathrm{sign}})}, \qquad C(D) \;=\; \langle D,\, \nabla^2 f(W)[D]\rangle." />

      <P>
        Under the high-SNR condition that holds across the paper's runs after roughly 100 warmup
        steps, the expectation of this estimator converges to <Katex tex="\mathcal R_\infty"/> as
        the gradient-averaging count <Katex tex="K"/> grows.
      </P>

      <GScionAlgorithm />

      <P>
        Two engineering choices keep this honest. First, <Strong>the threshold is zero</Strong> —{' '}
        <Katex tex="\tau = 0"/> on <Katex tex="\log\widehat{\mathcal R}"/>, the natural break-even
        — and it is the same across every model, scale, and dataset. There is no per-setting
        tuning that could let the gate quietly absorb hand-engineering. Second, switching is{' '}
        <Strong>one-way and locked</Strong>: each eligible layer can flip its geometry the first
        time the sign of <Katex tex="\log\widehat{\mathcal R}"/> crosses zero in the relevant
        direction, and then stays there. This avoids noise-driven oscillation, at the cost of not
        being able to undo late-stage reversals (the paper flags this as a real limitation; the
        bidirectional extension is left for follow-up work).
      </P>

      <P>
        Hidden layers are not in the eligible set. <Strong>P1</Strong> predicts{' '}
        <Katex tex="\mathcal R \gg 1"/> there and the experiments confirm this without exception,
        so hidden layers always run in spectral mode. The gate sees only the embedding and the
        output projection — the two layers where the sign of <Katex tex="\log\widehat{\mathcal R}"/>{' '}
        can plausibly differ from the static recipe.
      </P>

      {/* ── 6. What the metric says on real models ────────────────────────── */}
      <SectionHeading number={6} title={"What the metric says on real models"} />

      <P>
        Three settings are enough to exercise the three predictions and show that the gate's
        decisions track real validation-loss outcomes. The threshold is the same{' '}
        <Katex tex="\tau = 0"/> in every cell.
      </P>

      <P>
        <Strong>GPT-2 at 31M parameters — P1 confirmed, output sign-preferred.</Strong> On
        OpenWebText, the embedding's <Katex tex="\log\widehat{\mathcal R}"/> sits firmly above
        zero across training, and the embed-side gate locks to spectral at the first decision
        step. The output projection runs the other way: <Katex tex="\log\widehat{\mathcal R}"/>{' '}
        averages around <Katex tex="-0.33"/> across three activation choices and the output-side
        gate flips to sign at step 150. This is exactly the Scion convention — sign on head,
        spectral on hidden — and at 31M the metric agrees with it.
      </P>

      <Figure
        src="/images/blog/muon-geometry/lm_logA_gpt2.png"
        alt="Per-layer log R-hat trajectories for embedding and output projection on GPT-2 31M, OpenWebText."
        caption={
          <>
            <Strong>Figure 1.</Strong> Per-layer <Katex tex="\log\widehat{\mathcal R}"/> trajectories on
            GPT-2 31M (OWT, 2k steps; mean ± std across three activation choices per method).{' '}
            <Em>Left:</Em> the embedding sits at <Katex tex="\log\widehat{\mathcal R} > 0"/> from
            the first decision step; the embed-side gate locks to spectral at <Katex tex="t=100"/>.{' '}
            <Em>Right:</Em> the output projection starts at <Katex tex="\log\widehat{\mathcal R}\approx -1.4"/>{' '}
            during the spectral phase; the output-side gate fires at <Katex tex="t=150"/> (dashed
            line) and the layer stays sign-preferred for the rest of training.
          </>
        }
      />

      <P>
        <Strong>GPT-2 at 1B parameters — P2 confirmed, the head flips with scale.</Strong> The
        same gate, same threshold, same architecture family, different scale. Now the embedding{' '}
        <Em>and</Em> the output projection both have <Katex tex="\log\widehat{\mathcal R} \gg 1"/>{' '}
        throughout training. Scion's hand-coded sign-on-head assumption is no longer correct;
        G-Scion catches this and locks both layers to spectral. At every scale tested between 31M
        and 1B, the gate beats matched Scion in final validation loss — by 0.355 nats at 31M in
        the memoryless comparison that the bound is strict about, and by smaller margins at the
        larger scales where momentum (outside the bound) is also at play.
      </P>

      <Figure
        src="/images/blog/muon-geometry/lm_composite_1b.png"
        alt="GPT-2 1B headline: validation loss and embedding R-hat for G-Scion variants vs fixed Scion."
        caption={
          <>
            <Strong>Figure 2.</Strong> GPT-2 1B on OpenWebText (mean of 2 seeds, shaded band ± 1 std).
            <Em> Left:</Em> validation loss; all three G-Scion variants improve on fixed Scion.{' '}
            <Em>Right:</Em> the embedding's <Katex tex="\widehat{\mathcal R}_\infty"/> sits around
            60 throughout training — well above the break-even of 1 — across every method. At 1B
            the metric reveals that <Em>both</Em> embedding and head prefer spectral; the gate
            keeps them there.
          </>
        }
      />

      <WideFigure
        src="/images/blog/muon-geometry/scale_sweep.png"
        alt="Scale sweep: G-Scion vs Scion validation loss at 163M, 406M, and 1B."
        caption={
          <>
            <Strong>Figure 3.</Strong> Scale sweep on OpenWebText (2k steps). At every scale the
            same gate, with the same threshold <Katex tex="\tau = 0"/>, lands at lower validation
            loss than fixed Scion. The optimal recipe itself is scale-dependent — sign-on-head at
            31M, spectral-on-both at 1B — and the gate discovers each without any scale-dependent
            information.
          </>
        }
      />

      <P>
        <Strong>nanoVLM — P3 confirmed, the head reverses with architecture.</Strong> The cleanest
        of the three. Fine-tune a 135M-parameter vision-language model (nanoVLM, with SigLIP2-base
        as the vision encoder and SmolLM2-135M as the language tower) on the Cauldron's TQA
        subset. The (tied) embedding/head plateaus at <Katex tex="\log\widehat{\mathcal R}\approx 5.6"/>{' '}
        for the entire run — several units above every hidden component, and several units{' '}
        <Em>above</Em> rather than below the values seen at the GPT-2 head. Same gate, same
        threshold, but now the metric says the head wants spectral. Scion's LM convention is
        misaligned in this setting; G-Scion lets the head stay in spectral mode and improves
        validation loss by 0.016 and SciQA accuracy by 1.1 percentage points.
      </P>

      <Figure
        src="/images/blog/muon-geometry/vlm_logRhat.png"
        alt="nanoVLM per-component log R-hat: LM head plateaus around 5.6, far above the break-even."
        caption={
          <>
            <Strong>Figure 4.</Strong> Per-component <Katex tex="\log\widehat{\mathcal R}_\infty"/> on
            nanoVLM (Cauldron, 135M, 3.5k steps; mean ± std, 2 seeds). The (tied) LM head/embedding
            sits at <Katex tex="\log\widehat{\mathcal R}\approx 5.6"/> throughout training, several
            units above every hidden component and several units <Em>above</Em> rather than below
            the GPT-2 head value of <Katex tex="-0.33"/>. The architectural reversal is concentrated
            at exactly the layer where the multimodal gradient meets the language tower.
          </>
        }
      />

      <P>
        A separate from-scratch ViT-B/16 run on CIFAR-100 shows the same picture from the vision
        side: <Katex tex="\widehat{\mathcal R}"/> at the output projection settles around 3,
        firmly above 1; gating to spectral lowers validation loss and lifts top-1 accuracy.
      </P>

      <Figure
        src="/images/blog/muon-geometry/vit_val_curves.png"
        alt="ViT-B/16 CIFAR-100 validation curves: G-Scion variants improve on Scion baseline."
        caption={
          <>
            <Strong>Figure 5.</Strong> ViT-B/16 trained from scratch on CIFAR-100 (1k steps; gate
            enabled at <Katex tex="t=100"/>). Both validation loss and validation accuracy improve
            under the gated variants relative to fixed Scion. The gain compounds over training as
            each eligible layer locks into the geometry <Katex tex="\widehat{\mathcal R}"/>{' '}
            prescribes.
          </>
        }
      />

      {/* ── 7. Takeaway ───────────────────────────────────────────────────── */}
      <SectionHeading number={7} title="The scalar replaces the recipe" />

      <P>
        The point of the paper is not that any one of these improvements is large in absolute
        terms — they range from a fraction of a nat to a third of a nat depending on scale and
        momentum regime. The point is that they all come from <Em>the same</Em> mechanism, applied
        identically across scale, architecture, and modality. There is no per-setting threshold,
        no per-model tuning, no learned gate. One scalar per layer, one comparison against zero,
        one flip. Where the standard recipe coincides with what <Katex tex="\log\widehat{\mathcal R}"/>{' '}
        says (GPT-2 31M, sign-on-head), the gate reproduces it. Where the recipe disagrees with
        the metric (GPT-2 1B with both layers spectral, the nanoVLM head reversal), the gate
        catches it and the recipe loses validation loss for the trouble.
      </P>

      <Pullquote>
        Read through this lens, every mixed-optimizer recipe is a frozen guess about the sign of{' '}
        <Katex tex="\log\mathcal R"/> at each layer. The right recipe within the sign-vs-spectral
        comparison is the one <Katex tex="\mathcal R"/> analytically prescribes — and that recipe
        is not fixed across scale, architecture, or training stage.
      </Pullquote>

      <P>
        The story leaves clean room for future work. The one-step bound that <Katex tex="\mathcal R"/>{' '}
        is derived from does not cover momentum or per-parameter adaptivity, so AdamW-based
        recipes sit outside the like-for-like comparison and are reported as upper-bound
        comparators rather than direct baselines; extending the analysis to multi-step bounds is
        open. The one-way lock cannot reverse a layer mid-training, which is exactly the late-stage
        failure mode seen at the GPT-2 output head at high learning rates. And{' '}
        <Strong>P3</Strong>, the architecture dependence, is supported by the VLM head reversal
        but not yet by a controlled activation-only ablation that isolates <Katex tex="\kappa"/>{' '}
        from gradient-structure effects.
      </P>

      <P>
        What does seem settled is the methodological point. Mixed-optimizer training has been a
        catalog of recipes for the better part of a decade. The catalog can be replaced by a
        single sign comparison, evaluated layer by layer, with the same threshold everywhere.
      </P>

      {/* ── 8. Acknowledgments ────────────────────────────────────────────── */}
      <SectionHeading number={8} title="Acknowledgments" />

      <P>
        Compute was provided by Mila and Compute Canada.
      </P>

      {/* ── Reference ─────────────────────────────────────────────────────── */}
      <hr style={{ border: 0, borderTop: '1px solid #d8d3c8', margin: '3rem 0 1.5rem' }} />
      <div style={{ marginTop: '1.5rem' }}>
        <p style={{ color: '#9c9483', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Reference
        </p>
        <p style={{ color: '#2a2a2a', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
          Hiroki Naganuma, Laura Gomezjurado, Mahdi Ghaznavi, Atsushi Nitanda, Seng Pei Liew,
          Ryuichiro Hataya, and Ioannis Mitliagkas.{' '}
          <em>Which Geometry on Which Layer? A Principled Criterion for Mixed-Optimizer Training.</em>{' '}
          Preprint, 2026.
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
        }}>{`@article{naganuma2026whichgeometry,
  title   = {Which Geometry on Which Layer? A Principled
             Criterion for Mixed-Optimizer Training},
  author  = {Naganuma, Hiroki and Gomezjurado, Laura
             and Ghaznavi, Mahdi and Nitanda, Atsushi
             and Liew, Seng Pei and Hataya, Ryuichiro
             and Mitliagkas, Ioannis},
  year    = {2026},
  note    = {Preprint}
}`}</div>
      </div>

    </div>
  )
}
