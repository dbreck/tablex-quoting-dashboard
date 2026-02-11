#!/usr/bin/env python3
"""
03-gen-availability.py

Parse GLB filenames from catalog/glb/{Series}/ and generate TypeScript
model-availability data (MODEL_AVAILABILITY + GLB_FILENAMES entries).

GLB naming: {shape}{size}{base}{baseWidth}.glb  (all lowercase)
Examples:
  tc3060t26.glb       -> shape=TC, size=3060, base=T
  bt36120tt36-3.glb   -> shape=BT, size=36120, base=TT
  rd48tt26.glb        -> shape=RD, size=48, base=TT
  d5454x36.4.glb      -> shape=D, size=5454, base=X
  wg45d36gnt20.glb    -> shape=WG, size=45d36, base=GNT
  bt36120y26t32.glb   -> shape=BT, size=36120, base=Y (complex)

Usage:
  python3 scripts/convert-dwg/03-gen-availability.py
"""

import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

# Known shape codes (2-letter, uppercase) in priority order (longest first for matching)
SHAPES = [
    "TC", "BT", "EL", "RT", "RD", "SQ", "SL", "BU", "TZ", "VW",
    "HR", "AS", "TN", "TA", "CR", "CS", "TR", "QD", "QR", "WG",
    "TE", "KB", "CC", "CU", "BW", "SC", "AC", "RC", "D",
]

# Known base codes (uppercase) — ordered longest first for greedy matching
BASES = [
    "TOS", "GNT", "QD", "QC", "QR", "TT", "FR", "DR", "GN", "SD",
    "T", "X", "U", "C", "D", "Q", "V", "Y", "L", "H",
]

# Series directory -> (series_code, series_name)
SERIES_MAP = {
    "Ultra": ("00", "Ultra"),
    "Foundation": ("30", "Foundation"),
    "Fundamental": ("33", "Fundamental"),
    "Elite": ("08", "Elite"),
    "VertiGO": ("74", "VertiGO"),
    "Primary": ("44", "Primary"),
    "Surge": ("99", "Surge"),
    "Stretch": ("06", "Stretch"),
    "Exclaim": ("71", "Exclaim"),
    "Justice": ("40", "Justice"),
    "Puddle": ("45", "Puddle"),
    "Artisan": ("43", "Artisan"),
}


def parse_glb_filename(filename: str):
    """Parse a GLB filename into (shape, size, base, full_filename).

    Returns None if the filename can't be parsed.
    """
    stem = filename.replace(".glb", "").lower()

    # Try each known shape prefix
    shape = None
    rest = None
    for s in SHAPES:
        sl = s.lower()
        if stem.startswith(sl):
            shape = s
            rest = stem[len(sl):]
            break

    if not shape or not rest:
        return None

    # Extract size: digits (and maybe 'd' for wedge sizes like "45d36")
    # Wedge-style "NNdNN" sizes only appear with WG shape; otherwise "d" indicates Disc base
    if shape == "WG":
        size_match = re.match(r'^(\d+d\d+|\d{2,5})', rest)
    else:
        size_match = re.match(r'^(\d{2,5})', rest)
    if not size_match:
        return None

    size = size_match.group(1)
    after_size = rest[len(size):]

    # Extract base code from what remains
    base = None
    for b in BASES:
        bl = b.lower()
        if after_size.startswith(bl):
            base = b
            break

    if not base:
        return None

    return (shape, size, base, filename)


def process_series(glb_dir: Path, series_code: str, series_name: str):
    """Process all GLBs in a directory and return availability + filename data."""

    glb_files = sorted(f.name for f in glb_dir.iterdir() if f.suffix == ".glb")

    # Parse all filenames
    parsed = []
    skipped = []
    for f in glb_files:
        result = parse_glb_filename(f)
        if result:
            parsed.append(result)
        else:
            skipped.append(f)

    # Build shape -> {sizes: set, bases: set} and filename lookup
    shapes = defaultdict(lambda: {"sizes": set(), "bases": set()})
    filenames = {}  # "SHAPE|SIZE|BASE" -> filename

    for shape, size, base, filename in parsed:
        shapes[shape]["sizes"].add(size)
        shapes[shape]["bases"].add(base)
        key = f"{shape}|{size}|{base}"
        # If duplicate key, keep first (they should be identical)
        if key not in filenames:
            filenames[key] = filename

    # Find a good default GLB (prefer TC shape, medium size)
    default_glb = None
    for shape_pref in ["TC", "D", "RD", "SQ"]:
        if shape_pref in shapes:
            sizes = sorted(shapes[shape_pref]["sizes"])
            bases = sorted(shapes[shape_pref]["bases"])
            mid_idx = len(sizes) // 3  # pick something in lower-middle
            mid_size = sizes[min(mid_idx, len(sizes)-1)]
            first_base = bases[0]
            key = f"{shape_pref}|{mid_size}|{first_base}"
            if key in filenames:
                default_glb = filenames[key]
                break

    if not default_glb and filenames:
        default_glb = list(filenames.values())[0]

    return {
        "series_code": series_code,
        "series_name": series_name,
        "total_glbs": len(parsed),
        "skipped": skipped,
        "shapes": {
            shape: {
                "sizes": sorted(data["sizes"], key=lambda s: (len(s), s)),
                "bases": sorted(data["bases"]),
            }
            for shape, data in sorted(shapes.items())
        },
        "filenames": dict(sorted(filenames.items())),
        "default_glb": default_glb,
    }


