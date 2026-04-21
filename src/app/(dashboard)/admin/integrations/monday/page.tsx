"use client";

import { useState } from "react";
import { Wifi, Database, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PingResult {
  boardName: string;
  groupCount: number;
  columnCount: number;
}

interface SeedResult {
  groupsCreated: string[];
  columnsCreated: string[];
  itemsCreated: number;
  itemsUpdated: number;
  subitemsCreated: number;
  subitemsUpdated: number;
  subitemsDeleted?: number;
  errors: string[];
}

export default function AdminMondayPage() {
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedConfirming, setSeedConfirming] = useState(false);

  const handlePing = async () => {
    setPinging(true);
    setPingError(null);
    setPingResult(null);
    try {
      const res = await fetch("/api/monday/ping", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connection failed");
      setPingResult(data);
    } catch (err) {
      setPingError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPinging(false);
    }
  };

  const handleSeedConfirm = async () => {
    setSeedConfirming(false);
    setSeeding(true);
    setSeedError(null);
    setSeedResult(null);
    try {
      const res = await fetch("/api/monday/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      setSeedResult(data);
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monday.com Integration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sync the Project Tracker with the TableX Monday board.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Test Connection */}
        <Button
          variant="outline"
          onClick={handlePing}
          disabled={pinging}
        >
          {pinging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
          Test Connection
        </Button>

        {/* Seed Board */}
        {seedConfirming ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span>
              This will create groups, columns, items, and subitems on the TableX Monday board.
              Safe to re-run. Continue?
            </span>
            <Button size="sm" onClick={handleSeedConfirm} disabled={seeding}>
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSeedConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setSeedConfirming(true)}
            disabled={seeding}
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Seed Board
          </Button>
        )}

        {/* Sync Now — disabled until Stage 2 */}
        <Button variant="outline" disabled title="Coming in Stage 2">
          <RefreshCw className="h-4 w-4" />
          Sync Now
        </Button>
      </div>

      {/* Ping result */}
      {(pingResult || pingError) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Connection Test</CardTitle>
              {pingResult && <Badge variant="success">Connected</Badge>}
              {pingError && <Badge variant="error">Failed</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {pingResult && (
              <dl className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Board</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{pingResult.boardName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Groups</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{pingResult.groupCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Columns</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{pingResult.columnCount}</dd>
                </div>
              </dl>
            )}
            {pingError && (
              <p className="text-sm text-red-600">{pingError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seed result */}
      {(seedResult || seedError) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Seed Summary</CardTitle>
              {seedResult && <Badge variant="success">Complete</Badge>}
              {seedError && <Badge variant="error">Failed</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {seedResult && (
              <>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Groups Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.groupsCreated.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Columns Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.columnsCreated.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Items Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.itemsCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Items Updated</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.itemsUpdated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Subitems Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.subitemsCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Subitems Updated</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.subitemsUpdated}</dd>
                  </div>
                  {seedResult.subitemsDeleted != null && seedResult.subitemsDeleted > 0 && (
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider">Orphans Deleted</dt>
                      <dd className="mt-0.5 font-medium text-amber-700">{seedResult.subitemsDeleted}</dd>
                    </div>
                  )}
                </dl>
                {seedResult.errors.length > 0 && (
                  <div className="mt-3 text-xs text-red-600">
                    {seedResult.errors.length} error{seedResult.errors.length === 1 ? "" : "s"} — first: {seedResult.errors[0]}
                  </div>
                )}
              </>
            )}
            {seedError && (
              <p className="text-sm text-red-600">{seedError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Board link */}
      <div className="pt-2 border-t border-gray-100">
        <a
          href="https://clear-ph-design.monday.com/boards/18409604004"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-brand-green hover:underline"
        >
          View Monday board
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
