/* Shared movie chapters use the original media and independent per-film progress. */
const KinoChapters = (() => {
  const initialQuery = new URLSearchParams(location.search);
  if (new URLSearchParams(location.search).has('kino') && 'scrollRestoration' in history) history.scrollRestoration = 'manual';
  let videoKey = 'peppa_supermarkt';
  let config = KINO_CHAPTER_DATA[videoKey];
  let chapters = config.chapters;
  let storageKey = config.storageKey;
  const states = new Map();
  function loadState(key) {
    if (states.has(key)) return states.get(key);
    const conf = KINO_CHAPTER_DATA[key];
    const defaultMode = conf.defaultMode === 'all' ? 'all' : 'light';
    const result = { chapter: 0, mode: defaultMode, completed: [], watched: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(conf.storageKey));
      if (saved && typeof saved === 'object') {
        result.chapter = Number.isInteger(saved.chapter) && saved.chapter >= 0 && saved.chapter < conf.chapters.length ? saved.chapter : 0;
        result.mode = ['all', 'light'].includes(saved.mode) ? saved.mode : defaultMode;
        result.completed = Array.isArray(saved.completed) ? saved.completed.filter(Number.isInteger) : [];
        result.watched = Array.isArray(saved.watched) ? saved.watched.filter(Number.isInteger) : [];
        result.imported = saved.imported === true;
        result.alignmentVersion = saved.alignmentVersion;
        result.practiceModeVersion = saved.practiceModeVersion;
        result.contentVersion = saved.contentVersion;
      }
    } catch (_) { /* Use in-memory progress if storage is unavailable. */ }
    // The first Hans preview silently selected seven highlights. Move existing
    // learners to the complete script once, keeping every completed cue intact.
    if (conf.practiceModeVersion && result.practiceModeVersion !== conf.practiceModeVersion) {
      result.mode = defaultMode;
      result.practiceModeVersion = conf.practiceModeVersion;
      try { localStorage.setItem(conf.storageKey, JSON.stringify(result)); } catch (_) {}
    }
    states.set(key, result);
    return result;
  }
  let state = loadState(videoKey);
  let source = [];
  let active = false;
  let watchBounds = null;
  let panel;
  let captionsVisible = true;
  let activity = 'discover';
  let currentLesson = '';
  // Bản thử "nghe mù trước" (2026-10-26): ở bước Nghe & hiểu, chữ Đức và nghĩa
  // Việt chỉ hiện khi người học tự bấm; trạng thái đặt lại mỗi khi đổi câu.
  let listenRevealKey = '';
  let listenRevealDe = false;
  let listenRevealVi = false;

  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
  }
  function clock(value) {
    const seconds = Math.round(value);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function selected(chapter = chapters[state.chapter], mode = state.mode) {
    return source.filter(seg => mode === 'light' ? chapter.picks.includes(seg.id) : seg.start >= chapter.start && seg.end <= chapter.end);
  }
  function doneCount(segments) {
    return segments.filter(seg => state.completed.includes(seg.id)).length;
  }
  function ensurePanel() {
    if (panel) return;
    panel = document.createElement('section');
    panel.id = 'kinoPeppaChapters';
    panel.className = 'peppa-chapters';
    panel.setAttribute('aria-label', 'Học Peppa theo từng phần');
    panel.innerHTML = `
      <div class="peppa-heading"><div><p class="peppa-eyebrow">PEPPA WUTZ · MỖI LẦN MỘT CHÚT</p>
        <h2>Các phần của tập phim</h2></div><span id="peppaOverall"></span></div>
      <p class="peppa-selector-label">Chọn phần muốn học <span class="peppa-save-hint">Tự động lưu tiến độ</span><span class="peppa-swipe-hint">Vuốt để xem các phần →</span></p>
      <div class="peppa-parts" role="group" aria-label="Chọn phần phim"></div>
      <div class="peppa-current"><div><p class="peppa-eyebrow" id="peppaPartMeta"></p>
        <h3 id="peppaPartTitle"></h3><p id="peppaPartGoal"></p></div>
        <div class="peppa-actions"><button type="button" class="peppa-watch" id="peppaWatch">▶ Xem phần này</button>
        <button type="button" class="peppa-practice" id="peppaPractice">Luyện 7 câu →</button></div></div>
      <div class="peppa-options"><div role="group" aria-label="Mức luyện tập">
        <button type="button" id="peppaLight">7 câu gợi ý</button>
        <button type="button" id="peppaAll">Thêm câu thoại</button></div>
        <span id="peppaWatchStatus"></span></div>
      <div class="peppa-finished" id="peppaFinished" role="status" hidden>
        <div><strong id="peppaFinishedTitle"></strong><p>Bạn có thể nghỉ tại đây, xem lại phim hoặc chọn một phần khác.</p></div>
        <button type="button" id="peppaNextPart">Sang phần tiếp →</button></div>`;
    document.querySelector('.kino-v3-progress-card').before(panel);
    panel.querySelector('#peppaWatch').onclick = watch;
    panel.querySelector('#peppaPractice').onclick = practice;
    panel.querySelector('#peppaLight').onclick = () => change(state.chapter, 'light');
    panel.querySelector('#peppaAll').onclick = () => change(state.chapter, 'all');
    panel.querySelector('#peppaNextPart').onclick = () => change(state.chapter + 1, config.defaultMode === 'all' ? state.mode : 'light', true);
    setupLearningUI();
    const note = document.createElement('div');
    note.id = 'peppaWatchNote';
    note.className = 'peppa-watch-note';
    note.hidden = true;
    note.innerHTML = '<span id="peppaWatchMessage">Cứ xem và hiểu câu chuyện. Viết hoặc nói đều tùy bạn.</span><button type="button" data-activity="write">Thử viết</button><button type="button" data-activity="speak">Thử nói</button>';
    note.querySelectorAll('button').forEach(button => { button.onclick = () => { closeKinoFullMovieModal(); practice(button.dataset.activity); }; });
    document.querySelector('#kinoFullMovieModal .kino-full-modal-header').after(note);
    const modal = document.getElementById('kinoFullMovieModal');
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); closeKinoFullMovieModal(); }
    });
    // Sentinels preserve native video control keyboard navigation inside the dialog.
    for (const edge of ['start', 'end']) {
      const sentinel = document.createElement('span');
      sentinel.tabIndex = 0;
      sentinel.className = 'kino-focus-edge';
      sentinel.addEventListener('focus', () => {
        const controls = [...modal.querySelectorAll('button, input, video[controls]')].filter(node => !node.disabled && node.offsetParent !== null);
        controls[edge === 'start' ? controls.length - 1 : 0]?.focus();
      });
      if (edge === 'start') modal.prepend(sentinel); else modal.append(sentinel);
    }
    const player = document.getElementById('kinoFullPlayer');
    const caption = document.createElement('div');
    caption.id = 'peppaWatchCaption';
    caption.className = 'peppa-watch-caption';
    caption.hidden = true;
    caption.innerHTML = '<div id="peppaWatchDe" lang="de"></div><div id="peppaWatchVi" lang="vi"></div>';
    document.querySelector('#kinoFullMovieModal .kino-full-modal-body').append(caption);
    const controls = document.createElement('div');
    controls.id = 'peppaWatchControls';
    controls.className = 'peppa-watch-controls';
    controls.hidden = true;
    controls.innerHTML = '<button type="button" id="peppaWatchPlay" aria-label="Tạm dừng phần phim">Ⅱ</button><span id="peppaWatchClock">0:00</span><input id="peppaWatchSeek" type="range" min="0" step="0.1" value="0" aria-label="Vị trí trong phần phim"><span id="peppaWatchLength"></span><button type="button" id="peppaWatchCC" aria-label="Phụ đề Đức và Việt" aria-pressed="true">CC</button>';
    document.querySelector('#kinoFullMovieModal .kino-full-modal-body').after(controls);
    const playButton = controls.querySelector('button');
    document.getElementById('peppaWatchCC').onclick = () => {
      captionsVisible = !captionsVisible;
      document.getElementById('peppaWatchCC').setAttribute('aria-pressed', String(captionsVisible));
      updateCaptions(player.currentTime);
    };
    playButton.onclick = () => {
      if (!watchBounds) return;
      if (player.paused) {
        if (player.currentTime >= watchBounds.end - 0.1) player.currentTime = watchBounds.start;
        player.play().catch(() => {});
      } else player.pause();
    };
    const seek = controls.querySelector('input');
    seek.addEventListener('input', () => {
      if (watchBounds) player.currentTime = watchBounds.start + Number(seek.value);
    });
    const refreshPlayButton = () => {
      playButton.textContent = player.paused ? '▶' : 'Ⅱ';
      playButton.setAttribute('aria-label', player.paused ? 'Phát phần phim' : 'Tạm dừng phần phim');
    };
    player.addEventListener('play', refreshPlayButton);
    player.addEventListener('pause', refreshPlayButton);
    player.addEventListener('timeupdate', () => {
      if (!watchBounds) return;
      updateCaptions(player.currentTime);
      const elapsed = Math.max(0, Math.min(watchBounds.end, player.currentTime) - watchBounds.start);
      seek.value = elapsed;
      document.getElementById('peppaWatchClock').textContent = clock(elapsed);
      if (player.currentTime < watchBounds.end - 0.1) watchBounds.finished = false;
      if (player.currentTime >= watchBounds.end - 0.04 && !watchBounds.finished) {
        watchBounds.finished = true;
        player.pause();
        player.currentTime = watchBounds.end;
        markWatched(watchBounds.chapter);
        document.getElementById('peppaWatchMessage').textContent = 'Đã xem hết phần này. Bạn có thể xem lại, thử viết hoặc thử nói.';
      }
    });
    player.addEventListener('seeking', () => {
      if (!watchBounds) return;
      if (player.currentTime < watchBounds.start) player.currentTime = watchBounds.start;
      else if (player.currentTime > watchBounds.end) player.currentTime = watchBounds.end;
    });
    // Media time callbacks avoid the ~250 ms delay of timeupdate at sentence ends.
    bindFrameGuard(player, time => {
      if (!watchBounds) return;
      updateCaptions(time);
      if (time >= watchBounds.end) { player.pause(); player.currentTime = watchBounds.end; }
    });
    const practicePlayer = document.getElementById('kinoMainVideo');
    bindFrameGuard(practicePlayer, time => {
      if (!active || kinoIsDubbing) return;
      const segment = PIZZASCHWESTER_72_SEGMENTS[kinoCurrentIndex];
      if (segment && time >= segment.end) { practicePlayer.pause(); practicePlayer.currentTime = segment.end; }
    });
  }
  function setupLearningUI() {
    // Keep secondary tools available without competing with the learning actions.
    const toolbar = document.querySelector('.kino-v3-top-actions');
    const extra = document.createElement('details');
    extra.className = 'kino-more-tools';
    extra.innerHTML = '<summary>Tùy chọn <span aria-hidden="true">⌄</span></summary><div class="kino-more-tools-menu"></div>';
    const menu = extra.querySelector('div');
    [...toolbar.children].filter(button => button.id !== 'kinoFullMovieBtn').forEach(button => menu.append(button));
    toolbar.append(extra);
    // With lazy movie data the catalog can mount before these tools exist.
    document.querySelector('.kino-catalog-back-bar')?.append(extra);
    menu.addEventListener('click', event => { if (event.target.closest('button')) extra.open = false; });
    document.addEventListener('click', event => { if (!extra.contains(event.target)) extra.open = false; });
    extra.addEventListener('keydown', event => {
      if (event.key === 'Escape') { extra.open = false; extra.querySelector('summary').focus(); }
    });

    const heading = document.createElement('div');
    heading.className = 'kino-practice-heading';
    heading.id = 'kinoPracticeHeading';
    heading.innerHTML = '<div><p class="peppa-eyebrow" id="kinoActivityName"></p><h3 id="kinoPracticePosition"></h3><p id="kinoActivityHelp"></p><p id="kinoUsageNote" hidden></p></div><button type="button" id="kinoBackToParts">↑ Xem cả phần</button>';
    document.querySelector('.kino-v3-grid').before(heading);
    document.getElementById('kinoBackToParts').onclick = () => {
      context();
    };
    const input = document.getElementById('kinoDiktatInput');
    input.setAttribute('aria-label', 'Gõ câu tiếng Đức bạn nghe được');
    input.setAttribute('aria-describedby', 'kinoPracticePosition kinoUsageNote');
    document.querySelector('.kino-v3-col-right .kino-v3-card-title span').textContent = '✍️ Gõ điều bạn nghe được';
    document.querySelector('.kino-v3-col-right .kino-v3-card').classList.add('kino-writing-card');
    document.getElementById('kinoCheckBtn').textContent = 'Xem góp ý ↵';
    document.getElementById('kinoAnswerBtn').textContent = 'Xem câu gốc';
    document.getElementById('kinoAnswerBtn').title = 'Xem lời thoại và nghĩa tiếng Việt bất cứ lúc nào';
    input.placeholder = 'Gõ thử theo điều bạn nghe được. Xem câu gốc khi cần nhé…';
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.id = 'kinoSkipWriting';
    skip.className = 'kino-skip-writing';
    skip.textContent = 'Để câu này sau →';
    skip.onclick = nextOrReturn;
    document.querySelector('.kino-diktat-actions-row').append(skip);
    const listen = document.createElement('button');
    listen.type = 'button';
    listen.id = 'kinoListenWhileTyping';
    listen.textContent = '🔁 Nghe lại câu này';
    listen.onclick = () => playKinoCurrentSegment();
    input.before(listen);
    document.getElementById('kinoFeedbackBox').setAttribute('aria-live', 'polite');
    const continuation = document.createElement('div');
    continuation.id = 'kinoSentencePassed';
    continuation.className = 'kino-sentence-passed';
    continuation.hidden = true;
    continuation.innerHTML = '<span>✓ Đã viết câu này</span><button type="button" id="kinoContinueSentence"></button>';
    document.getElementById('kinoFeedbackBox').after(continuation);
    document.getElementById('kinoContinueSentence').onclick = nextOrReturn;

    const listenCard = document.createElement('div');
    listenCard.className = 'kino-v3-card kino-listen-card';
    listenCard.innerHTML = '<p class="peppa-eyebrow">NGHE TRƯỚC · HIỂU SAU</p><p id="kinoListenDe" lang="de"></p><p id="kinoListenVi" lang="vi"></p>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0;">'
      + '<button type="button" id="kinoRevealDe" style="border:1.5px solid #DB5B23;color:#C44D18;background:#fff;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;">👀 Hiện chữ Đức</button>'
      + '<button type="button" id="kinoRevealVi" style="border:1.5px solid #DB5B23;color:#C44D18;background:#fff;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;">🇻🇳 Hiện nghĩa Việt</button>'
      + '</div>'
      + '<p class="kino-listen-reassurance">Nghe trước, đoán trong đầu — rồi mới hiện chữ và nghĩa để kiểm tra. Nghe lại bao nhiêu lần cũng được.</p><button type="button" id="kinoListenAgain">🔁 Nghe lại</button>';
    document.querySelector('.kino-v3-learn-hub').prepend(listenCard);
    document.getElementById('kinoListenAgain').onclick = () => playKinoCurrentSegment();
    document.getElementById('kinoRevealDe').onclick = () => { listenRevealDe = true; render(); };
    document.getElementById('kinoRevealVi').onclick = () => { if (listenRevealDe) { listenRevealVi = true; render(); } };
    const activityNext = document.createElement('button');
    activityNext.type = 'button';
    activityNext.id = 'kinoActivityNext';
    activityNext.onclick = nextOrReturn;
    document.querySelector('.kino-v3-learn-hub').append(activityNext);

    // Speaking is optional; expose its controls only when the learner asks for them.
    const speaking = document.querySelector('.kino-v3-dub-card');
    const header = speaking.querySelector('.kino-v3-card-header');
    const title = header.querySelector('.kino-v3-card-title');
    const toggle = document.createElement('h4');
    toggle.id = 'kinoSpeakingToggle';
    toggle.innerHTML = '<span>🎙️ Nói theo nhân vật · Tùy chọn</span><b aria-hidden="true">＋</b>';
    title.replaceChildren(toggle);
    const body = document.createElement('div');
    body.id = 'kinoSpeakingBody';
    body.hidden = true;
    body.append(header.querySelector('.kino-dub-mute-toggle-row'));
    [...speaking.children].filter(child => child !== header).forEach(child => body.append(child));
    speaking.append(body);
    panel.querySelector('.peppa-parts').addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = Number(event.target.closest('[data-chapter]')?.dataset.chapter);
      if (!Number.isInteger(index)) return;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
      panel.querySelector(`[data-chapter="${next}"]`).focus();
    });
    const timeline = document.getElementById('kinoTimelineBody');
    timeline.classList.add('collapsed');
    const timelineToggle = document.getElementById('kinoTimelineCollapseBtn');
    timelineToggle.textContent = 'Xem các câu ▾';
    timelineToggle.setAttribute('aria-expanded', 'false');
    timelineToggle.setAttribute('aria-controls', 'kinoTimelineBody');
    KinoDiscovery.mount({ practice, context, watched: markWatched, canPlay: () => !kinoIsDubbing,
      beforePlay: () => { pauseKinoDubbingReplay(); document.getElementById('kinoMainVideo').pause(); closeKinoFullMovieModal(); },
      leave: () => {
        pauseKinoDubbingReplay();
        document.getElementById('kinoMainVideo').pause();
        document.getElementById('kinoFullPlayer').pause();
        if (kinoIsDubbing) stopKinoDubbing();
      },
    });
  }
  function nextOrReturn() {
    if (kinoIsDubbing) return;
    if (kinoCurrentIndex < PIZZASCHWESTER_72_SEGMENTS.length - 1) nextKinoSentence();
    else document.getElementById('kinoBackToParts').click();
  }
  function markWatched(index) {
    if (!state.watched.includes(index)) state.watched.push(index);
    persist();
    render();
  }
  function mountParts() {
    if (panel.dataset.video === videoKey) return;
    panel.dataset.video = videoKey;
    panel.setAttribute('aria-label', `Học ${config.title} theo từng phần`);
    panel.style.setProperty('--kino-part-count', chapters.length);
    panel.querySelector('.peppa-heading .peppa-eyebrow').textContent = `${config.series} · ${config.title} · MỖI LẦN MỘT CHÚT`;
    panel.querySelector('.peppa-parts').replaceChildren();
    chapters.forEach((chapter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'peppa-part';
      button.dataset.chapter = index;
      button.innerHTML = `<span class="peppa-part-number">${chapter.icon} PHẦN ${index + 1}</span><strong>${chapter.title}</strong><span class="peppa-part-time">${clock(chapter.end - chapter.start)} video</span><span class="peppa-part-progress"></span><span class="kino-part-open">Học phần này →</span>`;
      button.addEventListener('click', () => change(index, state.mode, true));
      panel.querySelector('.peppa-parts').append(button);
    });
  }
  function bindFrameGuard(video, inspect) {
    let handle = null;
    const hasFrames = typeof video.requestVideoFrameCallback === 'function';
    const cancel = () => {
      if (handle === null) return;
      if (hasFrames) video.cancelVideoFrameCallback(handle); else cancelAnimationFrame(handle);
      handle = null;
    };
    const tick = (_, metadata) => {
      handle = null;
      inspect(metadata ? metadata.mediaTime : video.currentTime);
      if (!video.paused) schedule();
    };
    const schedule = () => {
      if (handle !== null) return;
      handle = hasFrames ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    };
    video.addEventListener('play', schedule);
    video.addEventListener('pause', cancel);
    video.addEventListener('emptied', cancel);
  }
  function updateCaptions(time) {
    const caption = document.getElementById('peppaWatchCaption');
    if (!caption) return;
    const cue = watchBounds && captionsVisible && time >= watchBounds.start && time < watchBounds.end
      ? (config.captionCues || source).find(seg => time >= seg.start && time < seg.end) : null;
    caption.hidden = !cue;
    if (cue && caption.dataset.cue !== String(cue.id)) {
      caption.dataset.cue = cue.id;
      document.getElementById('peppaWatchDe').textContent = cue.text;
      document.getElementById('peppaWatchVi').textContent = cue.vi;
    }
  }
  function prepare(key, segments) {
    clearWatch();
    active = Boolean(KINO_CHAPTER_DATA[key]);
    document.getElementById('diktatMode').classList.toggle('kino-chapters-active', active);
    document.querySelector('.kino-v3-dub-card .kino-v3-card-title span').textContent = active
      ? '🎙️ 2. Nói theo nhân vật · Tùy chọn' : '🎙️ 2. Lồng tiếng nhân vật (Synchronsprechen)';
    if (!active) {
      if (panel) panel.hidden = true;
      return segments;
    }
    videoKey = key;
    config = KINO_CHAPTER_DATA[videoKey];
    chapters = config.chapters;
    storageKey = config.storageKey;
    state = loadState(videoKey);
    const lesson = `${videoKey}:${state.chapter}`;
    if (lesson !== currentLesson) activity = 'discover';
    currentLesson = lesson;
    source = config.cues;
    ensurePanel();
    mountParts();
    panel.hidden = false;
    // Import original progress once, without writing to or replacing the original record.
    if (!state.imported) {
      try {
        const original = JSON.parse(localStorage.getItem(config.legacyKey));
        if (Array.isArray(original?.completed)) state.completed = [...new Set([...state.completed, ...original.completed.filter(Number.isInteger)])];
      } catch (_) {}
      state.imported = true;
      persist();
    }
    if (state.alignmentVersion !== 2) {
      const legacyIds = new Set(state.completed.filter(id => id <= config.legacyCount));
      state.completed = [...new Set([...state.completed, ...source.filter(seg => legacyIds.has(seg.parentId)).map(seg => seg.id)])];
      state.alignmentVersion = 2;
      persist();
    }
    if (config.contentVersion && state.contentVersion !== config.contentVersion) {
      // Retain every previous completion ID. A newly grouped sentence is done
      // only when all its original fragments were completed.
      const completed = new Set(state.completed);
      for (const cue of source) {
        if (cue.legacyIds?.length && cue.legacyIds.every(id => completed.has(id))) completed.add(cue.id);
      }
      state.completed = [...completed];
      state.contentVersion = config.contentVersion;
      persist();
    }
    return selected();
  }
  function progress() {
    const segments = selected();
    const completed = segments.filter(seg => state.completed.includes(seg.id)).map(seg => seg.id);
    const firstIncomplete = segments.findIndex(seg => !completed.includes(seg.id));
    return JSON.stringify({ completed, unlockedIndex: firstIncomplete < 0 ? segments.length - 1 : firstIncomplete });
  }
  function save() {
    const activeIds = new Set(selected().map(seg => seg.id));
    state.completed = [...new Set([...state.completed.filter(id => !activeIds.has(id)), ...kinoCompletedSet])];
    persist();
    render();
  }
  function change(index, mode, openLesson = false, pushHistory = true) {
    if (index < 0 || index >= chapters.length || kinoIsDubbing) return;
    saveKinoPersistentProgress();
    state.chapter = index;
    state.mode = mode;
    persist();
    closeKinoFullMovieModal();
    if (openLesson) {
      if (pushHistory && document.getElementById('diktatMode').dataset.kinoView === 'detail') history.pushState({ ...history.state, kinoOpenedPart: true }, '', location.href);
      activity = 'discover';
      KinoCatalog.showLesson();
    }
    switchKinoActiveVideo(videoKey);
    syncLocation();
    document.getElementById('kinoWelcomeModal').classList.add('hidden');
    document.querySelector(openLesson ? '.kino-v3-root' : '#kinoLessonTabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
    revealSelectedPart();
  }
  function revealSelectedPart() {
    // Scroll only the horizontal selector, leaving the page at the learning panel.
    const strip = panel.querySelector('.peppa-parts');
    const button = strip.querySelector(`[data-chapter="${state.chapter}"]`);
    if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = button.offsetLeft - strip.offsetLeft - (strip.clientWidth - button.clientWidth) / 2;
  }
  function context(fromTab = false) {
    if (kinoIsDubbing || activity === 'discover') return;
    activity = 'discover';
    KinoCatalog.stopPlayback();
    render();
    document.getElementById('kinoLessonTabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!fromTab) document.getElementById('kinoListenChoice').focus({ preventScroll: true });
  }
  function practice(kind = 'write', fromTab = false) {
    if (kinoIsDubbing) return;
    if (activity === kind) return;
    const previous = activity;
    const previousIndex = kinoCurrentIndex;
    activity = ['listen', 'write', 'speak'].includes(kind) ? kind : 'write';
    pauseKinoDubbingReplay();
    KinoDiscovery.pause();
    const unfinished = PIZZASCHWESTER_72_SEGMENTS.findIndex(seg => !kinoCompletedSet.has(seg.id));
    kinoShowSubtitles = activity !== 'write';
    document.getElementById('kinoSubOverlay').classList.toggle('hidden-sub', !kinoShowSubtitles);
    loadKinoSentence(previous !== 'discover' ? previousIndex : activity === 'write' && unfinished >= 0 ? unfinished : 0);
    document.getElementById(fromTab ? 'kinoLessonTabs' : 'kinoPracticeHeading').scrollIntoView({ behavior: 'smooth', block: 'start' });
    playKinoCurrentSegment();
    if (!fromTab) document.getElementById(activity === 'speak' ? 'kinoDubRecordBtn' : 'kinoPlayLoopBtn').focus({ preventScroll: true });
  }
  function clearWatch() {
    watchBounds = null;
    const note = document.getElementById('peppaWatchNote');
    if (note) note.hidden = true;
    const controls = document.getElementById('peppaWatchControls');
    if (controls) controls.hidden = true;
    const player = document.getElementById('kinoFullPlayer');
    if (player) player.controls = true;
    updateCaptions(0);
  }
  function watch() {
    if (kinoIsDubbing) return;
    KinoDiscovery.pause();
    const chapter = chapters[state.chapter];
    // The original player still handles full-movie playback. Bound only this viewing session.
    openKinoFullMovieModal(chapter.start);
    watchBounds = { start: chapter.start, end: chapter.end, chapter: state.chapter };
    const player = document.getElementById('kinoFullPlayer');
    player.controls = false;
    document.getElementById('peppaWatchControls').hidden = false;
    const seek = document.getElementById('peppaWatchSeek');
    seek.max = chapter.end - chapter.start;
    seek.value = 0;
    document.getElementById('peppaWatchClock').textContent = '0:00';
    document.getElementById('peppaWatchLength').textContent = clock(chapter.end - chapter.start);
    document.getElementById('kinoFullModalTitle').textContent = `Phần ${state.chapter + 1} · ${chapter.title} · ${clock(chapter.end - chapter.start)}`;
    document.getElementById('peppaWatchNote').hidden = false;
    document.getElementById('peppaWatchMessage').textContent = 'Cứ xem và hiểu câu chuyện. Viết hoặc nói đều tùy bạn.';
  }
  function render() {
    if (!active || !panel) return;
    const chapter = chapters[state.chapter];
    const segments = selected();
    document.getElementById('diktatMode').dataset.kinoActivity = activity;
    document.getElementById('peppaOverall').textContent = `${state.watched.length} / ${chapters.length} phần đã xem`;
    panel.querySelectorAll('.peppa-part').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === state.chapter));
      button.querySelector('.peppa-part-progress').textContent = state.watched.includes(index) ? '✓ Đã xem' : index === state.chapter ? 'Đang chọn' : 'Xem khi bạn muốn';
    });
    document.getElementById('peppaPartMeta').textContent = `PHẦN ${state.chapter + 1} / ${chapters.length} · ${clock(chapter.end - chapter.start)} PHIM`;
    document.getElementById('peppaPartTitle').textContent = chapter.title;
    document.getElementById('peppaPartGoal').textContent = chapter.goal;
    const done = doneCount(segments);
    const firstIncomplete = segments.findIndex(seg => !state.completed.includes(seg.id));
    document.getElementById('kinoWriteChoiceHint').textContent = done > 0 && done < segments.length
      ? `Viết tiếp từ câu ${firstIncomplete + 1} · không chấm điểm` : 'Gõ thử và xem góp ý, không chấm điểm';
    document.getElementById('kinoWriteChoiceHint').hidden = !(done > 0 && done < segments.length);
    panel.classList.toggle('peppa-has-progress', done > 0 || state.watched.includes(state.chapter));
    document.getElementById('peppaLight').setAttribute('aria-pressed', String(state.mode === 'light'));
    document.getElementById('peppaAll').setAttribute('aria-pressed', String(state.mode === 'all'));
    const chapterCueCount = selected(chapter, 'all').length;
    const highlightCount = selected(chapter, 'light').length;
    document.getElementById('peppaLight').textContent = `${highlightCount} câu ${config.defaultMode === 'all' ? 'trọng tâm' : 'gợi ý'}`;
    document.getElementById('peppaPractice').textContent = `Luyện ${highlightCount} câu →`;
    const allLabel = config.allLabel || 'Toàn bộ lời thoại';
    document.getElementById('peppaAll').textContent = config.defaultMode === 'all' ? allLabel : 'Thêm câu thoại';
    document.getElementById('peppaWatchStatus').textContent = config.defaultMode === 'all'
      ? state.mode === 'all'
        ? `${chapterCueCount} câu · ${config.allDescription || 'Gồm lời nhân vật và người kể chuyện'}`
        : `Đang luyện ${segments.length} / ${chapterCueCount} câu · Chọn “${allLabel}” để học đủ`
      : 'Tự chọn câu · Có thể dừng bất cứ lúc nào';
    document.getElementById('kinoSelBadge').textContent = `${chapters.length} phần`;
    const partBadge = document.getElementById(`kinoBadge_${videoKey}`);
    if (partBadge) partBadge.textContent = `${chapters.length} phần`;
    document.getElementById('kinoTimelineTitleText').textContent = `${segments.length} câu ${state.mode === 'light' ? 'gợi ý' : 'thoại'} · Phần ${state.chapter + 1}`;
    document.getElementById('kinoTimelineStats').textContent = 'Chọn câu nào cũng được';
    document.getElementById('kinoProgressCount').textContent = `Đã viết ${done} / ${segments.length} câu · theo nhịp của bạn`;
    const finished = segments.length > 0 && doneCount(segments) === segments.length;
    document.getElementById('peppaFinished').hidden = !finished;
    document.getElementById('peppaFinishedTitle').textContent = `✓ Bạn đã thử viết ${segments.length} câu của phần ${state.chapter + 1}.`;
    document.getElementById('peppaNextPart').hidden = state.chapter === chapters.length - 1;
    document.getElementById('kinoSpeakingToggle').querySelector('span').textContent = '🎙️ Nghe mẫu rồi nói theo';
    document.getElementById('kinoSpeakingBody').hidden = activity !== 'speak';
    document.getElementById('kinoSpeakingToggle').querySelector('b').hidden = true;
    document.getElementById('kinoActivityName').textContent = { discover: '', listen: 'NGHE & HIỂU · TỪNG CÂU MỘT', write: 'THỬ VIẾT · KHÔNG CHẤM ĐIỂM', speak: 'THỬ NÓI · THEO NHỊP CỦA BẠN' }[activity];
    document.getElementById('kinoActivityHelp').textContent = activity === 'write' ? 'Gõ thử, xem câu gốc khi cần. Có thể để câu này sau.'
      : activity === 'speak' ? 'Nghe giọng nhân vật rồi nói theo. Không cần làm phần viết trước.' : 'Nghe trước khi thấy chữ: đoán, rồi hiện chữ Đức và nghĩa Việt để kiểm tra. Chọn câu nào cũng được.';
    document.getElementById('kinoPracticePosition').textContent = `Câu ${kinoCurrentIndex + 1} / ${segments.length} · Phần ${state.chapter + 1}`;
    const usage = chapter.practiceUsage?.[segments[kinoCurrentIndex]?.id];
    const usageNote = document.getElementById('kinoUsageNote');
    usageNote.hidden = !usage;
    usageNote.textContent = usage ? `Tình huống: ${usage}` : '';
    const passed = kinoCompletedSet.has(segments[kinoCurrentIndex]?.id);
    document.getElementById('kinoSentencePassed').hidden = !passed;
    document.getElementById('kinoContinueSentence').textContent = kinoCurrentIndex < segments.length - 1
      ? 'Câu tiếp theo →' : 'Xem cả phần ↑';
    document.getElementById('kinoPrevBtn').disabled = kinoCurrentIndex === 0;
    document.getElementById('kinoNextBtn').disabled = kinoCurrentIndex >= segments.length - 1;
    document.getElementById('kinoSkipWriting').hidden = passed;
    document.getElementById('kinoActivityNext').textContent = kinoCurrentIndex < segments.length - 1 ? 'Nghe câu tiếp →' : 'Xem cả phần ↑';
    // Nghe mù trước: chỉ hiện chữ/nghĩa khi người học đã bấm; đổi câu là đặt lại.
    const listenKey = segments[kinoCurrentIndex]?.id || String(kinoCurrentIndex);
    if (listenRevealKey !== listenKey) { listenRevealKey = listenKey; listenRevealDe = false; listenRevealVi = false; }
    document.getElementById('kinoListenDe').textContent = listenRevealDe
      ? (segments[kinoCurrentIndex]?.text || '') : '🎧 Nghe câu này trước — đừng nhìn chữ vội.';
    document.getElementById('kinoListenVi').textContent = listenRevealVi
      ? (segments[kinoCurrentIndex]?.vi || '') : (listenRevealDe ? 'Đoán nghĩa trong đầu, rồi bấm “Hiện nghĩa Việt” để kiểm tra.' : '');
    const revealDeBtn = document.getElementById('kinoRevealDe');
    if (revealDeBtn) revealDeBtn.hidden = listenRevealDe;
    const revealViBtn = document.getElementById('kinoRevealVi');
    if (revealViBtn) { revealViBtn.hidden = listenRevealVi; revealViBtn.disabled = !listenRevealDe; revealViBtn.style.opacity = listenRevealDe ? '' : '.45'; }
    // Phụ đề trên video cũng phải "mù" theo cùng trạng thái, nếu không người học
    // cứ đọc phụ đề là xong. CSS ở kino-discovery.css ẩn theo hai cờ này.
    const modeRoot = document.getElementById('diktatMode');
    if (modeRoot) {
      modeRoot.classList.toggle('kl-blind-de', activity === 'listen' && !listenRevealDe);
      modeRoot.classList.toggle('kl-blind-vi', activity === 'listen' && !listenRevealVi);
    }
    KinoDiscovery.update({ key: videoKey, src: KINO_VIDEOS[videoKey].src, chapter, index: state.chapter,
      cues: config.captionCues || source, watched: state.watched.includes(state.chapter), activity });
    KinoCatalog.updateCount();
  }
  function enter(detail = false) {
    if (!active || !panel) return;
    activity = 'discover';
    render();
    if (detail) KinoCatalog.showDetail();
    else KinoCatalog.show();
  }
  function syncLocation() {
    if (!active) return;
    const url = new URL(location.href);
    url.searchParams.delete('hub');
    url.searchParams.set('kino', KINO_ALIASES[videoKey] || videoKey);
    if (document.getElementById('diktatMode').dataset.kinoView === 'lesson') url.searchParams.set('part', state.chapter + 1);
    else url.searchParams.delete('part');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }
  async function restoreLocation(query, focusCatalog = false) {
    const requestedSlug = query.get('kino');
    const requestedKey = Object.keys(KINO_ALIASES).find(key => key === requestedSlug || KINO_ALIASES[key] === requestedSlug);
    if (!requestedKey) {
      if (query.get('hub') === 'kino') { setPrimaryHub('kino'); KinoCatalog.show(focusCatalog); }
      return;
    }
    const requestedState = loadState(requestedKey);
    const part = Number(query.get('part'));
    if (part >= 1 && part <= KINO_CHAPTER_DATA[requestedKey].chapters.length && Number.isInteger(part)) requestedState.chapter = part - 1;
    setPrimaryHub('kino');
    if (!await selectKinoMovie(requestedKey)) return;
    persist();
    document.getElementById('kinoWelcomeModal').classList.add('hidden');
    enter(true);
    if (part >= 1 && part <= chapters.length && Number.isInteger(part)) change(part - 1, state.mode, true, false);
    revealSelectedPart();
  }
  window.addEventListener('popstate', () => restoreLocation(new URLSearchParams(location.search), true));
  function focusShortCue(want) {
    if (!active || !panel || document.body.dataset.hub !== 'kino' || want.videoKey && want.videoKey !== videoKey) return false;
    if (document.getElementById('diktatMode').dataset.kinoView !== 'lesson') return false;
    const cue = source.find(seg => want.cueId != null ? seg.id === Number(want.cueId) : seg.text === want.cueText);
    if (!cue) return false;
    const index = chapters.findIndex(part => cue.start >= part.start && cue.end <= part.end);
    if (index < 0) return false;
    const mode = chapters[index].picks.includes(cue.id) ? state.mode : 'all';
    change(index, mode, true, false);
    activity = 'listen';
    KinoDiscovery.pause();
    kinoShowSubtitles = true;
    document.getElementById('kinoSubOverlay').classList.remove('hidden-sub');
    const selectedIndex = PIZZASCHWESTER_72_SEGMENTS.findIndex(seg => seg.id === cue.id);
    if (selectedIndex < 0) return false;
    loadKinoSentence(selectedIndex);
    render();
    document.getElementById('kinoPracticeHeading').scrollIntoView({ block: 'start' });
    document.getElementById('kinoPlayLoopBtn').focus({ preventScroll: true });
    return true;
  }
  return { prepare, progress, save, render, clearWatch, enter, syncLocation, focusShortCue,
    restoreInitialLocation: () => restoreLocation(initialQuery), isActive: () => active,
    recordingKey: () => `${videoKey}_${state.chapter}_${state.mode}` };
})();
