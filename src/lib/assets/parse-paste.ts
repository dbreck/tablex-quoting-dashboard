// Pure paste parser. Accepts text copied from a spreadsheet column (or any
// newline-separated list) and produces one draft item per non-empty line.
// If a line contains tabs, the first column is the name; a URL-shaped column
// becomes sourceUrl; anything remaining is joined as notes.

import type { AssetItemStatus } from "@/data/assets";

export interface ParsedPasteItem {
  name: string;
  sourceUrl?: string;
  notes?: string;
  status: AssetItemStatus;
}

const URL_RE = /^https?:\/\/\S+$/i;

export function parseAssetPaste(input: string): ParsedPasteItem[] {
  if (!input) return [];
  const lines = input.split(/\r?\n/);
  const items: ParsedPasteItem[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const cols = line.split("\t").map((c) => c.trim()).filter((c) => c.length > 0);
    if (cols.length === 0) continue;

    const name = cols[0];
    if (!name) continue;

    let sourceUrl: string | undefined;
    const notesParts: string[] = [];

    for (let i = 1; i < cols.length; i += 1) {
      const col = cols[i];
      if (!sourceUrl && URL_RE.test(col)) {
        sourceUrl = col;
      } else {
        notesParts.push(col);
      }
    }

    const notes = notesParts.length > 0 ? notesParts.join(" — ") : undefined;
    const status: AssetItemStatus = sourceUrl ? "in_review" : "outstanding";

    items.push({ name, sourceUrl, notes, status });
  }

  return items;
}
