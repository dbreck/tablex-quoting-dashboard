// WordPress Quote Form Analysis — Form ID 7 (1,133 entries)
// Source: https://tablex-og.local/get-a-quote/ (Gravity Forms)
// Purpose: Map current WP form to CPQ system, identify gaps and improvements
// Created: Feb 10, 2026

// ── Types ───────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "radio"
  | "select"
  | "checkbox"
  | "date"
  | "file"
  | "textarea";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

export type CpqMappingStatus =
  | "mapped"        // Field exists in CPQ and is functionally equivalent
  | "partial"       // Field exists but needs enhancement
  | "unmapped"      // Field has no CPQ equivalent yet
  | "deprecated"    // Field should not exist in new system
  | "new_in_cpq";   // CPQ has this but WP form does not

export interface FormField {
  id: string;
  section: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  optionCount?: number;
  conditionalOn?: string;
  cpqMapping: CpqMappingStatus;
  cpqTarget?: string;
  notes: string;
}

export interface UxProblem {
  id: string;
  title: string;
  severity: SeverityLevel;
  category: "layout" | "input" | "feedback" | "navigation" | "data-quality" | "accessibility" | "workflow";
  description: string;
  impact: string;
  affectedFields?: string[];
}

export interface DataQualityIssue {
  id: string;
  field: string;
  issue: string;
  severity: SeverityLevel;
  currentBehavior: string;
  desiredBehavior: string;
  cpqSolution: string;
}

export interface CpqGapItem {
  id: string;
  feature: string;
  inWordPress: boolean;
  inCpq: boolean;
  priority: SeverityLevel;
  description: string;
}

export interface Recommendation {
  id: number;
  title: string;
  priority: SeverityLevel;
  effort: "small" | "medium" | "large";
  category: "ux" | "data" | "pricing" | "workflow" | "integration";
  description: string;
  rationale: string;
  dependencies?: string[];
}

export interface QuoteFormAnalysis {
  meta: {
    formId: number;
    totalEntries: number;
    formUrl: string;
    platform: string;
    totalFields: number;
    sections: string[];
    analysisDate: string;
  };
  fields: FormField[];
  uxProblems: UxProblem[];
  dataQualityIssues: DataQualityIssue[];
  cpqGaps: CpqGapItem[];
  recommendations: Recommendation[];
  fieldMappingSummary: {
    mapped: number;
    partial: number;
    unmapped: number;
    deprecated: number;
    newInCpq: number;
  };
}

// ── Meta ─────────────────────────────────────────────────────────────

const meta: QuoteFormAnalysis["meta"] = {
  formId: 7,
  totalEntries: 1133,
  formUrl: "https://tablex-og.local/get-a-quote/",
  platform: "WordPress / Gravity Forms",
  totalFields: 42,
  sections: [
    "Contact Info",
    "Base Information",
    "Base Add-ons",
    "Top Information",
    "Accessories",
    "Additional",
  ],
  analysisDate: "2026-02-10",
};

// ── Form Fields ─────────────────────────────────────────────────────

