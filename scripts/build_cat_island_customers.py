"""
Builds and exports customer boats and props for VokabelGo Cat Island.
Maintains the exact v03 art style, palette, and low-poly aesthetic.
Generates:
1. Customer Boat 1: Ginger tabby in a warm-wood sampan with bamboo canopy.
2. Customer Boat 2: Calico cat in a teal sampan with nón lá (conical hat).
3. Customer Boat 3: Tuxedo cat in a burgundy sampan with fruit crate.
4. Packaging props: Takeaway parcel (Zum Mitnehmen) & Dine-in plate (Hier essen).
"""

import bpy
import math
from pathlib import Path
from mathutils import Vector, Euler

OUT = Path(r"c:\Users\huynh\OneDrive\Desktop\flash\assets\cat-island")
OUT.mkdir(parents=True, exist_ok=True)

# Clean scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name != 'Collection':
        bpy.data.collections.remove(c)

def srgb_to_linear(hex_str):
    h = hex_str.lstrip('#')
    srgb = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in srgb]

def create_material(name, hexcolor, roughness=0.7, metallic=0.0):
    rgb = srgb_to_linear(hexcolor)
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1.0)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    if bs is None:
        bs = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bs:
        for inp in bs.inputs:
            if inp.name == 'Base Color' or inp.identifier == 'Base Color':
                inp.default_value = (*rgb, 1.0)
            elif inp.name == 'Roughness' or inp.identifier == 'Roughness':
                inp.default_value = roughness
            elif inp.name == 'Metallic' or inp.identifier == 'Metallic':
                inp.default_value = metallic
    return m

PALETTE = {
    'Wood warm': ('9E6A38', 0.75, 0.0),
    'Wood dark': ('52293E', 0.70, 0.0),
    'Teal sampan': ('2E7A70', 0.65, 0.0),
    'Trim gold': ('F5B627', 0.55, 0.0),
    'Trim cream': ('FAF3DE', 0.60, 0.0),
    'Boat eye white': ('FFFFFF', 0.20, 0.0),
    'Boat eye pupil': ('241D2E', 0.20, 0.0),
    'Bamboo canopy': ('D4A855', 0.80, 0.0),
    'Non la leaf': ('E8C87A', 0.85, 0.0),
    'Non la ring': ('C29C48', 0.85, 0.0),
    'Fruit crate wood': ('BD8848', 0.80, 0.0),
    'Fruit red': ('D8265E', 0.50, 0.0),
    'Fruit yellow': ('F7C627', 0.50, 0.0),
    
    # Cats
    'Cat ginger': ('E87C38', 0.65, 0.0),
    'Cat cream white': ('FAF5EC', 0.65, 0.0),
    'Cat tux dark': ('241D2E', 0.65, 0.0),
    'Cat calico patch': ('D65A28', 0.65, 0.0),
    'Cat inner ear pink': ('F08C94', 0.55, 0.0),
    'Cat nose pink': ('DE5F6A', 0.45, 0.0),
    'Cat cheek blush': ('E8737D', 0.70, 0.0),
    'Cat eye ink': ('1A1B1D', 0.08, 0.0),
    'Cat eye sparkle': ('FFFFFF', 0.08, 0.0),
    'Scarf teal': ('228B7E', 0.65, 0.0),
    'Scarf gold': ('F5B627', 0.65, 0.0),
    'Scarf red': ('E84637', 0.65, 0.0),

    # Packages
    'Kraft parcel': ('C49A58', 0.80, 0.0),
    'Parcel ribbon': ('E84637', 0.50, 0.0),
    'Ceramic plate': ('FAF5EC', 0.40, 0.0),
    'Plate food warm': ('E28236', 0.60, 0.0),
    'Garnish green': ('44A232', 0.70, 0.0)
}

MATS = {k: create_material(k, *v) for k, v in PALETTE.items()}

def assign(obj, name, mat_name, smooth=False):
    obj.name = name
    if mat_name in MATS:
        obj.data.materials.clear()
        obj.data.materials.append(MATS[mat_name])
    for p in obj.data.polygons:
        p.use_smooth = smooth
    return obj

def make_box(name, loc, dim, mat, rot=(0,0,0), smooth=False):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.object
    o.dimensions = dim
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return assign(o, name, mat, smooth=smooth)

