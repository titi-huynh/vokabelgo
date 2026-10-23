const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const { openOverview, openPart, openFilm } = require('./helpers/kino-navigation');
const path = require('path');

async function openPeppa(page, data = {}) {
  await seedStorage(page, data);
  await page.goto('/?kino=peppa&part=1');
  await expect(page.locator('#kinoLessonHeader')).toBeVisible();
}

async function openWriting(page) {
  if (await page.locator('#kinoMovieOverview').isVisible()) await page.locator('.peppa-part[aria-pressed="true"]').click();
  if (!(await page.locator('#kinoDiktatInput').isVisible())) await page.locator('#peppaPractice').click();
}

async function passCurrentSentence(page) {
  await openWriting(page);
  const text = await page.locator('#kinoOverlayDe').textContent();
  await page.locator('#kinoDiktatInput').fill(text);
  await page.locator('#kinoCheckBtn').click();
}

test('five chapters cover the original movie; every light round has seven relevant lines', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openPeppa(page);
  await expect(page.locator('.peppa-part')).toHaveCount(5);
  await expect(page.locator('#kinoProgressCount')).toContainText('0 / 7 câu');
  await expect(page.locator('#kinoSelBadge')).toHaveText('5 phần');
  const starts = [];
  const ends = [];
  let fullCount = 0;
  for (let part = 0; part < 5; part++) {
    await openPart(page, part);
    await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
    const samples = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS.map(s => ({ id: s.id, start: s.start, end: s.end })));
    await page.locator('#peppaWatch').click();
    await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => !v.paused && v.readyState >= 2)).toBeTruthy();
    const begin = await page.locator('#kinoFullPlayer').evaluate(video => { video.pause(); return video.currentTime; });
    starts.push(begin);
    // Seek beyond this part: the viewer must clamp and pause at its own end.
    await page.locator('#kinoFullPlayer').evaluate(video => { video.currentTime = 918.8; });
    const expectedEnds = [177.72, 359.56, 548.56, 727.6, 919.04];
    if (part < 4) {
      await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => v.currentTime)).toBeCloseTo(expectedEnds[part], 1);
    }
    ends.push(expectedEnds[part]);
    expect(samples.every(s => s.start >= begin && s.end <= expectedEnds[part])).toBeTruthy();
    await page.getByRole('button', { name: '✖️ Quay lại bài học' }).click();
    await openWriting(page);
    await page.locator('#peppaAll').click();
    const count = await page.locator('#kinoTimelineList > button').count();
    fullCount += count;
    await page.locator('#peppaLight').click();
  }
  expect(fullCount).toBe(await page.evaluate(() => PEPPA_ALIGNED_UTTERANCES.length));
  // Playback has already begun when the click resolves, so allow a few frames.
  expect(starts[0]).toBeLessThan(0.3);
  starts.slice(1).forEach((start, i) => expect(Math.abs(start - ends[i])).toBeLessThan(0.3));
  expect(errors).toEqual([]);
});

test('completion and resume stay independent across chapters, preserve the old record, and share completed lines with all mode', async ({ page }) => {
  const original = { completed: [3], unlockedIndex: 3, lastActiveIndex: 2 };
  await openPeppa(page, { vokabelgo_kino_progress_peppa_supermarkt: original });
  await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
  // The migrated first line is complete; resume at the next incomplete line.
  await passCurrentSentence(page);
  await expect(page.locator('#kinoProgressCount')).toContainText('2 / 7 câu');
  await openWriting(page);
    await page.locator('#peppaAll').click();
  // The original group had three turns (shopping list, Oh!, Achtung), all preserved.
  await expect(page.locator('#kinoProgressCount')).toContainText('4 /');
  await page.locator('#peppaLight').click();
  await openPart(page, 1);
  await expect(page.locator('#kinoProgressCount')).toContainText('0 / 7 câu');
  await passCurrentSentence(page);
  await page.reload();
  await expect(page.locator('#peppaPartTitle')).toHaveText('Quầy thanh toán tự động');
  await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
  await openPart(page, 0);
  await expect(page.locator('#kinoProgressCount')).toContainText('2 / 7 câu');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_kino_progress_peppa_supermarkt')))).toEqual(original);
});

