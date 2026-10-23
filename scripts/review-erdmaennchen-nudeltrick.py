"""Local second-model checks of names, quick turns and the case's resolution."""
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
folder = root / "qa/kino-alignment/erdmaennchen_nudeltrick"
audio = decode_audio(str(root / "video/erdmaennchen_nudeltrick.mp4"), sampling_rate=16000)
model = WhisperModel("base" if args.base else "medium", device="cpu", compute_type="int8", cpu_threads=3, local_files_only=True)
checks = [(25, 54), (91, 136), (141, 181), (249, 272), (304, 356),
          (434, 499), (504, 555), (610, 646), (650, 725),
          (194, 242), (357, 434), (570, 610)]
if args.base:
    checks = [(141, 181), (444, 477), (603, 621), (670, 725)]
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
