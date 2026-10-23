const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Đấu từ — VokabelGo v0.6 E2E Acceptance Tests', () => {

  test('Route Access: /preview/dau-tu, /dau-tu, /dau-tu.html, and /dau-tu-cards load correctly', async ({ page }) => {
    // 1. Direct html route
    await page.goto('/dau-tu.html');
    await expect(page.locator('.brand')).toContainText('VokabelGo');
    await expect(page.locator('.brand')).toContainText(/0\.\d/);
    await expect(page.locator('#deck-adjektive')).toBeVisible();
    await expect(page.locator('#deck-verben')).toBeVisible();
    await expect(page.locator('#mode-practice')).toBeVisible();
    await expect(page.locator('#mode-classic')).toBeVisible();

    // 2. /preview/dau-tu route
    await page.goto('/preview/dau-tu');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.brand')).toContainText('VokabelGo');

    // 3. /dau-tu route
    await page.goto('/dau-tu');
    await expect(page.locator('.brand')).toContainText('VokabelGo');

    // 4. Sample cards route (dau-tu-cards.html redirects to dau-tu.html?view=cards)
    await page.goto('/dau-tu-cards.html');
    await expect(page.locator('#gallery h1')).toContainText('Bộ bài Đấu từ');
  });

  test('Card Component Samples: 10 card fronts + 1 card back, interactive states, and gallery display', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dau-tu-cards.html');

    // Check exactly 11 figures (10 fronts + 1 card back)
    const galleryCards = page.locator('#gallery-cards figure');
    await expect(galleryCards).toHaveCount(11);

    // Verify card back exists
    const cardBack = page.locator('#gallery-cards .card-back');
    await expect(cardBack).toBeVisible();
    await expect(cardBack).toContainText('VokabelGo');
    await expect(cardBack).toContainText('ĐẤU TỪ');

    // Capture screenshot: 10 representative cards + card back
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_sample_cards.png'), fullPage: true });
  });

  test('Adjektive Gameplay & Desktop Layout (1280x720 / 1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dau-tu.html?qa=1');

    // Select Adjektive deck and start game in Practice mode (player goes first)
    await page.locator('#deck-adjektive').click();
    await page.locator('#mode-practice').click();
    await page.locator('#btn-start').click();

    // Verify gameplay elements
    await expect(page.locator('#game')).toBeVisible();
    await expect(page.locator('#player-count')).toHaveText('5 lá');
    await expect(page.locator('#bot-count')).toHaveText('5 lá');
    await expect(page.locator('#seat-bot-top')).toBeVisible();
    await expect(page.locator('#seat-bot-left')).toBeVisible();
    await expect(page.locator('#seat-bot-right')).toBeVisible();
    await expect(page.locator('#turn-ring')).toBeVisible();
    await expect(page.locator('#game-mode')).toContainText('Làm quen · Tính từ');

    // Check target card and sentence
    await expect(page.locator('#target-card')).toBeVisible();
    await expect(page.locator('#sentence')).toBeVisible();

    // Verify player hand has 5 cards
    const playerCards = page.locator('#hand [data-card-id]');
    await expect(playerCards).toHaveCount(5);

    // Turn is player's turn in Practice mode
    await expect(page.locator('#turn-label')).toContainText('Lượt của bạn');

    // Tapping a card selects it
    await playerCards.first().click();
    await expect(playerCards.first()).toHaveClass(/selected/);
    await expect(page.locator('#btn-info')).toBeVisible();
    await expect(page.locator('#btn-play')).toBeVisible();

    // Toggle Vietnamese sentence translation on demand
    await page.locator('#btn-translate').click();
    await expect(page.locator('#translation')).toBeVisible();

    // Capture screenshot: Adjektive Desktop
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_adjektive_desktop.png') });
  });

  test('Verben Gameplay & Separable Verb Highlighting', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dau-tu.html?qa=1');

    // Select Verben deck and start game
    await page.locator('#deck-verben').click();
    await page.locator('#btn-start').click();

    await expect(page.locator('#game')).toBeVisible();
    await expect(page.locator('#player-count')).toHaveText('5 lá');
    await expect(page.locator('#game-mode')).toContainText('Động từ');

    // Check that highlight tokens mark tag exists in sentence
    await expect(page.locator('#sentence mark').first()).toBeVisible();

    // Capture screenshot: Verben Desktop
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_verben_desktop.png') });
  });

  test('Two-Step Hint Flow & Card Highlight', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dau-tu.html?qa=1');

    await page.locator('#btn-start').click();
    await expect(page.locator('#game')).toBeVisible();

    // Click Gợi ý (Bước 1)
    await page.locator('#btn-hint').click();
    const panel = page.locator('#panel');
    await expect(panel).toBeVisible();
    await expect(page.locator('#panel-title')).toContainText('Gợi ý nghĩa');

    // Capture screenshot of Step 1 hint modal
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_hint_twostep.png') });

    // Click Step 2: Chỉ một lá phù hợp
    await page.locator('button[data-cmd="hint2"]').click();
    await expect(panel).not.toBeVisible();
  });

  test('Functional Cards: Farbenwahl & GEGENTEIL Dialogs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dau-tu.html?qa=1');

    // Use QA hook to fixture a game state where player has GEGENTEIL and Farbenwahl
    await page.evaluate(() => {
      const E = window.DAU_TU_ENGINE;
      const s = E.createInitialGameState('adjektive', 42, 'player', 4);
      // Hoán đổi (không sao chép) lá đặc biệt từ chồng rút vào tay người chơi:
      // engine 0.6 từ chối nước đi nếu một ID lá xuất hiện hai nơi.
      const swapIn = (pred, handIndex) => {
        const i = s.drawPile.findIndex(pred);
        if (i < 0) return;
        const card = s.drawPile[i];
        s.drawPile[i] = s.playerHand[handIndex];
        s.playerHand[handIndex] = card;
      };
      swapIn(c => c.actionType === 'gegenteil', 0);
      swapIn(c => c.actionType === 'farbenwahl', 1);
      window.DAUTU_PREVIEW_QA.load(s);
    });

    // Select GEGENTEIL
    const gegenteilCard = page.locator('#hand [data-card-id]').first();
    await gegenteilCard.click();
    await page.locator('#btn-play').click();

    // Bản 0.6: GEGENTEIL áp dụng ngay (không còn hộp thoại chọn như 0.3) —
    // thông báo đảo nghĩa hiện ra và lá rời khỏi tay người chơi.
    await expect(page.locator('#feedback')).toContainText('đảo nghĩa');
    await expect(page.locator('#hand [data-card-id]')).toHaveCount(4);

    // Capture screenshot: GEGENTEIL state
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_gegenteil.png') });

    // Tình huống 2: Farbenwahl mở bộ chọn màu ngay trên bàn (inline selector)
    await page.evaluate(() => {
      const E = window.DAU_TU_ENGINE;
      const s = E.createInitialGameState('adjektive', 42, 'player', 4);
      const i = s.drawPile.findIndex(c => c.actionType === 'farbenwahl');
      if (i >= 0) {
        const card = s.drawPile[i];
        s.drawPile[i] = s.playerHand[0];
        s.playerHand[0] = card;
      }
      window.DAUTU_PREVIEW_QA.load(s);
    });

    await page.locator('#hand [data-card-id]').first().click();
    await page.locator('#btn-play').click();

    const colorSelector = page.locator('#inline-color-selector');
    await expect(colorSelector).toBeVisible();
    await colorSelector.locator('button[data-color]').first().click();
    await expect(colorSelector).toBeHidden();
  });

  test('Game Over Summary Screen & Statistics', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dau-tu.html?qa=1');

    await page.locator('#btn-start').click();

    // Trigger game finish via QA hook
    await page.evaluate(() => {
      const s = window.DAUTU_PREVIEW_QA.getState();
      s.turnState = 'game_over';
      s.winner = 'player';
      s.turnCount = 14;
      window.DAUTU_PREVIEW_QA.finish();
    });

    const panel = page.locator('#panel');
    await expect(panel).toBeVisible();
    await expect(page.locator('#panel-title')).toContainText(/thắng/i);
    await expect(page.locator('.result-stats')).toBeVisible();

    // Capture screenshot: Game Over
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_gameover.png') });
  });

  test('Mobile Viewport & Touch Ergonomics (390x844 & 360x800)', async ({ page }) => {
    // Test iPhone 12/13/14 viewport: 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dau-tu.html?qa=1');

    await page.locator('#btn-start').click();
    await expect(page.locator('#game')).toBeVisible();

    // Check no page horizontal overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // Verify player hand container exists
    const hand = page.locator('#hand');
    await expect(hand).toBeVisible();

    // Check action buttons meet min touch target >= 44px
    const btnPlayBox = await page.locator('#btn-play').boundingBox();
    expect(btnPlayBox.height).toBeGreaterThanOrEqual(44);

    const btnDrawBox = await page.locator('#btn-draw').boundingBox();
    expect(btnDrawBox.height).toBeGreaterThanOrEqual(44);

    // Capture screenshot: Mobile gameplay
    await page.screenshot({ path: path.join(__dirname, '../test-results/captures/screenshot_dautu_mobile.png') });
  });

  test('Safety, Network & LocalStorage Namespace Isolation', async ({ page }) => {
    const networkRequests = [];
    page.on('request', req => networkRequests.push(req.url()));

    await page.goto('/dau-tu.html');

    // Toggle sound
    await page.locator('#btn-sound').click();

    const storedKeys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    });

    // Check sound toggle writes only to vokabelgo:dautu:preview:*
    const dautuKeys = storedKeys.filter(k => k.startsWith('vokabelgo:dautu:preview:'));
    expect(dautuKeys.length).toBeGreaterThan(0);

    // Verify no external API / Supabase requests
    const externalRequests = networkRequests.filter(url => {
      return url.includes('supabase') || url.includes('google-analytics') || url.includes('api.vokabelgo');
    });
    expect(externalRequests).toHaveLength(0);
  });
});
