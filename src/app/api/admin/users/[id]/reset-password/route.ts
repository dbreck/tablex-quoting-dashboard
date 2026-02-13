import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
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

  // Parse body for optional password
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  // If password provided, set it directly via admin API
  if (password) {
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(id, {
      password,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Password updated" });
  }

  // Otherwise, send reset email via Supabase
  const { data: profile, error: lookupError } = await adminClient
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single();

  if (lookupError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");

  const { error: resetError } =
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/set-password`,
    });

  if (resetError) {
    return NextResponse.json(
      { error: resetError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Password reset email sent" });
}
