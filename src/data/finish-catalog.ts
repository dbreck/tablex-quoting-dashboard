export type LaminateBrand = "Wilsonart" | "Formica";
export type LaminatePriceTier = "Core" | "Select" | "Luxe" | "Custom";
export type LaminateSubCategory = "woodgrain" | "solid" | "pattern";
/**
 * Which vendor price column the laminate price is computed from.
 * Per Brian (2026-06-05): the SUMMARY tab is authoritative — pricing always uses the
 * "Wilsonart 2 or More" volume column ("Formica Column" for Formica, "Standard Column"
 * where printed). Category rule: Core = list, Select = +15%, Luxe = +35% (rounded UP
 * within category on purpose). "Wilsonart Column" was the detail tabs' manufacturer-facing
 * working basis — kept in the union for bandingBasis strings only.
 */
export type LaminatePriceBasis =
  | "Wilsonart 2 or More"
  | "Standard Column"
  | "Wilsonart Column"
  | "Formica Column"
  | "Custom quote only";

export interface FinishOption {
  id: string;
  name: string;
  category: 'powder-coat' | 'chrome' | 'hpl' | 'tfl' | 'solid-surface' | 'butcher-block';
  hex: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
  normalMapUrl?: string;
  roughnessMapUrl?: string;

  // TableX laminate metadata (populated for 2026 Wilsonart / Formica catalog,
  // rev 2026-06-05 of "2026 TableX Laminate Colors FINAL.xlsx".
  // PRICING: summary tab authoritative (Brian 6/5). STOCK/BANDING: detail tabs.)
  brand?: LaminateBrand;
  itemNumber?: string;
  subCategory?: LaminateSubCategory;
  priceTier?: LaminatePriceTier;
  upchargePct?: number;             // laminate upcharge % over priceBasis: 0 (Core), 15 (Select), 35 (Luxe) — except Luxe PATTERNS print +20 on the summary tab (pending call confirmation vs the verbal Luxe=+35 rule)
  hasMatchingEdgeband?: boolean;    // TableX OFFERS a matching edgeband. Woodgrains/solids: mirrors edgebandStocked. Patterns: ALWAYS false (Brian 6/5 — matching pattern bands not offered, customers pick a solid edgeband) even where the manufacturer stocks one (see edgebandStocked).
  isStock?: boolean;                // laminate currently stocked (sheet "Stock Laminate")
  mustStock?: boolean;              // TableX "must stock" mandate for the laminate (may not be stocked yet)
  priceBasis?: LaminatePriceBasis;  // vendor price column the laminate price draws from
  bandingBasis?: string;            // edgeband price column (woodgrain detail tab, raw string e.g. "Wilsonart Column + 10%")
  bandingUpchargePct?: number | "custom"; // ADDITIONAL edgeband upcharge %, or "custom" = banding priced by custom quote only
  bandingNote?: string;             // conditional pricing notes, e.g. "if stocking program put in place for banding then 15% upcharge"
  edgebandRef?: string;             // named substitute edgeband (not a self-match), e.g. "Kimball HN2"
  edgebandStocked?: boolean;        // matching/designated edgeband currently stocked (sheet "Stock Edgeband")
  edgebandMustStock?: boolean;      // TableX must-stock mandate for the edgeband
}

