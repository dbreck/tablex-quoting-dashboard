/**
 * Seed the `invoices` table with realistic historical invoice data for all existing orders.
 *
 * Phases:
 *   1. Load all orders from Supabase (paginated)
 *   2. Check existing invoices for idempotency (skip orders that already have one)
 *   3. Generate realistic pricing + status for each order, insert in batches
 *
 * Usage:
 *   npx tsx scripts/seed-historical-invoices.ts            # execute
 *   npx tsx scripts/seed-historical-invoices.ts --dry-run   # preview only
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

// ---------- Types ----------

interface Order {
  id: string;
  order_number: string;
  quote_id: string;
  organization_id: string | null;
  po_number: string | null;
  sage_sales_order_id: string | null;
  created_at: string;
}

// ---------- Seeded PRNG ----------

/**
 * Simple seeded PRNG based on a string (order UUID).
 * Uses a 32-bit xorshift variant seeded from the UUID's hex chars.
 * Returns a function that produces floats in [0, 1).
 */
function createSeededRng(seed: string): () => number {
  // Hash the seed string into a 32-bit integer
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  // Ensure non-zero
  if (h === 0) h = 1;

  let state = h >>> 0; // unsigned 32-bit

  return () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

// ---------- Pricing Generation ----------

/**
 * Generate a weighted random quantity (1-8, biased toward 2-4).
 * Distribution weights: 1->5%, 2->25%, 3->30%, 4->20%, 5->10%, 6->5%, 7->3%, 8->2%
 */
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

/**
 * Generate a realistic unit price (net after 50/20 discount).
 * Uses a lognormal-ish distribution centered around $800-$1,200.
 * Range: ~$500 - $3,000
 */
function randomUnitPrice(rng: () => number): number {
  // Box-Muller transform for normal distribution
  const u1 = rng();
  const u2 = rng();
  const normal = Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);

  // Log-normal: mean ~$900, with spread
  // ln(900) ~ 6.8, sigma ~ 0.4 gives nice spread $500-$3000
  const lnPrice = 6.8 + 0.4 * normal;
  const price = Math.exp(lnPrice);

  // Clamp to $500 - $3,000
  return Math.round(Math.max(500, Math.min(3000, price)) * 100) / 100;
}

/**
 * Generate freight as 3-8% of subtotal.
 */
function randomFreight(rng: () => number, subtotal: number): number {
  const pct = 0.03 + rng() * 0.05; // 3% to 8%
  return Math.round(subtotal * pct * 100) / 100;
}

// ---------- Status Distribution ----------

type InvoiceStatus = "paid" | "sent" | "draft" | "overdue";

interface StatusResult {
  status: InvoiceStatus;
  paidDate: string | null;
  paidAmount: number | null;
  paymentMethod: string | null;
  sentAt: string | null;
}

const PAYMENT_METHODS = ["check", "wire", "ach"];

function randomStatus(rng: () => number, createdAt: Date, total: number): StatusResult {
  const r = rng();

  if (r < 0.80) {
    // 80% -> paid
    const daysToPayment = 15 + Math.floor(rng() * 31); // 15-45 days
    const paidDate = new Date(createdAt.getTime() + daysToPayment * 86400000);
    const method = PAYMENT_METHODS[Math.floor(rng() * PAYMENT_METHODS.length)];
    return {
      status: "paid",
      paidDate: paidDate.toISOString().split("T")[0],
      paidAmount: total,
      paymentMethod: method,
      sentAt: new Date(createdAt.getTime() + Math.floor(rng() * 3) * 86400000).toISOString(),
    };
  }

  if (r < 0.90) {
    // 10% -> sent
    const daysToSend = 1 + Math.floor(rng() * 7); // 1-7 days
    return {
      status: "sent",
      paidDate: null,
      paidAmount: null,
      paymentMethod: null,
      sentAt: new Date(createdAt.getTime() + daysToSend * 86400000).toISOString(),
    };
  }

  if (r < 0.95) {
    // 5% -> draft
    return {
      status: "draft",
      paidDate: null,
      paidAmount: null,
      paymentMethod: null,
      sentAt: null,
    };
  }

  // 5% -> overdue
  const daysToSend = 1 + Math.floor(rng() * 5);
  return {
    status: "overdue",
    paidDate: null,
    paidAmount: null,
    paymentMethod: null,
    sentAt: new Date(createdAt.getTime() + daysToSend * 86400000).toISOString(),
  };
}

// ---------- Helpers ----------

