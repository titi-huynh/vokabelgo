/* The catalog stays static and light; subtitles/media load only after a click. */
(function () {
  'use strict';
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function dailyCard() {
    const scenes = window.KinoShortScenes;
    if (Array.isArray(scenes) && scenes.length) return scenes[Math.floor(Date.now() / 86400000) % scenes.length];
    return null;
  }
  function remember(card) {
    try { sessionStorage.setItem('vokabelgo_kino_short', JSON.stringify({ videoKey: card.videoKey, cueId: card.cueId, cueText: card.focusText || card.example, createdAt: Date.now() })); } catch (_) {}
  }
  function render(container) {
    const card = dailyCard();
    if (!card) { container.hidden = true; return; }
    const movie = KINO_CHAPTER_DATA[card.videoKey], count = window.KinoShortScenes.length;
    container.hidden = false;
    container.innerHTML = '<img class="kino-short-poster" src="' + esc(KinoMedia.poster(card.videoKey, card.part - 1)) + '" alt="" width="480" height="270">'
      + '<div class="kino-short-body"><p class="kino-short-eyebrow">🎬 ' + count + ' CẢNH ĐÁNG XEM · 17–34 GIÂY</p>'
      + '<strong class="kino-short-title">' + esc(card.hook) + '</strong>'
      + '<p class="kino-short-quote" lang="de">„' + esc(card.focusText) + '“</p>'
      + '<p class="kino-short-vi"><strong>' + esc(card.term) + '</strong> — ' + esc(card.meaning) + '</p>'
      + '<p class="kino-short-meta">' + esc(movie.catalogTitle || movie.title) + ' · ' + esc(card.tone) + ' · ' + Math.round(card.end - card.start) + ' giây<br>Có mở đầu, lời đáp và phụ đề Đức–Việt theo từng câu.</p>'
      + '<button type="button" class="kino-short-btn kino-short-feed-btn">▶ Xem ' + count + ' cảnh</button> '
      + '<button type="button" class="kino-short-btn kino-short-lesson-btn">Học câu này ▸</button></div>';
    container.querySelector('.kino-short-feed-btn').onclick = () => window.KinoShortsFeed?.open(card);
    container.querySelector('.kino-short-lesson-btn').onclick = () => { remember(card); location.assign(card.sourceUrl); };
  }
  // A short may feature a cue outside the seven suggestions. Expose that exact
  // cue instead of searching a hidden timeline or starting at the chapter head.
  let attempts = 0, pending;
  try { pending = JSON.parse(sessionStorage.getItem('vokabelgo_kino_short') || 'null'); } catch (_) {}
  if (pending) {
    if (pending.createdAt && Date.now() - pending.createdAt > 3600000) {
      try { sessionStorage.removeItem('vokabelgo_kino_short'); } catch (_) {}
    } else {
      const timer = setInterval(() => {
        const opened = typeof KinoChapters !== 'undefined' && KinoChapters.focusShortCue?.(pending);
        if (opened || ++attempts >= 150) {
          clearInterval(timer);
          try { sessionStorage.removeItem('vokabelgo_kino_short'); } catch (_) {}
        }
      }, 120);
    }
  }
  window.KinoShorts = { render, dailyCard };
})();
