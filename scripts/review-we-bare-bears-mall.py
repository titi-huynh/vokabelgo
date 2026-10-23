"""Local second-model checks of names, quick turns and mall-chase scenes for We Bare Bears."""
import argparse
import json
import pathlib
import sys

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")
parser = argparse.ArgumentParser()
parser.add_argument("--base", action="store_true", help="Third-model tie-breaks for disputed words only")
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/we_bare_bears_mall"
audio = decode_audio(str(root / "video/we_bare_bears_mall.mp4"), sampling_rate=16000)
model = WhisperModel("base" if args.base else "medium", device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
checks = [(0, 30), (50, 100), (100, 135), (140, 185), (148, 168), (185, 225), (225, 266)]
if args.base:
    checks = [(0, 30), (50, 135), (148, 168), (140, 266)]
saved = folder / ("base-rechecks.json" if args.base else "medium-rechecks.json")
results = json.loads(saved.read_text(encoding="utf-8")) if saved.exists() else []
for start, end in checks:
    if any(r["start"] == start and r["end"] == end for r in results):
        continue
    segments, _ = model.transcribe(audio[int(start * 16000):int(end * 16000)], language="de",
        beam_size=5, word_timestamps=True, condition_on_previous_text=False,
        vad_filter=False, temperature=0)
    found = [{"start": round(start + s.start, 3), "end": round(start + s.end, 3),
        "text": s.text.strip(), "avg_logprob": s.avg_logprob,
        "words": [{"start": round(start + w.start, 3), "end": round(start + w.end, 3),
                   "word": w.word.strip(), "probability": w.probability} for w in s.words or []]}
        for s in segments]
    results.append({"start": start, "end": end, "segments": found})
    saved.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{start}-{end}: " + " | ".join(s["text"] for s in found), flush=True)
