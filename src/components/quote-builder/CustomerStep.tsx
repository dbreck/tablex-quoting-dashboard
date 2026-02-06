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
import {
  DISCOUNT_TIER_LABELS,
  type DiscountTier,
  type QuoteCustomer,
} from "@/types/quote-builder";
import { User, Building2, Mail, Phone, UserPlus } from "lucide-react";

export function CustomerStep() {
  const { draftQuote, setDraftQuote, customers } = useQuoteStore();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const customer = draftQuote?.customer ?? {};

  function updateField(field: keyof QuoteCustomer, value: string) {
    if (!draftQuote) return;
    setDraftQuote({
      ...draftQuote,
      customer: { ...draftQuote.customer, [field]: value },
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  }

  function selectExistingCustomer(customerId: string) {
    if (!draftQuote) return;
    const existing = customers.find((c) => c.id === customerId);
    if (!existing) return;
    setDraftQuote({
      ...draftQuote,
      customer: { ...existing },
      discountTier: existing.defaultTier,
    });
    setErrors({});
  }

  function updateTier(tier: DiscountTier) {
    if (!draftQuote) return;
    setDraftQuote({
      ...draftQuote,
      discountTier: tier,
      customer: { ...draftQuote.customer, defaultTier: tier },
    });
  }

  function updateProjectName(value: string) {
    if (!draftQuote) return;
    setDraftQuote({ ...draftQuote, projectName: value });
  }

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!customer.name?.trim()) newErrors.name = true;
    if (!customer.company?.trim()) newErrors.company = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      {/* Select Existing Customer */}
      {customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Select Existing Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={selectExistingCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Customer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={customer.name ?? ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Contact name"
                error={errors.name}
              />
              {errors.name && (
                <p className="text-xs text-red-500">Name is required</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Company <span className="text-red-500">*</span>
              </label>
              <Input
                value={customer.company ?? ""}
                onChange={(e) => updateField("company", e.target.value)}
                placeholder="Company name"
                error={errors.company}
              />
              {errors.company && (
                <p className="text-xs text-red-500">Company is required</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <Input
                type="email"
                value={customer.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </label>
              <Input
                value={customer.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Project Name
            </label>
            <Input
              value={draftQuote?.projectName ?? ""}
              onChange={(e) => updateProjectName(e.target.value)}
              placeholder="Optional project name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Discount Tier
            </label>
            <Select
              value={draftQuote?.discountTier ?? "50_20"}
              onValueChange={(val) => updateTier(val as DiscountTier)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(DISCOUNT_TIER_LABELS) as [
                    DiscountTier,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
