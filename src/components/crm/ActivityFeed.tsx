"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { Activity, ActivityType, Organization, Contact } from "@/types/quote-builder";
import {
  StickyNote,
  FilePlus,
  Send,
  PhoneCall,
  Mail,
  CalendarDays,
} from "lucide-react";

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  note: StickyNote,
  quote_created: FilePlus,
  quote_sent: Send,
  call: PhoneCall,
  email: Mail,
  meeting: CalendarDays,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: "Note",
  quote_created: "Quote Created",
  quote_sent: "Quote Sent",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  note: "bg-slate-100 text-slate-600",
  quote_created: "bg-emerald-100 text-emerald-600",
  quote_sent: "bg-blue-100 text-blue-600",
  call: "bg-amber-100 text-amber-600",
  email: "bg-purple-100 text-purple-600",
  meeting: "bg-pink-100 text-pink-600",
};

interface ActivityFeedProps {
  activities: Activity[];
  organizations: Organization[];
  contacts: Contact[];
}

export function ActivityFeed({
  activities,
  organizations,
  contacts,
}: ActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState("all");

  const orgMap = new Map(organizations.map((o) => [o.id, o]));
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const filtered =
    typeFilter === "all"
      ? activities
      : activities.filter((a) => a.type === typeFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <StickyNote className="h-12 w-12 mx-auto mb-3 text-slate-200" />
          <p>No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            const org = activity.organizationId
              ? orgMap.get(activity.organizationId)
              : null;
            const contact = activity.contactId
              ? contactMap.get(activity.contactId)
              : null;

            return (
              <div
                key={activity.id}
                className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACTIVITY_COLORS[activity.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {ACTIVITY_LABELS[activity.type]}
                    </Badge>
                    {org && (
                      <span className="text-xs text-slate-500 truncate">
                        {org.name}
                      </span>
                    )}
                    {contact && (
                      <span className="text-xs text-slate-400">
                        {contact.firstName} {contact.lastName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{activity.content}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
