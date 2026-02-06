/**
 * Seed reference data into Supabase from JSON files.
 *
 * Usage:
 *   npx tsx scripts/seed-reference-data.ts
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

const dataDir = join(__dirname, "..", "src", "data");

function loadJson(filename: string) {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

// Map camelCase JSON keys to snake_case DB columns
function mapProductCatalog(row: Record<string, unknown>) {
  return {
    sku: row.sku,
    series: row.series,
    shape: row.shape,
    shape_name: row.shapeName,
    size: row.size,
    base_type: row.baseType,
    top_cost: row.topCost ?? 0,
    route_cost: row.routeCost ?? 0,
    base_cost: row.baseCost ?? 0,
    nest_fold_cost: row.nestFoldCost ?? 0,
    asb_gn_lc_cost1: row.asbGnLcCost1 ?? 0,
    asb_gn_lc_cost2: row.asbGnLcCost2 ?? 0,
    assembly_cost: row.assemblyCost ?? 0,
    lf_cost: row.lfCost ?? 0,
    edge_cost: row.edgeCost ?? 0,
    freight_in_cost: row.freightInCost ?? 0,
    packaging_cost: row.packagingCost ?? 0,
    total_cost: row.totalCost ?? 0,
    freight_out_pct: row.freightOutPct ?? 0,
    gpm: row.gpm ?? 0,
    commission: row.commission ?? 0,
    standard_price: row.standardPrice ?? 0,
    net_profit: row.netProfit ?? 0,
    list_price: row.listPrice ?? 0,
    discount_factor: row.discountFactor ?? 0,
    net_price: row.netPrice ?? 0,
    new_net_profit: row.newNetProfit ?? 0,
    price_50_20: row.price_50_20 ?? 0,
    price_50_20_5: row.price_50_20_5 ?? 0,
    price_50_20_10: row.price_50_20_10 ?? 0,
    price_50_20_15: row.price_50_20_15 ?? 0,
    price_50_20_20: row.price_50_20_20 ?? 0,
    notes: row.notes ?? null,
  };
}

function mapProfitAnalysis(row: Record<string, unknown>) {
  return {
    tag: row.tag ?? null,
    qty: row.qty ?? 0,
    sku: row.sku,
    series: row.series,
    top_cost: row.topCost ?? 0,
    route_cost: row.routeCost ?? 0,
    base_cost: row.baseCost ?? 0,
    nest_fold_cost: row.nestFoldCost ?? 0,
    asb_gn_lc_cost1: row.asbGnLcCost1 ?? 0,
    asb_gn_lc_cost2: row.asbGnLcCost2 ?? 0,
    assembly_cost: row.assemblyCost ?? 0,
    lf_cost: row.lfCost ?? 0,
    freight_in_cost: row.freightInCost ?? 0,
    packaging_cost: row.packagingCost ?? 0,
    total_cost: row.totalCost ?? 0,
    freight_out_pct: row.freightOutPct ?? 0,
    gpm: row.gpm ?? 0,
    commission: row.commission ?? 0,
    standard_price: row.standardPrice ?? 0,
    net_profit: row.netProfit ?? 0,
    list_price: row.listPrice ?? 0,
    discount_factor: row.discountFactor ?? 0,
    net_price: row.netPrice ?? 0,
    new_net_profit: row.newNetProfit ?? 0,
    notes: row.notes ?? null,
    price_50_20: row.price_50_20 ?? 0,
    price_50_20_5: row.price_50_20_5 ?? 0,
    price_50_20_10: row.price_50_20_10 ?? 0,
    price_50_20_15: row.price_50_20_15 ?? 0,
    price_50_20_20: row.price_50_20_20 ?? 0,
  };
}

function mapQuoteQueue(row: Record<string, unknown>) {
  return {
    row_num: row.rowNum ?? null,
    email_from: row.emailFrom ?? null,
    date_time: row.dateTime ?? null,
    date_normalized: row.dateNormalized ?? null,
    year: row.year ?? null,
    quote_number: row.quoteNumber ?? null,
    dealer_project: row.dealerProject ?? null,
    special: row.special ?? false,
    staff: row.staff ?? null,
    status: row.status ?? null,
    status_normalized: row.statusNormalized ?? null,
  };
}

async function seedTable(tableName: string, data: Record<string, unknown>[], batchSize = 500) {
  console.log(`Seeding ${tableName}: ${data.length} rows...`);

  // Clear existing data
  const { error: delError } = await supabase.from(tableName).delete().neq("id", 0);
  if (delError) console.warn(`  Warning clearing ${tableName}:`, delError.message);

  // Insert in batches
  let inserted = 0;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);
    if (error) {
      console.error(`  Error inserting batch at offset ${i}:`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`  ${inserted}/${data.length}\r`);
  }
  console.log(`  Done: ${inserted} rows inserted.`);
}

async function main() {
  console.log("=== TableX Reference Data Seeder ===\n");

  // 1. Product Catalog (6,098 rows)
  const catalog = loadJson("product-catalog.json");
  await seedTable("product_catalog", catalog.map(mapProductCatalog));

  // 2. Profit Analysis (589 rows)
  const profit = loadJson("profit-analysis.json");
  await seedTable("profit_analysis", profit.map(mapProfitAnalysis));

  // 3. Quote Queue (3,595 rows)
  const queue = loadJson("quote-queue.json");
  await seedTable("quote_queue", queue.map(mapQuoteQueue));

  // 4. Quote Queue Metrics (1 row, JSONB)
  const metrics = loadJson("quote-queue-metrics.json");
  console.log("Seeding quote_queue_metrics: 1 row...");
  await supabase.from("quote_queue_metrics").delete().neq("id", 0);
  const { error: metricsError } = await supabase
    .from("quote_queue_metrics")
    .insert({ data: metrics });
  if (metricsError) throw metricsError;
  console.log("  Done.");

  // 5. Staff (4 rows)
  const staff = loadJson("staff.json");
  await seedTable("staff", staff);

  // 6. Dealers (13 rows)
  const dealers = loadJson("dealers.json");
  await seedTable("dealers", dealers);

  console.log("\n=== All reference data seeded successfully! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
