import { createClient } from "@supabase/supabase-js";

// Service-role client for seed scripts and admin operations.
// NEVER use this in client-side code or Server Components —
// only in scripts and API routes that need full DB access.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
