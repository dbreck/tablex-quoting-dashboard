/**
 * Launch Status — content data for the Brian-facing functionality report.
 *
 * Everything here is ground-truth from the tablex-site repo + live prod checks
 * (2026-07-16). Scope is FUNCTIONALITY ONLY — no design work, no testing/smoke
 * items. When status changes, edit here; the page components just render.
 */

export type AreaStatus = "done" | "partial" | "blocked";

export interface SiteArea {
  name: string;
  routes: string[];
  status: AreaStatus;
  note?: string;
}

export interface AreaGroup {
  title: string;
  blurb: string;
  areas: SiteArea[];
}

/** The full functional surface of tablex.com, grouped the way Brian thinks about it. */
export const SITE_MAP: AreaGroup[] = [
  {
    title: "Public marketing site",
    blurb: "What every visitor sees — no login.",
    areas: [
      { name: "Homepage", routes: ["/"], status: "done" },
      {
        name: "About",
        routes: ["/about", "/about/careers", "/about/contracts", "/about/warranty", "/about/made-in-america"],
        status: "done",
        note: "Made-in-America page live; seal claim awaiting Brian's per-line origin verification",
      },
      { name: "Contact", routes: ["/contact"], status: "done" },
      {
        name: "Products hub + browse",
        routes: ["/products", "/products/browse", "/products/collections", "/products/compare", "/products/accessories"],
        status: "done",
        note: "All 16 series indexed; filterable browse; side-by-side compare",
      },
      { name: "Series pages (16)", routes: ["/series/[slug]"], status: "done" },
      { name: "Spaces (7 environments)", routes: ["/spaces", "/spaces/[slug]"], status: "done" },
      {
        name: "Finishes",
        routes: ["/finishes", "/finishes/laminates", "/finishes/powder-coats", "/finishes/edge-bands", "/finishes/custom", "/finishes/solid-surface"],
        status: "done",
        note: "63 real laminate chips; a few photography placeholders remain",
      },
      { name: "Quick-Ship", routes: ["/quick-ship"], status: "done" },
      { name: "Site search", routes: ["/search"], status: "done" },
      {
        name: "News",
        routes: ["/news", "/news/[slug]"],
        status: "blocked",
        note: "Fully built with a CMS behind it — zero articles written. Needs content from TableX.",
      },
      {
        name: "Find a Rep",
        routes: ["/find-rep"],
        status: "partial",
        note: "Live with an honest fallback (ZIP → contact form). Rep directory needs territory data from TableX.",
      },
      {
        name: "Resources",
        routes: ["/resources", "+5 subpages"],
        status: "partial",
        note: "All pages built; zero downloadable files yet — see the Resources tab",
      },
    ],
  },
  {
    title: "Spex Studio (3D configurator)",
    blurb: "Configure a table in 3D, save it, share it, add it to a quote.",
    areas: [
      { name: "Configurator shell", routes: ["/spex-studio", "/spex-studio/[series]"], status: "done", note: "10 series fully configurable in 3D" },
      { name: "Share links", routes: [".../share/[token]"], status: "done" },
      {
        name: "3D model coverage",
        routes: ["3,038 offered combinations"],
        status: "partial",
        note: "72% render in 3D today; the rest are quotable with a placeholder — see the Spex 3D tab",
      },
    ],
  },
  {
    title: "Quoting",
    blurb: "How a configured table becomes a quote request.",
    areas: [
      { name: "Quote landing + quick quote", routes: ["/quote", "/quote/quick"], status: "done" },
      { name: "Quote cart (from Spex)", routes: ["/quote/cart"], status: "done" },
      { name: "Email notifications to the desk", routes: ["Resend → sales@ at launch"], status: "done" },
    ],
  },
  {
    title: "Dealer portal",
    blurb: "Logged-in dealers: quotes, pricing, downloads.",
    areas: [
      { name: "Dealer home + account", routes: ["/dealer", "/dealer/account"], status: "done" },
      { name: "Quotes (status + PDF download)", routes: ["/dealer/quotes"], status: "done" },
      { name: "Tier pricing view", routes: ["/dealer/pricing"], status: "done" },
      { name: "Downloads", routes: ["/dealer/downloads"], status: "partial", note: "Surface built; waits on the same real files as /resources" },
      { name: "Orders", routes: ["/dealer/orders"], status: "done" },
    ],
  },
  {
    title: "Rep portal",
    blurb: "Territory reps: their dealers, their dealers' quotes.",
    areas: [
      { name: "Rep home + dealer roster", routes: ["/rep", "/rep/dealers"], status: "done", note: "Strictly scoped — a rep sees only assigned dealers" },
      { name: "Dealer detail + quote PDFs", routes: ["/rep/dealers/[org]", "/rep/quotes/[id]"], status: "done", note: "PDF access is dealer-isolated (verified live)" },
      { name: "Invite a dealer", routes: ["/rep/invite"], status: "done" },
    ],
  },
  {
    title: "TableX operations (/ops)",
    blurb: "The internal desk — staff + admin only.",
    areas: [
      { name: "Quote desk", routes: ["/ops/quotes", "/ops/quotes/[id]"], status: "done", note: "See the Quotes & CRM tab for the full pipeline" },
      { name: "CRM — organizations", routes: ["/ops/orgs", "/ops/orgs/[id]"], status: "done", note: "Contacts, activity log, audited tier changes, rep assignments" },
      { name: "User management + invites", routes: ["/ops/users"], status: "done" },
      { name: "Xero sync + review queue", routes: ["/ops/xero"], status: "done", note: "See the Xero tab" },
      { name: "News CMS (Payload)", routes: ["/admin"], status: "done", note: "Ready for TableX to author articles" },
    ],
  },
  {
    title: "Accounts & infrastructure",
    blurb: "The plumbing under all of it.",
    areas: [
      { name: "Login (magic link + password)", routes: ["/login"], status: "done" },
      { name: "Roles: admin / staff / dealer / rep", routes: ["role-gated everywhere"], status: "done" },
      { name: "Legacy URL redirects (203 mapped)", routes: ["old site → new"], status: "done" },
      { name: "SEO (sitemap, meta, OG images)", routes: ["/sitemap.xml", "/robots.txt"], status: "done", note: "Search engines deliberately blocked until launch day" },
    ],
  },
];

