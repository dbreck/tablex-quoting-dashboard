// StatStrip.jsx — Pattern #17 — Slash-divided proof strip.
// cc-7 (Danny): make this big and scroll in an infinite marquee.
// Two identical tracks side-by-side, translateX(-50%) over 40s; pause on hover.
// React is a browser global (UMD script in index.html); bind Fragment locally for JSX.
const { Fragment } = React;
const STATS = [
  '16 Series',
  '31 Paints',
  '8 Edges',
  '50-Year Warranty',
  'Industry-Leading Coverage',
  'Made in USA'
];
// Editorial accent indices — '*' instead of '/' before these (preserves the original rhythm).
const ACCENT_BEFORE = new Set([3, 5]);

const Track = ({ ariaHidden }) => (
  <div aria-hidden={ariaHidden}
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 'clamp(28px, 3vw, 56px)',
      paddingRight: 'clamp(28px, 3vw, 56px)',
      flex: '0 0 auto'
    }}>
    {STATS.map((s, i) => (
      <Fragment key={i}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          color: ACCENT_BEFORE.has(i) ? 'var(--tx-ember)' : '#B8B4A6',
          fontSize: 'inherit'
        }}>{ACCENT_BEFORE.has(i) ? '*' : '/'}</span>
        <span style={{ color: 'var(--tx-iron)' }}>{s}</span>
      </Fragment>
    ))}
  </div>
);

const StatStrip = () => (
  <section className="stat-marquee" aria-label="TableX by the numbers">
    <div className="stat-marquee__track">
      <Track />
      <Track ariaHidden />
    </div>

    <style>{`
      .stat-marquee {
        background: var(--tx-white);
        padding: clamp(56px, 7vw, 96px) 0;
        overflow: hidden;
        width: 100%;
        position: relative;
      }
      .stat-marquee::before,
      .stat-marquee::after {
        content: "";
        position: absolute;
        top: 0; bottom: 0;
        width: clamp(40px, 6vw, 120px);
        pointer-events: none;
        z-index: 2;
      }
      .stat-marquee::before {
        left: 0;
        background: linear-gradient(90deg, var(--tx-white) 0%, rgba(255,255,255,0) 100%);
      }
      .stat-marquee::after {
        right: 0;
        background: linear-gradient(-90deg, var(--tx-white) 0%, rgba(255,255,255,0) 100%);
      }
      .stat-marquee__track {
        display: inline-flex;
        font-family: var(--font-display);
        font-weight: 400;
        font-size: clamp(40px, 5.6vw, 96px);
        line-height: 1;
        letter-spacing: -0.02em;
        white-space: nowrap;
        animation: stat-scroll 40s linear infinite;
        will-change: transform;
      }
      .stat-marquee:hover .stat-marquee__track {
        animation-play-state: paused;
      }
      @keyframes stat-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .stat-marquee__track { animation: none; }
      }
    `}</style>
  </section>
);

window.StatStrip = StatStrip;
