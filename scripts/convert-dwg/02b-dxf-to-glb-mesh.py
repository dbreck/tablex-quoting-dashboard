#!/usr/bin/env python3
"""
02b-dxf-to-glb-mesh.py

Extended DXF-to-GLB converter for the 2026-07 Big5/Neal CAD drops.

Differences from 02-dxf-to-glb.py (which only reads top-level POLYLINE
polyface meshes):
  - Flattens block INSERTs via ezdxf.disassemble.recursive_decompose, so
    geometry nested in blocks (Neal's export style) is captured with its
    transforms applied.
  - Extracts MESH entities (AutoCAD subdivision meshes) in addition to
    POLYLINE polyfaces, triangulating n-gon faces.
  - When layer names carry no top/base/edge signal (Neal's layers are
    serial-number-styled, e.g. 'SN1880897TX'), falls back to a geometric
    classification: flat meshes whose volume sits in the upper band of the
    model are 'top', everything else is 'base'.

Usage (same interface as 02):
    python3 scripts/convert-dwg/02b-dxf-to-glb-mesh.py \
        --input-dir ./catalog/dxf-neal/Trig \
        --output-dir ./catalog/glb-neal/Trig \
        --report ./catalog/glb-neal/Trig/report.json
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import ezdxf
    from ezdxf import disassemble
except ImportError:
    sys.exit("Missing ezdxf: pip install ezdxf")

try:
    import trimesh
except ImportError:
    sys.exit("Missing trimesh: pip install trimesh pygltflib scipy")

try:
    import networkx  # noqa: F401 — trimesh.split() needs it; without it the
    # component splitting silently degrades and tops never separate from bases
except ImportError:
    sys.exit("Missing networkx: pip install networkx")

import numpy as np

# Strict TableX layer codes only (AFUTL-style). The generic words the old
# map also carried (TOP/LEG/BASE/LAM/EDGE...) false-match the free-text
# assembly layer names in the Big5 exports ("..._DB14.5rc Top12x18_"), so
# they are deliberately absent here — unmatched meshes classify geometrically.
LAYER_GROUP_MAP = {
    "TPLM": "top", "TPWD": "top",
    "EDPL": "edge", "EDMB": "edge",
    "LGCH": "base", "LGPL": "base", "LGWD": "base",
    "GDPL": "base", "GDCH": "base",
    "FTPL": "base", "FTCH": "base", "GLDE": "base",
}

GROUP_COLORS = {
    "top": [217, 217, 217, 255],
    "base": [77, 77, 77, 255],
    "edge": [153, 153, 153, 255],
    "other": [128, 128, 128, 255],
}


def classify_layer(layer_name: str) -> str:
    upper = layer_name.upper()
    for pattern, group in LAYER_GROUP_MAP.items():
        if pattern in upper:
            return group
    return "other"


def extract_polyface(entity):
    """(vertices[N,3], faces[M,3]) from a POLYLINE polyface mesh."""
    faces_3d = list(entity.virtual_entities())
    if not faces_3d:
        return np.zeros((0, 3)), np.zeros((0, 3), dtype=np.int64)
    vert_map, vert_list, all_faces = {}, [], []
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
        if i2 != i3:
            all_faces.append([i0, i2, i3])
    return np.array(vert_list, dtype=np.float64), np.array(all_faces, dtype=np.int64)


def extract_mesh(entity):
    """(vertices[N,3], faces[M,3]) from a MESH entity, fan-triangulating n-gons."""
    md = entity.get_data()
    verts = np.array([(v.x, v.y, v.z) for v in md.vertices], dtype=np.float64)
    tris = []
    nv = len(verts)
    for face in md.faces:
        idx = [i for i in face if 0 <= i < nv]
        if len(idx) < 3:
            continue
        for k in range(1, len(idx) - 1):
            tris.append([idx[0], idx[k], idx[k + 1]])
    if not tris:
        return np.zeros((0, 3)), np.zeros((0, 3), dtype=np.int64)
    return verts, np.array(tris, dtype=np.int64)


def normalize_glb_name(dxf_filename: str) -> str:
    stem = Path(dxf_filename).stem
    match = re.match(r"^[A-Za-z]+-(\d{2})(.+)$", stem)
    if match:
        name = match.group(2).lower()
    else:
        match2 = re.match(r"^(\d{2})(.+)$", stem)
        name = match2.group(2).lower() if match2 else stem.lower()
    name = re.sub(r"\(\d+\)$", "", name)
    name = name.rstrip("_")
    return f"{name}.glb"


def split_components(vertices: np.ndarray, faces: np.ndarray):
    """Split a mesh into connected components; passthrough when already single."""
    try:
        m = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
        parts = m.split(only_watertight=False)
    except Exception:
        return [(vertices, faces)]
    if len(parts) <= 1:
        return [(vertices, faces)]
    return [(np.asarray(p.vertices, dtype=np.float64), np.asarray(p.faces, dtype=np.int64)) for p in parts]


def geometric_group(verts: np.ndarray, z_min: float, z_max: float) -> str:
    """Classify an unlabeled mesh as top or base by shape and elevation.

    'top': flat (z-extent under 25% of model height) and sitting in the
    upper 60% of the model. Everything else: 'base'.
    """
    height = max(z_max - z_min, 1e-9)
    mz_min, mz_max = verts[:, 2].min(), verts[:, 2].max()
    flat = (mz_max - mz_min) <= 0.25 * height
    high = (mz_min - z_min) >= 0.60 * height
    return "top" if (flat and high) else "base"


def dxf_to_glb(dxf_path: str, glb_path: str) -> dict:
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()

    raw = []  # (vertices, faces, layer, group-or-None)
    for entity in disassemble.recursive_decompose(msp):
        kind = entity.dxftype()
        try:
            if kind == "POLYLINE" and entity.is_poly_face_mesh:
                vertices, faces = extract_polyface(entity)
            elif kind == "MESH":
                vertices, faces = extract_mesh(entity)
            else:
                continue
        except Exception:
            continue
        if len(vertices) == 0 or len(faces) == 0:
            continue
        group = classify_layer(entity.dxf.layer)
        raw.append((vertices, faces, entity.dxf.layer, group))

    if not raw:
        return {"error": "No mesh geometry found", "file": os.path.basename(dxf_path)}

    global_verts = np.vstack([v for v, _, _, _ in raw])
    z_min, z_max = global_verts[:, 2].min(), global_verts[:, 2].max()

    groups = {}
    for vertices, faces, layer, group in raw:
        if group != "other":
            groups.setdefault(group, []).append((vertices, faces, layer))
            continue
        # Unlabeled mesh: split into connected components first — Big5 files
        # often carry the whole table as ONE mesh, which would otherwise
        # classify as a single tall 'base' blob with no separable top.
        for cv, cf in split_components(vertices, faces):
            g = geometric_group(cv, z_min, z_max)
            groups.setdefault(g, []).append((cv, cf, layer))

    global_center_xy = global_verts[:, :2].mean(axis=0)

    scene = trimesh.Scene()
    total_verts = total_faces = 0
    for group_name, meshes in groups.items():
        merged_verts_list, merged_faces_list, offset = [], [], 0
        for verts, faces, _ in meshes:
            merged_verts_list.append(verts)
            merged_faces_list.append(faces + offset)
            offset += len(verts)
        merged_verts = np.vstack(merged_verts_list) * 0.0254
        merged_faces = np.vstack(merged_faces_list)
        merged_verts[:, 0] -= global_center_xy[0] * 0.0254
        merged_verts[:, 1] -= global_center_xy[1] * 0.0254
        merged_verts[:, 2] -= z_min * 0.0254

        mesh = trimesh.Trimesh(vertices=merged_verts, faces=merged_faces)
        color = GROUP_COLORS.get(group_name, GROUP_COLORS["other"])
        mesh.visual.face_colors = np.tile(np.array(color, dtype=np.uint8), (len(merged_faces), 1))
        scene.add_geometry(mesh, node_name=group_name, geom_name=group_name)
        total_verts += len(merged_verts)
        total_faces += len(merged_faces)

    glb_data = scene.export(file_type="glb")
    with open(glb_path, "wb") as f:
        f.write(glb_data)

    return {
        "file": os.path.basename(dxf_path),
        "glb": os.path.basename(glb_path),
        "groups": list(groups.keys()),
        "layers": sorted(set(l for meshes in groups.values() for _, _, l in meshes)),
        "vertices": total_verts,
        "faces": total_faces,
        "glb_size_kb": round(os.path.getsize(glb_path) / 1024, 1),
    }


def main():
    parser = argparse.ArgumentParser(description="DXF -> GLB (polyface + MESH, block-aware)")
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--report", help="Optional JSON report path")
    args = parser.parse_args()

    input_dir = Path(args.input_dir).resolve()
    output_dir = Path(args.output_dir).resolve()
    if not input_dir.is_dir():
        sys.exit(f"Input directory not found: {input_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)

    dxf_files = sorted(f for f in input_dir.iterdir() if f.suffix.lower() == ".dxf")
    if not dxf_files:
        sys.exit(f"No DXF files in {input_dir}")

    print(f"=== DXF -> GLB (mesh-aware) ===")
    print(f"Input:  {input_dir}")
    print(f"Output: {output_dir}")
    print(f"Files:  {len(dxf_files)}")

    results, success, failure = [], 0, 0
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

    print(f"\n=== Done ===\nConverted: {success}/{len(dxf_files)}")
    if failure:
        print(f"Failed:    {failure}")

    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with open(report_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"Report:    {report_path}")


if __name__ == "__main__":
    main()
