# SpongeBob — Blubberunterricht

New official Nickelodeon Deutschland clip, retrieved 2026-10-26. Source and hash are in `source.json`; the original MP4 is unchanged. This is a 3:43 excerpt, not a full broadcast episode.

`lesson-content.json` is the authoritative reviewed input: 19 selected German–Vietnamese dialogue cues, 2 parts, 12 vocabulary cards, 14 Vietnamese practice situations. Root integration uses `scripts/build-kino-short-lessons.py`; no shared registries were changed by this source subtask.

Review: full small/base local ASR; medium crosscheck at7–31.5,57.8–61.1,80–116s; visual contact sheets; German automatic detection (small0.9813/base0.9936); full FFmpeg decode passed. Earshot measured−21.2LUFS,−8.9dBTP,0clipped samples. Audio never uploaded. These checks do not equal native-human listening approval.

See `editorial-decisions.json` for uncertainty and omissions, including repeated chanting, questionable choreography instructions and the publisher outro. Raw ASR is evidence, not final lesson text.

Reproduction: `transcribe.py small`, `transcribe.py base`, `transcribe.py medium "80,116"`, `transcribe.py medium "7,31.5,57.8,61.1" medium-early`, then `compose-lesson.py`, `source-build.py`, `validate-spec.py` using the existing local faster-whisper environment.
