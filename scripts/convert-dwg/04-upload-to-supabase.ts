#!/usr/bin/env npx tsx
/**
 * 04-upload-to-supabase.ts
 *
 * Uploads GLB files to Supabase Storage bucket 'models'.
 * Files are stored under {seriesCode}/{filename} subdirectories.
 * Skips files that already exist in the bucket.
 *
 * Usage:
 *   npx tsx scripts/convert-dwg/04-upload-to-supabase.ts [--input-dir catalog/glb]
 *
 * Environment variables:
 *   SUPABASE_URL              - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (not anon key) for storage writes
 */

import fs from "node:fs";
import path from "node:path";

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../..");
const DEFAULT_INPUT = path.join(PROJECT_ROOT, "catalog/glb");
const BUCKET = "models";
const CONTENT_TYPE = "model/gltf-binary";

// Series directory name -> series code mapping
const SERIES_CODE_MAP: Record<string, string> = {
  Ultra: "00",
  Stretch: "06",
  Elite: "08",
  Foundation: "30",
  Fundamental: "33",
  Justice: "40",
  Artisan: "43",
  Primary: "44",
  Puddle: "45",
  Exclaim: "71",
  VertiGO: "74",
  Surge: "99",
};

function parseArgs(): { inputDir: string } {
  const args = process.argv.slice(2);
  let inputDir = DEFAULT_INPUT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input-dir" && args[i + 1]) {
      inputDir = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { inputDir };
}

function getEnvOrExit(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Environment variable ${name} is not set.`);
    console.error("Set it in your .env.local file or export it before running.");
    process.exit(1);
  }
  return value;
}

interface GlbFile {
  localPath: string;
  storagePath: string;
}

function collectGlbFiles(dir: string): GlbFile[] {
  const files: GlbFile[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Check if this is a series directory
      const seriesCode = SERIES_CODE_MAP[entry.name];
      if (seriesCode) {
        // Collect GLBs from series directory
        const seriesFiles = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const sf of seriesFiles) {
          if (sf.isFile() && sf.name.toLowerCase().endsWith(".glb")) {
            files.push({
              localPath: path.join(fullPath, sf.name),
              storagePath: `${seriesCode}/${sf.name}`,
            });
          }
        }
      } else {
        // Recurse into unknown directories
        files.push(...collectGlbFiles(fullPath));
      }
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".glb")) {
      // Root-level GLBs (shouldn't happen with new structure)
      files.push({
        localPath: fullPath,
        storagePath: entry.name,
      });
    }
  }

  return files.sort((a, b) => a.storagePath.localeCompare(b.storagePath));
}

async function uploadFile(
  supabaseUrl: string,
  serviceKey: string,
  storagePath: string,
  localPath: string,
): Promise<boolean> {
  const fileBuffer = fs.readFileSync(localPath);

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": CONTENT_TYPE,
        "x-upsert": "true",
      },
      body: fileBuffer,
    },
  );

  if (response.ok) {
    return true;
  }

  const text = await response.text();
  console.error(`  FAILED: ${storagePath} — ${response.status} ${text}`);
  return false;
}

async function main() {
  const { inputDir } = parseArgs();
  const supabaseUrl = getEnvOrExit("SUPABASE_URL");
  const serviceKey = getEnvOrExit("SUPABASE_SERVICE_ROLE_KEY");

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  console.log("=== Upload GLB Models to Supabase Storage ===");
  console.log(`Input:  ${inputDir}`);
  console.log(`Bucket: ${BUCKET}`);
  console.log(`URL:    ${supabaseUrl}`);
  console.log();

  // Collect local GLB files
  const glbFiles = collectGlbFiles(inputDir);
  console.log(`Found ${glbFiles.length} GLB files locally`);

  if (glbFiles.length === 0) {
    console.log("Nothing to upload.");
    return;
  }

  // Summarize by series
  const seriesCounts = new Map<string, number>();
  for (const f of glbFiles) {
    const prefix = f.storagePath.split("/")[0];
    seriesCounts.set(prefix, (seriesCounts.get(prefix) || 0) + 1);
  }
  for (const [prefix, count] of [...seriesCounts.entries()].sort()) {
    console.log(`  ${prefix}: ${count} files`);
  }
  console.log();

  let uploaded = 0;
  const skipped = 0;
  let failed = 0;

  for (let i = 0; i < glbFiles.length; i++) {
    const { localPath, storagePath } = glbFiles[i];
    const progress = `[${i + 1}/${glbFiles.length}]`;

    const size = fs.statSync(localPath).size;
    process.stdout.write(`${progress} ${storagePath} (${formatBytes(size)})...`);

    const ok = await uploadFile(supabaseUrl, serviceKey, storagePath, localPath);
    if (ok) {
      console.log(" OK");
      uploaded++;
    } else {
      failed++;
    }
  }

  console.log();
  console.log("=== Done ===");
  console.log(`Uploaded: ${uploaded}`);
  if (skipped) console.log(`Skipped:  ${skipped} (already existed)`);
  if (failed) console.log(`Failed:   ${failed}`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
