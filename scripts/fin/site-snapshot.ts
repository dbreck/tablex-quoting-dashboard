/**
 * Snapshot the LIVE tablex.com Supabase project (read-only) into the dashboard's
 * fin_site_quotes / fin_site_signups / fin_web_requests warehouse tables (migration 029),
 * and update fin_sources rows 'site' and 'gf'.
 *
 * Usage:
 *   npx tsx scripts/fin/site-snapshot.ts                      # write
 *   npx tsx scripts/fin/site-snapshot.ts --dry-run            # counts + samples, no writes
 *   npx tsx scripts/fin/site-snapshot.ts --site-env <path>    # load SITE_* from another dotenv
 *       (a tablex-site .env.local is accepted: its NEXT_PUBLIC_SUPABASE_URL /
 *        SUPABASE_SERVICE_ROLE_KEY are mapped to SITE_SUPABASE_URL / SITE_SUPABASE_SERVICE_ROLE_KEY)
 *
 * Env (.env.local): NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (dashboard, destination),
 *                   SITE_SUPABASE_URL + SITE_SUPABASE_SERVICE_ROLE_KEY (tablex-site, source, SELECT only).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { join } from "path";
import { readFileSync } from "fs";
import { config, parse } from "dotenv";
import {
  normalizeCompany,
  type FinSiteQuoteRow,
  type FinSiteSignupRow,
  type FinWebRequestRow,
  type FinSourceRow,
} from "../../src/lib/fin/types";

config({ path: join(__dirname, "..", "..", ".env.local") });

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const siteEnvIdx = args.indexOf("--site-env");
const SITE_ENV_PATH = siteEnvIdx >= 0 ? args[siteEnvIdx + 1] : null;

let siteUrl = process.env.SITE_SUPABASE_URL;
let siteKey = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;
if (SITE_ENV_PATH) {
  const parsed = parse(readFileSync(SITE_ENV_PATH));
  siteUrl = parsed.SITE_SUPABASE_URL ?? parsed.NEXT_PUBLIC_SUPABASE_URL ?? siteUrl;
  siteKey = parsed.SITE_SUPABASE_SERVICE_ROLE_KEY ?? parsed.SUPABASE_SERVICE_ROLE_KEY ?? siteKey;
}
if (!siteUrl || !siteKey) {
  console.error(
    "Missing SITE_SUPABASE_URL and/or SITE_SUPABASE_SERVICE_ROLE_KEY (tablex-site Supabase project sfwegefbgudsgricduat).\n" +
      "Add both to .env.local, or pass --site-env <path to tablex-site/.env.local>."
  );
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for the dashboard in .env.local.");
  process.exit(1);
}

const opts = { auth: { autoRefreshToken: false, persistSession: false } };
const dest = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, opts);
const site = createClient(siteUrl, siteKey, opts); // READ ONLY: only .select() is ever called on this client

const PAGE = 1000;
const BATCH = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/** Paginated read of a source table (select only). */
async function fetchAll(
  client: SupabaseClient,
  table: string,
  columns: string,
  filter?: (q: ReturnType<ReturnType<SupabaseClient["from"]>["select"]>) => unknown
): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = client.from(table).select(columns).order("id", { ascending: true }).range(from, from + PAGE - 1);
    if (filter) q = filter(q) ?? q;
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

async function probe(table: string): Promise<string[]> {
  const { data, error } = await site.from(table).select("*").limit(1);
  if (error) throw new Error(`probe ${table}: ${error.message}`);
  const cols = data && data[0] ? Object.keys(data[0]) : [];
  console.log(`  ${table} columns: ${cols.join(", ") || "(empty table)"}`);
  return cols;
}

async function upsert(table: string, rows: Row[], onConflict: string) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await dest.from(table).upsert(rows.slice(i, i + BATCH), { onConflict });
    if (error) throw new Error(`upsert ${table}: ${error.message}`);
  }
}

function dedupe<T extends Row>(rows: T[], key: keyof T): T[] {
  const m = new Map<unknown, T>();
  for (const r of rows) m.set(r[key], r);
  return [...m.values()];
}

function day(iso: string | null | undefined): string | null {
  return iso ? iso.slice(0, 10) : null;
}

function minMax(values: (string | null | undefined)[]): [string | null, string | null] {
  let lo: string | null = null;
  let hi: string | null = null;
  for (const v of values) {
    if (!v) continue;
    if (!lo || v < lo) lo = v;
    if (!hi || v > hi) hi = v;
  }
  return [lo, hi];
}

const blank = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return !s || s.toLowerCase() === "none" ? null : s;
};

const yesNo = (v: unknown): boolean | null => {
  const s = blank(v);
  if (!s) return null;
  if (/^y/i.test(s)) return true;
  if (/^n/i.test(s)) return false;
  return null;
};

const toIntOrNull = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};

