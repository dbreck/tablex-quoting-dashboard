"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Contact, Organization } from "@/types/quote-builder";
import { Pencil, Trash2, Search, Star } from "lucide-react";

interface ContactTableProps {
  contacts: Contact[];
  organizations: Organization[];
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  canDelete?: boolean;
}

export function ContactTable({
  contacts,
  organizations,
  onEdit,
  onDelete,
  canDelete = true,
}: ContactTableProps) {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");

  const orgMap = new Map(organizations.map((o) => [o.id, o]));

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.role?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesOrg = orgFilter === "all" || c.organizationId === orgFilter;
    return matchesSearch && matchesOrg;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9"
          />
        </div>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left font-medium text-slate-500 px-4 py-3">
                Name
              </th>
              <th className="text-left font-medium text-slate-500 px-4 py-3">
                Organization
              </th>
              <th className="text-left font-medium text-slate-500 px-4 py-3">
                Email
              </th>
              <th className="text-left font-medium text-slate-500 px-4 py-3">
                Phone
              </th>
              <th className="text-left font-medium text-slate-500 px-4 py-3">
                Role
              </th>
              <th className="text-right font-medium text-slate-500 px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No contacts found.
                </td>
              </tr>
            ) : (
              filtered.map((contact) => {
                const org = orgMap.get(contact.organizationId);
                return (
                  <tr
                    key={contact.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.isPrimary && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {org?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {contact.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {contact.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {contact.role ? (
                        <Badge variant="secondary">{contact.role}</Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(contact)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(contact.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
