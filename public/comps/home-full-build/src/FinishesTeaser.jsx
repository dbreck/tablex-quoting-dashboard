// FinishesTeaser.jsx — [NEW] §6 — Dark band so powder-coat colors pop.
// Asymmetric two-column: copy on the left, swatch tile on the right.
const POWDER_SWATCHES = [
'#191919', '#FFFFFF', '#75400E', '#F26721',
'#8A8962', '#5C6B7A', '#A55A2A', '#2C3F2E',
'#C7BFA8', '#3B3B3B', '#EAE5DE', '#6E2A1B'];


const LAMINATE_BLOCKS = [
{ name: 'Ashwood Beige',    img: 'laminate-ashwood-beige.png' },
{ name: 'Asian Sand',       img: 'laminate-asian-sand.png' },
{ name: 'Brazilwood',       img: 'laminate-brazilwood.png' },
{ name: 'Colombian Walnut', img: 'laminate-colombian-walnut.png' }];


const FinishesTeaser = () =>
<section style={{
  background: 'var(--tx-iron)',
  color: '#FFFFFF',
  padding: 'var(--pg-section-y) var(--pg-gutter)'
}}>
    <div className="section-inner">
      <hr className="hairline hairline--inverse" />
      <div className="section-eyebrow section-eyebrow--dark" style={{ marginBottom: 'clamp(40px, 4vw, 64px)' }}>
        Finishes
      </div>

      <div className="fin-grid">
        {/* Left — headline + lede + CTAs */}
        <div>
          <h2 className="h1" style={{ color: '#FFFFFF', maxWidth: 560 }}>
            Any laminate. Any table.
          </h2>
          <p className="lede lede--inverse" style={{ marginTop: 24, maxWidth: 480 }}>
            31 powder coats — every color, the same price. 66 standard laminates
            across three tiers. No designer-picked palettes: any top, any finish,
            through the same flow. Matching edge bands come standard on every
            woodgrain and solid.
          </p>

          {/* Slash strip — sub-stat row (§8a M6) */}
          <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'baseline', gap: 12,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(15px, 1.05vw, 18px)',
          color: 'rgba(255,255,255,0.78)',
          marginTop: 36,
          letterSpacing: '-0.01em'
        }}>
            <span style={{ color: '#B8B4A6' }}>/</span><span>Laminates</span>
            <span style={{ color: '#B8B4A6' }}>/</span><span>Powder coats</span>
            <span style={{ color: 'var(--tx-ember)' }}>*</span><span>Solid surface</span>
            <span style={{ color: '#B8B4A6' }}>/</span><span>Edge bands</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 40 }}>
            <a href="#" className="btn btn--ember">explore the finish library</a>
            <a href="#" className="cta-arrow" style={{ color: '#fff', marginLeft: 8, alignSelf: 'center' }}>
              See all 31 powder coats <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Right — swatch composition */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Laminate strip — 4 wide cells, each shows the wood-grain chip
              floating on the dark cell with the chip name as overlay text. */}
          <div>
            <div className="label-caps" style={{ color: '#B8B4A6', marginBottom: 14 }}>Laminate tops</div>
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'transparent'
          }}>
              {LAMINATE_BLOCKS.map((lm) =>
            <div key={lm.name} style={{
              position: 'relative',
              background: 'transparent',
              height: 160,
              overflow: 'hidden'
            }}>
                  <img
                    src={window.__txAsset(lm.img)}
                    alt={lm.name}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 156,
                      height: 156,
                      transform: 'translate(-50%, -54%)',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: 14, bottom: 14, right: 14,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    textShadow: '0 1px 6px rgba(0,0,0,0.6)'
                  }}>{lm.name}</div>
                </div>
            )}
            </div>
          </div>

          {/* Powder coat swatch grid */}
          <div>
            <div className="label-caps" style={{ color: '#B8B4A6', marginBottom: 14 }}>Powder coats · 31 total</div>
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 8
          }}>
              {POWDER_SWATCHES.map((c, i) =>
            <div key={i} style={{
              paddingBottom: '100%',
              background: c,
              borderRadius: 0,
              border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.18)' : 'none'
            }} />
            )}
            </div>
            <div style={{
            marginTop: 12,
            fontSize: 12, color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.04em'
          }}>+ 19 more — Ember, Saddle, Moss-2, and the rest.</div>
          </div>
        </div>
      </div>
    </div>

    <style>{`
      .fin-grid {
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        gap: clamp(40px, 5vw, 96px);
        align-items: start;
      }
      @media (max-width: 980px) {
        .fin-grid { grid-template-columns: 1fr; gap: 56px; }
      }
    `}</style>
  </section>;


window.FinishesTeaser = FinishesTeaser;