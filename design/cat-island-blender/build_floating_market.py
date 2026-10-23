"""Original Cat Island art study. Run with Blender --background --python this_file.
No third-party assets. Reference images guide palette, silhouettes and lighting only.
"""
import bpy, math, random, json
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parent
random.seed(18)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name != 'Collection': bpy.data.collections.remove(c)

def material(name, hexcolor, roughness=.8):
    h=hexcolor.lstrip('#'); srgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb]
    m=bpy.data.materials.new(name); m.diffuse_color=(*rgb,1); m.use_nodes=True
    bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if bs is None:
        bs=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        output=m.node_tree.nodes.new('ShaderNodeOutputMaterial')
        m.node_tree.links.new(bs.outputs['BSDF'],output.inputs['Surface'])
    bs.inputs['Base Color'].default_value=(*rgb,1)
    bs.inputs['Roughness'].default_value=roughness
    return m

M={k:material(k,v) for k,v in {
 'Water jade':'68B5AC','Water light':'B9DED0','Ground warm':'E6DAB9',
 'Sand':'D5B98B','Grass':'A7BA6B','Grass light':'C7CC7F','Leaf':'6D9955',
 'Leaf bright':'A0B45D','Wood':'9E6844','Wood honey':'CD995F','Wood pale':'E5BC80',
 'Wood dark':'634737','Teal':'438E85','Teal light':'89BBB0','Coral':'CC7057',
 'Canvas':'F4D79A','Canvas stripe':'DB8A60','Cream cat':'F7E4BE','Orange cat':'D59A60',
 'Gray cat':'879BA0','White':'FFF3D8','Ink':'393C38','Pink':'D58C87',
 'Orange':'F1AD42','Tomato':'D76F4D','Green fruit':'A4BD61','Pot':'B77A5E',
 'Paper':'F8E8BF','Gold':'D9B454','Flower':'EFE0A2'
}.items()}
collection=None
def group(name):
    global collection
    collection=bpy.data.collections.new(name); bpy.context.scene.collection.children.link(collection)
def assign(o,name,mat):
    o.name=name
    for c in list(o.users_collection): c.objects.unlink(o)
    collection.objects.link(o)
    if mat:o.data.materials.append(M[mat])
    return o
def bevel(o,w=.04):
    mod=o.modifiers.new('Soft toy edges','BEVEL');mod.width=w;mod.segments=2
    mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o
def box(name,loc,dim,mat,edge=.035):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object
    o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    assign(o,name,mat)
    if edge:bevel(o,edge)
    return o
def ball(name,loc,scale,mat,segments=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=8,location=loc)
    o=bpy.context.object;o.scale=scale;assign(o,name,mat)
    for p in o.data.polygons:p.use_smooth=True
    return o
def ico(name,loc,scale,mat):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=loc)
    o=bpy.context.object;o.scale=scale;return assign(o,name,mat)
def cylinder(name,loc,radius,depth,mat,vertices=12,r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=radius,radius2=radius if r2 is None else r2,depth=depth,location=loc)
    return assign(bpy.context.object,name,mat)
def beam(name,a,b,r,mat):
    a,b=Vector(a),Vector(b);o=cylinder(name,(a+b)/2,r,(b-a).length,mat)
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def curve(name,pts,thickness,mat):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=thickness;data.bevel_resolution=2
    spl=data.splines.new('BEZIER');spl.bezier_points.add(len(pts)-1)
    for p,co in zip(spl.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,data);collection.objects.link(o);data.materials.append(M[mat]);return o
def mesh(name,verts,faces,mat):
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update()
    o=bpy.data.objects.new(name,d);collection.objects.link(o);d.materials.append(M[mat]);return o
def parent_since(name,objects,loc,angle=0):
    p=bpy.data.objects.new(name,None);collection.objects.link(p)
    for o in objects:o.parent=p
    p.location=loc;p.rotation_euler.z=angle
    return p
