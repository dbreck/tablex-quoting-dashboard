/**
 * /project/order-workflow — content for the 2026-10-08 sales-order workflow
 * call (Brian, Mark, Sam, Kayla, Arabella). Brian's three 10/07 emails, what
 * tablex.com does today (verified from tablex-site code), the after-accept
 * round trip, the build plan, decisions and questions. Pure data; visuals in
 * ./sections.tsx.
 */

import { salesOrderSteps } from "@/data/sales-order-steps";

export const MEETING = {
  title: "Sales Order Workflow",
  date: "Monday, October 12, 2026 · 11:00 AM ET · workflow walkthrough (first call Thu 10/08)",
  attendees: "Brian Craig · Mark · Sam · Danny · Kayla · Arabella",
  updated: "10/12 PM · round-2 homework posted (not reached on the call)",
};

/* ------------------------------------------------------------------ */
/* 1 · Brian's ask                                                     */
/* ------------------------------------------------------------------ */

export const PIPELINE = [
  { key: "quote", label: "Quote", sub: "Pricing proposal" },
  { key: "so", label: "Sales Order", sub: "The central record" },
  { key: "accept", label: "Acceptance", sub: "Docs + 5-way emails" },
  { key: "production", label: "Production", sub: "Work order + schedule" },
  { key: "ship", label: "Shipment", sub: "Slip, photos, tracking" },
  { key: "invoice", label: "Invoice", sub: "Bill + get paid" },
] as const;

export interface AskSection {
  heading: string;
  email: string;
  summary: string;
  bullets: string[];
}

export const BRIAN_ASKS: AskSection[] = [
  {
    heading: "CUSTOMER-FACING DOCUMENTS",
    email: "Email 1",
    summary: "Three documents, one layout. Only the title and role change.",
    bullets: [
      "Quote · Sales Order · Invoice share the same layout.",
      "Staff edit quantities, finishes, shipping and pricing without recreating the document.",
      "A Sales Order can be created without a Quote first.",
    ],
  },
  {
    heading: "SALES ORDER ACCEPTANCE",
    email: "Email 1",
    summary: "Desk clicks Accepted, attaches supporting docs, and five parties hear about it.",
    bullets: [
      "Popup: \"Any additional supporting documents?\" Yes / No. Yes = attach before completing.",
      "Acknowledgment emails to: Person Ordering (email on the SO) · Dealer (primary email on the dealer account) · Sales Group (Principal's email) · Salesperson (credited) · Additional Recipient (free-form name + email).",
      "Each email carries the SO info, the estimated ship date and the customer-facing documents.",
    ],
  },
  {
    heading: "INTERNAL DOCUMENTS",
    email: "Email 1",
    summary: "On accept, the system generates the production paperwork.",
    bullets: [
      "Work Order = the Sales Order with all pricing removed.",
      "Production Cover Sheet auto-fills TableX SO#, Customer PO#, Dealer, Ship Date.",
      "The real cover sheet (received 10/08) is Mark's purchasing worksheet: five checkboxes, vendor columns BASES / TOPS / OTHER with PO # and a cut-PO / drawings / acknowledged / proofed checklist, option-code grids, and a footer with rep, quote, disc, comm %, spiff and freight $.",
      "Both emailed automatically to production@tablex.com (TableX will create the mailbox).",
    ],
  },
  {
    heading: "PACKING SLIP",
    email: "Email 1",
    summary: "Generated and printed from the Sales Order.",
    bullets: ["Pulls from the order.", "Travels with the shipment."],
  },
  {
    heading: "SHIPPING & TRACKING",
    email: "Email 1",
    summary: "After pickup, the desk records the shipment and the orderer is told.",
    bullets: [
      "Carrier (dropdown of common carriers) + PRO / tracking number + other shipment info on the SO.",
      "Marking shipped emails the orderer: \"Your TableX order SO# ___ / Customer PO# ___ has shipped\" with carrier + tracking.",
    ],
  },
  {
    heading: "SHIPPING PHOTOS",
    email: "Email 1",
    summary: "Photos of every shipment, kept on the SO forever.",
    bullets: ["Upload and store on the SO record permanently.", "Evidence for freight and warranty claims."],
  },
  {
    heading: "PRODUCTION SCHEDULE",
    email: "Email 1",
    summary: "Mark runs it in ORDER STATUS.xlsx today. Move it into the system.",
    bullets: [
      "The file (received 10/08) is an open-order + vendor-PO tracker: one row per SO, 48 open sales orders (12 marked shipped / ready), SO 11890–12160, ≈ $400k net open.",
      "Columns: SO# · product-mix counts · Net Price · Cust PO# · Customer · PO Received · Ack. Ship Date · Shipped Date (date or \"R\") · per vendor (VALLEY bases, SMITH tops, OTHER ×2) PO / Due / Arrived · Review notes · City.",
      "SO Accepted → enters the schedule.",
      "Vendor PO# → added manually.",
      "Ship Date updated → schedule updates.",
      "Completed / Shipped → leaves the active schedule.",
      "Goal: no duplicate entry. The SO is the central record.",
    ],
  },
  {
    heading: "PACKAGING COSTS",
    email: "Email 2",
    summary: "The paper packaging worksheet goes on screen.",
    bullets: [
      "Today: Mark prints \"TablEx Packaging 3.xlsx\" with every order; Tony (Warehouse Manager) fills it out; it comes back to the office for invoicing; Patty tallies it for a P/L analysis.",
      "Ask: attach it to each SO, Mark updates the costs, Tony fills it in on screen, the backend calculates.",
      "The form (received 10/08): Material · Cost (rate) · Quantity Used · Subtotal for ~14 materials (banding per ft, V-board, honeycomb, foam, shrink wrap, U-channel, skids…), a Total, then Pallets 1–6 with dimensions + weight.",
    ],
  },
  {
    heading: "SPEX STUDIO FILES",
    email: "Email 3",
    summary: "A new price-book revision. Separate track from the order workflow.",
    bullets: [
      "SpeX_Studio_Series_Action_Tracker.xlsx: 158 SpeX Studio change requests across 16 tabs (all pages + one per series). A separate parallel track.",
      "Examples: picker order Shape → Size → Base Style; start with Full Table / Top Only / Base Only / Accessories Only; Power & Data as its own section; price fixes (locking casters $117, wire-management door $146); \"Counter Balance\" → \"Pneumatic\"; Slab → Squircle.",
      "TABLEX MASTER PRICING - OCTOBER 2026.xlsx = a new price-book revision.",
      "The September 2026 book is live today as the one book.",
    ],
  },
];

export const BRIAN_QUOTE =
  "Not every order has to begin with a Quote, but once a Sales Order exists, we want that order to become the single source of information throughout the remainder of the process.";

export const FILES_RECEIVED: { name: string; what: string }[] = [
  { name: "ORDER STATUS.xlsx", what: "Open-order + vendor-PO tracker, 48 open SOs, 12 shipped / ready (11890–12160), ≈ $400k net open" },
  { name: "Order Cover Sheet (PDF)", what: "Mark's one-page purchasing worksheet per SO" },
  { name: "TablEx Packaging 3.xlsx", what: "Per-SO packaging cost form + pallet dims and weight" },
  { name: "SpeX_Studio_Series_Action_Tracker.xlsx", what: "158 SpeX Studio change requests, 16 tabs" },
  { name: "TABLEX MASTER PRICING - OCTOBER 2026.xlsx", what: "New price-book revision" },
];

/* ------------------------------------------------------------------ */
/* 2 · What exists today                                               */
/* ------------------------------------------------------------------ */

export type LaneKey = "party" | "desk" | "system";

export const TODAY_LANES: { key: LaneKey; label: string; sub: string }[] = [
  { key: "party", label: "Dealer / Rep / Customer", sub: "tablex.com + portals" },
  { key: "desk", label: "TableX Desk", sub: "/ops" },
  { key: "system", label: "System", sub: "Emails + PDFs" },
];

export interface LaneStep {
  col: number;
  lane: LaneKey;
  title: string;
  detail: string;
  stop?: boolean;
}

/** Live flow on tablex.com. Columns run left to right. */
export const TODAY_STEPS: LaneStep[] = [
  { col: 1, lane: "party", title: "Configure in SpeX Studio", detail: "Add lines to the cart" },
  { col: 2, lane: "party", title: "Submit for pricing", detail: "Cart → quote request" },
  { col: 2, lane: "desk", title: "Or: new quote from scratch", detail: "/ops/quotes/new" },
  { col: 3, lane: "desk", title: "Price the quote", detail: "Lines, tier, freight, notes" },
  { col: 4, lane: "desk", title: "Send quote", detail: "Status → quoted" },
  { col: 4, lane: "system", title: "Revision + Quote PDF", detail: "\"Your quote is ready\" to creator, billing, contact, cc reps" },
  { col: 5, lane: "party", title: "Accept with PO", detail: "PO number + PO file" },
  { col: 5, lane: "desk", title: "Or: Accept on behalf", detail: "With a note" },
  { col: 6, lane: "desk", title: "Status accepted = the order", detail: "Order card, /ops/orders, portal orders, order summary PDF, SIF" },
  { col: 6, lane: "system", title: "Order emails", detail: "Desk inbox; desk accept → \"Order placed\" + 7-day PDF link" },
  { col: 7, lane: "desk", title: "STOP", detail: "Sam re-keys the PO into an accounting Sales Order by hand (9/25: Sage SO #12150)", stop: true },
];

export type MatrixStatus = "exists" | "partial" | "new";

