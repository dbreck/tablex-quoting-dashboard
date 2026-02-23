"use client";

import { useEffect, useMemo, Component, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { FinishOption } from "@/data/finish-catalog";
import { useFinishMaterial } from "./useFinishMaterial";

interface TableModelProps {
  url: string;
  supplierBaseUrl?: string | null;
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

/**
 * Generate box-projected UV coordinates from vertex positions and normals.
 * For each vertex, projects UV from the dominant normal axis direction.
 * Works well for architectural/furniture geometry (flat surfaces, boxes, cylinders).
 */
function generateBoxProjectedUVs(geometry: THREE.BufferGeometry): void {
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }

  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;

  if (!position || !normal) return;

  const count = position.count;
  const uvs = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const px = position.getX(i);
    const py = position.getY(i);
    const pz = position.getZ(i);
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));

    // Pick UV projection based on dominant normal axis
    if (nx >= ny && nx >= nz) {
      // X-dominant: project onto YZ plane
      uvs[i * 2] = pz;
      uvs[i * 2 + 1] = py;
    } else if (ny >= nx && ny >= nz) {
      // Y-dominant: project onto XZ plane (table tops)
      uvs[i * 2] = px;
      uvs[i * 2 + 1] = pz;
    } else {
      // Z-dominant: project onto XY plane
      uvs[i * 2] = px;
      uvs[i * 2 + 1] = py;
    }
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

const DEFAULT_MATERIAL = new THREE.MeshPhysicalMaterial({ color: 0x888888, roughness: 0.5, envMapIntensity: 1.0 });

/**
 * Prepare a loaded GLB scene: strip vertex colors, generate UVs, fix Z-up orientation, floor-align.
 */
function prepareScene(scene: THREE.Group): THREE.Group {
  const c = scene.clone(true);
  c.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.deleteAttribute("color");
      if (!child.geometry.attributes.uv) {
        generateBoxProjectedUVs(child.geometry);
      }
      if (!child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }
      child.material = DEFAULT_MATERIAL;
    }
  });
  c.rotation.x = -Math.PI / 2;
  c.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(c);
  c.position.y = -box.min.y;
  return c;
}

/** Renders the supplier base GLB alongside the native model (which provides tabletop). */
function SupplierBaseModel({ url, baseMaterial }: { url: string; baseMaterial: THREE.Material }) {
  const { scene } = useGLTF(url);
  const invalidate = useThree((s) => s.invalidate);

  const clone = useMemo(() => prepareScene(scene), [scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = baseMaterial;
      }
    });
    invalidate();
  }, [clone, baseMaterial, invalidate]);

  return <primitive object={clone} />;
}

function TableModelInner({ url, supplierBaseUrl, baseFinish, topFinish, edgeFinish }: TableModelProps) {
  const { scene } = useGLTF(url);
  const invalidate = useThree((s) => s.invalidate);

  // Hook-managed materials (handles textures, category recipes, and disposal)
  const baseMaterial = useFinishMaterial(baseFinish);
  const topMaterial = useFinishMaterial(topFinish);
  const edgeMaterial = useFinishMaterial(edgeFinish);

  const hasSupplierBase = !!supplierBaseUrl;

  // Clone scene, strip baked vertex colors, generate UVs, and fix orientation.
  const clone = useMemo(() => prepareScene(scene), [scene]);

  // Apply hook-managed materials to classified mesh parts
  // When using a supplier base, hide the native base meshes
  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const part = classifyMesh(child.name);
      if (!part) return;

      if (part === "top") {
        child.material = topMaterial;
        child.visible = true;
      } else if (part === "base" || part === "other") {
        child.material = baseMaterial;
        child.visible = !hasSupplierBase;
      } else if (part === "edge") {
        child.material = edgeMaterial;
        child.visible = true;
      }
    });
    invalidate();
  }, [clone, baseMaterial, topMaterial, edgeMaterial, hasSupplierBase, invalidate]);

  return (
    <>
      <primitive object={clone} />
      {supplierBaseUrl && (
        <SupplierBaseModel url={supplierBaseUrl} baseMaterial={baseMaterial} />
      )}
    </>
  );
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
    <ModelErrorBoundary key={`${props.url}|${props.supplierBaseUrl ?? ''}`}>
      <TableModelInner {...props} />
    </ModelErrorBoundary>
  );
}

TableModel.preload = (url: string) => useGLTF.preload(url);
