"""Curved, asymmetrical produce with native/glTF painted colours and folded leaves."""
import math
import random
from mathutils import Vector,Euler
from boat_core import make_mesh,make_tube,srgb_to_linear
from boat_surface import paint

def mix(a,b,t):return tuple(x*(1-t)+y*t for x,y in zip(a,b))
def colour(hexcolor):return tuple(srgb_to_linear(hexcolor))

def anchor(name,loc,rot,parent,col):
    import bpy
    obj=bpy.data.objects.new(name+'_Assembly',None)
    col.objects.link(obj);obj.parent=parent;obj.location=loc;obj.rotation_euler=rot
    return obj

def painted_mesh(name,vertices,faces,colors,material,parent,col):
    obj=make_mesh(name,vertices,faces,material,parent=parent,col=col,smooth=True)
    paint(obj,colors)
    return obj

def bezier(points,t):
    a,b,c,d=[Vector(p) for p in points]
    return (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d

def blade(name,points,width,parent,col,base='718D35',tip='B3BC54',pink_base=False):
    """A folded leaf with curled tapered tip, broad sides and actual thickness."""
    vertices=[];colors=[];faces=[];rows=15;columns=5
    basec=colour(base);tipc=colour(tip)
    for layer in range(2):
        for i in range(rows):
            t=i/(rows-1)
            p=bezier(points,t)
            tangent=(bezier(points,min(1,t+.015))-bezier(points,max(0,t-.015))).normalized()
            side=tangent.cross(Vector((0,0,1)))
            if side.length<.05:side=tangent.cross(Vector((0,1,0)))
            side.normalize();normal=side.cross(tangent).normalized()
            envelope=((.2+.8*min(1,t/.12))*(1-t)**.95) if pink_base else math.sin(math.pi*t)**.76
            w=width*envelope*(.93+.07*math.sin(t*8))+.0002
            for j in range(columns):
                u=2*j/(columns-1)-1
                fold=(1-abs(u))*.12*width*math.sin(math.pi*t)
                ripple=abs(u)**2*.045*width*math.sin(t*16+u)
                pos=p+side*w*u+normal*(fold+ripple+layer*.0008)
                vertices.append(tuple(pos))
                c=mix(basec,tipc,t**1.3)
                if pink_base:c=mix(colour('D4597D'),c,max(0,min(1,(t-.38)/.47)))
                colors.append(tuple(v*(.93+.07*(1-abs(u))) for v in c))
    stride=rows*columns
    for layer in range(2):
        for i in range(rows-1):
            for j in range(columns-1):
                a=layer*stride+i*columns+j
                face=(a,a+1,a+columns+1,a+columns)
                faces.append(face if layer else tuple(reversed(face)))
    for i in range(rows-1):
        for j in (0,columns-1):
            a=i*columns+j;b=(i+1)*columns+j
            faces.append((a,b,b+stride,a+stride))
    return painted_mesh(name,vertices,faces,colors,'LeafPaint',parent,col)

def egg(name,radii,parent,col,kind,seed=1):
    rng=random.Random(seed)
    phase=rng.uniform(0,6)
    vertices=[];colors=[];faces=[];lon=32;lat=24
    if kind=='orange':c1,c2=colour('C85013'),colour('EC8B2C');material='FruitOrangePaint'
    else:c1,c2=colour('B42A59'),colour('E55F88');material='FruitDragonPaint'
    rx,ry,rz=radii
    for i in range(lat+1):
        theta=math.pi*i/lat;z=math.cos(theta);ring=math.sin(theta)
        for j in range(lon):
            phi=j*math.tau/lon
            irregular=1+.018*math.sin(3*phi+phase)*ring+.009*math.sin(7*phi+theta*4)
            taper=1 if kind=='orange' else 1-.14*z
            x=rx*ring*math.cos(phi)*irregular*taper
            y=ry*ring*math.sin(phi)*irregular*taper
            zz=rz*z
            if kind=='orange':
                zz-=rz*.12*math.exp(-theta*theta/.035)
                zz+=rz*.055*math.exp(-(theta-math.pi)**2/.04)
                pore=.00024*math.sin(phi*31+theta*57)*ring
                x+=pore*math.cos(phi);y+=pore*math.sin(phi)
            else:zz+=.002*math.sin(phi*4+phase)*ring
            vertices.append((x,y,zz))
            mottling=.5+.08*math.sin(phi*3+theta*5+phase)+.035*math.sin(phi*7-theta*8)
            t=max(0,min(1,mottling))
            colors.append(mix(c1,c2,t))
    for i in range(lat):
        for j in range(lon):
            a=i*lon+j;b=i*lon+(j+1)%lon
            faces.append((a,b,b+lon,a+lon))
    return painted_mesh(name,vertices,faces,colors,material,parent,col)

def make_orange(name,loc,scale=1,parent=None,col=None,seed=1):
    rng=random.Random(seed)
    group=anchor(name,loc,(rng.uniform(-.25,.25),rng.uniform(-.25,.25),rng.uniform(-3,3)),parent,col)
    s=scale
    objects=[egg(name+'_Peel',(.065*s,.061*s,.059*s),group,col,'orange',seed)]
    # Cupped calyx, short stalk and occasional folded leaf replace featureless balls.
    for k in range(5):
        a=k*math.tau/5
        points=[(0,0,.051*s),(.007*s*math.cos(a),.007*s*math.sin(a),.055*s),
                (.013*s*math.cos(a),.013*s*math.sin(a),.052*s),(.015*s*math.cos(a),.015*s*math.sin(a),.049*s)]
        objects.append(blade(name+f'_Calyx{k}',points,.004*s,group,col,'6B752B','78883C'))
    objects.append(make_tube(name+'_Stalk',[(0,0,.052*s),(.003*s,0,.063*s)],.003*s,'TimberDark',parent=group,col=col))
    if seed%3==0:
        objects.append(blade(name+'_Leaf',[(.002,0,.06),(.022,-.008,.09),(.046,-.012,.083),(.06,-.016,.068)],.013,group,col))
    return objects

def make_dragonfruit(name,loc,scale=1,tilt=(.15,0,0),parent=None,col=None):
    seed=sum(ord(c) for c in name);rng=random.Random(seed);s=scale
    group=anchor(name,loc,tilt,parent,col)
    objects=[egg(name+'_SoftBody',(.071*s,.065*s,.101*s),group,col,'dragon',seed)]
    # Staggered side bracts grow out of the peel and curl back; no repeated green rods.
    for row,(z,radius,count) in enumerate(((-.048,.057,4),(.012,.069,5),(.066,.045,4))):
        for k in range(count):
            a=k*math.tau/count+row*.53+rng.uniform(-.13,.13)
            direction=Vector((math.cos(a),math.sin(a),0))
            start=direction*(radius*.93);start.z=z
            length=rng.uniform(.060,.085)
            p1=start+direction*.018+Vector((0,0,.018))
            p2=start+direction*length+Vector((0,0,.006+row*.008))
            end=start+direction*(length*.80)+Vector((0,0,-.015+row*.018))
            points=[tuple(v*s) for v in (start,p1,p2,end)]
            objects.append(blade(name+f'_Bract{row}_{k}',points,rng.uniform(.014,.021)*s,
                group,col,'528D3C','92B753',True))
    for k in range(4):
        a=k*math.tau/4+.3
        start=Vector((.012*math.cos(a),.012*math.sin(a),.083))
        points=[start,start+Vector((.015*math.cos(a),.015*math.sin(a),.038)),
          Vector((.058*math.cos(a),.058*math.sin(a),.157)),Vector((.050*math.cos(a),.050*math.sin(a),.139))]
        objects.append(blade(name+f'_Crown{k}',[tuple(v*s) for v in points],.018*s,group,col,'467F35','91B64F',False))
    return objects

def banana_finger(name,points,radius,parent,col,seed):
    vertices=[];colors=[];faces=[];rows=26;sides=16
    rng=random.Random(seed);phase=rng.random()*6
    c1,c2=colour('C99224'),colour('F0CD57')
    for i in range(rows):
        t=i/(rows-1);p=bezier(points,t)
        tangent=(bezier(points,min(1,t+.01))-bezier(points,max(0,t-.01))).normalized()
        side=tangent.cross(Vector((0,1,0))).normalized();normal=side.cross(tangent).normalized()
        taper=.32+.68*math.sin(math.pi*t)**.55
        for j in range(sides):
            a=j*math.tau/sides
            r=radius*taper*(1+.035*math.cos(a*5))
            vertices.append(tuple(p+(side*math.cos(a)+normal*math.sin(a))*r))
            c=mix(c1,c2,.52+.22*math.sin(a+phase)+.12*math.sin(t*8+phase))
            if t<.13:c=mix(colour('92A650'),c,t/.13)
            if t>.93:c=mix(c,colour('80602E'),(t-.93)/.07)
            colors.append(c)
    for i in range(rows-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple((rows-1)*sides+j for j in range(sides))])
    return painted_mesh(name,vertices,faces,colors,'FruitBananaPaint',parent,col)

