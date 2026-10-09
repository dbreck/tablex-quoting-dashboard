/**
 * Pull the monthly Profit & Loss from Xero into fin_pl_monthly (one row per month).
 * Covers the post-March-2026 span where Xero holds only journal totals, no invoices.
 *
 * Usage:
 *   npx tsx scripts/fin/xero-pl.ts --dry-run          # print the table + checks, write nothing
 *   npx tsx scripts/fin/xero-pl.ts                    # 2020 → current year
 *   npx tsx scripts/fin/xero-pl.ts --year 2026        # one year
 *
 * Request shape: Xero's `periods` counts BACKWARD from the fromDate/toDate window, so
 * each year asks for December (fromDate=YYYY-12-01, toDate=YYYY-12-31) plus 11 prior
 * MONTH periods = Jan..Dec. Columns are placed by their header text ("31 Dec 2025"),
 * falling back to descending position when a header doesn't parse.
 * Months after the current month and months with no activity at all are skipped.
 */
import { join } from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  xeroGet,
  type XeroReportRow,
  type XeroReportsResponse,
} from "../../src/lib/fin/xero/client";
import { getAuthorizedSession } from "../../src/lib/fin/xero/token-store";
import { lastDayOfMonth } from "../../src/lib/fin/xero/dates";
import { toCents, type FinPlMonthlyRow } from "../../src/lib/fin/types";

config({ path: join(__dirname, "..", "..", ".env.local") });

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_YEAR = argValue("--year") ? Number(argValue("--year")) : null;
const FIRST_YEAR = 2020;

/** Known check values (cents). */
const CHECK_2025_INCOME = 322_691_458; // SALES-TablEx 2025 = $3,226,914.58
const CHECK_2026_APR_OCT_INCOME = 149_407_292; // ≈ $1,494,072.92

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

type SectionKind = "income" | "cogs" | "expenses";

function classifySection(title: string | undefined): SectionKind | null {
  const t = (title ?? "").toLowerCase();
  if (t.includes("cost of sales") || t.includes("cost of goods")) return "cogs";
  if (t.includes("expense")) return "expenses";
  if (t.includes("income") || t.includes("revenue")) return "income";
  return null;
}

/** "31 Dec 2025" | "Dec 2025" | "Dec-25" → month index 0-11 + year, or null. */
function parseHeaderMonth(value: string | undefined): { year: number; month: number } | null {
  const m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-.]+(\d{2}|\d{4})\b/i.exec(value ?? "");
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  let year = Number(m[2]);
  if (year < 100) year += 2000;
  return { year, month };
}

function amountCents(value: string | undefined): number {
  if (!value) return 0;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? toCents(n) : 0;
}

const norm = (s: string) => s.trim().toLowerCase();

interface MonthAcc {
  row: FinPlMonthlyRow;
  raw: Record<string, Record<string, number>>;
  touched: boolean;
}

function emptyMonth(ymd: string): MonthAcc {
  return {
    row: {
      month: ymd,
      income_cents: 0,
      freight_income_cents: 0,
      other_income_cents: 0,
      cogs_cents: 0,
      commissions_cents: 0,
      spiff_cents: 0,
      freight_expense_cents: 0,
      advertising_cents: 0,
      total_expenses_cents: 0,
    },
    raw: {},
    touched: false,
  };
}

function applyAccount(acc: MonthAcc, kind: SectionKind, sectionTitle: string, name: string, cents: number): void {
  (acc.raw[sectionTitle] ??= {})[name] = cents / 100;
  if (cents !== 0) acc.touched = true;
  const n = norm(name);
  const r = acc.row;
  if (kind === "income") {
    if (n.includes("sales-tablex")) r.income_cents += cents;
    else if (n.includes("freight income")) r.freight_income_cents += cents;
    else r.other_income_cents += cents;
  } else if (kind === "cogs") {
    r.cogs_cents += cents;
  } else {
    r.total_expenses_cents += cents;
    if (n.includes("spiff")) r.spiff_cents += cents;
    else if (n.includes("commissions expense") || n.startsWith("comm exp")) r.commissions_cents += cents;
    else if (n === "freight") r.freight_expense_cents += cents;
    else if (n === "advertising") r.advertising_cents += cents;
  }
}

function parseYear(rows: XeroReportRow[], year: number): MonthAcc[] {
  const header = rows.find((r) => r.RowType === "Header");
  const headerCells = header?.Cells ?? [];

  // column index (1-based within Cells) → month index 0-11 for `year`
  const colMonth = new Map<number, number>();
  for (let c = 1; c < headerCells.length; c++) {
    const parsed = parseHeaderMonth(headerCells[c]?.Value);
    if (parsed) {
      if (parsed.year === year) colMonth.set(c, parsed.month);
      else console.warn(`[pl] ${year}: column ${c} header "${headerCells[c]?.Value}" is outside the year — ignored`);
    } else if (c <= 12) {
      colMonth.set(c, 12 - c); // fallback: descending Dec..Jan
      console.warn(`[pl] ${year}: column ${c} header "${headerCells[c]?.Value ?? ""}" unparsed — assumed ${MONTHS[12 - c]}`);
    }
  }

  const months = MONTHS.map((_, i) => emptyMonth(`${year}-${String(i + 1).padStart(2, "0")}-01`));

  for (const section of rows) {
    if (section.RowType !== "Section") continue;
    const kind = classifySection(section.Title);
    if (!kind) continue;
    const title = section.Title ?? kind;
    for (const row of section.Rows ?? []) {
      if (row.RowType !== "Row") continue;
      const cells = row.Cells ?? [];
      const name = cells[0]?.Value?.trim();
      if (!name) continue;
      for (const [col, month] of colMonth) {
        applyAccount(months[month], kind, title, name, amountCents(cells[col]?.Value));
      }
    }
  }
  return months;
}

