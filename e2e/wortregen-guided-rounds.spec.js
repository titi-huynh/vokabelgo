const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const { createDeterministicDailySessionFixture } = require('./helpers/session');

const PACK = [
  ['grüßen', 'chào hỏi'], ['das Haus', 'ngôi nhà'], ['lernen', 'học'],
  ['die Katze', 'con mèo'], ['schön', 'đẹp'], ['öffnen', 'mở'],
  ['die Straße', 'con đường'], ['das Buch', 'quyển sách'],
].map(([de, vi], index) => ({ id: `guided-${index}`, de, vi, tier: 1, duration: 21 }));

async function installPack(page, pack = PACK) {
  await page.evaluate(cards => {
    const provider = window.wortregenGame.vocabProvider;
    provider.buildQueue = () => { provider.sessionQueue = cards.map(card => ({ ...card })); return provider.sessionQueue; };
    provider.getNextCard = () => provider.sessionQueue.shift();
  }, pack);
}

async function openGame(page, mode = 'practice', pack = PACK) {
  await page.goto('/wortregen.html');
  await expect(page.locator(`button[data-wr-mode="${mode}"]`)).toBeVisible();
  if (mode !== 'practice') await page.locator(`button[data-wr-mode="${mode}"]`).click();
  await installPack(page, pack);
  await page.locator('#btn-start').click();
  await expect(page.locator('.card-target')).toBeVisible();
}

async function finishTarget(page) {
  await expect(page.locator('.card-target')).toBeVisible();
  const answer = await page.evaluate(() => {
    const word = window.wortregenGame.getTargetWord();
    return word.letters.slice(word.typedCount).map(letter => letter.char).join('');
  });
  await page.locator('#keyboard-capture').focus();
  await page.keyboard.type(answer);
}

async function dropTarget(page) {
  await page.evaluate(() => {
    const game = window.wortregenGame;
    game.getTargetWord().y = game.fallingArea.clientHeight;
  });
}

test('first round has one clear target, empty slots, forgiving mistakes and backspace', async ({ page }) => {
  await openGame(page);
  await expect(page.locator('#wr-hint')).toBeVisible();
  await expect(page.locator('.card-target .wr-word-cue')).toContainText('“g”');
  await expect(page.locator('.card-target .char-slot').first()).toHaveText('_');
  await expect(page.locator('.card-target .wr-target-label')).toHaveText('✎ Đang gõ');
  await page.keyboard.type('x');
  await expect(page.locator('#wr-feedback')).toContainText('không mất tim');
  expect(await page.evaluate(() => window.wortregenGame.getTargetWord().typedCount)).toBe(0);
  await page.keyboard.type('g');
  await page.keyboard.press('Backspace');
  await expect(page.locator('.card-target .char-slot').first()).toHaveText('_');
  await page.waitForTimeout(2500); // A second card used to spawn at 2.2 seconds.
  await expect(page.locator('.card-target')).toHaveCount(1);
  await expect(page.locator('.card-waiting')).toHaveCount(0);
  expect(await page.evaluate(() => window.wortregenGame.lives)).toBe(3);
});

