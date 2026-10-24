// VokabelGo — Kino Shorts: đoạn trích hay mỗi ngày (Mục 9 cải thiện Kino).
// Mỗi ngày chọn tất định một câu "pick" từ một phần của một phim (xoay vòng
// theo ngày qua toàn bộ thư viện), hiện thành thẻ lớn đầu catalog. Bấm xem ->
// mở đúng phần và phát đúng câu đó. Không cần nội dung mới: dùng picks sẵn có.
(function () {
  'use strict';
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function dayNumber() { return Math.floor(Date.now() / 86400000); }
  function dailyTarget() {
    if (typeof KINO_CHAPTER_DATA === 'undefined') return null;
    var flat = [];
    Object.entries(KINO_CHAPTER_DATA).forEach(function ([key, m]) {
      (m.chapters || []).forEach(function (ch, i) {
        if ((ch.picks || []).length) flat.push({ key: key, partIdx: i, chapter: ch });
      });
    });
    if (!flat.length) return null;
    var t = flat[dayNumber() % flat.length];
    t.pickId = t.chapter.picks[dayNumber() % t.chapter.picks.length];
    return t;
  }
  function jumpToCueText(cueText) {
    var norm = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var rows = [...document.querySelectorAll('#kinoTimelineList .kino-v3-timeline-row')];
      var row = rows.find(function (r) { return norm(r.textContent).includes(norm(cueText).slice(0, 40)); });
      if (row) {
        clearInterval(timer);
        var body = document.getElementById('kinoTimelineBody');
        if (body && body.classList.contains('collapsed')) {
          var tgl = document.getElementById('kinoTimelineCollapseBtn');
          if (tgl) tgl.click();
        }
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setTimeout(function () { row.click(); }, 350);
      } else if (tries > 25) clearInterval(timer);
    }, 700);
  }
  async function render(container) {
    var t = dailyTarget();
    if (!t || typeof KinoData === 'undefined') { container.hidden = true; return; }
    try { await KinoData.load(t.key); } catch (e) { container.hidden = true; return; }
    var cues = KinoData.cues(t.key);
    var cue = cues.find(function (c) { return c.id === t.pickId; });
    if (!cue) { container.hidden = true; return; }
    var idx = cues.indexOf(cue);
    var next = cues[idx + 1];
    var endAt = next ? Math.min(next.start, cue.start + 45) : cue.end;
    var dur = Math.max(4, Math.round(endAt - cue.start));
    var movie = KINO_CHAPTER_DATA[t.key];
    container.hidden = false;
    container.innerHTML =
      '<img class="kino-short-poster" src="assets/kino-posters/' + t.key + '-1.jpg" alt="" width="480" height="270">'
      + '<div class="kino-short-body">'
      + '<p class="kino-short-eyebrow">🎬 ĐOẠN HAY HÔM NAY</p>'
      + '<strong class="kino-short-title">' + esc(movie.catalogTitle || movie.title) + ' · Phần ' + (t.partIdx + 1) + '</strong>'
      + '<p class="kino-short-quote">„' + esc(cue.text) + '"</p>'
      + (cue.vi ? '<p class="kino-short-vi">' + esc(cue.vi) + '</p>' : '')
      + '<p class="kino-short-meta">Đoạn trích ~' + dur + ' giây · Đổi mới mỗi ngày</p>'
      + '<button type="button" class="kino-short-btn">▶ Xem đoạn này</button>'
      + '</div>';
    container.querySelector('.kino-short-btn').addEventListener('click', function () {
      try {
        sessionStorage.setItem('vokabelgo_kino_short', JSON.stringify({ key: t.key, part: t.partIdx, cueText: cue.text }));
      } catch (e) {}
      var alias = (typeof KINO_ALIASES !== 'undefined' && KINO_ALIASES[t.key]) || t.key;
      location.assign('?kino=' + alias + '&part=' + (t.partIdx + 1));
    });
  }
  // Sau khi điều hướng từ thẻ Short: tự nhảy tới đúng câu trong timeline.
  (function consumePending() {
    var raw = null;
    try { raw = sessionStorage.getItem('vokabelgo_kino_short'); } catch (e) {}
    if (!raw) return;
    try { sessionStorage.removeItem('vokabelgo_kino_short'); } catch (e) {}
    var want = null;
    try { want = JSON.parse(raw); } catch (e) {}
    if (want && want.cueText) setTimeout(function () { jumpToCueText(want.cueText); }, 1200);
  })();
  window.KinoShorts = { render: render, dailyTarget: dailyTarget };
})();
