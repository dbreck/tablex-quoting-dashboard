import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
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

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 }
    );
  }

  // Fetch all auth users for last_sign_in_at
  const {
    data: { users: authUsers },
    error: authUsersError,
  } = await adminClient.auth.admin.listUsers();

  if (authUsersError) {
    return NextResponse.json(
      { error: authUsersError.message },
      { status: 500 }
    );
  }

  // Build lookup of auth user data by id
  const authUserMap = new Map(
    authUsers.map((u) => [u.id, { last_sign_in_at: u.last_sign_in_at }])
  );

  // Merge last_sign_in_at into profiles
  const merged = (profiles ?? []).map((profile) => ({
    ...profile,
    last_sign_in_at: authUserMap.get(profile.id)?.last_sign_in_at ?? null,
  }));

  return NextResponse.json(merged);
}

export async function POST(request: Request) {
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

  // Parse and validate body
  const body = await request.json();
  const { email, full_name, role, send_invite, password, organization_id } = body as {
    email?: string;
    full_name?: string;
    role?: "admin" | "contributor" | "rep";
    send_invite?: boolean;
    password?: string;
    organization_id?: string;
  };

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  if (password && password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Create the user (with password if provided)
  const { data: newUserData, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      ...(password ? { password } : {}),
      user_metadata: { full_name: full_name || "" },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Update profile with full_name, role, and organization_id if provided
  const profileUpdate: Record<string, string | null> = {};
  if (full_name) profileUpdate.full_name = full_name;
  if (role && ["admin", "contributor", "rep"].includes(role)) profileUpdate.role = role;
  if (organization_id !== undefined) profileUpdate.organization_id = organization_id || null;

  if (Object.keys(profileUpdate).length > 0) {
    await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("id", newUserData.user.id);
  }

  // Send invite email if requested (uses Supabase's built-in email)
  if (send_invite !== false) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");

    const { error: inviteError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/set-password`,
    });

    if (inviteError) {
      // User was created but invite failed — still report success with warning
      return NextResponse.json(
        { user: newUserData.user, message: `User created but invite email failed: ${inviteError.message}` },
        { status: 201 }
      );
    }
  }

  return NextResponse.json(
    { user: newUserData.user, message: send_invite !== false ? "User created and invite sent" : "User created" },
    { status: 201 }
  );
}