const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

async function main(): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { auth, tokens } = await getAuthorizedSession(supabase);

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthStart = `${currentYear}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const years = ONLY_YEAR
    ? [ONLY_YEAR]
    : Array.from({ length: currentYear - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);

  console.log(`[pl] ${tokens.tenant_name ?? tokens.tenant_id} — ${DRY_RUN ? "DRY RUN" : "WRITE"} — years ${years.join(", ")}`);

  const out: MonthAcc[] = [];
  for (const year of years) {
    const path =
      `/Reports/ProfitAndLoss?fromDate=${year}-12-01&toDate=${year}-12-31` +
      `&timeframe=MONTH&periods=11&standardLayout=true`;
    const body = await xeroGet<XeroReportsResponse>(auth, path);
    const report = body.Reports?.[0];
    if (!report?.Rows) {
      console.warn(`[pl] ${year}: empty report`);
      continue;
    }
    const months = parseYear(report.Rows, year).filter(
      (m) => m.row.month <= currentMonthStart && m.touched,
    );
    console.log(`[pl] ${year}: ${months.length} month(s) with activity`);
    out.push(...months);
  }

  // ---- table ----
  const cols: [string, keyof FinPlMonthlyRow][] = [
    ["income", "income_cents"],
    ["frt inc", "freight_income_cents"],
    ["oth inc", "other_income_cents"],
    ["cogs", "cogs_cents"],
    ["comm", "commissions_cents"],
    ["spiff", "spiff_cents"],
    ["frt exp", "freight_expense_cents"],
    ["advert", "advertising_cents"],
    ["tot exp", "total_expenses_cents"],
  ];
  console.log(["month     ", ...cols.map(([h]) => h.padStart(13))].join(""));
  for (const m of out) {
    console.log([m.row.month.slice(0, 7).padEnd(10), ...cols.map(([, k]) => usd(m.row[k] as number).padStart(13))].join(""));
  }

  // ---- checks ----
  const sumIncome = (pred: (month: string) => boolean) =>
    out.filter((m) => pred(m.row.month)).reduce((s, m) => s + m.row.income_cents, 0);
  const y2025 = sumIncome((d) => d.startsWith("2025-"));
  const y2026AprOct = sumIncome((d) => d >= "2026-04-01" && d <= "2026-10-01");
  if (years.includes(2025)) {
    console.log(`\nCheck 2025 SALES-TablEx: ${usd(y2025)} (${y2025}) vs expected ${CHECK_2025_INCOME} → ${y2025 === CHECK_2025_INCOME ? "MATCH" : `DIFF ${y2025 - CHECK_2025_INCOME}`}`);
  }
  if (years.includes(2026)) {
    console.log(`Check 2026 Apr–Oct SALES-TablEx: ${usd(y2026AprOct)} vs ≈ ${usd(CHECK_2026_APR_OCT_INCOME)} (diff ${usd(y2026AprOct - CHECK_2026_APR_OCT_INCOME)}; Oct is month-to-date)`);
  }

  if (DRY_RUN) {
    console.log("\nDRY RUN — nothing written (beyond any rotated Xero token).");
    return;
  }

  const importedAt = new Date().toISOString();
  const rows = out.map((m) => ({ ...m.row, raw: m.raw, imported_at: importedAt }));
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from("fin_pl_monthly").upsert(rows.slice(i, i + 100), { onConflict: "month" });
    if (error) throw new Error(`fin_pl_monthly upsert: ${error.message}`);
  }

  const monthsSorted = out.map((m) => m.row.month).sort();
  const last = monthsSorted[monthsSorted.length - 1];
  const { error: srcErr } = await supabase.from("fin_sources").upsert(
    {
      source: "xero_pl",
      last_synced_at: importedAt,
      coverage_from: monthsSorted[0] ?? null,
      coverage_to: last ? lastDayOfMonth(Number(last.slice(0, 4)), Number(last.slice(5, 7))) : null,
      row_count: rows.length,
      notes: `years ${years.join(",")}; 2025 SALES-TablEx ${usd(y2025)}; 2026 Apr–Oct ${usd(y2026AprOct)}`,
    },
    { onConflict: "source" },
  );
  if (srcErr) throw new Error(`fin_sources upsert: ${srcErr.message}`);
  console.log(`\n[pl] upserted ${rows.length} month(s) into fin_pl_monthly`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
