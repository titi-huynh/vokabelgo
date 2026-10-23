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

  var finishedSeen = false;
  function checkKinoFinished() {
    var panel = document.getElementById('peppaFinished');
    if (!panel) return;
    var visible = !panel.hidden && panel.offsetParent !== null;
    if (visible && !finishedSeen) {
      finishedSeen = true;
      var ref = currentKinoRef();
      if (!window.VokabelEvidence.hasCompletedToday('kino', ref)) {
        window.VokabelEvidence.record('kino', 'completed', { ref: ref });
      }
      if (typeof window.renderDayPlan === 'function') window.renderDayPlan();
    } else if (!visible) {
      finishedSeen = false;
    }
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
