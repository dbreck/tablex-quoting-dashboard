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
// Records are matched in priority order:
//   1. By stored sync link (syncState[tableXId].mondayItemId)
//   2. By External ID column on Monday (first-link via id match)
//   3. By {parent deliverable, title} for tasks (first-link via title match —
//      the seed creates subitems with deterministic IDs that don't match the
//      client's nanoid task IDs; this is the bridge)
//
// First-link policy:
//   - Tasks: TableX wins (push). The user's local edits are the truth.
//     Title-matched seed subitems get their external_id rewritten to the
//     TableX nanoid so future syncs match by id.
//   - Deliverables: Monday wins (pull) when Monday has populated overrides.
//     Otherwise no-op. Deliverable overrides are sparse and we'd rather
//     pick up Monday-side rationale/baseline than overwrite them.
//
// Item status rollup: deliverable Item status is computed from its child
// task columns (computeDeliverableStatus). Manual override on the
// deliverable wins over the rollup.

import { DELIVERABLES } from "@/data/project-phase2";
import {
  type DeliverableOverride,
  type ScopeStatus,
  type Task,
  type TeamMember,
  computeDeliverableStatus,
} from "@/data/project-tracker";
import {
  buildUserMaps,
  deliverableToMondayColumnValues,
  mondayItemToOverridePatch,
  mondaySubitemToTaskPatch,
  type UserMaps,
} from "./normalize";
import { snapshotMonday, type MondaySnapshot } from "./pull";
import {
  createTaskOnMonday,
  pushDeliverableToMonday,
  pushTaskToMonday,
} from "./push";
import { fetchMondayUsers } from "./users";
import type { SyncLink } from "@/store/project-tracker-store";
import type { MondayItem, MondaySubitem } from "./types";

const NO_OP_WINDOW_MS = 1_000;

// ─── Inputs from the client ──────────────────────────────────────────────────

export interface SyncRequest {
  tasks: Task[];
  deliverableOverrides: Record<string, DeliverableOverride>;
  syncState: Record<string, SyncLink>;
  /** Used for Owner column mapping by email. Optional — sync still works without it. */
  teamMembers?: Record<string, TeamMember>;
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
  pushedTaskIds: string[];
  pushedDeliverableIds: string[];
  linkUpdates: LinkUpdate[];
  log: SyncLogEntry[];
  errors: string[];
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

  if (within(tableXUpdatedAtMs, mondayUpdatedAtMs, NO_OP_WINDOW_MS)) {
    return "noop";
  }
  return tableXUpdatedAtMs > mondayUpdatedAtMs ? "push" : "pull";
}

