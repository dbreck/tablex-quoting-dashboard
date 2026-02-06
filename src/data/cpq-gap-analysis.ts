// CPQ Gap Analysis — structured data from memory/cpq-gap-analysis.md

export type RuleStatus = "done" | "partial" | "missing";
export type Priority = "high" | "medium" | "low";

export interface CpqRule {
  id: string;
  title: string;
  status: RuleStatus;
  notes: string;
}

export interface RuleCategory {
  id: string;
  name: string;
  icon: string; // lucide icon name
  rules: CpqRule[];
}

export interface DataGap {
  id: number;
  title: string;
  priority: Priority;
  status: string;
  canBuild: string;
  blocked: string;
}

export interface ArchGap {
  id: string;
  component: string;
  currentState: string;
  needed: string;
  options: string[];
}

export interface BuildableItem {
  id: number;
  title: string;
  description: string;
  deps: string[];
}

export interface Decision {
  id: number;
  question: string;
  options: string[];
  impact: string[];
}

export interface Persona {
  role: string;
  goal: string;
  pricing: string;
  quote: string;
  icon: string; // lucide icon name
}

// -------------------------------------------------------------------
// Summary counts
// -------------------------------------------------------------------
export const summary = {
  totalRules: 39,
  done: 1,
  partial: 9,
  missing: 29,
  dataRequests: 7,
  archGaps: 6,
  decisions: 10,
};

// -------------------------------------------------------------------
// Architecture decision record
// -------------------------------------------------------------------
export const architectureDecision = {
  brianQuote:
    "I do think it could be hard to set this up as a sku driven CPQ. This is because every part is its own sku and 36x36 top could be put on 10 different bases. If we run it by sku our sku's are going to grow exponentially.",
  keep: [
    "Discount tiers (50/20 through 50/20/20 — 5 tiers)",
    "Freight zone logic (5 zones by state)",
    "CRM / Organizations",
    "Quote storage + Supabase backend",
    "Auth + role system (admin/contributor)",
    "Analytics dashboard (all 8 pages)",
    "SKU decoder (legacy reference)",
  ],
  change: [
    "ProductSelector → full configurator (shape → size → base → laminate → edge → paint → feet)",
    "Pricing → dynamic calculation from rules, not static lookup",
    "Line items → must store full configuration detail, not just SKU + quantity",
    "5-step linear wizard → 9-step rules-driven flow",
  ],
};

// -------------------------------------------------------------------
// Personas
// -------------------------------------------------------------------
export const personas: Persona[] = [
  {
    role: "Designer",
    goal: "Deep configuration to exact specs",
    pricing: "NONE — designers configure, don't price",
    quote:
      "Designers — Need to be able to dig in and configure tables to their specs.",
    icon: "Palette",
  },
  {
    role: "Rep",
    goal: "Fast, confident quoting",
    pricing: "FULL but CONFIDENTIAL (not visible to end users)",
    quote:
      "Reps — Need to be able to quickly and confidentially quote a project.",
    icon: "Briefcase",
  },
  {
    role: "End User",
    goal: "Configure only — explore product options",
    pricing: "NONE",
    quote:
      "End User are probably the last one we need to worry showing pricing too. If they can configure that is good enough.",
    icon: "User",
  },
];

// -------------------------------------------------------------------
// Staff insight
// -------------------------------------------------------------------
export const staffInsight = {
  quote:
    "I learned yesterday that Sam is incredibly slow on quotes... My guess is the quoting procedure has so many steps in it that people (Sam, Sales Reps, Dealers, etc) are afraid of making a pricing error.",
  implication:
    "The CPQ must eliminate fear of pricing errors through automated validation and rules enforcement. This is the core value prop — not just speed, but confidence.",
};

