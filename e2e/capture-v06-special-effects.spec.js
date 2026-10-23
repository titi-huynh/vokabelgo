const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('Capture all 12 v0.6 Special Card Effects & Game Feel screenshots', async ({ browser }) => {
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
    } catch (e) {}
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

  // Helper inside browser to setup deterministic state
  await page.evaluate(() => {
    window.balanceDeck = function(s) {
      let cards = (s.playerHand || []).concat(
        s.hands?.bot_left || [],
        s.hands?.bot_top || [],
        s.hands?.bot_right || []
      );
      let padId = 1;
      while ((cards.length + s.drawPile.length + s.discardPile.length) < 60) {
        s.drawPile.push({ id: 'pad_' + Date.now() + '_' + (padId++), type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' });
      }
      while ((cards.length + s.drawPile.length + s.discardPile.length) > 60 && s.drawPile.length > 0) {
        s.drawPile.pop();
      }
    };
  });

  // --------------------------------------------------------------------------
  // FX01: Aussetzen Cut Beam & Skipped Target Seat
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.triggerAussetzenVisual('bot_left');
  });
  await page.waitForTimeout(180);
  await saveShot(page, 'FX01_Aussetzen.png');
  await page.waitForTimeout(600); // let effect finish

  // --------------------------------------------------------------------------
  // FX02: Zieh Zwei (+2) First Card Back Flying
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.triggerPlus2Visual('bot_top', 2);
  });
  await page.waitForTimeout(160);
  await saveShot(page, 'FX02_Plus2_FirstCard.png');

  // --------------------------------------------------------------------------
  // FX03: Zieh Zwei (+2) Second Card Back Flying & +2 Target Badge
  // --------------------------------------------------------------------------
  await page.waitForTimeout(180);
  await saveShot(page, 'FX03_Plus2_SecondCard.png');
  await page.waitForTimeout(600); // let effect finish

  // --------------------------------------------------------------------------
  // FX04: Farbenwahl Selector Open (4 Swatches: Herz, Kreis, Dreieck, Raute)
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.showFarbenwahlSelector();
  });
  await page.waitForTimeout(100);
  await saveShot(page, 'FX04_FarbenwahlSelector.png');

  // --------------------------------------------------------------------------
  // FX05: Farbenwahl Swatch Selected & Pulsed (Others Dimmed)
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.triggerFarbenwahlVisual('blau');
  });
  await page.waitForTimeout(150);
  await saveShot(page, 'FX05_FarbenwahlSelected.png');
  await page.waitForTimeout(500); // let effect finish

  // --------------------------------------------------------------------------
  // FX06: GEGENTEIL Before Antonym Swap
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.currentCard = { id: 'c_schwer', type: 'word', color: 'rot', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' };
    s.activeColor = 'rot';
    s.activePlayer = 'player';
    s.turnState = 'waiting_human';
    window.DAUTU_PREVIEW_QA.load(s);
  });
  await page.waitForTimeout(200);
  await saveShot(page, 'FX06_GegenteilBefore.png');

  // --------------------------------------------------------------------------
  // FX07: GEGENTEIL In-Table Transition "SCHWER ⇄ LEICHT"
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    const beforeEntry = { lemma: 'schwer', translations: { vi: 'nặng; khó' } };
    const afterEntry = { lemma: 'leicht', translations: { vi: 'nhẹ; dễ' } };
    const beforeSent = 'Die deutsche Grammatik ist schwer.';
    const afterSent = 'Die deutsche Grammatik ist leicht.';
    window.DAUTU_PREVIEW_QA.triggerGegenteilVisual(beforeEntry, afterEntry, beforeSent, afterSent, 'Bạn');
  });
  await page.waitForTimeout(250);
  await saveShot(page, 'FX07_GegenteilTransition.png');

  // --------------------------------------------------------------------------
  // FX08: GEGENTEIL After Swap (New Card Leicht, Preserved Red Color, Crossfaded Sentence)
  // --------------------------------------------------------------------------
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.currentCard = { id: 'c_leicht', type: 'word', color: 'rot', entryId: 'leicht', label: 'leicht', partOfSpeech: 'adj' };
    s.activeColor = 'rot';
    window.DAUTU_PREVIEW_QA.load(s);
  });
  await page.waitForTimeout(200);
  await saveShot(page, 'FX08_GegenteilAfter.png');

  // --------------------------------------------------------------------------
  // FX09: WORT-KETTE Center Banner "SCHWER ↔ SCHWIERIG"
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.triggerWortKetteVisual('schwer', 'schwierig', 'Bạn', true);
  });
  await page.waitForTimeout(300);
  await saveShot(page, 'FX09_WortKette.png');
  await page.waitForTimeout(900); // let banner fade

  // --------------------------------------------------------------------------
  // FX10: WORT-KETTE Bonus Play Ready (Hand Pulse & Dock Prompt)
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    const s = window.DAUTU_PREVIEW_QA.getState();
    s.activePlayer = 'player';
    s.isWortKetteBonus = true;
    s.wortKetteOriginWord = 'schwer';
    s.wortKetteTriggerWord = 'schwierig';
    window.DAUTU_PREVIEW_QA.load(s);
  });
  await page.waitForTimeout(200);
  await saveShot(page, 'FX10_WortKetteBonusReady.png');

  // --------------------------------------------------------------------------
  // FX11: Win Celebration (Human Win Glow & Subtle Floating Particles)
  // --------------------------------------------------------------------------
  await page.evaluate(() => {
    window.DAUTU_PREVIEW_QA.triggerWinVisual('player');
  });
  await page.waitForTimeout(350);
  await saveShot(page, 'FX11_WinState.png');
  await page.waitForTimeout(500);

  await desktopContext.close();

  // --------------------------------------------------------------------------
  // MOBILE CONTEXT (390x844 - iPhone 12/13/14 Pro)
  // --------------------------------------------------------------------------
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://127.0.0.1:3000/dau-tu.html?qa=1');
  await mobilePage.evaluate(() => {
    window.DAUTU_PREVIEW_QA.start('adjektive', 42);
    const intro = document.getElementById('intro-overlay');
    if (intro) intro.hidden = true;
    window.DAUTU_PREVIEW_QA.showFarbenwahlSelector();
  });
  await mobilePage.waitForTimeout(300);

  // FX12: Mobile Viewport 390x844 with 2x2 Swatch Selector & Table
  await saveShot(mobilePage, 'FX12_MobileSpecial.png');

  await mobileContext.close();
});
