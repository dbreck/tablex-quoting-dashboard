import { useMemo } from "react";
import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  rowToContentNode,
  rowToContentEdge,
  type ContentNode,
  type ContentEdge,
  type ContentNodeRow,
  type ContentEdgeRow,
} from "@/lib/supabase/content-map-converters";
import * as contentMapClient from "@/lib/supabase/content-map-client";
import { architectureSections, utilityNav } from "@/data/future-site-architecture";
import { wireframePages } from "@/data/wireframe-pages";
import { computeDagreLayout } from "@/lib/content-map/layout";

// ─── Hydration + Realtime types ──────────────────────────────────────────────

export interface ContentMapHydrationSnapshot {
  nodes: ContentNode[];
  edges: ContentEdge[];
}

export type ContentMapRealtimeTable = "content_nodes" | "content_edges";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface ContentMapStore {
  nodes: Record<string, ContentNode>;
  edges: Record<string, ContentEdge>;
  isInitialized: boolean;
  selectedNodeId: string | null;
  drawerOpen: boolean;
  /**
   * Transient, per-session map of {nodeId → true} for nodes whose body
   * content is expanded inline on the canvas. Not persisted; each collaborator
   * has their own expanded-state so they can scan independently.
   */
  expanded: Record<string, true>;

  // Lifecycle
  hydrate: (snapshot: ContentMapHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: ContentMapRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  // Selection + drawer
  setSelected: (id: string | null) => void;
  openDrawer: (id?: string) => void;
  closeDrawer: () => void;

  // Inline expand
  toggleExpanded: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // CRUD — nodes
  addNode: (partial?: Partial<ContentNode>) => ContentNode;
  updateNode: (
    id: string,
    patch: Partial<Omit<ContentNode, "id" | "createdAt" | "updatedAt">>,
  ) => void;
  deleteNode: (id: string) => void;

  // CRUD — edges
  addEdge: (sourceId: string, targetId: string) => ContentEdge | null;
  deleteEdge: (id: string) => void;

  // Bulk
  applyLayoutPositions: (
    positions: Record<string, { x: number; y: number }>,
  ) => void;

  // Seeds
  seedFromSiteArchitecture: () => void;
  seedFromWireframes: () => void;
  clearAll: () => Promise<void>;
}

// ─── Write-through error handler ─────────────────────────────────────────────

function fireAndForget(label: string, p: Promise<unknown>): void {
  void p.catch((err) => {
    console.error(`[content-map-store] ${label} failed`, err);
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Commit a freshly-seeded batch: dagre-layout the merged tree, apply positions
 * to both the new nodes (baked into the insert) and any existing nodes whose
 * positions shifted, then write-through to Supabase.
 */
function commitSeed(
  set: (partial: Partial<ContentMapStore>) => void,
  get: () => ContentMapStore,
  toInsert: ContentNode[],
  label: string,
): void {
  const existing = get().nodes;
  const merged = [...Object.values(existing), ...toInsert];
  const positions = computeDagreLayout(merged);

  // Apply positions to new nodes (baked into the insert payload).
  const newWithPos: ContentNode[] = toInsert.map((n) => {
    const p = positions[n.id];
    return p ? { ...n, positionX: p.x, positionY: p.y } : n;
  });

  // Find existing nodes whose position changed — they need a separate update.
  const repositionedExisting: ContentNode[] = [];
  const nextNodes: Record<string, ContentNode> = {};
  for (const [id, n] of Object.entries(existing)) {
    const p = positions[id];
    if (p && (n.positionX !== p.x || n.positionY !== p.y)) {
      const updated = { ...n, positionX: p.x, positionY: p.y };
      nextNodes[id] = updated;
      repositionedExisting.push(updated);
    } else {
      nextNodes[id] = n;
    }
  }
  for (const n of newWithPos) nextNodes[n.id] = n;
  set({ nodes: nextNodes });

  fireAndForget(label, contentMapClient.bulkInsertNodes(newWithPos));
  if (repositionedExisting.length > 0) {
    fireAndForget(
      `${label}:reposition`,
      contentMapClient.bulkUpdatePositions(
        repositionedExisting.map((n) => ({
          id: n.id,
          positionX: n.positionX ?? 0,
          positionY: n.positionY ?? 0,
        })),
      ),
    );
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useContentMapStore = create<ContentMapStore>()((set, get) => ({
  nodes: {},
  edges: {},
  isInitialized: false,
  selectedNodeId: null,
  drawerOpen: false,
  expanded: {},

  hydrate: (snapshot) => {
    const nodes: Record<string, ContentNode> = {};
    for (const n of snapshot.nodes) nodes[n.id] = n;
    const edges: Record<string, ContentEdge> = {};
    for (const e of snapshot.edges) edges[e.id] = e;
    set({ nodes, edges, isInitialized: true });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    if (table === "content_nodes") {
      const id =
        (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        const remaining = { ...get().nodes };
        delete remaining[id];
        set({ nodes: remaining });
        return;
      }
      if (!row) return;
      const incoming = rowToContentNode(row as unknown as ContentNodeRow);
      const existing = get().nodes[id];
      if (existing?.updatedAt && incoming.updatedAt) {
        if (Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
          return;
        }
      }
      set({ nodes: { ...get().nodes, [id]: incoming } });
      return;
    }

    if (table === "content_edges") {
      const id =
        (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        const remaining = { ...get().edges };
        delete remaining[id];
        set({ edges: remaining });
        return;
      }
      if (!row) return;
      const incoming = rowToContentEdge(row as unknown as ContentEdgeRow);
      set({ edges: { ...get().edges, [id]: incoming } });
      return;
    }
  },

  clearLocal: () => {
    set({
      nodes: {},
      edges: {},
      isInitialized: false,
      selectedNodeId: null,
      drawerOpen: false,
      expanded: {},
    });
  },

  // ─── Selection / drawer ──────────────────────────────────────────────────

  setSelected: (id) => set({ selectedNodeId: id }),
  openDrawer: (id) =>
    set({
      drawerOpen: true,
      selectedNodeId: id ?? get().selectedNodeId,
    }),
  closeDrawer: () => set({ drawerOpen: false }),

  // ─── Inline expand ───────────────────────────────────────────────────────

  toggleExpanded: (id) => {
    const expanded = { ...get().expanded };
    if (expanded[id]) delete expanded[id];
    else expanded[id] = true;
    set({ expanded });
  },

  /** Expand every node that has body content. Nodes without body stay collapsed. */
  expandAll: () => {
    const next: Record<string, true> = {};
    for (const n of Object.values(get().nodes)) {
      if (n.body && n.body.trim().length > 0) next[n.id] = true;
    }
    set({ expanded: next });
  },

  collapseAll: () => set({ expanded: {} }),

  // ─── Node CRUD ───────────────────────────────────────────────────────────

  addNode: (partial) => {
    const id = partial?.id ?? `node-${nanoid(8)}`;
    const now = nowISO();
    const node: ContentNode = {
      id,
      parentId: partial?.parentId ?? null,
      title: partial?.title ?? "Untitled",
      body: partial?.body ?? null,
      kind: partial?.kind ?? "page",
      color: partial?.color ?? null,
      isNew: partial?.isNew ?? false,
      authGate: partial?.authGate ?? null,
      positionX: partial?.positionX ?? 0,
      positionY: partial?.positionY ?? 0,
      sortOrder: partial?.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    set({ nodes: { ...get().nodes, [id]: node } });
    fireAndForget(
      "createNode",
      contentMapClient.createNode({
        id: node.id,
        parentId: node.parentId,
        title: node.title,
        body: node.body,
        kind: node.kind,
        color: node.color,
        isNew: node.isNew,
        authGate: node.authGate,
        positionX: node.positionX,
        positionY: node.positionY,
        sortOrder: node.sortOrder,
      }),
    );
    return node;
  },

  updateNode: (id, patch) => {
    const existing = get().nodes[id];
    if (!existing) return;
    const next: ContentNode = {
      ...existing,
      ...patch,
      updatedAt: nowISO(),
    };
    set({ nodes: { ...get().nodes, [id]: next } });
    fireAndForget("updateNode", contentMapClient.updateNode(id, patch));
  },

  deleteNode: (id) => {
    // Cascade deletes edges locally (DB cascades via FK).
    const remainingNodes = { ...get().nodes };
    delete remainingNodes[id];
    const remainingEdges: Record<string, ContentEdge> = {};
    for (const [eid, e] of Object.entries(get().edges)) {
      if (e.sourceId !== id && e.targetId !== id) remainingEdges[eid] = e;
    }
    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      drawerOpen: get().selectedNodeId === id ? false : get().drawerOpen,
    });
    fireAndForget("deleteNode", contentMapClient.deleteNode(id));
  },

  // ─── Edge CRUD ───────────────────────────────────────────────────────────

  addEdge: (sourceId, targetId) => {
    if (sourceId === targetId) return null;
    // Deduplicate: same source + target + link kind.
    for (const e of Object.values(get().edges)) {
      if (
        e.sourceId === sourceId &&
        e.targetId === targetId &&
        e.kind === "link"
      ) {
        return e;
      }
    }
    const id = `edge-${nanoid(8)}`;
    const now = nowISO();
    const edge: ContentEdge = {
      id,
      sourceId,
      targetId,
      kind: "link",
      label: null,
      createdAt: now,
      updatedAt: now,
    };
    set({ edges: { ...get().edges, [id]: edge } });
    fireAndForget(
      "createEdge",
      contentMapClient.createEdge({
        id: edge.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        kind: edge.kind,
        label: edge.label,
      }),
    );
    return edge;
  },

  deleteEdge: (id) => {
    const remaining = { ...get().edges };
    delete remaining[id];
    set({ edges: remaining });
    fireAndForget("deleteEdge", contentMapClient.deleteEdge(id));
  },

  // ─── Layout positions ────────────────────────────────────────────────────

  applyLayoutPositions: (positions) => {
    const nextNodes: Record<string, ContentNode> = {};
    const writes: { id: string; positionX: number; positionY: number }[] = [];
    for (const [id, node] of Object.entries(get().nodes)) {
      const pos = positions[id];
      if (pos) {
        nextNodes[id] = { ...node, positionX: pos.x, positionY: pos.y };
        writes.push({ id, positionX: pos.x, positionY: pos.y });
      } else {
        nextNodes[id] = node;
      }
    }
    set({ nodes: nextNodes });
    fireAndForget(
      "bulkUpdatePositions",
      contentMapClient.bulkUpdatePositions(writes),
    );
  },

  // ─── Seeds ───────────────────────────────────────────────────────────────

  seedFromSiteArchitecture: () => {
    const now = nowISO();
    const incomingNodes: ContentNode[] = [];
    const rootId = "sa-root";

    // 1 root
    incomingNodes.push({
      id: rootId,
      parentId: null,
      title: "tablex.com",
      body: "Proposed IA for the redesigned tablex.com marketing site.",
      kind: "root",
      color: "slate",
      isNew: false,
      authGate: null,
      positionX: 0,
      positionY: 0,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 9 sections + ~46 children
    architectureSections.forEach((section, si) => {
      const sectionId = `sa-${section.id}`;
      incomingNodes.push({
        id: sectionId,
        parentId: rootId,
        title: section.label,
        body: section.description,
        kind: "section",
        color: section.color,
        isNew: section.isNew ?? false,
        authGate: null,
        positionX: 0,
        positionY: 0,
        sortOrder: si,
        createdAt: now,
        updatedAt: now,
      });
      section.children.forEach((child, ci) => {
        incomingNodes.push({
          id: `sa-${child.id}`,
          parentId: sectionId,
          title: child.label,
          body: child.description ?? null,
          kind: section.tier === "portal" ? "utility" : "page",
          color: section.color,
          isNew: child.isNew ?? false,
          authGate: child.auth ?? null,
          positionX: 0,
          positionY: 0,
          sortOrder: ci,
          createdAt: now,
          updatedAt: now,
        });
      });
    });

    // Utility nav attached to the root (flat)
    const utilParentId = "sa-utility";
    incomingNodes.push({
      id: utilParentId,
      parentId: rootId,
      title: "Utility Nav",
      body: "Global utilities present in the header across every page.",
      kind: "section",
      color: "slate",
      isNew: false,
      authGate: null,
      positionX: 0,
      positionY: 0,
      sortOrder: architectureSections.length,
      createdAt: now,
      updatedAt: now,
    });
    utilityNav.forEach((item, i) => {
      incomingNodes.push({
        id: `sa-${item.id}`,
        parentId: utilParentId,
        title: item.label,
        body: item.description ?? null,
        kind: "utility",
        color: "slate",
        isNew: item.isNew ?? false,
        authGate: null,
        positionX: 0,
        positionY: 0,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Filter out any IDs already present so we don't re-seed and collide.
    const existingIds = new Set(Object.keys(get().nodes));
    const toInsert = incomingNodes.filter((n) => !existingIds.has(n.id));
    if (toInsert.length === 0) return;

    commitSeed(set, get, toInsert, "seedFromSiteArchitecture");
  },

  seedFromWireframes: () => {
    const now = nowISO();
    const rootId = "wf-root";
    const incomingNodes: ContentNode[] = [];

    incomingNodes.push({
      id: rootId,
      parentId: null,
      title: "Wireframes",
      body: "Template & page-level wireframe deliverables for tablex.com.",
      kind: "root",
      color: "emerald",
      isNew: false,
      authGate: null,
      positionX: 0,
      positionY: 0,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Group buckets under root
    const groupTitles: Record<string, string> = {
      marketing: "Marketing",
      discovery: "Discovery",
      action: "Action",
      portal: "Portals",
    };
    const seenGroups = new Set<string>();
    wireframePages.forEach((page, pi) => {
      if (!seenGroups.has(page.group)) {
        seenGroups.add(page.group);
        incomingNodes.push({
          id: `wf-group-${page.group}`,
          parentId: rootId,
          title: groupTitles[page.group] ?? page.group,
          body: null,
          kind: "section",
          color: "emerald",
          isNew: false,
          authGate: null,
          positionX: 0,
          positionY: 0,
          sortOrder: Object.keys(groupTitles).indexOf(page.group),
          createdAt: now,
          updatedAt: now,
        });
      }
      incomingNodes.push({
        id: `wf-${page.id}`,
        parentId: `wf-group-${page.group}`,
        title: page.label,
        body: page.templates?.length
          ? `Variants: ${page.templates.join(", ")}`
          : null,
        kind: "page",
        color: "emerald",
        isNew: false,
        authGate: null,
        positionX: 0,
        positionY: 0,
        sortOrder: pi,
        createdAt: now,
        updatedAt: now,
      });
    });

    const existingIds = new Set(Object.keys(get().nodes));
    const toInsert = incomingNodes.filter((n) => !existingIds.has(n.id));
    if (toInsert.length === 0) return;

    commitSeed(set, get, toInsert, "seedFromWireframes");
  },

  clearAll: async () => {
    // Optimistic clear locally; then one server call.
    set({
      nodes: {},
      edges: {},
      selectedNodeId: null,
      drawerOpen: false,
      expanded: {},
    });
    try {
      await contentMapClient.clearAllContentMap();
    } catch (err) {
      console.error("[content-map-store] clearAll failed", err);
      // Re-hydrate from server to recover visible state.
      const snap = await contentMapClient.fetchAllContentMap().catch(() => null);
      if (snap) get().hydrate(snap);
      throw err;
    }
  },
}));

// ─── Derived hooks ───────────────────────────────────────────────────────────

/** All nodes as a stable-ref array, sorted by sortOrder then id. */
export function useContentNodes(): ContentNode[] {
  const nodes = useContentMapStore((s) => s.nodes);
  return useMemo(
    () =>
      Object.values(nodes).sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
      ),
    [nodes],
  );
}

/** All edges as a stable-ref array. */
export function useContentEdges(): ContentEdge[] {
  const edges = useContentMapStore((s) => s.edges);
  return useMemo(() => Object.values(edges), [edges]);
}

/** Single node by id. */
export function useContentNode(id: string | null): ContentNode | undefined {
  return useContentMapStore((s) => (id ? s.nodes[id] : undefined));
}

/** Subscribe to just one node's expanded bit (stable boolean). */
export function useIsNodeExpanded(id: string): boolean {
  return useContentMapStore((s) => !!s.expanded[id]);
}

/** Summary counts for the dashboard. */
export function useContentMapCounts(): {
  nodeCount: number;
  edgeCount: number;
  hasData: boolean;
} {
  const nodes = useContentMapStore((s) => s.nodes);
  const edges = useContentMapStore((s) => s.edges);
  return useMemo(() => {
    const nodeCount = Object.keys(nodes).length;
    const edgeCount = Object.keys(edges).length;
    return { nodeCount, edgeCount, hasData: nodeCount > 0 };
  }, [nodes, edges]);
}
