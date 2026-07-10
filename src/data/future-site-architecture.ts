// Future Site Architecture — proposed IA for the redesigned tablex.com
// Informed by: user personas, WP site audit, customer journey, CPQ gap analysis
// Updated: Brian Craig feedback (Mar 19 & 26, 2026) — Spec Studio / Collections split, geo-aware rep finder

// ── Types ───────────────────────────────────────────────────────────

export interface ArchNode {
  id: string;
  label: string;
  description?: string;
  isNew?: boolean;
  auth?: "dealer" | "rep" | "admin";
}

export interface ArchSection {
  id: string;
  label: string;
  description: string;
  color: string;
  tier: "primary" | "action" | "portal";
  isNew?: boolean;
  children: ArchNode[];
}

export interface DesignPrinciple {
  title: string;
  description: string;
  icon: string;
}

export interface PersonaPath {
  persona: string;
  accent: string;
  icon: string;
  trafficShare: string;
  goal: string;
  steps: { label: string; node: string; action: string }[];
}

export interface Comparison {
  area: string;
  current: string;
  future: string;
}

// ── Design Principles ───────────────────────────────────────────────

export const designPrinciples: DesignPrinciple[] = [
  {
    title: "Audience-Aware Paths",
    description:
      "Dealers (60%), reps (30%), and individuals (10%) each see what matters most. Products-first for pros, spaces-first for newcomers.",
    icon: "Users",
  },
  {
    title: "Spec Studio + Collections",
    description:
      "The Spec Studio configurator highlights TableX's unique base-style customization. Collections offer curated, design-focused groupings to attract the A&D community.",
    icon: "Palette",
  },
  {
    title: "Self-Service First",
    description:
      "Eliminate 617 hours/year of manual re-entry. Users configure, price, quote, and track orders without calling or emailing.",
    icon: "Zap",
  },
  {
    title: "Mobile-Ready for Reps",
    description:
      "Optimized for tablet demos during dealer visits. Reps can configure, quote, and present the full catalog on the go. Geo-aware rep cards surface local contacts.",
    icon: "Tablet",
  },
];

// ── Architecture Sections ───────────────────────────────────────────