// -------------------------------------------------------------------
// Rule categories
// -------------------------------------------------------------------
export const ruleCategories: RuleCategory[] = [
  {
    id: "table-tops",
    name: "Table Tops",
    icon: "SquareStack",
    rules: [
      {
        id: "tt-1",
        title: "Shapes (Round, Square, Rectangle, specialty)",
        status: "partial",
        notes: "Shape codes in SKU data; no configurator UI",
      },
      {
        id: "tt-2",
        title: "Min/max dimensions per shape",
        status: "partial",
        notes:
          "Standard size grids extracted (173 rect, 26 round, 15 square, 24 racetrack, 17 ellipse)",
      },
      {
        id: "tt-3",
        title: "Custom sizing (price at next standard size up)",
        status: "missing",
        notes:
          "Rule documented but rounding logic unconfirmed (area vs. next length?)",
      },
      {
        id: "tt-4",
        title: "Top-to-base compatibility",
        status: "partial",
        notes:
          "6,131 SKUs give us the matrix; not yet exposed as validation rules",
      },
      {
        id: "tt-5",
        title: "Anti-sag bar auto-add",
        status: "partial",
        notes:
          "ASB option codes exist in SKU data; threshold logic and auto-add not implemented",
      },
    ],
  },
  {
    id: "laminates",
    name: "Laminates",
    icon: "Layers",
    rules: [
      {
        id: "lm-1",
        title: "Laminate catalog",
        status: "missing",
        notes: "DATA REQUEST #1 — need full catalog with names, codes, manufacturers",
      },
      {
        id: "lm-2",
        title: "Good/Better/Best tiers",
        status: "missing",
        notes: "DATA REQUEST #1 — need tier assignments and flat tier pricing",
      },
      {
        id: "lm-3",
        title: "Edge band availability (4 statuses)",
        status: "missing",
        notes:
          "DATA REQUEST #2 — in stock / partial roll / full roll / not available",
      },
      {
        id: "lm-4",
        title: "Edge band pricing (per LF)",
        status: "missing",
        notes: "DATA REQUEST #2 — need LF cost, roll size, spoilage %",
      },
      {
        id: "lm-5",
        title: "Spoilage calculation",
        status: "missing",
        notes:
          "Formula known (LF needed x cost x spoilage%), but no data inputs yet",
      },
      {
        id: "lm-6",
        title: "Full roll logic",
        status: "missing",
        notes:
          "When full roll required, price = full roll cost regardless of usage",
      },
    ],
  },
  {
    id: "bases",
    name: "Bases",
    icon: "Cylinder",
    rules: [
      {
        id: "bs-1",
        title: "Base types + codes",
        status: "done",
        notes: "T22, D20, QD20, X32, etc. — all in SKU data",
      },
      {
        id: "bs-2",
        title: "Base-to-top shape validation",
        status: "partial",
        notes:
          "Compatibility inferable from SKU combinations; not codified as rules",
      },
      {
        id: "bs-3",
        title: "Base-to-top size validation",
        status: "partial",
        notes: "Same — inferable but not enforced",
      },
      {
        id: "bs-4",
        title: "Base physical attributes (weight, footprint, capacity)",
        status: "missing",
        notes: "DATA REQUEST #6 — nice-to-have for validation",
      },
    ],
  },
  {
    id: "powder-coating",
    name: "Powder Coating",
    icon: "Paintbrush",
    rules: [
      {
        id: "pc-1",
        title: "Color palette",
        status: "missing",
        notes: "DATA REQUEST #3 — need full color list with hex values",
      },
      {
        id: "pc-2",
        title: "Per-base color restrictions",
        status: "missing",
        notes:
          "DATA REQUEST #3 — single-color / limited / full palette per base",
      },
      {
        id: "pc-3",
        title: "Adjustable height inner tube (scratch-resistant only)",
        status: "missing",
        notes: "DATA REQUEST #3 — need scratch-resistant flag per color",
      },
      {
        id: "pc-4",
        title: "Independent inner/outer tube color selection",
        status: "missing",
        notes: "UI and logic both needed",
      },
    ],
  },
  {
    id: "feet",
    name: "Feet",
    icon: "Footprints",
    rules: [
      {
        id: "ft-1",
        title: "Foot types (glides, casters)",
        status: "partial",
        notes: "Option codes exist in SKU data",
      },
      {
        id: "ft-2",
        title: "Base compatibility",
        status: "missing",
        notes: "DATA REQUEST #5 — which bases support which foot types",
      },
      {
        id: "ft-3",
        title: "Pricing differences",
        status: "missing",
        notes: "DATA REQUEST #5 — price adders per type",
      },
      {
        id: "ft-4",
        title: "Height impact",
        status: "missing",
        notes: "DATA REQUEST #5",
      },
    ],
  },
  {
    id: "cpq-flow",
    name: "CPQ Flow (9-step)",
    icon: "GitBranch",
    rules: [
      {
        id: "cf-1",
        title: "1. Select Base",
        status: "missing",
        notes: "No configurator UI exists",
      },
      {
        id: "cf-2",
        title: "2. Filter allowed Top Shapes",
        status: "missing",
        notes: "Compatibility data exists; filter logic not built",
      },
      {
        id: "cf-3",
        title: "3. Filter allowed Top Sizes",
        status: "missing",
        notes: "Size grids exist; filter logic not built",
      },
      {
        id: "cf-4",
        title: "4. Validate Anti-Sag Bar",
        status: "missing",
        notes: "Auto-add logic not built; threshold data needed",
      },
      {
        id: "cf-5",
        title: "5. Select Laminate Tier",
        status: "missing",
        notes: "Awaiting laminate catalog data",
      },
      {
        id: "cf-6",
        title: "6. Apply Edge Band Logic",
        status: "missing",
        notes: "Awaiting edge band data",
      },
      {
        id: "cf-7",
        title: "7. Select Paint Color(s)",
        status: "missing",
        notes: "Awaiting color palette data",
      },
      {
        id: "cf-8",
        title: "8. Select Feet",
        status: "missing",
        notes: "Awaiting feet compatibility data",
      },
      {
        id: "cf-9",
        title: "9. Calculate final price",
        status: "missing",
        notes: "Dynamic pricing engine not built",
      },
    ],
  },
];

