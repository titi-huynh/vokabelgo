# ANTIGRAVITY HANDOFF — SpongeBob Blubberunterricht (`spongebob_blubberunterricht`) Independent Blind Recognition

- **Date**: 2026-10-27
- **Branch / Base**: `codex/kino-spongebob-blubberunterricht-missing-lines` (workspace folder `kino-blubberunterricht-missing-lines/flash`, base `09f3b78c619b47961024396b02564c3005542012`)
- **Workspace**: `C:/Users/huynh/.codex/worktrees/kino-blubberunterricht-missing-lines/flash`
- **QA Directory**: `qa/kino-alignment/blubberunterricht_missing_20261027`
- **Human Listening**: `humanListened: false` across all runs (machine ASR evidence only; no claims of human listening or audio playback approval).

---

## 1. Source Verification

| Property | Value | Status |
| :--- | :--- | :--- |
| Source Path | `video/spongebob_blubberunterricht.mp4` | Local workspace file verified (no download/transcode/upload) |
| Byte Size | `12,325,458` bytes | Exact match |
| Video SHA256 | `0e1ec80278f70b49d352a6ec31d760f610f72be2e204984a9aa0f8e39b32a42e` | Exact match |
| `ffprobe` Duration | `222.841905` s | Exact match |
| Decoded 16 kHz Mono Samples | `3,565,471` samples (`222.841938` s) | Verified via `faster_whisper.audio.decode_audio` |
| Decoded Float32 (`f32le`) 16 kHz SHA256 | `c842f52ca8cb78bcea89f2d898b88cf5764b690401912f12e9ea984476b481a4` | Recorded in full ASR JSONs |
| Decoded PCM (`s16le`) 16 kHz SHA256 | `d2301dc06a50ece23c99363aa2398adbc58d69ecd11dfefbf6b0e3a96e48af7a` | Recorded in full ASR JSONs |
| Full Chunks Spec SHA256 | `f37fc3687972826fe2fd6305c0f67de6799cf61566b8d50b11cc684e93334ba7` | `full_chunks_spec.json` |

---

## 2. Independent Blind ASR Execution Inventory (8 Antigravity Full-Crop Calls: 4 Small + 4 Medium)

All blind ASR runs used the isolated working virtual environment `C:/Users/huynh/OneDrive/Desktop/flash/tmp/peppa-align-venv/Scripts/python.exe` (`ctranslate2 4.6.0`, `faster-whisper 1.2.1`) with identical decoding options:
- `device="cpu"`, `compute_type="int8"`, `cpu_threads=3`, `local_files_only=True`
- `language="de"`, `beam_size=5`, `temperature=0.0`, `word_timestamps=True`
- `condition_on_previous_text=False`, `vad_filter=False`, `initial_prompt=None`, `hotwords=None`
- `humanListened=False`

Executed via `run_independent_asr.py --mode full --resume` using `full_chunks_spec.json` (`progress.txt` completed at `2026-10-27 20:26:37`):
1. **`independent-small-full.json`** (`model="small"`, `completed: 4/4`, `elapsedSeconds: 128.53`, `26` total segments):
   - Call 1 (`chunk 1`, `chunk_000_065`, crop `[0.0, 65.0]`): 12 segments
   - Call 2 (`chunk 2`, `chunk_063_125`, crop `[63.0, 125.0]`): 8 segments
   - Call 3 (`chunk 3`, `chunk_123_185`, crop `[123.0, 185.0]`): 3 segments
   - Call 4 (`chunk 4`, `chunk_183_end`, crop `[183.0, 222.841938]`): 3 segments
2. **`independent-medium-full.json`** (`model="medium"`, `completed: 4/4`, `elapsedSeconds: 452.68`, `41` total segments):
   - Call 5 (`chunk 1`, `chunk_000_065`, crop `[0.0, 65.0]`): 26 segments
   - Call 6 (`chunk 2`, `chunk_063_125`, crop `[63.0, 125.0]`): 11 segments
   - Call 7 (`chunk 3`, `chunk_123_185`, crop `[123.0, 185.0]`): 2 segments
   - Call 8 (`chunk 4`, `chunk_183_end`, crop `[183.0, 222.841938]`): 2 segments

---

## 3. Baseline & ID Audit (Read-Only Check)

