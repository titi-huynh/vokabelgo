# Die schmucklose Gräfin — Kino source and lesson review

Added locally on 2026-10-23, following the existing Der Nudeltrick / Trudes Tier lesson structure.

## Source

- Series: Ein Fall für die Erdmännchen, season 1, episode 4.
- Publisher page: https://www.kika.de/ein-fall-fuer-die-erdmaennchen/videos/die-schmucklose-graefin-s-e-100
- Publisher metadata: https://www.kika.de/ackley/v1/videos/die-schmucklose-graefin-s-e-100
- Publisher assets: https://www.kika.de/ackley/v1/videos/die-schmucklose-graefin-s-e-100/assets
- Exact media URL: https://ndr-progressive.ard-mcdn.de/progressive/2026/0423/TV-20260423-2147-0600.hd.mp4
- Local source: `video/erdmaennchen_schmucklose.mp4`, unchanged, 269,615,835 bytes.
- Duration: 722.48 seconds (ffprobe), H.264/AAC, 1280×720, 50 fps.
- SHA-256: `037acc3d885e731b24cc18649599191f55c1a184ba1627fb85562e8fd52b944a`.
- Normal download returned HTTP 200; standard byte-range request returned HTTP 206. No account, VPN, or regional workaround was used. Publisher metadata reports `transmissionType: online` and `hasSubtitle: false`.

## Review and scope

- The whole video was decoded into a 30-second contact sheet (`../erdmaennchen-schmucklose-contact-sheet.jpg`) and checked against the plot and local recognition of the whole audio.
- `recognized-words.json` contains the full local faster-whisper small model recognition with word timings (238 segments). `recognition-complete.json` records completion.
- `medium-rechecks.json` contains 11 actual windows: 25–56, 70–125, 155–205, 215–248, 270–335, 335–395, 400–450, 495–555, 565–620, 630–665, 670–722 seconds.
- `base-rechecks.json` contains 6 actual tie-break windows: 90–125, 300–335, 430–450, 500–530, 570–600, 680–715 seconds.
- German wording and Vietnamese translations were reviewed together. Proper names were checked against publisher information. Jan and Henry are jointly labelled rather than assigning individual voices without definitive acoustic isolation. Characters (Gräfin, Elefant, Elster, Wilhelm) are labelled by role.
- This is **selected dialogue**, not complete subtitles for every sound, song or utterance. Opening music, credit audio, filler and uncertain speech are omitted. The UI explicitly says “Các câu trong bài” and “Lời thoại chọn lọc”.
- Recognition is machine evidence, not a human German-speaker review or a guarantee of perfect transcription. Ambiguous graded answers were removed rather than guessed from the plot.

Excluded/adjusted cues from the discarded 179-cue draft (IDs below are draft IDs, before renumbering, not final runtime IDs):

| ID | Issue & Decision |
| --- | --- |
| 1000107 | Acoustic ambiguity between "bei ihr" / "bei dir" / "bei der" ("Was will denn die Polizei..."). Excluded from practice cues to maintain strictly verified grading. |
| 1000121 | Split question vs claim, extended boundary to 91.60s ("Strickweltmeisterschaft?") to avoid cutting the interrogative turn. |
| 1000196 | Re-aligned start from 354.56s to 352.24s based on medium recheck envelope ("So wie den Schmuck..."). |
| 1000198 | Re-aligned start from 368.36s to 367.24s to capture full initial consonant ("Und sie hatte eine Tüte Erdnüsse dabei"). |

## Lesson output

- Runtime: `erdmaennchen-schmucklose-aligned.js` and `erdmaennchen-schmucklose-lesson.js`.
- Alias: `?kino=schmucklose`.
- Seven contiguous film parts, covering the original source from 0 to 722.48 seconds.
- 166 selected bilingual caption/practice cues, 49 highlighted cues (7 per part).
- 24 vocabulary cards with grammar notes, collocations, natural Vietnamese, examples copied from their actual source cue and links back to the relevant part (`?kino=schmucklose&part=N`).
- Independent progress key: `vokabelgo_kino_chapters_v1_erdmaennchen_schmucklose`.
- `reviewed-lines.tsv` is the reviewed input. The builder emits the DE/VI VTT files, cue JSON, alignment audit and source hash.
- Word-timing envelopes include a small lead-in/tail and remain non-overlapping. Build summary has 0 cues below 80% token support from its best recognition.
- Seven cover images are extracted from the unchanged video into `assets/kino-posters/erdmaennchen_schmucklose-{1..7}.jpg`.

## Audio measurements

Measurement on the entire 722.496-second video audio (`codex-audio-measurement.txt`):
- Integrated loudness: −16.0 LUFS
- True peak: −1.0 dBTP
- Loudness range (LRA): 7.6 LU
- Noise floor: −39.4 dBFS
- Bandwidth: 20.5 kHz
The source audio was not remixed. Earshot does not recognize speech; dialogue text comes from the local speech models above.

## Verification

- Registered in `index.html` (dropdown `#kinoDD_erdmaennchen_schmucklose`, badge `#kinoBadge_erdmaennchen_schmucklose`, `VIDEO_FLASHCARDS`, `KINO_VIDEOS`).
- Registered in `kino-metadata.js`, `kino-data.js`, `kino-chapter-data.js`.
- Dedicated E2E suite `e2e/kino-erdmaennchen-schmucklose.spec.js` covers:
  - Discoverability and metadata in catalog
  - Poster availability and 16:9 ratio
  - HTTP 206 partial content range support
  - Full movie playback modal
  - 7 contiguous chapter bounds and playback stopping at boundaries
  - Bilingual DE/VI captions and CC toggle
  - 7-cue focus selection vs all-cues mode
  - Dictation verification (correct and wrong answers)
  - Isolated persistence storage key
  - 24 vocabulary flashcards with working deep links
  - Mobile viewports (320px, 390px, 768px)
  - Simulated audio recording flow with fake microphone.
