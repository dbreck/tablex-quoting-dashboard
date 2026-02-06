export type DiscountTier = '50_20' | '50_20_5' | '50_20_10' | '50_20_15' | '50_20_20';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export const DISCOUNT_TIER_LABELS: Record<DiscountTier, string> = {
  '50_20': '50/20',
  '50_20_5': '50/20/5',
  '50_20_10': '50/20/10',
  '50_20_15': '50/20/15',
  '50_20_20': '50/20/20',
};

export const DISCOUNT_TIER_FACTORS: Record<DiscountTier, number> = {
  '50_20': 0.40,
  '50_20_5': 0.38,
  '50_20_10': 0.36,
  '50_20_15': 0.34,
  '50_20_20': 0.32,
};

export const TIER_PRICE_KEYS: Record<DiscountTier, string> = {
  '50_20': 'price_50_20',
  '50_20_5': 'price_50_20_5',
  '50_20_10': 'price_50_20_10',
  '50_20_15': 'price_50_20_15',
  '50_20_20': 'price_50_20_20',
};

export interface QuoteCustomer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  defaultTier: DiscountTier;
  createdAt: string;
}

export interface LineItem {
  id: string;
  sku: string;
  description: string;
  series: string;
  shape: string;
  size: string;
  listPrice: number;
  netPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customer: QuoteCustomer;
  projectName?: string;
  discountTier: DiscountTier;
  lineItems: LineItem[];
  subtotal: number;
  additionalDiscount: number;
  additionalDiscountType: 'percentage' | 'fixed';
  freightZone?: number;
  freightCost: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftQuote {
  customer: Partial<QuoteCustomer>;
  projectName?: string;
  discountTier: DiscountTier;
  lineItems: LineItem[];
  currentStep: number;
}
