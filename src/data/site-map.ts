// Canonical sitemap for tablex-site (the public marketing site, dealer/rep
// portals, customer-facing CPQ, and Spex Studio).
//
// Source of truth for /content/site-map. Synthesized from:
//   - tablex-site/docs/architecture/target-state.md §1 (route groups)
//   - src/data/future-site-architecture.ts (IA — Brian Mar 19/26 feedback)
//   - src/data/wireframe-pages.ts (template list — informs page purposes)
//   - tablex-site/docs/discovery/content-map-snapshot.md (frozen IA snapshot)
//
// When you add a route, also add the matching `contentNodeRef` if a node
// already exists in `content_nodes` (sa-* from Site Architecture seed,
// wf-* from Wireframes seed). Leave undefined if no node exists.
//
// "Spec Studio" is now Spex Studio — see project-spex-studio-naming memory.

export type Audience = "public" | "dealer" | "rep" | "editor" | "admin";

/** Where the content lives. Payload = CMS-editable; Dynamic = code/Supabase. */
export type Owner = "payload" | "dynamic";

export type ApprovalStatus = "approved" | "pending" | "review";

export interface SiteMapPage {
  /** Unique slug for the entry. Used as React key + xyflow node id. */
  id: string;
  /** URL pattern. Use `:param` for dynamic segments. */
  route: string;
  /** Page name shown in nav and Brian's review. */
  label: string;
  description?: string;
  audience: Audience;
  owner: Owner;
  approval: ApprovalStatus;
  /** Net-new in Phase 2 vs current tablex.com. */
  isNew?: boolean;
  notes?: string;
  /** Parent page id within the same group (for tree edges). */
  parentId?: string;
  /** Cross-link to content_nodes (sa-* / wf-* / custom prefix). */
  contentNodeRef?: string;
}

export interface SiteMapGroup {
  id: string;
  label: string;
  description: string;
  /** Route group label from target-state §1 (e.g. "(frontend)"). */
  routeGroup: string;
  /** Dominant audience for the whole group. Pages can override. */
  audience: Audience;
  /** Tailwind color token used for the group node accent. */
  color: string;
  pages: SiteMapPage[];
}

// ─── Public — Marketing ───────────────────────────────────────────────

const publicMarketing: SiteMapGroup = {
  id: "public-marketing",
  label: "Public — Marketing",
  description:
    "Brand surfaces, About, Resources, news, contact, and global search. Mostly Payload-managed.",
  routeGroup: "(frontend)",
  audience: "public",
  color: "emerald",
  pages: [
    {
      id: "home",
      route: "/",
      label: "Home",
      description: "Brand hero, featured collections, social proof, CTAs into Spex Studio + Find Rep.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "wf-home",
    },
    {
      id: "about",
      route: "/about",
      label: "About · Our Story",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "sa-about-story",
    },
    {
      id: "about-warranty",
      route: "/about/warranty",
      label: "50-Year Warranty",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "about",
      contentNodeRef: "sa-about-warranty",
    },
    {
      id: "about-contracts",
      route: "/about/contracts",
      label: "TIPS & Contracts",
      description: "Govt / education purchasing.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "about",
      contentNodeRef: "sa-about-contracts",
    },
    {
      id: "about-careers",
      route: "/about/careers",
      label: "Careers",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "about",
      contentNodeRef: "sa-about-careers",
    },
    {
      id: "resources",
      route: "/resources",
      label: "Resources",
      description: "Hub: brochures, CAD, price lists, case studies, sustainability, install guides.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "sa-resources",
    },
    {
      id: "resources-brochures",
      route: "/resources/brochures",
      label: "Brochures & Spec Sheets",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "resources",
      contentNodeRef: "sa-res-brochures",
    },
    {
      id: "resources-cad",
      route: "/resources/cad",
      label: "CAD Downloads",
      description: "DWG / Revit for space planning.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "resources",
      contentNodeRef: "sa-res-cad",
    },
    {
      id: "resources-price-lists",
      route: "/resources/price-lists",
      label: "Price Lists",
      description: "Login required — gates the PDF download list, not the route itself.",
      audience: "dealer",
      owner: "payload",
      approval: "pending",
      parentId: "resources",
      contentNodeRef: "sa-res-pricelists",
    },
    {
      id: "resources-case-studies",
      route: "/resources/case-studies",
      label: "Case Studies",
      description: "Project showcases by space type.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "resources",
      contentNodeRef: "sa-res-casestudies",
    },
    {
      id: "resources-sustainability",
      route: "/resources/sustainability",
      label: "Sustainability",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "resources",
      contentNodeRef: "sa-res-sustainability",
    },
    {
      id: "resources-install",
      route: "/resources/install",
      label: "Installation Guides",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "resources",
      contentNodeRef: "sa-res-install",
    },
    {
      id: "news",
      route: "/news",
      label: "News & Events",
      description: "Trade shows, releases, company updates.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
    },
    {
      id: "news-detail",
      route: "/news/:slug",
      label: "News article",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "news",
    },
    {
      id: "contact",
      route: "/contact",
      label: "Contact",
      description: "General inquiry form, mailing address, customer service.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      contentNodeRef: "sa-util-contact",
    },
    {
      id: "search",
      route: "/search",
      label: "Search",
      description: "Global faceted search — Postgres FTS over Pages + Series + Resources.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      contentNodeRef: "sa-util-search",
    },
  ],
};