test('eight-word round uses German keys, awards real combo bonuses and offers a focused retry', async ({ page }) => {
  await openGame(page);
  await page.keyboard.type('gr');
  await page.getByRole('button', { name: 'Nhập ü', exact: true }).click();
  await page.keyboard.type('ßen');
  await expect(page.locator('#hud-score-val')).toHaveText('60');
  await expect(page.locator('.card-target')).toBeVisible();
  await page.locator('#wr-hint').click();
  await finishTarget(page);
  await finishTarget(page);
  await expect(page.locator('#wr-feedback')).toContainText('thưởng x2');
  for (let i = 3; i < 8; i++) await finishTarget(page);
  await expect(page.locator('#game-over-screen')).toBeVisible();
  await expect(page.locator('#summary-solved')).toHaveText('8');
  await expect(page.locator('#wr-progress-count')).toHaveText('8/8');
  await expect(page.locator('#wr-summary-note')).toContainText('1 từ hoàn thành có gợi ý');
  const expectedScore = PACK.reduce((sum, card, i) => sum + card.de.replace(/\s/g, '').length * 10 * Math.min(3, 1 + Math.floor(i / 3)), 0);
  await expect(page.locator('#summary-score')).toHaveText(String(expectedScore));
  await expect(page.locator('#wr-review-list li')).toHaveCount(1);
  await page.locator('#wr-review-round').click();
  await expect(page.locator('.card-target .word-card-vi')).toHaveText('ngôi nhà');
  await expect(page.locator('#wr-progress-count')).toHaveText('0/1');
  await finishTarget(page);
  await expect(page.locator('#game-over-screen')).toBeVisible();
  await expect(page.locator('#summary-solved')).toHaveText('1');
});

test('practice timeout waits for the learner, supports retry and keeps the word for review', async ({ page }) => {
  await openGame(page);
  await dropTarget(page);
  await expect(page.locator('#wr-interlude')).toBeVisible();
  await expect(page.locator('#wr-review-de')).toHaveText('grüßen');
  expect(await page.evaluate(() => ({ state: window.wortregenGame.state, lives: window.wortregenGame.lives }))).toEqual({ state: 'REVIEW', lives: 3 });
  await page.waitForTimeout(1400);
  await expect(page.locator('#wr-interlude')).toBeVisible();
  await page.locator('#wr-retry-word').click();
  await expect(page.locator('.card-target .char-slot').first()).toHaveText('_');
  await dropTarget(page);
  await expect(page.locator('#wr-interlude')).toBeVisible();
  expect(await page.evaluate(() => window.wortregenGame.missedCount)).toBe(1);
  await page.locator('#wr-continue').click();
  await expect(page.locator('#wr-progress-count')).toHaveText('1/8');
  await expect(page.locator('.card-target .word-card-vi')).toHaveText('ngôi nhà');
});

test('challenge waiting card preserves its time; three missed targets still end the game', async ({ page }) => {
  await openGame(page, 'challenge');
  await expect(page.locator('.card-waiting')).toBeVisible();
  const before = await page.evaluate(() => window.wortregenGame.activeWords[1].y);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.wortregenGame.activeWords[1].y)).toBe(before);
  await finishTarget(page);
  await expect(page.locator('.card-target .word-card-vi')).toHaveText('ngôi nhà');
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.card-target')).toBeVisible();
    await dropTarget(page);
    await expect(page.locator('#hud-lives .lost')).toHaveCount(i + 1);
  }
  await expect(page.locator('#game-over-screen')).toBeVisible();
  await expect(page.locator('#summary-missed')).toHaveText('3');
});

test('pause freezes the card; exiting a review and re-entering starts a clean round', async ({ page }) => {
  await seedStorage(page, createDeterministicDailySessionFixture());
  await page.goto('/index.html');
  await page.locator('.nav-hub-btn[data-nav="study"]').click();
  await page.locator('[data-studymode="wortregen"]').click();
  await installPack(page);
  await page.locator('#btn-start').click();
  await expect(page.locator('.card-target')).toBeVisible();
  await page.keyboard.press('Escape');
  const y = await page.evaluate(() => window.wortregenGame.getTargetWord().y);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.wortregenGame.getTargetWord().y)).toBe(y);
  await page.locator('#wr-continue').click();
  await dropTarget(page);
  await expect(page.locator('#wr-interlude')).toBeVisible();
  await page.locator('#btn-back-to-study').click();
  expect(await page.evaluate(() => window.wortregenGame.pendingTimers.size)).toBe(0);
  await page.locator('[data-studymode="wortregen"]').click();
  await page.locator('#btn-start').click();
  await expect(page.locator('.card-target')).toHaveCount(1);
  await expect(page.locator('#wr-interlude')).toBeHidden();
  await expect(page.locator('#wr-progress-count')).toHaveText('0/8');
});