// -------------------------------------------------------------------
// Data gaps
// -------------------------------------------------------------------
export const dataGaps: DataGap[] = [
  {
    id: 1,
    title: "Laminate catalog + tiers",
    priority: "high",
    status: "REQUESTED",
    canBuild: "Configurator UI shell with placeholder tier selector",
    blocked: "Actual laminate selection, tier pricing logic",
  },
  {
    id: 2,
    title: "Edge band availability",
    priority: "high",
    status: "REQUESTED",
    canBuild: "Edge type selector UI; perimeter calculation",
    blocked:
      "Edge band pricing, availability validation, spoilage calc",
  },
  {
    id: 3,
    title: "Powder coat colors + restrictions",
    priority: "medium",
    status: "REQUESTED",
    canBuild: "Color picker UI shell; base-color restriction architecture",
    blocked:
      "Actual color palette, per-base restrictions, adj. height rules",
  },
  {
    id: 4,
    title: "Anti-sag bar thresholds",
    priority: "medium",
    status: "REQUESTED",
    canBuild: "ASB toggle in UI; auto-add architecture",
    blocked: "Actual threshold values, mandatory enforcement",
  },
  {
    id: 5,
    title: "Feet options + compatibility",
    priority: "low",
    status: "REQUESTED",
    canBuild: "Feet selector UI",
    blocked: "Compatibility validation, pricing",
  },
  {
    id: 6,
    title: "Base physical attributes",
    priority: "low",
    status: "REQUESTED",
    canBuild: "Everything — we have base codes already",
    blocked: "Visual specs display, weight capacity validation",
  },
  {
    id: 7,
    title: "Custom size pricing rule",
    priority: "low",
    status: "REQUESTED",
    canBuild: "Custom size input UI",
    blocked: 'Correct "round up" pricing logic (area vs. next dimension)',
  },
];

// -------------------------------------------------------------------
// Architecture gaps
// -------------------------------------------------------------------
export const archGaps: ArchGap[] = [
  {
    id: "rules-engine",
    component: "Rules Engine",
    currentState: "Does not exist",
    needed:
      "Compatibility validation, auto-add logic, constraint enforcement",
    options: [
      "Client-side JS rules",
      "Supabase edge functions",
      "DB stored rules",
      "Hybrid approach",
    ],
  },
  {
    id: "configurator-ui",
    component: "Configurator UI",
    currentState: "Does not exist",
    needed:
      "9-step guided flow; each step filters based on previous selections",
    options: [
      "Wizard with step validation",
      "Single-page progressive disclosure",
      "Split panel (config + preview)",
    ],
  },
  {
    id: "dynamic-pricing",
    component: "Dynamic Pricing Engine",
    currentState: "Static lookup from product_catalog (6,098 pre-calculated)",
    needed:
      "Calculate price from components (top + base + laminate + edge + paint + feet + ASB)",
    options: [
      "Client-side calculation",
      "Server-side edge function",
      "Hybrid with caching",
    ],
  },
  {
    id: "order-entity",
    component: "Order Entity",
    currentState: "Does not exist",
    needed:
      'Quote → Order conversion with status tracking. Brian: "1 click conversions are a must"',
    options: [
      "Simple (quote → order)",
      "Full (quote → approved → ordered → shipped → complete)",
    ],
  },
  {
    id: "line-items",
    component: "Line Item Schema",
    currentState: "SKU + quantity + price only",
    needed:
      "Full configuration detail per line (shape, size, base, laminate, edge, paint, feet, ASB)",
    options: [
      "JSON config column",
      "Expanded columns",
      "Separate config table",
    ],
  },
  {
    id: "persona-system",
    component: "Persona System",
    currentState: "Admin + contributor roles only",
    needed:
      "Designer + Rep + End User personas with pricing visibility tied to persona",
    options: [
      "Extend existing roles",
      "Separate persona field",
      "Role + persona hybrid",
    ],
  },
];

