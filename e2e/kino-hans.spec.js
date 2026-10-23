const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const { openPart, openOverview } = require('./helpers/kino-navigation');
const path = require('path');
const fs = require('fs');
test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });

const stateKey = 'vokabelgo_kino_chapters_v1_hans';
const capture = name => path.join(__dirname, '../review-assets', name);
const peppaProgress = { chapter: 2, mode: 'light', completed: [104701], watched: [0], imported: true, alignmentVersion: 2 };
async function open(page, query = '?kino=hans') {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', vokabelgo_kino_peppa_chapters_v1: peppaProgress });
  await page.goto('/' + query);
  if (query.includes('hub=kino')) await expect(page.locator('#kinoCatalog')).toBeVisible();
  else await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('4 phần');
}
async function saved(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), stateKey);
}

test('Hans is discoverable, has valid bilingual lessons, covers and real seekable media', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page, '?hub=kino');
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await page.locator('.kino-film-card[data-movie="hans"]').click();
  await expect(page).toHaveURL(/\?kino=hans$/);
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Hans im Glück');
  await expect(page.locator('#kinoMovieSummary')).toContainText('A2–B1');
  await expect(page.locator('#kinoMovieVocabBtn')).toHaveText('📇 Ôn 24 từ và cụm từ');
  await expect(page.locator('.peppa-part')).toHaveCount(4);
  const audit = await page.evaluate(() => {
    const { cues, chapters } = KINO_CHAPTER_DATA.hans;
    return {
      count: cues.length,
      invalid: cues.filter((c, i) => !c.text || !c.vi || c.start < 0 || c.end <= c.start || c.end > 570.863 || i && c.start < cues[i-1].end).map(c => c.id),
      unique: new Set(cues.map(c => c.id)).size,
      uncovered: cues.filter(c => chapters.filter(p => c.start >= p.start && c.end <= p.end).length !== 1).map(c => c.id),
      picks: chapters.map(p => p.picks.map(id => cues.find(c => c.id === id && c.start >= p.start && c.end <= p.end)?.text)),
      last: cues.at(-1).text,
      vocabulary: HANS_LESSON.flashcards.map(c => ({ id: c.id, example: c.example, cueExists: HANS_CAPTION_CUES.some(s => s.id === c.cueId && s.text === c.example) }))
    };
  });
  expect(audit.count).toBe(122);
  expect(audit.unique).toBe(audit.count);
  expect(audit.invalid).toEqual([]);
  expect(audit.uncovered).toEqual([]);
  for (const picks of audit.picks) {
    expect(picks).toHaveLength(7);
    expect(picks.every(Boolean)).toBeTruthy();
  }
  expect(audit.last).toContain('bei seiner Mutter');
  expect(audit.vocabulary.every(c => c.cueExists)).toBeTruthy();
  expect(new Set(audit.vocabulary.map(c => c.id)).size).toBe(24);
  for (let i = 1; i <= 4; i++) {
    const response = await request.get(`/assets/kino-posters/hans-${i}.jpg`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/jpeg');
    const dimensions = await page.evaluate(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, `/assets/kino-posters/hans-${i}.jpg`);
    expect(dimensions).toEqual([960, 540]);
  }
  const videoSize = fs.statSync(path.join(__dirname, '../video/hans.mp4')).size;
  const range = await request.get('/video/hans.mp4', { headers: { Range: 'bytes=1024-2047' } });
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 1024-2047/${videoSize}`);
  expect((await range.body()).length).toBe(1024);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: capture('kino-hans-overview-desktop.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('all four Hans parts play with their own subtitles, stop at the boundary and retain watched progress', async ({ page }) => {
  await open(page);
  for (let i = 0; i < 4; i++) {
    await openPart(page, i);
    await expect(page).toHaveURL(new RegExp(`kino=hans&part=${i+1}`));
    await expect(page.locator('#kinoDiscoveryVideo')).not.toHaveAttribute('src');
    await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('poster', `assets/kino-posters/hans-${i+1}.jpg`);
    await page.locator('#kinoDiscoveryStart').click();
    await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('src', 'video/kino-light/hans-480p-v2.mp4');
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();
    const data = await page.evaluate(index => {
      const part = KINO_CHAPTER_DATA.hans.chapters[index];
      const cue = HANS_ALIGNED_UTTERANCES.find(c => c.id === part.picks[2]);
      return { end: part.end, time: (cue.start + cue.end) / 2, text: cue.text, vi: cue.vi };
    }, i);
    await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, data.time);
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(data.text);
    await expect(page.locator('#kinoDiscoveryVi')).toHaveText(data.vi);
    await page.locator('#kinoDiscoveryCC').click();
    await expect(page.locator('#kinoDiscoveryDe')).toBeEmpty();
    await page.locator('#kinoDiscoveryCC').click();
    await expect(page.locator('#kinoDiscoveryDe')).toHaveText(data.text);
    await page.locator('#kinoDiscoveryVideo').evaluate((v, end) => { v.currentTime = end - .15; return v.play(); }, data.end);
    await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
    expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeCloseTo(data.end, 2);
  }
  const progress = await saved(page);
  expect(progress.watched).toEqual([0, 1, 2, 3]);
  expect(progress.completed).toEqual([]);
  await page.reload();
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 4 / 4');
  expect((await saved(page)).watched).toEqual([0, 1, 2, 3]);
});

test('Hans opt-in seven-cue round preserves separate progress after reload', async ({ page }) => {
  await open(page, '?kino=hans&part=1');
  await page.locator('#kinoListenSentences').click();
  await page.locator('#peppaLight').click();
  await expect(page.locator('#kinoListenDe')).toHaveText('Meine Zeit ist um.');
  await page.locator('#kinoPlayLoopBtn').click();
  await expect.poll(() => page.evaluate(() => { const v=document.getElementById('kinoMainVideo'), end=PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex].end; return v.paused && !v.seeking && Math.abs(v.currentTime-end)<.05; })).toBeTruthy();
  const first = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS[0]);
  expect(await page.locator('#kinoMainVideo').evaluate(v => v.currentTime)).toBeCloseTo(first.end, 1);
  await page.locator('#peppaPractice').click();
  await page.locator('#kinoDiktatInput').fill('Banane');
  await page.locator('#kinoCheckBtn').click();
  expect((await saved(page)).completed).toEqual([]);
  await page.locator('#kinoDiktatInput').fill('Meine Zeit ist um.');
  await page.locator('#kinoCheckBtn').click();
  expect((await saved(page)).completed).toEqual([400108]);
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  for (let i = 1; i < 7; i++) {
    await page.locator('#kinoDiktatInput').fill(await page.locator('#kinoOverlayDe').textContent());
    await page.locator('#kinoCheckBtn').click();
    if (i < 6) await page.locator('#kinoNextBtn').click();
  }
  await expect(page.locator('#peppaFinished')).toBeVisible();
  expect((await saved(page)).completed).toHaveLength(7);
  expect((await saved(page)).watched).toEqual([]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_kino_peppa_chapters_v1')))).toEqual(peppaProgress);
  await page.locator('#peppaNextPart').click();
  await expect(page.locator('#kinoDiscovery')).toBeVisible();
  await expect(page).toHaveURL(/kino=hans&part=2/);
});

test('Hans defaults to every complete practice unit, including narration and character speech', async ({ page }) => {
  await open(page);
  const expectedCounts = [32, 27, 37, 26];
  let total = 0;
  for (let i = 0; i < 4; i++) {
    await openPart(page, i);
    await page.locator('#kinoListenSentences').click();
    await expect(page.locator('#peppaAll')).toHaveText('Toàn bộ lời thoại');
    await expect(page.locator('#peppaAll')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#peppaWatchStatus')).toHaveText(`${expectedCounts[i]} câu · Gồm lời nhân vật và người kể chuyện`);
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(expectedCounts[i]);
    const result = await page.evaluate(index => {
      const chapter = HANS_LESSON.chapterData.chapters[index];
      return { actual: PIZZASCHWESTER_72_SEGMENTS.map(s => s.id),
        expected: HANS_ALIGNED_UTTERANCES.filter(s => s.start >= chapter.start && s.end <= chapter.end).map(s => s.id) };
    }, i);
    expect(result.actual).toEqual(result.expected);
    await page.locator('#peppaPractice').click();
    await expect(page.locator('#kinoPracticePosition')).toContainText(`Câu 1 / ${expectedCounts[i]}`);
    if (i === 1) {
      await expect(page.locator('#kinoOverlayDe')).toHaveText('Es wäre durchgegangen, wenn nicht ein Bauer es festgehalten hätte, der die Straße entlangkam und eine Kuh vor sich hertrieb.');
      await page.locator('#kinoTimelineCollapseBtn').click();
      await page.locator('#kinoTimelineList > button').nth(2).click();
      await expect(page.locator('#kinoOverlayDe')).toHaveText('Reiten macht überhaupt keinen Spaß.');
      await page.locator('#kinoTimelineCollapseBtn').click();
    }
    total += result.actual.length;
  }
  expect(total).toBe(122);
  expect((await saved(page)).mode).toBe('all');
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(26);
});

test('existing Hans preview switches once to complete dialogue, retains progress, then remembers an explicit short-mode choice', async ({ page }) => {
  const previous = { chapter: 1, mode: 'light', completed: [400139], watched: [0], imported: true, alignmentVersion: 2 };
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', [stateKey]: previous });
  await page.goto('/?kino=hans&part=2');
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#peppaAll')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(27);
  const migrated = await saved(page);
  expect(migrated).toMatchObject({ chapter: 1, mode: 'all', completed: [400139], watched: [0], practiceModeVersion: 1 });
  await page.locator('#kinoDiktatInput').fill(await page.locator('#kinoOverlayDe').textContent());
  await page.locator('#kinoCheckBtn').click();
  expect((await saved(page)).completed).toEqual(expect.arrayContaining([500136, 400139]));
  await page.locator('#peppaLight').click();
  await expect(page.locator('#peppaWatchStatus')).toContainText('7 / 27');
  await page.reload();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#peppaLight')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
  expect((await saved(page)).completed).toEqual(expect.arrayContaining([500136, 400139]));
});

test('Hans vocabulary opens its own 24-card deck from the overview', async ({ page }) => {
  await open(page);
  await page.locator('#kinoMovieVocabBtn').click();
  await expect(page.locator('#deckSelect')).toHaveValue('🎬 Video: Hans im Glück');
  const cards = await page.evaluate(() => filtered.map(c => ({ id: c.id, term: c.term, deck: c.deck })));
  expect(cards).toHaveLength(24);
  expect(cards.every(c => c.id.startsWith('vk_hans_') && c.deck === '🎬 Video: Hans im Glück')).toBeTruthy();
  expect(cards.some(c => c.term === 'die Gans')).toBeTruthy();
});

test('content revision preserves every caption in complete practice units and keeps original learning records', async ({ page }) => {
  const previous = { chapter: 1, mode: 'all', completed: [400136, 400137, 400153, 400139],
    watched: [0], imported: true, alignmentVersion: 2, practiceModeVersion: 1 };
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', [stateKey]: previous });
  await page.goto('/?kino=hans&part=2');
  await page.locator('#peppaPractice').click();
  const audit = await page.evaluate(() => {
    const captions = HANS_CAPTION_CUES;
    const units = HANS_ALIGNED_UTTERANCES;
    const tokens = text => text.toLowerCase().replace(/ß/g, 'ss').match(/[\p{L}\p{N}_]+/gu) || [];
    const expanded = units.flatMap(c => c.legacyIds || [c.id]);
    return {
      originalIds: captions.map(c => c.id), expanded,
      lostWords: units.filter(unit => {
        const parts = (unit.legacyIds || [unit.id]).map(id => captions.find(c => c.id === id));
        return JSON.stringify(tokens(parts.map(c => c.text).join(' '))) !== JSON.stringify(tokens(unit.text));
      }).map(c => c.id),
      badTiming: units.filter(unit => {
        const parts = (unit.legacyIds || [unit.id]).map(id => captions.find(c => c.id === id));
        return unit.start !== parts[0].start || unit.end !== parts.at(-1).end;
      }).map(c => c.id),
      wheel: captions.find(c => c.id === 400187).text,
      quotation: units.find(c => c.id === 500111).text
    };
  });
  expect(audit.expanded).toEqual(audit.originalIds);
  expect(new Set(audit.expanded).size).toBe(138);
  expect(audit.lostWords).toEqual([]);
  expect(audit.badTiming).toEqual([]);
  expect(audit.wheel).toContain('Schleifrad');
  expect(audit.quotation).toContain('und gab ihm ein Stück Gold');
  const migrated = await saved(page);
  expect(migrated.completed).toEqual(expect.arrayContaining([...previous.completed, 500136]));
  expect(migrated.completed).not.toContain(500153); // One fragment alone is not the whole new sentence.
  expect(migrated.contentVersion).toBe(2);
  expect(migrated.watched).toEqual([0]);
  await page.reload();
  expect((await saved(page)).completed).toEqual(migrated.completed);
});

test('Hans phone preview stays readable and direct part links survive browser navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '?kino=hans&part=3');
  await expect(page.locator('#peppaPartTitle')).toHaveText('Con ngỗng và cuộc gặp bên đường');
  await page.locator('#kinoDiscoveryStart').click();
  const cue = await page.evaluate(() => HANS_ALIGNED_UTTERANCES.find(c => c.id === 400176));
  await page.locator('#kinoDiscoveryVideo').evaluate((v, time) => { v.pause(); v.currentTime = time; }, (cue.start + cue.end) / 2);
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText('Bitte, hilf mir!');
  await page.screenshot({ path: capture('kino-hans-lesson-mobile.png'), fullPage: true });
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoDiktatInput')).toBeVisible();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await openOverview(page);
  await openPart(page, 3);
  await page.goBack();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 4 / 4');
  await page.reload();
  await expect(page).toHaveURL(/kino=hans&part=4/);
});

test.describe('Hans speaking', () => {
  test('a recording can be created and replayed before completing dictation', async ({ page }) => {
    await open(page, '?kino=hans&part=4');
    await page.locator('#kinoSpeakChoice').click();
    await expect(page.locator('#kinoDubRecordBtn')).toBeEnabled();
    await page.locator('#kinoDubRecordBtn').click();
    await expect(page.locator('#kinoRecordingHud')).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(350); // Collect real MediaRecorder samples from the fake device.
    await page.locator('#kinoDubRecordBtn').click();
    await expect(page.locator('#kinoDubReplayRow')).toBeVisible();
    const recording = await page.evaluate(async () => {
      const blob = await (await fetch(kinoDubbingBlobUrls[kinoCurrentIndex])).blob();
      return { bytes: blob.size, key: KinoChapters.recordingKey() };
    });
    expect(recording.bytes).toBeGreaterThan(100);
    expect(recording.key).toBe('hans_3_all');
    expect((await saved(page)).completed).toEqual([]);
    await page.locator('[data-nav="study"]').click();
    await expect.poll(() => page.locator('#kinoMainVideo').evaluate(v => v.paused && !v.hasAttribute('src'))).toBeTruthy();
  });
});
