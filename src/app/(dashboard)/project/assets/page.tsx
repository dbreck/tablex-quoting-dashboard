"use client";

import { useState, useMemo } from "react";
import { nanoid } from "nanoid";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAssetsStore,
  useAssetGroups,
  useAssetGroupStatusCounts,
} from "@/store/assets-store";
import { AssetCard } from "@/components/project/AssetCard";
import { AssetDrawer } from "@/components/project/AssetDrawer";
import {
  ASSET_GROUP_STATUS_LABEL,
  type AssetGroup,
  type AssetGroupStatus,
} from "@/data/assets";

const STATUS_FILTERS: { id: "all" | AssetGroupStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "requested", label: "Requested" },
  { id: "in_progress", label: "In progress" },
  { id: "partial", label: "Partial" },
  { id: "complete", label: "Complete" },
  { id: "blocked", label: "Blocked" },
];

export default function AssetsPage() {
  const groups = useAssetGroups();
  const counts = useAssetGroupStatusCounts();
  const addAssetGroup = useAssetsStore((s) => s.addAssetGroup);

  const [statusFilter, setStatusFilter] = useState<"all" | AssetGroupStatus>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const vendors = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) {
      if (g.vendor) set.add(g.vendor);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (vendorFilter !== "all" && g.vendor !== vendorFilter) return false;
      return true;
    });
  }, [groups, statusFilter, vendorFilter]);

  async function createNew() {
    const id = nanoid(10);
    const now = new Date().toISOString();
    const group: AssetGroup = {
      id,
      name: "New asset group",
      status: "requested",
      items: [],
      tags: [],
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };
    await addAssetGroup(group);
    setOpenId(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Inventory</h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Track third-party-delivered assets — laminate samples, 3D files, photography,
            illustrations. One row per group. Items hold Drive / Dropbox links to the
            delivered files.
          </p>
        </div>
        <Button onClick={() => void createNew()} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Asset Group
        </Button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.id;
          const count = f.id === "all" ? groups.length : counts[f.id];
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                active
                  ? "bg-brand-green/15 text-brand-green border-brand-green/50"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>{f.label}</span>
              <span className="font-mono text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Vendor filter (shown only when there are vendors to pick from) */}
      {vendors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Vendor:</span>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/50"
          >
            <option value="all">All vendors</option>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">
            {groups.length === 0
              ? "No asset groups yet. Click 'Asset Group' to add the first one."
              : `No asset groups match the current filters${
                  statusFilter !== "all"
                    ? ` (status: ${ASSET_GROUP_STATUS_LABEL[statusFilter as AssetGroupStatus]})`
                    : ""
                }.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((g) => (
            <AssetCard key={g.id} group={g} onClick={() => setOpenId(g.id)} />
          ))}
        </ul>
      )}

      <AssetDrawer groupId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