// -------------------------------------------------------------------
// What we can build now
// -------------------------------------------------------------------
export const buildableNow: BuildableItem[] = [
  {
    id: 1,
    title: "Extract compatibility matrices",
    description:
      "From existing SKU data → shape-to-base, size-to-base validation tables",
    deps: [],
  },
  {
    id: 2,
    title: "Configurator UI shell",
    description:
      "9-step flow with placeholder data, persona switcher",
    deps: [],
  },
  {
    id: 3,
    title: "Rules engine architecture",
    description:
      "Define rule format, validation pipeline, build engine skeleton",
    deps: [],
  },
  {
    id: 4,
    title: "Order entity + migration",
    description:
      "Orders table, order_line_items, status enum, quote→order conversion",
    deps: [],
  },
  {
    id: 5,
    title: "Expand line items schema",
    description:
      "Add configuration detail columns (shape, size, base, laminate_tier, edge, paint, feet, asb)",
    deps: [],
  },
  {
    id: 6,
    title: "Persona system",
    description:
      "Extend user profiles with persona field, conditional UI rendering, pricing visibility toggle",
    deps: [],
  },
  {
    id: 7,
    title: "ASB auto-add mechanism",
    description:
      "Architecture for threshold-based mandatory component injection (threshold values TBD)",
    deps: [],
  },
  {
    id: 8,
    title: "Dynamic pricing skeleton",
    description:
      "Engine that calculates from components instead of SKU lookup (formulas TBD, can test with existing cost data)",
    deps: [],
  },
];

// -------------------------------------------------------------------
// Decisions needed
// -------------------------------------------------------------------
export const decisions: Decision[] = [
  {
    id: 1,
    question: "Where do rules live?",
    options: [
      "Client-side JS",
      "Supabase edge functions",
      "DB stored rules",
      "Hybrid",
    ],
    impact: ["Performance", "Maintainability", "Offline capability"],
  },
  {
    id: 2,
    question: "How do personas map to auth roles?",
    options: ["Extend existing roles", "Separate persona field", "Both"],
    impact: ["DB schema", "RLS policies", "UI rendering"],
  },
  {
    id: 3,
    question: "Configura/Spec integration?",
    options: ["API integration", "Data import", "Link out", "Ignore for now"],
    impact: ["Brian mentioned it", "Talk to Mark about Spec"],
  },
  {
    id: 4,
    question: "Custom size rounding logic?",
    options: [
      "Round by area",
      "Round by next length",
      "Round by next width",
      "Ask Brian",
    ],
    impact: ["Pricing accuracy for custom orders"],
  },
  {
    id: 5,
    question: "Order workflow stages?",
    options: ["Simple (quote→order)", "Full (quote→approved→ordered→shipped→complete)"],
    impact: ["Schema complexity", "UI states"],
  },
  {
    id: 6,
    question: "Line item config storage?",
    options: ["JSON column", "Expanded columns", "Separate table"],
    impact: ["Query flexibility", "Migration complexity"],
  },
  {
    id: 7,
    question: "Who sees pricing?",
    options: ["Persona-based", "Role-based", "Feature flag", "URL param"],
    impact: ["Security model", "UI branching"],
  },
  {
    id: 8,
    question: "What role do existing 6,098 SKUs play?",
    options: [
      "Reference only",
      "Fallback pricing",
      "Validation source",
      "Deprecated",
    ],
    impact: ["Data migration strategy"],
  },
  {
    id: 9,
    question: "Quote PDF format for CPQ?",
    options: [
      "Keep current",
      "Redesign for config detail",
      "Multiple formats per persona",
    ],
    impact: ["PDF generation rework"],
  },
  {
    id: 10,
    question: "Configura data format?",
    options: ["pCon", "CET", "XML", "Need to learn from Mark"],
    impact: ["Integration feasibility"],
  },
];

// -------------------------------------------------------------------
// Bundled export
// -------------------------------------------------------------------
export const cpqGapData = {
  summary,
  architectureDecision,
  personas,
  staffInsight,
  ruleCategories,
  dataGaps,
  archGaps,
  buildableNow,
  decisions,
};
