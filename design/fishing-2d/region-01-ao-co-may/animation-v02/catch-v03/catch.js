/* Ao Cỏ May: whole-pose 2D catch study, reference timing adapted for Mèo Chợ.
   Deterministic timeline: all layers, fish, line and basket derive from one clock. */
(() => {
  'use strict';
  const W=1672,H=941,DURATION=7.6,TAU=Math.PI*2,SCALE=.91,ANCHOR=[853,473];
  const canvas=document.querySelector('#catchScene'),ctx=canvas.getContext('2d');
  const actor=document.createElement('canvas');actor.width=W;actor.height=H;
  const gl=actor.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
  const ui=Object.fromEntries(['replay','bite','pause','reduced','time','scrub','phase','loading','progress'].map(id=>[id,document.getElementById(id)]));
  const assets={},poses=window.CatchPoses,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);},range=(t,a,b)=>smooth((t-a)/(b-a)),mix=(a,b,t)=>a+(b-a)*t;
  const lerp=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
  const keys=[{t:0,p:0},{t:1.12,p:0},{t:1.34,p:1},{t:1.53,p:2},{t:1.75,p:3},{t:2.06,p:4},{t:2.25,p:5},{t:2.53,p:6},{t:3.0,p:7},{t:3.4,p:8},{t:3.95,p:8},{t:4.23,p:9},{t:4.7,p:10},{t:5.16,p:11},{t:DURATION,p:11}];
  let ready=false,time=0,ambientTime=0,playing=true,last=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,restore=false;
  let program,buffer,loc={},meshCache=new Map(),fishBox;
  const water=document.createElement('canvas');water.width=W;water.height=H;
  const wg=water.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
  let waterProgram,waterTime;
  const phase=t=>t<1.12?'Một góc ao yên bình…':t<1.48?'Ồ, cá cắn câu!':t<1.9?'Mèo lấy đà…':t<2.4?'Kéo lên nào!':t<3.36?'Được một chú cá vàng!':t<4.75?'Vào sọt rồi!':'Câu được rồi, bạn ơi!';
  function stateAt(t){
    let k=0;while(k<keys.length-2&&t>keys[k+1].t)k++;
    const a=keys[k],b=keys[k+1],u=smooth((t-a.t)/(b.t-a.t));
    const pull=range(t,1.83,2.28)*(1-range(t,2.48,3.2));
    const sea=reduced?0:ambientTime;
    const bob=reduced?0:Math.sin(sea*TAU/4.8)*5.4+Math.sin(sea*TAU/7.1+.5)*1.7+Math.sin((t-2.06)*14)*Math.exp(-Math.max(0,t-2.06)*3)*range(t,2.06,2.12)*2.2;
    return {a:a.p,b:b.p,u,pull,bob,sway:reduced?0:Math.sin(sea*TAU/8.2)*3.2,roll:reduced?0:Math.sin(sea*TAU/6.5+.25)*.010+Math.sin(sea*TAU/9.4)*.002+pull*.004,time:t,ambientTime:sea,phase:phase(t),fishVisible:t>=2.08&&t<3.6,caught:t>=3.65};
  }
  function root(p,s){const x=p[0]-900,y=p[1]-493,c=Math.cos(s.roll),sn=Math.sin(s.roll);return [900+s.sway+c*x-sn*y,493+s.bob+sn*x+c*y];}
  function catPoint(p,s){const breath=reduced?0:Math.sin(s.ambientTime*TAU/3.1)*.55*clamp(-p[1]/160);return root([ANCHOR[0]+p[0]*SCALE,ANCHOR[1]+p[1]*SCALE-breath],s);}
  function setupWater(){
    if(!wg)return;
    const compile=(type,source)=>{const sh=wg.createShader(type);wg.shaderSource(sh,source);wg.compileShader(sh);if(!wg.getShaderParameter(sh,wg.COMPILE_STATUS))throw Error(wg.getShaderInfoLog(sh));return sh;};
    waterProgram=wg.createProgram();
    wg.attachShader(waterProgram,compile(wg.VERTEX_SHADER,`attribute vec2 aPoint;varying vec2 vPoint;void main(){vPoint=aPoint;gl_Position=vec4(aPoint.x/1672.*2.-1.,1.-aPoint.y/941.*2.,0.,1.);}`));
    wg.attachShader(waterProgram,compile(wg.FRAGMENT_SHADER,`
      precision highp float;uniform sampler2D uPond;uniform float uTime;varying vec2 vPoint;
      void main(){vec2 p=vPoint;float wet=smoothstep(212.,294.,p.y);float depth=.35+.65*smoothstep(250.,941.,p.y);float t=uTime*.72;
      vec2 drift=vec2(sin(p.y*.019+t)*3.7+sin(p.y*.031-p.x*.002+t*.65)*1.7,sin(p.x*.009-t*.8)*2.0+sin(p.x*.022+p.y*.008+t)*.7);
      vec3 color=texture2D(uPond,(p+drift*wet*depth)/vec2(1672.,941.)).rgb;
      color*=1.+wet*.003*sin(p.x*.007+p.y*.011-t);gl_FragColor=vec4(color,1.);}`));
    wg.linkProgram(waterProgram);if(!wg.getProgramParameter(waterProgram,wg.LINK_STATUS))throw Error(wg.getProgramInfoLog(waterProgram));wg.useProgram(waterProgram);
    const vb=wg.createBuffer();wg.bindBuffer(wg.ARRAY_BUFFER,vb);wg.bufferData(wg.ARRAY_BUFFER,new Float32Array([0,0,W,0,0,H,0,H,W,0,W,H]),wg.STATIC_DRAW);
    const attr=wg.getAttribLocation(waterProgram,'aPoint');wg.enableVertexAttribArray(attr);wg.vertexAttribPointer(attr,2,wg.FLOAT,false,0,0);
    const tex=wg.createTexture();wg.bindTexture(wg.TEXTURE_2D,tex);wg.texParameteri(wg.TEXTURE_2D,wg.TEXTURE_WRAP_S,wg.CLAMP_TO_EDGE);wg.texParameteri(wg.TEXTURE_2D,wg.TEXTURE_WRAP_T,wg.CLAMP_TO_EDGE);wg.texParameteri(wg.TEXTURE_2D,wg.TEXTURE_MIN_FILTER,wg.LINEAR);wg.texParameteri(wg.TEXTURE_2D,wg.TEXTURE_MAG_FILTER,wg.LINEAR);
    wg.texImage2D(wg.TEXTURE_2D,0,wg.RGBA,wg.RGBA,wg.UNSIGNED_BYTE,assets.pond);wg.uniform1i(wg.getUniformLocation(waterProgram,'uPond'),0);waterTime=wg.getUniformLocation(waterProgram,'uTime');wg.viewport(0,0,W,H);
  }
  function drawWater(s){
    if(wg&&waterProgram&&!reduced){wg.uniform1f(waterTime,s.ambientTime);wg.drawArrays(wg.TRIANGLES,0,6);ctx.drawImage(water,0,0);}else ctx.drawImage(assets.pond,0,0,W,H);
    // Tapered curved highlights supplement the painted depth shapes without
    // turning the surface into a repeating grid of straight reflection bars.
    for(const [x,y,width,offset]of [[302,414,91,.2],[502,688,96,1.7],[1332,352,114,3.3],[1379,728,105,4.5],[865,849,129,2.2],[177,604,85,5.4]]){
      const phase=s.ambientTime*.7+offset,lift=reduced?0:Math.sin(phase)*3,alpha=reduced?.14:.12+(Math.sin(phase)*.5+.5)*.18,drift=reduced?0:Math.sin(phase*.72)*7;
      const sheen=ctx.createLinearGradient(x-width/2+drift,0,x+width/2+drift,0);
      sheen.addColorStop(0,'rgba(236,255,247,0)');sheen.addColorStop(.23,`rgba(236,255,247,${alpha})`);sheen.addColorStop(.72,`rgba(236,255,247,${alpha})`);sheen.addColorStop(1,'rgba(236,255,247,0)');
      stroke(()=>{ctx.moveTo(x-width/2+drift,y+lift);ctx.bezierCurveTo(x-width/5+drift,y+9+lift,x+width/5+drift,y+5+lift,x+width/2+drift,y-2+lift);},sheen,2.6);
    }
    for(const [x,y,offset]of [[538,626,.1],[1263,542,.52],[386,800,.8],[1344,786,.34]]){
      const u=(s.ambientTime*.15+offset)%1,alpha=Math.sin(u*Math.PI)**2*.46;
      ctx.strokeStyle=`rgba(221,255,250,${alpha})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x+Math.sin(u*TAU)*3,y-u*13,2.6+u*1.6,1.8+u,0,0,TAU);ctx.stroke();
    }
  }
  function drawRaftWake(s){
    ctx.save();ctx.translate(900+s.sway,493+s.bob);ctx.rotate(s.roll);ctx.translate(-900,-493);
    for(let i=0;i<2;i++){
      const u=(s.ambientTime*.27+i*.5)%1,alpha=Math.sin(u*Math.PI)*.48;
      // Broken crescents leave open water between the crests, like the reference.
      stroke(()=>ctx.ellipse(914,550,319+u*29,87+u*9,-.045,.03*Math.PI,.38*Math.PI),`rgba(226,255,248,${alpha})`,2.8);
      stroke(()=>ctx.ellipse(914,550,319+u*29,87+u*9,-.045,.53*Math.PI,.85*Math.PI),`rgba(226,255,248,${alpha*.9})`,2.6);
      stroke(()=>ctx.ellipse(914,526,314+u*18,57+u*5,-.045,1.03*Math.PI,1.22*Math.PI),`rgba(226,255,248,${alpha*.6})`,2.2);
    }
    ctx.restore();
  }
  function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
  function setup(){
    if(!gl)throw Error('Trình duyệt chưa mở được cảnh hoạt hình.');
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec2 aPosition;attribute vec2 aUV0;attribute vec2 aUV1;
      uniform vec2 uSize;varying vec2 vUV0;varying vec2 vUV1;
      void main(){vUV0=aUV0;vUV1=aUV1;gl_Position=vec4(aPosition.x/uSize.x*2.-1.,1.-aPosition.y/uSize.y*2.,0.,1.);}`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
      precision highp float;uniform sampler2D uSheet;uniform vec2 uSheetSize;uniform float uMix;
      uniform vec4 uBox0;uniform vec4 uBox1;varying vec2 vUV0;varying vec2 vUV1;
      vec4 sampleBox(vec2 p,vec4 box){if(p.x<box.x||p.y<box.y||p.x>box.z||p.y>box.w)return vec4(0.);return texture2D(uSheet,p/uSheetSize);}
      void main(){gl_FragColor=mix(sampleBox(vUV0,uBox0),sampleBox(vUV1,uBox1),uMix);}`));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    for(const [n,offset] of [['aPosition',0],['aUV0',8],['aUV1',16]]){const l=gl.getAttribLocation(program,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,24,offset);}
    for(const n of ['uMix','uBox0','uBox1'])loc[n]=gl.getUniformLocation(program,n);
    gl.uniform2f(gl.getUniformLocation(program,'uSize'),W,H);
    gl.uniform2f(gl.getUniformLocation(program,'uSheetSize'),assets.cat.naturalWidth,assets.cat.naturalHeight);
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,assets.cat);gl.uniform1i(gl.getUniformLocation(program,'uSheet'),0);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);
  }
  function drawingGeometry(s){
    const a=poses[s.a],b=poses[s.b],selected=s.u<.5?s.a:s.b,p=poses[selected];
    const h=q=>[(q.head[0]-q.origin[0])*q.scale,(q.head[1]-q.origin[1])*q.scale];
    const source=h(p),target=lerp(h(a),h(b),s.u),angle=mix(a.head[2],b.head[2],s.u)-p.head[2],c=Math.cos(angle),sn=Math.sin(angle);
    const warp=([px,py])=>{const localY=py/p.scale+p.origin[1],w=1-smooth((localY-p.head[1]-78)/72),dx=px-source[0],dy=py-source[1];return [mix(px,target[0]+c*dx-sn*dy,w),mix(py,target[1]+sn*dx+c*dy,w)];};
    return {p,selected,warp};
  }
  function drawCat(s){
    const {p,selected,warp}=drawingGeometry(s);
    let mesh=meshCache.get(selected);
    if(!mesh){
      mesh=[];const [l,top,r,bottom]=p.box;
      for(let y=top;y<bottom;y+=9)for(let x=l;x<r;x+=9){const xx=Math.min(x+9,r),yy=Math.min(y+9,bottom);mesh.push([x,y],[xx,y],[x,yy],[x,yy],[xx,y],[xx,yy]);}
      meshCache.set(selected,mesh);
    }
    const values=[];
    for(const [x,y]of mesh){
      const localX=x-p.cell[0],localY=y-p.cell[1];
      const px=(localX-p.origin[0])*p.scale,py=(localY-p.origin[1])*p.scale;
      // One rigid transform for the face and ears. Weight fades through scarf and
      // upper torso; neither eyes nor mouth are individually triangulated/warped.
      const pt=catPoint(warp([px,py]),s);values.push(...pt,x,y,x,y);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.DYNAMIC_DRAW);
    // Cel exposure switches once at the midpoint; NEVER dissolve silhouettes/faces.
    // Cage positions keep moving continuously while a single drawing stays opaque.
    gl.uniform1f(loc.uMix,0);gl.uniform4fv(loc.uBox0,p.box);gl.uniform4fv(loc.uBox1,p.box);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,values.length/6);ctx.drawImage(actor,0,0);
  }
  function stroke(path,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();path();ctx.stroke();}
  function drawRod(s){
    const {p,warp}=drawingGeometry(s),grip=catPoint(warp(p.grip),s);
    const angle=mix(-2.48,-1.49,range(s.time,1.78,2.27))+range(s.time,2.53,3.65)*(-.72)+s.roll;
    const length=233,tip=[grip[0]+Math.cos(angle)*length,grip[1]+Math.sin(angle)*length];
    const perp=[-Math.sin(angle),Math.cos(angle)],bend=s.pull*13;
    const control=[mix(grip[0],tip[0],.6)+perp[0]*bend,mix(grip[1],tip[1],.6)+perp[1]*bend];
    const path=()=>{ctx.moveTo(grip[0]+Math.cos(angle)*-23,grip[1]+Math.sin(angle)*-23);ctx.quadraticCurveTo(...control,...tip);};
    stroke(path,'#704c2d',10);stroke(path,'#bb874b',6.1);
    const twig=lerp(grip,tip,.77);stroke(()=>{ctx.moveTo(...twig);ctx.lineTo(twig[0]+perp[0]*21,twig[1]+perp[1]*21);},'#805b35',4);
    ctx.save();ctx.translate(twig[0]+perp[0]*24,twig[1]+perp[1]*24);ctx.rotate(angle+.4);ctx.fillStyle='#a4b85b';ctx.strokeStyle='#667b3e';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-7,6,12,-.2,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    return {tip,grip};
  }
  function fishPosition(t){
    const u=clamp((t-2.08)/1.52),v=1-u;
    return [v*v*v*610+3*v*v*u*570+3*v*u*u*1030+u*u*u*1134,v*v*v*566+3*v*v*u*(-30)+3*v*u*u*(-5)+u*u*u*455];
  }
  function floatPosition(t,s){
    if(t<2.08){const bite=range(t,1.08,1.3);return [610+Math.sin(s.ambientTime*.8)*2+Math.sin(t*9)*bite*2.5,561+Math.sin(s.ambientTime*TAU/2.7)*2.6+Math.sin(t*21)*bite*4+range(t,1.7,2.08)*12];}
    if(t<3.06){const fish=fishPosition(t);return [fish[0]-12,fish[1]-57];}
    if(t<4){const start=fishPosition(3.06),u=range(t,3.06,4),v=1-u,p=[v*v*v*(start[0]-12)+3*v*v*u*1020+3*v*u*u*780+u*u*u*733,v*v*v*(start[1]-57)+3*v*v*u*240+3*v*u*u*380+u*u*u*340];return lerp(p,root(p,s),u);}
    return root([733+Math.sin((s.ambientTime-4)*4)*3*Math.exp(-Math.max(0,t-4)*.7),340+Math.sin((s.ambientTime-4)*5)*2*Math.exp(-Math.max(0,t-4)*.7)],s);
  }
  function drawFloat(p,scale=1){
    ctx.save();ctx.translate(...p);ctx.scale(scale,scale);ctx.fillStyle='#ef785c';ctx.strokeStyle='#a97448';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,15,Math.PI,0);ctx.lineTo(15,3);ctx.lineTo(-15,3);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff5dd';ctx.beginPath();ctx.ellipse(0,3,15,8,0,0,Math.PI);ctx.lineTo(-15,3);ctx.fill();ctx.stroke();ctx.fillStyle='#fff9e9';ctx.beginPath();ctx.ellipse(-5,-8,2.8,1.6,-.4,0,TAU);ctx.fill();ctx.restore();
  }
  function drawLine(s,tip){
    const p=floatPosition(s.time,s),flying=s.time>=2.08;
    const slack=range(s.time,2.75,3.7)*36;
    stroke(()=>{ctx.moveTo(...tip);ctx.quadraticCurveTo((tip[0]+p[0])/2+slack,(tip[1]+p[1])/2+slack,...p);},'#fff9dc',1.7);
    if(flying&&s.time<3.06){const fish=fishPosition(s.time);stroke(()=>{ctx.moveTo(...p);ctx.quadraticCurveTo(p[0]-9,p[1]+30,fish[0]+25,fish[1]-3);},'#fff9dc',1.4);}
    return p;
  }
  function drawCatchFish(s){
    const t=s.time,source=fishPosition(t),p=lerp(source,root(source,s),range(t,3.1,3.6));
    ctx.save();ctx.translate(...p);ctx.rotate(t<2.58?-.85+range(t,2.08,2.58)*.8:range(t,2.58,3.6)*1.13);
    const wiggle=reduced?0:Math.sin(t*30)*.06;ctx.scale(1,1+wiggle);
    const [x,y,w,h]=fishBox;ctx.drawImage(assets.fish,x,y,w,h,-45,-24,90,48);ctx.restore();
  }
  function ripple(x,y,r,alpha){ctx.strokeStyle=`rgba(241,255,237,${alpha})`;ctx.lineWidth=2.1;ctx.beginPath();ctx.ellipse(x,y,r,r*.27,0,0,TAU);ctx.stroke();}
  function splash(s){
    const age=s.time-2.08;if(age<0||age>.85)return;
    for(let i=0;i<3;i++){const u=clamp(age/.85+i*.11);ripple(610,577,25+u*95,(1-u)*.8);}
    if(age<.6)for(let i=0;i<9;i++){const a=-Math.PI+(i/8)*Math.PI,speed=45+(i%3)*23,u=age/.6;
      const x=610+Math.cos(a)*speed*u,y=575+Math.sin(a)*speed*u+40*u*u;ctx.fillStyle=`rgba(238,255,245,${(1-u)*.9})`;ctx.beginPath();ctx.ellipse(x,y,2+2*(1-u),5*(1-u)+1,a+.7,0,TAU);ctx.fill();}
  }
  function drawAmbient(s){
    const t=s.ambientTime;
    for(const [x,y,v] of [[250,707,1],[1320,800,-1]]){ctx.save();ctx.translate(x+t*v*3,y);ctx.scale(v,1);ctx.fillStyle='rgba(42,131,129,.16)';ctx.beginPath();ctx.ellipse(0,0,24,10,0,0,TAU);ctx.moveTo(-20,0);ctx.lineTo(-33,-10);ctx.lineTo(-33,10);ctx.closePath();ctx.fill();ctx.restore();}
    // A single distant dragonfly crosses slowly, away from the catch silhouette.
    if(reduced||s.time>1.1)return;
    const x=1170+t*100,y=248+Math.sin(t*3)*5;
    ctx.save();ctx.translate(x,y);ctx.strokeStyle='#568b72';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle='rgba(255,255,229,.7)';const wing=2+Math.abs(Math.sin(t*80))*3;
    for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(0,side*4,8,wing,side*.3,0,TAU);ctx.fill();}ctx.restore();
  }
  function render(){
    if(!ready)return;const s=stateAt(time),t=s.time;ctx.clearRect(0,0,W,H);drawWater(s);drawAmbient(s);
    const shadow=root([909,525],s);
    ctx.fillStyle='rgba(25,133,130,.17)';ctx.beginPath();ctx.ellipse(...shadow,306+Math.sin(s.ambientTime*.9)*2,65,-.045+s.roll,0,TAU);ctx.fill();
    drawRaftWake(s);
    ctx.save();ctx.translate(900+s.sway,493+s.bob);ctx.rotate(s.roll);ctx.translate(-900,-493);
    ctx.drawImage(assets.raft,608,401,614,245);
    const basketHop=reduced?0:(t>=3.5&&t<3.95?Math.sin((t-3.5)*19)*Math.exp(-(t-3.5)*7)*3:0);
    ctx.drawImage(assets.basket,1071,372+basketHop,121,123);
    ctx.drawImage(assets.bait,1001,441,51,57);ctx.restore();
    const rod=drawRod(s),float=drawLine(s,rod.tip);
    drawCat(s);
    if(t<2.08)for(let i=0;i<3;i++){const u=(s.ambientTime*.7+i/3)%1;ripple(float[0],float[1]+7,21+u*48,(1-u)*.65);}
    splash(s);drawFloat(float,t<2.08?1:.8);
    if(s.fishVisible){
      // Fish goes into the basket mouth; front woven wall occludes its last descent.
      ctx.save();if(t>3.35){ctx.beginPath();const corners=[[0,0],[W,0],[W,390],[0,390]].map(p=>root(p,s));ctx.moveTo(...corners[0]);corners.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.clip();}drawCatchFish(s);ctx.restore();
    }
    if(s.caught){
      const u=range(t,3.65,3.85)*(1-range(t,4.05,4.35));
      if(u>0){ctx.fillStyle=`rgba(255,244,166,${u*.8})`;for(const [x,y]of [[1110,347],[1160,360]]){ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+2,y-2);ctx.lineTo(x+6,y);ctx.lineTo(x+2,y+2);ctx.lineTo(x,y+6);ctx.lineTo(x-2,y+2);ctx.lineTo(x-6,y);ctx.lineTo(x-2,y-2);ctx.closePath();ctx.fill();}}
    }
    ui.time.value=time.toFixed(1);ui.time.textContent=`${time.toFixed(1)} / ${DURATION.toFixed(1)} giây`;ui.scrub.value=time;ui.progress.style.width=`${time/DURATION*100}%`;
    if(ui.phase.textContent!==s.phase)ui.phase.textContent=s.phase;
  }
  function pause(){playing=false;ui.pause.textContent='Tiếp tục';}
  function resume(){playing=true;last=0;ui.pause.textContent='Tạm dừng';}
  function tick(now){if(ready&&playing&&!reduced){if(last){const delta=Math.min(.05,(now-last)/1000);time=Math.min(DURATION,time+delta);ambientTime+=delta;}render();}last=now;requestAnimationFrame(tick);}
  ui.replay.onclick=()=>{time=0;ambientTime=0;reduced?pause():resume();render();};
  ui.bite.onclick=()=>{time=reduced?3.6:1.1;reduced?pause():resume();render();};
  ui.pause.onclick=()=>{if(reduced)return;playing?pause():resume();};
  ui.scrub.addEventListener('input',()=>{pause();time=Number(ui.scrub.value);ambientTime=time;render();});
  document.querySelectorAll('[data-pose-time]').forEach(b=>b.onclick=()=>{pause();time=Number(b.dataset.poseTime);ambientTime=time;render();});
  function setReduced(value){reduced=value;ui.reduced.checked=value;if(value){pause();time=DURATION;ambientTime=DURATION;}render();ui.pause.disabled=value;}
  ui.reduced.onchange=()=>setReduced(ui.reduced.checked);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>setReduced(e.matches));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){restore=playing;pause();}else{last=0;if(restore&&!reduced){restore=false;resume();}}});
  const reference=document.querySelector('#motionReference');document.querySelectorAll('[data-reference-time]').forEach(b=>b.onclick=()=>{reference.pause();reference.currentTime=Number(b.dataset.referenceTime);});
  function alphaBox(img){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);const d=x.getImageData(0,0,img.width,img.height).data;let l=img.width,r=0,top=img.height,b=0;for(let y=0;y<img.height;y++)for(let xx=0;xx<img.width;xx++)if(d[(y*img.width+xx)*4+3]>64){l=Math.min(l,xx);r=Math.max(r,xx);top=Math.min(top,y);b=Math.max(b,y);}return[l,top,r-l+1,b-top+1];}
  window.catchStudy={pause,resume,setTime(t){time=clamp(t,0,DURATION);ambientTime=Math.max(0,t);render();},setReducedMotion:setReduced,getState(){const s=stateAt(time);return{ready,time,playing,reduced,duration:DURATION,...s,feetAnchor:ANCHOR,method:'authored whole-body cels; continuous weighted head registration with rigid face; water and raft ambience'};},capture(){return canvas.toDataURL('image/png');}};
  const paths={pond:'catch-v03/assets/pond-water-v04.png',cat:'catch-v03/assets/meo-cho-catch-poses.png',raft:'catch-v03/assets/raft.png',basket:'catch-v03/assets/basket.png',bait:'catch-v03/assets/bait.png',fish:'catch-v03/assets/golden-carp.png'};
  Promise.all(Object.entries(paths).map(([name,url])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve();};im.onerror=()=>reject(Error('Chưa tải được hình '+name));im.src=url;})))
    .then(()=>{fishBox=alphaBox(assets.fish);setupWater();setup();ready=true;ui.loading.hidden=true;ui.loading.style.display='none';if(reduced)setReduced(true);else render();requestAnimationFrame(tick);})
    .catch(e=>{pause();ui.loading.textContent=e.message;console.error(e);});
})();
