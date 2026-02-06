"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
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
import { useQuoteStore } from "@/store/quote-store";
import {
  DISCOUNT_TIER_LABELS,
  type DiscountTier,
  type QuoteCustomer,
} from "@/types/quote-builder";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Building2,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

interface CustomerForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  defaultTier: DiscountTier;
}

const emptyForm: CustomerForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  defaultTier: "50_20",
};

export default function CustomersPage() {
  const [mounted, setMounted] = useState(false);
  const { customers, quotes, addCustomer, updateCustomer, deleteCustomer } =
    useQuoteStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  function getQuoteCount(customerId: string): number {
    return quotes.filter((q) => q.customer.id === customerId).length;
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(customer: QuoteCustomer) {
    setForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone || "",
      defaultTier: customer.defaultTier,
    });
    setEditingId(customer.id);
    setErrors({});
    setDialogOpen(true);
  }

  function openDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function handleSave() {
    const newErrors: Record<string, boolean> = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.company.trim()) newErrors.company = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editingId) {
      updateCustomer(editingId, {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        defaultTier: form.defaultTier,
      });
    } else {
      addCustomer({
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        defaultTier: form.defaultTier,
      });
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    if (deletingId) {
      deleteCustomer(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  }

  if (!mounted) {
    return (
      <div>
        <Header title="Customers" subtitle="Manage your customer list" />
        <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Customers"
        subtitle={`${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
      />

      <div className="flex justify-end mb-6">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Customer
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">
              No customers yet
            </p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Add your first customer to get started.
            </p>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => {
            const quoteCount = getQuoteCount(customer.id);
            return (
              <Card key={customer.id} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {customer.name}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {customer.company}
                      </p>
                    </div>
                    <Badge variant="default">
                      {DISCOUNT_TIER_LABELS[customer.defaultTier]}
                    </Badge>
                  </div>

                  {customer.email && (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      {customer.email}
                    </p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <Phone className="h-3.5 w-3.5" />
                      {customer.phone}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {quoteCount} quote{quoteCount !== 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(customer)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(customer.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update customer information."
                : "Add a new customer to your list."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Contact name"
                error={errors.name}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Company <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                placeholder="Company name"
                error={errors.company}
              />
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Default Discount Tier
              </label>
              <Select
                value={form.defaultTier}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, defaultTier: val as DiscountTier }))
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

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
