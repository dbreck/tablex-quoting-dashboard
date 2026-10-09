/**
 * Shared contracts for the TableX Financials warehouse (fin_* tables, migration 029).
 * Pure types — safe to import from scripts, server pages and client components.
 */

export type PartKind =
  | "table"
  | "base"
  | "top"
  | "accessory"
  | "freight"
  | "discount"
  | "other";

export type ParseConfidence = "high" | "medium" | "low" | "none";

/** Input to the invoice-line classifier (one Xero LineItem). */
export interface RawInvoiceLine {
  description: string | null;
  itemCode: string | null;
  accountCode: string | null;
  qty: number | null;
  unitAmount: number | null; // dollars, as Xero returns
  lineAmount: number | null; // dollars
  /** Invoice-level reference (dealer PO); `-Repl` suffix marks warranty replacements. */
  invoiceReference?: string | null;
}

/** Output of parseInvoiceLine(); maps 1:1 onto the parsed columns of fin_invoice_lines. */
export interface ParsedInvoiceLine {
  code: string | null;          // the config-code token as written (e.g. "SP-01TC1895T16-3P-SH.28")
  series_code: string | null;   // "01", "45", "99" …
  shape: string | null;         // "TC" | "RD" | "SQ" | "D" | "RT" | "BT" …
  width_in: number | null;      // first size dimension (diameter for RD/SQ)
  depth_in: number | null;      // second size dimension (null for RD/SQ)
  base_code: string | null;     // "T16", "D22", "FR2258", "X32", "C2", "QC2", "TT34" …
  post_config: number | null;   // 2 | 3 from "-2P" / "-3P"
  is_special: boolean;          // SP- prefix, SPECIAL item code, or SH. special height
  special_height: number | null;
  is_replacement: boolean;      // -Repl / "Replacement" / $0 with original model in parens
  part_kind: PartKind;
  parse_confidence: ParseConfidence;
}

export const PARSER_VERSION = 1;

/** Row shapes of the fin_* tables (snake_case = column names). */
export interface FinCustomerRow {
  id: string;
  xero_contact_id: string | null;
  name: string;
  normalized_name: string;
  site_org_id: string | null;
  site_org_type: string | null;
  rep_group: string | null;
  state: string | null;
  first_invoice_on: string | null;
  last_invoice_on: string | null;
}

export interface FinInvoiceRow {
  id: string;
  source: "xero";
  xero_invoice_id: string | null;
  number: string;
  reference: string | null;
  customer_id: string | null;
  status: string;
  issued_on: string;
  due_on: string | null;
  paid_on: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  amount_paid_cents: number | null;
  amount_due_cents: number | null;
  currency: string;
  line_count: number;
  has_special: boolean;
  xero_updated_at: string | null;
  raw?: unknown;
  imported_at?: string;
}

export interface FinInvoiceLineRow extends ParsedInvoiceLine {
  id?: string;
  invoice_id: string;
  xero_line_id: string | null;
  position: number;
  description: string | null;
  item_code: string | null;
  account_code: string | null;
  qty: number | null;
  unit_cents: number | null;
  amount_cents: number;
  parser_version: number;
}

export interface FinPlMonthlyRow {
  month: string; // YYYY-MM-01
  income_cents: number;
  freight_income_cents: number;
  other_income_cents: number;
  cogs_cents: number;
  commissions_cents: number;
  spiff_cents: number;
  freight_expense_cents: number;
  advertising_cents: number;
  total_expenses_cents: number;
  raw?: unknown;
}

export interface FinSiteQuoteRow {
  id: string;
  quote_number: string | null;
  kind: string | null;
  status: string | null;
  priced_source: string | null;
  pricing_tier: string | null;
  org_id: string | null;
  org_name: string | null;
  org_type: string | null;
  rep_org_id: string | null;
  created_at: string | null;
  submitted_at: string | null;
  quoted_at: string | null;
  accepted_at: string | null;
  subtotal_list_cents: number | null;
  subtotal_net_cents: number | null;
  po_number: string | null;
  ship_to_state: string | null;
  line_count: number | null;
  has_custom_line: boolean;
}

export interface FinSiteSignupRow {
  profile_id: string;
  role: string | null;
  org_id: string | null;
  org_type: string | null;
  created_at: string;
}

export interface FinWebRequestRow {
  id: string; // 'gf:<entryId>' | 'qr:<uuid>'
  source: "gf" | "qr";
  requested_at: string;
  company: string | null;
  normalized_company: string | null;
  series: string | null;
  finish: string | null;
  qty: number | null;
  top_needed: boolean | null;
  base_needed: boolean | null;
  org_id: string | null;
  customer_id: string | null;
}

export interface FinSourceRow {
  source: string;
  last_synced_at: string | null;
  coverage_from: string | null;
  coverage_to: string | null;
  row_count: number | null;
  notes: string | null;
}

/** View rows */
export interface RevenueMonthlyRow {
  month: string;
  invoiced_cents: number;
  invoices: number;
  customers: number;
  pl_income_cents: number | null;
  pl_freight_income_cents: number | null;
  pl_cogs_cents: number | null;
  pl_commissions_cents: number | null;
  pl_spiff_cents: number | null;
  pl_freight_expense_cents: number | null;
  pl_advertising_cents: number | null;
  detail_pending: boolean;
  revenue_cents: number;
}

export interface CustomerYearRow {
  customer_id: string;
  customer_name: string;
  site_org_id: string | null;
  site_org_type: string | null;
  year: number;
  invoices: number;
  total_cents: number;
  first_invoice_on: string;
  last_invoice_on: string;
}

export interface SeriesMonthRow {
  month: string;
  series_code: string | null;
  part_kind: PartKind;
  is_special: boolean;
  is_replacement: boolean;
  amount_cents: number;
  qty: number | null;
  lines: number;
}

export interface SizeMixRow {
  shape: string;
  width_in: number;
  depth_in: number | null;
  year: number;
  qty: number | null;
  amount_cents: number;
  lines: number;
}

export interface ParseHealthRow {
  parse_confidence: ParseConfidence;
  part_kind: PartKind;
  lines: number;
  amount_cents: number;
}

export interface SiteQuotesMonthlyRow {
  month: string;
  kind: string | null;
  priced_source: string | null;
  created: number;
  submitted: number;
  quoted: number;
  accepted: number;
  accepted_net_cents: number | null;
  orgs: number;
}

export interface WebRequestsMonthlyRow {
  month: string;
  source: "gf" | "qr";
  requests: number;
  companies: number;
  top_only: number;
  base_only: number;
}

/** Fixed calendar facts the UI annotates. */
export const FIN_MILESTONES = {
  xeroDetailCutoff: "2026-03-31", // last Xero invoice date; later months are P&L journals only
  siteLaunch: "2026-09-20",
  announcement: "2026-09-21",
  xeroInternalGoLive: "2026-09-14",
} as const;

export function toCents(dollars: number | null | undefined): number {
  if (dollars == null || Number.isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

/** lower-case, strip punctuation, drop corporate suffixes — shared by every matcher. */
export function normalizeCompany(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(inc|llc|llp|ltd|co|corp|corporation|company|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
