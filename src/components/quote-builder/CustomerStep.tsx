"use client";

import { useState, useEffect } from "react";
import { useQuoteStore } from "@/store/quote-store";
import { useCrmStore } from "@/store/crm-store";
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
import { User, Building2, Mail, Phone, UserPlus, Plus } from "lucide-react";

export function CustomerStep() {
  const { draftQuote, setDraftQuote } = useQuoteStore();
  const { organizations, contacts, loadFromSupabase: loadCrm } = useCrmStore();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");

  useEffect(() => {
    loadCrm();
  }, [loadCrm]);

  const customer = draftQuote?.customer ?? {};

  const orgContacts = selectedOrgId
    ? contacts.filter((c) => c.organizationId === selectedOrgId)
    : [];

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

  function selectOrganization(orgId: string) {
    if (!draftQuote) return;
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;
    setSelectedOrgId(orgId);
    setSelectedContactId("");
    setDraftQuote({
      ...draftQuote,
      customer: {
        ...draftQuote.customer,
        company: org.name,
        defaultTier: org.defaultTier,
      },
      discountTier: org.defaultTier,
    });
    setErrors({});
  }

  function selectContact(contactId: string) {
    if (!draftQuote) return;
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    setSelectedContactId(contactId);
    setDraftQuote({
      ...draftQuote,
      customer: {
        ...draftQuote.customer,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email || "",
        phone: contact.phone || "",
      },
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

  return (
    <div className="space-y-6">
      {/* Select from CRM Organizations */}
      {organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Select Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedOrgId} onValueChange={selectOrganization}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an organization..." />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                    {org.type === "dealer" ? " (Dealer)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Contact selector (shown after org selected) */}
            {selectedOrgId && orgContacts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Select Contact
                </label>
                <Select
                  value={selectedContactId}
                  onValueChange={selectContact}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orgContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                        {c.role ? ` — ${c.role}` : ""}
                        {c.isPrimary ? " (Primary)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOrgId && orgContacts.length === 0 && (
              <p className="text-xs text-slate-400">
                No contacts for this organization. Fill in details manually
                below.
              </p>
            )}
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
