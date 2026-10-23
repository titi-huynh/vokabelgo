const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { openPart, openOverview } = require('./helpers/kino-navigation');
const fs = require('fs');
const path = require('path');

test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });

const stateKey = 'vokabelgo_kino_chapters_v1_frieren_s01e01';
const peppaSeed = { chapter: 2, mode: 'light', completed: [104701], watched: [0], imported: true, alignmentVersion: 2 };
const hansSeed = { chapter: 1, mode: 'all', completed: [400108], watched: [0], imported: true, alignmentVersion: 2, contentVersion: 2, practiceModeVersion: 1 };
const trudesSeed = { chapter: 3, mode: 'all', completed: [600102], watched: [1], imported: true, alignmentVersion: 2, practiceModeVersion: 1 };
const capture = name => path.join(__dirname, '../review-assets', name);

async function open(page, query = '?kino=frieren') {
  await seedStorage(page, {
    vokabelgo_kino_reset_done_v2026: 'true',
    vokabelgo_kino_peppa_chapters_v1: peppaSeed,
    vokabelgo_kino_chapters_v1_hans: hansSeed,
    vokabelgo_kino_chapters_v1_trudes_fahrstuhl: trudesSeed
  });
  await page.goto('/' + query);
  if (query.includes('hub=kino')) await expect(page.locator('#kinoCatalog')).toBeVisible();
  else await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('7 phần');
}

