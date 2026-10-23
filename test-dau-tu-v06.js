// test-dau-tu-v06.js
// Acceptance test suite for VOKABELGO — ĐẤU TỪ v0.6: Special Card Effects + Game Feel Polish
const assert = require('assert');
const E = require('./dau-tu-engine');
const D = require('./dau-tu-data');
const B = require('./dau-tu-bot');

console.log('====================================================');
console.log('TEST SUITE: ĐẤU TỪ v0.6 · SPECIAL CARD EFFECTS & GAME FEEL');
console.log('====================================================\n');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('--- 1. Aussetzen (Bỏ lượt) Mechanics & Turn Progression ---');

test('Aussetzen skips immediate next player and passes turn to player + 2', () => {
  const state = E.createInitialGameState('adjektive', 12345, 'player', 4);
  // Give player an aussetzen card matching activeColor
  const ausCard = { id: 'test_aussetzen_1', type: 'action', actionType: 'aussetzen', color: state.activeColor, label: 'Bỏ lượt' };
  state.playerHand[0] = ausCard;
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, ausCard.id, 'player');
  assert.strictEqual(res.skippedPlayer, 'bot_left', 'bot_left should be skipped');
  assert.strictEqual(state.activePlayer, 'bot_top', 'turn should advance to bot_top');
  assert.strictEqual(res.nextTurn, 'bot_top');
  assert.strictEqual(state.physicalTopCard.id, ausCard.id);
  assert.strictEqual(state.activeColor, ausCard.color);
  E.assertTotalCards(state);
});

test('Aussetzen played by bot_left skips bot_top and gives turn to bot_right', () => {
  const state = E.createInitialGameState('adjektive', 54321, 'bot_left', 4);
  const ausCard = { id: 'test_aussetzen_2', type: 'action', actionType: 'aussetzen', color: state.activeColor, label: 'Bỏ lượt' };
  state.hands.bot_left[0] = ausCard;
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, ausCard.id, 'bot_left');
  assert.strictEqual(res.skippedPlayer, 'bot_top');
  assert.strictEqual(state.activePlayer, 'bot_right');
  E.assertTotalCards(state);
});

console.log('\n--- 2. Zieh Zwei (+2) Penalty & Card Conservation ---');

test('+2 causes target to draw 2 cards and lose turn, advancing to next player', () => {
  const state = E.createInitialGameState('adjektive', 77777, 'player', 4);
  const plus2Card = { id: 'test_plus2_1', type: 'action', actionType: 'plus2', color: state.activeColor, label: 'Rút hai' };
  state.playerHand[0] = plus2Card;
  const initialVictimCount = state.hands.bot_left.length; // 5
  const initialDrawPileCount = state.drawPile.length; // 39
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, plus2Card.id, 'player');
  assert.strictEqual(res.victim, 'bot_left');
  assert.strictEqual(res.drawnCount, 2);
  assert.strictEqual(state.hands.bot_left.length, initialVictimCount + 2);
  assert.strictEqual(state.drawPile.length, initialDrawPileCount - 2);
  assert.strictEqual(state.activePlayer, 'bot_top', 'bot_left lost turn, turn goes to bot_top');
  E.assertTotalCards(state);
});

test('+2 handles depleted draw pile without crashing or generating phantom cards', () => {
  const state = E.createInitialGameState('adjektive', 88888, 'player', 4);
  const plus2Card = { id: 'test_plus2_depleted', type: 'action', actionType: 'plus2', color: state.activeColor, label: 'Rút hai' };
  state.playerHand[0] = plus2Card;

  // Simulate 58 cards distributed across hands, 1 on discard pile, 1 in draw pile => total 60 cards
  const allCards = [...state.drawPile];
  state.drawPile = [allCards.pop()]; // 1 card in draw pile
  while (allCards.length > 0) {
    state.hands.bot_top.push(allCards.pop());
  }
  E.assertTotalCards(state);
  const victimInitialCount = state.hands.bot_left.length;

  const res = E.executePlayCard(state, plus2Card.id, 'player');
  // In this case, 1 card in drawPile + 1 card in discardPile (the opening card) was reshuffled, so 2 cards drawn
  assert.strictEqual(res.victim, 'bot_left');
  assert.strictEqual(res.drawnCount, 2);
  assert.strictEqual(state.hands.bot_left.length, victimInitialCount + 2);
  assert.strictEqual(state.drawPile.length, 0);
  assert.strictEqual(state.activePlayer, 'bot_top');
  E.assertTotalCards(state);
});

console.log('\n--- 3. Farbenwahl (Đổi màu) Visual & Logic Precision ---');

test('Farbenwahl requires explicit color choice and transitions active color', () => {
  const state = E.createInitialGameState('adjektive', 99999, 'player', 4);
  const fwCard = { id: 'test_fw_1', type: 'action', actionType: 'farbenwahl', color: 'neutral', label: 'Đổi màu' };
  state.playerHand[0] = fwCard;
  E.assertTotalCards(state);

  // Validation without chosen color indicates color choice required
  const val = E.validatePlayCard(state, fwCard.id, 'player');
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.requiresColorChoice, true);

  // Execution with chosen color 'gelb'
  const res = E.executePlayCard(state, fwCard.id, 'player', 'gelb');
  assert.strictEqual(state.activeColor, 'gelb');
  assert.strictEqual(state.activeEntryId, null);
  assert.strictEqual(state.activePlayer, 'bot_left');
  E.assertTotalCards(state);
});

