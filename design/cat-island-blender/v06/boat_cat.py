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
    height=.114 if inner else .175
    depth=.016 if inner else .060
    verts=[];faces=[];rows=20;segs=24
    for i in range(rows+1):
        t=i/rows;z=(t-.45)*height
        envelope=math.sin(math.pi*t)**.5*(1-.52*t)
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
    objects=[];cx,cy,cz=-.66,-.44,.78;hz=cz+.77
    def sphere(name,loc,size,mat='CatCream'):
        obj=soft(name,loc,size,mat,root,col);objects.append(obj);return obj
    sphere('Cat_SoftBody',(cx,cy,cz+.26),(.175,.145,.28))
    sphere('Cat_RoundHead',(cx,cy,hz),(.298,.238,.251))
    for side in (-1,1):
        ex=cx+side*.193
        objects.append(ear('Cat_RoundedEar'+str(side),(ex,cy,hz+.23),side,False,root,col))
        objects.append(ear('Cat_InnerEar'+str(side),(ex,cy-.05,hz+.232),side,True,root,col))
    def face_y(dx,dz):
        return cy-.238*math.sqrt(max(.05,1-(dx/.298)**2-(dz/.251)**2))
    for side in (-1,1):
        dx=side*.102;dz=-.012;y=face_y(dx,dz)-.004
        sphere('Cat_BeanEye'+str(side),(cx+dx,y,hz+dz),(.017,.009,.023),'CatEyeDark')
        sphere('Cat_EyeLight'+str(side),(cx+dx-.004,y-.008,hz+dz+.007),(.0035,.002,.004),'CatCream')
        dx=side*.165;dz=-.064
        cheek=sphere('Cat_RosyCheek'+str(side),(cx+dx,face_y(dx,dz)-.004,hz+dz),(.033,.005,.014),'CatBlush')
        cheek.rotation_euler.z=-side*.52
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
    pts=[(cx+.14,cy-.02,cz+.40),(cx+.23,cy-.09,cz+.48),(cx+.30,cy-.12,cz+.64)]
    objects.append(make_tube('Cat_GreetingArm',pts,.043,'CatCream',segs=14,parent=root,col=col))
    sphere('Cat_GreetingPaw',(cx+.30,cy-.12,cz+.67),(.054,.045,.068))
    sphere('Cat_PawPad',(cx+.30,cy-.161,cz+.67),(.021,.006,.025),'CatBlush')
    pts=[(cx-.145,cy-.04,cz+.39),(cx-.22,cy-.12,cz+.34),(cx-.24,cy-.23,cz+.32)]
    objects.append(make_tube('Cat_CounterArm',pts,.045,'CatCream',segs=14,parent=root,col=col))
    sphere('Cat_CounterPaw',(cx-.24,cy-.24,cz+.32),(.055,.055,.042))
    tail=[(cx+.04,cy+.12,cz+.13),(cx+.22,cy+.18,cz+.24),(cx+.27,cy+.13,cz+.43),(cx+.22,cy+.11,cz+.49)]
    objects.append(make_tube('Cat_CurledTail',tail,.043,'CatCream',segs=14,parent=root,col=col))
    return objects
