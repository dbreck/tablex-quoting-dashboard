/**
 * Pure rollups for /admin/financials. No React, no Supabase — safe on the server
 * (queries.ts pre-aggregates with these) and in the client views.
 *
 * Money convention: inputs are integer cents. Chart series are emitted in DOLLARS
 * (so axis formatters can stay simple); tables and tiles keep cents and format late.
 * Every ratio guards its denominator and returns null when it would divide by zero.
 */

import {
  FIN_MILESTONES,
  type CustomerYearRow,
  type FinSourceRow,
  type ParseHealthRow,
  type PartKind,
  type RevenueMonthlyRow,
  type SeriesMonthRow,
  type SiteQuotesMonthlyRow,
  type SizeMixRow,
  type WebRequestsMonthlyRow,
} from "@/lib/fin/types";
import { getSeriesByCode } from "@/data/series-catalog";
import { shapeCodes } from "@/data/sku-registry";

// ─────────────────────────────────────────────────────────────
// Props contract (server → client)
// ─────────────────────────────────────────────────────────────

/** One calendar day of AUTHORISED + PAID invoices (pre-aggregated server side). */
export interface InvoiceDay {
  day: string; // YYYY-MM-DD
  invoices: number;
  cents: number;
}

export interface PaidTotals {
  allTime: { count: number; cents: number };
  byYear: Record<number, { count: number; cents: number }>;
}

export interface SiteQuoteLite {
  kind: string | null;
  status: string | null;
  created_at: string | null;
  accepted_at: string | null;
  subtotal_net_cents: number | null;
  org_id: string | null;
}

export interface WebRequestLite {
  source: "gf" | "qr";
  requested_at: string;
}

export interface SignupLite {
  role: string | null;
  created_at: string;
}

export type QueueKind = "quote" | "order" | "unlabeled";

export interface QueueMonth {
  month: string; // YYYY-MM
  quotes: number;
  orders: number;
  unlabeled: number;
}

export interface FinancialsData {
  asOf: string; // YYYY-MM-DD (server clock, so client render is deterministic)
  revenueMonthly: RevenueMonthlyRow[];
  invoiceDays: InvoiceDay[];
  paidTotals: PaidTotals;
  customerYears: CustomerYearRow[];
  seriesMonths: SeriesMonthRow[];
  sizeMix: SizeMixRow[];
  parseHealth: ParseHealthRow[];
  siteQuotesMonthly: SiteQuotesMonthlyRow[];
  webRequestsMonthly: WebRequestsMonthlyRow[];
  siteQuotes: SiteQuoteLite[];
  webRequests: WebRequestLite[];
  signups: SignupLite[];
  sources: FinSourceRow[];
  queueMonthly: QueueMonth[];
  queueRows: number;
  errors: string[];
}

export const EMPTY_XERO = "No data yet — run scripts/fin/xero-pull.ts";
export const EMPTY_SITE = "No data yet — run scripts/fin/site-snapshot.ts";

/** Reconciliation targets supplied with the brief (Xero PAID invoices). */
export const RECON_EXPECTED = {
  allTime: { count: 3803, cents: 1_687_457_289 },
  year: 2025,
  yearTotals: { count: 609, cents: 328_552_277 },
} as const;

// ─────────────────────────────────────────────────────────────
// Formatting + calendar helpers
// ─────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ratio(part: number, whole: number): number | null {
  return whole === 0 ? null : part / whole;
}