test('finishing seven lines offers a stopping point and next chapter; full movie and Bluey still work', async ({ page }) => {
  await openPeppa(page);
  for (let i = 0; i < 7; i++) {
    await passCurrentSentence(page);
    if (i < 6) await page.locator('#kinoNextBtn').click();
  }
  await expect(page.locator('#peppaFinished')).toBeVisible();
  await expect(page.locator('#peppaOverall')).toHaveText('0 / 5 phần đã xem');
  await expect(page.locator('#kinoVictoryModal')).toBeHidden();
  await page.locator('#peppaNextPart').click();
  await expect(page.locator('#peppaPartTitle')).toHaveText('Quầy thanh toán tự động');
  await expect(page.locator('#peppaFinished')).toBeHidden();
  await openOverview(page);
    await page.locator('#kinoFullMovieBtn').click();
  await expect(page.locator('#peppaWatchNote')).toBeHidden();
  await expect(page.locator('#kinoFullModalTitle')).toContainText('Xem toàn phim');
  await page.locator('#kinoFullPlayer').evaluate(v => { v.pause(); v.currentTime = 500; });
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => v.currentTime)).toBeCloseTo(500, 0);
  await page.getByRole('button', { name: '✖️ Quay lại bài học' }).click();
  await openFilm(page, 'pizzaschwester');
  await expect(page.locator('#kinoLessonHeader')).toBeVisible();
  await expect(page.locator('.peppa-part')).toHaveCount(3);
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
  await expect(page.locator('#kinoSelBadge')).toHaveText('3 phần');
  await expect(page.locator('#kinoMainVideo')).not.toHaveAttribute('src');
  await page.locator('#kinoListenSentences').click();
  await expect(page.locator('#kinoMainVideo')).toHaveAttribute('src', 'video/kino-light/pizzaschwester-480p-v2.mp4');
});

test('reset affects only the selected round, and the original media stays in use', async ({ page }) => {
  await openPeppa(page);
  await passCurrentSentence(page);
  await openPart(page, 1);
  await passCurrentSentence(page);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('.kino-more-tools summary').click();
  await page.getByRole('button', { name: '🔄 Làm lại từ đầu' }).click();
  await expect(page.locator('#kinoProgressCount')).toContainText('0 / 7 câu');
  await openPart(page, 0);
  await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
  await expect(page.locator('#kinoMainVideo')).not.toHaveAttribute('src');
  await expect(page.locator('#kinoFullPlayer')).not.toHaveAttribute('src');
  await page.locator('#kinoListenSentences').click();
  await expect(page.locator('#kinoMainVideo')).toHaveAttribute('src', 'video/kino-light/peppa_supermarkt-480p-v2.mp4');
  await page.locator('#kinoBackToParts').click();
  await page.locator('#peppaWatch').click();
  await expect(page.locator('#kinoFullPlayer')).toHaveAttribute('src', 'video/kino-light/peppa_supermarkt-480p-v2.mp4');
  await expect(page.locator('#kinoMainVideo')).not.toHaveAttribute('src');
});

test('chapter viewer shows local time, stops naturally, replays this chapter, and restores full-movie controls', async ({ page }) => {
  await openPeppa(page);
  await openPart(page, 1);
  await page.locator('#peppaWatch').click();
  await expect(page.locator('#peppaWatchControls')).toBeVisible();
  await expect(page.locator('#peppaWatchLength')).toHaveText('3:02');
  expect(await page.locator('#kinoFullPlayer').evaluate(v => v.controls)).toBe(false);
  await page.locator('#kinoFullPlayer').evaluate(v => { v.currentTime = 359.4; return v.play(); });
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => v.paused)).toBeTruthy();
  await expect(page.locator('#peppaWatchMessage')).toContainText('Đã xem hết phần này');
  await page.getByRole('button', { name: 'Phát phần phim', exact: true }).click();
  await expect.poll(() => page.locator('#kinoFullPlayer').evaluate(v => v.currentTime)).toBeLessThan(181);
  await page.getByRole('button', { name: 'Tạm dừng phần phim', exact: true }).click();
  await page.getByRole('button', { name: '✖️ Quay lại bài học' }).click();
  await expect(page.locator('#kinoDiscoveryNotice')).toContainText('Đã xem phần này');
  await openOverview(page);
    await page.locator('#kinoFullMovieBtn').click();
  expect(await page.locator('#kinoFullPlayer').evaluate(v => v.controls)).toBe(true);
  await expect(page.locator('#peppaWatchControls')).toBeHidden();
});

