// ==============================================================================
// Zehn câu cá V2 — bản chơi thử, mô hình theo Cat Goes Fishing:
// thả mồi -> lái mồi trong nước -> cá rượt đớp (chuỗi mồi: cá nhỏ làm mồi câu
// cá lớn) -> kéo cá (cá phóng theo bản năng, cá lớn hơn rình ăn cá đã móc)
// -> vào giỏ -> SẠP CÁ bán lấy xu (khách nói tiếng Đức + đơn hôm nay)
// -> cửa hàng nâng cấp cần/giỏ -> câu cá to hơn.
// ==============================================================================
(function () {
  'use strict';

  var ASSET = 'assets/fishing-game/';
  var VW = 1000, VH = 562, WATER_Y = 352;
  var LS_KEY = 'vokabelgo_fishing_v2_demo';

  // Loài: cls = cấp trong chuỗi thức ăn (cá cấp n ăn mồi cấp n-1)
  var SPECIES = {
    sardine:           { de: 'die Sardine', vi: 'cá mòi', cls: 1, rarity: 'common', len: [8, 14], base: 8 },
    barsch:            { de: 'der Barsch', vi: 'cá rô', cls: 1, rarity: 'common', len: [15, 30], base: 12 },
    forelle:           { de: 'die Forelle', vi: 'cá hồi chấm', cls: 1, rarity: 'common', len: [25, 40], base: 14 },
    goldfisch:         { de: 'der Goldfisch', vi: 'cá vàng', cls: 1, rarity: 'rare', len: [10, 20], base: 22 },
    karpfen:           { de: 'der Karpfen', vi: 'cá chép', cls: 2, rarity: 'common', len: [35, 60], base: 20 },
    regenbogenforelle: { de: 'die Regenbogenforelle', vi: 'cá hồi cầu vồng', cls: 2, rarity: 'rare', len: [30, 50], base: 34 },
    lachs:             { de: 'der Lachs', vi: 'cá hồi', cls: 3, rarity: 'rare', len: [60, 90], base: 48 },
    b2_meisterfisch:   { de: 'der Meisterfisch', vi: 'cá bậc thầy B2', cls: 3, rarity: 'legendary', len: [50, 80], base: 85 },
    riesenwels:        { de: 'der Riesenwels', vi: 'cá nheo khổng lồ', cls: 4, rarity: 'legendary', len: [95, 145], base: 120 }
  };
  var FISH_W = { 1: 120, 2: 175, 3: 235, 4: 300 };        // bề rộng vẽ theo cấp
  var DEPTH_BAND = { 1: [385, 455], 2: [420, 500], 3: [465, 535], 4: [495, 545] };
  var NUM_DE = ['null', 'einen', 'zwei', 'drei', 'vier', 'fünf'];

  // --- Trạng thái bền (ví/giỏ/đồ nghề/sổ cá) ---
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function newOrder() {
    var ids = Object.keys(SPECIES);
    var id = ids[Math.floor(Math.random() * ids.length)];
    return { fishId: id, count: 2, date: todayKey(), done: 0 };
  }
  function loadSave() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s.coins === 'number') {
          if (!s.order || s.order.date !== todayKey()) s.order = newOrder();
          return s;
        }
      }
    } catch (e) {}
    return { coins: 30, basket: [], rodLvl: 1, basketLvl: 1, catalog: {}, order: newOrder() };
  }
  var save = loadSave();
  function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(save)); } catch (e) {} }
  function basketCap() { return save.basketLvl >= 2 ? 10 : 5; }
  function priceOf(entry) {
    var sp = SPECIES[entry.fishId];
    var f = 0.6 + (entry.len - sp.len[0]) / Math.max(1, sp.len[1] - sp.len[0]) * 0.8;
    var v = Math.round(sp.base * f * Math.pow(0.65, entry.bites || 0));
    if (save.order && save.order.fishId === entry.fishId && save.order.done < save.order.count) v = Math.round(v * 1.5);
    return Math.max(2, v);
  }

  // --- Âm thanh gọn (WebAudio) ---
  var actx = null, noiseBuf = null;
  function ac() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function beep(fr, dur, type, vol, delay) {
    try {
      var c = ac(), t = c.currentTime + (delay || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(fr, t);
      g.gain.setValueAtTime(vol || 0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  function noise(dur, f0, f1, vol, type) {
    try {
      var c = ac(), t = c.currentTime;
      if (!noiseBuf) {
        noiseBuf = c.createBuffer(1, c.sampleRate * 1.2, c.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      var src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      var f = c.createBiquadFilter(); f.type = type || 'lowpass';
      f.frequency.setValueAtTime(f0, t);
      f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      var g = c.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(t); src.stop(t + dur + 0.05);
    } catch (e) {}
  }
  function sndSplash(big) { noise(big ? 0.5 : 0.3, 1400, 300, big ? 0.17 : 0.1); beep(240, 0.22, 'sine', 0.05); }
  function sndBite() { noise(0.16, 2600, 700, 0.12, 'bandpass'); beep(180, 0.16, 'square', 0.08); beep(520, 0.1, 'square', 0.06, 0.05); }

  // --- Canvas & ảnh ---
  var canvas = document.getElementById('v2Canvas');
  var ctx = canvas.getContext('2d');
  var IMG = {};
  function loadImg(k, src) { var im = new Image(); im.src = src; IMG[k] = im; }
  loadImg('bg', ASSET + 'pond-bg.webp');
  loadImg('body', ASSET + 'zehn-body.png');
  loadImg('rod', ASSET + 'rod-branch.png');
  Object.keys(SPECIES).forEach(function (id) { loadImg('f_' + id, ASSET + 'fish-' + (id === 'b2_meisterfisch' ? 'meisterfisch' : id) + '.png'); });
  var TINT = {};
  function tinted(id) {
    if (TINT[id]) return TINT[id];
    var img = IMG['f_' + id];
    if (!img || !img.complete || !img.naturalWidth) return img;
    try {
      var c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      var g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(14,80,110,0.28)';
      g.fillRect(0, 0, c.width, c.height);
      TINT[id] = c;
      return c;
    } catch (e) { return img; }
  }
  function sizeCanvas() {
    var stage = document.getElementById('v2Stage');
    var r = stage.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(50, Math.round(r.width)), h = Math.max(50, Math.round(r.height));
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    return { w: w, h: h, dpr: dpr };
  }

  // --- Trạng thái ván ---
  var G = null;
  function newGame() {
    G = {
      phase: 'idle', // idle -> gauge -> casting -> sink -> hooked -> caught/lost
      t: 0,
      rod: { angle: -33, vel: 0, target: -33, stiff: 60, damp: 11, bend: 0 },
      gaugeT: 0, gaugeDir: 1,
      lure: { x: 0, y: 0, vx: 0, vy: 0, mode: 'off', flyT: 0, fx: 0, fy: 0, tx: 0, steerX: null },
      fishes: [],
      hooked: null,
      tension: 0, overT: 0,
      holding: false,
      hitstop: 0,
      cam: { x: 500, y: 281, zoom: 1, tx: 500, ty: 281, tzoom: 1, shake: 0 },
      parts: [], ripples: [], bubbles: [], bubbleAt: 0,
      baitClass: 0, // 0 mồi thường; n = cá cấp n làm mồi
      msg: '',
      fast: false,
      blinkAt: 1.6, blinkT: 0, blinkForce: false,
      lean: { a: 0, v: 0, target: 0 },   // thân trên nghiêng quanh khớp hông
      head: { a: 0, v: 0, target: 0 },   // đầu nghiêng quanh khớp cổ
      shift: { x: 0, v: 0, target: 0 },  // thân trên dịch ngang (lấy đà/lunge)
      motes: []
    };
    for (var mi = 0; mi < 26; mi++) {
      G.motes.push({ x: Math.random() * VW, y: WATER_Y + 14 + Math.random() * 180, r: 0.8 + Math.random() * 1.8, ph: Math.random() * 6.28, sp: 4 + Math.random() * 9 });
    }
    spawnFishes();
  }
  function spawnFishes() {
    G.fishes = [];
    var plan = [
      ['sardine', 2], ['barsch', 2], ['forelle', 1], ['goldfisch', 1],
      ['karpfen', 1], ['regenbogenforelle', 1], ['lachs', 1], ['riesenwels', 1]
    ];
    plan.forEach(function (p) {
      for (var i = 0; i < p[1]; i++) G.fishes.push(makeFish(p[0]));
    });
  }
  function makeFish(id) {
    var sp = SPECIES[id];
    var band = DEPTH_BAND[sp.cls];
    return {
      id: id, sp: sp,
      x: 120 + Math.random() * 800,
      y: band[0] + Math.random() * (band[1] - band[0]),
      vx: 0, vy: 0,
      dir: Math.random() < 0.5 ? -1 : 1,
      state: 'swim',
      wx: 200 + Math.random() * 700, wy: band[0] + Math.random() * (band[1] - band[0]),
      wob: Math.random() * 6.28,
      phase: Math.random() * 6.28, speed: 0, coil: 0,
      nibbles: 0, hunger: 0.4 + Math.random() * 0.6,
      dartT: 1 + Math.random() * 1.5, dartX: 0, dartY: 0,
      bites: 0, huntCd: 0
    };
  }
  // Điểm tay cầm cần: bám theo lớp thân trên khi Zehn nghiêng người
  function rodPivot() {
    var bobY = Math.sin(G.t * 1.25) * 2.6;
    var bh = 340 * ((IMG.body.naturalHeight || 573) / (IMG.body.naturalWidth || 620));
    var hip = { x: 215, y: 388 + bobY - bh + bh * 0.70 };
    var paw = { x: 200, y: 273 + bobY };
    var dx = paw.x - hip.x, dy = paw.y - hip.y;
    var c = Math.cos(G.lean.a), s = Math.sin(G.lean.a);
    return { x: hip.x + dx * c - dy * s + G.shift.x, y: hip.y + dx * s + dy * c };
  }
  function rodCurve() {
    var p = rodPivot();
    var a = G.rod.angle * Math.PI / 180, L = 250;
    var tip = { x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L };
    var ctrl = { x: (p.x + tip.x) / 2, y: (p.y + tip.y) / 2 + G.rod.bend };
    return { p0: p, p1: ctrl, p2: tip };
  }
  function quadAt(c, t) {
    var u = 1 - t;
    return { x: u * u * c.p0.x + 2 * u * t * c.p1.x + t * t * c.p2.x, y: u * u * c.p0.y + 2 * u * t * c.p1.y + t * t * c.p2.y };
  }
  function spawnRipple(x, big) {
    G.ripples.push({ x: x, r: big ? 10 : 6, max: big ? 60 : 36, a: 0.85 });
    if (G.ripples.length > 24) G.ripples.shift();
  }
  function spawnSplash(x, y, n, big) {
    for (var i = 0; i < n; i++) {
      G.parts.push({
        x: x + (Math.random() * 2 - 1) * 10, y: y,
        vx: (Math.random() * 2 - 1) * (big ? 140 : 85),
        vy: -(90 + Math.random() * (big ? 200 : 130)),
        r: 1.8 + Math.random() * 2.2, life: 0, ttl: 0.5 + Math.random() * 0.3
      });
    }
  }
  function spawnBubble(x, y) {
    G.bubbles.push({ x: x, y: y, r: 1.6 + Math.random() * 2.6, vy: -(16 + Math.random() * 22), ph: Math.random() * 6.28 });
    if (G.bubbles.length > 50) G.bubbles.shift();
  }

  // --- DOM helpers ---
  function $(id) { return document.getElementById(id); }
  var els = {};
  function hint(t) { els.hint.textContent = t; }
  function setAction(label, mode) {
    els.action.textContent = label;
    els.action.classList.toggle('reel', mode === 'reel');
    els.action.disabled = mode === 'off';
  }
  function toast(t, ms) {
    els.toast.textContent = t;
    els.toast.classList.remove('hidden');
    setTimeout(function () { els.toast.classList.add('hidden'); }, ms || 2200);
  }
  function refreshTop() {
    els.coins.textContent = '🪙 ' + save.coins + ' xu';
    els.basketInfo.textContent = '🧺 ' + save.basket.length + '/' + basketCap();
    els.baitInfo.textContent = G && G.baitClass > 0 ? '🐟 Mồi: cá cấp ' + G.baitClass : '🪱 Mồi thường';
    els.rodInfo.textContent = '🎣 Cần cấp ' + save.rodLvl;
    var o = save.order;
    els.order.innerHTML = o.done >= o.count
      ? '⭐ Đơn hôm nay đã xong — mai có đơn mới!'
      : '⭐ Đơn hôm nay: <b>' + SPECIES[o.fishId].de + '</b> × ' + o.count + ' (đã bán ' + o.done + ') — giá ×1,5 ở sạp!';
  }

  // --- Pha thả câu ---
  function startGauge() {
    G.phase = 'gauge';
    G.rod.target = -74; G.rod.stiff = 55; G.rod.damp = 10;
    els.gauge.classList.remove('hidden');
    setAction('Thả! 🎯', 'on');
    hint('Bấm lần nữa để chốt độ xa — mồi rơi xa thì xuống được vùng cá lớn.');
  }
  function lockCast() {
    els.gauge.classList.add('hidden');
    var t = G.gaugeT;
    var x = t < 0.34 ? 430 : (t < 0.72 ? 620 : 810);
    G.phase = 'casting';
    G.rod.target = -14; G.rod.stiff = 150; G.rod.damp = 13;
    G.lean.v += 3.4;  // người vụt tới theo cú thả
    G.shift.v += 175; // + lao ngang về trước (dịch chuyển đọc rõ hơn xoay với thân tròn)
    setAction('Đang thả…', 'off');
    setTimeout(function () {
      if (!G || G.phase !== 'casting') return;
      noise(0.25, 900, 1900, 0.045, 'bandpass');
      var tip = rodCurve().p2;
      var L = G.lure;
      L.mode = 'fly'; L.flyT = 0; L.fx = tip.x; L.fy = tip.y; L.tx = x; L.x = tip.x; L.y = tip.y;
    }, 230);
  }
  function landLure() {
    var L = G.lure;
    L.mode = 'sink';
    G.phase = 'sink';
    sndSplash(false);
    spawnSplash(L.tx, WATER_Y + 2, 7, false);
    spawnRipple(L.tx, true);
    G.rod.target = -30;
    setAction('Cuộn về (không câu nữa)', 'on');
    hint('Lái mồi bằng cách kéo chuột/tay trên mặt nước. Cá cấp ' + (G.baitClass + 1) + ' sẽ rượt theo mồi này. Giữ nút để cuộn mồi về.');
  }

  // --- AI cá ---
  function fishStep(f, dt) {
    var L = G.lure;
    f.wob += dt * 3;
    if (f.state === 'hooked') return; // cá đã móc do hookedStep điều khiển riêng
    if (f.state === 'swim') {
      // Lang thang về điểm đích, tới nơi chọn điểm mới
      var dx = f.wx - f.x, dy = f.wy - f.y;
      var d = Math.hypot(dx, dy);
      if (d < 24) {
        var band = DEPTH_BAND[f.sp.cls];
        f.wx = 90 + Math.random() * 830;
        f.wy = band[0] + Math.random() * (band[1] - band[0]);
      } else {
        f.vx += (dx / d * 26 - f.vx) * Math.min(1, dt * 1.6);
        f.vy += (dy / d * 14 - f.vy) * Math.min(1, dt * 1.6);
      }
      // Ngửi thấy mồi hợp cấp? (chuỗi thức ăn: cá cấp n đớp mồi cấp n-1)
      if ((G.phase === 'sink') && L.mode === 'sink' && f.sp.cls === G.baitClass + 1) {
        var dd = Math.hypot(L.x - f.x, L.y - f.y);
        var sense = (G.fast ? 520 : 250) * f.hunger;
        if (dd < sense) { f.state = 'chase'; }
      }
    } else if (f.state === 'chase') {
      var tx = L.x, ty = L.y;
      var ddx = tx - f.x, ddy = ty - f.y;
      var dd2 = Math.hypot(ddx, ddy) || 1;
      var sp = 120 + f.sp.cls * 22;
      f.vx += (ddx / dd2 * sp - f.vx) * Math.min(1, dt * 3.2);
      f.vy += (ddy / dd2 * sp - f.vy) * Math.min(1, dt * 3.2);
      if (G.phase !== 'sink' || L.mode !== 'sink') { f.state = 'swim'; }
      else if (dd2 < 30) {
        // Đớp trượt vài lần lấy đà rồi mới dính thật — tạo nhịp chờ
        f.nibbles++;
        if (f.nibbles > (G.fast ? 0 : 1 + Math.floor(Math.random() * 2))) {
          hookFish(f);
        } else {
          f.state = 'backoff'; f.dartT = 0.5;
          spawnBubble(L.x, L.y);
          noise(0.08, 2000, 900, 0.05, 'bandpass');
          L.vx += (Math.random() * 2 - 1) * 30;
        }
      }
    } else if (f.state === 'backoff') {
      f.dartT -= dt;
      f.vx += ((f.x - L.x) * 2.2 - f.vx) * Math.min(1, dt * 5);
      f.vy += ((f.y - L.y) * 2.2 - f.vy) * Math.min(1, dt * 5);
      if (f.dartT <= 0) f.state = 'chase';
    } else if (f.state === 'hunt' && G.hooked) {
      // Cá lớn rình ăn con đã móc: đuổi theo, đớp trúng là mất giá trị
      var h = G.hooked;
      var hx = h.x - f.x, hy = h.y - f.y;
      var hd = Math.hypot(hx, hy) || 1;
      var hsp = 150 + f.sp.cls * 20;
      f.vx += (hx / hd * hsp - f.vx) * Math.min(1, dt * 2.6);
      f.vy += (hy / hd * hsp - f.vy) * Math.min(1, dt * 2.6);
      if (hd < 42 && f.huntCd <= 0) {
        f.huntCd = 1.6;
        h.bites++;
        h.dartX = (h.x - f.x) * 4; h.dartY = -60;
        spawnSplash(h.x, h.y, 6, false);
        noise(0.2, 1800, 500, 0.11, 'bandpass');
        toast('😱 Cá lớn đớp mất một miếng! Con cá của mình mất giá…', 1800);
        if (h.bites >= 3) { loseFish('Cá lớn ăn mất con cá đã móc rồi! 😱'); }
      }
      if (G.phase !== 'hooked') f.state = 'swim';
    }
    f.huntCd = Math.max(0, (f.huntCd || 0) - dt);
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    if (Math.abs(f.vx) > 4) f.dir = f.vx > 0 ? 1 : -1;
    f.x = Math.max(30, Math.min(970, f.x));
    f.y = Math.max(368, Math.min(548, f.y));
    // Pha sóng thân: chạy theo tốc độ bơi — bơi nhanh vẫy mạnh như hoạt hình
    f.speed = Math.hypot(f.vx, f.vy);
    f.phase += dt * (3 + f.speed * 0.10);
  }

  function hookFish(f) {
    G.phase = 'hooked';
    G.hooked = f;
    f.state = 'hooked';
    f.bites = 0;
    f.dartT = 0.3;
    G.tension = 25;
    G.overT = 0;
    G.hitstop = 0.075; // khựng hình tạo lực cho cú giật
    G.cam.shake = 8;
    G.rod.target = -82; G.rod.stiff = 175; G.rod.damp = 14;
    setTimeout(function () { if (G && G.phase === 'hooked') { G.rod.stiff = 70; G.rod.damp = 11; } }, 480);
    sndBite();
    if (navigator.vibrate) { try { navigator.vibrate(70); } catch (e) {} }
    spawnBubble(f.x, f.y);
    setAction('GIỮ ĐỂ KÉO 🎣', 'reel');
    hint('Cá dính rồi! GIỮ để kéo — cá phóng mạnh thì NHẢ ra kẻo đứt dây. Cẩn thận cá lớn hơn rình ăn nó!');
    toast('🎣 Dính ' + f.sp.de + '!', 1500);
    // Kẻ săn mồi thức dậy: cá cấp cao hơn con đã móc có thể đi săn
    G.fishes.forEach(function (o) {
      if (o !== f && o.sp.cls > f.sp.cls && Math.random() < 0.55) o.state = 'hunt';
    });
  }

  function hookedStep(dt) {
    var h = G.hooked;
    if (!h) return;
    // Cá phóng theo bản năng: nghĩ một nhịp ngắn rồi phóng vụt đi
    h.dartT -= dt;
    var darting = h.dartT < 0;
    if (h.dartT < -0.55 - Math.random() * 0.4) {
      // Phóng: hướng ra xa bè + xuống sâu, mạnh theo cấp và sức còn lại
      var tired = Math.max(0.45, 1 - (h.tired || 0) * 0.12);
      var pow = (150 + h.sp.cls * 55) * tired * (save.rodLvl === 1 ? 1 : save.rodLvl === 2 ? 0.85 : 0.7);
      h.dartX = (h.x < 500 ? -1 : 1) * pow * (0.5 + Math.random() * 0.7);
      h.dartY = (40 + Math.random() * 90) * (Math.random() < 0.75 ? 1 : -0.6);
      h.dartT = 1.1 + Math.random() * 1.6;
      h.tired = (h.tired || 0) + 1;
      spawnBubble(h.x, h.y - 8); spawnBubble(h.x - 12, h.y); spawnBubble(h.x + 10, h.y + 6);
      if (h.y < 420) spawnSplash(h.x, WATER_Y + 2, 5, false);
    }
    var kv = darting ? 4.5 : 1.4;
    h.vx += ((h.dartX || 0) - h.vx) * Math.min(1, dt * kv);
    h.vy += ((h.dartY || 0) - h.vy) * Math.min(1, dt * kv);
    if (!darting) { h.dartX = 0; h.dartY = 0; }
    // Người kéo: cá bị lôi về điểm lên cá cạnh bè
    if (G.holding) {
      var px = 330 - h.x, py = (WATER_Y + 4) - h.y;
      var pd = Math.hypot(px, py) || 1;
      var reel = 120 + save.rodLvl * 22;
      h.vx += px / pd * reel * dt * 3.2;
      h.vy += py / pd * reel * dt * 3.2;
    }
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.x = Math.max(40, Math.min(965, h.x));
    h.y = Math.max(360, Math.min(548, h.y));
    if (Math.abs(h.vx) > 4) h.dir = h.vx > 0 ? 1 : -1;
    h.speed = Math.hypot(h.vx, h.vy);
    h.phase += dt * (4 + h.speed * 0.11);
    // Co mình lấy đà ngay trước cú phóng (báo trước bằng hình thể, kiểu hoạt hình)
    var coilT = (!darting && h.dartT < 0.18) ? 1 : 0;
    h.coil += (coilT - h.coil) * Math.min(1, dt * 14);
    // Độ căng: tăng khi GIỮ đúng lúc cá phóng (nguy hiểm), tăng chậm khi giữ
    // lúc cá yên (được kéo vào), giảm nhanh khi nhả — đọc từ chính cú phóng
    // của cá mà người chơi nhìn thấy, không phải đồng hồ ẩn.
    var rate;
    if (G.holding) rate = darting ? 54 : 8;
    else rate = darting ? 6 : -42;
    G.tension += rate * dt * (0.8 + h.sp.cls * 0.12);
    G.tension = Math.max(0, Math.min(100, G.tension));
    var snapTime = save.rodLvl === 1 ? 0.45 : save.rodLvl === 2 ? 0.62 : 0.8;
    if (G.tension >= 97) {
      G.overT += dt;
      if (G.overT > snapTime) { loseFish('Đứt dây! Con cá vùng quá mạnh…'); return; }
    } else G.overT = Math.max(0, G.overT - dt * 2);
    // Lên cá: chạm điểm lên cạnh bè
    if (Math.hypot(330 - h.x, WATER_Y + 4 - h.y) < 52) catchFish();
  }

  function loseFish(msg) {
    noise(0.2, 3000, 500, 0.12, 'highpass');
    beep(160, 0.35, 'sawtooth', 0.07);
    toast(msg, 2400);
    resetCast();
  }

  function resetCast() {
    G.phase = 'idle';
    G.hooked = null;
    G.lure.mode = 'off';
    G.tension = 0;
    G.rod.target = -33; G.rod.stiff = 60; G.rod.damp = 11; G.rod.bend = 0;
    G.fishes.forEach(function (f) { if (f.state !== 'swim') { f.state = 'swim'; f.nibbles = 0; } });
    setAction('Thả câu 🎣', 'on');
    hint('Bấm Thả câu để câu tiếp. Đổi mồi bằng cách dùng cá đã câu làm mồi ở thẻ cá.');
    refreshTop();
  }

  function catchFish() {
    var h = G.hooked;
    G.phase = 'caught';
    G.lean.v -= 3.2; // ngả ra sau + nảy mừng khi cá lên
    G.head.v -= 2.4;
    G.shift.v -= 130;
    sndSplash(true);
    beep(523, 0.14, 'triangle', 0.09); beep(659, 0.14, 'triangle', 0.09, 0.1); beep(784, 0.26, 'triangle', 0.1, 0.2);
    spawnSplash(330, WATER_Y + 2, 10, true);
    var sp = h.sp;
    var len = Math.round(sp.len[0] + Math.random() * (sp.len[1] - sp.len[0]));
    var entry = { fishId: h.id, len: len, bites: h.bites || 0, caughtAt: Date.now() };
    entry.value = priceOf(entry);
    // Sổ cá: ghi loài + kỷ lục (giữ vĩnh viễn dù bán)
    var cat = save.catalog[h.id] || { count: 0, best: 0 };
    cat.count++; cat.best = Math.max(cat.best, len);
    save.catalog[h.id] = cat;
    persist();
    showCard(entry, h.id);
    // Dọn cảnh
    G.fishes = G.fishes.filter(function (f) { return f !== h; });
    G.fishes.push(makeFish(h.id));
    G.hooked = null;
    G.lure.mode = 'off';
    G.rod.target = -33; G.rod.bend = 0;
  }

  // --- Thẻ cá + Sạp + Cửa hàng ---
  function showCard(entry, fishId) {
    var sp = SPECIES[fishId];
    var isRecord = save.catalog[fishId] && save.catalog[fishId].best <= entry.len && save.catalog[fishId].count > 1;
    var full = save.basket.length >= basketCap();
    els.card.innerHTML =
      '<div>🎉 Câu được rồi!</div>' +
      '<img src="' + ASSET + 'fish-' + (fishId === 'b2_meisterfisch' ? 'meisterfisch' : fishId) + '.png" alt="">' +
      '<h3>' + sp.de + '</h3>' +
      '<div class="v2-card-vi">' + sp.vi + ' · cấp ' + sp.cls + '</div>' +
      '<div class="v2-card-meta">' + entry.len + ' cm · đáng giá ~' + entry.value + ' xu' +
      (entry.bites ? ' · bị đớp ' + entry.bites + ' miếng nên rẻ đi' : '') +
      (isRecord ? ' · 🏆 Kỷ lục loài!' : '') + '</div>' +
      '<div class="v2-card-btns">' +
      '<button id="v2Keep" ' + (full ? 'disabled' : '') + '>🧺 Cho vào giỏ</button>' +
      '<button id="v2Bait" class="bait">🪱 Dùng làm mồi</button>' +
      '<button id="v2Release" class="alt">🐟 Thả lại</button>' +
      '</div>' +
      (full ? '<div class="v2-card-vi">Giỏ đầy rồi — ra sạp bán bớt đã!</div>' : '');
    els.card.classList.remove('hidden');
    $('v2Keep').onclick = function () {
      save.basket.push(entry); persist();
      els.card.classList.add('hidden');
      toast('Đã cho ' + sp.de + ' vào giỏ 🧺', 1500);
      resetCast();
    };
    $('v2Bait').onclick = function () {
      G.baitClass = sp.cls;
      els.card.classList.add('hidden');
      toast('Dùng ' + sp.de + ' làm mồi — cá cấp ' + (sp.cls + 1) + ' sẽ rượt theo!', 2000);
      resetCast();
    };
    $('v2Release').onclick = function () {
      els.card.classList.add('hidden');
      toast('Đã thả ' + sp.de + ' về ao 🐟', 1500);
      resetCast();
    };
    setAction('Chọn ở thẻ cá…', 'off');
    refreshTop();
  }

  function germanOrderText() {
    var o = save.order;
    var sp = SPECIES[o.fishId];
    var need = Math.max(1, o.count - o.done);
    return '„Ich hätte gern ' + (NUM_DE[need] || need) + ' ' + sp.de.replace(/^der |^die |^das /, '') + ', bitte!"';
  }
  function renderStall() {
    var o = save.order;
    var rows = save.basket.map(function (e, i) {
      var sp = SPECIES[e.fishId];
      var inOrder = o.fishId === e.fishId && o.done < o.count;
      return '<div class="v2-row"><img src="' + ASSET + 'fish-' + (e.fishId === 'b2_meisterfisch' ? 'meisterfisch' : e.fishId) + '.png" alt="">' +
        '<div class="v2-row-info"><b>' + sp.de + '</b> (' + sp.vi + ')<br>' + e.len + ' cm' + (e.bites ? ' · bị đớp ' + e.bites : '') + (inOrder ? ' · ⭐ đơn hôm nay' : '') + '</div>' +
        '<div class="v2-row-price">' + priceOf(e) + ' xu</div>' +
        '<button data-sell="' + i + '">Bán</button></div>';
    }).join('');
    var total = save.basket.reduce(function (s, e) { return s + priceOf(e); }, 0);
    els.stall.innerHTML =
      '<h3>🏪 Sạp cá của Zehn</h3>' +
      '<div class="v2-customer">🧑 Khách: <i>' + germanOrderText() + '</i>' +
      '<button id="v2Listen">🔊 Nghe</button><br><span style="font-size:13px;color:#64748b">Khách cần ' + SPECIES[o.fishId].de + ' — bán đúng loài của đơn hôm nay được giá ×1,5.</span></div>' +
      (save.basket.length ? rows : '<div class="v2-empty">Giỏ đang trống. Ra ao câu cá đã!</div>') +
      '<div class="v2-panel-foot">' +
      '<button id="v2SellAll" ' + (save.basket.length ? '' : 'disabled') + '>Bán tất cả (' + total + ' xu)</button>' +
      '<button class="v2-close" id="v2StallClose">Đóng sạp</button></div>';
    els.stall.classList.remove('hidden');
    els.shop.classList.add('hidden');
    els.stall.querySelectorAll('[data-sell]').forEach(function (b) {
      b.onclick = function () { sellAt(parseInt(b.getAttribute('data-sell'), 10)); };
    });
    var sa = $('v2SellAll');
    if (sa) sa.onclick = function () {
      var t = 0;
      save.basket.slice().forEach(function () { t += priceOf(save.basket[0]); applyOrder(save.basket[0]); save.basket.shift(); });
      save.coins += t; persist(); refreshTop(); renderStall();
      toast('Bán hết giỏ, thu ' + t + ' xu 🪙', 1800);
    };
    var ln = $('v2Listen');
    if (ln) ln.onclick = function () {
      try {
        var u = new SpeechSynthesisUtterance(germanOrderText().replace(/[„“]/g, ''));
        u.lang = 'de-DE';
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) {}
    };
    $('v2StallClose').onclick = function () { els.stall.classList.add('hidden'); };
  }
  function applyOrder(e) {
    var o = save.order;
    if (o.fishId === e.fishId && o.done < o.count) o.done++;
  }
  function sellAt(i) {
    var e = save.basket[i];
    if (!e) return;
    var v = priceOf(e);
    applyOrder(e);
    save.basket.splice(i, 1);
    save.coins += v;
    persist(); refreshTop(); renderStall();
    toast('Bán ' + SPECIES[e.fishId].de + ' được ' + v + ' xu 🪙', 1400);
  }

  function renderShop() {
    var rod2 = save.rodLvl >= 2, rod3 = save.rodLvl >= 3, big = save.basketLvl >= 2;
    function row(name, desc, price, owned, cb, locked) {
      return '<div class="v2-row"><div class="v2-row-info"><b>' + name + '</b><br>' + desc + (locked ? '<br><i>Cần mua cấp 2 trước.</i>' : '') + '</div>' +
        '<div class="v2-row-price">' + (owned ? 'Đã có ✓' : price + ' xu') + '</div>' +
        '<button data-buy="' + cb + '" ' + (owned || locked || save.coins < price ? 'disabled' : '') + '>Mua</button></div>';
    }
    els.shop.innerHTML =
      '<h3>🛠️ Cửa hàng đồ nghề</h3>' +
      row('🎣 Cần câu cấp 2', 'Cá phóng yếu đi 15%, dây khó đứt hơn — câu được cá cấp 3 chắc tay.', 250, rod2, 'rod2') +
      row('🎣 Cần câu cấp 3', 'Cá phóng yếu đi 30%, dây rất khó đứt — thách thức cá nheo khổng lồ.', 800, rod3, 'rod3', !rod2) +
      row('🧺 Giỏ cá lớn', 'Giỏ chứa 10 con thay vì 5.', 200, big, 'basket') +
      '<div class="v2-panel-foot"><button class="v2-close" id="v2ShopClose">Đóng</button></div>' +
      '<div class="v2-empty">Xu kiếm được bằng cách bán cá ở sạp. Cần tốt hơn = câu được cá cấp cao hơn = bán đắt hơn.</div>';
    els.shop.classList.remove('hidden');
    els.stall.classList.add('hidden');
    els.shop.querySelectorAll('[data-buy]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-buy');
        if (k === 'rod2' && save.coins >= 250) { save.coins -= 250; save.rodLvl = 2; }
        else if (k === 'rod3' && save.coins >= 800) { save.coins -= 800; save.rodLvl = 3; }
        else if (k === 'basket' && save.coins >= 200) { save.coins -= 200; save.basketLvl = 2; }
        else return;
        persist(); refreshTop(); renderShop();
        toast('Mua thành công! 🎉', 1400);
      };
    });
    $('v2ShopClose').onclick = function () { els.shop.classList.add('hidden'); };
  }

  // --- Cập nhật & vẽ ---
  function update(dt) {
    G.t += dt;
    // Nhịp chớp mắt của Zehn
    if (G.t >= G.blinkAt) { G.blinkT = 0.13; G.blinkAt = G.t + 2.2 + Math.random() * 2.8; }
    if (G.blinkT > 0) G.blinkT -= dt;
    // Bụi nước trôi lững lờ cho mặt nước có đời sống
    G.motes.forEach(function (m) {
      m.x += Math.sin(G.t * 0.6 + m.ph) * 3 * dt + m.sp * dt * 0.4;
      m.y += Math.cos(G.t * 0.4 + m.ph) * 2 * dt;
      if (m.x > VW + 4) { m.x = -4; m.y = WATER_Y + 14 + Math.random() * 180; }
    });
    // Lò xo cần
    var r = G.rod;
    var acc = (r.target - r.angle) * r.stiff - r.vel * r.damp;
    r.vel += acc * dt;
    r.angle += r.vel * dt;
    var bendT = G.phase === 'hooked' ? G.tension * 0.45 : 0;
    r.bend += (bendT - r.bend) * Math.min(1, dt * 7);
    // Lò xo thân trên + đầu + dịch ngang: đích theo hành động từng pha
    var leanT, headT, shiftT;
    if (G.phase === 'gauge') { leanT = -0.15; headT = -0.05; shiftT = -7; }        // ngả ra sau + lùi lấy đà
    else if (G.phase === 'casting') { leanT = 0.07; headT = 0.02; shiftT = 5; }    // vụt tới
    else if (G.phase === 'sink') { leanT = -0.015 + Math.sin(G.t * 1.3) * 0.008; headT = 0.055; shiftT = 0; } // nhìn xuống mồi
    else if (G.phase === 'hooked') {
      leanT = -0.07 - G.tension * 0.0006 + (G.holding ? Math.sin(G.t * 21) * 0.013 : 0); // gồng theo sức căng + đu nhịp kéo
      headT = -0.03 - (G.holding ? 0.012 : 0);
      shiftT = -3;
    }
    else if (G.phase === 'caught') { leanT = -0.02; headT = -0.04; shiftT = -2; }
    else { leanT = Math.sin(G.t * 1.1) * 0.010; headT = Math.sin(G.t * 0.9) * 0.012; shiftT = 0; }
    G.lean.target = leanT; G.head.target = headT; G.shift.target = shiftT;
    G.lean.v += ((G.lean.target - G.lean.a) * 110 - G.lean.v * 13) * dt;
    G.lean.a += G.lean.v * dt;
    G.head.v += ((G.head.target - G.head.a) * 80 - G.head.v * 11) * dt;
    G.head.a += G.head.v * dt;
    G.shift.v += ((G.shift.target - G.shift.x) * 90 - G.shift.v * 12) * dt;
    G.shift.x += G.shift.v * dt;
    // Máy quay
    var cam = G.cam;
    var ck = Math.min(1, dt * 3);
    cam.x += (cam.tx - cam.x) * ck; cam.y += (cam.ty - cam.y) * ck;
    cam.zoom += (cam.tzoom - cam.zoom) * Math.min(1, dt * 2.4);
    var hzx = (VW / 2) / cam.zoom, hzy = (VH / 2) / cam.zoom;
    cam.x = Math.max(hzx, Math.min(VW - hzx, cam.x));
    cam.y = Math.max(hzy, Math.min(VH - hzy, cam.y));
    cam.shake *= Math.exp(-dt * 7);

    if (G.phase === 'gauge') {
      G.gaugeT += dt * G.gaugeDir / 1.1;
      if (G.gaugeT >= 1) { G.gaugeT = 1; G.gaugeDir = -1; }
      if (G.gaugeT <= 0) { G.gaugeT = 0; G.gaugeDir = 1; }
      els.gaugeMarker.style.left = (G.gaugeT * 100) + '%';
    }
    var L = G.lure;
    if (L.mode === 'fly') {
      L.flyT += dt / 0.6;
      var ft = Math.min(1, L.flyT);
      L.x = L.fx + (L.tx - L.fx) * ft;
      L.y = L.fy + (WATER_Y - L.fy) * ft - Math.sin(ft * Math.PI) * 100;
      if (ft >= 1) landLure();
    } else if (L.mode === 'sink' && G.phase === 'sink') {
      // Chìm dần + lái ngang theo con trỏ + giữ để cuộn về
      L.vy += ((L.y < 520 ? 55 : 12) - L.vy) * Math.min(1, dt * 2);
      if (L.steerX != null) L.vx += ((L.steerX - L.x) * 3.2 - L.vx) * Math.min(1, dt * 6);
      else L.vx *= Math.exp(-dt * 2);
      if (G.holding) { L.vy = -150; if (L.y < WATER_Y + 16) { L.mode = 'off'; G.phase = 'idle'; G.rod.target = -33; setAction('Thả câu 🎣', 'on'); hint('Đã cuộn mồi về. Bấm Thả câu để câu tiếp.'); } }
      L.x = Math.max(50, Math.min(950, L.x + L.vx * dt));
      L.y = Math.max(WATER_Y + 8, Math.min(540, L.y + L.vy * dt));
      if (Math.random() < dt * 1.2) spawnBubble(L.x, L.y);
    }
    if (G.phase === 'hooked') hookedStep(dt);
    G.fishes.forEach(function (f) { fishStep(f, dt); });
    // Hạt/gợn/bong bóng
    for (var i = G.parts.length - 1; i >= 0; i--) {
      var p = G.parts[i];
      p.life += dt; p.vy += 950 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life >= p.ttl || p.y > VH + 8) G.parts.splice(i, 1);
    }
    for (var j = G.ripples.length - 1; j >= 0; j--) {
      var rp = G.ripples[j];
      rp.r += dt * 32; rp.a = 0.85 * Math.max(0, 1 - rp.r / rp.max);
      if (rp.r >= rp.max) G.ripples.splice(j, 1);
    }
    for (var k = G.bubbles.length - 1; k >= 0; k--) {
      var bb = G.bubbles[k];
      bb.y += bb.vy * dt; bb.x += Math.sin(G.t * 6 + bb.ph) * 8 * dt;
      if (bb.y < WATER_Y + 6) G.bubbles.splice(k, 1);
    }
    // Đích máy quay theo pha
    if (G.phase === 'sink') { cam.tx = 560; cam.ty = 300; cam.tzoom = 1.05; }
    else if (G.phase === 'hooked' && G.hooked) { cam.tx = (330 + G.hooked.x) / 2 + 120; cam.ty = 300; cam.tzoom = 1.08; }
    else { cam.tx = 500; cam.ty = 281; cam.tzoom = 1; }
  }

  // Vẽ cá kiểu HOẠT HÌNH: cắt thân thành 12 lát, mỗi lát lệch theo sóng
  // chạy từ đầu tới đuôi (đuôi lệch mạnh nhất) -> cá uốn mình vẫy đuôi thật.
  // Kèm co-giãn (squash & stretch): co lại khi lấy đà, giãn ra khi phóng nhanh.
  function drawFish(g, img, f, w, alpha) {
    if (!img) return;
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var hh = w * ih / iw;
    var speed = f.speed || 0;
    var amp = (2.6 + Math.min(9.5, speed * 0.075)) * (f.state === 'hooked' ? 1.4 : 1) * (1 + (f.coil || 0) * 0.7);
    var stretch = Math.max(0.88, Math.min(1.16, 1 + (speed - 45) * 0.0009 - (f.coil || 0) * 0.10));
    var rot = Math.sin(G.t * 3 + f.wob) * 0.04 + Math.max(-0.30, Math.min(0.30, f.vy * 0.0035)) + (f.state === 'hooked' ? Math.sin(G.t * 16) * 0.05 : 0);
    var SEG = 12, sw = iw / SEG;
    g.save();
    g.translate(f.x, f.y);
    g.rotate(rot);
    g.scale((f.dir >= 0 ? 1 : -1) * stretch, 1 / Math.sqrt(stretch));
    g.globalAlpha = alpha == null ? 1 : alpha;
    for (var i = 0; i < SEG; i++) {
      var u = 1 - (i + 0.5) / SEG; // 0 ở đầu (phải), 1 ở đuôi (trái)
      var off = Math.sin((f.phase || 0) + i * 0.55) * amp * Math.pow(u, 1.3);
      g.drawImage(img, i * sw, 0, sw, ih, -w / 2 + (i / SEG) * w, -hh / 2 + off, w / SEG + 1.2, hh);
    }
    g.restore();
  }

  function draw() {
    var s = sizeCanvas();
    var g = ctx;
    g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    g.clearRect(0, 0, s.w, s.h);
    var cam = G.cam, sx = s.w / VW, sy = s.h / VH;
    var shX = cam.shake ? (Math.random() * 2 - 1) * cam.shake : 0;
    var shY = cam.shake ? (Math.random() * 2 - 1) * cam.shake * 0.7 : 0;
    g.translate(s.w / 2, s.h / 2);
    g.scale(cam.zoom, cam.zoom);
    g.translate(-cam.x * sx + shX, -cam.y * sy + shY);
    g.scale(sx, sy);

    var bg = IMG.bg;
    if (bg && bg.complete && bg.naturalWidth) g.drawImage(bg, 0, 0, VW, VH);
    else { g.fillStyle = '#7ec8d8'; g.fillRect(0, 0, VW, VH); }

    // Cá bơi dưới nước (bản nhuộm) — con đã móc vẽ sáng hơn + quẫy
    G.fishes.forEach(function (f) {
      var isHooked = G.hooked === f;
      var img = isHooked ? IMG['f_' + f.id] : tinted(f.id);
      if (isHooked) {
        g.save(); g.shadowColor = 'rgba(255,255,255,0.6)'; g.shadowBlur = 16;
        drawFish(g, img, f, FISH_W[f.sp.cls], 1);
        g.restore();
      } else {
        drawFish(g, img, f, FISH_W[f.sp.cls], f.state === 'hunt' ? 0.95 : 0.88);
      }
      if (f.state === 'hunt' && G.hooked) {
        g.save();
        g.fillStyle = '#dc2626';
        g.font = 'bold 26px sans-serif';
        g.textAlign = 'center';
        g.fillText('!', f.x, f.y - FISH_W[f.sp.cls] * 0.42);
        g.restore();
      }
    });

    // Bụi nước trôi (vẽ trước lớp phủ cho chìm tự nhiên)
    G.motes.forEach(function (m) {
      g.save();
      g.globalAlpha = 0.20 + 0.10 * Math.sin(G.t + m.ph);
      g.fillStyle = '#eafcff';
      g.beginPath(); g.arc(m.x, m.y, m.r, 0, Math.PI * 2); g.fill();
      g.restore();
    });

    // Lớp phủ nước
    var grad = g.createLinearGradient(0, WATER_Y, 0, VH);
    grad.addColorStop(0, 'rgba(10,90,120,0.10)');
    grad.addColorStop(1, 'rgba(6,50,90,0.30)');
    g.fillStyle = grad;
    g.fillRect(0, WATER_Y, VW, VH - WATER_Y);
    g.fillStyle = 'rgba(255,255,255,0.20)';
    g.fillRect(0, WATER_Y - 1, VW, 2);
    G.ripples.forEach(function (rp) {
      g.save();
      g.strokeStyle = 'rgba(255,255,255,' + (rp.a * 0.8).toFixed(3) + ')';
      g.lineWidth = 2;
      g.beginPath(); g.ellipse(rp.x, WATER_Y + 5, rp.r, rp.r * 0.34, 0, 0, Math.PI * 2); g.stroke();
      g.restore();
    });

    // Zehn HOẠT HÌNH LỚP (kiểu khớp xương của game 2D): lớp nền chỉ giữ phần
    // dưới đường may (bè + chân) -> lớp thân trên xoay quanh khớp hông theo
    // hành động -> lớp đầu xoay quanh khớp cổ (kèm chớp mắt) -> cần bám theo tay.
    var bobY = Math.sin(G.t * 1.25) * 2.6;
    var body = IMG.body;
    if (body && body.complete && body.naturalWidth) {
      var bw = 340, bh = bw * body.naturalHeight / body.naturalWidth;
      var top = 388 + bobY - bh;
      var brY = 1 + Math.sin(G.t * 1.9) * 0.009; // hơi thở
      // Lớp nền: phần dưới đường may 70% (chân + bè), neo chân + thở nhẹ
      g.save();
      g.translate(210, 388 + bobY);
      g.scale(1, brY);
      g.beginPath();
      g.rect(-176, -bh * 0.30 - 4, 352, bh);
      g.clip();
      g.drawImage(body, -170, -bh, bw, bh);
      g.restore();
      // Lớp thân trên: xoay quanh khớp hông + dịch ngang theo hành động
      var hipX = 215, hipY = top + bh * 0.70;
      g.save();
      g.translate(hipX + G.shift.x, hipY + Math.abs(G.shift.x) * 0.12);
      g.rotate(G.lean.a);
      g.beginPath();
      g.rect(40 - hipX - 6, top - hipY - 6, bw + 12, bh * 0.70 + 15);
      g.clip();
      g.drawImage(body, 40 - hipX, top - hipY, bw, bh);
      g.restore();
      // Lớp đầu: xoay quanh khớp cổ (gánh 55% nghiêng thân + nghiêng riêng), chớp mắt theo đầu
      var neckX = 232, neckY = top + bh * 0.42;
      g.save();
      g.translate(neckX + G.shift.x, neckY + Math.abs(G.shift.x) * 0.12);
      g.rotate(G.lean.a * 0.55 + G.head.a);
      g.beginPath();
      g.rect(40 - neckX - 6, top - neckY - 6, bw + 12, bh * 0.46 + 10);
      g.clip();
      g.drawImage(body, 40 - neckX, top - neckY, bw, bh);
      if ((G.blinkT > 0) || G.blinkForce) {
        var eyes = [[0.435, 0.368], [0.539, 0.362]];
        eyes.forEach(function (e) {
          var ex = 40 + e[0] * bw - neckX, ey = top + e[1] * bh - neckY;
          g.fillStyle = '#fff7ea';
          g.beginPath(); g.ellipse(ex, ey, 8.5, 5.5, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#6b4f35'; g.lineWidth = 2; g.lineCap = 'round';
          g.beginPath(); g.arc(ex, ey - 1.5, 6, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
        });
      }
      g.restore();
    }
    var rod = IMG.rod, curve = rodCurve();
    if (rod && rod.complete && rod.naturalWidth) {
      var SEG = 9, rodLen = 250, sw = rod.naturalWidth / SEG;
      for (var si = 0; si < SEG; si++) {
        var pa = quadAt(curve, si / SEG), pb = quadAt(curve, (si + 1) / SEG);
        var segLen = Math.hypot(pb.x - pa.x, pb.y - pa.y) + 2.5;
        var ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
        g.save();
        g.translate(pa.x, pa.y);
        g.rotate(ang);
        g.drawImage(rod, si * sw, 0, sw, rod.naturalHeight, 0, -rodLen * 0.06, segLen, rodLen * 0.12);
        g.restore();
      }
    }

    // Dây + mồi / cá đã móc
    var tip = curve.p2;
    var end = null;
    if (G.phase === 'hooked' && G.hooked) end = { x: G.hooked.x - G.hooked.dir * FISH_W[G.hooked.sp.cls] * 0.3, y: G.hooked.y - 4 };
    else if (G.lure.mode !== 'off') end = { x: G.lure.x, y: G.lure.y };
    if (end) {
      var col = 'rgba(255,255,255,0.9)';
      if (G.phase === 'hooked') col = G.tension >= 97 ? '#ef4444' : (G.tension >= 75 ? '#fbbf24' : 'rgba(255,255,255,0.92)');
      var sag = G.phase === 'hooked' ? 34 * (1 - G.tension / 100) + 3 : 26;
      g.save();
      g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = 'round';
      g.beginPath();
      g.moveTo(tip.x, tip.y);
      g.quadraticCurveTo((tip.x + end.x) / 2, Math.max(tip.y, end.y) + sag, end.x, end.y);
      g.stroke();
      g.restore();
    }
    if (G.lure.mode !== 'off' && G.phase !== 'hooked') {
      g.save();
      g.translate(G.lure.x, G.lure.y);
      g.fillStyle = '#dc2626';
      g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
      if (G.baitClass > 0) {
        g.fillStyle = 'rgba(255,255,255,0.9)';
        g.font = 'bold 12px sans-serif'; g.textAlign = 'center';
        g.fillText('🐟', 0, -12);
      }
      g.restore();
    }
    // Hạt + bong bóng
    G.parts.forEach(function (p) {
      g.save();
      g.globalAlpha = Math.max(0, 1 - p.life / p.ttl) * 0.95;
      g.fillStyle = '#e8f6ff';
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    G.bubbles.forEach(function (bb) {
      g.save();
      g.strokeStyle = 'rgba(230,248,255,0.75)'; g.lineWidth = 1.2;
      g.beginPath(); g.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); g.stroke();
      g.restore();
    });
    // Vòng căng quanh cá đã móc (thay hai thanh đo): đỏ dần khi sắp đứt
    if (G.phase === 'hooked' && G.hooked) {
      var h = G.hooked;
      g.save();
      g.strokeStyle = G.tension >= 75 ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.45)';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(h.x, h.y, FISH_W[h.sp.cls] * 0.42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (G.tension / 100));
      g.stroke();
      g.restore();
    }
  }

  // --- Điều khiển ---
  function pressStart() {
    if (!G) return;
    if (G.phase === 'idle') startGauge();
    else if (G.phase === 'gauge') lockCast();
    else if (G.phase === 'sink') { /* giữ để cuộn về xử lý ở hold */ }
    else if (G.phase === 'hooked') G.holding = true;
  }
  function pressEnd() {
    if (G && G.phase === 'hooked') G.holding = false;
    if (G && G.phase === 'sink') G.holding = false;
  }
  function stagePoint(evt) {
    var r = canvas.getBoundingClientRect();
    var cx = (evt.touches ? evt.touches[0].clientX : evt.clientX);
    return { x: (cx - r.left) / r.width * VW };
  }

  // --- Khởi tạo ---
  function init() {
    els = {
      coins: $('v2Coins'), basketInfo: $('v2BasketInfo'), baitInfo: $('v2BaitInfo'), rodInfo: $('v2RodInfo'),
      order: $('v2Order'), gauge: $('v2Gauge'), gaugeMarker: $('v2GaugeMarker'),
      card: $('v2Card'), toast: $('v2Toast'), action: $('v2Action'), hint: $('v2Hint'),
      stall: $('v2Stall'), shop: $('v2Shop')
    };
    newGame();
    els.action.addEventListener('pointerdown', function (e) { e.preventDefault(); if (G.phase === 'sink') { G.holding = true; } else pressStart(); });
    window.addEventListener('pointerup', pressEnd);
    canvas.addEventListener('pointerdown', function (e) {
      var p = stagePoint(e);
      if (G.phase === 'sink') G.lure.steerX = p.x;
      if (G.phase === 'hooked') G.holding = true;
    });
    canvas.addEventListener('pointermove', function (e) {
      if (G.phase === 'sink') G.lure.steerX = stagePoint(e).x;
    });
    canvas.addEventListener('pointerup', function () { if (G.phase === 'sink') G.holding = false; });
    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) pressStart(); }
      if (e.code === 'ArrowLeft' && G.phase === 'sink') G.lure.steerX = Math.max(50, G.lure.x - 60);
      if (e.code === 'ArrowRight' && G.phase === 'sink') G.lure.steerX = Math.min(950, G.lure.x + 60);
    });
    document.addEventListener('keyup', function (e) { if (e.code === 'Space') pressEnd(); });
    $('v2StallBtn').addEventListener('click', renderStall);
    $('v2ShopBtn').addEventListener('click', renderShop);
    refreshTop();
    var last = performance.now();
    var loop = function (now) {
      requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (G.hitstop > 0) { G.hitstop -= dt; draw(); return; } // khựng hình: vẽ nhưng không cập nhật vật lý
      update(dt);
      draw();
    };
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.FishingV2 = {
    __test: {
      getState: function () {
        return {
          phase: G.phase, coins: save.coins, basket: save.basket.length,
          baitClass: G.baitClass, rodLvl: save.rodLvl,
          tension: Math.round(G.tension),
          hookedId: G.hooked ? G.hooked.id : null,
          fishCount: G.fishes.length
        };
      },
      setFast: function () { G.fast = true; },
      setBlink: function (on) { G.blinkForce = !!on; },
      addCoins: function (n) { save.coins += n; persist(); refreshTop(); },
      forceLureNearFish: function () {
        var f = G.fishes.find(function (x) { return x.sp.cls === G.baitClass + 1; });
        if (f && G.lure.mode === 'sink') { G.lure.x = f.x; G.lure.y = f.y; }
        return !!f;
      }
    }
  };
})();
