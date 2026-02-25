/**
 * Seed the `quotes` table with historical data from quote-queue.json (3,595 entries).
 *
 * Phases:
 *   1. Load quote queue data and existing organizations
 *   2. Map queue entries to quote rows (number generation, org matching, date parsing)
 *   3. Deduplicate quote numbers
 *   4. Insert into Supabase in batches
 *   5. Generate reports
 *
 * Usage:
 *   npx tsx scripts/seed-historical-quotes.ts            # execute
 *   npx tsx scripts/seed-historical-quotes.ts --dry-run   # preview only
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
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
const reportDir = join(__dirname, "..", "tmp", "crm-seed-reports");

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

interface DbOrg {
  id: string;
  name: string;
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

// ---------- Helpers ----------

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

/** Fetch all organizations from Supabase, paginating past 1000-row limit */
async function fetchAllOrgs(): Promise<DbOrg[]> {
  const all: DbOrg[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch orgs: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

/** Fetch all existing quote numbers from quotes table */
async function fetchExistingQuoteNumbers(): Promise<Set<string>> {
  const all = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("quotes")
      .select("quote_number")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch quotes: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      all.add(row.quote_number);
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
  selectCols = "id, quote_number"
): Promise<Record<string, unknown>[]> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${rows.length} ${label}`);
    return rows.map((r) => ({
      id: `dry-run-${Math.random().toString(36).slice(2)}`,
      quote_number: r.quote_number as string,
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

// ---------- Quote Number Logic ----------

const FORMAL_RE = /^\d{2}\.\w+\.\d+/;

const NON_FORMAL_VALUES = new Set([
  "email quote",
  "none",
  "email",
  "po",
  "-",
  "email - price list",
  "price list",
  "phone call",
  "no response",
  "never heard back",
  "from the pricer",
]);

/** Determine if a quoteNumber is "formal" (real quote number vs label/status) */
function isFormalQuoteNumber(qn: string): boolean {
  if (!qn || !qn.trim()) return false;
  if (NON_FORMAL_VALUES.has(qn.trim().toLowerCase())) return false;
  // PO / SO entries
  if (/^(?:PO|SO)\s*[/#]?\s*\d*/i.test(qn.trim())) return false;
  // SO#NNNNN
  if (/^SO#?\d+/i.test(qn.trim())) return false;
  return FORMAL_RE.test(qn.trim());
}

// ---------- Dealer/Project Parsing ----------

/** Split dealerProject on first " - " (or " / ") to get company and project */
function parseDealerProject(raw: string): { company: string; project: string | null } {
  if (!raw || !raw.trim()) {
    return { company: "", project: null };
  }

  const str = raw.trim();

  // Primary separator: " - "
  const dashIdx = str.indexOf(" - ");
  if (dashIdx !== -1) {
    return {
      company: str.substring(0, dashIdx).trim(),
      project: str.substring(dashIdx + 3).trim() || null,
    };
  }

  // Secondary separator: " / " (some entries use this instead)
  // Match with optional extra whitespace: company  / project
  const slashMatch = str.match(/^(.+?)\s+\/\s+(.+)$/);
  if (slashMatch) {
    return {
      company: slashMatch[1].trim(),
      project: slashMatch[2].trim() || null,
    };
  }

  return { company: str, project: null };
}

/** Clean and normalize a company name, applying aliases */
function resolveCompanyName(raw: string): string {
  let name = raw.trim();
  if (!name) return "";

  // Exact alias match
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];

  // Strip trailing notes after " // "
  if (name.includes(" // ")) {
    name = name.split(" // ")[0].trim();
  }

  // Strip trailing notes in parentheses
  name = name.replace(/\s*\((?!DBA|Inc|LLC|Corp)[^)]*\)\s*$/, "").trim();

  // Re-apply aliases after cleaning
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];

  return name;
}

// ---------- Date Parsing ----------

/** Build ISO timestamp from year + dateNormalized ("02-10T20:48" → "2023-02-10T20:48:00Z") */
function buildTimestamp(year: number, dateNormalized: string): string | null {
  if (!dateNormalized || !year) return null;

  // dateNormalized format: "MM-DDThh:mm"
  const match = dateNormalized.match(/^(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
}

// ---------- Main ----------

async function main() {
  console.log("=== Seed Historical Quotes ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  // ── Phase 1: Load data ──
  console.log("Phase 1: Loading data...");

  const queueData = loadJson<QueueEntry[]>("quote-queue.json");
  console.log(`  Queue entries: ${queueData.length}`);

  const orgs = await fetchAllOrgs();
  console.log(`  Organizations in DB: ${orgs.length}`);

  const existingQuoteNumbers = await fetchExistingQuoteNumbers();
  console.log(`  Existing quotes in DB: ${existingQuoteNumbers.size}`);

  // Build normalized org name → id map
  const orgByNormalized = new Map<string, { id: string; name: string }>();
  for (const org of orgs) {
    orgByNormalized.set(normalize(org.name), { id: org.id, name: org.name });
  }
  // Also add alias → canonical mappings
  for (const [alias, canonical] of Object.entries(KNOWN_ALIASES)) {
    const normAlias = normalize(alias);
    const normCanonical = normalize(canonical);
    if (orgByNormalized.has(normCanonical) && !orgByNormalized.has(normAlias)) {
      orgByNormalized.set(normAlias, orgByNormalized.get(normCanonical)!);
    }
  }

  // ── Phase 2: Build quote rows ──
  console.log("\nPhase 2: Mapping queue entries to quotes...");

  // Track quote number occurrences for dedup
  const qnCounts = new Map<string, number>();
  const quoteRows: Record<string, unknown>[] = [];
  const unmatchedCompanies = new Map<string, number>();
  let formalCount = 0;
  let generatedCount = 0;
  let orgMatchCount = 0;
  let orgMissCount = 0;
  let skippedExisting = 0;
  let dupeSuffixed = 0;

  // First pass: assign raw quote numbers to detect duplicates
  const rawQuoteNumbers: string[] = [];
  for (const entry of queueData) {
    let qn: string;
    if (isFormalQuoteNumber(entry.quoteNumber)) {
      qn = entry.quoteNumber.trim();
    } else {
      qn = `HQ-${entry.rowNum}`;
    }
    rawQuoteNumbers.push(qn);

    // Count occurrences
    qnCounts.set(qn, (qnCounts.get(qn) ?? 0) + 1);
  }

  // Second pass: build rows with dedup suffixes
  const seenQn = new Map<string, number>(); // track how many times we've emitted each qn

  for (let i = 0; i < queueData.length; i++) {
    const entry = queueData[i];
    let qn = rawQuoteNumbers[i];
    const isFormal = isFormalQuoteNumber(entry.quoteNumber);

    if (isFormal) {
      formalCount++;
    } else {
      generatedCount++;
    }

    // Handle duplicates: append -R2, -R3, etc.
    const totalForThisQn = qnCounts.get(qn) ?? 1;
    const emittedSoFar = seenQn.get(qn) ?? 0;
    seenQn.set(qn, emittedSoFar + 1);

    if (totalForThisQn > 1 && emittedSoFar > 0) {
      qn = `${qn}-R${emittedSoFar + 1}`;
      dupeSuffixed++;
    }

    // Skip if already exists in DB
    if (existingQuoteNumbers.has(qn)) {
      skippedExisting++;
      continue;
    }

    // Parse dealer/project
    const { company: rawCompany, project } = parseDealerProject(entry.dealerProject || "");
    const company = resolveCompanyName(rawCompany);

    // Try to match org
    let organizationId: string | null = null;
    if (company) {
      const normCompany = normalize(company);
      const orgMatch = orgByNormalized.get(normCompany);
      if (orgMatch) {
        organizationId = orgMatch.id;
        orgMatchCount++;
      } else {
        orgMissCount++;
        unmatchedCompanies.set(company, (unmatchedCompanies.get(company) ?? 0) + 1);
      }
    } else {
      orgMissCount++;
    }

    // Build notes
    const noteParts = ["Historical import"];
    if (entry.staff) noteParts.push(`Staff: ${entry.staff}`);
    if (entry.special) noteParts.push("Special");
    noteParts.push(`Source: Quote Queue row ${entry.rowNum}`);
    const notes = noteParts.join(" | ");

    // Build timestamp
    const createdAt = buildTimestamp(entry.year, entry.dateNormalized);

    const row: Record<string, unknown> = {
      quote_number: qn,
      customer_name: entry.emailFrom || null,
      customer_company: company || null,
      project_name: project,
      organization_id: organizationId,
      status: "sent",
      discount_tier: "50_20",
      subtotal: 0,
      additional_discount: 0,
      additional_discount_type: "percentage",
      freight_cost: 0,
      tax_rate: 0,
      tax_amount: 0,
      total: 0,
      notes,
    };

    // Only set created_at if we have a valid timestamp
    if (createdAt) {
      row.created_at = createdAt;
    }

    quoteRows.push(row);
  }

  // ── Phase 3: Summary ──
  console.log(`\n  Total queue entries: ${queueData.length}`);
  console.log(`  Formal quote numbers: ${formalCount}`);
  console.log(`  Generated (HQ-xxx) numbers: ${generatedCount}`);
  console.log(`  Duplicate suffixed (-R2, -R3): ${dupeSuffixed}`);
  console.log(`  Skipped (already in DB): ${skippedExisting}`);
  console.log(`  Quotes to insert: ${quoteRows.length}`);
  console.log(`  Org matches: ${orgMatchCount} (${((orgMatchCount / queueData.length) * 100).toFixed(1)}%)`);
  console.log(`  Org misses: ${orgMissCount}`);
  console.log(`  Unique unmatched companies: ${unmatchedCompanies.size}`);

  // ── Phase 4: Insert ──
  if (quoteRows.length > 0) {
    console.log("\nPhase 3: Inserting quotes...");
    await batchInsert("quotes", quoteRows, "quotes");
  } else {
    console.log("\nPhase 3: Nothing to insert.");
  }

  // ── Phase 5: Reports ──
  console.log("\nPhase 4: Generating reports...");
  mkdirSync(reportDir, { recursive: true });

  // Unmatched companies report — sorted by frequency
  const unmatchedSorted = [...unmatchedCompanies.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const reportPath = join(reportDir, "unmatched-quote-companies.json");
  writeFileSync(reportPath, JSON.stringify(unmatchedSorted, null, 2));
  console.log(`  Wrote ${unmatchedSorted.length} unmatched companies to ${reportPath}`);

  // Print top unmatched
  if (unmatchedSorted.length > 0) {
    console.log("\n  Top 15 unmatched companies:");
    unmatchedSorted.slice(0, 15).forEach(({ name, count }) => {
      console.log(`    ${count}x  ${name}`);
    });
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
