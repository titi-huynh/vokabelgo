'use strict';
// Exercises the ACTUAL controller with a small DOM/scene adapter, not a second
// implementation of its scheduler, economy or completion logic.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.resolve(__dirname,'../..');
function harness(){
  const elements=new Map(),stored=new Map(),callbacks={};let clock=0,frames=0;
  function element(tag='div'){
    const classes=new Set();const listeners={};
    return {tagName:tag.toUpperCase(),children:[],style:{},value:'',checked:false,disabled:false,textContent:'',innerHTML:'',dataset:{},
      classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle:(x,force)=>{const yes=force??!classes.has(x);yes?classes.add(x):classes.delete(x);return yes;}},
      setAttribute(k,v){this[k]=String(v);},getAttribute(k){return this[k]??null;},
      appendChild(x){this.children.push(x);return x;},addEventListener(k,fn){listeners[k]=fn;},
      focus(){},scrollIntoView(){},querySelectorAll(){return this.children;},
      click(){if(!this.disabled){listeners.click?.({target:this});this.onclick?.({target:this});}},remove(){},setSelectionRange(){}};
  }
  const document={readyState:'loading',hidden:false,addEventListener:(k,fn)=>callbacks[k]=fn,
    getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,
    querySelectorAll:sel=>{const id=/^#([\w-]+)/.exec(sel)?.[1];return id?document.getElementById(id).children:[];}};
  const localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,String(v)),removeItem:k=>stored.delete(k)};
  const scene=new Proxy({paused:false,pause(){this.paused=true;},resume(){this.paused=false;}},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
  const window={localStorage,VokabelCardSchema:require('../../vocabulary-schema.js'),VokabelTypingVerification:require('../../typing-verification.js'),allCards:()=>[
    {id:'a',term:'das Haus',meaning:'ngôi nhà',deck:'test',example:'Das Haus ist klein.'},
    {id:'b',term:'die Katze',meaning:'con mèo',deck:'test',example:'Die Katze schläft.'},
    {id:'c',term:'der Baum',meaning:'cây',deck:'test',example:'Der Baum ist hoch.'},
    {id:'d',term:'das Boot',meaning:'thuyền',deck:'test',example:'Das Boot ist rot.'}],addEventListener:(k,fn)=>callbacks[k]=fn};
  const context=vm.createContext({window,document,localStorage,scene,console,Date,Math,Map,Set,performance:{now:()=>clock},requestAnimationFrame:()=>frames++,setTimeout:()=>0,clearTimeout:()=>{}});
  vm.runInContext(fs.readFileSync(path.join(base,'cat-island-learning.js'),'utf8'),context);
  const controller=fs.readFileSync(path.join(base,'cat-island-game.js'),'utf8').replace(/^import scene from .*;\s*$/m,'');
  vm.runInContext(controller,context);
  const game=window.CatIslandGame;game.cacheDOMElements();game.ui.deckSelect.value='test';
  game.sound=new Proxy({enabled:false},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
  const advance=(ms)=>{for(let i=0;i<Math.ceil(ms/50);i++){clock+=50;game.tick(clock);}};
  const start=()=>game.startRound();
  const select=()=>{const c=Array.from(game.customers.values()).find(x=>!x.resolved&&!x.isResolving);assert.ok(c,'an unresolved customer should exist');game.selectCustomer(c.id);return c;};
  const skipRound=()=>{for(let i=0;i<12;i++){select();game.skipOrder();advance(1000);}assert.equal(game.isRoundActive,false);};
  return {game,scene,window,document,stored,callbacks,start,select,advance,skipRound,frames:()=>frames};
}
let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+' — '+e.message);}}
test('actual controller gives one reward for repeated submit',()=>{
  const h=harness();h.start();const c=h.select();h.game.submitAnswer(c.question.answer);h.game.submitAnswer(c.question.answer);
  assert.equal(h.game.ordersServed,1);assert.equal(h.game.coins,12);h.advance(1000);assert.equal(h.game.customers.size,2);
});
test('all skipped calm orders reach results and cannot hang an exhausted queue',()=>{const h=harness();h.start();h.skipRound();assert.equal(h.game.resolvedOrdersCount,12);assert.equal(h.game.ordersServed,0);});
test('pause freezes scheduled delivery and resumes it exactly once',()=>{
  const h=harness();h.start();let fired=0;h.game.scheduleAction(500,()=>fired++);h.game.togglePause(true);h.advance(2000);assert.equal(fired,0);
  h.game.togglePause(false);h.advance(1000);assert.equal(fired,1);
});
test('quitting cancels old callbacks and never unlocks helper',()=>{
  const h=harness();for(let i=0;i<2;i++){h.start();h.select();h.game.skipOrder();h.game.abandonRound();h.advance(2000);}
  assert.equal(h.game.profile.totalShifts,0);assert.equal(h.game.profile.helperUnlocked,false);assert.equal(h.game.customers.size,0);
});
test('customer names identify distinct occupied slots after repeated replenishment',()=>{
  const h=harness();h.start();for(let i=0;i<4;i++){h.select();h.game.skipOrder();h.advance(1000);const names=Array.from(h.game.customers.values()).map(c=>c.name);assert.equal(new Set(names).size,names.length);}
});
test('successive completed shifts rotate events without needing a reload',()=>{
  const h=harness();h.start();h.skipRound();h.start();assert.equal(h.game.roundCount%4,1);h.skipRound();h.start();assert.equal(h.game.roundCount%4,2);
});
test('rush expiry leaves the animation loop available to a second round',()=>{
  const h=harness();h.game.mode='rush';h.start();h.game.rushTimeLeft=.1;h.advance(1000);assert.equal(h.game.isRoundActive,false);const frames=h.frames();
  h.start();h.advance(1000);assert.ok(h.frames()>frames);assert.ok(h.game.rushTimeLeft<120);
});
test('event starts after delivery resolves and freezes ordinary countdown',()=>{
  const h=harness();h.game.mode='rush';h.start();let c=h.select();h.game.submitAnswer(c.question.answer);h.advance(1000);
  c=h.select();h.game.submitAnswer(c.question.answer);h.advance(50);assert.equal(h.game.isEventActive,false,'do not interrupt a pending delivery');
  h.advance(1500);assert.equal(h.game.isEventActive,true);const left=h.game.rushTimeLeft;h.advance(2000);assert.equal(h.game.rushTimeLeft,left);
});
test('persistent personal best is updated from completed controller score',()=>{
  const h=harness();h.game.mode='rush';h.start();const c=h.select();h.game.submitAnswer(c.question.answer);h.advance(1000);h.game.rushTimeLeft=.01;h.advance(100);
  assert.equal(h.game.profile.bestScores.rush,12);
});
test('changing customer preserves a partially typed answer',()=>{
  const h=harness();h.game.profile.totalShifts=1;h.start();
  const customers=Array.from(h.game.customers.values());const typed=customers.find(c=>c.question.type==='recall');
  assert.ok(typed);h.game.selectCustomer(typed.id);h.game.ui.orderInput.value='das Ha';
  h.game.selectCustomer(customers.find(c=>c!==typed).id);h.game.selectCustomer(typed.id);assert.equal(h.game.ui.orderInput.value,'das Ha');
});
test('skipping an event cancels its pending next-stage callback',()=>{
  const h=harness();h.start();h.game.isEventActive=true;let fired=0;
  h.game.scheduleAction(500,()=>fired++,true);h.game.closeStoryEvent();h.advance(1500);assert.equal(fired,0);
});
test('a callback may end a round without running other cancelled callbacks',()=>{
  const h=harness();h.start();let stale=0;
  h.game.scheduleAction(50,()=>h.game.abandonRound());h.game.scheduleAction(50,()=>stale++);
  assert.doesNotThrow(()=>h.advance(1000));assert.equal(stale,0);
});
test('actual barter handler deducts the wallet only once',()=>{
  const h=harness();h.start();h.game.profile.coins=100;h.game.isEventActive=true;h.game.showBarterEvent();
  const buy=h.document.getElementById('choice-barter-buy');buy.click();buy.click();
  assert.equal(h.game.profile.coins,80);assert.ok(h.game.profile.unlockedCosmetics.includes('lotus'));
});
test('actual teaching interaction rewards one completed two-stage application',()=>{
  const h=harness();h.start();h.game.isEventActive=true;h.game.showLessonEvent();
  h.document.getElementById('lesson-box-takeaway').click();h.document.getElementById('lesson-box-dinein').click();
  h.game.ui.btnLessonPackTakeaway.click();h.advance(1300);h.game.ui.btnLessonPackDinein.click();h.game.ui.btnLessonPackDinein.click();
  assert.equal(h.game.coins,20);assert.equal(h.game.profile.coins,20);h.advance(2000);assert.equal(h.game.isEventActive,false);
});
console.log(`${passed} runtime checks passed, ${failed} failed.`);if(failed)process.exitCode=1;
