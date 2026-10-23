'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var MayWalkMotion = require('./motion.js');

test('Cardinal directions map to exact sprite rows and never snap to front at stop', function () {
  var ctrl = MayWalkMotion.createMotionController({
    startX: 750,
    startY: 610
  });

  // Walk RIGHT
  ctrl.retarget(900, 610);
  var snapRight = ctrl.update(0.05);
  assert.equal(snapRight.direction, 'right');
  assert.equal(snapRight.directionRow, 1);
  assert.ok(snapRight.x > 750, 'should advance +x when walking right');
  assert.equal(snapRight.y, 610);

  // Walk UP (BACK)
  ctrl.resetToStart();
  ctrl.retarget(750, 500);
  var snapUp = ctrl.update(0.05);
  assert.equal(snapUp.direction, 'up');
  assert.equal(snapUp.directionRow, 2);
  assert.ok(snapUp.y < 610, 'should advance -y when walking up');

  // Stop while facing UP: must retain 'up' and never snap back to 'down'
  var snapStopped = ctrl.stop();
  assert.equal(snapStopped.motionState, 'stopped');
  assert.equal(snapStopped.direction, 'up');
  assert.equal(snapStopped.directionRow, 2);

  // Walk LEFT
  ctrl.resetToStart();
  ctrl.retarget(620, 610);
  var snapLeft = ctrl.update(0.05);
  assert.equal(snapLeft.direction, 'left');
  assert.equal(snapLeft.directionRow, 3);
  assert.ok(snapLeft.x < 750, 'should advance -x when walking left');

  // Walk DOWN (FRONT)
  ctrl.resetToStart();
  ctrl.retarget(750, 710);
  var snapDown = ctrl.update(0.05);
  assert.equal(snapDown.direction, 'down');
  assert.equal(snapDown.directionRow, 0);
  assert.ok(snapDown.y > 610, 'should advance +y when walking down');
});

test('Movement progresses from dt with gentle acceleration and distance-keyed alternating foot frames', function () {
  var ctrl = MayWalkMotion.createMotionController({
    startX: 750,
    startY: 610,
    strideLength: 80,
    frameSequence: [0, 1, 2, 3]
  });

  ctrl.retarget(1050, 610);

  var snap1 = ctrl.update(0.016);
  var snap2 = ctrl.update(0.016);
  assert.ok(snap2.speed > snap1.speed, 'speed should accelerate gently over initial dt ticks');
  assert.ok(snap2.x > snap1.x, 'x should progress monotonically toward right target');

  var seenFrames = new Set([snap1.frameCol, snap2.frameCol]);
  for (var i = 0; i < 60; i++) {
    var s = ctrl.update(0.02);
    seenFrames.add(s.frameCol);
    assert.equal(s.direction, 'right');
  }

  assert.deepEqual(
    Array.from(seenFrames).sort(),
    [0, 1, 2, 3],
    'distance-keyed gait should cycle through all 4 foot poses (contact A, passing A, contact B, passing B)'
  );
});

test('Retarget brakes and turns without teleporting or moonwalking', function () {
  var ctrl = MayWalkMotion.createMotionController({
    startX: 750,
    startY: 610
  });

  // Accelerate rightward first
  ctrl.retarget(1050, 610);
  for (var i = 0; i < 12; i++) {
    ctrl.update(0.02);
  }
  var beforeRetarget = ctrl.getSnapshot();
  assert.equal(beforeRetarget.direction, 'right');
  assert.ok(beforeRetarget.speed > 50);

  // Immediately retarget to the LEFT
  var afterRetargetCall = ctrl.retarget(680, 610);
  assert.equal(afterRetargetCall.x, beforeRetarget.x, 'retarget must not teleport x');
  assert.equal(afterRetargetCall.y, beforeRetarget.y, 'retarget must not teleport y');

  var prevX = afterRetargetCall.x;
  var prevY = afterRetargetCall.y;
  for (var t = 0; t < 40; t++) {
    var tickSnap = ctrl.update(0.02);
    var stepDx = tickSnap.x - prevX;
    var stepDy = tickSnap.y - prevY;
    var stepDist = Math.hypot(stepDx, stepDy);

    // Position delta in single 20ms frame must be bounded by maxSpeed * dt (no teleport)
    assert.ok(stepDist <= 155 * 0.02 + 1e-5, 'frame displacement must never teleport');

    // Never moonwalk: if physically moving right during braking, facing must be right;
    // once physically moving left, facing must be left.
    if (stepDx > 1e-3) {
      assert.equal(tickSnap.direction, 'right', 'while braking rightward, must still face right');
    } else if (stepDx < -1e-3) {
      assert.equal(tickSnap.direction, 'left', 'once moving leftward, must face left');
    }

    prevX = tickSnap.x;
    prevY = tickSnap.y;
  }

  var finalSnap = ctrl.getSnapshot();
  assert.equal(finalSnap.direction, 'left');
  assert.ok(finalSnap.x < beforeRetarget.x, 'should have turned and progressed leftward');
});