// ─── Public — Catalog (Products / Spaces / Finishes) ─────────────────

const publicCatalog: SiteMapGroup = {
  id: "public-catalog",
  label: "Public — Catalog",
  description:
    "Product hub, Collections, Series detail pages, Spaces, Finishes. All Payload-managed.",
  routeGroup: "(frontend)",
  audience: "public",
  color: "violet",
  pages: [
    {
      id: "products",
      route: "/products",
      label: "Products hub",
      description: "Top-level entry into Spex Studio + Collections + Browse + Compare.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "sa-products",
    },
    {
      id: "products-collections",
      route: "/products/collections",
      label: "Collections index",
      description: "Curated design-focused groupings (App, Solo, Outdoor, Occasional, Dining).",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "products",
      contentNodeRef: "sa-prod-collections",
    },
    {
      id: "products-collections-detail",
      route: "/products/collections/:slug",
      label: "Collection detail",
      description: "Single curated grouping (e.g. App). Renders series cards + space CTAs.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "products-collections",
      contentNodeRef: "wf-collection-app",
    },
    {
      id: "products-browse",
      route: "/products/browse",
      label: "Browse All",
      description: "Filterable grid of every base style.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "products",
      contentNodeRef: "sa-prod-browse",
    },
    {
      id: "products-compare",
      route: "/products/compare",
      label: "Compare Products",
      description: "Side-by-side comparison of up to 3 series.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "products",
      contentNodeRef: "sa-prod-compare",
    },
    {
      id: "products-accessories",
      route: "/products/accessories",
      label: "Accessories",
      description: "Power, panels, casters, drawers + compatibility.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "products",
      contentNodeRef: "sa-prod-accessories",
    },
    {
      id: "products-quick-ship",
      route: "/products/quick-ship",
      label: "Quick Ship",
      description: "In-stock items with guaranteed delivery dates.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "products",
      contentNodeRef: "sa-prod-quickship",
    },
    {
      id: "series-detail",
      route: "/series/:slug",
      label: "Series detail",
      description: "Hero, gallery, spec, finish picker preview, Configure button → Spex Studio.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "wf-product-ultra",
    },
    {
      id: "spaces",
      route: "/spaces",
      label: "Spaces hub",
      description: "Use-case navigation — browse by the space you're furnishing.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "sa-spaces",
    },
    {
      id: "spaces-training",
      route: "/spaces/training-classroom",
      label: "Training & Classroom",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "spaces",
      contentNodeRef: "sa-spaces-training",
    },
    {
      id: "spaces-conference",
      route: "/spaces/conference-meeting",
      label: "Conference & Meeting",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "spaces",
      contentNodeRef: "sa-spaces-conference",
    },
    {
      id: "spaces-collab",
      route: "/spaces/collaborative",
      label: "Collaborative",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "spaces",
      contentNodeRef: "sa-spaces-collab",
    },
    {
      id: "spaces-cafe",
      route: "/spaces/cafe-hospitality",
      label: "Cafe & Hospitality",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "spaces",
      contentNodeRef: "sa-spaces-cafe",
    },
    {
      id: "spaces-healthcare",
      route: "/spaces/healthcare",
      label: "Healthcare",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "spaces",
      contentNodeRef: "sa-spaces-healthcare",
    },
    {
      id: "finishes",
      route: "/finishes",
      label: "Finishes hub",
      description: "Visual material library with swatches.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      contentNodeRef: "sa-finishes",
    },
    {
      id: "finishes-powder",
      route: "/finishes/powder-coats",
      label: "Powder Coats",
      description: "31 standard colors.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "finishes",
      contentNodeRef: "sa-fin-powder",
    },
    {
      id: "finishes-laminates",
      route: "/finishes/laminates",
      label: "Laminates",
      description: "HPL and TFL options.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "finishes",
      contentNodeRef: "sa-fin-laminates",
    },
    {
      id: "finishes-edges",
      route: "/finishes/edge-bands",
      label: "Edge Bands",
      description: "8 edge types with cross-sections.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "finishes",
      contentNodeRef: "sa-fin-edges",
    },
    {
      id: "finishes-surfaces",
      route: "/finishes/solid-surface",
      label: "Solid Surface & Butcher Block",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "finishes",
      contentNodeRef: "sa-fin-surfaces",
    },
    {
      id: "finishes-custom",
      route: "/finishes/custom",
      label: "Custom Branded Tops",
      audience: "public",
      owner: "payload",
      approval: "pending",
      parentId: "finishes",
      contentNodeRef: "sa-fin-custom",
    },
  ],
};

