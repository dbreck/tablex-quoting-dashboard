// WordPress Site Audit — structured data from tablex.com
// Source: WordPress admin crawl — Feb 2026
// Used by: Dashboard planning views, CPQ gap analysis, website rebuild planning

// ── Types ───────────────────────────────────────────────────────────

export interface SiteOverview {
  url: string;
  wordpress: string;
  theme: string;
  plugins: Plugin[];
  phpVersion: string;
}

export interface Plugin {
  name: string;
  slug: string;
  category: "builder" | "forms" | "seo" | "fields" | "security" | "performance" | "utility";
  version?: string;
  critical: boolean;
}

export interface ContentInventory {
  pages: number;
  posts: number;
  media: number;
  diviLayouts: number;
  gravityForms: number;
  menus: number;
}

export interface NavItem {
  label: string;
  url?: string;
  children?: NavItem[];
}

export interface ProductSeries {
  name: string;
  slug: string;
  menuOrder: number;
}

export interface Accessory {
  name: string;
  slug: string;
}

export interface Application {
  name: string;
  slug: string;
  description?: string;
}

export interface FinishCategory {
  name: string;
  slug: string;
  count?: number;
  description?: string;
}

export interface FormField {
  name: string;
  type: string;
  required: boolean;
}

export interface GravityForm {
  id: number;
  title: string;
  entries: number;
  fields: FormField[];
  notes?: string;
}

export interface WpUserRole {
  role: string;
  count: number;
}

export interface KeyPage {
  title: string;
  slug: string;
  purpose: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email?: string;
}

export interface CompanyInfo {
  name: string;
  founded: number;
  tagline: string;
  warranty: string;
  manufacturing: string;
  brandColors: { name: string; hex: string }[];
  website: string;
}

// ── Site Overview ───────────────────────────────────────────────────

export const siteOverview: SiteOverview = {
  url: "https://tablex.com",
  wordpress: "6.9",
  theme: "Divi",
  phpVersion: "8.1",
  plugins: [
    { name: "Divi Builder", slug: "divi-builder", category: "builder", version: "4.16+", critical: true },
    { name: "Gravity Forms", slug: "gravityforms", category: "forms", critical: true },
    { name: "Yoast SEO", slug: "wordpress-seo", category: "seo", critical: true },
    { name: "Advanced Custom Fields", slug: "advanced-custom-fields", category: "fields", critical: true },
    { name: "Wordfence Security", slug: "wordfence", category: "security", critical: false },
    { name: "WP Super Cache", slug: "wp-super-cache", category: "performance", critical: false },
  ],
};

// ── Content Inventory ───────────────────────────────────────────────

export const contentInventory: ContentInventory = {
  pages: 97,
  posts: 67,
  media: 2373,
  diviLayouts: 40,
  gravityForms: 5,
  menus: 2,
};

// ── Navigation Structure ────────────────────────────────────────────

export const navigationStructure: NavItem[] = [
  {
    label: "Products",
    children: [
      { label: "Ultra", url: "/products/ultra/" },
      { label: "Foundation", url: "/products/foundation/" },
      { label: "Fundamental", url: "/products/fundamental/" },
      { label: "Trig", url: "/products/trig/" },
      { label: "Stretch", url: "/products/stretch/" },
      { label: "Elite", url: "/products/elite/" },
      { label: "Revel", url: "/products/revel/" },
      { label: "App", url: "/products/app/" },
      { label: "Element", url: "/products/element/" },
      { label: "Justice", url: "/products/justice/" },
      { label: "Artisan", url: "/products/artisan/" },
      { label: "Primary", url: "/products/primary/" },
      { label: "Puddle", url: "/products/puddle/" },
      { label: "Exclaim", url: "/products/exclaim/" },
      { label: "VertiGo", url: "/products/vertigo/" },
      { label: "Surge", url: "/products/surge/" },
      { label: "TableXpress QuickShip", url: "/products/tablexpress-quickship/" },
    ],
  },
  {
    label: "Accessories",
    children: [
      { label: "Corded Power", url: "/accessories/corded-power/" },
      { label: "Daisy Link Power", url: "/accessories/daisy-link-power/" },
      { label: "Privacy Panels", url: "/accessories/privacy-panels/" },
      { label: "Modesty Panels", url: "/accessories/modesty-panels/" },
      { label: "Cup Holder", url: "/accessories/cup-holder/" },
      { label: "Locking Casters", url: "/accessories/locking-casters/" },
      { label: "MINI Drawer", url: "/accessories/mini-drawer/" },
      { label: "Tilt Lock", url: "/accessories/tilt-lock/" },
    ],
  },
  {
    label: "Applications",
    children: [
      { label: "Training & Classroom", url: "/applications/training-classroom/" },
      { label: "Caf\u00e9 & Hospitality", url: "/applications/cafe-hospitality/" },
      { label: "Collaborative & Meeting", url: "/applications/collaborative-meeting/" },
      { label: "Lounge & Informal", url: "/applications/lounge-informal/" },
      { label: "Height Adjustable", url: "/applications/height-adjustable/" },
      { label: "Nesting & Folding", url: "/applications/nesting-folding/" },
    ],
  },
  {
    label: "Finishes",
    children: [
      { label: "Paints", url: "/finishes/paints/" },
      { label: "Edges", url: "/finishes/edges/" },
      { label: "Laminates", url: "/finishes/laminates/" },
      { label: "Custom Branded Tops", url: "/finishes/custom-branded-tops/" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "About", url: "/about/" },
      { label: "Brochures", url: "/brochures/" },
      { label: "Contracts", url: "/contracts/" },
      { label: "Find Your Rep", url: "/find-your-rep/" },
      { label: "Healthy Workplace Info", url: "/healthy-workplace/" },
    ],
  },
  { label: "Get a Quote", url: "/get-a-quote/" },
];

