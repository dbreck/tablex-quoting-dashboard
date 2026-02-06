"use client";

import { useState, useEffect } from "react";
import { useQuoteStore } from "@/store/quote-store";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerStep } from "@/components/quote-builder/CustomerStep";
import { ProductSelector } from "@/components/quote-builder/ProductSelector";
import { LineItemsTable } from "@/components/quote-builder/LineItemsTable";
import { TotalsStep } from "@/components/quote-builder/TotalsStep";
import { QuotePreview } from "@/components/quote-builder/QuotePreview";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { DraftQuote } from "@/types/quote-builder";

const STEPS = [
  { id: "customer", label: "Customer", number: 1 },
  { id: "products", label: "Products", number: 2 },
  { id: "line-items", label: "Line Items", number: 3 },
  { id: "totals", label: "Totals", number: 4 },
  { id: "review", label: "Review", number: 5 },
];

export default function NewQuotePage() {
  const [mounted, setMounted] = useState(false);
  const { draftQuote, setDraftQuote } = useQuoteStore();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize draft on mount if none exists
  useEffect(() => {
    if (mounted && !draftQuote) {
      const draft: DraftQuote = {
        customer: {},
        discountTier: "50_20",
        lineItems: [],
        currentStep: 0,
      };
      setDraftQuote(draft);
    }
  }, [mounted, draftQuote, setDraftQuote]);

  if (!mounted) {
    return (
      <div>
        <Header title="New Quote" subtitle="Create a new quote" />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  function goNext() {
    setActiveStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  }

  function goBack() {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }

  return (
    <div>
      <Header title="New Quote" subtitle="Create a new quote step by step" />

      {/* Step Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    i === activeStep
                      ? "bg-brand-green/10 text-brand-green"
                      : i < activeStep
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      i === activeStep
                        ? "bg-brand-green text-white"
                        : i < activeStep
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {i < activeStep ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {step.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-8 mx-1 ${
                      i < activeStep ? "bg-emerald-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="mb-6">
        {activeStep === 0 && <CustomerStep />}
        {activeStep === 1 && <ProductSelector />}
        {activeStep === 2 && <LineItemsTable />}
        {activeStep === 3 && <TotalsStep />}
        {activeStep === 4 && <QuotePreview />}
      </div>

      {/* Navigation Buttons */}
      {activeStep < 4 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button onClick={goNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
