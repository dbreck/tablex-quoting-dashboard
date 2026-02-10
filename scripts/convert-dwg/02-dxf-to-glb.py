#!/usr/bin/env python3
"""
02-dxf-to-glb.py

Blender headless script that imports DXF files, normalizes geometry,
applies mesh group naming heuristics, and exports GLB with Draco compression.

Usage:
    blender --background --python scripts/convert-dwg/02-dxf-to-glb.py -- \\
        --input-dir ./catalog/dxf/Foundation \\
        --output-dir ./catalog/glb

Mesh naming heuristics:
    - 'top'  : tabletop surfaces (highest Y bounding box center)
    - 'base' : legs and bases (lowest Y bounding box center)
    - 'edge' : edge banding (thin geometry near the top surface perimeter)

GLB naming convention:
    Strip series prefix, normalize to lowercase.
    Example: Foundation-01TC2448T20.dxf -> tc2448t20.glb
"""

import sys
import os
import re
import argparse
from pathlib import Path

# Blender modules — only available when run inside Blender
try:
    import bpy
    import mathutils
except ImportError:
    print("ERROR: This script must be run inside Blender.")
    print("Usage: blender --background --python 02-dxf-to-glb.py -- --input-dir <dir> --output-dir <dir>")
    sys.exit(1)


def parse_args():
    """Parse arguments after the '--' separator in the Blender command line."""
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser(
        description="Convert DXF files to GLB with mesh group naming"
    )
    parser.add_argument(
        "--input-dir",
        type=str,
        required=True,
        help="Directory containing DXF files",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        required=True,
        help="Output directory for GLB files",
    )
    parser.add_argument(
        "--scale",
        type=float,
        default=0.0254,
        help="Scale factor (default: 0.0254 for inches to meters)",
    )
    return parser.parse_args(argv)


def clear_scene():
    """Remove all objects from the current Blender scene."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    # Also clean up orphan data
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves]:
        for item in block:
            if item.users == 0:
                block.remove(item)


def normalize_glb_name(dxf_filename: str) -> str:
    """
    Convert a DXF filename to the GLB naming convention.
    Strip series prefix (everything before and including the first hyphen
    followed by the series code), normalize to lowercase.

    Examples:
        Foundation-01TC2448T20.dxf -> tc2448t20.glb
        Ultra-00BT3084U28.dxf     -> bt3084u28.glb
        Element-33AS2044T18.dxf   -> as2044t18.glb
        43TC2460FR2157.R-3P.dxf   -> tc2460fr2157.r-3p.glb
    """
    stem = Path(dxf_filename).stem

    # Pattern: SeriesName-##CODE... -> strip "SeriesName-##"
    # Matches series prefix like "Foundation-01", "Ultra-00", "Element-33"
    match = re.match(r"^[A-Za-z]+-(\d{2})(.+)$", stem)
    if match:
        # Keep everything after the 2-digit series code
        name = match.group(2).lower()
    else:
        # Artisan-style: starts with the series code directly (e.g. "43TC2460...")
        match2 = re.match(r"^(\d{2})(.+)$", stem)
        if match2:
            name = match2.group(2).lower()
        else:
            # Fallback: just lowercase the whole stem
            name = stem.lower()

    # Clean up: remove trailing underscores, parenthetical dupes like "(1)"
    name = re.sub(r"\(\d+\)$", "", name)
    name = name.rstrip("_")

    return f"{name}.glb"


def center_and_scale(scale_factor: float):
    """Center all geometry at origin and apply scale normalization."""
    # Select all mesh objects
    bpy.ops.object.select_all(action="SELECT")
    meshes = [obj for obj in bpy.context.selected_objects if obj.type == "MESH"]

    if not meshes:
        return

    # Calculate combined bounding box
    min_corner = mathutils.Vector((float("inf"),) * 3)
    max_corner = mathutils.Vector((float("-inf"),) * 3)

    for obj in meshes:
        for corner in obj.bound_box:
            world_corner = obj.matrix_world @ mathutils.Vector(corner)
            for i in range(3):
                min_corner[i] = min(min_corner[i], world_corner[i])
                max_corner[i] = max(max_corner[i], world_corner[i])

    # Center point
    center = (min_corner + max_corner) / 2

    # Move all objects so center is at origin
    for obj in meshes:
        obj.location -= center

    # Apply scale factor
    for obj in meshes:
        obj.scale *= scale_factor

    # Apply transforms
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def classify_mesh_groups():
    """
    Classify mesh objects into 'top', 'base', and 'edge' groups using
    bounding box heuristics.

    Heuristics:
    - Sort meshes by their bounding box center Y coordinate (height)
    - Highest Y center = 'top' (tabletop)
    - Lowest Y center = 'base' (legs/support)
    - Thin meshes near the top = 'edge' (edge banding)
    """
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]

    if not meshes:
        return

    # Calculate bounding box stats for each mesh
    mesh_stats = []
    for obj in meshes:
        bb = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
        y_values = [v.y for v in bb]
        z_values = [v.z for v in bb]
        x_values = [v.x for v in bb]

        y_center = (min(y_values) + max(y_values)) / 2
        y_height = max(y_values) - min(y_values)
        z_height = max(z_values) - min(z_values)
        x_width = max(x_values) - min(x_values)

        mesh_stats.append({
            "obj": obj,
            "y_center": y_center,
            "y_min": min(y_values),
            "y_max": max(y_values),
            "y_height": y_height,
            "z_height": z_height,
            "x_width": x_width,
            "volume_proxy": y_height * z_height * x_width,
        })

    if len(mesh_stats) == 1:
        # Single mesh — just name it 'top' (it's the whole table)
        mesh_stats[0]["obj"].name = "top"
        return

    # Sort by Y center (ascending = bottom to top)
    mesh_stats.sort(key=lambda m: m["y_center"])

    # Overall bounding box height
    overall_y_min = min(m["y_min"] for m in mesh_stats)
    overall_y_max = max(m["y_max"] for m in mesh_stats)
    overall_height = overall_y_max - overall_y_min

    if overall_height == 0:
        overall_height = 1  # Prevent division by zero

    for stats in mesh_stats:
        obj = stats["obj"]
        relative_y = (stats["y_center"] - overall_y_min) / overall_height

        # Thin geometry in the upper region = edge banding
        is_thin = stats["y_height"] < (overall_height * 0.05)
        is_upper = relative_y > 0.6

        if is_thin and is_upper:
            obj.name = "edge"
        elif relative_y > 0.6:
            obj.name = "top"
        else:
            obj.name = "base"

    # Handle duplicates by adding suffixes
    name_counts: dict[str, int] = {}
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        base_name = obj.name
        if base_name in name_counts:
            name_counts[base_name] += 1
            obj.name = f"{base_name}.{name_counts[base_name]:03d}"
        else:
            name_counts[base_name] = 0


def apply_default_materials():
    """Apply a neutral gray material to all meshes that lack materials."""
    default_mat = bpy.data.materials.get("DefaultGray")
    if default_mat is None:
        default_mat = bpy.data.materials.new(name="DefaultGray")
        default_mat.use_nodes = True
        bsdf = default_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.7, 0.7, 0.7, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.5
            bsdf.inputs["Metallic"].default_value = 0.0

    for obj in bpy.data.objects:
        if obj.type == "MESH" and len(obj.data.materials) == 0:
            obj.data.materials.append(default_mat)


def import_dxf(filepath: str) -> bool:
    """Import a DXF file into the current scene."""
    try:
        bpy.ops.import_scene.dxf(filepath=filepath)
        return True
    except Exception as e:
        print(f"  ERROR importing {filepath}: {e}")
        # Try alternative import if available
        try:
            bpy.ops.import_mesh.dxf(filepath=filepath)
            return True
        except Exception:
            return False


def export_glb(filepath: str):
    """Export the scene as GLB with Draco compression."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_apply=True,
    )


