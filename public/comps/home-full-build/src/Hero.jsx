// Hero.jsx — Pattern #5 — Editorial asymmetric hero
// Variant: animated typewriter H1 — "KEEP / [WORD]." cycles through
// GATHERING / CREATING / CONNECTING / MOVING / WORKING.
const HERO_WORDS = ['GATHERING', 'CREATING', 'CONNECTING', 'MOVING', 'WORKING'];

const TYPE_MS    = 95;   // ms per character while typing
const DELETE_MS  = 38;   // ms per character while erasing
const HOLD_MS    = 1900; // hold the complete word
const GAP_MS     = 320;  // brief pause between cycles

const useTypewriter = (words) => {
  const [wordIdx, setWordIdx] = React.useState(0);
  const [text, setText]       = React.useState('');
  const [phase, setPhase]     = React.useState('typing'); // typing | holding | deleting | gap

  React.useEffect(() => {
    let t;
    const target = words[wordIdx];
    if (phase === 'typing') {
      if (text.length < target.length) {
        t = setTimeout(() => setText(target.slice(0, text.length + 1)), TYPE_MS);
      } else {
        t = setTimeout(() => setPhase('holding'), 10);
      }
    } else if (phase === 'holding') {
      t = setTimeout(() => setPhase('deleting'), HOLD_MS);
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = setTimeout(() => setText(target.slice(0, text.length - 1)), DELETE_MS);
      } else {
        t = setTimeout(() => setPhase('gap'), 10);
      }
    } else if (phase === 'gap') {
      t = setTimeout(() => {
        setWordIdx((wordIdx + 1) % words.length);
        setPhase('typing');
      }, GAP_MS);
    }
    return () => clearTimeout(t);
  }, [text, phase, wordIdx, words]);

  return { text, showPeriod: phase === 'holding' || (phase === 'typing' && text.length === words[wordIdx].length) };
};

const Hero = () => {
  const { text, showPeriod } = useTypewriter(HERO_WORDS);

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      background: 'var(--tx-moss)',
      minHeight: 'clamp(560px, 86vh, 880px)',
      paddingTop: 78
    }}>
      {/* Background photograph */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${window.__txAsset('photo-hero-tables-05.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
        transformOrigin: 'top left',
        transform: 'scale(1.20)'
      }} />

      {/* Flat black scrim — lifts the H1 off the photography */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'rgba(0,0,0,0.16)'
      }} />

      {/* Top vignette so the nav scrim doesn't fight type */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 280px), ' +
          'linear-gradient(90deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 55%)'
      }} />

      {/* Content stack — bottom-left, asymmetric */}
      <div style={{
        position: 'relative',
        maxWidth: 'var(--pg-content-max)',
        margin: '0 auto',
        padding: 'clamp(180px, 28vh, 320px) var(--pg-gutter) clamp(56px, 9vh, 120px)',
        color: '#FFFFFF',
        transform: 'translateY(-30px)'
      }}>
        {/* Quiet wordmark — brand name on load, sized well below the H1 */}
        <img
          src={window.__txAsset('wordmark.svg')}
          alt="TABLE X"
          style={{ height: 26, width: 'auto', opacity: 0.92, marginBottom: 26, display: 'block' }}
        />
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12, fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.86)',
          marginBottom: 28
        }}>
          the modern american tablemaker
        </div>

        <h1 style={{
          margin: 0,
          color: '#FFFFFF',
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          textTransform: 'uppercase',
          fontSize: 'clamp(64px, 9vw, 148px)',
          lineHeight: 0.94,
          letterSpacing: '-0.015em',
          whiteSpace: 'nowrap',
          maxWidth: 'none'
        }}>
          <span style={{ display: 'block' }}>KEEP</span>
          <span style={{ display: 'block', color: 'var(--tx-ember)', minHeight: '1em' }}>
            {text}
            {showPeriod ? '.' : ''}
            <span aria-hidden="true" style={{
              display: 'inline-block',
              width: '0.06em',
              height: '0.78em',
              marginLeft: '0.06em',
              background: '#FFFFFF',
              verticalAlign: '-0.04em',
              animation: 'tx-caret-blink 1s steps(2, start) infinite'
            }} />
          </span>
        </h1>

        <p className="lede" style={{
          color: 'rgba(255,255,255,0.88)',
          marginTop: 36,
          maxWidth: 620
        }}>
          Commercial-grade tables, designed and built in the Midwest. On your floor in under two weeks. Backed by a 50-year warranty.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 40 }}>
          <a href="#" className="btn btn--paper">get a quote</a>
          <a href="#" className="btn btn--ghost-dark">explore products</a>
        </div>
      </div>

      <style>{`
        @keyframes tx-caret-blink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
};

window.Hero = Hero;
