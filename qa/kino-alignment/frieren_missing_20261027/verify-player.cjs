const {chromium,expect,request}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),qa=__dirname,baseUrl=process.env.FRIEREN_QA_BASE_URL||'http://127.0.0.1:3109';
(async()=>{
  const review=JSON.parse(fs.readFileSync(path.join(qa,'review.json'),'utf8'));
  const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('vokabelgo_clean_slate_fresh_v2026','true');localStorage.setItem('vokabelgo_kino_reset_done_v2026','true');});
  await page.goto(baseUrl+'/?kino=frieren2&part=1');
  await expect(page.locator('#kinoLessonTabs')).toBeVisible();
  const data=await page.evaluate(()=>({cues:FRIEREN_S01E02_CAPTION_CUES,chapters:KINO_CHAPTER_DATA.frieren_s01e02.chapters}));
  expect(data.cues.length).toBe(235+review.added.length);
  const added=review.added.map(c=>data.cues.find(x=>x.id===c.id));
  if(added.some(c=>!c))throw new Error('Missing added cue');
  const api=await request.newContext(),media=[];
  for(const [src,width,height]of [['video/frieren_s01e02-web-v1.mp4',1280,720],['video/kino-light/frieren_s01e02-480p-v1.mp4',854,480]]){
    const bytes=fs.statSync(path.join(root,src)).size,response=await api.get(baseUrl+'/'+src,{headers:{Range:'bytes=0-63'}});
    expect(response.status()).toBe(206);expect(response.headers()['content-range']).toBe(`bytes 0-63/${bytes}`);
    expect((await response.body()).subarray(4,8).toString()).toBe('ftyp');
    const check=await browser.newPage();await check.goto(baseUrl+'/?kino=frieren2&part=1');
    await check.setContent(`<video id="qaVideo" muted controls src="/${src}"></video>`);
    const video=check.locator('#qaVideo');await expect.poll(()=>video.evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(1);
    expect(await video.evaluate(v=>[v.videoWidth,v.videoHeight])).toEqual([width,height]);
    expect(await video.evaluate(v=>v.duration)).toBeCloseTo(1560.102313,1);
    for(const time of [300,1545]){await video.evaluate((v,t)=>{v.currentTime=t;return v.play();},time);await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(time+.1);expect(await video.evaluate(v=>v.error)).toBeNull();await video.evaluate(v=>v.pause());}
    media.push({src,bytes,width,height,byteRange:true,seekAndPlay:true});await check.close();
  }
  await api.dispose();
  let partIndex=-1;const results=[];
  for(const cue of added){
    const nextPart=data.chapters.findIndex(c=>c.start<=cue.start&&c.end>=cue.end);if(nextPart<0)throw new Error('Cue outside chapter '+cue.id);
    if(partIndex!==nextPart){await page.goto(baseUrl+`/?kino=frieren2&part=${nextPart+1}`);await expect(page.locator('#kinoLessonTabs')).toBeVisible();await page.locator('#kinoDiscoveryStart').click();await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>v.readyState>=2)).toBeTruthy();await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.pause());partIndex=nextPart;}
    const chapter=data.chapters[partIndex],boundaries=[];
    for(const [label,time]of [['before',Math.max(cue.start-.04,chapter.start+.001)],['middle',(cue.start+cue.end)/2],['after',Math.min(cue.end+.04,chapter.end-.001)]]){
      const expected=data.cues.find(c=>c.start<=time&&c.end>time);
      await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>new Promise(resolve=>{v.pause();if(Math.abs(v.currentTime-t)<.001)return resolve();v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;}),time);
      await expect(page.locator('#kinoDiscoveryDe')).toHaveText(expected?.text||'');await expect(page.locator('#kinoDiscoveryVi')).toHaveText(expected?.vi||'');
      boundaries.push({label,time,expectedId:expected?.id||null,pass:true});
    }
    results.push({...cue,boundaries,pass:true});
    if([0,Math.floor(added.length/2),added.length-1].includes(results.length-1)){
      await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>{v.currentTime=t;},(cue.start+cue.end)/2);await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
      await page.screenshot({path:path.join(qa,`player-cue-${cue.id}.png`),fullPage:true});
    }
  }
  let mobile={width:390,pass:true,checked:0};
  if(added.length){
    await page.setViewportSize({width:390,height:844});const cue=added[Math.floor(added.length/2)],part=data.chapters.findIndex(c=>c.start<=cue.start&&c.end>=cue.end);
    await page.goto(baseUrl+`/?kino=frieren2&part=${part+1}`);await expect(page.locator('#kinoLessonTabs')).toBeVisible();await page.locator('#kinoDiscoveryStart').click();await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>v.readyState>=2)).toBeTruthy();
    await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>{v.pause();v.currentTime=t;},(cue.start+cue.end)/2);await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);await expect(page.locator('#kinoDiscoveryVi')).toHaveText(cue.vi);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:path.join(qa,'player-mobile.png'),fullPage:true});mobile.checked=1;
  }
  const report={source:`Unmodified Kino player at ${baseUrl}, archived source audio in 720p and 480p MP4`,checked:results.length,total:added.length,errors,mobile,media,results};
  fs.writeFileSync(path.join(qa,'player-verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();if(errors.length)throw new Error(errors.join('\n'));console.log(JSON.stringify({checked:report.checked,total:report.total,media:media.length,mobile,errors}));
})().catch(e=>{console.error(e);process.exit(1);});
