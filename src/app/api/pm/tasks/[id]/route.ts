import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { rowToTask, type TaskRow } from "@/lib/supabase/tracker-converters";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(rowToTask(data as TaskRow));
}
