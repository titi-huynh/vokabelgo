// VokabelGo — Chế độ điền từ (cloze) cho nghe chép Kino (Mục 6 cải thiện Kino).
// Biến thể nhẹ của dictation: câu hiện sẵn, chỉ che các từ vựng của bài
// (ưu tiên từ có trong kho thẻ; không có thì che từ dài). Điền từ KHÔNG tính
// hoàn thành câu — hoàn thành vẫn theo gõ cả câu/nghe, ghi rõ trong giao diện.
(function () {
  'use strict';
  var STOP = new Set(['und', 'oder', 'aber', 'denn', 'ich', 'wir', 'sie', 'er', 'es', 'der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen', 'ist', 'sind', 'war', 'hat', 'haben', 'wird', 'mit', 'von', 'zu', 'in', 'im', 'am', 'an', 'auf', 'für', 'nicht', 'auch', 'so', 'da', 'doch', 'mal', 'ja', 'nein', 'mein', 'meine', 'dein', 'sein', 'ihr', 'uns', 'sich', 'mir', 'dir', 'ihm', 'uns']);
  var mode = 'full';
  try { mode = localStorage.getItem('vokabelgo_kino_dictation_mode') || 'full'; } catch (e) {}
  var built = false, barEl = null, boxEl = null, lastSentence = '';

  function fold(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[„""«».,;:!?]/g, '');
  }
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function currentSentence() {
    var el = document.getElementById('kinoOverlayDe');
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function chooseBlanks(sentence) {
    var words = sentence.split(/(\s+)/); // giữ cả khoảng trắng
    var tokens = [];
    words.forEach(function (w, i) {
      var clean = w.replace(/[„""«».,;:!?()]/g, '');
      if (clean && !/^\s+$/.test(w)) tokens.push({ idx: i, word: w, clean: clean });
    });
    var scored = tokens.map(function (t) {
      var score = 0;
      if (t.clean.length >= 4 && !STOP.has(t.clean.toLowerCase())) {
        score = t.clean.length;
        try { if (window.KinoLookup && window.KinoLookup.resolve(t.clean)) score += 100; } catch (e) {}
      }
      return { t: t, score: score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    var chosen = [];
    for (var k = 0; k < scored.length && chosen.length < 3; k++) {
      var idx = scored[k].t.idx;
      if (chosen.some(c => Math.abs(c - idx) <= 2)) continue; // tránh che hai từ kề nhau
      chosen.push(idx);
    }
    return { words: words, chosen: new Set(chosen) };
  }
  function renderCloze() {
    if (!boxEl) return;
    var sentence = currentSentence();
    if (!sentence) { boxEl.innerHTML = '<p style="margin:0;color:#8a7f6a;">Chưa có câu nào để điền.</p>'; return; }
    lastSentence = sentence;
    var parts = chooseBlanks(sentence);
    var html = '<div style="font-size:17px;line-height:2.1;">';
    parts.words.forEach(function (w, i) {
      if (parts.chosen.has(i)) {
        var clean = w.replace(/[„""«».,;:!?()]/g, '');
        var punct = w.slice(w.indexOf(clean) + clean.length);
        var lead = w.slice(0, w.indexOf(clean));
        html += esc(lead) + '<input type="text" class="cloze-blank" data-answer="' + esc(clean) + '" autocomplete="off" spellcheck="false" style="width:' + Math.max(3.2, clean.length * 0.68) + 'em;border:none;border-bottom:2px solid #C44D18;background:#FBF3E4;border-radius:6px 6px 0 0;padding:1px 6px;font:inherit;text-align:center;">' + esc(punct);
      } else {
        html += esc(w);
      }
    });
    html += '</div>'
      + '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">'
      + '<button type="button" class="cloze-check" style="border:none;background:#C44D18;color:#fff;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer;">✓ Kiểm tra</button>'
      + '<button type="button" class="cloze-reveal" style="border:1.5px solid #C44D18;color:#C44D18;background:#fff;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer;">👁️ Hiện đáp án</button>'
      + '</div>'
      + '<p class="cloze-feedback" style="margin:10px 0 0;font-weight:600;"></p>'
      + '<p style="margin:6px 0 0;font-size:12.5px;color:#8a7f6a;">Điền từ là luyện nhẹ — câu chỉ tính hoàn thành khi gõ cả câu hoặc nghe đủ. Mẹo: tắt phụ đề để tự thử sức.</p>';
    boxEl.innerHTML = html;
    boxEl.querySelector('.cloze-check').addEventListener('click', check);
    boxEl.querySelector('.cloze-reveal').addEventListener('click', function () {
      boxEl.querySelectorAll('.cloze-blank').forEach(function (inp) { inp.value = inp.dataset.answer; inp.style.borderBottomColor = '#8a7f6a'; });
      var fb = boxEl.querySelector('.cloze-feedback');
      if (fb) fb.textContent = 'Đã hiện đáp án — nghe lại câu rồi thử tự điền ở câu tiếp theo nhé.';
    });
  }
  function check() {
    var inputs = [...boxEl.querySelectorAll('.cloze-blank')];
    var ok = 0;
    inputs.forEach(function (inp) {
      var good = fold(inp.value) === fold(inp.dataset.answer);
      inp.style.borderBottomColor = good ? '#4c9a52' : '#d05252';
      inp.style.background = good ? '#eef7ec' : '#fdeeee';
      if (good) ok++;
    });
    var fb = boxEl.querySelector('.cloze-feedback');
    if (fb) fb.textContent = ok === inputs.length
      ? '✓ Đúng hết! Tai và tay đã khớp nhau.'
      : 'Đúng ' + ok + '/' + inputs.length + ' chỗ — chỗ đỏ là từ chưa khớp, nghe lại câu rồi sửa nhé.';
  }
  function applyMode() {
    var inputBox = document.querySelector('.kino-diktat-input-box');
    var actions = document.querySelector('.kino-diktat-actions-row');
    var cloze = mode === 'cloze';
    if (inputBox) inputBox.style.display = cloze ? 'none' : '';
    if (actions) actions.style.display = cloze ? 'none' : '';
    if (boxEl) { boxEl.style.display = cloze ? '' : 'none'; if (cloze) renderCloze(); }
    if (barEl) barEl.querySelectorAll('button').forEach(function (b) {
      var active = b.dataset.mode === mode;
      b.style.background = active ? '#C44D18' : '#fff';
      b.style.color = active ? '#fff' : '#C44D18';
    });
    try { localStorage.setItem('vokabelgo_kino_dictation_mode', mode); } catch (e) {}
  }
  function mount() {
    if (built) return;
    var inputBox = document.querySelector('.kino-diktat-input-box');
    if (!inputBox) return;
    built = true;
    barEl = document.createElement('div');
    barEl.style.cssText = 'display:flex;gap:8px;margin:0 0 10px;';
    barEl.innerHTML = '<button type="button" data-mode="full" style="border:1.5px solid #C44D18;border-radius:999px;padding:6px 13px;font-weight:700;cursor:pointer;">⌨️ Gõ cả câu</button>'
      + '<button type="button" data-mode="cloze" style="border:1.5px solid #C44D18;border-radius:999px;padding:6px 13px;font-weight:700;cursor:pointer;">🧩 Điền từ</button>';
    barEl.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { mode = b.dataset.mode; applyMode(); });
    });
    inputBox.parentElement.insertBefore(barEl, inputBox);
    boxEl = document.createElement('div');
    boxEl.id = 'kinoClozeBox';
    boxEl.style.cssText = 'display:none;border:1px solid #E8DFC8;background:#FFFDF7;border-radius:12px;padding:14px 16px;';
    inputBox.parentElement.insertBefore(boxEl, inputBox.nextSibling);
    applyMode();
    var overlayDe = document.getElementById('kinoOverlayDe');
    if (overlayDe) {
      new MutationObserver(function () {
        var s = currentSentence();
        if (mode === 'cloze' && s && s !== lastSentence) renderCloze();
      }).observe(overlayDe, { childList: true, characterData: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  setInterval(mount, 2000);
  window.KinoCloze = { chooseBlanks: chooseBlanks };
})();
