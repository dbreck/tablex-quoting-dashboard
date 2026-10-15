/**
 * One-off generator for src/data/spex-review-items.ts (SpeX groups only).
 *
 * Reads the "## Per-tab tables" section of the 10/14 SpeX action-tracker
 * reconciliation report (read-only) and rewrites the region between the
 * `// @generated-start` / `// @generated-end` markers in the data file with a
 * literal `SPEX_TRACKER_GROUPS` export. The hand-written ORDERS group outside
 * the markers is left alone.
 *
 * Run (Node 22.18+ strips the types natively):
 *   node scripts/build-spex-review-items.ts [path/to/report.md]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_REPORT = join(
  homedir(),
  "Applications/tablex-orders-p1/docs/reports/2026-10-14-spex-action-tracker.md",
);
const DATA_FILE = join(import.meta.dirname, "..", "src/data/spex-review-items.ts");
const STAGING = "https://staging.tablex.com";
const STATUSES = new Set([
  "done",
  "done-unpriced",
  "conflict",
  "done-already",
  "needs-mark",
  "out-of-scope",
]);
const OWNERS = new Set(["A", "B", "C", "D"]);

/** Display names for the tracker tabs (VertiGO keeps its brand casing). */
const TAB_TITLES: Record<string, string> = {
  "ALL PAGES": "All Pages",
  VERTIGO: "VertiGO",
};

interface Item {
  id: string;
  request: string;
  owner?: string;
  status: string;
  outcome: string;
  priceSource?: string;
  deepLink?: string;
}

interface Group {
  id: string;
  tab?: string;
  title: string;
  links: { label: string; href: string }[];
  items: Item[];
}

function titleCase(tab: string): string {
  return TAB_TITLES[tab] ?? tab.charAt(0) + tab.slice(1).toLowerCase();
}

/** Split a markdown table row on unescaped pipes; unescape \" and \| in cells. */
function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && i + 1 < line.length) {
      const next = line[i + 1];
      cur += next === '"' || next === "|" || next === "\\" ? next : ch + next;
      i++;
      continue;
    }
    if (ch === "|") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  // Leading and trailing pipes produce empty edge cells.
  return cells.slice(1, -1);
}

function parse(report: string): Group[] {
  const start = report.indexOf("## Per-tab tables");
  if (start < 0) throw new Error('Report has no "## Per-tab tables" section');
  const lines = report.slice(start).split("\n");

  const groups: Group[] = [];
  let group: Group | null = null;
  let header: string[] | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ") && !line.startsWith("## Per-tab tables")) break;
    if (line.startsWith("### ")) {
      const heading = line.slice(4).trim();
      header = null;
      if (heading.startsWith("Items from Mark")) {
        group = {
          id: "ref",
          title: "Mark's 10/12 items",
          links: [
            { label: "Primary", href: `${STAGING}/spex-studio/primary` },
            { label: "Elite", href: `${STAGING}/spex-studio/elite` },
          ],
          items: [],
        };
      } else if (heading === "ALL PAGES") {
        group = {
          id: "all-pages",
          tab: heading,
          title: titleCase(heading),
          links: [{ label: "SpeX Studio", href: `${STAGING}/spex-studio` }],
          items: [],
        };
      } else {
        const slug = heading.toLowerCase();
        group = {
          id: slug,
          tab: heading,
          title: titleCase(heading),
          links: [{ label: `${titleCase(heading)} in SpeX`, href: `${STAGING}/spex-studio/${slug}` }],
          items: [],
        };
      }
      groups.push(group);
      continue;
    }
    if (!group || !line.startsWith("|")) continue;
    const cells = splitRow(line);
    if (!header) {
      header = cells;
      continue;
    }
    if (cells.every((c) => /^-+$/.test(c))) continue;
    if (cells.length !== header.length) {
      throw new Error(`Row has ${cells.length} cells, header has ${header.length}: ${line}`);
    }
    const col = (name: string) => {
      const idx = header!.indexOf(name);
      return idx < 0 ? undefined : cells[idx] || undefined;
    };

    const id = col("Id");
    const status = col("Status");
    const outcome = col("Outcome");
    if (!id || !status || !outcome) throw new Error(`Row missing Id/Status/Outcome: ${line}`);
    if (!STATUSES.has(status)) throw new Error(`Unknown status "${status}" on ${id}`);

    const item: Item = { id, request: "", status, outcome };
    if (group.id === "ref") {
      item.request = col("Item") ?? "";
      const mark = col("Mark");
      const book = col("ADD ONS");
      const parts = [mark && `Mark: ${mark}`, book && `October book: ${book}`].filter(Boolean);
      if (parts.length) item.priceSource = parts.join(" · ");
      // REF-01 names Primary first; the others are not tied to one series page.
      if (/primary/i.test(item.request)) item.deepLink = `${STAGING}/spex-studio/primary`;
    } else {
      item.request = col("Request") ?? "";
      const owner = col("Owner");
      if (owner) {
        if (!OWNERS.has(owner)) throw new Error(`Unknown owner "${owner}" on ${id}`);
        item.owner = owner;
      }
      item.priceSource = col("Price source");
      item.deepLink = group.links[0].href;
    }
    if (!item.request) throw new Error(`Empty request on ${id}`);
    group.items.push(item);
  }

  const ids = new Set<string>();
  for (const g of groups) {
    for (const it of g.items) {
      if (ids.has(it.id)) throw new Error(`Duplicate id ${it.id}`);
      ids.add(it.id);
    }
  }
  return groups;
}