// ─── Public — Action (Quote + Find Rep) ──────────────────────────────

const publicAction: SiteMapGroup = {
  id: "public-action",
  label: "Public — Action",
  description:
    "Conversion surfaces: Get a Quote (CPQ + cart + submit), Find a Rep. Dynamic, Supabase-backed.",
  routeGroup: "(frontend)",
  audience: "public",
  color: "amber",
  pages: [
    {
      id: "quote",
      route: "/quote",
      label: "Get a Quote",
      description: "Landing — three doors: Configure & Price (full CPQ), Quick Form, Saved Configs.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      contentNodeRef: "sa-quote",
    },
    {
      id: "quote-new",
      route: "/quote/new",
      label: "Configure & Price",
      description: "Full CPQ wizard — uses Spex Studio for shape / base / size / finishes.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "quote",
      contentNodeRef: "sa-quote-cpq",
    },
    {
      id: "quote-quick",
      route: "/quote/quick",
      label: "Quick Quote Form",
      description: "Simplified form for standard configs — fallback for users who don't want to configure visually.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      parentId: "quote",
      contentNodeRef: "sa-quote-quick",
    },
    {
      id: "quote-cart",
      route: "/quote/cart",
      label: "Saved Configurations",
      description: "Cart-style holding tank for in-progress configs the user wants to come back to. Auth optional — anon carts persist via cookie+token.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "quote",
      notes: "Replaces the e-commerce 'Cart' concept from the prior IA. There is no checkout — the cart resolves into a Quote Request, not an order.",
    },
    {
      id: "quote-submit",
      route: "/quote/submit",
      label: "Submit Quote Request",
      description: "Confirm & send. Captures contact details, dealer affiliation (optional), notes; creates a `quotes` row with `status='request'`.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "quote",
    },
    {
      id: "quote-confirmation",
      route: "/quote/:id/confirm",
      label: "Quote Request received",
      description: "Post-submit confirmation page — surfaces the quote token, next-steps, link to claim by signing up.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "quote",
    },
    {
      id: "quote-track",
      route: "/quote/:id",
      label: "Track My Quote",
      description: "Status dashboard with revision capability — accessible by token (anon) or via dealer portal once claimed.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "quote",
      contentNodeRef: "sa-quote-track",
    },
    {
      id: "find-rep",
      route: "/find-rep",
      label: "Find Your Rep",
      description: "Interactive territory map + rep cards. Geo-aware cards also surface on product/collection pages (à la JSI).",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      contentNodeRef: "sa-find-rep",
    },
    {
      id: "find-rep-map",
      route: "/find-rep/map",
      label: "Territory Map",
      description: "Search by zip code or state.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "find-rep",
      contentNodeRef: "sa-rep-map",
    },
    {
      id: "find-rep-profile",
      route: "/find-rep/:slug",
      label: "Rep profile",
      description: "Contact info, territories, specialties, photo.",
      audience: "public",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "find-rep",
      contentNodeRef: "sa-rep-profiles",
    },
  ],
};

// ─── Public — Auth flows ─────────────────────────────────────────────

