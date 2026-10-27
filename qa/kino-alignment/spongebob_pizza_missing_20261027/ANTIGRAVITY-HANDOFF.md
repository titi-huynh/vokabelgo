# ANTIGRAVITY HANDOFF — SpongeBob Pizza (`spongebob_pizza`) Independent Recognition & Sanity Check

- **Date**: 2026-10-27
- **Branch / Base**: `codex/kino-spongebob-pizza-missing-lines` (base `20ce104c034033f47852a6e4c1c7c82f0cd6c85b`)
- **Workspace**: `C:/Users/huynh/.codex/worktrees/kino-spongebob-pizza-missing-lines/flash`
- **QA Directory**: `qa/kino-alignment/spongebob_pizza_missing_20261027`
- **Human Listening**: `humanListened: false` across all runs (machine ASR + acoustic/frame evidence only; no claims of human listening or audio playback approval).

---

## 1. Source Verification

| Property | Value | Status |
| :--- | :--- | :--- |
| Source Path | `video/spongebob_pizza.mp4` | Local workspace file verified (no download/transcode/upload) |
| Byte Size | `17,860,400` bytes | Exact match |
| Video SHA256 | `241c5cf57f3e8fe37942d779591275629bd3674669d733d63b8348027e6b0b98` | Exact match |
| `ffprobe` Duration | `301.139592` s | Exact match |
| Decoded 16 kHz Mono Samples | `4,818,234` samples (`301.139625` s) | Verified via `faster_whisper.audio.decode_audio` |
| Decoded Float32 (`f32le`) 16 kHz SHA256 | `a98be2abb37b95caededb954cc7ab49fb0fccde3a133b79a03b12990c8b58c02` | Recorded in full ASR JSONs |
| Decoded PCM (`s16le`) 16 kHz SHA256 | `e0cf5468e178693ae2f12241d815c9f842275a8c93b0c350d61bcea5dd0b1402` | Recorded in full ASR JSONs |
| Full Chunks Spec SHA256 | `29f8f327411548bd43dbde9a4cb2363e80ab6f4421a2d1590c8ff66d323474a1` | `full_chunks_spec.json` |

---

## 2. ASR Execution Inventory (10 Antigravity Full-Crop Calls vs. 38 Root Bounded Calls)

All ASR runs used the isolated working virtual environment `C:/Users/huynh/OneDrive/Desktop/flash/tmp/peppa-align-venv/Scripts/python.exe` (`ctranslate2 4.6.0`, `faster-whisper 1.2.1`) with identical decoding options:
- `device="cpu"`, `compute_type="int8"`, `cpu_threads=3`, `local_files_only=True`
- `language="de"`, `beam_size=5`, `temperature=0.0`, `word_timestamps=True`
- `condition_on_previous_text=False`, `vad_filter=False`, `initial_prompt=None`, `hotwords=None`
- `humanListened=False`

### A. Antigravity Full-Clip Neutral Overlapping Chunks (10 Crop Calls Total: 5 Small + 5 Medium)
Executed via `run_independent_asr.py --mode full --resume` using `full_chunks_spec.json` (`progress.txt` completed at `2026-10-27 19:44:28`):
1. **`independent-small-full.json`** (`model="small"`, `completed: 5/5`, `elapsedSeconds: 170.39`):
   - Call 1 (`chunk 1`, `chunk_000_060`, crop `[0.0, 60.0]`): 23 segments
   - Call 2 (`chunk 2`, `chunk_058_120`, crop `[58.0, 120.0]`): 29 segments
   - Call 3 (`chunk 3`, `chunk_118_180`, crop `[118.0, 180.0]`): 16 segments
   - Call 4 (`chunk 4`, `chunk_178_240`, crop `[178.0, 240.0]`): 12 segments
   - Call 5 (`chunk 5`, `chunk_238_end`, crop `[238.0, 301.139625]`): 12 segments
2. **`independent-medium-full.json`** (`model="medium"`, `completed: 5/5`, `elapsedSeconds: 420.99`):
   - Call 6 (`chunk 1`, `chunk_000_060`, crop `[0.0, 60.0]`): 21 segments
   - Call 7 (`chunk 2`, `chunk_058_120`, crop `[58.0, 120.0]`): 23 segments
   - Call 8 (`chunk 3`, `chunk_118_180`, crop `[118.0, 180.0]`): 19 segments
   - Call 9 (`chunk 4`, `chunk_178_240`, crop `[178.0, 240.0]`): 12 segments
   - Call 10 (`chunk 5`, `chunk_238_end`, crop `[238.0, 301.139625]`): 17 segments

