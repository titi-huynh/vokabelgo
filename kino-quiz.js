// VokabelGo — Quiz hiểu bài theo phần Kino (Mục 4 cải thiện Kino).
// Câu hỏi sinh từ chính dữ liệu đã biên tập: câu picks của phần (hỏi nghĩa)
// và thẻ từ của phần (hỏi từ vựng). Trả lời sai -> nhảy về đúng câu trong phim.
// Kết quả ghi vào sổ bằng chứng; từ vựng sai được ghi để buổi học bắt lại.
(function () {
  'use strict';

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function partCues(key, partIdx) {
    const movie = KINO_CHAPTER_DATA[key];
    if (!movie || !movie.chapters[partIdx]) return [];
    const ch = movie.chapters[partIdx];
    let cues = [];
    try { cues = movie.cues || (typeof KINO_VIDEOS !== 'undefined' && KINO_VIDEOS[key] && KINO_VIDEOS[key].defaultSegs) || []; } catch (e) {}
    return cues.filter(c => c.start >= ch.start && c.start < ch.end);
  }
  function buildQuiz(key, partIdx) {
    const movie = KINO_CHAPTER_DATA[key];
    if (!movie) return [];
    const ch = movie.chapters[partIdx];
    const cues = partCues(key, partIdx);
    const byId = new Map(cues.map(c => [c.id, c]));
    const picks = (ch.picks || []).map(id => byId.get(id)).filter(Boolean);
    const pool = picks.length >= 2 ? picks : cues;
    const qs = [];
    shuffle([...pool]).slice(0, 2).forEach(cue => {
      const distract = shuffle(cues.filter(c => c.id !== cue.id && c.vi)).slice(0, 2).map(c => c.vi);
      if (cue.vi && distract.length === 2) {
        qs.push({ type: 'meaning', prompt: 'Câu thoại này có nghĩa là gì?', de: cue.text, options: shuffle([cue.vi, ...distract]), answer: cue.vi, cueId: cue.id, cueText: cue.text });
      }
    });
    const partIds = new Set(cues.map(c => c.id));
    let cards = [];
    try { cards = (typeof VIDEO_FLASHCARDS !== 'undefined' ? VIDEO_FLASHCARDS : []).filter(c => c.videoKey === key && partIds.has(c.cueId)); } catch (e) {}
    const meanings = cards.map(c => c.meaning);
    shuffle([...cards]).slice(0, 2).forEach(card => {
      const distract = shuffle(meanings.filter(m => m !== card.meaning)).slice(0, 2);
      if (distract.length === 2) {
        qs.push({ type: 'vocab', prompt: 'Trong bài này, từ/cụm sau có nghĩa là gì?', de: card.term, options: shuffle([card.meaning, ...distract]), answer: card.meaning, cueId: card.cueId, cueText: card.example || '', term: card.term });
      }
    });
    return shuffle(qs).slice(0, 4);
  }

  function jumpToCue(cueText) {
    if (!cueText) return;
    const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
    const rows = [...document.querySelectorAll('#kinoTimelineList .kino-v3-timeline-row')];
    const row = rows.find(r => norm(r.textContent).includes(norm(cueText).slice(0, 40)));
    if (row) {
      const body = document.getElementById('kinoTimelineBody');
      if (body && body.classList.contains('collapsed')) {
        const tgl = document.getElementById('kinoTimelineCollapseBtn');
        if (tgl) tgl.click();
      }
      row.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(() => row.click(), 350);
    }
  }

  let overlay = null;
  function close() { if (overlay) { overlay.remove(); overlay = null; } }

  function open(key, partIdx) {
    const qs = buildQuiz(key, partIdx);
    if (!qs.length) { alert('Phần này chưa đủ dữ liệu để tạo câu hỏi.'); return; }
    close();
    const movie = KINO_CHAPTER_DATA[key];
    let idx = 0, score = 0;
    const wrongTerms = [];
    overlay = document.createElement('div');
    overlay.className = 'kino-quiz-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:4200;background:rgba(30,40,28,.55);display:flex;align-items:center;justify-content:center;padding:16px;';
    const card = document.createElement('div');
    card.style.cssText = 'background:#FFFDF7;border-radius:18px;max-width:560px;width:100%;max-height:88vh;overflow:auto;padding:22px;box-shadow:0 18px 48px rgba(0,0,0,.3);color:#2B241E;';
    overlay.appendChild(card);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);

    function renderQ() {
      const q = qs[idx];
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="font-size:15px;color:#8a7f6a;">🧠 Kiểm tra hiểu bài · ${esc(movie.title)} · Phần ${partIdx + 1}</strong>
          <button type="button" class="kq-close" style="border:none;background:none;font-size:20px;cursor:pointer;">✕</button>
        </div>
        <p style="margin:12px 0 4px;font-size:14px;color:#5D5347;">Câu ${idx + 1}/${qs.length} · ${esc(q.prompt)}</p>
        <p style="margin:0 0 14px;font-size:19px;font-weight:700;line-height:1.45;">${esc(q.de)}</p>
        <div class="kq-options" style="display:grid;gap:9px;"></div>
        <div class="kq-feedback" style="margin-top:12px;"></div>`;
      card.querySelector('.kq-close').addEventListener('click', close);
      const box = card.querySelector('.kq-options');
      q.options.forEach(opt => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = opt;
        b.style.cssText = 'text-align:left;border:1.5px solid #d8cfb8;background:#fff;border-radius:12px;padding:11px 13px;font-size:15px;cursor:pointer;line-height:1.4;';
        b.addEventListener('click', () => answer(b, opt, q));
        box.append(b);
      });
    }
    function answer(btn, opt, q) {
      const right = opt === q.answer;
      if (right) score++;
      else if (q.type === 'vocab' && q.term) wrongTerms.push(q.term);
      card.querySelectorAll('.kq-options button').forEach(b => {
        b.disabled = true;
        if (b.textContent === q.answer) { b.style.borderColor = '#4c9a52'; b.style.background = '#eef7ec'; }
        else if (b === btn) { b.style.borderColor = '#d05252'; b.style.background = '#fdeeee'; }
      });
      const fb = card.querySelector('.kq-feedback');
      fb.innerHTML = `<p style="margin:0 0 10px;font-weight:700;color:${right ? '#35703c' : '#b03a3a'};">${right ? '✓ Đúng rồi!' : '✗ Chưa đúng — đáp án: ' + esc(q.answer)}</p>`
        + `<div style="display:flex;gap:8px;flex-wrap:wrap;">
             ${!right && q.cueText ? '<button type="button" class="kq-review" style="border:1.5px solid #52723f;color:#3e5c32;background:#fff;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer;">↺ Xem lại câu này trong phim</button>' : ''}
             <button type="button" class="kq-next" style="border:none;background:#52723f;color:#fff;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer;">${idx + 1 < qs.length ? 'Câu tiếp →' : 'Xem kết quả'}</button>
           </div>`;
      const review = fb.querySelector('.kq-review');
      if (review) review.addEventListener('click', () => { close(); jumpToCue(q.cueText); });
      fb.querySelector('.kq-next').addEventListener('click', () => {
        idx++;
        if (idx < qs.length) renderQ(); else renderEnd();
      });
    }
    function renderEnd() {
      const unreviewed = !!(window.UserScenes && window.UserScenes.isUnreviewed(key));
      try {
        if (window.VokabelEvidence) {
          if (!unreviewed) window.VokabelEvidence.record('kino', 'quiz', { ref: key + ':p' + (partIdx + 1) + ':' + score + '/' + qs.length });
          if (wrongTerms.length) {
            window.VokabelEvidence.record('kino', 'wrong', { ref: key + ':p' + (partIdx + 1), termKeys: wrongTerms });
          }
        }
      } catch (e) {}
      card.innerHTML = `
        <div style="text-align:center;padding:8px 0;">
          <div style="font-size:40px;">${score === qs.length ? '🌟' : score >= qs.length / 2 ? '💪' : '🌱'}</div>
          <h3 style="margin:8px 0 4px;">Bạn đạt ${score}/${qs.length}</h3>
          ${unreviewed ? '<p style="color:#9a5b00;">Đang luyện — cảnh dùng phụ đề máy chưa rà nên kết quả chưa tính hoàn thành. Rà phụ đề trong mục Cảnh của bạn để mở tính năng ghi nhận.</p>' : ''}
          <p style="margin:0 0 6px;color:#5D5347;">${score === qs.length ? 'Hiểu bài rất chắc!' : 'Làm lại bất cứ lúc nào — câu hỏi sẽ được xáo trộn.'}</p>
          ${wrongTerms.length ? `<p style="margin:0 0 6px;color:#5D5347;">Từ chưa thuộc (${wrongTerms.map(esc).join(', ')}) sẽ được buổi học nhắc lại.</p>` : ''}
          <button type="button" class="kq-done" style="margin-top:10px;border:none;background:#52723f;color:#fff;border-radius:999px;padding:10px 22px;font-weight:700;cursor:pointer;">Đóng</button>
        </div>`;
      card.querySelector('.kq-done').addEventListener('click', close);
    }
    renderQ();
  }

  window.KinoQuiz = { open, buildQuiz };
})();
