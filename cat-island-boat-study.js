import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MarketWater, waveAt } from './cat-island-water.js';

const canvas=document.querySelector('#boat-canvas');
const status=document.querySelector('#loading-message');
const loading=document.querySelector('#loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 760px)').matches;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#e6edee');
scene.fog=new THREE.Fog('#e6edee',19,40);
let renderer;
try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
} catch(error) {
  status.textContent='Trình duyệt chưa mở được cảnh 3D. Chị thử bật WebGL hoặc mở bằng Chrome nhé.';
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.VSMShadowMap;
const camera=new THREE.PerspectiveCamera(34,1,.1,80);
const sun=new THREE.DirectionalLight('#fffdf8',2.0);
sun.position.set(-4,10,5);sun.castShadow=true;
sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
Object.assign(sun.shadow.camera,{left:-7,right:7,top:6,bottom:-5,near:.5,far:24});
sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;sun.shadow.radius=3;
sun.shadow.blurSamples=8;
sun.layers.enable(1);scene.add(sun);
const ambient=new THREE.HemisphereLight('#edf4f4','#939c9b',1.05);
ambient.layers.enable(1);scene.add(ambient);
const rim=new THREE.DirectionalLight('#eefbff',.65);rim.position.set(3,5,-6);rim.layers.enable(1);scene.add(rim);

// An entirely local soft studio environment, no HDR download or runtime CDN.
const environmentScene=new THREE.Scene();
environmentScene.background=new THREE.Color('#bacacd');
const envPanel=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshBasicMaterial({color:'#fffdf5',side:THREE.DoubleSide}));
envPanel.position.set(-4,7,2);envPanel.lookAt(0,0,0);environmentScene.add(envPanel);
const pmrem=new THREE.PMREMGenerator(renderer);
const environment=pmrem.fromScene(environmentScene,.015);
scene.environment=environment.texture;
envPanel.geometry.dispose();envPanel.material.dispose();pmrem.dispose();

const bed=new THREE.Mesh(new THREE.CircleGeometry(13,96),new THREE.MeshStandardMaterial({color:'#b3c7c8',roughness:1}));
bed.rotation.x=-Math.PI/2;bed.position.y=-.62;scene.add(bed);
const water=new MarketWater(scene,renderer,{mobile});
water.uniforms.uDeep.value.set('#598f9b');
water.uniforms.uShallow.value.set('#9dc6c7');
const boatRig=new THREE.Group();boatRig.name='Buoyant boat assembly';scene.add(boatRig);
let boat=null, paused=reduced.matches, sailing=false, time=0, phase=0, strength=.8;
let desiredSpeed=0, travelMix=0, loaded=false;
let dirty=true;
const target=new THREE.Vector3(0,.8,0);
const cameraOffset=new THREE.Vector3(6.5,5.15,7.7);
const targetOffset=new THREE.Vector3(0,.8,0);
let desiredCamera=cameraOffset.clone(),desiredTarget=targetOffset.clone();
let dragging=false,lastPointer=null;
const views={
  overview:{eye:new THREE.Vector3(6.5,5.15,7.7),target:new THREE.Vector3(0,.8,0)},
  counter:{eye:new THREE.Vector3(.8,2.8,5.4),target:new THREE.Vector3(.1,1.4,0)},
  produce:{eye:new THREE.Vector3(-.6,2.1,3.1),target:new THREE.Vector3(-.6,1.38,.8)},
  water:{eye:new THREE.Vector3(7,1.9,7),target:new THREE.Vector3(0,.45,0)},
};
if(mobile){Object.values(views).forEach(v=>v.eye.multiplyScalar(1.38));}
cameraOffset.copy(views.overview.eye);desiredCamera.copy(cameraOffset);camera.position.copy(cameraOffset);camera.lookAt(target);

const sailButton=document.querySelector('#sail');
const pauseButton=document.querySelector('#pause');
function updateLabels(){
  dirty=true;
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.textContent=paused?'Tiếp tục':'Tạm dừng';
  sailButton.setAttribute('aria-pressed',String(sailing));
  sailButton.innerHTML=sailing?'Dừng thuyền <span>○</span>':'Cho thuyền lướt thử <span>↗</span>';
  document.querySelector('#scene-state').textContent=paused?'DỪNG MỘT NHỊP':sailing?'ĐANG LƯỚT TRÊN SÔNG':'BẾN YÊN';
}
sailButton.addEventListener('click',()=>{sailing=!sailing;desiredSpeed=sailing?1:0;updateLabels();});
pauseButton.addEventListener('click',()=>{paused=!paused;updateLabels();});
document.querySelector('#wave-strength').addEventListener('input',event=>{
  strength=Number(event.target.value);
  dirty=true;
  document.querySelector('#wave-description').textContent=strength<1?'Êm nhẹ':'Lăn tăn';
});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  const view=views[button.dataset.view];
  dirty=true;
  desiredCamera.copy(view.eye);desiredTarget.copy(view.target);
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));
canvas.addEventListener('pointerdown',e=>{dragging=true;lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
  if(!dragging)return;
  dirty=true;
  const spherical=new THREE.Spherical().setFromVector3(desiredCamera.clone().sub(desiredTarget));
  spherical.theta-=(e.clientX-lastPointer.x)*.008;
  spherical.phi=THREE.MathUtils.clamp(spherical.phi+(e.clientY-lastPointer.y)*.006,.3,1.43);
  desiredCamera.copy(new THREE.Vector3().setFromSpherical(spherical).add(desiredTarget));
  lastPointer={x:e.clientX,y:e.clientY};
});
const release=()=>{dragging=false;lastPointer=null;};
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
canvas.addEventListener('wheel',e=>{e.preventDefault();dirty=true;const d=desiredCamera.clone().sub(desiredTarget);
  const distance=THREE.MathUtils.clamp(d.length()*Math.exp(e.deltaY*.001),1.8,26);
  desiredCamera.copy(d.setLength(distance).add(desiredTarget));},{passive:false});
canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;
  e.preventDefault();const s=new THREE.Spherical().setFromVector3(desiredCamera.clone().sub(desiredTarget));
  dirty=true;
  if(e.key==='ArrowLeft')s.theta+=.12;if(e.key==='ArrowRight')s.theta-=.12;
  if(e.key==='ArrowUp')s.phi=Math.max(.3,s.phi-.1);if(e.key==='ArrowDown')s.phi=Math.min(1.43,s.phi+.1);
  if(e.key==='+')s.radius=Math.max(1.8,s.radius*.9);if(e.key==='-')s.radius=Math.min(26,s.radius*1.1);
  desiredCamera.copy(new THREE.Vector3().setFromSpherical(s).add(desiredTarget));
});
reduced.addEventListener('change',e=>{if(e.matches){paused=true;updateLabels();}});
function resize(){const {width,height}=canvas.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;}
new ResizeObserver(resize).observe(canvas);resize();

const compareButton=document.querySelector('#compare');
const cachedBoats=new Map();
const loader=new GLTFLoader();
const requestedModel=new URLSearchParams(location.search).get('model');
let studyModel=['v04','v05','v06','v07'].includes(requestedModel)?requestedModel:'v07';
async function showBoat(version){
  compareButton.disabled=true;
  compareButton.textContent='Đang tải…';
  try{
    let model=cachedBoats.get(version);
    if(!model){
      const gltf=await loader.loadAsync(`./assets/cat-island/hero-boat-${version}.glb`);
      model=gltf.scene;
      model.traverse(object=>{
        object.layers.enable(1);
        if(object.isMesh){
          object.castShadow=true;object.receiveShadow=true;
          const materials=Array.isArray(object.material)?object.material:[object.material];
          materials.forEach(material=>{
            material.envMapIntensity=.5;
            for(const texture of [material.map,material.normalMap]){
              if(texture)texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
            }
          });
        }
      });
      model.visible=false;boatRig.add(model);cachedBoats.set(version,model);
    }
    if(boat)boat.visible=false;
    boat=model;boat.visible=true;studyModel=version;loaded=true;dirty=true;
    loading.classList.add('hidden');loading.setAttribute('aria-hidden','true');
    sailButton.disabled=pauseButton.disabled=false;
    compareButton.setAttribute('aria-pressed',String(version!=='v07'));
    compareButton.textContent=version!=='v07'?'Trở lại bản mới':'Xem bản cũ';
    updateLabels();
  }catch(error){
    console.error('Boat loading failed',error);
    if(!loaded)status.textContent='Chưa tải được mô hình thuyền. Chị thử tải lại trang nhé.';
    compareButton.textContent='Tải lại mô hình';
  }finally{compareButton.disabled=false;}
}
compareButton.addEventListener('click',()=>showBoat(studyModel==='v07'?'v06':'v07'));
showBoat(studyModel);

let last=performance.now(),frame=0;
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(document.hidden)return;
  // Once the camera settles, a paused scene needs no repeated GPU passes.
  if(paused && !dirty && cameraOffset.distanceToSquared(desiredCamera)<1e-8
    && targetOffset.distanceToSquared(desiredTarget)<1e-8)return;
  const step=paused?0:dt;
  time+=step;
  travelMix=THREE.MathUtils.damp(travelMix,desiredSpeed,1.1,step);
  phase+=step*.14*travelMix;
  boatRig.position.x=-2*Math.sin(phase);
  boatRig.position.z=1.5*(1-Math.cos(phase));
  const heading=Math.atan2(1.5*Math.sin(phase),2*Math.cos(phase));
  boatRig.rotation.y=heading;
  const wave=waveAt(boatRig.position.x,boatRig.position.z,time,strength);
  boatRig.position.y=wave.height;
  // Three surface samples determine stable pitch/roll; no independent bob animation.
  const forward=new THREE.Vector3(Math.cos(heading),0,-Math.sin(heading));
  const right=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));
  const front=waveAt(boatRig.position.x+forward.x*2.5,boatRig.position.z+forward.z*2.5,time,strength).height;
  const back=waveAt(boatRig.position.x-forward.x*2.5,boatRig.position.z-forward.z*2.5,time,strength).height;
  const port=waveAt(boatRig.position.x+right.x,boatRig.position.z+right.z,time,strength).height;
  const starboard=waveAt(boatRig.position.x-right.x,boatRig.position.z-right.z,time,strength).height;
  boatRig.rotation.order='YXZ';boatRig.rotation.z=Math.atan2(front-back,5);boatRig.rotation.x=-Math.atan2(port-starboard,2);
  water.update(time,step,boatRig,travelMix*.27,strength);
  bed.position.x=boatRig.position.x;bed.position.z=boatRig.position.z;
  const smoothing=reduced.matches?1:1-Math.exp(-dt*5);
  cameraOffset.lerp(desiredCamera,smoothing);targetOffset.lerp(desiredTarget,smoothing);
  camera.position.copy(cameraOffset).add(boatRig.position);
  target.copy(targetOffset).add(boatRig.position);camera.lookAt(target);camera.updateMatrixWorld();
  if(loaded && (!mobile || frame%2===0))water.renderReflection(camera);
  renderer.render(scene,camera);frame++;dirty=false;
}
updateLabels();requestAnimationFrame(animate);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.classList.remove('hidden');loading.removeAttribute('aria-hidden');status.textContent='Cảnh 3D bị gián đoạn. Chị tải lại trang để mở lại nhé.';});
