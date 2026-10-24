/* E2E: Kino Shorts Feed — cuộn dọc qua các câu thoại, phát đúng đoạn, tra từ, thích. */
const { test, expect } = require('@playwright/test');

async function openCatalog(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('vokabelgo_kino_reset_done_v2026', 'true'));
  await page.goto('/?hub=kino');
  await page.waitForSelector('#kinoShortHero .kino-short-feed-btn', { timeout: 20000 });
}

test('shorts feed: open from hero, segment plays and loops metadata, scroll switches playback, gloss + like work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await openCatalog(page);
  await page.locator('.kino-short-feed-btn').click();
  await expect(page.locator('#ksfOverlay')).toBeVisible();
  const count = await page.locator('.ksf-item').count();
  expect(count).toBeGreaterThanOrEqual(3);
  // Đoạn đầu phát và mốc câu đã được nạp (chú thích Việt của câu xuất hiện hoặc thanh tiến độ chạy)
  await page.waitForFunction(() => {
    const v = document.querySelector('.ksf-item[data-idx="0"] video');
    return v && !v.paused && v.currentTime > 0;
  }, null, { timeout: 25000 });
  await page.waitForFunction(() => {
    const item = document.querySelector('.ksf-item[data-idx="0"]');
    const bar = item.querySelector('.ksf-progress span');
    return (bar && parseFloat(bar.style.width) > 0) || item.querySelector('.ksf-vi');
  }, null, { timeout: 25000 });
  // Cuộn sang đoạn 2: đoạn 2 phát, đoạn 1 dừng
  await page.evaluate(() => document.querySelector('.ksf-item[data-idx="1"]').scrollIntoView());
  await page.waitForFunction(() => {
    const v1 = document.querySelector('.ksf-item[data-idx="0"] video');
    const v2 = document.querySelector('.ksf-item[data-idx="1"] video');
    return v1 && v2 && v1.paused && !v2.paused;
  }, null, { timeout: 25000 });
  await expect(page.locator('#ksfCounter')).toHaveText('2 / ' + count);
  // Chạm một từ trong câu Đức -> thanh tra từ hiện
  await page.locator('.ksf-item[data-idx="1"] .ksf-word').first().click();
  await expect(page.locator('#ksfGloss')).toBeVisible();
  await page.locator('#ksfGlossClose').click();
  // Thích đoạn hiện tại -> trạng thái giữ trong localStorage
  await page.locator('.ksf-item[data-idx="1"] .ksf-like').click();
  await expect(page.locator('.ksf-item[data-idx="1"] .ksf-like')).toHaveClass(/on/);
  const likes = await page.evaluate(() => JSON.parse(localStorage.getItem('vokabelgo_shorts_likes_v1') || '[]'));
  expect(likes.length).toBe(1);
  // Đóng feed
  await page.locator('#ksfClose').click();
  await expect(page.locator('#ksfOverlay')).toBeHidden();
  expect(errors).toEqual([]);
});
