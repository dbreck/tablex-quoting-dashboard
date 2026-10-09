/**
 * Pull ACCREC invoices (with line items) from Xero into fin_customers / fin_invoices /
 * fin_invoice_lines. Incremental by default via the If-Modified-Since watermark stored
 * in fin_xero_tokens.last_modified_since.
 *
 * Usage:
 *   npx tsx scripts/fin/xero-pull.ts --dry-run --pages 1     # smoke: fetch one page, write nothing
 *   npx tsx scripts/fin/xero-pull.ts --full                  # ignore the watermark, pull everything
 *   npx tsx scripts/fin/xero-pull.ts                         # incremental (modified since last run)
 *   npx tsx scripts/fin/xero-pull.ts --since 2025-01-01      # only invoices dated on/after
 *   npx tsx scripts/fin/xero-pull.ts --page-size 1000        # 100 (default) or 1000
 *
 * The watermark advances only after a COMPLETE, non-dry run without --pages or --since
 * (a partial run would otherwise skip what it never fetched). It is set to run start
 * minus 5 minutes; re-pulling the overlap is harmless because every write is an upsert.
 *
 * Dry runs still persist a rotated refresh token if one is needed — the old token dies
 * on refresh, so that write is not optional.
 */
import { join } from "path";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  xeroGet,
  XeroApiError,
  type XeroInvoice,
  type XeroInvoicesResponse,
} from "../../src/lib/fin/xero/client";
import { getAuthorizedSession, setWatermark } from "../../src/lib/fin/xero/token-store";
import {
  parseXeroDate,
  parseXeroDateTime,
  toIfModifiedSince,
  xeroWhereDateTime,
} from "../../src/lib/fin/xero/dates";
import { parseInvoiceLine } from "../../src/lib/fin/parse-line";
import {
  normalizeCompany,
  PARSER_VERSION,
  toCents,
  type FinInvoiceLineRow,
  type ParseConfidence,
} from "../../src/lib/fin/types";

config({ path: join(__dirname, "..", "..", ".env.local") });

// ---------- CLI ----------

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const DRY_RUN = process.argv.includes("--dry-run");
const FULL = process.argv.includes("--full");
const PAGES_LIMIT = argValue("--pages") ? Number(argValue("--pages")) : null;
const PAGE_SIZE = argValue("--page-size") ? Number(argValue("--page-size")) : 100;
const SINCE = argValue("--since") ?? null;
const BATCH = 100;
const WATERMARK_OVERLAP_MS = 5 * 60 * 1000;

if (PAGE_SIZE !== 100 && PAGE_SIZE !== 1000) {
  console.error("--page-size must be 100 or 1000");
  process.exit(1);
}
if (PAGES_LIMIT !== null && (!Number.isInteger(PAGES_LIMIT) || PAGES_LIMIT < 1)) {
  console.error("--pages must be a positive integer");
  process.exit(1);
}
if (SINCE !== null && !/^\d{4}-\d{2}-\d{2}$/.test(SINCE)) {
  console.error("--since must be YYYY-MM-DD");
  process.exit(1);
}

// ---------- Row building (pure) ----------

type LineInsert = Omit<FinInvoiceLineRow, "id" | "invoice_id">;

interface BuiltInvoice {
  xeroInvoiceId: string;
  contactId: string | null;
  contactName: string | null;
  invoice: {
    source: "xero";
    xero_invoice_id: string;
    number: string;
    reference: string | null;
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
    raw: Record<string, unknown>;
    imported_at: string;
  };
  lines: LineInsert[];
}

const nullIfBlank = (v: string | undefined | null): string | null => {
  const t = v?.trim();
  return t ? t : null;
};

