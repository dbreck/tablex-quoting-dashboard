import { create } from "zustand";
import type { Invoice, InvoiceStatus } from "@/types/quote-builder";
import { createClient } from "@/lib/supabase/client";

interface InvoiceStore {
  invoices: Invoice[];
  isLoaded: boolean;
  loadFromSupabase: () => Promise<void>;
  createInvoiceFromOrder: (orderId: string, data: {
    organizationId?: string;
    subtotal: number;
    freight: number;
    tax: number;
    total: number;
    dueDate?: string;
    notes?: string;
  }) => Promise<string>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  getInvoicesByOrderId: (orderId: string) => Invoice[];
}

function toSnakeInvoice(invoice: Partial<Invoice>) {
  return {
    ...(invoice.invoiceNumber !== undefined && { invoice_number: invoice.invoiceNumber }),
    ...(invoice.orderId !== undefined && { order_id: invoice.orderId }),
    ...(invoice.organizationId !== undefined && { organization_id: invoice.organizationId }),
    ...(invoice.subtotal !== undefined && { subtotal: invoice.subtotal }),
    ...(invoice.freight !== undefined && { freight: invoice.freight }),
    ...(invoice.tax !== undefined && { tax: invoice.tax }),
    ...(invoice.total !== undefined && { total: invoice.total }),
    ...(invoice.status !== undefined && { status: invoice.status }),
    ...(invoice.dueDate !== undefined && { due_date: invoice.dueDate }),
    ...(invoice.paidDate !== undefined && { paid_date: invoice.paidDate }),
    ...(invoice.paidAmount !== undefined && { paid_amount: invoice.paidAmount }),
    ...(invoice.paymentMethod !== undefined && { payment_method: invoice.paymentMethod }),
    ...(invoice.notes !== undefined && { notes: invoice.notes }),
    ...(invoice.sageInvoiceId !== undefined && { sage_invoice_id: invoice.sageInvoiceId }),
    ...(invoice.sageSyncedAt !== undefined && { sage_synced_at: invoice.sageSyncedAt }),
    ...(invoice.sentAt !== undefined && { sent_at: invoice.sentAt }),
  };
}

function fromSnakeInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    invoiceNumber: row.invoice_number as string,
    orderId: row.order_id as string,
    organizationId: row.organization_id as string | undefined,
    subtotal: Number(row.subtotal) || 0,
    freight: Number(row.freight) || 0,
    tax: Number(row.tax) || 0,
    total: Number(row.total) || 0,
    status: row.status as InvoiceStatus,
    dueDate: row.due_date as string | undefined,
    paidDate: row.paid_date as string | undefined,
    paidAmount: row.paid_amount != null ? Number(row.paid_amount) : undefined,
    paymentMethod: row.payment_method as string | undefined,
    notes: row.notes as string | undefined,
    sageInvoiceId: row.sage_invoice_id as string | undefined,
    sageSyncedAt: row.sage_synced_at as string | undefined,
    sentAt: row.sent_at as string | undefined,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const useInvoiceStore = create<InvoiceStore>()((set, get) => ({
  invoices: [],
  isLoaded: false,

  loadFromSupabase: async () => {
    if (get().isLoaded) return;
    const supabase = createClient();

    const all: Record<string, unknown>[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Failed to load invoices:", error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    set({ invoices: all.map(fromSnakeInvoice), isLoaded: true });
  },

  createInvoiceFromOrder: async (orderId, data) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: row, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: "",
        order_id: orderId,
        organization_id: data.organizationId,
        subtotal: data.subtotal,
        freight: data.freight,
        tax: data.tax,
        total: data.total,
        status: "draft",
        due_date: data.dueDate,
        notes: data.notes,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    const invoice = fromSnakeInvoice(row);
    set((state) => ({ invoices: [invoice, ...state.invoices] }));
    return invoice.id;
  },

  updateInvoice: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("invoices")
      .update(toSnakeInvoice(updates))
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id
          ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
          : inv
      ),
    }));
  },

  getInvoicesByOrderId: (orderId) => {
    return get().invoices.filter((inv) => inv.orderId === orderId);
  },
}));
