"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  type Organization,
  type OrganizationType,
} from "@/types/quote-builder";

interface OrgFormData {
  name: string;
  type: OrganizationType;
  defaultTier: DiscountTier;
  phone: string;
  email: string;
  address: string;
  website: string;
  notes: string;
}

const emptyForm: OrgFormData = {
  name: "",
  type: "end_customer",
  defaultTier: "50_20",
  phone: "",
  email: "",
  address: "",
  website: "",
  notes: "",
};

interface OrganizationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization | null;
  onSave: (data: OrgFormData) => void;
}

export function OrganizationForm({
  open,
  onOpenChange,
  organization,
  onSave,
}: OrganizationFormProps) {
  const [form, setForm] = useState<OrgFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name,
        type: organization.type,
        defaultTier: organization.defaultTier,
        phone: organization.phone || "",
        email: organization.email || "",
        address: organization.address || "",
        website: organization.website || "",
        notes: organization.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [organization, open]);

  function handleSave() {
    const newErrors: Record<string, boolean> = {};
    if (!form.name.trim()) newErrors.name = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSave(form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {organization ? "Edit Organization" : "Add Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Update organization information."
              : "Add a new organization to your CRM."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Organization name"
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Type</label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    type: val as OrganizationType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="end_customer">End Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Default Tier
              </label>
              <Select
                value={form.defaultTier}
                onValueChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    defaultTier: val as DiscountTier,
                  }))
                }
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Address
            </label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Street, City, State, ZIP"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Website
            </label>
            <Input
              value={form.website}
              onChange={(e) =>
                setForm((f) => ({ ...f, website: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Internal notes..."
              className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>
            {organization ? "Save Changes" : "Add Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
