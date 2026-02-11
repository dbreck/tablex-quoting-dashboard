"use client";

import { Suspense, useRef, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinishOption } from "@/data/finish-catalog";
import { TableModel } from "./TableModel";
import { ModelViewerSkeleton } from "./ModelViewerSkeleton";
import { ViewerControls } from "./ViewerControls";

interface ModelViewerProps {
  modelUrl: string | null;
  baseFinish?: FinishOption;
  topFinish?: FinishOption;
  edgeFinish?: FinishOption;
  className?: string;
  compact?: boolean;
}

export function ModelViewer({
  modelUrl,
  baseFinish,
  topFinish,
  edgeFinish,
  className,
  compact = false,
}: ModelViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReset = useCallback(() => {
    controlsRef.current?.reset();
  }, []);

  const handleZoomIn = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    camera.position.multiplyScalar(0.8);
    controls.update();
  }, []);

  const handleZoomOut = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    camera.position.multiplyScalar(1.25);
    controls.update();
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  if (!modelUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400",
          compact ? "h-40" : "aspect-video",
          className,
        )}
      >
        <Box className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">No 3D model available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200",
        compact ? "h-40" : "aspect-video",
        className,
      )}
    >
      <Canvas camera={{ position: [2, 1.5, 3], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />
        <Environment preset="studio" />
        <Suspense fallback={null}>
          <Center>
            <TableModel
              url={modelUrl}
              baseFinish={baseFinish}
              topFinish={topFinish}
              edgeFinish={edgeFinish}
            />
          </Center>
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1}
          maxDistance={10}
        />
      </Canvas>

      {!compact && (
        <ViewerControls
          onReset={handleReset}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}
    </div>
  );
}
