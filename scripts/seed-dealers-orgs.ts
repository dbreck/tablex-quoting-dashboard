/**
 * Seed TableX dealers and rep groups as organizations in the CRM.
 *
 * Reads from:
 *   - src/data/dealers.json   (1,105 dealers with quoteCount, firstSeen, lastSeen)
 *   - src/data/rep-groups.json (rep groups with quoteCount, firstSeen, lastSeen)
 *
 * Behavior:
 *   - Skips dealers that already exist as seeded orgs (by name match)
 *   - Inserts only NEW dealers/rep groups
 *   - Logs a summary of what was added vs skipped
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

interface DealerEntry {
  name: string;
  quoteCount: number;
  firstSeen: string | null;
  lastSeen: string | null;
  isRepGroup?: boolean;
}

async function main() {
  console.log("=== Seeding Dealers & Rep Groups as CRM Organizations ===\n");

  // Read data files
  const dealers: DealerEntry[] = JSON.parse(
    readFileSync(join(__dirname, "..", "src", "data", "dealers.json"), "utf-8")
  );
  const repGroups: DealerEntry[] = JSON.parse(
    readFileSync(join(__dirname, "..", "src", "data", "rep-groups.json"), "utf-8")
  );

  console.log(`Loaded ${dealers.length} dealers and ${repGroups.length} rep groups from data files.`);

  // Fetch all existing seeded org names
  const { data: existing, error: fetchError } = await supabase
    .from("organizations")
    .select("name")
    .eq("is_seeded", true);

  if (fetchError) {
    console.error("Error fetching existing orgs:", fetchError.message);
    process.exit(1);
  }

  const existingNames = new Set((existing ?? []).map((o: { name: string }) => o.name));
  console.log(`Found ${existingNames.size} existing seeded orgs in database.\n`);

  // Build org records for NEW dealers only
  let skippedDealers = 0;
  const newDealerOrgs = dealers
    .filter((d) => {
      if (existingNames.has(d.name)) {
        skippedDealers++;
        return false;
      }
      return true;
    })
    .map((d) => {
      const years = d.firstSeen && d.lastSeen
        ? `${d.firstSeen}-${d.lastSeen}`
        : "no quote history";
      return {
        name: d.name,
        type: "dealer" as const,
        default_tier: "50_20" as const,
        is_seeded: true,
        notes: `${d.quoteCount} quotes (${years})`,
      };
    });

  // Build org records for NEW rep groups only
  let skippedRepGroups = 0;
  const newRepGroupOrgs = repGroups
    .filter((r) => {
      if (existingNames.has(r.name)) {
        skippedRepGroups++;
        return false;
      }
      return true;
    })
    .map((r) => {
      const years = r.firstSeen && r.lastSeen
        ? `${r.firstSeen}-${r.lastSeen}`
        : "no quote history";
      return {
        name: r.name,
        type: "dealer" as const,
        default_tier: "50_20" as const,
        is_seeded: true,
        notes: `Rep group | ${r.quoteCount} quotes (${years})`,
      };
    });

  const allNewOrgs = [...newDealerOrgs, ...newRepGroupOrgs];

  if (allNewOrgs.length === 0) {
    console.log("No new organizations to seed — all dealers and rep groups already exist.");
    console.log(`  Dealers skipped: ${skippedDealers}`);
    console.log(`  Rep groups skipped: ${skippedRepGroups}`);
    return;
  }

  // Insert in batches of 100 to avoid payload limits
  const BATCH_SIZE = 100;
  let totalInserted = 0;

  for (let i = 0; i < allNewOrgs.length; i += BATCH_SIZE) {
    const batch = allNewOrgs.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("organizations")
      .insert(batch)
      .select("id, name");

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      process.exit(1);
    }

    totalInserted += data.length;
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${data.length} orgs`);
  }

  // Summary
  console.log("\n--- Summary ---");
  console.log(`  New dealers added:     ${newDealerOrgs.length}`);
  console.log(`  Dealers skipped:       ${skippedDealers}`);
  console.log(`  New rep groups added:  ${newRepGroupOrgs.length}`);
  console.log(`  Rep groups skipped:    ${skippedRepGroups}`);
  console.log(`  Total inserted:        ${totalInserted}`);

  console.log("\n=== Done! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
