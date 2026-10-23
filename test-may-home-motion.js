'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const MayHomeMotion = require('./may-home-motion.js');

test('exact cardinal facing resolves correctly for all 4 headings', () => {
  const { resolveDirectionFromVector } = MayHomeMotion;

  // Cardinal vectors with initial 'down'
  assert.equal(resolveDirectionFromVector(15, 0, 'down'), 'right');
  assert.equal(resolveDirectionFromVector(-15, 0, 'down'), 'left');
  assert.equal(resolveDirectionFromVector(0, -15, 'down'), 'up');
  assert.equal(resolveDirectionFromVector(0, 15, 'down'), 'down');

  // Cardinal vectors with initial 'right'
  assert.equal(resolveDirectionFromVector(0, 15, 'right'), 'down');
  assert.equal(resolveDirectionFromVector(0, -15, 'right'), 'up');
  assert.equal(resolveDirectionFromVector(-15, 0, 'right'), 'left');
  assert.equal(resolveDirectionFromVector(15, 0, 'right'), 'right');

  // Cardinal vectors with initial 'up'
  assert.equal(resolveDirectionFromVector(15, 0, 'up'), 'right');
  assert.equal(resolveDirectionFromVector(-15, 0, 'up'), 'left');
  assert.equal(resolveDirectionFromVector(0, 15, 'up'), 'down');
  assert.equal(resolveDirectionFromVector(0, -15, 'up'), 'up');

  // Cardinal vectors with initial 'left'
  assert.equal(resolveDirectionFromVector(0, 15, 'left'), 'down');
  assert.equal(resolveDirectionFromVector(0, -15, 'left'), 'up');
  assert.equal(resolveDirectionFromVector(15, 0, 'left'), 'right');
  assert.equal(resolveDirectionFromVector(-15, 0, 'left'), 'left');
});

test('diagonal hysteresis prevents direction flickering on near-diagonal motion', () => {
  const { resolveDirectionFromVector } = MayHomeMotion;

  let dir = 'right';
  const jitterVectors = [
    { dx: 10, dy: 9.5 },
    { dx: 10, dy: 10.8 }, // |dy| slightly > |dx| but within 18% margin (10 * 1.18 = 11.8)
    { dx: 10, dy: 9.2 },
    { dx: 10, dy: 11.2 },
    { dx: 10, dy: 10.1 }
  ];

  for (const v of jitterVectors) {
    dir = resolveDirectionFromVector(v.dx, v.dy, dir, { hysteresisRatio: 0.18 });
    assert.equal(dir, 'right', 'near-diagonal jitter within hysteresis threshold must not flicker to down');
  }

  // Once vertical component decisively exceeds horizontal + hysteresis (13.0 > 11.8), switches to down
  dir = resolveDirectionFromVector(10, 13.0, dir, { hysteresisRatio: 0.18 });
  assert.equal(dir, 'down', 'decisive vertical movement should switch facing to down');

  // Now vertical; near-diagonal horizontal jitter within hysteresis must not flicker back to right
  const vertJitter = [
    { dx: 9.5, dy: 10 },
    { dx: 10.8, dy: 10 },
    { dx: 9.0, dy: 10 }
  ];
  for (const v of vertJitter) {
    dir = resolveDirectionFromVector(v.dx, v.dy, dir, { hysteresisRatio: 0.18 });
    assert.equal(dir, 'down', 'near-diagonal horizontal jitter must not flicker back to right');
  }

  // Decisive horizontal switch to left
  dir = resolveDirectionFromVector(-13.5, 10, dir, { hysteresisRatio: 0.18 });
  assert.equal(dir, 'left', 'decisive leftward movement should switch facing to left');
});

test('retain direction at zero motion or sub-threshold displacement', () => {
  const { resolveDirectionFromVector } = MayHomeMotion;

  assert.equal(resolveDirectionFromVector(0, 0, 'up'), 'up');
  assert.equal(resolveDirectionFromVector(0, 0, 'left'), 'left');
  assert.equal(resolveDirectionFromVector(0, 0, 'right'), 'right');
  assert.equal(resolveDirectionFromVector(0, 0, 'down'), 'down');

  // Sub-epsilon displacement (< 1e-4) retains direction
  assert.equal(resolveDirectionFromVector(1e-5, 0, 'up'), 'up');
  assert.equal(resolveDirectionFromVector(0, -1e-5, 'left'), 'left');
  assert.equal(resolveDirectionFromVector(1e-6, -1e-6, 'right'), 'right');
});

