"""Editable native 2D cutout study. Run with Blender --background --python this_file."""
import bpy, math
from mathutils import Vector, Matrix
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'
W, H, FPS = 1000, 562.8, 24
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280
scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.render.fps=FPS
scene.frame_start=1
scene.frame_end=480
scene.view_settings.view_transform='Standard'
scene.view_settings.look='None'
scene.render.image_settings.file_format='PNG'
scene.world.color=(0.2,0.5,0.5)

def point(x,y,z=0): return ((x-W/2)/100,(H/2-y)/100,z)
def empty(name,x=None,y=None,parent=None):
    obj=bpy.data.objects.new(name,None)
    scene.collection.objects.link(obj)
    if x is not None: obj.location=point(x,y)
    if parent: attach(obj,parent)
    return obj
def attach(obj,parent):
    bpy.context.view_layer.update()
    world=obj.matrix_world.copy()
    obj.parent=parent
    obj.matrix_world=world

def material(name,color=None,image=None,opacity=1):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes
    nodes.clear()
    out=nodes.new('ShaderNodeOutputMaterial')
    emit=nodes.new('ShaderNodeEmission')
    transparent=nodes.new('ShaderNodeBsdfTransparent')
    mix=nodes.new('ShaderNodeMixShader')
    mat.node_tree.links.new(transparent.outputs[0],mix.inputs[1])
    mat.node_tree.links.new(emit.outputs[0],mix.inputs[2])
    mat.node_tree.links.new(mix.outputs[0],out.inputs['Surface'])
    if image:
        tex=nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(image),check_existing=True)
        tex.image.pack()
        mat.node_tree.links.new(tex.outputs['Color'],emit.inputs['Color'])
        mat.node_tree.links.new(tex.outputs['Alpha'],mix.inputs[0])
    else:
        emit.inputs['Color'].default_value=(*color[:3],1)
        mix.inputs[0].default_value=opacity
    mat.surface_render_method='DITHERED'
    return mat

def plane(name,asset,x,y,w,h,z,parent=None):
    mesh=bpy.data.meshes.new(name+' mesh')
    mesh.from_pydata([(-w/200,h/200,0),(w/200,h/200,0),(w/200,-h/200,0),(-w/200,-h/200,0)],[],[(0,3,2,1)])
    uv=mesh.uv_layers.new(name='UVMap')
    coords=[(0,1),(1,1),(1,0),(0,0)]
    for face in mesh.polygons:
        for loop in face.loop_indices: uv.data[loop].uv=coords[mesh.loops[loop].vertex_index]
    obj=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(obj)
    obj.location=point(x+w/2,y+h/2,z)
    mesh.materials.append(material(name+' alpha',image=ASSETS/asset))
    if parent: attach(obj,parent)
    return obj

brown=material('facial brown',(0.19,0.075,0.029))
white=material('eye light',(1,0.97,0.86))
peach=material('flat painted blush',(1,0.46,0.34),opacity=.45)
coral=material('coral nose',(0.95,0.32,0.22))
water=material('pale water ripple',(0.70,0.96,0.94),opacity=.65)
shadowmat=material('raft soft contact shadow',(0.035,0.38,0.36),opacity=.17)

def ellipse(name,x,y,rx,ry,z,mat,parent=None):
    pts=[(rx*math.cos(i*math.tau/48)/100,ry*math.sin(i*math.tau/48)/100,0) for i in range(48)]
    mesh=bpy.data.meshes.new(name+' shape')
    mesh.from_pydata(pts,[],[tuple(range(48))])
    mesh.materials.append(mat)
    obj=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(obj)
    obj.location=point(x,y,z)
    if parent: attach(obj,parent)
    return obj

def stroke(name,points,z,mat,width=1.7,parent=None):
    curve=bpy.data.curves.new(name,'CURVE')
    curve.dimensions='3D'
    curve.bevel_depth=width/200
    curve.bevel_resolution=2
    spline=curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for p,(x,y) in zip(spline.points,points): p.co=(*point(x,y,z),1)
    obj=bpy.data.objects.new(name,curve)
    scene.collection.objects.link(obj)
    curve.materials.append(mat)
    if parent: attach(obj,parent)
    return obj

