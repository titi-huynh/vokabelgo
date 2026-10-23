const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('Capture complete 14 screenshots for v0.4 review package', async ({ browser }) => {
  const videoDir = path.join(__dirname, '../test-results/captures/review-assets/video');
  fs.mkdirSync(videoDir, { recursive: true });

  const artifactDir = path.join(__dirname, '../test-results/captures');

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  const outputDir = path.join(__dirname, '../test-results/captures/review-assets');
  fs.mkdirSync(outputDir, { recursive: true });

  const saveShot = async (filename, aliases = []) => {
    const mainPath = path.join(outputDir, filename);
    await page.screenshot({ path: mainPath });
    try {
      const artPath = path.join(artifactDir, filename);
      fs.copyFileSync(mainPath, artPath);
    } catch(e) {}
    for (const a of aliases) {
      try {
        fs.copyFileSync(mainPath, path.join(outputDir, a));
        fs.copyFileSync(mainPath, path.join(artifactDir, a));
      } catch(e) {}
    }
  };

  // 1. 01_SelectDeck
  await page.goto('http://127.0.0.1:3000/dau-tu.html?qa=1');
  await expect(page.locator('.brand')).toContainText('VokabelGo');
  await page.waitForTimeout(300);
  await saveShot('01_SelectDeck.png', ['01_man_chon_bo.png']);

  // 2. 02_Desktop_Normal5Cards (Bàn 4 người Desktop 1280x720, 5 lá trên tay, không scroll)
  await page.locator('#deck-adjektive').click();
  await page.locator('#mode-practice').click();
  await page.locator('#btn-start').click();
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('#seat-bot-top')).toBeVisible();
  await expect(page.locator('#seat-bot-left')).toBeVisible();
  await expect(page.locator('#seat-bot-right')).toBeVisible();
  await page.evaluate(() => {
    const intro = document.getElementById('intro-overlay');
    if (intro) intro.hidden = true;
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await saveShot('02_Desktop_Normal5Cards.png', ['02_desktop_4player_table.png', '02_ban_tinh_tu_desktop.png']);

  // 3. 03_Desktop_PlayerActive (Lượt của bạn + nhấc 1 lá trên tay + dock hành động)
  const playerCards = page.locator('#hand [data-card-id]');
  await playerCards.first().click();
  await expect(playerCards.first()).toHaveClass(/selected/);
  await expect(page.locator('#btn-play')).toBeVisible();
  await page.waitForTimeout(300);
  await saveShot('03_Desktop_PlayerActive.png', ['03_human_selected_card.png', '03_trang_thai_chon_mot_la.png']);

  // 4. 04_Desktop_BotActive (Lượt của Bot Lena trên đầu bàn, viền sáng + status)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'bot_top';
    window.DAUTU_PREVIEW_QA.fixtureChosen(null);
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await saveShot('04_Desktop_BotActive.png', ['04_bot_turn.png']);

  // 5. 05_Player1Card_NochEine (Người chơi còn 1 lá, lá nằm chắc chắn ở cạnh dưới, badge Noch eine!)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    s.playerHand = [s.playerHand[0]];
    window.DAUTU_PREVIEW_QA.render();
  });
  await page.waitForTimeout(300);
  await saveShot('05_Player1Card_NochEine.png');

  // 6. 06_LongGermanWord (Test từ tiếng Đức dài không bị bẻ từ: schließen, schwierig, unterschiedlich, kennenlernen, zurückkommen)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    s.playerHand = [
      { id: 'w-schliessen', type: 'word', color: 'rot', label: 'schließen', partOfSpeech: 'Verb', entryId: 'schliessen' },
      { id: 'w-schwierig', type: 'word', color: 'blau', label: 'schwierig', partOfSpeech: 'Adjektiv', entryId: 'schwierig' },
      { id: 'w-unterschiedlich', type: 'word', color: 'gruen', label: 'unterschiedlich', partOfSpeech: 'Adjektiv', entryId: 'unterschiedlich' },
      { id: 'w-kennenlernen', type: 'word', color: 'gelb', label: 'kennenlernen', partOfSpeech: 'Verb', entryId: 'kennenlernen' },
      { id: 'w-zurueck', type: 'word', color: 'rot', label: 'zurückkommen', partOfSpeech: 'Verb', entryId: 'zurueckkommen' },
      { id: 'w-beeilen', type: 'word', color: 'blau', label: 'sich beeilen', partOfSpeech: 'Verb', entryId: 'beeilen' }
    ];
    s.activeEntryId = 'schliessen';
    s.physicalTopCard = { id: 'top-word', type: 'word', color: 'rot', label: 'schließen', partOfSpeech: 'Verb', entryId: 'schliessen' };
    window.DAUTU_PREVIEW_QA.render();
  });
  await page.waitForTimeout(300);
  await saveShot('06_LongGermanWord.png');

  // 7. 07_GegenteilBefore (Xem trước đảo nghĩa SCHWER ⇄ LEICHT)
  await page.evaluate(() => {
    const E = window.DAU_TU_ENGINE;
    const s = E.createInitialGameState('adjektive', 42, 'player', 4);
    const gg = s.drawPile.find(c => c.actionType === 'gegenteil');
    if (gg) s.playerHand[0] = gg;
    window.DAUTU_PREVIEW_QA.load(s);
  });
  await playerCards.first().click();
  await page.locator('#btn-play').click();
  const panel = page.locator('#panel');
  await expect(panel).toBeVisible();
  await expect(page.locator('.flip-preview')).toBeVisible();
  await page.waitForTimeout(300);
  await saveShot('07_GegenteilBefore.png', ['06_gegenteil_before.png', '05_trang_thai_gegenteil.png']);

  // 8. 08_GegenteilAfter (Lật nghĩa trên bàn, ngữ cảnh câu chuyển đổi)
  await page.locator('button[data-cmd="opposite-confirm"]').click();
  await expect(panel).not.toBeVisible();
  await page.waitForTimeout(400);
  await saveShot('08_GegenteilAfter.png', ['07_gegenteil_after.png']);

  // 9. 09_Farbenwahl (Bộ chọn màu inline 4 màu sắc & biểu tượng)
  await page.evaluate(() => {
    const E = window.DAU_TU_ENGINE;
    const s = E.createInitialGameState('adjektive', 42, 'player', 4);
    const fw = s.drawPile.find(c => c.actionType === 'farbenwahl');
    if (fw) s.playerHand[0] = fw;
    window.DAUTU_PREVIEW_QA.load(s);
  });
  await playerCards.first().click();
  await page.locator('#btn-play').click();
  await expect(page.locator('#inline-color-selector')).toBeVisible();
  await page.waitForTimeout(300);
  await saveShot('09_Farbenwahl.png', ['05_farbenwahl.png']);

  // 10. 10_Plus2 (Đánh lá +2, đối thủ nhận phạt và mất lượt)
  await page.evaluate(() => {
    const E = window.DAU_TU_ENGINE;
    const s = E.createInitialGameState('adjektive', 42, 'player', 4);
    const p2 = s.drawPile.find(c => c.actionType === 'plus2');
    if (p2) {
      p2.color = s.activeColor;
      s.playerHand[0] = p2;
    }
    window.DAUTU_PREVIEW_QA.load(s);
  });
  await playerCards.first().click();
  await page.locator('#btn-play').click();
  await page.waitForTimeout(400);
  await saveShot('10_Plus2.png', ['08_plus2_draw_animation.png']);

  // 11. 11_BotWins_EndState (Bot Lena thắng, Lena ghế viền sáng, modal kết thúc, dock ẩn)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.turnState = 'game_over';
    s.winner = 'bot_top';
    s.hands.bot_top = [];
    s.playerHand = [s.playerHand[0]];
    s.turnCount = 11;
    window.DAUTU_PREVIEW_QA.finish();
  });
  await expect(panel).toBeVisible();
  await page.waitForTimeout(300);
  await saveShot('11_BotWins_EndState.png', ['10_ket_thuc_van_game_over.png']);
  await page.locator('#panel-close').click();

  // 12. 12_PlayerWins_EndState (Người chơi thắng, vinh danh bạn thắng, modal kết quả)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.turnState = 'game_over';
    s.winner = 'player';
    s.playerHand = [];
    s.turnCount = 15;
    window.DAUTU_PREVIEW_QA.finish();
  });
  await expect(panel).toBeVisible();
  await page.waitForTimeout(300);
  await saveShot('12_PlayerWins_EndState.png', ['11_win_state.png']);
  await page.locator('#panel-close').click();

  // 13. 13_Mobile5Cards (Giao diện mobile 390x844 với 5 lá trên tay)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000/dau-tu.html?qa=1');
  await page.locator('#btn-start').click();
  await expect(page.locator('#game')).toBeVisible();
  await page.evaluate(() => {
    const intro = document.getElementById('intro-overlay');
    if (intro) intro.hidden = true;
  });
  await page.waitForTimeout(400);
  await saveShot('13_Mobile5Cards.png', ['09_mobile_table.png', '08_ban_dien_thoai_mobile.png']);

  // 14. 14_Mobile10Cards (Giao diện mobile với 10 lá bài xếp lớp, cuộn ngang)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    while (s.playerHand.length < 10 && s.drawPile.length > 0) {
      s.playerHand.push(s.drawPile.pop());
    }
    window.DAUTU_PREVIEW_QA.render();
  });
  await page.waitForTimeout(400);
  await saveShot('14_Mobile10Cards.png', ['10_mobile_10_cards_hand.png', '09_ban_mobile_cam_nhieu_la.png']);

  // Extra: Component Gallery với 10 lá mẫu & mặt sau
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:3000/dau-tu-cards.html');
  await expect(page.locator('#gallery h1')).toContainText('Bộ bài Đấu từ');
  await page.screenshot({ path: path.join(outputDir, '07_bang_mau_10_la_dai_dien.png'), fullPage: true });
  try {
    fs.copyFileSync(path.join(outputDir, '07_bang_mau_10_la_dai_dien.png'), path.join(artifactDir, '07_bang_mau_10_la_dai_dien.png'));
  } catch(e) {}

  await page.close();
  await context.close();
});