def make_cylinder(name, loc, r1, r2, depth, mat, verts=14, rot=(0,0,0), smooth=False):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    return assign(bpy.context.object, name, mat, smooth=smooth)

def make_sphere(name, loc, scale, mat, segs=12, rings=8, rot=(0,0,0), smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = scale
    return assign(o, name, mat, smooth=smooth)

def make_custom_mesh(name, verts, faces, mat, smooth=False):
    mesh_data = bpy.data.meshes.new(name)
    mesh_data.from_pydata(verts, [], faces)
    mesh_data.update()
    o = bpy.data.objects.new(name, mesh_data)
    bpy.context.scene.collection.objects.link(o)
    if mat in MATS:
        mesh_data.materials.append(MATS[mat])
    for p in mesh_data.polygons:
        p.use_smooth = smooth
    return o

def build_sampan_hull(prefix, hull_mat, trim_mat):
    parts = []
    # Sleek traditional Vietnamese sampan (narrow, pointed bow and stern, flared gunwales)
    # Length: 2.1m, Width: 0.85m, Depth: 0.38m
    verts = [
        # Keel bottom (z = -0.22)
        (-0.95, 0.0, -0.15),   # 0: stern keel
        (-0.35, 0.0, -0.22),   # 1: aft mid keel
        (0.35, 0.0, -0.22),    # 2: fwd mid keel
        (1.05, 0.0, -0.05),    # 3: bow keel
        # Mid chine (z = 0.0)
        (-0.90, -0.28, 0.0),   # 4
        (-0.35, -0.38, 0.0),   # 5
        (0.35, -0.38, 0.0),    # 6
        (1.10, 0.0, 0.12),     # 7: bow tip mid
        (0.35, 0.38, 0.0),     # 8
        (-0.35, 0.38, 0.0),    # 9
        (-0.90, 0.28, 0.0),    # 10
        # Gunwale top (z = 0.24)
        (-0.85, -0.32, 0.22),  # 11
        (-0.30, -0.42, 0.24),  # 12
        (0.35, -0.40, 0.25),   # 13
        (1.18, 0.0, 0.32),     # 14: bow top
        (0.35, 0.40, 0.25),    # 15
        (-0.30, 0.42, 0.24),   # 16
        (-0.85, 0.32, 0.22)    # 17
    ]
    faces = [
        (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6),
        (0, 4, 10), (0, 10, 9, 1), (1, 9, 8, 2), (2, 8, 7, 3),
        (4, 5, 12, 11), (5, 6, 13, 12), (6, 7, 14, 13),
        (7, 8, 15, 14), (8, 9, 16, 15), (9, 10, 17, 16),
        (10, 4, 11, 17),
        (11, 12, 13, 14, 15, 16, 17)
    ]
    hull = make_custom_mesh(f'{prefix}_Hull', verts, faces, hull_mat, smooth=False)
    parts.append(hull)
    
    # Gunwale trim
    rail_l = make_box(f'{prefix}_RailL', (0.0, -0.40, 0.25), (1.5, 0.05, 0.04), trim_mat)
    rail_r = make_box(f'{prefix}_RailR', (0.0, 0.40, 0.25), (1.5, 0.05, 0.04), trim_mat)
    bench = make_box(f'{prefix}_Bench', (-0.1, 0.0, 0.10), (0.35, 0.70, 0.04), trim_mat)
    parts.extend([rail_l, rail_r, bench])
    
    # Vietnamese Boat Eye ("Mắt Ghe") on bow
    for sign in [-1, 1]:
        eye_y = sign * 0.24
        eye_w = make_sphere(f'{prefix}_EyeW_{sign}', (0.85, eye_y, 0.18), (0.06, 0.015, 0.045), 'Boat eye white', segs=8, rings=6)
        eye_p = make_sphere(f'{prefix}_EyeP_{sign}', (0.86, eye_y + sign*0.008, 0.18), (0.03, 0.012, 0.03), 'Boat eye pupil', segs=6, rings=4)
        parts.extend([eye_w, eye_p])
        
    return parts

def build_customer_cat(prefix, coat_mat, scarf_mat, rot_z=0.0):
    parts = []
    s = 0.82
    x, y, z = -0.10, 0.0, 0.12
    head_z = z + 0.36 * s
    
    # Head
    head = make_sphere(f'{prefix}_Head', (x, y, head_z), (0.26*s, 0.24*s, 0.24*s), coat_mat, segs=14, rings=10, smooth=True)
    parts.append(head)
    
    # Ears
    for sign in [-1, 1]:
        ear_base = (x + sign * 0.14 * s, y, head_z + 0.16 * s)
        ear_out = make_cylinder(f'{prefix}_EarOut_{sign}', ear_base, 0.09*s, 0.01*s, 0.18*s, coat_mat, verts=4, rot=(0, sign * math.radians(16), 0))
        ear_in = make_cylinder(f'{prefix}_EarIn_{sign}', (ear_base[0], ear_base[1] - 0.02*s, ear_base[2]), 0.06*s, 0.01*s, 0.12*s, 'Cat inner ear pink', verts=4, rot=(0, sign * math.radians(16), 0))
        parts.extend([ear_out, ear_in])
        
    # Eyes looking toward -Y / port
    for sign in [-1, 1]:
        eye_x = x + sign * 0.09 * s
        eye_y = y - 0.20 * s
        eye_z = head_z - 0.01 * s
        eye = make_sphere(f'{prefix}_Eye_{sign}', (eye_x, eye_y, eye_z), (0.035*s, 0.018*s, 0.04*s), 'Cat eye ink', segs=8, rings=6, smooth=True)
        sparkle = make_sphere(f'{prefix}_Spark_{sign}', (eye_x - 0.008*s, eye_y - 0.012*s, eye_z + 0.012*s), (0.01*s, 0.006*s, 0.012*s), 'Cat eye sparkle', segs=6, rings=4, smooth=True)
        parts.extend([eye, sparkle])
        
    # Nose & Blush
    nose = make_sphere(f'{prefix}_Nose', (x, y - 0.22*s, head_z - 0.045*s), (0.024*s, 0.016*s, 0.02*s), 'Cat nose pink', segs=8, rings=6, smooth=True)
    parts.append(nose)
    for sign in [-1, 1]:
        blush = make_sphere(f'{prefix}_Blush_{sign}', (x + sign*0.14*s, y - 0.18*s, head_z - 0.05*s), (0.045*s, 0.012*s, 0.03*s), 'Cat cheek blush', segs=8, rings=6, smooth=True)
        parts.append(blush)
        
    # Body
    torso_z = z + 0.13 * s
    body = make_sphere(f'{prefix}_Body', (x, y, torso_z), (0.17*s, 0.15*s, 0.18*s), coat_mat, segs=10, rings=8, smooth=True)
    parts.append(body)
    
    # Scarf
    scarf = make_cylinder(f'{prefix}_Scarf', (x, y - 0.04*s, torso_z + 0.12*s), 0.16*s, 0.14*s, 0.05*s, scarf_mat, verts=10)
    knot = make_sphere(f'{prefix}_Knot', (x, y - 0.15*s, torso_z + 0.10*s), (0.04*s, 0.025*s, 0.04*s), scarf_mat, segs=6, rings=4)
    parts.extend([scarf, knot])
    
    # Paws on the bench/gunwale
    paw_l = make_sphere(f'{prefix}_PawL', (x - 0.09*s, y - 0.10*s, z + 0.05*s), (0.045*s, 0.055*s, 0.035*s), coat_mat, segs=6, rings=4)
    paw_r = make_sphere(f'{prefix}_PawR', (x + 0.09*s, y - 0.10*s, z + 0.05*s), (0.045*s, 0.055*s, 0.035*s), coat_mat, segs=6, rings=4)
    tail = make_cylinder(f'{prefix}_Tail', (x, y + 0.13*s, torso_z), 0.03*s, 0.018*s, 0.16*s, coat_mat, verts=6, rot=(math.radians(-30), 0, 0))
    parts.extend([paw_l, paw_r, tail])
    
    return parts

def parent_into_empty(name, objects, loc=(0,0,0)):
    empty = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(empty)
    empty.location = loc
    for o in objects:
        o.parent = empty
    return empty

# 1. Customer Boat 1 (Ginger in Warm Wood Sampan + Arched Bamboo Canopy)
b1_parts = build_sampan_hull('Boat1', 'Wood warm', 'Trim gold')
b1_cat = build_customer_cat('Cat1', 'Cat ginger', 'Scarf teal')
# Arched bamboo canopy over midship
canopy_verts = []
for a_i in range(9):
    ang = math.pi * a_i / 8
    canopy_verts.append((-0.35, -math.cos(ang)*0.42, 0.22 + math.sin(ang)*0.40))
for a_i in range(9):
    ang = math.pi * a_i / 8
    canopy_verts.append((0.15, -math.cos(ang)*0.42, 0.22 + math.sin(ang)*0.40))
canopy_faces = []
for a_i in range(8):
    canopy_faces.append((a_i, a_i+1, 9+a_i+1, 9+a_i))
canopy = make_custom_mesh('Boat1_Canopy', canopy_verts, canopy_faces, 'Bamboo canopy', smooth=False)
b1_parts.append(canopy)
parent_into_empty('CustomerBoat_Ginger', b1_parts + b1_cat, loc=(-4.0, 0.0, 0.0))

# 2. Customer Boat 2 (Calico in Teal Sampan + Nón Lá)
b2_parts = build_sampan_hull('Boat2', 'Teal sampan', 'Trim cream')
b2_cat = build_customer_cat('Cat2', 'Cat cream white', 'Scarf gold')
# Nón Lá (Conical hat)
non_la_cone = make_cylinder('Boat2_NonLa', (-0.10, 0.0, 0.53), 0.28, 0.01, 0.16, 'Non la leaf', verts=16, rot=(math.radians(10), math.radians(5), 0))
b2_parts.append(non_la_cone)
parent_into_empty('CustomerBoat_Calico', b2_parts + b2_cat, loc=(-4.0, 2.5, 0.0))

# 3. Customer Boat 3 (Tuxedo in Burgundy Sampan + Fruit Crate)
b3_parts = build_sampan_hull('Boat3', 'Wood dark', 'Trim gold')
b3_cat = build_customer_cat('Cat3', 'Cat tux dark', 'Scarf red')
# Small fruit crate on bow
crate = make_box('Boat3_Crate', (0.50, 0.0, 0.20), (0.28, 0.28, 0.16), 'Fruit crate wood')
f1 = make_sphere('Boat3_Fruit1', (0.47, -0.05, 0.29), (0.05, 0.05, 0.05), 'Fruit red', segs=8, rings=6)
f2 = make_sphere('Boat3_Fruit2', (0.52, 0.05, 0.29), (0.055, 0.055, 0.055), 'Fruit yellow', segs=8, rings=6)
b3_parts.extend([crate, f1, f2])
parent_into_empty('CustomerBoat_Tuxedo', b3_parts + b3_cat, loc=(-4.0, -2.5, 0.0))

# 4. Packaging Props: Takeaway Parcel & Dine-in Plate
prop_parts = []
# A. Takeaway Parcel (Zum Mitnehmen)
parcel_box = make_box('Prop_Takeaway_Box', (0.0, 4.0, 0.12), (0.24, 0.24, 0.18), 'Kraft parcel')
ribbon_v = make_box('Prop_Takeaway_RibbonV', (0.0, 4.0, 0.12), (0.245, 0.06, 0.185), 'Parcel ribbon')
ribbon_h = make_box('Prop_Takeaway_RibbonH', (0.0, 4.0, 0.12), (0.06, 0.245, 0.185), 'Parcel ribbon')
parcel_empty = parent_into_empty('Item_Takeaway', [parcel_box, ribbon_v, ribbon_h], loc=(0.0, 4.0, 0.0))

# B. Dine-in Plate (Hier essen)
plate = make_cylinder('Prop_DineIn_Plate', (1.0, 4.0, 0.03), 0.22, 0.18, 0.04, 'Ceramic plate', verts=14)
food1 = make_sphere('Prop_DineIn_Food', (1.0, 4.0, 0.07), (0.12, 0.12, 0.05), 'Plate food warm', segs=8, rings=6)
garnish = make_box('Prop_DineIn_Garnish', (1.04, 3.98, 0.10), (0.04, 0.03, 0.02), 'Garnish green')
dinein_empty = parent_into_empty('Item_DineIn', [plate, food1, garnish], loc=(1.0, 4.0, 0.0))

# Save blend and export to GLB
blend_file = OUT / 'customer-boats.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend_file))

target_glb = OUT / 'customer-boats.glb'
print(f">>> Exporting customer boats to {target_glb}...")
bpy.ops.export_scene.gltf(
    filepath=str(target_glb),
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True
)
print(f">>> Export completed: {target_glb.stat().st_size} bytes.")
