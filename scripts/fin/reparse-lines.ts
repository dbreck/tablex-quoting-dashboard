/**
 * Re-run parseInvoiceLine over every stored fin_invoice_lines row (no Xero calls) and
 * update the parsed columns + parser_version. Use after changing src/lib/fin/parse-line.ts.
 *
 * Usage:
 *   npx tsx scripts/fin/reparse-lines.ts --dry-run   # histogram before/after, nothing written
 *   npx tsx scripts/fin/reparse-lines.ts             # write rows whose parse changed
 *
 * Input fidelity: unit amounts are rebuilt from unit_cents (Xero sent 4 dp; storage
 * keeps cents), so the parser sees the cent-rounded unit price.
 */
import { join } from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { parseInvoiceLine } from "../../src/lib/fin/parse-line";
import {
  PARSER_VERSION,
  type ParseConfidence,
  type ParsedInvoiceLine,
  type PartKind,
} from "../../src/lib/fin/types";

config({ path: join(__dirname, "..", "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const PAGE = 1000;
const WRITE_BATCH = 500;

const PARSED_KEYS: (keyof ParsedInvoiceLine)[] = [
  "code",
  "series_code",
  "shape",
  "width_in",
  "depth_in",
  "base_code",
  "post_config",
  "is_special",
  "special_height",
  "is_replacement",
  "part_kind",
  "parse_confidence",
];

interface StoredLine extends ParsedInvoiceLine {
  id: string;
  invoice_id: string;
  description: string | null;
  item_code: string | null;
  account_code: string | null;
  qty: number | string | null;
  unit_cents: number | string | null;
  amount_cents: number | string;
  parser_version: number;
  fin_invoices: { reference: string | null } | { reference: string | null }[] | null;
}

const SELECT =
  "id, invoice_id, description, item_code, account_code, qty, unit_cents, amount_cents, " +
  PARSED_KEYS.join(", ") +
  ", parser_version, fin_invoices(reference)";

const num = (v: number | string | null): number | null => (v == null ? null : Number(v));

function sameValue(a: unknown, b: unknown): boolean {
  if (a == null && b == null) return true;
  if (typeof a === "number" || typeof b === "number") return Number(a) === Number(b);
  return a === b;
}

function emptyHist(): Record<ParseConfidence, number> {
  return { high: 0, medium: 0, low: 0, none: 0 };
}

async function main(): Promise<void> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const before = emptyHist();
  const after = emptyHist();
  const kindBefore = new Map<PartKind, number>();
  const kindAfter = new Map<PartKind, number>();
  const changed: (ParsedInvoiceLine & { id: string; invoice_id: string; parser_version: number })[] = [];
  let total = 0;

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("fin_invoice_lines")
      .select(SELECT)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`fin_invoice_lines read: ${error.message}`);
    const rows = (data ?? []) as unknown as StoredLine[];

    for (const row of rows) {
      total++;
      const inv = Array.isArray(row.fin_invoices) ? row.fin_invoices[0] : row.fin_invoices;
      const unitCents = num(row.unit_cents);
      const parsed = parseInvoiceLine({
        description: row.description,
        itemCode: row.item_code,
        accountCode: row.account_code,
        qty: num(row.qty),
        unitAmount: unitCents == null ? null : unitCents / 100,
        lineAmount: Number(row.amount_cents) / 100,
        invoiceReference: inv?.reference ?? null,
      });

      before[row.parse_confidence]++;
      after[parsed.parse_confidence]++;
      kindBefore.set(row.part_kind, (kindBefore.get(row.part_kind) ?? 0) + 1);
      kindAfter.set(parsed.part_kind, (kindAfter.get(parsed.part_kind) ?? 0) + 1);

      const differs =
        row.parser_version !== PARSER_VERSION ||
        PARSED_KEYS.some((k) => !sameValue(row[k], parsed[k]));
      if (differs) {
        changed.push({ id: row.id, invoice_id: row.invoice_id, ...parsed, parser_version: PARSER_VERSION });
      }
    }
    if (rows.length < PAGE) break;
  }

  console.log(`Lines scanned: ${total} · parse changed or version bumped: ${changed.length} · parser v${PARSER_VERSION}`);
  console.log("\nparse_confidence     before    after    diff");
  for (const k of ["high", "medium", "low", "none"] as const) {
    const d = after[k] - before[k];
    console.log(`  ${k.padEnd(16)} ${String(before[k]).padStart(7)} ${String(after[k]).padStart(8)} ${(d > 0 ? "+" : "") + d}`);
  }
  console.log("\npart_kind            before    after    diff");
  const kinds = new Set<PartKind>([...kindBefore.keys(), ...kindAfter.keys()]);
  for (const k of [...kinds].sort()) {
    const b = kindBefore.get(k) ?? 0;
    const a = kindAfter.get(k) ?? 0;
    console.log(`  ${k.padEnd(16)} ${String(b).padStart(7)} ${String(a).padStart(8)} ${(a - b > 0 ? "+" : "") + (a - b)}`);
  }

  if (DRY_RUN) {
    console.log("\nDRY RUN — nothing written.");
    return;
  }

  for (let i = 0; i < changed.length; i += WRITE_BATCH) {
    // id + invoice_id satisfy the insert tuple; ON CONFLICT (id) updates only these columns.
    const { error } = await sb
      .from("fin_invoice_lines")
      .upsert(changed.slice(i, i + WRITE_BATCH), { onConflict: "id" });
    if (error) throw new Error(`fin_invoice_lines upsert: ${error.message}`);
  }

  // has_special on invoices follows the lines.
  const touchedInvoices = [...new Set(changed.map((c) => c.invoice_id))];
  for (let i = 0; i < touchedInvoices.length; i += 100) {
    const part = touchedInvoices.slice(i, i + 100);
    const { data, error } = await sb
      .from("fin_invoice_lines")
      .select("invoice_id")
      .in("invoice_id", part)
      .eq("is_special", true);
    if (error) throw new Error(`fin_invoice_lines special read: ${error.message}`);
    const special = new Set(((data ?? []) as { invoice_id: string }[]).map((r) => r.invoice_id));
    const yes = part.filter((id) => special.has(id));
    const no = part.filter((id) => !special.has(id));
    if (yes.length) {
      const { error: e1 } = await sb.from("fin_invoices").update({ has_special: true }).in("id", yes);
      if (e1) throw new Error(`fin_invoices has_special: ${e1.message}`);
    }
    if (no.length) {
      const { error: e2 } = await sb.from("fin_invoices").update({ has_special: false }).in("id", no);
      if (e2) throw new Error(`fin_invoices has_special: ${e2.message}`);
    }
  }
  console.log(`\nUpdated ${changed.length} line(s) and refreshed has_special on ${touchedInvoices.length} invoice(s).`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
