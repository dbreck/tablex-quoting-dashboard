import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiToken } from "@/lib/pm-api/auth";
import {
  rowToBurndownSnapshot,
  type BurndownSnapshotRow,
} from "@/lib/pm-api/sprint-types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sprintId: string }> },
) {
  const auth = requireApiToken(request);
  if (auth) return auth;

  const { sprintId } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("burndown_snapshots")
    .select("*")
    .eq("sprint_id", sprintId)
    .order("snapshot_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((r) => rowToBurndownSnapshot(r as BurndownSnapshotRow)),
  );
}
