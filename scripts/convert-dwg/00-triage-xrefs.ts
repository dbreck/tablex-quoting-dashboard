#!/usr/bin/env npx tsx
/**
 * 00-triage-xrefs.ts
 *
 * Scans catalog/cad/ subdirectories, stats all DWG files per series,
 * and classifies each series as "self-contained" or "has-xrefs" based
 * on file-size variance. Series with a max/min ratio >10x are flagged
 * as potential xref candidates.
 *
 * Output: triage-report.json in the same directory as this script.
 *
 * Usage: npx tsx scripts/convert-dwg/00-triage-xrefs.ts
 */

import fs from "node:fs";
import path from "node:path";

const CAD_ROOT = path.resolve(__dirname, "../../catalog/cad");
const OUTPUT_PATH = path.resolve(__dirname, "triage-report.json");

// Known xref series (confirmed via manual inspection)
const KNOWN_XREF_SERIES = ["App", "Element"];

interface SeriesReport {
  series: string;
  directory: string;
  fileCount: number;
  minSize: number;
  maxSize: number;
  meanSize: number;
  sizeRatio: number;
  classification: "self-contained" | "has-xrefs";
  reason: string;
}

function main() {
  if (!fs.existsSync(CAD_ROOT)) {
    console.error(`CAD root not found: ${CAD_ROOT}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(CAD_ROOT, { withFileTypes: true });
  const seriesDirs = entries.filter((e) => e.isDirectory());

  const report: SeriesReport[] = [];

  for (const dir of seriesDirs) {
    const dirPath = path.join(CAD_ROOT, dir.name);
    const dwgFiles = fs
      .readdirSync(dirPath)
      .filter((f) => f.toLowerCase().endsWith(".dwg"));

    if (dwgFiles.length === 0) {
      console.log(`  Skipping ${dir.name} (no DWG files)`);
      continue;
    }

    const sizes = dwgFiles.map((f) => {
      const stat = fs.statSync(path.join(dirPath, f));
      return stat.size;
    });

    sizes.sort((a, b) => a - b);

    const minSize = sizes[0];
    const maxSize = sizes[sizes.length - 1];
    const meanSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
    const sizeRatio = Math.round((maxSize / minSize) * 10) / 10;

    // Extract series name from directory (strip " CAD files" suffix)
    const seriesName = dir.name.replace(/ CAD files$/i, "");

    // Classify: known xref series or >10x size ratio
    const isKnownXref = KNOWN_XREF_SERIES.some(
      (s) => s.toLowerCase() === seriesName.toLowerCase()
    );
    const hasLargeRatio = sizeRatio > 10;

    let classification: "self-contained" | "has-xrefs";
    let reason: string;

    if (isKnownXref) {
      classification = "has-xrefs";
      reason = "Known xref series (confirmed via manual inspection)";
    } else if (hasLargeRatio) {
      classification = "has-xrefs";
      reason = `Size ratio ${sizeRatio}x exceeds 10x threshold`;
    } else {
      classification = "self-contained";
      reason = `Size ratio ${sizeRatio}x within normal range`;
    }

    report.push({
      series: seriesName,
      directory: dir.name,
      fileCount: dwgFiles.length,
      minSize,
      maxSize,
      meanSize,
      sizeRatio,
      classification,
      reason,
    });

    const icon = classification === "has-xrefs" ? "!!" : "OK";
    console.log(
      `  [${icon}] ${seriesName.padEnd(14)} ${String(dwgFiles.length).padStart(4)} files | ` +
        `min=${formatBytes(minSize)} max=${formatBytes(maxSize)} ratio=${sizeRatio}x | ` +
        `${classification}`
    );
  }

  // Summary
  const selfContained = report.filter((r) => r.classification === "self-contained");
  const hasXrefs = report.filter((r) => r.classification === "has-xrefs");
  const totalFiles = report.reduce((sum, r) => sum + r.fileCount, 0);

  console.log("\n--- Summary ---");
  console.log(`Total series: ${report.length}`);
  console.log(`Total DWG files: ${totalFiles}`);
  console.log(
    `Self-contained (Track A): ${selfContained.length} series (${selfContained.map((r) => r.series).join(", ")})`
  );
  console.log(
    `Has xrefs (Track B): ${hasXrefs.length} series (${hasXrefs.map((r) => r.series).join(", ")})`
  );

  const output = {
    generatedAt: new Date().toISOString(),
    cadRoot: CAD_ROOT,
    totalSeries: report.length,
    totalFiles,
    trackA: selfContained.map((r) => r.series),
    trackB: hasXrefs.map((r) => r.series),
    series: report,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nReport written to: ${OUTPUT_PATH}`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

main();
