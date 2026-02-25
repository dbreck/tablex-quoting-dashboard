# TableX Quoting Dashboard — Complete Research & Insights

> **Project:** TableX CPQ Evaluation & Website Redesign Research
> **Client:** TableX (tablex.com) — Commercial table manufacturer
> **Prepared by:** ClearPH (danny@clearph.com)
> **Date:** February 2026
> **Platform:** Next.js 16 / TypeScript / Supabase / Vercel

---

## Executive Summary

This document captures all research, analysis, and insights gathered through the TableX Quoting Dashboard — a bespoke analytics and research platform built to evaluate two parallel workstreams:

1. **Website Redesign** — Understanding TableX's existing WordPress site, user personas, and what a modern tablex.com should look like
2. **CPQ Exploration** — Evaluating whether a bespoke Configure-Price-Quote application makes more sense than purchasing an off-the-shelf CPQ solution

The dashboard analyzes 3,637 real quotes from Feb 2023 to present, 6,098 SKUs across 23+ product series, and the complete operational workflow from quote request through sales order creation. Key findings include **617 hours/year wasted on manual data re-entry**, a **13.3% quote revision rate** that compounds rework, and a quoting process where every data point is manually typed **three separate times** before a sales order is created.

---

## Part 1: Website Redesign Research

### 1.1 Company Profile

