const { chromium, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../..');
const qa = path.join(root, 'qa/kino-alignment/dungeon_missing_20261027');
const baseUrl = process.env.DUNGEON_QA_BASE_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('vokabelgo_clean_slate_fresh_v2026', 'true');
    localStorage.setItem('vokabelgo_kino_reset_done_v2026', 'true');
  });
  await page.goto(baseUrl + '/?kino=dungeon&part=1');
  await expect(page.locator('#kinoLessonTabs')).toBeVisible();
  const data = await page.evaluate(() => ({ cues: DELICIOUS_IN_DUNGEON_S01E01_CAPTION_CUES, chapters: KINO_CHAPTER_DATA.delicious_in_dungeon_s01e01.chapters }));
  const added = data.cues.filter(c => c.id > 1200384);
  if (!added.length) throw new Error('No added cues found');
  if (data.cues.length !== 372 || added.length !== 5 || data.cues.some(c=>c.id===1200388)) throw new Error('Unexpected cue counts or withheld ID');
  const results = [];
  let partIndex = -1;
  for (const cue of added) {
    const nextPart = data.chapters.findIndex(c => c.start <= cue.start && c.end >= cue.end);
    if (nextPart < 0) throw new Error(`No chapter contains ${cue.id}`);
    if (partIndex !== nextPart) {
      await page.goto(baseUrl + `/?kino=dungeon&part=${nextPart + 1}`);
      await expect(page.locator('#kinoLessonTabs')).toBeVisible();
      await page.locator('#kinoDiscoveryStart').click();
      await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.readyState >= 2)).toBeTruthy();
      await page.locator('#kinoDiscoveryVideo').evaluate(v => v.pause());
      partIndex = nextPart;
    }
    const boundaries = [];
    const beforeTime = Math.max(cue.start - .04, data.chapters[partIndex].start + .001);
    for (const [label, time] of [['before', beforeTime], ['middle', (cue.start + cue.end) / 2], ['after', cue.end + .04]]) {
      const chapter = data.chapters[partIndex];
      if (time <= chapter.start || time >= chapter.end - .04) continue;
      const expected = data.cues.find(c => c.start <= time && c.end > time);
      await page.locator('#kinoDiscoveryVideo').evaluate((v, t) => new Promise(resolve => {
        v.pause();
        if (Math.abs(v.currentTime - t) < .001) return resolve();
        v.addEventListener('seeked', () => resolve(), { once: true });
        v.currentTime = t;
      }), time);
      await expect(page.locator('#kinoDiscoveryDe')).toHaveText(expected?.text || '');
      await expect(page.locator('#kinoDiscoveryVi')).toHaveText(expected?.vi || '');
      boundaries.push({ label, time, expectedId: expected?.id || null, pass: true });
    }
    const video = await page.locator('#kinoDiscoveryVideo').evaluate(v => ({ duration: v.duration, readyState: v.readyState, width: v.videoWidth, height: v.videoHeight }));
    results.push({ ...cue, boundaries, video, pass: true });
    if ([0, Math.floor(added.length / 2), added.length - 1].includes(results.length - 1)) {
      await page.locator('#kinoDiscoveryVideo').evaluate((v, t) => { v.currentTime = t; }, (cue.start + cue.end) / 2);
      await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
      await page.screenshot({ path: path.join(qa, `player-cue-${cue.id}.png`), fullPage: true });
    }
  }
  const withheldCueChecks = [];
  const withheldPart = data.chapters.findIndex(c=>c.start<=1155.84 && c.end>1155.84);
  await page.goto(baseUrl + `/?kino=dungeon&part=${withheldPart+1}`);
  await expect(page.locator('#kinoLessonTabs')).toBeVisible();
  await page.locator('#kinoDiscoveryStart').click();
  await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>v.readyState>=2)).toBeTruthy();
  for(const time of [1155.03,1155.84,1156.65]){
    if(data.cues.some(c=>c.start<=time&&c.end>time))throw new Error('Withheld span unexpectedly has a caption');
    await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>new Promise(resolve=>{v.pause();if(Math.abs(v.currentTime-t)<.001)return resolve();v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;}),time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText('');
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText('');
    withheldCueChecks.push({time,expectedId:null,pass:true});
  }
  await page.screenshot({path:path.join(qa,'player-withheld-1200388.png'),fullPage:true});
  await page.setViewportSize({ width: 390, height: 844 });
  const cue = added[Math.floor(added.length / 2)];
  const index = data.chapters.findIndex(c => c.start <= cue.start && c.end >= cue.end);
  await page.goto(baseUrl + `/?kino=dungeon&part=${index + 1}`);
  await expect(page.locator('#kinoLessonTabs')).toBeVisible();
  await page.locator('#kinoDiscoveryStart').click();
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.readyState >= 2)).toBeTruthy();
  await page.locator('#kinoDiscoveryVideo').evaluate((v, t) => { v.pause(); v.currentTime = t; }, (cue.start + cue.end) / 2);
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
  await expect(page.locator('#kinoDiscoveryVi')).toHaveText(cue.vi);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) throw new Error('Mobile overflow');
  await page.screenshot({ path: path.join(qa, 'player-mobile.png'), fullPage: true });
  const report = { source: `Unmodified Kino player at ${baseUrl}, real original and Kino light MP4 files`, checked: results.length, total: added.length, errors, mobile: { width: 390, pass: true }, withheldCueId:1200388,withheldCueChecks, results };
  fs.writeFileSync(path.join(qa, 'player-verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ checked: report.checked, mobile: report.mobile, errors }));
})().catch(e => { console.error(e); process.exit(1); });
