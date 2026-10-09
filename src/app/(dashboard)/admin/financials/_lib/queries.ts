/**
 * Server-side fetchers for /admin/financials. Reads the fin_* views/tables created by
 * supabase/migrations/029_financials.sql with the signed-in user's session (anon key +
 * RLS; the admin SELECT policy grants access). Every fetcher returns rows plus an
 * optional error string so one missing table never blanks the whole page.
 *
 * Import from server components only.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  CustomerYearRow,
  FinSourceRow,
  ParseHealthRow,
  RevenueMonthlyRow,
  SeriesMonthRow,
  SiteQuotesMonthlyRow,
  SizeMixRow,
  WebRequestsMonthlyRow,
} from "@/lib/fin/types";
import {
  num,
  numOrNull,
  rollupInvoices,
  rollupQueue,
  type FinancialsData,
  type SignupLite,
  type SiteQuoteLite,
  type WebRequestLite,
} from "./aggregate";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Page = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;
interface Result<T> {
  rows: T[];
  error?: string;
}

const PAGE = 1000;

/** Supabase caps a select at 1,000 rows — walk `.range()` until a short page. */
async function fetchAll<T>(label: string, page: (from: number, to: number) => Page): Promise<Result<T>> {
  let rows: T[] = [];
  for (let from = 0; from < 500_000; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) return { rows, error: `${label}: ${error.message}` };
    if (!data || data.length === 0) break;
    rows = rows.concat(data as T[]);
    if (data.length < PAGE) break;
  }
  return { rows };
}

// ── Xero-derived ────────────────────────────────────────────

async function fetchRevenueMonthly(sb: Supabase): Promise<Result<RevenueMonthlyRow>> {
  const res = await fetchAll<RevenueMonthlyRow>("fin_v_revenue_monthly", (f, t) =>
    sb.from("fin_v_revenue_monthly").select("*").order("month").range(f, t),
  );
  return {
    ...res,
    rows: res.rows.map((r) => ({
      ...r,
      invoiced_cents: num(r.invoiced_cents),
      invoices: num(r.invoices),
      customers: num(r.customers),
      pl_income_cents: numOrNull(r.pl_income_cents),
      pl_freight_income_cents: numOrNull(r.pl_freight_income_cents),
      pl_cogs_cents: numOrNull(r.pl_cogs_cents),
      pl_commissions_cents: numOrNull(r.pl_commissions_cents),
      pl_spiff_cents: numOrNull(r.pl_spiff_cents),
      pl_freight_expense_cents: numOrNull(r.pl_freight_expense_cents),
      pl_advertising_cents: numOrNull(r.pl_advertising_cents),
      detail_pending: !!r.detail_pending,
      revenue_cents: num(r.revenue_cents),
    })),
  };
}

async function fetchInvoices(sb: Supabase): Promise<Result<{ status: string; issued_on: string; total_cents: number }>> {
  return fetchAll("fin_invoices", (f, t) =>
    sb
      .from("fin_invoices")
      .select("status, issued_on, total_cents")
      .in("status", ["AUTHORISED", "PAID"])
      .order("id")
      .range(f, t),
  );
}

async function fetchCustomerYears(sb: Supabase): Promise<Result<CustomerYearRow>> {
  return fetchAll("fin_v_customer_year", (f, t) =>
    sb.from("fin_v_customer_year").select("*").order("customer_id").order("year").range(f, t),
  );
}

async function fetchSeriesMonths(sb: Supabase): Promise<Result<SeriesMonthRow>> {
  return fetchAll("fin_v_series_month", (f, t) =>
    sb
      .from("fin_v_series_month")
      .select("*")
      .order("month")
      .order("series_code")
      .order("part_kind")
      .order("is_special")
      .order("is_replacement")
      .range(f, t),
  );
}

async function fetchSizeMix(sb: Supabase): Promise<Result<SizeMixRow>> {
  return fetchAll("fin_v_size_mix", (f, t) =>
    sb
      .from("fin_v_size_mix")
      .select("*")
      .order("year")
      .order("shape")
      .order("width_in")
      .order("depth_in")
      .range(f, t),
  );
}

async function fetchParseHealth(sb: Supabase): Promise<Result<ParseHealthRow>> {
  const { data, error } = await sb.from("fin_v_parse_health").select("*");
  return { rows: (data ?? []) as ParseHealthRow[], error: error ? `fin_v_parse_health: ${error.message}` : undefined };
}

