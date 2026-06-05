// TriBlock.jsx — Pattern #9 — Tri-block routing band
// Three doors. Specifying on Canvas, Demoing + Browsing on Iron-black.
const TriColumn = ({ tone, eyebrow, icon, items, cta, pill }) => {
  const TONES = {
    canvas: { bg: 'var(--tx-canvas)', fg: '#191919', dim: '#6C6B6B' },
    iron:   { bg: 'var(--tx-iron)',   fg: '#FFFFFF', dim: '#B8B4A6' },
    saddle: { bg: 'var(--tx-saddle)', fg: '#FFFFFF', dim: 'rgba(255,255,255,0.62)' },
  };
  const { bg, fg, dim } = TONES[tone] || TONES.canvas;

  return (
    <div style={{
      background: bg,
      color: fg,
      padding: 'clamp(40px, 4vw, 64px) clamp(28px, 3.4vw, 56px) clamp(40px, 4vw, 56px)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 360
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 24
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(20px, 1.7vw, 28px)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          lineHeight: 1
        }}>{eyebrow}</div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: '0 0 auto', color: fg
        }}>
          <i data-lucide={icon} style={{ width: 56, height: 56, strokeWidth: 1.25 }} />
        </div>
      </div>

      <ul style={{
        listStyle: 'none', padding: 0,
        margin: 'clamp(28px, 3vw, 40px) 0 0',
        display: 'flex', flexDirection: 'column', gap: 12,
        fontSize: 15, lineHeight: 1.4, color: fg
      }}>
        {items.map(t => (
          <li key={t} style={{ display: 'flex', gap: 14 }}>
            <span style={{ color: dim }}>→</span><span>{t}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto', paddingTop: 36 }}>
        {pill ? (
          <a href="#" style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            background: 'var(--tx-ember)',
            textDecoration: 'none',
            borderRadius: 999,
            padding: '13px 26px',
            display: 'inline-block'
          }}>{cta}</a>
        ) : (
          <a href="#" style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: fg,
            textDecoration: 'none',
            borderBottom: `2px solid ${fg}`,
            paddingBottom: 6,
            display: 'inline-block'
          }}>{cta}</a>
        )}
      </div>
    </div>
  );
};

const TriBlock = () => {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);
  return (
    <section className="tri-block" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      width: '100%'
    }}>
      <TriColumn
        tone="canvas"
        eyebrow="Specifying"
        icon="circle-arrow-right"
        items={['Spex Studio', 'Tiered pricing', 'Quote pipeline', 'CAD downloads']}
        cta="Open Spex Studio"
      />
      <TriColumn
        tone="saddle"
        eyebrow="Selling"
        icon="aperture"
        items={['Tablet-optimized catalog', 'Territory dashboard', 'Commerce']}
        cta="Open Rep Portal"
        pill
      />
      <TriColumn
        tone="iron"
        eyebrow="Browsing"
        icon="globe"
        items={['Browse by Space', 'Collections', 'Quick Ship', 'Contracts']}
        cta="Browse by Space"
      />
      <style>{`
        @media (max-width: 900px) {
          .tri-block { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};

window.TriBlock = TriBlock;