export function siteMapCounts() {
  const all = SITE_MAP.flatMap((g) => g.areas);
  return {
    total: all.length,
    done: all.filter((a) => a.status === "done").length,
    partial: all.filter((a) => a.status === "partial").length,
    blocked: all.filter((a) => a.status === "blocked").length,
  };
}

/* ------------------------------------------------------------------ */
/* Spex Studio 3D coverage (from docs/spex-3d-needs-2026-07-02.md)     */
/* ------------------------------------------------------------------ */

export const SPEX_COVERAGE = {
  native: 1798, // real per-combo CAD models (10 series)
  procedural: 389, // code-drawn top + stand-in base model
  missing: 851, // quotable, but the viewer shows a placeholder
};

/** ASK 1 — one clean model per base style; each file lights up many combos. */
export const MISSING_BASES = [
  { code: "T", name: "T-Base", unlocks: 227 },
  { code: "L", name: "L-Leg", unlocks: 65 },
  { code: "Y", name: "Y-Base", unlocks: 56 },
  { code: "DR", name: "Drum Base", unlocks: 26 },
  { code: "QD", name: "Quad Disc", unlocks: 24 },
  { code: "X", name: "X-Base", unlocks: 10 },
];

/** ASK 3 — series with zero 3D entries (still fully quotable). */
export const SERIES_NO_3D = ["Revel", "App", "Element", "Artisan", "Solo", "Trig"];

export const SPEX_FILE_SPEC = [
  "GLB format, real-world scale in meters",
  "Base only — no tabletop, no floor plane",
  "One representative mid-size variant per base style is enough",
  "No materials, textures, or UVs — finishes are applied in code",
  "Sitting on the ground plane (feet at zero)",
];

/* ------------------------------------------------------------------ */
/* Resources inventory (verified against the repo — zero real files)   */
/* ------------------------------------------------------------------ */

export interface ResourceRow {
  name: string;
  offering: string;
  have: boolean;
  state: string;
  needs: string;
}

