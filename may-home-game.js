/* Interactive home scene. Existing app controllers own all learning and collections. */
(() => {
  'use strict';
  const home = document.getElementById('mayGameHome');
  const canvas = document.getElementById('mayIslandCanvas');
  const E = window.MayHomeEngine;
  const M = window.MayHomeMotion;
  if (!home || !canvas || !E || !M) return;
  const context = canvas.getContext('2d');
  const overview = document.getElementById('mayDailyOverview');
  const speech = document.getElementById('mayWorldSpeech');
  const hint = document.getElementById('mayWorldHint');
  const characterTouch = document.getElementById('mayCharacterTouch');
  if (characterTouch) {
    characterTouch.dataset.motion = 'idle';
    characterTouch.dataset.facing = 'down';
  }
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
    house: { point: E.points.porch, label: [.62,.465], title: 'Nhà Zehn', action: () => window.openCatPickerModal?.() },
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
  let ripples = [], goalPoint = null, lastSavedPlace = saved.lastPlace || null;
  let facingDirection = 'down', hasWalked = false, lastContactCol = 0;
  const visited = saved.visited && typeof saved.visited === 'object' ? {...saved.visited} : {};
  const background = new Image(), sprites = new Image(), walkImage = new Image();
  let walkLayout = null;
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
  function stopWalk() {
    const wasMoving=walker.moving;
    walker.stop();goalPoint=null;
    if (assetsReady) {
      characterTouch.dataset.motion='idle';
      characterTouch.dataset.facing = (hasWalked && elapsed >= waveUntil) ? facingDirection : 'down';
    }
    if (wasMoving) {
      speech.textContent='';
      hint.textContent='Chạm đường để Zehn đi tới. Kéo để ngắm vườn.';
    }
  }
  function project(point) { return {x:point.x*camera.scale+camera.x,y:point.y*camera.scale+camera.y}; }
  function worldPoint(event) {
    const r = canvas.getBoundingClientRect();
    return {x:(event.clientX-r.left-camera.x)/camera.scale,y:(event.clientY-r.top-camera.y)/camera.scale};
  }
  function updateCamera(snap = false) {
    camera.scale = Math.max(width/E.WIDTH, height/E.HEIGHT);
    if (camera.follow) {
      const screenX = walker.position.x*camera.scale+camera.x;
      const left = width*.28, right = width*.72;
      let targetX = camera.x;
      if (snap || !camera.initialized) targetX = width*.5-walker.position.x*camera.scale;
      else if (screenX < left) targetX += left-screenX;
      else if (screenX > right) targetX += right-screenX;
      targetX = clamp(targetX, width-E.WIDTH*camera.scale, 0);
      const targetY = (height-E.HEIGHT*camera.scale)*.5;
      const blend = snap || !camera.initialized ? 1 : .18;
      camera.x += (targetX-camera.x)*blend;
      camera.y += (targetY-camera.y)*blend;
    }
    camera.x = clamp(camera.x, width-E.WIDTH*camera.scale, 0);
    camera.y = clamp(camera.y, height-E.HEIGHT*camera.scale, 0);
    camera.initialized = true;
  }
  function positionControls() {
    const character = project(walker.position);
    const characterHeight = SPRITE_HEIGHT*camera.scale;
    buttons.forEach(button => {
      const place = places[button.dataset.mayPlace];
      const p = project({x:place.label[0]*E.WIDTH,y:place.label[1]*E.HEIGHT});
      const outside = p.x < -35 || p.x > width+35 || p.y < 35 || p.y > height-65;
      button.hidden = outside;
      const labelWidth=button.offsetWidth||100, labelHeight=button.offsetHeight||44;
      const halfCharacter=72*camera.scale;
      if (!outside && Math.abs(p.x-character.x)<halfCharacter+labelWidth/2+8 &&
          p.y+labelHeight/2>character.y-characterHeight-8 && p.y-labelHeight/2<character.y+8) {
        const side=character.x>width/2?-1:1;
        p.x=clamp(character.x+side*(halfCharacter+labelWidth/2+18),labelWidth/2+8,width-labelWidth/2-8);
        p.y=character.y-characterHeight*.5;
      }
      if (!outside) {
        p.x = clamp(p.x, labelWidth / 2 + 8, Math.max(labelWidth / 2 + 8, width - labelWidth / 2 - 8));
        p.y = clamp(p.y, labelHeight / 2 + 8, Math.max(labelHeight / 2 + 8, height - labelHeight / 2 - 8));
      }
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
  function drawDockForeground(p) {
    // Reuse pixels from the same illustration so the front piling can hide Zehn's feet.
    if (p.y >= 829 || p.x < 1370 || p.x > 1590) return;
    context.save();
    context.beginPath();
    context.moveTo(1450,720);
    context.bezierCurveTo(1449,707,1492,707,1491,720);
    context.lineTo(1491,818);
    context.bezierCurveTo(1491,831,1450,831,1450,820);
    context.closePath();context.clip();
    context.drawImage(background,0,0,E.WIDTH,E.HEIGHT);
    context.restore();
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
    if (goalPoint && walker.moving) {
      context.strokeStyle = '#a18459';context.lineWidth=2;
      context.beginPath();context.ellipse(goalPoint.x,goalPoint.y,12,5,0,0,Math.PI*2);context.stroke();
    }
    const p = walker.position;
    context.fillStyle = '#31462729'; context.beginPath(); context.ellipse(p.x+7,p.y-1,45,12,0,0,Math.PI*2); context.fill();

    const walking = walker.moving && !lowMotion();
    const isWaving = !walking && elapsed < waveUntil;
    const isInitialFront = !hasWalked && !isWaving;

    if (walkLayout && !isWaving && !isInitialFront) {
      const rowLayout = walkLayout.rows[facingDirection] || walkLayout.rows.down;
      let frameCol;
      if (walking) {
        const gait = M.computeWalkFrame(walker.travelled, 76);
        frameCol = gait.frameCol;
        lastContactCol = gait.contactCol;
      } else {
        frameCol = lastContactCol;
      }
      const frameMeta = rowLayout.frames[frameCol] || rowLayout.frames[0];
      const scale = frameMeta.scale;
      const destW = frameMeta.sw * scale;
      const destH = frameMeta.sh * scale;
      const destX = p.x - frameMeta.anchorX * scale;
      const destY = p.y - frameMeta.anchorY * scale;

      context.drawImage(
        walkImage,
        frameMeta.sx,
        frameMeta.sy,
        frameMeta.sw,
        frameMeta.sh,
        destX,
        destY,
        destW,
        destH
      );

      characterTouch.dataset.motion = walking ? 'walking' : 'idle';
      characterTouch.dataset.facing = facingDirection;
    } else {
      const frame = isWaving ? frames[3] : frames[0];
      const spriteHeight = SPRITE_HEIGHT, spriteWidth = spriteHeight*frame.w/frame.h;
      context.save();context.translate(p.x,p.y);
      context.drawImage(sprites,frame.x,frame.y,frame.w,frame.h,-spriteWidth*frame.anchor,-spriteHeight,spriteWidth,spriteHeight);
      context.restore();

      characterTouch.dataset.motion = 'idle';
      characterTouch.dataset.facing = 'down';
    }
    drawDockForeground(p);
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
    goalPoint = null; visited[id] = true; lastSavedPlace = id; save();
    hint.textContent = 'Chạm đường để Zehn đi tới. Kéo để ngắm vườn.';
    say(`Đến ${place.title.toLowerCase()} rồi!`,2.5);
    place.action();
    draw(); lifecycle();
  }
  function goPlace(id) {
    const place = places[id]; if (!place) return;
    waveUntil = 0;
    camera.follow = true;
    goalPoint = place.point;
    hint.textContent = `Zehn đang đi tới ${place.title.toLowerCase()}…`;
    say('Đi cùng mình nhé!',2);
    const prevX = walker.position.x, prevY = walker.position.y;
    walker.go(place.point,id,lowMotion() || !assetsReady);
    if (!walker.moving) {
      const dx = walker.position.x - prevX, dy = walker.position.y - prevY;
      if (Math.hypot(dx, dy) > 1e-4) {
        hasWalked = true;
        facingDirection = M.resolveDirectionFromVector(dx, dy, facingDirection);
      }
      const intent = walker.update(0);
      if (intent) arrive(intent);
    }
    draw(); lifecycle();
  }
  function goPath(point) {
    const path = E.project(point);
    if (path.distance > 95) {
      ripples.push({...point,time:elapsed});
      say('Mình đi trên lối nhỏ nhé.',2.5); draw(); return;
    }
    waveUntil = 0;
    camera.follow = true;
    goalPoint = path.point;
    const prevX = walker.position.x, prevY = walker.position.y;
    walker.go(path.point,null,lowMotion());
    if (!walker.moving) {
      const dx = walker.position.x - prevX, dy = walker.position.y - prevY;
      if (Math.hypot(dx, dy) > 1e-4) {
        hasWalked = true;
        facingDirection = M.resolveDirectionFromVector(dx, dy, facingDirection);
      }
      save();
    }
    hint.textContent = 'Chọn nhà hoặc bến để vào học.';
    draw(); lifecycle();
  }
  function pet() {
    stopWalk(); waveUntil = elapsed+1.6; camera.follow = true;
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
      const prevX = walker.position.x, prevY = walker.position.y;
      const arrival = walker.update(step);
      const stepDx = walker.position.x - prevX;
      const stepDy = walker.position.y - prevY;
      const stepDist = Math.hypot(stepDx, stepDy);
      if (stepDist > 1e-4) {
        hasWalked = true;
        facingDirection = M.resolveDirectionFromVector(stepDx, stepDy, facingDirection);
      }
      if (arrival !== null) { destination = arrival; break; }
      remaining -= step;
    }
    if (wasMoving && !walker.moving) { goalPoint = null; save(); if (!destination) hint.textContent = 'Chạm nhà hoặc bến để mở hoạt động học.'; }
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
    if (!visible()) { stopWalk(); return; }
    if (assetsReady && !lowMotion()) raf = requestAnimationFrame(tick);
    else draw();
  }
  function openOverview() {
    stopWalk();
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
    stopWalk(); save(); lifecycle();
  });
  document.getElementById('mayWorldCenter').addEventListener('click',() => { document.getElementById('mayWorldOptions').open = false; camera.follow = true; camera.initialized = false; say('Mình đây!',2); draw(); });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,drag:false};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.drag && Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>7) {
      gesture.drag = true; stopWalk();
      hint.textContent = 'Kéo để ngắm vườn. Chạm một địa điểm để Zehn đi tới.';
    }
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
  // Main navigation remains immediate. Only choosing a place inside the garden starts a walk.
  document.querySelectorAll('.nav-hub-btn').forEach(button => button.addEventListener('click',() => {
    stopWalk();
    if (button.dataset.nav==='today') { camera.follow=true;camera.initialized=false;draw(); }
  },true));
  const loadImage = (image,src) => new Promise((resolve,reject) => { image.onload = resolve; image.onerror = reject; image.src = src; });
  const loadManifest = (url) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to load sprite manifest: ' + r.status);
    return r.json();
  });
  Promise.all([
    loadImage(background,'assets/may-home-game/garden-background-flat-v3.png'),
    loadImage(sprites,'assets/may-home-game/may-sprites.png'),
    loadImage(walkImage,'assets/may-home-game/may-walk-directions-v1.png'),
    loadManifest('assets/may-home-game/may-walk-directions-v1.json')
  ]).then(([, , , manifestData]) => {
    walkLayout = M.buildSheetLayoutFromMeasuredManifest(manifestData, { targetWorldHeight: SPRITE_HEIGHT });
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
