/* Peppa chapters reference the original movie; no media is cut or duplicated. */
const KinoPeppa = (() => {
  const storageKey = 'vokabelgo_kino_peppa_chapters_v1';
  const chapters = [
    { title: 'Mua thực phẩm', icon: '🛒', start: 0, end: 177.72,
      picks: [100301, 100401, 100601, 100701, 101001, 101502, 101802], goal: 'Gọi tên thực phẩm và nghe những lời nhắc khi mua sắm.' },
    { title: 'Quầy thanh toán tự động', icon: '🧾', start: 177.72, end: 359.56,
      picks: [102301, 102302, 102501, 102602, 102902, 103403, 103701], goal: 'Làm quen với lời hướng dẫn ở quầy tự thanh toán.' },
    { title: 'Máy đồ chơi', icon: '🧸', start: 359.56, end: 548.56,
      picks: [104701, 104802, 105002, 105304, 105602, 105703, 106301], goal: 'Hỏi cách chơi, nói điều mình muốn và nhờ giúp đỡ.' },
    { title: 'Tự thiết kế đồ chơi', icon: '🎨', start: 548.56, end: 727.6,
      picks: [106702, 106703, 106801, 106901, 107201, 107303, 108002], goal: 'Nghe cách lựa chọn và mô tả món đồ chơi của mình.' },
    { title: 'Cùng làm tacos', icon: '🌮', start: 727.6, end: 919.04,
      picks: [108701, 108802, 109002, 109401, 109402, 109803, 110001], goal: 'Làm quen với nguyên liệu và các bước chuẩn bị món ăn.' }
  ];
  let state = { chapter: 0, mode: 'light', completed: [], watched: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object') {
      state.chapter = Number.isInteger(saved.chapter) && saved.chapter >= 0 && saved.chapter < 5 ? saved.chapter : 0;
      state.mode = saved.mode === 'all' ? 'all' : 'light';
      state.completed = Array.isArray(saved.completed) ? saved.completed.filter(Number.isInteger) : [];
      state.watched = Array.isArray(saved.watched) ? saved.watched.filter(Number.isInteger) : [];
      state.imported = saved.imported === true;
      state.alignmentVersion = saved.alignmentVersion;
    }
  } catch (_) { /* Continue in memory if storage is unavailable. */ }
  let source = [];
  let active = false;
  let watchBounds = null;
  let panel;
  let captionsVisible = true;

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
        <h2>Hôm nay, mình học một phần nhỏ.</h2></div><span id="peppaOverall"></span></div>
      <div class="peppa-parts" role="group" aria-label="Chọn phần phim"></div>
      <div class="peppa-current"><div><p class="peppa-eyebrow" id="peppaPartMeta"></p>
        <h3 id="peppaPartTitle"></h3><p id="peppaPartGoal"></p></div>
        <div class="peppa-actions"><button type="button" class="peppa-watch" id="peppaWatch">▶ Xem phần này</button>
        <button type="button" class="peppa-practice" id="peppaPractice">Luyện 7 câu →</button></div></div>
      <div class="peppa-options"><div role="group" aria-label="Mức luyện tập">
        <button type="button" id="peppaLight">Học nhẹ · 7 câu</button>
        <button type="button" id="peppaAll">Luyện toàn bộ phần này</button></div>
        <span id="peppaWatchStatus"></span></div>
      <div class="peppa-finished" id="peppaFinished" role="status" hidden>
        <div><strong id="peppaFinishedTitle"></strong><p>Nói theo 2–3 câu nếu thích. Bạn có thể nghỉ tại đây và học tiếp lần sau.</p></div>
        <button type="button" id="peppaNextPart">Sang phần tiếp →</button></div>`;
    document.querySelector('.kino-v3-progress-card').before(panel);
    chapters.forEach((chapter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'peppa-part';
      button.dataset.chapter = index;
      button.innerHTML = `<span class="peppa-part-number">${chapter.icon} PHẦN ${index + 1}</span><strong>${chapter.title}</strong><span class="peppa-part-time">${clock(chapter.end - chapter.start)} phim · 7 câu luyện</span><span class="peppa-part-progress"></span>`;
      button.addEventListener('click', () => change(index, state.mode));
      panel.querySelector('.peppa-parts').append(button);
    });
    panel.querySelector('#peppaWatch').onclick = watch;
    panel.querySelector('#peppaPractice').onclick = practice;
    panel.querySelector('#peppaLight').onclick = () => change(state.chapter, 'light');
    panel.querySelector('#peppaAll').onclick = () => change(state.chapter, 'all');
    panel.querySelector('#peppaNextPart').onclick = () => change(state.chapter + 1, 'light');
    const note = document.createElement('div');
    note.id = 'peppaWatchNote';
    note.className = 'peppa-watch-note';
    note.hidden = true;
    note.innerHTML = '<span id="peppaWatchMessage">Xem để hiểu tình huống; bạn có thể luyện câu bất cứ lúc nào.</span><button type="button">Bắt đầu luyện câu →</button>';
    note.querySelector('button').onclick = () => { closeKinoFullMovieModal(); practice(); };
    document.querySelector('#kinoFullMovieModal .kino-full-modal-header').after(note);
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
        if (!state.watched.includes(watchBounds.chapter)) state.watched.push(watchBounds.chapter);
        persist();
        document.getElementById('peppaWatchMessage').textContent = 'Đã xem hết phần này. Mình luyện vài câu nhé!';
        render();
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
    const cue = watchBounds && captionsVisible ? source.find(seg => time >= seg.start && time < seg.end) : null;
    caption.hidden = !cue;
    if (cue && caption.dataset.cue !== String(cue.id)) {
      caption.dataset.cue = cue.id;
      document.getElementById('peppaWatchDe').textContent = cue.text;
      document.getElementById('peppaWatchVi').textContent = cue.vi;
    }
  }
  function prepare(videoKey, segments) {
    clearWatch();
    active = videoKey === 'peppa_supermarkt';
    document.getElementById('diktatMode').classList.toggle('kino-peppa-active', active);
    document.querySelector('.kino-v3-dub-card .kino-v3-card-title span').textContent = active
      ? '🎙️ 2. Nói theo nhân vật · Tùy chọn' : '🎙️ 2. Lồng tiếng nhân vật (Synchronsprechen)';
    if (!active) {
      if (panel) panel.hidden = true;
      return segments;
    }
    source = PEPPA_ALIGNED_UTTERANCES;
    ensurePanel();
    panel.hidden = false;
    // Import original progress once, without writing to or replacing the original record.
    if (!state.imported) {
      try {
        const original = JSON.parse(localStorage.getItem('vokabelgo_kino_progress_peppa_supermarkt'));
        if (Array.isArray(original?.completed)) state.completed = [...new Set([...state.completed, ...original.completed.filter(Number.isInteger)])];
      } catch (_) {}
      state.imported = true;
      persist();
    }
    if (state.alignmentVersion !== 2) {
      const legacyIds = new Set(state.completed.filter(id => id <= 106));
      state.completed = [...new Set([...state.completed, ...source.filter(seg => legacyIds.has(seg.parentId)).map(seg => seg.id)])];
      state.alignmentVersion = 2;
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
  function change(index, mode) {
    if (index < 0 || index >= chapters.length || kinoIsDubbing) return;
    saveKinoPersistentProgress();
    state.chapter = index;
    state.mode = mode;
    persist();
    closeKinoFullMovieModal();
    switchKinoActiveVideo('peppa_supermarkt');
    document.getElementById('kinoWelcomeModal').classList.add('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function practice() {
    if (kinoIsDubbing) return;
    document.querySelector('.kino-v3-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('kinoPlayLoopBtn').focus({ preventScroll: true });
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
    const chapter = chapters[state.chapter];
    // The original player still handles full-movie playback. Bound only this viewing session.
    openKinoFullMovieModal();
    watchBounds = { start: chapter.start, end: chapter.end, chapter: state.chapter };
    const player = document.getElementById('kinoFullPlayer');
    player.currentTime = chapter.start;
    player.controls = false;
    document.getElementById('peppaWatchControls').hidden = false;
    const seek = document.getElementById('peppaWatchSeek');
    seek.max = chapter.end - chapter.start;
    seek.value = 0;
    document.getElementById('peppaWatchClock').textContent = '0:00';
    document.getElementById('peppaWatchLength').textContent = clock(chapter.end - chapter.start);
    document.getElementById('kinoFullModalTitle').textContent = `Phần ${state.chapter + 1} · ${chapter.title} · ${clock(chapter.end - chapter.start)}`;
    document.getElementById('peppaWatchNote').hidden = false;
    document.getElementById('peppaWatchMessage').textContent = 'Xem để hiểu tình huống; bạn có thể luyện câu bất cứ lúc nào.';
  }
  function render() {
    if (!active || !panel) return;
    const chapter = chapters[state.chapter];
    const segments = selected();
    const completedParts = chapters.filter(part => doneCount(selected(part, 'light')) === part.picks.length).length;
    document.getElementById('peppaOverall').textContent = `${completedParts} / 5 phần học nhẹ`;
    panel.querySelectorAll('.peppa-part').forEach((button, index) => {
      const partSegments = selected(chapters[index], 'light');
      const count = doneCount(partSegments);
      button.setAttribute('aria-pressed', String(index === state.chapter));
      button.querySelector('.peppa-part-progress').textContent = count === 7 ? '✓ Đã xong lượt nhẹ' : `${count} / 7 câu`;
    });
    document.getElementById('peppaPartMeta').textContent = `PHẦN ${state.chapter + 1} / 5 · ${clock(chapter.end - chapter.start)} PHIM`;
    document.getElementById('peppaPartTitle').textContent = chapter.title;
    document.getElementById('peppaPartGoal').textContent = chapter.goal;
    document.getElementById('peppaPractice').textContent = `Luyện ${segments.length} câu →`;
    document.getElementById('peppaLight').setAttribute('aria-pressed', String(state.mode === 'light'));
    document.getElementById('peppaAll').setAttribute('aria-pressed', String(state.mode === 'all'));
    document.getElementById('peppaWatchStatus').textContent = state.watched.includes(state.chapter) ? '✓ Đã xem phần này · Nói theo là tùy chọn' : 'Xem tình huống → Luyện câu → Nói theo tùy thích';
    document.getElementById('kinoSelBadge').textContent = '5 phần';
    document.getElementById('kinoBadge_peppa_supermarkt').textContent = '5 phần';
    document.getElementById('kinoTimelineTitleText').textContent = `📜 ${state.mode === 'light' ? 'Lượt học nhẹ' : 'Toàn bộ thoại'} · ${segments.length} câu của phần ${state.chapter + 1}`;
    const finished = segments.length > 0 && doneCount(segments) === segments.length;
    document.getElementById('peppaFinished').hidden = !finished;
    document.getElementById('peppaFinishedTitle').textContent = `✓ Xong ${state.mode === 'light' ? 'lượt học nhẹ' : 'toàn bộ câu'} của phần ${state.chapter + 1}. Hôm nay vậy là đủ rồi!`;
    document.getElementById('peppaNextPart').hidden = state.chapter === chapters.length - 1;
    document.querySelector('.kino-peppa-active .kino-v3-dub-card .kino-v3-card-title span').textContent = '🎙️ 2. Nói theo nhân vật · Tùy chọn';
  }
  document.addEventListener('DOMContentLoaded', () => {
    const query = new URLSearchParams(location.search);
    if (query.get('kino') !== 'peppa') return;
    const part = Number(query.get('part'));
    if (part >= 1 && part <= 5 && Number.isInteger(part)) state.chapter = part - 1;
    setPrimaryHub('kino');
    selectKinoMovie('peppa_supermarkt');
    document.getElementById('kinoWelcomeModal').classList.add('hidden');
    panel.scrollIntoView({ block: 'start' });
  });
  return { prepare, progress, save, render, clearWatch, isActive: () => active,
    recordingKey: () => `peppa_${state.chapter}_${state.mode}` };
})();