test('Stop freezes position immediately, cancels arrival, and resuming preserves gait', function () {
  var arrivals = 0;
  var ctrl = MayWalkMotion.createMotionController({
    startX: 750,
    startY: 610,
    strideLength: 76,
    onArrive: function () {
      arrivals += 1;
    }
  });

  ctrl.retarget(950, 610);
  for (var i = 0; i < 10; i++) {
    ctrl.update(0.025);
  }

  var stopped = ctrl.stop();
  var frozenX = stopped.x;
  var frozenY = stopped.y;
  var savedGait = stopped.gaitDistance;

  assert.equal(stopped.motionState, 'stopped');
  assert.equal(stopped.speed, 0);
  assert.ok(savedGait > 0, 'gaitDistance should be accumulated before stop');

  // Additional dt updates while stopped must not move or trigger arrival
  for (var j = 0; j < 20; j++) {
    var postStop = ctrl.update(0.05);
    assert.equal(postStop.x, frozenX);
    assert.equal(postStop.y, frozenY);
    assert.equal(postStop.motionState, 'stopped');
  }
  assert.equal(arrivals, 0);
  assert.equal(ctrl.getSnapshot().arrivalCount, 0);

  // Resuming preserves gaitDistance instead of resetting to 0
  ctrl.retarget(950, 610);
  var resumed = ctrl.update(0.02);
  assert.ok(resumed.gaitDistance > savedGait, 'resuming must continue from preserved gaitDistance');
});

test('Default rectangle route traverses all 4 directions, settles for 200ms retaining final facing, and arrives exactly once', function () {
  var arrivals = 0;
  var ctrl = MayWalkMotion.createMotionController({
    startX: 750,
    startY: 610,
    settleDurationMs: 200,
    onArrive: function () {
      arrivals += 1;
    }
  });

  ctrl.startDefaultRoute();
  var observedDirections = [];
  var sawSettling = false;

  for (var i = 0; i < 600; i++) {
    var s = ctrl.update(0.025);
    if (observedDirections[observedDirections.length - 1] !== s.direction) {
      observedDirections.push(s.direction);
    }
    if (s.motionState === 'settling') {
      sawSettling = true;
      assert.equal(s.direction, 'up', 'final leg of default rectangle is upward and settle must retain facing');
    }
    if (s.motionState === 'idle') {
      break;
    }
  }

  var finalSnap = ctrl.getSnapshot();
  assert.ok(sawSettling, 'should enter settling phase at end of route');
  assert.equal(finalSnap.motionState, 'idle');
  assert.equal(finalSnap.direction, 'up', 'must retain final upward direction at rest without snapping to front');
  assert.equal(finalSnap.arrivalCount, 1);
  assert.equal(arrivals, 1);
  assert.deepEqual(observedDirections, ['right', 'down', 'left', 'up']);

  // Further ticks after arrival must never fire arrival again
  for (var k = 0; k < 20; k++) {
    ctrl.update(0.05);
  }
  assert.equal(ctrl.getSnapshot().arrivalCount, 1);
  assert.equal(arrivals, 1);
});