test('Frieren is discoverable, has complete chronological bilingual cues/units, 7 covers, vocabulary and HTTP Range media', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page, '?hub=kino');
  await page.locator('.kino-film-card[data-movie="frieren_s01e01"]').click();
  await expect(page).toHaveURL(/\?kino=frieren$/);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Das Ende der Reise');
  await expect(page.locator('#kinoMovieSeries')).toHaveText('FRIEREN · TẬP 1');
  await expect(page.locator('#kinoMovieSummary')).toContainText('26:00');
  await expect(page.locator('#kinoMovieSummary')).toContainText('B1–B2');
  await expect(page.locator('#kinoMovieSummary')).toContainText('5 câu cần rà lời');
  await expect(page.locator('#kinoMovieVocabBtn')).toHaveText('📇 Ôn 24 từ và cụm từ');
  await expect(page.locator('.peppa-part')).toHaveCount(7);
  await expect(page.locator('#kinoDD_frieren_s01e01')).toHaveAttribute('data-key', 'frieren_s01e01');

  const audit = await page.evaluate(() => {
    const captions = FRIEREN_S01E01_CAPTION_CUES;
    const units = FRIEREN_S01E01_ALIGNED_UTTERANCES;
    const { chapters, defaultMode } = KINO_CHAPTER_DATA.frieren_s01e01;
    const byId = new Map(captions.map(c => [c.id, c]));
    const words = text => (text.toLowerCase().replace(/ß/g, 'ss').match(/[\p{L}\p{N}]+/gu) || []).join(' ');
    const expanded = [];
    const unitMismatches = [];
    for (const unit of units) {
      const ids = unit.legacyIds || [unit.id];
      expanded.push(...ids);
      const parts = ids.map(id => byId.get(id));
      if (!parts.every(Boolean) || words(parts.map(c => c.text).join(' ')) !== words(unit.text) || unit.start !== parts[0].start || unit.end !== parts.at(-1).end) {
        unitMismatches.push(unit.id);
      }
    }
    return {
      defaultMode,
      captionCount: captions.length,
      unitCount: units.length,
      uniqueCaptions: new Set(captions.map(c => c.id)).size,
      uniqueUnits: new Set(units.map(u => u.id)).size,
      invalidCaptions: captions.filter((c, i) => !c.text?.trim() || !c.vi?.trim() || !c.speaker || c.start < 120 || c.end <= c.start || c.end > 1559.987 || (c.end > 1470 && c.start < 1540) || (i && c.start < captions[i - 1].end)).map(c => c.id),
      invalidUnits: units.filter((u, i) => !u.text?.trim() || !u.vi?.trim() || u.start < 120 || u.end <= u.start || u.end > 1559.987 || (u.end > 1470 && u.start < 1540) || (i && u.start < units[i - 1].end)).map(u => u.id),
      uncoveredCaptions: captions.filter(c => chapters.filter(p => c.start >= p.start && c.end <= p.end).length !== 1).map(c => c.id),
      uncoveredUnits: units.filter(u => chapters.filter(p => u.start >= p.start && u.end <= p.end).length !== 1).map(u => u.id),
      exactCoverage: JSON.stringify(expanded) === JSON.stringify(captions.map(c => c.id)),
      unitMismatches,
      firstUnit: units[0],
      lastUnit: units.at(-1),
      postCreditCount: units.filter(u => u.start >= 1550).length,
      partUnitCounts: chapters.map(p => units.filter(u => u.start >= p.start && u.end <= p.end).length),
      picksValid: chapters.every(p => p.picks.length === 7 && new Set(p.picks).size === 7 && p.picks.every(id => units.some(u => u.id === id && u.start >= p.start && u.end <= p.end))),
      vocabValid: FRIEREN_S01E01_LESSON.flashcards.every(card => byId.get(card.cueId)?.text === card.example)
    };
  });

  expect(audit.defaultMode).toBe('all');
  expect(audit.captionCount).toBe(275);
  expect(audit.unitCount).toBe(263);
  expect(audit.uniqueCaptions).toBe(275);
  expect(audit.uniqueUnits).toBe(263);
  expect(audit.invalidCaptions).toEqual([]);
  expect(audit.invalidUnits).toEqual([]);
  expect(audit.uncoveredCaptions).toEqual([]);
  expect(audit.uncoveredUnits).toEqual([]);
  expect(audit.exactCoverage).toBe(true);
  expect(audit.unitMismatches).toEqual([]);
  expect(audit.firstUnit.text).toBe('Frieren?');
  expect(audit.lastUnit.text).toBe('Aber es lohnt sich, nach denen zu suchen.');
  expect(audit.postCreditCount).toBe(4);
  expect(audit.partUnitCounts).toEqual([27, 44, 43, 28, 41, 32, 48]);
  expect(audit.picksValid).toBe(true);
  expect(audit.vocabValid).toBe(true);

  for (let i = 1; i <= 7; i++) {
    const response = await request.get(`/assets/kino-posters/frieren_s01e01-${i}.jpg`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/jpeg');
    const dimensions = await page.evaluate(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, `/assets/kino-posters/frieren_s01e01-${i}.jpg`);
    expect(dimensions).toEqual([960, 540]);
  }

  const videoSize = fs.statSync(path.join(__dirname, '../video/frieren_s01e01.mp4')).size;
  const range = await request.get('/video/frieren_s01e01.mp4', { headers: { Range: 'bytes=2048-4095' } });
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 2048-4095/${videoSize}`);
  expect((await range.body()).length).toBe(2048);

  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: capture('kino-frieren-overview-desktop.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('all 7 Frieren parts play, display synced DE/VI captions, stop at part boundaries and match all-mode practice counts', async ({ page }) => {
  await open(page);
  const expectedCounts = [27, 44, 43, 28, 41, 32, 48];
  let total = 0;

  for (let i = 0; i < 7; i++) {
    await openPart(page, i);
    await expect(page).toHaveURL(new RegExp(`kino=frieren&part=${i + 1}`));
    await expect(page.locator('#kinoDiscoveryVideo')).not.toHaveAttribute('src');
    await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('poster', `assets/kino-posters/frieren_s01e01-${i + 1}.jpg`);
    await page.locator('#kinoDiscoveryStart').click();
    await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('src', 'video/kino-light/frieren_s01e01-480p-v2.mp4');
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();

    const sample = await page.evaluate(index => {
      const part = KINO_CHAPTER_DATA.frieren_s01e01.chapters[index];
      const cue = FRIEREN_S01E01_CAPTION_CUES.find(c => c.id === part.picks[2]);
      return {
        end: part.end,
        time: (cue.start + cue.end) / 2,
        text: cue.text,
        vi: cue.vi
      };
    }, i);

    await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, sample.time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(sample.text);
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText(sample.vi);
    await page.locator('#kinoDiscoveryCC').click();
    await expect(page.locator('#kinoDiscoveryDe')).toBeEmpty();
    await page.locator('#kinoDiscoveryCC').click();
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(sample.text);

    await page.locator('#kinoDiscoveryVideo').evaluate((v, end) => { v.currentTime = end - 0.2; return v.play(); }, sample.end);
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
    expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeCloseTo(sample.end, 1);

    await page.locator('#kinoListenSentences').click();
    await expect(page.locator('#peppaAll')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(expectedCounts[i]);
    total += expectedCounts[i];
  }

  expect(total).toBe(263);
  expect((await getStorageJson(page, stateKey)).watched).toEqual([0, 1, 2, 3, 4, 5, 6]);
});

test('Frieren sentence loop, focus mode, writing right/wrong, next part and reload preserve isolated progress', async ({ page }) => {
  await open(page, '?kino=frieren&part=1');
  await page.locator('#kinoListenSentences').click();
  await page.locator('#peppaLight').click();
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
  await expect(page.locator('#kinoListenDe')).toHaveText('Seht mal, da ist die Hauptstadt.');
  await expect(page.locator('#kinoListenVi')).toHaveText('Nhìn kìa, kinh đô ở đằng kia rồi.');

  await page.locator('#kinoPlayLoopBtn').click();
  await expect.poll(() => page.evaluate(() => { const v=document.getElementById('kinoMainVideo'), end=PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex].end; return v.paused && !v.seeking && Math.abs(v.currentTime-end)<.05; })).toBeTruthy();
  const firstPick = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS[0]);
  expect(await page.locator('#kinoMainVideo').evaluate(v => v.currentTime)).toBeCloseTo(firstPick.end, 1);

  await page.locator('#peppaPractice').click();
  await page.locator('#kinoDiktatInput').fill('Falscher Satz');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([]);

  await page.locator('#kinoDiktatInput').fill('Seht mal, da ist die Hauptstadt.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page, stateKey)).completed).toEqual([700102]);

  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');

  for (let i = 1; i < 7; i++) {
    await page.locator('#kinoDiktatInput').fill(await page.locator('#kinoOverlayDe').textContent());
    await page.locator('#kinoCheckBtn').click();
    if (i < 6) await page.locator('#kinoNextBtn').click();
  }
  await expect(page.locator('#peppaFinished')).toBeVisible();
  expect((await getStorageJson(page, stateKey)).completed).toHaveLength(7);

  // Verify isolation from Peppa, Hans, and Trudes Tier progress
  expect(await getStorageJson(page, 'vokabelgo_kino_peppa_chapters_v1')).toEqual(peppaSeed);
  expect(await getStorageJson(page, 'vokabelgo_kino_chapters_v1_hans')).toEqual(hansSeed);
  expect(await getStorageJson(page, 'vokabelgo_kino_chapters_v1_trudes_fahrstuhl')).toEqual(trudesSeed);

  await page.locator('#peppaNextPart').click();
  await expect(page.locator('#kinoDiscovery')).toBeVisible();
  await expect(page).toHaveURL(/kino=frieren&part=2/);
});

test('Frieren vocabulary opens only its own 24 source-grounded flashcards', async ({ page }) => {
  await open(page);
  await page.locator('#kinoMovieVocabBtn').click();
  await expect(page.locator('#deckSelect')).toHaveValue('🎬 Video: Frieren – Das Ende der Reise');
  const cards = await page.evaluate(() => filtered.map(c => ({ id: c.id, term: c.term, deck: c.deck })));
  expect(cards).toHaveLength(24);
  expect(cards.every(c => c.id.startsWith('vk_frieren_s01e01_'))).toBeTruthy();
  expect(cards.some(c => c.term === 'die Hauptstadt')).toBeTruthy();
  expect(cards.some(c => c.term === 'entschlüsseln')).toBeTruthy();
});