async function fetchSources(sb: Supabase): Promise<Result<FinSourceRow>> {
  const { data, error } = await sb.from("fin_sources").select("*").order("source");
  return { rows: (data ?? []) as FinSourceRow[], error: error ? `fin_sources: ${error.message}` : undefined };
}

// ── Site snapshot ───────────────────────────────────────────

async function fetchSiteQuotesMonthly(sb: Supabase): Promise<Result<SiteQuotesMonthlyRow>> {
  return fetchAll("fin_v_site_quotes_monthly", (f, t) =>
    sb.from("fin_v_site_quotes_monthly").select("*").order("month").order("kind").order("priced_source").range(f, t),
  );
}

async function fetchWebRequestsMonthly(sb: Supabase): Promise<Result<WebRequestsMonthlyRow>> {
  return fetchAll("fin_v_web_requests_monthly", (f, t) =>
    sb.from("fin_v_web_requests_monthly").select("*").order("month").order("source").range(f, t),
  );
}

async function fetchSiteQuotes(sb: Supabase): Promise<Result<SiteQuoteLite>> {
  return fetchAll("fin_site_quotes", (f, t) =>
    sb
      .from("fin_site_quotes")
      .select("kind, status, created_at, accepted_at, subtotal_net_cents, org_id")
      .order("id")
      .range(f, t),
  );
}

async function fetchWebRequests(sb: Supabase): Promise<Result<WebRequestLite>> {
  return fetchAll("fin_web_requests", (f, t) =>
    sb.from("fin_web_requests").select("source, requested_at").order("id").range(f, t),
  );
}

async function fetchSignups(sb: Supabase): Promise<Result<SignupLite>> {
  return fetchAll("fin_site_signups", (f, t) =>
    sb.from("fin_site_signups").select("role, created_at").order("profile_id").range(f, t),
  );
}

// ── Legacy desk queue (pre-launch) ──────────────────────────

async function fetchQueue(
  sb: Supabase,
): Promise<Result<{ year: number | null; date_normalized: string | null; quote_number: string | null }>> {
  return fetchAll("quote_queue", (f, t) =>
    sb.from("quote_queue").select("year, date_normalized, quote_number").order("id").range(f, t),
  );
}

/** Today in America/New_York as YYYY-MM-DD (TableX is in Indiana, Eastern time). */
export function todayEastern(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function loadFinancials(): Promise<FinancialsData> {
  const sb = await createClient();
  const [
    revenue,
    invoices,
    customerYears,
    seriesMonths,
    sizeMix,
    parseHealth,
    sources,
    siteQuotesMonthly,
    webRequestsMonthly,
    siteQuotes,
    webRequests,
    signups,
    queue,
  ] = await Promise.all([
    fetchRevenueMonthly(sb),
    fetchInvoices(sb),
    fetchCustomerYears(sb),
    fetchSeriesMonths(sb),
    fetchSizeMix(sb),
    fetchParseHealth(sb),
    fetchSources(sb),
    fetchSiteQuotesMonthly(sb),
    fetchWebRequestsMonthly(sb),
    fetchSiteQuotes(sb),
    fetchWebRequests(sb),
    fetchSignups(sb),
    fetchQueue(sb),
  ]);

  const errors = [
    revenue,
    invoices,
    customerYears,
    seriesMonths,
    sizeMix,
    parseHealth,
    sources,
    siteQuotesMonthly,
    webRequestsMonthly,
    siteQuotes,
    webRequests,
    signups,
    queue,
  ]
    .map((r) => r.error)
    .filter((e): e is string => !!e);
  for (const e of errors) console.error("[admin/financials]", e);

  const inv = rollupInvoices(invoices.rows);

  return {
    asOf: todayEastern(),
    revenueMonthly: revenue.rows,
    invoiceDays: inv.days,
    paidTotals: inv.paid,
    customerYears: customerYears.rows,
    seriesMonths: seriesMonths.rows,
    sizeMix: sizeMix.rows,
    parseHealth: parseHealth.rows,
    siteQuotesMonthly: siteQuotesMonthly.rows,
    webRequestsMonthly: webRequestsMonthly.rows,
    siteQuotes: siteQuotes.rows,
    webRequests: webRequests.rows,
    signups: signups.rows,
    sources: sources.rows,
    queueMonthly: rollupQueue(queue.rows),
    queueRows: queue.rows.length,
    errors,
  };
}
