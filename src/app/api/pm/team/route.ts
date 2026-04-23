import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import { rowToTeamMember, type TeamMemberRow } from "@/lib/supabase/tracker-converters";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((r) => rowToTeamMember(r as TeamMemberRow)),
  );
}
