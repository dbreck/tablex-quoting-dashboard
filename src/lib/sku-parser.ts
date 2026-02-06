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
  isSpecial: boolean;
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

const EMPTY_RESULT: ParsedSku = {
  valid: false, raw: "", isSpecial: false, segments: [], series: null, shape: null,
  size: null, base: null, postConfig: null, options: [], specialHeight: null, grommet: null,
};

export function parseSku(sku: string): ParsedSku {
  const raw = sku.trim().toUpperCase();
  const segments: SkuSegment[] = [];
  const options: { code: string; name: string; description: string }[] = [];

  // Detect and strip SP- prefix (special order)
  let isSpecial = false;
  let working = raw;
  if (working.startsWith("SP-")) {
    isSpecial = true;
    working = working.slice(3);
    segments.push({ label: "Special", value: "SP", decoded: "Special Order", color: "#f97316" });
  }

  // Split on hyphens for options/post config
  const parts = working.split("-");
  const mainPart = parts[0];
  const suffixParts = parts.slice(1);

  // Parse series code (first 2 digits)
  const seriesMatch = mainPart.match(/^(\d{2})/);
  if (!seriesMatch) {
    return { ...EMPTY_RESULT, raw, isSpecial };
  }

  const seriesCode = seriesMatch[1];
  const seriesInfo = seriesCodes[seriesCode];
  const series = seriesInfo
    ? { code: seriesCode, name: seriesInfo.name, description: seriesInfo.description }
    : { code: seriesCode, name: `Series ${seriesCode}`, description: "Unknown series" };
  segments.push({ label: "Series", value: seriesCode, decoded: series.name, color: segmentColors[0] });

  // Parse shape code — try 2 letters first, then 1 letter (for "D" shape)
  let remaining = mainPart.slice(2);
  let shape: ParsedSku["shape"] = null;
  const shape2Match = remaining.match(/^([A-Z]{2})/);
  const shape1Match = remaining.match(/^([A-Z])/);

  if (shape2Match && shapeCodes[shape2Match[1]]) {
    const shapeCode = shape2Match[1];
    shape = { code: shapeCode, name: shapeCodes[shapeCode].name };
    segments.push({ label: "Shape", value: shapeCode, decoded: shape.name, color: segmentColors[1] });
    remaining = remaining.slice(2);
  } else if (shape1Match && shapeCodes[shape1Match[1]]) {
    const shapeCode = shape1Match[1];
    shape = { code: shapeCode, name: shapeCodes[shapeCode].name };
    segments.push({ label: "Shape", value: shapeCode, decoded: shape.name, color: segmentColors[1] });
    remaining = remaining.slice(1);
  } else if (shape2Match) {
    // Unknown 2-letter shape — still use it
    const shapeCode = shape2Match[1];
    shape = { code: shapeCode, name: shapeCode };
    segments.push({ label: "Shape", value: shapeCode, decoded: shapeCode, color: segmentColors[1] });
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
      width = sizeRaw.slice(0, 2) + '"';
      depth = sizeRaw.slice(2) + '"';
    } else if (sizeRaw.length >= 5) {
      // Long sizes like 48180 = 48x180, or 307248 (complex joining)
      // Try pairs: first 2 are width, rest varies
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
  // Strip parenthesized quantities like (3) from remaining before base match
  remaining = remaining.replace(/\(\d+\)/g, "");
  const baseMatch = remaining.match(/^([A-Z]+)(\d*)/);
  let base: ParsedSku["base"] = null;
  if (baseMatch && baseMatch[1]) {
    const baseCode = baseMatch[1];
    const baseWidth = baseMatch[2] || undefined;
    const baseInfo = baseCodes[baseCode];
    base = baseInfo
      ? { code: baseCode, name: baseInfo.name, description: baseInfo.description, width: baseWidth ? baseWidth + '"' : undefined }
      : { code: baseCode, name: baseCode, description: "Base", width: baseWidth ? baseWidth + '"' : undefined };
    const baseDecoded = baseWidth ? `${base.name} (${baseWidth}")` : base.name;
    segments.push({ label: "Base", value: baseCode + (baseWidth || ""), decoded: baseDecoded, color: segmentColors[3] });

    // Check for secondary base (e.g., U40U18 = two base types)
    const afterBase = remaining.slice(baseMatch[0].length).replace(/\(\d+\)/g, "");
    const secondBaseMatch = afterBase.match(/^([A-Z]+)(\d*)/);
    if (secondBaseMatch && secondBaseMatch[1] && baseCodes[secondBaseMatch[1]]) {
      const b2Code = secondBaseMatch[1];
      const b2Width = secondBaseMatch[2] || undefined;
      const b2Info = baseCodes[b2Code];
      const b2Decoded = b2Width ? `${b2Info.name} (${b2Width}")` : b2Info.name;
      segments.push({ label: "Base 2", value: b2Code + (b2Width || ""), decoded: b2Decoded, color: segmentColors[3] });
    }
  }

  // Parse suffix parts (post config, options)
  let postConfig: number | null = null;
  let specialHeight: string | null = null;
  let grommet: string | null = null;

  for (const part of suffixParts) {
    // Strip parenthesized content from suffix for matching (e.g., PRE(8215K-12))
    const cleanPart = part.replace(/\(.*\)$/, "");

    // Post config (e.g., 3P, 4P, 3K, 3W)
    const postMatch = cleanPart.match(postConfigPattern);
    if (postMatch) {
      postConfig = parseInt(postMatch[1]);
      segments.push({ label: "Posts", value: part, decoded: `${postConfig}-post configuration`, color: segmentColors[4] });
      continue;
    }

    // Special height
    const heightMatch = cleanPart.match(specialHeightPattern);
    if (heightMatch) {
      specialHeight = heightMatch[1] + '"';
      segments.push({ label: "Height", value: part, decoded: `Special height: ${specialHeight}`, color: segmentColors[5] });
      continue;
    }

    // Grommet
    const grommetMatch = cleanPart.match(grommitPattern);
    if (grommetMatch) {
      grommet = grommetMatch[1];
      segments.push({ label: "Grommet", value: part, decoded: `Grommet position ${grommet}`, color: segmentColors[5] });
      continue;
    }

    // ASB with size (e.g., ASB.4)
    if (cleanPart.startsWith("ASB")) {
      const optInfo = optionSuffixes["ASB"];
      if (optInfo) {
        options.push({ code: "ASB", name: optInfo.name, description: optInfo.description });
        segments.push({ label: "Option", value: part, decoded: optInfo.name, color: segmentColors[5] });
      }
      continue;
    }

    // Known option suffix
    const optInfo = optionSuffixes[cleanPart];
    if (optInfo) {
      options.push({ code: cleanPart, name: optInfo.name, description: optInfo.description });
      segments.push({ label: "Option", value: part, decoded: optInfo.name, color: segmentColors[5] });
    } else if (cleanPart.length > 0) {
      // Unknown suffix — still show it
      segments.push({ label: "Option", value: part, decoded: part, color: segmentColors[5] });
    }
  }

  return {
    valid: true,
    raw,
    isSpecial,
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
  "SP-01TC0000-3P",
  "00TC2060U18-3P-MATCH",
  "00BT3648180U34-3P-TJ",
];
