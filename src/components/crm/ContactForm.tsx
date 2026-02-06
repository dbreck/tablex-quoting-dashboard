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
import type { Contact, Organization } from "@/types/quote-builder";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  title: string;
  organizationId: string;
  isPrimary: boolean;
  notes: string;
}

const emptyForm: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  title: "",
  organizationId: "",
  isPrimary: false,
  notes: "",
};

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  organizations: Organization[];
  defaultOrgId?: string;
  onSave: (data: ContactFormData) => void;
}

export function ContactForm({
  open,
  onOpenChange,
  contact,
  organizations,
  defaultOrgId,
  onSave,
}: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (contact) {
      setForm({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || "",
        phone: contact.phone || "",
        role: contact.role || "",
        title: contact.title || "",
        organizationId: contact.organizationId,
        isPrimary: contact.isPrimary,
        notes: contact.notes || "",
      });
    } else {
      setForm({ ...emptyForm, organizationId: defaultOrgId || "" });
    }
    setErrors({});
  }, [contact, open, defaultOrgId]);

  function handleSave() {
    const newErrors: Record<string, boolean> = {};
    if (!form.firstName.trim()) newErrors.firstName = true;
    if (!form.lastName.trim()) newErrors.lastName = true;
    if (!form.organizationId) newErrors.organizationId = true;
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
            {contact ? "Edit Contact" : "Add Contact"}
          </DialogTitle>
          <DialogDescription>
            {contact
              ? "Update contact information."
              : "Add a new contact to an organization."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Organization <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.organizationId}
              onValueChange={(val) =>
                setForm((f) => ({ ...f, organizationId: val }))
              }
            >
              <SelectTrigger className={errors.organizationId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select organization..." />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Input
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                placeholder="Sales Rep, Buyer..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Title
              </label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="VP of Procurement..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={form.isPrimary}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPrimary: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
            />
            <label
              htmlFor="isPrimary"
              className="text-sm font-medium text-slate-700"
            >
              Primary contact
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Notes about this contact..."
              className="flex min-h-[60px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>
            {contact ? "Save Changes" : "Add Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
