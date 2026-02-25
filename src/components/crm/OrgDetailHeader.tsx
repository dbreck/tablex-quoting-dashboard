"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISCOUNT_TIER_LABELS, type Organization } from "@/types/quote-builder";
import { ArrowLeft, Pencil, Store, Building2, Network } from "lucide-react";
import Link from "next/link";

interface OrgDetailHeaderProps {
  organization: Organization;
  onEdit: () => void;
  parentOrg?: Organization | null;
}

export function OrgDetailHeader({ organization, onEdit, parentOrg }: OrgDetailHeaderProps) {
  const icon =
    organization.type === "rep_group" ? (
      <Network className="h-6 w-6 text-violet-600" />
    ) : organization.type === "dealer" ? (
      <Store className="h-6 w-6 text-purple-600" />
    ) : (
      <Building2 className="h-6 w-6 text-blue-600" />
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
    <div className="mb-8">
      <Link
        href="/quote/crm"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CRM
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {organization.name}
            </h1>
            {parentOrg && organization.type === "dealer" && (
              <p className="text-sm text-slate-500 mt-0.5">
                Rep Group:{" "}
                <Link
                  href={`/quote/crm/${parentOrg.id}`}
                  className="text-brand-green hover:underline"
                >
                  {parentOrg.name}
                </Link>
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={badgeVariant}
                className={organization.type === "rep_group" ? "bg-violet-100 text-violet-700" : undefined}
              >
                {badgeLabel}
              </Badge>
              <Badge variant="default">
                {DISCOUNT_TIER_LABELS[organization.defaultTier]}
              </Badge>
              {organization.isSeeded && (
                <Badge variant="outline">Seeded</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      </div>

      {(organization.email ||
        organization.phone ||
        organization.address ||
        organization.website) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          {organization.email && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Email</p>
              <p className="text-sm text-slate-700">{organization.email}</p>
            </div>
          )}
          {organization.phone && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Phone</p>
              <p className="text-sm text-slate-700">{organization.phone}</p>
            </div>
          )}
          {organization.address && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Address</p>
              <p className="text-sm text-slate-700">{organization.address}</p>
            </div>
          )}
          {organization.website && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Website</p>
              <p className="text-sm text-slate-700">{organization.website}</p>
            </div>
          )}
        </div>
      )}

      {organization.notes && (
        <p className="text-sm text-slate-500 mt-3 italic">
          {organization.notes}
        </p>
      )}
    </div>
  );
}
