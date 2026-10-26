const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { openPart } = require('./helpers/kino-navigation');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

test.describe.configure({ timeout: 90000 });

const clips = [
  { key: 'bobo_im_bad', alias: 'bobo-im-bad', qa: 'bobo_im_bad_20261026' },
  { key: 'conni_garten', alias: 'conni-garten', qa: 'conni_garten_20261026' },
  { key: 'schmusedecke_baer', alias: 'schmusedecke-baer', qa: 'schmusedecke_baer_20261026' },
  { key: 'nicos_hallo', alias: 'nicos-hallo', qa: 'nicos_hallo_20261026' },
  { key: 'goethe_im_bus', alias: 'goethe-bus', qa: 'goethe_im_bus_20261026' }
];

const peppaKey = 'vokabelgo_kino_peppa_chapters_v1';
const bearsKey = 'vokabelgo_kino_chapters_v1_we_bare_bears_mall';
const spukschlossKey = 'vokabelgo_kino_chapters_v1_erdmaennchen_spukschloss';
const previousPeppa = { chapter: 2, mode: 'light', completed: [104701], watched: [0], imported: true, alignmentVersion: 2 };
const previousBears = { chapter: 1, mode: 'light', completed: [1100125], watched: [0], imported: true, alignmentVersion: 2, practiceModeVersion: 1, contentVersion: 2 };
const previousSpukschloss = { chapter: 1, mode: 'light', completed: [500001], watched: [0], imported: true, alignmentVersion: 2 };
const capture = name => path.join(__dirname, '../review-assets', name);

