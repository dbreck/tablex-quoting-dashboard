// Phase 2 Project Scope, Timeline & Estimate Data
// Edit this file directly to adjust scope, hours, and pricing

import {
  Globe,
  ShoppingBag,
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
    id: "dealer-portal",
    name: "Dealer Portal",
    icon: ShoppingBag,
    description: "Self-service portal for dealers to configure products, request quotes, track orders, and manage their account.",
    color: "#10b981",
  },
  {
    id: "rep-portal",
    name: "Rep Portal",
    icon: Users,
    description: "Rep group management portal with dealer oversight, territory analytics, and commission tracking.",
    color: "#f59e0b",
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
  // Website
  {
    id: "web-1",
    workstream: "website",
    name: "Information Architecture & Sitemap",
    description: "Define page hierarchy, URL structure, navigation, and content taxonomy.",
    requirements: ["Sitemap document", "Navigation wireframes", "URL redirect plan"],
    phase: "discovery",
    estimatedHours: 16,
    hourlyRate: 150,
    status: "complete",
  },
  {
    id: "web-2",
    workstream: "website",
    name: "UI/UX Design & Prototyping",
    description: "High-fidelity designs for all page templates, mobile breakpoints, and interactive elements.",
    requirements: ["Figma designs for 8+ templates", "Mobile-first responsive layouts", "Design system tokens"],
    phase: "design",
    estimatedHours: 48,
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
    estimatedHours: 80,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "web-4",
    workstream: "website",
    name: "CMS Integration & Content Migration",
    description: "Headless CMS setup, content modeling, and migration of existing site content.",
    requirements: ["CMS content models", "Media library migration", "Editorial workflow"],
    phase: "build",
    estimatedHours: 24,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "web-5",
    workstream: "website",
    name: "Website QA & Launch",
    description: "Cross-browser testing, performance optimization, DNS cutover, and launch support.",
    requirements: ["Lighthouse score 90+", "Cross-browser testing", "301 redirect verification", "Launch checklist"],
    phase: "qa-launch",
    estimatedHours: 16,
    hourlyRate: 150,
    status: "planned",
  },

  // Dealer Portal
  {
    id: "dp-1",
    workstream: "dealer-portal",
    name: "Dealer Requirements & Workflow Mapping",
    description: "Document dealer user journeys, permission model, and feature priorities.",
    requirements: ["Dealer persona profiles", "Feature priority matrix", "Permission model"],
    phase: "discovery",
    estimatedHours: 12,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "dp-2",
    workstream: "dealer-portal",
    name: "Dealer Portal UI Design",
    description: "Design dealer dashboard, quote request flow, order tracking, and account management.",
    requirements: ["Dashboard wireframes", "Quote request flow", "Order tracking views", "Account settings"],
    phase: "design",
    estimatedHours: 32,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "dp-3",
    workstream: "dealer-portal",
    name: "Dealer Portal Development",
    description: "Build authenticated dealer portal with product configuration, quote requests, and order history.",
    requirements: ["Auth + role-based access", "Product configurator embed", "Quote request submission", "Order/invoice history", "Account management"],
    phase: "build",
    estimatedHours: 72,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "dp-4",
    workstream: "dealer-portal",
    name: "Dealer Portal QA",
    description: "End-to-end testing of dealer workflows, permission boundaries, and data integrity.",
    requirements: ["E2E test suite", "Permission boundary testing", "Data validation"],
    phase: "qa-launch",
    estimatedHours: 12,
    hourlyRate: 150,
    status: "planned",
  },

  // Rep Portal
  {
    id: "rp-1",
    workstream: "rep-portal",
    name: "Rep Group Requirements",
    description: "Map rep group workflows — dealer management, territory oversight, commission reporting.",
    requirements: ["Rep workflow diagrams", "Commission structure documentation", "Territory mapping"],
    phase: "discovery",
    estimatedHours: 10,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "rp-2",
    workstream: "rep-portal",
    name: "Rep Portal UI Design",
    description: "Design rep dashboard with dealer list, territory analytics, and commission views.",
    requirements: ["Dashboard layout", "Dealer management views", "Commission reporting", "Territory analytics"],
    phase: "design",
    estimatedHours: 24,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "rp-3",
    workstream: "rep-portal",
    name: "Rep Portal Development",
    description: "Build rep portal with dealer oversight, territory analytics, and commission tracking.",
    requirements: ["Dealer list + hierarchy management", "Territory analytics dashboard", "Commission calculations", "Activity feed"],
    phase: "build",
    estimatedHours: 56,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "rp-4",
    workstream: "rep-portal",
    name: "Rep Portal QA",
    description: "Test rep-specific workflows, data scoping, and permission boundaries.",
    requirements: ["Role-scoped data verification", "Workflow testing", "Cross-portal integration"],
    phase: "qa-launch",
    estimatedHours: 10,
    hourlyRate: 150,
    status: "planned",
  },

  // CRM
  {
    id: "crm-1",
    workstream: "crm",
    name: "CRM Data Model & Migration Plan",
    description: "Finalize org/contact schema, rep-dealer hierarchy, and data migration from existing sources.",
    requirements: ["Schema documentation", "Migration scripts", "Data cleaning plan", "Hierarchy rules"],
    phase: "discovery",
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
    estimatedHours: 28,
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
    estimatedHours: 64,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "crm-4",
    workstream: "crm",
    name: "CRM QA & Data Verification",
    description: "Validate data integrity, search accuracy, and hierarchy management workflows.",
    requirements: ["Data integrity checks", "Search accuracy testing", "Hierarchy validation"],
    phase: "qa-launch",
    estimatedHours: 10,
    hourlyRate: 150,
    status: "planned",
  },

  // CPQ
  {
    id: "cpq-1",
    workstream: "cpq",
    name: "CPQ Requirements & Pricing Rules",
    description: "Document pricing tiers, discount rules, approval workflows, and quote templates.",
    requirements: ["Pricing tier matrix", "Discount rules engine spec", "Approval workflow", "Quote template design"],
    phase: "discovery",
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
    estimatedHours: 32,
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
    estimatedHours: 96,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "cpq-4",
    workstream: "cpq",
    name: "CPQ QA & Pricing Validation",
    description: "Validate pricing accuracy, discount calculations, and end-to-end quote workflow.",
    requirements: ["Pricing accuracy tests", "Discount tier validation", "End-to-end workflow test", "PDF output verification"],
    phase: "qa-launch",
    estimatedHours: 14,
    hourlyRate: 150,
    status: "planned",
  },

  // Xero Integration
  {
    id: "xero-1",
    workstream: "xero",
    name: "Xero API Scoping & Auth Setup",
    description: "Evaluate Xero API capabilities, set up OAuth2 connection, and map data entities.",
    requirements: ["API capability assessment", "OAuth2 implementation", "Entity mapping document"],
    phase: "discovery",
    estimatedHours: 12,
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
    estimatedHours: 16,
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
    estimatedHours: 56,
    hourlyRate: 150,
    status: "planned",
  },
  {
    id: "xero-4",
    workstream: "xero",
    name: "Xero Integration QA",
    description: "Test sync accuracy, error recovery, and edge cases with Xero sandbox.",
    requirements: ["Sandbox testing", "Sync accuracy validation", "Error recovery testing", "Rate limit handling"],
    phase: "qa-launch",
    estimatedHours: 10,
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
    deliverableIds: ["web-1", "dp-1", "rp-1", "crm-1", "cpq-1", "xero-1"],
  },
  {
    id: "m-2",
    name: "Design Review",
    week: 6,
    phase: "design",
    deliverableIds: ["web-2", "dp-2", "rp-2", "crm-2", "cpq-2"],
  },
  {
    id: "m-3",
    name: "Design Sign-off",
    week: 7,
    phase: "design",
    deliverableIds: ["xero-2"],
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
    deliverableIds: ["dp-3", "rp-3"],
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
    deliverableIds: ["web-5", "dp-4", "rp-4", "crm-4", "cpq-4", "xero-4"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDeliverablesByWorkstream(workstreamId: string): Deliverable[] {
  return DELIVERABLES.filter((d) => d.workstream === workstreamId);
}

export function getDeliverablesByPhase(phaseId: string): Deliverable[] {
  return DELIVERABLES.filter((d) => d.phase === phaseId);
}

export function getWorkstreamHours(workstreamId: string): number {
  return getDeliverablesByWorkstream(workstreamId).reduce((sum, d) => sum + d.estimatedHours, 0);
}

export function getWorkstreamCost(workstreamId: string): number {
  return getDeliverablesByWorkstream(workstreamId).reduce((sum, d) => sum + d.estimatedHours * d.hourlyRate, 0);
}

export function getPhaseHours(phaseId: string): number {
  return getDeliverablesByPhase(phaseId).reduce((sum, d) => sum + d.estimatedHours, 0);
}

export function getPhaseCost(phaseId: string): number {
  return getDeliverablesByPhase(phaseId).reduce((sum, d) => sum + d.estimatedHours * d.hourlyRate, 0);
}

export function getWorkstreamPhaseHours(workstreamId: string, phaseId: string): number {
  return DELIVERABLES
    .filter((d) => d.workstream === workstreamId && d.phase === phaseId)
    .reduce((sum, d) => sum + d.estimatedHours, 0);
}

export function getWorkstreamPhaseCost(workstreamId: string, phaseId: string): number {
  return DELIVERABLES
    .filter((d) => d.workstream === workstreamId && d.phase === phaseId)
    .reduce((sum, d) => sum + d.estimatedHours * d.hourlyRate, 0);
}

export const TOTAL_HOURS = DELIVERABLES.reduce((sum, d) => sum + d.estimatedHours, 0);
export const TOTAL_COST = DELIVERABLES.reduce((sum, d) => sum + d.estimatedHours * d.hourlyRate, 0);
export const AVG_HOURLY_RATE = TOTAL_COST / TOTAL_HOURS;
