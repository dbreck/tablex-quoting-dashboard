// Spotlight.jsx — Pattern #16 — Canvas panel, asymmetric two-column.
// "SPEX STUDIO" featured series: TRIG. 3D render on the left, copy + CTA pair on the right.
const Spotlight = () =>
<section style={{
  background: 'var(--tx-canvas)',
  padding: 'var(--pg-section-y) var(--pg-gutter)'
}}>
    <div className="section-inner">
      <hr className="hairline" style={{ borderTopColor: 'rgba(10,10,10,0.20)' }} />
      <div className="section-eyebrow" style={{ color: 'var(--tx-iron)', marginBottom: 'clamp(48px, 5vw, 72px)' }}>
        Spex Studio
      </div>

      <div className="spot-grid">
        {/* Left — TRIG render on a soft inner panel. cc-8 — bumped scale. */}
        <div style={{
        backgroundImage: `url(${window.__txAsset('photo-trig-render.png')})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        aspectRatio: '5 / 4',
        minHeight: 520,
        margin: '0 calc(-1 * var(--pg-gutter)) 0 calc(-1 * var(--pg-gutter))',
        transform: 'scale(1.15)',
        transformOrigin: 'center'
      }} />

        {/* Right — copy + CTAs */}
        <div>
          <div className="label-caps" style={{ color: 'var(--tx-stone-600)', marginBottom: 16 }}>
            Featured series
          </div>
          <h2 className="h1" style={{ color: 'var(--tx-iron)' }}>
            <strong style={{ fontWeight: 700 }}>TRIG</strong> series
          </h2>
          <p className="lede" style={{ marginTop: 24, color: 'var(--tx-stone-700)', maxWidth: 560 }}>
            Trig was built for real movement — not the kind that only works on paper.
            Adjust height. Flip. Nest. Move. Repeat. If your space changes, Trig is already
            ahead of it.
          </p>

          {/* Quick spec strip */}
          <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12,
          marginTop: 32,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(13px, 1vw, 15px)',
          letterSpacing: '-0.01em',
          color: 'var(--tx-stone-600)'
        }}>
            <span style={{ color: 'var(--tx-stone-300)' }}>/</span><span>Tilt-lock surface</span>
            <span style={{ color: 'var(--tx-stone-300)' }}>/</span><span>Height-adjustable</span>
            <span style={{ color: 'var(--tx-ember)' }}>*</span><span>Nesting + folding</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 40 }}>
            <a href="#" className="btn btn--ember">open Spex Studio</a>
            <a href="#" className="btn btn--ghost-light">watch demo</a>
          </div>
        </div>
      </div>
    </div>

    <style>{`
      .spot-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: clamp(40px, 6vw, 96px);
        align-items: center;
      }
      @media (max-width: 900px) {
        .spot-grid { grid-template-columns: 1fr; gap: 40px; }
        .spot-grid > div:first-child { transform: none !important; margin: 0 !important; min-height: 360px !important; }
      }
    `}</style>
  </section>;


window.Spotlight = Spotlight;