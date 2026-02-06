import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Organization,
  OrganizationType,
  Contact,
  Activity,
  ActivityType,
  DiscountTier,
} from "@/types/quote-builder";
import dealersData from "@/data/dealers.json";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

interface CrmStore {
  organizations: Organization[];
  contacts: Contact[];
  activities: Activity[];
  _seeded: boolean;

  // Organizations CRUD
  addOrganization: (
    org: Omit<Organization, "id" | "createdAt" | "updatedAt" | "isSeeded">
  ) => string;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;

  // Contacts CRUD
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => string;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Activities
  addActivity: (
    activity: Omit<Activity, "id" | "createdAt">
  ) => string;

  // Auto-seed 13 dealers on first load
  seedDealers: () => void;
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set, get) => ({
      organizations: [],
      contacts: [],
      activities: [],
      _seeded: false,

      seedDealers: () => {
        if (get()._seeded) return;
        const now = new Date().toISOString();
        const dealers: Organization[] = dealersData.map(
          (d: { name: string }) => ({
            id: generateId(),
            name: d.name,
            type: "dealer" as OrganizationType,
            defaultTier: "50_20" as DiscountTier,
            isSeeded: true,
            createdAt: now,
            updatedAt: now,
          })
        );
        set({ organizations: dealers, _seeded: true });
      },

      addOrganization: (orgData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const org: Organization = {
          ...orgData,
          id,
          isSeeded: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          organizations: [...state.organizations, org],
        }));
        return id;
      },

      updateOrganization: (id, updates) =>
        set((state) => ({
          organizations: state.organizations.map((o) =>
            o.id === id
              ? { ...o, ...updates, updatedAt: new Date().toISOString() }
              : o
          ),
        })),

      deleteOrganization: (id) =>
        set((state) => ({
          organizations: state.organizations.filter((o) => o.id !== id),
          contacts: state.contacts.filter((c) => c.organizationId !== id),
        })),

      addContact: (contactData) => {
        const id = generateId();
        const contact: Contact = {
          ...contactData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          contacts: [...state.contacts, contact],
        }));
        return id;
      },

      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      addActivity: (activityData) => {
        const id = generateId();
        const activity: Activity = {
          ...activityData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          activities: [activity, ...state.activities],
        }));
        return id;
      },
    }),
    {
      name: "tablex-crm",
    }
  )
);
