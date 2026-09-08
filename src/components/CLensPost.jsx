import { useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import katex from 'katex'

// ─── Palette ─────────────────────────────────────────────────────────────────
// This post's pigment is madder — the site token closest to the magenta the
// figures are already drawn in, so the page and the plots read as one hand.
const INK = '#1a1a1a'
const BODY = '#2a2a2a'
const MUTED = '#5b5b5b'
const QUIET = '#9c9483'
const RULE = '#d8d3c8'
const CARD_LINE = '#e3dccc'
const CARD_BG = '#fdfbf6'
const ACCENT = '#94566a'          // madder
const ACCENT_TINT = '#f7eef2'
const LINK = '#5b3a8a'
const MONO = "'JetBrains Mono', ui-monospace, monospace"

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
// The hero already closes on a rule, so §01 draws none of its own: two hairlines
// separated by whitespace read as an accident rather than as a division.
function SectionHeading({ number, title }) {
  return (
    <div className="narrow-block" style={{ marginTop: number === 1 ? '1rem' : '3.5rem', marginBottom: '1.25rem' }}>
      {number > 1 && <hr style={{ border: 0, borderTop: `1px solid ${RULE}`, marginBottom: '1.5rem' }} />}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
        <span style={{ fontFamily: MONO, fontSize: '0.78rem', color: QUIET, letterSpacing: '0.1em' }}>
          §{number.toString().padStart(2, '0')}
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, color: INK, letterSpacing: '-0.005em', lineHeight: 1.3, margin: 0 }}>
          {title}
        </h2>
      </div>
    </div>
  )
}

// ─── Sub-heading (the post's H3 level) ───────────────────────────────────────
// No rule and no number: it has to sit clearly *under* a SectionHeading, so it
// borrows the mono kicker's letter-spacing rather than the h2's weight.
function SubHeading({ children }) {
  return (
    <h3 className="narrow-block" style={{
      marginTop: '2.75rem',
      marginBottom: '1.1rem',
      fontSize: '0.82rem',
      fontFamily: MONO,
      fontWeight: 500,
      letterSpacing: '0.13em',
      textTransform: 'uppercase',
      color: ACCENT,
    }}>
      {children}
    </h3>
  )
}

