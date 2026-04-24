// Pure snake_case ↔ camelCase converters for risks + decisions.
// No supabase client coupling — reusable from route handlers / future MCP.

import type {
  Risk,
  Decision,
  RiskCategory,
  RiskStatus,
  DecisionStatus,
  Reversibility,
} from "@/data/risks-decisions";

// ─── Row shapes (mirror Postgres columns) ────────────────────────────────────

export interface RiskRow {
  id: string;
  deliverable_id: string | null;
  title: string;
  description: string | null;
  category: RiskCategory;
  probability: number;
  impact: number;
  severity: number;
  status: RiskStatus;
  trigger_date: string | null;
  mitigation_owner: string | null;
  mitigation_plan: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecisionRow {
  id: string;
  deliverable_id: string | null;
  task_id: string | null;
  title: string;
  context: string | null;
  options_considered: string | null;
  decision: string | null;
  consequences: string | null;
  decided_by_member_id: string | null;
  decided_by_external: string | null;
  decided_on: string;
  reversibility: Reversibility;
  status: DecisionStatus;
  supersedes: string | null;
  superseded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Row → TS ────────────────────────────────────────────────────────────────

export function rowToRisk(row: RiskRow): Risk {
  return {
    id: row.id,
    deliverableId: row.deliverable_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category,
    probability: row.probability as 1 | 2 | 3,
    impact: row.impact as 1 | 2 | 3,
    severity: row.severity,
    status: row.status,
    triggerDate: row.trigger_date ?? undefined,
    mitigationOwner: row.mitigation_owner ?? undefined,
    mitigationPlan: row.mitigation_plan ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    deliverableId: row.deliverable_id ?? undefined,
    taskId: row.task_id ?? undefined,
    title: row.title,
    context: row.context ?? undefined,
    optionsConsidered: row.options_considered ?? undefined,
    decision: row.decision ?? undefined,
    consequences: row.consequences ?? undefined,
    decidedByMemberId: row.decided_by_member_id ?? undefined,
    decidedByExternal: row.decided_by_external ?? undefined,
    decidedOn: row.decided_on,
    reversibility: row.reversibility,
    status: row.status,
    supersedes: row.supersedes ?? undefined,
    supersededBy: row.superseded_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── TS → Row (inserts / updates) ────────────────────────────────────────────

export function riskToInsertRow(
  risk: Omit<Risk, "severity" | "createdAt" | "updatedAt">,
): Omit<RiskRow, "severity" | "created_at" | "updated_at"> {
  return {
    id: risk.id,
    deliverable_id: risk.deliverableId ?? null,
    title: risk.title,
    description: risk.description ?? null,
    category: risk.category,
    probability: risk.probability,
    impact: risk.impact,
    status: risk.status,
    trigger_date: risk.triggerDate ?? null,
    mitigation_owner: risk.mitigationOwner ?? null,
    mitigation_plan: risk.mitigationPlan ?? null,
    created_by: risk.createdBy ?? null,
  };
}

export function riskUpdatesToRow(
  updates: Partial<Omit<Risk, "id" | "severity" | "createdAt" | "updatedAt">>,
): Partial<Omit<RiskRow, "id" | "severity" | "created_at" | "updated_at">> {
  const row: Partial<Omit<RiskRow, "id" | "severity" | "created_at" | "updated_at">> = {};
  if (updates.deliverableId !== undefined)
    row.deliverable_id = updates.deliverableId ?? null;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description ?? null;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.probability !== undefined) row.probability = updates.probability;
  if (updates.impact !== undefined) row.impact = updates.impact;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.triggerDate !== undefined) row.trigger_date = updates.triggerDate ?? null;
  if (updates.mitigationOwner !== undefined)
    row.mitigation_owner = updates.mitigationOwner ?? null;
  if (updates.mitigationPlan !== undefined)
    row.mitigation_plan = updates.mitigationPlan ?? null;
  if (updates.createdBy !== undefined) row.created_by = updates.createdBy ?? null;
  return row;
}

export function decisionToInsertRow(
  decision: Omit<Decision, "createdAt" | "updatedAt">,
): Omit<DecisionRow, "created_at" | "updated_at"> {
  return {
    id: decision.id,
    deliverable_id: decision.deliverableId ?? null,
    task_id: decision.taskId ?? null,
    title: decision.title,
    context: decision.context ?? null,
    options_considered: decision.optionsConsidered ?? null,
    decision: decision.decision ?? null,
    consequences: decision.consequences ?? null,
    decided_by_member_id: decision.decidedByMemberId ?? null,
    decided_by_external: decision.decidedByExternal ?? null,
    decided_on: decision.decidedOn,
    reversibility: decision.reversibility,
    status: decision.status,
    supersedes: decision.supersedes ?? null,
    superseded_by: decision.supersededBy ?? null,
  };
}

export function decisionUpdatesToRow(
  updates: Partial<Omit<Decision, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<DecisionRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<DecisionRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.deliverableId !== undefined)
    row.deliverable_id = updates.deliverableId ?? null;
  if (updates.taskId !== undefined) row.task_id = updates.taskId ?? null;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.context !== undefined) row.context = updates.context ?? null;
  if (updates.optionsConsidered !== undefined)
    row.options_considered = updates.optionsConsidered ?? null;
  if (updates.decision !== undefined) row.decision = updates.decision ?? null;
  if (updates.consequences !== undefined) row.consequences = updates.consequences ?? null;
  if (updates.decidedByMemberId !== undefined)
    row.decided_by_member_id = updates.decidedByMemberId ?? null;
  if (updates.decidedByExternal !== undefined)
    row.decided_by_external = updates.decidedByExternal ?? null;
  if (updates.decidedOn !== undefined) row.decided_on = updates.decidedOn;
  if (updates.reversibility !== undefined) row.reversibility = updates.reversibility;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.supersedes !== undefined) row.supersedes = updates.supersedes ?? null;
  if (updates.supersededBy !== undefined)
    row.superseded_by = updates.supersededBy ?? null;
  return row;
}
