"use client";

import { useEffect, useMemo, useRef, Component, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { FinishOption } from "@/data/finish-catalog";

interface TableModelProps {
  url: string;
  baseFinish?: FinishOption;
  topFinish?: FinishOption;
  edgeFinish?: FinishOption;
}

/** Mesh name to part mapping — GLBs use exact names: top, base, edge, other */
function classifyMesh(name: string): "top" | "base" | "edge" | "other" | null {
  const n = name.toLowerCase();
  if (n === "top" || n.startsWith("top_") || n.startsWith("top.")) return "top";
  if (n === "base" || n.startsWith("base_") || n.startsWith("base.")) return "base";
  if (n === "edge" || n.startsWith("edge_") || n.startsWith("edge.")) return "edge";
  if (n === "other" || n.startsWith("other_") || n.startsWith("other.")) return "other";
  return null;
}

function makeMaterial(finish: FinishOption): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(finish.hex),
    roughness: finish.roughness,
    metalness: finish.metalness,
  });
}

function TableModelInner({ url, baseFinish, topFinish, edgeFinish }: TableModelProps) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const needsInvalidate = useRef(false);

  // Apply finishes whenever they change — mutate materials in-place on the clone
  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const part = classifyMesh(child.name);
      if (!part) return;

      let finish: FinishOption | undefined;
      if (part === "top") finish = topFinish;
      else if (part === "base" || part === "other") finish = baseFinish;
      else if (part === "edge") finish = edgeFinish;

      if (finish) {
        // Dispose previous material to avoid memory leak
        if (child.material) {
          (child.material as THREE.Material).dispose();
        }
        child.material = makeMaterial(finish);
      }
    });
    // Flag that the scene changed so R3F re-renders one frame
    needsInvalidate.current = true;
  }, [clone, baseFinish, topFinish, edgeFinish]);

  // Invalidate the R3F frame loop once after material changes
  useFrame(({ invalidate }) => {
    if (needsInvalidate.current) {
      needsInvalidate.current = false;
      invalidate();
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          (child.material as THREE.Material).dispose();
        }
      });
    };
  }, [clone]);

  return <primitive object={clone} />;
}

// Error boundary that resets when key changes (via key={url} on parent)
class ModelErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("3D model failed to load:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/**
 * Wraps the model loader in an error boundary keyed by URL.
 * When the URL changes, React remounts the boundary, clearing any error state.
 */
export function TableModel(props: TableModelProps) {
  return (
    <ModelErrorBoundary key={props.url}>
      <TableModelInner {...props} />
    </ModelErrorBoundary>
  );
}

TableModel.preload = (url: string) => useGLTF.preload(url);
