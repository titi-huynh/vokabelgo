/* VokabelGo — Trình sửa phụ đề cho "Cảnh học của bạn": sửa chữ Đức/Việt,
   nudge mốc thời gian ±0,2s, xóa câu, đổi tên phần, đánh dấu đã rà (cảnh ASR).
   Xóa câu sẽ làm lệch vị trí bản thu lồng tiếng nên bản thu của cảnh bị xóa
   kèm khi lưu (báo rõ trong hộp thoại). */
(function () {
  'use strict';
  const US = () => window.UserScenes;
  const $ = id => document.getElementById(id);
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  let dlg = null, work = null, sceneId = null, onDoneCb = null, deletedAny = false;
  let previewUntil = -1;
  function flagFor(cue, prev) {
    const reasons = [];
    const dur = cue.end - cue.start;
    if (dur > 8) reasons.push('câu dài ' + dur.toFixed(1) + 's');
    if (dur < 0.4) reasons.push('quá ngắn');
    if (cue.text.length > 140) reasons.push('nhiều chữ bất thường');
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\u0400-\u04FF]/.test(cue.text)) reasons.push('ký tự lạ — nghi máy nghe sai');
    if (prev && prev.text && prev.text === cue.text) reasons.push('lặp câu trước');
    return reasons;
  }
  function preview(cue) {
    const v = $('uscEdVideo');
    if (!v || !v.src) return;
    previewUntil = cue.end;
    v.currentTime = Math.max(0, cue.start);
    v.play().catch(() => {});
  }

  function open(id, onDone) {
    const scene = US().get(id);
    if (!scene) return;
    sceneId = scene.id; onDoneCb = onDone || null; deletedAny = false;
    work = {
      title: scene.title,
      reviewed: !!scene.reviewed,
      cues: scene.cues.map(c => ({ ...c })),
      partTitles: scene.chapters.map(c => c.title),
      flashcards: (scene.flashcards || []).map(c => ({ ...c }))
    };
    if (!dlg) build();
    render(scene);
    dlg.showModal();
    const v = $('uscEdVideo');
    v.hidden = true; v.removeAttribute('src');
    US().prepare(US().keyOf(scene.id)).then(ok => {
      if (!ok) return;
      try {
        const src = KINO_VIDEOS[US().keyOf(scene.id)]?.src;
        if (src) { v.src = src; v.hidden = false; }
      } catch (e) { /* bỏ qua xem trước */ }
    });
  }
  function build() {
    dlg = document.createElement('dialog');
    dlg.id = 'uscEditorDialog'; dlg.className = 'usc-dialog';
    dlg.innerHTML = '<form method="dialog" class="usc-form">'
      + '<header><h3>Sửa cảnh</h3><button type="submit" class="usc-x" aria-label="Đóng">✕</button></header>'
      + '<label>Tên cảnh <input id="uscEdTitle" type="text" maxlength="80"></label>'
      + '<video id="uscEdVideo" class="usc-ed-video" controls playsinline hidden></video>'
      + '<div class="usc-ed-shift"><label>Dịch toàn bộ mốc thời gian (giây) <input id="uscEdShift" type="number" step="0.1" value="0"></label>'
      + '<button type="button" id="uscEdShiftBtn" class="btn">Dịch tất cả</button>'
      + '<span class="usc-note">Dùng khi phụ đề lệch đều so với video (ví dụ lệch 1,5 giây thì nhập 1.5, lệch sớm thì nhập số âm).</span></div>'
      + '<p id="uscEdFlags" class="usc-note"></p>'
      + '<div id="uscEdReviewRow"></div>'
      + '<div id="uscEdParts"></div>'
      + '<div id="uscEdVocab"></div>'
      + '<div id="uscEdList" class="usc-ed-list"></div>'
      + '<p id="uscEdStatus" class="usc-note" role="status"></p>'
      + '<div class="usc-foot"><button type="submit" class="btn">Đóng</button>'
      + '<button type="button" id="uscEdSave" class="btn usc-primary">Lưu thay đổi</button></div></form>';
    document.body.append(dlg);
    $('uscEdSave').onclick = save;
    $('uscEdShiftBtn').onclick = () => {
      const d = +$('uscEdShift').value || 0;
      if (!d) return;
      for (const c of work.cues) {
        c.start = Math.max(0, Math.round((c.start + d) * 100) / 100);
        c.end = Math.max(c.start + 0.3, Math.round((c.end + d) * 100) / 100);
      }
      render(US().get(sceneId));
      $('uscEdStatus').textContent = 'Đã dịch toàn bộ mốc ' + (d > 0 ? '+' : '') + d + 's (áp dụng khi Lưu).';
    };
    $('uscEdVideo').addEventListener('timeupdate', e => {
      if (previewUntil > 0 && e.target.currentTime >= previewUntil) { e.target.pause(); previewUntil = -1; }
    });
    dlg.addEventListener('close', () => { const v = $('uscEdVideo'); if (v) v.pause(); });
  }
  function render(scene) {
    $('uscEdTitle').value = work.title;
    const rr = $('uscEdReviewRow');
    if (scene.source === 'asr') {
      rr.innerHTML = '<label style="flex-direction:row;align-items:center;gap:8px;">'
        + '<input id="uscEdReviewed" type="checkbox" ' + (work.reviewed ? 'checked' : '') + '> Đã rà xong phụ đề máy</label>'
        + '<p class="usc-note">Khi đã rà, nghe chép và quiz của cảnh mới được tính hoàn thành. Hãy sửa các câu máy nghe sai trước khi đánh dấu.</p>';
    } else {
      rr.innerHTML = '<p class="usc-note">Cảnh dùng phụ đề bạn cung cấp — sửa chữ và mốc thời gian thoải mái.</p>';
    }
    renderVocab();
    const parts = $('uscEdParts');
    parts.replaceChildren();
    work.partTitles.forEach((t, i) => {
      const lab = document.createElement('label');
      lab.textContent = 'Tên phần ' + (i + 1) + ' ';
      const inp = document.createElement('input');
      inp.type = 'text'; inp.value = t; inp.maxLength = 60; inp.dataset.part = i;
      lab.append(inp); parts.append(lab);
    });
    const list = $('uscEdList');
    list.replaceChildren();
    let flagCount = 0;
    work.cues.forEach((cue, idx) => {
      const flags = flagFor(cue, work.cues[idx - 1]);
      if (flags.length) flagCount++;
      const row = document.createElement('div');
      row.className = 'usc-ed-row' + (flags.length ? ' usc-ed-flagged' : '');
      row.innerHTML = '<div class="usc-ed-times"><span class="usc-ed-range">' + fmtT(cue.start) + ' – ' + fmtT(cue.end) + '</span>'
        + '<button type="button" class="usc-ed-play">▶ Nghe đoạn này</button>'
        + (flags.length ? '<span class="usc-ed-chip">⚠ ' + flags.join(' · ') + '</span>' : '')
        + '<span><button type="button" data-nudge="-0.2">−0,2s</button> <button type="button" data-nudge="0.2">+0,2s</button></span>'
        + '<button type="button" class="usc-ed-del">🗑 Xóa câu</button></div>'
        + '<div class="usc-ed-texts"><textarea data-f="text" lang="de" rows="2">' + esc(cue.text) + '</textarea>'
        + '<textarea data-f="vi" lang="vi" rows="2" placeholder="Bản dịch tiếng Việt (tùy chọn)">' + esc(cue.vi) + '</textarea></div>';
      row.querySelector('.usc-ed-play').onclick = () => preview(cue);
      row.querySelectorAll('[data-nudge]').forEach(b => b.onclick = () => {
        const d = +b.dataset.nudge;
        cue.start = Math.max(0, Math.round((cue.start + d) * 100) / 100);
        cue.end = Math.max(cue.start + 0.3, Math.round((cue.end + d) * 100) / 100);
        row.querySelector('.usc-ed-range').textContent = fmtT(cue.start) + ' – ' + fmtT(cue.end);
      });
      row.querySelector('.usc-ed-del').onclick = () => { deletedAny = true; work.cues.splice(idx, 1); render(US().get(sceneId)); $('uscEdStatus').textContent = 'Đã xóa 1 câu (sẽ áp dụng khi Lưu). Xóa câu sẽ xóa kèm bản thu lồng tiếng của cảnh.'; };
      row.querySelectorAll('textarea').forEach(t => t.addEventListener('input', () => { cue[t.dataset.f] = t.value; }));
      list.append(row);
    });
    $('uscEdFlags').textContent = flagCount ? '⚠ ' + flagCount + ' câu cần chú ý (đã đánh dấu trong danh sách).' : '';
    $('uscEdStatus').textContent = work.cues.length + ' câu. Sửa chữ thoải mái; xóa câu sẽ xóa kèm bản thu của cảnh khi lưu.';
  }
  function renderVocab() {
    const box = $('uscEdVocab');
    if (!box) return;
    const saved = work.flashcards || [];
    const savedTerms = new Set(saved.map(f => f.term.toLowerCase()));
    const cands = (window.SrtAlign ? SrtAlign.vocabCandidates(work.cues, 20) : [])
      .filter(c => !savedTerms.has(c.term.toLowerCase()));
    let html = '<h4 style="margin:10px 0 6px;">Từ vựng của cảnh</h4>';
    if (saved.length) {
      html += saved.map((f, i) => '<div class="usc-vocab-row"><span><strong>' + esc(f.term) + '</strong> — ' + esc(f.meaning)
        + '<br><small>' + esc(f.example || '') + '</small></span>'
        + '<button type="button" class="btn" data-vdel="' + i + '">✕</button></div>').join('');
    } else html += '<p class="usc-note">Chưa có thẻ nào. Chọn từ gợi ý bên dưới, điền nghĩa tiếng Việt rồi bấm ＋ — thẻ sẽ vào quiz của cảnh và bộ thẻ của bạn.</p>';
    if (cands.length) {
      html += '<p class="usc-note" style="margin-top:8px;">Gợi ý theo tần suất trong cảnh:</p>' + cands.map((c, i) =>
        '<div class="usc-vocab-row"><span><strong>' + esc(c.term) + '</strong> <small>×' + c.count + ' · “' + esc(c.example.slice(0, 60)) + '…”</small></span>'
        + '<input type="text" data-vmean="' + i + '" placeholder="Nghĩa tiếng Việt">'
        + '<button type="button" class="btn" data-vadd="' + i + '">＋ Lưu thẻ</button></div>').join('');
    }
    box.innerHTML = html;
    box.querySelectorAll('[data-vdel]').forEach(b => b.onclick = () => { work.flashcards.splice(+b.dataset.vdel, 1); renderVocab(); });
    box.querySelectorAll('[data-vadd]').forEach(b => b.onclick = () => {
      const i = +b.dataset.vadd;
      const mean = box.querySelector('[data-vmean="' + i + '"]').value.trim();
      if (!mean) { box.querySelector('[data-vmean="' + i + '"]').focus(); return; }
      const c = cands[i];
      work.flashcards.push({ term: c.term, meaning: mean, example: c.example, cueId: c.cueId });
      renderVocab();
    });
  }
  async function save() {
    const scene = US().get(sceneId);
    if (!scene) return;
    const titles = [...dlg.querySelectorAll('[data-part]')].map(i => i.value.trim() || i.placeholder);
    work.partTitles = titles.length ? titles : work.partTitles;
    const cues = work.cues
      .map(c => ({ ...c, text: c.text.trim(), vi: (c.vi || '').trim() }))
      .filter(c => c.text)
      .sort((a, b) => a.start - b.start)
      .map((c, i) => ({ ...c, id: i + 1, parentId: i + 1 }));
    if (cues.length !== work.cues.length) deletedAny = true;
    const byOldId = new Map(work.cues.map(c => [c.id, c]));
    const flashcards = (work.flashcards || []).map(f => {
      const obj = byOldId.get(f.cueId);
      const pos = obj ? cues.findIndex(c => c.start === obj.start && c.text === (obj.text || '').trim()) : -1;
      return pos >= 0 ? { ...f, cueId: cues[pos].id } : null;
    }).filter(Boolean);
    const chapters = window.SrtAlign.draftChapters(cues, 150)
      .map((c, i) => ({ ...c, title: work.partTitles[i] || c.title }));
    const reviewedEl = $('uscEdReviewed');
    const patch = {
      title: $('uscEdTitle').value.trim() || scene.title,
      cues, chapters, flashcards,
      hasVi: cues.some(c => c.vi)
    };
    if (reviewedEl) patch.reviewed = reviewedEl.checked;
    US().update(sceneId, patch);
    if (deletedAny) {
      const key = US().keyOf(sceneId);
      const idxs = await US().takeIndexes(key);
      for (const i of idxs) await US().deleteTake(key, i);
    }
    if (onDoneCb) onDoneCb();
    dlg.close();
  }
  window.UserScenesEditor = { open };
})();
