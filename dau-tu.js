/* ==========================================================================
   VOKABELGO — ĐẤU TỪ v0.3
   4-Player Table Game Controller (1 Human + 3 Bots: Max, Lena, Mia)
   ========================================================================== */

(function () {
  'use strict';

  const D = window.DAU_TU_DATA;
  const E = window.DAU_TU_ENGINE;
  const B = window.DAU_TU_BOT;

  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const KEY = 'vokabelgo:dautu:preview:v3:';
  const symbols = { rot: '♥', blau: '●', gruen: '▲', gelb: '◆', neutral: '✦' };

  const actions = {
    aussetzen: { vi: 'Bỏ lượt', de: 'Aussetzen', icon: '⊘', detail: 'Bỏ qua lượt của người chơi tiếp theo theo chiều kim đồng hồ.' },
    plus2: { vi: 'Rút hai', de: 'Zieh Zwei', icon: '+2', detail: 'Người chơi tiếp theo phải rút 2 lá bài và mất lượt.' },
    farbenwahl: { vi: 'Đổi màu', de: 'Farbenwahl', icon: '◒', detail: 'Chọn 1 trong 4 màu cho bàn chơi rồi kết thúc lượt.' },
    gegenteil: { vi: 'Đảo nghĩa', de: 'GEGENTEIL!', icon: '⇄', detail: 'Đổi từ mục tiêu sang nghĩa trái ngược. Giữ nguyên màu hiện hành.' }
  };

  const BOT_SEATS = ['bot_left', 'bot_top', 'bot_right'];
  const SEAT_ORDER = ['player', 'bot_left', 'bot_top', 'bot_right'];

  // Game state
  let state = null;
  let deckId = 'adjektive';
  let mode = 'practice'; // 'practice' (Làm quen) | 'classic' (Ván thường)
  let selected = null;
  let botTimer = null;
  let epoch = 0;
  let muted = false;
  let audioCtx = null;
  let showTranslation = false;
  let hintId = null;
  let pendingCard = null;
  let feedback = 'Bạn đi trước. Chọn một lá để bắt đầu.';
  let feedbackTone = '';
  let learnedPairs = [];
  let gameLog = [];
  let isIntroPlaying = false;
  let isEffectRunning = false;
  let activeEffectTimeouts = [];

  function registerTimeout(fn, ms) {
    const t = setTimeout(() => {
      const idx = activeEffectTimeouts.indexOf(t);
      if (idx !== -1) activeEffectTimeouts.splice(idx, 1);
      fn();
    }, ms);
    activeEffectTimeouts.push(t);
    return t;
  }

  // Read preferences
  try {
    const savedDeck = localStorage.getItem(KEY + 'deck');
    if (['adjektive', 'verben', 'lexicon_expanded'].includes(savedDeck)) deckId = savedDeck;
    const savedMuted = localStorage.getItem(KEY + 'muted');
    muted = savedMuted === 'true';
  } catch (_) {}

  function savePref(k, v) {
    try { localStorage.setItem(KEY + k, v); } catch (_) {}
  }

  function currentData() {
    return E.getDeckData(state ? state.deckId : deckId);
  }

  function nameDeck(d = deckId) {
    if (d === 'lexicon_expanded') return 'Kho từ Mở rộng (OpenThesaurus)';
    return d === 'verben' ? 'Động từ' : 'Tính từ';
  }

  function colorLabel(c) {
    return D.COLORS[c]?.nameVi || 'Không màu';
  }

  function cardLabel(c) {
    if (!c) return '';
    return c.type === 'word' ? c.label : (actions[c.actionType]?.vi || c.label);
  }

  function isHumanTurn() {
    return !!state && state.turnState !== 'game_over' && state.activePlayer === 'player' && !isIntroPlaying && !isEffectRunning;
  }

  function clearTimers() {
    clearTimeout(botTimer);
    botTimer = null;
    activeEffectTimeouts.forEach(t => clearTimeout(t));
    activeEffectTimeouts = [];
    isEffectRunning = false;

    const layer = $('flying-cards-layer');
    if (layer) layer.innerHTML = '';
    document.querySelectorAll('.cut-skip-beam, .plus2-target-badge, .color-pulse-ripple, .win-particle').forEach(el => el.remove());
    document.querySelectorAll('.seat.skipped, .human-zone.skipped, .color-choice-btn.dimmed, .color-choice-btn.selected-pulse').forEach(el => {
      el.classList.remove('skipped', 'dimmed', 'selected-pulse');
    });
  }

  function cancelSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  /* --------------------------------------------------------------------------
     Web Audio API Procedural Sound Synthesizer (Section 13 Minimum Sound Map)
     -------------------------------------------------------------------------- */
  function playSound(kind = 'place') {
    if (muted) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const now = audioCtx.currentTime;

      if (kind === 'shuffle') {
        // Soft paper shuffle noise filter
        const bufferSize = audioCtx.sampleRate * 0.22;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        whiteNoise.start(now);
      } else if (kind === 'deal' || kind === 'draw') {
        // Quick card snap flick (80ms)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (kind === 'skip') {
        // Aussetzen: Soft whoosh/cut cue (180ms)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (kind === 'plus-two' || kind === 'plus2') {
        // Zieh Zwei (+2): Two distinct crisp paper flick snaps spaced 100ms apart
        [0, 0.10].forEach(delay => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + delay;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(460, t);
          osc.frequency.exponentialRampToValueAtTime(130, t + 0.075);
          gain.gain.setValueAtTime(0.07, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
        });
      } else if (kind === 'color-change' || kind === 'farbenwahl') {
        // Farbenwahl: Soft color-change dual resonant bells (300ms)
        [587.33, 880].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + i * 0.04;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.29);
        });
      } else if (kind === 'gegenteil') {
        // GEGENTEIL: Soft reverse/flip cue (ascending then descending sweep, 350ms)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(640, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (kind === 'wort-kette') {
        // WORT-KETTE: Bright cascading harmonic chime
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + i * 0.05;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.29);
        });
      } else if (kind === 'semantic-match' || kind === 'match') {
        // Bright pleasant harmonic chime (Pentatonic chord)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + i * 0.055;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.26);
        });
      } else if (kind === 'special') {
        // Double-tone fanfare
        [440, 659.25, 880].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + i * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.23);
        });
      } else if (kind === 'win') {
        // Triumphant chord (1.2s)
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + i * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.56);
        });
      } else if (kind === 'error') {
        // Low error thud
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } else {
        // Standard card placement thud ('normal-card-place' or 'place')
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    } catch (_) {}
  }

  function updateSoundUi() {
    $('btn-sound').textContent = muted ? '♪̸' : '♪';
    $('btn-sound').setAttribute('aria-label', muted ? 'Bật âm thanh' : 'Tắt âm thanh');
    $('btn-sound').setAttribute('aria-pressed', String(!muted));
  }

  /* --------------------------------------------------------------------------
     Card Component Rendering (v0.4 Full-Color Body + Inner Cream Plate)
     -------------------------------------------------------------------------- */
  function renderCardHtml(c, { isButton = false, isSelected = false, isHinted = false, isDisabled = false, isTarget = false } = {}) {
    if (!c) return '';
    const isWord = c.type === 'word';
    const act = actions[c.actionType];
    const text = isWord ? c.label : (act?.vi || c.label);
    const colorKey = c.color || 'neutral';
    const suitIcon = symbols[colorKey] || '✦';

    // Word length class for responsive font sizing without hyphens or breaking
    let wordSizeClass = '';
    if (isWord) {
      if (text.includes(' ')) {
        wordSizeClass = 'multi-word';
      } else if (text.length > 13) {
        wordSizeClass = 'extra-long-word';
      } else if (text.length > 10) {
        wordSizeClass = 'long-word';
      } else if (text.length > 8) {
        wordSizeClass = 'medium-word';
      }
    }

    const classes = [
      'word-card',
      colorKey,
      isTarget ? 'target-card-style' : '',
      isSelected ? 'selected' : '',
      isHinted ? 'hinted' : ''
    ].filter(Boolean).join(' ');

    const middle = isWord
      ? `<div class="card-inner-plate">
           <strong class="card-word ${wordSizeClass}" lang="de">${escapeHtml(text).replace(/^sich /, 'sich<br>')}</strong>
           <span class="card-type">${state?.deckId === 'verben' || c.partOfSpeech?.startsWith('Verb') ? 'Verb' : 'Adjektiv'}</span>
         </div>`
      : `<div class="card-inner-plate action-plate">
           <span class="action-icon" aria-hidden="true">${escapeHtml(act?.icon || '✦')}</span>
           <strong class="card-action-title">${escapeHtml(text)}</strong>
           <small class="card-german-name" lang="de">${escapeHtml(act?.de || '')}</small>
         </div>`;

    const inner = `
      <span class="card-corner corner-top-left" aria-hidden="true">${suitIcon}</span>
      <span class="card-corner corner-bottom-right" aria-hidden="true">${suitIcon}</span>
      ${middle}
      <span class="card-brand-subtle" aria-hidden="true">VokabelGo</span>
    `;

    if (isButton) {
      return `<button type="button" class="${classes}" data-card-id="${escapeHtml(c.id)}" aria-label="${escapeHtml(text)}, ${escapeHtml(colorLabel(c.color))}${isDisabled ? ', chưa được đánh' : ''}" aria-pressed="${isSelected}" ${isDisabled ? 'disabled' : ''}>${inner}</button>`;
    }
    return `<div class="${classes}" aria-label="${escapeHtml(text)}, ${escapeHtml(colorLabel(c.color))}">${inner}</div>`;
  }

  function sentenceHtml(sentence, entry) {
    if (!sentence) return '';
    const sentText = typeof sentence === 'string' ? sentence : (sentence.de || '');
    if (!sentText) return '';
    const tokens = new Set((sentence.highlightTokens || []).map(t => t.toLocaleLowerCase('de')));
    if (tokens.size === 0 && entry?.lemma) {
      tokens.add(entry.lemma.toLocaleLowerCase('de'));
    }
    return (sentText.match(/[\p{L}\p{M}]+|[^\p{L}\p{M}]+/gu) || []).map(token => {
      return tokens.has(token.toLocaleLowerCase('de')) ? `<mark>${escapeHtml(token)}</mark>` : escapeHtml(token);
    }).join('');
  }

  function targetEntry() {
    return state?.activeEntryId ? currentData().entries[state.activeEntryId] : null;
  }

  let gameToastTimer = null;
  function showGameToast(text, tone = 'info') {
    const toast = $('game-toast');
    if (!toast || !text) return;
    if (gameToastTimer) {
      clearTimeout(gameToastTimer);
      gameToastTimer = null;
    }
    toast.textContent = text;
    toast.dataset.tone = tone;
    toast.hidden = false;
    toast.classList.remove('fade-out');
    toast.classList.add('visible');

    gameToastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      toast.classList.add('fade-out');
      gameToastTimer = setTimeout(() => {
        toast.hidden = true;
        toast.classList.remove('fade-out');
        gameToastTimer = null;
      }, 350);
    }, 2200);
  }

  function setFeedback(text, tone = '') {
    feedback = text;
    feedbackTone = tone;
    const el = $('feedback');
    if (el) {
      el.textContent = text;
      el.dataset.tone = tone;
    }
  }

  /* --------------------------------------------------------------------------
     Flying Card Animation Helper
     -------------------------------------------------------------------------- */
  function flyCardAnimation(fromEl, toEl, callback, { duration = 280, isBack = true } = {}) {
    if (!fromEl || !toEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (callback) callback();
      return;
    }
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const layer = $('flying-cards-layer');
    if (!layer) {
      if (callback) callback();
      return;
    }

    const card = document.createElement('div');
    card.className = 'flying-card';
    if (!isBack) {
      card.style.background = '#FFFDF8';
    }
    card.style.transitionDuration = `${duration}ms`;
    card.style.transform = `translate3d(${fromRect.left}px, ${fromRect.top}px, 0)`;
    layer.appendChild(card);

    // Force reflow
    card.getBoundingClientRect();

    card.style.transform = `translate3d(${toRect.left}px, ${toRect.top}px, 0)`;

    let called = false;
    const onEnd = () => {
      if (called) return;
      called = true;
      card.removeEventListener('transitionend', onEnd);
      card.remove();
      if (callback) callback();
    };
    card.addEventListener('transitionend', onEnd);
    registerTimeout(onEnd, duration + 60);
  }

  /* --------------------------------------------------------------------------
     Special Card Effects & Visual Runners (v0.6 Game Feel Polish)
     -------------------------------------------------------------------------- */
  function getSeatElement(role) {
    if (!role) return null;
    if (role === 'player') return $('human-zone');
    return $(`seat-${role.replace('_', '-')}`);
  }

  function scheduleNextTurn(delay = 800) {
    render();
    if (!state || state.turnState === 'game_over') {
      handleGameOver();
      return;
    }
    if (state.activePlayer !== 'player') {
      scheduleBotTurn(delay);
    }
  }

  function runAussetzenEffect(skippedPlayer, onDone) {
    isEffectRunning = true;
    const targetSeatEl = getSeatElement(skippedPlayer);
    const skippedName = E.getPlayerName(state, skippedPlayer);
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Cut/Skip beam directed to target seat
    if (targetSeatEl && !isReduced) {
      const fromRect = $('target-card')?.getBoundingClientRect();
      const toRect = targetSeatEl.getBoundingClientRect();
      const layer = $('flying-cards-layer');

      if (fromRect && toRect && layer) {
        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        const toX = toRect.left + toRect.width / 2;
        const toY = toRect.top + toRect.height / 2;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        const beam = document.createElement('div');
        beam.className = 'cut-skip-beam';
        beam.style.left = `${fromX}px`;
        beam.style.top = `${fromY}px`;
        beam.style.width = `${dist}px`;
        beam.style.transform = `rotate(${angle}deg)`;
        layer.appendChild(beam);
        registerTimeout(() => beam.remove(), 450);
      }
    }

    // 2. Target seat dims and shows skip icon
    if (targetSeatEl) {
      targetSeatEl.classList.add('skipped');
      const skipBadge = targetSeatEl.querySelector('.seat-skip-badge');
      if (skipBadge) {
        skipBadge.hidden = false;
        registerTimeout(() => { skipBadge.hidden = true; }, 600);
      }
    }

    playSound('skip');
    showGameToast(`${skippedName} bị bỏ lượt.`, 'info');
    setFeedback(`${skippedName} bị bỏ lượt!`, 'error');

    registerTimeout(() => {
      if (targetSeatEl) targetSeatEl.classList.remove('skipped');
      isEffectRunning = false;
      if (onDone) onDone();
    }, isReduced ? 250 : 550);
  }

  function runPlus2Effect(victimPlayer, drawnCount, onDone) {
    isEffectRunning = true;
    const victimSeatEl = getSeatElement(victimPlayer);
    const victimName = E.getPlayerName(state, victimPlayer);
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Floating badge +2 near target seat
    if (victimSeatEl) {
      const badge = document.createElement('div');
      badge.className = 'plus2-target-badge';
      badge.textContent = `+${drawnCount}`;
      victimSeatEl.style.position = 'relative';
      victimSeatEl.appendChild(badge);
      registerTimeout(() => badge.remove(), 900);
    }

    playSound('plus-two');
    showGameToast(`${victimName} rút ${drawnCount} lá và mất lượt!`, 'error');
    setFeedback(`${victimName} rút ${drawnCount} lá và mất lượt!`, 'error');

    if (isReduced || !victimSeatEl) {
      registerTimeout(() => {
        isEffectRunning = false;
        if (onDone) onDone();
      }, 350);
      return;
    }

    // 2. Two card backs physically fly from draw pile to victim seat
    const drawEl = $('draw-pile-group');
    flyCardAnimation(drawEl, victimSeatEl, () => {
      playSound('draw');
    }, { duration: 260 });

    if (drawnCount > 1) {
      registerTimeout(() => {
        flyCardAnimation(drawEl, victimSeatEl, () => {
          playSound('draw');
        }, { duration: 260 });
      }, 100);
    }

    registerTimeout(() => {
      isEffectRunning = false;
      if (onDone) onDone();
    }, 720);
  }

  function runFarbenwahlHumanEffect(chosenColor, onDone) {
    isEffectRunning = true;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buttons = document.querySelectorAll('.color-choice-btn');

    buttons.forEach(btn => {
      if (btn.dataset.color === chosenColor) {
        btn.classList.add('selected-pulse');
      } else {
        btn.classList.add('dimmed');
      }
    });

    playSound('color-change');
    showGameToast(`Bạn đổi màu → ${colorLabel(chosenColor)}`, 'success');
    setFeedback(`Bạn đã đổi màu sang ${colorLabel(chosenColor)}.`, 'success');

    registerTimeout(() => {
      $('inline-color-selector').hidden = true;
      buttons.forEach(btn => btn.classList.remove('selected-pulse', 'dimmed'));
      isEffectRunning = false;
      if (onDone) onDone();
    }, isReduced ? 150 : 380);
  }

  function runFarbenwahlBotEffect(botRole, chosenColor, onDone) {
    isEffectRunning = true;
    const botName = E.getPlayerName(state, botRole);
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isReduced) {
      const ripple = document.createElement('div');
      ripple.className = 'color-pulse-ripple';
      ripple.style.color = D.COLORS[chosenColor]?.hex || '#FFF';
      $('discard-pile-group').appendChild(ripple);
      registerTimeout(() => ripple.remove(), 450);
    }

    playSound('color-change');
    showGameToast(`${botName} đổi màu → ${colorLabel(chosenColor)}`, 'info');
    setFeedback(`${botName} đã đổi màu sang ${colorLabel(chosenColor)}.`, 'info');

    registerTimeout(() => {
      isEffectRunning = false;
      if (onDone) onDone();
    }, isReduced ? 150 : 380);
  }

  function runGegenteilEffect(beforeEntry, afterEntry, beforeSent, afterSent, whoName, onDone) {
    isEffectRunning = true;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fromWord = beforeEntry?.lemma || '';
    const toWord = afterEntry?.lemma || '';

    // Center transition on target-card
    const targetCardEl = $('target-card');
    if (targetCardEl) {
      targetCardEl.innerHTML = `
        <div class="word-card ${state?.activeColor || 'rot'} target-card-style">
          <span class="card-corner corner-top-left" aria-hidden="true">${symbols[state?.activeColor] || '✦'}</span>
          <span class="card-corner corner-bottom-right" aria-hidden="true">${symbols[state?.activeColor] || '✦'}</span>
          <div class="card-inner-plate">
            <div class="gegenteil-word-transition">
              <span class="from-word" lang="de">${escapeHtml(fromWord)}</span>
              <span class="swap-arrow" aria-hidden="true">⇄</span>
              <span class="to-word" lang="de">${escapeHtml(toWord)}</span>
            </div>
            <span class="card-type">${state?.deckId === 'verben' ? 'Verb' : 'Adjektiv'}</span>
          </div>
          <span class="card-brand-subtle" aria-hidden="true">VokabelGo</span>
        </div>
      `;
    }

    // Crossfade sentence
    const sentContainer = $('table-sentence-card');
    if (sentContainer) {
      sentContainer.querySelector('.sentence-content')?.classList.add('sentence-crossfade');
      $('sentence').innerHTML = sentenceHtml(afterSent, afterEntry);
      registerTimeout(() => {
        sentContainer.querySelector('.sentence-content')?.classList.remove('sentence-crossfade');
      }, 650);
    }

    $('flip-badge').hidden = false;
    playSound('gegenteil');
    showGameToast(`${whoName} đảo nghĩa: “${fromWord}” ⇄ “${toWord}”`, 'success');
    setFeedback(`${whoName} đảo nghĩa: “${fromWord}” ⇄ “${toWord}” (Giữ màu ${colorLabel(state?.activeColor)})`, 'success');

    registerTimeout(() => {
      isEffectRunning = false;
      if (onDone) onDone();
    }, isReduced ? 250 : 800);
  }

  function runWortKetteEffect(fromWord, toWord, whoName, isHuman, onDone) {
    const banner = $('wort-kette-banner');
    const wordsEl = $('wort-kette-words');
    if (banner && wordsEl) {
      wordsEl.textContent = `${(fromWord || '').toUpperCase()} ↔ ${(toWord || '').toUpperCase()}`;
      banner.hidden = false;
      registerTimeout(() => {
        if (banner) banner.hidden = true;
      }, 1100);
    }

    if (isHuman) {
      const handEl = $('hand');
      if (handEl) {
        handEl.classList.remove('wort-kette-pulse');
        void handEl.offsetWidth;
        handEl.classList.add('wort-kette-pulse');
        registerTimeout(() => handEl.classList.remove('wort-kette-pulse'), 700);
      }
    }

    playSound('wort-kette');
    const text = `${whoName}: “${fromWord}” ↔ “${toWord}” · WORT-KETTE (+1 nước)!`;
    setFeedback(text, 'success');
    showGameToast(text, 'success');

    registerTimeout(() => {
      if (onDone) onDone();
    }, 650);
  }

  function runWinCelebration(winnerRole) {
    playSound('win');
    if (winnerRole === 'player') {
      const hz = $('human-zone');
      if (hz && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899'];
        for (let i = 0; i < 12; i++) {
          const p = document.createElement('div');
          p.className = 'win-particle';
          p.style.backgroundColor = colors[i % colors.length];
          p.style.left = `${30 + Math.random() * 40}%`;
          p.style.bottom = `${20 + Math.random() * 40}px`;
          p.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
          p.style.setProperty('--dy', `${-(60 + Math.random() * 120)}px`);
          p.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
          p.style.animationDelay = `${Math.random() * 0.3}s`;
          hz.appendChild(p);
          registerTimeout(() => p.remove(), 1500);
        }
      }
    }
  }

  function applyCardPlayPostEffects(res, beforeState, playedCard, playerRole, chosenColor) {
    const whoName = E.getPlayerName(state, playerRole);

    if (res.wortKette) {
      runWortKetteEffect(res.relation?.from || '', res.relation?.to || '', whoName, playerRole === 'player', () => {
        render();
        if (playerRole === 'player') {
          const hasAny = state.playerHand.some(c => E.validatePlayCard(state, c.id, 'player').valid);
          if (!hasAny) {
            registerTimeout(() => {
              if (state && state.wortKetteActive && state.activePlayer === 'player') {
                const passText = 'Không còn lá phù hợp — Wort-Kette kết thúc.';
                setFeedback(passText);
                showGameToast(passText, 'info');
                E.executePassWortKette(state, 'player');
                scheduleNextTurn(800);
              }
            }, 1000);
          }
        } else {
          scheduleBotTurn(800);
        }
      });
      return;
    }

    if (playedCard.actionType === 'aussetzen') {
      runAussetzenEffect(res.skippedPlayer, () => {
        scheduleNextTurn(800);
      });
      return;
    }

    if (playedCard.actionType === 'plus2') {
      runPlus2Effect(res.victim, res.drawnCount, () => {
        scheduleNextTurn(800);
      });
      return;
    }

    if (playedCard.actionType === 'farbenwahl') {
      if (playerRole !== 'player') {
        runFarbenwahlBotEffect(playerRole, chosenColor, () => {
          scheduleNextTurn(800);
        });
        return;
      } else {
        scheduleNextTurn(800);
        return;
      }
    }

    if (playedCard.actionType === 'gegenteil') {
      const beforeEntry = beforeState.activeEntryId ? E.getDeckData(beforeState.deckId).entries[beforeState.activeEntryId] : null;
      const afterEntry = state.activeEntryId ? E.getDeckData(state.deckId).entries[state.activeEntryId] : null;
      const beforeSent = E.getContextSentence(beforeState.deckId, beforeState.activeContextId, beforeState.activeEntryId);
      const afterSent = E.getContextSentence(state.deckId, state.activeContextId, state.activeEntryId);
      runGegenteilEffect(beforeEntry, afterEntry, beforeSent, afterSent, whoName, () => {
        scheduleNextTurn(800);
      });
      return;
    }

    // Normal word card
    const act = state.lastAction;
    if (act.type === 'word' && (act.matchType === 'meaning' || act.matchType === 'both')) {
      const oldLemma = beforeState.activeEntryId ? E.getDeckData(beforeState.deckId).entries[beforeState.activeEntryId]?.lemma : '';
      const text = `${whoName}: ${oldLemma} → ${playedCard.label} · Nối nghĩa ✓`;
      setFeedback(text, 'success');
      showGameToast(text, 'success');
      showMatchTag();
      playSound('semantic-match');
      if (playerRole === 'player') {
        learnedPairs.push({ from: oldLemma, to: playedCard.label });
      }
    } else {
      const text = `${whoName} → ${playedCard.label} · ${act.matchType === 'same_word' ? 'Cùng từ' : 'Cùng màu'}`;
      setFeedback(text);
      showGameToast(text, 'info');
      playSound('normal-card-place');
    }
    scheduleNextTurn(800);
  }

  /* --------------------------------------------------------------------------
     Render Table State
     -------------------------------------------------------------------------- */
  function render() {
    if (!state) return;
    const humanTurn = isHumanTurn();
    const done = state.turnState === 'game_over';
    const entry = targetEntry();
    const color = colorLabel(state.activeColor);

    // 1. Render Bot Seats (Lena, Max, Mia)
    const botCounts = {
      'bot_top': { count: $('bot-top-count'), cards: $('bot-top-cards'), status: $('bot-top-status'), skip: $('bot-top-skip'), seat: $('seat-bot-top'), nochEine: $('bot-top-noch-eine') },
      'bot_left': { count: $('bot-left-count'), cards: $('bot-left-cards'), status: $('bot-left-status'), skip: $('bot-left-skip'), seat: $('seat-bot-left'), nochEine: $('bot-left-noch-eine') },
      'bot_right': { count: $('bot-right-count'), cards: $('bot-right-cards'), status: $('bot-right-status'), skip: $('bot-right-skip'), seat: $('seat-bot-right'), nochEine: $('bot-right-noch-eine') }
    };

    BOT_SEATS.forEach(seatKey => {
      const hand = E.getHand(state, seatKey) || [];
      const ui = botCounts[seatKey];
      if (ui.count) ui.count.textContent = `${hand.length} lá`;
      if (ui.cards) {
        ui.cards.innerHTML = '<div class="card-mini-back"></div>'.repeat(Math.min(hand.length, 7));
      }
      const isActive = state.activePlayer === seatKey && !done;
      const isWinner = done && state.winner === seatKey;
      if (ui.seat) {
        ui.seat.classList.toggle('active', isActive);
        ui.seat.classList.toggle('winner', isWinner);
      }
      if (ui.status) {
        ui.status.hidden = !isActive && !isWinner;
        const name = E.getPlayerName(state, seatKey);
        ui.status.textContent = isWinner ? `👑 ${name} Thắng!` : `${name} …`;
      }
      if (ui.nochEine) {
        ui.nochEine.hidden = hand.length !== 1 || done;
      }
    });

    // 2. Turn Ring Orientation
    const ring = $('turn-ring');
    if (ring) {
      ring.className = 'turn-ring';
      if (!done) {
        if (state.activePlayer === 'bot_top') ring.classList.add('active-top');
        else if (state.activePlayer === 'bot_right') ring.classList.add('active-right');
        else if (state.activePlayer === 'player') ring.classList.add('active-bottom');
        else if (state.activePlayer === 'bot_left') ring.classList.add('active-left');
      }
    }

    // 3. Center Draw Pile
    $('draw-count-badge').textContent = state.drawPile.length;

    // 4. Center Discard Pile (Effective target - lớn hơn bài trên tay)
    const effectiveTarget = entry
      ? { id: 'effective-target', type: 'word', color: state.activeColor, label: entry.lemma, entryId: entry.entryId, partOfSpeech: entry.partOfSpeech }
      : state.physicalTopCard;
    $('target-card').innerHTML = renderCardHtml(effectiveTarget, { isTarget: true });

    const isFlipped = state.physicalTopCard.actionType === 'gegenteil' && !!entry;
    $('flip-badge').hidden = !isFlipped;

    // 5. Center Target Word & Sentence Plate
    const chip = $('color-badge');
    if (chip) {
      chip.className = `target-color-chip ${state.activeColor}`;
      chip.innerHTML = `<span aria-hidden="true">${symbols[state.activeColor] || '✦'}</span>`;
    }

    const wordTitle = $('target-word-title');
    if (wordTitle) {
      wordTitle.textContent = entry ? entry.lemma : (effectiveTarget.label || '');
    }

    const sent = E.getContextSentence(state.deckId, state.activeContextId, state.activeEntryId);
    $('sentence').innerHTML = sent
      ? sentenceHtml(sent)
      : (state.physicalTopCard.actionType === 'farbenwahl'
        ? 'Màu đã đổi. Tiếp tục theo màu mới.'
        : state.physicalTopCard.actionType === 'plus2'
          ? 'Đã rút phạt +2. Tiếp tục theo màu hoặc +2.'
          : 'Đã bỏ lượt. Tiếp tục theo màu hoặc Bỏ lượt.');
    $('sentence').lang = sent ? 'de' : 'vi';

    $('translation').textContent = sent?.vi || '';
    $('translation').hidden = !sent || !showTranslation;
    $('btn-translate').hidden = !sent;
    $('btn-translate').textContent = showTranslation ? 'Ẩn nghĩa' : 'Nghĩa';
    $('btn-hint').disabled = !humanTurn;

    // 6. Human Zone Status & Feedback
    $('player-count').textContent = `${state.playerHand.length} lá`;
    $('one-card').hidden = state.playerHand.length !== 1 || done;

    const gm = $('game-mode');
    if (gm) {
      gm.textContent = `${mode === 'practice' ? 'Làm quen' : 'Ván thường'} · ${state.deckId === 'adjektive' ? 'Tính từ' : 'Động từ'}`;
    }
    const bc = $('bot-count');
    if (bc) {
      const topCount = state.hands?.bot_top?.length ?? (state.botHand?.length ?? 5);
      bc.textContent = `${topCount} lá`;
    }

    const humanZone = $('human-zone');
    const isHumanWinner = done && state.winner === 'player';
    if (humanZone) {
      humanZone.classList.toggle('active', humanTurn && !done);
      humanZone.classList.toggle('winner', isHumanWinner);
    }

    $('turn-label').textContent = done
      ? (isHumanWinner ? '🎉 Bạn đã thắng!' : `${E.getPlayerName(state, state.winner)} đã thắng`)
      : humanTurn
        ? 'Lượt của bạn'
        : `${E.getPlayerName(state, state.activePlayer)} đang đi…`;
    $('turn-status-indicator').classList.toggle('active', humanTurn && !done);

    const feedbackEl = $('feedback');
    feedbackEl.textContent = feedback;
    feedbackEl.dataset.tone = feedbackTone;

    // 7. Human Hand Rendering (Luôn ở cạnh dưới, vững vàng từ 1 đến 12 lá)
    const handEl = $('hand');
    const prevScroll = handEl.scrollLeft;
    handEl.innerHTML = state.playerHand.map(c => {
      const isCardSelected = c.id === selected;
      const isCardHinted = c.id === hintId;
      const isDisabled = done || (humanTurn && state.hasDrawnThisTurn && c.id !== state.drawnCardIdThisTurn);
      return renderCardHtml(c, {
        isButton: true,
        isSelected: isCardSelected,
        isHinted: isCardHinted,
        isDisabled: isDisabled
      });
    }).join('');
    handEl.scrollLeft = prevScroll;

    // 8. Contextual Action Dock
    const chosenCard = state.playerHand.find(c => c.id === selected);
    const playBtn = $('btn-play');
    const drawBtn = $('btn-draw');
    const infoBtn = $('btn-info');
    const passBtn = $('btn-pass');
    const dockEl = $('contextual-action-dock');

    if (dockEl) {
      dockEl.classList.toggle('wort-kette-mode', !!state.wortKetteActive);
    }

    if (done) {
      drawBtn.hidden = true;
      playBtn.hidden = true;
      infoBtn.hidden = true;
      passBtn.hidden = true;
      $('selection-title').textContent = 'Ván đấu đã kết thúc';
    } else if (state.wortKetteActive && humanTurn) {
      drawBtn.hidden = true;
      passBtn.hidden = false;
      passBtn.textContent = 'Kết thúc lượt';

      const hasAnyLegal = state.playerHand.some(c => E.validatePlayCard(state, c.id, 'player').valid);

      if (!chosenCard) {
        $('selection-title').textContent = hasAnyLegal
          ? 'WORT-KETTE · +1 nước (Chọn thêm 1 lá)'
          : 'Không còn lá phù hợp — Wort-Kette kết thúc.';
        infoBtn.hidden = true;
        playBtn.disabled = true;
        playBtn.textContent = 'Đánh lá';
      } else {
        $('selection-title').textContent = cardLabel(chosenCard);
        infoBtn.hidden = false;

        const validation = E.validatePlayCard(state, chosenCard.id, 'player');
        const actionUnavailable = chosenCard.actionType === 'gegenteil' && !validation.valid;

        playBtn.disabled = !validation.valid || actionUnavailable;
        playBtn.textContent = chosenCard.actionType === 'farbenwahl'
          ? 'Chọn màu →'
          : chosenCard.actionType === 'gegenteil'
            ? 'Đảo nghĩa →'
            : `Đánh “${cardLabel(chosenCard)}”`;
      }
    } else {
      drawBtn.hidden = humanTurn && state.hasDrawnThisTurn;
      drawBtn.disabled = !humanTurn;
      passBtn.hidden = !humanTurn || !state.hasDrawnThisTurn;
      passBtn.textContent = 'Giữ lá · Hết lượt';

      if (!chosenCard) {
        $('selection-title').textContent = humanTurn ? 'Chọn một lá trên tay' : 'Đang chờ đối thủ…';
        infoBtn.hidden = true;
        playBtn.disabled = true;
        playBtn.textContent = 'Đánh lá';
      } else {
        $('selection-title').textContent = cardLabel(chosenCard);
        infoBtn.hidden = false;

        const validation = humanTurn ? E.validatePlayCard(state, chosenCard.id, 'player') : null;
        const actionUnavailable = chosenCard.actionType === 'gegenteil' && validation && !validation.valid;

        playBtn.disabled = !humanTurn || actionUnavailable || !validation?.valid || !!(state.hasDrawnThisTurn && chosenCard.id !== state.drawnCardIdThisTurn);
        playBtn.textContent = chosenCard.actionType === 'farbenwahl'
          ? 'Chọn màu →'
          : chosenCard.actionType === 'gegenteil'
            ? 'Đảo nghĩa →'
            : `Đánh “${cardLabel(chosenCard)}”`;
      }
    }

    $('scroll-left').hidden = $('scroll-right').hidden = handEl.scrollWidth <= handEl.clientWidth + 2;
  }

  /* --------------------------------------------------------------------------
     Start Game & Intro Animation Sequence
     -------------------------------------------------------------------------- */
  function startGame(deck = deckId, options = {}) {
    epoch++;
    clearTimers();
    cancelSpeech();
    closePanel(false);

    deckId = deck;
    savePref('deck', deckId);

    // Bàn 4 người (playerCount = 4), kích hoạt Vocabulary Rotation
    state = E.createInitialGameState(deck, options.seed, mode === 'practice' ? 'player' : undefined, 4, {
      dynamicRotation: true,
      ...options
    });

    selected = null;
    hintId = null;
    showTranslation = false;
    learnedPairs = [];
    gameLog = [];

    // Cập nhật thẻ trạng thái vòng lặp từ vựng ở header
    const rotTag = $('match-rotation-tag');
    if (rotTag) {
      if (state.matchReport) {
        const hist = DAU_TU_DATA.getVocabularyHistory ? DAU_TU_DATA.getVocabularyHistory() : null;
        const matchNum = hist ? hist.matches.length : 1;
        const consec = state.matchReport.overlapConsecutivePercent || '0%';
        rotTag.textContent = `Ván #${matchNum} · 12 từ (${consec} trùng)`;
        rotTag.hidden = false;
        rotTag.title = `Cụm từ vựng: ${state.matchReport.selectedClusters.map(c => c.nameVi).join(' + ')}`;
      } else {
        rotTag.hidden = true;
      }
    }

    $('setup').hidden = true;
    $('gallery').hidden = true;
    $('game').hidden = false;
    $('btn-exit').hidden = false;
    $('inline-color-selector').hidden = true;

    setFeedback(state.activePlayer === 'player'
      ? (mode === 'practice' ? 'Làm quen: Bạn đi trước. Chọn sai được thử lại.' : 'Bạn đi trước. Đánh hết bài để thắng!')
      : `${E.getPlayerName(state, state.activePlayer)} đi trước. Hãy theo dõi lượt.`
    );

    // Chạy Intro Animation (Xào & Chia bài)
    runIntroSequence(() => {
      render();
      if (state.activePlayer !== 'player') {
        scheduleBotTurn(800);
      }
    });
  }

  function savePref(k, v) {
    try {
      localStorage.setItem('vokabelgo:dautu:preview:v3:' + k, v);
      localStorage.setItem('vokabelgo:dautu:preview:v2:' + k, v);
    } catch (_) {}
  }

  function runIntroSequence(onDone) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('qa') === '1') {
      const introEl = $('intro-overlay');
      if (introEl) introEl.hidden = true;
      isIntroPlaying = false;
      onDone();
      return;
    }

    isIntroPlaying = true;
    const introEl = $('intro-overlay');
    introEl.hidden = false;
    playSound('shuffle');

    const finishIntro = () => {
      if (!isIntroPlaying) return;
      isIntroPlaying = false;
      introEl.hidden = true;
      playSound('deal');
      onDone();
    };

    $('btn-skip-intro').onclick = finishIntro;
    setTimeout(finishIntro, 1800);
  }

  function exitGame() {
    epoch++;
    clearTimers();
    cancelSpeech();
    closePanel(false);
    state = null;
    selected = null;
    const rotTag = $('match-rotation-tag');
    if (rotTag) rotTag.hidden = true;
    $('game').hidden = true;
    $('gallery').hidden = true;
    $('setup').hidden = false;
    $('btn-exit').hidden = true;
    $('inline-color-selector').hidden = true;
    updateSetupUi();
  }

  /* --------------------------------------------------------------------------
     Bot Execution Rhythm
     -------------------------------------------------------------------------- */
  function scheduleBotTurn(delay = 800) {
    clearTimers();
    if (!state || state.turnState === 'game_over' || state.activePlayer === 'player' || $('panel').open || document.hidden || isIntroPlaying) {
      return;
    }

    const currentEpoch = epoch;
    const currentGame = state;
    botTimer = setTimeout(() => {
      botTimer = null;
      if (currentEpoch !== epoch || currentGame !== state || $('panel').open || state.activePlayer === 'player' || state.turnState === 'game_over') {
        return;
      }
      runBotTurn();
    }, delay);
  }

  function runBotTurn() {
    if (!state || state.activePlayer === 'player' || state.turnState === 'game_over') return;
    const botRole = state.activePlayer;
    const botName = E.getPlayerName(state, botRole);
    const hand = E.getHand(state, botRole);

    try {
      const decision = B.getBotDecision(B.buildPublicObservation(state), hand, botRole);
      const botSeatEl = $(`seat-${botRole.replace('_', '-')}`);

      if (decision.action === 'play') {
        const playedCard = hand.find(c => c.id === decision.cardId);
        // Animate flying card from bot seat to discard pile
        flyCardAnimation(botSeatEl, $('target-card'), () => {
          const beforeState = { ...state };
          const res = E.executePlayCard(state, decision.cardId, botRole, decision.chosenColor);
          applyCardPlayPostEffects(res, beforeState, playedCard, botRole, decision.chosenColor);
        });
      } else if (decision.action === 'draw') {
        // Animate flying card from draw pile to bot seat
        flyCardAnimation($('draw-pile-group'), botSeatEl, () => {
          const res = E.executeDrawCard(state, botRole);
          if (res.success) {
            playSound('draw');
            const text = `${botName} đã rút 1 lá bài.`;
            setFeedback(text);
            showGameToast(text, 'info');
          } else {
            const text = res.reason || `${botName} kết thúc lượt.`;
            setFeedback(text);
            showGameToast(text, 'info');
          }
          render();
          if (state.turnState === 'game_over') {
            handleGameOver();
          } else {
            scheduleBotTurn(800);
          }
        });
      } else {
        if (state.wortKetteActive) {
          E.executePassWortKette(state, botRole);
          const text = `${botName} bỏ qua bonus và kết thúc lượt Wort-Kette.`;
          setFeedback(text);
          showGameToast(text, 'info');
        } else {
          E.executePassTurn(state, botRole);
          const text = `${botName} giữ lá và chuyển lượt.`;
          setFeedback(text);
          showGameToast(text, 'info');
        }
        render();
        scheduleBotTurn(700);
      }
    } catch (err) {
      clearTimers();
      setFeedback(`Lỗi lượt máy: ${err.message}`, 'error');
      render();
    }
  }

  /* --------------------------------------------------------------------------
     Action Feedback & Sound
     -------------------------------------------------------------------------- */
  function handleActionFeedback(before) {
    const act = state.lastAction;
    const who = E.getPlayerName(state, act.player);

    if (act.type === 'word') {
      if (act.matchType === 'meaning' || act.matchType === 'both') {
        const oldLemma = before.activeEntryId ? E.getDeckData(before.deckId).entries[before.activeEntryId]?.lemma : '';
        const text = `${who}: ${oldLemma} → ${act.card.label} · Nối nghĩa ✓`;
        setFeedback(text, 'success');
        showGameToast(text, 'success');
        showMatchTag();
        playSound('match');
        if (act.player === 'player') {
          learnedPairs.push({ from: oldLemma, to: act.card.label });
        }
      } else {
        const text = `${who} → ${act.card.label} · ${act.matchType === 'same_word' ? 'Cùng từ' : 'Cùng màu'}`;
        setFeedback(text);
        showGameToast(text, 'info');
        playSound('place');
      }
    } else if (act.type === 'plus2') {
      const victim = E.getPlayerName(state, act.victim);
      const text = `${who} đánh +2! ${victim} rút 2 lá và mất lượt!`;
      setFeedback(text, 'error');
      showGameToast(text, 'error');
      playSound('special');
    } else if (act.type === 'aussetzen') {
      const skipped = E.getPlayerName(state, act.skippedPlayer);
      const text = `${who} đánh Bỏ lượt! Bỏ qua lượt của ${skipped}!`;
      setFeedback(text, 'error');
      showGameToast(text, 'error');
      playSound('special');
    } else if (act.type === 'gegenteil') {
      const target = targetEntry();
      const text = `${who} đảo nghĩa: “${target ? target.lemma : ''}” (${colorLabel(state.activeColor)})`;
      setFeedback(text, 'success');
      showGameToast(text, 'success');
      playSound('special');
    } else if (act.type === 'farbenwahl') {
      const text = `${who} đổi màu → ${colorLabel(state.activeColor)}`;
      setFeedback(text, 'success');
      showGameToast(text, 'success');
      playSound('special');
    }

    gameLog.push({ turn: state.turnCount, player: act.player, type: act.type, text: feedback });
  }

  function showMatchTag() {
    const tag = $('match-feedback-tag');
    if (!tag) return;
    tag.hidden = false;
    setTimeout(() => { tag.hidden = true; }, 900);
  }

  function triggerWortKetteVisual(fromWord, toWord) {
    const banner = $('wort-kette-banner');
    const wordsEl = $('wort-kette-words');
    if (banner && wordsEl) {
      wordsEl.textContent = `${(fromWord || '').toUpperCase()} ↔ ${(toWord || '').toUpperCase()}`;
      banner.hidden = false;
      setTimeout(() => {
        if (banner) banner.hidden = true;
      }, 1200);
    }
    const handEl = $('hand');
    if (handEl) {
      handEl.classList.remove('wort-kette-pulse');
      void handEl.offsetWidth;
      handEl.classList.add('wort-kette-pulse');
      setTimeout(() => {
        handEl.classList.remove('wort-kette-pulse');
      }, 700);
    }
  }

  /* --------------------------------------------------------------------------
     Human Moves (Play, Draw, Pass)
     -------------------------------------------------------------------------- */
  function commitHumanPlay(cardId, color) {
    if (!isHumanTurn()) return;
    const card = state.playerHand.find(c => c.id === cardId);
    if (!card) return;

    const val = E.validatePlayCard(state, card.id, 'player', color);
    if (!val.valid || val.requiresColorChoice) {
      if (val.requiresColorChoice) return;

      // Xử lý đánh sai luật
      if (mode === 'practice') {
        // Chế độ làm quen: Micro-shake lá bài, giải thích, cho chọn lại, KHÔNG phạt
        state.currentTurnUsedHelp = true;
        const target = targetEntry();
        const reason = target
          ? `‘${card.label}’ không cùng màu và không cùng nghĩa với ‘${target.lemma}’ trong câu này. Bạn được chọn lại.`
          : `Lá này chưa khớp màu hoặc biểu tượng. Bạn được chọn lại.`;
        setFeedback(reason, 'error');
        playSound('error');

        // Shake selected card
        const cardEl = $(`hand`).querySelector(`[data-card-id="${card.id}"]`);
        if (cardEl) {
          cardEl.classList.add('shake');
          setTimeout(() => { cardEl.classList.remove('shake'); }, 400);
        }
        return;
      }

      // Ván thường: Phạt rút 1 lá và mất lượt
      E.executeInvalidPenalty(state, 'player', card.id, val.reason);
      selected = null;
      setFeedback('Đánh sai luật! Bị phạt rút 1 lá và hết lượt.', 'error');
      playSound('error');
      render();
      scheduleBotTurn(1200);
      return;
    }

    // Nước đi hợp lệ -> Animate card from hand to discard pile
    const cardEl = $(`hand`).querySelector(`[data-card-id="${card.id}"]`);
    flyCardAnimation(cardEl, $('target-card'), () => {
      const beforeState = { ...state };
      try {
        const res = E.executePlayCard(state, card.id, 'player', color);
        selected = null;
        $('inline-color-selector').hidden = true;
        applyCardPlayPostEffects(res, beforeState, card, 'player', color);
      } catch (err) {
        setFeedback(`Chưa đánh được: ${err.message}`, 'error');
        render();
      }
    });
  }

  function handleHumanPlayBtnClick() {
    if (!isHumanTurn() || !selected || $('panel').open || isEffectRunning) return;
    const card = state.playerHand.find(c => c.id === selected);
    if (!card) return;

    if (card.actionType === 'farbenwahl') {
      // Mở bộ chọn màu inline ngay trên bàn đấu
      pendingCard = card.id;
      $('inline-color-selector').hidden = false;
      document.querySelectorAll('.color-choice-btn').forEach(b => b.classList.remove('dimmed', 'selected-pulse'));
    } else if (card.actionType === 'gegenteil') {
      const val = E.validatePlayCard(state, card.id, 'player');
      if (!val.valid) {
        setFeedback(val.reason, 'error');
        playSound('error');
        return;
      }
      commitHumanPlay(card.id);
    } else {
      commitHumanPlay(card.id);
    }
  }

  function handleHumanDraw() {
    if (!isHumanTurn() || state.hasDrawnThisTurn || state.wortKetteActive || $('panel').open) return;
    flyCardAnimation($('draw-pile-group'), $('hand'), () => {
      const res = E.executeDrawCard(state, 'player');
      if (!res.success) {
        setFeedback(res.reason, 'error');
        render();
        if (res.gameOver) handleGameOver();
        else if (res.passed) scheduleBotTurn();
        return;
      }
      playSound('draw');
      selected = res.drawnCard.id;
      const text = `Vừa rút “${cardLabel(res.drawnCard)}”.`;
      setFeedback(`Vừa rút “${cardLabel(res.drawnCard)}”. Bạn có thể đánh lá này hoặc chọn Giữ bài để hết lượt.`);
      showGameToast(text, 'info');
      render();
    });
  }

  function handleHumanPass() {
    if (!isHumanTurn() || $('panel').open) return;
    if (state.wortKetteActive) {
      E.executePassWortKette(state, 'player');
      selected = null;
      setFeedback('Bạn đã kết thúc lượt Wort-Kette.');
      showGameToast('Bạn đã kết thúc lượt Wort-Kette.', 'info');
      render();
      scheduleBotTurn(800);
      return;
    }
    if (!state.hasDrawnThisTurn) return;
    E.executePassTurn(state, 'player');
    selected = null;
    setFeedback('Bạn đã giữ bài và kết thúc lượt.');
    showGameToast('Bạn đã giữ bài và kết thúc lượt.', 'info');
    render();
    scheduleBotTurn(800);
  }

  /* --------------------------------------------------------------------------
     Two-Step Hint System
     -------------------------------------------------------------------------- */
  function openHint() {
    if (!isHumanTurn()) return;
    state.currentTurnUsedHelp = true;
    const h = E.getHint(state, 1);
    const sent = E.getContextSentence(state.deckId, state.activeContextId, state.activeEntryId);

    openPanel('hint', 'Gợi ý nghĩa ngữ cảnh', `
      ${sent ? `<p lang="de" style="font-size:1.1rem; font-weight:700;">${sentenceHtml(sent)}</p>` : ''}
      <p style="margin: 0.6rem 0;">${escapeHtml(h.hintText)}</p>
      <p style="font-size: 0.8rem; color: var(--ink-muted);">Gợi ý chưa chỉ đáp án. Thử quan sát lại bài trên tay bạn.</p>
      <button class="primary" data-cmd="close">Để mình tự thử</button>
      <button class="secondary" data-cmd="hint2">Vẫn bí · Chỉ một lá phù hợp</button>
    `);
  }

  function openHintStep2() {
    if (!isHumanTurn()) return;
    state.currentTurnUsedCardHint = true;
    const h = E.getHint(state, 2);
    hintId = h.recommendedCardId || null;
    const matching = hintId && state.playerHand.find(c => c.id === hintId);
    if (matching) selected = hintId;

    closePanel(false);
    setFeedback(h.hintText, matching ? 'success' : '');
    playSound('match');
    render();
  }

  /* --------------------------------------------------------------------------
     Inspector & Rules Modals
     -------------------------------------------------------------------------- */
  function openWordInspector() {
    const card = state?.playerHand.find(c => c.id === selected);
    if (!card) return;

    if (card.type === 'action') {
      const act = actions[card.actionType];
      openPanel('info', act.vi, `
        <p style="font-size: 1.1rem; font-weight: 800; color: var(--felt-green);" lang="de">${escapeHtml(act.de)} · ${escapeHtml(colorLabel(card.color))}</p>
        <p>${escapeHtml(act.detail)}</p>
        <button class="primary" data-cmd="close">Về bàn chơi</button>
      `);
      return;
    }

    const entry = currentData().entries[card.entryId];
    state.currentTurnUsedHelp = true;
    openPanel('info', 'Chi tiết lá từ', `
      <p style="font-size: 1.35rem; font-weight: 800; color: var(--felt-green);" lang="de">${escapeHtml(entry.lemma)}</p>
      <p style="font-size: 0.82rem; color: var(--ink-muted); margin-bottom: 0.5rem;">${escapeHtml(entry.partOfSpeech)} · Màu ${escapeHtml(colorLabel(card.color))}</p>
      <div style="background:#F8FAFC; border: 1px solid #E2E8F0; padding: 0.75rem; border-radius: 8px;">
        <strong>Nghĩa:</strong> <span style="color: var(--felt-green); font-weight: 700;">${escapeHtml(entry.senseVi)}</span>
      </div>
      <div id="speech-area" style="margin-top: 0.6rem;"></div>
      <button class="primary" data-cmd="close">Về bàn chơi</button>
    `);

    if ('speechSynthesis' in window) {
      $('speech-area').innerHTML = `<button class="secondary" data-cmd="speak" data-word="${escapeHtml(entry.lemma)}">🔊 Nghe phát âm</button>`;
    }
  }

  function openRulesDialog() {
    const practice = mode === 'practice';
    openPanel('rules', 'Luật chơi bàn 4 người', `
      <div style="display:flex; flex-direction:column; gap:0.6rem;">
        <p><b>01 · Mục tiêu:</b> Đánh hết bài trên tay trước cả 3 đối thủ để chiến thắng.</p>
        <p><b>02 · Nước đi:</b> Đánh lá <b>cùng màu</b>, <b>cùng từ</b> hoặc <b>cùng nghĩa trong câu</b>.</p>
        <p><b>03 · Hướng lượt:</b> Luân phiên theo chiều kim đồng hồ (Bạn → Max → Lena → Mia → Bạn).</p>
        <p><b>04 · Lá chức năng:</b></p>
        <ul style="padding-left: 1.25rem; font-size: 0.88rem; line-height: 1.45;">
          <li><b>⊘ Aussetzen (Bỏ lượt):</b> Bỏ qua lượt của đối thủ tiếp theo.</li>
          <li><b>+2 Zieh Zwei:</b> Đối thủ tiếp theo rút 2 lá và mất lượt.</li>
          <li><b>◒ Farbenwahl:</b> Chọn màu mới cho bàn chơi.</li>
          <li><b>⇄ GEGENTEIL:</b> Đổi từ hiện tại sang từ trái nghĩa, giữ nguyên màu.</li>
        </ul>
        <p><b>05 · WORT-KETTE:</b> Đánh lá <b>khác màu nhưng đồng nghĩa</b> mà không dùng gợi ý giúp nhận ngay <b>+1 lượt đánh thưởng</b>!</p>
        <p><b>06 · Xoay vòng từ vựng (Match Diversity):</b> Mỗi ván đấu tự động chọn 3 cụm ngữ nghĩa mới (12 từ). Hai ván liên tiếp đạt 0% từ lặp lại. Từ cũ chỉ quay lại sau khi đã qua thời gian hồi ngắt quãng (spaced review).</p>
        <p style="font-size: 0.82rem; color: var(--ink-muted); margin-top: 0.4rem;">
          <b>${practice ? 'Làm quen:' : 'Ván thường:'}</b> ${practice ? 'Bạn đi trước. Chọn sai được thử lại không bị rút phạt.' : 'Đánh sai bị phạt rút 1 lá và mất lượt.'}
        </p>
      </div>
      <button class="primary" data-cmd="close">Hiểu rồi · Về bàn chơi</button>
    `);
  }

  function handleGameOver() {
    clearTimers();
    cancelSpeech();
    render();
    const humanWon = state.winner === 'player';
    runWinCelebration(state.winner);

    const winnerName = E.getPlayerName(state, state.winner);
    registerTimeout(() => {
      openPanel('result', humanWon ? 'BẠN THẮNG 🎉' : `${winnerName.toUpperCase()} THẮNG 👑`, `
        <p style="font-size: 1rem; font-weight: 600; color: var(--ink-primary); margin-bottom: 0.5rem;">
          ${humanWon ? 'Bạn đã đánh hết bài trước cả 3 đối thủ Max, Lena và Mia!' : `${winnerName} đã đánh hết bài trước. Bạn còn ${state.playerHand.length} lá.`}
        </p>
        <div class="result-stats">
          <div class="result-stat-box"><div class="result-stat-num">${state.turnCount}</div><div class="result-stat-label">Tổng lượt</div></div>
          <div class="result-stat-box"><div class="result-stat-num">${learnedPairs.length}</div><div class="result-stat-label">Nối nghĩa</div></div>
          <div class="result-stat-box"><div class="result-stat-num">${state.helpStats ? state.helpStats.viewedCardHintMoves : 0}</div><div class="result-stat-label">Dùng gợi ý</div></div>
        </div>
        <button class="primary" data-cmd="again">Chơi lại bộ ${nameDeck(state.deckId)}</button>
        <button class="secondary" data-cmd="exit">Đổi bộ khác</button>
      `);
    }, humanWon ? 1200 : 900);
  }

  function openPanel(kind, title, html) {
    clearTimers();
    $('panel-title').textContent = title;
    $('panel-body').innerHTML = html;
    if (!$('panel').open) $('panel').showModal();
    $('panel-close').focus();
  }

  function closePanel(resume = true) {
    if ($('panel').open) $('panel').close();
    if (resume && state && state.activePlayer !== 'player') {
      scheduleBotTurn(800);
    }
  }

  function updateSetupUi() {
    ['adjektive', 'verben', 'lexicon_expanded'].forEach(d => {
      const el = $('deck-' + (d === 'lexicon_expanded' ? 'lexicon-expanded' : d));
      if (el) {
        el.classList.toggle('selected', d === deckId);
        el.setAttribute('aria-pressed', String(d === deckId));
      }
    });
    ['practice', 'classic'].forEach(m => {
      const el = $('mode-' + m);
      el.classList.toggle('selected', m === mode);
      el.setAttribute('aria-pressed', String(m === mode));
    });
    $('btn-start').innerHTML = `Chơi bàn 4 người bộ ${nameDeck()} <span aria-hidden="true">→</span>`;
    document.querySelector('.setup-note').textContent = `${mode === 'practice' ? 'Làm quen: Bạn đi trước.' : 'Ván thường: Chọn ngẫu nhiên bên đi trước.'} Đọc từ theo ngữ cảnh để ghi nhớ lâu hơn.`;

    const statusText = $('rotation-status-text');
    if (statusText) {
      const hist = DAU_TU_DATA.getVocabularyHistory ? DAU_TU_DATA.getVocabularyHistory() : null;
      if (hist && hist.matches.length > 0) {
        statusText.textContent = `Đã chơi ${hist.matches.length} ván · Đã gặp ${Object.keys(hist.entries).length} từ — ván sau ưu tiên từ mới`;
      } else {
        statusText.textContent = `12 từ mới đang chờ cho ván đầu tiên`;
      }
    }
  }

  function openGallery() {
    $('setup').hidden = true;
    $('game').hidden = true;
    $('gallery').hidden = false;

    const allAdj = D.createDeckPhysicalCards('adjektive');
    const allVerbs = D.createDeckPhysicalCards('verben');
    const items = [
      allAdj.find(c => c.entryId === 'schwierig' && c.color === 'rot'),
      allAdj.find(c => c.entryId === 'einfach' && c.color === 'blau'),
      allAdj.find(c => c.entryId === 'teuer' && c.color === 'gelb'),
      allAdj.find(c => c.entryId === 'ruhig' && c.color === 'gruen'),
      allVerbs.find(c => c.entryId === 'schließen' && c.color === 'blau') || allVerbs.find(c => c.label === 'schließen'),
      allVerbs.find(c => c.label === 'sich beeilen')
    ];
    Object.keys(actions).forEach(act => {
      items.push(allAdj.find(c => c.actionType === act));
    });

    $('gallery-cards').innerHTML = items.filter(Boolean).map((c, i) => `
      <figure>
        ${renderCardHtml(c)}
        <figcaption>${i + 1}. ${escapeHtml(cardLabel(c))}</figcaption>
      </figure>
    `).join('') + `
      <figure>
        <div class="word-card card-back">
          <span class="mountain" aria-hidden="true">▲</span>
          <b>VokabelGo</b>
          <small>ĐẤU TỪ</small>
        </div>
        <figcaption>Mặt sau chung</figcaption>
      </figure>
    `;
  }

  /* --------------------------------------------------------------------------
     Event Listeners & Delegation
     -------------------------------------------------------------------------- */
  // Chạm/Click lá bài trên tay (Click lần 1: chọn, Click lần 2 cùng lá: đánh)
  $('hand').addEventListener('click', e => {
    const cardEl = e.target.closest('[data-card-id]');
    if (!cardEl || cardEl.disabled || !state || state.turnState === 'game_over' || isEffectRunning) return;
    const cardId = cardEl.dataset.cardId;
    if (selected === cardId) {
      handleHumanPlayBtnClick();
      return;
    }
    selected = cardId;
    render();
  });

  // Action buttons
  $('btn-play').onclick = handleHumanPlayBtnClick;
  $('btn-draw').onclick = handleHumanDraw;
  $('btn-pass').onclick = handleHumanPass;
  $('btn-info').onclick = openWordInspector;
  $('btn-hint').onclick = openHint;
  $('btn-rules').onclick = openRulesDialog;

  $('btn-translate').onclick = () => {
    if (!state) return;
    showTranslation = !showTranslation;
    if (showTranslation) state.currentTurnUsedHelp = true;
    render();
  };

  $('draw-pile-group').onclick = () => {
    if (isHumanTurn() && !state.hasDrawnThisTurn) handleHumanDraw();
  };

  // Inline Farbenwahl selection
  $('inline-color-selector').addEventListener('click', e => {
    const btn = e.target.closest('button[data-color]');
    if (!btn || !pendingCard || isEffectRunning) return;
    const chosenColor = btn.dataset.color;
    const cardId = pendingCard;
    pendingCard = null;
    runFarbenwahlHumanEffect(chosenColor, () => {
      commitHumanPlay(cardId, chosenColor);
    });
  });

  // Setup options
  $('deck-adjektive').onclick = () => { deckId = 'adjektive'; updateSetupUi(); };
  $('deck-verben').onclick = () => { deckId = 'verben'; updateSetupUi(); };
  if ($('deck-lexicon-expanded')) {
    $('deck-lexicon-expanded').onclick = () => { deckId = 'lexicon_expanded'; updateSetupUi(); };
  }
  $('mode-practice').onclick = () => { mode = 'practice'; updateSetupUi(); };
  $('mode-classic').onclick = () => { mode = 'classic'; updateSetupUi(); };
  $('btn-start').onclick = () => startGame();

  // Header sound, exit, navigation
  $('btn-sound').onclick = () => {
    muted = !muted;
    savePref('muted', String(muted));
    if (!muted) playSound('match');
    updateSoundUi();
  };

  $('btn-exit').onclick = () => {
    if (state?.turnState === 'game_over') {
      exitGame();
      return;
    }
    openPanel('exit', 'Rời ván này?', `
      <p>Ván đấu 4 người hiện tại sẽ kết thúc. Bạn sẽ quay về màn hình chọn bộ từ.</p>
      <button class="primary" data-cmd="close">Tiếp tục chơi</button>
      <button class="secondary" data-cmd="exit">Rời ván · Về chọn bộ</button>
    `);
  };

  // Dialog actions
  $('panel-close').onclick = () => closePanel();
  $('panel').addEventListener('cancel', e => { e.preventDefault(); closePanel(); });
  $('panel').addEventListener('click', e => {
    if (e.target === $('panel')) closePanel();
  });

  $('panel-body').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    switch (btn.dataset.cmd) {
      case 'close': closePanel(); break;
      case 'hint2': openHintStep2(); break;
      case 'exit': exitGame(); break;
      case 'again': startGame(); break;
      case 'speak': {
        const word = btn.dataset.word;
        if (word && 'speechSynthesis' in window) {
          cancelSpeech();
          const utter = new SpeechSynthesisUtterance(word);
          utter.lang = 'de-DE';
          window.speechSynthesis.speak(utter);
        }
        break;
      }
    }
  });

  // Hand scroll buttons
  $('scroll-left').onclick = () => $('hand').scrollBy({ left: -200, behavior: 'smooth' });
  $('scroll-right').onclick = () => $('hand').scrollBy({ left: 200, behavior: 'smooth' });

  // Visibility & Page events
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimers();
    else scheduleBotTurn(600);
  });

  document.querySelector('.brand').onclick = e => {
    e.preventDefault();
    if (state) $('btn-exit').click();
    else exitGame();
  };

  document.querySelector('.sample-link').onclick = e => {
    e.preventDefault();
    openGallery();
  };

  document.querySelector('#gallery>a').onclick = e => {
    e.preventDefault();
    exitGame();
  };

  const btnResetVocab = $('btn-reset-vocab-history');
  if (btnResetVocab) {
    btnResetVocab.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      const hist = DAU_TU_DATA.getVocabularyHistory ? DAU_TU_DATA.getVocabularyHistory() : null;
      if (hist) {
        hist.resetHistory();
        updateSetupUi();
      }
    };
  }

  // Initial render
  updateSetupUi();
  updateSoundUi();
  if (new URLSearchParams(location.search).get('view') === 'cards') openGallery();

  /* --------------------------------------------------------------------------
     QA Automation Hook (Opt-in via ?qa=1)
     -------------------------------------------------------------------------- */
  if (window.__DT_QA__ === true || new URLSearchParams(location.search).get('qa') === '1') {
    window.DAUTU_PREVIEW_QA = {
      getState: () => state,
      load: s => {
        clearTimers();
        epoch++;
        closePanel(false);
        state = s;
        deckId = s.deckId;
        selected = null;
        hintId = null;
        isIntroPlaying = false;
        const introEl = $('intro-overlay');
        if (introEl) introEl.hidden = true;
        $('setup').hidden = true;
        $('game').hidden = false;
        $('btn-exit').hidden = false;
        $('inline-color-selector').hidden = true;
        setFeedback('Tình huống kiểm thử tái lập.');
        render();
      },
      start: (d, seed) => startGame(d, { seed }),
      setMode: m => { mode = m; updateSetupUi(); },
      render,
      runBot: runBotTurn,
      scheduleBot: scheduleBotTurn,
      pause: clearTimers,
      exit: exitGame,
      gallery: openGallery,
      finish: handleGameOver,
      sentenceHtml,
      getLog: () => ({ gameLog, learnedPairs }),
      getSelected: () => selected,
      fixtureChosen: id => { selected = id; render(); },
      pickColor: color => {
        if (pendingCard) commitHumanPlay(pendingCard, color);
      },
      playCard: (cardId, color) => commitHumanPlay(cardId, color),
      drawCard: handleHumanDraw,
      passTurn: handleHumanPass,
      passWortKette: handleHumanPass,
      getMetrics: () => state?.metrics || (E.getMetrics ? E.getMetrics(state) : null),
      triggerWortKetteVisual: triggerWortKetteVisual,
      triggerAussetzenVisual: (skippedSeat) => runAussetzenEffect(skippedSeat, () => render()),
      triggerPlus2Visual: (victimSeat, count) => runPlus2Effect(victimSeat, count, () => render()),
      triggerGegenteilVisual: (beforeEntry, afterEntry, beforeSent, afterSent, who) => runGegenteilEffect(beforeEntry, afterEntry, beforeSent, afterSent, who, () => render()),
      triggerFarbenwahlVisual: (color) => runFarbenwahlHumanEffect(color, () => render()),
      showFarbenwahlSelector: () => {
        pendingCard = 'test_card';
        $('inline-color-selector').hidden = false;
        document.querySelectorAll('.color-choice-btn').forEach(b => b.classList.remove('dimmed', 'selected-pulse'));
      },
      triggerWinVisual: (winner) => runWinCelebration(winner),
      playSound: playSound
    };
  }
})();
