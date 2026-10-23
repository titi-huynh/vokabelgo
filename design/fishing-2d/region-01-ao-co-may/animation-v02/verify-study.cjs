const {chromium}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path');
const {spawn}=require('node:child_process'),{once}=require('node:events'),{createHash}=require('node:crypto');
(async()=>{
  const dir=path.join(__dirname,'review');await fs.mkdir(dir,{recursive:true});
  const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
    await page.goto('http://127.0.0.1:3012/idle-v02.html',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.idleStudy?.getState().ready,{timeout:20000});
    await page.evaluate(()=>window.idleStudy.pause());
    const hash=async()=>createHash('sha256').update(await page.evaluate(()=>window.idleStudy.capture())).digest('hex');
    await page.evaluate(()=>window.idleStudy.setTime(2.8));const initial=await hash();await page.waitForTimeout(200);
    if(initial!==await hash())throw Error('Paused scene moved');
    await page.evaluate(()=>window.idleStudy.setTime(.87));await page.evaluate(()=>window.idleStudy.setTime(2.8));
    if(initial!==await hash())throw Error('Pose depended on rendering history');
    const states=[];
    for(const t of [0,.86,1.5,2.8,3.6,4.4,5]){
      await page.evaluate(t=>window.idleStudy.setTime(t),t);
      await page.screenshot({path:path.join(dir,`desktop-${String(t).replace('.','_')}.png`),fullPage:true});
      await fs.writeFile(path.join(dir,`scene-${String(t).replace('.','_')}.png`),Buffer.from((await page.evaluate(()=>window.idleStudy.capture())).split(',')[1],'base64'));
      states.push(await page.evaluate(()=>window.idleStudy.getState()));
    }
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.idleStudy.setTime(2.8));
    await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
    const mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.idleStudy.getState().reduced);
    if(await page.evaluate(()=>window.idleStudy.getState().pose.fly))throw Error('Reduced motion kept dragonfly moving');
    await page.screenshot({path:path.join(dir,'reduced.png'),fullPage:true});
    await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1000});
    if(errors.length||mobile.width!==mobile.scrollWidth)throw Error(JSON.stringify({errors,mobile}));
    if(process.argv.includes('--video')){
      const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','pipe:0','-an','-vf','scale=1280:720','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(__dirname,'ao-co-may-idle-v02.mp4')],{windowsHide:true});
      let stderr='';ff.stderr.on('data',d=>stderr+=d);const done=once(ff,'close');
      for(let n=0;n<150;n++){
        const data=await page.evaluate(t=>{window.idleStudy.setTime(t);return window.idleStudy.capture().split(',')[1];},n/30);
        if(!ff.stdin.write(Buffer.from(data,'base64')))await once(ff.stdin,'drain');
        if(n%50===0)console.log('video',n,'/150');
      }
      ff.stdin.end();const [code]=await done;if(code)throw Error(stderr);
    }
    await fs.writeFile(path.join(dir,'verification.json'),JSON.stringify({errors,mobile,pausedStable:true,seekDeterministic:true,reducedHidesFlight:true,states},null,2));
    console.log(JSON.stringify({errors,mobile,pausedStable:true,seekDeterministic:true,reducedHidesFlight:true}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
