// test-srt-align.js — Kiểm chứng module srt-align.js (dùng cho "Cảnh học của bạn"):
//  1) Cùng dữ liệu SRT, kết quả căn DE–VI phải TRÙNG với tools/kino-import (bản CLI).
//  2) parseSrt/align/windowCues/draftChapters đúng các trường hợp biên cơ bản.
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const SrtAlign = require('./srt-align.js');

let passed = 0;
function ok(name, fn) { fn(); passed++; console.log('  ✓ ' + name); }

const DE = [
  '1', '00:00:01,000 --> 00:00:03,500', 'Guten Morgen, <i>Hans</i>!', '',
  '2', '00:00:04,000 --> 00:00:06,000', 'Wie geht es dir heute?', '',
  '3', '00:00:07,250 --> 00:00:09,000', 'Mir geht es gut, danke.', '',
  '4', '00:00:20,000 --> 00:00:22,000', 'Dieser Satz hat keine Übersetzung.', ''
].join('\n');
const VI = [
  '1', '00:00:01,200 --> 00:00:03,400', 'Chào buổi sáng, Hans!', '',
  '2', '00:00:04,100 --> 00:00:05,900', 'Hôm nay bạn có khỏe không?', '',
  '3', '00:00:07,000 --> 00:00:09,100', 'Mình khỏe, cảm ơn.', ''
].join('\n');

ok('parseSrt: bỏ thẻ HTML, sắp theo thời gian', () => {
  const cues = SrtAlign.parseSrt(DE);
  assert.strictEqual(cues.length, 4);
  assert.strictEqual(cues[0].text, 'Guten Morgen, Hans!');
  assert.strictEqual(cues[0].start, 1); assert.strictEqual(cues[0].end, 3.5);
});

ok('align: dung sai 1.6s ghép đúng, câu lệch xa để trống', () => {
  const out = SrtAlign.align(SrtAlign.parseSrt(DE), SrtAlign.parseSrt(VI), 1.6);
  assert.strictEqual(out[0].vi, 'Chào buổi sáng, Hans!');
  assert.strictEqual(out[3].vi, ''); assert.strictEqual(out[3].matched, false);
});

ok('buildSceneCues: id dãy 1..N, matched đếm đúng', () => {
  const { cues, matched, total } = SrtAlign.buildSceneCues(DE, VI);
  assert.strictEqual(total, 4); assert.strictEqual(matched, 3);
  assert.deepStrictEqual(cues.map(c => c.id), [1, 2, 3, 4]);
  assert.strictEqual(cues[2].vi, 'Mình khỏe, cảm ơn.');
});

ok('windowCues: lọc theo cửa sổ và đánh số lại', () => {
  const { cues } = SrtAlign.buildSceneCues(DE, VI);
  const w = SrtAlign.windowCues(cues, 3.9, 20);
  assert.strictEqual(w.length, 2);
  assert.deepStrictEqual(w.map(c => c.id), [1, 2]);
  assert.strictEqual(w[0].start, 4);
});

ok('draftChapters: picks tối đa 7 và nằm trong phần', () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ id: i + 1, parentId: i + 1, start: i * 4, end: i * 4 + 3, text: 'Satz ' + i, vi: '' }));
  const parts = SrtAlign.draftChapters(many, 60);
  assert.ok(parts.length >= 2);
  for (const p of parts) {
    assert.ok(p.picks.length <= 7 && p.picks.length >= 1);
    assert.ok(p.end > p.start);
  }
});

