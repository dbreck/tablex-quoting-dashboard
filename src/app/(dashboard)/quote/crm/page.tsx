"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useCrmStore } from "@/store/crm-store";
import { useQuoteStore } from "@/store/quote-store";
import { OrganizationCard } from "@/components/crm/OrganizationCard";
import { OrganizationForm } from "@/components/crm/OrganizationForm";
import { ContactTable } from "@/components/crm/ContactTable";
import { ContactForm } from "@/components/crm/ContactForm";
import { ActivityFeed } from "@/components/crm/ActivityFeed";
import { ActivityForm } from "@/components/crm/ActivityForm";
import type {
  Organization,
  Contact,
  ActivityType,
} from "@/types/quote-builder";
import {
  Plus,
  Search,
  Building2,
  Users,
  Activity as ActivityIcon,
} from "lucide-react";

export default function CrmPage() {
  const [mounted, setMounted] = useState(false);
  const {
    organizations,
    contacts,
    activities,
    seedDealers,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addContact,
    updateContact,
    deleteContact,
    addActivity,
  } = useCrmStore();
  const { quotes } = useQuoteStore();

  const [orgSearch, setOrgSearch] = useState("");
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    setMounted(true);
    seedDealers();
  }, [seedDealers]);

  function getContactCount(orgId: string): number {
    return contacts.filter((c) => c.organizationId === orgId).length;
  }

  function getQuoteCount(orgName: string): number {
    return quotes.filter((q) => q.customer.company === orgName).length;
  }

  const filteredOrgs = organizations.filter(
    (o) =>
      !orgSearch ||
      o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

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
    if (editingOrg) {
      updateOrganization(editingOrg.id, {
        name: data.name.trim(),
        type: data.type,
        defaultTier: data.defaultTier,
        phone: data.phone.trim() || undefined,
        email: data.email.trim() || undefined,
        address: data.address.trim() || undefined,
        website: data.website.trim() || undefined,
        notes: data.notes.trim() || undefined,
      });
    } else {
      addOrganization({
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
    setEditingOrg(null);
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
        organizationId: data.organizationId,
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
        organizationId: data.organizationId,
        isPrimary: data.isPrimary,
        notes: data.notes.trim() || undefined,
      });
    }
    setEditingContact(null);
  }

  function handleAddActivity(type: ActivityType, content: string) {
    addActivity({ type, content });
  }

  if (!mounted) {
    return (
      <div>
        <Header title="CRM" subtitle="Manage organizations and contacts" />
        <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="CRM"
        subtitle={`${organizations.length} organization${organizations.length !== 1 ? "s" : ""} · ${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
      />

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <ActivityIcon className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search organizations..."
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setEditingOrg(null);
                setOrgDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Organization
            </Button>
          </div>

          {filteredOrgs.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600">
                {orgSearch ? "No matching organizations" : "No organizations yet"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {orgSearch
                  ? "Try a different search term."
                  : "Organizations will be seeded from your dealer list."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrgs.map((org) => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  contactCount={getContactCount(org.id)}
                  quoteCount={getQuoteCount(org.name)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingContact(null);
                setContactDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </div>
          <ContactTable
            contacts={contacts}
            organizations={organizations}
            onEdit={(contact) => {
              setEditingContact(contact);
              setContactDialogOpen(true);
            }}
            onDelete={deleteContact}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="space-y-6">
            <ActivityForm onSubmit={handleAddActivity} />
            <ActivityFeed
              activities={activities}
              organizations={organizations}
              contacts={contacts}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <OrganizationForm
        open={orgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        organization={editingOrg}
        onSave={handleSaveOrg}
      />

      <ContactForm
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contact={editingContact}
        organizations={organizations}
        onSave={handleSaveContact}
      />
    </div>
  );
}
