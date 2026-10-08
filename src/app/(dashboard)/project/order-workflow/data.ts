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
  date: "Thursday, October 8, 2026 · 10:00 AM ET",
  attendees: "Brian Craig · Mark · Sam · Danny · Kayla · Arabella",
  updated: "10/08 16:30 ET · all 28 homework answers in",
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
      { lane: "system", text: "SO # minted; acknowledgment to 5 parties with est. ship date", when: "future" },
    ],
  },
  {
    n: 2,
    title: "Hand off",
    cells: [
      { lane: "system", text: "Work Order + Cover Sheet PDFs → production@", when: "future" },
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
      { lane: "accounting", text: "Patty creates the invoice by hand from the SO; emails it", when: "today" },
      { lane: "system", text: "Xero invoice # + status + paid date shown on the SO; margin per order", when: "future" },
    ],
  },
  {
    n: 7,
    title: "Get paid",
    confirm: true,
    cells: [
      { lane: "dealer", text: "Pays on terms (check / ACH)", when: "today" },
      { lane: "accounting", text: "\"Receive Money\", matched to deposits", when: "today" },
      { lane: "system", text: "Paid status mirrors back; SO closed", when: "future" },
    ],
  },
];

export const ROUND_TRIP_NOTES = [
  {
    title: "Invoicing today (Patty, Feb 2026 interview)",
    body: "Invoices are created by hand from the order and emailed. Payments arrive by check or ACH, are entered via \"Receive Money\" and matched to deposits.",
  },
  {
    title: "Invoicing in the future",
    body: "The app reads the Xero invoice number, status and paid date onto the SO through the read-only Xero sync and webhooks. Packaging cost plus invoice total gives a margin per order for Patty's P/L.",
  },
];

