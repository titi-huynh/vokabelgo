// ==============================================================================
// VokabelGo - Game câu cá của Zehn
// Thay đoạn xem video thụ động bằng một ván câu có thao tác thật, gắn vào hộp
// thoại nhận thưởng hiện tại (reward-prototype.js). Thắng -> gọi đúng đường
// reveal/lưu kho cũ với via:'game'. Thua/hụt -> được 1 lượt phụ trong ngày
// (D2), hết lượt phụ thì quay về luồng video cũ, không bao giờ mất thưởng.
// Điểm quyết mặc định (chị duyệt hướng 2026-10-25): D1 Dễ, D2 lượt phụ,
// D3 1 lượt/ngày, D5 giọng TTS sẵn có cho tiếng gọi "Jetzt!".
//
// Tầng cảnh vẽ bằng CANVAS (chị duyệt làm lại 2026-10-25): Zehn là hình khớp
// nối — thân vẽ riêng, cần câu là vật riêng quay quanh khớp tay bằng vật lý
// lò xo và CONG theo độ căng dây; cá là nhân vật bơi thật dưới nước (chính
// con cá sắp cắn sẽ lượn quanh phao, rỉa mồi, rồi lao vào cắn); hạt nước,
// bong bóng, gợn sóng chạy bằng vật lý hạt; máy quay có lia/zoom/rung nhẹ.
// Luật chơi (FishingCore) và đường lưu kho giữ nguyên như bản DOM trước.
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

  // ---------------------------------------------------------------------------
  // TẦNG CẢNH CANVAS — Zehn khớp nối, cá bơi thật, vật lý hạt, máy quay
  // Hệ tọa độ ảo 1000x562 (khớp khung tranh ao). Mọi pha của ván chỉ đặt
  // "lệnh" vào scene (góc cần đích, chế độ phao/cá); vòng lặp vẽ 60fps tự
  // nội suy bằng lò xo/thủy động nên chuyển động luôn liên tục.
  // ---------------------------------------------------------------------------

  var VW = 1000, VH = 562, WATER_Y = 352;
  var IMG = {};
  var SILHOUETTES = [];
  var cv = { canvas: null, ctx: null, w: 0, h: 0, dpr: 1, running: false, last: 0 };

  function loadImg(key, src) {
    var im = new Image();
    im.src = src;
    IMG[key] = im;
    return im;
  }
  function preloadImages() {
    loadImg('bg', ASSET + 'pond-bg.webp');
    loadImg('body', ASSET + 'zehn-body.png');
    loadImg('rod', ASSET + 'rod-branch.png');
    loadImg('celebrate', ASSET + 'zehn-celebrate.png');
    Object.keys(SPRITE_BY_FISH).forEach(function (id) {
      loadImg('fish_' + id, SPRITE_BY_FISH[id]);
    });
  }
  function makeSilhouette(img) {
    try {
      var c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      var g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = 'rgba(10, 60, 80, 1)';
      g.fillRect(0, 0, c.width, c.height);
      return c;
    } catch (e) { return null; }
  }
  // Bản sao "nhuộm nước" của sprite cá: nướng sẵn sắc xanh vào hình để cá
  // dưới nước vẫn đọc rõ hình mà không bị lớp phủ nước làm chìm hẳn.
  function makeTinted(img) {
    try {
      if (!img || !img.complete || !img.naturalWidth) return null;
      var c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      var g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(14,80,110,0.30)';
      g.fillRect(0, 0, c.width, c.height);
      return c;
    } catch (e) { return null; }
  }
  function buildSilhouettes() {
    if (SILHOUETTES.length) return;
    ['karpfen', 'forelle', 'sardine'].forEach(function (id) {
      var im = IMG['fish_' + id];
      if (im && im.complete && im.naturalWidth) {
        var s = makeSilhouette(im);
        if (s) SILHOUETTES.push(s);
      }
    });
  }

  // Trạng thái cảnh — làm mới mỗi ván, đàn cá nền sống xuyên ván
  var scene = null;
  function newScene() {
    scene = {
      t: 0,
      cam: { x: 500, y: 281, zoom: 1, tx: 500, ty: 281, tzoom: 1, shake: 0 },
      rod: { angle: -33, vel: 0, target: -33, stiff: 60, damp: 11, bend: 0, bendTarget: 0 },
      cat: { lean: 0, leanTarget: 0, celebF: 0, celebTarget: 0 },
      bobber: { mode: 'hidden', x: 550, y: WATER_Y, flyT: 0, fx: 0, fy: 0, tx: 0, jiggleT: 0, sunk: false },
      hero: { active: false, img: null, w: 190, x: 0, y: 0, dir: 1, mode: 'off', ang: 0, dartT: 0, liftT: 0, hangX: 0, hangY: 0, alpha: 1 },
      shoal: [],
      ripples: [],
      parts: [],
      bubbles: [],
      sparkles: [],
      leaves: [
        { x: 220, y: -20, rot: 0, vr: 0.7, vy: 13, sway: 0.9, col: 'rgba(217,119,6,0.8)' },
        { x: 640, y: -140, rot: 1, vr: -0.5, vy: 10, sway: 0.6, col: 'rgba(101,163,13,0.75)' }
      ],
      lineVisible: false,
      tint: 0, tintTarget: 0,
      rippleAt: 0,
      bubbleAt: 0
    };
    for (var i = 0; i < 4; i++) {
      scene.shoal.push({
        img: i % 3, x: Math.random() * 1000, y: 395 + Math.random() * 120,
        dir: Math.random() < 0.5 ? -1 : 1, speed: 14 + Math.random() * 20,
        w: 90 + Math.random() * 90, ph: Math.random() * 6.28
      });
    }
  }

  function rodPivot() {
    // Khớp tay của Zehn trong tọa độ ảo (điểm hai chân trước chụm lại)
    var bobY = Math.sin(scene.t * 1.25) * 2.6;
    return { x: 200, y: 273 + bobY };
  }
  function rodCurve() {
    var p = rodPivot();
    var a = scene.rod.angle * Math.PI / 180;
    var L = 250;
    var tip = { x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L };
    // Độ cong: điểm điều khiển lệch xuống dưới theo độ căng
    var mx = (p.x + tip.x) / 2, my = (p.y + tip.y) / 2;
    var bend = scene.rod.bend;
    var ctrl = { x: mx - Math.sin(a) * -bend * 0.3, y: my + bend };
    // Cần phải nghiêng CÙNG thân mèo (chung một khung khớp nối)
    var lean = scene.cat.lean * Math.PI / 180;
    if (Math.abs(lean) > 0.001) {
      var cx = 210, cy = 388 + Math.sin(scene.t * 1.25) * 2.6;
      var cos = Math.cos(lean), sin = Math.sin(lean);
      var rot = function (pt) {
        var dx = pt.x - cx, dy = pt.y - cy;
        return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
      };
      return { p0: rot(p), p1: rot(ctrl), p2: rot(tip) };
    }
    return { p0: p, p1: ctrl, p2: tip };
  }
  function quadAt(c, t) {
    var u = 1 - t;
    return {
      x: u * u * c.p0.x + 2 * u * t * c.p1.x + t * t * c.p2.x,
      y: u * u * c.p0.y + 2 * u * t * c.p1.y + t * t * c.p2.y
    };
  }
  function rodTip() { return rodCurve().p2; }

  // --- Hạt hiệu ứng ---
  function spawnRipple(x, big) {
    if (!scene) return;
    scene.ripples.push({ x: x, r: big ? 10 : 6, max: big ? 62 : 38, a: 0.85, big: !!big });
    if (scene.ripples.length > 26) scene.ripples.shift();
  }
  function spawnSplash(x, n, big) {
    if (!scene) return;
    for (var i = 0; i < (n || 6); i++) {
      scene.parts.push({
        x: x + (Math.random() * 2 - 1) * 10, y: WATER_Y + 2,
        vx: (Math.random() * 2 - 1) * (big ? 130 : 80),
        vy: -(90 + Math.random() * (big ? 190 : 120)),
        r: big ? 2.6 + Math.random() * 2.4 : 1.8 + Math.random() * 1.8,
        life: 0, ttl: 0.55 + Math.random() * 0.3
      });
    }
    if (scene.parts.length > 240) scene.parts.splice(0, scene.parts.length - 240);
  }
  function spawnDroplets(x, y, n) {
    if (!scene) return;
    for (var i = 0; i < (n || 3); i++) {
      scene.parts.push({
        x: x + (Math.random() * 2 - 1) * 26, y: y + Math.random() * 8,
        vx: (Math.random() * 2 - 1) * 22, vy: 20 + Math.random() * 40,
        r: 1.6 + Math.random() * 1.6, life: 0, ttl: 0.7
      });
    }
  }
  function spawnBubble(x, y) {
    if (!scene) return;
    scene.bubbles.push({ x: x, y: y, r: 1.6 + Math.random() * 2.6, vy: -(16 + Math.random() * 22), ph: Math.random() * 6.28 });
    if (scene.bubbles.length > 60) scene.bubbles.shift();
  }
  function spawnSparkles(x, y) {
    if (!scene) return;
    for (var i = 0; i < 14; i++) {
      scene.sparkles.push({
        x: x + (Math.random() * 2 - 1) * 120, y: y + (Math.random() * 2 - 1) * 70,
        r: 2 + Math.random() * 3.4, life: 0, ttl: 0.7 + Math.random() * 0.5,
        ph: Math.random() * 6.28
      });
    }
  }

  // --- Cập nhật cảnh theo thời gian thực ---
  function updateScene(dt) {
    var sc = scene;
    sc.t += dt;
    // Máy quay: nội suy mềm về đích + rung giảm dần
    var cam = sc.cam;
    var ck = Math.min(1, dt * 3.2);
    cam.x += (cam.tx - cam.x) * ck;
    cam.y += (cam.ty - cam.y) * ck;
    cam.zoom += (cam.tzoom - cam.zoom) * Math.min(1, dt * 2.6);
    // Kẹp tâm máy để khung hình không bao giờ trượt ra ngoài tranh
    var hzx = (VW / 2) / cam.zoom, hzy = (VH / 2) / cam.zoom;
    cam.x = Math.max(hzx, Math.min(VW - hzx, cam.x));
    cam.y = Math.max(hzy, Math.min(VH - hzy, cam.y));
    cam.shake *= Math.exp(-dt * 7);
    if (cam.shake < 0.05) cam.shake = 0;
    // Sắc nước theo vùng
    sc.tint += (sc.tintTarget - sc.tint) * Math.min(1, dt * 2);
    // Cần câu: lò xo vật lý hướng về góc đích + độ cong theo đích
    var r = sc.rod;
    var acc = (r.target - r.angle) * r.stiff - r.vel * r.damp;
    r.vel += acc * dt;
    r.angle += r.vel * dt;
    r.bend += (r.bendTarget - r.bend) * Math.min(1, dt * 7);
    // Thân mèo: nghiêng mềm + độ ăn mừng
    sc.cat.lean += (sc.cat.leanTarget - sc.cat.lean) * Math.min(1, dt * 5);
    sc.cat.celebF += (sc.cat.celebTarget - sc.cat.celebF) * Math.min(1, dt * 4.5);

    // Phao: bay theo cung khi thả, nổi/trồi khi chờ
    var b = sc.bobber;
    if (b.mode === 'fly') {
      b.flyT += dt / 0.62;
      var ft = Math.min(1, b.flyT);
      var e = ft;
      b.x = b.fx + (b.tx - b.fx) * e;
      b.y = b.fy + (WATER_Y - b.fy) * e - Math.sin(e * Math.PI) * 105;
      if (ft >= 1) { b.mode = 'float'; b.x = b.tx; b.y = WATER_Y; landBobber(); }
    } else if (b.mode === 'float') {
      b.y = WATER_Y + Math.sin(sc.t * 2.2) * 1.8 + (b.sunk ? 9 : 0);
      if (b.jiggleT > 0) { b.jiggleT -= dt; b.x = b.tx + Math.sin(sc.t * 42) * 2.4; }
      else b.x = b.tx;
      if (sc.t - sc.rippleAt > 1.5 && state && (state.phase === 'wait' || state.phase === 'bite')) {
        sc.rippleAt = sc.t;
        spawnRipple(b.tx, false);
      }
    }

    // Đàn cá nền: bơi thong thả khắp ao
    buildSilhouettes();
    sc.shoal.forEach(function (f) {
      f.x += f.dir * f.speed * dt;
      f.y += Math.sin(sc.t * 0.9 + f.ph) * 6 * dt;
      if (f.x < -120) { f.x = 1120; f.y = 395 + Math.random() * 120; }
      if (f.x > 1120) { f.x = -120; f.y = 395 + Math.random() * 120; }
    });

    // Cá chính: hành vi theo chế độ
    var h = sc.hero;
    if (h.active) {
      if (h.mode === 'circle') {
        h.ang += dt * 0.75;
        var cx = b.tx, cy = WATER_Y + 80;
        var hx = cx + Math.cos(h.ang) * 88;
        var hy = cy + Math.sin(h.ang) * 24;
        h.dir = Math.cos(h.ang) >= 0 ? 1 : -1;
        h.x += (hx - h.x) * Math.min(1, dt * 3);
        h.y += (hy - h.y) * Math.min(1, dt * 3);
      } else if (h.mode === 'dart') {
        h.dartT -= dt;
        var ddx = b.tx - h.x, ddy = (WATER_Y + 26) - h.y;
        h.dir = ddx >= 0 ? 1 : -1;
        h.x += ddx * Math.min(1, dt * 9);
        h.y += ddy * Math.min(1, dt * 9);
        if (h.dartT <= 0) h.mode = 'circle';
      } else if (h.mode === 'lunge') {
        var lx = b.tx - h.x, ly = (WATER_Y + 30) - h.y;
        h.dir = lx >= 0 ? 1 : -1;
        h.x += lx * Math.min(1, dt * 12);
        h.y += ly * Math.min(1, dt * 12);
      } else if (h.mode === 'fight' && state && state.fight) {
        var s = state.fight;
        var prog = s.progress / 100;
        var tx = b.tx + (400 - b.tx) * prog;
        var ty = (415 - 55 * prog);
        if (s.phase === 'run') { tx += 95; ty += 26; }
        var kk = s.phase === 'run' ? dt * 5.5 : dt * 2.6;
        h.x += (tx - h.x) * Math.min(1, kk);
        h.y += (ty - h.y) * Math.min(1, kk);
        h.dir = s.phase === 'run' ? 1 : -1;
        if (s.phase === 'telegraph') { h.x += Math.sin(sc.t * 55) * 1.6; }
        // Bong bóng khi vùng chạy hoặc trồi mặt nước
        if ((s.phase === 'run' || prog >= 0.85) && sc.t - sc.bubbleAt > 0.16) {
          sc.bubbleAt = sc.t;
          spawnBubble(h.x + h.dir * h.w * 0.32, h.y - 6);
          if (prog >= 0.85) spawnSplash(h.x, 2, false);
        }
      } else if (h.mode === 'lift') {
        h.liftT += dt;
        var tip = rodTip();
        var targetX = tip.x - 4, targetY = tip.y + 96;
        var lk = Math.min(1, dt * 4.2);
        h.x += (targetX - h.x) * lk;
        h.y += (targetY - h.y) * lk;
        if (Math.random() < dt * 7) spawnDroplets(h.x, h.y + 14, 1);
      } else if (h.mode === 'escape') {
        h.x += h.dir * 340 * dt;
        h.y += 40 * dt;
        h.alpha -= dt * 1.4;
        if (h.alpha <= 0) { h.active = false; h.alpha = 1; }
      }
    }

    // Hạt nước / gợn / bong bóng / lấp lánh / lá trôi
    var i;
    for (i = sc.parts.length - 1; i >= 0; i--) {
      var p = sc.parts[i];
      p.life += dt;
      p.vy += 950 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life >= p.ttl || p.y > VH + 10) sc.parts.splice(i, 1);
    }
    for (i = sc.ripples.length - 1; i >= 0; i--) {
      var rp = sc.ripples[i];
      rp.r += dt * (rp.big ? 46 : 30);
      rp.a = 0.85 * Math.max(0, 1 - rp.r / rp.max);
      if (rp.r >= rp.max) sc.ripples.splice(i, 1);
    }
    for (i = sc.bubbles.length - 1; i >= 0; i--) {
      var bb = sc.bubbles[i];
      bb.y += bb.vy * dt;
      bb.x += Math.sin(sc.t * 6 + bb.ph) * 8 * dt;
      if (bb.y < WATER_Y + 6) sc.bubbles.splice(i, 1);
    }
    for (i = sc.sparkles.length - 1; i >= 0; i--) {
      var sp = sc.sparkles[i];
      sp.life += dt;
      if (sp.life >= sp.ttl) sc.sparkles.splice(i, 1);
    }
    sc.leaves.forEach(function (lf) {
      lf.y += lf.vy * dt;
      lf.x += Math.sin(sc.t * lf.sway + lf.rot) * 9 * dt;
      lf.rot += lf.vr * dt;
      if (lf.y > VH + 24) { lf.y = -24; lf.x = 120 + Math.random() * 700; }
    });
  }

  // --- Vẽ ---
  function drawFishImg(g, img, x, y, w, dir, rot, alpha) {
    if (!img) return;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var hh = w * ih / iw;
    g.save();
    g.translate(x, y);
    g.rotate(rot || 0);
    g.scale(dir >= 0 ? 1 : -1, 1);
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.drawImage(img, -w / 2, -hh / 2, w, hh);
    g.restore();
  }

  function drawScene() {
    var g = cv.ctx;
    if (!g || !scene) return;
    var sc = scene;
    var sx = cv.w / VW, sy = cv.h / VH;
    g.setTransform(cv.dpr, 0, 0, cv.dpr, 0, 0);
    g.clearRect(0, 0, cv.w, cv.h);
    // Máy quay (tọa độ ảo)
    var cam = sc.cam;
    var shX = cam.shake ? (Math.random() * 2 - 1) * cam.shake : 0;
    var shY = cam.shake ? (Math.random() * 2 - 1) * cam.shake * 0.7 : 0;
    g.translate(cv.w / 2, cv.h / 2);
    g.scale(cam.zoom, cam.zoom);
    g.translate(-cam.x * sx + shX, -cam.y * sy + shY);
    g.scale(sx, sy);

    // 1) Nền ao
    var bg = IMG.bg;
    if (bg && bg.complete && bg.naturalWidth) g.drawImage(bg, 0, 0, VW, VH);
    else { g.fillStyle = '#7ec8d8'; g.fillRect(0, 0, VW, VH); }

    // 2) Đàn cá nền + cá chính khi còn dưới nước
    sc.shoal.forEach(function (f) {
      var sil = SILHOUETTES[f.img % Math.max(1, SILHOUETTES.length)];
      if (sil) {
        g.save();
        g.globalAlpha = 0.16;
        drawFishImg(g, sil, f.x, f.y, f.w, f.dir, Math.sin(sc.t + f.ph) * 0.04, 0.16);
        g.restore();
      }
    });
    var h = sc.hero;
    var heroUnder = h.active && (h.mode === 'circle' || h.mode === 'dart' || h.mode === 'lunge' ||
      (h.mode === 'fight' && state && state.fight && state.fight.progress < 85) || h.mode === 'escape');

    // 3) Lớp nước phủ (làm cá dưới nước chìm đúng nghĩa) + sắc vùng + vệt sáng
    var grad = g.createLinearGradient(0, WATER_Y, 0, VH);
    grad.addColorStop(0, 'rgba(10,90,120,0.10)');
    grad.addColorStop(1, 'rgba(6,50,90,0.30)');
    g.fillStyle = grad;
    g.fillRect(0, WATER_Y, VW, VH - WATER_Y);
    if (sc.tint > 0.01) {
      g.fillStyle = 'rgba(2,32,71,' + sc.tint.toFixed(3) + ')';
      g.fillRect(0, WATER_Y, VW, VH - WATER_Y);
    }
    g.save();
    g.beginPath(); g.rect(0, WATER_Y, VW, VH - WATER_Y); g.clip();
    g.globalAlpha = 0.10;
    g.fillStyle = '#ffffff';
    for (var bi = 0; bi < 2; bi++) {
      var bx = ((sc.t * (9 + bi * 5) + bi * 420) % 1300) - 300;
      g.save();
      g.translate(bx, WATER_Y + 40 + bi * 70);
      g.transform(1, 0, -0.6, 1, 0, 0);
      g.fillRect(0, 0, 130, 150);
      g.restore();
    }
    g.restore();
    // Mặt nước: đường sáng mảnh
    g.fillStyle = 'rgba(255,255,255,0.20)';
    g.fillRect(0, WATER_Y - 1, VW, 2);

    // 3b) Cá chính dưới nước: vẽ SAU lớp phủ bằng bản nhuộm nước + viền sáng
    if (heroUnder) {
      if (!h.tint) h.tint = makeTinted(h.img);
      g.save();
      g.shadowColor = 'rgba(190,240,255,0.6)';
      g.shadowBlur = 14;
      drawFishImg(g, h.tint || h.img, h.x, h.y, h.w, h.dir, Math.sin(sc.t * 3.1) * 0.05, 0.97 * h.alpha);
      g.restore();
    }

    // 4) Gợn sóng tại mặt nước
    sc.ripples.forEach(function (rp) {
      g.save();
      g.strokeStyle = 'rgba(255,255,255,' + (rp.a * 0.8).toFixed(3) + ')';
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(rp.x, WATER_Y + 5, rp.r, rp.r * 0.34, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    });

    // 5) Cá chính khi trồi lên / được nhấc lên
    if (h.active && !heroUnder) {
      var rot = 0;
      if (h.mode === 'lift') rot = Math.sin(Math.max(0, sc.t - 0) * 5.0) * 0.10 * Math.exp(-h.liftT * 0.9);
      if (h.mode === 'fight') rot = Math.sin(sc.t * 16) * 0.09; // giãy trên mặt nước
      drawFishImg(g, h.img, h.x, h.y, h.w, h.dir, rot, h.alpha);
    }

    // 6) Zehn khớp nối: thân (thở + nhấp nhô + nghiêng) và cần (lò xo + cong)
    var bobY = Math.sin(sc.t * 1.25) * 2.6;
    var rigAlpha = 1 - sc.cat.celebF * 0.9;
    g.save();
    g.globalAlpha = rigAlpha;
    g.translate(210, 388 + bobY);
    g.rotate(sc.cat.lean * Math.PI / 180);
    g.translate(-210, -(388 + bobY));
    var body = IMG.body;
    if (body && body.complete && body.naturalWidth) {
      var bw = 340, bh = bw * body.naturalHeight / body.naturalWidth;
      var breathe = 1 + Math.sin(sc.t * 1.9) * 0.006;
      g.save();
      g.translate(210, 388 + bobY);
      g.scale(1, breathe);
      g.translate(-210, -(388 + bobY));
      g.drawImage(body, 40, 388 + bobY - bh, bw, bh);
      g.restore();
    }
    // Cần câu vẽ theo lát dọc đường cong — cong thật theo độ căng
    var rod = IMG.rod;
    var curve = rodCurve();
    if (rod && rod.complete && rod.naturalWidth) {
      var SEG = 9, rodLen = 250;
      var sw = rod.naturalWidth / SEG;
      for (var si = 0; si < SEG; si++) {
        var t0 = si / SEG, t1 = (si + 1) / SEG;
        var pa = quadAt(curve, t0), pb = quadAt(curve, t1);
        var segLen = Math.hypot(pb.x - pa.x, pb.y - pa.y) + 2.5;
        var ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
        g.save();
        g.translate(pa.x, pa.y + bobY * 0); // pivot đã gồm bobY trong rodPivot
        g.rotate(ang);
        g.drawImage(rod, si * sw, 0, sw, rod.naturalHeight, 0, -rodLen * 0.06, segLen, rodLen * 0.12);
        g.restore();
      }
    }
    g.restore();

    // Ăn mừng: phủ hình ăn mừng trọn thân, mờ dần đè lên khớp nối ở cuối ván thắng
    if (sc.cat.celebF > 0.02) {
      var cel = IMG.celebrate;
      if (cel && cel.complete && cel.naturalWidth) {
        var cw = 340, chh = cw * cel.naturalHeight / cel.naturalWidth;
        var bounce = Math.abs(Math.sin(sc.t * 7)) * -5 * sc.cat.celebF;
        g.save();
        g.globalAlpha = sc.cat.celebF;
        g.drawImage(cel, 40, 393 - chh + bounce, cw, chh);
        g.restore();
      }
    }

    // 7) Dây câu: từ đầu cần tới phao / miệng cá
    if (sc.lineVisible) {
      var tip = rodTip();
      var end = null;
      if (h.active && (state && (state.phase === 'fight' || state.phase === 'won'))) {
        end = { x: h.x - h.dir * h.w * 0.30, y: h.y - 4 };
      } else if (sc.bobber.mode !== 'hidden') {
        end = { x: sc.bobber.x, y: sc.bobber.y };
      }
      if (end) {
        var sag = 30, col = 'rgba(255,255,255,0.88)';
        if (state && state.phase === 'bite') sag = 6;
        if (state && state.phase === 'fight' && state.fight) {
          var tt = state.fight.tension;
          sag = 34 * (1 - tt / 100) + 3;
          col = tt >= 95 ? '#ef4444' : (tt >= 75 ? '#fbbf24' : 'rgba(255,255,255,0.92)');
        }
        if (state && state.phase === 'won') sag = 4;
        g.save();
        g.strokeStyle = col;
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(tip.x, tip.y);
        g.quadraticCurveTo((tip.x + end.x) / 2, Math.max(tip.y, end.y) + sag, end.x, end.y);
        g.stroke();
        g.restore();
      }
    }

    // 8) Phao
    var b = sc.bobber;
    if (b.mode !== 'hidden') {
      g.save();
      g.translate(b.x, b.y);
      if (b.sunk) g.rotate(0.35);
      g.fillStyle = '#ef4444';
      g.beginPath(); g.arc(0, 0, 9, Math.PI, 0); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(0, 0, 9, 0, Math.PI); g.fill();
      g.fillStyle = '#fbbf24';
      g.fillRect(-1.6, -14, 3.2, 6);
      g.restore();
    }

    // 9) Hạt nước + bong bóng + lấp lánh
    sc.parts.forEach(function (p) {
      g.save();
      g.globalAlpha = Math.max(0, 1 - p.life / p.ttl) * 0.95;
      g.fillStyle = '#e8f6ff';
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    sc.bubbles.forEach(function (bb) {
      g.save();
      g.strokeStyle = 'rgba(230,248,255,0.75)';
      g.lineWidth = 1.2;
      g.beginPath(); g.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); g.stroke();
      g.restore();
    });
    sc.sparkles.forEach(function (sp) {
      var a = Math.sin((sp.life / sp.ttl) * Math.PI);
      g.save();
      g.globalAlpha = a;
      g.fillStyle = '#fde68a';
      g.translate(sp.x, sp.y);
      g.rotate(sp.ph + sc.t * 2);
      g.fillRect(-sp.r, -1, sp.r * 2, 2);
      g.fillRect(-1, -sp.r, 2, sp.r * 2);
      g.restore();
    });

    // 10) Lá trôi + chuồn chuồn (vẽ vector)
    sc.leaves.forEach(function (lf) {
      g.save();
      g.translate(lf.x, lf.y);
      g.rotate(lf.rot);
      g.fillStyle = lf.col;
      g.beginPath(); g.ellipse(0, 0, 8, 4.5, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    var dt2 = sc.t * 26;
    var dx2 = (dt2 % 1150) - 80;
    var dy2 = 120 + Math.sin(sc.t * 0.7) * 15 + Math.sin(sc.t * 3.3) * 4;
    g.save();
    g.translate(dx2, dy2);
    g.fillStyle = 'rgba(8,145,178,0.9)';
    g.beginPath(); g.ellipse(0, 0, 11, 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    var flap = Math.sin(sc.t * 40) * 0.25;
    g.save(); g.rotate(-0.5 - flap); g.beginPath(); g.ellipse(-4, -5, 7, 3, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.rotate(0.5 + flap); g.beginPath(); g.ellipse(4, -5, 7, 3, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.restore();
  }

  function sizeCanvas() {
    if (!cv.canvas || !els) return;
    var r = els.layer.getBoundingClientRect();
    var w = Math.max(50, Math.round(r.width));
    var h = Math.max(50, Math.round(r.height));
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w !== cv.w || h !== cv.h || dpr !== cv.dpr) {
      cv.w = w; cv.h = h; cv.dpr = dpr;
      cv.canvas.width = Math.round(w * dpr);
      cv.canvas.height = Math.round(h * dpr);
    }
  }

  function startRenderLoop() {
    if (cv.running && sceneRaf) return;
    cv.running = true;
    cv.last = performance.now();
    var loop = function (now) {
      if (!cv.running) return;
      sceneRaf = requestAnimationFrame(loop);
      if (!state || !els || els.layer.classList.contains('hidden')) return;
      var dt = Math.min(0.05, (now - cv.last) / 1000); cv.last = now;
      sizeCanvas();
      updateScene(dt);
      drawScene();
    };
    sceneRaf = requestAnimationFrame(loop);
  }
  function stopRenderLoop() {
    cv.running = false;
    if (sceneRaf) { cancelAnimationFrame(sceneRaf); sceneRaf = null; }
  }

  // --- Dựng DOM (một lần): canvas cảnh + các lớp phủ chữ/nút giữ DOM ---
  function buildDom() {
    var wrapper = document.querySelector('#rewardPrototypeModal .reward-stage-wrapper');
    if (!wrapper || document.getElementById('fishingGameLayer')) return;

    var layer = document.createElement('div');
    layer.id = 'fishingGameLayer';
    layer.className = 'fishing-game-layer hidden';
    layer.innerHTML =
      '<canvas class="fg-canvas" id="fgCanvas"></canvas>' +
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
    // TẠM DỪNG GAME (chị quyết 2026-10-25): ẩn nút mở game, hộp thoại thưởng
    // chạy luồng video cổ điển. Code/art/dữ liệu giữ nguyên chờ bản V2.
    var GAME_PAUSED = true;
    if (headerBtns && !GAME_PAUSED) {
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
      canvas: layer.querySelector('#fgCanvas'),
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
    cv.canvas = els.canvas;
    cv.ctx = els.canvas.getContext('2d');

    if (startBtn) startBtn.addEventListener('click', startGame);
    els.skip.addEventListener('click', exitToClassic);
    els.action.addEventListener('pointerdown', function (e) { e.preventDefault(); onPress(); });
    window.addEventListener('pointerup', onRelease);
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
    if (!scene) newScene();
    startRenderLoop();
    newRound(false);
  }

  function newRound(isBonus) {
    clearTimers();
    startRenderLoop(); // clearTimers ngắt vòng lặp vẽ — nối lại ngay
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
      lastClickAt: 0,
      slowUntil: 0
    };
    // Đặt lại cảnh
    scene.rod.target = -33; scene.rod.stiff = 60; scene.rod.damp = 11; scene.rod.bendTarget = 0;
    scene.cat.leanTarget = 0; scene.cat.celebTarget = 0; scene.cat.celebF = 0;
    scene.bobber.mode = 'hidden'; scene.bobber.sunk = false;
    scene.hero.active = false; scene.hero.mode = 'off'; scene.hero.alpha = 1;
    scene.lineVisible = false;
    scene.tintTarget = 0;
    scene.cam.tx = 500; scene.cam.ty = 281; scene.cam.tzoom = 1;
    scene.parts.length = 0; scene.bubbles.length = 0; scene.ripples.length = 0;
    els.bang.classList.add('hidden');
    els.gauge.classList.add('hidden');
    els.meters.classList.add('hidden');
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
    stopRenderLoop();
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

  // Pha 1: thanh lực quét, bấm để chốt vùng rơi
  function startCast() {
    state.phase = 'cast';
    // Zehn vung cần ra sau lấy đà trong lúc người chơi canh lực
    scene.rod.target = -74; scene.rod.stiff = 55; scene.rod.damp = 10;
    scene.cat.leanTarget = -4;
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
    var xPct = state.zone === 'near' ? 38 : (state.zone === 'mid' ? 55 : 72);
    state.bobberXPct = xPct;
    scene.tintTarget = state.zone === 'deep' ? 0.20 : (state.zone === 'mid' ? 0.09 : 0);
    state.phase = 'casting';
    setAction('Đang thả câu…', false);
    els.sub.textContent = '';
    // Quăng cần: lò xo cứng, vung về trước rồi dừng ở góc hướng lên
    scene.rod.target = -14; scene.rod.stiff = 150; scene.rod.damp = 13;
    scene.cat.leanTarget = 3;
    later(function () {
      if (!state || state.phase !== 'casting') return;
      noiseBurst(0.25, 900, 1900, 0.045, 'bandpass');
      var tip = rodTip();
      var b = scene.bobber;
      b.mode = 'fly'; b.flyT = 0;
      b.fx = tip.x; b.fy = tip.y;
      b.tx = xPct * 10; b.x = tip.x; b.y = tip.y;
      b.sunk = false;
      scene.lineVisible = true;
    }, 240);
  }

  // Engine gọi khi mồi chạm nước
  function landBobber() {
    if (!state || state.phase !== 'casting') return;
    sndSplash(false);
    spawnSplash(state.bobberXPct * 10, 6, false);
    spawnRipple(state.bobberXPct * 10, true);
    scene.rod.target = -33; scene.rod.stiff = 60; scene.rod.damp = 11;
    scene.cat.leanTarget = 0;
    startWait(false);
  }

  // Pha 2: chờ cắn — con cá sắp cắn bơi lượn quanh phao, rỉa mồi rồi mới cắn
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
    els.sub.textContent = 'Cá đang lượn quanh phao — nó rỉa mồi thì đừng giật vội. Phao chìm hẳn mới là cá cắn!';
    // Cá chính xuất hiện dưới nước, bơi vòng quanh phao
    var fish = state.fish;
    var h = scene.hero;
    h.active = true;
    h.tint = null;
    h.img = IMG['fish_' + fish.id] || IMG.fish_karpfen;
    h.w = fish.rarity === 'legendary' ? 270 : (fish.rarity === 'rare' ? 230 : 190);
    h.x = state.bobberXPct * 10 + 190;
    h.y = 448;
    h.dir = -1;
    h.mode = 'circle';
    h.ang = Math.random() * 6.28;
    h.alpha = 1;
    scene.cam.tx = 500; scene.cam.ty = 281; scene.cam.tzoom = 1.02;
    pollWait();
  }

  function pollWait() {
    if (!state || state.phase !== 'wait') return;
    var now = performance.now();
    if (state.nibblesLeft > 0 && now >= state.nextNibbleAt && now < state.biteAt - 600) {
      state.nibblesLeft--;
      state.nextNibbleAt = now + 900 + Math.random() * 1400;
      // Cá lao vào rỉa mồi: phao rung, gợn nhỏ, tiếng "tõm" khẽ
      scene.hero.mode = 'dart';
      scene.hero.dartT = 0.55;
      scene.bobber.jiggleT = 0.35;
      spawnRipple(state.bobberXPct * 10, false);
      sndNibble();
    }
    if (now >= state.biteAt) { biteNow(); return; }
    later(pollWait, 90);
  }

  function biteNow() {
    state.phase = 'bite';
    scene.hero.mode = 'lunge';
    scene.bobber.sunk = true;
    els.bang.classList.remove('hidden');
    els.bang.style.left = state.bobberXPct + '%';
    spawnSplash(state.bobberXPct * 10, 5, false);
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
      // Móc dính: Zehn giựt cần lên thật mạnh (lò xo cứng), máy rung nhẹ
      els.bang.classList.add('hidden');
      scene.bobber.sunk = false;
      scene.bobber.mode = 'hidden';
      scene.cam.shake = 7;
      spawnSplash(state.bobberXPct * 10, 8, true);
      sndSplash(true);
      state.slowUntil = performance.now() + 380;
      scene.rod.target = -88; scene.rod.stiff = 175; scene.rod.damp = 14;
      scene.cat.leanTarget = -5;
      later(function () {
        if (state && state.phase === 'fight') {
          scene.rod.stiff = 70; scene.rod.damp = 11;
        }
      }, 500);
      say('Er beißt an!', 'Cá dính rồi — giữ nút để kéo!');
      startFight();
      return;
    }
    if (state.phase === 'wait' || (state.phase === 'bite' && expired)) {
      // Giật sớm vào cá rỉa, hoặc chậm tay: cá nhả và bơi đi, ném lại cùng lượt
      els.bang.classList.add('hidden');
      scene.bobber.sunk = false;
      if (state.phase === 'wait') { say('Zu früh!', 'Sớm quá — đó mới là cá rỉa mồi.'); }
      else { say('Knapp daneben!', 'Suýt nữa! Cá nhả mồi rồi.'); }
      sndNibble();
      scene.hero.mode = 'escape';
      scene.hero.dir = scene.hero.x >= state.bobberXPct * 10 ? 1 : -1;
      state.phase = 'missed';
      setAction('Câu lại', false);
      later(function () {
        if (!state) return;
        setAction('Chờ cá cắn…', false);
        startWait(true);
      }, 1100);
    }
  }

  // Pha 3: kéo cá — lõi tính căng/tiến độ, cảnh đọc theo từng khung hình
  function startFight() {
    state.phase = 'fight';
    state.holding = false;
    state.fight = FishingCore.createFight(state.fish, Math.random);
    scene.hero.mode = 'fight';
    els.meters.classList.remove('hidden');
    setAction('GIỮ ĐỂ KÉO 🎣', true);
    els.sub.textContent = 'Giữ nút để kéo. Cá vùng chạy (bong bóng nổi) thì NHẢ nút kẻo đứt dây!';
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
      // Nối lõi vào cảnh: cần cong theo căng, thân nghiêng theo sức kéo, máy lia theo cá
      scene.rod.bendTarget = s.tension * 0.5;
      scene.rod.target = -24 - s.tension * 0.13;
      scene.cat.leanTarget = state.holding ? -2.5 - s.tension * 0.045 : 1.5;
      scene.cam.tx = 470;
      scene.cam.tzoom = 1.07;
      // Vẽ lại thanh đo
      els.progressFill.style.width = s.progress + '%';
      els.tensionFill.style.width = s.tension + '%';
      els.tensionFill.className = 'fg-meter-fill' +
        (s.tension >= 95 ? ' fg-t-danger' : (s.tension >= 75 ? ' fg-t-warn' : ''));
      els.tensionWarn.style.visibility = s.tension >= 75 ? 'visible' : 'hidden';
      if (s.surged && !wasSurged) { say('Halt durch!', 'Cá bùng lên — nhả tay ngay!'); speakDe('Halt durch!'); }
      if (s.over) { finishFight(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function finishFight() {
    var s = state.fight;
    els.meters.classList.add('hidden');
    scene.rod.bendTarget = 0;
    if (s.won) { winRound(); return; }
    // Đứt dây: cần văng về trước, cá lao đi, an ủi + lượt phụ (D2)
    sndSnap();
    scene.lineVisible = false;
    scene.rod.target = 38; scene.rod.stiff = 120; scene.rod.damp = 9;
    scene.cat.leanTarget = 3;
    scene.hero.mode = 'escape';
    scene.hero.dir = 1;
    scene.bobber.mode = 'hidden';
    scene.cam.tx = 500; scene.cam.ty = 281; scene.cam.tzoom = 1;
    spawnSplash(state.bobberXPct * 10, 4, false);
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

  // Pha 4: lên cá — Zehn nhấc cần, cá rời nước treo ở đầu dây rồi mới vào thẻ
  function winRound() {
    var fish = state.fish;
    state.phase = 'won';
    scene.bobber.mode = 'hidden';
    spawnSplash(scene.hero.x, 10, true);
    sndSplash(true);
    sndWin();
    scene.rod.target = -52; scene.rod.stiff = 85; scene.rod.damp = 11;
    scene.cat.leanTarget = -3;
    scene.hero.mode = 'lift';
    scene.hero.liftT = 0;
    scene.cam.tx = 330; scene.cam.ty = 275; scene.cam.tzoom = 1.13;
    later(function () {
      if (state && state.phase === 'won') {
        scene.cat.celebTarget = 1;
        spawnSparkles(215, 235);
      }
    }, 980);
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
  function init() { buildDom(); preloadImages(); }
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
      core: FishingCore,
      getScene: function () {
        return {
          phase: state ? state.phase : null,
          bobberMode: scene ? scene.bobber.mode : null,
          heroActive: !!(scene && scene.hero.active),
          heroMode: scene ? scene.hero.mode : null,
          heroX: scene ? Math.round(scene.hero.x) : 0,
          heroY: scene ? Math.round(scene.hero.y) : 0,
          heroW: scene ? scene.hero.w : 0,
          fishId: state && state.fish ? state.fish.id : null,
          rodBend: scene ? Math.round(scene.rod.bend) : 0,
          rodAngle: scene ? Math.round(scene.rod.angle) : 0,
          camZoom: scene ? +scene.cam.zoom.toFixed(2) : 0,
          canvasOk: !!(cv.ctx && IMG.bg)
        };
      }
    }
  };
})();