plane('00 clean pond','background.png',0,0,W,H,0)
raftroot=empty('RIG raft / independent water bob')
ellipse('contact shadow',545,369,202,35,.005,shadowmat,raftroot)
plane('01 rustic log raft','raft.png',338,258,410,164,.015,raftroot)
tailroot=empty('RIG tail',557,339,raftroot)
plane('02 caramel tip tail','tail.png',551,278,58,64,.025,tailroot)
body=plane('03 seated apron torso','body.png',465,253,101,95,.035,raftroot)
plane('04 left foot','foot-left.png',460,332,53,46,.05,raftroot)
plane('05 right foot','foot-right.png',517,335,52,49,.051,raftroot)
plane('06 fish basket','basket.png',620,274,75,76,.052,raftroot)
plane('07 worm bait tin','bait.png',596,336,30,33,.053,raftroot)

armleftroot=empty('RIG left paw shoulder',477,279,raftroot)
leftarm=plane('08 left paw','arm-left.png',467,279,22,32,.061,armleftroot)
armleftroot.rotation_euler.z=math.radians(12)
armrightroot=empty('RIG right paw shoulder',548,279,raftroot)
rightarm=plane('09 right forearm','arm-right.png',536,279,25,55,.062,armrightroot)
armrightroot.rotation_euler.z=math.radians(-62)
rodroot=empty('RIG twig rod handle',489,310,raftroot)
plane('10 twig rod','rod.png',343,203,151,107,.064,rodroot)

headroot=empty('RIG head / gaze / sleepy nod',513,218,raftroot)
plane('11 blank cream head','head.png',438,154,150,128,.07,headroot)
eyes=[]
for i,x in enumerate([486,538]):
    eye=ellipse('eye '+str(i),x,234,5.3,7.8,.081,brown,headroot)
    glint=ellipse('eye glint '+str(i),x-1.5,231.2,1.35,1.75,.082,white,headroot)
    eyes.append((eye,glint))
ellipse('left painted cheek',478,248,9,6,.079,peach,headroot)
ellipse('right painted cheek',546,248,9,6,.079,peach,headroot)
ellipse('coral nose',512,245,3.3,2.2,.083,coral,headroot)
smilepoints=[]
for center,start,end in [(506,math.pi,0),(518,math.pi,0)]:
    for i in range(13):
        t=start+(end-start)*i/12
        smilepoints.append((center+6*math.cos(t),251+5*math.sin(t)))
smile=stroke('soft double smile',smilepoints,.083,brown,1.7,headroot)
# Keep expression scaling centered on the mouth, not the scene origin.
mouth_matrix=Matrix.Translation(Vector(point(512,254,.083)))
smile.data.transform(mouth_matrix.inverted() @ smile.matrix_world)
smile.matrix_world=mouth_matrix
yawn=ellipse('small humming yawning mouth',512,255,3.6,4.8,.084,brown,headroot)
for side in [-1,1]:
    for j in range(2):
        stroke('whisker '+str(side)+' '+str(j),[(512+side*40,248+j*5),(512+side*48,246+j*7)],.08,brown,1.15,headroot)

floatroot=empty('RIG cork independent water movement',364,380)
ellipse('cork cream bottom',364,380,10,7,.025,white,floatroot)
ellipse('cork red top',364,377,9,5,.026,coral,floatroot)
ripples=[]
for i,r in enumerate([18,29,42]):
    pts=[(364+math.cos(j*math.tau/64)*r,386+math.sin(j*math.tau/64)*r*.24) for j in range(65)]
    ripples.append(stroke('cork ripple '+str(i),pts,.015,water,1.3))
line=stroke('fishing line linked rod to cork',[(354,220),(364,371)],.068,white,.85)
dragonroot=empty('RIG dragonfly / curved visit')
dragon=plane('dragonfly sprite','dragonfly.png',-15,-14,30,28,.12)
dragon.parent=dragonroot
dragon.location=(0,0,.12)

base={obj.name:obj.location.copy() for obj in [headroot,body,tailroot,armleftroot,armrightroot,rodroot,floatroot]}
eye_base={obj.name:obj.location.copy() for pair in eyes for obj in pair}
def ease(t):
    t=max(0,min(1,t)); return t*t*(3-2*t)
def window(t,a,b,c,d): return ease((t-a)/(b-a))*(1-ease((t-c)/(d-c)))
def bezier(p0,p1,p2,p3,t):
    return ((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0],(1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1])
