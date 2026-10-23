const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Vocabulary Rotation & Match Diversity Screenshots', () => {
  const artifactDir = path.join(__dirname, '../test-results/captures');

  test('Capture 09: Rotation Simulator with 10 Matches QA Table', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/preview/dau-tu-lexicon-review');

    // Switch to tab 5: Rotation Simulator
    await page.locator('.tab-btn[data-tab="tab-rotation"]').click();
    await expect(page.locator('#tab-rotation')).toBeVisible();

    // Reset rotation simulator to ensure fresh 10 matches
    await page.locator('#btnResetRotationSim').click();
    await page.waitForTimeout(300);

    // Click Simulate 10 Adjective matches
    await page.locator('#btnSimulate10Adj').click();
    await page.waitForTimeout(600);

    // Verify stats updated
    await expect(page.locator('#simStatTotalMatches')).toHaveText('10');
    await expect(page.locator('#simStatConsecOverlap')).toHaveText('0%');

    // 09. RotationSimulator_Adjektive
    await page.screenshot({ path: path.join(artifactDir, '09_RotationSimulator_Adjektive.png') });
  });

  test('Capture 10: In-Game Table with Dynamic Rotation Badge', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 860 });
    await page.goto('/dau-tu.html?qa=1');

    // Select Adjektive deck
    await page.locator('#deck-adjektive').click();
    await page.locator('#mode-practice').click();
    await page.waitForTimeout(300);

    // Click start game
    await page.locator('#btn-start').click();

    // Skip intro if visible
    const skipBtn = page.locator('#btn-skip-intro');
    if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipBtn.click();
    }

    await expect(page.locator('#game')).toBeVisible();
    await expect(page.locator('#match-rotation-tag')).toBeVisible();
    await page.waitForTimeout(600);

    // 10. GameWithRotationBadge
    await page.screenshot({ path: path.join(artifactDir, '10_GameWithRotationBadge.png') });
  });

  test('Capture 11: Setup Screen with Rotation Status Indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 860 });
    await page.goto('/dau-tu.html?qa=1');

    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#setup-rotation-status')).toBeVisible();
    await page.waitForTimeout(400);

    // 11. SetupRotationIndicator
    await page.screenshot({ path: path.join(artifactDir, '11_SetupRotationIndicator.png') });
  });
});
