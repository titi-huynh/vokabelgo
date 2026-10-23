(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MayWalkMotion = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var DIRECTIONS = Object.freeze({
    DOWN: 'down',
    RIGHT: 'right',
    UP: 'up',
    LEFT: 'left'
  });

  var ROW_BY_DIRECTION = Object.freeze({
    down: 0,
    right: 1,
    up: 2,
    left: 3
  });

  var DIRECTION_LABELS_VI = Object.freeze({
    down: 'Xuống (Front)',
    right: 'Phải (Right)',
    up: 'Lên (Back)',
    left: 'Trái (Left)'
  });

  var STATE_LABELS_VI = Object.freeze({
    idle: 'Đang đứng yên',
    walking: 'Đang bước đi',
    settling: 'Đang dừng nhịp',
    stopped: 'Đã dừng'
  });

  var DEFAULT_START_POINT = Object.freeze({ x: 750, y: 610 });

  // Open lower-middle lawn rectangle route within x:750..1060, y:610..720
  // Covers all 4 cardinal directions: right -> down -> left -> up
  var DEFAULT_RECTANGLE_ROUTE = Object.freeze([
    Object.freeze({ x: 1050, y: 610 }),
    Object.freeze({ x: 1050, y: 715 }),
    Object.freeze({ x: 750, y: 715 }),
    Object.freeze({ x: 750, y: 625 })
  ]);

  var LAWN_SAFE_BOUNDS = Object.freeze({
    minX: 680,
    maxX: 1120,
    minY: 575,
    maxY: 745
  });

  // Plain editable manifest for sprite extraction & per-row/per-frame pivot tuning.
  // Codex or maintainers can inspect and adjust row scales or frame pivots here.
  var DEFAULT_MANIFEST = {
    spriteSheetUrl: '/assets/may-home-game/may-walk-directions-v1.png',
    spriteManifestUrl: '/assets/may-home-game/may-walk-directions-v1.json',
    referenceStillUrl: '/assets/may-home-game/may-sprites.png',
    backgroundUrl: '/assets/may-home-game/garden-background-flat-v3.png',
    worldWidth: 1672,
    worldHeight: 941,
    gridRows: 4,
    gridCols: 4,
    targetWorldHeight: 130,
    alphaThreshold: 16,
    cellInsetPx: 2,
    strideLength: 76,
    frameSequence: [0, 1, 2, 3],
    contactFrames: [0, 2],
    rows: {
      down: { rowIndex: 0, scale: 1.0, pivotXOffset: 0, footYOffset: 0, referenceHeight: null },
      right: { rowIndex: 1, scale: 1.0, pivotXOffset: 0, footYOffset: 0, referenceHeight: null },
      up: { rowIndex: 2, scale: 1.0, pivotXOffset: 0, footYOffset: 0, referenceHeight: null },
      left: { rowIndex: 3, scale: 1.0, pivotXOffset: 0, footYOffset: 0, referenceHeight: null }
    },
    frames: {
      down: [
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 }
      ],
      right: [
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 }
      ],
      up: [
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 }
      ],
      left: [
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 },
        { pivotX: null, footY: null, offsetX: 0, offsetY: 0 }
      ]
    }
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isValidDirection(dir) {
    return dir === 'down' || dir === 'right' || dir === 'up' || dir === 'left';
  }

  /**
   * Resolves facing direction from actual physical displacement vector (dx, dy)
   * using dominant axis with hysteresis to prevent flicker on near-diagonal movement.
   * Holds currentDirection when displacement is below minMoveEpsilon.
   */
  function resolveDirectionFromVector(dx, dy, currentDirection, options) {
    var opts = options || {};
    var epsilon = typeof opts.minMoveEpsilon === 'number' ? opts.minMoveEpsilon : 1e-4;
    var hysteresis = typeof opts.hysteresisRatio === 'number' ? opts.hysteresisRatio : 0.18;
    var fallbackDir = isValidDirection(currentDirection) ? currentDirection : DIRECTIONS.DOWN;

    var absX = Math.abs(dx);
    var absY = Math.abs(dy);
    var dist = Math.hypot(dx, dy);

    if (dist < epsilon) {
      return fallbackDir;
    }

    var horizDir = dx >= 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
    var vertDir = dy >= 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;

    var isCurrentlyHorizontal = fallbackDir === DIRECTIONS.LEFT || fallbackDir === DIRECTIONS.RIGHT;
    var isCurrentlyVertical = fallbackDir === DIRECTIONS.UP || fallbackDir === DIRECTIONS.DOWN;

    if (isCurrentlyHorizontal) {
      // Require vertical component to exceed horizontal by hysteresis margin to switch axis
      if (absY > absX * (1 + hysteresis)) {
        return vertDir;
      }
      if (absX > epsilon) {
        return horizDir;
      }
      return vertDir;
    }

    if (isCurrentlyVertical) {
      // Require horizontal component to exceed vertical by hysteresis margin to switch axis
      if (absX > absY * (1 + hysteresis)) {
        return horizDir;
      }
      if (absY > epsilon) {
        return vertDir;
      }
      return horizDir;
    }

    return absX >= absY ? horizDir : vertDir;
  }

  /**
   * Computes alpha bounding box, bottom ground contact, and tail-resistant horizontal torso/foot pivot
   * for a single cell buffer of width cellW and height cellH (RGBA Uint8Array/Uint8ClampedArray).
   */
  function extractCellAlphaBounds(rgba, cellW, cellH, options) {
    var opts = options || {};
    var alphaThreshold = typeof opts.alphaThreshold === 'number' ? opts.alphaThreshold : 16;
    var inset = typeof opts.cellInsetPx === 'number' ? Math.max(0, opts.cellInsetPx) : 0;

    var startX = Math.min(cellW - 1, inset);
    var endX = Math.max(startX, cellW - 1 - inset);
    var startY = Math.min(cellH - 1, inset);
    var endY = Math.max(startY, cellH - 1 - inset);

    var minX = cellW;
    var minY = cellH;
    var maxX = -1;
    var maxY = -1;

    for (var y = startY; y <= endY; y++) {
      var rowOffset = y * cellW * 4;
      for (var x = startX; x <= endX; x++) {
        var alpha = rgba[rowOffset + x * 4 + 3];
        if (alpha > alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return {
        empty: true,
        minX: 0,
        minY: 0,
        maxX: cellW - 1,
        maxY: cellH - 1,
        boundsW: cellW,
        boundsH: cellH,
        pivotX: cellW * 0.5,
        footY: cellH - 1
      };
    }

    var boundsW = maxX - minX + 1;
    var boundsH = maxY - minY + 1;

    // Compute horizontal torso/foot pivot that resists side-tail extension:
    // 1) Measure vertical opaque pixel count per column across main body band (15%..95% of boundsH)
    var bodyBandTop = minY + Math.floor(boundsH * 0.15);
    var bodyBandBottom = minY + Math.ceil(boundsH * 0.95);
    var colCounts = new Array(boundsW);
    var maxColCount = 0;

    for (var cx = minX; cx <= maxX; cx++) {
      var count = 0;
      for (var cy = bodyBandTop; cy <= bodyBandBottom; cy++) {
        if (rgba[(cy * cellW + cx) * 4 + 3] > alphaThreshold) {
          count++;
        }
      }
      colCounts[cx - minX] = count;
      if (count > maxColCount) {
        maxColCount = count;
      }
    }

    // Columns with >= 45% of peak vertical thickness represent torso/head core rather than thin protruding tail
    var coreThreshold = Math.max(1, maxColCount * 0.45);
    var weightedSumX = 0;
    var totalWeight = 0;
    for (var i = 0; i < boundsW; i++) {
      var cCount = colCounts[i];
      if (cCount >= coreThreshold) {
        var weight = cCount * cCount;
        weightedSumX += (minX + i) * weight;
        totalWeight += weight;
      }
    }

    var coreCenterX = totalWeight > 0 ? weightedSumX / totalWeight : (minX + maxX) * 0.5;

    // 2) Also sample the bottom foot contact zone (bottom 22% of boundsH)
    var footZoneTop = Math.max(minY, maxY - Math.max(2, Math.floor(boundsH * 0.22)));
    var footSumX = 0;
    var footCount = 0;
    for (var fy = footZoneTop; fy <= maxY; fy++) {
      var fRowOffset = fy * cellW * 4;
      for (var fx = minX; fx <= maxX; fx++) {
        if (rgba[fRowOffset + fx * 4 + 3] > alphaThreshold) {
          footSumX += fx;
          footCount++;
        }
      }
    }
    var footCenterX = footCount > 0 ? footSumX / footCount : coreCenterX;

    // Blend dense torso core (65%) with foot contact center (35%) for rock-steady ground pivot
    var pivotX = coreCenterX * 0.65 + footCenterX * 0.35;
    var footY = maxY;

    return {
      empty: false,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      boundsW: boundsW,
      boundsH: boundsH,
      pivotX: pivotX,
      footY: footY
    };
  }

  /**
   * Builds normalized row & frame layout from extracted 4x4 cell bounds and manifest config.
   * Ensures a single common scale per row (preventing vertical pumping between contact and passing frames).
   */
  function buildSheetLayoutFromCellBounds(cellsByDirection, cellW, cellH, manifestConfig) {
    var manifest = manifestConfig || DEFAULT_MANIFEST;
    var targetWorldHeight = manifest.targetWorldHeight || 130;
    var layout = {
      cellW: cellW,
      cellH: cellH,
      targetWorldHeight: targetWorldHeight,
      rows: {}
    };

    var dirKeys = [DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.UP, DIRECTIONS.LEFT];
    for (var d = 0; d < dirKeys.length; d++) {
      var dir = dirKeys[d];
      var rowIndex = ROW_BY_DIRECTION[dir];
      var rowCfg = (manifest.rows && manifest.rows[dir]) || {};
      var frameCfgs = (manifest.frames && manifest.frames[dir]) || [];
      var rawCells = (cellsByDirection && cellsByDirection[dir]) || [];

      var heights = [];
      for (var c = 0; c < rawCells.length; c++) {
        if (rawCells[c] && !rawCells[c].empty && rawCells[c].boundsH > 0) {
          heights.push(rawCells[c].boundsH);
        }
      }

      var referenceHeight;
      if (typeof rowCfg.referenceHeight === 'number' && rowCfg.referenceHeight > 0) {
        referenceHeight = rowCfg.referenceHeight;
      } else if (heights.length > 0) {
        // Use median height across the row's frames for stable apparent body height
        var sorted = heights.slice().sort(function (a, b) { return a - b; });
        var mid = Math.floor(sorted.length / 2);
        referenceHeight = sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) * 0.5;
      } else {
        referenceHeight = cellH * 0.75;
      }

      var rowScaleMultiplier = typeof rowCfg.scale === 'number' ? rowCfg.scale : 1.0;
      var rowScale = (targetWorldHeight * rowScaleMultiplier) / referenceHeight;

      var frames = [];
      for (var col = 0; col < 4; col++) {
        var cell = rawCells[col] || {
          empty: true,
          minX: 0,
          minY: 0,
          maxX: cellW - 1,
          maxY: cellH - 1,
          boundsW: cellW,
          boundsH: cellH,
          pivotX: cellW * 0.5,
          footY: cellH - 1
        };
        var fCfg = frameCfgs[col] || {};
        var effectivePivotX = (typeof fCfg.pivotX === 'number' ? fCfg.pivotX : cell.pivotX) +
          (rowCfg.pivotXOffset || 0) + (fCfg.offsetX || 0);
        var effectiveFootY = (typeof fCfg.footY === 'number' ? fCfg.footY : cell.footY) +
          (rowCfg.footYOffset || 0) + (fCfg.offsetY || 0);

        frames.push({
          row: rowIndex,
          col: col,
          sx: col * cellW,
          sy: rowIndex * cellH,
          sw: cellW,
          sh: cellH,
          bounds: cell,
          pivotXInCell: effectivePivotX,
          footYInCell: effectiveFootY,
          scale: rowScale
        });
      }

      layout.rows[dir] = {
        direction: dir,
        rowIndex: rowIndex,
        referenceHeight: referenceHeight,
        scale: rowScale,
        frames: frames
      };
    }

    return layout;
  }

  /**
   * Creates a deterministic Mây walking motion controller.
   */
  function createMotionController(options) {
    var opts = options || {};
    var startX = typeof opts.startX === 'number' ? opts.startX : DEFAULT_START_POINT.x;
    var startY = typeof opts.startY === 'number' ? opts.startY : DEFAULT_START_POINT.y;
    var maxSpeed = typeof opts.maxSpeed === 'number' ? opts.maxSpeed : 155;
    var accel = typeof opts.accel === 'number' ? opts.accel : 440;
    var decel = typeof opts.decel === 'number' ? opts.decel : 540;
    var turnBrakeDecel = typeof opts.turnBrakeDecel === 'number' ? opts.turnBrakeDecel : 860;
    var strideLength = typeof opts.strideLength === 'number' ? opts.strideLength : DEFAULT_MANIFEST.strideLength;
    var frameSequence = Array.isArray(opts.frameSequence) && opts.frameSequence.length > 0
      ? opts.frameSequence.slice()
      : DEFAULT_MANIFEST.frameSequence.slice();
    var settleDurationMs = typeof opts.settleDurationMs === 'number'
      ? clamp(opts.settleDurationMs, 150, 250)
      : 200;
    var hysteresisRatio = typeof opts.hysteresisRatio === 'number' ? opts.hysteresisRatio : 0.18;
    var arrivalRadius = typeof opts.arrivalRadius === 'number' ? opts.arrivalRadius : 1.5;
    var reducedMotion = Boolean(opts.reducedMotion);
    var onArrive = typeof opts.onArrive === 'function' ? opts.onArrive : null;

    var state = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      speed: 0,
      direction: isValidDirection(opts.initialDirection) ? opts.initialDirection : DIRECTIONS.DOWN,
      motionState: 'idle', // 'idle' | 'walking' | 'settling' | 'stopped'
      frameIndex: 0,
      frameCol: frameSequence[0],
      distanceTravelled: 0,
      gaitDistance: 0,
      lastContactSlot: 0, // 0 -> frameSequence[0], 2 -> frameSequence[2]
      waypoints: [],
      waypointIndex: 0,
      settleRemainingMs: 0,
      arrivalCount: 0,
      reducedMotion: reducedMotion
    };

    function getActiveContactCol() {
      var idx = state.lastContactSlot % frameSequence.length;
      return frameSequence[idx];
    }

    function computeWalkFrameFromGait() {
      var stepLen = strideLength / frameSequence.length;
      if (stepLen <= 0) return frameSequence[0];
      var rawIdx = Math.floor(state.gaitDistance / stepLen) % frameSequence.length;
      state.frameIndex = rawIdx;
      if (rawIdx === 0 || rawIdx === 2) {
        state.lastContactSlot = rawIdx;
      }
      return frameSequence[rawIdx];
    }

    function applyReducedMotionJump(points) {
      if (!points || points.length === 0) return getSnapshot();
      var prevX = state.x;
      var prevY = state.y;
      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        var dx = pt.x - prevX;
        var dy = pt.y - prevY;
        var segDist = Math.hypot(dx, dy);
        if (segDist > 1e-4) {
          state.direction = resolveDirectionFromVector(dx, dy, state.direction, {
            hysteresisRatio: hysteresisRatio
          });
          state.distanceTravelled += segDist;
        }
        prevX = pt.x;
        prevY = pt.y;
      }
      var finalPt = points[points.length - 1];
      state.x = finalPt.x;
      state.y = finalPt.y;
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
      state.waypoints = [];
      state.waypointIndex = 0;
      state.settleRemainingMs = 0;
      state.motionState = 'idle';
      state.frameIndex = state.lastContactSlot;
      state.frameCol = getActiveContactCol();
      state.arrivalCount += 1;
      if (onArrive) {
        onArrive(getSnapshot());
      }
      return getSnapshot();
    }

    function setRoute(waypoints) {
      if (!Array.isArray(waypoints) || waypoints.length === 0) {
        return getSnapshot();
      }
      var sanitized = [];
      for (var i = 0; i < waypoints.length; i++) {
        var wp = waypoints[i];
        if (wp && typeof wp.x === 'number' && typeof wp.y === 'number') {
          sanitized.push({ x: wp.x, y: wp.y });
        }
      }
      if (sanitized.length === 0) {
        return getSnapshot();
      }

      if (state.reducedMotion) {
        return applyReducedMotionJump(sanitized);
      }

      state.waypoints = sanitized;
      state.waypointIndex = 0;
      state.settleRemainingMs = 0;
      state.motionState = 'walking';
      state.frameCol = computeWalkFrameFromGait();
      return getSnapshot();
    }

    function retarget(targetX, targetY) {
      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        return getSnapshot();
      }
      return setRoute([{ x: targetX, y: targetY }]);
    }

    function stepDirection(direction, stepDistance) {
      if (!isValidDirection(direction)) {
        return getSnapshot();
      }
      var dist = typeof stepDistance === 'number' && stepDistance > 0 ? stepDistance : 135;
      var tx = state.x;
      var ty = state.y;
      if (direction === DIRECTIONS.LEFT) tx -= dist;
      if (direction === DIRECTIONS.RIGHT) tx += dist;
      if (direction === DIRECTIONS.UP) ty -= dist;
      if (direction === DIRECTIONS.DOWN) ty += dist;

      tx = clamp(tx, LAWN_SAFE_BOUNDS.minX, LAWN_SAFE_BOUNDS.maxX);
      ty = clamp(ty, LAWN_SAFE_BOUNDS.minY, LAWN_SAFE_BOUNDS.maxY);

      return retarget(tx, ty);
    }

    function startDefaultRoute() {
      return setRoute(DEFAULT_RECTANGLE_ROUTE);
    }

    function stop() {
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
      state.waypoints = [];
      state.waypointIndex = 0;
      state.settleRemainingMs = 0;
      state.motionState = 'stopped';
      // Freeze on contact pose while preserving gaitDistance and current direction
      state.frameCol = getActiveContactCol();
      return getSnapshot();
    }

    function resetToStart() {
      state.x = startX;
      state.y = startY;
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
      state.direction = DIRECTIONS.DOWN;
      state.motionState = 'idle';
      state.frameIndex = 0;
      state.frameCol = frameSequence[0];
      state.distanceTravelled = 0;
      state.gaitDistance = 0;
      state.lastContactSlot = 0;
      state.waypoints = [];
      state.waypointIndex = 0;
      state.settleRemainingMs = 0;
      return getSnapshot();
    }

    function setReducedMotion(enabled) {
      state.reducedMotion = Boolean(enabled);
      if (state.reducedMotion && state.motionState === 'walking' && state.waypoints.length > 0) {
        var remaining = state.waypoints.slice(state.waypointIndex);
        applyReducedMotionJump(remaining);
      } else if (state.reducedMotion && state.motionState === 'settling') {
        state.settleRemainingMs = 0;
        state.motionState = 'idle';
        state.frameCol = getActiveContactCol();
        state.arrivalCount += 1;
        if (onArrive) {
          onArrive(getSnapshot());
        }
      }
      return getSnapshot();
    }

    function update(dtSeconds) {
      if (typeof dtSeconds !== 'number' || !(dtSeconds > 0)) {
        return getSnapshot();
      }
      if (state.reducedMotion) {
        return getSnapshot();
      }

      var dt = Math.min(dtSeconds, 0.1);

      if (state.motionState === 'settling') {
        state.settleRemainingMs -= dt * 1000;
        state.vx = 0;
        state.vy = 0;
        state.speed = 0;
        state.frameCol = getActiveContactCol();
        if (state.settleRemainingMs <= 0) {
          state.settleRemainingMs = 0;
          state.motionState = 'idle';
          state.arrivalCount += 1;
          if (onArrive) {
            onArrive(getSnapshot());
          }
        }
        return getSnapshot();
      }

      if (state.motionState !== 'walking') {
        return getSnapshot();
      }

      if (state.waypointIndex >= state.waypoints.length) {
        state.vx = 0;
        state.vy = 0;
        state.speed = 0;
        state.motionState = 'settling';
        state.settleRemainingMs = settleDurationMs;
        state.frameCol = getActiveContactCol();
        return getSnapshot();
      }

      var target = state.waypoints[state.waypointIndex];
      var toTargetX = target.x - state.x;
      var toTargetY = target.y - state.y;
      var distToTarget = Math.hypot(toTargetX, toTargetY);

      var isFinalWaypoint = state.waypointIndex === state.waypoints.length - 1;

      if (distToTarget <= arrivalRadius) {
        var snapDx = target.x - state.x;
        var snapDy = target.y - state.y;
        var snapDist = Math.hypot(snapDx, snapDy);
        state.x = target.x;
        state.y = target.y;
        if (snapDist > 1e-4) {
          state.distanceTravelled += snapDist;
          state.gaitDistance += snapDist;
          state.direction = resolveDirectionFromVector(snapDx, snapDy, state.direction, {
            hysteresisRatio: hysteresisRatio
          });
        }
        state.waypointIndex += 1;
        if (state.waypointIndex >= state.waypoints.length) {
          state.vx = 0;
          state.vy = 0;
          state.speed = 0;
          state.motionState = 'settling';
          state.settleRemainingMs = settleDurationMs;
          state.frameCol = getActiveContactCol();
        }
        return getSnapshot();
      }

      var dirX = toTargetX / distToTarget;
      var dirY = toTargetY / distToTarget;

      // Check if we are currently moving in a conflicting direction (retarget brake & turn)
      var currentSpeed = Math.hypot(state.vx, state.vy);
      if (currentSpeed > 1e-3) {
        var curDirX = state.vx / currentSpeed;
        var curDirY = state.vy / currentSpeed;
        var alignment = curDirX * dirX + curDirY * dirY;

        if (alignment < 0.25) {
          // Smoothly brake along current velocity vector before turning to new heading
          var brakedSpeed = Math.max(0, currentSpeed - turnBrakeDecel * dt);
          var avgBrakeSpeed = (currentSpeed + brakedSpeed) * 0.5;
          var brakeStep = avgBrakeSpeed * dt;
          var moveDx = curDirX * brakeStep;
          var moveDy = curDirY * brakeStep;

          state.x += moveDx;
          state.y += moveDy;
          state.vx = curDirX * brakedSpeed;
          state.vy = curDirY * brakedSpeed;
          state.speed = brakedSpeed;

          if (brakeStep > 1e-4) {
            state.distanceTravelled += brakeStep;
            state.gaitDistance += brakeStep;
            state.direction = resolveDirectionFromVector(moveDx, moveDy, state.direction, {
              hysteresisRatio: hysteresisRatio
            });
            state.frameCol = computeWalkFrameFromGait();
          }
          return getSnapshot();
        }
      }

      // Compute desired speed with gentle braking when approaching final waypoint (or sharp corner)
      var stoppingDist = (currentSpeed * currentSpeed) / (2 * decel);
      var targetSpeed = maxSpeed;
      if (isFinalWaypoint && distToTarget <= stoppingDist + 8) {
        targetSpeed = Math.min(maxSpeed, Math.max(18, Math.sqrt(2 * decel * distToTarget)));
      } else if (!isFinalWaypoint && distToTarget <= stoppingDist * 0.65) {
        targetSpeed = Math.min(maxSpeed, Math.max(maxSpeed * 0.55, Math.sqrt(2 * decel * distToTarget)));
      }

      var nextSpeed;
      if (currentSpeed < targetSpeed) {
        nextSpeed = Math.min(targetSpeed, currentSpeed + accel * dt);
      } else {
        nextSpeed = Math.max(targetSpeed, currentSpeed - decel * dt);
      }

      var stepDist = nextSpeed * dt;
      var actualDx;
      var actualDy;

      if (stepDist >= distToTarget) {
        actualDx = toTargetX;
        actualDy = toTargetY;
        stepDist = distToTarget;
        state.x = target.x;
        state.y = target.y;
        state.waypointIndex += 1;
      } else {
        actualDx = dirX * stepDist;
        actualDy = dirY * stepDist;
        state.x += actualDx;
        state.y += actualDy;
      }

      state.vx = dirX * nextSpeed;
      state.vy = dirY * nextSpeed;
      state.speed = nextSpeed;

      if (stepDist > 1e-4) {
        state.distanceTravelled += stepDist;
        state.gaitDistance += stepDist;
        state.direction = resolveDirectionFromVector(actualDx, actualDy, state.direction, {
          hysteresisRatio: hysteresisRatio
        });
        state.frameCol = computeWalkFrameFromGait();
      }

      if (state.waypointIndex >= state.waypoints.length) {
        state.vx = 0;
        state.vy = 0;
        state.speed = 0;
        state.motionState = 'settling';
        state.settleRemainingMs = settleDurationMs;
        state.frameCol = getActiveContactCol();
      }

      return getSnapshot();
    }

    function getSnapshot() {
      var row = ROW_BY_DIRECTION[state.direction];
      return {
        x: state.x,
        y: state.y,
        vx: state.vx,
        vy: state.vy,
        speed: state.speed,
        direction: state.direction,
        directionRow: row,
        directionLabelVi: DIRECTION_LABELS_VI[state.direction],
        motionState: state.motionState,
        stateLabelVi: STATE_LABELS_VI[state.motionState],
        frameIndex: state.frameIndex,
        frameCol: state.frameCol,
        distanceTravelled: state.distanceTravelled,
        gaitDistance: state.gaitDistance,
        waypointIndex: state.waypointIndex,
        waypointCount: state.waypoints.length,
        settleRemainingMs: state.settleRemainingMs,
        arrivalCount: state.arrivalCount,
        reducedMotion: state.reducedMotion
      };
    }

    return {
      update: update,
      setRoute: setRoute,
      retarget: retarget,
      stepDirection: stepDirection,
      startDefaultRoute: startDefaultRoute,
      stop: stop,
      resetToStart: resetToStart,
      setReducedMotion: setReducedMotion,
      getSnapshot: getSnapshot
    };
  }

  /**
   * Browser-only helper to inspect an HTMLImageElement of the 4x4 directional walk sheet
   * and extract per-cell alpha bounds and row-normalized frame metrics.
   */
  function analyzeDirectionalSpriteSheet(imageElement, manifestConfig) {
    var manifest = manifestConfig || DEFAULT_MANIFEST;
    var width = imageElement.naturalWidth || imageElement.width;
    var height = imageElement.naturalHeight || imageElement.height;
    var rows = manifest.gridRows || 4;
    var cols = manifest.gridCols || 4;
    var cellW = Math.floor(width / cols);
    var cellH = Math.floor(height / rows);

    var offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    var ctx = offscreen.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imageElement, 0, 0);

    var cellsByDirection = {
      down: [],
      right: [],
      up: [],
      left: []
    };

    var dirKeys = [DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.UP, DIRECTIONS.LEFT];
    for (var r = 0; r < dirKeys.length; r++) {
      var dir = dirKeys[r];
      for (var c = 0; c < cols; c++) {
        var imgData = ctx.getImageData(c * cellW, r * cellH, cellW, cellH);
        var cellBounds = extractCellAlphaBounds(imgData.data, cellW, cellH, {
          alphaThreshold: manifest.alphaThreshold,
          cellInsetPx: manifest.cellInsetPx
        });
        cellsByDirection[dir].push(cellBounds);
      }
    }

    return buildSheetLayoutFromCellBounds(cellsByDirection, cellW, cellH, manifest);
  }

  /**
   * Builds sheetLayout directly from the measured JSON manifest
   * (/assets/may-home-game/may-walk-directions-v1.json) using absolute source rectangles
   * (x, y, w, h) and local crop anchors (anchorX, anchorY) with a single common scale
   * (targetWorldHeight / referenceHeight) across all 16 frames.
   * Throws an explicit Error if metadata is missing or malformed (never silently falls back).
   */
  function buildSheetLayoutFromMeasuredManifest(measuredMeta, manifestConfig) {
    if (!measuredMeta || typeof measuredMeta !== 'object') {
      throw new Error('Missing or invalid sprite manifest object');
    }
    var referenceHeight = measuredMeta.referenceHeight;
    if (typeof referenceHeight !== 'number' || !(referenceHeight > 0) || !Number.isFinite(referenceHeight)) {
      throw new Error('Invalid referenceHeight in sprite manifest');
    }
    if (!Array.isArray(measuredMeta.frames) || measuredMeta.frames.length < 16) {
      throw new Error('Sprite manifest must contain 16 frame entries');
    }

    var manifest = manifestConfig || DEFAULT_MANIFEST;
    var targetWorldHeight = (manifest && manifest.targetWorldHeight) || 130;
    var commonScale = targetWorldHeight / referenceHeight;

    var byDirAndCol = {
      down: {},
      right: {},
      up: {},
      left: {}
    };

    for (var i = 0; i < measuredMeta.frames.length; i++) {
      var entry = measuredMeta.frames[i];
      if (!entry || !isValidDirection(entry.direction)) {
        throw new Error('Invalid frame direction in sprite manifest at index ' + i);
      }
      var col = entry.col;
      if (typeof col !== 'number' || col < 0 || col > 3) {
        throw new Error('Invalid frame col in sprite manifest at index ' + i);
      }
      var validNums =
        typeof entry.x === 'number' && Number.isFinite(entry.x) &&
        typeof entry.y === 'number' && Number.isFinite(entry.y) &&
        typeof entry.w === 'number' && entry.w > 0 && Number.isFinite(entry.w) &&
        typeof entry.h === 'number' && entry.h > 0 && Number.isFinite(entry.h) &&
        typeof entry.anchorX === 'number' && Number.isFinite(entry.anchorX) &&
        typeof entry.anchorY === 'number' && Number.isFinite(entry.anchorY);
      if (!validNums) {
        throw new Error('Malformed crop coordinates or anchors in sprite manifest at index ' + i);
      }
      byDirAndCol[entry.direction][col] = entry;
    }

    var layout = {
      width: measuredMeta.width || 1254,
      height: measuredMeta.height || 1254,
      referenceHeight: referenceHeight,
      targetWorldHeight: targetWorldHeight,
      scale: commonScale,
      rows: {}
    };

    var dirKeys = [DIRECTIONS.DOWN, DIRECTIONS.RIGHT, DIRECTIONS.UP, DIRECTIONS.LEFT];
    for (var d = 0; d < dirKeys.length; d++) {
      var dir = dirKeys[d];
      var rowIndex = ROW_BY_DIRECTION[dir];
      var rowCfg = (manifest.rows && manifest.rows[dir]) || {};
      var frameCfgs = (manifest.frames && manifest.frames[dir]) || [];
      var rowScaleMultiplier = typeof rowCfg.scale === 'number' ? rowCfg.scale : 1.0;
      var effectiveRowScale = commonScale * rowScaleMultiplier;

      var frames = [];
      for (var c = 0; c < 4; c++) {
        var src = byDirAndCol[dir][c];
        if (!src) {
          throw new Error('Missing measured frame for direction=' + dir + ' col=' + c);
        }
        var fCfg = frameCfgs[c] || {};
        var pivotXInCell = (typeof fCfg.pivotX === 'number' ? fCfg.pivotX : src.anchorX) +
          (rowCfg.pivotXOffset || 0) + (fCfg.offsetX || 0);
        var footYInCell = (typeof fCfg.footY === 'number' ? fCfg.footY : src.anchorY) +
          (rowCfg.footYOffset || 0) + (fCfg.offsetY || 0);

        frames.push({
          row: rowIndex,
          col: c,
          sx: src.x,
          sy: src.y,
          sw: src.w,
          sh: src.h,
          pivotXInCell: pivotXInCell,
          footYInCell: footYInCell,
          scale: effectiveRowScale
        });
      }

      layout.rows[dir] = {
        direction: dir,
        rowIndex: rowIndex,
        referenceHeight: referenceHeight,
        scale: effectiveRowScale,
        frames: frames
      };
    }

    return layout;
  }

  function formatSimpleStatusVi(snap) {
    if (!snap) return 'Sẵn sàng';
    if (snap.motionState === 'stopped') {
      return 'Đã dừng';
    }
    if (snap.motionState === 'walking') {
      if (snap.direction === DIRECTIONS.RIGHT) return 'Đang đi sang phải';
      if (snap.direction === DIRECTIONS.LEFT) return 'Đang đi sang trái';
      if (snap.direction === DIRECTIONS.UP) return 'Đang đi lên';
      return 'Đang đi xuống';
    }
    return 'Sẵn sàng';
  }

  return {
    DIRECTIONS: DIRECTIONS,
    ROW_BY_DIRECTION: ROW_BY_DIRECTION,
    DIRECTION_LABELS_VI: DIRECTION_LABELS_VI,
    STATE_LABELS_VI: STATE_LABELS_VI,
    DEFAULT_START_POINT: DEFAULT_START_POINT,
    DEFAULT_RECTANGLE_ROUTE: DEFAULT_RECTANGLE_ROUTE,
    LAWN_SAFE_BOUNDS: LAWN_SAFE_BOUNDS,
    DEFAULT_MANIFEST: DEFAULT_MANIFEST,
    resolveDirectionFromVector: resolveDirectionFromVector,
    extractCellAlphaBounds: extractCellAlphaBounds,
    buildSheetLayoutFromCellBounds: buildSheetLayoutFromCellBounds,
    buildSheetLayoutFromMeasuredManifest: buildSheetLayoutFromMeasuredManifest,
    formatSimpleStatusVi: formatSimpleStatusVi,
    createMotionController: createMotionController,
    analyzeDirectionalSpriteSheet: analyzeDirectionalSpriteSheet
  };
});
