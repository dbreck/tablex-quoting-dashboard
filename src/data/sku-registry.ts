export const seriesCodes: Record<string, { name: string; description: string }> = {
  "00": { name: "Essentials", description: "Budget-friendly basics" },
  "01": { name: "Studio", description: "Standard classroom/training" },
  "02": { name: "Nexus", description: "Conference and meeting" },
  "03": { name: "Matrix", description: "Modular and configurable" },
  "05": { name: "Alliance", description: "Collaborative workspace" },
  "06": { name: "Beacon", description: "Standing height" },
  "07": { name: "Apex", description: "Premium executive" },
  "08": { name: "Pinnacle", description: "Designer series" },
  "09": { name: "Horizon", description: "Height adjustable" },
  "10": { name: "Cascade", description: "Waterfall edge" },
  "11": { name: "Terrain", description: "Outdoor/industrial" },
  "15": { name: "Arc", description: "Curved modular" },
  "20": { name: "Summit", description: "Large conference" },
  "25": { name: "Traverse", description: "Training/seminar" },
  "30": { name: "Foundation", description: "Heavy-duty" },
  "35": { name: "Vertex", description: "Angular modern" },
  "40": { name: "Crest", description: "Ergonomic" },
  "45": { name: "Ridge", description: "Standing/sitting" },
  "50": { name: "Element", description: "Minimalist" },
  "55": { name: "Catalyst", description: "Collaborative" },
  "60": { name: "Contour", description: "Shaped tops" },
  "65": { name: "Prime", description: "Value line" },
  "70": { name: "Vector", description: "Technology-ready" },
  "75": { name: "Vantage", description: "Premium value" },
  "80": { name: "Zenith", description: "Top-tier" },
  "85": { name: "Legacy", description: "Traditional" },
  "90": { name: "Nova", description: "New generation" },
  "95": { name: "Custom", description: "Made to order" },
  "99": { name: "Surge", description: "High-performance" },
};

export const shapeCodes: Record<string, { name: string; icon: string }> = {
  "SQ": { name: "Square", icon: "square" },
  "TC": { name: "Rectangular", icon: "rectangle-horizontal" },
  "RD": { name: "Round", icon: "circle" },
  "SC": { name: "Semicircle", icon: "semicircle" },
  "TR": { name: "Trapezoid", icon: "trapezoid" },
  "BT": { name: "Boat Shape", icon: "boat" },
  "RC": { name: "Racetrack", icon: "racetrack" },
  "KD": { name: "Kidney", icon: "kidney" },
  "HX": { name: "Hexagonal", icon: "hexagon" },
  "PW": { name: "Power Top", icon: "power" },
};

export const baseCodes: Record<string, { name: string; description: string }> = {
  "QD": { name: "Quad Disc", description: "4-point disc base" },
  "T": { name: "T-Base", description: "T-shaped base" },
  "X": { name: "X-Base", description: "X-shaped base" },
  "C": { name: "C-Frame", description: "Cantilever frame" },
  "P": { name: "Panel Leg", description: "Panel-style leg" },
  "RB": { name: "Round Base", description: "Single round base" },
  "SB": { name: "Square Base", description: "Single square base" },
  "HL": { name: "H-Leg", description: "H-shaped legs" },
  "FL": { name: "Flat Leg", description: "Flat steel legs" },
  "TL": { name: "Tube Leg", description: "Tubular steel legs" },
  "PD": { name: "Pedestal", description: "Pedestal mount" },
  "WL": { name: "Wall Mount", description: "Wall-mounted" },
  "FD": { name: "Folding", description: "Folding mechanism" },
};

export const optionSuffixes: Record<string, { name: string; description: string }> = {
  "LC": { name: "Locking Casters", description: "Locking caster wheels" },
  "NE": { name: "Nesting", description: "Nesting capability for storage" },
  "FD": { name: "Folding", description: "Folding top mechanism" },
  "CH": { name: "Chrome", description: "Chrome finish base" },
  "GM": { name: "Grommet", description: "Wire management grommet" },
  "MV": { name: "Modesty Panel", description: "Front modesty panel" },
  "KB": { name: "Keyboard Tray", description: "Pull-out keyboard tray" },
  "PM": { name: "Power Module", description: "Integrated power/data" },
  "GL": { name: "Glides", description: "Floor glide levelers" },
  "AG": { name: "Anti-Glare", description: "Anti-glare surface" },
};

// Special height pattern: -SH.XX where XX is inches
export const specialHeightPattern = /SH\.(\d+)/;
// Grommet pattern: -GR.A, -GR.B etc.
export const grommitPattern = /GR\.([A-Z])/;
// Post config pattern: -3P, -4P etc.
export const postConfigPattern = /(\d)P$/;
