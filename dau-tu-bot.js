/**
 * DAU-TU-BOT.JS
 * Trí tuệ nhân tạo (Bot "VokabelBot") cho "Đấu từ — VokabelGo" v0.1.
 * Tuân thủ nghiêm ngặt nguyên tắc cách ly thông tin (Information Isolation):
 * Bot CHỈ nhận thông tin công khai trên bàn, số lá của đối thủ và bộ bài trên tay nó.
 * Tuyệt đối không gian lận đọc bài đối thủ hoặc thứ tự chồng rút.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const engine = require('./dau-tu-engine.js');
    const data = require('./dau-tu-data.js');
    module.exports = factory(engine, data);
  } else {
    root.DAU_TU_BOT = factory(root.DAU_TU_ENGINE, root.DAU_TU_DATA);
  }
})(typeof self !== 'undefined' ? self : this, function (DAU_TU_ENGINE, DAU_TU_DATA) {
  'use strict';

  /**
   * Tạo quan sát công khai tối thiểu để chuyển cho Bot
   */
  function buildPublicObservation(state) {
    return {
      deckId: state.deckId,
      activeColor: state.activeColor,
      activeEntryId: state.activeEntryId,
      activeContextId: state.activeContextId,
      physicalTopCard: state.physicalTopCard,
      hasDrawnThisTurn: state.hasDrawnThisTurn,
      drawnCardIdThisTurn: state.drawnCardIdThisTurn,
      playerCardCount: state.playerHand ? state.playerHand.length : 5,
      turnState: state.turnState,
      wortKetteActive: !!state.wortKetteActive,
      isWortKetteBonus: !!state.wortKetteActive
    };
  }

  /**
   * Lựa chọn màu có lợi nhất cho Bot (dùng khi đánh Farbenwahl)
   */
  function pickBestColorForBot(botHand) {
    const counts = { rot: 0, blau: 0, gruen: 0, gelb: 0 };
    botHand.forEach(card => {
      if (card.color && counts[card.color] !== undefined) {
        counts[card.color]++;
      }
    });

    let bestColor = 'rot';
    let maxCount = -1;
    DAU_TU_DATA.COLOR_KEYS.forEach(color => {
      if (counts[color] > maxCount) {
        maxCount = counts[color];
        bestColor = color;
      }
    });

    return bestColor;
  }

  /**
   * Quyết định nước đi của Bot
   * @param {Object} publicObs - Quan sát công khai
   * @param {Array} botHand - Các lá bài trên tay bot
   * @returns {Object} { action: 'play' | 'draw' | 'pass', cardId, chosenColor, meta }
   */
  function getBotDecision(publicObs, botHand) {
    // Tạo giả lập state tối thiểu để chạy bộ kiểm tra luật chung
    const mockState = {
      deckId: publicObs.deckId,
      activeColor: publicObs.activeColor,
      activeEntryId: publicObs.activeEntryId,
      activeContextId: publicObs.activeContextId,
      physicalTopCard: publicObs.physicalTopCard,
      turnState: publicObs.turnState,
      activePlayer: 'bot',
      playerHand: new Array(publicObs.playerCardCount), // Không có nội dung lá của player
      botHand: botHand,
      hasDrawnThisTurn: publicObs.hasDrawnThisTurn,
      drawnCardIdThisTurn: publicObs.drawnCardIdThisTurn,
      wortKetteActive: !!publicObs.wortKetteActive
    };

    // 1. Nếu đang trong trạng thái Wort-Kette bonus (+1 nước đi, không được rút):
    if (publicObs.isWortKetteBonus) {
      const validBonusMoves = [];
      botHand.forEach(card => {
        const val = DAU_TU_ENGINE.validatePlayCard(mockState, card.id, 'bot');
        if (val.valid) {
          validBonusMoves.push({ card, val });
        }
      });

      if (validBonusMoves.length === 0) {
        return {
          action: 'pass',
          cardId: null,
          chosenColor: null,
          meta: { reason: 'Không có lá hợp lệ trong lượt Wort-Kette, bỏ qua bonus' }
        };
      }

      // E1 Heuristic:
      // a) Đánh hết bài để thắng ngay lập tức
      if (botHand.length === 1) {
        const winMove = validBonusMoves[0];
        const chosenColor = winMove.val.requiresColorChoice ? pickBestColorForBot(botHand) : null;
        return {
          action: 'play',
          cardId: winMove.card.id,
          chosenColor: chosenColor,
          meta: { reason: 'Wort-Kette: Đánh lá cuối cùng để thắng ván!' }
        };
      }

      // b) Nếu đối thủ sắp hết bài (<= 2 lá), ưu tiên +2 hoặc Aussetzen
      if (publicObs.playerCardCount <= 2) {
        const plus2 = validBonusMoves.find(m => m.card.actionType === 'plus2');
        if (plus2) return { action: 'play', cardId: plus2.card.id, chosenColor: null, meta: { reason: 'Wort-Kette bonus: Chặn đối thủ bằng +2' } };
        const skip = validBonusMoves.find(m => m.card.actionType === 'aussetzen');
        if (skip) return { action: 'play', cardId: skip.card.id, chosenColor: null, meta: { reason: 'Wort-Kette bonus: Aussetzen bỏ lượt đối thủ' } };
      }

      // c) Ưu tiên lá chức năng nếu có lợi thế
      const special = validBonusMoves.find(m => m.card.actionType);
      if (special) {
        const chosenColor = special.val.requiresColorChoice ? pickBestColorForBot(botHand) : null;
        return { action: 'play', cardId: special.card.id, chosenColor, meta: { reason: 'Wort-Kette bonus: Đánh lá chức năng' } };
      }

      // d) Ưu tiên màu bot đang giữ nhiều nhất
      const bestColor = pickBestColorForBot(botHand);
      const bestColorMove = validBonusMoves.find(m => m.card.color === bestColor);
      if (bestColorMove) {
        return { action: 'play', cardId: bestColorMove.card.id, chosenColor: null, meta: { reason: 'Wort-Kette bonus: Đánh lá theo màu bot có nhiều' } };
      }

      // e) Nước đi hợp lệ thông thường
      const defMove = validBonusMoves[0];
      const chosenColor = defMove.val.requiresColorChoice ? pickBestColorForBot(botHand) : null;
      return { action: 'play', cardId: defMove.card.id, chosenColor, meta: { reason: 'Wort-Kette bonus: Đánh lá hợp lệ' } };
    }

    // 2. Nếu Bot vừa rút bài trong lượt này:
    if (publicObs.hasDrawnThisTurn && publicObs.drawnCardIdThisTurn) {
      const drawnCard = botHand.find(c => c.id === publicObs.drawnCardIdThisTurn);
      if (drawnCard) {
        const val = DAU_TU_ENGINE.validatePlayCard(mockState, drawnCard.id, 'bot');
        if (val.valid) {
          const chosenColor = val.requiresColorChoice ? pickBestColorForBot(botHand) : null;
          return {
            action: 'play',
            cardId: drawnCard.id,
            chosenColor: chosenColor,
            meta: { reason: 'Đánh ngay lá vừa rút' }
          };
        }
      }
      return {
        action: 'pass',
        cardId: null,
        chosenColor: null,
        meta: { reason: 'Lá vừa rút không hợp lệ, giữ bài' }
      };
    }

    // 3. Lượt đánh bình thường trước khi rút:
    const validMoves = [];
    botHand.forEach(card => {
      const val = DAU_TU_ENGINE.validatePlayCard(mockState, card.id, 'bot');
      if (val.valid) {
        validMoves.push({
          card: card,
          val: val
        });
      }
    });

    if (validMoves.length === 0) {
      return {
        action: 'draw',
        cardId: null,
        chosenColor: null,
        meta: { reason: 'Không có lá hợp lệ trên tay, rút bài' }
      };
    }

    // Phân loại và xếp thứ tự ưu tiên nước đi:
    // a) Nếu đối thủ sắp hết bài (<= 2 lá), ưu tiên hãm bằng +2 hoặc Aussetzen
    if (publicObs.playerCardCount <= 2) {
      const plus2Move = validMoves.find(m => m.card.actionType === 'plus2');
      if (plus2Move) {
        return {
          action: 'play',
          cardId: plus2Move.card.id,
          chosenColor: null,
          meta: { reason: 'Chặn đối thủ bằng lá +2' }
        };
      }
      const skipMove = validMoves.find(m => m.card.actionType === 'aussetzen');
      if (skipMove) {
        return {
          action: 'play',
          cardId: skipMove.card.id,
          chosenColor: null,
          meta: { reason: 'Bỏ lượt đối thủ bằng Aussetzen' }
        };
      }
    }

    // b) Ưu tiên giáo dục từ vựng: NỐI NGHĨA ĐỒNG NGHĨA
    const meaningMove = validMoves.find(m => m.val.isSynonym);
    if (meaningMove) {
      return {
        action: 'play',
        cardId: meaningMove.card.id,
        chosenColor: null,
        meta: { reason: 'Nối nghĩa đồng nghĩa' }
      };
    }

    // c) Lá chức năng GEGENTEIL (đổi nghĩa thú vị)
    const gegenteilMove = validMoves.find(m => m.card.actionType === 'gegenteil');
    if (gegenteilMove) {
      return {
        action: 'play',
        cardId: gegenteilMove.card.id,
        chosenColor: null,
        meta: { reason: 'Đổi nghĩa bằng GEGENTEIL!' }
      };
    }

    // d) Lá chức năng +2 hoặc Aussetzen thông thường
    const actionMove = validMoves.find(m => m.card.actionType === 'plus2' || m.card.actionType === 'aussetzen');
    if (actionMove) {
      return {
        action: 'play',
        cardId: actionMove.card.id,
        chosenColor: null,
        meta: { reason: 'Đánh lá chức năng' }
      };
    }

    // e) Đánh theo màu
    const colorMove = validMoves.find(m => m.card.type === 'word' && m.card.color === publicObs.activeColor);
    if (colorMove) {
      return {
        action: 'play',
        cardId: colorMove.card.id,
        chosenColor: null,
        meta: { reason: 'Đánh lá cùng màu' }
      };
    }

    // f) Cùng từ khác màu
    const sameWordMove = validMoves.find(m => m.card.type === 'word' && m.card.entryId === publicObs.activeEntryId);
    if (sameWordMove) {
      return {
        action: 'play',
        cardId: sameWordMove.card.id,
        chosenColor: null,
        meta: { reason: 'Đánh lá cùng từ khác màu' }
      };
    }

    // g) Đổi màu Farbenwahl (chọn màu bot có nhiều nhất)
    const wildMove = validMoves.find(m => m.card.actionType === 'farbenwahl');
    if (wildMove) {
      const bestColor = pickBestColorForBot(botHand);
      return {
        action: 'play',
        cardId: wildMove.card.id,
        chosenColor: bestColor,
        meta: { reason: 'Đánh Farbenwahl và đổi sang màu có lợi' }
      };
    }

    // Mặc định: đánh lá hợp lệ đầu tiên
    const defaultMove = validMoves[0];
    const defaultColor = defaultMove.val.requiresColorChoice ? pickBestColorForBot(botHand) : null;
    return {
      action: 'play',
      cardId: defaultMove.card.id,
      chosenColor: defaultColor,
      meta: { reason: 'Đánh lá hợp lệ' }
    };
  }

  return {
    buildPublicObservation: buildPublicObservation,
    getBotDecision: getBotDecision,
    pickBestColorForBot: pickBestColorForBot
  };
});
