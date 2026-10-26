import json
from pathlib import Path

qa_dir = Path("qa/kino-alignment/erdmaennchen_luftgehen")
muse = json.loads((qa_dir / "muse-lesson.json").read_text(encoding="utf-8"))
medium_asr = json.loads((qa_dir / "muse-asr-medium.json").read_text(encoding="utf-8"))
medium_words = [w for seg in medium_asr.get("segments", []) for w in seg.get("words", [])]

cues = [c for c in muse["cues"] if not c.get("reviewNeeded")]
print("Runtime cues:", len(cues))

for i, c in enumerate(cues):
    # Check words that touch boundary with <= and >=
    touch_prev = [w for w in medium_words if w["end"] == c["start"]]
    touch_next = [w for w in medium_words if w["start"] == c["end"]]
    if touch_prev or touch_next:
        print(f"Cue {c['id']} ({c['start']}-{c['end']}): touch_prev={[w['word'] for w in touch_prev]} touch_next={[w['word'] for w in touch_next]}")
