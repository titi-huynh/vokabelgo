# Independent QA Review — Nudeltrick Missing-Line Evidence (`2026-10-27`)

> Preliminary review snapshot: this review was written before the medium tight pass and both context passes were complete. Its recommendations flag risks to investigate; final decisions belong in `review.json` and the Vietnamese final report, which must account for the later evidence. Earshot's Music 0.63 supports a music classification only; the opening-song exclusion follows the user's explicit instruction. Earshot does not verify lyrics or German wording.

- **Reviewer:** Antigravity (Independent Read-Only QA Review)
- **Workspace:** `C:\Users\huynh\.codex\worktrees\kino-nudeltrick-missing-lines\flash`
- **Primary Evidence Inspected:**
  - `qa/kino-alignment/nudeltrick_missing_20261027/independent-small.json` (`12/12` windows complete, `candidateSha256: fc3a79efd6ac3ef60631e55faac2dd39540d484f80aa3d7eb0fcde979c73a2ad`)
  - `qa/kino-alignment/nudeltrick_missing_20261027/independent-medium.json` (`12/12` windows complete, same `candidateSha256`)
  - `qa/kino-alignment/nudeltrick_missing_20261027/independent-small-tight.json` & `progress.txt` (tight window checks)
  - `qa/kino-alignment/nudeltrick_missing_20261027/earshot-opening.json` (acoustic measurement of Window #1)
  - `qa/kino-alignment/erdmaennchen_nudeltrick/recognized-words.json` (`orig-small`), `medium-rechecks.json` (`orig-med`), `base-rechecks.json` (`orig-base`), `reviewed-lines.tsv`, and `README.md`
  - `erdmaennchen-nudeltrick-aligned.js` (`118` cues, IDs `900101`–`900225`), `erdmaennchen-nudeltrick-lesson.js` (`7` chapters, `49` picks, `24` flashcards), and `qa/kino-alignment/erdmaennchen-nudeltrick-source.json`
- **Untrusted Candidate Suggestion Input:** `qa/kino-alignment/nudeltrick_missing_20261027/muse-candidates.json` (`quet-cau-thieu--nudeltrick.json`) — treated strictly as an untrusted candidate suggestion, never as ground truth.

---

## 1. Executive Summary

1. **Opening Window #1 (`0.58–27.32s`) is the theme song and MUST be excluded:** Confirmed by `earshot-opening.json` (`AudioSet: Music 0.63`, `5.0 onsets/s`, `LRA 2.2 LU`), high `no_speech_prob` (`0.488` in `ind-small`, `0.561` in `ind-medium`), and lyric transcription disagreements across models (`Direktiv` vs `Detektiv`, `Schnell` vs `Schneller`, `auch` vs `auf`, `aufgewachsen` vs `aufgefasst` vs `aufgepasst` vs `aufgebast`).
2. **Existing Captions Must Not Be Duplicated:** Nine existing cues in `erdmaennchen-nudeltrick-aligned.js` (`900109`, `900113`, `900115`, `900140`, `900141`, `900189`, `900190`, `900222`, `900225`) overlap the 12 candidate windows and must remain single, non-duplicated cues.
3. **Exact Safe Short Additions:** Only **8–9 short lines** across Windows **#2, #7, #9, #10, #12** (plus **#5** only if contraction `kommt's` vs `kommt es` is handled) have consistent, grammatical multi-model ASR support without silent grammar repair.
4. **Particularly Unsafe Regions to Reject:** Windows **#1, #3, #4, #6, #8, #11** (and parts of **#2, #9, #10, #12**) contain severe cross-model word disagreements, ungrammatical ASR tokens (`"die Nudeltrick"`, `"wenn ihr nicht gewesen wird"`, `"wäre in deine Füße"`), incomplete fragments (`"Aber meine Tasche, das ..."`), or low-probability interjections/outro hallucinations (`"Oh, Micha!"`, `"Pizza! Pizza!"`). Per policy, ASR grammar must **not** be silently corrected.

---

## 2. Window-by-Window Independent ASR Comparison (Candidates #1–#12)

### Candidate #1 (`0.58–27.32s`, Muse `2.98–24.92s`) — **EXCLUDE (Opening Song)**
- **Muse (untrusted):** `"Ein Erdmännchen als Detektiv, das gibt's nicht überall."` | `"Mit diesen beiden geht nicht schief, sie lösen jeden Fall."` | `"Schneller als die Polizei, macht euch auch was gefasst."` | `"Jan und Henry sind die zwei Verbrecher aufgewachsen."`
- **`ind-small`:** `"Ein Erdmännchen als Direktiv, das gibt's nicht überall."` | `"Mit diesen beiden geht nicht schief, sie lösen jeden Fall."` | `"Schnell als die Polizei macht euch auf was gefasst."` | `"Jan und Henry sind die zwei Verbrecher aufgefasst."` (`no_speech_prob: 0.488`)
- **`ind-medium`:** `"Ein Erdmännchen als Detektiv, das gibt's nicht überall."` | `"Mit diesen beiden geht nicht schief, sie lösen jeden Fall."` | `"Schneller als die Polizei, macht euch auf was gefasst."` | `"Jan und Henry sind die zwei Verbrecher aufgepasst."` (`no_speech_prob: 0.561`)
- **`orig-small`:** `"Ein Dirtmännchen..."` | `"...Schneller als die Polizei..."` | `"...aufgebast."`
- **Verdict:** **Exclude completely.** Opening title song (`earshot-opening.json` confirms `Music 0.63`), explicitly omitted by lesson policy (`// Selected dialogue from the unchanged local NDR/KiKA source; songs and uncertain speech are omitted.`), with severe word disagreements (`Direktiv`/`Dirtmännchen`/`Detektiv`, `Schnell`/`Schneller`, `auch`/`auf`, `aufgewachsen`/`aufgefasst`/`aufgepasst`/`aufgebast`).

---

### Candidate #2 (`80.26–102.55s`, Muse `82.66–100.15s`) — **PARTIAL SAFE ADDITIONS + UNSAFE SEGMENTS + EXISTING CUE `900109`**
- **Existing Cue Overlap:** `900109` (`100.80–103.04s`: `"Verrat doch bitte nicht alles."`) is at the end of this window (`ind-small` `100.80–102.52s` and `ind-medium` `101.20–102.52s` transcribe `"Verrat doch bitte nicht alle."`). **Do NOT duplicate `900109`.**
- **Sub-segment 2a (`82.20–84.82s`):**
  - `ind-small`: `"Hab ich nicht gesagt, toll,"` (`82.20–84.46s`; probs: `Hab` 0.356, `ich` 0.953, `nicht` 0.890, `gesagt,` 0.995, `toll,` 0.910)
  - `ind-medium`: `"Hab ich nicht gesagt? Toll!"` (`82.28–84.82s`; probs: `Hab` 0.664, `ich` 0.928, `nicht` 0.532, `gesagt?` 0.999, `Toll!` 0.962)
  - `orig-small`: `"Hab ich nicht gesagt, toll."` (`82.30–84.52s`)
  - **Verdict 2a:** **SAFE SHORT ADDITION** as `"Hab ich nicht gesagt? Toll!"` (or `"Hab ich nicht gesagt, toll."`), `82.28–84.82s`, Speaker: `Krokodella`.
- **Sub-segment 2b (`85.18–87.34s`):**
  - `ind-small`: `"jetzt tut er gleich ein auf die Bühne."` (`tut` prob `0.076`, `er` prob `0.514`, `ein` prob `0.861`)
  - `ind-medium`: `"Jetzt holt er gleich einen auf die Bühne."` (`holt` prob `0.927`, `er` prob `0.879`, `einen` prob `0.935`)
  - `ind-small-tight`: `"Hä? Jetzt holt der gleich ein auf die Bühne."` (`holt` prob `0.578`, `der` prob `0.512`, `ein` prob `0.713`)
  - `orig-small`: `"Jetzt fuhrt der gleich ein auf die Bühne."`
  - **Verdict 2b:** **UNSAFE — REJECT.** Verb (`tut` vs `holt` vs `fuhrt`), subject (`er` vs `der`), and pronoun (`ein` vs `einen`) all disagree across models.
- **Sub-segment 2c (`87.34–88.64s`):**
  - `ind-small`: `"Wahrscheinlich den da."` (`87.34–88.40s`, probs `0.991, 0.954, 0.958`)
  - `ind-medium`: `"Wahrscheinlich den da."` (`87.60–88.64s`, probs `0.988, 0.915, 0.978`)
  - `ind-small-tight` & `orig-small`: `"Wahrscheinlich den da."` (`87.32–88.40s`)
  - **Verdict 2c:** **CONDITIONALLY SAFE SHORT ADDITION** (`"Wahrscheinlich den da."`, `87.34–88.64s`, Speaker: `Krokodella`) — 100% token agreement across all 4 runs with >0.91 probability on every word, though elliptically tied to 2b.
- **Sub-segment 2d (`90.53–91.24s`):**
  - Muse: `"Pssst!"`, `orig-small`: `"Psst."` (`90.68–91.24s`)
  - `ind-small`, `ind-medium`, `ind-small-tight`, `orig-med`: **Not present.**
  - **Verdict 2d:** **UNSAFE — REJECT `"Pssst!"`.**
- **Sub-segment 2e (`91.42–96.66s`):**
  - `ind-small`: `"Für den kommenden Trick brauche ich jemand aus dem Publikum."` (`90.86–95.68s`, probs: `Für` 0.159, remaining 9 words `0.860–0.999`)
  - `ind-medium`: `"Für den kommenden Trick brauche ich jemand aus dem Publikum."` (`91.42–96.66s`, probs: `Für` 0.458, remaining 9 words `0.803–0.999`)
  - `ind-small-tight` (`91.44–95.64s`), `orig-small` (`91.96–95.64s`), `orig-med` (`91.00–96.66s`): Exact 10-word match. (Note: all models transcribe `"jemand"`, not `"jemanden"`; preserve `"jemand"` without silent edit).
  - **Verdict 2e:** **SAFE ADDITION** (`"Für den kommenden Trick brauche ich jemand aus dem Publikum."`, `91.42–96.66s`, Speaker: `Aubergini`).
- **Sub-segment 2f (`96.70–99.16s`):**
  - `ind-small`: `"Darf ich sie nach oben?"` (`96.70–98.88s`, probs: `Darf` 0.972, `ich` 0.995, `sie` 0.501, `nach` 0.982, `oben?` 0.998)
  - `ind-medium`: `"Darf ich Sie nach oben?"` (`97.08–98.96s`, probs: `Darf` 0.985, `ich` 0.998, `Sie` 0.811, `nach` 0.985, `oben?` 0.982)
  - `ind-small-tight` (`96.40–98.86s`), `orig-small` (`96.78–98.88s`), `orig-med`: `"Darf ich Sie nach oben?"`
  - `ind-medium-tight` (`96.40–99.16s`): `"Darf ich Sie nach oben nennen?"` (`nennen?` at `98.98–99.16s`, prob `0.300`, `avg_logprob: -0.769`)
  - **Verdict 2f:** **CAUTION / BORDERLINE (`"Darf ich Sie nach oben?"`).** While 5 runs agree on the 5 words `"Darf ich Sie nach oben?"`, `ind-medium-tight` detects a trailing verb token `"nennen?"` (prob `0.300` at `98.98–99.16s`, where standard German would expect `"bitten"`). Thus `"Für den kommenden Trick brauche ich jemand aus dem Publikum."` (`91.42–95.76s`) alone is safer than including `96.70–99.16s`. If `"Darf ich Sie nach oben?"` is included, it must end at `98.96s` and never include `"nennen?"`.
- **Sub-segment 2g (`98.96–99.90s`):**
  - `ind-medium`: `"Oh, Micha!"` (`98.96–99.88s`, `avg_logprob: -0.604`, `Oh,` prob `0.270`, `Micha!` prob `0.582`)
  - `orig-small`: `"Auf mich."` (`99.34–99.66s`)
  - `ind-small`, `ind-small-tight`: **No segment detected.**
  - **Verdict 2g:** **UNSAFE — REJECT `"Oh, Micha!"` / `"Auf mich."`.**

---

### Candidate #3 (`116.20–123.99s`, Muse `118.60–121.59s`) — **UNSAFE / DUPLICATE — REJECT**
- **Existing Cue Overlap:** `900113` (`115.20–118.48s`: `"Ist es vielleicht die hier?"`) covers `116.20–118.48s`.
- **ASR Comparison:**
  - Muse: `"Die hier!"` (`117.40–119.40s`, overlaps `900113`)
  - `ind-small`: `"Ich ... die hier ..."` (`116.20–118.20s`, overlaps `900113`) | `"Ja!"` (`119.02–119.22s`, prob `0.088`) | `"Ha, ha, ha, ha!"` (`121.78–123.66s`)
  - `ind-medium`: `"Nicht die hier!"` (`116.20–118.28s`, `Nicht` prob `0.190`, overlaps `900113`; nothing in `118.48–122.98s`)
  - `ind-small-tight` (`118.40–122.90s`): `(no segments)`
- **Verdict:** **REJECT completely.** Overlaps `900113` up to `118.48s`, and only low-probability exclamation/laughter (`"Ja!"` prob `0.088`, `"Ha, ha, ha, ha!"`) exists between `900113` and `900114`.

---

### Candidate #4 (`131.46–138.43s`, Muse `133.86–136.03s`) — **UNSAFE — REJECT**
- **ASR Comparison (`131.00–134.44s`):**
  - Muse: `"Wie ist das?"` (`132.66–133.66s`, `avg_logprob: -0.79`, `no_speech_prob: 0.53`)
  - `ind-small`: `"Wir haben eine Krawatte. Wie ist das?"` (`131.46–132.94s`; probs: `Wir` `0.064`, `haben` `0.363`, `eine` `0.203`, `Krawatte.` `0.878`, `Wie` `0.485`, `ist` `0.975`, `das?` `0.512`) | `"Ja!"` (`133.94–134.32s`, prob `0.571`)
  - `ind-medium`: `"Eine Krawatte! Die ist doch hier!"` (`131.46–134.44s`; probs: `Eine` `0.194`, `Krawatte!` `0.983`, `Die` `0.405`, `ist` `0.980`, `doch` `0.868`, `hier!` `0.342`)
  - `ind-small-tight` (`131.00–136.50s`): `"Meine Krawatte."` (`Meine` `0.715`, `Krawatte.` `0.906`) | `"Wie ist das?"` (`Wie` `0.429`, `ist` `0.975`, `das?` `0.322`) | `"Ja!"` (`0.532`)
  - `orig-small`: `"Meine Krawatte?"` (`131.10–131.86s`) | `"Wie ist doch?"` (`132.30–132.96s`) | `"Ja!"` (`133.96–134.34s`)
  - `orig-med`: `"Meine Krawatte?"` (`131.36–131.96s`) | `"Ja!"` (`131.96–132.10s`) | `"Die ist doch hier!"` (`132.66–134.44s`)
- **Verdict:** **REJECT completely.** Every phrase in this window suffers from severe cross-model disagreement (`"Wir haben eine Krawatte"` vs `"Eine Krawatte!"` vs `"Meine Krawatte?"`; `"Wie ist das?"` vs `"Wie ist doch?"` vs `"Die ist doch hier!"`) and low word probabilities (`0.064–0.512`).

---

### Candidate #5 (`138.60–147.71s`, Muse `141.00–145.31s`) — **CONTRACTION CAUTION + EXISTING CUE `900115`**
- **Existing Cue Overlap:** `900115` (`144.42–148.30s`: `"Wo bewahren Sie eigentlich Ihr Geld auf?"`) already covers the second half of this window (`144.52–148.16s`). Note that `ind-small` (`144.54–147.54s`) and `ind-medium` (`144.58–147.68s`) stop at `147.71s` because the window cut off `"auf?"` at `147.71s` (`orig-small` `144.52–147.94s` and `orig-med` `145.42–148.16s` include `"auf?"`). **Do NOT duplicate or truncate `900115`.**
- **Sub-segment 5a (`141.26–144.12s`):**
  - Muse: `"Achtung jetzt kommt's jetzt kommt's. Wo? Bewahren!"`
  - `ind-small` (`141.26–143.96s`) & `orig-small` (`141.26–143.94s`): `"Achtung, jetzt kommt es! Jetzt kommt es!"` (`Achtung` `0.742`, `jetzt` `0.968`, `kommt` `0.967`, `es!` `0.456`, `Jetzt` `0.679`, `kommt` `0.992`, `es!` `0.975`)
  - `ind-medium` (`141.28–144.12s`) & `orig-med` (`141.00–144.12s`): `"Achtung! Jetzt kommt's! Jetzt kommt's!"` (`Achtung!` `0.923`, `Jetzt` `0.990`, `kommt's!` `0.873`, `Jetzt` `0.735`, `kommt's!` `0.990`)
  - `orig-base` (`141.00–143.90s`): `"Ach doch, jetzt kommt's! Jetzt kommt's!"`
- **Verdict 5a:** **BORDERLINE / CONTRACTION DISAGREEMENT (`kommt es` vs `kommt's`).** Both `small` runs output uncontracted `"kommt es"` (prob `0.456` on first `es!`), while `medium` and `base` output contracted `"kommt's"`. In `scripts/build-erdmaennchen-nudeltrick.py`, `tokens()` splits `"kommt's"` into `["kommt", "s"]` vs `["kommt", "es"]`, so `smallWordCoverage` is `5/7 = 0.714` while `mediumWordCoverage` is `1.000`. If added (`141.26–144.12s`, Speaker: `Krokodella`), be aware of the `kommt's` vs `kommt es` dictation ambiguity; omitting it is safer if strict cross-model token identity is required.

---

### Candidate #6 (`158.66–164.95s`, Muse `161.06–162.55s`) — **UNSAFE FRAGMENT — REJECT (Previously Excluded ID `900116`)**
- **ASR Comparison (`160.56–163.04s`):**
  - Muse & `orig-med`: `"Aber in meiner Tasche, das ..."`
  - `ind-small` (`160.56–162.64s`), `ind-medium` (`160.80–163.04s`), `ind-small-tight` (`160.80–162.48s`), `orig-small` (`161.20–163.00s`): `"Aber meine Tasche, das ..."` (`Aber` prob `0.370–0.639`, `meine` prob `0.457–0.610`, trailing `...` prob `0.259–0.390`)
  - `orig-base`: `"Aber meine Tasche ist..."`
  - Plus `ind-small` has a phantom `"Ja."` at `163.70–164.50s` with probability `0.029`.
- **Verdict:** **REJECT completely.** Incomplete trailing sentence fragment (`"das ..."`), disagreement on `"meine"` vs `"in meiner"` vs `"ist..."`, and already documented in `qa/kino-alignment/erdmaennchen_nudeltrick/README.md` as excluded draft ID `900116`.

---

### Candidate #7 (`182.15–194.46s`, Muse `184.55–192.06s`) — **SAFE ADDITIONS (2 Cues)**
- **Sub-segment 7a (`185.35–187.97s`):**
  - Muse: `"Hahaha, sehr lustiger Trick, nicht wahr, Jan?"`
  - `ind-small` (`185.35–187.81s`): `"Sehr lustiger Trick, nicht wahr, Jan?"` (probs: `Sehr` `0.773`, `lustiger` `0.880`, `Trick,` `0.985`, `nicht` `0.992`, `wahr,` `0.264`, `Jan?` `0.958`)
  - `ind-medium` (`185.47–187.97s`): `"Sehr lustiger Trick, nicht wahr, Jan?"` (probs: `Sehr` `0.577`, `lustiger` `0.981`, `Trick,` `0.997`, `nicht` `0.985`, `wahr,` `0.985`, `Jan?` `0.927`)
  - `orig-small` (`185.32–187.78s`): `"Sehr lustiger Trick, nicht, Marjan?"`
  - **Verdict 7a:** **SAFE SHORT ADDITION** as **`"Sehr lustiger Trick, nicht wahr, Jan?"`** (`185.35–187.97s`, Speaker: `Jan & Henry`). **CRITICAL:** Do **NOT** include Muse's leading `"Hahaha,"` (absent from all local ASR models). Also note: `qa/kino-alignment/erdmaennchen_nudeltrick/medium-rechecks.json` did not originally include `(182, 194)`, and `recognized-words.json` (`orig-small`) had `"Marjan"`, which gives only `4/6 = 0.667` (`< 0.80`) token coverage unless `medium-rechecks.json` is updated with the `182.15–194.46s` medium segment before running `scripts/build-erdmaennchen-nudeltrick.py`.
- **Sub-segment 7b (`188.17–191.01s`):**
  - Muse: `"Ja, ich glaube schon."`
  - `ind-small` (`188.17–190.79s`): `"Ja, ich glaube schon."` (probs: `Ja,` `0.742`, `ich` `0.985`, `glaube` `0.947`, `schon.` `0.978`)
  - `ind-medium` (`188.67–191.01s`): `"Ja, ich glaube schon."` (probs: `Ja,` `0.536`, `ich` `0.981`, `glaube` `0.981`, `schon.` `0.977`)
  - `orig-small` (`188.18–190.82s`): `"Ja. Ich glaube schon."`
  - **Verdict 7b:** **SAFE SHORT ADDITION** as **`"Ja, ich glaube schon."`** (`188.17–191.01s`, Speaker: `Jan & Henry`). 100% agreement across `ind-small`, `ind-medium`, and `orig-small`.

---

### Candidate #8 (`288.36–296.51s`, Muse `290.76–294.11s`) — **UNSAFE FILLER + EXISTING CUES `900140` & `900141` — REJECT**
- **Existing Cue Overlap:**
  - `900140` (`289.12–290.10s`: `"Kommst du mal bitte mit?"`)
  - `900141` (`294.68–299.56s`: `"Ich glaube, irgendwer möchte, dass man dich verdächtigt."`)
- **ASR Comparison in Gap (`290.10–294.68s`):**
  - Muse: `"Bitte mit."` | `"Ja."` | `"Bitte."` | `"Hm."` | `"Hm."`
  - `ind-small`: `"auf. Kommst du mal bitte mit? Ja. Bitte. Ich glaube."` (`Ja.` `290.94–291.12s` prob `0.599`; `Bitte.` `291.48–291.64s` prob `0.633`)
  - `ind-medium`: `"auf. Kommen Sie mal bitte mit. Tja. Bitte. Ich glaube ..."` (`Tja.` `290.54–291.46s` prob `0.583`; `Bitte.` `292.12–292.12s` zero-length timestamp, prob `0.765`, `no_speech_prob: 0.529`)
  - `ind-small-tight` (`290.10–294.60s`): `"Ja, bitte."` (`avg_logprob: -1.004`, `Ja,` prob `0.081`, `bitte.` prob `0.473`)
- **Verdict:** **REJECT completely.** `"Kommst du mal bitte mit?"` (`900140`) and `"Ich glaube..."` (`900141`) are already in the lesson; the gap only contains ultra-short, low-probability filler where `ind-small` (`"Ja."` prob `0.081` in tight window) and `ind-medium` (`"Tja."`) disagree.

---

### Candidate #9 (`564.71–572.73s`, Muse `567.11–570.33s`) — **1 SAFE SHORT ADDITION + UNSAFE WORDS + EXISTING CUE `900189`**
- **Existing Cue Overlap:** `900189` (`571.30–573.12s`: `"Kannst du was erkennen?"`) is cut off at the end of Window #9 (`"Kannst du was erken-"` / `"erkä-"`). **Do NOT duplicate `900189`.**
- **Sub-segment 9a (`564.71–568.71s`):**
  - Muse: `"Ah, los geht's!"` (`566.12–568.12s`)
  - `ind-small`: `"So! Los geht's!"` (`So!` `564.71–565.87s` prob `0.409`; `Los` `566.41–567.43s` prob `0.894`, `geht's!` `567.43–568.13s` prob `0.673`)
  - `ind-medium`: `"So, los geht's!"` (`So,` `565.41–566.05s` prob `0.392`; `los` `567.27–567.53s` prob `0.817`, `geht's!` `567.53–568.71s` prob `0.868`)
  - `ind-small-tight`: `"Na, so, los gehts."` (`Na,` prob `0.152`, `so,` prob `0.677`, `los` prob `0.865`, `gehts.` prob `0.750`)
  - `orig-small`: `"So!"` (`564.12–564.80s`) | `"Los geht's!"` (`566.86–568.22s`)
  - **Verdict 9a:**
    - Leading `"Ah,"` (Muse) / `"Na,"` (`ind-small-tight` prob `0.152`) / `"So"` (prob `0.392–0.409`, separated by >1.2s pause) is **unsafe**.
    - **`"Los geht's!"`** (`566.86–568.22s`, Speaker: `Krokodella`) is a **SAFE SHORT ADDITION** supported across `ind-small`, `ind-medium`, and `orig-small`.
- **Sub-segment 9b (`568.57–570.45s`):**
  - Muse: `"Hm, Käse!"`
  - `ind-small` (`568.57–569.97s`) & `ind-small-tight` (`568.60–569.96s`): `"Geht's?"` / `"Gehts."` (prob `0.585–0.789`)
  - `ind-medium` (`569.81–570.45s`) & `orig-small` (`569.26–569.94s`): `"Käse!"` (prob `0.555`)
  - **Verdict 9b:** **UNSAFE — REJECT.** Direct model conflict between `"Geht's?"` (`ind-small`) and `"Käse!"` (`ind-medium`).

---

### Candidate #10 (`571.30–596.99s`, Muse `573.70–594.59s`) — **3 SAFE ADDITIONS + 4 UNSAFE SEGMENTS + EXISTING CUES `900189` & `900190`**
- **Existing Cue Overlap:**
  - `900189` (`571.30–573.12s`: `"Kannst du was erkennen?"`) at window start.
  - `900190` (`594.90–596.70s`: `"Was passiert nun?"`) at window end.
  - **Do NOT duplicate `900189` or `900190`, and ensure adjacent timestamps do not overlap `< 573.12s` or `> 594.90s`.**
- **Sub-segment 10a (`573.56–575.50s`):**
  - `ind-small` (`573.56–575.34s`): `"Sie packt ihre Tüten aus."` (probs: `0.969, 0.954, 0.943, 0.836, 0.998`)
  - `ind-medium` (`573.76–575.50s`): `"Sie packt ihre Tüten aus."` (probs: `0.921, 0.990, 0.978, 0.986, 0.990`)
  - `orig-med` (`573.76–575.52s`): `"Sie packt ihre Tüten aus."` (`orig-small` had `"Küken"`, resolved by both independent models and `orig-med`).
  - **Verdict 10a:** **SAFE SHORT ADDITION** as **`"Sie packt ihre Tüten aus."`** (`573.76–575.50s`, Speaker: `Jan & Henry`). Use start `>= 573.56s` so `-0.10s` lead-in padding stays `>= 573.46s > 573.12s` (`900189.end`).
- **Sub-segment 10b (`575.72–577.52s`):**
  - `ind-small` (`575.72–577.38s`), `ind-small-tight` (`575.40–577.40s`), `orig-small` (`575.60–577.36s`): `"Sie hat ein Käse gekauft."` (`ein` prob `0.623–0.649` — ungrammatical neuter/colloquial `ein` for masculine `der Käse`)
  - `ind-medium` (`575.74–577.52s`), `orig-med` (`575.64–577.00s`): `"Sie hat einen Käse gekauft."` (`einen` prob `0.916`)
  - **Verdict 10b:** **UNSAFE / ARTICLE DISAGREEMENT (`ein` vs `einen`).** All three `small` runs transcribe ungrammatical `"ein Käse"`, while `medium` transcribes `"einen Käse"`. Because `"ein"` vs `"einen"` is a direct model conflict on a grammar/case inflection, this line is unsafe for strict ASR agreement (or if included via `medium`, must be flagged as a `small` vs `medium` tie-break).
- **Sub-segment 10c (`577.60–580.70s`):**
  - `ind-small`: `"Ah, ja."` (`577.60–578.36s`, `Ah,` prob `0.396`) | `"Man riecht es."` (`579.20–580.22s`, `Man` prob `0.496`, `es.` prob `0.214`)
  - `ind-medium`: `"Ah, ja."` (`577.92–578.64s`, `Ah,` prob `0.486`) | `"Man riecht's, hm?"` (`579.38–580.70s`, `riecht's,` prob `0.870`, `hm?` prob `0.645`)
  - `ind-small-tight`: `"Ah, ja, man riecht, und..."` (`Ah,` prob `0.202`, omits `es`/`'s`)
  - `orig-small`: `"Nein! Ja, man riecht's..."`
  - **Verdict 10c:** **UNSAFE — REJECT.** Disagrees across all runs (`"Ah, ja"` vs `"Nein! Ja"`, `"Man riecht es."` vs `"Man riecht's, hm?"` vs `"man riecht"`).
- **Sub-segment 10d (`580.72–582.78s`):**
  - `ind-small` (`580.72–582.72s`): `"Und ich habe schon gedacht, das wäre in deine Füße."` (`Und` `0.371`, `habe` `0.325`, `wäre` `0.676`, `in` `0.914`, `deine` `0.580`)
  - `ind-medium` (`580.88–582.78s`) & `orig-med`: `"Und ich hab schon gedacht, das wären deine Füße."` (`Und` `0.527`, `hab` `0.851`, `wären` `0.983`, `deine` `0.995`)
  - `orig-small` (`578.12–582.72s`): `"...und ich hab schon gedacht, das wäre in deiner Füße."`
  - **Verdict 10d:** **UNSAFE — REJECT.** Severe disagreement between `ind-small` (`"habe ... wäre in deine Füße"`, ungrammatical) and `ind-medium` (`"hab ... wären deine Füße"`).
- **Sub-segment 10e (`584.34–587.14s`):**
  - `ind-small` (`584.34–587.04s`): `"Und nun, schweb!"` (probs: `0.896, 0.993, 0.897`)
  - `ind-medium` (`584.76–587.14s`): `"Und nun, schweb!"` (probs: `0.784, 0.982, 0.957`)
  - `ind-small-tight` (`584.20–587.06s`), `orig-small` (`584.36–586.94s`), `orig-med` (`584.82–587.14s`): `"Und nun, schweb!"`
  - **Verdict 10e:** **SAFE SHORT ADDITION** as **`"Und nun, schweb!"`** (`584.36–587.14s`, Speaker: `Krokodella`). 100% agreement across all 5 runs.
- **Sub-segment 10f (`587.96–589.12s`):**
  - `ind-small` (`587.96–588.92s`) & `orig-small`: `"Du schweb schon!"` (`Du` prob `0.515`)
  - `ind-medium` (`588.12–589.12s`) & `orig-med`: `"Nun, schweb schon!"` (`Nun,` prob `0.701`)
  - `ind-small-tight` (`587.96–588.92s`): `"Nur schweb schon!"` (`Nur` prob `0.252`)
  - **Verdict 10f:** **UNSAFE — REJECT.** Three-way disagreement on the first word (`"Du"` vs `"Nun"` vs `"Nur"`).
- **Sub-segment 10g (`590.52–594.48s`):**
  - `ind-small`: `"Los!"` (`590.52–590.98s`, prob `0.895`) + `"Setz deine Löcher in Bewegung und schweb!"` (`591.60–594.36s`, probs: `Setz` `0.844`, `deine` `0.893`, `Löcher` `0.853`, `in` `0.709`, `Bewegung` `0.992`, `und` `0.856`, `schweb!` `0.982`)
  - `ind-medium`: `"Los!"` (`590.76–591.22s`, prob `0.952`) + `"Setz deine Löcher in Bewegung und schweb!"` (`591.74–594.48s`, probs: `Setz` `0.960`, `deine` `0.971`, `Löcher` `0.986`, `in` `0.996`, `Bewegung` `0.999`, `und` `0.919`, `schweb!` `0.971`)
  - `orig-med` (`590.74–594.00s`): `"Los. Setz deine Löcher in Bewegung und schweb."`
  - **Verdict 10g:** **SAFE ADDITION** either as two cues (**`"Los!"`** at `590.52–591.22s` + **`"Setz deine Löcher in Bewegung und schweb!"`** at `591.60–594.48s`) or combined as **`"Los, setz deine Löcher in Bewegung und schweb!"`** (`590.54–594.48s`, Speaker: `Krokodella`). Ensure `end <= 594.75s` so `+0.14s` padding does not overlap `900190` (`594.90s`).
- **Sub-segment 10h (`596.38–596.80s`):**
  - `ind-small` only: `"Ich will nicht mehr."` (`avg_logprob: -1.562`, `no_speech_prob: 0.582`, `Ich` prob `0.034`).
  - **Verdict 10h:** **UNSAFE HALLUCINATION — REJECT.**

---

### Candidate #11 (`693.73–717.08s`, Muse `696.13–714.68s`) — **UNSAFE — REJECT ALL (Previously Excluded IDs `900220`, `900221` + Ungrammatical ASR + Existing Cue `900222`)**
- **Existing Cue Overlap:** `900222` (`715.30–718.48s`: `"Das war doch ein ganz einfacher Fall für die Erdmännchen."`) overlaps the tail (`714.89–717.05s`: `"Ach, das war doch ein ganz einfacher..."`). **Do NOT duplicate `900222`.**
- **Sub-segment 11a (`695.73–703.55s`, Previously Excluded ID `900220`):**
  - `ind-small`: `"...dabei abgelenkt, indem man dann groß mit dem Geldbeutel wedelt."` (`abgelenkt` — ungrammatical participle in finite clause; `wedelt` prob `0.705`)
  - `ind-medium`: `"...dabei ablenkt, in dem man dann groß mit dem Geldbeutel wedelt."` (`in` prob `0.074`; `groß` prob `0.493`; `wedelt` prob `0.602`)
  - `orig-med`: `"...dabei ablenkt, indem man dann groß mit dem Geldbeutel wickelt."`
  - `orig-base`: `"...das war das Publikum. In dem man dann groß mit dem Geldbeutel wählt."`
  - **Verdict 11a:** **UNSAFE — REJECT.** Documented as excluded ID `900220` in `README.md`; conflicts on `abgelenkt`/`ablenkt`, `indem`/`in dem`, and `wedelt`/`wickelt`/`wählt`.
- **Sub-segment 11b (`704.29–709.09s`, Previously Excluded ID `900221`):**
  - `ind-small`: `"Das ist wirklich nett, dass du uns als Dankeschön die Nudeltrick verriehst."` (`Das` `0.372`, `die` `0.882`, `verriehst.` `0.491`)
  - `ind-medium`: `"Ah, das ist wirklich nett, dass du uns als Dankeschön die Nudeltrick vergehtst."` (`Ah,` `0.410`, `die` `0.831`, `vergehtst.` `0.433`)
  - `ind-small-tight`: `"Ah, das ist wirklich nett, dass du uns als Dankeschön die Nudeltrick veredst."` (`veredst.` `0.516`)
  - `orig-med`: `"...die Nudeltrick verwehtst."` | `orig-base`: `"...die Nudel-Trick verreest."` | Muse: `"...die Nudeltrick verdezt."`
  - **Verdict 11b:** **UNSAFE — REJECT.** Documented as excluded ID `900221` in `README.md`. All models transcribe ungrammatical `"die Nudeltrick"` (must NOT be silently corrected to `"den Nudeltrick"`) and produce 6 different nonsense/conflicting verbs (`verriehst` / `vergehtst` / `veredst` / `verwehtst` / `verreest` / `verdezt`).
- **Sub-segment 11c (`709.19–714.65s`):**
  - `ind-small`, `ind-medium`, `ind-small-tight`, `orig-med`: `"Na, wenn ihr nicht gewesen wird, dann hätte ich wahrscheinlich nie wieder auftreten können."` (`orig-small` and `orig-base` have `"Ja, wenn ihr nicht gewesen wird..."`)
  - **Verdict 11c:** **UNSAFE — REJECT.** Every ASR model transcribes the ungrammatical verb **`"gewesen wird"`** instead of German Subjunctive II (`"gewesen wärt"`), and `small` vs `medium` in `orig` disagree on `"Ja"` vs `"Na"`. Per rule **"Do not silently correct ASR grammar"**, `"gewesen wird"` cannot be edited to `"gewesen wärt"`, and shipping `"wenn ihr nicht gewesen wird"` as a German learning cue teaches broken grammar.

---

### Candidate #12 (`722.53–746.923s`, Muse `724.93–744.79s`) — **1 SAFE SHORT ADDITION + UNSAFE OUTRO + EXISTING CUE `900225`**
- **Existing Cue Overlap:** `900225` (`723.06–724.30s`: `"Ja, wollen wir mal sehen."`) is at the start of this window (`ind-small` `722.53–724.09s`: `"Was? Wollen wir mal sehen?"`, `ind-medium` `722.53–724.19s`: `"Wollen wir mal sehen."`). **Do NOT duplicate `900225`.**
- **Sub-segment 12a (`729.55–730.73s`):**
  - `ind-small` (`728.37–730.57s`): `"Nicht so ganz."` (probs: `Nicht` `0.638`, `so` `0.964`, `ganz.` `0.995`)
  - `ind-medium` (`729.55–730.73s`): `"Nicht so ganz."` (probs: `Nicht` `0.609`, `so` `0.961`, `ganz.` `0.997`)
  - `orig-small` (`729.92–730.56s`): `"Nicht so ganz."` (preceded by `"Äh, äh, äh ..."` at `728.32–729.92s`)
  - `ind-small-tight` (`727.50–737.00s`): Hallucinates repeated `"Äh, äh, äh..."` loop across the tight clip because the clip starts in the hesitation at `727.50s`.
  - **Verdict 12a:** **SAFE SHORT ADDITION** as **`"Nicht so ganz."`** (`729.55–730.73s` or `729.82–730.70s`, Speaker: `Jan & Henry`), supported by full-window `ind-small`, `ind-medium`, and `orig-small`. Use start `>= 729.55s` to exclude the preceding `"Äh, äh, äh"` hesitation (`728.32–729.55s`).
- **Sub-segment 12b (`732.17–746.92s`):**
  - Muse & `ind-small` (`732.53–733.63s`): `"Pizza! Pizza!"` (`Pizza!` prob `0.470`, `0.812`)
  - `ind-medium`: **No segments detected** after `730.73s`.
  - `orig-small`: `"Ha, ha, ha! Pizza! | Pizza! | Pizza, pizza, pizza, pizza! ... Ja, als ich über die Szenen ruhen..."` (outro credit music hallucination).
  - **Verdict 12b:** **UNSAFE — REJECT `"Pizza! Pizza!"`.** Completely absent in `ind-medium` and low first-word probability (`0.470`) in `ind-small`.

---

## 3. Summary Table of Exact Safe Short Additions

| Cand # | Recommended German Text (Exact ASR) | Recommended Timestamps (s) | Speaker | Supporting Models & Windows | Notes / Constraints |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **#2** | `Hab ich nicht gesagt? Toll!` *(or `Hab ich nicht gesagt, toll.`)* | `82.28–84.82` | `Krokodella` | `ind-small` (`82.20–84.46`), `ind-medium` (`82.28–84.82`), `orig-small` (`82.30–84.52`) | Fits cleanly between `900108` (`70.56–76.76`) and `900109` (`100.80–103.04`). |
| **#2** | `Wahrscheinlich den da.` *(optional; elliptical)* | `87.34–88.64` | `Krokodella` | `ind-small` (`87.34–88.40`), `ind-medium` (`87.60–88.64`), `ind-small-tight`, `orig-small` | 100% token agreement (>0.91 prob), but follows rejected `85.24–87.08s` sentence. |
| **#2** | `Für den kommenden Trick brauche ich jemand aus dem Publikum.` | `91.42–96.66` | `Aubergini` | `ind-small` (`90.86–95.68`), `ind-medium` (`91.42–96.66`), `ind-small-tight`, `orig-small`, `orig-med` | Keep spoken `jemand` (do not silently change to `jemanden`). Omit Muse `Pssst!`. |
| **#2** | `Darf ich Sie nach oben?` *(or merged with previous)* | `96.78–98.96` | `Aubergini` | `ind-small` (`96.70–98.88`), `ind-medium` (`97.08–98.96`), `ind-small-tight`, `orig-small`, `orig-med` | Ends before `99.0s`; omit unsafe `Oh, Micha!` (`98.96–99.88s`). |
| **#7** | `Sehr lustiger Trick, nicht wahr, Jan?` | `185.35–187.97` | `Jan & Henry` | `ind-small` (`185.35–187.81`), `ind-medium` (`185.47–187.97`) | Omit Muse `Hahaha,`. Update `medium-rechecks.json` if running builder so `orig-small`'s `Marjan` doesn't trigger `<80%` flag. |
| **#7** | `Ja, ich glaube schon.` | `188.17–191.01` | `Jan & Henry` | `ind-small` (`188.17–190.79`), `ind-medium` (`188.67–191.01`), `orig-small` (`188.18–190.82`) | Clean 4-word agreement between `900120` (`174.98–179.72`) and `900121` (`195.46–199.44`). |
| **#9** | `Los geht's!` | `566.86–568.22` | `Krokodella` | `ind-small` (`566.41–568.13`), `ind-medium` (`567.27–568.71`), `orig-small` (`566.86–568.22`) | Omit low-prob `So` / `Ah` (`564.7–566.0s`) and conflicting `Geht's?` / `Käse!` (`568.6–570.4s`). |
| **#10** | `Sie packt ihre Tüten aus.` | `573.76–575.50` | `Jan & Henry` | `ind-small` (`573.56–575.34`), `ind-medium` (`573.76–575.50`), `orig-med` (`573.76–575.52`) | Must start `> 573.22s` so `-0.10s` lead-in does not overlap `900189` (`571.30–573.12`). |
| **#10** | `Und nun, schweb!` | `584.36–587.14` | `Krokodella` | `ind-small` (`584.34–587.04`), `ind-medium` (`584.76–587.14`), `ind-small-tight`, `orig-small`, `orig-med` | 100% agreement across all 5 runs. Omit conflicting `Du/Nun/Nur schweb schon!` (`587.96–589.12s`). |
| **#10** | `Los, setz deine Löcher in Bewegung und schweb!` *(or split `Los!` + `Setz...`)* | `590.54–594.48` | `Krokodella` | `ind-small` (`590.52–594.36`), `ind-medium` (`590.76–594.48`), `orig-med` (`590.74–594.00`) | Must end `<= 594.75s` so `+0.14s` tail padding stays `< 594.90s` (`900190.start`). |
| **#12** | `Nicht so ganz.` | `729.55–730.73` | `Jan & Henry` | `ind-small` (`728.37–730.57`), `ind-medium` (`729.55–730.73`), `orig-small` (`729.92–730.56`) | Start `>= 729.55s` to exclude `Äh, äh, äh` (`728.32–729.55s`). Omit `Pizza! Pizza!`. |

*(Note: Candidate #5 `Achtung, jetzt kommt's! Jetzt kommt's!` at `141.26–144.12s` has `kommt es` in `small` vs `kommt's` in `medium`/`base`; only include if contraction normalization is acceptable).*

---

## 4. Verification & Audit Checklist for Final Changes (`review.json` / Runtime / QA Files)

At the time of this review, `review.json` has not yet been written and `erdmaennchen-nudeltrick-aligned.js` (`118` cues), `erdmaennchen-nudeltrick-lesson.js`, and `qa/kino-alignment/erdmaennchen_nudeltrick/reviewed-lines.tsv` are still in their baseline state (`LastWriteTime 15:14`). When the implementing worker finalizes additions, verify all of the following:

1. **No Unsupported Words or Silent Grammar Edits:**
   - Reject any addition containing `"Jetzt holt/tut er/der gleich einen/ein auf die Bühne"`, `"Pssst!"`, `"Oh, Micha!"`, `"Meine/Eine Krawatte"`, `"Wie ist das?"` / `"Die ist doch hier!"`, `"Aber [in] meiner/meine Tasche..."`, `"Hahaha,"`, `"Ja/Tja. Bitte."`, `"Geht's?"` / `"Käse!"`, `"Man riecht es/'s..."`, `"Und ich hab/habe schon gedacht, das wären/wäre [in] deine Füße"`, `"Du/Nun/Nur schweb schon!"`, `"wedelt/wickelt"`, `"die/den Nudeltrick verriehst/vergehtst/verrätst"`, `"wenn ihr nicht gewesen wird/wärt"`, or `"Pizza!"`.
2. **No Reused or Colliding Cue IDs:**
   - Existing cue IDs `900101`–`900225` (118 IDs) must **never** be reassigned or shifted.
   - Do **not** reuse previously excluded draft IDs documented in `qa/kino-alignment/erdmaennchen_nudeltrick/README.md` (`900116`, `900133`, `900168`, `900173`, `900216`, `900220`, `900221`) unless their exclusion table in `README.md` is explicitly reconciled; prefer fresh unused IDs (`>= 900226`) so existing IDs, chapter `picks`, and `flashcards` `cueId` references remain 100% immutable.
3. **No Overlapping Adjacent Timestamps:**
   - Every cue must satisfy `0 <= prev.end <= cue.start < cue.end <= next.start <= 746.92`.
   - Specifically check tight boundaries around:
     - `900109` (`start: 100.80`) after Candidate #2 additions (`end <= 99.10`).
     - `900189` (`end: 573.12`) before Candidate #10 `"Sie packt ihre Tüten aus."` (`start >= 573.56`).
     - `900190` (`start: 594.90`) after Candidate #10 `"Los, setz deine Löcher in Bewegung und schweb!"` (`end <= 594.62`).
     - `900225` (`end: 724.30`) before Candidate #12 `"Nicht so ganz."` (`start >= 729.55`).
4. **No Stale QA Counts or Desynchronized Artifacts:**
   - If `N` cues are added to `reviewed-lines.tsv` and rebuilt via `scripts/build-erdmaennchen-nudeltrick.py`, all of the following must match the new cue count (`118 + N`):
     - `erdmaennchen-nudeltrick-aligned.js` (`ERDMAENNCHEN_NUDELTRICK_CAPTION_CUES.length`)
     - `qa/kino-alignment/erdmaennchen_nudeltrick/caption-cues.json` & `practice-cues.json`
     - `qa/kino-alignment/erdmaennchen_nudeltrick/aligned-utterances-audit.json` (`below80PercentWordSupport` must remain `[]`)
     - `qa/kino-alignment/erdmaennchen_nudeltrick/build-summary.json` (`practiceCues` and `captionCues`)
     - `qa/kino-alignment/erdmaennchen_nudeltrick/erdmaennchen_nudeltrick.de.vtt` & `.vi.vtt`
     - `qa/kino-alignment/erdmaennchen-nudeltrick-source.json` (`selectedCues`: currently `118`)
     - `qa/kino-alignment/erdmaennchen_nudeltrick/README.md` (currently states `118 selected bilingual caption/practice cues`)
5. **No Accidental `picks` or `flashcards` Changes:**
   - `erdmaennchen-nudeltrick-lesson.js` chapter `picks` (7 chapters × 7 picks = 49 IDs) and `entries` / `flashcards` (24 vocabulary cards) must remain untouched.