function buildInvoice(inv: XeroInvoice, importedAt: string): BuiltInvoice | null {
  const issuedOn = parseXeroDate(inv.DateString ?? inv.Date);
  if (!issuedOn) {
    console.warn(`[pull] skipping invoice ${inv.InvoiceNumber ?? inv.InvoiceID}: no date`);
    return null;
  }
  const reference = nullIfBlank(inv.Reference);

  const lines: LineInsert[] = (inv.LineItems ?? []).map((li, idx) => {
    const parsed = parseInvoiceLine({
      description: nullIfBlank(li.Description),
      itemCode: nullIfBlank(li.ItemCode),
      accountCode: nullIfBlank(li.AccountCode),
      qty: li.Quantity ?? null,
      unitAmount: li.UnitAmount ?? null,
      lineAmount: li.LineAmount ?? null,
      invoiceReference: reference,
    });
    return {
      position: idx,
      xero_line_id: li.LineItemID ?? null,
      description: nullIfBlank(li.Description),
      item_code: nullIfBlank(li.ItemCode),
      account_code: nullIfBlank(li.AccountCode),
      qty: li.Quantity ?? null,
      unit_cents: li.UnitAmount != null ? toCents(li.UnitAmount) : null,
      amount_cents: toCents(li.LineAmount),
      ...parsed,
      parser_version: PARSER_VERSION,
    };
  });

  const raw: Record<string, unknown> = { ...inv };
  delete raw.LineItems;

  return {
    xeroInvoiceId: inv.InvoiceID,
    contactId: inv.Contact?.ContactID ?? null,
    contactName: nullIfBlank(inv.Contact?.Name),
    invoice: {
      source: "xero",
      xero_invoice_id: inv.InvoiceID,
      number: nullIfBlank(inv.InvoiceNumber) ?? inv.InvoiceID,
      reference,
      status: inv.Status,
      issued_on: issuedOn,
      due_on: parseXeroDate(inv.DueDateString ?? inv.DueDate),
      paid_on: parseXeroDate(inv.FullyPaidOnDate),
      subtotal_cents: toCents(inv.SubTotal),
      tax_cents: toCents(inv.TotalTax),
      total_cents: toCents(inv.Total),
      amount_paid_cents: inv.AmountPaid != null ? toCents(inv.AmountPaid) : null,
      amount_due_cents: inv.AmountDue != null ? toCents(inv.AmountDue) : null,
      currency: inv.CurrencyCode ?? "USD",
      line_count: lines.length,
      has_special: lines.some((l) => l.is_special),
      xero_updated_at: parseXeroDateTime(inv.UpdatedDateUTC),
      raw,
      imported_at: importedAt,
    },
    lines,
  };
}

// ---------- Writes ----------

function chunks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const minDate = (a: string | null, b: string | null) => (!a ? b : !b ? a : a < b ? a : b);
const maxDate = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b);

async function upsertCustomers(sb: SupabaseClient, built: BuiltInvoice[]): Promise<Map<string, string>> {
  const byContact = new Map<string, { name: string; first: string | null; last: string | null }>();
  for (const b of built) {
    if (!b.contactId) continue;
    const cur = byContact.get(b.contactId) ?? { name: b.contactName ?? b.contactId, first: null, last: null };
    if (b.contactName) cur.name = b.contactName;
    if (b.invoice.status !== "VOIDED") {
      cur.first = minDate(cur.first, b.invoice.issued_on);
      cur.last = maxDate(cur.last, b.invoice.issued_on);
    }
    byContact.set(b.contactId, cur);
  }

  const ids = [...byContact.keys()];
  const idMap = new Map<string, string>();
  for (const part of chunks(ids, BATCH)) {
    const { data: existing, error: readErr } = await sb
      .from("fin_customers")
      .select("xero_contact_id, first_invoice_on, last_invoice_on")
      .in("xero_contact_id", part);
    if (readErr) throw new Error(`fin_customers read: ${readErr.message}`);
    const prior = new Map(
      ((existing ?? []) as { xero_contact_id: string; first_invoice_on: string | null; last_invoice_on: string | null }[])
        .map((r) => [r.xero_contact_id, r]),
    );

    const now = new Date().toISOString();
    const rows = part.map((cid) => {
      const c = byContact.get(cid)!;
      const p = prior.get(cid);
      return {
        xero_contact_id: cid,
        name: c.name,
        normalized_name: normalizeCompany(c.name),
        first_invoice_on: minDate(p?.first_invoice_on ?? null, c.first),
        last_invoice_on: maxDate(p?.last_invoice_on ?? null, c.last),
        updated_at: now,
      };
    });
    const { data, error } = await sb
      .from("fin_customers")
      .upsert(rows, { onConflict: "xero_contact_id" })
      .select("id, xero_contact_id");
    if (error) throw new Error(`fin_customers upsert: ${error.message}`);
    for (const r of (data ?? []) as { id: string; xero_contact_id: string }[]) idMap.set(r.xero_contact_id, r.id);
  }
  return idMap;
}

