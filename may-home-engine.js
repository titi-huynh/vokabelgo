/* Path-only navigation for Zehn's home. No learning or reward state lives here. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MayHomeEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const WIDTH = 1672, HEIGHT = 941;
  const nodes = {
    square: [0.45, 0.61], middle: [0.565, 0.615], porch: [0.62, 0.55],
    garden: [0.815, 0.57], frontLawn: [0.735, 0.59], gardenLane: [0.805, 0.655],
    bend: [0.70, 0.70], dockApproach: [0.84, 0.69], dock: [0.87, 0.725], fish: [0.918, 0.782],
    board: [0.395, 0.49], lawn: [0.46, 0.54], shore: [0.277, 0.765]
  };
  const points = Object.fromEntries(Object.entries(nodes).map(([key, p]) => [key, { x: p[0] * WIDTH, y: p[1] * HEIGHT }]));
  // The right lawn connects the bench to the dock entrance; the cottage is not a required detour.
  const edges = [['square','middle'],['middle','porch'],['porch','frontLawn'],['frontLawn','garden'],['garden','gardenLane'],['gardenLane','dockApproach'],['middle','bend'],['bend','gardenLane'],['dockApproach','dock'],['dock','fish'],['square','lawn'],['lawn','board'],['square','shore']];
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function project(point) {
    let best = null;
    edges.forEach(([from, to], edge) => {
      const a = points[from], b = points[to];
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((point.x-a.x)*dx + (point.y-a.y)*dy)/(dx*dx+dy*dy)));
      const p = { x: a.x + dx*t, y: a.y + dy*t };
      const d = distance(point, p);
      if (!best || d < best.distance) best = { point: p, edge, from, to, distance: d };
    });
    return best;
  }
  function route(start, target) {
    const a = project(start), b = project(target);
    const positions = { ...points, START: a.point, END: b.point };
    const links = Object.fromEntries(Object.keys(positions).map(key => [key, []]));
    const connect = (from, to) => {
      const cost = distance(positions[from], positions[to]);
      links[from].push({ to, cost }); links[to].push({ to: from, cost });
    };
    edges.forEach(([from,to]) => connect(from,to));
    connect('START', a.from); connect('START', a.to);
    connect('END', b.from); connect('END', b.to);
    if (a.edge === b.edge) connect('START', 'END');
    const costs = Object.fromEntries(Object.keys(positions).map(key => [key, Infinity]));
    costs.START = 0;
    const previous = {}, visited = new Set();
    while (visited.size < Object.keys(positions).length) {
      let current = null;
      Object.keys(positions).forEach(key => { if (!visited.has(key) && (current === null || costs[key] < costs[current])) current = key; });
      if (current === null || !Number.isFinite(costs[current])) break;
      if (current === 'END') break;
      visited.add(current);
      links[current].forEach(link => {
        const cost = costs[current] + link.cost;
        if (cost < costs[link.to]) { costs[link.to] = cost; previous[link.to] = current; }
      });
    }
    const keys = ['END'];
    while (keys[0] !== 'START' && previous[keys[0]]) keys.unshift(previous[keys[0]]);
    return keys.slice(1).map(key => ({ ...positions[key] })).filter((p, i, all) => distance(p, i ? all[i-1] : start) > 0.05);
  }
  class Walker {
    constructor(position = points.square) {
      this.position = { ...position }; this.path = []; this.speed = 210; this.acceleration = 650;
      this.currentSpeed = 0; this.intent = null; this.travelled = 0;
      this.heading = {x:0,y:1}; this.facing = 1;
    }
    go(target, intent = null, instant = false) {
      this.intent = intent;
      this.path = route(this.position, target);
      if (this.path.length && this.currentSpeed > 0) {
        const first = this.path[0], d = distance(this.position,first);
        const dot = d ? ((first.x-this.position.x)*this.heading.x+(first.y-this.position.y)*this.heading.y)/d : 1;
        if (dot < -.2) this.currentSpeed *= .25;
      }
      if (instant) { this.position = { ...project(target).point }; this.path = []; this.currentSpeed = 0; }
    }
    stop() { this.path = []; this.intent = null; this.currentSpeed = 0; }
    update(seconds) {
      const dt = clamp(Number(seconds) || 0, 0, .05);
      let remainingDistance = 0, previous = this.position;
      for (const p of this.path) { remainingDistance += distance(previous,p); previous = p; }
      const braking = this.acceleration*.55;
      let desiredSpeed = Math.min(this.speed, Math.sqrt(2*braking*remainingDistance));
      if (this.path.length > 1) {
        const next=this.path[0], after=this.path[1], d=distance(this.position,next), leg=distance(next,after);
        if (d > .01 && leg > .01) {
          const dot=((next.x-this.position.x)*(after.x-next.x)+(next.y-this.position.y)*(after.y-next.y))/(d*leg);
          const cornerSpeed=this.speed*Math.max(.35,Math.sqrt(Math.max(0,(dot+1)/2)));
          desiredSpeed=Math.min(desiredSpeed,Math.sqrt(cornerSpeed*cornerSpeed+2*braking*d));
        }
      }
      this.currentSpeed += clamp(desiredSpeed-this.currentSpeed,-this.acceleration*dt,this.acceleration*dt);
      let remaining = dt*this.currentSpeed;
      while (this.path.length && remaining > 0) {
        const target = this.path[0], d = distance(this.position, target);
        const step = Math.min(d, remaining);
        if (d > 0) {
          this.heading = {x:(target.x-this.position.x)/d,y:(target.y-this.position.y)/d};
          if (Math.abs(this.heading.x) > .25) this.facing = this.heading.x < 0 ? -1 : 1;
          this.position.x += (target.x-this.position.x)*step/d;
          this.position.y += (target.y-this.position.y)*step/d;
        }
        this.travelled += step; remaining -= step;
        if (d <= step + .001) { this.position = { ...target }; this.path.shift(); }
      }
      if (!this.path.length) this.currentSpeed = 0;
      if (!this.path.length && this.intent !== null) { const intent = this.intent; this.intent = null; return intent; }
      return null;
    }
    get moving() { return this.path.length > 0; }
  }
  return { WIDTH, HEIGHT, points, edges, distance, project, route, Walker };
});
