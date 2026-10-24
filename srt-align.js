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
  /* Dựng câu cho một cảnh: gán id dãy 1..N (parentId = id), giữ matched để báo cáo. */
  function buildSceneCues(deSrtText, viSrtText, tolerance) {
    const de = parseSrt(deSrtText);
    const vi = viSrtText ? parseSrt(viSrtText) : [];
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
  return { srtTime, parseSrt, align, chunkParts, buildSceneCues, draftChapters, windowCues };
});
