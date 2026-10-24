const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');

// Game câu cá giai đoạn 1: ván thắng đi qua đường reveal/lưu kho hiện có
// với via:'game'; đường thoát nhanh quay về luồng video cũ nguyên vẹn.
test.describe('E2E Fishing Game (giai đoạn 1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__e2eSpokenTexts = [];
      if (window.speechSynthesis) {
        window.speechSynthesis.speak = function (u) {
          const txt = typeof u === 'string' ? u : (u && u.text ? u.text : String(u));
          window.__e2eSpokenTexts.push(txt);
          if (u && typeof u.onend === 'function') setTimeout(u.onend, 10);
        };
      }
    });
    await seedStorage(page, { vokabelgo_fish_collection_v1: [] });
  });

  async function openGame(page) {
    await page.goto('/');
    await page.evaluate(() => {
      window.VokabelDaily.setCatchStatus('pending');
      window.VokabelFishingGame.__test.setFastMode(true);
      window.openRewardPrototypeModal();
    });
    const startBtn = page.locator('#fishingGameStartBtn');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await expect(page.locator('#fishingGameLayer')).toBeVisible();
    await expect(page.locator('#rewardCatVideo')).toHaveJSProperty('paused', true);
  }

  test('ván thắng: ném -> cắn -> giật -> kéo nhịp nhàng -> cá vào kho với via game', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await openGame(page);

    // Pha ném cần: bấm Thả câu, bấm chốt vùng
    const action = page.locator('#fgAction');
    await action.click(); // bắt đầu quét thanh lực
    await expect(page.locator('#fgGauge')).toBeVisible();
    await action.click(); // chốt vùng rơi
    await expect(page.locator('#fgBobber')).toBeVisible();

    // Chờ cá cắn (fast mode ~0,6s) rồi giật trong cửa sổ
    await expect.poll(async () => (await action.textContent()) || '', { timeout: 8000 })
      .toContain('GIẬT');
    await action.click(); // móc dính -> pha kéo

    // Pha kéo: giữ-nhả nhịp nhàng bằng phím Space tới khi lên cá
    const meters = page.locator('#fgMeters');
    await expect(meters).toBeVisible();
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      const layerHidden = await page.locator('#rewardCatchRevealLayer').evaluate((el) => el.classList.contains('hidden')).catch(() => true);
      if (!layerHidden) break;
      await page.keyboard.down('Space');
      await page.waitForTimeout(220);
      await page.keyboard.up('Space');
      await page.waitForTimeout(220);
    }

    // Reveal của hệ thống cũ xuất hiện, cá lưu đúng 1 con với via:'game'
    await expect(page.locator('#rewardCatchRevealLayer')).toBeVisible();
    await expect(page.locator('#fishingGameMeta')).toContainText('Câu bằng game');
    const collection = await getStorageJson(page, 'vokabelgo_fish_collection_v1');
    expect(collection).toHaveLength(1);
    expect(collection[0].via).toBe('game');
    const status = await page.evaluate(() => window.VokabelDaily.getCatchStatus());
    expect(status).toBe('claimed');
    expect(pageErrors).toEqual([]);
  });

  test('đường thoát nhanh: Nhận cá ngay như cũ -> video chạy tiếp, cá lưu không có via game', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await openGame(page);

    await page.locator('#fgSkip').click();
    await expect(page.locator('#fishingGameLayer')).toBeHidden();
    await expect(page.locator('#rewardCatVideo')).toHaveJSProperty('paused', false);

    // Luồng cổ điển tự reveal sau timeline video (~4s) và lưu cá như trước
    await expect(page.locator('#rewardCatchRevealLayer')).toBeVisible({ timeout: 20000 });
    const collection = await getStorageJson(page, 'vokabelgo_fish_collection_v1');
    expect(collection).toHaveLength(1);
    expect(collection[0].via).toBeUndefined();
    expect(pageErrors).toEqual([]);
  });
});
