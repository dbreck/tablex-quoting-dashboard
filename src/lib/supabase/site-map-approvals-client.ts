// Browser-side CRUD for site_map_approvals. RLS-enforced.
// Store actions call these fire-and-forget after the optimistic local update.

import { createClient } from "@/lib/supabase/client";
import {
  approvalToUpsertRow,
  rowToApproval,
  type SiteMapApprovalRecord,
  type SiteMapApprovalRow,
} from "@/lib/supabase/site-map-approvals-converters";
import type { ApprovalDecision } from "@/store/site-map-approvals-store";

export async function fetchAllApprovals(): Promise<SiteMapApprovalRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_map_approvals")
    .select("*");
  if (error) throw error;
  return (data as SiteMapApprovalRow[]).map(rowToApproval);
}

export async function upsertApproval(
  pageId: string,
  decision: ApprovalDecision,
  note: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("site_map_approvals")
    .upsert(approvalToUpsertRow(pageId, decision, note), {
      onConflict: "page_id",
    });
  if (error) throw error;
}

export async function deleteApproval(pageId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("site_map_approvals")
    .delete()
    .eq("page_id", pageId);
  if (error) throw error;
}

export async function deleteAllApprovals(): Promise<void> {
  const supabase = createClient();
  // Supabase requires a filter; match every row by predicate that's always true.
  const { error } = await supabase
    .from("site_map_approvals")
    .delete()
    .neq("page_id", "__never__");
  if (error) throw error;
}
