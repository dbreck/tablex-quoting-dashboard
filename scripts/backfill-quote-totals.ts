/**
 * Backfill quote subtotals/totals so the dashboard shows real dollar amounts.
 *
 * Strategy:
 *   1. For quotes that have a linked order → invoice, copy the invoice amounts
 *      (keeps quote ↔ invoice chain consistent)
 *   2. For quotes without orders, generate realistic amounts using a seeded PRNG
 *
 * Usage:
 *   npx tsx scripts/backfill-quote-totals.ts            # execute
 *   npx tsx scripts/backfill-quote-totals.ts --dry-run   # preview only
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { join } from "path";
import { config } from "dotenv";

// ---------- Config ----------

config({ path: join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 100;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ---------- Seeded PRNG ----------

function createSeededRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  if (h === 0) h = 1;
  let state = h >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

// ---------- Pricing Generation ----------

function randomQuantity(rng: () => number): number {
  const r = rng();
  if (r < 0.05) return 1;
  if (r < 0.30) return 2;
  if (r < 0.60) return 3;
  if (r < 0.80) return 4;
  if (r < 0.90) return 5;
  if (r < 0.95) return 6;
  if (r < 0.98) return 7;
  return 8;
}

function randomUnitPrice(rng: () => number): number {
  // Lognormal-ish: base in $500-$3,000 range, skewed toward $700-$1,200
  const base = 500 + rng() * 2500;
  const skew = 0.3 + rng() * 0.7; // pull toward lower end
  return Math.round(base * skew * 100) / 100;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------- Paginated Fetch ----------

async function fetchAll<T>(
  table: string,
  select: string,
  orderBy?: string
): Promise<T[]> {
  const all: T[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(select).range(from, from + pageSize - 1);
    if (orderBy) query = query.order(orderBy, { ascending: true });
    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

// ---------- Batch Update ----------

async function batchUpdate(
  updates: { id: string; data: Record<string, unknown> }[],
  label: string
): Promise<number> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would update ${updates.length} ${label}`);
    return updates.length;
  }

  let successCount = 0;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const promises = batch.map(({ id, data }) =>
      supabase.from("quotes").update(data).eq("id", id)
    );
    const results = await Promise.all(promises);
    for (const { error } of results) {
      if (error) {
        console.error(`  Error updating ${label}:`, error.message);
      } else {
        successCount++;
      }
    }
    process.stdout.write(`  ${label}: ${Math.min(i + BATCH_SIZE, updates.length)}/${updates.length}\r`);
  }
  console.log(`  ${label}: ${successCount} updated`);
  return successCount;
}

// ---------- Main ----------

async function main() {
  console.log("=== Backfill Quote Totals ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  // Phase 1: Load quotes (only those with total = 0)
  console.log("Phase 1: Loading data...");

  const allQuotes = await fetchAll<{
    id: string;
    subtotal: number;
    total: number;
  }>("quotes", "id, subtotal, total");
  console.log(`  Total quotes: ${allQuotes.length}`);

  const zeroQuotes = allQuotes.filter((q) => q.total === 0);
  console.log(`  Quotes with total = 0: ${zeroQuotes.length}`);
  console.log(`  Quotes with total > 0: ${allQuotes.length - zeroQuotes.length} (skipped)`);

  if (zeroQuotes.length === 0) {
    console.log("\nAll quotes already have totals. Nothing to do.");
    return;
  }

  // Phase 2: Load orders + invoices for chain matching
  console.log("\nPhase 2: Loading orders & invoices...");

  const orders = await fetchAll<{
    id: string;
    quote_id: string;
  }>("orders", "id, quote_id");
  console.log(`  Orders: ${orders.length}`);

  // Build quote_id → order_id map
  const quoteToOrder = new Map<string, string>();
  for (const o of orders) {
    quoteToOrder.set(o.quote_id, o.id);
  }

  const invoices = await fetchAll<{
    id: string;
    order_id: string;
    subtotal: number;
    freight: number;
    tax: number;
    total: number;
  }>("invoices", "id, order_id, subtotal, freight, tax, total");
  console.log(`  Invoices: ${invoices.length}`);

  // Build order_id → invoice map
  const orderToInvoice = new Map<string, { subtotal: number; freight: number; tax: number; total: number }>();
  for (const inv of invoices) {
    orderToInvoice.set(inv.order_id, {
      subtotal: inv.subtotal,
      freight: inv.freight,
      tax: inv.tax,
      total: inv.total,
    });
  }

  // Phase 3: Generate updates
  console.log("\nPhase 3: Generating quote totals...");

  const updates: { id: string; data: Record<string, unknown> }[] = [];
  let fromInvoice = 0;
  let generated = 0;
  let totalRevenue = 0;

  for (const q of zeroQuotes) {
    const orderId = quoteToOrder.get(q.id);
    const invoice = orderId ? orderToInvoice.get(orderId) : undefined;

    let subtotal: number;
    let freightCost: number;
    let taxAmount: number;
    let total: number;

    if (invoice) {
      // Copy from invoice (keeps chain consistent)
      subtotal = invoice.subtotal;
      freightCost = invoice.freight;
      taxAmount = invoice.tax;
      total = invoice.total;
      fromInvoice++;
    } else {
      // Generate realistic amounts
      const rng = createSeededRng(q.id);
      const qty = randomQuantity(rng);
      const unitPrice = randomUnitPrice(rng);
      subtotal = round2(qty * unitPrice);
      const freightPct = 0.03 + rng() * 0.05; // 3-8%
      freightCost = round2(subtotal * freightPct);
      taxAmount = 0; // B2B
      total = round2(subtotal + freightCost);
      generated++;
    }

    totalRevenue += total;

    updates.push({
      id: q.id,
      data: {
        subtotal,
        freight_cost: freightCost,
        tax_amount: taxAmount,
        total,
      },
    });
  }

  console.log(`  Updates: ${updates.length}`);
  console.log(`  From invoices: ${fromInvoice}`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Total revenue: $${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`  Avg quote: $${(totalRevenue / updates.length).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);

  // Phase 4: Update
  if (updates.length > 0) {
    console.log("\nPhase 4: Updating...");
    await batchUpdate(updates, "quotes");
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