/** GF dateCreated is "YYYY-MM-DD HH:MM:SS" with no zone; treat as UTC. */
function gfTimestamp(s: string): string {
  return new Date(s.replace(" ", "T") + "Z").toISOString();
}

function sample(label: string, rows: Row[]) {
  console.log(`\n--- ${label}: ${rows.length} rows; 3 samples ---`);
  for (const r of rows.slice(0, 3)) console.log(JSON.stringify(r));
}

async function main() {
  console.log(`site-snapshot ${DRY_RUN ? "(DRY RUN) " : ""}source=${siteUrl} dest=${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log("Probing source columns:");
  for (const t of ["quotes", "quote_lines", "organizations", "profiles", "activities"]) await probe(t);

  // ---------- Source reads ----------
  console.log("\nReading source…");
  const [orgs, quotes, lines, profiles, acts] = await Promise.all([
    fetchAll(site, "organizations", "id,name,type,parent_org_id"),
    fetchAll(
      site,
      "quotes",
      "id,quote_number,org_id,status,pricing_tier,subtotal_list_cents,subtotal_net_cents,created_at,submitted_at,quoted_at,accepted_at,priced_source,kind,ship_to,po_number"
    ),
    fetchAll(site, "quote_lines", "id,quote_id,kind"),
    fetchAll(site, "profiles", "id,role,org_id,created_at"),
    fetchAll(site, "activities", "id,org_id,content,external_ref,created_at", (q) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q as any).or("external_ref.like.gf:%,external_ref.like.qr:%")
    ),
  ]);
  console.log(
    `  organizations ${orgs.length} · quotes ${quotes.length} · quote_lines ${lines.length} · profiles ${profiles.length} · activities(gf/qr) ${acts.length}`
  );

  const orgById = new Map<string, Row>(orgs.map((o) => [o.id, o]));

  // ---------- 1. fin_site_quotes ----------
  const lineAgg = new Map<string, { n: number; custom: boolean }>();
  for (const l of lines) {
    const a = lineAgg.get(l.quote_id) ?? { n: 0, custom: false };
    a.n += 1;
    if (l.kind === "custom" || l.kind === "part") a.custom = true;
    lineAgg.set(l.quote_id, a);
  }
  const quoteRows: FinSiteQuoteRow[] = quotes.map((q) => {
    const org = q.org_id ? orgById.get(q.org_id) : undefined;
    const agg = lineAgg.get(q.id);
    return {
      id: q.id,
      quote_number: q.quote_number ?? null,
      kind: q.kind ?? null,
      status: q.status ?? null,
      priced_source: q.priced_source ?? null,
      pricing_tier: q.pricing_tier ?? null,
      org_id: q.org_id ?? null,
      org_name: org?.name ?? null,
      org_type: org?.type ?? null,
      rep_org_id: org?.parent_org_id ?? null,
      created_at: q.created_at ?? null,
      submitted_at: q.submitted_at ?? null,
      quoted_at: q.quoted_at ?? null,
      accepted_at: q.accepted_at ?? null,
      subtotal_list_cents: q.subtotal_list_cents ?? null,
      subtotal_net_cents: q.subtotal_net_cents ?? null,
      po_number: q.po_number ?? null,
      ship_to_state: q.ship_to ?? null,
      line_count: agg?.n ?? 0,
      has_custom_line: agg?.custom ?? false,
    };
  });

  // ---------- 2. fin_site_signups ----------
  const signupRows: FinSiteSignupRow[] = profiles.map((p) => ({
    profile_id: p.id,
    role: p.role ?? null,
    org_id: p.org_id ?? null,
    org_type: p.org_id ? orgById.get(p.org_id)?.type ?? null : null,
    created_at: p.created_at,
  }));

  // ---------- 3. fin_web_requests ----------
  const gfJson: Row[] = JSON.parse(readFileSync(join(__dirname, "..", "..", "src", "data", "gf-quote-requests.json"), "utf8"));
  const gfById = new Map<string, Row>(gfJson.map((r) => [String(r.entryId), r]));
  const requestRows: FinWebRequestRow[] = [];
  const seenGf = new Set<string>();

  const gfEnrich = (r: Row | undefined) => {
    const company = blank(r?.companyName);
    return {
      company,
      normalized_company: company ? normalizeCompany(company) || null : null,
      series: blank(r?.baseSeries),
      finish: blank(r?.baseFinish),
      qty: toIntOrNull(r?.quantity),
      top_needed: yesNo(r?.topNeeded),
      base_needed: yesNo(r?.baseNeeded),
    };
  };

  let qrCount = 0;
  let gfActivityCount = 0;
  for (const a of acts) {
    const ref: string = a.external_ref;
    if (ref.startsWith("gf:")) {
      gfActivityCount += 1;
      const entryId = ref.slice(3);
      seenGf.add(entryId);
      const j = gfById.get(entryId);
      requestRows.push({
        id: ref,
        source: "gf",
        requested_at: a.created_at,
        ...gfEnrich(j),
        org_id: a.org_id ?? null,
        customer_id: null,
      });
    } else if (ref.startsWith("qr:")) {
      qrCount += 1;
      const m = typeof a.content === "string" ? a.content.match(/^\s*Company\s*:\s*(.+)$/im) : null;
      const company = m ? m[1].trim() || null : null;
      requestRows.push({
        id: ref,
        source: "qr",
        requested_at: a.created_at,
        company,
        normalized_company: company ? normalizeCompany(company) || null : null,
        series: null,
        finish: null,
        qty: null,
        top_needed: null,
        base_needed: null,
        org_id: a.org_id ?? null,
        customer_id: null,
      });
    }
  }
  let gfOnlyJson = 0;
  for (const j of gfJson) {
    const entryId = String(j.entryId);
    if (seenGf.has(entryId)) continue;
    gfOnlyJson += 1;
    requestRows.push({
      id: `gf:${entryId}`,
      source: "gf",
      requested_at: gfTimestamp(j.dateCreated),
      ...gfEnrich(j),
      org_id: null,
      customer_id: null,
    });
  }

  const quotesOut = dedupe(quoteRows, "id");
  const signupsOut = dedupe(signupRows, "profile_id");
  const requestsOut = dedupe(requestRows, "id");

  // ---------- 4. fin_sources ----------
  const now = new Date().toISOString();
  const [qFrom, qTo] = minMax(quotesOut.map((q) => day(q.created_at)));
  const gfReq = requestsOut.filter((r) => r.source === "gf");
  const [gFrom, gTo] = minMax(gfReq.map((r) => day(r.requested_at)));
  const siteSource: FinSourceRow = {
    source: "site",
    last_synced_at: now,
    coverage_from: qFrom,
    coverage_to: qTo,
    row_count: quotesOut.length,
    notes: `quotes ${quotesOut.length} · signups ${signupsOut.length} · qr requests ${qrCount}`,
  };
  const gfSource: FinSourceRow = {
    source: "gf",
    last_synced_at: now,
    coverage_from: gFrom,
    coverage_to: gTo,
    row_count: gfReq.length,
    notes: `gf requests ${gfReq.length} (${gfActivityCount} in site activities, ${gfOnlyJson} JSON-only)`,
  };

  sample("fin_site_quotes", quotesOut);
  sample("fin_site_signups", signupsOut);
  sample("fin_web_requests (gf)", gfReq);
  sample("fin_web_requests (qr)", requestsOut.filter((r) => r.source === "qr"));
  console.log("\n--- fin_sources ---");
  console.log(JSON.stringify(siteSource));
  console.log(JSON.stringify(gfSource));

  let deleted = 0;
  if (!DRY_RUN) {
    await upsert("fin_site_quotes", quotesOut, "id");
    await upsert("fin_site_signups", signupsOut, "profile_id");
    await upsert("fin_web_requests", requestsOut, "id");

    // Drop snapshot quotes that no longer exist in the source.
    const live = new Set(quotesOut.map((q) => q.id));
    const existing: Row[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await dest.from("fin_site_quotes").select("id").order("id").range(from, from + PAGE - 1);
      if (error) throw new Error(`read fin_site_quotes: ${error.message}`);
      existing.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
    const stale = existing.map((r) => r.id as string).filter((id) => !live.has(id));
    for (let i = 0; i < stale.length; i += BATCH) {
      const { error } = await dest.from("fin_site_quotes").delete().in("id", stale.slice(i, i + BATCH));
      if (error) throw new Error(`delete stale fin_site_quotes: ${error.message}`);
    }
    deleted = stale.length;

    await upsert("fin_sources", [siteSource, gfSource], "source");
  }

  // ---------- 6. Summary ----------
  console.log(`\n=== Summary${DRY_RUN ? " (dry run, nothing written)" : ""} ===`);
  console.table([
    { table: "fin_site_quotes", rows: quotesOut.length, from: qFrom, to: qTo, staleDeleted: DRY_RUN ? "-" : deleted },
    { table: "fin_site_signups", rows: signupsOut.length, from: minMax(signupsOut.map((s) => day(s.created_at)))[0], to: minMax(signupsOut.map((s) => day(s.created_at)))[1], staleDeleted: "-" },
    { table: "fin_web_requests gf", rows: gfReq.length, from: gFrom, to: gTo, staleDeleted: "-" },
    { table: "fin_web_requests qr", rows: qrCount, from: minMax(requestsOut.filter((r) => r.source === "qr").map((r) => day(r.requested_at)))[0], to: minMax(requestsOut.filter((r) => r.source === "qr").map((r) => day(r.requested_at)))[1], staleDeleted: "-" },
  ]);
  console.log(`gf: ${gfActivityCount} from site activities + ${gfOnlyJson} JSON-only (JSON total ${gfJson.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
