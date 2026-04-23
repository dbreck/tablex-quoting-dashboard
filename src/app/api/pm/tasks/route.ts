import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { rowToTask, type TaskRow } from "@/lib/supabase/tracker-converters";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const sprintId = url.searchParams.get("sprintId");
  const assignee = url.searchParams.get("assignee");
  const deliverableId = url.searchParams.get("deliverableId");
  const column = url.searchParams.get("column");
  const priority = url.searchParams.get("priority");

  const supabase = createAdminClient();
  let query = supabase.from("project_tasks").select("*");

  if (sprintId) query = query.eq("sprint_id", sprintId);
  if (assignee) query = query.eq("assignee", assignee);
  if (deliverableId) query = query.eq("deliverable_id", deliverableId);
  if (column) query = query.eq("column", column);
  if (priority) query = query.eq("priority", priority);

  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((r) => rowToTask(r as TaskRow)));
}
