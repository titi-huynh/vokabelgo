"""Market identity props: open crates, woven baskets with rims/handles, dragonfruit, bananas, ceramics, lanterns."""
import math
from mathutils import Vector, Euler
from boat_core import make_mesh, make_beveled_box, make_tube, make_lathe

def make_open_crate(name, loc, size_xyz, rot_z=0.0, parent=None, col=None):
    """Build an open-top slatted wooden fruit crate."""
    objs = []
    cx, cy, cz = loc
    sx, sy, sz = size_xyz
    t = 0.024
    # Bottom board
    objs.append(make_beveled_box(f'{name}_Bot', (cx, cy, cz + t*0.5), (sx, sy, t), 'CrateWood', bevel=0.004, rot=(0,0,rot_z), parent=parent, col=col))
    # 4 corner posts
    for dx in (-sx*0.5 + t*0.6, sx*0.5 - t*0.6):
        for dy in (-sy*0.5 + t*0.6, sy*0.5 - t*0.6):
            rx = dx * math.cos(rot_z) - dy * math.sin(rot_z)
            ry = dx * math.sin(rot_z) + dy * math.cos(rot_z)
            objs.append(make_beveled_box(f'{name}_Post_{dx:.2f}_{dy:.2f}', (cx+rx, cy+ry, cz + sz*0.5), (t*1.2, t*1.2, sz), 'TimberDark', bevel=0.003, rot=(0,0,rot_z), parent=parent, col=col))
    # Lower & upper side slats (open top!)
    for z_slat in (cz + sz*0.30, cz + sz*0.76):
        for side_s in (-1.0, 1.0):
            dy = side_s * (sy*0.5 - t*0.4)
            rx, ry = -dy * math.sin(rot_z), dy * math.cos(rot_z)
            objs.append(make_beveled_box(f'{name}_SlatX_{side_s}_{z_slat:.2f}', (cx+rx, cy+ry, z_slat), (sx, t*0.8, sz*0.34), 'CrateWood', bevel=0.004, rot=(0,0,rot_z), parent=parent, col=col))
            dx = side_s * (sx*0.5 - t*0.4)
            rx2, ry2 = dx * math.cos(rot_z), dx * math.sin(rot_z)
            objs.append(make_beveled_box(f'{name}_SlatY_{side_s}_{z_slat:.2f}', (cx+rx2, cy+ry2, z_slat), (t*0.8, sy, sz*0.34), 'CrateWood', bevel=0.004, rot=(0,0,rot_z), parent=parent, col=col))
    return objs

def make_open_basket(name, loc, r_bot, r_top, height, parent=None, col=None):
    """Open hollow woven basket with thick braided rim and two side handles."""
    objs = []
    cx, cy, cz = loc
    prof = [
        (0.001, 0.0), (r_bot, 0.0), (r_bot + (r_top-r_bot)*0.5, height*0.5),
        (r_top, height), (r_top - 0.025, height),
        (r_bot*0.88 + (r_top-r_bot)*0.45, height*0.48), (r_bot*0.85, 0.025), (0.001, 0.025)
    ]
    objs.append(make_lathe(f'{name}_Body', prof, 16, 'WickerBasket', loc=loc, parent=parent, col=col))
    rim_pts = [Vector((cx + r_top*math.cos(a), cy + r_top*math.sin(a), cz + height)) for a in [k*math.tau/18 for k in range(19)]]
    objs.append(make_tube(f'{name}_Rim', rim_pts, 0.020, 'TimberHoney', segs=8, closed=True, parent=parent, col=col))
    for h_side in (-1.0, 1.0):
        h_pts = [
            Vector((cx + h_side*r_top*0.92, cy - 0.055, cz + height)),
            Vector((cx + h_side*(r_top + 0.035), cy, cz + height + 0.065)),
            Vector((cx + h_side*r_top*0.92, cy + 0.055, cz + height))
        ]
        objs.append(make_tube(f'{name}_Handle_{h_side}', h_pts, 0.014, 'TimberDark', segs=7, parent=parent, col=col))
    return objs

