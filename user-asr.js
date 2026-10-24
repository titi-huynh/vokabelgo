/* VokabelGo — ASR cho "Cảnh học của bạn":
   - Tách tiếng từ file video ngay trên thiết bị (Web Audio -> 16kHz mono),
     cache bản tiếng theo dấu vân tay file để lần sau không giải mã lại.
   - Lọc khoảng lặng (VAD theo năng lượng) để Whisper khỏi "nghe ra chữ"
     trong đoạn nhạc/im lặng; nghe theo từng vùng tiếng nói, có tiến độ
     theo đoạn; kết quả được chia lại câu (SrtAlign.resegment).
   - window.UserAsr là ADAPTER thay thế được (kiểm thử gắn bản giả). */
(function () {
  'use strict';
  const MODELS = {
    small: { id: 'onnx-community/whisper-small', label: 'Chuẩn (small, ~250MB) — nghe tốt hơn' },
    base: { id: 'onnx-community/whisper-base', label: 'Nhẹ (base, ~80MB) — nhanh hơn, kém chính xác hơn' }
  };
  const MODEL_LS = 'vokabelgo_asr_model';
  let worker = null, pending = null;

  function chosenModel() {
    try { return MODELS[localStorage.getItem(MODEL_LS)] ? localStorage.getItem(MODEL_LS) : 'small'; }
    catch (e) { return 'small'; }
  }
  function ensureWorker() {
    if (worker) return worker;
    worker = new Worker('asr-worker.js', { type: 'module' });
    worker.onmessage = e => {
      const m = e.data || {};
      if (!pending) return;
      if (m.type === 'progress') pending.onProgress(m);
      else if (m.type === 'result') { const p = pending; pending = null; p.resolve(m.chunks); }
      else if (m.type === 'error') { const p = pending; pending = null; p.reject(new Error(m.message)); }
    };
    worker.onerror = () => {
      if (pending) { const p = pending; pending = null; p.reject(new Error('Không khởi động được bộ nhận dạng tiếng nói. Kiểm tra mạng (lần đầu cần tải mô hình) rồi thử lại.')); }
    };
    return worker;
  }
  function cancel() {
    if (worker) { worker.terminate(); worker = null; }
    if (pending) { const p = pending; pending = null; p.reject(new Error('Đã hủy tạo phụ đề.')); }
  }
  async function transcribe(audio, onProgress) {
    ensureWorker();
    return new Promise((resolve, reject) => {
      pending = { resolve, reject, onProgress: onProgress || (() => {}) };
      worker.postMessage({ type: 'transcribe', audio, model: MODELS[chosenModel()].id }, [audio.buffer]);
    });
  }
  window.UserAsr = { transcribe, cancel, MODELS, chosenModel, _speechRegions: speechRegions };

  /* ---------- Tiếng: giải mã + lấy mẫu lại 16kHz mono, có cache ---------- */
  const fingerprint = file => file.name + '|' + file.size + '|' + (file.lastModified || 0);
  async function fullTrack16k(file) {
    const US = window.UserScenes;
    const fp = fingerprint(file);
    if (US) {
      try {
        const hit = await US.getCachedAudio(fp);
        if (hit) return { samples: new Float32Array(hit), fromCache: true };
      } catch (e) { /* cache hỏng -> giải mã lại */ }
    }
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const decoded = await actx.decodeAudioData(await file.arrayBuffer());
      const len = Math.ceil(decoded.duration * 16000);
      const off = new OfflineAudioContext(1, len, 16000);
      const src = off.createBufferSource();
      src.buffer = decoded; src.connect(off.destination); src.start(0);
      const rendered = await off.startRendering();
      const samples = rendered.getChannelData(0);
      if (US && decoded.duration <= 1200) {
        US.clearAudioCache().then(() => US.cacheAudio(fp, samples.buffer)).catch(() => {});
      }
      return { samples, fromCache: false };
    } finally { actx.close().catch(() => {}); }
  }

  /* ---------- VAD: vùng có tiếng nói theo năng lượng ---------- */
  function speechRegions(samples, sr) {
    const frame = Math.floor(sr * 0.05), n = Math.floor(samples.length / frame);
    if (!n) return [];
    const rms = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sum = 0; const off = i * frame;
      for (let j = 0; j < frame; j += 2) { const v = samples[off + j]; sum += v * v; }
      rms[i] = Math.sqrt(sum / (frame / 2));
    }
    const sorted = [...rms].sort((a, b) => a - b);
    const floor = sorted[Math.floor(n * 0.2)] || 0;
    const th = Math.max(0.012, floor * 3.5);
    const raw = [];
    let start = -1;
    for (let i = 0; i < n; i++) {
      if (rms[i] >= th && start < 0) start = i;
      if ((rms[i] < th || i === n - 1) && start >= 0) { raw.push([start, i]); start = -1; }
    }
    const merged = [];
    for (const [a, b] of raw) {
      const last = merged[merged.length - 1];
      if (last && a - last[1] <= 9) last[1] = b; else merged.push([a, b]);
    }
    const regions = [];
    for (const [a, b] of merged) {
      let s = Math.max(0, (a * frame) / sr - 0.25), e = Math.min(samples.length / sr, (b * frame) / sr + 0.25);
      if (e - s < 0.35) continue;
      while (e - s > 30) { regions.push({ start: s, end: s + 30 }); s += 30; }
      regions.push({ start: s, end: e });
    }
    return regions;
  }

  /* ---------- Giao diện ---------- */
  function mount(panel, st, refreshCreate) {
    if (panel.dataset.mounted) { refreshModelLine(panel); return; }
    panel.dataset.mounted = '1';
    const hasGpu = 'gpu' in navigator;
    panel.innerHTML = '<p class="usc-note">App sẽ nghe đoạn video bạn chọn và viết phụ đề tiếng Đức ngay trên thiết bị này — '
      + 'video không được gửi đi đâu. Đoạn nhạc và im lặng được lọc trước để máy khỏi nghe nhầm. '
      + (hasGpu ? 'Thiết bị có tăng tốc GPU nên sẽ khá nhanh.' : 'Thiết bị không có tăng tốc GPU: một cảnh 90 giây có thể mất vài phút.')
      + ' Phụ đề máy chắc chắn có chỗ sai — bạn sẽ rà và sửa ở bước Sửa cảnh trước khi học thật.</p>'
      + '<label>Mô hình nhận dạng <select id="uscAsrModel">'
      + Object.entries(MODELS).map(([k, m]) => '<option value="' + k + '">' + m.label + '</option>').join('')
      + '</select></label>'
      + '<p id="uscAsrModelLine" class="usc-note"></p>'
      + '<div class="usc-progress" hidden><span id="uscAsrBar" style="width:0%"></span></div>'
      + '<p id="uscAsrStatus" class="usc-note" role="status"></p>'
      + '<div class="usc-foot" style="justify-content:flex-start;">'
      + '<button type="button" id="uscAsrRun" class="btn usc-primary">🎙 Tạo phụ đề tự động</button>'
      + '<button type="button" id="uscAsrCancel" class="btn" hidden>Hủy</button>'
      + '<button type="button" id="uscAsrWipe" class="btn">Xóa mô hình đã tải</button></div>';
    const sel = panel.querySelector('#uscAsrModel');
    sel.value = chosenModel();
    sel.onchange = () => { try { localStorage.setItem(MODEL_LS, sel.value); } catch (e) {} refreshModelLine(panel); };
    panel.querySelector('#uscAsrWipe').onclick = async () => {
      try { await caches.delete('transformers-cache'); } catch (e) { /* bỏ qua */ }
      cancel();
      refreshModelLine(panel);
    };
    refreshModelLine(panel);
    const status = panel.querySelector('#uscAsrStatus');
    const bar = panel.querySelector('.usc-progress');
    const barFill = panel.querySelector('#uscAsrBar');
    const runBtn = panel.querySelector('#uscAsrRun');
    const cancelBtn = panel.querySelector('#uscAsrCancel');
    let ticker = null;
    cancelBtn.onclick = () => window.UserAsr.cancel();
    runBtn.onclick = async () => {
      if (!st.videoFile) { status.textContent = '⚠️ Hãy chọn file video trước.'; return; }
      const winRow = document.getElementById('uscWindowRow');
      const winVisible = winRow && !winRow.hidden;
      const from = winVisible ? Math.max(0, +document.getElementById('uscWinStart').value || 0) : 0;
      const lenSec = winVisible ? (+document.getElementById('uscWinLen').value || 90) : Math.min(st.duration || 300, 300);
      runBtn.disabled = true; cancelBtn.hidden = false;
      bar.hidden = false; barFill.style.width = '0%';
      const t0 = Date.now();
      ticker = setInterval(() => {
        const s = Math.round((Date.now() - t0) / 1000);
        if (status.dataset.phase === 'running') status.textContent = 'Đang nghe và viết phụ đề… ' + s + 's (đừng đóng hộp thoại).';
      }, 1000);
      try {
        status.dataset.phase = 'extract';
        status.textContent = 'Đang tách tiếng khỏi video…';
        const { samples, fromCache } = await fullTrack16k(st.videoFile);
        const sr = 16000;
        const w0 = Math.min(from, samples.length / sr);
        const w1 = Math.min(from + lenSec, samples.length / sr);
        const win = samples.slice(Math.floor(w0 * sr), Math.ceil(w1 * sr));
        const regions = speechRegions(win, sr);
        const coverage = regions.reduce((a, r) => a + (r.end - r.start), 0) / Math.max(1, w1 - w0);
        const jobs = (regions.length && coverage < 0.92) ? regions : [{ start: 0, end: w1 - w0 }];
        status.dataset.phase = 'load';
        let chunks = [];
        let lastEnd = -1;
        for (let i = 0; i < jobs.length; i++) {
          const job = jobs[i];
          const part = win.slice(Math.floor(job.start * sr), Math.ceil(job.end * sr));
          const out = await window.UserAsr.transcribe(part, p => {
            if (p.status === 'progress') {
              status.dataset.phase = 'load';
              status.textContent = 'Đang tải mô hình: ' + (p.file || '') + ' — ' + p.progress + '%';
              barFill.style.width = p.progress + '%';
            } else if (p.status === 'running') status.dataset.phase = 'running';
          });
          for (const c of out) {
            const absStart = w0 + job.start + c.timestamp[0];
            if (absStart < lastEnd - 0.3) continue;
            lastEnd = w0 + job.start + c.timestamp[1];
            chunks.push({ start: absStart, end: lastEnd, text: c.text });
          }
          barFill.style.width = Math.round(((i + 1) / jobs.length) * 100) + '%';
          if (jobs.length > 1) status.textContent = 'Đã nghe xong đoạn ' + (i + 1) + '/' + jobs.length + '…';
        }
        let cues = [];
        for (const c of chunks) {
          const cue = { start: Math.round(c.start * 100) / 100, end: Math.round(c.end * 100) / 100, text: c.text, vi: '' };
          const prev = cues[cues.length - 1];
          if (prev && cue.start - prev.end < 0.4 && cue.end - cue.start < 1.2) { prev.text += ' ' + cue.text; prev.end = cue.end; }
          else cues.push(cue);
        }
        if (window.SrtAlign && SrtAlign.resegment) cues = SrtAlign.resegment(cues.map((c, i) => ({ ...c, id: i + 1, parentId: i + 1 })));
        st.asrCues = cues.map((c, i) => ({ ...c, id: i + 1, parentId: i + 1 }));
        status.dataset.phase = 'done';
        status.textContent = 'Đã tạo ' + st.asrCues.length + ' câu phụ đề nháp trong ' + Math.round((Date.now() - t0) / 1000) + 's'
          + (fromCache ? ' (dùng lại tiếng đã tách lần trước)' : '')
          + (jobs.length > 1 ? ' từ ' + jobs.length + ' đoạn có tiếng nói' : '')
          + '. Bấm "Tạo cảnh" ở dưới, rồi mở Sửa cảnh để rà lại phụ đề trước khi học.';
        refreshCreate();
      } catch (e) {
        status.dataset.phase = 'error';
        status.textContent = '⚠️ ' + e.message;
      } finally {
        clearInterval(ticker);
        runBtn.disabled = false; cancelBtn.hidden = true;
      }
    };
  }
  async function refreshModelLine(panel) {
    const line = panel.querySelector('#uscAsrModelLine');
    if (!line) return;
    let cached = false;
    try { cached = await caches.has('transformers-cache'); } catch (e) { /* bỏ qua */ }
    let usage = '';
    try {
      const est = await navigator.storage.estimate();
      if (est && est.usage) usage = ' · dữ liệu app trên máy này ≈ ' + Math.round(est.usage / 1048576) + 'MB';
    } catch (e) { /* bỏ qua */ }
    line.textContent = (cached ? 'Mô hình đã có trên máy — không phải tải lại.' : 'Mô hình sẽ được tải ở lần tạo phụ đề đầu tiên và lưu lại trên máy.') + usage;
  }
  window.UserAsrUI = { mount };
})();