def canoe(name,L,W,mat='Wood honey'):
    outline=[(-L/2,0),(-L*.34,-W*.48),(L*.29,-W*.5),(L/2,-W*.12),(L/2,W*.12),(L*.29,W*.5),(-L*.34,W*.48)]
    verts=[]
    for scale,z in [(.68,.04),(1,.49),(.88,.49),(.65,.19)]:verts.extend((x*scale,y*scale,z) for x,y in outline)
    n=len(outline);faces=[]
    for j in range(3):
        for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    faces.append(tuple(range(3*n,4*n)))
    o=mesh(name+' | solid hull',verts,faces,mat);bevel(o,.035)
    for i in range(n):
        a=outline[i];b=outline[(i+1)%n]
        beam(name+' | gunwale',(a[0],a[1],.51),(b[0],b[1],.51),.055,'Wood pale')
    for x in [-L*.22,0,L*.22]:box(name+' | cross seat',(x,0,.35),(.17,W*.72,.10),'Wood')
    return outline

def cat(name,x,y,z,color='Cream cat',s=1,hat=False):
    # Faces look towards -Y, into the camera and toward the customers.
    def B(label,p,sc,m):return ball(name+' | '+label,(x+p[0]*s,y+p[1]*s,z+p[2]*s),tuple(v*s for v in sc),m)
    B('pear body',(0,0,.37),(.30,.24,.40),color)
    B('chest',(0,-.205,.35),(.20,.045,.25),'White')
    B('head',(0,-.015,.86),(.39,.29,.33),color)
    for sign in [-1,1]:
        o=cylinder(name+' | ear',(x+sign*.25*s,y,z+1.12*s),.16*s,.34*s,color,3,r2=0);o.rotation_euler.y=sign*.17
        o=cylinder(name+' | inner ear',(x+sign*.25*s,y-.055*s,z+1.12*s),.09*s,.22*s,'Pink',3,r2=0)
        B('paw',(sign*.21,-.13,.06),(.13,.18,.10),color)
        B('eye',(sign*.145,-.288,.91),(.039,.025,.053),'Ink')
        B('eye sparkle',(sign*.145-.01,-.31,.93),(.010,.008,.014),'White')
        B('cheek',(sign*.23,-.27,.81),(.067,.018,.035),'Pink')
        for offset in [-.035,.025]:beam(name+' | whisker',(x+sign*.24*s,y-.29*s,z+(.79+offset)*s),(x+sign*.42*s,y-.30*s,z+(.80+offset)*s),.008*s,'Wood dark')
    B('muzzle L',(-.065,-.277,.79),(.09,.045,.06),'White');B('muzzle R',(.065,-.277,.79),(.09,.045,.06),'White')
    B('nose',(0,-.331,.83),(.035,.021,.026),'Pink')
    curve(name+' | curled tail',[(x+.2*s,y+.1*s,z+.2*s),(x+.5*s,y+.16*s,z+.25*s),(x+.52*s,y+.15*s,z+.57*s),(x+.40*s,y+.1*s,z+.62*s)],.065*s,color)
    box(name+' | teal apron',(x,y-.225*s,z+.35*s),(.36*s,.04*s,.33*s),'Teal',.04*s)
    if hat:
        cylinder(name+' | conical hat',(x,y,z+1.25*s),.47*s,.27*s,'Canvas',16,r2=.035*s)
        cylinder(name+' | hat rim',(x,y,z+1.12*s),.48*s,.025*s,'Wood pale',16)

def crate(name,x,y,z,w=.65):
    box(name+' | bottom',(x,y,z+.035),(w,w*.72,.07),'Wood',.015)
    for level in range(3):
        zz=z+.10+level*.11
        for sign in [-1,1]:
            box(name+' | slat',(x,y+sign*w*.35,zz),(w,.055,.085),'Wood pale',.012)
            box(name+' | end',(x+sign*w*.46,y,zz),(.055,w*.72,.085),'Wood honey',.012)
def produce(name,x,y,z,w=.65,kind='Orange'):
    crate(name,x,y,z,w)
    for dx,dy in [(-.18,-.12),(.02,-.13),(.19,-.10),(-.14,.08),(.10,.08)]:
        ball(name+' | fruit',(x+dx*w/.65,y+dy*w/.65,z+.32),(.11,.105,.11),kind,12)
        beam(name+' | stem',(x+dx*w/.65,y+dy*w/.65,z+.40),(x+dx*w/.65+.015,y+dy*w/.65,z+.45),.012,'Leaf')
