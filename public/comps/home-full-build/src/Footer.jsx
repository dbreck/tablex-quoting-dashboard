// Footer.jsx — Pattern #3 — Dark Iron footer. Wordmark + address + 5-col link
// grid + Made-in-America seal + Stay Connected + disclaimer.
const FooterColumn = ({ title, items }) => (
  <div>
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 12, fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      color: '#B8B4A6',
      marginBottom: 22
    }}>{title}</div>
    <ul style={{
      listStyle: 'none', padding: 0, margin: 0,
      display: 'flex', flexDirection: 'column', gap: 12
    }}>
      {items.map(t => (
        <li key={t}>
          <a href="#" style={{
            color: '#FFFFFF', fontSize: 14, textDecoration: 'none',
            transition: 'opacity 220ms var(--ease-out-quart)'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{t}</a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer style={{
    background: 'var(--tx-iron)',
    color: '#FFFFFF',
    padding: 'clamp(72px, 9vw, 128px) var(--pg-gutter) 48px'
  }}>
    <div className="section-inner">
      <div className="ft-top">
        {/* Address block */}
        <div>
          <img src={window.__txAsset('logo-white.svg')} alt="TableX" style={{ height: 56, width: 'auto' }} />
          <div style={{ marginTop: 28, fontSize: 14, lineHeight: 1.8 }}>
            <div>1.877.481.1177</div>
            <div>sales@tablex.com</div>
            <div style={{ marginTop: 14 }}>555 Cathy Lane</div>
            <div>Jasper, IN 47546</div>
          </div>
        </div>

        {/* Link grid */}
        <div className="ft-cols">
          <FooterColumn title="Product"  items={['Spex Studio', 'Browse All', 'Compare', 'Accessories', 'Quick Ship']} />
          <FooterColumn title="Spaces"   items={['Training & Classroom', 'Conference & Meeting', 'Collaborative', 'Café & Hospitality', 'Healthcare']} />
          <FooterColumn title="Finishes" items={['Powder Coats', 'Laminates', 'Solid Surface', 'Edge Bands', 'Custom Tops']} />
          <FooterColumn title="Resources" items={['Brochures & Spec Sheets', 'CAD Downloads', 'Price Lists', 'Sustainability', 'Installation Guides']} />
          <FooterColumn title="About"    items={['Our Story', 'Manufacturing', '50-Year Warranty', 'TIPS & Contracts', 'Careers', 'News & Events']} />
        </div>

        {/* Seal + Stay Connected */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 32 }}>
          <img
            src={window.__txAsset('made-in-america.png')}
            alt="Made in America"
            style={{ width: 120, height: 120, filter: 'brightness(0) invert(1)' }}
          />
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12, fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: '#B8B4A6',
              marginBottom: 16
            }}>Stay Connected</div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              {['instagram', 'linkedin', 'youtube'].map(s => (
                <a key={s} href="#" aria-label={s} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF',
                  transition: 'background 220ms var(--ease-out-quart)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <i data-lucide={s} style={{ width: 16, height: 16 }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="hairline hairline--inverse" style={{ margin: '56px 0 22px' }} />

      <div className="ft-fineprint">
        <div>© 2026 TableX. Shipped from Jasper, Indiana.</div>
        <div>All series, finish, and warranty information accurate as of publication. Subject to revision — confirm current spec with your rep or sales@tablex.com.</div>
      </div>
    </div>

    <style>{`
      .ft-top {
        display: grid;
        grid-template-columns: 1.1fr 3.4fr 0.9fr;
        gap: clamp(32px, 4vw, 64px);
        align-items: start;
      }
      .ft-cols {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: clamp(16px, 2vw, 32px);
      }
      .ft-fineprint {
        display: flex; justify-content: space-between; gap: 32px;
        font-size: 12; font-size: 12px; color: #B8B4A6; flex-wrap: wrap;
        line-height: 1.55;
      }
      @media (max-width: 1100px) {
        .ft-top { grid-template-columns: 1fr 1fr; }
        .ft-top > div:nth-child(2) { grid-column: 1 / -1; order: 3; }
        .ft-cols { grid-template-columns: repeat(3, 1fr); }
      }
      @media (max-width: 640px) {
        .ft-top { grid-template-columns: 1fr; }
        .ft-cols { grid-template-columns: 1fr 1fr; }
      }
    `}</style>
  </footer>
);

window.Footer = Footer;