function emit(groups: Group[]): string {
  const s = (v: string) => JSON.stringify(v);
  const out: string[] = ["export const SPEX_TRACKER_GROUPS: SpexReviewGroup[] = ["];
  for (const g of groups) {
    out.push("  {");
    out.push(`    id: ${s(g.id)},`);
    if (g.tab) out.push(`    tab: ${s(g.tab)},`);
    out.push(`    title: ${s(g.title)},`);
    out.push("    links: [");
    for (const l of g.links) out.push(`      { label: ${s(l.label)}, href: ${s(l.href)} },`);
    out.push("    ],");
    out.push("    items: [");
    for (const it of g.items) {
      out.push("      {");
      out.push(`        id: ${s(it.id)},`);
      out.push(`        request: ${s(it.request)},`);
      if (it.owner) out.push(`        owner: ${s(it.owner)},`);
      out.push(`        status: ${s(it.status)},`);
      out.push(`        outcome: ${s(it.outcome)},`);
      if (it.priceSource) out.push(`        priceSource: ${s(it.priceSource)},`);
      if (it.deepLink) out.push(`        deepLink: ${s(it.deepLink)},`);
      out.push("      },");
    }
    out.push("    ],");
    out.push("  },");
  }
  out.push("];");
  return out.join("\n");
}

const reportPath = process.argv[2] ?? DEFAULT_REPORT;
const groups = parse(readFileSync(reportPath, "utf8"));

const START = "// @generated-start (scripts/build-spex-review-items.ts)";
const END = "// @generated-end";
const data = readFileSync(DATA_FILE, "utf8");
const a = data.indexOf(START);
const b = data.indexOf(END);
if (a < 0 || b < a) throw new Error(`Markers not found in ${DATA_FILE}`);
const next = `${data.slice(0, a + START.length)}\n${emit(groups)}\n${data.slice(b)}`;
writeFileSync(DATA_FILE, next);

const tracker = groups.filter((g) => g.id !== "ref").reduce((n, g) => n + g.items.length, 0);
const ref = groups.find((g) => g.id === "ref")?.items.length ?? 0;
for (const g of groups) console.log(`${g.title.padEnd(20)} ${g.items.length}`);
console.log(`tracker items ${tracker}, REF items ${ref}`);
