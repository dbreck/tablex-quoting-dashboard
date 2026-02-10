#!/usr/bin/env bash
#
# 01-dwg-to-dxf.sh
#
# Wraps ODA File Converter to batch-convert DWG files to DXF (R2018).
# Only processes Track A (self-contained) series — skips App and Element
# which require xref resolution first.
#
# Usage:
#   ./scripts/convert-dwg/01-dwg-to-dxf.sh [input_dir] [output_dir]
#
# Defaults:
#   input_dir  = catalog/cad
#   output_dir = catalog/dxf
#
# Prerequisites:
#   ODA File Converter installed from https://www.opendesign.com/guestfiles/oda_file_converter
#   On macOS it installs as an .app bundle.

set -euo pipefail

# --- Configuration ---
# Adjust this path to wherever ODA File Converter is installed
ODA_CONVERTER="/Applications/ODAFileConverter.app/Contents/MacOS/ODAFileConverter"

# Series that require xref resolution (Track B) — skip these
XREF_SERIES=("App" "Element")

# --- Arguments ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

INPUT_DIR="${1:-$PROJECT_ROOT/catalog/cad}"
OUTPUT_DIR="${2:-$PROJECT_ROOT/catalog/dxf}"

# --- Validate ---
if [ ! -x "$ODA_CONVERTER" ]; then
  echo "ERROR: ODA File Converter not found at: $ODA_CONVERTER"
  echo "Download from: https://www.opendesign.com/guestfiles/oda_file_converter"
  echo "Then update the ODA_CONVERTER variable in this script."
  exit 1
fi

if [ ! -d "$INPUT_DIR" ]; then
  echo "ERROR: Input directory not found: $INPUT_DIR"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# --- Helper: check if a series is in the xref skip list ---
is_xref_series() {
  local series_name="$1"
  for xref in "${XREF_SERIES[@]}"; do
    if [[ "$series_name" == "$xref" ]]; then
      return 0
    fi
  done
  return 1
}

# --- Main conversion loop ---
echo "=== DWG to DXF Conversion (Track A: Self-Contained) ==="
echo "Input:  $INPUT_DIR"
echo "Output: $OUTPUT_DIR"
echo ""

total_series=0
total_converted=0
total_skipped=0

for series_dir in "$INPUT_DIR"/*/; do
  dir_name="$(basename "$series_dir")"
  # Extract series name: strip " CAD files" suffix
  series_name="${dir_name% CAD files}"

  if is_xref_series "$series_name"; then
    file_count=$(find "$series_dir" -maxdepth 1 -iname "*.dwg" | wc -l | tr -d ' ')
    echo "[SKIP] $series_name ($file_count files) — requires xref resolution (Track B)"
    total_skipped=$((total_skipped + file_count))
    continue
  fi

  file_count=$(find "$series_dir" -maxdepth 1 -iname "*.dwg" | wc -l | tr -d ' ')
  if [ "$file_count" -eq 0 ]; then
    echo "[SKIP] $series_name — no DWG files"
    continue
  fi

  out_subdir="$OUTPUT_DIR/$series_name"
  mkdir -p "$out_subdir"

  echo "[CONV] $series_name ($file_count files)..."

  # ODA File Converter arguments:
  #   arg1: input folder
  #   arg2: output folder
  #   arg3: output version (ACAD2018 = R2018 DXF)
  #   arg4: output file type (DXF = ASCII DXF, DXB = Binary DXF)
  #   arg5: recurse subfolders (0 = no)
  #   arg6: audit (1 = yes, repair errors)
  #   arg7: input filter (*.DWG)
  "$ODA_CONVERTER" "$series_dir" "$out_subdir" "ACAD2018" "DXF" "0" "1" "*.DWG"

  converted=$(find "$out_subdir" -maxdepth 1 -iname "*.dxf" | wc -l | tr -d ' ')
  echo "       -> $converted DXF files written to $out_subdir"
  total_converted=$((total_converted + converted))
  total_series=$((total_series + 1))
done

echo ""
echo "=== Done ==="
echo "Series converted: $total_series"
echo "Files converted:  $total_converted"
echo "Files skipped:    $total_skipped (xref series)"
echo "Output directory: $OUTPUT_DIR"
