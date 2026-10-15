/**
 * Staging review checklist (/project/staging-review): the SpeX Studio catalog
 * changes from Brian's "SpeX Studio Series Action Tracker" plus the new Sales
 * Orders flow, both on https://staging.tablex.com for the Oct 19–25 test week.
 *
 * Static content. The SpeX groups between the generated markers below are
 * written by `node scripts/build-spex-review-items.ts` from the reconciliation
 * report (tablex-site `docs/reports/2026-10-14-spex-action-tracker.md`); do not
 * hand-edit that region, re-run the script. The ORDERS group is hand-written.
 *
 * Working state (reviewed / notes) lives in Supabase (migration 028,
 * meeting_finding_checks / meeting_finding_notes) keyed by
 * `${SPEX_REVIEW_MEETING_KEY}:${item.id}`. Item ids are stable; never renumber.
 */

export const SPEX_REVIEW_MEETING_KEY = "spex-review-2026-10";

export function spexReviewKey(itemId: string): string {
  return `${SPEX_REVIEW_MEETING_KEY}:${itemId}`;
}

export const STAGING_ORIGIN = "https://staging.tablex.com";

/**
 * Build outcome per the 10/14 reconciliation report, plus `review` for items
 * that simply need Sam's eyes (the Sales Orders walkthrough).
 */
export type SpexReviewStatus =
  | "done"
  | "done-unpriced"
  | "conflict"
  | "done-already"
  | "needs-mark"
  | "out-of-scope"
  | "review";

/** Builder lane from the report: A picker, B add-ons, C catalog, D power & data. */
export type SpexReviewOwner = "A" | "B" | "C" | "D";

export interface SpexReviewItem {
  /** Stable id (SURGE-04, REF-01, ORD-03). The check/notes key. */
  id: string;
  /** The request, verbatim from the tracker's column A (or the checklist line). */
  request: string;
  owner?: SpexReviewOwner;
  status: SpexReviewStatus;
  /** What was built, or what to check. */
  outcome: string;
  /** Where the price came from (October book row, Mark's email). */
  priceSource?: string;
  /** Staging page that shows this item. */
  deepLink?: string;
}

export interface SpexReviewLink {
  label: string;
  href: string;
}

export interface SpexReviewGroup {
  /** Stable slug (all-pages, surge, ref, orders). */
  id: string;
  /** Tab name in the source tracker, where there is one. */
  tab?: string;
  title: string;
  /** First link is the group's "Open on staging" button. */
  links: SpexReviewLink[];
  items: SpexReviewItem[];
}

