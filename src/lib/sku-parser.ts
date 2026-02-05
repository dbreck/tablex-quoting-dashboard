import {
  seriesCodes,
  shapeCodes,
  baseCodes,
  optionSuffixes,
  specialHeightPattern,
  grommitPattern,
  postConfigPattern,
} from "@/data/sku-registry";

export interface SkuSegment {
  label: string;
  value: string;
  decoded: string;
  color: string;
}

export interface ParsedSku {
  valid: boolean;
  raw: string;
  segments: SkuSegment[];
  series: { code: string; name: string; description: string } | null;
  shape: { code: string; name: string } | null;
  size: { raw: string; width: string; depth: string } | null;
  base: { code: string; name: string; description: string; width?: string } | null;
  postConfig: number | null;
  options: { code: string; name: string; description: string }[];
  specialHeight: string | null;
  grommet: string | null;
}

const segmentColors = [
  "#8dc63f", // series - green
  "#3b82f6", // shape - blue
  "#f59e0b", // size - amber
  "#ef4444", // base - red
  "#8b5cf6", // post config - purple
  "#ec4899", // options - pink
];

export function parseSku(sku: string): ParsedSku {
  const raw = sku.trim().toUpperCase();
  const segments: SkuSegment[] = [];
  const options: { code: string; name: string; description: string }[] = [];

  // Split on hyphens for options/post config
  const parts = raw.split("-");
  const mainPart = parts[0];
  const suffixParts = parts.slice(1);

  // Parse series code (first 2 digits)
  const seriesMatch = mainPart.match(/^(\d{2})/);
  if (!seriesMatch) {
    return { valid: false, raw, segments: [], series: null, shape: null, size: null, base: null, postConfig: null, options: [], specialHeight: null, grommet: null };
  }

  const seriesCode = seriesMatch[1];
  const seriesInfo = seriesCodes[seriesCode];
  const series = seriesInfo
    ? { code: seriesCode, name: seriesInfo.name, description: seriesInfo.description }
    : { code: seriesCode, name: `Series ${seriesCode}`, description: "Unknown series" };
  segments.push({ label: "Series", value: seriesCode, decoded: series.name, color: segmentColors[0] });

  // Parse shape code (2 letters after series)
  let remaining = mainPart.slice(2);
  const shapeMatch = remaining.match(/^([A-Z]{2})/);
  let shape: ParsedSku["shape"] = null;
  if (shapeMatch) {
    const shapeCode = shapeMatch[1];
    const shapeInfo = shapeCodes[shapeCode];
    shape = shapeInfo
      ? { code: shapeCode, name: shapeInfo.name }
      : { code: shapeCode, name: shapeCode };
    segments.push({ label: "Shape", value: shapeCode, decoded: shape.name, color: segmentColors[1] });
    remaining = remaining.slice(2);
  }

  // Parse size (digits — e.g., 3030 = 30x30, 1860 = 18x60, 48 = 48" round)
  const sizeMatch = remaining.match(/^(\d+)/);
  let size: ParsedSku["size"] = null;
  if (sizeMatch) {
    const sizeRaw = sizeMatch[1];
    let width: string, depth: string;
    if (sizeRaw.length === 4) {
      width = sizeRaw.slice(0, 2) + '"';
      depth = sizeRaw.slice(2) + '"';
    } else if (sizeRaw.length === 2) {
      width = sizeRaw + '"';
      depth = sizeRaw + '"';
    } else if (sizeRaw.length === 3) {
      // Could be like 248 = 24x8 or asymmetric
      width = sizeRaw.slice(0, 2) + '"';
      depth = sizeRaw.slice(2) + '"';
    } else {
      width = sizeRaw;
      depth = "";
    }
    size = { raw: sizeRaw, width, depth };
    const sizeLabel = depth && depth !== width ? `${width} x ${depth}` : width;
    segments.push({ label: "Size", value: sizeRaw, decoded: sizeLabel, color: segmentColors[2] });
    remaining = remaining.slice(sizeRaw.length);
  }

  // Parse base code (letters + optional digits for base width)
  const baseMatch = remaining.match(/^([A-Z]+)(\d*)/);
  let base: ParsedSku["base"] = null;
  if (baseMatch) {
    const baseCode = baseMatch[1];
    const baseWidth = baseMatch[2] || undefined;
    const baseInfo = baseCodes[baseCode];
    base = baseInfo
      ? { code: baseCode, name: baseInfo.name, description: baseInfo.description, width: baseWidth ? baseWidth + '"' : undefined }
      : { code: baseCode, name: baseCode, description: "Base", width: baseWidth ? baseWidth + '"' : undefined };
    const baseDecoded = baseWidth ? `${base.name} (${baseWidth}")` : base.name;
    segments.push({ label: "Base", value: baseCode + (baseWidth || ""), decoded: baseDecoded, color: segmentColors[3] });
  }

  // Parse suffix parts (post config, options)
  let postConfig: number | null = null;
  let specialHeight: string | null = null;
  let grommet: string | null = null;

  for (const part of suffixParts) {
    // Post config (e.g., 3P, 4P)
    const postMatch = part.match(postConfigPattern);
    if (postMatch) {
      postConfig = parseInt(postMatch[1]);
      segments.push({ label: "Posts", value: part, decoded: `${postConfig}-post configuration`, color: segmentColors[4] });
      continue;
    }

    // Special height
    const heightMatch = part.match(specialHeightPattern);
    if (heightMatch) {
      specialHeight = heightMatch[1] + '"';
      segments.push({ label: "Height", value: part, decoded: `Special height: ${specialHeight}`, color: segmentColors[5] });
      continue;
    }

    // Grommet
    const grommetMatch = part.match(grommitPattern);
    if (grommetMatch) {
      grommet = grommetMatch[1];
      segments.push({ label: "Grommet", value: part, decoded: `Grommet position ${grommet}`, color: segmentColors[5] });
      continue;
    }

    // Known option suffix
    const optInfo = optionSuffixes[part];
    if (optInfo) {
      options.push({ code: part, name: optInfo.name, description: optInfo.description });
      segments.push({ label: "Option", value: part, decoded: optInfo.name, color: segmentColors[5] });
    } else {
      // Unknown suffix
      segments.push({ label: "Option", value: part, decoded: part, color: segmentColors[5] });
    }
  }

  return {
    valid: true,
    raw,
    segments,
    series,
    shape,
    size,
    base,
    postConfig,
    options,
    specialHeight,
    grommet,
  };
}

export const exampleSkus = [
  "99SQ3030QD16-3P",
  "01TC1860T18-3P-LC",
  "07RD48RB22",
  "03SC2448X16-4P-CH",
  "50TC2460FL-NE",
  "09SQ3636PD-SH.42",
];