// ─── Prose helpers ────────────────────────────────────────────────────────────
const P = ({ children }) => (
  <p className="narrow-block" style={{ color: BODY, lineHeight: 1.72, fontSize: '1.02rem', marginBottom: '1.1rem', fontWeight: 400 }}>
    {children}
  </p>
)
const Em = ({ children }) => <em style={{ fontStyle: 'italic', color: BODY }}>{children}</em>
const Strong = ({ children }) => <strong style={{ color: INK, fontWeight: 600 }}>{children}</strong>
// The lead sentence of a caption: roman inside the italic caption body.
const FigTitle = ({ children }) => (
  <strong style={{ color: INK, fontWeight: 600, fontStyle: 'normal' }}>{children}</strong>
)
const InlineCode = ({ children }) => (
  <code style={{
    background: '#f1ede4', color: LINK, padding: '0.1em 0.35em', borderRadius: '3px',
    fontSize: '0.9em', fontFamily: MONO,
  }}>{children}</code>
)
const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
     style={{ color: LINK, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
    {children}
  </a>
)

// A bracketed reference marker. Small, quiet, and it does not break the line.
const Ref = ({ n }) => (
  <a href={`#c-lens-ref-${n}`} style={{
    fontFamily: MONO, fontSize: '0.76em', color: QUIET,
    textDecoration: 'none', verticalAlign: '0.15em', letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
  }}>[{n}]</a>
)

// ─── Lists ────────────────────────────────────────────────────────────────────
// Markers are drawn as an em-dash in the accent rather than a disc bullet, so a
// list reads as a continuation of the prose rather than as UI.
const Ul = ({ children }) => (
  <ul className="narrow-block" style={{ listStyle: 'none', margin: '0 auto 1.35rem', padding: 0 }}>
    {children}
  </ul>
)
const Li = ({ children }) => (
  <li style={{
    position: 'relative',
    paddingLeft: '1.5rem',
    color: BODY,
    fontSize: '1.0rem',
    lineHeight: 1.7,
    marginBottom: '0.6rem',
  }}>
    <span aria-hidden="true" style={{
      position: 'absolute', left: 0, top: '0.85em',
      width: '0.62rem', height: 0, borderTop: `1px solid ${ACCENT}`,
    }} />
    {children}
  </li>
)

// ─── Math ─────────────────────────────────────────────────────────────────────
function MathBlock({ tex }) {
  return (
    <div className="narrow-block" style={{
      margin: '1.5rem auto', padding: '0.5rem 0', overflowX: 'auto', textAlign: 'center',
    }}>
      <Katex tex={tex} display />
    </div>
  )
}

// A multi-line derivation, set on its own tinted leaf so the eye reads it as one
// object rather than as three stacked equations.
function MathPanel({ tex, label }) {
  return (
    <div className="narrow-block" style={{
      margin: '1.75rem auto',
      border: `1px solid ${CARD_LINE}`,
      borderLeft: `2px solid ${ACCENT}`,
      borderRadius: '6px',
      background: CARD_BG,
      padding: label ? '0.85rem 1.25rem 1.15rem' : '1.15rem 1.25rem',
    }}>
      {label && (
        <div style={{
          fontFamily: MONO, fontSize: '0.7rem', color: QUIET,
          letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: '0.75rem',
        }}>{label}</div>
      )}
      <div className="math-panel" style={{ overflowX: 'auto', textAlign: 'center' }}>
        <Katex tex={tex} display />
      </div>
    </div>
  )
}

// ─── Figures ──────────────────────────────────────────────────────────────────
// Every figure in this post is a wide multi-panel plot, so none of them survive
// a 300px column. They break out of the 640px text measure instead: `wide`
// figures take the full 960px body, `full` ones push past it into the gutters.
// The caption stays on a 760px measure and centred beneath, so a 1140px figure
// never leaves a single caption line running the whole width of the screen.
function Figure({ src, alt, caption, id }) {
  return (
    <figure id={id} style={{
      // One breakout ratio for the whole post: 1.25x the 640px text column,
      // so the page has two measures rather than four. The caption stays on the
      // text measure and therefore lines up with the paragraph above it.
      width: '800px',
      maxWidth: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '2.75rem',
      marginBottom: '2.75rem',
      clear: 'both',
    }}>
      <img src={src} alt={alt || ''} loading="lazy"
           style={{
             width: '100%', height: 'auto', display: 'block', borderRadius: '2px',
             // Every plot here is exported on a white ground. Multiplying it into
             // the paper is what stops each figure reading as a white tile laid on
             // the page. It only works while nothing between this image and the
             // section background creates a stacking context, so this figure is
             // centred with auto margins and never with a transform.
             mixBlendMode: 'multiply',
           }} />
      {caption && (
        <figcaption style={{
          fontFamily: 'var(--font-text)',
          fontSize: '0.9rem',
          color: MUTED,
          fontStyle: 'italic',
          lineHeight: 1.62,
          marginTop: '0.9rem',
          textAlign: 'left',
          maxWidth: '640px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─── Pull quote ───────────────────────────────────────────────────────────────
function Pullquote({ children }) {
  return (
    <blockquote className="narrow-block" style={{
      borderLeft: `2px solid ${ACCENT}`,
      paddingLeft: '1.25rem',
      margin: '1.75rem auto',
      color: '#4a4a4a',
      fontSize: '1.02rem',
      fontStyle: 'italic',
      lineHeight: 1.65,
      fontWeight: 400,
    }}>
      {children}
    </blockquote>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
// Rules only under the header and between rows; no vertical lines, no zebra.
// Numeric cells are set in the mono face with tabular figures so columns of
// four-decimal rates line up on the decimal point.
function DataTable({ head, rows, align = [], caption }) {
  const alignOf = i => align[i] || 'left'
  return (
    <div className="narrow-block" style={{ margin: '1.9rem auto 1.6rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '0.88rem',
          // Scroll rather than crush: without a floor the browser squeezes the
          // label column to one word per line on a phone.
          minWidth: '32rem',
        }}>
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} style={{
                  textAlign: alignOf(i),
                  fontFamily: MONO,
                  fontSize: '0.69rem',
                  fontWeight: 500,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: QUIET,
                  padding: '0 0.85rem 0.5rem',
                  paddingLeft: i === 0 ? 0 : '0.85rem',
                  borderBottom: `1px solid #c8c2b3`,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'bottom',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => {
              const cells = Array.isArray(row) ? row : row.cells
              const emph = !Array.isArray(row) && row.emphasis
              return (
                <tr key={r} style={emph ? { background: ACCENT_TINT } : undefined}>
                  {cells.map((c, i) => (
                    <td key={i} style={{
                      textAlign: alignOf(i),
                      padding: '0.5rem 0.85rem',
                      paddingLeft: i === 0 ? (emph ? '0.45rem' : 0) : '0.85rem',
                      borderBottom: `1px solid #e6e0d0`,
                      color: emph ? INK : BODY,
                      fontWeight: emph ? 600 : 400,
                      fontFamily: alignOf(i) === 'right' ? MONO : 'inherit',
                      fontSize: alignOf(i) === 'right' ? '0.84rem' : '0.88rem',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.5,
                      verticalAlign: 'top',
                    }}>{c}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {caption && (
        <div style={{
          fontSize: '0.79rem', color: MUTED, fontStyle: 'italic',
          lineHeight: 1.6, marginTop: '0.7rem',
        }}>{caption}</div>
      )}
    </div>
  )
}

// ─── The four relevance rules ────────────────────────────────────────────────
// The point of the card is the fourth row. Three rules are inherited and set in
// ink; the one this post adds carries the accent, so the argument of the whole
// method section is visible before a word of it is read.
function RuleRow({ name, tex, note, isNew }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '7.5rem 1fr',
      gap: '0.9rem',
      alignItems: 'center',
      padding: '0.62rem 0.6rem',
      borderRadius: '4px',
      background: isNew ? ACCENT_TINT : 'transparent',
      borderTop: `1px solid ${isNew ? 'transparent' : '#efe9dc'}`,
    }}>
      <div>
        <div style={{
          fontFamily: MONO, fontSize: '0.72rem', letterSpacing: '0.07em',
          color: isNew ? ACCENT : MUTED, fontWeight: isNew ? 600 : 500,
        }}>{name}</div>
        {note && (
          <div style={{ fontFamily: MONO, fontSize: '0.64rem', color: QUIET, marginTop: '0.18rem' }}>
            {note}
          </div>
        )}
      </div>
      <div style={{ overflowX: 'auto', fontSize: '0.97rem', color: INK }}>
        <Katex tex={tex} />
      </div>
    </div>
  )
}

function RuleCard() {
  return (
    <div className="narrow-block" style={{
      border: `1px solid ${CARD_LINE}`,
      borderRadius: '6px',
      background: CARD_BG,
      padding: '1.05rem 1.05rem 0.9rem',
      margin: '2rem auto',
    }}>
      <div style={{
        fontFamily: MONO, fontSize: '0.7rem', color: QUIET,
        letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: '0.7rem',
        paddingLeft: '0.6rem',
      }}>
        Four relevance rules &nbsp;·&nbsp; <span style={{ color: ACCENT }}>the fourth is the one this post adds</span>
      </div>
      <RuleRow name="RMSNorm" note="inherited" tex="y \;=\; x \big/ \big[\sqrt{\epsilon + \operatorname{Var}[x]}\,\big]_{c}" />
      <RuleRow name="SiLU" note="inherited" tex="y \;=\; x \odot \big[\sigma(x)\big]_{c}" />
      <RuleRow name="gated MLP" note="inherited" tex="y \;=\; \tfrac{1}{2}\, x \odot g(x) \;+\; \tfrac{1}{2}\,\big[\, x \odot g(x) \,\big]_{c}" />
      <RuleRow name="attention" note="Prop. 1, unapplied" isNew tex="y_j \;=\; \sum_i x_i\, \big[A_{ij}\big]_{c}" />
      <div style={{
        fontFamily: MONO, fontSize: '0.68rem', color: QUIET,
        marginTop: '0.7rem', paddingLeft: '0.6rem', lineHeight: 1.55,
      }}>
        [ · ]<sub>c</sub> is a factor held fixed during the backward pass.
      </div>
    </div>
  )
}

// ─── Which lens carries which rules ──────────────────────────────────────────
// Three cards, one per backward graph, in the order the post introduces them.
// The four rule slots are drawn as filled or hollow chips, so the difference
// between the three lenses is a count you can see rather than one you parse.
const RULE_SLOTS = ['RMSNorm', 'SiLU', 'gated MLP', 'attention']

function LensCard({ title, sub, rules, accent }) {
  const on = accent ? ACCENT : INK
  return (
    <div style={{
      flex: '1 1 200px',
      minWidth: 200,
      border: `1px solid #d4cebf`,
      borderTop: `2px solid ${accent ? ACCENT : INK}`,
      borderRadius: '6px',
      background: '#fdfcf9',
      padding: '0.95rem 1rem 1rem',
    }}>
      <div style={{
        fontFamily: MONO, fontSize: '0.72rem', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: accent ? ACCENT : INK,
        fontWeight: 600, marginBottom: '0.15rem',
      }}>{title}</div>
      <div style={{ fontSize: '0.76rem', color: QUIET, fontStyle: 'italic', marginBottom: '0.7rem' }}>
        {sub}
      </div>
      {RULE_SLOTS.map(slot => {
        const has = rules.includes(slot)
        return (
          <div key={slot} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.16rem 0',
          }}>
            <span aria-hidden="true" style={{
              width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
              background: has ? on : 'transparent',
              border: `1px solid ${has ? on : '#cfc7b6'}`,
            }} />
            <span style={{
              fontFamily: MONO, fontSize: '0.72rem',
              color: has ? BODY : '#b6ae9d',
              textDecoration: 'none',
            }}>{slot}</span>
          </div>
        )
      })}
      <div style={{
        marginTop: '0.7rem', paddingTop: '0.5rem', borderTop: '1px solid #efe9dc',
        fontFamily: MONO, fontSize: '0.7rem', color: accent ? ACCENT : MUTED,
      }}>
        {rules.length} of 4
      </div>
    </div>
  )
}

function LensLadder() {
  return (
    <div id="lens-ladder" className="narrow-block" style={{
      display: 'flex', gap: '0.9rem', flexWrap: 'wrap', margin: '2rem auto 2.25rem',
    }}>
      <LensCard title="J-lens" sub="averaged Jacobian, no rules" rules={[]} />
      <LensCard title="R-lens" sub="three rules added" rules={['RMSNorm', 'SiLU', 'gated MLP']} />
      <LensCard title="C-lens" sub="this post" accent rules={RULE_SLOTS} />
    </div>
  )
}

// ─── MAIN POST COMPONENT ──────────────────────────────────────────────────────
export default function CLensPost() {
  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      margin: '0 auto',
      color: INK,
    }}>
      {/* ── 1. Introduction ───────────────────────────────────────────────── */}
      <SectionHeading number={1} title="Introduction" />

      <P>
        <Strong>Motivation.</Strong> A diffusion language model attends to every position at once
        and writes several tokens per denoising step. The DiffusionGemma report could not get the
        logit lens working on intermediate layers of one, and it lists adapting lens techniques to
        this architecture as an open problem <Ref n={5} />. The J-lens is the instrument built for
        reading intermediate layers, and its authors reject a tuned lens for being fitted to the
        model&apos;s output <Ref n={3} />. I ported the J-lens to LLaDA-8B-Base and then the R-lens
        on top of it, and under bidirectional attention the R-lens backward pass conserves less
        relevance than the J-lens backward pass it corrects.
      </P>

      <P><Strong>Contributions.</Strong></P>

      <Ul>
        <Li>
          I measured the conservation error of the J-lens and R-lens backward passes under a causal
          mask and under a bidirectional one, on the same weights and the same prompts.
        </Li>
        <Li>
          I read Euler&apos;s homogeneous function theorem as the criterion that decides which
          modules need a relevance rule, measured the degree of every module in a transformer layer
          against it, and found attention to be the one module with no rule and no fixed degree. The
          attention-head rule is stated in Ali et al. <Ref n={1} /> and listed in RelP&apos;s table
          of transformer rules <Ref n={4} />, and it is applied in neither.
        </Li>
        <Li>
          With that rule added, the decomposition of the final residual across source coordinates is
          exact to floating point, and I call the lens built on it the C-lens.
        </Li>
        <Li>
          I compared four readouts inside real denoising trajectories of LLaDA-8B-Base, against
          every baseline either source paper used and two they did not, and repeated the comparison
          on Llama-2-7B under its own causal mask at every layer the lens covers.
        </Li>
        <Li>
          I used the C-lens to measure how often a diffusion language model&apos;s current top
          prediction differs from a token it has written and cannot revise.
        </Li>
      </Ul>

      {/* ── 2. Background ─────────────────────────────────────────────────── */}
      <SectionHeading number={2} title="Background" />

      <P>
        <Strong>J-lens.</Strong> Every lens in this post reads layer <Katex tex="\ell" /> as
      </P>

      <MathPanel tex={String.raw`\begin{aligned}
\operatorname{lens}(h_\ell) \;&=\; \operatorname{softmax}\bigl(W_U\, \operatorname{norm}(J_\ell\, h_\ell)\bigr), \\[8pt]
J_\ell \;&=\; \mathbb{E}_{t,\; t' \ge t,\; \text{prompt}}\left[\frac{\partial h_{L,t'}}{\partial h_{\ell,t}}\right].
\end{aligned}`} />

      <P>
        <Katex tex="J_\ell" /> is the Jacobian of the final residual with respect to the residual at
        layer <Katex tex="\ell" />, averaged over source positions, over the target positions the
        attention mask lets that source reach, and over prompts. I call it the lens matrix. Setting{' '}
        <Katex tex="J_\ell = I" /> gives the logit lens <Ref n={9} />, and the J-lens, the R-lens and
        the C-lens differ only in the backward pass this Jacobian is taken through <Ref n={3} />.
      </P>

      <P>
        <Strong>Relevance rules.</Strong> A relevance rule rewrites one module&apos;s backward pass
        so that a factor which depends on the input is held fixed, which makes the module linear in
        its input. The quantity preserved is relevance, and for coordinate <Katex tex="i" /> of
        layer <Katex tex="\ell" /> against coordinate <Katex tex="j" /> of the final residual it is
      </P>

      <MathPanel tex={String.raw`\begin{aligned}
R_{\ell,\, i \to j} \;&=\; h_{\ell,i}\, \frac{\partial h_{L,j}}{\partial h_{\ell,i}}, \\[8pt]
\sum_i R_{\ell,\, i \to j} \;&=\; h_{L,j}, \\[8pt]
\varepsilon_\ell \;&=\; \frac{\bigl|\, h_{L,j} - \sum_i R_{\ell,\, i \to j} \,\bigr|}{\bigl| h_{L,j} \bigr|}.
\end{aligned}`} />

      <P>
        The second line states conservation of relevance, that the terms over the source coordinates
        sum back to the target activation. The third line is the relative size of the gap when they
        do not, and it is the number I measured on four models. Ali et al. give four rules for a
        transformer, for LayerNorm, for the SiLU nonlinearity, for the gated MLP and for the
        attention head <Ref n={1} />. Three of them are in the R-lens backward pass and the
        attention-head rule is not <Ref n={2} />.
      </P>

      <LensLadder />

      {/* ── 3. Method ─────────────────────────────────────────────────────── */}
      <SectionHeading number={3} title="Method" />

      <P>
        <Strong>Euler&apos;s homogeneous function theorem.</Strong> For a module{' '}
        <Katex tex="g" /> whose output scales as the <Katex tex="k" />-th power of its input,
      </P>

      <MathPanel tex={String.raw`\begin{aligned}
g(\alpha x) \;&=\; \alpha^{k}\, g(x) \quad \text{for all } \alpha > 0, \\[8pt]
\sum_i x_i \frac{\partial g_j(x)}{\partial x_i} \;&=\; k\, g_j(x).
\end{aligned}`} />

      <P>
        The second line follows from differentiating the first at <Katex tex="\alpha = 1" />, and it
        says that the relevance leaving a module is <Katex tex="k" /> times its output, so a module
        conserves relevance if and only if <Katex tex="k = 1" />. Ali et al. note that the LayerNorm
        centring step is homogeneous of degree one and conserves relevance for that reason, and their
        paper does not name the theorem <Ref n={1} />. Reading it as the criterion that decides which
        modules need a relevance rule, I swept each module&apos;s input along a ray and measured{' '}
        <Katex tex="\langle x, \nabla g_j\rangle / g_j" /> at <Katex tex="d = 64" /> over 5 seeds.
      </P>

      <Figure
        id="fig-2"
        src="/images/blog/c-lens/fig2_homogeneity.png"
        alt="Measured homogeneity degree against input scale for six synthetic modules, before and after each module's relevance rule is applied."
        caption={
          <>
            <FigTitle>Figure 2. Every module either has degree 1 or is given a rule that makes it
            1.</FigTitle> Blue is the module as written and magenta is the same module with its rule in
            the backward pass. These are synthetic modules at d = 64, so no model is loaded.
          </>
        }
      />

      <DataTable
        head={['module', 'degree k', 'IQR', 'fraction below zero', 'rule needed']}
        align={['left', 'right', 'right', 'right', 'left']}
        rows={[
          ['linear without bias, ReLU, LayerNorm centring', '1.000', '0.00', '0.00', 'none'],
          ['RMSNorm rescaling', '0.000', '0.00', '0.00', 'LayerNorm rule'],
          ['SiLU', '0.930', '0.63', '0.09', 'identity rule'],
          ['gated MLP', '2.001', '0.56', '0.02', 'half rule'],
          { emphasis: true, cells: ['attention', '1.584', '1.95', '0.19', 'attention-head rule'] },
        ]}
      />

      <P>
        The gated MLP has a fixed degree, so dividing by 2 corrects it. Attention has no fixed degree
        at any input scale, and 19 percent of its coordinates measure a negative ratio, so its
        conservation error changes sign from one coordinate to the next and no constant corrects it.
        The two propositions of Ali et al. have these two forms, with a constant factor{' '}
        <Katex tex="\epsilon / (\epsilon + \operatorname{Var}[x])" /> for LayerNorm, whose degree is a
        constant 0, and a covariance term for the attention head, where there is no constant to
        carry <Ref n={1} />.
      </P>

      <P>
        <Strong>Four relevance rules.</Strong> Writing <Katex tex="[\cdot]_{c}" /> for a factor held
        fixed during the backward pass,
      </P>

      <RuleCard />

      <P>
        Each line makes its module degree 1 in <Katex tex="x" />, which is the magenta curve of
        Figure 2. The last line is Proposition 1 of Ali et al. <Ref n={1} />. The C-lens is the
        J-lens with all four lines in the backward pass.
      </P>

      <P>
        <Strong>Composition across the stack.</Strong> For any downstream scalar <Katex tex="f" />{' '}
        and any module <Katex tex="y = g(x)" /> with <Katex tex="k = 1" />,
      </P>

      <MathPanel tex={String.raw`\begin{aligned}
\sum_i x_i \frac{\partial f}{\partial x_i}
\;&=\; \sum_i x_i \sum_j \frac{\partial y_j}{\partial x_i}\, \frac{\partial f}{\partial y_j} \\[8pt]
&=\; \sum_j \frac{\partial f}{\partial y_j} \sum_i x_i \frac{\partial y_j}{\partial x_i}
\;=\; \sum_j y_j \frac{\partial f}{\partial y_j}.
\end{aligned}`} />

      <P>
        Exchanging the order of summation takes relevance conserved at one module to relevance
        conserved from one layer to the next. Taking <Katex tex="f = h_{L,j}" /> as the base case,
        where the map is the identity, and inducting downward gives
      </P>

      <MathBlock tex="\sum_i h_{\ell,i}\, \frac{\partial h_{L,j}}{\partial h_{\ell,i}} \;=\; h_{L,j} \quad \text{at every layer } \ell ." />

      <Pullquote>
        Neither source paper states this step. I wrote the prediction down before loading a model.
      </Pullquote>

      {/* ── 4. Results ────────────────────────────────────────────────────── */}
      <SectionHeading number={4} title="Results" />

      <SubHeading>Quantitative comparisons</SubHeading>

      <P><Strong>Models.</Strong></P>
      <Ul>
        <Li>Llama-2-7B under its own causal mask, and the same weights and the same prompts under an all-visible mask</Li>
        <Li>DiffuLLaMA, an autoregressive model adapted to diffusion</Li>
        <Li>LLaDA-8B-Base, a masked diffusion model trained from scratch</Li>
      </Ul>

      <P><Strong>Corpora.</Strong></P>
      <Ul>
        <Li>24 infill trajectories of LLaDA-8B-Base at temperature 0, recorded at every denoising step, which gives 22,875 pairs of a step and a position still masked at that step</Li>
        <Li>200 held-out Pile passages at 127 readout positions each, which gives 25,400 rows on Llama-2-7B</Li>
        <Li>NARCBench deliberation text, where several agents argue with each other, for the second measurement of the committed positions</Li>
      </Ul>

      <P><Strong>Metrics.</Strong></P>
      <Ul>
        <Li>the conservation error <Katex tex="\varepsilon_\ell" /> above, in fp16 pooled over every source layer</Li>
        <Li>pass@10 for the token a masked position later commits to, and for the token the original text had there</Li>
        <Li>each corpus&apos;s own unigram floor, stated beside every rate</Li>
        <Li>paired McNemar on identical rows, and a cluster bootstrap by passage or by trajectory</Li>
      </Ul>

      <P><Strong>Conservation.</Strong></P>

      <DataTable
        head={['model', 'J-lens', 'R-lens', 'change', 'C-lens']}
        align={['left', 'right', 'right', 'right', 'right']}
        rows={[
          [<>Llama-2-7B <Ref n={8} />, causal</>, '0.765', '0.490', '−36 %', '7.3e-04'],
          ['Llama-2-7B, bidirectional', '0.841', '1.299',
            <span style={{ color: ACCENT, fontWeight: 600 }}>+54 %</span>, '8.9e-04'],
          [<>DiffuLLaMA <Ref n={7} />, bidirectional</>, '0.797', '1.111', '+39 %', '1.0e-03'],
          [<>LLaDA-8B <Ref n={6} />, bidirectional</>, '1.147', '1.215', '+6 %', '1.7e-03'],
        ]}
      />

      <Ul>
        <Li>
          Nothing differs between the two Llama-2 rows except the attention mask, and the sign of the
          change flips between them. I registered that reversal on synthetic modules before loading a
          model.
        </Li>
        <Li>
          Llama-2 was never trained bidirectionally, so its second row feeds the model an input
          distribution it has not seen. Both bidirectionally trained models show the same increase,
          so it does not require an out-of-distribution input.
        </Li>
        <Li>
          The C-lens column is at fp16 machine epsilon, 9.8e-04, on all four models.
        </Li>
      </Ul>

      <P>
        An all-visible mask does put Llama-2 out of distribution behaviourally, and its accuracy on a
        question-answering prompt set falls to 0.1406. The conservation error is a property of the
        backward graph and is computable whether or not the model performs a task, so replacing the
        mask is a control for conservation and not for any task metric.
      </P>

      <Figure
        id="fig-3"
        src="/images/blog/c-lens/fig3_conservation.png"
        alt="Attributed relevance against target activation for three backward graphs on three model-and-mask conditions. The C-lens points lie exactly on the identity line."
        caption={
          <>
            <FigTitle>Figure 3. Conservation is an identity for the C-lens and an approximation for the
            other two.</FigTitle> Each point is one target coordinate at layer 25. The x axis is the
            relevance the backward pass attributes to that layer and the y axis is the activation it
            should sum to. Columns are the three backward graphs and rows are Llama-2-7B causal, the
            same weights bidirectional, and LLaDA-8B-Base. This figure is fp32 at one layer and the
            table is fp16 pooled over every layer, which is why the R-lens advantage turns negative
            there and only shrinks here. In fp32 the C-lens error is 2.85e-07 on Llama-2-7B and
            9.69e-07 on LLaDA-8B at every source layer.
          </>
        }
      />

      <P>
        <Strong>Readout inside a denoising trajectory.</Strong> Layer 25 is the first layer where any
        condition on LLaDA-8B-Base exceeds the corpus&apos;s unigram floor of 0.1904.
      </P>

      <DataTable
        head={['at layer 25, over 22,875 pairs', 'J-lens', 'C-lens', 'paired test']}
        align={['left', 'right', 'right', 'left']}
        rows={[
          ['the token the position commits to', '0.3753', '0.4542', 'McNemar, 1,907 against 104'],
          ['the same, top-entropy quartile', '0.1145', '0.1717', 'p = 4.0e-61'],
          ['the token the original text had, as a ratio', '1.00', '1.19', 'p = 1.9e-239'],
        ]}
      />

      <Ul>
        <Li>
          The gain is largest where the model is least certain, and a readout imitating the output
          layer would show the opposite ordering.
        </Li>
        <Li>
          It holds against the token the original text had, which the output layer has no access to.
        </Li>
        <Li>
          Refitting the expectation on denoising canvases, with the masked positions as the target
          set, composes with the rule change and takes layer-25 pass@10 to 0.5307.
        </Li>
      </Ul>

      <P>
        The table below uses that refit, scored on 12 held-out trajectories, so its numbers are not
        interchangeable with the ones above.
      </P>

      <DataTable
        head={['readout', 'used as a baseline by', 'pass@10 at layer 25']}
        align={['left', 'left', 'right']}
        rows={[
          ['unigram floor', 'this post', '0.1904'],
          [<>logit lens <Ref n={9} /></>, 'J-lens paper, R-lens post', '0.1759'],
          [<>J-lens <Ref n={3} /></>, 'R-lens post', '0.2378'],
          ['logit lens, mean residual direction removed', 'neither', '0.2899'],
          [<>R-lens <Ref n={2} /></>, 'neither', '0.4014'],
          [<>tuned lens <Ref n={10} /> fitted to the final residual</>, 'neither', '0.4830'],
          { emphasis: true, cells: ['C-lens', '', '0.4972'] },
        ]}
      />

      <P>
        The plain logit lens does not reach the floor at this layer, which is the failure the
        DiffusionGemma report describes on intermediate layers of a diffusion model <Ref n={5} />.
      </P>

      <P>
        The closest baseline is the tuned lens, which neither source paper tested and which the
        J-lens authors reject on principle for being correlational <Ref n={3} />. At layer 22 it goes
        above the C-lens, at 0.4043 against 0.2554. It overfits its training half by 0.41, where the
        logit lens, fitted to nothing, changes by 0.006 across the same split. I selected its
        regularisation on reconstruction error and not on the scored metric, which makes its numbers
        a lower bound.
      </P>

      <P>
        <Strong>Readout on an autoregressive model.</Strong> The fourth rule concerns attention and
        not diffusion, so I ran the same comparison on Llama-2-7B under its own causal mask.
      </P>

      <Figure
        id="fig-4"
        src="/images/blog/c-lens/fig7_ar_depth.png"
        alt="Panel a: pass@10 at every layer 10 to 29 of Llama-2-7B for four readouts. Panel b: the C-lens over J-lens ratio against layer, falling with depth on both architectures."
        caption={
          <>
            <FigTitle>Figure 4. The C-lens gain over the J-lens on an autoregressive model falls from
            2.06 times at layer 18 to 1.02 times at layer 29.</FigTitle> Panel (a) is pass@10 at every
            layer 10 to 29 of Llama-2-7B for the four readouts, restricted to the 20,306 rows whose
            gold token is outside the corpus&apos;s ten most frequent targets, where a unigram guess
            scores 0 by construction. Panel (b) is the C-lens rate divided by the J-lens rate at
            every layer, for Llama-2-7B and for LLaDA-8B-Base. LLaDA points are hollow at the layers
            where its J-lens rate is below its own 0.1904 unigram floor, and its layers 10 to 13 are
            absent because the J-lens rate there is 0 and the ratio does not exist.
          </>
        }
      />

      <Ul>
        <Li>
          The C-lens is above the J-lens at all 20 layers on both ground truths, past the
          pre-registered Bonferroni bar of 4.17e-04 at every one, with every cluster-bootstrap
          interval on the difference excluding zero.
        </Li>
        <Li>
          The ratio falls monotonically with depth on both architectures, and over the six layers
          where LLaDA&apos;s two conditions both clear its floor the curves agree to a mean absolute
          difference of 0.071.
        </Li>
        <Li>
          The J-lens scores below applying no lens matrix at 14 consecutive layers of this model. On
          LLaDA it is above the plain logit lens wherever either is non-zero, and that is the only
          comparison that changes between the two architectures.
        </Li>
      </Ul>

      <P>
        One untested explanation is that a causal model&apos;s residual stream is close to output
        space at every depth, which is why the logit lens was invented on one, so an averaged linear
        transport has little room to improve on it and its estimation error can cost more than the
        transport gives back.
      </P>

      <P>
        These lenses are fitted on 6 prompts, so I ran the same measurement at three fitting budgets
        on one shared evaluation corpus disjoint from all 96 prompts.
      </P>

      <DataTable
        head={['mean pass@10 over 20 layers', '6 prompts', '24 prompts', '96 prompts']}
        align={['left', 'right', 'right', 'right']}
        rows={[
          ['J-lens', '0.3460', '0.3585', '0.3646'],
          { emphasis: true, cells: ['C-lens', '0.4368', '0.4402', '0.4427'] },
        ]}
      />

      <Ul>
        <Li>
          A 16-fold increase in fitting data helps the J-lens three times as much as the C-lens,
          which is what a small-fit-set effect would predict, and the gap does not close. At 96
          prompts the J-lens is still below the plain logit lens at 13 consecutive layers.
        </Li>
        <Li>
          At layer 10, the shallowest layer the lens covers, the J-lens goes above the C-lens once it
          is fitted on more than 6 prompts, and the difference grows with the budget to 0.0305 at 96
          prompts with p = 3.6e-57. The C-lens is above the J-lens at every layer at 6 prompts and at
          every layer except layer 10 at larger budgets, so I withdraw the unqualified form of that
          claim.
        </Li>
      </Ul>

      <SubHeading>Qualitative comparisons</SubHeading>

      <P>
        <Strong>First layer at which the eventual token appears.</Strong> Figure 1 is two positions
        read at every layer under all four readouts. The C-lens names the eventual token at or before
        the layer the R-lens names it in both, and the plain logit lens column is nearly
        content-independent until layer 28.
      </P>

      <Figure
        id="fig-5"
        src="/images/blog/c-lens/fig1_decision_forming.png"
        alt="One masked position read at eight layers across all 32 denoising steps, coloured by the rank each readout assigns to the token that position eventually commits to."
        caption={
          <>
            <FigTitle>Figure 5. A masked position holds the token it will write for about twenty
            denoising steps before it writes it.</FigTitle> One masked position of one LLaDA-8B-Base
            trajectory, read at eight layers across all 32 denoising steps, with colour the rank the
            readout assigns to the token that position eventually commits to on a shared log scale.
            Panel (a) is the C-lens and panel (b) is the plain logit lens on identical activations.
            Panel (c) is the canvas around that position at three steps and at the reveal, with the
            C-lens top-5 at layer 25 beneath each. I selected the position with the longest lead time
            in the trajectory, a criterion I fixed before looking at any readout.
          </>
        }
      />

      <P>
        At layer 25 the plain logit lens loses the eventual token after 4 to 7 steps and every
        condition with a lens matrix recovers it 16 or more steps ahead, which on a 32-step
        trajectory is half the generation. The C-lens advantage grows with depth and with lead time
        together, from 1.17 times at layer 25 at a lead of one step to 2.16 times at layer 22 at a
        lead of 16 or more.
      </P>

      <P>
        <Strong>Positions the model would now write differently.</Strong> Under the absorbing kernel
        every open diffusion language model uses, a revealed position is copied forward. The model
        still computes a full distribution at that position on every later forward pass and the
        sampler discards it. At the moment of commitment the model agrees with the token by
        construction, because the sampler writes its own top prediction at temperature 0.
      </P>

      <Figure
        id="fig-6"
        src="/images/blog/c-lens/fig0_mechanism.png"
        alt="Panel A: autoregressive sampling. Panel B: masked diffusion sampling on one real LLaDA trajectory. Panel C: one position whose committed token stops matching the model's top prediction."
        caption={
          <>
            <FigTitle>Figure 6. A position a masked diffusion model has written is never re-examined by
            the sampler.</FigTitle> Panel A is autoregressive sampling, where state carries forward and
            a monitor reads the tokens. Panel B is masked diffusion sampling on one real
            LLaDA-8B-Base trajectory, where positions are revealed in confidence order and nothing
            but the tokens crosses a step. Panel C follows one position of that trajectory. The
            canvas holds <InlineCode>&apos;business&apos;</InlineCode> from step 11 onward, and from
            step 17 the model&apos;s top prediction at that position is a different token at every
            later step.
          </>
        }
      />

      <P>
        Over a generation, 4.0 percent of committed tokens are ones the model would now write
        differently, which is 239 of 1,515 distinct positions. On NARCBench deliberation text the
        rate is 7.7 percent, a ratio of 1.94 times with a bootstrap interval of [1.52, 2.54] clustered
        at the scenario pair.
      </P>

      <Figure
        id="fig-7"
        src="/images/blog/c-lens/fig6_regret_canvas.png"
        alt="Panel a: one generation with position against denoising step, magenta marking committed positions whose current top prediction differs. Panel b: that rate against age."
        caption={
          <>
            <FigTitle>Figure 7. The rate at which the model would now write a different token rises with
            how long ago that token was committed.</FigTitle> Panel (a) is one generation, with position
            on the x axis and denoising step on the y axis, and magenta marking a committed position
            whose current top prediction is a different token. Panel (b) is that rate against age,
            over 25,237 pairs.
          </>
        }
      />

      <P>
        At these positions the C-lens recovers the token the model would now prefer on 0.2271 of them
        at layer 25 and the J-lens on 0.1474, a gain of 54 percent at p = 6.4e-16 against 21 percent
        on the ordinary task. On the ordinary task a readout is competing with the model&apos;s own
        output layer, whose top prediction is the eventual commitment 92 percent of the time. Here
        the sampler discarded those logits, so the quality of the lens matrix is the whole difference.
      </P>

      <P>
        A linear classifier on the untransported residual reaches AUC 0.8502 at layer 22 for whether a
        committed position is one the model would now write differently, the C-lens transport is 0.008
        to 0.040 below that at all 20 layers, and the model&apos;s own output entropy is above the
        residual at every layer. No separate internal signal for these positions exists above the
        model&apos;s own uncertainty.
      </P>

      <Pullquote>
        No output-level view of a diffusion model can see these positions, the pattern in them is
        structured, and it is partly anticipatable, which is a narrower safety claim than the one I
        set out to test. It does not consist of meaning-flipping errors, and I tested for those
        specifically.
      </Pullquote>

      {/* ── 5. Limitations ────────────────────────────────────────────────── */}
      <SectionHeading number={5} title="Limitations" />

      <Ul>
        <Li>
          Almost everything I measured inside a trajectory is one model, LLaDA-8B-Base at temperature
          0, with 24 trajectories, infill sampling, one noise schedule and 6 prompts for the
          expectation. The conservation measurement replicates on DiffuLLaMA and the readout results
          do not.
        </Li>
        <Li>
          LLaDA-8B and DiffuLLaMA are not frontier models, and I chose them because they are the open
          models in this architecture class. The result that transfers is the derivation, which is
          about attention masks and homogeneity degrees and holds whichever model I ran it on.
        </Li>
        <Li>
          I fitted the C-lens matrix on all 24 trajectories and scored it on 12 of them, so at layer
          25 it carries an in-sample advantage of 0.066, which is larger than its margin over the
          tuned lens. Refitting on the training half alone would settle that comparison and I have not
          run it.
        </Li>
        <Li>
          I chose the band 22 to 29 from the readability profile on LLaDA. The workspace paper states
          its band as fractions of depth and I did not inherit those.
        </Li>
        <Li>
          Reveal order is a property of the sampling task, so every trajectory result here is measured
          in the infill setting, and any measurement of a diffusion language model that assumes
          left-to-right structure is scoped to the generate-like task. The appendix has the figure.
        </Li>
      </Ul>

      {/* ── 6. Next experiments ───────────────────────────────────────────── */}
      <SectionHeading number={6} title="Next experiments" />

      <P>
        The sampler reveals positions in descending confidence and never revisits them, and the
        model&apos;s own entropy one step after commitment predicts disagreement 8 to 15 steps later
        at AUC 0.69 to 0.74, so a position can be deferred at the moment it would be written. I would
        penalise the reveal score by that predicted disagreement, run the five conditions I have set
        up, and measure whether disagreement on the final canvas falls, holding generation quality
        with match to the original text and with final-canvas perplexity. The lens adds 0.03 to 0.04
        AUC over entropy alone, so I would report the entropy version as the result and the lens
        version as a comparison.
      </P>

      {/* ── 7. Appendix ───────────────────────────────────────────────────── */}
      <SectionHeading number={7} title="Appendix" />

      <SubHeading>One direction dominates the layer-22 residual stream</SubHeading>

      <P>
        The plain logit lens at layer 22 returns <InlineCode>&apos;blockList&apos;</InlineCode> in its
        top 10 at 185 of 233 positions regardless of content, and the mean residual direction is 84
        percent of the residual norm there. Projecting out that single rank-1 component makes the
        plain logit lens 6.7 times more readable at layer 22 and 2.0 times at layer 25, and changes
        nothing at layer 29. The C-lens is above the mean-removed logit lens at both depths, so the
        lens matrix does more than subtract a mean, and the direct layer-22 comparison against the
        plain logit lens overstates what the four relevance rules contribute.
      </P>

      <Figure
        id="fig-8"
        src="/images/blog/c-lens/fig4_constant_direction.png"
        alt="Panel a: 566 layer-22 residual vectors plotted against the mean direction and two principal components, with the origin far outside the cloud."
        caption={
          <>
            <FigTitle>Figure 8. The layer-22 residual stream is offset far from its own origin along one
            content-independent direction.</FigTitle> Panel (a) plots 566 layer-22 residual vectors in a
            basis whose first axis is the mean direction and whose other two are the leading principal
            components of the residual once that mean is removed. A magenta cross marks the origin,
            which lies outside the cloud, and the offset along the mean is 7.3 times the cloud&apos;s
            own width orthogonal to it. Panel (b) gives the fraction of those 566 positions in whose
            top 10 each token appears under the plain logit lens, before and after the mean direction
            is projected out. Panel (c) gives pass@10 for the token each position eventually commits
            to.
          </>
        }
      />

      <SubHeading>Reveal order is a property of the task</SubHeading>

      <Figure
        id="fig-9"
        src="/images/blog/c-lens/fig5_reveal_order.png"
        alt="Reveal step against position index for free continuation and for infill, with a dashed line marking a perfectly left-to-right reveal."
        caption={
          <>
            <FigTitle>Figure 9. The order in which a masked diffusion language model reveals positions
            is a property of the task.</FigTitle> Each point is one generated position, with its index
            within the generated span on the x axis and the denoising step at which it was revealed
            on the y axis. The dashed line is a perfectly left-to-right reveal. Panel (a) is free
            continuation, a prompt followed by an all-mask suffix, at a mean per-trajectory Spearman
            correlation of +0.871 over 1,536 positions. Panel (b) is infill, with masks interleaved
            through real text, at +0.043 over 1,552 positions. I used LLaDA-8B-Base with top-k
            confidence reveal at temperature 0 and 24 trajectories in each setting.
          </>
        }
      />

      <SubHeading>Only the committed tokens cross a denoising step</SubHeading>

      <P>
        I clamped the residual at one denoising step and released it, and no later commitment changed,
        0 of 32 trials at strengths 1, 2 and 4. Everything the model passes from one step to the next
        goes through tokens visible in the canvas, which is the reason anything read inside such a
        model has to be read within a single forward pass.
      </P>

      <SubHeading>A finding I cannot explain</SubHeading>

      <P>
        Two algebraically identical ways of estimating the same lens direction differ as estimators.
        Averaging the per-input directions and deriving the direction from an averaged matrix give the
        same object in exact arithmetic, and fitted on finite data the first is better on the
        diffusion model and the second on the autoregressive model, across five disjoint fitting draws
        at p = 0.0079 and p = 0.0026, with the pattern holding in a third independent slicing by depth
        band. One mechanism would be that the matrix route estimates all 4096 rows and accumulates
        error from every one, while the direction route accumulates error only along the projection it
        needs.
      </P>

      {/* ── References ────────────────────────────────────────────────────── */}
      <hr className="narrow-block" style={{ border: 0, borderTop: `1px solid ${RULE}`, margin: '3.5rem auto 1.5rem' }} />

      <div className="narrow-block">
        <p style={{
          color: QUIET, fontSize: '0.78rem', fontFamily: MONO,
          marginBottom: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          References
        </p>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            { n: 1, body: <>Ameen Ali, Thomas Schnake, Oliver Eberle, Grégoire Montavon, Klaus-Robert Müller and Lior Wolf. <Em>XAI for Transformers: Better Explanations through Conservative Propagation.</Em> <InlineCode>arXiv:2202.07304</InlineCode>, 15 February 2022. The homogeneity observation is Appendix B.1, the attention-head rule is Proposition 1 and the LayerNorm rule is Proposition 2.</> },
            { n: 2, body: <>camilablank, agam_bhatia and Neel Nanda. <Em>R-lens: Making J-lens More Faithful on Early Layers.</Em> Alignment Forum, 5 August 2026.</> },
            { n: 3, body: <>Wes Gurnee, Nicholas Sofroniew, Adam Pearce, Mateusz Piotrowski, Isaac Kauvar, Runjin Chen, Anna Soligo, Paul Bogdan, Euan Ong, Rowan Wang, T. Ben Thompson, David Abrahams, Subhash Kantamneni, Emmanuel Ameisen, Joshua Batson and Jack Lindsey. <Em>Verbalizable Representations Form a Global Workspace in Language Models.</Em> Transformer Circuits, 6 July 2026.</> },
            { n: 4, body: <>Farnoush Rezaei Jafari, Oliver Eberle, Ashkan Khakzar and Neel Nanda. <Em>RelP: Faithful and Efficient Circuit Discovery in Language Models via Relevance Patching.</Em> <InlineCode>arXiv:2508.21258</InlineCode>, 28 August 2025. Table 1 lists the attention-head rule and Appendix A.1 records which rules the paper applies.</> },
            { n: 5, body: <>Joshua Engels, Callum McDougall, Bilal Chughtai, Janos Kramar, Senthooran Rajamanoharan, Cindy Wu, Arthur Conmy, Asic Q. Chen, Jean Tarbouriech, Min Ma, Brendan O&apos;Donoghue, João Gabriel Lopes de Oliveira, Rohin Shah and Neel Nanda. <Em>How Transparent is DiffusionGemma?</Em> <InlineCode>arXiv:2606.20560</InlineCode>, 18 June 2026, revised 17 August 2026. The open problems I address are in section 7.2.</> },
            { n: 6, body: <>Shen Nie, Fengqi Zhu, Zebin You, Xiaolu Zhang et al. <Em>Large Language Diffusion Models.</Em> <InlineCode>arXiv:2502.09992</InlineCode>, 14 February 2025. This is LLaDA.</> },
            { n: 7, body: <>Shansan Gong, Shivam Agarwal, Yizhe Zhang, Jiacheng Ye et al. <Em>Scaling Diffusion Language Models via Adaptation from Autoregressive Models.</Em> <InlineCode>arXiv:2410.17891</InlineCode>, 23 October 2024. This is DiffuLLaMA.</> },
            { n: 8, body: <>Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert et al. <Em>Llama 2: Open Foundation and Fine-Tuned Chat Models.</Em> <InlineCode>arXiv:2307.09288</InlineCode>, 18 July 2023.</> },
            { n: 9, body: <>nostalgebraist. <Em>interpreting GPT: the logit lens.</Em> LessWrong, 31 August 2020.</> },
            { n: 10, body: <>Nora Belrose, Igor Ostrovsky, Lev McKinney, Zach Furman et al. <Em>Eliciting Latent Predictions from Transformers with the Tuned Lens.</Em> <InlineCode>arXiv:2303.08112</InlineCode>, 14 March 2023.</> },
          ].map(({ n, body }) => (
            <li key={n} id={`c-lens-ref-${n}`} style={{
              display: 'grid',
              gridTemplateColumns: '2.3rem 1fr',
              gap: '0.5rem',
              marginBottom: '0.8rem',
              scrollMarginTop: '90px',
            }}>
              <span style={{ fontFamily: MONO, fontSize: '0.76rem', color: QUIET, paddingTop: '0.16rem' }}>
                [{n}]
              </span>
              <span style={{ color: BODY, fontSize: '0.88rem', lineHeight: 1.6 }}>{body}</span>
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}
