# Operation Quietschsauber — source and selected lesson

Official source: [Nickelodeon Deutschland on YouTube](https://www.youtube.com/watch?v=_6qcFEES_yc), verified channel `UCQU3PO2g_rmqbmr8VJWvrsA`, published 2014-08-09. This is a **short television-series excerpt**, not a full episode, and differs from the previously integrated Popcorn-Panik source.

Unchanged media: `video/pinguine_quietschsauber.mp4`, 126.966712 seconds, 640×360 H.264/AAC, 7,029,741 bytes. SHA256: `7207bc13941e5024551b7e09bc02318162f1bcd3e6251b8dd2b212fddfd3bd94`. Whole-file FFmpeg decoding passed.

`lesson-content.json` follows `scripts/build-kino-short-lessons.py`: key `pinguine_quietschsauber`, alias `pinguine-quietschsauber`, symbol `PINGUINE_QUIETSCHSAUBER`, stem `pinguine-quietschsauber`. It contains 21 selected German–Vietnamese cues (IDs 1700101–1700121), two chapters, seven picks per chapter, 13 cue-linked vocabulary cards and 14 Vietnamese usage contexts. It is not an exhaustive subtitle transcript. Codex reviewed and built the final runtime files and unified the alias during integration.

Evidence:

- `source.json`, `publisher.info.json`, `ffprobe.json`: provenance and media verification.
- `language-check.json`: automatic base-model identification of German at 0–30s (.9813) and 45–75s (.9927). The low-confidence en result for 90–120s is inconclusive and not used as German evidence; this window is predominantly action/music.
- `recognized-words.json`, `recognition-complete.json`: full local small-model word ASR (46 segments, 199 words).
- `medium-recheck.json`, `medium-complete.json`: three medium-model dialogue checks.
- `closing-check.json`: automatic base-model check at 76–88s.
- `contact-sheet.jpg`, timestamped frames: visual context and speaker review.
- `earshot-measure.json`: −20.7 LUFS, −8.4 dBTP, zero clipped samples. Earshot measures audio; ASR supplies language evidence.
- `editorial-review.json`: omitted uncertain wording and normalization decisions.
- `validation.json`, `reviewed-lines.tsv`: schema/range/reference checks and inspectable dialogue.

Method is local ASR comparison plus visual review; no claim of personal hearing or native-human full listening approval. Speaker assignments are contextual and may be generalized during root review.
