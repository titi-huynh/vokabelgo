"""VokabelGo - Vietnamese Floating Cat Market (Chợ Nổi Đảo Mèo)
Original Blender 3D Art Prototype - Version 03 (Refined Low-Poly Cutaway Diorama).

Primary Art Reference:
C:/Users/huynh/AppData/Local/Temp/codex-clipboard-8f1431a9-4578-42aa-84b7-21d11dd82adb.png

Key Architectural Corrections:
1. Boat Assembly & Camera:
   - Parented MARKET BOAT Assembly with rotation_z = 0.0.
   - All character faces, cabin door, portholes, counter, and life preserver face local -Y, directly into the camera!
2. Both Feline Characters Camera-Visible:
   - Mochi (Hero Cat): Stands on cabin roof overlooking market, facing -Y into camera, cream-white coat, coral neckerchief.
   - Pepper (Companion Cat): Positioned on open bow-deck at (1.05, -0.58, 0.65) with rail clearance, blue-gray coat,
     holding bamboo fishing rod with bobbing lure and white ripple rings in the foreground water.
3. Translucent Water & Visible Sage Riverbed:
   - Water top surface: stylized matte transparency (Alpha 0.20, Transmission 0.0, Roughness 0.80) preventing specular glare.
   - Pale sage riverbed (#A8C59C) dominates through foreground water with crisp faceted mounds, reeds, and pebbles.
   - Side cutaway retains vivid cyan tint (#20AEA2).
"""

import bpy
import math
import random
import json
from pathlib import Path
from mathutils import Vector, Euler

OUT = Path(__file__).resolve().parent
random.seed(42)

# -----------------------------------------------------------------------------
# Clean Scene
# -----------------------------------------------------------------------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for c in list(bpy.data.collections):
    if c.name != 'Collection':
        bpy.data.collections.remove(c)

# -----------------------------------------------------------------------------
# Palette & Color Management (sRGB to Linear Conversion)
# -----------------------------------------------------------------------------
def srgb_to_linear(hex_str):
    h = hex_str.lstrip('#')
    srgb = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in srgb]

def create_material(name, hexcolor, roughness=0.7, metallic=0.0, alpha=1.0, transmission=0.0):
    rgb = srgb_to_linear(hexcolor)
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, alpha)
    m.use_nodes = True
    
    bs = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bs is None:
        bs = m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        output = m.node_tree.nodes.new('ShaderNodeOutputMaterial')
        m.node_tree.links.new(bs.outputs['BSDF'], output.inputs['Surface'])
        
    for inp in bs.inputs:
        if inp.identifier == 'Base Color' or inp.name == 'Base Color':
            inp.default_value = (*rgb, 1.0)
        elif inp.identifier == 'Roughness' or inp.name == 'Roughness':
            inp.default_value = roughness
        elif inp.identifier == 'Metallic' or inp.name == 'Metallic':
            inp.default_value = metallic
        elif inp.identifier == 'Alpha' or inp.name == 'Alpha':
            inp.default_value = alpha
        elif inp.identifier in ('Transmission Weight', 'Transmission'):
            inp.default_value = transmission
            
    return m

# 10-Color Primary Palette matching reference codex-clipboard-8f1431a9...
PALETTE = {
    # Studio Backdrop
    'Mauve backdrop': ('624B69', 0.90, 0.0),
    
    # Stylized Transparent Cutaway Water & Pale Sage Bed
    # Alpha 0.20 & Transmission 0.0 with matte roughness removes specular glare so pale sage bed dominates!
    'Water turquoise surface': ('32D2C4', 0.80, 0.0, 0.20, 0.0),
    'Water cutaway wall': ('20AEA2', 0.35, 0.0, 0.70, 0.0),
    'Faceted riverbed sage': ('A8C59C', 0.85, 0.0),
    'River stone slate': ('6E6875', 0.80, 0.0),
    'Water reed green': ('44A232', 0.70, 0.0),
    'Ripple white': ('FFFFFF', 0.30, 0.0),
    
    # Boat Hulls & Architecture
    'Hull dark plum': ('2E233A', 0.70, 0.0),
    'Hull dark navy': ('241D2E', 0.70, 0.0),
    'Trim golden yellow': ('F5B627', 0.55, 0.0),
    'Cabin coral red': ('E84637', 0.65, 0.0),
    'Roof warm cream': ('FAF3DE', 0.60, 0.0),
    'Window sky blue': ('6AB8DE', 0.20, 0.0),
    'Chimney charcoal': ('382F40', 0.80, 0.0),
    'Smoke puff mauve': ('9992A2', 0.90, 0.0),
    'Life ring orange': ('EE6828', 0.60, 0.0),
    'Life ring cream': ('FCF7EB', 0.60, 0.0),
    
    # Vietnamese Produce & Bamboo
    'Bamboo gold': ('DBAD4B', 0.60, 0.0),
    'Woven wicker': ('BD8848', 0.80, 0.0),
    'Dragonfruit magenta': ('D8265E', 0.50, 0.0),
    'Dragonfruit leaf': ('6FB02C', 0.55, 0.0),
    'Banana yellow': ('F7C627', 0.50, 0.0),
    'Watermelon dark': ('2D6624', 0.50, 0.0),
    'Mangosteen purple': ('451B3A', 0.45, 0.0),
    'Produce cord': ('8A6B48', 0.85, 0.0),
    
    # Feline Characters
    'Cat cream white': ('FAF5EC', 0.65, 0.0),
    'Cat blue gray': ('6B7E8C', 0.65, 0.0),
    'Cat inner ear pink': ('F08C94', 0.55, 0.0),
    'Cat nose pink': ('DE5F6A', 0.45, 0.0),
    'Cat cheek blush': ('E8737D', 0.70, 0.0),
    'Cat eye ink': ('1A1B1D', 0.08, 0.0),
    'Cat eye sparkle': ('FFFFFF', 0.08, 0.0),
    'Neckerchief coral': ('E84637', 0.65, 0.0),
    'Boat eye white': ('FFFFFF', 0.20, 0.0)
}

