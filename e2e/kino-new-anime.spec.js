const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const path = require('node:path');
test.use({ video: 'off', trace: 'off' });
const films = [
  { key: 'k_on_s01e01', alias: 'kon', title: 'K-On!', dimensions: [1280, 720] },
  { key: 'delicious_in_dungeon_s01e01', alias: 'dungeon', title: 'Delicious in Dungeon', dimensions: [1280, 720] },
  { key: 'frieren_s01e02', alias: 'frieren2', title: 'Frieren · Tập 2', dimensions: [1280, 720] },
  { key: 'sakura_s01e02', alias: 'sakura2', title: 'Cardcaptor Sakura · Tập 2', dimensions: [960, 720] },
];
const oldKey = 'vokabelgo_kino_peppa_chapters_v1';
const oldProgress = { chapter: 0, mode: 'light', completed: [100401], watched: [0], imported: true, alignmentVersion: 2 };
const ep1FrierenKey = 'vokabelgo_kino_chapters_v1_frieren_s01e01';
const ep1FrierenProgress = { chapter: 1, mode: 'light', completed: [700102], watched: [0], imported: true };
const ep1SakuraKey = 'vokabelgo_kino_chapters_v1_sakura_s01e01';
const ep1SakuraProgress = { chapter: 2, mode: 'light', completed: [800010], watched: [0], imported: true };
async function open(page, film) {
  await seedStorage(page, {
    vokabelgo_kino_reset_done_v2026: 'true',
    [oldKey]: oldProgress,
    [ep1FrierenKey]: ep1FrierenProgress,
    [ep1SakuraKey]: ep1SakuraProgress,
  });
  await page.goto(`/?kino=${film.alias}&part=1`);
  await expect(page.locator('#kinoDiscovery')).toBeVisible();
}

