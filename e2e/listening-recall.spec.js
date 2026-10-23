const { test, expect } = require('@playwright/test');
const { seedStorage, getStorageJson } = require('./helpers/storage');
const { createDeterministicDailySessionFixture } = require('./helpers/session');

test.describe('E2E Phase 5: Listening Recall & Audio Dictation', () => {

  test.beforeEach(async ({ page }) => {
    // Stub browser SpeechSynthesis before page loads (pure browser API stub)
    await page.addInitScript(() => {
      window.__e2eSpokenTexts = [];
      if (window.speechSynthesis) {
        window.speechSynthesis.speak = function(u) {
          const txt = typeof u === 'string' ? u : (u && u.text ? u.text : String(u));
          window.__e2eSpokenTexts.push(txt);
          if (u && typeof u.onend === 'function') {
            setTimeout(u.onend, 10);
          }
        };
      }
    });
  });

  test('E2E Audio Leak & Listen Play: Text hidden before submit, spoken text is canonical German', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // In deterministic fixture:
    // b_0 is Intro
    await expect(page.locator('#sessionIntroBox')).toBeVisible();
    await page.locator('#sessionIntroBox .btn-session-continue').click();

    // b_1 is Typing
    await expect(page.locator('#sessionTypingBox')).toBeVisible();
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click();
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });

    // b_0 is Recall
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click();

    // b_2 is Intro
    await expect(page.locator('#sessionIntroBox')).toBeVisible();
    await page.locator('#sessionIntroBox .btn-session-continue').click();

    // NOW: b_3 is LISTENING RECALL!
    const listeningBox = page.locator('#sessionListeningBox');
    await expect(listeningBox).toBeVisible();

    // 1. Audio Leak Check before play:
    // German term, Vietnamese meaning, and transcript must be HIDDEN
    await expect(page.locator('#frontTerm')).toBeHidden();
    await expect(page.locator('#frontMeta')).toBeHidden();
    await expect(page.locator('#sessionListeningCanonical')).toBeEmpty();
    await expect(page.locator('#sessionListeningMeaning')).toBeEmpty();

    const spokenCountBefore = await page.evaluate(() => window.__e2eSpokenTexts.length +
      ((window.VokabelAudio && window.VokabelAudio.history) ? window.VokabelAudio.history.length : 0));
    expect(spokenCountBefore).toBe(0);

    // 2. Click "Nghe từ"
    const btnPlay = page.locator('#btnSessionListeningPlay');
    await expect(btnPlay).toBeVisible();
    await btnPlay.click();

    // Assert the learner heard exactly the canonical German answer exactly once.
    // Hai kenh hop le: audio thu san (VokabelAudio.history, via 'file') hoac TTS (__e2eSpokenTexts).
    await expect.poll(async () => page.evaluate(() => window.__e2eSpokenTexts.length +
      ((window.VokabelAudio && window.VokabelAudio.history) ? window.VokabelAudio.history.length : 0)),
      { timeout: 5000 }).toBe(1);
    const heardText = await page.evaluate(() => {
      if (window.__e2eSpokenTexts.length) return window.__e2eSpokenTexts[0];
      return window.VokabelAudio.history[0].spoken;
    });
    expect(heardText).toBe('der Gesichtsausdruck'); // canonical answer, without plural annotation

    // UI still does NOT reveal text before submit
    await expect(page.locator('#frontTerm')).toBeHidden();
    await expect(page.locator('#sessionListeningCanonical')).toBeEmpty();
  });

  test('E2E Enter Key Submission: Submits without clicking button', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to listening interaction on b_3
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Now in Listening interaction b_3
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    const listeningInput = page.locator('#sessionListeningInput');
    await expect(listeningInput).toBeVisible();

    // Type correct answer and hit Enter directly in input
    await listeningInput.fill('der Gesichtsausdruck');
    await listeningInput.press('Enter');

    // Assert Feedback Correct is visible
    const badge = page.locator('#sessionListeningFeedbackBadge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('CHÍNH XÁC');
    await expect(page.locator('#sessionListeningCanonical')).toContainText('der Gesichtsausdruck');
  });

  test('E2E Wrong Submission + Requeue to Recall: Does not repeat immediately and returns as Recall', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to listening interaction on b_3
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Listening interaction on b_3: submit WRONG
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    const listeningInput = page.locator('#sessionListeningInput');
    await listeningInput.fill('das Haus');
    await page.locator('#btnSessionListeningSubmit').click();

    // Feedback Wrong appears
    await expect(page.locator('#sessionListeningFeedbackBadge')).toContainText('CHƯA CHÍNH XÁC');
    await expect(page.locator('#sessionListeningCanonical')).toContainText('der Gesichtsausdruck');

    // Click Continue
    await page.locator('#btnSessionListeningContinue').click();

    // Next interaction MUST NOT be b_3 immediately (interleaved requeue)
    await expect(page.locator('#sessionListeningBox')).toBeHidden();
    // It should be recall for b_2 (die Mimik)
    await expect(page.locator('#frontTerm')).toContainText('die Mimik');

    // Complete recall for b_2
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click();

    // Complete recall for b_4
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click();

    // Now requeued b_3 returns as NORMAL ACTIVE RECALL (not Listening)
    await expect(page.locator('#sessionListeningBox')).toBeHidden();
    await expect(page.locator('#frontTerm')).toBeVisible();
    await expect(page.locator('#frontTerm')).toContainText('der Gesichtsausdruck');
    await expect(page.locator('#activeRecallFrontAction')).toBeVisible();
  });

  test('E2E F5 Reload Persistence: Survives reload during feedback without duplicate attempts or speech', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to listening interaction on b_3
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Listening b_3: submit wrong
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    await page.locator('#sessionListeningInput').fill('sai đáp án');
    await page.locator('#btnSessionListeningSubmit').click();

    // Feedback is showing
    await expect(page.locator('#sessionListeningFeedbackBadge')).toContainText('CHƯA CHÍNH XÁC');
    const spokenCountBeforeReload = await page.evaluate(() => window.__e2eSpokenTexts.length);

    // Perform page reload (F5)
    await page.reload();

    // Resume session from Today hub
    await page.locator('[data-nav="today"]').click();
    await page.locator('#todayPrimaryCta').click();

    // Verify feedback state is faithfully restored
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    await expect(page.locator('#sessionListeningFeedback')).toBeVisible();
    await expect(page.locator('#sessionListeningFeedbackBadge')).toContainText('CHƯA CHÍNH XÁC');
    await expect(page.locator('#sessionListeningCanonical')).toContainText('der Gesichtsausdruck');

    // Verify it did not auto-speak again on reload
    const spokenCountAfterReload = await page.evaluate(() => window.__e2eSpokenTexts.length);
    expect(spokenCountAfterReload).toBe(0); // Fresh page context has 0 auto-spoken texts

    // Verify attempts was not duplicated in storage
    const session = await getStorageJson(page, 'vokabelgo_learning_session_v1');
    expect(session.targetStates['b_3'].attempts).toBe(1);
    expect(session.targetStates['b_3'].srsCommitted).toBeFalsy();
  });

  test('E2E Race Condition Protection: Manual continue before 450ms does not skip next card', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to listening interaction on b_3
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Listening b_3: submit correct
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    await page.locator('#sessionListeningInput').fill('der Gesichtsausdruck');
    await page.locator('#btnSessionListeningSubmit').click();

    // Feedback appears
    await expect(page.locator('#sessionListeningFeedbackBadge')).toContainText('CHÍNH XÁC');

    // IMMEDIATELY click Continue manually before 450ms timer
    const btnContinue = page.locator('#btnSessionListeningContinue');
    await btnContinue.click();

    // Next interaction should be Recall b_2 (die Mimik)
    await expect(page.locator('#frontTerm')).toContainText('die Mimik');

    // Wait > 600ms to ensure the auto-continue timer from b_3 expires
    await page.waitForTimeout(600);

    // Verify b_2 was NOT skipped by the expired b_3 timer!
    await expect(page.locator('#frontTerm')).toContainText('die Mimik');
    await expect(page.locator('#activeRecallFrontAction .btn-reveal-answer')).toBeVisible();
  });

  test('E2E 1: Speech Failure Fallback: Speak throws synchronously -> transitions cleanly to Recall without penalties', async ({ page }) => {
    // Stub speech failure before page loads
    await page.addInitScript(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.speak = function() {
          throw new Error('TTS hardware failure in browser');
        };
      }
    });
    // Kenh audio thu san cung phai loi thi moi kich hoat fallback (TTS la du phong cua file)
    await page.route('**/assets/vocab-audio/**', route => route.abort());

    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to b_3 listening
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Now in Listening b_3
    await expect(page.locator('#sessionListeningBox')).toBeVisible();

    // Click "Nghe từ"
    await page.locator('#btnSessionListeningPlay').click();

    // Assert: Listening box disappears, current card becomes normal recall
    await expect(page.locator('#sessionListeningBox')).toBeHidden();
    await expect(page.locator('#frontTerm')).toBeVisible();
    await expect(page.locator('#frontTerm')).toContainText('der Gesichtsausdruck');
    await expect(page.locator('#activeRecallFrontAction .btn-reveal-answer')).toBeVisible();

    // Assert: No attempt/failure/SRS/Daily mutation
    const session = await getStorageJson(page, 'vokabelgo_learning_session_v1');
    expect(session.targetStates['b_3'].attempts).toBe(0);
    expect(session.targetStates['b_3'].failures).toBe(0);
    expect(session.targetStates['b_3'].srsCommitted).toBeFalsy();
  });

  test('E2E 2: Audio Does Not Leak: Cancelled on submit and remain inactive across auto-continue', async ({ page }) => {
    await page.addInitScript(() => {
      window.__speechState = { active: false, cancelCount: 0 };
      if (window.speechSynthesis) {
        window.speechSynthesis.speak = function(u) {
          window.__speechState.active = true;
        };
        window.speechSynthesis.cancel = function() {
          window.__speechState.cancelCount++;
          window.__speechState.active = false;
        };
      }
    });

    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to b_3 listening
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Now in Listening b_3
    await expect(page.locator('#sessionListeningBox')).toBeVisible();

    // Click Listen -> audio active (kenh TTS stub hoac file thu san qua VokabelAudio)
    await page.locator('#btnSessionListeningPlay').click();
    await expect.poll(async () => page.evaluate(() =>
      window.__speechState.active || (window.VokabelAudio && window.VokabelAudio.isPlaying())),
      { timeout: 5000 }).toBe(true);

    // Submit correct answer
    await page.locator('#sessionListeningInput').fill('der Gesichtsausdruck');
    await page.locator('#btnSessionListeningSubmit').click();

    // Assert: cancel called on submit and audio is no longer active (ca hai kenh)
    const stateAfterSubmit = await page.evaluate(() => window.__speechState);
    expect(stateAfterSubmit.cancelCount).toBeGreaterThan(0);
    expect(stateAfterSubmit.active).toBe(false);
    const filePlayingAfterSubmit = await page.evaluate(() => window.VokabelAudio && window.VokabelAudio.isPlaying());
    expect(filePlayingAfterSubmit).toBe(false);

    // Wait for auto-continue (450ms) -> next card appears
    await expect(page.locator('#frontTerm')).toContainText('die Mimik', { timeout: 7000 });

    // Assert: speech remains inactive
    const stateAfterAdvance = await page.evaluate(() => window.__speechState);
    expect(stateAfterAdvance.active).toBe(false);
    const filePlayingAfterAdvance = await page.evaluate(() => window.VokabelAudio && window.VokabelAudio.isPlaying());
    expect(filePlayingAfterAdvance).toBe(false);
  });

  test('E2E 3a: Wrong Feedback Replay Visibility: Replay button visible on Wrong', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    // Advance to b_3 listening
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Submit WRONG answer
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    await page.locator('#sessionListeningInput').fill('das Haus');
    await page.locator('#btnSessionListeningSubmit').click();

    // Assert: feedback appears and Replay button IS VISIBLE
    await expect(page.locator('#sessionListeningFeedbackBadge')).toContainText('CHƯA CHÍNH XÁC');
    const replayBtn = page.locator('#btnSessionListeningFeedbackReplay');
    await expect(replayBtn).toBeVisible();
  });

  test('E2E 3b: Correct Feedback Replay Policy: Replay button hidden on Correct', async ({ page }) => {
    const fixture = createDeterministicDailySessionFixture();
    await seedStorage(page, fixture);

    await page.goto('/');
    await page.locator('#todayPrimaryCta').click();

    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_0
    await page.locator('#sessionTypingInput').fill('die Geste');
    await page.locator('#btnSessionTypingSubmit').click(); // Typing b_1
    await expect(page.locator('#sessionTypingBox')).toBeHidden({ timeout: 4000 });
    await page.locator('#activeRecallFrontAction .btn-reveal-answer').click();
    await page.locator('button[data-rate="known"]').click(); // Recall b_0
    await page.locator('#sessionIntroBox .btn-session-continue').click(); // Intro b_2

    // Submit CORRECT answer
    await expect(page.locator('#sessionListeningBox')).toBeVisible();
    await page.locator('#sessionListeningInput').fill('der Gesichtsausdruck');
    await page.locator('#btnSessionListeningSubmit').click();

    // Assert: feedback appears and Replay button MUST BE HIDDEN per Policy A
    await expect(page.locator('#sessionListeningFeedbackBadge')).toContainText('CHÍNH XÁC');
    await expect(page.locator('#btnSessionListeningFeedbackReplay')).toBeHidden();
  });

});
