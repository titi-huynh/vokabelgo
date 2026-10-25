Kino contextual Shorts pilot — 2026-10-25

12 editorial scenes from 11 existing films, 16.94–33.18 seconds each.
Antigravity selected six cartoon/family scenes through the local bridge.
Muse selected six anime/fairy-tale scenes through the VokabelGo web conversation.
Codex checked exact practice cue IDs/text, chapter containment, complete caption
boundaries, short titles, runtime integration and browser behavior. Boundaries
include a small gap before/after complete captions without crossing a chapter.

selection.json is the final editorial record, including timed context captions,
the focus line, original suggestions, adjusted bounds and selection rationale.
anti-candidates.json and muse-candidates.json preserve the two selection inputs.
kino-short-scenes.js is the lightweight runtime source. Existing movies are
reused with bounded playback; there are no new video downloads on catalog entry.

Verified:
- All 12 existing source videos play within their scene bounds and loop there.
- German/Vietnamese captions change with the actual source dialogue.
- Word lookup, likes and saved cards retain source context and translation.
- Lesson navigation selects the exact film-qualified cue, including cues outside
  the default seven suggestions.
- Close, fast reopen and tab hiding cancel pending playback; inactive sources
  are released. Keyboard and dialog focus are preserved.
- 360x640 mobile layout and desktop layout were inspected.
- node test-all.js: 19 acceptance suites pass.
- e2e/kino-context-shorts.spec.js, kino-shorts-feed.spec.js,
  kino-catalog.spec.js and kino-three-step.spec.js: 13 browser tests verified.
  The three-step fixture used the retired label "Viết"; it was updated to the
  existing live label "Luyện 7 câu →" before verifying the same assertions.

Audio measurements use local earshot api.measure(light=True) on each source
range; see audio-measurements.json. Audio is unchanged and no voice synthesis,
music overlay or volume processing was added. Measurements do not certify
transcription accuracy. This pilot uses the existing edited subtitle data;
there has not been a new native-speaker listening pass over all source dialogue.

Visual evidence: scene-contact-sheet.jpg and review-assets/kino-context-shorts-*.png.