test('the new anime films are discoverable without loading episode video or dialogue in the catalog', async ({ page, request }) => {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  const requested = [];
  page.on('request', req => requested.push(new URL(req.url()).pathname));
  await page.goto('/?hub=kino');
  await expect(page.locator('.kino-film-card')).toHaveCount(23);
  for (const film of films) {
    await expect(page.locator(`.kino-film-card[data-movie="${film.key}"]`)).toContainText(film.title);
    expect((await request.get(`/assets/kino-posters/${film.key}-1.jpg`)).ok()).toBeTruthy();
  }
  expect(requested.filter(p => /(?:k-on-s01e01|delicious-in-dungeon-s01e01|frieren-s01e02|sakura-s01e02)-aligned\.js$/.test(p) || /\/video\//.test(p))).toEqual([]);
});

for (const film of films) {
  test(`${film.title}: vocabulary opens its own reviewed deck without changing course progress`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await open(page, film);
    const progressKey = `vokabelgo_kino_chapters_v1_${film.key}`;
    const before = await getStorageJson(page, progressKey);
    const data = await page.evaluate(key => {
      const captions = KinoData.captions(key);
      return {
        deck: KINO_VIDEOS[key].flashcardDeck,
        chapters: KINO_CHAPTER_DATA[key].chapters.map(({ start, end }) => ({ start, end })),
        cards: VIDEO_FLASHCARDS.filter(card => card.videoKey === key).map(card => ({
          id: card.id, deck: card.deck, cueId: card.cueId, example: card.example,
          exampleVi: card.exampleVi, sourceUrl: card.sourceUrl,
          cue: captions.find(cue => cue.id === card.cueId) || null,
        })),
      };
    }, film.key);
    expect(data.cards.length).toBeGreaterThanOrEqual(12);
    expect(new Set(data.cards.map(card => card.id)).size).toBe(data.cards.length);
    for (const card of data.cards) {
      expect(card.deck).toBe(data.deck);
      expect(card.cue, `${card.id} must reference reviewed dialogue`).not.toBeNull();
      expect(card.cue.practiceExcluded).not.toBe(true);
      expect(card.cue.reviewNeeded).not.toBe(true);
      expect(card.example).toBe(card.cue.text);
      expect(card.exampleVi).toBe(card.cue.vi);
      expect(card.example.trim()).not.toBe('');
      expect(card.exampleVi.trim()).not.toBe('');
      const part = data.chapters.findIndex(chapter => card.cue.start >= chapter.start && card.cue.end <= chapter.end) + 1;
      expect(part).toBeGreaterThan(0);
      expect(card.sourceUrl).toBe(`?kino=${film.alias}&part=${part}`);
    }
    await page.locator('#kinoCatalogBack').click();
    await expect(page.locator('#kinoMovieOverview')).toBeVisible();
    await page.locator('#kinoMovieVocabBtn').click();
    await expect(page.locator('#deckSelect')).toHaveValue(data.deck);
    await expect(page.locator('#frontTerm')).toBeVisible();
    expect(await page.evaluate(() => filtered.map(card => card.id).sort()))
      .toEqual(data.cards.map(card => card.id).sort());
    expect(await getStorageJson(page, progressKey)).toEqual(before);
    expect(await getStorageJson(page, oldKey)).toEqual(oldProgress);
    expect(await getStorageJson(page, ep1FrierenKey)).toEqual(ep1FrierenProgress);
    expect(await getStorageJson(page, ep1SakuraKey)).toEqual(ep1SakuraProgress);
    expect(errors).toEqual([]);
  });

  test(`${film.title}: writing, listening and speaking share the selected cue and preserve other films' progress`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, film);
    await page.locator('#peppaPractice').click();
    await expect(page.locator('#kinoUsageNote')).toBeVisible();
    const original = await page.locator('#kinoOverlayDe').textContent();
    const cueId = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex].id);
    await page.locator('#kinoDiktatInput').fill('__kein_passender_text__');
    await page.locator('#kinoCheckBtn').click();
    await expect(page.locator('#kinoFeedbackStatus')).toHaveClass(/partial/);
    const key = `vokabelgo_kino_chapters_v1_${film.key}`;
    expect((await getStorageJson(page, key)).completed).not.toContain(cueId);
    await page.locator('#kinoDiktatInput').fill(original);
    await page.locator('#kinoCheckBtn').click();
    await expect(page.locator('#kinoFeedbackStatus')).toHaveClass(/correct/);
    expect((await getStorageJson(page, key)).completed).toContain(cueId);
    expect(await getStorageJson(page, oldKey)).toEqual(oldProgress);
    expect(await getStorageJson(page, ep1FrierenKey)).toEqual(ep1FrierenProgress);
    expect(await getStorageJson(page, ep1SakuraKey)).toEqual(ep1SakuraProgress);
    await page.reload();
    await page.locator('#kinoListenSentences').click();
    await expect(page.locator('#kinoListenDe')).toHaveText(original);
    await page.locator('#kinoSpeakChoice').click();
    await expect(page.locator('#diktatMode')).toHaveAttribute('data-kino-activity', 'speak');
    await expect(page.locator('#kinoUsageNote')).toBeVisible();
    expect((await getStorageJson(page, key)).completed).toContain(cueId);
    expect(await getStorageJson(page, oldKey)).toEqual(oldProgress);
    expect(await getStorageJson(page, ep1FrierenKey)).toEqual(ep1FrierenProgress);
    expect(await getStorageJson(page, ep1SakuraKey)).toEqual(ep1SakuraProgress);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
    expect(errors).toEqual([]);
  });

  test(`${film.title}: discovery plays the episode with bilingual captions and offers both viewing qualities`, async ({ page }) => {
    test.setTimeout(60000);
    await open(page, film);
    const sample = await page.evaluate(key => {
      const chapter = KINO_CHAPTER_DATA[key].chapters[0];
      const cue = KinoData.captions(key).find(c => c.start >= chapter.start && c.end <= chapter.end && c.end - c.start > 1 && !c.practiceExcluded);
      return { time: (cue.start + cue.end) / 2, text: cue.text, vi: cue.vi };
    }, film.key);
    await page.locator('#kinoDiscoveryStart').click();
    const video = page.locator('#kinoDiscoveryVideo');
    await expect.poll(() => video.evaluate(v => !v.paused && v.readyState >= 2)).toBeTruthy();
    await expect(video).toHaveAttribute('src', `video/kino-light/${film.key}-480p-v1.mp4`);
    await video.evaluate((v, time) => { v.pause(); v.currentTime = time; }, sample.time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(sample.text);
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText(sample.vi);
    await page.getByRole('combobox', { name: 'Chất lượng phim', exact: true }).selectOption({ label: 'Bản gốc' });
    await expect(video).toHaveAttribute('src', `video/${film.key}-web-v1.mp4`);
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(1);
    expect(await video.evaluate(v => [v.videoWidth, v.videoHeight])).toEqual(film.dimensions);
    expect((await getStorageJson(page, `vokabelgo_kino_chapters_v1_${film.key}`)).completed).toEqual([]);
    expect(await getStorageJson(page, oldKey)).toEqual(oldProgress);
    expect(await getStorageJson(page, ep1FrierenKey)).toEqual(ep1FrierenProgress);
    expect(await getStorageJson(page, ep1SakuraKey)).toEqual(ep1SakuraProgress);
  });
}
