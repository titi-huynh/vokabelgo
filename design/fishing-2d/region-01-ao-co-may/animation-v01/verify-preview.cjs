/* Codex: inspect actual rendered timeline and capture a silent review video. */
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createHash } = require('node:crypto');

async function main() {
  const root = __dirname;
  const out = path.join(root, 'review');
  await fs.mkdir(out, {recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => errors.push(request.url()+': '+request.failure()?.errorText));
  page.on('response', response => {if(response.status()>=400 && !response.url().endsWith('favicon.ico')) errors.push(response.status()+' '+response.url());});
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:3011/', {waitUntil:'networkidle'});
  await page.waitForFunction(() => window.fishingPreview && document.querySelector('canvas'));
  await page.evaluate(() => window.fishingPreview.pause());
  const checksum=async()=>createHash('sha256').update(await page.locator('canvas').screenshot()).digest('hex');
  await page.evaluate(()=>window.fishingPreview.setTime(6));
  const firstHash=await checksum();
  await page.waitForTimeout(250);
  if(await checksum()!==firstHash) throw Error('Paused canvas kept moving');
  await page.evaluate(()=>window.fishingPreview.setTime(16));
  await page.evaluate(()=>window.fishingPreview.setTime(6));
  if(await checksum()!==firstHash) throw Error('Timeline frame depends on render history');
  const frames = [0,2,4,6,8,10,12,14,16,18,19.5];
  const states = [];
  for(const seconds of frames) {
    await page.evaluate(async t => {await window.fishingPreview.setTime(t);}, seconds);
    await page.screenshot({path:path.join(out, 'desktop-'+String(seconds).replace('.','_')+'.png'),fullPage:true});
    states.push({seconds, state:await page.evaluate(() => window.fishingPreview.getState())});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(() => window.fishingPreview.setTime(6));
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  const mobile = await page.evaluate(() => ({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,canvas:document.querySelector('canvas').getBoundingClientRect().toJSON()}));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>window.fishingPreview.getState().reducedMotion);
  const reduced=await page.evaluate(()=>window.fishingPreview.getState());
  if(reduced.activeCritter) throw Error('Reduced motion kept flying critter active');
  await page.screenshot({path:path.join(out,'reduced-motion.png'),fullPage:true});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(() => window.fishingPreview.pause());
  const result = {errors,mobile,pausedFrameStable:true,scrubbingDeterministic:true,reducedMotionHidesCritter:!reduced.activeCritter,states};
  await fs.writeFile(path.join(out,'verification.json'), JSON.stringify(result,null,2));
  if (errors.length || mobile.scrollWidth > mobile.viewport) throw Error('Preview verification failed: '+JSON.stringify(result));
  if (process.argv.includes('--video')) {
    const fps = 24, duration = 20;
    const ffmpeg = spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','pipe:0','-an','-vf','scale=1280:720','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'ao-co-may-showcase-v01.mp4')], {windowsHide:true});
    let stderr='';
    ffmpeg.stderr.on('data',chunk=>stderr+=chunk);
    const done = once(ffmpeg,'close');
    for(let frame=0; frame<fps*duration; frame++) {
      const data = await page.evaluate(async t => {await window.fishingPreview.setTime(t); return document.querySelector('canvas').toDataURL('image/png').split(',')[1];}, frame/fps);
      if(!ffmpeg.stdin.write(Buffer.from(data,'base64'))) await once(ffmpeg.stdin,'drain');
      if(frame%120===0) console.log('Rendered video frame',frame,'/',fps*duration);
    }
    ffmpeg.stdin.end();
    const [code] = await done;
    if(code!==0) throw Error('ffmpeg: '+stderr);
    console.log('Saved 20s silent MP4');
  }
  await browser.close();
  console.log(JSON.stringify({errors,mobile,frameCount:frames.length}));
}
main().catch(error=>{console.error(error); process.exitCode=1;});
