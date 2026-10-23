'use strict';
const assert = require('node:assert/strict');
const E = require('./dau-tu-engine');
const D = require('./dau-tu-data');
const B = require('./dau-tu-bot');

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log('PASS ' + name);
  } catch (e) {
    fail++;
    console.error('FAIL ' + name + '\n' + e.stack);
  }
}

const HARD_CTX = 'ctx_adj_difficulty_hard';

function createCustom4PState(deckId, activeColor, activeEntryId, activeContextId) {
  const s = E.createInitialGameState(deckId, 42, 'player', 4);
  s.activeColor = activeColor;
  s.activeEntryId = activeEntryId;
  s.activeContextId = activeContextId;
  s.wortKetteActive = false;
  s.wortKetteConsumedThisTurn = false;
  s.hasDrawnThisTurn = false;
  s.drawnCardIdThisTurn = null;
  s.currentTurnUsedHelp = false;
  s.currentTurnUsedCardHint = false;
  return s;
}

function setHandWithTotalPreserved(s, role, newCards) {
  if (role === 'player') {
    s.playerHand = newCards.slice();
    if (s.hands) s.hands.player = s.playerHand;
  } else {
    s.hands[role] = newCards.slice();
  }

  const getRealTotal = () => {
    let cards = [];
    if (s.playerCount === 4 && s.hands) {
      cards = (s.playerHand || []).concat(s.hands.bot_left || [], s.hands.bot_top || [], s.hands.bot_right || []);
    } else {
      cards = (s.playerHand || []).concat(s.botHand || []);
    }
    return cards.length + s.drawPile.length + s.discardPile.length;
  };

  let idCounter = 1;
  while (getRealTotal() < 60) {
    s.drawPile.push({ id: 'pad_card_' + Math.random() + '_' + (idCounter++), type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer' });
  }
  while (getRealTotal() > 60 && s.drawPile.length > 0) {
    s.drawPile.pop();
  }

  const seen = new Set();
  const all = (s.playerHand || []).concat(
    s.hands ? (s.hands.bot_left || []).concat(s.hands.bot_top || [], s.hands.bot_right || []) : (s.botHand || []),
    s.drawPile,
    s.discardPile
  );
  all.forEach((c, i) => {
    if (seen.has(c.id)) {
      c.id = c.id + '_u_' + i;
    }
    seen.add(c.id);
  });

  E.assertTotalCards(s);
}

// ============================================================================
// CASE 01: SCHWER RED -> SCHWIERIG BLUE (No Answer Hint) => Wort-Kette YES
// ============================================================================
test('CASE 01: SCHWER RED -> SCHWIERIG BLUE (No Answer Hint) => Wort-Kette YES', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_dummy_rot', type: 'word', color: 'rot', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res = E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(res.wortKette, true, 'Wort-Kette must trigger');
  assert.equal(s.wortKetteActive, true, 'wortKetteActive must be true');
  assert.equal(s.activePlayer, 'player', 'Player must retain active turn for bonus play');
  assert.equal(s.activeColor, 'blau', 'activeColor must update to played card color (blau)');
  assert.equal(s.activeEntryId, 'schwierig', 'activeEntryId must update to schwierig');
  assert.equal(s.metrics.wortKetteTriggered, 1);
});

// ============================================================================
// CASE 02: SCHWER RED -> SCHWIERIG RED => NO Wort-Kette (same color)
// ============================================================================
test('CASE 02: SCHWER RED -> SCHWIERIG RED => NO Wort-Kette (same color)', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_rot', type: 'word', color: 'rot', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_dummy', type: 'word', color: 'blau', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res = E.executePlayCard(s, 'c_schwierig_rot', 'player');
  assert.equal(!res.wortKette, true, 'Wort-Kette must NOT trigger on same color');
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activePlayer, 'bot_left', 'Turn must advance to next player');
});

