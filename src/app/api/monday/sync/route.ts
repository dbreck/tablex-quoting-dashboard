import { NextResponse } from "next/server";
import { reconcile, type SyncRequest } from "@/lib/monday/reconcile";

export const dynamic = "force-dynamic";

/**
 * POST /api/monday/sync
 *
 * Body: SyncRequest — the client's current { tasks, deliverableOverrides,
 * syncState }. The server is stateless; it pulls Monday's current state,
 * pushes anything TableX-newer, and returns a SyncResult for the client to
 * apply via `applySyncPatches`.
 *
 * Sync calls can be slow (up to ~10s for a full board fetch + N pushes), so
 * we let Vercel use the default function timeout and rely on the client to
 * surface errors from a hard failure.
 */
export async function POST(request: Request) {
  let body: SyncRequest;
  try {
    body = (await request.json()) as SyncRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.tasks)) {
    return NextResponse.json(
      { error: "Missing or invalid `tasks` array" },
      { status: 400 },
    );
  }

  try {
    const result = await reconcile({
      tasks: body.tasks,
      deliverableOverrides: body.deliverableOverrides ?? {},
      syncState: body.syncState ?? {},
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Reconcile failed" },
      { status: 500 },
    );
  }
}