- **Existing Cues**: `19` caption cues and `19` practice (`units`) cues (`1600101` through `1600119` contiguous, no gaps).
- **Chapters / Picks / Flashcards**: `2` chapters, `14` picks (`7` in chapter 1, `7` in chapter 2), `12` flashcards.
- **Max ID Across Published & Source Drafts (`source-id-audit.json`)**: `1600119` (across `qa/kino-alignment/spongebob_blubberunterricht_20261026/*` and published files). Any new cue IDs must start strictly at `1600120`+.

---

## 4. Candidate-by-Candidate Comparison (Blind Full-Chunk ASR vs. Muse 6-Candidate Package & Existing 19 Cues)

### Candidate 1 (`14.44–17.72s`, window `[13.24, 18.92]`, between Cue `1600103` `12.18–13.68s` and Cue `1600104` `18.08–21.72s`)
- **Existing overlap check**:
  - Muse candidate ASR `18.28–20.28s` (`"Sieh mal her!"`) is the head of existing cue `1600104` (`18.08–21.72s`, `"Sieh mal her. Eins, zwei und drei."`) — **not an addition** (duplicate head).
- **Sub-part 1A (`~14.42–15.86s`)**:
  - `independent-small-full.json` (`chunk 1 [0.0, 65.0]`): `"Die Technik, Tadeus."` at `14.42–15.86s` (`Die[14.42-14.84, p=0.5137] Technik,[14.84-15.50, p=0.9978] Tadeus.[15.56-15.86, p=0.8064]`)
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`): `"Die Technik, Tadeus!"` at `14.60–15.86s` (`Die[14.60-14.92, p=0.7143] Technik,[14.92-15.66, p=0.9898] Tadeus![15.84-15.86, p=0.7026]`)
  - **Disagreement / Uncertainty**: While our neutral full-chunk `small` and `medium` agree on `"Die Technik, Tadeus!"` (canonical character spelling `"Thaddäus"`), Muse's window ASR has `"Die Technik hat ihn auch!"`, and Codex's bounded crops (`codex-small-main.json`, `codex-medium-main.json`, `codex-small-recheck.json`, `codex-medium-recheck.json`) diverge across `"Die Technik hatte ich!"`, `"Die Technik hat ihn aus!"`, `"Die Technik hat in uns!"`, `"Die Technik, Satio!"`, `"Die Technik hat ihn auch!"`, and `"Die Technik, Sateo!"`. Because the tail after `"Die Technik"` is unstable across crops, recommend holding as **`reviewNeeded`** unless Codex's bounded analysis resolves it.
- **Sub-part 1B (`~15.88–17.60s`)**:
  - `independent-small-full.json` (`chunk 1 [0.0, 65.0]`): `"Jetzt drehen Sie es durch."` at `15.88–17.30s` (`Jetzt[15.88-16.20, p=0.9528] drehen[16.20-16.64, p=0.5013] Sie[16.64-16.88, p=0.7970] es[16.88-17.08, p=0.3287] durch.[17.08-17.30, p=0.2938]`)
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`): `"Jetzt, du siehst du."` at `15.88–17.60s` (`Jetzt,[15.88-16.40, p=0.3638] du[16.56-16.72, p=0.0791] siehst[16.72-17.16, p=0.8361] du.[17.16-17.60, p=0.9327]`)
  - **Recommendation**: High lexical instability across all models (`"Jetzt drehen Sie es durch."` vs. `"Jetzt, du siehst du."` vs. `"Jetzt reden siehst du!"` vs. `"Jetzt drehen Sie sich zu!"`). Must remain **`reviewNeeded`**.

---

### Candidate 2 (`28.77–74.14s`, window `[27.57, 75.34]`, between Cue `1600105` `23.86–25.60s` and Cue `1600109` `83.32–84.62s`)
- **Existing cues inside Candidate 2 (MUST NOT duplicate or overlap)**:
  - **Cue `1600106` (`28.96–31.40s`)**: `"Thaddäus, pass auf! Die Technik!"` — already in baseline (`independent-small-full.json` `28.84–31.22s`, `independent-medium-full.json` `29.24–31.44s`). Exclude as already covered.
  - **Cue `1600107` (`58.04–60.00s`)**: `"Immer schön auf dem rechten Fuß landen."` — already in baseline (`independent-small-full.json` `57.90–60.02s`, `independent-medium-full.json` `57.94–60.02s`). Exclude as already covered.
  - **Cue `1600108` (`60.00–61.06s`)**: `"Ich hab's nicht vergessen."` — already in baseline (`independent-small-full.json` `60.06–61.06s`, `independent-medium-full.json` `60.16–61.26s`). Exclude as already covered.
