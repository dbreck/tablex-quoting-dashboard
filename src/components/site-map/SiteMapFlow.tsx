"use client";

import "d3-transition";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  buildSiteMapFlow,
  type SiteMapFlowNode,
} from "@/lib/site-map/flow";
import {
  GroupNode,
  PageNode,
  setSiteMapNodeCallbacks,
} from "./SiteMapNodes";
import {
  siteMapGroups,
  type Audience,
  type SiteMapPage,
} from "@/data/site-map";

const nodeTypes = {
  siteMapGroup: GroupNode,
  siteMapPage: PageNode,
};

interface FlowProps {
  collapsedGroups: Set<string>;
  visibleAudiences: Set<Audience>;
  selectedPageId: string | null;
  onToggleGroup: (groupId: string) => void;
  onPageClick: (pageId: string) => void;
}

function FlowInner({
  collapsedGroups,
  visibleAudiences,
  selectedPageId,
  onToggleGroup,
  onPageClick,
}: FlowProps) {
  const { fitView } = useReactFlow();
  const [localNodes, setLocalNodes] = useState<SiteMapFlowNode[]>([]);
  const [localEdges, setLocalEdges] = useState<Edge[]>([]);

  // Wire node-component callbacks once.
  useEffect(() => {
    setSiteMapNodeCallbacks({
      onToggleGroup,
      onPageClick,
      isGroupCollapsed: (id) => collapsedGroups.has(id),
      isPageDimmed: (p: SiteMapPage) => !visibleAudiences.has(p.audience),
      isPageSelected: (id) => id === selectedPageId,
    });
  }, [
    collapsedGroups,
    visibleAudiences,
    selectedPageId,
    onToggleGroup,
    onPageClick,
  ]);

  // Recompute layout when collapsed groups change. Audience filter only
  // toggles dimming so we don't relay out the canvas on every filter change.
  const built = useMemo(
    () =>
      buildSiteMapFlow(siteMapGroups, {
        collapsedGroups,
      }),
    [collapsedGroups],
  );

  useEffect(() => {
    setLocalNodes(built.nodes);
    setLocalEdges(built.edges);
    requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 0 });
    });
  }, [built, fitView]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setLocalNodes(
      (nds) => applyNodeChanges(changes, nds as Node[]) as SiteMapFlowNode[],
    );
  }, []);

  return (
    <ReactFlow
      nodes={localNodes}
      edges={localEdges}
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.15}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          const data = n.data as { kind?: string; color?: string } | undefined;
          if (data?.kind === "group") return data.color ?? "#888";
          return "#cbd5e1";
        }}
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

export function SiteMapFlow(props: FlowProps) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}
