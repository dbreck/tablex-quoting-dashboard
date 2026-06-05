// EnvironmentalBand.jsx — Pattern #15 — Full-bleed editorial photo band
// Two flip-and-nest TRIG tables on a staged Moss/sage set. Breather after Collections row.
const EnvironmentalBand = () => (
  <section style={{
    width: '100%',
    aspectRatio: '1920 / 720',
    minHeight: 320,
    maxHeight: 720,
    backgroundImage: `url(${window.__txAsset('photo-featured-bases.png')})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'var(--tx-moss)'
  }} />
);

window.EnvironmentalBand = EnvironmentalBand;