export const ROUND_TRIP_QUESTIONS = [
  {
    q: "Which system holds Sales Orders and Invoices today: Sage or Xero?",
    context: "Feb interviews said Sage for SO, invoice and payments. Xero went live internally 9/14 after the ledger migration. On 9/25 Sam still keyed an SO into Sage (#12150). Our Xero sync sees 0 invoices Aug–Sep.",
  },
  { q: "Who creates the invoice, when (at ship? at order?), and from which document?", context: "" },
  { q: "Payment terms: Net 30? Deposits or prepay for direct customers? Credit card?", context: "" },
  {
    q: "Should the app CREATE the Xero invoice, or only mirror it?",
    context: "Xero write access is ruled out today. Writing is a separate decision.",
  },
  {
    q: "SO numbering: reuse the TX-2026-#### quote number, or a separate SO series that matches the accounting system?",
    context: "Mark's tracker uses the accounting SO series (11890–12160); the orders table should store that number alongside the TX quote number.",
  },
  { q: "Where does the estimated ship date come from?", context: "Mark's tracker has an \"Ack. Ship Date\" column. Is that the promised date, and what moves it?" },
  {
    q: "Commission / salesperson credit: who is \"the salesperson\" on an order, and where is that recorded today?",
    context: "Today it lives on paper: the cover sheet footer carries rep, comm % and spiff.",
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
    label: "Parallel",
    title: "SpeX Studio action tracker (Oct 2026)",
    items: [
      "158 change requests across 16 tabs: all pages 20 · Surge 16 · Primary 15 · VertiGO 13 · Foundation 12 · Stretch 11 · Puddle 11 · Elite 9 · Justice 8 · Solo 8 · Trig 8 · Element 7 · Exclaim 7 · Artisan 5 · App 4 · Ultra 4",
      "Picker order, start modes (Full Table / Top / Base / Accessories), Power & Data section, price fixes, renames",
      "Per-series options: edge mount, offset T, radius corners, ganging brackets, chrome lead time, disc-base casters",
    ],
    track: "parallel",
  },
  {
    key: "xero",
    label: "Later",
    title: "Xero invoice mirroring",
    items: [
      "Invoices are still created in SAGE today (SO → invoice button, Patty adds freight + picks the Cust PO#); Xero is the destination, date not set",
      "Webhooks (already in backlog as web-xero-webhooks) once invoices live in Xero",
      "Create-in-Xero vs mirror: Brian said \"discuss\"; any Xero WRITE is a separate decision",
    ],
    track: "later",
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
    body: "One invoice number. Accounting is the book of record. Our Xero integration is read-only by rule. The app mirrors invoice status onto the SO. Caveat from Patty: invoices are created in Sage today and move to Xero on a date not yet set; until then the SO carries the invoice number by hand.",
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
    kind: "open",
    body: "Sam and Patty both key into Sage today (\"Sage currently, will be Xero\"). The Xero mirror and any webhook work wait on that date. Ask Patty when invoicing moves.",
  },
  {
    title: "Create the Xero invoice, or mirror it?",
    kind: "open",
    body: "Brian answered \"not sure, discuss\". Recommendation stays mirror-only (read-only Xero rule); revisit after Patty invoices from Xero and the SO holds freight + Cust PO# (the two things she types today).",
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
        answer: "Monday, October 19.",
        quote: "Hoping the updates could be made and tested next week.",
        build: [
          "Split P1: orders table, SO series, Sales Order / Work Order / Packing Slip PDFs and the production@ email ship by 10/19.",
          "Cover sheet form and change orders follow the week after. Danny confirms the split with Brian.",
        ],
        status: "flag",
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
        build: ["One renderer, three titles. production@ gets all three on accept.", "TableX creates production@tablex.com; the INKY allow rule for send.tablex.com must land first."],
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
        build: ["estimated_ship proposed from lead-time class on accept; Mark edits it on the order and the schedule.", "Every move is logged; a moved date can re-send the acknowledgment."],
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
        answer: "Sage, for both the SO and the invoice. \"Sage currently, will be Xero.\" No date given.",
        build: ["Until invoicing moves, the SO carries the invoice number by hand and the Xero mirror waits.", "Ask Patty for the Xero invoicing date; it gates web-xero-invoice-mirror and web-xero-webhooks."],
        status: "open",
      },
      {
        topic: "Invoice creation",
        asked: "When, from what, what is re-typed?",
        by: "patty",
        answer: "At ship. Sage has a button that turns the SO into an invoice; Patty types freight if needed, manually picks the Customer PO# for that SO, emails the customer from Sage and prints a copy.",
        quote: "Brian: if all of this is housed within the electronic SO, we no longer need to print these documents.",
        build: ["The SO already holds freight and the Cust PO#, so nothing is re-typed when invoicing moves to Xero.", "Create-in-Xero vs mirror stays open (Brian: discuss). Recommendation: mirror first."],
        status: "open",
      },
      {
        topic: "Terms",
        asked: "Payment terms in use?",
        by: "patty",
        answer: "Net 30 for most. A select few prepay, which creates a pre-invoice before production starts.",
        build: ["orders.prepay_required; a prepaid order waits in accepted until the pre-invoice is paid, then enters production."],
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
];

export const SAM_TODAY =
  "I type out the entire quote into an excel file. If ordered, I then retype into another excel file. Then I print the SO, WO, Packing Slip, any email or notes that need to accompany the job, add the cover sheet and add the customer and job info to the cover sheet, then add to schedule (which is another spreadsheet), then acknowledge customer via email, then lay on Mark's desk.";

export const NEXT_STEPS = [
  { t: "Confirm the 10/19 split with Brian", d: "Orders + SO series + three PDFs + production@ email first; cover sheet and change orders the week after." },
  { t: "Patty: Xero invoicing date", d: "Gates the invoice mirror and webhooks. Until then the SO carries the invoice number by hand." },
  { t: "TableX creates production@tablex.com", d: "Plus the INKY allow rule for send.tablex.com, or the auto-emails land in quarantine." },
  { t: "Scope + estimate to Richie", d: "Second project-sized effort, quoted separately." },
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
  ],
};
