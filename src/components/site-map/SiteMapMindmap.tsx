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
  Handle,
  Position,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Sparkles } from "lucide-react";
import {
  audienceColors,
  audienceLabels,
  siteMapGroups,
  type Audience,
  type SiteMapGroup,
  type SiteMapPage,
} from "@/data/site-map";

// ─── Layout constants ────────────────────────────────────────────────

const ROOT_WIDTH = 200;
const ROOT_HEIGHT = 96;
const GROUP_WIDTH = 220;
const GROUP_HEIGHT = 72;
const PAGE_WIDTH = 180;
const PAGE_HEIGHT = 56;

const GROUP_RADIUS = 460;
const PAGE_RADIUS_BASE = 920;
const PAGE_RADIUS_STEP = 380; // each depth deeper

const ARC_MARGIN_RAD = 0.18; // gap between adjacent groups' arcs (radians)

// ─── Types ───────────────────────────────────────────────────────────

interface RootNodeData extends Record<string, unknown> {
  kind: "root";
}

interface GroupNodeData extends Record<string, unknown> {
  kind: "group";
  group: SiteMapGroup;
}

interface PageNodeData extends Record<string, unknown> {
  kind: "page";
  page: SiteMapPage;
  groupAudience: Audience;
}

type MindmapNode =
  | (Node<RootNodeData> & { type: "mmRoot" })
  | (Node<GroupNodeData> & { type: "mmGroup" })
  | (Node<PageNodeData> & { type: "mmPage" });

// ─── Polar layout ────────────────────────────────────────────────────

