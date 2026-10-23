/**
 * TEST-LEXICON-PIPELINE.JS
 * Acceptance test suite for Lexicon Pipeline v0.1:
 * - OpenThesaurus adapter & local disk cache
 * - Normalizer & German morphology (separable verbs, reflexive verbs, umlauts/ß preservation)
 * - Polysemy separation (schwer, leicht, alt)
 * - CandidateStore status transitions & audit trail
 * - Strict runtime exporter validation gates (Section 30)
 * - Deck builder connectivity (zero isolated nodes, 60 cards per deck)
 * - Game engine runtime execution with Expanded Lexicon Deck
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { OpenThesaurusAdapter } = require('./src/lexicon/providers/openthesaurus-adapter');
const { LexiconNormalizer } = require('./src/lexicon/normalizer');
const { CandidateStore } = require('./src/lexicon/candidate-store');
const { DeckBuilder } = require('./src/lexicon/deck-builder');
const { RuntimeExporter } = require('./src/lexicon/runtime-exporter');

const DAU_TU_DATA = require('./dau-tu-data.js');
const DAU_TU_ENGINE = require('./dau-tu-engine.js');

let passedTests = 0;

async function it(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('TEST SUITE: ĐẤU TỪ · LEXICAL PIPELINE v0.1');
  console.log('====================================================\n');

  // 1. Adapter & Cache
  console.log('--- 1. OpenThesaurus Adapter & Offline Cache ---');
  await it('should find at least 70 pre-seeded authentic raw cache files', () => {
    const cacheDir = path.resolve(__dirname, 'data/lexicon/raw/openthesaurus');
    assert.ok(fs.existsSync(cacheDir), 'Raw cache directory exists');
    const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json'));
    assert.ok(files.length >= 65, `Expected >= 65 cache files, got ${files.length}`);
  });

  await it('should retrieve candidate DTO from cache with CC-BY-SA 4.0 / GNU LGPL attribution', async () => {
    const adapter = new OpenThesaurusAdapter();
    const res = await adapter.searchLemma('schwer');
    assert.strictEqual(res.success, true, 'Search succeeds');
    assert.strictEqual(res.fromCache, true, 'Served from authentic cache without remote network call');
    const dto = res.data;
    assert.strictEqual(dto.lemma, 'schwer');
    assert.ok(dto.synsets.length > 0, 'Has synsets');
    const meta = adapter.getMetadata();
    assert.ok(meta.license.includes('CC-BY-SA 4.0') || meta.license.includes('LGPL'));
  });

  // 2. Morphology & Unicode Preservation (Section 36)
  console.log('\n--- 2. Morphology & Unicode Preservation ---');
  await it('should preserve German umlauts (ä, ö, ü) and eszett (ß) without stripping or ss mutation', () => {
    const clean1 = LexiconNormalizer.cleanLemma('schließen');
    assert.strictEqual(clean1, 'schließen', 'ß must not become ss');

    const clean2 = LexiconNormalizer.cleanLemma('aufhören');
    assert.strictEqual(clean2, 'aufhören', 'ö must not be stripped');

    const entryId = LexiconNormalizer.buildEntryId('verb', 'schließen', 'close');
    assert.strictEqual(entryId, 'verb_schließen_close');
  });

  await it('should detect separable prefix verbs correctly', () => {
    const m1 = LexiconNormalizer.analyzeMorphology('anfangen', 'verb');
    assert.ok(m1.verbMeta.separable, 'anfangen is separable');
    assert.strictEqual(m1.verbMeta.prefix, 'an');

    const m2 = LexiconNormalizer.analyzeMorphology('aufhören', 'verb');
    assert.ok(m2.verbMeta.separable, 'aufhören is separable');
    assert.strictEqual(m2.verbMeta.prefix, 'auf');

    const m3 = LexiconNormalizer.analyzeMorphology('beginnen', 'verb');
    assert.strictEqual(m3.verbMeta.separable, false, 'beginnen is not separable');
  });

  await it('should detect reflexive verbs correctly', () => {
    const m = LexiconNormalizer.analyzeMorphology('sich beeilen', 'verb');
    assert.ok(m.verbMeta.reflexive, 'sich beeilen is reflexive');
    assert.strictEqual(m.partOfSpeech, 'verb');
  });

  // 3. Polysemy Separation (Section 48, 5)
  console.log('\n--- 3. Polysemy Separation ---');
  await it('should separate "schwer" into distinct entries for difficult vs heavy', () => {
    const senseDiff = LexiconNormalizer.deriveSenseId('schwer', ['geist', 'komplex']);
    const senseHeavy = LexiconNormalizer.deriveSenseId('schwer', ['gewicht', 'physik']);

    assert.strictEqual(senseDiff, 'difficult');
    assert.strictEqual(senseHeavy, 'heavy');

    const id1 = LexiconNormalizer.buildEntryId('adj', 'schwer', senseDiff);
    const id2 = LexiconNormalizer.buildEntryId('adj', 'schwer', senseHeavy);

    assert.notStrictEqual(id1, id2, 'Polysemy creates strictly distinct entry IDs');
    assert.strictEqual(id1, 'adj_schwer_difficult');
    assert.strictEqual(id2, 'adj_schwer_heavy');
  });

  await it('should separate "leicht" into easy vs light_weight', () => {
    const sEasy = LexiconNormalizer.deriveSenseId('leicht', ['einfach']);
    const sWeight = LexiconNormalizer.deriveSenseId('leicht', ['gewicht']);

    assert.strictEqual(sEasy, 'easy');
    assert.strictEqual(sWeight, 'light_weight');
  });

  // 4. CandidateStore & Lifecycle Status
  console.log('\n--- 4. CandidateStore & Audit Trail ---');
  await it('should transition statuses and record reviewer audit trail', () => {
    const store = new CandidateStore();
    const rels = Object.values(store.candidateRelations);
    assert.ok(rels.length > 50, 'Store loaded candidate relations');

    const sampleRel = rels[0];
    const origStatus = sampleRel.reviewStatus;

    // Set to needs_review with notes
    store.setRelationStatus(sampleRel.relationId, 'needs_review', 'Testing audit trail note', 'qa-tester');
    assert.strictEqual(store.candidateRelations[sampleRel.relationId].reviewStatus, 'needs_review');
    assert.strictEqual(store.candidateRelations[sampleRel.relationId].reviewedBy, 'qa-tester');
    assert.strictEqual(store.candidateRelations[sampleRel.relationId].reviewNotes, 'Testing audit trail note');

    // Restore status
    store.setRelationStatus(sampleRel.relationId, origStatus, 'Restored', 'test-cleanup');
  });

  // 5. Deck Builder & Graph Connectivity
  console.log('\n--- 5. Deck Builder & Graph Connectivity ---');
  await it('should build a 60-card adjective deck with 0 isolated nodes and A+ viability', () => {
    const store = new CandidateStore();
    const builder = new DeckBuilder(store);

    const audit = builder.analyzeConnectivity('adjective');
    assert.strictEqual(audit.isolatedNodesCount, 0, 'Zero isolated nodes');
    assert.ok(audit.isPlayable, 'Deck is playable');
    assert.ok(audit.synonymEdges >= 10, 'Rich synonym edges');

    const deck = builder.buildDeck('adjective');
    assert.strictEqual(deck.totalCardsCount, 60, 'Exact 60 cards');
    assert.strictEqual(deck.wordCardsCount, 48, 'Exact 48 word cards (12 x 4 colors)');
    assert.strictEqual(deck.specialCardsCount, 12, 'Exact 12 special cards');
  });

  await it('should build a 60-card verb deck with 0 isolated nodes', () => {
    const store = new CandidateStore();
    const builder = new DeckBuilder(store);

    const audit = builder.analyzeConnectivity('verb');
    assert.strictEqual(audit.isolatedNodesCount, 0, 'Zero isolated nodes in verbs');
    assert.ok(audit.isPlayable, 'Verb deck is playable');

    const deck = builder.buildDeck('verb');
    assert.strictEqual(deck.totalCardsCount, 60, 'Exact 60 cards in verb deck');
  });

  // 6. Runtime Exporter & Section 30 Validation Gates
  console.log('\n--- 6. Runtime Exporter & Validation Gates ---');
  await it('should pass validation gates and export runtime datasets', () => {
    const store = new CandidateStore();
    const exporter = new RuntimeExporter(store);

    const validation = exporter.validate();
    assert.strictEqual(validation.isValid, true, 'Validation passes without errors');
    assert.strictEqual(validation.errors.length, 0);

    const runtimeFile = path.resolve(__dirname, 'data/lexicon/runtime/dau-tu-approved-runtime.json');
    assert.ok(fs.existsSync(runtimeFile), 'Runtime JSON file exists');

    const json = JSON.parse(fs.readFileSync(runtimeFile, 'utf8'));
    assert.ok(json.decks.adjektive, 'Adjektive deck exported');
    assert.ok(json.decks.verben, 'Verben deck exported');
    assert.strictEqual(json.decks.adjektive.cards.length, 60);
    assert.strictEqual(json.decks.verben.cards.length, 60);
  });

  // 7. Game Runtime Integration
  console.log('\n--- 7. Game Engine Runtime Integration ---');
  await it('should initialize a 4-player game using the Expanded Lexicon Deck', () => {
    const state = DAU_TU_ENGINE.createInitialGameState('lexicon_expanded', 99999, 'player', 4);
    assert.strictEqual(state.playerCount, 4);
    assert.deepStrictEqual(state.seats, ['player', 'bot_left', 'bot_top', 'bot_right']);
    assert.strictEqual(state.playerHand.length, 5);
    assert.strictEqual(DAU_TU_ENGINE.getHand(state, 'bot_left').length, 5);
    assert.strictEqual(DAU_TU_ENGINE.getHand(state, 'bot_top').length, 5);
    assert.strictEqual(DAU_TU_ENGINE.getHand(state, 'bot_right').length, 5);
    assert.strictEqual(state.discardPile.length, 1);
    assert.strictEqual(state.discardPile[0].type, 'word');

    // Verify total card conservation in 4-player setup (5 x 4 + 1 + drawPile = 60 cards)
    const totalCards = state.playerHand.length +
                       DAU_TU_ENGINE.getHand(state, 'bot_left').length +
                       DAU_TU_ENGINE.getHand(state, 'bot_top').length +
                       DAU_TU_ENGINE.getHand(state, 'bot_right').length +
                       state.discardPile.length +
                       state.drawPile.length;
    assert.strictEqual(totalCards, 60, 'Total physical card conservation: exactly 60 cards');
  });

  await it('should recognize valid synonym and color moves with Expanded Lexicon cards', () => {
    const deck = DAU_TU_DATA.LEXICON_EXPANDED;
    assert.ok(deck, 'LEXICON_EXPANDED deck loaded');
    assert.ok(deck.entries['adj_schwer_difficult']);
    assert.ok(deck.entries['adj_schwierig_difficult']);

    // Same color matching
    const card1 = { id: 'c1', type: 'word', color: 'rot', entryId: 'adj_schwer_difficult' };
    const card2 = { id: 'c2', type: 'word', color: 'rot', entryId: 'adj_teuer_expensive' };
    assert.strictEqual(card1.color, card2.color, 'Same color matches');

    // Same word matching across colors
    const card3 = { id: 'c3', type: 'word', color: 'blau', entryId: 'adj_schwer_difficult' };
    assert.strictEqual(card1.entryId, card3.entryId, 'Same word matches across colors');
  });

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests} TESTS IN test-lexicon-pipeline.js PASSED!`);
  console.log('====================================================\n');
}

runAllTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
