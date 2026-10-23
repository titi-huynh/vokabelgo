"""Original portable PBR surface maps and painted vertex colour for native/web parity."""
import bpy
import math
import numpy as np
from boat_core import srgb_to_linear

WOOD={'TimberHoney','TimberWarm','TimberDark','DeckPlank','DeckPlankAlt','BambooPole',
      'BambooNode','CrateWood','WickerBasket','SignBoard','HullNavy','HullNavyDeep','HullStripeBlue'}
FABRIC={'RoofCream','AwningCloth','RoofSeam'}

def image(name,rgb,noncolor=False):
    h,w,_=rgb.shape
    im=bpy.data.images.new(name,width=w,height=h,alpha=True)
    im.colorspace_settings.name='Non-Color' if noncolor else 'sRGB'
    rgba=np.concatenate((np.clip(rgb,0,1),np.ones((h,w,1))),axis=2).astype(np.float32)
    im.pixels.foreach_set(rgba.ravel())
    im.pack()
    return im

def install_surfaces(materials,palette):
    n=384
    y,x=np.mgrid[0:n,0:n].astype(float)/(n-1)
    warp=y+.018*np.sin(x*11+np.sin(x*27)*.5)+.005*np.sin(x*53+y*9)
    grain=np.sin(warp*64+np.sin(x*9)*2.5)
    fine=np.sin(warp*173+np.sin(x*23)*2)*np.sin(y*41+x*7)
    tone=.96+.027*grain+.009*fine+.022*np.sin(x*8+y*5)
    # Two quiet oval knots, stretched along the timber, not repeated black stripes.
    for cx,cy in ((.28,.34),(.76,.78)):
        d=np.sqrt(((x-cx)*1.8)**2+((y-cy)*8.)**2)
        mask=np.exp(-d*d*9)
        tone-=mask*(.07+.07*np.sin(d*67)**2)
    du,dv=np.gradient((tone-1)*.016)
    normals=np.stack((-dv*100,-du*100,np.ones_like(x)),axis=2)
    normals/=np.linalg.norm(normals,axis=2)[...,None]
    normal_image=image('Timber fine grain normal',normals*.5+.5,True)
    for name,mat in materials.items():
        if name not in WOOD|FABRIC|{'CabinCoral','CabinCoralTrim','PaintTeal','PaintTealLight','PaintOchre','FlagCoral'}:continue
        base=np.array([int(palette[name][0][i:i+2],16)/255 for i in (0,2,4)])
        if name in WOOD:
            field=.98+(tone-.96)*(.35 if name.startswith('Bamboo') else .7)
            mat['surface_uv_scale']=2.6
        elif name in FABRIC:
            field=.97+.018*np.sin(x*14+y*9)+.009*np.sin(x*817)*np.sin(y*809)
            mat['surface_uv_scale']=1.1
        else:
            field=.97+.025*np.sin(x*13+np.sin(y*9))+.012*np.sin(x*71+y*37)
            mat['surface_uv_scale']=1.7
        rgb=field[...,None]*base
        if name in {'HullNavy','HullNavyDeep','HullStripeBlue','CabinCoral','CabinCoralTrim','PaintTeal','PaintTealLight','PaintOchre'}:
            # Worn paint islands with coloured undercoat, elongated rubs and rain streaks.
            cloud=(np.sin(x*17+np.sin(y*23)*1.2)+np.sin(y*31+x*13)+.5*np.sin(x*79+y*47))/2.5
            chips=np.clip((cloud-.65)*8,0,1)*.35
            rub=np.clip((np.sin(y*111+np.sin(x*35)*2)-.89)*8,0,1)*.12
            under=np.array([.51,.43,.32])
            rgb=rgb*(1-chips[...,None])+under*chips[...,None]
            rgb*=1-rub[...,None]
            rgb*=1-((.03+.018*np.sin(x*39))*np.clip(np.sin(y*13+x*3),0,1))[...,None]
        tex=image(name+' brushed colour',rgb)
        nodes=mat.node_tree.nodes;links=mat.node_tree.links
        bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
        albedo=nodes.new('ShaderNodeTexImage');albedo.image=tex
        links.new(albedo.outputs['Color'],bsdf.inputs['Base Color'])
        if name in WOOD:
            normal=nodes.new('ShaderNodeTexImage');normal.image=normal_image
            nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.08
            links.new(normal.outputs['Color'],nm.inputs['Color'])
            links.new(nm.outputs['Normal'],bsdf.inputs['Normal'])

def organic_materials(materials):
    specs={
      'FruitOrangePaint':(.43,0), 'FruitDragonPaint':(.46,0),
      'FruitBananaPaint':(.5,0), 'LeafPaint':(.61,0), 'FruitStem':(.83,0),
    }
    for name,(roughness,metallic) in specs.items():
        mat=bpy.data.materials.new(name);mat.use_nodes=True
        bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        bs.inputs['Base Color'].default_value=(1,1,1,1)
        bs.inputs['Roughness'].default_value=roughness
        bs.inputs['Metallic'].default_value=metallic
        color=mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='Paint'
        mat.node_tree.links.new(color.outputs['Color'],bs.inputs['Base Color'])
        materials[name]=mat

def ensure_uv(obj):
    if obj.type!='MESH' or not obj.data.materials:return
    material=obj.data.materials[0]
    if not material or 'surface_uv_scale' not in material:return
    mesh=obj.data
    uv=mesh.uv_layers.get('UVMap') or mesh.uv_layers.new(name='UVMap')
    points=[v.co for v in mesh.vertices]
    if not points:return
    extents=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
    long=max(range(3),key=lambda i:extents[i])
    scale=material['surface_uv_scale']
    seed=sum(ord(c) for c in obj.name)*.0137
    for poly in mesh.polygons:
        perpendicular=[i for i in range(3) if i!=long]
        second=min(perpendicular,key=lambda i:abs(poly.normal[i]))
        for li in poly.loop_indices:
            p=mesh.vertices[mesh.loops[li].vertex_index].co
            uv.data[li].uv=(p[long]*.65+seed,p[second]*scale+seed*.7)

def paint(obj,colors):
    layer=obj.data.color_attributes.new(name='Paint',type='FLOAT_COLOR',domain='POINT')
    layer.data.foreach_set('color',[v for rgb in colors for v in (*rgb,1.)])
    obj.data.color_attributes.active_color_index=len(obj.data.color_attributes)-1
