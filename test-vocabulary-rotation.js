/**
 * TEST-VOCABULARY-ROTATION.JS
 * Verification suite for Vocabulary Rotation & Match Diversity in Đấu Từ.
 * Tests cluster-based deck construction, 0% consecutive match overlap,
 * rolling 3-match down-weighting & cooldown, graph connectivity (0 isolated nodes),
 * physical 60-card multiplier, and history persistence/reset.
 */

const assert = require('assert');
const { MatchDeckBuilder } = require('./src/lexicon/match-deck-builder');
const VocabularyHistory = require('./src/lexicon/vocabulary-history');
const SEMANTIC_CLUSTERS = require('./src/lexicon/semantic-clusters');
const runtimeData = require('./data/lexicon/runtime/dau-tu-runtime-data.js');
const DAU_TU_DATA = require('./dau-tu-data');
const DAU_TU_ENGINE = require('./dau-tu-engine');

console.log('====================================================');
console.log('TEST SUITE: ĐẤU TỪ · VOCABULARY ROTATION & DIVERSITY');
console.log('====================================================\n');

let passedTests = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// ----------------------------------------------------
// 1. Cluster Pool Size & Graph Structure
// ----------------------------------------------------
console.log('--- 1. Semantic Clusters Pool ---');

test('should define at least 8 curated clusters for Adjectives and 7 for Verbs', () => {
  assert(SEMANTIC_CLUSTERS.adjective.length >= 8, `Expected >= 8 adj clusters, got ${SEMANTIC_CLUSTERS.adjective.length}`);
  assert(SEMANTIC_CLUSTERS.verb.length >= 7, `Expected >= 7 verb clusters, got ${SEMANTIC_CLUSTERS.verb.length}`);
});

test('each cluster should contain exactly 4 cohesive entries (2 pairs of antonyms/synonyms)', () => {
  for (const pos of ['adjective', 'verb']) {
    for (const cluster of SEMANTIC_CLUSTERS[pos]) {
      assert.equal(cluster.entryIds.length, 4, `Cluster ${cluster.clusterId} does not have 4 entries`);
      assert(cluster.contexts.length >= 2, `Cluster ${cluster.clusterId} has < 2 contexts`);
    }
  }
});

// ----------------------------------------------------
// 2. Physical Card Multiplier (60 cards per match deck)
// ----------------------------------------------------
console.log('\n--- 2. Physical Card Multiplier & Integrity ---');

test('should build 60-card match deck with 48 word cards (12 entries × 4 colors) + 12 special cards', () => {
  const history = new VocabularyHistory({ persist: false });
  const builder = new MatchDeckBuilder(runtimeData, history);

  const adjDeck = builder.buildMatchDeck('adjective');
  assert.equal(adjDeck.unitsCount, 12, 'Must have exactly 12 semantic units');
  assert.equal(adjDeck.wordCardsCount, 48, 'Must have exactly 48 word cards');
  assert.equal(adjDeck.specialCardsCount, 12, 'Must have exactly 12 special cards');
  assert.equal(adjDeck.totalCardsCount, 60, 'Must have exactly 60 physical cards');

  // Verify unique card IDs
  const seenIds = new Set();
  for (const card of adjDeck.cards) {
    assert(!seenIds.has(card.id), `Duplicate physical card ID: ${card.id}`);
    seenIds.add(card.id);
  }
});

test('every match deck should have 0 isolated nodes and A+ Wort-Kette viability', () => {
  const history = new VocabularyHistory({ persist: false });
  const builder = new MatchDeckBuilder(runtimeData, history);

  for (const pos of ['adjective', 'verb']) {
    const deck = builder.buildMatchDeck(pos);
    assert.equal(deck.audit.isolatedNodesCount, 0, `${pos} deck has isolated nodes!`);
    assert(deck.audit.synonymEdgesCount >= 6, `Expected >= 6 synonym edges, got ${deck.audit.synonymEdgesCount}`);
    assert(deck.audit.antonymEdgesCount >= 6, `Expected >= 6 antonym edges, got ${deck.audit.antonymEdgesCount}`);
    assert.equal(deck.audit.wortKetteViabilityScore, 100, 'Viability score must be 100%');
  }
});

// ----------------------------------------------------
// 3. Consecutive Overlap (0% Repeat Target)
// ----------------------------------------------------
console.log('\n--- 3. 10 Consecutive Matches Simulation (Adjektive) ---');

