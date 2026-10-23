/**
 * TEST-DAU-TU-EVALUATOR.JS
 * Bộ kiểm thử tự động toàn diện cho bản Preview "Đấu từ — VokabelGo" v0.1.
 * Bao gồm đầy đủ 4 nhóm tiêu chí nghiệm thu A, B, C, D theo đặc tả:
 * - A: Khởi tạo và toàn vẹn dữ liệu (60 lá, ID duy nhất, ngữ cảnh, bảo toàn lá bài)
 * - B: Luật chơi (Từ, Màu, Aussetzen, +2, Farbenwahl, GEGENTEIL, Rút, Phạt, Thắng)
 * - C: Ngôn ngữ học và Hệ thống gợi ý 2 bước
 * - D: Vận hành, Cách ly thông tin Bot và Mô phỏng ván đấu tự động
 */

const assert = require('assert');
const DAU_TU_DATA = require('./dau-tu-data.js');
const DAU_TU_ENGINE = require('./dau-tu-engine.js');
const DAU_TU_BOT = require('./dau-tu-bot.js');


// v0.2 correction: fixtures must swap real cards instead of duplicating IDs.
function realFixture(entryId, color) {
  const s=DAU_TU_ENGINE.createInitialGameState('adjektive',100,'player');
  let pool=[...s.playerHand,...s.botHand,...s.drawPile,...s.discardPile];
  const take=fn=>{const i=pool.findIndex(fn);assert(i>=0);return pool.splice(i,1)[0];};
  const top=take(c=>c.entryId==='schwer'&&c.color==='rot');
  const card=take(c=>c.entryId===entryId&&c.color===color);
  s.playerHand=[card,...pool.splice(0,4)];s.botHand=pool.splice(0,5);s.drawPile=pool;s.discardPile=[top];s.physicalTopCard=top;
  s.activeEntryId='schwer';s.activeColor='rot';s.activeContextId='ctx_adj_difficulty_hard';
  DAU_TU_ENGINE.assertTotalCards(s);return s;
}

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${desc}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('====================================================');
console.log('RUNNING "ĐẤU TỪ — VOKABELGO" PREVIEW EVALUATOR TESTS');
console.log('====================================================\n');

// ====================================================
// NHÓM A: KHỞI TẠO VÀ DỮ LIỆU
// ====================================================
console.log('--- NHÓM A: Khởi tạo và toàn vẹn dữ liệu ---');

it('A1: Mỗi bộ sinh đúng 60 lá vật lý với ID duy nhất, không trùng lặp', () => {
  ['adjektive', 'verben'].forEach(deckId => {
    const cards = DAU_TU_DATA.createDeckPhysicalCards(deckId);
    assert.strictEqual(cards.length, 60, `Bộ ${deckId} phải có đúng 60 lá vật lý`);

    const idSet = new Set(cards.map(c => c.id));
    assert.strictEqual(idSet.size, 60, `Bộ ${deckId} phải có 60 ID duy nhất`);

    const wordCards = cards.filter(c => c.type === 'word');
    assert.strictEqual(wordCards.length, 48, `Bộ ${deckId} phải có 48 lá từ (12 từ x 4 màu)`);

    const aussetzenCards = cards.filter(c => c.actionType === 'aussetzen');
    assert.strictEqual(aussetzenCards.length, 4, `Bộ ${deckId} phải có 4 lá Aussetzen (1 mỗi màu)`);

    const plus2Cards = cards.filter(c => c.actionType === 'plus2');
    assert.strictEqual(plus2Cards.length, 4, `Bộ ${deckId} phải có 4 lá Zieh Zwei (+2) (1 mỗi màu)`);

    const farbenwahlCards = cards.filter(c => c.actionType === 'farbenwahl');
    assert.strictEqual(farbenwahlCards.length, 2, `Bộ ${deckId} phải có 2 lá Farbenwahl`);

    const gegenteilCards = cards.filter(c => c.actionType === 'gegenteil');
    assert.strictEqual(gegenteilCards.length, 2, `Bộ ${deckId} phải có 2 lá GEGENTEIL!`);
  });
});

