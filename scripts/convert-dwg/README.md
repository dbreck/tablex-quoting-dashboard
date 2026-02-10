# DWG to GLB Conversion Pipeline

Converts TableX CAD drawings (DWG) into web-ready 3D models (GLB) for the product configurator.

## Overview

The pipeline has two tracks:

- **Track A** — Self-contained DWG files (most series). Converted directly via ODA File Converter.
- **Track B** — DWG files with external references/xrefs (App, Element). Require xref resolution before Blender conversion.

```
DWG files
  │
  ├─ Track A ──► 01-dwg-to-dxf.sh ──────────────────► DXF files ─┐
  │                                                                │
  └─ Track B ──► 01-dwg-to-dxf.sh (manual) ──► 01b-resolve-xrefs.py ──► DXF files ─┤
                                                                   │
                                                    02-dxf-to-glb.py (Blender) ──► GLB files
                                                                   │
                                                    03-deduplicate.ts ──► Deduped GLB files
                                                                   │
                                                    04-upload-to-supabase.ts ──► Supabase Storage
```

## Prerequisites

### ODA File Converter (DWG to DXF)

Download from [Open Design Alliance](https://www.opendesign.com/guestfiles/oda_file_converter) (free for non-commercial use).

On macOS it installs as `/Applications/ODAFileConverter.app`. Update the `ODA_CONVERTER` path in `01-dwg-to-dxf.sh` if your install location differs.

### Python dependencies (xref resolution)

```bash
pip install ezdxf
```

### Blender (DXF to GLB)

Install [Blender](https://www.blender.org/download/) 3.6+ (LTS recommended). The script runs headless via `blender --background`.

The Blender DXF importer addon (`import_dxf`) must be enabled. It ships with Blender but may need activation:
1. Open Blender > Edit > Preferences > Add-ons
2. Search "DXF" and enable "Import-Export: AutoCAD DXF"

### Node.js / TypeScript

```bash
npm install -g tsx   # or use npx tsx
```

No additional npm packages required — the TypeScript scripts use only Node.js built-ins.

### Supabase (upload step only)

Set these environment variables (e.g., in `.env.local`):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Usage

### Step 0: Triage xrefs

Classify each series as self-contained or xref-dependent:

```bash
npx tsx scripts/convert-dwg/00-triage-xrefs.ts
```

Outputs `scripts/convert-dwg/triage-report.json` with per-series classification.

### Step 1a: Convert DWG to DXF (Track A)

```bash
chmod +x scripts/convert-dwg/01-dwg-to-dxf.sh
./scripts/convert-dwg/01-dwg-to-dxf.sh
```

Optional arguments:
```bash
./scripts/convert-dwg/01-dwg-to-dxf.sh <input_dir> <output_dir>
```

Defaults: `catalog/cad` -> `catalog/dxf`. Skips App and Element series.

### Step 1b: Resolve xrefs (Track B)

First convert App and Element DWGs to DXF using ODA manually, then:

```bash
python scripts/convert-dwg/01b-resolve-xrefs.py
```

Options:
```bash
python scripts/convert-dwg/01b-resolve-xrefs.py \
  --input-dir catalog/cad \
  --output-dir catalog/dxf \
  --series App Element
```

### Step 2: Convert DXF to GLB

Run per-series (recommended for large batches):

```bash
blender --background --python scripts/convert-dwg/02-dxf-to-glb.py -- \
  --input-dir catalog/dxf/Foundation \
  --output-dir catalog/glb
```

The `--scale 0.0254` flag (default) converts inches to meters.

### Step 3: Deduplicate

Find and optionally remove duplicate GLB files:

```bash
# Dry run (default) — report only
npx tsx scripts/convert-dwg/03-deduplicate.ts

# Actually delete duplicates
npx tsx scripts/convert-dwg/03-deduplicate.ts --delete
```

Outputs `scripts/convert-dwg/dedup-map.json`.

### Step 4: Upload to Supabase

```bash
npx tsx scripts/convert-dwg/04-upload-to-supabase.ts
```

Uploads to the `models` bucket with content-type `model/gltf-binary`. Skips files that already exist.

## GLB Naming Convention

Series prefix and numeric code are stripped; remainder is lowercased:

| DWG filename | GLB filename |
|---|---|
| `Foundation-01TC2448T20.dwg` | `tc2448t20.glb` |
| `Ultra-00BT3084U28.dwg` | `bt3084u28.glb` |
| `Element-33AS2044T18.dwg` | `as2044t18.glb` |
| `43TC2460FR2157.R-3P.dwg` | `tc2460fr2157.r-3p.glb` |

## Mesh Groups

The Blender script automatically names mesh objects using bounding-box heuristics:

| Group | Description |
|---|---|
| `top` | Tabletop surface (highest geometry) |
| `base` | Legs and support structure (lowest geometry) |
| `edge` | Edge banding (thin geometry near the top perimeter) |

These names are preserved in the GLB and used by the React Three Fiber viewer to apply finish materials dynamically.
