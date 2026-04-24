// Serialize the content map as a single Markdown document.
//
// Layout:
//   # Content Map — YYYY-MM-DD
//   - TOC
//   ---
//   # Root title
//     body
//     ## Section title
//       body
//       ### Page title
//         body
//         *See also: [Other title](#anchor)*
//
// Depth-based heading levels clamp at H6 to keep markdown renderers happy.

import type {
  ContentNode,
  ContentEdge,
} from "@/lib/supabase/content-map-converters";

interface ExportInput {
  nodes: ContentNode[];
  edges: ContentEdge[];
  title?: string;
  dateISO?: string;
}

const MAX_HEADING_DEPTH = 6;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/**
 * Walk the tree from each root in sort order. Returns one concatenated
 * Markdown string, plus a flat list of `{id, title, anchor, depth}` for
 * building the TOC.
 */
export function exportToMarkdown({
  nodes,
  edges,
  title = "Content Map",
  dateISO,
}: ExportInput): string {
  if (nodes.length === 0) {
    return `# ${title}\n\n*(empty — nothing to export yet)*\n`;
  }

  const date = dateISO ?? new Date().toISOString().slice(0, 10);

  // Group children by parent for fast lookup + sort by sortOrder/id for
  // stable output.
  const childrenByParent = new Map<string | null, ContentNode[]>();
  for (const n of nodes) {
    const key = n.parentId ?? null;
    const bucket = childrenByParent.get(key);
    if (bucket) bucket.push(n);
    else childrenByParent.set(key, [n]);
  }
  for (const bucket of childrenByParent.values()) {
    bucket.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
    );
  }

  // Nodes with no parent (or parent missing from this set) are roots.
  const idSet = new Set(nodes.map((n) => n.id));
  const roots = nodes
    .filter((n) => !n.parentId || !idSet.has(n.parentId))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));

  // Cross-link edges grouped by source id for easy per-node lookup.
  const crossLinksBySource = new Map<string, ContentEdge[]>();
  for (const e of edges) {
    const bucket = crossLinksBySource.get(e.sourceId);
    if (bucket) bucket.push(e);
    else crossLinksBySource.set(e.sourceId, [e]);
  }

  // Assign anchors (slug-from-title, deduped).
  const anchorById = new Map<string, string>();
  const seenAnchors = new Set<string>();
  for (const n of nodes) {
    const base = slugify(n.title) || n.id;
    let candidate = base;
    let i = 1;
    while (seenAnchors.has(candidate)) {
      i += 1;
      candidate = `${base}-${i}`;
    }
    seenAnchors.add(candidate);
    anchorById.set(n.id, candidate);
  }

  // First, walk the tree to collect TOC entries + rendered sections.
  interface TocEntry {
    id: string;
    title: string;
    anchor: string;
    depth: number;
  }
  const toc: TocEntry[] = [];
  const body: string[] = [];

  const render = (node: ContentNode, depth: number) => {
    const level = Math.min(depth + 1, MAX_HEADING_DEPTH);
    const hashes = "#".repeat(level);
    const anchor = anchorById.get(node.id) ?? node.id;
    toc.push({ id: node.id, title: node.title, anchor, depth });

    body.push(`<a id="${anchor}"></a>`);
    body.push(`${hashes} ${node.title}`);

    const kindLine: string[] = [];
    if (node.kind && node.kind !== "page") kindLine.push(`*${node.kind}*`);
    if (node.isNew) kindLine.push("**NEW**");
    if (node.authGate) kindLine.push(`*auth: ${node.authGate}*`);
    if (kindLine.length > 0) body.push(kindLine.join(" · "));

    if (node.body && node.body.trim().length > 0) {
      body.push("");
      body.push(node.body.trim());
    }

    const crosslinks = crossLinksBySource.get(node.id);
    if (crosslinks && crosslinks.length > 0) {
      const resolved = crosslinks
        .map((e) => {
          const target = nodes.find((n) => n.id === e.targetId);
          if (!target) return null;
          const tAnchor = anchorById.get(target.id) ?? target.id;
          return `[${target.title}](#${tAnchor})`;
        })
        .filter((s): s is string => s !== null);
      if (resolved.length > 0) {
        body.push("");
        body.push(`*See also: ${resolved.join(" · ")}*`);
      }
    }

    body.push(""); // blank line before children

    const kids = childrenByParent.get(node.id);
    if (kids) {
      for (const child of kids) render(child, depth + 1);
    }
  };

  for (const root of roots) render(root, 0);

  // TOC lines: markdown list, indented by depth.
  const tocLines = toc.map(
    (t) => `${"  ".repeat(t.depth)}- [${t.title}](#${t.anchor})`,
  );

  const header: string[] = [
    `# ${title}`,
    "",
    `*Exported ${date}*`,
    "",
    `**${nodes.length}** ${nodes.length === 1 ? "node" : "nodes"}${
      edges.length > 0
        ? ` · **${edges.length}** cross-${edges.length === 1 ? "link" : "links"}`
        : ""
    }`,
    "",
    "## Table of contents",
    "",
    ...tocLines,
    "",
    "---",
    "",
  ];

  return [...header, ...body].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/**
 * Trigger a download of the exported markdown. Browser-only.
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
