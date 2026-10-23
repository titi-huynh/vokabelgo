"""Core material palette and geometry helpers for Hero Market Boat v04."""
import bpy
import bmesh
import math
from mathutils import Vector, Euler, Matrix

PALETTE = {
    # Hull & Wood
    'HullNavy':        ('1F2D46', 0.58, 0.04),
    'HullNavyDeep':    ('162035', 0.65, 0.05),
    'HullStripeBlue':  ('2D4366', 0.52, 0.04),
    'TimberHoney':     ('D99543', 0.52, 0.02),
    'TimberWarm':      ('C27D32', 0.58, 0.02),
    'TimberDark':      ('8A5222', 0.64, 0.02),
    'DeckPlank':       ('C98A46', 0.62, 0.02),
    'DeckPlankAlt':    ('BA7B3A', 0.65, 0.02),
    'BambooPole':      ('CFA052', 0.50, 0.02),
    'BambooNode':      ('9E7132', 0.60, 0.02),
    # Cabin & Awning
    'CabinCoral':      ('E05A4E', 0.62, 0.01),
    'CabinCoralTrim':  ('C4453B', 0.58, 0.02),
    'CabinInterior':   ('593428', 0.78, 0.01),
    'RoofCream':       ('F5E9CE', 0.68, 0.01),
    'RoofSeam':        ('DECAA2', 0.72, 0.01),
    'AwningCloth':     ('F7EDD4', 0.76, 0.00),
    'AwningStripe':    ('E5D3AD', 0.78, 0.00),
    'SignBoard':       ('F6EAD0', 0.55, 0.01),
    'SignInk':         ('4A2C24', 0.45, 0.02),
    # Ropes, Fenders, Metal
    'RopeHemp':        ('C79C5E', 0.82, 0.00),
    'FenderRubber':    ('4A4A52', 0.72, 0.05),
    'IronCharcoal':    ('33353D', 0.48, 0.35),
    'BrassWarm':       ('D49B35', 0.32, 0.75),
    # Market Produce & Ceramics
    'CrateWood':       ('C88844', 0.68, 0.01),
    'WickerBasket':    ('B87C3C', 0.76, 0.01),
    'OrangeCitrus':    ('F27D24', 0.42, 0.00),
    'DragonMagenta':   ('E32E66', 0.46, 0.00),
    'LeafGreen':       ('569E3A', 0.54, 0.00),
    'LeafDark':        ('3B7528', 0.58, 0.00),
    'BananaYellow':    ('F5C42F', 0.45, 0.00),
    'CeramicWhite':    ('F7F6F0', 0.22, 0.02),
    'CeramicCobalt':   ('2C5AA0', 0.25, 0.02),
    'TeaLiquid':       ('9E5824', 0.18, 0.00),
    'PotTerracotta':   ('B85D3B', 0.68, 0.01),
    'KraftBag':        ('D8AE76', 0.74, 0.00),
    'LanternGold':     ('E9B859', 0.65, 0.00, 'FFB020', 0.45),
    'LanternRed':      ('D86A4F', 0.65, 0.00, 'E34A36', 0.25),
    # Shopkeeper Cat
    'CatCream':        ('FAF4E8', 0.65, 0.00),
    'CatApronTeal':    ('2E777D', 0.68, 0.01),
    'CatPink':         ('EB7A82', 0.52, 0.00),
    'CatEyeDark':      ('241A18', 0.15, 0.00),
    'CatOrangePatch':  ('E58B3C', 0.65, 0.00),
}

MATS = {}

def srgb_to_linear(hex_str):
    h = hex_str.lstrip('#')
    s = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in s]

def init_materials():
    MATS.clear()
    for name, spec in PALETTE.items():
        rgb = srgb_to_linear(spec[0])
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        m.diffuse_color = (*rgb, 1.0)
        bsdf = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf:
            bsdf.inputs['Base Color'].default_value = (*rgb, 1.0)
            bsdf.inputs['Roughness'].default_value = spec[1]
            bsdf.inputs['Metallic'].default_value = spec[2]
            if len(spec) >= 5:
                er = srgb_to_linear(spec[3])
                if 'Emission Color' in bsdf.inputs:
                    bsdf.inputs['Emission Color'].default_value = (*er, 1.0)
                if 'Emission Strength' in bsdf.inputs:
                    bsdf.inputs['Emission Strength'].default_value = spec[4]
        MATS[name] = m
    from boat_surface import install_surfaces, organic_materials
    install_surfaces(MATS,PALETTE)
    organic_materials(MATS)
    return MATS

