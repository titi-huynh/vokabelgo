// VokabelGo — Cầu nối workflow (trang chính): ghi bằng chứng học tập cho
// các hoạt động diễn ra trong index.html (buổi học ngày, Kino).
// Game trang riêng ghi trực tiếp qua evidence-ledger.js trong mã của chúng.
(function () {
  'use strict';
  if (!window.VokabelEvidence) return;

  // Buổi học từ: hoàn thành mục tiêu ngày → ghi nhận vào sổ.
  window.addEventListener('vokabelgo:daily-goal-complete', function () {
    window.VokabelEvidence.record('session', 'completed', { ref: 'daily-goal' });
    if (typeof window.renderDayPlan === 'function') window.renderDayPlan();
  });

  // Kino: panel "đã xong phần này" (#peppaFinished) hiện lên = hoàn thành
  // một lượt học của phần hiện tại (cả module Peppa lẫn module chương chung
  // đều dùng chung panel này). Ghi 1 lần/phần/ngày.
  function currentKinoRef() {
    var key = 'kino';
    try { if (typeof currentKinoVideoKey === 'string' && currentKinoVideoKey) key = currentKinoVideoKey; } catch (e) {}
    var partBtn = document.querySelector('.peppa-part[aria-pressed="true"]');
    var part = partBtn ? Number(partBtn.getAttribute('data-chapter') || '0') + 1 : 1;
    return key + ':p' + part;
  }

  // Thanh bước tiếp chung ở panel hoàn thành phần Kino:
  // [Dạy Zehn (nếu bài có nhiệm vụ)] [Ôn từ của bài này] [Về Hôm nay] [Phần tiếp]
  function injectFinishedRamp(panel) {
    if (!panel || panel.querySelector('.wf-ramp')) return;
    var ramp = document.createElement('div');
    ramp.className = 'wf-ramp';
    ramp.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;';
    var btnCss = 'font-size:13px;font-weight:700;text-decoration:none;border-radius:999px;padding:7px 13px;border:1.5px solid var(--primary,#C44D18);color:var(--primary,#C44D18);background:#fff;cursor:pointer;';
    var ref = currentKinoRef();
    if (ref.indexOf('we_bare_bears') === 0) {
      var a = document.createElement('a');
      a.href = 'teach-me.html?task=bears';
      a.textContent = '🐾 Dạy Zehn phần này →';
      a.style.cssText = btnCss + 'background:var(--primary,#C44D18);color:#fff;';
      ramp.appendChild(a);
    }
    if (typeof window.reviewCurrentVideoVocab === 'function') {
      var v = document.createElement('button');
      v.type = 'button';
      v.textContent = '📇 Ôn từ của bài này';
      v.style.cssText = btnCss;
      v.addEventListener('click', function () { window.reviewCurrentVideoVocab(); });
      ramp.appendChild(v);
    }
    // Mục 4: quiz hiểu bài cho phần vừa học (câu hỏi sinh từ picks + thẻ của phần).
    if (window.KinoQuiz && typeof KINO_CHAPTER_DATA !== 'undefined' && KINO_CHAPTER_DATA[currentKey()]) {
      var qz = document.createElement('button');
      qz.type = 'button';
      qz.textContent = '🧠 Kiểm tra hiểu bài';
      qz.style.cssText = btnCss;
      qz.addEventListener('click', function () { window.KinoQuiz.open(currentKey(), currentPart() - 1); });
      ramp.appendChild(qz);
    }
    var home = document.createElement('button');
    home.type = 'button';
    home.textContent = '🏠 Về Hôm nay';
    home.style.cssText = btnCss;
    home.addEventListener('click', function () {
      if (typeof window.setPrimaryHub === 'function') window.setPrimaryHub('today');
    });
    ramp.appendChild(home);
    var next = document.getElementById('peppaNextPart');
    if (next && !next.hidden) {
      var n = document.createElement('button');
      n.type = 'button';
      n.textContent = 'Phần tiếp →';
      n.style.cssText = btnCss;
      n.addEventListener('click', function () { next.click(); });
      ramp.appendChild(n);
    }
    // Mục 7: gợi ý một phim cùng cấp độ để học tiếp sau khi xong phần.
    try {
      var curKey = currentKey();
      var curMovie = (typeof KINO_CHAPTER_DATA !== 'undefined') ? KINO_CHAPTER_DATA[curKey] : null;
      if (curMovie && curMovie.levelLabel && typeof KINO_ALIASES !== 'undefined') {
        var otherKey = Object.keys(KINO_CHAPTER_DATA).find(function (k) {
          return k !== curKey && KINO_CHAPTER_DATA[k].levelLabel === curMovie.levelLabel;
        });
        if (otherKey) {
          var sug = document.createElement('button');
          sug.type = 'button';
          var sugMovie = KINO_CHAPTER_DATA[otherKey];
          sug.textContent = '🎬 Học tiếp: ' + (sugMovie.catalogTitle || sugMovie.title);
          sug.style.cssText = btnCss;
          sug.addEventListener('click', function () { location.assign('?kino=' + KINO_ALIASES[otherKey]); });
          ramp.appendChild(sug);
        }
      }
    } catch (e) {}
    panel.appendChild(ramp);
  }

  var finishedSeen = false;
  function checkKinoFinished() {
    var panel = document.getElementById('peppaFinished');
    if (!panel) return;
    var visible = !panel.hidden && panel.offsetParent !== null;
    if (visible && !finishedSeen) {
      finishedSeen = true;
      var ref = currentKinoRef();
      var unreviewedScene = false;
      try { unreviewedScene = !!(window.UserScenes && typeof currentKinoVideoKey === 'string' && window.UserScenes.isUnreviewed(currentKinoVideoKey)); } catch (e) {}
      if (!unreviewedScene && !window.VokabelEvidence.hasCompletedToday('kino', ref)) {
        window.VokabelEvidence.record('kino', 'completed', { ref: ref });
      }
      if (typeof window.renderDayPlan === 'function') window.renderDayPlan();
    } else if (!visible) {
      finishedSeen = false;
    }
    if (visible) injectFinishedRamp(panel);
  }

  function startKinoWatch() {
    var panel = document.getElementById('peppaFinished');
    if (!panel) { setTimeout(startKinoWatch, 600); return; }
    new MutationObserver(checkKinoFinished).observe(panel, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
    setInterval(checkKinoFinished, 2500);
    checkKinoFinished();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startKinoWatch);
  } else {
    startKinoWatch();
  }
})();