export const RESOURCES: ResourceRow[] = [
  {
    name: "Brochures & Spec Sheets",
    offering: "Series brochures, full-line catalog, finish library PDFs",
    have: false,
    state: "Page live with an honest “email us and we’ll send it same-day” state",
    needs: "The actual PDFs from TableX (per-series brochures + catalog)",
  },
  {
    name: "CAD Downloads",
    offering: "DWG, Revit families, 3D models per series",
    have: false,
    state: "Page live; requests route to the contact form",
    needs: "CAD file library from TableX engineering",
  },
  {
    name: "Price Lists",
    offering: "Dealer net price lists (login-gated)",
    have: false,
    state: "Gate page live; no lists uploaded",
    needs: "Current price list PDFs (Mark review pending)",
  },
  {
    name: "Installation Guides",
    offering: "Per-series assembly + install instructions",
    have: false,
    state: "Page live; requests route to the contact form",
    needs: "Install guide documents from TableX",
  },
  {
    name: "Sustainability",
    offering: "Environmental data, certifications",
    have: false,
    state: "Deliberate placeholder — we publish nothing we can’t verify",
    needs: "Verified certifications / data TableX is comfortable publishing",
  },
];

/* ------------------------------------------------------------------ */
/* Xero integration facts (live-verified 2026-07-15)                   */
/* ------------------------------------------------------------------ */

export const XERO_STATS = {
  contactsCached: 1457,
  customersFlagged: 34,
  customersLinked: 30,
  withAddress: 1436,
  withPhone: 1245,
  openArRows: 30,
};

export const XERO_SYNC_STEPS = [
  { step: "Refresh the secure connection", detail: "Tokens rotate on every sync; nothing is ever written back to Xero." },
  { step: "Pull every contact", detail: "Name, email, customer/supplier flag, mailing address, phone — cached in our database." },
  { step: "Auto-link exact matches", detail: "A Xero contact whose name exactly matches one unlinked CRM organization links itself." },
  { step: "Pull open receivables", detail: "Outstanding invoice balances summarized per contact (a date cutoff hides pre-migration conversion artifacts)." },
  { step: "Queue the rest for review", detail: "Everything unmatched lands in the review queue: Link to an existing org, Create a new dealer org, or Ignore." },
];

/* ------------------------------------------------------------------ */
/* Quote pipeline + CRM (verbatim from the shipped code)               */
/* ------------------------------------------------------------------ */

export interface QuoteStage {
  key: string;
  label: string;
  actor: "Dealer" | "TableX" | "Either";
  desc: string;
}

/** The six quote statuses, in pipeline order (the same timeline all three roles see). */
export const QUOTE_STAGES: QuoteStage[] = [
  {
    key: "draft",
    label: "Draft",
    actor: "Dealer",
    desc: "Every table saved in Spex Studio lands on the dealer’s open draft quote — one cart per dealer.",
  },
  {
    key: "submitted",
    label: "Submitted",
    actor: "Dealer",
    desc: "Dealer names the project and submits for pricing. The desk is emailed instantly.",
  },
  {
    key: "quoted",
    label: "Quoted",
    actor: "TableX",
    desc: "The desk prices it, writes a note to the dealer, attaches the quote PDF, and hits Send. Dealer gets “Your quote is ready.”",
  },
  {
    key: "revising",
    label: "Revising",
    actor: "Either",
    desc: "Desk can request changes with a note; the dealer re-submits. Loops as many times as needed.",
  },
  {
    key: "accepted",
    label: "Accepted",
    actor: "Dealer",
    desc: "Dealer accepts the quote — the desk is emailed and it’s ready for order entry.",
  },
  {
    key: "archived",
    label: "Archived",
    actor: "TableX",
    desc: "Desk archives completed or dead quotes to keep the board clean.",
  },
];

/** What the desk (ops) can actually do, per the shipped action set. */
export const OPS_ACTIONS = [
  {
    name: "Send quote",
    detail:
      "Requires a desk note (goes to the dealer verbatim) and optionally attaches the quote PDF (stored privately; the dealer downloads it from their portal). Can re-send with a corrected PDF at any time.",
  },
  {
    name: "Request changes",
    detail: "Bounces the quote back to the dealer with a note explaining what to change.",
  },
  {
    name: "Archive quote",
    detail: "Closes it out. No email fires — internal housekeeping.",
  },
];

