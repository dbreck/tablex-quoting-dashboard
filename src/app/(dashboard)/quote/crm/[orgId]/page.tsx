"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
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
import type { Contact, ActivityType, Organization, OrganizationType } from "@/types/quote-builder";
import { OrganizationCard } from "@/components/crm/OrganizationCard";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Activity as ActivityIcon, Network, Store } from "lucide-react";

// Hydration-safe "mounted" flag: false on the server/hydration render, true
// immediately after mount — same render sequence as the old setState-in-effect
// pattern, without the effect.
const emptySubscribe = () => () => {};

export default function OrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const { isAdmin } = useAuth();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
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
    loadCrm();
    loadQuotes();
  }, [loadCrm, loadQuotes]);

  const organization = organizations.find((o) => o.id === orgId);
  const orgContacts = contacts.filter((c) => c.organizationId === orgId);
  const orgQuotes = quotes.filter(
    (q) => organization && q.customer.company === organization.name
  );
  const orgActivities = activities.filter((a) => a.organizationId === orgId);

  // Rep group / dealer hierarchy
  const parentOrg = organization?.parentOrganizationId
    ? organizations.find((o) => o.id === organization.parentOrganizationId) || null
    : null;
  const childDealers = organization?.type === "rep_group"
    ? organizations.filter((o) => o.parentOrganizationId === orgId)
    : [];
  const repGroups = organizations.filter((o) => o.type === "rep_group");

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
    type: OrganizationType;
    parentOrganizationId: string;
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
      parentOrganizationId: data.parentOrganizationId || undefined,
      phone: data.phone.trim() || undefined,
      email: data.email.trim() || undefined,
      address: data.address.trim() || undefined,
      website: data.website.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
  }

  function handleReassignRepGroup(newParentId: string) {
    const parentIdValue = newParentId === "__none__" ? undefined : newParentId;
    updateOrganization(orgId, { parentOrganizationId: parentIdValue });
    const newParent = parentIdValue
      ? organizations.find((o) => o.id === parentIdValue)
      : null;
    addActivity({
      type: "note",
      content: newParent
        ? `Reassigned to rep group: ${newParent.name}`
        : "Removed from rep group",
      organizationId: orgId,
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
        parentOrg={parentOrg}
      />

      {/* Dealers section for rep groups */}
      {organization.type === "rep_group" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4.5 w-4.5" />
              Dealers ({childDealers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {childDealers.length === 0 ? (
              <p className="text-sm text-slate-400">No dealers assigned to this rep group.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {childDealers.map((dealer) => (
                  <OrganizationCard
                    key={dealer.id}
                    organization={dealer}
                    contactCount={contacts.filter((c) => c.organizationId === dealer.id).length}
                    quoteCount={quotes.filter((q) => q.customer.company === dealer.name).length}
                    parentOrgName={organization.name}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reassign rep group for dealers */}
      {organization.type === "dealer" && repGroups.length > 0 && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <Network className="h-4 w-4 text-violet-600 shrink-0" />
          <span className="text-sm font-medium text-slate-700">Rep Group:</span>
          <Select
            value={organization.parentOrganizationId || "__none__"}
            onValueChange={handleReassignRepGroup}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {repGroups.map((rg) => (
                <SelectItem key={rg.id} value={rg.id}>
                  {rg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