export interface EdgeType {
  id: string;
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Powder Coat Colors (31 colors for bases)
// ---------------------------------------------------------------------------
const powderCoat = (id: string, name: string, hex: string): FinishOption => ({
  id, name, category: 'powder-coat', hex, roughness: 0.4, metalness: 0.1,
  normalMapUrl: '/textures/powder-coat/orange-peel-normal.png',
});

export const powderCoatFinishes: FinishOption[] = [
  powderCoat('pc-black', 'Black', '#1e1e1e'),
  powderCoat('pc-white', 'White', '#f5f5f5'),
  powderCoat('pc-silver', 'Silver', '#c0c0c0'),
  powderCoat('pc-charcoal', 'Charcoal', '#36454f'),
  powderCoat('pc-slate', 'Slate', '#708090'),
  powderCoat('pc-pewter', 'Pewter', '#8e9196'),
  powderCoat('pc-graphite', 'Graphite', '#4b4b4b'),
  powderCoat('pc-titanium', 'Titanium', '#878681'),
  powderCoat('pc-platinum', 'Platinum', '#e5e4e2'),
  powderCoat('pc-sandstone', 'Sandstone', '#786d5f'),
  powderCoat('pc-desert-tan', 'Desert Tan', '#c9b48c'),
  powderCoat('pc-warm-beige', 'Warm Beige', '#d2b48c'),
  powderCoat('pc-camel', 'Camel', '#c19a6b'),
  powderCoat('pc-bronze', 'Bronze', '#cd7f32'),
  powderCoat('pc-copper', 'Copper', '#b87333'),
  powderCoat('pc-burgundy', 'Burgundy', '#800020'),
  powderCoat('pc-cranberry', 'Cranberry', '#9b1b30'),
  powderCoat('pc-cardinal', 'Cardinal', '#c41e3a'),
  powderCoat('pc-fire-red', 'Fire Red', '#ce2029'),
  powderCoat('pc-orange', 'Orange', '#ff6600'),
  powderCoat('pc-sunset', 'Sunset', '#fad6a5'),
  powderCoat('pc-lemon', 'Lemon', '#fff44f'),
  powderCoat('pc-sage', 'Sage', '#bcb88a'),
  powderCoat('pc-forest', 'Forest', '#228b22'),
  powderCoat('pc-hunter-green', 'Hunter Green', '#355e3b'),
  powderCoat('pc-teal', 'Teal', '#008080'),
  powderCoat('pc-navy', 'Navy', '#1a3c5c'),
  powderCoat('pc-royal-blue', 'Royal Blue', '#4169e1'),
  powderCoat('pc-sky-blue', 'Sky Blue', '#87ceeb'),
  powderCoat('pc-lavender', 'Lavender', '#b4a7d6'),
  powderCoat('pc-plum', 'Plum', '#673147'),
];

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------
export const chromeFinish: FinishOption = {
  id: 'chrome',
  name: 'Chrome',
  category: 'chrome',
  hex: '#e8e8e8',
  roughness: 0.1,
  metalness: 0.9,
};

// ---------------------------------------------------------------------------
// 2026 TableX Laminate Catalog — Wilsonart + Formica
// Source: "2026 TableX Laminate Colors FINAL.xlsx", revision 2026-06-05.
//
// PRICING RULINGS (Brian, email 2026-06-05 — conflicts RESOLVED):
//  - SUMMARY TAB is authoritative for pricing. Category rule: Core = "Wilsonart
//    2 or More" list, Select = +15%, Luxe = +35% — deliberately rounded UP to
//    the highest markup within each category. The detail tabs were a separate
//    manufacturer-facing working sheet (stock/banding data still comes from them).
//  - ⚠ OPEN (next call): the 5 Luxe PATTERNS print +20% on the summary tab,
//    which contradicts the verbal Luxe=+35 rule — catalog keeps +20 as printed.
//  - Patterns get NO matching edgebands as an OFFER ("ugly, very few want
//    them") — customers pick a solid edgeband. The manufacturer stocks 3
//    (4783-60/4623-60/4942-38, see edgebandStocked) but TableX won't offer them.
//  - Dealer pricing rule (site requirement): list price is public; dealers log
//    in to see their tier discount (e.g. 50/20) and net pricing.
//
// Organized as:
//  - Woodgrains (28 colors) → exposed as `tflFinishes` for UI grouping
//  - Solids (15) + Patterns (23) → exposed as `hplFinishes`
//
// Hex values are visual approximations based on color names; swap in real
// texture URLs (`textureUrl`, `normalMapUrl`) as they become available.
// ---------------------------------------------------------------------------

function laminate(
  id: string,
  name: string,
  hex: string,
  category: 'hpl' | 'tfl',
  subCategory: LaminateSubCategory,
  brand: LaminateBrand,
  itemNumber: string,
  priceTier: LaminatePriceTier,
  upchargePct: number,
  hasMatchingEdgeband: boolean,
  isStock = true,
  extra?: Partial<FinishOption>,
): FinishOption {
  return {
    id,
    name,
    category,
    hex,
    roughness: subCategory === "solid" ? 0.55 : subCategory === "pattern" ? 0.65 : 0.72,
    metalness: 0,
    brand,
    itemNumber,
    subCategory,
    priceTier,
    upchargePct,
    hasMatchingEdgeband,
    isStock,
    ...extra,
  };
}

// ----- WOODGRAINS (28) → tflFinishes -----
export const tflFinishes: FinishOption[] = [
  laminate('lam-7122K-07', 'Empire Mahogany', '#4a2618', 'tfl', 'woodgrain', 'Wilsonart', '7122K-07', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7925-38', 'Monticello Maple', '#c89668', 'tfl', 'woodgrain', 'Wilsonart', '7925-38', 'Core', 0, false, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', edgebandRef: 'Kimball HN2', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7960K-18', 'Studio Teak', '#8b6239', 'tfl', 'woodgrain', 'Wilsonart', '7960K-18', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7946-38', 'Brazilwood', '#6b2e1f', 'tfl', 'woodgrain', 'Wilsonart', '7946-38', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-10776-60', 'Kensington Maple', '#d4a374', 'tfl', 'woodgrain', 'Wilsonart', '10776-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Standard Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7054-60', 'Wild Cherry', '#7a3b28', 'tfl', 'woodgrain', 'Wilsonart', '7054-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7965K-12', 'Walnut Heights', '#5a3c2a', 'tfl', 'woodgrain', 'Wilsonart', '7965K-12', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7943K-07', 'Colombian Walnut', '#3d2817', 'tfl', 'woodgrain', 'Wilsonart', '7943K-07', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-5785-NG', 'Ashwood Beige', '#b39a77', 'tfl', 'woodgrain', 'Formica', '5785-NG', 'Select', 15, true, true,
    { priceBasis: 'Formica Column', bandingBasis: 'Formica Column + 10%', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-5788-NG', 'Hazel Walnut', '#8b6a4a', 'tfl', 'woodgrain', 'Formica', '5788-NG', 'Select', 15, true, true,
    { priceBasis: 'Formica Column', bandingBasis: 'Formica Column + 10%', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7991-38', 'Neowalnut', '#6a4a33', 'tfl', 'woodgrain', 'Wilsonart', '7991-38', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 15, mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7992-38', 'Pinnacle Walnut', '#7a5a3e', 'tfl', 'woodgrain', 'Wilsonart', '7992-38', 'Select', 15, false, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: false, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7993-38', 'Florence Walnut', '#6b5440', 'tfl', 'woodgrain', 'Wilsonart', '7993-38', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7949K-18', 'Asian Night', '#2a1f18', 'tfl', 'woodgrain', 'Wilsonart', '7949K-18', 'Select', 15, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 10%', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7964K-12', 'Skyline Walnut', '#3d3028', 'tfl', 'woodgrain', 'Wilsonart', '7964K-12', 'Select', 15, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 10%', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7985-38', 'Morelia Mango', '#9a6a40', 'tfl', 'woodgrain', 'Wilsonart', '7985-38', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7937-38', 'River Cherry', '#8b4a33', 'tfl', 'woodgrain', 'Wilsonart', '7937-38', 'Select', 15, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 15, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7909-60', 'Fusion Maple', '#d4a87d', 'tfl', 'woodgrain', 'Wilsonart', '7909-60', 'Select', 15, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 10, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7990-38', 'Mission Maple', '#a88560', 'tfl', 'woodgrain', 'Wilsonart', '7990-38', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7995-38', 'Sterling Ash', '#a09790', 'tfl', 'woodgrain', 'Wilsonart', '7995-38', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7933K-07', 'Cafelle', '#8a6850', 'tfl', 'woodgrain', 'Wilsonart', '7933K-07', 'Select', 15, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-7981K-12', 'Landmark Wood', '#5d3f2a', 'tfl', 'woodgrain', 'Wilsonart', '7981K-12', 'Luxe', 35, true, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 'custom', edgebandRef: 'Cashew Rift Edge Band', mustStock: true, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-8208K-16', 'Fawn Cypress', '#b8a082', 'tfl', 'woodgrain', 'Wilsonart', '8208K-16', 'Luxe', 35, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 15, mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7952K-18', 'Asian Sand', '#b89870', 'tfl', 'woodgrain', 'Wilsonart', '7952K-18', 'Luxe', 35, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-8210K-28', 'Portico Teak', '#7a5638', 'tfl', 'woodgrain', 'Wilsonart', '8210K-28', 'Luxe', 35, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 10, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-8209K-28', 'Veranla Teak', '#8a7056', 'tfl', 'woodgrain', 'Wilsonart', '8209K-28', 'Luxe', 35, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-7970K-18', 'High Line', '#6a553e', 'tfl', 'woodgrain', 'Wilsonart', '7970K-18', 'Luxe', 35, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 15, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-8212K-28', 'Phantom Ecru', '#c8b89e', 'tfl', 'woodgrain', 'Wilsonart', '8212K-28', 'Luxe', 35, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingBasis: 'Wilsonart Column + 20%', bandingUpchargePct: 10, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
];

// ----- SOLIDS (15) + PATTERNS (23) → hplFinishes -----
export const hplFinishes: FinishOption[] = [
  // Solids
  laminate('lam-D354-60', 'Designer White', '#f0eee8', 'hpl', 'solid', 'Wilsonart', 'D354-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-15501-31', 'White Velvet — Traceless', '#f5f5f3', 'hpl', 'solid', 'Wilsonart', '15501-31', 'Luxe', 0, true, true,
    { priceBasis: 'Custom quote only', bandingUpchargePct: 15, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-1573-60', 'Frosty White', '#ffffff', 'hpl', 'solid', 'Wilsonart', '1573-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D439-60', 'Wallaby', '#a89b88', 'hpl', 'solid', 'Wilsonart', 'D439-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D327-60', 'Pepperdust', '#968878', 'hpl', 'solid', 'Wilsonart', 'D327-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D381-60', 'Fashion Grey', '#8e8882', 'hpl', 'solid', 'Wilsonart', 'D381-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D315-60', 'Platinum Grey', '#b8b4ae', 'hpl', 'solid', 'Wilsonart', 'D315-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D504-60', 'Fossil Shale', '#6a6058', 'hpl', 'solid', 'Wilsonart', 'D504-60', 'Core', 0, false, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-15504-31', 'Charcoal Velvet — Traceless', '#3a3a3a', 'hpl', 'solid', 'Wilsonart', '15504-31', 'Luxe', 0, true, true,
    { priceBasis: 'Custom quote only', bandingUpchargePct: 15, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D91-60', 'Slate Grey', '#4a4a4e', 'hpl', 'solid', 'Wilsonart', 'D91-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-1595-60', 'Black', '#1a1a1a', 'hpl', 'solid', 'Wilsonart', '1595-60', 'Core', 0, true, true,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 0, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-D321-60', 'Brittany Blue', '#1e3a5f', 'hpl', 'solid', 'Wilsonart', 'D321-60', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-D25-60', 'Atlantis', '#1e5a6f', 'hpl', 'solid', 'Wilsonart', 'D25-60', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-D505-60', 'Midnight', '#0e0f18', 'hpl', 'solid', 'Wilsonart', 'D505-60', 'Select', 15, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-15505-31', 'Black — Traceless', '#1a1a1a', 'hpl', 'solid', 'Wilsonart', '15505-31', 'Luxe', 0, true, true,
    { priceBasis: 'Custom quote only', bandingUpchargePct: 15, mustStock: false, edgebandStocked: true, edgebandMustStock: false }),

  // Patterns
  laminate('lam-4779-60', 'Pewter Brush', '#7a7874', 'hpl', 'pattern', 'Wilsonart', '4779-60', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-4669-60', 'Natural Tigris', '#a89680', 'hpl', 'pattern', 'Wilsonart', '4669-60', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-4674-60', 'Evening Tigris', '#4a4038', 'hpl', 'pattern', 'Wilsonart', '4674-60', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 15, mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-4783-60', 'White Tigris', '#d8d0c4', 'hpl', 'pattern', 'Wilsonart', '4783-60', 'Core', 0, false, true,
    { priceBasis: 'Standard Column', bandingUpchargePct: 15, bandingNote: 'Manufacturer stocks this matching band, but TableX does not offer matching pattern edgebands — customers pick a solid edgeband (Brian 6/5)', mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-4623-60', 'Graphite Nebula', '#3a3a3e', 'hpl', 'pattern', 'Wilsonart', '4623-60', 'Core', 0, false, true,
    { priceBasis: 'Standard Column', bandingUpchargePct: 15, bandingNote: 'Manufacturer stocks this matching band, but TableX does not offer matching pattern edgebands — customers pick a solid edgeband (Brian 6/5)', mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-4622-60', 'Grey Nebula', '#8a8a8e', 'hpl', 'pattern', 'Wilsonart', '4622-60', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-4621-60', 'White Nebula', '#dcd8d4', 'hpl', 'pattern', 'Wilsonart', '4621-60', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 15, mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5035-38', 'Handspun Slate', '#6a6a6c', 'hpl', 'pattern', 'Wilsonart', '5035-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5034-38', 'Handspun Dove', '#a8a8aa', 'hpl', 'pattern', 'Wilsonart', '5034-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5036-38', 'Handspun Chestnut', '#7a5a40', 'hpl', 'pattern', 'Wilsonart', '5036-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5033-38', 'Handspun Pearl', '#e8e4de', 'hpl', 'pattern', 'Wilsonart', '5033-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5016-38', 'French Linen', '#c4b8a0', 'hpl', 'pattern', 'Wilsonart', '5016-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-4991-38', 'Pressed Linen', '#b8ac98', 'hpl', 'pattern', 'Wilsonart', '4991-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5015-38', 'Nordic Linen', '#b4b0a4', 'hpl', 'pattern', 'Wilsonart', '5015-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-4942-38', 'Crisp Linen', '#d4c8b0', 'hpl', 'pattern', 'Wilsonart', '4942-38', 'Core', 0, false, true,
    { priceBasis: 'Standard Column', bandingUpchargePct: 15, bandingNote: 'Manufacturer stocks this matching band, but TableX does not offer matching pattern edgebands — customers pick a solid edgeband (Brian 6/5)', mustStock: false, edgebandStocked: true, edgebandMustStock: false }),
  laminate('lam-4944-38', 'Casual Linen', '#c0b498', 'hpl', 'pattern', 'Wilsonart', '4944-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-4996-38', 'Flax Linen', '#c8ba90', 'hpl', 'pattern', 'Wilsonart', '4996-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-4943-38', 'Classic Linen', '#bbb094', 'hpl', 'pattern', 'Wilsonart', '4943-38', 'Core', 0, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-4941K-18', 'Cosmic Strandz', '#3e3834', 'hpl', 'pattern', 'Wilsonart', '4941K-18', 'Luxe', 20, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-4940K-18', 'Astro Strandz', '#6a6460', 'hpl', 'pattern', 'Wilsonart', '4940K-18', 'Luxe', 20, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-4939K-18', 'Vapor Strandz', '#a8a4a0', 'hpl', 'pattern', 'Wilsonart', '4939K-18', 'Luxe', 20, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: true }),
  laminate('lam-5023K-19', 'Nightfall', '#1a1a20', 'hpl', 'pattern', 'Wilsonart', '5023K-19', 'Luxe', 20, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
  laminate('lam-5024K-19', 'Blackbird', '#232326', 'hpl', 'pattern', 'Wilsonart', '5024K-19', 'Luxe', 20, false, false,
    { priceBasis: 'Wilsonart 2 or More', bandingUpchargePct: 'custom', bandingNote: 'if stocking program put in place for banding then 15% upcharge', mustStock: true, edgebandStocked: false, edgebandMustStock: false }),
];

/** All 2026 TableX laminates (66 colors: 28 woodgrain + 15 solid + 23 pattern). */
export const laminateCatalog: FinishOption[] = [...tflFinishes, ...hplFinishes];

// ---------------------------------------------------------------------------
// Solid Surface
// ---------------------------------------------------------------------------
export const solidSurfaceFinishes: FinishOption[] = [
  { id: 'ss-white', name: 'Solid Surface White', category: 'solid-surface', hex: '#f5f5f5', roughness: 0.3, metalness: 0, normalMapUrl: '/textures/solid-surface/white-normal.png' },
  { id: 'ss-gray', name: 'Solid Surface Gray', category: 'solid-surface', hex: '#a0a0a0', roughness: 0.3, metalness: 0, normalMapUrl: '/textures/solid-surface/gray-normal.png' },
];

// ---------------------------------------------------------------------------
// Butcher Block
// ---------------------------------------------------------------------------
export const butcherBlockFinishes: FinishOption[] = [
  { id: 'bb-natural', name: 'Butcher Block Natural', category: 'butcher-block', hex: '#c49a6c', roughness: 0.8, metalness: 0, textureUrl: '/textures/butcher-block/natural-color.webp', normalMapUrl: '/textures/butcher-block/natural-normal.png' },
  { id: 'bb-walnut', name: 'Butcher Block Walnut', category: 'butcher-block', hex: '#5c3a21', roughness: 0.8, metalness: 0, textureUrl: '/textures/butcher-block/walnut-color.webp', normalMapUrl: '/textures/butcher-block/walnut-normal.png' },
];

// ---------------------------------------------------------------------------
// All Finishes combined
// ---------------------------------------------------------------------------
export const allFinishes: FinishOption[] = [
  ...powderCoatFinishes,
  chromeFinish,
  ...hplFinishes,
  ...tflFinishes,
  ...solidSurfaceFinishes,
  ...butcherBlockFinishes,
];

// ---------------------------------------------------------------------------
// Edge Types
// ---------------------------------------------------------------------------
export const edgeTypes: EdgeType[] = [
  { id: 'self-edge', name: 'Self Edge', description: 'Matching laminate applied to edge' },
  { id: 't-mold', name: 'T-Mold', description: 'PVC T-shaped edge banding' },
  { id: 'urethane-band', name: 'Urethane Band', description: 'Durable urethane bumper edge' },
  { id: 'wood-bullnose', name: 'Wood Bullnose', description: 'Solid wood rounded edge profile' },
  { id: 'vinyl-bullnose', name: 'Vinyl Bullnose', description: 'Vinyl rounded edge profile' },
  { id: 'rubber-t-mold', name: 'Rubber T-Mold', description: 'Rubber T-shaped edge banding' },
  { id: 'phenolic', name: 'Phenolic', description: 'Chemical-resistant phenolic edge' },
  { id: 'no-edge', name: 'No Edge', description: 'No edge treatment' },
];

// ---------------------------------------------------------------------------
// Edge Type → Material mapping (for 3D viewer)
// ---------------------------------------------------------------------------
const EDGE_TYPE_FINISHES: Record<string, FinishOption> = {
  'self-edge':      { id: 'edge-self', name: 'Self Edge', category: 'hpl', hex: '#000000', roughness: 0.6, metalness: 0 }, // placeholder, replaced by top finish
  'no-edge':        { id: 'edge-none', name: 'No Edge', category: 'hpl', hex: '#000000', roughness: 0.6, metalness: 0 },   // placeholder, replaced by top finish
  't-mold':         { id: 'edge-tmold', name: 'T-Mold', category: 'hpl', hex: '#3a3a3a', roughness: 0.5, metalness: 0 },
  'vinyl-bullnose': { id: 'edge-vinyl', name: 'Vinyl Bullnose', category: 'hpl', hex: '#404040', roughness: 0.5, metalness: 0 },
  'urethane-band':  { id: 'edge-urethane', name: 'Urethane Band', category: 'hpl', hex: '#1a1a1a', roughness: 0.8, metalness: 0 },
  'rubber-t-mold':  { id: 'edge-rubber', name: 'Rubber T-Mold', category: 'hpl', hex: '#1a1a1a', roughness: 0.85, metalness: 0 },
  'wood-bullnose':  { id: 'edge-wood', name: 'Wood Bullnose', category: 'hpl', hex: '#a0734a', roughness: 0.75, metalness: 0 },
  'phenolic':       { id: 'edge-phenolic', name: 'Phenolic', category: 'hpl', hex: '#3d2b1f', roughness: 0.6, metalness: 0 },
};

/**
 * Get the FinishOption for an edge type. For "self-edge" and "no-edge",
 * returns null — caller should use the top finish instead.
 */
export function getEdgeFinish(edgeTypeId: string): FinishOption | null {
  if (edgeTypeId === 'self-edge' || edgeTypeId === 'no-edge') return null;
  return EDGE_TYPE_FINISHES[edgeTypeId] ?? null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const finishMap = new Map(allFinishes.map((f) => [f.id, f]));

export function getFinishById(id: string): FinishOption | undefined {
  return finishMap.get(id);
}

export function getFinishesByCategory(category: FinishOption['category']): FinishOption[] {
  return allFinishes.filter((f) => f.category === category);
}

export function getLaminatesBySubCategory(subCategory: LaminateSubCategory): FinishOption[] {
  return laminateCatalog.filter((f) => f.subCategory === subCategory);
}

export function getLaminatesByPriceTier(tier: LaminatePriceTier): FinishOption[] {
  return laminateCatalog.filter((f) => f.priceTier === tier);
}

export function getDefaultFinish(): FinishOption {
  return powderCoatFinishes[0]; // Black powder coat
}
