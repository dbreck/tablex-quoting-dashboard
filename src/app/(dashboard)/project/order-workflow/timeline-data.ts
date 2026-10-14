/**
 * Order Workflow — Timeline tab data (./timeline-data.ts) (set 10/12/2026, redrawn 10/14 after Brian's round-2 answer).
 *
 * Every date on the Timeline tab lives here; ./timeline.tsx only lays it out.
 * Dates are ISO "YYYY-MM-DD" strings, end dates INCLUSIVE. Edit freely:
 * bars pack themselves into rows, the week strip and mobile view re-derive.
 *
 * Supersedes the timeline in src/data/order-workflow-estimate-ai.ts
 * (lines 1-4 live 10/19, production board 10/23, packaging 10/26). The scope
 * lines are the same. 10/14: Brian's round-2 answer put the SpeX corrections on
 * 10/19 (public relaunch 10/26) and left the orders date open, so SpeX runs
 * first, orders P1 core follows the week of 10/21 and the engagement runs
 * Wed 10/14 to Fri 11/07 (one week longer than the 10/12 draw).
 * No money on this page: pricing is settled between Richie and Brian and is not discussed with TableX.
 */

export type ISODate = `${number}-${number}-${number}`;

export const TIMELINE = {
  /** First day drawn on the grid (today, so the today marker is visible). */
  gridStart: "2026-10-12" as ISODate,
  /** Last day drawn on the grid. */
  gridEnd: "2026-11-07" as ISODate,
  today: "2026-10-14" as ISODate,
  kickoff: "2026-10-14" as ISODate,
  /** Brian's date: SpeX corrections done, TableX test week starts. */
  keyDate: "2026-10-19" as ISODate,
  keyDateLabel: "Mon 10/19: SpeX corrections on staging",
  end: "2026-11-07" as ISODate,
  weeks: [
    { key: "w1", label: "Week 1", start: "2026-10-14" as ISODate, end: "2026-10-20" as ISODate, theme: "SpeX catalog + price book on staging" },
    { key: "w2", label: "Week 2", start: "2026-10-21" as ISODate, end: "2026-10-27" as ISODate, theme: "P1 core, acknowledgments; SpeX public + first SO 10/26" },
    { key: "w3", label: "Week 3", start: "2026-10-28" as ISODate, end: "2026-11-03" as ISODate, theme: "Ship + track, production board, Xero mirror" },
    { key: "w4", label: "Week 4", start: "2026-11-04" as ISODate, end: "2026-11-07" as ISODate, theme: "Packaging + P/L, hardening, handoff" },
  ],
} as const;

export type LaneKey = "workflow" | "spex" | "xero" | "owes" | "gates";

export interface Lane {
  key: LaneKey;
  label: string;
  sub: string;
}

export const LANES: Lane[] = [
  { key: "workflow", label: "Order workflow P1–P5", sub: "The sales-order build" },
  {
    key: "spex",
    label: "SpeX Studio catalog",
    sub: "Isolated from P1–P5",
  },
  { key: "xero", label: "Xero", sub: "Cutover + read-only mirror" },
  { key: "owes", label: "TableX owes", sub: "Inputs we wait on" },
  { key: "gates", label: "Milestone gates", sub: "Three acceptance points" },
];

/**
 * core    = committed build work (navy)
 * carry   = the rest of P1, after P1 core (dashed navy)
 * spex    = the isolated SpeX lane (amber)
 * xero    = Xero work (sky)
 * ongoing = runs past the grid / background state (gray, dashed)
 * buffer  = held for SpeX-caused rework (hatched gray)
 * owed    = TableX dependency (rose)
 */
export type BarTone = "core" | "carry" | "spex" | "xero" | "ongoing" | "buffer" | "owed";

export interface Bar {
  id: string;
  lane: LaneKey;
  start: ISODate;
  end: ISODate;
  label: string;
  detail: string;
  tone: BarTone;
  /** Phase tag shown at the front of the bar (P1…P5). */
  tag?: string;
  /** True when the date is our working assumption, not a stated date. */
  assumed?: boolean;
  /** Runs past the last day on the grid. */
  continues?: boolean;
}

export type MarkerKind = "live" | "gate" | "relaunch" | "cutover" | "due";

export interface Marker {
  id: string;
  lane: LaneKey;
  date: ISODate;
  label: string;
  detail: string;
  kind: MarkerKind;
  /** Approximate date ("~"). */
  approx?: boolean;
  /** Unused; kept so the marker shape is stable. */
  share?: string;
  assumed?: boolean;
}

