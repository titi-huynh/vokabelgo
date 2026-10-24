/* VokabelGo — SRT parse + căn DE–VI dùng chung cho "Cảnh học của bạn".
   Thuật toán giữ NGUYÊN VĂN từ tools/kino-import/import.js (ghép mốc bắt đầu
   gần nhất, dung sai mặc định 1.6s; cắt phần theo độ dài + khoảng lặng) để bản
   trong trình duyệt và công cụ biên tập cho cùng một kết quả trên cùng dữ liệu.
   UMD: trình duyệt -> window.SrtAlign; Node -> module.exports (cho unit test). */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SrtAlign = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function srtTime(s) {
    const m = String(s).trim().match(/(\d+):(\d+):(\d+)[.,](\d+)/);
    if (!m) return 0;
    return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
  }
  function parseSrt(raw) {
    const blocks = String(raw || '').replace(/\r\n/g, '\n').split(/\n\s*\n/);
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
  /* Đọc phụ đề SRT hoặc WebVTT (tự nhận diện): VTT được chuẩn hoá về cùng
     đường phân tích SRT (bỏ header/NOTE, bỏ cài đặt sau mốc thời gian,
     mốc dạng MM:SS.mmm -> 0:MM:SS.mmm). */
  function parseSubtitles(raw) {
    const text = String(raw || '');
    if (!/^\s*WEBVTT/.test(text)) return parseSrt(text);
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let skipBlock = false;
    const fixTs = line => line.replace(
      /^(\d{2}:\d{2}[.,]\d{3})(\s*-->\s*)(\d{2}:\d{2}[.,]\d{3})?/,
      (m, a, arrow, b) => '0:' + a + arrow + (b ? '0:' + b : ''));
    for (let line of lines) {
      if (/^WEBVTT/.test(line)) continue;
      if (/^(NOTE|STYLE|REGION)(\s|$)/.test(line)) { skipBlock = true; continue; }
      if (!line.trim()) { skipBlock = false; out.push(''); continue; }
      if (skipBlock) continue;
      if (line.includes('-->')) {
        const isLong = t => /^\d{2}:\d{2}:\d{2}/.test(t);
        const tl = line.trim();
        if (!isLong(tl)) line = fixTs(tl); else line = tl;
        line = line.replace(/(-->\s*[\d:.,]+)\s+\S.*$/, '$1');
      }
      out.push(line);
    }
    return parseSrt(out.join('\n'));
  }
  /* Dựng câu cho một cảnh: gán id dãy 1..N (parentId = id), giữ matched để báo cáo. */
  function buildSceneCues(deSrtText, viSrtText, tolerance) {
    const de = parseSubtitles(deSrtText);
    const vi = viSrtText ? parseSubtitles(viSrtText) : [];
    const aligned = vi.length ? align(de, vi, tolerance == null ? 1.6 : tolerance)
      : de.map(c => ({ ...c, vi: '', matched: false }));
    const cues = aligned.map((c, i) => ({
      id: i + 1, parentId: i + 1,
      start: Math.round(c.start * 100) / 100, end: Math.round(c.end * 100) / 100,
      text: c.text, vi: c.vi || ''
    }));
    return { cues, matched: aligned.filter(c => c.matched).length, total: cues.length };
  }
  /* Cắt chương nháp từ danh sách câu: picks = tối đa 7 câu rải đều trong phần. */
  function draftChapters(cues, targetSeconds) {
    return chunkParts(cues, targetSeconds || 150).map((p, i) => {
      const ids = p.cues.map(c => c.id);
      const picks = [];
      const step = Math.max(1, Math.floor(ids.length / 7));
      for (let j = 0; j < ids.length && picks.length < 7; j += step) picks.push(ids[j]);
      return { title: 'Phần ' + (i + 1), icon: '🎬', start: p.start, end: p.end, picks, goal: '' };
    });
  }
  /* Giữ lại các câu nằm trong cửa sổ [from, to) và KHÔNG đổi mốc (mốc tuyệt đối theo video). */
  function windowCues(cues, from, to) {
    return cues.filter(c => c.start >= from && c.start < to)
      .map((c, i) => ({ ...c, id: i + 1, parentId: i + 1 }));
  }
  /* Chia lại câu ASR: câu dài hơn maxDur/maxChars được tách tại dấu kết câu
     (chia thời gian theo tỉ lệ độ dài chữ); mảnh quá ngắn (<0,5s) gộp vào câu
     trước nếu tổng <= 9s. Chỉ dùng cho phụ đề máy — phụ đề người làm giữ nguyên. */
  function resegment(cues, maxDur, maxChars) {
    maxDur = maxDur || 7; maxChars = maxChars || 110;
    const splitCue = cue => {
      const parts = cue.text.split(/(?<=[.!?…])\s+/).filter(p => p.trim());
      if (parts.length < 2) {
        if (cue.text.length <= maxChars) return [cue];
        const words = cue.text.split(/\s+/);
        const mid = Math.ceil(words.length / 2);
        parts.splice(0, parts.length, words.slice(0, mid).join(' '), words.slice(mid).join(' '));
      }
      const total = parts.reduce((a, p) => a + p.length, 0) || 1;
      const dur = cue.end - cue.start;
      let t = cue.start;
      return parts.map((p, i) => {
        const d = i === parts.length - 1 ? cue.end - t : Math.max(0.4, dur * (p.length / total));
        const out = { ...cue, start: Math.round(t * 100) / 100, end: Math.round((t + d) * 100) / 100, text: p };
        t += d; return out;
      });
    };
    let out = [];
    for (const cue of cues) {
      if (cue.end - cue.start > maxDur || cue.text.length > maxChars) out.push(...splitCue(cue));
      else out.push(cue);
    }
    const merged = [];
    for (const cue of out) {
      const prev = merged[merged.length - 1];
      if (prev && cue.end - cue.start < 0.5 && cue.end - prev.start <= 9) {
        prev.end = cue.end; prev.text = (prev.text + ' ' + cue.text).trim();
      } else merged.push({ ...cue });
    }
    return merged.map((c, i) => ({ ...c, id: i + 1, parentId: i + 1 }));
  }
  /* Ứng viên từ vựng của cảnh — thuật toán giữ nguyên từ tools/kino-import. */
  const STOP = new Set(('und oder aber denn ich wir sie er es der die das den dem ein eine einen ist sind war hat haben wird mit von zu in im am an auf für nicht auch so da doch mal ja nein mein meine dein sein sich mir dir ihm uns euch als wie wenn dann noch schon sehr mehr beim vom zur zum ans ins').split(' '));
  function vocabCandidates(cues, limit) {
    const freq = new Map();
    for (const c of cues) {
      for (const raw of c.text.split(/[^A-Za-zÄÖÜäöüß-]+/)) {
        const w = raw.trim();
        if (w.length < 5 || STOP.has(w.toLowerCase())) continue;
        const key = w.toLowerCase();
        if (!freq.has(key)) freq.set(key, { term: w, count: 0, example: c.text, cueId: c.id });
        freq.get(key).count++;
      }
    }
    return [...freq.values()].sort((a, b) => b.count - a.count).slice(0, limit || 30);
  }
  return { srtTime, parseSrt, parseSubtitles, align, chunkParts, buildSceneCues, draftChapters, windowCues, resegment, vocabCandidates };
});