const fields: FormField[] = [
  // ── Contact Info ──
  {
    id: "f-company",
    section: "Contact Info",
    label: "Company Name",
    type: "text",
    required: true,
    cpqMapping: "mapped",
    cpqTarget: "QuoteCustomer.company",
    notes: "Maps directly to CPQ customer company field. CRM org lookup improves this.",
  },
  {
    id: "f-project",
    section: "Contact Info",
    label: "Project Name",
    type: "text",
    required: true,
    cpqMapping: "mapped",
    cpqTarget: "Quote.projectName",
    notes: "Maps directly to CPQ quote project name.",
  },
  {
    id: "f-contact",
    section: "Contact Info",
    label: "Contact",
    type: "text",
    required: true,
    cpqMapping: "mapped",
    cpqTarget: "QuoteCustomer.name",
    notes: "Maps to CPQ customer name. CPQ improves with first/last split via CRM contacts.",
  },
  {
    id: "f-email",
    section: "Contact Info",
    label: "Contact Email",
    type: "email",
    required: true,
    cpqMapping: "mapped",
    cpqTarget: "QuoteCustomer.email",
    notes: "Direct mapping. CPQ validates format.",
  },
  {
    id: "f-phone",
    section: "Contact Info",
    label: "Contact Phone",
    type: "phone",
    required: false,
    cpqMapping: "mapped",
    cpqTarget: "QuoteCustomer.phone",
    notes: "Direct mapping.",
  },
  {
    id: "f-email2",
    section: "Contact Info",
    label: "Additional Contact Email",
    type: "email",
    required: false,
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Could map to secondary contact in CRM.",
  },
  {
    id: "f-quantity",
    section: "Contact Info",
    label: "Quantity",
    type: "number",
    required: true,
    cpqMapping: "mapped",
    cpqTarget: "LineItem.quantity",
    notes: "Maps to line item quantity. WP form only allows one quantity for entire request; CPQ supports per-line-item quantities.",
  },

  // ── Base Information ──
  {
    id: "f-base-needed",
    section: "Base Information",
    label: "Base needed?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
    cpqMapping: "deprecated",
    notes: "In CPQ, base selection is integral to configuration. Top-only orders handled by selecting 'Top Only' option in configurator.",
  },
  {
    id: "f-base-series",
    section: "Base Information",
    label: "Base Series",
    type: "select",
    required: true,
    options: [
      "Ultra", "Foundation", "Fundamental", "Trig", "Stretch",
      "Elite", "Revel", "App", "Element", "Justice", "Artisan",
      "Primary-Disc", "Primary-Column", "Puddle", "Exclaim",
      "VertiGO", "Surge",
    ],
    optionCount: 17,
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "LineItem.series (via baseCodes in sku-registry)",
    notes: "WP uses product names (Ultra, Foundation, etc.); SKU registry uses coded series (00-99). Need mapping table between WP product names and SKU codes. CPQ gap: the 17 WP base names do not directly correspond to the 32 series codes in sku-registry.ts.",
  },
  {
    id: "f-height",
    section: "Base Information",
    label: "Height",
    type: "radio",
    required: true,
    options: ['Standard 29"'],
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "partial",
    notes: "Only standard height offered as radio. Special heights exist in SKU data (SH.XX pattern) but are not exposed on form.",
  },
  {
    id: "f-adjustable",
    section: "Base Information",
    label: "Adjustable height options",
    type: "checkbox",
    required: false,
    options: [
      "Counter-Balance", "Short-Balance", "Pneumatic", "Electric",
      "Battery Electric", "Ratchet", "Crank", "Manual",
    ],
    optionCount: 8,
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent yet. Critical for height-adjustable table lines. Should map to option suffixes or dedicated configuration step.",
  },
  {
    id: "f-folding",
    section: "Base Information",
    label: "Folding",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.FD",
    notes: "Maps to FD (Folding) option suffix in SKU registry.",
  },
  {
    id: "f-fliptop",
    section: "Base Information",
    label: "Flip-top",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.GFLIP",
    notes: "Maps to GFLIP (Flip Top) option suffix. Not yet in CPQ configurator.",
  },
  {
    id: "f-nesting",
    section: "Base Information",
    label: "Nesting",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.NE",
    notes: "Maps to NE (Nesting) option suffix. Not yet in CPQ configurator.",
  },
  {
    id: "f-footring",
    section: "Base Information",
    label: "Foot ring",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "unmapped",
    notes: "No option suffix or CPQ field. Need to confirm if foot ring is a standard option or custom.",
  },
  {
    id: "f-base-finish",
    section: "Base Information",
    label: "Base Finish",
    type: "select",
    required: true,
    optionCount: 31,
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "unmapped",
    notes: "31 powder coat colors with no structured data in CPQ. DATA REQUEST #3 in gap analysis. Critical for visual configurator.",
  },
  {
    id: "f-chrome",
    section: "Base Information",
    label: "Chrome?",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    conditionalOn: "f-base-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.CH",
    notes: "Maps to CH (Chrome) option suffix. Needs compatibility rules — not all bases support chrome.",
  },

  // ── Base Add-ons ──
  {
    id: "f-wire-mgmt",
    section: "Base Add-ons",
    label: "Leg Wire Management",
    type: "checkbox",
    required: false,
    optionCount: 3,
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.WMCT",
    notes: "Partially maps to WMCT (Cable Tray). 3 types in WP form but only 1 code in SKU registry. Need expanded option set.",
  },
  {
    id: "f-casters",
    section: "Base Add-ons",
    label: "Casters",
    type: "radio",
    required: false,
    options: ['1.5"', '2"', '3"'],
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.LC",
    notes: "LC (Locking Casters) in SKU registry does not differentiate sizes. Need expanded caster options with size variants.",
  },
  {
    id: "f-industrial-casters",
    section: "Base Add-ons",
    label: "Industrial Locking Casters",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.LC",
    notes: "Merges with caster option. Need industrial vs. standard distinction.",
  },

  // ── Top Information ──
  {
    id: "f-top-needed",
    section: "Top Information",
    label: "Top needed?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
    cpqMapping: "deprecated",
    notes: "In CPQ, top selection is integral. Base-only orders handled differently.",
  },
  {
    id: "f-top-size",
    section: "Top Information",
    label: "Top Size",
    type: "text",
    required: true,
    conditionalOn: "f-top-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "LineItem.size",
    notes: "FREE-TEXT field is the #1 data quality issue. Users type '24x48', '24 x 48', '24\"x48\"', '2x4 ft', etc. CPQ must use structured width/depth inputs with validation against size grids.",
  },
  {
    id: "f-top-shape",
    section: "Top Information",
    label: "Top Shape",
    type: "select",
    required: true,
    options: [
      "Square", "Rectangle", "Round", "Boat", "Racetrack",
      "Trapezoid", "Half Round", "D-Shape", "Kidney",
      "Hexagonal", "Semicircle", "Power Top",
    ],
    optionCount: 12,
    conditionalOn: "f-top-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "LineItem.shape (via shapeCodes in sku-registry)",
    notes: "WP offers 12 shapes; SKU registry has 15 shape codes; compatibility matrix has 34 shapes. Need unified shape catalog with base compatibility filtering.",
  },
  {
    id: "f-top-material",
    section: "Top Information",
    label: "Top Selection",
    type: "radio",
    required: true,
    options: [
      "HPL (High Pressure Laminate)",
      "TFL (Thermally Fused Laminate)",
      "Solid Surface",
      "Butcher Block",
      "Markerboard",
      "Whiteboard (Writable)",
    ],
    optionCount: 6,
    conditionalOn: "f-top-needed:Yes",
    cpqMapping: "unmapped",
    notes: "No material type field in CPQ LineItem. Maps to laminate tier system (Good/Better/Best) from gap analysis. DATA REQUEST #1.",
  },
  {
    id: "f-hpl-selection",
    section: "Top Information",
    label: "HPL selection",
    type: "text",
    required: false,
    conditionalOn: "f-top-material:HPL",
    cpqMapping: "unmapped",
    notes: "FREE-TEXT for laminate selection. Major data quality issue. CPQ should have searchable laminate catalog with swatches. DATA REQUEST #1.",
  },
  {
    id: "f-solid-surface",
    section: "Top Information",
    label: "Solid Surface selection",
    type: "text",
    required: false,
    conditionalOn: "f-top-material:Solid Surface",
    cpqMapping: "unmapped",
    notes: "FREE-TEXT. Same issue as HPL. Need structured solid surface catalog.",
  },
  {
    id: "f-markerboard-finish",
    section: "Top Information",
    label: "Markerboard Finish",
    type: "radio",
    required: false,
    conditionalOn: "f-top-material:Markerboard",
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Specialty material option.",
  },
  {
    id: "f-radius-corners",
    section: "Top Information",
    label: "Radius Corners",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    conditionalOn: "f-top-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.RC",
    notes: "Maps to RC (Radius Corner) option suffix.",
  },
  {
    id: "f-edge",
    section: "Top Information",
    label: "Edge Selection",
    type: "radio",
    required: true,
    options: [
      "Self Edge (3mm PVC)", "T-Mold", "Rubber T-Mold",
      "Urethane Band", "Wood Bullnose", "Phenolic",
      "Aluminum T-Mold", "No Edge (Raw)",
    ],
    optionCount: 8,
    conditionalOn: "f-top-needed:Yes",
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.SELF / gap analysis lm-3/lm-4",
    notes: "Only SELF (Self Edge) exists in SKU registry. Other edge types need full catalog with per-LF pricing. DATA REQUEST #2.",
  },

  // ── Accessories ──
  {
    id: "f-modesty-panels",
    section: "Accessories",
    label: "Modesty/Privacy Panels",
    type: "checkbox",
    required: false,
    optionCount: 6,
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.MV",
    notes: "MV (Modesty Panel) in SKU registry. 6 types in WP form but only 1 code. Need expanded panel catalog.",
  },
  {
    id: "f-ganging",
    section: "Accessories",
    label: "Ganging",
    type: "checkbox",
    required: false,
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Ganging hardware for connecting tables. Needs new option category.",
  },
  {
    id: "f-grommet-location",
    section: "Accessories",
    label: "Grommet Location",
    type: "text",
    required: false,
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.GM + grommitPattern",
    notes: "FREE-TEXT for location. SKU registry has GM code and GR.X pattern. CPQ should offer visual grommet placement.",
  },
  {
    id: "f-power-config",
    section: "Accessories",
    label: "Power Configuration",
    type: "text",
    required: false,
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.PM / PRE",
    notes: "FREE-TEXT. Maps to PM (Power Module) and PRE (Pre-wired) suffixes. Need structured power options.",
  },
  {
    id: "f-power-location",
    section: "Accessories",
    label: "Power Unit Location",
    type: "text",
    required: false,
    cpqMapping: "unmapped",
    notes: "FREE-TEXT. No CPQ equivalent. Should be visual placement tool.",
  },
  {
    id: "f-daisy-chain",
    section: "Accessories",
    label: "Daisy Chained Power",
    type: "radio",
    required: false,
    options: ["Yes", "No"],
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Multi-table power daisy-chaining option.",
  },
  {
    id: "f-accessory-addons",
    section: "Accessories",
    label: "Accessory Add-ons",
    type: "checkbox",
    required: false,
    optionCount: 4,
    cpqMapping: "partial",
    cpqTarget: "optionSuffixes.KB (Keyboard Tray) etc.",
    notes: "Partially maps to KB, AG, and other suffixes. Need full accessory catalog.",
  },

  // ── Additional ──
  {
    id: "f-file-upload",
    section: "Additional",
    label: "File Upload",
    type: "file",
    required: false,
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Designers upload floor plans, specs. Consider attachment system for quotes.",
  },
  {
    id: "f-special-request",
    section: "Additional",
    label: "Special request description",
    type: "textarea",
    required: false,
    cpqMapping: "mapped",
    cpqTarget: "Quote.notes / LineItem.notes",
    notes: "Maps to quote or line item notes field.",
  },
  {
    id: "f-order-date",
    section: "Additional",
    label: "Approximate order date",
    type: "date",
    required: true,
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Useful for sales pipeline and production planning. Should add to quote metadata.",
  },
  {
    id: "f-delivery-date",
    section: "Additional",
    label: "Approximate delivery date",
    type: "date",
    required: true,
    cpqMapping: "unmapped",
    notes: "No CPQ equivalent. Critical for lead time validation and production scheduling.",
  },
];

