const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const path = require('path');

test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } });
test.setTimeout(90000);

async function setup(page, deep = true) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  await page.addInitScript(() => {
    window.__micRequests = 0;
    const get = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (...args) => {
      window.__micRequests++;
      const stream = await get(...args);
      window.__lastMic = stream;
      return stream;
    };
    const RealOffline = window.OfflineAudioContext;
    window.__renders = [];
    window.OfflineAudioContext = class extends RealOffline {
      async startRendering() {
        const buffer = await super.startRendering();
        window.__renders.push(buffer);
        return buffer;
      }
    };
  });
  await page.goto(`/?kino=peppa&part=1${deep ? '&dub=peppa-market' : ''}`);
  if (deep) await ready(page);
}
async function ready(page) {
  await expect(page.locator('#kinoDubbingScene')).toBeVisible();
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'idle');
  await expect(page.locator('#kdsRecord')).toBeEnabled();
}
async function record(page, index, count) {
  await page.locator(`[data-cue="${index}"]`).click();
  await page.locator('#kdsRecord').click();
  await expect(page.locator('#kdsCountdown')).toBeVisible();
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'recording');
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-take-count', String(count), { timeout: 15000 });
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'idle');
  expect(await page.evaluate(() => window.__lastMic.getTracks().every(t => t.readyState === 'ended'))).toBeTruthy();
}

test('entry is optional, opens only for Peppa part 1, and closing cancels pending microphone access', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await setup(page, false);
  await expect(page.locator('#kinoDubbingInvite')).toBeHidden();
  await page.getByRole('tab', { name: 'Nói', exact: true }).click();
  await expect(page.locator('#kinoDubbingInvite')).toBeVisible();
  await page.locator('#kinoOpenDubbingScene').click();
  await ready(page);
  expect(await page.evaluate(() => window.__micRequests)).toBe(0);
  await expect(page.locator('.kds-cue')).toHaveCount(10);
  await page.evaluate(() => {
    const actual = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = args => new Promise(resolve => {
      window.__grantDelayedMic = async () => resolve(await actual(args));
    });
  });
  await page.locator('#kdsRecord').click();
  await expect.poll(() => page.evaluate(() => Boolean(window.__grantDelayedMic))).toBeTruthy();
  await page.locator('#kdsClose').click();
  await page.evaluate(() => window.__grantDelayedMic());
  await expect.poll(() => page.evaluate(() => window.__lastMic?.getTracks().every(t => t.readyState === 'ended'))).toBeTruthy();
  await expect(page.locator('#kinoDubbingScene')).not.toBeVisible();
  await expect(page.locator('#kinoOpenDubbingScene')).toBeFocused();
  await page.goto('/?kino=pizza&part=1');
  await page.getByRole('tab', { name: 'Nói', exact: true }).click();
  await expect(page.locator('#kinoDubbingInvite')).toBeHidden();
  expect(errors).toEqual([]);
});

test('records adjacent sentences, mixes the whole scene, persists after reload, and deletes only the selected take', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await setup(page);
  await record(page, 4, 1);
  await record(page, 5, 2);
  await expect(page.locator('#kdsProgress')).toHaveText('Đã thu 2 / 10 câu');
  await page.locator('#kdsCompare').click();
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'playing');
  await page.locator('#kdsPause').click();
  await page.locator('#kdsPreview').click();
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'playing');
  expect(await page.locator('#kdsVideo').evaluate(v => v.muted)).toBeTruthy();
  expect(await page.evaluate(() => window.__renders.at(-1).duration)).toBeCloseTo(31.6, 2);
  const difference = await page.evaluate(() => {
    const personal = window.__renders.at(-1).getChannelData(0);
    const original = window.__renders.at(-2).getChannelData(0);
    const sr = window.__renders.at(-1).sampleRate;
    const diff = (start, end) => {
      let n = 0;
      for (let i = Math.floor(start * sr); i < end * sr; i++) n += (personal[i] - original[i]) ** 2;
      return Math.sqrt(n / ((end - start) * sr));
    };
    return { firstTake: diff(19.8, 20.8), adjacentTake: diff(21.2, 22.4), untouched: diff(2, 5) };
  });
  expect(difference.firstTake).toBeGreaterThan(.001);
  expect(difference.adjacentTake).toBeGreaterThan(.001);
  expect(difference.untouched).toBeLessThan(.00001);
  await page.locator('#kdsSeek').evaluate(input => { input.value = '31.1'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'idle', { timeout: 8000 });
  expect(await page.locator('#kdsVideo').evaluate(v => v.paused && Math.abs(v.currentTime - 31.6) < .1)).toBeTruthy();
  await page.reload();
  await ready(page);
  await expect(page.locator('#kdsProgress')).toHaveText('Đã thu 2 / 10 câu');
  await page.locator('[data-cue="4"]').click();
  await page.locator('#kdsRecord').click();
  await expect(page.locator('#kdsCountdown')).toBeVisible();
  await page.locator('#kdsRecord').click();
  await expect(page.locator('#kdsProgress')).toHaveText('Đã thu 2 / 10 câu');
  expect(await page.evaluate(() => window.__lastMic.getTracks().every(t => t.readyState === 'ended'))).toBeTruthy();
  await page.locator('[data-delete="4"]').click();
  await expect(page.locator('#kdsProgress')).toHaveText('Đã thu 1 / 10 câu');
  await page.reload();
  await ready(page);
  await expect(page.locator('[data-cue="4"] small')).toContainText('Giọng gốc');
  await expect(page.locator('[data-cue="5"] small')).toContainText('Đã thu');
  expect(await page.evaluate(() => kinoCompletedSet.size)).toBe(0);
  await page.locator('#kinoDubbingScene').press('Escape');
  expect(await page.locator('#kdsVideo').evaluate(v => v.paused)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('permission denial and storage failure keep listening available without claiming a saved recording', async ({ page }) => {
  await page.addInitScript(() => {
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = (name, version) => {
      if (name === 'vokabelgo-kino-dubbing') throw new Error('storage unavailable');
      return open(name, version);
    };
  });
  await setup(page);
  await expect(page.locator('#kdsStorage')).toContainText('Chưa mở được nơi lưu');
  await record(page, 9, 1);
  await expect(page.locator('#kdsStorage')).toContainText('chưa lưu lâu dài');
  await expect(page.locator('#kdsPreview')).toBeEnabled();
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('denied', 'NotAllowedError'); }; });
  await page.locator('#kdsRecord').click();
  await expect(page.locator('#kdsStatus')).toContainText('Chưa được phép');
  await expect(page.locator('#kdsOriginal')).toBeEnabled();
  await expect(page.locator('#kdsProgress')).toHaveText('Đã thu 1 / 10 câu');
});

