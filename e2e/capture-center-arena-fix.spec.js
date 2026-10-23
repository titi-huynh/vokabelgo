const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Capture Center Arena Polish Review', () => {
  const artifactDir = path.join(__dirname, '../test-results/captures');

  test('Capture Desktop Clean Center Arena & Transient Toast', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dau-tu.html?qa=1');

    await page.locator('#deck-adjektive').click();
    await page.locator('#mode-practice').click();
    await page.locator('#btn-start').click();

    await expect(page.locator('#game')).toBeVisible();
    await page.waitForTimeout(500);

    // 1. Desktop Clean Center Arena
    const p1 = path.join(artifactDir, 'desktop_center_arena_cleaned.png');
    await page.screenshot({ path: p1 });

    // 2. Trigger a move action toast via bot or simulated move
    await page.evaluate(() => {
      // Trigger a transient game toast
      const toast = document.getElementById('game-toast');
      if (toast) {
        toast.textContent = 'Mia → schließen · Cùng từ';
        toast.dataset.tone = 'info';
        toast.hidden = false;
        toast.classList.add('visible');
      }
    });
    await page.waitForTimeout(300);

    const p2 = path.join(artifactDir, 'desktop_game_toast_move.png');
    await page.screenshot({ path: p2 });
  });

  test('Capture Mobile Clean Center Arena', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dau-tu.html?qa=1');

    await page.locator('#btn-start').click();
    await expect(page.locator('#game')).toBeVisible();
    await page.waitForTimeout(500);

    const p3 = path.join(artifactDir, 'mobile_center_arena_cleaned.png');
    await page.screenshot({ path: p3 });
  });
});
