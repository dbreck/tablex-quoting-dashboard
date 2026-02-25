/**
 * Link quote requests (GF web form data) to historical quotes (from the queue)
 * by matching on company name + date proximity + contact name.
 *
 * Matching algorithm:
 *   1. Normalize company names using KNOWN_ALIASES
 *   2. Find quotes with matching normalized company within -2..+14 days of request
 *   3. Score candidates (date proximity + name match + formal quote bonus)
 *   4. Pick highest-scoring match (1:1, earlier requests get priority)
 *   5. Write bidirectional FKs: quotes.quote_request_id ↔ quote_requests.quote_id
 *
 * Usage:
 *   npx tsx scripts/link-requests-to-quotes.ts            # execute
 *   npx tsx scripts/link-requests-to-quotes.ts --dry-run   # preview only
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

interface QuoteRequest {
  id: string;
  request_number: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_company: string | null;
  created_at: string;
  quote_id: string | null;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_name: string | null;
  customer_company: string | null;
  created_at: string;
  quote_request_id: string | null;
}

// ---------- Known Aliases (copied from seed-crm-data.ts) ----------

const KNOWN_ALIASES: Record<string, string> = {
  // Typos
  "Continential Office": "Continental Office",
  "Continental Officel": "Continental Office",
  "Business Furnshings": "Business Furnishings",
  "Business Furnishing": "Business Furnishings",
  "Michingan Office Environments": "Michigan Office Environments",
  "McGee Desginhouse": "McGee Designhouse",
  "Office Products Marketiing": "Office Products Marketing",
  "Frank Cooney Compnay": "Frank Cooney",
  "Friends Officed": "Friends Office",
  "Officeworsk": "OfficeWorks",
  "Worksapce Solutions": "Workspace Solutions",
  "MFG Inieriors": "MFG Interiors",
  "Price Moderm": "Price Modern",
  "Midwest Educational Furnishishings": "Midwest Educational Furnishings",
  "Furniture Resourse Group": "Furniture Resource Group",
  "Faurniture Resource Group": "Furniture Resource Group",
  // Suffixes / variant names
  "Mid-States Reps": "Mid-States Rep",
  "Webb Contract Associates": "Webb Contract",
  "Webb Contract Assoc.": "Webb Contract",
  "Ace Office Furniture Associates": "Ace Office Furniture",
  "NBS Commercial Interiors": "NBS",
  "Frank Cooney Company": "Frank Cooney",
  "Frank Cooney Co.": "Frank Cooney",
  "Frank Cooney Co": "Frank Cooney",
  "CFM": "CFM - Contract Furniture Marketing",
  "FriendsOffice": "Friends Office",
  "Friend's Office": "Friends Office",
  "Commercial Office Environments": "Commercial Office Environments",
  "Comercial Office Environments": "Commercial Office Environments",
  "Douron Inc": "Douron",
  "Douron Inc.": "Douron",
  "Henricksen Inc": "Henricksen",
  "Indoff Inc": "Indoff",
  "OPM - Office Products Marketing": "Office Products Marketing",
  "OPM": "Office Products Marketing",
  "Melissa Meeks & Associates": "Melissa J. Meeks and Associates",
  "Zimmerman Sales and Installation": "Zimmerman School Equipment",
  "ID + A (Nashville Location)": "ID+A",
  "Nashville Office Interiors (NOI)": "Nashville Office Interiors",
  "NOI Chattanooga": "Nashville Office Interiors",
  "CBI-TN": "CBI",
  "CBI Nashville": "CBI",
  "C.L.G.": "Cool Lines Group",
};

// ---------- Normalization ----------

/** Normalize a name for comparison: lowercase, strip punctuation, collapse whitespace */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Apply known aliases then normalize for matching */
function resolveAndNormalize(raw: string | null): string {
  if (!raw || !raw.trim()) return "";
  let name = raw.trim();

  // Exact alias match
  if (KNOWN_ALIASES[name]) name = KNOWN_ALIASES[name];

  // Strip trailing notes after " // "
  if (name.includes(" // ")) {
    name = name.split(" // ")[0].trim();
  }

  // Strip trailing notes in parentheses
  name = name.replace(/\s*\((?!DBA|Inc|LLC|Corp)[^)]*\)\s*$/, "").trim();

  // Re-apply aliases after cleaning
  if (KNOWN_ALIASES[name]) name = KNOWN_ALIASES[name];

  return normalize(name);
}

// ---------- Helpers ----------

const FORMAL_RE = /^\d{2}\.\w+\.\d+/;

/** Paginated fetch from a Supabase table */
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
    if (orderBy) {
      query = query.order(orderBy, { ascending: true });
    }
    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

