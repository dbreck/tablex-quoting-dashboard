"use client";

import { useMemo, useEffect, useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { FinishOption } from "@/data/finish-catalog";

// Shared default for undefined finish
const DEFAULT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: 0x888888,
  roughness: 0.5,
  envMapIntensity: 1.0,
});

// Sentinel finish used when the real finish has no textures (keeps useTexture call stable)
const NOOP_FINISH: FinishOption = {
  id: "__noop__",
  name: "",
  category: "hpl",
  hex: "#888888",
  roughness: 0.5,
  metalness: 0,
};

/** Configure a loaded texture for tiling. */
function configureTexture(texture: THREE.Texture, isSRGB: boolean): void {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 16;
  if (isSRGB) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
}

/** Build a category-aware MeshPhysicalMaterial from a finish and optional textures. */
function buildMaterial(
  finish: FinishOption,
  textures?: {
    map?: THREE.Texture;
    normalMap?: THREE.Texture;
    roughnessMap?: THREE.Texture;
  },
): THREE.MeshPhysicalMaterial {
  const props: THREE.MeshPhysicalMaterialParameters = {
    color: new THREE.Color(finish.hex),
    roughness: finish.roughness,
    metalness: finish.metalness,
    envMapIntensity: 1.0,
  };

  if (textures?.map) props.map = textures.map;
  if (textures?.normalMap) props.normalMap = textures.normalMap;
  if (textures?.roughnessMap) props.roughnessMap = textures.roughnessMap;

  switch (finish.category) {
    case "chrome":
      props.metalness = 1.0;
      props.roughness = 0.05;
      props.envMapIntensity = 1.5;
      break;
    case "powder-coat":
      props.clearcoat = 0.3;
      props.clearcoatRoughness = 0.6;
      break;
    case "solid-surface":
      props.clearcoat = 0.4;
      props.clearcoatRoughness = 0.3;
      break;
    case "butcher-block":
      props.sheen = 0.3;
      props.sheenRoughness = 0.8;
      props.sheenColor = new THREE.Color(finish.hex);
      break;
  }

  return new THREE.MeshPhysicalMaterial(props);
}

/** Check whether a finish has any texture URLs to load. */
function hasTextureUrls(finish: FinishOption): boolean {
  return !!(
    finish.textureUrl ||
    finish.normalMapUrl ||
    finish.roughnessMapUrl
  );
}

/** Build the url map for useTexture from a finish's texture URLs. */
function getTextureUrls(finish: FinishOption): Record<string, string> {
  const urls: Record<string, string> = {};
  if (finish.textureUrl) urls.map = finish.textureUrl;
  if (finish.normalMapUrl) urls.normalMap = finish.normalMapUrl;
  if (finish.roughnessMapUrl) urls.roughnessMap = finish.roughnessMapUrl;
  return urls;
}

/**
 * Hook for finishes that have texture URLs.
 * drei's useTexture will suspend until textures load.
 */
function useTexturedMaterial(finish: FinishOption): THREE.MeshPhysicalMaterial {
  const urls = getTextureUrls(finish);
  const loaded = useTexture(urls) as Record<string, THREE.Texture>;
  const prevRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const material = useMemo(() => {
    const textures: {
      map?: THREE.Texture;
      normalMap?: THREE.Texture;
      roughnessMap?: THREE.Texture;
    } = {};

    if (loaded.map) {
      configureTexture(loaded.map, true);
      textures.map = loaded.map;
    }
    if (loaded.normalMap) {
      configureTexture(loaded.normalMap, false);
      textures.normalMap = loaded.normalMap;
    }
    if (loaded.roughnessMap) {
      configureTexture(loaded.roughnessMap, false);
      textures.roughnessMap = loaded.roughnessMap;
    }

    return buildMaterial(finish, textures);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish.id]);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = material;
    return () => {
      if (prev && prev !== material) prev.dispose();
    };
  }, [material]);

  useEffect(() => () => { prevRef.current?.dispose(); }, []);

  return material;
}

/** Hook for finishes without texture URLs (no suspension). */
function useColorOnlyMaterial(finish: FinishOption): THREE.MeshPhysicalMaterial {
  const prevRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const material = useMemo(() => {
    return buildMaterial(finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish.id]);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = material;
    return () => {
      if (prev && prev !== material) prev.dispose();
    };
  }, [material]);

  useEffect(() => () => { prevRef.current?.dispose(); }, []);

  return material;
}

/**
 * React hook that takes a FinishOption and returns a configured
 * THREE.MeshPhysicalMaterial with optional PBR texture support.
 *
 * - If finish is undefined, returns a default gray material.
 * - If finish has texture URLs (textureUrl, normalMapUrl, roughnessMapUrl),
 *   textures are loaded via drei's useTexture (suspends — needs a parent Suspense).
 * - Materials are memoized on finish.id and disposed on change/unmount.
 * - Category-specific properties (clearcoat, sheen, etc.) match the original
 *   makeMaterial() recipes from TableModel.tsx.
 */
export function useFinishMaterial(
  finish: FinishOption | undefined,
): THREE.MeshPhysicalMaterial {
  const hasTextures = finish ? hasTextureUrls(finish) : false;

  // Both hooks must always be called (Rules of Hooks). We pass a sentinel
  // finish to whichever path is inactive so it produces a cheap throwaway material.
  const texturedMat = useTexturedMaterial(hasTextures ? finish! : NOOP_FINISH);
  const colorMat = useColorOnlyMaterial(!hasTextures && finish ? finish : NOOP_FINISH);

  if (!finish) return DEFAULT_MATERIAL;
  return hasTextures ? texturedMat : colorMat;
}
