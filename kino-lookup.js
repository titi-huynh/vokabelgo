// VokabelGo — Tra từ tại chỗ trong Kino (Mục 1 cải thiện Kino).
// Bấm vào một từ trong dòng phụ đề Đức (hoặc câu lồng tiếng) → hiện thẻ nghĩa
// tra từ kho thẻ của app; lưu được thành thẻ cá nhân kèm câu ngữ cảnh.
// Nguồn tra: kho thẻ chung (BASE + VIDEO_FLASHCARDS + thẻ người dùng).
// Từ chưa có trong kho: vẫn lưu được, người học tự điền nghĩa.
(function () {
  'use strict';

  function fold(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[„""«»()\[\].,;:!?]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function headKey(term) {
    // "der Supermarkt" -> "supermarkt"; "sich freuen" -> "freuen"; "das Pferd reiten" -> "pferd"
    var t = fold(term).replace(/^(der|die|das|den|dem|ein|eine|einen|einem|einer|sich)\s+/, '');
    return t.split(' ')[0];
  }

  var index = null; // Map: foldedKey -> card
  function buildIndex() {
    index = new Map();
    var cards = [];
    try { if (typeof allCards === 'function') cards = allCards() || []; } catch (e) {}
    cards.forEach(function (c) {
      if (!c || !c.term) return;
      var full = fold(c.term);
      if (full && !index.has(full)) index.set(full, c);
      var head = headKey(c.term);
      if (head && !index.has(head)) index.set(head, c);
    });
  }

  function resolve(word) {
    if (!index) buildIndex();
    var w = fold(word);
    if (!w) return null;
    if (index.has(w)) return { card: index.get(w), via: 'exact' };
    // Dạng chia động từ -> nguyên mẫu: läuft->laufen(không chắc), geht->gehen...
    var verbGuesses = [];
    ['test', 'tet', 'st', 'te', 'en', 't', 'e', 'n'].forEach(function (suf) {
      if (w.length > suf.length + 2 && w.endsWith(suf)) verbGuesses.push(w.slice(0, -suf.length) + 'en');
    });
    if (w.endsWith('t') && w.length > 3) verbGuesses.push(w.slice(0, -1) + 'en');
    for (var i = 0; i < verbGuesses.length; i++) {
      if (index.has(verbGuesses[i])) return { card: index.get(verbGuesses[i]), via: 'form' };
    }
    // Danh từ số nhiều -> số ít
    ['en', 'n', 'e', 's'].forEach(function (suf) {
      if (w.length > suf.length + 2 && w.endsWith(suf)) verbGuesses.push(w.slice(0, -suf.length));
    });
    for (var j = 0; j < verbGuesses.length; j++) {
      if (index.has(verbGuesses[j])) return { card: index.get(verbGuesses[j]), via: 'form' };
    }
    // Từ ghép: khớp hậu tố dài nhất (Wocheneinkauf -> Einkauf)
    var best = null;
    index.forEach(function (card, key) {
      if (key.length >= 4 && w.length > key.length && w.endsWith(key)) {
        if (!best || key.length > best.key.length) best = { card: card, key: key };
      }
    });
    if (best) return { card: best.card, via: 'compound' };
    return null;
  }

  // ---------- Popover ----------
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function currentContext() {
    var de = document.getElementById('kinoOverlayDe');
    var vi = document.getElementById('kinoOverlayVi');
    // Đang xem liên tục (Nghe hiểu): phụ đề nằm ở discovery, overlay có thể rỗng.
    if (!de || !de.textContent.trim()) {
      var dDe = document.getElementById('kinoDiscoveryDe');
      if (dDe && dDe.textContent.trim()) { de = dDe; vi = document.getElementById('kinoDiscoveryVi') || vi; }
    }
    var key = 'kino';
    try { if (typeof currentKinoVideoKey === 'string' && currentKinoVideoKey) key = currentKinoVideoKey; } catch (e) {}
    var partBtn = document.querySelector('.peppa-part[aria-pressed="true"]');
    var part = partBtn ? Number(partBtn.getAttribute('data-chapter') || '0') + 1 : 1;
    return {
      deText: de ? de.textContent.trim() : '',
      viText: vi ? vi.textContent.trim() : '',
      movieKey: key, part: part
    };
  }
  function speak(text) {
    try {
      if (window.VokabelAudio && typeof window.VokabelAudio.speak === 'function') { window.VokabelAudio.speak(text); return; }
      if (window.VokabelTTS && typeof window.VokabelTTS.speak === 'function') { window.VokabelTTS.speak(text); return; }
      var u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; speechSynthesis.speak(u);
    } catch (e) {}
  }
  function saveCard(word, hit, ctx, meaningInput) {
    var term = hit ? hit.card.term : word;
    var meaning = hit ? (hit.card.meaning || '') : (meaningInput || '').trim();
    var card = {
      id: 'u_kino_' + Date.now().toString(36),
      term: term,
      meaning: meaning,
      example: ctx.deText,
      exampleVi: ctx.viText,
      deck: '🎬 Từ Kino tự lưu',
      tags: ['Video', 'Tra từ', ctx.movieKey],
      source: 'user',
      videoKey: ctx.movieKey,
      sourceUrl: '?kino=' + ctx.movieKey + '&part=' + ctx.part
    };
    try {
      if (typeof userCards !== 'undefined' && typeof saveUser === 'function') {
        if (!userCards.some(function (c) { return fold(c.term) === fold(term); })) {
          userCards.push(card); saveUser();
        }
        return true;
      }
    } catch (e) {}
    return false;
  }
  function showPop(anchor, word) {
    closePop();
    var hit = resolve(word);
    var ctx = currentContext();
    pop = document.createElement('div');
    pop.className = 'kino-lookup-pop';
    pop.setAttribute('role', 'dialog');
    pop.style.cssText = 'position:fixed;z-index:4000;max-width:320px;background:#FFFDF7;border:1.5px solid #DB5B23;border-radius:14px;box-shadow:0 12px 32px rgba(43,36,30,.25);padding:12px 14px;font-size:14px;color:#2B241E;';
    var html = '';
    if (hit) {
      var c = hit.card;
      html += '<div style="font-weight:800;font-size:16px;">' + escapeHtml(c.term) + '</div>';
      if (c.meaning) html += '<div style="margin-top:2px;">' + escapeHtml(c.meaning) + '</div>';
      if (c.grammar) html += '<div style="margin-top:4px;font-size:12.5px;color:#8a7f6a;">' + escapeHtml(c.grammar) + '</div>';
      if (c.example) html += '<div style="margin-top:6px;font-style:italic;font-size:13px;">„' + escapeHtml(c.example) + '"</div>';
      if (hit.via === 'compound') html += '<div style="margin-top:4px;font-size:12px;color:#8a7f6a;">(từ ghép — nghĩa của phần đuôi)</div>';
      if (hit.via === 'form') html += '<div style="margin-top:4px;font-size:12px;color:#8a7f6a;">(dạng chia của từ này)</div>';
    } else {
      html += '<div style="font-weight:800;font-size:16px;">' + escapeHtml(word) + '</div>';
      html += '<div style="margin-top:2px;color:#8a7f6a;">Từ này chưa có trong kho từ của app.</div>';
      html += '<input class="kl-meaning" type="text" placeholder="Tự điền nghĩa tiếng Việt…" style="margin-top:8px;width:100%;box-sizing:border-box;border:1px solid #d8cfb8;border-radius:8px;padding:7px 9px;font-size:13.5px;">';
    }
    html += '<div style="display:flex;gap:8px;margin-top:10px;">'
      + '<button type="button" class="kl-speak" style="border:1.5px solid #DB5B23;color:#C44D18;background:#fff;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;">🔊 Nghe</button>'
      + '<button type="button" class="kl-save" style="border:none;background:#DB5B23;color:#fff;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;">＋ Lưu vào bộ thẻ</button>'
      + '</div>';
    pop.innerHTML = html;
    document.body.appendChild(pop);
    var r = anchor.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 336)) + 'px';
    pop.style.top = Math.min(r.bottom + 8, window.innerHeight - 240) + 'px';
    pop.querySelector('.kl-speak').addEventListener('click', function () { speak(hit ? hit.card.term : word); });
    pop.querySelector('.kl-save').addEventListener('click', function () {
      var inp = pop.querySelector('.kl-meaning');
      var ok = saveCard(word, hit, ctx, inp ? inp.value : '');
      pop.querySelector('.kl-save').textContent = ok ? '✓ Đã lưu — sẽ gặp lại trong buổi ôn' : 'Chưa lưu được';
      if (ok) setTimeout(closePop, 1200);
    });
    setTimeout(function () {
      document.addEventListener('pointerdown', function onDoc(e) {
        if (pop && !pop.contains(e.target)) { closePop(); document.removeEventListener('pointerdown', onDoc); }
      });
    }, 0);
  }
  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- Bọc từ thành nút bấm ----------
  var WORD_RE = /[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*/g;
  function wrapWords(el) {
    if (!el) return;
    var text = el.textContent;
    if (!text || !text.trim()) return;
    // Đã bọc và nội dung không đổi -> bỏ qua. App có thể set lại đúng câu cũ
    // (xoá mất span) nên phải kiểm cả sự hiện diện của span, không chỉ chữ.
    if (el.dataset.klWrapped === text && el.querySelector('.kino-word')) return;
    var parts = text.split(WORD_RE);
    var words = text.match(WORD_RE) || [];
    if (!words.length) return;
    el.textContent = '';
    parts.forEach(function (chunk, i) {
      if (chunk) el.appendChild(document.createTextNode(chunk));
      if (i < words.length) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'kino-word';
        b.textContent = words[i];
        b.style.cssText = 'background:none;border:none;border-bottom:1.5px dotted rgba(219,91,35,.55);color:inherit;font:inherit;cursor:pointer;padding:0 1px;';
        b.addEventListener('click', function (ev) {
          ev.stopPropagation();
          // Tra từ ngay trong lúc xem: dừng video để người học kịp đọc thẻ nghĩa.
          if (el.id === 'kinoDiscoveryDe') {
            var dv = document.getElementById('kinoDiscoveryVideo');
            if (dv && !dv.paused) dv.pause();
          }
          showPop(b, words[i]);
        });
        el.appendChild(b);
      }
    });
    el.dataset.klWrapped = text;
  }
  function watch(id) {
    var el = document.getElementById(id);
    if (!el) return;
    wrapWords(el);
    new MutationObserver(function () {
      if (el.dataset.klWrapped !== el.textContent || !el.querySelector('.kino-word')) wrapWords(el);
    }).observe(el, { childList: true, characterData: true, subtree: true });
  }
  function watchLater(id) {
    if (document.getElementById(id)) { watch(id); return; }
    var mo = new MutationObserver(function () {
      if (document.getElementById(id)) { mo.disconnect(); watch(id); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  function start() {
    buildIndex();
    watch('kinoOverlayDe');
    watch('kinoDubTargetDe');
    // Phụ đề của trình xem liên tục (Nghe hiểu) được tạo động khi mở bài Kino.
    watchLater('kinoDiscoveryDe');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.KinoLookup = { resolve: resolve, fold: fold };
})();
