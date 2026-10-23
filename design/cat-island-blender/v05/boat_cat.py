"""Sculpted shopkeeper cat facing storefront (Y=-) with ears, muzzle, nose, smile, apron, paws, tail & kraft bag."""
import math
from mathutils import Vector
from boat_core import make_mesh, make_beveled_box, make_tube, make_lathe

def build_shopkeeper_cat(root, col):
    objs = []
    cx, cy, cz = -0.66, -0.44, 0.78

    # 1. Sculpted Pear-Shaped Torso & Teal Shopkeeper Apron (not a sphere!)
    torso_prof = [(0.001, 0.0), (0.21, 0.02), (0.24, 0.16), (0.22, 0.34), (0.17, 0.50), (0.12, 0.58), (0.001, 0.60)]
    objs.append(make_lathe('Cat_Torso_Body', torso_prof, 18, 'CatCream', loc=(cx, cy, cz), parent=root, col=col))
    apron_prof = [(0.18, 0.08), (0.246, 0.16), (0.228, 0.34), (0.182, 0.48), (0.172, 0.48), (0.218, 0.34), (0.235, 0.16)]
    objs.append(make_lathe('Cat_Apron_Bib', apron_prof, 18, 'CatApronTeal', loc=(cx, cy - 0.012, cz), parent=root, col=col))
    for s_side in (-1.0, 1.0):
        s_pts = [
            Vector((cx + s_side*0.10, cy - 0.18, cz + 0.44)),
            Vector((cx + s_side*0.13, cy - 0.10, cz + 0.54)),
            Vector((cx + s_side*0.12, cy + 0.10, cz + 0.48))
        ]
        objs.append(make_tube(f'Cat_Apron_Strap_{s_side}', s_pts, 0.024, 'CatApronTeal', segs=8, parent=root, col=col))

    # 2. Sculpted Feline Head with Cheek Fluff & Forehead Orange Patch
    hz = cz + 0.76
    head_prof = [
        (0.001, -0.22), (0.18, -0.19), (0.29, -0.10), (0.31, 0.00),
        (0.27, 0.11), (0.19, 0.20), (0.08, 0.24), (0.001, 0.25)
    ]
    objs.append(make_lathe('Cat_Head_Main', head_prof, 32, 'CatCream', loc=(cx, cy, hz), parent=root, col=col))
    # Cheek fluff tufts on left & right
    for c_side in (-1.0, 1.0):
        c_pts = [
            Vector((cx + c_side*0.24, cy - 0.06, hz - 0.04)),
            Vector((cx + c_side*0.33, cy - 0.04, hz - 0.05)),
            Vector((cx + c_side*0.37, cy - 0.02, hz - 0.08))
        ]
        objs.append(make_tube(f'Cat_Cheek_Tuft_{c_side}', c_pts, 0.045, 'CatCream', segs=8, radii=[0.065, 0.042, 0.012], parent=root, col=col))
    # Cute orange forehead patch (matching accepted-concept.png bottom-right!)

    # 3. Pointed Triangular Cat Ears with Pink Inner Hollows
    for e_side in (-1.0, 1.0):
        ex = cx + e_side * 0.19
        ey = cy - 0.02
        ez = hz + 0.17
        ear_pts = [
            Vector((ex - e_side*0.02, ey, ez)),
            Vector((ex + e_side*0.04, ey - 0.01, ez + 0.11)),
            Vector((ex + e_side*0.09, ey - 0.02, ez + 0.22))
        ]
        objs.append(make_tube(f'Cat_Ear_Outer_{e_side}', ear_pts, 0.055, 'CatCream', segs=6, radii=[0.095, 0.058, 0.012], parent=root, col=col))
        in_pts = [p + Vector((0, -0.028, -0.01)) for p in ear_pts]
        objs.append(make_tube(f'Cat_Ear_Inner_{e_side}', in_pts, 0.035, 'CatPink', segs=6, radii=[0.058, 0.035, 0.008], parent=root, col=col))

    # 4. Protruding Muzzle Puffs, Pink Nose, Happy Smile Mouth, Crescent Eyes & Whiskers (facing Y=-)
    for m_side in (-1.0, 1.0):
        objs.append(make_beveled_box(f'Cat_Muzzle_Puff_{m_side}', (cx + m_side*0.052, cy - 0.285, hz - 0.055), (0.105, 0.075, 0.072), 'CatCream', bevel=0.028, parent=root, col=col))
    objs.append(make_beveled_box('Cat_Nose_Pink', (cx, cy - 0.322, hz - 0.022), (0.046, 0.032, 0.032), 'CatPink', bevel=0.010, parent=root, col=col))
    # Cheerful open cat smile & pink tongue under muzzle
    smile_l = [Vector((cx, cy - 0.318, hz - 0.042)), Vector((cx - 0.045, cy - 0.312, hz - 0.068)), Vector((cx - 0.082, cy - 0.295, hz - 0.048))]
    smile_r = [Vector((cx, cy - 0.318, hz - 0.042)), Vector((cx + 0.045, cy - 0.312, hz - 0.068)), Vector((cx + 0.082, cy - 0.295, hz - 0.048))]
    objs.append(make_tube('Cat_Smile_L', smile_l, 0.009, 'CatEyeDark', segs=6, parent=root, col=col))
    objs.append(make_tube('Cat_Smile_R', smile_r, 0.009, 'CatEyeDark', segs=6, parent=root, col=col))
    objs.append(make_beveled_box('Cat_Happy_Mouth', (cx, cy - 0.302, hz - 0.085), (0.078, 0.035, 0.065), 'CatPink', bevel=0.016, parent=root, col=col))
    # Happy arched crescent eyes (^ ^) + whiskers
    for e_side in (-1.0, 1.0):
        ec = cx + e_side * 0.115
        eye_arc = [
            Vector((ec - 0.048, cy - 0.275, hz + 0.015)),
            Vector((ec,         cy - 0.295, hz + 0.048)),
            Vector((ec + 0.048, cy - 0.275, hz + 0.015))
        ]
        objs.append(make_tube(f'Cat_Eye_Arc_{e_side}', eye_arc, 0.013, 'CatEyeDark', segs=7, parent=root, col=col))
        for w_z in (-0.03, -0.06):
            w_pts = [Vector((cx + e_side*0.22, cy - 0.22, hz + w_z)), Vector((cx + e_side*0.36, cy - 0.20, hz + w_z - 0.015))]
            objs.append(make_tube(f'Cat_Whisker_{e_side}_{w_z:.2f}', w_pts, 0.005, 'CatEyeDark', segs=5, parent=root, col=col))

    # 5. Front Paws (Left Paw on Counter, Right Arm Waving & Holding Kraft Takeaway Bag) + Fluffy Tail
    arm_l = [Vector((cx + 0.16, cy - 0.08, cz + 0.42)), Vector((cx + 0.20, cy - 0.22, cz + 0.32)), Vector((cx + 0.16, cy - 0.33, cz + 0.28))]
    objs.append(make_tube('Cat_Arm_Left_Counter', arm_l, 0.055, 'CatCream', segs=10, radii=[0.058, 0.052, 0.062], parent=root, col=col))
    arm_r = [Vector((cx - 0.16, cy - 0.06, cz + 0.44)), Vector((cx - 0.28, cy - 0.20, cz + 0.50)), Vector((cx - 0.32, cy - 0.32, cz + 0.54))]
    objs.append(make_tube('Cat_Arm_Right_Bag', arm_r, 0.055, 'CatCream', segs=10, radii=[0.058, 0.052, 0.062], parent=root, col=col))

    # Kraft paper takeaway bag with rope handles & paw stamp (at X = -0.98, Y = -0.80, Z = 1.15)
    bx, by, bz = cx - 0.32, cy - 0.36, cz + 0.36
    objs.append(make_beveled_box('Kraft_Takeaway_Bag', (bx, by, bz), (0.22, 0.14, 0.26), 'KraftBag', bevel=0.010, rot=(0, 0, 0.12), parent=root, col=col))
    objs.append(make_tube('Kraft_Bag_Handle', [Vector((bx-0.05, by, bz+0.13)), Vector((bx, by, bz+0.21)), Vector((bx+0.05, by, bz+0.13))], 0.009, 'RopeHemp', segs=7, parent=root, col=col))
    objs.append(make_beveled_box('Kraft_Bag_Paw', (bx, by - 0.072, bz - 0.01), (0.055, 0.012, 0.048), 'SignInk', bevel=0.012, rot=(0, 0, 0.12), parent=root, col=col))

    # Fluffy S-Curved Cat Tail rising behind shopkeeper cat
    tail_pts = [
        Vector((cx + 0.05, cy + 0.18, cz + 0.14)),
        Vector((cx + 0.22, cy + 0.26, cz + 0.26)),
        Vector((cx + 0.32, cy + 0.22, cz + 0.46)),
        Vector((cx + 0.26, cy + 0.16, cz + 0.64))
    ]
    objs.append(make_tube('Cat_Tail_Curved', tail_pts, 0.052, 'CatCream', segs=10, radii=[0.046, 0.054, 0.058, 0.042], parent=root, col=col))
    return objs
