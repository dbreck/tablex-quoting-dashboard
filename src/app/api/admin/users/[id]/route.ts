import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
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

  // Parse and validate body
  const body = await request.json();
  const { role } = body as { role?: string };

  if (!role || !["admin", "contributor"].includes(role)) {
    return NextResponse.json(
      { error: 'Role must be "admin" or "contributor"' },
      { status: 400 }
    );
  }

  // Prevent self-demotion
  if (id === user.id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  // Update role
  const { data: updatedProfile, error: updateError } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedProfile);
}

export async function DELETE(
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

  // Prevent self-delete
  if (id === user.id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  // Delete auth user (CASCADE will delete profile)
  const { error: deleteError } =
    await adminClient.auth.admin.deleteUser(id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "User deleted" });
}
