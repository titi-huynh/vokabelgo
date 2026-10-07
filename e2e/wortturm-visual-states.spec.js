const { test } = require('@playwright/test');

test('Capture Wortturm Stacked & Game Over Visuals', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/wortturm.html');

  // Stack 4 blocks
  const sampleWords = [
    { vi: 'căn hộ', de: 'die Wohnung' },
    { vi: 'hôm qua', de: 'gestern' },
    { vi: 'học', de: 'lernen' },
    { vi: 'nhanh', de: 'schnell' }
  ];

  for (let i = 0; i < sampleWords.length; i++) {
    await page.waitForFunction(() => !!window.__wortturmGameInstance.movingBlockEl);
    await page.evaluate((word) => {
      const g = window.__wortturmGameInstance;
      g.currentWord = word;
      g.speed = 0;
      g.currentX = g.BASE_LEFT;
      g.movingBlockEl.style.left = g.currentX + 'px';
    }, sampleWords[i]);

    const input = page.locator('#wortturm-input');
    await input.fill(sampleWords[i].de);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  }

  // Screenshot of stacked tower
  await page.screenshot({ path: 'screenshot_wortturm_stacked.png' });

  // Now trigger game over
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
  
  // Wait for game over overlay to be fully visible and finished fading in
  await page.waitForSelector('#game-over-overlay.show');
  await page.waitForTimeout(400);

  // Screenshot of game over
  await page.screenshot({ path: 'screenshot_wortturm_game_over.png' });
});