MATS = {}
for k, vals in PALETTE.items():
    hex_c = vals[0]
    rough = vals[1]
    met = vals[2]
    alpha = vals[3] if len(vals) > 3 else 1.0
    trans = vals[4] if len(vals) > 4 else 0.0
    MATS[k] = create_material(k, hex_c, rough, met, alpha, trans)

# -----------------------------------------------------------------------------
# Hierarchy and Helper Utilities
# -----------------------------------------------------------------------------
CURRENT_COLLECTION = None

def set_group(name):
    global CURRENT_COLLECTION
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    CURRENT_COLLECTION = col
    return col

def assign_object(obj, name, mat_name=None, smooth=False):
    obj.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    CURRENT_COLLECTION.objects.link(obj)
    if mat_name and mat_name in MATS:
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
    return assign_object(o, name, mat, smooth=smooth)

def make_cylinder(name, loc, r1, r2, depth, mat, verts=16, rot=(0,0,0), smooth=False):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    return assign_object(bpy.context.object, name, mat, smooth=smooth)

def make_sphere(name, loc, scale, mat, segs=14, rings=10, rot=(0,0,0), smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = scale
    return assign_object(o, name, mat, smooth=smooth)

def make_icosphere(name, loc, radius, mat, subdiv=1, smooth=False):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv, radius=radius, location=loc)
    return assign_object(bpy.context.object, name, mat, smooth=smooth)

def make_beam(name, p1, p2, radius, mat, verts=8, smooth=False):
    p1, p2 = Vector(p1), Vector(p2)
    mid = (p1 + p2) * 0.5
    delta = p2 - p1
    length = max(delta.length, 0.001)
    o = make_cylinder(name, mid, radius, radius, length, mat, verts=verts, smooth=smooth)
    o.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return o

def make_custom_mesh(name, verts, faces, mat, smooth=False):
    mesh_data = bpy.data.meshes.new(name)
    mesh_data.from_pydata(verts, [], faces)
    mesh_data.update()
    o = bpy.data.objects.new(name, mesh_data)
    CURRENT_COLLECTION.objects.link(o)
    if mat in MATS:
        mesh_data.materials.append(MATS[mat])
    for p in mesh_data.polygons:
        p.use_smooth = smooth
    return o

def parent_group(name, objects, location=(0, 0, 0), rotation_z=0.0):
    empty = bpy.data.objects.new(name, None)
    CURRENT_COLLECTION.objects.link(empty)
    empty.location = location
    empty.rotation_euler.z = rotation_z
    for o in objects:
        o.parent = empty
    return empty

