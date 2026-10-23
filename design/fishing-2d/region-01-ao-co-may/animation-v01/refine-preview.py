"""Codex's one-time integration patch to Antigravity's delivered animation."""
from pathlib import Path
p=Path(__file__).with_name('main.js')
s=p.read_text(encoding='utf-8')
def replace(old,new,count=None):
    global s
    if old not in s: raise ValueError('Missing expected source: '+old[:90])
    s=s.replace(old,new) if count is None else s.replace(old,new,count)

start=s.index('  function drawRipples() {')
end=s.index('  function drawFaceFeatures(',start)
s=s[:start]+'''  // Rendering depends only on pose time; paused and scrubbed frames remain identical.
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

'''+s[end:]
replace('drawAmbientFish(0.016);','drawAmbientFish(pose.time);')
replace('Math.sin(t * 70) * 0.8 + 0.2','.62 + Math.sin(t * 80) * .32')
replace('''        const rodTipX = 646;
        const rodTipY = 264 + raftBob;''','''        const {x:rodTipX,y:rodTipY}=rodWorldTip(pose);''')
replace('''          const rodTipX = 646;
          const rodTipY = 264 + raftBob;''','''          const {x:rodTipX,y:rodTipY}=rodWorldTip(pose);''')
replace("          // Perching on rod tip with micro hovering adjustments", "          pose.dragonflyWingScale=.94;\n          // Perching on rod tip with micro hovering adjustments")
replace('''            // Perch on rod
''','''            pose.dragonflyWingScale=.94;
            // Perch on rod
''')
replace('''        pose.mouthShape = 'neutral';
        pose.tailRot = Math.sin(humT * 2.5) * 0.12 * motionScale;''','''        pose.mouthShape = humT<1.1 ? 'surprised' : 'sleepy';
        if(humT>1.1) {pose.eyeStyle='closed';pose.blink=.75;pose.headYOffset+=Math.sin((humT-1.1)*Math.PI/1.4)*4*motionScale;}
        pose.tailRot = Math.sin(humT * 2.5) * 0.08 * motionScale;''')
replace('''          const arcEndX = 1060, arcEndY = 405;''','''          const arcEndX = 1075, arcEndY = 350;''')
replace('''const arcApexX = 850, arcApexY = 170''','''const arcApexX = 850, arcApexY = 130''')
replace('''pose.fishRot = (fishP * Math.PI * 3.5);''','''pose.fishRot = -.65+fishP*1.25+Math.sin(fishP*Math.PI*4)*.14;
          pose.fishScale=1-.82*easeInOutQuad(clamp((fishP-.84)/.16,0,1));''')
replace('''pose.fishX = inv * inv * 643 + 2 * inv * pullP * 850 + pullP * pullP * 1060;''','''pose.fishX = inv * inv * 643 + 2 * inv * pullP * 850 + pullP * pullP * 1075;''')
replace('''pose.fishY = inv * inv * 530 + 2 * inv * pullP * 170 + pullP * pullP * 405;''','''pose.fishY = inv * inv * 530 + 2 * inv * pullP * 130 + pullP * pullP * 350;''')
replace('''pose.fishRot = pullP * Math.PI * 3.5;''','''pose.fishRot=-.65+pullP*1.25+Math.sin(pullP*Math.PI*4)*.14;
            pose.fishScale=1-.82*easeInOutQuad(clamp((pullP-.84)/.16,0,1));''')
replace('''        const celT = loopTime - 16.5; // 0..2.0s''','''        const celT = loopTime - 16.5;
        pose.rodRot=-.20*motionScale;
        pose.bodyRot=.06*motionScale;''')
replace('''pose.headRot = Math.sin(celT * 6) * 0.06 * motionScale;''','''pose.headRot = (.06+Math.sin(celT*4)*.025)*motionScale;''')
replace('''      const blinkCycle = (t % 4.2);
      if (blinkCycle < 0.25) {
        pose.blink = Math.sin((blinkCycle / 0.25) * Math.PI);
      }''','''      const bucket=Math.floor(t/11), cycle=t%11;
      for(const at of [1.9+(bucket%3)*.21,6.1,6.43+(bucket%2)*.13]) {
        const distance=Math.abs(cycle-at);
        if(distance<.15) pose.blink=Math.max(pose.blink,1-easeInOutQuad(distance/.15));
      }''')