- **Note on `21.66–27.72s` (outside Muse Candidate 2 window, between Cues `1600104`, `1600105`, `1600106`)**:
  - In `chunk 1 [0.0, 65.0]`, `small` outputs `"Und dann Tadeus, der Backhandstoß."` (`21.66–23.40s`) while `medium` outputs `"Tadeus, der Beckenstoß."` (`21.78–23.82s`), and at `25.88–27.72s` `small`/`medium` output incomplete `"Und nicht vergessen, der..."` (`25.92–27.72s`). Not part of Muse's 6 candidates and unstable/incomplete.
- **Sub-part 2A (`31.76–33.34s`, Thaddäus & SpongeBob)**:
  - `independent-small-full.json` (`chunk 1 [0.0, 65.0]`): skipped `31.22–53.30s` and aligned `"Hey, Tadeus, hör aufs Wunsch!"` to `53.30–55.44s` (`compression_ratio: 9.24` due to repetitive `"Die Technik!"` chanting).
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`): `"Hey, Tadeus! Hör auf, sponge!"` at `31.76–33.34s` (`Hey,[31.76-32.14, p=0.1287] Tadeus![32.18-32.54, p=0.7736] Hör[32.72-32.76, p=0.9377] auf,[32.76-32.88, p=0.9815] sponge![33.18-33.34, p=0.4013]`).
  - **Recommendation**: In `31.40–33.43s`, `Hey, Thaddäus!` / `Hör auf, ...` has an unstable final token across crops (`"sponge!"` `p=0.4013` vs. Muse `"Spons!"` vs. Codex recheck `"Hey, Tadeo, hör auf, Sponge! | Shit, hey!"` vs. `"Hey, Tadeus, hör auf! Spanns!"`). Hold as **`reviewNeeded`** (or split only if Codex confirms a clean subset, otherwise hold entire `31.40–33.43s` as `reviewNeeded`).
- **Sub-part 2B (`33.50–39.62s` and `43.54–48.52s`, repetitive `"Die Technik!"` / `"Technik!"` chanting)**:
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`): `"Die Technik!"` repeated at `33.50–36.38s`, `36.56–39.62s`, `39.62–40.06s`, `43.54–45.32s`, and `"Technik! Technik! ..."` at `45.64–48.52s`.
  - **Recommendation**: Repetitive chanting/shouting gag (`"Die Technik!"` / `"Technik!"`), excluded per episode prompt policy.
- **Sub-part 2C (`40.06–43.08s`, Thaddäus: `"Du hast nicht die richtige Technik."`)**:
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`): split across two adjacent segments `"Du hast nicht die richtige..."` (`40.06–41.98s`: `Du[40.06-40.06, p=0.1410] hast[40.06-40.82, p=0.9395] nicht[40.82-41.20, p=0.8361] die[41.20-41.22, p=0.9440] richtige...[41.22-41.98, p=0.5534]`) + `"Technik."` (`42.64–43.08s`, `p=0.8065`).
  - `independent-small-full.json` (`chunk 1 [0.0, 65.0]`): missed in full chunk due to `9.24` compression-ratio jump across the chant, **but** in `codex-small-main.json` (`crop [27.57, 75.34]`) and `codex-medium-main.json` (`crop [27.57, 75.34]`) both `small` and `medium` transcribe the complete 6-word sentence `"Du hast nicht die richtige Technik."` (while tight `small` recheck `[38.3, 43.1]` drops `die`: `"Du hast nicht richtige Technik."`).
  - **Potential Addition / Consideration**: If Codex accepts `codex-small-main.json` + `codex-medium-main.json` + `independent-medium-full.json` (`"Du hast nicht die richtige..."` + `"Technik."`), `"Du hast nicht die richtige Technik."` (`~40.06–43.08s`) is a strong candidate; otherwise if held due to tight-recheck `small` dropping `die` or `Du` onset `p=0.141`, document in `review.json`.
- **Sub-part 2D (`48.52–51.28s`, SpongeBob: `"Erst mache ich das."` / `"Schwer ist mach ich das"` & `"Sprehen/Drehen und stopp."`)**:
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`):
    - `48.52–49.96s`: `"Erst mache ich das."` (`Erst[48.52-48.82, p=0.0075] mache[48.82-49.10, p=0.5230] ich[49.10-49.32, p=0.9980] das.[49.32-49.96, p=0.9955]`)
    - `50.40–51.28s`: `"Sprehen und stopp."` (`Sprehen[50.40-50.68, p=0.5292] und[50.68-50.96, p=0.9634] stopp.[50.96-51.28, p=0.7529]`)
  - **Disagreement / Uncertainty**: Across bounded `small` crops (`codex-small-main.json`, `codex-small-recheck.json`), `48.52–49.96s` is transcribed as `"Schwer ist mach ich das!"` / `"Schweres mache ich das"`, and `50.40–51.28s` alternates between `"Sprehen und stopp."` (`medium` full), `"Prähen und Stopp"` (`small` main), and `"Drehen und Stopp"` (`small` recheck). Must remain **`reviewNeeded`**.
