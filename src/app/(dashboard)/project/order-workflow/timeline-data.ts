/**
 * Order Workflow — Timeline tab data (./timeline-data.ts) (set 10/12/2026).
 *
 * Every date on the Timeline tab lives here; ./timeline.tsx only lays it out.
 * Dates are ISO "YYYY-MM-DD" strings, end dates INCLUSIVE. Edit freely:
 * bars pack themselves into rows, the week strip and mobile view re-derive.
 *
 * Supersedes the timeline in src/data/order-workflow-estimate-ai.ts
 * (lines 1-4 live 10/19, production board 10/23, packaging 10/26). The scope
 * lines are the same; the engagement is now 3 weeks, Wed 10/14 to Tue 11/03.
 * No money on this page: pricing is settled between Richie and Brian and is not discussed with TableX.
 */

export type ISODate = `${number}-${number}-${number}`;

export const TIMELINE = {
  /** First day drawn on the grid (today, so the today marker is visible). */
  gridStart: "2026-10-12" as ISODate,
  /** Last day drawn on the grid. */
  gridEnd: "2026-11-03" as ISODate,
  today: "2026-10-12" as ISODate,
  kickoff: "2026-10-14" as ISODate,
  /** Brian's date: first phase live + SpeX relaunch target. */
  keyDate: "2026-10-19" as ISODate,
  keyDateLabel: "Mon 10/19: first phase live",
  end: "2026-11-03" as ISODate,
  weeks: [
    { key: "w1", label: "Week 1", start: "2026-10-14" as ISODate, end: "2026-10-20" as ISODate, theme: "P1 core live + SpeX relaunch" },
    { key: "w2", label: "Week 2", start: "2026-10-21" as ISODate, end: "2026-10-27" as ISODate, theme: "Acknowledgments, shipping, Xero mirror" },
    { key: "w3", label: "Week 3", start: "2026-10-28" as ISODate, end: "2026-11-03" as ISODate, theme: "Production board, packaging, handoff" },
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
 * carry   = moved from P1 by the agreed 10/19 split (dashed navy)
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
    start: "2026-10-14",
    end: "2026-10-19",
    tag: "P1",
    label: "Orders + SO# + three PDFs + production@",
    detail:
      "orders table, SO numbers from the accounting series starting at 13000, Sales Order / Work Order / Packing Slip PDFs, auto-email to production@. The agreed split: this ships first, by Mon 10/19.",
    tone: "core",
  },
  {
    id: "p1-carry",
    lane: "workflow",
    start: "2026-10-21",
    end: "2026-10-27",
    tag: "P1",
    label: "Cover sheet form + change orders",
    detail:
      "The rest of P1, carried by the 10/19 split: Production Cover Sheet (auto-fills TX SO#, Cust PO#, Dealer, Ship Date) and change orders on accepted orders. First candidates to slide into week 3 if SpeX slips.",
    tone: "carry",
  },
  {
    id: "p2",
    lane: "workflow",
    start: "2026-10-21",
    end: "2026-10-27",
    tag: "P2",
    label: "Acknowledgments",
    detail:
      "Six recipients (person ordering, dealer primary, sales-group principal, salesperson credited, extra free-form, production@), salesperson dropdown filtered to the dealer's sales group, supporting-docs prompt on Accept.",
    tone: "core",
  },
  {
    id: "p3",
    lane: "workflow",
    start: "2026-10-21",
    end: "2026-10-27",
    tag: "P3",
    label: "Ship + track",
    detail:
      "Carriers (Central Transport, R&L, WATCO, UPS, Other, Customer Pick-Up), PRO / tracking, Ready then Shipped with the has-shipped email, one photo per pallet from Mark's phone.",
    tone: "core",
  },
  {
    id: "p4",
    lane: "workflow",
    start: "2026-10-28",
    end: "2026-11-03",
    tag: "P4",
    label: "Production board",
    detail: "/ops/production replaces ORDER STATUS.xlsx: Mark's 16 kept columns, vendor PO groups (Valley, Smith, other) with PO / due / arrived.",
    tone: "core",
  },
  {
    id: "p5",
    lane: "workflow",
    start: "2026-10-28",
    end: "2026-11-03",
    tag: "P5",
    label: "Packaging costs + Patty's P/L",
    detail: "Mark's dated rate table, Tony's per-order quantities and pallets, Patty's P/L row per order with CSV export.",
    tone: "core",
  },
  {
    id: "harden",
    lane: "workflow",
    start: "2026-10-28",
    end: "2026-11-03",
    label: "Hardening, training + handoff",
    detail: "Fixes from the first two weeks of live orders, desk training, handoff.",
    tone: "core",
  },
  {
    id: "buffer",
    lane: "workflow",
    start: "2026-10-28",
    end: "2026-11-03",
    label: "Buffer: SpeX-caused rework",
    detail: "Held open for rework the SpeX relaunch forces on the order flow. If SpeX lands clean, it goes to hardening.",
    tone: "buffer",
  },

  /* ---------------- SpeX Studio catalog (isolated) ---------------- */
  {
    id: "spex-catalog",
    lane: "spex",
    start: "2026-10-14",
    end: "2026-10-18",
    label: "Catalog update + re-verify",
    detail:
      "OCTOBER 2026 master pricing import + Mark's 10/09 items: Surge-only disc-base sizes, Bottom Wire Exit $140 list, Power Box $105 list ($346 with both), Elite Trestle base price tab. Then re-verify SpeX before the notice comes down.",
    tone: "spex",
  },

  /* ---------------- Xero ---------------- */
  {
    id: "xero-mirror",
    lane: "xero",
    start: "2026-10-19",
    end: "2026-10-23",
    label: "Invoice mirror: read-only sync + webhooks",
    detail:
      "Ships with P1 / early week 2: the SO shows the Xero invoice number, status and paid date. Read-only. Creating invoices in Xero is NOT in scope; Patty keys the invoice from the SO.",
    tone: "xero",
  },
  {
    id: "sage-runout",
    lane: "xero",
    start: "2026-10-19",
    end: "2026-11-03",
    label: "Sage runs out its existing orders",
    detail: "Two systems for a short period. No existing Sage order moves to Xero, no backfill (Brian 10/12).",
    tone: "ongoing",
    continues: true,
  },

  /* ---------------- TableX owes ---------------- */
  {
    id: "owe-production-inbox",
    lane: "owes",
    start: "2026-10-12",
    end: "2026-10-14",
    label: "production@ mailbox + INKY allow rule",
    detail:
      "production@tablex.com created, and the IT vendor's INKY allow rule for send.tablex.com, by Wed 10/14. Without it the production emails are quarantined.",
    tone: "owed",
  },
  {
    id: "owe-spex-prices",
    lane: "owes",
    start: "2026-10-12",
    end: "2026-10-16",
    label: "Elite Trestle price tab + Surge disc-base costs",
    detail: "From Brian / Mark, before the SpeX relaunch. Needed by Fri 10/16 so the catalog can be re-verified before Mon 10/19.",
    tone: "owed",
    assumed: true,
  },
  {
    id: "owe-logins",
    lane: "owes",
    start: "2026-10-12",
    end: "2026-10-16",
    label: "Sam + Patty dashboard logins",
    detail: "Neither has a dashboard login (Brian and Mark do). Wanted before the P1 go-live so both can see the order flow.",
    tone: "owed",
    assumed: true,
  },
];

