const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { openPart, openOverview } = require('./helpers/kino-navigation');
const fs = require('fs');
const path = require('path');

test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });
const stateKey = 'vokabelgo_kino_chapters_v1_erdmaennchen_schmucklose';
const previousPeppa = { chapter: 2, mode: 'light', completed: [104701], watched: [0], imported: true, alignmentVersion: 2 };
const capture = name => path.join(__dirname, '../test-results/captures/review-assets', name);
async function open(page, query = '?kino=schmucklose') {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', vokabelgo_kino_peppa_chapters_v1: previousPeppa });
  await page.goto('/' + query);
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('7 phần');
}

test('Die schmucklose Gräfin is discoverable with its own bilingual lessons, covers, vocabulary and seekable original video', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page);
  await page.locator('[data-nav="kino"]').click();
  await page.locator('.kino-film-card[data-movie="erdmaennchen_schmucklose"]').click();
  await expect(page).toHaveURL(/kino=schmucklose$/);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Die schmucklose Gräfin');
  await expect(page.locator('#kinoMovieSeries')).toHaveText('EIN FALL FÜR DIE ERDMÄNNCHEN');
  await expect(page.locator('#kinoMovieSummary')).toContainText('12:02');
  await expect(page.locator('#kinoMovieVocabBtn')).toHaveText('📇 Ôn 24 từ và cụm từ');
  await expect(page.locator('.peppa-part')).toHaveCount(7);
  const audit = await page.evaluate(() => {
    const { cues, chapters } = KINO_CHAPTER_DATA.erdmaennchen_schmucklose;
    return {
      count: cues.length, unique: new Set(cues.map(c => c.id)).size,
      invalid: cues.filter((c, i) => !c.text || !c.vi || !c.speaker || c.start < 0 || c.end <= c.start || c.end > 722.48 || (i && c.start < cues[i-1].end)).map(c => c.id),
      uncovered: cues.filter(c => chapters.filter(p => c.start >= p.start && c.end <= p.end).length !== 1).map(c => c.id),
      picks: chapters.map(p => p.picks.map(id => cues.find(c => c.id === id && c.start >= p.start && c.end <= p.end)?.text)),
      examples: ERDMAENNCHEN_SCHMUCKLOSE_LESSON.flashcards.every(c => cues.some(s => s.id === c.cueId && s.text === c.example)),
      lastText: cues[cues.length - 1].text
    };
  });
  expect(audit.count).toBe(166);
  expect(audit.unique).toBe(audit.count);
  expect(audit.invalid).toEqual([]);
  expect(audit.uncovered).toEqual([]);
  expect(audit.examples).toBeTruthy();
  expect(audit.lastText).toContain('Regenwürmer');
  for (const picks of audit.picks) { expect(picks).toHaveLength(7); expect(picks.every(Boolean)).toBeTruthy(); }
  for (let i = 1; i <= 7; i++) {
    const response = await request.get(`/assets/kino-posters/erdmaennchen_schmucklose-${i}.jpg`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/jpeg');
  }
  const range = await request.get('/video/erdmaennchen_schmucklose.mp4', { headers: { Range: 'bytes=1024-2047' } });
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 1024-2047/${fs.statSync(path.join(__dirname, '../video/erdmaennchen_schmucklose.mp4')).size}`);
  expect((await range.body()).length).toBe(1024);
  await page.locator('#kinoFullMovieBtn').click();
  await expect(page.locator('#kinoFullMovieModal')).toBeVisible();
  await expect(page.locator('#kinoFullPlayer')).toHaveAttribute('src', 'video/erdmaennchen_schmucklose.mp4');
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => !v.paused && v.duration > 720)).toBeTruthy();
  await page.locator('#kinoFullMovieModal button[onclick="closeKinoFullMovieModal()"]').click();
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => v.paused)).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: capture('kino-schmucklose-overview-desktop.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('every Schmucklose part plays, displays matching DE/VI captions and stops at its own boundary', async ({ page }) => {
  await open(page);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    await openPart(page, i);
    await expect(page).toHaveURL(new RegExp(`kino=schmucklose&part=${i+1}`));
    await page.locator('#kinoDiscoveryStart').click();
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();
    const data = await page.evaluate(index => {
      const part = KINO_CHAPTER_DATA.erdmaennchen_schmucklose.chapters[index];
      const cue = ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES.find(c => c.id === part.picks[2]);
      return { end: part.end, time: (cue.start + cue.end)/2, text: cue.text, vi: cue.vi,
        count: ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES.filter(c => c.start >= part.start && c.end <= part.end).length };
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
  expect(total).toBe(166);
  expect((await getStorageJson(page, stateKey)).watched).toEqual([0, 1, 2, 3, 4, 5, 6]);
});

test('dictation, seven-cue selection and saved progress remain independent of Peppa', async ({ page }) => {
  await open(page, '?kino=schmucklose&part=2');
  await page.locator('#peppaPractice').click();
  await page.locator('#peppaLight').click();
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
  const first = await page.locator('#kinoOverlayDe').textContent();
  await page.locator('#kinoDiktatInput').fill('Banane');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([]);
  await page.locator('#kinoDiktatInput').fill(first);
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([1000130]);
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
  expect(await getStorageJson(page, 'vokabelgo_kino_peppa_chapters_v1')).toEqual(previousPeppa);
});

test('Schmucklose vocabulary opens only its own 24 source-linked flashcards', async ({ page }) => {
  await open(page);
  await page.locator('#kinoMovieVocabBtn').click();
  await expect(page.locator('#deckSelect')).toHaveValue('🎬 Video: Jan & Henry – Die schmucklose Gräfin');
  const cards = await page.evaluate(() => filtered.map(c => ({ id: c.id, term: c.term, deck: c.deck })));
  expect(cards).toHaveLength(24);
  expect(cards.every(c => c.id.startsWith('vk_erdmaennchen_schmucklose_'))).toBeTruthy();
  expect(cards.some(c => c.term === 'der Schmuck')).toBeTruthy();
});

test('Schmucklose works on a phone and can record a speaking take before completing dictation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '?kino=schmucklose&part=2');
  await page.locator('#kinoDiscoveryStart').click();
  const cue = await page.evaluate(() => ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES.find(c => c.id === 1000137));
  await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, (cue.start + cue.end)/2);
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
  await page.screenshot({ path: capture('kino-schmucklose-lesson-mobile.png'), fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#kinoSpeakChoice').click();
  await page.locator('#kinoDubRecordBtn').click();
  await expect(page.locator('#kinoRecordingHud')).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(350); // Real MediaRecorder data from the simulated microphone.
  await page.locator('#kinoDubRecordBtn').click();
  await expect(page.locator('#kinoDubReplayRow')).toBeVisible();
  expect(await page.evaluate(async () => (await (await fetch(kinoDubbingBlobUrls[kinoCurrentIndex])).blob()).size)).toBeGreaterThan(100);
  expect((await getStorageJson(page, stateKey)).completed).toEqual([]);
  await openOverview(page);
  await openPart(page, 6);
  await page.goBack();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/kino=schmucklose&part=7/);
});
