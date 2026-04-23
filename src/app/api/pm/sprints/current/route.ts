import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { rowToSprint, type SprintRow } from "@/lib/pm-api/sprint-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const today = new Date().toISOString().slice(0, 10);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sprints")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ? rowToSprint(data as SprintRow) : null);
}
