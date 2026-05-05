# Claude Design — IA-Level Layouts for Sprint 1 Anchor Routes

> Paste this whole file into a fresh Claude Design conversation. Run the **finalized sitemap** section through it before asking for layouts.

---

## Project context

**TableX** is a US-based commercial table manufacturer (training, conference, collaborative, hospitality). They sell primarily through commercial furniture dealers (~60% of traffic) and manufacturer's reps (~30%); a small slice (~10%) is individual buyers. The Phase 2 redesign at `tablex-site` is a Next 16 + Payload CMS 3 + Supabase + Cloudinary stack — a full marketing site, two authenticated portals (dealer + rep), a customer-facing CPQ ("Get a Quote"), and a 3D configurator called **Spex Studio**.

Scope of *this* prompt: produce **information-architecture-level layouts** (wireframe-fidelity, structural, no decorative styling) for the five Sprint 1 anchor routes listed under "Routes to lay out" below. Output should be in a form that Kayla can take into hi-fi without arguing about IA.

**You are NOT making brand or visual decisions.** That's Kayla's lane. Hold the line: skeletons, modules, hierarchy, and content priorities — not colors, fonts, or imagery treatments.

---

## Brand context (read before laying anything out)

### Archetype: Everyman + Outlaw

- **Everyman (primary):** Honest, practical, dependable. The friend / neighbor / honest worker. Rejects pretense and exclusivity. *"We pick up the phone like neighbors, not vendors."* Brand peers: IKEA, Carhartt, Subaru, Levi's, Costco.
- **Outlaw (secondary, aspirational):** Refusing to play by the big manufacturers' rules. Witty, bold, confident. Brian Craig (CEO) selected this as his primary pick — signals a desire to disrupt category conventions. Brand peers: Harley-Davidson, Jack Daniel's, Vans.

The blend positions TableX as **accessible yet bold** — the approachable neighbor who doesn't play by the big manufacturers' rules.

### Four brand principles (locked, in priority order)

1. **Crafted** — Every edge is a small decision made on purpose. Quality that reveals itself over time. Heritage techniques, modern tools.
2. **Confident** — Quiet authority over hype. Show the work; don't oversell.
3. **Grounded** — Deep roots in practical craftsmanship. Real photos, real plants, real people. Differentiates from overly-polished competitors.
4. **Approachable** — Neighborly, warm. Pick up the phone. Witty, not whimsical.

### Voice spectrum (from the April 2026 workshop)

- Casual > formal (64/36)
- Bold > understated (28/72 — strongest conviction)
- Conversational, peer-to-peer (75/25)
- Serious vs playful: **center-balanced (54)** — flexes by context. Cheeky and bold for outward-facing moments (homepage hero, social); warm and earnest for higher-stakes touchpoints (sales emails, error states).

### Competitive positioning

Modern + crafted quadrant. Empty space TableX occupies, away from mass-produced/traditional competitors. Closest brand-voice rival: **JSI**. Direct product-level rivals: **Enwork, Special-T**. Avoid mimicking any of their layout vocabularies.

### What TableX is *not*

Not corporate, not administratively bulky, not clownish, not whimsical, not the biggest fish in the pond. The team is comfortable being honest about that — it's a strength.

---

## Audience priorities (informs hierarchy)

| Persona | Traffic | Top job-to-be-done | Device split |
|---|---|---|---|
| Commercial Dealer | ~60% | Quote a project for a client in under 5 minutes | 70% desktop / 20% tablet / 10% mobile |
| Manufacturer's Rep | ~30% | Prep for a dealer visit on tablet; demo Spex Studio in showroom | 50% laptop / 30% tablet / 20% mobile |
| Individual Buyer | ~10% | Find pro-quality tables without going through a dealer | 50% mobile / 40% desktop / 10% tablet |

Dealers and reps converge on **fast access to specs, pricing (gated), CAD, and a frictionless quote path.** Individuals need **pricing transparency** *or* clear messaging about why a quote is required. Mobile-first matters most for individuals; desktop matters most for dealers.

---

## Finalized sitemap

> **Source:** `tablex-quoting-dashboard/docs/sitemap/sitemap-YYYY-MM-DD.md` — the canonical IA, 75 pages across 8 route groups. Brian-approval status: pending. The full list is in that export. Below is the subset relevant to the five routes you're laying out, plus the global IA so you have surrounding context.

### Global navigation (header)

- **Products** — dropdown: Spex Studio · Collections · Browse All · Compare · Accessories · Quick Ship
- **Spaces** — dropdown: Training & Classroom · Conference & Meeting · Collaborative · Cafe & Hospitality · Healthcare
- **Finishes** — dropdown: Powder Coats · Laminates · Edge Bands · Solid Surface · Custom Branded Tops
- **Resources** — Brochures · CAD · Price Lists (gated) · Case Studies · Sustainability · Install Guides
- **About** — Our Story · Manufacturing · 50-Year Warranty · TIPS & Contracts · Careers
- **Find a Rep** (action button)
- **Get a Quote** (primary CTA, contrast color)
- **Login / Account** (utility, top-right)
- **Search** (utility, top-right)

