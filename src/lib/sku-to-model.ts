import { parseSku } from '@/lib/sku-parser';

export const MODEL_BUCKET = 'models';
export const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MODEL_BUCKET}`;

// Series that have CAD files (and will have GLB models)
const SERIES_WITH_CAD: Record<string, string> = {
  '30': 'Foundation',
  '33': 'Fundamental',
  '80': 'Ultra',
};

export interface ConfigInput {
  series?: string;
  shape?: string;
  size?: string;
  base?: string;
  options?: string[];
}

/**
 * Build a geometry key from parsed config parts.
 * The key uniquely identifies a 3D shape (series + shape + size + base).
 * Example: "30-TC-2060-U" or "80-RD-48-RB"
 */
export function getGeometryKey(config: {
  shape?: string;
  size?: string;
  base?: string;
  options?: string[];
}): string | null {
  const { shape, size, base } = config;
  if (!shape || !size) return null;

  const parts = [shape, size];
  if (base) parts.push(base);

  return parts.join('-');
}

/**
 * Full pipeline: parse SKU -> check series has CAD -> build geometry key -> return Supabase URL.
 */
export function getModelUrl(sku: string): string | null {
  const parsed = parseSku(sku);
  if (!parsed.valid || !parsed.series || !parsed.shape || !parsed.size) return null;

  const seriesCode = parsed.series.code;
  if (!SERIES_WITH_CAD[seriesCode]) return null;

  const geoKey = getGeometryKey({
    shape: parsed.shape.code,
    size: parsed.size.raw,
    base: parsed.base?.code,
  });
  if (!geoKey) return null;

  const seriesName = SERIES_WITH_CAD[seriesCode].toLowerCase();
  return `${SUPABASE_STORAGE_URL}/${seriesName}/${seriesCode}-${geoKey}.glb`;
}

/**
 * For the configurator page where we have config directly (not a SKU string).
 */
export function getModelUrlFromConfig(config: ConfigInput): string | null {
  const { series, shape, size, base } = config;
  if (!series || !shape || !size) return null;
  if (!SERIES_WITH_CAD[series]) return null;

  const geoKey = getGeometryKey({ shape, size, base });
  if (!geoKey) return null;

  const seriesName = SERIES_WITH_CAD[series].toLowerCase();
  return `${SUPABASE_STORAGE_URL}/${seriesName}/${series}-${geoKey}.glb`;
}

/**
 * Check if a series has 3D models available.
 */
export function hasModelAvailable(seriesCode: string): boolean {
  return seriesCode in SERIES_WITH_CAD;
}
