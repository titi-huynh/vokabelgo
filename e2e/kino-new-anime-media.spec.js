const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { seedStorage } = require('./helpers/storage');

// Avoid recording four long source streams during test teardown.
test.use({ video: 'off' });
for (const [key, duration] of [['k_on_s01e01', 1451.744], ['delicious_in_dungeon_s01e01', 1607.488]]) {
  test(`${key}: web copies are real MP4s, support byte ranges and play after seeking`, async ({ page, request }) => {
    test.setTimeout(60000);
    await seedStorage(page);
    await page.goto('/?hub=kino');
    for (const [src, width, height] of [
      [`video/${key}-web-v1.mp4`, 1280, 720],
      [`video/kino-light/${key}-480p-v1.mp4`, 854, 480],
    ]) {
      const bytes = fs.statSync(path.join(__dirname, '..', src)).size;
      const range = await request.get('/' + src, { headers: { Range: 'bytes=0-63' } });
      expect(range.status()).toBe(206);
      expect(range.headers()['content-range']).toBe(`bytes 0-63/${bytes}`);
      expect((await range.body()).subarray(4, 8).toString()).toBe('ftyp');
      await page.setContent(`<video id="episode" controls muted preload="metadata" src="/${src}"></video>`);
      const video = page.locator('#episode');
      await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(1);
      expect(await video.evaluate(v => v.duration)).toBeCloseTo(duration, 1);
      expect(await video.evaluate(v => [v.videoWidth, v.videoHeight])).toEqual([width, height]);
      for (const time of [300, duration - 15]) {
        await video.evaluate((v, time) => { v.currentTime = time; return v.play(); }, time);
        await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(time + .1);
        expect(await video.evaluate(v => v.error)).toBeNull();
        await video.evaluate(v => v.pause());
      }
    }
  });
}