def pot(name,x,y,z,s=.3):
    cylinder(name+' | terracotta',(x,y,z+s*.45),s*.40,s*.9,'Pot',12,r2=s*.53)
    cylinder(name+' | rim',(x,y,z+s*.88),s*.55,s*.14,'Pot')
    for i in range(5):
        a=i*math.tau/5;tip=(x+math.cos(a)*s*.6,y+math.sin(a)*s*.6,z+s*1.7)
        beam(name+' | stalk',(x,y,z+s*.9),tip,.014,'Leaf')
        ico(name+' | foliage',tip,(s*.35,s*.25,s*.5),'Leaf bright')
def ring(name,x,y,r,z):
    pts=[(x+math.cos(a)*r,y+math.sin(a)*r,z) for a in [i*math.tau/32 for i in range(33)]]
    return curve(name,pts,.015,'Water light')

group('00 | River diorama')
box('Warm studio floor',(0,0,-.75),(200,200,.15),'Ground warm',0)
box('Rounded jade river tile',(0,.5,-.31),(15.0,12.0,.6),'Water jade',.45)
# Ripples are sparse and kept away from the faces and readable play space.
for x,y,r in [(-5,-3.4,.3),(-4.3,-3.8,.18),(4.8,-3.2,.35),(5.3,2.2,.3),(-5.8,2,.25),(1.6,-4.2,.4)]:
    curve('River glint',[(x-r,y,.017),(x,y+.04,.017),(x+r,y,.017)],.018,'Water light')

group('01 | Main market boat')
start=set(bpy.data.objects)
canoe('Market boat',6.0,2.6,'Teal')
for i in range(17):
    x=-2.35+i*.29;box('Warm deck plank',(x,0,.32),(.275,1.75,.08),'Wood honey',.015)
box('Serving counter',(.25,-.74,.83),(3.5,.50,.17),'Wood pale',.045)
for x in [-1.35,1.85]:box('Counter leg',(x,-.70,.58),(.10,.13,.45),'Wood',.018)
cat('Mochi | market owner',-.45,-.10,.38,'Cream cat',1.03)
produce('Orange crate',.78,-.68,.94,.63,'Orange')
produce('Tomato crate',1.52,-.68,.94,.59,'Tomato')
crate('Parcel crate',-1.20,-.67,.94,.52)
for i in range(2):
    box('Wrapped parcel',(-1.32+i*.22,-.68,1.20),(.19,.25,.16),'Paper',.025)
    box('Parcel ribbon',(-1.32+i*.22,-.68,1.29),(.025,.255,.012),'Coral',.004)
pot('Basil on stern',-2.05,.37,.45,.37)
# Awning sits at the back: the shopkeeper and counter remain visible.
for x in [-1.65,1.35]:
    for y in [.17,.95]:beam('Awning bamboo post',(x,y,.4),(x,y,2.68),.045,'Wood honey')
for i in range(10):
    x=-1.84+i*.34
    mat='Canvas' if i%2==0 else 'Canvas stripe'
    verts=[(x,-.03,2.61),(x+.34,-.03,2.61),(x+.34,.58,2.91),(x,.58,2.91),(x,1.18,2.61),(x+.34,1.18,2.61)]
    o=mesh('Striped cloth canopy',verts,[(0,1,2,3),(3,2,5,4)],mat)
    mod=o.modifiers.new('Canvas thickness','SOLIDIFY');mod.thickness=.035
    ball('Scalloped canopy edge',(x+.17,-.03,2.57),(.18,.04,.09),mat,12)
beam('Canopy ridge',(-1.9,.58,2.91),(1.6,.58,2.91),.045,'Wood')
# Product hanging on a tall pole evokes the Vietnamese cay beo.
beam('Cay beo | product pole',(-2.35,.35,.38),(-2.35,.35,3.22),.045,'Wood honey')
curve('Cay beo | hanging cord',[(-2.35,.35,3.16),(-2.12,.35,3.05),(-2.1,.35,2.87)],.018,'Wood dark')
ball('Cay beo | pineapple',(-2.1,.35,2.69),(.17,.17,.24),'Orange',12)
for i in range(5):
    a=i*math.tau/5;ico('Pineapple crown',(-2.1+math.cos(a)*.08,.35+math.sin(a)*.08,2.96),(.045,.06,.18),'Leaf')
for x in [-1.6,1.9]:
    bpy.ops.mesh.primitive_torus_add(major_radius=.20,minor_radius=.065,major_segments=16,minor_segments=8,location=(x,-1.20,.35),rotation=(math.pi/2,0,0));assign(bpy.context.object,'Woven rope bumper','Wood pale')
