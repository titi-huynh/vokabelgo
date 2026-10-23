const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const players = '#kinoMainVideo, #kinoDiscoveryVideo, #kinoFullPlayer';

async function open(page, query = '?hub=kino', storage = {}) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', ...storage });
  await page.goto('/' + query);
  await expect(page.locator(query.includes('part=') ? '#kinoLessonTabs' : '#kinoCatalog')).toBeVisible();
}

test('catalog and flashcards work without fetching movie subtitles; each selected film loads once', async ({ page }) => {
  const scripts = [], errors = [];
  page.on('request', r => { if (/-aligned\.js(?:\?|$)/.test(r.url())) scripts.push(new URL(r.url()).pathname); });
  page.on('pageerror', error => errors.push(error.message));
  await open(page, '?hub=kino', { kino_active_video_key: 'frieren_s01e01' });
  expect(await page.evaluate(() => currentKinoVideoKey)).toBe('frieren_s01e01');
  expect(scripts).toEqual([]);
  expect(await page.evaluate(() => VIDEO_FLASHCARDS.filter(c => c.videoKey === 'frieren_s01e01').length)).toBeGreaterThan(0);
  for (const [key, file] of [['hans', 'hans'], ['sakura_s01e01', 'sakura-s01e01'], ['hans', 'hans']]) {
    await page.locator(`[data-movie="${key}"]`).click();
    await expect(page.locator('#kinoMovieOverview')).toBeVisible();
    await expect(page.locator('.kino-more-tools summary')).toBeVisible();
    expect(scripts.filter(s => s === `/${file}-aligned.js`)).toHaveLength(1);
    await page.locator('#kinoCatalogBack').click();
    await expect(page.locator('#kinoCatalog')).toBeVisible();
  }
  expect(scripts).toHaveLength(2);
  expect(errors).toEqual([]);
  expect(await page.locator(players).evaluateAll(vs => vs.every(v => !v.hasAttribute('src')))).toBeTruthy();
});

test('a failed subtitle download can be retried without losing the catalog', async ({ page }) => {
  let attempts = 0;
  await page.route('**/hans-aligned.js', async route => {
    if (++attempts === 1) await route.abort();
    else await route.continue();
  });
  await open(page);
  await page.locator('[data-movie="hans"]').click();
  await expect(page.locator('#kinoDataStatus')).toContainText('Chưa tải được lời thoại');
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await page.locator('[data-movie="hans"]').click();
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Hans im Glück');
  expect(attempts).toBe(2);
});

test('late subtitles cannot reopen a film after Back or replace a newer selection', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => release = resolve);
  await page.route('**/hans-aligned.js', async route => { await gate; await route.continue(); });
  await open(page);
  await page.locator('[data-movie="hans"]').click();
  await expect(page.locator('#kinoCatalog')).toHaveAttribute('aria-busy', 'true');
  await page.goBack();
  await expect(page.locator('#kinoCatalog')).not.toHaveAttribute('aria-busy');
  await page.locator('[data-movie="sakura_s01e01"]').click();
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Das geheimnisvolle Buch');
  release();
  await expect.poll(() => page.evaluate(() => KinoData.cues('hans').length)).toBeGreaterThan(0);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Das geheimnisvolle Buch');
  expect(await page.evaluate(() => currentKinoVideoKey)).toBe('sakura_s01e01');
});

test('all eight films offer a light source with byte ranges and a working original choice', async ({ page, request }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page);
  const keys = await page.locator('.kino-film-card').evaluateAll(cards => cards.map(c => c.dataset.movie));
  for (const key of keys) {
    await page.locator(`[data-movie="${key}"]`).click();
    await expect(page.locator('#kinoQuality')).toBeVisible();
    await page.locator('#kinoQuality').selectOption('480p');
    const source = await page.evaluate(key => KinoMedia.source(key), key);
    expect(source).toBe(`video/kino-light/${key}-480p-v2.mp4`);
    const response = await request.get('/' + source, { headers: { Range: 'bytes=2048-4095' } });
    expect(response.status()).toBe(206);
    expect((await response.body()).length).toBe(2048);
    await page.locator('.peppa-part[data-chapter="0"]').click();
    await page.locator('#kinoDiscoveryStart').click();
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused && !v.seeking && v.readyState >= 2)).toBeTruthy();
    await page.locator('#kinoDiscoveryVideo').evaluate(v => v.pause());
    const position = await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime);
    await page.locator('#kinoQuality').selectOption('original');
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.seeking && v.readyState >= 2)).toBeTruthy();
    expect(await page.locator('#kinoDiscoveryVideo').getAttribute('src')).toBe(await page.evaluate(() => KINO_VIDEOS[currentKinoVideoKey].src));
    expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeCloseTo(position, 1);
    await page.locator('#kinoCatalogBack').click();
    await page.locator('#kinoCatalogBack').click();
  }
  expect(errors).toEqual([]);
});

test('rapid sentence choices keep the last request and stop within 80 ms of its end', async ({ page }) => {
  await open(page, '?kino=peppa&part=1');
  await page.locator('#kinoListenSentences').click();
  await expect.poll(() => page.locator('#kinoMainVideo').evaluate(v => !v.paused && v.readyState >= 2)).toBeTruthy();
  const result = await page.evaluate(async () => {
    const video = document.getElementById('kinoMainVideo');
    // Simulate switching between distant sentences before either seek finishes.
    loadKinoSentence(6); playKinoCurrentSegment();
    loadKinoSentence(0); playKinoCurrentSegment();
    loadKinoSentence(1); playKinoCurrentSegment();
    const cue = PIZZASCHWESTER_72_SEGMENTS[1];
    const stopped = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Sentence did not stop')), 10000);
      const pause = () => {
        if (video.currentTime < cue.end - .05) return;
        clearTimeout(timeout); video.removeEventListener('pause', pause);
        resolve(video.currentTime);
      };
      video.addEventListener('pause', pause);
    });
    return { index: kinoCurrentIndex, start: cue.start, end: cue.end, stopped, source: video.getAttribute('src') };
  });
  expect(result.index).toBe(1);
  expect(Math.abs(result.stopped - result.end)).toBeLessThan(.08);
  expect(result.source).toContain('kino-light/peppa_supermarkt');
  await page.waitForTimeout(250);
  expect(await page.locator('#kinoMainVideo').evaluate(v => v.paused)).toBeTruthy();
});

test('changing quality during sentence playback still stops at the same sentence', async ({ page }) => {
  await open(page, '?kino=peppa&part=1');
  await page.locator('#kinoListenSentences').click();
  await expect.poll(() => page.locator('#kinoMainVideo').evaluate(v => !v.paused && v.readyState >= 2)).toBeTruthy();
  await page.locator('#kinoQuality').selectOption('original');
  await expect.poll(() => page.locator('#kinoMainVideo').evaluate(v => v.paused && Math.abs(v.currentTime - PIZZASCHWESTER_72_SEGMENTS[0].end) < .08), { timeout: 15000 }).toBeTruthy();
});
