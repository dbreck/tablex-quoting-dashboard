import { create } from "zustand";
import type { Order, OrderStatus } from "@/types/quote-builder";
import { createClient } from "@/lib/supabase/client";

interface OrderStore {
  orders: Order[];
  isLoaded: boolean;
  loadFromSupabase: () => Promise<void>;
  createOrderFromQuote: (quoteId: string, data: {
    organizationId?: string;
    poNumber?: string;
    shipToAddress?: string;
    shipToCity?: string;
    shipToState?: string;
    shipToZip?: string;
    requestedShipDate?: string;
    notes?: string;
  }) => Promise<string>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  getOrderByQuoteId: (quoteId: string) => Order | undefined;
}

function toSnakeOrder(order: Partial<Order>) {
  return {
    ...(order.orderNumber !== undefined && { order_number: order.orderNumber }),
    ...(order.quoteId !== undefined && { quote_id: order.quoteId }),
    ...(order.organizationId !== undefined && { organization_id: order.organizationId }),
    ...(order.status !== undefined && { status: order.status }),
    ...(order.poNumber !== undefined && { po_number: order.poNumber }),
    ...(order.shipToAddress !== undefined && { ship_to_address: order.shipToAddress }),
    ...(order.shipToCity !== undefined && { ship_to_city: order.shipToCity }),
    ...(order.shipToState !== undefined && { ship_to_state: order.shipToState }),
    ...(order.shipToZip !== undefined && { ship_to_zip: order.shipToZip }),
    ...(order.requestedShipDate !== undefined && { requested_ship_date: order.requestedShipDate }),
    ...(order.actualShipDate !== undefined && { actual_ship_date: order.actualShipDate }),
    ...(order.notes !== undefined && { notes: order.notes }),
    ...(order.sageSalesOrderId !== undefined && { sage_sales_order_id: order.sageSalesOrderId }),
    ...(order.sageSyncedAt !== undefined && { sage_synced_at: order.sageSyncedAt }),
  };
}

function fromSnakeOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    quoteId: row.quote_id as string,
    organizationId: row.organization_id as string | undefined,
    status: row.status as OrderStatus,
    poNumber: row.po_number as string | undefined,
    shipToAddress: row.ship_to_address as string | undefined,
    shipToCity: row.ship_to_city as string | undefined,
    shipToState: row.ship_to_state as string | undefined,
    shipToZip: row.ship_to_zip as string | undefined,
    requestedShipDate: row.requested_ship_date as string | undefined,
    actualShipDate: row.actual_ship_date as string | undefined,
    notes: row.notes as string | undefined,
    sageSalesOrderId: row.sage_sales_order_id as string | undefined,
    sageSyncedAt: row.sage_synced_at as string | undefined,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  orders: [],
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
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Failed to load orders:", error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    set({ orders: all.map(fromSnakeOrder), isLoaded: true });
  },

  createOrderFromQuote: async (quoteId, data) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        order_number: "",
        quote_id: quoteId,
        organization_id: data.organizationId,
        status: "pending",
        po_number: data.poNumber,
        ship_to_address: data.shipToAddress,
        ship_to_city: data.shipToCity,
        ship_to_state: data.shipToState,
        ship_to_zip: data.shipToZip,
        requested_ship_date: data.requestedShipDate,
        notes: data.notes,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    const order = fromSnakeOrder(row);
    set((state) => ({ orders: [order, ...state.orders] }));
    return order.id;
  },

  updateOrder: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update(toSnakeOrder(updates))
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? { ...o, ...updates, updatedAt: new Date().toISOString() }
          : o
      ),
    }));
  },

  getOrderByQuoteId: (quoteId) => {
    return get().orders.find((o) => o.quoteId === quoteId);
  },
}));
