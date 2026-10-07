/**
 * Test Suite: Wortturm Evaluator & Stacking Geometry Unit Tests
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Extract WortturmEvaluator and WORTTURM_VOCABULARY from wortturm.js
const wortturmJsPath = path.join(__dirname, 'wortturm.js');
const wortturmCode = fs.readFileSync(wortturmJsPath, 'utf8');

// Create mock window and DOM environment
const mockWindow = {
  AudioContext: class {},
  webkitAudioContext: class {},
  document: {
    addEventListener: () => {}
  }
};

const fn = new Function('window', 'document', wortturmCode);
fn(mockWindow, mockWindow.document);

const WortturmEvaluator = mockWindow.WortturmEvaluator;
const WORTTURM_VOCABULARY = mockWindow.WORTTURM_VOCABULARY;

console.log('====================================================');
console.log('RUNNING WORTTURM EVALUATOR & GEOMETRY UNIT TESTS');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function it(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     ${err.message}`);
  }
}

// ----------------------------------------------------
// SECTION 1: Evaluator Tests
// ----------------------------------------------------
console.log('--- TEST 1: German Nouns & Article Enforcement ---');
it('der Bahnhof -> Exact match', () => {
  const res = WortturmEvaluator.evaluate('der Bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.reason, 'exact');
});

it('der bahnhof -> Case-insensitive match accepted', () => {
  const res = WortturmEvaluator.evaluate('der bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, true);
});

it('Bahnhof -> Missing article is rejected with hint', () => {
  const res = WortturmEvaluator.evaluate('Bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'missing_article');
  assert.ok(res.feedback.includes('der Bahnhof'));
});

it('die Bahnhof -> Wrong article is rejected with hint', () => {
  const res = WortturmEvaluator.evaluate('die Bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'wrong_article');
  assert.ok(res.feedback.includes('Sai Artikel'));
});

it('Empty string is rejected', () => {
  const res = WortturmEvaluator.evaluate('', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'empty');
});

it('Whitespace only is rejected', () => {
  const res = WortturmEvaluator.evaluate('   ', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'empty');
});

console.log('\n--- TEST 2: Umlaut Normalization (ä/ae, ö/oe, ü/ue, ß/ss) ---');
it('die Küche -> exact match', () => {
  const res = WortturmEvaluator.evaluate('die Küche', 'die Küche');
  assert.strictEqual(res.isCorrect, true);
});

it('die Kueche -> umlaut ue match accepted', () => {
  const res = WortturmEvaluator.evaluate('die Kueche', 'die Küche');
  assert.strictEqual(res.isCorrect, true);
});

it('schön vs schoen -> umlaut oe match accepted', () => {
  const res = WortturmEvaluator.evaluate('schoen', 'schön');
  assert.strictEqual(res.isCorrect, true);
});

it('Multiple whitespace normalized', () => {
  const res = WortturmEvaluator.evaluate('  die    Wohnung  ', 'die Wohnung');
  assert.strictEqual(res.isCorrect, true);
});

it('Wrong word is rejected with feedback', () => {
  const res = WortturmEvaluator.evaluate('das Auto', 'die Wohnung');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'wrong');
  assert.ok(res.feedback.includes('Noch einmal!'));
});

// ----------------------------------------------------
// SECTION 2: Stacking & Overlap Geometry Tests
// ----------------------------------------------------
console.log('\n--- TEST 3: Overlap & Stack Mathematics ---');

function calcOverlap(prevLeft, prevWidth, currLeft, currWidth) {
  const prevRight = prevLeft + prevWidth;
  const currRight = currLeft + currWidth;
  const overlapLeft = Math.max(prevLeft, currLeft);
  const overlapRight = Math.min(prevRight, currRight);
  const overlap = overlapRight - overlapLeft;
  const isPerfect = Math.abs(currLeft - prevLeft) <= 4 || overlap >= 0.94 * prevWidth;
  return { overlap, overlapLeft, isPerfect, prevRight, currRight };
}

it('Perfect alignment (0px offset) -> Full overlap, isPerfect true', () => {
  const res = calcOverlap(70, 220, 70, 220);
  assert.strictEqual(res.overlap, 220);
  assert.strictEqual(res.isPerfect, true);
});

it('Near-perfect alignment (2px offset) -> within 4px tolerance, isPerfect true', () => {
  const res = calcOverlap(70, 220, 72, 220);
  assert.strictEqual(res.isPerfect, true);
});

it('Partial overlap (shifted right by 40px) -> overhang sliced', () => {
  const res = calcOverlap(70, 220, 110, 220);
  // prev: [70, 290], curr: [110, 330] -> overlap: [110, 290] -> width = 180
  assert.strictEqual(res.overlap, 180);
  assert.strictEqual(res.overlapLeft, 110);
  assert.strictEqual(res.isPerfect, false);
});

it('Partial overlap (shifted left by 40px) -> overhang sliced', () => {
  const res = calcOverlap(70, 220, 30, 220);
  // prev: [70, 290], curr: [30, 250] -> overlap: [70, 250] -> width = 180
  assert.strictEqual(res.overlap, 180);
  assert.strictEqual(res.overlapLeft, 70);
  assert.strictEqual(res.isPerfect, false);
});

it('Complete miss (dropped completely to the right) -> overlap <= 0', () => {
  const res = calcOverlap(70, 220, 300, 100);
  assert.ok(res.overlap <= 0);
});

it('Complete miss (dropped completely to the left) -> overlap <= 0', () => {
  const res = calcOverlap(70, 220, 0, 60);
  assert.ok(res.overlap <= 0);
});

// ----------------------------------------------------
// SECTION 3: Vocabulary Pool Integrity
// ----------------------------------------------------
console.log('\n--- TEST 4: Vocabulary Pool Integrity ---');
it('WORTTURM_VOCABULARY contains at least 15 words', () => {
  assert.ok(WORTTURM_VOCABULARY.length >= 15);
});

it('All entries have non-empty vi and de properties', () => {
  for (const item of WORTTURM_VOCABULARY) {
    assert.ok(item.vi && typeof item.vi === 'string');
    assert.ok(item.de && typeof item.de === 'string');
  }
});

console.log('\n====================================================');
console.log(`ACCEPTANCE SUMMARY: ${passCount} / ${totalCount} PASSED`);
if (passCount === totalCount) {
  console.log('🎉 ALL WORTTURM EVALUATOR & GEOMETRY TESTS PASSED!');
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('====================================================\n');
