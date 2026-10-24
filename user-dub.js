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

  /* Chuẩn hoá độ lớn của một bản thu về quanh mức RMS mục tiêu (giới hạn hệ số). */
  function normalizeGain(buffer) {
    let sum = 0, count = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < d.length; i += 4) { sum += d[i] * d[i]; count++; }
    }
    const rms = Math.sqrt(sum / Math.max(1, count));
    if (!rms) return 1;
    return Math.min(3, Math.max(0.5, 0.12 / rms));
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
            const g = ctx.createGain();
            g.gain.value = normalizeGain(buf);
            src.connect(g); g.connect(ctx.destination);
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

  /* Xuất bản trộn thành file WAV: tiếng gốc (duck 0,1 ở đoạn có bản thu) + các bản thu đã chuẩn hoá. */
  function encodeWav(buffer) {
    const nCh = Math.min(2, buffer.numberOfChannels), sr = buffer.sampleRate;
    const len = buffer.length * nCh * 2 + 44;
    const ab = new ArrayBuffer(len), v = new DataView(ab);
    const wstr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    wstr(0, 'RIFF'); v.setUint32(4, len - 8, true); wstr(8, 'WAVEfmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nCh, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * nCh * 2, true); v.setUint16(32, nCh * 2, true);
    v.setUint16(34, 16, true); wstr(36, 'data'); v.setUint32(40, len - 44, true);
    const chans = [];
    for (let c = 0; c < nCh; c++) chans.push(buffer.getChannelData(c));
    let o = 44;
    for (let i = 0; i < buffer.length; i++) for (let c = 0; c < nCh; c++) {
      const x = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(o, x * 0x7fff, true); o += 2;
    }
    return new Blob([ab], { type: 'audio/wav' });
  }
  async function exportMix(btn) {
    const key = currentKey();
    if (!US() || !US().isUserKey(key)) return;
    const scene = US().getByKey(key);
    const cues = (typeof KinoData !== 'undefined' && KinoData.cues(key)) || [];
    if (!scene || !cues.length) return;
    btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳ Đang dựng file…';
    try {
      const videoBlob = await US().loadVideo(scene.id);
      if (!videoBlob) throw new Error('Không tìm thấy video của cảnh.');
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const original = await actx.decodeAudioData(await videoBlob.arrayBuffer());
      await actx.close();
      const sr = original.sampleRate;
      const t0 = cues[0].start, t1 = cues[cues.length - 1].end + 0.3;
      const off = new OfflineAudioContext(original.numberOfChannels, Math.ceil((t1 - t0) * sr), sr);
      const src = off.createBufferSource(); src.buffer = original;
      const duck = off.createGain(); duck.gain.value = 1;
      src.connect(duck); duck.connect(off.destination);
      const dctx = new OfflineAudioContext(1, 1, sr);
      let any = false;
      for (const cue of cues) {
        const blob = await US().loadTake(key, token(cue.id));
        if (!blob) continue;
        any = true;
        const buf = await dctx.decodeAudioData(await blob.arrayBuffer());
        const ts = off.createBufferSource(); ts.buffer = buf;
        const g = off.createGain(); g.gain.value = normalizeGain(buf);
        ts.connect(g); g.connect(off.destination);
        ts.start(cue.start - t0);
        duck.gain.setValueAtTime(1, Math.max(0, cue.start - t0 - 0.05));
        duck.gain.linearRampToValueAtTime(0.1, Math.max(0.01, cue.start - t0 + 0.03));
        duck.gain.setValueAtTime(0.1, Math.max(0.01, cue.start - t0 + buf.duration - 0.03));
        duck.gain.linearRampToValueAtTime(1, Math.max(0.02, cue.start - t0 + buf.duration + 0.05));
      }
      if (!any) { alert('Cảnh này chưa có câu nào được lồng tiếng.'); return; }
      src.start(0, t0, t1 - t0);
      const rendered = await off.startRendering();
      const wav = encodeWav(rendered);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(wav);
      a.download = 'ban-tron-' + scene.title.replace(/[^\wÀ-ỹ-]+/g, '-').slice(0, 40) + '.wav';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) {
      alert('Không xuất được bản trộn: ' + e.message);
    } finally { btn.disabled = false; btn.textContent = old; }
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
      const exp = document.createElement('button');
      exp.type = 'button'; exp.id = 'uscMixExport'; exp.className = 'btn';
      exp.style.cssText = 'margin:6px 0 0;width:100%;';
      exp.textContent = '⬇ Tải bản trộn (file audio)';
      exp.onclick = () => exportMix(exp);
      recBtn.parentElement.append(exp);
      const del = document.createElement('button');
      del.type = 'button'; del.id = 'uscTakeDelete'; del.className = 'btn';
      del.style.cssText = 'margin:6px 0 0;width:100%;';
      del.textContent = '🗑 Xóa bản thu của câu này';
      del.onclick = async () => {
        const segs = currentSegs();
        let idx = -1;
        try { idx = typeof kinoCurrentIndex === 'number' ? kinoCurrentIndex : -1; } catch (e) {}
        const cue = segs[idx];
        if (!cue || cue.id == null) return;
        await US().deleteTake(key, token(cue.id));
        hydrated.delete(key + '|' + token(cue.id));
        const map = currentMap();
        if (map && map[idx]) { URL.revokeObjectURL(map[idx]); delete map[idx]; }
        if (typeof loadKinoSentence === 'function') loadKinoSentence(idx);
      };
      recBtn.parentElement.append(del);
    }
    if (!show && btn) {
      stopMix(); btn.remove();
      document.getElementById('uscMixExport')?.remove();
      document.getElementById('uscTakeDelete')?.remove();
    }
    if (show) {
      hydrate(key, currentMap());
      const del = document.getElementById('uscTakeDelete');
      if (del) {
        const map = currentMap();
        let idx = -1;
        try { idx = typeof kinoCurrentIndex === 'number' ? kinoCurrentIndex : -1; } catch (e) {}
        del.hidden = !(map && map[idx]);
      }
    }
  }
  setInterval(watch, 1200);

  window.UserDub = { onRecorded, hydrate };
})();
