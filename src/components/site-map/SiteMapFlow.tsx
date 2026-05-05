"use client";

import "d3-transition";
import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildSiteMapFlow } from "@/lib/site-map/flow";
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

  // Wire node-component callbacks. Effect-only — observes external module state.
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

  const built = useMemo(
    () =>
      buildSiteMapFlow(siteMapGroups, {
        collapsedGroups,
      }),
    [collapsedGroups],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 0 });
    });
  }, [built, fitView]);

  // Use uncontrolled defaults + key to remount on layout change. Lets xyflow
  // own internal node positions for drag without us mirroring state.
  return (
    <ReactFlow
      key={Array.from(collapsedGroups).sort().join("|")}
      defaultNodes={built.nodes}
      defaultEdges={built.edges}
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