def make_dragonfruit(name, loc, scale=1.0, tilt=(0.15, 0.0, 0.0), parent=None, col=None):
    """Geometrically sculpted dragonfruit with magenta body and green leaf scales/crown."""
    objs = []
    s = scale
    prof = [(0.001, -0.09*s), (0.048*s, -0.07*s), (0.072*s, -0.01*s), (0.064*s, 0.05*s), (0.032*s, 0.095*s), (0.001, 0.11*s)]
    objs.append(make_lathe(f'{name}_Body', prof, 12, 'DragonMagenta', loc=loc, rot=tilt, parent=parent, col=col))
    cx, cy, cz = loc
    # Crown & side green bract fins
    for k in range(5):
        ang = k * math.tau / 5
        fin_pts = [
            Vector((cx + 0.042*s*math.cos(ang), cy + 0.042*s*math.sin(ang), cz + 0.03*s)),
            Vector((cx + 0.068*s*math.cos(ang), cy + 0.068*s*math.sin(ang), cz + 0.09*s)),
            Vector((cx + 0.038*s*math.cos(ang), cy + 0.038*s*math.sin(ang), cz + 0.145*s))
        ]
        objs.append(make_tube(f'{name}_Crown_{k}', fin_pts, 0.013*s, 'LeafGreen', segs=6, radii=[0.016*s, 0.013*s, 0.004*s], parent=parent, col=col))
    return objs

def make_banana_bunch(name, loc, rot_z=0.0, scale=1.0, parent=None, col=None):
    """Curved bunch of bananas with recognizable crescent silhouette and stem crown."""
    objs = []
    cx, cy, cz = loc
    s = scale
    stem_p = Vector((cx, cy + 0.05*s, cz + 0.13*s))
    objs.append(make_beveled_box(f'{name}_Stem', stem_p, (0.055*s, 0.038*s, 0.035*s), 'LeafDark', bevel=0.008, parent=parent, col=col))
    for i, x_off in enumerate((-0.075, -0.038, 0.0, 0.038, 0.075)):
        ang_z = rot_z + (i - 2) * 0.16
        ca, sa = math.cos(ang_z), math.sin(ang_z)
        b_pts = []
        for t, (dy, dz) in enumerate(((0.04, 0.12), (0.01, 0.06), (-0.04, 0.01), (-0.09, -0.01), (-0.13, 0.02))):
            lx = x_off * s * (0.7 + 0.1*t)
            ly = dy * s
            rx = lx * ca - ly * sa
            ry = lx * sa + ly * ca
            b_pts.append(Vector((cx + rx, cy + ry, cz + dz*s)))
        objs.append(make_tube(f'{name}_Finger_{i}', b_pts, 0.022*s, 'BananaYellow', segs=8, radii=[0.012*s, 0.023*s, 0.026*s, 0.022*s, 0.009*s], parent=parent, col=col))
    return objs

def ceramic_flower(name, loc, scale, profile, height, parent=None, col=None):
    """Small cobalt petals wrapped onto the ceramic profile; portable mesh ornament."""
    cx,cy,cz=loc
    def point(dx,dz):
        z=height+dz
        radius=profile[-1][0]
        for (r0,z0),(r1,z1) in zip(profile,profile[1:]):
            if z0<=z<=z1 and z1>z0:
                radius=r0+(r1-r0)*(z-z0)/(z1-z0)
                break
        y=cy-math.sqrt(max(.00001,radius*radius-dx*dx))-.0015*scale
        return (cx+dx,y,cz+z)
    verts,faces=[],[]
    for petal in range(5):
        angle=petal*math.tau/5
        c,s=math.cos(angle),math.sin(angle)
        points=[]
        for i in range(10):
            a=i*math.tau/10
            radial=(.019+.018*math.cos(a))*scale
            tangent=.009*math.sin(a)*scale
            points.append(point(radial*c-tangent*s,radial*s+tangent*c))
        base=len(verts)
        verts.extend(points)
        faces.append(tuple(base+i for i in range(10)))
    return make_mesh(name,verts,faces,'CeramicCobalt',parent=parent,col=col,smooth=True)

