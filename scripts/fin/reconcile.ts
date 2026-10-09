/**
 * Reconcile fin_invoices against the known Xero figures (9/29 analysis). Read-only.
 *
 * Usage:
 *   npx tsx scripts/fin/reconcile.ts
 *
 * Exit 1 when any count is off by more than 1 %, any dollar sum by more than 0.5 %,
 * the first invoice is not in Aug 2020, or any invoice is dated after 2026-03-31.
 * The Q1-2026 line-class table is informational (parser health), never fails the run.
 */
import { join } from "path";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: join(__dirname, "..", "..", ".env.local") });

const EXPECTED = {
  allTimePaid: { count: 3803, cents: 1_687_457_289 },
  paid2025: { count: 609, cents: 328_552_277 },
  paid2026Q1: { count: 121, cents: 49_883_765 },
  firstInvoiceMonth: "2020-08", // ledger starts 2020-08-31 (verified by the 10/09 full pull; the connector summary said Oct)
  customers: 375,
  rowsAfterCutoff: 0,
  cutoff: "2026-03-31",
} as const;

/** 9/29 report expectations for Q1-2026 line classes (informational). */
const EXPECTED_Q1_LINES = {
  specialWithHeight: 17,
  specialWithoutHeight: 12,
  base: 10,
  top: 9,
  replacement: 8,
} as const;

const COUNT_TOLERANCE = 0.01;
const DOLLAR_TOLERANCE = 0.005;
const PAGE = 1000;

interface InvoiceRow {
  id: string;
  status: string;
  issued_on: string;
  total_cents: number;
  customer_id: string | null;
}

interface LineClassRow {
  is_special: boolean;
  special_height: number | null;
  part_kind: string;
  is_replacement: boolean;
}

async function fetchAllInvoices(sb: SupabaseClient): Promise<InvoiceRow[]> {
  const out: InvoiceRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("fin_invoices")
      .select("id, status, issued_on, total_cents, customer_id")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`fin_invoices read: ${error.message}`);
    const rows = (data ?? []) as InvoiceRow[];
    out.push(...rows.map((r) => ({ ...r, total_cents: Number(r.total_cents) })));
    if (rows.length < PAGE) break;
  }
  return out;
}

async function fetchLinesFor(sb: SupabaseClient, invoiceIds: string[]): Promise<LineClassRow[]> {
  const out: LineClassRow[] = [];
  for (let i = 0; i < invoiceIds.length; i += 150) {
    const part = invoiceIds.slice(i, i + 150);
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb
        .from("fin_invoice_lines")
        .select("is_special, special_height, part_kind, is_replacement")
        .in("invoice_id", part)
        .order("id")
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`fin_invoice_lines read: ${error.message}`);
      const rows = (data ?? []) as LineClassRow[];
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
  }
  return out;
}

const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

let failures = 0;

