// "Cảnh học của bạn": tạo cảnh bằng SRT -> học -> sửa/đánh dấu rà -> xóa;
// luồng ASR bằng adapter giả đúng hợp đồng window.UserAsr (mô hình thật cần
// mạng ngoài — kiểm chứng tay trên máy thật, xem phụ lục 6 VokabelGo_PhanTich).
const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./helpers/storage');
const fs = require('fs');
const os = require('os');
const path = require('path');

const VIDEO = path.join(__dirname, '..', 'video', 'kino-light', 'trudes_fahrstuhl-480p-v2.mp4');
const DE_SRT = [
  '1', '00:00:01,000 --> 00:00:03,500', 'Guten Morgen, wie geht es dir?', '',
  '2', '00:00:04,000 --> 00:00:06,500', 'Mir geht es gut, danke der Nachfrage.', '',
  '3', '00:00:07,000 --> 00:00:09,500', 'Das freut mich sehr zu hören.', ''
].join('\n');
const VI_SRT = [
  '1', '00:00:01,100 --> 00:00:03,400', 'Chào buổi sáng, bạn có khỏe không?', '',
  '2', '00:00:04,100 --> 00:00:06,400', 'Mình khỏe, cảm ơn bạn đã hỏi.', '',
  '3', '00:00:07,100 --> 00:00:09,400', 'Nghe vậy mình rất vui.', ''
].join('\n');

async function openCatalog(page) {
  await seedStorage(page, { vokabelgo_kino_reset_done_v2026: 'true' });
  await page.goto('/?hub=kino');
  await expect(page.locator('#kinoCatalog')).toBeVisible();
  await expect(page.locator('#userScenesSection')).toBeAttached();
}
function tmpSrt(name, content) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'usc-e2e-')), name);
  fs.writeFileSync(p, content);
  return p;
}

test('user scene via SRT: create -> learn -> persists -> delete; built-in grid untouched', async ({ page }) => {
  await openCatalog(page);
  await expect(page.locator('.kino-film-card')).toHaveCount(10);
  await page.locator('#uscAddBtn').click();
  await page.locator('#uscVideo').setInputFiles(VIDEO);
  await page.locator('#uscSrtDe').setInputFiles(tmpSrt('a.de.srt', DE_SRT));
  await page.locator('#uscSrtVi').setInputFiles(tmpSrt('a.vi.srt', VI_SRT));
  await expect(page.locator('#uscWinInfo')).toContainText('3 câu');
  await expect(page.locator('#uscCreateBtn')).toBeEnabled();
  await page.locator('#uscCreateBtn').click();
  await page.waitForURL(/kino=user_/);
  await expect(page.locator('#diktatMode')).toHaveAttribute('data-kino-view', 'detail');
  await expect(page.locator('#kinoOverlayDe')).toContainText('Guten Morgen');
  const key = new URL(page.url()).searchParams.get('kino');
  expect(await page.evaluate(k => KinoData.cues(k).length, key)).toBe(3);
  // Tải lại trang: cảnh còn, mở lại được từ catalog (blob dựng lại từ IndexedDB)
  await page.goto('/?hub=kino');
  await expect(page.locator('.usc-card')).toHaveCount(1);
  await expect(page.locator('.usc-badge')).toHaveText('Phụ đề của bạn');
  await expect(page.locator('.kino-film-card')).toHaveCount(10);
  // Xóa cảnh: mất khỏi catalog, kho và registry
  page.on('dialog', d => d.accept());
  await page.locator('.usc-del').click();
  await expect(page.locator('.usc-card')).toHaveCount(0);
  const left = await page.evaluate(k => ({
    ls: JSON.parse(localStorage.getItem('vokabelgo_user_scenes_v1') || '[]').length,
    reg: Object.keys(KINO_CHAPTER_DATA).filter(x => x.startsWith('user_')).length
  }), key);
  expect(left).toEqual({ ls: 0, reg: 0 });
});

test('ASR scene (fake adapter): draft -> unreviewed badge -> editor review flips the gate', async ({ page }) => {
  await openCatalog(page);
  await page.evaluate(() => {
    window.UserAsr = {
      model: 'fake', cancel() {},
      async transcribe(audio, onProgress) {
        onProgress({ status: 'running' });
        return [
          { timestamp: [0.5, 3.0], text: 'Guten Morgen, wie geht es dir?' },
          { timestamp: [3.6, 6.0], text: 'Mir geht es gut, danke.' }
        ];
      }
    };
  });
  await page.locator('#uscAddBtn').click();
  await page.locator('#uscVideo').setInputFiles(VIDEO);
  await page.locator('input[name="uscMode"][value="asr"]').check();
  await page.locator('#uscAsrRun').click();
  await expect(page.locator('#uscAsrStatus')).toContainText('câu phụ đề nháp', { timeout: 90000 });
  await expect(page.locator('#uscCreateBtn')).toBeEnabled();
  await page.locator('#uscCreateBtn').click();
  await page.waitForURL(/kino=user_/);
  const key = new URL(page.url()).searchParams.get('kino');
  await page.goto('/?hub=kino');
  await expect(page.locator('.usc-badge')).toHaveText('Phụ đề máy — chưa rà');
  expect(await page.evaluate(k => window.UserScenes.isUnreviewed(k), key)).toBe(true);
  // Rà soát: sửa câu + đánh dấu đã rà -> cổng mở, nhãn đổi
  await page.locator('.usc-edit').click();
  await expect(page.locator('#uscEditorDialog')).toBeVisible();
  await page.locator('.usc-ed-row').first().locator('textarea[data-f="text"]').fill('Korrigierter erster Satz.');
  await page.locator('#uscEdReviewed').check();
  await page.locator('#uscEdSave').click();
  await expect(page.locator('.usc-badge')).toHaveText('Phụ đề máy · Đã rà');
  const after = await page.evaluate(k => ({
    unreviewed: window.UserScenes.isUnreviewed(k),
    cue0: window.UserScenes.getByKey(k).cues[0].text,
    label: KINO_CHAPTER_DATA[k].levelLabel
  }), key);
  expect(after.unreviewed).toBe(false);
  expect(after.cue0).toBe('Korrigierter erster Satz.');
  expect(after.label).toContain('Đã rà');
});
