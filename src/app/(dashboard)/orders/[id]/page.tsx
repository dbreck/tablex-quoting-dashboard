"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/order-store";
import { useQuoteStore } from "@/store/quote-store";
import { useCrmStore } from "@/store/crm-store";
import { useInvoiceStore } from "@/store/invoice-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/quote-builder";
import {
  ArrowLeft,
  FileText,
  Truck,
  Receipt,
  Save,
} from "lucide-react";

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_production", label: "In Production" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusBadge: Record<OrderStatus, "secondary" | "info" | "default" | "success" | "error" | "warning"> = {
  pending: "secondary",
  confirmed: "info",
  in_production: "warning",
  shipped: "info",
  delivered: "success",
  completed: "success",
  cancelled: "error",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { orders, loadFromSupabase: loadOrders, updateOrder } = useOrderStore();
  const { quotes, loadFromSupabase: loadQuotes } = useQuoteStore();
  const { organizations, loadFromSupabase: loadCrm } = useCrmStore();
  const { createInvoiceFromOrder } = useInvoiceStore();

  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // Shipping form state
  const [shipToAddress, setShipToAddress] = useState("");
  const [shipToCity, setShipToCity] = useState("");
  const [shipToState, setShipToState] = useState("");
  const [shipToZip, setShipToZip] = useState("");
  const [requestedShipDate, setRequestedShipDate] = useState("");
  const [actualShipDate, setActualShipDate] = useState("");

  useEffect(() => {
    setMounted(true);
    loadOrders();
    loadQuotes();
    loadCrm();
  }, [loadOrders, loadQuotes, loadCrm]);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  const quote = useMemo(
    () => (order ? quotes.find((q) => q.id === order.quoteId) : undefined),
    [quotes, order]
  );

  const org = useMemo(
    () =>
      order?.organizationId
        ? organizations.find((o) => o.id === order.organizationId)
        : undefined,
    [organizations, order]
  );

  // Initialize shipping form when order loads
  useEffect(() => {
    if (order) {
      setShipToAddress(order.shipToAddress || "");
      setShipToCity(order.shipToCity || "");
      setShipToState(order.shipToState || "");
      setShipToZip(order.shipToZip || "");
      setRequestedShipDate(order.requestedShipDate || "");
      setActualShipDate(order.actualShipDate || "");
    }
  }, [order]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    await updateOrder(order.id, { status: newStatus as OrderStatus });
  };

  const handleSaveShipping = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrder(order.id, {
        shipToAddress: shipToAddress || undefined,
        shipToCity: shipToCity || undefined,
        shipToState: shipToState || undefined,
        shipToZip: shipToZip || undefined,
        requestedShipDate: requestedShipDate || undefined,
        actualShipDate: actualShipDate || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!order || !quote) return;
    setCreatingInvoice(true);
    try {
      const invoiceId = await createInvoiceFromOrder(order.id, {
        organizationId: order.organizationId,
        subtotal: quote.subtotal,
        freight: quote.freightCost,
        tax: quote.taxAmount,
        total: quote.total,
      });
      router.push(`/invoices/${invoiceId}`);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const canCreateInvoice =
    order &&
    ["shipped", "delivered", "completed"].includes(order.status);

  if (!mounted) {
    return (
      <div>
        <Header title="Order Detail" />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Header title="Order Not Found" />
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">
              This order could not be found.
            </p>
            <Link href="/orders">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back link */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Orders
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {order.orderNumber || "Order"}
          </h1>
          {org && (
            <p className="mt-1 text-sm text-slate-500">{org.name}</p>
          )}
        </div>
        {canCreateInvoice && (
          <Button
            onClick={handleCreateInvoice}
            disabled={creatingInvoice}
          >
            <Receipt className="h-4 w-4 mr-1" />
            {creatingInvoice ? "Creating..." : "Create Invoice"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — order info + linked quote */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-400" />
                  Order Information
                </h2>
                <Badge variant={statusBadge[order.status]}>
                  {statusLabel[order.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Order Number</p>
                  <p className="font-mono font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">PO Number</p>
                  <p className="font-medium">{order.poNumber || "--"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Created</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Requested Ship Date</p>
                  <p>
                    {order.requestedShipDate
                      ? formatDate(order.requestedShipDate)
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Actual Ship Date</p>
                  <p>
                    {order.actualShipDate
                      ? formatDate(order.actualShipDate)
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Organization</p>
                  <p>{org?.name || "--"}</p>
                </div>
              </div>

              {/* Status Workflow */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Update Status
                </label>
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Linked Quote Card */}
          {quote && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Linked Quote
                  </h2>
                  <Link href={`/quote/${quote.id}`}>
                    <Button variant="outline" size="sm">
                      View Quote
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-500">Quote Number</p>
                    <p className="font-mono font-medium">
                      {quote.quoteNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Customer</p>
                    <p className="font-medium">{quote.customer.name}</p>
                    <p className="text-slate-500 text-xs">
                      {quote.customer.company}
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                {quote.lineItems.length > 0 && (
                  <div className="overflow-x-auto mt-4">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Description</th>
                          <th className="text-right">Qty</th>
                          <th className="text-right">Net Price</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="font-mono text-sm">
                              {item.sku}
                            </td>
                            <td className="text-sm">{item.description}</td>
                            <td className="text-right text-sm">
                              {item.quantity}
                            </td>
                            <td className="text-right text-sm">
                              {formatCurrency(item.netPrice)}
                            </td>
                            <td className="text-right text-sm font-medium">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Quote Totals */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  {quote.freightCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Freight</span>
                      <span>{formatCurrency(quote.freightCost)}</span>
                    </div>
                  )}
                  {quote.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax</span>
                      <span>{formatCurrency(quote.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-1 border-t border-slate-100">
                    <span>Total</span>
                    <span className="price">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — shipping + notes */}
        <div className="space-y-6">
          {/* Shipping Info Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-slate-400" />
                Shipping Information
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <Input
                    value={shipToAddress}
                    onChange={(e) => setShipToAddress(e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <Input
                      value={shipToCity}
                      onChange={(e) => setShipToCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      State
                    </label>
                    <Input
                      value={shipToState}
                      onChange={(e) => setShipToState(e.target.value)}
                      placeholder="ST"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ZIP
                  </label>
                  <Input
                    value={shipToZip}
                    onChange={(e) => setShipToZip(e.target.value)}
                    placeholder="ZIP code"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Requested Ship Date
                  </label>
                  <Input
                    type="date"
                    value={requestedShipDate}
                    onChange={(e) => setRequestedShipDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Actual Ship Date
                  </label>
                  <Input
                    type="date"
                    value={actualShipDate}
                    onChange={(e) => setActualShipDate(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSaveShipping}
                  disabled={saving}
                  className="w-full mt-2"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saving..." : "Save Shipping Info"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Notes
              </h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {order.notes || "No notes."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