# -----------------------------------------------------------------------------
# 1. Translucent Cutaway Water Volume & Pale Sage Riverbed
# -----------------------------------------------------------------------------
def build_cutaway_water_diorama():
    created = []
    
    # Hand-shaped polygonal perimeter matching the reference diorama block
    outline = [
        (-3.8, -2.4), (-0.8, -3.2), (3.4, -2.5),
        (4.2, -0.4), (3.8, 2.0), (0.8, 2.8),
        (-2.6, 2.4), (-4.2, 0.2)
    ]
    n = len(outline)
    
    # A. Translucent Turquoise Water Top Surface (z = 0.0)
    top_verts = [(x, y, 0.0) for x, y in outline]
    top_faces = [tuple(range(n))]
    water_top = make_custom_mesh('Water Surface Top', top_verts, top_faces, 'Water turquoise surface', smooth=False)
    created.append(water_top)
    
    # B. Vertical Water Cutaway Wall (z = 0.0 to z = -1.5)
    wall_verts = []
    for x, y in outline:
        wall_verts.append((x, y, 0.0))
    for x, y in outline:
        wall_verts.append((x, y, -1.5))
        
    wall_faces = []
    for i in range(n):
        nxt = (i + 1) % n
        wall_faces.append((i, nxt, n + nxt, n + i))
    water_wall = make_custom_mesh('Water Cutaway Wall', wall_verts, wall_faces, 'Water cutaway wall', smooth=False)
    created.append(water_wall)
    
    # C. Crisp Beveled Water Surface Rim
    rim_verts = []
    for x, y in outline:
        rim_verts.append((x*1.02, y*1.02, 0.02))
    for x, y in outline:
        rim_verts.append((x*0.98, y*0.98, -0.04))
    rim_faces = []
    for i in range(n):
        nxt = (i + 1) % n
        rim_faces.append((i, nxt, n + nxt, n + i))
    water_rim = make_custom_mesh('Water Surface Beveled Rim', rim_verts, rim_faces, 'Ripple white', smooth=False)
    created.append(water_rim)
    
    # D. Faceted Pale Sage Riverbed (#A8C59C)
    grid_res = 5
    xs = [-3.4 + i * (6.8 / (grid_res - 1)) for i in range(grid_res)]
    ys = [-2.6 + j * (5.0 / (grid_res - 1)) for j in range(grid_res)]
    
    bed_verts = []
    z_offsets = [
        [-1.30, -1.15, -1.20, -1.30, -1.35],
        [-1.15, -0.75, -0.85, -1.05, -1.20],
        [-1.10, -0.60, -0.75, -0.95, -1.15],
        [-1.20, -0.85, -0.95, -1.10, -1.25],
        [-1.35, -1.25, -1.25, -1.30, -1.35]
    ]
    for j in range(grid_res):
        for i in range(grid_res):
            bed_verts.append((xs[i], ys[j], z_offsets[j][i]))
            
    bed_faces = []
    for j in range(grid_res - 1):
        for i in range(grid_res - 1):
            p0 = j * grid_res + i
            p1 = j * grid_res + (i + 1)
            p2 = (j + 1) * grid_res + (i + 1)
            p3 = (j + 1) * grid_res + i
            bed_faces.append((p0, p1, p2))
            bed_faces.append((p0, p2, p3))
            
    riverbed = make_custom_mesh('Faceted Riverbed', bed_verts, bed_faces, 'Faceted riverbed sage', smooth=False)
    created.append(riverbed)
    
    # E. Chunky Low-Poly Sea Reeds (#44A232)
    for rx, ry, rz in [(-1.8, -1.4, -0.75), (-1.4, -1.2, -0.70), (-2.0, -1.0, -0.85)]:
        for k in range(3):
            ang = k * 0.7
            reed = make_box('River Reed', (rx + math.cos(ang)*0.10, ry + math.sin(ang)*0.10, rz + 0.25), (0.09, 0.04, 0.48), 'Water reed green', rot=(0, math.radians(12), ang), smooth=False)
            created.append(reed)
            
    # F. Submerged Riverbed Pebble Stones
    for sx, sy, sz in [(-2.5, -0.5, -0.95), (1.5, -1.2, -1.05), (2.2, -0.4, -1.05)]:
        stone = make_icosphere('River Stone', (sx, sy, sz), 0.22, 'River stone slate', subdiv=1, smooth=False)
        created.append(stone)
        
    # G. Concentric White Ripple Rings Around Bobbing Lure in Foreground Water
    # Placed right where the companion cat's fishing rod extends!
    lure_pos = (1.20, -1.35)
    for ring_i, r_rad in enumerate([0.35, 0.65, 1.05]):
        pts = [(lure_pos[0] + math.cos(i * math.tau / 20) * r_rad, lure_pos[1] + math.sin(i * math.tau / 20) * (r_rad * 0.65), 0.012) for i in range(21)]
        c_data = bpy.data.curves.new(f'Lure Ripple {ring_i}', 'CURVE')
        c_data.dimensions = '3D'
        c_data.bevel_depth = 0.020
        c_data.bevel_resolution = 1
        spl = c_data.splines.new('POLY')
        spl.points.add(len(pts) - 1)
        for p_idx, co in enumerate(pts):
            spl.points[p_idx].co = (*co, 1.0)
        r_obj = bpy.data.objects.new(f'Lure Ripple {ring_i}', c_data)
        CURRENT_COLLECTION.objects.link(r_obj)
        if 'Ripple white' in MATS:
            c_data.materials.append(MATS['Ripple white'])
        created.append(r_obj)
        
    return created