test('Near-diagonal jitter does not flicker facing due to dominant-axis hysteresis', function () {
  var dir = 'right';
  var jitterVectors = [
    { dx: 10, dy: 9.5 },
    { dx: 10, dy: 10.8 }, // |dy| slightly > |dx| but within 18% hysteresis margin
    { dx: 10, dy: 9.2 },
    { dx: 10, dy: 11.2 },
    { dx: 10, dy: 10.1 }
  ];

  for (var i = 0; i < jitterVectors.length; i++) {
    var v = jitterVectors[i];
    dir = MayWalkMotion.resolveDirectionFromVector(v.dx, v.dy, dir, { hysteresisRatio: 0.18 });
    assert.equal(dir, 'right', 'near-diagonal jitter within hysteresis threshold must not flicker to down');
  }

  // Once vertical component decisively exceeds horizontal + hysteresis, it switches cleanly to down
  dir = MayWalkMotion.resolveDirectionFromVector(10, 13.0, dir, { hysteresisRatio: 0.18 });
  assert.equal(dir, 'down');
});

test('Reduced-motion mode moves instantly to endpoint, sets final direction, and stays idle', function () {
  var arrivals = 0;
  var ctrl = MayWalkMotion.createMotionController({
    startX: 750,
    startY: 610,
    reducedMotion: true,
    onArrive: function () {
      arrivals += 1;
    }
  });

  var snap = ctrl.startDefaultRoute();
  var expectedEnd = MayWalkMotion.DEFAULT_RECTANGLE_ROUTE[MayWalkMotion.DEFAULT_RECTANGLE_ROUTE.length - 1];
  assert.equal(snap.x, expectedEnd.x);
  assert.equal(snap.y, expectedEnd.y);
  assert.equal(snap.motionState, 'idle');
  assert.equal(snap.direction, 'up');
  assert.equal(snap.arrivalCount, 1);
  assert.equal(arrivals, 1);
});

test('Row-normalized layout enforces common scale per row and tail-resistant horizontal pivot', function () {
  var cellW = 100;
  var cellH = 100;
  var rgba = new Uint8ClampedArray(cellW * cellH * 4);

  // Draw dense cat body at x: 40..60, y: 20..90
  for (var y = 20; y <= 90; y++) {
    for (var x = 40; x <= 60; x++) {
      rgba[(y * cellW + x) * 4 + 3] = 255;
    }
  }
  // Draw thin protruding side tail at x: 15..39, y: 55..60
  for (var ty = 55; ty <= 60; ty++) {
    for (var tx = 15; tx <= 39; tx++) {
      rgba[(ty * cellW + tx) * 4 + 3] = 255;
    }
  }

  var bounds = MayWalkMotion.extractCellAlphaBounds(rgba, cellW, cellH);
  assert.equal(bounds.minX, 15);
  assert.equal(bounds.maxX, 60);
  assert.equal(bounds.footY, 90);
  // Naive bbox midpoint would be (15+60)/2 = 37.5 (pulled into the tail);
  // torso/foot-weighted pivot stays centered on the body (48..52)
  assert.ok(bounds.pivotX >= 48 && bounds.pivotX <= 52, 'pivotX should stay on torso/feet, not pulled by tail');

  // Verify all 4 frames in a row share one common scale even if passing frame boundsH differs slightly
  var mockCells = {
    down: [
      { empty: false, boundsH: 70, pivotX: 50, footY: 90 },
      { empty: false, boundsH: 73, pivotX: 50, footY: 90 },
      { empty: false, boundsH: 70, pivotX: 50, footY: 90 },
      { empty: false, boundsH: 72, pivotX: 50, footY: 90 }
    ],
    right: [],
    up: [],
    left: []
  };
  var layout = MayWalkMotion.buildSheetLayoutFromCellBounds(mockCells, cellW, cellH, MayWalkMotion.DEFAULT_MANIFEST);
  var downFrames = layout.rows.down.frames;
  assert.equal(downFrames[0].scale, downFrames[1].scale);
  assert.equal(downFrames[1].scale, downFrames[2].scale);
  assert.equal(downFrames[2].scale, downFrames[3].scale);
});
