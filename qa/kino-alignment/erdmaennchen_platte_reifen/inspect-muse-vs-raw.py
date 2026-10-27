import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
qa = Path(__file__).resolve().parent
lesson = json.loads((qa / "muse-lesson.json").read_text(encoding="utf-8"))
medium = json.loads((qa / "muse-asr-medium.json").read_text(encoding="utf-8"))

words = [w for s in medium.get("segments", []) for w in s.get("words", [])]
picks = {p["id"] for ch in lesson["chapters"] for p in ch["picks"]}
cards = {f["cueId"] for f in lesson["flashcards"]}

print(f"Total cues: {len(lesson['cues'])}, picks: {len(picks)}, cards: {len(cards)}")
print("\n--- Cues with low probability words (< 0.70) or reviewNeeded or edited text ---")

for c in lesson["cues"]:
    cid = c["id"]
    cw = [w for w in words if w["end"] > c["start"] - 0.05 and w["start"] < c["end"] + 0.05]
    raw_txt = " ".join(w["word"].strip() for w in cw).strip()
    low = [w for w in cw if w.get("probability", 1.0) < 0.70]
    tags = []
    if c.get("reviewNeeded"):
        tags.append("REVIEW_NEEDED")
    if cid in picks:
        tags.append("PICK")
    if cid in cards:
        tags.append("CARD")
    norm_c = c["text"].replace(" ", "")
    norm_r = raw_txt.replace(" ", "")
    if norm_c != norm_r:
        tags.append(f"EDITED(raw='{raw_txt}')")
    if low or c.get("reviewNeeded") or norm_c != norm_r:
        print(f"Cue {cid} [{', '.join(tags)}] ({c['start']}-{c['end']}): {c['text']}")
        for w in cw:
            mark = "*" if w.get("probability", 1.0) < 0.70 else " "
            print(f"  {mark} {w['word']!r} ({w['start']}-{w['end']}, p={w.get('probability')})")
