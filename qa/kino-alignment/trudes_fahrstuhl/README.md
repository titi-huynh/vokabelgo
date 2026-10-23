# Kino: Trudes Tier — Fahrstuhl

Selected and added on 2026-10-23 (Asia/Saigon).

## Selection

Reviewed the official descriptions and caption references for **Kuchen**,
**Waschtag**, and **Fahrstuhl**, and contact sheets of Kuchen and Fahrstuhl.
Fahrstuhl was chosen for its sustained everyday dialogue, a compact story,
requests for help, explanations with *weil/wenn*, encouragement and a final
conditional agreement. A2–B1 is an editorial recommendation, not a publisher's
CEFR rating. Kuchen has a longer fantasy/action sequence; Waschtag's available
caption file also contains other broadcast items.

## Source

- Episode: https://www.wdrmaus.de/filme/lachgeschichten/trudes_tier_fahrstuhl.php5
- Publisher: WDR / Die Maus; production: Studio Soi.
- Metadata: https://kinder.wdr.de/tv/die-sendung-mit-der-maus/av/trudes-tier-fahrstuhl-100.assetjsonp
- Actual file: `video/trudes_fahrstuhl.mp4`, 61,722,398 bytes, 1280×720,
  H.264/AAC; measured duration 411.92 seconds (displayed as 06:52).
- SHA-256: `9dafc7c54a45f779d69915206b8288189ab92b0b7ab8a5312dccc0be0130c1ad`.
- The source metadata says 387 seconds, but the actual file includes an opening
  and credits. No video or audio was cut, stretched, or rewritten.
- Source metadata and the original WDR VTT reference are retained next door in
  `../trudes-tier-review/`. The WDR captions contain shortened wording and use
  different edit timings. They are **not** the answer key for this local video.

## Speech and learning content

The entire local source was recognized with local faster-whisper small, with
word timings. Six ambiguous windows were rechecked with local medium. No audio
was sent to an external model. Machine recognition is evidence, not human
listening certification. Pictures were inspected on the contact sheet.

`reviewed-lines.tsv` records German text, Vietnamese translation, speaker and
source times. `build-trudes-fahrstuhl.py` snaps endpoints to the available word
evidence and builds 81 selected caption cues and 80 practice units. The two
clauses of the final *wenn … dann* sentence form one practice unit. Music,
incidental exclamations and some difficult speech are outside the selected
lesson; the UI therefore says **Các câu trong bài**, rather than claiming to
contain the whole script. Four unresolved lines are excluded from exercises;
the reasons remain in `build-summary.json`.

Five story sections each offer seven highlights and the other selected lines.
Twenty flashcards reference their actual practice cue and section. Lesson,
writing progress and speaking recording keys are independent of other films.

Local earshot timeline inspection of the entire original file measured
−23.1 LUFS integrated, −3.7 dBTP true peak, 7.3 LU loudness range and zero clipped
samples. Broad sound tags are approximate; they were not used to identify
spoken words or speakers.

## Validation

- Browser flow: catalog → episode → section → DE/VI captions → dictation →
  reload/resume; original media byte-range requests and stop boundaries.
- Full movie opens the unchanged video and stops on closing the dialog.
- Speaking can record a real MediaRecorder blob from a **simulated microphone**
  before completing dictation. This checks the flow, not a person's microphone
  or pronunciation quality.
- Vocabulary opens only the new 20-card deck; seeded Peppa progress stays intact.
- Desktop and phone screenshots: `review-assets/kino-trudes-overview-desktop.png`
  and `review-assets/kino-trudes-lesson-mobile.png`.
- Browser tests: `e2e/kino-trudes-tier.spec.js`; existing Kino catalog, Peppa,
  Bluey and Hans tests are regression coverage.
- The unit-test browser harness now loads the actual external lesson scripts
  before the inline app script. Its XSS assertion searches for the test card,
  which can otherwise fall outside the existing 300-row display limit as decks
  grow. No security assertion was removed or relaxed.

This is a local workspace addition. No production deployment was performed.
