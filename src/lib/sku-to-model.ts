import { parseSku } from '@/lib/sku-parser';
import { lookupGlbFilename, MODEL_AVAILABILITY } from '@/data/model-availability';

export const MODEL_BUCKET = 'models';
export const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MODEL_BUCKET}`;

/**
 * Supplier reference models — generic base geometry used as fallback
 * when no series-specific TableX model exists for a base type.
 * Served from public/ directory (local paths).
 */
const SUPPLIER_BASE_MODELS: Record<string, string> = {
  A: "/test-bases/a-base_2415.glb",
  H: "/test-bases/h-base_2024.glb",
  HT: "/test-bases/h-base_2024.glb",
  VTR: "/test-bases/v-base_2415.glb",
  WT: "/test-bases/c-base_3024.glb",
  OU: "/test-bases/u-base_3015.glb",
  CS: "/test-bases/c-base_3024.glb",
  DP: "/test-bases/disc-round_4023.glb",
  QC: "/test-bases/x-base-quad_4060.glb",
  SQ: "/test-bases/disc-square_4023.glb",
  TT: "/test-bases/tt-base_5048.glb",
};

export interface ConfigInput {
  series?: string;
  shape?: string;
  size?: string;
  base?: string;
  options?: string[];
}

/**
 * Look up the GLB filename from the static availability map.
 * Returns null if no model exists for the given config.
 */
export function getGlbFilename(config: {
  series?: string;
  shape?: string;
  size?: string;
  base?: string;
}): string | null {
  const { series, shape, size, base } = config;
  if (!series || !shape || !size || !base) return null;
  return lookupGlbFilename(series, shape, size, base);
}

/**
 * Build storage path: {seriesCode}/{filename}
 */
function storagePath(seriesCode: string, filename: string): string {
  return `${seriesCode}/${filename}`;
}

/**
 * Full pipeline: parse SKU -> check series has model -> look up GLB filename -> return Supabase URL.
 */
export function getModelUrl(sku: string): string | null {
  const parsed = parseSku(sku);
  if (!parsed.valid || !parsed.series || !parsed.shape || !parsed.size || !parsed.base) return null;

  const seriesCode = parsed.series.code;
  const filename = lookupGlbFilename(
    seriesCode,
    parsed.shape.code,
    parsed.size.raw,
    parsed.base.code,
  );
  if (!filename) return null;

  return `${SUPABASE_STORAGE_URL}/${storagePath(seriesCode, filename)}`;
}

/**
 * For the configurator page where we have config directly (not a SKU string).
 */
export function getModelUrlFromConfig(config: ConfigInput): string | null {
  const { series, shape, size, base } = config;
  if (!series || !shape || !size || !base) return null;

  const filename = lookupGlbFilename(series, shape, size, base);
  if (!filename) return null;

  return `${SUPABASE_STORAGE_URL}/${storagePath(series, filename)}`;
}

/**
 * Get a native model URL for a series/shape/size using ANY available base.
 * Used to provide tabletop geometry when the selected base is a supplier fallback.
 */
export function getAnyNativeModelUrl(series: string, shape: string, size: string): string | null {
  const seriesData = MODEL_AVAILABILITY[series];
  if (!seriesData) return null;
  const shapeData = seriesData.shapes[shape];
  if (!shapeData) return null;

  // Try each native base until we find a model
  for (const b of shapeData.bases) {
    const filename = lookupGlbFilename(series, shape, size, b);
    if (filename) return `${SUPABASE_STORAGE_URL}/${storagePath(series, filename)}`;
  }
  return null;
}

/**
 * Get supplier base model path (local public/ file) if available for this base code.
 */
export function getSupplierBaseUrl(baseCode: string): string | null {
  return SUPPLIER_BASE_MODELS[baseCode.toUpperCase()] ?? null;
}

/**
 * Check if a series has 3D models available.
 */
export function hasModelAvailable(seriesCode: string): boolean {
  return seriesCode in MODEL_AVAILABILITY;
}
