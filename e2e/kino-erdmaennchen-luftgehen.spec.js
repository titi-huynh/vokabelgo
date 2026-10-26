const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { openPart, openOverview } = require('./helpers/kino-navigation');
const fs = require('fs');
const path = require('path');

test.use({
  permissions: ['microphone'],
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] }
});

const stateKey = 'vokabelgo_kino_chapters_v1_erdmaennchen_luftgehen';
const previousSchmucklose = {
  chapter: 1,
  mode: 'light',
  completed: [1000130],
  watched: [0],
  imported: true,
  alignmentVersion: 1
};
const previousNudeltrick = {
  chapter: 0,
  mode: 'all',
  completed: [900101],
  watched: [0],
  imported: true,
  alignmentVersion: 1
};

const qaScreenshotDir = path.join(__dirname, '../qa/kino-alignment/erdmaennchen_luftgehen/screenshots');
fs.mkdirSync(qaScreenshotDir, { recursive: true });
const qaShot = name => path.join(qaScreenshotDir, name);

async function open(page, query = '?kino=luftgehen') {
  await seedStorage(page, {
    vokabelgo_kino_reset_done_v2026: 'true',
    vokabelgo_kino_chapters_v1_erdmaennchen_schmucklose: previousSchmucklose,
    vokabelgo_kino_chapters_v1_erdmaennchen_nudeltrick: previousNudeltrick
  });
  await page.goto('/' + query);
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('7 phần');
}

