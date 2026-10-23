"""Authored working-boat details: layered paint, safety gear, rigging and shop signs."""
import math
import bpy
from mathutils import Vector
from boat_core import make_mesh,make_tube,make_beveled_box,make_lathe,link_obj
from boat_hull import section_point

def build_details(root,col):
    objs=[]
    def box(name,loc,size,mat='TimberWarm',rot=(0,0,0),bevel=.008):
        o=make_beveled_box(name,loc,size,mat,bevel=bevel,segs=3,rot=rot,parent=root,col=col);objs.append(o);return o
    def tube(name,pts,r=.009,mat='RopeHemp',closed=False):
        o=make_tube(name,pts,r,mat,segs=8,closed=closed,parent=root,col=col);objs.append(o);return o
    def ring(name,center,radius,tube_radius,mat='SignBoard',start=0,end=math.tau):
        x,y,z=center
        return tube(name,[(x+radius*math.cos(a),y,z+radius*math.sin(a)) for a in [start+(end-start)*i/48 for i in range(49)]],tube_radius,mat,end-start>6.2)
    def label(name,text,loc,size=.075,mat='SignInk'):
        bpy.ops.object.text_add(location=loc,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=name
        o.data.body=text;o.data.size=size;o.data.align_x='CENTER';o.data.extrude=.001;o.data.bevel_depth=.0005
        bpy.ops.object.convert(target='MESH');objs.append(link_obj(o,parent=root,col=col,mat=mat))
    # Window surrounds and open shutters establish depth rather than a flat wall.
    for y in (-.21,.60):box('Aft_Window_Vertical',(1.64,y,1.73),(.07,.055,.55),'PaintTeal')
    for z in (1.46,1.99):box('Aft_Window_Sill',(1.64,.20,z),(.13,.90,.055),'PaintTeal')
    box('Aft_Window_Mullion',(1.645,.20,1.74),(.045,.035,.51),'TimberHoney')
    for y,angle in ((-.31,-.32),(.73,.32)):
        box('Aft_Open_Shutter',(1.76,y,1.73),(.28,.16,.48),'PaintTeal',rot=(0,0,angle))
        for i in range(5):box('Shutter_Louvre',(1.91,y,1.57+i*.078),(.015,.135,.025),'PaintTealLight',rot=(0,0,angle))
        for z in (1.56,1.91):box('Shutter_Hinge',(1.67,y,z),(.08,.03,.035),'IronCharcoal')
    # A small circular viewing window replaces the blank rectangular panel.
    for o in list(root.children_recursive):
        if o.name.startswith('Cabin_Peek_Window'):bpy.data.objects.remove(o,do_unlink=True)
    ring('Porthole_Brass',(-.01,-.512,1.52),.115,.017,'BrassWarm')
    disk=make_lathe('Porthole_Glass',[(0,0),(.099,0),(.099,.006),(0,.006)],40,'WindowBlue',loc=(-.01,-.51,1.52),rot=(math.pi/2,0,0),parent=root,col=col);objs.append(disk)
    tube('Porthole_Glint',[(-.072,-.521,1.56),(-.02,-.521,1.60)],.006,'RoofCream')
    # Painted cladding, slight irregularity, repairs and visible fastening points.
    for k in range(8):
        x=.28+k*.15
        box('Cabin_Apron_Cladding',(x,-.501,.81),(.14,.018,.41),'CabinCoral' if k%3 else 'PaintOchre',bevel=.003)
        for z in (.66,.96):
            box('Cabin_Nail',(x,-.514,z),(.008,.008,.008),'IronCharcoal',bevel=.003)
    for x in (-.15,.13,1.44,1.54):
        for z in (1.08,1.28,1.73,1.97):
            verts=[(x-.005,-.502,z-.024),(x+.003,-.502,z-.018),(x+.008,-.502,z+.017),(x-.002,-.502,z+.028)]
            objs.append(make_mesh('Cabin_Paint_Chip',verts,[(0,1,2,3)],'TimberWarm',root,col,smooth=False))
    # Life ring, four wraps, curved external safety line and functional suspension.
    for idx,(x,y,z,r) in enumerate(((2.12,-1.28,.62,.20),(.48,-1.43,.39,.185))):
        ring('LifeRing'+str(idx),(x,y,z),r,.041)
        ring('LifeRing_Rope'+str(idx),(x,y-.005,z),r+.065,.010,'RopeHemp')
        for k in range(4):
            a=k*math.pi/2
            ring('LifeRing_Band'+str(idx)+str(k),(x,y,z),r,.043,'FlagCoral',a-.17,a+.17)
        tube('LifeRing_Hanger'+str(idx),[(x-.07,y+.03,z+r),(x,y+.10,1.0),(x+.07,y+.03,z+r)],.010)
    # Side ladder leading to the small service canopy, with pale worn tread tops.
    for side in (-1,1):tube('Aft_Ladder_Rail'+str(side),[(2.24,.38+side*.16,.58),(1.76,.38+side*.16,2.28)],.025,'TimberDark')
    for i in range(7):
        t=i/6;x=2.24-.48*t;z=.61+1.62*t
        tube('Ladder_Tread'+str(i),[(x,.20,z),(x,.56,z)],.025,'TimberHoney')
    # A coiled working rope and mooring cleats on the bow deck.
    for k in range(4):
        pts=[(-2.48+(.11+k*.027)*math.cos(a),.10+(.11+k*.027)*math.sin(a),.70+.005*k) for a in [i*math.tau/40 for i in range(41)]]
        tube('Bow_Rope_Coil'+str(k),pts,.011,closed=True)
    for x,side in ((-2.20,-1),(2.35,1)):
        p=section_point(x/3.2,side,z_Lift=.08)
        box('Mooring_Cleat_Base',p,(.17,.08,.035),'IronCharcoal')
        tube('Mooring_Cleat',[(p.x-.12,p.y,p.z+.065),(p.x+.12,p.y,p.z+.065)],.018,'IronCharcoal')
    # Stern net: sagged mesh tied to two posts; no flat opaque panel.
    for y in (-.40,.45):tube('Stern_Net_Post',[(2.49,y,.65),(2.49,y,1.22)],.025,'PaintTeal')
    for i in range(8):
        y=-.40+i*.85/7;sag=.09*math.sin(math.pi*i/7)
        tube('Net_Warp'+str(i),[(2.49,y,.74),(2.505,y,.94-sag),(2.49,y,1.19-sag)],.0035)
    for i in range(5):
        z=.75+i*.11
        tube('Net_Weft'+str(i),[(2.49,-.40+.85*j/12,z-.09*math.sin(math.pi*j/12)) for j in range(13)],.0035)
    # Colourful little signal flags suspended over the rear roof, away from the face.
    line=[(1.13,-.05,3.21),(1.72,-.06,3.07),(2.35,-.03,3.25)]
    tube('Signal_Flag_Line',line,.007)
    for k in range(5):
        x=1.24+k*.22;z=3.21-.14*math.sin((x-1.13)/1.22*math.pi)
        verts=[(x,-.06,z),(x+.16,-.06,z+.003),(x+.15,-.072,z-.15),(x+.083,-.08,z-.11),(x+.01,-.069,z-.15)]
        objs.append(make_mesh('Signal_Fabric'+str(k),verts,[(0,1,2,3,4)],('FlagCoral','PaintTeal','PaintOchre')[k%3],root,col,smooth=False))
    # Two stitched cloth menu tabs and handwritten price labels on the crates.
    for i,(x,text) in enumerate(((-1.46,'CAM'),(-.47,'THANH LONG'),(.10,'CHUỐI'))):
        box('Crate_Price_Tag'+str(i),(x,-1.073,1.12),(.22,.009,.095),'SignBoard',rot=(0,-.03+i*.026,0),bevel=.005)
        label('Price_Label'+str(i),text,(x,-1.080,1.126),.027)
        label('Price_Value'+str(i),('3 xu','5 xu','2 xu')[i],(x,-1.081,1.087),.026)
    for i,x in enumerate((.48,1.04)):
        verts=[];faces=[]
        for row in range(9):
            t=row/8
            for j in range(7):
                u=j/6
                verts.append((x+(u-.5)*.28,-.56+.015*math.sin(u*8+t*4),2.04-.30*t-.015*math.sin(u*math.pi)))
        for row in range(8):
            for j in range(6):
                a=row*7+j;faces.append((a,a+1,a+8,a+7))
        objs.append(make_mesh('Shop_Menu_Cloth'+str(i),verts,faces,'AwningCloth',root,col))
        tube('Menu_Hanging_Rod'+str(i),[(x-.17,-.55,2.06),(x+.17,-.55,2.06)],.009,'TimberDark')
        label('Menu_Tea'+str(i),('TRÀ','CÀ PHÊ')[i],(x,-.585,1.93),.042)
    # A modest fish-shaped shop crest, inspired by the fishing shop reference.
    outline=[(-.40,0),(-.30,.11),(-.12,.17),(.13,.14),(.28,.055),(.40,.16),(.39,-.16),(.27,-.055),(.09,-.15),(-.16,-.13),(-.34,-.07)]
    verts=[(.72+x,-.72+d,2.84+z) for d in (0,.055) for x,z in outline];n=len(outline)
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    fish=make_mesh('Fish_Shop_Crest',verts,faces,'PaintTeal',root,col,smooth=False);objs.append(fish)
    for i,x in enumerate((.62,.74,.86)):
        tube('Fish_Crest_Scale'+str(i),[(x,-.725,2.92),(x+.035,-.725,2.84),(x,-.725,2.76)],.008,'PaintTealLight')
    ring('Fish_Crest_Eye',(.45,-.73,2.88),.020,.009,'SignBoard')
    tube('Fish_Crest_Support',[(.72,-.66,2.46),(.72,-.66,2.83)],.018,'BrassWarm')
    # A repaired canvas patch: seams read as stitches at close range.
    patch=box('Awning_Repair_Patch',(-1.81,-.64,2.37),(.27,.20,.009),'AwningStripe',rot=(.06,-.20,.08),bevel=.004)
    for i in range(6):
        x=-1.93+i*.048
        tube('Canvas_Stitch'+str(i),[(x,-.73,2.39),(x+.012,-.71,2.39)],.0027,'TimberDark')
    # Roof edge hardware and a few intentionally different counter paint planks.
    for k,x in enumerate((-.97,-.73,.47,.71)):
        box('Counter_Painted_Repair'+str(k),(x,-1.069,.78),(.219,.012,.38),('PaintTeal','PaintTealLight','PaintOchre','FlagCoral')[k],bevel=.005)
    return objs