function check(label: string, ok: boolean, detail: string): void {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(30)} ${detail}`);
}

function checkCount(label: string, actual: number, expected: number): void {
  const off = expected === 0 ? (actual === 0 ? 0 : 1) : Math.abs(actual - expected) / expected;
  check(label, off <= COUNT_TOLERANCE, `${actual} vs ${expected} (${(off * 100).toFixed(2)}% off, limit 1%)`);
}

function checkDollars(label: string, actual: number, expected: number): void {
  const off = Math.abs(actual - expected) / expected;
  check(label, off <= DOLLAR_TOLERANCE, `${usd(actual)} vs ${usd(expected)} (${(off * 100).toFixed(3)}% off, limit 0.5%)`);
}

async function main(): Promise<void> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const invoices = await fetchAllInvoices(sb);
  if (invoices.length === 0) {
    console.error("fin_invoices is empty — run scripts/fin/xero-pull.ts first.");
    process.exit(1);
  }

  const paid = invoices.filter((i) => i.status === "PAID");
  const sum = (rows: InvoiceRow[]) => rows.reduce((s, r) => s + r.total_cents, 0);
  const between = (rows: InvoiceRow[], from: string, to: string) =>
    rows.filter((r) => r.issued_on >= from && r.issued_on <= to);

  // ---- overview ----
  const statusCounts = new Map<string, number>();
  for (const i of invoices) statusCounts.set(i.status, (statusCounts.get(i.status) ?? 0) + 1);
  const dates = invoices.map((i) => i.issued_on).sort();
  const nonVoided = invoices.filter((i) => i.status !== "VOIDED");
  const firstIssued = nonVoided.map((i) => i.issued_on).sort()[0] ?? dates[0];
  const customersAll = new Set(invoices.map((i) => i.customer_id).filter(Boolean)).size;
  const customersPaid = new Set(paid.map((i) => i.customer_id).filter(Boolean)).size;
  const afterCutoff = invoices.filter((i) => i.issued_on > EXPECTED.cutoff).length;

  console.log("===== fin_invoices overview =====");
  console.log(`Invoices: ${invoices.length}  (${[...statusCounts].map(([s, n]) => `${s} ${n}`).join(" · ")})`);
  console.log(`Issued range: ${dates[0]} → ${dates[dates.length - 1]} (first non-voided ${firstIssued})`);
  console.log(`Distinct customers: ${customersAll} (with a PAID invoice: ${customersPaid})`);

  console.log("\nPAID by year:");
  const years = [...new Set(paid.map((p) => p.issued_on.slice(0, 4)))].sort();
  for (const y of years) {
    const rows = paid.filter((p) => p.issued_on.startsWith(y));
    console.log(`  ${y}  ${String(rows.length).padStart(5)}  ${usd(sum(rows)).padStart(16)}`);
  }

  // ---- checks ----
  console.log("\n===== checks =====");
  checkCount("All-time PAID count", paid.length, EXPECTED.allTimePaid.count);
  checkDollars("All-time PAID total", sum(paid), EXPECTED.allTimePaid.cents);
  const p2025 = between(paid, "2025-01-01", "2025-12-31");
  checkCount("2025 PAID count", p2025.length, EXPECTED.paid2025.count);
  checkDollars("2025 PAID total", sum(p2025), EXPECTED.paid2025.cents);
  const pQ1 = between(paid, "2026-01-01", "2026-03-31");
  checkCount("2026 Jan–Mar PAID count", pQ1.length, EXPECTED.paid2026Q1.count);
  checkDollars("2026 Jan–Mar PAID total", sum(pQ1), EXPECTED.paid2026Q1.cents);
  check("First invoice month", (firstIssued ?? "").startsWith(EXPECTED.firstInvoiceMonth), `${firstIssued} vs ${EXPECTED.firstInvoiceMonth}`);
  checkCount("Distinct customers", customersAll, EXPECTED.customers);
  check(`Rows after ${EXPECTED.cutoff}`, afterCutoff === EXPECTED.rowsAfterCutoff, `${afterCutoff} vs 0`);

  // ---- Q1-2026 line classes (informational) ----
  const q1Ids = between(invoices.filter((i) => i.status === "PAID" || i.status === "AUTHORISED"), "2026-01-01", "2026-03-31").map((i) => i.id);
  const lines = await fetchLinesFor(sb, q1Ids);
  const classes = {
    specialWithHeight: lines.filter((l) => l.is_special && l.special_height != null).length,
    specialWithoutHeight: lines.filter((l) => l.is_special && l.special_height == null).length,
    base: lines.filter((l) => l.part_kind === "base").length,
    top: lines.filter((l) => l.part_kind === "top").length,
    replacement: lines.filter((l) => l.is_replacement).length,
  };
  console.log(`\n===== Q1-2026 line classes (${lines.length} lines on ${q1Ids.length} AUTHORISED/PAID invoices; informational) =====`);
  const labels: Record<keyof typeof classes, string> = {
    specialWithHeight: "is_special with special_height",
    specialWithoutHeight: "is_special without height",
    base: "part_kind = base",
    top: "part_kind = top",
    replacement: "is_replacement",
  };
  for (const k of Object.keys(classes) as (keyof typeof classes)[]) {
    console.log(`  ${labels[k].padEnd(32)} ${String(classes[k]).padStart(4)}   (9/29 report: ${EXPECTED_Q1_LINES[k]})`);
  }

  console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