### B. Root / Codex Bounded Candidate & Recheck Crops (38 Crop Calls Total: 19 Small + 19 Medium)
Executed via `run-targeted-asr.py` (`codex-progress.txt`):
1. **`codex-small-main.json`** (`model="small"`, `codex-main-spec.json`, `completed: 7/7`):
   - 7 candidate windows: `[51.57, 55.05]`, `[60.92, 64.78]`, `[65.94, 78.92]`, `[86.84, 104.3]`, `[168.18, 197.83]`, `[260.6, 269.29]`, `[270.9, 274.41]`
2. **`codex-medium-main.json`** (`model="medium"`, `codex-main-spec.json`, `completed: 7/7`):
   - Same 7 candidate windows (`7/7`)
3. **`codex-small-recheck.json`** (`model="small"`, `codex-recheck-spec.json`, `completed: 12/12`):
   - 12 tight/context recheck crops across Candidates 1, 2, 3, 4, 6, 7. Codex factual label correction: the literal labels in `codex-recheck-spec.json` are `exchange`, `tight`, `exchange`, `tight`, `exchange`, `resolution`, `speech-before-song`, `tight-speech`, `context`, `tight`, `context`, `tight`, in that order.
4. **`codex-medium-recheck.json`** (`model="medium"`, `codex-recheck-spec.json`, `completed: 12/12`):
   - Same 12 tight/context recheck crops (`12/12`)

---

## 3. Independent Sanity Check of the 3 Accepted Additions (`review.json`)

No blocking concerns found. All 3 added cues (`1200163`, `1200164`, `1200165`) have bounded small/medium support and use IDs strictly above the max published/source draft ID (`1200162`), leaving gaps `1200120` and `1200134` untouched. Codex clarification: full-chunk small agrees literally on Hä and Schön, but gives `kalten` for cue 1200165; only full-chunk medium corroborates its exact `kalt` wording. Cue bounds cover the selected bounded evidence, not every timing estimate in other crops. The raw disagreements remain available below.

1. **Cue `1200163` — Candidate 1 (`54.11–54.57s`, SpongeBob: `"Hä?"`, `"Hả?"`)**
   - **Root bounded support**:
     - `codex-small-main.json` (`crop [51.57, 55.05]`): `" Hä?"` at `54.11–54.47s` (`p=0.4301`)
     - `codex-medium-main.json` (`crop [51.57, 55.05]`): `" Hä?"` at `54.33–54.57s` (`p=0.8285`)
   - **Antigravity full-chunk corroboration**:
     - `independent-small-full.json` (`chunk 1 [0.0, 60.0]`): `" Hä?"` at `54.220–54.460s` (`p=0.5066`)
     - `independent-medium-full.json` (`chunk 1 [0.0, 60.0]`): `" Hä?"` at `54.240–54.540s` (`p=0.1735`)
   - **Boundary sanity**: Strictly between existing cue `1200115` (`50.5–52.1s`) and existing cue `1200116` (`56.58–58.86s`), and isolated from the surrounding unstable `Auspacken/Ausparken` calls (`52.1–54.11s` and `54.57–56.58s`).

2. **Cue `1200164` — Candidate 3 (`75.54–75.96s`, Thaddäus: `"Schön."`, `"Hay lắm."`)**
   - **Root bounded support**:
     - `codex-small-main.json` (`crop [65.94, 78.92]`): `" Schön."` at `75.54–75.84s` (`p=0.9177`)
     - `codex-medium-main.json` (`crop [65.94, 78.92]`): `" Schön."` at `75.80–75.96s` (`p=0.9511`)
   - **Antigravity full-chunk corroboration**:
     - `independent-small-full.json` (`chunk 2 [58.0, 120.0]`): `" Schön."` at `75.400–75.680s` (`p=0.0177`)
     - `independent-medium-full.json` (`chunk 2 [58.0, 120.0]`): `" Schön."` at `75.620–76.000s` (`p=0.9404`)
   - **Boundary sanity**: Standalone single-word utterance cleanly separated from the preceding disputed `ausgepackt/ausgeparkt` statement (`73.7–75.46s`) and following disputed `Du hast ausgepackt/ausgeparkt.` clause (`76.34–77.72s`).

