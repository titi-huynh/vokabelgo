/**
 * ==========================================================================
 * WORTTURM (Word Tower / Stack Mini-Game Prototype) - VokabelGo
 * Prototype preview for testing gameplay feel, stacking mechanics,
 * vocabulary prompt timing, and tower height progression.
 * ==========================================================================
 */

(function () {
  'use strict';

  // 15-25 Sample A1/A2 Words as specified in Section 11
  const WORTTURM_VOCABULARY = [
    { vi: "nhà ga", de: "der Bahnhof" },
    { vi: "căn hộ", de: "die Wohnung" },
    { vi: "trường học", de: "die Schule" },
    { vi: "nhà bếp", de: "die Küche" },
    { vi: "học", de: "lernen" },
    { vi: "làm việc", de: "arbeiten" },
    { vi: "lái xe", de: "fahren" },
    { vi: "mua", de: "kaufen" },
    { vi: "đọc", de: "lesen" },
    { vi: "đắt", de: "teuer" },
    { vi: "đẹp", de: "schön" },
    { vi: "nhanh", de: "schnell" },
    { vi: "hôm qua", de: "gestern" },
    { vi: "cái bàn", de: "der Tisch" },
    { vi: "cái ghế", de: "der Stuhl" },
    { vi: "cuốn sách", de: "das Buch" },
    { vi: "thành phố", de: "die Stadt" },
    { vi: "nước", de: "das Wasser" },
    { vi: "uống", de: "trinken" },
    { vi: "ăn", de: "essen" },
    { vi: "chậm", de: "langsam" },
    { vi: "ngày mai", de: "morgen" },
    { vi: "bác sĩ", de: "der Arzt" },
    { vi: "bạn bè", de: "der Freund" },
    { vi: "câu hỏi", de: "die Frage" }
  ];

  /**
   * Vocabulary Evaluator for Wortturm
   * - Normalizes German input (case-insensitive, trims, collapses spaces)
   * - Requires correct article for nouns (der, die, das)
   * - Accepts umlaut equivalents (ä <-> ae, ö <-> oe, ü <-> ue, ß <-> ss)
   */
  class WortturmEvaluator {
    static normalize(str) {
      if (!str) return '';
      return str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');
    }

    static evaluate(input, target) {
      const normInput = this.normalize(input);
      const normTarget = this.normalize(target);

      if (!normInput) {
        return {
          isCorrect: false,
          reason: 'empty',
          feedback: 'Vui lòng nhập từ!'
        };
      }

      if (normInput === normTarget) {
        return {
          isCorrect: true,
          reason: 'exact',
          feedback: 'RICHTIG!'
        };
      }

      // Check if missing article or wrong article for nouns
      const targetTokens = normTarget.split(' ');
      const inputTokens = normInput.split(' ');
      const articles = ['der', 'die', 'das'];

      if (targetTokens.length === 2 && articles.includes(targetTokens[0])) {
        // Missing article
        if (inputTokens.length === 1 && inputTokens[0] === targetTokens[1]) {
          return {
            isCorrect: false,
            reason: 'missing_article',
            feedback: `Fast! → ${target}`
          };
        }
        // Wrong article
        if (inputTokens.length === 2 && articles.includes(inputTokens[0]) && inputTokens[1] === targetTokens[1]) {
          return {
            isCorrect: false,
            reason: 'wrong_article',
            feedback: `Sai Artikel! → ${target}`
          };
        }
      }

      return {
        isCorrect: false,
        reason: 'wrong',
        feedback: `Noch einmal! (${target})`
      };
    }
  }

  /**
   * Web Audio Synthesizer for Wortturm
   */
  class WortturmAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    playTone(freq, type, duration, gainStart = 0.15) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Graceful silence on audio failure
      }
    }

    playDrop() {
      this.playTone(280, 'triangle', 0.08, 0.12);
    }

    playSlice() {
      this.playTone(520, 'sine', 0.06, 0.1);
    }

    playPerfect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.12, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.22);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.22);
        });
      } catch (e) {}
    }

    playWrong() {
      this.playTone(160, 'sawtooth', 0.15, 0.1);
    }

    playCollapse() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [240, 180, 120, 80].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.14, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.25);
        });
      } catch (e) {}
    }
  }

  /**
   * Main Game Engine for Wortturm
   */
  class WortturmGame {
    constructor() {
      // Configuration & Dimensions
      this.FIELD_WIDTH = 360;
      this.BLOCK_HEIGHT = 36;
      this.BASE_WIDTH = 220;
      this.BASE_LEFT = (this.FIELD_WIDTH - this.BASE_WIDTH) / 2;
      this.FLOAT_GAP = 90; // vertical gap between top block and moving block

      // DOM Elements
      this.appEl = document.getElementById('wortturm-app');
      this.hudScoreEl = document.getElementById('hud-score-val');
      this.promptViEl = document.getElementById('prompt-vi');
      this.gameViewportEl = document.getElementById('game-viewport');
      this.towerWorldEl = document.getElementById('tower-world');
      this.feedbackOverlayEl = document.getElementById('feedback-overlay');
      this.inputEl = document.getElementById('wortturm-input');
      this.inputFormEl = document.getElementById('input-form');
      this.inputHintEl = document.getElementById('input-hint');
      this.gameOverOverlayEl = document.getElementById('game-over-overlay');
      this.gameOverHeightEl = document.getElementById('game-over-height-val');
      this.btnRestartEl = document.getElementById('btn-restart');
      this.btnMuteEl = document.getElementById('btn-mute');
      this.iconSoundOnEl = document.getElementById('icon-sound-on');
      this.iconSoundOffEl = document.getElementById('icon-sound-off');

      // Audio
      this.audio = new WortturmAudio();

      // State
      this.state = 'INIT'; // INIT, PLAYING, DROPPING, GAME_OVER
      this.score = 0; // Höhe
      this.level = 0; // Stack levels (0 = base)
      this.stack = []; // [{ left, width, level, de }]
      this.currentWidth = this.BASE_WIDTH;
      this.currentX = this.BASE_LEFT;
      this.direction = 1; // 1 = right, -1 = left
      this.speed = 150; // px/s
      this.currentWord = null;
      this.wordPool = [...WORTTURM_VOCABULARY];
      this.wordIndex = 0;

      // Animation loop
      this.rAF = null;
      this.lastTime = 0;
      this.movingBlockEl = null;
      this.isDropping = false;

      this.initEvents();
    }

    initEvents() {
      if (this.inputFormEl) {
        this.inputFormEl.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleEnterSubmit();
        });
      }

      if (this.inputEl) {
        this.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleEnterSubmit();
          }
        });
      }

      if (this.btnRestartEl) {
        this.btnRestartEl.addEventListener('click', () => {
          this.startNewGame();
        });
      }

      if (this.btnMuteEl) {
        this.btnMuteEl.addEventListener('click', () => {
          const isMuted = this.audio.toggleMute();
          if (this.iconSoundOnEl && this.iconSoundOffEl) {
            this.iconSoundOnEl.style.display = isMuted ? 'none' : 'block';
            this.iconSoundOffEl.style.display = isMuted ? 'block' : 'none';
          }
        });
      }
    }

    startNewGame() {
      // Cancel previous loop if running
      if (this.rAF) {
        cancelAnimationFrame(this.rAF);
        this.rAF = null;
      }

      // Reset state
      this.score = 0;
      this.level = 0;
      this.stack = [];
      this.currentWidth = this.BASE_WIDTH;
      this.currentX = this.BASE_LEFT;
      this.direction = 1;
      this.speed = 150;
      this.isDropping = false;
      this.state = 'PLAYING';

      // Reset HUD & UI
      if (this.hudScoreEl) this.hudScoreEl.textContent = '0';
      if (this.inputEl) {
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        this.inputEl.focus();
      }
      if (this.inputHintEl) {
        this.inputHintEl.textContent = '';
        this.inputHintEl.className = 'input-hint';
      }
      if (this.gameOverOverlayEl) {
        this.gameOverOverlayEl.classList.remove('show');
      }

      // Clear tower world
      if (this.towerWorldEl) {
        this.towerWorldEl.innerHTML = '';
        this.towerWorldEl.style.transform = 'translateY(0px)';
      }

      // Create Base Block (Level 0, START)
      this.createBaseBlock();

      // Shuffle word pool
      this.wordPool = [...WORTTURM_VOCABULARY].sort(() => Math.random() - 0.5);
      this.wordIndex = 0;

      // Advance to first word & spawn first moving block
      this.setupNextRound();

      // Start game loop
      this.lastTime = performance.now();
      this.rAF = requestAnimationFrame((t) => this.tick(t));
    }

    getBlockColors(lvl) {
      const hue = (84 + lvl * 14) % 360;
      return {
        bg: `hsl(${hue}, 72%, 50%)`,
        border: `hsl(${hue}, 80%, 40%)`,
        glow: `hsla(${hue}, 85%, 65%, 0.5)`
      };
    }

    createBaseBlock() {
      const baseEl = document.createElement('div');
      baseEl.className = 'wt-block wt-block-base';
      baseEl.style.width = `${this.BASE_WIDTH}px`;
      baseEl.style.left = `${this.BASE_LEFT}px`;
      baseEl.style.bottom = '0px';
      baseEl.textContent = 'START';
      this.towerWorldEl.appendChild(baseEl);

      this.stack.push({
        left: this.BASE_LEFT,
        width: this.BASE_WIDTH,
        level: 0,
        de: 'START'
      });
    }

    setupNextRound() {
      this.currentWord = this.wordPool[this.wordIndex % this.wordPool.length];
      this.wordIndex++;

      // Update prompt
      if (this.promptViEl) {
        this.promptViEl.textContent = `“${this.currentWord.vi}”`;
      }

      // Create moving block above top of tower
      const colors = this.getBlockColors(this.level + 1);
      const movingY = (this.level + 1) * this.BLOCK_HEIGHT + this.FLOAT_GAP;

      // Remove existing moving block if present
      if (this.movingBlockEl && this.movingBlockEl.parentNode) {
        this.movingBlockEl.parentNode.removeChild(this.movingBlockEl);
      }

      this.movingBlockEl = document.createElement('div');
      this.movingBlockEl.className = 'wt-block wt-block-moving';
      this.movingBlockEl.style.width = `${this.currentWidth}px`;
      this.movingBlockEl.style.bottom = `${movingY}px`;
      this.movingBlockEl.style.background = colors.bg;
      this.movingBlockEl.style.borderColor = colors.border;

      // Vietnamese text inside moving block
      const textSpan = document.createElement('span');
      textSpan.className = 'block-text';
      textSpan.textContent = this.currentWord.vi;
      this.movingBlockEl.appendChild(textSpan);

      this.towerWorldEl.appendChild(this.movingBlockEl);

      // Randomize or alternate starting direction & X
      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.currentX = this.direction === 1 ? 0 : (this.FIELD_WIDTH - this.currentWidth);
      this.movingBlockEl.style.left = `${this.currentX}px`;

      // Speed increases slightly per block (calm, predictable curve)
      this.speed = 150 + Math.min(this.level * 4, 110);

      // Clear input & hint
      if (this.inputEl) {
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        this.inputEl.focus();
      }
      if (this.inputHintEl) {
        this.inputHintEl.textContent = '';
        this.inputHintEl.className = 'input-hint';
      }

      this.isDropping = false;
    }

    tick(now) {
      if (this.state !== 'PLAYING') return;

      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      // Update horizontal position if not currently in drop animation
      if (!this.isDropping && this.movingBlockEl) {
        this.currentX += this.direction * this.speed * dt;

        const maxRight = this.FIELD_WIDTH - this.currentWidth;
        if (this.currentX <= 0) {
          this.currentX = 0;
          this.direction = 1;
        } else if (this.currentX >= maxRight) {
          this.currentX = maxRight;
          this.direction = -1;
        }

        this.movingBlockEl.style.left = `${this.currentX}px`;
      }

      this.rAF = requestAnimationFrame((t) => this.tick(t));
    }

    showFeedback(text, type = 'correct') {
      if (!this.feedbackOverlayEl) return;
      this.feedbackOverlayEl.textContent = text;
      this.feedbackOverlayEl.className = `feedback-overlay show feedback-${type}`;

      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = setTimeout(() => {
        if (this.feedbackOverlayEl) {
          this.feedbackOverlayEl.classList.remove('show');
        }
      }, 1200);
    }

    handleEnterSubmit() {
      if (this.state !== 'PLAYING' || this.isDropping) return;

      const userInput = this.inputEl ? this.inputEl.value : '';
      const evaluation = WortturmEvaluator.evaluate(userInput, this.currentWord.de);

      if (!evaluation.isCorrect) {
        // WRONG: DO NOT DROP! Block keeps moving.
        this.audio.playWrong();
        this.showFeedback(evaluation.feedback, 'wrong');

        if (this.inputHintEl) {
          this.inputHintEl.textContent = evaluation.feedback;
          this.inputHintEl.className = 'input-hint hint-warning';
        }

        if (this.inputEl) {
          this.inputEl.classList.add('input-shake');
          setTimeout(() => {
            if (this.inputEl) this.inputEl.classList.remove('input-shake');
          }, 350);
          this.inputEl.focus();
        }
        return;
      }

      // CORRECT: DROP BLOCK IMMEDIATELY at currentX!
      this.isDropping = true;
      if (this.inputEl) this.inputEl.disabled = true;

      const dropX = this.currentX;
      this.executeBlockDrop(dropX);
    }

    executeBlockDrop(dropX) {
      if (!this.movingBlockEl) return;

      const prevBlock = this.stack[this.stack.length - 1];
      const targetLevel = this.level + 1;
      const targetBottom = targetLevel * this.BLOCK_HEIGHT;

      // Animate vertical drop
      this.movingBlockEl.style.transition = 'bottom 0.16s cubic-bezier(0.4, 0, 0.8, 1)';
      this.movingBlockEl.style.bottom = `${targetBottom}px`;

      setTimeout(() => {
        if (this.state !== 'PLAYING') return;

        // Calculate overlap
        const prevLeft = prevBlock.left;
        const prevWidth = prevBlock.width;
        const prevRight = prevLeft + prevWidth;

        const currLeft = dropX;
        const currRight = currLeft + this.currentWidth;

        const overlapLeft = Math.max(prevLeft, currLeft);
        const overlapRight = Math.min(prevRight, currRight);
        const overlap = overlapRight - overlapLeft;

        // CASE 1: Overlap <= 0 -> Tower falls! Game Over
        if (overlap <= 0) {
          this.handleTowerFall();
          return;
        }

        // Check PERFECT tolerance: within 4px offset or >= 94% overlap
        const isPerfect = Math.abs(currLeft - prevLeft) <= 4 || overlap >= 0.94 * prevWidth;

        if (isPerfect) {
          this.handlePerfectPlacement(prevLeft, prevWidth, targetBottom, targetLevel);
        } else {
          this.handlePartialPlacement(currLeft, currRight, prevLeft, prevRight, overlapLeft, overlap, targetBottom, targetLevel);
        }
      }, 160);
    }

    handlePerfectPlacement(snapLeft, snapWidth, targetBottom, targetLevel) {
      this.audio.playPerfect();
      this.showFeedback('PERFEKT! ✨', 'perfect');

      // Snap moving block to full width and position
      if (this.movingBlockEl) {
        this.movingBlockEl.classList.remove('wt-block-moving');
        this.movingBlockEl.classList.add('wt-block-placed', 'wt-block-perfect');
        this.movingBlockEl.style.left = `${snapLeft}px`;
        this.movingBlockEl.style.width = `${snapWidth}px`;
        this.movingBlockEl.style.transition = 'none';

        // Display German word on placed block
        const textSpan = this.movingBlockEl.querySelector('.block-text');
        if (textSpan) textSpan.textContent = this.currentWord.de;
        this.movingBlockEl = null;
      }

      this.currentWidth = snapWidth;
      this.finalizePlacement(snapLeft, snapWidth, targetLevel);
    }

    handlePartialPlacement(currLeft, currRight, prevLeft, prevRight, overlapLeft, overlap, targetBottom, targetLevel) {
      this.audio.playDrop();
      this.showFeedback('RICHTIG!', 'correct');

      // Calculate sliced overhang piece
      let overhangLeft = 0;
      let overhangWidth = 0;

      if (currLeft < prevLeft) {
        overhangLeft = currLeft;
        overhangWidth = prevLeft - currLeft;
      } else if (currRight > prevRight) {
        overhangLeft = prevRight;
        overhangWidth = currRight - prevRight;
      }

      // Spawn falling sliced overhang piece
      if (overhangWidth > 0) {
        this.audio.playSlice();
        const sliceEl = document.createElement('div');
        sliceEl.className = 'wt-block-sliced';
        sliceEl.style.left = `${overhangLeft}px`;
        sliceEl.style.width = `${overhangWidth}px`;
        sliceEl.style.bottom = `${targetBottom}px`;
        sliceEl.style.background = this.movingBlockEl ? this.movingBlockEl.style.background : '#38bdf8';
        this.towerWorldEl.appendChild(sliceEl);

        setTimeout(() => {
          if (sliceEl.parentNode) sliceEl.parentNode.removeChild(sliceEl);
        }, 450);
      }

      // Convert moving block into placed trimmed block
      if (this.movingBlockEl) {
        this.movingBlockEl.classList.remove('wt-block-moving');
        this.movingBlockEl.classList.add('wt-block-placed');
        this.movingBlockEl.style.left = `${overlapLeft}px`;
        this.movingBlockEl.style.width = `${overlap}px`;
        this.movingBlockEl.style.transition = 'none';

        // Display German word on placed block
        const textSpan = this.movingBlockEl.querySelector('.block-text');
        if (textSpan) textSpan.textContent = this.currentWord.de;
        this.movingBlockEl = null;
      }

      this.currentWidth = overlap;
      this.finalizePlacement(overlapLeft, overlap, targetLevel);
    }

    finalizePlacement(placedLeft, placedWidth, targetLevel) {
      // Record into stack
      this.stack.push({
        left: placedLeft,
        width: placedWidth,
        level: targetLevel,
        de: this.currentWord.de
      });

      this.level = targetLevel;
      this.score = this.level;

      // Update HUD
      if (this.hudScoreEl) {
        this.hudScoreEl.textContent = `${this.score}`;
      }

      // Camera Adjustment: Keep top 5-8 blocks and moving block in view
      this.updateCamera();

      // Setup next word & block
      setTimeout(() => {
        if (this.state === 'PLAYING') {
          this.setupNextRound();
        }
      }, 250);
    }

    updateCamera() {
      // If tower has more than 3 blocks, scroll camera so top block stays at comfortable height
      if (this.level >= 3) {
        const cameraY = (this.level - 2) * this.BLOCK_HEIGHT;
        if (this.towerWorldEl) {
          this.towerWorldEl.style.transform = `translateY(${cameraY}px)`;
        }
      }
    }

    handleTowerFall() {
      this.state = 'GAME_OVER';
      this.audio.playCollapse();
      this.showFeedback('TURM GEFALLEN!', 'wrong');

      // Tumble animation for fallen block
      if (this.movingBlockEl) {
        this.movingBlockEl.classList.add('wt-block-collapse');
        this.movingBlockEl = null;
      }

      // Show Game Over overlay
      setTimeout(() => {
        if (this.gameOverHeightEl) {
          this.gameOverHeightEl.textContent = `${this.score}`;
        }
        if (this.gameOverOverlayEl) {
          this.gameOverOverlayEl.classList.add('show');
        }
      }, 400);
    }
  }

  // Export to window for testing and initialization
  window.WortturmEvaluator = WortturmEvaluator;
  window.WortturmGame = WortturmGame;
  window.WORTTURM_VOCABULARY = WORTTURM_VOCABULARY;

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const game = new WortturmGame();
    window.__wortturmGameInstance = game;
    game.startNewGame();
  });
})();
