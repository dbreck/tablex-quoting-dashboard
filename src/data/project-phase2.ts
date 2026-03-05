// Phase 2 Project Scope, Timeline & Estimate Data
// Edit this file directly to adjust scope, hours, and pricing

import {
  Globe,
  Users,
  Building2,
  Calculator,
  Link2,
  type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectPhase {
  id: string;
  name: string;
  startWeek: number;
  durationWeeks: number;
  color: string;
}

export interface Deliverable {
  id: string;
  workstream: string;
  name: string;
  description: string;
  requirements: string[];
  phase: string;
  startWeek: number;
  endWeek: number;
  estimatedHours: number;
  hourlyRate: number;
  status: "planned" | "in-progress" | "complete";
}

export interface Milestone {
  id: string;
  name: string;
  week: number;
  phase: string;
  deliverableIds: string[];
}

export interface WorkstreamMeta {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

// ─── Phases ───────────────────────────────────────────────────────────────────

export const PROJECT_PHASES: ProjectPhase[] = [
  { id: "discovery", name: "Discovery", startWeek: 1, durationWeeks: 3, color: "#6366f1" },
  { id: "design", name: "Design", startWeek: 4, durationWeeks: 4, color: "#8b5cf6" },
  { id: "build", name: "Build", startWeek: 8, durationWeeks: 10, color: "#8dc63f" },
  { id: "qa-launch", name: "QA & Launch", startWeek: 18, durationWeeks: 3, color: "#f59e0b" },
];

export const TOTAL_WEEKS = 20;

// ─── Workstreams ──────────────────────────────────────────────────────────────

export const WORKSTREAMS: WorkstreamMeta[] = [
  {
    id: "website",
    name: "Website",
    icon: Globe,
    description: "Complete redesign of tablex.com — modern product showcase, dealer locator, and content management.",
    color: "#3b82f6",
  },
  {
    id: "portal",
    name: "Dealer/Rep Portal",
    icon: Users,
    description: "Single role-based portal for dealers and rep groups. Shared: auth, dashboard, account settings, quote/order views. Dealers: configurator access, quote requests, order history. Reps: dealer roster, territory analytics, commission tracking.",
    color: "#10b981",
  },
  {
    id: "crm",
    name: "CRM",
    icon: Building2,
    description: "Customer relationship management — organizations, contacts, rep/dealer hierarchy, activity tracking, and pipeline.",
    color: "#ef4444",
  },
  {
    id: "cpq",
    name: "Quoting System (CPQ)",
    icon: Calculator,
    description: "Configure-Price-Quote engine — visual configurator, automated pricing, quote generation, and order workflow.",
    color: "#8b5cf6",
  },
  {
    id: "xero",
    name: "Xero Integration",
    icon: Link2,
    description: "Two-way sync with Xero accounting — invoices, payments, contacts, and financial reporting.",
    color: "#06b6d4",
  },
];

// ─── Deliverables ─────────────────────────────────────────────────────────────

export const DELIVERABLES: Deliverable[] = [
  // ── Website ──────────────────────────────────────────────────────────────
  {
    id: "web-1",
    workstream: "website",
    name: "Information Architecture & Sitemap",
    description: "Define page hierarchy, URL structure, navigation, and content taxonomy.",
    requirements: ["Sitemap document", "Navigation wireframes", "URL redirect plan"],
    phase: "discovery",
    startWeek: 1, endWeek: 2, // First — establishes site structure for everything else
    estimatedHours: 16,
    hourlyRate: 150,
    status: "complete",
  },
  {
    id: "web-2a",
    workstream: "website",
    name: "Web Style Guide & Site Design",
    description: "Design system tokens, typography, color palette, high-fidelity page templates, and mobile breakpoints.",
    requirements: ["Design system tokens (colors, type, spacing)", "Figma designs for 8+ page templates", "Mobile-first responsive layouts", "Component library"],
    phase: "design",
    startWeek: 4, endWeek: 6, // Must complete before frontend dev can start
    estimatedHours: 24,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "web-2b",
    workstream: "website",
    name: "Web Feature Design",
    description: "Detailed designs for interactive features — dealer locator, blog, contact forms, search, and filtering.",
    requirements: ["Dealer locator UX + map integration", "Blog/news layout", "Contact & quote request forms", "Search & filtering patterns"],
    phase: "design",
    startWeek: 6, endWeek: 9, // Can overlap with early frontend dev
    estimatedHours: 16,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "web-2c",
    workstream: "website",
    name: "3D Configurator Design",
    description: "UX design for the 3D table configurator — material swatches, viewer controls, mobile experience, and quote flow.",
    requirements: ["Configurator layout & controls", "Material/finish swatch presentation", "Mobile 3D viewer experience", "Configuration-to-quote flow"],
    phase: "design",
    startWeek: 6, endWeek: 9, // Can overlap with early frontend dev
    estimatedHours: 16,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "web-3",
    workstream: "website",
    name: "Frontend Development",
    description: "Build all pages with Next.js — product catalog, dealer locator, about, contact, blog.",
    requirements: ["Product listing & detail pages", "Dealer locator with map", "Blog/news section", "SEO optimization"],
    phase: "build",
    startWeek: 8, endWeek: 13, // Website Beta milestone at wk 13
    estimatedHours: 40,
    hourlyRate: 185,
    status: "planned",
  },
  {
    id: "web-4",
    workstream: "website",
    name: "CMS Integration & Content Migration",
    description: "Headless CMS setup, content modeling, and migration of existing site content.",
    requirements: ["CMS content models", "Media library migration", "Editorial workflow"],
    phase: "build",
    startWeek: 11, endWeek: 13, // Starts after pages are built, joins Website Beta milestone
    estimatedHours: 16,
    hourlyRate: 185,
    status: "planned",
  },
  {
    id: "web-5",
    workstream: "website",
    name: "Website QA & Launch",
    description: "Cross-browser testing, performance optimization, DNS cutover, and launch support.",
    requirements: ["Lighthouse score 90+", "Cross-browser testing", "301 redirect verification", "Launch checklist"],
    phase: "qa-launch",
    startWeek: 18, endWeek: 18, // Independent — can QA early in the phase
    estimatedHours: 8,
    hourlyRate: 150,
    status: "planned",
  },

  // ── Dealer/Rep Portal ──────────────────────────────────────────────────
  // Single codebase, role-based access:
  //   Shared (~80%): Auth, dashboard shell, account settings, quote/order views, notifications
  //   Dealer role: Product configurator, quote request submission, own order/invoice history
  //   Rep role: Dealer roster management, territory analytics, commission tracking, cross-dealer activity feed
  {
    id: "portal-1",
    workstream: "portal",
    name: "Requirements & Workflow Mapping",
    description: "Document dealer and rep user journeys, role-based permission model, and feature priorities.",
    requirements: ["Dealer + rep persona profiles", "Feature priority matrix", "Role-based permission model", "Commission structure documentation", "Territory mapping"],
    phase: "discovery",
    startWeek: 2, endWeek: 3, // After IA establishes site structure
    estimatedHours: 12,
    hourlyRate: 150,
    status: "complete",
  },
  {
    id: "portal-2",
    workstream: "portal",
    name: "Portal UI Design",
    description: "Design shared portal shell, dealer-specific views, and rep-specific management screens.",
    requirements: ["Shared dashboard + account wireframes", "Dealer: quote request flow, order tracking", "Rep: dealer roster, territory analytics, commissions"],
    phase: "design",
    startWeek: 5, endWeek: 7, // After website design system is established
    estimatedHours: 10,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "portal-3",
    workstream: "portal",
    name: "Portal Development",
    description: "Build single authenticated portal with role-based routing — shared shell, dealer features, and rep management layers.",
    requirements: ["Auth + role-based routing", "Shared: dashboard, account management, notifications", "Dealer: configurator embed, quote requests, order/invoice history", "Rep: dealer roster, territory analytics, commission calculations, activity feed"],
    phase: "build",
    startWeek: 12, endWeek: 16, // Needs CRM + CPQ foundation — Portal Beta at wk 16
    estimatedHours: 30,
    hourlyRate: 185,
    status: "planned",
  },
  {
    id: "portal-4",
    workstream: "portal",
    name: "Portal QA",
    description: "End-to-end testing of both roles — permission boundaries, data scoping, and workflow integrity.",
    requirements: ["Dealer workflow E2E tests", "Rep workflow E2E tests", "Permission boundary testing", "Role-scoped data validation"],
    phase: "qa-launch",
    startWeek: 19, endWeek: 20, // Needs CRM + CPQ stable first
    estimatedHours: 8,
    hourlyRate: 150,
    status: "planned",
  },

  // ── CRM ────────────────────────────────────────────────────────────────
  {
    id: "crm-1",
    workstream: "crm",
    name: "CRM Data Model & Migration Plan",
    description: "Finalize org/contact schema, rep-dealer hierarchy, and data migration from existing sources.",
    requirements: ["Schema documentation", "Migration scripts", "Data cleaning plan", "Hierarchy rules"],
    phase: "discovery",
    startWeek: 1, endWeek: 3, // Runs full discovery — foundational data model
    estimatedHours: 16,
    hourlyRate: 150,
    status: "complete",
  },
  {
    id: "crm-2",
    workstream: "crm",
    name: "CRM UI Design",
    description: "Design organization profiles, contact management, activity timeline, and pipeline views.",
    requirements: ["Org detail page", "Contact management", "Activity timeline", "Pipeline/funnel views"],
    phase: "design",
    startWeek: 5, endWeek: 7, // After design system from website
    estimatedHours: 16,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "crm-3",
    workstream: "crm",
    name: "CRM Development",
    description: "Build full CRM — org management, contact database, activity tracking, notes, and search.",
    requirements: ["Organization CRUD", "Contact management", "Activity/note logging", "Search & filtering", "Rep-dealer hierarchy management"],
    phase: "build",
    startWeek: 8, endWeek: 14, // Foundation — portal + CPQ depend on this
    estimatedHours: 32,
    hourlyRate: 185,
    status: "planned",
  },
  {
    id: "crm-4",
    workstream: "crm",
    name: "CRM QA & Data Verification",
    description: "Validate data integrity, search accuracy, and hierarchy management workflows.",
    requirements: ["Data integrity checks", "Search accuracy testing", "Hierarchy validation"],
    phase: "qa-launch",
    startWeek: 18, endWeek: 19, // Early QA — other workstreams depend on CRM stability
    estimatedHours: 5,
    hourlyRate: 150,
    status: "planned",
  },

  // ── CPQ ────────────────────────────────────────────────────────────────
  {
    id: "cpq-1",
    workstream: "cpq",
    name: "CPQ Requirements & Pricing Rules",
    description: "Document pricing tiers, discount rules, approval workflows, and quote templates.",
    requirements: ["Pricing tier matrix", "Discount rules engine spec", "Approval workflow", "Quote template design"],
    phase: "discovery",
    startWeek: 1, endWeek: 3, // Runs full discovery in parallel with CRM
    estimatedHours: 20,
    hourlyRate: 150,
    status: "complete",
  },
  {
    id: "cpq-2",
    workstream: "cpq",
    name: "CPQ UI Design",
    description: "Design quote builder, line item editor, pricing calculator, and PDF output.",
    requirements: ["Quote builder flow", "Line item configuration", "Price breakdown views", "PDF template design"],
    phase: "design",
    startWeek: 5, endWeek: 7, // Parallel with CRM + portal design
    estimatedHours: 16,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "cpq-3",
    workstream: "cpq",
    name: "CPQ Engine Development",
    description: "Build pricing engine, discount calculations, multi-line quotes, and quote-to-order workflow.",
    requirements: ["Pricing engine with tier support", "Multi-line quote builder", "Discount calculations (50/20/x)", "Quote → Order → Invoice flow", "PDF generation"],
    phase: "build",
    startWeek: 9, endWeek: 15, // Needs CRM orgs for pricing tiers — CPQ Engine Ready at wk 15
    estimatedHours: 80,
    hourlyRate: 185,
    status: "planned",
  },
  {
    id: "cpq-4",
    workstream: "cpq",
    name: "CPQ QA & Pricing Validation",
    description: "Validate pricing accuracy, discount calculations, and end-to-end quote workflow.",
    requirements: ["Pricing accuracy tests", "Discount tier validation", "End-to-end workflow test", "PDF output verification"],
    phase: "qa-launch",
    startWeek: 18, endWeek: 19, // Parallel with CRM QA
    estimatedHours: 7,
    hourlyRate: 150,
    status: "planned",
  },

  // ── Xero Integration ──────────────────────────────────────────────────
  {
    id: "xero-1",
    workstream: "xero",
    name: "Xero API Scoping & Auth Setup",
    description: "Evaluate Xero API capabilities, set up OAuth2 connection, and map data entities.",
    requirements: ["API capability assessment", "OAuth2 implementation", "Entity mapping document"],
    phase: "discovery",
    startWeek: 2, endWeek: 3, // Needs CPQ context for invoice/payment entities
    estimatedHours: 6,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "xero-2",
    workstream: "xero",
    name: "Xero Sync Architecture",
    description: "Design sync strategy — conflict resolution, retry logic, and data transformation layer.",
    requirements: ["Sync architecture doc", "Conflict resolution rules", "Error handling strategy"],
    phase: "design",
    startWeek: 6, endWeek: 7, // Needs CPQ design to know what syncs
    estimatedHours: 8,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "xero-3",
    workstream: "xero",
    name: "Xero Integration Development",
    description: "Build two-way sync — invoices, payments, contacts, and chart of accounts.",
    requirements: ["Invoice sync (QuoteX → Xero)", "Payment sync (Xero → QuoteX)", "Contact sync", "Webhook listeners", "Sync status dashboard"],
    phase: "build",
    startWeek: 14, endWeek: 17, // Needs CPQ invoices/orders to sync — Integration Complete at wk 17
    estimatedHours: 28,
    hourlyRate: 185,
    status: "planned",
  },
  {
    id: "xero-4",
    workstream: "xero",
    name: "Xero Integration QA",
    description: "Test sync accuracy, error recovery, and edge cases with Xero sandbox.",
    requirements: ["Sandbox testing", "Sync accuracy validation", "Error recovery testing", "Rate limit handling"],
    phase: "qa-launch",
    startWeek: 19, endWeek: 20, // Last to QA — needs everything else flowing
    estimatedHours: 5,
    hourlyRate: 150,
    status: "planned",
  },
];

// ─── Milestones ───────────────────────────────────────────────────────────────

export const MILESTONES: Milestone[] = [
  {
    id: "m-1",
    name: "Discovery Complete",
    week: 3,
    phase: "discovery",
    deliverableIds: ["web-1", "portal-1", "crm-1", "cpq-1", "xero-1"],
  },
  {
    id: "m-2",
    name: "Design Review",
    week: 6,
    phase: "design",
    deliverableIds: ["web-2a", "portal-2", "crm-2", "cpq-2"],
  },
  {
    id: "m-3",
    name: "Design Sign-off",
    week: 7,
    phase: "design",
    deliverableIds: ["web-2b", "web-2c", "xero-2"],
  },
  {
    id: "m-4",
    name: "Website Beta",
    week: 13,
    phase: "build",
    deliverableIds: ["web-3", "web-4"],
  },
  {
    id: "m-5",
    name: "CPQ Engine Ready",
    week: 15,
    phase: "build",
    deliverableIds: ["cpq-3"],
  },
  {
    id: "m-6",
    name: "Portal Beta",
    week: 16,
    phase: "build",
    deliverableIds: ["portal-3"],
  },
  {
    id: "m-7",
    name: "Integration Complete",
    week: 17,
    phase: "build",
    deliverableIds: ["crm-3", "xero-3"],
  },
  {
    id: "m-8",
    name: "Launch",
    week: 20,
    phase: "qa-launch",
    deliverableIds: ["web-5", "portal-4", "crm-4", "cpq-4", "xero-4"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDeliverablesByWorkstream(workstreamId: string): Deliverable[] {
  return DELIVERABLES.filter((d) => d.workstream === workstreamId);
}

export function getDeliverablesByPhase(phaseId: string): Deliverable[] {
  return DELIVERABLES.filter((d) => d.phase === phaseId);
}

// Complete deliverables are already paid for — $0 / 0 hrs remaining
function billableHours(d: Deliverable): number {
  return d.status === "complete" ? 0 : d.estimatedHours;
}
function billableCost(d: Deliverable): number {
  return d.status === "complete" ? 0 : d.estimatedHours * d.hourlyRate;
}

export function getWorkstreamHours(workstreamId: string): number {
  return getDeliverablesByWorkstream(workstreamId).reduce((sum, d) => sum + billableHours(d), 0);
}

export function getWorkstreamCost(workstreamId: string): number {
  return getDeliverablesByWorkstream(workstreamId).reduce((sum, d) => sum + billableCost(d), 0);
}

export function getPhaseHours(phaseId: string): number {
  return getDeliverablesByPhase(phaseId).reduce((sum, d) => sum + billableHours(d), 0);
}

export function getPhaseCost(phaseId: string): number {
  return getDeliverablesByPhase(phaseId).reduce((sum, d) => sum + billableCost(d), 0);
}

export function getWorkstreamPhaseHours(workstreamId: string, phaseId: string): number {
  return DELIVERABLES
    .filter((d) => d.workstream === workstreamId && d.phase === phaseId)
    .reduce((sum, d) => sum + billableHours(d), 0);
}

export function getWorkstreamPhaseCost(workstreamId: string, phaseId: string): number {
  return DELIVERABLES
    .filter((d) => d.workstream === workstreamId && d.phase === phaseId)
    .reduce((sum, d) => sum + billableCost(d), 0);
}

export const TOTAL_HOURS = DELIVERABLES.reduce((sum, d) => sum + billableHours(d), 0);
export const TOTAL_COST = DELIVERABLES.reduce((sum, d) => sum + billableCost(d), 0);
export const AVG_HOURLY_RATE = TOTAL_COST / TOTAL_HOURS;
