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
  const { email, full_name } = body as {
    email?: string;
    full_name?: string;
  };

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Create the user
  const { data: newUserData, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Update profile with full_name if provided
  if (full_name) {
    await adminClient
      .from("profiles")
      .update({ full_name })
      .eq("id", newUserData.user.id);
  }

  // Generate recovery link so the user can set their password
  // The user will need to reset their password on first login
  await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  return NextResponse.json(newUserData.user, { status: 201 });
}
