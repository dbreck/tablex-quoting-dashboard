// BrowseBySpace.jsx — [NEW] §5 — Numbered editorial rows.
// Per §8a M6: avoid centered rounded-card 3-up grids — use numbered (01/02/…)
// rows with hairlines and asymmetric copy blocks instead.
const SPACES = [
  { n: '01', name: 'Workplace',   tag: 'Conference, collaborative, focus.' },
  { n: '02', name: 'Education',   tag: 'Training rooms, classrooms, nesting + folding.' },
  { n: '03', name: 'Hospitality', tag: 'Café, lounge, employee dining.' },
  { n: '04', name: 'Healthcare',  tag: 'Easy-clean surfaces, durable edges.' },
  { n: '05', name: 'Outdoor',     tag: 'Weather-rated for patios + campuses.' },
];

const SpaceRow = ({ n, name, tag, last }) => (
  <a href="#" className="space-row" style={{
    display: 'grid',
    gridTemplateColumns: '88px minmax(160px, 1.1fr) 2fr 24px',
    columnGap: 'clamp(20px, 3vw, 56px)',
    alignItems: 'baseline',
    padding: 'clamp(28px, 3.2vw, 44px) 0',
    borderBottom: last ? 'none' : '1px solid rgba(10,10,10,0.12)',
    color: 'inherit',
    textDecoration: 'none',
    transition: 'background 220ms var(--ease-out-quart)'
  }}>
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 14, fontWeight: 600,
      letterSpacing: '0.18em',
      color: 'var(--tx-stone-500)'
    }}>{n}</div>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'clamp(26px, 2.4vw, 40px)',
      letterSpacing: '-0.02em',
      lineHeight: 1.05,
      color: 'var(--tx-iron)'
    }}>{name}</div>
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 'clamp(15px, 1.05vw, 18px)',
      color: 'var(--tx-stone-600)',
      lineHeight: 1.5
    }}>{tag}</div>
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 20, color: 'var(--tx-iron)',
      textAlign: 'right'
    }}>→</div>
  </a>
);

const BrowseBySpace = () => (
  <section className="section" style={{ background: 'var(--tx-white)' }}>
    <div className="section-inner">
      <hr className="hairline" />
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 32,
        flexWrap: 'wrap',
        marginTop: 14,
        marginBottom: 'clamp(40px, 4vw, 64px)'
      }}>
        <div>
          <div className="section-eyebrow" style={{ marginTop: 0, marginBottom: 18 }}>Browse by Space</div>
          <h2 className="h1" style={{ maxWidth: 720 }}>
            Start with the room. We'll meet you there.
          </h2>
        </div>
        <a href="#" className="cta-arrow" style={{ color: 'var(--tx-iron)' }}>
          See all spaces <span aria-hidden="true">→</span>
        </a>
      </div>

      <div style={{ borderTop: '1px solid rgba(10,10,10,0.12)' }}>
        {SPACES.map((s, i) => (
          <SpaceRow key={s.n} {...s} last={i === SPACES.length - 1} />
        ))}
      </div>
    </div>

    <style>{`
      .space-row:hover { background: var(--tx-bone); }
      @media (max-width: 720px) {
        .space-row {
          grid-template-columns: 56px 1fr 24px !important;
          row-gap: 6px;
        }
        .space-row > div:nth-child(3) { grid-column: 2 / 3; }
      }
    `}</style>
  </section>
);

window.BrowseBySpace = BrowseBySpace;
