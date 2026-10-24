# Pinguine source handoff

Media: `video/pinguine_popcorn_panik.mp4` (140.480726 s, 640×360, H.264/AAC). This is the complete short clip published by verified Nickelodeon Deutschland, itself an excerpt of the television episode **Popcorn-Panik**, not the 2014 feature film and not a complete episode.

Source: https://www.youtube.com/watch?v=ONRyWXIGWQI

Download used normal public yt-dlp extraction, with Node and the official yt-dlp EJS component enabled. Initial extraction without the solver misleadingly returned unavailable; enabling its ordinary JavaScript support fixed it. No credentials, paid APIs, DRM removal, proxy, paywall or geographic restriction bypass was used.

Reproduce acquisition:

```powershell
yt-dlp --js-runtimes node --remote-components ejs:github --no-playlist --write-info-json -f 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b' --merge-output-format mp4 -o 'tmp/pinguine-source/popcorn-panik.%(ext)s' 'https://www.youtube.com/watch?v=ONRyWXIGWQI'
```

`source.json` holds the provenance, SHA256 and exact dimensions. `ffprobe.json` is media evidence. The MP4 erroneously labels its audio language `eng`; three independent automatic ASR windows identify **German** with language probability above .994. See `language-check.json`, generated with local faster-whisper base with no forced language.

`recognized-words.json` contains complete local small-model word ASR. `medium-recheck.json` is a second local recognition pass for dialogue corrections. ASR does not guarantee perfect cartoon names or punctuation. `speaker-contact-sheet.jpg` supports visual speaker attribution. Neither model output nor this handoff claims that Codex personally heard the audio.

Earshot measurements: −19.2 LUFS, −6.4 dBTP, zero clipped samples; see `earshot-measure.json`. Earshot cannot identify speech language; ASR supplies that evidence.

Public source availability does not establish permission to redistribute copyrighted media. No rights grant was inferred from download success.
