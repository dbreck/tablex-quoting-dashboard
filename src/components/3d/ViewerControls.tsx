"use client";

import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

interface ViewerControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  isFullscreen?: boolean;
}

export function ViewerControls({
  onReset,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  isFullscreen = false,
}: ViewerControlsProps) {
  const btnClass =
    "p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors";

  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/80 backdrop-blur rounded-xl px-1 py-1 shadow-sm border border-slate-200/50">
      <button onClick={onReset} className={btnClass} title="Reset view">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button onClick={onZoomIn} className={btnClass} title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button onClick={onZoomOut} className={btnClass} title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button onClick={onFullscreen} className={btnClass} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