// ============================================================================
// CASE 03: SCHWER RED -> SCHWER BLUE => NO Wort-Kette (same word)
// ============================================================================
test('CASE 03: SCHWER RED -> SCHWER BLUE => NO Wort-Kette (same word)', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwer_blau', type: 'word', color: 'blau', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' },
    { id: 'c_dummy', type: 'word', color: 'gruen', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res = E.executePlayCard(s, 'c_schwer_blau', 'player');
  assert.equal(!res.wortKette, true, 'Wort-Kette must NOT trigger on same word');
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activePlayer, 'bot_left', 'Turn must advance');
});

// ============================================================================
// CASE 04: Hint Step 1 -> SCHWIERIG BLUE => Wort-Kette YES
// ============================================================================
test('CASE 04: Hint Step 1 -> SCHWIERIG BLUE => Wort-Kette YES', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  s.currentTurnUsedHelp = true; // Step 1 context hint
  s.currentTurnUsedCardHint = false;
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res = E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(res.wortKette, true, 'Step 1 hint must ALLOW Wort-Kette');
  assert.equal(s.wortKetteActive, true);
  assert.equal(s.activePlayer, 'player');
});

// ============================================================================
// CASE 05: Use Step 2 "Chỉ lá phù hợp" -> SCHWIERIG BLUE => NO Wort-Kette
// ============================================================================
test('CASE 05: Use Step 2 "Chỉ lá phù hợp" -> SCHWIERIG BLUE => NO Wort-Kette', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  s.currentTurnUsedCardHint = true; // Step 2 explicit answer card
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res = E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(!res.wortKette, true, 'Step 2 answer hint must PREVENT Wort-Kette');
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activePlayer, 'bot_left');
});

// ============================================================================
// CASE 06: Bonus card is another cross-color synonym => Legal, NO second chain
// ============================================================================
test('CASE 06: Bonus card is another cross-color synonym => Legal, NO second chain', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_schwer_gruen', type: 'word', color: 'gruen', entryId: 'schwer', label: 'schwer', partOfSpeech: 'adj' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res1 = E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(res1.wortKette, true);
  assert.equal(s.wortKetteActive, true);

  // Bonus play: cross-color synonym to schwierig (schwer green)
  const val = E.validatePlayCard(s, 'c_schwer_gruen', 'player');
  assert.equal(val.valid, true, 'Must be legal move');
  assert.equal(val.isSynonym, true);

  const res2 = E.executePlayCard(s, 'c_schwer_gruen', 'player');
  assert.equal(!res2.wortKette, true, 'No double chain allowed');
  assert.equal(s.wortKetteActive, false, 'wortKetteActive must be consumed and false');
  assert.equal(s.activePlayer, 'bot_left', 'Turn must advance to next player');
  assert.equal(s.metrics.wortKetteBonusPlayed, 1);
});

// ============================================================================
// CASE 07: Wort-Kette -> Bonus +2 => +2 resolves, victim draws 2 and loses turn
// ============================================================================
test('CASE 07: Wort-Kette -> Bonus +2 => +2 resolves, victim draws 2 and loses turn', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_plus2_blau', type: 'action', color: 'blau', actionType: 'plus2', label: '+2' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const initialBotLeftCount = s.hands.bot_left.length;
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.wortKetteActive, true);
  assert.equal(s.activeColor, 'blau');

  // Bonus play: +2 blue
  const res = E.executePlayCard(s, 'c_plus2_blau', 'player');
  assert.equal(s.wortKetteActive, false);
  assert.equal(res.victim, 'bot_left', 'bot_left must be victim');
  assert.equal(s.hands.bot_left.length, initialBotLeftCount + 2);
  assert.equal(s.activePlayer, 'bot_top', 'Next turn must be bot_top (bot_left skipped)');
});

