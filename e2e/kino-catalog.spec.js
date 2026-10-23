const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const path = require('path');
async function openCatalog(page) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  await page.goto('/?hub=kino');
  await expect(page.locator('#kinoCatalog')).toBeVisible();
}

test('Kino starts with one row of covers and titles; a film opens its own parts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openCatalog(page);
  await expect(page.locator('.kino-film-card')).toHaveCount(10);
  await expect(page.locator('#kinoDiscovery')).toBeHidden();
  await expect(page.locator('#kinoPeppaChapters')).toBeHidden();
  for (const card of await page.locator('.kino-film-card').all()) {
    expect(await card.locator(':scope > *').evaluateAll(nodes => nodes.map(n => n.tagName))).toEqual(['IMG', 'STRONG']);
    expect((await page.request.get(await card.locator('img').getAttribute('src'))).ok()).toBeTruthy();
    await expect(card).not.toContainText('phần');
  }
  const tops = await page.locator('.kino-film-card img').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
  await page.screenshot({ path: path.join(__dirname, '../review-assets/kino-catalog-desktop.png') });
  for (const [key, count] of [['peppa_supermarkt', 5], ['pizzaschwester', 3], ['babysitter', 4], ['hans', 4], ['trudes_fahrstuhl', 5], ['erdmaennchen_nudeltrick', 7], ['erdmaennchen_schmucklose', 7], ['we_bare_bears_mall', 3], ['frieren_s01e01', 7], ['sakura_s01e01', 8]]) {
    await page.locator(`.kino-film-card[data-movie="${key}"]`).click();
    await expect(page.locator('#kinoCatalog')).toBeHidden();
    await expect(page.locator('#kinoCatalogDetailCount')).toHaveText(`${count} phần`);
    await expect(page.locator('.peppa-part')).toHaveCount(count);
    await expect(page.locator('#kinoDiscovery')).toBeHidden();
    await expect(page.locator('#kinoFullMovieBtn')).toBeVisible();
    await expect(page.locator('#kinoLessonTabs')).toBeHidden();
    await page.locator('#kinoCatalogBack').click();
    await expect(page.locator('#kinoCatalog')).toBeVisible();
    await expect(page.locator(`.kino-film-card[data-movie="${key}"]`)).toBeFocused();
  }
  expect(errors).toEqual([]);
});

test('browser back and forward, reload and direct film links restore the right view', async ({ page }) => {
  await openCatalog(page);
  await page.locator('.kino-film-card[data-movie="pizzaschwester"]').click();
  await page.locator('.peppa-part[data-chapter="1"]').click();
  await page.goBack();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#kinoCatalog')).toBeHidden();
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 2 / 3');
  await page.reload();
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('3 phần');
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 2 / 3');
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await page.reload();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await page.goto('/?kino=babysitter&part=4');
  await expect(page.locator('#kinoCatalog')).toBeHidden();
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('4 phần');
  await expect(page.locator('#peppaPartMeta')).toContainText('PHẦN 4 / 4');
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
});

test('phone gallery scrolls as one row and detail count is visible only after selecting a film', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: path.join(__dirname, '../review-assets/kino-catalog-mobile.png') });
  await page.locator('.kino-film-card[data-movie="babysitter"]').focus();
  await page.locator('.kino-film-card[data-movie="babysitter"]').press('Enter');
  await expect(page.locator('#kinoCatalogDetailCount')).toBeInViewport();
  await expect(page.locator('#kinoCatalogDetailCount')).toHaveText('4 phần');
  await page.locator('.peppa-part[data-chapter="0"]').click();
  await page.locator('#kinoDiscoveryStart').click();
  await expect.poll(() => page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBe(false);
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  await page.locator('#kinoCatalogBack').click();
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  expect(await page.locator('#kinoDiscoveryVideo').evaluate(v => v.paused)).toBeTruthy();
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
