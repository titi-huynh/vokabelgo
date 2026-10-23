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
console.log(`${checks} navigation checks passed.`);