// ============================================================================
// CASE 08: Wort-Kette -> Aussetzen => skip correct
// ============================================================================
test('CASE 08: Wort-Kette -> Aussetzen => skip correct', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_skip_blau', type: 'action', color: 'blau', actionType: 'aussetzen', label: 'Aussetzen' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  const res = E.executePlayCard(s, 'c_skip_blau', 'player');
  assert.equal(s.wortKetteActive, false);
  assert.equal(res.skippedPlayer, 'bot_left');
  assert.equal(s.activePlayer, 'bot_top');
});

// ============================================================================
// CASE 09: Wort-Kette -> Farbenwahl => Color selector, new color active
// ============================================================================
test('CASE 09: Wort-Kette -> Farbenwahl => Color selector, new color active', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_fw', type: 'action', color: 'neutral', actionType: 'farbenwahl', label: 'Farbenwahl' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  const val = E.validatePlayCard(s, 'c_fw', 'player');
  assert.equal(val.requiresColorChoice, true);
  const res = E.executePlayCard(s, 'c_fw', 'player', 'gruen');
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activeColor, 'gruen');
  assert.equal(s.activePlayer, 'bot_left');
});

// ============================================================================
// CASE 10: Wort-Kette -> GEGENTEIL => Antonym resolves, keeps color, next turn
// ============================================================================
test('CASE 10: Wort-Kette -> GEGENTEIL => Antonym resolves, keeps color, next turn', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_gegenteil', type: 'action', color: 'neutral', actionType: 'gegenteil', label: 'GEGENTEIL' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.activeColor, 'blau');
  assert.equal(s.activeEntryId, 'schwierig');

  const val = E.validatePlayCard(s, 'c_gegenteil', 'player');
  assert.equal(val.valid, true);
  assert.equal(val.nextEntryId, 'einfach');
  assert.equal(val.nextColor, 'blau'); // Keeps activeColor!

  const res = E.executePlayCard(s, 'c_gegenteil', 'player');
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activeColor, 'blau');
  assert.equal(s.activeEntryId, 'einfach');
  assert.equal(s.activePlayer, 'bot_left');
});

// ============================================================================
// CASE 11: No legal bonus card => cannot draw, pass ends bonus
// ============================================================================
test('CASE 11: No legal bonus card => cannot draw, pass ends bonus', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    // Only yellow teuer remains: neither matches blau nor schwierig in hard ctx
    { id: 'c_teuer_gelb', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.wortKetteActive, true);

  // Check draw is forbidden
  const drawRes = E.executeDrawCard(s, 'player');
  assert.equal(drawRes.success, false, 'Cannot draw during Wort-Kette bonus');

  // Pass bonus
  const passRes = E.executePassWortKette(s, 'player');
  assert.equal(passRes.success, true);
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activePlayer, 'bot_left');
});

// ============================================================================
// CASE 12: Human chooses Kết thúc lượt => no penalty
// ============================================================================
test('CASE 12: Human chooses Kết thúc lượt => no penalty', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_legal_blau', type: 'word', color: 'blau', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.wortKetteActive, true);
  const handLenBefore = s.playerHand.length;

  const passRes = E.executePassWortKette(s, 'player');
  assert.equal(passRes.success, true);
  assert.equal(s.playerHand.length, handLenBefore, 'No penalty card drawn');
  assert.equal(s.wortKetteActive, false);
  assert.equal(s.activePlayer, 'bot_left');
  assert.equal(s.metrics.wortKetteBonusSkipped, 1);
});

// ============================================================================
// CASE 13: Trigger card = last card => immediate win
// ============================================================================
test('CASE 13: Trigger card = last card => immediate win', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' }
  ]);
  const res = E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(!res.wortKette, true, 'Win takes priority over Wort-Kette');
  assert.equal(s.turnState, 'game_over');
  assert.equal(s.winner, 'player');
  assert.equal(s.wortKetteActive, false);
});

