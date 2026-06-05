// EmberBand.jsx — cc-12 (Danny): replace the static two-circle band with
// the masked-image filmstrip Kayla intended.
//
//   • Full-bleed, edge-to-edge horizontal strip
//   • Bg is a repeating gradient — Ember segments alternating with Forge/Iron dark.
//     Masked photos sit across both as the whole strip scrolls left.
//   • Masks alternate in a deliberate rhythm: circle · vertical stadium ·
//     horizontal stadium · soft-cornered rectangle. Never two of the same adjacent.
//   • Slow, seamless, continuous loop (linear, no bounce). Pause on hover.
//   • prefers-reduced-motion: static varied-mask row.
//   • Single Ember moment of the fold — no other Ember accents inside.
//   • Product-detail + environmental imagery only (NO shop-floor / maker shots).

const ITEMS = [
  { mask: 'circle',    img: 'photo-hero-chairs-bundle.jpg',     w: 480, h: 480, pos: 'center' },
  { mask: 'v-stadium', img: 'photo-collection-solo-bundle.jpg', w: 300, h: 620, pos: 'center' },
  { mask: 'soft-rect', img: 'photo-featured-bases.png',  w: 560, h: 380, pos: 'center' },
  { mask: 'h-stadium', img: 'photo-trig-render.png',     w: 660, h: 340, pos: 'center' },
  { mask: 'circle',    img: 'photo-collection-app-bundle.jpg',  w: 460, h: 460, pos: 'center' },
  { mask: 'v-stadium', img: 'photo-ember-circle-1-bundle.jpg',  w: 300, h: 620, pos: 'center' },
  { mask: 'soft-rect', img: 'photo-ember-circle-2-bundle.jpg',  w: 540, h: 400, pos: 'center' },
  { mask: 'h-stadium', img: 'photo-hero-chairs-bundle.jpg',     w: 640, h: 320, pos: 'right'  },
];

const maskRadius = (mask) => {
  switch (mask) {
    case 'circle':    return '50%';
    case 'v-stadium': return '9999px';
    case 'h-stadium': return '9999px';
    case 'soft-rect': return '36px';
    default:          return '24px';
  }
};

const Frame = ({ item }) => (
  <div style={{
    width: item.w,
    height: item.h,
    flex: '0 0 auto',
    borderRadius: maskRadius(item.mask),
    backgroundImage: `url(${window.__txAsset(item.img)})`,
    backgroundSize: 'cover',
    backgroundPosition: item.pos,
    backgroundColor: 'rgba(0,0,0,0.25)'
  }} aria-hidden="true" />
);

const EmberBand = () => (
  <section className="ember-strip" aria-label="TableX details">
    <div className="ember-strip__track">
      {[...ITEMS, ...ITEMS].map((it, i) => (
        <Frame key={i} item={it} />
      ))}
    </div>

    <style>{`
      .ember-strip {
        position: relative;
        width: 100%;
        height: clamp(420px, 48vw, 560px);
        overflow: hidden;
        /* Alternating Ember / Forge segments — repeats every 1600px.
           Track is wider than this, so as it scrolls the bg moves with it. */
        background:
          repeating-linear-gradient(90deg,
            var(--tx-ember)  0,
            var(--tx-ember)  800px,
            var(--tx-forge)  800px,
            var(--tx-forge)  1600px);
      }
      .ember-strip__track {
        display: flex;
        align-items: center;
        gap: clamp(40px, 5vw, 96px);
        height: 100%;
        padding: 0 clamp(40px, 5vw, 96px);
        width: max-content;
        animation: ember-scroll 80s linear infinite;
        will-change: transform;
      }
      .ember-strip:hover .ember-strip__track {
        animation-play-state: paused;
      }
      @keyframes ember-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .ember-strip__track { animation: none; transform: translateX(0); }
      }
      /* Mobile — keep the rhythm, just scale items down */
      @media (max-width: 720px) {
        .ember-strip { height: clamp(320px, 60vw, 420px); }
        .ember-strip__track > div {
          transform: scale(0.62);
          transform-origin: center;
          margin: 0 -36px;
        }
      }
    `}</style>
  </section>
);

window.EmberBand = EmberBand;