def make_ceramic_bowl(name, loc, scale=1.0, parent=None, col=None):
    """Hollow blue-and-white ceramic bowl with cobalt bands."""
    objs = []
    cx, cy, cz = loc
    s = scale
    prof = [
        (0.001, 0.0), (0.055*s, 0.0), (0.058*s, 0.022*s), (0.095*s, 0.065*s),
        (0.118*s, 0.125*s), (0.104*s, 0.125*s), (0.082*s, 0.065*s), (0.001, 0.032*s)
    ]
    objs.append(make_lathe(f'{name}_Bowl', prof, 18, 'CeramicWhite', loc=loc, parent=parent, col=col))
    for rz, rr in ((0.015*s, 0.059*s), (0.085*s, 0.107*s), (0.115*s, 0.117*s)):
        ring = [Vector((cx + rr*math.cos(a), cy + rr*math.sin(a), cz + rz)) for a in [k*math.tau/18 for k in range(19)]]
        objs.append(make_tube(f'{name}_Cobalt_{rz:.3f}', ring, 0.006*s, 'CeramicCobalt', segs=6, closed=True, parent=parent, col=col))
    objs.append(ceramic_flower(f'{name}_Flower',loc,s,prof[:5],.065*s,parent,col))
    return objs

def make_ceramic_teapot(name, loc, scale=1.0, parent=None, col=None):
    """Blue-and-white ceramic teapot with spout, handle, lid, and cobalt floral bands."""
    objs = []
    cx, cy, cz = loc
    s = scale
    prof = [
        (0.001, 0.0), (0.085*s, 0.0), (0.135*s, 0.065*s), (0.148*s, 0.135*s),
        (0.115*s, 0.205*s), (0.075*s, 0.225*s), (0.092*s, 0.245*s), (0.045*s, 0.268*s), (0.001, 0.272*s)
    ]
    objs.append(make_lathe(f'{name}_Body', prof, 20, 'CeramicWhite', loc=loc, parent=parent, col=col))
    objs.append(make_beveled_box(f'{name}_Finial', (cx, cy, cz + 0.288*s), (0.042*s, 0.042*s, 0.038*s), 'CeramicCobalt', bevel=0.012*s, parent=parent, col=col))
    # Cobalt decorative bands & medallions
    for rz, rr in ((0.032*s, 0.112*s), (0.135*s, 0.149*s), (0.212*s, 0.102*s)):
        ring = [Vector((cx + rr*math.cos(a), cy + rr*math.sin(a), cz + rz)) for a in [k*math.tau/18 for k in range(19)]]
        objs.append(make_tube(f'{name}_Band_{rz:.3f}', ring, 0.008*s, 'CeramicCobalt', segs=6, closed=True, parent=parent, col=col))
    objs.append(ceramic_flower(f'{name}_Flower',loc,s,prof,.088*s,parent,col))
    # S-curved pouring spout on left (-X)
    spout_pts = [
        Vector((cx - 0.115*s, cy - 0.02*s, cz + 0.11*s)),
        Vector((cx - 0.185*s, cy - 0.03*s, cz + 0.145*s)),
        Vector((cx - 0.225*s, cy - 0.03*s, cz + 0.215*s)),
        Vector((cx - 0.250*s, cy - 0.03*s, cz + 0.245*s))
    ]
    objs.append(make_tube(f'{name}_Spout', spout_pts, 0.024*s, 'CeramicWhite', segs=10, radii=[0.034*s, 0.024*s, 0.018*s, 0.014*s], parent=parent, col=col))
    # Arched ear handle on right (+X)
    handle_pts = [
        Vector((cx + 0.105*s, cy, cz + 0.195*s)),
        Vector((cx + 0.195*s, cy, cz + 0.205*s)),
        Vector((cx + 0.205*s, cy, cz + 0.125*s)),
        Vector((cx + 0.120*s, cy, cz + 0.065*s))
    ]
    objs.append(make_tube(f'{name}_Handle', handle_pts, 0.018*s, 'CeramicCobalt', segs=8, parent=parent, col=col))
    return objs