def format_ts_availability(data: dict) -> str:
    """Format a series entry for MODEL_AVAILABILITY."""
    code = data["series_code"]
    name = data["series_name"]
    total = data["total_glbs"]
    shapes = data["shapes"]
    default = data["default_glb"]

    lines = []
    lines.append(f'  // {name} (series {code}) — {total} GLBs, {len(shapes)} shapes')
    lines.append(f'  "{code}": {{')
    lines.append(f'    shapes: {{')

    for shape, info in shapes.items():
        sizes = info["sizes"]
        bases = info["bases"]
        lines.append(f'      {shape}: {{')

        # Format sizes array
        if len(sizes) <= 4:
            sizes_str = ", ".join(f'"{s}"' for s in sizes)
            lines.append(f'        sizes: [{sizes_str}],')
        else:
            lines.append(f'        sizes: [')
            # Group into rows of ~7
            for i in range(0, len(sizes), 7):
                chunk = sizes[i:i+7]
                chunk_str = ", ".join(f'"{s}"' for s in chunk)
                comma = "," if i + 7 < len(sizes) else ","
                lines.append(f'          {chunk_str}{comma}')
            lines.append(f'        ],')

        bases_str = ", ".join(f'"{b}"' for b in bases)
        lines.append(f'        bases: [{bases_str}],')
        lines.append(f'      }},')

    lines.append(f'    }},')
    lines.append(f'    defaultGlb: "{default}",')
    lines.append(f'  }},')

    return "\n".join(lines)


def format_ts_filenames(data: dict) -> str:
    """Format a series entry for GLB_FILENAMES."""
    code = data["series_code"]
    filenames = data["filenames"]

    lines = []
    lines.append(f'  "{code}": {{')
    for key, filename in filenames.items():
        lines.append(f'    "{key}": "{filename}",')
    lines.append(f'  }},')

    return "\n".join(lines)


def main():
    project_root = Path(__file__).resolve().parent.parent.parent
    glb_root = project_root / "catalog" / "glb"

    # Process only series that have GLB directories
    all_data = []

    for dir_name, (code, name) in sorted(SERIES_MAP.items()):
        glb_dir = glb_root / dir_name
        if not glb_dir.exists():
            continue

        glb_count = len(list(glb_dir.glob("*.glb")))
        if glb_count == 0:
            print(f"SKIP {name} ({code}): no GLBs found")
            continue

        print(f"Processing {name} ({code}): {glb_count} GLBs...")
        data = process_series(glb_dir, code, name)
        all_data.append(data)

        if data["skipped"]:
            print(f"  WARNING: {len(data['skipped'])} files couldn't be parsed:")
            for s in data["skipped"][:5]:
                print(f"    - {s}")

    # Output TypeScript snippets
    print("\n" + "=" * 70)
    print("MODEL_AVAILABILITY entries:")
    print("=" * 70)
    for data in all_data:
        print(format_ts_availability(data))
        print()

    print("=" * 70)
    print("GLB_FILENAMES entries:")
    print("=" * 70)
    for data in all_data:
        print(format_ts_filenames(data))
        print()

    # Summary
    print("=" * 70)
    print("SUMMARY:")
    print("=" * 70)
    total = sum(d["total_glbs"] for d in all_data)
    total_skipped = sum(len(d["skipped"]) for d in all_data)
    for d in all_data:
        skipped_note = f" ({len(d['skipped'])} skipped)" if d["skipped"] else ""
        print(f"  {d['series_name']:15s} ({d['series_code']}): {d['total_glbs']:4d} GLBs, {len(d['shapes']):2d} shapes{skipped_note}")
    print(f"  {'TOTAL':15s}     : {total:4d} GLBs")
    if total_skipped:
        print(f"  Skipped files: {total_skipped}")

    # Write JSON report
    report_path = project_root / "catalog" / "model-availability-report.json"
    with open(report_path, "w") as f:
        json.dump(all_data, f, indent=2)
    print(f"\nReport written to: {report_path}")


if __name__ == "__main__":
    main()
