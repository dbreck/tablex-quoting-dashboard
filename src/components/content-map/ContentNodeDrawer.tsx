"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Trash2, Eye, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  useContentMapStore,
  useContentNode,
} from "@/store/content-map-store";
import type {
  ContentAuthGate,
  ContentNodeKind,
} from "@/lib/supabase/content-map-converters";

const KIND_OPTIONS: ContentNodeKind[] = [
  "root",
  "section",
  "page",
  "utility",
  "note",
];

const COLOR_OPTIONS = [
  "slate",
  "green",
  "violet",
  "amber",
  "sky",
  "emerald",
  "indigo",
  "blue",
  "teal",
];

const AUTH_OPTIONS: (ContentAuthGate | "none")[] = [
  "none",
  "dealer",
  "rep",
  "admin",
];

// Tiny inline markdown renderer — headings, bold, italic, lists, line breaks.
// Keeps the preview useful without adding a dep.
function renderMini(md: string): { __html: string } {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // Headings
  html = html
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>');
  // Lists
  html = html.replace(
    /(^|\n)(- .+(?:\n- .+)*)/g,
    (_m, pre, block) =>
      `${pre}<ul class="list-disc pl-5 space-y-0.5 my-1">${block
        .split("\n")
        .map((line: string) => `<li>${line.replace(/^- /, "")}</li>`)
        .join("")}</ul>`,
  );
  // Bold + italic
  html = html
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  // Paragraph line breaks
  html = html.replace(/\n/g, "<br />");
  return { __html: html };
}

export function ContentNodeDrawer() {
  const open = useContentMapStore((s) => s.drawerOpen);
  const selectedId = useContentMapStore((s) => s.selectedNodeId);

  if (!open || !selectedId) return null;
  return <DrawerInner key={selectedId} nodeId={selectedId} />;
}

/**
 * Inner component — mounted with a `key` of the node id so that switching to a
 * new node tears it down and mounts fresh. That lets us derive local form
 * state from the node via useState initializers without a setState-in-effect.
 */
function DrawerInner({ nodeId }: { nodeId: string }) {
  const closeDrawer = useContentMapStore((s) => s.closeDrawer);
  const updateNode = useContentMapStore((s) => s.updateNode);
  const deleteNode = useContentMapStore((s) => s.deleteNode);
  const node = useContentNode(nodeId);
  const { isAdmin } = useAuth();

  const [title, setTitle] = useState(() => node?.title ?? "");
  const [body, setBody] = useState(() => node?.body ?? "");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  if (!node) return null;

  const commitTitle = () => {
    if (title !== node.title) updateNode(node.id, { title });
  };
  const commitBody = () => {
    if ((body || null) !== (node.body ?? null)) {
      updateNode(node.id, { body: body || null });
    }
  };

  return (
    <DialogPrimitive.Root open onOpenChange={(v) => !v && closeDrawer()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l border-slate-200 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <DialogPrimitive.Title className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Edit node
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-slate-400 hover:text-slate-600 rounded-md p-1">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitTitle}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                  Content
                </label>
                <div className="flex gap-0.5 bg-slate-100 rounded-md p-0.5">
                  <button
                    onClick={() => setTab("edit")}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                      tab === "edit"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <PencilLine className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      commitBody();
                      setTab("preview");
                    }}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                      tab === "preview"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>
              {tab === "edit" ? (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onBlur={commitBody}
                  placeholder="Write content for this node… markdown supported: **bold**, *italic*, # heading, - list"
                  rows={12}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green resize-y min-h-[180px]"
                />
              ) : (
                <div
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm prose prose-sm max-w-none min-h-[180px] bg-slate-50/60 leading-relaxed"
                  dangerouslySetInnerHTML={
                    body ? renderMini(body) : { __html: "<span class='text-slate-400 italic'>No content yet.</span>" }
                  }
                />
              )}
            </div>

            {/* Kind */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1.5">
                Kind
              </label>
              <div className="flex flex-wrap gap-1.5">
                {KIND_OPTIONS.map((k) => (
                  <button
                    key={k}
                    onClick={() => updateNode(node.id, { kind: k })}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                      node.kind === k
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1.5">
                Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      updateNode(node.id, { color: c === node.color ? null : c })
                    }
                    className={cn(
                      "h-7 w-7 rounded-md border-2 transition-all",
                      node.color === c
                        ? "border-slate-900 ring-2 ring-offset-1 ring-slate-200"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                    style={{ backgroundColor: `var(--color-${c}-400, #cbd5e1)` }}
                    title={c}
                  >
                    <span className="sr-only">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth gate */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1.5">
                Auth gate
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AUTH_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() =>
                      updateNode(node.id, {
                        authGate: a === "none" ? null : a,
                      })
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                      (node.authGate ?? "none") === a
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1.5">
                Flags
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={node.isNew}
                  onChange={(e) => updateNode(node.id, { isNew: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green/40"
                />
                Mark as NEW
              </label>
            </div>

            {/* Metadata */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {node.id}
                </Badge>
                {node.parentId && (
                  <span className="text-[10px] text-slate-400">
                    parent: <code className="font-mono">{node.parentId}</code>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(`Delete "${node.title}"? Connected edges will also be removed.`)
                  ) {
                    deleteNode(node.id);
                    closeDrawer();
                  }
                }}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            ) : (
              <span className="text-[10px] text-slate-400">
                Admins can delete nodes
              </span>
            )}
            <Button size="sm" onClick={closeDrawer}>
              Done
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
