const {test,expect}=require('@playwright/test');
const {seedStorage,getStorageJson}=require('./helpers/storage');
const progressKey='vokabelgo_kino_chapters_v1_sakura_s01e01';
const players='#kinoMainVideo, #kinoDiscoveryVideo, #kinoFullPlayer';
async function open(page,query='?kino=sakura&part=1') {
 await seedStorage(page,{vokabelgo_kino_reset_done_v2026:'true'});
 await page.goto('/'+query);
 if(query==='?hub=kino') await expect(page.locator('#kinoCatalog')).toBeVisible();
 else await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('8 phần');
}
async function ready(page,id) {
 await expect.poll(()=>page.locator(id).evaluate(v=>!v.paused && v.readyState>=2 && !v.seeking)).toBeTruthy();
}
test('all eight Kino films stay free of media requests until a play or practice action',async({page})=>{
 const requests=[];page.on('request',r=>{if(/\/(video|assets\/kino-dubbing)\/.*\.(mp4|mp3)(\?|$)/.test(r.url()))requests.push(r.url())});
 await open(page,'?hub=kino');
 for(const key of await page.locator('.kino-film-card').evaluateAll(cards=>cards.map(c=>c.dataset.movie))){
  await page.locator(`.kino-film-card[data-movie="${key}"]`).click();
  await page.locator('.peppa-part[data-chapter="0"]').click();
  await expect.poll(()=>page.locator(players).evaluateAll(vs=>vs.every(v=>!v.hasAttribute('src')))).toBeTruthy();
  await page.locator('#kinoCatalogBack').click();
  await page.locator('#kinoCatalogBack').click();
 }
 await page.waitForTimeout(1200);
 expect(requests).toEqual([]);
 await expect(page.locator('#kdsVideo')).not.toHaveAttribute('src');
});
test('Sakura quality switches preserve paused timestamp, subtitles, draft text and independent progress',async({page,request})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await open(page);
 await expect(page.locator('#kinoQuality')).toHaveValue('480p');
 await page.locator('#kinoDiscoveryStart').click();await ready(page,'#kinoDiscoveryVideo');
 await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('src',/480p/);
 const cue=await page.evaluate(()=>SAKURA_S01E01_CAPTION_CUES.find(c=>c.id===800010));
 await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>{v.pause();v.currentTime=t},(cue.start+cue.end)/2);
 await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
 const before=await getStorageJson(page,progressKey);
 const time=await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.currentTime);
 await page.locator('#kinoQuality').selectOption('original');
 await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>v.readyState>=2 && !v.seeking)).toBeTruthy();
 await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('src','video/sakura_s01e01.mp4?v=2');
 expect(await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.paused)).toBeTruthy();
 expect(await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.currentTime)).toBeCloseTo(time,1);
 await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
 await expect(page.locator('#kinoDiscoveryVi')).toHaveText(cue.vi);
 expect(await getStorageJson(page,progressKey)).toEqual(before);
 await page.locator('#peppaPractice').click();await ready(page,'#kinoMainVideo');
 await expect(page.locator('#kinoDiscoveryVideo')).not.toHaveAttribute('src');
 await page.locator('#kinoDiktatInput').fill('Bản nháp đang viết');
 await page.locator('#kinoMainVideo').evaluate(v=>{v.pause();v.playbackRate=.75});
 await page.locator('#kinoQuality').selectOption('480p');
 await expect.poll(()=>page.locator('#kinoMainVideo').evaluate(v=>v.readyState>=2 && !v.seeking)).toBeTruthy();
 await expect(page.locator('#kinoDiktatInput')).toHaveValue('Bản nháp đang viết');
 expect(await page.locator('#kinoMainVideo').evaluate(v=>v.playbackRate)).toBe(.75);
 await expect(page.locator('#kinoTimelineList > button')).toHaveCount(48);
 expect(await getStorageJson(page,progressKey)).toEqual(before);
 await page.locator('#kinoDiktatInput').fill('Wer ist da?');await page.locator('#kinoCheckBtn').click();
 expect((await getStorageJson(page,progressKey)).completed).toContain(805000);
 await page.reload();await page.locator('#peppaPractice').click();
 await expect(page.locator('#kinoQuality')).toHaveValue('480p');
 expect((await getStorageJson(page,progressKey)).completed).toContain(805000);
 const range=await request.get('/video/sakura_s01e01-480p.mp4',{headers:{Range:'bytes=2048-4095'}});
 expect(range.status()).toBe(206);expect((await range.body()).length).toBe(2048);
 expect(errors).toEqual([]);
});
test('changing quality while playing resumes the same sentence; leaving cancels pending loads',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page,'?kino=sakura&part=8');
 await page.locator('#kinoDiscoveryStart').click();await ready(page,'#kinoDiscoveryVideo');
 const time=await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.currentTime);
 await page.locator('#kinoQuality').selectOption('original');await ready(page,'#kinoDiscoveryVideo');
 const after=await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.currentTime);
 expect(after).toBeGreaterThanOrEqual(time-.05);expect(after-time).toBeLessThan(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'review-assets/kino-sakura-light-mobile.png',fullPage:true});
 await page.locator('#kinoCatalogBack').click();
 await expect.poll(()=>page.locator(players).evaluateAll(vs=>vs.every(v=>!v.hasAttribute('src') && v.paused))).toBeTruthy();
 await page.locator('.peppa-part[data-chapter="0"]').click();
 let release;const gate=new Promise(resolve=>release=resolve);
 await page.route('**/video/sakura_s01e01.mp4?*',async route=>{await gate;await route.continue().catch(()=>{})});
 await page.locator('#kinoDiscoveryStart').click();
 await page.locator('#kinoCatalogBack').click();release();
 await page.waitForTimeout(600);
 await expect.poll(()=>page.locator(players).evaluateAll(vs=>vs.every(v=>!v.hasAttribute('src') && v.paused))).toBeTruthy();
});
test('full movie quality control preserves position and closing releases the movie',async({page})=>{
 await open(page,'?kino=sakura');
 await page.locator('#kinoFullMovieBtn').click();await ready(page,'#kinoFullPlayer');
 await page.locator('#kinoFullPlayer').evaluate(v=>{v.pause();v.currentTime=1464});
 await expect.poll(()=>page.locator('#kinoFullPlayer').evaluate(v=>!v.seeking && v.readyState>=2)).toBeTruthy();
 const before=await getStorageJson(page,progressKey);
 await page.locator('#kinoFullQuality').selectOption('original');
 await expect.poll(()=>page.locator('#kinoFullPlayer').evaluate(v=>!v.seeking && v.readyState>=2 && Math.abs(v.currentTime-1464)<.05)).toBeTruthy();
 await expect(page.locator('#kinoFullPlayer')).toHaveAttribute('src','video/sakura_s01e01.mp4?v=2');
 expect(await page.locator('#kinoFullPlayer').evaluate(v=>v.paused)).toBeTruthy();
 expect(await getStorageJson(page,progressKey)).toEqual(before);
 await page.getByRole('button',{name:'✖️ Quay lại bài học'}).click();
 await expect(page.locator('#kinoFullPlayer')).not.toHaveAttribute('src');
 await expect(page.locator('#kinoQuality')).toHaveValue('original');
});
test('reopening the listening view resumes its playhead after releasing hidden media',async({page})=>{
 await open(page);await page.locator('#kinoDiscoveryStart').click();await ready(page,'#kinoDiscoveryVideo');
 await page.locator('#kinoDiscoveryVideo').evaluate(v=>{v.pause();v.currentTime=160});
 await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>!v.seeking)).toBeTruthy();
 await page.locator('#peppaPractice').click();await ready(page,'#kinoMainVideo');
 await page.locator('#kinoListenChoice').click();
 await expect(page.locator('#kinoDiscoveryVideo')).not.toHaveAttribute('src');
 await page.locator('#kinoDiscoveryStart').click();await ready(page,'#kinoDiscoveryVideo');
 const time=await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.currentTime);
 expect(time).toBeGreaterThanOrEqual(160);expect(time).toBeLessThan(162);
});
