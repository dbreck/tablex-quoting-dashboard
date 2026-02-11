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

function makeMaterial(finish: FinishOption): THREE.MeshPhysicalMaterial {
  const base = {
    color: new THREE.Color(finish.hex),
    roughness: finish.roughness,
    metalness: finish.metalness,
  };

  switch (finish.category) {
    case 'chrome':
      return new THREE.MeshPhysicalMaterial({
        ...base,
        metalness: 1.0,
        roughness: 0.05,
        envMapIntensity: 1.5,
      });
    case 'powder-coat':
      return new THREE.MeshPhysicalMaterial({
        ...base,
        clearcoat: 0.3,
        clearcoatRoughness: 0.6,
      });
    case 'solid-surface':
      return new THREE.MeshPhysicalMaterial({
        ...base,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
      });
    case 'butcher-block':
      return new THREE.MeshPhysicalMaterial({
        ...base,
        sheen: 0.3,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color(finish.hex),
      });
    default:
      return new THREE.MeshPhysicalMaterial(base);
  }
}

const DEFAULT_MATERIAL = new THREE.MeshPhysicalMaterial({ color: 0x888888, roughness: 0.5 });

function TableModelInner({ url, baseFinish, topFinish, edgeFinish }: TableModelProps) {
  const { scene } = useGLTF(url);
  const invalidate = useThree((s) => s.invalidate);

  // Clone scene, strip baked vertex colors, replace shared materials, and fix orientation.
  // GLBs from trimesh have COLOR_0 vertex attrs + no GLTF materials → three.js creates
  // default materials with vertexColors:true that override our finish colors.
  // Also: DXF source files are Z-up but three.js is Y-up → rotate -90° around X.
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.deleteAttribute("color");
        child.material = DEFAULT_MATERIAL.clone();
      }
    });
    // DXF/DWG files use Z-up; three.js uses Y-up
    c.rotation.x = -Math.PI / 2;
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