export function money(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export function compactDollars(dollars: number): string {
  const abs = Math.abs(dollars);
  const sign = dollars < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function compactMoney(cents: number): string {
  return compactDollars(cents / 100);
}

export function pct(r: number | null, digits = 1): string {
  return r === null ? "—" : `${(r * 100).toFixed(digits)}%`;
}

export function count(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** "2026-03-14" | "2026-03-01T…" → "2026-03" */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} '${y.slice(2)}`;
}

export function shortDate(day: string | null): string {
  if (!day) return "—";
  const [y, m, d] = day.slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${Number(d)}, ${y}`;
}

function addMonths(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

/** Inclusive list of month keys from → to. Empty when from > to. */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  let k = from;
  let guard = 0;
  while (k <= to && guard < 600) {
    out.push(k);
    k = addMonths(k, 1);
    guard++;
  }
  return out;
}

function dayNumber(day: string): number {
  const [y, m, d] = day.slice(0, 10).split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Inclusive day count between two YYYY-MM-DD dates (0 when end < start). */
export function daysBetween(start: string, end: string): number {
  return Math.max(0, dayNumber(end) - dayNumber(start) + 1);
}

function shiftYear(day: string, delta: number): string {
  const y = Number(day.slice(0, 4)) + delta;
  let rest = day.slice(4, 10);
  if (rest === "-02-29") rest = "-02-28";
  return `${y}${rest}`;
}

function inWindow(ts: string | null, start: string, end: string): boolean {
  if (!ts) return false;
  const d = ts.slice(0, 10);
  return d >= start && d <= end;
}

// ─────────────────────────────────────────────────────────────
// Server-side pre-aggregation helpers
// ─────────────────────────────────────────────────────────────

/**
 * quote_queue column C is "QUOTE # / EMAIL QUOTE / SO #" from the desk's spreadsheet.
 * A value that starts with PO/SO, or carries "SO" followed by a number ("SO#10157",
 * "PO / SO #9930"), is an order; blanks, "-", "NONE" are unlabeled; everything else
 * ("23.MAF.3302023.2", "Email Quote", "Email - 23.SQ.0907.A") is a quote.
 */
export function classifyQueueEntry(quoteNumber: string | null | undefined): QueueKind {
  const q = (quoteNumber ?? "").trim();
  if (!q || q === "-" || /^(none|n\/a|na)$/i.test(q)) return "unlabeled";
  if (/^(PO|SO)\b/i.test(q) || /\bSO\s*#?\s*\d/i.test(q)) return "order";
  return "quote";
}

/**
 * Month for a queue row: `year` + the MM of `date_normalized` ("MM-DDThh:mm"),
 * the same rule QueueClient uses. Rows without both are skipped.
 */
export function queueMonthOf(year: number | null, dateNormalized: string | null): string | null {
  if (!year || !dateNormalized) return null;
  const m = dateNormalized.match(/^(\d{2})-/);
  return m ? `${year}-${m[1]}` : null;
}

export function rollupQueue(rows: { year: number | null; date_normalized: string | null; quote_number: string | null }[]): QueueMonth[] {
  const by = new Map<string, QueueMonth>();
  for (const r of rows) {
    const month = queueMonthOf(r.year, r.date_normalized);
    if (!month) continue;
    const cur = by.get(month) ?? { month, quotes: 0, orders: 0, unlabeled: 0 };
    const kind = classifyQueueEntry(r.quote_number);
    if (kind === "order") cur.orders++;
    else if (kind === "quote") cur.quotes++;
    else cur.unlabeled++;
    by.set(month, cur);
  }
  return [...by.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function rollupInvoices(rows: { status: string; issued_on: string; total_cents: number }[]): {
  days: InvoiceDay[];
  paid: PaidTotals;
} {
  const days = new Map<string, InvoiceDay>();
  const paid: PaidTotals = { allTime: { count: 0, cents: 0 }, byYear: {} };
  for (const r of rows) {
    const day = r.issued_on.slice(0, 10);
    const cents = num(r.total_cents);
    const d = days.get(day) ?? { day, invoices: 0, cents: 0 };
    d.invoices++;
    d.cents += cents;
    days.set(day, d);
    if (r.status === "PAID") {
      const y = Number(day.slice(0, 4));
      paid.allTime.count++;
      paid.allTime.cents += cents;
      const py = paid.byYear[y] ?? { count: 0, cents: 0 };
      py.count++;
      py.cents += cents;
      paid.byYear[y] = py;
    }
  }
  return { days: [...days.values()].sort((a, b) => a.day.localeCompare(b.day)), paid };
}

// ─────────────────────────────────────────────────────────────
// Overview
// ─────────────────────────────────────────────────────────────

export interface RevenuePoint {
  key: string;
  label: string;
  invoiced: number; // dollars, months with invoice detail
  pending: number; // dollars, months filled from the P&L
}

export const CHART_START_MONTH = "2021-01";

export function revenueByMonth(rows: RevenueMonthlyRow[], asOf: string): RevenuePoint[] {
  if (rows.length === 0) return [];
  const by = new Map(rows.map((r) => [monthKey(r.month), r]));
  return monthRange(CHART_START_MONTH, monthKey(asOf)).map((key) => {
    const r = by.get(key);
    const rev = r ? num(r.revenue_cents) / 100 : 0;
    const pending = !!r?.detail_pending;
    return { key, label: monthLabel(key), invoiced: pending ? 0 : rev, pending: pending ? rev : 0 };
  });
}

export interface YearRevenue {
  year: string;
  invoiced: number; // dollars
  pending: number; // dollars
}

export function revenueByYear(rows: RevenueMonthlyRow[]): YearRevenue[] {
  const by = new Map<string, YearRevenue>();
  for (const r of rows) {
    const year = r.month.slice(0, 4);
    if (year < CHART_START_MONTH.slice(0, 4)) continue;
    const cur = by.get(year) ?? { year, invoiced: 0, pending: 0 };
    const dollars = num(r.revenue_cents) / 100;
    if (r.detail_pending) cur.pending += dollars;
    else cur.invoiced += dollars;
    by.set(year, cur);
  }
  return [...by.values()].sort((a, b) => a.year.localeCompare(b.year));
}

export interface PlYear {
  year: string;
  months: number;
  income: number;
  freightIncome: number;
  cogs: number;
  grossMargin: number | null;
  commissions: number;
  spiff: number;
  freightExpense: number;
  advertising: number;
}

/** P&L by year; only months that carry a P&L row count (`months` says how many). */
export function plByYear(rows: RevenueMonthlyRow[]): PlYear[] {
  const by = new Map<string, PlYear>();
  for (const r of rows) {
    if (r.pl_income_cents === null || r.pl_income_cents === undefined) continue;
    const year = r.month.slice(0, 4);
    const cur =
      by.get(year) ??
      ({ year, months: 0, income: 0, freightIncome: 0, cogs: 0, grossMargin: null, commissions: 0, spiff: 0, freightExpense: 0, advertising: 0 } as PlYear);
    cur.months++;
    cur.income += num(r.pl_income_cents);
    cur.freightIncome += num(r.pl_freight_income_cents);
    cur.cogs += num(r.pl_cogs_cents);
    cur.commissions += num(r.pl_commissions_cents);
    cur.spiff += num(r.pl_spiff_cents);
    cur.freightExpense += num(r.pl_freight_expense_cents);
    cur.advertising += num(r.pl_advertising_cents);
    by.set(year, cur);
  }
  return [...by.values()]
    .map((y) => ({ ...y, grossMargin: ratio(y.income - y.cogs, y.income) }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export interface OverviewStats {
  t12: { cents: number; from: string; to: string; months: number };
  ytd: { cents: number; priorCents: number; change: number | null; through: string; priorPartialFromPl: boolean };
  invoicesYtd: { count: number; cents: number; lastDay: string | null };
  avgInvoiceCents: number | null;
  t12GrossMargin: number | null;
  t12CommissionShare: number | null;
  t12PlMonths: number;
}

export function overviewStats(rows: RevenueMonthlyRow[], days: InvoiceDay[], asOf: string): OverviewStats {
  const by = new Map(rows.map((r) => [monthKey(r.month), r]));
  const curMonth = monthKey(asOf);
  const year = Number(asOf.slice(0, 4));
  const mm = asOf.slice(5, 7);

  // Trailing 12 complete months (the current month is still open).
  const t12Keys = monthRange(addMonths(curMonth, -12), addMonths(curMonth, -1));
  let t12 = 0;
  let plIncome = 0;
  let plCogs = 0;
  let plComm = 0;
  let plMonths = 0;
  let t12Months = 0;
  for (const k of t12Keys) {
    const r = by.get(k);
    if (!r) continue;
    t12Months++;
    t12 += num(r.revenue_cents);
    if (r.pl_income_cents !== null && r.pl_income_cents !== undefined) {
      plMonths++;
      plIncome += num(r.pl_income_cents);
      plCogs += num(r.pl_cogs_cents);
      plComm += num(r.pl_commissions_cents);
    }
  }

  // YTD: current year Jan..current month (current month = month-to-date as recorded).
  let ytd = 0;
  for (const k of monthRange(`${year}-01`, curMonth)) ytd += num(by.get(k)?.revenue_cents);

  // Prior YTD to the same day of year: full prior months + day-level invoices of the
  // matching month. When that month has no invoice detail, the whole P&L month is used.
  let prior = 0;
  const priorMonth = `${year - 1}-${mm}`;
  for (const k of monthRange(`${year - 1}-01`, addMonths(priorMonth, -1))) prior += num(by.get(k)?.revenue_cents);
  const priorRow = by.get(priorMonth);
  let priorPartialFromPl = false;
  if (priorRow?.detail_pending) {
    prior += num(priorRow.revenue_cents);
    priorPartialFromPl = true;
  } else {
    const priorDay = shiftYear(asOf, -1);
    for (const d of days) if (d.day >= `${priorMonth}-01` && d.day <= priorDay) prior += d.cents;
  }

  // Invoice-detail counts for the current year.
  let invCount = 0;
  let invCents = 0;
  let lastDay: string | null = null;
  for (const d of days) {
    if (!d.day.startsWith(`${year}-`) || d.day > asOf) continue;
    invCount += d.invoices;
    invCents += d.cents;
    lastDay = d.day;
  }

  return {
    t12: { cents: t12, from: t12Keys[0], to: t12Keys[t12Keys.length - 1], months: t12Months },
    ytd: { cents: ytd, priorCents: prior, change: ratio(ytd - prior, prior), through: asOf, priorPartialFromPl },
    invoicesYtd: { count: invCount, cents: invCents, lastDay },
    avgInvoiceCents: invCount === 0 ? null : invCents / invCount,
    t12GrossMargin: ratio(plIncome - plCogs, plIncome),
    t12CommissionShare: ratio(plComm, plIncome),
    t12PlMonths: plMonths,
  };
}

// ─────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────

export interface CustomerAgg {
  id: string;
  name: string;
  siteOrgType: string | null;
  onSite: boolean;
  byYear: Record<number, number>; // cents
  allTime: number; // cents
  invoices: number;
  firstInvoice: string | null;
  lastInvoice: string | null;
  yoy: number | null;
}

/** Churn rule from the brief: revenue in CHURN_YEAR and no invoice on/after CHURN_SINCE. */
export const CHURN_YEAR = 2024;
export const CHURN_SINCE = "2025-10-01"; // six months before the last invoice-detail month
export const YOY_YEAR = 2025;

export function rollupCustomers(rows: CustomerYearRow[]): { customers: CustomerAgg[]; years: number[] } {
  const by = new Map<string, CustomerAgg>();
  const years = new Set<number>();
  for (const r of rows) {
    const year = num(r.year);
    years.add(year);
    const cur =
      by.get(r.customer_id) ??
      ({
        id: r.customer_id,
        name: r.customer_name,
        siteOrgType: r.site_org_type,
        onSite: !!r.site_org_type,
        byYear: {},
        allTime: 0,
        invoices: 0,
        firstInvoice: null,
        lastInvoice: null,
        yoy: null,
      } as CustomerAgg);
    const cents = num(r.total_cents);
    cur.byYear[year] = (cur.byYear[year] ?? 0) + cents;
    cur.allTime += cents;
    cur.invoices += num(r.invoices);
    if (r.first_invoice_on && (!cur.firstInvoice || r.first_invoice_on < cur.firstInvoice)) cur.firstInvoice = r.first_invoice_on;
    if (r.last_invoice_on && (!cur.lastInvoice || r.last_invoice_on > cur.lastInvoice)) cur.lastInvoice = r.last_invoice_on;
    by.set(r.customer_id, cur);
  }
  const customers = [...by.values()].map((c) => {
    const prev = c.byYear[YOY_YEAR - 1] ?? 0;
    const cur = c.byYear[YOY_YEAR] ?? 0;
    return { ...c, yoy: ratio(cur - prev, prev) };
  });
  customers.sort((a, b) => b.allTime - a.allTime);
  return { customers, years: [...years].sort((a, b) => a - b) };
}

export interface Concentration {
  total: number;
  top10Share: number | null;
  activeInYoyYear: number;
  newPerYear: { year: string; customers: number }[];
  churned: number;
  pareto: { rank: number; share: number }[];
}

export function concentration(customers: CustomerAgg[]): Concentration {
  const sorted = [...customers].sort((a, b) => b.allTime - a.allTime);
  const total = sorted.reduce((s, c) => s + c.allTime, 0);
  const top10 = sorted.slice(0, 10).reduce((s, c) => s + c.allTime, 0);

  const newBy = new Map<string, number>();
  for (const c of sorted) {
    if (!c.firstInvoice) continue;
    const y = c.firstInvoice.slice(0, 4);
    newBy.set(y, (newBy.get(y) ?? 0) + 1);
  }

  const n = sorted.length;
  const pareto: { rank: number; share: number }[] = [];
  if (n > 0 && total > 0) {
    const step = Math.max(1, Math.floor(n / 200));
    let cum = 0;
    sorted.forEach((c, i) => {
      cum += c.allTime;
      if (i % step === 0 || i === n - 1) {
        pareto.push({ rank: ((i + 1) / n) * 100, share: (cum / total) * 100 });
      }
    });
  }

  return {
    total,
    top10Share: ratio(top10, total),
    activeInYoyYear: sorted.filter((c) => (c.byYear[YOY_YEAR] ?? 0) > 0).length,
    newPerYear: [...newBy.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([year, customers]) => ({ year, customers })),
    churned: sorted.filter((c) => (c.byYear[CHURN_YEAR] ?? 0) > 0 && (!c.lastInvoice || c.lastInvoice < CHURN_SINCE)).length,
    pareto,
  };
}

// ─────────────────────────────────────────────────────────────
// Product mix
// ─────────────────────────────────────────────────────────────

/**
 * Series label from the authoritative catalog (src/data/series-catalog.ts). The
 * sku-registry names are seed placeholders, so they are not used here; codes the
 * catalog does not map yet render as "Series NN".
 */
export function seriesLabel(code: string): string {
  const name = getSeriesByCode(code)?.name;
  return name ? `${name} (${code})` : `Series ${code}`;
}

export function shapeLabel(code: string): string {
  const name = shapeCodes[code]?.name;
  return name ? `${name} (${code})` : code;
}

export const PART_KINDS: PartKind[] = ["table", "base", "top", "accessory", "freight", "discount", "other"];

export interface SeriesStack {
  keys: { key: string; label: string }[];
  points: Record<string, number | string>[];
}

export function seriesStack(rows: SeriesMonthRow[], topN = 8): SeriesStack {
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (!r.series_code) continue;
    totals.set(r.series_code, (totals.get(r.series_code) ?? 0) + num(r.amount_cents));
  }
  if (totals.size === 0) return { keys: [], points: [] };
  const top = [...totals.entries()].sort(([, a], [, b]) => b - a).slice(0, topN).map(([k]) => k);
  const topSet = new Set(top);
  const hasOther = totals.size > top.length;

  const by = new Map<string, Record<string, number>>();
  let first = "9999-99";
  let last = "0000-00";
  for (const r of rows) {
    if (!r.series_code) continue;
    const k = monthKey(r.month);
    if (k < first) first = k;
    if (k > last) last = k;
    const slot = topSet.has(r.series_code) ? `s${r.series_code}` : "other";
    const m = by.get(k) ?? {};
    m[slot] = (m[slot] ?? 0) + num(r.amount_cents) / 100;
    by.set(k, m);
  }
  const keys = top.map((c) => ({ key: `s${c}`, label: seriesLabel(c) }));
  if (hasOther) keys.push({ key: "other", label: "Other series" });
  const points = monthRange(first, last).map((k) => {
    const m = by.get(k) ?? {};
    const p: Record<string, number | string> = { key: k, label: monthLabel(k) };
    for (const s of keys) p[s.key] = m[s.key] ?? 0;
    return p;
  });
  return { keys, points };
}

export function partKindByYear(rows: SeriesMonthRow[]): Record<string, number | string>[] {
  const by = new Map<string, Record<string, number | string>>();
  for (const r of rows) {
    const year = r.month.slice(0, 4);
    const cur = by.get(year) ?? Object.fromEntries([["year", year], ...PART_KINDS.map((k) => [k, 0])]);
    cur[r.part_kind] = num(cur[r.part_kind]) + num(r.amount_cents) / 100;
    by.set(year, cur);
  }
  return [...by.values()].sort((a, b) => String(a.year).localeCompare(String(b.year)));
}

export function specialsShare(rows: SeriesMonthRow[]): { key: string; label: string; share: number | null }[] {
  const by = new Map<string, { total: number; special: number }>();
  for (const r of rows) {
    const k = monthKey(r.month);
    const cur = by.get(k) ?? { total: 0, special: 0 };
    const cents = num(r.amount_cents);
    cur.total += cents;
    if (r.is_special) cur.special += cents;
    by.set(k, cur);
  }
  const keys = [...by.keys()].sort();
  if (keys.length === 0) return [];
  return monthRange(keys[0], keys[keys.length - 1]).map((k) => {
    const v = by.get(k);
    const r = v && v.total > 0 ? ratio(v.special, v.total) : null;
    return { key: k, label: monthLabel(k), share: r === null ? null : r * 100 };
  });
}

export function replacementsByYear(rows: SeriesMonthRow[]): { year: string; lines: number }[] {
  const by = new Map<string, number>();
  for (const r of rows) {
    if (!r.is_replacement) continue;
    const y = r.month.slice(0, 4);
    by.set(y, (by.get(y) ?? 0) + num(r.lines));
  }
  return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([year, lines]) => ({ year, lines }));
}

export interface SizeAgg {
  shape: string;
  width: number;
  depth: number | null;
  qty: number;
  lines: number;
  cents: number;
}

export function topSizes(rows: SizeMixRow[], limit = 15): { sizes: SizeAgg[]; years: number[] } {
  const allYears = [...new Set(rows.map((r) => num(r.year)))].sort((a, b) => b - a);
  const years = allYears.slice(0, 2).sort((a, b) => a - b);
  const keep = new Set(years);
  const by = new Map<string, SizeAgg>();
  for (const r of rows) {
    if (!keep.has(num(r.year))) continue;
    const depth = numOrNull(r.depth_in);
    const width = num(r.width_in);
    const k = `${r.shape}|${width}|${depth ?? ""}`;
    const cur = by.get(k) ?? { shape: r.shape, width, depth, qty: 0, lines: 0, cents: 0 };
    cur.qty += num(r.qty);
    cur.lines += num(r.lines);
    cur.cents += num(r.amount_cents);
    by.set(k, cur);
  }
  const sizes = [...by.values()].sort((a, b) => b.qty - a.qty || b.lines - a.lines).slice(0, limit);
  return { sizes, years };
}

// ─────────────────────────────────────────────────────────────
// Quote pipeline
// ─────────────────────────────────────────────────────────────

export interface PipelinePoint {
  key: string;
  label: string;
  quotes: number;
  orders: number;
  unlabeled: number;
  gf: number;
  qr: number;
}

export function pipelineByMonth(queue: QueueMonth[], web: WebRequestsMonthlyRow[]): PipelinePoint[] {
  const q = new Map(queue.map((r) => [r.month, r]));
  const w = new Map<string, { gf: number; qr: number }>();
  for (const r of web) {
    const k = monthKey(r.month);
    const cur = w.get(k) ?? { gf: 0, qr: 0 };
    cur[r.source] += num(r.requests);
    w.set(k, cur);
  }
  const keys = [...new Set([...q.keys(), ...w.keys()])].sort();
  if (keys.length === 0) return [];
  return monthRange(keys[0], keys[keys.length - 1]).map((k) => ({
    key: k,
    label: monthLabel(k),
    quotes: q.get(k)?.quotes ?? 0,
    orders: q.get(k)?.orders ?? 0,
    unlabeled: q.get(k)?.unlabeled ?? 0,
    gf: w.get(k)?.gf ?? 0,
    qr: w.get(k)?.qr ?? 0,
  }));
}

export interface FunnelRow {
  kind: string;
  created: number;
  submitted: number;
  quoted: number;
  accepted: number;
  acceptedNetCents: number;
}

export const LAUNCH_MONTH = monthKey(FIN_MILESTONES.siteLaunch);

export function siteFunnel(rows: SiteQuotesMonthlyRow[], sinceMonth = LAUNCH_MONTH): FunnelRow[] {
  const by = new Map<string, FunnelRow>();
  for (const r of rows) {
    if (monthKey(r.month) < sinceMonth) continue;
    const kind = r.kind ?? "unknown";
    const cur = by.get(kind) ?? { kind, created: 0, submitted: 0, quoted: 0, accepted: 0, acceptedNetCents: 0 };
    cur.created += num(r.created);
    cur.submitted += num(r.submitted);
    cur.quoted += num(r.quoted);
    cur.accepted += num(r.accepted);
    cur.acceptedNetCents += num(r.accepted_net_cents);
    by.set(kind, cur);
  }
  return [...by.values()].sort((a, b) => a.kind.localeCompare(b.kind));
}

// ─────────────────────────────────────────────────────────────
// Website impact
// ─────────────────────────────────────────────────────────────

export interface ImpactWindow {
  id: "since" | "y1" | "y2";
  label: string;
  start: string;
  end: string;
  days: number;
  siteLive: boolean;
}

export function impactWindows(asOf: string): ImpactWindow[] {
  const start = FIN_MILESTONES.announcement;
  const days = daysBetween(start, asOf);
  const mk = (id: ImpactWindow["id"], delta: number): ImpactWindow => {
    const s = shiftYear(start, delta);
    const e = shiftYear(asOf, delta);
    return {
      id,
      label: delta === 0 ? `Since ${shortDate(start)}` : `Same span ${s.slice(0, 4)}`,
      start: s,
      end: e,
      days: daysBetween(s, e),
      siteLive: e >= FIN_MILESTONES.siteLaunch,
    };
  };
  const out = [mk("since", 0), mk("y1", -1), mk("y2", -2)];
  return days > 0 ? out : out.map((w) => ({ ...w, days: 0 }));
}

export interface ImpactMetrics {
  webRequests: number;
  webBySource: { gf: number; qr: number };
  signups: number;
  signupsByRole: { role: string; n: number }[];
  portalQuotes: number;
  selfQuotes: number;
  accepted: number;
  acceptedNetCents: number;
  orgsQuoting: number;
}

export function impactMetrics(
  w: ImpactWindow,
  data: { webRequests: WebRequestLite[]; signups: SignupLite[]; siteQuotes: SiteQuoteLite[] },
): ImpactMetrics {
  const bySource = { gf: 0, qr: 0 };
  for (const r of data.webRequests) if (inWindow(r.requested_at, w.start, w.end)) bySource[r.source]++;

  const roles = new Map<string, number>();
  let signups = 0;
  for (const s of data.signups) {
    if (!inWindow(s.created_at, w.start, w.end)) continue;
    signups++;
    const role = s.role ?? "unknown";
    roles.set(role, (roles.get(role) ?? 0) + 1);
  }

  let portal = 0;
  let self = 0;
  let accepted = 0;
  let acceptedNet = 0;
  const orgs = new Set<string>();
  for (const q of data.siteQuotes) {
    if (inWindow(q.created_at, w.start, w.end)) {
      if (q.kind === "self") self++;
      else if (q.kind === "portal") portal++;
      if (q.org_id) orgs.add(q.org_id);
    }
    if (q.status === "accepted" && inWindow(q.accepted_at, w.start, w.end)) {
      accepted++;
      acceptedNet += num(q.subtotal_net_cents);
    }
  }

  return {
    webRequests: bySource.gf + bySource.qr,
    webBySource: bySource,
    signups,
    signupsByRole: [...roles.entries()].sort(([, a], [, b]) => b - a).map(([role, n]) => ({ role, n })),
    portalQuotes: portal,
    selfQuotes: self,
    accepted,
    acceptedNetCents: acceptedNet,
    orgsQuoting: orgs.size,
  };
}

// ─────────────────────────────────────────────────────────────
// Data health
// ─────────────────────────────────────────────────────────────

export const CONFIDENCES = ["high", "medium", "low", "none"] as const;

export function parseHistogram(rows: ParseHealthRow[]): Record<string, number | string>[] {
  return CONFIDENCES.map((c) => {
    const p: Record<string, number | string> = { confidence: c };
    for (const k of PART_KINDS) p[k] = 0;
    for (const r of rows) if (r.parse_confidence === c) p[r.part_kind] = num(p[r.part_kind]) + num(r.lines);
    return p;
  });
}

export function parseTotals(rows: ParseHealthRow[]): { confidence: string; lines: number; cents: number; share: number | null }[] {
  const total = rows.reduce((s, r) => s + num(r.lines), 0);
  return CONFIDENCES.map((c) => {
    const sel = rows.filter((r) => r.parse_confidence === c);
    const lines = sel.reduce((s, r) => s + num(r.lines), 0);
    return { confidence: c, lines, cents: sel.reduce((s, r) => s + num(r.amount_cents), 0), share: ratio(lines, total) };
  });
}
