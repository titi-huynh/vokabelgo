/**
 * ==========================================================================
 * WORTCRUSH (Glass Crush Vocabulary Mini-Game) - VokabelGo
 * High-Fidelity Minimal 2.5D Arcade Preview
 * Core Loop: Look Vi -> Recall German -> Type -> Enter -> Shatter Glass -> Advance Forward
 * ==========================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. VOCABULARY POOL (29 A1/A2 German Words: Nouns with Articles, Verbs, Adjectives)
  // --------------------------------------------------------------------------
  const WORTCRUSH_VOCABULARY = [
    { vi: "căn hộ", de: "die Wohnung" },
    { vi: "nhà ga", de: "der Bahnhof" },
    { vi: "nhà bếp", de: "die Küche" },
    { vi: "trường học", de: "die Schule" },
    { vi: "làm việc", de: "arbeiten" },
    { vi: "lái xe", de: "fahren" },
    { vi: "mua", de: "kaufen" },
    { vi: "học", de: "lernen" },
    { vi: "đắt", de: "teuer" },
    { vi: "đẹp", de: "schön" },
    { vi: "đọc", de: "lesen" },
    { vi: "nhanh", de: "schnell" },
    { vi: "chậm", de: "langsam" },
    { vi: "cái bàn", de: "der Tisch" },
    { vi: "cái ghế", de: "der Stuhl" },
    { vi: "cuốn sách", de: "das Buch" },
    { vi: "thành phố", de: "die Stadt" },
    { vi: "nước", de: "das Wasser" },
    { vi: "uống", de: "trinken" },
    { vi: "ăn", de: "essen" },
    { vi: "bệnh viện", de: "das Krankenhaus" },
    { vi: "sân bay", de: "der Flughafen" },
    { vi: "bác sĩ", de: "der Arzt" },
    { vi: "bạn bè", de: "der Freund" },
    { vi: "câu hỏi", de: "die Frage" },
    { vi: "ngày mai", de: "morgen" },
    { vi: "hôm qua", de: "gestern" },
    { vi: "dễ", de: "einfach" },
    { vi: "khó", de: "schwierig" }
  ];

  // --------------------------------------------------------------------------
  // 2. VOCABULARY EVALUATOR
  // --------------------------------------------------------------------------
  class WortcrushEvaluator {
    static normalizeUmlaut(str) {
      if (!str) return '';
      return str
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/Ä/g, 'Ae')
        .replace(/Ö/g, 'Oe')
        .replace(/Ü/g, 'Ue');
    }

    static cleanSpaces(str) {
      if (!str) return '';
      return str.trim().replace(/\s+/g, ' ');
    }

    /**
     * Evaluates user input against target word:
     * - Returns { isCorrect: true, status: 'correct', reason: '...', feedback: '...' }
     * - Returns { isCorrect: false, status: 'near', reason: '...', feedback: '...' }
     * - Returns { isCorrect: false, status: 'wrong', reason: '...', feedback: '...' }
     */
    static evaluate(input, target) {
      const rawInput = this.cleanSpaces(input);
      if (!rawInput) {
        return {
          isCorrect: false,
          status: 'empty',
          reason: 'empty',
          feedback: 'Vui lòng nhập từ!'
        };
      }

      const normInput = this.normalizeUmlaut(rawInput);
      const normTarget = this.normalizeUmlaut(target);

      // 1. Exact match (case-sensitive) with umlaut equivalence
      if (normInput === normTarget) {
        return {
          isCorrect: true,
          status: 'correct',
          reason: 'exact',
          feedback: 'RICHTIG!'
        };
      }

      // Check if target is a noun phrase with article (der, die, das)
      const targetParts = normTarget.split(' ');
      const inputParts = normInput.split(' ');
      const articles = ['der', 'die', 'das'];

      const isTargetNoun = targetParts.length === 2 && articles.includes(targetParts[0].toLowerCase());

      if (isTargetNoun) {
        const targetArticle = targetParts[0];
        const targetNoun = targetParts[1];

        // Case A: Missing article entirely: e.g. "Wohnung" or "wohnung"
        if (inputParts.length === 1) {
          if (inputParts[0].toLowerCase() === targetNoun.toLowerCase()) {
            return {
              isCorrect: false,
              status: 'near',
              reason: 'missing_article',
              feedback: `Fast! → ${target}`
            };
          }
        }

        // Case B: Both article and noun present
        if (inputParts.length === 2) {
          const inputArt = inputParts[0].toLowerCase();
          const inputNoun = inputParts[1];

          // Subcase: Correct article, but noun is lowercase: e.g. "die wohnung"
          if (inputArt === targetArticle && inputNoun.toLowerCase() === targetNoun.toLowerCase()) {
            if (inputNoun !== targetNoun) {
              return {
                isCorrect: false,
                status: 'near',
                reason: 'case_sensitive',
                feedback: `Fast! → ${target}`
              };
            }
          }

          // Subcase: Wrong article: e.g. "der Wohnung" or "das Wohnung"
          if (articles.includes(inputArt) && inputNoun.toLowerCase() === targetNoun.toLowerCase()) {
            return {
              isCorrect: false,
              status: 'near',
              reason: 'wrong_article',
              feedback: `Sai Artikel! → ${target}`
            };
          }
        }
      } else {
        // Non-noun target (verb, adjective, adverb)
        // Check case-insensitive with umlaut equivalence
        if (normInput.toLowerCase() === normTarget.toLowerCase()) {
          return {
            isCorrect: true,
            status: 'correct',
            reason: 'case_insensitive',
            feedback: 'RICHTIG!'
          };
        }
      }

      // Other completely wrong word
      return {
        isCorrect: false,
        status: 'wrong',
        reason: 'wrong',
        feedback: 'Noch einmal!'
      };
    }
  }

  // --------------------------------------------------------------------------
  // 3. ZERO-DEPENDENCY WEB AUDIO API SYNTHESIZER
  // --------------------------------------------------------------------------
  class WortcrushAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;

      // Restore user audio preference
      try {
        const saved = localStorage.getItem('vokabelgo_wortcrush_sound');
        if (saved === 'off') this.muted = true;
      } catch (e) {}
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
      try {
        localStorage.setItem('vokabelgo_wortcrush_sound', this.muted ? 'off' : 'on');
      } catch (e) {}
      return this.muted;
    }

    // Light tone on correct enter
    playInputTone() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } catch (e) {}
    }

    // Whoosh when projectile rushes forward
    playWhoosh() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.18);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(1600, t + 0.18);
        filter.Q.value = 3.0;

        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      } catch (e) {}
    }

    // Sharp impact crack
    playCrack() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.05);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      } catch (e) {}
    }

    // Crystalline resonant glass shatter
    playShatter() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const freqs = [1760, 2480, 3520, 4800];

        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const dur = 0.22 + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), t);

          gain.gain.setValueAtTime(0.12 / (idx + 1), t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + dur);
        });
      } catch (e) {}
    }

    // Gentle soft negative feedback for wrong answers
    playWrong() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.setValueAtTime(170, t + 0.07);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
      } catch (e) {}
    }

    // Warm marimba-like attention chime for near correct
    playNearCorrect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(587, t + 0.1);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      } catch (e) {}
    }

    // Soft mechanical lock-in click when new glass settles
    playSettle() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      } catch (e) {}
    }
  }

  // --------------------------------------------------------------------------
  // 4. GLASS SHARD GEOMETRY & SVG DEFINITIONS
  // --------------------------------------------------------------------------
  // 16 interlocking polygon shards forming a 400x260 glass barrier with 0 gaps
  const GLASS_SHARDS_SPEC = [
    // 8 Inner Triangles (Radiating from Impact Center C(200, 130))
    { id: 'c1', points: '200,130 135,85 200,70', isInner: true },
    { id: 'c2', points: '200,130 200,70 265,85', isInner: true },
    { id: 'c3', points: '200,130 265,85 285,130', isInner: true },
    { id: 'c4', points: '200,130 285,130 265,175', isInner: true },
    { id: 'c5', points: '200,130 265,175 200,190', isInner: true },
    { id: 'c6', points: '200,130 200,190 135,175', isInner: true },
    { id: 'c7', points: '200,130 135,175 115,130', isInner: true },
    { id: 'c8', points: '200,130 115,130 135,85', isInner: true },

    // 8 Outer Quads (Connecting Inner Ring to Outer Boundary)
    { id: 'o1', points: '30,20 200,20 200,70 135,85', isInner: false },
    { id: 'o2', points: '200,20 370,20 265,85 200,70', isInner: false },
    { id: 'o3', points: '370,20 370,130 285,130 265,85', isInner: false },
    { id: 'o4', points: '370,130 370,240 265,175 285,130', isInner: false },
    { id: 'o5', points: '370,240 200,240 200,190 265,175', isInner: false },
    { id: 'o6', points: '200,240 30,240 135,175 200,190', isInner: false },
    { id: 'o7', points: '30,240 30,130 115,130 135,175', isInner: false },
    { id: 'o8', points: '30,130 30,20 135,85 115,130', isInner: false }
  ];

  // Pre-calculate shard centroids and explosion trajectories
  const PREPARED_SHARDS = GLASS_SHARDS_SPEC.map(spec => {
    const rawPairs = spec.points.split(' ').map(p => p.split(',').map(Number));
    let sumX = 0, sumY = 0;
    rawPairs.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
    });
    const cx = sumX / rawPairs.length;
    const cy = sumY / rawPairs.length;

    // Vector from impact center (200, 130)
    let vx = cx - 200;
    let vy = cy - 130;
    const mag = Math.sqrt(vx * vx + vy * vy) || 1;
    vx /= mag;
    vy /= mag;

    const travelDist = spec.isInner ? 140 : 220;
    const dx = Math.round(vx * travelDist);
    const dy = Math.round(vy * travelDist);
    const dz = Math.round((Math.random() - 0.5) * 80);
    const rotZ = Math.round(Math.atan2(vy, vx) * (180 / Math.PI) * 0.4);
    const rotX = Math.round((Math.random() - 0.5) * 50);
    const rotY = Math.round((Math.random() - 0.5) * 50);

    return {
      ...spec,
      cx,
      cy,
      dx,
      dy,
      dz,
      rotX,
      rotY,
      rotZ
    };
  });

  // --------------------------------------------------------------------------
  // 5. WORTCRUSH GAME ENGINE
  // --------------------------------------------------------------------------
  class WortcrushGame {
    constructor() {
      // Game state machine
      this.state = 'READY'; // READY, ANSWERING, FIRING, BREAKING, ADVANCING, SPAWNING, PAUSED, ENDED
      this.audio = new WortcrushAudio();

      this.distanz = 0;
      this.vocabIndex = 0;
      this.currentWord = null;
      this.promptStartTime = 0;

      // Pending timers for safe cleanup
      this.activeTimers = [];

      // DOM Elements
      this.el = {
        app: document.getElementById('wortcrush-app'),
        distanzVal: document.getElementById('hud-distanz-val'),
        btnSound: document.getElementById('btn-sound'),
        iconSoundOn: document.getElementById('icon-sound-on'),
        iconSoundOff: document.getElementById('icon-sound-off'),
        btnPause: document.getElementById('btn-pause'),
        btnEnd: document.getElementById('btn-end'),
        promptVi: document.getElementById('prompt-vietnamese'),
        viewport: document.getElementById('crush-viewport'),
        shakeLayer: document.getElementById('shake-layer'),
        tunnelStage: document.getElementById('tunnel-stage'),
        glassContainer: document.getElementById('glass-container'),
        impactRipple: document.getElementById('impact-ripple'),
        shardsContainer: document.getElementById('shards-container'),
        projectileOrb: document.getElementById('projectile-orb'),
        feedbackBanner: document.getElementById('feedback-banner'),
        inputForm: document.getElementById('crush-form'),
        inputWrapper: document.querySelector('.input-wrapper'),
        inputField: document.getElementById('crush-input'),
        btnSubmit: document.getElementById('btn-crush-submit'),
        inputHint: document.getElementById('input-hint'),
        umlautBar: document.getElementById('umlaut-bar'),
        pauseModal: document.getElementById('pause-modal'),
        pauseDistanzVal: document.getElementById('pause-distanz-val'),
        btnResume: document.getElementById('btn-resume'),
        btnPauseEnd: document.getElementById('btn-pause-end'),
        endModal: document.getElementById('end-modal'),
        endDistanzVal: document.getElementById('end-distanz-val'),
        endSummaryText: document.getElementById('end-summary-text'),
        btnRestart: document.getElementById('btn-restart')
      };

      this.initEvents();
      this.syncSoundIcon();
    }

    start() {
      this.distanz = 0;
      this.vocabIndex = 0;
      this.updateDistanzDisplay();
      this.clearAllTimers();
      this.renderSolidGlass();

      this.loadNextWord(false);
      this.state = 'ANSWERING';
      this.focusInput();
    }

    clearAllTimers() {
      this.activeTimers.forEach(id => clearTimeout(id));
      this.activeTimers = [];
    }

    setSafeTimeout(fn, ms) {
      const id = setTimeout(() => {
        this.activeTimers = this.activeTimers.filter(t => t !== id);
        fn();
      }, ms);
      this.activeTimers.push(id);
      return id;
    }

    initEvents() {
      // Form submit & Enter key
      this.el.inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      // Sound toggle
      this.el.btnSound.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        this.syncSoundIcon();
      });

      // Pause button
      this.el.btnPause.addEventListener('click', () => {
        this.pauseGame();
      });

      // Resume button
      this.el.btnResume.addEventListener('click', () => {
        this.resumeGame();
      });

      // End session buttons
      this.el.btnEnd.addEventListener('click', () => {
        this.endGame();
      });
      this.el.btnPauseEnd.addEventListener('click', () => {
        this.el.pauseModal.style.display = 'none';
        this.endGame();
      });

      // Restart button
      this.el.btnRestart.addEventListener('click', () => {
        this.el.endModal.style.display = 'none';
        this.start();
      });

      // German Umlaut Toolbar Quick Insert
      this.el.umlautBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-umlaut');
        if (!btn || this.state !== 'ANSWERING') return;
        const char = btn.getAttribute('data-char');
        this.insertUmlautChar(char);
      });

      // Global keyboard shortcut: Esc for pause/resume
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.state === 'PAUSED') {
            this.resumeGame();
          } else if (this.state === 'ANSWERING') {
            this.pauseGame();
          }
        }
      });
    }

    insertUmlautChar(char) {
      const input = this.el.inputField;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const val = input.value;
      input.value = val.substring(0, start) + char + val.substring(end);
      input.selectionStart = input.selectionEnd = start + char.length;
      input.focus();
    }

    syncSoundIcon() {
      if (this.audio.muted) {
        this.el.iconSoundOn.style.display = 'none';
        this.el.iconSoundOff.style.display = 'block';
      } else {
        this.el.iconSoundOn.style.display = 'block';
        this.el.iconSoundOff.style.display = 'none';
      }
    }

    updateDistanzDisplay() {
      this.el.distanzVal.textContent = this.distanz;
    }

    focusInput() {
      this.el.inputField.disabled = false;
      this.el.btnSubmit.disabled = false;
      this.el.inputField.focus();
    }

    lockInput() {
      this.el.inputField.disabled = true;
      this.el.btnSubmit.disabled = true;
    }

    // --------------------------------------------------------------------------
    // RENDER SOLID GLASS BARRIER (SVG)
    // --------------------------------------------------------------------------
    renderSolidGlass() {
      const polygonsSvg = PREPARED_SHARDS.map(s => {
        return `<polygon class="glass-shard-polygon" id="shard-${s.id}" points="${s.points}" />`;
      }).join('');

      const svgHtml = `
        <svg class="glass-svg" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Luminous Frosted Glass Gradient -->
            <linearGradient id="glassShineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.28)" />
              <stop offset="35%" stop-color="rgba(56, 189, 248, 0.12)" />
              <stop offset="70%" stop-color="rgba(2, 132, 199, 0.06)" />
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.08)" />
            </linearGradient>
            <!-- Diagonal Glass Glare Reflection -->
            <linearGradient id="glassReflectionGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.4)" />
              <stop offset="40%" stop-color="rgba(255, 255, 255, 0.0)" />
              <stop offset="60%" stop-color="rgba(255, 255, 255, 0.0)" />
              <stop offset="100%" stop-color="rgba(56, 189, 248, 0.2)" />
            </linearGradient>
          </defs>
          
          <!-- Glass Body formed by the 16 interlocking shards -->
          <g id="glass-mesh">${polygonsSvg}</g>

          <!-- Diagonal Glare Line Sheen -->
          <line x1="60" y1="20" x2="340" y2="240" stroke="url(#glassReflectionGrad)" stroke-width="2.5" stroke-linecap="round" opacity="0.45" />

          <!-- Center Sight Reticle / Barrier Glyph -->
          <circle cx="200" cy="130" r="14" class="glass-mark" stroke-dasharray="2 3" />
          <circle cx="200" cy="130" r="3" fill="#38bdf8" opacity="0.6" />
        </svg>
      `;

      this.el.glassContainer.innerHTML = svgHtml;
      this.el.glassContainer.className = 'glass-container';
    }

    // --------------------------------------------------------------------------
    // LOAD VOCABULARY WORD
    // --------------------------------------------------------------------------
    loadNextWord(animate = true) {
      if (this.vocabIndex >= WORTCRUSH_VOCABULARY.length) {
        this.vocabIndex = 0; // Loop cleanly for endless test
      }
      this.currentWord = WORTCRUSH_VOCABULARY[this.vocabIndex];
      this.vocabIndex++;

      const promptEl = this.el.promptVi;
      if (animate) {
        promptEl.classList.add('fade-out');
        this.setSafeTimeout(() => {
          promptEl.textContent = `“${this.currentWord.vi}”`;
          promptEl.classList.remove('fade-out');
          promptEl.classList.add('fade-in');
          this.setSafeTimeout(() => promptEl.classList.remove('fade-in'), 200);
        }, 150);
      } else {
        promptEl.textContent = `“${this.currentWord.vi}”`;
      }

      this.promptStartTime = performance.now();
    }

    // --------------------------------------------------------------------------
    // CORE INPUT & SUBMISSION HANDLER
    // --------------------------------------------------------------------------
    handleSubmit() {
      // Strict spam guard: only accept input when in ANSWERING state
      if (this.state !== 'ANSWERING') return;

      const inputVal = this.el.inputField.value;
      const result = WortcrushEvaluator.evaluate(inputVal, this.currentWord.de);

      if (result.status === 'empty') {
        this.triggerInputError(result.feedback);
        return;
      }

      if (result.status === 'wrong') {
        this.triggerInputError(result.feedback);
        this.audio.playWrong();
        return;
      }

      if (result.status === 'near') {
        this.triggerNearCorrect(result.feedback);
        this.audio.playNearCorrect();
        return;
      }

      if (result.isCorrect) {
        // Fast answer (< 2.5s) awards "PERFEKT!"
        const elapsed = (performance.now() - this.promptStartTime) / 1000;
        const isPerfekt = elapsed <= 2.5;

        this.triggerCorrectSequence(isPerfekt);
      }
    }

    triggerInputError(msg) {
      this.el.inputHint.textContent = msg;
      this.el.inputHint.className = 'input-hint hint-error';
      this.el.inputWrapper.classList.remove('input-error');
      void this.el.inputWrapper.offsetWidth; // Force CSS reflow
      this.el.inputWrapper.classList.add('input-error');

      this.setSafeTimeout(() => {
        this.el.inputWrapper.classList.remove('input-error');
      }, 300);
    }

    triggerNearCorrect(msg) {
      this.el.inputHint.textContent = msg;
      this.el.inputHint.className = 'input-hint hint-near';
      this.showFeedbackBanner(msg, 'banner-near', 1800);
    }

    // --------------------------------------------------------------------------
    // CORRECT HIT & SHATTER CRUSH SEQUENCE (≤ 1.0s Total Loop)
    // --------------------------------------------------------------------------
    triggerCorrectSequence(isPerfekt) {
      this.state = 'FIRING';
      this.lockInput();

      // Feedback banner
      if (isPerfekt) {
        this.showFeedbackBanner('PERFEKT! ⚡', 'banner-perfekt', 1400);
      } else {
        this.showFeedbackBanner('RICHTIG! ✨', 'banner-richtig', 1200);
      }

      this.el.inputHint.textContent = 'RICHTIG!';
      this.el.inputHint.className = 'input-hint hint-correct';

      // 1. Audio: input tone & projectile whoosh
      this.audio.playInputTone();
      this.setSafeTimeout(() => this.audio.playWhoosh(), 40);

      // 2. Projectile Launch: from bottom center (50%, 90%) to glass center (50%, 48%)
      const orb = this.el.projectileOrb;
      orb.style.display = 'block';
      orb.style.left = '50%';
      orb.style.top = '92%';
      orb.style.opacity = '1';
      orb.style.transform = 'translate(-50%, -50%) scale(0.6)';

      const startTime = performance.now();
      const flightDuration = 200; // 200ms flight time

      const animateProjectile = (now) => {
        const progress = Math.min((now - startTime) / flightDuration, 1);
        // Accelerating ease-in curve
        const ease = Math.pow(progress, 2.2);

        const currentY = 92 - (ease * 44); // 92% down to 48%
        const currentScale = 0.6 + ease * 0.55;

        orb.style.top = `${currentY}%`;
        orb.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

        if (progress < 1) {
          requestAnimationFrame(animateProjectile);
        } else {
          // Projectile impact!
          orb.style.display = 'none';
          this.triggerGlassShatter();
        }
      };

      requestAnimationFrame(animateProjectile);
    }

    // --------------------------------------------------------------------------
    // GLASS SHATTER & IMPACT DYNAMICS
    // --------------------------------------------------------------------------
    triggerGlassShatter() {
      this.state = 'BREAKING';

      // Audio: sharp crack + shattering crystal
      this.audio.playCrack();
      this.setSafeTimeout(() => this.audio.playShatter(), 25);

      // Impact Shockwave Ripple
      this.el.impactRipple.classList.remove('active');
      void this.el.impactRipple.offsetWidth;
      this.el.impactRipple.classList.add('active');

      // Micro screen-shake
      this.el.shakeLayer.classList.remove('micro-shake');
      void this.el.shakeLayer.offsetWidth;
      this.el.shakeLayer.classList.add('micro-shake');

      // Crack seam flash on intact polygons
      const currentPolygons = this.el.glassContainer.querySelectorAll('.glass-shard-polygon');
      currentPolygons.forEach(p => p.classList.add('crack-flash'));

      // Populate flying shards in shards container
      this.shardsContainerHtml = PREPARED_SHARDS.map(s => {
        return `<polygon class="anim-shard" id="anim-${s.id}" points="${s.points}" style="transform-origin: ${s.cx}px ${s.cy}px;" />`;
      }).join('');

      this.el.shardsContainer.innerHTML = `
        <svg class="flying-shard-svg" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glassShineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.45)" />
              <stop offset="35%" stop-color="rgba(56, 189, 248, 0.3)" />
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.15)" />
            </linearGradient>
          </defs>
          ${this.shardsContainerHtml}
        </svg>
      `;

      // Hide the solid glass container now that shards are alive
      this.el.glassContainer.style.opacity = '0';

      // Trigger shard trajectory transforms on next frame
      requestAnimationFrame(() => {
        PREPARED_SHARDS.forEach(s => {
          const el = document.getElementById(`anim-${s.id}`);
          if (el) {
            el.style.transform = `translate3d(${s.dx}px, ${s.dy}px, ${s.dz}px) rotate(${s.rotZ}deg) rotateX(${s.rotX}deg) rotateY(${s.rotY}deg) scale(0.8)`;
            el.style.opacity = '0';
          }
        });
      });

      // Spawn 12 micro debris spark particles
      this.spawnDebrisSparks();

      // At 200ms into break: Camera pushes forward (tunnel velocity pulse)
      this.setSafeTimeout(() => {
        this.state = 'ADVANCING';
        this.el.tunnelStage.classList.add('camera-advancing');
      }, 190);

      // At 460ms: Shards cleanup & Spawn new glass from distance
      this.setSafeTimeout(() => {
        this.spawnNewGlass();
      }, 450);
    }

    spawnDebrisSparks() {
      const container = this.el.shardsContainer;
      for (let i = 0; i < 12; i++) {
        const spark = document.createElement('div');
        spark.className = 'debris-spark';
        const size = 3 + Math.random() * 4;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.left = '50%';
        spark.style.top = '50%';

        const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.4;
        const dist = 70 + Math.random() * 90;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        container.appendChild(spark);

        requestAnimationFrame(() => {
          spark.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
          spark.style.opacity = '0';
        });
      }
    }

    // --------------------------------------------------------------------------
    // SPAWN NEW GLASS FROM HORIZON & ADVANCE NEXT ROUND
    // --------------------------------------------------------------------------
    spawnNewGlass() {
      this.state = 'SPAWNING';

      // Clean up shards container
      this.el.shardsContainer.innerHTML = '';

      // Increment Distanz (+1)
      this.distanz += 1;
      this.updateDistanzDisplay();
      this.el.distanzVal.classList.add('pop');
      this.setSafeTimeout(() => this.el.distanzVal.classList.remove('pop'), 250);

      // Render fresh solid glass in deep horizon state
      this.renderSolidGlass();
      this.el.glassContainer.className = 'glass-container spawning';

      // Load next vocabulary prompt in background
      this.loadNextWord(true);

      // Rapidly glide into position (320ms)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.el.glassContainer.className = 'glass-container spawn-settle';
          this.audio.playSettle();
        });
      });

      // Complete cycle at ~850ms
      this.setSafeTimeout(() => {
        this.el.tunnelStage.classList.remove('camera-advancing');

        // Reset input for next prompt
        this.el.inputField.value = '';
        this.el.inputHint.textContent = '';
        this.el.inputHint.className = 'input-hint';

        this.focusInput();
        this.state = 'ANSWERING';
      }, 350);
    }

    showFeedbackBanner(text, className, duration = 1200) {
      const banner = this.el.feedbackBanner;
      banner.textContent = text;
      banner.className = `feedback-banner show ${className}`;

      this.setSafeTimeout(() => {
        banner.className = 'feedback-banner';
      }, duration);
    }

    // --------------------------------------------------------------------------
    // PAUSE & END GAME STATES
    // --------------------------------------------------------------------------
    pauseGame() {
      if (this.state === 'ENDED' || this.state === 'PAUSED') return;
      this.prevState = this.state;
      this.state = 'PAUSED';
      this.lockInput();

      this.el.pauseDistanzVal.textContent = this.distanz;
      this.el.pauseModal.style.display = 'flex';
    }

    resumeGame() {
      if (this.state !== 'PAUSED') return;
      this.el.pauseModal.style.display = 'none';

      // Restore to answering or spawn state
      this.state = 'ANSWERING';
      this.focusInput();
    }

    endGame() {
      this.state = 'ENDED';
      this.clearAllTimers();
      this.lockInput();

      this.el.endDistanzVal.textContent = this.distanz;
      this.el.endSummaryText.textContent = `${this.distanz} ${this.distanz === 1 ? 'Wort' : 'Wörter'} geschafft`;
      this.el.endModal.style.display = 'flex';
    }
  }

  // --------------------------------------------------------------------------
  // 6. INITIALIZATION & EXPOSURE FOR TESTS
  // --------------------------------------------------------------------------
  let game = null;

  document.addEventListener('DOMContentLoaded', () => {
    game = new WortcrushGame();
    game.start();

    // Expose for automated acceptance test suites
    window.__wortcrushGameInstance = game;
  });

  // Global exports
  window.WortcrushEvaluator = WortcrushEvaluator;
  window.WORTCRUSH_VOCABULARY = WORTCRUSH_VOCABULARY;
  window.WortcrushGame = WortcrushGame;

})();
