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
 * Derive the base width from the table width.
 *
 * Ultra naming convention: base width = table width - 2
 *   24" table -> U22, 30" -> U28, 36" -> U34, 42" -> U40, 48" -> U46
 *
 * For round tables (RD), the base is always U18 with a "-4" suffix.
 */
function deriveBaseWidth(size: string): string | null {
  if (size.length >= 4) {
    const tableWidth = parseInt(size.substring(0, 2), 10);
    if (!isNaN(tableWidth)) return String(tableWidth - 2);
  }
  return null;
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

  const shapeUpper = shape.toUpperCase();

  // Round tables: fixed pattern {shape}{diameter}u18-4.glb
  if (shapeUpper === 'RD') {
    return `rd${size}u18-4.glb`;
  }

  let name = `${shape}${size}${base}`;

  // Use explicit baseWidth if provided, otherwise derive from table width
  const bw = config.baseWidth ?? deriveBaseWidth(size);
  if (bw) name += bw;

  // Dual-base for very long tables (120"+): second base is always u18
  if (size.length >= 5) {
    const tableLength = parseInt(size.substring(2), 10);
    if (!isNaN(tableLength) && tableLength >= 120) {
      name += `${base}18`;
    }
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
