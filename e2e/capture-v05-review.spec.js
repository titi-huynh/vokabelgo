const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('Capture all 18 v0.5 review screenshots for UI QA and Wort-Kette', async ({ browser }) => {
  test.setTimeout(90000);
  const artifactDir = path.join(__dirname, '../test-results/captures');
  const outputDir = path.join(__dirname, '../test-results/captures/review-assets');
  fs.mkdirSync(outputDir, { recursive: true });

  const saveShot = async (page, filename) => {
    const mainPath = path.join(outputDir, filename);
    await page.screenshot({ path: mainPath });
    try {
      const artPath = path.join(artifactDir, filename);
      fs.copyFileSync(mainPath, artPath);
    } catch(e) {}
  };

  // --------------------------------------------------------------------------
  // DESKTOP CONTEXT (1280x720)
  // --------------------------------------------------------------------------
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });
  const page = await desktopContext.newPage();

  await page.goto('http://127.0.0.1:3000/dau-tu.html?qa=1');
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.start('adjektive', 42);
    const intro = document.getElementById('intro-overlay');
    if (intro) intro.hidden = true;
  });
  await page.waitForTimeout(400);

  // 1. UI01_BotCardsLarger: Desktop 1280x720, bot cards 56x80px prominently visible
  await saveShot(page, 'UI01_BotCardsLarger.png');

  // Helper inside browser context
  const injectHelper = async () => {
    await page.evaluate(() => {
      window.balanceDeck = function(s) {
        let cards = [];
        if (s.playerCount === 4 && s.hands) {
          cards = (s.playerHand || []).concat(s.hands.bot_left || [], s.hands.bot_top || [], s.hands.bot_right || []);
        } else {
          cards = (s.playerHand || []).concat(s.botHand || []);
        }
        let padId = 1;
        while ((cards.length + s.drawPile.length + s.discardPile.length) < 60) {
          s.drawPile.push({ id: 'pad_' + Date.now() + '_' + (padId++), type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' });
        }
        while ((cards.length + s.drawPile.length + s.discardPile.length) > 60 && s.drawPile.length > 0) {
          s.drawPile.pop();
        }
      };
    });
  };
  await injectHelper();

  // 2. UI02_HumanHand5_Selected: 5 cards, middle card selected (raised, no crop)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    s.playerHand = [
      { id: 'c1', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' },
      { id: 'c2', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'c3', type: 'word', color: 'gruen', entryId: 'ruhig', label: 'ruhig', partOfSpeech: 'adj' },
      { id: 'c4', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' },
      { id: 'c5', type: 'action', color: 'neutral', actionType: 'farbenwahl', label: 'Farbenwahl' }
    ];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.fixtureChosen('c3');
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'UI02_HumanHand5_Selected.png');

  // 3. UI03_HumanHand12: 12 cards on hand, clean spread, no clipping
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    const words = ['schwer', 'schwierig', 'ruhig', 'teuer', 'billig', 'leise', 'laut', 'leicht', 'einfach', 'günstig', 'kostspielig', 'lärmend'];
    const colors = ['rot', 'blau', 'gruen', 'gelb'];
    s.playerHand = words.map((w, i) => ({
      id: 'c_h12_' + i,
      type: 'word',
      color: colors[i % 4],
      entryId: w,
      label: w,
      partOfSpeech: 'adj'
    }));
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.fixtureChosen(null);
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'UI03_HumanHand12.png');

  // 4. UI04_LeftMostSelected: Left-most card selected (no top or left crop)
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.fixtureChosen('c_h12_0');
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'UI04_LeftMostSelected.png');

  // 5. UI05_RightMostSelected: Right-most card selected (no top or right crop)
  await page.evaluate(() => {
    const el = document.getElementById('hand');
    if (el) el.scrollLeft = 9999;
    window.DAUTU_PREVIEW_QA.fixtureChosen('c_h12_11');
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'UI05_RightMostSelected.png');

  // 6. UI06_OneCardHand: 1 card left, Noch eine badge visible, solidly anchored
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.playerHand = [{ id: 'c_one', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' }];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.fixtureChosen(null);
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'UI06_OneCardHand.png');

  // 7. WK01_NormalTurn: Normal turn before Wort-Kette
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    s.wortKetteActive = false;
    s.hasDrawnThisTurn = false;
    s.activeColor = 'rot';
    s.activeEntryId = 'schwer';
    s.activeContextId = 'ctx_adj_difficulty_hard';
    s.physicalTopCard = { id: 'top_schwer', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    s.playerHand = [
      { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'c_ruhig_gruen', type: 'word', color: 'gruen', entryId: 'ruhig', label: 'ruhig', partOfSpeech: 'adj' },
      { id: 'c_teuer_gelb', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' },
      { id: 'c_plus2', type: 'action', color: 'blau', actionType: 'plus2', label: '+2' },
      { id: 'c_extra_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
    ];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.fixtureChosen(null);
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'WK01_NormalTurn.png');

  // 8. WK02_CrossColorSynonymBefore: Target is SCHWER RED. Human has SCHWIERIG BLUE selected
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.fixtureChosen('c_schwierig_blau');
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'WK02_CrossColorSynonymBefore.png');

  // 9. WK03_WortKetteTriggered: Play SCHWIERIG BLUE on SCHWER RED => Wort-Kette banner active
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.playCard('c_schwierig_blau');
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK03_WortKetteTriggered.png');

  // 10. WK04_WortKetteBonusChoice: Dock in Wort-Kette mode, Draw hidden, [Kết thúc lượt] visible
  await page.evaluate(() => {
    const banner = document.getElementById('wort-kette-banner');
    if (banner) banner.hidden = true;
    window.DAUTU_PREVIEW_QA.render();
  });
  await page.waitForTimeout(250);
  await saveShot(page, 'WK04_WortKetteBonusChoice.png');

  // 11. WK05_WortKettePlus2: Playing +2 as bonus card, next player draws 2 and loses turn
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.playCard('c_plus2');
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK05_WortKettePlus2.png');

  // 12. WK06_BotWortKette: Bot triggers Wort-Kette
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    window.DAUTU_PREVIEW_QA.pause();
    s.activePlayer = 'bot_top';
    s.wortKetteActive = false;
    s.activeColor = 'rot';
    s.activeEntryId = 'schwer';
    s.activeContextId = 'ctx_adj_difficulty_hard';
    s.physicalTopCard = { id: 'top_schwer_rot_bot', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    s.hands.bot_top = [
      { id: 'b_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'b_ruhig_gruen', type: 'word', color: 'gruen', entryId: 'ruhig', label: 'ruhig', partOfSpeech: 'adj' },
      { id: 'b_extra', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
    ];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.render();
    window.DAUTU_PREVIEW_QA.runBot();
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK06_BotWortKette.png');

  // 13. WK07_SameColorSynonym_NoBonus: Target SCHWER RED -> SCHWIERIG RED (No bonus)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    window.DAUTU_PREVIEW_QA.pause();
    s.activePlayer = 'player';
    s.wortKetteActive = false;
    s.activeColor = 'rot';
    s.activeEntryId = 'schwer';
    s.activeContextId = 'ctx_adj_difficulty_hard';
    s.physicalTopCard = { id: 'top_schwer_rot2', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    s.playerHand = [
      { id: 'c_schwierig_rot', type: 'word', color: 'rot', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'c_dummy2', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
    ];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.render();
    window.DAUTU_PREVIEW_QA.playCard('c_schwierig_rot');
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK07_SameColorSynonym_NoBonus.png');

  // 14. WK08_AnswerHint_NoBonus: Hint Step 2 used -> SCHWIERIG BLUE (No bonus)
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    window.DAUTU_PREVIEW_QA.pause();
    s.activePlayer = 'player';
    s.wortKetteActive = false;
    s.currentTurnUsedCardHint = true; // Answer hint used
    s.activeColor = 'rot';
    s.activeEntryId = 'schwer';
    s.activeContextId = 'ctx_adj_difficulty_hard';
    s.physicalTopCard = { id: 'top_schwer_rot3', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    s.playerHand = [
      { id: 'c_schwierig_blau_hint', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'c_dummy3', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
    ];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.render();
    window.DAUTU_PREVIEW_QA.playCard('c_schwierig_blau_hint');
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK08_AnswerHint_NoBonus.png');

  // 15. WK09_WortKette_NochEine: 2 cards left, first triggers Wort-Kette, 1 left with Noch eine
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    window.DAUTU_PREVIEW_QA.pause();
    s.activePlayer = 'player';
    s.wortKetteActive = false;
    s.currentTurnUsedCardHint = false;
    s.activeColor = 'rot';
    s.activeEntryId = 'schwer';
    s.activeContextId = 'ctx_adj_difficulty_hard';
    s.physicalTopCard = { id: 'top_schwer_rot4', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    s.playerHand = [
      { id: 'c_schwierig_blau_ne', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'c_last_win_card', type: 'word', color: 'blau', entryId: 'einfach', label: 'einfach', partOfSpeech: 'adj' }
    ];
    window.balanceDeck(s);
    window.DAUTU_PREVIEW_QA.render();
    window.DAUTU_PREVIEW_QA.playCard('c_schwierig_blau_ne');
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK09_WortKette_NochEine.png');

  // 16. WK10_WortKette_Win: Playing remaining bonus card to win the game
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.playCard('c_last_win_card');
  });
  await page.waitForTimeout(500);
  await saveShot(page, 'WK10_WortKette_Win.png');

  await desktopContext.close();

  // --------------------------------------------------------------------------
  // MOBILE CONTEXT (390x844 - iPhone 14 style)
  // --------------------------------------------------------------------------
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:3000/dau-tu.html?qa=1');

  await mobilePage.evaluate(() => {
    window.DAUTU_PREVIEW_QA.start('adjektive', 42);
    const intro = document.getElementById('intro-overlay');
    if (intro) intro.hidden = true;
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    s.playerHand = [
      { id: 'm_c1', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' },
      { id: 'm_c2', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
      { id: 'm_c3', type: 'word', color: 'gruen', entryId: 'ruhig', label: 'ruhig', partOfSpeech: 'adj' },
      { id: 'm_c4', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' },
      { id: 'm_c5', type: 'action', color: 'neutral', actionType: 'farbenwahl', label: 'Farbenwahl' }
    ];
    window.DAUTU_PREVIEW_QA.fixtureChosen('m_c2');
  });
  await mobilePage.waitForTimeout(300);

  // 17. UI07_MobileHandSelected: Mobile 390x844, hand card selected without crop
  await saveShot(mobilePage, 'UI07_MobileHandSelected.png');

  // 18. WK11_MobileWortKette: Mobile Wort-Kette triggered with banner & mode
  await mobilePage.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activeColor = 'rot';
    s.activeEntryId = 'schwer';
    s.activeContextId = 'ctx_adj_difficulty_hard';
    s.physicalTopCard = { id: 'top_schwer_mob', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    window.DAUTU_PREVIEW_QA.render();
    window.DAUTU_PREVIEW_QA.playCard('m_c2');
  });
  await mobilePage.waitForTimeout(500);
  await saveShot(mobilePage, 'WK11_MobileWortKette.png');

  await mobileContext.close();
});