test('adjacent replacements contain the recorded signal and background without bringing the original voice back', async ({ page }) => {
  await setup(page);
  await page.evaluate(async () => {
    const wav = (duration, level) => {
      const frames = Math.ceil(duration * 44100), bytes = new ArrayBuffer(44 + frames * 4), d = new DataView(bytes);
      const text = (offset, value) => [...value].forEach((c, i) => d.setUint8(offset + i, c.charCodeAt(0)));
      text(0, 'RIFF'); d.setUint32(4, bytes.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
      d.setUint32(16, 16, true); d.setUint16(20, 3, true); d.setUint16(22, 1, true);
      d.setUint32(24, 44100, true); d.setUint32(28, 44100 * 4, true); d.setUint16(32, 4, true); d.setUint16(34, 32, true);
      text(36, 'data'); d.setUint32(40, frames * 4, true);
      for (let i = 0; i < frames; i++) d.setFloat32(44 + i * 4, level, true);
      return new Blob([bytes], { type: 'audio/wav' });
    };
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('vokabelgo-kino-dubbing', 1);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction('takes', 'readwrite');
      for (const [cueId, duration, level] of [[100401, 1.34, .2], [100402, 1.65, .3]]) {
        tx.objectStore('takes').put({ id: `peppa-market-11-42_6-uvr-v1:${cueId}`, cueId, blob: wav(duration, level), lead: 0, createdAt: Date.now() });
      }
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload(); await ready(page);
  // Build the background-only mix without accepting a microphone take.
  await page.locator('#kdsRecord').click();
  await expect(page.locator('#kdsCountdown')).toBeVisible();
  await page.locator('#kdsRecord').click();
  await page.locator('#kdsPreview').click();
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'playing');
  const errors = await page.evaluate(() => {
    const bg = window.__renders[0], personal = window.__renders.at(-1), sr = bg.sampleRate;
    return [[19.8, 20.8, .4], [21.2, 22.4, .6]].map(([start, end, expected]) => {
      let maximum = 0;
      for (let i = Math.ceil(start * sr); i < end * sr; i++) maximum = Math.max(maximum, Math.abs(personal.getChannelData(0)[i] - bg.getChannelData(0)[i] - expected));
      return maximum;
    });
  });
  expect(errors[0]).toBeLessThan(.0001);
  expect(errors[1]).toBeLessThan(.0001);
  await page.locator('#kdsPause').click();
});

test('closing while recording releases the microphone and discards the interrupted take', async ({ page }) => {
  await setup(page);
  await page.locator('#kdsRecord').click();
  await expect(page.locator('#kinoDubbingScene')).toHaveAttribute('data-phase', 'recording');
  await page.locator('#kinoDubbingScene').press('Escape');
  await expect(page.locator('#kinoDubbingScene')).not.toBeVisible();
  expect(await page.evaluate(() => window.__lastMic.getTracks().every(t => t.readyState === 'ended'))).toBeTruthy();
  await page.locator('#kinoOpenDubbingScene').click();
  await ready(page);
  await expect(page.locator('#kdsProgress')).toHaveText('Đã thu 0 / 10 câu');
});

test('phone layout, large subtitles, and the desktop studio stay usable', async ({ page }) => {
  await setup(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1050 : 844 });
    await expect(page.locator('#kdsRecord')).toBeVisible();
    expect(await page.locator('#kinoDubbingScene').evaluate(d => d.scrollWidth <= d.clientWidth + 1)).toBeTruthy();
    expect(await page.locator('#kdsDe').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(22);
    await page.locator('#kdsNext').click();
    await expect(page.locator('#kdsCueLabel')).toContainText('Câu 2');
    await page.locator('#kdsPrev').click();
    await page.locator('#kinoDubbingScene').evaluate(d => d.scrollTop = 0);
    if (width === 390 || width === 1440) await page.screenshot({ path: path.join(__dirname, `../test-results/captures/review-assets/kino-dubbing-${width === 390 ? 'mobile' : 'desktop'}.png`) });
  }
});
