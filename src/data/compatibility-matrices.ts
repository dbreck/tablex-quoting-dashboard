// Compatibility matrices extracted from 6,098 products in product_catalog
// Source: product-catalog.json — extracted Feb 6, 2026
// Used by: CPQ rules engine for validation of shape/base/size combinations

// ── Types ───────────────────────────────────────────────────────────

export interface ShapeBaseEntry {
  baseCode: string;
  baseName: string;
  count: number;
}

export interface ShapeCompatibility {
  shapeCode: string;
  shapeName: string;
  totalProducts: number;
  bases: ShapeBaseEntry[];
}

export interface SeriesShapeEntry {
  shapeCode: string;
  shapeName: string;
}

export interface SeriesCompatibility {
  seriesCode: string;
  seriesName: string;
  totalProducts: number;
  shapes: SeriesShapeEntry[];
}

// ── Lookup helpers ──────────────────────────────────────────────────

const shapeNames: Record<string, string> = {
  TC: "Rectangular",
  SQ: "Square",
  RT: "Racetrack Oval",
  BT: "Boat Shape",
  EL: "Elliptical",
  TZ: "Trapezoid",
  RC: "Racetrack",
  HR: "Half Round",
  CR: "Curved",
  TR: "Trapezoid",
  AC: "Arc",
  CS: "Corner Section",
  SC: "Semicircle",
  VW: "V-Shape Wide",
  WG: "Wedge",
  CC: "Concave",
  CU: "Curved",
  KB: "Keyboard",
  TA: "Tapered",
  AS: "Asymmetric",
  SL: "Slim",
  JP: "Joining Panel",
  WD: "Wide D",
  HO: "Horseshoe",
  QD: "Quad D",
  QR: "Quarter Round",
  CV: "Convex",
  AE: "Arc Extension",
  BW: "Bow",
  RD: "Round",
  BU: "Bullet",
  CT: "Crescent",
  HD: "Half Disc",
  HM: "Hammerhead",
  LB: "Lobed",
  OC: "Octagonal",
  SK: "Skirt",
  SP: "Serpentine",
};

const baseNames: Record<string, string> = {
  T: "T-Base",
  X: "X-Base",
  D: "Disc Base",
  FR: "Frame",
  TT: "T-Base (Twin)",
  U: "U-Leg",
  C: "C-Frame",
  QD: "Quad Disc",
  Q: "Quad Base",
  V: "V-Leg",
  Y: "Y-Base",
  L: "L-Leg",
  QC: "Quad C-Frame",
  H: "H-Leg",
  DR: "Drum Base",
  TOS: "Top Only Stand",
  HWD: "H-Width Disc",
  A: "A-Frame",
  SX: "Star X-Base",
  SD: "Square Disc",
  VTR: "V-Trestle",
  EXT: "Extension",
  SQ: "Square Base",
  OU: "Open U-Leg",
  HT: "Half T-Base",
  HW: "H-Width",
  DP: "Double Pedestal",
  CS: "Corner Stand",
  WT: "Wall T-Base",
  AF: "A-Frame Folding",
  DQD: "Double Quad Disc",
  DQ: "Double Quad",
  SL: "Slim Leg",
  FM: "Flat Mount",
  F: "Flat Base",
};

const seriesNames: Record<string, string> = {
  "00": "Essentials",
  "01": "Studio",
  "02": "Nexus",
  "03": "Matrix",
  "05": "Alliance",
  "06": "Beacon",
  "08": "Pinnacle",
  "09": "Horizon",
  "14": "Series 14",
  "17": "Series 17",
  "24": "Series 24",
  "30": "Foundation",
  "33": "Forte",
  "40": "Crest",
  "42": "Series 42",
  "43": "Series 43",
  "44": "Edge",
  "45": "Ridge",
  "60": "Contour",
  "70": "Vector",
  "71": "Series 71",
  "74": "Series 74",
  "80": "Zenith",
  "88": "Series 88",
  "99": "Surge",
};

// ── Shape → Base Compatibility ──────────────────────────────────────
// "Given a top shape, which bases can support it?"

