# We Bare Bears — Wir und die Mall (Đoạn trích) — Kino source and lesson review

Added locally on 2026-10-23, following the existing Der Nudeltrick / Trudes Tier lesson structure.

## Source

- Series: We Bare Bears – Bären wie wir (episode *The Mall* / *Wir und die Mall*; season numbering not asserted).
- Official publisher clip URL: https://www.youtube.com/watch?v=9vTRSk7Xunc
- Official uploader: Cartoon Network Deutschland (Verified channel).
- Original title: `We Bare Bears | Wir und die Mall | Cartoon Network`
- `isExcerpt: true` — Explicitly labelled as an official clip (`Wir und die Mall (Đoạn trích)`) in the catalog, lesson title, summary, and metadata. Not presented as a full 11-minute episode.
- Why Food Truck (`serienstream.to/serie/we-bare-bears-bren-wie-wir/staffel-1/episode-3`) was not used: the catalog page only exposes an encrypted `/r?t=...` `frameBridge` redirect to third-party hoster VOE, which blocks direct non-iframe navigation and does not provide a direct media stream.
- Local source: `video/we_bare_bears_mall.mp4`, unchanged, 16,310,477 bytes.
- Duration: 274.041905 seconds (ffprobe: `274.04`s video / `274.041905`s audio), H.264 (`avc1.4d401e`) / AAC (`mp4a.40.2`), 640×360, 25 fps, 44.1 kHz stereo.
- SHA-256: `ed020f3851523a1f9846f4a92339d7b4f38cec89608b9996da770376bc51b217`.
- Normal download returned HTTP 200; standard byte-range request returns HTTP 206.

## Spoken language verification

- YouTube's format 18 MP4 container sets the default `eng` tag on the audio stream metadata, so language was verified directly on the audio signal using `faster-whisper` (`small`, `language=None`, `local_files_only=True`) in `language-detection.json`:
  - `opening_sample` (0–60s): `detectedLanguage: "de"`, `languageProbability: 0.9938` (`"Schau, was du mit meinem limitierten Estella-Shirt gemacht hast!"`, `"Meine Mom hat mir das geschenkt!"`, `"Tom, lauf!"`)
  - `middle_sample` (105–165s): `detectedLanguage: "de"`, `languageProbability: 0.9917` (`"In dieser gefährlichen Welt voller Gewalt und Verbrechen..."`, `"Was machen wir jetzt, Tom?"`, `"Bei der Rolltreppe vorne rechts!"`)
  - `ending_sample` (210–274s): `detectedLanguage: "de"`, `languageProbability: 0.9897` (`"Keine Bewegung!"`, `"Einen Schritt näher und das war's für sein Shirt."`, `"Nein, bitte!"`)
- Dialogue matches the visual action verified in `contact-sheet.jpg` and scene frames (`frame-015s-opening.jpg`, `frame-035s-skating.jpg`, `frame-092s-walkie.jpg`, `frame-125s-middle.jpg`, `frame-166s-train.jpg`, `frame-215s-standoff.jpg`, `frame-235s-ending.jpg`).

## Review and scope

- `recognized-words.json` contains the full local faster-whisper `small` recognition with word timings (80 segments). `recognition-complete.json` records completion.
- `medium-rechecks.json` checks 7 windows: 0–30, 50–100, 100–135, 140–185, 148–168, 185–225, and 225–266 seconds.
- `base-rechecks.json` provides 4 tie-break windows: 0–30, 50–135, 148–168, and 140–266 seconds.
- In the 140–185 window, `medium` repeated `"Lauf, Lauf..."` across 142–163s triggered by Panda's repeated shout at 142s; the targeted 148–168s `medium` recheck and `small` recognition resolved all dialogue between 149s and 163s cleanly.
- In the 100–135 window, `medium` hallucinated `"Copyright WDR 2021"` over the instrumental ice-skating music at 133s; that hallucination is omitted.
- Colloquial spoken German (`Wie wär's`, `ich hab 'nen Plan`, `das war's`, `forder mich nicht heraus`, `Klamotten`) is preserved as spoken rather than rewritten into formal prose.
- This is **selected dialogue**, not complete subtitles for every sound, song, or overlapping background shout. Instrumental skating sequences (22–52s, 129–141s), endcard music (265–274s), and uncertain utterances are omitted. The UI explicitly says “Các câu trong bài” and “Lời thoại chọn lọc”.

