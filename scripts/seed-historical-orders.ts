/**
 * Seed the `orders` table with historical PO/SO entries from quote-queue.json.
 *
 * Phases:
 *   1. Load queue data and fetch existing quotes + orders from Supabase
 *   2. Identify PO/SO entries, extract PO and SO numbers, map to quotes
 *   3. Insert into Supabase in batches
 *
 * Usage:
 *   npx tsx scripts/seed-historical-orders.ts            # execute
 *   npx tsx scripts/seed-historical-orders.ts --dry-run   # preview only
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
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

const dataDir = join(__dirname, "..", "src", "data");

// ---------- Types ----------

interface QueueEntry {
  rowNum: number;
  emailFrom: string;
  dateTime: string;
  dateNormalized: string;
  year: number;
  quoteNumber: string;
  dealerProject: string;
  special: boolean | null;
  staff: string;
  status: string;
  statusNormalized: string;
}

interface QuoteRef {
  quoteId: string;
  organizationId: string | null;
}

// ---------- Helpers ----------

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

/** Fetch all quotes from Supabase, paginating past 1000-row limit */
async function fetchAllQuotes(): Promise<
  { id: string; organization_id: string | null; notes: string | null }[]
> {
  const all: { id: string; organization_id: string | null; notes: string | null }[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("quotes")
      .select("id, organization_id, notes")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch quotes: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

/** Fetch all existing order quote_ids to check for idempotency */
async function fetchExistingOrderQuoteIds(): Promise<Set<string>> {
  const all = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("orders")
      .select("quote_id")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      all.add(row.quote_id);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

/** Batch insert rows into a Supabase table */
async function batchInsert(
  table: string,
  rows: Record<string, unknown>[],
  label: string,
  selectCols = "id, order_number"
): Promise<Record<string, unknown>[]> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${rows.length} ${label}`);
    return rows.map(() => ({
      id: `dry-run-${Math.random().toString(36).slice(2)}`,
      order_number: `ORD-XXXX`,
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

// ---------- PO/SO Detection ----------

/** Determine if a queue entry is a PO/SO order */
function isPOSOEntry(quoteNumber: string): boolean {
  if (!quoteNumber || !quoteNumber.trim()) return false;
  const qn = quoteNumber.trim();

  // Contains "PO" (case-insensitive)
  if (/PO/i.test(qn)) return true;

  // Contains "SO" followed by a number — e.g., "SO#11774", "SO 9855"
  if (/SO\s*#?\s*\d/i.test(qn)) return true;

  // Contains "Sales Order"
  if (/Sales Order/i.test(qn)) return true;

  return false;
}

/** Extract SO number from quoteNumber field */
function extractSONumber(quoteNumber: string): string | null {
  if (!quoteNumber) return null;
  // Match SO, Sales Order — followed by optional # and digits (possibly with suffix like -REV A)
  const match = quoteNumber.match(/(?:SO|Sales Order)\s*#?\s*(\d+[\w\-]*)/i);
  return match ? match[1] : null;
}

/** Extract PO number from dealerProject field */
function extractPONumber(dealerProject: string): string | null {
  if (!dealerProject) return null;
  const match = dealerProject.match(/PO\s*#?\s*([A-Z0-9][\w\-\.]*)/i);
  return match ? match[1] : null;
}

// ---------- Date Parsing ----------

/** Build ISO timestamp from year + dateNormalized ("02-10T20:48" -> "2023-02-10T20:48:00Z") */
function buildTimestamp(year: number, dateNormalized: string): string | null {
  if (!dateNormalized || !year) return null;

  const match = dateNormalized.match(/^(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
}

// ---------- Main ----------

async function main() {
  console.log("=== Seed Historical Orders ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  // ── Phase 1: Load data ──
  console.log("Phase 1: Loading data...");

  const queueData = loadJson<QueueEntry[]>("quote-queue.json");
  console.log(`  Queue entries: ${queueData.length}`);

  // Filter to PO/SO entries
  const posoEntries = queueData.filter((e) => isPOSOEntry(e.quoteNumber));
  console.log(`  PO/SO entries: ${posoEntries.length}`);

  // Fetch all quotes and build rowNum -> quote map
  const allQuotes = await fetchAllQuotes();
  console.log(`  Quotes in DB: ${allQuotes.length}`);

  const rowNumToQuote = new Map<number, QuoteRef>();
  const rowNumRegex = /Source: Quote Queue row (\d+)/;
  for (const q of allQuotes) {
    if (!q.notes) continue;
    const match = q.notes.match(rowNumRegex);
    if (match) {
      rowNumToQuote.set(parseInt(match[1], 10), {
        quoteId: q.id,
        organizationId: q.organization_id,
      });
    }
  }
  console.log(`  Quote map entries (rowNum -> quote): ${rowNumToQuote.size}`);

  // Fetch existing orders for idempotency
  const existingOrderQuoteIds = await fetchExistingOrderQuoteIds();
  console.log(`  Existing orders: ${existingOrderQuoteIds.size}`);

  // ── Phase 2: Map PO/SO entries to order rows ──
  console.log("\nPhase 2: Mapping...");

  const orderRows: Record<string, unknown>[] = [];
  let withSO = 0;
  let withPO = 0;
  let quoteMatches = 0;
  let skippedNoQuote = 0;
  let skippedExisting = 0;

  for (const entry of posoEntries) {
    // Look up the linked quote
    const quoteRef = rowNumToQuote.get(entry.rowNum);
    if (!quoteRef) {
      skippedNoQuote++;
      continue;
    }

    // Skip if an order already exists for this quote (idempotency)
    if (existingOrderQuoteIds.has(quoteRef.quoteId)) {
      skippedExisting++;
      continue;
    }

    quoteMatches++;

    // Extract SO number from quoteNumber
    const soNumber = extractSONumber(entry.quoteNumber);
    if (soNumber) withSO++;

    // Extract PO number from dealerProject
    let poNumber = extractPONumber(entry.dealerProject || "");
    // If no PO in dealerProject but quoteNumber is just "PO", set generic marker
    if (!poNumber && /^\s*PO\s*$/i.test(entry.quoteNumber)) {
      poNumber = "PO";
    }
    if (poNumber) withPO++;

    // Build notes
    const noteParts = ["Historical import"];
    if (entry.staff) noteParts.push(`Staff: ${entry.staff}`);
    noteParts.push(`Source: Quote Queue row ${entry.rowNum}`);
    const notes = noteParts.join(" | ");

    // Build timestamp
    const createdAt = buildTimestamp(entry.year, entry.dateNormalized);

    const row: Record<string, unknown> = {
      order_number: "", // let DB trigger auto-generate ORD-NNNN
      quote_id: quoteRef.quoteId,
      organization_id: quoteRef.organizationId,
      status: "completed",
      po_number: poNumber || null,
      sage_sales_order_id: soNumber || null,
      notes,
    };

    // Only set created_at if we have a valid timestamp
    if (createdAt) {
      row.created_at = createdAt;
    }

    orderRows.push(row);
  }

  console.log(`  Orders to create: ${orderRows.length}`);
  console.log(`  With SO number: ${withSO}`);
  console.log(`  With PO number: ${withPO}`);
  console.log(`  Quote matches: ${quoteMatches}`);
  if (skippedNoQuote > 0) console.log(`  Skipped (no quote match): ${skippedNoQuote}`);
  if (skippedExisting > 0) console.log(`  Skipped (order already exists): ${skippedExisting}`);

  // ── Phase 3: Insert ──
  if (orderRows.length > 0) {
    console.log("\nPhase 3: Inserting...");
    await batchInsert("orders", orderRows, "orders");
  } else {
    console.log("\nPhase 3: Nothing to insert.");
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
