/* Curated Kino scenes: lazy media, full timed dialogue and bounded playback. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clock = value => { const s = Math.floor(Math.max(0, value)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const LIKES_LS = 'vokabelgo_shorts_likes_v1';
  let overlay, scroller, observer, items = [], activeIdx = -1, generation = 0;
  let muted = false, likes = new Set(), seen = new Set(), watchTimer;
  let returnFocus, previousOverflow = '', background = [], glossResume;
  try { likes = new Set(JSON.parse(localStorage.getItem(LIKES_LS) || '[]')); } catch (_) {}
  const likeId = card => `${card.videoKey}|${card.cueId}`;
  const sceneId = card => card.id || likeId(card);
  const curated = card => Number.isFinite(card.start) && Number.isFinite(card.end);
  const partOf = card => Number(card.part) || Number(/[?&]part=(\d+)/.exec(card.sourceUrl || '')?.[1]) || 1;
  const current = (it, token = generation) => Boolean(overlay && !overlay.hidden && items[activeIdx] === it && token === generation);
  // Standalone normalized clips start at zero; lesson/caption times stay absolute.
  const mediaTime = (it, sourceSeconds) => sourceSeconds - it.offset;
  const sourceTime = it => it.video.currentTime + it.offset;

  function pool() {
    if (typeof KINO_CHAPTER_DATA === 'undefined') return [];
    const selected = Array.isArray(window.KinoShortScenes) && window.KinoShortScenes.length;
    const cards = selected ? window.KinoShortScenes : typeof VIDEO_FLASHCARDS === 'undefined' ? [] : VIDEO_FLASHCARDS;
    const ids = new Set();
    return cards.filter(card => {
      if (!card || !card.videoKey || !card.sourceUrl || !KINO_CHAPTER_DATA[card.videoKey] || card.cueId == null || !(card.focusText || card.example)) return false;
      const id = sceneId(card);
      if (ids.has(id)) return false;
      ids.add(id); return true;
    }).slice(0, selected ? cards.length : 48);
  }

  function toast(message) {
    const el = $('ksfToast');
    el.textContent = message; el.classList.add('show');
    clearTimeout(el._timer); el._timer = setTimeout(() => el.classList.remove('show'), 2200);
  }
  function saveTerm(term, meaning, example, exampleVi, card) {
    try {
      if (typeof userCards === 'undefined' || typeof saveUser !== 'function') return false;
      const fold = window.KinoLookup ? KinoLookup.fold : text => String(text || '').toLowerCase();
      if (userCards.some(c => fold(c.term) === fold(term))) { toast('Từ này đã có trong bộ thẻ của bạn rồi.'); return true; }
      userCards.push({ id: 'u_shorts_' + Date.now().toString(36), term, meaning: meaning || '', example: example || '', exampleVi: exampleVi || '',
        deck: '🎬 Từ Kino tự lưu', tags: ['Video', 'Shorts', card.videoKey], source: 'user', videoKey: card.videoKey, sourceUrl: card.sourceUrl });
      saveUser(); toast('🔖 Đã lưu “' + term + '” vào bộ thẻ.'); return true;
    } catch (_) { return false; }
  }
  function words(text, card) {
    const fragment = document.createDocumentFragment();
    const terms = String(card.term || '').toLocaleLowerCase('de').split(/\s+/);
    for (const token of String(text || '').split(/(\s+)/)) {
      if (!token || /^\s+$/.test(token)) { fragment.append(document.createTextNode(token)); continue; }
      const button = document.createElement('button'), bare = token.replace(/^[„"«»]+|[.,!?;:"“…»«]+$/g, '');
      button.type = 'button'; button.className = 'ksf-word'; button.textContent = token;
      if (terms.includes(bare.toLocaleLowerCase('de'))) button.classList.add('ksf-term');
      button.onclick = () => showGloss(bare, card, button); fragment.append(button);
    }
    return fragment;
  }

  function buildDom() {
    if (overlay) return;
    overlay = document.createElement('div'); overlay.id = 'ksfOverlay'; overlay.hidden = true; overlay.tabIndex = -1;
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'ksfTitle');
    overlay.innerHTML = '<div class="ksf-top"><span id="ksfTitle" class="ksf-logo">🎬 Kino Shorts</span><span id="ksfCounter" class="ksf-counter"></span>'
      + '<span class="ksf-top-btns"><button type="button" id="ksfMute" class="ksf-icon" aria-label="Bật/tắt tiếng" aria-pressed="false">🔊</button>'
      + '<button type="button" id="ksfClose" class="ksf-icon" aria-label="Đóng">✕</button></span></div>'
      + '<div id="ksfScroller" class="ksf-scroller" aria-label="Các cảnh phim ngắn"></div>'
      + '<div id="ksfGloss" class="ksf-gloss" role="region" aria-label="Tra từ trong cảnh" hidden></div><div id="ksfToast" class="ksf-toast" role="status"></div>';
    document.body.append(overlay); scroller = $('ksfScroller'); $('ksfClose').onclick = close;
    $('ksfMute').onclick = () => {
      muted = !muted;
      const it = items[activeIdx];
      if (it) { it.video.muted = muted; it.el.querySelector('.ksf-tap-hint').hidden = true; }
      updateMute();
    };
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); if (!$('ksfGloss').hidden) hideGloss(); else close(); return; }
      if (event.key === 'Tab') {
        const nodes = [...overlay.querySelectorAll('button, input, [tabindex="0"]')].filter(el => !el.disabled && !el.closest('[inert], [hidden]') && el.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!first) { event.preventDefault(); overlay.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === overlay)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.target.matches('input, textarea, select')) return;
      if (event.key === 'ArrowDown') { event.preventDefault(); goTo(activeIdx + 1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); goTo(activeIdx - 1); }
    });
    observer = new IntersectionObserver(entries => {
      if (overlay.hidden) return;
      const visible = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= .6);
      if (visible.length) activate(Number(visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0].target.dataset.idx));
    }, { root: scroller, threshold: [.6] });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !overlay.hidden) {
        const it = items[activeIdx];
        if (it) {
          it.intentToPlay = false; it.video.pause(); clearTimeout(watchTimer);
          if (!it.ready) {
            generation++; release(it);
            showError(it, 'Cảnh đã tạm dừng khi chị rời trang. Nhấn thử lại để xem tiếp.');
          }
        }
      }
    });
    window.addEventListener('pagehide', close);
  }
  function updateMute() { $('ksfMute').textContent = muted ? '🔇' : '🔊'; $('ksfMute').setAttribute('aria-pressed', String(muted)); }

  function itemDom(card, idx) {
    const movie = KINO_CHAPTER_DATA[card.videoKey], part = partOf(card), duration = curated(card) ? card.end - card.start : null;
    const sec = document.createElement('section'); sec.className = 'ksf-item'; sec.dataset.idx = idx; sec.dataset.sceneId = sceneId(card); sec.inert = true;
    sec.setAttribute('aria-label', card.hook || card.focusText || card.example);
    sec.innerHTML = '<div class="ksf-content"><div class="ksf-scene-heading"><p class="ksf-scene-label">' + esc(card.tone || 'Một cảnh đáng nhớ') + (duration ? ' · ' + Math.round(duration) + ' giây' : '') + '</p>'
      + '<h2 class="ksf-hook">' + esc(card.hook || 'Một câu chuyện nhỏ') + '</h2></div>'
      + '<div class="ksf-card"><video playsinline preload="none" aria-label="Cảnh phim ' + (idx + 1) + '" poster="' + esc(KinoMedia.poster(card.videoKey, part - 1)) + '"></video>'
      + '<div class="ksf-tap-hint" hidden>🔇 Chạm để bật tiếng</div><div class="ksf-progress"><span></span></div></div>'
      + '<div class="ksf-controls"><button type="button" class="ksf-play" aria-label="Phát cảnh" disabled>▶</button><span class="ksf-time"><span class="ksf-elapsed">0:00</span> / <span class="ksf-length">' + clock(duration || 0) + '</span></span>'
      + '<input class="ksf-seek" type="range" min="0" max="' + (duration || 1) + '" step="0.1" value="0" aria-label="Vị trí trong cảnh" disabled><button type="button" class="ksf-replay" aria-label="Xem lại từ đầu cảnh" disabled>↺</button></div>'
      + '<div class="ksf-status-row"><p class="ksf-status" role="status"></p><button type="button" class="ksf-retry" hidden>Thử lại</button></div>'
      + '<div class="ksf-caption"><div class="ksf-subtitle"><p class="ksf-de" lang="de"></p><p class="ksf-vi" lang="vi"></p></div>'
      + '<p class="ksf-termline"><strong>' + esc(card.term) + '</strong> · ' + esc(card.meaning) + '</p><p class="ksf-meta">' + esc(movie.catalogTitle || movie.title) + ' · Phần ' + part + (movie.levelLabel ? ' · ' + esc(movie.levelLabel) : '') + '</p></div>'
      + '<div class="ksf-rail"><button type="button" class="ksf-act ksf-like" aria-label="Thích" aria-pressed="false">🤍<span>Thích</span></button>'
      + '<button type="button" class="ksf-act ksf-save" aria-label="Lưu từ">🔖<span>Lưu từ</span></button><button type="button" class="ksf-act ksf-lesson" aria-label="Vào bài học">🎓<span>Vào bài</span></button></div>'
      + '<p class="ksf-swipe-hint">' + (idx === 0 ? 'Vuốt lên để xem cảnh tiếp ▾' : 'Vuốt để xem cảnh khác') + '</p></div>';
    const content = sec.querySelector('.ksf-content');
    const viewing = document.createElement('div'); viewing.className = 'ksf-viewing';
    const details = document.createElement('div'); details.className = 'ksf-details';
    viewing.append(sec.querySelector('.ksf-card'), sec.querySelector('.ksf-controls'), sec.querySelector('.ksf-status-row'));
    details.append(sec.querySelector('.ksf-scene-heading'), sec.querySelector('.ksf-caption'), sec.querySelector('.ksf-rail'), sec.querySelector('.ksf-swipe-hint'));
    content.append(viewing, details);
    const video = sec.querySelector('video');
    const it = { card, el: sec, video, part, start: null, end: null, offset: 0, loaded: false, ready: false, captions: [], captionKey: null, frame: null, intentToPlay: false };
    sec.querySelector('.ksf-de').append(words(card.focusText || card.example, card));
    const like = sec.querySelector('.ksf-like');
    const syncLike = () => { const on = likes.has(likeId(card)); like.classList.toggle('on', on); like.firstChild.textContent = on ? '❤️' : '🤍'; like.setAttribute('aria-pressed', String(on)); };
    like.onclick = () => { const id = likeId(card); if (likes.has(id)) likes.delete(id); else likes.add(id); try { localStorage.setItem(LIKES_LS, JSON.stringify([...likes])); } catch (_) {} syncLike(); };
    syncLike();
    sec.querySelector('.ksf-save').onclick = () => { if (!saveTerm(card.term, card.meaning, card.focusText || card.example, it.focusCue?.vi || '', card)) toast('Chưa lưu được — hãy mở một bài học rồi thử lại.'); };
    sec.querySelector('.ksf-lesson').onclick = () => jumpToLesson(card);
    sec.querySelector('.ksf-play').onclick = () => toggle(it);
    sec.querySelector('.ksf-replay').onclick = () => { if (current(it) && it.ready) { video.currentTime = mediaTime(it, it.start); update(it); startPlayback(it, generation); } };
    sec.querySelector('.ksf-retry').onclick = () => activate(idx, true);
    sec.querySelector('.ksf-seek').addEventListener('input', event => {
      if (current(it) && it.ready) { video.currentTime = mediaTime(it, Math.max(it.start, Math.min(it.end - .05, it.start + Number(event.target.value)))); update(it); }
    });
    video.addEventListener('click', () => {
      if (video.muted) { muted = false; video.muted = false; sec.querySelector('.ksf-tap-hint').hidden = true; updateMute(); if (video.paused) startPlayback(it, generation); }
      else toggle(it);
    });
    const tick = () => { it.frame = null; if (!current(it) || video.paused) return; update(it); if (!video.paused) it.frame = video.requestVideoFrameCallback(tick); };
    video.addEventListener('play', () => { if (!current(it)) { video.pause(); return; } update(it); if (video.requestVideoFrameCallback && it.frame === null) it.frame = video.requestVideoFrameCallback(tick); });
    video.addEventListener('pause', () => { stopFrame(it); update(it); clearTimeout(watchTimer); });
    for (const event of ['timeupdate', 'seeked']) video.addEventListener(event, () => update(it));
    video.addEventListener('ended', () => { if (current(it) && it.intentToPlay) { video.currentTime = mediaTime(it, it.start); startPlayback(it, generation); } });
    video.addEventListener('error', () => { if (current(it)) showError(it, 'Chưa tải được cảnh. Chị thử lại nhé.'); });
    video.addEventListener('loadedmetadata', () => { if (video.videoWidth && video.videoHeight) sec.style.setProperty('--ksf-ratio', video.videoWidth / video.videoHeight); });
    if (card.videoKey === 'sakura_s01e01') sec.style.setProperty('--ksf-ratio', 4 / 3);
    return it;
  }
  function stopFrame(it) { if (it.frame !== null && it.video.cancelVideoFrameCallback) it.video.cancelVideoFrameCallback(it.frame); it.frame = null; }
  function release(it) {
    it.intentToPlay = false; it.ready = false; stopFrame(it); KinoMedia.release(it.video);
    for (const el of it.el.querySelectorAll('.ksf-play, .ksf-seek, .ksf-replay')) el.disabled = true;
  }
  function update(it) {
    if (it.start === null || it.end === null || !current(it)) return;
    const v = it.video;
    if (it.ready && !v.seeking && (sourceTime(it) >= it.end || sourceTime(it) < it.start - .1)) v.currentTime = mediaTime(it, it.start);
    const time = sourceTime(it);
    const elapsed = Math.max(0, Math.min(it.end, time) - it.start), duration = it.end - it.start;
    it.el.querySelector('.ksf-progress span').style.width = `${Math.min(100, elapsed / duration * 100)}%`;
    it.el.querySelector('.ksf-elapsed').textContent = clock(elapsed);
    const seek = it.el.querySelector('.ksf-seek'); seek.value = elapsed; seek.setAttribute('aria-valuetext', `${clock(elapsed)} trên ${clock(duration)}`);
    const play = it.el.querySelector('.ksf-play'); play.textContent = v.paused ? '▶' : 'Ⅱ'; play.setAttribute('aria-label', v.paused ? 'Phát cảnh' : 'Tạm dừng cảnh');
    const cue = it.captions.find(c => time >= c.start && time < c.end), key = cue ? `${cue.id}:${cue.start}:${cue.text}` : '';
    it.currentCue = cue || null;
    if (key !== it.captionKey) {
      it.captionKey = key; it.el.querySelector('.ksf-de').replaceChildren(words(cue?.text || '', it.card)); it.el.querySelector('.ksf-vi').textContent = cue?.vi || '';
      it.el.querySelector('.ksf-subtitle').classList.toggle('ksf-focus-cue', Boolean(cue && cue.id === it.card.cueId));
    }
  }
  function showError(it, message) { it.intentToPlay = false; it.video.pause(); it.el.querySelector('.ksf-status').textContent = message; it.el.querySelector('.ksf-retry').hidden = false; }
  async function ensureScene(it) {
    if (it.loaded) return;
    await KinoData.load(it.card.videoKey);
    const cues = KinoData.cues(it.card.videoKey) || [], cue = cues.find(c => c.id === it.card.cueId);
    if (!cue) throw new Error('Chưa tìm được lời thoại của cảnh. Chị thử lại nhé.');
    const start = curated(it.card) ? it.card.start : Math.max(0, cue.start - .25), end = curated(it.card) ? it.card.end : cue.end + .45;
    if (!(start >= 0 && end > start && cue.start >= start && cue.end <= end + .1)) throw new Error('Mốc cảnh chưa khớp lời thoại. Chị chọn cảnh khác nhé.');
    it.start = start; it.end = end; it.focusCue = cue;
    if (it.card.clipSrc && (!Number.isFinite(it.card.clipDuration) || Math.abs(it.card.clipDuration - (end - start)) > .1)) throw new Error('Thời lượng cảnh chưa khớp. Chị chọn cảnh khác nhé.');
    it.offset = it.card.clipSrc ? start : 0;
    it.video.dataset.sourceOffset = it.offset;
    it.captions = (KinoData.captions(it.card.videoKey) || cues).filter(c => c.start < end && c.end > start);
    it.el.dataset.start = start; it.el.dataset.end = end;
    it.el.querySelector('.ksf-length').textContent = clock(end - start); it.el.querySelector('.ksf-seek').max = end - start; it.loaded = true;
  }
  async function startPlayback(it, token) {
    if (!current(it, token) || !it.ready || document.hidden) return;
    it.intentToPlay = true;
    try { await it.video.play(); }
    catch (error) {
      if (!current(it, token) || document.hidden) return;
      if (error.name === 'NotAllowedError' && !it.video.muted) {
        it.video.muted = true; muted = true; updateMute(); it.el.querySelector('.ksf-tap-hint').hidden = false;
        try { await it.video.play(); } catch (_) { if (current(it, token)) showError(it, 'Chạm nút phát để xem cảnh.'); }
      } else if (error.name !== 'AbortError') showError(it, 'Chưa phát được cảnh. Chị thử lại nhé.');
    }
    if (!current(it, token) || document.hidden) { if (!current(it) || document.hidden) it.video.pause(); return; }
    update(it); clearTimeout(watchTimer);
    const id = sceneId(it.card);
    if (!it.video.paused && !seen.has(id)) watchTimer = setTimeout(() => {
      if (!current(it, token) || it.video.paused) return;
      seen.add(id);
      try { window.VokabelEvidence?.record('kino', 'short', { ref: it.card.videoKey, termKeys: [String(it.card.term || '').toLowerCase()] }); } catch (_) {}
    }, 2500);
  }
  function toggle(it) { if (!current(it) || !it.ready) return; if (!it.video.paused) { it.intentToPlay = false; it.video.pause(); } else startPlayback(it, generation); }
  async function activate(idx, retry = false) {
    if (!overlay || overlay.hidden || !items[idx] || idx === activeIdx && !retry) return;
    const token = ++generation; clearTimeout(watchTimer); hideGloss(false);
    const prev = items[activeIdx]; if (prev) release(prev);
    activeIdx = idx; const it = items[idx];
    items.forEach(item => { item.el.inert = item !== it; item.el.setAttribute('aria-hidden', String(item !== it)); });
    $('ksfCounter').textContent = `${idx + 1} / ${items.length}`;
    it.el.querySelector('.ksf-status').textContent = 'Đang mở cảnh…'; it.el.querySelector('.ksf-retry').hidden = true; it.captionKey = null;
    try {
      await ensureScene(it); if (!current(it, token)) return;
      it.video.muted = muted; await KinoMedia.prepare(it.video, mediaTime(it, it.start), it.card.videoKey, it.card.clipSrc); if (!current(it, token)) return;
      if (mediaTime(it, it.end) > it.video.duration + .1) throw new Error('Mốc cảnh vượt thời lượng phim. Chị chọn cảnh khác nhé.');
      it.ready = true; for (const el of it.el.querySelectorAll('.ksf-play, .ksf-seek, .ksf-replay')) el.disabled = false;
      it.el.querySelector('.ksf-status').textContent = ''; update(it); await startPlayback(it, token);
    } catch (error) { if (current(it, token) && error.name !== 'AbortError') showError(it, error.message || 'Chưa mở được cảnh. Chị thử lại nhé.'); }
  }

  function hideGloss(resume = true) {
    const state = glossResume; glossResume = null; if ($('ksfGloss')) $('ksfGloss').hidden = true;
    if (resume && state && current(state.it, state.token)) { if (state.playing) startPlayback(state.it, state.token); if (state.button?.isConnected) state.button.focus({ preventScroll: true }); }
  }
  function showGloss(word, card, button) {
    const it = items[activeIdx]; if (!it || !current(it)) return;
    const playing = !it.video.paused; it.intentToPlay = false; it.video.pause(); glossResume = { it, token: generation, playing, button };
    let hit; try { if (window.KinoLookup && typeof allCards === 'function') hit = KinoLookup.resolve(word, allCards()); } catch (_) {}
    const fold = value => String(value || '').toLocaleLowerCase('de'), focusWord = fold(card.term).split(/\s+/).includes(fold(word));
    const term = hit?.card.term || (focusWord ? card.term : word), meaning = hit?.card.meaning || (focusWord ? card.meaning : '');
    const g = $('ksfGloss');
    g.innerHTML = '<div class="ksf-gloss-main"><strong>' + esc(term) + '</strong><span>' + esc(meaning || 'Chưa có sẵn nghĩa cho từ này.') + '</span></div><div class="ksf-gloss-btns">'
      + (meaning ? '<button type="button" id="ksfGlossSave">🔖 Lưu từ này</button>' : '')
      + '<button type="button" id="ksfGlossLesson">🎓 Vào bài học để tra kỹ</button><button type="button" id="ksfGlossClose">Đóng</button></div>';
    g.hidden = false;
    if ($('ksfGlossSave')) $('ksfGlossSave').onclick = () => saveTerm(term, meaning, it.currentCue?.text || card.focusText || card.example, it.currentCue?.vi || it.focusCue?.vi || '', card);
    $('ksfGlossLesson').onclick = () => jumpToLesson(card); $('ksfGlossClose').onclick = () => hideGloss(); $('ksfGlossClose').focus({ preventScroll: true });
  }
  function jumpToLesson(card) {
    try { sessionStorage.setItem('vokabelgo_kino_short', JSON.stringify({ cueText: card.focusText || card.example, cueId: card.cueId, videoKey: card.videoKey, createdAt: Date.now() })); } catch (_) {}
    close(); location.assign(card.sourceUrl);
  }
  function goTo(idx) { if (items[idx]) items[idx].el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }
  function open(startCard) {
    buildDom(); const list = pool(); if (!list.length) return;
    if (!overlay.hidden) close();
    const selected = startCard ? list.findIndex(card => sceneId(card) === sceneId(startCard)) : -1;
    if (selected > 0) list.unshift(...list.splice(selected, 1));
    generation++; observer.disconnect(); items.forEach(release); scroller.replaceChildren();
    items = list.map(itemDom); items.forEach(it => { scroller.append(it.el); observer.observe(it.el); }); activeIdx = -1; seen = new Set();
    returnFocus = document.activeElement; previousOverflow = document.body.style.overflow;
    background = [...document.body.children].filter(el => el !== overlay).map(el => ({ el, inert: el.inert })); background.forEach(({ el }) => { el.inert = true; });
    document.body.style.overflow = 'hidden'; overlay.hidden = false; scroller.scrollTop = 0; updateMute(); overlay.focus({ preventScroll: true });
    const token = generation; requestAnimationFrame(() => { if (!overlay.hidden && generation === token) activate(0); });
  }
  function close() {
    if (!overlay || overlay.hidden) return;
    generation++; overlay.hidden = true; observer.disconnect(); clearTimeout(watchTimer); clearTimeout($('ksfToast')._timer); $('ksfToast').classList.remove('show'); hideGloss(false);
    items.forEach(release); activeIdx = -1;
    background.forEach(({ el, inert }) => { el.inert = inert; }); background = []; document.body.style.overflow = previousOverflow;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  window.KinoShortsFeed = { open, close };
})();
