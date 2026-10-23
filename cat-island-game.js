/**
 * VokabelGo Cat Island · Main Gameplay Engine (cat-island-game.js)
 * Implements full game loop, customer order queues, interactive exercises,
 * tutorial, story events, new knowledge mini-lessons, Web Audio synthesis,
 * honest TTS listening, and persistent profile state.
 */

import scene from './cat-island-scene.js';

(function() {
  'use strict';

  // --- Versioned Storage Keys ---
  const PROFILE_KEY = 'vokabelgo_cat_island_profile_v1';

  // --- Sound Synthesizer via Web Audio API ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
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

    setEnabled(val) {
      this.enabled = !!val;
    }

    playTone(freq, duration, type = 'sine', gainVal = 0.15) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playChime() {
      this.playTone(523.25, 0.12, 'triangle', 0.2); // C5
      setTimeout(() => this.playTone(659.25, 0.18, 'triangle', 0.2), 100); // E5
      setTimeout(() => this.playTone(783.99, 0.35, 'triangle', 0.25), 200); // G5
    }

    playWrong() {
      this.playTone(220, 0.18, 'sawtooth', 0.15);
      setTimeout(() => this.playTone(174.61, 0.25, 'sawtooth', 0.15), 120);
    }

    playClick() {
      this.playTone(880, 0.05, 'sine', 0.1);
    }

    playMeow() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        const t = this.ctx.currentTime;
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(550, t + 0.35);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(t + 0.4);
      } catch (e) {}
    }

    playFanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 0.25, 'triangle', 0.2), idx * 120);
      });
    }
  }

  // --- TTS Engine with Honest Browser Fallback ---
  class TTSEngine {
    constructor() {
      this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
      this.voice = null;
      this.checked = false;
      this.initVoice();
    }

    initVoice() {
      if (!this.synth) return;
      const findGerman = () => {
        const voices = this.synth.getVoices();
        this.voice = voices.find(v => v.lang.startsWith('de')) || null;
        this.checked = true;
      };
      findGerman();
      if (!this.voice && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = findGerman;
      }
    }

    isAvailable() {
      if (!this.synth) return false;
      if (!this.checked) this.initVoice();
      return !!this.voice;
    }

    speak(text) {
      if (!this.synth || !text) return false;
      try {
        this.synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (this.voice) utter.voice = this.voice;
        utter.lang = 'de-DE';
        utter.rate = 0.9;
        this.synth.speak(utter);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  // --- Main Game Controller ---
  class CatIslandGame {
    constructor() {
      this.sound = new SoundEngine();
      this.tts = new TTSEngine();

      this.profile = this.loadProfile();
      this.learningSession = null;
      this.eventSession = null;

      // Runtime Game State
      this.mode = 'calm'; // 'calm' (Chợ sớm) | 'rush' (Chợ đông)
      this.deckId = '';
      this.coins = 0;
      this.ordersServed = 0;
      this.resolvedOrdersCount = 0; // Served + Skipped
      this.targetOrdersCount = 12;
      this.combo = 0;
      this.maxCombo = 0;
      this.rushTimeLeft = 120.0;
      this.rushMaxTime = 120.0;

      this.paused = false;
      this.isRoundActive = false;
      this.isEventActive = false;
      this.lastFrameTime = performance.now();

      // Cancellable Game Action Scheduler (freezes on pause/quit)
      this.pendingActions = [];

      // Customers & Orders
      // Each customer slot holds: { id, name, avatar, desc, question, isResolving: false, resolved: false, selectedTokens: [] }
      this.customers = new Map();
      this.activeCustomerId = null;
      this.nextCustomerNumber = 1;

      // Multiplier bonus from story events
      this.coinMultiplier = 1;
      this.multiplierOrdersLeft = 0;

      // Story Events Tracking
      this.eventTriggeredThisRound = false;
      this.roundCount = this.profile.totalShifts || 0;

      // UI Elements references
      this.ui = {};
    }

    loadProfile() {
      const defaultProfile = {
        version: 1,
        totalShifts: 0,
        coins: 0,
        bestScores: { calm: 0, rush: 0 },
        selectedCosmetic: 'lantern',
        unlockedCosmetics: ['lantern', 'flags'],
        helperUnlocked: false,
        soundEnabled: true,
        lastDeck: '',
        lastMode: 'calm'
      };
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(PROFILE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultProfile, ...parsed };
          }
        }
      } catch (e) {}
      return defaultProfile;
    }

    saveProfile() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
        }
      } catch (e) {}
    }

    // --- Cancellable Action Scheduler ---
    scheduleAction(delayMs, callback, allowInEvent = false) {
      const action = {
        timeRemaining: delayMs,
        callback: callback,
        cancelled: false,
        allowInEvent: !!allowInEvent
      };
      this.pendingActions.push(action);
      return action;
    }

    clearScheduledActions() {
      this.pendingActions.forEach(a => a.cancelled = true);
      this.pendingActions = [];
    }

    init() {
      this.cacheDOMElements();
      this.bindEvents();
      this.applyProfileUI();

      // Initialize 3D scene
      const sceneContainer = document.getElementById('scene-container');
      scene.init(sceneContainer, {
        onCustomerClick: (id) => this.selectCustomer(id)
      });
      scene.setCosmetic(this.profile.selectedCosmetic);
      scene.setHelperUnlocked(this.profile.helperUnlocked);

      // Populate Deck Catalog
      this.populateDecks();

      // Start continuous delta-time loop
      requestAnimationFrame((now) => this.tick(now));
    }

    cacheDOMElements() {
      this.ui = {
        // Top HUD
        statCoins: document.getElementById('stat-coins'),
        statServed: document.getElementById('stat-served'),
        statComboPill: document.getElementById('stat-combo-pill'),
        statCombo: document.getElementById('stat-combo'),
        statTimerPill: document.getElementById('stat-timer-pill'),
        statTimer: document.getElementById('stat-timer'),
        hudModeTag: document.getElementById('hud-mode-tag'),
        btnSoundToggle: document.getElementById('btn-sound-toggle'),
        soundIcon: document.getElementById('sound-icon'),
        btnPause: document.getElementById('btn-pause'),
        coachmark: document.getElementById('coachmark'),
        coachmarkText: document.getElementById('coachmark-text'),
        customerDockRail: document.getElementById('customer-dock-rail'),

        // Order Panel
        orderPanel: document.getElementById('order-panel'),
        orderAvatar: document.getElementById('order-avatar'),
        orderCustomerName: document.getElementById('order-customer-name'),
        orderCustomerDesc: document.getElementById('order-customer-desc'),
        orderTypeBadge: document.getElementById('order-type-badge'),
        orderPrompt: document.getElementById('order-prompt'),
        orderTargetWord: document.getElementById('order-target-word'),
        orderExampleBox: document.getElementById('order-example-box'),
        orderExampleText: document.getElementById('order-example-text'),
        orderListenRow: document.getElementById('order-listen-row'),
        btnListenPlay: document.getElementById('btn-listen-play'),
        btnListenFallback: document.getElementById('btn-listen-fallback'),
        orderOptionsGrid: document.getElementById('order-options-grid'),
        orderInputGroup: document.getElementById('order-input-group'),
        orderInput: document.getElementById('order-input'),
        orderTokensGroup: document.getElementById('order-tokens-group'),
        orderTokensChosen: document.getElementById('order-tokens-chosen'),
        orderTokensPool: document.getElementById('order-tokens-pool'),
        orderFeedback: document.getElementById('order-feedback'),
        btnOrderHint: document.getElementById('btn-order-hint'),
        btnOrderSkip: document.getElementById('btn-order-skip'),
        btnOrderSubmit: document.getElementById('btn-order-submit'),

        // Modals
        modalStart: document.getElementById('modal-start'),
        deckSelect: document.getElementById('deck-select'),
        modeOptCalm: document.getElementById('mode-opt-calm'),
        modeOptRush: document.getElementById('mode-opt-rush'),
        groupWeakOnly: document.getElementById('group-weak-only'),
        chkWeakOnly: document.getElementById('chk-weak-only'),
        btnStartGame: document.getElementById('btn-start-game'),
        helperTitle: document.getElementById('helper-title'),
        helperDesc: document.getElementById('helper-desc'),
        cosmeticCardLotus: document.getElementById('cosmetic-card-lotus'),
        cosmeticLabelLotus: document.getElementById('cosmetic-label-lotus'),

        modalEvent: document.getElementById('modal-event'),
        eventTitle: document.getElementById('event-title'),
        eventHeroTitle: document.getElementById('event-hero-title'),
        eventHeroText: document.getElementById('event-hero-text'),
        eventChoicesGrid: document.getElementById('event-choices-grid'),
        eventChallengeBox: document.getElementById('event-challenge-box'),
        eventChallengePrompt: document.getElementById('event-challenge-prompt'),
        eventChallengeOptions: document.getElementById('event-challenge-options'),
        eventFeedback: document.getElementById('event-feedback'),
        btnEventSkip: document.getElementById('btn-event-skip'),
        btnEventContinue: document.getElementById('btn-event-continue'),

        modalLesson: document.getElementById('modal-lesson'),
        lessonApplySection: document.getElementById('lesson-apply-section'),
        btnLessonPackTakeaway: document.getElementById('btn-lesson-pack-takeaway'),
        btnLessonPackDinein: document.getElementById('btn-lesson-pack-dinein'),
        lessonFeedback: document.getElementById('lesson-feedback'),
        btnLessonContinue: document.getElementById('btn-lesson-continue'),

        modalPause: document.getElementById('modal-pause'),
        btnResumeGame: document.getElementById('btn-resume-game'),
        btnQuitToStart: document.getElementById('btn-quit-to-start'),

        modalResults: document.getElementById('modal-results'),
        resCoins: document.getElementById('res-coins'),
        resOrders: document.getElementById('res-orders'),
        resDistinct: document.getElementById('res-distinct'),
        resIndependent: document.getElementById('res-independent'),
        resAccuracyLine: document.getElementById('res-accuracy-line'),
        resWeakList: document.getElementById('res-weak-list'),
        resHelperUnlockBanner: document.getElementById('res-helper-unlock-banner'),
        btnResWeak: document.getElementById('btn-res-weak'),
        btnResChangeDeck: document.getElementById('btn-res-change-deck'),
        btnResNewShift: document.getElementById('btn-res-new-shift')
      };
    }

    applyProfileUI() {
      this.sound.setEnabled(this.profile.soundEnabled);
      this.ui.soundIcon.textContent = this.profile.soundEnabled ? '🔊' : '🔇';
      this.ui.statCoins.textContent = this.profile.coins;
      const profileSummary = document.getElementById('profile-summary');
      if (profileSummary) profileSummary.textContent = `Ví: ${this.profile.coins} xu · Đã hoàn thành ${this.profile.totalShifts} phiên chợ`;
      if (!this.isRoundActive) {
        this.mode = this.profile.lastMode === 'rush' ? 'rush' : 'calm';
        for (const [mode, button] of [['calm', this.ui.modeOptCalm], ['rush', this.ui.modeOptRush]]) {
          button.classList.toggle('active', this.mode === mode);
          button.setAttribute('aria-checked', String(this.mode === mode));
        }
      }
      document.querySelectorAll('.cosmetic-card').forEach(button => {
        const selected = button.dataset.cosmetic === this.profile.selectedCosmetic;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-checked', String(selected));
      });

      if (this.profile.helperUnlocked) {
        this.ui.helperTitle.textContent = 'Mèo Phụ Việc: Đã hoạt động! 🐾';
        this.ui.helperDesc.textContent = 'Bé mèo tam thể đang đứng quầy phụ gói hàng cho các thuyền khách.';
      }

      // Check Lotus unlock status
      const lotusUnlocked = this.profile.unlockedCosmetics && this.profile.unlockedCosmetics.includes('lotus');
      if (lotusUnlocked) {
        this.ui.cosmeticCardLotus.classList.remove('locked');
        this.ui.cosmeticLabelLotus.textContent = 'Hoa sen nổi';
      } else {
        this.ui.cosmeticCardLotus.classList.add('locked');
        this.ui.cosmeticLabelLotus.textContent = 'Sen nổi (Khóa)';
      }

      // Check weak words in history
      const hist = window.CatIslandLearning ? window.CatIslandLearning.createSession({ limit: 1 }).historical : null;
      if (hist && hist.cards && Object.values(hist.cards).some(c => c.needsReview)) {
        this.ui.groupWeakOnly.style.display = 'block';
      }
    }

    bindEvents() {
      // Sound Toggle
      this.ui.btnSoundToggle.addEventListener('click', () => {
        this.profile.soundEnabled = !this.profile.soundEnabled;
        this.sound.setEnabled(this.profile.soundEnabled);
        this.ui.soundIcon.textContent = this.profile.soundEnabled ? '🔊' : '🔇';
        this.saveProfile();
        this.sound.playClick();
      });

      // Pause Game
      this.ui.btnPause.addEventListener('click', () => this.togglePause(true));
      this.ui.btnResumeGame.addEventListener('click', () => this.togglePause(false));
      this.ui.btnQuitToStart.addEventListener('click', () => {
        this.togglePause(false);
        this.abandonRound();
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.isRoundActive) {
            this.togglePause(!this.paused);
          }
        } else if (e.key === 'Enter') {
          if (e.target === this.ui.orderInput && !this.ui.orderPanel.classList.contains('hidden') && !this.paused && !this.isEventActive) {
            e.preventDefault();
            this.submitCurrentOrder();
          }
        }
      });

      // Mode Selector in Start Modal
      this.ui.modeOptCalm.addEventListener('click', () => {
        this.mode = 'calm';
        this.ui.modeOptCalm.classList.add('active');
        this.ui.modeOptCalm.setAttribute('aria-checked', 'true');
        this.ui.modeOptRush.classList.remove('active');
        this.ui.modeOptRush.setAttribute('aria-checked', 'false');
        this.sound.playClick();
      });
      this.ui.modeOptRush.addEventListener('click', () => {
        this.mode = 'rush';
        this.ui.modeOptRush.classList.add('active');
        this.ui.modeOptRush.setAttribute('aria-checked', 'true');
        this.ui.modeOptCalm.classList.remove('active');
        this.ui.modeOptCalm.setAttribute('aria-checked', 'false');
        this.sound.playClick();
      });

      // Cosmetic selection cards
      document.querySelectorAll('.cosmetic-card').forEach((card) => {
        card.addEventListener('click', () => {
          const cosmetic = card.dataset.cosmetic;
          if (cosmetic === 'lotus' && (!this.profile.unlockedCosmetics || !this.profile.unlockedCosmetics.includes('lotus'))) {
            // Locked: requires unlock via Barter event
            this.sound.playWrong();
            return;
          }
          document.querySelectorAll('.cosmetic-card').forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('active');
          card.setAttribute('aria-checked', 'true');
          this.profile.selectedCosmetic = cosmetic;
          scene.setCosmetic(cosmetic);
          this.saveProfile();
          this.sound.playClick();
        });
      });

      // Start Shift Button
      this.ui.btnStartGame.addEventListener('click', () => {
        this.sound.playClick();
        this.startRound();
      });

      // Order Panel Inputs & Actions
      this.ui.btnOrderSubmit.addEventListener('click', () => this.submitCurrentOrder());
      this.ui.btnOrderHint.addEventListener('click', () => this.requestHint());
      this.ui.btnOrderSkip.addEventListener('click', () => this.skipOrder());

      // Umlaut bar buttons
      document.querySelectorAll('.umlaut-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const char = btn.dataset.char;
          const input = this.ui.orderInput;
          const start = input.selectionStart || input.value.length;
          const end = input.selectionEnd || input.value.length;
          input.value = input.value.substring(0, start) + char + input.value.substring(end);
          input.focus();
          input.setSelectionRange(start + 1, start + 1);
          this.sound.playClick();
        });
      });

      // Listening Buttons
      this.ui.btnListenPlay.addEventListener('click', () => {
        const cust = this.customers.get(this.activeCustomerId);
        if (cust && cust.question?.speechText) {
          const spoken = this.tts.speak(cust.question.speechText);
          if (!spoken) {
            this.fallbackListening();
          }
        }
      });
      this.ui.btnListenFallback.addEventListener('click', () => {
        this.fallbackListening();
      });

      // Results screen actions
      this.ui.btnResNewShift.addEventListener('click', () => {
        this.ui.modalResults.classList.add('hidden');
        this.startRound();
      });
      this.ui.btnResChangeDeck.addEventListener('click', () => {
        this.ui.modalResults.classList.add('hidden');
        this.ui.modalResults.setAttribute('aria-hidden', 'true');
        this.ui.modalStart.classList.remove('hidden');
        this.ui.modalStart.setAttribute('aria-hidden', 'false');
        this.applyProfileUI();
      });
      this.ui.btnResWeak.addEventListener('click', () => {
        this.ui.modalResults.classList.add('hidden');
        this.ui.chkWeakOnly.checked = true;
        this.startRound();
      });
    }

    populateDecks() {
      if (!window.CatIslandLearning) {
        setTimeout(() => this.populateDecks(), 300);
        return;
      }

      const cat = window.CatIslandLearning.catalog();
      const deckNote = document.getElementById('deck-note');
      if (deckNote) deckNote.textContent = cat.excluded ? `${cat.excluded} thẻ chưa phù hợp với dạng luyện này được giữ ngoài phiên chợ. Bộ từ gốc vẫn giữ nguyên.` : '';
      const select = this.ui.deckSelect;
      select.innerHTML = '';

      cat.decks.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.label} (${d.count} từ)`;
        if (d.id === this.profile.lastDeck) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }

    togglePause(pauseVal) {
      if (!this.isRoundActive) return;
      this.paused = pauseVal;
      if (this.paused) {
        scene.pause();
        this.ui.modalPause.classList.remove('hidden');
        this.ui.modalPause.setAttribute('aria-hidden', 'false');
        this.tts.synth?.cancel();
        this.ui.btnResumeGame.focus();
      } else {
        scene.resume();
        this.ui.modalPause.classList.add('hidden');
        this.ui.modalPause.setAttribute('aria-hidden', 'true');
        this.lastFrameTime = performance.now();
      }
    }

    // --- Delta-Time Continuous Tick Loop ---
    tick(now) {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;

      // Update active game timers when unpaused and round is running
      if (this.isRoundActive && !this.paused) {
        // Advance scheduled game actions (freeze ordinary gameplay actions during story events)
        for (const act of this.pendingActions.slice()) {
          if (!this.isRoundActive) break;
          const i = this.pendingActions.indexOf(act);
          if (i < 0) continue;
          if (act.cancelled) {
            this.pendingActions.splice(i, 1);
            continue;
          }
          if (this.isEventActive && !act.allowInEvent) {
            continue;
          }
          act.timeRemaining -= dt * 1000;
          if (act.timeRemaining <= 0) {
            this.pendingActions.splice(i, 1);
            act.callback();
          }
        }

        // Rush mode timer countdown (only active during ordinary gameplay, frozen during events)
        if (this.mode === 'rush' && !this.isEventActive) {
          this.rushTimeLeft -= dt;
          if (this.rushTimeLeft <= 0) {
            this.rushTimeLeft = 0;
            this.updateHUD();
            this.finishRound();
          } else {
            this.updateHUD();
          }
        }

        // Trigger story event once per round (introduced after first 2 orders served, wait for pending delivery)
        const hasPendingDelivery = Array.from(this.customers.values()).some(c => c.isResolving);
        if (this.isRoundActive && !this.eventTriggeredThisRound && this.ordersServed >= 2 && !this.isEventActive && !hasPendingDelivery) {
          this.eventTriggeredThisRound = true;
          this.triggerStoryEvent();
        }
      }

      // Always request next frame so RAF loop never dies
      requestAnimationFrame((n) => this.tick(n));
    }

    // --- Start Round Flow ---
    startRound() {
      this.paused = false;
      this.lastFrameTime = performance.now();
      scene.endChase?.();
      scene.resetRound?.();
      scene.resume();
      this.deckId = this.ui.deckSelect.value;
      const weakOnly = this.ui.chkWeakOnly.checked;

      this.profile.lastDeck = this.deckId;
      this.profile.lastMode = this.mode;
      this.saveProfile();

      // Create Session with CatIslandLearning
      this.learningSession = window.CatIslandLearning.createSession({
        deck: this.deckId,
        mode: this.mode,
        limit: this.mode === 'calm' ? 12 : 80,
        weakOnly: weakOnly,
        canListen: this.tts.isAvailable()
      });
      if (!this.learningSession.pool.length) {
        this.ui.helperDesc.textContent = 'Bộ này chưa có thẻ phù hợp. Chọn một bộ từ khác để mở chợ nhé.';
        return;
      }

      this.isRoundActive = true;
      this.isEventActive = false;
      this.coins = 0;
      this.ordersServed = 0;
      this.resolvedOrdersCount = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.rushTimeLeft = 120.0;
      this.coinMultiplier = 1;
      this.multiplierOrdersLeft = 0;
      this.eventTriggeredThisRound = false;

      this.clearScheduledActions();

      // Close modals
      this.ui.modalStart.classList.add('hidden');
      this.ui.modalStart.setAttribute('aria-hidden', 'true');
      this.ui.modalResults.classList.add('hidden');
      this.ui.modalResults.setAttribute('aria-hidden', 'true');
      this.ui.modalPause.classList.add('hidden');
      this.ui.modalPause.setAttribute('aria-hidden', 'true');
      this.ui.modalEvent.classList.add('hidden');
      this.ui.modalLesson.classList.add('hidden');

      // Clear existing customers
      this.customers.forEach(c => scene.removeCustomerBoat(c.id));
      this.customers.clear();
      this.activeCustomerId = null;
      this.ui.orderPanel.classList.add('hidden');
      this.ui.orderPanel.setAttribute('aria-hidden', 'true');

      // Update HUD
      this.updateHUD();

      // Tutorial: First round begins with exactly ONE customer boat
      const initialCapacity = this.profile.totalShifts === 0 ? 1 : 2;
      this.replenishCustomers(initialCapacity);

      if (this.profile.totalShifts === 0) {
        this.showCoachmark('Nhấp vào thuyền khách để nhận đơn hàng đầu tiên!');
      }

      this.sound.playChime();
    }

    replenishCustomers(maxCapacity = null) {
      if (!this.isRoundActive || this.isEventActive) return;

      const capacity = maxCapacity || (this.mode === 'calm' ? 2 : 3);
      const catProfiles = [
        { name: 'Mèo Cam Mướp', avatar: '🐱', desc: 'Ghe tam bản gỗ mít' },
        { name: 'Mèo Tam Thể', avatar: '😸', desc: 'Ghe mui xanh ngọc' },
        { name: 'Mèo Đen Tuxedo', avatar: '😺', desc: 'Ghe nâu chở trái cây' }
      ];

      while (this.customers.size < capacity) {
        // Find an unoccupied slot index from active customers
        const occupiedSlots = new Set();
        this.customers.forEach(c => {
          if (c.slotIndex !== undefined) occupiedSlots.add(c.slotIndex);
        });
        let slotIdx = -1;
        for (let s = 0; s < 3; s++) {
          if (!occupiedSlots.has(s)) {
            slotIdx = s;
            break;
          }
        }
        if (slotIdx < 0) {
          break;
        }

        const question = this.learningSession.nextQuestion();
        if (!question) {
          // If all distinct cards in a tiny deck are currently pending on visible boats,
          // do NOT finish round early; wait for player to resolve one!
          break;
        }

        const customerId = `cust-${this.nextCustomerNumber++}`;
        const profile = catProfiles[slotIdx % catProfiles.length];

        const customer = {
          id: customerId,
          name: profile.name,
          avatar: profile.avatar,
          desc: profile.desc,
          slotIndex: slotIdx,
          question: question,
          selectedTokens: [],
          isResolving: false,
          resolved: false
        };

        this.customers.set(customerId, customer);
        scene.spawnCustomerBoat(customer, slotIdx);
      }

      this.renderDockRail();
    }

    renderDockRail() {
      const rail = this.ui.customerDockRail;
      rail.innerHTML = '';

      this.customers.forEach((customer) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `customer-dock-btn ${customer.id === this.activeCustomerId ? 'active' : ''}`;
        btn.setAttribute('aria-label', `Chọn ${customer.name}`);
        btn.innerHTML = `
          <span class="btn-cat-avatar" aria-hidden="true">${customer.avatar}</span>
          <span class="btn-cat-name">${customer.name}</span>
          <span class="btn-status-badge">Đang chờ</span>
        `;
        btn.addEventListener('click', () => {
          this.selectCustomer(customer.id);
        });
        rail.appendChild(btn);
      });
    }

    selectCustomer(customerId) {
      if (!this.isRoundActive || this.paused || this.isEventActive) return;
      const customer = this.customers.get(customerId);
      if (!customer || customer.resolved || customer.isResolving) return;
      const previous = this.customers.get(this.activeCustomerId);
      if (previous && !previous.resolved && !previous.isResolving && this.ui.orderInputGroup.style.display !== 'none') previous.draft = this.ui.orderInput.value;

      this.activeCustomerId = customerId;
      this.renderDockRail();

      // Tutorial guidance update
      if (this.profile.totalShifts === 0 && this.ordersServed === 0) {
        this.showCoachmark('Chọn hoặc gõ đáp án đúng để đóng gói hàng!');
      } else {
        this.hideCoachmark();
      }

      // Populate Order Panel
      const q = customer.question;
      this.ui.orderCustomerName.textContent = customer.name;
      this.ui.orderCustomerDesc.textContent = customer.desc;
      this.ui.orderAvatar.textContent = customer.avatar;

      // Type Badge
      const typeLabels = {
        recall: 'Gõ từ vựng',
        meaning: 'Chọn nghĩa',
        context: 'Điền câu',
        order: 'Xếp từ',
        listen: 'Nghe phát âm'
      };
      this.ui.orderTypeBadge.className = `order-type-badge ${q.type}`;
      this.ui.orderTypeBadge.textContent = typeLabels[q.type] || q.type;

      // Prompts & Text Content (Safe textContent)
      this.ui.orderPrompt.textContent = q.type === 'recall' ? 'Gõ từ tiếng Đức tương ứng với nghĩa:' :
                                        q.type === 'meaning' ? 'Chọn nghĩa tiếng Việt của từ này:' :
                                        q.type === 'context' ? 'Điền từ còn thiếu vào chỗ trống:' :
                                        q.type === 'order' ? 'Xếp thành từ hoặc cụm từ đúng:' :
                                        'Nghe lời khách và chọn nghĩa phù hợp:';
      this.ui.orderTargetWord.textContent = q.prompt || q.term;
      const inputLabel = q.type === 'context' ? 'Nhập phần còn thiếu trong câu' : q.type === 'meaning' ? 'Nhập nghĩa tiếng Việt' : 'Nhập từ tiếng Đức kèm mạo từ';
      this.ui.orderInput.placeholder = inputLabel + '…';
      this.ui.orderInput.setAttribute('aria-label', inputLabel);
      this.ui.btnOrderSubmit.style.display = q.options?.length ? 'none' : '';

      // Cloze Example
      if (q.type === 'context' && q.example) {
        this.ui.orderExampleBox.style.display = 'block';
        this.ui.orderExampleText.textContent = q.example;
      } else {
        this.ui.orderExampleBox.style.display = 'none';
      }

      // Listening Controls
      if (q.type === 'listen') {
        this.ui.orderListenRow.style.display = 'flex';
        if (q.speechText) this.tts.speak(q.speechText);
      } else {
        this.ui.orderListenRow.style.display = 'none';
      }

      // Options Grid (Meaning / Listen)
      if (q.options && q.options.length > 0) {
        this.ui.orderOptionsGrid.style.display = 'flex';
        this.ui.orderOptionsGrid.innerHTML = '';
        q.options.forEach((optText) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'option-btn';
          btn.textContent = optText;
          btn.addEventListener('click', () => {
            if (customer.resolved || customer.isResolving) return;
            this.sound.playClick();
            this.submitAnswer(optText);
          });
          this.ui.orderOptionsGrid.appendChild(btn);
        });
      } else {
        this.ui.orderOptionsGrid.style.display = 'none';
      }

      // Typed Input Group (Recall / Context / Singleton Meaning)
      if (q.type === 'recall' || q.type === 'context' || (q.type === 'meaning' && (!q.options || !q.options.length))) {
        this.ui.orderInputGroup.style.display = 'flex';
        this.ui.orderInput.value = customer.draft || '';
        setTimeout(() => {
          if (this.isRoundActive && !this.paused && !this.isEventActive && this.activeCustomerId === customer.id && window.matchMedia?.('(pointer: fine)').matches) this.ui.orderInput.focus();
        }, 100);
      } else {
        this.ui.orderInputGroup.style.display = 'none';
      }

      // Token Arrangement Group (Order)
      if (q.type === 'order' && q.tokens && q.tokens.length > 0) {
        this.ui.orderTokensGroup.style.display = 'block';
        customer.selectedTokens ||= [];
        this.renderTokensUI(customer);
      } else {
        this.ui.orderTokensGroup.style.display = 'none';
      }

      // Reset action buttons state
      this.ui.btnOrderSubmit.disabled = false;
      this.ui.btnOrderHint.disabled = false;
      this.ui.btnOrderSkip.disabled = false;
      this.hideFeedback();

      // Show panel and notify scene of resize
      this.ui.orderPanel.classList.remove('hidden');
      this.ui.orderPanel.setAttribute('aria-hidden', 'false');
      scene.handleResize();
      this.sound.playClick();
    }

    renderTokensUI(customer) {
      const q = customer.question;
      const chosenContainer = this.ui.orderTokensChosen;
      const poolContainer = this.ui.orderTokensPool;

      chosenContainer.innerHTML = '';
      poolContainer.innerHTML = '';

      customer.selectedTokens.forEach((token, idx) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'token-pill';
        pill.textContent = token;
        pill.addEventListener('click', () => {
          if (customer.resolved || customer.isResolving) return;
          customer.selectedTokens.splice(idx, 1);
          this.renderTokensUI(customer);
          this.sound.playClick();
        });
        chosenContainer.appendChild(pill);
      });

      q.tokens.forEach((token) => {
        const inChosen = customer.selectedTokens.filter(t => t === token).length;
        const total = q.tokens.filter(t => t === token).length;
        if (inChosen < total) {
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'token-pill';
          pill.textContent = token;
          pill.addEventListener('click', () => {
            if (customer.resolved || customer.isResolving) return;
            customer.selectedTokens.push(token);
            this.renderTokensUI(customer);
            this.sound.playClick();
          });
          poolContainer.appendChild(pill);
        }
      });
    }

    submitCurrentOrder() {
      const customer = this.customers.get(this.activeCustomerId);
      if (!customer || customer.resolved || customer.isResolving) return;

      const q = customer.question;
      let submittedValue = '';

      if (q.type === 'recall' || q.type === 'context' || (q.type === 'meaning' && (!q.options || !q.options.length))) {
        submittedValue = this.ui.orderInput.value.trim();
      } else if (q.type === 'order') {
        submittedValue = customer.selectedTokens.join(' ');
      }

      if (!submittedValue) {
        this.showFeedback('almost', 'Vui lòng nhập hoặc chọn câu trả lời trước nhé.');
        return;
      }

      this.submitAnswer(submittedValue);
    }

    submitAnswer(inputValue) {
      const customer = this.customers.get(this.activeCustomerId);
      if (!customer || customer.resolved || customer.isResolving) return;

      const q = customer.question;
      const result = this.learningSession.answer(q.id, inputValue);

      if (result.alreadyResolved) {
        return; // Guard against duplicate submissions
      }

      if (result.correct && result.resolved) {
        // Per-customer resolution latch: lock immediately
        customer.isResolving = true;
        customer.resolved = true;
        this.disableOrderActions();
        this.handleCorrectAnswer(customer, result);
      } else if (result.almost) {
        this.combo = 0;
        this.updateHUD();
        this.sound.playWrong();
        this.showFeedback('almost', result.feedback || 'Gần đúng — kiểm tra mạo từ, dấu hoặc cách viết.');
      } else {
        this.combo = 0;
        this.updateHUD();
        this.sound.playWrong();
        this.showFeedback('wrong', result.feedback || 'Chưa chính xác. Thử lại hoặc xem gợi ý nhé.');
      }
    }

    disableOrderActions() {
      this.ui.btnOrderSubmit.disabled = true;
      this.ui.btnOrderHint.disabled = true;
      this.ui.btnOrderSkip.disabled = true;
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    }

    handleCorrectAnswer(customer, result) {
      const q = customer.question;
      this.sound.playChime();
      this.sound.playMeow();

      if (result.independent) {
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      } else {
        this.combo = 0;
      }

      let orderCoins = 10 + Math.min(this.combo * 2, 20);
      if (this.multiplierOrdersLeft > 0) {
        orderCoins *= this.coinMultiplier;
        this.multiplierOrdersLeft--;
      }
      this.coins += orderCoins;
      this.profile.coins += orderCoins;
      this.ordersServed++;
      this.resolvedOrdersCount++;
      this.saveProfile();
      this.updateHUD();

      this.showFeedback('correct', result.feedback || 'Chính xác! Giao hàng thôi.');

      // Deliver 3D package
      const packageType = (q.type === 'context' || Math.random() > 0.5) ? 'takeaway' : 'dinein';
      scene.deliverPackage(customer.id, packageType, () => {
        scene.triggerHeart(customer.id);
      });

      // Cancellable action to depart boat and refresh
      this.scheduleAction(700, () => {
        scene.removeCustomerBoat(customer.id);
        this.customers.delete(customer.id);
        this.ui.orderPanel.classList.add('hidden');
        this.ui.orderPanel.setAttribute('aria-hidden', 'true');
        scene.handleResize();
        this.activeCustomerId = null;

        if (this.mode === 'calm' && this.resolvedOrdersCount >= this.targetOrdersCount) {
          this.finishRound();
        } else {
          this.replenishCustomers();
          if (this.customers.size > 0) {
            const nextId = this.customers.keys().next().value;
            this.selectCustomer(nextId);
          }
        }
      });
    }

    requestHint() {
      const customer = this.customers.get(this.activeCustomerId);
      if (!customer || customer.resolved || customer.isResolving) return;

      const q = customer.question;
      const h = this.learningSession.hint(q.id);
      this.combo = 0;
      this.updateHUD();
      this.sound.playClick();
      this.showFeedback('almost', h.text || `Đáp án tham khảo: ${h.answer}`);

      if (q.type === 'recall' || q.type === 'context') {
        this.ui.orderInput.value = h.answer;
        this.ui.orderInput.focus();
      }
    }

    skipOrder() {
      const customer = this.customers.get(this.activeCustomerId);
      if (!customer || customer.resolved || customer.isResolving) return;

      customer.isResolving = true;
      customer.resolved = true;
      this.disableOrderActions();

      const q = customer.question;
      this.learningSession.skip(q.id);
      this.combo = 0;
      this.resolvedOrdersCount++;
      this.updateHUD();
      this.sound.playClick();

      this.showFeedback('wrong', `Đã bỏ qua. Từ chuẩn: ${q.answer}`);

      this.scheduleAction(800, () => {
        scene.removeCustomerBoat(customer.id);
        this.customers.delete(customer.id);
        this.ui.orderPanel.classList.add('hidden');
        this.ui.orderPanel.setAttribute('aria-hidden', 'true');
        scene.handleResize();
        this.activeCustomerId = null;

        if (this.mode === 'calm' && this.resolvedOrdersCount >= this.targetOrdersCount) {
          this.finishRound();
        } else {
          this.replenishCustomers();
          if (this.customers.size > 0) {
            const nextId = this.customers.keys().next().value;
            this.selectCustomer(nextId);
          }
        }
      });
    }

    fallbackListening() {
      const customer = this.customers.get(this.activeCustomerId);
      if (!customer || customer.resolved || customer.isResolving) return;

      const updatedQ = this.learningSession.fallbackListening(customer.question.id);
      if (updatedQ) {
        customer.question = updatedQ;
        this.selectCustomer(customer.id);
      }
    }

    showFeedback(statusClass, message) {
      const fb = this.ui.orderFeedback;
      fb.className = `feedback-box show ${statusClass}`;
      fb.textContent = message;
    }

    hideFeedback() {
      const fb = this.ui.orderFeedback;
      fb.className = 'feedback-box';
      fb.textContent = '';
    }

    showCoachmark(text) {
      this.ui.coachmarkText.textContent = text;
      this.ui.coachmark.style.display = 'flex';
    }

    hideCoachmark() {
      this.ui.coachmark.style.display = 'none';
    }

    updateHUD() {
      this.ui.statCoins.textContent = this.coins;
      this.ui.statServed.textContent = this.mode === 'calm' ? `${this.resolvedOrdersCount}/${this.targetOrdersCount}` : `${this.ordersServed}`;
      this.ui.hudModeTag.textContent = this.mode === 'calm' ? 'Chợ sớm' : 'Chợ đông';

      if (this.combo >= 2) {
        this.ui.statComboPill.style.display = 'flex';
        this.ui.statCombo.textContent = `x${this.combo}`;
      } else {
        this.ui.statComboPill.style.display = 'none';
      }

      if (this.mode === 'rush') {
        this.ui.statTimerPill.style.display = 'flex';
        const seconds = Math.ceil(this.rushTimeLeft);
        this.ui.statTimer.textContent = `${seconds}s`;
        if (seconds <= 20) {
          this.ui.statTimerPill.classList.add('urgent');
        } else {
          this.ui.statTimerPill.classList.remove('urgent');
        }
      } else {
        this.ui.statTimerPill.style.display = 'none';
      }
    }

    // --- Story Events Integration ---
    triggerStoryEvent() {
      this.isEventActive = true;
      this.ui.orderPanel.classList.add('hidden');
      this.ui.orderPanel.setAttribute('aria-hidden', 'true');
      document.getElementById('event-route').hidden = true;
      scene.handleResize();

      const templates = ['merchant', 'barter', 'chase', 'lesson'];
      const template = templates[this.roundCount % templates.length];

      if (template === 'merchant') {
        this.showMerchantEvent();
      } else if (template === 'barter') {
        this.showBarterEvent();
      } else if (template === 'lesson') {
        this.showLessonEvent();
      } else {
        this.showChaseEvent();
      }
    }

    closeStoryEvent() {
      this.pendingActions = this.pendingActions.filter(action => !action.allowInEvent);
      scene.endChase?.();
      this.isEventActive = false;
      this.ui.modalEvent.classList.add('hidden');
      this.ui.modalEvent.setAttribute('aria-hidden', 'true');
      this.ui.modalLesson.classList.add('hidden');
      this.ui.modalLesson.setAttribute('aria-hidden', 'true');

      if (this.eventSession) {
        this.eventSession.finish();
        this.eventSession = null;
      }

      if (!this.isRoundActive) return;
      // Restore active customer or replenish
      this.replenishCustomers();
      if (this.customers.size > 0) {
        const targetId = this.activeCustomerId && this.customers.has(this.activeCustomerId)
          ? this.activeCustomerId
          : this.customers.keys().next().value;
        this.selectCustomer(targetId);
      }
    }

    renderEventChallenge(q, onAnswer) {
      const box = this.ui.eventChallengeBox;
      const promptEl = this.ui.eventChallengePrompt;
      const optionsEl = this.ui.eventChallengeOptions;

      box.style.display = 'flex';
      optionsEl.innerHTML = '';
      let submitted = false;
      const commit = value => {
        if (submitted || !this.isRoundActive || !this.isEventActive || this.paused) return;
        submitted = true;
        onAnswer(value);
      };

      if (q.type === 'meaning' && q.options && q.options.length > 0) {
        promptEl.textContent = `Chọn nghĩa tiếng Việt của từ: "${q.term}"`;
        q.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'option-btn';
          btn.textContent = opt;
          btn.addEventListener('click', () => {
            optionsEl.querySelectorAll('button').forEach(b => b.disabled = true);
            commit(opt);
          });
          optionsEl.appendChild(btn);
        });
      } else if (q.type === 'order' && q.tokens && q.tokens.length > 0) {
        promptEl.textContent = `Xếp câu hoàn chỉnh: "${q.prompt || q.meaning}"`;
        const chosen = [];
        const chosenWrap = document.createElement('div');
        chosenWrap.className = 'tokens-container';
        const poolWrap = document.createElement('div');
        poolWrap.className = 'tokens-pool';
        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = 'btn-primary';
        confirmBtn.style.marginTop = '8px';
        confirmBtn.textContent = 'Xác nhận xếp từ';

        const updateTokens = () => {
          chosenWrap.innerHTML = '';
          chosen.forEach((t, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'token-pill';
            b.textContent = t;
            b.onclick = () => { chosen.splice(i, 1); updateTokens(); };
            chosenWrap.appendChild(b);
          });
          poolWrap.innerHTML = '';
          q.tokens.forEach(t => {
            const inChosen = chosen.filter(x => x === t).length;
            const total = q.tokens.filter(x => x === t).length;
            if (inChosen < total) {
              const b = document.createElement('button');
              b.type = 'button';
              b.className = 'token-pill';
              b.textContent = t;
              b.onclick = () => { chosen.push(t); updateTokens(); };
              poolWrap.appendChild(b);
            }
          });
        };
        updateTokens();

        confirmBtn.onclick = () => {
          if (!chosen.length) return;
          confirmBtn.disabled = true;
          commit(chosen.join(' '));
        };

        optionsEl.appendChild(chosenWrap);
        optionsEl.appendChild(poolWrap);
        optionsEl.appendChild(confirmBtn);
      } else {
        // Genuine typed recall / context input
        promptEl.textContent = q.type === 'context'
          ? `Điền từ còn thiếu: "${q.example || q.prompt}"`
          : q.type === 'meaning' ? `Viết nghĩa tiếng Việt của "${q.term}":` : `Gõ từ tiếng Đức cho nghĩa: "${q.meaning}"`;

        const inputWrap = document.createElement('div');
        inputWrap.style.display = 'flex';
        inputWrap.style.gap = '8px';
        inputWrap.style.width = '100%';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'text-input';
        input.placeholder = q.type === 'context' ? 'Nhập phần còn thiếu...' : q.type === 'meaning' ? 'Nhập nghĩa tiếng Việt...' : 'Nhập từ tiếng Đức kèm mạo từ...';
        input.setAttribute('aria-label', input.placeholder.replace('...', ''));
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.style.flex = '1';
        input.style.minWidth = '0';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'btn-primary';
        submitBtn.textContent = 'Gửi đáp án';
        submitBtn.style.flex = 'none';
        submitBtn.style.padding = '0 16px';

        const doSubmit = () => {
          const val = input.value.trim();
          if (!val || submitted || this.paused || !this.isEventActive || !this.isRoundActive) return;
          input.disabled = true;
          submitBtn.disabled = true;
          commit(val);
        };

        submitBtn.onclick = doSubmit;
        input.onkeydown = (e) => { if (e.key === 'Enter') doSubmit(); };

        inputWrap.appendChild(input);
        inputWrap.appendChild(submitBtn);
        optionsEl.appendChild(inputWrap);
        setTimeout(() => input.focus(), 100);
      }
    }

    showMerchantEvent() {
      this.ui.eventTitle.textContent = '🛶 Tàu Lái Buôn Ghé Thăm';
      this.ui.eventHeroTitle.textContent = 'Thuyền Trưởng Mèo Hàng Xóm';
      this.ui.eventHeroText.textContent = 'Một thuyền buôn lạ ghé mạn trao đổi: "Trả lời đúng 1 câu từ vựng để nhận x2 tiền xu cho 3 đơn hàng tiếp theo!"';

      // Use isolated event session so main 12-order round is never depleted
      this.eventSession = window.CatIslandLearning.createSession({
        deck: this.deckId,
        mode: 'calm',
        limit: 2
      });

      const q = this.eventSession.nextQuestion();
      if (!q) {
        this.closeStoryEvent();
        return;
      }

      this.ui.eventChoicesGrid.style.display = 'none';
      this.ui.eventFeedback.className = 'feedback-box';
      this.ui.eventFeedback.textContent = '';
      this.ui.btnEventContinue.style.display = 'none';
      this.ui.btnEventSkip.style.display = 'block';

      this.renderEventChallenge(q, (answer) => {
        const res = this.eventSession.answer(q.id, answer);
        if (res.correct) {
          this.coinMultiplier = 2;
          this.multiplierOrdersLeft = 3;
          this.sound.playFanfare();
          this.ui.eventFeedback.className = 'feedback-box show correct';
          this.ui.eventFeedback.textContent = '🎉 Chính xác! Bạn nhận được x2 Tiền xu cho 3 đơn hàng tiếp theo!';
        } else {
          this.sound.playWrong();
          this.ui.eventFeedback.className = 'feedback-box show wrong';
          this.ui.eventFeedback.textContent = `Chưa đúng. Đáp án chuẩn là: ${q.answer}`;
        }
        this.ui.btnEventSkip.style.display = 'none';
        this.ui.btnEventContinue.style.display = 'block';
      });

      this.ui.btnEventContinue.onclick = () => this.closeStoryEvent();
      this.ui.btnEventSkip.onclick = () => this.closeStoryEvent();

      this.ui.modalEvent.classList.remove('hidden');
      this.ui.modalEvent.setAttribute('aria-hidden', 'false');
      this.sound.playChime();
    }

    showBarterEvent() {
      this.ui.eventTitle.textContent = '⚖️ Bạn Hàng Trao Đổi';
      this.ui.eventHeroTitle.textContent = 'Ghe Trao Đổi Nổi';
      this.ui.eventHeroText.textContent = `Nghệ nhân mèo ghé bến với một món quà mới. Ví của bạn đang có ${this.profile.coins} xu.`;
      let traded = false;

      this.ui.eventChallengeBox.style.display = 'none';
      this.ui.eventChoicesGrid.style.display = 'grid';
      this.ui.eventFeedback.className = 'feedback-box';
      this.ui.eventFeedback.textContent = '';
      this.ui.btnEventContinue.style.display = 'none';
      this.ui.btnEventSkip.style.display = 'block';

      const lotusUnlocked = this.profile.unlockedCosmetics && this.profile.unlockedCosmetics.includes('lotus');
      const canAfford = this.profile.coins >= 20;

      if (!lotusUnlocked) {
        this.ui.eventChoicesGrid.innerHTML = `
          <button type="button" class="event-choice-card" id="choice-barter-buy" ${!canAfford ? 'disabled' : ''}>
            <span class="event-choice-title">🪷 Mở Khóa Sen Nổi (-20 xu)</span>
            <span class="event-choice-desc">${canAfford ? 'Mở khóa vĩnh viễn Chậu Hoa Sen Nổi Ngọc Bích trên bến.' : 'Bạn cần 20 xu (hiện có: ' + this.profile.coins + ' xu).'}</span>
          </button>
          <button type="button" class="event-choice-card" id="choice-barter-keep">
            <span class="event-choice-title">💰 Giữ lại tiền xu</span>
            <span class="event-choice-desc">Cảm ơn bạn hàng và tiếp tục phiên chợ.</span>
          </button>
        `;

        document.getElementById('choice-barter-buy').addEventListener('click', () => {
          if (!traded && this.profile.coins >= 20) {
            traded = true;
            document.getElementById('choice-barter-buy').disabled = true;
            this.coins = Math.max(0, this.coins - 20);
            this.profile.coins -= 20;
            if (!this.profile.unlockedCosmetics.includes('lotus')) {
              this.profile.unlockedCosmetics.push('lotus');
            }
            this.profile.selectedCosmetic = 'lotus';
            scene.setCosmetic('lotus');
            this.saveProfile();
            this.applyProfileUI();
            this.updateHUD();
            this.sound.playFanfare();

            this.ui.eventFeedback.className = 'feedback-box show correct';
            this.ui.eventFeedback.textContent = '🪷 Đã mở khóa vĩnh viễn Chậu Hoa Sen Nổi Ngọc Bích!';
            this.ui.eventHeroText.textContent = `Ví còn ${this.profile.coins} xu. Hoa sen đã được đặt bên ghe và sẽ được giữ cho những phiên sau.`;
            this.ui.btnEventSkip.style.display = 'none';
            this.ui.btnEventContinue.style.display = 'block';
          }
        });
      } else {
        // Lotus already unlocked, offer Dragonfruit juice boost
        this.ui.eventChoicesGrid.innerHTML = `
          <button type="button" class="event-choice-card" id="choice-barter-boost" ${this.profile.coins < 15 ? 'disabled' : ''}>
            <span class="event-choice-title">🍹 Nước Ép Thanh Long (-15 xu)</span>
            <span class="event-choice-desc">Uống giải nhiệt, tăng x2 xu cho 3 đơn hàng tiếp theo.</span>
          </button>
          <button type="button" class="event-choice-card" id="choice-barter-keep">
            <span class="event-choice-title">💰 Giữ lại tiền xu</span>
            <span class="event-choice-desc">Cảm ơn bạn hàng và tiếp tục phiên chợ.</span>
          </button>
        `;

        document.getElementById('choice-barter-boost').addEventListener('click', () => {
          if (!traded && this.profile.coins >= 15) {
            traded = true;
            document.getElementById('choice-barter-boost').disabled = true;
            this.coins = Math.max(0, this.coins - 15);
            this.profile.coins -= 15;
            this.coinMultiplier = 2;
            this.multiplierOrdersLeft = 3;
            this.saveProfile();
            this.updateHUD();
            this.sound.playFanfare();

            this.ui.eventFeedback.className = 'feedback-box show correct';
            this.ui.eventFeedback.textContent = '🍹 Đã uống Nước Ép Thanh Long! x2 xu cho 3 đơn tới.';
            this.ui.eventHeroText.textContent = `Ví còn ${this.profile.coins} xu. Ba đơn tiếp theo được nhân đôi xu thưởng.`;
            this.ui.btnEventSkip.style.display = 'none';
            this.ui.btnEventContinue.style.display = 'block';
          }
        });
      }

      document.getElementById('choice-barter-keep').addEventListener('click', () => {
        this.closeStoryEvent();
      });

      this.ui.btnEventContinue.onclick = () => this.closeStoryEvent();
      this.ui.btnEventSkip.onclick = () => this.closeStoryEvent();

      this.ui.modalEvent.classList.remove('hidden');
      this.ui.modalEvent.setAttribute('aria-hidden', 'false');
      this.sound.playChime();
    }

    showChaseEvent() {
      const route = document.getElementById('event-route');
      const boat = document.getElementById('event-route-boat');
      route.hidden = false;
      route.setAttribute('aria-valuenow', '0');
      boat.style.left = '3%';
      this.ui.eventTitle.textContent = '⛵ Đuổi Kịp Thuyền Khách';
      this.ui.eventHeroTitle.textContent = 'Khách Mèo Đãng Trí Quên Trả Tiền';
      this.ui.eventHeroText.textContent = 'Khách mèo vội rời bến mà quên thanh toán. Chèo theo đưa hóa đơn; khách sẽ trả tiền và gửi thêm xu cảm ơn.';

      this.eventSession = window.CatIslandLearning.createSession({
        deck: this.deckId,
        mode: 'calm',
        limit: 3
      });

      this.ui.eventChoicesGrid.style.display = 'grid';
      this.ui.eventChoicesGrid.innerHTML = `
        <button type="button" class="event-choice-card" id="choice-chase-calm">
          <span class="event-choice-title">🌿 Lối Luồng Lạch Êm (1 câu)</span>
          <span class="event-choice-desc">Đường êm dịu, trả lời 1 câu từ vựng để nhận thưởng an toàn: +15 xu.</span>
        </button>
        <button type="button" class="event-choice-card" id="choice-chase-fast">
          <span class="event-choice-title">🌊 Khúc Quanh Ghềnh Đá (2 câu)</span>
          <span class="event-choice-desc">Thử thách hơn, trả lời 2 câu liên tiếp để bứt tốc nhận thưởng lớn: +30 xu!</span>
        </button>
      `;

      this.ui.eventChallengeBox.style.display = 'none';
      this.ui.eventFeedback.className = 'feedback-box';
      this.ui.eventFeedback.textContent = '';
      this.ui.btnEventContinue.style.display = 'none';
      this.ui.btnEventSkip.style.display = 'block';

      const runChaseSteps = (totalSteps, bonusCoins) => {
        scene.startChase?.(totalSteps);
        let currentStep = 1;
        const askNextStep = () => {
          if (!this.isRoundActive || !this.isEventActive || !this.eventSession) return;
          const q = this.eventSession.nextQuestion();
          if (!q) {
            this.closeStoryEvent();
            return;
          }

          this.ui.eventChoicesGrid.style.display = 'none';
          this.ui.eventHeroTitle.textContent = `Chặng ${currentStep}/${totalSteps} · Đưa hóa đơn cho khách`;
          this.renderEventChallenge(q, (answer) => {
            const res = this.eventSession.answer(q.id, answer);
            if (res.correct) {
              scene.advanceChase?.(currentStep / totalSteps);
              route.setAttribute('aria-valuenow', String(Math.round(currentStep / totalSteps * 100)));
              boat.style.left = `${3 + currentStep / totalSteps * 80}%`;
              this.sound.playChime();
              if (currentStep < totalSteps) {
                currentStep++;
                this.scheduleAction(500, askNextStep, true);
              } else {
                this.coins += bonusCoins;
                this.profile.coins += bonusCoins;
                this.saveProfile();
                this.updateHUD();
                this.sound.playFanfare();
                this.ui.eventFeedback.className = 'feedback-box show correct';
                this.ui.eventFeedback.textContent = `👏 Bạn đã đuổi kịp thuyền khách và nhận thưởng +${bonusCoins} xu!`;
                this.ui.btnEventSkip.style.display = 'none';
                this.ui.btnEventContinue.style.display = 'block';
              }
            } else {
              this.sound.playWrong();
              this.ui.eventFeedback.className = 'feedback-box show wrong';
              this.ui.eventFeedback.textContent = `Lạc tay chèo! Từ chuẩn: ${q.answer}`;
              this.ui.btnEventSkip.style.display = 'none';
              this.ui.btnEventContinue.style.display = 'block';
            }
          });
        };
        askNextStep();
      };

      document.getElementById('choice-chase-calm').addEventListener('click', () => runChaseSteps(1, 15));
      document.getElementById('choice-chase-fast').addEventListener('click', () => runChaseSteps(2, 30));

      this.ui.btnEventContinue.onclick = () => this.closeStoryEvent();
      this.ui.btnEventSkip.onclick = () => this.closeStoryEvent();

      this.ui.modalEvent.classList.remove('hidden');
      this.ui.modalEvent.setAttribute('aria-hidden', 'false');
      this.sound.playChime();
    }

    showLessonEvent() {
      const modal = this.ui.modalLesson;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      this.sound.playChime();

      const boxTakeaway = document.getElementById('lesson-box-takeaway');
      const boxDinein = document.getElementById('lesson-box-dinein');
      const applySection = this.ui.lessonApplySection;
      const applyPrompt = document.getElementById('lesson-apply-prompt');
      const btnTakeaway = this.ui.btnLessonPackTakeaway;
      const btnDinein = this.ui.btnLessonPackDinein;
      const feedback = this.ui.lessonFeedback;
      const btnContinue = this.ui.btnLessonContinue;

      applySection.style.display = 'none';
      applyPrompt.textContent = 'Khách mèo gọi: "Một phần cá nướng, zum Mitnehmen, bitte!" — Bạn chọn cách phục vụ nào?';
      feedback.className = 'feedback-box';
      feedback.textContent = '';
      btnTakeaway.disabled = false;
      btnDinein.disabled = false;

      let inspectedTakeaway = false;
      let inspectedDinein = false;
      let stage = 1;
      let lessonRewardGiven = false;

      boxTakeaway.onclick = () => {
        this.tts.speak('Zum Mitnehmen, bitte!');
        boxTakeaway.classList.add('active');
        inspectedTakeaway = true;
        if (inspectedTakeaway && inspectedDinein) {
          applySection.style.display = 'flex';
        }
      };

      boxDinein.onclick = () => {
        this.tts.speak('Hier essen, bitte!');
        boxDinein.classList.add('active');
        inspectedDinein = true;
        if (inspectedTakeaway && inspectedDinein) {
          applySection.style.display = 'flex';
        }
      };

      btnTakeaway.onclick = () => {
        if (stage === 1) {
          btnTakeaway.disabled = true;
          btnDinein.disabled = true;
          feedback.className = 'feedback-box show correct';
          feedback.textContent = 'Chính xác! "Zum Mitnehmen" là mang về, đóng túi kraft!';
          this.sound.playChime();
          stage = 2;
          this.scheduleAction(1200, () => {
            applyPrompt.textContent = 'Khách tiếp theo yêu cầu: "Một bát cháo cá, hier essen, bitte!" — Bạn chọn:';
            feedback.className = 'feedback-box';
            feedback.textContent = '';
            btnTakeaway.disabled = false;
            btnDinein.disabled = false;
          }, true);
        } else {
          feedback.className = 'feedback-box show wrong';
          feedback.textContent = 'Khách yêu cầu "hier essen" (ăn tại chỗ), hãy chọn Đĩa tại chỗ!';
          this.sound.playWrong();
        }
      };

      btnDinein.onclick = () => {
        if (stage === 2) {
          btnTakeaway.disabled = true;
          btnDinein.disabled = true;
          feedback.className = 'feedback-box show correct';
          feedback.textContent = 'Tuyệt vời! "Hier essen" là dùng tại chỗ, dọn ra đĩa sứ!';
          this.sound.playFanfare();

          if (!lessonRewardGiven) {
            lessonRewardGiven = true;
            this.coins += 20;
            this.profile.coins += 20;
            this.saveProfile();
            this.updateHUD();
          }

          this.scheduleAction(1500, () => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            this.closeStoryEvent();
          }, true);
        } else {
          feedback.className = 'feedback-box show wrong';
          feedback.textContent = 'Khách đang yêu cầu "zum Mitnehmen" (mang về), hãy chọn Túi mang về!';
          this.sound.playWrong();
        }
      };

      btnContinue.onclick = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        this.closeStoryEvent();
      };
    }

    // --- End Round & Results Flow ---
    finishRound() {
      if (!this.isRoundActive) return;
      this.isRoundActive = false;
      this.clearScheduledActions();

      this.ui.orderPanel.classList.add('hidden');
      this.ui.orderPanel.setAttribute('aria-hidden', 'true');
      scene.handleResize();

      // Finish Learning Session (idempotent, safe)
      const report = this.learningSession ? this.learningSession.finish() : { attempts: 0, distinctWords: 0, independentWords: 0, assistedWords: 0, correctFirstTry: 0, weakWords: [] };

      // Increment roundCount for event rotation across successive shifts
      this.roundCount = (this.roundCount || 0) + 1;

      // Meaningful completion check (only increments on genuine full shift)
      const isCompletedShift = (this.mode === 'calm' && this.resolvedOrdersCount >= this.targetOrdersCount) ||
                               (this.mode === 'rush' && this.ordersServed >= 1);

      let helperJustUnlocked = false;
      if (isCompletedShift) {
        this.profile.totalShifts = (this.profile.totalShifts || 0) + 1;
        if (this.profile.totalShifts >= 2 && !this.profile.helperUnlocked) {
          this.profile.helperUnlocked = true;
          helperJustUnlocked = true;
          scene.setHelperUnlocked(true);
        }
      }

      // Update persistent personal best scores
      if (!this.profile.bestScores) {
        this.profile.bestScores = { calm: 0, rush: 0 };
      }
      if (this.mode === 'rush') {
        this.profile.bestScores.rush = Math.max(this.profile.bestScores.rush || 0, this.coins);
      } else {
        this.profile.bestScores.calm = Math.max(this.profile.bestScores.calm || 0, this.coins);
      }
      this.saveProfile();

      // Populate Results Modal
      this.ui.resCoins.textContent = `+${this.coins}`;
      this.ui.resOrders.textContent = `${this.ordersServed}`;
      if (this.ui.resDistinct) {
        this.ui.resDistinct.textContent = `${report.distinctWords || 0}`;
      }
      this.ui.resIndependent.textContent = `${report.independentWords || 0}`;

      const attempted = typeof report.questionsAttempted === 'number'
        ? report.questionsAttempted
        : (report.attempts || 0);
      if (attempted > 0) {
        const accuracy = typeof report.firstTryAccuracy === 'number'
          ? report.firstTryAccuracy
          : Math.round(((report.correctFirstTry || 0) / attempted) * 100);
        this.ui.resAccuracyLine.textContent = `Đúng ngay lượt đầu: ${report.correctFirstTry}/${attempted} câu (${accuracy}%) · ${report.assistedWords || 0} từ cần luyện thêm`;
      } else {
        this.ui.resAccuracyLine.textContent = `Chưa có lượt trả lời đầy đủ trong phiên này.`;
      }
      const bestLine = document.getElementById('res-best-line');
      if (bestLine) bestLine.textContent = `Kỷ lục ${this.mode === 'rush' ? 'chợ đông' : 'chợ sớm'}: ${this.profile.bestScores[this.mode]} xu · Ví: ${this.profile.coins} xu`;
      const saveNote = document.getElementById('res-save-note');
      if (saveNote) saveNote.textContent = report.saved === false ? 'Trình duyệt chưa lưu được lượt luyện này. Bạn vẫn có thể tiếp tục chơi.' : '';

      // Weak words list
      const weakList = this.ui.resWeakList;
      weakList.innerHTML = '';
      if (report.weakWords && report.weakWords.length > 0) {
        report.weakWords.forEach(w => {
          const item = document.createElement('div');
          item.className = 'weak-word-item';
          const termSpan = document.createElement('span');
          termSpan.className = 'weak-word-term';
          termSpan.textContent = w.term;
          const meanSpan = document.createElement('span');
          meanSpan.className = 'weak-word-meaning';
          meanSpan.textContent = w.meaning;
          item.appendChild(termSpan);
          item.appendChild(meanSpan);
          weakList.appendChild(item);
        });
        this.ui.btnResWeak.style.display = 'block';
      } else {
        const item = document.createElement('div');
        item.className = 'weak-word-item';
        item.innerHTML = '<span class="weak-word-term">Tất cả đều làm tốt!</span><span class="weak-word-meaning">Không có từ yếu phiên này</span>';
        weakList.appendChild(item);
        this.ui.btnResWeak.style.display = 'none';
      }

      // Helper Cat Banner
      if (helperJustUnlocked) {
        this.ui.resHelperUnlockBanner.style.display = 'flex';
        this.sound.playFanfare();
      } else {
        this.ui.resHelperUnlockBanner.style.display = 'none';
      }

      this.ui.modalResults.classList.remove('hidden');
      this.ui.modalResults.setAttribute('aria-hidden', 'false');
      this.sound.playChime();
    }

    abandonRound() {
      // Abandoning/quitting mid-round does NOT increment completed shifts or unlock helper
      this.isRoundActive = false;
      this.isEventActive = false;
      this.clearScheduledActions();
      scene.endChase?.();
      if (this.eventSession) {
        this.eventSession.finish();
        this.eventSession = null;
      }
      this.ui.modalEvent.classList.add('hidden');
      this.ui.modalEvent.setAttribute('aria-hidden', 'true');
      this.ui.modalLesson.classList.add('hidden');
      this.ui.modalLesson.setAttribute('aria-hidden', 'true');

      this.ui.orderPanel.classList.add('hidden');
      this.ui.orderPanel.setAttribute('aria-hidden', 'true');
      scene.handleResize();

      if (this.learningSession) {
        this.learningSession.finish();
      }

      this.customers.forEach(c => scene.removeCustomerBoat(c.id));
      this.customers.clear();
      this.activeCustomerId = null;
      this.ui.customerDockRail.innerHTML = '';

      this.ui.modalStart.classList.remove('hidden');
      this.ui.modalStart.setAttribute('aria-hidden', 'false');
      this.applyProfileUI();
    }
  }

  // Instantiate and run on DOM ready
  const game = new CatIslandGame();
  window.CatIslandGame = game;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => game.init());
  } else {
    game.init();
  }
})();