// @generated-start (scripts/build-spex-review-items.ts)
export const SPEX_TRACKER_GROUPS: SpexReviewGroup[] = [
  {
    id: "all-pages",
    tab: "ALL PAGES",
    title: "All Pages",
    links: [
      { label: "SpeX Studio", href: "https://staging.tablex.com/spex-studio" },
    ],
    items: [
      {
        id: "ALL-01",
        request: "Top size should come before base style.  Should go Shape, Size, Base Style",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-02",
        request: "Edge band should come after Top Finish.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-03",
        request: "Instead of starting SpeX Studio with Series could we start with a dropdown: Full Table, Top Only, Base Only, Accessories Only.  Then they would pick series and so forth.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-04",
        request: "For Base Only Options - Anything height adjustable will need to have the customer input the top size and weight of the top in order for us to put the proper spring inside the base.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-05",
        request: "Add more power options - Mark will get you information.",
        owner: "D",
        status: "done",
        outcome: "Closed by Mark 10/15: the October Power & Data rows are the set. Built from those rows.",
        priceSource: "ADD ONS Power & Data block (Byrne, Dekko lists)",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-06",
        request: "Locking Casters are $117 not $111",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"2\" / 3\" Locking Casters (Black)\" $117 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-07",
        request: "Sometimes Nesting and Folding are listed under Base and other times are listed under Mechanism.  They should always be under Base.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-08",
        request: "Wire management door on leg is $146 per column and not $139",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Built-In Wire Management Door (side of leg)\" $146 per column",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-09",
        request: "Add marker board laminate.  BRIGHT WHITE.  Upcharge is $111 above CORE pricing.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Markerboard Laminates\" $111 per top",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-10",
        request: "For any table that offers modesty panels, add metal modesty panels in accessories for all table 48\", 60\", & 72\".  All panels are 9\" H.  Upcharge $540 (48), $572 (60), $603 (72)",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (metal modesty 547 / 579 / 611).",
        priceSource: "\"Perforated Metal Modesty Panels\" 9x48 $547 / 9x60 $579 / 9x72 $611",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-11",
        request: "Any Base Style listed as Counter Balance should be listed as Pneumatic. Short Balance will stay the same.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-12",
        request: "All Add On Pricing is listed in the Master Pricing Spreadsheet under Add Ons",
        owner: "B",
        status: "out-of-scope",
        outcome: "Unchanged, rule statement only.",
        priceSource: "ADD ONS tab",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-13",
        request: "Power and Data Needs to come out of Accessories and be its own section.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-14",
        request: "Villa Options that are currently listed DO NOT include an infeed cable in the $466 list price but notes indicate that it is included.",
        owner: "D",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Dekko Villa Daisylink Kits: 2 Power + 2 KO\" $466 plus \"Dekko Villa Daisylink 20/15 AMP Plug Infeed (72\")\" $231 or \"Hardwire Infeed (72\")\" $184",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-15",
        request: "If Daisy link is chosen, TableX will contact the customer to verify and confirm configuration.  This will ensure the proper amount of infeeds, splitters, jumper, etc are quoted with the job.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-16",
        request: "Need to add additional Power & Data Units.  All Electrical Units and pricing are listed in the Master Pricing spreadsheet under Add Ons",
        owner: "D",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "ADD ONS Power & Data block, Byrne Pop-Up / Hemisphere / Eclipse / Burele / Trippel, Dekko Villa and Cove Daisylink and Corded kits, plus the accessories lists",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
      {
        id: "ALL-17",
        request: "A disclaimer should be added to the Power & Data section that reads:  When ordering electrical components it is the responsibility of the customer to ensure the components selected meet local electrical codes.",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio",
      },
    ],
  },
  {
    id: "app",
    tab: "APP",
    title: "App",
    links: [
      { label: "App in SpeX", href: "https://staging.tablex.com/spex-studio/app" },
    ],
    items: [
      {
        id: "APP-01",
        request: "Base Styles - Change: Round - 12\" to \"Round - Static\"",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/app",
      },
      {
        id: "APP-02",
        request: "Edge Band - Need Edge Band Color Option",
        owner: "A",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/app",
      },
    ],
  },
  {
    id: "artisan",
    tab: "ARTISAN",
    title: "Artisan",
    links: [
      { label: "Artisan in SpeX", href: "https://staging.tablex.com/spex-studio/artisan" },
    ],
    items: [
      {
        id: "ARTISAN-01",
        request: "Edge Band - Remove Knife Edge Option",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/artisan",
      },
      {
        id: "ARTISAN-02",
        request: "Industrial Locking Casters upcharge is $349 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (industrial casters $350).",
        priceSource: "\"3\" Industrial Locking Casters\" $350 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio/artisan",
      },
      {
        id: "ARTISAN-03",
        request: "Add Magnetic Wire Management Leg Cover. Upcharge $75 per cover. Powder Coated same as base.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Magnetic Wire Management Leg Cover\" $75 each",
        deepLink: "https://staging.tablex.com/spex-studio/artisan",
      },
    ],
  },
  {
    id: "element",
    tab: "ELEMENT",
    title: "Element",
    links: [
      { label: "Element in SpeX", href: "https://staging.tablex.com/spex-studio/element" },
    ],
    items: [
      {
        id: "ELEMENT-01",
        request: "Add Edge Mount as an option for all bases for Rectangle Tops.  Upcharge $80 per table.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Edge Mounted T-bases\" $80 per table",
        deepLink: "https://staging.tablex.com/spex-studio/element",
      },
      {
        id: "ELEMENT-02",
        request: "Add Offset T Base for Rectangle Tops.  Listed in pricer. Not available on 18\" deep tops or 30\" deep nesting tops less than 60\" wide.  Upcharge of $41 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (Offset T $21).",
        priceSource: "\"Offset T-Bases\" $21 per base",
        deepLink: "https://staging.tablex.com/spex-studio/element",
      },
      {
        id: "ELEMENT-03",
        request: "Add Folding T Base.  Listed in Pricer.",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/element",
      },
      {
        id: "ELEMENT-04",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/element",
      },
      {
        id: "ELEMENT-05",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/element",
      },
    ],
  },
  {
    id: "elite",
    tab: "ELITE",
    title: "Elite",
    links: [
      { label: "Elite in SpeX", href: "https://staging.tablex.com/spex-studio/elite" },
    ],
    items: [
      {
        id: "ELITE-01",
        request: "Add Edge Mount as an option for all bases for Rectangle Tops.  Upcharge $80 per table.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Edge Mounted T-bases\" $80 per table",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
      {
        id: "ELITE-02",
        request: "Shapes - Slab should be Squircle",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
      {
        id: "ELITE-03",
        request: "Add Offset T Base for Rectangle Tops.  Listed in pricer. Not available on 18\" deep tops or 30\" deep nesting tops less than 60\" wide.  Upcharge of $41 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (Offset T $21).",
        priceSource: "\"Offset T-Bases\" $21 per base",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
      {
        id: "ELITE-04",
        request: "For Rectangle Tops add - Nesting T & Folding T Base Options to Base Style",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
      {
        id: "ELITE-05",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
      {
        id: "ELITE-06",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
      {
        id: "ELITE-07",
        request: "Add Trestle Base",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/elite",
      },
    ],
  },
  {
    id: "exclaim",
    tab: "EXCLAIM",
    title: "Exclaim",
    links: [
      { label: "Exclaim in SpeX", href: "https://staging.tablex.com/spex-studio/exclaim" },
    ],
    items: [
      {
        id: "EXCLAIM-01",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/exclaim",
      },
      {
        id: "EXCLAIM-02",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/exclaim",
      },
      {
        id: "EXCLAIM-03",
        request: "Base Styles - \"Quad Base - A\", \"Quad Base - X\", and \"Quad Base - V\".  Listed in pricer",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/exclaim",
      },
      {
        id: "EXCLAIM-04",
        request: "Can not do wire management leg that is listed.  Should be magnetic wire management.  Upcharge $75",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Magnetic Wire Management Leg Cover\" $75 each",
        deepLink: "https://staging.tablex.com/spex-studio/exclaim",
      },
      {
        id: "EXCLAIM-05",
        request: "Add chrome to Base Colors.  Should have a disclaimer of a 14 week lead time.  Upcharge of $125 per column. ONLY AVAILABLE ON STANDARD (29\") AND LOUNGE (18\") HEIGHT.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Exclaim Chrome Finish\" $125 per column",
        deepLink: "https://staging.tablex.com/spex-studio/exclaim",
      },
    ],
  },
  {
    id: "foundation",
    tab: "FOUNDATION",
    title: "Foundation",
    links: [
      { label: "Foundation in SpeX", href: "https://staging.tablex.com/spex-studio/foundation" },
    ],
    items: [
      {
        id: "FOUNDATION-01",
        request: "Add Edge Mount as an option for all bases for Rectangle Tops.  Upcharge $80 per table.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Edge Mounted T-bases\" $80 per table",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-02",
        request: "Shapes - Slab should be Squircle",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-03",
        request: "Add Offset T Base for Rectangle Tops.  Listed in pricer. Not available on 18\" deep tops or 30\" deep nesting tops less than 60\" wide.  Upcharge of $41 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (Offset T $21).",
        priceSource: "\"Offset T-Bases\" $21 per base",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-04",
        request: "For Rectangle Tops add - Nesting T & Folding T Base Options to Base Style",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-05",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-06",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-07",
        request: "Add Concealed Casters in Accessories. Upcharge $144/table (standard casters on one side and concealed on other side)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Concealed Casters\" $144 per table (Foundation)",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-08",
        request: "Add Black Plastic Bullnose Cap in Accessories.  No Upcharge",
        owner: "B",
        status: "done-unpriced",
        outcome: "Built, unpriced until Mark adds a book row. Shows 'Quoted with your order'.",
        priceSource: "$0 per tracker; no ADD ONS row",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-09",
        request: "Add Special Height Option",
        owner: "B",
        status: "done-already",
        outcome: "Special height already live, verified.",
        priceSource: "\"Special Height / Over 29 in.\" $76 and \"Under 29 in.\" $41 per column",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
      {
        id: "FOUNDATION-10",
        request: "Add chrome to Base Colors.  Should have a disclaimer of a 14 week lead time.  Upcharge of $137 per base.",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (chrome $69).",
        priceSource: "\"Chrome Finish\" $69 per base (Foundation, Stretch, Primary)",
        deepLink: "https://staging.tablex.com/spex-studio/foundation",
      },
    ],
  },
  {
    id: "justice",
    tab: "JUSTICE",
    title: "Justice",
    links: [
      { label: "Justice in SpeX", href: "https://staging.tablex.com/spex-studio/justice" },
    ],
    items: [
      {
        id: "JUSTICE-01",
        request: "Edge Band - Remove Knife Edge Option",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/justice",
      },
      {
        id: "JUSTICE-02",
        request: "Shapes - Slab should be Squircle",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/justice",
      },
      {
        id: "JUSTICE-03",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/justice",
      },
      {
        id: "JUSTICE-04",
        request: "Add Butcher Block to the Top Finish",
        owner: "C",
        status: "done",
        outcome: "Built; priced 10/15 from the book's Justice butcher block rows (-BB) at standard, counter (36 inch) and bar (42 inch) height. The counter and bar rows include the height, so no special-height charge.",
        priceSource: "Book models 40TC…FR…-BB / -BB-SH.36 / -BB-SH.42 (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/justice",
      },
      {
        id: "JUSTICE-05",
        request: "Industrial Locking Casters upcharge is $349 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (industrial casters $350).",
        priceSource: "\"3\" Industrial Locking Casters\" $350 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio/justice",
      },
      {
        id: "JUSTICE-06",
        request: "Wire Management in leg is not an option.  Should be Magnetic Wire Management Leg Cover. Upcharge $75 per cover.  Powder Coated same as base.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Magnetic Wire Management Leg Cover\" $75 each",
        deepLink: "https://staging.tablex.com/spex-studio/justice",
      },
    ],
  },
  {
    id: "primary",
    tab: "PRIMARY",
    title: "Primary",
    links: [
      { label: "Primary in SpeX", href: "https://staging.tablex.com/spex-studio/primary" },
    ],
    items: [
      {
        id: "PRIMARY-01",
        request: "Add Corner Mount as an option for all bases for Rectangle and Square tops.  Upcharge $78 per table. 2\" Columns Only.",
        owner: "B",
        status: "done",
        outcome: "Corner mount built from book model rows C2COR / QC2COR, base variants CM / QCM.",
        priceSource: "$78 per table per tracker; no ADD ONS row",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-02",
        request: "Shapes - Slab should be Squircle",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-03",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-04",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-05",
        request: "Add chrome to Base Colors.  Should have a disclaimer of a 14 week lead time.  Upcharge of $52 per column.  For disc bases $478 per base.",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (chrome $69, disc chrome $525).",
        priceSource: "\"Chrome Finish\" $69 per base (Foundation, Stretch, Primary); \"Disc Base Chrome Finish\" $525 per base (Primary, Puddle)",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-06",
        request: "Base Style - No C-Frame.  Should be \"Round Column\" and \"Square Column\".",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-07",
        request: "Flip Top should be added to disc bases. All in pricer.",
        owner: "C",
        status: "out-of-scope",
        outcome: "Dropped by Brian 10/15: the base will not nest with a flip top, so it is not offered.",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-08",
        request: "Disc Bases can be Short Balanced and Counter Blanaced.  All in pricer",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-09",
        request: "Add Snap On Wire Management Leg Cover for Round Columns.  Powder Coated the same as base.  Upcharge of $53 per cover.  Not available for Chrome or disc bases.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Wire Management Leg Covers / 2\" Leg Covers\" $53 each",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-10",
        request: "Add footring to accessories for bar height disc bases.  Upcharge $175/ per ring.  Powder coated the same as base.  Not available in chrome.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Footring\" $175 each",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-11",
        request: "Electrical power box is only available for Location F on Square and Round tops - SeperatE Email to come on explanation",
        owner: "B",
        status: "done",
        outcome: "Built as: only with centre power at location F on SQ/RD. Mark 10/15 confirmed PD.F = power box location F (middle centre).",
        priceSource: "\"Powerbox Mounting Plate\" $105 each",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-12",
        request: "Since disc bases require 5 casters, the cost is $147 for casters.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "$147 per tracker; no ADD ONS row. Locking casters are $117 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "PRIMARY-13",
        request: "Remove all Drum Base Options for all applicable top shapes.  These need to be custom quoted even though they are listed in the pricing file.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
    ],
  },
  {
    id: "puddle",
    tab: "PUDDLE",
    title: "Puddle",
    links: [
      { label: "Puddle in SpeX", href: "https://staging.tablex.com/spex-studio/puddle" },
    ],
    items: [
      {
        id: "PUDDLE-01",
        request: "Shapes - Slab should be Squircle",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-02",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-03",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-04",
        request: "Add chrome to Base Colors.  Should have a disclaimer of a 14 week lead time.   For disc bases $500 per base.",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (disc chrome $525).",
        priceSource: "\"Disc Base Chrome Finish\" $525 per base (Primary, Puddle)",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-05",
        request: "Disc Bases can be Short Balanced and Counter Blanaced.  All in pricer",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-06",
        request: "Add Snap On Wire Management Leg Cover.  Powder Coated the same as base.  Upcharge of $83 per cover.  Not available for Chrome.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Wire Management Leg Covers / 3\" Leg Covers\" $83 each",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-07",
        request: "Add footring to accessories for bar height disc bases.  Upcharge $175/ per ring.  Powder coated the same as base.  Not available in chrome.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Footring\" $175 each",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-08",
        request: "Electrical power box is only available for Location F on Square and Round tops - Seperate Email to come on explanation",
        owner: "B",
        status: "done",
        outcome: "Built as: only with centre power at location F on SQ/RD. Mark 10/15 confirmed PD.F = power box location F (middle centre).",
        priceSource: "\"Powerbox Mounting Plate\" $105 each",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
      {
        id: "PUDDLE-09",
        request: "Since disc bases require 5 casters per base, the cost is $147 per base for casters.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "$147 per base per tracker; no ADD ONS row. Locking casters are $117 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio/puddle",
      },
    ],
  },
  {
    id: "solo",
    tab: "SOLO",
    title: "Solo",
    links: [
      { label: "Solo in SpeX", href: "https://staging.tablex.com/spex-studio/solo" },
    ],
    items: [
      {
        id: "SOLO-01",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/solo",
      },
      {
        id: "SOLO-02",
        request: "Change Flip Top options to Flip/Tilt",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/solo",
      },
      {
        id: "SOLO-03",
        request: "Add pencil stop to accessories. Upcharge $32.  NOT AVAILABLE WITH KNIFE EDGE.",
        owner: "B",
        status: "done-unpriced",
        outcome: "Built, unpriced until Mark adds a book row. Shows 'Quoted with your order'.",
        priceSource: "$32 per tracker; no ADD ONS row",
        deepLink: "https://staging.tablex.com/spex-studio/solo",
      },
      {
        id: "SOLO-04",
        request: "Add 2\" Black locking casters, Upcharge $117",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"2\" / 3\" Locking Casters (Black)\" $117 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio/solo",
      },
      {
        id: "SOLO-05",
        request: "Remove power as an accessory",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/solo",
      },
      {
        id: "SOLO-06",
        request: "Remove modesty panel as an accessory",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/solo",
      },
    ],
  },
  {
    id: "stretch",
    tab: "STRETCH",
    title: "Stretch",
    links: [
      { label: "Stretch in SpeX", href: "https://staging.tablex.com/spex-studio/stretch" },
    ],
    items: [
      {
        id: "STRETCH-01",
        request: "Add Edge Mount as an option for all bases for Rectangle Tops.  Upcharge $80 per table.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Edge Mounted T-bases\" $80 per table",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-02",
        request: "Shapes - Slab should be Squircle",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-03",
        request: "Add Offset T Base for Rectangle Tops.  Listed in pricer. Not available on 18\" deep tops or 30\" deep nesting tops less than 60\" wide.  Upcharge of $41 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (Offset T $21).",
        priceSource: "\"Offset T-Bases\" $21 per base",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-04",
        request: "For Rectangle Tops add - Nesting T & Folding T Base Options to Base Style",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-05",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-06",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-07",
        request: "Add Snap On Wire Management Leg Cover.  Powder Coated the same as base.  Upcharge of $53 per cover.  Not available for Chrome.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Wire Management Leg Covers / 2\" Leg Covers\" $53 each",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-08",
        request: "Add chrome to Base Colors.  Should have a disclaimer of a 14 week lead time.  Upcharge of $137 per table.",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (chrome $69).",
        priceSource: "\"Chrome Finish\" $69 per base (Foundation, Stretch, Primary)",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
      {
        id: "STRETCH-09",
        request: "Electrical power box is only available for Location F on Square and Round tops - Seperate Email to come on explanation",
        owner: "B",
        status: "done",
        outcome: "Built as: only with centre power at location F on SQ/RD. Mark 10/15 confirmed PD.F = power box location F (middle centre).",
        priceSource: "\"Powerbox Mounting Plate\" $105 each",
        deepLink: "https://staging.tablex.com/spex-studio/stretch",
      },
    ],
  },
  {
    id: "surge",
    tab: "SURGE",
    title: "Surge",
    links: [
      { label: "Surge in SpeX", href: "https://staging.tablex.com/spex-studio/surge" },
    ],
    items: [
      {
        id: "SURGE-01",
        request: "Add Edge Mount as an option for all bases for Rectangle Tops.  Upcharge $80 per table.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Edge Mounted T-bases\" $80 per table",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-02",
        request: "Add Offset T Base for Rectangle Tops.  Listed in pricer. Not available on 18\" deep tops or 30\" deep nesting tops less than 60\" wide.  Upcharge of $41 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (Offset T $21).",
        priceSource: "\"Offset T-Bases\" $21 per base",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-03",
        request: "Add Folding T Base.  Listed in Pricer.",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-04",
        request: "Add Radius Corners unders accessories for all Rectangle and Square top options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-05",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-06",
        request: "Add Counterbalance to Base Style for Round and Square. Listed in Pricer",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-07",
        request: "Add Flip Top for Base Style for Round and Square. Listed in Pricer",
        owner: "C",
        status: "done",
        outcome: "Built 10/15 from Brian's updated October workbook: X-base Flip Top on Square, Round and Squircle (11 rows). 3D shows the standard base.",
        priceSource: "Book models 99SQ2424X22FT … 99SL42X34FT (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-08",
        request: "Electrical power box is only available for Location F on Square and Round tops - Seperate Email to come on explanation",
        owner: "B",
        status: "done",
        outcome: "Built as: only with centre power at location F on SQ/RD. Mark 10/15 confirmed PD.F = power box location F (middle centre).",
        priceSource: "\"Powerbox Mounting Plate\" $105 each",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-09",
        request: "Remove Wire Management Leg from Accessories",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-10",
        request: "Add Snap On Wire Management Leg Cover.  Powder Coated the same as base.  Upcharge of $83 per cover.  Not available for Chrome.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Wire Management Leg Covers / 3\" Leg Covers\" $83 each",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-11",
        request: "Add Round Disc in Base Style for Square top options",
        owner: "C",
        status: "done",
        outcome: "Built 10/15 from Brian's updated October workbook: Round Disc under Square and Squircle tops. 3D shows the standard base.",
        priceSource: "Book models 99SQ…D20/D24, 99SL…D20/D24 (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-12",
        request: "Add Square Disc in Base Style for Round top options",
        owner: "C",
        status: "done",
        outcome: "Built 10/15 from Brian's updated October workbook: Square Disc under Round and Squircle tops. 3D shows the standard base.",
        priceSource: "Book models 99RD…QD16/QD20/QD26, 99SL…QD (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-13",
        request: "Add Squircle Disc in Base Style for both Square & Round top options",
        owner: "C",
        status: "done",
        outcome: "Built 10/15 from Brian's updated October workbook: Squircle Disc under Square and Round tops. 3D shows the standard base.",
        priceSource: "Book models 99SQ…SD, 99RD…SD (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
      {
        id: "SURGE-14",
        request: "For Rectanglular tops, add the Double Column Rectangular Disc for 24x36, 24x48, 30x36,30x48, 36x48, 30x60 (Mark will get pricing for 30x60 option…all others are in pricer)",
        owner: "C",
        status: "done",
        outcome: "Label and Mark's five sizes built. 30x60 pending Mark.",
        deepLink: "https://staging.tablex.com/spex-studio/surge",
      },
    ],
  },
  {
    id: "trig",
    tab: "TRIG",
    title: "Trig",
    links: [
      { label: "Trig in SpeX", href: "https://staging.tablex.com/spex-studio/trig" },
    ],
    items: [
      {
        id: "TRIG-01",
        request: "Add Radius Corners unders accessories for all Rectangle and Square top options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/trig",
      },
      {
        id: "TRIG-02",
        request: "Change Flip Top options to G-Flip/Tilt",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/trig",
      },
      {
        id: "TRIG-03",
        request: "Add pencil stop to accessories. Upcharge $32.  NOT AVAILABLE WITH KNIFE EDGE.",
        owner: "B",
        status: "done-unpriced",
        outcome: "Built, unpriced until Mark adds a book row. Shows 'Quoted with your order'.",
        priceSource: "$32 per tracker; no ADD ONS row",
        deepLink: "https://staging.tablex.com/spex-studio/trig",
      },
      {
        id: "TRIG-04",
        request: "3\" Locking Casters cost is $155",
        owner: "B",
        status: "done",
        outcome: "Mark 10/15: standard is the 3 inch black locking caster at $117; the $155 soft locking set can also go on Trig. Both offered, one set per table.",
        priceSource: "\"3\" Locking Casters (Black)\" $117 per set of 4; \"3\" Locking Soft Casters for Hard Floors\" $155 per set of 4",
        deepLink: "https://staging.tablex.com/spex-studio/trig",
      },
      {
        id: "TRIG-05",
        request: "Remove Wire Management Leg from Accessories",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/trig",
      },
      {
        id: "TRIG-06",
        request: "Add Magnetic Wire Management.  Upcharge $75",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Magnetic Wire Management Leg Cover\" $75 each",
        deepLink: "https://staging.tablex.com/spex-studio/trig",
      },
    ],
  },
  {
    id: "ultra",
    tab: "ULTRA",
    title: "Ultra",
    links: [
      { label: "Ultra in SpeX", href: "https://staging.tablex.com/spex-studio/ultra" },
    ],
    items: [
      {
        id: "ULTRA-01",
        request: "Remove Wire Management Leg.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/ultra",
      },
      {
        id: "ULTRA-02",
        request: "Add Magnetic Wire Management.  Upcharge $75",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Magnetic Wire Management Leg Cover\" $75 each",
        deepLink: "https://staging.tablex.com/spex-studio/ultra",
      },
    ],
  },
  {
    id: "vertigo",
    tab: "VERTIGO",
    title: "VertiGO",
    links: [
      { label: "VertiGO in SpeX", href: "https://staging.tablex.com/spex-studio/vertigo" },
    ],
    items: [
      {
        id: "VERTIGO-01",
        request: "Add Edge Mount as an option for all bases for Rectangle Tops.  Upcharge $80 per table.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Edge Mounted T-bases\" $80 per table",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-02",
        request: "Add Offset T Base for Rectangle Tops.  Listed in pricer. Not available on 18\" deep tops or 30\" deep nesting tops less than 60\" wide.  Upcharge of $41 per table",
        owner: "B",
        status: "conflict",
        outcome: "Built with the book figure (Offset T $21).",
        priceSource: "\"Offset T-Bases\" $21 per base",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-03",
        request: "Add Radius Corners unders accessories for all Rectangle and Square options.  Upcharge $61",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"3\" Radius Corners\" $61 per top",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-04",
        request: "Add Quick Connect Ganging Brackets for all Rectangle and Square options.  Upcharge $45 (4 connectors per table)",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Quick-Connect Ganging Brackets\" $45 per table",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-05",
        request: "Remove Wire Management Leg from Accessories",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-06",
        request: "In top shapes, Keyboard should be Kidney Bean",
        owner: "C",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-07",
        request: "Wire Management in leg is not an option.  Should be Magnetic Wire Management Leg Cover. Upcharge $75 per cover.  Powder Coated same as base.",
        owner: "B",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "\"Magnetic Wire Management Leg Cover\" $75 each",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-08",
        request: "Add Round Disc in Base Style for Square top options.  Pricing is same as Disc",
        owner: "C",
        status: "done",
        outcome: "Built 10/15 from Brian's updated October workbook: Round Disc under Square tops. 3D shows the standard base.",
        priceSource: "Book models 74SQ2424D20 … 74SQ4242D32 (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-09",
        request: "Add Square Disc in Base Style for Round top options.  Pricing is same as Disc",
        owner: "C",
        status: "done",
        outcome: "Built 10/15 from Brian's updated October workbook: Square Disc under Round tops. 3D shows the standard base.",
        priceSource: "Book models 74RD24QD16 … 74RD42QD26 (10b)",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-10",
        request: "All Height Adjust Options (Electic, Pneumatic, Crank, Short Balance, Battery) need to be added to VertiGO.  Listed in Pricer",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
      {
        id: "VERTIGO-11",
        request: "All Height Adjust Options (Electic, Pneumatic, Crank, Short Balance, Battery) need to be added to VertiGO.  Listed in Pricer",
        owner: "C",
        status: "done-already",
        outcome: "Book rows existed and the picker already sold them. Verified 351/351 on staging.",
        deepLink: "https://staging.tablex.com/spex-studio/vertigo",
      },
    ],
  },
  {
    id: "ref",
    title: "Mark's 10/12 items",
    links: [
      { label: "Primary", href: "https://staging.tablex.com/spex-studio/primary" },
      { label: "Elite", href: "https://staging.tablex.com/spex-studio/elite" },
    ],
    items: [
      {
        id: "REF-01",
        request: "Bottom Cord Exit (Primary, Surge, VertiGO)",
        status: "conflict",
        outcome: "Built with the book figure (Bottom Cord Exit $139).",
        priceSource: "Mark: $140 (Mark 10/12) · October book: \"Bottom Cord Exit\" $139 each",
        deepLink: "https://staging.tablex.com/spex-studio/primary",
      },
      {
        id: "REF-02",
        request: "Power Box Mounting Plate",
        status: "done",
        outcome: "Built, priced from the October book on staging.",
        priceSource: "Mark: $105 (Mark 10/12) · October book: \"Powerbox Mounting Plate\" $105 each",
      },
      {
        id: "REF-03",
        request: "Bottom Cord Exit plus Power Box together",
        status: "needs-mark",
        outcome: "Book sum is $244, Mark's relayed figure is $245 (earlier $346). Mark to confirm.",
        priceSource: "Mark: $346 (Mark 10/12, as relayed) · October book: $139 + $105 = $244 (or $245 with Mark's $140)",
      },
    ],
  },
];
// @generated-end

const ORDERS_LIST = `${STAGING_ORIGIN}/ops/orders`;
const SO_13000 = `${STAGING_ORIGIN}/ops/orders/d4857879-19ab-4394-ba4e-d83711a889e7`;
const SO_13001 = `${STAGING_ORIGIN}/ops/orders/13d5bdd2-4a0c-42da-97ff-3c6934daf51d`;
const SO_13002 = `${STAGING_ORIGIN}/ops/orders/5bcf4603-ca44-4756-8ec4-c760f31cc5fb`;

export const ORDERS_GROUP: SpexReviewGroup = {
  id: "orders",
  title: "Sales Orders",
  links: [
    { label: "Orders", href: ORDERS_LIST },
    { label: "Quotes", href: `${STAGING_ORIGIN}/ops/quotes` },
    { label: "New order", href: `${STAGING_ORIGIN}/ops/orders/new` },
  ],
  items: [
    {
      id: "ORD-01",
      request: "Orders list reads right",
      status: "review",
      outcome:
        "Check the columns, order and status labels make sense for the desk, and the three test orders (SO 13000, 13001, 13002) all appear.",
      deepLink: ORDERS_LIST,
    },
    {
      id: "ORD-02",
      request:
        "SO 13000 (desk accept) page: facts, ship date card, salesperson, prepay, recipients, documents",
      status: "review",
      outcome:
        "Check every fact on the page against the accepted quote, then the ship date card, salesperson, prepay flag, acknowledgment recipients and document links.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-03",
      request: 'SO 13001 entered directly (no quote; "Quote: entered directly"; freight card)',
      status: "review",
      outcome:
        'Check the page says "Quote: entered directly" and the freight card shows the freight you would expect on this order.',
      deepLink: SO_13001,
    },
    {
      id: "ORD-04",
      request: "SO 13002 dealer self-accept, nesting lead time, needs-salesperson flow",
      status: "review",
      outcome:
        "Check the ship date uses the 6-week nesting lead time and the page asks for a salesperson before the order moves on.",
      deepLink: SO_13002,
    },
    {
      id: "ORD-05",
      request:
        "Accept a quote for a dealer from Ops → Quotes (pick salesperson, prepay on/off) and confirm the next SO number",
      status: "review",
      outcome:
        "Accept a submitted quote on a dealer's behalf, pick the salesperson, try prepay on and off, and check the new order takes the next SO number.",
      deepLink: `${STAGING_ORIGIN}/ops/quotes`,
    },
    {
      id: "ORD-06",
      request: "Enter an order with no quote",
      status: "review",
      outcome:
        "Enter an order from scratch and check every field the desk needs is there and nothing unnecessary is asked for.",
      deepLink: `${STAGING_ORIGIN}/ops/orders/new`,
    },
    {
      id: "ORD-07",
      request: "Move the ship date with a reason; confirm the re-acknowledgment behaviour",
      status: "review",
      outcome:
        "Move a ship date with a reason and check the reason stays on the order and a re-acknowledgment goes out. On staging all mail lands in Danny's inbox.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-08",
      request: "Sales Order PDF reads right next to what Sage prints today",
      status: "review",
      outcome:
        "Open the Sales Order PDF beside a Sage-printed sales order and note anything missing, misplaced or worded differently.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-09",
      request: "Work Order PDF: no pricing anywhere, content complete",
      status: "review",
      outcome:
        "Check no dollar figure appears anywhere on the Work Order and every line, option and finish the shop needs is there.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-10",
      request: "Packing Slip PDF: density right, ship-to correct",
      status: "review",
      outcome:
        "Check the Packing Slip is easy to read at print size and the ship-to address matches the order.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-11",
      request:
        "Production Cover Sheet vs Mark's paper form (header auto-fills SO, customer PO, dealer, ship date; option grid prints empty)",
      status: "review",
      outcome:
        "Lay the Cover Sheet beside Mark's paper form: SO, customer PO, dealer and ship date fill in, and the option grid prints empty for hand marking.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-12",
      request:
        "Lead-time dates: 4 weeks standard / 6 weeks nesting / 10 business days Quick Ship from accept (or payment when prepay)",
      status: "review",
      outcome:
        "Check each test order's ship date against its lead time, counted from accept, or from payment on prepay orders.",
      deepLink: ORDERS_LIST,
    },
    {
      id: "ORD-13",
      request:
        "Acknowledgment recipients: orderer, dealer primary, rep principal, salesperson, production, extra",
      status: "review",
      outcome:
        "Check an order's recipient list names all six and an extra address can be added. On staging all mail lands in Danny's inbox.",
      deepLink: SO_13000,
    },
    {
      id: "ORD-14",
      request: "Send to production mail carries Cover Sheet + Work Order + Packing Slip links",
      status: "review",
      outcome:
        "Send an order to production and check the email links open the Cover Sheet, Work Order and Packing Slip. On staging the mail lands in Danny's inbox.",
      deepLink: SO_13000,
    },
  ],
};

/** Every group in rail order: the SpeX tracker tabs, Mark's 10/12 items, then Sales Orders. */
export const STAGING_REVIEW_GROUPS: SpexReviewGroup[] = [...SPEX_TRACKER_GROUPS, ORDERS_GROUP];

export const STAGING_REVIEW_ITEM_COUNT = STAGING_REVIEW_GROUPS.reduce(
  (n, g) => n + g.items.length,
  0,
);
