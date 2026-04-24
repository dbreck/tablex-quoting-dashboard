// Browser-side CRUD helpers for content_nodes + content_edges.
// RLS enforces authz (can_access_proposal for read/write; admin for delete).
// The content-map store calls these as fire-and-forget after applying the
// optimistic local update.

import { createClient } from "@/lib/supabase/client";
import {
  rowToContentNode,
  rowToContentEdge,
  nodeToInsertRow,
  nodeUpdatesToRow,
  edgeToInsertRow,
  type ContentNode,
  type ContentEdge,
  type ContentNodeRow,
  type ContentEdgeRow,
} from "@/lib/supabase/content-map-converters";

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchAllContentMap(): Promise<{
  nodes: ContentNode[];
  edges: ContentEdge[];
}> {
  const supabase = createClient();
  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from("content_nodes").select("*"),
    supabase.from("content_edges").select("*"),
  ]);
  if (nodesRes.error) throw nodesRes.error;
  if (edgesRes.error) throw edgesRes.error;
  return {
    nodes: (nodesRes.data as ContentNodeRow[]).map(rowToContentNode),
    edges: (edgesRes.data as ContentEdgeRow[]).map(rowToContentEdge),
  };
}

// ─── Node writes ─────────────────────────────────────────────────────────────

export async function createNode(
  node: Omit<ContentNode, "createdAt" | "updatedAt">,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_nodes")
    .insert(nodeToInsertRow(node));
  if (error) throw error;
}

export async function updateNode(
  id: string,
  patch: Partial<Omit<ContentNode, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = nodeUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("content_nodes").update(row).eq("id", id);
  if (error) throw error;
}

/** Admin-only via RLS. */
export async function deleteNode(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("content_nodes").delete().eq("id", id);
  if (error) throw error;
}

// ─── Edge writes ─────────────────────────────────────────────────────────────

export async function createEdge(
  edge: Omit<ContentEdge, "createdAt" | "updatedAt">,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_edges")
    .insert(edgeToInsertRow(edge));
  if (error) throw error;
}

/** Admin-only via RLS. */
export async function deleteEdge(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("content_edges").delete().eq("id", id);
  if (error) throw error;
}

// ─── Bulk ────────────────────────────────────────────────────────────────────

export async function bulkInsertNodes(nodes: ContentNode[]): Promise<void> {
  if (nodes.length === 0) return;
  const supabase = createClient();
  const rows = nodes.map(nodeToInsertRow);
  const { error } = await supabase.from("content_nodes").insert(rows);
  if (error) throw error;
}

export async function bulkInsertEdges(edges: ContentEdge[]): Promise<void> {
  if (edges.length === 0) return;
  const supabase = createClient();
  const rows = edges.map(edgeToInsertRow);
  const { error } = await supabase.from("content_edges").insert(rows);
  if (error) throw error;
}

/**
 * Write positions for many nodes at once (used after auto-layout).
 * One round-trip via upsert so we don't fire N updates.
 */
export async function bulkUpdatePositions(
  updates: { id: string; positionX: number; positionY: number }[],
): Promise<void> {
  if (updates.length === 0) return;
  const supabase = createClient();
  // Fire updates in parallel — simpler than upsert for partial columns.
  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from("content_nodes")
        .update({ position_x: u.positionX, position_y: u.positionY })
        .eq("id", u.id),
    ),
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;
}

/** Admin-only via RLS — deletes every node (edges cascade). */
export async function clearAllContentMap(): Promise<void> {
  const supabase = createClient();
  // Delete every row. Use a filter that matches everything to satisfy pg's
  // requirement that DELETE has a WHERE clause when enabled.
  const { error } = await supabase
    .from("content_nodes")
    .delete()
    .not("id", "is", null);
  if (error) throw error;
}
