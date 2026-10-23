/* Isolated browser profiles; does not touch the learner's browser or storage. */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const before = process.argv.includes('--before');
const out = path.resolve('qa/kino-light');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const slug of ['catalog', 'sakura', 'frieren', 'peppa']) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem('vokabelgo_clean_slate_fresh_v2026', 'true');
        localStorage.setItem('vokabelgo_kino_reset_done_v2026', 'true');
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false, latency: 100, downloadThroughput: 5_000_000 / 8,
        uploadThroughput: 1_000_000 / 8, connectionType: 'cellular4g'
      });
      const media = new Map(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      cdp.on('Network.requestWillBeSent', e => {
        if (/\/video\/.*\.mp4/.test(e.request.url)) media.set(e.requestId, { url: e.request.url, bytes: 0 });
      });
      cdp.on('Network.dataReceived', e => {
        if (media.has(e.requestId)) media.get(e.requestId).bytes += e.encodedDataLength;
      });
      const start = Date.now();
      await page.goto('http://127.0.0.1:3000/' + (slug === 'catalog' ? '?hub=kino' : `?kino=${slug}&part=1`));
      await page.locator(slug === 'catalog' ? '#kinoCatalog' : '#kinoLessonTabs').waitFor({ state: 'visible' });
      const uiReadyMs = Date.now() - start;
      const resources = await page.evaluate(() => performance.getEntriesByType('resource')
        .filter(r => /(?:aligned|lesson|kino-metadata|kino-data)\.js/.test(r.name))
        .map(r => ({ name: new URL(r.name).pathname, bytes: r.decodedBodySize })));
      const prePlayVideoBytes = [...media.values()].reduce((s, r) => s + r.bytes, 0);
      const row = { slug, uiReadyMs, lessonBytes: resources.reduce((s, r) => s + r.bytes, 0),
        resources, prePlayVideoBytes, errors };
      if (slug !== 'catalog') {
        await page.locator('#kinoListenSentences').click();
        await page.waitForFunction(() => {
          const v = document.getElementById('kinoMainVideo');
          return !v.paused && !v.seeking && v.readyState >= 2;
        });
        row.source = await page.locator('#kinoMainVideo').getAttribute('src');
        row.seekMs = await page.evaluate(async () => {
          const video = document.getElementById('kinoMainVideo');
          if (kinoTimeupdateListener) {
            video.removeEventListener('timeupdate', kinoTimeupdateListener);
            kinoTimeupdateListener = null;
          }
          const cues = PIZZASCHWESTER_72_SEGMENTS;
          const timings = [];
          for (const i of [0, cues.length - 1, Math.floor(cues.length / 2), 0, 0]) {
            const start = performance.now();
            await KinoMedia.prepare(video, cues[i].start);
            timings.push({ cueId: cues[i].id, ms: performance.now() - start, position: video.currentTime });
          }
          return timings;
        });
        row.videoBytes = [...media.values()].reduce((s, r) => s + r.bytes, 0);
      }
      results.push(row);
      fs.writeFileSync(path.join(out, before ? 'browser-before.json' : 'browser-after.json'), JSON.stringify({
        profile: 'Local Chromium, fresh contexts, simulated 5 Mbps down/1 Mbps up, 100 ms latency. One run; not a production/mobile benchmark.', results
      }, null, 2));
      console.log(JSON.stringify(row));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
