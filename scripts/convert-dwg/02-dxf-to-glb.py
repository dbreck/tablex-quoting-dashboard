#!/usr/bin/env python3
"""
02-dxf-to-glb.py

Pure Python DXF-to-GLB converter using ezdxf + trimesh.
Extracts 3D polyface mesh geometry from DXF files, groups meshes by
layer name (top, base, edge), and exports as GLB with named nodes.

No Blender required.

Dependencies:
    pip install ezdxf trimesh pygltflib scipy numpy

Usage:
    python3 scripts/convert-dwg/02-dxf-to-glb.py \
        --input-dir ./catalog/dxf/Ultra \
        --output-dir ./catalog/glb

GLB naming convention:
    Strip series prefix + 2-digit code, normalize lowercase.
    Example: Ultra-00TC2448U22.dxf -> tc2448u22.glb
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import ezdxf
except ImportError:
    sys.exit("Missing ezdxf: pip install ezdxf")

try:
    import trimesh
except ImportError:
    sys.exit("Missing trimesh: pip install trimesh pygltflib scipy")

import numpy as np

# ── Layer name classification ──────────────────────────────────────────
# Maps substrings found in DXF layer names to mesh group names.
# Based on observed TableX conventions across series:
#   AFUTL-3-TPLM  = top laminate
#   AFUTL-3-EDPL  = edge profile
#   AFUTL-3-LGCH  = leg chrome
#   AFUTL-3-GDPL  = guide plate (base structure)
#   AFUTL-3-HWPT  = hardware/pivot (misc)

LAYER_GROUP_MAP = {
    # Top surface
    "TPLM": "top",
    "TPWD": "top",
    "TOP": "top",
    "LAM": "top",
    "SURF": "top",
    # Edge banding
    "EDPL": "edge",
    "EDGE": "edge",
    "BAND": "edge",
    "EDMB": "edge",
    # Base / legs
    "LGCH": "base",
    "LGPL": "base",
    "LGWD": "base",
    "LEG": "base",
    "BASE": "base",
    "GDPL": "base",
    "GDCH": "base",
    "FRAME": "base",
    "SUPP": "base",
    "FTPL": "base",
    "FTCH": "base",
    "GLDE": "base",
}

# Default vertex colors per group (RGBA 0-255)
GROUP_COLORS = {
    "top": [217, 217, 217, 255],    # light gray (laminate)
    "base": [77, 77, 77, 255],      # dark gray (powder coat)
    "edge": [153, 153, 153, 255],   # medium gray
    "other": [128, 128, 128, 255],
}


def classify_layer(layer_name: str) -> str:
    """Classify a DXF layer name into a mesh group."""
    upper = layer_name.upper()
    for pattern, group in LAYER_GROUP_MAP.items():
        if pattern in upper:
            return group
    return "other"


def extract_mesh_from_polyface(entity) -> tuple:
    """Extract vertices and triangulated faces from a polyface mesh entity.

    Decomposes the polyface into virtual 3DFACE entities, deduplicates
    vertices, and triangulates quads.

    Returns:
        (vertices: ndarray[N,3], faces: ndarray[M,3])
    """
    faces_3d = list(entity.virtual_entities())
    if not faces_3d:
        return np.array([]).reshape(0, 3), np.array([]).reshape(0, 3)

    vert_map = {}
    vert_list = []
    all_faces = []

    for face in faces_3d:
        indices = []
        for attr in ("vtx0", "vtx1", "vtx2", "vtx3"):
            v = getattr(face.dxf, attr)
            key = (round(v.x, 6), round(v.y, 6), round(v.z, 6))
            if key not in vert_map:
                vert_map[key] = len(vert_list)
                vert_list.append(key)
            indices.append(vert_map[key])

        i0, i1, i2, i3 = indices
        all_faces.append([i0, i1, i2])
        if i2 != i3:  # real quad — add second triangle
            all_faces.append([i0, i2, i3])

    return np.array(vert_list, dtype=np.float64), np.array(all_faces, dtype=np.int64)


def normalize_glb_name(dxf_filename: str) -> str:
    """Convert DXF filename to GLB naming convention.

    Strip series prefix + 2-digit series code, normalize lowercase.
    Examples:
        Ultra-00TC2448U22.dxf    -> tc2448u22.glb
        Foundation-30TC3060T20.dxf -> tc3060t20.glb
        43TC2460FR2157.R-3P.dxf  -> tc2460fr2157.r-3p.glb
    """
    stem = Path(dxf_filename).stem

    # Pattern: SeriesName-##CODE... -> strip "SeriesName-##"
    match = re.match(r"^[A-Za-z]+-(\d{2})(.+)$", stem)
    if match:
        name = match.group(2).lower()
    else:
        match2 = re.match(r"^(\d{2})(.+)$", stem)
        if match2:
            name = match2.group(2).lower()
        else:
            name = stem.lower()

    # Clean up parenthesized suffixes
    name = re.sub(r"\(\d+\)$", "", name)
    name = name.rstrip("_")
    return f"{name}.glb"


def dxf_to_glb(dxf_path: str, glb_path: str) -> dict:
    """Convert a single DXF file to GLB.

    Reads polyface mesh entities, groups by layer classification,
    merges each group into a single mesh, centers at origin, converts
    inches to meters, and exports as a GLB scene with named nodes.

    Returns a stats dict with vertex/face counts, groups, and file size.
    """
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()

    # Group polyface meshes by classified layer
    groups = {}  # group_name -> list of (vertices, faces, layer_name)

    for entity in msp:
        if entity.dxftype() != "POLYLINE" or not entity.is_poly_face_mesh:
            continue

        layer = entity.dxf.layer
        group = classify_layer(layer)
        vertices, faces = extract_mesh_from_polyface(entity)

        if len(vertices) == 0:
            continue

        if group not in groups:
            groups[group] = []
        groups[group].append((vertices, faces, layer))

    if not groups:
        return {"error": "No polyface meshes found", "file": os.path.basename(dxf_path)}

    # Calculate global bounding box for centering
    all_points = []
    for meshes in groups.values():
        for verts, _, _ in meshes:
            all_points.append(verts)
    global_verts = np.vstack(all_points)
    global_center_xy = global_verts[:, :2].mean(axis=0)
    global_z_min = global_verts[:, 2].min()

    # Build trimesh scene with named nodes
    scene = trimesh.Scene()
    total_verts = 0
    total_faces = 0

    for group_name, meshes in groups.items():
        # Merge all meshes in this group
        merged_verts_list = []
        merged_faces_list = []
        offset = 0

        for verts, faces, _ in meshes:
            merged_verts_list.append(verts)
            merged_faces_list.append(faces + offset)
            offset += len(verts)

        merged_verts = np.vstack(merged_verts_list)
        merged_faces = np.vstack(merged_faces_list)

        # Convert inches to meters
        merged_verts = merged_verts * 0.0254

        # Center XY at origin, Z at ground plane (shared across all groups)
        merged_verts[:, 0] -= global_center_xy[0] * 0.0254
        merged_verts[:, 1] -= global_center_xy[1] * 0.0254
        merged_verts[:, 2] -= global_z_min * 0.0254

        mesh = trimesh.Trimesh(vertices=merged_verts, faces=merged_faces)

        # Apply default color per group
        color = GROUP_COLORS.get(group_name, GROUP_COLORS["other"])
        mesh.visual.face_colors = np.tile(
            np.array(color, dtype=np.uint8), (len(merged_faces), 1)
        )

        scene.add_geometry(mesh, node_name=group_name, geom_name=group_name)
        total_verts += len(merged_verts)
        total_faces += len(merged_faces)

    # Export GLB
    glb_data = scene.export(file_type="glb")
    with open(glb_path, "wb") as f:
        f.write(glb_data)

    file_size = os.path.getsize(glb_path)

    return {
        "file": os.path.basename(dxf_path),
        "glb": os.path.basename(glb_path),
        "groups": list(groups.keys()),
        "layers": sorted(set(l for meshes in groups.values() for _, _, l in meshes)),
        "vertices": total_verts,
        "faces": total_faces,
        "glb_size_kb": round(file_size / 1024, 1),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Convert TableX DXF files to GLB (pure Python, no Blender)"
    )
    parser.add_argument("--input-dir", required=True, help="Directory of DXF files")
    parser.add_argument("--output-dir", required=True, help="Output directory for GLB files")
    parser.add_argument(
        "--report",
        default=None,
        help="Optional path to write a JSON conversion report",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir).resolve()
    output_dir = Path(args.output_dir).resolve()

    if not input_dir.exists():
        print(f"ERROR: Input directory not found: {input_dir}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    dxf_files = sorted(
        f for f in input_dir.iterdir()
        if f.suffix.lower() == ".dxf"
    )

    if not dxf_files:
        print(f"No DXF files found in {input_dir}")
        sys.exit(1)

    print(f"=== DXF -> GLB Conversion (ezdxf + trimesh) ===")
    print(f"Input:  {input_dir}")
    print(f"Output: {output_dir}")
    print(f"Files:  {len(dxf_files)}")
    print()

    results = []
    success = 0
    failure = 0

    for i, dxf_path in enumerate(dxf_files, 1):
        glb_name = normalize_glb_name(dxf_path.name)
        glb_path = output_dir / glb_name

        print(f"[{i}/{len(dxf_files)}] {dxf_path.name} -> {glb_name}", end="", flush=True)

        try:
            stats = dxf_to_glb(str(dxf_path), str(glb_path))
            if "error" in stats:
                print(f"  SKIP: {stats['error']}")
                failure += 1
            else:
                print(f"  {stats['vertices']}v {stats['faces']}f {stats['glb_size_kb']}KB {stats['groups']}")
                success += 1
            results.append(stats)
        except Exception as ex:
            print(f"  ERROR: {ex}")
            failure += 1
            results.append({"file": dxf_path.name, "error": str(ex)})

    print()
    print(f"=== Done ===")
    print(f"Converted: {success}/{len(dxf_files)}")
    if failure:
        print(f"Failed:    {failure}")
    print(f"Output:    {output_dir}")

    # Write optional report
    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with open(report_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"Report:    {report_path}")

    if failure > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
