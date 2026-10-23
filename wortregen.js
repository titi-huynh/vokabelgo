/**
 * Wortregen — short guided rounds and a two-card arcade challenge.
 */

(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Vocabulary Dataset Integration (Phase 2)
  // Hardcoded WORD_POOL has been completely removed in production.
  // WortregenVocabularyProvider connects real VokabelGo repository via allCards()
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // 2. Sound Effects Engine (Web Audio API Synthesizer)
  // ---------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      } catch (e) {
        // Headless audio fallback
      }
    }

    setMuted(muted) {
      this.muted = muted;
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    playCorrect(combo = 0) {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Pitch shifts up as combo increases
        const baseFreq = combo >= 3 ? 659.25 : 523.25; // E5 or C5
        const secondFreq = combo >= 3 ? 987.77 : 783.99; // B5 or G5

        // Note 1
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, now);

        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        // Note 2 (slightly delayed harmony)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(secondFreq, now + 0.08);

        gain2.gain.setValueAtTime(0.001, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.35);
      } catch (e) {
        // Audio error fail-safe
      }
    }

    playMiss() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Downward soft slide
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {
        // Audio error fail-safe
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Normalization Helper
  // ---------------------------------------------------------------------------
  function normalizeAnswer(text) {
    if (!text) return '';
    return String(text)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  // ---------------------------------------------------------------------------
  // 4. Wortregen Game Engine
  // ---------------------------------------------------------------------------
  class WortregenGame {
    constructor(options = {}) {
      // DOM Elements
      this.appEl = document.getElementById('wortregen-app');
      this.fallingArea = document.getElementById('falling-area');
      this.keyboardCapture = document.getElementById('keyboard-capture');
      this.hudLives = document.getElementById('hud-lives');
      this.hudScore = document.getElementById('hud-score-val');
      this.hudCombo = document.getElementById('hud-combo');
      this.btnMute = document.getElementById('btn-mute');
      this.soundIconOn = document.getElementById('icon-sound-on');
      this.soundIconOff = document.getElementById('icon-sound-off');

      // Screens
      this.startScreen = document.getElementById('start-screen');
      this.gameOverScreen = document.getElementById('game-over-screen');
      this.btnStart = document.getElementById('btn-start');
      this.btnReplay = document.getElementById('btn-replay');
      this.btnBackToStudy = document.getElementById('btn-back-to-study');
      this.btnGameOverBack = document.getElementById('btn-gameover-back');

      // Summary Elements
      this.summaryScore = document.getElementById('summary-score');
      this.summarySolved = document.getElementById('summary-solved');
      this.summaryMissed = document.getElementById('summary-missed');
      this.summaryCombo = document.getElementById('summary-combo');

      // Vocabulary Provider (Phase 2)
      this.vocabProvider = options.vocabProvider || 
        (typeof window !== 'undefined' && window.WortregenVocabularyProvider ? new window.WortregenVocabularyProvider(options) : null);
      if (!this.vocabProvider && typeof WortregenVocabularyProvider !== 'undefined') {
        this.vocabProvider = new WortregenVocabularyProvider(options);
      }

      // Audio
      this.sound = new SoundEngine();

      // State
      this.state = 'IDLE'; // IDLE, PLAYING, PAUSED, REVIEW, GAME_OVER
      this.lives = 3;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.solvedCount = 0;
      this.missedCount = 0;

      // Mechanics & FIFO Queue
      this.activeWords = [];
      this.wordIdCounter = 1;
      this.availableWords = [];
      this.baseSpeed = 40;
      this.maxConcurrent = 2; // Strict 2 cards maximum: 1 target, 1 waiting
      this.spawnTimer = null;
      this.animFrameId = null;
      this.lastFrameTime = 0;
      this.lastProcessed = { char: '', time: 0, source: '' };

      this.mode = 'practice';
      this.pendingTimers = new Set();
      this.sessionGoal = 8;
      this.spawnedCount = 0;
      this.resolvedCount = 0;
      this.assistedCount = 0;
      this.reviewItems = new Map();
      this.reviewQueue = null;
      this.setupExperience();

      this.initEvents();
    }

    // Shared UI for the standalone page and the embedded study mode.
    setupExperience() {
      if (!this.appEl) return;
      this.startScreen.querySelector('.overlay-instruction').textContent = 'Hứng mưa từ, gom một ván vui!';
      this.startScreen.querySelector('.overlay-tip').textContent = 'Gõ cả từ tiếng Đức, kể cả mạo từ. Tự bỏ qua dấu cách, không cần Enter. Chữ đầu bên cạnh thẻ là gợi ý, em vẫn cần gõ chữ đó.';
      if (!document.getElementById('wr-mode-options')) {
        const choices = document.createElement('div');
        choices.id = 'wr-mode-options';
        choices.className = 'wr-mode-options';
        choices.setAttribute('role', 'group');
        choices.setAttribute('aria-label', 'Chọn cách chơi');
        choices.innerHTML = '<button type="button" class="wr-mode" data-wr-mode="practice" aria-pressed="true"><strong>🌱 Luyện nhẹ</strong><span>1 thẻ · 8 từ · không mất tim</span></button><button type="button" class="wr-mode" data-wr-mode="challenge" aria-pressed="false"><strong>⚡ Thử thách</strong><span>2 thẻ · 3 tim · săn combo</span></button>';
        const deckLabel = document.createElement('label');
        deckLabel.className = 'wr-deck-label';
        deckLabel.htmlFor = 'wr-deck';
        deckLabel.textContent = 'Bộ từ muốn luyện';
        const deckSelect = document.createElement('select');
        deckSelect.id = 'wr-deck';
        deckSelect.className = 'wr-deck-select';
        let decks = [];
        try { decks = [...new Set(this.vocabProvider.getAllCards().map(card => card.deck).filter(Boolean))]; } catch (_) { /* Start shows the actionable data error. */ }
        deckSelect.append(new Option('Tất cả bộ từ', ''));
        decks.forEach(deck => deckSelect.append(new Option(deck, deck)));
        const selected = document.getElementById('deckSelect')?.value;
        deckSelect.value = decks.includes(selected) ? selected : decks[0] || '';
        this.btnStart.before(deckLabel, deckSelect, choices);

        const progress = document.createElement('div');
        progress.className = 'wr-progress';
        progress.innerHTML = '<div class="wr-progress-caption"><span id="wr-round-label">🌱 Luyện nhẹ · 8 từ</span><span id="wr-progress-count">0/8</span></div><div id="wr-progress-bar" class="wr-progress-bar" role="progressbar" aria-label="Tiến độ ván luyện" aria-valuemin="0" aria-valuemax="8" aria-valuenow="0"><span id="wr-progress-fill"></span></div>';
        this.appEl.querySelector('.wortregen-header').after(progress);

        const controls = document.createElement('div');
        controls.className = 'wr-controls';
        controls.innerHTML = '<p id="wr-feedback" role="status" aria-live="polite">Chọn cách chơi rồi bắt đầu nhé.</p><label class="wr-input-label" for="keyboard-capture">⌨ Gõ vào thẻ đang sáng</label><div class="wr-input-row"></div><div class="wr-tools"><div class="wr-letter-keys" role="group" aria-label="Ký tự tiếng Đức"><button type="button" data-wr-char="ä" aria-label="Nhập ä">ä</button><button type="button" data-wr-char="ö" aria-label="Nhập ö">ö</button><button type="button" data-wr-char="ü" aria-label="Nhập ü">ü</button><button type="button" data-wr-char="ß" aria-label="Nhập ß">ß</button></div><button type="button" id="wr-hint">💡 Gợi ý</button><button type="button" id="wr-pause">Ⅱ Tạm dừng</button></div>';
        controls.querySelector('.wr-input-row').append(this.keyboardCapture);
        this.keyboardCapture.removeAttribute('aria-hidden');
        this.keyboardCapture.removeAttribute('tabindex');
        this.keyboardCapture.setAttribute('aria-label', 'Gõ đáp án tiếng Đức');
        this.keyboardCapture.placeholder = 'Chạm vào đây để gõ…';
        this.appEl.querySelector('.game-board').append(controls);

        const interlude = document.createElement('div');
        interlude.id = 'wr-interlude';
        interlude.className = 'wr-interlude hidden';
        interlude.setAttribute('role', 'dialog');
        interlude.setAttribute('aria-modal', 'true');
        interlude.setAttribute('aria-labelledby', 'wr-interlude-title');
        interlude.innerHTML = '<div class="wr-interlude-card"><span id="wr-interlude-icon" aria-hidden="true">🌿</span><h2 id="wr-interlude-title"></h2><p id="wr-review-vi"></p><strong id="wr-review-de" lang="de"></strong><p id="wr-interlude-note"></p><button type="button" id="wr-retry-word" class="btn-primary">Thử lại từ này</button><button type="button" id="wr-continue" class="btn-secondary">Tiếp tục</button></div>';
        this.appEl.querySelector('.game-board').append(interlude);

        const summary = document.createElement('div');
        summary.className = 'wr-summary-review';
        summary.innerHTML = '<p id="wr-summary-note"></p><ul id="wr-review-list"></ul><button type="button" id="wr-review-round" class="btn-secondary hidden">Luyện lại từ cần ôn</button>';
        this.gameOverScreen.querySelector('.game-over-actions').before(summary);
        const chooseMode = document.createElement('button');
        chooseMode.id = 'wr-choose-mode';
        chooseMode.type = 'button';
        chooseMode.className = 'btn-secondary';
        chooseMode.textContent = 'Đổi bộ từ / cách chơi';
        this.btnGameOverBack.before(chooseMode);
      }
      this.feedback = document.getElementById('wr-feedback');
      this.interlude = document.getElementById('wr-interlude');
      this.appEl.querySelector('.wr-controls').inert = true;
      this.updateModeUI();
      this.renderHUD();
    }

    updateModeUI() {
      const practice = this.mode === 'practice';
      this.appEl.dataset.wrMode = this.mode;
      this.appEl.querySelectorAll('button[data-wr-mode]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.wrMode === this.mode));
      });
      this.btnStart.querySelector('span').textContent = practice ? 'Bắt đầu ván nhẹ 🌧️' : 'Vào thử thách ⚡';
      document.getElementById('wr-hint').classList.toggle('hidden', !practice);
      this.appEl.querySelector('.ground-threshold').textContent = practice ? 'Chạm đất? Mình cùng ôn lại nhé' : 'Vùng chạm đất';
      this.renderProgress();
    }

    renderProgress() {
      const practice = this.mode === 'practice';
      document.getElementById('wr-round-label').textContent = practice ? '🌱 Luyện nhẹ · từng từ một' : '⚡ Thử thách · gõ thẻ đang sáng';
      document.getElementById('wr-progress-count').textContent = practice ? `${this.resolvedCount}/${this.sessionGoal}` : `${this.solvedCount} từ hoàn thành`;
      const bar = document.getElementById('wr-progress-bar');
      bar.hidden = !practice;
      bar.setAttribute('aria-valuemax', String(practice ? this.sessionGoal : 8));
      bar.setAttribute('aria-valuenow', String(practice ? this.resolvedCount : 0));
      document.getElementById('wr-progress-fill').style.width = `${Math.min(100, this.resolvedCount / this.sessionGoal * 100)}%`;
    }

    announce(message, tone = '') {
      this.feedback.textContent = message;
      this.feedback.dataset.tone = tone;
    }

    defer(callback, delay) {
      const id = setTimeout(() => {
        this.pendingTimers.delete(id);
        callback();
      }, delay);
      this.pendingTimers.add(id);
      return id;
    }

    rememberForReview(word) {
      this.reviewItems.set(String(word.cardId || word.de), { ...word.source });
    }

    resumeLoops() {
      if (this.mode === 'practice' && this.resolvedCount >= this.sessionGoal) {
        this.gameOver(true);
        return;
      }
      this.state = 'PLAYING';
      this.appEl.querySelector('.wr-controls').inert = false;
      this.interlude.classList.add('hidden');
      this.lastFrameTime = performance.now();
      this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
      this.scheduleSpawn(350);
      this.focusKeyboard();
    }

    pauseGame() {
      if (this.state !== 'PLAYING') return;
      if (this.lives <= 0) { this.gameOver(); return; }
      this.state = 'PAUSED';
      this.cleanup();
      this.fallingArea.querySelectorAll('.word-popped, .word-missed, .floating-feedback').forEach(el => el.remove());
      this.activeWords = this.activeWords.filter(word => {
        word.innerEl.classList.remove('shake-error');
        if (!word.isGrounded) return true;
        word.el.remove();
        return false;
      });
      this.showInterlude('Nghỉ một nhịp nhé', '', '', 'Thẻ đã dừng. Điểm và phần đang gõ vẫn ở đây.', false);
    }

    showInterlude(title, vi, de, note, retry) {
      this.appEl.querySelector('.wr-controls').inert = true;
      document.getElementById('wr-interlude-title').textContent = title;
      document.getElementById('wr-review-vi').textContent = vi;
      document.getElementById('wr-review-de').textContent = de;
      document.getElementById('wr-interlude-note').textContent = note;
      document.getElementById('wr-interlude-icon').textContent = retry ? '📖' : '🌿';
      document.getElementById('wr-retry-word').classList.toggle('hidden', !retry);
      document.getElementById('wr-continue').textContent = retry ? 'Để ôn sau · Từ tiếp theo →' : 'Tiếp tục chơi →';
      this.interlude.classList.remove('hidden');
      this.keyboardCapture.blur();
      document.getElementById(retry ? 'wr-retry-word' : 'wr-continue').focus();
    }

    continueRound(retry = false) {
      if (this.state === 'PAUSED') {
        this.resumeLoops();
        return;
      }
      if (this.state !== 'REVIEW') return;
      const word = this.activeWords.find(w => w.isGrounded && !w.isDying);
      if (!word) return;
      if (retry) {
        word.isGrounded = false;
        word.assisted = true;
        word.y = 8;
        word.typedCount = 0;
        word.el.classList.remove('word-grounded-reveal');
        word.el.querySelector('.word-card-reveal-de')?.remove();
        word.el.querySelector('.word-card-slots').style.display = '';
        word.letters.forEach(letter => {
          letter.slotEl.textContent = '_';
          letter.slotEl.classList.remove('typed');
        });
        word.el.style.transform = `translate3d(${word.x}px, 8px, 0)`;
      } else {
        word.el.remove();
        this.activeWords = this.activeWords.filter(item => item !== word);
        this.resolvedCount++;
      }
      this.interlude.classList.add('hidden');
      this.renderProgress();
      if (!retry && this.resolvedCount >= this.sessionGoal) {
        this.gameOver(true);
        return;
      }
      this.resumeLoops();
      this.updateCardVisuals();
      this.announce(retry ? 'Mình vừa xem đáp án. Gõ lại để luyện thêm nhé.' : 'Từ này đã được giữ để ôn lại. Tiếp nào!');
    }

    // FIFO Target Helper: Always returns the oldest active, non-grounded, non-dying word
    getTargetWord() {
      return this.activeWords.find(w => !w.isDying && !w.isGrounded) || null;
    }

    // Backwards compatibility getter
    get lockedWord() {
      return this.getTargetWord();
    }

    lockTarget(word) {
      this.updateCardVisuals();
    }

    unlockTarget() {
      this.updateCardVisuals();
    }

    // Update visual classes for Target vs Waiting cards
    updateCardVisuals() {
      const target = this.getTargetWord();
      this.activeWords.forEach(w => {
        if (w.isDying || w.isGrounded) return;
        if (w === target) {
          w.el.querySelector('.wr-target-label').textContent = '✎ Đang gõ';
          w.el.classList.add('card-target', 'card-focused');
          w.el.classList.remove('card-waiting');
          w.letters.forEach((l, idx) => {
            if (idx === w.typedCount) {
              l.slotEl.classList.add('current');
            } else {
              l.slotEl.classList.remove('current');
            }
          });
        } else {
          w.el.querySelector('.wr-target-label').textContent = 'Tiếp theo · đang chờ';
          w.el.classList.remove('card-target', 'card-focused');
          w.el.classList.add('card-waiting');
          w.letters.forEach(l => l.slotEl.classList.remove('current'));
        }
      });
    }

    initEvents() {
      this.appEl.querySelectorAll('button[data-wr-mode]').forEach(button => {
        button.addEventListener('click', () => {
          if (this.state !== 'IDLE') return;
          this.mode = button.dataset.wrMode;
          this.updateModeUI();
        });
      });
      this.appEl.querySelectorAll('[data-wr-char]').forEach(button => {
        button.addEventListener('pointerdown', event => event.preventDefault());
        button.addEventListener('click', () => {
          if (this.state !== 'PLAYING') return;
          this.handleCharInput(button.dataset.wrChar, 'letter-button');
          this.focusKeyboard();
        });
      });
      document.getElementById('wr-pause').addEventListener('click', () => this.pauseGame());
      document.getElementById('wr-continue').addEventListener('click', () => this.continueRound());
      document.getElementById('wr-retry-word').addEventListener('click', () => this.continueRound(true));
      document.getElementById('wr-review-round').addEventListener('click', () => this.startGame({ review: true }));
      document.getElementById('wr-choose-mode').addEventListener('click', () => {
        this.resetToIdle();
        document.getElementById('wr-deck').focus();
      });
      document.getElementById('wr-hint').addEventListener('click', () => {
        if (this.state !== 'PLAYING' || this.mode !== 'practice') return;
        const word = this.getTargetWord();
        if (!word) return;
        word.assisted = true;
        this.rememberForReview(word);
        this.fillNextSlot(word);
        if (!word.isDying) this.announce('Đã mở một chữ. Em gõ tiếp phần còn lại nhé.', 'hint');
        this.focusKeyboard();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.pauseGame();
      });
      // Start & Replay
      if (this.btnStart) {
        this.btnStart.addEventListener('click', () => {
          try { this.sound.init(); } catch (e) {}
          this.startGame();
        });
      }

      if (this.btnReplay) {
        this.btnReplay.addEventListener('click', () => {
          try { this.sound.init(); } catch (e) {}
          this.startGame();
        });
      }

      // Exit back to Study Hub
      if (this.btnBackToStudy) {
        this.btnBackToStudy.addEventListener('click', () => {
          this.exitToStudy();
        });
      }
      if (this.btnGameOverBack) {
        this.btnGameOverBack.addEventListener('click', () => {
          this.exitToStudy();
        });
      }

      // Sound Toggle
      if (this.btnMute) {
        this.btnMute.addEventListener('click', () => {
          this.sound.init();
          const isMuted = this.sound.toggleMute();
          this.updateSoundIcon(isMuted);
        });
      }

      // Direct Keyboard Input (Desktop & Physical Keyboards)
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.state === 'PLAYING') { e.preventDefault(); this.pauseGame(); return; }
          if (this.state === 'PAUSED') { e.preventDefault(); this.continueRound(); return; }
        }
        if (e.key === 'Tab' && !this.interlude.classList.contains('hidden')) {
          const buttons = [...this.interlude.querySelectorAll('button')].filter(button => !button.classList.contains('hidden'));
          if ((e.shiftKey && document.activeElement === buttons[0]) || (!e.shiftKey && document.activeElement === buttons.at(-1))) {
            e.preventDefault();
            (e.shiftKey ? buttons.at(-1) : buttons[0]).focus();
          }
          return;
        }
        this.handleKeyDown(e);
      });

      // Mobile Virtual Keyboard Capture with strict deduplication against keydown
      if (this.keyboardCapture) {
        this.keyboardCapture.addEventListener('input', (event) => {
          if (this.state !== 'PLAYING') return;
          if (event.isComposing) return;
          const val = this.keyboardCapture.value.normalize('NFC');
          this.keyboardCapture.value = '';
          if (!val) return;

          const now = performance.now();
          for (const char of val) {
            // Check if this character was already handled by keydown within the last 120ms
            if (
              this.lastProcessed &&
              this.lastProcessed.source === 'keydown' &&
              this.lastProcessed.char === char.toLowerCase() &&
              (now - this.lastProcessed.time) < 120
            ) {
              continue;
            }
            if (/\s/.test(char)) continue;
            this.lastProcessed = { char: char.toLowerCase(), time: now, source: 'capture-input' };
            this.handleCharInput(char, 'capture-input');
          }
        });

        this.keyboardCapture.addEventListener('beforeinput', (e) => {
          if (this.state !== 'PLAYING') return;
          if (e.inputType === 'deleteContentBackward') {
            const now = performance.now();
            if (
              this.lastProcessed &&
              this.lastProcessed.source === 'keydown' &&
              this.lastProcessed.char === 'backspace' &&
              (now - this.lastProcessed.time) < 120
            ) {
              return;
            }
            this.lastProcessed = { char: 'backspace', time: now, source: 'capture-input' };
            this.handleBackspace();
          }
        });
      }

      // Tap / Click anywhere refocuses keyboard capture input
      document.addEventListener('click', (e) => {
        if (this.state === 'PLAYING') {
          if (this.appEl.contains(e.target) && !e.target.closest('button, input, a')) {
            this.focusKeyboard();
          }
        }
      });

      // Visual Viewport Handling for Mobile Virtual Keyboard
      if (window.visualViewport) {
        const handleResize = () => {
          if (this.appEl && (window.innerWidth <= 600 || (document.body && document.body.classList.contains('wortregen-standalone')))) {
            const top = Math.max(0, this.appEl.getBoundingClientRect().top);
            this.appEl.style.height = `${Math.max(280, window.visualViewport.height - top - 8)}px`;
          }
          this.resizeBoard();
        };
        window.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleResize);
        if (document.body && document.body.classList.contains('wortregen-standalone')) {
          handleResize();
        }
      }
    }

    updateSoundIcon(isMuted) {
      if (isMuted) {
        this.soundIconOn.style.display = 'none';
        this.soundIconOff.style.display = 'block';
      } else {
        this.soundIconOn.style.display = 'block';
        this.soundIconOff.style.display = 'none';
      }
    }

    focusKeyboard() {
      if (this.keyboardCapture) {
        this.keyboardCapture.value = '';
        this.keyboardCapture.focus({ preventScroll: true });
      }
    }

    resizeBoard() {
      // Preserve elapsed fall progress when a mobile keyboard changes the stage.
      if (this.fallingArea.clientHeight <= 0) return;
      this.activeWords.forEach(word => {
        if (word.isDying || word.isGrounded) return;
        const bounds = word.el.getBoundingClientRect();
        const distance = Math.max(1, this.fallingArea.clientHeight - bounds.height - 12);
        const progress = Math.max(0, Math.min(1, (word.y - 8) / word.travelDistance));
        word.y = 8 + progress * distance;
        word.width = bounds.width;
        word.height = bounds.height;
        word.travelDistance = distance;
        word.speed = distance / word.duration;
        const maxX = Math.max(0, this.fallingArea.clientWidth - bounds.width - 10);
        word.x = this.mode === 'practice' ? Math.max(0, (this.fallingArea.clientWidth - bounds.width) / 2) : Math.min(word.x, maxX);
        word.el.style.transform = `translate3d(${word.x}px, ${word.y}px, 0)`;
      });
      this.stageHeight = this.fallingArea.clientHeight;
      this.stageWidth = this.fallingArea.clientWidth;
    }

    // -------------------------------------------------------------------------
    // Game Lifecycle
    // -------------------------------------------------------------------------
    startGame({ review = false } = {}) {
      this.cleanup();
      const reviewCards = review ? [...this.reviewItems.values()] : null;
      if (reviewCards && reviewCards.length === 0) return;
      if (review) this.mode = 'practice';

      // Check vocabulary provider source (Phase 2)
      if (!this.vocabProvider) {
        this.showVocabularyError("Wortregen vocabulary source unavailable");
        return;
      }
      try {
        this.vocabProvider.buildQueue({ deck: document.getElementById('wr-deck').value || null });
        if (this.mode === 'practice' && !reviewCards) {
          // Shorter answers first, within the learner's chosen topic. This is
          // input difficulty, not a claim about the word's CEFR or mastery.
          this.vocabProvider.sessionQueue.sort((a, b) => {
            const aLength = a.de.replace(/\s/g, '').length;
            const bLength = b.de.replace(/\s/g, '').length;
            return Math.floor(aLength / 5) - Math.floor(bLength / 5);
          });
        }
      } catch (err) {
        console.error("Vocabulary initialization failed:", err);
        this.showVocabularyError(err.message || "Wortregen vocabulary source unavailable");
        return;
      }

      this.state = 'PLAYING';
      this.lives = 3;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.solvedCount = 0;
      this.missedCount = 0;
      this.activeWords = [];
      this.reviewQueue = reviewCards;
      this.sessionGoal = this.mode === 'practice' ? Math.min(8, reviewCards ? reviewCards.length : this.vocabProvider.sessionQueue.length) : Infinity;
      this.spawnedCount = 0;
      this.resolvedCount = 0;
      this.assistedCount = 0;
      this.reviewItems = new Map();
      this.maxConcurrent = this.mode === 'practice' ? 1 : 2;
      this.keyboardCapture.disabled = false;
      this.appEl.querySelector('.wr-controls').inert = false;
      this.interlude.classList.add('hidden');
      this.appEl.classList.remove('wr-celebrating');
      this.updateModeUI();
      this.startScreen.querySelector('.overlay-instruction').textContent = 'Hứng mưa từ, gom một ván vui!';
      this.startScreen.querySelector('.overlay-instruction').style.color = '';
      document.getElementById('vocab-error-banner')?.remove();

      // Hide overlays
      this.startScreen.classList.add('hidden');
      this.gameOverScreen.classList.add('hidden');

      // Clear DOM falling cards
      this.fallingArea.querySelectorAll('.word-card, .floating-feedback').forEach(el => el.remove());

      // Update HUD
      this.renderHUD();
      this.announce(this.mode === 'practice' ? 'Gõ cả từ, kể cả chữ đầu được gợi ý. Không cần dấu cách hay Enter.' : 'Chỉ gõ thẻ đang sáng. Thẻ “Tiếp theo” sẽ chờ đến lượt.');

      // The visible entry point opens mobile keyboards; letters fill the card.
      if (window.innerWidth <= 600) this.appEl.scrollIntoView({ block: 'start' });
      this.focusKeyboard();
      window.visualViewport?.dispatchEvent(new Event('resize'));

      // Start Loops
      this.lastFrameTime = performance.now();
      this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
      this.scheduleSpawn(150); // 1st word spawn (target)
      this.defer(() => {
        if (this.state === 'PLAYING' && this.activeWords.filter(w => !w.isDying && !w.isGrounded).length < this.maxConcurrent) {
          this.maybeSpawnWord(); // 2nd word spawn (waiting)
        }
      }, 2200);
    }

    showVocabularyError(msg) {
      this.state = 'IDLE';
      this.cleanup();
      this.appEl.querySelector('.wr-controls').inert = true;
      this.interlude.classList.add('hidden');
      this.keyboardCapture.blur();
      const message = 'Bộ từ này chưa sẵn sàng để chơi. Hãy chọn bộ khác rồi thử lại nhé.';
      if (this.startScreen) {
        this.startScreen.classList.remove('hidden');
        const descEl = this.startScreen.querySelector('.overlay-instruction');
        if (descEl) {
          descEl.textContent = message;
          descEl.style.color = '#ef4444';
        }
      }
      let errBanner = document.getElementById('vocab-error-banner');
      if (!errBanner) {
        errBanner = document.createElement('div');
        errBanner.id = 'vocab-error-banner';
        errBanner.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;z-index:9999;box-shadow:0 6px 18px rgba(0,0,0,0.35);';
        document.body.appendChild(errBanner);
      }
      errBanner.textContent = message;
    }

    gameOver(completed = false) {
      if (this.state === 'GAME_OVER') return;
      this.state = 'GAME_OVER';
      this.cleanup();
      this.interlude.classList.add('hidden');
      this.keyboardCapture.blur();
      this.keyboardCapture.disabled = true;
      this.appEl.querySelector('.wr-controls').inert = true;

      // Update Summary Card
      this.summaryScore.textContent = this.score;
      this.summarySolved.textContent = this.solvedCount;
      this.summaryMissed.textContent = this.missedCount;
      this.summaryCombo.textContent = `x${this.maxCombo}`;
      this.gameOverScreen.querySelector('.overlay-title').textContent = completed ? 'Trọn ván rồi! 🌟' : 'Một ván rất cố gắng!';
      this.gameOverScreen.querySelector('.overlay-icon').textContent = completed && this.solvedCount > 0 ? '🏆 🌈' : '🌱';
      this.summarySolved.closest('.stat-item').querySelector('.stat-item-label').textContent = '✨ Từ hoàn thành';
      this.summaryMissed.closest('.stat-item').querySelector('.stat-item-label').textContent = '📖 Từ đã xem đáp án';
      document.getElementById('wr-summary-note').textContent = `${this.assistedCount ? `${this.assistedCount} từ hoàn thành có gợi ý/xem đáp án. ` : ''}Đây là lượt luyện có phản hồi từng chữ, chưa phải kiểm tra tự nhớ.`;
      const list = document.getElementById('wr-review-list');
      list.replaceChildren();
      this.reviewItems.forEach(item => {
        const li = document.createElement('li');
        const de = document.createElement('strong');
        de.lang = 'de';
        de.textContent = item.de;
        const vi = document.createElement('span');
        vi.textContent = item.vi;
        li.append(de, vi);
        list.append(li);
      });
      const reviewButton = document.getElementById('wr-review-round');
      reviewButton.classList.toggle('hidden', this.reviewItems.size === 0);
      reviewButton.textContent = `Ôn lại ${this.reviewItems.size} từ cần luyện →`;
      if (completed && this.solvedCount > 0) this.appEl.classList.add('wr-celebrating');
      this.renderProgress();

      // Show Game Over Screen
      this.gameOverScreen.classList.remove('hidden');
      (this.reviewItems.size ? reviewButton : this.btnReplay).focus();
    }

    cleanup() {
      this.pendingTimers.forEach(id => clearTimeout(id));
      this.pendingTimers.clear();
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.spawnTimer) {
        clearTimeout(this.spawnTimer);
        this.spawnTimer = null;
      }
    }

    resetToIdle() {
      this.cleanup();
      document.getElementById('vocab-error-banner')?.remove();
      this.state = 'IDLE';
      this.keyboardCapture.disabled = false;
      this.appEl.querySelector('.wr-controls').inert = true;
      this.keyboardCapture.blur();
      this.interlude.classList.add('hidden');
      this.appEl.classList.remove('wr-celebrating');
      this.resolvedCount = 0;
      this.sessionGoal = 8;
      this.renderProgress();
      if (this.activeWords && this.activeWords.length) {
        this.activeWords.forEach(w => {
          if (w.el && w.el.parentNode) {
            w.el.remove();
          }
        });
        this.activeWords = [];
      }
      if (this.startScreen) {
        this.startScreen.classList.remove('hidden');
      }
      if (this.gameOverScreen) {
        this.gameOverScreen.classList.add('hidden');
      }
    }

    exitToStudy() {
      this.resetToIdle();
      if (typeof window !== 'undefined' && typeof window.exitWortregenToStudy === 'function') {
        window.exitWortregenToStudy();
      } else if (typeof window !== 'undefined' && typeof window.setStudySubMode === 'function') {
        window.setStudySubMode('flash');
      } else if (typeof window !== 'undefined') {
        window.location.href = 'index.html';
      }
    }

    // -------------------------------------------------------------------------
    // Word Spawning & Viewport-Scaled Fall Velocity
    // -------------------------------------------------------------------------
    scheduleSpawn(delay = 2000) {
      if (this.state !== 'PLAYING') return;

      this.spawnTimer = this.defer(() => {
        if (this.state === 'PLAYING') {
          this.maybeSpawnWord();
          const activeCount = this.activeWords.filter(w => !w.isDying && !w.isGrounded).length;
          const nextDelay = activeCount < this.maxConcurrent ? 1800 : 3200;
          this.scheduleSpawn(nextDelay);
        }
      }, delay);
    }

    maybeSpawnWord() {
      if (this.state !== 'PLAYING') return;
      if (this.mode === 'practice' && this.spawnedCount >= this.sessionGoal) return;
      const activeNonDying = this.activeWords.filter(w => !w.isDying && !w.isGrounded);
      if (activeNonDying.length >= this.maxConcurrent) {
        return;
      }

      if (!this.vocabProvider) {
        this.showVocabularyError("Wortregen vocabulary source unavailable");
        return;
      }

      // Active card IDs currently on screen to avoid immediate duplicate cards
      const activeScreenCardIds = activeNonDying
        .filter(w => w.cardId)
        .map(w => w.cardId);

      // Pick next card from vocabulary provider
      let wordData;
      try {
        wordData = this.reviewQueue ? this.reviewQueue.shift() : this.vocabProvider.getNextCard(activeScreenCardIds);
      } catch (err) {
        console.error("Failed to get next card:", err);
        this.showVocabularyError(err.message || "Wortregen vocabulary source unavailable");
        return;
      }

      if (!wordData || !wordData.de || !wordData.vi) {
        return;
      }

      const areaWidth = this.fallingArea.clientWidth || 340;
      const cardWidth = Math.min(230, Math.max(140, areaWidth * 0.5));
      const minX = 10;
      const maxX = Math.max(minX, areaWidth - cardWidth - 10);

      // Find collision-free X coordinate at top zone (y < 95px)
      let spawnX = null;
      const topWords = this.activeWords.filter(w => !w.isDying && w.y < 95);

      for (let attempt = 0; attempt < 12; attempt++) {
        const candidateX = minX + Math.random() * (maxX - minX);
        const collides = topWords.some(w => Math.abs(candidateX - w.x) < cardWidth + 14);
        if (!collides) {
          spawnX = candidateX;
          break;
        }
      }

      if (spawnX === null) {
        if (topWords.length === 0) {
          spawnX = minX + (maxX - minX) * 0.5;
        } else {
          const avgX = topWords.reduce((s, w) => s + w.x, 0) / topWords.length;
          spawnX = avgX > areaWidth / 2 ? minX + 10 : maxX - 10;
        }
      }

      if (this.mode === 'practice') spawnX = (areaWidth - cardWidth) / 2;

      // Create DOM element with slots
      const cardEl = document.createElement('div');
      cardEl.className = 'word-card';
      cardEl.id = `word-${this.wordIdCounter}`;
      cardEl.dataset.tier = wordData.tier || 1;
      if (wordData.id) {
        cardEl.dataset.cardId = wordData.id;
      }

      const innerEl = document.createElement('div');
      innerEl.className = 'word-card-inner';

      const viEl = document.createElement('div');
      viEl.className = 'word-card-vi';
      viEl.textContent = wordData.vi;
      innerEl.appendChild(viEl);

      const targetLabel = document.createElement('div');
      targetLabel.className = 'wr-target-label';
      innerEl.prepend(targetLabel);
      const cue = document.createElement('div');
      cue.className = 'wr-word-cue';
      cue.textContent = `Bắt đầu bằng “${wordData.de.trim()[0]}” · vẫn cần gõ chữ này`;

      const slotsEl = document.createElement('div');
      slotsEl.className = 'word-card-slots';

      // Parse letters and words
      const wordParts = wordData.de.trim().split(/\s+/);
      const letters = [];

      wordParts.forEach((part, partIdx) => {
        const partEl = document.createElement('div');
        partEl.className = 'slot-word';

        for (let i = 0; i < part.length; i++) {
          const char = part[i];
          const slotEl = document.createElement('span');
          slotEl.className = 'char-slot';
          slotEl.textContent = '_';
          slotEl.dataset.char = char;
          partEl.appendChild(slotEl);

          letters.push({
            char: char,
            slotEl: slotEl,
            wordIdx: partIdx,
            charIdx: i
          });
        }

        slotsEl.appendChild(partEl);
      });

      innerEl.appendChild(slotsEl);
      innerEl.appendChild(cue);
      cardEl.appendChild(innerEl);
      this.fallingArea.appendChild(cardEl);

      // Measure real dimensions
      const rect = cardEl.getBoundingClientRect();
      const actualWidth = rect.width || cardWidth;
      const actualHeight = rect.height || 54;
      if (this.mode === 'practice') spawnX = Math.max(minX, (areaWidth - actualWidth) / 2);

      // Keep inside bounds
      const clampedMaxX = Math.max(minX, areaWidth - actualWidth - 14);
      spawnX = Math.max(minX, Math.min(spawnX, clampedMaxX));
      const startY = 8;

      // Fall Duration: Tier 1 (18.5s - 21.0s), Tier 2 (24.0s - 26.5s), Tier 3 (28.5s)
      let targetDuration = wordData.duration || 18.5;
      if (this.mode === 'practice') targetDuration *= 1.7;

      const areaHeight = this.fallingArea.clientHeight || 560;
      const totalDistance = Math.max(1, areaHeight - actualHeight - startY - 4);
      let cardSpeed = totalDistance / targetDuration;

      // Invariant: newer word must NEVER fall faster or overtake older word ahead of it
      const precedingWord = this.activeWords.find(w => !w.isDying && !w.isGrounded);
      if (precedingWord) {
        targetDuration = Math.max(targetDuration, precedingWord.duration || 18.5);
        cardSpeed = Math.min(cardSpeed, precedingWord.speed);
      }

      const wordObj = {
        id: this.wordIdCounter++,
        cardId: wordData.id || null,
        tier: wordData.tier || 1,
        vi: wordData.vi,
        de: wordData.de,
        source: { ...wordData },
        assisted: false,
        wasMissed: false,
        x: spawnX,
        y: startY,
        width: actualWidth,
        height: actualHeight,
        duration: targetDuration,
        travelDistance: totalDistance,
        speed: cardSpeed,
        el: cardEl,
        innerEl: innerEl,
        letters: letters,
        typedCount: 0,
        isDying: false,
        isGrounded: false
      };

      cardEl.style.transform = `translate3d(${wordObj.x}px, ${wordObj.y}px, 0)`;
      this.activeWords.push(wordObj);
      this.spawnedCount++;

      // Update FIFO target highlight and slot states
      this.updateCardVisuals();
    }

    // -------------------------------------------------------------------------
    // Main Animation Loop
    // -------------------------------------------------------------------------
    gameLoop(timestamp) {
      if (this.state !== 'PLAYING' || this.lives <= 0) return;

      // Resize events and animation frames may arrive in either order. Rebase
      // geometry before collision checks so opening a keyboard is not a miss.
      if (this.stageHeight !== this.fallingArea.clientHeight || this.stageWidth !== this.fallingArea.clientWidth || this.activeWords.some(word => !word.isDying && !word.isGrounded && Math.abs(word.el.offsetHeight - word.height) > 1)) {
        this.resizeBoard();
      }

      const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
      this.lastFrameTime = timestamp;

      const groundLimit = this.fallingArea.clientHeight;
      const target = this.getTargetWord();

      for (let i = 0; i < this.activeWords.length; i++) {
        if (this.state !== 'PLAYING' || this.lives <= 0) break;

        const w = this.activeWords[i];
        if (w.isDying || w.isGrounded) continue;
        // Waiting cards keep their full fall time until they become the target.
        if (w !== target) continue;

        w.y += w.speed * dt;

        // Prevent younger word from catching up/overlapping preceding word
        if (i > 0) {
          const prev = this.activeWords[i - 1];
          if (prev && !prev.isDying && !prev.isGrounded) {
            const minGap = Math.max(65, w.height + 12);
            if (w.y > prev.y - minGap) {
              w.y = prev.y - minGap;
            }
          }
        }

        w.el.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;

        // Check if word hits ground threshold
        if (w.y + w.height >= groundLimit - 4) {
          this.handleWordMissed(w, i);
          if (this.lives <= 0) {
            break; // Halt processing remaining words in this frame
          }
        }
      }

      if (this.state === 'PLAYING' && this.lives > 0) {
        this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
      }
    }

    // -------------------------------------------------------------------------
    // Word Missed (Hits Ground)
    // -------------------------------------------------------------------------
    handleWordMissed(word, index) {
      if (this.state !== 'PLAYING' || this.lives <= 0) return;
      if (word.isGrounded || word.isDying) return;

      word.isGrounded = true;
      const groundLimit = this.fallingArea.clientHeight;
      word.y = Math.max(0, groundLimit - word.height - 4);
      word.el.style.transform = `translate3d(${word.x}px, ${word.y}px, 0)`;

      if (!word.wasMissed) {
        this.missedCount++;
        this.rememberForReview(word);
      }
      word.wasMissed = true;
      word.assisted = true;
      this.combo = 0;
      if (this.mode === 'practice') {
        this.state = 'REVIEW';
        this.cleanup();
        this.renderHUD();
        word.el.classList.add('word-grounded-reveal');
        this.showInterlude('Từ này mình cùng xem lại', word.vi, word.de, 'Không mất tim. Đọc đáp án rồi thử lại, hoặc giữ từ này để ôn sau.', true);
        return;
      }

      // Penalty (clamped so lives cannot go below 0)
      this.lives = Math.max(0, this.lives - 1);
      this.combo = 0;

      // Audio feedback
      this.sound.playMiss();

      // Floating -1 Heart feedback
      this.showFloatingFeedback(word.x + word.width / 2, Math.max(10, word.y - 28), '-1 ❤️', 'life-loss');

      // Update HUD immediately
      this.renderHUD();

      // FIFO: The next waiting word immediately becomes the active target!
      this.updateCardVisuals();

      // Visual ground reveal: highlight card and show full German answer for 1.2s
      word.el.classList.add('word-grounded-reveal');
      word.el.classList.remove('card-target', 'card-focused', 'card-waiting');
      const inner = word.innerEl || word.el.querySelector('.word-card-inner');
      if (inner) {
        const slots = inner.querySelector('.word-card-slots');
        if (slots) slots.style.display = 'none';
        let revealEl = inner.querySelector('.word-card-reveal-de');
        if (!revealEl) {
          revealEl = document.createElement('div');
          revealEl.className = 'word-card-reveal-de';
          revealEl.textContent = word.de;
          inner.appendChild(revealEl);
        }
      }

      const isFatalMiss = this.lives <= 0;

      // Pause at bottom for 1.2s so the player can learn the correct answer
      this.defer(() => {
        word.isDying = true;
        word.el.classList.add('word-missed');

        this.defer(() => {
          if (word.el.parentNode) {
            word.el.remove();
          }
        }, 350);

        const idx = this.activeWords.indexOf(word);
        if (idx !== -1) {
          this.activeWords.splice(idx, 1);
        }

        if (isFatalMiss && this.state === 'PLAYING') {
          this.gameOver();
        } else if (this.state === 'PLAYING') {
          // Refill waiting queue if needed
          if (this.activeWords.filter(w => !w.isDying && !w.isGrounded).length < this.maxConcurrent) {
            this.maybeSpawnWord();
          }
        }
      }, 1200);
    }

    // -------------------------------------------------------------------------
    // Direct Keyboard & In-Place Typing
    // -------------------------------------------------------------------------
    handleKeyDown(e) {
      if (this.state !== 'PLAYING') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing || e.key === 'Dead' || e.key === 'Process') return;
      const editing = e.target?.closest?.('input, textarea, select, [contenteditable="true"]');
      if ((editing && editing !== this.keyboardCapture) || e.target?.closest?.('button, a')) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        this.lastProcessed = { char: 'backspace', time: performance.now(), source: 'keydown' };
        this.handleBackspace();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        // Auto-space is active; pressing Space is safely ignored
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        // Enter is not needed, ignore safely
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        const char = e.key;
        this.lastProcessed = { char: char.toLowerCase(), time: performance.now(), source: 'keydown' };
        this.handleCharInput(char, 'keydown');
        return;
      }
    }

    handleCharInput(rawChar, source = 'unknown') {
      if (this.state !== 'PLAYING') return;
      if (this.lives <= 0) return;

      // Strict FIFO: Only the current target word accepts input
      const target = this.getTargetWord();
      if (!target) return;

      const nextLetter = target.letters[target.typedCount];
      if (!nextLetter) return;

      if (this.charsMatch(rawChar, nextLetter.char)) {
        this.fillNextSlot(target);
        if (!target.isDying && this.feedback.dataset.tone === 'retry') this.announce('Đúng chữ rồi! Gõ tiếp phần còn lại nhé.');
      } else {
        // Wrong character typed on target: subtle shake error, NO life lost, NO card switch!
        this.shakeTargetError(target);
        this.announce('Chữ này chưa khớp. Thử lại nhé — gõ sai không mất tim.', 'retry');
      }
    }

    // German Characters Strict Equality: a ≠ ä, o ≠ ö, u ≠ ü, s ≠ ß
    charsMatch(inputChar, targetChar) {
      if (!inputChar || !targetChar) return false;
      return inputChar.toLowerCase() === targetChar.toLowerCase();
    }

    fillNextSlot(word) {
      const letter = word.letters[word.typedCount];
      if (!letter) return;

      letter.slotEl.textContent = letter.char;
      letter.slotEl.classList.remove('first-char-hint', 'current');
      letter.slotEl.classList.add('typed');

      word.typedCount++;

      // Complete word: POP immediately!
      if (word.typedCount >= word.letters.length) {
        this.handleCorrectAnswer(word);
      } else {
        this.updateCardVisuals();
      }
    }

    handleBackspace() {
      if (this.state !== 'PLAYING') return;
      const word = this.getTargetWord();
      if (!word) return;

      if (word.typedCount > 0) {
        if (word.typedCount < word.letters.length) {
          word.letters[word.typedCount].slotEl.classList.remove('current');
        }

        word.typedCount--;
        const letter = word.letters[word.typedCount];
        letter.slotEl.classList.remove('typed');

        letter.slotEl.textContent = '_';

        this.updateCardVisuals();
      }
      // Note: Target is strictly retained even if typedCount reaches 0
    }

    shakeTargetError(word) {
      const inner = word.innerEl || word.el.querySelector('.word-card-inner') || word.el;
      inner.classList.remove('shake-error');
      void inner.offsetWidth; // force reflow
      inner.classList.add('shake-error');
      this.defer(() => {
        inner.classList.remove('shake-error');
      }, 280);
    }

    handleCorrectAnswer(word) {
      if (this.state !== 'PLAYING' || word.isDying) return;
      word.isDying = true;
      const idx = this.activeWords.indexOf(word);
      if (idx !== -1) {
        this.activeWords.splice(idx, 1);
      }

      // Stats
      const wordLen = word.letters ? word.letters.length : 10;
      this.combo += 1;
      const multiplier = Math.min(3, 1 + Math.floor((this.combo - 1) / 3));
      const scoreGain = wordLen * 10 * multiplier;
      this.score += scoreGain;
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
      this.solvedCount += 1;
      this.resolvedCount += 1;
      if (word.assisted) this.assistedCount++;

      // Audio
      this.sound.playCorrect(this.combo);

      // Visual Pop Animation
      word.el.classList.remove('card-target', 'card-focused', 'card-waiting');
      word.el.classList.add('word-popped');
      this.defer(() => {
        if (word.el.parentNode) {
          word.el.remove();
        }
      }, 360);

      // Floating Score Indicator
      const scoreText = multiplier > 1 ? `+${scoreGain} · Thưởng x${multiplier}` : `+${scoreGain}`;
      const scoreClass = this.combo >= 3 ? 'score combo-burst' : 'score';
      this.showFloatingFeedback(word.x + word.width / 2, Math.max(20, word.y), scoreText, scoreClass);

      // Update HUD
      this.renderHUD();
      this.renderProgress();
      const encouragement = this.combo === 3 ? '🔥 Ba từ liền! Từ tiếp theo được thưởng x2.' : this.combo === 6 ? '🌈 Sáu từ liền! Từ tiếp theo được thưởng x3.' : `Đúng rồi! +${scoreGain} điểm · tiếp nào!`;
      this.announce(encouragement, 'success');

      // FIFO: Next word in queue immediately becomes the active target!
      this.updateCardVisuals();

      if (this.mode === 'practice' && this.resolvedCount >= this.sessionGoal) {
        this.defer(() => this.gameOver(true), 500);
        return;
      }

      // Maintain flow: Spawn next word smoothly if board has space
      if (this.activeWords.filter(w => !w.isDying && !w.isGrounded).length < this.maxConcurrent) {
        this.defer(() => {
          if (this.state === 'PLAYING') {
            this.maybeSpawnWord();
          }
        }, 1200);
      }
    }

    // -------------------------------------------------------------------------
    // HUD Rendering
    // -------------------------------------------------------------------------
    renderHUD() {
      this.hudLives.setAttribute('aria-label', this.mode === 'practice' ? 'Luyện nhẹ không mất tim' : `${this.lives} mạng`);
      // Lives (❤️ ❤️ ❤️)
      const hearts = this.hudLives.querySelectorAll('.hud-heart');
      hearts.forEach((h, idx) => {
        if (idx < this.lives) {
          h.classList.remove('lost');
          h.textContent = '❤️';
        } else {
          h.classList.add('lost');
          h.textContent = '🤍';
        }
      });

      // Score
      this.hudScore.textContent = this.score;

      // Combo
      this.hudCombo.textContent = `Combo x${this.combo}`;
      this.hudCombo.classList.remove('active', 'fire');

      if (this.combo >= 5) {
        this.hudCombo.classList.add('fire');
      } else if (this.combo >= 2) {
        this.hudCombo.classList.add('active');
      }
    }

    // -------------------------------------------------------------------------
    // Floating Feedback Popup
    // -------------------------------------------------------------------------
    showFloatingFeedback(x, y, text, extraClass = '') {
      const fb = document.createElement('div');
      fb.className = `floating-feedback ${extraClass}`;
      fb.textContent = text;
      fb.style.left = `${x}px`;
      fb.style.top = `${y}px`;

      this.fallingArea.appendChild(fb);

      this.defer(() => {
        if (fb.parentNode) {
          fb.remove();
        }
      }, 820);
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------
    shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  }

  // ---------------------------------------------------------------------------
  // Bootstrapping & Global Helpers
  // ---------------------------------------------------------------------------
  function exitWortregenToStudy() {
    if (window.wortregenGame && typeof window.wortregenGame.resetToIdle === 'function') {
      window.wortregenGame.resetToIdle();
    } else if (window.wortregenGame && typeof window.wortregenGame.cleanup === 'function') {
      window.wortregenGame.cleanup();
    }
    if (typeof window.setStudySubMode === 'function') {
      window.setStudySubMode('flash');
    } else if (typeof window.location !== 'undefined') {
      window.location.href = 'index.html';
    }
  }

  if (typeof window !== 'undefined') {
    window.WortregenGame = WortregenGame;
    window.exitWortregenToStudy = exitWortregenToStudy;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.wortregenGame = new WortregenGame();
    });
  } else {
    window.wortregenGame = new WortregenGame();
  }
})();
