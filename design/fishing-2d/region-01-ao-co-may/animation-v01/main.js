/**
 * Ao Cỏ May — Hoạt Ảnh 2D Mèo Chợ Câu Cá (v01)
 * Prototype 2D Cutout Animation
 */

(function () {
  'use strict';

  // Canvas & Context
  const canvas = document.getElementById('fishingCanvas');
  const ctx = canvas.getContext('2d');

  // UI Elements
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const critterStatus = document.getElementById('critterStatus');
  const canvasBanner = document.getElementById('canvasBanner');
  const timelineSlider = document.getElementById('timelineSlider');
  const timeDisplay = document.getElementById('timeDisplay');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const playText = document.getElementById('playText');
  const btnShowcase = document.getElementById('btnShowcase');
  const btnAmbient = document.getElementById('btnAmbient');
  const btnDragonfly = document.getElementById('btnDragonfly');
  const btnCatch = document.getElementById('btnCatch');
  const chkReducedMotion = document.getElementById('chkReducedMotion');

  // Rig Configuration (Target Canvas: 1672 x 941)
  const CANVAS_WIDTH = 1672;
  const CANVAS_HEIGHT = 941;

  // Base Rig Transform Specifications
  const RIG = {
    raft: { x: 910, y: 460, w: 600, h: 240, pivotX: 0.5, pivotY: 0.5 },
    basket: { relX: 165, relY: -20, w: 125, h: 127, pivotX: 0.5, pivotY: 0.8 },
    bait: { relX: 130, relY: 30, w: 45, h: 50, pivotX: 0.5, pivotY: 0.8 },
    tail: { relX: 52, relY: -18, w: 100, h: 110, pivotX: 0.15, pivotY: 0.75 },
    body: { relX: -25, relY: -20, w: 180, h: 169, pivotX: 0.5, pivotY: 0.85 },
    footLeft: { relX: -65, relY: 13, w: 100, h: 86, pivotX: 0.6, pivotY: 0.3 },
    footRight: { relX: 20, relY: 25, w: 96, h: 90, pivotX: 0.35, pivotY: 0.3 },
    head: { relX: -35, relY: -168, w: 229, h: 195, pivotX: 0.5, pivotY: 0.88 },
    armLeft: { relX: -89, relY: -137 },
    armRight: { relX: 18, relY: -137 },
    rod: { relX: -60, relY: -83, w: 270, h: 191, pivotX: 0.94, pivotY: 0.92 },
    bobberBase: { x: 643, y: 540 },
    dragonfly: { w: 48, h: 45, pivotX: 0.5, pivotY: 0.5 }
  };

  // Asset Loader
  const ASSET_NAMES = [
    'background', 'head', 'body', 'arm-left', 'arm-right',
    'tail', 'foot-left', 'foot-right', 'raft', 'basket',
    'rod', 'bait', 'dragonfly'
  ];

  const images = {};
  let assetsLoaded = false;
  let loadErrors = 0;

  function loadAssets(callback) {
    let loadedCount = 0;
    ASSET_NAMES.forEach(name => {
      const img = new Image();
      img.src = `assets/${name}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === ASSET_NAMES.length) {
          assetsLoaded = true;
          if (callback) callback();
        }
      };
      img.onerror = () => {
        loadErrors++;
        console.error(`Không thể nạp tài nguyên: assets/${name}.png`);
      };
      images[name] = img;
    });
  }

  // State Management
  let isPlaying = true;
  let mode = 'showcase'; // 'showcase' | 'ambient'
  let currentTime = 0; // seconds
  let lastTimestamp = 0;
  let reducedMotion = false;

  // Ambient Mode State
  let ambientTime = 0;
  let ambientCritterTimer = 5.0; // first dragonfly appears after 5s
  let ambientCritterActive = false;
  let ambientCritterType = null;
  let ambientCritterTime = 0;
  let ambientCritterDuration = 8.0;
  let ambientCritterPathIdx = 0;

  // Catch Action Trigger State (for ambient / manual trigger)
  let catchTriggered = false;
  let catchTime = 0;
  const CATCH_DURATION = 6.0;

  // Ambient swimming fish shadows
  const ambientFish = [
    { x: 200, y: 680, speed: 25, length: 50, phase: 0 },
    { x: 1200, y: 780, speed: -20, length: 65, phase: 1.8 }
  ];

  // Ripple particles for water
  const ripples = [];
  function addRipple(x, y, maxR = 25, duration = 1.6, alpha = 0.5) {
    ripples.push({ x, y, r: 2, maxR, duration, life: 0, alpha });
  }

  // Droplet splash particles
  const droplets = [];
  function addSplash(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 0.2) + Math.random() * (Math.PI * 0.6);
      const speed = 60 + Math.random() * 90;
      droplets.push({
        x, y,
        vx: Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1) * (speed * 0.5),
        vy: -Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3
      });
    }
  }

  // Easing Functions
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInCubic(t) {
    return t * t * t;
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function bodyPoint(x, y, pose) {
    const dx = (x - RIG.body.relX) * pose.bodyScaleX;
    const dy = (y - RIG.body.relY) * pose.bodyScaleY;
    return {x:RIG.body.relX + dx*Math.cos(pose.bodyRot)-dy*Math.sin(pose.bodyRot),
      y:RIG.body.relY + pose.bodyYOffset + dx*Math.sin(pose.bodyRot)+dy*Math.cos(pose.bodyRot)};
  }
  function rodLocalPoint(x, y, pose) {
    return {x:RIG.rod.relX+x*Math.cos(pose.rodRot)-y*Math.sin(pose.rodRot),
      y:RIG.rod.relY+x*Math.sin(pose.rodRot)+y*Math.cos(pose.rodRot)};
  }
  function rodWorldTip(pose) {
    const p = rodLocalPoint(-RIG.rod.w*.895, -RIG.rod.h*.72, pose);
    return {x:pose.raftX+p.x*Math.cos(pose.raftRot)-p.y*Math.sin(pose.raftRot),
      y:pose.raftY+p.x*Math.sin(pose.raftRot)+p.y*Math.cos(pose.raftRot)};
  }
  function drawAttachedArm(asset, shoulder, grip, width) {
    const dx=grip.x-shoulder.x, dy=grip.y-shoulder.y;
    const height=Math.hypot(dx,dy)/.80;
    ctx.save(); ctx.translate(shoulder.x,shoulder.y);
    ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);
    ctx.drawImage(images[asset],-width/2,-height*.10,width,height);
    ctx.restore();
  }

  // Animation Pose Computation
  function computePose(t, isShowcase) {
    const pose = {
      time:t,
      // Raft
      raftX: RIG.raft.x,
      raftY: RIG.raft.y,
      raftRot: 0,

      // Body & Limbs
      bodyScaleY: 1.0,
      bodyScaleX: 1.0,
      bodyRot: 0,
      bodyYOffset: 0,

      headRot: 0,
      headYOffset: 0,
      tailRot: 0,

      armLeftRot: 0,
      armRightRot: 0,
      rodRot: 0,
      rodBend: 0,

      basketWobble: 0,

      // Face expressions
      blink: 0,
      gazeX: -2,
      gazeY: 3,
      eyebrowY: 0,
      mouthShape: 'neutral', // 'neutral' | 'open_happy' | 'surprised' | 'sleepy'
      eyeStyle: 'open',      // 'open' | 'happy' | 'closed'
      blushAlpha: 0.65,
      whiskersTwitch: 0,

      // Bobber & Line
      bobberX: RIG.bobberBase.x,
      bobberY: RIG.bobberBase.y,
      bobberDip: 0,

      // Critter
      dragonflyVisible: false,
      dragonflyX: -100,
      dragonflyY: -100,
      dragonflyRot: 0,
      dragonflyWingScale: 1.0,

      // Fish
      fishVisible: false,
      fishX: 0,
      fishY: 0,
      fishRot: 0,
      fishScale: 1.0,

      phase: 'quiet'
    };

    const motionScale = reducedMotion ? 0 : 1.0;

    // 1. Natural Base Idles (Raft bobbing, breathing, tail sway)
    const raftBob = Math.sin(t * 1.5) * 3.5 * motionScale;
    const raftTilt = Math.cos(t * 1.4) * 0.012 * motionScale;
    pose.raftY += raftBob;
    pose.raftRot = raftTilt;

    // Breathing cycle (~2.8s period)
    const breath = Math.sin(t * 2.24);
    pose.bodyScaleY = 1.0 + breath * 0.018 * motionScale;
    pose.bodyScaleX = 1.0 - breath * 0.009 * motionScale;
    pose.headYOffset = Math.sin(t * 2.24 - 0.4) * 1.5 * motionScale;

    // Tail gentle sway
    pose.tailRot = Math.sin(t * 1.3) * 0.09 * motionScale;

    // Bobber gentle water bob
    pose.bobberY += Math.sin(t * 1.7) * 2.5 * motionScale;

    // 2. Timeline Sequences
    if (isShowcase) {
      // 20s Showcase Sequence
      const loopTime = t % 20.0;

      if (loopTime < 3.5) {
        // [0.0 - 3.5s] Phase: Yên tĩnh, thở đều, chớp mắt nhẹ
        pose.phase = 'quiet';
        // Blink at t=2.0s
        if (loopTime >= 1.8 && loopTime <= 2.2) {
          const bt = (loopTime - 1.8) / 0.4;
          pose.blink = Math.sin(bt * Math.PI);
        }
        // Occasional ear twitch
        if (loopTime >= 2.6 && loopTime <= 2.9) {
          pose.whiskersTwitch = Math.sin((loopTime - 2.6) / 0.3 * Math.PI) * 2;
        }
      } else if (loopTime < 7.5) {
        // [3.5 - 7.5s] Phase: Chuồn chuồn ghé ngọn cần
        pose.phase = 'dragonfly_visit';
        pose.dragonflyVisible = true;
        const dfT = loopTime - 3.5; // 0..4.0s

        // High speed wing flutter (35 Hz)
        pose.dragonflyWingScale = .62 + Math.sin(t * 80) * .32;

        const {x:rodTipX,y:rodTipY}=rodWorldTip(pose);

        if (dfT < 2.0) {
          // Approaching along a curved bezier path
          const p = easeInOutQuad(dfT / 2.0);
          // Path from top-left (150, 60) to rodTip (646, 264)
          const startX = 180, startY = 70;
          const ctrlX = 380, ctrlY = 120;
          pose.dragonflyX = (1 - p) * (1 - p) * startX + 2 * (1 - p) * p * ctrlX + p * p * rodTipX;
          pose.dragonflyY = (1 - p) * (1 - p) * startY + 2 * (1 - p) * p * ctrlY + p * p * rodTipY;
          pose.dragonflyRot = Math.atan2(rodTipY - startY, rodTipX - startX) * 0.4;

          // Cat tracks dragonfly with eyes and slight head tilt
          if (dfT > 0.8) {
            const trackT = (dfT - 0.8) / 1.2;
            pose.gazeX = -4 + trackT * -2;
            pose.gazeY = -3 + trackT * -1;
            pose.headRot = easeInOutQuad(trackT) * -0.07 * motionScale;
          }
        } else {
          pose.dragonflyWingScale=.94;
          // Perching on rod tip with micro hovering adjustments
          pose.dragonflyX = rodTipX + Math.sin(dfT * 12) * 1.5;
          pose.dragonflyY = rodTipY + Math.cos(dfT * 10) * 1.2;
          pose.dragonflyRot = 0.05 + Math.sin(dfT * 4) * 0.03;

          // Rod flexes slightly under landing
          if (dfT < 2.5) {
            pose.rodRot = Math.sin((dfT - 2.0) * Math.PI * 4) * 0.015 * motionScale;
          }

          // Cat is curious, gaze locked on rod tip
          pose.headRot = -0.07 * motionScale;
          pose.gazeX = -6;
          pose.gazeY = -4;
          pose.eyebrowY = -2;
          pose.mouthShape = 'neutral';
        }
      } else if (loopTime < 9.5) {
        // [7.5 - 9.5s] Phase: Chuồn chuồn rời đi
        pose.phase = 'dragonfly_leave';
        pose.dragonflyVisible = true;
        const dfT = loopTime - 7.5; // 0..2.0s
        pose.dragonflyWingScale = .62 + Math.sin(t * 80) * .32;

        const {x:rodTipX,y:rodTipY}=rodWorldTip(pose);
        const exitX = 1750, exitY = 160;
        const ctrlX = 1100, ctrlY = 80;

        const p = easeInCubic(dfT / 2.0);
        pose.dragonflyX = (1 - p) * (1 - p) * rodTipX + 2 * (1 - p) * p * ctrlX + p * p * exitX;
        pose.dragonflyY = (1 - p) * (1 - p) * rodTipY + 2 * (1 - p) * p * ctrlY + p * p * exitY;
        pose.dragonflyRot = Math.atan2(exitY - rodTipY, exitX - rodTipX) * 0.6;

        // Cat watches it fly away then returns head to center
        if (dfT < 1.2) {
          pose.headRot = (-0.07 + (dfT / 1.2) * 0.12) * motionScale;
          pose.gazeX = 4;
          pose.gazeY = -3;
        } else {
          const returnT = (dfT - 1.2) / 0.8;
          pose.headRot = (0.05 * (1 - returnT)) * motionScale;
          pose.gazeX = -2;
          pose.gazeY = 3;
        }
      } else if (loopTime < 12.0) {
        // [9.5 - 12.0s] Phase: Ngồi thảnh thơi, hát vu vơ / buồn ngủ
        pose.phase = 'sleepy_hum';
        const humT = loopTime - 9.5;
        // Head rhythmically sways to hum
        pose.headRot = Math.sin(humT * 2.5) * 0.04 * motionScale;
        pose.eyeStyle = 'happy'; // cute happy closed curved eyes
        pose.mouthShape = humT<1.1 ? 'surprised' : 'sleepy';
        if(humT>1.1) {pose.eyeStyle='closed';pose.blink=.75;pose.headYOffset+=Math.sin((humT-1.1)*Math.PI/1.4)*4*motionScale;}
        pose.tailRot = Math.sin(humT * 2.5) * 0.08 * motionScale;
      } else if (loopTime < 13.0) {
        // [12.0 - 13.0s] Phase: Cá nhử mồi! Phao giật nhẹ
        pose.phase = 'bite_warning';
        const biteT = loopTime - 12.0;

        // Bobber sharp twitch down
        const dip = Math.sin(biteT * Math.PI * 6) * Math.exp(-biteT * 3) * 12;
        pose.bobberDip = Math.max(0, dip);
        pose.bobberY += pose.bobberDip;

        // Cat is surprised! Alert eyes open wide
        pose.eyeStyle = 'open';
        pose.mouthShape = 'surprised';
        pose.eyebrowY = -4;
        pose.gazeX = -4;
        pose.gazeY = 4;
        pose.headRot = 0.03 * motionScale;
      } else if (loopTime < 14.5) {
        // [13.0 - 14.5s] Phase: Cá cắn mạnh, giằng co lấy đà
        pose.phase = 'tug_anticipation';
        const tugT = loopTime - 13.0; // 0..1.5s

        // Bobber pulled down
        pose.bobberDip = 18 + Math.sin(tugT * 12) * 4;
        pose.bobberY += pose.bobberDip;

        // Cat leans forward, rod bends down
        const lean = easeInOutQuad(Math.min(1, tugT / 0.8));
        pose.bodyYOffset = lean * 6;
        pose.bodyRot = lean * -0.06 * motionScale;
        pose.headRot = lean * -0.08 * motionScale;
        pose.rodRot = lean * 0.12 * motionScale;
        pose.rodBend = lean * 10;
        pose.armLeftRot = lean * 0.08;
        pose.armRightRot = lean * 0.08;
        pose.mouthShape = 'surprised';
        pose.eyebrowY = -3;
      } else if (loopTime < 16.5) {
        // [14.5 - 16.5s] Phase: Giật cần, cá bay vào sọt!
        pose.phase = 'catch_pull';
        const catchT = loopTime - 14.5; // 0..2.0s

        // Rod pulls back up swiftly
        if (catchT < 0.6) {
          const pullP = easeOutCubic(catchT / 0.6);
          pose.rodRot = (0.12 - pullP * 0.32) * motionScale;
          pose.bodyRot = (-0.06 + pullP * 0.12) * motionScale;
          pose.headRot = (-0.08 + pullP * 0.14) * motionScale;
        } else {
          pose.rodRot = -0.20 * motionScale;
          pose.bodyRot = 0.06 * motionScale;
          pose.headRot = 0.06 * motionScale;
        }

        // Fish parabolic arc from water to basket
        // Water start: (643, 540) -> Basket target: (1060, 412)
        if (catchT >= 0.2 && catchT <= 1.5) {
          pose.fishVisible = true;
          const fishP = (catchT - 0.2) / 1.3;
          const arcStartX = 643, arcStartY = 530;
          const arcApexX = 850, arcApexY = 130; // peak of arc
          const arcEndX = 1075, arcEndY = 350;

          // Parabolic Bezier
          const inv = 1 - fishP;
          pose.fishX = inv * inv * arcStartX + 2 * inv * fishP * arcApexX + fishP * fishP * arcEndX;
          pose.fishY = inv * inv * arcStartY + 2 * inv * fishP * arcApexY + fishP * fishP * arcEndY;
          pose.fishRot = -.65+fishP*1.25+Math.sin(fishP*Math.PI*4)*.14;
          pose.fishScale=1-.82*easeInOutQuad(clamp((fishP-.84)/.16,0,1)); // flip in air

          // Cat gaze tracks fish
          pose.gazeX = (pose.fishX - 875) / 50;
          pose.gazeY = (pose.fishY - 272) / 40;
        }

        // Basket wobble when fish lands at catchT ≈ 1.5
        if (catchT >= 1.4) {
          const wobT = (catchT - 1.4);
          pose.basketWobble = Math.sin(wobT * Math.PI * 8) * Math.exp(-wobT * 4) * 8 * motionScale;
        }

        pose.mouthShape = 'open_happy';
        pose.eyeStyle = 'happy';
      } else if (loopTime < 18.5) {
        // [16.5 - 18.5s] Phase: Ăn mừng, cười rạng rỡ với người xem
        pose.phase = 'celebrate';
        const celT = loopTime - 16.5;
        pose.rodRot=-.20*motionScale;
        pose.bodyRot=.06*motionScale;
        pose.eyeStyle = 'happy';
        pose.mouthShape = 'open_happy';
        pose.headRot = (.06+Math.sin(celT*4)*.025)*motionScale;
        pose.bodyScaleY = 1.0 + Math.sin(celT * 6) * 0.02 * motionScale;
        pose.tailRot = Math.sin(celT * 8) * 0.22 * motionScale;
        pose.gazeX = 0;
        pose.gazeY = 0;
        pose.blushAlpha = 0.85; // extra blushing
      } else {
        // [18.5 - 20.0s] Phase: Thu cần, trở về trạng thái nghỉ
        pose.phase = 'settle';
        const setT = (loopTime - 18.5) / 1.5;
        const p = easeInOutQuad(setT);
        pose.rodRot = (-0.20 * (1 - p)) * motionScale;
        pose.bodyRot = (0.06 * (1 - p)) * motionScale;
        pose.headRot = (0.06 * (1 - p)) * motionScale;
        pose.eyeStyle = 'open';
        pose.mouthShape = 'neutral';
        pose.gazeX = -2;
        pose.gazeY = 3;
      }
    } else {
      // Ambient Autonomous Mode
      pose.phase = 'ambient';

      // Random natural blinking every ~4 seconds
      const bucket=Math.floor(t/11), cycle=t%11;
      for(const at of [1.9+(bucket%3)*.21,6.1,6.43+(bucket%2)*.13]) {
        const distance=Math.abs(cycle-at);
        if(distance<.15) pose.blink=Math.max(pose.blink,1-easeInOutQuad(distance/.15));
      }

      // Handle manual catch action if active
      if (catchTriggered) {
        const ct = t - catchTime;
        if (ct < CATCH_DURATION) {
          if (ct < 1.0) {
            pose.bobberDip = Math.sin(ct * 12) * 15;
            pose.bobberY += pose.bobberDip;
            pose.eyeStyle = 'open';
            pose.mouthShape = 'surprised';
          } else if (ct < 2.5) {
            const pullP = (ct - 1.0) / 1.5;
            pose.rodRot = -0.2 * motionScale;
            pose.fishVisible = true;
            const inv = 1 - pullP;
            pose.fishX = inv * inv * 643 + 2 * inv * pullP * 850 + pullP * pullP * 1075;
            pose.fishY = inv * inv * 530 + 2 * inv * pullP * 130 + pullP * pullP * 350;
            pose.fishRot=-.65+pullP*1.25+Math.sin(pullP*Math.PI*4)*.14;
            pose.fishScale=1-.82*easeInOutQuad(clamp((pullP-.84)/.16,0,1));
            pose.mouthShape = 'open_happy';
          } else if (ct < 4.5) {
            pose.eyeStyle = 'happy';
            pose.mouthShape = 'open_happy';
            pose.tailRot = Math.sin(ct * 8) * 0.22 * motionScale;
          } else {
            catchTriggered = false;
          }
        } else {
          catchTriggered = false;
        }
      }

      // Handle ambient critter (dragonfly)
      if (ambientCritterActive) {
        const dt = t - ambientCritterTime;
        if (dt < ambientCritterDuration) {
          pose.dragonflyVisible = true;
          pose.dragonflyWingScale = .62 + Math.sin(t * 80) * .32;

          const {x:rodTipX,y:rodTipY}=rodWorldTip(pose);

          if (dt < 2.5) {
            const p = easeInOutQuad(dt / 2.5);
            const starts=[[-70,270],[1750,180],[-70,600]];
            const [sx,sy]=starts[ambientCritterPathIdx%3];
            const cx=(sx+rodTipX)*.5, cy=Math.min(sy,rodTipY)-100;
            pose.dragonflyX=(1-p)*(1-p)*sx+2*(1-p)*p*cx+p*p*rodTipX;
            pose.dragonflyY=(1-p)*(1-p)*sy+2*(1-p)*p*cy+p*p*rodTipY;
            pose.gazeX = -5;
            pose.gazeY = -3;
          } else if (dt < 5.5) {
            pose.dragonflyWingScale=.94;
            // Perch on rod
            pose.dragonflyX = rodTipX + Math.sin(dt * 8) * 1.5;
            pose.dragonflyY = rodTipY + Math.cos(dt * 7) * 1.2;
            pose.headRot = -0.06 * motionScale;
            pose.gazeX = -6;
            pose.gazeY = -4;
          } else {
            const p = easeInCubic((dt - 5.5) / 2.5);
            const ex=ambientCritterPathIdx%2 ? -80:1750;
            pose.dragonflyX=(1-p)*(1-p)*rodTipX+2*(1-p)*p*((rodTipX+ex)*.5)+p*p*ex;
            pose.dragonflyY=(1-p)*(1-p)*rodTipY+2*(1-p)*p*60+p*p*170;
          }
        } else {
          ambientCritterActive = false;
          ambientCritterTimer = 20 + Math.random() * 25; // 20-40s cooldown
        }
      }
    }

    // Positive Canvas rotation lifts a left-facing branch; reuse authored effort timing.
    pose.rodRot=-pose.rodRot;
    if (pose.phase==='dragonfly_visit' && t%20>=5.5) {
      const tip=rodWorldTip(pose);pose.dragonflyX=tip.x;pose.dragonflyY=tip.y-6;
    }
    if(reducedMotion) {pose.dragonflyVisible=false;pose.fishVisible=false;pose.bobberY=RIG.bobberBase.y;pose.basketWobble=0;pose.bodyYOffset=0;pose.bobberDip=0;}
    return pose;
  }

  // Draw Functions
  // Rendering depends only on pose time; paused and scrubbed frames remain identical.
  function drawRipples(pose) {
    const t = reducedMotion ? 0 : pose.time;
    ctx.save(); ctx.lineWidth=1.8;
    for(let i=0;i<3;i++) {
      const phase=(t*.48+i/3)%1;
      ctx.strokeStyle=`rgba(245,255,250,${.52*(1-phase)})`;
      ctx.beginPath(); ctx.ellipse(pose.bobberX,pose.bobberY+6,13+phase*41,4+phase*12,0,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
  function drawDroplets(pose) {
    if(reducedMotion) return;
    const age=mode==='showcase' ? pose.time%20-14.72 : pose.time-catchTime-1;
    if(age<0 || age>.8 || (mode==='ambient' && !catchTriggered)) return;
    ctx.save(); ctx.fillStyle=`rgba(245,255,255,${.75*(1-age/.8)})`;
    for(let i=0;i<8;i++) {
      const vx=Math.cos(i*2.399)*72, vy=-65-(i%4)*22;
      ctx.beginPath();ctx.ellipse(643+vx*age,535+vy*age+100*age*age,2,3,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawAmbientFish(time) {
    const t=reducedMotion?0:time;
    ctx.save();ctx.fillStyle='rgba(24,120,110,.15)';
    ambientFish.forEach(fish=>{
      const span=CANVAS_WIDTH+200;
      const x=((fish.x+100+fish.speed*t)%span+span)%span-100;
      const phase=fish.phase+t*2.3;
      ctx.save();ctx.translate(x,fish.y+Math.sin(phase)*5);
      if(fish.speed<0) ctx.scale(-1,1);
      ctx.beginPath();ctx.ellipse(0,0,fish.length*.5,fish.length*.22,0,0,Math.PI*2);ctx.fill();
      const wag=Math.sin(phase*2)*3;
      ctx.beginPath();ctx.moveTo(-fish.length*.45,0);ctx.lineTo(-fish.length*.7,-fish.length*.25+wag);ctx.lineTo(-fish.length*.7,fish.length*.25+wag);ctx.closePath();ctx.fill();ctx.restore();
    });ctx.restore();
  }

  function drawFaceFeatures(headX, headY, headW, headH, pose) {
    ctx.save();
    ctx.translate(headX, headY);

    // Coordinate system: center of head is roughly (0, -headH * 0.38)
    const centerX = 0;
    const centerY = -headH * 0.38;

    // 1. Painted Peach Cheeks (Flat circles, no 3D muzzle)
    ctx.fillStyle = `rgba(248, 168, 142, ${pose.blushAlpha})`;
    ctx.beginPath();
    ctx.ellipse(centerX - 82, centerY + 30, 20, 13, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 68, centerY + 30, 20, 13, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 2. Whiskers (3 on each cheek, brown warm lines)
    ctx.strokeStyle = '#4a342a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    const twitch = pose.whiskersTwitch || 0;

    // Left whiskers
    [[-12, -8], [0, 0], [12, 8]].forEach(([dy1, dy2], idx) => {
      ctx.beginPath();
      ctx.moveTo(centerX - 92, centerY + 30 + dy1);
      ctx.lineTo(centerX - 132, centerY + 30 + dy2 + twitch);
      ctx.stroke();
    });

    // Right whiskers
    [[-12, -8], [0, 0], [12, 8]].forEach(([dy1, dy2], idx) => {
      ctx.beginPath();
      ctx.moveTo(centerX + 78, centerY + 30 + dy1);
      ctx.lineTo(centerX + 118, centerY + 30 + dy2 + twitch);
      ctx.stroke();
    });

    // 3. Eyes & Blinking
    const leftEyeX = centerX - 46;
    const rightEyeX = centerX + 36;
    const eyeY = centerY + 8;
    const eyeRadiusX = 8.5;
    const eyeRadiusY = 13.5;

    if (pose.eyeStyle === 'closed') {
      ctx.strokeStyle='#4a342a';ctx.lineWidth=2.4;
      [leftEyeX,rightEyeX].forEach(x=>{ctx.beginPath();ctx.moveTo(x-8,eyeY);ctx.quadraticCurveTo(x,eyeY+4,x+8,eyeY);ctx.stroke();});
    } else if (pose.eyeStyle === 'happy') {
      // Happy closed eyes (^ ^)
      ctx.strokeStyle = '#2b1d17';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY + 4, 10, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rightEyeX, eyeY + 4, 10, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      // Open eyes with gaze offset & eyelid squish
      const openRatio = 1.0 - pose.blink;
      const rY = Math.max(1.5, eyeRadiusY * openRatio);

      [leftEyeX, rightEyeX].forEach((baseEyeX, idx) => {
        const ex=baseEyeX+pose.gazeX*.8;
        const pupilY=eyeY+pose.gazeY*.55;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(ex, pupilY, eyeRadiusX, rY, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2b1d17';
        ctx.fill();

        // White sparkle highlight (tracks top right)
        if (openRatio > 0.4) {
          const sparkX = ex + 2.5;
          const sparkY = pupilY - 3.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 3.2, 0, Math.PI * 2);
          ctx.fill();

          // Tiny secondary sparkle
          ctx.beginPath();
          ctx.arc(sparkX - 3.8, sparkY + 5.2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    if(pose.eyebrowY<0 && pose.eyeStyle==='open') {
      ctx.strokeStyle='#8e5739';ctx.lineWidth=1.8;
      [leftEyeX,rightEyeX].forEach(x=>{ctx.beginPath();ctx.moveTo(x-7,eyeY-18+pose.eyebrowY);ctx.quadraticCurveTo(x,eyeY-22+pose.eyebrowY,x+7,eyeY-18+pose.eyebrowY);ctx.stroke();});
    }
    // 4. Coral Nose
    ctx.fillStyle = '#de6363';
    ctx.beginPath();
    ctx.ellipse(centerX - 4, centerY + 18, 4.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Mouth
    ctx.strokeStyle = '#3e2a22';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    if (pose.mouthShape === 'open_happy') {
      // Open mouth showing pink tongue (^o^)
      ctx.fillStyle = '#5e2920';
      ctx.beginPath();
      ctx.arc(centerX - 4, centerY + 26, 8, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pink tongue
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX - 4, centerY + 26, 8, 0, Math.PI);
      ctx.clip();
      ctx.fillStyle = '#f48b99';
      ctx.beginPath();
      ctx.arc(centerX - 4, centerY + 30, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (pose.mouthShape === 'surprised' || pose.mouthShape === 'sleepy') {
      // Small surprised 'o'
      ctx.fillStyle = '#5e2920';
      ctx.beginPath();
      ctx.ellipse(centerX - 4, centerY + 28, 4.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Neutral cute cat 'w' smile
      ctx.beginPath();
      // Left curve
      ctx.arc(centerX - 9, centerY + 25, 5.5, 0.1, Math.PI * 0.95);
      ctx.stroke();
      // Right curve
      ctx.beginPath();
      ctx.arc(centerX + 1, centerY + 25, 5.5, 0.05, Math.PI * 0.9);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawFish(x, y, rot, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    // Body
    ctx.fillStyle = '#65b2d6';
    ctx.strokeStyle = '#2b5066';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly
    ctx.fillStyle = '#e8f4f8';
    ctx.beginPath();
    ctx.ellipse(2, 4, 18, 6, 0, 0, Math.PI);
    ctx.fill();

    // Tail fin
    ctx.fillStyle = '#f5c85b';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-34, -10);
    ctx.lineTo(-28, 0);
    ctx.lineTo(-34, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute eye
    ctx.fillStyle = '#1c2830';
    ctx.beginPath();
    ctx.arc(14, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(15, -4, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Master Render Frame
  function renderFrame(pose) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Background
    if (images.background) {
      ctx.drawImage(images.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 2. Ambient swimming fish shadows
    drawAmbientFish(pose.time);

    // 3. Raft Soft Shadow on Water
    ctx.save();
    ctx.fillStyle = 'rgba(20, 75, 70, 0.25)';
    ctx.beginPath();
    ctx.ellipse(pose.raftX + 15, pose.raftY + 45, 290, 75, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Raft Transform Group (Cat & Props sit on raft)
    ctx.save();
    ctx.translate(pose.raftX, pose.raftY);
    ctx.rotate(pose.raftRot);

    // A. Raft Logs
    if (images.raft) {
      ctx.drawImage(images.raft, -RIG.raft.w * 0.5, -RIG.raft.h * 0.5, RIG.raft.w, RIG.raft.h);
    }

    // B. Tail (behind body & basket)
    ctx.save();
    ctx.translate(RIG.tail.relX, RIG.tail.relY);
    ctx.rotate(pose.tailRot);
    if (images.tail) {
      ctx.drawImage(images.tail, -RIG.tail.w * RIG.tail.pivotX, -RIG.tail.h * RIG.tail.pivotY, RIG.tail.w, RIG.tail.h);
    }
    ctx.restore();

    // C. Woven Fish Basket
    ctx.save();
    ctx.translate(RIG.basket.relX, RIG.basket.relY);
    ctx.rotate(pose.basketWobble * 0.018);
    if (images.basket) {
      ctx.drawImage(images.basket, -RIG.basket.w * RIG.basket.pivotX, -RIG.basket.h * RIG.basket.pivotY, RIG.basket.w, RIG.basket.h);
    }
    ctx.restore();

    // D. Bait Tin with Worm
    ctx.save();
    ctx.translate(RIG.bait.relX, RIG.bait.relY);
    if (images.bait) {
      ctx.drawImage(images.bait, -RIG.bait.w * RIG.bait.pivotX, -RIG.bait.h * RIG.bait.pivotY, RIG.bait.w, RIG.bait.h);
    }
    ctx.restore();

    // E. Cat Body (Torso with apron & scarf)
    ctx.save();
    ctx.translate(RIG.body.relX, RIG.body.relY + pose.bodyYOffset);
    ctx.rotate(pose.bodyRot);
    ctx.scale(pose.bodyScaleX, pose.bodyScaleY);
    if (images.body) {
      ctx.drawImage(images.body, -RIG.body.w * RIG.body.pivotX, -RIG.body.h * RIG.body.pivotY, RIG.body.w, RIG.body.h);
    }
    ctx.restore();

    // F. Cat Feet (resting on raft log)
    if (images['foot-left']) {
      ctx.save();
      ctx.translate(RIG.footLeft.relX, RIG.footLeft.relY);
      ctx.drawImage(images['foot-left'], -RIG.footLeft.w * RIG.footLeft.pivotX, -RIG.footLeft.h * RIG.footLeft.pivotY, RIG.footLeft.w, RIG.footLeft.h);
      ctx.restore();
    }
    if (images['foot-right']) {
      ctx.save();
      ctx.translate(RIG.footRight.relX, RIG.footRight.relY);
      ctx.drawImage(images['foot-right'], -RIG.footRight.w * RIG.footRight.pivotX, -RIG.footRight.h * RIG.footRight.pivotY, RIG.footRight.w, RIG.footRight.h);
      ctx.restore();
    }

    // G. Cat Head & Facial Features
    ctx.save();
    const headPosition=bodyPoint(RIG.head.relX,RIG.head.relY,pose);
    ctx.translate(headPosition.x, headPosition.y + pose.headYOffset);
    ctx.rotate(pose.headRot + pose.bodyRot*.35);
    if (images.head) {
      ctx.drawImage(images.head, -RIG.head.w * RIG.head.pivotX, -RIG.head.h * RIG.head.pivotY, RIG.head.w, RIG.head.h);
    }
    // Procedural facial features
    drawFaceFeatures(0, 0, RIG.head.w, RIG.head.h, pose);
    ctx.restore();

    // H. Arms & Rod Hierarchy
    // Shoulder follows torso; paw endpoint follows its grip on the branch.
    drawAttachedArm('arm-right',bodyPoint(RIG.armRight.relX,RIG.armRight.relY,pose),rodLocalPoint(-14,-9,pose),43);

    // Fishing Rod
    ctx.save();
    ctx.translate(RIG.rod.relX, RIG.rod.relY);
    ctx.rotate(pose.rodRot);
    if (images.rod) {
      ctx.drawImage(images.rod, -RIG.rod.w * RIG.rod.pivotX, -RIG.rod.h * RIG.rod.pivotY, RIG.rod.w, RIG.rod.h);
    }

    // Tip coordinates in global canvas space
    // Pivot is at (0.68, 0.76) of rod (w=302, h=214)
    // Rod tip is at local (-RIG.rod.w * 0.68 + 15, -RIG.rod.h * 0.76 + 12)
    const localTipX = -RIG.rod.w * RIG.rod.pivotX + 18;
    const localTipY = -RIG.rod.h * RIG.rod.pivotY + 15;
    ctx.restore();

    drawAttachedArm('arm-left',bodyPoint(RIG.armLeft.relX,RIG.armLeft.relY,pose),rodLocalPoint(0,0,pose),37);

    ctx.restore(); // End Raft Transform Group

    // 5. Fishing Line & Bobber (World Coordinates)
    // Compute current global rod tip
    const cosR = Math.cos(pose.raftRot + pose.rodRot);
    const sinR = Math.sin(pose.raftRot + pose.rodRot);
    const rodBaseGlobalX = pose.raftX + RIG.rod.relX * Math.cos(pose.raftRot) - RIG.rod.relY * Math.sin(pose.raftRot);
    const rodBaseGlobalY = pose.raftY + RIG.rod.relX * Math.sin(pose.raftRot) + RIG.rod.relY * Math.cos(pose.raftRot);

    const tipRelX = -RIG.rod.w * RIG.rod.pivotX + 18;
    const tipRelY = -RIG.rod.h * RIG.rod.pivotY + 15;
    const {x:globalTipX,y:globalTipY}=rodWorldTip(pose);

    // Fishing Line
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(globalTipX, globalTipY);

    // Natural catenary slack curve
    const midX = (globalTipX + pose.bobberX) * 0.5 - 6;
    const midY = (globalTipY + pose.bobberY) * 0.5;
    ctx.quadraticCurveTo(midX, midY, pose.bobberX, pose.bobberY);
    ctx.stroke();
    ctx.restore();

    // Bobber Ripples
    drawRipples(pose);

    // Bobber Cork
    ctx.save();
    ctx.translate(pose.bobberX, pose.bobberY);

    // Red upper dome
    ctx.fillStyle = '#e84637';
    ctx.strokeStyle = '#2b1d17';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 11, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White lower dome
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pin top
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.5, -15, 3, 5);
    ctx.strokeRect(-1.5, -15, 3, 5);

    ctx.restore();

    // Droplets
    drawDroplets(pose);

    // 6. Flying Fish (during catch)
    if (pose.fishVisible) {
      drawFish(pose.fishX, pose.fishY, pose.fishRot, pose.fishScale);
    }

    // 7. Dragonfly
    if (pose.dragonflyVisible && images.dragonfly) {
      ctx.save();
      ctx.translate(pose.dragonflyX, pose.dragonflyY);
      ctx.rotate(pose.dragonflyRot);
      ctx.save();
      ctx.rotate(-Math.PI/4);
      ctx.scale(1, pose.dragonflyWingScale);
      ctx.rotate(Math.PI/4);
      ctx.drawImage(
        images.dragonfly,
        -RIG.dragonfly.w * RIG.dragonfly.pivotX,
        -RIG.dragonfly.h * RIG.dragonfly.pivotY,
        RIG.dragonfly.w,
        RIG.dragonfly.h
      );
      ctx.restore();
      // Stable body over fluttering wings: narrow clip along its diagonal axis.
      ctx.beginPath(); ctx.moveTo(-17,17); ctx.lineTo(-11,21);
      ctx.lineTo(18,-10); ctx.lineTo(10,-19); ctx.closePath(); ctx.clip();
      ctx.drawImage(images.dragonfly,-24,-22.5,48,45);
      ctx.restore();
    }
  }

  // Main Loop
  let currentPose = computePose(0, true);

  function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000.0);
    lastTimestamp = timestamp;

    if (isPlaying) {
      if (mode === 'showcase') {
        currentTime += dt;
        if (currentTime >= 20.0) {
          currentTime = 0; // loop showcase
        }
      } else {
        // Ambient mode
        ambientTime += dt;
        currentTime = ambientTime;

        if (!ambientCritterActive && !catchTriggered && !reducedMotion) {
          ambientCritterTimer -= dt;
          if (ambientCritterTimer <= 0) {
            ambientCritterActive = true;
            ambientCritterPathIdx=Math.floor(Math.random()*3);
            ambientCritterTime = ambientTime;
            ambientCritterDuration = 8.0;
            critterStatus.textContent = 'Sinh vật: Chuồn chuồn đang ghé';
          }
        }
      }

      currentPose = computePose(currentTime, mode === 'showcase');
      updateUI();
    }

    if (assetsLoaded && isPlaying) renderFrame(currentPose);

    requestAnimationFrame(tick);
  }

  // Update UI Labels & Slider
  function updateUI() {
    if (mode === 'showcase') {
      timelineSlider.value = currentTime.toFixed(2);
      timeDisplay.textContent = `${currentTime.toFixed(1)}s / 20.0s`;
      canvasBanner.textContent = getPhaseDescription(currentPose.phase);
    } else {
      timeDisplay.textContent = `${ambientTime.toFixed(1)}s (Chờ)`;
      canvasBanner.textContent = 'Chế độ chờ tự nhiên';
    }

    if (ambientCritterActive || currentPose.dragonflyVisible) {
      critterStatus.textContent = 'Sinh vật: Chuồn chuồn đang lượn';
    } else {
      critterStatus.textContent = 'Sinh vật: Yên tĩnh';
    }
  }

  function getPhaseDescription(phase) {
    switch (phase) {
      case 'quiet': return 'Nghỉ ngơi yên bình — Thở nhẹ, chớp mắt';
      case 'dragonfly_visit': return 'Chuồn chuồn ghé đậu ngọn cần câu';
      case 'dragonfly_leave': return 'Chuồn chuồn bay lượn rời đi';
      case 'sleepy_hum': return 'Thảnh thơi hát vu vơ bên mặt ao';
      case 'bite_warning': return 'Động phao! Mèo chợ cảnh giác';
      case 'tug_anticipation': return 'Cá cắn câu! Lấy đà giằng co';
      case 'catch_pull': return 'Vút cần! Cá bay vào sọt tre';
      case 'celebrate': return 'Ăn mừng thành quả với nụ cười tươi';
      case 'settle': return 'Trở về tư thế câu thảnh thơi';
      default: return 'Ao Cỏ May — Mèo Chợ 2D';
    }
  }

  // Event Handlers
  btnPlayPause.addEventListener('click', () => {
    if (isPlaying) {
      window.fishingPreview.pause();
    } else {
      window.fishingPreview.resume();
    }
  });

  btnShowcase.addEventListener('click', () => {
    mode = 'showcase';
    catchTriggered=false;ambientCritterActive=false;
    btnShowcase.classList.add('btn-active');
    btnAmbient.classList.remove('btn-active');
    statusText.textContent = isPlaying ? 'Đang phát (Trình diễn 20s)' : 'Tạm dừng (Trình diễn 20s)';
    currentTime = 0;
    currentPose = computePose(currentTime, true);
    renderFrame(currentPose);
    updateUI();
    window.fishingPreview.resume();
  });

  btnAmbient.addEventListener('click', () => {
    mode = 'ambient';
    ambientTime=0;currentTime=0;catchTriggered=false;ambientCritterActive=false;
    btnAmbient.classList.add('btn-active');
    btnShowcase.classList.remove('btn-active');
    statusText.textContent = isPlaying ? 'Đang phát (Chờ tự nhiên)' : 'Tạm dừng (Chờ tự nhiên)';
    ambientCritterTimer = 3.0; // dragonfly soon
    currentPose=computePose(0,false);
    if(assetsLoaded) renderFrame(currentPose);
    updateUI();
    window.fishingPreview.resume();
  });

  btnDragonfly.addEventListener('click', () => {
    window.fishingPreview.trigger('dragonfly');
  });

  btnCatch.addEventListener('click', () => {
    window.fishingPreview.trigger('catch');
  });

  timelineSlider.addEventListener('input', (e) => {
    const t = parseFloat(e.target.value);
    window.fishingPreview.pause();
    window.fishingPreview.setTime(t);
  });

  chkReducedMotion.addEventListener('change', (e) => {
    window.fishingPreview.setReducedMotion(e.target.checked);
  });

  // Listen to OS reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    chkReducedMotion.checked = true;
    reducedMotion = true;
  }
  mediaQuery.addEventListener('change', (e) => {
    window.fishingPreview.setReducedMotion(e.matches);
  });

  // Page visibilitychange handler (Pause when tab is hidden, no catch-up burst)
  let resumeOnVisible=false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnVisible=isPlaying;
      lastTimestamp = 0;
      isPlaying = false;
      statusIndicator.classList.add('paused');
      statusText.textContent = 'Đã tạm dừng (Tab ẩn)';
      playIcon.textContent = '▶';
      playText.textContent = 'Tiếp tục';
    } else if(resumeOnVisible) {resumeOnVisible=false;window.fishingPreview.resume();}
  });

  // Keyboard shortcut (Space to play/pause)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      btnPlayPause.click();
    }
  });

  // Public Debug API for Codex / Automated Verification
  window.fishingPreview = {
    setTime: function (seconds) {
      mode='showcase';
      btnShowcase.classList.add('btn-active');btnAmbient.classList.remove('btn-active');
      currentTime = Math.max(0, Math.min(19.999, seconds));
      currentPose = computePose(currentTime, true);
      renderFrame(currentPose);
      updateUI();
      return Promise.resolve();
    },

    getState: function () {
      return {
        time: currentTime,
        mode: mode,
        isPlaying: isPlaying,
        reducedMotion: reducedMotion,
        activeCritter: currentPose.dragonflyVisible ? 'dragonfly' : null,
        phase: currentPose.phase,
        pose: this.getPose()
      };
    },

    getPose: function () {
      return {
        raft: { x: currentPose.raftX, y: currentPose.raftY, rot: currentPose.raftRot },
        body: { scaleX: currentPose.bodyScaleX, scaleY: currentPose.bodyScaleY, rot: currentPose.bodyRot, yOffset: currentPose.bodyYOffset },
        head: { rot: currentPose.headRot, yOffset: currentPose.headYOffset, blink: currentPose.blink, eyeStyle: currentPose.eyeStyle, mouth: currentPose.mouthShape },
        tail: { rot: currentPose.tailRot },
        armLeft: { rot: currentPose.armLeftRot },
        armRight: { rot: currentPose.armRightRot },
        rod: { rot: currentPose.rodRot, bend: currentPose.rodBend },
        bobber: { x: currentPose.bobberX, y: currentPose.bobberY, dip: currentPose.bobberDip },
        dragonfly: { visible: currentPose.dragonflyVisible, x: currentPose.dragonflyX, y: currentPose.dragonflyY },
        fish: { visible: currentPose.fishVisible, x: currentPose.fishX, y: currentPose.fishY }
      };
    },

    trigger: function (action) {
      if (action === 'dragonfly') {
        if(catchTriggered || reducedMotion) return false;
        if (mode === 'showcase') {
          this.setTime(3.6);
        } else {
          ambientCritterActive = true;
          ambientCritterPathIdx=Math.floor(Math.random()*3);
          ambientCritterTime = ambientTime;
          ambientCritterDuration = 8.0;
        }
      } else if (action === 'catch') {
        ambientCritterActive=false;ambientCritterTimer=20+Math.random()*25;
        if (mode === 'showcase') {
          this.setTime(12.0);
        } else {
          catchTriggered = true;
          catchTime = ambientTime;
          // Splash is evaluated from action time, never accumulated render particles.
        }
      }
      this.resume();
      return true;
    },

    pause: function () {
      isPlaying = false;
      statusIndicator.classList.add('paused');
      statusText.textContent = `Tạm dừng (${mode === 'showcase' ? 'Trình diễn 20s' : 'Chờ tự nhiên'})`;
      playIcon.textContent = '▶';
      playText.textContent = 'Tiếp tục';
      return Promise.resolve();
    },

    resume: function () {
      isPlaying = true;
      lastTimestamp = 0;
      statusIndicator.classList.remove('paused');
      statusText.textContent = `Đang phát (${mode === 'showcase' ? 'Trình diễn 20s' : 'Chờ tự nhiên'})`;
      playIcon.textContent = '⏸';
      playText.textContent = 'Tạm dừng';
      return Promise.resolve();
    },

    setMode: function (m) {
      if (m === 'showcase') btnShowcase.click();
      else if (m === 'ambient') btnAmbient.click();
    },

    setReducedMotion: function (val) {
      reducedMotion = !!val;
      chkReducedMotion.checked = reducedMotion;
      currentPose=computePose(currentTime,mode==='showcase');
      if(assetsLoaded) renderFrame(currentPose);
    }
  };

  // Initialize
  loadAssets(() => {
    currentPose = computePose(0, true);
    renderFrame(currentPose);
    updateUI();
    requestAnimationFrame(tick);
  });

})();