export const architectureSections: ArchSection[] = [
  // ─── PRIMARY NAVIGATION ─────────────────────────────
  {
    id: "products",
    label: "Products",
    description: "Spec Studio configurator + curated Collections",
    color: "green",
    tier: "primary",
    children: [
      {
        id: "prod-spec-studio",
        label: "Spec Studio",
        description: "Interactive 3D configurator — pick a base style, then customize",
        isNew: true,
      },
      {
        id: "prod-collections",
        label: "Collections",
        description: "Curated design-focused groupings (App, Solo, Outdoor, Occasional, Dining)",
        isNew: true,
      },
      {
        id: "prod-browse",
        label: "Browse All",
        description: "Filterable grid of all base styles and collections",
        isNew: true,
      },
      {
        id: "prod-compare",
        label: "Compare Products",
        description: "Side-by-side comparison of up to 3 series",
        isNew: true,
      },
      {
        id: "prod-accessories",
        label: "Accessories",
        description: "Power, panels, casters, drawers + compatibility",
      },
      {
        id: "prod-quickship",
        label: "Quick Ship",
        description: "In-stock items with guaranteed delivery dates",
        isNew: true,
      },
    ],
  },
  {
    id: "spaces",
    label: "Spaces",
    description: "Use-case navigation — browse by the space you're furnishing",
    color: "violet",
    tier: "primary",
    children: [
      { id: "spaces-training", label: "Training & Classroom" },
      { id: "spaces-conference", label: "Conference & Meeting" },
      { id: "spaces-collab", label: "Collaborative" },
      { id: "spaces-cafe", label: "Cafe & Hospitality" },
      { id: "spaces-healthcare", label: "Healthcare" },
    ],
  },
  {
    id: "finishes",
    label: "Finishes",
    description: "Visual material library with swatches",
    color: "amber",
    tier: "primary",
    children: [
      {
        id: "fin-powder",
        label: "Powder Coats",
        description: "31 standard colors",
      },
      {
        id: "fin-laminates",
        label: "Laminates",
        description: "HPL and TFL options",
      },
      {
        id: "fin-edges",
        label: "Edge Bands",
        description: "8 edge types with cross-sections",
      },
      { id: "fin-surfaces", label: "Solid Surface & Butcher Block" },
      { id: "fin-custom", label: "Custom Branded Tops" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    description: "Downloads and reference materials",
    color: "slate",
    tier: "primary",
    children: [
      { id: "res-brochures", label: "Brochures & Spec Sheets" },
      {
        id: "res-cad",
        label: "CAD Downloads",
        description: "DWG / Revit for space planning",
        isNew: true,
      },
      {
        id: "res-pricelists",
        label: "Price Lists",
        description: "Login required",
        auth: "dealer",
      },
      {
        id: "res-casestudies",
        label: "Case Studies",
        description: "Project showcases by space type",
        isNew: true,
      },
      { id: "res-sustainability", label: "Sustainability", isNew: true },
      { id: "res-install", label: "Installation Guides", isNew: true },
    ],
  },
  {
    id: "about",
    label: "About",
    description: "Company information and trust signals",
    color: "sky",
    tier: "primary",
    children: [
      { id: "about-story", label: "Our Story" },
      {
        id: "about-mfg",
        label: "Shipping & Origin",
        description: "Shipped & distributed from Jasper, Indiana",
      },
      { id: "about-warranty", label: "50-Year Warranty" },
      {
        id: "about-contracts",
        label: "TIPS & Contracts",
        description: "Govt / education purchasing",
      },
      { id: "about-careers", label: "Careers", isNew: true },
    ],
  },

  // ─── ACTION ITEMS ───────────────────────────────────
  {
    id: "quote",
    label: "Get a Quote",
    description: "Self-service CPQ with real-time pricing",
    color: "emerald",
    tier: "action",
    isNew: true,
    children: [
      {
        id: "quote-cpq",
        label: "Configure & Price",
        description: "Interactive CPQ with live pricing",
        isNew: true,
      },
      {
        id: "quote-quick",
        label: "Quick Quote Form",
        description: "Simplified form for standard configs",
      },
      {
        id: "quote-track",
        label: "Track My Quote",
        description: "Status dashboard with revision capability",
        isNew: true,
        auth: "dealer",
      },
    ],
  },
  {
    id: "find-rep",
    label: "Find Your Rep",
    description: "Interactive territory map + geo-aware rep cards on product pages",
    color: "indigo",
    tier: "action",
    isNew: true,
    children: [
      {
        id: "rep-map",
        label: "Territory Map",
        description: "Search by zip code or state",
        isNew: true,
      },
      {
        id: "rep-profiles",
        label: "Rep Profiles",
        description: "Contact info, territories, specialties",
        isNew: true,
      },
      {
        id: "rep-geo",
        label: "Geo-Aware Rep Cards",
        description: "Auto-show local reps at bottom of product/collection pages (à la JSI)",
        isNew: true,
      },
    ],
  },

  // ─── AUTHENTICATED PORTALS ──────────────────────────
  {
    id: "dealer-portal",
    label: "Dealer Portal",
    description: "Authenticated hub for commercial furniture dealers",
    color: "blue",
    tier: "portal",
    isNew: true,
    children: [
      {
        id: "dp-pricing",
        label: "Dealer Pricing",
        description: "Tiered pricing with volume discounts",
        isNew: true,
        auth: "dealer",
      },
      {
        id: "dp-quotes",
        label: "My Quotes",
        description: "History, revisions, reordering",
        isNew: true,
        auth: "dealer",
      },
      {
        id: "dp-orders",
        label: "My Orders",
        description: "PO tracking from submission to delivery",
        isNew: true,
        auth: "dealer",
      },
      {
        id: "dp-downloads",
        label: "Downloads",
        description: "Price lists, spec sheets, CAD",
        auth: "dealer",
      },
      { id: "dp-account", label: "Account Settings", isNew: true, auth: "dealer" },
    ],
  },
  {
    id: "rep-portal",
    label: "Rep Portal",
    description: "Dashboard for manufacturer's representatives",
    color: "teal",
    tier: "portal",
    isNew: true,
    children: [
      {
        id: "rp-territory",
        label: "Territory Dashboard",
        description: "Pipeline, dealer activity, forecasts",
        isNew: true,
        auth: "rep",
      },
      {
        id: "rp-pricing",
        label: "Pricing & Margins",
        description: "Dealer cost and volume tiers",
        isNew: true,
        auth: "rep",
      },
      {
        id: "rp-tools",
        label: "Sales Tools & Training",
        description: "Presentations, competitive guides",
        isNew: true,
        auth: "rep",
      },
      {
        id: "rp-pipeline",
        label: "Quote Pipeline",
        description: "All territory quotes by status",
        isNew: true,
        auth: "rep",
      },
      {
        id: "rp-commissions",
        label: "Commission Tracking",
        isNew: true,
        auth: "rep",
      },
    ],
  },
];

// ── Utility Navigation ──────────────────────────────────────────────

export const utilityNav: ArchNode[] = [
  {
    id: "util-search",
    label: "Search",
    description: "Global search across products, finishes, and resources",
    isNew: true,
  },
  {
    id: "util-login",
    label: "Login / Account",
    description: "Auth for dealers, reps, and admin",
  },
  { id: "util-contact", label: "Contact" },
  {
    id: "util-cart",
    label: "Cart",
    description: "Direct purchase for 1-10 table orders",
    isNew: true,
  },
];

// ── Persona Paths ───────────────────────────────────────────────────

export const personaPaths: PersonaPath[] = [
  {
    persona: "Commercial Dealer",
    accent: "blue",
    icon: "Building2",
    trafficShare: "~60%",
    goal: "Quote a project for a client in under 5 minutes",
    steps: [
      {
        label: "Login",
        node: "Dealer Portal",
        action: "Authenticate with dealer credentials",
      },
      {
        label: "Configure",
        node: "Spec Studio",
        action: "Pick a base style, then customize shape, size, finishes in 3D",
      },
      {
        label: "Price",
        node: "Configure & Price",
        action: "See tiered dealer pricing in real-time",
      },
      {
        label: "Quote",
        node: "Get a Quote",
        action: "Generate and download quote PDF instantly",
      },
      {
        label: "Track",
        node: "My Quotes",
        action: "Monitor status, request revisions online",
      },
      {
        label: "Order",
        node: "My Orders",
        action: "Convert accepted quote to PO with one click",
      },
    ],
  },
  {
    persona: "Manufacturer's Rep",
    accent: "green",
    icon: "Briefcase",
    trafficShare: "~30%",
    goal: "Prep for dealer visit with current product info on tablet",
    steps: [
      {
        label: "Login",
        node: "Rep Portal",
        action: "Access territory dashboard on tablet",
      },
      {
        label: "Review",
        node: "Products",
        action: "Check latest specs, pricing, and lead times",
      },
      {
        label: "Download",
        node: "Sales Tools",
        action: "Grab brochures, images, and presentations",
      },
      {
        label: "Demo",
        node: "Spec Studio",
        action: "Live demo for dealer on tablet at their showroom",
      },
      {
        label: "Quote",
        node: "Quote Pipeline",
        action: "Submit quote on dealer's behalf, track status",
      },
      {
        label: "Report",
        node: "Territory Dashboard",
        action: "Review pipeline and commission forecasts",
      },
    ],
  },
  {
    persona: "Individual Buyer",
    accent: "amber",
    icon: "User",
    trafficShare: "~10%",
    goal: "Find and buy 6 training tables for a new office",
    steps: [
      {
        label: "Discover",
        node: "Spaces → Training",
        action: "Land via Google, browse by use case",
      },
      {
        label: "Browse",
        node: "Products → Browse",
        action: "Filter by space type, compare options",
      },
      {
        label: "Configure",
        node: "Spec Studio",
        action: "Select finishes, see total price instantly",
      },
      {
        label: "Purchase",
        node: "Cart → Checkout",
        action: "Buy directly — no dealer required for small orders",
      },
      {
        label: "Track",
        node: "My Orders",
        action: "Confirmation email, delivery tracking",
      },
    ],
  },
];

// ── Current vs. Future ──────────────────────────────────────────────

export const currentVsFuture: Comparison[] = [
  {
    area: "Product Browsing",
    current: "17 static Divi pages with no filtering or comparison",
    future: "Spec Studio for base-style customization + curated Collections for A&D. Filterable grid with 3D configurator and side-by-side comparison",
  },
  {
    area: "Quoting",
    current: "Gravity Form → email → manual spreadsheet lookup (617 hrs/yr wasted)",
    future: "Self-service CPQ: configure → price → quote → track — all online",
  },
  {
    area: "Quote Tracking",
    current: "None — email back-and-forth with no status visibility",
    future: "Dashboard with real-time status, revision requests, and history",
  },
  {
    area: "Space-Based Browsing",
    current: "No use-case navigation — only product series pages",
    future: "\"Spaces\" navigation lets visitors browse by room type (training, conference, cafe, etc.)",
  },
  {
    area: "Find a Rep",
    current: "Static hardcoded HTML page, no territory mapping",
    future: "Interactive map with zip/state search, rep profiles, and geo-aware rep cards on product pages (à la JSI)",
  },
  {
    area: "Dealer Portal",
    current: "Abandoned — 41 dead subscriber accounts, no gated content",
    future: "Full portal: tiered pricing, quote history, order tracking, downloads",
  },
  {
    area: "Rep Tools",
    current: "None — reps have no dedicated area on the site",
    future: "Territory dashboard, pipeline tracking, commissions, training materials",
  },
  {
    area: "Search",
    current: "WordPress default search (poor relevance)",
    future: "Global search across products, finishes, resources with faceted filters",
  },
  {
    area: "Direct Purchase",
    current: "Not possible — all buyers must go through dealer channel",
    future: "Cart + checkout for 1-10 table orders without dealer",
  },
  {
    area: "CAD Downloads",
    current: "Not available on the website",
    future: "DWG / Revit file library organized by series",
  },
  {
    area: "Case Studies",
    current: "None",
    future: "Project showcases organized by space type and industry",
  },
  {
    area: "Mobile Experience",
    current: "Basic Divi responsive — not optimized for tablet or mobile",
    future: "Mobile-first design, optimized for rep tablet use during dealer visits",
  },
];

// ── Stats ───────────────────────────────────────────────────────────

export const architectureStats = {
  totalSections: 9,
  totalPages: architectureSections.reduce(
    (sum, s) => sum + s.children.length,
    0
  ),
  newPages: architectureSections.reduce(
    (sum, s) =>
      sum +
      s.children.filter((c) => c.isNew).length +
      (s.isNew ? 1 : 0),
    0
  ),
  authenticatedPages: architectureSections.reduce(
    (sum, s) => sum + s.children.filter((c) => c.auth).length,
    0
  ),
};

// ═══════════════════════════════════════════════════════════════════
//  Draft-Specific Data
//  v1: "Transparent Pricing" — public pricing, applications terminology
//  v2: Current default — self-service CPQ, spaces terminology
//  v3: "Quote-Back Flow" — no visible pricing until quote received
// ═══════════════════════════════════════════════════════════════════

// ── v1: Transparent Pricing ─────────────────────────────────────────

export const v1DesignPrinciples: DesignPrinciple[] = [
  {
    title: "Audience-Aware Paths",
    description:
      "Dealers (60%), reps (30%), and individuals (10%) each see what matters most. Products-first for pros, applications-first for newcomers.",
    icon: "Users",
  },
  {
    title: "Spec Studio + Collections",
    description:
      "The Spec Studio configurator highlights TableX's unique base-style customization. Collections offer curated, design-focused groupings to attract the A&D community.",
    icon: "Palette",
  },
  {
    title: "Pricing Transparency",
    description:
      "End the 'request a quote' dead-end. Public pricing ranges, tiered dealer pricing behind login, self-service CPQ for all audiences.",
    icon: "DollarSign",
  },
  {
    title: "Self-Service First",
    description:
      "Eliminate 617 hours/year of manual re-entry. Users configure, price, quote, and track orders without calling or emailing.",
    icon: "Zap",
  },
];

export const v1PersonaPaths: PersonaPath[] = [
  {
    persona: "Commercial Dealer",
    accent: "blue",
    icon: "Building2",
    trafficShare: "~60%",
    goal: "Quote a project for a client in under 5 minutes",
    steps: [
      { label: "Login", node: "Dealer Portal", action: "Authenticate with dealer credentials" },
      { label: "Configure", node: "Spec Studio", action: "Pick a base style, then customize shape, size, finishes in 3D" },
      { label: "Price", node: "Configure & Price", action: "See tiered dealer pricing in real-time" },
      { label: "Quote", node: "Get a Quote", action: "Generate and download quote PDF instantly" },
      { label: "Track", node: "My Quotes", action: "Monitor status, request revisions online" },
      { label: "Order", node: "My Orders", action: "Convert accepted quote to PO with one click" },
    ],
  },
  {
    persona: "Manufacturer's Rep",
    accent: "green",
    icon: "Briefcase",
    trafficShare: "~30%",
    goal: "Prep for dealer visit with current product info on tablet",
    steps: [
      { label: "Login", node: "Rep Portal", action: "Access territory dashboard on tablet" },
      { label: "Review", node: "Products", action: "Check latest specs, pricing, and lead times" },
      { label: "Download", node: "Sales Tools", action: "Grab brochures, images, and presentations" },
      { label: "Demo", node: "Spec Studio", action: "Live demo for dealer on tablet at their showroom" },
      { label: "Quote", node: "Quote Pipeline", action: "Submit quote on dealer's behalf, track status" },
      { label: "Report", node: "Territory Dashboard", action: "Review pipeline and commission forecasts" },
    ],
  },
  {
    persona: "Individual Buyer",
    accent: "amber",
    icon: "User",
    trafficShare: "~10%",
    goal: "Find and buy 6 training tables for a new office",
    steps: [
      { label: "Discover", node: "Applications → Training", action: "Land via Google, browse by use case" },
      { label: "Browse", node: "Products → Browse", action: "Filter by application, see pricing ranges" },
      { label: "Configure", node: "Spec Studio", action: "Select finishes, see total price instantly" },
      { label: "Purchase", node: "Cart → Checkout", action: "Buy directly — no dealer required for small orders" },
      { label: "Track", node: "My Orders", action: "Confirmation email, delivery tracking" },
    ],
  },
];

export const v1CurrentVsFuture: Comparison[] = [
  {
    area: "Product Browsing",
    current: "17 static Divi pages with no filtering or comparison",
    future: "Spec Studio for base-style customization + curated Collections for A&D. Filterable grid with 3D configurator, instant pricing ranges",
  },
  {
    area: "Pricing",
    current: "PDF price lists only — downloaded and looked up manually",
    future: "Dynamic pricing: public ranges, authenticated dealer tiers, live CPQ",
  },
  {
    area: "Quoting",
    current: "Gravity Form → email → manual spreadsheet lookup (617 hrs/yr wasted)",
    future: "Self-service CPQ: configure → price → quote → track — all online",
  },
  {
    area: "Quote Tracking",
    current: "None — email back-and-forth with no status visibility",
    future: "Dashboard with real-time status, revision requests, and history",
  },
  {
    area: "Find a Rep",
    current: "Static hardcoded HTML page, no territory mapping",
    future: "Interactive map with zip/state search, rep profiles, and geo-aware rep cards on product pages (à la JSI)",
  },
  {
    area: "Dealer Portal",
    current: "Abandoned — 41 dead subscriber accounts, no gated content",
    future: "Full portal: tiered pricing, quote history, order tracking, downloads",
  },
  {
    area: "Rep Tools",
    current: "None — reps have no dedicated area on the site",
    future: "Territory dashboard, pipeline tracking, commissions, training materials",
  },
  {
    area: "Search",
    current: "WordPress default search (poor relevance)",
    future: "Global search across products, finishes, resources with faceted filters",
  },
  {
    area: "Direct Purchase",
    current: "Not possible — all buyers must go through dealer channel",
    future: "Cart + checkout for 1–10 table orders without dealer",
  },
  {
    area: "CAD Downloads",
    current: "Not available on the website",
    future: "DWG / Revit file library organized by series",
  },
  {
    area: "Case Studies",
    current: "None",
    future: "Project showcases organized by application type and industry",
  },
  {
    area: "Mobile Experience",
    current: "Basic Divi responsive — not optimized for tablet or mobile",
    future: "Mobile-first design, optimized for rep tablet use during dealer visits",
  },
];

// ── v3: Quote-Back Flow ─────────────────────────────────────────────

export const v3DesignPrinciples: DesignPrinciple[] = [
  {
    title: "Audience-Aware Paths",
    description:
      "Dealers (60%), reps (30%), and individuals (10%) each see what matters most. Products-first for pros, spaces-first for newcomers.",
    icon: "Users",
  },
  {
    title: "Configure Without Commitment",
    description:
      "Users explore the Spec Studio configurator freely without seeing pricing. Collections offer curated groupings for A&D visitors. Removes sticker shock and protects dealer margins.",
    icon: "Palette",
  },
  {
    title: "Quote-Back Pricing",
    description:
      "All pricing flows through TableX's quoting engine — ensuring accurate dealer tiers, volume discounts, and territory rules every time.",
    icon: "MessageSquareQuote",
  },
  {
    title: "Mobile-Ready for Reps",
    description:
      "Optimized for tablet demos during dealer visits. Reps configure and submit quote requests on the go. Geo-aware rep cards surface local contacts on every product page.",
    icon: "Tablet",
  },
];

export interface V3PersonaFlow {
  persona: string;
  accent: string;
  icon: string;
  trafficShare: string;
  goal: string;
  steps: {
    label: string;
    node: string;
    action: string;
    zone: "frontend" | "backend" | "delivery";
  }[];
}

export const v3PersonaFlows: V3PersonaFlow[] = [
  {
    persona: "Commercial Dealer",
    accent: "blue",
    icon: "Building2",
    trafficShare: "~60%",
    goal: "Configure a project and receive a dealer-priced quote",
    steps: [
      { label: "Login", node: "Dealer Portal", action: "Authenticate with dealer credentials", zone: "frontend" },
      { label: "Configure", node: "Spec Studio", action: "Pick a base style, customize shape, size, finishes — no pricing shown", zone: "frontend" },
      { label: "Submit", node: "Request a Quote", action: "Configuration sent to TableX for pricing", zone: "frontend" },
      { label: "Process", node: "Pricing Engine", action: "Dealer tier, volume discounts, and rules applied", zone: "backend" },
      { label: "Receive", node: "Portal + Email", action: "Quote PDF appears in My Quotes dashboard and inbox", zone: "delivery" },
      { label: "Order", node: "My Orders", action: "Accept quote and convert to purchase order", zone: "frontend" },
    ],
  },
  {
    persona: "Manufacturer's Rep",
    accent: "green",
    icon: "Briefcase",
    trafficShare: "~30%",
    goal: "Demo products on tablet and submit quotes for dealers",
    steps: [
      { label: "Login", node: "Rep Portal", action: "Access territory dashboard on tablet", zone: "frontend" },
      { label: "Demo", node: "Spec Studio", action: "Live configuration demo — no pricing visible", zone: "frontend" },
      { label: "Submit", node: "Request a Quote", action: "Submit on dealer's behalf with territory info", zone: "frontend" },
      { label: "Process", node: "Pricing Engine", action: "Territory pricing and rep commission calculated", zone: "backend" },
      { label: "Receive", node: "Portal + Email", action: "Quote in rep portal, dealer portal, and both inboxes", zone: "delivery" },
      { label: "Report", node: "Territory Dashboard", action: "Track quote pipeline and commission forecasts", zone: "frontend" },
    ],
  },
  {
    persona: "Individual Buyer",
    accent: "amber",
    icon: "User",
    trafficShare: "~10%",
    goal: "Find training tables and get a price without needing a dealer",
    steps: [
      { label: "Discover", node: "Spaces", action: "Browse by room type — training, conference, etc.", zone: "frontend" },
      { label: "Configure", node: "Spec Studio", action: "Select finishes and options — no pricing shown", zone: "frontend" },
      { label: "Submit", node: "Request a Quote", action: "Provide email; optionally create an account", zone: "frontend" },
      { label: "Process", node: "Pricing Engine", action: "Standard pricing rules and availability checked", zone: "backend" },
      { label: "Receive", node: "Email (+ Account)", action: "Quote sent to email; also in account if created", zone: "delivery" },
      { label: "Purchase", node: "Accept Quote", action: "Click link in email or portal to accept and checkout", zone: "frontend" },
    ],
  },
];

export const v3CurrentVsFuture: Comparison[] = [
  {
    area: "Product Browsing",
    current: "17 static Divi pages with no filtering or comparison",
    future: "Spec Studio for base-style customization + curated Collections for A&D. Explore freely without pricing pressure",
  },
  {
    area: "Pricing Visibility",
    current: "PDF price lists downloadable by anyone",
    future: "No public pricing — all pricing delivered through personalized quotes with accurate dealer tiers",
  },
  {
    area: "Quoting",
    current: "Gravity Form → email → manual spreadsheet lookup (617 hrs/yr wasted)",
    future: "Configure → Submit → Quote-back: automated pricing engine returns dealer-accurate quotes",
  },
  {
    area: "Quote Tracking",
    current: "None — email back-and-forth with no status visibility",
    future: "Quotes appear in portal dashboards and email — full status tracking",
  },
  {
    area: "Space-Based Browsing",
    current: "No use-case navigation — only product series pages",
    future: "\"Spaces\" navigation lets visitors browse by room type (training, conference, cafe, etc.)",
  },
  {
    area: "Find a Rep",
    current: "Static hardcoded HTML page, no territory mapping",
    future: "Interactive map with zip/state search, rep profiles, and geo-aware rep cards on product pages (à la JSI)",
  },
  {
    area: "Dealer Portal",
    current: "Abandoned — 41 dead subscriber accounts, no gated content",
    future: "Full portal: received quotes, order tracking, downloads — pricing only in delivered quotes",
  },
  {
    area: "Rep Tools",
    current: "None — reps have no dedicated area on the site",
    future: "Territory dashboard, quote pipeline, commissions — submit quotes on dealers' behalf",
  },
  {
    area: "Search",
    current: "WordPress default search (poor relevance)",
    future: "Global search across products, finishes, resources with faceted filters",
  },
  {
    area: "Direct Purchase",
    current: "Not possible — all buyers must go through dealer channel",
    future: "Individual buyers receive quotes via email, accept and checkout without a dealer",
  },
  {
    area: "CAD Downloads",
    current: "Not available on the website",
    future: "DWG / Revit file library organized by series",
  },
  {
    area: "Mobile Experience",
    current: "Basic Divi responsive — not optimized for tablet or mobile",
    future: "Mobile-first design, optimized for rep tablet demos and on-the-go quote requests",
  },
];
