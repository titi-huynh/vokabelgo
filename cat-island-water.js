import * as THREE from 'three';

// The same displacement drives the surface, boat buoyancy and trailing foam.
// World units are metres; time is simulation time, never wall-clock time.
export function waveAt(x, z, time, strength = 1) {
  const waves = [[.025, .85, .46, .72], [.014, -.52, 1.2, 1.04], [.006, 2.8, 1.85, 1.45]];
  let height = 0, dx = 0, dz = 0;
  for (const [amplitude, kx, kz, speed] of waves) {
    const phase = x * kx + z * kz - time * speed;
    height += amplitude * Math.sin(phase);
    dx += amplitude * kx * Math.cos(phase);
    dz += amplitude * kz * Math.cos(phase);
  }
  return { height: height * strength, dx: dx * strength, dz: dz * strength };
}

const waveGLSL = `
  vec3 riverWave(vec2 p) {
    vec3 w = vec3(0.0);
    vec3 a = vec3(0.025, 0.014, 0.006) * uStrength;
    vec3 phase = vec3(dot(p, vec2(.85,.46)) - uTime*.72,
      dot(p, vec2(-.52,1.2)) - uTime*1.04,
      dot(p, vec2(2.8,1.85)) - uTime*1.45);
    w.x = dot(a, sin(phase));
    w.y = dot(a * vec3(.85,-.52,2.8), cos(phase));
    w.z = dot(a * vec3(.46,1.2,1.85), cos(phase));
    return w;
  }
`;

