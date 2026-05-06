// snake↔camel converters for site_map_approvals rows.
// Pure functions; no Supabase coupling so route handlers can reuse them.

import type {
  ApprovalDecision,
  PageApproval,
} from "@/store/site-map-approvals-store";

export interface SiteMapApprovalRow {
  page_id: string;
  decision: ApprovalDecision;
  note: string;
  decided_at: string;
  created_at: string;
  updated_at: string;
}

export interface SiteMapApprovalRecord extends PageApproval {
  pageId: string;
  updatedAt: string;
}

export function rowToApproval(row: SiteMapApprovalRow): SiteMapApprovalRecord {
  return {
    pageId: row.page_id,
    decision: row.decision,
    note: row.note ?? "",
    decidedAt: row.decided_at,
    updatedAt: row.updated_at,
  };
}

export function approvalToUpsertRow(
  pageId: string,
  decision: ApprovalDecision,
  note: string,
): Pick<SiteMapApprovalRow, "page_id" | "decision" | "note" | "decided_at"> {
  return {
    page_id: pageId,
    decision,
    note,
    decided_at: new Date().toISOString(),
  };
}