def process_file(dxf_path: Path, output_dir: Path, scale: float) -> bool:
    """Process a single DXF file: import, normalize, classify, export."""
    glb_name = normalize_glb_name(dxf_path.name)
    glb_path = output_dir / glb_name

    print(f"  {dxf_path.name} -> {glb_name}")

    # Clear existing scene
    clear_scene()

    # Import DXF
    if not import_dxf(str(dxf_path)):
        print(f"  FAILED: Could not import {dxf_path.name}")
        return False

    # Check if anything was imported
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    if not meshes:
        print(f"  SKIPPED: No mesh geometry in {dxf_path.name}")
        return False

    # Center and scale
    center_and_scale(scale)

    # Classify mesh groups
    classify_mesh_groups()

    # Apply default materials
    apply_default_materials()

    # Export GLB
    try:
        export_glb(str(glb_path))
        return True
    except Exception as e:
        print(f"  FAILED: Export error for {glb_name}: {e}")
        return False


def main():
    args = parse_args()
    input_dir = Path(args.input_dir).resolve()
    output_dir = Path(args.output_dir).resolve()

    if not input_dir.exists():
        print(f"ERROR: Input directory not found: {input_dir}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Find all DXF files
    dxf_files = sorted(input_dir.glob("*.dxf")) + sorted(input_dir.glob("*.DXF"))
    if not dxf_files:
        print(f"No DXF files found in {input_dir}")
        sys.exit(1)

    print(f"=== DXF to GLB Conversion ===")
    print(f"Input:  {input_dir}")
    print(f"Output: {output_dir}")
    print(f"Scale:  {args.scale} (inches -> meters)")
    print(f"Files:  {len(dxf_files)}")
    print()

    success = 0
    failure = 0

    for dxf_path in dxf_files:
        if process_file(dxf_path, output_dir, args.scale):
            success += 1
        else:
            failure += 1

    print()
    print(f"=== Done ===")
    print(f"Converted: {success}")
    print(f"Failed:    {failure}")
    print(f"Output:    {output_dir}")

    if failure > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
