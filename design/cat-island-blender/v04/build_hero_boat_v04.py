"""Reproducible Blender 5.2 construction script for Hero Market Boat v04."""
import sys
import json
from pathlib import Path
import bpy

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import importlib
import boat_core, boat_hull, boat_cabin, boat_props, boat_cat, boat_render
for mod in (boat_core, boat_hull, boat_cabin, boat_props, boat_cat, boat_render):
    importlib.reload(mod)

WORKSPACE = SCRIPT_DIR.parent.parent.parent
GLB_OUT = WORKSPACE / 'assets' / 'cat-island' / 'hero-boat-v04.glb'
BLEND_OUT = SCRIPT_DIR / 'hero-boat-v04.blend'
MANIFEST_OUT = SCRIPT_DIR / 'boat-manifest.json'
OVERVIEW_PNG = SCRIPT_DIR / 'hero-boat-v04-overview.png'
CLOSEUP_PNG = SCRIPT_DIR / 'hero-boat-v04-storefront-closeup.png'

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)

def create_anchor(name, loc, parent, col):
    emp = bpy.data.objects.new(name, None)
    emp.empty_display_type = 'PLAIN_AXES'
    emp.empty_display_size = 0.25
    emp.location = loc
    col.objects.link(emp)
    emp.parent = parent
    return emp

def main():
    clean_scene()
    boat_core.init_materials()

    boat_col = bpy.data.collections.new('HERO_BOAT_COLLECTION')
    bpy.context.scene.collection.children.link(boat_col)

    root = bpy.data.objects.new('HERO_BOAT', None)
    root.empty_display_type = 'PLAIN_AXES'
    root.location = (0.0, 0.0, 0.0)
    boat_col.objects.link(root)

    create_anchor('CounterAnchor', (-0.05, -0.82, 1.06), root, boat_col)
    create_anchor('BowAnchor', (-3.15, 0.0, 1.15), root, boat_col)
    create_anchor('SternAnchor', (3.15, 0.0, 1.10), root, boat_col)

    hull_objs, us = boat_hull.build_hull_and_deck(root, boat_col)
    gun_objs = boat_hull.build_gunwales_deck_fenders(root, boat_col, us)
    cab_objs = boat_cabin.build_counter_and_cabin(root, boat_col)
    awn_objs = boat_cabin.build_awning_sign_chimney(root, boat_col)
    prop_objs = boat_props.build_all_market_props(root, boat_col)
    cat_objs = boat_cat.build_shopkeeper_cat(root, boat_col)

    bpy.context.view_layer.update()
    min_v, max_v, total_tris, editable_objs = boat_render.compute_bounds_and_tris(root)

    # Export optimized GLB (merged by material under HERO_BOAT, no studio lights/camera/ground)
    draw_calls = boat_render.export_merged_glb(root, GLB_OUT)

    # Save editable .blend and render studio overview + storefront closeup
    boat_render.setup_studio_and_render(OVERVIEW_PNG, CLOSEUP_PNG)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUT))

    dims = max_v - min_v
    manifest = {
        'asset': 'HERO_BOAT',
        'glb_path': str(GLB_OUT.relative_to(WORKSPACE)).replace('\\', '/'),
        'glb_size_bytes': GLB_OUT.stat().st_size,
        'blend_path': str(BLEND_OUT.relative_to(WORKSPACE)).replace('\\', '/'),
        'renders': {
            'overview': str(OVERVIEW_PNG.relative_to(WORKSPACE)).replace('\\', '/'),
            'storefront_closeup': str(CLOSEUP_PNG.relative_to(WORKSPACE)).replace('\\', '/'),
        },
        'bounds_blender_z_up': {
            'min': [round(min_v.x, 3), round(min_v.y, 3), round(min_v.z, 3)],
            'max': [round(max_v.x, 3), round(max_v.y, 3), round(max_v.z, 3)],
            'dimensions': [round(dims.x, 3), round(dims.y, 3), round(dims.z, 3)],
        },
        'waterplane_z': 0.0,
        'submerged_hull_bottom_z': round(min_v.z, 3),
        'deck_z': 0.55,
        'roof_top_z': round(max_v.z, 3),
        'triangles': total_tris,
        'editable_mesh_objects_in_blend': editable_objs,
        'exported_glb_draw_calls': draw_calls,
        'materials_count': draw_calls,
        'anchors': {
            'CounterAnchor': [-0.05, -0.82, 1.06],
            'BowAnchor': [-3.15, 0.0, 1.15],
            'SternAnchor': [3.15, 0.0, 1.10],
        },
        'remaining_limits': 'Static mesh hierarchy exported with PBR materials; no external texture dependencies.'
    }
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f">>> Manifest written: {json.dumps(manifest)}")

if __name__ == '__main__':
    main()
