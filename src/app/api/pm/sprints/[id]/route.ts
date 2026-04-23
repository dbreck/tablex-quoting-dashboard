import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { rowToTask, type TaskRow } from "@/lib/supabase/tracker-converters";
import {
  rowToSprint,
  rowToBurndownSnapshot,
  type SprintRow,
  type BurndownSnapshotRow,
} from "@/lib/pm-api/sprint-types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  const [sprintRes, tasksRes, burndownRes] = await Promise.all([
    supabase.from("sprints").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("project_tasks")
      .select("*")
      .eq("sprint_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("burndown_snapshots")
      .select("*")
      .eq("sprint_id", id)
      .order("snapshot_date", { ascending: true }),
  ]);

  if (sprintRes.error) {
    return NextResponse.json({ error: sprintRes.error.message }, { status: 500 });
  }
  if (!sprintRes.data) {
    return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
  }
  if (tasksRes.error) {
    return NextResponse.json({ error: tasksRes.error.message }, { status: 500 });
  }
  if (burndownRes.error) {
    return NextResponse.json({ error: burndownRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...rowToSprint(sprintRes.data as SprintRow),
    tasks: (tasksRes.data ?? []).map((r) => rowToTask(r as TaskRow)),
    burndown: (burndownRes.data ?? []).map((r) =>
      rowToBurndownSnapshot(r as BurndownSnapshotRow),
    ),
  });
}