function polar(angle: number, radius: number) {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

interface LayoutResult {
  nodes: MindmapNode[];
  edges: Edge[];
}

function buildLayout(
  groups: SiteMapGroup[],
  selectedPageId: string | null,
  visibleAudiences: Set<Audience>,
): LayoutResult {
  const nodes: MindmapNode[] = [];
  const edges: Edge[] = [];
  const positions = new Map<string, { x: number; y: number }>();

  // Root at origin.
  nodes.push({
    id: "mm:root",
    type: "mmRoot",
    position: { x: -ROOT_WIDTH / 2, y: -ROOT_HEIGHT / 2 },
    data: { kind: "root" },
    width: ROOT_WIDTH,
    height: ROOT_HEIGHT,
  });
  positions.set("mm:root", { x: 0, y: 0 });

  const N = groups.length;
  const fullCircle = Math.PI * 2;

  groups.forEach((group, gi) => {
    const groupCenterAngle = -Math.PI / 2 + (gi / N) * fullCircle;
    const arcSpan = fullCircle / N - ARC_MARGIN_RAD;
    const arcStart = groupCenterAngle - arcSpan / 2;

    const groupPos = polar(groupCenterAngle, GROUP_RADIUS);
    const groupNodeId = `mm:group:${group.id}`;
    nodes.push({
      id: groupNodeId,
      type: "mmGroup",
      position: { x: groupPos.x - GROUP_WIDTH / 2, y: groupPos.y - GROUP_HEIGHT / 2 },
      data: { kind: "group", group },
      width: GROUP_WIDTH,
      height: GROUP_HEIGHT,
    });
    positions.set(groupNodeId, groupPos);

    edges.push({
      id: `mm:e:root→${group.id}`,
      source: "mm:root",
      target: groupNodeId,
      type: "default",
      style: {
        stroke: audienceColors[group.audience],
        strokeOpacity: 0.7,
        strokeWidth: 2.5,
      },
      sourceHandle: handleFor(0, 0, groupPos.x, groupPos.y),
      targetHandle: handleFor(groupPos.x, groupPos.y, 0, 0),
    });

    // Top-level pages within the group (parentId === null in group scope).
    const topPages = group.pages.filter((p) => !p.parentId);
    if (topPages.length === 0) return;

    // Allocate the group's angular arc among top pages.
    const slotSize = arcSpan / topPages.length;

    topPages.forEach((page, pi) => {
      const pageAngle = arcStart + (pi + 0.5) * slotSize;
      const pagePos = polar(pageAngle, PAGE_RADIUS_BASE);
      positions.set(page.id, pagePos);

      nodes.push({
        id: page.id,
        type: "mmPage",
        position: { x: pagePos.x - PAGE_WIDTH / 2, y: pagePos.y - PAGE_HEIGHT / 2 },
        data: {
          kind: "page",
          page,
          groupAudience: group.audience,
        },
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      });

      edges.push({
        id: `mm:e:${groupNodeId}→${page.id}`,
        source: groupNodeId,
        target: page.id,
        type: "default",
        style: {
          stroke: audienceColors[page.audience],
          strokeOpacity: visibleAudiences.has(page.audience) ? 0.55 : 0.1,
          strokeWidth: 1.5,
        },
        sourceHandle: handleFor(groupPos.x, groupPos.y, pagePos.x, pagePos.y),
        targetHandle: handleFor(pagePos.x, pagePos.y, groupPos.x, groupPos.y),
      });

      // Recursively place sub-pages within this slot.
      const placeChildren = (
        parent: SiteMapPage,
        parentAngle: number,
        parentRadius: number,
        availableArc: number,
        depth: number,
      ) => {
        const children = group.pages.filter((c) => c.parentId === parent.id);
        if (children.length === 0) return;

        const childArc = availableArc * 0.78;
        const childStart = parentAngle - childArc / 2;
        const childRadius = parentRadius + PAGE_RADIUS_STEP;

        children.forEach((child, ci) => {
          const childAngle =
            children.length === 1
              ? parentAngle
              : childStart + ((ci + 0.5) * childArc) / children.length;
          const childPos = polar(childAngle, childRadius);
          positions.set(child.id, childPos);

          nodes.push({
            id: child.id,
            type: "mmPage",
            position: {
              x: childPos.x - PAGE_WIDTH / 2,
              y: childPos.y - PAGE_HEIGHT / 2,
            },
            data: {
              kind: "page",
              page: child,
              groupAudience: group.audience,
            },
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          });

          const parentPos = positions.get(parent.id)!;
          edges.push({
            id: `mm:e:${parent.id}→${child.id}`,
            source: parent.id,
            target: child.id,
            type: "default",
            style: {
              stroke: audienceColors[child.audience],
              strokeOpacity: visibleAudiences.has(child.audience) ? 0.45 : 0.08,
              strokeWidth: 1.25,
            },
            sourceHandle: handleFor(
              parentPos.x,
              parentPos.y,
              childPos.x,
              childPos.y,
            ),
            targetHandle: handleFor(
              childPos.x,
              childPos.y,
              parentPos.x,
              parentPos.y,
            ),
          });

          placeChildren(
            child,
            childAngle,
            childRadius,
            childArc / Math.max(1, children.length),
            depth + 1,
          );
        });
      };

      placeChildren(page, pageAngle, PAGE_RADIUS_BASE, slotSize, 0);
    });
  });

  // Selected node: lift to top by re-pushing.
  if (selectedPageId) {
    const idx = nodes.findIndex((n) => n.id === selectedPageId);
    if (idx >= 0) {
      const [picked] = nodes.splice(idx, 1);
      nodes.push(picked);
    }
  }

  return { nodes, edges };
}

/** Pick the handle on the source node closest to the target. */
function handleFor(fromX: number, fromY: number, toX: number, toY: number): string {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
}

// ─── Node components ─────────────────────────────────────────────────

function fourHandles(idPrefix: "src" | "tgt") {
  const type = idPrefix === "src" ? "source" : "target";
  // Render all 4 (top/right/bottom/left) so edges can pick.
  return (
    <>
      <Handle
        type={type}
        position={Position.Top}
        id="top"
        style={{ visibility: "hidden", top: 0 }}
      />
      <Handle
        type={type}
        position={Position.Right}
        id="right"
        style={{ visibility: "hidden", right: 0 }}
      />
      <Handle
        type={type}
        position={Position.Bottom}
        id="bottom"
        style={{ visibility: "hidden", bottom: 0 }}
      />
      <Handle
        type={type}
        position={Position.Left}
        id="left"
        style={{ visibility: "hidden", left: 0 }}
      />
    </>
  );
}

function RootNode({ selected }: NodeProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl ${
        selected ? "ring-2 ring-orange-400" : ""
      }`}
      style={{ width: ROOT_WIDTH, height: ROOT_HEIGHT }}
    >
      {fourHandles("tgt")}
      {fourHandles("src")}
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold mb-0.5">
        Site
      </div>
      <div className="text-xl font-bold">
        TABLE<span className="text-orange-400">X</span>
      </div>
      <div className="text-[10px] text-white/40 mt-0.5 font-mono">
        tablex.com
      </div>
    </div>
  );
}

function GroupMindmapNode({ data, selected }: NodeProps<Node<GroupNodeData>>) {
  const tint = audienceColors[data.group.audience];
  return (
    <div
      className={`flex h-full w-full flex-col justify-center rounded-xl bg-white px-3 py-2 shadow-md hover:shadow-lg transition-shadow border-2 ${
        selected ? "ring-2 ring-orange-400" : ""
      }`}
      style={{
        borderColor: tint,
        width: GROUP_WIDTH,
        height: GROUP_HEIGHT,
      }}
    >
      {fourHandles("tgt")}
      {fourHandles("src")}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[9px] uppercase tracking-wider font-semibold"
          style={{ color: tint }}
        >
          {audienceLabels[data.group.audience]}
        </span>
        <span className="text-[9px] text-slate-400 font-mono ml-auto">
          {data.group.routeGroup}
        </span>
      </div>
      <div className="text-sm font-bold text-slate-900 truncate">
        {data.group.label.replace(/^Public — /, "")}
      </div>
      <div className="text-[10px] text-slate-500">
        {data.group.pages.length} pages
      </div>
    </div>
  );
}

function PageMindmapNode({
  data,
  selected,
}: NodeProps<Node<PageNodeData>>) {
  const tint = audienceColors[data.page.audience];
  return (
    <div
      className={`flex h-full w-full flex-col justify-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm hover:shadow-md transition-shadow border ${
        selected ? "ring-2 ring-orange-400 border-orange-300" : ""
      }`}
      style={{
        borderColor: selected ? "#fdba74" : "#e2e8f0",
        borderLeftWidth: 3,
        borderLeftColor: tint,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      }}
    >
      {fourHandles("tgt")}
      {fourHandles("src")}
      <div className="flex items-center gap-1.5">
        <code className="text-[9px] text-slate-500 font-mono truncate flex-1">
          {data.page.route}
        </code>
        {data.page.isNew && (
          <Sparkles className="h-2.5 w-2.5 text-orange-500" />
        )}
      </div>
      <div className="text-[12px] font-semibold text-slate-900 truncate leading-tight">
        {data.page.label}
      </div>
    </div>
  );
}

const nodeTypes = {
  mmRoot: RootNode,
  mmGroup: GroupMindmapNode,
  mmPage: PageMindmapNode,
};

// ─── Inner / outer ───────────────────────────────────────────────────

interface FlowProps {
  visibleAudiences: Set<Audience>;
  selectedPageId: string | null;
  onPageClick: (id: string) => void;
}

function FlowInner({
  visibleAudiences,
  selectedPageId,
  onPageClick,
}: FlowProps) {
  const { fitView } = useReactFlow();

  const built = useMemo(
    () => buildLayout(siteMapGroups, selectedPageId, visibleAudiences),
    [selectedPageId, visibleAudiences],
  );

  // Audience-based dimming applied at render time, not via setState.
  const nodes = useMemo<MindmapNode[]>(
    () =>
      built.nodes.map((n) => {
        if (n.type === "mmPage") {
          const dimmed = !visibleAudiences.has(n.data.page.audience);
          return {
            ...n,
            style: { ...n.style, opacity: dimmed ? 0.18 : 1 },
          };
        }
        return n;
      }),
    [built.nodes, visibleAudiences],
  );

  const edges = built.edges;

  useEffect(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.12, duration: 350 });
    });
  }, [built, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={(_, node) => {
        if (node.type === "mmPage") onPageClick(node.id);
      }}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.08}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color="#cbd5e1"
      />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          const data = n.data as
            | { kind?: string; page?: SiteMapPage; group?: SiteMapGroup; groupAudience?: Audience }
            | undefined;
          if (data?.kind === "root") return "#0f172a";
          if (data?.kind === "group" && data.group)
            return audienceColors[data.group.audience];
          if (data?.kind === "page" && data.page)
            return audienceColors[data.page.audience];
          return "#cbd5e1";
        }}
        pannable
        zoomable
        className="!bg-white"
      />
    </ReactFlow>
  );
}

export function SiteMapMindmap(props: FlowProps) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}