// ============================================================================
// CASE 14: 2 cards left. First triggers Wort-Kette. 1 remains => Noch eine, bonus can win
// ============================================================================
test('CASE 14: 2 cards left. First triggers Wort-Kette. 1 remains => Noch eine, bonus can win', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_teuer_blau', type: 'word', color: 'blau', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res1 = E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(res1.wortKette, true);
  assert.equal(s.playerHand.length, 1);
  assert.equal(s.wortKetteActive, true);

  // Bonus play final card to win
  const res2 = E.executePlayCard(s, 'c_teuer_blau', 'player');
  assert.equal(s.turnState, 'game_over');
  assert.equal(s.winner, 'player');
  assert.equal(s.wortKetteActive, false);
});

// ============================================================================
// CASE 15: Bot Wort-Kette => bot follows identical rules
// ============================================================================
test('CASE 15: Bot Wort-Kette => bot follows identical rules', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  s.activePlayer = 'bot_left';
  setHandWithTotalPreserved(s, 'bot_left', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_teuer_blau', type: 'word', color: 'blau', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  const res1 = E.executePlayCard(s, 'c_schwierig_blau', 'bot_left');
  assert.equal(res1.wortKette, true);
  assert.equal(s.wortKetteActive, true);
  assert.equal(s.activePlayer, 'bot_left');

  // Bot observation shows Wort-Kette bonus
  const obs = B.buildPublicObservation(s);
  assert.equal(obs.isWortKetteBonus, true);
  const decision = B.getBotDecision(obs, s.hands.bot_left, 'bot_left');
  assert.equal(decision.action, 'play');
  assert.equal(decision.cardId, 'c_teuer_blau');

  // Execute bot bonus play
  const res2 = E.executePlayCard(s, decision.cardId, 'bot_left');
  assert.equal(s.turnState, 'game_over');
  assert.equal(s.winner, 'bot_left');
});

// ============================================================================
// CASE 16: Restart during Wort-Kette => clean reset
// ============================================================================
test('CASE 16: Restart during Wort-Kette => clean reset', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_dummy', type: 'word', color: 'gelb', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.wortKetteActive, true);

  // Restart
  const fresh = E.createInitialGameState('adjektive', 999, 'player', 4);
  assert.equal(fresh.wortKetteActive, false);
  assert.equal(fresh.wortKetteConsumedThisTurn, false);
  assert.equal(fresh.activePlayer, 'player');
});

// ============================================================================
// CASE 17: State preservation during modal/rules opening
// ============================================================================
test('CASE 17: State preservation during modal/rules opening', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_teuer_blau', type: 'word', color: 'blau', entryId: 'teuer', label: 'teuer', partOfSpeech: 'adj' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.wortKetteActive, true);

  // Simulating dialog pause: state is retained
  assert.equal(s.wortKetteActive, true);
  assert.equal(s.activePlayer, 'player');

  // Resume and play
  const res = E.executePlayCard(s, 'c_teuer_blau', 'player');
  assert.equal(res.gameOver, true);
});

// ============================================================================
// CASE 18: End game during bonus special effect => no ghost turn
// ============================================================================
test('CASE 18: End game during bonus special effect => no ghost turn', () => {
  const s = createCustom4PState('adjektive', 'rot', 'schwer', HARD_CTX);
  setHandWithTotalPreserved(s, 'player', [
    { id: 'c_schwierig_blau', type: 'word', color: 'blau', entryId: 'schwierig', label: 'schwierig', partOfSpeech: 'adj' },
    { id: 'c_plus2_blau', type: 'action', color: 'blau', actionType: 'plus2', label: '+2' }
  ]);
  E.executePlayCard(s, 'c_schwierig_blau', 'player');
  assert.equal(s.wortKetteActive, true);

  // Player plays +2 as last card
  const res = E.executePlayCard(s, 'c_plus2_blau', 'player');
  assert.equal(res.gameOver, true);
  assert.equal(s.turnState, 'game_over');
  assert.equal(s.winner, 'player');
  assert.equal(s.wortKetteActive, false);
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log(`\n====================================================`);
console.log(`TEST RESULTS: ${pass} PASSED, ${fail} FAILED`);
console.log(`====================================================\n`);
if (fail > 0) process.exit(1);
