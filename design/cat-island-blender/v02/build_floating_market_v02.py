"""VokabelGo - Vietnamese Floating Cat Market (Chợ Nổi Đảo Mèo)
Original Blender 3D Art Study - Version 02 (Revision Pass).

Major Art Direction & Production Enhancements:
1. Composition & Framing:
   - Tightened camera framing to eliminate the vast empty water slab while preserving navigation lanes.
   - Main selling boat and Mochi are now the unmistakable hero of the composition.
   - Fixed all boat collisions; all vessels have dedicated open water clearance.
2. Character Cats:
   - Mochi (Owner): Enlarged (+18%), removed the flat face-obscuring hat, added a charming river-merchant
     bandana / neckerchief, fully sculpted chubby cheeks, expressive dark eyes with dual sparkling catchlights,
     and an active welcoming/serving pose holding a fresh fruit towards the customer.
   - Cinnamon (Customer 1): Authentic conical Nón Lá tilted back 45° so face, ears, and eyes are 100% visible.
     Active pose leaning over the gunwale with a coin in paw. Paddle stowed neatly inside the hull.
   - Pepper (Customer 2): Wears a jaunty straw boater hat; paddle stowed cleanly along the gunwale; cargo of glazed ceramic jars.
   - Lily (Customer 3): Calico cat relaxing near the island dock with a floral ear tuck, sipping fresh coconut water.
3. Market Merchandise & Authored Details:
   - Deep, bound bamboo baskets (Thúng Tre) brimming with dragonfruits, mangosteens, and citrus.
   - Hanging banana bunch and iconic Vietnamese Cây Bẹo display pole at the bow with suspended produce.
   - Traditional ceramic Vietnamese teapot and teacups on a bamboo tray; wrapped lotus-leaf parcels;
     wooden chalkboard produce sign with clean fruit doodle and price glyph.
4. Island & Learning Nook:
   - Re-sculpted Banana Palm (Cây chuối) with organic arching broad leaves and purple flower bud.
   - Stepped terracotta roof pavilion with brackets and glowing paper lantern.
   - Low study table with open Vietnamese vocabulary scroll, inkstone, and calligraphy brush.
   - Clustered daisy wildflowers, grass tufts, and river stones along the shoreline.
"""

import bpy
import math
import random
import json
from pathlib import Path
from mathutils import Vector, Euler

OUT = Path(__file__).resolve().parent
random.seed(108)

# -----------------------------------------------------------------------------
# Clean Scene
# -----------------------------------------------------------------------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for c in list(bpy.data.collections):
    if c.name != 'Collection':
        bpy.data.collections.remove(c)

# -----------------------------------------------------------------------------
# Color & Material Management (sRGB to Linear Conversion)
# -----------------------------------------------------------------------------
def srgb_to_linear(hex_str):
    h = hex_str.lstrip('#')
    srgb = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in srgb]

def create_material(name, hexcolor, roughness=0.55, metallic=0.0):
    rgb = srgb_to_linear(hexcolor)
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1.0)
    
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
            
    return m

# Tailored cozy palette for Southern Vietnamese Mekong river market
PALETTE = {
    # River Water & Shoreline
    'Water jade': ('28756F', 0.16, 0.0),
    'Water foam': ('C8EFE7', 0.35, 0.0),
    'Sand warm': ('DFCA9E', 0.85, 0.0),
    'River stone': ('827668', 0.70, 0.0),
    'Grass lush': ('589432', 0.75, 0.0),
    'Grass sunlit': ('85B53E', 0.75, 0.0),
    'Daisy petal': ('FFFDF8', 0.60, 0.0),
    'Daisy center': ('F2BD2B', 0.50, 0.0),
    
    # Woods, Bamboo & Carpentry
    'Wood teak': ('784124', 0.60, 0.0),
    'Wood teak dark': ('4D2715', 0.68, 0.0),
    'Wood honey': ('BE7E42', 0.58, 0.0),
    'Wood plank light': ('DCAC70', 0.62, 0.0),
    'Bamboo gold': ('DBAE52', 0.50, 0.0),
    'Bamboo green': ('739642', 0.58, 0.0),
    'Woven wicker': ('B8894A', 0.80, 0.0),
    'Woven rim dark': ('8A5E2E', 0.75, 0.0),
    'Rope jute': ('A5855A', 0.85, 0.0),
    
    # Boats & Canvas Architecture
    'Boat teal': ('29716E', 0.50, 0.0),
    'Boat cream': ('F5EAD4', 0.55, 0.0),
    'Boat vermilion': ('C6432F', 0.55, 0.0),
    'Boat navy': ('2B3848', 0.55, 0.0),
    'Awning coral': ('DD593F', 0.75, 0.0),
    'Awning cream': ('F9EFE0', 0.75, 0.0),
    'Terracotta roof': ('B75338', 0.68, 0.0),
    'Roof ridge': ('DC7958', 0.65, 0.0),
    
    # Tropical Mekong Produce & Goods
    'Dragonfruit magenta': ('D6265B', 0.40, 0.0),
    'Dragonfruit tip': ('75B530', 0.50, 0.0),
    'Banana yellow': ('F4C52A', 0.48, 0.0),
    'Pineapple amber': ('E4921A', 0.55, 0.0),
    'Watermelon dark': ('2F6229', 0.48, 0.0),
    'Watermelon flesh': ('DB3733', 0.42, 0.0),
    'Watermelon seed': ('1A1C1A', 0.20, 0.0),
    'Mangosteen purple': ('471E3C', 0.38, 0.0),
    'Coconut palm green': ('709236', 0.55, 0.0),
    'Citrus orange': ('EB741A', 0.45, 0.0),
    'Leaf stem': ('4E802C', 0.60, 0.0),
    'Lotus petal pink': ('F57C9B', 0.48, 0.0),
    'Lotus stamens gold': ('F5C432', 0.40, 0.0),
    'Lotus leaf emerald': ('386F3E', 0.55, 0.0),
    
    # Character Felines
    'Cat cream': ('F8EEDB', 0.62, 0.0),
    'Cat ginger tabby': ('D97734', 0.62, 0.0),
    'Cat blue gray': ('6B7B88', 0.62, 0.0),
    'Cat calico black': ('2D2B2C', 0.62, 0.0),
    'Cat white': ('FCF8F2', 0.60, 0.0),
    'Cat inner ear pink': ('EF8F8F', 0.55, 0.0),
    'Cat nose pink': ('DD6464', 0.40, 0.0),
    'Cat cheek blush': ('E87A7D', 0.70, 0.0),
    'Cat eye ink': ('181A1B', 0.08, 0.0),
    'Cat eye highlight': ('FFFFFF', 0.08, 0.0),
    'Apron jade': ('247A72', 0.72, 0.0),
    'Neckerchief coral': ('DD4F42', 0.70, 0.0),
    'Silk ribbon coral': ('DD4F42', 0.60, 0.0),
    'Non la leaf': ('DFCC9A', 0.75, 0.0),
    'Non la rim': ('BC9A60', 0.70, 0.0),
    
    # Artifacts & Accents
    'Ceramic teapot teal': ('38877E', 0.22, 0.0),
    'Ceramic terracotta': ('BA5635', 0.30, 0.0),
    'Ceramic white': ('F6F6F2', 0.22, 0.0),
    'Tea amber': ('BC7329', 0.18, 0.0),
    'Parchment paper': ('F4E7CE', 0.80, 0.0),
    'Ink dark': ('252522', 0.70, 0.0),
    'Lantern red': ('BD2E24', 0.60, 0.0),
    'Lantern glow gold': ('FCE57E', 0.25, 0.0),
    'Coin brass': ('D19D36', 0.25, 0.55)
}

MATS = {k: create_material(k, hex_c, rough, met) for k, (hex_c, rough, met) in PALETTE.items()}

# -----------------------------------------------------------------------------
# Collection & Object Hierarchy Utilities
# -----------------------------------------------------------------------------
CURRENT_COLLECTION = None

def set_group(name):
    global CURRENT_COLLECTION
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    CURRENT_COLLECTION = col
    return col

def assign_object(obj, name, mat_name=None):
    obj.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    CURRENT_COLLECTION.objects.link(obj)
    if mat_name and mat_name in MATS:
        obj.data.materials.clear()
        obj.data.materials.append(MATS[mat_name])
    return obj

