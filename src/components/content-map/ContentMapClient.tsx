"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ContentMapCanvas } from "./ContentMapCanvas";
import { ContentMapToolbar } from "./ContentMapToolbar";
import { ContentNodeDrawer } from "./ContentNodeDrawer";
import {
  useContentMapCounts,
  useContentMapStore,
} from "@/store/content-map-store";
import { computeDagreLayout } from "@/lib/content-map/layout";
import { Button } from "@/components/ui/button";
import { Network, Sparkles, FileText, Plus } from "lucide-react";

export function ContentMapClient() {
  const [fullscreen, setFullscreen] = useState(false);
  const { nodeCount, hasData } = useContentMapCounts();
  const seedFromSiteArchitecture = useContentMapStore(
    (s) => s.seedFromSiteArchitecture,
  );
  const seedFromWireframes = useContentMapStore((s) => s.seedFromWireframes);
  const addNode = useContentMapStore((s) => s.addNode);
  const openDrawer = useContentMapStore((s) => s.openDrawer);
  const applyLayoutPositions = useContentMapStore(
    (s) => s.applyLayoutPositions,
  );

  const handleAddNode = () => {
    // Place near center of viewport-ish — React Flow fitView will sort it.
    const node = addNode({
      positionX: 200,
      positionY: 200,
    });
    openDrawer(node.id);
  };

  const handleAutoLayout = () => {
    const nodes = Object.values(useContentMapStore.getState().nodes);
    const positions = computeDagreLayout(nodes);
    applyLayoutPositions(positions);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-[#f7f6f2]",
        fullscreen
          ? "fixed inset-0 z-50 h-screen"
          : "h-[calc(100vh-4rem)] -m-8",
      )}
    >
      <ContentMapToolbar
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((f) => !f)}
        onAutoLayout={handleAutoLayout}
        onAddNode={handleAddNode}
      />
      <div className="flex-1 relative">
        {!hasData ? (
          <EmptyState
            onSeedSiteArchitecture={seedFromSiteArchitecture}
            onSeedWireframes={seedFromWireframes}
            onAddNode={handleAddNode}
          />
        ) : (
          <ContentMapCanvas />
        )}
      </div>
      <ContentNodeDrawer />
      <Legend visible={nodeCount > 0} />
    </div>
  );
}

function EmptyState({
  onSeedSiteArchitecture,
  onSeedWireframes,
  onAddNode,
}: {
  onSeedSiteArchitecture: () => void;
  onSeedWireframes: () => void;
  onAddNode: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-5">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-green/10 mb-2">
          <Network className="h-7 w-7 text-brand-green" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Start your content map
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            Seed from an existing planning artifact to bootstrap the tree, or
            start from a single blank node. Everything here is shared with the
            team and the client — drag, connect, and write content freely.
          </p>
        </div>
        <div className="grid gap-2">
          <Button
            onClick={onSeedSiteArchitecture}
            className="bg-violet-500 hover:bg-violet-600 text-white border-transparent"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Seed from Site Architecture
          </Button>
          <Button
            onClick={onSeedWireframes}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent"
          >
            <FileText className="h-4 w-4 mr-2" />
            Seed from Wireframes
          </Button>
          <Button variant="outline" onClick={onAddNode}>
            <Plus className="h-4 w-4 mr-2" />
            Start with one blank node
          </Button>
        </div>
        <p className="text-[11px] text-slate-400 pt-1">
          Tip: you can seed both — Site Architecture nodes use the <code>sa-</code> prefix, wireframe nodes use <code>wf-</code>, so they coexist.
        </p>
      </div>
    </div>
  );
}

function Legend({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm px-3 py-2 text-[10px]">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-5 h-px bg-blue-500" />
        <span className="text-slate-600">Parent</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-5 h-px"
          style={{
            backgroundImage:
              "linear-gradient(to right, #a855f7 50%, transparent 50%)",
            backgroundSize: "4px 1px",
            height: "1px",
          }}
        />
        <span className="text-slate-600">Cross-link</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400">
        <span className="text-[9px] uppercase tracking-widest">
          Double-click node to edit · Drag handles to link
        </span>
      </div>
    </div>
  );
}