export const MARKERS: Marker[] = [
  {
    id: "p1-live",
    lane: "workflow",
    date: "2026-10-19",
    label: "P1 core live",
    detail: "Brian's date for the first phase.",
    kind: "live",
  },
  {
    id: "spex-relaunch",
    lane: "spex",
    date: "2026-10-19",
    label: "SpeX back online",
    detail: "The \"making custom better\" notice comes down with the catalog updates in place.",
    kind: "relaunch",
    approx: true,
  },
  {
    id: "xero-cutover",
    lane: "xero",
    date: "2026-10-19",
    label: "Xero cutover",
    detail: "= P1 go-live. The first order the app issues is the first Xero invoice.",
    kind: "cutover",
  },
  {
    id: "owe-patty",
    lane: "owes",
    date: "2026-10-19",
    label: "Patty ready in Xero",
    detail: "Ready to raise a Xero sales invoice from the SO on Mon 10/19.",
    kind: "due",
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
    date: "2026-10-20",
    label: "M2 · P1 + SpeX",
    detail: "P1 live and the SpeX relaunch accepted.",
    kind: "gate",
    approx: true,
  },
  {
    id: "m3",
    lane: "gates",
    date: "2026-11-03",
    label: "M3 · handoff",
    detail: "P5 live and handoff.",
    kind: "gate",
    approx: true,
  },
];

/** What we could prove about SpeX on 10/12 (tablex-site main + a live curl). */
export const SPEX_STATUS = {
  headline: "Offline since Wed 9/30",
  body:
    "Since 9/30 (tablex-site f9c44dc8) a permanent, unclosable \"making custom better\" notice has covered /spex-studio and every configurator page. It was still on tablex.com on 10/12. The relaunch takes it down once the catalog updates are in and re-verified.",
};

export const SPEX_RISK = {
  title: "If SpeX slips",
  why: [
    "SpeX lands the same week as P1 and needs the same reviewers (Brian and Mark).",
    "The October price-book import and Mark's new catalog items change what orders carry, so a late or changed catalog can force rework on the order documents built in week 1.",
    "M2 is defined as P1 live AND the SpeX relaunch accepted, so a SpeX slip moves that milestone too.",
  ],
  slips: [
    { what: "P1 cover sheet form + change orders", to: "Slide from week 2 into week 3 first." },
    { what: "Week 3 buffer", to: "Absorbs the rework; hardening shrinks to fit." },
    { what: "M2 milestone", to: "Waits for the SpeX relaunch to be accepted." },
  ],
  holds: "Protected first: P1 core (orders, SO#, three PDFs, production@) and the Xero cutover on Mon 10/19.",
};
