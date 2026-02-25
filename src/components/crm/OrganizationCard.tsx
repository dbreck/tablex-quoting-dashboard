"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DISCOUNT_TIER_LABELS, type Organization } from "@/types/quote-builder";
import { Building2, Store, Network, Users, FileText } from "lucide-react";

interface OrganizationCardProps {
  organization: Organization;
  contactCount: number;
  quoteCount: number;
  parentOrgName?: string;
  childDealerCount?: number;
}

export function OrganizationCard({
  organization,
  contactCount,
  quoteCount,
  parentOrgName,
  childDealerCount,
}: OrganizationCardProps) {
  const icon =
    organization.type === "rep_group" ? (
      <Network className="h-4.5 w-4.5 text-violet-600" />
    ) : organization.type === "dealer" ? (
      <Store className="h-4.5 w-4.5 text-purple-600" />
    ) : (
      <Building2 className="h-4.5 w-4.5 text-blue-600" />
    );

  const badgeVariant =
    organization.type === "rep_group"
      ? "info"
      : organization.type === "dealer"
        ? "info"
        : "secondary";

  const badgeLabel =
    organization.type === "rep_group"
      ? "Rep Group"
      : organization.type === "dealer"
        ? "Dealer"
        : "End Customer";

  return (
    <Link href={`/quote/crm/${organization.id}`}>
      <Card hover className="cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                {icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {organization.name}
                </p>
                {parentOrgName && organization.type === "dealer" && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {parentOrgName}
                  </p>
                )}
                <Badge
                  variant={badgeVariant}
                  className={`mt-0.5${organization.type === "rep_group" ? " bg-violet-100 text-violet-700" : ""}`}
                >
                  {badgeLabel}
                </Badge>
              </div>
            </div>
            <Badge variant="default">
              {DISCOUNT_TIER_LABELS[organization.defaultTier]}
            </Badge>
          </div>

          {organization.email && (
            <p className="text-sm text-slate-500 truncate mt-1">
              {organization.email}
            </p>
          )}
          {organization.phone && (
            <p className="text-sm text-slate-500 mt-0.5">
              {organization.phone}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
            {organization.type === "rep_group" && childDealerCount !== undefined && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Store className="h-3.5 w-3.5" />
                {childDealerCount} dealer{childDealerCount !== 1 ? "s" : ""}
              </p>
            )}
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {contactCount} contact{contactCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {quoteCount} quote{quoteCount !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
