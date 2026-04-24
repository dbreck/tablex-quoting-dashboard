"use client";

import {
  LayoutGrid,
  Maximize2,
  Minimize2,
  Network,
  Plus,
  Sparkles,
  Trash2,
  FileText,
  ChevronsDown,
  ChevronsUp,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  useContentMapCounts,
  useContentMapStore,
} from "@/store/content-map-store";
import {
  downloadMarkdown,
  exportToMarkdown,
} from "@/lib/content-map/export";

interface Props {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onAutoLayout: () => void;
  onAddNode: () => void;
}

export function ContentMapToolbar({
  fullscreen,
  onToggleFullscreen,
  onAutoLayout,
  onAddNode,
}: Props) {
  const { nodeCount, edgeCount } = useContentMapCounts();
  const seedFromSiteArchitecture = useContentMapStore(
    (s) => s.seedFromSiteArchitecture,
  );
  const seedFromWireframes = useContentMapStore((s) => s.seedFromWireframes);
  const clearAll = useContentMapStore((s) => s.clearAll);
  const expandAll = useContentMapStore((s) => s.expandAll);
  const collapseAll = useContentMapStore((s) => s.collapseAll);
  const { isAdmin } = useAuth();

  const handleExport = () => {
    const state = useContentMapStore.getState();
    const nodes = Object.values(state.nodes);
    const edges = Object.values(state.edges);
    const md = exportToMarkdown({
      nodes,
      edges,
      title: "TableX Content Map",
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadMarkdown(md, `content-map-${date}.md`);
  };

  return (
    <div className="border-b border-white/10 bg-[#0a0a0a] px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
      {/* Left: identity + counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-brand-green" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium">
            Website Redesign · Content Map
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
          </Badge>
          {edgeCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {edgeCount} {edgeCount === 1 ? "link" : "links"}
            </Badge>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button size="sm" variant="outline" onClick={onAddNode}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Node
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={seedFromSiteArchitecture}
          title="Seed ~60 nodes from the Site Architecture draft"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
          Site Architecture
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={seedFromWireframes}
          title="Seed 17-page wireframes tree"
        >
          <FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
          Wireframes
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={expandAll}
          title="Expand body content on every node that has any"
        >
          <ChevronsDown className="h-3.5 w-3.5 mr-1.5" />
          Expand
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={collapseAll}
          title="Collapse all nodes"
        >
          <ChevronsUp className="h-3.5 w-3.5 mr-1.5" />
          Collapse
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onAutoLayout}
          title="Auto-layout the tree (dagre, top-down)"
        >
          <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
          Auto-layout
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          title="Download the whole map as a Markdown file"
          disabled={nodeCount === 0}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export MD
        </Button>
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (
                confirm(
                  "Clear the entire content map? Every node and link will be deleted. This cannot be undone.",
                )
              ) {
                void clearAll();
              }
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onToggleFullscreen}>
          {fullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5 mr-1.5" />
              Exit
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
              Fullscreen
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