/** Fetch all orders from Supabase, paginating past 1000-row limit */
async function fetchAllOrders(): Promise<Order[]> {
  const all: Order[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, quote_id, organization_id, po_number, sage_sales_order_id, created_at")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

/** Fetch all existing invoice order_ids for idempotency */
async function fetchExistingInvoiceOrderIds(): Promise<Set<string>> {
  const all = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("invoices")
      .select("order_id")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      all.add(row.order_id);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

/** Batch insert rows into Supabase */
async function batchInsert(
  table: string,
  rows: Record<string, unknown>[],
  label: string,
  selectCols = "id, invoice_number"
): Promise<Record<string, unknown>[]> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${rows.length} ${label}`);
    return rows.map(() => ({
      id: `dry-run-${Math.random().toString(36).slice(2)}`,
      invoice_number: "INV-XXXX",
    }));
  }

  const results: Record<string, unknown>[] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from(table)
      .insert(batch)
      .select(selectCols);

    if (error) {
      console.error(`  Error inserting ${label} batch at offset ${i}:`, error.message);
      console.error("  Sample row:", JSON.stringify(batch[0]).substring(0, 300));
      throw error;
    }

    results.push(...(data ?? []));
    process.stdout.write(`  ${label}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ${label}: ${results.length} inserted`);
  return results;
}

// ---------- Main ----------

async function main() {
  console.log("=== Seed Historical Invoices ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  // ── Phase 1: Load all orders ──
  console.log("Phase 1: Loading orders from Supabase...");
  const allOrders = await fetchAllOrders();
  console.log(`  Orders loaded: ${allOrders.length}`);

  // ── Phase 2: Check existing invoices for idempotency ──
  console.log("\nPhase 2: Checking existing invoices...");
  const existingInvoiceOrderIds = await fetchExistingInvoiceOrderIds();
  console.log(`  Existing invoices: ${existingInvoiceOrderIds.size}`);

  const ordersToProcess = allOrders.filter((o) => !existingInvoiceOrderIds.has(o.id));
  const skippedExisting = allOrders.length - ordersToProcess.length;
  if (skippedExisting > 0) {
    console.log(`  Skipped (invoice already exists): ${skippedExisting}`);
  }
  console.log(`  Orders needing invoices: ${ordersToProcess.length}`);

  if (ordersToProcess.length === 0) {
    console.log("\nAll orders already have invoices. Nothing to do.");
    console.log("\n=== Done ===");
    return;
  }

  // ── Phase 3: Generate invoice data ──
  console.log("\nPhase 3: Generating invoice data...");

  const invoiceRows: Record<string, unknown>[] = [];
  let totalSubtotal = 0;
  let totalFreight = 0;
  let totalAmount = 0;
  const statusCounts: Record<string, number> = { paid: 0, sent: 0, draft: 0, overdue: 0 };
  const methodCounts: Record<string, number> = { check: 0, wire: 0, ach: 0 };
  let quantitySum = 0;
  let priceSum = 0;

  for (const order of ordersToProcess) {
    const rng = createSeededRng(order.id);

    // Generate pricing
    const quantity = randomQuantity(rng);
    const unitPrice = randomUnitPrice(rng);
    const subtotal = Math.round(quantity * unitPrice * 100) / 100;
    const freight = randomFreight(rng, subtotal);
    const tax = 0; // B2B commercial furniture
    const total = Math.round((subtotal + freight) * 100) / 100;

    // Invoice created_at = order created_at + 0-3 days
    const orderDate = new Date(order.created_at);
    const invoiceDaysAfter = Math.floor(rng() * 4); // 0-3 days
    const invoiceCreatedAt = new Date(orderDate.getTime() + invoiceDaysAfter * 86400000);

    // Due date = invoice created_at + 30 days
    const dueDate = new Date(invoiceCreatedAt.getTime() + 30 * 86400000);

    // Status + payment details
    const statusResult = randomStatus(rng, invoiceCreatedAt, total);

    // Notes
    const notes = `Historical import | Source: Order ${order.order_number}`;

    const row: Record<string, unknown> = {
      invoice_number: "", // DB trigger auto-generates INV-NNNN
      order_id: order.id,
      organization_id: order.organization_id,
      subtotal,
      freight,
      tax,
      total,
      status: statusResult.status,
      due_date: dueDate.toISOString().split("T")[0],
      notes,
      created_at: invoiceCreatedAt.toISOString(),
    };

    // Conditionally add payment/sent fields
    if (statusResult.paidDate) row.paid_date = statusResult.paidDate;
    if (statusResult.paidAmount != null) row.paid_amount = statusResult.paidAmount;
    if (statusResult.paymentMethod) row.payment_method = statusResult.paymentMethod;
    if (statusResult.sentAt) row.sent_at = statusResult.sentAt;

    invoiceRows.push(row);

    // Stats
    totalSubtotal += subtotal;
    totalFreight += freight;
    totalAmount += total;
    statusCounts[statusResult.status]++;
    if (statusResult.paymentMethod) methodCounts[statusResult.paymentMethod]++;
    quantitySum += quantity;
    priceSum += unitPrice;
  }

  const avgQuantity = (quantitySum / ordersToProcess.length).toFixed(1);
  const avgUnitPrice = (priceSum / ordersToProcess.length).toFixed(0);
  const avgTotal = (totalAmount / ordersToProcess.length).toFixed(0);

  console.log(`  Invoices generated: ${invoiceRows.length}`);
  console.log(`  Avg quantity: ${avgQuantity} tables/order`);
  console.log(`  Avg unit price: $${avgUnitPrice}`);
  console.log(`  Avg invoice total: $${avgTotal}`);
  console.log(`  Total revenue: $${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`  Total freight: $${totalFreight.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`  Status distribution:`);
  console.log(`    paid:    ${statusCounts.paid} (${((statusCounts.paid / invoiceRows.length) * 100).toFixed(1)}%)`);
  console.log(`    sent:    ${statusCounts.sent} (${((statusCounts.sent / invoiceRows.length) * 100).toFixed(1)}%)`);
  console.log(`    draft:   ${statusCounts.draft} (${((statusCounts.draft / invoiceRows.length) * 100).toFixed(1)}%)`);
  console.log(`    overdue: ${statusCounts.overdue} (${((statusCounts.overdue / invoiceRows.length) * 100).toFixed(1)}%)`);
  console.log(`  Payment methods (of paid):`);
  console.log(`    check: ${methodCounts.check}, wire: ${methodCounts.wire}, ach: ${methodCounts.ach}`);

  // ── Phase 4: Insert ──
  console.log("\nPhase 4: Inserting...");
  const inserted = await batchInsert("invoices", invoiceRows, "invoices");

  // Summary
  if (!DRY_RUN && inserted.length > 0) {
    const firstNum = (inserted[0] as { invoice_number: string }).invoice_number;
    const lastNum = (inserted[inserted.length - 1] as { invoice_number: string }).invoice_number;
    console.log(`  Invoice numbers: ${firstNum} through ${lastNum}`);
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