// ── UX Problems ─────────────────────────────────────────────────────

const uxProblems: UxProblem[] = [
  {
    id: "ux-1",
    title: "Single mega-form with no steps",
    severity: "critical",
    category: "navigation",
    description:
      "All 42 fields displayed on a single scrolling page. No progress indicator, no step-by-step guidance. Users must scroll through irrelevant sections (e.g., base add-ons when they only need a top).",
    impact:
      "High abandonment rate. Form fatigue. Users cannot save progress or return to edit specific sections. Gravity Forms reports 1,133 entries but we have no data on abandonment.",
    affectedFields: ["all"],
  },
  {
    id: "ux-2",
    title: "No visual feedback or product imagery",
    severity: "critical",
    category: "feedback",
    description:
      "Zero product images, no shape previews, no finish swatches, no 3D preview. Users selecting from 17 base series, 12 shapes, and 31 finishes with only text labels.",
    impact:
      "Users cannot verify their selections match intent. Increases likelihood of configuration errors and revision requests. Brian noted Sam is 'incredibly slow on quotes' partly due to fear of errors.",
  },
  {
    id: "ux-3",
    title: "No pricing feedback during configuration",
    severity: "critical",
    category: "feedback",
    description:
      "Form collects configuration but provides zero cost indication. User submits a quote request blind, then waits for manual pricing response. No real-time totals, no ballpark estimates.",
    impact:
      "Eliminates ability for reps and dealers to self-serve. Every configuration requires back-and-forth with internal team. This is the core bottleneck that makes Sam slow.",
  },
  {
    id: "ux-4",
    title: "Free-text fields where structured input is needed",
    severity: "critical",
    category: "input",
    description:
      'Top Size, HPL Selection, Solid Surface Selection, Grommet Location, Power Configuration, and Power Unit Location are all free-text. Users type values like "24x48", "Wilsonart D354", or "center of top" with no validation.',
    impact:
      "Data quality nightmare. Staff must interpret and normalize every entry. Delays quoting, introduces errors, prevents any automated pricing.",
    affectedFields: [
      "f-top-size", "f-hpl-selection", "f-solid-surface",
      "f-grommet-location", "f-power-config", "f-power-location",
    ],
  },
  {
    id: "ux-5",
    title: "No compatibility validation",
    severity: "high",
    category: "data-quality",
    description:
      "Users can select any base with any top shape/size, any finish with any base, and any edge with any material. No rules prevent impossible combinations.",
    impact:
      "Invalid configurations submitted regularly. Staff must catch errors during manual review. Compatibility data exists in SKU registry (6,098 valid combinations) but is not enforced on the form.",
  },
  {
    id: "ux-6",
    title: "No saved configurations or quote history",
    severity: "high",
    category: "workflow",
    description:
      "Each form submission is one-off. No ability to save a configuration, duplicate a previous quote, or manage multiple line items in one request.",
    impact:
      "Repeat customers must re-enter everything. Large projects (multiple table types) require multiple form submissions. No draft/revision workflow.",
  },
  {
    id: "ux-7",
    title: "No conditional logic for accessory dependencies",
    severity: "medium",
    category: "navigation",
    description:
      "Accessories section shows all options regardless of base/top selection. Power options shown even for simple fixed tables. Modesty panels shown for round tables where they do not apply.",
    impact:
      "Cognitive overload. Users exposed to irrelevant options. Increases form completion time and error rate.",
    affectedFields: [
      "f-modesty-panels", "f-ganging", "f-power-config",
      "f-daisy-chain", "f-accessory-addons",
    ],
  },
  {
    id: "ux-8",
    title: "No mobile optimization",
    severity: "medium",
    category: "layout",
    description:
      "42-field form with select dropdowns and text inputs is not optimized for mobile. Gravity Forms renders responsively but the form complexity makes mobile completion impractical.",
    impact:
      "Reps in the field (showroom visits, trade shows) cannot easily submit quote requests from phones or tablets.",
  },
  {
    id: "ux-9",
    title: "Binary Yes/No toggles for feature-rich options",
    severity: "medium",
    category: "input",
    description:
      "Folding, Flip-top, Nesting, Foot ring, Chrome, and Radius Corners are all simple Yes/No radios. No explanation of what each option means, no images, no pricing implications.",
    impact:
      "Users select options without understanding impact. No ability to compare options or understand pricing consequences.",
    affectedFields: [
      "f-folding", "f-fliptop", "f-nesting",
      "f-footring", "f-chrome", "f-radius-corners",
    ],
  },
  {
    id: "ux-10",
    title: "No confirmation or summary before submission",
    severity: "medium",
    category: "navigation",
    description:
      "Form submits directly with no review step. Users cannot see a summary of all their selections before committing.",
    impact:
      "Errors discovered only after submission. Increases revision requests and back-and-forth communication.",
  },
];

