// Quoting617.jsx — [EXPAND] §9 — Dark Forge band.
// Self-service reframe:
//   • Headline pushes instant, buyer-driven quoting.
//   • Giant numeral stays 9,000+ Configurable SKUs (Ember signage scale).
//   • Side stats: "1" entry total (configured/quoted/spec'd once) + 2,920 models.
// (File name kept for stable script-src reference; component name stays the same.)
const Quoting617 = () => (
  <section style={{
    background: 'var(--tx-forge)',
    color: '#FFFFFF',
    padding: 'var(--pg-section-y) var(--pg-gutter)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div className="section-inner" style={{ position: 'relative' }}>
      <hr className="hairline hairline--inverse" />
      <div className="section-eyebrow section-eyebrow--dark" style={{ marginBottom: 'clamp(48px, 5vw, 72px)' }}>
        Quoting, by the numbers
      </div>

      <div className="q617-top">
        <h2 className="h1" style={{ color: '#fff', maxWidth: 920 }}>
          Your quote, right now.
        </h2>
        <p className="lede lede--inverse" style={{ marginTop: 24, maxWidth: 640 }}>
          Configure any standard table in Spex Studio and the SKU, price, and spec
          flow straight through. No re-keying, no waiting on a rep.
        </p>
      </div>

      <div className="q617-stat-row" style={{ marginTop: 'clamp(64px, 7vw, 112px)' }}>
        {/* The single giant numeral on the page — Ember, signage scale. */}
        <div data-comment-anchor="quoting-big-stat">
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(120px, 16vw, 240px)',
            lineHeight: 0.82,
            color: 'var(--tx-ember)',
            letterSpacing: '-0.04em',
            marginLeft: '-0.04em'
          }}>9,000<span style={{ fontSize: '0.6em', verticalAlign: '0.16em' }}>+</span></div>
          <div className="label-caps" style={{
            marginTop: 24,
            color: '#FFFFFF',
            fontSize: 'clamp(13px, 1vw, 15px)'
          }}>Configurable SKUs</div>
          <div style={{
            marginTop: 8,
            fontSize: 15,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 460,
            lineHeight: 1.55
          }}>
            Across 16 base series. Lots of choice — one fast quote.
          </div>
        </div>

        {/* Supporting proofs — hairline-divided customer-facing rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { kpi: '1',     label: 'Entry, total',        sub: "Configured once. Quoted once. Spec'd once." },
            { kpi: '2,920', label: 'Photoreal 3D models', sub: 'The Spex Studio configuration engine.' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 1.1fr) 2.4fr',
              gap: 32,
              /* nitpick 2026-06-05: baseline pinned the numeral to the label's
                 first line — center the numeral against the full text block */
              alignItems: 'center',
              padding: 'clamp(28px, 3vw, 44px) 0',
              borderTop: i === 0 ? '1px solid rgba(255,255,255,0.18)' : 'none',
              borderBottom: '1px solid rgba(255,255,255,0.18)'
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 'clamp(36px, 3.4vw, 64px)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                /* leading-trim so the centering uses glyph bounds, not line-box */
                textBoxTrim: 'trim-both',
                textBoxEdge: 'cap alphabetic'
              }}>{row.kpi}</div>
              <div>
                <div className="label-caps" style={{ color: '#B8B4A6', marginBottom: 6 }}>{row.label}</div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>{row.sub}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 40 }}>
            <a href="#" className="btn btn--ember">see how quoting works</a>
          </div>
        </div>
      </div>
    </div>

    <style>{`
      .q617-stat-row {
        display: grid;
        grid-template-columns: 1fr 1.05fr;
        gap: clamp(40px, 6vw, 96px);
        align-items: start;
      }
      @media (max-width: 980px) {
        .q617-stat-row { grid-template-columns: 1fr; gap: 56px; }
      }
    `}</style>
  </section>
);

window.Quoting617 = Quoting617;
