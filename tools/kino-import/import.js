// VokabelGo — Công cụ thêm phim Kino bán tự động (Mục 8 cải thiện Kino).
//
// Nhận video đã có phụ đề SRT tiếng Đức + tiếng Việt, sinh ra:
//   1) <key>-aligned.draft.js  — mảng utterances đúng định dạng repo ({id,parentId,start,end,text,vi})
//   2) chapterdata.draft.json  — khung chapterData (phần cắt theo độ dài/khoảng lặng, picks nháp)
//   3) import-report.md        — báo cáo rà soát: số câu, câu chưa có bản dịch, ứng viên từ vựng
//
// Đây là bản NHÁP cho người biên tập duyệt tay — không tự đăng vào app.
// Ghép DE–VI theo mốc bắt đầu gần nhất (dung sai mặc định 1.6s).
//
// Cách dùng:
//   node tools/kino-import/import.js --de film.de.srt --vi film.vi.srt \
//     --key mein_film --title "Tên phim" [--part-seconds 150] [--out thu-muc]
'use strict';
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { args[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return args;
}
function srtTime(s) {
  const m = String(s).trim().match(/(\d+):(\d+):(\d+)[.,](\d+)/);
  if (!m) return 0;
  return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
}
function parseSrt(raw) {
  const blocks = raw.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  const cues = [];
  for (const b of blocks) {
    const lines = b.split('\n').map(x => x.trim()).filter(Boolean);
    const tl = lines.find(l => l.includes('-->'));
    if (!tl) continue;
    const [a, z] = tl.split('-->').map(x => x.trim());
    const text = lines.filter(l => l !== tl && !/^\d+$/.test(l))
      .join(' ').replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '').replace(/\s+/g, ' ').trim();
    if (text) cues.push({ start: srtTime(a), end: srtTime(z), text });
  }
  return cues.sort((x, y) => x.start - y.start);
}
function align(de, vi, tolerance) {
  const usedVi = new Set();
  return de.map(cue => {
    let best = -1, bestDelta = Infinity;
    vi.forEach((v, i) => {
      if (usedVi.has(i)) return;
      const d = Math.abs(v.start - cue.start);
      if (d < bestDelta) { bestDelta = d; best = i; }
    });
    if (best >= 0 && bestDelta <= tolerance) {
      usedVi.add(best);
      return { ...cue, vi: vi[best].text, matched: true };
    }
    return { ...cue, vi: '', matched: false };
  });
}
function chunkParts(cues, targetSeconds) {
  const parts = [];
  let cur = [];
  let curStart = cues.length ? cues[0].start : 0;
  cues.forEach((cue, i) => {
    cur.push(cue);
    const dur = cue.end - curStart;
    const next = cues[i + 1];
    const gap = next ? next.start - cue.end : 0;
    if ((dur >= targetSeconds && gap > 1.2) || dur >= targetSeconds * 1.6 || !next) {
      parts.push({ start: curStart, end: cue.end, cues: cur });
      cur = [];
      if (next) curStart = next.start;
    }
  });
  return parts;
}
const STOP = new Set(('und oder aber denn ich wir sie er es der die das den dem ein eine einen ist sind war hat haben wird mit von zu in im am an auf für nicht auch so da doch mal ja nein mein meine dein sein sich mir dir ihm uns euch als wie wenn dann noch schon sehr mehr beim vom zur zum ans ins').split(' '));
function vocabDraft(cues, limit) {
  const freq = new Map();
  for (const c of cues) {
    for (const raw of c.text.split(/[^A-Za-zÄÖÜäöüß-]+/)) {
      const w = raw.trim();
      if (w.length < 5 || STOP.has(w.toLowerCase())) continue;
      const key = w.toLowerCase();
      if (!freq.has(key)) freq.set(key, { term: w, count: 0, example: c.text });
      freq.get(key).count++;
    }
  }
  return [...freq.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.de || !args.vi || !args.key) {
    console.error('Thiếu tham số. Bắt buộc: --de <file.srt> --vi <file.srt> --key <slug>. Tuỳ chọn: --title, --part-seconds (150), --tolerance (1.6), --out (.)');
    process.exit(2);
  }
  const key = args.key;
  const partSeconds = Number(args['part-seconds'] || 150);
  const tolerance = Number(args.tolerance || 1.6);
  const outDir = args.out || '.';
  fs.mkdirSync(outDir, { recursive: true });

  const de = parseSrt(fs.readFileSync(args.de, 'utf8'));
  const vi = parseSrt(fs.readFileSync(args.vi, 'utf8'));
  if (!de.length) { console.error('Không đọc được câu Đức nào từ', args.de); process.exit(1); }
  const aligned = align(de, vi, tolerance);

  const idBase = Number(args['id-base'] || 500000);
  const utterances = aligned.map((c, i) => ({
    id: idBase + i + 1,
    parentId: i + 1,
    start: Math.round(c.start * 100) / 100,
    end: Math.round(c.end * 100) / 100,
    text: c.text,
    vi: c.vi
  }));
  const constName = key.toUpperCase().replace(/[^A-Z0-9]+/g, '_') + '_ALIGNED_UTTERANCES';
  const js = '// BẢN NHÁP từ tools/kino-import — cần biên tập viên rà lại trước khi dùng.\n'
    + 'const ' + constName + ' = ' + JSON.stringify(utterances, null, 2) + ';\n';
  fs.writeFileSync(path.join(outDir, key + '-aligned.draft.js'), js);

  const parts = chunkParts(aligned.map((c, i) => ({ ...c, id: utterances[i].id })), partSeconds);
  const totalEnd = aligned.length ? aligned[aligned.length - 1].end : 0;
  const mm = String(Math.floor(totalEnd / 60)).padStart(2, '0');
  const ss = String(Math.floor(totalEnd % 60)).padStart(2, '0');
  const chapterData = {
    title: args.title || key,
    series: 'CHƯA ĐẶT',
    levelLabel: 'Gợi ý A2–B1',
    storageKey: 'vokabelgo_kino_chapters_v1_' + key,
    cueCount: utterances.length,
    fullDurationStr: mm + ':' + ss,
    chapters: parts.map((p, i) => ({
      title: 'Phần ' + (i + 1) + ' (đặt tên lại)',
      icon: '🎬',
      start: Math.round(p.start * 100) / 100,
      end: Math.round(p.end * 100) / 100,
      picks: p.cues.slice(0, 7).map(c => c.id),
      goal: ''
    })),
    vocabularyCount: 0,
    _note: 'NHÁP: đặt lại series/levelLabel/tên phần/mục tiêu từng phần, chọn lại picks, soạn flashcards rồi mới nối vào kino-chapter-data.js + KINO_VIDEOS.'
  };
  fs.writeFileSync(path.join(outDir, 'chapterdata.draft.json'), JSON.stringify(chapterData, null, 2));

  const unmatched = aligned.filter(c => !c.matched);
  const vocab = vocabDraft(aligned, 30);
  const report = [
    '# Báo cáo nhập phim (NHÁP) — ' + key,
    '',
    '- Câu Đức: ' + de.length + ' · Câu Việt: ' + vi.length + ' · Ghép được: ' + (aligned.length - unmatched.length) + '/' + aligned.length,
    '- Số phần dự kiến: ' + parts.length + ' (mục tiêu ~' + partSeconds + 's/phần)',
    '- Tổng thời lượng: ' + mm + ':' + ss,
    '',
    '## Câu Đức chưa có bản dịch ghép (' + unmatched.length + ')',
    ...(unmatched.length ? unmatched.slice(0, 40).map(c => '- [' + c.start.toFixed(1) + 's] ' + c.text) : ['- (không có)']),
    '',
    '## Ứng viên từ vựng (theo tần suất — nghĩa để trống cho biên tập viên điền)',
    '',
    '| Từ | Số lần | Câu ví dụ | Nghĩa (điền tay) |',
    '|---|---|---|---|',
    ...vocab.map(v => '| ' + v.term + ' | ' + v.count + ' | ' + v.example.replace(/\|/g, ' ') + ' | |'),
    '',
    '## Việc còn phải làm tay trước khi phim lên app',
    '1. Rà các câu chưa ghép dịch + kiểm tra lệch thời gian toàn cục (nếu lệch đều, dùng --tolerance lớn hơn hoặc sửa SRT).',
    '2. Đặt tên phần + mục tiêu giao tiếp từng phần; chọn lại picks (bản nháp lấy 7 câu đầu mỗi phần).',
    '3. Soạn flashcards cho phim (định dạng như các phim hiện có trong kino-metadata.js).',
    '4. Thêm video vào video/kino-light/ + poster assets/kino-posters/' + key + '-1.jpg.',
    '5. Nối dữ liệu: chapterData vào kino-chapter-data.js, mục KINO_VIDEOS + alias trong kino-data.js/kino-chapter-data.js.',
    '6. Chạy bộ e2e Kino (catalog/three-step) để kiểm chứng.'
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'import-report.md'), report);
  console.log('Xong: ' + utterances.length + ' câu, ' + parts.length + ' phần, ' + unmatched.length + ' câu chưa ghép dịch. Xem import-report.md trong ' + outDir);
}
main();
