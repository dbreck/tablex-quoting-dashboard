/**
 * Export Gravity Forms "Quote Request" entries from the TableX WordPress site.
 *
 * Connects directly to Local WP's MySQL via socket and reads all entries
 * from GF Form ID 7, maps numeric field IDs to readable names, and writes clean JSON.
 *
 * Usage:
 *   npx tsx scripts/export-gf-quotes.ts
 *
 * Output:
 *   src/data/gf-quote-requests.json
 *
 * Requires: Local WP site "tablex-og" running in Local WP
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Local WP MySQL connection (tablex-og site)
// ---------------------------------------------------------------------------
const MYSQL_BIN =
  "/Users/dannybreckenridge/Library/Application Support/Local/lightning-services/mysql-8.0.35+4/bin/darwin-arm64/bin/mysql";
const MYSQL_SOCKET =
  "/Users/dannybreckenridge/Library/Application Support/Local/run/IXOY7MV5N/mysql/mysqld.sock";
const MYSQL_HOME =
  "/Users/dannybreckenridge/Library/Application Support/Local/run/IXOY7MV5N/conf/mysql";
const DB_USER = "root";
const DB_PASS = "root";
const DB_NAME = "local";

// ---------------------------------------------------------------------------
// GF field ID → readable key mapping (from Form 7 field structure)
// ---------------------------------------------------------------------------
const FIELD_MAP: Record<string, string> = {
  // Contact info
  "37": "companyName",
  "54": "projectName",
  "38": "contactName",
  "40": "contactEmail",
  "42": "contactPhone",
  "55": "ccEmail",
  "1": "quantity",

  // Base info
  "57": "baseNeeded",
  "52": "baseSeries",
  "5": "height",
  "5.1": "heightOther",
  "7": "folding",
  "8": "flipTop",
  "9": "nesting",
  "10": "footRing",
  "53": "baseFinish",
  "12": "chrome",

  // Adjustable height options (checkboxes — 6.x)
  "6.1": "adjCounterBalance",
  "6.2": "adjShortBalance",
  "6.3": "adjPneumatic",
  "6.4": "adjElectric",
  "6.5": "adjBatteryElectric",
  "6.6": "adjRatchet",
  "6.7": "adjCrank",
  "6.8": "adjManualHeight",

  // Base add-ons
  "13.1": "wireSnapOnLegCover",
  "13.2": "wireMagneticLegCover",
  "13.3": "wireAccessDoorInColumn",
  "14": "casterSize",
  "15": "industrialCasters",

  // Top info
  "4": "topNeeded",
  "16": "topSize",
  "58": "topShape",
  "50": "topMaterial",
  "18": "hplSelection",
  "51": "solidSurfaceSelection",
  "19": "hplMarkerboard",
  "21": "radiusCorners",
  "22": "edgeSelection",

  // Accessories — modesty/privacy panels (23.x)
  "23.1": "panelFrostedModesty",
  "23.2": "panelFrostedPrivacy",
  "23.3": "panelLaminateModesty",
  "23.4": "panelLaminatePrivacy",
  "23.5": "panelMetalModesty",
  "23.6": "panelMeshModesty",

  // Accessories — ganging (24.x)
  "24.1": "gangingQuickConnect",

  // Accessories — other
  "25": "grommetLocation",
  "27": "powerConfig",
  "28": "powerUnitLocation",
  "36": "daisyChainedPower",

  // Accessory add-ons (29.x)
  "29.1": "addOnCableGrippers",
  "29.2": "addOnJChannel",
  "29.3": "addOnWireManagementSpine",
  "29.4": "addOnMiniDrawer",

  // Additional info
  "30": "fileUpload",
  "31": "specialRequests",
  "32": "orderDate",
  "33": "deliveryDate",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run a MySQL query against Local WP and return parsed rows */