for frame in range(1,481):
    t=(frame-1)/FPS
    scene.frame_set(frame)
    bob=1.3*math.sin(t*math.tau/4.8)+.35*math.sin(t*math.tau/2.9)
    raftroot.location=(0,bob/100,0)
    raftroot.rotation_euler.z=math.radians(.27*math.sin(t*math.tau/6.4))
    raftroot.keyframe_insert('location'); raftroot.keyframe_insert('rotation_euler')
    attention=window(t,4.2,5.5,10.4,11.8)
    sleepy=window(t,12.5,13.6,14.8,16)
    headroot.location=base[headroot.name]+Vector((attention*.008,(-.6*math.sin(t*math.tau/3.7)-sleepy*2)/100,0))
    headroot.rotation_euler.z=math.radians(.8*math.sin(t*math.tau/7.1)+attention*3.2-sleepy*3)
    headroot.keyframe_insert('location'); headroot.keyframe_insert('rotation_euler')
    body.scale.y=1+.006*math.sin(t*math.tau/3.7)
    body.keyframe_insert('scale')
    tailroot.rotation_euler.z=math.radians(1.7*math.sin(t*math.tau/5.5)+window(t,7.9,8.1,8.3,8.7)*5)
    tailroot.keyframe_insert('rotation_euler')
    blink=1
    for moment in [2.1,6.3,6.62,11.7,17.1,19.2]:
        dt=abs(t-moment)
        blink=min(blink,.045+.955*ease(dt/.115))
    blink*=1-sleepy*.68
    for pair in eyes:
        for obj in pair:
            obj.scale.y=blink
            obj.location=eye_base[obj.name]+Vector((-attention*1.8/100,attention*.45/100,0))
            obj.keyframe_insert('scale'); obj.keyframe_insert('location')
    mouth=window(t,13,13.7,14.6,15.3)
    yawn.scale=(max(.001,mouth),max(.001,mouth),1)
    yawn.keyframe_insert('scale')
    smile.scale=(max(.001,1-mouth),max(.001,1-mouth),1)
    smile.keyframe_insert('scale')
    fy=.8*math.sin(t*math.tau/2.5+.8)
    floatroot.location=base[floatroot.name]+Vector((math.sin(t*.8)*.008,fy/100,0))
    floatroot.keyframe_insert('location')
    line.data.splines[0].points[0].co=(*point(354,220-bob,.068),1)
    line.data.splines[0].points[1].co=(*point(364+math.sin(t*.8)*.8,371-fy,.068),1)
    for p in line.data.splines[0].points: p.keyframe_insert('co')
    if 4<=t<7.8:
        x,y=bezier((-30,300),(160,160),(440,170),(356,216),(t-4)/3.8)
    elif 7.8<=t<10.4:
        x,y=356+.6*math.sin(t*8),216+.35*math.sin(t*9)
    elif 10.4<=t<13:
        x,y=bezier((356,216),(470,120),(800,130),(1030,190),(t-10.4)/2.6)
    else: x,y=-100,-100
    dragonroot.location=point(x,y,0)
    dragonroot.rotation_euler.z=math.radians(5*math.sin(t*8))
    flutter=.94+.06*math.sin(t*math.tau*11) if not 7.8<t<10.4 else 1
    dragonroot.scale=(1,flutter,1)
    for channel in ['location','rotation_euler','scale']: dragonroot.keyframe_insert(channel)

# Linear densely sampled keys avoid Bezier overshoot at blinks and perch transitions.
for obj in scene.objects:
    if obj.animation_data and obj.animation_data.action:
        try:
            for fc in obj.animation_data.action.fcurves:
                for key in fc.keyframe_points: key.interpolation='LINEAR'
        except AttributeError: pass
bpy.ops.object.camera_add(location=(0,0,20))
camera=bpy.context.object
camera.name='CAMERA fixed orthographic 2D'
camera.data.type='ORTHO'
camera.data.ortho_scale=W/100
scene.camera=camera
scene.frame_set(1)
scene['description']='Editable 20-second native cutout study: idle, gaze, dragonfly perch, sleepy hum. Browser showcase has a separately authored interactive catch timeline.'
scene['art_provenance']='Built-in imagegen sprites; exact prompts and source PNGs in assets/; images packed into this file.'
scene.render.filepath=str(ROOT/'review'/'blender-frame-001.png')
(ROOT/'review').mkdir(exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'ao-co-may-cutout-v01.blend'))
bpy.ops.render.render(write_still=True)
scene.frame_set(217)
scene.render.filepath=str(ROOT/'review'/'blender-frame-217.png')
bpy.ops.render.render(write_still=True)
scene.frame_set(337)
scene.render.filepath=str(ROOT/'review'/'blender-frame-337.png')
bpy.ops.render.render(write_still=True)
print('SAVED editable packed 2D Blender cutout and rendered preview')
