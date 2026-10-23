const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { openPart } = require('./helpers/kino-navigation');
const path = require('path');
const fs = require('fs');
const key = 'vokabelgo_kino_chapters_v1_sakura_s01e01';
const otherKey = 'vokabelgo_kino_chapters_v1_frieren_s01e01';
const otherProgress = { chapter: 2, mode: 'all', completed: [700175], watched: [0], imported: true, alignmentVersion: 2, contentVersion: 1, practiceModeVersion: 1 };
const counts = [48, 22, 40, 20, 40, 26, 34, 28];

async function open(page, query = '?kino=sakura') {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', [otherKey]: otherProgress });
  await page.goto('/' + query);
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('8 phần');
}

test('Sakura source captions have exact, complete practice coverage, honest exclusions, eight parts and seekable media', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await open(page);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Das geheimnisvolle Buch');
  await expect(page.locator('#kinoMovieSummary')).toContainText('lời kết Góc Kero');
  await expect(page.locator('#kinoMovieSummary')).toContainText('25:00');
  await expect(page.locator('#kinoMovieSummary')).not.toContainText('bị cắt');
  await expect(page.locator('#kinoMovieVocabBtn')).toHaveText('📇 Ôn 24 từ và cụm từ');
  const audit = await page.evaluate(() => {
    const cs = SAKURA_S01E01_CAPTION_CUES, us = SAKURA_S01E01_ALIGNED_UTTERANCES;
    const ps = KINO_CHAPTER_DATA.sakura_s01e01.chapters;
    const byId = new Map(cs.map(c => [c.id,c]));
    const words = s => (s.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).join(' ');
    return {
      captions: cs.length, units: us.length,
      invalid: cs.filter((c,i) => !c.text || !c.vi || !c.speaker || c.start<0 || c.end<=c.start || c.end>1500.457 || (i && c.start<cs[i-1].end)).map(c=>c.id),
      exact: JSON.stringify(us.flatMap(u=>u.legacyIds))===JSON.stringify(cs.filter(c=>!c.practiceExcluded).map(c=>c.id)),
      mismatches: us.filter(u=>words(u.text)!==words(u.legacyIds.map(id=>byId.get(id).text).join(' ')) || u.start!==byId.get(u.legacyIds[0]).start || u.end!==byId.get(u.legacyIds.at(-1)).end).map(u=>u.id),
      partCounts: ps.map(p=>us.filter(u=>u.start>=p.start && u.end<=p.end).length),
      uncovered: cs.filter(c=>ps.filter(p=>c.start>=p.start && c.end<=p.end).length!==1).map(c=>c.id),
      picks: ps.every(p=>p.picks.length===7 && new Set(p.picks).size===7 && p.picks.every(id=>us.some(u=>u.id===id && u.start>=p.start && u.end<=p.end && !u.reviewNeeded))),
      mainSrtNumbers: cs.filter(c=>c.sourceSrtNumber).map(c=>c.sourceSrtNumber),
      excluded: cs.filter(c=>c.practiceExcluded).map(c=>c.id),
      reviews: us.filter(u=>u.reviewNeeded).length,
      noMusicExercises: us.every(u=>u.start>=90 && (u.end<=1332.12 || u.start>=1410)),
      examples: SAKURA_S01E01_LESSON.flashcards.every(c=>us.find(u=>u.id===c.cueId)?.text===c.example),
      first: us[0].text, last: us.at(-1).text,
      mode: KINO_CHAPTER_DATA.sakura_s01e01.defaultMode
    };
  });
  expect(audit).toMatchObject({ captions:348, units:258, invalid:[], exact:true, mismatches:[], uncovered:[], picks:true, excluded:[803161,804000], reviews:0, noMusicExercises:true, examples:true, first:'Wer ist da?', last:'Cardcaptor Sakura. Sakura und Tomoyo.', mode:'all', partCounts:counts });
  expect(audit.mainSrtNumbers).toEqual(Array.from({length:315},(_,i)=>i+1));
  const size=fs.statSync(path.join(__dirname,'../video/sakura_s01e01.mp4')).size;
  const range=await request.get('/video/sakura_s01e01.mp4',{headers:{Range:'bytes=2048-4095'}});
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 2048-4095/${size}`);
  expect((await range.body()).length).toBe(2048);
  for(let i=1;i<=8;i++) expect((await request.get(`/assets/kino-posters/sakura_s01e01-${i}.jpg`)).ok()).toBeTruthy();
  await page.setViewportSize({width:1440,height:1050});
  await page.screenshot({path:path.join(__dirname,'../review-assets/kino-sakura-overview-desktop.png'),fullPage:true});
  expect(errors).toEqual([]);
});

test('all eight Sakura parts play, show bilingual subtitles and stop at their boundaries', async ({ page }) => {
  test.setTimeout(60000);
  await open(page);
  for(let i=0;i<8;i++) {
    await openPart(page,i);
    await expect(page).toHaveURL(new RegExp(`kino=sakura&part=${i+1}`));
    await page.locator('#kinoDiscoveryStart').click();
    await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>!v.paused)).toBeTruthy();
    const sample=await page.evaluate(i=>{
      const p=KINO_CHAPTER_DATA.sakura_s01e01.chapters[i];
      const c=SAKURA_S01E01_CAPTION_CUES.find(c=>c.start>=p.start && c.end<=p.end && c.end-c.start>1);
      return {time:(c.start+c.end)/2,text:c.text,vi:c.vi,end:p.end};
    },i);
    await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>{v.pause();v.currentTime=t},sample.time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(sample.text);
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText(sample.vi);
    await page.locator('#kinoDiscoveryVideo').evaluate((v,t)=>{v.currentTime=t-0.25;return v.play()},sample.end);
    await expect.poll(()=>page.locator('#kinoDiscoveryVideo').evaluate(v=>v.paused)).toBeTruthy();
    expect(await page.locator('#kinoDiscoveryVideo').evaluate(v=>v.currentTime)).toBeCloseTo(sample.end,1);
    await page.locator('#kinoListenSentences').click();
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(counts[i]);
  }
  expect((await getStorageJson(page,key)).watched).toEqual([0,1,2,3,4,5,6,7]);
});

test('Sakura full dialogue, focus mode, loop, writing and reload preserve independent progress', async ({ page }) => {
  await open(page,'?kino=sakura&part=1');
  await page.locator('#kinoListenSentences').click();
  await expect(page.locator('#peppaAll')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(48);
  await expect(page.locator('#kinoListenDe')).toHaveText('Wer ist da?');
  await page.locator('#kinoPlayLoopBtn').click();
  await expect.poll(()=>page.locator('#kinoMainVideo').evaluate(v=>v.paused && Math.abs(v.currentTime-98.54)<.05)).toBeTruthy();
  await page.locator('#peppaLight').click();
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
  await page.locator('#peppaPractice').click();
  await page.locator('#kinoDiktatInput').fill('Das war ein falscher Satz.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).toEqual([]);
  await page.locator('#kinoDiktatInput').fill('Das war ja ein komischer Traum.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).toEqual([800010]);
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  expect(await getStorageJson(page,otherKey)).toEqual(otherProgress);
  const normalized=await page.evaluate(()=>({
    age:normalizeKinoClean('zwölf Jahre')===normalizeKinoClean('12 Jahre'),
    wrongAge:normalizeKinoClean('zehn Jahre')===normalizeKinoClean('12 Jahre'),
    grade:normalizeKinoClean('vierte Klasse')===normalizeKinoClean('4. Klasse'),
    page:normalizeKinoClean('Seite vierzehn, dritter Absatz')===normalizeKinoClean('Seite 14, 3. Absatz')
  }));
  expect(normalized).toEqual({age:true,wrongAge:false,grade:true,page:true});
});

test('Sakura vocabulary, phone viewing and review clips use only Sakura resources', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await open(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:path.join(__dirname,'../review-assets/kino-sakura-overview-mobile.png'),fullPage:true});
  await page.locator('#kinoMovieVocabBtn').click();
  await expect(page.locator('#deckSelect')).toHaveValue('🎬 Video: Sakura – Das geheimnisvolle Buch');
  const ids=await page.evaluate(()=>filtered.map(c=>c.id));
  expect(ids).toHaveLength(24);
  expect(ids.every(id=>id.startsWith('vk_sakura_s01e01_'))).toBeTruthy();
  await page.goto('/qa/kino-alignment/sakura_s01e01/review-needed.html');
  await expect(page.locator('article.reviewed')).toHaveCount(7);
  await page.locator('article.reviewed button').first().click();
  await expect.poll(()=>page.locator('video').evaluate(v=>!v.paused)).toBeTruthy();
});

test('reviewed Sakura wording accepts valid alternatives and keeps wrong German rejected', async ({ page }) => {
  await open(page,'?kino=sakura&part=6');
  await page.locator('#peppaPractice').click();
  await page.evaluate(()=>loadKinoSentence(PIZZASCHWESTER_72_SEGMENTS.findIndex(c=>c.id===802580)));
  await page.locator('#kinoDiktatInput').fill('Verlier keine Zeit und dann nimm was!');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).not.toContain(802580);
  await page.locator('#kinoDiktatInput').fill('Verlier keine Zeit! Unternimm was!');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).toContain(802580);

  await page.goto('/?kino=sakura&part=8');
  await page.locator('#peppaPractice').click();
  await page.evaluate(()=>loadKinoSentence(PIZZASCHWESTER_72_SEGMENTS.findIndex(c=>c.id===804006)));
  await page.locator('#kinoDiktatInput').fill('Diese Uniform gibt es langhaarig und kurzhaarig.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).not.toContain(804006);
  await page.locator('#kinoDiktatInput').fill('Diese Uniform gibt es langärmelig und kurzärmelig.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).toContain(804006);
  await page.evaluate(()=>loadKinoSentence(PIZZASCHWESTER_72_SEGMENTS.findIndex(c=>c.id===804007)));
  await page.locator('#kinoDiktatInput').fill('Wie ihr seht, trägt Sakura hier die langärmelige Variante.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).toContain(804007);
  const tail=await page.evaluate(()=>SAKURA_S01E01_ALIGNED_UTTERANCES.filter(c=>c.start>=1459 && c.end<=1470).map(c=>c.text).join(' '));
  expect(tail).toContain('Zusatzinformationen');
  expect(tail).toContain('Tschüss, bis dann!');
});

test('upgrading the old Sakura preview retains completed sentences and adds the restored dream as unfinished work', async ({ page }) => {
  await seedStorage(page, {
    vokabelgo_kino_reset_done_v2026:'true',
    [key]:{chapter:0,mode:'all',completed:[800010,800040],watched:[0],imported:true,alignmentVersion:2,contentVersion:1,practiceModeVersion:1}
  });
  await page.goto('/?kino=sakura&part=1');
  await page.locator('#kinoListenSentences').click();
  const upgraded=await getStorageJson(page,key);
  expect(upgraded.contentVersion).toBe(2);
  expect(upgraded.completed).toEqual([800010,800040]);
  expect(upgraded.watched).toEqual([0]);
  expect(upgraded.completed).not.toContain(805000);
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(48);
  await expect(page.locator('#kinoListenDe')).toHaveText('Wer ist da?');
  await page.reload();
  expect((await getStorageJson(page,key)).completed).toEqual([800010,800040]);
});
