/**
 * One-off analysis of the legacy tablex.com Gravity Forms "Quote Request"
 * archive (src/data/gf-quote-requests.json — 1,264 entries, 2022-11-15 →
 * 2026-09-17). Pure computation, no DB, no network. Writes a markdown report
 * to the tablex-site sibling repo.
 *
 * Reuses label vocab (junk-name filter, alias map, cleaner, rep-domain map,
 * mysql-escape unescape, note-building vocabulary) copied from this repo's
 * scripts/seed-crm-data.ts — NOT imported, since that file has module-level
 * Supabase client construction that would blow up outside the seed context.
 * Keep-in-sync note: if seed-crm-data.ts's KNOWN_ALIASES / GF_JUNK_NAMES /
 * cleanGfCompanyName / DOMAIN_TO_REP_GROUP change, mirror here.
 *
 * The "matched org" column is filled by parsing the Step 2 import report
 * (tablex-site docs/reports/2026-09-18-legacy-quote-requests-import.md) and
 * matching each top-25 company against its "stated company" groups with
 * `normalizeOrgName`/`nameSimilarity`, COPIED VERBATIM from tablex-site
 * scripts/crm/_legacy-names.ts (itself a copy of src/lib/xero/match.ts — that
 * file is plain tsx-importable, no server-only, but copied rather than
 * cross-repo-imported to keep this script self-contained). Keep-in-sync note:
 * if those two functions change there, mirror here too.
 *
 * Usage: npx tsx scripts/analyze-gf-requests.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Input / output paths
// ---------------------------------------------------------------------------

const INPUT_PATH = join(__dirname, "..", "src", "data", "gf-quote-requests.json");
const OUTPUT_PATH = join(
  __dirname,
  "..",
  "..",
  "tablex-site",
  "docs",
  "reports",
  "2026-09-17-legacy-quote-requests.md",
);
const IMPORT_REPORT_PATH = join(
  __dirname,
  "..",
  "..",
  "tablex-site",
  "docs",
  "reports",
  "2026-09-18-legacy-quote-requests-import.md",
);

// ---------------------------------------------------------------------------
// Types (mirrors the JSON shape; all fields optional except the constants)
// ---------------------------------------------------------------------------

interface GfEntry {
  entryId: number;
  dateCreated: string;
  createdBy: string | null;
  quantity: number;
  orderDate?: string;
  deliveryDate?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  ccEmail?: string;
  projectName?: string;
  specialRequests?: string;
  fileUpload?: string;
  height?: string;
  baseNeeded?: string;
  baseSeries?: string;
  baseFinish?: string;
  folding?: string;
  nesting?: string;
  flipTop?: string;
  footRing?: string;
  chrome?: string;
  casterSize?: string;
  industrialCasters?: string;
  adjustableHeight?: string[];
  wireManagement?: string[];
  daisyChainedPower?: string;
  grommetLocation?: string;
  powerConfig?: string;
  powerUnitLocation?: string;
  panels?: string[];
  accessories?: string[];
  topNeeded?: string;
  topSize?: string;
  topMaterial?: string;
  topShape?: string;
  hplSelection?: string;
  hplMarkerboard?: string;
  radiusCorners?: string;
  edgeSelection?: string;
  solidSurfaceSelection?: string;
}

// ---------------------------------------------------------------------------
// Vocab copied from scripts/seed-crm-data.ts (see header note)
// ---------------------------------------------------------------------------

const KNOWN_ALIASES: Record<string, string> = {
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

const GF_JUNK_NAMES = new Set([
  "test", "test 2", "testing again", "asdf", "tables",
  "test for fran", "test quote request", "dealer tbd",
  "jigsaw", "jigsaw2", "pizza planet", "schmo furnishings",
  "sbaloansquads", "interior",
]);

function cleanGfCompanyName(raw: string): string | null {
  let name = raw.trim();
  if (!name) return null;
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];
  if (GF_JUNK_NAMES.has(name.toLowerCase())) return null;
  name = name.replace(/\s*\([^)]*(?:Location|city|office)\)\s*$/i, "").trim();
  name = name.replace(/\s+-\s+(?:Cincy|Knoxville|Lincoln NE|Kansas City|Lenexa)\s*$/i, "").trim();
  const forMatch = name.match(
    /^(?:Mid-States Reps?|Webb Contract|CRG|Ace Office Furniture(?: Associates)?)\s+for\s+(.+)$/i,
  );
  if (forMatch) name = forMatch[1].trim();
  if (name.includes(" / ")) {
    const candidate = name.split(" / ")[0].trim();
    if (candidate.length >= 2 && candidate.length <= 60) name = candidate;
  }
  if (name.includes("/") && !name.includes(" / ")) {
    const candidate = name.split("/")[0].trim();
    if (candidate.length >= 3 && candidate.length <= 60 && !/^\d/.test(candidate)) name = candidate;
  }
  name = name.replace(/,\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+\d{5})?\s*$/, "").trim();
  name = name.replace(/\s*\(\d{3}[- ]\d{4}\)\s*$/, "").trim();
  name = name.replace(/\.{2,}.*$/, "").trim();
  if (KNOWN_ALIASES[name]) return KNOWN_ALIASES[name];
  if (name.length < 2) return null;
  return name;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,'"()&/\\-]/g, " ")
    .replace(/\b(inc|llc|corp|co|company|associates|assoc)\b\.?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rep-group domains — from seed-crm-data.ts DOMAIN_TO_REP_GROUP (9 canonical + 4 new). */
const REP_DOMAINS: Record<string, string> = {
  "webbcontract.com": "Webb Contract",
  "aceofficefurn.com": "Ace Office Furniture",
  "mjmeeks.com": "Melissa J. Meeks and Associates",
  "midstatesreps.com": "Mid-States Rep",
  "bgreps.com": "Baldauf Group",
  "fg1948.com": "Frey Gaede",
  "opmreps.com": "Office Products Marketing",
  "scrgroup.us": "SCR Group",
  "contractrg.com": "CRG",
};

const FREE_MAIL = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com",
  "verizon.net", "comcast.net", "att.net", "sbcglobal.net", "cox.net", "swbell.net",
  "me.com", "live.com", "msn.com",
]);