const publicAuth: SiteMapGroup = {
  id: "public-auth",
  label: "Public — Auth",
  description:
    "Login, signup (claim anonymous RFQ), password reset, OAuth/magic-link callbacks. Code-driven; not in main nav.",
  routeGroup: "(frontend)",
  audience: "public",
  color: "slate",
  pages: [
    {
      id: "login",
      route: "/login",
      label: "Login",
      description: "Magic-link or password. Supports `?next=` redirects + `?saveAfter=1` for post-auth Spex Studio save.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      contentNodeRef: "sa-util-login",
    },
    {
      id: "signup",
      route: "/signup",
      label: "Sign up · claim RFQ",
      description: "Closed by default for dealers (rep-invite only). Open path: anon RFQ requesters claiming a `quotes` row by completing signup with the same email.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
    },
    {
      id: "auth-reset",
      route: "/auth/reset",
      label: "Password reset",
      description: "Supabase Auth built-in flow.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
    },
    {
      id: "auth-callback",
      route: "/auth/callback",
      label: "OAuth / magic-link callback",
      description: "Receives Supabase Auth tokens, sets cookies, redirects to `?next=` target.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
    },
  ],
};

// ─── Spex Studio ─────────────────────────────────────────────────────

const spexStudio: SiteMapGroup = {
  id: "spex-studio",
  label: "Spex Studio",
  description:
    "Customer-facing 3D configurator. Same domain, same auth, R3F + drei. Anchored in target-state §5.",
  routeGroup: "spex-studio/*",
  audience: "public",
  color: "fuchsia",
  pages: [
    {
      id: "spex-landing",
      route: "/spex-studio",
      label: "Spex Studio · landing",
      description: "Pick a series to start configuring. Hero animation, recently viewed series.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      contentNodeRef: "wf-spec-studio",
    },
    {
      id: "spex-config",
      route: "/spex-studio/:seriesId",
      label: "3D configurator",
      description: "Three-column layout: 3DViewer · ConfigPanel (finish/base/size/edge) · SummaryRail (SKU + save). Texture-swap finish system, no per-finish GLB.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "spex-landing",
    },
    {
      id: "spex-share",
      route: "/spex-studio/:seriesId/share/:token",
      label: "Shared config link",
      description: "Read-only configurator state shared via signed token — recipient can clone into their own session.",
      audience: "public",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "spex-config",
    },
  ],
};

// ─── Dealer Portal ───────────────────────────────────────────────────

const dealerPortal: SiteMapGroup = {
  id: "dealer-portal",
  label: "Dealer Portal",
  description:
    "Auth-gated hub for commercial furniture dealers. Tiered pricing surface, quote history, order tracking. `tier=dealer` required.",
  routeGroup: "(dealer)",
  audience: "dealer",
  color: "blue",
  pages: [
    {
      id: "dealer-home",
      route: "/(dealer)",
      label: "Dealer Dashboard",
      description: "Recent quotes, pending revisions, in-flight orders, dealer-tier callouts.",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      contentNodeRef: "sa-dealer-portal",
    },
    {
      id: "dealer-pricing",
      route: "/(dealer)/pricing",
      label: "Dealer Pricing",
      description: "Tiered pricing surface — reads `organizations.pricing_tier` (50/20/10).",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "dealer-home",
      contentNodeRef: "sa-dp-pricing",
    },
    {
      id: "dealer-quotes",
      route: "/(dealer)/quotes",
      label: "My Quotes",
      description: "History, revisions, reordering.",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "dealer-home",
      contentNodeRef: "sa-dp-quotes",
    },
    {
      id: "dealer-quote-detail",
      route: "/(dealer)/quotes/:id",
      label: "Quote detail",
      description: "Line items, signed PDF link, revision controls, accept-to-order CTA.",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "dealer-quotes",
    },
    {
      id: "dealer-orders",
      route: "/(dealer)/orders",
      label: "My Orders",
      description: "PO tracking from submission to delivery.",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "dealer-home",
      contentNodeRef: "sa-dp-orders",
    },
    {
      id: "dealer-order-detail",
      route: "/(dealer)/orders/:id",
      label: "Order detail",
      description: "Xero invoice link, fulfillment status, shipping milestones.",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "dealer-orders",
    },
    {
      id: "dealer-downloads",
      route: "/(dealer)/downloads",
      label: "Downloads",
      description: "Price lists, spec sheets, CAD — full library, no public gates.",
      audience: "dealer",
      owner: "payload",
      approval: "pending",
      parentId: "dealer-home",
      contentNodeRef: "sa-dp-downloads",
    },
    {
      id: "dealer-account",
      route: "/(dealer)/account",
      label: "Account Settings",
      description: "Contact info, billing address, comms preferences. Routed through `update_my_profile()` RPC.",
      audience: "dealer",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "dealer-home",
      contentNodeRef: "sa-dp-account",
    },
  ],
};

