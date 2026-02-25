import { create } from "zustand";
import type { QuoteRequest, QuoteRequestStatus } from "@/types/quote-builder";
import { createClient } from "@/lib/supabase/client";

interface QuoteRequestStore {
  requests: QuoteRequest[];
  isLoaded: boolean;
  loadFromSupabase: () => Promise<void>;
  addRequest: (data: Omit<QuoteRequest, "id" | "requestNumber" | "status" | "createdAt">) => Promise<string>;
  updateRequestStatus: (id: string, status: QuoteRequestStatus) => Promise<void>;
}

function fromSnakeRow(row: Record<string, unknown>): QuoteRequest {
  return {
    id: row.id as string,
    requestNumber: row.request_number as string,
    contactFirstName: row.contact_first_name as string,
    contactLastName: row.contact_last_name as string,
    contactEmail: row.contact_email as string | undefined,
    contactPhone: row.contact_phone as string | undefined,
    contactCompany: row.contact_company as string | undefined,
    seriesCode: row.series_code as string,
    seriesName: row.series_name as string,
    shapeCode: row.shape_code as string,
    size: row.size as string,
    baseCode: row.base_code as string,
    baseFinish: row.base_finish as string | undefined,
    topMaterial: row.top_material as string | undefined,
    topFinish: row.top_finish as string | undefined,
    edgeType: row.edge_type as string | undefined,
    quantity: Number(row.quantity) || 1,
    status: (row.status as QuoteRequestStatus) || "pending",
    notes: row.notes as string | undefined,
    quoteId: row.quote_id as string | undefined,
    createdAt: row.created_at as string,
  };
}

export const useQuoteRequestStore = create<QuoteRequestStore>()((set, get) => ({
  requests: [],
  isLoaded: false,

  loadFromSupabase: async () => {
    if (get().isLoaded) return;
    const supabase = createClient();

    // Paginate to get all rows (Supabase default limit is 1,000)
    const all: Record<string, unknown>[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Failed to load quote requests:", error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    set({ requests: all.map(fromSnakeRow), isLoaded: true });
  },

  addRequest: async (requestData) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        contact_first_name: requestData.contactFirstName,
        contact_last_name: requestData.contactLastName,
        contact_email: requestData.contactEmail || null,
        contact_phone: requestData.contactPhone || null,
        contact_company: requestData.contactCompany || null,
        series_code: requestData.seriesCode,
        series_name: requestData.seriesName,
        shape_code: requestData.shapeCode,
        size: requestData.size,
        base_code: requestData.baseCode,
        base_finish: requestData.baseFinish || null,
        top_material: requestData.topMaterial || null,
        top_finish: requestData.topFinish || null,
        edge_type: requestData.edgeType || null,
        quantity: requestData.quantity,
      })
      .select()
      .single();

    if (error) throw error;

    const request = fromSnakeRow(data);
    set((state) => ({ requests: [request, ...state.requests] }));
    return request.id;
  },

  updateRequestStatus: async (id, status) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({ status })
      .eq("id", id);
    if (error) throw error;

    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    }));
  },
}));
