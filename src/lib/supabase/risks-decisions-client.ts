// Browser-side CRUD for risks + decisions. Authz is RLS-enforced
// (`can_access_proposal` for read/write, admin for delete). Store calls
// these fire-and-forget after applying the optimistic local update.

import { createClient } from "@/lib/supabase/client";
import type { Risk, Decision } from "@/data/risks-decisions";
import {
  rowToRisk,
  rowToDecision,
  riskToInsertRow,
  riskUpdatesToRow,
  decisionToInsertRow,
  decisionUpdatesToRow,
  type RiskRow,
  type DecisionRow,
} from "@/lib/supabase/risks-decisions-converters";

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchAllRisks(): Promise<Risk[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("risks")
    .select("*")
    .order("severity", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as RiskRow[]).map(rowToRisk);
}

export async function fetchAllDecisions(): Promise<Decision[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("decided_on", { ascending: false });
  if (error) throw error;
  return (data as DecisionRow[]).map(rowToDecision);
}

// ─── Risk writes ─────────────────────────────────────────────────────────────

export async function createRisk(
  risk: Omit<Risk, "severity" | "createdAt" | "updatedAt">,
): Promise<Risk> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("risks")
    .insert(riskToInsertRow(risk))
    .select("*")
    .single();
  if (error) throw error;
  return rowToRisk(data as RiskRow);
}

export async function updateRisk(
  id: string,
  patch: Partial<Omit<Risk, "id" | "severity" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = riskUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("risks").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteRisk(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("risks").delete().eq("id", id);
  if (error) throw error;
}

// ─── Decision writes ─────────────────────────────────────────────────────────

export async function createDecision(
  decision: Omit<Decision, "createdAt" | "updatedAt">,
): Promise<Decision> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decisions")
    .insert(decisionToInsertRow(decision))
    .select("*")
    .single();
  if (error) throw error;
  return rowToDecision(data as DecisionRow);
}

export async function updateDecision(
  id: string,
  patch: Partial<Omit<Decision, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = decisionUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("decisions").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteDecision(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) throw error;
}
