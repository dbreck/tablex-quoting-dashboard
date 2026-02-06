"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuoteStore } from "@/store/quote-store";
import { DISCOUNT_TIER_LABELS, type QuoteStatus } from "@/types/quote-builder";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Calendar,
  Truck,
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
  const { quotes, updateQuote } = useQuoteStore();
  const [notes, setNotes] = useState("");

  const quoteId = params.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  const quote = quotes.find((q) => q.id === quoteId);

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
              {quote.customer.name}
            </p>
            <p className="text-sm text-slate-600 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {quote.customer.company}
            </p>
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
              <span>{quote.lineItems.length}</span>
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
              <span>{formatDate(quote.validUntil)}</span>
            </div>
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
              <span>{formatCurrency(quote.subtotal)}</span>
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
                {formatCurrency(quote.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
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
                  <th>Notes</th>
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
                    <td className="text-sm text-slate-500">
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
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
    </div>
  );
}
