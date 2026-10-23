"""Curved sampan hull, plank strakes, honey timber gunwales, beveled deck, ropes & fenders."""
import math
from mathutils import Vector
from boat_core import make_mesh, make_beveled_box, make_tube, make_lathe

def hull_station(u):
    """Return (x, half_beam_top, z_sheer, z_keel, fullness) for u in [-1, 1].
    Length = 6.4 (-3.2 to +3.2), max beam = 2.80 (half_beam = 1.40).
    Waterplane z = 0.0, submerged keel bottom z = -0.55, deck z = 0.55.
    """
    x = u * 3.20
    au = abs(u)
    # Full amidships, gracefully tapered toward bow (u=-1) and stern (u=+1)
    if au < 0.999:
        beam_env = math.pow(1.0 - math.pow(au, 2.35), 0.58)
    else:
        beam_env = 0.018
    # Slightly broader aft (+u) than bow (-u) like traditional Mekong ghe bầu
    asym = 1.0 + 0.04 * u * (1.0 - au)
    half_beam = max(0.035, 1.40 * beam_env * asym)
    # Sweeping sheer line: ~0.76 at midships, curving up to ~1.18 at bow and ~1.12 at stern
    bow_lift = 0.44 * math.pow(max(0.0, -u), 2.1)
    stern_lift = 0.38 * math.pow(max(0.0, u), 2.2)
    mid_rise = 0.14 * math.pow(au, 1.6)
    z_sheer = 0.74 + mid_rise + bow_lift + stern_lift
    # Keel line: -0.55 flat bottom amidships, curving up to bow/stern stems
    z_keel = -0.55 + 0.68 * math.pow(au, 2.8) + 0.28 * math.pow(au, 5.0)
    fullness = 0.78 - 0.22 * math.pow(au, 1.8)
    return x, half_beam, z_sheer, z_keel, fullness

def section_point(u, s, inset=0.0, z_Lift=0.0):
    """Point on hull cross-section: u in [-1,1] (length), s in [-1,1] (port -Y to starboard +Y)."""
    x, hb, z_sh, z_kl, full = hull_station(u)
    a = abs(s)
    sgn = -1.0 if s < 0 else (1.0 if s > 0 else 0.0)
    # Rounded bilge curve from keel (a=0) to gunwale (a=1)
    y_norm = math.sin(a * math.pi * 0.5) * (1.0 + 0.12 * a * (1.0 - a))
    z_norm = math.pow(a, 1.65 + (1.0 - full) * 0.6)
    y = sgn * max(0.0, hb * y_norm - inset)
    z = z_kl + (z_sh - z_kl) * z_norm + z_Lift
    # Slight longitudinal stem rake at extreme tips
    if abs(u) > 0.85:
        rake = (abs(u) - 0.85) / 0.15
        x += (-1.0 if u < 0 else 1.0) * 0.10 * rake * z_norm
    return Vector((x, y, z))

def build_hull_and_deck(root, col):
    objs = []
    nu = 36
    ns = 22
    us = [-1.0 + 2.0 * i / (nu - 1) for i in range(nu)]
    ss = [-1.0 + 2.0 * j / (ns - 1) for j in range(ns)]

    # 1. Thickened Curved Navy Hull Shell (Outer + Inner + Top Rim)
    verts, faces = [], []
    for u in us:
        for s in ss:
            p = section_point(u, s, inset=0.0, z_Lift=0.0)
            verts.append((p.x, p.y, p.z))
    for u in us:
        for s in ss:
            p = section_point(u, s, inset=0.085, z_Lift=0.055)
            verts.append((p.x, p.y, p.z))

    n_grid = nu * ns
    for i in range(nu - 1):
        for j in range(ns - 1):
            a = i * ns + j
            b = (i + 1) * ns + j
            c = (i + 1) * ns + (j + 1)
            d = i * ns + (j + 1)
            faces.append((a, b, c, d))
            faces.append((n_grid + a, n_grid + d, n_grid + c, n_grid + b))
    # Stitch port & starboard sheer rims
    for i in range(nu - 1):
        for j_rim in (0, ns - 1):
            o0 = i * ns + j_rim
            o1 = (i + 1) * ns + j_rim
            i0 = n_grid + o0
            i1 = n_grid + o1
            if j_rim == 0:
                faces.append((o0, i0, i1, o1))
            else:
                faces.append((o0, o1, i1, i0))
    # Stitch bow & stern stem ends
    for i_end in (0, nu - 1):
        for j in range(ns - 1):
            o0 = i_end * ns + j
            o1 = i_end * ns + j + 1
            i0 = n_grid + o0
            i1 = n_grid + o1
            faces.append((o0, o1, i1, i0) if i_end == 0 else (o0, i0, i1, o1))

    objs.append(make_mesh('Hull_Shell_Navy', verts, faces, 'HullNavy', parent=root, col=col, smooth=True))

    # 2. Raised Exterior Lapstrake Plank Strakes & Waterline Accent Band
    strake_levels = [
        ('Strake_Lower_1', 0.38, 0.45, 0.018, 'HullNavyDeep'),
        ('Strake_Waterline', 0.52, 0.60, 0.022, 'HullStripeBlue'),
        ('Strake_Mid_2', 0.66, 0.75, 0.020, 'HullNavy'),
        ('Strake_Upper_3', 0.80, 0.90, 0.024, 'HullStripeBlue'),
        ('Strake_Rubband_Honey', 0.91, 0.97, 0.032, 'TimberWarm'),
    ]
    for s_name, s0, s1, thick, mat_name in strake_levels:
        for side in (-1.0, 1.0):
            sv, sf = [], []
            for u in us[1:-1]:
                p_bot_in = section_point(u, side * s0, inset=0.0)
                p_bot_out = section_point(u, side * s0, inset=-thick)
                p_top_out = section_point(u, side * s1, inset=-thick * 0.85)
                p_top_in = section_point(u, side * s1, inset=0.0)
                sv.extend([(p_bot_in.x, p_bot_in.y, p_bot_in.z),
                           (p_bot_out.x, p_bot_out.y, p_bot_out.z),
                           (p_top_out.x, p_top_out.y, p_top_out.z),
                           (p_top_in.x, p_top_in.y, p_top_in.z)])
            m_u = len(us) - 2
            for i in range(m_u - 1):
                b0, b1 = i * 4, (i + 1) * 4
                for k in range(3):
                    sf.append((b0 + k, b1 + k, b1 + k + 1, b0 + k + 1))
            tag = 'Port' if side < 0 else 'Starboard'
            objs.append(make_mesh(f'{s_name}_{tag}', sv, sf, mat_name, parent=root, col=col, smooth=True))
    return objs, us

