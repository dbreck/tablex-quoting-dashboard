import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface IncomingComment {
  id: string;
  pageId: string;
  x: number;
  y: number;
  text: string;
  author?: string;
  resolved?: boolean;
}

interface SyncBody {
  pagePath: string;
  setKey: "site" | "system";
  pageId: string;
  comments: IncomingComment[];
}

async function authorizeCaller() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("can_access_proposal")
    .eq("id", user.id)
    .single();
  if (!profile?.can_access_proposal) {
    return { user: null, error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function GET(request: NextRequest) {
  const { user, error } = await authorizeCaller();
  if (error) return error;

  const setKey = request.nextUrl.searchParams.get("set");
  const admin = createAdminClient();

  let query = admin
    .from("wireframe_comments")
    .select("*")
    .order("created_at", { ascending: true });

  if (setKey === "site" || setKey === "system") {
    query = query.eq("set_key", setKey);
  }

  const { data, error: dbError } = await query;
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data ?? [], userId: user!.id });
}

export async function POST(request: NextRequest) {
  const { user, error } = await authorizeCaller();
  if (error) return error;

  let body: SyncBody;
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { pagePath, setKey, pageId, comments } = body;
  if (!pagePath || !setKey || !pageId || !Array.isArray(comments)) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (setKey !== "site" && setKey !== "system") {
    return NextResponse.json({ error: "invalid setKey" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find existing comment ids for this page
  const { data: existing, error: selErr } = await admin
    .from("wireframe_comments")
    .select("id")
    .eq("page_path", pagePath);
  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }
  const existingIds = new Set((existing ?? []).map((r) => r.id));
  const incomingIds = new Set(comments.map((c) => c.id));

  // Delete rows that the iframe no longer has
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (toDelete.length > 0) {
    const { error: delErr } = await admin
      .from("wireframe_comments")
      .delete()
      .in("id", toDelete);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }
  }

  // Upsert all incoming
  if (comments.length > 0) {
    const rows = comments.map((c) => ({
      id: c.id,
      page_path: pagePath,
      set_key: setKey,
      page_id: pageId,
      marker_x: Number(c.x),
      marker_y: Number(c.y),
      body: c.text,
      author: c.author?.trim() || "Anonymous",
      is_resolved: !!c.resolved,
      created_by: user!.id,
    }));
    const { error: upsertErr } = await admin
      .from("wireframe_comments")
      .upsert(rows, { onConflict: "id" });
    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, synced: comments.length, deleted: toDelete.length });
}