def apply_bevel(obj, width=0.035, segments=2):
    mod = obj.modifiers.new('SoftBevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(35)
    wn = obj.modifiers.new('WeightedNormal', 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    return obj

def parent_group(name, objects, location=(0, 0, 0), rotation_z=0.0):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = 'PLAIN_AXES'
    empty.empty_display_size = 0.5
    CURRENT_COLLECTION.objects.link(empty)
    empty.location = location
    empty.rotation_euler.z = rotation_z
    for o in objects:
        o.parent = empty
    return empty

# -----------------------------------------------------------------------------
# Procedural Modeling Utilities
# -----------------------------------------------------------------------------
def make_box(name, loc, dim, mat, edge=0.03, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.object
    o.dimensions = dim
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_object(o, name, mat)
    if edge > 0.0:
        apply_bevel(o, edge)
    return o

def make_sphere(name, loc, scale, mat, segs=16, rings=12, rot=(0,0,0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = scale
    assign_object(o, name, mat)
    for p in o.data.polygons:
        p.use_smooth = True
    return o

def make_cylinder(name, loc, r1, r2, depth, mat, verts=16, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    assign_object(o, name, mat)
    for p in o.data.polygons:
        p.use_smooth = True
    return o

def make_beam(name, p1, p2, radius, mat, verts=12):
    p1, p2 = Vector(p1), Vector(p2)
    mid = (p1 + p2) * 0.5
    delta = p2 - p1
    length = delta.length
    if length < 1e-5:
        length = 0.001
    o = make_cylinder(name, mid, radius, radius, length, mat, verts=verts)
    o.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return o

def make_curve(name, points, thickness, mat):
    curve_data = bpy.data.curves.new(name, 'CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = thickness
    curve_data.bevel_resolution = 3
    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for p, co in zip(spline.bezier_points, points):
        p.co = Vector(co)
        p.handle_left_type = 'AUTO'
        p.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, curve_data)
    CURRENT_COLLECTION.objects.link(o)
    if mat in MATS:
        curve_data.materials.append(MATS[mat])
    return o

def make_custom_mesh(name, verts, faces, mat):
    mesh_data = bpy.data.meshes.new(name)
    mesh_data.from_pydata(verts, [], faces)
    mesh_data.update()
    o = bpy.data.objects.new(name, mesh_data)
    CURRENT_COLLECTION.objects.link(o)
    if mat in MATS:
        mesh_data.materials.append(MATS[mat])
    for p in mesh_data.polygons:
        p.use_smooth = True
    return o

# -----------------------------------------------------------------------------
# Authentic Vietnamese Ghe Tam Bản (Slender Wooden Riverboat)
# -----------------------------------------------------------------------------
def build_vietnamese_boat(name_prefix, length, width, depth, hull_mat='Wood teak', trim_mat='Boat teal', deck_mat='Wood honey'):
    created = []
    num_stations = 7
    station_xs = [-length*0.5 + i * (length / (num_stations - 1)) for i in range(num_stations)]
    
    verts = []
    faces = []
    profiles = []
    for i, x in enumerate(station_xs):
        t = abs(x) / (length * 0.5)
        is_bow = (x > 0)
        w_bot = width * 0.55 * (1.0 - t**1.6 * 0.85)
        w_top = width * (1.0 - t**1.8 * 0.65)
        z_bot = (t**2.0) * (depth * 0.45 if is_bow else depth * 0.35)
        z_top = depth * 0.85 + (t**2.0) * (depth * 0.45 if is_bow else depth * 0.35)
        profiles.append((w_bot, w_top, z_bot, z_top))
    
    for i, x in enumerate(station_xs):
        w_b, w_t, z_b, z_t = profiles[i]
        verts.append((x, -w_b * 0.5, z_b))
        verts.append((x,  w_b * 0.5, z_b))
        verts.append((x,  w_t * 0.5, z_t))
        verts.append((x, -w_t * 0.5, z_t))
        
    for i in range(num_stations - 1):
        i0 = i * 4
        i1 = (i + 1) * 4
        faces.append((i0+0, i0+1, i1+1, i1+0))
        faces.append((i0+1, i0+2, i1+2, i1+1))
        faces.append((i0+3, i0+0, i1+0, i1+3))
        
    faces.append((0, 3, 2, 1))
    last = (num_stations - 1) * 4
    faces.append((last+0, last+1, last+2, last+3))
    
    hull = make_custom_mesh(f'{name_prefix} | Hull', verts, faces, hull_mat)
    sol = hull.modifiers.new('HullThickness', 'SOLIDIFY')
    sol.thickness = 0.05
    sol.offset = 1.0
    apply_bevel(hull, width=0.025, segments=2)
    created.append(hull)
    
    # Smooth beveled gunwale rails (Mạn ghe)
    left_top_pts = [(station_xs[i], -profiles[i][1]*0.5 - 0.02, profiles[i][3] + 0.02) for i in range(num_stations)]
    right_top_pts = [(station_xs[i], profiles[i][1]*0.5 + 0.02, profiles[i][3] + 0.02) for i in range(num_stations)]
    gw_l = make_curve(f'{name_prefix} | Gunwale L', left_top_pts, 0.045, trim_mat)
    gw_r = make_curve(f'{name_prefix} | Gunwale R', right_top_pts, 0.045, trim_mat)
    created.extend([gw_l, gw_r])
    
    # Bow & Stern Stem Posts
    bow_x, bow_z = station_xs[-1], profiles[-1][3]
    created.append(make_box(f'{name_prefix} | Bow Post', (bow_x + 0.04, 0, bow_z + 0.05), (0.10, 0.12, 0.22), 'Wood teak dark', 0.02))
    stern_x, stern_z = station_xs[0], profiles[0][3]
    created.append(make_box(f'{name_prefix} | Stern Post', (stern_x - 0.04, 0, stern_z + 0.04), (0.10, 0.14, 0.20), 'Wood teak dark', 0.02))
    
    # Traditional Vietnamese Boat Eyes ('Mắt ghe') on the bow
    for sign in [-1, 1]:
        eye_x = bow_x - length * 0.07
        eye_y = sign * (profiles[-2][1] * 0.5 + 0.04)
        eye_z = profiles[-2][3] - 0.15
        rot = (0, 0, math.radians(-15 * sign))
        eye_white = make_sphere(f'{name_prefix} | Eye Sclera', (eye_x, eye_y, eye_z), (0.07, 0.015, 0.055), 'Cat white', segs=12, rings=8, rot=rot)
        eye_pupil = make_sphere(f'{name_prefix} | Eye Pupil', (eye_x + 0.01, eye_y + sign*0.008, eye_z), (0.035, 0.012, 0.035), 'Boat navy', segs=12, rings=8, rot=rot)
        created.extend([eye_white, eye_pupil])
        
    # Beveled internal floorboards
    plank_count = int(length * 3.0)
    deck_span = length * 0.72
    deck_start_x = -deck_span * 0.5
    for p in range(plank_count):
        px = deck_start_x + p * (deck_span / (plank_count - 1))
        t = abs(px) / (length * 0.5)
        plank_w = width * 0.72 * (1.0 - t**1.8 * 0.45)
        pz = depth * 0.28 + (t**2.0) * depth * 0.25
        p_mat = 'Wood honey' if p % 2 == 0 else 'Wood plank light'
        plank = make_box(f'{name_prefix} | Deck Plank', (px, 0, pz), (deck_span / plank_count * 0.90, plank_w, 0.05), p_mat, 0.012)
        created.append(plank)
        
    # Structural internal rib frames (Be xuồng)
    for rx in [-length*0.28, 0.0, length*0.28]:
        t = abs(rx) / (length * 0.5)
        rw = width * 0.78 * (1.0 - t**1.8 * 0.45)
        rz = depth * 0.42
        rib = make_box(f'{name_prefix} | Rib', (rx, 0, rz), (0.065, rw, 0.08), 'Wood teak dark', 0.015)
        created.append(rib)
        
    # Woven rope fender bumpers (Phao chống va)
    for side_sign in [-1, 1]:
        for bx in [-length*0.20, length*0.20]:
            t = abs(bx) / (length * 0.5)
            by = side_sign * (width * 0.50 * (1.0 - t**1.8 * 0.5) + 0.08)
            bz = depth * 0.55
            hang_top = (bx, by * 0.95, bz + 0.25)
            hang_bot = (bx, by, bz)
            created.append(make_beam(f'{name_prefix} | Bumper Rope', hang_top, hang_bot, 0.015, 'Rope jute'))
            cushion = make_sphere(f'{name_prefix} | Bumper', hang_bot, (0.09, 0.09, 0.12), 'Woven wicker', segs=12, rings=8)
            created.append(cushion)
            
    return created

# -----------------------------------------------------------------------------
# Chibi Vietnamese Feline Characters (Mochi, Cinnamon, Pepper, Lily)
# -----------------------------------------------------------------------------
def build_chibi_cat(name, pos, scale=1.0, coat='Cat cream', tabby_accent=None, apron=False, neckerchief=False, hat_mode=None, pose='stand'):
    """Builds a lovable, expressive chibi cat character with:
    - Chubby rounded cheeks and sculpted feline skull
    - Triangular sculpted ears with deep pink cavities and subtle fluff
    - Expressive dark glossy oval eyes with dual catchlights
    - Whiskers pads (muzzle), tiny triangular pink nose, sweet mouth line
    - Fully modeled neckerchief or apron
    - Posed arms and paws (welcoming, leaning, serving, holding props)
    - Curled fluffy tail
    - Authentic, well-fitted headwear (Nón Lá tilted back or straw boater)
    """
    created = []
    x, y, z = pos
    s = scale
    
    # --- Head & Cheeks ---
    head_z = z + 0.78 * s
    head = make_sphere(f'{name} | Head', (x, y, head_z), (0.32*s, 0.28*s, 0.29*s), coat, segs=18, rings=12)
    created.append(head)
    
    # Chubby cute cheeks
    for sign in [-1, 1]:
        cheek_coat = tabby_accent if (tabby_accent and sign == 1) else coat
        cheek = make_sphere(f'{name} | Cheek', (x + sign*0.18*s, y - 0.08*s, head_z - 0.06*s), (0.15*s, 0.14*s, 0.14*s), cheek_coat, segs=14, rings=10)
        blush = make_sphere(f'{name} | Blush', (x + sign*0.21*s, y - 0.18*s, head_z - 0.06*s), (0.065*s, 0.015*s, 0.04*s), 'Cat cheek blush', segs=10, rings=6)
        created.extend([cheek, blush])
        
    # Muzzle whisker pads
    for sign in [-1, 1]:
        snout = make_sphere(f'{name} | Muzzle Pad', (x + sign*0.055*s, y - 0.22*s, head_z - 0.08*s), (0.075*s, 0.065*s, 0.06*s), 'Cat white', segs=12, rings=8)
        created.append(snout)
        
    # Tiny pink nose
    nose = make_sphere(f'{name} | Nose', (x, y - 0.27*s, head_z - 0.04*s), (0.035*s, 0.025*s, 0.028*s), 'Cat nose pink', segs=10, rings=6)
    created.append(nose)
    
    # Expressive glossy eyes with dual catchlights
    for sign in [-1, 1]:
        eye_x = x + sign * 0.135 * s
        eye_y = y - 0.235 * s
        eye_z = head_z + 0.025 * s
        eye = make_sphere(f'{name} | Eye', (eye_x, eye_y, eye_z), (0.042*s, 0.025*s, 0.052*s), 'Cat eye ink', segs=14, rings=10)
        sparkle1 = make_sphere(f'{name} | Sparkle 1', (eye_x - 0.012*s, eye_y - 0.018*s, eye_z + 0.016*s), (0.013*s, 0.008*s, 0.015*s), 'Cat eye highlight', segs=8, rings=6)
        sparkle2 = make_sphere(f'{name} | Sparkle 2', (eye_x + 0.010*s, eye_y - 0.018*s, eye_z - 0.014*s), (0.007*s, 0.006*s, 0.008*s), 'Cat eye highlight', segs=8, rings=6)
        created.extend([eye, sparkle1, sparkle2])
        
    # Sculpted Feline Ears
    for sign in [-1, 1]:
        ear_coat = tabby_accent if (tabby_accent and sign == 1) else coat
        ear_base = (x + sign * 0.22 * s, y - 0.02 * s, head_z + 0.22 * s)
        ear = make_cylinder(f'{name} | Outer Ear', ear_base, 0.14*s, 0.015*s, 0.26*s, ear_coat, verts=5, rot=(0, sign * math.radians(22), 0))
        inner_ear = make_cylinder(f'{name} | Inner Ear', (ear_base[0], ear_base[1] - 0.03*s, ear_base[2]), 0.09*s, 0.01*s, 0.19*s, 'Cat inner ear pink', verts=4, rot=(0, sign * math.radians(22), 0))
        tuft = make_sphere(f'{name} | Ear Tuft', (ear_base[0], ear_base[1] - 0.04*s, ear_base[2] - 0.03*s), (0.04*s, 0.03*s, 0.03*s), 'Cat white', segs=8, rings=6)
        created.extend([ear, inner_ear, tuft])
        
    # Whiskers
    for sign in [-1, 1]:
        for w_offset in [-0.03, 0.02]:
            w_start = (x + sign * 0.19 * s, y - 0.20 * s, head_z - 0.08 * s + w_offset * s)
            w_end = (x + sign * 0.35 * s, y - 0.21 * s, head_z - 0.07 * s + w_offset * 1.5 * s)
            created.append(make_beam(f'{name} | Whisker', w_start, w_end, 0.006 * s, 'Wood teak dark'))
            
    # --- Body & Torso ---
    torso_z = z + 0.35 * s
    body = make_sphere(f'{name} | Torso', (x, y, torso_z), (0.26*s, 0.22*s, 0.32*s), coat, segs=16, rings=12)
    chest_bib = make_sphere(f'{name} | Chest Bib', (x, y - 0.14*s, torso_z + 0.06*s), (0.16*s, 0.06*s, 0.20*s), 'Cat white', segs=12, rings=8)
    created.extend([body, chest_bib])
    
    # Neckerchief (Khăn quàng cổ cho Mochi)
    if neckerchief:
        neck_y = y - 0.12 * s
        neck_z = torso_z + 0.26 * s
        scarf_band = make_cylinder(f'{name} | Neckerchief Band', (x, neck_y, neck_z), 0.22*s, 0.22*s, 0.08*s, 'Neckerchief coral', verts=16)
        scarf_knot = make_sphere(f'{name} | Neckerchief Knot', (x, neck_y - 0.10*s, neck_z - 0.04*s), (0.06*s, 0.04*s, 0.06*s), 'Neckerchief coral', segs=10, rings=8)
        scarf_tail = make_box(f'{name} | Neckerchief Tail', (x + 0.02*s, neck_y - 0.11*s, neck_z - 0.11*s), (0.07*s, 0.025*s, 0.10*s), 'Neckerchief coral', 0.015*s, rot=(0, 0, math.radians(15)))
        created.extend([scarf_band, scarf_knot, scarf_tail])
        
    # Apron
    if apron:
        apron_panel = make_box(f'{name} | Apron Panel', (x, y - 0.17*s, torso_z + 0.02*s), (0.28*s, 0.04*s, 0.28*s), 'Apron jade', 0.025*s)
        apron_pocket = make_box(f'{name} | Apron Pocket', (x, y - 0.195*s, torso_z - 0.04*s), (0.16*s, 0.025*s, 0.10*s), 'Wood honey', 0.015*s)
        tag = make_box(f'{name} | Recipe Tag', (x + 0.04*s, y - 0.205*s, torso_z + 0.02*s), (0.035*s, 0.015*s, 0.07*s), 'Parchment paper', 0.005*s, rot=(0, 0, math.radians(12)))
        tie_l = make_beam(f'{name} | Apron Strap L', (x - 0.10*s, y - 0.15*s, torso_z + 0.18*s), (x - 0.08*s, y + 0.08*s, head_z - 0.10*s), 0.012*s, 'Apron jade')
        tie_r = make_beam(f'{name} | Apron Strap R', (x + 0.10*s, y - 0.15*s, torso_z + 0.18*s), (x + 0.08*s, y + 0.08*s, head_z - 0.10*s), 0.012*s, 'Apron jade')
        bow = make_sphere(f'{name} | Apron Bow', (x, y + 0.21*s, torso_z - 0.02*s), (0.05*s, 0.03*s, 0.04*s), 'Apron jade', segs=8, rings=6)
        created.extend([apron_panel, apron_pocket, tag, tie_l, tie_r, bow])
        
    # --- Arms & Paws ---
    if pose == 'serving_fruit':
        # Active serving pose: Left paw rests on counter rim, right paw held forward presenting a fresh dragonfruit
        arm_l = make_beam(f'{name} | Arm L', (x - 0.18*s, y, torso_z + 0.12*s), (x - 0.16*s, y - 0.28*s, torso_z + 0.10*s), 0.055*s, coat)
        paw_l = make_sphere(f'{name} | Paw L', (x - 0.16*s, y - 0.31*s, torso_z + 0.10*s), (0.07*s, 0.08*s, 0.055*s), 'Cat white', segs=10, rings=8)
        arm_r = make_beam(f'{name} | Arm R', (x + 0.18*s, y, torso_z + 0.12*s), (x + 0.22*s, y - 0.28*s, torso_z + 0.18*s), 0.055*s, coat)
        paw_r = make_sphere(f'{name} | Paw R', (x + 0.23*s, y - 0.31*s, torso_z + 0.20*s), (0.07*s, 0.08*s, 0.06*s), 'Cat white', segs=10, rings=8)
        # Small fruit held in right paw
        offering_fruit = make_sphere(f'{name} | Offered Fruit', (x + 0.23*s, y - 0.33*s, torso_z + 0.24*s), (0.055*s, 0.055*s, 0.07*s), 'Dragonfruit magenta', segs=10, rings=8)
        created.extend([arm_l, paw_l, arm_r, paw_r, offering_fruit])
    elif pose == 'reaching_coin':
        # Customer reaching forward with coin in paw
        arm_l = make_beam(f'{name} | Arm L', (x - 0.15*s, y, torso_z + 0.10*s), (x - 0.12*s, y - 0.28*s, torso_z + 0.08*s), 0.05*s, coat)
        paw_l = make_sphere(f'{name} | Paw L', (x - 0.12*s, y - 0.31*s, torso_z + 0.08*s), (0.065*s, 0.075*s, 0.05*s), 'Cat white', segs=10, rings=8)
        arm_r = make_beam(f'{name} | Arm R', (x + 0.15*s, y, torso_z + 0.10*s), (x + 0.22*s, y - 0.32*s, torso_z + 0.16*s), 0.05*s, coat)
        paw_r = make_sphere(f'{name} | Paw R', (x + 0.24*s, y - 0.35*s, torso_z + 0.18*s), (0.065*s, 0.075*s, 0.05*s), 'Cat white', segs=10, rings=8)
        # Brass river coin in paw
        coin = make_cylinder(f'{name} | Brass Coin', (x + 0.25*s, y - 0.38*s, torso_z + 0.20*s), 0.035*s, 0.035*s, 0.012*s, 'Coin brass', verts=12, rot=(math.radians(30), 0, math.radians(20)))
        created.extend([arm_l, paw_l, arm_r, paw_r, coin])
    elif pose == 'relaxing':
        # Resting paws on lap
        for sign in [-1, 1]:
            arm = make_beam(f'{name} | Arm', (x + sign*0.16*s, y, torso_z + 0.10*s), (x + sign*0.12*s, y - 0.18*s, torso_z - 0.02*s), 0.05*s, coat)
            paw = make_sphere(f'{name} | Paw', (x + sign*0.12*s, y - 0.21*s, torso_z - 0.04*s), (0.065*s, 0.07*s, 0.05*s), 'Cat white', segs=10, rings=8)
            created.extend([arm, paw])
    else:
        # Standard stand
        for sign in [-1, 1]:
            arm = make_beam(f'{name} | Arm', (x + sign*0.17*s, y, torso_z + 0.10*s), (x + sign*0.14*s, y - 0.20*s, torso_z - 0.05*s), 0.05*s, coat)
            paw = make_sphere(f'{name} | Paw', (x + sign*0.14*s, y - 0.23*s, torso_z - 0.08*s), (0.065*s, 0.075*s, 0.05*s), 'Cat white', segs=10, rings=8)
            created.extend([arm, paw])
            
    # Tail (fluffy curved S-tail curling upward)
    tail_pts = [
        (x, y + 0.18 * s, torso_z - 0.15 * s),
        (x + 0.18 * s, y + 0.28 * s, torso_z - 0.05 * s),
        (x + 0.24 * s, y + 0.24 * s, torso_z + 0.18 * s),
        (x + 0.16 * s, y + 0.18 * s, torso_z + 0.28 * s)
    ]
    tail = make_curve(f'{name} | Curled Tail', tail_pts, 0.045 * s, tabby_accent or coat)
    created.append(tail)
    
    # Headwear Options
    if hat_mode == 'non_la_tilted_back':
        # Truly conical Nón Lá, gracefully tilted back at 45 degrees behind the ears
        # so the entire face, eyes, and ears remain 100% visible and un-obscured!
        hat_z = head_z + 0.22 * s
        hat_y = y + 0.16 * s
        hat_cone = make_cylinder(f'{name} | Non La Cone', (x, hat_y, hat_z), 0.36*s, 0.015*s, 0.24*s, 'Non la leaf', verts=20, rot=(math.radians(45), 0, 0))
        hat_rim = make_cylinder(f'{name} | Non La Rim', (x, hat_y + 0.08*s, hat_z - 0.08*s), 0.38*s, 0.38*s, 0.02*s, 'Non la rim', verts=20, rot=(math.radians(45), 0, 0))
        ribbon_l = make_beam(f'{name} | Hat Ribbon L', (x - 0.18*s, hat_y, hat_z), (x - 0.08*s, y - 0.12*s, head_z - 0.14*s), 0.010*s, 'Silk ribbon coral')
        ribbon_r = make_beam(f'{name} | Hat Ribbon R', (x + 0.18*s, hat_y, hat_z), (x + 0.08*s, y - 0.12*s, head_z - 0.14*s), 0.010*s, 'Silk ribbon coral')
        created.extend([hat_cone, hat_rim, ribbon_l, ribbon_r])
    elif hat_mode == 'straw_boater':
        # Jaunty flat-topped straw boater hat with navy ribbon band
        boater_z = head_z + 0.26 * s
        crown = make_cylinder(f'{name} | Boater Crown', (x, y - 0.02*s, boater_z), 0.15*s, 0.15*s, 0.09*s, 'Non la leaf', verts=16, rot=(math.radians(-10), 0, 0))
        brim = make_cylinder(f'{name} | Boater Brim', (x, y - 0.02*s, boater_z - 0.04*s), 0.24*s, 0.24*s, 0.018*s, 'Non la rim', verts=16, rot=(math.radians(-10), 0, 0))
        band = make_cylinder(f'{name} | Boater Band', (x, y - 0.02*s, boater_z - 0.01*s), 0.155*s, 0.155*s, 0.03*s, 'Boat navy', verts=16, rot=(math.radians(-10), 0, 0))
        created.extend([crown, brim, band])
    elif hat_mode == 'flower_tuck':
        # Sweet tropical blossom tucked behind ear
        blossom = make_sphere(f'{name} | Ear Blossom', (x - 0.24*s, y - 0.06*s, head_z + 0.16*s), (0.05*s, 0.05*s, 0.04*s), 'Lotus petal pink', segs=8, rings=6)
        created.append(blossom)
        
    return created

# -----------------------------------------------------------------------------
# Deep Woven Bamboo Baskets (Thúng Tre) & Tropical Fruit Clusters
# -----------------------------------------------------------------------------
def build_woven_basket(name, loc, radius=0.32, height=0.20):
    """Authentic open hollow woven bamboo basket (Thúng Tre / Mẹt).
    - Open hollow flared basket mesh (NO solid top cap disk)
    - Solidify modifier giving real bamboo wall thickness
    - Annular bamboo top rim ring
    - Middle cane reinforcing hoop
    """
    created = []
    x, y, z = loc
    num_verts = 18
    r_bot = radius * 0.76
    r_top = radius
    
    verts = []
    faces = []
    
    # Bottom floor center vertex
    verts.append((x, y, z + 0.02)) # index 0
    # Bottom perimeter ring
    for i in range(num_verts):
        ang = i * math.tau / num_verts
        verts.append((x + math.cos(ang) * r_bot, y + math.sin(ang) * r_bot, z + 0.02)) # 1 .. num_verts
        
    # Top rim perimeter ring (OPEN, no top disk!)
    for i in range(num_verts):
        ang = i * math.tau / num_verts
        verts.append((x + math.cos(ang) * r_top, y + math.sin(ang) * r_top, z + height)) # num_verts+1 .. 2*num_verts
        
    # Bottom disk floor (triangle fan)
    for i in range(num_verts):
        i_next = (i + 1) % num_verts
        faces.append((0, 1 + i, 1 + i_next))
        
    # Flared side walls (quads)
    for i in range(num_verts):
        i_next = (i + 1) % num_verts
        b1 = 1 + i
        b2 = 1 + i_next
        t1 = num_verts + 1 + i
        t2 = num_verts + 1 + i_next
        faces.append((b1, b2, t2, t1))
        
    basket = make_custom_mesh(f'{name} | Hollow Body', verts, faces, 'Woven wicker')
    sol = basket.modifiers.new('BasketWall', 'SOLIDIFY')
    sol.thickness = 0.022
    sol.offset = 1.0
    apply_bevel(basket, 0.015, segments=2)
    created.append(basket)
    
    # Annular top rim (curved bamboo ring)
    rim_pts = [(x + math.cos(i * math.tau / 24) * r_top, y + math.sin(i * math.tau / 24) * r_top, z + height) for i in range(25)]
    rim = make_curve(f'{name} | Top Rim Ring', rim_pts, 0.022, 'Woven rim dark')
    created.append(rim)
    
    # Mid-height reinforcing cane hoop
    r_mid = (r_bot + r_top) * 0.5 + 0.015
    mid_pts = [(x + math.cos(i * math.tau / 24) * r_mid, y + math.sin(i * math.tau / 24) * r_mid, z + height * 0.45) for i in range(25)]
    mid_hoop = make_curve(f'{name} | Mid Cane Hoop', mid_pts, 0.014, 'Bamboo gold')
    created.append(mid_hoop)
    
    return created

def build_dragonfruit_pile(name, loc, basket_height=0.16, count=4):
    """Fresh dragonfruits (Thanh Long) resting naturally inside the hollow basket cavity."""
    created = []
    x, y, z = loc
    # Fruits sit deep inside the hollow cavity and mound up over the rim
    offsets = [
        (-0.08, -0.06, 0.07),
        (0.08, -0.05, 0.07),
        (-0.01, 0.07, 0.07),
        (0.0, 0.01, 0.16)   # top mounded fruit
    ]
    for idx, (dx, dy, dz) in enumerate(offsets[:count]):
        fx, fy, fz = x + dx, y + dy, z + dz
        body = make_sphere(f'{name} | Body {idx}', (fx, fy, fz), (0.085, 0.085, 0.12), 'Dragonfruit magenta', segs=12, rings=8)
        created.append(body)
        for i in range(4):
            ang = i * math.tau / 4 + idx * 0.5
            tip_pos = (fx + math.cos(ang) * 0.045, fy + math.sin(ang) * 0.045, fz + 0.09)
            tip = make_box(f'{name} | Scale {idx}_{i}', tip_pos, (0.025, 0.015, 0.045), 'Dragonfruit tip', 0.008, rot=(0, math.radians(25), ang))
            created.append(tip)
    return created

def build_mangosteen_pile(name, loc, basket_height=0.15, count=5):
    """Royal purple mangosteens (Măng Cụt) resting inside the hollow basket cavity."""
    created = []
    x, y, z = loc
    offsets = [
        (-0.08, -0.07, 0.06),
        (0.08, -0.06, 0.06),
        (-0.07, 0.07, 0.06),
        (0.07, 0.06, 0.06),
        (0.0, 0.0, 0.14)   # top crowning fruit
    ]
    for idx, (dx, dy, dz) in enumerate(offsets[:count]):
        mx, my, mz = x + dx, y + dy, z + dz
        fruit = make_sphere(f'{name} | Mangosteen {idx}', (mx, my, mz), (0.065, 0.065, 0.060), 'Mangosteen purple', segs=12, rings=8)
        calyx = make_cylinder(f'{name} | Calyx {idx}', (mx, my, mz + 0.055), 0.04, 0.01, 0.018, 'Grass sunlit', verts=6)
        created.extend([fruit, calyx])
    return created

def build_citrus_pile(name, loc, basket_height=0.10, count=5):
    """Plump golden oranges/tangerines (Cam / Quýt) resting inside the hollow woven tray."""
    created = []
    x, y, z = loc
    offsets = [
        (-0.07, -0.06, 0.05),
        (0.08, -0.04, 0.05),
        (0.0, 0.07, 0.05),
        (-0.03, 0.0, 0.11),
        (0.06, 0.03, 0.11)
    ]
    for idx, (dx, dy, dz) in enumerate(offsets[:count]):
        cx, cy, cz = x + dx, y + dy, z + dz
        orange = make_sphere(f'{name} | Orange {idx}', (cx, cy, cz), (0.065, 0.065, 0.065), 'Citrus orange', segs=12, rings=8)
        stem = make_cylinder(f'{name} | Stem {idx}', (cx, cy, cz + 0.065), 0.008, 0.008, 0.025, 'Leaf stem', verts=6)
        leaf = make_box(f'{name} | Leaf {idx}', (cx + 0.02, cy, cz + 0.07), (0.035, 0.018, 0.006), 'Grass sunlit', 0.003, rot=(0, math.radians(20), 0))
        created.extend([orange, stem, leaf])
    return created

def build_banana_hanging_bunch(name, loc):
    """Large hanging cluster of yellow Mekong bananas (Nải chuối)."""
    created = []
    x, y, z = loc
    stalk = make_cylinder(f'{name} | Stalk', (x, y, z), 0.035, 0.035, 0.22, 'Bamboo green', verts=8, rot=(0, math.radians(90), 0))
    created.append(stalk)
    for row in range(2):
        rz = z - row * 0.08
        for i in range(4):
            ang = (i - 1.5) * 0.4
            bx = x + math.sin(ang) * 0.16
            by = y - 0.12 - row * 0.06
            bz = rz - math.cos(ang) * 0.06
            pts = [(x + math.sin(ang)*0.04, y, rz), (bx, by - 0.06, bz + 0.03), (bx * 1.08, by - 0.16, bz - 0.04)]
            banana = make_curve(f'{name} | Banana {row}_{i}', pts, 0.028, 'Banana yellow')
            created.append(banana)
    return created

def build_authentic_cay_beo(name, base_pos, height=3.3):
    """Iconic Vietnamese 'Cây Bẹo' display pole mounted firmly at the bow."""
    created = []
    x, y, z = base_pos
    pole_pts = [
        (x, y, z),
        (x + 0.04, y, z + height * 0.4),
        (x + 0.12, y, z + height * 0.75),
        (x + 0.22, y, z + height)
    ]
    pole = make_curve(f'{name} | Bamboo Mast', pole_pts, 0.040, 'Bamboo gold')
    created.append(pole)
    
    for h in [0.7, 1.4, 2.1, 2.8]:
        node = make_cylinder(f'{name} | Node', (x + 0.07 * (h/height), y, z + h), 0.046, 0.046, 0.025, 'Wood teak', verts=10)
        created.append(node)
        
    tip = pole_pts[-1]
    
    # Suspended samples: Pineapple, Bananas, Watermelon
    # 1. Hanging Pineapple
    c1 = (tip[0] - 0.12, tip[1] - 0.10, tip[2] - 0.55)
    created.append(make_beam(f'{name} | Cord Pineapple', tip, c1, 0.009, 'Rope jute'))
    p_body = make_sphere(f'{name} | Pineapple Body', (c1[0], c1[1], c1[2] - 0.14), (0.12, 0.12, 0.17), 'Pineapple amber', segs=12, rings=8)
    created.append(p_body)
    for i in range(6):
        a = i * math.tau / 6
        leaf = make_box(f'{name} | Pineapple Leaf', (c1[0] + math.cos(a)*0.04, c1[1] + math.sin(a)*0.04, c1[2] + 0.05), (0.03, 0.015, 0.10), 'Grass lush', 0.005, rot=(0, math.radians(25), a))
        created.append(leaf)
        
    # 2. Hanging Bananas
    c2 = (tip[0] + 0.08, tip[1] + 0.08, tip[2] - 0.65)
    created.append(make_beam(f'{name} | Cord Bananas', tip, c2, 0.009, 'Rope jute'))
    for b_idx in range(4):
        ang = (b_idx - 1.5) * 0.35
        b_pts = [(c2[0], c2[1], c2[2]), (c2[0] + math.sin(ang)*0.10, c2[1] - 0.10, c2[2] - 0.10), (c2[0] + math.sin(ang)*0.12, c2[1] - 0.18, c2[2] - 0.18)]
        created.append(make_curve(f'{name} | Bẹo Banana {b_idx}', b_pts, 0.024, 'Banana yellow'))
        
    # 3. Hanging Watermelon
    c3 = (tip[0] - 0.04, tip[1] + 0.12, tip[2] - 0.88)
    created.append(make_beam(f'{name} | Cord Watermelon', tip, c3, 0.009, 'Rope jute'))
    melon = make_sphere(f'{name} | Bẹo Melon', (c3[0], c3[1], c3[2] - 0.14), (0.13, 0.14, 0.13), 'Watermelon dark', segs=12, rings=8)
    created.append(melon)
    
    return created

# -----------------------------------------------------------------------------
# Authored Narrative Props: Tea Service, Menu Sign, Recipe Book
# -----------------------------------------------------------------------------
def build_vietnamese_tea_service(name, loc):
    """Traditional Vietnamese glazed teapot, cups, and bamboo tray."""
    created = []
    x, y, z = loc
    tray = make_box(f'{name} | Tray', (x, y, z + 0.015), (0.42, 0.28, 0.03), 'Wood honey', 0.015)
    pot_body = make_sphere(f'{name} | Pot Body', (x - 0.08, y, z + 0.11), (0.08, 0.08, 0.075), 'Ceramic teapot teal', segs=12, rings=8)
    pot_lid = make_cylinder(f'{name} | Pot Lid', (x - 0.08, y, z + 0.18), 0.05, 0.03, 0.035, 'Ceramic terracotta', verts=10)
    pot_spout = make_cylinder(f'{name} | Spout', (x - 0.17, y, z + 0.13), 0.024, 0.012, 0.08, 'Ceramic teapot teal', verts=8, rot=(0, math.radians(-40), 0))
    pot_handle = make_curve(f'{name} | Handle', [(x - 0.08, y, z + 0.19), (x - 0.08, y, z + 0.28), (x + 0.02, y, z + 0.19)], 0.009, 'Bamboo gold')
    created.extend([tray, pot_body, pot_lid, pot_spout, pot_handle])
    
    for i, cy in enumerate([-0.06, 0.06]):
        cup = make_cylinder(f'{name} | Cup {i}', (x + 0.10, y + cy, z + 0.06), 0.035, 0.042, 0.055, 'Ceramic white', verts=10)
        tea = make_cylinder(f'{name} | Tea {i}', (x + 0.10, y + cy, z + 0.075), 0.036, 0.036, 0.01, 'Tea amber', verts=8)
        created.extend([cup, tea])
        
    return created

def build_counter_produce_sign(name, loc):
    """Readable countertop product sign with wooden frame and chalk fruit icon."""
    created = []
    x, y, z = loc
    frame = make_box(f'{name} | Frame', (x, y, z + 0.14), (0.28, 0.04, 0.28), 'Wood teak', 0.015, rot=(math.radians(14), 0, 0))
    board = make_box(f'{name} | Board', (x, y - 0.012, z + 0.14), (0.24, 0.015, 0.24), 'Ink dark', 0.005, rot=(math.radians(14), 0, 0))
    # Chalk fruit illustration & "5K" coin icon
    fruit_doodle = make_sphere(f'{name} | Chalk Fruit', (x - 0.04, y - 0.022, z + 0.17), (0.035, 0.005, 0.035), 'Cat white', segs=8, rings=6, rot=(math.radians(14), 0, 0))
    price_badge = make_cylinder(f'{name} | Price Badge', (x + 0.05, y - 0.022, z + 0.12), 0.028, 0.028, 0.01, 'Coin brass', verts=10, rot=(math.radians(14), 0, 0))
    created.extend([frame, board, fruit_doodle, price_badge])
    return created

def build_wrapped_orders(name, loc):
    """Wrapped fresh produce parcels tied with natural jute string."""
    created = []
    x, y, z = loc
    for i in range(2):
        ox = x + i * 0.22
        parcel = make_box(f'{name} | Leaf Wrap {i}', (ox, y, z + 0.06), (0.18, 0.16, 0.11), 'Lotus leaf emerald', 0.025)
        twine_x = make_box(f'{name} | Twine X {i}', (ox, y, z + 0.06), (0.185, 0.02, 0.115), 'Rope jute', 0.005)
        twine_y = make_box(f'{name} | Twine Y {i}', (ox, y, z + 0.06), (0.02, 0.165, 0.115), 'Rope jute', 0.005)
        knot = make_sphere(f'{name} | Knot {i}', (ox, y, z + 0.125), (0.025, 0.025, 0.02), 'Rope jute', segs=8, rings=6)
        created.extend([parcel, twine_x, twine_y, knot])
    return created

# -----------------------------------------------------------------------------
# Main Market Boat Assembly (Mochi's Hero Vessel)
# -----------------------------------------------------------------------------
def build_main_market_boat():
    objects = []
    
    # 1. Authentic Wooden Hull (6.2m length x 2.45m width x 0.88m depth)
    hull_parts = build_vietnamese_boat('Main Boat', 6.2, 2.45, 0.88, hull_mat='Wood teak', trim_mat='Boat teal', deck_mat='Wood honey')
    objects.extend(hull_parts)
    
    # 2. Main Sales Counter (Generous, beveled, positioned for clear character separation)
    counter_top = make_box('Counter Top', (0.25, -0.48, 0.72), (3.6, 0.52, 0.08), 'Wood plank light', 0.025)
    counter_front = make_box('Counter Front Slats', (0.25, -0.48, 0.44), (3.4, 0.44, 0.48), 'Wood honey', 0.02)
    objects.extend([counter_top, counter_front])
    
    # 3. Mochi the Hero Merchant Cat
    # Enlarged scale (1.18x), lovable cream & ginger tabby, coral bandana neckerchief,
    # teal apron, active welcoming/serving pose holding a dragonfruit!
    mochi = build_chibi_cat('Mochi', (0.0, 0.06, 0.35), scale=1.18, coat='Cat cream', tabby_accent='Cat ginger tabby', apron=True, neckerchief=True, hat_mode=None, pose='serving_fruit')
    objects.extend(mochi)
    
    # 4. Rich, Distinct Merchandise Clusters on the Counter:
    # A. Basket of Dragonfruits
    b1 = build_woven_basket('Counter Basket Dragonfruit', (1.45, -0.45, 0.76), radius=0.28, height=0.16)
    d_pile = build_dragonfruit_pile('Counter Dragonfruits', (1.45, -0.45, 0.76), basket_height=0.16, count=4)
    objects.extend(b1 + d_pile)
    
    # B. Basket of Mangosteens
    b2 = build_woven_basket('Counter Basket Mangosteen', (0.85, -0.46, 0.76), radius=0.25, height=0.15)
    m_pile = build_mangosteen_pile('Counter Mangosteens', (0.85, -0.46, 0.76), basket_height=0.15, count=5)
    objects.extend(b2 + m_pile)
    
    # C. Woven Tray of Golden Citrus / Oranges
    b3 = build_woven_basket('Counter Tray Citrus', (0.25, -0.46, 0.76), radius=0.23, height=0.10)
    c_pile = build_citrus_pile('Counter Citrus', (0.25, -0.46, 0.76), basket_height=0.10, count=5)
    objects.extend(b3 + c_pile)
    
    # D. Narrative Props on Counter:
    # Open Vietnamese guest recipe book on slanted stand
    stand = make_box('Recipe Book Stand', (-0.45, -0.46, 0.80), (0.34, 0.26, 0.06), 'Wood teak dark', 0.015, rot=(math.radians(15), 0, 0))
    p1 = make_box('Book Page L', (-0.54, -0.46, 0.85), (0.15, 0.22, 0.015), 'Parchment paper', 0.005, rot=(math.radians(15), math.radians(-5), 0))
    p2 = make_box('Book Page R', (-0.36, -0.46, 0.85), (0.15, 0.22, 0.015), 'Parchment paper', 0.005, rot=(math.radians(15), math.radians(5), 0))
    objects.extend([stand, p1, p2])
    
    # Wrapped Takeout Orders
    objects.extend(build_wrapped_orders('Counter Orders', (-1.05, -0.46, 0.76)))
    
    # Countertop Produce Blackboard Sign
    objects.extend(build_counter_produce_sign('Market Produce Board', (1.92, -0.44, 0.76)))
    
    # Traditional Tea Service on the Stern Bench
    objects.extend(build_vietnamese_tea_service('Stern Tea Service', (-2.10, 0.0, 0.52)))
    
    # Rear Cargo: Wooden crate with whole and cut watermelon
    crate_w = make_box('Stern Fruit Crate', (-1.55, 0.50, 0.54), (0.68, 0.56, 0.32), 'Wood honey', 0.02)
    melon_whole = make_sphere('Stern Melon Whole', (-1.55, 0.50, 0.78), (0.14, 0.15, 0.14), 'Watermelon dark', segs=12, rings=8)
    melon_slice = make_cylinder('Stern Melon Slice', (-1.95, 0.50, 0.60), 0.14, 0.14, 0.06, 'Watermelon flesh', verts=12, rot=(math.radians(90), 0, 0))
    objects.extend([crate_w, melon_whole, melon_slice])
    
    # 5. The Iconic Cây Bẹo at the Bow
    objects.extend(build_authentic_cay_beo('Market Cay Beo', (2.55, 0.20, 0.45), height=3.3))
    
    # 6. Gracefully Arched Striped Cloth Canopy (Mái che cong vòm)
    # Supported by bamboo posts, tilted to keep Mochi and the counter completely visible!
    posts = [(-1.5, 0.65), (1.5, 0.65), (-1.5, -0.15), (1.5, -0.15)]
    for idx, (px, py) in enumerate(posts):
        objects.append(make_cylinder(f'Awning Bamboo Post {idx}', (px, py, 1.70), 0.04, 0.04, 2.10, 'Bamboo gold', verts=10))
        
    awning_span_x = 3.6
    awning_start_x = -awning_span_x * 0.5
    num_stripes = 12
    stripe_w = awning_span_x / num_stripes
    for s_idx in range(num_stripes):
        sx = awning_start_x + s_idx * stripe_w
        s_mat = 'Awning coral' if s_idx % 2 == 0 else 'Awning cream'
        verts = [
            (sx,            -0.25, 2.50),
            (sx + stripe_w, -0.25, 2.50),
            (sx + stripe_w,  0.30, 2.82),
            (sx,             0.30, 2.82),
            (sx + stripe_w,  0.85, 2.55),
            (sx,             0.85, 2.55)
        ]
        faces = [(0, 1, 2, 3), (3, 2, 4, 5)]
        stripe = make_custom_mesh(f'Awning Stripe {s_idx}', verts, faces, s_mat)
        sol = stripe.modifiers.new('CanopyThick', 'SOLIDIFY')
        sol.thickness = 0.025
        objects.append(stripe)
        fringe = make_sphere(f'Awning Fringe {s_idx}', (sx + stripe_w * 0.5, -0.25, 2.47), (stripe_w * 0.55, 0.03, 0.05), s_mat, segs=8, rings=6)
        objects.append(fringe)
        
    # Hanging bunch of bananas under the awning ridge
    objects.extend(build_banana_hanging_bunch('Awning Hanging Bananas', (0.9, -0.10, 2.40)))
    
    # Colorful pennant bunting flags strung along the front awning beam
    for b_idx in range(7):
        bx = -1.4 + b_idx * 0.46
        b_mat = 'Boat teal' if b_idx % 2 == 0 else 'Awning coral'
        tri_v = [(bx, -0.26, 2.49), (bx + 0.30, -0.26, 2.49), (bx + 0.15, -0.26, 2.28)]
        objects.append(make_custom_mesh(f'Bunting Flag {b_idx}', tri_v, [(0, 1, 2)], b_mat))
        
    return objects

# -----------------------------------------------------------------------------
# Customer Boats & Visitor Cats (Unique Identities & Clean Water Clearance)
# -----------------------------------------------------------------------------
def build_customer_boats():
    assemblies = []
    
    # ---------------------------------------------------------
    # Customer 1: "Cinnamon" (Active Ginger Tabby Buyer on Left)
    # Clear water clearance; Nón Lá tilted back 45°; paddle stowed inside
    # ---------------------------------------------------------
    c1_objs = []
    c1_boat = build_vietnamese_boat('Cinnamon Sampan', 2.8, 1.25, 0.65, hull_mat='Wood honey', trim_mat='Awning coral', deck_mat='Wood plank light')
    c1_objs.extend(c1_boat)
    
    c1_cat = build_chibi_cat('Cinnamon', (-0.25, 0.0, 0.28), scale=1.0, coat='Cat ginger tabby', tabby_accent='Cat cream', apron=False, neckerchief=False, hat_mode='non_la_tilted_back', pose='reaching_coin')
    c1_objs.extend(c1_cat)
    
    cushion1 = make_box('Cinnamon Cushion', (-0.25, 0.0, 0.32), (0.55, 0.55, 0.12), 'Awning coral', 0.035)
    c1_objs.append(cushion1)
    
    # Cargo: Basket of fresh lotus flowers
    c1_objs.extend(build_woven_basket('Cinnamon Lotus Basket', (0.55, 0.0, 0.28), radius=0.22, height=0.14))
    for blossom_i, (bx, by) in enumerate([(-0.06, -0.05), (0.05, 0.04), (0.0, -0.02)]):
        petal = make_sphere(f'Cargo Blossom {blossom_i}', (0.55 + bx, by, 0.40), (0.07, 0.07, 0.06), 'Lotus petal pink', segs=8, rings=6)
        c1_objs.append(petal)
        
    # Paddle STOWED CLEANLY inside the hull along the floor/ribs (NO collision!)
    oar_shaft = make_beam('Cinnamon Oar Shaft Stowed', (-0.60, 0.38, 0.36), (0.75, 0.38, 0.36), 0.020, 'Wood teak')
    oar_blade = make_box('Cinnamon Oar Blade Stowed', (0.85, 0.38, 0.36), (0.28, 0.10, 0.025), 'Wood plank light', 0.010)
    c1_objs.extend([oar_shaft, oar_blade])
    
    # Positioned with generous water lane: x = -3.85, y = -1.15
    parent1 = parent_group('CUSTOMER 1 | Cinnamon Assembly', c1_objs, location=(-3.85, -1.15, 0.02), rotation_z=math.radians(-24))
    assemblies.append(parent1)
    
    # ---------------------------------------------------------
    # Customer 2: "Pepper" (River Trader on Right)
    # Cool blue-gray coat, straw boater hat, cargo jars, paddle stowed cleanly
    # ---------------------------------------------------------
    c2_objs = []
    c2_boat = build_vietnamese_boat('Pepper Canoe', 3.0, 1.30, 0.68, hull_mat='Wood teak dark', trim_mat='Boat cream', deck_mat='Wood teak')
    c2_objs.extend(c2_boat)
    
    c2_cat = build_chibi_cat('Pepper', (-0.20, 0.0, 0.30), scale=1.0, coat='Cat blue gray', tabby_accent=None, apron=False, neckerchief=False, hat_mode='straw_boater', pose='relaxing')
    c2_objs.extend(c2_cat)
    
    # Cargo: Glazed ceramic jars (Chum sành)
    for j_idx, (jx, jy, jr, jh, j_mat) in enumerate([(0.65, -0.16, 0.15, 0.32, 'Ceramic terracotta'), (0.72, 0.18, 0.13, 0.26, 'Ceramic teapot teal')]):
        jar_body = make_sphere(f'Cargo Jar Body {j_idx}', (jx, jy, 0.32 + jh * 0.45), (jr, jr, jh * 0.45), j_mat, segs=12, rings=8)
        jar_rim = make_cylinder(f'Cargo Jar Rim {j_idx}', (jx, jy, 0.32 + jh * 0.90), jr * 0.7, jr * 0.7, 0.04, 'Wood honey', verts=10)
        c2_objs.extend([jar_body, jar_rim])
        
    # Paddle STOWED CLEANLY along the inside gunwale (NO collision!)
    paddle_shaft = make_beam('Pepper Paddle Stowed', (-0.70, -0.42, 0.38), (0.65, -0.42, 0.38), 0.020, 'Wood teak')
    paddle_blade = make_box('Pepper Blade Stowed', (-0.80, -0.42, 0.38), (0.26, 0.10, 0.025), 'Wood plank light', 0.010)
    c2_objs.extend([paddle_shaft, paddle_blade])
    
    parent2 = parent_group('CUSTOMER 2 | Pepper Assembly', c2_objs, location=(3.85, -1.35, 0.02), rotation_z=math.radians(26))
    assemblies.append(parent2)
    
    # ---------------------------------------------------------
    # Customer 3: "Lily" (Calico Cat visiting near the dock)
    # Flower tucked behind ear, sipping coconut water
    # ---------------------------------------------------------
    c3_objs = []
    c3_boat = build_vietnamese_boat('Lily Sampan', 2.6, 1.20, 0.62, hull_mat='Wood teak', trim_mat='Boat teal', deck_mat='Wood honey')
    c3_objs.extend(c3_boat)
    
    c3_cat = build_chibi_cat('Lily', (-0.15, 0.0, 0.26), scale=0.95, coat='Cat white', tabby_accent='Cat calico black', apron=False, neckerchief=False, hat_mode='flower_tuck', pose='relaxing')
    c3_objs.extend(c3_cat)
    
    # Fresh young drinking coconut with bamboo straw
    nut = make_cylinder('Lily Coconut', (0.16, -0.02, 0.34), 0.09, 0.07, 0.16, 'Coconut palm green', verts=10)
    top_shave = make_cylinder('Coconut Shave', (0.16, -0.02, 0.425), 0.065, 0.065, 0.02, 'Parchment paper', verts=8)
    straw = make_beam('Coconut Straw', (0.16, -0.02, 0.42), (0.20, -0.05, 0.56), 0.008, 'Awning coral')
    c3_objs.extend([nut, top_shave, straw])
    
    parent3 = parent_group('CUSTOMER 3 | Lily Assembly', c3_objs, location=(-2.4, 2.3, 0.02), rotation_z=math.radians(-10))
    assemblies.append(parent3)
    
    return assemblies

# -----------------------------------------------------------------------------
# Island, Learning Pavilion & Authentic Mekong Flora
# -----------------------------------------------------------------------------
def build_island_and_learning_nook():
    created = []
    island_center = (2.7, 3.7, 0.0)
    
    # 1. Stepped Riverbank Island Terrain
    sand_base = make_cylinder('Island Sand Base', (island_center[0], island_center[1], -0.02), 3.0, 2.8, 0.42, 'Sand warm', verts=20)
    grass_top = make_cylinder('Island Grass Plateau', (island_center[0], island_center[1], 0.22), 2.7, 2.6, 0.24, 'Grass lush', verts=20)
    created.extend([sand_base, grass_top])
    
    # Riverbank stones lining the water edge
    for i in range(8):
        ang = i * math.tau / 8 + 0.3
        sx = island_center[0] + math.cos(ang) * 2.8
        sy = island_center[1] + math.sin(ang) * 2.8
        stone = make_sphere(f'Riverbank Stone {i}', (sx, sy, 0.08), (0.22, 0.18, 0.15), 'River stone', segs=10, rings=8)
        created.append(stone)
        
    # Clustered Wild Daisies (White petals with golden center) along the grassy banks
    for d_idx, (dx, dy) in enumerate([(-1.2, -0.8), (-0.8, -1.2), (1.1, -0.9), (0.6, -1.3), (-1.5, 0.4)]):
        fx = island_center[0] + dx
        fy = island_center[1] + dy
        center = make_sphere(f'Daisy Center {d_idx}', (fx, fy, 0.38), (0.04, 0.04, 0.03), 'Daisy center', segs=8, rings=6)
        created.append(center)
        for p_i in range(6):
            p_ang = p_i * math.tau / 6
            petal = make_sphere(f'Daisy Petal {d_idx}_{p_i}', (fx + math.cos(p_ang)*0.06, fy + math.sin(p_ang)*0.06, 0.37), (0.05, 0.03, 0.015), 'Daisy petal', segs=6, rings=4)
            created.append(petal)
            
    # 2. Wooden Dock connecting Island to the Market Waterway
    dock_length = 2.3
    dock_planks = 14
    for d_idx in range(dock_planks):
        dy = 1.35 + d_idx * (dock_length / dock_planks)
        dx = 1.45
        d_mat = 'Wood honey' if d_idx % 2 == 0 else 'Wood plank light'
        plank = make_box(f'Dock Plank {d_idx}', (dx, dy, 0.32), (1.30, 0.14, 0.08), d_mat, 0.02)
        created.append(plank)
        
    for px, py in [(0.80, 1.45), (2.10, 1.45), (0.80, 3.1), (2.10, 3.1)]:
        piling = make_cylinder('Dock Piling', (px, py, 0.30), 0.085, 0.085, 1.10, 'Wood teak dark', verts=10)
        cap = make_cylinder('Piling Cap', (px, py, 0.88), 0.10, 0.07, 0.08, 'Wood honey', verts=10)
        rope_wrap = make_cylinder('Piling Rope Wrap', (px, py, 0.72), 0.095, 0.095, 0.08, 'Rope jute', verts=10)
        created.extend([piling, cap, rope_wrap])
        
    # Coiled Mooring Rope on the dock front
    rope_coil = make_cylinder('Dock Mooring Coil', (1.85, 1.45, 0.38), 0.12, 0.12, 0.04, 'Rope jute', verts=14)
    created.append(rope_coil)
    
    # 3. Vietnamese Riverside Learning Pavilion (Vọng Lâu / Chòi Học Tập)
    pavilion_center = (3.1, 3.8, 0.34)
    deck_plat = make_box('Pavilion Platform', pavilion_center, (2.3, 1.8, 0.16), 'Wood honey', 0.035)
    created.append(deck_plat)
    
    # 4 Pillars with curved brackets
    pillar_offsets = [(-0.95, -0.70), (0.95, -0.70), (-0.95, 0.70), (0.95, 0.70)]
    for idx, (ox, oy) in enumerate(pillar_offsets):
        pillar = make_cylinder(f'Pavilion Pillar {idx}', (pavilion_center[0] + ox, pavilion_center[1] + oy, pavilion_center[2] + 1.05), 0.055, 0.055, 2.0, 'Wood teak dark', verts=10)
        bracket = make_box(f'Pillar Bracket {idx}', (pavilion_center[0] + ox * 0.9, pavilion_center[1] + oy * 0.9, pavilion_center[2] + 1.95), (0.16, 0.16, 0.10), 'Wood honey', 0.02)
        created.extend([pillar, bracket])
        
    # Terracotta Hip Roof with beveled ridge
    roof_z = pavilion_center[2] + 2.05
    roof_verts = [
        (pavilion_center[0] - 1.35, pavilion_center[1] - 1.10, roof_z),
        (pavilion_center[0] + 1.35, pavilion_center[1] - 1.10, roof_z),
        (pavilion_center[0] + 1.35, pavilion_center[1] + 1.10, roof_z),
        (pavilion_center[0] - 1.35, pavilion_center[1] + 1.10, roof_z),
        (pavilion_center[0] - 0.70, pavilion_center[1], roof_z + 0.65),
        (pavilion_center[0] + 0.70, pavilion_center[1], roof_z + 0.65)
    ]
    roof_faces = [(0, 1, 5, 4), (2, 3, 4, 5), (3, 0, 4), (1, 2, 5)]
    roof = make_custom_mesh('Pavilion Terracotta Roof', roof_verts, roof_faces, 'Terracotta roof')
    sol = roof.modifiers.new('RoofThick', 'SOLIDIFY')
    sol.thickness = 0.08
    apply_bevel(roof, 0.03, segments=2)
    created.append(roof)
    
    # Roof Ridge Cap Beam
    ridge_beam = make_box('Roof Ridge Cap', (pavilion_center[0], pavilion_center[1], roof_z + 0.70), (1.55, 0.12, 0.08), 'Roof ridge', 0.02)
    created.append(ridge_beam)
    
    # Hanging glowing Vietnamese paper lantern
    lantern_cord = make_beam('Lantern Cord', (pavilion_center[0], pavilion_center[1], roof_z + 0.5), (pavilion_center[0], pavilion_center[1], roof_z + 0.15), 0.008, 'Wood teak dark')
    lantern_body = make_sphere('Lantern Glow Body', (pavilion_center[0], pavilion_center[1], roof_z + 0.05), (0.12, 0.12, 0.16), 'Lantern red', segs=12, rings=8)
    lantern_tassel = make_beam('Lantern Tassel', (pavilion_center[0], pavilion_center[1], roof_z - 0.05), (pavilion_center[0], pavilion_center[1], roof_z - 0.20), 0.012, 'Lantern glow gold')
    created.extend([lantern_cord, lantern_body, lantern_tassel])
    
    # Low Study Desk with Open Vocabulary Scroll
    desk = make_box('Study Desk', (pavilion_center[0], pavilion_center[1] - 0.20, pavilion_center[2] + 0.38), (1.20, 0.65, 0.08), 'Wood plank light', 0.02)
    for leg_x in [-0.48, 0.48]:
        leg = make_box('Desk Leg', (pavilion_center[0] + leg_x, pavilion_center[1] - 0.20, pavilion_center[2] + 0.18), (0.09, 0.45, 0.30), 'Wood teak', 0.015)
        created.append(leg)
    created.append(desk)
    
    scroll_sheet = make_box('Scroll Sheet', (pavilion_center[0], pavilion_center[1] - 0.20, pavilion_center[2] + 0.44), (0.54, 0.28, 0.015), 'Parchment paper', 0.005)
    scroll_roll_l = make_cylinder('Scroll Roll L', (pavilion_center[0] - 0.28, pavilion_center[1] - 0.20, pavilion_center[2] + 0.45), 0.03, 0.03, 0.30, 'Parchment paper', verts=8, rot=(math.radians(90), 0, 0))
    scroll_roll_r = make_cylinder('Scroll Roll R', (pavilion_center[0] + 0.28, pavilion_center[1] - 0.20, pavilion_center[2] + 0.45), 0.03, 0.03, 0.30, 'Parchment paper', verts=8, rot=(math.radians(90), 0, 0))
    for stroke_i in range(3):
        stroke = make_box('Scroll Stroke', (pavilion_center[0] - 0.12 + stroke_i * 0.12, pavilion_center[1] - 0.20, pavilion_center[2] + 0.455), (0.06, 0.015, 0.005), 'Ink dark', 0.0)
        created.append(stroke)
    created.extend([scroll_sheet, scroll_roll_l, scroll_roll_r])
    
    inkpot = make_cylinder('Ceramic Inkpot', (pavilion_center[0] + 0.42, pavilion_center[1] - 0.12, pavilion_center[2] + 0.46), 0.04, 0.035, 0.07, 'Ink dark', verts=10)
    brush = make_beam('Calligraphy Brush', (pavilion_center[0] + 0.42, pavilion_center[1] - 0.25, pavilion_center[2] + 0.44), (pavilion_center[0] + 0.46, pavilion_center[1] - 0.08, pavilion_center[2] + 0.49), 0.008, 'Bamboo gold')
    created.extend([inkpot, brush])
    
    # 4. Authentic Vietnamese Banana Palm (Cây chuối cảnh):
    # Coherent, elegant curved stem with gracefully arching paddle-shaped leaves
    palm_x, palm_y, palm_z = 0.90, 4.2, 0.30
    trunk = make_cylinder('Banana Palm Trunk', (palm_x, palm_y, palm_z + 0.65), 0.12, 0.09, 1.3, 'Grass sunlit', verts=10)
    created.append(trunk)
    
    # 5 Arching Banana Leaves radiating outward naturally
    leaf_angles = [math.radians(a) for a in [30, 95, 170, 240, 310]]
    for l_idx, l_ang in enumerate(leaf_angles):
        # Arc points: base -> crest -> downward tip
        p_base = (palm_x, palm_y, palm_z + 1.25)
        p_crest = (palm_x + math.cos(l_ang) * 0.55, palm_y + math.sin(l_ang) * 0.55, palm_z + 1.55)
        p_tip = (palm_x + math.cos(l_ang) * 1.15, palm_y + math.sin(l_ang) * 1.15, palm_z + 1.10)
        leaf_rib = make_curve(f'Banana Rib {l_idx}', [p_base, p_crest, p_tip], 0.022, 'Grass sunlit')
        
        # Leaf broad blade centered at crest
        blade_pos = (palm_x + math.cos(l_ang) * 0.65, palm_y + math.sin(l_ang) * 0.65, palm_z + 1.40)
        blade = make_box(f'Banana Blade {l_idx}', blade_pos, (0.65, 0.28, 0.02), 'Grass lush', 0.010, rot=(math.radians(15), math.radians(20), l_ang))
        created.extend([leaf_rib, blade])
        
    # Purple banana flower blossom (Bắp chuối) hanging down
    flower_cord = make_beam('Banana Flower Cord', (palm_x + 0.25, palm_y - 0.05, palm_z + 1.2), (palm_x + 0.30, palm_y - 0.08, palm_z + 0.95), 0.014, 'Grass sunlit')
    flower_bud = make_sphere('Banana Flower Bud', (palm_x + 0.30, palm_y - 0.08, palm_z + 0.85), (0.09, 0.09, 0.16), 'Mangosteen purple', segs=10, rings=8)
    created.extend([flower_cord, flower_bud])
    
    # 5. Citrus Tree with multi-tiered organic foliage
    tree_x, tree_y, tree_z = 4.5, 4.4, 0.30
    tree_trunk = make_cylinder('Citrus Tree Trunk', (tree_x, tree_y, tree_z + 0.85), 0.15, 0.11, 1.7, 'Wood teak dark', verts=10)
    created.append(tree_trunk)
    canopy_clusters = [
        (0.0, 0.0, 1.85, 0.85, 'Grass lush'),
        (-0.40, -0.20, 2.05, 0.68, 'Grass sunlit'),
        (0.35, 0.20, 2.10, 0.65, 'Grass lush'),
        (0.0, 0.30, 2.35, 0.58, 'Grass sunlit')
    ]
    for c_idx, (cx, cy, cz, cr, c_mat) in enumerate(canopy_clusters):
        crown = make_sphere(f'Tree Canopy {c_idx}', (tree_x + cx, tree_y + cy, tree_z + cz), (cr, cr * 0.9, cr * 0.85), c_mat, segs=12, rings=8)
        created.append(crown)
        
    for o_idx, (ox, oy, oz) in enumerate([(-0.35, -0.30, 1.85), (0.22, -0.35, 1.95), (0.40, 0.10, 1.90), (-0.08, -0.40, 2.20)]):
        orange = make_sphere(f'Tree Orange {o_idx}', (tree_x + ox, tree_y + oy, tree_z + oz), (0.10, 0.10, 0.10), 'Citrus orange', segs=10, rings=8)
        created.append(orange)
        
    return created

# -----------------------------------------------------------------------------
# River Water, Gentle Wakes & Lotus Pads
# -----------------------------------------------------------------------------
def build_river_environment():
    created = []
    
    # 1. Warm Studio Base Floor
    studio_floor = make_box('Studio Floor', (0, 0, -0.85), (200, 200, 0.15), 'Sand warm', 0.0)
    created.append(studio_floor)
    
    # 2. Rich Jade River Base (Tightened to eliminate giant empty void while keeping breathing room)
    river_water = make_box('Jade River Water', (0.1, 0.4, -0.25), (14.2, 10.8, 0.55), 'Water jade', 0.35)
    created.append(river_water)
    
    # 3. Floating Lotus Flowers & Lily Pads (Hoa Sen & Lá Sen)
    lotus_locs = [
        (-4.0, 2.6), (-4.4, 1.8), (-3.2, 3.2),
        (4.4, 1.8), (4.8, 2.4), (4.2, 2.9),
        (-2.2, -2.8), (2.2, -2.8), (0.2, -3.2)
    ]
    for idx, (lx, ly) in enumerate(lotus_locs):
        r = random.uniform(0.24, 0.34)
        pad = make_cylinder(f'Lotus Pad {idx}', (lx, ly, 0.028), r, r, 0.018, 'Lotus leaf emerald', verts=14)
        created.append(pad)
        if idx in (0, 3, 6):
            fx, fy = lx + 0.05, ly + 0.05
            for petal_i in range(8):
                p_ang = petal_i * math.tau / 8
                px = fx + math.cos(p_ang) * 0.11
                py = fy + math.sin(p_ang) * 0.11
                petal = make_sphere(f'Lotus Petal {idx}_{petal_i}', (px, py, 0.095), (0.08, 0.045, 0.06), 'Lotus petal pink', segs=8, rings=6, rot=(math.radians(20), 0, p_ang))
                created.append(petal)
            center = make_sphere(f'Lotus Center {idx}', (fx, fy, 0.11), (0.05, 0.05, 0.04), 'Lotus stamens gold', segs=8, rings=6)
            created.append(center)
            
    # 4. Soft Water Wakes & Ripple Rings hugging the boat hulls
    for rx, ry, rw, rl, rot in [
        (-0.1, -1.2, 2.6, 5.8, math.radians(-6)),
        (-3.85, -1.15, 1.4, 2.9, math.radians(-24)),
        (3.85, -1.35, 1.4, 3.1, math.radians(26)),
        (-2.4, 2.3, 1.3, 2.7, math.radians(-10))
    ]:
        wake_ring = make_cylinder('Hull Wake Ring', (rx, ry, 0.016), rw * 0.52, rw * 0.52, 0.012, 'Water foam', verts=20, rot=(0, 0, rot))
        created.append(wake_ring)
        
    return created

# -----------------------------------------------------------------------------
# Camera Framing & Cinematic Cozy Lighting
# -----------------------------------------------------------------------------
def setup_lighting_and_cameras():
    scene = bpy.context.scene
    
    # 1. Warm Atmospheric World
    world = bpy.data.worlds.new('Warm Mekong Morning Sky')
    scene.world = world
    world.use_nodes = True
    bg = next((n for n in world.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bg is None:
        bg = world.node_tree.nodes.new('ShaderNodeBackground')
        wo = world.node_tree.nodes.new('ShaderNodeOutputWorld')
        world.node_tree.links.new(bg.outputs['Background'], wo.inputs['Surface'])
        
    bg.inputs[0].default_value = (0.80, 0.88, 0.89, 1.0)
    bg.inputs[1].default_value = 0.85
    
    # 2. Lighting Setup:
    # A. Key Sun Light (Warm golden morning sun casting soft crisp shadows)
    sun_data = bpy.data.lights.new('Warm Morning Sun', 'SUN')
    sun_data.energy = 4.4
    sun_data.color = (1.0, 0.92, 0.78)
    sun_data.angle = math.radians(12)
    sun_obj = bpy.data.objects.new('Warm Morning Sun', sun_data)
    CURRENT_COLLECTION.objects.link(sun_obj)
    sun_obj.location = (-6.0, -10.0, 14.0)
    sun_obj.rotation_euler = (math.radians(50), math.radians(18), math.radians(-34))
    
    # B. Soft Sky Fill Light
    fill_data = bpy.data.lights.new('Sky Blue Fill', 'AREA')
    fill_data.energy = 850.0
    fill_data.size = 11.0
    fill_data.color = (0.74, 0.88, 1.0)
    fill_obj = bpy.data.objects.new('Sky Blue Fill', fill_data)
    CURRENT_COLLECTION.objects.link(fill_obj)
    fill_obj.location = (8.0, 4.0, 10.0)
    fill_obj.rotation_euler = (math.radians(45), math.radians(-30), math.radians(120))
    
    # C. River Surface Bounce Light (Adds warm rim bounce to character silhouettes)
    rim_data = bpy.data.lights.new('River Bounce Rim', 'AREA')
    rim_data.energy = 420.0
    rim_data.size = 8.0
    rim_data.color = (0.85, 0.95, 0.88)
    rim_obj = bpy.data.objects.new('River Bounce Rim', rim_data)
    CURRENT_COLLECTION.objects.link(rim_obj)
    rim_obj.location = (0.0, -7.5, 1.5)
    rim_obj.rotation_euler = (math.radians(-70), 0, 0)
    
    # 3. Cameras:
    # Camera A: Tightened, Hero-Centric Overview Camera (Ortho scale 10.6 instead of 14.8)
    # The selling boat, Mochi, and customer boats now command the frame!
    cam_data = bpy.data.cameras.new('Isometric Market Overview Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 10.6
    cam_obj = bpy.data.objects.new('Isometric Market Overview Camera', cam_data)
    CURRENT_COLLECTION.objects.link(cam_obj)
    cam_target = Vector((0.05, -0.35, 0.70))
    cam_obj.location = cam_target + Vector((9.2, -13.0, 11.5))
    cam_obj.rotation_euler = (cam_target - cam_obj.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam_obj
    
    # Camera B: Shopkeeper Mochi & Counter Detail Camera (Ortho scale 5.4)
    # Tightly frames Mochi presenting fruit, the dragonfruit & mangosteen baskets, and Cinnamon's approach
    close_data = bpy.data.cameras.new('Shopkeeper Mochi Detail Camera')
    close_data.type = 'ORTHO'
    close_data.ortho_scale = 5.4
    close_obj = bpy.data.objects.new('Shopkeeper Mochi Detail Camera', close_data)
    CURRENT_COLLECTION.objects.link(close_obj)
    close_target = Vector((0.15, -0.60, 0.92))
    close_obj.location = close_target + Vector((5.2, -7.5, 6.4))
    close_obj.rotation_euler = (close_target - close_obj.location).to_track_quat('-Z', 'Y').to_euler()
    
    # 4. Render Engine & Settings
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.film_transparent = False
    
    # AgX Color Transform with Medium High Contrast
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    
    return cam_obj, close_obj

# -----------------------------------------------------------------------------
# Main Execution Entrypoint
# -----------------------------------------------------------------------------
def main():
    print(">>> Starting VokabelGo Cat Island v02 Build (Revision Pass)...", flush=True)
    
    # Group 00: River Environment & Water
    set_group('00 | River Environment')
    build_river_environment()
    
    # Group 01: Main Market Boat & Shopkeeper Mochi
    set_group('01 | Main Market Boat & Mochi')
    market_objs = build_main_market_boat()
    parent_group('MARKET | Main Flagship Assembly', market_objs, location=(-0.1, -1.2, 0.0), rotation_z=math.radians(-6))
    
    # Group 02: Customer Boats & Visitor Cats
    set_group('02 | Customer Boats & Cats')
    build_customer_boats()
    
    # Group 03: Island & Learning Pavilion
    set_group('03 | Island & Learning Pavilion')
    build_island_and_learning_nook()
    
    # Group 04: Cameras & Lighting
    set_group('04 | Cameras & Lighting')
    cam_overview, cam_detail = setup_lighting_and_cameras()
    
    # Save Blend File
    blend_path = OUT / 'cat-island-floating-market-v02.blend'
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print(f">>> Scene saved to {blend_path}", flush=True)
    
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
    (OUT / 'scene-manifest-v02.json').write_text(json.dumps(stats, indent=2), encoding='utf-8')
    print(f">>> Scene Stats: {json.dumps(stats)}", flush=True)
    
    # Render 1: Overview Study (Tightened, Heroic Framing)
    overview_png = OUT / 'floating-market-style-study-v02.png'
    scene.camera = cam_overview
    scene.render.filepath = str(overview_png)
    print(f">>> Rendering Overview to {overview_png}...", flush=True)
    bpy.ops.render.render(write_still=True)
    
    # Render 2: Detail Study (Shopkeeper Mochi & Counter)
    detail_png = OUT / 'floating-market-shopkeeper-detail-v02.png'
    scene.camera = cam_detail
    scene.render.filepath = str(detail_png)
    print(f">>> Rendering Detail to {detail_png}...", flush=True)
    bpy.ops.render.render(write_still=True)
    
    # Final configuration for interactive user session / reopening
    scene.camera = cam_overview
    scene.render.filepath = str(overview_png)
    for screen in bpy.data.screens:
        for ar in screen.areas:
            if ar.type == 'VIEW_3D':
                ar.spaces.active.region_3d.view_perspective = 'CAMERA'
                ar.spaces.active.shading.type = 'MATERIAL'
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print(f">>> Final .blend saved cleanly to {blend_path}", flush=True)
    
    print(">>> All v02 Revision Renders Complete Successfully!", flush=True)

if __name__ == '__main__':
    main()
