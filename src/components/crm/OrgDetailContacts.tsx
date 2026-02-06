"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/quote-builder";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Star,
} from "lucide-react";

interface OrgDetailContactsProps {
  contacts: Contact[];
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export function OrgDetailContacts({
  contacts,
  onAdd,
  onEdit,
  onDelete,
}: OrgDetailContactsProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4.5 w-4.5" />
          Contacts ({contacts.length})
        </CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Contact
        </Button>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No contacts yet. Add your first contact.
          </p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-slate-900 text-sm">
                      {contact.firstName} {contact.lastName}
                    </p>
                    {contact.isPrimary && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    )}
                    {contact.role && (
                      <Badge variant="secondary" className="text-[10px]">
                        {contact.role}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {contact.email && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(contact)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(contact.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
