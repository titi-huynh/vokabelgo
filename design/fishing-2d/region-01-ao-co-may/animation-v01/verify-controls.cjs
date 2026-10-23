const {chromium}=require('@playwright/test');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:3011/',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.fishingPreview);
    await page.locator('#btnAmbient').click();
    await page.waitForTimeout(220);
    let state=await page.evaluate(()=>window.fishingPreview.getState());
    if(state.mode!=='ambient'||!state.isPlaying||state.time<=0)throw Error('Ambient button did not start');
    await page.locator('#btnPlayPause').click();
    const stopped=await page.evaluate(()=>window.fishingPreview.getState().time);
    await page.waitForTimeout(160);
    if(await page.evaluate(()=>window.fishingPreview.getState().time)!==stopped)throw Error('Pause clock changed');
    await page.locator('#btnCatch').click();
    state=await page.evaluate(()=>window.fishingPreview.getState());
    if(!state.isPlaying||state.activeCritter)throw Error('Catch button did not resume or overlap critter');
    if(await page.evaluate(()=>window.fishingPreview.trigger('dragonfly'))!==false)throw Error('Critter overlapped catch');
    await page.waitForTimeout(1300);
    const catchState=await page.evaluate(()=>window.fishingPreview.getState());
    if(!catchState.pose.fish.visible)throw Error('Fish did not enter catch arc');
    await page.evaluate(()=>window.fishingPreview.pause());
    await page.locator('#btnShowcase').click();
    state=await page.evaluate(()=>window.fishingPreview.getState());
    if(state.mode!=='showcase'||!state.isPlaying)throw Error('Showcase button did not restart');
    await page.locator('#chkReducedMotion').check();
    await page.locator('#btnDragonfly').click();
    state=await page.evaluate(()=>window.fishingPreview.getState());
    if(!state.reducedMotion||state.activeCritter)throw Error('Reduced motion did not suppress critter');
    if(errors.length)throw Error(errors.join('\n'));
    const result={ambientButtonStarts:true,pauseClockStable:true,catchButtonResumes:true,critterDeferredDuringCatch:true,fishArcVisible:true,showcaseButtonRestarts:true,reducedMotionSuppressesCritter:true,errors};
    await fs.writeFile(path.join(__dirname,'review','controls-verification.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
