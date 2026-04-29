import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Returns the logged-in user's display info. Used by the wireframe iframe
 * to pre-fill the comment author field instead of asking for a name.
 *
 * Same-origin only — relies on Supabase auth cookies.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Pull the friendly name from the profiles table (admin client because the
  // browser caller might not be RLS-permitted to read profiles by id; the
  // narrow shape we return is safe to leak to any authed user.)
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const name =
    profile?.full_name?.trim() ||
    profile?.email ||
    user.email ||
    "Anonymous";

  return NextResponse.json({
    id: user.id,
    name,
    email: profile?.email ?? user.email ?? null,
  });
}