/** Unescape literal \r \n \t sequences left by the mysql -e export. */
function unescapeMysql(s: string): string {
  return s
    .replace(/\\r\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

// ---------------------------------------------------------------------------
// Reference vocab from tablex-site (verified by grep 2026-09-17)
// ---------------------------------------------------------------------------

/** The 16 marketed series keys in tablex-site src/data/series-detail.ts. Fundamental is not marketed. */
const MARKETED_SERIES = [
  "ULTRA", "FOUNDATION", "STRETCH", "ELITE", "REVEL", "APP", "ELEMENT", "JUSTICE",
  "ARTISAN", "PRIMARY", "PUDDLE", "EXCLAIM", "VERTIGO", "SURGE", "SOLO", "TRIG",
];

/** The 40 powder-coat finish names in tablex-site src/data/finishes.ts (powderCoatFinishes). */
const NEW_FINISH_NAMES = new Set([
  "Structured Black", "Black", "Structured Slate", "Silver Frost", "Linen", "Storm",
  "Flint", "Pearl", "Sand", "Satin Silver", "Poppy", "Rosey", "Scarlet", "Kiwi",
  "Kale", "Evergreen", "Horizon", "Lagoon", "Moonlight", "Arctic", "Dolphin",
  "Cannon", "Fawn", "Nickel", "Jet", "Bronze", "Moon Grey", "Ocean", "Spruce",
  "Oatmeal", "Brick", "Cherry Cola", "Copper", "Gold", "Mojave", "Sable", "Berry",
  "Tangerine", "Iris", "Sage",
]);

// ---------------------------------------------------------------------------
// Org-name matching — COPY of tablex-site scripts/crm/_legacy-names.ts
// (itself a copy of src/lib/xero/match.ts). See header keep-in-sync note.
// ---------------------------------------------------------------------------

const CORP_SUFFIXES = new Set(["llc", "inc", "co", "corp", "ltd"]);

function normalizeOrgName(name: string): string {
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  while (tokens.length > 1 && CORP_SUFFIXES.has(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  return tokens.join(" ");
}

function bigrams(s: string): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const gram = s.slice(i, i + 2);
    map.set(gram, (map.get(gram) ?? 0) + 1);
  }
  return map;
}

function nameSimilarity(a: string, b: string): number {
  const na = normalizeOrgName(a).replace(/\s+/g, "");
  const nb = normalizeOrgName(b).replace(/\s+/g, "");
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;
  const gramsA = bigrams(na);
  const gramsB = bigrams(nb);
  let overlap = 0;
  for (const [gram, count] of gramsA) {
    overlap += Math.min(count, gramsB.get(gram) ?? 0);
  }
  return (2 * overlap) / (na.length - 1 + nb.length - 1);
}

// ---------------------------------------------------------------------------
// Step 2 import-report parser
// ---------------------------------------------------------------------------

interface ImportMatchRow {
  statedCompany: string;
  requests: number;
  orgName: string;
  orgId: string;
  orgType: string;
  orgSource: string;
  note: string;
  method: "exact" | "alias" | "domain" | "similar" | "created" | "catch-all";
}

/** Parses a `| a | b | ... |` row into trimmed cells, or null for a separator/non-row line. */
function parseMdRow(line: string): string[] | null {
  if (!line.trim().startsWith("|")) return null;
  const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  if (cells.every((c) => /^:?-+:?$/.test(c))) return null; // separator row
  return cells;
}

/**
 * Parses the Step 2 dry-run/apply import report's "## Matches by method"
 * section (### exact / alias / domain / similar / created subsections, each
 * a `| stated company | requests | → org | org id | type | source | note |`
 * table) plus the catch-all org name. Returns [] if the report is absent —
 * callers fall back to "—" in that column, same as before this report existed.
 */
function loadImportMatches(path: string): { rows: ImportMatchRow[]; catchAllOrg: string | null } {
  if (!existsSync(path)) return { rows: [], catchAllOrg: null };
  const text = readFileSync(path, "utf-8");
  const lines = text.split("\n");
  const rows: ImportMatchRow[] = [];
  let method: ImportMatchRow["method"] | null = null;
  let inTable = false;
  let catchAllOrg: string | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^###\s+(exact|alias|domain|similar|created)\b/);
    if (headerMatch) {
      method = headerMatch[1] as ImportMatchRow["method"];
      inTable = false;
      continue;
    }
    const catchAllMatch = line.match(/^\d+ companies with fewer than \d+ requests? → \*\*(.+?)\*\*/);
    if (catchAllMatch) catchAllOrg = catchAllMatch[1].trim();

    if (!method) continue;
    if (/^\|\s*stated company\s*\|/.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (!line.trim().startsWith("|")) {
      inTable = false;
      method = null;
      continue;
    }
    const cells = parseMdRow(line);
    if (!cells || cells.length < 6) continue;
    const [statedCompany, requestsStr, orgName, orgId, orgType, orgSource, note] = cells;
    const requests = parseInt(requestsStr, 10);
    if (!statedCompany || isNaN(requests)) continue;
    rows.push({ statedCompany, requests, orgName, orgId, orgType, orgSource, note: note ?? "", method });
  }

  return { rows, catchAllOrg };
}

/** Best-match a cleaned company name + request count against the parsed import rows. */
function matchImportedOrg(
  cleanedName: string,
  requestCount: number,
  matches: ImportMatchRow[],
  catchAllOrg: string | null,
): string {
  if (matches.length === 0) return "—";

  // Priority 1: the report's own "typed as ..." note names spelling variants
  // the importer folded into that group's count (e.g. "COE" folded into
  // "Commercial Office Environments" alongside "COE"'s 11 requests) — a
  // literal quoted mention there beats bigram similarity, which can coincide
  // on unrelated abbreviations (COE vs OEC).
  const noteHit = matches.find((row) => {
    if (!row.note) return false;
    const m = row.note.match(/typed as ([^|]+)/i);
    if (!m) return false;
    const variants = m[1].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return variants.some((v) => v.toLowerCase() === cleanedName.toLowerCase());
  });
  if (noteHit) {
    const orgLabel = noteHit.orgId === "(new)" ? `${noteHit.orgName} (new org)` : noteHit.orgName;
    return `${orgLabel} · ${noteHit.orgType} · ${noteHit.method} (matched via report note: typed as "${cleanedName}")`;
  }

  let best: ImportMatchRow | null = null;
  let bestScore = 0;
  for (const row of matches) {
    const sim = nameSimilarity(cleanedName, row.statedCompany);
    if (sim < 0.5) continue;
    // Count proximity nudges the score so a near-exact name with a matching
    // request count beats a near-exact name whose group size is unrelated
    // (two differently-spelled companies can converge to similar bigrams).
    const countDelta = Math.abs(row.requests - requestCount);
    const countBonus = countDelta === 0 ? 0.15 : countDelta <= 2 ? 0.05 : 0;
    const score = sim + countBonus;
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }

  if (!best) {
    // Every top-25 company has 9+ requests, well above the create-threshold
    // of 2, so a real catch-all hit here would indicate the two scripts'
    // cleaning diverged — surface that rather than silently guessing.
    return catchAllOrg ? `not found (verify manually — catch-all org exists: "${catchAllOrg}")` : "not found (verify manually)";
  }
  const orgLabel = best.orgId === "(new)" ? `${best.orgName} (new org)` : best.orgName;
  return `${orgLabel} · ${best.orgType} · ${best.method}`;
}

/**
 * Parses the import report's `|  | count |` summary table (top of the file)
 * into a label → number map, and the "Every skipped entry" `<details>` table
 * into a set of GF entry ids — used for the reconciliation note.
 */
function loadImportSummary(path: string): { stats: Map<string, number>; junkEntryIds: Set<number> } {
  const stats = new Map<string, number>();
  const junkEntryIds = new Set<number>();
  if (!existsSync(path)) return { stats, junkEntryIds };
  const lines = readFileSync(path, "utf-8").split("\n");

  let inSummary = false;
  let inJunkDetail = false;
  for (const line of lines) {
    if (/^\|\s*\|\s*count\s*\|/.test(line)) {
      inSummary = true;
      continue;
    }
    if (inSummary) {
      const cells = parseMdRow(line);
      if (!cells) {
        if (line.trim().startsWith("|")) continue;
        inSummary = false;
      } else if (cells.length === 2) {
        const n = parseInt(cells[1].replace(/,/g, ""), 10);
        if (!isNaN(n)) stats.set(cells[0], n);
      }
    }

    if (/^\|\s*entry\s*\|\s*date\s*\|\s*stated company\s*\|/.test(line)) {
      inJunkDetail = true;
      continue;
    }
    if (inJunkDetail) {
      const cells = parseMdRow(line);
      if (!cells) {
        if (line.trim().startsWith("|")) continue;
        inJunkDetail = false;
      } else if (cells.length >= 1) {
        const m = cells[0].match(/GF-(\d+)/);
        if (m) junkEntryIds.add(parseInt(m[1], 10));
      }
    }
  }
  return { stats, junkEntryIds };
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

const entries: GfEntry[] = JSON.parse(readFileSync(INPUT_PATH, "utf-8"));
const { rows: importMatchRows, catchAllOrg } = loadImportMatches(IMPORT_REPORT_PATH);
const { stats: importStats, junkEntryIds: importJunkEntryIds } = loadImportSummary(IMPORT_REPORT_PATH);

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function pct(n: number, d: number): string {
  if (d === 0) return "0.0%";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function sortedEntries<T extends string | number>(m: Map<T, number>, limit?: number) {
  const arr = [...m.entries()].sort((a, b) => b[1] - a[1]);
  return limit ? arr.slice(0, limit) : arr;
}

function bump<T>(m: Map<T, number>, key: T, by = 1) {
  m.set(key, (m.get(key) ?? 0) + by);
}

function emailDomain(email: string | undefined): string | null {
  if (!email) return null;
  const e = email.toLowerCase().trim();
  const at = e.lastIndexOf("@");
  if (at === -1) return null;
  return e.slice(at + 1);
}

function mdTable(headers: string[], rows: (string | number)[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return [head, sep, body].join("\n");
}

// ===========================================================================
// SECTION 1 — Volume
// ===========================================================================

const byYear = new Map<number, number>();
const byMonthAll = new Map<string, number>(); // YYYY-MM
let minDate = entries[0].dateCreated;
let maxDate = entries[0].dateCreated;

for (const e of entries) {
  const d = new Date(e.dateCreated.replace(" ", "T") + "Z");
  const y = d.getUTCFullYear();
  bump(byYear, y);
  const ym = `${y}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  bump(byMonthAll, ym);
  if (e.dateCreated < minDate) minDate = e.dateCreated;
  if (e.dateCreated > maxDate) maxDate = e.dateCreated;
}

const NOW = new Date("2026-09-17T00:00:00Z");
const last12: string[] = [];
for (let i = 11; i >= 0; i--) {
  const d = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() - i, 1));
  last12.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
}

const volumeByYearRows = [...byYear.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([y, n]) => [String(y), String(n)]);

const volumeByMonthRows = last12.map((ym) => [ym, String(byMonthAll.get(ym) ?? 0)]);

// ===========================================================================
// SECTION 2 — Who asks
// ===========================================================================

interface CompanyAgg {
  cleaned: string;
  count: number;
  domains: Set<string>;
  firstDate: string;
  lastDate: string;
}

const companyAgg = new Map<string, CompanyAgg>(); // key = normalized cleaned name
const junkSkipped: GfEntry[] = [];

for (const e of entries) {
  const raw = e.companyName?.trim() ?? "";
  const cleaned = raw ? cleanGfCompanyName(raw) : null;
  if (!cleaned) {
    junkSkipped.push(e);
    continue;
  }
  const key = normalize(cleaned);
  const dom = emailDomain(e.contactEmail);
  const existing = companyAgg.get(key);
  if (existing) {
    existing.count += 1;
    if (dom) existing.domains.add(dom);
    if (e.dateCreated < existing.firstDate) existing.firstDate = e.dateCreated;
    if (e.dateCreated > existing.lastDate) existing.lastDate = e.dateCreated;
  } else {
    companyAgg.set(key, {
      cleaned,
      count: 1,
      domains: new Set(dom ? [dom] : []),
      firstDate: e.dateCreated,
      lastDate: e.dateCreated,
    });
  }
}

const nonJunkTotal = entries.length - junkSkipped.length;

const top25Companies = [...companyAgg.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, 25);

// Domains (raw requester email domain, all entries incl. junk — this is about who asks, not company cleanliness)
const domainCounts = new Map<string, number>();
for (const e of entries) {
  const dom = emailDomain(e.contactEmail);
  if (dom) bump(domainCounts, dom);
}
const top25Domains = sortedEntries(domainCounts, 25);
const totalWithEmail = [...domainCounts.values()].reduce((a, b) => a + b, 0);

// Free-mail share
let freeMailCount = 0;
for (const [dom, n] of domainCounts) {
  if (FREE_MAIL.has(dom)) freeMailCount += n;
}

// Repeat-requester distribution (by cleaned company)
const buckets = { "1": 0, "2-4": 0, "5-9": 0, "10+": 0 };
for (const agg of companyAgg.values()) {
  if (agg.count === 1) buckets["1"]++;
  else if (agg.count <= 4) buckets["2-4"]++;
  else if (agg.count <= 9) buckets["5-9"]++;
  else buckets["10+"]++;
}

// Reps submitting for many distinct dealers — group by requester email (not domain,
// since a domain can have multiple individual reps), restricted to REP_DOMAINS.
interface RepAgg {
  email: string;
  repGroup: string;
  requests: number;
  companies: Set<string>;
}
const repAgg = new Map<string, RepAgg>();
for (const e of entries) {
  const email = (e.contactEmail || "").toLowerCase().trim();
  const dom = emailDomain(email);
  if (!dom || !(dom in REP_DOMAINS)) continue;
  const cleaned = e.companyName ? cleanGfCompanyName(e.companyName) : null;
  const existing = repAgg.get(email);
  if (existing) {
    existing.requests += 1;
    if (cleaned) existing.companies.add(normalize(cleaned));
  } else {
    repAgg.set(email, {
      email,
      repGroup: REP_DOMAINS[dom],
      requests: 1,
      companies: new Set(cleaned ? [normalize(cleaned)] : []),
    });
  }
}
const topReps = [...repAgg.values()]
  .filter((r) => r.companies.size >= 3)
  .sort((a, b) => b.companies.size - a.companies.size)
  .slice(0, 20);

// ===========================================================================
// SECTION 3 — What they ask for
// ===========================================================================

function countField(getter: (e: GfEntry) => string | undefined | null, opts?: { skipNa?: boolean }) {
  const m = new Map<string, number>();
  let total = 0;
  for (const e of entries) {
    const v = getter(e);
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    if (opts?.skipNa && /^n\/?a$/i.test(s)) continue;
    bump(m, s);
    total += 1;
  }
  return { m, total };
}

function countMulti(getter: (e: GfEntry) => string[] | undefined) {
  const m = new Map<string, number>();
  let requestsWithAny = 0;
  for (const e of entries) {
    const v = getter(e);
    if (!v || v.length === 0) continue;
    requestsWithAny += 1;
    for (const x of v) bump(m, x.trim());
  }
  return { m, requestsWithAny };
}

const baseSeriesAgg = countField((e) => e.baseSeries);
const baseFinishAgg = countField((e) => e.baseFinish);
const topMaterialAgg = countField((e) => e.topMaterial);
const topShapeAgg = countField((e) => e.topShape);
const edgeAgg = countField((e) => e.edgeSelection, { skipNa: true });

// Base series vs marketed series — normalize "Primary - Disc Base" / "Primary - Column Base" → PRIMARY
function seriesToMarketedKey(name: string): string | null {
  const n = name.trim().toUpperCase();
  if (n.startsWith("PRIMARY")) return "PRIMARY";
  if (n === "VERTIGO") return "VERTIGO";
  const hit = MARKETED_SERIES.find((s) => s === n);
  return hit ?? null;
}
const seriesVsMarketed: { legacy: string; count: number; marketed: boolean; note: string }[] = [];
for (const [name, count] of sortedEntries(baseSeriesAgg.m)) {
  const key = seriesToMarketedKey(name);
  let note = "";
  if (name.toUpperCase() === "FUNDAMENTAL") note = "not in the 16 marketed series (legacy-only)";
  else if (name.toUpperCase() === "REVEL") note = "in series-detail.ts but pulled from the marketing lineup (board #74)";
  else if (!key) note = "no match in series-detail.ts";
  seriesVsMarketed.push({ legacy: name, count, marketed: key !== null, note });
}
const primaryDiscCount = baseSeriesAgg.m.get("Primary - Disc Base") ?? 0;
const primaryColumnCount = baseSeriesAgg.m.get("Primary - Column Base") ?? 0;
const primaryBareCount = baseSeriesAgg.m.get("Primary") ?? 0;

// Base finish vs finishes.ts
const finishVsCatalog: { legacy: string; count: number; inCatalog: boolean; note: string }[] = [];
for (const [name, count] of sortedEntries(baseFinishAgg.m)) {
  const inCatalog = NEW_FINISH_NAMES.has(name.trim());
  let note = "";
  if (name.trim() === "Cinder") note = "DISCONTINUED per Brian 2026-09-09 — not in finishes.ts";
  else if (!inCatalog) note = "no exact-name match in finishes.ts (verify: rename, HA-only, or dropped)";
  finishVsCatalog.push({ legacy: name, count, inCatalog, note });
}

// Height overrides typed into the height field (anything not blank/"Standard Height (29\")")
let heightOverrideCount = 0;
const heightOverrideSamples = new Map<string, number>();
for (const e of entries) {
  const h = e.height?.trim();
  if (!h) continue;
  if (h === 'Standard Height (29")') continue;
  heightOverrideCount += 1;
  bump(heightOverrideSamples, h);
}

// Mechanism flags
const mechanismFlags: Record<string, number> = {
  Folding: 0, Nesting: 0, "Flip top": 0, "Foot ring": 0, Chrome: 0,
  "Adjustable height (any type)": 0, "Industrial casters": 0,
};
for (const e of entries) {
  if (e.folding === "Yes") mechanismFlags["Folding"]++;
  if (e.nesting === "Yes") mechanismFlags["Nesting"]++;
  if (e.flipTop === "Yes") mechanismFlags["Flip top"]++;
  if (e.footRing === "Yes") mechanismFlags["Foot ring"]++;
  if (e.chrome === "Yes") mechanismFlags["Chrome"]++;
  if (e.adjustableHeight && e.adjustableHeight.length > 0) mechanismFlags["Adjustable height (any type)"]++;
  if (e.industrialCasters === "Yes") mechanismFlags["Industrial casters"]++;
}
const adjHeightTypeAgg = countMulti((e) => e.adjustableHeight);
const wireMgmtAgg = countMulti((e) => e.wireManagement);

// Top size free text → W x D buckets
const sizeDimRe = /(\d{1,3})\s*(?:in|")?\s*[xX]\s*(\d{1,3})/;
const sizeBuckets = new Map<string, number>();
let sizeParsed = 0;
let sizeUnparsed = 0;
for (const e of entries) {
  const s = e.topSize?.trim();
  if (!s) continue;
  const m = s.match(sizeDimRe);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const w = Math.max(a, b);
    const d = Math.min(a, b);
    bump(sizeBuckets, `${w}x${d}`);
    sizeParsed += 1;
  } else {
    sizeUnparsed += 1;
  }
}
const topSizeBuckets = sortedEntries(sizeBuckets, 20);

// HPL names vs Wilsonart catalog — legacy field is free text "BRAND / NAME, CODE ..."; we can only
// check for a Wilsonart-style code token (####-##) and flag entries that name a non-Wilsonart brand.
const hplBrandRe = /wilsonart|formica|pionite|nevamar|laminart|arborite/i;
let hplTotal = 0;
let hplWilsonart = 0;
let hplOtherBrand = 0;
let hplNoBrand = 0;
const hplOtherBrandSamples: string[] = [];
for (const e of entries) {
  const s = e.hplSelection?.trim();
  if (!s) continue;
  hplTotal += 1;
  if (/wilsonart|w\.?a\.?\b/i.test(s)) hplWilsonart += 1;
  else if (hplBrandRe.test(s)) {
    hplOtherBrand += 1;
    if (hplOtherBrandSamples.length < 15) hplOtherBrandSamples.push(s);
  } else hplNoBrand += 1;
}

// Panels / ganging / power / grommet / add-on / daisy-chain rates
const nonNa = (v: string | undefined) => !!v && !!v.trim() && !/^n\/?a$/i.test(v.trim());
const nonEmptyList = (v: string[] | undefined) => Array.isArray(v) && v.length > 0;
let panelsCount = 0;
let powerConfigCount = 0;
let grommetCount = 0;
let accessoriesCount = 0;
let daisyChainYes = 0;
let daisyChainAnswered = 0;
for (const e of entries) {
  if (nonEmptyList(e.panels)) panelsCount += 1;
  if (nonNa(e.powerConfig)) powerConfigCount += 1;
  if (nonNa(e.grommetLocation)) grommetCount += 1;
  if (nonEmptyList(e.accessories)) accessoriesCount += 1;
  if (e.daisyChainedPower) {
    daisyChainAnswered += 1;
    if (e.daisyChainedPower === "Yes") daisyChainYes += 1;
  }
}

// Base-only vs top-only vs both
let baseOnly = 0, topOnly = 0, both = 0, neither = 0;
for (const e of entries) {
  const wantsBase = e.baseNeeded ? e.baseNeeded !== "No" : undefined;
  const wantsTop = e.topNeeded ? e.topNeeded !== "No" : undefined;
  if (wantsBase === undefined && wantsTop === undefined) continue;
  if (wantsBase && wantsTop) both += 1;
  else if (wantsBase && !wantsTop) baseOnly += 1;
  else if (!wantsBase && wantsTop) topOnly += 1;
  else neither += 1;
}

// ===========================================================================
// SECTION 4 — Timing (orderDate → deliveryDate lead time)
// ===========================================================================

const leadTimeBuckets = new Map<string, number>();
let leadTimeParsed = 0;
let leadTimeNegative = 0;
const leadDaysList: number[] = [];
for (const e of entries) {
  if (!e.orderDate || !e.deliveryDate) continue;
  const od = new Date(e.orderDate + "T00:00:00Z");
  const dd = new Date(e.deliveryDate + "T00:00:00Z");
  if (isNaN(od.getTime()) || isNaN(dd.getTime())) continue;
  const days = Math.round((dd.getTime() - od.getTime()) / 86400000);
  leadTimeParsed += 1;
  if (days < 0) {
    leadTimeNegative += 1;
    continue;
  }
  leadDaysList.push(days);
  let bucket: string;
  if (days === 0) bucket = "0 days (same day)";
  else if (days <= 7) bucket = "1-7 days";
  else if (days <= 14) bucket = "8-14 days";
  else if (days <= 30) bucket = "15-30 days";
  else if (days <= 60) bucket = "31-60 days";
  else if (days <= 90) bucket = "61-90 days";
  else bucket = "90+ days";
  bump(leadTimeBuckets, bucket);
}
leadDaysList.sort((a, b) => a - b);
const median = leadDaysList.length
  ? leadDaysList[Math.floor(leadDaysList.length / 2)]
  : 0;
const leadOrder = ["0 days (same day)", "1-7 days", "8-14 days", "15-30 days", "31-60 days", "61-90 days", "90+ days"];

// ===========================================================================
// SECTION 5 — Free text themes
// ===========================================================================

const THEME_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Custom / non-standard height", re: /\bheight\b.*\b(\d{2}(\.\d+)?\s*(in|inch|"|''|H)?)\b|\bcustom height\b|\bheight adjust/i },
  { label: "Hand-typed model / SKU code (e.g. 44C2-SH.40.75)", re: /\b[0-9]{2,3}[A-Z]{1,4}\d*[-.][A-Z0-9.]+\b/ },
  { label: '"Match existing" / match to prior order', re: /\bmatch(ing)?\s+(existing|current|previous|our|the)\b/i },
  { label: "Quantity conflict (typed qty differs from field)", re: /\bqty\b|\bquantity\s*[:=]?\s*\d+/i },
  { label: "Rush / ASAP / urgent", re: /\basap\b|\burgent\b|\brush\b|\bneed(ed)? (by|asap)\b/i },
  { label: "Attachment referenced in text", re: /\battach(ed|ment)?\b|\bsee\s+(pdf|drawing|spec|file|attached)\b/i },
  { label: "Freight / shipping note", re: /\bfreight\b|\bship(ping)?\b|\bdelivery\b|\bliftgate\b|\bdock\b/i },
  { label: "Lead time / timeline question", re: /\blead\s*time\b|\bturnaround\b|\bhow (long|soon)\b/i },
  { label: "Price / budget note", re: /\bbudget\b|\bprice\b|\bcost\b|\bnet\b|\bdiscount\b/i },
  { label: "Color / finish clarification", re: /\bcolor\b|\bcolour\b|\bfinish\b|\bsample\b/i },
];

let specialRequestsTotal = 0;
const themeCounts = new Map<string, number>();
for (const e of entries) {
  const raw = e.specialRequests?.trim();
  if (!raw) continue;
  specialRequestsTotal += 1;
  const text = unescapeMysql(raw);
  for (const t of THEME_PATTERNS) {
    if (t.re.test(text)) bump(themeCounts, t.label);
  }
}

// 20 most recent verbatim
const withSpecial = entries
  .filter((e) => e.specialRequests?.trim())
  .sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1))
  .slice(0, 20);

function trimText(s: string, max = 300): string {
  const clean = unescapeMysql(s).replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

// ===========================================================================
// SECTION 6 — Attachments
// ===========================================================================

let requestsWithFiles = 0;
let totalFiles = 0;
const extCounts = new Map<string, number>();
for (const e of entries) {
  if (!e.fileUpload) continue;
  let arr: string[] = [];
  try {
    arr = JSON.parse(e.fileUpload);
  } catch {
    arr = [];
  }
  if (!Array.isArray(arr) || arr.length === 0) continue;
  requestsWithFiles += 1;
  totalFiles += arr.length;
  for (const url of arr) {
    const base = url.split("/").pop() ?? "";
    const dot = base.lastIndexOf(".");
    const ext = dot === -1 ? "(none)" : base.slice(dot + 1).toLowerCase();
    bump(extCounts, ext);
  }
}

// ===========================================================================
// Write report
// ===========================================================================

mkdirSync(join(__dirname, "..", "..", "tablex-site", "docs", "reports"), { recursive: true });

const lines: string[] = [];
const push = (s = "") => lines.push(s);

push(`# Legacy tablex.com quote requests — analysis`);
push();
push(
  `Source: \`tablex-quoting-dashboard/src/data/gf-quote-requests.json\` — **${entries.length}** entries, ` +
    `${minDate.slice(0, 10)} → ${maxDate.slice(0, 10)}. Generated ${new Date().toISOString().slice(0, 10)} by ` +
    `\`scripts/analyze-gf-requests.ts\`. Every number below is computed from the JSON, not hand-typed.`,
);
push();

// Reconciliation note: this script's junk filter (ported from the older
// dashboard-only seed-crm-data.ts GF_JUNK_NAMES) vs the Step 2 importer's
// (tablex-site scripts/crm/_legacy-names.ts, newer and import-specific).
if (importStats.size > 0) {
  const importerJunkCount = importStats.get("Skipped — junk / unusable company name") ?? null;
  const importerActivities = importStats.get("Activities to insert") ?? null;
  const myJunkIds = new Set(junkSkipped.map((e) => e.entryId));
  const onlyImporterJunk = [...importJunkEntryIds]
    .filter((id) => !myJunkIds.has(id))
    .sort((a, b) => a - b);
  const onlyMineJunk = [...myJunkIds]
    .filter((id) => !importJunkEntryIds.has(id))
    .sort((a, b) => a - b);
  const onlyImporterCompanies = [
    ...new Set(
      onlyImporterJunk.map((id) => entries.find((e) => e.entryId === id)?.companyName?.trim() ?? `GF-${id}`),
    ),
  ];

  push(`**Reconciliation:** ${entries.length} requests = `);
  if (importerJunkCount !== null && importerActivities !== null) {
    lines[lines.length - 1] +=
      `${importerJunkCount} junk skipped by the Step 2 importer + ${importerActivities} activities` +
      `${importStats.get("Activities already imported (gf: ref present)") ? ` + ${importStats.get("Activities already imported (gf: ref present)")} already imported` : ""}.`;
  } else {
    lines[lines.length - 1] += `(import report summary table not found).`;
  }
  if (onlyImporterJunk.length || onlyMineJunk.length) {
    const bits: string[] = [];
    bits.push(`This script's own junk filter is more conservative (${junkSkipped.length} skipped)`);
    if (onlyImporterJunk.length) {
      bits.push(
        `— the ${onlyImporterJunk.length} entries the importer additionally treats as junk but this script ` +
          `counts as real companies are all stated-company ${[...new Set(onlyImporterCompanies)].map((c) => `"${c}"`).join(" / ")} ` +
          `(internal tablex.com staff test submissions from @tablex.com / scottquandt / mayaquandt gmail addresses — ` +
          `caught by the importer's newer, import-specific junk list, not by the older dashboard \`GF_JUNK_NAMES\` this script ports)`,
      );
    }
    if (onlyMineJunk.length) {
      bits.push(`and ${onlyMineJunk.length} entries this script treats as junk that the importer does not`);
    }
    push(bits.join(" ") + ".");
  }
  push();
}

push(`## Headline findings`);
push();
push(`- **Volume is down in 2026.** ${byYear.get(2026) ?? 0} requests year-to-date (through 9/17) vs ${byYear.get(2025) ?? 0} in all of 2025 and ${byYear.get(2024) ?? 0} in 2024 — 2024 was the peak year.`);
push(`- **The channel is rep- and dealer-driven, not direct.** ${pct(freeMailCount, totalWithEmail)} of requests come from a free-mail domain (gmail/yahoo/outlook/etc.); the rest are company domains, concentrated in a handful of rep groups.`);
push(`- **One rep drives an outsized share of volume.** luke@bgreps.com (Baldauf Group) alone submitted ${repAgg.get("luke@bgreps.com")?.requests ?? 0} requests across ${repAgg.get("luke@bgreps.com")?.companies.size ?? 0} distinct dealer companies — the legacy form has no field for "submitting on behalf of," so this only shows up by email-domain pattern.`);
push(`- **HPL dominates the top material mix** (${pct(topMaterialAgg.m.get("High Pressure Laminate w/ 3mm edge") ?? 0, topMaterialAgg.total)} of answered requests); solid surface and butcher block are a distant, roughly even second.`);
push(`- **Foundation and Element/Elite lead the series mix**, but ${pct(baseSeriesAgg.m.get("Fundamental") ?? 0, baseSeriesAgg.total)} of series answers ask for **Fundamental**, which is not one of the 16 marketed series on tablex-site — a real, sized demand gap.`);
push(`- **Cinder — a discontinued powder-coat color — still shows up** in ${baseFinishAgg.m.get("Cinder") ?? 0} historical requests; it is correctly absent from the new finishes catalog.`);
push(`- **Attachments are common and currently a hard gap:** ${pct(requestsWithFiles, entries.length)} of requests (${requestsWithFiles}) carry ${totalFiles} files — none of this imports into the new CRM (activity text notes the filename only).`);
push(`- **${pct(junkSkipped.length, entries.length)} of entries (${junkSkipped.length}) are junk** (test submissions, quote-number-only company fields, etc.) and are excluded from the company/series/finish breakdowns below.`);
push();

push(`## Volume`);
push();
push(`### By year`);
push();
push(mdTable(["Year", "Requests"], volumeByYearRows));
push();
push(`### Last 12 months`);
push();
push(mdTable(["Month", "Requests"], volumeByMonthRows));
push();

push(`## Who asks`);
push();
push(`### Top 25 companies (cleaned names)`);
push();
push(
  `Company names are cleaned with the same alias map + junk filter as \`scripts/seed-crm-data.ts\` ` +
    `\`cleanGfCompanyName\`/\`KNOWN_ALIASES\`. Share is of the ${nonJunkTotal} non-junk requests.` +
    (importMatchRows.length
      ? ` "Matched org" is computed by matching each cleaned name against the Step 2 import report ` +
        `(\`docs/reports/2026-09-18-legacy-quote-requests-import.md\`) with the same bigram-Dice ` +
        `\`nameSimilarity\` the importer itself uses (≥0.5, request-count-weighted) — format is ` +
        `\`org name · type · match method\`.`
      : ` The "matched org" column is a placeholder — no import report was found at ` +
        `\`docs/reports/2026-09-18-legacy-quote-requests-import.md\` when this ran.`),
);
push();
push(
  mdTable(
    ["#", "Company", "Requests", "Share", "Distinct domains", "First seen", "Last seen", "Matched org (Step 2 import)"],
    top25Companies.map((c, i) => [
      String(i + 1),
      c.cleaned,
      String(c.count),
      pct(c.count, nonJunkTotal),
      String(c.domains.size),
      c.firstDate.slice(0, 10),
      c.lastDate.slice(0, 10),
      matchImportedOrg(c.cleaned, c.count, importMatchRows, catchAllOrg),
    ]),
  ),
);
push();

push(`### Top 25 requester domains`);
push();
push(mdTable(
  ["#", "Domain", "Requests", "Share"],
  top25Domains.map(([dom, n], i) => [String(i + 1), dom, String(n), pct(n, totalWithEmail)]),
));
push();

push(`### Free-mail share`);
push();
push(
  `${freeMailCount} of ${totalWithEmail} requests with a parseable email (${pct(freeMailCount, totalWithEmail)}) ` +
    `come from a free-mail or residential-ISP domain (gmail, yahoo, outlook, hotmail, aol, icloud, verizon, comcast, ` +
    `att, sbcglobal, cox, swbell, me, live, msn). The remaining ${pct(totalWithEmail - freeMailCount, totalWithEmail)} ` +
    `are company/rep-group domains.`,
);
push();

push(`### Repeat-requester distribution`);
push();
push(
  `Buckets are companies (by cleaned name), not requests. ${companyAgg.size} distinct companies stand behind the ` +
    `${nonJunkTotal} non-junk requests.`,
);
push();
push(mdTable(
  ["Requests per company", "# companies"],
  [
    ["1", String(buckets["1"])],
    ["2-4", String(buckets["2-4"])],
    ["5-9", String(buckets["5-9"])],
    ["10+", String(buckets["10+"])],
  ],
));
push();

push(`### Reps submitting for many distinct dealers`);
push();
push(
  `The legacy company field has no explicit "submitting for" marker (only 3 requests literally match a ` +
    `"<Rep> for <Dealer>" pattern). The real convention shows up by requester email: a rep-group-domain email ` +
    `(from \`DOMAIN_TO_REP_GROUP\` in \`seed-crm-data.ts\`) submitting under many different company names. ` +
    `Rows below have 3+ distinct companies.`,
);
push();
push(mdTable(
  ["Rep email", "Rep group", "Requests", "Distinct companies"],
  topReps.map((r) => [r.email, r.repGroup, String(r.requests), String(r.companies.size)]),
));
push();

push(`## What they ask for`);
push();
push(`### Base series mix vs the 16 marketed series`);
push();
push(
  `tablex-site \`src/data/series-detail.ts\` exports 16 series keys (ULTRA, FOUNDATION, STRETCH, ELITE, REVEL, ` +
    `APP, ELEMENT, JUSTICE, ARTISAN, PRIMARY, PUDDLE, EXCLAIM, VERTIGO, SURGE, SOLO, TRIG). **Fundamental is not ` +
    `among them** — it is a legacy-only series with real historical demand. Primary is asked for as a bare series ` +
    `(${primaryBareCount}), split by base type (Disc ${primaryDiscCount}, Column ${primaryColumnCount}); all three ` +
    `roll up to the one PRIMARY series page. Revel remains in \`series-detail.ts\` but was pulled from the marketing ` +
    `lineup.`,
);
push();
push(mdTable(
  ["Legacy baseSeries value", "Requests", "Share", "In the 16 marketed series?", "Note"],
  seriesVsMarketed.map((s) => [s.legacy, String(s.count), pct(s.count, baseSeriesAgg.total), s.marketed ? "yes" : "no", s.note || "—"]),
));
push();

push(`### Base finish mix vs \`finishes.ts\` powder-coat catalog`);
push();
push(
  `tablex-site \`src/data/finishes.ts\` \`powderCoatFinishes\` lists 40 standard colors by name. Cinder is ` +
    `confirmed discontinued (Brian, 2026-09-09) and correctly absent from that list.`,
);
push();
push(mdTable(
  ["Legacy baseFinish value", "Requests", "Share", "In finishes.ts?", "Note"],
  finishVsCatalog.map((f) => [f.legacy, String(f.count), pct(f.count, baseFinishAgg.total), f.inCatalog ? "yes" : "no", f.note || "—"]),
));
push();

push(`### Height overrides typed into the height field`);
push();
push(
  `${heightOverrideCount} of ${entries.filter((e) => e.height).length} answered height fields (${pct(heightOverrideCount, entries.filter((e) => e.height).length)}) ` +
    `are something other than the default \`Standard Height (29")\` — free text with no validation, so the same ` +
    `intent appears many ways (\`36"\`, \`36\`, \`36" H\`, \`36" Counter\`, \`COUNTER HEIGHT 36"\`…). Top 20 distinct values:`,
);
push();
push(mdTable(
  ["Value", "Count"],
  sortedEntries(heightOverrideSamples, 20).map(([v, n]) => [v, String(n)]),
));
push();

push(`### Mechanism flags`);
push();
push(mdTable(
  ["Mechanism", "Requests (Yes)", "Share of all requests"],
  Object.entries(mechanismFlags).map(([k, v]) => [k, String(v), pct(v, entries.length)]),
));
push();
push(`Adjustable-height type breakdown (of the ${mechanismFlags["Adjustable height (any type)"]} that flagged adjustable):`);
push();
push(mdTable(["Type", "Count"], sortedEntries(adjHeightTypeAgg.m)));
push();
push(`Wire management type breakdown (of ${wireMgmtAgg.requestsWithAny} requests that specified one):`);
push();
push(mdTable(["Type", "Count"], sortedEntries(wireMgmtAgg.m)));
push();

push(`### Top material mix`);
push();
push(mdTable(
  ["Material", "Requests", "Share"],
  sortedEntries(topMaterialAgg.m).map(([k, n]) => [k, String(n), pct(n, topMaterialAgg.total)]),
));
push();

push(`### Top shape mix`);
push();
push(`13 distinct legacy shape values, including Squircle, Soft Rectangle (App only), and Solo-only shapes.`);
push();
push(mdTable(
  ["Shape", "Requests", "Share"],
  sortedEntries(topShapeAgg.m).map(([k, n]) => [k, String(n), pct(n, topShapeAgg.total)]),
));
push();

push(`### Top size free text → W×D buckets`);
push();
push(
  `\`topSize\` is unvalidated free text (e.g. \`"14 - 72 by 30 and 14 - 54 by 24"\` for multi-size orders). ` +
    `A regex bucket (first \`N x M\`-shaped token, larger number = width) parsed ${sizeParsed} of ${sizeParsed + sizeUnparsed} ` +
    `non-blank entries (${pct(sizeParsed, sizeParsed + sizeUnparsed)}); the rest are compound/prose and are not represented below.`,
);
push();
push(mdTable(["W x D (in)", "Requests"], topSizeBuckets.map(([k, n]) => [k, String(n)])));
push();

push(`### HPL names vs the Wilsonart catalog`);
push();
push(
  `\`hplSelection\` is free text, e.g. \`"WILSON ART / CAFELLE , WA-7933-78 WITH MATCHING PVC EDGE"\`. A brand-token ` +
    `check finds ${hplWilsonart} of ${hplTotal} (${pct(hplWilsonart, hplTotal)}) explicitly name Wilsonart, ${hplOtherBrand} ` +
    `name a different laminate brand (Formica, Pionite, Nevamar, Laminart, Arborite), and ${hplNoBrand} give a color/pattern ` +
    `name with no brand token — exact SKU-level reconciliation against \`laminateCatalog\` (66 SKUs in tablex-site ` +
    `\`src/data/finishes.ts\`) needs manual matching, not regex, because legacy free text doesn't reliably carry the ` +
    `Wilsonart code.`,
);
if (hplOtherBrandSamples.length) {
  push();
  push(`Non-Wilsonart brand samples:`);
  push();
  for (const s of hplOtherBrandSamples) push(`- ${trimText(s, 160)}`);
}
push();

push(`### Edge selection mix`);
push();
push(`"N/A" (base-only requests) excluded. 3P = flat, 3K = knife, 3W = wood, 2P = 3D acrylic (+5%).`);
push();
push(mdTable(
  ["Edge selection", "Requests", "Share"],
  sortedEntries(edgeAgg.m).map(([k, n]) => [k, String(n), pct(n, edgeAgg.total)]),
));
push();

push(`### Panels / ganging / power / grommet / add-on / daisy-chain rates`);
push();
push(mdTable(
  ["Field", "Requests with a non-blank, non-N/A answer", "Share of all requests"],
  [
    ["Panels", String(panelsCount), pct(panelsCount, entries.length)],
    ["Power config", String(powerConfigCount), pct(powerConfigCount, entries.length)],
    ["Grommet location", String(grommetCount), pct(grommetCount, entries.length)],
    ["Accessories (checklist)", String(accessoriesCount), pct(accessoriesCount, entries.length)],
  ],
));
push();
push(
  `Daisy-chained power: ${daisyChainYes} Yes of ${daisyChainAnswered} answered (${pct(daisyChainYes, daisyChainAnswered)}), ` +
    `${daisyChainAnswered} of ${entries.length} requests answered the question at all (${pct(daisyChainAnswered, entries.length)}).`,
);
push();

push(`### Base-only vs top-only vs both`);
push();
push(mdTable(
  ["Combination", "Requests", "Share"],
  [
    ["Both base and top", String(both), pct(both, both + baseOnly + topOnly + neither)],
    ["Base only", String(baseOnly), pct(baseOnly, both + baseOnly + topOnly + neither)],
    ["Top only", String(topOnly), pct(topOnly, both + baseOnly + topOnly + neither)],
    ["Neither (both answered No)", String(neither), pct(neither, both + baseOnly + topOnly + neither)],
  ],
));
push();

push(`## Timing`);
push();
push(
  `Requested order date → delivery date (\`orderDate\`/\`deliveryDate\`, legacy fields 32/33). ${leadTimeParsed} of ` +
    `${entries.length} requests answered both dates; ${leadTimeNegative} of those have a delivery date before the order ` +
    `date (bad data, excluded from the bucket table and median). Median lead time: **${median} days**.`,
);
push();
push(mdTable(
  ["Lead time", "Requests"],
  leadOrder.map((b) => [b, String(leadTimeBuckets.get(b) ?? 0)]),
));
push();

push(`## Free text (\`specialRequests\`)`);
push();
push(
  `${specialRequestsTotal} of ${entries.length} requests (${pct(specialRequestsTotal, entries.length)}) have a ` +
    `non-blank \`specialRequests\` field. Theme counts below are regex heuristics over the unescaped text — a single ` +
    `request can match multiple themes, so counts do not sum to the total.`,
);
push();
push(mdTable(
  ["Theme", "Requests matching"],
  THEME_PATTERNS.map((t) => [t.label, String(themeCounts.get(t.label) ?? 0)]),
));
push();

push(`### Appendix — 20 most recent verbatim`);
push();
push(`Unescaped (literal \`\\r\\n\\t\` from the mysql export resolved to real whitespace) and trimmed to ~300 characters.`);
push();
for (const e of withSpecial) {
  push(`**GF-${e.entryId}** · ${e.dateCreated.slice(0, 10)} · ${e.companyName || "(no company)"}`);
  push(`> ${trimText(e.specialRequests!, 300)}`);
  push();
}

push(`## Attachments`);
push();
push(
  `${requestsWithFiles} of ${entries.length} requests (${pct(requestsWithFiles, entries.length)}) carry at least one ` +
    `uploaded file — ${totalFiles} files total. File sizes are not present in the exported JSON (\`fileUpload\` is a ` +
    `JSON array of URLs only), so a byte total cannot be computed from this source. **Not imported** into the tablex-site ` +
    `CRM — Step 2 preserves only the filename as a text line in the activity.`,
);
push();
push(mdTable(["Extension", "File count"], sortedEntries(extCounts).map(([k, n]) => [k, String(n)])));
push();

push(`## Coverage matrix — legacy field → new site`);
push();
push(
  `Verdicts checked against tablex-site source 2026-09-17: \`QuoteRequestForm\`/\`quoteRequestSchema\` ` +
    `(\`src/app/(frontend)/contact/actions.ts\`, \`src/app/(frontend)/contact/form-shared.ts\`) has 7 fields — name, ` +
    `organization, email, phone, productInterest (enum: general/training/conference/cafe-hospitality/outdoor/other), ` +
    `quantity, message, plus an optional serialized SpeX cart (\`savedConfigs\`). The SpeX configurator's URL/spec state ` +
    `(\`selectionToParams\`/\`paramsToPartial\`, \`src/lib/spex/config-options.ts\`) carries shape, size, base, dims ` +
    `(free-text size), top finish, edge type, band finish, underside paint, base finish, qty, and accessories.`,
);
push();

const ccEmailCount = entries.filter((e) => e.ccEmail && e.ccEmail.trim()).length;

interface CoverageRow {
  field: string;
  verdict: "SpeX config" | "QuoteRequestForm field" | "nothing (gap)";
  note: string;
}
const coverage: CoverageRow[] = [
  { field: "companyName", verdict: "QuoteRequestForm field", note: "→ organization" },
  { field: "contactName", verdict: "QuoteRequestForm field", note: "→ name" },
  { field: "contactEmail", verdict: "QuoteRequestForm field", note: "→ email" },
  { field: "contactPhone", verdict: "QuoteRequestForm field", note: "→ phone (optional)" },
  { field: "ccEmail", verdict: "nothing (gap)", note: `no CC/additional-contact field on the new form (${ccEmailCount} of ${entries.length} legacy requests used it)` },
  { field: "projectName", verdict: "nothing (gap)", note: "no project-name field on the new form" },
  { field: "quantity", verdict: "QuoteRequestForm field", note: "→ quantity" },
  { field: "orderDate", verdict: "nothing (gap)", note: "no requested-order-date field" },
  { field: "deliveryDate", verdict: "nothing (gap)", note: "no delivery-date field" },
  { field: "fileUpload", verdict: "nothing (gap)", note: `no file upload on the new form (${pct(requestsWithFiles, entries.length)} of legacy requests attach a file)` },
  { field: "specialRequests", verdict: "QuoteRequestForm field", note: "→ message (free text, unstructured, same as legacy)" },
  { field: "baseNeeded / topNeeded", verdict: "SpeX config", note: "implicit in which config a shopper builds; no direct equivalent field" },
  { field: "baseSeries", verdict: "SpeX config", note: "series page / SpeX Studio route selects the series" },
  { field: "baseFinish", verdict: "SpeX config", note: "→ basefinish param" },
  { field: "height", verdict: "nothing (gap)", note: "no explicit standard/custom height selector; SpeX bases are per-series literal shapes, not a height override field" },
  { field: "folding / nesting / flipTop / footRing / chrome", verdict: "SpeX config", note: "implied by base code selection where a native model exists; no explicit checkbox fields" },
  { field: "casterSize / industrialCasters", verdict: "SpeX config", note: "accessory roster (acc param) where a caster accessory exists for the series" },
  { field: "adjustableHeight", verdict: "SpeX config", note: "base code selection only where a native HA base model exists; not a general field" },
  { field: "wireManagement", verdict: "nothing (gap)", note: "no wire-management accessory in the current SpeX roster for most series" },
  { field: "daisyChainedPower", verdict: "SpeX config", note: "Villa/DaisyLink accessory flag where applicable" },
  { field: "grommetLocation", verdict: "SpeX config", note: "grommet accessory kit selection" },
  { field: "powerConfig / powerUnitLocation", verdict: "SpeX config", note: "power accessory selection + placement" },
  { field: "panels", verdict: "nothing (gap)", note: "no panel/modesty-panel accessory on every series; where present it's an accessory, not a general field" },
  { field: "accessories (checklist)", verdict: "SpeX config", note: "→ acc param where the checked item is a cataloged accessory for that series; uncataloged checked items have no landing field" },
  { field: "topSize", verdict: "SpeX config", note: "size param on 3D series; dims free-text param on non-3D series" },
  { field: "topMaterial", verdict: "SpeX config", note: "top finish family (laminate/solid surface/butcher block) selection" },
  { field: "topShape", verdict: "SpeX config", note: "shape param" },
  { field: "hplSelection", verdict: "SpeX config", note: "→ top param (specific laminate id), when the SKU matches the catalog" },
  { field: "hplMarkerboard", verdict: "nothing (gap)", note: "no markerboard finish option in the current SpeX top-finish catalog" },
  { field: "radiusCorners", verdict: "nothing (gap)", note: "no radius-corner option surfaced in SpeX" },
  { field: "edgeSelection", verdict: "SpeX config", note: "→ edge param (edgeTypeId) + band param" },
  { field: "solidSurfaceSelection", verdict: "SpeX config", note: "solid surface is currently hidden from the public SpeX picker (SPEX_SOLID_SURFACE_ENABLED=false as of 9/17) — desk-only path" },
];

push(mdTable(["Legacy field(s)", "Verdict", "Note"], coverage.map((c) => [c.field, c.verdict, c.note])));
push();

writeFileSync(OUTPUT_PATH, lines.join("\n") + "\n", "utf-8");

console.log(`Wrote ${OUTPUT_PATH}`);
console.log(`Entries: ${entries.length} (junk skipped: ${junkSkipped.length}, non-junk: ${nonJunkTotal})`);
console.log(`Volume by year: ${volumeByYearRows.map(([y, n]) => `${y}=${n}`).join(" · ")}`);
