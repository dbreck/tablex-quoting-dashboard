// Types + helpers for the Risks & Decisions log.
// Canonical shapes mirror the Postgres columns in migration 021.

export type RiskCategory =
  | "integration"
  | "content"
  | "design"
  | "tech"
  | "vendor"
  | "scope"
  | "resourcing";

export type RiskStatus = "open" | "mitigating" | "accepted" | "closed" | "realized";

export type DecisionStatus = "proposed" | "approved" | "implemented" | "reversed";

export type Reversibility = "one_way_door" | "two_way_door";

export interface Risk {
  id: string;
  deliverableId?: string;
  title: string;
  description?: string;
  category: RiskCategory;
  probability: 1 | 2 | 3;
  impact: 1 | 2 | 3;
  severity: number; // DB-generated, 1–9
  status: RiskStatus;
  triggerDate?: string; // ISO date
  mitigationOwner?: string; // team_member.id
  mitigationPlan?: string;
  createdBy?: string; // team_member.id
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  deliverableId?: string;
  taskId?: string;
  title: string;
  context?: string;
  optionsConsidered?: string;
  decision?: string;
  consequences?: string;
  decidedByMemberId?: string; // team_member.id
  decidedByExternal?: string; // freetext (Brian, vendors)
  decidedOn: string; // ISO date, required
  reversibility: Reversibility;
  status: DecisionStatus;
  supersedes?: string;
  supersededBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Enum metadata for UI ────────────────────────────────────────────────────

export const RISK_CATEGORIES: { id: RiskCategory; label: string }[] = [
  { id: "integration", label: "Integration" },
  { id: "content", label: "Content" },
  { id: "design", label: "Design" },
  { id: "tech", label: "Tech" },
  { id: "vendor", label: "Vendor" },
  { id: "scope", label: "Scope" },
  { id: "resourcing", label: "Resourcing" },
];

export const RISK_STATUSES: { id: RiskStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "mitigating", label: "Mitigating" },
  { id: "accepted", label: "Accepted" },
  { id: "closed", label: "Closed" },
  { id: "realized", label: "Realized" },
];

export const DECISION_STATUSES: { id: DecisionStatus; label: string }[] = [
  { id: "proposed", label: "Proposed" },
  { id: "approved", label: "Approved" },
  { id: "implemented", label: "Implemented" },
  { id: "reversed", label: "Reversed" },
];

export const PROBABILITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Low",
  2: "Med",
  3: "High",
};

export const IMPACT_LABELS: Record<1 | 2 | 3, string> = {
  1: "Low",
  2: "Med",
  3: "High",
};

// ─── Derived helpers ─────────────────────────────────────────────────────────

/** Severity bucket for chip coloring. 1–2 low, 3–4 med, 6–9 high. */
export function severityLevel(severity: number): "low" | "med" | "high" {
  if (severity >= 6) return "high";
  if (severity >= 3) return "med";
  return "low";
}

/** True when a risk is past its trigger date and still active. */
export function isRiskPastTrigger(risk: Risk, todayISO: string): boolean {
  if (!risk.triggerDate) return false;
  if (risk.status !== "open" && risk.status !== "mitigating") return false;
  return risk.triggerDate < todayISO;
}

/** Local nanoid-style ids so we don't force callers to import nanoid here. */
export function makeRiskId(nanoid10: string): string {
  return `risk-${nanoid10}`;
}
export function makeDecisionId(nanoid10: string): string {
  return `dec-${nanoid10}`;
}