- **Sub-part 2E (`51.34–52.58s` and `53.22–55.50s`, SpongeBob)**:
  - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`):
    - `51.34–52.58s`: `"Dreimal nach rechts gucken."` (`Dreimal[51.34-51.66, p=0.8142] nach[51.66-51.84, p=0.9620] rechts[51.84-52.16, p=0.9982] gucken.[52.16-52.58, p=0.3792]`)
    - `53.22–55.50s`: `"Und jetzt geht's los, der Beckenstoß."` (`Und[53.22-53.48, p=0.9628] jetzt[53.48-53.76, p=0.9947] geht's[53.76-54.04, p=0.8409] los,[54.04-54.30, p=0.9985] der[54.40-54.70, p=0.9933] Beckenstoß.[54.70-55.50, p=0.9812]`)
  - **Corroboration**: Both `"Dreimal nach rechts gucken."` and `"Und jetzt geht's los, der Beckenstoß."` are corroborated by `codex-small-main.json` and `codex-small-recheck.json` (`#2 47.9-55.7` and `#2 46.5-61.1`), whereas `independent-small-full.json` hallucinated `"Hey, Tadeus, hör aufs Wunsch!"` at `53.30–55.44s` because of its 22-second jump over the chant.
  - **Potential Additions**:
    1. `"Dreimal nach rechts gucken."` (`~51.34–52.58s`, SpongeBob) — if split cleanly from the preceding `"Sprehen/Drehen und stopp"`.
    2. `"Und jetzt geht's los, der Beckenstoß."` (`~53.22–55.50s`, SpongeBob) — high-probability lexical match across `independent-medium-full.json`, `codex-small-main.json`, and `codex-small-recheck.json`.
- **Sub-part 2F (`56.34–57.84s` and `61.40–61.80s`, non-lexical vocalizations)**:
  - `56.34–57.84s`: `"Wuhu!"` / `"Wuuuh!"` / `"Huuuh"` / `"Uuuuh."` — non-lexical vocalizations/exclamations before Cue `1600107` (`58.04–60.00s`). Exclude.
  - `61.40–61.80s`: `"Näh!"` (`small` full `61.40–61.58s`, `p=0.3504`) vs. `"Naja,"` (`medium` full `61.56–61.80s`, `p=0.3014`) vs. `"Näääh."` (Muse). Unstable interjection after Cue `1600108` (`60.00–61.06s`) — hold/exclude.
