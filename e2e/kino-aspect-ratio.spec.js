const {test,expect}=require('@playwright/test');
const {seedStorage}=require('./helpers/storage');
const movies=['peppa_supermarkt','pizzaschwester','babysitter','hans','trudes_fahrstuhl','erdmaennchen_nudeltrick','frieren_s01e01','sakura_s01e01'];
async function checkFrame(page,selector,ratio){
 const info=await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return {ratio:r.width/r.height,fit:getComputedStyle(el.querySelector('video')).objectFit}});
 expect(info.ratio).toBeCloseTo(ratio,2);expect(info.fit).toBe('contain');
}
test('every film uses its native ratio before playback without eager movie downloads',async({page})=>{
 await seedStorage(page,{vokabelgo_kino_reset_done_v2026:'true'});
 const requests=[];page.on('request',r=>{if(/\/video\/.*\.mp4/.test(r.url()))requests.push(r.url())});
 await page.goto('/?hub=kino');
 for(const key of movies){
  await page.locator(`.kino-film-card[data-movie="${key}"]`).click();
  await page.locator('.peppa-part[data-chapter="0"]').click();
  await checkFrame(page,'#kinoDiscoveryStage',key==='sakura_s01e01'?4/3:16/9);
  if(key==='sakura_s01e01'){
   const poster=await page.locator('#kinoDiscoveryVideo').evaluate(v=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth/i.naturalHeight);i.src=v.poster}));
   expect(poster).toBeCloseTo(4/3,4);
  }
  await page.locator('#kinoCatalogBack').click();await page.locator('#kinoCatalogBack').click();
 }
 expect(requests).toEqual([]);
});
test('watching and sentence practice fit each source without stretching or clipping',async({page})=>{
 test.setTimeout(60000);await seedStorage(page,{vokabelgo_kino_reset_done_v2026:'true'});await page.goto('/?hub=kino');
 for(const key of movies){
  await page.locator(`.kino-film-card[data-movie="${key}"]`).click();await page.locator('.peppa-part[data-chapter="0"]').click();
  await page.locator('#kinoDiscoveryStart').click();
  await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>!v.paused&&v.readyState>=2)).toBeTruthy();
  const ratio=await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.videoWidth/v.videoHeight);
  await checkFrame(page,'#kinoDiscoveryStage',ratio);
  await page.locator('#kinoListenSentences').click();
  await expect.poll(()=>page.locator('#kinoMainVideo').evaluate(v=>v.readyState>=2)).toBeTruthy();
  await checkFrame(page,'.kino-v3-video-frame',ratio);
  await page.locator('#kinoCatalogBack').click();await page.locator('#kinoCatalogBack').click();
 }
});