### Footer

- Repeat top-level nav as a sitemap
- Sustainability claim, 50-year warranty seal, Made in USA mark
- Newsletter signup
- Social, contact info, copyright

### The five Sprint 1 routes you're laying out

1. **Home** — `/`
2. **Products hub** — `/products`
3. **Series detail** — `/series/:slug` (template; Kayla will hi-fi against a representative series)
4. **Find Your Rep** — `/find-rep`
5. **Contact** — `/contact`

(Spex Studio at `/spex-studio/:seriesId` is *not* in this Sprint 1 ask — it's a separate workstream with R3F + ConfigPanel + SummaryRail; that lives under Spex Studio Sprint 2.)

---

## Routes to lay out

### 1. Home — `/`

**Purpose:** Land every persona, route them in under three scrolls. Establish brand authority + warmth in the same breath.

**Content priorities (in order):**

1. **Hero** — clear positioning statement (commercial-grade tables, made in the US, configurable). Single dominant visual. One primary CTA into Spex Studio, one secondary into Find a Rep.
2. **Spex Studio teaser** — single-paragraph explanation + entry tile (or interactive teaser if your skeleton supports it). This is the differentiator; surface it high.
3. **Audience splitters** — three doors: "I'm a Dealer" / "I'm a Rep" / "I'm a Buyer". Each door pre-routes the rest of their session. Don't make them figure it out from the nav.
4. **Spaces grid** — visual entry into use-case browsing (Training, Conference, Collaborative, Cafe, Healthcare). This is the primary individual-buyer path.
5. **Featured Collections** — curated A&D-friendly groupings (App, Solo, Outdoor, Occasional, Dining). 3–5 cards.
6. **Trust band** — Made in USA · 50-year warranty · 60+ years in business · TIPS contracts. No logos-of-clients; TableX doesn't lean on those.
7. **Latest case study** — one project showcase. Lazy.
8. **Get a Quote / Find a Rep** banner before footer.

**Structural asks:**
- Three-column splitter is critical; don't collapse it into a generic "Solutions" rail.
- Spex Studio teaser must read as a *product*, not a feature inside Products.
- Hero must work at 320px without breaking the visual.

---

### 2. Products hub — `/products`

**Purpose:** Disambiguate the four ways into product discovery. Don't make a dealer browse 17 series pages — make them pick the right tool.

**Content priorities (in order):**

1. **Page header** — single-line statement of what's here.
2. **Four-door layout** — large, equal-weight tiles for the four entry modes:
   - **Spex Studio** — "Configure your own" — link to `/spex-studio`
   - **Collections** — "Curated by use case" — link to `/products/collections`
   - **Browse All** — "Filter the full catalog" — link to `/products/browse`
   - **Compare** — "Side-by-side, up to 3" — link to `/products/compare`
3. **Quick Ship promo strip** — separate band, highlights in-stock-now items with a guaranteed delivery date. Not a tile inside the four-door grid.
4. **Spaces re-entry** — narrow strip ("Browsing for a specific space? Start there →") into `/spaces`. Don't duplicate Spaces content — link out.
5. **Footer-of-page CTA** — "Talk to a rep about your project" → `/find-rep`.

**Structural asks:**
- The four-door grid is the page. Don't over-fill it.
- The Spex Studio tile gets visual emphasis (size, contrast affordance) — it's the differentiator.
- Quick Ship needs to feel adjacent-but-not-equal. Different module entirely.

---

### 3. Series detail — `/series/:slug`

**Purpose:** Sell *one* table series. Three audiences need three things from this page:

- **Dealer:** specs, price-list link (gated), CAD download, lead time.
- **Rep:** photography for client decks, finish options, talking points.
- **Individual buyer:** confidence this is the right table for their space, plus a path to "Configure & Price."

**Content priorities (in order):**

1. **Hero block** — series name, one-line value prop, primary photograph, breadcrumb back to Products.
2. **Quick-action bar** — three CTAs, equal weight: **Configure in Spex Studio** · **Get a Quote** · **Find a Rep**. Persistent on scroll on desktop; collapses to a sticky bottom bar on mobile.
3. **Photography gallery** — multi-shot, in-context (real spaces, real people preferred), plus detail shots (edge, base, finish closeups).
4. **At-a-glance specs strip** — 4–6 stat tiles: shapes available · sizes · base styles · finishes · lead time · warranty.
5. **Configurator preview** — small embedded teaser of Spex Studio for this series, or a static "Configure" tile if the embed is out of scope. Either way, must feel inviting, not optional.
6. **Spaces this series fits** — chips linking to the relevant Spaces pages. Cross-pollinate.
7. **Finishes preview** — small strip of swatches with "See all finishes" link. Don't replicate the Finishes hub here.
8. **Resources rail** — Spec Sheet PDF · CAD download (DWG / Revit) · Price List (gated). These need to be obvious for dealers; don't bury.
9. **Geo-aware Rep card** — bottom of page, à la JSI. Auto-shows the local rep based on visitor IP.
10. **Related series** — 3 cards. Cross-sell.
11. **Get a Quote** banner before footer.

**Structural asks:**
- Quick-action bar must be persistent. Dealers don't scroll for actions.
- The Resources rail (spec sheet / CAD / price list) is load-bearing for dealers — it cannot be a small footer link.
- Geo-aware Rep card is an actual JSI-style pattern (photo, name, territory, contact).
- This template will hold for all 16 series; layout has to survive the series with the most photos *and* the series with the fewest.

---

### 4. Find Your Rep — `/find-rep`

**Purpose:** Connect a buyer with their territory rep. Today this is a hardcoded HTML page with no map; the new version is a real territory experience.

**Content priorities (in order):**

1. **Page header + zip search** — "Find your rep — enter your zip" as the primary action. Secondary: state dropdown.
2. **Interactive territory map** — US map, color-coded territories, click a state to scope down. On zip search, zoom to the matching territory.
3. **Rep card list** — for the matched territory: photo, name, rep group affiliation, territory, contact (phone + email), specialties (e.g. "education sector"), Spex Studio "demo on my tablet" CTA if rep is opted in.
4. **All territories list (collapsed by default)** — for visitors who want to scan the full map textually. A11y fallback for the map.
5. **"Become a rep"** — small footer-of-page link to a careers/recruitment surface (out of scope; just the link).

**Structural asks:**
- Map is hero-level real estate, but the zip-search input must be reachable in <1 scroll on mobile (where the map is heavy).
- Rep card layout is a reusable component — it also surfaces on `/series/:slug` and `/products/collections/:slug` as a "geo-aware rep card." Lay it out so it scales from 1 (territory page) to N (full directory).
- No marketing fluff before the search input. Visitors hit this page with intent.

---

### 5. Contact — `/contact`

**Purpose:** Catch-all for inquiries that don't fit Get-a-Quote (general questions, press, customer service, careers). Must be obviously distinct from Get-a-Quote so we don't divert quote traffic into a slow channel.

**Content priorities (in order):**

1. **Page header** — single-sentence framing: "For project quotes, use Get a Quote. For everything else, here." Steer the right traffic immediately.
2. **Reason chooser** — 3–4 paths above the form:
   - **Press / media** → mailto + brief PR contact info
   - **Customer service** (existing order issues) → form + phone
   - **General inquiry** → form
   - **Careers** → link to `/about/careers`
3. **Contact form** — fields: name, email, company (optional), reason (matches chooser), message. Resend transactional confirmation on submit.
4. **Office details** — physical address (Made in USA Midwest facility), main line, hours. Legitimacy signal.
5. **Map snippet** (optional, defer if it slows the layout pass) — small embed of the office location.
6. **"Get a Quote" rescue banner** — bottom of page: "Looking for a project quote? You probably want this →" linking to `/quote`.

**Structural asks:**
- Reason chooser must be visually distinct from a button row — it's a routing decision, not a CTA.
- Form is below-fold-acceptable; the chooser is doing the steering.
- Office details and trust signals matter more here than on most other pages — this is where buyers vet legitimacy.

---

## What I want back

For each of the five routes, give me:

1. **A wireframe-fidelity layout** — boxes, labels, hierarchy. Annotate which content modules are above-fold (desktop and mobile).
2. **A short hierarchy note** — 3–5 bullets on what's most important on this page and why, so Kayla and I can verify your priorities match the brief.
3. **One open question per route** — if there's something you'd push back on or need a decision on before going further, surface it now. Don't paper over it.

Use **consistent fidelity across all five.** No fancy layouts for the sexy routes and bare wireframes for Contact. They all need to read at the same level so Kayla can compare them against each other.

Output in whatever format you do best (HTML wireframes, structured Markdown with ASCII boxes, Figma-style spec — whatever's most legible). Don't include color, typography, photography treatments, or copy beyond labels — that's all Kayla's lane.

---

## Out of scope (don't drift here)

- Spex Studio configurator — separate workstream, R3F-heavy, Sprint 2.
- Dealer + Rep portals — auth-gated, already in the sitemap, *separate* hi-fi pass after marketing IA lands.
- Admin / Payload CMS UI — Payload provides this; not designed.
- Pricing visibility decision (public MSRP vs hidden) — open per `target-state.md` decision #3. Lay out for *both* possibilities; Kayla picks once Brian decides.
- Cart / Submit Quote Request flow — distinct from the five anchor routes; will get its own pass.

---

## Reference files (in the dashboard repo, if you have access)

- `src/data/site-map.ts` — canonical IA, source of the sitemap export.
- `src/data/future-site-architecture.ts` — IA with Brian's Mar 19 / 26 feedback baked in.
- `src/data/user-personas.ts` — full persona profiles (Dealer / Rep / Individual).
- `src/data/tablex-dna.ts` — brand archetype + workshop output, including raw "We Are / We Are Not" language.
- `tablex-site/docs/architecture/target-state.md` §1 + §5 — route group structure + Spex Studio context.
