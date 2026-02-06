"use client";

import { useState } from "react";
import { useQuoteStore } from "@/store/quote-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  freightZones,
  getZoneForState,
  stateNames,
  type FreightZone,
} from "@/data/freight-zones";
import { Truck, Percent, DollarSign, Calculator } from "lucide-react";

export function TotalsStep() {
  const { draftQuote, setDraftQuote } = useQuoteStore();

  const lineItems = draftQuote?.lineItems ?? [];
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Local state for totals fields
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState("");

  // Compute freight
  const zone = selectedState ? getZoneForState(selectedState) : undefined;
  const freightCost = computeFreight(zone, subtotal);

  // Compute discount
  const discountAmount =
    discountType === "percentage"
      ? subtotal * (discountValue / 100)
      : discountValue;

  // Compute tax
  const taxableAmount = subtotal - discountAmount + freightCost;
  const taxAmount = taxEnabled ? taxableAmount * (taxRate / 100) : 0;

  // Grand total
  const grandTotal = subtotal - discountAmount + freightCost + taxAmount;

  // Compute valid until date
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);

  // Sync to draft whenever values change
  function syncToDraft() {
    if (!draftQuote) return;
    setDraftQuote({
      ...draftQuote,
      _totals: {
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        freightZone: zone?.zone,
        freightCost,
        freightState: selectedState,
        taxEnabled,
        taxRate,
        taxAmount,
        grandTotal,
        validUntil: validUntil.toISOString(),
        notes,
      },
    } as typeof draftQuote & { _totals: unknown });
  }

  // Store totals on window for QuotePreview to access
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__quoteTotals = {
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      freightZone: zone?.zone,
      freightCost,
      freightState: selectedState,
      taxEnabled,
      taxRate,
      taxAmount,
      grandTotal,
      validUntil: validUntil.toISOString(),
      notes,
    };
  }

  // All states sorted
  const allStates = Object.entries(stateNames).sort(([, a], [, b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="space-y-6">
      {/* Subtotal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Subtotal</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additional Discount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Additional Discount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={discountType === "percentage" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("percentage")}
              >
                <Percent className="h-3.5 w-3.5 mr-1" />
                Percentage
              </Button>
              <Button
                variant={discountType === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("fixed")}
              >
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                Fixed Amount
              </Button>
            </div>
            <Input
              type="number"
              min={0}
              step={discountType === "percentage" ? 0.5 : 1}
              value={discountValue}
              onChange={(e) =>
                setDiscountValue(parseFloat(e.target.value) || 0)
              }
              placeholder={
                discountType === "percentage" ? "Discount %" : "Discount $"
              }
            />
            {discountAmount > 0 && (
              <p className="text-sm text-red-600">
                -{formatCurrency(discountAmount)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Freight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Freight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination state..." />
              </SelectTrigger>
              <SelectContent>
                {allStates.map(([abbr, name]) => (
                  <SelectItem key={abbr} value={abbr}>
                    {name} ({abbr})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {zone && (
              <div className="text-sm space-y-1">
                <p className="text-slate-600">
                  Zone {zone.zone} &mdash;{" "}
                  {freightCost === -1
                    ? "Must be quoted"
                    : freightCost === 0
                    ? "FREE"
                    : formatCurrency(freightCost)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-slate-700">Apply tax</span>
            </label>
            {taxEnabled && (
              <>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={taxRate}
                  onChange={(e) =>
                    setTaxRate(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Tax rate %"
                />
                <p className="text-sm text-slate-600">
                  Tax: {formatCurrency(taxAmount)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Valid Until */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Valid for (days)
            </label>
            <Input
              type="number"
              min={1}
              value={validDays}
              onChange={(e) =>
                setValidDays(parseInt(e.target.value) || 30)
              }
            />
            <p className="text-sm text-slate-500">
              Expires:{" "}
              {validUntil.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quote Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for this quote..."
            className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:border-brand-green"
          />
        </CardContent>
      </Card>

      {/* Grand Total */}
      <Card className="border-brand-green border-2">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {freightCost > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Freight (Zone {zone?.zone})</span>
                <span>{formatCurrency(freightCost)}</span>
              </div>
            )}
            {freightCost === 0 && selectedState && zone && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Freight (Zone {zone.zone})</span>
                <span>FREE</span>
              </div>
            )}
            {freightCost === -1 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Freight (Zone 5)</span>
                <span>Must be quoted</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="text-lg font-bold text-slate-900">Grand Total</span>
              <span className="text-lg font-bold text-brand-green">
                {freightCost === -1
                  ? "Pending freight quote"
                  : formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function computeFreight(zone: FreightZone | undefined, subtotal: number): number {
  if (!zone) return 0;

  let bracket: keyof FreightZone["pricing"];
  if (subtotal >= 10000) bracket = "over10k";
  else if (subtotal >= 7500) bracket = "over7_5k";
  else if (subtotal >= 5000) bracket = "over5k";
  else if (subtotal >= 3000) bracket = "over3k";
  else bracket = "under3k";

  const value = zone.pricing[bracket];
  if (value === "FREE") return 0;
  if (value === "Quote") return -1; // Sentinel: must be quoted
  return parseInt(value.replace("$", "")) || 0;
}