replace('''ambientCritterTimer = 20 + Math.random() * 20;''','''ambientCritterTimer = 20 + Math.random() * 25;''')
replace('''            pose.dragonflyX = (1 - p) * 150 + p * rodTipX;
            pose.dragonflyY = (1 - p) * 80 + p * rodTipY;''','''            const starts=[[-70,270],[1750,180],[-70,600]];
            const [sx,sy]=starts[ambientCritterPathIdx%3];
            const cx=(sx+rodTipX)*.5, cy=Math.min(sy,rodTipY)-100;
            pose.dragonflyX=(1-p)*(1-p)*sx+2*(1-p)*p*cx+p*p*rodTipX;
            pose.dragonflyY=(1-p)*(1-p)*sy+2*(1-p)*p*cy+p*p*rodTipY;''')
replace('''            pose.dragonflyX = (1 - p) * rodTipX + p * 1750;
            pose.dragonflyY = (1 - p) * rodTipY + p * 120;''','''            const ex=ambientCritterPathIdx%2 ? -80:1750;
            pose.dragonflyX=(1-p)*(1-p)*rodTipX+2*(1-p)*p*((rodTipX+ex)*.5)+p*p*ex;
            pose.dragonflyY=(1-p)*(1-p)*rodTipY+2*(1-p)*p*60+p*p*170;''')
replace('''    return pose;
  }

  // Draw Functions''','''    if (pose.phase==='dragonfly_visit' && t%20>=5.5) {
      const tip=rodWorldTip(pose);pose.dragonflyX=tip.x;pose.dragonflyY=tip.y-6;
    }
    if(reducedMotion) {pose.dragonflyVisible=false;pose.fishVisible=false;pose.bobberY=RIG.bobberBase.y;pose.basketWobble=0;}
    return pose;
  }

  // Draw Functions''')
replace("if (pose.eyeStyle === 'happy' || pose.blink > 0.8)","if (pose.eyeStyle === 'happy' || pose.eyeStyle === 'closed' || pose.blink > 0.8)")
replace("} else if (pose.mouthShape === 'surprised') {","} else if (pose.mouthShape === 'surprised' || pose.mouthShape === 'sleepy') {")
replace('''    if (assetsLoaded) {
      renderFrame(currentPose);
    }''','''    if (assetsLoaded && isPlaying) renderFrame(currentPose);''')
replace('''        if (!ambientCritterActive) {''','''        if (!ambientCritterActive && !catchTriggered && !reducedMotion) {''')
replace('''            ambientCritterActive = true;
            ambientCritterTime = ambientTime;''','''            ambientCritterActive = true;
            ambientCritterPathIdx=Math.floor(Math.random()*3);
            ambientCritterTime = ambientTime;''')
replace('''    window.fishingPreview.setTime(t);
  });''','''    window.fishingPreview.pause();
    window.fishingPreview.setTime(t);
  });''')
replace('''      currentTime = Math.max(0, Math.min(20, seconds));''','''      mode='showcase';
      btnShowcase.classList.add('btn-active');btnAmbient.classList.remove('btn-active');
      currentTime = Math.max(0, Math.min(19.999, seconds));''')
replace("      if (action === 'dragonfly') {","      if (action === 'dragonfly') {\n        if(catchTriggered || reducedMotion) return false;")
replace('''          ambientCritterActive = true;
          ambientCritterTime = ambientTime;''','''          ambientCritterActive = true;
          ambientCritterPathIdx=Math.floor(Math.random()*3);
          ambientCritterTime = ambientTime;''')
replace("      } else if (action === 'catch') {","      } else if (action === 'catch') {\n        ambientCritterActive=false;ambientCritterTimer=20+Math.random()*25;")
replace('''          addSplash(643, 530, 10);''','''          // Splash is evaluated from action time, never accumulated render particles.''')
replace('''        }
      }
    },

    pause: function''','''        }
      }
      this.resume();
      return true;
    },

    pause: function''')
replace('''      chkReducedMotion.checked = reducedMotion;
    }
  };''','''      chkReducedMotion.checked = reducedMotion;
      currentPose=computePose(currentTime,mode==='showcase');
      if(assetsLoaded) renderFrame(currentPose);
    }
  };''')
replace('''  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {''','''  let resumeOnVisible=false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnVisible=isPlaying;''')
replace('''      playText.textContent = 'Tiếp tục';
    }
  });''','''      playText.textContent = 'Tiếp tục';
    } else if(resumeOnVisible) {resumeOnVisible=false;window.fishingPreview.resume();}
  });''')
p.write_text(s,encoding='utf-8')
print('Applied rig, deterministic rendering, critter paths and interaction refinements')