- **Sub-part 2G (`61.96–74.14s`, Thaddäus's dance steps + blowing scream)**:
  - `61.96–65.40s`:
    - `independent-small-full.json` (`chunk 1 [0.0, 65.0]`): `"Und dann kommt der Hüftschwung und ein bisschen hier vorn und ein bisschen da..."` (`61.96–64.98s`, `Hüftschwung` `p=0.8377`, `vorn` `p=0.7020`)
    - `independent-small-full.json` (`chunk 2 [63.0, 125.0]`): `"Und ein bisschen hier fahren und ein bisschen davon..."` (`63.00–65.16s`, `fahren` `p=0.2464`, `davon` `p=0.3852`)
    - `independent-medium-full.json` (`chunk 1 [0.0, 65.0]`): `"Naja, und dann kommt der Hüftzwung und ein bisschen hiervon und ein bisschen da."` (`61.56–64.98s`, `Hüftzwung` `p=0.7936`, `hiervon` `p=0.7916`)
    - `independent-medium-full.json` (`chunk 2 [63.0, 125.0]`): `"und ein bisschen hiervon und ein bisschen davon..."` (`63.00–65.40s`, `hiervon` `p=0.6549`, `davon` `p=0.7386`)
    - Bounded `small` recheck crops output `"Hüpfgefroh"` / `"Hüftgefond"`, while `codex-small-main.json` and `codex-medium-main.json` agree on `"Und dann kommt der Hüftschwung"` (`~61.96–63.28s`), and split between `"hier vorn"` vs. `"hiervon"` at `63.32–65.40s`.
  - `65.40–69.76s`:
    - `independent-small-full.json` (`chunk 2 [63.0, 125.0]`): `"...und dies und dies und dies und das und das und das und da, da, da, da, da, da und dann."` (`65.16–69.76s`)
    - `independent-medium-full.json` (`chunk 2 [63.0, 125.0]`): `"...und dies und dies und dies und das und das und das und"` (`65.40–92.76s`, timestamps stretched across the bubble-blowing sequence)
    - `codex-medium-main.json`: `"...und dies und dies und dies und das und das und das und bababam bababam und dann"`
  - `69.76–75.19s`: Non-lexical bubble-blowing scream (`"Ah, ah, ah..."` / `"Aaaaaaah. Jaaaah."`) — exclude as non-lexical vocalization.
  - **Recommendation for 2G**: Hold `61.96–65.40s` and `67.76–69.76s` (`"Hüftschwung/Hüftzwung/Hüpfgefroh"`, `"hier vorn/hiervon/hier fahren"`, `"da, da, da / bababam"`) as **`reviewNeeded`** unless Codex isolates a verified sub-clause (e.g., `"Und dann kommt der Hüftschwung"` or `"Und dies und dies und dies und das und das und das."` at `~65.40–67.76s`, where `small` and `medium` full + main agree on the 12 tokens `und dies und dies und dies und das und das und das`).

---

### Bonus Finding Outside Muse's 6 Candidates (`92.76–94.86s`, between Cue `1600112` `88.76–91.08s` and Cue `1600113` `94.92–96.14s`)
- In `independent-medium-full.json` (`chunk 2 [63.0, 125.0]`), `medium` detects a segment not listed in Muse's 6 candidate windows:
  - `92.76–94.86s`: `"Das ist doch meine Seifenblase."` (`Das[92.76-93.10, p=0.7124] ist[93.10-93.52, p=0.9764] doch[93.52-93.68, p=0.8864] meine[93.68-93.96, p=0.5185] Seifenblase.[93.96-94.86, p=0.9775]`).
- In `independent-small-full.json` (`chunk 2 [63.0, 125.0]`), `small` was stuck in an `"Ah, ah, ah..."` loop from `69.76s` to `99.74s` (`compression_ratio: 26.24`), masking `83.32–99.56s`.
- Flagging this for Codex's awareness (if scope is strictly restricted to Muse's 6 candidate windows, no action needed; if Codex checks `91.1–94.9s` with a bounded `small` crop, it may confirm or hold this line).

---

### Candidate 3 (`113.48–119.00s`, window `[112.28, 120.20]`, after Cue `1600118` `110.00–112.56s`)
- **Existing overlap check**:
  - Window `[112.28, 120.20]` slightly overlaps the tail of Cue `1600118` (`110.00–112.56s`, `"Also bitte, das habe ich in den Genen."`), which ends at `112.62s` (`small` full) / `112.78s` (`medium` full). Any cue in Candidate 3 starts at `>= 113.72s`, cleanly after `112.56s`.
