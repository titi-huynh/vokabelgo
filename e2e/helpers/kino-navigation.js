const { expect } = require('@playwright/test');
async function openOverview(page) {
  if (await page.locator('#diktatMode').getAttribute('data-kino-view') === 'lesson') {
    await page.locator('#kinoCatalogBack').click();
    await expect(page.locator('#kinoMovieOverview')).toBeVisible();
  }
}
async function openPart(page, index) {
  await openOverview(page);
  await page.locator(`.peppa-part[data-chapter="${index}"]`).click();
  await expect(page.locator('#kinoLessonTabs')).toBeVisible();
}
async function openFilm(page, key) {
  await page.locator('[data-nav="kino"]').click();
  await page.locator(`.kino-film-card[data-movie="${key}"]`).click();
  await page.locator('.peppa-part[aria-pressed="true"]').click();
}
module.exports = { openOverview, openPart, openFilm };
