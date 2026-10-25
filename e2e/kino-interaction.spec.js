const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const { openOverview, openPart } = require('./helpers/kino-navigation');
const path = require('path');
const capture = name => path.join(__dirname, '../test-results/captures/review-assets', name);
test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });
async function open(page, query = 'pizza') {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  await page.goto(`/?kino=${query.includes('part=') ? query : query + '&part=1'}`);
  await expect(page.locator('#kinoDiscovery')).toBeVisible();
  await expect(page.locator('#kinoDiktatInput')).toBeHidden();
}

test('Kino opens with the featured film in view; listening does not require writing', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, 'peppa&part=1');
  await expect(page.locator('#kinoDiscoveryVideo')).toBeInViewport();
  await expect(page.locator('#kinoPracticeHeading')).toBeHidden();
  await expect(page.locator('#kinoDiscoveryVideo')).not.toHaveAttribute('src');
  expect((await page.request.get(await page.locator('#kinoDiscoveryVideo').getAttribute('poster'))).ok()).toBeTruthy();
  await page.screenshot({ path: capture('kino-video-first-desktop.png') });
  await page.locator('#kinoDiscoveryStart').click();
  await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('src', 'video/kino-light/peppa_supermarkt-480p-v2.mp4');
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused)).toBeTruthy();
  await page.locator('#kinoListenSentences').click();
  expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
  await expect(page.locator('#kinoListenDe')).toHaveText('Ähm, wir haben Kartoffeln, Milch, Brot.');
  await expect(page.locator('#kinoListenVi')).toContainText('khoai tây');
  await expect(page.locator('#kinoNextBtn')).toBeEnabled();
  await page.locator('#kinoActivityNext').click();
  await expect(page.locator('#kinoListenDe')).toHaveText('Tut mir leid, Herr Bulle!');
  await page.locator('#kinoToggleSubBtn').click();
  await page.locator('#kinoToggleSubBtn').click();
  await expect(page.locator('#kinoSubOverlay')).not.toHaveClass(/hidden-sub/);
  await page.locator('#kinoBackToParts').click();
  await expect(page.locator('#kinoPracticeHeading')).toBeHidden();
  expect(await page.locator('#kinoMainVideo').evaluate(v => v.paused)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('featured subtitles and chapter boundaries stay aligned; watching does not complete writing', async ({ page }) => {
  await open(page);
  await page.locator('#kinoDiscoveryStart').click();
  // Wait for the asynchronous media preparation before seeking a paused frame.
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused && v.readyState >= 2)).toBeTruthy();
  await page.locator('#kinoDiscoveryVideo').evaluate(v => { v.pause(); v.currentTime = 35.5; });
  await expect(page.locator('#kinoDiscoveryDe')).toHaveText('Möchten Sie gerne eine Pizza bestellen?');
  await expect(page.locator('#kinoDiscoveryVi')).not.toBeEmpty();
  await page.locator('#kinoDiscoveryCC').click();
  await expect(page.locator('#kinoDiscoveryDe')).toBeEmpty();
  await page.locator('#kinoDiscoveryCC').click();
  await expect(page.locator('#kinoDiscoveryDe')).not.toBeEmpty();
  await page.locator('#kinoDiscoveryVideo').evaluate(v => { v.currentTime = 134.4; return v.play(); });
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
  expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeCloseTo(134.5, 2);
  await expect(page.locator('#peppaOverall')).toHaveText('1 / 3 phần đã xem');
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_kino_chapters_v1_pizzaschwester')));
  expect(progress.completed).toEqual([]);
  expect(progress.watched).toEqual([0]);
  await openPart(page, 1);
  await expect(page.locator('#kinoDiscoveryLength')).toHaveText('2:19');
  await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('poster', 'assets/kino-posters/pizzaschwester-2.jpg');
  await page.locator('#kinoDiscoveryStart').click();
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => !v.paused && v.currentTime >= 134.5)).toBeTruthy();
  const start = await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime);
  expect(start).toBeGreaterThanOrEqual(134.5);
  expect(start).toBeLessThan(135);
  await openOverview(page);
  await page.locator('#kinoFullMovieBtn').click();
  expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
  expect(await page.locator('#kinoFullPlayer').evaluate(v => v.controls)).toBeTruthy();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#kinoFullMovieBtn')).toBeFocused();
});

test('writing offers feedback, source text and skipping; progress resumes without a test gate', async ({ page }) => {
  await open(page);
  await page.locator('#peppaPractice').click();
  await page.locator('#kinoDiktatInput').fill('Hallo');
  await page.locator('#kinoCheckBtn').click();
  await expect(page.locator('#kinoFeedbackStatus')).toContainText('Mình cùng xem lại');
  await expect(page.locator('#kinoFeedbackBox')).not.toContainText('100%');
  await page.locator('#kinoAnswerBtn').click();
  await expect(page.locator('#kinoWordDiffBox')).toContainText('Möchten Sie');
  await page.locator('#kinoSkipWriting').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  const answer = await page.locator('#kinoOverlayDe').textContent();
  await page.locator('#kinoDiktatInput').fill(answer);
  await page.locator('#kinoDiktatInput').press('Enter');
  await expect(page.locator('#kinoFeedbackStatus')).toContainText('Đã khớp');
  await expect(page.locator('#kinoDiktatInput')).toHaveValue(answer);
  await expect(page.locator('#kinoContinueSentence')).toBeVisible();
  await expect(page.locator('#kinoWriteChoiceHint')).toContainText('Viết tiếp từ câu 1');
  await page.reload();
  await expect(page.locator('#kinoDiktatInput')).toBeHidden();
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 1 / 7');
  await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
  await page.locator('#kinoTimelineCollapseBtn').click();
  await page.locator('#kinoRow_6').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 7 / 7');
  await page.locator('#kinoSkipWriting').click();
  await expect(page.locator('#kinoPracticeHeading')).toBeHidden();
});

