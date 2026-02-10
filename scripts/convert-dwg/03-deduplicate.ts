#!/usr/bin/env npx tsx
/**
 * 03-deduplicate.ts
 *
 * Compares GLB files by SHA-256 content hash to identify duplicates.
 * Foundation and Fundamental series share many geometries, so this script
 * finds exact duplicates and produces a dedup map.
 *
 * Usage:
 *   npx tsx scripts/convert-dwg/03-deduplicate.ts [--input-dir catalog/glb] [--dry-run]
 *
 * Options:
 *   --input-dir <dir>  Directory containing GLB files (default: catalog/glb)
 *   --dry-run          Only report duplicates, do not delete (default: true)
 *   --delete           Actually remove duplicate files
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../..");
const DEFAULT_INPUT = path.join(PROJECT_ROOT, "catalog/glb");
const OUTPUT_PATH = path.resolve(SCRIPT_DIR, "dedup-map.json");

interface DedupEntry {
  canonical: string;
  duplicates: string[];
  hash: string;
  sizeBytes: number;
}

interface DedupReport {
  generatedAt: string;
  inputDir: string;
  totalFiles: number;
  uniqueFiles: number;
  duplicateFiles: number;
  savedBytes: number;
  entries: DedupEntry[];
}

function parseArgs(): { inputDir: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let inputDir = DEFAULT_INPUT;
  let dryRun = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input-dir" && args[i + 1]) {
      inputDir = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--delete") {
      dryRun = false;
    }
  }

  return { inputDir, dryRun };
}

function hashFile(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
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

function main() {
  const { inputDir, dryRun } = parseArgs();

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  console.log("=== GLB Deduplication ===");
  console.log(`Input:   ${inputDir}`);
  console.log(`Mode:    ${dryRun ? "DRY RUN (no deletions)" : "DELETE duplicates"}`);
  console.log();

  const glbFiles = collectGlbFiles(inputDir);
  console.log(`Found ${glbFiles.length} GLB files`);

  if (glbFiles.length === 0) {
    console.log("Nothing to deduplicate.");
    return;
  }

  // Hash all files
  console.log("Computing SHA-256 hashes...");
  const hashMap = new Map<string, { path: string; size: number }[]>();

  for (const filePath of glbFiles) {
    const hash = hashFile(filePath);
    const size = fs.statSync(filePath).size;
    const relativePath = path.relative(inputDir, filePath);

    if (!hashMap.has(hash)) {
      hashMap.set(hash, []);
    }
    hashMap.get(hash)!.push({ path: relativePath, size });
  }

  // Find duplicates
  const dedupEntries: DedupEntry[] = [];
  let totalDuplicates = 0;
  let savedBytes = 0;

  for (const [hash, files] of hashMap) {
    if (files.length > 1) {
      // Pick the canonical file (shortest filename = simplest name)
      files.sort((a, b) => a.path.length - b.path.length);
      const canonical = files[0];
      const duplicates = files.slice(1);

      const entry: DedupEntry = {
        canonical: canonical.path,
        duplicates: duplicates.map((d) => d.path),
        hash,
        sizeBytes: canonical.size,
      };

      dedupEntries.push(entry);
      totalDuplicates += duplicates.length;
      savedBytes += duplicates.reduce((sum, d) => sum + d.size, 0);

      console.log(`\n  Canonical: ${canonical.path}`);
      for (const dup of duplicates) {
        console.log(`  Duplicate: ${dup.path} (${formatBytes(dup.size)})`);
      }
    }
  }

  // Report
  const uniqueCount = hashMap.size;
  console.log("\n--- Summary ---");
  console.log(`Total files:     ${glbFiles.length}`);
  console.log(`Unique hashes:   ${uniqueCount}`);
  console.log(`Duplicate files: ${totalDuplicates}`);
  console.log(`Space savings:   ${formatBytes(savedBytes)}`);

  // Delete duplicates if not dry-run
  if (!dryRun && totalDuplicates > 0) {
    console.log("\nDeleting duplicates...");
    let deleted = 0;
    for (const entry of dedupEntries) {
      for (const dupPath of entry.duplicates) {
        const fullPath = path.join(inputDir, dupPath);
        try {
          fs.unlinkSync(fullPath);
          deleted++;
          console.log(`  Deleted: ${dupPath}`);
        } catch (err) {
          console.error(`  Failed to delete ${dupPath}: ${err}`);
        }
      }
    }
    console.log(`Deleted ${deleted} files`);
  }

  // Write report
  const report: DedupReport = {
    generatedAt: new Date().toISOString(),
    inputDir,
    totalFiles: glbFiles.length,
    uniqueFiles: uniqueCount,
    duplicateFiles: totalDuplicates,
    savedBytes,
    entries: dedupEntries,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nDedup map written to: ${OUTPUT_PATH}`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

main();