const shapeBaseRaw: Record<string, Record<string, number>> = {
  TC: { T: 1450, FR: 290, U: 264, QD: 188, C: 186, TT: 179, D: 135, X: 111, Q: 102, V: 54, Y: 41, QC: 32, H: 32, L: 19, DR: 7, A: 6, HWD: 5, SX: 5, SD: 4, VTR: 3, SQ: 3, OU: 2, HT: 2, TOS: 1, DP: 1, CS: 1, WT: 1, AF: 1, DQD: 1, SL: 1, FM: 1, F: 1 },
  SQ: { X: 344, D: 131, QD: 48, C: 25, Q: 20, FR: 14, TT: 10, T: 9, HWD: 8, U: 4, DR: 2, QC: 2, SX: 2, HW: 2, DQ: 1 },
  RT: { TT: 29, D: 20, T: 14, U: 12, Q: 12, Y: 6, V: 5, L: 4, DR: 4, QD: 1, X: 1, C: 1 },
  BT: { TT: 63, T: 9, Q: 9, L: 5, D: 5, Y: 3, U: 3, C: 2, V: 2, VTR: 1 },
  EL: { T: 27, TT: 13, D: 9, Q: 7, FR: 3, QD: 2, DR: 1, C: 1, SD: 1, Y: 1 },
  TZ: { T: 41, C: 3, A: 3, D: 2, TT: 2, L: 1, Q: 1, U: 1 },
  RC: { C: 36, QD: 15 },
  HR: { T: 31, X: 3, C: 3, DR: 2, D: 1, H: 1, TT: 1 },
  CR: { T: 23, D: 2, TOS: 2, C: 1, HWD: 1 },
  TR: { TOS: 13, C: 5, T: 1 },
  AC: { L: 18, Y: 1 },
  CS: { T: 18, C: 1 },
  VW: { T: 14 },
  WG: { TT: 4, D: 3, QC: 2, U: 2, L: 1, Q: 1, C: 1 },
  SC: { T: 6, C: 4 },
  CC: { T: 6 },
  CU: { U: 2, QC: 2, T: 2 },
  KB: { T: 3, X: 3 },
  TA: { T: 5 },
  AS: { T: 3, X: 1, TT: 1 },
  SL: { D: 3, SD: 1, QC: 1 },
  WD: { T: 2, TT: 1 },
  QD: { X: 4 },
  QR: { X: 3 },
  JP: { EXT: 3 },
  HO: { X: 3 },
  BW: { T: 2 },
  CV: { T: 2 },
  AE: { T: 2 },
  RD: { C: 1, X: 1 },
  SK: { C: 2 },
  CT: { D: 1 },
  HD: { DR: 1 },
  HM: { C: 1 },
  LB: { D: 1 },
  OC: { QD: 1 },
  SP: { C: 1 },
  BU: { X: 1 },
};

export const shapeBaseCompatibility: ShapeCompatibility[] = Object.entries(shapeBaseRaw)
  .map(([shapeCode, bases]) => ({
    shapeCode,
    shapeName: shapeNames[shapeCode] || shapeCode,
    totalProducts: Object.values(bases).reduce((a, b) => a + b, 0),
    bases: Object.entries(bases)
      .map(([baseCode, count]) => ({
        baseCode,
        baseName: baseNames[baseCode] || baseCode,
        count,
      }))
      .sort((a, b) => b.count - a.count),
  }))
  .sort((a, b) => b.totalProducts - a.totalProducts);

// ── Series → Shape Compatibility ────────────────────────────────────
// "Given a product series, which top shapes are available?"

