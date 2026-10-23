/**
 * DAU-TU-ENGINE.JS
 * Bộ máy luật chơi (Game Engine) cho "Đấu từ — VokabelGo" v0.2 (giữ luật ván thường).
 * Độc lập với giao diện, hỗ trợ seed tái lập và bảo toàn số lượng lá bài (60 lá).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const data = require('./dau-tu-data.js');
    module.exports = factory(data);
  } else {
    root.DAU_TU_ENGINE = factory(root.DAU_TU_DATA);
  }
})(typeof self !== 'undefined' ? self : this, function (DAU_TU_DATA) {
  'use strict';

  // PRNG có seed (Mulberry32)
  function createRng(seed) {
    let s = (seed === undefined || seed === null) ? Math.floor(Math.random() * 2147483647) : (seed >>> 0);
    return function () {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Trộn mảng Fisher-Yates
  function shuffle(array, rng) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function cloneCard(card) {
    return Object.assign({}, card);
  }

  function cloneCards(cards) {
    return cards.map(cloneCard);
  }

  function getDeckData(deckId) {
    if (deckId && typeof deckId === 'object' && deckId.entries) return deckId;
    if (typeof DAU_TU_DATA.getActiveMatchDeck === 'function') {
      const active = DAU_TU_DATA.getActiveMatchDeck(deckId);
      if (active) return active;
    }
    if (deckId === 'adjektive') return DAU_TU_DATA.ADJEKTIVE;
    if (deckId === 'verben') return DAU_TU_DATA.VERBEN;
    if (deckId === 'lexicon_expanded') return DAU_TU_DATA.LEXICON_EXPANDED;
    throw new Error(`Bộ từ không hợp lệ: ${deckId}`);
  }

  function isSynonym(deckId, contextId, fromEntryId, toEntryId) {
    if (!contextId || !fromEntryId || !toEntryId) return false;
    const deck = getDeckData(deckId);
    return deck.synonyms.some(function (edge) {
      return edge.contextId === contextId && edge.from === fromEntryId && edge.to === toEntryId;
    });
  }

  function getAntonymMapping(deckId, contextId, entryId) {
    if (!contextId || !entryId) return null;
    const deck = getDeckData(deckId);
    const key = `${contextId}:${entryId}`;
    return deck.antonyms[key] || null;
  }

  function getContextSentence(deckId, contextId, entryId) {
    if (!contextId || !entryId) return null;
    const deck = getDeckData(deckId);
    const ctx = deck.contexts[contextId];
    if (!ctx) return null;
    if (ctx.sentenceVariants && ctx.sentenceVariants[entryId]) {
      return ctx.sentenceVariants[entryId];
    }
    if (ctx.variants && ctx.variants[entryId]) {
      const v = ctx.variants[entryId];
      return {
        de: v.de,
        vi: v.vi,
        highlightWord: (v.highlightTokens && v.highlightTokens[0]) || ''
      };
    }
    return null;
  }

  function getHand(state, role) {
    if (role === 'player') return state.playerHand;
    if (role === 'bot') return state.botHand;
    if (state.hands && state.hands[role]) return state.hands[role];
    if (role === 'bot_top' && state.botHand) return state.botHand;
    return null;
  }

  function getPlayerName(state, role) {
    if (state.playerNames && state.playerNames[role]) return state.playerNames[role];
    if (role === 'player') return 'Bạn';
    if (role === 'bot_left') return 'Max';
    if (role === 'bot_top') return 'Lena';
    if (role === 'bot_right') return 'Mia';
    return 'VokabelBot';
  }

  function getNextPlayer(state, step = 1) {
    const seats = state.seats || ['player', 'bot'];
    const curIdx = seats.indexOf(state.activePlayer);
    if (curIdx === -1) return seats[0];
    return seats[(curIdx + step) % seats.length];
  }

  /**
   * Khởi tạo trạng thái ván mới (Hỗ trợ 2 người chơi hoặc bàn 4 người v0.3)
   */
  function createInitialGameState(deckId, seed, startingPlayer, playerCount = 2, options = {}) {
    seed = (seed == null ? Math.floor(Math.random() * 4294967296) : seed) >>> 0;
    const rng = createRng(seed);

    let matchDeck = (options && options.matchDeck) || null;
    if (!matchDeck && options && options.dynamicRotation) {
      if (typeof DAU_TU_DATA.buildDynamicMatchDeck === 'function') {
        matchDeck = DAU_TU_DATA.buildDynamicMatchDeck(deckId, { seed, ...options });
      }
    }

    const allPhysicalCards = matchDeck
      ? matchDeck.cards.map(c => Object.assign({}, c))
      : DAU_TU_DATA.createDeckPhysicalCards(deckId, options);
    const shuffled = shuffle(allPhysicalCards, rng);

    const is4Player = playerCount === 4;
    const seats = is4Player
      ? ['player', 'bot_left', 'bot_top', 'bot_right']
      : ['player', 'bot'];
    const playerNames = is4Player
      ? { player: 'Bạn', bot_left: 'Max', bot_top: 'Lena', bot_right: 'Mia' }
      : { player: 'Bạn', bot: 'VokabelBot' };

    const playerHand = [];
    const botHand = [];
    const botLeftHand = [];
    const botRightHand = [];

    // Chia 5 lá mỗi người chơi
    for (let i = 0; i < 5; i++) {
      playerHand.push(shuffled.pop());
      botHand.push(shuffled.pop());
      if (is4Player) {
        botLeftHand.push(shuffled.pop());
        botRightHand.push(shuffled.pop());
      }
    }

    // Tìm lá mở bàn: BẮT BUỘC là lá từ bình thường
    let openingIndex = shuffled.length - 1;
    while (openingIndex >= 0 && shuffled[openingIndex].type !== 'word') {
      openingIndex--;
    }
    if (openingIndex < 0) {
      throw new Error('Không tìm thấy lá từ để mở bàn.');
    }
    const openingCard = shuffled.splice(openingIndex, 1)[0];
    const discardPile = [openingCard];
    const drawPile = shuffled; // 49 lá (2P) hoặc 39 lá (4P)

    const deckData = matchDeck || getDeckData(deckId);
    const openingEntry = deckData.entries[openingCard.entryId];

    let activePlayer = startingPlayer;
    if (!activePlayer || !seats.includes(activePlayer)) {
      activePlayer = seats[Math.floor(rng() * seats.length)];
    }

    const state = {
      deckId: deckId,
      seed: seed,
      matchDeck: matchDeck,
      matchReport: matchDeck ? matchDeck.matchReport : null,
      playerCount: seats.length,
      seats: seats,
      playerNames: playerNames,
      reshuffleCount: 0,
      drawPile: drawPile,
      discardPile: discardPile,
      playerHand: playerHand,
      botHand: botHand,
      activePlayer: activePlayer,
      activeColor: openingCard.color,
      activeEntryId: openingCard.entryId,
      activeContextId: openingEntry.baseContextId,
      physicalTopCard: openingCard,
      turnState: 'idle', // 'idle' | 'game_over'
      hasDrawnThisTurn: false,
      drawnCardIdThisTurn: null,
      winner: null,
      isDraw: false,
      lastAction: {
        type: 'game_start',
        text: `Ván mới bắt đầu. Lượt đầu tiên: ${playerNames[activePlayer]}.`,
        matchType: null
      },
      helpStats: {
        unassistedMoves: 0,
        viewedMeaningMoves: 0,
        viewedCardHintMoves: 0
      },
      currentTurnUsedHelp: false,
      currentTurnUsedCardHint: false,
      wortKetteActive: false,
      wortKetteConsumedThisTurn: false,
      wortKetteRelation: null,
      wortKettePlayer: null,
      metrics: {
        semanticMatches: 0,
        crossColorSemanticMatches: 0,
        sameColorMoves: 0,
        sameWordMoves: 0,
        wortKetteTriggered: 0,
        wortKetteBonusPlayed: 0,
        wortKetteBonusSkipped: 0,
        wortKetteNoLegalBonus: 0,
        hintStep1Used: 0,
        answerHintUsed: 0,
        specialMoves: 0
      },
      turnCount: 1
    };

    if (is4Player) {
      state.hands = {
        player: playerHand,
        bot_left: botLeftHand,
        bot_top: botHand,
        bot_right: botRightHand
      };
    }

    assertTotalCards(state);
    return state;
  }

  function assertTotalCards(state) {
    let cards = [];
    if (state.playerCount === 4 && state.hands) {
      state.hands.player = state.playerHand;
      cards = state.hands.player.concat(state.hands.bot_left || [], state.hands.bot_top || [], state.hands.bot_right || []);
    } else {
      cards = state.playerHand.concat(state.botHand);
    }
    const total = cards.length + state.drawPile.length + state.discardPile.length;
    if (total !== 60) {
      throw new Error(`Lỗi bảo toàn bài: tổng số lá là ${total}, kỳ vọng 60.`);
    }
    const allCards = cards.concat(state.drawPile, state.discardPile);
    if (new Set(allCards.map(c => c.id)).size !== total) {
      throw new Error('Có ID lá bài trùng nhau.');
    }
  }

  /**
   * Tái trộn chồng rút khi hết bài (giữ nguyên lá trên cùng của discardPile)
   */
  function reshuffleDiscardPileIfNeeded(state, rng) {
    if (state.drawPile.length > 0) return;
    if (state.discardPile.length <= 1) return; // Không đủ để trộn

    const topCard = state.discardPile[state.discardPile.length - 1];
    const cardsToShuffle = state.discardPile.slice(0, state.discardPile.length - 1);
    state.reshuffleCount = (state.reshuffleCount || 0) + 1;
    const localRng = rng || createRng((state.seed ^ Math.imul(state.reshuffleCount, 0x9e3779b9)) >>> 0);
    const shuffled = shuffle(cardsToShuffle, localRng);

    state.drawPile = shuffled;
    state.discardPile = [topCard];
    assertTotalCards(state);
  }

  /**
   * Kiểm tra tính hợp lệ của việc đánh lá bài
   */
  function validatePlayCard(state, cardId, playerRole, chosenColor) {
    if (state.turnState === 'game_over') {
      return { valid: false, reason: 'Ván chơi đã kết thúc.' };
    }
    if (state.activePlayer !== playerRole) {
      return { valid: false, reason: 'Chưa tới lượt của bạn.' };
    }

    const hand = getHand(state, playerRole);
    if (!hand) {
      return { valid: false, reason: 'Người chơi không có trên bàn.' };
    }
    const card = hand.find(c => c.id === cardId);
    if (!card) {
      return { valid: false, reason: 'Lá bài không có trên tay.' };
    }

    // Sau khi rút bài trong lượt: chỉ được đánh chính lá vừa rút
    if (state.hasDrawnThisTurn) {
      if (cardId !== state.drawnCardIdThisTurn) {
        return {
          valid: false,
          reason: 'Sau khi rút bài, chỉ được đánh chính lá vừa rút hoặc chọn Giữ bài.'
        };
      }
    }

    // 1. Lá chức năng: Aussetzen
    if (card.actionType === 'aussetzen') {
      const sameColor = card.color === state.activeColor;
      const sameSymbol = state.physicalTopCard && state.physicalTopCard.actionType === 'aussetzen';
      if (!sameColor && !sameSymbol) {
        return {
          valid: false,
          reason: `Lá Aussetzen màu ${DAU_TU_DATA.COLORS[card.color].nameVi} không khớp với màu hiện hành (${DAU_TU_DATA.COLORS[state.activeColor].nameVi}).`
        };
      }
      return {
        valid: true,
        matchType: 'action_aussetzen',
        actionType: 'aussetzen',
        nextColor: card.color,
        nextEntryId: null,
        nextContextId: null,
        explanation: 'Đối thủ bị bỏ lượt! Bạn được đi tiếp.'
      };
    }

    // 2. Lá chức năng: Zieh Zwei (+2)
    if (card.actionType === 'plus2') {
      const sameColor = card.color === state.activeColor;
      const sameSymbol = state.physicalTopCard && state.physicalTopCard.actionType === 'plus2';
      if (!sameColor && !sameSymbol) {
        return {
          valid: false,
          reason: `Lá +2 màu ${DAU_TU_DATA.COLORS[card.color].nameVi} không khớp với màu hiện hành (${DAU_TU_DATA.COLORS[state.activeColor].nameVi}).`
        };
      }
      return {
        valid: true,
        matchType: 'action_plus2',
        actionType: 'plus2',
        nextColor: card.color,
        nextEntryId: null,
        nextContextId: null,
        explanation: 'Đối thủ phải rút 2 lá và mất lượt! Bạn được đi tiếp.'
      };
    }

    // 3. Lá chức năng: Farbenwahl (đổi màu)
    if (card.actionType === 'farbenwahl') {
      if (!chosenColor) {
        return {
          valid: true,
          requiresColorChoice: true,
          matchType: 'action_farbenwahl',
          actionType: 'farbenwahl',
          explanation: 'Vui lòng chọn màu mới.'
        };
      }
      if (!DAU_TU_DATA.COLOR_KEYS.includes(chosenColor)) {
        return { valid: false, reason: 'Màu được chọn không hợp lệ.' };
      }
      return {
        valid: true,
        requiresColorChoice: false,
        matchType: 'action_farbenwahl',
        actionType: 'farbenwahl',
        nextColor: chosenColor,
        nextEntryId: null,
        nextContextId: null,
        explanation: `Đã đổi màu bàn chơi sang ${DAU_TU_DATA.COLORS[chosenColor].nameVi}.`
      };
    }

    // 4. Lá chức năng: GEGENTEIL! (đổi nghĩa)
    if (card.actionType === 'gegenteil') {
      if (!state.activeEntryId || !state.activeContextId) {
        return {
          valid: false,
          reason: 'Không thể dùng GEGENTEIL khi trên bàn chưa có từ vựng mục tiêu hiệu lực (sau lá chức năng).'
        };
      }
      const mapping = getAntonymMapping(state.deckId, state.activeContextId, state.activeEntryId);
      if (!mapping) {
        return {
          valid: false,
          reason: 'Từ hiện hành không có liên kết trái nghĩa đã khai báo trong ngữ cảnh này.'
        };
      }
      return {
        valid: true,
        matchType: 'action_gegenteil',
        actionType: 'gegenteil',
        nextColor: state.activeColor, // Giữ nguyên màu hiện hành!
        nextEntryId: mapping.targetEntryId,
        nextContextId: mapping.targetContextId,
        antonymExplanation: mapping.explanationShortVi,
        explanation: `GEGENTEIL — Nghĩa đã đổi: ${mapping.explanationShortVi}. Màu giữ nguyên (${DAU_TU_DATA.COLORS[state.activeColor].nameVi}).`
      };
    }

    // 5. Lá từ bình thường
    if (card.type === 'word') {
      const isColorMatch = card.color === state.activeColor;
      const isSynonymMatch = isSynonym(state.deckId, state.activeContextId, state.activeEntryId, card.entryId);
      const isSameWord = state.activeEntryId === card.entryId;

      if (!isColorMatch && !isSynonymMatch && !isSameWord) {
        return {
          valid: false,
          reason: `Lá "${card.label}" (${DAU_TU_DATA.COLORS[card.color].nameVi}) không cùng màu và cũng không có quan hệ đồng nghĩa/cùng từ với mục tiêu hiện hành.`
        };
      }

      let matchType = 'color';
      let nextContextId = state.activeContextId;

      if (isSynonymMatch && isColorMatch) {
        matchType = 'both';
      } else if (isSynonymMatch) {
        matchType = 'meaning';
      } else if (isSameWord) {
        matchType = 'same_word';
      } else {
        // Chỉ cùng màu: chuyển sang ngữ cảnh nền của từ mới
        matchType = 'color';
        const deckData = getDeckData(state.deckId);
        nextContextId = deckData.entries[card.entryId].baseContextId;
      }

      return {
        valid: true,
        matchType: matchType,
        actionType: null,
        nextColor: card.color,
        nextEntryId: card.entryId,
        nextContextId: nextContextId,
        isSynonym: isSynonymMatch,
        isSameWord: isSameWord,
        isColorMatch: isColorMatch,
        explanation: matchType === 'both' ? 'Cùng màu VÀ Nối nghĩa đồng nghĩa!' :
                     matchType === 'meaning' ? 'Nối nghĩa đồng nghĩa!' :
                     matchType === 'same_word' ? 'Cùng từ (khác màu)!' :
                     'Đánh theo cùng màu.'
      };
    }

    return { valid: false, reason: 'Loại lá bài không hợp lệ.' };
  }

  /**
   * Thực hiện đánh lá bài (State mutation an toàn)
   */
  function executePlayCard(state, cardId, playerRole, chosenColor) {
    const val = validatePlayCard(state, cardId, playerRole, chosenColor);
    if (!val.valid) {
      throw new Error(`Nước đi không hợp lệ: ${val.reason}`);
    }

    // Validation may permit opening the picker, but execution must be atomic.
    if (val.requiresColorChoice) {
      throw new Error('Hãy chọn màu trước khi đánh lá Đổi màu.');
    }
    const hand = getHand(state, playerRole);
    if (!hand) throw new Error(`Không tìm thấy bộ bài của người chơi: ${playerRole}`);
    const cardIndex = hand.findIndex(c => c.id === cardId);
    const playedCard = hand.splice(cardIndex, 1)[0];

    // Đưa vào discardPile
    state.discardPile.push(playedCard);
    state.physicalTopCard = playedCard;

    const oldActiveColor = state.activeColor;
    const oldActiveEntryId = state.activeEntryId;
    const deckData = getDeckData(state.deckId);
    const oldTargetLemma = oldActiveEntryId && deckData.entries[oldActiveEntryId] ? deckData.entries[oldActiveEntryId].lemma : (state.physicalTopCard ? state.physicalTopCard.label : '');
    const wasWortKetteBonus = !!state.wortKetteActive;
    const wasStep2HintUsed = !!state.currentTurnUsedCardHint;

    // Ghi nhận trợ giúp của người chơi trong lượt
    if (playerRole === 'player') {
      if (state.currentTurnUsedCardHint) {
        state.helpStats.viewedCardHintMoves++;
        if (state.metrics) state.metrics.answerHintUsed++;
      } else if (state.currentTurnUsedHelp) {
        state.helpStats.viewedMeaningMoves++;
        if (state.metrics) state.metrics.hintStep1Used++;
      } else {
        state.helpStats.unassistedMoves++;
      }
    }

    // Reset cờ lượt
    state.hasDrawnThisTurn = false;
    state.drawnCardIdThisTurn = null;
    state.currentTurnUsedHelp = false;
    state.currentTurnUsedCardHint = false;

    const remainingCardsCount = hand.length;

    // Xử lý hiệu ứng theo loại lá
    if (playedCard.actionType === 'aussetzen') {
      if (state.metrics) state.metrics.specialMoves++;
      if (wasWortKetteBonus && state.metrics) state.metrics.wortKetteBonusPlayed++;
      state.wortKetteActive = false;
      state.wortKetteConsumedThisTurn = false;

      state.activeColor = val.nextColor;
      state.activeEntryId = null;
      state.activeContextId = null;

      const is2Player = !state.seats || state.seats.length === 2;
      const skippedPlayer = getNextPlayer(state, 1);
      const nextPlayer = is2Player ? playerRole : getNextPlayer(state, 2);

      state.lastAction = {
        type: 'aussetzen',
        player: playerRole,
        skippedPlayer: skippedPlayer,
        text: is2Player
          ? `${getPlayerName(state, playerRole)} đã đánh Aussetzen! Đối thủ bị bỏ lượt.`
          : `${getPlayerName(state, playerRole)} đã đánh Aussetzen! Bỏ qua lượt của ${getPlayerName(state, skippedPlayer)}!`,
        card: playedCard
      };

      // Kiểm tra thắng
      if (remainingCardsCount === 0) {
        state.turnState = 'game_over';
        state.winner = playerRole;
        assertTotalCards(state);
        return { state: state, nextTurn: null, gameOver: true, winner: playerRole };
      }

      state.activePlayer = nextPlayer;
      state.turnCount++;
      assertTotalCards(state);
      return { state: state, nextTurn: nextPlayer, gameOver: false, extraTurn: is2Player, skippedPlayer: skippedPlayer };
    }

    if (playedCard.actionType === 'plus2') {
      if (state.metrics) state.metrics.specialMoves++;
      if (wasWortKetteBonus && state.metrics) state.metrics.wortKetteBonusPlayed++;
      state.wortKetteActive = false;
      state.wortKetteConsumedThisTurn = false;

      state.activeColor = val.nextColor;
      state.activeEntryId = null;
      state.activeContextId = null;

      const is2Player = !state.seats || state.seats.length === 2;
      const victimRole = getNextPlayer(state, 1);
      const victimHand = getHand(state, victimRole);
      const nextPlayer = is2Player ? playerRole : getNextPlayer(state, 2);
      const penaltyCards = [];

      for (let i = 0; i < 2; i++) {
        reshuffleDiscardPileIfNeeded(state);
        if (state.drawPile.length > 0) {
          const drawn = state.drawPile.pop();
          victimHand.push(drawn);
          penaltyCards.push(drawn);
        }
      }

      state.lastAction = {
        type: 'plus2',
        player: playerRole,
        victim: victimRole,
        text: `${getPlayerName(state, playerRole)} đã đánh +2! ${getPlayerName(state, victimRole)} phải rút ${penaltyCards.length} lá và mất lượt.`,
        card: playedCard,
        drawnCount: penaltyCards.length
      };

      // Nếu lá cuối cùng là +2: đối thủ đã rút 2 lá rồi kết thúc ván
      if (remainingCardsCount === 0) {
        state.turnState = 'game_over';
        state.winner = playerRole;
        assertTotalCards(state);
        return { state: state, nextTurn: null, gameOver: true, winner: playerRole };
      }

      state.activePlayer = nextPlayer;
      state.turnCount++;
      assertTotalCards(state);
      return { state: state, nextTurn: nextPlayer, gameOver: false, extraTurn: is2Player, victim: victimRole, drawnCount: penaltyCards.length };
    }

    if (playedCard.actionType === 'farbenwahl') {
      if (state.metrics) state.metrics.specialMoves++;
      if (wasWortKetteBonus && state.metrics) state.metrics.wortKetteBonusPlayed++;
      state.wortKetteActive = false;
      state.wortKetteConsumedThisTurn = false;

      state.activeColor = val.nextColor;
      state.activeEntryId = null;
      state.activeContextId = null;
      state.lastAction = {
        type: 'farbenwahl',
        player: playerRole,
        text: `${getPlayerName(state, playerRole)} đánh Farbenwahl: Đổi màu sang ${DAU_TU_DATA.COLORS[val.nextColor].nameVi}.`,
        card: playedCard,
        chosenColor: val.nextColor
      };

      if (remainingCardsCount === 0) {
        state.turnState = 'game_over';
        state.winner = playerRole;
        assertTotalCards(state);
        return { state: state, nextTurn: null, gameOver: true, winner: playerRole };
      }

      state.activePlayer = getNextPlayer(state, 1);
      state.turnCount++;
      assertTotalCards(state);
      return { state: state, nextTurn: state.activePlayer, gameOver: false };
    }

    if (playedCard.actionType === 'gegenteil') {
      if (state.metrics) state.metrics.specialMoves++;
      if (wasWortKetteBonus && state.metrics) state.metrics.wortKetteBonusPlayed++;
      state.wortKetteActive = false;
      state.wortKetteConsumedThisTurn = false;

      state.activeEntryId = val.nextEntryId;
      state.activeContextId = val.nextContextId;
      // activeColor giữ nguyên!
      state.lastAction = {
        type: 'gegenteil',
        player: playerRole,
        text: `GEGENTEIL — Nghĩa đã đổi: ${val.antonymExplanation}.`,
        card: playedCard,
        antonymExplanation: val.antonymExplanation
      };

      if (remainingCardsCount === 0) {
        state.turnState = 'game_over';
        state.winner = playerRole;
        assertTotalCards(state);
        return { state: state, nextTurn: null, gameOver: true, winner: playerRole };
      }

      state.activePlayer = getNextPlayer(state, 1);
      state.turnCount++;
      assertTotalCards(state);
      return { state: state, nextTurn: state.activePlayer, gameOver: false };
    }

    // Lá từ bình thường
    if (state.metrics) {
      if (val.isSynonym) state.metrics.semanticMatches++;
      if (val.isSynonym && playedCard.color !== oldActiveColor && !val.isSameWord) state.metrics.crossColorSemanticMatches++;
      if (val.matchType === 'color') state.metrics.sameColorMoves++;
      if (val.isSameWord) state.metrics.sameWordMoves++;
    }

    if (wasWortKetteBonus) {
      if (state.metrics) state.metrics.wortKetteBonusPlayed++;
      state.wortKetteActive = false;
      state.wortKetteConsumedThisTurn = false;

      state.activeColor = val.nextColor;
      state.activeEntryId = val.nextEntryId;
      state.activeContextId = val.nextContextId;

      const sentence = getContextSentence(state.deckId, val.nextContextId, val.nextEntryId);
      state.lastAction = {
        type: 'word',
        player: playerRole,
        matchType: val.matchType,
        text: `${getPlayerName(state, playerRole)} đánh bonus "${playedCard.label}": ${val.explanation}`,
        card: playedCard,
        sentence: sentence
      };

      if (remainingCardsCount === 0) {
        state.turnState = 'game_over';
        state.winner = playerRole;
        assertTotalCards(state);
        return { state: state, nextTurn: null, gameOver: true, winner: playerRole };
      }

      state.activePlayer = getNextPlayer(state, 1);
      state.turnCount++;
      assertTotalCards(state);
      return { state: state, nextTurn: state.activePlayer, gameOver: false };
    }

    // Kiểm tra kích hoạt Wort-Kette (khi chưa phải bonus play)
    const isCrossColorSynonym =
      val.isSynonym &&
      playedCard.color !== oldActiveColor &&
      playedCard.entryId !== oldActiveEntryId &&
      !val.isSameWord;

    const shouldTriggerWortKette =
      isCrossColorSynonym &&
      !state.wortKetteConsumedThisTurn &&
      !wasStep2HintUsed &&
      remainingCardsCount > 0; // Win luôn ưu tiên (Section D14)

    if (shouldTriggerWortKette) {
      if (state.metrics) state.metrics.wortKetteTriggered++;
      state.wortKetteActive = true;
      state.wortKetteConsumedThisTurn = true;
      state.wortKettePlayer = playerRole;
      state.wortKetteRelation = { from: oldTargetLemma, to: playedCard.label };

      state.activeColor = playedCard.color;
      state.activeEntryId = playedCard.entryId;
      state.activeContextId = val.nextContextId;

      const sentence = getContextSentence(state.deckId, val.nextContextId, val.nextEntryId);
      state.lastAction = {
        type: 'word',
        player: playerRole,
        matchType: val.matchType,
        wortKette: true,
        relation: { from: oldTargetLemma, to: playedCard.label },
        text: `${getPlayerName(state, playerRole)} đánh "${playedCard.label}" ↔ WORT-KETTE! +1 nước đi.`,
        card: playedCard,
        sentence: sentence
      };

      assertTotalCards(state);
      return {
        state: state,
        nextTurn: playerRole,
        gameOver: false,
        wortKette: true,
        relation: { from: oldTargetLemma, to: playedCard.label }
      };
    }

    // Đánh bình thường (không kích hoạt Wort-Kette)
    state.activeColor = val.nextColor;
    state.activeEntryId = val.nextEntryId;
    state.activeContextId = val.nextContextId;

    const sentence = getContextSentence(state.deckId, val.nextContextId, val.nextEntryId);
    state.lastAction = {
      type: 'word',
      player: playerRole,
      matchType: val.matchType,
      text: `${getPlayerName(state, playerRole)} đã đánh "${playedCard.label}": ${val.explanation}`,
      card: playedCard,
      sentence: sentence
    };

    if (remainingCardsCount === 0) {
      state.turnState = 'game_over';
      state.winner = playerRole;
      assertTotalCards(state);
      return { state: state, nextTurn: null, gameOver: true, winner: playerRole };
    }

    state.activePlayer = getNextPlayer(state, 1);
    state.turnCount++;
    state.wortKetteConsumedThisTurn = false;
    state.wortKetteActive = false;
    assertTotalCards(state);
    return { state: state, nextTurn: state.activePlayer, gameOver: false };
  }

  /**
   * Rút 1 lá bài từ chồng rút
   */
  function executeDrawCard(state, playerRole) {
    if (state.turnState === 'game_over') {
      return { success: false, reason: 'Ván chơi đã kết thúc.' };
    }
    if (state.activePlayer !== playerRole) {
      return { success: false, reason: 'Chưa tới lượt của bạn.' };
    }
    if (state.wortKetteActive) {
      return { success: false, reason: 'Trong nước đi Wort-Kette không được rút bài.' };
    }
    if (state.hasDrawnThisTurn) {
      return { success: false, reason: 'Bạn đã rút bài trong lượt này rồi.' };
    }

    reshuffleDiscardPileIfNeeded(state);
    if (state.drawPile.length === 0) {
      const seats = state.seats || ['player', 'bot'];
      const canPlay = role => {
        const view = Object.assign({}, state, { activePlayer: role, hasDrawnThisTurn: false, drawnCardIdThisTurn: null });
        const hand = getHand(state, role);
        return hand && hand.some(c => validatePlayCard(view, c.id, role).valid);
      };
      if (seats.every(role => !canPlay(role))) {
        state.turnState = 'game_over'; state.winner = null; state.isDraw = true;
        state.lastAction = { type: 'stalemate', text: 'Hòa: tất cả không còn nước đi hoặc bài để rút.' };
        return { success: false, noCards: true, gameOver: true, reason: state.lastAction.text };
      }
      if (!canPlay(playerRole)) {
        state.activePlayer = getNextPlayer(state, 1);
        state.hasDrawnThisTurn = false; state.drawnCardIdThisTurn = null;
        state.currentTurnUsedHelp = false; state.currentTurnUsedCardHint = false;
        state.turnCount++;
        state.lastAction = {type:'pass', player:playerRole, text:'Hết bài rút; chuyển lượt vì không có nước đi.'};
        return { success:false, noCards:true, passed:true, reason:state.lastAction.text };
      }
      return { success: false, noCards:true, reason: 'Hết bài rút. Hãy chọn một lá đang có.' };
    }

    const hand = getHand(state, playerRole);
    const drawn = state.drawPile.pop();
    hand.push(drawn);

    state.hasDrawnThisTurn = true;
    state.drawnCardIdThisTurn = drawn.id;

    // Kiểm tra xem lá vừa rút có đánh được không
    const checkPlayable = validatePlayCard(state, drawn.id, playerRole);

    assertTotalCards(state);
    return {
      success: true,
      drawnCard: drawn,
      canPlayDrawnCard: checkPlayable.valid
    };
  }

  /**
   * Bỏ qua nước đi bonus của Wort-Kette (kết thúc lượt tự nguyện không bị phạt)
   */
  function executePassWortKette(state, playerRole) {
    if (state.turnState === 'game_over') {
      return { success: false, reason: 'Ván chơi đã kết thúc.' };
    }
    if (!state.wortKetteActive || state.activePlayer !== playerRole) {
      return { success: false, reason: 'Không có trạng thái Wort-Kette để bỏ qua.' };
    }
    if (state.metrics) state.metrics.wortKetteBonusSkipped++;
    state.wortKetteActive = false;
    state.wortKetteConsumedThisTurn = false;
    state.currentTurnUsedHelp = false;
    state.currentTurnUsedCardHint = false;

    state.lastAction = {
      type: 'pass_wortkette',
      player: playerRole,
      text: `${getPlayerName(state, playerRole)} đã kết thúc lượt Wort-Kette.`
    };

    state.activePlayer = getNextPlayer(state, 1);
    state.turnCount++;
    assertTotalCards(state);
    return { success: true, nextTurn: state.activePlayer };
  }

  /**
   * Giữ bài và kết thúc lượt (sau khi đã rút 1 lá)
   */
  function executePassTurn(state, playerRole) {
    if (state.turnState === 'game_over') {
      return { success: false, reason: 'Ván chơi đã kết thúc.' };
    }
    if (state.activePlayer !== playerRole) {
      return { success: false, reason: 'Chưa tới lượt của bạn.' };
    }
    if (state.wortKetteActive) {
      return executePassWortKette(state, playerRole);
    }
    if (!state.hasDrawnThisTurn) {
      return { success: false, reason: 'Chưa rút bài nên không thể bấm Giữ bài/Bỏ qua.' };
    }

    state.hasDrawnThisTurn = false;
    state.drawnCardIdThisTurn = null;
    state.currentTurnUsedHelp = false;
    state.currentTurnUsedCardHint = false;

    state.lastAction = {
      type: 'pass',
      player: playerRole,
      text: `${getPlayerName(state, playerRole)} đã giữ bài và kết thúc lượt.`
    };

    state.activePlayer = getNextPlayer(state, 1);
    state.turnCount++;
    assertTotalCards(state);
    return { success: true, nextTurn: state.activePlayer };
  }

  /**
   * Xử lý phạt khi xác nhận đánh lá sai luật:
   * Lá ở lại tay, hiện lý do ngắn, rút 1 lá phạt nếu lượt đó chưa rút, rồi hết lượt.
   */
  function executeInvalidPenalty(state, playerRole, cardId, reason) {
    if (state.turnState === 'game_over' || state.activePlayer !== playerRole) {
      throw new Error('Không thể xử lý phạt ngoài lượt hoặc sau khi kết thúc.');
    }
    const checkedHand = getHand(state, playerRole);
    if (!checkedHand || !checkedHand.some(c => c.id === cardId)) throw new Error('Lá bài không ở trên tay.');
    if (validatePlayCard(state, cardId, playerRole).valid) throw new Error('Không phạt lá hợp lệ.');
    let drawnPenaltyCard = null;

    if (!state.hasDrawnThisTurn) {
      reshuffleDiscardPileIfNeeded(state);
      if (state.drawPile.length > 0) {
        drawnPenaltyCard = state.drawPile.pop();
        checkedHand.push(drawnPenaltyCard);
      }
    }

    state.hasDrawnThisTurn = false;
    state.drawnCardIdThisTurn = null;
    state.currentTurnUsedHelp = false;
    state.currentTurnUsedCardHint = false;

    state.lastAction = {
      type: 'invalid_play_penalty',
      player: playerRole,
      text: `Đánh sai luật (${reason}). ${drawnPenaltyCard ? 'Bị phạt rút 1 lá và mất lượt!' : 'Bị mất lượt!'}`,
      cardId: cardId
    };

    state.activePlayer = getNextPlayer(state, 1);
    state.turnCount++;
    assertTotalCards(state);

    return {
      penalized: true,
      reason: reason,
      drawnPenaltyCard: drawnPenaltyCard,
      nextTurn: state.activePlayer
    };
  }

  /**
   * Hệ thống gợi ý 2 bước
   */
  function getHint(state, step) {
    const deck = getDeckData(state.deckId);
    if (state.turnState === 'game_over' || state.activePlayer !== 'player') {
      return {step:step, recommendedCardId:null, hintText:'Chờ đến lượt của bạn để dùng gợi ý.'};
    }

    // Bước 1: Gợi ý nghĩa câu / từ trên bàn, KHÔNG nêu tên lá bài trên tay
    if (step === 1) {
      if (!state.activeEntryId || !state.activeContextId) {
        return {
          step: 1,
          hintText: `Bàn đang chơi theo màu ${DAU_TU_DATA.COLORS[state.activeColor].nameVi}. Chọn cùng màu, cùng biểu tượng chức năng hoặc lá Đổi màu. GEGENTEIL chưa dùng được vì bàn không có từ mục tiêu.`,
          contextExplanation: null
        };
      }
      const ctx = deck.contexts[state.activeContextId];
      return {
        step: 1,
        hintText: ctx ? ctx.explanationVi : 'Quan sát kỹ câu tiếng Đức trên bàn để nắm ngữ cảnh diễn đạt.',
        contextExplanation: ctx ? ctx.topic : null
      };
    }

    // Bước 2: Sau khi người chơi bấm "Chỉ lá phù hợp"
    // Chỉ xét các lá hiện được phép đánh trên tay người chơi
    let candidateCards = state.playerHand;
    if (state.hasDrawnThisTurn && state.drawnCardIdThisTurn) {
      candidateCards = candidateCards.filter(c => c.id === state.drawnCardIdThisTurn);
    }

    // 1. Ưu tiên tìm lá nối nghĩa đồng nghĩa hợp lệ
    const synonymCard = candidateCards.find(c => {
      if (c.type !== 'word') return false;
      return isSynonym(state.deckId, state.activeContextId, state.activeEntryId, c.entryId);
    });

    if (synonymCard) {
      return {
        step: 2,
        foundSynonym: true,
        recommendedCardId: synonymCard.id,
        hintText: `Có lá "${synonymCard.label}" đồng nghĩa phù hợp trong ngữ cảnh này trên tay bạn.`,
        actionAdvice: 'Nối nghĩa'
      };
    }

    // 2. Không có lá đồng nghĩa: nói thật
    // Kiểm tra xem có lá cùng từ không
    const sameWordCard = candidateCards.find(c => c.type === 'word' && c.entryId === state.activeEntryId);
    if (sameWordCard) {
      return {
        step: 2,
        foundSynonym: false,
        recommendedCardId: sameWordCard.id,
        hintText: `Không có lá đồng nghĩa mới, nhưng bạn có lá "${sameWordCard.label}" cùng từ (khác màu) có thể đánh được.`,
        actionAdvice: 'Cùng từ'
      };
    }

    // Kiểm tra lá cùng màu hoặc lá chức năng
    const playableOther = candidateCards.find(c => {
      const v = validatePlayCard(state, c.id, 'player');
      return v.valid;
    });

    if (playableOther) {
      return {
        step: 2,
        foundSynonym: false,
        recommendedCardId: playableOther.id,
        hintText: `Không có lá đồng nghĩa trên tay, nhưng bạn có lá "${playableOther.label}" hợp lệ (cùng màu hoặc chức năng).`,
        actionAdvice: 'Cùng màu/Chức năng'
      };
    }

    return {
      step: 2,
      foundSynonym: false,
      recommendedCardId: null,
      hintText: state.hasDrawnThisTurn
        ? 'Lá bài vừa rút không thể đánh được. Bạn hãy bấm "Giữ bài" để kết thúc lượt.'
        : 'Bạn không có lá bài nào hợp lệ trên tay. Hãy bấm "Rút 1 lá" từ chồng bài.',
      actionAdvice: state.hasDrawnThisTurn ? 'Giữ bài' : 'Rút bài'
    };
  }

  return {
    createRng: createRng,
    shuffle: shuffle,
    createInitialGameState: createInitialGameState,
    validatePlayCard: validatePlayCard,
    executePlayCard: executePlayCard,
    executeDrawCard: executeDrawCard,
    executePassTurn: executePassTurn,
    executePassWortKette: executePassWortKette,
    executeInvalidPenalty: executeInvalidPenalty,
    reshuffleDiscardPileIfNeeded: reshuffleDiscardPileIfNeeded,
    getHint: getHint,
    isSynonym: isSynonym,
    getAntonymMapping: getAntonymMapping,
    getContextSentence: getContextSentence,
    getDeckData: getDeckData,
    assertTotalCards: assertTotalCards,
    getHand: getHand,
    getPlayerName: getPlayerName,
    getNextPlayer: getNextPlayer
  };
});
