"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrmStore } from "@/store/crm-store";
import { useQuoteStore } from "@/store/quote-store";
import { useAuth } from "@/components/providers/AuthProvider";
import { OrgDetailHeader } from "@/components/crm/OrgDetailHeader";
import { OrgDetailContacts } from "@/components/crm/OrgDetailContacts";
import { OrgDetailQuotes } from "@/components/crm/OrgDetailQuotes";
import { OrganizationForm } from "@/components/crm/OrganizationForm";
import { ContactForm } from "@/components/crm/ContactForm";
import { ActivityFeed } from "@/components/crm/ActivityFeed";
import { ActivityForm } from "@/components/crm/ActivityForm";
import type { Contact, ActivityType, Organization } from "@/types/quote-builder";
import { Activity as ActivityIcon } from "lucide-react";

export default function OrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const { isAdmin } = useAuth();

  const [mounted, setMounted] = useState(false);
  const {
    organizations,
    contacts,
    activities,
    loadFromSupabase: loadCrm,
    updateOrganization,
    addContact,
    updateContact,
    deleteContact,
    addActivity,
  } = useCrmStore();
  const { quotes, loadFromSupabase: loadQuotes } = useQuoteStore();

  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    setMounted(true);
    loadCrm();
    loadQuotes();
  }, [loadCrm, loadQuotes]);

  const organization = organizations.find((o) => o.id === orgId);
  const orgContacts = contacts.filter((c) => c.organizationId === orgId);
  const orgQuotes = quotes.filter(
    (q) => organization && q.customer.company === organization.name
  );
  const orgActivities = activities.filter((a) => a.organizationId === orgId);

  if (!mounted) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />;
  }

  if (!organization) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-slate-600">
          Organization not found.
        </p>
        <button
          onClick={() => router.push("/quote/crm")}
          className="text-sm text-brand-green hover:underline mt-2"
        >
          Back to CRM
        </button>
      </div>
    );
  }

  function handleSaveOrg(data: {
    name: string;
    type: "dealer" | "end_customer";
    defaultTier: Organization["defaultTier"];
    phone: string;
    email: string;
    address: string;
    website: string;
    notes: string;
  }) {
    updateOrganization(orgId, {
      name: data.name.trim(),
      type: data.type,
      defaultTier: data.defaultTier,
      phone: data.phone.trim() || undefined,
      email: data.email.trim() || undefined,
      address: data.address.trim() || undefined,
      website: data.website.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
  }

  function handleSaveContact(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    title: string;
    organizationId: string;
    isPrimary: boolean;
    notes: string;
  }) {
    if (editingContact) {
      updateContact(editingContact.id, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim() || undefined,
        phone: data.phone.trim() || undefined,
        role: data.role.trim() || undefined,
        title: data.title.trim() || undefined,
        isPrimary: data.isPrimary,
        notes: data.notes.trim() || undefined,
      });
    } else {
      addContact({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim() || undefined,
        phone: data.phone.trim() || undefined,
        role: data.role.trim() || undefined,
        title: data.title.trim() || undefined,
        organizationId: orgId,
        isPrimary: data.isPrimary,
        notes: data.notes.trim() || undefined,
      });
    }
    setEditingContact(null);
  }

  function handleAddActivity(type: ActivityType, content: string) {
    addActivity({ type, content, organizationId: orgId });
  }

  return (
    <div>
      <OrgDetailHeader
        organization={organization}
        onEdit={() => setOrgDialogOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Contacts + Quotes */}
        <div className="lg:col-span-2 space-y-6">
          <OrgDetailContacts
            contacts={orgContacts}
            onAdd={() => {
              setEditingContact(null);
              setContactDialogOpen(true);
            }}
            onEdit={(contact) => {
              setEditingContact(contact);
              setContactDialogOpen(true);
            }}
            onDelete={deleteContact}
            canDelete={isAdmin}
          />
          <OrgDetailQuotes quotes={orgQuotes} />
        </div>

        {/* Right column: Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ActivityIcon className="h-4.5 w-4.5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityForm onSubmit={handleAddActivity} />
              <ActivityFeed
                activities={orgActivities}
                organizations={organizations}
                contacts={contacts}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <OrganizationForm
        open={orgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        organization={organization}
        onSave={handleSaveOrg}
      />

      <ContactForm
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contact={editingContact}
        organizations={organizations}
        defaultOrgId={orgId}
        onSave={handleSaveContact}
      />
    </div>
  );
}
