// Warranty.jsx — [NEW] §12 — Canvas pull-quote panel.
// Closes the trust cluster (now carries it alone). No big "50" numeral — the
// quoting fold's "1" is the page's only giant number. Pull-quote in Acumin Pro Wide.
const Warranty = () => (
  <section style={{
    background: 'var(--tx-canvas)',
    padding: 'clamp(96px, 12vw, 180px) var(--pg-gutter)',
    position: 'relative'
  }}>
    <div className="section-inner">
      <hr className="hairline" style={{ borderTopColor: 'rgba(10,10,10,0.20)' }} />
      <div className="section-eyebrow" style={{ color: 'var(--tx-iron)', marginBottom: 'clamp(56px, 6vw, 96px)' }}>
        50-Year Warranty
      </div>

      <div className="warr-grid">
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(28px, 3vw, 56px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--tx-iron)',
          textWrap: 'pretty'
        }}>
          <span style={{ color: 'var(--tx-ember)', fontFamily: 'var(--font-display)' }}>“</span>
          50 years. On every leg, every leaf, every joint. If something we made fails
          because of how we made it, we repair it or replace it. The warranty isn&apos;t a
          marketing line — it&apos;s how we sleep at night.
          <span style={{ color: 'var(--tx-ember)', fontFamily: 'var(--font-display)' }}>”</span>
        </div>

        <div>
          {/* Coverage tier rows — hairline-divided. ⚠️ proposed splits per brief. */}
          <div className="label-caps" style={{ color: 'var(--tx-stone-600)', marginBottom: 20 }}>
            Coverage at a glance
          </div>
          <div style={{ borderTop: '1px solid rgba(10,10,10,0.20)' }}>
            {[
              { years: '50', what: 'Structural', sub: 'Welds, frames, base.' },
              { years: '10', what: 'Surfaces',   sub: 'Tops, laminate, edge band.' },
              { years: '5',  what: 'Mechanical', sub: 'Casters, tilt-locks, height controls.' },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '88px 1fr',
                gap: 24,
                alignItems: 'baseline',
                padding: '20px 0',
                borderBottom: '1px solid rgba(10,10,10,0.20)'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 'clamp(24px, 2vw, 32px)',
                  letterSpacing: '-0.02em',
                  color: 'var(--tx-iron)'
                }}>{t.years}<span style={{
                  fontSize: 12, color: 'var(--tx-stone-500)', marginLeft: 4,
                  letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>yr</span></div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600, fontSize: 16, color: 'var(--tx-iron)'
                  }}>{t.what}</div>
                  <div style={{
                    fontSize: 14, color: 'var(--tx-stone-600)',
                    marginTop: 4, lineHeight: 1.5
                  }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <a href="#" className="cta-arrow" style={{
            color: 'var(--tx-iron)', marginTop: 28, display: 'inline-flex'
          }}>
            Learn about our warranty <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>

    <style>{`
      .warr-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: clamp(40px, 6vw, 112px);
        align-items: start;
      }
      @media (max-width: 980px) {
        .warr-grid { grid-template-columns: 1fr; gap: 56px; }
      }
    `}</style>
  </section>
);

window.Warranty = Warranty;
