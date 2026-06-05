// QuickShip.jsx — [NEW] §10 — White band. Closes configure → quote → ship arc.
// Eligible Quick-Ship series + 2-weeks accent.
const ELIGIBLE = ['Foundation', 'Ultra', 'Element', 'App', 'Solo'];

const QuickShip = () => (
  <section className="section" style={{ background: 'var(--tx-white)' }}>
    <div className="section-inner">
      <hr className="hairline" />
      <div className="section-eyebrow" style={{ marginBottom: 'clamp(40px, 4vw, 64px)' }}>Quick Ship</div>

      <div className="qs-grid">
        <div>
          <h2 className="h1" style={{ color: 'var(--tx-iron)', maxWidth: 720 }}>
            Need it fast?{' '}
            <span style={{ color: 'var(--tx-ember)' }}>Two weeks.</span>{' '}
            Not twelve.
          </h2>
          <p className="lede" style={{ marginTop: 24, maxWidth: 560 }}>
            Stock configurations ship from Jasper, Indiana in two weeks, guaranteed —
            versus 4–6 weeks for custom. Pick from a curated set of sizes in Black,
            Designer White, and Frosty White.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36 }}>
            <a href="#" className="btn btn--ember">browse Quick Ship</a>
            <a href="#" className="cta-arrow" style={{ color: 'var(--tx-iron)', alignSelf: 'center' }}>
              See eligible configurations <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Right — eligible series list, hairline-divided */}
        <div>
          <div className="label-caps" style={{ color: 'var(--tx-stone-600)', marginBottom: 24 }}>
            Eligible series
          </div>
          <div style={{ borderTop: '1px solid rgba(10,10,10,0.12)' }}>
            {ELIGIBLE.map((s, i) => (
              <div key={s} style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: '20px 0',
                borderBottom: '1px solid rgba(10,10,10,0.12)'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 'clamp(20px, 1.8vw, 28px)',
                  letterSpacing: '-0.01em',
                  color: 'var(--tx-iron)'
                }}>{s}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--tx-ember)'
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--tx-ember)'
                  }} />
                  In stock
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, fontSize: 13, color: 'var(--tx-stone-500)', lineHeight: 1.55 }}>
            Core sizes · Black / Designer White / Frosty White · in stock from $—.
          </div>
        </div>
      </div>
    </div>

    <style>{`
      .qs-grid {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        gap: clamp(40px, 6vw, 96px);
        align-items: start;
      }
      @media (max-width: 900px) {
        .qs-grid { grid-template-columns: 1fr; gap: 48px; }
      }
    `}</style>
  </section>
);

window.QuickShip = QuickShip;
