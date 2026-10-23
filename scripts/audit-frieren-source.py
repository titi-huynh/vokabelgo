"""Independent local recognition windows; raw ASR is evidence, not lesson text."""
import json
import pathlib
import sys
import time

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/frieren_s01e01"
folder.mkdir(parents=True, exist_ok=True)
audio = decode_audio(str(root / "video/frieren_s01e01.mp4"), sampling_rate=16000)
duration = len(audio) / 16000
model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=2,
                     local_files_only=True)
output = folder / "independent-small-windows.json"
result = json.loads(output.read_text(encoding="utf-8")) if output.exists() else []
completed = {row["windowStart"] for row in result}
started = time.time()
for start in range(0, int(duration), 30):
    if start in completed:
        continue
    end = min(duration, start + 34)
    segments, info = model.transcribe(audio[int(start * 16000):int(end * 16000)],
        language=None, beam_size=3, word_timestamps=True,
        condition_on_previous_text=False, vad_filter=False, temperature=0)
    found = []
    for segment in segments:
        found.append({"start": round(start + segment.start, 3),
                      "end": round(start + segment.end, 3),
                      "text": segment.text.strip(),
                      "avg_logprob": segment.avg_logprob,
                      "no_speech_prob": segment.no_speech_prob,
                      "words": [{"start": round(start + word.start, 3),
                                 "end": round(start + word.end, 3),
                                 "word": word.word.strip(),
                                 "probability": word.probability}
                                for word in segment.words or []]})
    row = {"windowStart": start, "windowEnd": end,
           "language": info.language, "languageProbability": info.language_probability,
           "segments": found}
    result.append(row)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{start:04}-{end:07.2f} [{info.language} {info.language_probability:.2f}]: " +
          " | ".join(item["text"] for item in found), flush=True)
(folder / "independent-small-complete.json").write_text(json.dumps({
    "duration": duration, "windows": len(result), "elapsedSeconds": time.time() - started,
    "model": "small", "language": "auto-per-window", "localOnly": True
}, indent=2), encoding="utf-8")