test('Bot chooses Farbenwahl color via heuristic and updates active color', () => {
  const state = E.createInitialGameState('adjektive', 11111, 'bot_left', 4);
  const fwCard = { id: 'test_fw_bot', type: 'action', actionType: 'farbenwahl', color: 'neutral', label: 'Đổi màu' };
  state.hands.bot_left[0] = fwCard;
  E.assertTotalCards(state);

  const obs = B.buildPublicObservation(state);
  const decision = B.getBotDecision(obs, state.hands.bot_left, 'bot_left');
  assert.ok(decision.action === 'play');
  if (decision.cardId === fwCard.id) {
    assert.ok(['rot', 'blau', 'gruen', 'gelb'].includes(decision.chosenColor));
    const res = E.executePlayCard(state, fwCard.id, 'bot_left', decision.chosenColor);
    assert.strictEqual(state.activeColor, decision.chosenColor);
  }
});

console.log('\n--- 4. GEGENTEIL Signature Antonym Transition ---');

test('GEGENTEIL transitions word to antonym, preserves active color and updates context', () => {
  const state = E.createInitialGameState('adjektive', 22222, 'player', 4);
  const activeColor = state.activeColor;
  const initialEntry = E.getDeckData(state.deckId).entries[state.activeEntryId];
  assert.ok(initialEntry, 'initial entry should exist');

  const gegCard = { id: 'test_geg_1', type: 'action', actionType: 'gegenteil', color: activeColor, label: 'Đảo nghĩa' };
  state.playerHand[0] = gegCard;
  E.assertTotalCards(state);

  const val = E.validatePlayCard(state, gegCard.id, 'player');
  assert.strictEqual(val.valid, true);
  assert.ok(val.nextEntryId);
  const newEntry = E.getDeckData(state.deckId).entries[val.nextEntryId];

  // Verify that newEntry is an antonym of initialEntry
  assert.notStrictEqual(newEntry.entryId, initialEntry.entryId);
  assert.ok(val.antonymExplanation, 'antonymExplanation should exist');

  const res = E.executePlayCard(state, gegCard.id, 'player');
  assert.strictEqual(state.activeColor, activeColor, 'active color MUST be preserved');
  assert.strictEqual(state.activeEntryId, newEntry.entryId);
  assert.strictEqual(state.activePlayer, 'bot_left');
  E.assertTotalCards(state);
});

test('GEGENTEIL works for Verben (schließen -> öffnen)', () => {
  const state = E.createInitialGameState('verben', 33333, 'player', 4);
  state.activeEntryId = 'schließen';
  state.activeContextId = 'ctx_verb_window_close';
  const activeColor = state.activeColor;

  const gegCard = { id: 'test_geg_verb', type: 'action', actionType: 'gegenteil', color: activeColor, label: 'Đảo nghĩa' };
  state.playerHand[0] = gegCard;
  E.assertTotalCards(state);

  const val = E.validatePlayCard(state, gegCard.id, 'player');
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.nextEntryId, 'öffnen');

  E.executePlayCard(state, gegCard.id, 'player');
  assert.strictEqual(state.activeColor, activeColor);
  assert.strictEqual(state.activeEntryId, 'öffnen');
  E.assertTotalCards(state);
});

console.log('\n--- 5. WORT-KETTE Signature Learning & Bonus Resolution ---');

test('Cross-color unassisted synonym triggers WORT-KETTE with +1 bonus play', () => {
  const state = E.createInitialGameState('adjektive', 44444, 'player', 4);
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  // Player has 'schwierig' in 'blau'
  const synCard = { id: 'test_syn_wk', type: 'word', entryId: 'schwierig', color: 'blau', label: 'schwierig' };
  state.playerHand[0] = synCard;
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, synCard.id, 'player');
  assert.strictEqual(res.wortKette, true);
  assert.strictEqual(state.wortKetteActive, true);
  assert.strictEqual(state.activePlayer, 'player', 'Player retains turn for bonus action');
  assert.strictEqual(res.relation.from, 'schwer');
  assert.strictEqual(res.relation.to, 'schwierig');
  E.assertTotalCards(state);
});

