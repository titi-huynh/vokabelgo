/* Small registered pose study: intact painting + weighted head mesh.
   No separately stretched limbs; no procedural replacement face. */
(() => {
  'use strict';
  const W=1672,H=941,DURATION=5,TAU=Math.PI*2;
  const bg=document.querySelector('#pond'), actor=document.querySelector('#actor'), front=document.querySelector('#life');
  const b=bg.getContext('2d'), f=front.getContext('2d');
  const gl=actor.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true,preserveDrawingBuffer:true});
  const ui={time:document.querySelector('#time'),pause:document.querySelector('#pause'),replay:document.querySelector('#replay'),reduced:document.querySelector('#reduced'),progress:document.querySelector('#progress'),loading:document.querySelector('#loading')};
  const referenceVideo=document.querySelector('#motionReference');
  document.querySelectorAll('[data-reference-time]').forEach(button=>button.addEventListener('click',()=>{
    referenceVideo.pause();referenceVideo.currentTime=Number(button.dataset.referenceTime);
  }));
  let ready=false,playing=true,time=0,last=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,restore=false;
  const images={};
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const range=(t,a,z)=>smooth((t-a)/(z-a));
  const bell=(t,a,z,c,d)=>range(t,a,z)*(1-range(t,c,d));
  const bezier=(a,c,d,z,t)=>({x:(1-t)**3*a.x+3*(1-t)**2*t*c.x+3*(1-t)*t*t*d.x+t**3*z.x,y:(1-t)**3*a.y+3*(1-t)**2*t*c.y+3*(1-t)*t*t*d.y+t**3*z.y});
  function pose(t) {
    const attention=bell(t,1.65,2.35,3.65,4.85),follow=bell(t,3.65,4.15,4.6,4.95);
    return {time:t,bob:reduced?0:Math.sin(t*TAU/5)*1.35,roll:reduced?0:Math.sin(t*TAU/5+.2)*.0018,
      breath:reduced?0:Math.sin(t*TAU/2.5)*.55,angle:reduced?0:(-attention*.023+follow*.018),
      gaze:reduced?0:(-bell(t,1.42,1.85,3.5,4.5)*2.15+follow*2.25),
      blink:bell(t,.76,.84,.89,1.02),attention,fly:!reduced&&t>=1.25&&t<4.95};
  }
  function shade(type,src) {
    const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;
  }
  let program,loc={};
  function setupGL() {
    if(!gl)throw Error('Trình duyệt chưa hỗ trợ phần xem chuyển động.');
    const vert=`attribute vec2 aPosition; uniform vec2 uSize; uniform vec4 uMotion; varying vec2 vSource;
      float s(float a,float b,float x){return smoothstep(a,b,x);}
      void main(){vec2 p=aPosition;vSource=p;
      float head=s(736.,764.,p.x)*(1.-s(966.,993.,p.x))*(1.-s(328.,357.,p.y));
      vec2 q=p-vec2(867.,339.);float c=cos(uMotion.z),si=sin(uMotion.z);
      vec2 turned=vec2(c*q.x-si*q.y,si*q.x+c*q.y)+vec2(867.,339.);
      p=mix(p,turned,head);p.y-=head*uMotion.w;
      float torso=exp(-pow((aPosition.x-850.)/85.,2.)-pow((aPosition.y-395.)/60.,2.));
      p.y-=torso*uMotion.w*.7;
      q=p-vec2(915.,460.);c=cos(uMotion.y);si=sin(uMotion.y);
      p=vec2(c*q.x-si*q.y,si*q.x+c*q.y)+vec2(915.,460.+uMotion.x);
      gl_Position=vec4(p.x/uSize.x*2.-1.,1.-p.y/uSize.y*2.,0.,1.);}`;
    const frag=`precision highp float;uniform sampler2D uOpen;uniform sampler2D uClosed;uniform vec2 uSize;uniform vec4 uTextureSize;uniform float uBlink;uniform float uGaze;varying vec2 vSource;
      float eye(vec2 p,vec2 c){float d=length((p-c)/vec2(18.,23.));return 1.-smoothstep(.8,1.,d);}
      void main(){vec2 p=vSource;float mask=max(eye(p,vec2(803.5,274.5)),eye(p,vec2(891.,282.)));
      vec4 col=texture2D(uOpen,(p-vec2(uGaze*mask,0.))/uTextureSize.xy);
      float a=1.246352,b=.007455;vec2 anchor=vec2(803.5,274.5);vec2 q=p-anchor;
      vec2 registered=vec2(a*q.x-b*q.y,b*q.x+a*q.y)+vec2(816.5,311.5);
      vec4 closed=texture2D(uClosed,registered/uTextureSize.zw);
      col.rgb=mix(col.rgb,closed.rgb,mask*uBlink);gl_FragColor=col;}`;
    program=gl.createProgram();gl.attachShader(program,shade(gl.VERTEX_SHADER,vert));gl.attachShader(program,shade(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    const vertices=[];
    for(let y=144;y<564;y+=14)for(let x=598;x<1228;x+=14){vertices.push(x,y,x+14,y,x,y+14,x,y+14,x+14,y,x+14,y+14);}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    loc.count=vertices.length/2;loc.position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(loc.position);gl.vertexAttribPointer(loc.position,2,gl.FLOAT,false,0,0);
    ['uSize','uMotion','uBlink','uGaze'].forEach(n=>loc[n]=gl.getUniformLocation(program,n));
    gl.uniform2f(loc.uSize,W,H);
    gl.uniform4f(gl.getUniformLocation(program,'uTextureSize'),images['actor-open'].naturalWidth,images['actor-open'].naturalHeight,images['actor-blink-source'].naturalWidth,images['actor-blink-source'].naturalHeight);
    ['actor-open','actor-blink-source'].forEach((name,i)=>{
      const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[name]);gl.uniform1i(gl.getUniformLocation(program,i?'uClosed':'uOpen'),i);
    });gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);
  }
  function rootPoint(x,y,p) {
    const dx=x-915,dy=y-460,c=Math.cos(p.roll),s=Math.sin(p.roll);
    return {x:915+c*dx-s*dy,y:460+p.bob+s*dx+c*dy};
  }
  function drawFish(ctx,x,y,scale,t) {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='rgba(27,132,133,.15)';ctx.beginPath();ctx.ellipse(0,0,23,9,0,0,TAU);ctx.fill();
    ctx.beginPath();ctx.moveTo(-19,0);ctx.lineTo(-31,-8+Math.sin(t)*2);ctx.lineTo(-31,8+Math.sin(t)*2);ctx.closePath();ctx.fill();ctx.restore();
  }
  function dragonfly(t) {
    if(t<2.75)return bezier({x:-45,y:270},{x:220,y:150},{x:530,y:175},{x:648,y:202},range(t,1.25,2.75));
    if(t<3.6)return {x:648+Math.sin(t*8)*2,y:202+Math.sin(t*6)*1.7};
    return bezier({x:648,y:202},{x:870,y:120},{x:1390,y:190},{x:1740,y:120},range(t,3.6,4.95));
  }
  function drawDragonfly(p) {
    if(!p.fly)return;
    const d=dragonfly(p.time),hover=p.time>=2.75&&p.time<3.6;
    f.save();f.translate(d.x,d.y);f.rotate(-.14+Math.sin(p.time*5)*.03);
    const wing=hover?.85:.66+.30*Math.sin(p.time*TAU*17);
    f.strokeStyle='rgba(81,115,98,.32)';f.lineWidth=.7;f.fillStyle='rgba(255,255,229,.77)';
    for(const side of [-1,1])for(const back of [-1,1]){
      f.save();f.rotate(side*(.2+wing*.27));f.beginPath();f.ellipse(back*5,side*(4+wing*4),10,2.6*wing,back*.42,0,TAU);f.fill();f.stroke();f.restore();
    }
    f.strokeStyle='#427b70';f.lineWidth=2.8;f.lineCap='round';f.beginPath();f.moveTo(-12,0);f.quadraticCurveTo(-3,1,5,0);f.stroke();
    f.fillStyle='#427b70';f.beginPath();f.ellipse(6,-1,3.3,2.4,0,0,TAU);f.fill();f.restore();
  }
  function render(t) {
    if(!ready)return;
    const p=pose(t);b.clearRect(0,0,W,H);f.clearRect(0,0,W,H);b.drawImage(images.pond,0,0,W,H);
    drawFish(b,255+(reduced?0:t*3),689,.92,t);drawFish(b,1325-(reduced?0:t*2),776,-.9,t+.8);
    b.fillStyle='rgba(31,135,133,.18)';b.beginPath();b.ellipse(916,483+p.bob,305,66,-.06,0,TAU);b.fill();
    const tip=rootPoint(635,222,p),float={x:592+(reduced?0:Math.sin(t*TAU/5)*.6),y:550+(reduced?0:Math.sin(t*TAU/2.5+.4)*1.1)};
    b.strokeStyle='#ffffee';b.lineWidth=1.7;b.beginPath();b.moveTo(tip.x,tip.y);b.quadraticCurveTo((tip.x+float.x)/2-1,(tip.y+float.y)/2,float.x,float.y-14);b.stroke();
    gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform4f(loc.uMotion,p.bob,p.roll,p.angle,p.breath);gl.uniform1f(loc.uBlink,p.blink);gl.uniform1f(loc.uGaze,p.gaze);gl.drawArrays(gl.TRIANGLES,0,loc.count);
    for(let i=0;i<3;i++){
      const phase=((reduced?0:t)*.45+i/3)%1;f.strokeStyle=`rgba(242,255,248,${.58*(1-phase)})`;f.lineWidth=2;
      f.beginPath();f.ellipse(float.x,float.y+12,27+phase*56,8+phase*15,0,0,TAU);f.stroke();
    }
    f.save();f.translate(float.x,float.y);f.lineWidth=1.8;f.strokeStyle='#94633d';f.fillStyle='#ef765d';f.beginPath();f.arc(0,0,24,Math.PI,0);f.closePath();f.fill();f.stroke();
    f.fillStyle='#fff7de';f.beginPath();f.ellipse(0,0,24,12,0,0,Math.PI);f.lineTo(-24,0);f.fill();f.stroke();
    f.fillStyle='#fff7de';f.beginPath();f.ellipse(-6,-15,5,2,-.45,0,TAU);f.fill();f.restore();drawDragonfly(p);
    ui.time.textContent=`${t.toFixed(1)} / 5.0 giây`;ui.progress.style.width=`${t/5*100}%`;
  }
  function tick(stamp) {
    if(playing&&ready){if(last)time=Math.min(DURATION,time+Math.min(.05,(stamp-last)/1000));render(time);if(time===DURATION){playing=false;ui.pause.textContent='Tiếp tục';}}
    last=stamp;requestAnimationFrame(tick);
  }
  function pause(){playing=false;ui.pause.textContent='Tiếp tục';}
  function resume(){if(time>=5)time=0;playing=true;last=0;ui.pause.textContent='Tạm dừng';}
  ui.replay.onclick=()=>{time=0;resume();render(0);};ui.pause.onclick=()=>{playing?pause():resume();};
  ui.reduced.checked=reduced;ui.reduced.onchange=()=>{reduced=ui.reduced.checked;render(time);};
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;ui.reduced.checked=reduced;render(time);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){restore=playing;pause();}else{last=0;if(restore){restore=false;resume();}}});
  actor.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();ui.loading.hidden=false;ui.loading.style.display='grid';ui.loading.textContent='Phần xem đã tạm dừng. Hãy tải lại trang.';});
  window.idleStudy={setTime(t){time=Math.min(5,Math.max(0,t));render(time);},pause,resume,getState(){return {ready,time,playing,reduced,pose:pose(time),method:'registered painting with weighted mesh; native WebGL study, not Rive'};},setReducedMotion(v){reduced=!!v;ui.reduced.checked=reduced;render(time);},capture(){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');[bg,actor,front].forEach(img=>ctx.drawImage(img,0,0));return c.toDataURL('image/png');}};
  Promise.all(['pond','actor-open','actor-blink-source'].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[name]=img;resolve();};img.onerror=()=>reject(Error('Không mở được '+name));img.src=`assets/${name}.png`;})))
    .then(()=>{setupGL();ready=true;ui.loading.style.display='none';render(0);requestAnimationFrame(tick);})
    .catch(e=>{pause();ui.loading.textContent=e.message;console.error(e);});
})();