test('Zum in die Luft gehen is discoverable with 7 parts, 179 runtime cues (reviewNeeded excluded), 21 flashcards, posters and HTTP 206 seekable video', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 950 });
  await open(page);
  await page.locator('[data-nav="kino"]').click();
  await page.locator('.kino-film-card[data-movie="erdmaennchen_luftgehen"]').click();
  await expect(page).toHaveURL(/kino=luftgehen$/);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Zum in die Luft gehen');
  await expect(page.locator('#kinoMovieSeries')).toHaveText('EIN FALL FÜR DIE ERDMÄNNCHEN');
  await expect(page.locator('#kinoMovieSummary')).toContainText('11:32');
  await expect(page.locator('#kinoMovieVocabBtn')).toHaveText('📇 Ôn 21 từ và cụm từ');
  await expect(page.locator('.peppa-part')).toHaveCount(7);

  const audit = await page.evaluate(() => {
    const { cues, chapters } = KINO_CHAPTER_DATA.erdmaennchen_luftgehen;
    const pickCounts = chapters.map(p => p.picks.length);
    const totalPicks = pickCounts.reduce((a, b) => a + b, 0);
    return {
      count: cues.length,
      unique: new Set(cues.map(c => c.id)).size,
      has3100055: cues.some(c => c.id === 3100055),
      has3100182: cues.some(c => c.id === 3100182),
      firstId: cues[0].id,
      lastId: cues[cues.length - 1].id,
      invalid: cues.filter((c, i) => !c.text || !c.vi || !c.speaker || c.start < 0 || c.end <= c.start || c.end > 692.44 || (i && c.start <= cues[i - 1].end)).map(c => c.id),
      uncovered: cues.filter(c => chapters.filter(p => c.start >= p.start && c.end <= p.end).length !== 1).map(c => c.id),
      cue143Chapter: chapters.findIndex(p => {
        const c143 = cues.find(c => c.id === 3100143);
        return c143 && c143.start >= p.start && c143.end <= p.end;
      }) + 1,
      cue78Vi: cues.find(c => c.id === 3100078)?.vi,
      cue171Speaker: cues.find(c => c.id === 3100171)?.speaker,
      cue171Vi: cues.find(c => c.id === 3100171)?.vi,
      cue100Text: cues.find(c => c.id === 3100100)?.text,
      pickCounts,
      totalPicks,
      allPicksInChapter: chapters.every(p => p.picks.every(id => cues.some(c => c.id === id && c.start >= p.start && c.end <= p.end))),
      examplesVerbatim: ERDMAENNCHEN_LUFTGEHEN_LESSON.flashcards.every(c => cues.some(s => s.id === c.cueId && s.text === c.example)),
      card102Term: ERDMAENNCHEN_LUFTGEHEN_LESSON.flashcards.find(c => c.cueId === 3100102)?.term
    };
  });

  expect(audit.count).toBe(179);
  expect(audit.unique).toBe(179);
  expect(audit.has3100055).toBe(false);
  expect(audit.has3100182).toBe(false);
  expect(audit.firstId).toBe(3100001);
  expect(audit.lastId).toBe(3100181);
  expect(audit.invalid).toEqual([]);
  expect(audit.uncovered).toEqual([]);
  expect(audit.cue143Chapter).toBe(5);
  expect(audit.cue78Vi).toBe('Thật tệ khi không thể bay được như bọn chị đây này.');
  expect(audit.cue171Speaker).toBe('Ballonverkäufer');
  expect(audit.cue171Vi).toBe('Các cô thực sự muốn mua hết bóng bay sao?');
  expect(audit.cue100Text).toBe('Das ist, weil ich bin Ballonverkäufer.');
  expect(audit.pickCounts).toEqual([6, 5, 5, 6, 7, 6, 5]);
  expect(audit.totalPicks).toBe(40);
  expect(audit.allPicksInChapter).toBe(true);
  expect(audit.examplesVerbatim).toBe(true);
  expect(audit.card102Term).toBe('verkaufen');

  for (let i = 1; i <= 7; i++) {
    const response = await request.get(`/assets/kino-posters/erdmaennchen_luftgehen-${i}.jpg`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/jpeg');
  }

  const range = await request.get('/video/erdmaennchen_luftgehen.mp4', { headers: { Range: 'bytes=1024-2047' } });
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 1024-2047/${fs.statSync(path.join(__dirname, '../video/erdmaennchen_luftgehen.mp4')).size}`);
  expect((await range.body()).length).toBe(1024);

  await page.screenshot({ path: qaShot('desktop-1440-overview.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('all 7 parts play, render DE/VI captions, toggle CC, stop at chapter boundaries, and account for all 179 runtime cues', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await open(page);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    await openPart(page, i);
    await expect(page).toHaveURL(new RegExp(`kino=luftgehen&part=${i + 1}`));
    await page.locator('#kinoDiscoveryStart').click();
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();
    const data = await page.evaluate(index => {
      const part = KINO_CHAPTER_DATA.erdmaennchen_luftgehen.chapters[index];
      const cue = ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES.find(c => c.id === part.picks[2]);
      return {
        end: part.end,
        time: (cue.start + cue.end) / 2,
        text: cue.text,
        vi: cue.vi,
        count: ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES.filter(c => c.start >= part.start && c.end <= part.end).length,
        pickCount: part.picks.length
      };
    }, i);
    await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, data.time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(data.text);
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText(data.vi);
    if (i === 2) {
      await page.screenshot({ path: qaShot('desktop-1440-part3-captions.png') });
    }
    await page.locator('#kinoDiscoveryCC').click();
    await expect(page.locator('#kinoDiscoveryDe')).toBeEmpty();
    await page.locator('#kinoDiscoveryCC').click();
    await page.locator('#kinoDiscoveryVideo').evaluate((v, end) => { v.currentTime = end - 0.2; return v.play(); }, data.end);
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
    expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeCloseTo(data.end, 1);
    await page.locator('#kinoListenSentences').click();
    await expect(page.locator('#peppaAll')).toHaveText('Các câu trong bài');
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(data.count);
    total += data.count;
  }
  expect(total).toBe(179);
  expect((await getStorageJson(page, stateKey)).watched).toEqual([0, 1, 2, 3, 4, 5, 6]);
});

test('all/focus practice modes, right/wrong dictation, progress restore, movie switching and Back navigation work without stale data', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await open(page, '?kino=luftgehen&part=3');
  await page.locator('#peppaPractice').click();
  // Default mode is 'all' (16 cues in Part 3: 3100070..3100085)
  await expect(page.locator('#peppaAll')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(16);

  // Switch to focus mode (5 picks in Part 3)
  await page.locator('#peppaLight').click();
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(5);

  const firstText = await page.locator('#kinoOverlayDe').textContent();
  // Wrong answer first
  await page.locator('#kinoDiktatInput').fill('Falscher Satz');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([]);

  // Correct answer
  await page.locator('#kinoDiktatInput').fill(firstText);
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([3100071]);
  await page.screenshot({ path: qaShot('desktop-1440-dictation-practice.png') });

  // Reload and verify progress & mode restored while other Erdmännchen episodes remain untouched
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 5');
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
  expect(await getStorageJson(page, 'vokabelgo_kino_chapters_v1_erdmaennchen_schmucklose')).toEqual(previousSchmucklose);
  expect(await getStorageJson(page, 'vokabelgo_kino_chapters_v1_erdmaennchen_nudeltrick')).toEqual(previousNudeltrick);

  // Switch movie to Die schmucklose Gräfin and back via browser history without stale data
  await page.goto('/?kino=schmucklose');
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Die schmucklose Gräfin');
  await page.goBack();
  await expect(page).toHaveURL(/kino=luftgehen&part=3/);
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 3 / 7');
});

test('21 source-linked flashcards open cleanly and jump back to the exact scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await open(page);
  await page.locator('#kinoMovieVocabBtn').click();
  await expect(page.locator('#deckSelect')).toHaveValue('🎬 Video: Jan & Henry – Zum in die Luft gehen');
  const cards = await page.evaluate(() => filtered.map(c => ({ id: c.id, term: c.term, cueId: c.cueId, sourceUrl: c.sourceUrl, deck: c.deck })));
  expect(cards).toHaveLength(21);
  expect(cards.every(c => c.id.startsWith('vk_erdmaennchen_luftgehen_'))).toBeTruthy();
  expect(cards.some(c => c.term === 'verkaufen' && c.cueId === 3100102 && c.sourceUrl === '?kino=luftgehen&part=4')).toBeTruthy();
  expect(cards.some(c => c.term === 'der Ballonverkäufer')).toBe(false);
  await page.screenshot({ path: qaShot('desktop-1440-flashcards.png') });

  // Navigate to a flashcard's sourceUrl (?kino=luftgehen&part=4) and verify Part 4 opens
  await page.goto('/?kino=luftgehen&part=4');
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 4 / 7');
});

test('mobile viewports (320, 390, 768) have zero horizontal overflow and simulated speaking recording works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '?kino=luftgehen&part=7');
  await page.locator('#kinoDiscoveryStart').click();
  const cue = await page.evaluate(() => ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES.find(c => c.id === 3100171));
  await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, (cue.start + cue.end) / 2);
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
  await expect(page.locator('#kinoDiscoveryVi')).toHaveText('Các cô thực sự muốn mua hết bóng bay sao?');
  await page.screenshot({ path: qaShot('mobile-390-part7-caption.png'), fullPage: true });

  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(noOverflow).toBeTruthy();
    if (width !== 390) {
      await page.screenshot({ path: qaShot(`viewport-${width}-part7.png`), fullPage: true });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#kinoSpeakChoice').click();
  await page.locator('#kinoDubRecordBtn').click();
  await expect(page.locator('#kinoRecordingHud')).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(350);
  await page.locator('#kinoDubRecordBtn').click();
  await expect(page.locator('#kinoDubReplayRow')).toBeVisible();
  const blobUrl = await page.evaluate(() => kinoDubbingBlobUrls[kinoCurrentIndex]);
  expect(blobUrl).toMatch(/^blob:http:\/\/(localhost|127\.0\.0\.1):3000\//);
  await page.screenshot({ path: qaShot('mobile-390-speaking-recorded.png') });
});