async function writePage(sb: SupabaseClient, built: BuiltInvoice[]): Promise<void> {
  if (built.length === 0) return;
  const customerIds = await upsertCustomers(sb, built);

  const invoiceIds = new Map<string, string>();
  for (const part of chunks(built, BATCH)) {
    const rows = part.map((b) => ({
      ...b.invoice,
      customer_id: b.contactId ? customerIds.get(b.contactId) ?? null : null,
    }));
    const { data, error } = await sb
      .from("fin_invoices")
      .upsert(rows, { onConflict: "xero_invoice_id" })
      .select("id, xero_invoice_id");
    if (error) throw new Error(`fin_invoices upsert: ${error.message}`);
    for (const r of (data ?? []) as { id: string; xero_invoice_id: string }[]) invoiceIds.set(r.xero_invoice_id, r.id);
  }

  // Replace lines: delete then insert. A crash in between leaves an invoice without
  // lines; the watermark has not advanced, so the next run re-pulls it.
  const ids = built.map((b) => invoiceIds.get(b.xeroInvoiceId)).filter((v): v is string => !!v);
  for (const part of chunks(ids, BATCH)) {
    const { error } = await sb.from("fin_invoice_lines").delete().in("invoice_id", part);
    if (error) throw new Error(`fin_invoice_lines delete: ${error.message}`);
  }
  const lineRows = built.flatMap((b) => {
    const invoiceId = invoiceIds.get(b.xeroInvoiceId);
    if (!invoiceId) throw new Error(`No fin_invoices id returned for ${b.xeroInvoiceId}`);
    return b.lines.map((l) => ({ ...l, invoice_id: invoiceId }));
  });
  for (const part of chunks(lineRows, BATCH)) {
    const { error } = await sb.from("fin_invoice_lines").insert(part);
    if (error) throw new Error(`fin_invoice_lines insert: ${error.message}`);
  }
}

async function countWhere(sb: SupabaseClient, status?: string): Promise<number> {
  let q = sb.from("fin_invoices").select("id", { count: "exact", head: true });
  if (status) q = q.eq("status", status);
  const { count, error } = await q;
  if (error) throw new Error(`fin_invoices count: ${error.message}`);
  return count ?? 0;
}

async function edgeIssuedOn(sb: SupabaseClient, ascending: boolean): Promise<string | null> {
  const { data, error } = await sb
    .from("fin_invoices")
    .select("issued_on")
    .order("issued_on", { ascending })
    .limit(1);
  if (error) throw new Error(`fin_invoices edge: ${error.message}`);
  return ((data ?? []) as { issued_on: string }[])[0]?.issued_on ?? null;
}

async function updateSource(sb: SupabaseClient, runNote: string): Promise<void> {
  const [total, authorised, paid, voided, from, to] = await Promise.all([
    countWhere(sb),
    countWhere(sb, "AUTHORISED"),
    countWhere(sb, "PAID"),
    countWhere(sb, "VOIDED"),
    edgeIssuedOn(sb, true),
    edgeIssuedOn(sb, false),
  ]);
  const { error } = await sb.from("fin_sources").upsert(
    {
      source: "xero",
      last_synced_at: new Date().toISOString(),
      coverage_from: from,
      coverage_to: to,
      row_count: total,
      notes: `statuses AUTHORISED=${authorised} PAID=${paid} VOIDED=${voided}; last run: ${runNote}`,
    },
    { onConflict: "source" },
  );
  if (error) throw new Error(`fin_sources upsert: ${error.message}`);
}

// ---------- Main ----------

const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

