# ANTIGRAVITY INDEPENDENT BLIND VERIFICATION HANDOFF — DRUCK S07E01 ("Alles ist verzaubert")

## 1. Executive Summary & Final Recommendation

- **Lesson / Key**: `druck_s07e01` (`DRUCK_S07E01_ALIGNED_UTTERANCES` in [`druck_s07e01-aligned.js`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/druck_s07e01-aligned.js))
- **Base Revision**: `215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d` on branch `codex/kino-druck-s07e01-missing-lines`
- **Source Video**: [`video/druck-s07e01.mp4`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/video/druck-s07e01.mp4)
  - Bytes: `92708650` (92,708,650 bytes)
  - SHA256: `c2433e3cc318bfe477b85392446bb56c8568a2faa4f39eea15c98d0361aa1774`
  - Container Duration: `1278.08s`
  - Decoded 16 kHz mono `float32` samples: `20447232` (`1277.9520s`)
  - Decoded 16 kHz `float32` SHA256: `3c5233fe4caecf54d8a00cc80c40c2af9606b8e11f942d1e4eae8fb0498c240c`
- **Baseline Integrity**: [`baseline-cues-268.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/baseline-cues-268.json) verified (`268` units, IDs `500001..500268`, `parentId` `1..268`, `0` units with `speaker` field, `7` chapters, `45` practice picks immutable).
- **Human Listening**: `humanListened: false` across all runs and analysis. No human hearing is asserted anywhere in this verification.
- **Decision Summary across the 8 Candidate Windows**:
  - **Candidates to ADD**: **0** (`0` new utterances satisfy the strict dual-model literal dialogue + clear non-overlapping timing gate).
  - **Candidates to EXCLUDE**: **5** (Windows **1, 3, 4, 6, 8** — rap/song lyrics, music transitions, silence/noise hallucinations, and already-covered exclamations/screams).
  - **Candidates to HOLD (`reviewNeeded`)**: **3** (Windows **2, 5, 7** — party/classroom overlap or single-model/low-confidence fragments outside existing cues where `small` and `medium` do not agree on literal dialogue).

---

## 2. Independent Blind Phase Execution & Artifacts

Before inspecting any existing captions, Muse scan files, or Codex ASR outputs, Antigravity created [`run-independent-asr.py`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/run-independent-asr.py) and executed sequential foreground recognition on the 8 wider context windows in [`anti-context-spec.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/anti-context-spec.json):

- **Python Environment**: `C:/Users/huynh/OneDrive/Desktop/flash/tmp/peppa-align-venv/Scripts/python.exe` (`ctranslate2 4.6.0`, `faster-whisper 1.2.1`)
- **Models & Options**:
  - Models: local `small` and `medium`
  - Device / Compute: `device="cpu"`, `compute_type="int8"`, `cpu_threads=3`, `local_files_only=True`
  - Decode options: `language="de"`, `beam_size=5`, `temperature=0`, `word_timestamps=True`, `condition_on_previous_text=False`, `vad_filter=False`, `initial_prompt=None`, `hotwords=None`
- **Generated QA Evidence**:
  - [`run-independent-asr.py`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/run-independent-asr.py)
  - [`anti-progress.txt`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/anti-progress.txt) (logged after every crop and every model; `BLIND_ASR_RUN_COMPLETE status=SUCCESS`)
  - [`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json) (`8/8` windows complete, `48` segments, `273` words, `79.269s`, `humanListened: false`)
  - [`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json) (`8/8` windows complete, `48` segments, `257` words, `199.162s`, `humanListened: false`)

---

## 3. Window-by-Window Comparison Against Baseline (268 Cues) & Candidate Package

### Window 1 — Candidate 1
- **Anti Context Crop**: `9.61s – 48.19s` (`cropDecoded16kFloat32Sha256`: `600ee3641e88c3b9b812c3d1eff726f41c1c1e9bff04c0f62fd32c781c31fab2`)
- **Muse Candidate Window**: `15.61s – 42.19s` (speech region `16.81s – 40.99s`)
- **Baseline Coverage in/near Window**:
  - `500001` (`0.04s – 3.68s`): `# Ich hab, was du brauchst.` (marked with `#` as song lyrics)
  - *Uncovered gap `3.68s – 38.64s`*
  - `500002` (`38.64s – 40.60s`): `"Hey, bist du schon zurück, Habibi?"`
  - `500003` (`40.72s – 44.04s`): `"Ich hoff, du hattest 'ne gute Zeit mit deinen fancy Friends."`
  - `500004` (`44.16s – 46.56s`): `"Auch wenn ich nicht dabei war."`
  - `500005` (`47.64s – 50.24s`): `"Ich hab mich aber gut um deine Babys gekümmert."`
