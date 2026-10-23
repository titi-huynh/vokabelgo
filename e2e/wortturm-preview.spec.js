const { test, expect } = require('@playwright/test');

test.describe('Wortturm Prototype Preview E2E Tests', () => {

  test('Route Access: /preview/wortturm, /wortturm, and /wortturm.html load correctly', async ({ page }) => {
    // 1. Direct html
    await page.goto('/wortturm.html');
    await expect(page.locator('.brand-title')).toHaveText('Wortturm');
    await expect(page.locator('#hud-score-val')).toHaveText('0');

    // 2. /preview/wortturm
    await page.goto('/preview/wortturm');
    await expect(page.locator('.brand-title')).toHaveText('Wortturm');

    // 3. /wortturm
    await page.goto('/wortturm');
    await expect(page.locator('.brand-title')).toHaveText('Wortturm');
  });

  test('Scenario 1: Enter when input is empty -> feedback shown, block does NOT drop', async ({ page }) => {
    await page.goto('/wortturm.html');

    const input = page.locator('#wortturm-input');
    await input.focus();
    await page.keyboard.press('Enter');

    // Feedback should show warning
    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Vui lòng nhập từ');

    // Block should still be moving, score remains 0
    await expect(page.locator('#hud-score-val')).toHaveText('0');
    await expect(page.locator('.wt-block-moving')).toBeVisible();
  });

  test('Scenario 2: Wrong answer -> feedback shown, block does NOT drop', async ({ page }) => {
    await page.goto('/wortturm.html');

    const input = page.locator('#wortturm-input');
    await input.fill('sai hoan toan');
    await page.keyboard.press('Enter');

    // Hint should show feedback
    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Noch einmal');

    // Score remains 0, block still moving
    await expect(page.locator('#hud-score-val')).toHaveText('0');
    await expect(page.locator('.wt-block-moving')).toBeVisible();
  });

  test('Scenario 13: Missing article is rejected with hint', async ({ page }) => {
    await page.goto('/wortturm.html');

    // Force current word to a noun like 'der Bahnhof'
    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'nhà ga', de: 'der Bahnhof' };
      document.getElementById('prompt-vi').textContent = '“nhà ga”';
      const textSpan = g.movingBlockEl.querySelector('.block-text');
      if (textSpan) textSpan.textContent = 'nhà ga';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('Bahnhof'); // Missing 'der'
    await page.keyboard.press('Enter');

    const hint = page.locator('#input-hint');
    await expect(hint).toContainText('Fast! → der Bahnhof');
    await expect(page.locator('#hud-score-val')).toHaveText('0');
  });

  test('Scenario 12: Umlaut equivalent is accepted (e.g. Kueche for die Küche)', async ({ page }) => {
    await page.goto('/wortturm.html');

    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'nhà bếp', de: 'die Küche' };
      // Align moving block right above base block for perfect drop
      g.currentX = g.BASE_LEFT;
      g.movingBlockEl.style.left = g.currentX + 'px';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('die Kueche');
    await page.keyboard.press('Enter');

    // Block drops and height increases to 1
    await expect(page.locator('#hud-score-val')).toHaveText('1');
    const feedback = page.locator('#feedback-overlay');
    await expect(feedback).toBeVisible();
  });

  test('Scenario 3, 4: Correct answer with near-perfect alignment awards PERFEKT! ✨', async ({ page }) => {
    await page.goto('/wortturm.html');

    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'học', de: 'lernen' };
      // Align exactly with base block (đóng băng chuyển động như Scenario 5,
      // nếu không khối sẽ trôi khỏi vị trí căn chỉnh trước khi kịp nhấn Enter)
      g.speed = 0;
      g.currentX = g.BASE_LEFT;
      g.movingBlockEl.style.left = g.currentX + 'px';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('lernen');
    await page.keyboard.press('Enter');

    // Score becomes 1
    await expect(page.locator('#hud-score-val')).toHaveText('1');
    const feedback = page.locator('#feedback-overlay');
    await expect(feedback).toContainText('PERFEKT');
  });

  test('Scenario 5: Partial overlap slices overhang and narrows next block', async ({ page }) => {
    await page.goto('/wortturm.html');

    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'học', de: 'lernen' };
      // Base is [70, 290]. Set moving block at X = 110 (shifted by 40px, overlap = 180)
      g.speed = 0; // Freeze motion for exact positioning
      g.currentX = 110;
      g.movingBlockEl.style.left = '110px';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('lernen');
    await page.keyboard.press('Enter');

    await expect(page.locator('#hud-score-val')).toHaveText('1');
    const feedback = page.locator('#feedback-overlay');
    await expect(feedback).toContainText('RICHTIG');

    // Wait for next round to spawn
    await page.waitForTimeout(450);

    // Verify next block width is 180px
    const nextWidth = await page.evaluate(() => {
      return window.__wortturmGameInstance.currentWidth;
    });
    expect(nextWidth).toBe(180);
  });

  test('Scenario 6: Overlap <= 0 triggers Tower Collapse (TURM GEFALLEN!) and Game Over', async ({ page }) => {
    await page.goto('/wortturm.html');

    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'đắt', de: 'teuer' };
      // Base is [70, 290]. Set moving block completely off to the right (X = 300, width = 50)
      g.speed = 0; // Freeze motion for complete miss
      g.currentWidth = 50;
      g.movingBlockEl.style.width = '50px';
      g.currentX = 300;
      g.movingBlockEl.style.left = '300px';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('teuer');
    await page.keyboard.press('Enter');

    // Overlay TURM GEFALLEN should appear
    const gameOverOverlay = page.locator('#game-over-overlay');
    await expect(gameOverOverlay).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.game-over-title')).toHaveText('TURM GEFALLEN!');
    await expect(page.locator('#btn-restart')).toBeVisible();
  });

  test('Scenario 7, 15: Restarting game resets Höhe to 0 and clears stack', async ({ page }) => {
    await page.goto('/wortturm.html');

    // Trigger game over first
    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'đắt', de: 'teuer' };
      g.speed = 0;
      g.currentWidth = 50;
      g.movingBlockEl.style.width = '50px';
      g.currentX = 300;
      g.movingBlockEl.style.left = '300px';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('teuer');
    await page.keyboard.press('Enter');

    const gameOverOverlay = page.locator('#game-over-overlay');
    await expect(gameOverOverlay).toBeVisible();

    // Click restart
    await page.locator('#btn-restart').click();

    // Overlay closes, score resets to 0
    await expect(gameOverOverlay).not.toBeVisible();
    await expect(page.locator('#hud-score-val')).toHaveText('0');
    await expect(page.locator('#wortturm-input')).toBeEnabled();
  });

  test('Scenario 8, 9: Spamming Enter does not create duplicate blocks during drop animation', async ({ page }) => {
    await page.goto('/wortturm.html');

    await page.evaluate(() => {
      const g = window.__wortturmGameInstance;
      g.currentWord = { vi: 'học', de: 'lernen' };
      g.currentX = g.BASE_LEFT;
      g.movingBlockEl.style.left = g.currentX + 'px';
    });

    const input = page.locator('#wortturm-input');
    await input.fill('lernen');

    // Press Enter 4 times rapidly
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    // Wait for placement
    await page.waitForTimeout(500);

    // Height should be exactly 1, not 2 or 3
    await expect(page.locator('#hud-score-val')).toHaveText('1');
  });

  test('Scenario 14: Tower height camera progression keeps top blocks in view', async ({ page }) => {
    await page.goto('/wortturm.html');

    // Stack 6 blocks sequentially
    for (let i = 1; i <= 6; i++) {
      await page.evaluate((step) => {
        const g = window.__wortturmGameInstance;
        g.currentWord = { vi: 'học', de: 'lernen' };
        g.currentX = g.BASE_LEFT;
        g.movingBlockEl.style.left = g.currentX + 'px';
      }, i);

      const input = page.locator('#wortturm-input');
      await input.fill('lernen');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(450);
    }

    // Height should be 6
    await expect(page.locator('#hud-score-val')).toHaveText('6');

    // Verify camera translateY has moved up
    const transform = await page.evaluate(() => {
      return document.getElementById('tower-world').style.transform;
    });
    // For level 6: cameraY = (6 - 2) * 36 = 144px
    expect(transform).toContain('translateY(144px)');
  });

  test('Scenario 10, 11: Mobile viewport layout test and screenshots capture', async ({ page }) => {
    // 1. Desktop screenshot
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/wortturm.html');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/captures/screenshot_wortturm_desktop.png' });

    // 2. Mobile screenshot
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12/13/14 size
    await page.goto('/wortturm.html');
    await page.waitForTimeout(300);

    // Check elements are properly sized and not clipped
    await expect(page.locator('#wortturm-app')).toBeVisible();
    await expect(page.locator('#game-viewport')).toBeVisible();
    await expect(page.locator('#wortturm-input')).toBeVisible();
    await expect(page.locator('#btn-submit')).toBeVisible();

    await page.screenshot({ path: 'test-results/captures/screenshot_wortturm_mobile.png' });
  });

});