3. **Cue `1200165` — Candidate 4 (`90.28–92.09s`, SpongeBob: `"Ich glaube fast, die Pizza wird kalt."`, `"Tôi nghĩ bánh pizza sắp nguội mất rồi."`)**
   - **Root bounded support**:
     - `codex-small-recheck.json` (`windowIndex 7`, `crop [87.5, 92.6]`): `"Ich glaube, fast die Pizza wird kalt."` at `90.28–91.96s` (`Ich[90.28-90.40, p=0.9781] glaube,[90.40-90.58, p=0.9919] fast[90.72-90.94, p=0.9870] die[90.94-91.12, p=0.9961] Pizza[91.12-91.36, p=0.9862] wird[91.36-91.62, p=0.9946] kalt.[91.62-91.96, p=0.5514]`)
     - `codex-medium-main.json` (`windowIndex 3`, `crop [86.84, 104.3]`): `"Ich glaube, fast die Pizza wird kalt."` at `90.36–92.09s` (`Ich[90.36-90.46, p=0.9883] glaube,[90.46-90.74, p=0.9858] fast[90.88-91.04, p=0.9829] die[91.04-91.26, p=0.9984] Pizza[91.26-91.48, p=0.9927] wird[91.48-91.76, p=0.9741] kalt.[91.76-92.09, p=0.7317]`)
   - **Antigravity full-chunk corroboration**:
     - `independent-medium-full.json` (`chunk 2 [58.0, 120.0]`): exact same 7 words `"Ich glaube, fast die Pizza wird kalt."` at `90.320–92.460s` (`Ich[90.320-90.460, p=0.9684] glaube,[90.460-90.740, p=0.9837] fast[90.900-91.040, p=0.9650] die[91.040-91.260, p=0.9980] Pizza[91.260-91.480, p=0.9930] wird[91.480-91.780, p=0.9665] kalt.[91.780-92.460, p=0.6347]`)
     - `independent-small-full.json` (`chunk 2 [58.0, 120.0]`): `"Ich glaube, fast die Pizza wird kalten."` at `90.260–92.000s` (wide-window `small` bled into the following song onset as `kalten.`, resolved to `kalt.` in tight `small` recheck `87.5–92.6s` and in both bounded and full `medium`).
   - **Boundary sanity**: Starts at `90.28s` after existing cue `1200119` (`87.78–89.70s`, `"Und weißt du, was sonst noch ist?"`) and ends at `92.09s` before the song starts at `92.66s`. Only comma placement (`"Ich glaube fast, die Pizza wird kalt."`) is punctuation-normalized; lexical tokens are identical.

---

## 4. Independent Sanity Check of the 9 Held (`reviewNeeded`) Parts

All 9 `reviewNeeded` entries in `review.json` are well-founded and directly supported by lexical instability between models/crops in both the full-chunk and bounded runs:

1. **Candidate 1 (`52.1–54.11s`, `["Auspacken!", "Ausparken!"]`)**:
   - Full-chunk `small` (`53.060–53.540s`, `p=0.9575`) and `medium` (`53.620–54.140s`, `p=0.9551`) transcribe `"Auspacken."`, whereas bounded recheck crops split between `"Auspacken!"` and `"Ausparken!"`. Correctly held.
2. **Candidate 1 (`54.57–56.58s`, `["Auspacken.", "Ausparken!"]`)**:
   - Directly evidenced in our full-chunk runs: `independent-small-full.json` outputs `"Auspacken."` (`56.080–56.560s`, `p=0.9556`) while `independent-medium-full.json` outputs `"Ausparken!"` (`56.160–56.680s`, `p=0.8698`). Correctly held.
3. **Candidate 2 (`60.92–65.94s`, `["Pack aus!", "Park aus!", "Ich pack aus!", "Ich park aus!", "Mich pack aus!", "Perfekt!"]`)**:
   - Full-chunk `small` (`chunk 2`) outputs `"Pack aus!"` (`61.560–62.480s`) and `"Ich packe aus!"` (`62.760–64.000s`, `64.440–66.060s`); full-chunk `medium` (`chunk 2`) outputs `"ausparken."` (`61.240–61.840s`), `"Park aus!"` (`62.160–62.620s`), and `"Ich park aus!"` (`62.840–64.280s`, `64.900–66.120s`); bounded crops also produce `"Mich pack aus!"` and `"Perfekt!"`. Correctly held.
