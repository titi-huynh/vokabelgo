const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const { openOverview, openPart, openFilm } = require('./helpers/kino-navigation');
const path = require('path');

const movies = [
  { key: 'pizzaschwester', query: 'pizza', parts: 3, firstText: 'Möchten Sie gerne eine Pizza bestellen?', time: 35.5,
    titles: ['Tiệm pizza và chiếc xe cũ', 'Thử chiếc xe mới', 'Trở lại tiệm pizza và sửa xe'] },
  { key: 'babysitter', query: 'babysitter', parts: 4, firstText: 'Na, wie geht\'s dir, Bluey?', time: 35.3,
    titles: ['Người trông trẻ đến', 'Hỏi chuyện làm quen', 'Chơi và kể chuyện', 'Yên tâm trước giờ ngủ'] }
];
async function openMovie(page, movie, data = {}) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', ...data });
  await page.goto(`/?kino=${movie.query}&part=1`);
  await expect(page.locator('#kinoPeppaChapters')).toHaveAttribute('data-video', movie.key);
}
async function openWriting(page) {
  if (await page.locator('#kinoMovieOverview').isVisible()) await page.locator('.peppa-part[aria-pressed="true"]').click();
  if (!(await page.locator('#kinoDiktatInput').isVisible())) await page.locator('#peppaPractice').click();
}

async function pass(page) {
  await openWriting(page);
  await page.locator('#kinoDiktatInput').fill(await page.locator('#kinoOverlayDe').textContent());
  await page.locator('#kinoCheckBtn').click();
}

