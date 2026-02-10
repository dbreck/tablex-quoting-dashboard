import { parseSku } from '@/lib/sku-parser';

export const MODEL_BUCKET = 'models';
export const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MODEL_BUCKET}`;

// Series that have CAD files (and will have GLB models)
const SERIES_WITH_CAD: Record<string, string> = {
  '00': 'Ultra',
  '30': 'Foundation',
  '33': 'Fundamental',
};

export interface ConfigInput {
  series?: string;
  shape?: string;
  size?: string;
  base?: string;
  options?: string[];
}

/**
 * Build a GLB filename from parsed config parts.
 *
 * Matches the conversion pipeline naming convention:
 *   DWG filename "Ultra-00TC2448U22.dwg" -> strip prefix + series code -> "tc2448u22.glb"
 *
 * The filename is: {shape}{size}{base}{baseWidth}.glb, all lowercase.
 * For dual-base configs (e.g., U34U18), both bases are included.
 */
export function getGlbFilename(config: {
  shape?: string;
  size?: string;
  base?: string;
  baseWidth?: string;
  options?: string[];
}): string | null {
  const { shape, size, base } = config;
  if (!shape || !size || !base) return null;

  // Concatenate shape + size + base (+ baseWidth if present), lowercase
  let name = `${shape}${size}`;
  if (base) {
    name += base;
    if (config.baseWidth) name += config.baseWidth;
  }

  return `${name.toLowerCase()}.glb`;
}

/**
 * Full pipeline: parse SKU -> check series has CAD -> build GLB filename -> return Supabase URL.
 */
export function getModelUrl(sku: string): string | null {
  const parsed = parseSku(sku);
  if (!parsed.valid || !parsed.series || !parsed.shape || !parsed.size) return null;

  const seriesCode = parsed.series.code;
  if (!SERIES_WITH_CAD[seriesCode]) return null;

  // Extract base width from the parsed base (e.g., base code "U" + width "22")
  const baseWidth = parsed.base?.width?.replace('"', '') ?? undefined;

  const filename = getGlbFilename({
    shape: parsed.shape.code,
    size: parsed.size.raw,
    base: parsed.base?.code,
    baseWidth,
  });
  if (!filename) return null;

  return `${SUPABASE_STORAGE_URL}/${filename}`;
}

/**
 * For the configurator page where we have config directly (not a SKU string).
 */
export function getModelUrlFromConfig(config: ConfigInput): string | null {
  const { series, shape, size, base } = config;
  if (!series || !shape || !size) return null;
  if (!SERIES_WITH_CAD[series]) return null;

  const filename = getGlbFilename({ shape, size, base });
  if (!filename) return null;

  return `${SUPABASE_STORAGE_URL}/${filename}`;
}

/**
 * Check if a series has 3D models available.
 */
export function hasModelAvailable(seriesCode: string): boolean {
  return seriesCode in SERIES_WITH_CAD;
}
