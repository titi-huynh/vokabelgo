# Der Nudeltrick — Kino source and lesson review

Added locally on 2026-10-23, following the existing Trudes Tier lesson structure.

## Source

- Series: Ein Fall für die Erdmännchen, season 1.
- Publisher page: https://www.kika.de/ein-fall-fuer-die-erdmaennchen/videos/der-nudeltrick-s-e-100
- Publisher metadata: https://www.kika.de/ackley/v1/videos/der-nudeltrick-s-e-100
- Publisher assets: https://www.kika.de/ackley/v1/videos/der-nudeltrick-s-e-100/assets
- Exact media URL: https://ndr-progressive.ard-mcdn.de/progressive/2026/0423/TV-20260423-2135-2900.hd.mp4
- Local source: `video/erdmaennchen_nudeltrick.mp4`, unchanged, 268142935 bytes.
- Duration: 746.92 seconds, H.264/AAC, 1280×720.
- SHA-256: `2a956e7509ea72730608ace97c91d94462a5337e30c0f01442450d86e99664f2`.
- Normal download returned HTTP 200; standard byte-range request returned HTTP 206. No account or regional workaround was used. Publisher metadata reports `transmissionType: online` and `hasSubtitle: false`.

## Review and scope

- The whole video was decoded into a 30-second contact sheet (`../erdmaennchen-nudeltrick-contact-sheet.jpg`) and checked against the plot and local recognition of the whole audio. Additional frames checked the audience/police scene at 195–235 seconds.
- `recognized-words.json` contains the full local faster-whisper small recognition with word timings. `recognition-complete.json` records completion.
- `medium-rechecks.json` checks 12 windows: 25–54, 91–136, 141–181, 249–272, 304–356, 434–499, 504–555, 610–646, 650–725, 194–242, 357–434 and 570–610 seconds.
- `base-rechecks.json` provides four targeted tie-breaks: 141–181, 444–477, 603–621 and 670–725 seconds.
- The medium model hallucinated repeated filler in part of the 194–242 window. That filler is not in the lesson. The small model's full recognition and the visual sequence are used for that scene instead.
- German wording and Vietnamese translations were reviewed together. Proper names were checked against publisher information. Jan and Henry are jointly labelled rather than assigning their voices without sufficient evidence. Some humans are labelled by role.
- This is **selected dialogue**, not complete subtitles for every sound, song or utterance. Opening music, credit audio, filler and uncertain speech are omitted. The UI explicitly says “Các câu trong bài” and “Lời thoại chọn lọc”.
- Recognition is machine evidence, not a human German-speaker review or a guarantee of perfect transcription. Ambiguous graded answers were removed rather than filled in from the plot.

Excluded draft IDs:

| ID | Reason |
| --- | --- |
| 900116 | Uncertain word for the pocket; both models differ from the guessed Jackentasche. |
| 900133 | Article before Zauberer differs between recognitions. |
| 900168 | da/denn disagreement in the reprimand. |
| 900173 | denn/Ding disagreement in the short question. |
| 900216 | kann/kenne and wording of the escape-trick claim disagree. |
| 900220 | wedelt/wickelt disagreement in the explanation. |
| 900221 | Uncertain verb ending and article in the thank-you line. |

The repeated `der` in 900175 and the particle `denn` in 900223 follow medium/base agreement. Omission of `doch` in 900219 follows that same agreement. The colloquial construction `den Leuten ihr Geld` in 900205 is preserved, not silently changed to formal German.

## Lesson output

- Runtime: `erdmaennchen-nudeltrick-aligned.js` and `erdmaennchen-nudeltrick-lesson.js`.
- Alias: `?kino=nudeltrick`.
- Seven contiguous film parts, covering the original source from 0 to 746.92 seconds.
- 138 selected bilingual caption/practice cues, 49 highlighted cues (7 per part).
- 24 vocabulary cards with grammar notes, examples copied from their actual source cue and links back to the relevant part.
- Independent progress: `vokabelgo_kino_chapters_v1_erdmaennchen_nudeltrick`.
- `reviewed-lines.tsv` is the reviewed input. The builder emits the DE/VI VTT files, cue JSON, alignment audit and source hash.
- Word-timing envelopes include a small lead-in/tail and remain non-overlapping. Build summary has no cue below 80% token support from its best recognition; that metric is a consistency check, not transcription accuracy.
- Seven cover images are extracted from the unchanged video.

## Audio measurements

Earshot reviewed the entire 746.92-second video locally. Its summary is saved in `earshot-summary.txt`: integrated loudness −16.0 LUFS, true peak −0.9 dBTP, loudness range 10.2 LU. The source audio was not remixed. Earshot does not recognize speech; dialogue text comes from the local speech models above.

## Verification

- All 18 existing unit/acceptance suites passed after registration.
- 13 unique browser tests passed: the five new episode tests, three catalog tests and five Trudes Tier regression tests.
- Checks cover all seven parts playing and stopping at their own bounds, matching DE/VI caption rendering and CC toggle, full-video playback, HTTP byte ranges, covers, source-linked vocabulary, dictation grading, seven-cue mode, independent persistent progress, browser navigation and mobile widths 320/390/768.
- Speaking was tested with Chromium's fake microphone and real MediaRecorder blobs; this checks the recording flow, not the user's microphone or pronunciation.
- Desktop/mobile screenshots: `review-assets/kino-erdmaennchen-overview-desktop.png` and `review-assets/kino-erdmaennchen-lesson-mobile.png`.

## Missing-line review — 2026-10-27

All 12 candidate windows were independently checked with small and medium, followed by tight/context rechecks. Added 20 cues (900226–900245), for 138 total; all 118 previous cues, chapter picks and 24 flashcards are unchanged. Short magic-show utterances are separate cues.

The original excluded-ID table above records the initial review. The later independent evidence resolves draft 900220 under fresh ID 900244; 900220 remains reserved. The other uncertain parts remain outside runtime data.

Final wording, word evidence, exclusions, unresolved parts and checks: [Vietnamese report](../nudeltrick_missing_20261027/BAO-CAO-KIEM-CHUNG-NUDELTRICK-2026-10-27.md) and [review.json](../nudeltrick_missing_20261027/review.json). This is machine recognition evidence, not human listening approval.
