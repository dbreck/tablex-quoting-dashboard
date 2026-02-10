#!/usr/bin/env npx tsx
/**
 * 04-upload-to-supabase.ts
 *
 * Uploads GLB files to Supabase Storage bucket 'models'.
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

function collectGlbFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectGlbFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".glb")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function listExistingFiles(
  supabaseUrl: string,
  serviceKey: string,
  prefix: string = "",
): Promise<Set<string>> {
  const existing = new Set<string>();
  let offset = 0;
  const limit = 1000;

  while (true) {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/list/${BUCKET}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix,
          limit,
          offset,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`Failed to list files: ${response.status} ${text}`);
      break;
    }

    const items = (await response.json()) as { name: string }[];
    if (items.length === 0) break;

    for (const item of items) {
      existing.add(prefix ? `${prefix}/${item.name}` : item.name);
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return existing;
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
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": CONTENT_TYPE,
        "x-upsert": "false",
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

  // Check what already exists in the bucket
  console.log("Checking existing files in Supabase...");
  const existing = await listExistingFiles(supabaseUrl, serviceKey);
  console.log(`Found ${existing.size} files already in bucket`);
  console.log();

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < glbFiles.length; i++) {
    const localPath = glbFiles[i];
    const fileName = path.basename(localPath);
    const storagePath = fileName; // Flat structure in bucket

    const progress = `[${i + 1}/${glbFiles.length}]`;

    if (existing.has(storagePath)) {
      console.log(`${progress} SKIP: ${fileName} (already exists)`);
      skipped++;
      continue;
    }

    const size = fs.statSync(localPath).size;
    console.log(`${progress} UPLOAD: ${fileName} (${formatBytes(size)})`);

    const ok = await uploadFile(supabaseUrl, serviceKey, storagePath, localPath);
    if (ok) {
      uploaded++;
    } else {
      failed++;
    }
  }

  console.log();
  console.log("=== Done ===");
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped} (already existed)`);
  console.log(`Failed:   ${failed}`);
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
