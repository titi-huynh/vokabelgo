/* VokabelGo — Kino Shorts FEED: lướt dọc kiểu Shorts qua các câu thoại hay
   nhất của catalog. Mỗi thẻ cuộn là một câu (từ VIDEO_FLASHCARDS), phát lặp
   đúng đoạn của câu đó trong phim; phụ đề Đức bấm-từ-để-tra, phụ đề Việt,
   nút thích / lưu từ / vào bài học. Dữ liệu lời thoại chỉ tải khi mở feed
   (KinoData.load theo từng phim) — catalog vẫn nhẹ như cũ. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const LIKES_LS = 'vokabelgo_shorts_likes_v1';
  let overlay = null, scroller = null, items = [], activeIdx = -1;
  let muted = false, likes = new Set(), seen = new Set(), watchTimer = null;

  try { likes = new Set(JSON.parse(localStorage.getItem(LIKES_LS) || '[]')); } catch (e) {}
  const likeId = c => c.videoKey + '|' + c.cueId;
  function persistLikes() { try { localStorage.setItem(LIKES_LS, JSON.stringify([...likes])); } catch (e) {} }
  function dayNumber() { return Math.floor(Date.now() / 86400000); }
  function shuffleSeeded(arr, seed) {
    const a = [...arr];
    let s = seed * 2654435761 % 4294967296;
    const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function pool() {
    if (typeof VIDEO_FLASHCARDS === 'undefined' || typeof KINO_CHAPTER_DATA === 'undefined') return [];
    const seenKeys = new Set();
    return VIDEO_FLASHCARDS.filter(c => {
      if (!c || !c.videoKey || !c.example || !c.sourceUrl || !KINO_CHAPTER_DATA[c.videoKey] || c.cueId == null) return false;
      const k = likeId(c);
      if (seenKeys.has(k)) return false;
      seenKeys.add(k);
      return true;
    });
  }
  function hueFor(key) { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
  function partOf(card) {
    const m = /[?&]part=(\d+)/.exec(card.sourceUrl || '');
    return m ? Number(m[1]) : 1;
  }
  function toast(msg) {
    const t = $('ksfToast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function saveTerm(term, meaning, example, viText, key, part) {
    try {
      if (typeof userCards === 'undefined' || typeof saveUser !== 'function') return false;
      const fold = window.KinoLookup ? KinoLookup.fold : (s => String(s || '').toLowerCase());
      if (userCards.some(c => fold(c.term) === fold(term))) { toast('Từ này đã có trong bộ thẻ của bạn rồi.'); return true; }
      userCards.push({
        id: 'u_shorts_' + Date.now().toString(36), term, meaning: meaning || '', example: example || '',
        exampleVi: viText || '', deck: '🎬 Từ Kino tự lưu', tags: ['Video', 'Shorts', key],
        source: 'user', videoKey: key, sourceUrl: '?kino=' + key + '&part=' + part
      });
      saveUser();
      toast('🔖 Đã lưu “' + term + '” vào bộ thẻ.');
      return true;
    } catch (e) { return false; }
  }

  function buildDom() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'ksfOverlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="ksf-top"><span class="ksf-logo">🎬 Kino Shorts</span>'
      + '<span id="ksfCounter" class="ksf-counter"></span>'
      + '<span class="ksf-top-btns"><button type="button" id="ksfMute" class="ksf-icon" aria-label="Bật/tắt tiếng">🔊</button>'
      + '<button type="button" id="ksfClose" class="ksf-icon" aria-label="Đóng">✕</button></span></div>'
      + '<div id="ksfScroller" class="ksf-scroller"></div>'
      + '<div id="ksfGloss" class="ksf-gloss" hidden></div>'
      + '<div id="ksfToast" class="ksf-toast" role="status"></div>';
    document.body.append(overlay);
    scroller = $('ksfScroller');
    $('ksfClose').onclick = close;
    $('ksfMute').onclick = () => {
      muted = !muted;
      $('ksfMute').textContent = muted ? '🔇' : '🔊';
      const it = items[activeIdx];
      if (it && it.video) it.video.muted = muted;
    };
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') { e.preventDefault(); goTo(activeIdx + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goTo(activeIdx - 1); }
    });
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting && en.intersectionRatio >= 0.6) activate(Number(en.target.dataset.idx));
      }
    }, { root: scroller, threshold: [0.6] });
    overlay._io = io;
  }

  function itemDom(card, idx) {
    const movie = KINO_CHAPTER_DATA[card.videoKey];
    const part = partOf(card);
    const sec = document.createElement('section');
    sec.className = 'ksf-item';
    sec.dataset.idx = idx;
    sec.style.setProperty('--ksf-hue', hueFor(card.videoKey));
    const termLow = String(card.term || '').toLowerCase();
    const deHtml = esc(card.example).split(/(\s+)/).map(tok => {
      const bare = tok.replace(/^[„"«»\s]+|[.,!?;:"“…»«]+$/g, '').toLowerCase();
      const isTerm = bare && termLow.includes(bare) || bare === termLow;
      if (/^\s+$/.test(tok) || !tok) return tok;
      return '<button type="button" class="ksf-word' + (isTerm ? ' ksf-term' : '') + '" data-word="' + esc(tok.replace(/["„“”«»]/g, '')) + '">' + tok + '</button>';
    }).join('');
    sec.innerHTML =
      '<div class="ksf-card">'
      + '<video playsinline preload="none" poster="' + esc(KinoMedia.poster(card.videoKey, part - 1)) + '"></video>'
      + '<div class="ksf-tap-hint" hidden>🔇 Chạm vào video để bật tiếng</div>'
      + '<div class="ksf-progress"><span></span></div>'
      + '</div>'
      + '<div class="ksf-caption">'
      + '<p class="ksf-de">' + deHtml + '</p>'
      + '<p class="ksf-termline">Từ nổi bật: <strong>' + esc(card.term) + '</strong> — ' + esc(card.meaning || '') + '</p>'
      + '<p class="ksf-meta">' + esc(movie.catalogTitle || movie.title) + ' · Phần ' + part + (movie.levelLabel ? ' · ' + esc(movie.levelLabel) : '') + '</p>'
      + '</div>'
      + '<div class="ksf-rail">'
      + '<button type="button" class="ksf-act ksf-like" aria-label="Thích">🤍<span>Thích</span></button>'
      + '<button type="button" class="ksf-act ksf-save" aria-label="Lưu từ">🔖<span>Lưu từ</span></button>'
      + '<button type="button" class="ksf-act ksf-lesson" aria-label="Vào bài học">🎓<span>Vào bài</span></button>'
      + '</div>'
      + (idx === 0 ? '<div class="ksf-swipe-hint">Vuốt lên để xem đoạn tiếp ▾</div>' : '');
    const video = sec.querySelector('video');
    const it = { card, el: sec, video, start: null, end: null, loaded: false, part };
    sec.querySelector('.ksf-like').onclick = e => {
      const btn = e.currentTarget;
      const id = likeId(card);
      const on = !likes.has(id);
      if (on) likes.add(id); else likes.delete(id);
      persistLikes();
      btn.classList.toggle('on', on);
      btn.firstChild.textContent = on ? '❤️' : '🤍';
      if (on) { btn.classList.add('pop'); setTimeout(() => btn.classList.remove('pop'), 350); }
    };
    if (likes.has(likeId(card))) {
      const b = sec.querySelector('.ksf-like');
      b.classList.add('on'); b.firstChild.textContent = '❤️';
    }
    sec.querySelector('.ksf-save').onclick = () => {
      if (!saveTerm(card.term, card.meaning, card.example, '', card.videoKey, part)) toast('Chưa lưu được — hãy mở một bài học rồi thử lại.');
    };
    sec.querySelector('.ksf-lesson').onclick = () => jumpToLesson(card);
    sec.querySelectorAll('.ksf-word').forEach(w => w.onclick = () => showGloss(w.dataset.word, card));
    video.addEventListener('click', () => {
      if (video.muted) { video.muted = false; muted = false; $('ksfMute').textContent = '🔊'; sec.querySelector('.ksf-tap-hint').hidden = true; }
      else if (video.paused) video.play().catch(() => {}); else video.pause();
    });
    video.addEventListener('timeupdate', () => {
      if (it.end == null) return;
      if (video.currentTime >= it.end) video.currentTime = it.start;
      const bar = sec.querySelector('.ksf-progress span');
      if (bar) bar.style.width = Math.min(100, Math.max(0, (video.currentTime - it.start) / (it.end - it.start) * 100)) + '%';
    });
    return it;
  }

  function showGloss(word, card) {
    const g = $('ksfGloss');
    let hit = null;
    try {
      if (window.KinoLookup && typeof allCards === 'function') hit = KinoLookup.resolve(word, allCards());
    } catch (e) {}
    const meaning = hit ? (hit.card.meaning || '') : '';
    g.innerHTML = '<div class="ksf-gloss-main"><strong>' + esc(hit ? hit.card.term : word) + '</strong>'
      + (meaning ? '<span>' + esc(meaning) + '</span>' : '<span class="ksf-gloss-none">Chưa có sẵn nghĩa cho từ này.</span>') + '</div>'
      + '<div class="ksf-gloss-btns">'
      + (meaning ? '<button type="button" id="ksfGlossSave" class="btn">🔖 Lưu từ này</button>' : '')
      + '<button type="button" id="ksfGlossLesson" class="btn">🎓 Vào bài học để tra kỹ</button>'
      + '<button type="button" id="ksfGlossClose" class="btn">Đóng</button></div>';
    g.hidden = false;
    const save = $('ksfGlossSave');
    if (save) save.onclick = () => { saveTerm(hit.card.term, meaning, card.example, '', card.videoKey, partOf(card)); };
    $('ksfGlossLesson').onclick = () => jumpToLesson(card);
    $('ksfGlossClose').onclick = () => { g.hidden = true; };
  }

  function jumpToLesson(card) {
    try { sessionStorage.setItem('vokabelgo_kino_short', JSON.stringify({ cueText: card.example })); } catch (e) {}
    close();
    location.assign(card.sourceUrl);
  }

  async function ensureCue(it) {
    if (it.loaded) return;
    it.loaded = true;
    try {
      await KinoData.load(it.card.videoKey);
      const cues = KinoData.cues(it.card.videoKey) || [];
      const cue = cues.find(c => c.id === it.card.cueId);
      if (cue) {
        it.start = Math.max(0, cue.start - 0.25);
        it.end = cue.end + 0.45;
        const viEl = it.el.querySelector('.ksf-vi');
        if (cue.vi && !viEl) {
          const p = document.createElement('p');
          p.className = 'ksf-vi'; p.textContent = cue.vi;
          it.el.querySelector('.ksf-termline').before(p);
        }
      }
    } catch (e) { /* thiếu mốc: vẫn phát từ đầu phần */ }
    if (it.start == null) { it.start = 0; it.end = 15; }
  }

  async function activate(idx) {
    if (idx === activeIdx || !items[idx]) return;
    const prev = items[activeIdx];
    if (prev && prev.video) prev.video.pause();
    activeIdx = idx;
    const it = items[idx];
    $('ksfCounter').textContent = (idx + 1) + ' / ' + items.length;
    const hint = it.el.querySelector('.ksf-swipe-hint');
    if (hint && idx > 0) hint.remove();
    await ensureCue(it);
    const v = it.video;
    if (!v.getAttribute('src')) v.src = KinoMedia.source(it.card.videoKey);
    v.muted = muted;
    try { v.currentTime = it.start; } catch (e) {}
    v.play().then(() => {
      if (v.muted) { const h = it.el.querySelector('.ksf-tap-hint'); if (h) h.hidden = false; }
    }).catch(() => {
      v.muted = true;
      v.play().catch(() => {});
      const h = it.el.querySelector('.ksf-tap-hint'); if (h) h.hidden = false;
    });
    clearTimeout(watchTimer);
    const id = likeId(it.card);
    if (!seen.has(id)) {
      watchTimer = setTimeout(() => {
        seen.add(id);
        try { if (window.VokabelEvidence) VokabelEvidence.record('kino', 'short', { ref: it.card.videoKey, termKeys: [String(it.card.term || '').toLowerCase()] }); } catch (e) {}
      }, 2500);
    }
  }

  function goTo(idx) {
    if (!items[idx]) return;
    items[idx].el.scrollIntoView({ behavior: 'smooth' });
  }

  function open(startCard) {
    buildDom();
    let list = shuffleSeeded(pool(), dayNumber());
    if (!list.length) { toast('Chưa có đoạn ngắn nào.'); return; }
    if (startCard) {
      const i = list.findIndex(c => likeId(c) === likeId(startCard));
      if (i > 0) { const [c] = list.splice(i, 1); list.unshift(c); }
      else if (i < 0) list.unshift(startCard);
    }
    list = list.slice(0, 48);
    scroller.replaceChildren();
    items = list.map((card, idx) => {
      const it = itemDom(card, idx);
      scroller.append(it.el);
      overlay._io.observe(it.el);
      return it;
    });
    activeIdx = -1; seen = new Set();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    overlay.tabIndex = -1; overlay.focus({ preventScroll: true });
    requestAnimationFrame(() => activate(0));
  }

  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    items.forEach(it => { if (it.video) it.video.pause(); });
    clearTimeout(watchTimer);
    const g = $('ksfGloss'); if (g) g.hidden = true;
  }

  window.KinoShortsFeed = { open, close };
})();
