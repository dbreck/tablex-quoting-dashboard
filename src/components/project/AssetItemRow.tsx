"use client";

import { X, ExternalLink } from "lucide-react";
import {
  ASSET_ITEM_STATUSES,
  type AssetItem,
  type AssetItemStatus,
} from "@/data/assets";

interface AssetItemRowProps {
  item: AssetItem;
  onChange: (patch: Partial<AssetItem>) => void;
  onRemove: () => void;
}

const inputCls =
  "w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green";

export function AssetItemRow({ item, onChange, onRemove }: AssetItemRowProps) {
  function setStatus(next: AssetItemStatus) {
    const patch: Partial<AssetItem> = { status: next };
    if (next === "complete") {
      patch.completedAt = new Date().toISOString();
    } else if (item.status === "complete") {
      // Leaving complete clears the timestamp.
      patch.completedAt = undefined;
    }
    onChange(patch);
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1.5">
      <div className="flex items-start gap-2">
        <select
          value={item.status}
          onChange={(e) => setStatus(e.target.value as AssetItemStatus)}
          className="shrink-0 rounded border border-slate-200 px-1.5 py-1 text-[11px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          {ASSET_ITEM_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Item name"
          className={`flex-1 ${inputCls} font-medium`}
        />

        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-slate-400 hover:text-red-600 p-1"
          title="Remove item"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-2 pl-[88px]">
        <div className="flex-1 flex items-center gap-1">
          <input
            type="url"
            value={item.sourceUrl ?? ""}
            onChange={(e) => onChange({ sourceUrl: e.target.value || undefined })}
            placeholder="https://drive.google.com/… (link to delivered file)"
            className={inputCls}
          />
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-slate-400 hover:text-brand-green p-1"
              title="Open link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="pl-[88px]">
        <input
          type="text"
          value={item.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value || undefined })}
          placeholder="Notes (optional)"
          className={`${inputCls} text-[11px] text-slate-600`}
        />
      </div>
    </div>
  );
}
