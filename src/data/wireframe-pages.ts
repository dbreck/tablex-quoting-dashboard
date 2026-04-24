// Curated 17-page TOC for public/wireframes/site.html — used as the
// "Seed from Wireframes" source on the Content Map. Each entry corresponds
// to one `<h2>` section in the wireframes HTML.

export interface WireframePage {
  id: string; // matches the #anchor in site.html
  label: string;
  group: "marketing" | "discovery" | "action" | "portal";
  templates?: string[]; // variant views bundled under this page (mobile, tablet, login, etc.)
}

export const wireframePages: WireframePage[] = [
  // ─── Marketing / brand ────────────────────────────────────────────
  { id: "home", label: "Home", group: "marketing" },
  { id: "about", label: "About · Our Story", group: "marketing" },

  // ─── Product discovery ────────────────────────────────────────────
  { id: "products", label: "Products hub", group: "discovery" },
  {
    id: "spec-studio",
    label: "Spec Studio",
    group: "discovery",
    templates: ["ss-landing", "ss-config", "ss-tablet"],
  },
  { id: "collections", label: "Collections index", group: "discovery" },
  { id: "collection-app", label: "Collection · App", group: "discovery" },
  {
    id: "product-ultra",
    label: "Product · Ultra",
    group: "discovery",
    templates: ["pd-side", "pd-band", "pd-tablet"],
  },
  { id: "browse-all", label: "Browse All", group: "discovery" },
  { id: "compare", label: "Compare Products", group: "discovery" },
  { id: "spaces", label: "Spaces hub", group: "discovery" },
  {
    id: "spaces-training",
    label: "Spaces · Training & Classroom",
    group: "discovery",
  },
  { id: "finishes", label: "Finishes hub", group: "discovery" },
  {
    id: "finishes-powder",
    label: "Finishes · Powder Coats",
    group: "discovery",
  },

  // ─── Action ───────────────────────────────────────────────────────
  {
    id: "get-a-quote",
    label: "Get a Quote · Configure & Price",
    group: "action",
  },
  { id: "find-rep", label: "Find Your Rep", group: "action" },

  // ─── Portals ──────────────────────────────────────────────────────
  {
    id: "dealer-portal",
    label: "Dealer Portal · Landing",
    group: "portal",
    templates: ["dp-desktop", "dp-tablet", "dp-login"],
  },
  { id: "rep-portal", label: "Rep Portal · Landing", group: "portal" },
];

export const wireframeGroups = [
  { id: "marketing", label: "Marketing" },
  { id: "discovery", label: "Discovery" },
  { id: "action", label: "Action" },
  { id: "portal", label: "Portals" },
] as const;
