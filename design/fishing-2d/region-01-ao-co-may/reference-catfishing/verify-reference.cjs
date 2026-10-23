const {chromium}=require('@playwright/test');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:3012/',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.idleStudy.getState().ready);
    await page.evaluate(()=>window.idleStudy.pause());
    await page.locator('summary').click();
    await page.waitForFunction(()=>document.querySelector('#motionReference').readyState>=1);
    await page.getByRole('button',{name:'3,2s · Cá vào thùng',exact:true}).click();
    await page.waitForFunction(()=>{const v=document.querySelector('#motionReference');return v.readyState>=2&&Math.abs(v.currentTime-3.2)<.05});
    const state=await page.locator('#motionReference').evaluate(v=>({duration:v.duration,time:v.currentTime,paused:v.paused,muted:v.muted,src:v.currentSrc,width:v.videoWidth,height:v.videoHeight}));
    if(errors.length||!state.paused||!state.muted)throw Error(JSON.stringify({errors,state}));
    await page.locator('.reference').screenshot({path:path.join(__dirname,'reference-panel.png')});
    console.log(JSON.stringify({errors,state}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
