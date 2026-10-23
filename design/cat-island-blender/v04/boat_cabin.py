"""Coral shop cabin, arched cream roof with seams, sagged bamboo awning, and storefront counter."""
import math
from mathutils import Vector
from boat_core import make_mesh, make_beveled_box, make_tube, make_lathe

def build_counter_and_cabin(root, col):
    objs = []
    # 1. Open Inviting Storefront Counter (Y = - side, X from -1.65 to +1.55)
    # Main honey-timber counter base & overhanging beveled counter top
    objs.append(make_beveled_box('Counter_Base_Front', (-0.05, -0.78, 0.78), (3.12, 0.52, 0.44), 'TimberWarm', bevel=0.014, parent=root, col=col))
    objs.append(make_beveled_box('Counter_Top_Plank', (-0.02, -0.80, 1.02), (3.24, 0.60, 0.058), 'TimberHoney', bevel=0.012, parent=root, col=col))
    # Vertical decorative slats along Y=- face of counter
    for sx in [-1.45 + 0.24 * k for k in range(13)]:
        objs.append(make_beveled_box(f'Counter_Slat_{sx:.2f}', (sx, -1.045, 0.78), (0.045, 0.022, 0.40), 'TimberDark', bevel=0.004, parent=root, col=col))
    # Forward stepped display platform under awning (X from -2.15 to -0.85)
    objs.append(make_beveled_box('Forward_Display_Deck', (-1.52, -0.22, 0.72), (1.28, 1.42, 0.32), 'TimberWarm', bevel=0.014, parent=root, col=col))
    objs.append(make_beveled_box('Forward_Display_Trim', (-1.52, -0.22, 0.89), (1.34, 1.48, 0.045), 'TimberHoney', bevel=0.010, parent=root, col=col))

    # 2. Small Coral Shop Cabin with Framed Open Storefront Recess (X: -0.22 to +1.62, Y: -0.46 to +0.92)
    # Cabin floor & back wall (Y = +0.88)
    objs.append(make_beveled_box('Cabin_Back_Wall', (0.70, 0.86, 1.56), (1.82, 0.09, 1.92), 'CabinCoral', bevel=0.016, parent=root, col=col))
    # Aft wall (X = +1.58) with window opening
    objs.append(make_beveled_box('Cabin_Aft_Wall_Lower', (1.58, 0.20, 1.05), (0.09, 1.32, 0.92), 'CabinCoral', bevel=0.015, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Aft_Wall_Upper', (1.58, 0.20, 2.22), (0.09, 1.32, 0.56), 'CabinCoral', bevel=0.015, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Aft_Pillar_L', (1.58, -0.32, 1.72), (0.09, 0.26, 0.52), 'CabinCoral', bevel=0.015, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Aft_Pillar_R', (1.58,  0.72, 1.72), (0.09, 0.28, 0.52), 'CabinCoral', bevel=0.015, parent=root, col=col))

    # Storefront wall (Y = -0.44): wide open service window on right (X: +0.22 to +1.42) + coral pillar on left (X: -0.22 to +0.20)
    objs.append(make_beveled_box('Cabin_Front_Pillar_Fwd', (-0.01, -0.44, 1.56), (0.42, 0.10, 1.90), 'CabinCoral', bevel=0.016, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Front_Pillar_Aft', (1.49, -0.44, 1.56), (0.24, 0.10, 1.90), 'CabinCoral', bevel=0.016, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Front_Header', (0.82, -0.44, 2.28), (1.30, 0.10, 0.46), 'CabinCoral', bevel=0.016, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Front_Apron', (0.82, -0.44, 0.82), (1.30, 0.10, 0.48), 'CabinCoral', bevel=0.014, parent=root, col=col))
    # Small framed ticket/peek window on the left coral pillar (matching accepted-concept.png top-right!)
    objs.append(make_beveled_box('Cabin_Peek_Window_Frame', (-0.01, -0.485, 1.42), (0.22, 0.04, 0.30), 'CabinCoralTrim', bevel=0.008, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Peek_Window_Recess', (-0.01, -0.47, 1.42), (0.15, 0.03, 0.23), 'CabinInterior', bevel=0.004, parent=root, col=col))

    # Forward cabin wall (X = -0.20) with wide arched shopkeeper doorway so counter/cat are never blocked
    objs.append(make_beveled_box('Cabin_Fwd_Pillar_Stbd', (-0.20, 0.68, 1.56), (0.10, 0.44, 1.90), 'CabinCoral', bevel=0.016, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Fwd_Header_Arch', (-0.20, 0.20, 2.32), (0.10, 1.28, 0.42), 'CabinCoral', bevel=0.016, parent=root, col=col))
    objs.append(make_beveled_box('Cabin_Fwd_Door_Trim', (-0.24, 0.12, 2.08), (0.06, 0.92, 0.08), 'CabinCoralTrim', bevel=0.010, parent=root, col=col))

    # Timber framing posts & eaves moldings on coral cabin
    for px, py in ((-0.21, -0.45), (1.59, -0.45), (-0.21, 0.87), (1.59, 0.87), (0.20, -0.45)):
        objs.append(make_beveled_box(f'Cabin_Post_{px:.1f}_{py:.1f}', (px, py, 1.56), (0.075, 0.075, 1.94), 'CabinCoralTrim', bevel=0.010, parent=root, col=col))
    # Window sill & counter extension inside open service window
    objs.append(make_beveled_box('Cabin_Window_Counter_Sill', (0.82, -0.42, 1.06), (1.28, 0.34, 0.055), 'TimberHoney', bevel=0.010, parent=root, col=col))

    # Cozy interior backdrop wall & shelves with boxes/jars visible through the open window
    objs.append(make_beveled_box('Cabin_Interior_Partition', (0.72, 0.52, 1.55), (1.68, 0.06, 1.78), 'CabinInterior', bevel=0.010, parent=root, col=col))
    for sh_z in (1.35, 1.72):
        objs.append(make_beveled_box(f'Cabin_Inner_Shelf_{sh_z:.2f}', (0.78, 0.32, sh_z), (1.36, 0.32, 0.04), 'TimberWarm', bevel=0.006, parent=root, col=col))
    # Interior tea caddies & wooden boxes on shelves
    for bx, bz, bw, bh, bmat in ((0.42, 1.48, 0.22, 0.20, 'CrateWood'), (0.72, 1.47, 0.20, 0.18, 'TimberHoney'),
                                 (1.05, 1.49, 0.18, 0.22, 'CabinCoralTrim'), (0.55, 1.84, 0.24, 0.18, 'CrateWood'),
                                 (0.95, 1.85, 0.20, 0.20, 'SignBoard')):
        objs.append(make_beveled_box(f'Cabin_Shelf_Box_{bx:.2f}_{bz:.2f}', (bx, 0.30, bz), (bw, 0.20, bh), bmat, bevel=0.008, parent=root, col=col))

    # 3. Arching Rounded Cream Roof Panel with Seams (z = 2.48 to z = 2.96)
    nx_r, ny_r = 16, 18
    rx_vals = [-0.42 + 2.22 * i / (nx_r - 1) for i in range(nx_r)]
    ry_vals = [-0.68 + 1.78 * j / (ny_r - 1) for j in range(ny_r)]
    rv, rf = [], []
    for thick_pass, dz_off in enumerate((0.0, 0.095)):
        for rx in rx_vals:
            u_x = (rx - 0.69) / 1.11
            x_droop = -0.045 * (u_x * u_x)
            for ry in ry_vals:
                u_y = (ry - 0.21) / 0.89
                # Smooth barrel arch peaking around z = 2.94
                arch_z = 2.50 + 0.36 * math.cos(u_y * math.pi * 0.46) + x_droop + dz_off
                rv.append((rx, ry, arch_z))
    n_rg = nx_r * ny_r
    for i in range(nx_r - 1):
        for j in range(ny_r - 1):
            a = i * ny_r + j
            b = (i + 1) * ny_r + j
            c = (i + 1) * ny_r + (j + 1)
            d = i * ny_r + (j + 1)
            rf.append((a, d, c, b))
            rf.append((n_rg + a, n_rg + b, n_rg + c, n_rg + d))
    for i in range(nx_r - 1):
        for j_e in (0, ny_r - 1):
            o0, o1 = i * ny_r + j_e, (i + 1) * ny_r + j_e
            rf.append((o0, o1, n_rg + o1, n_rg + o0) if j_e == 0 else (o0, n_rg + o0, n_rg + o1, o1))
    for i_e in (0, nx_r - 1):
        for j in range(ny_r - 1):
            o0, o1 = i_e * ny_r + j, i_e * ny_r + j + 1
            rf.append((o0, n_rg + o0, n_rg + o1, o1) if i_e == 0 else (o0, o1, n_rg + o1, n_rg + o0))
    objs.append(make_mesh('Cabin_Arch_Roof_Cream', rv, rf, 'RoofCream', parent=root, col=col, smooth=True))

    # Raised roof panel ribs/seams across the arched roof + timber eaves edge beams
    for seam_x in (-0.36, 0.16, 0.69, 1.22, 1.74):
        u_x = (seam_x - 0.69) / 1.11
        pts_s = [Vector((seam_x, ry, 2.595 + 0.36 * math.cos(((ry - 0.21)/0.89) * math.pi * 0.46) - 0.045*u_x*u_x)) for ry in ry_vals]
        objs.append(make_tube(f'Roof_Seam_{seam_x:.2f}', pts_s, 0.022, 'RoofSeam', segs=8, parent=root, col=col))
    for ry_edge in (-0.67, 1.09):
        pts_e = [Vector((rx, ry_edge, 2.53 - 0.045*((rx - 0.69)/1.11)**2)) for rx in rx_vals]
        objs.append(make_tube(f'Roof_Fascia_{ry_edge:.2f}', pts_e, 0.036, 'TimberHoney', segs=8, parent=root, col=col))
    return objs

def build_awning_sign_chimney(root, col):
    objs = []
    # 4. Gently Sagged Broad Cream Fabric Awning Forward (X: -2.42 to -0.25, Y: -1.16 to +0.92)
    nx_a, ny_a = 18, 16
    ax_vals = [-2.42 + 2.17 * i / (nx_a - 1) for i in range(nx_a)]
    ay_vals = [-1.16 + 2.08 * j / (ny_a - 1) for j in range(ny_a)]
    av, af = [], []
    for thick_i, dz_a in enumerate((0.0, 0.032)):
        for ax in ax_vals:
            ux = (ax - (-2.42)) / 2.17  # 0 at forward edge, 1 at cabin edge
            # Rises from z=2.18 at forward edge to z=2.55 near cabin, with catenary sag between bamboo rafters
            base_z = 2.16 + 0.38 * ux - 0.095 * math.sin(ux * math.pi)
            for ay in ay_vals:
                uy = (ay - (-0.12)) / 1.04  # -1 at port (-Y), +1 at starboard (+Y)
                # Gentle roof pitch + natural cloth drape sag between purlins
                sag_y = 0.14 * (1.0 - 0.55 * uy * uy) - 0.045 * math.sin((uy + 1.0) * math.pi * 2.0) * math.sin(ux * math.pi)
                av.append((ax, ay, base_z + sag_y + dz_a))
    n_ag = nx_a * ny_a
    for i in range(nx_a - 1):
        for j in range(ny_a - 1):
            a, b = i * ny_a + j, (i + 1) * ny_a + j
            c, d = (i + 1) * ny_a + (j + 1), i * ny_a + (j + 1)
            af.append((a, d, c, b))
            af.append((n_ag + a, n_ag + b, n_ag + c, n_ag + d))
    for i in range(nx_a - 1):
        for je in (0, ny_a - 1):
            o0, o1 = i * ny_a + je, (i + 1) * ny_a + je
            af.append((o0, o1, n_ag + o1, n_ag + o0) if je == 0 else (o0, n_ag + o0, n_ag + o1, o1))
    for ie in (0, nx_a - 1):
        for j in range(ny_a - 1):
            o0, o1 = ie * ny_a + j, ie * ny_a + j + 1
            af.append((o0, n_ag + o0, n_ag + o1, o1) if ie == 0 else (o0, o1, n_ag + o1, n_ag + o0))
    objs.append(make_mesh('Awning_Cloth_Cream', av, af, 'AwningCloth', parent=root, col=col, smooth=True))

    # Awning bamboo frame poles & 4 angled bamboo support posts with node rings and rope lashings
    post_specs = [
        ('Fwd_Port',  Vector((-2.18, -1.04, 0.78)), Vector((-2.34, -1.10, 2.24))),
        ('Mid_Port',  Vector((-0.92, -1.02, 0.98)), Vector((-0.96, -1.10, 2.40))),
        ('Fwd_Stbd',  Vector((-2.15,  0.78, 0.78)), Vector((-2.32,  0.86, 2.24))),
        ('Mid_Stbd',  Vector((-0.92,  0.80, 0.76)), Vector((-0.95,  0.86, 2.40))),
    ]
    for pname, p_bot, p_top in post_specs:
        p_mid = (p_bot + p_top) * 0.5 + Vector((0.02, 0.0, 0.0))
        objs.append(make_tube(f'Awning_Bamboo_Post_{pname}', [p_bot, p_mid, p_top], 0.042, 'BambooPole', segs=10, parent=root, col=col))
        for t_node in (0.22, 0.50, 0.78):
            np = p_bot.lerp(p_top, t_node)
            objs.append(make_tube(f'Bamboo_Node_{pname}_{t_node:.2f}', [np - Vector((0,0,0.015)), np + Vector((0,0,0.015))], 0.049, 'BambooNode', segs=10, parent=root, col=col))
        # Rope lashing at top of bamboo post
        for dz_l in (-0.03, -0.01, 0.01):
            ring = [p_top + Vector((0.055*math.cos(a), 0.055*math.sin(a), dz_l)) for a in [k*math.tau/10 for k in range(11)]]
            objs.append(make_tube(f'Awning_Lash_{pname}_{dz_l:.2f}', ring, 0.016, 'RopeHemp', segs=6, closed=True, parent=root, col=col))

    # Bamboo crossbars under awning
    # Keep the complete bamboo cross-section below the fabric, including its sag.
    objs.append(make_tube('Awning_Crossbar_Fwd', [Vector((-2.36, -1.14, 2.17)), Vector((-2.36, -0.12, 2.22)), Vector((-2.36, 0.90, 2.17))], 0.036, 'BambooPole', segs=9, parent=root, col=col))
    objs.append(make_tube('Awning_Crossbar_Mid', [Vector((-1.32, -1.14, 2.25)), Vector((-1.32, -0.12, 2.35)), Vector((-1.32, 0.90, 2.25))], 0.034, 'BambooPole', segs=9, parent=root, col=col))
    objs.append(make_tube('Awning_SideBar_Port', [Vector((-2.40, -1.11, 2.17)), Vector((-1.32, -1.11, 2.27)), Vector((-0.30, -1.08, 2.52))], 0.034, 'BambooPole', segs=9, parent=root, col=col))
    objs.append(make_tube('Awning_SideBar_Stbd', [Vector((-2.40,  0.87, 2.17)), Vector((-1.32,  0.87, 2.27)), Vector((-0.30,  0.87, 2.52))], 0.034, 'BambooPole', segs=9, parent=root, col=col))

    # 5. Aft Cream Canopy Roof & Galley Smokestack (z up to 3.12) + Stern Bamboo Flagpole
    objs.append(make_beveled_box('Aft_Canopy_Roof', (1.94, 0.18, 2.24), (0.78, 1.38, 0.075), 'RoofCream', bevel=0.018, rot=(0, math.radians(6), 0), parent=root, col=col))
    objs.append(make_beveled_box('Aft_Counter_Cabinet', (1.88, -0.22, 0.86), (0.58, 0.56, 0.56), 'CabinCoral', bevel=0.014, parent=root, col=col))
    objs.append(make_beveled_box('Aft_Counter_Top', (1.88, -0.22, 1.16), (0.64, 0.62, 0.048), 'TimberHoney', bevel=0.010, parent=root, col=col))

    # Dark Iron Galley Chimney Pipe with Rim Cap (X = +1.52, Y = +0.55, Z up to 3.12)
    chim_pts = [Vector((1.52, 0.55, 2.10)), Vector((1.52, 0.55, 2.65)), Vector((1.52, 0.55, 3.06))]
    objs.append(make_tube('Galley_Chimney_Pipe', chim_pts, 0.115, 'IronCharcoal', segs=14, parent=root, col=col))
    objs.append(make_tube('Galley_Chimney_Collar', [Vector((1.52, 0.55, 2.82)), Vector((1.52, 0.55, 2.90))], 0.138, 'TimberHoney', segs=14, parent=root, col=col))
    objs.append(make_tube('Galley_Chimney_Cap', [Vector((1.52, 0.55, 3.04)), Vector((1.52, 0.55, 3.12))], 0.148, 'IronCharcoal', segs=14, parent=root, col=col))

    # 6. Prominent Storefront Signboard "CHỢ MÈO 🐾" on Y=- Cabin Eaves
    objs.append(make_beveled_box('Sign_Frame_Outer', (0.72, -0.62, 2.24), (1.36, 0.07, 0.42), 'TimberDark', bevel=0.012, rot=(math.radians(5), 0, 0), parent=root, col=col))
    objs.append(make_beveled_box('Sign_Face_Cream', (0.72, -0.645, 2.24), (1.26, 0.04, 0.33), 'SignBoard', bevel=0.008, rot=(math.radians(5), 0, 0), parent=root, col=col))
    # 3D Text "CHỢ MÈO" extruded cleanly and converted to mesh
    import bpy
    bpy.ops.object.text_add(location=(0.60, -0.672, 2.18), rotation=(math.radians(95), 0, 0))
    txt_obj = bpy.context.object
    txt_obj.data.body = "CHỢ MÈO"
    txt_obj.data.size = 0.19
    txt_obj.data.extrude = 0.018
    txt_obj.data.bevel_depth = 0.003
    txt_obj.data.align_x = 'CENTER'
    bpy.ops.object.convert(target='MESH')
    from boat_core import link_obj
    objs.append(link_obj(txt_obj, parent=root, col=col, mat='SignInk', smooth=True))
    # Cute 3D Paw Emblem on right side of signboard
    objs.append(make_beveled_box('Sign_Paw_Pad', (1.18, -0.672, 2.22), (0.075, 0.024, 0.062), 'SignInk', bevel=0.018, parent=root, col=col))
    for dx_p, dz_p in ((-0.042, 0.048), (-0.014, 0.062), (0.016, 0.062), (0.042, 0.048)):
        objs.append(make_beveled_box(f'Sign_Paw_Toe_{dx_p:.2f}', (1.18 + dx_p, -0.672, 2.22 + dz_p), (0.026, 0.024, 0.032), 'SignInk', bevel=0.008, parent=root, col=col))
    return objs
