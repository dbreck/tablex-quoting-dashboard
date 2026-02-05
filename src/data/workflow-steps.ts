export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tool: string;
  painPoints: PainPoint[];
}

export interface PainPoint {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
}

export const workflowSteps: WorkflowStep[] = [
  {
    id: "request",
    name: "Quote Request",
    description: "Dealer or rep submits a quote request via email",
    tool: "Quote Queue (Excel)",
    painPoints: [
      {
        severity: "high",
        title: "Manual Email Intake",
        description: "Every request arrives via email and must be manually logged into the Quote Queue spreadsheet",
      },
      {
        severity: "medium",
        title: "No Standardized Format",
        description: "Requests come in varying formats — sometimes missing key details like quantities, sizes, or finishes",
      },
    ],
  },
  {
    id: "calculate",
    name: "Price Calculation",
    description: "Staff looks up pricing in the Quote Table for each line item",
    tool: "Quote Table (Excel)",
    painPoints: [
      {
        severity: "high",
        title: "Manual Price Lookup",
        description: "Staff must search a 9,000+ row spreadsheet to find each product's cost and pricing at the correct discount tier",
      },
      {
        severity: "high",
        title: "No Link to Queue",
        description: "The Quote Table is a separate file — no automatic connection to the Queue, requiring manual cross-referencing",
      },
      {
        severity: "medium",
        title: "Complex Discount Tiers",
        description: "5 cascading discount tiers (50/20 through 50/20/20) must be applied correctly per dealer agreement",
      },
    ],
  },
  {
    id: "generate",
    name: "Quote Generation",
    description: "Staff creates customer-facing quote using the MAF template",
    tool: "Quote Template (Excel)",
    painPoints: [
      {
        severity: "high",
        title: "Re-entry of All Data",
        description: "Every line item, price, and detail must be manually re-entered from the Quote Table into the template",
      },
      {
        severity: "medium",
        title: "Two Template Variants",
        description: "Staff must choose between MAF (standard) and NET template, and pricing display differs between them",
      },
      {
        severity: "low",
        title: "Manual Freight Calculation",
        description: "Freight zone and pricing must be determined separately and added to the quote",
      },
    ],
  },
  {
    id: "send",
    name: "Quote Delivery",
    description: "Quote is exported to PDF and emailed to the dealer/rep",
    tool: "Email + PDF",
    painPoints: [
      {
        severity: "medium",
        title: "Manual PDF Export",
        description: "Staff must manually export the Excel template to PDF with correct print settings",
      },
      {
        severity: "low",
        title: "No Tracking",
        description: "No way to know if the customer opened or reviewed the quote",
      },
    ],
  },
  {
    id: "order",
    name: "Sales Order",
    description: "If accepted, a Sales Order is created from the quote data",
    tool: "Sales Order (Excel)",
    painPoints: [
      {
        severity: "high",
        title: "Complete Re-entry Again",
        description: "All quote data must be manually re-entered a third time into the Sales Order spreadsheet",
      },
      {
        severity: "high",
        title: "No Quote-to-Order Link",
        description: "There is no automated connection between the quote and the resulting order — just manual copy/paste",
      },
      {
        severity: "medium",
        title: "Error Prone",
        description: "Multiple rounds of manual data entry increase the risk of pricing errors, wrong SKUs, or missed items",
      },
    ],
  },
];
