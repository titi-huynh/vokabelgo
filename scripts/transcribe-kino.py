"""Create resumable, local word-timing evidence for a Kino source video.

Run with the existing peppa-align-venv. This never edits media or lesson data.
"""
import argparse
import json
import pathlib
import sys
import time

from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding="utf-8")
parser = argparse.ArgumentParser()
parser.add_argument("key")
parser.add_argument("--model", default="small")
parser.add_argument("--source", type=pathlib.Path, help="Optional local source before editing/encoding")
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
source = args.source or root / "video" / f"{args.key}.mp4"
folder = root / "qa" / "kino-alignment" / args.key
folder.mkdir(parents=True, exist_ok=True)
started = time.time()
model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
segments, info = model.transcribe(str(source), language="de", beam_size=5,
                                  word_timestamps=True, vad_filter=False,
                                  condition_on_previous_text=False)
result = []
for segment in segments:
    result.append({"start": segment.start, "end": segment.end, "text": segment.text,
                   "avg_logprob": segment.avg_logprob,
                   "words": [{"start": w.start, "end": w.end, "word": w.word,
                              "probability": w.probability} for w in segment.words or []]})
    (folder / "recognized-words.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{segment.start:.2f}-{segment.end:.2f} {segment.text}", flush=True)
(folder / "recognition-complete.json").write_text(json.dumps({"model": args.model,
    "duration": info.duration, "segments": len(result), "seconds": time.time() - started}, indent=2), encoding="utf-8")
print(f"DONE {args.key}: {len(result)} segments in {time.time()-started:.1f}s", flush=True)
