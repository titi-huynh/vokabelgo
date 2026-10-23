const {chromium}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path');
const {spawn}=require('node:child_process'),{once}=require('node:events'),{createHash}=require('node:crypto');
(async()=>{
 const dir=path.join(__dirname,'review');await fs.mkdir(dir,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')errors.push(r.url()+': '+r.failure()?.errorText);});
  await page.goto('http://127.0.0.1:3012/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.catchStudy?.getState().ready,null,{timeout:30000});
  await page.evaluate(()=>window.catchStudy.pause());
  const seek=async t=>page.evaluate(t=>{window.catchStudy.setTime(t);return window.catchStudy.getState();},t);
  const hash=async()=>createHash('sha256').update(await page.evaluate(()=>window.catchStudy.capture())).digest('hex');
  await seek(2.9);const hash0=await hash();await page.waitForTimeout(250);if(hash0!==await hash())throw Error('Pause drift');
  await seek(.5);await seek(2.9);if(hash0!==await hash())throw Error('History-dependent animation');
  await seek(7.6);const beforeAmbient=await hash();
  const bankHash=()=>page.evaluate(()=>{const d=document.querySelector('#catchScene').getContext('2d').getImageData(0,0,1672,190).data;let h=2166136261;for(const v of d)h=Math.imul(h^v,16777619);return h>>>0;});
  const bankBefore=await bankHash();await page.evaluate(()=>window.catchStudy.resume());await page.waitForTimeout(450);await page.evaluate(()=>window.catchStudy.pause());
  const afterAmbient=await page.evaluate(()=>window.catchStudy.getState());
  if(beforeAmbient===await hash()||afterAmbient.time!==7.6||afterAmbient.ambientTime<=7.6)throw Error('Water/raft did not continue after catch');
  if(bankBefore!==await bankHash())throw Error('Shoreline moved with water');
  const times=[0,1.3,1.53,1.73,1.85,1.94,2.06,2.16,2.25,2.39,2.53,2.76,3,3.19,3.4,3.6,3.95,4.15,4.5,4.9,5.16,6.4,7.6];
  const states=[];
  for(let i=0;i<times.length;i++){
   states.push(await seek(times[i]));await fs.writeFile(path.join(dir,`frame-${String(i).padStart(2,'0')}.png`),Buffer.from((await page.evaluate(()=>window.catchStudy.capture())).split(',')[1],'base64'));
  }
  await seek(2.53);await page.screenshot({path:path.join(dir,'desktop-pull.png'),fullPage:true});
  await seek(5.6);await page.screenshot({path:path.join(dir,'desktop-smile.png'),fullPage:true});
  await page.getByRole('button',{name:'Cá cắn câu!',exact:true}).click();await page.waitForTimeout(150);
  if(!await page.evaluate(()=>window.catchStudy.getState().playing))throw Error('Bite button did not play');
  await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();
  await page.getByRole('button',{name:'Cá vào sọt',exact:true}).click();
  if(Math.abs((await page.evaluate(()=>window.catchStudy.getState().time))-3.7)>.01)throw Error('Pose seek failed');
  await page.setViewportSize({width:390,height:844});await seek(2.53);await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
  const mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.catchStudy.getState().reduced);
  const reduced=await page.evaluate(()=>window.catchStudy.getState());if(reduced.playing||reduced.time!==7.6)throw Error('Reduced motion did not show still ending');
  await page.screenshot({path:path.join(dir,'reduced.png'),fullPage:true});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1100});
  if(errors.length||mobile.width!==mobile.scrollWidth)throw Error(JSON.stringify({errors,mobile}));
  if(process.argv.includes('--video')){
   const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','pipe:0','-an','-vf','scale=1280:720','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(__dirname,'meo-cho-ao-co-may-water-v04.mp4')],{windowsHide:true});
   let stderr='';ff.stderr.on('data',d=>stderr+=d);const done=once(ff,'close');
   for(let n=0;n<360;n++){const data=await page.evaluate(t=>{window.catchStudy.setTime(t);return window.catchStudy.capture().split(',')[1];},n/30);if(!ff.stdin.write(Buffer.from(data,'base64')))await once(ff.stdin,'drain');if(n%60===0)console.log('video',n,'/360');}
   ff.stdin.end();const [code]=await done;if(code)throw Error(stderr);
  }
  await fs.writeFile(path.join(dir,'verification.json'),JSON.stringify({errors,mobile,pausedStable:true,seekDeterministic:true,controlsPassed:true,reducedMotionStill:true,ambientAfterCatch:true,shorelineFixed:true,states},null,2));
  console.log(JSON.stringify({errors,mobile,pausedStable:true,seekDeterministic:true,controlsPassed:true,reducedMotionStill:true,ambientAfterCatch:true,shorelineFixed:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