it('A2: Không trộn từ loại giữa hai bộ Adjektive và Verben', () => {
  const adjCards = DAU_TU_DATA.createDeckPhysicalCards('adjektive');
  const verbCards = DAU_TU_DATA.createDeckPhysicalCards('verben');

  adjCards.forEach(c => {
    assert.strictEqual(c.deckId, 'adjektive');
    if (c.type === 'word') {
      assert.strictEqual(c.partOfSpeech, 'Adjektiv');
      assert(DAU_TU_DATA.ADJEKTIVE.entries[c.entryId], `Entry ${c.entryId} phải thuộc bộ Adjektive`);
    }
  });

  verbCards.forEach(c => {
    assert.strictEqual(c.deckId, 'verben');
    if (c.type === 'word') {
      assert(c.partOfSpeech.startsWith('Verb'), `Từ ${c.entryId} phải là Verb`);
      assert(DAU_TU_DATA.VERBEN.entries[c.entryId], `Entry ${c.entryId} phải thuộc bộ Verben`);
    }
  });
});

it('A3: Mọi cạnh nối nghĩa và antonym mapping đều trỏ tới entry/context tồn tại', () => {
  ['adjektive', 'verben'].forEach(deckId => {
    const deck = DAU_TU_DATA[deckId === 'adjektive' ? 'ADJEKTIVE' : 'VERBEN'];

    deck.synonyms.forEach(syn => {
      assert(deck.contexts[syn.contextId], `Context ${syn.contextId} phải tồn tại`);
      assert(deck.entries[syn.from], `From entry ${syn.from} phải tồn tại`);
      assert(deck.entries[syn.to], `To entry ${syn.to} phải tồn tại`);
      const ctx = deck.contexts[syn.contextId];
      assert(ctx.sentenceVariants[syn.from], `Câu của ${syn.from} trong ${syn.contextId} phải có`);
      assert(ctx.sentenceVariants[syn.to], `Câu của ${syn.to} trong ${syn.contextId} phải có`);
    });

    Object.keys(deck.antonyms).forEach(key => {
      const mapping = deck.antonyms[key];
      assert(deck.entries[mapping.targetEntryId], `Target entry ${mapping.targetEntryId} phải tồn tại`);
      assert(deck.contexts[mapping.targetContextId], `Target context ${mapping.targetContextId} phải tồn tại`);
      const ctx = deck.contexts[mapping.targetContextId];
      assert(ctx.sentenceVariants[mapping.targetEntryId], `Biến thể câu cho target entry phải tồn tại`);
    });
  });
});

it('A4: Khởi tạo ván đấu: chia 5/5, mở bằng lá từ, tổng 60 lá không rò rỉ lá ma', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 12345, 'player');
  assert.strictEqual(state.playerHand.length, 5, 'Player phải có đúng 5 lá ban đầu');
  assert.strictEqual(state.botHand.length, 5, 'Bot phải có đúng 5 lá ban đầu');
  assert.strictEqual(state.discardPile.length, 1, 'Chồng bỏ có 1 lá mở bàn');
  assert.strictEqual(state.drawPile.length, 49, 'Chồng rút có 49 lá còn lại');
  assert.strictEqual(state.physicalTopCard.type, 'word', 'Lá mở bàn bắt buộc là lá từ');
  assert(state.activeColor, 'Phải có màu hiện hành');
  assert(state.activeEntryId, 'Phải có từ mục tiêu hiện hành');
  assert(state.activeContextId, 'Phải có ngữ cảnh hiện hành');
  DAU_TU_ENGINE.assertTotalCards(state);
});

// ====================================================
// NHÓM B: LUẬT CHƠI
// ====================================================
console.log('\n--- NHÓM B: Luật chơi và quy tắc đánh thẻ ---');