- **Sub-part 3A (`113.72–116.86s`, Patrick & SpongeBob chanting)**:
  - `independent-small-full.json` (`chunk 2 [63.0, 125.0]`):
    - `113.72–114.96s`: `"Tobias hat Gene!"` (`Tobias[113.72-114.22, p=0.3635] hat[114.22-114.56, p=0.9817] Gene![114.56-114.96, p=0.8803]`)
    - `115.34–116.62s`: `"Tobias hat Gene!"` (`Tobias[115.34-115.86, p=0.8679] hat[115.86-116.22, p=0.9925] Gene![116.22-116.62, p=0.9932]`)
  - `independent-medium-full.json` (`chunk 2 [63.0, 125.0]`):
    - `113.80–116.86s`: `"Tadeus hat Gene! Tadeus hat Gene!"` (`Tadeus[113.80-114.40, p=0.7096] hat[114.40-114.70, p=0.9918] Gene![114.70-115.16, p=0.9603] Tadeus[115.52-116.12, p=0.7791] hat[116.12-116.32, p=0.9939] Gene![116.32-116.86, p=0.9952]`)
  - **Disagreement / Uncertainty**: Bounded `small` main (`codex-small-main.json`) outputs `"Adios, Adkene! | Adios, Adkene! | Adios, Adkene!"`, bounded `small` recheck (`112.56–116.1s`) outputs `"Tobias hat Gehne!"`, and `medium` main outputs `"Taddeus hat Gene! (x3)"`. Because `small` never confirms `"Thaddäus/Tadeus"` here (`"Tobias"` / `"Adios, Adkene"`) and it is a repetitive chant, hold `113.48–116.86s` as **`reviewNeeded`**.