const seriesShapeRaw: Record<string, string[]> = {
  "44": ["BT", "CR", "CS", "CT", "CU", "EL", "HD", "HM", "HR", "RD", "RT", "SC", "SK", "SL", "SP", "SQ", "TC", "TR", "TZ", "WD", "WG"],
  "01": ["BT", "BU", "CR", "CS", "CV", "EL", "HO", "HR", "QD", "QR", "RT", "SC", "SQ", "TC", "TR", "TZ", "VW", "WD", "WG"],
  "08": ["AC", "AE", "AS", "BT", "CR", "CS", "EL", "HR", "QR", "RT", "SQ", "TC", "TR", "TZ", "VW", "WG"],
  "74": ["AS", "BT", "BW", "CC", "EL", "HR", "KB", "RT", "SQ", "TA", "TC", "TZ", "VW"],
  "99": ["CC", "CR", "EL", "KB", "LB", "OC", "RT", "SL", "SQ", "TA", "TC", "TZ", "WG"],
  "33": ["AS", "BT", "CS", "CU", "EL", "HR", "RT", "SQ", "TC", "TZ", "VW", "WG"],
  "06": ["BT", "CS", "EL", "KB", "RT", "SC", "SQ", "TC", "TZ", "VW", "WG"],
  "02": ["BT", "CR", "EL", "HR", "QD", "RD", "RT", "SQ", "TC", "TZ", "VW"],
  "00": ["BT", "CU", "JP", "RT", "SQ", "TC", "TZ", "WG"],
  "71": ["BT", "EL", "RT", "SQ", "TC", "TZ", "WG"],
  "45": ["EL", "RT", "SQ", "TC"],
  "40": ["SQ", "TC"],
  "88": ["SQ", "TC"],
  "14": ["SQ", "TC"],
  "17": ["RC", "TC"],
  "43": ["EL", "TC"],
  "30": ["BW"],
  "42": ["TC"],
  "70": ["TC"],
  "80": ["TC"],
  "05": ["TC"],
  "09": ["TC"],
  "03": ["TC"],
};

export const seriesShapeCompatibility: SeriesCompatibility[] = Object.entries(seriesShapeRaw)
  .map(([seriesCode, shapes]) => ({
    seriesCode,
    seriesName: seriesNames[seriesCode] || `Series ${seriesCode}`,
    totalProducts:
      seriesCode === "01" ? 981 : seriesCode === "08" ? 818 : seriesCode === "99" ? 705 :
      seriesCode === "44" ? 676 : seriesCode === "33" ? 489 : seriesCode === "74" ? 459 :
      seriesCode === "02" ? 403 : seriesCode === "00" ? 312 : seriesCode === "40" ? 237 :
      seriesCode === "06" ? 223 : seriesCode === "71" ? 189 : seriesCode === "45" ? 102 :
      seriesCode === "17" ? 95 : seriesCode === "43" ? 83 : seriesCode === "88" ? 35 :
      seriesCode === "30" ? 29 : seriesCode === "03" ? 19 : seriesCode === "14" ? 8 :
      seriesCode === "42" ? 2 : seriesCode === "05" ? 2 : 1,
    shapes: shapes.map((shapeCode) => ({
      shapeCode,
      shapeName: shapeNames[shapeCode] || shapeCode,
    })),
  }))
  .sort((a, b) => b.totalProducts - a.totalProducts);

// ── Quick-lookup sets for validation ────────────────────────────────
// These are the functions the rules engine will actually call.

/** Returns true if the given shape can sit on the given base code */
export function isShapeBaseCompatible(shapeCode: string, baseCode: string): boolean {
  return !!shapeBaseRaw[shapeCode]?.[baseCode];
}

/** Returns all valid base codes for a given shape */
export function getBasesForShape(shapeCode: string): string[] {
  const bases = shapeBaseRaw[shapeCode];
  return bases ? Object.keys(bases) : [];
}

/** Returns all valid shapes for a given series */
export function getShapesForSeries(seriesCode: string): string[] {
  return seriesShapeRaw[seriesCode] || [];
}

/** Returns true if a series offers a given shape */
export function isSeriesShapeCompatible(seriesCode: string, shapeCode: string): boolean {
  return (seriesShapeRaw[seriesCode] || []).includes(shapeCode);
}

// ── Summary stats ───────────────────────────────────────────────────

export const compatibilitySummary = {
  totalProducts: 6098,
  uniqueShapes: 38,
  uniqueBases: 35,
  uniqueSeries: 25,
  primaryShapes: ["TC", "SQ", "RT", "BT", "EL", "TZ", "RC", "HR"] as const,
  primaryBases: ["T", "X", "D", "FR", "TT", "U", "C", "QD"] as const,
  primarySeries: ["01", "08", "99", "44", "33", "74", "02", "00"] as const,
  // The most versatile shape (works with the most bases)
  mostVersatileShape: { code: "TC", name: "Rectangular", baseCount: 32 },
  // The most versatile series (offers the most shapes)
  mostVersatileSeries: { code: "44", name: "Edge", shapeCount: 21 },
  // The most common base
  mostCommonBase: { code: "T", name: "T-Base", productCount: 1670 },
};
