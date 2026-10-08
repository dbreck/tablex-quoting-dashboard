/**
 * Order Workflow estimate — Brian's 10/07 Sales Order Workflow ask, priced
 * after the 10/08 homework (28/28 answers; rulings on /project/order-workflow).
 * Rates match the Phase 2 Harvest estimate: development $185/hr, design + QA
 * + training $150/hr. Hours are Danny's first stab for the Richie conversation.
 */

export const DEV_RATE = 185;
export const DESIGN_RATE = 150;

export type AnnotationType = "changed" | "clarification" | "added";

export interface Annotation {
  id: string;
  type: AnnotationType;
  label: string;
  original?: string;
  changed: string;
  rationale: string;
}

export interface Section {
  heading: string;
  description?: string;
  deliverables?: string[];
  annotations?: string[];
}

export interface LineItem {
  number: number;
  title: string;
  phase: string;
  hours: number;
  rate: number;
  gated?: string;
  sections: Section[];
}

export const ESTIMATE_META = {
  number: "Estimate #1301 (draft)",
  date: "10/08/2026",
  subject: "TableX | Sales Order Workflow\nQuote → Sales Order → Production → Shipment → Invoice",
};

export const ANNOTATIONS: Annotation[] = [
  {
    id: "a",
    type: "clarification",
    label: "First phase by 10/19",
    changed:
      "Brian asked for the first phase live Monday 10/19. Line items 1 and 2 ship first (orders, SO series, Sales Order / Work Order / Packing Slip, production@ email); the cover sheet form and change orders follow in the next week.",
    rationale: "P1 as a whole is more than one week. Naming the split keeps the 10/19 date honest.",
  },
  {
    id: "b",
    type: "clarification",
    label: "Cover sheet option grid stays manual",
    changed:
      "The app auto-fills TX SO#, Cust PO#, Dealer and Ship Date. Mark ticks the option-code grid in the app. Automatic ticking needs a bill of materials per SKU, which TableX does not have; that is a separate scope.",
    rationale: "Mark's 10/08 answer. Prevents a hidden BOM project inside the cover sheet line.",
  },
  {
    id: "c",
    type: "clarification",
    label: "production@ mailbox is TableX's",
    changed:
      "TableX creates production@tablex.com and has its IT vendor add the INKY allow rule for send.tablex.com before the auto-emails go live. Without the rule the emails land in quarantine.",
    rationale: "Same quarantine pattern that held staff password resets on 9/21. Client-side task.",
  },
  {
    id: "d",
    type: "clarification",
    label: "Xero line is gated",
    changed:
      "Invoices are created in Sage today (Sam + Patty, 10/08). Line 7 starts only once Patty invoices from Xero and is billed when it starts. Until then the desk types the invoice number on the Sales Order. Any Xero WRITE (creating the invoice from the app) is excluded.",
    rationale: "No date for the Sage → Xero move. Keeps the read-only Xero rule and avoids billing for a mirror of nothing.",
  },
  {
    id: "e",
    type: "clarification",
    label: "Not in this estimate",
    changed:
      "The OCTOBER 2026 master pricing import and the SpeX Studio action tracker (158 change items) are separate work, quoted on their own. Column consolidation of the production board beyond the first review round, the Returned-to-stock list, and a per-SKU BOM are also out.",
    rationale: "Brian's third 10/07 email bundled unrelated asks. Splitting them keeps this estimate about the order workflow.",
  },
  {
    id: "f",
    type: "added",
    label: "Review rounds",
    changed:
      "Each phase includes one review round with Mark and Sam on staging before it goes live. Additional rounds are billed at the applicable hourly rate.",
    rationale: "The homework already settled most choices. One round per phase is enough and keeps the schedule.",
  },
  {
    id: "g",
    type: "added",
    label: "Payment schedule",
    changed:
      "Three milestones: 40% at kickoff, 30% when the Sales Order, acknowledgments and shipping are live (about week 4), 30% when the production schedule and packaging costs are live (about week 8). The gated Xero line is billed separately when it starts.",
    rationale: "Ties payment to what the desk can use, not to calendar time.",
  },
  {
    id: "h",
    type: "clarification",
    label: "Post-launch support",
    changed: "Up to 5 business days of bug-fix support after each phase goes live. Feature requests after that are billed separately.",
    rationale: "Same boundary as the Phase 2 estimate.",
  },
];