# -----------------------------------------------------------------------------
# 2. Compact Market Trawler Boat (Facing local -Y into camera!)
# -----------------------------------------------------------------------------
def build_compact_market_trawler():
    created = []
    
    # A. Chunky Faceted Boat Hull (Dark Plum #2E233A)
    # Bow is at +X, Stern is at -X, Port (with door and life ring) is at -Y
    hull_verts = [
        # Keel bottom (z = -0.45)
        (-1.7, 0.0, -0.45),   # 0: stern keel
        (-0.5, 0.0, -0.55),   # 1: mid-aft keel
        (0.7, 0.0, -0.55),    # 2: mid-fwd keel
        (1.8, 0.0, -0.15),    # 3: bow stem bottom
        
        # Mid-chine perimeter (z = 0.05)
        (-1.6, -0.85, 0.05),  # 4: stern L
        (-0.5, -1.10, 0.05),  # 5: mid-aft L
        (0.7, -1.05, 0.05),   # 6: mid-fwd L
        (1.9, 0.0, 0.25),     # 7: bow tip mid
        (0.7, 1.05, 0.05),    # 8: mid-fwd R
        (-0.5, 1.10, 0.05),   # 9: mid-aft R
        (-1.6, 0.85, 0.05),   # 10: stern R
        
        # Sheer top gunwale perimeter (z = 0.65)
        (-1.5, -0.90, 0.60),  # 11: stern top L
        (-0.5, -1.20, 0.60),  # 12: mid-aft top L
        (0.7, -1.15, 0.65),   # 13: mid-fwd top L
        (2.0, 0.0, 0.85),     # 14: bow top tip
        (0.7, 1.15, 0.65),    # 15: mid-fwd top R
        (-0.5, 1.20, 0.60),   # 16: mid-aft top R
        (-1.5, 0.90, 0.60)    # 17: stern top R
    ]
    
    hull_faces = [
        (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6),
        (0, 4, 10), (0, 10, 9, 1), (1, 9, 8, 2), (2, 8, 7, 3),
        (4, 5, 12, 11), (5, 6, 13, 12), (6, 7, 14, 13),
        (7, 8, 15, 14), (8, 9, 16, 15), (9, 10, 17, 16),
        (10, 4, 11, 17),
        (11, 12, 13, 14, 15, 16, 17)
    ]
    
    hull = make_custom_mesh('Compact Hull Plum', hull_verts, hull_faces, 'Hull dark plum', smooth=False)
    created.append(hull)
    
    # B. Warm Golden-Yellow Gunwale Rail & Stanchions (#F5B627)
    rail_pts = [
        (0.5, -1.18, 0.78),
        (1.3, -0.80, 0.88),
        (2.05, 0.0, 0.98),
        (1.3, 0.80, 0.88),
        (0.5, 1.18, 0.78)
    ]
    for r_idx in range(len(rail_pts) - 1):
        bar = make_beam(f'Bow Rail Bar {r_idx}', rail_pts[r_idx], rail_pts[r_idx+1], 0.038, 'Trim golden yellow', verts=6, smooth=False)
        created.append(bar)
    for p_pt in rail_pts:
        stanchion = make_beam('Rail Post', (p_pt[0], p_pt[1], 0.65), (p_pt[0], p_pt[1], p_pt[2]), 0.025, 'Trim golden yellow', verts=6, smooth=False)
        created.append(stanchion)
        
    stern_rail_l = make_beam('Stern Rail L', (-1.5, -0.90, 0.65), (-0.5, -1.20, 0.65), 0.040, 'Trim golden yellow', verts=6, smooth=False)
    stern_rail_r = make_beam('Stern Rail R', (-1.5, 0.90, 0.65), (-0.5, 1.20, 0.65), 0.040, 'Trim golden yellow', verts=6, smooth=False)
    stern_rail_back = make_beam('Stern Rail Back', (-1.5, -0.90, 0.65), (-1.5, 0.90, 0.65), 0.040, 'Trim golden yellow', verts=6, smooth=False)
    created.extend([stern_rail_l, stern_rail_r, stern_rail_back])
    
    # C. Circular Hull Porthole Windows on Port Side (Facing camera -Y)
    for port_x in [-0.2, 0.5]:
        rim = make_cylinder('Hull Porthole Rim', (port_x, -1.10, 0.32), 0.22, 0.22, 0.04, 'Hull dark navy', verts=14, rot=(math.radians(90), 0, 0), smooth=False)
        glass = make_cylinder('Hull Porthole Glass', (port_x, -1.11, 0.32), 0.17, 0.17, 0.03, 'Window sky blue', verts=14, rot=(math.radians(90), 0, 0), smooth=False)
        created.extend([rim, glass])
        
    # D. Painted Vietnamese Boat Eyes ("Mắt ghe") on the Bow
    for sign in [-1, 1]:
        eye_y = sign * 0.65
        eye_white = make_sphere('Mat Ghe White', (1.55, eye_y, 0.52), (0.09, 0.02, 0.065), 'Boat eye white', segs=10, rings=8, rot=(0, 0, math.radians(-25 * sign)), smooth=True)
        eye_pupil = make_sphere('Mat Ghe Pupil', (1.56, eye_y + sign*0.012, 0.52), (0.045, 0.015, 0.045), 'Hull dark plum', segs=8, rings=6, rot=(0, 0, math.radians(-25 * sign)), smooth=True)
        created.extend([eye_white, eye_pupil])
        
    # E. Bold Coral Cabin & Warm Cream Roof (#E84637 & #FAF3DE)
    cabin_loc = (-0.15, 0.0, 1.05)
    cabin = make_box('Cabin Coral Body', cabin_loc, (1.45, 1.35, 1.05), 'Cabin coral red', smooth=False)
    created.append(cabin)
    
    # Windscreen on front (+X facing bow)
    w_frame = make_box('Windscreen Frame', (0.58, -0.22, 1.15), (0.04, 0.52, 0.48), 'Trim golden yellow', smooth=False)
    w_glass = make_box('Windscreen Glass', (0.59, -0.22, 1.15), (0.03, 0.45, 0.42), 'Window sky blue', smooth=False)
    created.extend([w_frame, w_glass])
    
    # Circular porthole on cabin port side (facing -Y into camera!)
    cab_port_rim = make_cylinder('Cabin Porthole Rim', (-0.15, -0.68, 1.15), 0.22, 0.22, 0.04, 'Trim golden yellow', verts=14, rot=(math.radians(90), 0, 0), smooth=False)
    cab_port_glass = make_cylinder('Cabin Porthole Glass', (-0.15, -0.69, 1.15), 0.17, 0.17, 0.03, 'Window sky blue', verts=14, rot=(math.radians(90), 0, 0), smooth=False)
    created.extend([cab_port_rim, cab_port_glass])
    
    # Cabin door on port side (facing -Y into camera!)
    door_frame = make_box('Cabin Door Frame', (-0.58, -0.68, 0.95), (0.36, 0.04, 0.72), 'Trim golden yellow', smooth=False)
    door_panel = make_box('Cabin Door Panel', (-0.58, -0.69, 0.95), (0.30, 0.03, 0.66), 'Cabin coral red', smooth=False)
    created.extend([door_frame, door_panel])
    
    # Overhanging Cream Roof Slab (#FAF3DE)
    roof = make_box('Cabin Roof Cream', (-0.15, 0.0, 1.62), (1.64, 1.52, 0.14), 'Roof warm cream', smooth=False)
    created.append(roof)
    
    # F. Charcoal Smokestack & 3 Faceted Smoke Puffs
    chimney_loc = (-0.75, 0.35, 1.70)
    chimney = make_cylinder('Galley Chimney', chimney_loc, 0.14, 0.12, 0.75, 'Chimney charcoal', verts=10, smooth=False)
    chimney_rim = make_cylinder('Chimney Rim', (chimney_loc[0], chimney_loc[1], 2.08), 0.16, 0.16, 0.06, 'Hull dark navy', verts=10, smooth=False)
    created.extend([chimney, chimney_rim])
    
    smoke_offsets = [(0.0, 0.0, 0.50, 0.18), (-0.08, 0.05, 0.90, 0.24), (-0.14, 0.10, 1.40, 0.32)]
    for s_idx, (sx, sy, sz, sr) in enumerate(smoke_offsets):
        puff = make_icosphere(f'Smoke Puff {s_idx}', (chimney_loc[0] + sx, chimney_loc[1] + sy, 2.0 + sz), sr, 'Smoke puff mauve', subdiv=1, smooth=False)
        created.append(puff)
        
    # G. Striped Life Preserver Ring on Port Side Gunwale (Facing -Y into camera!)
    ring_loc = (-1.15, -0.88, 0.75)
    ring_core = make_cylinder('Life Ring Core', ring_loc, 0.25, 0.25, 0.08, 'Life ring orange', verts=16, rot=(math.radians(90), 0, 0), smooth=False)
    ring_hole = make_cylinder('Life Ring Inner', ring_loc, 0.13, 0.13, 0.10, 'Hull dark plum', verts=14, rot=(math.radians(90), 0, 0), smooth=False)
    for st_i, st_ang in enumerate([0, math.pi/2, math.pi, 3*math.pi/2]):
        st_pos = (ring_loc[0] + math.cos(st_ang)*0.19, ring_loc[1], ring_loc[2] + math.sin(st_ang)*0.19)
        wrap = make_box(f'Life Ring Stripe {st_i}', st_pos, (0.07, 0.09, 0.07), 'Life ring cream', smooth=False)
        created.append(wrap)
    created.extend([ring_core, ring_hole])
    
    # H. Sales Counter & Hollow Woven Bamboo Fruit Basket on Bow Deck
    counter = make_box('Sales Counter', (0.75, -0.28, 0.68), (0.55, 0.40, 0.12), 'Trim golden yellow', smooth=False)
    created.append(counter)
    
    # Hollow flared basket (open cavity, NO solid top cap!)
    b_rad, b_h = 0.20, 0.14
    b_verts = [(0.75, -0.28, 0.75)]
    for i in range(12):
        a = i * math.tau / 12
        b_verts.append((0.75 + math.cos(a)*b_rad*0.75, -0.28 + math.sin(a)*b_rad*0.75, 0.75))
    for i in range(12):
        a = i * math.tau / 12
        b_verts.append((0.75 + math.cos(a)*b_rad, -0.28 + math.sin(a)*b_rad, 0.75 + b_h))
    b_faces = []
    for i in range(12):
        nxt = (i + 1) % 12
        b_faces.append((0, 1 + i, 1 + nxt))
        b_faces.append((1 + i, 1 + nxt, 13 + nxt, 13 + i))
    basket = make_custom_mesh('Counter Woven Basket', b_verts, b_faces, 'Woven wicker', smooth=False)
    created.append(basket)
    
    # Dragonfruits nestled naturally inside the hollow basket
    for d_i, (dx, dy, dz) in enumerate([(-0.05, -0.04, 0.81), (0.05, 0.04, 0.82), (0.0, -0.02, 0.89)]):
        df = make_icosphere(f'Basket Dragonfruit {d_i}', (0.75 + dx, -0.28 + dy, dz), 0.060, 'Dragonfruit magenta', subdiv=1, smooth=False)
        leaf = make_box(f'Dragonfruit Leaf {d_i}', (0.75 + dx, -0.28 + dy, dz + 0.06), (0.02, 0.015, 0.04), 'Dragonfruit leaf', smooth=False)
        created.extend([df, leaf])
        
    # I. Authentic Vietnamese "Cây Bẹo" at the Bow
    beo_base = (1.50, 0.22, 0.75)
    beo_pole = make_beam('Cay Beo Mast', beo_base, (1.60, 0.22, 2.45), 0.032, 'Bamboo gold', verts=8, smooth=False)
    beo_node = make_cylinder('Beo Node', (1.55, 0.22, 1.65), 0.038, 0.038, 0.03, 'Hull dark plum', verts=8, smooth=False)
    created.extend([beo_pole, beo_node])
    
    # Suspended Pineapple on Cây Bẹo
    c1 = (1.48, 0.12, 1.95)
    cord1 = make_beam('Beo Cord 1', (1.60, 0.22, 2.40), c1, 0.008, 'Produce cord', verts=6)
    pine_body = make_icosphere('Beo Pineapple', (c1[0], c1[1], c1[2] - 0.12), 0.10, 'Banana yellow', subdiv=1, smooth=False)
    pine_leaf = make_box('Pineapple Crown', (c1[0], c1[1], c1[2] - 0.02), (0.04, 0.04, 0.09), 'Dragonfruit leaf', smooth=False)
    created.extend([cord1, pine_body, pine_leaf])
    
    # Suspended Watermelon on Cây Bẹo
    c2 = (1.70, 0.32, 1.75)
    cord2 = make_beam('Beo Cord 2', (1.60, 0.22, 2.35), c2, 0.008, 'Produce cord', verts=6)
    melon = make_icosphere('Beo Watermelon', (c2[0], c2[1], c2[2] - 0.10), 0.09, 'Watermelon dark', subdiv=1, smooth=False)
    created.extend([cord2, melon])
    
    return created

