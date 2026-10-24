/* VokabelGo — Giao diện "Cảnh học của bạn": khu vực trong catalog Kino,
   hộp thoại tạo cảnh (đường SRT; đường ASR do user-asr.js gắn vào), trình sửa.
   Thiết kế: workspace/VokabelGo_CanhHocCuaBan_ThietKe.md. */
(function () {
  'use strict';
  const US = () => window.UserScenes;
  const $ = id => document.getElementById(id);
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtMB = b => (b / 1048576).toFixed(b >= 10485760 ? 0 : 1) + 'MB';
  const fmtDur = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  /* ================= Khu vực trong catalog ================= */
  function renderSection() {
    const catalog = $('kinoCatalog');
    if (!catalog || !US()) return;
    let sec = $('userScenesSection');
    if (!sec) {
      sec = document.createElement('section');
      sec.id = 'userScenesSection';
      sec.className = 'usc-section';
      sec.innerHTML = '<div class="usc-head"><div><h3>🎬 Cảnh của bạn</h3>'
        + '<p class="usc-sub">Video bạn tự thêm để học như phim Kino. Video và bản thu chỉ lưu trên thiết bị này.</p></div>'
        + '<button type="button" id="uscAddBtn" class="btn">＋ Thêm cảnh</button></div>'
        + '<div id="uscGrid" class="usc-grid"></div>'
        + '<p id="uscEmpty" class="usc-empty">Chưa có cảnh nào. Thêm một đoạn video tiếng Đức kèm phụ đề SRT, hoặc để app tự tạo phụ đề.</p>'
        + '<p id="uscUsage" class="usc-usage"></p>';
      catalog.append(sec);
      sec.querySelector('#uscAddBtn').onclick = openCreate;
    }
    const grid = sec.querySelector('#uscGrid');
    grid.replaceChildren();
    const list = US().list();
    sec.querySelector('#uscEmpty').hidden = list.length > 0;
    for (const scene of list) {
      const key = US().keyOf(scene.id);
      const card = document.createElement('article');
      card.className = 'usc-card';
      const badge = scene.source === 'asr'
        ? (scene.reviewed ? '<span class="usc-badge ok">Phụ đề máy · Đã rà</span>' : '<span class="usc-badge warn">Phụ đề máy — chưa rà</span>')
        : '<span class="usc-badge ok">Phụ đề của bạn</span>';
      card.innerHTML = (scene.poster ? '<img class="usc-poster" src="' + scene.poster + '" alt="">' : '<div class="usc-poster usc-noposter">🎬</div>')
        + '<div class="usc-card-body"><strong>' + esc(scene.title) + '</strong>'
        + '<small>' + scene.cues.length + ' câu · ' + fmtDur(scene.duration || 0) + '</small>' + badge
        + '<div class="usc-actions"><a class="btn usc-learn" href="?kino=' + key + '">Học cảnh này</a>'
        + '<button type="button" class="btn usc-edit">✏️ Sửa</button>'
        + '<button type="button" class="btn usc-del">🗑 Xóa</button></div></div>';
      card.querySelector('.usc-edit').onclick = () => openEditor(scene.id);
      card.querySelector('.usc-del').onclick = async () => {
        if (!confirm('Xóa cảnh "' + scene.title + '"? Video, lời thoại và bản thu lồng tiếng của cảnh sẽ bị xóa khỏi thiết bị này.')) return;
        await US().remove(scene.id);
        renderSection();
      };
      grid.append(card);
    }
    sec.querySelector('#uscUsage').textContent =
      'Đã dùng ' + fmtMB(US().videoBytesTotal()) + ' / 300MB cho video tự thêm. Xóa dữ liệu trình duyệt sẽ mất các cảnh này.';
  }

  /* ================= Tạo cảnh ================= */
  let dlg = null, st = null;
  function freshState() {
    return { videoFile: null, duration: 0, cuesAll: [], matched: 0, hasVi: false, mode: 'srt' };
  }
  function openCreate() {
    if (!dlg) buildCreate();
    st = freshState();
    $('uscTitle').value = ''; $('uscVideo').value = ''; $('uscSrtDe').value = ''; $('uscSrtVi').value = '';
    $('uscCreateStatus').textContent = ''; $('uscWindowRow').hidden = true;
    $('uscCreateBtn').disabled = true; $('uscAsrPanel').hidden = true; $('uscSrtPanel').hidden = false;
    dlg.querySelector('input[name="uscMode"][value="srt"]').checked = true;
    dlg.showModal();
  }
  function buildCreate() {
    dlg = document.createElement('dialog');
    dlg.id = 'uscCreateDialog'; dlg.className = 'usc-dialog';
    dlg.innerHTML = '<form method="dialog" class="usc-form">'
      + '<header><h3>Thêm cảnh học của bạn</h3><button type="submit" class="usc-x" aria-label="Đóng">✕</button></header>'
      + '<label>Tên cảnh <input id="uscTitle" type="text" placeholder="VD: Cảnh ở chợ — phim của tôi" maxlength="80"></label>'
      + '<label>File video (mp4/webm, tối đa 200MB) <input id="uscVideo" type="file" accept="video/*"></label>'
      + '<fieldset class="usc-modes"><legend>Nguồn phụ đề</legend>'
      + '<label><input type="radio" name="uscMode" value="srt" checked> Kèm file phụ đề SRT</label>'
      + '<label><input type="radio" name="uscMode" value="asr"> Tự tạo phụ đề từ tiếng nói (ASR)</label></fieldset>'
      + '<div id="uscSrtPanel">'
      + '<label>Phụ đề tiếng Đức — SRT hoặc VTT (bắt buộc) <input id="uscSrtDe" type="file" accept=".srt,.vtt,text/plain"></label>'
      + '<label>Phụ đề tiếng Việt — SRT hoặc VTT (tùy chọn) <input id="uscSrtVi" type="file" accept=".srt,.vtt,text/plain"></label>'
      + '</div>'
      + '<div id="uscAsrPanel" hidden></div>'
      + '<div id="uscWindowRow" hidden><label>Bắt đầu từ giây <input id="uscWinStart" type="number" min="0" step="1"></label>'
      + '<label>Độ dài cảnh <select id="uscWinLen"><option value="60">60 giây</option><option value="90" selected>90 giây</option><option value="180">3 phút</option><option value="300">5 phút</option></select></label>'
      + '<p id="uscWinInfo" class="usc-note"></p></div>'
      + '<p id="uscCreateStatus" class="usc-note" role="status"></p>'
      + '<div class="usc-foot"><button type="submit" class="btn">Hủy</button>'
      + '<button type="button" id="uscCreateBtn" class="btn usc-primary" disabled>Tạo cảnh</button></div></form>';
    document.body.append(dlg);
    dlg.addEventListener('change', e => {
      if (e.target.name === 'uscMode') {
        st.mode = e.target.value;
        $('uscSrtPanel').hidden = st.mode !== 'srt';
        $('uscAsrPanel').hidden = st.mode !== 'asr';
        if (st.mode === 'asr' && window.UserAsrUI) window.UserAsrUI.mount($('uscAsrPanel'), st, refreshCreate);
        refreshCreate();
      }
    });
    $('uscVideo').addEventListener('change', async () => {
      st.videoFile = $('uscVideo').files[0] || null;
      st.duration = 0;
      if (st.videoFile) {
        if (!$('uscTitle').value) $('uscTitle').value = st.videoFile.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
        try { st.duration = await probeDuration(st.videoFile); } catch (e) { /* giữ 0 */ }
      }
      refreshCreate();
    });
    const onSrt = async () => {
      const deF = $('uscSrtDe').files[0], viF = $('uscSrtVi').files[0];
      if (!deF) { st.cuesAll = []; refreshCreate(); return; }
      const built = window.SrtAlign.buildSceneCues(await deF.text(), viF ? await viF.text() : '');
      st.cuesAll = built.cues; st.matched = built.matched; st.hasVi = !!viF;
      refreshCreate();
    };
    $('uscSrtDe').addEventListener('change', onSrt);
    $('uscSrtVi').addEventListener('change', onSrt);
    $('uscWinStart').addEventListener('input', refreshCreate);
    $('uscWinLen').addEventListener('change', refreshCreate);
    $('uscCreateBtn').onclick = createScene;
  }
  function probeDuration(file) {
    return new Promise((resolve, reject) => {
      const v = document.createElement('video');
      v.preload = 'metadata'; v.muted = true;
      v.onloadedmetadata = () => { const d = v.duration; URL.revokeObjectURL(v.src); resolve(Number.isFinite(d) ? d : 0); };
      v.onerror = () => reject(new Error('Không đọc được video'));
      v.src = URL.createObjectURL(file);
    });
  }
  function windowedCues() {
    const all = st.mode === 'asr' ? (st.asrCues || []) : st.cuesAll;
    if (!all.length) return [];
    const span = all[all.length - 1].end - all[0].start;
    if (span <= 300 && st.mode === 'srt') return all;
    const from = Math.max(0, +($('uscWinStart').value || all[0].start));
    const len = +($('uscWinLen').value || 90);
    return window.SrtAlign.windowCues(all, from, from + len);
  }
  function refreshCreate() {
    if (!st) return;
    const all = st.mode === 'asr' ? (st.asrCues || []) : st.cuesAll;
    const span = all.length ? all[all.length - 1].end - all[0].start : 0;
    const needWindow = all.length > 0 ? (span > 300 || st.mode === 'asr')
      : (st.mode === 'asr' && !!st.videoFile && (st.duration || 0) > 300);
    $('uscWindowRow').hidden = !needWindow;
    if (needWindow && !$('uscWinStart').value) $('uscWinStart').value = all.length ? Math.floor(all[0].start) : 0;
    const win = windowedCues();
    if (st.mode === 'srt') {
      $('uscWinInfo').textContent = all.length
        ? 'Phụ đề có ' + all.length + ' câu' + (st.hasVi ? ' · ghép được ' + st.matched + ' bản dịch' : ' · chưa có bản dịch Việt') + (needWindow ? ' · cảnh sẽ lấy ' + win.length + ' câu trong cửa sổ đã chọn (tối đa 5 phút).' : '.')
        : '';
    } else {
      $('uscWinInfo').textContent = all.length ? 'ASR đã tạo ' + all.length + ' câu nháp · cảnh sẽ lấy ' + win.length + ' câu trong cửa sổ đã chọn.' : '';
    }
    $('uscCreateBtn').disabled = !(st.videoFile && win.length > 0);
  }
  async function capturePoster(file, at) {
    try {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.muted = true; v.preload = 'auto'; v.src = url;
      await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = rej; });
      v.currentTime = Math.min(Math.max(0.1, at), Math.max(0.2, (v.duration || 1) - 0.2));
      await new Promise(res => { v.onseeked = res; setTimeout(res, 1500); });
      const c = document.createElement('canvas');
      const w = 320, h = Math.max(90, Math.round(w * (v.videoHeight || 180) / (v.videoWidth || 320)));
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(v, 0, 0, w, h);
      URL.revokeObjectURL(url);
      return c.toDataURL('image/jpeg', 0.72);
    } catch (e) { return ''; }
  }
  async function createScene() {
    const win = windowedCues();
    if (!st.videoFile || !win.length) return;
    const btn = $('uscCreateBtn');
    btn.disabled = true; $('uscCreateStatus').textContent = 'Đang lưu cảnh…';
    try {
      const poster = await capturePoster(st.videoFile, win[0].start + 0.2);
      const scene = await US().create({
        title: $('uscTitle').value.trim() || 'Cảnh của tôi',
        source: st.mode, reviewed: st.mode === 'srt',
        hasVi: st.mode === 'srt' ? st.hasVi : false,
        duration: st.duration || win[win.length - 1].end,
        videoBlob: st.videoFile, poster,
        cues: win, chapters: window.SrtAlign.draftChapters(win, 150)
      });
      dlg.close();
      renderSection();
      location.assign('?kino=' + US().keyOf(scene.id));
    } catch (e) {
      $('uscCreateStatus').textContent = '⚠️ ' + e.message;
      btn.disabled = false;
    }
  }

  /* ================= Trình sửa (gắn ở Pha 1c) ================= */
  function openEditor(id) {
    if (window.UserScenesEditor) window.UserScenesEditor.open(id, renderSection);
  }

  window.UserScenesUI = { renderSection, openCreate, openEditor, _state: () => st };
})();
