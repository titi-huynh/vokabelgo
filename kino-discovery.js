/* Part lesson: continuous listening first, with compact optional practice tabs. */
const KinoDiscovery = (() => {
  let host, video, data, actions, lesson = '', finished = false;
  let showCaptions = true;
  let resumeTime = 0;
  const byId = id => document.getElementById(id);
  const clock = value => { const s = Math.round(Math.max(0, value)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg>';

  function mount(callbacks) {
    if (host) return;
    actions = callbacks;
    host = document.createElement('section');
    host.id = 'kinoDiscovery';
    host.className = 'kino-discovery';
    host.setAttribute('aria-label', 'Xem phim và hiểu tình huống trước');
    host.innerHTML = `
      <div class="kino-discovery-player">
        <div class="kino-discovery-stage" id="kinoDiscoveryStage">
          <video id="kinoDiscoveryVideo" playsinline preload="none" aria-label="Video phần phim đang chọn"></video>
          <button type="button" id="kinoDiscoveryStart"><span aria-hidden="true">${playIcon}</span><strong>Xem phần này</strong></button>
          <div class="kino-discovery-caption" id="kinoDiscoveryCaption">
            <p id="kinoDiscoveryDe" lang="de"></p>
            <p id="kinoDiscoveryVi" lang="vi"></p>
            <p id="kinoDiscoveryCaptionHint">Phụ đề Đức – Việt đi cùng lời thoại · Chạm vào một từ tiếng Đức để tra nghĩa ngay.</p>
          </div>
        </div>
        <div class="kino-discovery-controls">
          <button type="button" id="kinoDiscoveryPlay" aria-label="Phát phần phim">${playIcon}</button>
          <span class="kino-discovery-time"><span id="kinoDiscoveryClock">0:00</span><span aria-hidden="true"> / </span><span id="kinoDiscoveryLength"></span></span>
          <input type="range" id="kinoDiscoverySeek" min="0" step="0.1" value="0" aria-label="Vị trí trong video nổi bật">
          <button type="button" id="kinoDiscoveryCC" aria-label="Phụ đề Đức và Việt" aria-pressed="true">CC</button>
        </div>
      </div>
      <div class="kino-listen-footer"><p id="kinoDiscoveryNotice" role="status"></p><button type="button" id="kinoListenSentences">Nghe từng câu →</button></div>`;
    const header = document.createElement('div');
    header.id = 'kinoLessonHeader';
    header.className = 'kino-lesson-header';
    const current = document.querySelector('.peppa-current');
    header.append(current.firstElementChild);
    const oldTitle = header.querySelector('#peppaPartTitle');
    const title = document.createElement('h1');
    title.id = oldTitle.id;
    oldTitle.replaceWith(title);
    const tabs = document.createElement('div');
    tabs.id = 'kinoLessonTabs';
    tabs.className = 'kino-lesson-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Cách học phần này');
    tabs.innerHTML = '<button type="button" id="kinoListenChoice" role="tab">Nghe hiểu</button><button type="button" id="kinoSpeakChoice" role="tab">Nói</button>';
    const write = byId('peppaPractice');
    write.className = '';
    write.textContent = 'Viết';
    write.setAttribute('role', 'tab');
    tabs.querySelector('#kinoSpeakChoice').before(write);
    const lessonPanel = document.createElement('section');
    lessonPanel.id = 'kinoLessonPanel';
    lessonPanel.setAttribute('role', 'tabpanel');
    document.querySelector('.kino-v3-top-header').after(header, tabs, lessonPanel);
    lessonPanel.append(host);
    for (const selector of ['.peppa-options', '.kino-v3-progress-card', '#kinoPracticeHeading', '.kino-v3-grid', '.kino-v3-timeline-card', '#peppaFinished']) lessonPanel.append(document.querySelector(selector));
    const resume = document.createElement('p');
    resume.id = 'kinoWriteChoiceHint';
    resume.className = 'kino-writing-resume';
    document.querySelector('.kino-writing-card .kino-diktat-input-box').before(resume);
    const expand = byId('peppaWatch');
    expand.className = 'kino-discovery-expand';
    expand.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/></svg>';
    expand.setAttribute('aria-label', 'Xem phần này ở màn hình lớn');
    expand.title = 'Xem phần này ở màn hình lớn';
    host.querySelector('.kino-discovery-controls').append(expand);
    current.remove();
    byId('kinoListenChoice').onclick = () => actions.context(true);
    byId('kinoSpeakChoice').onclick = () => actions.practice('speak', true);
    write.onclick = () => actions.practice('write', true);
    byId('kinoListenSentences').onclick = () => actions.practice('listen');
    for (const button of tabs.querySelectorAll('button')) button.setAttribute('aria-controls', 'kinoLessonPanel');
    tabs.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...tabs.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
      buttons[next].click();
      buttons[next].focus({ preventScroll: true });
    });
    byId('kinoDiscoveryStart').onclick = toggle;
    byId('kinoDiscoveryPlay').onclick = toggle;
    byId('kinoDiscoveryCC').onclick = () => {
      showCaptions = !showCaptions;
      byId('kinoDiscoveryCC').setAttribute('aria-pressed', String(showCaptions));
      captions();
    };
    video = byId('kinoDiscoveryVideo');
    byId('kinoDiscoverySeek').addEventListener('input', event => {
      if (!data || !Number.isFinite(video.duration)) return;
      byId('kinoDiscoveryStage').classList.add('has-started');
      video.currentTime = data.chapter.start + Number(event.target.value);
    });
    video.addEventListener('seeking', () => {
      if (!data) return;
      if (video.currentTime < data.chapter.start) video.currentTime = data.chapter.start;
      if (video.currentTime > data.chapter.end) video.currentTime = data.chapter.end;
    });
    video.addEventListener('playing', () => byId('kinoDiscoveryStage').classList.add('has-started'));
    for (const event of ['play', 'pause', 'timeupdate', 'seeked']) video.addEventListener(event, refresh);
    video.addEventListener('error', () => {
      byId('kinoDiscoveryNotice').textContent = 'Chưa tải được video. Bạn thử nhấn phát lại nhé.';
    });
    let frame = null;
    const tick = (_, meta) => {
      frame = null;
      if (data && meta.mediaTime >= data.chapter.end) finish();
      if (!video.paused) frame = video.requestVideoFrameCallback(tick);
    };
    if (video.requestVideoFrameCallback) {
      video.addEventListener('play', () => { if (frame === null) frame = video.requestVideoFrameCallback(tick); });
      video.addEventListener('pause', () => { if (frame !== null) video.cancelVideoFrameCallback(frame); frame = null; });
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    new MutationObserver(() => { if (document.body.dataset.hub !== 'kino') { pause(); actions.leave(); } }).observe(document.body, { attributes: true, attributeFilter: ['data-hub'] });
  }

  function toggle() {
    if (!data || !actions.canPlay()) return;
    if (!video.paused) { video.pause(); return; }
    actions.beforePlay();
    const position = video.hasAttribute('src') ? video.currentTime : resumeTime;
    let time = position >= data.chapter.end - .1 || position < data.chapter.start
      ? data.chapter.start : position;
    // Bắt đầu mới: nếu đoạn mở đầu của phần chưa có lời thoại quá 5 giây
    // (hình hiệu, thiết lập cảnh) thì lướt tới sát câu đầu tiên và báo rõ.
    if (time === data.chapter.start) {
      const firstCue = data.cues.find(c => c.start >= data.chapter.start && c.start < data.chapter.end);
      if (firstCue && firstCue.start - data.chapter.start > 5) {
        time = Math.max(data.chapter.start, firstCue.start - 1.2);
        byId('kinoDiscoveryNotice').textContent = 'Đã lướt qua đoạn mở đầu chưa có lời thoại · Câu đầu tiên ở ' + clock(firstCue.start - data.chapter.start) + ' của phần này.';
      }
    }
    finished = false;
    KinoMedia.play(video, time, data.key);
  }
  function pause() {
    if (!video) return;
    if (video.hasAttribute('src') && video.readyState >= 1 && !video.seeking) resumeTime = video.currentTime;
    KinoMedia.release(video);
  }
  function finish() {
    if (!data || finished) return;
    finished = true;
    video.pause();
    video.currentTime = data.chapter.end;
    actions.watched(data.index);
    refresh();
  }
  function captions() {
    if (!data) return;
    const cue = showCaptions && video.currentTime >= data.chapter.start && video.currentTime < data.chapter.end
      ? data.cues.find(c => video.currentTime >= c.start && video.currentTime < c.end) : null;
    // Chỉ gán lại khi câu đổi: tránh xoá các nút tra từ (kino-lookup) mỗi nhịp timeupdate.
    const deEl = byId('kinoDiscoveryDe'), viEl = byId('kinoDiscoveryVi');
    const deText = cue?.text || '', viText = cue?.vi || '';
    if (deEl.textContent !== deText) deEl.textContent = deText;
    if (viEl.textContent !== viText) viEl.textContent = viText;
    byId('kinoDiscoveryCaptionHint').hidden = Boolean(cue);
    byId('kinoDiscoveryCaptionHint').textContent = showCaptions ? 'Phụ đề Đức – Việt đi cùng lời thoại · Chạm vào một từ tiếng Đức để tra nghĩa ngay.' : 'Đang tắt phụ đề · Bấm CC để xem lại.';
  }
  function refresh() {
    if (!data) return;
    if (video.hasAttribute('src') && video.readyState >= 2 && !video.seeking && video.currentTime >= data.chapter.start) resumeTime = video.currentTime;
    const time = video.hasAttribute('src') ? video.currentTime : resumeTime;
    const elapsed = Math.max(0, Math.min(time, data.chapter.end) - data.chapter.start);
    byId('kinoDiscoveryClock').textContent = clock(elapsed);
    byId('kinoDiscoverySeek').value = elapsed;
    byId('kinoDiscoveryPlay').innerHTML = video.paused ? playIcon : pauseIcon;
    byId('kinoDiscoveryPlay').setAttribute('aria-label', video.paused ? 'Phát phần phim' : 'Tạm dừng phần phim');
    byId('kinoDiscoveryStart').hidden = !video.paused;
    byId('kinoDiscoveryStart').querySelector('strong').textContent = elapsed < .2 ? 'Xem phần này' : finished ? 'Xem lại phần này' : 'Xem tiếp';
    if (!finished && video.currentTime >= data.chapter.end - .04) finish();
    captions();
  }
  function update(next) {
    data = next;
    KinoDubbingScene.update(next);
    const id = `${data.key}:${data.index}`;
    if (lesson !== id) {
      pause();
      lesson = id;
      finished = false;
      resumeTime = data.chapter.start;
      byId('kinoDiscoveryStage').classList.remove('has-started');
      const poster = KinoMedia.poster(data.key, data.index);
      video.poster = poster;
      byId('kinoDiscoveryStage').style.backgroundImage = `url("${poster}")`;
      byId('kinoDiscoverySeek').max = data.chapter.end - data.chapter.start;
      byId('kinoDiscoveryLength').textContent = clock(data.chapter.end - data.chapter.start);
    }
    byId('kinoDiscoveryNotice').textContent = data.watched
      ? '✓ Đã xem phần này. Xem lại hay thử thêm một chút đều được.' : 'Bạn có thể dừng và quay lại bất cứ lúc nào.';
    for (const [id, kind] of [['kinoListenChoice', 'listen'], ['peppaPractice', 'write'], ['kinoSpeakChoice', 'speak']]) {
      const selected = data.activity === kind || kind === 'listen' && data.activity === 'discover';
      byId(id).setAttribute('aria-selected', String(selected));
      byId(id).tabIndex = selected ? 0 : -1;
      if (selected) byId('kinoLessonPanel').setAttribute('aria-labelledby', id);
    }
    refresh();
  }
  return { mount, update, pause };
})();