it('B1: Đánh cùng màu khác nghĩa hợp lệ và mở ngữ cảnh nền của từ mới', () => {
  const state = realFixture('teuer', 'rot');

  const val = DAU_TU_ENGINE.validatePlayCard(state, 'adj_card_rot_teuer', 'player');
  assert.strictEqual(val.valid, true, 'Đánh cùng màu rot phải hợp lệ');
  assert.strictEqual(val.matchType, 'color', 'Khác nghĩa thì matchType là color');
  assert.strictEqual(val.nextContextId, 'ctx_adj_price_expensive', 'Chuyển sang context nền của từ teuer');

  const res = DAU_TU_ENGINE.executePlayCard(state, 'adj_card_rot_teuer', 'player');
  assert.strictEqual(state.activeColor, 'rot');
  assert.strictEqual(state.activeEntryId, 'teuer');
  assert.strictEqual(state.activeContextId, 'ctx_adj_price_expensive');
});

it('B2: Đánh khác màu nhưng ĐỒNG NGHĨA hợp lệ và giữ nguyên ngữ cảnh hiện hành', () => {
  const state = realFixture('schwierig', 'blau');

  const val = DAU_TU_ENGINE.validatePlayCard(state, 'adj_card_blau_schwierig', 'player');
  assert.strictEqual(val.valid, true, 'Khác màu nhưng đồng nghĩa phải hợp lệ');
  assert.strictEqual(val.matchType, 'meaning', 'matchType phải là meaning');
  assert.strictEqual(val.nextContextId, 'ctx_adj_difficulty_hard', 'Giữ nguyên context đang diễn giải');

  DAU_TU_ENGINE.executePlayCard(state, 'adj_card_blau_schwierig', 'player');
  assert.strictEqual(state.activeColor, 'blau', 'Màu mới chuyển sang màu của lá vừa đánh (blau)');
  assert.strictEqual(state.activeEntryId, 'schwierig');
  assert.strictEqual(state.activeContextId, 'ctx_adj_difficulty_hard');
});

it('B3: Khác màu và SAI NGHĨA bị từ chối; Trùng từ khác màu được chấp nhận là "Cùng từ"', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 102, 'player');
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  // 1. Lá khác màu và không đồng nghĩa: 'blau' + 'teuer'
  state.playerHand[0] = {
    id: 'adj_card_blau_teuer',
    deckId: 'adjektive',
    type: 'word',
    color: 'blau',
    entryId: 'teuer',
    label: 'teuer'
  };
  state.playerHand[1] = {
    id: 'adj_card_blau_schwer',
    deckId: 'adjektive',
    type: 'word',
    color: 'blau',
    entryId: 'schwer',
    label: 'schwer'
  };

  const valWrong = DAU_TU_ENGINE.validatePlayCard(state, 'adj_card_blau_teuer', 'player');
  assert.strictEqual(valWrong.valid, false, 'Khác màu và sai nghĩa phải bị từ chối');

  // 2. Lá trùng từ nhưng khác màu: 'blau' + 'schwer'
  const valSame = DAU_TU_ENGINE.validatePlayCard(state, 'adj_card_blau_schwer', 'player');
  assert.strictEqual(valSame.valid, true, 'Trùng từ được phép đánh');
  assert.strictEqual(valSame.matchType, 'same_word', 'Ghi nhận là same_word');
});

it('B4: Khi VỪA cùng màu VỪA đồng nghĩa: ghi nhận matchType là "both", không phóng đại', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 103, 'player');
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  state.playerHand[0] = {
    id: 'adj_card_rot_schwierig',
    deckId: 'adjektive',
    type: 'word',
    color: 'rot',
    entryId: 'schwierig',
    label: 'schwierig'
  };

  const val = DAU_TU_ENGINE.validatePlayCard(state, 'adj_card_rot_schwierig', 'player');
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.matchType, 'both', 'Phải ghi nhận đồng thời cả 2 điều kiện (both)');
  assert.strictEqual(val.isSynonym, true);
  assert.strictEqual(val.isColorMatch, true);
});

it('B5: Lá Aussetzen (Bỏ lượt) ở bàn 2 người: đối thủ mất lượt, người đánh tiếp tục', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 104, 'player');
  state.activeColor = 'rot';
  state.activePlayer = 'player';
  state.playerHand[0] = {
    id: 'test_aussetzen_rot',
    type: 'action',
    actionType: 'aussetzen',
    color: 'rot',
    label: 'Aussetzen'
  };

  const res = DAU_TU_ENGINE.executePlayCard(state, 'test_aussetzen_rot', 'player');
  assert.strictEqual(res.extraTurn, true, 'Phải có lượt kế tiếp cho người đánh');
  assert.strictEqual(state.activePlayer, 'player', 'Player tiếp tục đánh lượt mới');
  assert.strictEqual(state.activeEntryId, null, 'Mục tiêu nghĩa cũ bị xóa sau Aussetzen');
});

