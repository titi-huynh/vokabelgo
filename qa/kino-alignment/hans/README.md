# Hans im Glück — local Kino preview

Prepared 2026-10-23 (Asia/Saigon). Preview: http://localhost:3000/?kino=hans

## Delivered

- Original `video/hans.mp4`, unchanged, 570.862585 seconds (09:31).
- 138 short German/Vietnamese caption cues and 122 complete practice units. Eleven explicitly reviewed groups combine clauses cut across the original subtitle boundaries; no caption words are removed by grouping.
- Four continuous lesson sections: 0–154.8, 154.8–274.6, 274.6–418.6, 418.6–539.4 seconds.
- The whole story ends with Hans returning to his mother. Promotional outro after the story is intentionally outside the lesson; the full-video button retains the entire source.
- Complete dialogue is the default for listening, writing and speaking: 32 / 27 / 37 / 26 practice units across the four sections (122 total), including narration and character speech. Seven highlights per section remain an explicit short-mode option.
- Existing first-preview Hans progress migrates once from the old implicit seven-cue default to complete dialogue without losing completed cues or watched sections. Later explicit mode choices are remembered.
- Content revision 2 retains all original completion IDs. A new grouped sentence is marked complete only if all its previous fragments were completed; partial original records remain stored.
- 24 vocabulary cards, exact source examples, noun genders/plurals and useful collocations.
- Four 960 × 540 covers extracted from the source, visually inspected.
- Separate Hans progress storage; existing movie keys and completed progress are preserved.

## Reproduction

Run from the project root, using the existing local model/environment:

```powershell
& 'tmp/peppa-align-venv/Scripts/python.exe' scripts/transcribe-kino.py hans
& 'tmp/peppa-align-venv/Scripts/python.exe' scripts/build-hans-lesson.py
node scripts/build-kino-posters.cjs hans
python scripts/review-hans-youtube.py
python scripts/report-hans-content.py
npx playwright test e2e/kino-hans.spec.js --config=tmp/kino-local.config.cjs
```

`reviewed-lines.tsv` is the edited bilingual source. `practice-groups.json` records the editorial grouping, complete German/Vietnamese text and reasons. `recognized-words.json` retains local Whisper word timings; `recheck.json` retains the first targeted recognition. The builder exports `hans-aligned.js` (both caption and practice arrays), `hans-aligned.json` (practice units), `caption-cues.json`, German/Vietnamese WebVTT (short captions) and an alignment audit. `hans-lesson.js` owns the new movie metadata, chapters and vocabulary. `content-review.tsv` provides every subtitle, translation, semantic speaker and corresponding practice unit. `content-review-report.json` records the actual language changes and limits.

## Evidence and limits