- **Independent Raw ASR Findings**:
  - **Uncovered region (`9.61s – 37.89s`)**:
    - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L66-L701), win 1 segs 1–12):
      - seg 1 (`9.61–11.53s`, `noSpeechProb: 0.695`): `" Einfach nur wangen wohin"`
      - seg 2 (`16.65–18.01s`): `" Deine Augenflugzeugfenster"`
      - seg 3 (`18.61–19.93s`): `" Brauchst paar schnelle Nächte"`
      - seg 4 (`19.93–21.95s`): `" Muss was aus dem Kopf kriegen"`
      - seg 5 (`22.87–23.55s`): `" Inception"`
      - seg 6 (`23.55–26.33s`): `" Ruf mich an, ich bin in fünf Minuten ready"`
      - seg 7 (`26.33–28.69s`): `" Steig in Schatte, geht für dich mein Bestes"`
      - seg 8 (`28.69–30.95s`): `" Bring noch ein Sixer-Bax mit Wolkenbauen"`
      - seg 9 (`30.95–32.11s`): `" Apropos Paläste"`
      - seg 10 (`32.11–34.13s`): `" Himmel glücklich, da flackern"`
      - seg 11 (`34.13–35.87s`): `" Mein Gefühl ist, wird heftig"`
      - seg 12 (`35.87–37.69s`): `" Alle zehn Sekunden, eine Message"`
    - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L66-L709), win 1 segs 1–12):
      - seg 1 (`9.61–11.61s`, `noSpeechProb: 0.727`): `" Einfach nur wandern, wohin?"`
      - segs 2–12 (`16.73–37.89s`, `noSpeechProb: 0.727`): `" Deine Augen, Flugzeug, Fenster"` / `" Brauchst paar schnelle Nächte"` / `" Musst was aus'm Kopf kriegen"` / `" Inception"` / `" Ruf mich an, ich bin in 5 Minuten ready"` / `" Steig in Schatte, geb für dich mein Bestes"` / `" Bring noch ein Sixer-Bags mit Wolken"` / `" Bau'n Aporool-Paläste"` / `" Himmelglütlichter flackern"` / `" Mein Gefühl, es wird heftig"` / `" Alle 10 Sekunden eine Message"`
  - **Covered region (`38.64s – 46.56s`)**:
    - `small` segs 13–15 (`38.83–45.27s`, lines 703–922) and `medium` segs 13–14 (`39.11–45.41s`, lines 711–923) reproduce baseline cues `500002`, `500003`, `500004` (`"Hey, bist du schon zurück, KWB/KBB? Ich hoffe, du hattest eine gute Zeit mit deinen fancy friends. Auch wenn ich [nicht] dabei war."`).
- **Classification & Verdict**: **EXCLUDE**
  - `9.61s – 37.89s` is the intro rap/song track (continuing the `#` song in `500001`), with high `noSpeechProb` (`0.695` / `0.727`) and rhyming verse structure (`Nächte / Bestes / Paläste / Message`). Songs/rap must not become new dialogue cues.
  - `38.64s – 46.56s` is already covered by baseline cues `500002–500004`.

---

### Window 2 — Candidate 2
- **Anti Context Crop**: `136.68s – 163.51s` (`cropDecoded16kFloat32Sha256`: `3be41ca1c8edb601336dd790d9f88c99efe8966876f618545679ebefeabc9759`)
- **Muse Candidate Window**: `142.68s – 157.51s` (speech region `143.88s – 156.31s`, Muse ASR had `"Oh, Digger!"`, `"Wuuuh!"`, `"Geil, okay."`, `"Leute? Wollt ihr noch Lächer?"`)
- **Baseline Coverage in/near Window**:
  - `500037` (`136.64s – 138.16s`): `Leute, wie wär's hiermit?`
  - *Uncovered gap `138.16s – 146.84s`*
  - `500038` (`146.84s – 149.16s`): `Oh, Digga! - Whoo, geil! Okay.`
  - *Uncovered gap `149.16s – 156.44s`*
  - `500039` (`156.44s – 159.28s`): `Leute, wollt ihr noch ein letztes Familienfoto machen?`
  - `500040` (`159.40s – 161.00s`): `Jaaa! - Na dann kommt.`
  - `500041` (`162.20s – 163.52s`): `Okay. - Aufstellen.`