it('B6: Lá Zieh Zwei (+2): đối thủ rút 2 lá và mất lượt, không cộng dồn', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 105, 'player');
  state.activeColor = 'blau';
  state.activePlayer = 'player';
  const initialBotCardCount = state.botHand.length;

  state.playerHand[0] = {
    id: 'test_plus2_blau',
    type: 'action',
    actionType: 'plus2',
    color: 'blau',
    label: '+2'
  };

  const res = DAU_TU_ENGINE.executePlayCard(state, 'test_plus2_blau', 'player');
  assert.strictEqual(state.botHand.length, initialBotCardCount + 2, 'Bot phải nhận đúng 2 lá phạt');
  assert.strictEqual(state.activePlayer, 'player', 'Player giữ lượt sau khi bot chịu phạt');
  assert.strictEqual(state.activeEntryId, null, 'Mục tiêu nghĩa cũ bị xóa sau +2');
  DAU_TU_ENGINE.assertTotalCards(state);
});

it('B7: Lá Farbenwahl: chọn màu hợp lệ, hủy không mất bài, giữ màu cũ', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 106, 'player');
  state.activeColor = 'rot';
  state.playerHand[0] = {
    id: 'test_farbenwahl',
    type: 'action',
    actionType: 'farbenwahl',
    color: 'neutral',
    label: 'Farbenwahl'
  };

  // Khi chưa chọn màu: validate báo requiresColorChoice
  const valNoColor = DAU_TU_ENGINE.validatePlayCard(state, 'test_farbenwahl', 'player', null);
  assert.strictEqual(valNoColor.valid, true);
  assert.strictEqual(valNoColor.requiresColorChoice, true);

  // Người chơi hủy modal: bài vẫn còn nguyên trong tay!
  assert.strictEqual(state.playerHand.length, 5);

  // Chọn màu mới 'gruen'
  const valWithColor = DAU_TU_ENGINE.validatePlayCard(state, 'test_farbenwahl', 'player', 'gruen');
  assert.strictEqual(valWithColor.valid, true);
  assert.strictEqual(valWithColor.nextColor, 'gruen');

  DAU_TU_ENGINE.executePlayCard(state, 'test_farbenwahl', 'player', 'gruen');
  assert.strictEqual(state.activeColor, 'gruen', 'Màu bàn chơi đổi sang gruen');
  assert.strictEqual(state.activeEntryId, null, 'Mục tiêu nghĩa bị xóa');
  assert.strictEqual(state.activePlayer, 'bot', 'Đổi lượt sang đối thủ');
});

it('B8: GEGENTEIL: giữ màu, đổi nghĩa đúng bảng, không chạy khi bàn là lá chức năng', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 107, 'player');
  // Bàn đang là 'schwer' (khó) màu 'gelb'
  state.activeColor = 'gelb';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  state.playerHand[0] = {
    id: 'test_gegenteil_1',
    type: 'action',
    actionType: 'gegenteil',
    color: 'neutral',
    label: 'GEGENTEIL!'
  };

  const val = DAU_TU_ENGINE.validatePlayCard(state, 'test_gegenteil_1', 'player');
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.nextColor, 'gelb', 'GEGENTEIL giữ nguyên màu hiện hành (gelb)');
  assert.strictEqual(val.nextEntryId, 'leicht', 'Đổi sang nghĩa đối lập (leicht)');
  assert.strictEqual(val.nextContextId, 'ctx_adj_difficulty_easy');

  DAU_TU_ENGINE.executePlayCard(state, 'test_gegenteil_1', 'player');
  assert.strictEqual(state.activeColor, 'gelb');
  assert.strictEqual(state.activeEntryId, 'leicht');
  assert.strictEqual(state.activeContextId, 'ctx_adj_difficulty_easy');
  assert.strictEqual(state.activePlayer, 'bot');

  // Kiểm tra trường hợp bàn vừa đánh lá chức năng (activeEntryId === null): GEGENTEIL phải bị từ chối
  state.activeEntryId = null;
  state.activeContextId = null;
  state.playerHand[1] = {
    id: 'test_gegenteil_2',
    type: 'action',
    actionType: 'gegenteil',
    color: 'neutral',
    label: 'GEGENTEIL!'
  };
  const valAfterAction = DAU_TU_ENGINE.validatePlayCard(state, 'test_gegenteil_2', 'player');
  assert.strictEqual(valAfterAction.valid, false, 'Không thể dùng GEGENTEIL khi chưa có từ vựng mục tiêu');
});