export const LINE_ITEMS: LineItem[] = [
  {
    number: 1,
    title: "Sales Order core",
    phase: "P1",
    hours: 40,
    rate: DEV_RATE,
    sections: [
      {
        heading: "Orders table and SO numbering",
        description:
          "A new orders record keyed one-to-one to the quote. The quote stays the line and pricing record; the order carries everything that happens after acceptance.",
        deliverables: [
          "SO number from the accounting series, starting at 13000 (the cutover marker); the TX quote number prints on every document",
          "Order status: accepted · in production · ready · shipped · invoiced · paid · closed",
          "Create an order from a desk quote, or a new order with no quote",
          "Estimated ship date proposed from lead time (4 weeks · Nesting 6 weeks · Quick Ship 10 business days); Mark edits it; every move is logged",
          "Salesperson dropdown filtered to the reps in the dealer's sales group",
          "Prepay flag: a pre-invoice order waits in accepted until paid, then enters production",
        ],
        annotations: ["a"],
      },
      {
        heading: "Change orders",
        description: "Edits after the acknowledgment went out become a change order with a revision trail, never a silent edit.",
        deliverables: ["Re-open lines and pricing on an accepted order under a new revision snapshot", "Change-order note required; the acknowledgment can be re-sent"],
      },
    ],
  },
  {
    number: 2,
    title: "Documents and production hand-off",
    phase: "P1",
    hours: 28,
    rate: DEV_RATE,
    sections: [
      {
        heading: "One renderer, four documents",
        description: "The existing quote PDF gains a document title and a show-pricing flag.",
        deliverables: [
          "Quote · Sales Order · Work Order (SO without pricing) · Packing Slip (same as the Work Order)",
          "Generated PDFs stored on the order so email links always match the record",
        ],
      },
      {
        heading: "Production Cover Sheet",
        description: "Mark's purchasing worksheet as an in-app form plus PDF.",
        deliverables: [
          "Header auto-fills TX SO#, Cust PO#, Dealer, Ship Date; the five desk checkboxes are retired",
          "Option-code grid, vendor PO checklist, rep / commission % / SPIFF fields completed by Mark in the app",
          "Cover Sheet + Work Order + Packing Slip auto-emailed to production@ on accept",
        ],
        annotations: ["b", "c"],
      },
    ],
  },
  {
    number: 3,
    title: "Acceptance and acknowledgments",
    phase: "P2",
    hours: 20,
    rate: DEV_RATE,
    sections: [
      {
        heading: "Recipients and supporting documents",
        deliverables: [
          "Six recipients per order: person ordering, dealer primary, sales-group principal, salesperson credited, additional recipient, production@",
          "Supporting-documents prompt on Accept with typed slots: customer PO, change notes, vendor quotes, vendor PO + acknowledgment, drawings, electrical PO + acknowledgment",
          "Acknowledgment email with SO#, Cust PO#, estimated ship date and signed document links; pricing visible to reps and principals",
          "Dealers with locations in different territories set up as one organization per location",
        ],
        annotations: ["f"],
      },
    ],
  },
  {
    number: 4,
    title: "Shipping and tracking",
    phase: "P3",
    hours: 20,
    rate: DEV_RATE,
    sections: [
      {
        heading: "Ship, notify, photograph",
        deliverables: [
          "Carrier dropdown: Central Transport · R&L Carriers · WATCO · UPS · Other (typed) · Customer Pick-Up; PRO / tracking fields any staff member can enter",
          "Ready and Shipped steps; \"Your TableX order SO# / Customer PO# has shipped\" email with carrier and tracking",
          "Phone camera upload, one photo per pallet, stored permanently on the order",
          "Post-ship attachments: freight quote, bill of lading + PRO#, packaging costs",
        ],
      },
    ],
  },
  {
    number: 5,
    title: "Production schedule",
    phase: "P4",
    hours: 28,
    rate: DEV_RATE,
    sections: [
      {
        heading: "/ops/production board replacing ORDER STATUS.xlsx",
        deliverables: [
          "The 16 columns Mark kept: SO#, Non-Nesting / Nesting / Bases Only / Tops Only / Misc counts, Net, Cust PO#, Customer, Ack. Ship Date, Shipped Date (R = ready), Valley / Smith / two other vendors PO-Due-Arrived, Review notes",
          "Product-mix counts derived from the order lines; vendor PO groups entered per order",
          "Accepted orders enter the board, ship-date edits propagate, shipped orders drop off; filters and sort",
          "One review round for Brian's column-consolidation ideas",
        ],
        annotations: ["e"],
      },
    ],
  },
  {
    number: 6,
    title: "Packaging costs and P/L",
    phase: "P5",
    hours: 24,
    rate: DEV_RATE,
    sections: [
      {
        heading: "Rates, entries, analysis",
        deliverables: [
          "Rate table Mark edits, with effective-from dates (rates change whenever a supplier changes price); each order keeps the rate it was costed at",
          "Per-order entry for Tony: material quantities, pallets 1–6 with dimensions and weight, automatic total",
          "P/L row per order for Patty: packaging total, warehouse time, freight, commission, SPIFF, dealer tier, vendor charges, invoice total, accepted and shipped dates, customer, ship-to state, P/L total; CSV export",
        ],
      },
    ],
  },
  {
    number: 7,
    title: "Xero invoice mirror",
    phase: "Later",
    hours: 20,
    rate: DEV_RATE,
    gated: "Starts when Patty invoices from Xero",
    sections: [
      {
        heading: "Read-only mirror onto the Sales Order",
        deliverables: [
          "Xero webhooks (Contacts + Invoices) with signature check and an idempotent worker feeding the existing sync",
          "Invoice number, status and paid date shown on the order; no manual paid toggle",
          "No Xero write path",
        ],
        annotations: ["d"],
      },
    ],
  },
  {
    number: 8,
    title: "Discovery and workflow design",
    phase: "Done",
    hours: 12,
    rate: DESIGN_RATE,
    sections: [
      {
        heading: "Already delivered 10/08",
        deliverables: [
          "Brian's three emails and five SharePoint files mapped to the build",
          "Meeting page with the as-is round trip, data model and phases",
          "Homework tabs for Brian, Mark, Sam and Patty; 28 of 28 answers folded into rulings",
        ],
      },
    ],
  },
  {
    number: 9,
    title: "QA, training and launch",
    phase: "Each phase",
    hours: 16,
    rate: DESIGN_RATE,
    sections: [
      {
        heading: "Staging smoke, staff training, go-live",
        deliverables: [
          "Each phase smoked on staging.tablex.com signed in as the desk, then fast-forwarded to production",
          "Short walkthroughs for Sam, Mark, Tony and Patty; training-viewer videos where it helps",
          "Up to 5 business days of bug-fix support after each phase",
        ],
        annotations: ["f", "h"],
      },
    ],
  },
];

export const lineCost = (li: LineItem) => li.hours * li.rate;
export const TOTAL_HOURS = LINE_ITEMS.reduce((s, li) => s + li.hours, 0);
export const TOTAL_COST = LINE_ITEMS.reduce((s, li) => s + lineCost(li), 0);
export const GATED_COST = LINE_ITEMS.filter((li) => li.gated).reduce((s, li) => s + lineCost(li), 0);
export const CORE_COST = TOTAL_COST - GATED_COST;

export const TIMELINE = [
  { week: "Wk 1–2", to: "10/19–10/23", what: "Sales Order core + documents (orders, SO series, SO / WO / Packing Slip, production@ email); cover sheet + change orders close out week 2" },
  { week: "Wk 3", to: "10/30", what: "Acceptance recipients + acknowledgments" },
  { week: "Wk 4", to: "11/06", what: "Shipping, tracking, photos · milestone 2" },
  { week: "Wk 5–6", to: "11/20", what: "Production schedule board" },
  { week: "Wk 7", to: "11/27", what: "Packaging costs + P/L" },
  { week: "Wk 8", to: "12/04", what: "QA, training, launch · milestone 3" },
  { week: "Gated", to: "TBD", what: "Xero invoice mirror once Patty invoices from Xero" },
];
