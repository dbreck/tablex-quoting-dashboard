"use client";

import { useState, useMemo } from "react";
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
import { parseAssetPaste } from "@/lib/assets/parse-paste";
import { makeAssetItemId, type AssetItem } from "@/data/assets";

interface AssetItemsPasterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppend: (items: AssetItem[]) => void;
}

export function AssetItemsPaster({ open, onOpenChange, onAppend }: AssetItemsPasterProps) {
  const [text, setText] = useState("");

  const preview = useMemo(() => parseAssetPaste(text), [text]);

  function handleAppend() {
    if (preview.length === 0) return;
    const items: AssetItem[] = preview.map((p) => ({
      id: makeAssetItemId(nanoid(10)),
      name: p.name,
      status: p.status,
      sourceUrl: p.sourceUrl,
      notes: p.notes,
    }));
    onAppend(items);
    setText("");
    onOpenChange(false);
  }

  function handleClose(next: boolean) {
    if (!next) setText("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paste items from spreadsheet</DialogTitle>
          <DialogDescription>
            Paste a column from Google Sheets / Excel. One row per line. Tab-separated
            columns are accepted — first column is the item name, anything URL-shaped
            becomes the source link, the rest becomes notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={`SKU-1234 — Walnut Veneer\nSKU-1235 — Maple Veneer\thttps://drive.google.com/...\nSKU-1236 — Oak Veneer\thttps://drive.google.com/...\tNeil v2`}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green"
          />

          {preview.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-medium text-slate-600 mb-1.5">
                Preview — {preview.length} item{preview.length === 1 ? "" : "s"}
              </p>
              <ul className="space-y-1 text-xs text-slate-700 max-h-40 overflow-y-auto">
                {preview.map((p, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="flex-1 truncate">{p.name}</span>
                    {p.sourceUrl && (
                      <span className="text-[10px] text-brand-green shrink-0">
                        link
                      </span>
                    )}
                    {p.notes && (
                      <span className="text-[10px] text-slate-500 shrink-0 truncate max-w-[200px]">
                        — {p.notes}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAppend} disabled={preview.length === 0}>
            Append {preview.length > 0 ? `${preview.length} item${preview.length === 1 ? "" : "s"}` : "items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