- **Sub-part 3B (`117.02–118.50s`, Thaddäus: `"Danke, danke, danke!"`)**:
  - `independent-small-full.json` (`chunk 2 [63.0, 125.0]`): `"Danke, danke, danke!"` at `117.02–118.30s` (`Danke,[117.02-117.46, p=0.6264] danke,[117.50-117.98, p=0.9141] danke![118.14-118.30, p=0.9650]`)
  - `independent-medium-full.json` (`chunk 2 [63.0, 125.0]`): `"Danke, danke, danke."` at `117.10–118.50s` (`Danke,[117.10-117.70, p=0.8824] danke,[117.70-118.16, p=0.9696] danke.[118.16-118.50, p=0.9930]`)
  - **Strong Potential Addition**: Both `independent-small-full.json` and `independent-medium-full.json` (plus Muse's ASR) agree literally on the 3-word utterance `"Danke, danke, danke!"` / `"Danke, danke, danke."` (`117.02–118.50s`, speaker `Thaddäus`, cleanly between Cue `1600118` `110.00–112.56s` and Cue `1600119` `173.18–174.78s`). Note: `codex-small-recheck.json` (`#3 115.5-120.7`) outputs 4 tokens (`"Danke, danke, danke, danke!"`) because `115.5s` starts inside the second `"hat Gene!"` chant; if Codex's tight `medium` recheck confirms 3× `"Danke"` (or if held due to 3× vs. 4× count), Codex's bounded recheck will be decisive.

---

### Candidate 4 (`127.40–170.75s`, window `[126.20, 171.95]`, between Cue `1600118` `110.00–112.56s` and Cue `1600119` `173.18–174.78s`)
- **Sub-part 4A (`127.26–170.75s`, repetitive `"Tadeus!"` chanting)**:
  - `independent-small-full.json` (`chunk 3 [123.0, 185.0]`): `"Tadeus! Tadeus! ..."` loop from `157.30–182.98s` (`compression_ratio: 21.24`).
  - `independent-medium-full.json` (`chunk 3 [123.0, 185.0]`): `"Tadeus, Tadeus, ..."` loop from `127.26–152.44s` (`compression_ratio: 9.63`) and `154.02–182.22s` (`compression_ratio: 21.24`).
  - **Recommendation**: Repetitive name-chanting / cheering (`"Thaddäus!"`), excluded per episode prompt policy.
- **Sub-part 4B (`133.96–136.30s`, `"Das ruft!"` vs. `"Tadeus,"`)**:
  - `independent-small-full.json` (`chunk 3 [123.0, 185.0]`): `"Das ruft!"` at `133.96–136.30s` (`Das[133.96-135.36, p=0.6515] ruft![135.36-136.30, p=0.9090]`, `avg_logprob: -0.8625`, `no_speech_prob: 0.5304`).
  - `independent-medium-full.json` (`chunk 3 [123.0, 185.0]`): transcribes only `"Tadeus,"` across `133.78–136.72s` (no `"Das ruft!"`).
  - **Recommendation**: Model disagreement (`small` `"Das ruft!"` with high `no_speech_prob: 0.53` vs. `medium` `"Tadeus"` chant). Hold as **`reviewNeeded`** (do not add to captions).

---

### Candidate 5 (`173.54–178.39s`, window `[172.34, 179.59]`, overlapping Cue `1600119` `173.18–174.78s`)
- **Existing overlap check**:
  - **Cue `1600119` (`173.18–174.78s`)**: `"Hallo, meine Freunde!"` (Thaddäus) is already in the baseline 19 cues. The head of Candidate 5 (`173.32–174.78s`, `"Hallo, meine Freunde!"`) is a duplicate of Cue `1600119` and **must be excluded**.
- **Remaining part (`174.78–178.39s`, `"Vor euch steht in der Tat ... [Madeo / Adeo / Adieu / Adeus]!"`)**:
  - In `independent-small-full.json` (`chunk 3 [123.0, 185.0]`) and `independent-medium-full.json` (`chunk 3 [123.0, 185.0]`), both full-chunk models were locked in the high-compression `"Tadeus!"` repetition loop (`154.02–182.98s`) and failed to break out for `173.18–182.27s`.
  - In Codex's bounded crops (`codex-small-main.json`, `codex-medium-main.json`, `codex-small-recheck.json`), the clause after Cue `1600119` (`174.78s`) is `"Vor euch steht in der Tat..."` (`small` recheck `#5 174.78-179.99` outputs `"Für euch steht in der Tat"`), followed by an unstable proper name / noun at `~177.3–179.3s`:
    - Muse ASR: `"...Madeo!"`
    - `codex-small-main.json`: `"Adeo!"`
    - `codex-medium-main.json`: `"Adieu!"`
    - `codex-small-recheck.json`: `"Adeus!"`
  - **Recommendation**: Per prompt instructions, never guess proper names or infer wording when ASR disagrees (`Madeo` / `Adeo` / `Adieu` / `Adeus`, plus `Vor euch` vs. `Für euch`). Hold `174.78–178.39s` as **`reviewNeeded`** unless Codex isolates a verified sub-clause with both `small` and `medium` bounded agreement.

---

### Candidate 6 (`181.19–182.27s`, window `[179.99, 183.47]`, after Cue `1600119` `173.18–174.78s`)
- **Full-chunk vs. Bounded ASR**:
  - `independent-small-full.json` (`chunk 3 [123.0, 185.0]`): still inside the `"Tadeus!"` repetition loop through `182.98s` (followed by hallucinated `"SWR 2020"` at `182.98–184.52s`).
  - `independent-medium-full.json` (`chunk 3 [123.0, 185.0]`): still inside the `"Tadeus,"` repetition loop through `182.22s`.
  - In Codex's bounded crops:
    - `codex-medium-main.json` (`179.99–183.47s`): `"Ein Genie!"`
    - `codex-small-main.json` (`179.99–183.47s`): `"Los! | Angenie!"`
    - `codex-small-recheck.json` (`180.8–183.4s` & `177.9–185.6s`): `"Angenie."` / `"Anzune."`
- **Recommendation**: Because `small` outputs `"Angenie"` / `"Anzune"` while `medium` outputs `"Ein Genie!"` (and full-chunk `small`/`medium` were trapped in the preceding `"Tadeus"` loop), hold Candidate 6 (`181.19–182.27s`) as **`reviewNeeded`** unless Codex's bounded recheck establishes acceptable phonetic equivalence; under strict literal agreement, `Angenie` vs. `Ein Genie` is a model split requiring **`reviewNeeded`**.

---

## 5. Tail / End-of-Clip Artifacts (`183.0–222.841938s`, `chunk 4`)

- Not part of Muse's 6 candidates, documented for completeness:
  - `independent-small-full.json` (`chunk 4 [183.0, 222.841938]`): outputs low-confidence `"Boah!"` at `186.52–187.92s` (`p=0.4729`, `no_speech_prob: 0.5910`) and `203.92–205.32s` (`p=0.4955`, `no_speech_prob: 0.5910`), plus a zero-duration end-of-file hallucination `"Das war der erste Mal, dass ich da bin."` at `221.42–222.82s` (`no_speech_prob: 0.7999`).
  - `independent-medium-full.json` (`chunk 4 [183.0, 222.841938]`): outputs non-lexical `"Brrrrr..."` at `211.58–212.98s` (`compression_ratio: 31.86`) and standard Whisper silence/outro hallucination `"Das war's für heute, bis zum nächsten Mal."` at `212.98–221.44s` (`no_speech_prob: 0.7991`, also seen at `122.76–124.00s` in `chunk 2` with `no_speech_prob: 0.8936`).
  - All `chunk 4` segments are non-lexical sounds or silence hallucinations and must be excluded.