function mysqlQuery(sql: string): Record<string, string>[] {
  const cmd = [
    `MYSQL_HOME="${MYSQL_HOME}"`,
    `"${MYSQL_BIN}"`,
    `-u ${DB_USER}`,
    `-p${DB_PASS}`,
    `--socket="${MYSQL_SOCKET}"`,
    DB_NAME,
    `-e "${sql.replace(/"/g, '\\"')}"`,
  ].join(" ");

  const output = execSync(cmd, {
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"], // suppress password warning on stderr
  });

  const lines = output.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const vals = line.split("\t");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] ?? "";
    });
    return row;
  });
}

/** Check if a meta key is a GF field (numeric or dotted numeric like "6.1") */
function isFieldKey(key: string): boolean {
  return /^\d+(\.\d+)?$/.test(key);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Exporting Gravity Forms Quote Requests ===\n");

  // 1. Fetch all entries for form 7
  console.log("Fetching entries...");
  const entries = mysqlQuery(
    `SELECT id, date_created, created_by, status
     FROM wp_gf_entry
     WHERE form_id = 7 AND status = 'active'
     ORDER BY date_created ASC`
  );
  console.log(`  Found ${entries.length} active entries\n`);

  if (entries.length === 0) {
    console.log("No entries found. Exiting.");
    return;
  }

  // 2. Fetch ALL entry meta for form 7 entries in one query
  //    (much faster than per-entry queries)
  console.log("Fetching entry meta (this may take a moment)...");
  const meta = mysqlQuery(
    `SELECT em.entry_id, em.meta_key, em.meta_value
     FROM wp_gf_entry_meta em
     INNER JOIN wp_gf_entry e ON em.entry_id = e.id
     WHERE e.form_id = 7 AND e.status = 'active'
     ORDER BY em.entry_id, em.meta_key`
  );
  console.log(`  Fetched ${meta.length} meta rows\n`);

  // 3. Group meta by entry_id, keeping only GF field keys
  const metaByEntry = new Map<string, Map<string, string>>();
  for (const row of meta) {
    if (!isFieldKey(row.meta_key)) continue;
    if (!row.meta_value || row.meta_value === "" || row.meta_value === "NULL")
      continue;

    if (!metaByEntry.has(row.entry_id)) {
      metaByEntry.set(row.entry_id, new Map());
    }
    metaByEntry.get(row.entry_id)!.set(row.meta_key, row.meta_value);
  }

  // 4. Build clean records
  console.log("Building records...");
  const records: Record<string, unknown>[] = [];

  for (const entry of entries) {
    const fieldMap = metaByEntry.get(entry.id) ?? new Map<string, string>();

    const record: Record<string, unknown> = {
      entryId: parseInt(entry.id, 10),
      dateCreated: entry.date_created,
      createdBy: entry.created_by ? parseInt(entry.created_by, 10) : null,
    };

    // Map each GF field to its readable name
    for (const [fieldId, value] of fieldMap) {
      const key = FIELD_MAP[fieldId];
      if (key) {
        // Parse quantity as number
        if (key === "quantity") {
          record[key] = parseFloat(value) || 0;
        } else {
          record[key] = value;
        }
      }
      // Skip unmapped internal GF fields
    }

    // Collect checkbox groups into arrays for cleaner output
    record.adjustableHeight = collectCheckboxGroup(fieldMap, {
      "6.1": "Counter-Balance (BL)",
      "6.2": "Short-Balance (BLS)",
      "6.3": "Pneumatic (NU)",
      "6.4": "Electric (EH)",
      "6.5": "Battery Electric (BEH)",
      "6.6": "Ratchet (RA)",
      "6.7": "Crank (CR)",
      "6.8": "Manual Height (EX)",
    });

    record.wireManagement = collectCheckboxGroup(fieldMap, {
      "13.1": "Snap-on Leg Cover (WMLC)",
      "13.2": "Magnetic Leg Cover (MMLC)",
      "13.3": "Access Door in Column (WM)",
    });

    record.panels = collectCheckboxGroup(fieldMap, {
      "23.1": "Frosted Acrylic - Modesty",
      "23.2": "Frosted Acrylic - Privacy",
      "23.3": "Laminate - Modesty",
      "23.4": "Laminate - Privacy",
      "23.5": "Metal - Modesty",
      "23.6": "Mesh - Modesty",
    });

    record.accessories = collectCheckboxGroup(fieldMap, {
      "24.1": "Quick Connect Ganging (QG)",
      "29.1": "Cable Grippers",
      "29.2": "J-Channel",
      "29.3": "Wire Management Spine",
      "29.4": "Mini Drawer",
    });

    // Remove the individual checkbox fields since we consolidated them
    const checkboxKeys = [
      "adjCounterBalance", "adjShortBalance", "adjPneumatic", "adjElectric",
      "adjBatteryElectric", "adjRatchet", "adjCrank", "adjManualHeight",
      "wireSnapOnLegCover", "wireMagneticLegCover", "wireAccessDoorInColumn",
      "panelFrostedModesty", "panelFrostedPrivacy", "panelLaminateModesty",
      "panelLaminatePrivacy", "panelMetalModesty", "panelMeshModesty",
      "gangingQuickConnect", "addOnCableGrippers", "addOnJChannel",
      "addOnWireManagementSpine", "addOnMiniDrawer",
    ];
    for (const k of checkboxKeys) delete record[k];

    // Remove empty arrays
    if ((record.adjustableHeight as string[]).length === 0) delete record.adjustableHeight;
    if ((record.wireManagement as string[]).length === 0) delete record.wireManagement;
    if ((record.panels as string[]).length === 0) delete record.panels;
    if ((record.accessories as string[]).length === 0) delete record.accessories;

    records.push(record);
  }

  // 5. Write output
  const outPath = join(__dirname, "..", "src", "data", "gf-quote-requests.json");
  writeFileSync(outPath, JSON.stringify(records, null, 2));
  console.log(`\nWrote ${records.length} records to ${outPath}`);

  // 6. Print summary stats
  printStats(records);
}

