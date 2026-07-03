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
  quoteRequestId?: string; // originating quote request
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

// Working totals for the quote builder wizard. Written by TotalsStep (step 4)
// and read by QuotePreview (step 5) — the two never mount at the same time.
// Held in the quote store's session-only draftTotals slot (not persisted).
export interface QuoteTotals {
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  freightZone?: number;
  freightCost: number;
  freightState?: string;
  taxEnabled: boolean;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  validUntil: string;
  notes: string;
}

// CRM Types

export type OrganizationType = 'dealer' | 'end_customer' | 'rep_group';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  parentOrganizationId?: string;
  defaultTier: DiscountTier;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  notes?: string;
  isSeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  title?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
}

// Quote Request types

export type QuoteRequestStatus = 'pending' | 'in_progress' | 'quoted' | 'closed';

export interface QuoteRequest {
  id: string;
  requestNumber: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
  seriesCode: string;
  seriesName: string;
  shapeCode: string;
  size: string;
  baseCode: string;
  baseFinish?: string;
  topMaterial?: string;
  topFinish?: string;
  edgeType?: string;
  quantity: number;
  status: QuoteRequestStatus;
  notes?: string;
  quoteId?: string; // linked quote (if converted)
  createdAt: string;
}

export type ActivityType = 'note' | 'quote_created' | 'quote_sent' | 'call' | 'email' | 'meeting';

export interface Activity {
  id: string;
  organizationId?: string;
  contactId?: string;
  quoteId?: string;
  type: ActivityType;
  content: string;
  createdAt: string;
  createdBy?: string;
}

// Order types

export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  quoteId: string;
  organizationId?: string;
  status: OrderStatus;
  poNumber?: string;
  shipToAddress?: string;
  shipToCity?: string;
  shipToState?: string;
  shipToZip?: string;
  requestedShipDate?: string;
  actualShipDate?: string;
  notes?: string;
  sageSalesOrderId?: string;
  sageSyncedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice types

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  organizationId?: string;
  subtotal: number;
  freight: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate?: string;
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
  sageInvoiceId?: string;
  sageSyncedAt?: string;
  sentAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