it('B9: Sau khi rút bài: chỉ được đánh chính lá vừa rút hoặc chọn Giữ bài', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 108, 'player');
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  // Lá cũ trong tay
  state.playerHand[0] = {
    id: 'old_card_in_hand',
    deckId: 'adjektive',
    type: 'word',
    color: 'blau',
    entryId: 'teuer',
    label: 'teuer'
  };

  // Rút 1 lá
  const drawRes = DAU_TU_ENGINE.executeDrawCard(state, 'player');
  assert.strictEqual(drawRes.success, true);
  assert.strictEqual(state.hasDrawnThisTurn, true);

  // Cố tình đánh lá cũ trong tay -> Bị từ chối
  const valOld = DAU_TU_ENGINE.validatePlayCard(state, 'old_card_in_hand', 'player');
  assert.strictEqual(valOld.valid, false, 'Không được đánh lá cũ sau khi đã rút bài');
  assert(valOld.reason.includes('chính lá vừa rút'), 'Lý do phải nêu rõ chỉ được đánh lá vừa rút');

  // Chọn giữ bài -> kết thúc lượt sang bot
  const passRes = DAU_TU_ENGINE.executePassTurn(state, 'player');
  assert.strictEqual(passRes.success, true);
  assert.strictEqual(state.activePlayer, 'bot');
  assert.strictEqual(state.hasDrawnThisTurn, false);
});

it('B10: Đánh sai phạt rút 1 lá nếu chưa rút; không phạt kép nếu đã rút trước đó', () => {
  const state = realFixture('teuer', 'blau');

  // 1. Đánh sai khi chưa rút: bị phạt rút 1 lá và mất lượt
  const pen1 = DAU_TU_ENGINE.executeInvalidPenalty(state, 'player', 'adj_card_blau_teuer', 'Lá không hợp lệ');
  assert.strictEqual(pen1.penalized, true);
  assert(pen1.drawnPenaltyCard !== null, 'Phải rút 1 lá phạt');
  assert.strictEqual(state.activePlayer, 'bot');

  // 2. Nếu đã rút trong lượt mà đánh sai: không bị phạt rút thêm lá thứ 2
  state.activePlayer = 'player';
  state.hasDrawnThisTurn = true;
  state.drawnCardIdThisTurn = 'adj_card_blau_teuer';
  const initialCount = state.playerHand.length;
  const pen2 = DAU_TU_ENGINE.executeInvalidPenalty(state, 'player', 'adj_card_blau_teuer', 'Đánh sai');
  assert.strictEqual(pen2.drawnPenaltyCard, null, 'Không phạt rút thêm lá');
  assert.strictEqual(state.playerHand.length, initialCount);
  assert.strictEqual(state.activePlayer, 'bot');
});

it('B11: Hết bài thì thắng; lá cuối là +2 thì đối thủ vẫn rút 2 lá trước khi kết thúc', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 110, 'player');
  state.activeColor = 'rot';

  // Giữ đúng 1 lá trong tay player, chuyển 4 lá còn lại vào drawPile để bảo toàn đúng 60 lá
  while (state.playerHand.length > 1) {
    state.drawPile.push(state.playerHand.pop());
  }

  state.playerHand[0] = {
    id: 'last_plus2_card',
    type: 'action',
    actionType: 'plus2',
    color: 'rot',
    label: '+2'
  };
  const initialBotCards = state.botHand.length;

  const res = DAU_TU_ENGINE.executePlayCard(state, 'last_plus2_card', 'player');
  assert.strictEqual(res.gameOver, true, 'Ván chơi phải kết thúc');
  assert.strictEqual(res.winner, 'player', 'Player là người chiến thắng');
  assert.strictEqual(state.playerHand.length, 0, 'Tay player sạch bài');
  assert.strictEqual(state.botHand.length, initialBotCards + 2, 'Bot vẫn phải nhận phạt 2 lá');
  DAU_TU_ENGINE.assertTotalCards(state);
});

