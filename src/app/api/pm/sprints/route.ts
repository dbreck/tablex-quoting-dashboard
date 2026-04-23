import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { rowToSprint, type SprintRow } from "@/lib/pm-api/sprint-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sprints")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((r) => rowToSprint(r as SprintRow)));
}
