"use client";

import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Environment, ContactShadows, Bounds, useBounds } from "@react-three/drei";
import { NeutralToneMapping } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinishOption } from "@/data/finish-catalog";
import { TableModel } from "./TableModel";
import { ViewerControls } from "./ViewerControls";

export type EnvironmentPreset =
  | "apartment" | "city" | "dawn" | "forest" | "lobby"
  | "night" | "park" | "studio" | "sunset" | "warehouse";

interface ModelViewerProps {
  modelUrl: string | null;
  supplierBaseUrl?: string | null;
  baseFinish?: FinishOption;
  topFinish?: FinishOption;
  edgeFinish?: FinishOption;
  environmentPreset?: EnvironmentPreset;
  className?: string;
  compact?: boolean;
}

/** Triggers Bounds.refresh() whenever the model URL changes */
function BoundsRefresher({ modelKey }: { modelKey: string }) {
  const bounds = useBounds();
  const prevKey = useRef(modelKey);

  useEffect(() => {
    if (modelKey !== prevKey.current) {
      prevKey.current = modelKey;
      // Schedule refresh after the new model mounts
      requestAnimationFrame(() => bounds.refresh().clip().fit());
    }
  }, [modelKey, bounds]);

  return null;
}

export function ModelViewer({
  modelUrl,
  supplierBaseUrl,
  baseFinish,
  topFinish,
  edgeFinish,
  environmentPreset = "city",
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
      <Canvas
        camera={{ position: [1.8, 0.7, 1.2], fov: 40 }}
        gl={{ toneMapping: NeutralToneMapping, toneMappingExposure: 1.0 }}
      >
        <ambientLight intensity={0.3} />
        <gridHelper args={[10, 10, '#cccccc', '#e5e5e5']} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <Center disableY>
              <TableModel
                url={modelUrl}
                supplierBaseUrl={supplierBaseUrl}
                baseFinish={baseFinish}
                topFinish={topFinish}
                edgeFinish={edgeFinish}
              />
            </Center>
            <BoundsRefresher modelKey={`${modelUrl}|${supplierBaseUrl ?? ''}`} />
          </Bounds>
          <Environment preset={environmentPreset} background={false} environmentIntensity={1.0} />
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            blur={2.5}
            scale={10}
            resolution={256}
            color="#1a3c5c"
          />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1}
          maxDistance={10}
          makeDefault
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