for (const movie of movies) {
  test(`${movie.key}: every chapter contains seven aligned learning turns and covers its own original movie`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await openMovie(page, movie);
    await expect(page.locator('.peppa-part')).toHaveCount(movie.parts);
    await expect(page.locator('#kinoSelBadge')).toHaveText(`${movie.parts} phần`);
    const audit = await page.evaluate(key => {
      const { cues, chapters } = KINO_CHAPTER_DATA[key];
      return { count: cues.length, ids: new Set(cues.map(c => c.id)).size,
        invalid: cues.filter((c, i) => !c.text || !c.vi || c.end <= c.start || (i && c.start < cues[i - 1].end - .001)).map(c => c.id),
        bounds: chapters.map(c => [c.start, c.end]) };
    }, movie.key);
    expect(audit.ids).toBe(audit.count);
    expect(audit.invalid).toEqual([]);
    expect(audit.bounds[0][0]).toBe(0);
    audit.bounds.slice(1).forEach((b, i) => expect(b[0]).toBe(audit.bounds[i][1]));
    let allCount = 0;
    for (let i = 0; i < movie.parts; i++) {
      await openPart(page, i);
      await expect(page.locator('#peppaPartTitle')).toHaveText(movie.titles[i]);
      await expect(page.locator('#kinoTimelineList > button')).toHaveCount(7);
      await expect(page.locator('#kinoMainVideo')).not.toHaveAttribute('src');
      const turns = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS.map(s => ({ start: s.start, end: s.end, text: s.text })));
      expect(turns.every(t => t.start >= audit.bounds[i][0] && t.end <= audit.bounds[i][1] && t.end - t.start <= 8)).toBeTruthy();
      expect(turns.every(t => !/[ưừửữự]/i.test(t.text))).toBeTruthy();
      await openWriting(page);
      await expect(page.locator('#kinoMainVideo')).toHaveAttribute('src', `video/kino-light/${movie.key}-480p-v2.mp4`);
    await page.locator('#peppaAll').click();
      allCount += await page.locator('#kinoTimelineList > button').count();
      await page.locator('#peppaLight').click();
    }
    expect(allCount).toBe(audit.count);
    expect(errors).toEqual([]);
  });

  test(`${movie.key}: completing a light round, moving on, and reloading preserve the right chapter`, async ({ page }) => {
    await openMovie(page, movie);
    for (let i = 0; i < 7; i++) {
      await pass(page);
      if (i < 6) await page.locator('#kinoNextBtn').click();
    }
    await expect(page.locator('#peppaFinished')).toBeVisible();
    await expect(page.locator('#peppaOverall')).toHaveText(`0 / ${movie.parts} phần đã xem`);
    await page.locator('#peppaNextPart').click();
    await pass(page);
    await page.reload();
    await expect(page.locator('#peppaPartTitle')).toHaveText(movie.titles[1]);
    await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
    await openPart(page, 0);
    await expect(page.locator('#kinoProgressCount')).toContainText('7 / 7 câu');
    await expect(page.locator('#kinoVictoryModal')).toBeHidden();
  });

  test(`${movie.key}: subtitles follow the spoken turn and the practice clip stops at its aligned end`, async ({ page }) => {
    await openMovie(page, movie);
    await page.locator('#peppaWatch').click();
    await page.locator('#kinoFullPlayer').evaluate((v, t) => { v.pause(); v.currentTime = t; }, movie.time);
    await expect(page.locator('#peppaWatchCaption')).toBeVisible();
    await expect(page.locator('#peppaWatchDe')).toHaveText(movie.firstText);
    await page.locator('#peppaWatchCC').click();
    await expect(page.locator('#peppaWatchCaption')).toBeHidden();
    await page.locator('#peppaWatchCC').click();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: path.join(__dirname, `../test-results/captures/review-assets/${movie.key}-synced-subtitles.png`) });
    await page.locator('#kinoFullPlayer').evaluate(v => { v.currentTime = .5; });
    await expect(page.locator('#peppaWatchCaption')).toBeHidden();
    await page.getByRole('button', { name: '✖️ Quay lại bài học' }).click();
    await openWriting(page);
    await page.locator('#kinoPlayLoopBtn').click();
    const end = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex].end);
    await page.locator('#kinoMainVideo').evaluate((v, end) => { v.currentTime = end - .15; return v.play(); }, end);
    await expect.poll(() => page.locator('#kinoMainVideo').evaluate(v => v.paused)).toBeTruthy();
    expect(await page.locator('#kinoMainVideo').evaluate(v => v.currentTime)).toBeCloseTo(end, 2);
    await openOverview(page);
    await page.locator('#kinoFullMovieBtn').click();
    await expect(page.locator('#peppaWatchCaption')).toBeHidden();
    expect(await page.locator('#kinoFullPlayer').evaluate(v => v.controls)).toBe(true);
  });

  test(`${movie.key}: desktop and phone layouts keep chapter controls usable`, async ({ page }) => {
    await openMovie(page, movie);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openOverview(page);
    await page.locator('#kinoPeppaChapters').screenshot({ path: path.join(__dirname, `../test-results/captures/review-assets/${movie.key}-chapters-overview.png`) });
    await page.setViewportSize({ width: 390, height: 844 });
    await openPart(page, movie.parts - 1);
    await expect(page.locator('#peppaPartTitle')).toHaveText(movie.titles.at(-1));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.locator('#peppaWatch').click();
    await expect(page.locator('#peppaWatchControls')).toBeVisible();
    const box = await page.locator('#peppaWatchControls').boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  });
}

test('switching between both Bluey movies and Peppa keeps independent progress and original records', async ({ page }) => {
  const pizza = { completed: [2], unlockedIndex: 2 };
  const baby = { completed: [2], unlockedIndex: 2 };
  const peppa = { chapter: 0, mode: 'light', completed: [100301], watched: [], imported: true, alignmentVersion: 2 };
  await openMovie(page, movies[0], {
    vokabelgo_kino_pizzaschwester_v3: pizza,
    vokabelgo_kino_progress_babysitter: baby,
    vokabelgo_kino_peppa_chapters_v1: peppa
  });
  await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
  await pass(page);
  const recordingKeys = [];
  for (const [key, count, parts] of [['babysitter', 2, 4], ['peppa_supermarkt', 1, 5], ['pizzaschwester', 2, 3]]) {
    await openFilm(page, key);
    await expect(page.locator('.peppa-part')).toHaveCount(parts);
    await expect(page.locator('#kinoProgressCount')).toContainText(`${count} / 7 câu`);
    recordingKeys.push(await page.evaluate(() => KinoChapters.recordingKey()));
  }
  expect(new Set(recordingKeys).size).toBe(3);
  await page.reload();
  await expect(page.locator('#kinoProgressCount')).toContainText('2 / 7 câu');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_kino_pizzaschwester_v3')))).toEqual(pizza);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_kino_progress_babysitter')))).toEqual(baby);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_kino_peppa_chapters_v1')))).toEqual(peppa);
});