test('phone film detail enlarges text and Kino reentry returns to the film catalog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'peppa&part=5');
  await expect(page.locator('#kinoDiscoveryVideo')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#kinoDiscoveryStart')).toBeInViewport();
  await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('poster', 'assets/kino-posters/peppa_supermarkt-5.jpg');
  await page.screenshot({ path: capture('kino-video-first-mobile.png') });
  await page.locator('#kinoListenSentences').click();
  await expect(page.locator('#kinoListenDe')).toHaveCSS('font-size', '22px');
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoDiktatInput')).toHaveCSS('font-size', '18px');
  await page.locator('#kinoDiktatInput').fill('Hallo');
  await page.locator('#kinoListenWhileTyping').click();
  await expect(page.locator('#kinoDiktatInput')).toHaveValue('Hallo');
  await page.locator('#kinoDiktatInput').fill(await page.locator('#kinoOverlayDe').textContent());
  await page.locator('#kinoCheckBtn').click();
  await page.locator('.kino-writing-card').screenshot({ path: capture('kino-gentle-writing-mobile.png') });
  await page.locator('[data-nav="study"]').click();
  await page.locator('[data-nav="kino"]').click();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await expect(page.locator('#kinoDiscoveryVideo')).toBeHidden();
  await page.locator('.kino-film-card[data-movie="peppa_supermarkt"]').click();
  await page.locator('.peppa-part[aria-pressed="true"]').click();
  await expect(page.locator('#kinoDiscoveryVideo')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#kinoDiktatInput')).toBeHidden();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('#peppaPractice').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator('#kinoSkipWriting').click();
    await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 3 / 7');
    await page.locator('#kinoBackToParts').click();
  }
});

test('movie and chapter selection remain keyboard accessible and save the chosen chapter', async ({ page }) => {
  await open(page);
  await page.locator('[data-nav="kino"]').click();
  await page.locator('.kino-film-card[data-movie="babysitter"]').focus();
  await page.locator('.kino-film-card[data-movie="babysitter"]').press('Enter');
  await page.locator('.peppa-part').first().focus();
  await page.locator('.peppa-part').first().press('End');
  await expect(page.locator('.peppa-part').last()).toBeFocused();
  await page.locator('.peppa-part').last().press('Enter');
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 4 / 4');
  await page.reload();
  await expect(page.locator('#kinoDiscoveryVideo')).toHaveAttribute('poster', 'assets/kino-posters/babysitter-4.jpg');
  await page.locator('.kino-more-tools summary').click();
  await expect(page.getByRole('button', { name: '🔄 Làm lại từ đầu' })).toBeVisible();
  await page.locator('.kino-more-tools summary').press('Escape');
  await expect(page.getByRole('button', { name: '🔄 Làm lại từ đầu' })).toBeHidden();
});

test.describe('optional speaking with a fake microphone', () => {
  test('speaking works before writing and canceling the countdown releases the microphone', async ({ page }) => {
    await page.addInitScript(() => {
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      window.__kinoMicRequests = 0;
      navigator.mediaDevices.getUserMedia = async (...args) => {
        window.__kinoMicRequests++;
        window.__kinoTestStream = await original(...args);
        return window.__kinoTestStream;
      };
    });
    await open(page);
    await page.locator('#kinoSpeakChoice').click();
    await expect(page.locator('#kinoDubRecordBtn')).toBeEnabled();
    await expect(page.locator('#kinoDubQuoteBody')).toBeVisible();
    await expect(page.locator('#kinoDiktatInput')).toBeHidden();
    expect(await page.evaluate(() => window.__kinoMicRequests)).toBe(0);
    await page.locator('#kinoActivityNext').click();
    await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
    await page.clock.install();
    await page.locator('#kinoDubRecordBtn').click();
    await expect(page.locator('#kinoCountdownHud')).toBeVisible();
    await page.locator('#kinoDubRecordBtn').click();
    await expect(page.locator('#kinoCountdownHud')).toBeHidden();
    await page.clock.fastForward(4000);
    expect(await page.evaluate(() => kinoIsDubbing)).toBe(false);
    expect(await page.evaluate(() => window.__kinoTestStream.getTracks().every(track => track.readyState === 'ended'))).toBeTruthy();
    await expect(page.locator('#kinoRecordingHud')).toBeHidden();
    await page.locator('#kinoDubRecordBtn').click();
    await expect(page.locator('#kinoCountdownHud')).toBeVisible();
    await page.clock.fastForward(2800);
    await expect(page.locator('#kinoRecordingHud')).toBeVisible();
    await page.locator('#kinoDubRecordBtn').click();
    await expect(page.locator('#kinoDubReplayRow')).toBeVisible();
    expect(await page.evaluate(() => kinoCompletedSet.size)).toBe(0);
    await page.locator('[data-nav="today"]').click();
    await expect.poll(() => page.locator('#kinoMainVideo').evaluate(v => v.paused)).toBeTruthy();
    await expect.poll(() => page.evaluate(() => !kinoDubbingReplayAudio || kinoDubbingReplayAudio.paused)).toBeTruthy();
  });
});