main=parent_since('MARKET | movable assembly',set(bpy.data.objects)-start,(-.1,-1.55,0),math.radians(-6))

group('02 | Customer boats and cats')
for name,loc,ang,color,hat in [
 ('Cinnamon | fruit customer',(-4.35,-.90,0),-25,'Orange cat',True),
 ('Miso | tea customer',(3.90,.05,0),25,'Gray cat',False),
 ('Peach | flower trader',(-2.65,2.20,0),-9,'White',True)]:
    start=set(bpy.data.objects);canoe(name,2.65,1.12)
    cat(name,-.25,0,.36,color,.66,hat)
    box('Boat bench cushion',(-.25,0,.37),(.65,.65,.13),'Coral',.07)
    if 'flower' in name:
        pot('Flower cargo',.55,0,.34,.35)
        for j in range(4):ball('Small cream blossom',(.55+random.uniform(-.2,.2),random.uniform(-.2,.2),1.00),(.09,.09,.07),'Flower',10)
    else:
        crate('Customer basket',.62,0,.34,.45)
    beam('Paddle shaft',(-.35,.55,.7),(.65,.85,.08),.023,'Wood')
    o=box('Paddle blade',(.66,.86,.08),(.38,.14,.055),'Wood pale',.05);o.rotation_euler.z=.3
    parent_since(name+' | movable assembly',set(bpy.data.objects)-start,loc,math.radians(ang))

group('03 | Island and learning nook')
# Broad, beveled island forms; fewer details than a full landscape level.
cylinder('Island sand',(2.15,3.5,.07),2.65,.36,'Sand',12,r2=2.55)
cylinder('Island grassy top',(2.15,3.5,.28),2.42,.18,'Grass',12,r2=2.40)
# Dock points from the island towards the market.
for i in range(12):box('Dock plank',(1.3,1.50+i*.16,.30),(1.25,.145,.12),'Wood pale',.025)
for x in [.78,1.82]:
    for y in [1.55,3.15]:
        cylinder('Dock piling',(x,y,.25),.075,.9,'Wood');cylinder('Dock cap',(x,y,.71),.09,.06,'Wood honey')
        cylinder('Dock rope wrap',(x,y,.59),.084,.07,'Canvas')
# Tiny reading shelter with an open book, not a complex second shop.
box('Reading platform',(2.7,3.6,.55),(1.9,1.4,.22),'Wood honey',.05)
for x in [1.82,3.58]:
    for y in [3.0,4.2]:beam('Shelter post',(x,y,.6),(x,y,2.25),.05,'Wood')
verts=[(1.5,2.8,2.18),(3.9,2.8,2.18),(3.9,3.6,2.85),(1.5,3.6,2.85),(1.5,4.4,2.18),(3.9,4.4,2.18)]
roof=mesh('Terracotta shelter roof',verts,[(0,1,2,3),(3,2,5,4)],'Coral');mod=roof.modifiers.new('Roof thickness','SOLIDIFY');mod.thickness=.1
for i in range(12):beam('Roof tile ridge',(1.54+i*.21,2.8,2.21),(1.54+i*.21,3.6,2.88),.02,'Canvas stripe')
box('Reading table',(2.65,2.87,.92),(1.1,.65,.11),'Wood pale',.035)
for x in [2.23,3.07]:box('Table leg',(x,2.87,.73),(.08,.4,.4),'Wood',.02)
for sign in [-1,1]:
    o=box('Open field journal',(2.65+sign*.12,2.80,1.006),(.24,.32,.025),'Paper',.008);o.rotation_euler.y=sign*-.12
    for j in range(3):box('Book ink line',(2.65+sign*.12,2.74+j*.06,1.027),(.14,.008,.004),'Wood honey',0)
pot('Reading nook fern',3.45,2.8,.66,.3)
# Rounded faceted fruit trees, restrained palette and large readable shapes.
for n,x,y,s in [('Orange tree',.35,4.0,1.10),('Shade tree',4.0,4.15,.85)]:
    beam(n+' trunk',(x,y,.35),(x,y,1.85*s),.12,'Wood')
    for dx,dy,dz in [(-.4,0,1.9),(.35,.05,2.1),(0,.1,2.5)]:
        ico(n+' crown',(x+dx*s,y+dy*s,dz*s),(.78*s,.65*s,.68*s),'Leaf bright' if dz>2 else 'Leaf')
    if 'Orange' in n:
        for dx,dy,dz in [(-.45,-.43,1.85),(.18,-.50,2.1),(.5,-.35,2.15),(-.1,-.40,2.6)]:ball('Tree orange',(x+dx*s,y+dy*s,dz*s),(.11,.11,.11),'Orange',12)
