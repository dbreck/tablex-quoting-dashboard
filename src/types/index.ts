export interface ProfitAnalysisRow {
  sku: string;
  description: string;
  series: string;
  topCost: number;
  baseCost: number;
  routingCost: number;
  assemblyCost: number;
  freightInCost: number;
  packagingCost: number;
  totalCost: number;
  gpm: number;
  listPrice: number;
  net5020: number;
  net50205: number;
  net502010: number;
  net502015: number;
  net502020: number;
  commission: number;
  netProfit: number;
}

export interface ProductCatalogRow {
  sku: string;
  description: string;
  series: string;
  shape: string;
  size: string;
  totalCost: number;
  listPrice: number;
  net5020: number;
  net50205: number;
  net502010: number;
  net502015: number;
  net502020: number;
  gpm: number;
  notes: string;
}

export interface QuoteQueueRow {
  emailFrom: string;
  dateTime: string;
  quoteNumber: string;
  dealerProject: string;
  special: boolean;
  staff: string;
  status: string;
}