async function main(): Promise<void> {
  const runStart = new Date();
  const importedAt = runStart.toISOString();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { auth, tokens } = await getAuthorizedSession(supabase);
  const watermark = FULL ? null : tokens.last_modified_since;
  const where = `Type=="ACCREC"` + (SINCE ? ` AND Date>=${xeroWhereDateTime(SINCE)}` : "");
  const headers: Record<string, string> = watermark ? { "If-Modified-Since": toIfModifiedSince(watermark) } : {};

  const mode = [
    DRY_RUN ? "DRY RUN" : "WRITE",
    watermark ? `modified since ${toIfModifiedSince(watermark)}Z` : "full",
    SINCE ? `dated >= ${SINCE}` : null,
    PAGES_LIMIT ? `max ${PAGES_LIMIT} page(s)` : null,
    `pageSize ${PAGE_SIZE}`,
  ].filter(Boolean).join(" · ");
  console.log(`[pull] ${tokens.tenant_name ?? tokens.tenant_id} — ${mode}`);

  const statusCounts: Record<string, number> = {};
  const confidence: Record<ParseConfidence, number> = { high: 0, medium: 0, low: 0, none: 0 };
  let pages = 0;
  let invoices = 0;
  let lines = 0;
  let skipped = 0;
  let paidCents = 0;
  let minIssued: string | null = null;
  let maxIssued: string | null = null;
  let truncated = false;

  for (let page = 1; ; page++) {
    if (PAGES_LIMIT !== null && page > PAGES_LIMIT) {
      truncated = true;
      break;
    }
    const path =
      `/Invoices?where=${encodeURIComponent(where)}` +
      `&Statuses=AUTHORISED,PAID,VOIDED&page=${page}&pageSize=${PAGE_SIZE}&unitdp=4`;

    let batch: XeroInvoice[];
    try {
      const body = await xeroGet<XeroInvoicesResponse>(auth, path, { headers });
      batch = body.Invoices ?? [];
    } catch (err) {
      if (err instanceof XeroApiError && err.status === 304) batch = [];
      else throw err;
    }
    pages++;

    const built = batch
      .map((inv) => buildInvoice(inv, importedAt))
      .filter((b): b is BuiltInvoice => b !== null);
    skipped += batch.length - built.length;

    for (const b of built) {
      invoices++;
      statusCounts[b.invoice.status] = (statusCounts[b.invoice.status] ?? 0) + 1;
      if (b.invoice.status === "PAID") paidCents += b.invoice.total_cents;
      minIssued = minDate(minIssued, b.invoice.issued_on);
      maxIssued = maxDate(maxIssued, b.invoice.issued_on);
      for (const l of b.lines) {
        lines++;
        confidence[l.parse_confidence]++;
      }
    }

    if (!DRY_RUN) await writePage(supabase, built);
    console.log(`[pull] page ${page}: ${batch.length} invoice(s)${DRY_RUN ? "" : " written"}`);

    if (batch.length < PAGE_SIZE) break;
  }

  const runNote = `${importedAt} ${mode}: ${invoices} invoice(s), ${lines} line(s)`;
  if (!DRY_RUN) {
    await updateSource(supabase, runNote);
    if (!truncated && !SINCE) {
      const mark = new Date(runStart.getTime() - WATERMARK_OVERLAP_MS).toISOString();
      await setWatermark(supabase, mark);
      console.log(`[pull] watermark → ${mark}`);
    } else {
      console.log("[pull] watermark NOT advanced (partial run: --pages or --since)");
    }
  }

  console.log("\n===== Xero pull summary =====");
  console.log(`Mode:            ${mode}`);
  console.log(`Pages:           ${pages}${truncated ? " (stopped by --pages)" : ""}`);
  console.log(`Invoices:        ${invoices}${skipped ? ` (+${skipped} skipped, no date)` : ""}`);
  for (const [s, n] of Object.entries(statusCounts).sort()) console.log(`  ${s.padEnd(13)}  ${n}`);
  console.log(`Lines:           ${lines}`);
  console.log("Parse confidence:");
  for (const k of ["high", "medium", "low", "none"] as const) {
    const pct = lines ? ((confidence[k] / lines) * 100).toFixed(1) : "0.0";
    console.log(`  ${k.padEnd(13)}  ${String(confidence[k]).padStart(6)}  ${pct}%`);
  }
  console.log(`Issued range:    ${minIssued ?? "-"} → ${maxIssued ?? "-"}`);
  console.log(`PAID total:      ${usd(paidCents)} (${paidCents} cents)`);
  if (DRY_RUN) console.log("\nDRY RUN — nothing written (beyond any rotated Xero token).");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
