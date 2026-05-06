// Export the canonical sitemap as a Brian-shareable Markdown document.
// Output is reproducible from the data file alone — no network, no Supabase.

import {
  siteMapGroups,
  computeSiteMapStats,
  audienceLabels,
  ownerLabels,
  type Audience,
  type Owner,
  type SiteMapGroup,
  type SiteMapPage,
} from "@/data/site-map";
import {
  getApprovalsSnapshot,
  type PageApproval,
} from "@/store/site-map-approvals-store";

function fmtNew(p: SiteMapPage): string {
  return p.isNew ? " · **NEW**" : "";
}

function audienceTag(a: Audience): string {
  return `\`${audienceLabels[a].toLowerCase()}\``;
}

function ownerTag(o: Owner): string {
  return `\`${o}\``;
}

function escapeMd(s: string): string {
  return s.replace(/\|/g, "\\|");
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function decisionLabel(approval: PageApproval | undefined): string {
  if (!approval || approval.decision === "pending") return "Pending";
  if (approval.decision === "approved") return "✓ Approved";
  return "✗ Rejected";
}

function renderGroupTable(
  group: SiteMapGroup,
  approvals: Record<string, PageApproval>,
): string {
  const rows = group.pages.map((p) => {
    const route = `\`${p.route}\``;
    const label = `${escapeMd(p.label)}${fmtNew(p)}`;
    const desc = p.description ? escapeMd(p.description) : "—";
    const fixed = p.notes ? escapeMd(p.notes) : "";
    const approval = approvals[p.id];
    const reasonNote =
      approval?.decision === "rejected" && approval.note.trim()
        ? ` _Reason:_ ${escapeMd(approval.note.trim())}`
        : "";
    return `| ${route} | ${label} | ${audienceTag(p.audience)} | ${ownerTag(p.owner)} | ${decisionLabel(approval)} | ${desc}${fixed ? ` _(${fixed})_` : ""}${reasonNote} |`;
  });
  return [
    "| Route | Page | Audience | Owner | Approval | Notes |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function exportSiteMapMarkdown(
  groups: SiteMapGroup[] = siteMapGroups,
  approvals: Record<string, PageApproval> = {},
): string {
  const stats = computeSiteMapStats(groups);
  const date = todayISO();
  let approved = 0;
  let rejected = 0;
  for (const a of Object.values(approvals)) {
    if (a.decision === "approved") approved++;
    else if (a.decision === "rejected") rejected++;
  }
  const pendingCount = stats.totalPages - approved - rejected;

  const header = [
    "# tablex.com — Site Map",
    "",
    `*Exported ${date}*`,
    "",
    "Canonical IA for the redesigned tablex-site (Phase 2). Synthesized from `src/data/site-map.ts` in the dashboard.",
    "",
    `**${stats.totalPages}** pages across **${stats.totalGroups}** groups · **${stats.newPages}** net-new vs current tablex.com`,
    "",
    `**Review status:** ✓ ${approved} approved · ✗ ${rejected} rejected · ${pendingCount} undecided`,
    "",
  ].join("\n");

  const rejectedSection =
    rejected === 0
      ? ""
      : [
          "## Rejected pages — reasons",
          "",
          "_Pages flagged as rejected, with the reviewer's stated reason._",
          "",
          ...groups.flatMap((g) =>
            g.pages
              .filter((p) => approvals[p.id]?.decision === "rejected")
              .map((p) => {
                const a = approvals[p.id];
                const reason = a?.note.trim() || "_(no reason given)_";
                return `- **${escapeMd(p.label)}** (\`${p.route}\` · ${g.label}) — ${escapeMd(reason)}`;
              }),
          ),
          "",
        ].join("\n");

  const audienceBreakdown = [
    "## At a glance",
    "",
    "**By audience tier**",
    "",
    Object.entries(stats.byAudience)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `- ${audienceLabels[k as Audience]}: **${n}**`)
      .join("\n"),
    "",
    "**By owner**",
    "",
    Object.entries(stats.byOwner)
      .map(([k, n]) => `- ${ownerLabels[k as Owner]}: **${n}**`)
      .join("\n"),
    "",
  ].join("\n");

  const toc = [
    "## Groups",
    "",
    groups
      .map(
        (g, i) =>
          `${i + 1}. [${g.label}](#${g.id}) — ${g.pages.length} pages · route group \`${g.routeGroup}\``,
      )
      .join("\n"),
    "",
  ].join("\n");

  const groupSections = groups
    .map((g) => {
      return [
        `<a id="${g.id}"></a>`,
        `## ${g.label}`,
        "",
        `*Route group:* \`${g.routeGroup}\` · *Default audience:* ${audienceLabels[g.audience]}`,
        "",
        g.description,
        "",
        renderGroupTable(g, approvals),
        "",
      ].join("\n");
    })
    .join("\n");

  const footer = [
    "---",
    "",
    "## Conventions",
    "",
    "- **Audience tier** is the minimum tier required to *land on* the route. Some routes (e.g. `/resources/price-lists`) are public for the URL but gate downloads to authenticated dealers — the tier reflects the gate that actually matters for the IA.",
    "- **Owner** is where the *content* lives:",
    "  - `payload` — the page content is editable in the Payload CMS (`payload.*` schema). The Next.js route renders Payload data.",
    "  - `dynamic` — the page is code-driven and reads from Supabase (`public.*` schema) or computes its content from runtime state. Not in Payload.",
    "- **Approval** tracks Brian's sign-off. Default `Pending` for everything in Phase 2; flip to `Approved` once Brian signs off in a review meeting.",
    "- **Spex Studio** lives at `/spex-studio/:seriesId` — same domain, same auth, same bundle as marketing. Series detail pages link in.",
    "- **No checkout.** The conversion event is **Submit Quote Request** (`/quote/submit`). The cart at `/quote/cart` holds in-progress configurations until the user is ready to submit.",
    "- **Dealer Portal vs Rep Portal** are distinct route groups (`(dealer)` and `(rep)`). They share quote-builder + pricing components, but the IA, default landing, and KPIs differ enough that hi-fi treats them as separate surfaces.",
    "- **Auth flows** (`/login`, `/signup`, `/auth/*`) are public-tier but excluded from the main marketing nav.",
    "",
    `*Generated from \`src/data/site-map.ts\`. To update, edit the data file and re-export from \`/content/site-map\`.*`,
    "",
  ].join("\n");

  return [header, audienceBreakdown, toc, rejectedSection, groupSections, footer]
    .filter(Boolean)
    .join("\n");
}

/** Trigger a browser download of the markdown export. */
export function downloadSiteMapMarkdown(
  groups: SiteMapGroup[] = siteMapGroups,
): void {
  // Imperative snapshot — fine outside React render.
  const approvals = getApprovalsSnapshot();
  const md = exportSiteMapMarkdown(groups, approvals);
  const date = todayISO();
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sitemap-${date}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