test('mobile controls fit a narrow and shortened viewport, including long words', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await openGame(page, 'practice', [{ ...PACK[0], de: 'die Straßenbahnhaltestelle', vi: 'bến tàu điện' }]);
  await expect(page.locator('#keyboard-capture')).toBeVisible();
  for (const height of [700, 420, 350]) {
    await page.setViewportSize({ width: 390, height });
    await expect(page.locator('#wr-pause')).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Nhập ß', exact: true })).toBeInViewport();
    expect(await page.locator('.wortregen-app').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const size = await page.locator('#falling-area').boundingBox();
    expect(size.height).toBeGreaterThan(90);
    const card = await page.locator('.card-target').boundingBox();
    expect(card.width).toBeLessThanOrEqual(size.width);
    expect(card.y + card.height).toBeLessThanOrEqual(size.y + size.height);
    expect(await page.locator('.card-target').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const remainingFall = await page.evaluate(() => {
      const game = window.wortregenGame;
      const word = game.getTargetWord();
      if (!word) throw new Error(JSON.stringify({ viewport: innerHeight, area: game.fallingArea.clientHeight, words: game.activeWords.map(w => ({ y: w.y, height: w.height, actualHeight: w.el.offsetHeight, travel: w.travelDistance, duration: w.duration, speed: w.speed, grounded: w.isGrounded })) }));
      return (game.fallingArea.clientHeight - word.height - 4 - word.y) / word.speed;
    });
    expect(remainingFall).toBeGreaterThan(25);
  }
  await page.screenshot({ path: testInfo.outputPath('mobile-short-viewport.png') });
});

test('pausing immediately after the last answer cannot strand a completed round', async ({ page }) => {
  await openGame(page, 'practice', [PACK[0]]);
  await finishTarget(page);
  await page.keyboard.press('Escape');
  await page.locator('#wr-continue').click();
  await expect(page.locator('#game-over-screen')).toBeVisible();
  await expect(page.locator('#summary-solved')).toHaveText('1');
});

test('topic selection feeds the real provider and keeps the round inside that topic', async ({ page }) => {
  await page.goto('/wortregen.html');
  const topic = await page.locator('#wr-deck option').nth(2).getAttribute('value');
  await page.locator('#wr-deck').selectOption(topic);
  await page.locator('#btn-start').click();
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.card-target')).toBeVisible();
    expect(await page.evaluate(() => window.wortregenGame.getTargetWord().source.deck)).toBe(topic);
    await finishTarget(page);
  }
});

test('a finished round can return to mode selection without leaving Wortregen', async ({ page }) => {
  await openGame(page, 'practice', [PACK[0]]);
  await finishTarget(page);
  await expect(page.locator('#game-over-screen')).toBeVisible();
  await page.locator('#wr-choose-mode').click();
  await expect(page.locator('#start-screen')).toBeVisible();
  await page.locator('button[data-wr-mode="challenge"]').click();
  await page.locator('#btn-start').click();
  await expect(page.locator('#wr-hint')).toBeHidden();
  await expect(page.locator('#hud-lives .hud-heart')).toHaveCount(3);
});

test('an unavailable topic leaves mode selection usable and can recover on retry', async ({ page }) => {
  await page.goto('/wortregen.html');
  await page.evaluate(() => {
    window.wortregenGame.vocabProvider.buildQueue = () => { throw new Error('No eligible vocabulary cards'); };
  });
  await page.locator('#btn-start').click();
  await expect(page.locator('#start-screen')).toContainText('Hãy chọn bộ khác');
  await page.locator('button[data-wr-mode="challenge"]').click();
  await expect(page.locator('button[data-wr-mode="challenge"]')).toHaveAttribute('aria-pressed', 'true');
  await installPack(page);
  await page.locator('#btn-start').click();
  await expect(page.locator('.card-target')).toBeVisible();
  await expect(page.locator('#vocab-error-banner')).toHaveCount(0);
});