// ─── Rep Portal ──────────────────────────────────────────────────────

const repPortal: SiteMapGroup = {
  id: "rep-portal",
  label: "Rep Portal",
  description:
    "Auth-gated hub for manufacturer's reps. Multi-org territory view (vs dealer single-org). `tier=rep` required. Shares quote-builder + pricing components with dealer portal but the IA is distinct.",
  routeGroup: "(rep)",
  audience: "rep",
  color: "teal",
  pages: [
    {
      id: "rep-home",
      route: "/(rep)",
      label: "Rep Dashboard",
      description: "Pipeline at a glance, dealer activity feed, commission forecast.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      contentNodeRef: "sa-rep-portal",
    },
    {
      id: "rep-territory",
      route: "/(rep)/territory",
      label: "Territory Dashboard",
      description: "Pipeline, dealer activity, forecasts. The thing reps don't have today.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
      contentNodeRef: "sa-rp-territory",
    },
    {
      id: "rep-pricing",
      route: "/(rep)/pricing",
      label: "Pricing & Margins",
      description: "Dealer cost, volume tiers, rep margin visibility.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
      contentNodeRef: "sa-rp-pricing",
    },
    {
      id: "rep-sales-tools",
      route: "/(rep)/sales-tools",
      label: "Sales Tools & Training",
      description: "Presentations, competitive guides, lunch-and-learn decks.",
      audience: "rep",
      owner: "payload",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
      contentNodeRef: "sa-rp-tools",
    },
    {
      id: "rep-pipeline",
      route: "/(rep)/pipeline",
      label: "Quote Pipeline",
      description: "All territory quotes by status. Submit on dealer's behalf.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
      contentNodeRef: "sa-rp-pipeline",
    },
    {
      id: "rep-commissions",
      route: "/(rep)/commissions",
      label: "Commission Tracking",
      description: "Earned, projected, paid — by quarter and by dealer.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
      contentNodeRef: "sa-rp-commissions",
    },
    {
      id: "rep-dealers",
      route: "/(rep)/dealers",
      label: "Dealer Accounts",
      description: "Dealer orgs in this rep's territory.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
    },
    {
      id: "rep-invite",
      route: "/(rep)/invite",
      label: "Invite Dealer",
      description: "Sends a Supabase magic-link, creates the dealer org. Drives the closed-by-default signup model.",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
    },
    {
      id: "rep-account",
      route: "/(rep)/account",
      label: "Account Settings",
      audience: "rep",
      owner: "dynamic",
      approval: "pending",
      isNew: true,
      parentId: "rep-home",
    },
  ],
};

// ─── Admin / Payload ─────────────────────────────────────────────────

