// ==============================================================================
// VokabelGo - Game câu cá của Zehn (giai đoạn 1)
// Thay đoạn xem video thụ động bằng một ván câu có thao tác thật, gắn vào hộp
// thoại nhận thưởng hiện tại (reward-prototype.js). Thắng -> gọi đúng đường
// reveal/lưu kho cũ với via:'game'. Thua/hụt -> được 1 lượt phụ trong ngày
// (D2), hết lượt phụ thì quay về luồng video cũ, không bao giờ mất thưởng.
// Điểm quyết mặc định (chị duyệt hướng 2026-10-25): D1 Dễ, D2 lượt phụ,
// D3 1 lượt/ngày, D5 giọng TTS sẵn có cho tiếng gọi "Jetzt!".
// ==============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // LÕI THUẦN (không chạm DOM) — dùng chung cho game và unit test
  // ---------------------------------------------------------------------------

  // Vùng rơi của mồi -> tỉ lệ độ hiếm (bản thiết kế mục 3)
  var ZONE_RARITY_WEIGHTS = {
    near: { common: 85, rare: 15, legendary: 0 },
    mid: { common: 65, rare: 30, legendary: 5 },
    deep: { common: 45, rare: 35, legendary: 20 }
  };

  // Loài nào cắn ở vùng nào (bản thiết kế mục 3)
  var SPECIES_ZONES = {
    sardine: ['near'],
    barsch: ['near', 'mid'],
    forelle: ['mid'],
    karpfen: ['mid'],
    goldfisch: ['mid'],
    regenbogenforelle: ['mid', 'deep'],
    lachs: ['deep'],
    b2_meisterfisch: ['deep'],
    riesenwels: ['deep']
  };

  var RARITY_STRENGTH = { common: 1, rare: 1.6, legendary: 2.4 };

  var ZONE_WAIT = { // giây chờ cắn [min, max] theo vùng
    near: [4, 8],
    mid: [6, 11],
    deep: [8, 14]
  };

  function rngFrom(seed) { // mulberry32 — seed cố định cho test
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Rút một loài cho vùng rơi: lọc loài thuộc vùng, rút độ hiếm theo trọng số
  // của vùng (chỉ tính các độ hiếm đang có mặt), rồi rút đều trong độ hiếm đó.
  function drawFish(zoneId, db, rng) {
    rng = rng || Math.random;
    var pool = db.filter(function (f) {
      var zones = SPECIES_ZONES[f.id] || ['near', 'mid', 'deep'];
      return zones.indexOf(zoneId) !== -1;
    });
    if (!pool.length) pool = db.slice();
    var weights = ZONE_RARITY_WEIGHTS[zoneId] || ZONE_RARITY_WEIGHTS.mid;
    var present = {};
    pool.forEach(function (f) { present[f.rarity] = true; });
    var total = 0;
    Object.keys(weights).forEach(function (r) { if (present[r]) total += weights[r]; });
    var fish = null;
    if (total > 0) {
      var roll = rng() * total;
      var acc = 0;
      var rarities = Object.keys(weights);
      for (var i = 0; i < rarities.length; i++) {
        if (!present[rarities[i]]) continue;
        acc += weights[rarities[i]];
        if (roll < acc) {
          var cands = pool.filter(function (f) { return f.rarity === rarities[i]; });
          fish = cands[Math.floor(rng() * cands.length)];
          break;
        }
      }
    }
    if (!fish) fish = pool[Math.floor(rng() * pool.length)];
    return fish;
  }

  function waitSeconds(zoneId, rng, halved) {
    var range = ZONE_WAIT[zoneId] || ZONE_WAIT.mid;
    var v = range[0] + (rng || Math.random)() * (range[1] - range[0]);
    return halved ? v / 2 : v;
  }

  // --- Mô hình kéo cá (bản thiết kế mục 2.3, độ khó Dễ) ---
  // Giữ nút: tiến độ tăng, căng dây tăng. Cá chạy theo đợt có báo trước.
  // Căng > 95% kéo dài > 0,6s -> đứt. Sau 35s cá yếu dần một nửa.
  function createFight(fish, rng) {
    return {
      fish: fish,
      strength: RARITY_STRENGTH[fish.rarity] || 1,
      progress: 0,
      tension: 0,
      elapsed: 0,
      phase: 'rest', // rest -> telegraph -> run -> rest ...
      phaseT: 0,
      phaseDur: 2 + (rng || Math.random)() * 2, // đợt nghỉ đầu 2–4s
      over95T: 0,
      surgeDone: false,
      over: false,
      won: false,
      snapped: false,
      rng: rng || Math.random
    };
  }

  function stepFight(s, dt, holding) {
    if (s.over) return s;
    s.elapsed += dt;
    s.phaseT += dt;

    // Chu kỳ vùng vẫy: nghỉ 2–4s -> báo trước 0,4s -> chạy 1,5–3s
    if (s.phaseT >= s.phaseDur) {
      s.phaseT = 0;
      if (s.phase === 'rest') { s.phase = 'telegraph'; s.phaseDur = 0.4; }
      else if (s.phase === 'telegraph') { s.phase = 'run'; s.phaseDur = 1.5 + s.rng() * 1.5; }
      else { s.phase = 'rest'; s.phaseDur = 2 + s.rng() * 2; }
    }

    var weaken = s.elapsed > 35 ? 0.5 : 1; // cá tự yếu dần sau 35s
    var running = s.phase === 'run';

    if (holding) {
      s.progress += dt * (running ? 5 : 10);
      var rise = running ? 22 : 10;
      s.tension += dt * rise * (0.7 + 0.3 * s.strength) * weaken;
    } else {
      s.tension -= dt * 34;
    }
    if (s.tension < 0) s.tension = 0;
    if (s.tension > 100) s.tension = 100;

    // Cá huyền thoại bùng nổ một lần ở 70% tiến độ
    if (!s.surgeDone && s.fish.rarity === 'legendary' && s.progress >= 70) {
      s.surgeDone = true;
      s.tension = Math.min(100, s.tension + 25);
      s.phase = 'run'; s.phaseT = 0; s.phaseDur = 2;
      s.surged = true;
    } else {
      s.surged = false;
    }

    if (s.tension >= 95) {
      s.over95T += dt;
      if (s.over95T > 0.6) { s.over = true; s.snapped = true; return s; }
    } else {
      s.over95T = 0;
    }

    if (s.progress >= 100) {
      s.progress = 100;
      s.over = true;
      s.won = true;
    }
    return s;
  }

  // Kỷ lục loài: dài hơn MỌI con cùng loài đã có trong kho (và phải có ít
  // nhất một con cũ để so) — suy ra từ kho, không thêm khóa lưu mới.
  function isSpeciesRecord(collection, entry) {
    if (!entry) return false;
    var len = parseFloat(entry.length);
    if (isNaN(len)) return false;
    var hasPrevious = false;
    for (var i = 0; i < collection.length; i++) {
      var e = collection[i];
      if (e === entry || e.id === entry.id) continue;
      if (e.fishId !== entry.fishId) continue;
      hasPrevious = true;
      if (parseFloat(e.length) >= len) return false;
    }
    return hasPrevious;
  }

  var FishingCore = {
    ZONE_RARITY_WEIGHTS: ZONE_RARITY_WEIGHTS,
    SPECIES_ZONES: SPECIES_ZONES,
    RARITY_STRENGTH: RARITY_STRENGTH,
    ZONE_WAIT: ZONE_WAIT,
    rngFrom: rngFrom,
    drawFish: drawFish,
    waitSeconds: waitSeconds,
    createFight: createFight,
    stepFight: stepFight,
    isSpeciesRecord: isSpeciesRecord
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FishingCore;
  }
  if (typeof window === 'undefined') return;
  window.FishingCore = FishingCore;

  // ---------------------------------------------------------------------------
  // LỚP GIAO DIỆN — gắn vào hộp thoại nhận thưởng
  // ---------------------------------------------------------------------------

  var LS_KEY = 'vokabelgo_fishing_v1';
  var ASSET = 'assets/fishing-game/';
  var SPRITE_BY_FISH = {
    karpfen: ASSET + 'fish-karpfen.png',
    goldfisch: ASSET + 'fish-goldfisch.png',
    riesenwels: ASSET + 'fish-riesenwels.png',
    lachs: ASSET + 'fish-lachs.png',
    forelle: ASSET + 'fish-forelle.png',
    sardine: ASSET + 'fish-sardine.png',
    barsch: ASSET + 'fish-barsch.png',
    regenbogenforelle: ASSET + 'fish-regenbogenforelle.png',
    b2_meisterfisch: ASSET + 'fish-meisterfisch.png'
  };
  var CONSOLATIONS = [
    { de: 'Schade! Der war riesig — bestimmt!', vi: 'Tiếc quá! Con đó chắc to lắm!' },
    { de: 'Der nächste beißt bestimmt an.', vi: 'Con tiếp theo nhất định sẽ cắn.' },
    { de: 'Knapp daneben ist auch vorbei…', vi: 'Suýt nữa thôi mà…' },
    { de: 'Die Fische lachen schon. Morgen lachen wir!', vi: 'Hôm nay cá cười, mai mình cười lại.' }
  ];

  var fastMode = false; // e2e bật: chờ cắn 0,6s, kéo nhanh gấp 3
  var els = null;       // các phần tử DOM của lớp game
  var raf = null;
  var timers = [];
  var state = null;     // trạng thái ván hiện tại

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function loadPlayState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.date === todayKey()) return parsed;
      }
    } catch (e) {}
    return { date: todayKey(), bonusUsed: false, stamps: 0 };
  }

  function savePlayState(p) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function later(fn, ms) {
    var id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  var sceneRaf = null;
  function clearTimers() {
    timers.forEach(function (id) { clearTimeout(id); });
    timers = [];
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    if (sceneRaf) { cancelAnimationFrame(sceneRaf); sceneRaf = null; }
  }

  // --- Âm thanh tự tổng hợp (không tệp ngoài): bíp + tiếng nước + ambient ---
  var audioCtx = null;
  function ensureCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function gameSoundOn() {
    // Tôn trọng nút tắt tiếng sẵn có của hộp thoại nhận thưởng
    try {
      var t = document.getElementById('btnRewardSoundToggle');
      if (t && (t.textContent.indexOf('🔇') !== -1 || t.classList.contains('muted'))) return false;
    } catch (e) {}
    return true;
  }
  function beep(freq, dur, type, vol, when) {
    try {
      if (!gameSoundOn()) return;
      var ctx = ensureCtx();
      var t = ctx.currentTime + (when || 0);
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  var noiseBuf = null;
  function getNoiseBuf(ctx) {
    if (noiseBuf) return noiseBuf;
    var len = ctx.sampleRate * 1.2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function noiseBurst(dur, fFrom, fTo, vol, type) {
    try {
      if (!gameSoundOn()) return;
      var ctx = ensureCtx();
      var t = ctx.currentTime;
      var src = ctx.createBufferSource();
      src.buffer = getNoiseBuf(ctx);
      src.loop = true;
      var flt = ctx.createBiquadFilter();
      flt.type = type || 'lowpass';
      flt.frequency.setValueAtTime(fFrom, t);
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, fTo), t + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(flt); flt.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur + 0.05);
    } catch (e) {}
  }
  function sndSplash(big) {
    noiseBurst(big ? 0.5 : 0.3, 1400, 300, big ? 0.16 : 0.10);
    beep(300, 0.25, 'sine', 0.06);
    beep(180, 0.3, 'sine', 0.04, 0.05);
  }
  function sndNibble() { noiseBurst(0.08, 2000, 900, 0.05, 'bandpass'); beep(880, 0.07, 'sine', 0.04); }
  function sndBite() { beep(660, 0.1, 'square', 0.07); beep(990, 0.14, 'square', 0.07, 0.09); }
  function sndSnap() {
    noiseBurst(0.18, 3000, 500, 0.12, 'highpass');
    beep(220, 0.35, 'sawtooth', 0.08); beep(140, 0.4, 'sawtooth', 0.06, 0.08);
  }
  function sndReelClick() { noiseBurst(0.03, 2600, 1800, 0.05, 'bandpass'); }
  function sndWin() {
    beep(523, 0.14, 'triangle', 0.09);
    beep(659, 0.14, 'triangle', 0.09, 0.1);
    beep(784, 0.26, 'triangle', 0.10, 0.2);
  }
  // Ambient ao: nước rì rào rất khẽ + chim hót thưa, chỉ chạy khi game mở
  var ambient = null;
  function startAmbient() {
    try {
      if (!gameSoundOn() || ambient) return;
      var ctx = ensureCtx();
      var src = ctx.createBufferSource();
      src.buffer = getNoiseBuf(ctx);
      src.loop = true;
      var flt = ctx.createBiquadFilter();
      flt.type = 'lowpass'; flt.frequency.value = 420;
      var g = ctx.createGain(); g.gain.value = 0.014;
      var lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
      var lfoG = ctx.createGain(); lfoG.gain.value = 0.005;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      src.connect(flt); flt.connect(g); g.connect(ctx.destination);
      src.start(); lfo.start();
      ambient = { src: src, lfo: lfo, birdTimer: null };
      var chirp = function () {
        if (!ambient) return;
        if (gameSoundOn()) {
          var base = 2300 + Math.random() * 500;
          beep(base, 0.09, 'sine', 0.018);
          beep(base * 0.82, 0.11, 'sine', 0.015, 0.12);
        }
        ambient.birdTimer = setTimeout(chirp, 3800 + Math.random() * 5200);
      };
      ambient.birdTimer = setTimeout(chirp, 2000);
    } catch (e) {}
  }
  function stopAmbient() {
    if (!ambient) return;
    try {
      if (ambient.birdTimer) clearTimeout(ambient.birdTimer);
      ambient.src.stop(); ambient.lfo.stop();
    } catch (e) {}
    ambient = null;
  }
  function speakDe(text) {
    try {
      if (window.VokabelTTS && typeof window.VokabelTTS.speakGerman === 'function') {
        window.VokabelTTS.speakGerman(text);
      }
    } catch (e) {}
  }

  // Nạp trước các tư thế để đổi hình không chớp
  function preloadPoses() {
    ['idle', 'cast', 'castback', 'castthrow', 'yank', 'lift', 'reeling', 'celebrate'].forEach(function (p) {
      var im = new Image();
      im.src = ASSET + 'zehn-' + p + '.png';
    });
  }

  // --- Dựng DOM (một lần) ---
  function buildDom() {
    var wrapper = document.querySelector('#rewardPrototypeModal .reward-stage-wrapper');
    if (!wrapper || document.getElementById('fishingGameLayer')) return;

    var layer = document.createElement('div');
    layer.id = 'fishingGameLayer';
    layer.className = 'fishing-game-layer hidden';
    layer.innerHTML =
      '<img class="fg-bg" src="' + ASSET + 'pond-bg.webp" alt="">' +
      '<div class="fg-water-shade"></div>' +
      '<div class="fg-zone-tint" id="fgZoneTint"></div>' +
      '<div class="fg-ambient" aria-hidden="true">' +
        '<span class="fg-shimmer"></span>' +
        '<span class="fg-leaf fg-leaf-1"></span>' +
        '<span class="fg-leaf fg-leaf-2"></span>' +
        '<span class="fg-dragonfly"></span>' +
      '</div>' +
      '<img class="fg-zehn" id="fgZehn" src="' + ASSET + 'zehn-idle.png" alt="Zehn đang câu cá">' +
      '<svg class="fg-line-svg" id="fgLineSvg" viewBox="0 0 1000 562" preserveAspectRatio="none" aria-hidden="true">' +
        '<path id="fgLinePath" d="" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" stroke-linecap="round"/></svg>' +
      '<img class="fg-fight-fish" id="fgFightFish" alt="">' +
      '<div class="fg-fish-shadow" id="fgFishShadow"></div>' +
      '<div class="fg-fx" id="fgFx"></div>' +
      '<div class="fg-bobber hidden" id="fgBobber"><span class="fg-bobber-top"></span></div>' +
      '<div class="fg-bang hidden" id="fgBang">!</div>' +
      '<div class="fg-speech" id="fgSpeech"><span class="fg-speech-de" id="fgSpeechDe"></span>' +
      '<span class="fg-speech-vi" id="fgSpeechVi"></span></div>' +
      '<div class="fg-gauge hidden" id="fgGauge">' +
        '<div class="fg-gauge-band fg-band-near">Gần bờ</div>' +
        '<div class="fg-gauge-band fg-band-mid">Giữa ao</div>' +
        '<div class="fg-gauge-band fg-band-deep">Vùng sâu</div>' +
        '<div class="fg-gauge-marker" id="fgGaugeMarker"></div>' +
      '</div>' +
      '<div class="fg-meters hidden" id="fgMeters">' +
        '<div class="fg-meter fg-meter-progress"><label>Tiến độ kéo</label>' +
          '<div class="fg-meter-track"><div class="fg-meter-fill" id="fgProgressFill"></div></div></div>' +
        '<div class="fg-meter fg-meter-tension"><label>Độ căng dây <span id="fgTensionWarn">⚠ sắp đứt!</span></label>' +
          '<div class="fg-meter-track"><div class="fg-meter-fill" id="fgTensionFill"></div></div></div>' +
      '</div>' +
      '<div class="fg-controls">' +
        '<button type="button" class="fg-action" id="fgAction">Thả câu 🎣</button>' +
        '<div class="fg-sub" id="fgSub"></div>' +
        '<button type="button" class="fg-skip" id="fgSkip">Nhận cá ngay như cũ</button>' +
      '</div>';
    wrapper.appendChild(layer);

    // Nút mở game trong header của hộp thoại
    var headerBtns = document.querySelector('#rewardPrototypeModal .reward-header-right-btns');
    var startBtn = null;
    if (headerBtns) {
      startBtn = document.createElement('button');
      startBtn.type = 'button';
      startBtn.id = 'fishingGameStartBtn';
      startBtn.className = 'fishing-game-start-btn';
      startBtn.textContent = '🎣 Chơi game câu cá';
      startBtn.title = 'Chơi một ván câu cá thay vì xem video';
      headerBtns.insertBefore(startBtn, headerBtns.firstChild);
    }

    els = {
      layer: layer,
      zehn: layer.querySelector('#fgZehn'),
      zoneTint: layer.querySelector('#fgZoneTint'),
      lineSvg: layer.querySelector('#fgLineSvg'),
      linePath: layer.querySelector('#fgLinePath'),
      fightFish: layer.querySelector('#fgFightFish'),
      fx: layer.querySelector('#fgFx'),
      bobber: layer.querySelector('#fgBobber'),
      shadow: layer.querySelector('#fgFishShadow'),
      bang: layer.querySelector('#fgBang'),
      speech: layer.querySelector('#fgSpeech'),
      speechDe: layer.querySelector('#fgSpeechDe'),
      speechVi: layer.querySelector('#fgSpeechVi'),
      gauge: layer.querySelector('#fgGauge'),
      gaugeMarker: layer.querySelector('#fgGaugeMarker'),
      meters: layer.querySelector('#fgMeters'),
      progressFill: layer.querySelector('#fgProgressFill'),
      tensionFill: layer.querySelector('#fgTensionFill'),
      tensionWarn: layer.querySelector('#fgTensionWarn'),
      action: layer.querySelector('#fgAction'),
      sub: layer.querySelector('#fgSub'),
      skip: layer.querySelector('#fgSkip'),
      startBtn: startBtn
    };

    if (startBtn) startBtn.addEventListener('click', startGame);
    els.skip.addEventListener('click', exitToClassic);
    els.action.addEventListener('pointerdown', function (e) { e.preventDefault(); onPress(); });
    window.addEventListener('pointerup', onRelease);
    els.action.addEventListener('pointerup', function () { /* nhả xử lý ở window */ });
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space') return;
      if (!state || els.layer.classList.contains('hidden')) return;
      if (e.repeat) return;
      e.preventDefault();
      onPress();
    });
    document.addEventListener('keyup', function (e) {
      if (e.code === 'Space') onRelease();
    });

    // Đóng hộp thoại -> dọn ván đang chơi
    var modal = document.getElementById('rewardPrototypeModal');
    if (modal && window.MutationObserver) {
      new MutationObserver(function () {
        if (modal.classList.contains('hidden')) destroyRound();
      }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function setZehn(pose) {
    if (els) els.zehn.src = ASSET + 'zehn-' + pose + '.png';
  }

  function say(de, vi) {
    if (!els) return;
    els.speechDe.textContent = de || '';
    els.speechVi.textContent = vi || '';
    els.speech.classList.toggle('show', !!de);
  }

  function setAction(label, enabled) {
    if (!els) return;
    els.action.textContent = label;
    els.action.disabled = enabled === false;
  }

  // --- Vòng đời ván ---
  function startGame() {
    buildDom();
    if (!els) return;
    var video = document.getElementById('rewardCatVideo');
    if (video) video.pause();
    if (els.startBtn) els.startBtn.classList.add('hidden');
    els.layer.classList.remove('hidden');
    startAmbient();
    newRound(false);
  }

  function newRound(isBonus) {
    clearTimers();
    var play = loadPlayState();
    state = {
      phase: 'intro',
      isBonus: isBonus,
      zone: null,
      fish: null,
      fight: null,
      holding: false,
      gaugeT: 0,
      gaugeDir: 1,
      biteAt: 0,
      nibblesLeft: 0,
      nextNibbleAt: 0,
      hookDeadline: 0,
      recast: false,
      bobberXPct: 55,
      fishXPct: 55,
      fishFlip: false,
      sceneT: 0,
      lastRippleAt: 0,
      lastClickAt: 0,
      lastSurfSplashAt: 0,
      slowUntil: 0
    };
    setZehn('idle');
    els.zehn.classList.remove('fg-reeling-rock', 'fg-reeling-hard');
    els.bobber.classList.add('hidden');
    els.bang.classList.add('hidden');
    els.gauge.classList.add('hidden');
    els.meters.classList.add('hidden');
    els.shadow.style.opacity = '0';
    els.zoneTint.className = 'fg-zone-tint';
    els.lineSvg.style.opacity = '0';
    els.fightFish.classList.remove('show');
    els.fx.innerHTML = '';
    say('', '');
    setAction('Thả câu 🎣', true);
    els.sub.textContent = play.bonusUsed
      ? 'Một ván câu thư giãn — thắng là cá vào giỏ ngay.'
      : 'Một ván câu thư giãn — hụt vẫn còn 1 lượt phụ hôm nay.';
  }

  function exitToClassic() {
    // Đường thoát nhanh: quay về luồng video cũ, thưởng không đổi
    destroyRound();
    if (els) {
      els.layer.classList.add('hidden');
      if (els.startBtn) els.startBtn.classList.remove('hidden');
    }
    var video = document.getElementById('rewardCatVideo');
    if (video) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  function destroyRound() {
    clearTimers();
    stopAmbient();
    state = null;
    if (els) {
      els.layer.classList.add('hidden');
      if (els.startBtn) els.startBtn.classList.remove('hidden');
    }
  }

  // --- Điều khiển một nút ---
  function onPress() {
    if (!state) return;
    if (state.phase === 'intro') { startCast(); return; }
    if (state.phase === 'cast') { lockCast(); return; }
    if (state.phase === 'wait') { hookAttempt(false); return; }
    if (state.phase === 'bite') { hookAttempt(false); return; }
    if (state.phase === 'fight') { state.holding = true; }
  }

  function onRelease() {
    if (state && state.phase === 'fight') state.holding = false;
  }

  // --- Lớp "nước sống": dây câu, gợn sóng, tóe nước, cá hiện hình ---
  function spawnRipple(xPct, big) {
    if (!els) return;
    var r = document.createElement('span');
    r.className = 'fg-ripple' + (big ? ' big' : '');
    r.style.left = xPct + '%';
    els.fx.appendChild(r);
    later(function () { r.remove(); }, 1700);
  }

  function spawnSplash(xPct, n, big) {
    if (!els) return;
    for (var i = 0; i < (n || 6); i++) {
      var d = document.createElement('span');
      d.className = 'fg-drop' + (big ? ' big' : '');
      d.style.left = xPct + '%';
      d.style.setProperty('--dx', ((Math.random() * 2 - 1) * (big ? 46 : 26)).toFixed(0) + 'px');
      d.style.setProperty('--dy', (-(14 + Math.random() * (big ? 44 : 26))).toFixed(0) + 'px');
      els.fx.appendChild(d);
      (function (el) { later(function () { el.remove(); }, 750); })(d);
    }
  }

  function elementCenterSvg(el) {
    try {
      var r = el.getBoundingClientRect();
      var lr = els.layer.getBoundingClientRect();
      if (!lr.width || !lr.height) return null;
      return {
        x: ((r.left + r.width / 2 - lr.left) / lr.width) * 1000,
        y: ((r.top + r.height / 2 - lr.top) / lr.height) * 562
      };
    } catch (e) { return null; }
  }

  function updateLine() {
    if (!state || !els) return;
    var tipX = 330, tipY = 168;
    // Tư thế nhấc cá: đầu cần nằm cao bên phải theo đúng hình vẽ
    if (state.phase === 'won') { tipX = 505; tipY = 95; }
    var bx = state.bobberXPct * 10;
    var by = 352 + (els.bobber.classList.contains('sunk') ? 12 : (els.bobber.classList.contains('nibble') ? 4 : 0));
    // Khi mồi đang bay / cá đang được nhấc lên: đầu dây bám theo vật đang chuyển động
    if (state.phase === 'casting') {
      var bp = elementCenterSvg(els.bobber);
      if (bp) { bx = bp.x; by = bp.y; }
    } else if (state.phase === 'won') {
      var fp = elementCenterSvg(els.fightFish);
      if (fp) { bx = fp.x; by = fp.y; }
    }
    var sag = 30;
    var color = 'rgba(255,255,255,0.85)';
    if (state.phase === 'bite') sag = 6;
    if (state.phase === 'fight' && state.fight) {
      var t = state.fight.tension;
      sag = 34 * (1 - t / 100) + 3;
      color = t >= 95 ? '#ef4444' : (t >= 75 ? '#fbbf24' : 'rgba(255,255,255,0.9)');
    }
    var cx = (tipX + bx) / 2;
    var cy = Math.max(tipY, by) + sag;
    els.linePath.setAttribute('d', 'M ' + tipX + ' ' + tipY + ' Q ' + cx + ' ' + cy + ' ' + bx + ' ' + by);
    els.linePath.setAttribute('stroke', color);
  }

  function startSceneLoop() {
    if (sceneRaf) return;
    var last = performance.now();
    var loop = function (now) {
      sceneRaf = null;
      if (!state || els.layer.classList.contains('hidden')) return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      state.sceneT += dt;
      // Gợn sóng quanh phao khi chờ
      if ((state.phase === 'wait' || state.phase === 'bite') && now - state.lastRippleAt > 1500) {
        state.lastRippleAt = now;
        spawnRipple(state.bobberXPct, false);
      }
      updateLine();
      // Cá hiện hình trong pha kéo
      if (state.phase === 'fight' && state.fight) {
        var s = state.fight;
        var base = state.bobberXPct;
        var target, flip;
        if (s.phase === 'run') { target = base + 10; flip = true; }
        else { target = base + Math.sin(state.sceneT * 0.8) * 2.0; flip = false; }
        var k = Math.min(1, dt * (s.phase === 'run' ? 5 : 1.6));
        state.fishXPct += (target - state.fishXPct) * k;
        state.fishFlip = flip;
        var surface = s.progress >= 85;
        els.fightFish.classList.toggle('surface', surface);
        els.fightFish.style.left = state.fishXPct + '%';
        els.fightFish.style.bottom = surface
          ? (27 + Math.sin(state.sceneT * 9) * 1.4) + '%'
          : (13.5 + Math.sin(state.sceneT * 2.1) * 0.8) + '%';
        els.fightFish.style.transform = 'translateX(-50%) scaleX(' + (flip ? -1 : 1) + ')';
        if (surface && now - state.lastSurfSplashAt > 320) {
          state.lastSurfSplashAt = now;
          spawnSplash(state.fishXPct, 4, false);
          noiseBurst(0.15, 1200, 400, 0.05);
        }
      }
      sceneRaf = requestAnimationFrame(loop);
    };
    sceneRaf = requestAnimationFrame(loop);
  }

  // Cá thắng được Zehn nhấc lên: rời mặt nước, treo ở đầu dây cạnh bè và đung đưa
  function liftFish(fish) {
    if (!els || !fish) return;
    var el = els.fightFish;
    var fromLeft = parseFloat(el.style.left) || state.fishXPct;
    var fromBottom = parseFloat(el.style.bottom) || 14;
    el.classList.remove('under', 'surface');
    el.classList.add('show', 'fg-lifted');
    el.style.transform = 'translateX(-50%)';
    spawnSplash(state.bobberXPct, 5, false);
    later(function () { spawnSplash(47, 3, false); }, 350);
    if (el.animate) {
      el.animate([
        { left: fromLeft + '%', bottom: fromBottom + '%' },
        { left: '47%', bottom: '60%' }
      ], { duration: 720, easing: 'cubic-bezier(.25,.7,.3,1)', fill: 'forwards' });
      var swing = el.animate([
        { transform: 'translateX(-50%) rotate(-6deg)' },
        { transform: 'translateX(-50%) rotate(6deg)' },
        { transform: 'translateX(-50%) rotate(-3deg)' },
        { transform: 'translateX(-50%) rotate(0deg)' }
      ], { duration: 950, delay: 700, easing: 'ease-in-out', fill: 'forwards' });
      swing.onfinish = function () {};
    } else {
      el.style.left = '47%';
      el.style.bottom = '60%';
    }
  }

  // Pha 1: thanh lực quét, bấm để chốt vùng rơi
  function startCast() {
    state.phase = 'cast';
    setZehn('castback');
    say('', '');
    els.gauge.classList.remove('hidden');
    setAction('Thả! 🎯', true);
    els.sub.textContent = 'Bấm lần nữa để mồi rơi: gần bờ dễ câu, vùng sâu cá to.';
    var last = performance.now();
    var tick = function (now) {
      if (!state || state.phase !== 'cast') return;
      var dt = (now - last) / 1000; last = now;
      state.gaugeT += dt * state.gaugeDir / 1.1; // chu kỳ quét 1,1s
      if (state.gaugeT >= 1) { state.gaugeT = 1; state.gaugeDir = -1; }
      if (state.gaugeT <= 0) { state.gaugeT = 0; state.gaugeDir = 1; }
      els.gaugeMarker.style.left = (state.gaugeT * 100) + '%';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function zoneFromGauge(t) {
    if (t < 0.34) return 'near';
    if (t < 0.72) return 'mid';
    return 'deep';
  }

  function lockCast() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    state.zone = zoneFromGauge(state.gaugeT);
    els.gauge.classList.add('hidden');
    // Phao rơi theo vùng: gần 38%, giữa 55%, sâu 72% bề ngang
    var xPct = state.zone === 'near' ? 38 : (state.zone === 'mid' ? 55 : 72);
    state.bobberXPct = xPct;
    els.bobber.style.left = xPct + '%';
    els.bobber.classList.remove('hidden');
    els.bobber.classList.remove('sunk');
    els.zoneTint.className = 'fg-zone-tint fg-tint-' + state.zone;
    els.lineSvg.style.opacity = '1';
    // Chuỗi chuyển động thả câu: Zehn đã vung cần ra sau ở pha canh lực,
    // giờ quăng cần ra trước và mồi bay theo đường cong tới vùng rơi.
    state.phase = 'casting';
    setAction('Đang thả câu…', false);
    els.sub.textContent = '';
    startSceneLoop();
    later(function () {
      if (!state || state.phase !== 'casting') return;
      setZehn('castthrow');
      noiseBurst(0.25, 900, 1900, 0.045, 'bandpass');
      flyBobber(xPct);
    }, 240);
  }

  // Mồi bay từ đầu cần tới điểm rơi (hiệu ứng vật lý bằng WAAPI)
  function flyBobber(xPct) {
    if (!els) return;
    var bob = els.bobber;
    try {
      var layerRect = els.layer.getBoundingClientRect();
      var rect = bob.getBoundingClientRect();
      var startX = layerRect.left + layerRect.width * 0.335;
      var startY = layerRect.top + layerRect.height * 0.28;
      var dx = startX - (rect.left + rect.width / 2);
      var dy = startY - (rect.top + rect.height / 2);
      if (bob.animate) {
        var anim = bob.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px)' },
          { transform: 'translate(' + (dx * 0.45) + 'px,' + (dy - layerRect.height * 0.16) + 'px)', offset: 0.55 },
          { transform: 'translate(0px, 0px)' }
        ], { duration: 620, easing: 'cubic-bezier(.25,.6,.35,1)' });
        anim.onfinish = landBobber;
        later(function () { if (state && state.phase === 'casting') landBobber(); }, 760);
        return;
      }
    } catch (e) {}
    landBobber();
  }

  function landBobber() {
    if (!state || state.phase !== 'casting') return;
    sndSplash(false);
    spawnSplash(state.bobberXPct, 6, false);
    spawnRipple(state.bobberXPct, true);
    setZehn('idle');
    startWait(false);
  }

  // Pha 2: chờ cắn — giật giả rồi cắn thật
  function startWait(isRecast) {
    state.phase = 'wait';
    state.recast = !!isRecast;
    var db = window.VokabelFishDatabase || [];
    state.fish = FishingCore.drawFish(state.zone, db, Math.random);
    var wait = fastMode ? 0.6 : FishingCore.waitSeconds(state.zone, Math.random, isRecast);
    state.biteAt = performance.now() + wait * 1000;
    state.nibblesLeft = fastMode ? 0 : 1 + Math.floor(Math.random() * 3);
    state.nextNibbleAt = performance.now() + (wait * 1000) * (0.3 + Math.random() * 0.3);
    setAction('Chờ cá cắn…', false);
    els.sub.textContent = 'Phao động nhẹ là cá rỉa mồi — đừng giật vội. Phao chìm hẳn mới là cá cắn!';
    els.shadow.style.opacity = '0.5';
    els.shadow.style.left = els.bobber.style.left;
    startSceneLoop();
    pollWait();
  }

  function pollWait() {
    if (!state || state.phase !== 'wait') return;
    var now = performance.now();
    if (state.nibblesLeft > 0 && now >= state.nextNibbleAt && now < state.biteAt - 600) {
      state.nibblesLeft--;
      state.nextNibbleAt = now + 900 + Math.random() * 1400;
      els.bobber.classList.add('nibble');
      sndNibble();
      later(function () { if (els) els.bobber.classList.remove('nibble'); }, 350);
    }
    if (now >= state.biteAt) { biteNow(); return; }
    later(pollWait, 90);
  }

  function biteNow() {
    state.phase = 'bite';
    els.bobber.classList.add('sunk');
    els.bang.classList.remove('hidden');
    els.bang.style.left = els.bobber.style.left;
    spawnSplash(state.bobberXPct, 5, false);
    sndBite();
    speakDe('Jetzt!');
    say('Jetzt!', 'Giật ngay!');
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) {} }
    setAction('GIẬT! 🪝', true);
    state.hookDeadline = performance.now() + (fastMode ? 2500 : 900);
    pollBite();
  }

  function pollBite() {
    if (!state || state.phase !== 'bite') return;
    if (performance.now() > state.hookDeadline) { hookAttempt(true); return; }
    later(pollBite, 50);
  }

  function hookAttempt(expired) {
    if (!state) return;
    if (state.phase === 'bite' && !expired) {
      // Móc dính -> pha kéo: rung nhẹ + chậm một nhịp cho đã tay
      els.bang.classList.add('hidden');
      els.bobber.classList.remove('sunk');
      els.layer.classList.add('fg-shake');
      later(function () { if (els) els.layer.classList.remove('fg-shake'); }, 380);
      spawnSplash(state.bobberXPct, 8, true);
      sndSplash(true);
      state.slowUntil = performance.now() + 380;
      // Zehn giựt mạnh cần lên cho móc đóng chắc, rồi mới vào tư thế kéo
      setZehn('yank');
      later(function () {
        if (state && state.phase === 'fight') setZehn('reeling');
      }, 500);
      say('Er beißt an!', 'Cá dính rồi — giữ nút để kéo!');
      startFight();
      return;
    }
    if (state.phase === 'wait' || (state.phase === 'bite' && expired)) {
      // Giật sớm vào giật giả, hoặc chậm tay: cá nhả, ném lại trong cùng lượt
      els.bang.classList.add('hidden');
      els.bobber.classList.remove('sunk');
      if (state.phase === 'wait') { say('Zu früh!', 'Sớm quá — đó mới là cá rỉa mồi.'); }
      else { say('Knapp daneben!', 'Suýt nữa! Cá nhả mồi rồi.'); }
      sndNibble();
      state.phase = 'missed';
      setAction('Câu lại', false);
      later(function () {
        if (!state) return;
        setAction('Chờ cá cắn…', false);
        startWait(true);
      }, 1100);
    }
  }

  // Pha 3: kéo cá bằng mô hình căng dây
  function startFight() {
    state.phase = 'fight';
    state.holding = false;
    state.fight = FishingCore.createFight(state.fish, Math.random);
    els.zehn.classList.add('fg-reeling-rock');
    // Cá hiện hình dưới nước: sprite loài (hoặc SVG dự phòng), mờ xanh dưới nước
    var fish = state.fish;
    if (SPRITE_BY_FISH[fish.id]) {
      els.fightFish.src = SPRITE_BY_FISH[fish.id];
    } else if (typeof window.getVokabelFishSvg === 'function') {
      try { els.fightFish.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(window.getVokabelFishSvg(fish)); } catch (e) {}
    }
    els.fightFish.style.width = fish.rarity === 'legendary' ? '27%' : (fish.rarity === 'rare' ? '23%' : '19%');
    if (els.fightFish.getAnimations) {
      els.fightFish.getAnimations().forEach(function (a) { a.cancel(); });
    }
    els.fightFish.className = 'fg-fight-fish show under';
    state.fishXPct = state.bobberXPct;
    els.fightFish.style.left = state.fishXPct + '%';
    els.shadow.style.opacity = '0';
    els.shadow.classList.remove('fg-shadow-run', 'fg-shadow-telegraph');
    els.meters.classList.remove('hidden');
    setAction('GIỮ ĐỂ KÉO 🎣', true);
    els.sub.textContent = 'Giữ nút để kéo. Cá vùng chạy (bọt nước nổi) thì NHẢ nút kẻo đứt dây!';
    var last = performance.now();
    var tick = function (now) {
      if (!state || state.phase !== 'fight') return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var s = state.fight;
      var wasSurged = s.surged;
      var scale = fastMode ? 3 : (now < state.slowUntil ? 0.35 : 1);
      FishingCore.stepFight(s, dt * scale, state.holding);
      // Tiếng cuộn dây khi giữ: càng căng càng dồn dập
      if (state.holding && now - state.lastClickAt > Math.max(55, 150 - s.tension * 0.95)) {
        state.lastClickAt = now;
        sndReelClick();
      }
      els.zehn.classList.toggle('fg-reeling-hard', !!state.holding);
      // Vẽ lại
      els.progressFill.style.width = s.progress + '%';
      els.tensionFill.style.width = s.tension + '%';
      els.tensionFill.className = 'fg-meter-fill' +
        (s.tension >= 95 ? ' fg-t-danger' : (s.tension >= 75 ? ' fg-t-warn' : ''));
      els.tensionWarn.style.visibility = s.tension >= 75 ? 'visible' : 'hidden';
      els.shadow.classList.toggle('fg-shadow-run', s.phase === 'run');
      els.shadow.classList.toggle('fg-shadow-telegraph', s.phase === 'telegraph');
      if (s.surged && !wasSurged) { say('Halt durch!', 'Cá bùng lên — nhả tay ngay!'); speakDe('Halt durch!'); }
      if (s.over) { finishFight(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function finishFight() {
    var s = state.fight;
    els.meters.classList.add('hidden');
    els.fightFish.classList.remove('show');
    els.zehn.classList.remove('fg-reeling-rock', 'fg-reeling-hard');
    if (s.won) { winRound(); return; }
    // Đứt dây: kết thúc ván, an ủi + lượt phụ (D2)
    sndSnap();
    els.lineSvg.style.opacity = '0';
    spawnSplash(state.bobberXPct, 4, false);
    setZehn('idle');
    els.bobber.classList.add('hidden');
    els.shadow.style.opacity = '0';
    var c = CONSOLATIONS[Math.floor(Math.random() * CONSOLATIONS.length)];
    say(c.de, c.vi);
    speakDe('Schade!');
    state.phase = 'lost';
    var play = loadPlayState();
    if (!play.bonusUsed) {
      play.bonusUsed = true;
      savePlayState(play);
      setAction('Câu lại lần nữa (lượt phụ)', true);
      els.action.onclick = function () { els.action.onclick = null; newRound(true); };
      els.sub.textContent = 'Dây đứt mất rồi. Hôm nay còn 1 lượt phụ — thử lại nhé!';
    } else {
      setAction('Nhận cá như cũ', true);
      els.action.onclick = function () { els.action.onclick = null; exitToClassic(); };
      els.sub.textContent = 'Lượt phụ cũng hết. Nhận cá theo cách cũ cho chắc nhé — mai câu tiếp!';
    }
  }

  // Pha 4: lên cá — bàn giao cho đường reveal/lưu kho hiện có
  function winRound() {
    var fish = state.fish;
    state.phase = 'won';
    els.bobber.classList.add('hidden');
    els.shadow.style.opacity = '0';
    spawnSplash(state.bobberXPct, 10, true);
    sndSplash(true);
    sndWin();
    // Zehn nhấc cần lên: con cá được kéo lên khỏi mặt nước, treo lủng lẳng
    // ở đầu dây cạnh bè, đung đưa một nhịp rồi mới vào thẻ.
    setZehn('lift');
    liftFish(fish);
    later(function () { if (state && state.phase === 'won') setZehn('celebrate'); }, 980);
    say('Ein ' + fish.german + '!', 'Lên cá rồi!');
    speakDe('Ein ' + fish.german + '!');

    // Sổ bằng chứng: chỉ ghi nhận hoàn thành, không chấm điểm (nguyên tắc nhà)
    try {
      if (window.VokabelEvidence && typeof window.VokabelEvidence.record === 'function') {
        window.VokabelEvidence.record('fishing', 'complete', { ref: fish.id });
      }
    } catch (e) {}

    later(function () {
      destroyRound();
      if (typeof window.triggerVokabelCatchReveal === 'function') {
        window.triggerVokabelCatchReveal(fish.id, 'game');
        later(function () { decorateReveal(fish); }, 60);
      } else {
        // Dự phòng: quay về luồng cũ nếu bản reward chưa có điểm gắn
        exitToClassic();
      }
    }, 1400);
  }

  // Sau reveal: thay hình loài có sprite, ghi số đo + kỷ lục loài vào thẻ
  function decorateReveal(fish) {
    var art = document.getElementById('catchFishArt');
    if (art && SPRITE_BY_FISH[fish.id]) {
      art.innerHTML = '<img src="' + SPRITE_BY_FISH[fish.id] + '" alt="' + fish.german + '" style="max-width:82%;max-height:150px;object-fit:contain;">';
    }
    var entry = null;
    var collection = [];
    try {
      collection = JSON.parse(localStorage.getItem('vokabelgo_fish_collection_v1') || '[]');
      entry = collection[0] && collection[0].fishId === fish.id ? collection[0] : null;
    } catch (e) {}
    var card = document.getElementById('catchWordCard');
    if (!card) return;
    var old = document.getElementById('fishingGameMeta');
    if (old) old.remove();
    var meta = document.createElement('div');
    meta.id = 'fishingGameMeta';
    meta.className = 'fishing-game-meta';
    var isRec = false;
    if (entry) isRec = FishingCore.isSpeciesRecord(collection, entry);
    if (isRec) meta.classList.add('record');
    if (entry && !isNaN(parseFloat(entry.length)) && !isNaN(parseFloat(entry.weight))) {
      var targetLen = parseFloat(entry.length);
      var targetWgt = parseFloat(entry.weight);
      meta.innerHTML = '🎣 Câu bằng game · <span class="fg-meta-num">0</span> cm · <span class="fg-meta-num">0</span> kg' +
        (isRec ? ' · 🏆 Kỷ lục mới của loài này!' : '');
      card.appendChild(meta);
      var nums = meta.querySelectorAll('.fg-meta-num');
      var t0 = performance.now();
      var countTick = function (now) {
        var p = Math.min(1, (now - t0) / 850);
        var eased = 1 - Math.pow(1 - p, 3);
        nums[0].textContent = (targetLen * eased).toFixed(1).replace('.', ',');
        nums[1].textContent = (targetWgt * eased).toFixed(2).replace('.', ',');
        if (p < 1) requestAnimationFrame(countTick);
      };
      requestAnimationFrame(countTick);
    } else {
      meta.textContent = '🎣 Câu bằng game';
      card.appendChild(meta);
    }
  }

  // Khởi tạo khi DOM sẵn sàng (nút mở game chỉ hiện cùng hộp thoại)
  function init() { buildDom(); preloadPoses(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VokabelFishingGame = {
    start: startGame,
    exitToClassic: exitToClassic,
    __test: {
      setFastMode: function (v) { fastMode = !!v; },
      core: FishingCore
    }
  };
})();
