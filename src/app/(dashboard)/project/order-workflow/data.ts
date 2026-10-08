/**
 * /project/order-workflow — content for the 2026-10-08 sales-order workflow
 * call (Brian, Mark, Sam, Kayla, Arabella). Brian's three 10/07 emails, what
 * tablex.com does today (verified from tablex-site code), the after-accept
 * round trip, the build plan, decisions and questions. Pure data; visuals in
 * ./sections.tsx.
 */

export const MEETING = {
  title: "Sales Order Workflow",
  date: "Thursday, October 8, 2026 · 10:00 AM ET",
  attendees: "Brian Craig · Mark · Sam · Danny · Kayla · Arabella",
  updated: "10/08 09:50 ET",
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
      "so_number",
      "status: accepted · in_production · ready · shipped · invoiced · paid · closed",
      "estimated_ship · ship_date · shipped_at",
      "production notes · vendor_po",
      "xero_invoice_id / status / paid_at",
    ],
    tone: "new",
  },
];

export const MODEL_CHILDREN: ModelBox[] = [
  { name: "order_shipments", role: "1:n per order", fields: ["carrier", "pro_number", "tracking_url", "picked_up_at"], tone: "new" },
  { name: "order_vendor_pos", role: "1:n per order", fields: ["vendor (Valley, Smith, Byrne…)", "po_number", "issued_at", "due", "arrived_at"], tone: "new" },
  { name: "quote_attachments.kind", role: "Extend existing", fields: ["supporting", "shipping_photo", "po", "cover_sheet"], tone: "extend" },
  { name: "packaging_costs", role: "Rates + entries", fields: ["rates by Mark (per ft / piece / strip)", "per-order quantities by Tony", "pallets: dims + weight", "computed total"], tone: "new" },
  { name: "order_recipients", role: "Who gets the emails", fields: ["dealer primary", "rep principal", "salesperson credited", "extra"], tone: "new" },
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
      "orders table + SO number",
      "\"Create order\" from a desk quote; \"New order\" without a quote",
      "Change orders: re-open lines and pricing on an accepted order under a new revision snapshot",
      "One PDF renderer with a document title + show-pricing flag → Quote / Sales Order / Work Order / Packing Slip",
      "Production Cover Sheet",
      "Auto-email Work Order + Cover Sheet to production@",
    ],
  },
  {
    key: "p2",
    label: "P2",
    title: "People + acknowledgments",
    items: [
      "Dealer primary contact, rep-group principal, salesperson credit, extra recipient",
      "Supporting-docs prompt on Accept",
      "Five-way acknowledgment with estimated ship date and links",
    ],
  },
  {
    key: "p3",
    label: "P3",
    title: "Ship + track",
    items: ["Carrier list, PRO / tracking", "Shipped status + \"has shipped\" email", "Shipping photos on the order"],
  },
  {
    key: "p4",
    label: "P4",
    title: "Production schedule",
    items: [
      "/ops/production board replacing ORDER STATUS.xlsx",
      "Columns from Mark's sheet: SO# · product mix · net · Cust PO# · customer · PO received · Ack. ship date · shipped (or R = ready) · review notes · city",
      "Vendor PO groups per order (Valley bases, Smith tops, other vendors): PO / due / arrived",
      "Accepted → active; ship-date edits; shipped drops off",
      "Later nicety: the \"Returned to stock\" list (finish, dealer, SO#, PO#)",
    ],
  },
  {
    key: "p5",
    label: "P5",
    title: "Packaging costs",
    items: [
      "Mark's rate table with units (per foot / per piece / per strip)",
      "Tony's per-order quantity rows + pallets 1–6 with dims and weight (also useful for freight) + auto total",
      "Patty's export / P&L view; margin per order next to the Xero invoice",
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
    items: ["Webhooks (already in backlog as web-xero-webhooks)", "Any Xero WRITE is a separate decision"],
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
    body: "One invoice number. Accounting is the book of record. Our Xero integration is read-only by rule. The app mirrors invoice status onto the SO.",
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
  { title: "SO numbering", kind: "open", body: "Reuse the TX-2026-#### quote number, or a separate series that matches the accounting system." },
  { title: "Estimated ship date source", kind: "open", body: "Mark's tracker has an Ack. Ship Date per order. Confirm it is the promised date and what moves it." },
  {
    title: "Cover sheet is really the purchasing worksheet",
    kind: "risk",
    body: "Brian named four auto-fill fields; the sheet also carries five checkboxes, vendor PO checklists, option-code grids and rep / comm % / spiff. The header auto-fills; the rest becomes a form the desk and Mark complete in the app.",
  },
  {
    title: "Scope size",
    kind: "risk",
    body: "This is a second project-sized effort, not a punch list. Danny has flagged it to Richie.",
  },
  {
    title: "Who owns each step",
    kind: "open",
    body: "Desk vs Mark vs Tony vs Patty: who accepts, who sets ship dates, who enters tracking, who reconciles costs.",
  },
];

/* ------------------------------------------------------------------ */
/* 6 · Questions for the call                                          */
/* ------------------------------------------------------------------ */

export const QUESTION_GROUPS: { who: string; questions: string[] }[] = [
  {
    who: "For Brian",
    questions: [
      "Priority order of P1–P5?",
      "Target date for the first phase?",
      "Should the app CREATE the Xero invoice, or only mirror it?",
      "SO numbering: reuse the quote number or a separate SO series?",
      "Should reps / principals see pricing on acknowledgments? (Rep surfaces are zero-dollar today.)",
      "Who is \"the salesperson\" on an order, and where is that recorded today?",
    ],
  },
  {
    who: "For Mark",
    questions: [
      "Where does the estimated ship date come from? What is promised today?",
      "Ack. Ship Date = the promised date? What moves it?",
      "Is \"R\" in Shipped Date = ready to ship?",
      "Which cover sheet checkboxes should the app tick automatically?",
      "Which ORDER STATUS.xlsx columns must the production board keep?",
      "Should production@ also get the packing slip?",
      "Packaging rates: how often do they change?",
    ],
  },
  {
    who: "For Sam",
    questions: [
      "Which system do you key Sales Orders into today: Sage or Xero?",
      "Common carriers for the dropdown?",
      "Does the packing slip show quantities only?",
      "How many photos per shipment, typically?",
      "Who enters carrier + tracking after pickup?",
    ],
  },
  {
    who: "For Patty",
    questions: [
      "Who creates the invoice, when (at ship? at order?), and from which document?",
      "Payment terms: Net 30? Deposits / prepay for direct customers? Credit card?",
      "What does the packaging P/L analysis need from each order?",
    ],
  },
];
