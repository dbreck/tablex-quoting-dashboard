"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAssetsStore } from "@/store/assets-store";
import { DELIVERABLES, WORKSTREAMS } from "@/data/project-phase2";
import type { AssetGroup } from "@/data/assets";

interface AssetCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new group's id after a successful save. */
  onCreated?: (id: string) => void;
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green";
const labelCls = "block text-xs font-medium text-slate-700 mb-1";

export function AssetCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: AssetCreateDialogProps) {
  const addAssetGroup = useAssetsStore((s) => s.addAssetGroup);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [deliverableId, setDeliverableId] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const id = nanoid(10);
      const now = new Date().toISOString();
      const group: AssetGroup = {
        id,
        name: name.trim(),
        category: category.trim() || undefined,
        vendor: vendor.trim() || undefined,
        deliverableId: deliverableId || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        spreadsheetUrl: spreadsheetUrl.trim() || undefined,
        description: description.trim() || undefined,
        status: "requested",
        items: [],
        tags: [],
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      };
      await addAssetGroup(group);
      onCreated?.(id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create asset group");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New asset group</DialogTitle>
          <DialogDescription>
            One group per type of delivery (e.g. &ldquo;Laminate Chips&rdquo;,
            &ldquo;Photos — Homepage&rdquo;). You&rsquo;ll add items inside after saving.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void persist();
          }}
          className="space-y-4"
        >
          <div>
            <label className={labelCls}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Laminate Chips · Photos — Homepage · 3D Models — Series 30"
              className={inputCls}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="samples · 3d · photography · …"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Neil Briggs · Kayla · internal · …"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Deliverable (optional)</label>
            <select
              value={deliverableId}
              onChange={(e) => setDeliverableId(e.target.value)}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Source folder URL (optional)</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://drive.google.com/…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Spreadsheet URL (optional)</label>
              <input
                type="url"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/…"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What this group is for…"
              className={inputCls}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="font-medium">Couldn&rsquo;t save: </span>
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
            >
              {submitting ? "Saving…" : "Save & add items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