# -----------------------------------------------------------------------------
# 3. Chibi Feline Characters (Both Faces 100% Camera-Visible!)
# -----------------------------------------------------------------------------
def build_chibi_cat(name, pos, scale=1.0, coat='Cat cream white', pose='roof_hero'):
    created = []
    x, y, z = pos
    s = scale
    
    # Round Chibi Head (smooth-shaded)
    head_z = z + 0.38 * s
    head = make_sphere(f'{name} | Head', (x, y, head_z), (0.28*s, 0.26*s, 0.26*s), coat, segs=16, rings=12, smooth=True)
    created.append(head)
    
    # Triangular Ears with Pink Inner Hollows
    for sign in [-1, 1]:
        ear_base = (x + sign * 0.16 * s, y, head_z + 0.18 * s)
        ear_outer = make_cylinder(f'{name} | Outer Ear', ear_base, 0.11*s, 0.01*s, 0.20*s, coat, verts=4, rot=(0, sign * math.radians(18), 0), smooth=False)
        ear_inner = make_cylinder(f'{name} | Inner Ear', (ear_base[0], ear_base[1] - 0.025*s, ear_base[2]), 0.07*s, 0.01*s, 0.14*s, 'Cat inner ear pink', verts=4, rot=(0, sign * math.radians(18), 0), smooth=False)
        created.extend([ear_outer, ear_inner])
        
    # Big Cute Eyes Looking Directly Forward (-Y into camera!)
    for sign in [-1, 1]:
        eye_x = x + sign * 0.10 * s
        eye_y = y - 0.22 * s
        eye_z = head_z - 0.01 * s
        eye = make_sphere(f'{name} | Eye', (eye_x, eye_y, eye_z), (0.038*s, 0.02*s, 0.045*s), 'Cat eye ink', segs=10, rings=8, smooth=True)
        sparkle = make_sphere(f'{name} | Sparkle', (eye_x - 0.01*s, eye_y - 0.015*s, eye_z + 0.014*s), (0.012*s, 0.008*s, 0.014*s), 'Cat eye sparkle', segs=6, rings=4, smooth=True)
        created.extend([eye, sparkle])
        
    # Pink Nose & Blushing Cheeks
    nose = make_sphere(f'{name} | Nose', (x, y - 0.25*s, head_z - 0.05*s), (0.028*s, 0.018*s, 0.022*s), 'Cat nose pink', segs=8, rings=6, smooth=True)
    created.append(nose)
    for sign in [-1, 1]:
        blush = make_sphere(f'{name} | Blush', (x + sign*0.16*s, y - 0.20*s, head_z - 0.06*s), (0.055*s, 0.015*s, 0.035*s), 'Cat cheek blush', segs=8, rings=6, smooth=True)
        created.append(blush)
        
    # Torso
    torso_z = z + 0.14 * s
    body = make_sphere(f'{name} | Body', (x, y, torso_z), (0.19*s, 0.17*s, 0.20*s), coat, segs=12, rings=10, smooth=True)
    created.append(body)
    
    # Coral Neckerchief
    scarf = make_cylinder(f'{name} | Neckerchief', (x, y - 0.05*s, torso_z + 0.14*s), 0.18*s, 0.16*s, 0.06*s, 'Neckerchief coral', verts=12, smooth=False)
    knot = make_sphere(f'{name} | Scarf Knot', (x, y - 0.17*s, torso_z + 0.12*s), (0.045*s, 0.03*s, 0.045*s), 'Neckerchief coral', segs=8, rings=6, smooth=True)
    created.extend([scarf, knot])
    
    # Paws & Props
    if pose == 'roof_hero':
        paw_l = make_sphere(f'{name} | Paw L', (x - 0.10*s, y - 0.12*s, z + 0.04*s), (0.05*s, 0.06*s, 0.04*s), coat, segs=8, rings=6, smooth=True)
        paw_r = make_sphere(f'{name} | Paw R', (x + 0.10*s, y - 0.12*s, z + 0.04*s), (0.05*s, 0.06*s, 0.04*s), coat, segs=8, rings=6, smooth=True)
        created.extend([paw_l, paw_r])
    elif pose == 'bow_companion':
        # Sitting on open bow-deck holding bamboo fishing rod out over the gunwale!
        paw_l = make_sphere(f'{name} | Paw L', (x - 0.08*s, y - 0.10*s, z + 0.08*s), (0.05*s, 0.06*s, 0.04*s), coat, segs=8, rings=6, smooth=True)
        paw_r = make_sphere(f'{name} | Paw R', (x + 0.12*s, y - 0.10*s, z + 0.12*s), (0.05*s, 0.06*s, 0.04*s), coat, segs=8, rings=6, smooth=True)
        # Fishing rod extending forward-left into water
        rod_start = (x + 0.10*s, y - 0.10*s, z + 0.12*s)
        rod_tip = (x + 0.15*s, y - 0.75*s, z - 0.05*s)
        rod = make_beam(f'{name} | Fishing Rod', rod_start, rod_tip, 0.015*s, 'Bamboo gold', verts=6)
        line = make_beam(f'{name} | Fishing Line', rod_tip, (rod_tip[0], rod_tip[1], -0.28), 0.005*s, 'Produce cord', verts=4)
        # Cute carrot bobbing lure in the water!
        lure = make_cylinder(f'{name} | Bobbing Lure', (rod_tip[0], rod_tip[1], -0.22), 0.035*s, 0.01*s, 0.12*s, 'Life ring orange', verts=8, rot=(math.radians(180), 0, 0))
        lure_leaf = make_box(f'{name} | Lure Leaf', (rod_tip[0], rod_tip[1], -0.16), (0.015*s, 0.04*s, 0.04*s), 'Water reed green')
        created.extend([paw_l, paw_r, rod, line, lure, lure_leaf])
        
    # Tail
    tail = make_cylinder(f'{name} | Tail', (x, y + 0.14*s, torso_z), 0.035*s, 0.02*s, 0.18*s, coat, verts=6, rot=(math.radians(-35), 0, 0), smooth=True)
    created.append(tail)
    
    return created

