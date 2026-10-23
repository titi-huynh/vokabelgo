const { test, expect } = require('@playwright/test');

test.describe('WortCrush High-Fidelity Gameplay Preview E2E Tests', () => {

  test('Route Access: /preview/wortcrush, /wortcrush, and /wortcrush.html load correctly', async ({ page }) => {
    // 1. Direct html route
    await page.goto('/wortcrush.html');
    await expect(page.locator('.brand-title')).toHaveText('WortCrush');
    await expect(page.locator('#hud-distanz-val')).toHaveText('0');

    // 2. /preview/wortcrush route
    await page.goto('/preview/wortcrush');
    await expect(page.locator('.brand-title')).toHaveText('WortCrush');

    // 3. /wortcrush route
    await page.goto('/wortcrush');
    await expect(page.locator('.brand-title')).toHaveText('WortCrush');
  });

  test('Scenario 1: Enter when input is empty -> warning feedback, glass does NOT break', async ({ page }) => {
    await page.goto('/wortcrush.html');

    const input = page.locator('#crush-input');
    await input.focus();
    await page.keyboard.press('Enter');

    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Vui lòng nhập từ');
    await expect(page.locator('#hud-distanz-val')).toHaveText('0');

    // Solid glass still intact
    await expect(page.locator('.glass-shard-polygon').first()).toBeVisible();
  });

  test('Scenario 2: Wrong answer -> warning feedback, glass does NOT break, input shakes', async ({ page }) => {
    await page.goto('/wortcrush.html');

    const input = page.locator('#crush-input');
    await input.fill('sai hoan toan');
    await page.keyboard.press('Enter');

    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Noch einmal');
    await expect(page.locator('#hud-distanz-val')).toHaveText('0');
    await expect(page.locator('.glass-shard-polygon').first()).toBeVisible();
  });

  test('Scenario 3: Missing article is rejected with Fast! hint', async ({ page }) => {
    await page.goto('/wortcrush.html');

    // Force current word to a noun like 'die Wohnung'
    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'căn hộ', de: 'die Wohnung' };
      document.getElementById('prompt-vietnamese').textContent = '“căn hộ”';
    });

    const input = page.locator('#crush-input');
    await input.fill('Wohnung'); // Missing 'die'
    await page.keyboard.press('Enter');

    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Fast! → die Wohnung');
    await expect(page.locator('#hud-distanz-val')).toHaveText('0');
    await expect(page.locator('.glass-shard-polygon').first()).toBeVisible();
  });

  test('Scenario 4: Lowercase noun is rejected with Fast! hint', async ({ page }) => {
    await page.goto('/wortcrush.html');

    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'căn hộ', de: 'die Wohnung' };
      document.getElementById('prompt-vietnamese').textContent = '“căn hộ”';
    });

    const input = page.locator('#crush-input');
    await input.fill('die wohnung'); // Lowercase 'w'
    await page.keyboard.press('Enter');

    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Fast! → die Wohnung');
    await expect(page.locator('#hud-distanz-val')).toHaveText('0');
  });

  test('Scenario 5: Umlaut equivalent is accepted as correct (e.g. die Kueche for die Küche)', async ({ page }) => {
    await page.goto('/wortcrush.html');

    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'nhà bếp', de: 'die Küche' };
      document.getElementById('prompt-vietnamese').textContent = '“nhà bếp”';
    });

    const input = page.locator('#crush-input');
    await input.fill('die Kueche');
    await page.keyboard.press('Enter');

    // Should trigger correct sequence and shatter
    await expect(page.locator('#hud-distanz-val')).toHaveText('1', { timeout: 3000 });
  });

  test('Scenario 6: Correct answer -> Projectile -> Shatter -> Forward thrust -> Distanz +1 -> Next prompt', async ({ page }) => {
    await page.goto('/wortcrush.html');

    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'căn hộ', de: 'die Wohnung' };
      document.getElementById('prompt-vietnamese').textContent = '“căn hộ”';
    });

    const input = page.locator('#crush-input');
    await input.fill('die Wohnung');
    await page.keyboard.press('Enter');

    // Input is locked during firing and breaking
    await expect(input).toBeDisabled();

    // Distanz increments to 1
    await expect(page.locator('#hud-distanz-val')).toHaveText('1', { timeout: 2000 });

    // After settle, input is re-enabled, cleared, and focused
    await expect(input).toBeEnabled({ timeout: 2000 });
    await expect(input).toHaveValue('');
  });

  test('Scenario 7: Spamming Enter does not create duplicate points or break scene', async ({ page }) => {
    await page.goto('/wortcrush.html');

    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'căn hộ', de: 'die Wohnung' };
      document.getElementById('prompt-vietnamese').textContent = '“căn hộ”';
    });

    const input = page.locator('#crush-input');
    await input.fill('die Wohnung');

    // Rapid spam Enter 5 times
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    // Distanz should be strictly 1, not 2, 3, 4, or 5
    await page.waitForTimeout(1200);
    await expect(page.locator('#hud-distanz-val')).toHaveText('1');
  });

  test('Scenario 8: Pause and Resume functionality', async ({ page }) => {
    await page.goto('/wortcrush.html');

    // Click pause
    await page.click('#btn-pause');
    const pauseModal = page.locator('#pause-modal');
    await expect(pauseModal).toBeVisible();
    await expect(page.locator('#crush-input')).toBeDisabled();

    // Click resume
    await page.click('#btn-resume');
    await expect(pauseModal).not.toBeVisible();
    await expect(page.locator('#crush-input')).toBeEnabled();
  });

  test('Scenario 9: End session (Beenden) and Restart', async ({ page }) => {
    await page.goto('/wortcrush.html');

    // Score 1 point first
    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'lái xe', de: 'fahren' };
      document.getElementById('prompt-vietnamese').textContent = '“lái xe”';
    });

    await page.fill('#crush-input', 'fahren');
    await page.keyboard.press('Enter');
    await expect(page.locator('#hud-distanz-val')).toHaveText('1', { timeout: 2000 });

    // Click End button
    await page.click('#btn-end');
    const endModal = page.locator('#end-modal');
    await expect(endModal).toBeVisible();
    await expect(page.locator('#end-distanz-val')).toHaveText('1');
    await expect(page.locator('#end-summary-text')).toContainText('1 Wort geschafft');

    // Click Restart button
    await page.click('#btn-restart');
    await expect(endModal).not.toBeVisible();
    await expect(page.locator('#hud-distanz-val')).toHaveText('0');
    await expect(page.locator('#crush-input')).toBeEnabled();
  });

  test('Scenario 10: German Umlaut quick toolbar inserts character', async ({ page }) => {
    await page.goto('/wortcrush.html');

    const input = page.locator('#crush-input');
    await input.focus();
    await page.click('button[data-char="ü"]');

    await expect(input).toHaveValue('ü');
  });

  test('Scenario 11: Sound toggle button changes mute state', async ({ page }) => {
    await page.goto('/wortcrush.html');

    const iconOn = page.locator('#icon-sound-on');
    const iconOff = page.locator('#icon-sound-off');

    await expect(iconOn).toBeVisible();
    await expect(iconOff).not.toBeVisible();

    // Toggle sound off
    await page.click('#btn-sound');
    await expect(iconOn).not.toBeVisible();
    await expect(iconOff).toBeVisible();

    // Toggle sound back on
    await page.click('#btn-sound');
    await expect(iconOn).toBeVisible();
    await expect(iconOff).not.toBeVisible();
  });

  test('Scenario 12: Visual Inspection & Screenshots Capture (Desktop & Mobile)', async ({ page }) => {
    // 1. Desktop Viewport (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/wortcrush.html');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/captures/screenshot_wortcrush_desktop.png' });

    // 2. Mobile Viewport (390x844 - iPhone 14 / modern smartphone)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/wortcrush.html');
    await page.waitForTimeout(300);

    // Verify zero horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    await page.screenshot({ path: 'test-results/captures/screenshot_wortcrush_mobile.png' });

    // 3. Capture Shatter Animation Action Shot
    await page.evaluate(() => {
      const g = window.__wortcrushGameInstance;
      g.currentWord = { vi: 'căn hộ', de: 'die Wohnung' };
      document.getElementById('prompt-vietnamese').textContent = '“căn hộ”';
    });

    await page.fill('#crush-input', 'die Wohnung');
    await page.keyboard.press('Enter');

    // Wait 260ms into the shatter animation
    await page.waitForTimeout(260);
    await page.screenshot({ path: 'test-results/captures/screenshot_wortcrush_shatter.png' });
  });

});
