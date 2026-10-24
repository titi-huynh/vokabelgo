/* Only an explicitly opened player owns a movie source. Lesson data stays separate. */
const KinoMedia = (() => {
  const ids = ['kinoMainVideo', 'kinoDiscoveryVideo', 'kinoFullPlayer'];
  const jobs = new WeakMap();
  const preferenceKey = 'vokabelgo_kino_quality_v2';
  // Verified source display ratios. Other current films are 16:9;
  // metadata refines this automatically when a new source is opened.
  const ratios = { sakura_s01e01: 4 / 3 };
  let quality = '480p', control;
  try {
    if ((localStorage.getItem(preferenceKey) || localStorage.getItem('vokabelgo_kino_sakura_quality_v1')) === 'original') quality = 'original';
  } catch (_) {}
  const aborted = () => new DOMException('Media action replaced', 'AbortError');
  const players = () => ids.map(id => document.getElementById(id)).filter(Boolean);
  function updateAspectRatio(key, ratio = ratios[key] || 16 / 9) {
    if (!Number.isFinite(ratio) || ratio <= 0) return;
    ratios[key] = ratio;
    document.querySelector('.kino-v3-root')?.style.setProperty('--kino-video-ratio', String(ratio));
  }
  function poster(key, index) {
    const cd = (typeof KINO_CHAPTER_DATA !== 'undefined' && KINO_CHAPTER_DATA[key]) || null;
    if (cd && cd.posterUrl) return cd.posterUrl;
    return `assets/kino-posters/${key}${key === 'sakura_s01e01' ? '-native' : ''}-${index + 1}.jpg`;
  }
  document.addEventListener('loadedmetadata', event => {
    const video = event.target;
    if (ids.includes(video.id) && video.getAttribute('src') === source() && video.videoWidth && video.videoHeight) {
      updateAspectRatio(currentKinoVideoKey, video.videoWidth / video.videoHeight);
    }
  }, true);
  function source(key = currentKinoVideoKey) {
    if (quality === '480p') {
      if (KINO_MEDIA_MANIFEST[key]) return KINO_MEDIA_MANIFEST[key].src;
      if (key === 'sakura_s01e01') return 'video/sakura_s01e01-480p.mp4?v=1';
    }
    return KINO_VIDEOS[key].src;
  }
  function cancel(video) {
    const job = jobs.get(video);
    job?.controller.abort();
    jobs.delete(video);
  }
  function release(video) {
    if (!video) return;
    cancel(video);
    video.pause();
    if (video.hasAttribute('src')) {
      video.removeAttribute('src');
      video.preload = 'none';
      video.load(); // Abort the old network request and free its media buffer.
    }
  }
  function releaseAll() { players().forEach(release); }
  function wait(video, events, ready, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) { reject(aborted()); return; }
      if (ready()) { resolve(); return; }
      const cleanup = () => {
        clearTimeout(timer);
        events.forEach(name => video.removeEventListener(name, check));
        video.removeEventListener('error', fail);
        signal.removeEventListener('abort', stop);
      };
      const check = () => { if (ready()) { cleanup(); resolve(); } };
      const fail = () => { cleanup(); reject(new Error('Không tải được video. Chị thử phát lại nhé.')); };
      const stop = () => { cleanup(); reject(aborted()); };
      const timer = setTimeout(fail, 30000);
      events.forEach(name => video.addEventListener(name, check));
      video.addEventListener('error', fail);
      signal.addEventListener('abort', stop, { once: true });
    });
  }
  async function prepare(video, time, key = currentKinoVideoKey) {
    players().filter(other => other !== video).forEach(release);
    cancel(video);
    video.pause();
    const controller = new AbortController();
    const job = { controller, time, resume: false, pending: true };
    jobs.set(video, job);
    const signal = controller.signal;
    const src = source(key);
    const rate = video.playbackRate;
    if (video.getAttribute('src') !== src || video.error) {
      video.preload = 'metadata';
      video.src = src;
      video.load();
      video.playbackRate = rate;
    }
    await wait(video, ['loadedmetadata'], () => video.readyState >= 1, signal);
    if (signal.aborted) throw aborted();
    const target = Math.max(0, Math.min(time, video.duration));
    if (Math.abs(video.currentTime - target) > .005) video.currentTime = target;
    await wait(video, ['seeked', 'loadeddata', 'canplay'],
      () => !video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - target) < .06, signal);
    if (signal.aborted) throw aborted();
    job.pending = false;
    return job;
  }
  function report(video, error) {
    if (error.name === 'AbortError') return;
    let status = document.getElementById('kinoMediaStatus');
    if (status) status.textContent = 'Chưa tải được video. Chị nhấn phát lại hoặc chọn bản gốc nhé.';
    console.warn('Kino media:', error.message);
  }
  async function play(video, time, key = currentKinoVideoKey) {
    const pending = prepare(video, time, key);
    const job = jobs.get(video);
    job.resume = true;
    try {
      await pending;
      if (jobs.get(video) !== job) return false;
      await video.play();
      if (jobs.get(video) !== job) { if (!jobs.has(video)) video.pause(); return false; }
      document.getElementById('kinoMediaStatus')?.replaceChildren();
      return true;
    } catch (error) { report(video, error); return false; }
  }
  function position(video, time) {
    cancel(video);
    video.pause();
    // Selecting a sentence must never attach an unopened video.
    if (video.hasAttribute('src')) prepare(video, time).catch(error => report(video, error));
  }
  async function changeQuality(select) {
    if (kinoIsDubbing) { select.value = quality; return; }
    const active = players().find(video => video.hasAttribute('src'));
    const job = active && jobs.get(active);
    const time = active ? job?.pending ? job.time : active.currentTime : 0;
    const resume = active && (!active.paused || job?.resume && job.pending);
    quality = select.value;
    document.querySelectorAll('[data-kino-quality]').forEach(other => { other.value = quality; });
    try { localStorage.setItem(preferenceKey, quality); } catch (_) {}
    if (!active) return;
    pauseKinoDubbingReplay();
    document.getElementById('kinoMediaStatus').textContent = 'Đang đổi chất lượng…';
    if (resume) await play(active, time);
    else try { await prepare(active, time); document.getElementById('kinoMediaStatus').textContent = ''; }
    catch (error) { report(active, error); }
  }
  function update(key) {
    updateAspectRatio(key);
    if (!control) {
      control = document.createElement('div');
      control.className = 'kino-media-options';
      control.innerHTML = '<label id="kinoQualityLabel">Chất lượng <select id="kinoQuality" data-kino-quality aria-label="Chất lượng phim"><option value="480p">Tiết kiệm 480p</option><option value="original">Bản gốc</option></select></label><span id="kinoMediaStatus" role="status" aria-live="polite"></span>';
      document.querySelector('.kino-v3-top-header').after(control);
      const modalControl = document.createElement('div');
      modalControl.className = 'kino-media-options';
      modalControl.innerHTML = '<label id="kinoFullQualityLabel">Chất lượng <select id="kinoFullQuality" data-kino-quality aria-label="Chất lượng khi xem phim"><option value="480p">Tiết kiệm 480p</option><option value="original">Bản gốc</option></select></label>';
      document.querySelector('.kino-full-modal-header').after(modalControl);
      document.querySelectorAll('[data-kino-quality]').forEach(select => {
        select.value = quality;
        select.addEventListener('change', () => changeQuality(select));
      });
    }
    const hasLight = Boolean(KINO_MEDIA_MANIFEST[key]) || key === 'sakura_s01e01';
    document.getElementById('kinoQualityLabel').hidden = !hasLight;
    document.getElementById('kinoFullQualityLabel').hidden = !hasLight;
    document.getElementById('kinoMediaStatus').textContent = '';
  }
  document.addEventListener('DOMContentLoaded', () => {
    new MutationObserver(() => { if (document.body.dataset.hub !== 'kino') releaseAll(); })
      .observe(document.body, { attributes: true, attributeFilter: ['data-hub'] });
  });
  window.addEventListener('pagehide', releaseAll);
  return { source, poster, release, releaseAll, cancel, prepare, play, position, update };
})();
