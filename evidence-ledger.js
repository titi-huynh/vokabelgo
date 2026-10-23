// VokabelGo — Sổ bằng chứng học tập chung (Learning Evidence Ledger).
// Một khoá append-only duy nhất: vokabelgo_evidence_v1.
// NGUYÊN TẮC: sổ này KHÔNG chấm điểm. FSRS vẫn là nơi duy nhất ghi điểm nhớ;
// Teach Me vẫn giữ verdict + lịch ôn trong kho riêng. Sổ chỉ trả lời:
// "người học đã hoạt động ở đâu, gặp từ nào, sai từ nào" để Hôm nay gom kế
// hoạch ngày và buổi học sau bắt lại từ từng chơi sai.
(function () {
  'use strict';
  var KEY = 'vokabelgo_evidence_v1';
  var MAX_DAYS = 90;
  var MAX_EVENTS = 3000;

  function dayKey(date) {
    var d = date || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // Khoá khớp từ: thường hoá để lemma Đấu Từ (schliessen, zurueckkommen)
  // khớp được với term của thẻ chính (schließen, zurückkommen).
  function normalizeTermKey(text) {
    var t = String(text || '').toLowerCase().trim();
    t = t.replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
    t = t.replace(/^(der|die|das|den|dem|einen|einem|einer|eine|ein)\s+/, '');
    t = t.replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
    return t;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function save(events) {
    try { localStorage.setItem(KEY, JSON.stringify(events)); } catch (e) {}
  }

  function trim(events) {
    var cutoff = Date.now() - MAX_DAYS * 86400000;
    var out = events.filter(function (e) { return e && typeof e.ts === 'number' && e.ts >= cutoff; });
    if (out.length > MAX_EVENTS) out = out.slice(out.length - MAX_EVENTS);
    return out;
  }

  function record(source, kind, opts) {
    opts = opts || {};
    var ev = { ts: Date.now(), day: dayKey(new Date()), source: source, kind: kind };
    if (opts.ref) ev.ref = String(opts.ref).slice(0, 80);
    if (Array.isArray(opts.cardIds) && opts.cardIds.length) {
      ev.cardIds = opts.cardIds.map(String).slice(0, 40);
    }
    if (Array.isArray(opts.termKeys) && opts.termKeys.length) {
      var keys = opts.termKeys.map(normalizeTermKey).filter(Boolean);
      if (keys.length) ev.termKeys = keys.slice(0, 40);
    }
    var events = trim(load());
    events.push(ev);
    save(events);
    return ev;
  }

  function hasCompletedToday(source, ref) {
    var today = dayKey(new Date());
    return load().some(function (e) {
      return e.day === today && e.source === source && e.kind === 'completed' && e.ref === ref;
    });
  }

  // Từ sai trong game gần đây: { termKeys: [...], cardIds: [...] } mới nhất trước, không trùng.
  function recentWrong(days, cap) {
    var since = Date.now() - (days || 7) * 86400000;
    var limit = cap || 5;
    var events = load();
    var seenTerm = new Set(), seenId = new Set();
    var termKeys = [], cardIds = [];
    for (var i = events.length - 1; i >= 0; i--) {
      var e = events[i];
      if (e.ts < since) break;
      if (e.source !== 'game' || e.kind !== 'wrong') continue;
      (e.termKeys || []).forEach(function (k) {
        if (!seenTerm.has(k) && termKeys.length < limit) { seenTerm.add(k); termKeys.push(k); }
      });
      (e.cardIds || []).forEach(function (id) {
        if (!seenId.has(id) && cardIds.length < limit) { seenId.add(id); cardIds.push(id); }
      });
      if (termKeys.length >= limit && cardIds.length >= limit) break;
    }
    return { termKeys: termKeys, cardIds: cardIds };
  }

  // Tổng kết một ngày: số sự kiện completed theo nguồn + có hoạt động học từ hay không.
  function summaryForDay(day) {
    var target = day || dayKey(new Date());
    var out = { session: 0, kino: 0, game: 0, teachme: 0, wrongTerms: 0 };
    load().forEach(function (e) {
      if (e.day !== target) return;
      if (e.kind === 'completed' && Object.prototype.hasOwnProperty.call(out, e.source)) out[e.source]++;
      if (e.source === 'game' && e.kind === 'wrong') out.wrongTerms += (e.termKeys || []).length;
    });
    return out;
  }

  window.VokabelEvidence = {
    KEY: KEY,
    record: record,
    list: load,
    dayKey: dayKey,
    normalizeTermKey: normalizeTermKey,
    hasCompletedToday: hasCompletedToday,
    recentWrong: recentWrong,
    summaryForDay: summaryForDay
  };
})();