export const QUOTE_NOTIFICATIONS = [
  { event: "Dealer submits / re-submits", who: "Quote desk (sales@ at launch)" },
  { event: "Desk sends the quote", who: "The dealer, reply-to routed back to the desk" },
  { event: "Desk requests changes", who: "The dealer" },
  { event: "Dealer accepts", who: "Quote desk" },
];

export const CRM_POINTS = [
  "Every dealer, rep group, and direct account is an organization with a pricing tier (50/20 family). Tier changes are audited — who, when, before/after, and why.",
  "Contacts live under each org; giving a contact portal access is one click. Reps are contacts on a rep-group org.",
  "Rep coverage is explicit: assign a rep to the dealers they own, and their portal scopes to exactly those dealers — including quote PDFs.",
  "Each org page shows its full quote history, an activity feed (calls, emails, notes), and its live Xero receivables balance.",
  "No dollar figures render anywhere on the site — pricing travels only in the quote PDF and the desk note.",
];

/* ------------------------------------------------------------------ */
/* Outstanding inputs from TableX                                      */
/* ------------------------------------------------------------------ */

export interface NeedItem {
  what: string;
  why: string;
  owner: string;
  launchBlocking: boolean;
}

export const NEEDS: NeedItem[] = [
  {
    what: "Full-site walkthrough + sign-off",
    why: "The go/no-go gate for cutover",
    owner: "Brian",
    launchBlocking: true,
  },
  {
    what: "Per-line assembly-vs-origin verification",
    why: "Confirms the Made-in-America seal claim; if mixed, we adjust the MiA page wording",
    owner: "Brian",
    launchBlocking: true,
  },
  {
    what: "sales@tablex.com mailbox",
    why: "Quote notifications currently fall through to digital@tablex.com by design; flips to sales@ the moment it exists",
    owner: "TableX IT",
    launchBlocking: false,
  },
  {
    what: "Rep territory data (who covers which states/zips)",
    why: "Unlocks the real Find-a-Rep directory — this data exists nowhere else (we checked Xero: it’s not there)",
    owner: "Brian",
    launchBlocking: false,
  },
  {
    what: "News / press content",
    why: "The News section and its CMS are live and waiting — zero articles authored",
    owner: "Brian / marketing",
    launchBlocking: false,
  },
  {
    what: "Resource files: brochures, CAD, install guides, price lists, sustainability data",
    why: "All five Resources pages are live with honest empty states — every real file we receive goes straight up",
    owner: "TableX",
    launchBlocking: false,
  },
  {
    what: "Cleaned Xero books + confirmation of the dealer list",
    why: "Migration lands ~Jul 17; one sync + a customers-filter pass then imports the real dealer roster",
    owner: "Brian / bookkeeper",
    launchBlocking: false,
  },
  {
    what: "6 base models + series offer lists for Spex Studio",
    why: "Six model files light up 408 dead combinations; offer lists unlock six series with no 3D",
    owner: "Neal (3D)",
    launchBlocking: false,
  },
  {
    what: "Photography: outdoor/Element, Elite series, finish close-ups",
    why: "Placeholder boxes swap for real shots wherever they exist — Element and outdoor settings have zero coverage today",
    owner: "Caleb",
    launchBlocking: false,
  },
  {
    what: "Price list review session",
    why: "Verify the published list pricing before dealers see it",
    owner: "Mark + Danny",
    launchBlocking: true,
  },
  {
    what: "Social profiles to link at launch",
    why: "Footer social links go live with launch per the 7/09 decision",
    owner: "TableX",
    launchBlocking: false,
  },
];

/* ------------------------------------------------------------------ */
/* Go-live: what WE still do (functionality/infra only)                */
/* ------------------------------------------------------------------ */

export const CUTOVER_STEPS = [
  { step: "Point tablex.com at the new site", detail: "DNS change; email (Microsoft 365) is untouched", owner: "ClearPH" },
  { step: "Authorize fonts for tablex.com", detail: "One-line change in the font service, then republish", owner: "ClearPH" },
  { step: "Update login/redirect URLs", detail: "Magic-link emails must point at tablex.com instead of the staging address", owner: "ClearPH" },
  { step: "Flip the launch switch", detail: "Un-hides the site from search engines and swaps quote notifications to sales@", owner: "ClearPH" },
  { step: "Decide the old WordPress site’s fate", detail: "Archive it, or park it read-only at old.tablex.com", owner: "ClearPH + TableX" },
];