// ── Product Series ──────────────────────────────────────────────────

export const productSeries: ProductSeries[] = [
  { name: "Ultra", slug: "ultra", menuOrder: 1 },
  { name: "Foundation", slug: "foundation", menuOrder: 2 },
  { name: "Fundamental", slug: "fundamental", menuOrder: 3 },
  { name: "Trig", slug: "trig", menuOrder: 4 },
  { name: "Stretch", slug: "stretch", menuOrder: 5 },
  { name: "Elite", slug: "elite", menuOrder: 6 },
  { name: "Revel", slug: "revel", menuOrder: 7 },
  { name: "App", slug: "app", menuOrder: 8 },
  { name: "Element", slug: "element", menuOrder: 9 },
  { name: "Justice", slug: "justice", menuOrder: 10 },
  { name: "Artisan", slug: "artisan", menuOrder: 11 },
  { name: "Primary", slug: "primary", menuOrder: 12 },
  { name: "Puddle", slug: "puddle", menuOrder: 13 },
  { name: "Exclaim", slug: "exclaim", menuOrder: 14 },
  { name: "VertiGo", slug: "vertigo", menuOrder: 15 },
  { name: "Surge", slug: "surge", menuOrder: 16 },
  { name: "TableXpress QuickShip", slug: "tablexpress-quickship", menuOrder: 17 },
];

// ── Accessories ─────────────────────────────────────────────────────

export const accessories: Accessory[] = [
  { name: "Corded Power", slug: "corded-power" },
  { name: "Daisy Link Power", slug: "daisy-link-power" },
  { name: "Privacy Panels", slug: "privacy-panels" },
  { name: "Modesty Panels", slug: "modesty-panels" },
  { name: "Cup Holder", slug: "cup-holder" },
  { name: "Locking Casters", slug: "locking-casters" },
  { name: "MINI Drawer", slug: "mini-drawer" },
  { name: "Tilt Lock", slug: "tilt-lock" },
];

// ── Applications ────────────────────────────────────────────────────

export const applications: Application[] = [
  { name: "Training & Classroom", slug: "training-classroom", description: "Conference and training room setups" },
  { name: "Caf\u00e9 & Hospitality", slug: "cafe-hospitality", description: "Dining and breakroom environments" },
  { name: "Collaborative & Meeting", slug: "collaborative-meeting", description: "Team collaboration spaces" },
  { name: "Lounge & Informal", slug: "lounge-informal", description: "Casual and social areas" },
  { name: "Height Adjustable", slug: "height-adjustable", description: "Sit-stand and ergonomic solutions" },
  { name: "Nesting & Folding", slug: "nesting-folding", description: "Stackable and space-saving options" },
];

// ── Finishes ────────────────────────────────────────────────────────

export const finishCategories: FinishCategory[] = [
  { name: "Paints", slug: "paints", count: 31, description: "31 standard paint colors for metal components" },
  { name: "Edges", slug: "edges", description: "Edge banding options for table tops" },
  { name: "Laminates", slug: "laminates", description: "Laminate surface selections" },
  { name: "Custom Branded Tops", slug: "custom-branded-tops", description: "Custom logo and graphic table tops" },
];

// ── Gravity Forms ───────────────────────────────────────────────────

