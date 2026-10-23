"""Recheck selected ambiguous speech locally against the unchanged WDR video."""
import json
import pathlib
import sys

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/trudes_fahrstuhl"
audio = decode_audio(str(root / "video/trudes_fahrstuhl.mp4"), sampling_rate=16000)
model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=3, local_files_only=True)
checks = [(140, 160), (210, 220), (230, 246), (310, 329), (334, 355), (370, 390)]
results = []
for start, end in checks:
    segments, _ = model.transcribe(audio[int(start * 16000):int(end * 16000)], language="de",
        beam_size=5, word_timestamps=True, condition_on_previous_text=False,
        vad_filter=False, temperature=0)
    found = [{"start": round(start + s.start, 3), "end": round(start + s.end, 3),
        "text": s.text.strip(), "avg_logprob": s.avg_logprob,
        "words": [{"start": round(start + w.start, 3), "end": round(start + w.end, 3),
                   "word": w.word.strip(), "probability": w.probability} for w in s.words or []]}
        for s in segments]
    results.append({"start": start, "end": end, "segments": found})
    (folder / "medium-rechecks.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{start}-{end}: " + " | ".join(s["text"] for s in found), flush=True)
