# QA Alignment & Integration Report — Frieren S01E02 & Cardcaptor Sakura S01E02 (German Dub)

## 1. Sources & Media Integrity (`media.json`, `published-media.json`)
- **`frieren_s01e02`** (*Frieren · Tập 2: Es hätte nicht unbedingt Magie sein müssen …*):
  - Source: `https://aniworld.to/anime/stream/frieren-beyond-journeys-end/staffel-1/episode-2` (`data-lang-key=1` / Deutsch dub, release `Frieren.Beyond.Journeys.End.S01E02.German.720p.AAC.WebRip.x264-GSD.mp4`).
  - Duration: `1560.102313s` (`26:00`), H.264 `1280×720` (`252,263,102` bytes) + 480p light (`854×480`, `136,157,599` bytes).
  - Decoded PCM audio SHA-256 identical across raw, web 720p, and light 480p: `d7a7a3ef4f96167972d161326d5d6305a7ee94295a683f447c77edf0895d08d1`.
- **`sakura_s01e02`** (*Cardcaptor Sakura · Tập 2: Sakura und Tomoyo*):
  - Source: `https://aniworld.to/anime/stream/cardcaptors/staffel-1/episode-2` (`data-lang-key=1` / Deutsch dub, release `Cardcaptor S01E02 German 720p AAC WebRip x264-TSP`).
  - Duration: `1507.160816s` (`25:07`), H.264 `960×720` (`217,249,203` bytes) + 480p light (`640×480`, `102,664,400` bytes).
  - Decoded PCM audio SHA-256 identical across raw, web 720p, and light 480p: `936d1a2a9782491f7bb5d6e9ad5fd561f27aa50060479ffcdc24a0e6439574b7`.
- Published to `titi-huynh/vokabelgo-media` release `media-v1`:
  - `video--frieren_s01e02-web-v1.mp4` (`677001509`)
  - `video--sakura_s01e02-web-v1.mp4` (`677006380`)
  - `video--kino-light--frieren_s01e02-480p-v1.mp4` (`677012006`)
  - `video--kino-light--sakura_s01e02-480p-v1.mp4` (`677026053`)

## 2. Dialogue Curation & Pick Alignment (`frieren_s01e02.json`, `sakura_s01e02.json`)
- **`frieren_s01e02`** (`?kino=frieren2`, ID `1300001`–`1300247`):
  - 247 total cues: **235** verified captions/practice units, **12** uncertain/low-confidence cues flagged `reviewNeeded: true` and excluded from captions, practice, picks, and flashcards.
  - **8** contiguous chapters (`0`–`1560.102313s`), **56** shortlisted practice picks (7/chapter), **18** flashcards, **3** Shorts suggestions (`26.3s`–`31.7s`), **7** non-speech/music exclusions.
- **`sakura_s01e02`** (`?kino=sakura2`, ID `1400001`–`1400350`):
  - 350 total cues: **342** verified captions/practice units, **8** uncertain/low-confidence cues flagged `reviewNeeded: true` and excluded from captions, practice, picks, and flashcards.
  - **8** contiguous chapters (`0`–`1507.160816s`), **55** shortlisted practice picks (6–7/chapter), **18** flashcards, **3** Shorts suggestions (`26.3s`–`30.8s`), **9** non-speech/music exclusions.
- Independent forced-alignment & probability verification on all picks and short focus cues using local `faster-whisper` `medium` (`int8`): recorded in `frieren_s01e02-picks-audit.json` and `sakura_s01e02-picks-audit.json`.

## 3. Rebuild & Verification Commands
```powershell
node scripts/build-muse-anime-lessons.cjs
node scripts/build-kino-metadata.cjs
python scripts/build-muse-anime-posters.py --input-dir qa/kino-alignment/season1-episode2
node test-all.js
npx playwright test e2e/kino-new-anime.spec.js e2e/kino-catalog.spec.js e2e/user-scenes.spec.js --trace off
```
