"use client";

import { AlertTriangle, Database } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useContentMapHydration } from "@/hooks/useContentMapHydration";
import { useContentMapRealtime } from "@/hooks/useContentMapRealtime";
import { useSiteMapApprovalsHydration } from "@/hooks/useSiteMapApprovalsHydration";
import { useSiteMapApprovalsRealtime } from "@/hooks/useSiteMapApprovalsRealtime";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();
  const { isInitialized, error } = useContentMapHydration();
  useContentMapRealtime();
  // Site Map approvals run independently — don't gate the layout on them.
  // If migration 025 isn't applied yet, console errors are fine; the IA still
  // renders and approval clicks queue optimistically (they'll fail server-side
  // until the table exists).
  useSiteMapApprovalsHydration();
  useSiteMapApprovalsRealtime();

  if (!profile?.can_access_proposal) return null;

  if (error) {
    const isMigration = error.migrationMissing;
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-start gap-3">
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                isMigration ? "bg-amber-100" : "bg-red-100"
              }`}
            >
              {isMigration ? (
                <Database className="h-5 w-5 text-amber-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-900">
                {isMigration
                  ? "Content Map migration not applied"
                  : "Failed to load content map"}
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                {isMigration ? (
                  <>
                    The <code className="font-mono text-[12px] bg-slate-100 px-1.5 py-0.5 rounded">
                      content_nodes
                    </code>{" "}
                    and{" "}
                    <code className="font-mono text-[12px] bg-slate-100 px-1.5 py-0.5 rounded">
                      content_edges
                    </code>{" "}
                    tables don&apos;t exist yet. Apply{" "}
                    <code className="font-mono text-[12px] bg-slate-100 px-1.5 py-0.5 rounded">
                      supabase/migrations/020_content_map.sql
                    </code>{" "}
                    to the project database, then reload this page.
                  </>
                ) : (
                  <>Supabase returned an error while fetching the content map.</>
                )}
              </p>
              <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] font-mono text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400">message: </span>
                  {error.message}
                </div>
                {error.code && (
                  <div>
                    <span className="text-slate-400">code: </span>
                    {error.code}
                  </div>
                )}
                {error.hint && (
                  <div>
                    <span className="text-slate-400">hint: </span>
                    {error.hint}
                  </div>
                )}
                {error.details && (
                  <div>
                    <span className="text-slate-400">details: </span>
                    {error.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isInitialized ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#95ff00]" />
        </div>
      ) : (
        children
      )}
    </>
  );
}
