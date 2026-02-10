"use client";

import { useEffect, useMemo, Component, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { FinishOption } from "@/data/finish-catalog";

interface TableModelProps {
  url: string;
  baseFinish?: FinishOption;
  topFinish?: FinishOption;
  edgeFinish?: FinishOption;
}

function applyFinish(mesh: THREE.Mesh, finish: FinishOption) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(finish.hex),
    roughness: finish.roughness,
    metalness: finish.metalness,
  });
  // Dispose previous material
  if (mesh.material) {
    const prev = mesh.material as THREE.Material;
    prev.dispose();
  }
  mesh.material = material;
}

function TableModelInner({ url, baseFinish, topFinish, edgeFinish }: TableModelProps) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = child.name.toLowerCase();

      if (topFinish && name.includes("top")) {
        applyFinish(child, topFinish);
      } else if (baseFinish && name.includes("base")) {
        applyFinish(child, baseFinish);
      } else if (edgeFinish && name.includes("edge")) {
        applyFinish(child, edgeFinish);
      }
    });
  }, [clone, baseFinish, topFinish, edgeFinish]);

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

// Error boundary to catch useGLTF load failures without crashing the app
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
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
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export function TableModel(props: TableModelProps) {
  return (
    <ModelErrorBoundary>
      <TableModelInner {...props} />
    </ModelErrorBoundary>
  );
}

TableModel.preload = (url: string) => useGLTF.preload(url);