export const MATRIX_META: Record<MatrixStatus, { label: string; chip: string; dot: string; tile: string }> = {
  exists: { label: "Exists", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", tile: "text-emerald-600" },
  partial: { label: "Partial", chip: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", tile: "text-amber-600" },
  new: { label: "New", chip: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", tile: "text-rose-600" },
};

export interface MatrixRow {
  ask: string;
  today: string;
  status: MatrixStatus;
  notes: string;
}

export const MATRIX: MatrixRow[] = [
  {
    ask: "Quote document",
    today: "Quote PDF (dealer + list variants), bid quote block",
    status: "exists",
    notes: "Title is hard-coded \"Quote\".",
  },
  {
    ask: "Sales Order document",
    today: "\"Order summary\" PDF for accepted quotes",
    status: "partial",
    notes: "Generated on request, not stored. No SO number, no title parameter.",
  },
  {
    ask: "Invoice document",
    today: "Not in the app",
    status: "new",
    notes: "Decision: invoices stay in the accounting system (Xero). The SO shows the invoice number and status later via read-only sync.",
  },
  {
    ask: "Edit after creation",
    today: "Full desk editing up to status quoted",
    status: "partial",
    notes: "Lines, qty, finishes, price overrides, add-ons, special height, tier, custom lines, bid phases, line notes, freight override, ship-to. ACCEPTED quotes lock lines and pricing (ship-to and details stay editable). No change orders.",
  },
  {
    ask: "Sales Order without a Quote",
    today: "/ops/quotes/new creates a desk quote from scratch",
    status: "exists",
    notes: "Nearly. It still passes through \"quoted\" before accept. Needs a \"create as order\" shortcut.",
  },
  {
    ask: "Supporting documents on accept",
    today: "quote_attachments (10 MB, 10 per quote, desk attaches on accepted quotes)",
    status: "partial",
    notes: "No category or type. No prompt during accept.",
  },
  {
    ask: "Acknowledgment emails to 5 parties",
    today: "Desk inbox always; dealer creator + quote contact only when the desk accepts",
    status: "partial",
    notes: "Reps in cc are skipped. Nothing reads contacts.is_primary. No rep-group principal, no salesperson credit, no extra recipient. Emails carry signed links, never file attachments.",
  },
  {
    ask: "Work Order",
    today: "Not built",
    status: "new",
    notes: "Code comments already reserve it as \"punch 36.4\".",
  },
  {
    ask: "Production Cover Sheet",
    today: "Paper purchasing worksheet",
    status: "new",
    notes: "Header = the four auto-fill fields. The rest (checkboxes, vendor PO checklists, option codes, rep / comm % / spiff footer) is a form completed in the app; option codes can derive from the configured lines.",
  },
  {
    ask: "Email to production@tablex.com",
    today: "Not built; mailbox does not exist",
    status: "new",
    notes: "INKY PhishFence quarantines own-domain mail from external senders. The allow rule for send.tablex.com must be in place.",
  },
  { ask: "Packing Slip", today: "Not built", status: "new", notes: "Same renderer as the SO, no pricing." },
  {
    ask: "Carrier / PRO / tracking + shipped email",
    today: "Destination data only",
    status: "new",
    notes: "Ship-to address, site contact, need-by, mark-for, terms, ship method exist. No carrier or tracking.",
  },
  { ask: "Shipping photos", today: "Not built", status: "new", notes: "Can ride on typed attachments." },
  {
    ask: "Production schedule",
    today: "Mark's ORDER STATUS.xlsx",
    status: "new",
    notes: "Nothing in the app. The sheet also tracks vendor POs (Valley, Smith, other) with PO / Due / Arrived per order.",
  },
  {
    ask: "Packaging cost sheet",
    today: "TablEx Packaging 3.xlsx, printed per order",
    status: "new",
    notes: "No cost or P/L data anywhere in the app. Form = rate × quantity per material + pallets with dims and weight.",
  },
  { ask: "Estimated ship date", today: "Not tracked", status: "new", notes: "No ship_date / estimated_ship columns." },
];

/* ------------------------------------------------------------------ */
/* 3 · After accept: the round trip                                    */
/* ------------------------------------------------------------------ */

export type RoundLane = "dealer" | "desk" | "production" | "warehouse" | "carrier" | "accounting" | "system";

export const ROUND_LANES: { key: RoundLane; label: string; who: string }[] = [
  { key: "dealer", label: "Dealer / Customer", who: "Orderer" },
  { key: "desk", label: "TableX Desk", who: "Sam" },
  { key: "production", label: "Production", who: "Mark" },
  { key: "warehouse", label: "Warehouse", who: "Tony" },
  { key: "carrier", label: "Carrier", who: "Freight" },
  { key: "accounting", label: "Accounting", who: "Patty + Xero" },
  { key: "system", label: "tablex.com", who: "System" },
];

export type When = "today" | "future" | "both";

export interface RoundCell {
  lane: RoundLane;
  text: string;
  when: When;
}

export interface RoundStage {
  n: number;
  title: string;
  confirm?: boolean;
  cells: RoundCell[];
}

export const ROUND_TRIP: RoundStage[] = [
  {
    n: 1,
    title: "Accept",
    cells: [
      { lane: "dealer", text: "Accepts with PO # + PO file", when: "today" },
      { lane: "desk", text: "Supporting-docs prompt", when: "future" },
      { lane: "system", text: "SO # from 13000 minted; acknowledgment to six recipients with est. ship date (lead time: 4 wk · Nesting 6 · QS 10 bd)", when: "future" },
    ],
  },
  {
    n: 2,
    title: "Hand off",
    cells: [
      { lane: "system", text: "Cover Sheet + Work Order + Packing Slip PDFs → production@", when: "future" },
      { lane: "production", text: "Order enters the production schedule", when: "future" },
    ],
  },
  {
    n: 3,
    title: "Produce",
    confirm: true,
    cells: [
      { lane: "production", text: "Issues vendor POs; builds / assembles", when: "today" },
      { lane: "production", text: "Vendor POs (Valley, Smith, other) with PO / due / arrived; ship-date edits propagate", when: "future" },
    ],
  },
  {
    n: 4,
    title: "Pack",
    cells: [
      { lane: "warehouse", text: "Packs the order", when: "today" },
      { lane: "warehouse", text: "Packaging cost sheet on screen; packing slip from the SO; photos to the SO", when: "future" },
    ],
  },
  {
    n: 5,
    title: "Ship",
    cells: [
      { lane: "carrier", text: "Picks up", when: "today" },
      { lane: "desk", text: "Carrier + PRO / tracking entered; status shipped", when: "future" },
      { lane: "system", text: "\"Has shipped\" email; leaves active schedule", when: "future" },
    ],
  },
  {
    n: 6,
    title: "Invoice",
    confirm: true,
    cells: [
      { lane: "accounting", text: "Patty turns the Sage SO into an invoice, types freight, picks the Cust PO#, emails + prints", when: "today" },
      { lane: "accounting", text: "Patty keys the Xero invoice from the SO (freight + Cust PO# already on it); Sage only for pre-cutover orders", when: "future" },
      { lane: "system", text: "Xero invoice # + status + paid date shown on the SO; margin per order", when: "future" },
    ],
  },
  {
    n: 7,
    title: "Get paid",
    confirm: true,
    cells: [
      { lane: "dealer", text: "Pays on terms (check / ACH)", when: "today" },
      { lane: "accounting", text: "ACH / check matched to the printed Sage invoice, marked paid in Sage", when: "today" },
      { lane: "system", text: "Paid status mirrors back; SO closed", when: "future" },
    ],
  },
];

export const ROUND_TRIP_NOTES = [
  {
    title: "Invoicing today (Patty, homework 10/08)",
    body: "At ship, Sage turns the SO into an invoice. Patty types freight if needed, manually picks the Customer PO# for that SO, emails the customer from Sage and prints a copy. ACH or check payments are matched to the printed invoice and marked paid in Sage. Net 30 for most; a select few prepay, which creates a pre-invoice before production.",
  },
  {
    title: "Invoicing from the cutover (Brian 10/12)",
    body: "Xero starts with the new system: every order the app issues is invoiced in Xero; orders already in Sage run out there. No Sage → Xero transfer, two systems for a short period. The SO already carries freight and the Cust PO#, so Patty keys the Xero invoice from it with nothing re-typed. The app reads the Xero invoice number, status and paid date back onto the SO through the read-only sync and webhooks; packaging cost plus invoice total gives a margin per order for the P/L.",
  },
];

export const ROUND_TRIP_QUESTIONS: { q: string; context: string; a?: string; open?: boolean }[] = [
  {
    q: "Which system holds Sales Orders and Invoices today: Sage or Xero?",
    context: "Feb interviews said Sage for SO, invoice and payments. Xero went live internally 9/14 after the ledger migration. On 9/25 Sam still keyed an SO into Sage (#12150). Our Xero sync sees 0 invoices Aug–Sep.",
    a: "Sage for both today (Sam + Patty, 10/08). Brian 10/12: Xero starts with the new system; Sage runs out its existing orders; nothing is transferred.",
  },
  {
    q: "Who creates the invoice, when (at ship? at order?), and from which document?",
    context: "",
    a: "Patty, at ship, from the SO (Sage's SO → invoice button; she adds freight and picks the Cust PO#). Same flow in Xero from the cutover, with both fields already on the SO.",
  },
  {
    q: "Payment terms: Net 30? Deposits or prepay for direct customers? Credit card?",
    context: "",
    a: "Net 30 for most. A select few prepay, which creates a pre-invoice before production. No credit card mentioned.",
  },
  {
    q: "Should the app CREATE the Xero invoice, or only mirror it?",
    context: "Xero write access is ruled out today. Writing is a separate decision.",
    a: "Brian: \"not sure, discuss.\" Mirror ships first; revisit create-in-Xero after the first month on two systems.",
    open: true,
  },
  {
    q: "SO numbering: reuse the TX-2026-#### quote number, or a separate SO series that matches the accounting system?",
    context: "Mark's tracker uses the accounting SO series (11890–12160); the orders table should store that number alongside the TX quote number.",
    a: "Both. SO# in the accounting series, starting at 13000 as the cutover marker; the TX quote number prints on the SO.",
  },
  {
    q: "Where does the estimated ship date come from?",
    context: "Mark's tracker has an \"Ack. Ship Date\" column. Is that the promised date, and what moves it?",
    a: "Lead time: 4 weeks, Nesting 6 weeks, Quick Ship 10 business days. Ship date = the day it leaves the dock; vendor back orders or defects push it, Mark moves it, early if the customer agrees.",
  },
  {
    q: "Commission / salesperson credit: who is \"the salesperson\" on an order, and where is that recorded today?",
    context: "Today it lives on paper: the cover sheet footer carries rep, comm % and spiff.",
    a: "A dropdown on the order filtered to the reps in the dealer's sales group. Dealers with locations in different territories become one org per location (IDNA Louisville vs Nashville).",
  },
];

/* ------------------------------------------------------------------ */
/* 4 · The build                                                       */
/* ------------------------------------------------------------------ */

export interface ModelBox {
  name: string;
  role: string;
  fields: string[];
  tone: "existing" | "new" | "extend";
}

export const MODEL_CORE: ModelBox[] = [
  {
    name: "quotes",
    role: "Unchanged. The line + pricing record.",
    fields: ["lines", "tier", "freight", "revisions", "ship-to"],
    tone: "existing",
  },
  {
    name: "orders",
    role: "New. One per accepted quote.",
    fields: [
      "so_number (accounting series, starts at 13000) + the TX quote number",
      "status: accepted · in_production · ready · shipped · invoiced · paid · closed",
      "estimated_ship (4 wk · nesting 6 wk · Quick Ship 10 business days) · shipped_at",
      "salesperson_contact_id (dropdown filtered to the dealer's sales group)",
      "prepay_required (pre-invoice before production)",
      "production notes · vendor_po",
      "xero_invoice_id / status / paid_at (once Patty invoices in Xero)",
    ],
    tone: "new",
  },
];

export const MODEL_CHILDREN: ModelBox[] = [
  { name: "order_shipments", role: "1:n per order", fields: ["carrier", "pro_number", "tracking_url", "picked_up_at"], tone: "new" },
  { name: "order_vendor_pos", role: "1:n per order", fields: ["vendor (Valley, Smith, Byrne…)", "po_number", "issued_at", "due", "arrived_at"], tone: "new" },
  { name: "quote_attachments.kind", role: "Extend existing", fields: ["customer_po", "change_note", "vendor_quote", "vendor_po_ack", "drawing", "electrical_po_ack", "freight_quote", "bol_pro", "shipping_photo", "cover_sheet"], tone: "extend" },
  { name: "packaging_costs", role: "Rates + entries", fields: ["rates by Mark, effective-from dated (change whenever a supplier does)", "per-order quantities by Tony", "pallets: dims + weight", "computed total", "P/L row: freight, commission, SPIFF, dealer tier, invoice total"], tone: "new" },
  { name: "order_recipients", role: "Who gets the emails", fields: ["person ordering", "dealer primary", "rep principal", "salesperson credited", "extra", "production@"], tone: "new" },
];

export const MODEL_DECISION =
  "Decided: the Sales Order is a new orders table keyed to the quote. Not columns on quotes, not copied lines.";

export interface Phase {
  key: string;
  label: string;
  title: string;
  items: string[];
  track?: "parallel" | "later";
}

export const PHASES: Phase[] = [
  {
    key: "p1",
    label: "P1",
    title: "Sales Order core",
    items: [
      "orders table + SO number from the accounting series, starting at 13000 (the cutover marker); TX quote number printed on the SO",
      "\"Create order\" from a desk quote; \"New order\" without a quote",
      "Estimated ship date proposed from lead time (4 weeks · Nesting 6 weeks · Quick Ship 10 business days); Mark moves it",
      "Change orders: re-open lines and pricing on an accepted order under a new revision snapshot",
      "One PDF renderer with a document title + show-pricing flag → Quote / Sales Order / Work Order / Packing Slip (Packing Slip = the Work Order)",
      "Production Cover Sheet: header auto-fills TX SO#, Cust PO#, Dealer, Ship Date; the five desk checkboxes go away; option-code grid stays Mark's (BOM per SKU = a later phase)",
      "Auto-email Cover Sheet + Work Order + Packing Slip to production@ (Mark)",
      "Target Mon 10/19 (Brian): orders + SO series + the three PDFs + production@ email first; cover sheet form and change orders the week after (proposed split, confirm today)",
    ],
  },
  {
    key: "p2",
    label: "P2",
    title: "People + acknowledgments",
    items: [
      "Six recipients confirmed: person ordering, dealer primary, sales-group principal, salesperson credited, extra free-form, production@",
      "Salesperson = dropdown on the order, filtered to the reps in the dealer's sales group; dealers with locations in different territories become one org per location (IDNA Louisville / IDNA Nashville)",
      "Reps and principals SEE pricing on acknowledgments (Brian: yes)",
      "Supporting-docs prompt on Accept with typed attachment kinds (customer PO, change notes, vendor quotes, vendor PO + ack, drawings, electrical PO + ack)",
      "Acknowledgment with SO#, Cust PO#, estimated ship date and signed links",
    ],
  },
  {
    key: "p3",
    label: "P3",
    title: "Ship + track",
    items: [
      "Carriers: Central Transport · R&L Carriers · WATCO · UPS · Other (typed) · Customer Pick-Up",
      "PRO / tracking entered by whoever is there (usually Patty, next day): no role gate beyond staff",
      "Ready status (Mark's \"R\") → Shipped + \"has shipped\" email; ship date = the day it leaves the dock",
      "Shipping photos: one per pallet, from Mark's phone, straight onto the order (replaces email-to-Patty + shared-server filing)",
      "Post-ship attachments: freight quote, BOL + PRO#, packaging costs",
    ],
  },
  {
    key: "p4",
    label: "P4",
    title: "Production schedule",
    items: [
      "/ops/production board replacing ORDER STATUS.xlsx",
      "Columns Mark kept (16 of 19): SO# · Non-Nesting / Nesting / Bases Only / Tops Only / Misc · Net · Cust PO# · Customer · Ack. ship date · Shipped date (R = ready) · Valley / Smith / Other ×2 PO-Due-Arrived · Review notes. Dropped: PO Received, City, Returned-to-stock. Brian wants to consolidate further.",
      "Vendor PO groups per order (Valley bases, Smith tops, other vendors): PO / due / arrived",
      "Accepted → active; ship-date edits; shipped drops off",
    ],
  },
  {
    key: "p5",
    label: "P5",
    title: "Packaging costs",
    items: [
      "Mark's rate table with units (per foot / per piece / per strip), dated: rates change whenever a supplier changes price, orders keep the rate they used",
      "Tony's per-order quantity rows + pallets 1–6 with dims and weight (also useful for freight) + auto total",
      "Patty's P/L per order: packaging total · warehouse time · freight cost · commission · SPIFF · dealer tier · vendor charges · invoice total · accepted + shipped dates · customer · ship-to state · P/L total",
    ],
  },
  {
    key: "pricing",
    label: "Parallel",
    title: "OCTOBER 2026 master pricing import",
    items: ["New price-book revision from Brian's workbook", "Independent of P1–P5"],
    track: "parallel",
  },
  {
    key: "spex-tracker",
    label: "Milestone ~10/19",
    title: "SpeX Studio catalog update (back online ~10/19)",
    items: [
      "Isolated from P1–P5: no shared tables or screens, but catalog and price changes can force rework in the order documents and the October price import",
      "Surge-only Rectangular with 2-column Disc Base (Mark 10/09): 24×36 · 24×48 · 30×36 · 30×48 · 36×48, Static, 99TC{size}QD2032.2. Already in the book and the SpeX Surge catalog; Mark sees it missing, so name it as its own base in the Surge section. Costs: SURGE tab of Brian's workbook",
      "Bottom Wire Exit, Primary + Surge disc bases only: $140 list (Mark 10/09). New SpeX option; the book's intro text still says \"Bottom Cord Exit\" $132",
      "Power Box mounting plate: disc + X-bases, squares and rounds, ONLY with center power: $105 list, $346 list with Bottom Wire Exit (one charge, not the $245 sum). New SpeX option tied to center power",
      "Elite Trestle (V-base) price table: 37 models across Rectangular / Boat / Racetrack. The site book holds them with no category (\"Models without a book category\"), priced from the old book per Mark; fix in the October import from the ELITE TRESTLE tab",
      "SpeX action tracker: 158 change requests across 16 tabs (all pages 20 · Surge 16 · Primary 15 · VertiGO 13 · Foundation 12 · Stretch 11 · Puddle 11 · Elite 9 · Justice 8 · Solo 8 · Trig 8 · Element 7 · Exclaim 7 · Artisan 5 · App 4 · Ultra 4): picker order, start modes, Power & Data section, price fixes, renames, per-series options",
    ],
    track: "parallel",
  },
  {
    key: "xero",
    label: "With P1",
    title: "Xero invoice mirroring",
    items: [
      "Brian 10/12: Xero starts WITH the new system. Every order the app creates is invoiced in Xero; Sage runs out its existing orders in parallel (two systems for a short period, no Sage → Xero transfer).",
      "Mirror: the SO shows the Xero invoice number, status and paid date through the read-only sync; webhooks (web-xero-webhooks) make it live",
      "Create-in-Xero vs mirror: Brian said \"discuss\"; any Xero WRITE is a separate decision. Mirror ships first; Patty keys the invoice in Xero from the SO.",
    ],
  },
];

export const REUSE = [
  "Desk quote editor",
  "Revisions",
  "Accept on behalf",
  "PO upload",
  "Attachments",
  "Ship-to card",
  "Order summary PDF",
  "SIF export",
  "Resend email templates",
  "CRM orgs / contacts / rep territories",
  "Xero read-only sync",
];

/* ------------------------------------------------------------------ */
/* 5 · Challenges & decisions                                          */
/* ------------------------------------------------------------------ */

export interface Challenge {
  title: string;
  kind: "decided" | "open" | "risk";
  body: string;
}

export const CHALLENGES: Challenge[] = [
  {
    title: "Invoice stays in Xero",
    kind: "decided",
    body: "One invoice number. Accounting is the book of record. Our Xero integration is read-only by rule. The app mirrors invoice status onto the SO. Brian 10/12: Xero invoicing starts with the first order the new system takes; Sage keeps only the orders already in it until they ship and are paid.",
  },
  {
    title: "Editing after acceptance = change orders",
    kind: "decided",
    body: "The acknowledgment already went out, so edits become a change order with a revision trail, never a silent edit.",
  },
  {
    title: "Email attachments: signed links, not files",
    kind: "decided",
    body: "Files bloat mail and get blocked. Signed links keep access secure and expiring, and the documents always match the record.",
  },
  {
    title: "production@ mailbox + INKY allow rule",
    kind: "risk",
    body: "TableX creates the mailbox. INKY PhishFence quarantines own-domain mail from outside senders, so the allow rule for send.tablex.com must land first.",
  },
  {
    title: "SO numbering: accounting series from 13000",
    kind: "decided",
    body: "Brian: the SO# drives, tied to the accounting system, starting at 13000 so the cutover is obvious forever; the TX quote number prints on the SO.",
  },
  {
    title: "Estimated ship date = lead time, Mark moves it",
    kind: "decided",
    body: "Mark: propose 4 weeks for everything, 6 for Nesting, 10 business days for Quick Ship. Ack. Ship Date is the promise; vendor back orders (laminate, edgeband, powder) or defects push it, and it can pull in if the customer agrees. Ship date = the day it leaves the dock.",
  },
  {
    title: "Brian wants the first phase live Mon 10/19",
    kind: "risk",
    body: "\"Hoping the updates could be made and tested next week.\" P1 as scoped (orders, SO series, four documents, cover sheet, production@ email, change orders) is more than a week. Proposal: ship orders + SO# + Sales Order / Work Order / Packing Slip + production@ email by 10/19, cover sheet and change orders the week after.",
  },
  {
    title: "Sage → Xero invoicing date",
    kind: "decided",
    body: "Brian 10/12: \"Our plan was start Xero with the use of the new system … just run out Sage and any new order would be handled through Xero.\" The cutover date IS the P1 go-live (10/19). No existing Sage orders move; two systems run for a short period. The Xero mirror is unblocked.",
  },
  {
    title: "Create the Xero invoice, or mirror it?",
    kind: "open",
    body: "Brian answered \"not sure, discuss\". Recommendation stays mirror-only (read-only Xero rule): Patty keys the invoice in Xero from the SO, which already holds freight + Cust PO# (the two things she types today). Revisit create-in-Xero after the first month on two systems.",
  },
  {
    title: "Cover sheet is really the purchasing worksheet",
    kind: "risk",
    body: "Mark settled it: the app fills TX SO#, Cust PO#, Dealer and Ship Date; the five desk checkboxes (Ack Cust, Add to Schedule, Updated Queue, Production Review, Check Ship To) disappear with the automation; the option-code grid stays his to tick (Reed can go) until a per-SKU BOM exists.",
  },
  {
    title: "Scope size",
    kind: "risk",
    body: "This is a second project-sized effort, not a punch list. Danny has flagged it to Richie.",
  },
  {
    title: "Who owns each step",
    kind: "decided",
    body: "Desk (Sam) accepts and picks the salesperson · Mark confirms the ship date, ticks the option grid, takes one photo per pallet · whoever is there (usually Patty, next day) enters carrier + PRO · Tony fills packaging quantities · Patty reads the P/L and invoices.",
  },
  {
    title: "SpeX catalog milestone ~10/19 runs beside the order build",
    kind: "risk",
    body: "SpeX Studio comes back online around 10/19 with Mark's catalog changes (Surge 2-column disc, Bottom Wire Exit, Power Box, Elite Trestle pricing), on the same week as P1. It shares no screens with the order workflow, but new options and re-categorised price rows land on quotes and SO lines, so the October price import and the order PDFs may need rework.",
  },
  {
    title: "Multi-location dealers cross rep territories",
    kind: "decided",
    body: "Brian's example: IDNA Louisville (Melissa Meeks & Associates) vs IDNA Nashville (IMG South). One dealer org per location so the salesperson dropdown filters correctly.",
  },
];

/* ------------------------------------------------------------------ */
/* 6 · Answers and rulings (homework complete 10/08)                   */
/* ------------------------------------------------------------------ */

export type RulingStatus = "decided" | "open" | "flag";

export interface Ruling {
  topic: string;
  asked: string;
  by: Person;
  answer: string;
  quote?: string;
  build: string[];
  status: RulingStatus;
}

export const RULING_GROUPS: { title: string; sub: string; rulings: Ruling[] }[] = [
  {
    title: "Scope and timing",
    sub: "Brian's priority and date",
    rulings: [
      {
        topic: "Build order",
        asked: "Priority order of P1–P5?",
        by: "brian",
        answer: "P1 → P2 → P3 → P4 → P5, as proposed.",
        quote: "This would be my priority order.",
        build: ["Phases stand as drawn. Pricing import and the SpeX tracker run in parallel."],
        status: "decided",
      },
      {
        topic: "First phase live",
        asked: "When do you need the first phase live?",
        by: "brian",
        answer: "Re-read on 10/12 (round 2): what must be done by Mon 10/19 is the SpeX Studio corrections. TableX tests SpeX the week of 10/19 and it goes back to the public Mon 10/26. On the orders go-live Brian is open on the date.",
        quote: "The only thing I was thinking would need to be done by 10/19 would be the corrections to SpeX Studio. Then we can use that week to test it out and launch back to public on 10/26.",
        build: [
          "Week 1 (10/14 to 10/18): October price book + the SpeX action tracker, on staging.tablex.com for TableX's test week 10/19 to 10/25; public relaunch 10/26.",
          "Orders P1 core (orders table, SO series, Sales Order / Work Order / Packing Slip, production@ email) builds the week of 10/21; the first app-issued SO, and with it the Xero start, is Mon 10/26.",
          "Cover sheet form and change orders follow P1 core; the engagement end moves one week, to Fri 11/07.",
        ],
        status: "decided",
      },
    ],
  },
  {
    title: "Numbering and documents",
    sub: "What the SO is, what prints, who gets it",
    rulings: [
      {
        topic: "SO number",
        asked: "Reuse the TX quote number, a separate series, or both?",
        by: "brian",
        answer: "Both. The SO# is the driver and belongs to the accounting series; start at 13000 so the cutover point is obvious; show the quote number on the SO.",
        build: ["orders.so_number from a sequence starting at 13000.", "Quote number printed under the SO number on every document.", "Sage SO entry stops at the cutover; Sam keys nothing twice."],
        status: "decided",
      },
      {
        topic: "Cover sheet",
        asked: "Which cover-sheet checkboxes should the app tick by itself?",
        by: "mark",
        answer: "None. Auto-fill only TX SO#, Cust PO#, Dealer, Ship Date. With the automation the five desk checkboxes are no longer needed. Mark handles the rest.",
        build: ["Cover sheet = header auto-filled + option-code grid Mark ticks in the app (Reed removed).", "Phase 2 later: a BOM per SKU would tick the grid automatically; TableX has no BOM data today."],
        status: "decided",
      },
      {
        topic: "Packing slip + production@",
        asked: "What does the packing slip show? Does production@ get it?",
        by: "sam",
        answer: "Packing slip = the Work Order (SO without pricing). Yes to production@: Mark receives Cover Sheet, Work Order and Packing Slip there.",
        build: ["One renderer, three titles. production@ gets all three on accept.", "production@tablex.com exists and is operational (Brian 10/12). The INKY allow rule for send.tablex.com is still unconfirmed; without it the production emails are quarantined."],
        status: "decided",
      },
      {
        topic: "Supporting documents",
        asked: "What rides with an order?",
        by: "sam",
        answer: "Internal, kept with the SO: cover sheet, sales order, customer PO, change notes, vendor quotes for custom laminates / finishes / accessories, vendor PO + acknowledgment PDF, top drawings, electrical PO + acknowledgment. After ship: freight quote, bill of lading + PRO#, packaging costs.",
        build: ["quote_attachments.kind gets those names; the Accept prompt offers them as upload slots.", "Post-ship kinds unlock once the order is marked shipped."],
        status: "decided",
      },
      {
        topic: "Change orders",
        asked: "After the acknowledgment, who approves a change, and does it re-acknowledge?",
        by: "mark",
        answer: "Sam edits, Mark approves before production sees it. The approval request goes to production@tablex.com.",
        quote: "The approval should go to production@tablex.com",
        build: ["A change order re-opens the lines under a new revision snapshot in a pending state; Mark approves from the production@ email or the order page; approval re-acknowledges all six recipients."],
        status: "decided",
      },
      {
        topic: "Orders without a quote",
        asked: "Phone or emailed PO with no tablex.com quote: desk quote first, or a New order form?",
        by: "sam",
        answer: "Straight to a sales order without a quote.",
        quote: "Hopefully, convert it straight to a sales order without a quote.",
        build: ["P1 keeps the New order form (web-so-core s3): the desk line editor on an order shell, SO# assigned on save, no quote row required."],
        status: "decided",
      },
    ],
  },
  {
    title: "People and acknowledgments",
    sub: "Who is told, what they see",
    rulings: [
      {
        topic: "Recipients",
        asked: "Confirm the acknowledgment recipients.",
        by: "brian",
        answer: "All six: person ordering, dealer primary email, sales-group principal, salesperson credited, additional free-form recipient, production@.",
        build: ["order_recipients rows per order; production@ is a fixed system recipient."],
        status: "decided",
      },
      {
        topic: "Pricing on acknowledgments",
        asked: "Should reps and principals see pricing?",
        by: "brian",
        answer: "Yes.",
        build: ["The acknowledgment carries dealer net for every recipient. Rep portal surfaces stay zero-dollar; only the email changes."],
        status: "decided",
      },
      {
        topic: "Salesperson credit",
        asked: "Who is the salesperson on an order, and where does the app get it?",
        by: "brian",
        answer: "A dropdown on the order, listing only the reps in the sales group the dealer is connected to. The person entering knows who they worked with.",
        quote: "IDNA's main location is in Louisville, KY (Melissa Meeks & Associates) … IDNA also has a location in Nashville, TN which would be IMG South. We may just need to set IDNA up twice.",
        build: ["orders.salesperson_contact_id; options = contacts on the dealer's rep group (via rep_territories).", "Dealers with locations in different territories become one org per location."],
        status: "decided",
      },
      {
        topic: "Dashboard logins",
        asked: "Who else needs a dashboard login?",
        by: "brian",
        answer: "Sam, Richie, Patty.",
        build: ["Sam and Patty created 10/14 as contributors with proposal access and a set password (INKY quarantines invites; Brian passes the passwords on). Richie already has an admin login."],
        status: "decided",
      },
    ],
  },
  {
    title: "Ship and track",
    sub: "Dates, carriers, photos",
    rulings: [
      {
        topic: "Estimated ship date",
        asked: "Where does it come from, and what moves it?",
        by: "mark",
        answer: "Standard lead time: 4 weeks for everything, 6 weeks for Nesting, 10 business days for Quick Ship. Ship date = the day it leaves the dock. Vendor supply (laminate, edgeband, powder back orders) or defects after production push it; it can ship early if the customer agrees.",
        build: ["estimated_ship proposed from lead-time class on accept; Mark edits it on the order and the schedule.", "Every move re-sends the acknowledgment automatically to all six recipients (Mark 10/12).", "Prepay orders: the lead-time clock starts when the pre-invoice is paid, not at accept (Sam 10/12)."],
        status: "decided",
      },
      {
        topic: "Carriers",
        asked: "List the carriers for the dropdown.",
        by: "mark",
        answer: "Central Transport, R&L Carriers, WATCO, UPS, Other (typed in), Customer Pick-Up.",
        build: ["order_shipments.carrier enum + free text for Other."],
        status: "decided",
      },
      {
        topic: "Ready and shipped",
        asked: "What does \"R\" mean, and who enters tracking?",
        by: "sam",
        answer: "R = Ready to ship. Tracking is entered by whoever is there, typically Patty the next day.",
        build: ["Order status gains ready between in_production and shipped.", "Any staff login can enter carrier + PRO; no role gate."],
        status: "decided",
      },
      {
        topic: "Shipping photos",
        asked: "How many photos, who takes them?",
        by: "sam",
        answer: "One picture per pallet. Mark takes it on his phone, emails it to Patty, and she files it on the shared server under the SO#.",
        build: ["Phone-friendly upload on the order page (camera capture), stored as shipping_photo on the SO. The email-and-file step disappears."],
        status: "decided",
      },
    ],
  },
  {
    title: "Production schedule",
    sub: "What replaces ORDER STATUS.xlsx",
    rulings: [
      {
        topic: "Columns",
        asked: "Which columns must the production board keep?",
        by: "mark",
        answer: "16 of 19: SO#, Non-Nesting, Nesting, Bases Only, Tops Only, Misc, Net Price, Cust PO#, Customer, Ack. Ship Date, Shipped Date, Valley / Smith / Other ×2 PO-Due-Arrived, Review notes. Dropped: PO Received, City, Returned-to-stock list.",
        quote: "Brian has a couple thoughts on how we might be able to eliminate a few columns while still have all of this info.",
        build: ["/ops/production board with those columns; product-mix counts derive from the lines.", "Vendor PO groups per order. Brian's consolidation ideas go into the first review."],
        status: "decided",
      },
      {
        topic: "Vendor PO entry",
        asked: "Who keys the Valley / Smith / other vendor POs?",
        by: "mark",
        answer: "Mark, on the production board, when the PO is cut.",
        build: ["PO / due / arrived per vendor are editable on the board row; Sam's acceptance step does not ask for them."],
        status: "decided",
      },
    ],
  },
  {
    title: "Accounting",
    sub: "Patty and Sam on invoices, terms, payments",
    rulings: [
      {
        topic: "System today",
        asked: "Sage or Xero?",
        by: "patty",
        answer: "Sage for both the SO and the invoice today. Brian 10/12: Xero starts with the new system. New orders are invoiced in Xero from day one; existing Sage orders run out in Sage; nothing is transferred.",
        quote: "Our plan was start Xero with the use of the new system. We did not plan to shift current orders over into Xero … I know we would have to use two systems for a short period but operationally I feel this could be cleaner and easier.",
        build: ["Cutover = P1 go-live. web-xero-invoice-mirror and web-xero-webhooks are no longer gated; the mirror ships alongside P1.", "The SO never carries a hand-typed invoice number; the Xero sync fills it."],
        status: "decided",
      },
      {
        topic: "Invoice creation",
        asked: "When, from what, what is re-typed?",
        by: "patty",
        answer: "At ship. Sage has a button that turns the SO into an invoice; Patty types freight if needed, manually picks the Customer PO# for that SO, emails the customer from Sage and prints a copy.",
        quote: "Brian: if all of this is housed within the electronic SO, we no longer need to print these documents.",
        build: ["The SO already holds freight and the Cust PO#, so Patty keys the Xero invoice from the SO with nothing re-typed.", "Create-in-Xero vs mirror stays open (Brian: discuss). Recommendation: mirror first; revisit after the first month."],
        status: "open",
      },
      {
        topic: "Terms",
        asked: "Payment terms in use?",
        by: "patty",
        answer: "Net 30 for most. A select few prepay, which creates a pre-invoice before production starts.",
        build: ["orders.prepay_required, set by Patty from the customer record (Sam 10/12); a prepaid order waits in awaiting payment until the pre-invoice is paid, then enters production and the lead-time clock starts.", "Open with Patty: how the pre-invoice is produced today and whether the app should raise it from the SO (the one round-2 question still blank)."],
        status: "decided",
      },
      {
        topic: "Payments",
        asked: "How is a payment recorded?",
        by: "patty",
        answer: "ACH or check arrives, Patty matches it to the printed Sage invoice and marks it paid in Sage.",
        build: ["Paid status mirrors from Xero onto the SO once invoicing lives there; no manual paid toggle in the app."],
        status: "decided",
      },
      {
        topic: "Xero gap, April → cutover",
        asked: "Xero has no sales invoices after 3/31/26 (P&L journals only). Backfill from Sage, or Move My Ledger?",
        by: "brian",
        answer: "Confirmed: nothing has been posted to Xero since April. TableX does it themselves if at all (Move My Ledger was \"horrible to work with\"). No plan to move Sage orders into Xero; the Sage → Xero import was \"very time consuming and problematic.\"",
        quote: "We want to do things ourselves. Move My Ledger was horrible to work with.",
        build: ["Customer / series / rep reporting in Xero stays blind from April 2026 until TableX imports the Sage register (Xero sales-invoice CSV). Not our build.", "The financials dashboard reads fin_invoices from Xero only; the April → cutover months remain P&L totals.", "Patty 10/14: undecided; most likely Sage is finished out and switched off once its invoices are paid."],
        status: "flag",
      },
      {
        topic: "Xero ready for day one",
        asked: "Can Patty raise a sales invoice in Xero from the SO on the first day, and are the dealers in Xero?",
        by: "patty",
        answer: "Yes on both: template and tax are set up as far as TableX knows, and the active dealers are all in Xero.",
        quote: "As far as we know we are set up to handle this. The template should be set up, tax, etc.",
        build: ["Nothing gates the cutover on the Xero side. The first app-issued SO (Mon 10/26) is the first Xero invoice."],
        status: "decided",
      },
    ],
  },
  {
    title: "Packaging and P/L",
    sub: "Rates and the per-order analysis",
    rulings: [
      {
        topic: "Rate changes",
        asked: "How often do packaging rates change?",
        by: "mark",
        answer: "Whenever a supplier changes price.",
        build: ["Rate table with effective-from dates; each order keeps the rate it was costed at."],
        status: "decided",
      },
      {
        topic: "P/L needs",
        asked: "What does the packaging P/L analysis need from each order?",
        by: "patty",
        answer: "Packaging material total, warehouse time, freight cost, commission, invoice total, other. Plus SPIFF, dealer discount tier (50/20 …), date accepted and date shipped, customer name, vendor charges, ship-to state, P/L total.",
        build: ["One P/L row per order from fields the SO already has (tier, dates, customer, ship-to, vendor POs) plus the packaging and commission entries; CSV export for Patty."],
        status: "decided",
      },
    ],
  },
  {
    title: "SpeX catalog (Mark, 10/09)",
    sub: "Two emails to Danny cc Brian: Disk Bases (08:46) and Elite Trestle (09:13). Needed for SpeX Studio back online ~10/19.",
    rulings: [
      {
        topic: "Surge 2-column disc base",
        asked: "What is missing from the Surge section?",
        by: "mark",
        answer: "Rectangular with 2-column Disc Base, Surge only, five sizes, all Static: 24×36 (99TC2436QD2032.2) · 24×48 (99TC2448QD2032.2) · 30×36 (99TC3036QD2032.2) · 30×48 (99TC3048QD2032.2) · 36×48 (99TC3648QD2032.2).",
        quote: "This is missing in the Surge section. These are ONLY available in the Surge series. These are the only sizes available.",
        build: [
          "Exists: all five models are in the September book under \"Rectangular with 2-column Disc Base\", in the SpeX model map, and in the SpeX Surge catalog with built GLBs (grouped under the generic \"Rectangular / Square Disc\" label).",
          "New: show it as its own base in the Surge section with Mark's name and his five sizes only. Confirm with Mark which surface he found it missing on.",
        ],
        status: "decided",
      },
      {
        topic: "Surge 2-column disc costs",
        asked: "Where do the Surge 2-column disc prices come from?",
        by: "mark",
        answer: "From the pricing matrix Brian sent. Mark can supply the costs if needed.",
        quote: "Cost of these tables should be in the pricing matrix that Brian has sent. Let me know if you need these costs.",
        build: ["The SURGE tab of the OCTOBER 2026 workbook carries the model numbers and prices; the October import is the source. Mark 10/12: the base is in the configurator, so the work is its own label and Mark's five sizes."],
        status: "decided",
      },
      {
        topic: "Bottom Wire Exit",
        asked: "Bottom Wire Exit: where and how much?",
        by: "mark",
        answer: "Primary and Surge disc bases only. Wires run through the column from the mounting plate to the floor (Ø2½″ hole through the weight and cover). $140 list.",
        quote: "Available on the Primary and Surge disk bases. Wires are slipped through the column from the mounting plate to the floor. Upcharge is $140 list.",
        build: [
          "Exists: the book's introduction text only, as \"BWE · Bottom Cord Exit\", 44 or 99 disc bases, $132. No SpeX option, no structured charge.",
          "New: a SpeX option on Primary (44) and Surge (99) disc bases at $140 list, carried onto quote and SO lines.",
        ],
        status: "decided",
      },
      {
        topic: "Power Box mounting plate",
        asked: "Power Box: where and how much?",
        by: "mark",
        answer: "Disc bases and X-bases, squares and rounds, only when power is centered in the top. U-shaped plate; wires run down inside the column and out a hole in the side and bottom. $105 list; $346 list together with a Bottom Wire Exit.",
        quote: "IF used with a Bottom Wire Exit and a power box the list upcharge is $346.",
        build: [
          "Exists: SpeX center power (Villa units and their top supports) and the book text \"PB Powerbox Mounting Plate\" at $100 / $329 with BWE. No Power Box option in SpeX.",
          "New: offer Power Box only when center power is chosen on a square or round disc or X-base; price $105. With Bottom Wire Exit the charge is the plain sum, $245 (Mark 10/12: \"should be $245\"; the book's $346 was a years-old figure).",
        ],
        status: "decided",
      },
      {
        topic: "Elite Trestle base pricing",
        asked: "Why is Elite Trestle under \"Models without a book category\"?",
        by: "mark",
        answer: "It is the Elite Trestle V-base. The price shown comes from the old book; it should come from its own tab in the workbook. Mark's screenshots: 37 models, Rectangular 30–48 wide × 60–144 (20), Boat-shaped 30×42 to 36×48 × 84–144 (6), Racetrack 36–48 × 72–144 (11); 96″ sizes starred (oversized), 120″ and 144″ add a third base (T32-TJ). Six photos and renders attached.",
        quote: "This is our Elite series Trestle base, pricing, listed here, is from the old price book. The pricing should have its own tab on the pricing excel tab previously sent.",
        build: [
          "Exists: an ELITE TRESTLE tab in both the September and October workbooks. The site book holds 74 08…VTR rows with NO category, so the Elite price list files them under \"Models without a book category\". SpeX already treats VTR as a verified Elite base.",
          "New: in the October import, give the tab its three categories (Rectangular / Boat-shaped / Racetrack with Trestle V-bases) and price from the October tab as it stands (Mark 10/12: yes, Brian added the increase). The October workbook renames OPTIONS and adds an ADD ONS tab; the extractor handles both.",
        ],
        status: "decided",
      },
    ],
  },
];

/** Questions teed up for the 10/12 walkthrough. The call ran out of time, so they became ROUND-2 HOMEWORK (HOMEWORK entries with round: 2) on each person's tab. */
export const TODAY_QUESTIONS: { for: Person | "all"; q: string; why: string }[] = [
  { for: "brian", q: "Confirm the 10/19 split: orders + SO# + Sales Order / Work Order / Packing Slip + production@ email first; cover sheet form and change orders the week after?", why: "P1 as scoped is more than a week. The split keeps Monday real." },
  { for: "all", q: "Day-one cutover: the first order the app issues is the first Xero invoice. Is Patty set up to raise a sales invoice in Xero from the SO on 10/19, and is the dealer list in Xero current enough?", why: "Brian 10/12: Xero starts with the new system. Our sync sees 1,590 Xero contacts; the invoice needs the right one." },
  { for: "sam", q: "Orders that arrive without a tablex.com quote (phone, email PO against an old quote): does Sam build a desk quote first, or does \"New order\" need its own line entry?", why: "Decides whether P1 needs a quote-less order form or just the existing desk quote editor." },
  { for: "sam", q: "Prepay orders: who flags an order as prepay at accept, and does production wait for the pre-invoice to be paid?", why: "Patty: a select few prepay. We proposed accepted → waits for payment → production." },
  { for: "mark", q: "When the ship date moves, should the acknowledgment re-send to all six recipients automatically, or only on Mark's say-so?", why: "Every move is logged either way; the question is who the email goes to and when." },
  { for: "mark", q: "Change orders after the acknowledgment: who approves (Sam, Mark, Brian), and does a changed order re-acknowledge with a new revision?", why: "Change orders are in P1 scope; approval and re-ack rules are not yet ruled." },
  { for: "mark", q: "Vendor POs (Valley, Smith, other): entered on the production board by Mark, or does Sam key them at accept?", why: "P4 board carries PO / due / arrived per vendor; someone owns the entry." },
  { for: "brian", q: "production@tablex.com + the INKY allow rule for send.tablex.com: on track for Wed 10/14?", why: "Without it every auto-email to production@ lands in quarantine." },
  { for: "all", q: "Sam and Patty dashboard logins (contributor + proposal access, password set by hand): create them today?", why: "Only Brian and Mark can sign in; INKY quarantines invites, so logins are created with a password and shared out of band." },
];

export const SAM_TODAY =
  "I type out the entire quote into an excel file. If ordered, I then retype into another excel file. Then I print the SO, WO, Packing Slip, any email or notes that need to accompany the job, add the cover sheet and add the customer and job info to the cover sheet, then add to schedule (which is another spreadsheet), then acknowledge customer via email, then lay on Mark's desk.";

export const NEXT_STEPS = [
  { t: "Confirm the 10/19 split with Brian", d: "Orders + SO series + three PDFs + production@ email first; cover sheet and change orders the week after." },
  { t: "Xero cutover = P1 go-live (Brian 10/12)", d: "New orders invoice in Xero from the first SO the app issues; Sage runs out. Patty needs the Xero sales-invoice flow ready the same day." },
  { t: "April → cutover Xero gap", d: "TableX's call whether to import the Sage register. Reporting by customer stays blind for those months otherwise." },
  { t: "TableX creates production@tablex.com", d: "Plus the INKY allow rule for send.tablex.com, or the auto-emails land in quarantine." },
  { t: "Scope + estimate to Richie", d: "Second project-sized effort, quoted separately." },
  { t: "Elite Trestle prices from their own tab (Brian/Mark)", d: "Confirm the ELITE TRESTLE tab in the October workbook is current; the October import then replaces the old-book prices and files the 37 models under their three shapes." },
  { t: "Confirm Surge 2-column disc costs", d: "Check the five 99TC…QD2032.2 rows price from the SURGE tab in the October import; ask Mark for costs only if any are missing." },
];

/* ------------------------------------------------------------------ */
/* 7 · Homework (per-person question flows, answers persisted)         */
/* ------------------------------------------------------------------ */

export type Person = "brian" | "mark" | "sam" | "patty";

export const PEOPLE: Record<Person, { name: string; first: string; role: string }> = {
  brian: { name: "Brian Craig", first: "Brian", role: "VP Sales + Marketing" },
  mark: { name: "Mark Fleck", first: "Mark", role: "Operations / Production" },
  sam: { name: "Sam Sander", first: "Sam", role: "Customer service desk" },
  patty: { name: "Patty Wollenmann", first: "Patty", role: "Accounting" },
};

export type AnswerType = "text" | "single" | "multi" | "rank" | "date" | "number";

export type ContextBlock =
  | { kind: "note"; title?: string; text: string }
  | { kind: "list"; title?: string; items: string[]; ordered?: boolean }
  | { kind: "facts"; title?: string; rows: [string, string][] }
  | { kind: "table"; title?: string; headers: string[]; rows: string[][] }
  | { kind: "cards"; title?: string; cards: { title: string; body: string; tag?: string }[] }
  | { kind: "pre"; title?: string; text: string };

export interface HomeworkOption {
  id: string;
  label: string;
  hint?: string;
}

export interface HomeworkQuestion {
  id: string;
  type: AnswerType;
  prompt: string;
  why?: string;
  options?: HomeworkOption[];
  unit?: string;
  rows?: number;
  context?: ContextBlock[];
  /** 2 = asked after the 10/12 walkthrough (not reached on the call). 3 = the last open items before the 10/19 date, added 10/16, due the same day. */
  round?: number;
}

const opts = (...labels: string[]): HomeworkOption[] =>
  labels.map((label) => ({
    id: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    label,
  }));

const corePhases = PHASES.filter((p) => !p.track);
const parallelPhases = PHASES.filter((p) => p.track === "parallel");
const invoiceDecision = CHALLENGES.find((c) => c.title === "Invoice stays in Xero");

const ORDER_STATUS_SAMPLE: ContextBlock = {
  kind: "table",
  title: "ORDER STATUS.xlsx · sample row",
  headers: ["SO#", "Customer", "PO Received", "Ack. Ship", "Valley due", "Smith due", "Byrne due", "Dekko due", "Review"],
  rows: [["12000", "Fleming", "6/5", "11/2", "8/19", "8/25", "7/31", "7/29", "Pushed to ship 11/2"]],
};

const ORDER_STATUS_COLUMNS = [
  "SO#",
  "Non-Nesting",
  "Nesting",
  "Bases Only",
  "Tops Only",
  "Misc",
  "Net Price",
  "Cust PO#",
  "Customer",
  "PO Received",
  "Ack. Ship Date",
  "Shipped Date",
  "Valley PO / Due / Arrived",
  "Smith PO / Due / Arrived",
  "Other vendor 1 PO / Due / Arrived",
  "Other vendor 2 PO / Due / Arrived",
  "Review notes",
  "City",
  "Returned-to-stock list",
];

const BASE_CODES = "AH ASB BL CH CR EH EM F3 FD FR FT12 GF LC MP NE MMLC OS PB QC RA SH SK WM WMLC";
const TOP_CODES = "reed 3P 3K drill GN.Q GR MP RC TJ PRE NE pack BB match marker extrusion PD Villa Cove";

const COVER_SHEET_FACSIMILE = `SALES ORDER COVER SHEET
Sales order # ____   PO date ____   Ship date ____   Dealer ____

[ ] acknowledged customer   [ ] added to schedule   [ ] updated Queue
[ ] production review       [ ] check 'ship to'

BASES (Valley Design)   TOPS (Smith, Boos)   OTHER (up to 3 vendors)
po # ____ date ____     po # ____ date ____  po # ____ date ____
[ ] cut PO              [ ] cut PO           [ ] cut PO
[ ] drawings req/sent   [ ] drawings         [ ] drawings
[ ] been acknowledged   [ ] acknowledged     [ ] acknowledged
[ ] proofed             [ ] proofed          [ ] proofed

Base codes: ${BASE_CODES}
Top codes:  ${TOP_CODES}

Notes ____________   TIPS 2%  /  NEW DEALER
rep __ quote __ disc __ comm % __ spiff __ freight $ __ Start __ End __`;

const PACKAGING_RATES: ContextBlock = {
  kind: "table",
  title: "TablEx Packaging 3.xlsx · rates (9/14)",
  headers: ["Material", "Rate"],
  rows: [
    ["Black Vinyl Banding", "$0.04 / ft"],
    ["Steel Banding", "$0.08 / ft"],
    ["Hard V-Board", "$1.08 / piece"],
    ["Honeycomb", "$2.71 / strip (8 blocks) or $0.34 / block"],
    ["Microfoam Squares", "$0.05 / ft"],
    ["Quicksilver 6\"", "$0.184 / ft"],
    ["Shrink Wrap 12\"", "$0.03588 / ft"],
    ["Shrink Wrap 18\"", "$0.01792 / ft"],
    ["Tissue Angle Pad", "$1.28 / piece"],
    ["U-Channel", "$3.83 / strip or $0.64 / ft"],
    ["Universal Skid Tray", "$6.02 / piece"],
    ["Smith skid", "$17 / piece"],
    ["Wooden Skid (TablEx skid / Other)", "free"],
  ],
};

const PACKAGING_FORM: ContextBlock = {
  kind: "list",
  title: "The form, per sales order",
  items: [
    "Material Description · Cost (rate) · Quantity Used · Subtotal",
    "Total",
    "Pallet 1–6, each with dimensions + weight",
  ],
};

const ROUND_TRIP_LATE: ContextBlock = {
  kind: "cards",
  title: "The round trip, stages 5–7",
  cards: ROUND_TRIP.filter((s) => s.n >= 5).map((s) => ({
    title: `${s.n} · ${s.title}`,
    body: s.cells.map((c) => `${c.when === "future" ? "Future" : "Today"}: ${c.text}`).join("\n"),
  })),
};

export const HOMEWORK: Record<Person, HomeworkQuestion[]> = {
  brian: [
    {
      id: "brian-priority",
      type: "rank",
      prompt: "Put the five build phases in the order you want them.",
      why: "The order sets what ships first and what we quote first.",
      options: corePhases.map((p) => ({ id: p.key, label: `${p.label} · ${p.title}` })),
      context: [
        {
          kind: "cards",
          title: "The five phases",
          cards: corePhases.map((p) => ({ title: `${p.label} · ${p.title}`, body: p.items.slice(0, 2).join("\n") })),
        },
        {
          kind: "cards",
          title: "Runs alongside",
          cards: parallelPhases.map((p) => ({ title: p.title, body: p.items[0], tag: "Runs alongside" })),
        },
      ],
    },
    {
      id: "brian-first-date",
      type: "date",
      prompt: "When do you need the first phase live?",
      context: [
        { kind: "list", title: `P1 is the Sales Order core`, items: corePhases[0].items },
        { kind: "note", text: "Today is Thursday, October 8, 2026." },
      ],
    },
    {
      id: "brian-invoice",
      type: "single",
      prompt: "How should the app handle invoices?",
      options: [
        {
          id: "mirror",
          label: "Mirror Xero (app shows invoice # / status / paid; accounting stays the book of record)",
          hint: "Recommended",
        },
        { id: "create", label: "App creates the Xero invoice (needs Xero write access, separate decision)" },
        { id: "discuss", label: "Not sure, discuss" },
      ],
      context: [
        { kind: "note", title: invoiceDecision?.title ?? "Invoice stays in Xero", text: invoiceDecision?.body ?? "" },
        { kind: "cards", cards: ROUND_TRIP_NOTES.map((n) => ({ title: n.title, body: n.body })) },
      ],
    },
    {
      id: "brian-so-number",
      type: "single",
      prompt: "What should the Sales Order number be?",
      options: [
        { id: "reuse-tx", label: "Reuse the TX quote number as the SO number" },
        { id: "separate", label: "Separate SO series matching the accounting system (11890–12160 today)" },
        { id: "both", label: "Both: store the accounting SO # on the order and show both" },
      ],
      context: [
        {
          kind: "facts",
          rows: [
            ["Mark's tracker", "Accounting SO numbers 11890–12160"],
            ["Quotes on tablex.com", "TX-2026-####"],
          ],
        },
      ],
    },
    {
      id: "brian-rep-pricing",
      type: "single",
      prompt: "Should reps and principals see pricing on acknowledgments?",
      options: opts("Yes", "No", "Dealer net only, no list"),
      context: [
        {
          kind: "facts",
          rows: [
            ["Rep surfaces today", "Zero-dollar: no prices shown"],
            ["Dealers today", "See net pricing on issued quotes"],
          ],
        },
      ],
    },
    {
      id: "brian-salesperson",
      type: "text",
      prompt: "Who is \"the salesperson\" credited on an order, and who decides? Where should the app get it from?",
      rows: 4,
      context: [
        {
          kind: "facts",
          rows: [
            ["On paper today", "Cover sheet footer: rep · quote · disc · comm % · spiff"],
            ["In the CRM", "Rep groups + rep contacts. No salesperson field."],
          ],
        },
      ],
    },
    {
      id: "brian-ack-recipients",
      type: "multi",
      prompt: "Confirm the acknowledgment recipients.",
      options: opts(
        "Person ordering",
        "Dealer primary email",
        "Sales group principal",
        "Salesperson credited",
        "Additional free-form recipient",
        "production@",
      ),
      context: [
        {
          kind: "list",
          title: "Your 10/07 email listed",
          items: [
            "Person Ordering (email on the SO)",
            "Dealer (primary email on the dealer account)",
            "Sales Group (Principal's email)",
            "Salesperson (credited)",
            "Additional Recipient (free-form name + email)",
          ],
        },
      ],
    },
    {
      id: "r2-brian-split",
      round: 2,
      type: "single",
      prompt: "Confirm the 10/19 split: core first, cover sheet and change orders the week after?",
      why: "P1 as scoped is more than a week of work. Work starts Wed 10/14; this split keeps Monday real.",
      options: [
        { id: "yes-split", label: "Yes: orders + SO# + Sales Order / Work Order / Packing Slip + production@ email by 10/19; cover sheet form + change orders the week after", hint: "Recommended" },
        { id: "all-p1", label: "No: all of P1 by 10/19, including the cover sheet form and change orders" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "note", title: "Why we are asking", text: "Monday 10/19 is your date. Three weeks of work start Wednesday 10/14, so 10/19 is day four. The same week also carries the SpeX Studio catalog relaunch, which needs you and Mark to review." },
        { kind: "list", title: "Ships by Mon 10/19", items: ["orders table + SO number from the accounting series, starting at 13000; TX quote number printed on the SO", "Create order from a desk quote", "Estimated ship date from lead time (4 wk · Nesting 6 wk · Quick Ship 10 business days); Mark moves it", "Sales Order / Work Order / Packing Slip PDFs (Packing Slip = the Work Order)", "Auto-email Cover Sheet + Work Order + Packing Slip to production@"] },
        { kind: "list", title: "Follows the week of 10/21", items: ["Production Cover Sheet form (auto-fills TX SO#, Cust PO#, Dealer, Ship Date; Mark ticks the option grid)", "Change orders: re-open lines and pricing on an accepted order under a new revision"] },
      ],
    },
    {
      id: "r2-brian-production-mailbox",
      round: 2,
      type: "single",
      prompt: "production@tablex.com and the INKY allow rule: where do they stand for Wed 10/14?",
      why: "Every automatic email to production@ lands in quarantine until the rule exists.",
      options: [
        { id: "done", label: "Both done" },
        { id: "mailbox-only", label: "Mailbox exists, allow rule still with the IT vendor" },
        { id: "in-progress", label: "In progress, both by Wed 10/14" },
        { id: "later", label: "Later than 10/14 (date in notes)" },
      ],
      context: [
        { kind: "facts", title: "What is needed", rows: [["Mailbox", "production@tablex.com, read by Mark (Work Order, Cover Sheet, Packing Slip arrive here on every accepted order)"], ["Allow rule", "INKY PhishFence: allow the envelope domain send.tablex.com (the domain tablex.com mail is sent from)"], ["Who", "Your IT vendor manages M365 + INKY; the forwardable request went to you 9/21"], ["Why", "Own-domain mail from an outside sender is quarantined one way; replies still land. Staff password resets on 9/21 hit the same wall."]] },
      ],
    },
    {
      id: "r2-brian-logins",
      round: 2,
      type: "multi",
      prompt: "Which dashboard logins should we create now?",
      why: "Only you and Mark can sign in to this dashboard today. Sam and Patty answered through you on 10/08.",
      options: opts("Sam Sander", "Patty Wollenmann", "Jim Skillman", "Richie Hughes", "Nobody else for now"),
      context: [
        { kind: "note", title: "How logins get made", text: "Because INKY quarantines invitation emails, we create each login with a password and hand it over out of band (you or Danny tell them directly). Contributor role with access to this project; no admin rights." },
        { kind: "facts", title: "Today", rows: [["Admin", "Brian, Mark"], ["No login", "Sam, Patty, Jim"], ["Why it matters", "Round-two questions for Sam and Patty are on their own tabs; they can answer directly instead of through you."]] },
      ],
    },
    {
      id: "r3-brian-ack-pricing",
      round: 3,
      type: "single",
      prompt: "Order acknowledgment email: keep the pricing breakdown, or show net rows only?",
      why: "The acknowledgment goes to all six recipients, including reps and the sales-group principal. Today it shows the same rows as the quote-ready email.",
      options: [
        { id: "keep-breakdown", label: "Keep it: Subtotal (list), tier discount, Subtotal (net), freight, Total", hint: "What is built today" },
        { id: "net-only", label: "Net rows only: net lines, freight, Total" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "facts", title: "What the acknowledgment carries now", rows: [["Recipients", "Person ordering, dealer primary, sales-group principal, salesperson, extra contact, production@"], ["Pricing rows", "Subtotal (list) · Tier 50/20 discount · Subtotal (net) · Freight · Total (net)"], ["Same as", "The quote-ready email the dealer already received"]] },
        { kind: "note", title: "Why it matters by 10/19", text: "Sam's test orders on staging (SO 13000 to 13004) send this email. Whatever you pick ships with the first real order." },
      ],
    },
    {
      id: "r3-brian-surge-unpriced",
      round: 3,
      type: "text",
      rows: 3,
      prompt: "Two Surge rows in your October workbook have no price. What are Core / Select / Luxe for 99RD48SD26 and 99RD48QD26, or should they come out?",
      why: "Both rows exist in the SURGE tab with every price cell blank, so SpeX shows them as quote-required.",
      context: [
        { kind: "table", title: "The two rows", headers: ["Workbook row", "Model", "Top", "Base"], rows: [["SURGE 169", "99RD48SD26", "48 in round", "SD26 disc"], ["SURGE 175", "99RD48QD26", "48 in round", "QD26 disc"]] },
        { kind: "note", text: "Type the three prices per model (for example: SD26 1,500 / 1,540 / 1,570) or write 'drop them'." },
      ],
    },
    {
      id: "r3-brian-justice-labels",
      round: 3,
      type: "single",
      prompt: "Justice butcher block: the six 24-inch-deep rows carry model codes that read 25. Is the top 24 or 25 inches?",
      why: "The code is what prints on quotes, sales orders and the SIF file, so the code and the label have to agree.",
      options: [
        { id: "24", label: "24 inches: the label is right, the codes should read 24 (40TC2460…, 40TC2472…)" },
        { id: "25", label: "25 inches: the code is right, change the size label to 25 x 60 and 25 x 72" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "table", title: "The six rows (JUSTICE tab)", headers: ["Label", "Model code", "Height"], rows: [["24 x 60", "40TC2560FR2258-BB", "29 in"], ["24 x 72", "40TC2572FR2270-BB", "29 in"], ["24 x 60", "40TC2560FR2258-BB-SH.36", "36 in"], ["24 x 72", "40TC2572FR2270-BB-SH.36", "36 in"], ["24 x 60", "40TC2560FR2258-BB-SH.42", "42 in"], ["24 x 72", "40TC2572FR2270-BB-SH.42", "42 in"]] },
        { kind: "note", text: "Every other Justice butcher-block row matches (30 x 60 = 40TC3060…, 36 x 72 = 40TC3672…)." },
      ],
    },
  ],
  mark: [
    {
      id: "mark-ship-date",
      type: "single",
      prompt: "Where should the estimated ship date come from?",
      why: "It goes on every acknowledgment email.",
      options: [
        { id: "mark-sets", label: "I set it on the order when I accept it" },
        { id: "lead-time", label: "Standard lead time per series (we propose the date)" },
        { id: "vendor-due", label: "Latest vendor Due date + buffer" },
      ],
      context: [
        { kind: "list", title: "ORDER STATUS columns that matter", items: ["PO Received", "Ack. Ship Date", "Vendor Due / Arrived (Valley, Smith, other)"] },
        ORDER_STATUS_SAMPLE,
      ],
    },
    {
      id: "mark-ack-ship",
      type: "text",
      prompt: "Is Ack. Ship Date the date promised to the dealer? What makes it move?",
      rows: 3,
      context: [
        { kind: "list", title: "ORDER STATUS columns that matter", items: ["PO Received", "Ack. Ship Date", "Vendor Due / Arrived (Valley, Smith, other)"] },
        ORDER_STATUS_SAMPLE,
      ],
    },
    {
      id: "mark-shipped-r",
      type: "single",
      prompt: "In Shipped Date, \"R\" means:",
      options: opts("Ready to ship", "Released to warehouse", "Other (notes)"),
      context: [{ kind: "note", text: "Shipped Date holds either a date or \"R\". 12 of the 48 open sales orders are marked shipped or ready." }],
    },
    {
      id: "mark-schedule-columns",
      type: "multi",
      prompt: "Which columns must the production board keep?",
      options: ORDER_STATUS_COLUMNS.map((c) => ({ id: c.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: c })),
      context: [
        {
          kind: "table",
          title: "ORDER STATUS.xlsx header today",
          headers: ["SO#", "Mix", "Net", "Cust PO#", "Customer", "PO Rec'd", "Ack. Ship", "Shipped"],
          rows: [["", "Non-Nest · Nest · Bases · Tops · Misc", "", "", "", "", "", "date or R"]],
        },
        {
          kind: "table",
          headers: ["VALLEY", "SMITH", "OTHER", "OTHER", "Review", "City"],
          rows: [["PO · Due · Arrived", "PO · Due · Arrived", "Vender · PO · Due · Arrived", "Vender · PO · Due · Arrived", "notes", ""]],
        },
        { kind: "note", text: "Sheet2: \"RETURNED TO STOCK\" (finish, dealer, SO#, PO#)." },
      ],
    },
    {
      id: "mark-cover-auto",
      type: "multi",
      prompt: "Which cover-sheet checkboxes should the app tick by itself?",
      options: opts(
        "acknowledged customer",
        "added to schedule",
        "updated Queue",
        "production review",
        "check 'ship to'",
        "cut PO (per vendor)",
        "drawings requested/sent",
        "been acknowledged",
        "proofed PO",
      ),
      context: [{ kind: "pre", title: "Your cover sheet, as text", text: COVER_SHEET_FACSIMILE }],
    },
    {
      id: "mark-option-codes",
      type: "text",
      prompt:
        "The cover sheet option codes (AH, ASB, BL, CH … reed, 3P, 3K, drill, GN.Q …): can we derive them from the configured lines, or do you tick them by judgment? Which ones need a person?",
      rows: 4,
      context: [
        {
          kind: "facts",
          title: "Option-code grids",
          rows: [
            ["Bases", BASE_CODES],
            ["Tops", TOP_CODES],
          ],
        },
      ],
    },
    {
      id: "mark-carriers",
      type: "text",
      prompt: "List the carriers for the dropdown (most used first).",
      rows: 4,
    },
    {
      id: "mark-packaging-rates",
      type: "single",
      prompt: "How often do packaging rates change?",
      options: opts("Rarely (yearly)", "Quarterly", "Whenever a supplier changes price"),
      context: [PACKAGING_RATES, PACKAGING_FORM],
    },
    {
      id: "mark-production-slip",
      type: "single",
      prompt: "Should production@ also receive the packing slip?",
      options: opts("Yes", "No", "Only on request"),
    },
    {
      id: "r2-mark-reack-on-move",
      round: 2,
      type: "single",
      prompt: "When the ship date moves, should the acknowledgment re-send by itself?",
      why: "Every date move is logged either way. The question is who gets an email, and when.",
      options: [
        { id: "auto-all", label: "Automatically, to all six recipients, every time it moves" },
        { id: "auto-customer", label: "Automatically, but only to the dealer / person ordering (not reps or production@)" },
        { id: "manual", label: "Only when I click Re-send on the order" },
        { id: "never", label: "Never by email; the desk calls or writes by hand" },
      ],
      context: [
        { kind: "facts", title: "What you told us 10/08", rows: [["Ship date", "Set from lead time: 4 weeks, Nesting 6 weeks, Quick Ship 10 business days"], ["What moves it", "Vendor back orders (laminate, edgeband, powder), defects after production; can ship early if the customer agrees"], ["Recipients (Brian)", "Person ordering · dealer primary · sales-group principal · salesperson credited · extra recipient · production@"]] },
        { kind: "note", title: "What the acknowledgment carries", text: "SO#, Cust PO#, estimated ship date, dealer net pricing, and signed links to the Sales Order PDF. A re-send would show the old and new date." },
      ],
    },
    {
      id: "r2-mark-change-orders",
      round: 2,
      type: "single",
      prompt: "After the acknowledgment has gone out, who approves a change to the order?",
      why: "Change orders are in the first phase. Approval and re-acknowledgment rules are not ruled yet.",
      options: [
        { id: "sam", label: "Sam (the desk) edits and re-acknowledges; no approval step" },
        { id: "mark", label: "Sam edits, Mark approves before production sees it" },
        { id: "brian", label: "Sam edits, Brian approves anything that changes price" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "note", title: "How a change order works in the app", text: "An accepted order is frozen. A change re-opens the lines and pricing under a new revision, keeps the trail (who, when, what), and re-sends the acknowledgment with the revision number. Nothing is edited silently." },
        { kind: "list", title: "Typical changes", items: ["Quantity or size on a line", "Finish swap (laminate, powder)", "Ship-to change", "Added accessory or option", "Date pulled in or pushed out (see the previous question)"] },
      ],
    },
    {
      id: "r2-mark-vendor-po-entry",
      round: 2,
      type: "single",
      prompt: "Vendor POs (Valley, Smith, others): who keys PO number, due date and arrived date into the production board?",
      why: "The board you kept (16 columns) carries PO / Due / Arrived per vendor. Someone owns the entry.",
      options: [
        { id: "mark", label: "Mark, on the production board, when the PO is cut" },
        { id: "sam", label: "Sam, at acceptance, from the purchasing worksheet" },
        { id: "patty", label: "Patty, when the vendor acknowledgment arrives" },
        { id: "other", label: "Other / split (notes)" },
      ],
      context: [
        { kind: "table", title: "ORDER STATUS.xlsx today", headers: ["SO#", "Customer", "Ack. Ship", "Valley PO / due / arrived", "Smith PO / due / arrived", "Other"], rows: [["12000", "Fleming", "11/2", "8/19", "8/25", "Byrne 7/31 · Dekko 7/29"]] },
        { kind: "note", title: "Cover sheet", text: "Your purchasing worksheet has vendor columns BASES / TOPS / OTHER with PO # and the cut-PO / drawings / acknowledged / proofed checklist. The board would replace the re-typing between the two sheets." },
      ],
    },
    {
      id: "r2-mark-surge-disc",
      round: 2,
      type: "text",
      prompt: "Surge 2-column disc bases: where did you look when they seemed missing?",
      why: "Your 10/09 email said they are missing from the Surge section. We find all five in the price book and in SpeX, so we want to fix the page you actually looked at.",
      rows: 4,
      context: [
        { kind: "list", title: "The five models from your email", items: ["24 x 36 · 99TC2436QD2032.2", "24 x 48 · 99TC2448QD2032.2", "30 x 36 · 99TC3036QD2032.2", "30 x 48 · 99TC3048QD2032.2", "36 x 48 · 99TC3648QD2032.2"] },
        { kind: "facts", title: "Where they are today", rows: [["Price book (Sept 2026)", "All five rows present with prices"], ["SpeX Studio", "Listed under the generic label \"Rectangular / Square Disc\" in the Surge base picker, with 3D models"], ["Series page /products/surge", "Not called out as a named option"], ["Likely fix", "Name them \"2-column disc base\" in the picker and on the Surge page, mark Surge-only"]] },
      ],
    },
    {
      id: "r2-mark-elite-trestle",
      round: 2,
      type: "single",
      prompt: "Elite Trestle: is the ELITE TRESTLE tab in the October 2026 workbook current, so we price from it?",
      why: "The tab exists in both the September and October workbooks. The site imported its 74 rows without a category, which is why they show as \"Models without a book category\".",
      options: [
        { id: "yes-october", label: "Yes, price from the October tab as it is" },
        { id: "corrections", label: "Mostly; I will send corrections (notes)" },
        { id: "check-brian", label: "Not sure, Brian confirms" },
      ],
      context: [
        { kind: "facts", title: "What we found", rows: [["Workbooks", "ELITE TRESTLE tab present in Sept and Oct 2026 (Oct: sheet 8)"], ["Site today", "74 Elite 08…VTR models in the published book with no category, so the price sheet files them under \"Models without a book category\" with old-book prices"], ["Your screenshots", "Rectangular 20 models · Boat 6 · Racetrack 11; 96\" sizes starred: $300 net surcharge per order for oversized pallet"], ["Fix", "Importer maps the tab to its own Elite Trestle category; prices come from the October tab"]] },
      ],
    },
    {
      id: "r2-mark-bwe-powerbox",
      round: 2,
      type: "single",
      prompt: "Bottom Wire Exit + Power Box together: confirm $346 list?",
      why: "$140 + $105 is $245. Your email says $346 for both. The old book had the same pattern ($132 + $100, $329 together), so we assume the combined price is deliberate.",
      options: [
        { id: "346", label: "Yes, $346 list when both are specified" },
        { id: "245", label: "No, it is the sum: $245" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "facts", title: "From your 10/09 email", rows: [["Bottom Wire Exit", "Primary + Surge disc bases; wires through the column from the mounting plate to the floor; $140 list"], ["Power Box", "Disc and X bases, squares and rounds, only with power in the center of the top; U-plate routes wires down the column; $105 list"], ["Both", "$346 list"]] },
        { kind: "facts", title: "Old book (intro text)", rows: [["BWE Bottom Cord Exit", "$132"], ["PB Power Box", "$100"], ["PB + BWE", "$329"]] },
        { kind: "note", text: "Neither is a SpeX Studio option today. Both will be added to the picker for the bases they apply to, priced from your answer." },
      ],
    },
    {
      id: "r3-mark-flip-top-hardware",
      round: 3,
      type: "single",
      prompt: "Surge flip top in SpeX Studio: we show the Element flip-top hinge and latch on the Surge X base, top resting at 29 inches. Is that the right hardware?",
      why: "All 11 Surge X-FT flip tops are live on the test site with this hardware. Testers see it this week.",
      options: [
        { id: "yes", label: "Yes, Surge uses the same flip-top mechanism as Element on the X base" },
        { id: "different", label: "No, Surge uses different hardware (describe it in the notes, a photo by email is fine)" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "facts", title: "Why we assumed one shared part", rows: [["October book", "X-FT is priced on Element, Elite, Foundation, Stretch and Surge on the same X22 / X26 / X30 / X34 base family"], ["Rest height", "29 in, top 1.25 in thick, column shortened to suit"], ["Footprint", "Per the code: X22, X26, X30, X34 (the 42 in tops take X34)"]] },
        { kind: "list", title: "See it on the test site", items: ["https://staging.tablex.com/spex-studio/SURGE?shape=SQ&size=2424&base=X-FT&top=lam-D354-60&basefinish=pc-satin-silver", "https://staging.tablex.com/spex-studio/ELEMENT?shape=SQ&size=2424&base=X-FT"] },
      ],
    },
    {
      id: "r3-mark-df-flip-top",
      round: 3,
      type: "single",
      prompt: "Two center power units (location DF) on a flip top: refused like the single center unit, or allowed?",
      why: "You confirmed 10/16 that location F is refused on flip tops because of the hinge. We refused DF the same way on the assumption that two center units hit the same hinge.",
      options: [
        { id: "refuse", label: "Refuse DF on flip tops too (what is built today)" },
        { id: "allow", label: "Allow DF on flip tops" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "facts", title: "Your placement matrix, as built", rows: [["Static / electric", "A, D, F, DF"], ["Hand crank", "A, D"], ["Nesting", "A, D"], ["Folding", "D only"], ["Flip top", "A, D (F refused per your 10/16 answer; DF refused by inference)"]] },
        { kind: "note", text: "A = one unit at an end · D = two at the ends · F = one at center · DF = two at center." },
      ],
    },
    {
      id: "r3-mark-ref03",
      round: 3,
      type: "single",
      prompt: "Bottom Cord Exit plus Power Box Mounting Plate on the same table: what is the list price when both are specified?",
      why: "The book has Bottom Cord Exit $139 and the plate $105, which sum to $244. Your 10/12 note said $346, later relayed as $245.",
      options: [
        { id: "244", label: "$244, the sum of the two book rows" },
        { id: "245", label: "$245 ($140 + $105)" },
        { id: "346", label: "$346, a combined price that is not in the book" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "facts", title: "October ADD ONS tab", rows: [["Bottom Cord Exit", "$139 each"], ["Powerbox Mounting Plate", "$105 each"], ["Both together", "no row"]] },
        { kind: "note", text: "SpeX prices them as two separate add-ons today ($244). If $346 is right, the book needs a combined row." },
      ],
    },
  ],
  sam: [
    {
      id: "sam-system",
      type: "single",
      prompt: "Which system do you key Sales Orders into today?",
      options: opts("Sage", "Xero", "Both", "Something else"),
      context: [
        {
          kind: "facts",
          rows: [
            ["Feb 2026 interviews", "Sage for sales orders"],
            ["9/14", "Xero live internally"],
            ["9/25", "You keyed SO #12150"],
            ["Our Xero sync", "Sees 0 invoices Aug–Sep"],
          ],
        },
      ],
    },
    {
      id: "sam-so-steps",
      type: "text",
      prompt: "After you accept an order on tablex.com today, list the steps you do by hand, in order (what you type where).",
      rows: 4,
      context: [
        {
          kind: "list",
          title: "What we heard in February",
          ordered: true,
          items: salesOrderSteps.map((s) => `${s.name} (${s.owner}, ${s.tool})`),
        },
      ],
    },
    {
      id: "sam-tracking-owner",
      type: "single",
      prompt: "Who enters carrier + tracking after pickup?",
      options: opts("Sam", "Tony", "Mark", "Whoever is there"),
    },
    {
      id: "sam-packing-slip",
      type: "single",
      prompt: "What does the packing slip need to show?",
      options: opts(
        "Quantities + descriptions only",
        "Quantities + descriptions + ship-to + PO",
        "Same as the work order",
      ),
      context: [{ kind: "note", text: "Work Order = the Sales Order with all pricing removed." }],
    },
    {
      id: "sam-photos",
      type: "number",
      unit: "photos",
      prompt: "How many photos per shipment, typically? Who takes them, on what device?",
      why: "Put the count in the box and the who / device in Notes.",
    },
    {
      id: "sam-supporting-docs",
      type: "multi",
      prompt: "What supporting documents usually ride with an order?",
      options: opts(
        "Dealer PO",
        "Drawings / approvals",
        "Finish samples sign-off",
        "Freight quote",
        "COI / site requirements",
        "Other (notes)",
      ),
    },
    {
      id: "r2-sam-no-quote-orders",
      round: 2,
      type: "single",
      prompt: "Orders that arrive without a tablex.com quote (a PO by email or phone): how should they enter the app?",
      why: "Decides whether the first phase needs a separate \"New order\" form or just the desk quote editor you already have.",
      options: [
        { id: "desk-quote-first", label: "I build a desk quote first, then convert it to the order (one path)", hint: "Simplest" },
        { id: "new-order-form", label: "I need a New order form that takes lines directly, no quote" },
        { id: "both", label: "Both happen; notes on how often each" },
      ],
      context: [
        { kind: "note", title: "What you told us 10/08", text: "\"I type out the entire quote into an excel file. If ordered, I then retype into another excel file. Then I print the SO, WO, Packing Slip…\"" },
        { kind: "facts", title: "What the app has", rows: [["Desk quote editor", "Line editing, instant pricing, revisions, accept on behalf, PO upload"], ["Create order", "From an accepted desk quote: SO# minted, documents generated, acknowledgment sent"], ["Missing", "A way in for an order that never had a quote"]] },
      ],
    },
    {
      id: "r2-sam-prepay",
      round: 2,
      type: "single",
      prompt: "Prepay customers: who flags the order as prepay, and does production wait for the payment?",
      why: "Patty said a select few prepay, which creates a pre-invoice before production starts.",
      options: [
        { id: "sam-flags-wait", label: "I flag it at acceptance; production waits until Patty marks the pre-invoice paid" },
        { id: "sam-flags-no-wait", label: "I flag it; production starts anyway, Patty chases payment" },
        { id: "patty-flags", label: "Patty flags it from the customer record; production waits" },
        { id: "other", label: "Other (notes)" },
      ],
      context: [
        { kind: "facts", title: "Proposed flow", rows: [["accepted", "Order acknowledged; prepay flag set"], ["awaiting payment", "Pre-invoice issued (Xero); nothing goes to production@ yet"], ["in production", "Patty marks paid; documents go to production@"], ["Net 30 orders", "Skip straight to in production"]] },
        { kind: "note", title: "From Patty 10/08", text: "\"Majority are Net 30 but for a select few we make them prepay (this creates a pre-invoice before we start production).\"" },
      ],
    },
  ],
  patty: [
    {
      id: "patty-invoice-when",
      type: "single",
      prompt: "When is the invoice created?",
      options: opts("At order acceptance", "At ship", "After delivery", "Other"),
      context: [ROUND_TRIP_LATE],
    },
    {
      id: "patty-invoice-system",
      type: "single",
      prompt: "Where is the invoice created?",
      options: opts("Sage", "Xero", "Both", "Other (notes)"),
    },
    {
      id: "patty-invoice-source",
      type: "text",
      prompt: "Which document do you work from to build the invoice, and what do you re-type?",
      rows: 4,
    },
    {
      id: "patty-terms",
      type: "multi",
      prompt: "Payment terms in use",
      options: opts("Net 30", "Net 15", "Due on receipt", "Deposit / prepay for direct customers", "Credit card", "Other"),
    },
    {
      id: "patty-payment-record",
      type: "text",
      prompt: "How is a payment recorded today (Receive Money? bank match?) and what would you want the app to show about it?",
      rows: 4,
      context: [
        {
          kind: "note",
          title: "From your February interview",
          text: "Invoices are emailed. Checks and ACH are entered via \"Receive Money\" and matched to deposits.",
        },
      ],
    },
    {
      id: "patty-pl",
      type: "multi",
      prompt: "What does the packaging P/L analysis need from each order?",
      options: opts(
        "Packaging material total",
        "Warehouse time",
        "Freight cost",
        "Commission",
        "Invoice total",
        "Pallet count/weight",
        "Other",
      ),
      context: [PACKAGING_FORM, PACKAGING_RATES],
    },
    {
      id: "r2-patty-xero-ready",
      round: 2,
      type: "single",
      prompt: "On Mon 10/19 the first order the app issues becomes the first Xero sales invoice. Are you set up to raise it from the SO?",
      why: "Brian decided on 10/12 that Xero starts with the new system and Sage only runs out the orders already in it.",
      options: [
        { id: "ready", label: "Yes, I can raise a sales invoice in Xero now" },
        { id: "needs-setup", label: "Need setup first: invoice template, tax, items (notes)" },
        { id: "later", label: "Not until a later date (date in notes)" },
      ],
      context: [
        { kind: "note", title: "Brian, 10/12", text: "\"Our plan was start Xero with the use of the new system. We did not plan to shift current orders over into Xero. Our plan was to just run out Sage and any new order would be handled through Xero … two systems for a short period.\"" },
        { kind: "facts", title: "What the SO gives you", rows: [["Already on it", "Freight, Customer PO#, dealer, ship-to, lines with net pricing (the two things you re-type in Sage today are on the SO)"], ["In Xero", "You raise the invoice against the dealer contact; the app reads the invoice number, status and paid date back onto the SO"], ["Not in scope", "The app does not write to Xero"]] },
      ],
    },
    {
      id: "r2-patty-xero-contacts",
      round: 2,
      type: "single",
      prompt: "Are the dealers in Xero current enough to invoice against from day one?",
      why: "Every Xero invoice needs a contact. Our read-only sync sees 1,590 contacts in Xero.",
      options: [
        { id: "yes", label: "Yes, the active dealers are all there" },
        { id: "mostly", label: "Mostly; I add the missing ones as orders come in" },
        { id: "unsure", label: "Not sure; send me the list of dealers with open quotes" },
      ],
      context: [
        { kind: "facts", title: "Xero today", rows: [["Contacts", "1,590 (customers and suppliers mixed; IsCustomer is set only once an invoice exists)"], ["Invoices", "3,803 paid through 3/31/2026; none after"], ["Site CRM", "~110 dealer orgs matched to Xero contacts; ~1,480 Xero contacts still unreviewed in the desk's Xero queue"]] },
      ],
    },
    {
      id: "r2-patty-gap-backfill",
      round: 2,
      type: "single",
      prompt: "April 1 to the cutover: will you import the Sage invoices into Xero, and when?",
      why: "Brian said TableX does this itself if at all. Until it happens, reporting by customer, series or rep stops at March 2026.",
      options: [
        { id: "csv-import", label: "Yes, Xero sales-invoice CSV import from the Sage register (date in notes)" },
        { id: "no", label: "No, leave April onward as monthly journal totals" },
        { id: "undecided", label: "Undecided; need to see the effort" },
      ],
      context: [
        { kind: "facts", title: "The gap", rows: [["In Xero", "Full invoice history Oct 2020 to 3/31/2026, with customers and lines"], ["Missing", "Zero sales invoices dated after 3/31/2026; P&L shows ~$1.49M of sales Apr 1 onward as journal totals only"], ["Effect", "By-customer / by-series / by-rep reports stop at March 2026; year-over-year 2026 is monthly totals only"]] },
        { kind: "list", title: "Option A, the one Brian prefers (do it yourselves)", items: ["Export the Sage invoice register for Apr 1 onward with line items", "Map columns to Xero's sales-invoice CSV template", "Import in Xero (Business → Invoices → Import); repeatable monthly until Sage is closed"] },
      ],
    },
    {
      id: "r2-patty-prepay-preinvoice",
      round: 2,
      type: "text",
      prompt: "For prepay customers, how is the pre-invoice created today, and should the app produce it from the SO?",
      rows: 4,
      context: [
        { kind: "note", title: "You said 10/08", text: "\"Majority are Net 30 but for a select few we make them prepay (this creates a pre-invoice before we start production).\"" },
        { kind: "note", title: "Proposed", text: "A prepay order waits in \"awaiting payment\" with the pre-invoice raised in Xero against the SO; when you mark it paid, the order moves to production and the documents go to production@. Tell us if the pre-invoice is a Sage/Xero document or a separate sheet." },
      ],
    },
  ],
};