export const gravityForms: GravityForm[] = [
  {
    id: 1,
    title: "Contact",
    entries: 14948,
    fields: [
      { name: "Name", type: "name", required: true },
      { name: "Email", type: "email", required: true },
      { name: "Message", type: "textarea", required: true },
    ],
  },
  {
    id: 2,
    title: "Warranty Claim",
    entries: 167,
    fields: [
      { name: "Date of Claim", type: "date", required: true },
      { name: "Name", type: "name", required: true },
      { name: "Phone", type: "phone", required: true },
      { name: "Email", type: "email", required: true },
      { name: "Sales Order #", type: "text", required: true },
      { name: "Line Item", type: "text", required: true },
      { name: "Description of Issue", type: "textarea", required: true },
      { name: "Photos", type: "fileupload", required: false },
    ],
  },
  {
    id: 3,
    title: "Freight Claims",
    entries: 70,
    fields: [
      { name: "Date of Claim", type: "date", required: true },
      { name: "Name", type: "name", required: true },
      { name: "Phone", type: "phone", required: true },
      { name: "Email", type: "email", required: true },
      { name: "Address", type: "address", required: true },
      { name: "Sales Order #", type: "text", required: true },
      { name: "BOL #", type: "text", required: true },
      { name: "Line Item", type: "text", required: true },
      { name: "Description of Issue", type: "textarea", required: true },
      { name: "Photos", type: "fileupload", required: false },
    ],
  },
  {
    id: 4,
    title: "Spiff Participation",
    entries: 120,
    fields: [
      { name: "Dealer Salesperson", type: "text", required: true },
      { name: "Dealership", type: "text", required: true },
      { name: "PO #", type: "text", required: true },
      { name: "PO Date", type: "date", required: true },
      { name: "PO Amount", type: "number", required: true },
      { name: "Spiff per Table", type: "number", required: true },
      { name: "Number of Tables", type: "number", required: true },
      { name: "Total Spiff", type: "number", required: true },
    ],
  },
  {
    id: 5,
    title: "Quote Request",
    entries: 1133,
    notes: "Primary lead generation form — maps directly to CPQ quote workflow",
    fields: [
      { name: "First Name", type: "text", required: true },
      { name: "Last Name", type: "text", required: true },
      { name: "Company", type: "text", required: true },
      { name: "Email", type: "email", required: true },
      { name: "Phone", type: "phone", required: true },
      { name: "Address", type: "address", required: false },
      { name: "City", type: "text", required: false },
      { name: "State", type: "select", required: false },
      { name: "Zip", type: "text", required: false },
      { name: "Project Name", type: "text", required: false },
      { name: "Product Series", type: "select", required: false },
      { name: "Table Shape", type: "select", required: false },
      { name: "Table Size", type: "text", required: false },
      { name: "Base Type", type: "select", required: false },
      { name: "Laminate Color", type: "text", required: false },
      { name: "Edge Style", type: "select", required: false },
      { name: "Paint Color", type: "select", required: false },
      { name: "Power/Data", type: "checkbox", required: false },
      { name: "Quantity", type: "number", required: true },
      { name: "Requested Delivery Date", type: "date", required: false },
      { name: "Additional Notes", type: "textarea", required: false },
      { name: "How Did You Hear About Us", type: "select", required: false },
    ],
  },
];

// ── User Roles ──────────────────────────────────────────────────────

export const wpUserRoles: WpUserRole[] = [
  { role: "Administrator", count: 7 },
  { role: "Editor", count: 1 },
  { role: "Subscriber", count: 41 },
  { role: "SEO Manager", count: 0 },
  { role: "SEO Editor", count: 0 },
];

// ── Key Pages ───────────────────────────────────────────────────────

export const keyPages: KeyPage[] = [
  { title: "About", slug: "about", purpose: "Company history, mission, and team overview" },
  { title: "Pricing", slug: "pricing", purpose: "Pricing structure and discount tier information" },
  { title: "Brochures", slug: "brochures", purpose: "Downloadable product brochures and spec sheets" },
  { title: "Contracts", slug: "contracts", purpose: "TIPS contract information (government/education)" },
  { title: "Find Your Rep", slug: "find-your-rep", purpose: "Dealer/rep locator by region" },
  { title: "Get a Quote", slug: "get-a-quote", purpose: "Quote request form (Gravity Forms)" },
  { title: "Healthy Workplace Info", slug: "healthy-workplace", purpose: "Ergonomic and wellness-focused product content" },
];

// ── Team ────────────────────────────────────────────────────────────

export const team: TeamMember[] = [
  { name: "Jim Skillman", role: "Owner" },
  { name: "Mark Fleck", role: "VP Operations", email: "mfleck@tablex.com" },
  { name: "Patty Wollenmann", role: "Accounting" },
  { name: "Tony Rasche", role: "Logistics" },
  { name: "Sam Sander", role: "Customer Service", email: "ssander@tablex.com" },
  { name: "Maya Mitchell", role: "Brand Manager", email: "maya@tablex.com" },
];

// ── Company Info ────────────────────────────────────────────────────

export const companyInfo: CompanyInfo = {
  name: "TableX",
  founded: 1998,
  tagline: "Commercial table manufacturer",
  warranty: "50-year warranty",
  manufacturing: "Midwest manufacturing facility",
  brandColors: [
    { name: "Green", hex: "#8dc63f" },
    { name: "Gray", hex: "#58585A" },
  ],
  website: "https://tablex.com",
};

// ── Aggregate Totals ────────────────────────────────────────────────

export const formEntryTotals = {
  contact: 14948,
  warrantyClaim: 167,
  freightClaims: 70,
  spiffParticipation: 120,
  quoteRequest: 1133,
  total: 16438,
};

export const contentTotals = {
  totalPages: 97,
  totalPosts: 67,
  totalMedia: 2373,
  totalDiviLayouts: 40,
  totalGravityForms: 5,
  totalProductSeries: 17,
  totalAccessories: 8,
  totalApplications: 6,
  totalFinishCategories: 4,
  totalWpUsers: 49,
};
