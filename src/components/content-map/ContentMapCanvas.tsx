"use client";

// Side-effect import: registers .transition() on d3 selections so React Flow's
// zoom / pan animations (Controls buttons, fitView) work under Turbopack.
// Without this, any animated transition throws
// "selection.transition is not a function".
import "d3-transition";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ContentNodeComponent } from "./ContentNode";
import {
  useContentEdges,
  useContentMapStore,
  useContentNodes,
} from "@/store/content-map-store";
import type {
  ContentNode,
  ContentEdge,
} from "@/lib/supabase/content-map-converters";

const nodeTypes = { content: ContentNodeComponent };

// Maps a store ContentNode → React Flow node.
function toRFNode(n: ContentNode, selected: boolean): Node {
  return {
    id: n.id,
    type: "content",
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data: { node: n, selected },
    selected,
  };
}

// Edges: parent edges are derived from parentId (kind='parent'), plus user-drawn
// link edges from the content_edges table (kind='link').
function buildEdges(nodes: ContentNode[], linkEdges: ContentEdge[]): Edge[] {
  const edges: Edge[] = [];
  const idSet = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    if (n.parentId && idSet.has(n.parentId)) {
      edges.push({
        id: `parent-${n.parentId}-${n.id}`,
        source: n.parentId,
        target: n.id,
        type: "smoothstep",
        style: { stroke: "#3b82f6", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
      });
    }
  }
  for (const e of linkEdges) {
    edges.push({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#a855f7", strokeWidth: 1.5, strokeDasharray: "4 4" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
    });
  }
  return edges;
}

function CanvasInner() {
  const storeNodes = useContentNodes();
  const storeEdges = useContentEdges();
  const selectedId = useContentMapStore((s) => s.selectedNodeId);
  const setSelected = useContentMapStore((s) => s.setSelected);
  const openDrawer = useContentMapStore((s) => s.openDrawer);
  const updateNode = useContentMapStore((s) => s.updateNode);
  const addEdgeAction = useContentMapStore((s) => s.addEdge);
  const deleteEdgeAction = useContentMapStore((s) => s.deleteEdge);
  const { fitView } = useReactFlow();

  // Local mirrors owned by React Flow — so drags animate smoothly. We sync
  // from the store whenever storeNodes / storeEdges / selectedId change,
  // and write back on drag-stop / select / edge delete.
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);

  // Sync store → local nodes. Preserve the position of any node currently being
  // dragged, so a store update (e.g. Realtime echo) mid-drag doesn't snap the
  // card back.
  useEffect(() => {
    setRfNodes((current) => {
      const prevById = new Map(current.map((n) => [n.id, n]));
      return storeNodes.map((sn) => {
        const prev = prevById.get(sn.id);
        const base = toRFNode(sn, sn.id === selectedId);
        if (prev?.dragging) {
          return { ...base, position: prev.position, dragging: true };
        }
        return base;
      });
    });
  }, [storeNodes, selectedId]);

  // Sync store → local edges.
  useEffect(() => {
    setRfEdges(buildEdges(storeNodes, storeEdges));
  }, [storeNodes, storeEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply to local state first — React Flow mutates nodes in place during
      // drag, so this is what gives the card its live cursor tracking.
      setRfNodes((curr) => applyNodeChanges(changes, curr));

      // Mirror meaningful changes back to the store.
      for (const c of changes) {
        if (c.type === "position" && c.dragging === false && c.position) {
          // Drag just ended — persist the final position.
          updateNode(c.id, { positionX: c.position.x, positionY: c.position.y });
        }
        if (c.type === "select") {
          setSelected(c.selected ? c.id : null);
        }
        // "remove" changes flow only from onEdgesChange for edges; for nodes,
        // deletion goes through the drawer's Delete button (admin-gated).
      }
    },
    [updateNode, setSelected],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setRfEdges((curr) => applyEdgeChanges(changes, curr));
      for (const c of changes) {
        // Only delete user-drawn link edges — parent edges are derived.
        if (c.type === "remove" && !c.id.startsWith("parent-")) {
          deleteEdgeAction(c.id);
        }
      }
    },
    [deleteEdgeAction],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (conn.source && conn.target) {
        addEdgeAction(conn.source, conn.target);
      }
    },
    [addEdgeAction],
  );

  const onNodeDoubleClick = useCallback(
    (_ev: unknown, n: Node) => {
      openDrawer(n.id);
    },
    [openDrawer],
  );

  const onNodeClick = useCallback(
    (_ev: unknown, n: Node) => {
      setSelected(n.id);
    },
    [setSelected],
  );

  // Fit view once on first load when we first have nodes.
  const didFitRef = useRef(false);
  useEffect(() => {
    if (!didFitRef.current && rfNodes.length > 0) {
      didFitRef.current = true;
      requestAnimationFrame(() => fitView({ padding: 0.2 }));
    }
  }, [rfNodes.length, fitView]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onPaneClick={() => setSelected(null)}
      proOptions={{ hideAttribution: true }}
      fitView
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{ type: "smoothstep" }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
      <Controls className="!bg-white !border !border-slate-200 !rounded-lg !shadow-md" />
      <MiniMap
        pannable
        zoomable
        className="!bg-white !border !border-slate-200 !rounded-lg !shadow-md"
        nodeColor={(n) => {
          const data = n.data as { node?: ContentNode } | undefined;
          const color = data?.node?.color;
          if (color === "green" || color === "emerald") return "#10b981";
          if (color === "violet") return "#8b5cf6";
          if (color === "amber") return "#f59e0b";
          if (color === "sky" || color === "blue") return "#0ea5e9";
          if (color === "indigo") return "#6366f1";
          if (color === "teal") return "#14b8a6";
          return "#94a3b8";
        }}
      />
    </ReactFlow>
  );
}

export function ContentMapCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
