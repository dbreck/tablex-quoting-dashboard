// Convert the canonical sitemap into xyflow nodes + edges, with dagre
// layout. Each group renders as a top-level cluster: a group header node
// at top, child page nodes below, parent edges within the group, and a
// thin "trunk" edge from group→first-page so the group reads as a unit.

import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import {
  siteMapGroups,
  audienceColors,
  type Audience,
  type SiteMapGroup,
  type SiteMapPage,
} from "@/data/site-map";

export const GROUP_NODE_WIDTH = 260;
export const GROUP_NODE_HEIGHT = 80;
export const PAGE_NODE_WIDTH = 240;
export const PAGE_NODE_HEIGHT = 88;

/** Custom node kinds the client renderer can switch on. */
export type SiteMapNodeKind = "group" | "page";

export interface SiteMapGroupNodeData extends Record<string, unknown> {
  kind: "group";
  groupId: string;
  label: string;
  description: string;
  audience: Audience;
  color: string;
  pageCount: number;
  routeGroup: string;
}

export interface SiteMapPageNodeData extends Record<string, unknown> {
  kind: "page";
  groupId: string;
  page: SiteMapPage;
}

export type SiteMapFlowNode =
  | (Node<SiteMapGroupNodeData> & { type: "siteMapGroup" })
  | (Node<SiteMapPageNodeData> & { type: "siteMapPage" });

interface BuildOptions {
  /** Group ids that are collapsed (children hidden). */
  collapsedGroups?: Set<string>;
  /** Audience filter — pages whose audience is NOT in the set are dimmed. */
  visibleAudiences?: Set<Audience>;
}

const HORIZONTAL_GROUP_GAP = 120;

export function buildSiteMapFlow(
  groups: SiteMapGroup[] = siteMapGroups,
  options: BuildOptions = {},
): { nodes: SiteMapFlowNode[]; edges: Edge[] } {
  const collapsed = options.collapsedGroups ?? new Set<string>();
  const nodes: SiteMapFlowNode[] = [];
  const edges: Edge[] = [];

  // Lay each group out independently, then concatenate horizontally so
  // groups read left-to-right with their full page tree below each header.
  let xOffset = 0;
  let maxHeight = 0;

  for (const group of groups) {
    const isCollapsed = collapsed.has(group.id);
    const groupNodeId = `group:${group.id}`;
    const tint = audienceColors[group.audience];

    if (isCollapsed) {
      // Group node only.
      nodes.push({
        id: groupNodeId,
        type: "siteMapGroup",
        position: { x: xOffset, y: 0 },
        data: {
          kind: "group",
          groupId: group.id,
          label: group.label,
          description: group.description,
          audience: group.audience,
          color: tint,
          pageCount: group.pages.length,
          routeGroup: group.routeGroup,
        },
        width: GROUP_NODE_WIDTH,
        height: GROUP_NODE_HEIGHT,
      });
      xOffset += GROUP_NODE_WIDTH + HORIZONTAL_GROUP_GAP;
      maxHeight = Math.max(maxHeight, GROUP_NODE_HEIGHT);
      continue;
    }

    // Layout this group's tree (group header → pages, plus parent edges).
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: "TB",
      ranksep: 60,
      nodesep: 28,
      marginx: 0,
      marginy: 0,
    });
    g.setDefaultEdgeLabel(() => ({}));

    g.setNode(groupNodeId, {
      width: GROUP_NODE_WIDTH,
      height: GROUP_NODE_HEIGHT,
    });
    for (const page of group.pages) {
      g.setNode(page.id, {
        width: PAGE_NODE_WIDTH,
        height: PAGE_NODE_HEIGHT,
      });
      const parent = page.parentId
        ? group.pages.find((p) => p.id === page.parentId)?.id
        : groupNodeId;
      if (parent) g.setEdge(parent, page.id);
    }

    dagre.layout(g);

    // Find local bounding box so we can shift this group right next to the prior.
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    g.nodes().forEach((id) => {
      const n = g.node(id);
      if (!n) return;
      const left = n.x - n.width / 2;
      const right = n.x + n.width / 2;
      const bottom = n.y + n.height / 2;
      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    });

    const groupWidth = maxX - minX;
    const shiftX = xOffset - minX;

    // Emit the group header node.
    {
      const n = g.node(groupNodeId);
      nodes.push({
        id: groupNodeId,
        type: "siteMapGroup",
        position: {
          x: n.x - n.width / 2 + shiftX,
          y: n.y - n.height / 2,
        },
        data: {
          kind: "group",
          groupId: group.id,
          label: group.label,
          description: group.description,
          audience: group.audience,
          color: tint,
          pageCount: group.pages.length,
          routeGroup: group.routeGroup,
        },
        width: GROUP_NODE_WIDTH,
        height: GROUP_NODE_HEIGHT,
      });
    }

    // Emit page nodes.
    for (const page of group.pages) {
      const n = g.node(page.id);
      if (!n) continue;
      nodes.push({
        id: page.id,
        type: "siteMapPage",
        position: {
          x: n.x - n.width / 2 + shiftX,
          y: n.y - n.height / 2,
        },
        data: { kind: "page", groupId: group.id, page },
        width: PAGE_NODE_WIDTH,
        height: PAGE_NODE_HEIGHT,
      });
    }

    // Emit edges (group→top pages, page→child pages).
    for (const page of group.pages) {
      const parent = page.parentId ?? groupNodeId;
      edges.push({
        id: `e:${parent}→${page.id}`,
        source: parent,
        target: page.id,
        type: "smoothstep",
        style: {
          stroke: tint,
          strokeOpacity: 0.45,
          strokeWidth: 1.5,
        },
      });
    }

    xOffset += groupWidth + HORIZONTAL_GROUP_GAP;
    maxHeight = Math.max(maxHeight, maxY);
  }

  return { nodes, edges };
}