ok('PARITY: trùng kết quả căn với tools/kino-import trên cùng SRT', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-srt-'));
  const deF = path.join(tmp, 'f.de.srt'), viF = path.join(tmp, 'f.vi.srt');
  fs.writeFileSync(deF, DE); fs.writeFileSync(viF, VI);
  const r = spawnSync(process.execPath, [path.join(__dirname, 'tools/kino-import/import.js'),
    '--de', deF, '--vi', viF, '--key', 'parity', '--title', 'Parity', '--out', tmp], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  const draft = fs.readFileSync(path.join(tmp, 'parity-aligned.draft.js'), 'utf8');
  const cliCues = JSON.parse(draft.slice(draft.indexOf('['), draft.lastIndexOf(']') + 1));
  const mine = SrtAlign.buildSceneCues(DE, VI).cues;
  const slim = arr => arr.map(c => [c.start, c.end, c.text, c.vi]);
  assert.deepStrictEqual(slim(mine), slim(cliCues));
  const cliParts = JSON.parse(fs.readFileSync(path.join(tmp, 'chapterdata.draft.json'), 'utf8')).chapters;
  const myParts = SrtAlign.draftChapters(mine, 150);
  assert.deepStrictEqual(myParts.map(p => [p.start, p.end]), cliParts.map(p => [p.start, p.end]));
  fs.rmSync(tmp, { recursive: true, force: true });
});


// --- Bổ sung đợt cải thiện: VTT, resegment, vocabCandidates ---
ok('parseSubtitles: đọc được WebVTT (mốc MM:SS + cài đặt sau mốc)', () => {
  const vtt = ['WEBVTT', '',
    '00:01.000 --> 00:03.500 align:start position:0%', 'Guten Morgen, Hans!', '',
    '00:00:04.000 --> 00:00:06.000', 'Wie geht es dir?'].join('\n');
  const cues = SrtAlign.parseSubtitles(vtt);
  assert.strictEqual(cues.length, 2);
  assert.strictEqual(cues[0].start, 1); assert.strictEqual(cues[0].text, 'Guten Morgen, Hans!');
  assert.strictEqual(cues[1].start, 4);
});
ok('buildSceneCues: nhận cả đầu vào VTT', () => {
  const vtt = ['WEBVTT', '', '00:00:01.000 --> 00:00:02.500', 'Hallo Welt.'].join('\n');
  const { cues, total } = SrtAlign.buildSceneCues(vtt, '');
  assert.strictEqual(total, 1); assert.strictEqual(cues[0].text, 'Hallo Welt.');
});
ok('resegment: câu dài 12s tách tại dấu câu, thời gian liên tục', () => {
  const long = [{ id: 1, parentId: 1, start: 0, end: 12, text: 'Erstens gehen wir einkaufen. Zweitens kochen wir zusammen. Drittens essen wir alles auf.', vi: '' }];
  const out = SrtAlign.resegment(long);
  assert.strictEqual(out.length, 3);
  assert.strictEqual(out[0].start, 0); assert.strictEqual(out[2].end, 12);
  for (let i = 1; i < out.length; i++) assert.ok(out[i].start >= out[i - 1].end - 0.01);
});
ok('resegment: mảnh <0,5s gộp vào câu trước', () => {
  const cues = [
    { id: 1, parentId: 1, start: 0, end: 3, text: 'Ein normaler Satz hier.', vi: '' },
    { id: 2, parentId: 2, start: 3, end: 3.3, text: 'Ja.', vi: '' }];
  const out = SrtAlign.resegment(cues);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].end, 3.3);
});
ok('vocabCandidates: từ nội dung dài >=5, bỏ stopword, đếm tần suất', () => {
  const cues = [
    { id: 1, parentId: 1, start: 0, end: 2, text: 'Der Hund läuft durch den Garten und der Hund spielt.', vi: '' },
    { id: 2, parentId: 2, start: 2, end: 4, text: 'Im Garten steht ein alter Baum.', vi: '' }];
  const v = SrtAlign.vocabCandidates(cues, 10);
  const garten = v.find(x => x.term === 'Garten');
  assert.ok(garten && garten.count === 2);
  assert.ok(!v.some(x => ['und', 'der', 'im'].includes(x.term.toLowerCase())));
});

console.log('test-srt-align: ' + passed + '/11 PASS');