export class MarketWater {
  constructor(scene, renderer, { mobile = false } = {}) {
    this.scene = scene;
    this.renderer = renderer;
    this.uniforms = {
      uTime: { value: 0 }, uStrength: { value: 1 },
      uBoat: { value: new THREE.Vector3() }, // x, z, heading
      uSpeed: { value: 0 },
      uSurfaceCenter: { value: new THREE.Vector2() },
      uReflection: { value: null },
      uReflectionMatrix: { value: new THREE.Matrix4() },
      uDeep: { value: new THREE.Color('#247f85') },
      uShallow: { value: new THREE.Color('#63b6a9') },
    };
    const geometry = new THREE.PlaneGeometry(26, 26, mobile ? 120 : 192, mobile ? 120 : 192);
    geometry.rotateX(-Math.PI / 2);
    this.material = new THREE.MeshPhysicalMaterial({
      color: '#72b6ad', roughness: .3, metalness: .08,
      transparent: true, opacity: 1, depthWrite: false,
      clearcoat: .25, clearcoatRoughness: .35,
    });
    this.material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms);
      const declarations = `uniform float uTime, uStrength, uSpeed;
        uniform vec3 uBoat, uDeep, uShallow;
        uniform vec2 uSurfaceCenter;
        varying vec3 vRiverWorld;
        varying vec4 vRiverReflection;
        uniform mat4 uReflectionMatrix;`;
      shader.vertexShader = declarations + waveGLSL + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
        vec3 riverNormal = riverWave((modelMatrix * vec4(position,1.)).xz);
        vec3 objectNormal = normalize(vec3(-riverNormal.y, 1., -riverNormal.z));
      `).replace('#include <begin_vertex>', `
        vec3 transformed = position;
        transformed.y += riverWave((modelMatrix * vec4(position,1.)).xz).x;
        vRiverWorld = (modelMatrix * vec4(transformed, 1.)).xyz;
        vRiverReflection = uReflectionMatrix * vec4(vRiverWorld, 1.);
      `);
      shader.fragmentShader = declarations + `uniform sampler2D uReflection;
        float riverHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float riverNoise(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(riverHash(i),riverHash(i+vec2(1,0)),f.x),
            mix(riverHash(i+vec2(0,1)),riverHash(i+vec2(1,1)),f.x), f.y);
        }
      ` + waveGLSL + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        vec2 p = vRiverWorld.xz;
        float depthTint = riverNoise(p * .24 + vec2(1.3,2.7));
        vec3 riverColor = mix(uDeep, uShallow, smoothstep(.12,.88,depthTint));
        float ripples = sin(p.x*11.+p.y*7.-uTime*.8 + riverNoise(p*1.9)*4.);
        float shimmer = smoothstep(.91,1.,ripples) * .035;
        riverColor += shimmer;
        vec2 delta = p - uBoat.xy;
        float c=cos(uBoat.z), s=sin(uBoat.z);
        vec2 q=vec2(c*delta.x-s*delta.y, s*delta.x+c*delta.y);
        float hullDistance=(length(q/vec2(2.82,1.18))-1.)*1.3;
        // A narrow, interrupted contact line, then gently travelling capillary ripples.
        float contact=exp(-pow((hullDistance-.025)/.035,2.));
        float broken=.15+.85*smoothstep(.3,.7,riverNoise(q*6.+uTime*.12));
        float rings = pow(max(0.,sin(hullDistance*28.-uTime*1.5)),12.);
        rings *= smoothstep(.1,.2,hullDistance)*(1.-smoothstep(.25,.65,hullDistance));
        float foam=(contact*broken*.28 + rings*.045)*step(0.,hullDistance);
        foam *= 1.+uSpeed*smoothstep(1.1,2.7,-q.x)*1.5;
        float occlusion=exp(-max(0.,hullDistance)*3.) * .21;
        riverColor *= 1.-occlusion;
        riverColor = mix(riverColor, vec3(.82,.95,.89), foam);
        diffuseColor.rgb = riverColor;
        diffuseColor.a *= 1.-smoothstep(8.5,12.7,length(p-uSurfaceCenter));
      `).replace('#include <opaque_fragment>', `
        vec2 reflectUV = vRiverReflection.xy / vRiverReflection.w;
        vec3 waveN = riverWave(vRiverWorld.xz);
        reflectUV += waveN.yz * .10;
        vec3 reflectionColor = texture2D(uReflection, clamp(reflectUV, .002, .998)).rgb;
        float fresnel = pow(1.-max(0.,dot(normal,geometryViewDir)), 5.);
        float reflectionMask = smoothstep(.0,.04,reflectUV.x)*smoothstep(.0,.04,reflectUV.y)
          *smoothstep(.0,.04,1.-reflectUV.x)*smoothstep(.0,.04,1.-reflectUV.y);
        outgoingLight = mix(outgoingLight, reflectionColor, (.08+fresnel*.55)*reflectionMask);
        #include <opaque_fragment>
      `);
      this.shader = shader;
    };
    this.material.customProgramCacheKey = () => 'market-water-v04-1';
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'Flowing river surface';
    this.mesh.receiveShadow = true;
    this.mesh.renderOrder = 2;
    scene.add(this.mesh);

    this.reflectionTarget = new THREE.WebGLRenderTarget(mobile ? 512 : 1024, mobile ? 512 : 1024, {
      type: renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float')
        ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    this.uniforms.uReflection.value = this.reflectionTarget.texture;
    this.mirrorCamera = new THREE.PerspectiveCamera();
    this.mirrorCamera.layers.set(1);
    this.reflectionPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    this.bias = new THREE.Matrix4().set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1);
    this.look = new THREE.Vector3();
    this.foam = this.createWake(mobile ? 100 : 180);
    this.foamCursor = 0;
    this.foamRemainder = 0;
    this.createWakeRibbons(mobile ? 60 : 90);
    this.ribbonRemainder = 0;
  }

  createWakeRibbons(count) {
    this.ribbonSamples = [];
    this.ribbonCount = count;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 2 * 2 * 3),3));
    geometry.setAttribute('wakeUV', new THREE.BufferAttribute(new Float32Array(count * 2 * 2 * 2),2));
    const indices = [];
    for(let side=0;side<2;side++)for(let i=0;i<count-1;i++){
      const a=side*count*2+i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);
    }
    geometry.setIndex(indices);
    geometry.setDrawRange(0,0);
    const material = new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,side:THREE.DoubleSide,
      vertexShader:`attribute vec2 wakeUV;varying vec2 vWake;
        void main(){vWake=wakeUV;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 vWake;
        void main(){float soft=pow(max(0.,1.-abs(vWake.x*2.-1.)),2.);
          float a=soft*vWake.y*.28;gl_FragColor=vec4(.79,.94,.88,a);}`,
    });
    this.ribbon=new THREE.Mesh(geometry,material);
    this.ribbon.frustumCulled=false;this.ribbon.renderOrder=3;
    this.scene.add(this.ribbon);
  }

  updateWakeRibbons(time,dt,boat,speed,strength){
    this.ribbonRemainder+=dt;
    if(speed>.04 && this.ribbonRemainder>.06){
      this.ribbonRemainder=0;
      this.ribbonSamples.unshift({x:boat.position.x,z:boat.position.z,heading:boat.rotation.y,age:0});
      if(this.ribbonSamples.length>this.ribbonCount)this.ribbonSamples.pop();
    }
    this.ribbonSamples.forEach(sample=>sample.age+=dt);
    this.ribbonSamples=this.ribbonSamples.filter(sample=>sample.age<5.4);
    const pos=this.ribbon.geometry.attributes.position;
    const uv=this.ribbon.geometry.attributes.wakeUV;
    const count=this.ribbonSamples.length;
    for(let side=0;side<2;side++)for(let i=0;i<this.ribbonCount;i++){
      const sample=this.ribbonSamples[Math.min(i,count-1)];
      const sign=side===0?-1:1;
      for(let edge=0;edge<2;edge++){
        const index=side*this.ribbonCount*2+i*2+edge;
        if(!sample){pos.setXYZ(index,0,-10,0);uv.setXY(index,edge,0);continue;}
        const localX=2.25+sample.age*.05;
        const localZ=sign*(.84+sample.age*.12)+(edge-.5)*(.06+sample.age*.04);
        const c=Math.cos(sample.heading),s=Math.sin(sample.heading);
        const x=sample.x+localX*c+localZ*s, z=sample.z-localX*s+localZ*c;
        pos.setXYZ(index,x,waveAt(x,z,time,strength).height+.014,z);
        const fade=Math.pow(Math.max(0,1-sample.age/5.4),1.4);
        uv.setXY(index,edge,i<count?fade:0);
      }
    }
    pos.needsUpdate=uv.needsUpdate=true;
    this.ribbon.geometry.setDrawRange(0,count>1?(this.ribbonCount-1)*12:0);
  }

  createWake(count) {
    this.wakeData = Array.from({ length: count }, () => ({ age: 99, life: 1 }));
    const positions = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const sizes = new Float32Array(count);
    positions.fill(-100);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas,1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes,1));
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uPixelRatio: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute float alpha,size; varying float vAlpha;
        uniform float uPixelRatio;
        void main(){vAlpha=alpha; vec4 mv=modelViewMatrix*vec4(position,1.);
          gl_Position=projectionMatrix*mv; gl_PointSize=min(35.,size*uPixelRatio*240./-mv.z);}`,
      fragmentShader: `varying float vAlpha;
        void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);
          float ring=smoothstep(.48,.30,d)*smoothstep(.13,.25,d);
          gl_FragColor=vec4(.83,.96,.91,ring*vAlpha);}`,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 3;
    this.scene.add(points);
    return points;
  }

  update(time, dt, boat, speed, strength = 1) {
    const heading = boat.rotation.y;
    this.uniforms.uTime.value = time;
    this.uniforms.uStrength.value = strength;
    this.uniforms.uBoat.value.set(boat.position.x,boat.position.z,heading);
    this.mesh.position.set(boat.position.x,0,boat.position.z);
    this.uniforms.uSurfaceCenter.value.set(boat.position.x,boat.position.z);
    this.uniforms.uSpeed.value = speed;
    this.updateWakeRibbons(time,dt,boat,speed,strength);
    // Foam stays in world space after emission; it does not rotate with the vessel.
    if (speed > .04) {
      this.foamRemainder += dt * Math.min(55, speed * 50);
      while (this.foamRemainder >= 1) {
        this.foamRemainder--;
        const data = this.wakeData[this.foamCursor++ % this.wakeData.length];
        const side = this.foamCursor % 2 ? -1 : 1;
        const local = new THREE.Vector3(2.7 - Math.random()*.35,0,side*(.6+Math.random()*.25));
        local.applyAxisAngle(new THREE.Vector3(0,1,0),heading).add(boat.position);
        Object.assign(data,{x:local.x,z:local.z,age:0,life:2.3+Math.random()*1.4,
          vx: speed*Math.cos(heading)*.1, vz: -speed*Math.sin(heading)*.1+side*.035,
          size:.12+Math.random()*.13});
      }
    }
    const pos=this.foam.geometry.attributes.position;
    const alpha=this.foam.geometry.attributes.alpha;
    const size=this.foam.geometry.attributes.size;
    this.wakeData.forEach((data,index)=>{
      data.age += dt;
      if(data.age>=data.life){alpha.array[index]=0;return;}
      data.x+=data.vx*dt; data.z+=data.vz*dt;
      const life=data.age/data.life;
      pos.setXYZ(index,data.x,waveAt(data.x,data.z,time,strength).height+.018,data.z);
      alpha.array[index]=Math.sin(life*Math.PI)*.42;
      size.array[index]=data.size*(1+life*2.5);
    });
    pos.needsUpdate=alpha.needsUpdate=size.needsUpdate=true;
  }

  renderReflection(camera) {
    camera.getWorldDirection(this.look);
    this.look.add(camera.position);
    this.look.y *= -1;
    this.mirrorCamera.position.copy(camera.position);
    this.mirrorCamera.position.y *= -1;
    this.mirrorCamera.up.set(0,-1,0);
    this.mirrorCamera.lookAt(this.look);
    this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);
    this.mirrorCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    this.mirrorCamera.updateMatrixWorld();
    this.uniforms.uReflectionMatrix.value.copy(this.bias)
      .multiply(this.mirrorCamera.projectionMatrix).multiply(this.mirrorCamera.matrixWorldInverse);
    const oldTarget=this.renderer.getRenderTarget();
    const shadows=this.renderer.shadowMap.autoUpdate;
    const oldClipping=this.renderer.clippingPlanes;
    this.renderer.shadowMap.autoUpdate=false;
    this.renderer.clippingPlanes=[this.reflectionPlane];
    try{
      this.renderer.setRenderTarget(this.reflectionTarget);
      this.renderer.clear();
      this.renderer.render(this.scene,this.mirrorCamera);
    }finally{
      this.renderer.setRenderTarget(oldTarget);
      this.renderer.shadowMap.autoUpdate=shadows;
      this.renderer.clippingPlanes=oldClipping;
    }
  }

  dispose(){
    this.mesh.geometry.dispose(); this.material.dispose(); this.reflectionTarget.dispose();
    this.foam.geometry.dispose();this.foam.material.dispose();
    this.ribbon.geometry.dispose();this.ribbon.material.dispose();
    this.scene.remove(this.mesh,this.foam,this.ribbon);
  }
}