- **Independent Raw ASR Findings**:
  - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L948-L1182), win 2 segs 1–6):
    - seg 1 (`136.68–137.22s`): `" Wie wärst du hiermit?"` → overlaps `500037` (`136.64–138.16s`).
    - seg 2 (`145.68–146.32s`, words `145.44–146.32s`): `" Hot Digger!"` (`Hot` prob `0.130`, `Digger!` prob `0.675`) → early onset of `500038` (`Oh, Digga! - Whoo, geil! Okay.`, `146.84–149.16s`).
    - seg 3 (`147.52–148.78s`): `" Geil, okay."` → inside `500038` (`146.84–149.16s`).
    - seg 4 (`155.48–158.36s`): `" Leute, wollt ihr noch ein letztes Familienfoto machen?"` (`Leute,` `155.48–156.32s` prob `0.410`, `wollt` `156.32–157.16s` prob `0.906`) → same utterance as `500039` (`156.44–159.28s`), with `Leute,` voiced ~1s before `500039` start.
    - seg 5 (`159.06–159.32s`): `" Ja."` (prob `0.168`) → overlaps `500039`/`500040` boundary.
    - seg 6 (`160.14–160.60s`): `" Aufstellen!"` (prob `0.553`) → inside `500040` (`159.40–161.00s`) / covered in `500041` (`Okay. - Aufstellen.`).
  - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L949-L1230), win 2 segs 1–7):
    - seg 1 (`136.68–137.72s`): `" Weißte, wie wär's hier mit?"` → overlaps `500037` (`136.64–138.16s`).
    - seg 2 (`145.66–146.74s`): `" Oh, Digga!"` (`Oh,` `145.66–145.98s` prob `0.347`, `Digga!` `146.04–146.74s` prob `0.822`) → early onset of `500038` (`Oh, Digga! - Whoo, geil! Okay.`, `146.84–149.16s`).
    - seg 3 (`148.38–149.66s`): `" Geil, okay."` → overlaps `500038` (`146.84–149.16s`).
    - seg 4 (`155.20–158.50s`): `" Leute, wollt ihr noch ein letztes Familienfoto machen?"` (`Leute,` `155.20–155.84s` prob `0.864`, `wollt` `157.18–157.22s` prob `0.991`) → same sentence as `500039` (`156.44–159.28s`).
    - seg 5 (`159.16–159.48s`): `" Ja."` (prob `0.475`) → overlaps `500039`/`500040`.
    - seg 6 (`160.28–160.78s`): `" Na dann, komm."` → inside `500040` (`159.40–161.00s`).
    - seg 7 (`162.68–162.76s`, word `162.44–162.76s`): `" Okay."` → inside `500041` (`162.20–163.52s`).
- **Classification & Verdict**: **EXCLUDE (for new cue addition) / HOLD (`reviewNeeded` optional note on cue-onset lead-in)**
  - Every single word recognized by both `small` and `medium` in the wider `136.68–163.51s` window belongs to existing baseline cues `500037`, `500038`, `500039`, `500040`, and `500041`!
  - Specifically, Muse's candidate lines `"Oh, Digger!"` / `"Geil, okay."` are already in `500038` (`Oh, Digga! - Whoo, geil! Okay.`), and Muse's `"Leute? Wollt ihr noch Lächer?"` was a truncated crop artifact of `500039` (`Leute, wollt ihr noch ein letztes Familienfoto machen?`), which our wider crop (`136.68–163.51s`) resolved completely in both `small` and `medium`.
  - Note: The attention-getting word `"Leute,"` at `155.20–155.84s` and `"Oh, Digga!"` at `145.66–146.74s` occur ~0.6–1.2s before the official EBU-TT cue timestamps (`500038` at `146.84s` and `500039` at `156.44s`), and since the 268 baseline cues are immutable, we must not duplicate text already present in `500038` and `500039`. No new distinct dialogue exists in `138.16–145.66s` or `149.66–155.20s` (party music/cheering).

---

### Window 3 — Candidate 3
- **Anti Context Crop**: `210.60s – 226.07s` (`cropDecoded16kFloat32Sha256`: `fc2535dbfbd7e2e9ceddf7112805ade08f80da1332e63b7439c9983f2ed9a829`)
- **Muse Candidate Window**: `216.60s – 220.07s` (speech region `217.80s – 218.87s`, Muse ASR `[]`)
- **Baseline Coverage in/near Window**:
  - `500059` (`210.40s – 213.08s`): `Eins, zwo ...`
  - `500060` (`213.20s – 214.52s`): `drei ...`
  - `500061` (`214.64s – 215.80s`): `Cheeseeee!`
  - *Uncovered gap `215.80s – 288.24s` (title sequence / montage)*