def make_banana_bunch(name,loc,rot_z=0,scale=1,parent=None,col=None):
    seed=sum(ord(c) for c in name);rng=random.Random(seed);s=scale
    hanging='Hanging' in name
    group=anchor(name,loc,(1.05 if hanging else .12,-.10,rot_z-.18),parent,col)
    objects=[]
    objects.append(make_tube(name+'_CurvedStalk',[(-.08*s,.09*s,.06*s),(-.105*s,.12*s,.07*s),(-.125*s,.13*s,.085*s)],.011*s,'LeafDark',segs=12,parent=group,col=col))
    for row,count in enumerate((3,3)):
        for i in range(count):
            fan=(i-(count-1)/2)/((count-1)/2)
            angle=fan*.33+row*.14
            ca,sa=math.cos(angle),math.sin(angle)
            z=-.035+row*.052
            length=1+rng.uniform(-.08,.08)
            # A crescent lies across the crate instead of six vertical parallel fingers.
            raw=[(-.075,.085,z+.025),(-.20,-.015,z+.006),
                 (-.08,-.23*length,z-.008),(.105,-.115*length,z+.038)]
            points=[((x*ca-y*sa)*s+fan*.018*s,(x*sa+y*ca)*s+row*.015*s,zz*s) for x,y,zz in raw]
            objects.append(banana_finger(name+f'_Finger{row}_{i}',points,.027*s*(1+rng.uniform(-.06,.08)),group,col,seed+i+row*10))
    return objects
