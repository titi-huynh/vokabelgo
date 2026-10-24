/* VokabelGo — Lồng tiếng cho "Cảnh học của bạn":
   1) Lưu bản thu theo ID CÂU vào IndexedDB (qua hook trong index.html) và
      nạp lại vào bản đồ bản thu của bài học mỗi khi mở cảnh (hydrate).
   2) "Nghe cảnh với giọng mình": phát cả cảnh, tiếng gốc hạ xuống 10% (D4)
      đúng đoạn đã thu, giọng người học phát đúng mốc câu — không cần stem. */
(function () {
  'use strict';
  const US = () => window.UserScenes;
  const token = cueId => 'c' + cueId;
  const hydrated = new Set();   /* "key|token" đã nạp trong phiên */

  function currentKey() {
    try { return typeof currentKinoVideoKey === 'string' ? currentKinoVideoKey : ''; }
    catch (e) { return ''; }
  }
  function currentMap() {
    try { return typeof kinoDubbingBlobUrls !== 'undefined' ? kinoDubbingBlobUrls : null; }
    catch (e) { return null; }
  }
  function currentSegs() {
    try { return typeof PIZZASCHWESTER_72_SEGMENTS !== 'undefined' ? PIZZASCHWESTER_72_SEGMENTS : []; }
    catch (e) { return []; }
  }

  /* Hook từ runKinoDubbingRecording (index.html) khi một bản thu hoàn tất. */
  function onRecorded(blob, seg) {
    const key = currentKey();
    if (!US() || !US().isUserKey(key) || !seg || seg.id == null) return;
    US().saveTake(key, token(seg.id), blob).catch(() => {});
  }

  /* Đổ bản thu đã lưu vào bản đồ trong bộ nhớ của bài học (theo vị trí câu hiện tại). */
  async function hydrate(key, map) {
    if (!US() || !US().isUserKey(key) || !map) return;
    const segs = currentSegs();
    for (let i = 0; i < segs.length; i++) {
      const id = segs[i] && segs[i].id;
      if (id == null || map[i]) continue;
      const stamp = key + '|' + token(id);
      if (hydrated.has(stamp)) continue;
      hydrated.add(stamp);
      try {
        const blob = await US().loadTake(key, token(id));
        if (blob && !map[i]) map[i] = URL.createObjectURL(blob);
      } catch (e) { /* bỏ qua câu này */ }
    }
  }

  /* ================= Bản trộn duck ================= */
  let mix = null;   /* { ctx, video, raf, takes: Map<cueId, AudioBuffer>, stopAt, started: Set } */
  async function playMix(btn) {
    const key = currentKey();
    if (!US() || !US().isUserKey(key)) return;
    if (mix) { stopMix(); return; }
    const video = document.getElementById('kinoMainVideo');
    const cues = (typeof KinoData !== 'undefined' && KinoData.cues(key)) || [];
    if (!video || !cues.length) return;
    btn.disabled = true; btn.textContent = '⏳ Đang chuẩn bị bản trộn…';
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const takes = new Map();
      for (const cue of cues) {
        const blob = await US().loadTake(key, token(cue.id));
        if (!blob) continue;
        const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
        takes.set(cue.id, buf);
      }
      if (!takes.size) {
        btn.disabled = false; btn.textContent = '▶ Nghe cảnh với giọng mình';
        alert('Cảnh này chưa có câu nào được lồng tiếng. Hãy thu thử một câu trước nhé.');
        await ctx.close();
        return;
      }
      const first = cues[0], last = cues[cues.length - 1];
      mix = { ctx, video, takes, started: new Set(), raf: 0, stopAt: last.end + 0.4, btn };
      video.muted = false;
      try {
        const playPromise = (typeof KinoMedia !== 'undefined')
          ? KinoMedia.play(video, Math.max(0, first.start - 0.15), key)
          : (video.currentTime = Math.max(0, first.start - 0.15), video.play());
        await Promise.race([Promise.resolve(playPromise).catch(() => {}), new Promise(r => setTimeout(r, 4000))]);
      } catch (e) { /* vẫn tiếp tục: tick sẽ tự dừng nếu video không chạy */ }
      if (video.paused) { stopMix(); btn.disabled = false; btn.textContent = '▶ Nghe cảnh với giọng mình'; return; }
      if (ctx.state === 'suspended') await ctx.resume();
      btn.disabled = false; btn.textContent = '⏹ Dừng bản trộn';
      const tick = () => {
        if (!mix) return;
        const t = video.currentTime;
        let inDub = false;
        for (const cue of cues) {
          const buf = takes.get(cue.id);
          if (!buf) continue;
          if (t >= cue.start && t <= cue.end + buf.duration) inDub = true;
          if (t >= cue.start - 0.05 && t < cue.start + buf.duration && !mix.started.has(cue.id)) {
            mix.started.add(cue.id);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0, Math.max(0, t - cue.start));
          }
        }
        video.volume = inDub ? 0.1 : 1.0;
        if (t >= mix.stopAt || video.ended) { stopMix(); return; }
        mix.raf = requestAnimationFrame(tick);
      };
      mix.raf = requestAnimationFrame(tick);
      video.addEventListener('pause', onVideoPause);
    } catch (e) {
      btn.disabled = false; btn.textContent = '▶ Nghe cảnh với giọng mình';
      mix = null;
    }
  }
  function onVideoPause() { if (mix) stopMix(); }
  function stopMix() {
    if (!mix) return;
    cancelAnimationFrame(mix.raf);
    mix.video.volume = 1.0;
    mix.video.removeEventListener('pause', onVideoPause);
    if (!mix.video.paused) mix.video.pause();
    mix.ctx.close().catch(() => {});
    if (mix.btn) mix.btn.textContent = '▶ Nghe cảnh với giọng mình';
    mix = null;
  }

  /* Tiêm nút bản trộn vào panel lồng tiếng khi đang học cảnh người dùng. */
  function watch() {
    const key = currentKey();
    const recBtn = document.getElementById('kinoDubRecordBtn');
    let btn = document.getElementById('uscMixBtn');
    const show = !!(US() && US().isUserKey(key) && recBtn && document.body.dataset.hub === 'kino');
    if (show && !btn) {
      btn = document.createElement('button');
      btn.type = 'button'; btn.id = 'uscMixBtn'; btn.className = 'btn';
      btn.style.cssText = 'margin:8px 0 0;width:100%;';
      btn.textContent = '▶ Nghe cảnh với giọng mình';
      btn.onclick = () => playMix(btn);
      recBtn.parentElement.append(btn);
    }
    if (!show && btn) { stopMix(); btn.remove(); }
    if (show) hydrate(key, currentMap());
  }
  setInterval(watch, 1200);

  window.UserDub = { onRecorded, hydrate };
})();
