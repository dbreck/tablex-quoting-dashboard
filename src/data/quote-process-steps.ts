// Quote Process Steps — 8-step quoting workflow from intake to delivery

export interface PainPoint {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
}

export interface QuoteProcessStep {
  id: string;
  name: string;
  description: string;
  tool: string;
  owner: string;
  timeEstimate: string;
  painPoints: PainPoint[];
}

export const quoteProcessSteps: QuoteProcessStep[] = [
  {
    id: "receive-review",
    name: "Receive & Review Request",
    description: "Queue managed by Mark",
    tool: "Email + Quote Queue (Excel)",
    owner: "Mark",
    timeEstimate: "5-10 min",
    painPoints: [
      {
        severity: "high",
        title: "No standardized intake",
        description:
          "Requests come in varying email formats",
      },
      {
        severity: "medium",
        title: "Queue management bottleneck",
        description: "Mark is single gatekeeper",
      },
    ],
  },
  {
    id: "generate-quote-number",
    name: "Generate Quote Number",
    description: "Manual numbering system",
    tool: "Manual Process",
    owner: "Sam/Patty",
    timeEstimate: "1-2 min",
    painPoints: [
      {
        severity: "medium",
        title: "Manual numbering scheme",
        description:
          "Year+initials+date+letter format prone to duplication",
      },
      {
        severity: "low",
        title: "No auto-increment",
        description: "Must manually check for conflicts",
      },
    ],
  },
  {
    id: "gather-external-pricing",
    name: "Gather External Pricing",
    description: "Email vendor for pricing",
    tool: "Email",
    owner: "Sam/Patty",
    timeEstimate: "1hr to half-day",
    painPoints: [
      {
        severity: "high",
        title: "Major time bottleneck",
        description:
          "Waiting for vendor email responses, 1 hour to half a day",
      },
      {
        severity: "high",
        title: "Process blocks entirely",
        description: "Cannot proceed until vendor responds",
      },
    ],
  },
  {
    id: "gather-internal-pricing",
    name: "Gather Internal Pricing",
    description: "Look up in product books",
    tool: "Product Books + Price List + Tribal Knowledge",
    owner: "Sam/Patty",
    timeEstimate: "15-30 min",
    painPoints: [
      {
        severity: "high",
        title: "Tribal knowledge dependency",
        description:
          "Critical pricing rules live only in staff members' heads",
      },
      {
        severity: "medium",
        title: "Multiple disconnected sources",
        description:
          "Must cross-reference physical books, Excel price list, and personal notes",
      },
    ],
  },
  {
    id: "calculate-quote-table",
    name: "Calculate in Quote Table",
    description: "Intermediate calculation",
    tool: "Quote Table (Excel)",
    owner: "Sam/Patty",
    timeEstimate: "10-20 min per item",
    painPoints: [
      {
        severity: "high",
        title: "Manual lookup in 9K+ rows",
        description:
          "Staff must search through massive spreadsheet for each SKU",
      },
      {
        severity: "medium",
        title: "No validation",
        description:
          "Errors in tier selection or pricing not caught automatically",
      },
    ],
  },
  {
    id: "populate-quote-template",
    name: "Populate Quote Template",
    description: "Fill in customer-facing doc",
    tool: "Quote Template (Excel \u2014 shared drive)",
    owner: "Sam/Patty",
    timeEstimate: "15-30 min",
    painPoints: [
      {
        severity: "high",
        title: "Complete data re-entry",
        description:
          "Every line item manually re-entered from Quote Table",
      },
      {
        severity: "medium",
        title: "Per-person copies on shared drive",
        description:
          "No single source of truth; version conflicts possible",
      },
    ],
  },
  {
    id: "save-convert",
    name: "Save & Convert",
    description: "Excel to PDF",
    tool: "Excel \u2192 PDF export",
    owner: "Sam/Patty",
    timeEstimate: "2-5 min",
    painPoints: [
      {
        severity: "low",
        title: "Manual formatting check",
        description:
          "Must verify PDF looks correct before sending",
      },
      {
        severity: "low",
        title: "File naming/storage",
        description:
          "No standardized naming convention or central repository",
      },
    ],
  },
  {
    id: "send-to-customer",
    name: "Send to Customer",
    description: "Email PDF to dealer",
    tool: "Email",
    owner: "Sam/Patty",
    timeEstimate: "2-5 min",
    painPoints: [
      {
        severity: "medium",
        title: "No delivery tracking",
        description:
          "No way to know if dealer opened the quote",
      },
      {
        severity: "low",
        title: "No follow-up automation",
        description:
          "Must manually track which quotes need follow-up",
      },
    ],
  },
];
