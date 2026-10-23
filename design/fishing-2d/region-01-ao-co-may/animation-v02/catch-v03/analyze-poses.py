"""Read-only measurements of generated art; never rewrites image pixels."""
from PIL import Image
from collections import deque
from pathlib import Path
import json

root=Path(__file__).resolve().parent
im=Image.open(root/'assets/meo-cho-catch-poses.png').convert('RGBA')
def components(mask,w,h):
    visited=set();out=[]
    for y in range(h):
        for x in range(w):
            if (x,y) in visited or not mask(x,y):continue
            q=deque([(x,y)]);visited.add((x,y));pts=[]
            while q:
                a,b=q.popleft();pts.append((a,b))
                for c,d in ((a-1,b),(a+1,b),(a,b-1),(a,b+1)):
                    if 0<=c<w and 0<=d<h and (c,d) not in visited and mask(c,d):
                        visited.add((c,d));q.append((c,d))
            if len(pts)>9:
                out.append({'area':len(pts),'center':[round(sum(p[i] for p in pts)/len(pts),1) for i in (0,1)],'box':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts)+1,max(p[1] for p in pts)+1]})
    return sorted(out,key=lambda a:-a['area'])
report=[]
for n in range(12):
    frame=im.crop(((n%4)*362,(n//4)*362,(n%4+1)*362,(n//4+1)*362));px=frame.load()
    def brown(x,y):
        r,g,b,a=px[x,y];return y<255 and a>200 and 40<r<127 and g<86 and b<65 and r>g*1.25
    def pad(x,y):
        r,g,b,a=px[x,y];return y>260 and a>200 and r>210 and 125<g<205 and 90<b<178 and r>g*1.18
    report.append({'frame':n,'bbox':frame.getchannel('A').point(lambda a:255 if a>80 else 0).getbbox(),'brown':components(brown,362,362)[:16],'pads':components(pad,362,362)[:10]})
(root/'pose-measurements.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
for r in report:print(r['frame'],r['bbox'],'eyes',[(p['area'],p['center']) for p in r['brown'][:8]],'pads',[(p['area'],p['center']) for p in r['pads'][:4]])
