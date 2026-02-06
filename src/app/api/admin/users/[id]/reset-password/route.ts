import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate caller
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check caller is admin
  const adminClient = createAdminClient();
  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Look up user email from profiles
  const { data: profile, error: lookupError } = await adminClient
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single();

  if (lookupError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Use the server client to trigger Supabase's built-in password reset email
  const serverClient = await createClient();
  const { error: resetError } =
    await serverClient.auth.resetPasswordForEmail(profile.email);

  if (resetError) {
    return NextResponse.json(
      { error: resetError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Password reset email sent" });
}
