const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const path = require('path');
const capture = name => path.join(__dirname, '../review-assets', name);
async function openCatalog(page) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  await page.goto('/?hub=kino');
}

test('catalog → film overview → chosen part, with full-video viewing on the overview', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openCatalog(page);
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await page.locator('.kino-film-card[data-movie="pizzaschwester"]').click();
  await expect(page.locator('#kinoMovieTitle')).toHaveText('Pizza-Schwestern');
  await expect(page.locator('#kinoFullMovieBtn')).toBeVisible();
  await expect(page.locator('.peppa-part')).toHaveCount(3);
  await expect(page.locator('#kinoLessonTabs')).toBeHidden();
  await expect(page.locator('#kinoDiscovery')).toBeHidden();
  await expect(page).toHaveURL(/kino=pizza$/);
  await page.screenshot({ path: capture('kino-film-overview-desktop.png') });
  await page.locator('#kinoFullMovieBtn').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.locator('#kinoFullPlayer').evaluate(v => v.controls)).toBeTruthy();
  await page.locator('#kinoFullPlayer').evaluate(v => { v.pause(); v.currentTime = 300; });
  expect(await page.locator('#kinoFullPlayer').evaluate(v => v.currentTime)).toBeCloseTo(300, 0);
  await page.getByRole('dialog').press('Escape');
  await expect(page.locator('#kinoFullMovieBtn')).toBeFocused();
  await page.locator('.peppa-part[data-chapter="1"]').click();
  await expect(page.locator('#kinoMovieOverview')).toBeHidden();
  await expect(page.locator('#kinoPeppaChapters')).toBeHidden();
  await expect(page.locator('#kinoLessonTabs')).toBeVisible();
  await expect(page.getByRole('tab')).toHaveText(['Nghe hiểu', 'Viết', 'Nói']);
  await expect(page.getByRole('tab', { name: 'Nghe hiểu', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#peppaPartTitle')).toHaveText('Thử chiếc xe mới');
  await expect(page.locator('#kinoDiktatInput')).toBeHidden();
  await expect(page.locator('#kinoDubRecordBtn')).toBeHidden();
  await page.screenshot({ path: capture('kino-part-tabs-desktop.png') });
  await page.locator('#kinoDiscoveryStart').click();
  expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.currentTime)).toBeGreaterThanOrEqual(134.5);
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
  await expect(page.locator('#kinoLessonTabs')).toBeHidden();
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  expect(errors).toEqual([]);
});

test('part tabs switch freely, retain the selected sentence, and reload into listening', async ({ page }) => {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  await page.goto('/?kino=babysitter&part=3');
  await expect(page.getByRole('tab', { name: 'Nghe hiểu', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Viết', exact: true }).click();
  await expect(page.locator('#kinoDiktatInput')).toBeVisible();
  await page.locator('#kinoSkipWriting').click();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  await page.getByRole('tab', { name: 'Nói', exact: true }).click();
  await expect(page.locator('#kinoDubRecordBtn')).toBeEnabled();
  await expect(page.locator('#kinoPracticePosition')).toContainText('Câu 2 / 7');
  await expect(page.locator('#kinoDiktatInput')).toBeHidden();
  await page.getByRole('tab', { name: 'Nói', exact: true }).press('Home');
  await expect(page.getByRole('tab', { name: 'Nghe hiểu', exact: true })).toBeFocused();
  await expect(page.locator('#kinoDiscovery')).toBeVisible();
  await page.getByRole('tab', { name: 'Nghe hiểu', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Viết', exact: true })).toBeFocused();
  await expect(page.locator('#kinoDiktatInput')).toBeVisible();
  await page.locator('#kinoDiktatInput').fill(await page.locator('#kinoOverlayDe').textContent());
  await page.locator('#kinoCheckBtn').click();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Nghe hiểu', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 3 / 4');
  await page.getByRole('tab', { name: 'Viết', exact: true }).click();
  await expect(page.locator('#kinoProgressCount')).toContainText('1 / 7 câu');
});

test('phone overview shows the full-video choice and parts, then a compact accessible lesson tab bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page);
  await page.locator('.kino-film-card[data-movie="peppa_supermarkt"]').click();
  await expect(page.locator('#kinoFullMovieBtn')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('.peppa-part').first()).toBeInViewport();
  await expect(page.locator('#kinoLessonTabs')).toBeHidden();
  await page.screenshot({ path: capture('kino-film-overview-mobile.png') });
  await page.locator('.peppa-part[data-chapter="4"]').click();
  await expect(page.locator('#kinoLessonTabs')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#kinoDiscoveryVideo')).toBeInViewport();
  await page.screenshot({ path: capture('kino-part-tabs-mobile.png') });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('tab', { name: 'Viết', exact: true }).click();
    await expect(page.locator('#kinoDiktatInput')).toHaveCSS('font-size', width <= 640 ? '18px' : '16px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('tab', { name: 'Nghe hiểu', exact: true }).click();
  }
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.reload();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await expect(page.locator('#kinoLessonTabs')).toBeHidden();
});
