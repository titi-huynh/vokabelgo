"""Export optimization (merge by material for GLB), manifest generation, and studio renders."""
import json
import math
import bpy
import bmesh
from mathutils import Vector
from boat_core import srgb_to_linear

def compute_bounds_and_tris(root):
    min_v = Vector((1e9, 1e9, 1e9))
    max_v = Vector((-1e9, -1e9, -1e9))
    total_tris = 0
    mesh_children = [o for o in root.children_recursive if o.type == 'MESH']
    for o in mesh_children:
        mw = o.matrix_world
        for v in o.data.vertices:
            wv = mw @ v.co
            min_v.x, min_v.y, min_v.z = min(min_v.x, wv.x), min(min_v.y, wv.y), min(min_v.z, wv.z)
            max_v.x, max_v.y, max_v.z = max(max_v.x, wv.x), max(max_v.y, wv.y), max(max_v.z, wv.z)
        for p in o.data.polygons:
            total_tris += max(1, len(p.vertices) - 2)
    return min_v, max_v, total_tris, len(mesh_children)

def export_merged_glb(root, glb_path):
    """Create temporary merged-by-material meshes under HERO_BOAT so GLB draw calls are minimal (<35),
    export GLB, then restore editable objects for the .blend file!"""
    temp_col = bpy.data.collections.new('TEMP_GLB_EXPORT')
    bpy.context.scene.collection.children.link(temp_col)

    export_root = bpy.data.objects.new('HERO_BOAT_EXPORT', None)
    temp_col.objects.link(export_root)

    # Copy anchors under export_root
    for ch in root.children:
        if ch.type == 'EMPTY':
            emp = bpy.data.objects.new(ch.name, None)
            emp.location = ch.location.copy()
            temp_col.objects.link(emp)
            emp.parent = export_root

    # Group mesh data by material using bmesh in world space
    mat_bmeshes = {}
    for o in root.children_recursive:
        if o.type != 'MESH' or not o.data.materials:
            continue
        mat = o.data.materials[0]
        if mat is None:
            continue
        mname = mat.name
        if mname not in mat_bmeshes:
            mat_bmeshes[mname] = (mat, bmesh.new())
        bm = mat_bmeshes[mname][1]
        me_copy = o.data.copy()
        me_copy.transform(o.matrix_world)
        bm.from_mesh(me_copy)
        bpy.data.meshes.remove(me_copy)

    merged_objs = []
    for mname, (mat, bm) in mat_bmeshes.items():
        me = bpy.data.meshes.new(f'Boat_{mname}')
        bm.to_mesh(me)
        bm.free()
        for p in me.polygons:
            p.use_smooth = True
        me.materials.append(mat)
        mo = bpy.data.objects.new(f'Boat_{mname}', me)
        temp_col.objects.link(mo)
        mo.parent = export_root
        merged_objs.append(mo)

    orig_name = root.name
    root.name = 'HERO_BOAT_EDITABLE'
    export_root.name = 'HERO_BOAT'

    bpy.ops.object.select_all(action='DESELECT')
    export_root.select_set(True)
    for ch in export_root.children_recursive:
        ch.select_set(True)

    glb_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )
    draw_calls = len(merged_objs)

    # Cleanup temp export objects and restore HERO_BOAT name
    for ch in list(export_root.children_recursive):
        me = ch.data if ch.type == 'MESH' else None
        bpy.data.objects.remove(ch, do_unlink=True)
        if me:
            bpy.data.meshes.remove(me)
    bpy.data.objects.remove(export_root, do_unlink=True)
    bpy.data.collections.remove(temp_col)
    root.name = orig_name
    return draw_calls

def setup_studio_and_render(overview_path, closeup_path):
    scene = bpy.context.scene
    r_col = bpy.data.collections.new('STUDIO_RENDER_ONLY')
    scene.collection.children.link(r_col)

    # Warm neutral parchment studio world
    world = bpy.data.worlds.new('WarmStudioWorld')
    scene.world = world
    world.use_nodes = True
    bg = next((n for n in world.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bg:
        bg.inputs[0].default_value = (*srgb_to_linear('E2E8E6'), 1.0)
        bg.inputs[1].default_value = 0.65

    # Matte neutral studio water/ground plane at z = 0.0 for contact shadows (EXCLUDED from GLB)
    bpy.ops.mesh.primitive_CYLINDER_add if False else bpy.ops.mesh.primitive_circle_add(vertices=64, radius=14.0, fill_type='NGON', location=(0, 0, 0.0))
    ground = bpy.context.object
    ground.name = 'Studio_Waterplane_ShadowCatcher'
    for c in list(ground.users_collection):
        c.objects.unlink(ground)
    r_col.objects.link(ground)
    gmat = bpy.data.materials.new('StudioWaterMat')
    gmat.use_nodes = True
    bsdf = next((n for n in gmat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*srgb_to_linear('C8DDD6'), 1.0)
        bsdf.inputs['Roughness'].default_value = 0.72
    ground.data.materials.append(gmat)

    # Key, Fill, and Rim studio lights
    key_d = bpy.data.lights.new('Warm_Key_Sun', 'SUN')
    key_d.energy = 2.0
    key_d.color = (1.0, 0.99, 0.97)
    key_d.angle = math.radians(6.0)
    key_o = bpy.data.objects.new('Warm_Key_Sun', key_d)
    r_col.objects.link(key_o)
    key_o.location = (-5.0, -8.0, 10.0)
    key_o.rotation_euler = (math.radians(48), math.radians(-18), math.radians(-28))

    fill_d = bpy.data.lights.new('Soft_Fill_Area', 'AREA')
    fill_d.energy = 240.0
    fill_d.size = 9.0
    fill_d.color = (0.92, 0.96, 1.0)
    fill_o = bpy.data.objects.new('Soft_Fill_Area', fill_d)
    r_col.objects.link(fill_o)
    fill_o.location = (7.0, -7.0, 6.0)
    fill_o.rotation_euler = (math.radians(55), 0, math.radians(42))

    # Camera 1: Overview matching browser camera (9, 7, 11) in glTF Y-up -> (9, -11, 7) in Blender Z-up, plus front-3/4 view
    cam1_d = bpy.data.cameras.new('Overview_Camera')
    cam1_d.lens = 42.0
    cam1 = bpy.data.objects.new('Overview_Camera', cam1_d)
    r_col.objects.link(cam1)
    t1 = Vector((0.0, -0.10, 1.15))
    cam1.location = Vector((6.5, -8.5, 5.4))
    cam1.rotation_euler = (t1 - cam1.location).to_track_quat('-Z', 'Y').to_euler()

    # Camera 2: Storefront & Counter Closeup
    cam2_d = bpy.data.cameras.new('Storefront_Closeup_Camera')
    cam2_d.lens = 40.0
    cam2 = bpy.data.objects.new('Storefront_Closeup_Camera', cam2_d)
    r_col.objects.link(cam2)
    t2 = Vector((-0.6, -0.8, 1.22))
    cam2.location = Vector((-0.6, -2.8, 1.95))
    cam2.rotation_euler = (t2 - cam2.location).to_track_quat('-Z', 'Y').to_euler()

    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'

    scene.camera = cam1
    scene.render.filepath = str(overview_path)
    bpy.ops.render.render(write_still=True)

    scene.camera = cam2
    scene.render.filepath = str(closeup_path)
    bpy.ops.render.render(write_still=True)
    scene.camera = cam1
