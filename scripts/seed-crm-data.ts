/**
 * Seed the CRM with historical data from dealers.json, rep-groups.json,
 * and gf-quote-requests.json.
 *
 * 5 phases:
 *   1. Fix rep group types (dealer → rep_group)
 *   2. Seed dealer organizations from dealers.json
 *   3. Seed GF-only organizations (companies not already in dealers)
 *   4. Seed contacts from GF data
 *   5. Generate reports
 *
 * Usage:
 *   npx tsx scripts/seed-crm-data.ts            # execute
 *   npx tsx scripts/seed-crm-data.ts --dry-run   # preview only
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

interface DealerEntry {
  name: string;
  quoteCount: number;
  firstSeen: string | null;
  lastSeen: string | null;
  isRepGroup?: boolean;
}

interface GfEntry {
  entryId: number;
  dateCreated: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  // Configuration fields
  baseSeries?: string;
  baseFinish?: string;
  topMaterial?: string;
  topSize?: string;
  hplSelection?: string;
  edgeSelection?: string;
  quantity?: number;
  specialRequests?: string;
  height?: string;
  folding?: string;
  nesting?: string;
  flipTop?: string;
  casterSize?: string;
  footRing?: string;
  chrome?: string;
  adjustableHeight?: string[];
  wireManagement?: string[];
  daisyChainedPower?: string;
  industrialCasters?: string;
  hplMarkerboard?: string;
  radiusCorners?: string;
  grommetLocation?: string;
  powerConfig?: string;
  powerUnitLocation?: string;
  orderDate?: string;
  deliveryDate?: string;
}

interface DbOrg {
  id: string;
  name: string;
  type: string;
  is_seeded: boolean;
}

// ---------- Known alias map ----------
// Maps variant/typo names → canonical names
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
  // Suffixes / variant names from GF vs dealers.json vs rep-groups.json
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

// ---------- Rep group names (from rep-groups.json) ----------
const REP_GROUP_NAMES = [
  "Webb Contract",
  "Ace Office Furniture",
  "CRG",
  "Commercial Interior Advisors",
  "Cool Lines Group",
  "Western Interiors Group",
  "Mid-States Rep",
  "CFM - Contract Furniture Marketing",
  "House acct",
  "IMG South",
  "JMA",
  "Melissa J. Meeks and Associates",
  "The Contract Group Inc.",
];

// ---------- GF junk entries (test submissions, not real companies) ----------
const GF_JUNK_NAMES = new Set([
  "test", "test 2", "testing again", "asdf", "tables",
  "test for fran", "test quote request", "dealer tbd",
  "jigsaw", "jigsaw2", "pizza planet", "schmo furnishings",
  "sbaloansquads", "interior",
]);

// ---------- Junk filters ----------

/** Returns true if the dealer name is junk (not a real company) */
function isJunkDealer(name: string): boolean {
  // Quote numbers like 25.MAF.32625 or 24.SS.12345
  if (/\d{2}\.\w{1,4}\.\d{3,}/.test(name)) return true;

  // Action words at start
  if (/^(Requote|Update to|Changes to|Revision|Rev\.|REVISION)/i.test(name)) return true;

  // Just punctuation or very short noise
  if (/^[\?\!\.\-\s]{1,5}$/.test(name)) return true;

  // Contains "quote" as an action (not part of company name)
  // e.g. "Martin Purblic Seating quote UPDATE" or "Southwest Facility Services quote"
  // But NOT "Quote Source" (legit company)
  if (/\bquote\s+(UPDATE|REVISION|update|revision)\b/i.test(name)) return true;

  // Entries that are clearly notes/instructions, not company names
  if (/\b(sent an email|too lazy to type|straight out of the book|all in the price book)\b/i.test(name)) return true;

  // Contains "UPDATE" or "REVISION" after a // or -- separator
  if (/\/\/\s*(UPDATE|REVISION|needs|changed|base only|bases ONLY|tops only)/i.test(name)) return true;

  // "PO#" followed by numbers — order references, not companies
  if (/PO#\d+/.test(name)) return true;

  // Very long names (>80 chars) are usually notes stuffed into dealerProject
  if (name.length > 80) return true;

  return false;
}

/**
 * Extract the dealer name from a potentially messy dealerProject string.
 * Strips project names, notes, and trailing noise.
 * Returns null if the entry is pure junk after cleaning.
 */
function cleanDealerName(rawName: string): string | null {
  let name = rawName.trim();

  // Apply known aliases first (exact match)
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];

  // For entries with " / " separator (dealer / project), take just the dealer part
  // But only if the first part looks like a company name
  if (name.includes(" / ")) {
    const parts = name.split(" / ");
    const candidate = parts[0].trim();
    // If the first part has a known alias, use it
    if (KNOWN_ALIASES[candidate]) return KNOWN_ALIASES[candidate];
    // If the first part is a reasonable length, use it as the dealer name
    if (candidate.length >= 2 && candidate.length <= 60) {
      name = candidate;
    }
  }

  // Strip trailing notes after " // "
  if (name.includes(" // ")) {
    name = name.split(" // ")[0].trim();
  }

  // Strip trailing notes in parentheses that look like notes
  // e.g. "Frank Cooney Company (Standard laminate)" → "Frank Cooney Company"
  // But keep legit suffixes like "Inc." or "(DBA ...)"
  name = name.replace(/\s*\((?!DBA|Inc|LLC|Corp)[^)]*\)\s*$/, "").trim();

  // Strip trailing " - " notes like " - Biltmore Cherry w/ 3mm match"
  if (name.includes("- ") && name.indexOf("- ") > 10) {
    const dashIdx = name.lastIndexOf("- ");
    const beforeDash = name.substring(0, dashIdx).trim();
    const afterDash = name.substring(dashIdx + 2).trim();
    // If after the dash looks like a note (contains certain keywords), strip it
    if (/\b(cherry|laminate|match|edge|base|update|revision)\b/i.test(afterDash)) {
      name = beforeDash;
    }
  }

  // Re-apply aliases after cleaning
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];

  // Final length check
  if (name.length < 2) return null;

  return name;
}

