/**
 * Test Suite: WortCrush Evaluator & Shard Geometry Unit Tests
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Extract WortcrushEvaluator and WORTCRUSH_VOCABULARY from wortcrush.js
const wortcrushJsPath = path.join(__dirname, 'wortcrush.js');
const wortcrushCode = fs.readFileSync(wortcrushJsPath, 'utf8');

// Create mock window and DOM environment
const mockWindow = {
  AudioContext: class {},
  webkitAudioContext: class {},
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null
  }
};

const fn = new Function('window', 'document', wortcrushCode);
fn(mockWindow, mockWindow.document);

const WortcrushEvaluator = mockWindow.WortcrushEvaluator;
const WORTCRUSH_VOCABULARY = mockWindow.WORTCRUSH_VOCABULARY;

console.log('====================================================');
console.log('RUNNING WORTCRUSH EVALUATOR & GEOMETRY UNIT TESTS');
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
// SECTION 1: German Nouns & Article Enforcement
// ----------------------------------------------------
console.log('--- TEST 1: German Nouns & Article Enforcement ---');
it('der Bahnhof -> Exact match', () => {
  const res = WortcrushEvaluator.evaluate('der Bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.reason, 'exact');
});

it('Bahnhof -> Missing article is rejected with hint', () => {
  const res = WortcrushEvaluator.evaluate('Bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.status, 'near');
  assert.strictEqual(res.reason, 'missing_article');
  assert.ok(res.feedback.includes('der Bahnhof'));
});

it('die Bahnhof -> Wrong article is rejected with hint', () => {
  const res = WortcrushEvaluator.evaluate('die Bahnhof', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.status, 'near');
  assert.strictEqual(res.reason, 'wrong_article');
  assert.ok(res.feedback.includes('Sai Artikel'));
});

it('die wohnung -> Lowercase noun is rejected with near feedback', () => {
  const res = WortcrushEvaluator.evaluate('die wohnung', 'die Wohnung');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.status, 'near');
  assert.strictEqual(res.reason, 'case_sensitive');
  assert.ok(res.feedback.includes('die Wohnung'));
});

it('Empty string is rejected', () => {
  const res = WortcrushEvaluator.evaluate('', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'empty');
});

it('Whitespace only is rejected', () => {
  const res = WortcrushEvaluator.evaluate('   ', 'der Bahnhof');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.reason, 'empty');
});

// ----------------------------------------------------
// SECTION 2: Umlaut Normalization (ä/ae, ö/oe, ü/ue, ß/ss)
// ----------------------------------------------------
console.log('\n--- TEST 2: Umlaut Normalization & Non-Noun Words ---');
it('die Küche -> exact match', () => {
  const res = WortcrushEvaluator.evaluate('die Küche', 'die Küche');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.status, 'correct');
});

it('die Kueche -> umlaut ue match accepted', () => {
  const res = WortcrushEvaluator.evaluate('die Kueche', 'die Küche');
  assert.strictEqual(res.isCorrect, true);
});

it('schön vs schoen -> umlaut oe match accepted', () => {
  const res = WortcrushEvaluator.evaluate('schoen', 'schön');
  assert.strictEqual(res.isCorrect, true);
});

it('Multiple whitespace normalized', () => {
  const res = WortcrushEvaluator.evaluate('  die    Wohnung  ', 'die Wohnung');
  assert.strictEqual(res.isCorrect, true);
});

it('Non-noun verb (fahren) case-insensitive match accepted', () => {
  const res = WortcrushEvaluator.evaluate('Fahren', 'fahren');
  assert.strictEqual(res.isCorrect, true);
  assert.strictEqual(res.reason, 'case_insensitive');
});

it('Unrelated wrong word is rejected with feedback', () => {
  const res = WortcrushEvaluator.evaluate('das Auto', 'die Wohnung');
  assert.strictEqual(res.isCorrect, false);
  assert.strictEqual(res.status, 'wrong');
  assert.strictEqual(res.reason, 'wrong');
  assert.strictEqual(res.feedback, 'Noch einmal!');
});

// ----------------------------------------------------
// SECTION 3: Shard Geometry Validation
// ----------------------------------------------------
console.log('\n--- TEST 3: Shard Geometry Validation ---');
it('16 interlocking polygon shards defined with valid points', () => {
  // Regex check for GLASS_SHARDS_SPEC in code
  const match = wortcrushCode.match(/const GLASS_SHARDS_SPEC = (\[[\s\S]*?\]);/);
  assert.ok(match, 'GLASS_SHARDS_SPEC must be defined in wortcrush.js');
  const shardsSpec = eval(match[1]);
  assert.strictEqual(shardsSpec.length, 16);

  shardsSpec.forEach(shard => {
    assert.ok(shard.id, 'Shard has id');
    assert.ok(shard.points, 'Shard has points string');
    const pairs = shard.points.split(' ');
    assert.ok(pairs.length >= 3, 'Shard must have at least 3 vertices');
    pairs.forEach(pair => {
      const [x, y] = pair.split(',').map(Number);
      assert.ok(!isNaN(x) && !isNaN(y), 'Vertex coords must be numbers');
    });
  });
});

// ----------------------------------------------------
// SECTION 4: Vocabulary Pool Integrity
// ----------------------------------------------------
console.log('\n--- TEST 4: Vocabulary Pool Integrity ---');
it('WORTCRUSH_VOCABULARY contains at least 25 words', () => {
  assert.ok(WORTCRUSH_VOCABULARY.length >= 25);
});

it('All entries have valid vi and de properties', () => {
  for (const item of WORTCRUSH_VOCABULARY) {
    assert.ok(item.vi && typeof item.vi === 'string');
    assert.ok(item.de && typeof item.de === 'string');
  }
});

it('Vocabulary includes umlauts and long words', () => {
  const hasUmlaut = WORTCRUSH_VOCABULARY.some(w => /[äöüß]/i.test(w.de));
  const hasLongWord = WORTCRUSH_VOCABULARY.some(w => w.de.length >= 12);
  assert.ok(hasUmlaut, 'Must include words with umlauts');
  assert.ok(hasLongWord, 'Must include long words (e.g. Krankenhaus, Flughafen)');
});

console.log('\n====================================================');
console.log(`ACCEPTANCE SUMMARY: ${passCount} / ${totalCount} PASSED`);
if (passCount === totalCount) {
  console.log('🎉 ALL WORTCRUSH EVALUATOR & GEOMETRY TESTS PASSED!');
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('====================================================\n');
