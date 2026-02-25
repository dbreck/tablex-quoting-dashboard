export type ThreatLevel = "High" | "Medium" | "Low";

export interface CompetitorSource {
  label: string;
  url: string;
}

export interface CompetitorProfile {
  name: string;
  mentionCount: number;
  threat: ThreatLevel;
  overlap: string;
  findings: string[];
  response: string;
  sources: CompetitorSource[];
}

export interface CompetitorAnalysisData {
  asOf: string;
  method: string;
  competitors: CompetitorProfile[];
}

export const competitorAnalysis: CompetitorAnalysisData = {
  asOf: "February 18, 2026",
  method:
    "Top-3 ranking uses competitor mentions in TableX quote records (2023-2026), then validates overlap and buying flow on competitor sites.",
  competitors: [
    {
      name: "KI",
      mentionCount: 8,
      threat: "High",
      overlap: "Direct overlap in training/classroom and collaborative tables.",
      findings: [
        "Tributaire training tables publish list prices ($891-$1,668), show 9-week lead time, and include lifetime warranty language.",
        "KI's table portfolio spans training, collaborative, media-integrated, and height-adjustable use cases.",
        "Employee-owned model reinforces long-term dealer relationships and service consistency.",
      ],
      response:
        "Emphasize TableX speed-to-quote and custom table flexibility where large catalogs slow down substitutions.",
      sources: [
        { label: "KI Tables", url: "https://www.ki.com/products/tables/" },
        {
          label: "KI Tributaire Training Tables",
          url: "https://www.ki.com/products/name/tributaire-training-tables/",
        },
        {
          label: "KI Employee Ownership",
          url: "https://www.ki.com/about-ki/employee-ownership/",
        },
      ],
    },
    {
      name: "Steelcase",
      mentionCount: 5,
      threat: "High",
      overlap: "Enterprise conference/training tables plus broad dealer channel.",
      findings: [
        "Groupwork tables are positioned for conference, training, and cafe settings with configurable models.",
        "Steelcase routes buyers through dealer + online paths, reducing friction for standard products.",
        "Scale signals from FY2024: 770 dealer locations, ~$3.2B revenue, and 11,300 employees.",
      ],
      response:
        "Win on responsiveness for table-only opportunities and rapid alternates when projects don't need full enterprise contracts.",
      sources: [
        {
          label: "Steelcase Groupwork Tables",
          url: "https://www.steelcase.com/products/groupwork-tables/",
        },
        {
          label: "Steelcase How to Buy",
          url: "https://www.steelcase.com/ways-to-buy/how-to-buy/",
        },
        {
          label: "Steelcase FY2024 Results",
          url: "https://www.steelcase.com/press-releases/steelcase-reports-fourth-quarter-and-fiscal-year-2024-results/",
        },
      ],
    },
    {
      name: "Enwork",
      mentionCount: 1,
      threat: "Medium",
      overlap: "Direct overlap in training, conference, and height-adjustable tables with a similar dealer-driven model.",
      findings: [
        "Self-described 'market leader in tables' — product lines include training (Zori), conference, team, café, and height-adjustable tables.",
        "Quick Ship program offers 10-day turnaround on select products, competing directly on speed.",
        "800+ dealer network across all 50 states and Canada; ~$35M revenue, ~97 employees (founded 2003, Lowell, MI).",
      ],
      response:
        "Highlight TableX's deeper customization options and broader series range (23+ series) where Enwork's catalog is narrower. Match or beat their 10-day quick ship on standard configs.",
      sources: [
        {
          label: "Enwork Homepage",
          url: "https://www.enwork.com/",
        },
        {
          label: "Enwork About Us",
          url: "https://www.enwork.com/about-us/our-story/",
        },
        {
          label: "Enwork Dealer Support",
          url: "https://www.enwork.com/resources/dealer-support/",
        },
      ],
    },
  ],
};