/**
 * Clean a GF company name for matching/insertion.
 * Handles "Dealer / Project" patterns, location suffixes, and rep group prefixes.
 */
function cleanGfCompanyName(raw: string): string | null {
  let name = raw.trim();
  if (!name) return null;

  // Check exact alias first
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];

  // Filter GF junk
  if (GF_JUNK_NAMES.has(name.toLowerCase())) return null;

  // Strip location suffixes in parens: "(Owensboro, KY)", "(Nashville Location)"
  name = name.replace(/\s*\([^)]*(?:Location|city|office)\)\s*$/i, "").trim();

  // Strip trailing " - CityName" or " - Location" patterns
  name = name.replace(/\s+-\s+(?:Cincy|Knoxville|Lincoln NE|Kansas City|Lenexa)\s*$/i, "").trim();

  // "Rep Group for Dealer" → keep the dealer (the submitter is the rep, not the company)
  // But only if a known rep pattern
  const forMatch = name.match(/^(?:Mid-States Reps?|Webb Contract|CRG|Ace Office Furniture(?: Associates)?)\s+for\s+(.+)$/i);
  if (forMatch) {
    name = forMatch[1].trim();
  }

  // "Dealer / Project" or "Dealer / Sub-dealer" — take first part
  if (name.includes(" / ")) {
    const parts = name.split(" / ");
    const candidate = parts[0].trim();
    if (candidate.length >= 2 && candidate.length <= 60) {
      name = candidate;
    }
  }
  // Also handle "Dealer/Sub" (no spaces around /)
  if (name.includes("/") && !name.includes(" / ")) {
    const parts = name.split("/");
    const candidate = parts[0].trim();
    // Only split if first part is a reasonable company name
    if (candidate.length >= 3 && candidate.length <= 60 && !/^\d/.test(candidate)) {
      name = candidate;
    }
  }

  // Strip trailing ", CityName State" like "FriendsOffice, Findlay Ohio"
  name = name.replace(/,\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+\d{5})?\s*$/, "").trim();

  // Strip trailing phone numbers like "(325-9119)"
  name = name.replace(/\s*\(\d{3}[- ]\d{4}\)\s*$/, "").trim();

  // Strip trailing dots/ellipsis and city info like "DPsupplyinc.....Danville, Illinois 61832"
  name = name.replace(/\.{2,}.*$/, "").trim();

  // Re-check alias after cleaning
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];

  if (name.length < 2) return null;
  return name;
}

// ---------- Normalization for matching ----------

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