# -----------------------------------------------------------------------------
# 4. Camera & Crisp Graphic Lighting
# -----------------------------------------------------------------------------
def setup_lighting_and_cameras():
    scene = bpy.context.scene
    
    # 1. Solid Mauve / Purple Studio Background (#624B69)
    world = bpy.data.worlds.new('Mauve Studio Diorama Sky')
    scene.world = world
    world.use_nodes = True
    bg = next((n for n in world.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bg is None:
        bg = world.node_tree.nodes.new('ShaderNodeBackground')
        wo = world.node_tree.nodes.new('ShaderNodeOutputWorld')
        world.node_tree.links.new(bg.outputs['Background'], wo.inputs['Surface'])
        
    bg_rgb = srgb_to_linear('624B69')
    bg.inputs[0].default_value = (*bg_rgb, 1.0)
    bg.inputs[1].default_value = 0.95
    
    # 2. Lighting: Crisp Directional Sun with Graphic Shadows
    sun_data = bpy.data.lights.new('Crisp LowPoly Sun', 'SUN')
    sun_data.energy = 5.2
    sun_data.color = (1.0, 0.98, 0.95)
    sun_data.angle = math.radians(2)
    sun_obj = bpy.data.objects.new('Crisp LowPoly Sun', sun_data)
    CURRENT_COLLECTION.objects.link(sun_obj)
    sun_obj.location = (-6.0, -8.0, 12.0)
    sun_obj.rotation_euler = (math.radians(55), math.radians(15), math.radians(-35))
    
    # Soft Mauve Ambient Fill Light
    fill_data = bpy.data.lights.new('Mauve Fill Light', 'AREA')
    fill_data.energy = 450.0
    fill_data.size = 10.0
    fill_data.color = (0.85, 0.78, 0.92)
    fill_obj = bpy.data.objects.new('Mauve Fill Light', fill_data)
    CURRENT_COLLECTION.objects.link(fill_obj)
    fill_obj.location = (8.0, 6.0, 8.0)
    fill_obj.rotation_euler = (math.radians(45), math.radians(-30), math.radians(120))
    
    # 3. Cameras:
    # Camera A: Overall Diorama Camera (Orthographic Scale 7.6)
    cam_data = bpy.data.cameras.new('Overview Diorama Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 7.6
    cam_obj = bpy.data.objects.new('Overview Diorama Camera', cam_data)
    CURRENT_COLLECTION.objects.link(cam_obj)
    target = Vector((0.0, 0.0, 0.40))
    cam_obj.location = target + Vector((7.5, -9.8, 9.2))
    cam_obj.rotation_euler = (target - cam_obj.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam_obj
    
    # Camera B: Detail Shopkeeper & Boat Close-Up Camera (Orthographic Scale 4.2)
    close_data = bpy.data.cameras.new('Detail Shopkeeper Camera')
    close_data.type = 'ORTHO'
    close_data.ortho_scale = 4.2
    close_obj = bpy.data.objects.new('Detail Shopkeeper Camera', close_data)
    CURRENT_COLLECTION.objects.link(close_obj)
    close_target = Vector((0.25, -0.30, 0.95))
    close_obj.location = close_target + Vector((4.5, -6.0, 5.5))
    close_obj.rotation_euler = (close_target - close_obj.location).to_track_quat('-Z', 'Y').to_euler()
    
    # 4. Render Engine Configuration
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.film_transparent = False
    
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    
    return cam_obj, close_obj

# -----------------------------------------------------------------------------
# Main Assembly Execution
# -----------------------------------------------------------------------------
def main():
    print(">>> Starting VokabelGo Cat Island v03 Build (Refined Low-Poly Diorama)...", flush=True)
    
    # Group 00: Water Cutaway Diorama & Riverbed
    set_group('00 | Cutaway Water Diorama')
    build_cutaway_water_diorama()
    
    # Group 01: Compact Market Trawler Boat
    set_group('01 | Market Trawler Boat')
    boat_parts = build_compact_market_trawler()
    
    # Group 02: Chibi Feline Characters (Both Faces 100% Camera-Visible!)
    set_group('02 | Chibi Characters')
    # Hero Mochi standing proudly on the cabin roof looking directly at the viewer (-Y into camera!)
    mochi = build_chibi_cat('Mochi Hero', (-0.15, -0.05, 1.69), scale=1.12, coat='Cat cream white', pose='roof_hero')
    # Companion cat Pepper sitting on the open bow-deck at (1.05, -0.58, 0.65) with rail clearance,
    # blue-gray coat, holding bamboo fishing rod over the gunwale!
    pepper = build_chibi_cat('Pepper Bow', (1.05, -0.58, 0.65), scale=0.88, coat='Cat blue gray', pose='bow_companion')
    
    # Parent Boat Assembly with rotation_z = 0.0 (exact match to camera setup!)
    parent_group('MARKET BOAT | Assembly', boat_parts + mochi + pepper, location=(0.0, 0.0, 0.0), rotation_z=0.0)
    
    # Group 03: Lighting & Cameras
    set_group('03 | Lighting & Cameras')
    cam_overview, cam_detail = setup_lighting_and_cameras()
    
    # Save Blend File
    blend_path = OUT / 'cat-island-floating-market-v03.blend'
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print(f">>> Initial .blend saved to {blend_path}", flush=True)
    
    # Compute Statistics
    scene = bpy.context.scene
    mesh_objs = [o for o in scene.objects if o.type == 'MESH']
    poly_count = sum(len(o.data.polygons) for o in mesh_objs)
    stats = {
        'total_objects': len(scene.objects),
        'mesh_objects': len(mesh_objs),
        'base_mesh_polygons': poly_count,
        'blender_version': bpy.app.version_string,
        'blend_file': str(blend_path.name)
    }
    (OUT / 'scene-manifest-v03.json').write_text(json.dumps(stats, indent=2), encoding='utf-8')
    print(f">>> Scene Stats: {json.dumps(stats)}", flush=True)
    
    # Render 1: Overview Study
    overview_png = OUT / 'floating-market-style-study-v03.png'
    scene.camera = cam_overview
    scene.render.filepath = str(overview_png)
    print(f">>> Rendering Overview to {overview_png}...", flush=True)
    bpy.ops.render.render(write_still=True)
    
    # Render 2: Detail Study
    detail_png = OUT / 'floating-market-shopkeeper-detail-v03.png'
    scene.camera = cam_detail
    scene.render.filepath = str(detail_png)
    print(f">>> Rendering Detail to {detail_png}...", flush=True)
    bpy.ops.render.render(write_still=True)
    
    # Final Configuration for Interactive Reopening
    scene.camera = cam_overview
    scene.render.filepath = str(overview_png)
    for screen in bpy.data.screens:
        for ar in screen.areas:
            if ar.type == 'VIEW_3D':
                ar.spaces.active.region_3d.view_perspective = 'CAMERA'
                ar.spaces.active.shading.type = 'MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print(f">>> Final .blend saved cleanly to {blend_path}", flush=True)
    
    print(">>> All v03 Renders Complete Successfully!", flush=True)

if __name__ == '__main__':
    main()
