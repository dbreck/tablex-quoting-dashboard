import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { DELIVERABLES } from "@/data/project-phase2";
import { computeDeliverableStatus } from "@/data/project-tracker";
import {
  rowToTask,
  rowToOverride,
  type TaskRow,
  type DeliverableOverrideRow,
} from "@/lib/supabase/tracker-converters";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const supabase = createAdminClient();
  const [tasksRes, overridesRes] = await Promise.all([
    supabase.from("project_tasks").select("*"),
    supabase.from("deliverable_overrides").select("*"),
  ]);

  if (tasksRes.error) {
    return NextResponse.json({ error: tasksRes.error.message }, { status: 500 });
  }
  if (overridesRes.error) {
    return NextResponse.json({ error: overridesRes.error.message }, { status: 500 });
  }

  const tasks = (tasksRes.data ?? []).map((r) => rowToTask(r as TaskRow));
  const overrideById = new Map(
    (overridesRes.data ?? []).map((r) => {
      const o = rowToOverride(r as DeliverableOverrideRow);
      return [o.deliverableId, o] as const;
    }),
  );

  const result = DELIVERABLES.map((d) => {
    const deliverableTasks = tasks.filter((t) => t.deliverableId === d.id);
    return {
      ...d,
      override: overrideById.get(d.id) ?? null,
      computedStatus: computeDeliverableStatus(d.id, tasks),
      taskCount: deliverableTasks.length,
      completedTaskCount: deliverableTasks.filter((t) => t.column === "done").length,
    };
  });

  return NextResponse.json(result);
}
