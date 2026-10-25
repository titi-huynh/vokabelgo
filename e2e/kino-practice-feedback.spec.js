const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const path = require('path');

async function openWriting(page, storage = {}) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true', ...storage });
  await page.goto('/?kino=peppa&part=1');
  await expect(page.locator('#kinoDiscovery')).toBeVisible();
  await page.locator('#peppaPractice').click();
}
test('missing, extra and misspelled words do not mark the following words wrong', async ({ page }) => {
  await openWriting(page);
  await page.locator('#kinoDiktatInput').fill('wir haben Kartoffeln, Milch, Brot.');
  await page.locator('#kinoCheckBtn').click();
  await expect(page.locator('[data-kind="missing"]')).toHaveText('Thiếu: Ähm');
  await expect(page.locator('[data-kind="correct"]')).toHaveCount(5);
  await expect(page.locator('[data-kind="replace"]')).toHaveCount(0);
  await expect(page.locator('.kino-diff-summary')).toHaveText('Thiếu 1 từ');
  const key = 'vokabelgo_kino_peppa_chapters_v1';
  expect((await getStorageJson(page, key)).completed).not.toContain(100301);
  await page.locator('.kino-writing-card').screenshot({ path: path.join(__dirname, '../review-assets/kino-word-feedback-desktop.png') });

  await page.locator('#kinoDiktatInput').fill('Ähm wir haben heute Kartoffeln Milh Brot extra');
  await page.locator('#kinoCheckBtn').click();
  await expect(page.locator('[data-kind="extra"]')).toHaveText(['Thừa: heute', 'Thừa: extra']);
  await expect(page.locator('[data-kind="replace"]')).toHaveText('Milh → Milch');
  await expect(page.locator('[data-kind="correct"]')).toHaveCount(5);
  expect((await getStorageJson(page, key)).completed).not.toContain(100301);

  await page.locator('#kinoDiktatInput').fill('ÄHM wir haben Kartoffeln Milch Brot');
  await page.locator('#kinoCheckBtn').click();
  await expect(page.locator('#kinoFeedbackStatus')).toContainText('Đã khớp');
  expect((await getStorageJson(page, key)).completed).toContain(100301);
});

test('curated usage follows the selected sentence and old progress survives re-curation', async ({ page }) => {
  const key = 'vokabelgo_kino_peppa_chapters_v1';
  await page.setViewportSize({ width: 390, height: 844 });
  // 100401 was previously suggested; retain it even when no longer in the shortlist.
  await openWriting(page, { [key]: { chapter: 0, mode: 'light', completed: [100401], watched: [0], imported: true } });
  await expect(page.locator('#kinoUsageNote')).toBeVisible();
  await expect(page.locator('#kinoUsageNote')).toContainText('Tình huống:');
  const firstUsage = await page.locator('#kinoUsageNote').textContent();
  await page.locator('#kinoSkipWriting').click();
  await expect(page.locator('#kinoUsageNote')).not.toHaveText(firstUsage);
  await page.locator('#kinoListenChoice').click();
  await page.locator('#kinoListenSentences').click();
  await expect(page.locator('#kinoUsageNote')).toHaveText(firstUsage);
  await page.locator('#kinoActivityNext').click();
  await expect(page.locator('#kinoListenDe')).toHaveText('Tut mir leid, Herr Bulle!');
  await expect(page.locator('#kinoUsageNote')).toBeVisible();
  await page.locator('#kinoSpeakChoice').click();
  await expect(page.locator('#kinoUsageNote')).toBeVisible();
  expect((await getStorageJson(page, key)).completed).toContain(100401);
  expect((await getStorageJson(page, key)).watched).toContain(0);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#kinoPracticeHeading').screenshot({ path: path.join(__dirname, '../review-assets/kino-practice-usage-mobile.png') });
});

test('feedback treats markup as text and a wrong answer never completes a sentence', async ({ page }) => {
  await openWriting(page);
  await page.locator('#kinoDiktatInput').fill('Ähm <img src=x onerror=alert(1)> wir haben Kartoffeln Milch Brot');
  await page.locator('#kinoCheckBtn').click();
  await expect(page.locator('#kinoWordDiffBox img')).toHaveCount(0);
  await expect(page.locator('#kinoWordDiffBox')).toContainText('<img');
  await expect(page.locator('[data-kind="correct"]')).toHaveCount(6);
  expect((await getStorageJson(page, 'vokabelgo_kino_peppa_chapters_v1')).completed).toEqual([]);
});