/** Fetch all rows from a Supabase table, paginating past the 1000-row limit */
async function fetchAllOrgs(): Promise<DbOrg[]> {
  const all: DbOrg[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, type, is_seeded")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch orgs: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

async function batchInsert(
  table: string,
  rows: Record<string, unknown>[],
  label: string,
  selectCols = "id, name"
): Promise<Record<string, unknown>[]> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${rows.length} ${label}`);
    return rows.map((r) => ({
      id: `dry-run-${Math.random().toString(36).slice(2)}`,
      name: r.name as string | undefined,
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
      console.error("  Sample row:", JSON.stringify(batch[0]).substring(0, 200));
      throw error;
    }

    results.push(...(data ?? []));
    process.stdout.write(`  ${label}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ${label}: ${results.length} inserted`);
  return results;
}

// ============================================================
// PHASE 1: Fix rep group types
// ============================================================
async function phase1_fixRepGroupTypes(existingOrgs: DbOrg[]) {
  console.log("\n=== Phase 1: Fix Rep Group Types ===");

  const repGroupOrgs = existingOrgs.filter(
    (o) => REP_GROUP_NAMES.includes(o.name) && o.type === "dealer" && o.is_seeded
  );

  if (repGroupOrgs.length === 0) {
    console.log("  No rep groups need fixing (already correct or not found).");
    return;
  }

  console.log(`  Found ${repGroupOrgs.length} rep groups with type='dealer' that need updating:`);
  for (const org of repGroupOrgs) {
    console.log(`    - ${org.name}`);
  }

  if (DRY_RUN) {
    console.log("  [DRY RUN] Would update these to type='rep_group'");
    return;
  }

  for (const org of repGroupOrgs) {
    const { error } = await supabase
      .from("organizations")
      .update({ type: "rep_group" })
      .eq("id", org.id);

    if (error) {
      console.error(`  Error updating ${org.name}:`, error.message);
      throw error;
    }
  }
  console.log(`  Updated ${repGroupOrgs.length} organizations to type='rep_group'`);
}

// ============================================================
// PHASE 2: Seed dealer organizations from dealers.json
// ============================================================
async function phase2_seedDealers(existingOrgs: DbOrg[]) {
  console.log("\n=== Phase 2: Seed Dealer Organizations ===");

  const dealers = loadJson<DealerEntry[]>("dealers.json");
  console.log(`  Loaded ${dealers.length} entries from dealers.json`);

  // Build normalized name set of existing orgs for dedup
  const existingNormalized = new Map<string, string>();
  for (const org of existingOrgs) {
    existingNormalized.set(normalize(org.name), org.name);
  }

  const junkFiltered: { name: string; reason: string }[] = [];
  const skippedRepGroups: string[] = [];
  const skippedExisting: string[] = [];
  const newDealers: Record<string, unknown>[] = [];
  // Track what we've already queued for insert (by normalized name)
  const queuedNormalized = new Set<string>();

  for (const d of dealers) {
    // Skip rep groups (already in DB)
    if (d.isRepGroup) {
      skippedRepGroups.push(d.name);
      continue;
    }

    // Apply junk filter on raw name
    if (isJunkDealer(d.name)) {
      junkFiltered.push({ name: d.name, reason: "junk pattern" });
      continue;
    }

    // Clean and normalize
    const cleaned = cleanDealerName(d.name);
    if (!cleaned) {
      junkFiltered.push({ name: d.name, reason: "empty after cleaning" });
      continue;
    }

    const norm = normalize(cleaned);

    // Skip if already exists in DB
    if (existingNormalized.has(norm)) {
      skippedExisting.push(`${d.name} → ${existingNormalized.get(norm)}`);
      continue;
    }

    // Skip if we've already queued this normalized name
    if (queuedNormalized.has(norm)) {
      continue;
    }

    queuedNormalized.add(norm);

    const years =
      d.firstSeen && d.lastSeen
        ? `${d.firstSeen}-${d.lastSeen}`
        : "no quote history";

    newDealers.push({
      name: cleaned,
      type: "dealer",
      default_tier: "50_20",
      is_seeded: true,
      notes: `${d.quoteCount} quotes (${years}) | Source: quote queue`,
    });
  }

  console.log(`  Junk filtered: ${junkFiltered.length}`);
  console.log(`  Skipped (rep group): ${skippedRepGroups.length}`);
  console.log(`  Skipped (already exists): ${skippedExisting.length}`);
  console.log(`  New dealers to insert: ${newDealers.length}`);

  const inserted = await batchInsert("organizations", newDealers, "dealers");

  // Add newly inserted to existingOrgs for subsequent phases
  for (const row of inserted) {
    if (row.name) {
      existingOrgs.push({
        id: row.id as string,
        name: row.name as string,
        type: "dealer",
        is_seeded: true,
      });
    }
  }

  return { junkFiltered, newDealers };
}

// ============================================================
// PHASE 3: Seed GF-only organizations
// ============================================================
async function phase3_seedGfOrganizations(existingOrgs: DbOrg[]) {
  console.log("\n=== Phase 3: Seed GF-Only Organizations ===");

  const gfEntries = loadJson<GfEntry[]>("gf-quote-requests.json");
  console.log(`  Loaded ${gfEntries.length} GF entries`);

  // Build normalized lookup of existing orgs (now includes Phase 2 inserts)
  const existingNormalized = new Map<string, string>();
  for (const org of existingOrgs) {
    existingNormalized.set(normalize(org.name), org.name);
  }
  // Also add all known aliases to the lookup
  for (const [alias, canonical] of Object.entries(KNOWN_ALIASES)) {
    existingNormalized.set(normalize(alias), canonical);
  }

  // Get unique GF company names (with cleaning)
  const gfCompanies = new Map<string, { name: string; count: number }>();
  for (const entry of gfEntries) {
    const raw = entry.companyName?.trim();
    if (!raw) continue;

    // Clean and normalize the GF company name
    const cleaned = cleanGfCompanyName(raw);
    if (!cleaned) continue;

    const norm = normalize(cleaned);

    if (!gfCompanies.has(norm)) {
      gfCompanies.set(norm, { name: cleaned, count: 0 });
    }
    gfCompanies.get(norm)!.count++;
  }

  console.log(`  Unique GF companies: ${gfCompanies.size}`);

  const unmatchedGfCompanies: { name: string; count: number }[] = [];
  const newGfOrgs: Record<string, unknown>[] = [];
  const queuedNormalized = new Set<string>();

  for (const [norm, { name, count }] of gfCompanies) {
    // Skip if already exists in DB (including Phase 2 inserts)
    if (existingNormalized.has(norm)) continue;

    // Skip if already queued
    if (queuedNormalized.has(norm)) continue;
    queuedNormalized.add(norm);

    // Track as unmatched for reporting (even though we'll insert it)
    unmatchedGfCompanies.push({ name, count });

    newGfOrgs.push({
      name,
      type: "dealer",
      default_tier: "50_20",
      is_seeded: true,
      notes: `${count} web form submissions | Source: GF quote requests`,
    });
  }

  console.log(`  GF companies already in DB: ${gfCompanies.size - unmatchedGfCompanies.length}`);
  console.log(`  New GF-only organizations to insert: ${newGfOrgs.length}`);

  const inserted = await batchInsert("organizations", newGfOrgs, "GF orgs");

  // Add newly inserted to existingOrgs for Phase 4
  for (const row of inserted) {
    if (row.name) {
      existingOrgs.push({
        id: row.id as string,
        name: row.name as string,
        type: "dealer",
        is_seeded: true,
      });
    }
  }

  return { unmatchedGfCompanies };
}

// ============================================================
// PHASE 4: Seed contacts from GF data
// ============================================================
async function phase4_seedContacts(existingOrgs: DbOrg[]) {
  console.log("\n=== Phase 4: Seed Contacts from GF Data ===");

  const gfEntries = loadJson<GfEntry[]>("gf-quote-requests.json");

  // Fetch existing contacts to avoid duplicates
  const { data: existingContacts, error: contactsErr } = await supabase
    .from("contacts")
    .select("email")
    .not("email", "is", null);

  if (contactsErr) throw new Error(`Failed to fetch contacts: ${contactsErr.message}`);
  const existingEmails = new Set(
    (existingContacts ?? []).map((c: { email: string }) => c.email.toLowerCase())
  );
  console.log(`  Existing contacts in DB: ${existingEmails.size}`);

  // Build org lookup by normalized name
  const orgByNorm = new Map<string, { id: string; name: string }>();
  for (const org of existingOrgs) {
    orgByNorm.set(normalize(org.name), { id: org.id, name: org.name });
  }
  // Add aliases
  for (const [alias, canonical] of Object.entries(KNOWN_ALIASES)) {
    const canonNorm = normalize(canonical);
    if (orgByNorm.has(canonNorm)) {
      orgByNorm.set(normalize(alias), orgByNorm.get(canonNorm)!);
    }
  }

  // Deduplicate GF entries by email (keep most recent)
  const byEmail = new Map<
    string,
    {
      entry: GfEntry;
      orgId: string | null;
      orgName: string | null;
    }
  >();

  const unmatchedContacts: { email: string; name: string; company: string }[] = [];

  for (const entry of gfEntries) {
    const email = entry.contactEmail?.trim().toLowerCase();
    if (!email) continue;

    // Skip if already in DB
    if (existingEmails.has(email)) continue;

    // Find org match (using same cleaning as Phase 3)
    const rawCompany = entry.companyName?.trim();
    const cleanedCompany = rawCompany ? cleanGfCompanyName(rawCompany) : null;
    const companyNorm = cleanedCompany ? normalize(cleanedCompany) : null;
    const matchedOrg = companyNorm ? orgByNorm.get(companyNorm) : null;

    const existing = byEmail.get(email);
    if (!existing || new Date(entry.dateCreated) > new Date(existing.entry.dateCreated)) {
      byEmail.set(email, {
        entry,
        orgId: matchedOrg?.id ?? null,
        orgName: matchedOrg?.name ?? null,
      });
    }
  }

  // Build contact records
  const contactRows: Record<string, unknown>[] = [];
  const skippedNoOrg: string[] = [];

  for (const [email, { entry, orgId, orgName }] of byEmail) {
    if (!orgId) {
      skippedNoOrg.push(`${entry.contactName} <${email}> (company: ${entry.companyName})`);
      unmatchedContacts.push({
        email,
        name: entry.contactName,
        company: entry.companyName,
      });
      continue;
    }

    // Parse name into first/last
    const nameParts = (entry.contactName ?? "").trim().split(/\s+/);
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    contactRows.push({
      organization_id: orgId,
      first_name: firstName,
      last_name: lastName,
      email: entry.contactEmail?.trim(),
      phone: entry.contactPhone?.trim() || null,
      is_primary: false,
      notes: `Imported from GF web form (${entry.dateCreated.split(" ")[0]})`,
    });
  }

  console.log(`  Unique contacts by email: ${byEmail.size}`);
  console.log(`  Contacts with org match: ${contactRows.length}`);
  console.log(`  Skipped (no org match): ${skippedNoOrg.length}`);

  await batchInsert("contacts", contactRows, "contacts", "id");

  return { skippedNoOrg, unmatchedContacts };
}

// ============================================================
// PHASE 5: Generate reports
// ============================================================
function phase5_generateReports(
  junkFiltered: { name: string; reason: string }[],
  unmatchedGfCompanies: { name: string; count: number }[],
  gfEntries: GfEntry[],
  existingOrgs: DbOrg[]
) {
  console.log("\n=== Phase 5: Generate Reports ===");

  mkdirSync(reportDir, { recursive: true });

  // 1. Junk dealers filtered
  writeFileSync(
    join(reportDir, "junk-dealers-filtered.json"),
    JSON.stringify(junkFiltered, null, 2)
  );
  console.log(`  junk-dealers-filtered.json: ${junkFiltered.length} entries`);

  // 2. Unmatched GF companies
  const sortedUnmatched = [...unmatchedGfCompanies].sort((a, b) => b.count - a.count);
  writeFileSync(
    join(reportDir, "unmatched-gf-companies.json"),
    JSON.stringify(sortedUnmatched, null, 2)
  );
  console.log(`  unmatched-gf-companies.json: ${sortedUnmatched.length} entries`);

  // 3. Rep group email domain analysis
  // Analyze which email domains appear in GF data — domains matching rep group names
  // could indicate rep group employees submitting on behalf of dealers
  const domainCounts = new Map<string, { count: number; companies: Set<string> }>();
  for (const entry of gfEntries) {
    const email = entry.contactEmail?.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    const domain = email.split("@")[1];
    if (!domainCounts.has(domain)) {
      domainCounts.set(domain, { count: 0, companies: new Set() });
    }
    const d = domainCounts.get(domain)!;
    d.count++;
    if (entry.companyName) d.companies.add(entry.companyName.trim());
  }

  // Sort by count descending, show top domains + flag any that look like rep groups
  const domainReport = Array.from(domainCounts.entries())
    .map(([domain, { count, companies }]) => ({
      domain,
      count,
      uniqueCompanies: companies.size,
      companies: Array.from(companies).slice(0, 10),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);

  writeFileSync(
    join(reportDir, "rep-group-email-domains.json"),
    JSON.stringify(domainReport, null, 2)
  );
  console.log(`  rep-group-email-domains.json: top ${domainReport.length} domains`);

  console.log(`\n  Reports saved to: ${reportDir}`);
}

// ============================================================
// PHASE 6: Set rep group → dealer hierarchy from GF email domains
// ============================================================

/**
 * Map of email domains to the rep group org they belong to.
 * When someone from domain X submits a GF entry for company Y,
 * and Y !== X's rep group, then Y is a dealer under that rep group.
 */
const DOMAIN_TO_REP_GROUP: Record<string, string> = {
  // Canonical 13 rep groups with identifiable domains
  "webbcontract.com": "Webb Contract",
  "aceofficefurn.com": "Ace Office Furniture",
  "mjmeeks.com": "Melissa J. Meeks and Associates",
  "midstatesreps.com": "Mid-States Rep",
  // Major rep groups NOT in the original 13 — need to be created as rep_group orgs
  "bgreps.com": "Baldauf Group",          // 148 entries, 39 companies
  "fg1948.com": "Frey Gaede",             // 75 entries, 41 companies
  "opmreps.com": "Office Products Marketing", // 14 entries, 5 companies
  "scrgroup.us": "SCR Group",             // 32 entries, 8 companies
  "contractrg.com": "CRG",                // Contract Resource Group
};

/** Names that should be treated as "self" for a given rep group (not a dealer child) */
const REP_GROUP_SELF_NAMES: Record<string, string[]> = {
  "Webb Contract": ["Webb Contract", "Webb Contract Associates", "WEBB Contract Associates"],
  "Ace Office Furniture": ["Ace Office Furniture", "Ace Office Furniture Associates", "Ace Office Furniture associates"],
  "Melissa J. Meeks and Associates": ["Melissa J. Meeks and Associates", "Melissa Meeks & Associates"],
  "Mid-States Rep": ["Mid-States Rep", "Mid-States Reps"],
  "Baldauf Group": ["Baldauf Group"],
  "Frey Gaede": ["Frey Gaede", "Frey Gaede Harbinger", "Frey Gaede/CRG", "Frey Gaede/ CRG"],
  "Office Products Marketing": ["OPM", "OPM - Office Products Marketing", "Office Products Marketing", "Office Products Marketiing"],
  "SCR Group": ["SCR Group", "The SCR Group"],
  "CRG": ["CRG", "Contract Resource Group-SW"],
};

async function phase6_setRepGroupHierarchy(existingOrgs: DbOrg[]) {
  console.log("\n=== Phase 6: Set Rep Group → Dealer Hierarchy ===");

  const gfEntries = loadJson<GfEntry[]>("gf-quote-requests.json");

  // Refresh org list from DB (includes all Phase 2-3 inserts)
  const allOrgs = DRY_RUN ? existingOrgs : await fetchAllOrgs();

  // Build lookup by normalized name
  const orgByNorm = new Map<string, DbOrg>();
  for (const org of allOrgs) {
    orgByNorm.set(normalize(org.name), org);
  }
  // Add aliases
  for (const [alias, canonical] of Object.entries(KNOWN_ALIASES)) {
    const canonNorm = normalize(canonical);
    if (orgByNorm.has(canonNorm)) {
      orgByNorm.set(normalize(alias), orgByNorm.get(canonNorm)!);
    }
  }

  // Step 1: Ensure all rep groups from DOMAIN_TO_REP_GROUP exist as rep_group type
  const newRepGroups: string[] = [];
  for (const repName of new Set(Object.values(DOMAIN_TO_REP_GROUP))) {
    const norm = normalize(repName);
    const existing = orgByNorm.get(norm);

    if (!existing) {
      // Create the rep group org
      console.log(`  Creating new rep group: ${repName}`);
      if (!DRY_RUN) {
        const { data, error } = await supabase
          .from("organizations")
          .insert({
            name: repName,
            type: "rep_group",
            default_tier: "50_20",
            is_seeded: true,
            notes: "Identified as rep group from GF email domain analysis",
          })
          .select("id, name, type, is_seeded")
          .single();

        if (error) {
          console.error(`  Error creating rep group ${repName}:`, error.message);
          continue;
        }
        orgByNorm.set(norm, data);
        allOrgs.push(data);
      } else {
        const fakeOrg: DbOrg = { id: `dry-run-${repName}`, name: repName, type: "rep_group", is_seeded: true };
        orgByNorm.set(norm, fakeOrg);
      }
      newRepGroups.push(repName);
    } else if (existing.type !== "rep_group") {
      // Upgrade existing dealer to rep_group
      console.log(`  Upgrading to rep_group: ${repName} (was ${existing.type})`);
      if (!DRY_RUN) {
        const { error } = await supabase
          .from("organizations")
          .update({ type: "rep_group" })
          .eq("id", existing.id);
        if (error) {
          console.error(`  Error upgrading ${repName}:`, error.message);
          continue;
        }
        existing.type = "rep_group";
      }
    }
  }

  if (newRepGroups.length > 0) {
    console.log(`  Created ${newRepGroups.length} new rep groups: ${newRepGroups.join(", ")}`);
  }

  // Step 2: Analyze GF entries to find dealer → rep group connections
  // For each rep group domain, collect all companies they submitted for (that aren't themselves)
  const connections = new Map<string, Set<string>>(); // repGroupName → Set<dealerNorm>

  for (const entry of gfEntries) {
    const email = entry.contactEmail?.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;

    const domain = email.split("@")[1];
    const repGroupName = DOMAIN_TO_REP_GROUP[domain];
    if (!repGroupName) continue;

    const rawCompany = entry.companyName?.trim();
    if (!rawCompany) continue;

    // Clean the company name same way as Phase 3/4
    const cleanedCompany = cleanGfCompanyName(rawCompany);
    if (!cleanedCompany) continue;

    // Check if this is a "self" entry (rep group submitting for themselves)
    const selfNames = REP_GROUP_SELF_NAMES[repGroupName] ?? [];
    if (selfNames.some((s) => normalize(s) === normalize(cleanedCompany))) continue;

    // This is a dealer submission — record the connection
    if (!connections.has(repGroupName)) {
      connections.set(repGroupName, new Set());
    }
    connections.get(repGroupName)!.add(normalize(cleanedCompany));
  }

  // Step 3: Apply parent_organization_id updates
  let totalConnections = 0;
  let skippedAlreadySet = 0;
  let skippedNotFound = 0;

  for (const [repGroupName, dealerNorms] of connections) {
    const repGroupOrg = orgByNorm.get(normalize(repGroupName));
    if (!repGroupOrg) {
      console.error(`  Rep group not found in DB: ${repGroupName}`);
      continue;
    }

    console.log(`\n  ${repGroupName} (${dealerNorms.size} dealers):`);
    const dealerNames: string[] = [];

    for (const dealerNorm of dealerNorms) {
      const dealerOrg = orgByNorm.get(dealerNorm);
      if (!dealerOrg) {
        skippedNotFound++;
        continue;
      }

      // Skip if this org is itself a rep_group
      if (dealerOrg.type === "rep_group") continue;

      dealerNames.push(dealerOrg.name);

      if (!DRY_RUN) {
        // Check if already has a parent set
        const { data: currentOrg } = await supabase
          .from("organizations")
          .select("parent_organization_id")
          .eq("id", dealerOrg.id)
          .single();

        if (currentOrg?.parent_organization_id) {
          skippedAlreadySet++;
          continue;
        }

        const { error } = await supabase
          .from("organizations")
          .update({ parent_organization_id: repGroupOrg.id })
          .eq("id", dealerOrg.id);

        if (error) {
          console.error(`    Error linking ${dealerOrg.name}: ${error.message}`);
          continue;
        }
      }

      totalConnections++;
    }

    if (dealerNames.length > 0) {
      // Show first 10, ellipsis if more
      const shown = dealerNames.slice(0, 10);
      const more = dealerNames.length > 10 ? ` ... +${dealerNames.length - 10} more` : "";
      console.log(`    ${shown.join(", ")}${more}`);
    }
  }

  console.log(`\n  Total connections set: ${totalConnections}`);
  if (skippedAlreadySet > 0) console.log(`  Skipped (parent already set): ${skippedAlreadySet}`);
  if (skippedNotFound > 0) console.log(`  Skipped (dealer not in DB): ${skippedNotFound}`);

  // Save connections report
  mkdirSync(reportDir, { recursive: true });
  const connectionsReport = Array.from(connections.entries()).map(([repGroup, dealers]) => ({
    repGroup,
    dealerCount: dealers.size,
    dealers: Array.from(dealers).map((norm) => orgByNorm.get(norm)?.name ?? `[unmatched: ${norm}]`),
  }));
  writeFileSync(
    join(reportDir, "rep-group-connections.json"),
    JSON.stringify(connectionsReport, null, 2)
  );
  console.log(`\n  rep-group-connections.json saved`);
}

// ============================================================
// PHASE 7: Seed quote requests from GF data
// ============================================================

/** Map GF baseSeries name → our series code */
const SERIES_NAME_TO_CODE: Record<string, string> = {
  "Ultra": "00",
  "Stretch": "06",
  "Elite": "08",
  "Foundation": "30",
  "Fundamental": "33",
  "Justice": "40",
  "Primary": "44",
  "Primary - Column Base": "44",
  "Primary - Disc Base": "44",
  "Puddle": "45",
  "Exclaim": "71",
  "VertiGO": "74",
  "Surge": "99",
  "Element": "01",
  "Artisan": "43",
  "App": "17",
  "Revel": "02",
  "Trig": "14",
};

/**
 * Build a notes string from GF configuration details
 * that don't have dedicated columns in quote_requests.
 */
function buildNotesFromGf(entry: GfEntry): string {
  const parts: string[] = [];

  if (entry.specialRequests) {
    parts.push(entry.specialRequests.replace(/\\r\\n|\\n/g, " ").trim());
  }

  // Configuration extras not captured in main columns
  const extras: string[] = [];
  if (entry.height && entry.height !== 'Standard Height (29")') extras.push(`Height: ${entry.height}`);
  if (entry.folding === "Yes") extras.push("Folding");
  if (entry.nesting === "Yes") extras.push("Nesting");
  if (entry.flipTop === "Yes") extras.push("Flip Top");
  if (entry.casterSize) extras.push(`Casters: ${entry.casterSize}`);
  if (entry.industrialCasters === "Yes") extras.push("Industrial casters");
  if (entry.footRing === "Yes") extras.push("Foot ring");
  if (entry.chrome === "Yes") extras.push("Chrome");
  if (entry.hplMarkerboard === "Yes") extras.push("Markerboard");
  if (entry.radiusCorners === "Yes") extras.push("Radius corners");
  if (entry.adjustableHeight?.length) extras.push(`Adj height: ${entry.adjustableHeight.join(", ")}`);
  if (entry.wireManagement?.length) extras.push(`Wire mgmt: ${entry.wireManagement.join(", ")}`);
  if (entry.daisyChainedPower === "Yes") extras.push("Daisy-chained power");
  if (entry.grommetLocation && entry.grommetLocation !== "na") extras.push(`Grommet: ${entry.grommetLocation}`);
  if (entry.powerConfig && entry.powerConfig !== "na") extras.push(`Power: ${entry.powerConfig}`);

  if (extras.length > 0) {
    parts.push(`[${extras.join(" | ")}]`);
  }

  if (entry.orderDate) parts.push(`Requested ship: ${entry.orderDate}`);
  if (entry.deliveryDate) parts.push(`Delivery by: ${entry.deliveryDate}`);

  if (parts.length === 0) return "Imported from GF web form";
  return parts.join(" | ");
}

async function phase7_seedQuoteRequests() {
  console.log("\n=== Phase 7: Seed Quote Requests from GF Data ===");

  const gfEntries = loadJson<GfEntry[]>("gf-quote-requests.json");
  console.log(`  GF entries: ${gfEntries.length}`);

  // Check existing quote requests to avoid duplicates (by request_number)
  const existingNumbers = new Set<string>();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data } = await supabase
      .from("quote_requests")
      .select("request_number")
      .range(from, from + pageSize - 1);
    if (!data || data.length === 0) break;
    for (const r of data) existingNumbers.add(r.request_number);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  console.log(`  Existing quote requests: ${existingNumbers.size}`);

  let skippedNoSeries = 0;
  let skippedExists = 0;
  const rows: Record<string, unknown>[] = [];

  for (const entry of gfEntries) {
    const requestNumber = `GF-${entry.entryId}`;

    // Skip if already imported
    if (existingNumbers.has(requestNumber)) {
      skippedExists++;
      continue;
    }

    // Skip entries without baseSeries (can't determine configuration)
    if (!entry.baseSeries) {
      skippedNoSeries++;
      continue;
    }

    // Map series
    const seriesCode = SERIES_NAME_TO_CODE[entry.baseSeries] ?? entry.baseSeries;
    const seriesName = entry.baseSeries;

    // Parse contact name
    const nameParts = (entry.contactName ?? "").trim().split(/\s+/);
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Normalize edge type (strip long descriptions, keep the code)
    let edgeType = entry.edgeSelection || null;
    if (edgeType === "N/A" || edgeType === "na") edgeType = null;

    rows.push({
      request_number: requestNumber,
      contact_first_name: firstName,
      contact_last_name: lastName,
      contact_email: entry.contactEmail?.trim() || null,
      contact_phone: entry.contactPhone?.trim() || null,
      contact_company: entry.companyName?.trim() || null,
      series_code: seriesCode,
      series_name: seriesName,
      shape_code: "N/A",  // GF form didn't capture shape
      size: entry.topSize?.trim() || "N/A",
      base_code: "N/A",   // GF form didn't capture base type
      base_finish: entry.baseFinish || null,
      top_material: entry.topMaterial || null,
      top_finish: entry.hplSelection || null,
      edge_type: edgeType,
      quantity: entry.quantity ?? 1,
      status: "closed",
      notes: buildNotesFromGf(entry),
      created_at: entry.dateCreated,
    });
  }

  console.log(`  Skipped (no baseSeries): ${skippedNoSeries}`);
  console.log(`  Skipped (already exists): ${skippedExists}`);
  console.log(`  Quote requests to insert: ${rows.length}`);

  await batchInsert("quote_requests", rows, "quote requests", "id, request_number");

  return { total: rows.length, skippedNoSeries };
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("=== TableX CRM Data Seeder ===");
  if (DRY_RUN) console.log("*** DRY RUN MODE — no database changes ***");
  console.log();

  // Fetch current state
  const existingOrgs = await fetchAllOrgs();
  console.log(`Current organizations in DB: ${existingOrgs.length}`);

  const { data: contactCount } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true });
  console.log(`Current contacts in DB: ${contactCount ?? 0}`);

  // Phase 1: Fix rep group types
  await phase1_fixRepGroupTypes(existingOrgs);

  // Phase 2: Seed dealers
  const { junkFiltered } = await phase2_seedDealers(existingOrgs);

  // Phase 3: Seed GF-only orgs
  const { unmatchedGfCompanies } = await phase3_seedGfOrganizations(existingOrgs);

  // Phase 4: Seed contacts
  await phase4_seedContacts(existingOrgs);

  // Phase 5: Reports
  const gfEntries = loadJson<GfEntry[]>("gf-quote-requests.json");
  phase5_generateReports(junkFiltered, unmatchedGfCompanies, gfEntries, existingOrgs);

  // Phase 6: Rep group hierarchy
  await phase6_setRepGroupHierarchy(existingOrgs);

  // Phase 7: Seed quote requests
  await phase7_seedQuoteRequests();

  // Final counts
  if (!DRY_RUN) {
    const finalOrgs = await fetchAllOrgs();
    const repGroups = finalOrgs.filter((o) => o.type === "rep_group");
    const dealers = finalOrgs.filter((o) => o.type === "dealer");

    const { count: finalContactCount } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true });

    // Count dealers with parents
    const { count: linkedDealers } = await supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .not("parent_organization_id", "is", null);

    const { count: quoteRequestCount } = await supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true });

    console.log("\n=== Final State ===");
    console.log(`  Organizations: ${finalOrgs.length} (${repGroups.length} rep groups, ${dealers.length} dealers)`);
    console.log(`  Dealers linked to rep groups: ${linkedDealers}`);
    console.log(`  Contacts: ${finalContactCount}`);
    console.log(`  Quote requests: ${quoteRequestCount}`);
  }

  console.log("\n=== Done! ===");
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