// ====================================================
// NHÓM C: NGÔN NGỮ VÀ TRỢ GIÚP
// ====================================================
console.log('\n--- NHÓM C: Ngôn ngữ học và Hệ thống gợi ý 2 bước ---');

it('C1: Câu "schwer" diễn giải theo nghĩa khó, không dùng dữ liệu nghĩa nặng', () => {
  const ctx = DAU_TU_DATA.ADJEKTIVE.contexts.ctx_adj_difficulty_hard;
  assert(ctx.explanationVi.includes('không phải vật nặng về khối lượng'));
  const sentence = ctx.sentenceVariants.schwer;
  assert(sentence.de.includes('Aufgabe'));
  assert(sentence.vi.includes('khó'));
});

it('C2: Động từ tách lưu đúng các đoạn token highlight riêng biệt', () => {
  const ctxStart = DAU_TU_DATA.VERBEN.contexts.ctx_verb_timing_start;
  const anfSentence = ctxStart.sentenceVariants.anfangen;
  assert.deepStrictEqual(anfSentence.highlightTokens, ['fängt', 'an'], 'Phải làm nổi bật fängt và an tách rời');

  const ctxWindow = DAU_TU_DATA.VERBEN.contexts.ctx_verb_window_open;
  const aufSentence = ctxWindow.sentenceVariants.aufmachen;
  assert.deepStrictEqual(aufSentence.highlightTokens, ['mache', 'auf'], 'Phải làm nổi bật mache và auf tách rời');
});

it('C3: Gợi ý Bước 1 không tiết lộ đáp án; Bước 2 chỉ đúng lá đồng nghĩa trên tay', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 111, 'player');
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  // Bước 1: chỉ giải thích ngữ cảnh
  const hint1 = DAU_TU_ENGINE.getHint(state, 1);
  assert.strictEqual(hint1.step, 1);
  assert(hint1.hintText.includes('khó khăn'));
  assert(!hint1.hintText.includes('schwierig'), 'Bước 1 không được chứa tên lá đáp án');

  // Đưa lá đồng nghĩa 'schwierig' vào tay người chơi
  state.playerHand = [{
    id: 'adj_rot_schwierig_test',
    type: 'word',
    color: 'rot',
    entryId: 'schwierig',
    label: 'schwierig'
  }];

  // Bước 2: chỉ lá phù hợp
  const hint2 = DAU_TU_ENGINE.getHint(state, 2);
  assert.strictEqual(hint2.step, 2);
  assert.strictEqual(hint2.foundSynonym, true);
  assert.strictEqual(hint2.recommendedCardId, 'adj_rot_schwierig_test');
  assert(hint2.hintText.includes('schwierig'));

  // Nếu người chơi KHÔNG có lá đồng nghĩa nào trên tay:
  state.playerHand = [{
    id: 'adj_rot_teuer_test',
    type: 'word',
    color: 'rot',
    entryId: 'teuer',
    label: 'teuer'
  }];
  const hintNoSyn = DAU_TU_ENGINE.getHint(state, 2);
  assert.strictEqual(hintNoSyn.foundSynonym, false);
  assert(hintNoSyn.hintText.includes('Không có lá đồng nghĩa'), 'Phải nói thật khi không có lá đồng nghĩa');
});

it('C4: Sau GEGENTEIL, gợi ý cập nhật theo nghĩa của từ mới', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 112, 'player');
  state.activeColor = 'rot';
  state.activeEntryId = 'schwer';
  state.activeContextId = 'ctx_adj_difficulty_hard';

  // Thực hiện GEGENTEIL -> đổi sang 'leicht'
  const mapping = DAU_TU_DATA.ADJEKTIVE.antonyms['ctx_adj_difficulty_hard:schwer'];
  state.activeEntryId = mapping.targetEntryId;
  state.activeContextId = mapping.targetContextId;

  const hintAfterGegenteil = DAU_TU_ENGINE.getHint(state, 1);
  assert(hintAfterGegenteil.hintText.includes('dễ dàng, đơn giản'), 'Gợi ý phải cập nhật theo từ leicht');
});

