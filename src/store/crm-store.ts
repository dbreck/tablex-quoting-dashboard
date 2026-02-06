import { create } from "zustand";
import type {
  Organization,
  OrganizationType,
  Contact,
  Activity,
  ActivityType,
  DiscountTier,
} from "@/types/quote-builder";
import { createClient } from "@/lib/supabase/client";

interface CrmStore {
  organizations: Organization[];
  contacts: Contact[];
  activities: Activity[];
  isLoaded: boolean;

  // Fetch from Supabase
  loadFromSupabase: () => Promise<void>;

  // Organizations CRUD
  addOrganization: (
    org: Omit<Organization, "id" | "createdAt" | "updatedAt" | "isSeeded">
  ) => Promise<string>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;

  // Contacts CRUD
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => Promise<string>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // Activities
  addActivity: (
    activity: Omit<Activity, "id" | "createdAt">
  ) => Promise<string>;
}

// Convert camelCase keys from TypeScript types to snake_case for Supabase
function toSnakeOrg(org: Partial<Organization>) {
  return {
    ...(org.name !== undefined && { name: org.name }),
    ...(org.type !== undefined && { type: org.type }),
    ...(org.defaultTier !== undefined && { default_tier: org.defaultTier }),
    ...(org.phone !== undefined && { phone: org.phone }),
    ...(org.email !== undefined && { email: org.email }),
    ...(org.address !== undefined && { address: org.address }),
    ...(org.website !== undefined && { website: org.website }),
    ...(org.notes !== undefined && { notes: org.notes }),
    ...(org.isSeeded !== undefined && { is_seeded: org.isSeeded }),
  };
}

function fromSnakeOrg(row: Record<string, unknown>): Organization {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as OrganizationType,
    defaultTier: (row.default_tier as DiscountTier) || "50_20",
    phone: row.phone as string | undefined,
    email: row.email as string | undefined,
    address: row.address as string | undefined,
    website: row.website as string | undefined,
    notes: row.notes as string | undefined,
    isSeeded: row.is_seeded as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function fromSnakeContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    role: row.role as string | undefined,
    title: row.title as string | undefined,
    isPrimary: row.is_primary as boolean,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  };
}

function fromSnakeActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string | undefined,
    contactId: row.contact_id as string | undefined,
    quoteId: row.quote_id as string | undefined,
    type: row.type as ActivityType,
    content: row.content as string,
    createdAt: row.created_at as string,
    createdBy: row.created_by as string | undefined,
  };
}

export const useCrmStore = create<CrmStore>()((set, get) => ({
  organizations: [],
  contacts: [],
  activities: [],
  isLoaded: false,

  loadFromSupabase: async () => {
    if (get().isLoaded) return;
    const supabase = createClient();

    const [orgsRes, contactsRes, activitiesRes] = await Promise.all([
      supabase.from("organizations").select("*").order("name"),
      supabase.from("contacts").select("*").order("last_name"),
      supabase.from("activities").select("*").order("created_at", { ascending: false }),
    ]);

    set({
      organizations: (orgsRes.data || []).map(fromSnakeOrg),
      contacts: (contactsRes.data || []).map(fromSnakeContact),
      activities: (activitiesRes.data || []).map(fromSnakeActivity),
      isLoaded: true,
    });
  },

  addOrganization: async (orgData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        ...toSnakeOrg(orgData),
        is_seeded: false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    const org = fromSnakeOrg(data);
    set((state) => ({ organizations: [...state.organizations, org] }));
    return org.id;
  },

  updateOrganization: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update(toSnakeOrg(updates))
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      organizations: state.organizations.map((o) =>
        o.id === id
          ? { ...o, ...updates, updatedAt: new Date().toISOString() }
          : o
      ),
    }));
  },

  deleteOrganization: async (id) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== id),
      contacts: state.contacts.filter((c) => c.organizationId !== id),
    }));
  },

  addContact: async (contactData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        organization_id: contactData.organizationId,
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        role: contactData.role,
        title: contactData.title,
        is_primary: contactData.isPrimary,
        notes: contactData.notes,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    const contact = fromSnakeContact(data);
    set((state) => ({ contacts: [...state.contacts, contact] }));
    return contact.id;
  },

  updateContact: async (id, updates) => {
    const supabase = createClient();
    const payload: Record<string, unknown> = {};
    if (updates.firstName !== undefined) payload.first_name = updates.firstName;
    if (updates.lastName !== undefined) payload.last_name = updates.lastName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.isPrimary !== undefined) payload.is_primary = updates.isPrimary;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await supabase
      .from("contacts")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteContact: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) throw error;
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    }));
  },

  addActivity: async (activityData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("activities")
      .insert({
        organization_id: activityData.organizationId,
        contact_id: activityData.contactId,
        quote_id: activityData.quoteId,
        type: activityData.type,
        content: activityData.content,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    const activity = fromSnakeActivity(data);
    set((state) => ({ activities: [activity, ...state.activities] }));
    return activity.id;
  },
}));
