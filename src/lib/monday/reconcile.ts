// Reconcile orchestrator — bidirectional last-write-wins per record.
//
// Run on the server (called from /api/monday/sync). Receives the client's
// current TableX state, fetches Monday's current state, decides which
// direction each linked record should sync, pushes the TableX-newer ones,
// and returns a `pulled` patch list for the client to apply.
//
// Conflict resolution: per-record, not per-field. Whichever side has the
// newer timestamp wins entirely for that record. If timestamps are within
// the no-op window (1 second), nothing happens.
//
// Records are matched two ways:
//   1. By stored sync link (syncState[tableXId].mondayItemId)
//   2. By External ID column on Monday → for first-time linking
// New records on the Monday side without an external_id we recognize are
// ignored (we don't auto-create TableX records from Monday yet).

import { DELIVERABLES } from "@/data/project-phase2";
import type { DeliverableOverride, Task } from "@/data/project-tracker";
import {
  deliverableToMondayColumnValues,
  mondayItemToOverridePatch,
  mondaySubitemToTaskPatch,
} from "./normalize";
import { snapshotMonday, type MondaySnapshot } from "./pull";
import {
  createTaskOnMonday,
  pushDeliverableToMonday,
  pushTaskToMonday,
} from "./push";
import type { SyncLink } from "@/store/project-tracker-store";

const NO_OP_WINDOW_MS = 1_000;

// ─── Inputs from the client ──────────────────────────────────────────────────

export interface SyncRequest {
  tasks: Task[];
  deliverableOverrides: Record<string, DeliverableOverride>;
  syncState: Record<string, SyncLink>;
}

// ─── Outputs the client applies ──────────────────────────────────────────────

export interface TaskPatch {
  taskId: string;
  patch: Partial<Task>;
  mondayItemId: string;
  mondayUpdatedAt: string;
}

export interface OverridePatch {
  deliverableId: string;
  patch: Partial<DeliverableOverride>;
  mondayItemId: string;
  mondayUpdatedAt: string;
}

export interface LinkUpdate {
  tableXId: string;
  mondayItemId: string;
  mondayUpdatedAt: string | null;
}

export interface SyncLogEntry {
  at: string;
  direction: "pulled" | "pushed" | "linked" | "skipped" | "error";
  kind: "task" | "deliverable";
  tableXId: string;
  detail?: string;
}

