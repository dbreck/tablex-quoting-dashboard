import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Quote, QuoteCustomer, DraftQuote, LineItem } from "@/types/quote-builder";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function generateQuoteNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `QT-${year}-${seq}`;
}

interface QuoteStore {
  quotes: Quote[];
  addQuote: (quote: Omit<Quote, "id" | "createdAt" | "updatedAt" | "quoteNumber">) => string;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  customers: QuoteCustomer[];
  addCustomer: (customer: Omit<QuoteCustomer, "id" | "createdAt">) => string;
  updateCustomer: (id: string, updates: Partial<QuoteCustomer>) => void;
  deleteCustomer: (id: string) => void;

  draftQuote: DraftQuote | null;
  setDraftQuote: (draft: DraftQuote | null) => void;
  addLineItem: (item: LineItem) => void;
  removeLineItem: (itemId: string) => void;
  updateLineItem: (itemId: string, updates: Partial<LineItem>) => void;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set) => ({
      quotes: [],
      addQuote: (quoteData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const quote: Quote = {
          ...quoteData,
          id,
          quoteNumber: generateQuoteNumber(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ quotes: [...state.quotes, quote] }));
        return id;
      },
      updateQuote: (id, updates) =>
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
          ),
        })),
      deleteQuote: (id) =>
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        })),

      customers: [],
      addCustomer: (customerData) => {
        const id = generateId();
        const customer: QuoteCustomer = {
          ...customerData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [...state.customers, customer] }));
        return id;
      },
      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      draftQuote: null,
      setDraftQuote: (draft) => set({ draftQuote: draft }),
      addLineItem: (item) =>
        set((state) => ({
          draftQuote: state.draftQuote
            ? { ...state.draftQuote, lineItems: [...state.draftQuote.lineItems, item] }
            : null,
        })),
      removeLineItem: (itemId) =>
        set((state) => ({
          draftQuote: state.draftQuote
            ? { ...state.draftQuote, lineItems: state.draftQuote.lineItems.filter((i) => i.id !== itemId) }
            : null,
        })),
      updateLineItem: (itemId, updates) =>
        set((state) => ({
          draftQuote: state.draftQuote
            ? {
                ...state.draftQuote,
                lineItems: state.draftQuote.lineItems.map((i) =>
                  i.id === itemId ? { ...i, ...updates } : i
                ),
              }
            : null,
        })),
    }),
    {
      name: "tablex-quote-builder",
    }
  )
);
