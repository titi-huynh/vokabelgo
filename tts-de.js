// VokabelGo — TTS tiếng Đức dùng chung.
// Vấn đề gốc: speechSynthesis.getVoices() thường trả rỗng ở lần gọi đầu
// (giọng được nạp bất đồng bộ), nên nếu không chờ 'voiceschanged' và không
// gán voice cụ thể, máy không có gói giọng Đức sẽ đọc bằng giọng mặc định
// hoặc im lặng. Helper này chờ giọng sẵn sàng rồi chọn giọng de-DE tốt nhất.
(function () {
  'use strict';
  var voicesPromise = null;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return Promise.resolve([]);
    var synth = window.speechSynthesis;
    var now = synth.getVoices();
    if (now && now.length) return Promise.resolve(now);
    if (voicesPromise) return voicesPromise;
    voicesPromise = new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve(synth.getVoices() || []);
      }
      if (typeof synth.addEventListener === 'function') {
        var handler = function () {
          synth.removeEventListener('voiceschanged', handler);
          finish();
        };
        synth.addEventListener('voiceschanged', handler);
      } else {
        synth.onvoiceschanged = finish;
      }
      setTimeout(finish, 700);
    });
    return voicesPromise;
  }

  function pickGermanVoice(voices) {
    if (!voices || !voices.length) return null;
    function norm(v) { return (v.lang || '').toLowerCase().replace(/_/g, '-'); }
    return (
      voices.find(function (v) { return norm(v) === 'de-de'; }) ||
      voices.find(function (v) { return norm(v).indexOf('de-') === 0 || norm(v) === 'de'; }) ||
      null
    );
  }

  function speakGerman(text, opts) {
    opts = opts || {};
    if (!('speechSynthesis' in window) || !text) return Promise.resolve(false);
    return loadVoices().then(function (voices) {
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'de-DE';
      u.rate = typeof opts.rate === 'number' ? opts.rate : 0.9;
      var voice = pickGermanVoice(voices);
      if (voice) u.voice = voice;
      if (typeof opts.onend === 'function') u.onend = opts.onend;
      if (typeof opts.onerror === 'function') u.onerror = opts.onerror;
      if (opts.cancel !== false) window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return true;
    });
  }

  window.VokabelTTS = {
    loadVoices: loadVoices,
    pickGermanVoice: pickGermanVoice,
    speakGerman: speakGerman
  };

  // Nạp trước danh sách giọng ngay khi trang sẵn sàng để lần phát đầu không hụt.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadVoices(); });
  } else {
    loadVoices();
  }
})();
