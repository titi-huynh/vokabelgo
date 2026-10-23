const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { openPart, openOverview } = require('./helpers/kino-navigation');
const fs = require('fs');
const path = require('path');

test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });
const stateKey = 'vokabelgo_kino_chapters_v1_we_bare_bears_mall';
const previousPeppa = { chapter: 2, mode: 'light', completed: [104701], watched: [0], imported: true, alignmentVersion: 2 };
const capture = name => path.join(__dirname, '../review-assets', name);
async function open(page, query = '?kino=bears') {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', vokabelgo_kino_peppa_chapters_v1: previousPeppa });
  await page.goto('/' + query);
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('3 phần');
}

test('reviewed dialogue keeps speaker turns and timing while retaining earlier progress', async ({ page }) => {
  await seedStorage(page, {
    vokabelgo_kino_reset_done_v2026: 'true',
    [stateKey]: { chapter: 0, mode: 'all', completed: [1100112], watched: [], imported: true, alignmentVersion: 2, practiceModeVersion: 1, contentVersion: 1 },
    kino_calibrated_we_bare_bears_mall_v1: [{ id: 1100112, start: 66.36, end: 69.34, speaker: 'Griff', text: 'Warte mal, Grizz. Was geht hier vor?', vi: 'Bản căn giờ cũ' }]
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?kino=bears&part=1');
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('3 phần');
  const audit = await page.evaluate(() => {
    const cues = WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES;
    return { count: cues.length, retired: cues.some(c => c.id === 1100112),
      question: cues.find(c => c.id === 1100166), next: cues.find(c => c.id === 1100113),
      laterSentence: cues.find(c => c.id === 1100117),
      speakers: [1100149, 1100154, 1100161, 1100163].map(id => cues.find(c => c.id === id).speaker),
      outdatedSpelling: cues.some(c => /Estella\b/.test(c.text)) };
  });
  expect(audit.count).toBe(57);
  expect(audit.retired).toBe(false);
  expect(audit.question.text).toBe('Na, was geht hier vor? Wo ist die ganze Action?');
  expect(audit.next.start).toBeGreaterThanOrEqual(audit.question.end);
  expect(audit.next.start).toBeGreaterThanOrEqual(70.38);
  expect(audit.laterSentence.start).toBeGreaterThanOrEqual(83.9);
  expect(audit.speakers).toEqual(['Grizz', 'Fan đội mũ đỏ', 'Tom', 'Grizz / Griff']);
  expect(audit.outdatedSpelling).toBe(false);
  const saved = await getStorageJson(page, stateKey);
  expect(saved.completed).toContain(1100112);
  expect(saved.completed).not.toContain(1100166);
  expect(saved.contentVersion).toBe(2);
  await page.locator('#kinoDiscoveryStart').click();
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();
  await page.locator('#kinoDiscoveryVideo').evaluate(v => { v.pause(); v.currentTime = 69.8; });
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText(audit.question.text);
  await expect(page.locator('#kinoDiscoveryVi')).toHaveText(audit.question.vi);
  await page.screenshot({ path: capture('kino-we-bare-bears-reviewed-question-mobile.png'), fullPage: true });
  await page.locator('#kinoDiscoveryVideo').evaluate(v => { v.currentTime = 70.7; });
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText(audit.next.text);
});

test('We Bare Bears Mall clip is discoverable with its own bilingual lessons, covers, vocabulary and seekable local video', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page);
  await page.locator('[data-nav="kino"]').click();
  await page.locator('.kino-film-card[data-movie="we_bare_bears_mall"]').click();
  await expect(page).toHaveURL(/kino=bears$/);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Wir und die Mall (Đoạn trích)');
  await expect(page.locator('#kinoMovieSeries')).toHaveText('WE BARE BEARS – BÄREN WIE WIR');
  await expect(page.locator('#kinoMovieSummary')).toContainText('04:34');
  await expect(page.locator('#kinoMovieSummary')).toContainText('Đoạn trích chính thức');
  await expect(page.locator('#kinoMovieVocabBtn')).toHaveText('📇 Ôn 18 từ và cụm từ');
  await expect(page.locator('.peppa-part')).toHaveCount(3);
  const audit = await page.evaluate(() => {
    const { cues, chapters, isExcerpt } = KINO_CHAPTER_DATA.we_bare_bears_mall;
    return {
      isExcerpt,
      count: cues.length, unique: new Set(cues.map(c => c.id)).size,
      invalid: cues.filter((c, i) => !c.text || !c.vi || !c.speaker || c.start < 0 || c.end <= c.start || c.end > 274.04 || (i && c.start < cues[i-1].end)).map(c => c.id),
      uncovered: cues.filter(c => chapters.filter(p => c.start >= p.start && c.end <= p.end).length !== 1).map(c => c.id),
      picks: chapters.map(p => p.picks.map(id => cues.find(c => c.id === id && c.start >= p.start && c.end <= p.end)?.text)),
      examples: WE_BARE_BEARS_MALL_LESSON.flashcards.every(c => cues.some(s => s.id === c.cueId && s.text === c.example)),
      lastText: cues[cues.length - 1].text
    };
  });
  expect(audit.isExcerpt).toBe(true);
  expect(audit.count).toBe(57);
  expect(audit.unique).toBe(audit.count);
  expect(audit.invalid).toEqual([]);
  expect(await page.evaluate(() => WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES.some(c => c.id === 1100133))).toBe(false);
  expect(audit.uncovered).toEqual([]);
  expect(audit.examples).toBeTruthy();
  expect(audit.lastText).toContain('Vergesst mich nicht');
  for (const picks of audit.picks) { expect(picks).toHaveLength(7); expect(picks.every(Boolean)).toBeTruthy(); }
  for (let i = 1; i <= 3; i++) {
    const response = await request.get(`/assets/kino-posters/we_bare_bears_mall-${i}.jpg`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/jpeg');
  }
  const range = await request.get('/video/we_bare_bears_mall.mp4', { headers: { Range: 'bytes=1024-2047' } });
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 1024-2047/${fs.statSync(path.join(__dirname, '../video/we_bare_bears_mall.mp4')).size}`);
  expect((await range.body()).length).toBe(1024);
  await page.locator('#kinoFullMovieBtn').click();
  await expect(page.locator('#kinoFullMovieModal')).toBeVisible();
  await expect(page.locator('#kinoFullPlayer')).toHaveAttribute('src', 'video/we_bare_bears_mall.mp4');
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => !v.paused && v.duration > 273)).toBeTruthy();
  await page.locator('#kinoFullMovieModal button[onclick="closeKinoFullMovieModal()"]').click();
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => v.paused)).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: capture('kino-we-bare-bears-overview-desktop.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('every We Bare Bears Mall part plays, displays matching DE/VI captions and stops at its own boundary', async ({ page }) => {
  await open(page);
  let total = 0;
  for (let i = 0; i < 3; i++) {
    await openPart(page, i);
    await expect(page).toHaveURL(new RegExp(`kino=bears&part=${i+1}`));
    await page.locator('#kinoDiscoveryStart').click();
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();
    const data = await page.evaluate(index => {
      const part = KINO_CHAPTER_DATA.we_bare_bears_mall.chapters[index];
      const cue = WE_BARE_BEARS_MALL_CAPTION_CUES.find(c => c.id === part.picks[2]);
      return { end: part.end, time: (cue.start + cue.end)/2, text: cue.text, vi: cue.vi,
        count: WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES.filter(c => c.start >= part.start && c.end <= part.end).length };
    }, i);
    await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, data.time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(data.text);
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText(data.vi);
    await page.locator('#kinoDiscoveryCC').click();
    await expect(page.locator('#kinoDiscoveryDe')).toBeEmpty();
    await page.locator('#kinoDiscoveryCC').click();
    await page.locator('#kinoDiscoveryVideo').evaluate((v, end) => { v.currentTime = end - .2; return v.play(); }, data.end);
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
    expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeCloseTo(data.end, 2);
    await page.locator('#kinoListenSentences').click();
    await expect(page.locator('#peppaAll')).toHaveText('Các câu trong bài');
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(data.count);
    total += data.count;
  }
  expect(total).toBe(57);
  expect((await getStorageJson(page, stateKey)).watched).toEqual([0, 1, 2]);
});

test('dictation, seven-cue selection and saved progress remain independent of Peppa', async ({ page }) => {
  await open(page, '?kino=bears&part=2');
  await page.locator('#peppaPractice').click();
  await page.locator('#peppaLight').click();
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
  const first = await page.locator('#kinoOverlayDe').textContent();
  await page.locator('#kinoDiktatInput').fill('Banane');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([]);
  await page.locator('#kinoDiktatInput').fill(first);
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([1100125]);
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
  expect(await getStorageJson(page, 'vokabelgo_kino_peppa_chapters_v1')).toEqual(previousPeppa);
});

test('We Bare Bears vocabulary opens only its own 18 source-linked flashcards with valid chapter backlinks', async ({ page }) => {
  await open(page);
  await page.locator('#kinoMovieVocabBtn').click();
  await expect(page.locator('#deckSelect')).toHaveValue('🎬 Video: We Bare Bears – Wir und die Mall (Đoạn trích)');
  const cards = await page.evaluate(() => filtered.map(c => ({ id: c.id, term: c.term, deck: c.deck, sourceUrl: c.sourceUrl })));
  expect(cards).toHaveLength(18);
  expect(cards.every(c => c.id.startsWith('vk_we_bare_bears_mall_'))).toBeTruthy();
  expect(cards.every(c => /^\?kino=bears&part=[1-3]$/.test(c.sourceUrl))).toBeTruthy();
  expect(cards.some(c => c.term === 'die Rolltreppe')).toBeTruthy();
  await page.goto('/' + cards.find(c => c.term === 'die Rolltreppe').sourceUrl);
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 2 / 3');
});

test('We Bare Bears works on a phone and can record a speaking take before completing dictation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '?kino=bears&part=2');
  await page.locator('#kinoDiscoveryStart').click();
  const cue = await page.evaluate(() => WE_BARE_BEARS_MALL_CAPTION_CUES.find(c => c.id === 1100132));
  await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, (cue.start + cue.end)/2);
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
  await page.screenshot({ path: capture('kino-we-bare-bears-lesson-mobile.png'), fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#kinoSpeakChoice').click();
  await page.locator('#kinoDubRecordBtn').click();
  await expect(page.locator('#kinoRecordingHud')).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(350);
  await page.locator('#kinoDubRecordBtn').click();
  await expect(page.locator('#kinoDubReplayRow')).toBeVisible();
  expect(await page.evaluate(async () => (await (await fetch(kinoDubbingBlobUrls[kinoCurrentIndex])).blob()).size)).toBeGreaterThan(100);
  expect((await getStorageJson(page, stateKey)).completed).toEqual([]);
  await openOverview(page);
  await openPart(page, 2);
  await page.goBack();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/kino=bears&part=3/);
});
