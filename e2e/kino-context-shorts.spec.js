const { test, expect } = require('@playwright/test');
const fs = require('fs');
const vm = require('vm');
const ctx = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync('kino-short-scenes.js', 'utf8'), ctx);
const scenes = JSON.parse(JSON.stringify(ctx.window.KinoShortScenes));

async function catalog(page) {
  await page.goto('/?hub=kino');
  await expect(page.locator('.kino-short-feed-btn')).toBeVisible();
}
async function opened(page, scene) {
  // Open through the actual public feed API, with a selected editorial scene.
  await page.evaluate(id => KinoShortsFeed.open(KinoShortScenes.find(s => s.id === id)), scene.id);
  await expect(page.locator('#ksfOverlay')).toBeVisible();
  await expect(page.locator('#ksfCounter')).toHaveText('1 / 12');
  await page.waitForFunction(() => {
    const v = document.querySelector('.ksf-item[data-idx="0"] video');
    return v && !v.paused && v.readyState >= 2;
  }, null, { timeout: 25000 });
  return page.locator('.ksf-item[data-idx="0"]');
}
async function seek(it, elapsed) {
  await it.locator('.ksf-seek').evaluate((input, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, elapsed);
}

test('catalog keeps all film dialogue and videos lazy before opening Shorts', async ({ page }) => {
  const requested = [];
  page.on('request', r => requested.push(new URL(r.url()).pathname));
  await catalog(page);
  expect(scenes).toHaveLength(12);
  expect(new Set(scenes.map(s => s.videoKey)).size).toBe(11);
  expect(requested.filter(p => /-aligned\.js$/.test(p) || p.startsWith('/video/'))).toEqual([]);
  await expect(page.locator('.kino-short-feed-btn')).toContainText('12');
});

test('all 12 scenes have real playback, complete cue bounds and changing bilingual captions', async ({ page }) => {
  test.setTimeout(180000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await catalog(page);
  for (const scene of scenes) {
    const it = await opened(page, scene);
    await expect(it.locator('.ksf-hook')).toHaveText(scene.hook);
    const first = await page.evaluate(() => {
      const item = document.querySelector('.ksf-item[data-idx="0"]'), v = item.querySelector('video');
      return { time: v.currentTime, start: Number(item.dataset.start), end: Number(item.dataset.end), playing: [...document.querySelectorAll('#ksfOverlay video')].filter(v => !v.paused).length };
    });
    expect(first.start).toBe(scene.start);
    expect(first.end).toBe(scene.end);
    expect(first.time).toBeGreaterThanOrEqual(scene.start - .15);
    expect(first.time).toBeLessThan(scene.end);
    expect(first.playing).toBe(1);
    expect(scene.end - scene.start).toBeGreaterThanOrEqual(15);
    expect(scene.end - scene.start).toBeLessThanOrEqual(45);
    await it.locator('.ksf-play').click();
    const cue = await page.evaluate(s => KinoData.captions(s.videoKey).find(c => c.id === s.cueId) || KinoData.cues(s.videoKey).find(c => c.id === s.cueId), scene);
    // Seek through the user-facing range to the focus line.
    await seek(it, cue.start - scene.start + .15);
    await expect(it.locator('.ksf-de')).toHaveText(cue.text);
    await expect(it.locator('.ksf-vi')).toHaveText(cue.vi);
    if (scene.id === scenes[0].id) await page.screenshot({ path: 'review-assets/kino-context-shorts-desktop.png' });
    const other = await page.evaluate(s => KinoData.captions(s.videoKey).find(c => c.id !== s.cueId && c.start >= s.start && c.end <= s.end && c.end - c.start > .6), scene);
    expect(other).toBeTruthy();
    await seek(it, other.start - scene.start + .2);
    await expect(it.locator('.ksf-de')).toHaveText(other.text);
    await expect(it.locator('.ksf-vi')).toHaveText(other.vi);
    // End guard: replay loops to this scene, never to the movie opening.
    await seek(it, scene.end - scene.start - .1);
    await it.locator('.ksf-play').click();
    await expect.poll(() => it.locator('video').evaluate(v => v.currentTime)).toBeLessThan(scene.start + 3);
    await page.locator('#ksfClose').click();
    expect(await page.locator('#ksfOverlay video').evaluateAll(vs => vs.every(v => v.paused && !v.hasAttribute('src')))).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('fast swipe and close while subtitles load cannot start a hidden player', async ({ page }) => {
  await page.route('**/peppa-supermarkt-aligned.js', async route => {
    await new Promise(resolve => setTimeout(resolve, 600));
    await route.continue();
  });
  await catalog(page);
  await page.evaluate(() => KinoShortsFeed.open(KinoShortScenes[0]));
  await page.locator('#ksfClose').click();
  // Reopen a different film while the first lazy request is still pending.
  const second = await opened(page, scenes[1]);
  await expect(second.locator('.ksf-hook')).toHaveText(scenes[1].hook);
  await expect.poll(() => page.locator('#ksfOverlay video').evaluateAll(vs => vs.filter(v => !v.paused).length)).toBe(1);
  await page.locator('#ksfClose').click();
  await expect.poll(() => page.locator('#ksfOverlay video').evaluateAll(vs => vs.every(v => v.paused && !v.hasAttribute('src')))).toBe(true);
});

test('hiding the tab while preparing a scene cancels pending playback', async ({ page }) => {
  let allowLoad;
  const pending = new Promise(resolve => { allowLoad = resolve; });
  await page.route('**/peppa-supermarkt-aligned.js', async route => { await pending; await route.continue(); });
  await catalog(page);
  await page.evaluate(() => KinoShortsFeed.open(KinoShortScenes[0]));
  await expect(page.locator('#ksfCounter')).toHaveText('1 / 12');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  allowLoad();
  await expect(page.locator('.ksf-item[data-idx="0"] .ksf-retry')).toBeVisible();
  expect(await page.locator('#ksfOverlay video').evaluateAll(vs => vs.every(v => v.paused && !v.hasAttribute('src')))).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.locator('.ksf-item[data-idx="0"] .ksf-retry').click();
  await expect.poll(() => page.locator('.ksf-item[data-idx="0"] video').evaluate(v => !v.paused)).toBe(true);
});

test('entering a lesson opens the exact focus cue, even outside the seven suggestions', async ({ page }) => {
  await catalog(page);
  const scene = scenes.find(s => s.id === 'spy-anya-crossword');
  const it = await opened(page, scene);
  await it.locator('.ksf-lesson').click();
  await expect(page).toHaveURL(/kino=spy&part=2/);
  await expect(page.locator('#kinoListenDe')).toHaveText(scene.focusText, { timeout: 20000 });
  await expect(page.locator('#kinoDiscovery')).toBeHidden();
  const selected = await page.evaluate(() => PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex]);
  expect(selected.id).toBe(scene.cueId);
});

test('mobile layout, word lookup, likes and saved focus keep the full context', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await catalog(page);
  const scene = scenes.find(s => s.videoKey === 'sakura_s01e01');
  const it = await opened(page, scene);
  await it.locator('.ksf-play').click();
  const cue = await page.evaluate(s => KinoData.captions(s.videoKey).find(c => c.id === s.cueId), scene);
  await seek(it, cue.start - scene.start + .2);
  await expect(it.locator('.ksf-de')).toHaveText(cue.text);
  const bounds = await it.evaluate(el => {
    const sub = el.querySelector('.ksf-caption').getBoundingClientRect(), acts = el.querySelector('.ksf-rail').getBoundingClientRect();
    return { subBottom: sub.bottom, actsTop: acts.top, actsBottom: acts.bottom, width: document.documentElement.scrollWidth, viewport: innerWidth, height: innerHeight };
  });
  expect(bounds.subBottom).toBeLessThanOrEqual(bounds.actsTop);
  expect(bounds.actsBottom).toBeLessThanOrEqual(bounds.height);
  expect(bounds.width).toBeLessThanOrEqual(bounds.viewport);
  await it.locator('.ksf-word').first().click();
  await expect(page.locator('#ksfGloss')).toBeVisible();
  await page.locator('#ksfGlossClose').click();
  await it.locator('.ksf-like').click();
  await expect(it.locator('.ksf-like')).toHaveAttribute('aria-pressed', 'true');
  await it.locator('.ksf-save').click();
  const saved = await page.evaluate(term => userCards.find(c => c.term === term), scene.term);
  expect(saved.example).toBe(scene.focusText);
  expect(saved.exampleVi).toBeTruthy();
  await page.screenshot({ path: 'review-assets/kino-context-shorts-mobile.png' });
});
