import { useEffect, useState } from 'react'

/**
 * Very subtle “drops of light”: short strokes with a bright leading edge and
 * a soft fading trail. A few instances drift along tiny square paths in the
 * upper viewport so they read as quiet geometric motion, not decoration.
 */
export default function LightDrops() {
  const [off, setOff] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setOff(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  if (off) return null

  return (
    <div className="light-drops-root" aria-hidden>
      <div className="light-drops light-drops--v1" />
      <div className="light-drops light-drops--v2" />
      <div className="light-drops light-drops--v3" />
      <div className="light-drops light-drops--h1" />

      <style>{`
        .light-drops-root {
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          height: min(40vh, 360px);
          pointer-events: none;
          z-index: 3;
          overflow: hidden;
        }

        .light-drops {
          position: absolute;
          will-change: transform;
        }

        /* Vertical streak: strong at bottom (head), fades upward */
        .light-drops--v1,
        .light-drops--v2,
        .light-drops--v3 {
          width: 1.5px;
          height: 88px;
          border-radius: 1px;
          opacity: 0.42;
          background: linear-gradient(
            to top,
            rgba(244, 246, 252, 0.92) 0%,
            rgba(244, 246, 252, 0.22) 32%,
            rgba(200, 210, 230, 0.06) 58%,
            transparent 100%
          );
          filter: blur(0.35px);
          mix-blend-mode: screen;
        }

        /* Horizontal streak: strong on the left, fades right */
        .light-drops--h1 {
          width: 72px;
          height: 1.5px;
          border-radius: 1px;
          opacity: 0.32;
          background: linear-gradient(
            to right,
            rgba(244, 246, 252, 0.88) 0%,
            rgba(220, 228, 242, 0.14) 45%,
            transparent 100%
          );
          filter: blur(0.35px);
          mix-blend-mode: screen;
        }

        @keyframes light-square-a {
          0%, 100% { transform: translate(8vw, 5vh); }
          25% { transform: translate(17vw, 5vh); }
          50% { transform: translate(17vw, 14vh); }
          75% { transform: translate(8vw, 14vh); }
        }

        @keyframes light-square-b {
          0%, 100% { transform: translate(62vw, 6vh); }
          25% { transform: translate(72vw, 6vh); }
          50% { transform: translate(72vw, 15vh); }
          75% { transform: translate(62vw, 15vh); }
        }

        @keyframes light-square-c {
          0%, 100% { transform: translate(38vw, 4vh); }
          25% { transform: translate(48vw, 4vh); }
          50% { transform: translate(48vw, 12vh); }
          75% { transform: translate(38vw, 12vh); }
        }

        @keyframes light-square-h {
          0%, 100% { transform: translate(78vw, 10vh); }
          25% { transform: translate(88vw, 10vh); }
          50% { transform: translate(88vw, 18vh); }
          75% { transform: translate(78vw, 18vh); }
        }

        .light-drops--v1 {
          animation: light-square-a 19s linear infinite;
          animation-delay: -2s;
        }

        .light-drops--v2 {
          animation: light-square-b 23s linear infinite;
          animation-delay: -7s;
          opacity: 0.36;
          height: 76px;
        }

        .light-drops--v3 {
          animation: light-square-c 26.5s linear infinite;
          animation-delay: -11s;
          opacity: 0.3;
          height: 64px;
        }

        .light-drops--h1 {
          animation: light-square-h 21s linear infinite;
          animation-delay: -4s;
        }

        @media (max-width: 768px) {
          .light-drops--v2 { opacity: 0.28; }
          .light-drops--v3 { display: none; }
          .light-drops--h1 { opacity: 0.22; }
        }
      `}</style>
    </div>
  )
}