def make_lantern(name, top_hang_pt, drop=0.28, radius=0.11, mat='LanternGold', parent=None, col=None):
    """Hanging traditional silk lantern with cord, caps, and tassel."""
    objs = []
    tx, ty, tz = top_hang_pt
    cz = tz - drop
    objs.append(make_tube(f'{name}_Cord', [Vector((tx, ty, tz)), Vector((tx, ty, cz + radius*0.95))], 0.009, 'RopeHemp', segs=6, parent=parent, col=col))
    prof = [
        (0.001, -radius*0.95), (radius*0.55, -radius*0.90), (radius*0.96, -radius*0.45),
        (radius*1.05, 0.0), (radius*0.96, radius*0.45), (radius*0.55, radius*0.90), (0.001, radius*0.95)
    ]
    objs.append(make_lathe(f'{name}_Globe', prof, 16, mat, loc=(tx, ty, cz), parent=parent, col=col))
    for cap_z in (cz + radius*0.90, cz - radius*0.90):
        objs.append(make_beveled_box(f'{name}_Cap_{cap_z:.2f}', (tx, ty, cap_z), (radius*0.9, radius*0.9, 0.025), 'TimberDark', bevel=0.005, parent=parent, col=col))
    objs.append(make_tube(f'{name}_Tassel', [Vector((tx, ty, cz - radius*0.95)), Vector((tx, ty, cz - radius*1.55))], 0.014, 'CabinCoral', segs=6, radii=[0.010, 0.022], parent=parent, col=col))
    return objs