// ── Data Quality Issues ─────────────────────────────────────────────

const dataQualityIssues: DataQualityIssue[] = [
  {
    id: "dq-1",
    field: "f-top-size",
    issue: "Free-text dimension input with no format enforcement",
    severity: "critical",
    currentBehavior:
      'Users type dimensions in any format: "24x48", "24 x 48", "24\"x48\"", "2\'x4\'", "24W x 48L", "24 by 48 inches"',
    desiredBehavior:
      "Separate width and depth numeric inputs with unit selector (inches). Validated against size grid for selected shape.",
    cpqSolution:
      "Dual numeric inputs (width, depth) with dropdown for standard sizes per shape. Custom size input with auto-round-up pricing logic (CPQ gap tt-3).",
  },
  {
    id: "dq-2",
    field: "f-hpl-selection",
    issue: "Free-text laminate specification",
    severity: "critical",
    currentBehavior:
      'Users type manufacturer codes, color names, or descriptions: "Wilsonart D354-60", "Grey Nebula", "like the one at Marriott lobby"',
    desiredBehavior:
      "Searchable laminate catalog with manufacturer, code, name, color swatch, and tier assignment (Good/Better/Best).",
    cpqSolution:
      "Full laminate catalog integration (DATA REQUEST #1). Visual swatch picker with search. Automatic tier pricing.",
  },
  {
    id: "dq-3",
    field: "f-solid-surface",
    issue: "Free-text solid surface specification",
    severity: "high",
    currentBehavior:
      "Same as HPL - users type arbitrary descriptions.",
    desiredBehavior:
      "Structured solid surface catalog with material options.",
    cpqSolution:
      "Include in laminate catalog as a material tier with its own pricing rules.",
  },
  {
    id: "dq-4",
    field: "f-grommet-location",
    issue: "Free-text location description",
    severity: "medium",
    currentBehavior:
      'Users type "center", "left side", "12 inches from edge", etc.',
    desiredBehavior:
      "Visual top-down diagram showing grommet placement options. Click-to-place interface for custom locations.",
    cpqSolution:
      "Structured grommet placement using GR.X pattern from SKU registry. Pre-defined positions (A, B, C, etc.) with visual diagram.",
  },
  {
    id: "dq-5",
    field: "f-power-config",
    issue: "Free-text power configuration",
    severity: "medium",
    currentBehavior:
      'Users type "2 outlets, 2 USB", "Byrne power unit", "matching existing", etc.',
    desiredBehavior:
      "Structured power unit selector with outlet count, USB count, and data port options.",
    cpqSolution:
      "Power module configurator tied to PM/PRE option suffixes. Catalog of supported power units per base type.",
  },
  {
    id: "dq-6",
    field: "f-base-series",
    issue: "Product names do not match SKU codes",
    severity: "high",
    currentBehavior:
      "WP form uses names like 'Ultra', 'Foundation', 'Trig'. SKU registry uses numeric codes (00-99) with different names ('Essentials', 'Studio', 'Matrix').",
    desiredBehavior:
      "Single authoritative product naming scheme used across WP, CPQ, and SKU system.",
    cpqSolution:
      "Create a base-series mapping table that translates between WP product names, customer-facing names, and internal SKU codes.",
  },
  {
    id: "dq-7",
    field: "f-top-shape",
    issue: "Shape option mismatch across systems",
    severity: "medium",
    currentBehavior:
      "WP form has 12 shapes. SKU registry (shapeCodes) has 15. Compatibility matrix has 34. No consistent catalog.",
    desiredBehavior:
      "Single shape catalog used everywhere, with compatibility filtering per base.",
    cpqSolution:
      "Unified shape registry drawn from compatibility-matrices.ts (34 shapes, the most complete source). Filter shapes by base compatibility.",
  },
];

