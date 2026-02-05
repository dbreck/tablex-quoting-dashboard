export interface FreightZone {
  zone: number;
  states: string[];
  color: string;
  pricing: {
    under3k: string;
    over3k: string;
    over5k: string;
    over7_5k: string;
    over10k: string;
  };
}

export const freightZones: FreightZone[] = [
  {
    zone: 1,
    states: ["IL", "IN", "KY", "MI", "OH", "TN", "WV"],
    color: "#8dc63f",
    pricing: {
      under3k: "$200",
      over3k: "FREE",
      over5k: "FREE",
      over7_5k: "FREE",
      over10k: "FREE",
    },
  },
  {
    zone: 2,
    states: ["AL", "AR", "DE", "GA", "IA", "MD", "MN", "MO", "MS", "NC", "PA", "SC", "VA", "WI"],
    color: "#6fa832",
    pricing: {
      under3k: "$300",
      over3k: "$200",
      over5k: "FREE",
      over7_5k: "FREE",
      over10k: "FREE",
    },
  },
  {
    zone: 3,
    states: ["CT", "FL", "KS", "LA", "MA", "ME", "ND", "NE", "NH", "NJ", "NY", "OK", "RI", "SD", "TX", "VT"],
    color: "#4a8a2a",
    pricing: {
      under3k: "$350",
      over3k: "$300",
      over5k: "$200",
      over7_5k: "FREE",
      over10k: "FREE",
    },
  },
  {
    zone: 4,
    states: ["AZ", "CO", "NM", "UT", "WY"],
    color: "#2d6b4f",
    pricing: {
      under3k: "$400",
      over3k: "$350",
      over5k: "$300",
      over7_5k: "$200",
      over10k: "FREE",
    },
  },
  {
    zone: 5,
    states: ["CA", "ID", "MT", "NV", "OR", "WA"],
    color: "#1a3c5c",
    pricing: {
      under3k: "Quote",
      over3k: "Quote",
      over5k: "Quote",
      over7_5k: "Quote",
      over10k: "Quote",
    },
  },
];

// State FIPS codes for react-simple-maps
export const stateToFips: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06",
  CO: "08", CT: "09", DE: "10", FL: "12", GA: "13",
  HI: "15", ID: "16", IL: "17", IN: "18", IA: "19",
  KS: "20", KY: "21", LA: "22", ME: "23", MD: "24",
  MA: "25", MI: "26", MN: "27", MS: "28", MO: "29",
  MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34",
  NM: "35", NY: "36", NC: "37", ND: "38", OH: "39",
  OK: "40", OR: "41", PA: "42", RI: "44", SC: "45",
  SD: "46", TN: "47", TX: "48", UT: "49", VT: "50",
  VA: "51", WA: "53", WV: "54", WI: "55", WY: "56",
};

export const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export function getZoneForState(stateAbbr: string): FreightZone | undefined {
  return freightZones.find(z => z.states.includes(stateAbbr));
}

export function getZoneColor(stateAbbr: string): string {
  const zone = getZoneForState(stateAbbr);
  return zone?.color ?? "#e2e8f0";
}
