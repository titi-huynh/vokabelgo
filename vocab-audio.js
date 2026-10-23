/* =========================================================================
   VokabelAudio — phat am tu vung bang audio thu san (assets/vocab-audio/),
   du phong bang speechSynthesis co chon giong Duc dung cach.
   - Uu tien file thu san theo card.id hoac theo term da chuan hoa.
   - TTS du phong: cho voiceschanged neu danh sach giong chua tai,
     chon giong de-* neu co, bao loi qua onError thay vi im lang.
   ========================================================================= */
(function () {
  'use strict';
  var MANIFEST_URL = 'assets/vocab-audio/manifest.json';
  var manifestPromise = null;
  var currentAudio = null;
  var voicesCache = null;
  var history = []; // {spoken, via: 'file'|'tts', file} — phuc vu debug + e2e

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL)
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    return manifestPromise;
  }

  // Chuan hoa term giong build_vocab_audio.py / getListeningText
  function spokenOf(term) {
    var t = String(term || '').trim();
    t = t.replace(/,\s*(-[^\s,]*|pl\.?|Pl\.?|die\s+[^,]+)$/i, '').trim();
    t = t.replace(/[|]/g, ' ').replace(/…/g, ' ').replace(/\.\.\./g, ' ');
    t = t.replace(/\s*\+\s*/g, ' plus ');
    return t.replace(/\s+/g, ' ').trim();
  }

  function stop() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function getVoicesAsync() {
    return new Promise(function (resolve) {
      if (!('speechSynthesis' in window)) return resolve([]);
      var voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) return resolve(voices);
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve(window.speechSynthesis.getVoices() || []);
      }
      if ('onvoiceschanged' in window.speechSynthesis || window.speechSynthesis.addEventListener) {
        try {
          window.speechSynthesis.addEventListener('voiceschanged', function h() {
            window.speechSynthesis.removeEventListener('voiceschanged', h);
            finish();
          });
        } catch (e) {}
      }
      setTimeout(finish, 600); // khong de nguoi dung cho vo han
    });
  }

  function speakTTS(text, opts) {
    opts = opts || {};
    // Uu tien helper TTS dung chung cua app (da xu ly voiceschanged + chon giong Duc)
    if (window.VokabelTTS && typeof window.VokabelTTS.speakGerman === 'function') {
      history.push({ spoken: text, via: 'tts', file: null });
      var p = window.VokabelTTS.speakGerman(text, {
        rate: opts.rate || 0.9,
        onend: opts.onEnd,
        onerror: opts.onError || opts.onEnd
      });
      // speak() co the nem loi dong bo ben trong promise -> phai bat de bao loi
      if (p && typeof p.catch === 'function') {
        p.catch(function (err) { if (opts.onError) opts.onError(err); });
      }
      return true;
    }
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      if (opts.onError) opts.onError(new Error('speech-not-supported'));
      return false;
    }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    history.push({ spoken: text, via: 'tts', file: null });
    getVoicesAsync().then(function (voices) {
      try {
        var u = new window.SpeechSynthesisUtterance(text);
        u.lang = 'de-DE';
        u.rate = opts.rate || 0.9;
        var de = (voices || []).find(function (v) {
          return v && v.lang && v.lang.toLowerCase().indexOf('de') === 0;
        });
        if (de) u.voice = de;
        if (opts.onEnd) u.onend = opts.onEnd;
        u.onerror = function (ev) {
          if (opts.onError) opts.onError(ev);
          else if (opts.onEnd) opts.onEnd();
        };
        window.speechSynthesis.speak(u);
      } catch (err) {
        if (opts.onError) opts.onError(err);
      }
    });
    return true;
  }

  function playFile(file, opts) {
    stop();
    history.push({ spoken: opts.spoken || null, via: 'file', file: file });
    var audio = new Audio('assets/vocab-audio/' + file);
    currentAudio = audio;
    audio.playbackRate = opts.rate && opts.rate < 1 ? 0.85 : 1;
    if (opts.onEnd) audio.onended = opts.onEnd;
    audio.onerror = function () {
      if (currentAudio === audio) currentAudio = null;
      if (opts.onError) opts.onError(new Error('audio-file-failed'));
    };
    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        if (opts.onError) opts.onError(new Error('audio-play-blocked'));
      });
    }
    return true;
  }

  // Phat theo the: tim file bang card.id -> term; khong co thi TTS.
  function playCard(card, opts) {
    opts = opts || {};
    if (!card) { if (opts.onError) opts.onError(new Error('no-card')); return false; }
    var spoken = spokenOf(card.term || card.de || '');
    loadManifest().then(function (man) {
      var file = null;
      if (man && man.entries) {
        // tim theo card.id
        var keys = Object.keys(man.entries);
        for (var i = 0; i < keys.length; i++) {
          var e = man.entries[keys[i]];
          if (e.card_ids && e.card_ids.indexOf(card.id) !== -1) { file = e.file; spoken = e.spoken; break; }
        }
        if (!file && man.byTerm) file = man.byTerm[spoken.toLowerCase()] || null;
      }
      if (file) {
        playFile(file, {
          rate: opts.rate,
          spoken: spoken,
          onEnd: opts.onEnd,
          onError: function () { speakTTS(spoken, opts); } // file loi -> TTS
        });
      } else {
        speakTTS(spoken, opts);
      }
    });
    return true;
  }

  // Phat theo chuoi term tho (Dau Tu va cac noi khong co card.id chuan)
  function playTerm(term, opts) {
    return playCard({ id: null, term: term }, opts || {});
  }

  window.VokabelAudio = {
    playCard: playCard,
    playTerm: playTerm,
    speakTTS: speakTTS,
    spokenOf: spokenOf,
    stop: stop,
    loadManifest: loadManifest,
    history: history,
    isPlaying: function () {
      return !!(currentAudio && !currentAudio.paused && !currentAudio.ended);
    }
  };
})();
