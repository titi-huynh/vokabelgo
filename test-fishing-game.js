// Unit test lõi thuần của game câu cá (fishing-game.js)
// Chạy: node test-fishing-game.js — exit 0 = đạt
'use strict';
const assert = require('assert');
const Core = require('./fishing-game.js');

const DB = [
  { id: 'sardine', rarity: 'common' },
  { id: 'barsch', rarity: 'common' },
  { id: 'forelle', rarity: 'common' },
  { id: 'karpfen', rarity: 'common' },
  { id: 'goldfisch', rarity: 'rare' },
  { id: 'regenbogenforelle', rarity: 'rare' },
  { id: 'lachs', rarity: 'rare' },
  { id: 'b2_meisterfisch', rarity: 'legendary' },
  { id: 'riesenwels', rarity: 'legendary' }
];

let passed = 0;
function ok(name, fn) { fn(); passed++; console.log('  ✓ ' + name); }

// 1) Rút loài tôn trọng vùng: gần bờ không bao giờ ra cá vùng sâu/huyền thoại
ok('near: chỉ cá gần bờ, không huyền thoại', () => {
  const rng = Core.rngFrom(42);
  for (let i = 0; i < 500; i++) {
    const f = Core.drawFish('near', DB, rng);
    assert.ok(['sardine', 'barsch', 'goldfisch'].includes(f.id), 'near ra ' + f.id);
    assert.notStrictEqual(f.rarity, 'legendary');
  }
});

ok('deep: có ra huyền thoại, mid: không ra cá chỉ-ở-sâu', () => {
  const rng = Core.rngFrom(7);
  let sawLegendary = false;
  for (let i = 0; i < 500; i++) {
    const f = Core.drawFish('deep', DB, rng);
    if (f.rarity === 'legendary') sawLegendary = true;
  }
  assert.ok(sawLegendary, 'deep 500 lần phải có huyền thoại');
  const rng2 = Core.rngFrom(9);
  for (let i = 0; i < 500; i++) {
    const f = Core.drawFish('mid', DB, rng2);
    assert.ok(!['lachs', 'b2_meisterfisch', 'riesenwels', 'sardine'].includes(f.id), 'mid ra ' + f.id);
  }
});

ok('tỉ lệ vùng gần: phổ thông áp đảo (>=70%)', () => {
  const rng = Core.rngFrom(123);
  let common = 0;
  for (let i = 0; i < 1000; i++) if (Core.drawFish('near', DB, rng).rarity === 'common') common++;
  assert.ok(common >= 700, 'common=' + common);
});

// 2) Mô hình căng dây
function simulate(fishRarity, holdPolicy, maxSeconds) {
  const rng = Core.rngFrom(2024);
  const s = Core.createFight({ id: 'x', rarity: fishRarity }, rng);
  const dt = 0.05;
  for (let t = 0; t < maxSeconds && !s.over; t += dt) {
    Core.stepFight(s, dt, holdPolicy(s));
  }
  return s;
}

ok('giữ lì liên tục -> đứt dây', () => {
  const s = simulate('common', () => true, 60);
  assert.ok(s.over && s.snapped && !s.won, JSON.stringify({ over: s.over, snapped: s.snapped, won: s.won }));
});

ok('giữ lúc nghỉ, nhả lúc cá chạy -> thắng, không đứt', () => {
  const s = simulate('common', (st) => st.phase === 'rest' || st.phase === 'telegraph', 90);
  assert.ok(s.over && s.won && !s.snapped, JSON.stringify({ over: s.over, snapped: s.snapped, won: s.won, t: s.elapsed }));
});

ok('không giữ gì cả -> không thắng, không đứt, căng về 0', () => {
  const s = simulate('common', () => false, 20);
  assert.ok(!s.over && s.tension === 0 && s.progress === 0);
});

ok('cá yếu dần sau 35s: cùng giữ lúc chạy, căng tăng chậm hơn hẳn', () => {
  function riseAfter(elapsedPreset) {
    const rng = Core.rngFrom(5);
    const s = Core.createFight({ id: 'x', rarity: 'common' }, rng);
    s.elapsed = elapsedPreset;
    s.phase = 'run'; s.phaseT = 0; s.phaseDur = 99; // giữ nguyên pha chạy
    const before = s.tension;
    Core.stepFight(s, 1.0, true);
    return s.tension - before;
  }
  const early = riseAfter(0);
  const late = riseAfter(40);
  assert.ok(late < early * 0.75, 'early=' + early + ' late=' + late);
});

ok('huyền thoại bùng nổ ở 70%: căng nhảy vọt đúng một lần', () => {
  const rng = Core.rngFrom(3);
  const s = Core.createFight({ id: 'riesenwels', rarity: 'legendary' }, rng);
  s.progress = 69; s.phase = 'rest'; s.phaseT = 0; s.phaseDur = 99;
  Core.stepFight(s, 0.2, false); // tiến độ chưa tới 70 khi không giữ
  assert.ok(!s.surgeDone);
  s.progress = 70.5;
  Core.stepFight(s, 0.1, false);
  assert.ok(s.surgeDone, 'phải bùng nổ khi qua 70%');
});

// 3) Chờ cắn rút nửa khi câu lại
ok('waitSeconds: câu lại = một nửa', () => {
  const rngA = Core.rngFrom(11);
  const rngB = Core.rngFrom(11);
  const full = Core.waitSeconds('mid', rngA, false);
  const half = Core.waitSeconds('mid', rngB, true);
  assert.ok(Math.abs(half - full / 2) < 1e-9);
});

// 4) Kỷ lục loài
ok('isSpeciesRecord: các trường hợp biên', () => {
  const col = [
    { id: 'a', fishId: 'karpfen', length: '40.0' },
    { id: 'b', fishId: 'karpfen', length: '35.0' },
    { id: 'c', fishId: 'lachs', length: '60.0' }
  ];
  assert.strictEqual(Core.isSpeciesRecord(col, { id: 'n1', fishId: 'karpfen', length: '41.5' }), true);
  assert.strictEqual(Core.isSpeciesRecord(col, { id: 'n2', fishId: 'karpfen', length: '39.0' }), false);
  assert.strictEqual(Core.isSpeciesRecord(col, { id: 'n3', fishId: 'barsch', length: '20.0' }), false); // chưa có con cũ cùng loài
  assert.strictEqual(Core.isSpeciesRecord(col, col[0]), true); // chính nó đang giữ kỷ lục (bỏ qua bản thân, con còn lại 35 < 40)
});

console.log('test-fishing-game: ' + passed + ' nhóm kiểm tra ĐẠT');