def build_gunwales_deck_fenders(root, col, us):
    objs = []
    # 3. Broad Honey Timber Gunwale Cap Rails (Port & Starboard)
    for side in (-1.0, 1.0):
        gv, gf = [], []
        for u in us:
            p_out = section_point(u, side * 1.0, inset=-0.045, z_Lift=-0.015)
            p_in  = section_point(u, side * 1.0, inset=0.105, z_Lift=-0.015)
            p_in_t = p_in + Vector((0, 0, 0.068))
            p_out_t = p_out + Vector((0, 0, 0.068))
            gv.extend([(p_out.x, p_out.y, p_out.z), (p_in.x, p_in.y, p_in.z),
                       (p_in_t.x, p_in_t.y, p_in_t.z), (p_out_t.x, p_out_t.y, p_out_t.z)])
        for i in range(len(us) - 1):
            b0, b1 = i * 4, (i + 1) * 4
            for k in range(4):
                kn = (k + 1) % 4
                gf.append((b0 + k, b1 + k, b1 + kn, b0 + kn))
        tag = 'Port' if side < 0 else 'Starboard'
        objs.append(make_mesh(f'Gunwale_Timber_{tag}', gv, gf, 'TimberHoney', parent=root, col=col, smooth=True))

    # 4. Bow & Stern Stem Timbers and Breast Hooks (matching top-right concept detail)
    for end_s, end_name in ((-1.0, 'Bow'), (1.0, 'Stern')):
        stem_pts = [section_point(end_s * 0.985, 0.0, inset=-0.03, z_Lift=z_off) for z_off in (-0.08, 0.12, 0.35, 0.58)]
        objs.append(make_tube(f'{end_name}_Stem_Post', stem_pts, 0.065, 'TimberHoney', segs=8, parent=root, col=col))
        # Curved breast-hook deck cap at bow & stern tips
        u_inner = end_s * 0.78
        u_outer = end_s * 0.97
        p_l0 = section_point(u_inner, -1.0, inset=0.04, z_Lift=0.02)
        p_r0 = section_point(u_inner,  1.0, inset=0.04, z_Lift=0.02)
        p_l1 = section_point(u_outer, -1.0, inset=0.01, z_Lift=0.03)
        p_r1 = section_point(u_outer,  1.0, inset=0.01, z_Lift=0.03)
        bv = [
            (p_l0.x, p_l0.y, p_l0.z), (p_r0.x, p_r0.y, p_r0.z), (p_r1.x, p_r1.y, p_r1.z), (p_l1.x, p_l1.y, p_l1.z),
            (p_l0.x, p_l0.y, p_l0.z+0.06), (p_r0.x, p_r0.y, p_r0.z+0.06), (p_r1.x, p_r1.y, p_r1.z+0.06), (p_l1.x, p_l1.y, p_l1.z+0.06)
        ]
        bf = [(0,1,2,3), (4,7,6,5), (0,4,5,1), (1,5,6,2), (2,6,7,3), (3,7,4,0)]
        objs.append(make_mesh(f'{end_name}_BreastHook', bv, bf, 'TimberHoney', parent=root, col=col, smooth=False))

    # 5. Broad Beveled Deck Boards at z = 0.55 (catching light between planks)
    n_planks = 12
    y_min, y_max = -1.24, 1.24
    dy = (y_max - y_min) / n_planks
    for idx in range(n_planks):
        yc = y_min + (idx + 0.5) * dy
        # Fit plank length to hull curve at this Y
        ratio = min(0.96, abs(yc) / 1.32)
        u_max = math.pow(max(0.05, 1.0 - math.pow(ratio, 1.72)), 1.0 / 2.35)
        plen = max(1.2, u_max * 6.4 * 0.89)
        mat_p = 'DeckPlank' if idx % 2 == 0 else 'DeckPlankAlt'
        plank = make_beveled_box(
            f'Deck_Plank_{idx:02d}', (0.0, yc, 0.535),
            (plen, dy - 0.014, 0.042), mat_p, bevel=0.008, segs=2, parent=root, col=col, smooth=True
        )
        objs.append(plank)
    # Transverse deck floor beams (thwarts) across the deck
    for tx in (-2.05, -1.05, -0.15, 1.55, 2.25):
        u_t = tx / 3.20
        _, hb, _, _, _ = hull_station(u_t)
        objs.append(make_beveled_box(
            f'Deck_Beam_{tx:.1f}', (tx, 0.0, 0.562),
            (0.11, hb * 1.72, 0.036), 'TimberWarm', bevel=0.007, segs=2, parent=root, col=col, smooth=True
        ))

    # 6. Rubber/Rope Fenders with Physical Rope Loops & Knots on Hull (3 on Y=- storefront, 2 on Y=+)
    fender_specs = [
        (-1.45, -1.0, 'Port_Fwd'), (0.25, -1.0, 'Port_Mid'), (1.85, -1.0, 'Port_Aft'),
        (-0.85,  1.0, 'Stbd_Fwd'), (1.25,  1.0, 'Stbd_Aft')
    ]
    fender_prof = [(0.001, -0.22), (0.08, -0.20), (0.125, -0.12), (0.135, 0.0), (0.125, 0.12), (0.08, 0.20), (0.001, 0.22)]
    band_prof   = [(0.126, -0.13), (0.146, -0.13), (0.146, -0.09), (0.126, -0.09)]
    band_prof2  = [(0.126,  0.09), (0.146,  0.09), (0.146,  0.13), (0.126,  0.13)]
    for fx, fside, ftag in fender_specs:
        u_f = fx / 3.20
        p_gun = section_point(u_f, fside * 1.0, inset=-0.02, z_Lift=0.03)
        p_hull = section_point(u_f, fside * 0.72, inset=-0.135, z_Lift=0.0)
        f_pos = (p_hull.x, p_hull.y, p_hull.z + 0.02)
        objs.append(make_lathe(f'Fender_Body_{ftag}', fender_prof, 14, 'FenderRubber', loc=f_pos, rot=(0, math.radians(8*fside), 0), parent=root, col=col))
        objs.append(make_lathe(f'Fender_BandA_{ftag}', band_prof, 14, 'RopeHemp', loc=f_pos, rot=(0, math.radians(8*fside), 0), parent=root, col=col))
        objs.append(make_lathe(f'Fender_BandB_{ftag}', band_prof2, 14, 'RopeHemp', loc=f_pos, rot=(0, math.radians(8*fside), 0), parent=root, col=col))
        # Rope from fender eye up over gunwale + visible knot & cleat
        r_pts = [
            Vector(f_pos) + Vector((0, 0, 0.20)),
            Vector((p_hull.x, p_hull.y + fside * 0.02, (p_hull.z + p_gun.z) * 0.55)),
            Vector((p_gun.x, p_gun.y - fside * 0.04, p_gun.z + 0.04)),
            Vector((p_gun.x, p_gun.y + fside * 0.06, p_gun.z + 0.02))
        ]
        objs.append(make_tube(f'Fender_Rope_{ftag}', r_pts, 0.020, 'RopeHemp', segs=8, parent=root, col=col))
        # Tied knot coil on gunwale
        knot_c = Vector((p_gun.x, p_gun.y, p_gun.z + 0.038))
        knot_pts = [knot_c + Vector((0.038*math.cos(a), 0.038*math.sin(a), 0.012*math.sin(2*a))) for a in [k*math.tau/12 for k in range(13)]]
        objs.append(make_tube(f'Fender_Knot_{ftag}', knot_pts, 0.022, 'RopeHemp', segs=7, closed=True, parent=root, col=col))

    # 7. Curved Bow & Stern Mooring Ropes physically tied to hull stem
    bow_rope_pts = [
        Vector((-2.98, 0.0, 1.15)), Vector((-3.06, -0.14, 1.05)),
        Vector((-2.92, -0.45, 0.72)), Vector((-2.62, -0.78, 0.52)),
        Vector((-2.28, -0.98, 0.68)), Vector((-2.15, -0.96, 0.86))
    ]
    objs.append(make_tube('Bow_Mooring_Rope', bow_rope_pts, 0.026, 'RopeHemp', segs=8, parent=root, col=col))
    # Thick bow stem rope collar wraps (knot)
    for kz in (1.08, 1.13, 1.18):
        wrap_pts = [Vector((-2.96 + 0.09*math.cos(a), 0.09*math.sin(a), kz)) for a in [k*math.tau/12 for k in range(13)]]
        objs.append(make_tube(f'Bow_Stem_Knot_{kz:.2f}', wrap_pts, 0.024, 'RopeHemp', segs=7, closed=True, parent=root, col=col))
    return objs
