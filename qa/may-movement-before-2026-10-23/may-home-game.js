/* Interactive home scene. Existing app controllers own all learning and collections. */
(() => {
  'use strict';
  const home = document.getElementById('mayGameHome');
  const canvas = document.getElementById('mayIslandCanvas');
  const E = window.MayHomeEngine;
  if (!home || !canvas || !E) return;
  const context = canvas.getContext('2d');
  const overview = document.getElementById('mayDailyOverview');
  const speech = document.getElementById('mayWorldSpeech');
  const hint = document.getElementById('mayWorldHint');
  const characterTouch = document.getElementById('mayCharacterTouch');
  const loading = document.getElementById('mayWorldLoading');
  const pauseButton = document.getElementById('mayWorldPause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const KEY = 'vokabelgo_may_home_v1';
  const SPRITE_HEIGHT = 150;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  const initial = Number.isFinite(saved.x) && Number.isFinite(saved.y) ? E.project({x:saved.x,y:saved.y}).point : E.points.square;
  const walker = new E.Walker(initial);
  const places = {
    house: { point: E.points.porch, label: [.62,.465], title: 'Nhà Mây', action: () => window.openCatPickerModal?.() },
    study: { point: E.points.shore, label: [.23,.79], title: 'Góc học từ', action: () => window.handleTodayPrimaryAction?.() },
    kino: { point: E.points.garden, label: [.82,.42], title: 'Góc nghe & xem', action: () => window.setPrimaryHub?.('kino') },
    fish: { point: E.points.fish, label: [.89,.69], title: 'Bến cá', action: () => { window.setPrimaryHub?.('library'); window.setLibraryTab?.('fish'); } },
    today: { point: E.points.board, label: [.37,.43], title: 'Bảng hôm nay', action: () => openOverview() }
  };
  const buttons = [...document.querySelectorAll('[data-may-place]')];
  const camera = { x: 0, y: 0, scale: 1, initialized: false, follow: true };
  const frames = [
    {x:109,y:78,w:498,h:485,anchor:.43},
    {x:680,y:79,w:513,h:495,anchor:.44},
    {x:92,y:682,w:496,h:493,anchor:.42},
    {x:698,y:671,w:495,h:491,anchor:.43}
  ];
  let width = 1, height = 1, pixelRatio = 1, raf = 0, last = 0, elapsed = 0;
  let assetsReady = false, manualPause = saved.paused === true, gesture = null, waveUntil = 0, speakUntil = 5;
  let ripples = [], lastSavedPlace = saved.lastPlace || null;
  const visited = saved.visited && typeof saved.visited === 'object' ? {...saved.visited} : {};
  const background = new Image(), sprites = new Image();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lowMotion = () => manualPause || reduced.matches;
  const blocking = () => overview.open || !document.getElementById('catAvatarModal')?.classList.contains('hidden');
  const visible = () => document.body.dataset.hub === 'today' && !document.hidden && !blocking();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({x:walker.position.x,y:walker.position.y,visited,lastPlace:lastSavedPlace,paused:manualPause})); } catch (_) {}
  }
  function say(message, seconds = 4) {
    speech.textContent = message;
    speakUntil = elapsed + seconds;
  }
  function project(point) { return {x:point.x*camera.scale+camera.x,y:point.y*camera.scale+camera.y}; }
  function worldPoint(event) {
    const r = canvas.getBoundingClientRect();
    return {x:(event.clientX-r.left-camera.x)/camera.scale,y:(event.clientY-r.top-camera.y)/camera.scale};
  }
  function updateCamera(snap = false) {
    camera.scale = Math.max(width/E.WIDTH, height/E.HEIGHT);
    if (camera.follow) {
      const targetX = clamp(width*.5-walker.position.x*camera.scale, width-E.WIDTH*camera.scale, 0);
      const targetY = (height-E.HEIGHT*camera.scale)*.5;
      const blend = snap || !camera.initialized ? 1 : .1;
      camera.x += (targetX-camera.x)*blend;
      camera.y += (targetY-camera.y)*blend;
    }
    camera.x = clamp(camera.x, width-E.WIDTH*camera.scale, 0);
    camera.y = clamp(camera.y, height-E.HEIGHT*camera.scale, 0);
    camera.initialized = true;
  }
  function positionControls() {
    buttons.forEach(button => {
      const place = places[button.dataset.mayPlace];
      const p = project({x:place.label[0]*E.WIDTH,y:place.label[1]*E.HEIGHT});
      const outside = p.x < -35 || p.x > width+35 || p.y < 35 || p.y > height-65;
      button.hidden = outside || E.distance(walker.position,place.point) < 130;
      button.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;
      button.setAttribute('aria-pressed', String(walker.intent === button.dataset.mayPlace));
    });
    const p = project(walker.position);
    const spriteHeight = SPRITE_HEIGHT*camera.scale;
    const touchWidth = clamp(116*camera.scale, 66, 140);
    characterTouch.style.width = `${touchWidth}px`;
    characterTouch.style.height = `${spriteHeight}px`;
    characterTouch.style.transform = `translate(${p.x-touchWidth*.5}px,${p.y-spriteHeight}px)`;
    speech.style.transform = `translate(${clamp(p.x-100,14,Math.max(14,width-255))}px,${clamp(p.y-spriteHeight-65,85,height-200)}px)`;
  }
  function draw() {
    updateCamera(lowMotion());
    positionControls();
    if (!context || !assetsReady) return;
    context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    context.clearRect(0,0,width,height);
    context.save();
    context.translate(camera.x,camera.y); context.scale(camera.scale,camera.scale);
    context.drawImage(background,0,0,E.WIDTH,E.HEIGHT);
    context.strokeStyle = '#8d6c49'; context.lineWidth = 2;
    ripples.forEach(r => { context.globalAlpha = Math.max(0,1-(elapsed-r.time)/1.2)*.7; context.beginPath(); context.ellipse(r.x,r.y,14+(elapsed-r.time)*32,5+(elapsed-r.time)*10,0,0,Math.PI*2); context.stroke(); });
    context.globalAlpha = 1;
    const p = walker.position;
    context.fillStyle = '#31462729'; context.beginPath(); context.ellipse(p.x+7,p.y-1,45,12,0,0,Math.PI*2); context.fill();
    let frame = frames[0];
    if (walker.moving && !lowMotion()) frame = frames[[0,1,0,2][Math.floor(walker.travelled/22)%4]];
    else if (elapsed < waveUntil) frame = frames[3];
    const bob = walker.moving && !lowMotion() ? Math.sin(walker.travelled*.16)*2.6 : 0;
    const spriteHeight = SPRITE_HEIGHT, spriteWidth = spriteHeight*frame.w/frame.h;
    context.drawImage(sprites,frame.x,frame.y,frame.w,frame.h,p.x-spriteWidth*frame.anchor,p.y-spriteHeight+bob,spriteWidth,spriteHeight);
    context.restore();
  }
  function resize() {
    const r = home.getBoundingClientRect(); width = r.width; height = r.height;
    pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*pixelRatio); canvas.height = Math.round(height*pixelRatio);
    camera.initialized = false; draw();
  }
  function arrive(id) {
    const place = places[id]; if (!place) return;
    visited[id] = true; lastSavedPlace = id; save();
    hint.textContent = 'Chạm đường để Mây đi tới. Kéo để ngắm vườn.';
    say(`Đến ${place.title.toLowerCase()} rồi!`,2.5);
    waveUntil = elapsed + .8;
    place.action();
    draw(); lifecycle();
  }
  function goPlace(id) {
    const place = places[id]; if (!place) return;
    camera.follow = true;
    hint.textContent = `Mây đang đi tới ${place.title.toLowerCase()}…`;
    say('Đi cùng mình nhé!',2);
    walker.go(place.point,id,lowMotion() || !assetsReady);
    if (!walker.moving) { const intent = walker.update(0); if (intent) arrive(intent); }
    draw(); lifecycle();
  }
  function goPath(point) {
    const path = E.project(point);
    if (path.distance > 95) {
      ripples.push({...point,time:elapsed});
      say('Mình đi trên lối nhỏ nhé.',2.5); draw(); return;
    }
    camera.follow = true;
    walker.go(path.point,null,lowMotion());
    if (!walker.moving) save();
    hint.textContent = 'Chọn nhà hoặc bến để vào học.';
    draw(); lifecycle();
  }
  function pet() {
    walker.stop(); waveUntil = elapsed+1.6; camera.follow = true;
    say(['Hallo! Mình ở đây nè.','Mình ra bến học một chút nhé?','Học xong mình ghé hồ cá nha.'][Math.floor(Math.random()*3)],4);
    draw(); lifecycle();
  }
  function tick(now) {
    raf = 0;
    if (!assetsReady || !visible() || lowMotion()) { last = 0; return; }
    if (last && now-last < 1000/30) { raf = requestAnimationFrame(tick); return; }
    const delta = last ? Math.min((now-last)/1000,.25) : 0;
    last = now; elapsed += delta;
    const wasMoving = walker.moving;
    let remaining = delta, destination = null;
    while (remaining > 0) {
      const step = Math.min(remaining,.05);
      const arrival = walker.update(step);
      if (arrival !== null) { destination = arrival; break; }
      remaining -= step;
    }
    if (wasMoving && !walker.moving) { save(); if (!destination) hint.textContent = 'Chạm nhà hoặc bến để mở hoạt động học.'; }
    if (elapsed >= speakUntil) speech.textContent = '';
    ripples = ripples.filter(r => elapsed-r.time < 1.2);
    draw();
    if (destination) arrive(destination);
    if (visible() && !lowMotion() && !raf) raf = requestAnimationFrame(tick);
  }
  function lifecycle() {
    pauseButton.textContent = manualPause ? 'Bật chuyển động' : 'Dừng chuyển động';
    pauseButton.setAttribute('aria-pressed',String(manualPause));
    if (raf) cancelAnimationFrame(raf);
    raf = 0; last = 0;
    if (!visible()) { walker.intent = null; return; }
    if (assetsReady && !lowMotion()) raf = requestAnimationFrame(tick);
    else draw();
  }
  function openOverview() {
    walker.stop();
    if (!overview.open) overview.showModal();
    lifecycle();
  }
  buttons.forEach(button => button.addEventListener('click',() => goPlace(button.dataset.mayPlace)));
  characterTouch.addEventListener('click',pet);
  document.getElementById('mayWorldOverview').addEventListener('click',openOverview);
  document.getElementById('mayOverviewClose').addEventListener('click',() => overview.close());
  overview.addEventListener('close',() => { lifecycle(); document.getElementById('mayWorldOverview').focus(); });
  pauseButton.addEventListener('click',() => {
    manualPause = !manualPause;
    document.getElementById('mayWorldOptions').open = false;
    walker.stop(); save(); lifecycle();
  });
  document.getElementById('mayWorldCenter').addEventListener('click',() => { document.getElementById('mayWorldOptions').open = false; camera.follow = true; camera.initialized = false; say('Mình đây!',2); draw(); });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,drag:false};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>7) gesture.drag = true;
    if (gesture.drag) {
      camera.follow = false; camera.x += event.clientX-gesture.lastX; camera.y += event.clientY-gesture.lastY;
      draw();
    }
    gesture.lastX = event.clientX; gesture.lastY = event.clientY;
  });
  canvas.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.drag) {
      const point = worldPoint(event);
      const x = point.x/E.WIDTH, y = point.y/E.HEIGHT;
      const areas = [
        ['kino',.79,.32,.94,.57], ['house',.54,.08,.79,.51],
        ['fish',.79,.56,1,.87], ['study',.12,.68,.355,.87], ['today',.32,.35,.435,.52]
      ];
      const landmark = areas.find(([,left,top,right,bottom]) => x>=left && x<=right && y>=top && y<=bottom);
      if (landmark) goPlace(landmark[0]);
      else goPath(point);
    }
    gesture = null;
  });
  canvas.addEventListener('pointercancel',() => { gesture = null; });
  canvas.addEventListener('keydown',event => {
    const directions = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]};
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pet(); return; }
    const direction = directions[event.key]; if (!direction) return;
    event.preventDefault();
    goPath({x:walker.position.x+direction[0]*120,y:walker.position.y+direction[1]*120});
  });
  document.addEventListener('visibilitychange',lifecycle);
  window.addEventListener('pagehide',save);
  reduced.addEventListener('change',() => { walker.stop(); lifecycle(); });
  new ResizeObserver(resize).observe(home);
  new MutationObserver(lifecycle).observe(document.body,{attributes:true,attributeFilter:['data-hub']});
  const avatarModal = document.getElementById('catAvatarModal');
  if (avatarModal) new MutationObserver(lifecycle).observe(avatarModal,{attributes:true,attributeFilter:['class']});
  const progress = document.getElementById('todayHeroProgressRatio');
  if (progress) {
    const syncProgress = () => { document.getElementById('mayWorldProgress').textContent = progress.textContent.replace(/^Đã học:\s*/, ''); };
    new MutationObserver(syncProgress).observe(progress,{childList:true,subtree:true,characterData:true});
    syncProgress();
  }
  document.querySelectorAll('.nav-hub-btn').forEach(button => button.addEventListener('click',event => {
    if (document.body.dataset.hub !== 'today') { walker.stop(); return; }
    event.preventDefault(); event.stopImmediatePropagation();
    const destination = {study:'study',kino:'kino',library:'fish'}[button.dataset.nav];
    if (destination) goPlace(destination);
    else openOverview();
  },true));
  const loadImage = (image,src) => new Promise((resolve,reject) => { image.onload = resolve; image.onerror = reject; image.src = src; });
  Promise.all([loadImage(background,'assets/may-home-game/garden-background-flat-v3.png'),loadImage(sprites,'assets/may-home-game/may-sprites.png')]).then(() => {
    assetsReady = true; loading.hidden = true; resize(); lifecycle();
  }).catch(() => {
    loading.hidden = true;
    hint.textContent = 'Chọn địa điểm hoặc nút học để tiếp tục.';
    home.style.backgroundImage = 'url("assets/may-home-game/garden-background-flat-v3.png")';
    home.style.backgroundSize = 'cover';
    buttons.forEach(button => { button.hidden = false; });
    resize();
  });
  resize();
})();
