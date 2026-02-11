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
// HPL (High Pressure Laminate) — neutral tones for tops
// ---------------------------------------------------------------------------
export const hplFinishes: FinishOption[] = [
  { id: 'hpl-white', name: 'HPL White', category: 'hpl', hex: '#f0f0f0', roughness: 0.6, metalness: 0, normalMapUrl: '/textures/hpl/white-normal.png' },
  { id: 'hpl-gray', name: 'HPL Gray', category: 'hpl', hex: '#b0b0b0', roughness: 0.6, metalness: 0, normalMapUrl: '/textures/hpl/gray-normal.png' },
  { id: 'hpl-charcoal', name: 'HPL Charcoal', category: 'hpl', hex: '#4a4a4a', roughness: 0.6, metalness: 0, normalMapUrl: '/textures/hpl/charcoal-normal.png' },
  { id: 'hpl-linen', name: 'HPL Linen', category: 'hpl', hex: '#e8dcc8', roughness: 0.6, metalness: 0, normalMapUrl: '/textures/hpl/linen-normal.png' },
  { id: 'hpl-fog', name: 'HPL Fog', category: 'hpl', hex: '#d0cfc9', roughness: 0.6, metalness: 0, normalMapUrl: '/textures/hpl/fog-normal.png' },
];

// ---------------------------------------------------------------------------
// TFL (Thermally Fused Laminate) — wood tones for tops
// ---------------------------------------------------------------------------
export const tflFinishes: FinishOption[] = [
  { id: 'tfl-natural-maple', name: 'Natural Maple', category: 'tfl', hex: '#d4a76a', roughness: 0.7, metalness: 0, textureUrl: '/textures/tfl/maple-color.webp', normalMapUrl: '/textures/tfl/maple-normal.png' },
  { id: 'tfl-honey-oak', name: 'Honey Oak', category: 'tfl', hex: '#c08840', roughness: 0.7, metalness: 0, textureUrl: '/textures/tfl/oak-color.webp', normalMapUrl: '/textures/tfl/oak-normal.png' },
  { id: 'tfl-cherry', name: 'Cherry', category: 'tfl', hex: '#8b4513', roughness: 0.7, metalness: 0, textureUrl: '/textures/tfl/cherry-color.webp', normalMapUrl: '/textures/tfl/cherry-normal.png' },
  { id: 'tfl-walnut', name: 'Walnut', category: 'tfl', hex: '#5c4033', roughness: 0.7, metalness: 0, textureUrl: '/textures/tfl/walnut-color.webp', normalMapUrl: '/textures/tfl/walnut-normal.png' },
  { id: 'tfl-espresso', name: 'Espresso', category: 'tfl', hex: '#3c2415', roughness: 0.7, metalness: 0, textureUrl: '/textures/tfl/espresso-color.webp', normalMapUrl: '/textures/tfl/espresso-normal.png' },
];

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

export function getDefaultFinish(): FinishOption {
  return powderCoatFinishes[0]; // Black powder coat
}
