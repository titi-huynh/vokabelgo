const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const path = require('path');

test('German number words pass dictation while a different number remains incorrect', async ({page}) => {
  await seedStorage(page, {vokabelgo_kino_reset_done_v2026:'true'});
  await page.goto('/?kino=frieren&part=2');
  await page.locator('#peppaPractice').click();
  const equivalents = await page.evaluate(() => [
    ['zehn','10'],['dreißig','30'],['fünfzig','50'],['hundert','100'],['einhundert','100']
  ].every(([word,digit]) => normalizeKinoClean(word)===normalizeKinoClean(digit)));
  expect(equivalents).toBeTruthy();
  await page.locator('#kinoTimelineCollapseBtn').click();
  await page.locator('#kinoTimelineList > button').filter({hasText:'Diese Meteore sieht man nur einmal alle'}).click();
  await page.locator('#kinoDiktatInput').fill('Diese Meteore sieht man nur einmal alle dreißig Jahre.');
  await page.locator('#kinoCheckBtn').click();
  const key='vokabelgo_kino_chapters_v1_frieren_s01e01';
  expect((await getStorageJson(page,key)).completed).not.toContain(700161);
  await page.locator('#kinoDiktatInput').fill('Diese Meteore sieht man nur einmal alle fünfzig Jahre.');
  await page.locator('#kinoCheckBtn').click();
  expect((await getStorageJson(page,key)).completed).toContain(700161);
  await expect(page.locator('#kinoFeedbackStatus')).toHaveClass(/correct/);
});

test('Frieren overview and full-dialogue writing remain usable on a phone', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await seedStorage(page, {vokabelgo_kino_reset_done_v2026:'true'});
  await page.goto('/?kino=frieren');
  await expect(page.locator('.peppa-part')).toHaveCount(7);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.locator('.peppa-part[data-chapter="5"]').click();
  await page.locator('#kinoListenSentences').click();
  await expect(page.locator('#kinoListenDe')).toHaveText('Schon wieder derselbe Baum.');
  await expect(page.locator('#kinoTimelineList > button')).toHaveCount(32);
  await page.locator('#peppaPractice').click();
  await expect(page.locator('#kinoDiktatInput')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:path.join(__dirname,'../test-results/captures/review-assets/kino-frieren-phone.png'),fullPage:true});
});

test('uncertain transcript review has five source clips and never writes learning progress', async ({page}) => {
  await page.goto('/qa/kino-alignment/frieren_s01e01/codex-review-needed.html');
  await expect(page.getByRole('heading',{name:'5 câu cần rà lại lời'})).toBeVisible();
  await expect(page.locator('article')).toHaveCount(5);
  const before=await page.evaluate(()=>JSON.stringify(localStorage));
  await page.locator('[data-start]').first().click();
  await expect.poll(()=>page.locator('#source').evaluate(v=>v.currentTime)).toBeGreaterThan(728);
  await expect.poll(()=>page.locator('#source').evaluate(v=>v.paused)).toBeTruthy();
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
});
