"""Independent local speech audit in overlapping windows; never edits lessons.

No transcript prompt is supplied. Window context and a second model can expose
omissions hidden by comparing an edited script to its own first transcription.
"""
import argparse
import difflib
import json
import pathlib
import re
import sys
import time

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")
parser = argparse.ArgumentParser()
parser.add_argument("--model", default="base")
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/hans"
audio = decode_audio(str(root / "video/hans.mp4"), sampling_rate=16000)
duration = len(audio) / 16000
model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=3, local_files_only=True)
reference = json.loads((root / "hans-aligned.json").read_text(encoding="utf-8"))
result = []
started = time.time()
for start in range(0, int(duration), 20):
    end = min(duration, start + 24)
    segments, _ = model.transcribe(audio[int(start*16000):int(end*16000)], language="de",
        beam_size=5, word_timestamps=True, condition_on_previous_text=False,
        vad_filter=False, temperature=0)
    found = []
    for s in segments:
        found.append({"start": round(start+s.start, 3), "end": round(start+s.end, 3),
            "text": s.text.strip(), "avg_logprob": s.avg_logprob,
            "no_speech_prob": s.no_speech_prob,
            "words": [{"start": round(start+w.start, 3), "end": round(start+w.end, 3),
                       "word": w.word.strip(), "probability": w.probability} for w in s.words or []]})
    expected = [c for c in reference if c["start"] >= start and c["end"] <= end]
    result.append({"windowStart": start, "windowEnd": end, "segments": found,
                   "referenceCueIds": [c["id"] for c in expected]})
    print(f"{start:03}-{end:06.2f}: " + " | ".join(s["text"] for s in found), flush=True)
    (folder / f"independent-{args.model}-windows.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"DONE {args.model}: {len(result)} windows in {time.time()-started:.1f}s", flush=True)