for x,y in [(4.1,2.7),(.35,3.0),(.9,4.7),(3.5,4.85)]:
    for j in range(4):
        ico('Low island planting',(x+random.uniform(-.2,.2),y+random.uniform(-.2,.2),.48),(.22,.18,.18),'Leaf bright')

group('04 | Water life')
for x,y in [(-5.7,3.8),(-5.3,3.45),(5.6,3.0),(5.3,3.4),(4.9,-2.5)]:
    cylinder('Floating lotus leaf',(x,y,.026),random.uniform(.14,.23),.015,'Leaf',10)
for x,y in [(5.5,3.1),(-5.65,3.85)]:
    for i in range(6):
        a=i*math.tau/6;ball('Lotus petal',(x+.09*math.cos(a),y+.09*math.sin(a),.09),(.08,.045,.06),'Pink',10)
    ball('Lotus center',(x,y,.12),(.045,.045,.04),'Gold',10)

group('05 | Camera and lighting')
scene=bpy.context.scene
world=bpy.data.worlds.new('Warm pastel atmosphere');scene.world=world;world.use_nodes=True
bg=next((n for n in world.node_tree.nodes if n.type=='BACKGROUND'),None)
if bg is None:
    bg=world.node_tree.nodes.new('ShaderNodeBackground');wo=world.node_tree.nodes.new('ShaderNodeOutputWorld');world.node_tree.links.new(bg.outputs['Background'],wo.inputs['Surface'])
bg.inputs[0].default_value=(.76,.84,.83,1)
bg.inputs[1].default_value=.65
def area(name,loc,power,size,color):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    o=bpy.data.objects.new(name,data);collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Soft morning key',(-5,-7,12),1700,7,(1,.85,.65))
area('Sky fill',(6,2,9),1000,9,(.76,.90,1))
data=bpy.data.cameras.new('Isometric market camera');camera=bpy.data.objects.new('Isometric market camera',data);collection.objects.link(camera)
camera.location=(11,-16,15);target=Vector((0,.65,.8));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=17.7;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True;scene.cycles.max_bounces=5
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.render.filepath=str(OUT/'floating-market-style-study.png')
close_data=data.copy();close_data.name='Shopkeeper detail camera';close_data.ortho_scale=8.8
close_camera=bpy.data.objects.new('Shopkeeper detail camera',close_data);collection.objects.link(close_camera)
close_target=Vector((-.35,-1.30,1.05));close_camera.location=close_target+Vector((7,-11,8.5));close_camera.rotation_euler=(close_target-close_camera.location).to_track_quat('-Z','Y').to_euler()
scene['Project']='VokabelGo | Dao Meo - Cho Noi'
scene['Scope']='Original Blender art study, not gameplay implementation. Modular boats, cats, island and props.'
scene['References']='User supplied five images: warm low-poly props, pastel boats, soft orthographic garden lighting.'
scene['Web_delivery']='Render-ready scene; mesh optimization and web export are a separate production step.'
for screen in bpy.data.screens:
    for ar in screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.region_3d.view_perspective='CAMERA'
            ar.spaces.active.shading.type='MATERIAL'
bpy.ops.object.select_all(action='DESELECT')
bpy.context.view_layer.objects.active=main
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'cat-island-floating-market.blend'))
stats={'objects':len(scene.objects),'mesh_objects':sum(o.type=='MESH' for o in scene.objects),'base_mesh_polygons':sum(len(o.data.polygons) for o in scene.objects if o.type=='MESH'),'blender_version':bpy.app.version_string}
(OUT/'scene-manifest.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print('CAT_MARKET_SCENE_SAVED',json.dumps(stats),flush=True)
bpy.ops.render.render(write_still=True)
scene.camera=close_camera
scene.render.filepath=str(OUT/'floating-market-shopkeeper-detail.png')
bpy.ops.render.render(write_still=True)
print('CAT_MARKET_RENDER_COMPLETE',flush=True)
