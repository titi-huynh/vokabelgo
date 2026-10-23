/* Reusable motion module for Zehn: measured asset validation, direction resolver with hysteresis, and distance-based gait. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MayHomeMotion = factory();
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

  var DEFAULT_STRIDE = 76;

  function isValidDirection(dir) {
    return dir === 'down' || dir === 'right' || dir === 'up' || dir === 'left';
  }

  /**
   * Resolves facing direction from physical displacement vector (dx, dy)
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
   * Computes walking frame column and contact resting column from distance travelled.
   * 4 gait frames: 0 (contact A), 1 (passing A), 2 (contact B), 3 (passing B)
   * alternating legs with ~76px stride length.
   */
  function computeWalkFrame(distanceTravelled, strideLength) {
    var stride = typeof strideLength === 'number' && strideLength > 0 ? strideLength : DEFAULT_STRIDE;
    var stepLen = stride / 4;
    var dist = Math.max(0, Number(distanceTravelled) || 0);
    var rawIdx = stepLen > 0 ? Math.floor(dist / stepLen) % 4 : 0;
    var contactCol = rawIdx < 2 ? 0 : 2;
    return {
      frameIndex: rawIdx,
      frameCol: rawIdx,
      contactCol: contactCol
    };
  }

  /**
   * Validates measured JSON manifest (16 frames) and creates layout with common scale.
   * Throws explicit Error if metadata is missing or malformed.
   */
  function buildSheetLayoutFromMeasuredManifest(measuredMeta, options) {
    if (!measuredMeta || typeof measuredMeta !== 'object') {
      throw new Error('Missing or invalid sprite manifest object');
    }
    var referenceHeight = measuredMeta.referenceHeight;
    if (typeof referenceHeight !== 'number' || !(referenceHeight > 0) || !Number.isFinite(referenceHeight)) {
      throw new Error('Invalid referenceHeight in sprite manifest');
    }
    if (!Array.isArray(measuredMeta.frames) || measuredMeta.frames.length < 16) {
      throw new Error('Sprite manifest must contain at least 16 frame entries');
    }

    var opts = options || {};
    var targetWorldHeight = typeof opts.targetWorldHeight === 'number' && opts.targetWorldHeight > 0
      ? opts.targetWorldHeight
      : 150;
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
      var frames = [];
      for (var c = 0; c < 4; c++) {
        var src = byDirAndCol[dir][c];
        if (!src) {
          throw new Error('Missing measured frame for direction=' + dir + ' col=' + c);
        }
        frames.push({
          row: rowIndex,
          col: c,
          direction: dir,
          sx: src.x,
          sy: src.y,
          sw: src.w,
          sh: src.h,
          anchorX: src.anchorX,
          anchorY: src.anchorY,
          scale: commonScale
        });
      }
      layout.rows[dir] = {
        direction: dir,
        rowIndex: rowIndex,
        referenceHeight: referenceHeight,
        scale: commonScale,
        frames: frames
      };
    }

    return layout;
  }

  return {
    DIRECTIONS: DIRECTIONS,
    ROW_BY_DIRECTION: ROW_BY_DIRECTION,
    DEFAULT_STRIDE: DEFAULT_STRIDE,
    isValidDirection: isValidDirection,
    resolveDirectionFromVector: resolveDirectionFromVector,
    computeWalkFrame: computeWalkFrame,
    buildSheetLayoutFromMeasuredManifest: buildSheetLayoutFromMeasuredManifest
  };
});
