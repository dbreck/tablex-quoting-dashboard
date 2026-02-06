"use client";

import { useRouter } from "next/navigation";
import { useQuoteStore } from "@/store/quote-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DISCOUNT_TIER_LABELS } from "@/types/quote-builder";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Save, FileCheck } from "lucide-react";

interface QuoteTotals {
  subtotal: number;
  discountType: "percentage" | "fixed";
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

export function QuotePreview() {
  const router = useRouter();
  const { draftQuote, addQuote, setDraftQuote } = useQuoteStore();

  const customer = draftQuote?.customer;
  const lineItems = draftQuote?.lineItems ?? [];
  const tier = draftQuote?.discountTier ?? "50_20";

  // Read totals from window (set by TotalsStep)
  const totals: QuoteTotals =
    typeof window !== "undefined"
      ? ((window as unknown as Record<string, unknown>).__quoteTotals as QuoteTotals) ?? getDefaultTotals(lineItems)
      : getDefaultTotals(lineItems);

  const today = new Date().toISOString();
  const validUntil = totals.validUntil || new Date(Date.now() + 30 * 86400000).toISOString();

  function handleSave(status: "draft" | "sent") {
    if (!draftQuote || !customer?.name || !customer?.company) return;

    addQuote({
      customer: {
        id: customer.id || Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: customer.name,
        company: customer.company,
        email: customer.email || "",
        phone: customer.phone,
        defaultTier: tier,
        createdAt: customer.createdAt || today,
      },
      projectName: draftQuote.projectName,
      discountTier: tier,
      lineItems,
      subtotal: totals.subtotal,
      additionalDiscount: totals.discountAmount,
      additionalDiscountType: totals.discountType,
      freightZone: totals.freightZone,
      freightCost: Math.max(0, totals.freightCost),
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.grandTotal,
      status,
      notes: totals.notes || undefined,
      validUntil,
    });

    setDraftQuote(null);
    router.push("/quote/list");
  }

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-brand-navy">TableX Quote</h2>
              <p className="text-sm text-slate-500 mt-1">
                Date: {formatDate(today)}
              </p>
              <p className="text-sm text-slate-500">
                Valid Until: {formatDate(validUntil)}
              </p>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {DISCOUNT_TIER_LABELS[tier]}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Customer
            </h3>
            <p className="font-semibold text-slate-900">{customer?.name}</p>
            <p className="text-sm text-slate-600">{customer?.company}</p>
            {customer?.email && (
              <p className="text-sm text-slate-600">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-sm text-slate-600">{customer.phone}</p>
            )}
            {draftQuote?.projectName && (
              <p className="text-sm text-slate-500 mt-1">
                Project: {draftQuote.projectName}
              </p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Line Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-600">SKU</th>
                    <th className="text-left py-2 font-medium text-slate-600">Description</th>
                    <th className="text-right py-2 font-medium text-slate-600">Qty</th>
                    <th className="text-right py-2 font-medium text-slate-600">Unit Price</th>
                    <th className="text-right py-2 font-medium text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2 font-mono text-xs">{item.sku}</td>
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.netPrice)}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              {totals.freightCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Freight{totals.freightZone ? ` (Zone ${totals.freightZone})` : ""}
                  </span>
                  <span>{formatCurrency(totals.freightCost)}</span>
                </div>
              )}
              {totals.freightCost === 0 && totals.freightState && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Freight</span>
                  <span>FREE</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax ({totals.taxRate}%)</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-2 flex justify-between">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="font-bold text-brand-green text-lg">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {totals.notes && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Notes
              </h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{totals.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => handleSave("draft")}>
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button onClick={() => handleSave("sent")}>
          <FileCheck className="h-4 w-4 mr-2" />
          Save as Final
        </Button>
      </div>
    </div>
  );
}

function getDefaultTotals(
  lineItems: { totalPrice: number }[]
): QuoteTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  return {
    subtotal,
    discountType: "percentage",
    discountValue: 0,
    discountAmount: 0,
    freightCost: 0,
    taxEnabled: false,
    taxRate: 0,
    taxAmount: 0,
    grandTotal: subtotal,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    notes: "",
  };
}