export interface SyncResult {
  syncedAt: string;
  taskPatches: TaskPatch[];
  overridePatches: OverridePatch[];
  /** Push successes — client should set lastSyncedAt for these. */
  pushedTaskIds: string[];
  pushedDeliverableIds: string[];
  /** Newly-linked records (no field changes, just record the mondayItemId). */
  linkUpdates: LinkUpdate[];
  log: SyncLogEntry[];
  errors: string[];
  /** Subitem board id — surfaced for diagnostics. */
  subitemBoardId: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tsMs(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function within(a: number, b: number, windowMs: number): boolean {
  return Math.abs(a - b) <= windowMs;
}

function emptyLink(): SyncLink {
  return { mondayItemId: null, lastSyncedAt: null, lastMondayUpdatedAt: null };
}

// ─── Per-record decision ─────────────────────────────────────────────────────

type Direction = "push" | "pull" | "noop";

function decideDirection(args: {
  tableXUpdatedAtMs: number;
  mondayUpdatedAtMs: number;
  link: SyncLink;
}): Direction {
  const { tableXUpdatedAtMs, mondayUpdatedAtMs, link } = args;
  const lastSyncedMs = tsMs(link.lastSyncedAt);
  const lastMondayMs = tsMs(link.lastMondayUpdatedAt);

  const tableXChanged = tableXUpdatedAtMs > lastSyncedMs;
  const mondayChanged = mondayUpdatedAtMs > lastMondayMs;

  if (!tableXChanged && !mondayChanged) return "noop";
  if (tableXChanged && !mondayChanged) return "push";
  if (!tableXChanged && mondayChanged) return "pull";

  // Both changed. Newer wins.
  if (within(tableXUpdatedAtMs, mondayUpdatedAtMs, NO_OP_WINDOW_MS)) {
    return "noop";
  }
  return tableXUpdatedAtMs > mondayUpdatedAtMs ? "push" : "pull";
}

// ─── Main entry ──────────────────────────────────────────────────────────────

export async function reconcile(req: SyncRequest): Promise<SyncResult> {
  const syncedAt = new Date().toISOString();
  const result: SyncResult = {
    syncedAt,
    taskPatches: [],
    overridePatches: [],
    pushedTaskIds: [],
    pushedDeliverableIds: [],
    linkUpdates: [],
    log: [],
    errors: [],
    subitemBoardId: null,
  };

  let snapshot: MondaySnapshot;
  try {
    snapshot = await snapshotMonday();
  } catch (err) {
    const msg = (err as Error).message;
    result.errors.push(`Snapshot failed: ${msg}`);
    return result;
  }
  result.subitemBoardId = snapshot.subitemBoardId;

  // ── Deliverable overrides ──────────────────────────────────────────────────
  // Iterate every Monday-known deliverable + every TableX override-bearing
  // record. We iterate DELIVERABLES (the static set) because that's the
  // canonical list.

  for (const deliverable of DELIVERABLES) {
    const mondayRecord = snapshot.itemsByExternalId.get(deliverable.id);
    if (!mondayRecord) {
      // Not seeded yet — skip. Surfaced as an error if syncState says we
      // expected it.
      const link = req.syncState[deliverable.id];
      if (link?.mondayItemId) {
        result.errors.push(
          `Deliverable ${deliverable.id} has a sync link but no Monday item — re-seed required.`,
        );
      }
      continue;
    }

    const link = req.syncState[deliverable.id] ?? emptyLink();
    const isFirstLink = !link.mondayItemId;
    const override = req.deliverableOverrides[deliverable.id];

    if (isFirstLink) {
      // First-time linking. Pull whatever Monday has into the override (only
      // values that are actually populated will land — patch is sparse).
      const patch = mondayItemToOverridePatch(
        mondayRecord.raw,
        snapshot.itemColumnsByTitle,
      );
      const meaningful = Object.keys(patch).length > 0;
      if (meaningful) {
        result.overridePatches.push({
          deliverableId: deliverable.id,
          patch,
          mondayItemId: mondayRecord.mondayItemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? syncedAt,
        });
        result.log.push({
          at: syncedAt,
          direction: "linked",
          kind: "deliverable",
          tableXId: deliverable.id,
          detail: `First link → pulled ${Object.keys(patch).join(", ")}`,
        });
      } else {
        result.linkUpdates.push({
          tableXId: deliverable.id,
          mondayItemId: mondayRecord.mondayItemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? null,
        });
        result.log.push({
          at: syncedAt,
          direction: "linked",
          kind: "deliverable",
          tableXId: deliverable.id,
          detail: "First link",
        });
      }
      continue;
    }

    // Already linked — decide direction.
    // Deliverable overrides don't have an updatedAt; treat them as "synced
    // recently" if no override exists, otherwise we need a proxy. We use the
    // store's lastSyncedAt as the lower bound: if the override exists and the
    // user just edited it via setManualStatus etc., we have no timestamp on
    // it. To keep this safe, we only push deliverable-side changes when the
    // user explicitly clicks Sync Now AND the override has been edited since
    // the link's lastSyncedAt. We approximate by always evaluating against
    // the Monday timestamp: if Monday changed, pull. If Monday is unchanged
    // but override exists, push. Tie → push (TableX wins as default for
    // deliverables since the user likely just edited).
    const mondayMs = tsMs(mondayRecord.mondayUpdatedAt);
    const lastMondayMs = tsMs(link.lastMondayUpdatedAt);
    const mondayChanged = mondayMs > lastMondayMs;

    if (mondayChanged) {
      const patch = mondayItemToOverridePatch(
        mondayRecord.raw,
        snapshot.itemColumnsByTitle,
      );
      result.overridePatches.push({
        deliverableId: deliverable.id,
        patch,
        mondayItemId: mondayRecord.mondayItemId,
        mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? syncedAt,
      });
      result.log.push({
        at: syncedAt,
        direction: "pulled",
        kind: "deliverable",
        tableXId: deliverable.id,
      });
      continue;
    }

    // Monday unchanged. Push the current TableX override if one exists AND
    // it would actually change Monday's state. Without an updatedAt on
    // overrides, we use byte-equivalence on the column_values payload to
    // avoid pushing the same value every poll.
    if (override) {
      const wouldPush = deliverableToMondayColumnValues(
        deliverable,
        override,
        snapshot.itemColumnsByTitle,
      );
      const currentMondayPatch = mondayItemToOverridePatch(
        mondayRecord.raw,
        snapshot.itemColumnsByTitle,
      );
      const wouldPushFromMondaySide = deliverableToMondayColumnValues(
        deliverable,
        { deliverableId: deliverable.id, ...currentMondayPatch },
        snapshot.itemColumnsByTitle,
      );

      if (
        JSON.stringify(wouldPush) === JSON.stringify(wouldPushFromMondaySide)
      ) {
        // Already in sync — skip silently.
        continue;
      }

      try {
        await pushDeliverableToMonday({
          deliverable,
          override,
          mondayItemId: mondayRecord.mondayItemId,
          itemColumnsByTitle: snapshot.itemColumnsByTitle,
          itemName: mondayRecord.name,
        });
        result.pushedDeliverableIds.push(deliverable.id);
        result.log.push({
          at: syncedAt,
          direction: "pushed",
          kind: "deliverable",
          tableXId: deliverable.id,
        });
      } catch (err) {
        result.errors.push(
          `Push deliverable ${deliverable.id} failed: ${(err as Error).message}`,
        );
        result.log.push({
          at: syncedAt,
          direction: "error",
          kind: "deliverable",
          tableXId: deliverable.id,
          detail: (err as Error).message,
        });
      }
    }
  }

  // ── Tasks ───────────────────────────────────────────────────────────────────

  if (!result.subitemBoardId) {
    // Surface, but don't fail the whole reconcile — deliverables still synced.
    result.errors.push(
      "Subitem board id unresolved — task subitems were not reconciled.",
    );
    return result;
  }
  const subitemBoardId = result.subitemBoardId;

  // Walk every TableX task. For each, find or link the Monday subitem,
  // creating it on Monday if it doesn't exist yet.
  for (const task of req.tasks) {
    const mondayRecord = snapshot.subitemsByExternalId.get(task.id);
    if (!mondayRecord) {
      const link = req.syncState[task.id];
      if (link?.mondayItemId) {
        // The link said there was one — Monday side likely deleted it. Don't
        // resurrect; surface and skip.
        result.errors.push(
          `Task ${task.id} has a sync link but no Monday subitem — likely deleted on Monday.`,
        );
        continue;
      }

      // No subitem and no link. Auto-create it under the parent deliverable.
      const parent = snapshot.itemsByExternalId.get(task.deliverableId);
      if (!parent) {
        result.errors.push(
          `Cannot create task ${task.id} on Monday: parent deliverable ${task.deliverableId} not found (re-seed required).`,
        );
        continue;
      }
      try {
        const { id: newSubitemId } = await createTaskOnMonday({
          task,
          parentMondayItemId: parent.mondayItemId,
          subitemColumnsByTitle: snapshot.subitemColumnsByTitle,
        });
        result.linkUpdates.push({
          tableXId: task.id,
          mondayItemId: newSubitemId,
          mondayUpdatedAt: syncedAt,
        });
        result.pushedTaskIds.push(task.id);
        result.log.push({
          at: syncedAt,
          direction: "linked",
          kind: "task",
          tableXId: task.id,
          detail: "Created on Monday",
        });
      } catch (err) {
        result.errors.push(
          `Failed to create task ${task.id} on Monday: ${(err as Error).message}`,
        );
        result.log.push({
          at: syncedAt,
          direction: "error",
          kind: "task",
          tableXId: task.id,
          detail: (err as Error).message,
        });
      }
      continue;
    }

    const link = req.syncState[task.id] ?? emptyLink();
    const isFirstLink = !link.mondayItemId;

    if (isFirstLink) {
      const patch = mondaySubitemToTaskPatch(
        mondayRecord.raw,
        snapshot.subitemColumnsByTitle,
      );
      // Filter out fields equal to the current task value to keep patch tight.
      const trimmed = trimNoOpTaskPatch(task, patch);
      if (Object.keys(trimmed).length > 0) {
        result.taskPatches.push({
          taskId: task.id,
          patch: trimmed,
          mondayItemId: mondayRecord.mondaySubitemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? syncedAt,
        });
        result.log.push({
          at: syncedAt,
          direction: "linked",
          kind: "task",
          tableXId: task.id,
          detail: `First link → pulled ${Object.keys(trimmed).join(", ")}`,
        });
      } else {
        result.linkUpdates.push({
          tableXId: task.id,
          mondayItemId: mondayRecord.mondaySubitemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? null,
        });
      }
      continue;
    }

    const dir = decideDirection({
      tableXUpdatedAtMs: tsMs(task.updatedAt),
      mondayUpdatedAtMs: tsMs(mondayRecord.mondayUpdatedAt),
      link,
    });

    if (dir === "pull") {
      const patch = mondaySubitemToTaskPatch(
        mondayRecord.raw,
        snapshot.subitemColumnsByTitle,
      );
      const trimmed = trimNoOpTaskPatch(task, patch);
      if (Object.keys(trimmed).length > 0) {
        result.taskPatches.push({
          taskId: task.id,
          patch: trimmed,
          mondayItemId: mondayRecord.mondaySubitemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? syncedAt,
        });
        result.log.push({
          at: syncedAt,
          direction: "pulled",
          kind: "task",
          tableXId: task.id,
          detail: Object.keys(trimmed).join(", "),
        });
      }
      continue;
    }

    if (dir === "push") {
      try {
        await pushTaskToMonday({
          task,
          mondaySubitemId: mondayRecord.mondaySubitemId,
          subitemBoardId,
          subitemColumnsByTitle: snapshot.subitemColumnsByTitle,
          subitemName: mondayRecord.name,
        });
        result.pushedTaskIds.push(task.id);
        result.log.push({
          at: syncedAt,
          direction: "pushed",
          kind: "task",
          tableXId: task.id,
        });
      } catch (err) {
        result.errors.push(
          `Push task ${task.id} failed: ${(err as Error).message}`,
        );
        result.log.push({
          at: syncedAt,
          direction: "error",
          kind: "task",
          tableXId: task.id,
          detail: (err as Error).message,
        });
      }
    }
    // dir === "noop" → no log entry to keep noise down.
  }

  return result;
}

/** Drop fields from a task patch that match the current task — pure noise. */
function trimNoOpTaskPatch(task: Task, patch: Partial<Task>): Partial<Task> {
  const out: Partial<Task> = {};
  for (const [key, value] of Object.entries(patch) as Array<
    [keyof Task, Task[keyof Task]]
  >) {
    if (key === "labels") {
      const a = (task.labels ?? []).slice().sort();
      const b = ((value as string[]) ?? []).slice().sort();
      if (a.join("|") !== b.join("|")) {
        (out as Record<string, unknown>)[key] = value;
      }
      continue;
    }
    if ((task as unknown as Record<string, unknown>)[key] !== value) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}