test('spoken turns have bilingual subtitles and do not mix old episode boundaries', async ({ page }) => {
  await openPeppa(page);
  const audit = await page.evaluate(() => {
    const cues = PEPPA_ALIGNED_UTTERANCES;
    return {
      count: cues.length,
      unique: new Set(cues.map(cue => cue.id)).size,
      invalid: cues.filter((cue, index) => !cue.text || !cue.vi || cue.end <= cue.start ||
        (index && cue.start < cues[index - 1].end - .001)).map(cue => cue.id),
      selected: PIZZASCHWESTER_72_SEGMENTS.map(cue => ({ duration: cue.end - cue.start, text: cue.text }))
    };
  });
  expect(audit.count).toBeGreaterThan(106);
  expect(audit.unique).toBe(audit.count);
  expect(audit.invalid).toEqual([]);
  expect(audit.selected.every(cue => cue.duration >= .6 && cue.duration <= 8)).toBeTruthy();
  await page.locator('#peppaWatch').click();
  await page.locator('#kinoFullPlayer').evaluate(video => { video.pause(); video.currentTime = 18.8; });
  await expect(page.locator('#peppaWatchDe')).toHaveText('Ähm, wir haben Kartoffeln, Milch, Brot.');
  await expect(page.locator('#peppaWatchCaption')).toBeVisible();
  await expect(page.locator('#peppaWatchVi')).toContainText('khoai tây');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: path.join(__dirname, '../test-results/captures/review-assets/peppa-synced-subtitles.png') });
  await page.locator('#kinoFullPlayer').evaluate(video => { video.currentTime = 22.9; });
  await expect(page.locator('#peppaWatchDe')).toHaveText('Oh!');
  await page.locator('#peppaWatchCC').click();
  await expect(page.locator('#peppaWatchCaption')).toBeHidden();
  await page.locator('#peppaWatchCC').click();
  await expect(page.locator('#peppaWatchCaption')).toBeVisible();
  await page.locator('#kinoFullPlayer').evaluate(video => { video.currentTime = .5; });
  await expect(page.locator('#peppaWatchCaption')).toBeHidden();
});

test('a practice sentence stops at its own aligned end without waiting for the next timeupdate', async ({ page }) => {
  await openPeppa(page);
  await openWriting(page);
    await page.locator('#kinoPlayLoopBtn').click();
  const end = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex].end);
  await page.locator('#kinoMainVideo').evaluate((video, end) => { video.currentTime = end - .15; return video.play(); }, end);
  await expect.poll(() => page.locator('#kinoMainVideo').evaluate(video => video.paused)).toBeTruthy();
  expect(await page.locator('#kinoMainVideo').evaluate(video => video.currentTime)).toBeCloseTo(end, 2);
});

test('Peppa stays usable on desktop and phone, with a review screenshot', async ({ page }) => {
  await openPeppa(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await openOverview(page);
  await page.locator('#kinoPeppaChapters').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(__dirname, '../test-results/captures/review-assets/peppa-five-parts-desktop.png'), fullPage: true });
  await openOverview(page);
    await page.locator('#kinoPeppaChapters').screenshot({ path: path.join(__dirname, '../test-results/captures/review-assets/peppa-five-parts-overview.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.peppa-part').last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await openPart(page, 4);
  await expect(page.locator('#peppaPartTitle')).toHaveText('Cùng làm tacos');
  await expect(page.locator('#kinoProgressCount')).toContainText('0 / 7 câu');
  await page.locator('#kinoLessonHeader').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(__dirname, '../test-results/captures/review-assets/peppa-five-parts-mobile.png'), fullPage: true });
  await page.locator('#peppaWatch').click();
  await expect(page.locator('#peppaWatchControls')).toBeVisible();
  const controls = await page.locator('#peppaWatchControls').boundingBox();
  expect(controls.y + controls.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