def build_all_market_props(root, col):
    objs = []
    # 1. Forward Orange Citrus Crates on display deck (X = -1.36, Y = -0.76)
    objs.extend(make_open_crate('Crate_Oranges_Front', (-1.28, -0.78, 0.90), (0.58, 0.44, 0.22), rot_z=0.04, parent=root, col=col))
    orange_prof = [(0.001, -0.055), (0.048, -0.038), (0.062, 0.0), (0.048, 0.038), (0.001, 0.055)]
    for idx, (ox, oy, oz) in enumerate((
        (-1.44, -0.84, 1.00), (-1.28, -0.85, 1.01), (-1.12, -0.83, 1.00),
        (-1.38, -0.70, 1.01), (-1.20, -0.71, 1.02), (-1.30, -0.78, 1.09), (-1.16, -0.77, 1.08)
    )):
        objs.append(make_lathe(f'Orange_{idx}', orange_prof, 12, 'OrangeCitrus', loc=(ox, oy, oz+.075), parent=root, col=col))

    # 2. Dragonfruit Crate & Banana Crate on main storefront counter (matching accepted-concept.png!)
    objs.extend(make_open_crate('Crate_Dragonfruit', (-0.52, -0.82, 1.045), (0.64, 0.44, 0.18), rot_z=-0.05, parent=root, col=col))
    objs.extend(make_dragonfruit('Dragonfruit_1', (-0.64, -0.84, 1.18), scale=1.08, tilt=(0.22, -0.15, 0.1), parent=root, col=col))
    objs.extend(make_dragonfruit('Dragonfruit_2', (-0.44, -0.85, 1.19), scale=1.12, tilt=(0.18,  0.12, -0.1), parent=root, col=col))
    objs.extend(make_dragonfruit('Dragonfruit_3', (-0.30, -0.78, 1.17), scale=1.02, tilt=(0.25,  0.20, 0.2), parent=root, col=col))

    # Banana bunches right beside dragonfruit on counter
    objs.extend(make_open_crate('Crate_Bananas', (0.06, -0.80, 1.045), (0.48, 0.40, 0.15), rot_z=0.06, parent=root, col=col))
    objs.extend(make_banana_bunch('Banana_Bunch_Main', (0.05, -0.80, 1.14), rot_z=-0.25, scale=1.18, parent=root, col=col))
    objs.extend(make_banana_bunch('Banana_Bunch_Side', (0.20, -0.74, 1.13), rot_z=0.20, scale=0.95, parent=root, col=col))
    # Hanging banana bunch on coral cabin pillar
    objs.extend(make_banana_bunch('Banana_Bunch_Hanging', (1.46, -0.58, 1.62), rot_z=-0.40, scale=0.95, parent=root, col=col))

    # 3. Blue & White Ceramic Bowls, Teapot, and Teacups on right side of counter (X = +0.52 to +1.15)
    objs.extend(make_ceramic_bowl('Ceramic_Bowl_Left', (0.52, -0.78, 1.05), scale=1.08, parent=root, col=col))
    objs.extend(make_ceramic_bowl('Ceramic_Bowl_Mid',  (0.75, -0.82, 1.05), scale=0.96, parent=root, col=col))
    objs.extend(make_ceramic_teapot('Ceramic_Teapot_Hero', (1.04, -0.76, 1.05), scale=1.08, parent=root, col=col))
    objs.extend(make_ceramic_bowl('Ceramic_Teacup_1', (0.66, -0.66, 1.05), scale=0.52, parent=root, col=col))

    # 4. Open Woven Baskets with handles on forward & aft deck + Potted Plant at Bow
    objs.extend(make_open_basket('Basket_Fwd_Deck', (-1.68, -0.22, 0.91), 0.16, 0.22, 0.18, parent=root, col=col))
    objs.extend(make_open_basket('Basket_Aft_Deck', (2.15, -0.45, 0.56), 0.17, 0.23, 0.20, parent=root, col=col))
    # Potted tropical plant at forward bow (X = -2.02, Y = -0.52)
    objs.extend(make_ceramic_bowl('Bow_Plant_Pot', (-2.02, -0.52, 0.56), scale=1.45, parent=root, col=col))
    for k in range(7):
        ang = k * math.tau / 7 + 0.2
        l_pts = [
            Vector((-2.02, -0.52, 0.72)),
            Vector((-2.02 + 0.16*math.cos(ang), -0.52 + 0.16*math.sin(ang), 0.98)),
            Vector((-2.02 + 0.34*math.cos(ang), -0.52 + 0.34*math.sin(ang), 1.12 - 0.04*(k%2)))
        ]
        objs.append(make_tube(f'Bow_Plant_Leaf_{k}', l_pts, 0.032, 'LeafGreen', segs=6, radii=[0.015, 0.042, 0.008], parent=root, col=col))

    # 5. Dangling Lanterns & Stern Cây Bẹo Bamboo Pole with Bunting & Hanging Dragonfruit
    objs.extend(make_lantern('Lantern_Cabin_Fwd', (-0.28, -0.64, 2.50), drop=0.28, radius=0.115, mat='LanternGold', parent=root, col=col))
    objs.extend(make_lantern('Lantern_Awning_In', (-1.05, -0.35, 2.38), drop=0.25, radius=0.095, mat='LanternGold', parent=root, col=col))
    objs.extend(make_lantern('Lantern_Aft_Port',  (1.88, -0.52, 2.20), drop=0.24, radius=0.105, mat='LanternGold', parent=root, col=col))
    objs.extend(make_lantern('Lantern_Aft_Stern', (2.28,  0.42, 2.18), drop=0.24, radius=0.095, mat='LanternRed',  parent=root, col=col))

    # Stern Cây Bẹo bamboo mast + crossbar + bunting flags + hanging dragonfruit (X = +1.95 to +2.55)
    objs.append(make_tube('Stern_CayBeo_Mast', [Vector((1.95, 0.18, 2.22)), Vector((1.95, 0.18, 3.12))], 0.036, 'BambooPole', segs=8, parent=root, col=col))
    objs.append(make_tube('Stern_CayBeo_Arm',  [Vector((1.82, 0.18, 2.96)), Vector((2.62, 0.18, 3.06))], 0.026, 'BambooPole', segs=8, parent=root, col=col))
    objs.append(make_tube('Stern_Beo_Cord',    [Vector((2.56, 0.18, 3.05)), Vector((2.56, 0.18, 2.68))], 0.010, 'RopeHemp', segs=6, parent=root, col=col))
    objs.extend(make_dragonfruit('Stern_Beo_Dragonfruit', (2.56, 0.18, 2.55), scale=1.35, tilt=(0,0,0), parent=root, col=col))
    return objs
