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
import { useAuth } from "@/components/providers/AuthProvider";
import { OrganizationCard } from "@/components/crm/OrganizationCard";
import { OrganizationForm } from "@/components/crm/OrganizationForm";
import { ContactTable } from "@/components/crm/ContactTable";
import { ContactForm } from "@/components/crm/ContactForm";
import { ActivityFeed } from "@/components/crm/ActivityFeed";
import { ActivityForm } from "@/components/crm/ActivityForm";
import type {
  Organization,
  OrganizationType,
  Contact,
  ActivityType,
} from "@/types/quote-builder";
import {
  Plus,
  Search,
  Building2,
  Users,
  Activity as ActivityIcon,
  LayoutGrid,
  Network,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function CrmPage() {
  const [mounted, setMounted] = useState(false);
  const { isAdmin } = useAuth();
  const {
    organizations,
    contacts,
    activities,
    loadFromSupabase: loadCrm,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addContact,
    updateContact,
    deleteContact,
    addActivity,
  } = useCrmStore();
  const { quotes, loadFromSupabase: loadQuotes } = useQuoteStore();

  const [orgSearch, setOrgSearch] = useState("");
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("grouped");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    loadCrm();
    loadQuotes();
  }, [loadCrm, loadQuotes]);

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

  // Grouped view helpers
  const repGroups = filteredOrgs.filter((o) => o.type === "rep_group");
  const affiliatedDealerIds = new Set(
    filteredOrgs
      .filter((o) => o.parentOrganizationId)
      .map((o) => o.id)
  );
  const unaffiliatedOrgs = filteredOrgs.filter(
    (o) => o.type !== "rep_group" && !o.parentOrganizationId
  );

  function getChildDealers(repGroupId: string) {
    return filteredOrgs.filter((o) => o.parentOrganizationId === repGroupId);
  }

  function getChildDealerCount(repGroupId: string) {
    return organizations.filter((o) => o.parentOrganizationId === repGroupId).length;
  }

  function getParentOrgName(org: Organization) {
    if (!org.parentOrganizationId) return undefined;
    return organizations.find((o) => o.id === org.parentOrganizationId)?.name;
  }

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
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
    const orgPayload = {
      name: data.name.trim(),
      type: data.type,
      defaultTier: data.defaultTier,
      parentOrganizationId: data.parentOrganizationId || undefined,
      phone: data.phone.trim() || undefined,
      email: data.email.trim() || undefined,
      address: data.address.trim() || undefined,
      website: data.website.trim() || undefined,
      notes: data.notes.trim() || undefined,
    };

    if (editingOrg) {
      updateOrganization(editingOrg.id, orgPayload);
    } else {
      addOrganization(orgPayload);
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
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder="Search organizations..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === "grouped"
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Network className="h-3.5 w-3.5" />
                  Grouped
                </button>
                <button
                  onClick={() => setViewMode("flat")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === "flat"
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Flat
                </button>
              </div>
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
          ) : viewMode === "flat" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrgs.map((org) => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  contactCount={getContactCount(org.id)}
                  quoteCount={getQuoteCount(org.name)}
                  parentOrgName={getParentOrgName(org)}
                  childDealerCount={
                    org.type === "rep_group"
                      ? getChildDealerCount(org.id)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rep Groups with their dealers */}
              {repGroups.map((repGroup) => {
                const childDealers = getChildDealers(repGroup.id);
                const isExpanded = expandedGroups.has(repGroup.id);
                return (
                  <div key={repGroup.id} className="space-y-3">
                    <button
                      onClick={() => toggleGroup(repGroup.id)}
                      className="flex items-center gap-2 w-full text-left group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                      <Network className="h-4 w-4 text-violet-600" />
                      <span className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors">
                        {repGroup.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {childDealers.length} dealer{childDealers.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="ml-6 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <OrganizationCard
                            organization={repGroup}
                            contactCount={getContactCount(repGroup.id)}
                            quoteCount={getQuoteCount(repGroup.name)}
                            childDealerCount={getChildDealerCount(repGroup.id)}
                          />
                          {childDealers.map((dealer) => (
                            <OrganizationCard
                              key={dealer.id}
                              organization={dealer}
                              contactCount={getContactCount(dealer.id)}
                              quoteCount={getQuoteCount(dealer.name)}
                              parentOrgName={repGroup.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unaffiliated orgs */}
              {unaffiliatedOrgs.length > 0 && (
                <div className="space-y-3">
                  {repGroups.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">
                        Unaffiliated
                      </span>
                      <span className="text-xs text-slate-400">
                        {unaffiliatedOrgs.length} organization{unaffiliatedOrgs.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unaffiliatedOrgs.map((org) => (
                      <OrganizationCard
                        key={org.id}
                        organization={org}
                        contactCount={getContactCount(org.id)}
                        quoteCount={getQuoteCount(org.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
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
            canDelete={isAdmin}
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