test('frame advance based on travelled distance with ~76px stride and alternating legs', () => {
  const { computeWalkFrame } = MayHomeMotion;
  const stride = 76; // 4 steps: ~19px each

  // Step 0: contact A (col 0)
  assert.deepEqual(computeWalkFrame(0, stride), { frameIndex: 0, frameCol: 0, contactCol: 0 });
  assert.deepEqual(computeWalkFrame(10, stride), { frameIndex: 0, frameCol: 0, contactCol: 0 });

  // Step 1: passing A (col 1), contact stays at 0
  assert.deepEqual(computeWalkFrame(19, stride), { frameIndex: 1, frameCol: 1, contactCol: 0 });
  assert.deepEqual(computeWalkFrame(30, stride), { frameIndex: 1, frameCol: 1, contactCol: 0 });

  // Step 2: contact B (col 2), contact updates to 2
  assert.deepEqual(computeWalkFrame(38, stride), { frameIndex: 2, frameCol: 2, contactCol: 2 });
  assert.deepEqual(computeWalkFrame(50, stride), { frameIndex: 2, frameCol: 2, contactCol: 2 });

  // Step 3: passing B (col 3), contact stays at 2
  assert.deepEqual(computeWalkFrame(57, stride), { frameIndex: 3, frameCol: 3, contactCol: 2 });
  assert.deepEqual(computeWalkFrame(70, stride), { frameIndex: 3, frameCol: 3, contactCol: 2 });

  // Stride wraps at 76px -> contact A (col 0)
  assert.deepEqual(computeWalkFrame(76, stride), { frameIndex: 0, frameCol: 0, contactCol: 0 });
  assert.deepEqual(computeWalkFrame(76 + 38, stride), { frameIndex: 2, frameCol: 2, contactCol: 2 });

  // All 4 frame columns are visited in order across continuous traversal
  const seenFrames = [];
  for (let d = 0; d < 76; d += 5) {
    const f = computeWalkFrame(d, stride).frameCol;
    if (seenFrames[seenFrames.length - 1] !== f) {
      seenFrames.push(f);
    }
  }
  assert.deepEqual(seenFrames, [0, 1, 2, 3]);
});

test('malformed measured manifest is rejected with descriptive error', () => {
  const { buildSheetLayoutFromMeasuredManifest } = MayHomeMotion;

  // Null/non-object
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(null), /Missing or invalid/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest('string'), /Missing or invalid/);

  // Missing or non-positive referenceHeight
  assert.throws(() => buildSheetLayoutFromMeasuredManifest({ frames: [] }), /Invalid referenceHeight/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest({ referenceHeight: 0, frames: [] }), /Invalid referenceHeight/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest({ referenceHeight: -10, frames: [] }), /Invalid referenceHeight/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest({ referenceHeight: NaN, frames: [] }), /Invalid referenceHeight/);

  // Fewer than 16 frames
  assert.throws(() => buildSheetLayoutFromMeasuredManifest({ referenceHeight: 278, frames: [] }), /at least 16 frame/);

  // Frame missing / invalid properties
  const validFrame = (direction, col) => ({
    direction, col, x: 10, y: 10, w: 100, h: 100, anchorX: 50, anchorY: 90
  });

  const make16 = (tamperFn) => {
    const directions = ['down', 'right', 'up', 'left'];
    const frames = [];
    for (const dir of directions) {
      for (let c = 0; c < 4; c++) {
        frames.push(validFrame(dir, c));
      }
    }
    if (tamperFn) tamperFn(frames);
    return { referenceHeight: 278, frames };
  };

  // Bad direction
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[0].direction = 'diagonal'; })), /Invalid frame direction/);

  // Bad col
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[0].col = 5; })), /Invalid frame col/);

  // Non-positive dimensions or non-finite coords
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[0].w = 0; })), /Malformed crop coordinates/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[0].h = -5; })), /Malformed crop coordinates/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[0].anchorX = null; })), /Malformed crop coordinates/);
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[0].x = NaN; })), /Malformed crop coordinates/);

  // Missing frame coverage (duplicate col 0, missing col 1)
  assert.throws(() => buildSheetLayoutFromMeasuredManifest(make16(f => { f[1].col = 0; })), /Missing measured frame/);
});

test('source crops and pivots from production manifest are valid and scaled correctly', () => {
  const { buildSheetLayoutFromMeasuredManifest } = MayHomeMotion;
  const manifestPath = path.join(__dirname, 'assets', 'may-home-game', 'may-walk-directions-v1.json');
  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  const layout = buildSheetLayoutFromMeasuredManifest(manifest, { targetWorldHeight: 150 });

  assert.equal(layout.referenceHeight, 278);
  assert.equal(layout.targetWorldHeight, 150);
  assert.equal(layout.scale, 150 / 278);

  const directions = ['down', 'right', 'up', 'left'];
  for (const dir of directions) {
    const row = layout.rows[dir];
    assert.ok(row, `row for ${dir} should exist`);
    assert.equal(row.direction, dir);
    assert.equal(row.scale, 150 / 278);
    assert.equal(row.frames.length, 4);

    for (let col = 0; col < 4; col++) {
      const f = row.frames[col];
      assert.equal(f.direction, dir);
      assert.equal(f.col, col);
      assert.equal(f.scale, 150 / 278);

      // Verify crop rectangle fits in sheet bounds (1254 x 1254)
      assert.ok(f.sx >= 0 && f.sx + f.sw <= layout.width, `frame ${dir}[${col}] sx+sw inside sheet width`);
      assert.ok(f.sy >= 0 && f.sy + f.sh <= layout.height, `frame ${dir}[${col}] sy+sh inside sheet height`);

      // Verify anchors are within source frame crop bounds
      assert.ok(f.anchorX >= 0 && f.anchorX <= f.sw, `frame ${dir}[${col}] anchorX within sw`);
      assert.ok(f.anchorY >= 0 && f.anchorY <= f.sh, `frame ${dir}[${col}] anchorY within sh`);
    }
  }

  // Spot-check known down-0 frame values from manifest
  const down0 = layout.rows.down.frames[0];
  assert.equal(down0.sx, 36);
  assert.equal(down0.sy, 33);
  assert.equal(down0.sw, 279);
  assert.equal(down0.sh, 280);
  assert.equal(down0.anchorX, 129.0);
  assert.equal(down0.anchorY, 276);
});