- Full source transcribed locally with faster-whisper small / CPU int8. The original `hans_scan.json` covered only the first 150 seconds, so it was not treated as a complete transcript.
- The content pass adds two independent overlapping-window reviews (29 windows each, base and small), followed by five targeted medium-model checks and additional cropped rechecks. All audio processing stays local. Models downloaded from Hugging Face; the audio was not uploaded.
- Initial word correspondence between edited text and recognition: approximately 96%. This measures token correspondence, **not** subtitle accuracy. Corrected text was aligned again using Whisper cross-attention. This remains AI-edited and machine-cross-checked, not a human-certified transcription.
- The stronger checks retain `Gebt mir meinen Lohn`, restore `Schleifrad` and `habe`, and remove an unsupported `Aber`. The earlier short-crop suggestion `Gib` was overturned by full-context evidence.
- At caption 400155 (about 03:55), recognizers consistently favor `aus seinem Schubkarren`; this is retained rather than silently normalized to the more idiomatic `auf`. Targeted medium alignment favors aus (0.7015) over auf (0.2868). The actual YouTube transcript also uses aus. The editorial decision is complete: keep the source-correlated wording and record the unusual preposition as residual uncertainty. These are corroborating sources, not a human certificate of the exact sound.
- YouTube source cross-check on 2026-10-23: opened https://www.youtube.com/watch?v=eyohPTKZBA8 in the browser and expanded its actual transcript. Its 03:54 segment also reads `aus seinem schubkarren`. The uploader's written description independently supports `Gebt mir meinen Lohn`. The transcript also supports the edited `Schleifrad`, `habe`, and absence of `Aber` before `Du wusstest dir immer zu helfen`. It contains clear recognition errors elsewhere (for example `kugel rom` for `Kuh herum`), so it is corroboration rather than a certified script. No runtime wording was changed based on this check. Saved rendered-page evidence: `youtube-transcript-page.txt`, `youtube-transcript-check.json`, and `review-assets/kino-hans-youtube-transcript.png`.
- Complete follow-up comparison: all 75 captured YouTube chunks reviewed, with explicit mappings for all 138 German/Vietnamese captions. The ledger `youtube-full-comparison.tsv` / `.json` separates story, music and promotional outro. Five additional unprompted medium-model crops (`youtube-difference-medium-rechecks.json`) check the substantive discrepancies: the horse's movement, sung possessive, short imperative, goose fat and final return. Combined local evidence supports keeping the existing German wording rather than importing YouTube recognition errors. This pass polishes Vietnamese caption 400168 and clarifies the lieber vocabulary grammar. All 122 practice IDs, 138 caption IDs and saved progress remain compatible. This is a completed AI editorial review for local lesson use, not a human-certified transcript.

To reproduce the complete source comparison after alignment, run `python scripts/review-hans-youtube.py` before `python scripts/report-hans-content.py`. Acoustic evidence can be regenerated locally with `tmp/peppa-align-venv/Scripts/python.exe scripts/recheck-hans-youtube-differences.py`; audio is not uploaded.
- Earshot full-file measurement: -17.8 LUFS integrated, 0.0 dBTP true peak, 2 clipped samples, 4.7 LU loudness range. No audio processing or source video recompression was applied.
- Every runtime cue has a translation and positive duration, belongs to exactly one section and does not overlap adjacent cues. Every caption ID expands into exactly one practice unit, in chronological order, and grouping is asserted to preserve every spoken token. All highlight references remain valid. Short captions remain under 6.5 seconds; complete narration in optional full practice can be longer (maximum about 15.2 seconds).
- HTTP media Range verified with a real 1024-byte request: 206 and correct Content-Range.
- 9 Hans browser tests cover catalog/media/data, four-part viewing/subtitles/boundaries, optional short-mode dictation/resume, every full practice unit in listening/writing, mode migration, content migration and all-caption coverage, vocabulary, mobile/navigation, and recording/replay with a fake microphone. Mobile tests emulate viewport sizes; physical devices and the user's actual microphone were not tested. Browser tests do not establish transcription accuracy.
- Final YouTube-review revision: all 9 Hans tests passed in 1.3 minutes (`npx playwright test e2e/kino-hans.spec.js --config=tmp/kino-local.config.cjs --output=tmp/hans-youtube-final-results`). Source-comparison and content-report assertions pass; both runtime scripts pass Node syntax checks. The user's existing part-2 browser tab was refreshed and both listening and writing visibly show 27 complete units, including narrator text. Final screenshot: `review-assets/kino-hans-content-final.png`.
- 29 existing Kino browser tests passed. Daily progress, core learning loop and FSRS acceptance suites passed.
- Screenshots: `review-assets/kino-hans-overview-desktop.png`, `review-assets/kino-hans-lesson-mobile.png`.

## Publication

No deployment, remote upload or R2 account configuration was performed. Hans is no longer excluded as an inactive draft in `.gitignore`, so a future source deployment will not silently omit its required MP4. Source provenance/distribution permission has not been established by this local preview. Confirm the intended publication route before public release; the source can later be moved to external media storage by changing the movie configuration.
