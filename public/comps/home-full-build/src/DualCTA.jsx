// DualCTA.jsx — Pattern #20 — Terminal section before footer.
// Canvas panel, two columns separated by vertical hairline.
const DualCTA = () => (
  <section style={{
    background: 'var(--tx-canvas)',
    padding: 'var(--pg-section-y) var(--pg-gutter)'
  }}>
    <div style={{
      maxWidth: 1280,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1px 1fr',
      gap: 'clamp(32px, 5vw, 80px)',
      alignItems: 'center'
    }} className="dual-grid">
      <div style={{ textAlign: 'center' }}>
        <div className="label-caps" style={{ color: 'var(--tx-stone-600)', marginBottom: 18 }}>
          Get a quote
        </div>
        <div className="h1" style={{ color: 'var(--tx-iron)' }}>Standard product? Quote it yourself, right now.</div>
        <p className="lede" style={{
          margin: '20px auto 32px',
          maxWidth: 380, textAlign: 'center'
        }}>
          Something custom? We&apos;ll have it back the next business day.
        </p>
        <a href="#" className="btn btn--ember">start a quote</a>
      </div>

      <div style={{
        width: 1, background: 'rgba(10,10,10,0.20)',
        height: '70%', minHeight: 180, justifySelf: 'center'
      }} className="dual-divider" />

      <div style={{ textAlign: 'center' }}>
        <div className="label-caps" style={{ color: 'var(--tx-stone-600)', marginBottom: 18 }}>
          Find your rep
        </div>
        <div className="h1" style={{ color: 'var(--tx-iron)' }}>We&apos;ll route you to your rep.</div>
        <p className="lede" style={{
          margin: '20px auto 32px',
          maxWidth: 380, textAlign: 'center'
        }}>
          Enter your zip — or straight to us if your territory doesn&apos;t have one yet.
        </p>
        <a href="#" className="btn btn--ghost-light">enter your zip</a>
      </div>
    </div>

    <style>{`
      @media (max-width: 900px) {
        .dual-grid {
          grid-template-columns: 1fr !important;
          gap: 56px !important;
        }
        .dual-divider {
          width: 60% !important; height: 1px !important;
          min-height: 1px !important; justify-self: center;
        }
      }
    `}</style>
  </section>
);

window.DualCTA = DualCTA;