// ====================================================
// NHÓM D: VẬN HÀNH VÀ BOT
// ====================================================
console.log('\n--- NHÓM D: Vận hành, Cách ly thông tin Bot và Mô phỏng ---');

it('D1: Bot chỉ nhận observation công khai, không nhận tay người chơi hoặc draw pile', () => {
  const state = DAU_TU_ENGINE.createInitialGameState('adjektive', 113, 'bot');
  const obs = DAU_TU_BOT.buildPublicObservation(state);

  assert.strictEqual(obs.playerHand, undefined, 'Observation tuyệt đối không chứa mảng bài của player');
  assert.strictEqual(obs.drawPile, undefined, 'Observation tuyệt đối không chứa chồng bài rút');
  assert.strictEqual(obs.seed, undefined, 'Observation không chứa seed ngẫu nhiên');
  assert.strictEqual(typeof obs.playerCardCount, 'number', 'Bot chỉ biết số lượng lá của đối thủ');

  const decision = DAU_TU_BOT.getBotDecision(obs, state.botHand);
  assert(['play', 'draw', 'pass'].includes(decision.action), 'Quyết định của bot phải là play, draw hoặc pass');
});

it('D2: Mô phỏng 20 ván chơi tự động với seed cố định: không crash, bảo toàn 60 lá', () => {
  const DECKS = ['adjektive', 'verben'];

  for (let sim = 0; sim < 20; sim++) {
    const deckId = DECKS[sim % 2];
    const seed = 5000 + sim;
    const state = DAU_TU_ENGINE.createInitialGameState(deckId, seed);
    let turns = 0;
    const maxTurns = 120; // Giới hạn kiểm thử

    while (state.turnState !== 'game_over' && turns < maxTurns) {
      turns++;
      DAU_TU_ENGINE.assertTotalCards(state);

      const isPlayerTurn = state.activePlayer === 'player';
      const currentHand = isPlayerTurn ? state.playerHand : state.botHand;
      const role = state.activePlayer;

      const obs = DAU_TU_BOT.buildPublicObservation(state);
      const decision = DAU_TU_BOT.getBotDecision(obs, currentHand);

      if (decision.action === 'play') {
        const val = DAU_TU_ENGINE.validatePlayCard(state, decision.cardId, role, decision.chosenColor);
        assert.strictEqual(val.valid, true, `Seed ${seed} Turn ${turns}: Nước đi của ${role} phải hợp lệ`);
        DAU_TU_ENGINE.executePlayCard(state, decision.cardId, role, decision.chosenColor);
      } else if (decision.action === 'draw') {
        const drawRes = DAU_TU_ENGINE.executeDrawCard(state, role);
        if (drawRes.success) {
          // Thử đánh lá vừa rút nếu có thể
          const postObs = DAU_TU_BOT.buildPublicObservation(state);
          const postDecision = DAU_TU_BOT.getBotDecision(postObs, currentHand);
          if (postDecision.action === 'play') {
            DAU_TU_ENGINE.executePlayCard(state, postDecision.cardId, role, postDecision.chosenColor);
          } else {
            DAU_TU_ENGINE.executePassTurn(state, role);
          }
        } else {
          // Hết bài rút
          break;
        }
      } else if (decision.action === 'pass') {
        DAU_TU_ENGINE.executePassTurn(state, role);
      }
    }

    DAU_TU_ENGINE.assertTotalCards(state);
  }
});

console.log('\n====================================================');
console.log(`ACCEPTANCE SUMMARY: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL "ĐẤU TỪ — VOKABELGO" EVALUATOR ACCEPTANCE TESTS PASSED!');
} else {
  console.error(`⚠️ ${totalTests - passedTests} TESTS FAILED.`);
}
console.log('====================================================\n');
