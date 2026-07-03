"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuoteStore } from "@/store/quote-store";
import { useOrderStore } from "@/store/order-store";
import { useCrmStore } from "@/store/crm-store";
import { useQuoteRequestStore } from "@/store/quote-request-store";
import { DISCOUNT_TIER_LABELS, type QuoteStatus } from "@/types/quote-builder";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  ShoppingCart,
  ExternalLink,
  Inbox,
} from "lucide-react";

const statusBadge: Record<string, "secondary" | "info" | "success" | "error"> = {
  draft: "secondary",
  sent: "info",
  accepted: "success",
  rejected: "error",
};

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { quotes, updateQuote, loadFromSupabase: loadQuotes } = useQuoteStore();
  const { createOrderFromQuote, getOrderByQuoteId, loadFromSupabase: loadOrders } = useOrderStore();
  const { organizations, loadFromSupabase: loadCrm } = useCrmStore();
  const { requests: quoteRequests, loadFromSupabase: loadRequests } = useQuoteRequestStore();
  const [notes, setNotes] = useState("");

  // Convert to Order dialog state
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [shipToCity, setShipToCity] = useState("");
  const [shipToState, setShipToState] = useState("");
  const [shipToZip, setShipToZip] = useState("");
  const [requestedShipDate, setRequestedShipDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const quoteId = params.id as string;

  useEffect(() => {
    setMounted(true);
    loadQuotes();
    loadOrders();
    loadCrm();
    loadRequests();
  }, [loadQuotes, loadOrders, loadCrm, loadRequests]);

  const quote = quotes.find((q) => q.id === quoteId);
  const existingOrder = getOrderByQuoteId(quoteId);
  const org = quote
    ? organizations.find((o) => o.name === quote.customer.company)
    : undefined;
  const linkedRequest = quote?.quoteRequestId
    ? quoteRequests.find((r) => r.id === quote.quoteRequestId)
    : undefined;

  useEffect(() => {
    if (quote?.notes) {
      setNotes(quote.notes);
    }
  }, [quote?.notes]);

  if (!mounted) {
    return (
      <div>
        <Header title="Quote Details" subtitle="Loading..." />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div>
        <Header title="Quote Not Found" subtitle="" />
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">
              Quote not found
            </p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              This quote may have been deleted.
            </p>
            <Link href="/quote/list">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Quotes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleStatusChange(status: string) {
    updateQuote(quoteId, { status: status as QuoteStatus });
  }

  function handleNotesUpdate() {
    updateQuote(quoteId, { notes });
  }

  async function handleConvertToOrder() {
    setConvertLoading(true);
    try {
      const newOrderId = await createOrderFromQuote(quoteId, {
        organizationId: org?.id,
        poNumber: poNumber || undefined,
        shipToAddress: shipToAddress || undefined,
        shipToCity: shipToCity || undefined,
        shipToState: shipToState || undefined,
        shipToZip: shipToZip || undefined,
        requestedShipDate: requestedShipDate || undefined,
        notes: orderNotes || undefined,
      });
      setShowConvertDialog(false);
      router.push(`/orders/${newOrderId}`);
    } catch (err) {
      console.error("Failed to create order:", err);
    } finally {
      setConvertLoading(false);
    }
  }

  return (
    <div>
      <Header
        title={`Quote ${quote.quoteNumber}`}
        subtitle={`Created ${formatDate(quote.createdAt)}`}
      />

      {/* Back + Status */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/quote/list">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Quotes
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          {/* Convert to Order or View Order */}
          {quote.status === "accepted" && !existingOrder && (
            <Button size="sm" onClick={() => setShowConvertDialog(true)}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Convert to Order
            </Button>
          )}
          {existingOrder && (
            <Link href={`/orders/${existingOrder.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Order {existingOrder.orderNumber}
              </Button>
            </Link>
          )}
          <span className="text-sm text-slate-500">Status:</span>
          <Select value={quote.status} onValueChange={handleStatusChange}>
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
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold text-slate-900">
              {quote.customer.name || <span className="text-slate-400">&mdash;</span>}
            </p>
            {quote.customer.company ? (
              <p className="text-sm text-slate-600 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {quote.customer.company}
              </p>
            ) : null}
            {quote.customer.email && (
              <p className="text-sm text-slate-600 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {quote.customer.email}
              </p>
            )}
            {quote.customer.phone && (
              <p className="text-sm text-slate-600 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {quote.customer.phone}
              </p>
            )}
            <div className="pt-2">
              <Badge variant="default">
                Tier: {DISCOUNT_TIER_LABELS[quote.discountTier]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quote Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quote Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Quote #</span>
              <span className="font-mono">{quote.quoteNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <Badge variant={statusBadge[quote.status]}>
                {quote.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Items</span>
              <span>{quote.lineItems.length || <span className="text-slate-400">&mdash;</span>}</span>
            </div>
            {quote.projectName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Project</span>
                <span>{quote.projectName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Created</span>
              <span>{formatDate(quote.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Valid Until</span>
              <span>{quote.validUntil ? formatDate(quote.validUntil) : <span className="text-slate-400">&mdash;</span>}</span>
            </div>
            {linkedRequest && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">From Request</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-green">
                  <Inbox className="h-3 w-3" />
                  {linkedRequest.requestNumber}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="border-brand-green border-2">
          <CardHeader>
            <CardTitle className="text-base">Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span>{quote.subtotal > 0 ? formatCurrency(quote.subtotal) : <span className="text-slate-400">&mdash;</span>}</span>
            </div>
            {quote.additionalDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span>-{formatCurrency(quote.additionalDiscount)}</span>
              </div>
            )}
            {quote.freightCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Freight{quote.freightZone ? ` (Zone ${quote.freightZone})` : ""}
                </span>
                <span>{formatCurrency(quote.freightCost)}</span>
              </div>
            )}
            {quote.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Tax ({quote.taxRate}%)
                </span>
                <span>{formatCurrency(quote.taxAmount)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-brand-green text-lg">
                {quote.total > 0 ? formatCurrency(quote.total) : <span className="text-slate-400">&mdash;</span>}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Line Items{quote.lineItems.length > 0 ? ` (${quote.lineItems.length})` : ""}
          </CardTitle>
        </CardHeader>
        {quote.lineItems.length > 0 ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Description</th>
                    <th>Series</th>
                    <th>Shape</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>List Price</th>
                    <th>Net Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">{item.sku}</td>
                      <td className="text-sm">{item.description}</td>
                      <td className="text-sm text-slate-600">{item.series || "-"}</td>
                      <td className="text-sm text-slate-600">{item.shape || "-"}</td>
                      <td className="text-sm text-slate-600">{item.size || "-"}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="price text-slate-500">{formatCurrency(item.listPrice)}</td>
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
        ) : (
          <CardContent>
            <p className="text-sm text-slate-400 text-center py-6">
              No line items on this quote.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes to this quote..."
            className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:border-brand-green"
          />
          <div className="flex justify-end mt-3">
            <Button size="sm" onClick={handleNotesUpdate}>
              Update Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Convert to Order Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Order</DialogTitle>
            <DialogDescription>
              Create a new order from quote {quote.quoteNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PO Number
              </label>
              <Input
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Customer PO number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ship To Address
              </label>
              <Input
                value={shipToAddress}
                onChange={(e) => setShipToAddress(e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ZIP
                </label>
                <Input
                  value={shipToZip}
                  onChange={(e) => setShipToZip(e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </div>
            <div>
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
                Notes
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Additional notes for this order..."
                className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:border-brand-green"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConvertDialog(false)}
              disabled={convertLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleConvertToOrder} disabled={convertLoading}>
              {convertLoading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
