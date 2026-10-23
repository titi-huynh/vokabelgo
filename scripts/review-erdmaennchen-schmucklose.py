"""Local second-model checks of names, quick turns and the case's resolution for Schmucklose Gräfin."""
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
folder = root / "qa/kino-alignment/erdmaennchen_schmucklose"
folder.mkdir(parents=True, exist_ok=True)
audio = decode_audio(str(root / "video/erdmaennchen_schmucklose.mp4"), sampling_rate=16000)
model_name = "base" if args.base else "medium"
print(f"Loading cached {model_name} model...", flush=True)
model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)

# Key windows covering ambiguous speech, proper names, idioms and jokes
checks = [
    (25, 56),     # hunger, villa name
    (70, 125),    # knitting championship, scarf, inspector rules
    (155, 205),   # Wilhelm the butler, break-in vs misplaced
    (215, 248),   # peanut discovery, following clue
    (270, 335),   # elephant, diet, magpie spotted
    (335, 395),   # imaginary flashback of how magpie got jewels
    (400, 450),   # confronting Hannelore Elster, opera, boyfriend
    (495, 555),   # arriving at villa, Wilhelm revealed as boyfriend
    (565, 620),   # Wilhelm confession, geflunkert, love
    (630, 665),   # forgiveness, lesson about stereotyping, jewelry return
    (670, 722)    # inspector unraveled scarf, knitting new items
]

if args.base:
    # targeted tie-breaks
    checks = [(90, 125), (300, 335), (430, 450), (500, 530), (570, 600), (680, 715)]

saved = folder / ("base-rechecks.json" if args.base else "medium-rechecks.json")
results = json.loads(saved.read_text(encoding="utf-8")) if saved.exists() else []

for start, end in checks:
    if any(r["start"] == start and r["end"] == end for r in results):
        print(f"Skipping already checked window {start}-{end}", flush=True)
        continue
    print(f"Checking window {start}-{end}...", flush=True)
    segments, _ = model.transcribe(
        audio[int(start * 16000):int(end * 16000)],
        language="de",
        beam_size=5,
        word_timestamps=True,
        condition_on_previous_text=False,
        vad_filter=False,
        temperature=0
    )
    found = [{
        "start": round(start + s.start, 3),
        "end": round(start + s.end, 3),
        "text": s.text.strip(),
        "avg_logprob": s.avg_logprob,
        "words": [{
            "start": round(start + w.start, 3),
            "end": round(start + w.end, 3),
            "word": w.word.strip(),
            "probability": w.probability
        } for w in s.words or []]
    } for s in segments]
    results.append({"start": start, "end": end, "segments": found})
    saved.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{start}-{end}: " + " | ".join(s["text"] for s in found), flush=True)

print(f"DONE {model_name} rechecks: {len(results)} windows saved to {saved}", flush=True)