// ── CPQ vs. WordPress Gap Analysis ──────────────────────────────────

const cpqGaps: CpqGapItem[] = [
  // Things WP has that CPQ does not
  {
    id: "gap-1",
    feature: "Adjustable height options (8 types)",
    inWordPress: true,
    inCpq: false,
    priority: "high",
    description:
      "Counter-Balance, Short-Balance, Pneumatic, Electric, Battery Electric, Ratchet, Crank, Manual. No CPQ representation for height-adjustable mechanism selection.",
  },
  {
    id: "gap-2",
    feature: "Base finish / powder coat selection (31 colors)",
    inWordPress: true,
    inCpq: false,
    priority: "high",
    description:
      "31 finish colors with no structured data in CPQ. DATA REQUEST #3 blocks this.",
  },
  {
    id: "gap-3",
    feature: "Top material type selection (6 types)",
    inWordPress: true,
    inCpq: false,
    priority: "high",
    description:
      "HPL, TFL, Solid Surface, Butcher Block, Markerboard, Whiteboard. CPQ has no material type field. Ties to laminate tier system.",
  },
  {
    id: "gap-4",
    feature: "Edge selection (8 types)",
    inWordPress: true,
    inCpq: false,
    priority: "high",
    description:
      "Self Edge, T-Mold, Rubber T-Mold, Urethane Band, Wood Bullnose, Phenolic, Aluminum T-Mold, No Edge. Only SELF exists in SKU registry.",
  },
  {
    id: "gap-5",
    feature: "Wire management options (3 types)",
    inWordPress: true,
    inCpq: false,
    priority: "medium",
    description:
      "3 leg wire management types. CPQ only has WMCT (Cable Tray) code.",
  },
  {
    id: "gap-6",
    feature: "Caster size variants",
    inWordPress: true,
    inCpq: false,
    priority: "medium",
    description:
      '1.5", 2", 3" caster sizes plus industrial locking option. CPQ only has LC (Locking Casters) code.',
  },
  {
    id: "gap-7",
    feature: "Modesty panel types (6 variants)",
    inWordPress: true,
    inCpq: false,
    priority: "medium",
    description:
      "6 modesty/privacy panel options. CPQ only has MV code.",
  },
  {
    id: "gap-8",
    feature: "Ganging hardware",
    inWordPress: true,
    inCpq: false,
    priority: "low",
    description:
      "Table ganging/connecting hardware options. No CPQ equivalent.",
  },
  {
    id: "gap-9",
    feature: "Daisy-chained power",
    inWordPress: true,
    inCpq: false,
    priority: "low",
    description:
      "Multi-table power daisy-chaining. No CPQ equivalent.",
  },
  {
    id: "gap-10",
    feature: "File upload for specs/drawings",
    inWordPress: true,
    inCpq: false,
    priority: "medium",
    description:
      "Designers upload floor plans, specs, reference images. CPQ has no attachment system.",
  },
  {
    id: "gap-11",
    feature: "Approximate order/delivery dates",
    inWordPress: true,
    inCpq: false,
    priority: "medium",
    description:
      "Timeline expectations for production planning. CPQ has validUntil on quotes but no order/delivery date fields.",
  },
  {
    id: "gap-12",
    feature: "Foot ring option",
    inWordPress: true,
    inCpq: false,
    priority: "low",
    description:
      "Bar/counter height foot ring. No SKU option suffix or CPQ field.",
  },

  // Things CPQ has that WP does not
  {
    id: "gap-13",
    feature: "Discount tier pricing (50/20 through 50/20/20)",
    inWordPress: false,
    inCpq: true,
    priority: "critical",
    description:
      "5-tier discount system with automatic net price calculation. WP form has no pricing at all.",
  },
  {
    id: "gap-14",
    feature: "CRM organization/contact lookup",
    inWordPress: false,
    inCpq: true,
    priority: "high",
    description:
      "CPQ CustomerStep auto-populates from CRM organizations and contacts. WP form requires manual entry every time.",
  },
  {
    id: "gap-15",
    feature: "Freight zone calculation",
    inWordPress: false,
    inCpq: true,
    priority: "high",
    description:
      "CPQ TotalsStep calculates freight by zone (5 zones, bracket pricing). WP form does not address freight.",
  },
  {
    id: "gap-16",
    feature: "Multi-line-item quotes",
    inWordPress: false,
    inCpq: true,
    priority: "high",
    description:
      "CPQ supports multiple products per quote. WP form is one configuration per submission.",
  },
  {
    id: "gap-17",
    feature: "Quote PDF generation",
    inWordPress: false,
    inCpq: true,
    priority: "medium",
    description:
      "CPQ generates professional PDF quotes. WP form generates email notifications only.",
  },
  {
    id: "gap-18",
    feature: "Quote status tracking",
    inWordPress: false,
    inCpq: true,
    priority: "medium",
    description:
      "CPQ tracks draft/sent/accepted/rejected. WP form submissions are one-way.",
  },
  {
    id: "gap-19",
    feature: "Shape-to-base compatibility filtering",
    inWordPress: false,
    inCpq: true,
    priority: "high",
    description:
      "compatibility-matrices.ts contains validated combinations from 6,098 SKUs. WP form allows any combination.",
  },
];