4. **Candidate 3 (`65.94–68.72s`, `["Lass mich an, Stöberspund!", "Lass mich ans Steuerspunk!", "Lass mich ans Feuer!", "Lass mich ansteuern, Spongebob!"]`)**:
   - Full-chunk `medium` (`chunk 2`) outputs `"Lass mich ansteuern, SpongeBob!"` (`66.180–67.680s`) and `"Lass mich ansteuern!"` (`67.800–68.720s`), full-chunk `small` loops `"Ich packe aus!"`, and bounded `small`/`medium` crops diverge across `"Stöberspund!"`, `"Steuerspunk!"`, and `"ans Feuer!"`. Correctly held.
5. **Candidate 3 (`68.86–70.26s`, `["Ich pack' aus!", "Ich park aus!"]`)**:
   - Full-chunk `small` (`69.580–70.180s`) outputs `"Ich packe aus!"`, while full-chunk `medium` (`68.840–69.500s`, `69.680–70.280s`) outputs `"Ich park aus!"`. Correctly held.
6. **Candidate 3 (`73.7–75.46s`, `["Ich hab' ausgepackt.", "Ich hab ausgeparkt."]`)**:
   - Full-chunk `medium` (`73.580–75.460s`, `p=0.9070`) and bounded `medium` output `"Ich hab ausgeparkt."`, while bounded `small` outputs `"Ich hab' ausgepackt."` (and full-chunk `small` loops `"Ich packe aus!"`). Correctly held.
7. **Candidate 3 (`76.34–77.72s`, `["Du hast ausgepackt.", "Du hast ausgeparkt."]`)**:
   - Directly split in full-chunk runs: `independent-small-full.json` (`76.340–77.420s`, `p=0.9139`) outputs `"Du hast ausgepackt."` while `independent-medium-full.json` (`76.400–77.720s`, `p=0.9898`) outputs `"Du hast ausgeparkt."`. Correctly held.
8. **Candidate 6 (`261.22–269.29s`, `["Kommt rüber, Spanisch!", "Komm drüber, Spongebob!", "Spongi?", "Sponge?"]`)**:
   - Full-chunk `small` (`262.300–262.900s`, `p=0.9650`) and `medium` (`262.220–262.900s`, `p=0.9912`) output `"Sponge?"` after existing cue `1200154` (`259.62–261.22s`, `"Ach, Schwamm drüber."`), whereas bounded crops split across `"Kommt rüber, Spanisch!"`, `"Komm drüber, Spongebob!"`, `"Spongi?"`, and `"Sponge?"`. Correctly held.
9. **Candidate 7 (`270.9–274.41s`, `["Ha ha ha...", "HÄÄÄ...", "Ah, ah..."]`)**:
   - Full-chunk `small` (`268.000–297.980s`) degenerates into a repetitive `"Ah, ah, ah..."` loop, full-chunk `medium` emits no segment in `270.9–274.41s`, and bounded crops produce nonlexical `"Ha ha ha..."` / `"HÄÄÄ..."` / empty output. Correctly held for human listening.

---

## 5. Excluded Parts & Final Verification Summary

- **6 Excluded Parts**:
  - Candidate 1 (`51.57–52.1s`): tail of existing cue `1200115` (`"Moment, wie war das noch?"`).
  - Candidate 3 (`77.92–79.18s`): existing cue `1200117` (`"Und weißt du was noch?"`).
  - Candidate 4 (`87.78–89.7s`): existing cue `1200119` (`"Und weißt du, was sonst noch ist?"`).
  - Candidate 4 (`92.66–104.3s`) & Candidate 5 (`168.18–197.83s`): *Krosse Krabbe Pizza* singing/beatboxing segments (`category: "song"`), excluded per song policy.
  - Candidate 6 (`260.6–261.22s`): tail of existing cue `1200154` (`"Ach, Schwamm drüber."`).
- **Integrity Verification (`final-data-verification.json`)**:
  - `all60OriginalCaptionsAndPracticeUnchanged: true` (`60` original + `3` added = `63` total caption and practice cues)
  - `chapters: 3`, `picks: 21`, `flashcards: 18` (`chaptersPicksCardsUnchanged: true`)
  - `overlaps: 0`, `duplicateIds: 0`, `unchangedOtherAlignedFiles: 32`, `pass: true`