- **Independent Raw ASR Findings**:
  - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L1207-L1253), win 3 seg 1):
    - seg 1 (`210.60–215.50s`): `" Eins, zwei, drei. Tschüss!"` (`Eins,` `210.60–212.24s`, `zwei,` `212.98–213.16s`, `drei.` `213.38–214.36s`, `Tschüss!` `215.06–215.50s`) → 100% covered by `500059–500061`.
    - **After `215.50s` (`215.50–226.07s`)**: **0 segments, 0 words**.
  - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L1255-L1301), win 3 seg 1):
    - seg 1 (`210.60–215.94s`): `" Eins, zwei, drei, Schiess!"` (`Eins,` `210.60–212.38s`, `zwei,` `213.16–213.66s`, `drei,` `214.24–214.78s`, `Schiess!` `215.38–215.94s`) → 100% covered by `500059–500061`.
    - **After `215.94s` (`215.94–226.07s`)**: **0 segments, 0 words**.
- **Classification & Verdict**: **EXCLUDE**
  - Both `small` and `medium` recognize `500059–500061` (`Eins, zwo ... drei ... Cheeseeee!`) and output zero words in the `216.0s – 226.07s` region. (In Codex's narrow `216.6–220.07s` crop, `medium` hallucinated the standard YouTube sign-off `"Das war's für heute, bis zum nächsten Mal, tschüss!"` with `no_speech_prob: 0.761`, whereas in our wider context crop `210.6–226.07s` anchored by real speech, neither model outputs any words after `215.94s`).

---

### Window 4 — Candidate 4
- **Anti Context Crop**: `398.44s – 427.55s` (`cropDecoded16kFloat32Sha256`: `03673b45d4d1232ebd17d4d82bafc494ac2aa43fa4f82871ea9280645410cb19`)
- **Muse Candidate Window**: `404.44s – 421.55s` (speech region `405.64s – 420.35s`, Muse ASR: `"SWR 2020"`, `no_speech_prob: 0.82`)
- **Baseline Coverage in/near Window**:
  - `500088` (`398.48s – 399.88s`): `Mailin und Fatou,`
  - `500089` (`400.00s – 403.48s`): `ihr habt das Referat über die Aufklärung vorbereitet.`
  - *Uncovered gap `403.48s – 423.80s`*
  - `500090` (`423.80s – 426.72s`): `Und die müssen alle rein? - Na ja, die erfrieren sonst.`
  - `500091` (`427.44s – 429.88s`): `Am Wochenende soll es schon unter Null werden.`
- **Independent Raw ASR Findings**:
  - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L1279-L1500), win 4 segs 1–3):
    - seg 1 (`398.44–402.92s`): `" My Lenin Fatou, ihr habt das Referat über die Auflärmung vorbereitet."` → covered by `500088–500089`.
    - **Gap `402.92s – 423.30s`**: **0 segments, 0 words** in `small`.
    - seg 2 (`423.30–425.04s`): `" Und die müssen jetzt alle rein?"` → covered by `500090`.
    - seg 3 (`425.48–426.58s`): `" Na ja, die erfrieren sonst."` → covered by `500090`.
  - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L1327-L2114), win 4 segs 1–13):
    - seg 1 (`398.44–403.14s`): `" Meilen und Fatou, ihr habt das Referat über die Aufklärung vorbereitet."` → covered by `500088–500089`.
    - seg 2 (`403.54–404.38s`): `" Ja, ja, ja."` (`Ja,` `403.54–403.54s` prob `0.013`, `ja,` `403.54–403.54s` prob `0.462`, `ja.` `403.94–404.38s` prob `0.920`) — *medium only; zero words in `small`*.
    - seg 3 (`404.66–405.26s`): `" Kommt mit nach vorn."` (`Kommt` prob `0.457`, `mit` prob `0.243`, `nach` prob `0.667`, `vorn.` prob `0.599`) — *medium only; zero words in `small` (and in Codex's targeted `403.48–405.84s` crop, `small` output `"Copyright WDR 2021"` with `no_speech_prob: 0.835`)*.
    - segs 4–11 (`405.84–422.40s`): English soundtrack lyrics (`"You eyes on me, eyes on me, apply that. Get it, don't be timid when you ain't applied it. Love upon it, live alone, need it. That's it. I don't wanna feel bad, it's bad like you said it. That's it. That's it. That's it."`).
    - segs 12–13 (`423.88–426.86s`): `" Und die müssen jetzt alle rein?"` / `" Na ja, die erfrieren sonst."` → covered by `500090`.
- **Classification & Verdict**: **EXCLUDE (main candidate `405.64–420.35s`) / HOLD (`reviewNeeded` for `403.54–405.26s` if tracking single-model teacher transition)**
  - The Muse candidate region (`405.64–420.35s`, where Muse had `"SWR 2020"`) is an English song montage (`"eyes on me..."` in `medium`, silence/copyright hallucination in `small`). Excluded as music/hallucination.
  - Note on `403.54–405.26s` (outside Muse's `405.64–420.35s` candidate, right after `500089`): `medium` alone outputs low-confidence `"Ja, ja, ja. Kommt mit nach vorn."` (`mit` prob `0.243`, `Kommt` prob `0.457`), while `small` outputs nothing (`0` words) in the wide crop and `"Copyright WDR 2021"` in the narrow crop. Because it fails the two-model support requirement, it **must not** be added as a cue (at most noted under `reviewNeeded` if Codex logs sub-window teacher transitions).

---

### Window 5 — Candidate 5
- **Anti Context Crop**: `476.58s – 496.67s` (`cropDecoded16kFloat32Sha256`: `c36c0eda05796687ab22c8b36cd586ac04a76bf57bf248804778418fc9792510`)
- **Muse Candidate Window**: `482.58s – 490.67s` (speech region `483.78s – 489.47s`, Muse ASR: `"What?"`, `"Seyfani Style."`, `"Jo, de, de, de, de."`, `"Komm doch auch mal."`)
- **Baseline Coverage in/near Window**:
  - `500107` (`476.96s – 480.60s`): `Ey, dieser letzte Tune da in deiner Playlist, der kam richtig gut an.`
  - `500108` (`480.72s – 483.80s`): `Dass sie doch so viel Stil haben. - What?`
  - `500109` (`483.92s – 485.24s`): `Safe haben die Style.`
  - *Uncovered gap `485.24s – 489.92s` (`4.68s`)*
  - `500110` (`489.92s – 491.20s`): `Komm doch auch mal mit.`
  - `500111` (`492.04s – 496.20s`): `Es ist Halloween und wir verkleiden uns richtig schick. - Nee, lass mal.`
  - `500112` (`496.32s – 500.00s`): `Verkleiden ist echt nicht so meins, und auch nicht eure Besäufnisse.`
- **Independent Raw ASR Findings**:
  - **Covered cues (`476.58–485.24s` and `489.88–496.54s`)**:
    - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L1525-L2044), win 5):
      - seg 1 (`476.58–480.60s`): `" Hey, dieser letzte Tune in der Palace, der kam mir richtig gut an in der Gang."` → `500107`
      - seg 2 (`481.08–481.98s`): `" Was ist das so für ein Stil?"` + seg 3 (`482.72–483.08s`): `" What?"` → `500108` (`480.72–483.80s`)
      - seg 4 (`483.96–484.96s`): `" Safe Family Style."` → phonetic ASR approximation of `500109` (`Safe haben die Style.`, `483.92–485.24s`)
      - seg 6 (`489.88–490.88s`): `" Komm doch auch mal mit."` → `500110` (`489.92–491.20s`)
      - segs 7–8 (`491.84–496.46s`): `" Es ist Halloween..."` → `500111–500112`
    - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L2140-L2650), win 5):
      - seg 1 (`476.58–480.82s`): `" Ey, dieser letzte Tune in der Appendis, der kam mir richtig gut an, der Gang."` → `500107`
      - seg 2 (`481.18–482.22s`): `" Was ist dir da so für ein Stil her?"` + seg 3 (`482.82–483.32s`): `" What?"` → `500108`
      - seg 4 (`484.14–485.24s`): `" Safe Family Style."` → `500109` (`Safe haben die Style.`)
      - seg 6 (`490.26–491.04s`): `" Komm doch auch mal mit."` → `500110`
      - segs 7–8 (`492.04–496.54s`): `" Es ist Halloween..."` → `500111–500112`
  - **Uncovered gap (`485.24s – 489.92s`)**:
    - `small` seg 5 (`486.14–487.68s`, lines 1802–1846): `" Oh, der ist hier."` with very low word probabilities:
      - `" Oh,"` (`486.14–486.62s`, prob `0.0099`)
      - `" der"` (`487.08–487.22s`, prob `0.1428`)
      - `" ist"` (`487.22–487.46s`, prob `0.1239`)
      - `" hier."` (`487.46–487.68s`, prob `0.3101`)
    - `medium` seg 5 (`486.18–488.74s`, lines 2424–2468): `" Jo, ey, ey, ey."` (vocalizing/grooving to the music just turned on in `500106` `"Mach mal Mucke auf"`):
      - `" Jo,"` (`486.18–486.70s`, prob `0.5903`)
      - `" ey,"` (`487.18–487.56s`, prob `0.0979`)
      - `" ey,"` (`487.62–487.88s`, prob `0.9260`)
      - `" ey."` (`487.88–488.74s`, prob `0.9689`)