| Attribute | Value |
|-----------|-------|
| **Company** | TableX |
| **Website** | tablex.com |
| **Founded** | 1998 |
| **Tagline** | Commercial table manufacturer |
| **Warranty** | 50-year warranty |
| **Manufacturing** | Midwest manufacturing facility |
| **Brand Colors** | Green (#8dc63f), Gray (#58585A) |

**Team:**
- Jim Skillman — Owner
- Mark Fleck — VP Operations (mfleck@tablex.com)
- Patty Wollenmann — Accounting
- Tony Rasche — Logistics
- Sam Sander — Customer Service (ssander@tablex.com)
- Maya Mitchell — Brand Manager (maya@tablex.com)

### 1.2 Current WordPress Site Audit

**Technical Stack:**
- WordPress 6.9 with Divi theme
- PHP 8.1
- 6 active plugins: Divi Builder (critical), Gravity Forms (critical), Yoast SEO (critical), Advanced Custom Fields (critical), Wordfence Security, WP Super Cache

**Content Inventory:**
- 97 pages, 67 posts
- 2,373 media items (images, PDFs, documents)
- 40 Divi saved layouts
- 5 Gravity Forms with 16,438 total entries
- 49 WordPress users (7 admins, 1 editor, 41 subscribers)

**Navigation Structure:**
The site is organized into 6 top-level sections:

1. **Products** — 17 table series: Ultra, Foundation, Fundamental, Trig, Stretch, Elite, Revel, App, Element, Justice, Artisan, Primary, Puddle, Exclaim, VertiGo, Surge, TableXpress QuickShip
2. **Accessories** — 8 items: Corded Power, Daisy Link Power, Privacy Panels, Modesty Panels, Cup Holder, Locking Casters, MINI Drawer, Tilt Lock
3. **Applications** — 6 use cases: Training & Classroom, Café & Hospitality, Collaborative & Meeting, Lounge & Informal, Height Adjustable, Nesting & Folding
4. **Finishes** — 4 categories: Paints (31 standard colors), Edges, Laminates, Custom Branded Tops
5. **Resources** — About, Brochures, Contracts, Find Your Rep, Healthy Workplace Info
6. **Get a Quote** — Standalone CTA linking to Gravity Forms quote request

### 1.3 WordPress Site Audit — Key Findings

**Critical Gaps (3):**

1. **No CPQ System** — Quote requests are submitted via Gravity Forms and processed manually. There is no configure-price-quote workflow, no live pricing, and no automated quote PDF generation.
2. **PDF-Only Pricing** — All pricing is distributed as static PDF price lists. Dealers must download PDFs and manually look up prices — there is no dynamic pricing engine or searchable price database on the site.
3. **No Inventory or Order Tracking** — The current site has no inventory management, order status tracking, or shipping integration. These are all net-new capabilities for the rebuild.

**Warnings (3):**

4. **Hardcoded Rep Directory** — The "Find Your Rep" page uses a static layout with hardcoded rep information. There is no CRM integration, no territory mapping, and no dynamic dealer/rep locator.
5. **Membership System Abandoned** — 41 subscriber accounts exist but the membership/dealer portal functionality appears abandoned. No gated content or dealer-specific features are active.
6. **Divi Builder Dependency** — The entire site is built on Divi with 40+ saved layouts. Migration to a modern framework will require rebuilding all templates and page layouts from scratch.

**Opportunities (1):**

7. **Quote Form Has CPQ Field Blueprint** — The Quote Request form (Form #5) already captures Product Series, Table Shape, Size, Base Type, Laminate, Edge, Paint, Power/Data, and Quantity — these map directly to CPQ configuration fields.

**Informational (2):**

8. **High-Volume Contact Form** — The Contact form has nearly 15,000 entries — a significant lead database that should be migrated to the new CRM system during the rebuild.
9. **Spiff Program Tracking** — The Spiff Participation form tracks dealer incentives with 120 entries. This data will need to flow into the new dealer management system.

**Rebuild Scope Summary:** The current WordPress site serves primarily as a marketing brochure with basic lead capture. The rebuild needs to add CPQ quoting, dynamic pricing, dealer management, inventory tracking, and order processing — all net-new capabilities not present in the current system.

### 1.4 Gravity Forms Data

| Form | ID | Entries | Purpose |
|------|----|---------|---------|
| Contact | 1 | 14,948 | General inquiries — massive lead database |
| Warranty Claim | 2 | 167 | Post-sale warranty claims with photos |
| Freight Claims | 3 | 70 | Shipping damage claims with BOL tracking |
| Spiff Participation | 4 | 120 | Dealer incentive program tracking |
| Quote Request | 5 | 1,133 | Primary lead gen — maps directly to CPQ workflow |

The **Quote Request form** (Form #5) captures: First Name, Last Name, Company, Email, Phone, Address, City, State, Zip, Project Name, Product Series, Table Shape, Table Size, Base Type, Laminate Color, Edge Style, Paint Color, Power/Data, Quantity, Requested Delivery Date, Additional Notes, and How Did You Hear About Us.

---

## Part 2: User Personas

Three audience segments shape every website design decision. These were developed from dealer interactions, rep feedback, and traffic analysis.

### 2.1 Commercial Dealer (~60% of traffic)

**Profile:** Owner, Sales Director, or Project Manager at commercial furniture dealership. Age 35–60, 5–20+ years in commercial furniture, urban/suburban markets across North America.

**Key Insight:** Dealers are the primary revenue channel. They need a manufacturer partner who makes their job easier — fast pricing, clear specs, reliable delivery.

**Goals:**
- Win profitable projects and meet quarterly sales targets
- Build long-term client relationships for repeat business
- Provide complete turnkey solutions (design through installation)
- Manage multiple concurrent projects efficiently

**Pain Points:**
- **Complex quoting** — Projects require detailed specs, pricing from multiple manufacturers, custom configurations
- **Lead time pressure** — Balancing client urgency against manufacturer production schedules
- **Slow response times** — Waiting on quotes or answers kills deals and damages credibility
- **Unclear availability** — Need transparency on stock levels, quick-ship status, and current delays

**Website Behavior:**
- Devices: Desktop 70%, Tablet 20%, Mobile 10%
- Session flow: Direct navigation → Download materials → Check finish compatibility → Submit quote form → Quick exit
- Info priorities: (1) Pricing, (2) Lead times, (3) Specifications, (4) CAD files, (5) Product photography, (6) Finish options

**Website Implications:**
- Fast asset downloads — PDFs, CAD, images without registration barriers
- Clear, accurate pricing — even if login/dealer credentials required
- Lead time transparency — standard vs. quick-ship, current delays
- Easy quote submission — with ability to save/reference past quotes

**Deal Breakers:** Slow response times, unclear product information, difficult-to-navigate website, hidden costs or surprise delays, poor rep support.

**In Their Words:**
> "I need a manufacturer partner who makes my job easier — fast pricing, clear specs, reliable delivery, and a rep who understands my market."

> "TableX's website should help me quote projects quickly and give my clients confidence we're spec'ing quality American-made tables."

### 2.2 Manufacturer's Rep (~30% of traffic)

**Profile:** Independent contractor representing TableX in assigned territory. Age 30–65, 3–25+ years in commercial furniture sales, regional territories across North America.

**Key Insight:** Reps push manufacturers that are easiest to sell. Poor TableX performance may lead rep to drop line for competitor.

**Goals:**
- Grow territory sales for all represented manufacturers
- Build strong dealer relationships
- Maximize commission income through volume and new accounts
- Efficiently manage territory — minimize travel waste, maximize face-time

**Pain Points:**
- **Multiple principals** — Managing expectations and quotas from 5–10+ manufacturers simultaneously
- **Dealer mindshare** — Getting specifications at dealerships that rep 30–50+ manufacturers
- **Product knowledge** — Staying current on specs, pricing, lead times across entire portfolio
- **Administrative burden** — Tracking quotes, orders, commissions; manufacturer reporting requirements

**Website Behavior:**
- Devices: Laptop 50%, Tablet 30%, Mobile 20%
- Session flow: Review product pages → Download sales tools → Check lead times → Monitor finishes → Access warranty info and case studies
- Info priorities: (1) Product knowledge, (2) Pricing (with dealer cost/margins), (3) Lead times, (4) Sales tools, (5) Competitive positioning, (6) Case studies

**Website Implications:**
- Rep portal with dealer pricing, lead times, rep-specific resources
- Up-to-date product info — specs, finishes, lead times must be current
- Mobile-friendly — often pulling up products on tablet during dealer visits
- Case studies — selling stories for dealers, proof points by application

**Deal Breakers:** Unresponsive manufacturer support, inaccurate product information, poor dealer pricing, frequent lead time delays, weak marketing presence.

**In Their Words:**
> "I represent TableX because they offer quality American-made tables at competitive prices. But I need them to make my job easier."

> "The easier TableX is to work with, the more I'll push it to my dealers."

### 2.3 Individual Customer (~10% of traffic)

**Profile:** Small business owner, home office professional, or nonprofit buyer. Age 28–65, no commercial furniture industry experience, urban/suburban.

**Key Insight:** This segment loses to consumer brands (IKEA, Wayfair) not on product quality — but on purchase friction and pricing opacity.

**Goals:**
- Find professional-quality tables without going through a dealer
- Understand pricing without needing to request a quote
- Confirm product suitability for their specific use case
- Minimize complexity — straightforward buying process

**Pain Points:**
- **Dealer gatekeeping** — Forced through dealer channel, adding friction for small orders
- **Opaque pricing** — "Request a quote" model frustrates buyers used to e-commerce
- **Complex configurations** — Don't understand base types, laminate grades, powdercoat codes
- **Sticker shock** — Need to understand why commercial costs 2–3x consumer alternatives

**Website Behavior:**
- Devices: Mobile 50%, Desktop 40%, Tablet 10%
- Session flow: Discovery via search → Browse categories → Compare with competitors → Deep dive on 2–3 products → Hit "request quote" wall → Abandon or reluctantly search for dealer
- Info priorities: (1) Pricing (actual prices!), (2) Product suitability, (3) Size/dimensions, (4) Finish options, (5) Lead times, (6) Purchase process

**Website Implications:**
- Pricing visibility — even "starting at $X" gives budget confidence
- Simplified product selection — use case navigation: "Home Office" / "Training Room" / "Meeting Space"
- Direct purchase option — enable small orders (1–10 tables) without dealer
- Jargon-free content — simple language, real-world photos, size visualization

**In Their Words:**
> "I just want to know how much it costs and how to buy it. Why do I need to talk to a dealer for 6 tables?"

> "I'm willing to pay more than IKEA prices, but I need to understand what I'm getting for the extra money."

> "I Googled 'commercial training tables' and found TableX, but your website seems like it's only for big corporate buyers."

---

## Part 3: Business Intelligence & Operations

### 3.1 The Current Quoting Process (10 Phases)

The customer journey maps the end-to-end quoting experience from initial need through sales order creation. This analysis reveals the root causes of slow quoting and where automation delivers the most value.

**Phase 1: Customer Identifies Need**
- Actor: Customer
- Time: Days to weeks
- Emotion: Neutral
- End-user realizes they need new tables for a renovation, expansion, or new facility (school, office, conference center, healthcare).

**Phase 2: Research & Discovery**
- Actor: Customer
- Time: 1–2 weeks
- Emotion: Positive
- Customer browses options online, requests catalogs, or visits showrooms. May find TableX through dealer network, web search, or industry referral.
- Pain: No online pricing visibility — must request a quote for any price. Product catalog is overwhelming (9,000+ SKUs) without guided selection.

**Phase 3: Contacts Dealer/Rep**
- Actor: Customer
- Time: 1–3 days
- Emotion: Positive
- Customer reaches out with specific requirements: products, quantities, finishes, delivery timeline.
- Pain: Customer has no visibility into which discount tier they qualify for.

**Phase 4: Dealer Submits Quote Request**
- Actor: Dealer/Rep
- Time: 30 minutes
- Emotion: Neutral
- Dealer emails TableX with product specifications — SKU, quantity, finish, delivery location. No standardized form; details arrive in freeform email.
- Pain: No standardized request form — freeform emails lead to missing info and back-and-forth. Dealer doesn't know correct SKU format — may specify wrong product.

**Phase 5: Request Intake & Logging** *(First data entry)*
- Actor: TableX Staff
- Time: 10–15 minutes
- Emotion: Negative
- Staff receives email and manually logs the request into the Quote Queue spreadsheet. Every field is typed by hand: date, dealer info, products, status.
- Pain: **100% manual data entry from email to spreadsheet — no automation.** Quote Queue spreadsheet is disconnected from all other systems.
- Evidence: 12,338 manual re-entries/year across 5 disconnected spreadsheets.

**Phase 6: Price Lookup & Calculation**
- Actor: TableX Staff
- Time: 30–60 minutes per quote
- Emotion: Very Negative
- Staff searches the 9,000+ row Quote Table spreadsheet for each requested SKU, looks up the correct price at the dealer's discount tier, and calculates totals manually.
- Pain: **Manual search through 9,000+ row spreadsheet for each SKU.** No validation — wrong SKU or tier goes unnoticed until customer complains. Special quotes require deep product knowledge — MAF handles 46% alone (key-person risk).

**Phase 7: Quote Document Generation** *(Second data entry)*
- Actor: TableX Staff
- Time: 30–45 minutes per quote
- Emotion: Very Negative
- Staff re-enters ALL data a second time into the MAF/NET Quote Template — customer info, each line item, pricing, freight, totals. Formats the document as a professional PDF.
- Pain: **Complete re-entry of all data already in Quote Queue — pure duplication.** 617 staff hours/year wasted on re-entry. Manual freight zone lookup. No template auto-population.

**Phase 8: Quote Delivery**
- Actor: TableX Staff
- Time: 5 minutes
- Emotion: Neutral
- Staff exports the completed quote as PDF and emails it to the dealer/rep. No tracking of when it was opened or reviewed.

**Phase 9: Customer Review & Decision**
- Actor: Customer
- Time: 1–7 days
- Emotion: Negative
- Customer/dealer reviews the quote. May request revisions to quantities, products, or pricing.
- Pain: **13.3% revision rate** means re-doing the entire quote generation process (475 quotes require rework per cycle). No self-service revision — every change requires email back-and-forth.

**Phase 10: Sales Order Creation** *(Third data entry)*
- Actor: TableX Staff
- Time: 20–30 minutes
- Emotion: Very Negative
- If accepted, staff manually re-enters ALL quote data a third time into the Sales Order form. Same customer info, same line items, same pricing — typed from scratch again.
- Pain: **Third complete re-entry of identical data.** No link between quote and sales order — acceptance is a manual handoff.

**Moments of Truth:**
1. Price accuracy determines customer trust — errors damage the relationship (Phase 6)
2. Speed of revision response determines if the deal is won or lost (Phase 9)
3. Ease of requesting a quote determines first impression of TableX (Phase 4)

**Core Insight:** *"The CPQ must eliminate fear of pricing errors through automated validation and rules enforcement. This is the core value prop — not just speed, but confidence."* Staff member Sam is "incredibly slow on quotes" — the root cause is the quoting procedure has so many steps that people are afraid of making a pricing error.

### 3.2 Quote Queue Analysis

**Volume:** 3,637 quotes analyzed from February 2023 to present (pulled from the `2026 QUOTE QUEUE.xlsx` source document, seeded into Supabase as `quote_queue` table).

Key metrics tracked per quote: row number, email source, date/time, quote number (format: YY.INITIALS.DATE-REV), dealer/project name, special flag, assigned staff member, status, and normalized status.

The Quote Queue is the central tracking document but exists as a standalone Excel spreadsheet disconnected from the Quote Table (pricing), Quote Template (document generation), and Sales Order forms.

### 3.3 SKU System

TableX uses a structured SKU encoding system with the following components:

**Format:** `[SP][SS][SH][DDDD][BASE][WIDTH][-OPTIONS]`

| Component | Example | Description |
|-----------|---------|-------------|
| Special prefix | SP | Optional — indicates special/custom order |
| Series (2 digits) | 99 | Product series code (00=Ultra, 06=Stretch, 08=Elite, etc.) |
| Shape (2 letters) | SQ | Table shape (SQ=Square, RE=Rectangle, RD=Round, etc.) |
| Size (4 digits) | 3030 | Dimensions in inches (width x depth) |
| Base (letters+digits) | QD16 | Base type and width (QD=Quad Disc, T=T-Leg, X=X-Base, etc.) |
| Options (after hyphen) | -3P | Suffix options (3P=3-post, LC=Locking Casters, etc.) |

**Example:** `99SQ3030QD16-3P` = Surge series, Square, 30x30", Quad Disc 16" base, 3-post configuration

**Scale:** 6,098 SKUs across 23+ series and 13 shape types. The SKU registry maps series codes, shape codes, base codes, and option suffixes. Compatibility matrices derived from these 6,098 valid SKU combinations define which shapes work with which bases at which sizes.

### 3.4 Product Catalog Sample

The full catalog contains 6,098 entries stored in Supabase (`product_catalog` table) with pricing across 5 discount tiers:

| Tier | Discount Structure | Target Buyer |
|------|-------------------|--------------|
| List Price | Full price (MSRP) | Individual buyers |
| 50/20 | 50% off list, then 20% off | Standard dealer |
| 50/20/5 | 50/20 then additional 5% | Volume dealer |
| 50/20/10 | 50/20 then additional 10% | Major account |
| 50/20/15 | 50/20 then additional 15% | Strategic partner |
| 50/20/20 | 50/20 then additional 20% | Top-tier partner |

Each SKU record includes: tag, quantity, SKU code, series, individual cost components (top cost, route cost, base cost, nest/fold cost, assembly cost, LF cost, freight-in cost, packaging cost), total cost, freight out percentage, gross profit margin, commission rate, standard price, net profit, list price, discount factor, net price, and new net profit.

### 3.5 Finish Options

**Powder Coat Colors (31 standard colors for metal bases):**
Black, White, Silver, Charcoal, Slate, Pewter, Graphite, Titanium, Platinum, Sandstone, Desert Tan, Warm Beige, Camel, Bronze, Copper, Burgundy, Cranberry, Cardinal, Fire Red, Orange, Sunset, Lemon, Sage, Forest, Hunter Green, Teal, Navy, Royal Blue, Sky Blue, Lavender, Plum

Plus Chrome as a separate finish category.

**Top Surface Materials:**
- **HPL** (High Pressure Laminate) — White, Gray, Charcoal, Linen, Fog
- **TFL** (Thermally Fused Laminate) — Natural Maple, Honey Oak, Cherry, Walnut, Espresso
- **Solid Surface** — White, Gray
- **Butcher Block** — Natural, Walnut

**Edge Types (8):**
Self Edge, T-Mold, Urethane Band, Wood Bullnose, Vinyl Bullnose, Rubber T-Mold, Phenolic, No Edge

### 3.6 Freight Zones

Shipping costs are determined by 5 zones based on delivery state and order total:

| Zone | States | < $3K | > $3K | > $5K | > $7.5K | > $10K |
|------|--------|-------|-------|-------|---------|--------|
| 1 | IL, IN, KY, MI, OH, TN, WV | $200 | FREE | FREE | FREE | FREE |
| 2 | AL, AR, DE, GA, IA, MD, MN, MO, MS, NC, PA, SC, VA, WI | $300 | $200 | FREE | FREE | FREE |
| 3 | CT, FL, KS, LA, MA, ME, ND, NE, NH, NJ, NY, OK, RI, SD, TX, VT | $350 | $300 | $200 | FREE | FREE |
| 4 | AZ, CO, NM, UT, WY | $400 | $350 | $300 | $200 | FREE |
| 5 | CA, ID, MT, NV, OR, WA | Quote | Quote | Quote | Quote | Quote |

Zone 1 (Midwest, closest to manufacturing) gets the best rates. Zone 5 (West Coast) always requires a custom freight quote. All zones get free shipping above a threshold that varies by distance.

---

## Part 4: CPQ Gap Analysis

### 4.1 Rules Matrix Summary

**39 total CPQ rules identified** across 6 categories:

| Status | Count | Description |
|--------|-------|-------------|
| Done | 1 | Fully implemented |
| Partial | 9 | Data exists but not codified as validation rules |
| Missing | 29 | Not yet built or awaiting data |

**Overall completion: ~14.1%**

**Rules by Category:**

1. **Table Tops (5 rules)** — 0 done, 4 partial, 1 missing. Shape codes and size grids extracted from SKU data, but configurator UI and validation logic not yet built. Custom sizing rule (price at next standard size up) documented but rounding logic unconfirmed.

2. **Laminates (6 rules)** — 0 done, 0 partial, 6 missing. Entirely blocked on DATA REQUEST #1 (laminate catalog with names, codes, manufacturers, tier assignments). Also need edge band availability data (4 statuses: in stock / partial roll / full roll / not available) and per-linear-foot pricing.

3. **Bases (4 rules)** — 1 done, 2 partial, 1 missing. Base type codes (T22, D20, QD20, X32, etc.) fully extracted from SKU data. Compatibility with tops inferable but not codified. Physical attributes (weight, footprint, capacity) not yet available.

4. **Powder Coating (4 rules)** — 0 done, 0 partial, 4 missing. Blocked on DATA REQUEST #3 (full color list with hex values, per-base restrictions, scratch-resistant flags for adjustable height inner tubes).

5. **Feet (4 rules)** — 0 done, 1 partial, 3 missing. Option codes exist in SKU data but compatibility rules, pricing differences, and height impact data all needed.

6. **CPQ Flow — 9-Step Configurator (9 rules)** — 0 done, 0 partial, 9 missing. The entire guided configurator workflow needs to be built: (1) Select Base → (2) Filter Shapes → (3) Filter Sizes → (4) Validate Anti-Sag Bar → (5) Select Laminate Tier → (6) Apply Edge Band Logic → (7) Select Paint → (8) Select Feet → (9) Calculate Price.

### 4.2 Core Architecture Decision

> **"It's SKU-based with rules and exceptions."**
> — Danny's framing, confirmed by Brian Craig, Feb 10, 2026

This supersedes Brian's earlier Feb 6 statement that suggested a SKU-driven CPQ would be hard. Brian is only 6 weeks in at TableX — his original statement conflated the specialty "binder" process with standard quoting. Mark's Configura demo validates the SKU+rules model.

**Keep from current system:**
- Discount tiers (50/20 through 50/20/20 — 5 tiers)
- Freight zone logic (5 zones by state)
- CRM / Organizations
- Quote storage + Supabase backend
- Auth + role system (admin/contributor)
- Analytics dashboard (all 8 pages)
- SKU decoder (legacy reference)

**Must replace or rework:**
- ProductSelector → full configurator (shape → size → base → laminate → edge → paint → feet)
- Pricing → dynamic calculation from rules, not static lookup
- Line items → must store full configuration detail, not just SKU + quantity
- 5-step linear wizard → SKU-based configurator with rules & exceptions

### 4.3 Seven Data Gaps

| # | Gap | Priority | Status | What's Blocked |
|---|-----|----------|--------|----------------|
| 1 | Laminate catalog + tiers | HIGH | Requested | Laminate selection, tier pricing logic |
| 2 | Edge band availability | HIGH | Requested | Edge pricing, availability validation, spoilage calc |
| 3 | Powder coat colors + restrictions | MEDIUM | Requested | Color palette, per-base restrictions, adj. height rules |
| 4 | Anti-sag bar thresholds | MEDIUM | Requested | Threshold values, mandatory enforcement |
| 5 | Feet options + compatibility | LOW | Requested | Compatibility validation, pricing |
| 6 | Base physical attributes | LOW | Requested | Visual specs display, weight capacity validation |
| 7 | Custom size pricing rule | LOW | Requested | "Round up" pricing logic |

### 4.4 Six Architecture Gaps

1. **Rules Engine** — Does not exist. Needed for compatibility validation, auto-add logic, constraint enforcement. Options: Client-side JS, Supabase edge functions, DB stored rules, or hybrid.

2. **Configurator UI** — Does not exist as a full CPQ. Needed: 9-step guided flow where each step filters based on previous selections. Options: Wizard with step validation, single-page progressive disclosure, or split panel (config + preview).

3. **Dynamic Pricing Engine** — Currently static lookup from 6,098 pre-calculated SKUs. Needed: Calculate price from components (top + base + laminate + edge + paint + feet + ASB). Options: Client-side, server-side edge function, or hybrid with caching.

4. **Order Entity** — Does not exist. Needed: Quote → Order conversion with status tracking. Brian: "1 click conversions are a must." Options: Simple (quote → order) or full pipeline (quote → approved → ordered → shipped → complete).

5. **Line Item Schema** — Currently SKU + quantity + price only. Needed: Full configuration detail per line (shape, size, base, laminate, edge, paint, feet, ASB). Options: JSON config column, expanded columns, or separate config table.

6. **Persona System** — Currently admin + contributor roles only. Needed: Designer + Rep + End User personas with pricing visibility tied to persona. Designers configure but don't see pricing. Reps see full confidential pricing. End users see none.

### 4.5 Ten Pending Decisions

1. Where do rules live? (Client JS / Supabase edge / DB stored / Hybrid)
2. How do personas map to auth roles? (Extend roles / Separate field / Both)
3. Configura/Spec integration? (API / Data import / Link out / Ignore for now)
4. Custom size rounding logic? (Round by area / next length / next width / Ask Brian)
5. Order workflow stages? (Simple / Full pipeline)
6. Line item config storage? (JSON column / Expanded columns / Separate table)
7. Who sees pricing? (Persona-based / Role-based / Feature flag / URL param)
8. What role do existing 6,098 SKUs play? (Reference / Fallback pricing / Validation / Deprecated)
9. Quote PDF format for CPQ? (Keep current / Redesign / Multiple per persona)
10. Configura data format? (pCon / CET / XML / Need to learn from Mark)

### 4.6 WordPress Quote Form → CPQ Mapping

The existing WordPress quote form (Gravity Forms Form #7, 1,133 entries) has 42 fields organized into 6 sections. Analysis of how each field maps to the CPQ system:

| Status | Count | Description |
|--------|-------|-------------|
| Mapped | 7 | Field exists in CPQ and is functionally equivalent |
| Partial | 13 | Field exists but needs enhancement |
| Unmapped | 12 | Field has no CPQ equivalent yet |
| Deprecated | 2 | Field should not exist in new system |

**Critical UX Problems with Current Form (10 identified):**

1. **Single mega-form with no steps** (Critical) — All 42 fields on a single scrolling page. No progress indicator, no step-by-step guidance.
2. **No visual feedback or product imagery** (Critical) — Zero product images, no shape previews, no finish swatches, no 3D preview.
3. **No pricing feedback during configuration** (Critical) — Form collects configuration but provides zero cost indication. User submits blind, then waits for manual pricing.
4. **Free-text fields where structured input is needed** (Critical) — Top Size, HPL Selection, Solid Surface Selection, Grommet Location, Power Configuration, and Power Unit Location all accept arbitrary text.
5. **No compatibility validation** (High) — Users can select any base with any top shape/size. No rules prevent impossible combinations.
6. **No saved configurations or quote history** (High) — Each submission is one-off. No draft/revision workflow.
7. **No conditional logic for accessory dependencies** (Medium) — All accessories shown regardless of base/top selection.
8. **No mobile optimization** (Medium) — 42-field form impractical on phones/tablets.
9. **Binary Yes/No toggles for feature-rich options** (Medium) — No explanation of what options mean, no images, no pricing implications.
10. **No confirmation or summary before submission** (Medium) — Form submits directly with no review step.

**Critical Data Quality Issues:**
- Free-text dimension input: Users type "24x48", "24 x 48", "24\"x48\"", "2'x4'", "24W x 48L" — all for the same size
- Free-text laminate specification: "Wilsonart D354-60", "Grey Nebula", "like the one at Marriott lobby"
- Product names don't match SKU codes: WP form says "Ultra", SKU registry says "00"
- Shape option mismatch: WP form has 12 shapes, SKU registry has 15, compatibility matrix has 34

### 4.7 CPQ Recommendations (12)

**Critical Priority:**
1. Implement multi-step configuration wizard (9 steps matching CPQ flow)
2. Replace free-text fields with structured inputs
3. Add real-time pricing feedback (persona-based visibility)

**High Priority:**
4. Add visual product imagery and finish swatches
5. Enforce compatibility rules in real-time
6. Create base series name mapping table

**Medium Priority:**
7. Add order timeline fields (expected order date, requested delivery date)
8. Add file attachment support for quotes
9. Build unified shape and option catalogs
10. Implement saved configurations and quote duplication
11. Add height adjustment mechanism configurator (8 types)

**Low Priority:**
12. Add review/summary step before quote submission

---

## Part 5: 3D Table Configurator

### 5.1 Pipeline & Status

A complete 3D visualization pipeline was built to convert TableX's engineering CAD files into web-ready 3D models:

**Pipeline:** DWG → DXF (via ODA File Converter) → GLB (via Python ezdxf+trimesh)

**11 series converted — 2,920 GLB models in Supabase Storage:**

| Series | Code | Models |
|--------|------|--------|
| Ultra | 00 | 81 |
| Stretch | 06 | 279 |
| Elite | 08 | 367 |
| Foundation | 30 | 309 |
| Fundamental | 33 | 309 |
| Justice | 40 | 100 |
| Primary | 44 | 300 |
| Puddle | 45 | 55 |
| Exclaim | 71 | 215 |
| VertiGO | 74 | 579 |
| Surge | 99 | 326 |

**Not yet converted** (require different conversion approach due to xref/3DSOLID geometry): Artisan (43), Element, App.

### 5.2 3D Viewer Architecture

The interactive 3D viewer uses React Three Fiber with physically-based rendering (PBR):

- **MeshPhysicalMaterial** with category-aware recipes for realistic material appearance (clearcoat for paint, sheen for wood, environment map intensity per category)
- **Environment preset="city"** from drei — selected after testing revealed "studio" preset has harsh overhead softboxes that blow out flat tabletop surfaces
- **22 CC0 textures** from ambientCG for wood grains, normal maps
- **Material swapping** — base finish recolors legs, top color recolors tabletop surface, edge type mapped to edge geometry
- **Size filtering** — dropdown shows only valid sizes per shape, with auto-select cascade
- **Contact shadows** for realistic ground shadows
- **Box-projected UVs** generated at runtime since GLBs from trimesh lack UV coordinates
- Camera positioned at `[1.8, 0.7, 1.2]` (side angle to avoid top-surface hotspot)
- Z-up → Y-up rotation fix + bounding-box floor alignment

### 5.3 Configurator Features

The web-based configurator at `/configurator` provides:
- Series selector (11 series with 3D models)
- Shape selector (filtered by series availability)
- Size selector (filtered by shape availability, auto-cascading)
- Base finish picker (31 powder coat colors + chrome, with real-time 3D material update)
- Top surface material picker (HPL, TFL, solid surface, butcher block, with texture preview)
- Edge type selector (8 options with material mapping)
- Quantity input
- Quote request modal (contact form + configuration summary)

---

## Part 6: Quote Request Pipeline

### 6.1 Configurator → Quote Request Flow

The dashboard implements a complete quote request pipeline from the 3D configurator to a Supabase-backed request management system:

1. User configures a table in the 3D configurator (series, shape, size, finishes, edges)
2. User enters quantity
3. User clicks "Request Quote" which opens a modal with:
   - Contact information form (name, email, phone, company)
   - Configuration summary card showing all selected options
4. On submit, the request is stored in the Supabase `quote_requests` table with an auto-generated request number (RQ-100, RQ-101, etc.)

**Status Workflow:** pending → in_progress → quoted → closed

**Quote Requests Management Page** (`/quote/requests`):
- TanStack table with search and filtering
- Expandable rows showing full configuration details
- Inline status dropdown for updating request status
- RLS: authenticated users can SELECT/INSERT, admin-only UPDATE/DELETE

---

## Part 7: What Needs to Change — Summary

### 7.1 The Business Case for a Bespoke CPQ

The current process has quantifiable waste:
- **617 hours/year** wasted on manual data re-entry (triple-entry of identical data)
- **12,338 manual re-entries/year** across 5 disconnected spreadsheets
- **13.3% revision rate** requiring complete quote regeneration
- **Key-person risk:** MAF handles 46% of all special quotes
- **6+ disconnected touchpoints** with no data flow between them
- **Staff paralysis:** Fear of pricing errors slows quoting more than the process itself

### 7.2 What the New System Must Deliver

1. **Single source of truth** — One system for configuration, pricing, quoting, and order management
2. **Guided configuration** — 9-step wizard with compatibility enforcement that prevents invalid combinations
3. **Dynamic pricing** — Real-time calculation from components, not static spreadsheet lookup
4. **Persona-based access** — Designers see configuration only; Reps see full confidential pricing; End users see configuration only
5. **One-click conversion** — Quote → Sales Order with zero re-entry
6. **Visual configurator** — 3D preview with material swapping (foundation already built with 2,920 models)
7. **Self-service revisions** — Dealers can modify configurations without email back-and-forth
8. **Freight automation** — Auto-calculate shipping based on delivery state and order total
9. **CRM integration** — Organization/contact lookup to auto-populate customer information
10. **Quote tracking** — Status tracking from draft through delivered, with version history

### 7.3 What's Already Built

The research and prototyping phase has produced:
- Complete SKU parsing and registry system (6,098 SKUs decoded)
- Compatibility matrices derived from all valid SKU combinations
- 3D model pipeline with 2,920 GLBs across 11 series
- Interactive 3D configurator with PBR materials and real-time finish swapping
- Finish catalog (31 powder coats, HPL, TFL, solid surface, butcher block, 8 edge types)
- CRM with organizations and contacts
- Quote builder with multi-line-item support
- Quote PDF generation
- Freight zone calculator
- Quote request pipeline from configurator
- Full analytics dashboard with 10+ analysis views

---

*This document was generated from the TableX Quoting Dashboard application, which ingests and visualizes data from TableX's operational spreadsheets, WordPress site audit, and real-time Supabase database. All statistics cited are derived from actual company data verified accurate as of February 2026.*
