/**
 * Seed 13 TableX dealers as organizations in the CRM.
 *
 * Usage:
 *   npx tsx scripts/seed-dealers-orgs.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load env vars
config({ path: join(__dirname, "..", ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log("=== Seeding Dealers as CRM Organizations ===\n");

  const dealers = JSON.parse(
    readFileSync(join(__dirname, "..", "src", "data", "dealers.json"), "utf-8")
  );

  // Check if any seeded orgs already exist
  const { data: existing } = await supabase
    .from("organizations")
    .select("name")
    .eq("is_seeded", true);

  if (existing && existing.length > 0) {
    console.log(`Found ${existing.length} existing seeded orgs. Skipping to avoid duplicates.`);
    console.log("To re-seed, first delete existing seeded orgs:");
    console.log("  DELETE FROM organizations WHERE is_seeded = true;");
    return;
  }

  const orgs = dealers.map((d: { name: string }) => ({
    name: d.name,
    type: "dealer",
    default_tier: "50_20",
    is_seeded: true,
  }));

  const { data, error } = await supabase
    .from("organizations")
    .insert(orgs)
    .select("id, name");

  if (error) {
    console.error("Error seeding organizations:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} dealer organizations:`);
  for (const org of data) {
    console.log(`  - ${org.name} (${org.id})`);
  }

  console.log("\n=== Done! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