- **Classification & Verdict**: **HOLD (`reviewNeeded`) / EXCLUDE from cues**
  - Muse's `"What?"`, `"Seyfani Style."`, and `"Komm doch auch mal."` are all already in baseline cues `500108`, `500109`, and `500110`!
  - In the only uncovered interval (`485.24–489.92s`), `medium` hears rhythmic vocalization/ad-libs over the music (`"Jo, ey, ey, ey."` / Muse `"Jo, de, de, de, de."` / Codex `"Oh, oh, oh..."`), while `small` outputs near-zero-probability tokens (`"Oh, der ist hier."`, probabilities `0.01–0.31`). No supported dialogue to add; hold `485.24–489.92s` in `reviewNeeded` (or exclude as non-lexical vocalization over music).

---

### Window 6 — Candidate 6
- **Anti Context Crop**: `758.37s – 775.07s` (`cropDecoded16kFloat32Sha256`: `a3eac499d9a016d16bf48c11b7cdd1eabc9279d32f2c2b7fe885fb145394c94f`)
- **Muse Candidate Window**: `764.37s – 769.07s` (speech region `765.57s – 767.87s`, Muse ASR: `"Copyright WDR 2021"`, `no_speech_prob: 0.77`)
- **Baseline Coverage in/near Window**:
  - `500166` (`753.64s – 756.44s`): `Ist das eigentlich dein Bruder oder deine Schwester?`
  - *Uncovered gap `756.44s – 793.96s` (entire `758.37–775.07s` window is outside baseline cues)*
  - `500167` (`793.96s – 797.60s`): `Du hast dich doch schon mal für den Oberstufenraum eingesetzt. - Mhm.`
