"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import {
  X,
  Trash2,
  Plus,
  ClipboardPaste,
  AlertOctagon,
  Undo2,
} from "lucide-react";
import { useAssetsStore, useAssetGroup } from "@/store/assets-store";
import { useAuth } from "@/components/providers/AuthProvider";
import { DELIVERABLES, WORKSTREAMS } from "@/data/project-phase2";
import {
  itemCounts,
  makeAssetItemId,
  type AssetGroup,
  type AssetItem,
} from "@/data/assets";
import { AssetStatusBadge } from "@/components/project/AssetStatusBadge";
import { AssetItemRow } from "@/components/project/AssetItemRow";
import { AssetItemsPaster } from "@/components/project/AssetItemsPaster";

interface AssetDrawerProps {
  groupId: string | null;
  onClose: () => void;
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50";
const labelCls =
  "text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block";

export function AssetDrawer({ groupId, onClose }: AssetDrawerProps) {
  const group = useAssetGroup(groupId);
  const updateAssetGroup = useAssetsStore((s) => s.updateAssetGroup);
  const deleteAssetGroup = useAssetsStore((s) => s.deleteAssetGroup);
  const setAssetItems = useAssetsStore((s) => s.setAssetItems);
  const toggleBlocked = useAssetsStore((s) => s.toggleBlocked);
  const { isAdmin } = useAuth();

  const [pasterOpen, setPasterOpen] = useState(false);

  if (!group) return null;

  const counts = itemCounts(group.items);
  const isBlocked = group.status === "blocked";

  function patch(field: Partial<Omit<AssetGroup, "id" | "createdAt" | "updatedAt">>) {
    if (!group) return;
    void updateAssetGroup(group.id, field);
  }

  function updateItem(itemId: string, p: Partial<AssetItem>) {
    if (!group) return;
    const next = group.items.map((it) => (it.id === itemId ? { ...it, ...p } : it));
    void setAssetItems(group.id, next);
  }

  function removeItem(itemId: string) {
    if (!group) return;
    void setAssetItems(group.id, group.items.filter((it) => it.id !== itemId));
  }

  function addItem() {
    if (!group) return;
    const newItem: AssetItem = {
      id: makeAssetItemId(nanoid(10)),
      name: "",
      status: "outstanding",
    };
    void setAssetItems(group.id, [...group.items, newItem]);
  }

  function appendItems(items: AssetItem[]) {
    if (!group) return;
    void setAssetItems(group.id, [...group.items, ...items]);
  }

  function handleDelete() {
    if (!group) return;
    if (!confirm(`Delete asset group "${group.name}"? This cannot be undone.`)) return;
    void deleteAssetGroup(group.id).then(onClose);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <AssetStatusBadge status={group.status} />
            {counts.total > 0 && (
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {counts.complete} / {counts.total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void toggleBlocked(group.id)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border ${
                isBlocked
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              title={isBlocked ? "Unblock — recompute from items" : "Mark as blocked"}
            >
              {isBlocked ? <Undo2 className="h-3.5 w-3.5" /> : <AlertOctagon className="h-3.5 w-3.5" />}
              {isBlocked ? "Unblock" : "Block"}
            </button>
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete asset group"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <input
            type="text"
            value={group.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="text-lg font-semibold text-slate-900 w-full border-none outline-none focus:ring-0 p-0"
            placeholder="Group name"
          />

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={group.description ?? ""}
              onChange={(e) => patch({ description: e.target.value || undefined })}
              placeholder="What this group is for…"
              rows={2}
              className={`${inputCls} resize-y [field-sizing:content] min-h-[3rem]`}
            />
          </div>

          {/* Category / Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <input
                type="text"
                value={group.category ?? ""}
                onChange={(e) => patch({ category: e.target.value || undefined })}
                placeholder="e.g. samples, 3d, photography"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Vendor</label>
              <input
                type="text"
                value={group.vendor ?? ""}
                onChange={(e) => patch({ vendor: e.target.value || undefined })}
                placeholder="e.g. Neil Briggs, Kayla, internal"
                className={inputCls}
              />
            </div>
          </div>

          {/* Deliverable */}
          <div>
            <label className={labelCls}>Deliverable (optional)</label>
            <select
              value={group.deliverableId ?? ""}
              onChange={(e) => patch({ deliverableId: e.target.value || undefined })}
              className={inputCls}
            >
              <option value="">— Unlinked —</option>
              {WORKSTREAMS.map((ws) => {
                const opts = DELIVERABLES.filter((d) => d.workstream === ws.id);
                if (opts.length === 0) return null;
                return (
                  <optgroup key={ws.id} label={ws.name}>
                    {opts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Source URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Source folder URL</label>
              <input
                type="url"
                value={group.sourceUrl ?? ""}
                onChange={(e) => patch({ sourceUrl: e.target.value || undefined })}
                placeholder="https://drive.google.com/…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Spreadsheet URL</label>
              <input
                type="url"
                value={group.spreadsheetUrl ?? ""}
                onChange={(e) => patch({ spreadsheetUrl: e.target.value || undefined })}
                placeholder="https://docs.google.com/spreadsheets/…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={group.notes ?? ""}
              onChange={(e) => patch({ notes: e.target.value || undefined })}
              rows={2}
              className={`${inputCls} resize-y [field-sizing:content] min-h-[3rem]`}
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>
                Items {counts.total > 0 ? `(${counts.total})` : ""}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPasterOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste from spreadsheet
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:text-brand-green/80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>
            </div>

            {group.items.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                No items yet. Use <span className="font-medium">Paste from spreadsheet</span> for
                bulk add, or <span className="font-medium">Add item</span> for one at a time.
              </div>
            ) : (
              <div className="space-y-2">
                {group.items.map((item) => (
                  <AssetItemRow
                    key={item.id}
                    item={item}
                    onChange={(p) => updateItem(item.id, p)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paste modal */}
      <AssetItemsPaster
        open={pasterOpen}
        onOpenChange={setPasterOpen}
        onAppend={appendItems}
      />
    </>
  );
}
