"use client";

import { useEffect, useMemo, Component, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
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
  const invalidate = useThree((s) => s.invalidate);

  // Clone scene and strip baked vertex colors (COLOR_0) so our materials take effect.
  // The GLBs from trimesh have vertex colors but no GLTF materials, so three.js
  // creates default materials with vertexColors:true — which override our finish colors.
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.deleteAttribute("color");
      }
    });
    return c;
  }, [scene]);

  // Apply finishes whenever they change
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
        if (child.material) {
          (child.material as THREE.Material).dispose();
        }
        child.material = makeMaterial(finish);
      }
    });
    invalidate();
  }, [clone, baseFinish, topFinish, edgeFinish, invalidate]);

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