- **Independent Raw ASR Findings**:
  - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L2070-L2717), win 6 segs 1–8):
    - Classic Whisper repetition-loop hallucination on non-speech:
      - segs 1–7 (`759.11–774.55s`, `noSpeechProb: 0.634`, `compressionRatio: 6.38`): repeats `" Das war der erste Mal, dass ich da war."` 7 times in a row with zero-duration word timestamps.
      - seg 8 (`774.55–774.95s`, `noSpeechProb: 0.898`): `" Copyright WDR 2020"`.
  - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L2671-L2675), win 6):
    - **0 segments, 0 words** (`segmentCount: 0`, `wordCount: 0`).
- **Classification & Verdict**: **EXCLUDE**
  - Pure non-speech / background scene transition where `medium` outputs `0` words and `small` enters a `compressionRatio: 6.38` repetition loop followed by `"Copyright WDR 2020"` (`noSpeechProb: 0.898`).

---

### Window 7 — Candidate 7
- **Anti Context Crop**: `859.40s – 875.07s` (`cropDecoded16kFloat32Sha256`: `c6da127002c947c7be5b331d5fcc341169f0b2a2d4232c8b9b038b860adcc20c`)
- **Muse Candidate Window**: `865.40s – 869.07s` (speech region `866.60s – 867.87s`, Muse ASR: `"Das war's für heute."`, `avg_logprob: -1.1`, `no_speech_prob: 0.54`)
- **Baseline Coverage in/near Window**:
  - `500185` (`858.40s – 861.12s`): `Kann nicht jeder Corona gehabt haben. - Sorry, Mann.`
  - `500186` (`861.24s – 863.28s`): `Schon okay, ich hab's überlebt.`
  - `500187` (`863.40s – 866.40s`): `Wenn aus dem Abi nichts wird, könnt ihr Hexen werden.`
  - *Uncovered gap `866.40s – 868.60s` (`2.20s`)*
  - `500188` (`868.60s – 870.32s`): `Müssen wir schon los? - Ja.`
  - *Uncovered gap `870.32s – 875.60s`*
- **Independent Raw ASR Findings**:
  - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L2743-L3025), win 7 segs 1–5):
    - seg 1 (`859.96–860.84s`): `" Ich sorry, Marius."` → covered by `500185` (`... - Sorry, Mann.`).
    - seg 2 (`860.98–861.88s`): `" Okay, ich hab's überlegt."` → covered by `500186` (`Schon okay, ich hab's überlebt.`).
    - seg 3 (`862.14–864.38s`): `" Wenn du aus dem Abi nichts führt, dann könnt ihr immer noch hexen werden."` → covered by `500187` (`863.40–866.40s`, spoken slightly earlier at `862.14–864.38s`).
    - **Uncovered gap `864.38s – 868.36s` (including `866.40–868.60s`)**: **0 segments, 0 words** in `small`!
    - seg 4 (`868.36–869.34s`): `" Wir müssen schon los."` + seg 5 (`869.72–869.86s`): `" Ja."` → covered by `500188` (`Müssen wir schon los? - Ja.`, `868.60–870.32s`).
  - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L2700-L2888), win 7 segs 1–3):
    - seg 1 (`861.80–864.68s`): `" Wenn aus dem Abi nichts wird, dann könnt ihr immer noch Hexen werden."` → covered by `500187`.
    - **Uncovered gap `864.68s – 868.82s` (including `866.40–868.60s`)**: **0 segments, 0 words** in `medium`!
    - seg 2 (`868.82–869.54s`): `" Wollen wir schon los?"` + seg 3 (`869.74–870.02s`): `" Ja."` → covered by `500188`.