/** Find an unclaimed subitem under `parent` with matching title. */
function findUnclaimedSubitemByTitle(
  parent: MondayItem,
  title: string,
  claimed: Set<string>,
): MondaySubitem | null {
  for (const sub of parent.subitems ?? []) {
    if (claimed.has(sub.id)) continue;
    if (sub.name === title) return sub;
  }
  return null;
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

  // Fetch board snapshot + Monday users in parallel.
  let snapshot: MondaySnapshot;
  let userMaps: UserMaps;
  try {
    const [snap, mondayUsers] = await Promise.all([
      snapshotMonday(),
      fetchMondayUsers().catch((err) => {
        // Non-fatal — Owner mapping just won't work.
        result.errors.push(`User fetch failed (Owner mapping disabled): ${(err as Error).message}`);
        return [];
      }),
    ]);
    snapshot = snap;
    userMaps = buildUserMaps(req.teamMembers ?? {}, mondayUsers);
  } catch (err) {
    result.errors.push(`Snapshot failed: ${(err as Error).message}`);
    return result;
  }
  result.subitemBoardId = snapshot.subitemBoardId;

  // ── Deliverable overrides + status rollup ────────────────────────────────────

  for (const deliverable of DELIVERABLES) {
    const mondayRecord = snapshot.itemsByExternalId.get(deliverable.id);
    if (!mondayRecord) {
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

    // Pull side: if Monday changed since we last saw it, prefer Monday's state.
    if (!isFirstLink) {
      const mondayMs = tsMs(mondayRecord.mondayUpdatedAt);
      const lastMondayMs = tsMs(link.lastMondayUpdatedAt);
      if (mondayMs > lastMondayMs) {
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
    }

    // First-link with no Monday-side data → just record the link, prefer
    // pulling any populated Monday fields into the override.
    if (isFirstLink) {
      const patch = mondayItemToOverridePatch(
        mondayRecord.raw,
        snapshot.itemColumnsByTitle,
      );
      if (Object.keys(patch).length > 0) {
        result.overridePatches.push({
          deliverableId: deliverable.id,
          patch,
          mondayItemId: mondayRecord.mondayItemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? syncedAt,
        });
      } else {
        result.linkUpdates.push({
          tableXId: deliverable.id,
          mondayItemId: mondayRecord.mondayItemId,
          mondayUpdatedAt: mondayRecord.mondayUpdatedAt ?? null,
        });
      }
      result.log.push({
        at: syncedAt,
        direction: "linked",
        kind: "deliverable",
        tableXId: deliverable.id,
      });
      // Fall through into the push-rollup check below — we still want to
      // assert the rollup status if it differs from Monday.
    }

    // Push side: compute desired Monday status (manual override > rollup),
    // build the column_values payload, compare to what Monday currently
    // expresses, push if different.
    const computedStatus: ScopeStatus =
      override?.manualStatus ??
      computeDeliverableStatus(deliverable.id, req.tasks);

    const wouldPush = deliverableToMondayColumnValues(
      deliverable,
      override,
      snapshot.itemColumnsByTitle,
      { statusOverride: computedStatus },
    );
    // Monday's current-state equivalent: feed Monday's column values back
    // through the same normalize path, using Monday's status as the override.
    const currentMondayPatch = mondayItemToOverridePatch(
      mondayRecord.raw,
      snapshot.itemColumnsByTitle,
    );
    const mondayActual = deliverableToMondayColumnValues(
      deliverable,
      { deliverableId: deliverable.id, ...currentMondayPatch },
      snapshot.itemColumnsByTitle,
      { statusOverride: currentMondayPatch.manualStatus ?? undefined },
    );
    if (JSON.stringify(wouldPush) === JSON.stringify(mondayActual)) {
      continue;
    }

    try {
      await pushDeliverableToMonday({
        deliverable,
        override,
        mondayItemId: mondayRecord.mondayItemId,
        itemColumnsByTitle: snapshot.itemColumnsByTitle,
        itemName: mondayRecord.name,
        statusOverride: computedStatus,
      });
      result.pushedDeliverableIds.push(deliverable.id);
      result.log.push({
        at: syncedAt,
        direction: "pushed",
        kind: "deliverable",
        tableXId: deliverable.id,
        detail: `Status: ${computedStatus}`,
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

  // ── Tasks ───────────────────────────────────────────────────────────────────

  if (!result.subitemBoardId) {
    result.errors.push(
      "Subitem board id unresolved — task subitems were not reconciled.",
    );
    return result;
  }
  const subitemBoardId = result.subitemBoardId;

  // Track subitem ids that have been claimed by a TableX task in this pass,
  // so the title-match fallback doesn't double-link.
  const claimedSubitemIds = new Set<string>();

  for (const task of req.tasks) {
    // Resolve the Monday subitem in priority order: stored sync link →
    // external_id match → title match under parent. If the stored link is
    // stale (target no longer exists), fall through to the other strategies
    // and treat this as a fresh first-link.
    let mondayRecord:
      | {
          mondaySubitemId: string;
          parentMondayItemId: string;
          externalId: string;
          name: string;
          mondayUpdatedAt: string | null;
          raw: MondaySubitem;
        }
      | undefined;
    let link: SyncLink | undefined = req.syncState[task.id];
    let titleMatched = false;

    // Priority 1: resolve via stored sync link (survives external_id changes
    // on the Monday side).
    if (link?.mondayItemId) {
      const parent = snapshot.itemsByExternalId.get(task.deliverableId);
      const raw = parent?.raw.subitems?.find(
        (s) => s.id === link!.mondayItemId,
      );
      if (parent && raw) {
        mondayRecord = {
          mondaySubitemId: raw.id,
          parentMondayItemId: parent.mondayItemId,
          externalId: task.id,
          name: raw.name,
          mondayUpdatedAt: raw.updated_at ?? null,
          raw,
        };
        claimedSubitemIds.add(raw.id);
      } else {
        // Stale link (e.g., re-seed deleted the subitem). Reset and retry.
        link = undefined;
      }
    }

    // Priority 2: match by external_id column on Monday.
    if (!mondayRecord) {
      const byExt = snapshot.subitemsByExternalId.get(task.id);
      if (byExt) {
        mondayRecord = byExt;
        claimedSubitemIds.add(byExt.mondaySubitemId);
      }
    }

    // Priority 3: title match under the parent deliverable (bridges the
    // seed's deterministic ids to client nanoid task ids).
    if (!mondayRecord) {
      const parent = snapshot.itemsByExternalId.get(task.deliverableId);
      if (parent) {
        const candidate = findUnclaimedSubitemByTitle(
          parent.raw,
          task.title,
          claimedSubitemIds,
        );
        if (candidate) {
          mondayRecord = {
            mondaySubitemId: candidate.id,
            parentMondayItemId: parent.mondayItemId,
            externalId: task.id,
            name: candidate.name,
            mondayUpdatedAt: candidate.updated_at ?? null,
            raw: candidate,
          };
          claimedSubitemIds.add(candidate.id);
          titleMatched = true;
        }
      }
    }

    // No match any way → auto-create on Monday under the parent.
    if (!mondayRecord) {
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
          userMaps,
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

    const isFirstLink = !link;

    // First-link policy for tasks: TableX wins. Push our state to the
    // matched Monday subitem. This rewrites the subitem's external_id to
    // our nanoid (via taskToMondayColumnValues), so the next sync finds
    // it by id and avoids any title-match work.
    if (isFirstLink) {
      try {
        await pushTaskToMonday({
          task,
          mondaySubitemId: mondayRecord.mondaySubitemId,
          subitemBoardId,
          subitemColumnsByTitle: snapshot.subitemColumnsByTitle,
          subitemName: mondayRecord.name,
          userMaps,
        });
        result.pushedTaskIds.push(task.id);
        result.linkUpdates.push({
          tableXId: task.id,
          mondayItemId: mondayRecord.mondaySubitemId,
          mondayUpdatedAt: syncedAt,
        });
        result.log.push({
          at: syncedAt,
          direction: "linked",
          kind: "task",
          tableXId: task.id,
          detail: titleMatched ? "Title-matched + pushed" : "ID-matched + pushed",
        });
      } catch (err) {
        result.errors.push(
          `First-link push for task ${task.id} failed: ${(err as Error).message}`,
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

    // Already linked — decide direction by timestamp. (Link is guaranteed
    // defined here: isFirstLink is `!link`, and isFirstLink=true took the
    // branch above.)
    const dir = decideDirection({
      tableXUpdatedAtMs: tsMs(task.updatedAt),
      mondayUpdatedAtMs: tsMs(mondayRecord.mondayUpdatedAt),
      link: link!,
    });

    if (dir === "pull") {
      const patch = mondaySubitemToTaskPatch(
        mondayRecord.raw,
        snapshot.subitemColumnsByTitle,
        userMaps,
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
          userMaps,
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
