// VokabelGo — Kino Shorts: đoạn trích hay mỗi ngày (Mục 9 cải thiện Kino).
// Mỗi ngày chọn tất định một thẻ từ có câu ví dụ từ lời thoại (xoay vòng theo
// ngày qua toàn bộ thẻ video) làm "đoạn hay hôm nay" ở đầu catalog.
// QUAN TRỌNG: bản này CHỈ dùng dữ liệu tĩnh (VIDEO_FLASHCARDS) — không tải
// lời thoại khi mở catalog (giữ đúng hợp đồng tải lười của app). Bấm xem ->
// mở đúng phần của phim; khi bài học đã nạp, tự nhảy tới câu ví dụ đó.
(function () {
  'use strict';
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function dayNumber() { return Math.floor(Date.now() / 86400000); }
  function dailyCard() {
    if (typeof VIDEO_FLASHCARDS === 'undefined' || typeof KINO_CHAPTER_DATA === 'undefined') return null;
    var pool = VIDEO_FLASHCARDS.filter(function (c) {
      return c && c.videoKey && c.example && c.sourceUrl && KINO_CHAPTER_DATA[c.videoKey];
    });
    if (!pool.length) return null;
    return pool[dayNumber() % pool.length];
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
  function render(container) {
    var card = dailyCard();
    if (!card) { container.hidden = true; return; }
    var movie = KINO_CHAPTER_DATA[card.videoKey];
    var partMatch = /[?&]part=(\d+)/.exec(card.sourceUrl || '');
    var part = partMatch ? Number(partMatch[1]) : 1;
    container.hidden = false;
    container.innerHTML =
      '<img class="kino-short-poster" src="assets/kino-posters/' + card.videoKey + '-1.jpg" alt="" width="480" height="270">'
      + '<div class="kino-short-body">'
      + '<p class="kino-short-eyebrow">🎬 ĐOẠN HAY HÔM NAY</p>'
      + '<strong class="kino-short-title">' + esc(movie.catalogTitle || movie.title) + ' · Phần ' + part + '</strong>'
      + '<p class="kino-short-quote">„' + esc(card.example) + '"</p>'
      + '<p class="kino-short-vi">Từ nổi bật trong đoạn: <strong>' + esc(card.term) + '</strong> — ' + esc(card.meaning || '') + '</p>'
      + '<p class="kino-short-meta">Một câu thoại đáng nhớ mỗi ngày · Lướt Shorts để xem liên tục nhiều đoạn hay, hoặc vào thẳng đoạn này trong bài</p>'
      + '<button type="button" class="kino-short-btn kino-short-feed-btn">▶ Lướt Shorts</button> '
      + '<button type="button" class="kino-short-btn">Vào đúng đoạn này ▸</button>'
      + '</div>';
    container.querySelector('.kino-short-feed-btn').addEventListener('click', function () {
      if (window.KinoShortsFeed) window.KinoShortsFeed.open(card);
    });
    container.querySelector('.kino-short-btn:not(.kino-short-feed-btn)').addEventListener('click', function () {
      try {
        sessionStorage.setItem('vokabelgo_kino_short', JSON.stringify({ cueText: card.example }));
      } catch (e) {}
      location.assign(card.sourceUrl);
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
  window.KinoShorts = { render: render, dailyCard: dailyCard };
})();
