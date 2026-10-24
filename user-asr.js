/* VokabelGo — ASR cho "Cảnh học của bạn" (Pha 2 của bản thiết kế):
   tách tiếng từ file video ngay trên thiết bị (giải mã Web Audio -> 16kHz mono),
   gửi qua asr-worker.js (Whisper small; máy không có WebGPU vẫn chạy WASM —
   vẫn dùng small nhưng báo trước là chậm, xem ghi chú trong hộp thoại).
   window.UserAsr là một ADAPTER có thể thay thế (bản kiểm thử e2e gắn bản giả
   để kiểm chứng trọn luồng tạo -> rà -> học mà không tải mô hình thật). */
(function () {
  'use strict';
  const MODEL = 'onnx-community/whisper-small';
  let worker = null, pending = null;

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
      worker.postMessage({ type: 'transcribe', audio, model: (window.UserAsr && window.UserAsr.model) || MODEL }, [audio.buffer]);
    });
  }
  window.UserAsr = { transcribe, cancel, model: MODEL };

  /* ---------- Âm thanh: file video -> Float32Array 16kHz mono trong cửa sổ ---------- */
  async function extractWindowAudio(file, fromSec, toSec) {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const decoded = await actx.decodeAudioData(await file.arrayBuffer());
      const from = Math.max(0, Math.min(fromSec, decoded.duration));
      const to = Math.max(from + 1, Math.min(toSec, decoded.duration));
      const len = Math.ceil((to - from) * 16000);
      const off = new OfflineAudioContext(1, len, 16000);
      const src = off.createBufferSource();
      src.buffer = decoded;
      src.connect(off.destination);
      src.start(0, from, to - from);
      const rendered = await off.startRendering();
      return { audio: rendered.getChannelData(0), from, to };
    } finally { actx.close().catch(() => {}); }
  }

  /* ---------- Giao diện gắn vào hộp thoại tạo cảnh ---------- */
  function mount(panel, st, refreshCreate) {
    if (panel.dataset.mounted) return;
    panel.dataset.mounted = '1';
    const hasGpu = 'gpu' in navigator;
    panel.innerHTML = '<p class="usc-note">App sẽ nghe đoạn video bạn chọn và viết phụ đề tiếng Đức ngay trên thiết bị này — '
      + 'video không được gửi đi đâu. Lần đầu cần tải mô hình nhận dạng (~250MB, các lần sau dùng lại bản đã tải). '
      + (hasGpu ? 'Thiết bị có tăng tốc GPU nên sẽ khá nhanh.' : 'Thiết bị không có tăng tốc GPU: một cảnh 90 giây có thể mất vài phút — hãy kiên nhẫn hoặc chọn đoạn ngắn hơn.')
      + ' Phụ đề máy chắc chắn có chỗ sai — bạn sẽ rà và sửa ở bước Sửa cảnh trước khi học thật.</p>'
      + '<div class="usc-progress" hidden><span id="uscAsrBar" style="width:0%"></span></div>'
      + '<p id="uscAsrStatus" class="usc-note" role="status"></p>'
      + '<div class="usc-foot" style="justify-content:flex-start;">'
      + '<button type="button" id="uscAsrRun" class="btn usc-primary">🎙 Tạo phụ đề tự động</button>'
      + '<button type="button" id="uscAsrCancel" class="btn" hidden>Hủy</button></div>';
    const status = panel.querySelector('#uscAsrStatus');
    const bar = panel.querySelector('.usc-progress');
    const barFill = panel.querySelector('#uscAsrBar');
    const runBtn = panel.querySelector('#uscAsrRun');
    const cancelBtn = panel.querySelector('#uscAsrCancel');
    let ticker = null;
    cancelBtn.onclick = () => { window.UserAsr.cancel(); };
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
        const { audio, from: w0 } = await extractWindowAudio(st.videoFile, from, from + lenSec);
        status.dataset.phase = 'load';
        const chunks = await window.UserAsr.transcribe(audio, p => {
          if (p.status === 'progress') {
            status.dataset.phase = 'load';
            status.textContent = 'Đang tải mô hình: ' + (p.file || '') + ' — ' + p.progress + '%';
            barFill.style.width = p.progress + '%';
          } else if (p.status === 'running') {
            status.dataset.phase = 'running';
            barFill.style.width = '100%';
          }
        });
        const cues = [];
        for (const c of chunks) {
          const cue = { start: Math.round((w0 + c.timestamp[0]) * 100) / 100, end: Math.round((w0 + c.timestamp[1]) * 100) / 100, text: c.text, vi: '' };
          const prev = cues[cues.length - 1];
          if (prev && cue.start - prev.end < 0.4 && cue.end - cue.start < 1.2) { prev.text += ' ' + cue.text; prev.end = cue.end; }
          else cues.push(cue);
        }
        st.asrCues = cues.map((c, i) => ({ ...c, id: i + 1, parentId: i + 1 }));
        status.dataset.phase = 'done';
        status.textContent = 'Đã tạo ' + st.asrCues.length + ' câu phụ đề nháp trong ' + Math.round((Date.now() - t0) / 1000) + 's. Bấm "Tạo cảnh" ở dưới, rồi mở Sửa cảnh để rà lại phụ đề trước khi học.';
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
  window.UserAsrUI = { mount };
})();
