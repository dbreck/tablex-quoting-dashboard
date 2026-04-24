// Dagre auto-layout helper. Given nodes + parent edges, produces a
// top-down tree layout, returning {id → {x, y}} coordinates in canvas space.
// Cross-link edges (kind='link') are NOT included in the layout graph so they
// don't perturb the tree.

import dagre from "@dagrejs/dagre";
import type { ContentNode } from "@/lib/supabase/content-map-converters";

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 100;

export interface LayoutPosition {
  x: number;
  y: number;
}

export function computeDagreLayout(
  nodes: ContentNode[],
): Record<string, LayoutPosition> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    ranksep: 80,
    nodesep: 40,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const node of nodes) {
    if (node.parentId && nodes.some((n) => n.id === node.parentId)) {
      g.setEdge(node.parentId, node.id);
    }
  }

  dagre.layout(g);

  const positions: Record<string, LayoutPosition> = {};
  for (const node of nodes) {
    const n = g.node(node.id);
    if (!n) continue;
    // Dagre returns the center — React Flow expects the top-left corner.
    positions[node.id] = {
      x: n.x - NODE_WIDTH / 2,
      y: n.y - NODE_HEIGHT / 2,
    };
  }
  return positions;
}
