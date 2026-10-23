"""Soft shopkeeper: rounded silhouette, little eyes and restrained expression."""
import bpy
import math
from boat_core import link_obj,make_mesh,make_tube,make_beveled_box

def soft(name,loc,size,mat,root,col):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=24,location=loc)
    obj=bpy.context.object;obj.name=name
    for v in obj.data.vertices:
        v.co.x*=size[0];v.co.y*=size[1];v.co.z*=size[2]
    return link_obj(obj,parent=root,col=col,mat=mat)

def ear(name,loc,side,inner,root,col):
    width=.072 if inner else .105
    height=.145 if inner else .225
    depth=.016 if inner else .060
    verts=[];faces=[];rows=20;segs=24
    for i in range(rows+1):
        t=i/rows;z=(t-.45)*height
        envelope=math.sin(math.pi*t)**.40*(1-.80*t)
        for j in range(segs):
            a=j*math.tau/segs
            verts.append((width*envelope*math.cos(a)+side*t*.025,depth*math.sin(math.pi*t)**.5*math.sin(a),z))
    for i in range(rows):
        for j in range(segs):
            a=i*segs+j;b=i*segs+(j+1)%segs
            faces.append((a,b,b+segs,a+segs))
    obj=make_mesh(name,verts,faces,'CatPink' if inner else 'CatCream',root,col)
    obj.location=loc
    return obj

def build_shopkeeper_cat(root,col):
    objects=[];cx,cy,cz=-.66,-.44,.78;hz=cz+.81
    def sphere(name,loc,size,mat='CatCream'):
        obj=soft(name,loc,size,mat,root,col);objects.append(obj);return obj
    sphere('Cat_SoftBody',(cx,cy,cz+.26),(.175,.145,.28))
    sphere('Cat_RoundHead',(cx,cy,hz),(.288,.232,.245))
    for side in (-1,1):
        ex=cx+side*.193
        objects.append(ear('Cat_RoundedEar'+str(side),(ex,cy,hz+.23),side,False,root,col))
        objects.append(ear('Cat_InnerEar'+str(side),(ex,cy-.05,hz+.232),side,True,root,col))
    def face_y(dx,dz):
        return cy-.232*math.sqrt(max(.05,1-(dx/.288)**2-(dz/.245)**2))
    for side in (-1,1):
        dx=side*.102;dz=.014;y=face_y(dx,dz)-.004
        sphere('Cat_BeanEye'+str(side),(cx+dx,y,hz+dz),(.017,.010,.019),'CatEyeDark')
        sphere('Cat_EyeLight'+str(side),(cx+dx-.004,y-.008,hz+dz+.007),(.0035,.002,.004),'CatCream')
        dx=side*.165;dz=-.064
        cheek=sphere('Cat_RosyCheek'+str(side),(cx+dx,face_y(dx,dz)-.003,hz+dz),(.030,.004,.025),'CatBlush')
        cheek.rotation_euler.z=side*.68
    sphere('Cat_ButtonNose',(cx,face_y(0,-.056)-.006,hz-.056),(.013,.008,.009),'CatPink')
    smile=[(-.032,-.084),(-.021,-.091),(-.010,-.087),(0,-.074),(.010,-.087),(.021,-.091),(.032,-.084)]
    objects.append(make_tube('Cat_TinySmile',[(cx+x,face_y(x,z)-.005,hz+z) for x,z in smile],.0028,'CatEyeDark',segs=8,parent=root,col=col))
    for side in (-1,1):
        for i in range(2):
            x=side*.215;z=-.045-i*.031
            objects.append(make_tube('Cat_QuietWhisker'+str(side)+str(i),[(cx+x,face_y(x,z)-.004,hz+z),(cx+side*.276,cy-.11,hz+z+.004)],.0018,'CatWhisker',segs=6,parent=root,col=col))
    objects.append(make_beveled_box('Cat_LinenApron',(cx,cy-.142,cz+.29),(.242,.025,.273),'CatApronTeal',bevel=.025,segs=5,parent=root,col=col))
    objects.append(make_beveled_box('Cat_ApronPocket',(cx,cy-.162,cz+.23),(.091,.012,.062),'CatApronPocket',bevel=.015,segs=4,parent=root,col=col))
    for side in (-1,1):
        pts=[(cx+side*.085,cy-.14,cz+.40),(cx+side*.11,cy-.09,cz+.49),(cx+side*.105,cy+.05,cz+.43)]
        objects.append(make_tube('Cat_ApronStrap'+str(side),pts,.012,'CatApronTeal',segs=10,parent=root,col=col))
    for side in (-1,1):
        pts=[(cx+side*.14,cy-.02,cz+.40),(cx+side*.19,cy-.12,cz+.34),(cx+side*.20,cy-.23,cz+.32)]
        objects.append(make_tube('Cat_RestingArm'+str(side),pts,.043,'CatCream',segs=14,parent=root,col=col))
        sphere('Cat_RestingPaw'+str(side),(cx+side*.20,cy-.24,cz+.32),(.052,.050,.041))
    # Mustard neckerchief with a soft folded front and small side knot.
    from boat_core import make_lathe
    objects.append(make_lathe('Cat_Scarf_Collar',[(.11,0),(.123,.028),(.12,.057),(.108,.070)],32,'ScarfGold',loc=(cx,cy,cz+.50),parent=root,col=col))
    scarfverts=[(cx-.095,cy-.132,cz+.55),(cx+.09,cy-.132,cz+.55),(cx+.032,cy-.172,cz+.38),
                (cx-.095,cy-.124,cz+.55),(cx+.09,cy-.124,cz+.55),(cx+.032,cy-.164,cz+.38)]
    objects.append(make_mesh('Cat_Scarf_Fold',scarfverts,[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],'ScarfGold',root,col))
    sphere('Cat_Scarf_Knot',(cx+.113,cy-.06,cz+.54),(.035,.040,.032),'ScarfGold')
    objects.append(make_tube('Cat_Scarf_LooseEnd',[(cx+.12,cy-.05,cz+.54),(cx+.18,cy-.06,cz+.48),(cx+.20,cy-.06,cz+.40)],.023,'ScarfGold',segs=12,parent=root,col=col,radii=[.027,.03,.006]))
    tail=[(cx+.04,cy+.12,cz+.13),(cx+.22,cy+.18,cz+.24),(cx+.27,cy+.13,cz+.43),(cx+.22,cy+.11,cz+.49)]
    objects.append(make_tube('Cat_CurledTail',tail,.043,'CatCream',segs=14,parent=root,col=col))
    return objects