/** Batch update rows in a Supabase table */
async function batchUpdate(
  table: string,
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

    // Supabase doesn't have a batch update, so we do individual updates
    // but group them into Promise.all batches for throughput
    const promises = batch.map(({ id, data }) =>
      supabase.from(table).update(data).eq("id", id)
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
  console.log("=== Link Quote Requests to Quotes ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  // ── Phase 1: Load data ──
  console.log("Phase 1: Loading data...");

  const quoteRequests = await fetchAll<QuoteRequest>(
    "quote_requests",
    "id, request_number, contact_first_name, contact_last_name, contact_company, created_at, quote_id",
    "created_at"
  );
  console.log(`  Quote requests: ${quoteRequests.length}`);

  const quotes = await fetchAll<Quote>(
    "quotes",
    "id, quote_number, customer_name, customer_company, created_at, quote_request_id",
    "created_at"
  );
  console.log(`  Quotes: ${quotes.length}`);

  // Count already linked
  const alreadyLinkedRequests = quoteRequests.filter((r) => r.quote_id !== null).length;
  const alreadyLinkedQuotes = quotes.filter((q) => q.quote_request_id !== null).length;
  console.log(`  Already linked requests: ${alreadyLinkedRequests}`);
  console.log(`  Already linked quotes: ${alreadyLinkedQuotes}`);

  // ── Phase 2: Build index of quotes by normalized company ──
  console.log("\nPhase 2: Matching...");

  // Index quotes by normalized company name for fast lookup
  const quotesByCompany = new Map<string, Quote[]>();
  for (const q of quotes) {
    const normCompany = resolveAndNormalize(q.customer_company);
    if (!normCompany) continue;
    if (!quotesByCompany.has(normCompany)) {
      quotesByCompany.set(normCompany, []);
    }
    quotesByCompany.get(normCompany)!.push(q);
  }

  // Track claimed quote IDs (1:1 matching)
  const claimedQuoteIds = new Set<string>();

  // Pre-populate claimed set with already-linked quotes
  for (const q of quotes) {
    if (q.quote_request_id !== null) {
      claimedQuoteIds.add(q.id);
    }
  }

  // Pre-populate claimed set with already-linked requests
  const alreadyLinkedRequestIds = new Set<string>();
  for (const r of quoteRequests) {
    if (r.quote_id !== null) {
      alreadyLinkedRequestIds.add(r.id);
      claimedQuoteIds.add(r.quote_id);
    }
  }

  // Process requests chronologically (already sorted by created_at)
  const matches: { requestId: string; quoteId: string }[] = [];
  let unmatchedCount = 0;
  let skippedAlreadyLinked = 0;

  for (const req of quoteRequests) {
    // Skip if already linked
    if (alreadyLinkedRequestIds.has(req.id)) {
      skippedAlreadyLinked++;
      continue;
    }

    const reqCompany = resolveAndNormalize(req.contact_company);
    if (!reqCompany) {
      unmatchedCount++;
      continue;
    }

    // Find candidate quotes with matching company
    const candidates = quotesByCompany.get(reqCompany);
    if (!candidates || candidates.length === 0) {
      unmatchedCount++;
      continue;
    }

    const reqDate = new Date(req.created_at);
    let bestScore = -Infinity;
    let bestQuote: Quote | null = null;

    for (const q of candidates) {
      // Skip already claimed
      if (claimedQuoteIds.has(q.id)) continue;

      // Date proximity filter: -2 to +14 days
      const qDate = new Date(q.created_at);
      const daysDiff = (qDate.getTime() - reqDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff < -2 || daysDiff > 14) continue;

      // Score: date proximity
      let score = 14 - Math.abs(daysDiff);

      // Name match bonus
      if (req.contact_last_name && q.customer_name) {
        const reqLastName = req.contact_last_name.toLowerCase();
        const quoteName = q.customer_name.toLowerCase();
        if (reqLastName && quoteName.includes(reqLastName)) {
          score += 10;
        }
      }

      // Formal quote number bonus
      if (FORMAL_RE.test(q.quote_number)) {
        score += 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestQuote = q;
      }
    }

    if (bestQuote) {
      matches.push({ requestId: req.id, quoteId: bestQuote.id });
      claimedQuoteIds.add(bestQuote.id);
    } else {
      unmatchedCount++;
    }
  }

  console.log(`  Matched: ${matches.length}`);
  console.log(`  Unmatched: ${unmatchedCount}`);
  console.log(`  Skipped (already linked): ${skippedAlreadyLinked}`);

  // ── Phase 3: Update ──
  if (matches.length > 0) {
    console.log("\nPhase 3: Updating...");

    // Build update arrays
    const requestUpdates = matches.map((m) => ({
      id: m.requestId,
      data: { quote_id: m.quoteId },
    }));

    const quoteUpdates = matches.map((m) => ({
      id: m.quoteId,
      data: { quote_request_id: m.requestId },
    }));

    await batchUpdate("quote_requests", requestUpdates, "quote_requests");
    await batchUpdate("quotes", quoteUpdates, "quotes");
  } else {
    console.log("\nPhase 3: Nothing to update.");
  }

  // ── Summary ──
  console.log("\n--- Summary ---");
  console.log(`  Total quote requests: ${quoteRequests.length}`);
  console.log(`  Total quotes: ${quotes.length}`);
  console.log(`  New matches: ${matches.length}`);
  console.log(`  Unmatched requests: ${unmatchedCount}`);
  console.log(`  Previously linked: ${skippedAlreadyLinked}`);
  const matchRate = quoteRequests.length > 0
    ? ((matches.length + skippedAlreadyLinked) / quoteRequests.length * 100).toFixed(1)
    : "0.0";
  console.log(`  Overall match rate: ${matchRate}%`);

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
