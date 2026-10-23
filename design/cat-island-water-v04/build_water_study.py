"""Editable Blender companion to the browser boat/water study.

Run after the hero GLB exists. Native geometry nodes use the same three waves
as cat-island-water.js. This is a real 3D scene, not a background illustration.
"""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
BOAT = ROOT / 'assets/cat-island/hero-boat-v04.glb'
hull_check = '--hull-check' in sys.argv
if not BOAT.exists() and not hull_check:
    raise FileNotFoundError(f'Finish hero asset first: {BOAT}')
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1500
scene.render.resolution_y = 1100
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 240
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('Soft river morning')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.58,.69,.65,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .6

def linear(h):
    values = [int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in values)

def material(name, color, roughness):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*linear(color),1)
    mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=roughness
    return mat

if hull_check:
    sys.path.insert(0,str(ROOT/'design/cat-island-blender/v04'))
    import boat_core
    import boat_hull
    boat_core.init_materials()
    hull_root=bpy.data.objects.new('HERO_BOAT',None)
    scene.collection.objects.link(hull_root)
    _,stations=boat_hull.build_hull_and_deck(hull_root,scene.collection)
    boat_hull.build_gunwales_deck_fenders(hull_root,scene.collection,stations)
else:
    bpy.ops.import_scene.gltf(filepath=str(BOAT))
top=[obj for obj in list(scene.objects) if obj.parent is None]
rig=bpy.data.objects.new('Buoyancy · shared wave field',None)
scene.collection.objects.link(rig)
for obj in top:
    obj.parent=rig
driver=rig.driver_add('location',2).driver
driver.expression='.8*(.025*sin(-frame/24*.72)+.014*sin(-frame/24*1.04)+.006*sin(-frame/24*1.45))'
driver=rig.driver_add('rotation_euler',1).driver
driver.expression='-.8*(.025*.85*cos(-frame/24*.72)+.014*(-.52)*cos(-frame/24*1.04)+.006*2.8*cos(-frame/24*1.45))'
driver=rig.driver_add('rotation_euler',0).driver
driver.expression='-.8*(.025*.46*cos(-frame/24*.72)+.014*1.2*cos(-frame/24*1.04)+.006*1.85*cos(-frame/24*1.45))'

# Dense, smooth surface, displaced by native geometry nodes, editable at any frame.
n=160
size=22
vertices=[(-size/2+size*i/n,-size/2+size*j/n,0) for j in range(n+1) for i in range(n+1)]
faces=[]
for j in range(n):
    for i in range(n):
        a=j*(n+1)+i
        faces.append((a,a+1,a+n+2,a+n+1))
mesh=bpy.data.meshes.new('River grid')
mesh.from_pydata(vertices,[],faces)
mesh.update()
water=bpy.data.objects.new('Water · animated wave geometry',mesh)
scene.collection.objects.link(water)
for polygon in mesh.polygons:
    polygon.use_smooth=True
watermat=material('River turquoise · rough reflected surface','65B5AE',.26)
bsdf=watermat.node_tree.nodes['Principled BSDF']
bsdf.inputs['IOR'].default_value=1.333
bsdf.inputs['Metallic'].default_value=.06
bsdf.inputs['Transmission Weight'].default_value=.08
water.data.materials.append(watermat)

group=bpy.data.node_groups.new('Shared river waves · seconds, metres','GeometryNodeTree')
group.interface.new_socket(name='Geometry',in_out='INPUT',socket_type='NodeSocketGeometry')
group.interface.new_socket(name='Geometry',in_out='OUTPUT',socket_type='NodeSocketGeometry')
nodes=group.nodes
links=group.links
inp=nodes.new('NodeGroupInput')
out=nodes.new('NodeGroupOutput')
position=nodes.new('GeometryNodeInputPosition')
separate=nodes.new('ShaderNodeSeparateXYZ')
links.new(position.outputs['Position'],separate.inputs[0])
clock=nodes.new('GeometryNodeInputSceneTime')

def op(operation,a,b=None):
    node=nodes.new('ShaderNodeMath')
    node.operation=operation
    if isinstance(a,(int,float)):node.inputs[0].default_value=a
    else:links.new(a,node.inputs[0])
    if b is not None:
        if isinstance(b,(int,float)):node.inputs[1].default_value=b
        else:links.new(b,node.inputs[1])
    return node.outputs[0]

height=0
for amplitude,kx,kz,speed in [(.025,.85,.46,.72),(.014,-.52,1.2,1.04),(.006,2.8,1.85,1.45)]:
    # glTF world Z is negative Blender Y.
    phase=op('SUBTRACT',op('ADD',op('MULTIPLY',separate.outputs['X'],kx),
        op('MULTIPLY',separate.outputs['Y'],-kz)),op('MULTIPLY',clock.outputs['Seconds'],speed))
    height=op('ADD',height,op('MULTIPLY',op('SINE',phase),amplitude*.8))
offset=nodes.new('ShaderNodeCombineXYZ')
links.new(height,offset.inputs['Z'])
setpos=nodes.new('GeometryNodeSetPosition')
links.new(inp.outputs['Geometry'],setpos.inputs['Geometry'])
links.new(offset.outputs[0],setpos.inputs['Offset'])
links.new(setpos.outputs['Geometry'],out.inputs['Geometry'])
modifier=water.modifiers.new('Living river surface','NODES')
modifier.node_group=group

bedmat=material('Pale sand under water','C2CCAB',1)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.65))
bpy.context.object.name='Riverbed & studio horizon'
bpy.context.object.data.materials.append(bedmat)

def area(name,position,energy,size,color):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.shape='DISK'
    data.size=size
    data.color=linear(color)
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location=position
    obj.rotation_euler=(Vector((0,0,1))-obj.location).to_track_quat('-Z','Y').to_euler()
area('Warm soft morning',(-4,-5,9),1500,7,'FFF0D5')
area('Cool sky bounce',(4,3,6),1000,6,'D7F4F4')
camera_data=bpy.data.cameras.new('Boat and water camera')
camera=bpy.data.objects.new('Boat and water camera',camera_data)
scene.collection.objects.link(camera)
camera.location=(8,-10,7)
camera.rotation_euler=(Vector((0,0,.9))-camera.location).to_track_quat('-Z','Y').to_euler()
camera_data.type='ORTHO'
camera_data.ortho_scale=9.8
scene.camera=camera
scene.frame_set(35)
basename='hull-water-check' if hull_check else 'boat-water-study-v04'
scene.render.filepath=str(OUT/(basename+'.png'))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(basename+'.blend')))
bpy.ops.render.render(write_still=True)
print('Saved editable boat/water scene and native render to',OUT)