def link_obj(obj, parent=None, col=None, mat=None, smooth=True):
    if col is None:
        col = bpy.context.scene.collection
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    if mat and mat in MATS and hasattr(obj.data, 'materials'):
        obj.data.materials.clear()
        obj.data.materials.append(MATS[mat])
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = smooth
    from boat_surface import ensure_uv
    ensure_uv(obj)
    return obj

def make_mesh(name, verts, faces, mat, parent=None, col=None, smooth=True, recalc=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    if recalc:
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
    obj = bpy.data.objects.new(name, me)
    return link_obj(obj, parent=parent, col=col, mat=mat, smooth=smooth)

def make_beveled_box(name, loc, dim, mat, bevel=0.018, segs=2, rot=(0,0,0), parent=None, col=None, smooth=True):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=dim, verts=bm.verts)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=segs, profile=0.5, affect='EDGES')
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.location = loc
    obj.rotation_euler = rot
    return link_obj(obj, parent=parent, col=col, mat=mat, smooth=smooth)

def make_lathe(name, profile_rz, segs, mat, loc=(0,0,0), rot=(0,0,0), parent=None, col=None, smooth=True):
    """Revolve (r, z) points around Z axis."""
    verts, faces = [], []
    m = len(profile_rz)
    for j in range(segs):
        ang = j * math.tau / segs
        ca, sa = math.cos(ang), math.sin(ang)
        for r, z in profile_rz:
            verts.append((r * ca, r * sa, z))
    for j in range(segs):
        jn = (j + 1) % segs
        for i in range(m - 1):
            p0 = j * m + i
            p1 = j * m + i + 1
            p2 = jn * m + i + 1
            p3 = jn * m + i
            faces.append((p0, p3, p2, p1))
    obj = make_mesh(name, verts, faces, mat, parent=parent, col=col, smooth=smooth)
    obj.location = loc
    obj.rotation_euler = rot
    return obj

def make_tube(name, points, radius, mat, segs=8, closed=False, cap=True, parent=None, col=None, smooth=True, radii=None):
    """Sweep a circular cross-section along 3D points into a clean triangle/quad mesh."""
    pts = [Vector(p) for p in points]
    if not closed and 3<=len(pts)<=8 and 'Ear_' not in name and 'Bamboo' not in name:
        curved=[];curved_radii=[]
        for i in range(len(pts)-1):
            p0=pts[max(0,i-1)];p1=pts[i];p2=pts[i+1];p3=pts[min(len(pts)-1,i+2)]
            for step in range(5):
                t=step/5
                curved.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
                if radii:curved_radii.append(radii[i]*(1-t)+radii[i+1]*t)
        curved.append(pts[-1])
        if radii:curved_radii.append(radii[-1]);radii=curved_radii
        pts=curved
    n = len(pts)
    verts, faces = [], []
    up_hint = Vector((0, 0, 1))
    for i, p in enumerate(pts):
        if closed:
            t = (pts[(i + 1) % n] - pts[(i - 1) % n]).normalized()
        elif i == 0:
            t = (pts[1] - pts[0]).normalized()
        elif i == n - 1:
            t = (pts[-1] - pts[-2]).normalized()
        else:
            t = (pts[i + 1] - pts[i - 1]).normalized()
        if abs(t.dot(up_hint)) > 0.92:
            up_hint = Vector((0, 1, 0))
        b1 = t.cross(up_hint).normalized()
        b2 = b1.cross(t).normalized()
        r = radii[i] if radii else radius
        for j in range(segs):
            a = j * math.tau / segs
            v = p + (b1 * math.cos(a) + b2 * math.sin(a)) * r
            verts.append((v.x, v.y, v.z))
    ring_count = n if closed else n - 1
    for i in range(ring_count):
        inext = (i + 1) % n
        for j in range(segs):
            jn = (j + 1) % segs
            faces.append((i*segs + j, i*segs + jn, inext*segs + jn, inext*segs + j))
    if not closed and cap:
        faces.append(tuple(range(segs - 1, -1, -1)))
        base = (n - 1) * segs
        faces.append(tuple(base + j for j in range(segs)))
    return make_mesh(name, verts, faces, mat, parent=parent, col=col, smooth=smooth)
