# Codex review — We Bare Bears / Wir und die Mall

## Independent checks already completed

- ffprobe confirms 274.041905 seconds, 640×360 H.264 video and AAC stereo audio.
- Independent cached-base automatic language detection at 10–40, 120–150 and 220–250 seconds identifies German with probabilities 0.99889, 0.98305 and 0.98922. See `codex-language-check.json`.
- Earshot measured −19.7 LUFS, −6.6 dBTP and 0 clipped samples; no audio remix or upload. See `codex-earshot.txt`.
- Codex inspected the video contact sheet and a frame at 119.7s. The latter confirms the pixel-art START screen, supporting the context of the short game-related line; it is not a police salute.
- Chapter boundaries and flashcard grammar/examples have been reviewed against the lesson source and ASR evidence.

## Resolved editorial findings

- Cue **1100133**, around 155s, has the German `Hey, was seid ihr?` but a Vietnamese translation meaning “what are you doing?”. Those meanings do not match. The shorter base recheck gives only exclamations, and the escalator scene does not resolve the exact wording. Omit this uncertain cue from the selected captions and graded answers instead of guessing a correction. It is not a chapter pick or a vocabulary example.
- The README calls this a Season 3 episode without evidence in the publisher title. Omit the season number; public episode numbering differs between listings and is not needed for this clip lesson.

Both findings are resolved in the final data and README. The uncertain cue is excluded from the TSV, generated captions, graded answers and exported DE/VI VTTs. The source video remains unchanged.

## Final acceptance

- 57 selected bilingual cues, 3 contiguous parts, 21 highlights and 18 source-linked vocabulary cards.
- `npm run test:unit`: all 18 suites passed after the final correction. Evidence: `codex-unit-tests.log`.
- `npx playwright test e2e/kino-we-bare-bears.spec.js e2e/kino-catalog.spec.js e2e/kino-erdmaennchen.spec.js --config=tmp/kino-local.config.cjs`: all 13 tests passed after the final correction, 1.4 minutes. Evidence: `codex-browser-tests.log`.
- Browser checks cover catalog and alias navigation, poster responses, HTTP 206 video seeking, full playback, all three chapter boundaries, DE/VI subtitles and CC, dictation grading, independent persistent progress, vocabulary backlinks, phone layouts and fake-microphone recording. Recording checks validate application flow, not the user's microphone or pronunciation.
- Codex viewed the final desktop overview and mobile lesson screenshots: `review-assets/kino-we-bare-bears-overview-desktop.png` and `review-assets/kino-we-bare-bears-lesson-mobile.png`. The lesson is explicitly labelled as a clip; the subtitle overlay is readable, and the tested phone layout has no horizontal overflow.
- `codex-integration-audit.json` confirms the eight lessons present at task start are unchanged, all cue IDs are unique across the current ten lessons, and the media hash still matches the downloaded source.

Accepted locally on 2026-10-23. Antigravity implemented the source pipeline, subtitles, lesson and integration; Codex performed independent verification and the final editorial correction. No deployment was performed.

## Local preview after tests

The test runner had shut down its temporary server. Codex restarted the normal project server in a managed terminal session. The lesson page now returns HTTP 200 with the We Bare Bears registration, and the video returns HTTP 206 for a 1024-byte range. This confirms the local preview boundary after the successful browser tests. No public deployment was performed.

## Second editorial review

Codex subsequently found and fixed spelling, speaker attribution, a missing question turn and two early timing boundaries. The current source remains 57 cues, with new cue 1100166 replacing 1100112, contentVersion 2, and versioned calibration keys. See `codex-second-review.md` for evidence, exact corrections and the final 18-unit-suite / 9-browser-test run. Historical ASR quotes above retain their original recognized spelling; the current lesson consistently uses the on-screen spelling Esteller.
