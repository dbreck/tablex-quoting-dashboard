"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useQuoteRequestStore } from "@/store/quote-request-store";

interface ConfigSnapshot {
  seriesCode: string;
  seriesName: string;
  shapeCode: string;
  shapeName: string;
  size: string;
  baseCode: string;
  baseName: string;
  baseFinish: string;
  topMaterial: string;
  topFinish: string;
  edgeType: string;
  quantity: number;
}

interface QuoteRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ConfigSnapshot;
  onSuccess?: () => void;
}

export function QuoteRequestModal({
  open,
  onOpenChange,
  config,
  onSuccess,
}: QuoteRequestModalProps) {
  const { addRequest } = useQuoteRequestStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function resetForm() {
    setForm({ firstName: "", lastName: "", email: "", phone: "", company: "" });
    setErrors({});
  }

  async function handleSubmit() {
    const newErrors: Record<string, boolean> = {};
    if (!form.firstName.trim()) newErrors.firstName = true;
    if (!form.lastName.trim()) newErrors.lastName = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await addRequest({
        contactFirstName: form.firstName.trim(),
        contactLastName: form.lastName.trim(),
        contactEmail: form.email.trim() || undefined,
        contactPhone: form.phone.trim() || undefined,
        contactCompany: form.company.trim() || undefined,
        seriesCode: config.seriesCode,
        seriesName: config.seriesName,
        shapeCode: config.shapeCode,
        size: config.size,
        baseCode: config.baseCode,
        baseFinish: config.baseFinish,
        topMaterial: config.topMaterial,
        topFinish: config.topFinish,
        edgeType: config.edgeType,
        quantity: config.quantity,
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit quote request:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
          <DialogDescription>
            Enter your contact info and we&apos;ll prepare a custom quote.
          </DialogDescription>
        </DialogHeader>

        {/* Configuration summary */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Configuration
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{config.seriesName}</Badge>
            <Badge variant="secondary">{config.shapeName}</Badge>
            <Badge variant="secondary">{config.size}</Badge>
            <Badge variant="secondary">{config.baseName}</Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
            <span>Base: {config.baseFinish}</span>
            <span>Top: {config.topFinish}</span>
            <span>Edge: {config.edgeType}</span>
          </div>
          <p className="text-sm font-medium text-slate-700">
            Qty: {config.quantity}
          </p>
        </div>

        {/* Contact form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                placeholder="First name"
                error={errors.firstName}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                placeholder="Last name"
                error={errors.lastName}
              />
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
              Company
            </label>
            <Input
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
              placeholder="Company name"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