test('WORT-KETTE bonus play does not trigger a second chain', () => {
  const state = E.createInitialGameState('adjektive', 44444, 'player', 4);
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  const synCard = { id: 'test_syn_wk', type: 'word', entryId: 'schwierig', color: 'blau', label: 'schwierig' };
  state.playerHand[0] = synCard;

  // Trigger Wort-Kette
  E.executePlayCard(state, synCard.id, 'player');
  assert.strictEqual(state.wortKetteActive, true);

  // Bonus card is another synonym: 'schwer' in 'gruen'
  const secondSyn = { id: 'test_syn_2', type: 'word', entryId: 'schwer', color: 'gruen', label: 'schwer' };
  state.playerHand[0] = secondSyn;
  E.assertTotalCards(state);

  const res2 = E.executePlayCard(state, secondSyn.id, 'player');
  assert.strictEqual(!res2.wortKette, true, 'No second Wort-Kette chained');
  assert.strictEqual(state.wortKetteActive, false);
  assert.strictEqual(state.activePlayer, 'bot_left', 'Turn advances after bonus play');
  E.assertTotalCards(state);
});

console.log('\n--- 6. Combined Effect: WORT-KETTE -> Bonus +2 ---');

test('WORT-KETTE followed by bonus +2 resolves sequentially and penalizes victim', () => {
  const state = E.createInitialGameState('adjektive', 55555, 'player', 4);
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  // 1. Trigger Wort-Kette with cross-color synonym
  const synCard = { id: 'test_syn_combo', type: 'word', entryId: 'schwierig', color: 'blau', label: 'schwierig' };
  state.playerHand[0] = synCard;
  E.executePlayCard(state, synCard.id, 'player');
  assert.strictEqual(state.wortKetteActive, true);
  assert.strictEqual(state.activeColor, 'blau');

  // 2. Play bonus +2 matching activeColor ('blau')
  const plus2Card = { id: 'test_plus2_combo', type: 'action', actionType: 'plus2', color: 'blau', label: 'Rút hai' };
  state.playerHand[0] = plus2Card;
  E.assertTotalCards(state);

  const botLeftInitial = state.hands.bot_left.length;
  const resPlus2 = E.executePlayCard(state, plus2Card.id, 'player');

  assert.strictEqual(state.wortKetteActive, false, 'Wort-Kette should be cleared');
  assert.strictEqual(resPlus2.victim, 'bot_left');
  assert.strictEqual(resPlus2.drawnCount, 2);
  assert.strictEqual(state.hands.bot_left.length, botLeftInitial + 2);
  assert.strictEqual(state.activePlayer, 'bot_top', 'bot_left skipped, turn goes to bot_top');
  E.assertTotalCards(state);
});

console.log('\n--- 7. End State: Special Card as Final Card ---');

test('Final card as Aussetzen wins game immediately without phantom turn', () => {
  const state = E.createInitialGameState('adjektive', 66666, 'player', 4);
  const ausCard = { id: 'test_aus_win', type: 'action', actionType: 'aussetzen', color: state.activeColor, label: 'Bỏ lượt' };
  while (state.playerHand.length > 1) {
    state.drawPile.push(state.playerHand.pop());
  }
  state.playerHand[0] = ausCard;
  state.hands.player = state.playerHand;
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, ausCard.id, 'player');
  assert.strictEqual(res.gameOver, true);
  assert.strictEqual(res.winner, 'player');
  assert.strictEqual(state.turnState, 'game_over');
  assert.strictEqual(state.playerHand.length, 0);
  assert.strictEqual(res.nextTurn, null);
  E.assertTotalCards(state);
});

test('Final card as +2: victim draws 2 cards, player wins immediately', () => {
  const state = E.createInitialGameState('adjektive', 66667, 'player', 4);
  const plus2Card = { id: 'test_plus2_win', type: 'action', actionType: 'plus2', color: state.activeColor, label: 'Rút hai' };
  while (state.playerHand.length > 1) {
    state.drawPile.push(state.playerHand.pop());
  }
  state.playerHand[0] = plus2Card;
  state.hands.player = state.playerHand;
  const botLeftInitial = state.hands.bot_left.length;
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, plus2Card.id, 'player');
  assert.strictEqual(res.gameOver, true);
  assert.strictEqual(res.winner, 'player');
  assert.strictEqual(state.turnState, 'game_over');
  assert.strictEqual(state.playerHand.length, 0);
  assert.strictEqual(state.hands.bot_left.length, botLeftInitial + 2);
  E.assertTotalCards(state);
});

test('Final card as Farbenwahl: color chosen, player wins immediately', () => {
  const state = E.createInitialGameState('adjektive', 66668, 'player', 4);
  const fwCard = { id: 'test_fw_win', type: 'action', actionType: 'farbenwahl', color: 'neutral', label: 'Đổi màu' };
  while (state.playerHand.length > 1) {
    state.drawPile.push(state.playerHand.pop());
  }
  state.playerHand[0] = fwCard;
  state.hands.player = state.playerHand;
  E.assertTotalCards(state);

  const res = E.executePlayCard(state, fwCard.id, 'player', 'gruen');
  assert.strictEqual(res.gameOver, true);
  assert.strictEqual(res.winner, 'player');
  assert.strictEqual(state.turnState, 'game_over');
  assert.strictEqual(state.activeColor, 'gruen');
  assert.strictEqual(state.playerHand.length, 0);
  E.assertTotalCards(state);
});

console.log('\n====================================================');
console.log(`🎉 ALL ${passCount} TESTS IN test-dau-tu-v06.js PASSED!`);
console.log('====================================================\n');
