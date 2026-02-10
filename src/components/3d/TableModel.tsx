"use client";

import { useEffect, useMemo } from "react";
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

export function TableModel({ url, baseFinish, topFinish, edgeFinish }: TableModelProps) {
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

TableModel.preload = (url: string) => useGLTF.preload(url);