- **Classification & Verdict**: **HOLD (`reviewNeeded`) or EXCLUDE**
  - In our wider context window (`859.40–875.07s`), **neither `small` nor `medium` outputs a single word in the `864.68s – 868.36s` gap**.
  - Muse's `"Das war's für heute."` (`avg_logprob: -1.1`, `no_speech_prob: 0.54`) and Codex's narrow-crop `"Das war ein..."` / `"Das war's."` / `"Tschüss."` / `"Lass uns rein."` / `"Wow!"` are classic Whisper hallucinations / unstable guesses on brief non-verbal/ambient sound between `500187` and `500188`. Because Codex's recheck crops produced conflicting tokens across narrow windows while our wide context run produced `0` words in both models, keeping Candidate 7 out of the subtitles (either Excluded as noise/hallucination or Held in `reviewNeeded` per prompt guideline 3: *"không chắc thì reviewNeeded"*) is 100% justified.

---

### Window 8 — Candidate 8
- **Anti Context Crop**: `1126.53s – 1142.33s` (`cropDecoded16kFloat32Sha256`: `cb7b36f966ee38d38b8ac58d4271ecabf97babf8464f194f69ad7df742617130`)
- **Muse Candidate Window**: `1132.53s – 1136.33s` (speech region `1133.73s – 1135.13s`, Muse ASR: `"Uuuuuh!"`, `avg_logprob: -1.47`, `no_speech_prob: 0.57`)
- **Baseline Coverage in/near Window**:
  - `500258` (`1127.28s – 1129.20s`): `Hmmm ... Sesam öffne dich?`
  - `500259` (`1131.88s – 1132.96s`): `Buh!`
  - `500260` (`1135.08s – 1136.80s`): `Buuuh!`
  - `500261` (`1139.20s – 1140.48s`): `Come on, jetzt du!`
  - `500262` (`1141.36s – 1143.04s`): `Sag mal was. Buuuh!`
