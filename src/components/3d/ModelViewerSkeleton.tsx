"use client";

export function ModelViewerSkeleton() {
  return (
    <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm text-slate-400 font-medium">Loading 3D model...</p>
      </div>
    </div>
  );
}