function readQaJson(qaDir, fileName) {
  const filePath = path.join(__dirname, '../qa/kino-alignment', qaDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

async function open(page, clip, part) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await seedStorage(page, {
    vokabelgo_kino_reset_done_v2026: 'true',
    [peppaKey]: previousPeppa,
    [bearsKey]: previousBears,
    [spukschlossKey]: previousSpukschloss
  });
  await page.goto(`/?kino=${clip.alias}${part ? `&part=${part}` : ''}`);
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText(/\d+ phần/);
  await expect.poll(() => page.evaluate(key => KinoData.cues(key).length, clip.key)).toBeGreaterThan(0);
  return errors;
}

async function snapshot(page, key) {
  return page.evaluate(key => {
    const config = KINO_CHAPTER_DATA[key], video = KINO_VIDEOS[key];
    const practiceParts = typeof KINO_PRACTICE_DATA !== 'undefined' ? KINO_PRACTICE_DATA[key] || null : null;
    return {
      title: config.title,
      series: config.series,
      isExcerpt: config.isExcerpt,
      defaultMode: config.defaultMode,
      storageKey: config.storageKey,
      chapters: config.chapters,
      practiceParts,
      cues: KinoData.cues(key),
      cards: VIDEO_FLASHCARDS.filter(card => card.videoKey === key),
      video: { src: video.src, isExcerpt: video.isExcerpt, sourceUrl: video.sourceUrl, flashcardDeck: video.flashcardDeck }
    };
  }, key);
}

for (const clip of clips) {
  test(`${clip.alias}: catalog, source-linked vocabulary and seekable complete clip`, async ({ page, request }) => {
    test.setTimeout(90000);
    const lesson = readQaJson(clip.qa, 'lesson-content.json');
    const source = readQaJson(clip.qa, 'source.json');
    const errors = await open(page, clip);
    await page.locator('[data-nav="kino"]').click();
    await page.locator(`.kino-film-card[data-movie="${clip.key}"]`).click();
    await expect(page).toHaveURL(new RegExp(`kino=${clip.alias}$`));
    await expect(page.locator('#kinoMovieTitle')).toHaveText(lesson.episodeTitle);
    const data = await snapshot(page, clip.key);
    expect(lesson.key).toBe(clip.key);
    expect(lesson.alias).toBe(clip.alias);
    await expect(page.locator('#kinoMovieTitle')).toHaveText(data.title);
    await expect(page.locator('#kinoMovieSeries')).toHaveText(data.series);
    await expect(page.locator('.peppa-part')).toHaveCount(lesson.chapters.length);
    expect(data.isExcerpt).toBe(lesson.isExcerpt ?? true);
    expect(data.video.isExcerpt).toBe(lesson.isExcerpt ?? true);
    expect(data.chapters).toHaveLength(lesson.chapters.length);
    expect(data.cues).toHaveLength(lesson.cues.length);
    expect(data.cards).toHaveLength(lesson.vocabulary.length);
    expect(data.cards.length).toBeGreaterThan(0);
    expect(new Set(data.cues.map(c => c.id)).size).toBe(data.cues.length);
    const duration = data.chapters.at(-1).end;
    expect(duration).toBeCloseTo(lesson.duration, 1);
    expect(data.cues.filter((c, i) => !c.text || !c.vi || !c.speaker || c.start < 0 || c.end <= c.start || c.end > duration || (i && c.start < data.cues[i - 1].end))).toEqual([]);
    expect(data.cues.filter(c => data.chapters.filter(p => c.start >= p.start && c.end <= p.end).length !== 1)).toEqual([]);
    for (const [index, chapter] of data.chapters.entries()) {
      expect(chapter.start).toBe(index ? data.chapters[index - 1].end : 0);
      expect(chapter.end).toBeGreaterThan(chapter.start);
      expect(chapter.picks.length).toBeGreaterThan(0);
      expect(chapter.picks.length).toBeLessThanOrEqual(7);
      expect(new Set(chapter.picks).size).toBe(chapter.picks.length);
      if (data.practiceParts) {
        expect(chapter.picks).toEqual(data.practiceParts[index].picks.map(p => p.id));
      } else {
        expect(chapter.picks).toEqual(lesson.chapters[index].picks);
      }
      for (const id of chapter.picks) {
        expect(data.cues.some(c => c.id === id && c.start >= chapter.start && c.end <= chapter.end)).toBe(true);
      }
      const poster = await request.get(`/assets/kino-posters/${clip.key}-${index + 1}.jpg`);
      expect(poster.ok()).toBeTruthy();
      expect(poster.headers()['content-type']).toContain('image/jpeg');
    }
    for (const card of data.cards) {
      const cue = data.cues.find(c => c.id === card.cueId);
      expect(cue, `missing source cue for ${card.id}`).toBeTruthy();
      expect(card.example).toBe(cue.text);
      const chapter = data.chapters.findIndex(p => cue.start >= p.start && cue.end <= p.end);
      expect(card.sourceUrl).toBe(`?kino=${clip.alias}&part=${chapter + 1}`);
      expect(card.id.startsWith(`vk_${clip.key}_`)).toBe(true);
    }
    expect(source.sourceUrl).toBeTruthy();
    expect(data.video.sourceUrl).toBe(source.sourceUrl);
    expect(data.video.sourceUrl).toBe(lesson.sourceUrl);
    expect(source.germanAudioEvidence.language).toBe('de');
    expect(source.durationSeconds).toBeGreaterThan(0);
    const file = path.join(__dirname, '..', data.video.src);
    expect(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')).toBe(source.sha256.toLowerCase());
    const range = await request.get('/' + data.video.src, { headers: { Range: 'bytes=1024-2047' } });
    expect(range.status()).toBe(206);
    expect(range.headers()['content-range']).toBe(`bytes 1024-2047/${fs.statSync(file).size}`);
    expect((await range.body()).length).toBe(1024);
    await page.locator('#kinoFullMovieBtn').click();
    const player = page.locator('#kinoFullPlayer');
    await expect(page.locator('#kinoFullMovieModal')).toBeVisible();
    await expect(player).toHaveAttribute('src', data.video.src);
    await expect.poll(() => player.evaluate(v => Number.isFinite(v.duration) && !v.paused)).toBeTruthy();
    expect(await player.evaluate(v => v.duration)).toBeCloseTo(source.durationSeconds, 1);
    expect(await player.evaluate(v => v.duration)).toBeCloseTo(duration, 1);
    await player.evaluate((v, time) => { v.currentTime = time; }, duration * .75);
    await expect.poll(() => player.evaluate((v, time) => Math.abs(v.currentTime - time) < 1, duration * .75)).toBeTruthy();
    await page.locator('#kinoFullMovieModal button[onclick="closeKinoFullMovieModal()"]').click();
    await expect.poll(() => player.evaluate(v => v.paused)).toBeTruthy();
    await page.screenshot({ path: capture(`kino-beginner-${clip.alias}-overview-desktop.png`), fullPage: true });
    await page.locator('#kinoMovieVocabBtn').click();
    await expect(page.locator('#deckSelect')).toHaveValue(data.video.flashcardDeck);
    const cards = await page.evaluate(() => filtered.map(c => ({ id: c.id, sourceUrl: c.sourceUrl })));
    expect(cards.map(c => c.id).sort()).toEqual(data.cards.map(c => c.id).sort());
    await page.goto('/' + cards[0].sourceUrl);
    await expect(page.locator('#kinoLessonTabs')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test(`${clip.alias}: every chapter has correct bilingual cues and stops at its own boundary`, async ({ page }) => {
    test.setTimeout(90000);
    const lesson = readQaJson(clip.qa, 'lesson-content.json');
    const errors = await open(page, clip);
    const data = await snapshot(page, clip.key);
    expect(data.chapters).toHaveLength(lesson.chapters.length);
    let count = 0;
    for (const [index, chapter] of data.chapters.entries()) {
      await openPart(page, index);
      await expect(page).toHaveURL(new RegExp(`kino=${clip.alias}&part=${index + 1}$`));
      await expect(page.locator('#peppaLight')).toHaveText(new RegExp(`^${chapter.picks.length} câu `));
      await expect(page.locator('#peppaPractice')).toHaveText(`Luyện ${chapter.picks.length} câu →`);
      await page.locator('#kinoDiscoveryStart').click();
      const video = page.locator('#kinoDiscoveryVideo');
      await expect.poll(() => video.evaluate(v => !v.paused)).toBeTruthy();
      const cue = data.cues.find(c => c.id === chapter.picks[Math.floor(chapter.picks.length / 2)]);
      await video.evaluate((v, time) => { v.pause(); v.currentTime = time; }, (cue.start + cue.end) / 2);
      await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
      await expect(page.locator('#kinoDiscoveryVi')).toHaveText(cue.vi);
      await page.locator('#kinoDiscoveryCC').click();
      await expect(page.locator('#kinoDiscoveryDe')).toBeEmpty();
      await page.locator('#kinoDiscoveryCC').click();
      await expect(page.locator('#kinoDiscoveryDe')).toHaveText(cue.text);
      await video.evaluate((v, end) => { v.currentTime = end - .2; return v.play(); }, chapter.end);
      await expect.poll(() => video.evaluate(v => v.paused)).toBeTruthy();
      expect(await video.evaluate(v => v.currentTime)).toBeCloseTo(chapter.end, 2);
      await page.locator('#kinoListenSentences').click();
      await page.locator('#peppaAll').click();
      const chapterCount = data.cues.filter(c => c.start >= chapter.start && c.end <= chapter.end).length;
      await expect(page.locator('#kinoTimelineList > button')).toHaveCount(chapterCount);
      count += chapterCount;
    }
    expect(count).toBe(lesson.cues.length);
    expect(count).toBe(data.cues.length);
    expect((await getStorageJson(page, data.storageKey)).watched).toEqual(data.chapters.map((_, i) => i));
    expect(errors).toEqual([]);
  });

  test(`${clip.alias}: phone dictation saves independently and highlight counts match the selected chapter`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 844 });
    const lesson = readQaJson(clip.qa, 'lesson-content.json');
    const errors = await open(page, clip, 1);
    const data = await snapshot(page, clip.key);
    const expectedPicks = data.practiceParts ? data.practiceParts[0].picks.map(p => p.id) : lesson.chapters[0].picks;
    expect(data.chapters[0].picks).toEqual(expectedPicks);
    const highlights = data.chapters[0].picks.length;
    const peppaBefore = await getStorageJson(page, peppaKey);
    const bearsBefore = await getStorageJson(page, bearsKey);
    const spukschlossBefore = await getStorageJson(page, spukschlossKey);
    await page.locator('#peppaPractice').click();
    await page.locator('#peppaLight').click();
    await expect(page.locator('#peppaLight')).toHaveText(new RegExp(`^${highlights} câu `));
    await expect(page.locator('#peppaPractice')).toHaveText(`Luyện ${highlights} câu →`);
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(highlights);
    const first = await page.evaluate(() => ({ ...PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex] }));
    expect(data.chapters[0].picks).toContain(first.id);
    if (data.chapters[0].practiceUsage?.[first.id]) {
      await expect(page.locator('#kinoUsageNote')).toBeVisible();
      await expect(page.locator('#kinoUsageNote')).toContainText(data.chapters[0].practiceUsage[first.id]);
    }
    await page.locator('#kinoDiktatInput').fill('Banane');
    await page.locator('#kinoCheckBtn').click();
    expect((await getStorageJson(page, data.storageKey)).completed).not.toContain(first.id);
    await page.locator('#kinoDiktatInput').fill(first.text);
    await page.locator('#kinoCheckBtn').click();
    await expect.poll(async () => (await getStorageJson(page, data.storageKey)).completed.includes(first.id)).toBeTruthy();
    await page.reload();
    await expect(page.locator('#kinoLessonTabs')).toBeVisible();
    await page.locator('#peppaPractice').click();
    await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#kinoPracticePosition')).toContainText(`Câu ${Math.min(2, highlights)} / ${highlights}`);
    expect((await getStorageJson(page, data.storageKey)).completed).toContain(first.id);
    expect(await getStorageJson(page, peppaKey)).toEqual(peppaBefore);
    expect(await getStorageJson(page, bearsKey)).toEqual(bearsBefore);
    expect(await getStorageJson(page, spukschlossKey)).toEqual(spukschlossBefore);
    expect(peppaBefore).toEqual(previousPeppa);
    expect(bearsBefore).toEqual(previousBears);
    expect(spukschlossBefore).toEqual(previousSpukschloss);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: capture(`kino-beginner-${clip.alias}-dictation-mobile.png`), fullPage: true });
    expect(errors).toEqual([]);
  });
}
