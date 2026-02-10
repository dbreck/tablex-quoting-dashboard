import { parseSku } from '@/lib/sku-parser';
import { lookupGlbFilename, MODEL_AVAILABILITY } from '@/data/model-availability';

export const MODEL_BUCKET = 'models';
export const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MODEL_BUCKET}`;

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

  return `${SUPABASE_STORAGE_URL}/${filename}`;
}

/**
 * For the configurator page where we have config directly (not a SKU string).
 */
export function getModelUrlFromConfig(config: ConfigInput): string | null {
  const { series, shape, size, base } = config;
  if (!series || !shape || !size || !base) return null;

  const filename = lookupGlbFilename(series, shape, size, base);
  if (!filename) return null;

  return `${SUPABASE_STORAGE_URL}/${filename}`;
}

/**
 * Check if a series has 3D models available.
 */
export function hasModelAvailable(seriesCode: string): boolean {
  return seriesCode in MODEL_AVAILABILITY;
}
