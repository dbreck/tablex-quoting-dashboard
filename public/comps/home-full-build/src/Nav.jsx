// Nav.jsx — Global nav, dark scrim over hero, transitions to light on scroll
const Nav = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 900
  );

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const dark = !scrolled;
  const fg = dark ? '#FFFFFF' : '#191919';

  const links = ['PRODUCTS', 'SPACES', 'FINISHES', 'RESOURCES', 'ABOUT'];

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 78,
        zIndex: 50,
        background: dark ? 'rgba(0,0,0,0.42)' : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: dark ? 'none' : '1px solid rgba(10,10,10,0.08)',
        color: fg,
        transition: 'background 220ms var(--ease-out-quart), color 220ms var(--ease-out-quart)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--pg-gutter)',
        gap: 24
      }}>
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', flex: '0 0 auto' }}>
          <img
            src={window.__txAsset(dark ? 'logo-white.svg' : 'logo-black.svg')}
            alt="TableX"
            style={{ height: 40, width: 'auto' }}
          />
        </a>

        {!isMobile && (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(20px, 2.6vw, 44px)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.10em'
          }}>
            {links.map(l => (
              <a key={l} href="#" style={{
                color: fg, textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'opacity 220ms var(--ease-out-quart)'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{l}</a>
            ))}
          </div>
        )}

        {!isMobile ? (
          <div style={{
            flex: '0 0 auto',
            display: 'flex', alignItems: 'center', gap: 18,
            fontSize: 13, color: fg
          }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Login</a>
            <span style={{ opacity: 0.35 }}>|</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Account</a>
            <span style={{ opacity: 0.35 }}>|</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
            <a href="#" aria-label="Cart" style={{
              color: 'inherit', display: 'inline-flex', alignItems: 'center',
              marginLeft: 8
            }}>
              <i data-lucide="shopping-bag" style={{ width: 18, height: 18 }} />
            </a>
          </div>
        ) : (
          <button
            aria-label="Menu"
            onClick={() => setOpen(o => !o)}
            style={{
              marginLeft: 'auto',
              background: 'transparent', border: 'none', cursor: 'pointer', color: fg,
              padding: 8, display: 'inline-flex'
            }}>
            <i data-lucide={open ? 'x' : 'menu'} style={{ width: 24, height: 24 }} />
          </button>
        )}
      </nav>

      {isMobile && open && (
        <div style={{
          position: 'fixed', top: 78, left: 0, right: 0, bottom: 0,
          background: '#191919', color: '#fff', zIndex: 49,
          padding: '32px var(--pg-gutter)',
          display: 'flex', flexDirection: 'column', gap: 24
        }}>
          {links.map(l => (
            <a key={l} href="#" onClick={() => setOpen(false)} style={{
              color: '#fff', textDecoration: 'none',
              fontSize: 22, fontWeight: 500, letterSpacing: '0.06em'
            }}>{l}</a>
          ))}
          <hr className="hairline hairline--inverse" style={{ margin: '12px 0' }} />
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none' }}>Login · Account · Contact</a>
        </div>
      )}
    </>
  );
};

window.Nav = Nav;
