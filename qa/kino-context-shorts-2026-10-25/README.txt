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
kino-short-scenes.js is the lightweight runtime source. There are no video
downloads on catalog entry; only the active Short owns a media source.

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

The initial source-range audio measurements are in audio-measurements.json.
The subsequent picture/loudness polish renders 12 standalone MP4 clips using
scripts/build-kino-shorts-media.py (ffmpeg two-pass loudnorm, target -18 LUFS,
true-peak target -2 dBTP). The 26.09 MB of clips are ordinary static Git assets,
so Vercel can serve them directly without the source-movie release redirects.
Only the Short is normalized; full-film lessons keep their original media.

normalized-media.json records source ranges, SHA-256, stream dimensions, ffmpeg
pass results and independent local earshot api.measure(light=True) results.
Decoded clip loudness spans -18.0 to -17.8 LUFS (0.2 LU spread, originally
14.3 LU); the highest decoded true peak is -1.5 dBTP. No new speech or music
was generated. Subtitle times remain in the original movie time domain, with
an explicit offset for the zero-based clip player and unchanged lesson links.
Measurements do not certify transcription accuracy. The existing edited
subtitles have not had a new full native-speaker listening pass.

On desktop >=900px, the picture and its controls occupy a separate large
column beside the caption/action column. The native frame ratio is retained;
phone screens continue to use the compact vertical layout.

Polish validation: 19 acceptance suites and 14 browser checks pass. The latter
cover all 12 normalized clips, original-time subtitle alignment, replay/seek,
exact lesson links, 360x640 and 1519x667 layouts, pending-load cancellation,
missing-clip recovery, and regression of full-film quality switching.

Visual evidence: scene-contact-sheet.jpg and review-assets/kino-context-shorts-*.png.