export const BARS: Bar[] = [
  /* ---------------- Order workflow P1–P5 ---------------- */
  {
    id: "p1-core",
    lane: "workflow",
    start: "2026-10-21",
    end: "2026-10-26",
    tag: "P1",
    label: "Orders + SO# + three PDFs + production@",
    detail:
      "orders table, SO numbers from the accounting series starting at 13000, New order without a quote, Sales Order / Work Order / Packing Slip PDFs, auto-email to production@. Contract written 10/16 to 10/18, builders start Tue 10/21, live Mon 10/26 with the first SO.",
    tone: "core",
  },
  {
    id: "p1-carry",
    lane: "workflow",
    start: "2026-10-27",
    end: "2026-10-30",
    tag: "P1",
    label: "Cover sheet form + change orders",
    detail:
      "The rest of P1 after the core: Production Cover Sheet (auto-fills TX SO#, Cust PO#, Dealer, Ship Date) and change orders (Sam edits, Mark approves from production@, re-acknowledges all six).",
    tone: "carry",
  },
  {
    id: "p2",
    lane: "workflow",
    start: "2026-10-23",
    end: "2026-10-28",
    tag: "P2",
    label: "Acknowledgments",
    detail:
      "Six recipients (person ordering, dealer primary, sales-group principal, salesperson credited, extra free-form, production@), salesperson dropdown filtered to the dealer's sales group, supporting-docs prompt on Accept.",
    tone: "core",
  },
  {
    id: "p3",
    lane: "workflow",
    start: "2026-10-28",
    end: "2026-11-03",
    tag: "P3",
    label: "Ship + track",
    detail:
      "Carriers (Central Transport, R&L, WATCO, UPS, Other, Customer Pick-Up), PRO / tracking, Ready then Shipped with the has-shipped email, one photo per pallet from Mark's phone.",
    tone: "core",
  },
  {
    id: "p4",
    lane: "workflow",
    start: "2026-10-29",
    end: "2026-11-04",
    tag: "P4",
    label: "Production board",
    detail: "/ops/production replaces ORDER STATUS.xlsx: Mark's 16 kept columns, vendor PO groups (Valley, Smith, other) with PO / due / arrived.",
    tone: "core",
  },
  {
    id: "p5",
    lane: "workflow",
    start: "2026-11-03",
    end: "2026-11-07",
    tag: "P5",
    label: "Packaging costs + Patty's P/L",
    detail: "Mark's dated rate table, Tony's per-order quantities and pallets, Patty's P/L row per order with CSV export.",
    tone: "core",
  },
  {
    id: "harden",
    lane: "workflow",
    start: "2026-11-04",
    end: "2026-11-07",
    label: "Hardening, training + handoff",
    detail: "Fixes from the first two weeks of live orders, desk training, handoff.",
    tone: "core",
  },
  {
    id: "buffer",
    lane: "workflow",
    start: "2026-10-27",
    end: "2026-10-30",
    label: "Buffer: SpeX test-week fixes",
    detail: "Held open for what TableX finds during the SpeX test week (10/19 to 10/25) before the 10/26 public relaunch. If SpeX lands clean, it goes to P1.",
    tone: "buffer",
  },

  /* ---------------- SpeX Studio catalog (isolated) ---------------- */
  {
    id: "spex-catalog",
    lane: "spex",
    start: "2026-10-14",
    end: "2026-10-18",
    label: "October book + action tracker on staging",
    detail:
      "OCTOBER 2026 master pricing import (new ADD ONS tab, Elite Trestle categories) + the SpeX_Studio_Series_Action_Tracker items (picker order, start mode, Power & Data section, add-on prices, renames, per-series bases and removals) + Mark's 10/09 items (Surge disc label, Bottom Wire Exit, Power Box). Four builders in parallel, integrated and on staging.tablex.com by Sun 10/18.",
    tone: "spex",
  },
  {
    id: "spex-test",
    lane: "spex",
    start: "2026-10-19",
    end: "2026-10-25",
    label: "TableX test week on staging",
    detail: "Brian, Mark and Sam work through the tracker report on staging.tablex.com (the notice is hidden there). Findings fixed in the week-2 buffer.",
    tone: "spex",
  },

  /* ---------------- Xero ---------------- */
  {
    id: "xero-mirror",
    lane: "xero",
    start: "2026-10-28",
    end: "2026-11-03",
    label: "Invoice mirror: read-only sync + webhooks",
    detail:
      "Week 3: the SO shows the Xero invoice number, status and paid date. Read-only. Creating invoices in Xero is NOT in scope; Patty keys the invoice from the SO. Until it lands the SO shows no invoice number.",
    tone: "xero",
  },
  {
    id: "sage-runout",
    lane: "xero",
    start: "2026-10-26",
    end: "2026-11-07",
    label: "Sage runs out its existing orders",
    detail: "Two systems for a short period. No existing Sage order moves to Xero, no backfill (Brian 10/12).",
    tone: "ongoing",
    continues: true,
  },

  /* ---------------- TableX owes ---------------- */
  {
    id: "owe-production-inbox",
    lane: "owes",
    start: "2026-10-14",
    end: "2026-10-23",
    label: "INKY allow rule for send.tablex.com",
    detail:
      "production@tablex.com exists (Brian 10/12). The IT vendor's INKY allow rule is still unconfirmed; without it the production@ emails P1 sends on 10/26 are quarantined. Needed before Fri 10/23.",
    tone: "owed",
  },
  {
    id: "owe-spex-prices",
    lane: "owes",
    start: "2026-10-14",
    end: "2026-10-16",
    label: "Tracker vs ADD ONS price conflicts",
    detail: "Brian / Mark confirm the handful of add-on prices where the tracker and the October ADD ONS tab disagree (offset T, chrome, industrial casters, bottom cord exit, metal modesty). Rule until then: the book tab wins.",
    tone: "owed",
    assumed: true,
  },
  {
    id: "owe-patty-prepay",
    lane: "owes",
    start: "2026-10-14",
    end: "2026-10-21",
    label: "Patty: prepay pre-invoice",
    detail: "The one round-2 question still blank: how the pre-invoice is produced today and whether the app should raise it from the SO.",
    tone: "owed",
    assumed: true,
  },
];

