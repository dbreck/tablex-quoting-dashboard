// FeaturedCollections.jsx — Pattern #14 — Three image cards in a row,
// 20px radius signature. Eyebrow + hairline opener. Centered Ember pill CTA below.
//
// Per HOME-CONTENT-MASTER §4: canonical lead trio (App / Solo / Outdoor) + the two
// overflow cards Kayla drew (Occasional / Dining). We show all 5 — 3-up on desktop
// with the last 2 wrapping to the next row.
const COLLECTIONS = [
// 2026-06-05: real product shots from Drive "Assets / Product Shots"
// (App·Solo direct; Outdoor=Element Outdoor pub; Occasional=Exclaim round;
//  Dining=Primary round; Conference=Ultra rect — mapped via series-catalog apps)
{ name: 'App', tag: 'Work-from-anywhere small tables.', img: 'collection-app.jpg' },
{ name: 'Solo', tag: 'Individual focus stations.', img: 'collection-solo.jpg' },
{ name: 'Outdoor', tag: 'Weather-rated for patios + campuses.', img: 'collection-outdoor.jpg' },
{ name: 'Occasional', tag: 'Lounge + lobby + statement tables.', img: 'collection-occasional.jpg' },
{ name: 'Dining', tag: 'Café + hospitality + employee dining.', img: 'collection-dining.jpg' },
{ name: 'Conference', tag: 'Boardroom + breakout + huddle.', img: 'collection-conference.jpg' }];


const CollectionCard = ({ name, tag, img, bgPos }) =>
<div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{
    backgroundImage: `url(${window.__txAsset(img)})`,
    backgroundSize: 'cover',
    backgroundPosition: bgPos || 'center',
    backgroundColor: 'var(--tx-stone-100)',
    aspectRatio: '1 / 1',
    borderRadius: 'var(--radius-lg)',
    width: '100%'
  }} />
    <div style={{ marginTop: 18 }}>
      <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 'clamp(20px, 1.5vw, 26px)',
      fontWeight: 600,
      color: 'var(--tx-iron)',
      letterSpacing: '-0.01em'
    }}>{name}</div>
      <div style={{
      fontSize: 14,
      color: 'var(--tx-stone-600)',
      marginTop: 6,
      lineHeight: 1.5
    }}>{tag}</div>
      <hr className="hairline" style={{ marginTop: 18 }} />
    </div>
  </div>;


const FeaturedCollections = () =>
<section className="section" style={{ background: 'var(--tx-white)' }}>
    <div className="section-inner">
      <hr className="hairline" />
      <div className="section-eyebrow">Featured Collections</div>

      <div className="fc-grid">
        {COLLECTIONS.map((c) => <CollectionCard key={c.name} {...c} />)}
      </div>

      <div style={{ textAlign: 'center', marginTop: 'clamp(56px, 7vw, 80px)' }}>
        <a href="#" className="btn btn--ember btn--pill-caps">view all collections</a>
      </div>
    </div>

    <style>{`
      .fc-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        row-gap: 64px;
      }
      @media (max-width: 1100px) {
        .fc-grid { grid-template-columns: repeat(2, 1fr); row-gap: 48px; }
      }
      @media (max-width: 560px) {
        .fc-grid { grid-template-columns: 1fr; row-gap: 40px; }
      }
    `}</style>
  </section>;


window.FeaturedCollections = FeaturedCollections;