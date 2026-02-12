// Sales Order Steps — 8-step post-quote process from PO receipt to warehouse

export interface PainPoint {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
}

export interface SalesOrderStep {
  id: string;
  name: string;
  description: string;
  tool: string;
  owner: string;
  timeEstimate: string;
  painPoints: PainPoint[];
}

export const salesOrderSteps: SalesOrderStep[] = [
  {
    id: "receive-po",
    name: "Receive Production Order",
    description: "Dealer sends PO via email",
    tool: "Email",
    owner: "Sam",
    timeEstimate: "N/A (incoming)",
    painPoints: [
      {
        severity: "medium",
        title: "Email-based intake",
        description: "POs arrive in varying formats",
      },
      {
        severity: "low",
        title: "No auto-matching to quote",
        description:
          "Must manually match PO to original quote",
      },
    ],
  },
  {
    id: "process-po",
    name: "Process PO",
    description: "Print and highlight",
    tool: "Printer + Highlighter",
    owner: "Sam",
    timeEstimate: "5-10 min",
    painPoints: [
      {
        severity: "medium",
        title: "Physical paper process",
        description:
          "Literally printing and highlighting with markers",
      },
      {
        severity: "low",
        title: "No digital workflow",
        description:
          "Paper-based handoff creates lost document risk",
      },
    ],
  },
  {
    id: "enter-sage-erp",
    name: "Enter in Sage ERP",
    description: "Pull up dealer account",
    tool: "Sage ERP",
    owner: "Sam",
    timeEstimate: "5-10 min",
    painPoints: [
      {
        severity: "high",
        title: "Complete data re-entry from quote",
        description:
          "Every piece of data from the quote must be manually re-entered",
      },
      {
        severity: "medium",
        title: "System switching",
        description:
          "Must navigate from email to Excel to Sage",
      },
    ],
  },
  {
    id: "enter-order-details",
    name: "Enter Order Details",
    description: "Ship-to, PO#, products, pricing, ship date",
    tool: "Sage ERP",
    owner: "Sam",
    timeEstimate: "10-20 min",
    painPoints: [
      {
        severity: "high",
        title: "Manual transcription errors",
        description:
          "Copying products/pricing from quote to ERP is error-prone",
      },
      {
        severity: "medium",
        title: "No price validation",
        description:
          "Sage doesn't validate against original quote pricing",
      },
    ],
  },
  {
    id: "print-documents",
    name: "Print Documents",
    description: "Sales order, work order, picking list",
    tool: "Sage ERP \u2192 Printer",
    owner: "Sam",
    timeEstimate: "2-5 min",
    painPoints: [
      {
        severity: "low",
        title: "Paper-based production documents",
        description: "Physical documents for warehouse",
      },
      {
        severity: "low",
        title: "Multiple print jobs",
        description: "Three separate documents to print",
      },
    ],
  },
  {
    id: "email-confirmation",
    name: "Email Confirmation to Dealer",
    description: "Auto-generated from Sage",
    tool: "Sage ERP (auto-email)",
    owner: "Sage (automated)",
    timeEstimate: "Automatic",
    painPoints: [
      {
        severity: "low",
        title: "Limited customization",
        description:
          "Auto-generated email may not match brand expectations",
      },
    ],
  },
  {
    id: "hand-off-to-mark",
    name: "Hand Off to Mark",
    description: "Physical paper on desk",
    tool: "Physical Paper",
    owner: "Sam \u2192 Mark",
    timeEstimate: "1-2 min",
    painPoints: [
      {
        severity: "medium",
        title: "Physical handoff",
        description:
          "Paper documents placed on Mark's desk \u2014 no tracking",
      },
      {
        severity: "medium",
        title: "Single point of failure",
        description: "If Mark is out, documents sit",
      },
    ],
  },
  {
    id: "send-to-warehouse",
    name: "Send to Warehouse",
    description: "Mark routes to production",
    tool: "Physical Paper",
    owner: "Mark",
    timeEstimate: "5-10 min",
    painPoints: [
      {
        severity: "medium",
        title: "No digital tracking",
        description:
          "No system tracks order from office to warehouse",
      },
      {
        severity: "low",
        title: "Manual prioritization",
        description:
          "Mark prioritizes orders based on experience",
      },
    ],
  },
];