export const MARKERS: Marker[] = [
  {
    id: "p1-live",
    lane: "workflow",
    date: "2026-10-26",
    label: "P1 core live: first SO",
    detail: "First app-issued sales order, SO# 13000. Brian is open on the date; this is the first Monday after the SpeX test week.",
    kind: "live",
  },
  {
    id: "spex-staging",
    lane: "spex",
    date: "2026-10-19",
    label: "SpeX corrections on staging",
    detail: "Brian's 10/19: the corrections are done and TableX starts testing on staging.tablex.com.",
    kind: "due",
  },
  {
    id: "spex-relaunch",
    lane: "spex",
    date: "2026-10-26",
    label: "SpeX back online",
    detail: "Brian's date. The \"making custom better\" notice comes down on tablex.com after the test week.",
    kind: "relaunch",
  },
  {
    id: "xero-cutover",
    lane: "xero",
    date: "2026-10-26",
    label: "Xero cutover",
    detail: "= P1 go-live. The first order the app issues is the first Xero invoice. Patty confirmed 10/14 that Xero is set up and the dealers are in.",
    kind: "cutover",
  },
  {
    id: "m1",
    lane: "gates",
    date: "2026-10-14",
    label: "M1 · kickoff",
    detail: "Verbal start from Richie / Brian.",
    kind: "gate",
  },
  {
    id: "m2",
    lane: "gates",
    date: "2026-10-26",
    label: "M2 · SpeX public + first SO",
    detail: "SpeX relaunched on tablex.com and the first sales order issued from the app.",
    kind: "gate",
  },
  {
    id: "m3",
    lane: "gates",
    date: "2026-11-07",
    label: "M3 · handoff",
    detail: "P5 live and handoff.",
    kind: "gate",
    approx: true,
  },
];

/** What we could prove about SpeX on 10/12 (tablex-site main + a live curl). */
export const SPEX_STATUS = {
  headline: "Offline since Wed 9/30; back Mon 10/26",
  body:
    "Since 9/30 (tablex-site f9c44dc8) a permanent, unclosable \"making custom better\" notice has covered /spex-studio and every configurator page on tablex.com. staging.tablex.com hides it, so TableX tests the corrected catalog there 10/19 to 10/25. The relaunch on 10/26 deletes the notice on tablex.com.",
};

export const SPEX_RISK = {
  title: "If SpeX slips",
  why: [
    "SpeX now runs first, so a slip in week 1 eats the week-2 buffer that was meant for test-week fixes.",
    "The October price book changes what orders carry (add-ons, new bases), so P1 cannot start until the book is on staging.",
    "M2 is defined as SpeX public AND the first SO on 10/26, so a SpeX slip moves that milestone too.",
  ],
  slips: [
    { what: "Week 2 buffer", to: "Absorbs test-week fixes; P1 cover sheet form + change orders slide into week 3." },
    { what: "Xero mirror", to: "Slides into week 4; the SO carries no invoice number until it lands." },
    { what: "M2 milestone", to: "Waits for the SpeX relaunch; the first SO can still issue on 10/26." },
  ],
  holds: "Protected first: SpeX on staging by Sun 10/18, then P1 core live with the first SO and the Xero start on Mon 10/26.",
};