- **Independent Raw ASR Findings**:
  - `small` ([`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json#L3051-L3144), win 8 segs 1–2):
    - seg 1 (`1127.11–1128.71s`): `" Mh, Jesus macht nur sich."` → phonetic misrecognition of `500258` (`Hmmm ... Sesam öffne dich?`, `1127.28–1129.20s`).
    - **Between `1128.71s` and `1139.25s`**: **0 segments, 0 words**.
    - seg 2 (`1139.25–1140.25s`): `" Kommon jetzt du!"` → covered by `500261` (`Come on, jetzt du!`, `1139.20–1140.48s`).
  - `medium` ([`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json#L2914-L3015), win 8 segs 1–2):
    - seg 1 (`1126.53–1128.53s`, words `1126.53–1128.75s`): `" Hm, sie ist einfach flüssig."` → phonetic misrecognition of `500258` (`Hmmm ... Sesam öffne dich?`, `1127.28–1129.20s`).
    - **Between `1128.75s` and `1138.29s`**: **0 segments, 0 words**.
    - seg 2 (`1138.29–1140.43s`): `" Komm'on, jetzt du!"` → covered by `500261` (`Come on, jetzt du!`, `1139.20–1140.48s`).
- **Classification & Verdict**: **EXCLUDE**
  - Both `small` and `medium` output `0` words between `1128.75s` and `1138.29s`, while baseline cues `500259` (`Buh!`, `1131.88–1132.96s`) and `500260` (`Buuuh!`, `1135.08–1136.80s`) already cover the spooky ghost sounds (`"Uuuuuh!"` / `"Oooo..."`) in this scene.

---

## 4. Summary Table of All 8 Windows

| Window | Anti Crop (`start–end`) | Muse Crop (`start–end`) | Baseline Cues in Crop | Uncovered Both-Model Dialogue? | Action | Reason |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | `9.61–48.19s` | `15.61–42.19s` | `500002`, `500003`, `500004`, `500005` | **No** | **EXCLUDE** | `9.61–37.89s` is intro rap/song lyrics (`noSpeechProb ~0.70–0.73`); `38.64–46.56s` is already covered by `500002–500004`. |
| **2** | `136.68–163.51s` | `142.68–157.51s` | `500037`, `500038`, `500039`, `500040`, `500041` | **No** | **EXCLUDE / HOLD** | All recognized speech in both models (`Wie wär's hiermit?`, `Oh, Digga!`, `Geil, okay.`, `Leute, wollt ihr noch ein letztes Familienfoto machen?`, `Ja.`, `Na dann, komm.`, `Okay.`, `Aufstellen!`) is already covered by `500037–500041`. (`Leute,` at `155.20s` and `Oh, Digga!` at `145.66s` are early lead-ins to immutable `500039` and `500038`). |
| **3** | `210.60–226.07s` | `216.60–220.07s` | `500059`, `500060`, `500061` | **No** | **EXCLUDE** | `210.60–215.94s` is covered by `500059–500061` (`Eins, zwo ... drei ... Cheeseeee!`); `215.94–226.07s` has `0` words in both `small` and `medium`. |
| **4** | `398.44–427.55s` | `404.44–421.55s` | `500088`, `500089`, `500090`, `500091` | **No** | **EXCLUDE / HOLD** | `405.84–422.40s` is English song lyrics (`medium`) / silence (`small`). At `403.54–405.26s`, only `medium` outputs low-prob `"Ja, ja, ja. Kommt mit nach vorn."` while `small` outputs `0` words (or `"Copyright WDR 2021"` in narrow crop) — hold in `reviewNeeded` if logging sub-window teacher speech, do not add cue. |
| **5** | `476.58–496.67s` | `482.58–490.67s` | `500107`, `500108`, `500109`, `500110`, `500111`, `500112` | **No** | **HOLD (`reviewNeeded`)** | `What?`, `Safe haben die Style.`, and `Komm doch auch mal mit.` are already in `500108–500110`. In the uncovered gap `485.24–489.92s`, `medium` hears music ad-libs `"Jo, ey, ey, ey."` while `small` has near-zero-prob `"Oh, der ist hier."` (probs `0.01–0.31`). Disagreement over music/party background → `reviewNeeded`. |
| **6** | `758.37–775.07s` | `764.37–769.07s` | *(none)* | **No** | **EXCLUDE** | `medium` outputs `0` words; `small` loops `"Das war der erste Mal, dass ich da war."` (`compressionRatio: 6.38`) + `"Copyright WDR 2020"` (`noSpeechProb: 0.898`). Pure hallucination on silence/ambient sound. |
| **7** | `859.40–875.07s` | `865.40–869.07s` | `500185`, `500186`, `500187`, `500188` | **No** | **HOLD (`reviewNeeded`) / EXCLUDE** | Both `small` and `medium` match `500185–500188` and output `0` words in the `864.68–868.36s` gap. Narrow-crop outputs (`"Das war's für heute."` / `"Das war's."` / `"Lass uns rein."` / `"Wow!"`) are low-confidence/conflicting — hold in `reviewNeeded` or exclude. |
| **8** | `1126.53–1142.33s` | `1132.53–1136.33s` | `500258`, `500259`, `500260`, `500261`, `500262` | **No** | **EXCLUDE** | Both `small` and `medium` match `500258` and `500261` and output `0` words in `1128.75–1138.29s`. Ghost vocalizations (`"Uuuuuh!"`) are non-dialogue and already covered by `500259` (`Buh!`) and `500260` (`Buuuh!`). |

---

## 5. Verification Checklist

- [x] Blind phase run completed **before** reading any existing captions, Muse candidate text, or Codex ASR outputs.
- [x] Used `C:/Users/huynh/OneDrive/Desktop/flash/tmp/peppa-align-venv/Scripts/python.exe` (`CT2 4.6.0`).
- [x] Both `small` and `medium` ran sequentially in foreground to completion with exact required flags (`int8`, `cpu_threads=3`, `language="de"`, `beam_size=5`, `temperature=0`, `word_timestamps=True`, `condition_on_previous_text=False`, `vad_filter=False`, `initial_prompt=None`, `hotwords=None`, `local_files_only=True`).
- [x] Saved raw literal segments/words, probabilities, relative and absolute timings, crop SHA256s, model/options, source video SHA256 (`c2433e3cc318bfe477b85392446bb56c8568a2faa4f39eea15c98d0361aa1774`), decoded 16k float32 SHA256 (`3c5233fe4caecf54d8a00cc80c40c2af9606b8e11f942d1e4eae8fb0498c240c`), and `humanListened: false` in [`independent-small-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-small-context.json) and [`independent-medium-context.json`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/independent-medium-context.json).
- [x] Logged per-crop and per-model progress to [`anti-progress.txt`](file:///C:/Users/huynh/.codex/worktrees/kino-druck-missing-lines/flash/qa/kino-alignment/druck_s07e01_missing_20261028/anti-progress.txt).
- [x] No product files edited, no git commit/push/merge/deploy performed, and no background processes left running.
