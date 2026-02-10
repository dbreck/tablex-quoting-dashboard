#!/usr/bin/env python3
"""
01b-resolve-xrefs.py

Track B: Resolves external references (xrefs) in DWG/DXF files for series
that use xref assembly patterns (App, Element).

Uses ezdxf to load parent files, bind all xref blocks inline, and write
resolved DXF files suitable for Blender import.

Usage:
    python scripts/convert-dwg/01b-resolve-xrefs.py [--input-dir catalog/cad] [--output-dir catalog/dxf]

Prerequisites:
    pip install ezdxf

Note: This script works with DXF files. You must first convert the Track B
DWG files to DXF using ODA File Converter (without the xref skip list),
then run this script on the resulting DXF files.
"""

import argparse
import logging
import sys
from pathlib import Path

try:
    import ezdxf
    from ezdxf import xref as ezdxf_xref
except ImportError:
    print("ERROR: ezdxf is required. Install with: pip install ezdxf")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# Series that need xref resolution
XREF_SERIES = ["App", "Element"]


def find_xref_blocks(doc: ezdxf.document.Drawing) -> list[str]:
    """Find all external reference block names in a DXF document."""
    xref_names = []
    for block in doc.blocks:
        if block.is_xref or block.is_xref_overlay:
            xref_names.append(block.name)
    return xref_names


def resolve_xrefs_for_file(
    dxf_path: Path,
    source_dir: Path,
    output_path: Path,
) -> bool:
    """
    Load a DXF file, resolve all xrefs by binding them inline, and save.

    Args:
        dxf_path: Path to the parent DXF file
        source_dir: Directory containing xref source files
        output_path: Where to write the resolved DXF

    Returns:
        True if successful, False otherwise
    """
    try:
        doc = ezdxf.readfile(str(dxf_path))
    except Exception as e:
        log.error(f"Failed to read {dxf_path.name}: {e}")
        return False

    xref_names = find_xref_blocks(doc)

    if not xref_names:
        log.info(f"  {dxf_path.name}: No xrefs found, copying as-is")
        try:
            doc.saveas(str(output_path))
            return True
        except Exception as e:
            log.error(f"  Failed to save {output_path.name}: {e}")
            return False

    log.info(f"  {dxf_path.name}: Found {len(xref_names)} xref(s): {xref_names}")

    # Attempt to resolve each xref by loading and binding
    for xref_name in xref_names:
        # Look for the xref source file in the same directory
        # Try common patterns: exact name, with .dxf extension
        candidates = [
            source_dir / f"{xref_name}.dxf",
            source_dir / f"{xref_name}.DXF",
            source_dir / f"{xref_name}.dwg",
            source_dir / f"{xref_name}.DWG",
        ]

        xref_source = None
        for candidate in candidates:
            if candidate.exists():
                xref_source = candidate
                break

        if xref_source is None:
            # Also search recursively in case xrefs are in subdirectories
            for pattern in [f"{xref_name}.dxf", f"{xref_name}.DXF"]:
                matches = list(source_dir.rglob(pattern))
                if matches:
                    xref_source = matches[0]
                    break

        if xref_source is None:
            log.warning(
                f"  Xref source not found for '{xref_name}' — "
                f"searched in {source_dir}"
            )
            continue

        log.info(f"  Binding xref '{xref_name}' from {xref_source.name}")
        try:
            xref_doc = ezdxf.readfile(str(xref_source))
            ezdxf_xref.attach(doc, block=xref_doc.modelspace(), name=xref_name)
        except Exception as e:
            log.warning(f"  Failed to bind xref '{xref_name}': {e}")
            # Try alternative approach: raw block insertion
            try:
                xref_doc = ezdxf.readfile(str(xref_source))
                ezdxf_xref.embed(doc, xref_doc)
                log.info(f"  Embedded '{xref_name}' using full document embed")
            except Exception as e2:
                log.error(f"  All xref resolution methods failed for '{xref_name}': {e2}")

    # Save the resolved file
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc.saveas(str(output_path))
        log.info(f"  Saved resolved file: {output_path.name}")
        return True
    except Exception as e:
        log.error(f"  Failed to save resolved file: {e}")
        return False


def process_series(
    series_name: str,
    input_dir: Path,
    output_dir: Path,
) -> tuple[int, int]:
    """
    Process all DXF files for a given series.

    Returns:
        (success_count, failure_count)
    """
    # Series directories have " CAD files" suffix
    series_dir = input_dir / f"{series_name} CAD files"

    if not series_dir.exists():
        # Also check without suffix
        series_dir = input_dir / series_name
        if not series_dir.exists():
            log.warning(f"Series directory not found: {series_name}")
            return 0, 0

    dxf_files = sorted(series_dir.glob("*.dxf")) + sorted(series_dir.glob("*.DXF"))
    if not dxf_files:
        log.warning(
            f"No DXF files found in {series_dir}. "
            f"Run ODA File Converter on the DWG files first."
        )
        return 0, 0

    out_subdir = output_dir / series_name
    out_subdir.mkdir(parents=True, exist_ok=True)

    success = 0
    failure = 0

    for dxf_path in dxf_files:
        output_path = out_subdir / dxf_path.name
        if resolve_xrefs_for_file(dxf_path, series_dir, output_path):
            success += 1
        else:
            failure += 1

    return success, failure


def main():
    parser = argparse.ArgumentParser(
        description="Resolve xrefs in Track B DXF files (App, Element series)"
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "catalog" / "cad",
        help="Root directory containing series subdirectories with DXF files",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "catalog" / "dxf",
        help="Output directory for resolved DXF files",
    )
    parser.add_argument(
        "--series",
        nargs="*",
        default=XREF_SERIES,
        help=f"Series to process (default: {XREF_SERIES})",
    )
    args = parser.parse_args()

    log.info("=== Xref Resolution (Track B) ===")
    log.info(f"Input:  {args.input_dir}")
    log.info(f"Output: {args.output_dir}")
    log.info(f"Series: {args.series}")
    log.info("")

    args.output_dir.mkdir(parents=True, exist_ok=True)

    total_success = 0
    total_failure = 0

    for series_name in args.series:
        log.info(f"Processing series: {series_name}")
        success, failure = process_series(series_name, args.input_dir, args.output_dir)
        total_success += success
        total_failure += failure
        log.info(f"  {series_name}: {success} resolved, {failure} failed")
        log.info("")

    log.info("=== Done ===")
    log.info(f"Total resolved: {total_success}")
    log.info(f"Total failed:   {total_failure}")

    if total_failure > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
