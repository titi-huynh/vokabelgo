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

function check4P(s) {
  E.assertTotalCards(s);
  assert(D.COLOR_KEYS.includes(s.activeColor));
  if (s.activeEntryId) {
    assert(E.getContextSentence(s.deckId, s.activeContextId, s.activeEntryId));
  }
  assert.equal(s.physicalTopCard.id, s.discardPile[s.discardPile.length - 1].id);
  assert.equal(s.playerCount, 4);
  assert.equal(s.seats.length, 4);
}

test('4P-1: Khởi tạo bàn 4 người: 4 người x 5 lá = 20 lá, 1 mở bàn, 39 rút = 60 lá', () => {
  const s = E.createInitialGameState('adjektive', 12345, 'player', 4);
  assert.equal(s.playerCount, 4);
  assert.deepEqual(s.seats, ['player', 'bot_left', 'bot_top', 'bot_right']);
  assert.equal(s.playerHand.length, 5);
  assert.equal(s.hands.bot_left.length, 5);
  assert.equal(s.hands.bot_top.length, 5);
  assert.equal(s.hands.bot_right.length, 5);
  assert.equal(s.discardPile.length, 1);
  assert.equal(s.drawPile.length, 39);
  check4P(s);
});

test('4P-2: Hướng lượt theo chiều kim đồng hồ: player -> bot_left -> bot_top -> bot_right -> player', () => {
  const s = E.createInitialGameState('adjektive', 555, 'player', 4);
  assert.equal(s.activePlayer, 'player');
  assert.equal(E.getNextPlayer(s, 1), 'bot_left');
  s.activePlayer = 'bot_left';
  assert.equal(E.getNextPlayer(s, 1), 'bot_top');
  s.activePlayer = 'bot_top';
  assert.equal(E.getNextPlayer(s, 1), 'bot_right');
  s.activePlayer = 'bot_right';
  assert.equal(E.getNextPlayer(s, 1), 'player');
});

test('4P-3: Aussetzen ở bàn 4 người: Bỏ qua người kế tiếp, chuyển lượt cho người sau nữa', () => {
  const s = E.createInitialGameState('adjektive', 777, 'player', 4);
  const idx = s.drawPile.findIndex(c => c.actionType === 'aussetzen');
  const card = s.drawPile.splice(idx, 1)[0];
  card.color = s.activeColor;
  s.drawPile.push(s.playerHand[0]);
  s.playerHand[0] = card;
  const res = E.executePlayCard(s, card.id, 'player');
  assert.equal(res.skippedPlayer, 'bot_left', 'bot_left phải bị bỏ lượt');
  assert.equal(s.activePlayer, 'bot_top', 'Lượt phải chuyển sang bot_top');
  assert.equal(res.extraTurn, false, 'Bàn 4 người không nhận extraTurn');
  check4P(s);
});

test('4P-4: Zieh Zwei (+2) ở bàn 4 người: bot_left rút 2 lá và mất lượt, bot_top chơi tiếp', () => {
  const s = E.createInitialGameState('adjektive', 888, 'player', 4);
  const idx = s.drawPile.findIndex(c => c.actionType === 'plus2');
  const card = s.drawPile.splice(idx, 1)[0];
  card.color = s.activeColor;
  s.drawPile.push(s.playerHand[0]);
  s.playerHand[0] = card;
  const initialBotLeftCount = s.hands.bot_left.length;
  const res = E.executePlayCard(s, card.id, 'player');
  assert.equal(res.victim, 'bot_left');
  assert.equal(s.hands.bot_left.length, initialBotLeftCount + 2);
  assert.equal(s.activePlayer, 'bot_top');
  check4P(s);
});

test('4P-5: 100 ván mô phỏng 4 người (50 Adjektive, 50 Verben), kiểm tra toàn vẹn từng hành động', () => {
  for (const deck of ['adjektive', 'verben']) {
    for (let seed = 0; seed < 50; seed++) {
      const s = E.createInitialGameState(deck, seed, 'player', 4);
      let turns = 0;
      while (s.turnState !== 'game_over' && turns++ < 1500) {
        const role = s.activePlayer;
        const hand = E.getHand(s, role);
        const obs = B.buildPublicObservation(s);
        const d = B.getBotDecision(obs, hand, role);
        if (d.action === 'play') {
          E.executePlayCard(s, d.cardId, role, d.chosenColor);
        } else if (d.action === 'draw') {
          const r = E.executeDrawCard(s, role);
          assert(r.success || r.gameOver || r.passed);
        } else {
          assert(E.executePassTurn(s, role).success);
        }
        check4P(s);
      }
      assert.equal(s.turnState, 'game_over', 'Ván phải hoàn tất');
    }
  }
});

console.log(`\n====================================================`);
console.log(`4-PLAYER TABLE TESTS: ${pass} PASSED, ${fail} FAILED`);
console.log(`====================================================`);
if (fail) process.exit(1);