// ── Recommendations ─────────────────────────────────────────────────

const recommendations: Recommendation[] = [
  {
    id: 1,
    title: "Implement multi-step configuration wizard",
    priority: "critical",
    effort: "large",
    category: "ux",
    description:
      "Replace single mega-form with a 9-step guided wizard: (1) Base Series, (2) Top Shape, (3) Top Size, (4) Material/Laminate, (5) Edge, (6) Base Finish, (7) Feet/Casters, (8) Accessories, (9) Review. Each step filters options based on previous selections using compatibility matrices.",
    rationale:
      "Multi-step forms with progress indicators show 86% higher completion rates than single-page mega-forms (Baymard Institute). The 9-step CPQ flow is already defined in cpq-gap-analysis.ts (cf-1 through cf-9). Progressive disclosure reduces cognitive load and prevents invalid combinations.",
    dependencies: ["compatibility-matrices.ts", "cpq-gap-analysis rules engine"],
  },
  {
    id: 2,
    title: "Replace free-text fields with structured inputs",
    priority: "critical",
    effort: "medium",
    category: "data",
    description:
      "Convert Top Size to dual numeric inputs (width x depth) with standard size dropdown. Convert HPL/Solid Surface to searchable catalog picker. Convert Grommet Location to visual diagram. Convert Power Configuration to structured unit selector.",
    rationale:
      "Free-text fields are responsible for the majority of data quality issues. Each one requires manual interpretation by staff, adding 5-15 minutes per quote. Structured inputs enable automated pricing and validation.",
    dependencies: ["DATA REQUEST #1 (laminate catalog)", "DATA REQUEST #2 (edge band)"],
  },
  {
    id: 3,
    title: "Add real-time pricing feedback",
    priority: "critical",
    effort: "large",
    category: "pricing",
    description:
      "Display running price total as users configure. Show list price, discount tier net price, and line item subtotal at each step. Persona-based visibility: Reps see full pricing, Designers see none, End Users see none.",
    rationale:
      "Brian confirmed Sam is slow on quotes due to fear of pricing errors. Real-time feedback eliminates uncertainty. Rep persona needs confidential pricing access. This is the core CPQ value proposition.",
    dependencies: [
      "Dynamic pricing engine (archGap: dynamic-pricing)",
      "Persona system (archGap: persona-system)",
    ],
  },
  {
    id: 4,
    title: "Add visual product imagery and finish swatches",
    priority: "high",
    effort: "medium",
    category: "ux",
    description:
      "Show product images for each base series, shape silhouettes for top shapes, and color swatches for finishes. Optionally render a 2D or 3D preview that updates as configuration changes.",
    rationale:
      "Visual configurators reduce configuration errors by 73% (Gartner CPQ research). Users selecting from 17 bases, 34 shapes, and 31 finishes need visual cues to make confident choices.",
    dependencies: ["Product photography or renders", "DATA REQUEST #3 (color hex values)"],
  },
  {
    id: 5,
    title: "Enforce compatibility rules in real-time",
    priority: "high",
    effort: "medium",
    category: "data",
    description:
      "Use compatibility-matrices.ts to filter available options at each wizard step. When a user selects a base, only show compatible shapes. When they select a shape, only show valid sizes. Prevent impossible combinations before submission.",
    rationale:
      "The WP form allows any combination, leading to invalid configurations that require manual correction. The data to enforce rules already exists (6,098 validated SKU combinations). This is a zero-data-dependency improvement.",
    dependencies: ["compatibility-matrices.ts"],
  },
  {
    id: 6,
    title: "Create base series name mapping table",
    priority: "high",
    effort: "small",
    category: "data",
    description:
      "Build a definitive mapping between WP form names (Ultra, Foundation, Trig, etc.), customer-facing names, internal SKU series codes (00-99), and their baseCodes (T, X, QD, etc.). This unblocks product selector and validation.",
    rationale:
      "Three naming systems exist in parallel with no cross-reference. This is a 30-minute data task that unblocks the entire configurator. Can be populated by cross-referencing WP form options with Brian.",
  },
  {
    id: 7,
    title: "Add order timeline fields to CPQ",
    priority: "medium",
    effort: "small",
    category: "workflow",
    description:
      "Add expectedOrderDate and requestedDeliveryDate fields to the Quote type. Calculate lead time and flag quotes that need expedited production.",
    rationale:
      "WP form requires these dates (f-order-date, f-delivery-date) for a reason - production planning needs them. CPQ should carry this forward.",
  },
  {
    id: 8,
    title: "Add file attachment support for quotes",
    priority: "medium",
    effort: "medium",
    category: "workflow",
    description:
      "Allow file uploads (floor plans, specs, reference images) attached to quotes. Store in Supabase Storage with links on the quote record.",
    rationale:
      "Designers frequently upload specs with quote requests. This is a high-value feature for the Designer persona. WP form already supports this via Gravity Forms file upload.",
  },
  {
    id: 9,
    title: "Build unified shape and option catalogs",
    priority: "medium",
    effort: "medium",
    category: "data",
    description:
      "Consolidate the three shape sources (WP: 12, SKU registry: 15, compatibility matrix: 34) into one authoritative catalog. Do the same for edge types (WP: 8, SKU: 1), modesty panels (WP: 6, SKU: 1), wire management (WP: 3, SKU: 1), and casters (WP: 3+industrial, SKU: 1).",
    rationale:
      "Option fragmentation means no single system has the complete picture. The WP form, despite its UX problems, is actually the most complete catalog of customer-facing options because it was built from years of real dealer interactions.",
  },
  {
    id: 10,
    title: "Implement saved configurations and quote duplication",
    priority: "medium",
    effort: "medium",
    category: "workflow",
    description:
      "Allow users to save configurations as templates, duplicate existing quotes, and manage multiple line items per quote. Include auto-save/draft functionality.",
    rationale:
      "Repeat customers and large projects suffer most from the WP form's one-shot design. Saved configurations reduce time-to-quote for common table setups. CPQ already supports multi-line quotes but needs template/duplication features.",
  },
  {
    id: 11,
    title: "Add height adjustment mechanism configurator",
    priority: "medium",
    effort: "medium",
    category: "ux",
    description:
      "Build a dedicated step or sub-step for height-adjustable tables with the 8 mechanism types (Counter-Balance, Short-Balance, Pneumatic, Electric, Battery Electric, Ratchet, Crank, Manual). Include range specs, weight capacity, and price adders.",
    rationale:
      "Height-adjustable tables are a significant product category with complex pricing. The WP form has 8 options; the CPQ has none. This is a major feature gap.",
    dependencies: ["Height adjustment mechanism data and pricing"],
  },
  {
    id: 12,
    title: "Add review/summary step before quote submission",
    priority: "low",
    effort: "small",
    category: "ux",
    description:
      "Final wizard step shows a complete summary of all selections with the ability to edit any section. Include a visual rendering of the configured table.",
    rationale:
      "Catches configuration errors before submission. Reduces revision requests. Standard CPQ best practice.",
  },
];

// ── Summary Computation ─────────────────────────────────────────────

function computeMappingSummary(
  fieldList: FormField[]
): QuoteFormAnalysis["fieldMappingSummary"] {
  const counts = { mapped: 0, partial: 0, unmapped: 0, deprecated: 0, newInCpq: 0 };
  for (const f of fieldList) {
    counts[f.cpqMapping === "new_in_cpq" ? "newInCpq" : f.cpqMapping]++;
  }
  return counts;
}

const fieldMappingSummary = computeMappingSummary(fields);

// ── Bundled Export ───────────────────────────────────────────────────

export const quoteFormAnalysis: QuoteFormAnalysis = {
  meta,
  fields,
  uxProblems,
  dataQualityIssues,
  cpqGaps,
  recommendations,
  fieldMappingSummary,
};

// Convenience re-exports for dashboard consumption
export {
  fields as wpFormFields,
  uxProblems as wpUxProblems,
  dataQualityIssues as wpDataQualityIssues,
  cpqGaps as wpCpqGaps,
  recommendations as wpRecommendations,
};