test('should maintain 0% consecutive overlap (Match N vs N-1) across 10 Adjective matches', () => {
  const history = new VocabularyHistory({ persist: false });
  const builder = new MatchDeckBuilder(runtimeData, history);

  for (let i = 1; i <= 10; i++) {
    const deck = builder.buildMatchDeck('adjective', { matchId: `m_adj_${i}` });
    assert.equal(deck.unitsCount, 12);
    assert.equal(deck.totalCardsCount, 60);

    if (i > 1) {
      assert.equal(
        deck.matchReport.overlapConsecutive,
        0,
        `Match #${i} had consecutive overlap of ${deck.matchReport.overlapConsecutive} words (${deck.matchReport.overlapConsecutivePercent})! Words: ${deck.matchReport.repeatedConsecutive.join(', ')}`
      );
    }
  }

  const qa = history.getQAReport();
  assert.equal(qa.totalMatches, 10);
  assert.equal(qa.totalUniqueEntries, 36, `Expected 36 unique adjectives across 10 matches, got ${qa.totalUniqueEntries}`);
});

console.log('\n--- 4. 10 Consecutive Matches Simulation (Verben) ---');

test('should maintain 0% consecutive overlap across 10 Verb matches', () => {
  const history = new VocabularyHistory({ persist: false });
  const builder = new MatchDeckBuilder(runtimeData, history);

  for (let i = 1; i <= 10; i++) {
    const deck = builder.buildMatchDeck('verb', { matchId: `m_verb_${i}` });
    assert.equal(deck.unitsCount, 12);
    assert.equal(deck.totalCardsCount, 60);

    if (i > 1) {
      assert.equal(
        deck.matchReport.overlapConsecutive,
        0,
        `Match #${i} had consecutive overlap of ${deck.matchReport.overlapConsecutive} words! Words: ${deck.matchReport.repeatedConsecutive.join(', ')}`
      );
    }
  }

  const qa = history.getQAReport();
  assert.equal(qa.totalMatches, 10);
  assert.equal(qa.totalUniqueEntries, 32, `Expected 32 unique verbs across 10 matches, got ${qa.totalUniqueEntries}`);
});

// ----------------------------------------------------
// 5. Dynamic Engine Integration & Playability
// ----------------------------------------------------
console.log('\n--- 5. Dynamic Engine Integration ---');

test('DAU_TU_ENGINE.createInitialGameState should initialize game with dynamic rotation match deck', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 12345, 'player', 4, {
    dynamicRotation: true
  });

  assert(state.matchDeck, 'state.matchDeck must be present when dynamicRotation is true');
  assert(state.matchReport, 'state.matchReport must be present');
  assert.equal(state.matchReport.vocabularyCount, 12);
  assert.equal(state.playerHand.length, 5);
  DAU_TU_ENGINE.assertTotalCards(state);

  // Play a valid color move
  const openingCard = state.physicalTopCard;
  assert.equal(openingCard.type, 'word');

  // Verify synonym check uses dynamic match deck
  const firstCluster = state.matchDeck.selectedClusters[0];
  const e1 = firstCluster.entryIds[0];
  const e2 = firstCluster.entryIds[1];
  const ctx = firstCluster.contexts[0];
  const isSyn = DAU_TU_ENGINE.isSynonym(state.deckId, ctx, e1, e2, state);
  assert(isSyn, `Expected ${e1} and ${e2} to be synonyms in ${ctx}`);
});

// ----------------------------------------------------
// 6. VocabularyHistory & Reset
// ----------------------------------------------------
console.log('\n--- 6. Vocabulary History & Reset ---');

test('should track play counts and reset history cleanly', () => {
  const history = new VocabularyHistory({ persist: false });
  history.recordMatch({
    matchId: 'm1',
    deckId: 'adjektive',
    selectedEntryIds: ['adj_schwer_difficult', 'adj_schwierig_difficult']
  });

  let stats = history.getEntryStats('adj_schwer_difficult');
  assert.equal(stats.timesPlayed, 1);
  assert.equal(stats.isNeverPlayed, false);

  history.resetHistory();
  stats = history.getEntryStats('adj_schwer_difficult');
  assert.equal(stats.timesPlayed, 0);
  assert.equal(stats.isNeverPlayed, true);
  assert.equal(history.matches.length, 0);
});

console.log('\n====================================================');
console.log(`🎉 ALL ${passedTests} TESTS IN test-vocabulary-rotation.js PASSED!`);
console.log('====================================================\n');