/** Collect checked checkbox values into an array */
function collectCheckboxGroup(
  fieldMap: Map<string, string>,
  mapping: Record<string, string>
): string[] {
  const result: string[] = [];
  for (const [fieldId, label] of Object.entries(mapping)) {
    const val = fieldMap.get(fieldId);
    if (val && val !== "" && val !== "NULL") {
      result.push(label);
    }
  }
  return result;
}

/** Print summary statistics */
function printStats(records: Record<string, unknown>[]) {
  console.log("\n=== Summary ===");
  console.log(`Total records: ${records.length}`);

  // Date range
  const dates = records.map((r) => r.dateCreated as string).sort();
  console.log(`Date range: ${dates[0]} → ${dates[dates.length - 1]}`);

  // Unique companies
  const companies = new Set(
    records
      .map((r) => (r.companyName as string)?.trim())
      .filter(Boolean)
  );
  console.log(`Unique companies: ${companies.size}`);

  // Top 10 companies by volume
  const companyCounts: Record<string, number> = {};
  for (const r of records) {
    const name = (r.companyName as string)?.trim();
    if (name) companyCounts[name] = (companyCounts[name] || 0) + 1;
  }
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  console.log("\nTop 15 companies by quote volume:");
  for (const [name, count] of topCompanies) {
    console.log(`  ${count.toString().padStart(4)} | ${name}`);
  }

  // Base series distribution
  const seriesCounts: Record<string, number> = {};
  for (const r of records) {
    const series = r.baseSeries as string;
    if (series) seriesCounts[series] = (seriesCounts[series] || 0) + 1;
  }
  const topSeries = Object.entries(seriesCounts)
    .sort((a, b) => b[1] - a[1]);
  console.log("\nBase series distribution:");
  for (const [name, count] of topSeries) {
    console.log(`  ${count.toString().padStart(4)} | ${name}`);
  }

  // Monthly volume
  const monthlyCounts: Record<string, number> = {};
  for (const r of records) {
    const date = r.dateCreated as string;
    if (date) {
      const month = date.substring(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }
  }
  console.log("\nMonthly volume:");
  for (const [month, count] of Object.entries(monthlyCounts).sort()) {
    const bar = "█".repeat(Math.round(count / 2));
    console.log(`  ${month} | ${count.toString().padStart(3)} ${bar}`);
  }
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