Excluded draft IDs:

| Draft ID | Time (s) | Reason |
| --- | --- | --- |
| 1100106 | 25.52–26.12 | Low-confidence exclamation (`Cool!` in small vs `Guck!` in base, omitted by medium). |
| 1100118 | 86.02–89.74 | Fictional English arcade game name (*Cop Punch*) is transcribed inconsistently across models (`Copponsch` / `Kopfhansch` / `Koppernscharm`). |
| 1100122 | 96.76–99.36 | Background shouts while running (`Hey, warte!` vs `Hey, bleib still!`; `Ich zeig' dir's!` vs `Hör auf, ich zeig dir's!`) disagree between models. |
| 1100124 | 102.32–107.56 | Verb disagreement (`geht der` / `geht dir` / `gibt er` for *entgeht dir*) in the walkie-talkie tease. |
| 1100133 | 155.20–156.14 | Codex final review: German recognition (`Hey, was seid ihr?`) and Vietnamese meaning disagree; shorter base recheck is inconclusive. Omitted instead of guessing an answer. |
| 1100137 | 168.94–170.22 | `Na, zuschneiden! Nein!` (small) vs `Zusteigen!` (medium) over train whistle sound effect. |
| 1100142 | 188.78–190.50 | Wording disagreement at the end of Tom's panicked protest (`das war doch nicht wahr!` vs `Das war das nicht!`). |
| 1100148 | 207.18–211.62 | Short overlapping shouts during the mall-train collision (`Gris!` / `Wo ist der Weg?` / `Aus dem Weg!`). |

## Lesson output

- Runtime: `we-bare-bears-mall-aligned.js` and `we-bare-bears-mall-lesson.js`.
- Key: `we_bare_bears_mall`, alias: `?kino=bears`.
- Three contiguous clip parts covering `0` to `274.04` seconds:
  1. `0–101.5s`: Rắc rối ở hàng chờ và ca trực bảo vệ (19 cues, 7 picks)
  2. `101.5–182.0s`: Tín hiệu Code Red và cuộc rượt đuổi bằng tàu hỏa (17 cues, 7 picks)
  3. `182.0–274.04s`: Giằng co chiếc áo giới hạn ở sảnh chính (21 cues, 7 picks)
- 57 selected bilingual caption/practice cues (`1100101`–`1100165`), 21 highlighted cues (7 per part).
- 18 vocabulary cards with grammar notes, collocations, examples copied from their actual source cue, and links back to the relevant part (`?kino=bears&part=N`).
- Independent progress key: `vokabelgo_kino_chapters_v1_we_bare_bears_mall`.
- Build summary (`build-summary.json`) has 0 cues below 80% token support from its best recognition.
- Three chapter cover images extracted from the unchanged video into `assets/kino-posters/we_bare_bears_mall-{1..3}.jpg`.

## Codex final editorial review

The final lesson retains 57 selected bilingual cues, 21 highlights and 18 vocabulary cards. Cue 1100133 is excluded after semantic review. Recognition token support is an agreement check, not a transcription accuracy score; this has not been reviewed by a human German speaker. Independent language and audio measurements are saved in `codex-language-check.json` and `codex-earshot.txt`. Final acceptance evidence is in `codex-review.md`.

## Second editorial review

Codex subsequently found and fixed spelling, speaker attribution, a missing question turn and two early timing boundaries. The current source remains 57 cues, with new cue 1100166 replacing 1100112, contentVersion 2, and versioned calibration keys. See `codex-second-review.md` for evidence, exact corrections and the final 18-unit-suite / 9-browser-test run. Historical ASR quotes above retain their original recognized spelling; the current lesson consistently uses the on-screen spelling Esteller.
