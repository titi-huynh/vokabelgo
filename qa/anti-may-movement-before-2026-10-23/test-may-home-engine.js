const assert = require('node:assert/strict');
const E = require('./may-home-engine.js');
let checks = 0;
function check(name, run) { run(); checks++; console.log(`PASS ${name}`); }
check('Every destination pair stays on connected walk paths', () => {
  for (const start of Object.values(E.points)) for (const end of Object.values(E.points)) {
    const route = E.route(start,end);
    if (E.distance(start,end) < .05) continue;
    assert.ok(route.length);
    assert.ok(E.distance(route.at(-1),end)<.01);
    let previous = start;
    for (const next of route) {
      for (let t=0; t<=1; t+=.1) assert.ok(E.project({x:previous.x+(next.x-previous.x)*t,y:previous.y+(next.y-previous.y)*t}).distance<.01);
      previous = next;
    }
  }
});
check('A click on the same path takes the direct route', () => {
  const a=E.points.square,b=E.points.middle;
  const start={x:a.x+(b.x-a.x)*.25,y:a.y+(b.y-a.y)*.25};
  const end={x:a.x+(b.x-a.x)*.75,y:a.y+(b.y-a.y)*.75};
  assert.equal(E.route(start,end).length,1);
});
check('Arrival action fires exactly once', () => {
  const walker=new E.Walker(); walker.go(E.points.fish,'fish');
  const arrivals=[];
  for(let i=0;i<1000;i++){const event=walker.update(.033);if(event)arrivals.push(event);}
  assert.deepEqual(arrivals,['fish']);assert.ok(E.distance(walker.position,E.points.fish)<.01);
});
check('Retargeting cancels the old arrival without teleporting', () => {
  const walker=new E.Walker();walker.go(E.points.garden,'kino');walker.update(.03);
  const before={...walker.position};walker.go(E.points.shore,'study');
  assert.deepEqual(walker.position,before);
  const arrivals=[];for(let i=0;i<1000;i++){const event=walker.update(.033);if(event)arrivals.push(event);}
  assert.deepEqual(arrivals,['study']);
});
check('A long or hidden frame cannot jump across the island', () => {
  const walker=new E.Walker();walker.go(E.points.fish);const before={...walker.position};walker.update(120);
  assert.ok(E.distance(before,walker.position)<=walker.speed*.05+.01);
  const current={...walker.position};walker.update(-3);assert.deepEqual(walker.position,current);
});
check('Reduced motion instant arrival and stopped action are safe', () => {
  const walker=new E.Walker();walker.go(E.points.porch,'house',true);
  assert.equal(walker.moving,false);assert.equal(walker.update(0),'house');assert.equal(walker.update(0),null);
  walker.go(E.points.garden,'kino');walker.stop();assert.equal(walker.update(.05),null);
});
check('Water clicks project to land instead of becoming walkable water', () => {
  assert.ok(E.project({x:0,y:E.HEIGHT}).distance>95);
  assert.ok(E.project(E.points.square).distance<.01);
});
check('The dock and listening bench do not detour through the cottage', () => {
  const path=E.route(E.points.fish,E.points.garden);
  assert.ok(!path.some(p=>E.distance(p,E.points.porch)<.1));
  let previous=E.points.fish,total=0;
  for(const p of path){total+=E.distance(previous,p);previous=p;}
  assert.ok(total<550, `Bench route was ${total}px`);
});
check('Feet stay outside solid furniture, cottage walls and dock pilings', () => {
  // Foot-level bounds calibrated against the unchanged flat-v3 illustration.
  const solids=[[850,150,1300,485],[590,290,735,446],[1245,380,1455,510],[180,610,445,715],
    [1450,711,1491,829],[1347,646,1389,755],[1490,625,1530,677],[1600,685,1640,798]];
  for(const [from,to] of E.edges){const a=E.points[from],b=E.points[to];
    for(let t=0;t<=1;t+=.01){const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
      assert.ok(!solids.some(([l,top,r,bottom])=>x>l&&x<r&&y>top&&y<bottom),`${from} to ${to} enters a solid at ${x},${y}`);
    }
  }
});
check('Walking accelerates and brakes instead of starting and stopping at full speed', () => {
  const w=new E.Walker(E.points.square);w.go(E.points.fish,'fish');
  w.update(1/60);assert.ok(w.currentSpeed>0&&w.currentSpeed<w.speed*.2);
  let peaked=false,braked=false,arrived=false;
  for(let i=0;i<2000;i++){
    const before={...w.position};const event=w.update(1/60);
    assert.ok(E.distance(before,w.position)<=w.speed/60+.01);
    if(w.currentSpeed>w.speed*.9)peaked=true;
    if(peaked&&w.moving&&w.currentSpeed<w.speed*.3)braked=true;
    if(event){assert.equal(event,'fish');arrived=true;break;}
  }
  assert.ok(peaked&&braked&&arrived);assert.equal(w.currentSpeed,0);
});
check('Retargeting updates facing without teleporting, and cancelling prevents stale arrivals', () => {
  const w=new E.Walker(E.points.middle);w.go(E.points.square,'old');w.update(.05);
  assert.equal(w.facing,-1);const p={...w.position};w.go(E.points.porch,'house');assert.deepEqual(w.position,p);
  for(let i=0;i<5;i++)w.update(.05);assert.equal(w.facing,1);
  w.stop();const stopped={...w.position};
  for(let i=0;i<100;i++)assert.equal(w.update(.05),null);
  assert.deepEqual(w.position,stopped);assert.equal(w.currentSpeed,0);
});
console.log(`${checks} navigation checks passed.`);
