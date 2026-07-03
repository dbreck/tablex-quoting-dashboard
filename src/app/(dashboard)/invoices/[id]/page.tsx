"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useInvoiceStore } from "@/store/invoice-store";
import { useOrderStore } from "@/store/order-store";
import { useQuoteStore } from "@/store/quote-store";
import { useCrmStore } from "@/store/crm-store";
import type { InvoiceStatus } from "@/types/quote-builder";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Receipt,
  FileText,
  Package,
  DollarSign,
  Send,
  CreditCard,
  Calendar,
} from "lucide-react";

const statusBadge: Record<string, "secondary" | "info" | "success" | "error"> = {
  draft: "secondary",
  sent: "info",
  paid: "success",
  overdue: "error",
  void: "secondary",
};

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Void" },
];

// Hydration-safe "mounted" flag: false on the server/hydration render, true
// immediately after mount — same render sequence as the old setState-in-effect
// pattern, without the effect.
const emptySubscribe = () => () => {};

export default function InvoiceDetailPage() {
  const params = useParams();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { invoices, updateInvoice, loadFromSupabase: loadInvoices } = useInvoiceStore();
  const { orders, loadFromSupabase: loadOrders } = useOrderStore();
  const { quotes, loadFromSupabase: loadQuotes } = useQuoteStore();
  const { organizations, loadFromSupabase: loadCrm } = useCrmStore();

  // Payment fields for marking as paid
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  const [paidDate, setPaidDate] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const invoiceId = params.id as string;

  useEffect(() => {
    loadInvoices();
    loadOrders();
    loadQuotes();
    loadCrm();
  }, [loadInvoices, loadOrders, loadQuotes, loadCrm]);

  const invoice = invoices.find((inv) => inv.id === invoiceId);
  const order = invoice ? orders.find((o) => o.id === invoice.orderId) : undefined;
  const quote = order ? quotes.find((q) => q.id === order.quoteId) : undefined;
  const org = invoice?.organizationId
    ? organizations.find((o) => o.id === invoice.organizationId)
    : undefined;

  if (!mounted) {
    return (
      <div>
        <Header title="Invoice Details" subtitle="Loading..." />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div>
        <Header title="Invoice Not Found" subtitle="" />
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">
              Invoice not found
            </p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              This invoice may have been deleted.
            </p>
            <Link href="/invoices">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleStatusChange(status: string) {
    if (status === "paid") {
      // Show payment fields instead of immediately updating
      setShowPaymentFields(true);
      setPaidDate(new Date().toISOString().split("T")[0]);
      setPaidAmount(String(invoice!.total));
      setPaymentMethod("");
      return;
    }
    setShowPaymentFields(false);
    await updateInvoice(invoiceId, { status: status as InvoiceStatus });
  }

  async function handleSendInvoice() {
    await updateInvoice(invoiceId, {
      status: "sent",
      sentAt: new Date().toISOString(),
    });
  }

  async function handleSavePayment() {
    await updateInvoice(invoiceId, {
      status: "paid",
      paidDate: paidDate || new Date().toISOString().split("T")[0],
      paidAmount: parseFloat(paidAmount) || invoice!.total,
      paymentMethod: paymentMethod || undefined,
    });
    setShowPaymentFields(false);
  }

  return (
    <div>
      <Header
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={`Created ${formatDate(invoice.createdAt)}`}
      />

      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Invoices
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          {invoice.status === "draft" && (
            <Button size="sm" onClick={handleSendInvoice}>
              <Send className="h-4 w-4 mr-1" />
              Send Invoice
            </Button>
          )}
          <span className="text-sm text-slate-500">Status:</span>
          <Select value={invoice.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoice Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Invoice #</span>
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <Badge variant={statusBadge[invoice.status]}>
                {invoice.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Created</span>
              <span>{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Date</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
            )}
            {invoice.sentAt && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sent</span>
                <span>{formatDate(invoice.sentAt)}</span>
              </div>
            )}
            {org && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Organization</span>
                <span>{org.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-brand-green border-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Freight</span>
              <span>{formatCurrency(invoice.freight)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-brand-green text-lg">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Linked Order */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Linked Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Order #</span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-mono text-brand-green hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </div>
                {order.poNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">PO #</span>
                    <span className="font-mono">{order.poNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Order Status</span>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Order not found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Info */}
      {(invoice.status === "paid" || showPaymentFields) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.status === "paid" && !showPaymentFields ? (
              <div className="space-y-2">
                {invoice.paidDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Paid Date</span>
                    <span>{formatDate(invoice.paidDate)}</span>
                  </div>
                )}
                {invoice.paidAmount != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Paid Amount</span>
                    <span className="font-semibold">
                      {formatCurrency(invoice.paidAmount)}
                    </span>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment Method</span>
                    <span>{invoice.paymentMethod}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Calendar className="h-3.5 w-3.5 inline mr-1" />
                      Paid Date
                    </label>
                    <Input
                      type="date"
                      value={paidDate}
                      onChange={(e) => setPaidDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                      Paid Amount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder={String(invoice.total)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <CreditCard className="h-3.5 w-3.5 inline mr-1" />
                      Payment Method
                    </label>
                    <Input
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g. Check, Wire, ACH"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentFields(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSavePayment}>
                    Save Payment
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Line Items from linked quote */}
      {quote && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              Line Items ({quote.lineItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">{item.sku}</td>
                      <td className="text-sm">{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="price">{formatCurrency(item.netPrice)}</td>
                      <td className="price font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