const adminPayload: SiteMapGroup = {
  id: "admin-payload",
  label: "Admin / Payload",
  description:
    "Editorial CMS (Payload) + TableX-internal admin (user mgmt, audit, jobs). Gated on `role=editor` (Payload) or `role=admin` (TableX admin). MFA required.",
  routeGroup: "(payload)",
  audience: "admin",
  color: "rose",
  pages: [
    {
      id: "admin-home",
      route: "/admin",
      label: "Admin home",
      description: "Payload landing page (in-process Payload admin).",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-users",
      route: "/admin/users",
      label: "User management",
      description: "Invite reps, promote roles, MFA enforcement. Service-role gated by `admin_update_profile_role()`.",
      audience: "admin",
      owner: "dynamic",
      approval: "pending",
    },
    {
      id: "admin-orgs",
      route: "/admin/orgs",
      label: "Organizations",
      description: "Dealer org records, pricing tier assignment, Xero contact link.",
      audience: "admin",
      owner: "dynamic",
      approval: "pending",
    },
    {
      id: "admin-quotes",
      route: "/admin/quotes",
      label: "All quotes",
      description: "Cross-org view. Re-pricing, override (with audit trail).",
      audience: "admin",
      owner: "dynamic",
      approval: "pending",
    },
    {
      id: "admin-orders",
      route: "/admin/orders",
      label: "All orders",
      audience: "admin",
      owner: "dynamic",
      approval: "pending",
    },
    {
      id: "admin-jobs",
      route: "/admin/jobs",
      label: "Background jobs",
      description: "Payload jobs queue depth, failed jobs, manual retrigger. Backed by `revalidation_queue` + `xero_*_cache`.",
      audience: "admin",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-audit",
      route: "/admin/audit",
      label: "Audit log",
      description: "Mutations to quotes/orders/profiles. Read-only.",
      audience: "admin",
      owner: "dynamic",
      approval: "pending",
    },
    {
      id: "admin-payload-pages",
      route: "/admin/collections/pages",
      label: "Pages collection",
      description: "Editorial blocks for marketing surfaces. Seeded from Site Map via `scripts/sync-content-map.ts`.",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-series",
      route: "/admin/collections/series",
      label: "Series collection",
      description: "Slug, name, archetype, base style, hero image, gallery, spaces[], features[], skuPrefix.",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-spaces",
      route: "/admin/collections/spaces",
      label: "Spaces collection",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-finishes",
      route: "/admin/collections/finishes",
      label: "Finishes collection",
      description: "Code, brand, tier, upcharge%, swatch image.",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-resources",
      route: "/admin/collections/resources",
      label: "Resources collection",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-dealers",
      route: "/admin/collections/dealers",
      label: "DealerLocator collection",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-news",
      route: "/admin/collections/news",
      label: "News + Events",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
    {
      id: "admin-payload-media",
      route: "/admin/collections/media",
      label: "Media library",
      description: "Cloudinary-backed; Payload stores `cloudinaryPublicId` references.",
      audience: "editor",
      owner: "payload",
      approval: "pending",
    },
  ],
};

// ─── Aggregate ───────────────────────────────────────────────────────

export const siteMapGroups: SiteMapGroup[] = [
  publicMarketing,
  publicCatalog,
  publicAction,
  publicAuth,
  spexStudio,
  dealerPortal,
  repPortal,
  adminPayload,
];

// ─── Stats helpers ────────────────────────────────────────────────────

export interface SiteMapStats {
  totalGroups: number;
  totalPages: number;
  newPages: number;
  byAudience: Record<Audience, number>;
  byOwner: Record<Owner, number>;
  approved: number;
  pending: number;
  review: number;
}

export function computeSiteMapStats(
  groups: SiteMapGroup[] = siteMapGroups,
): SiteMapStats {
  const byAudience: Record<Audience, number> = {
    public: 0,
    dealer: 0,
    rep: 0,
    editor: 0,
    admin: 0,
  };
  const byOwner: Record<Owner, number> = { payload: 0, dynamic: 0 };
  let total = 0;
  let newPages = 0;
  let approved = 0;
  let pending = 0;
  let review = 0;

  for (const g of groups) {
    for (const p of g.pages) {
      total++;
      byAudience[p.audience]++;
      byOwner[p.owner]++;
      if (p.isNew) newPages++;
      if (p.approval === "approved") approved++;
      else if (p.approval === "pending") pending++;
      else review++;
    }
  }

  return {
    totalGroups: groups.length,
    totalPages: total,
    newPages,
    byAudience,
    byOwner,
    approved,
    pending,
    review,
  };
}

export function flattenSiteMap(
  groups: SiteMapGroup[] = siteMapGroups,
): Array<SiteMapPage & { groupId: string; groupLabel: string }> {
  return groups.flatMap((g) =>
    g.pages.map((p) => ({ ...p, groupId: g.id, groupLabel: g.label })),
  );
}

export const audienceLabels: Record<Audience, string> = {
  public: "Public",
  dealer: "Dealer",
  rep: "Rep",
  editor: "Editor",
  admin: "Admin",
};

export const audienceColors: Record<Audience, string> = {
  public: "#10b981", // emerald-500
  dealer: "#3b82f6", // blue-500
  rep: "#14b8a6", // teal-500
  editor: "#a855f7", // purple-500
  admin: "#f43f5e", // rose-500
};

export const ownerLabels: Record<Owner, string> = {
  payload: "Payload (CMS)",
  dynamic: "Dynamic (code + DB)",
};

export const approvalLabels: Record<ApprovalStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  review: "Needs review",
};
