import json
import re
from pathlib import Path

qa_dir = Path("qa/kino-alignment/erdmaennchen_luftgehen")
muse = json.loads((qa_dir / "muse-lesson.json").read_text(encoding="utf-8"))
medium_asr = json.loads((qa_dir / "muse-asr-medium.json").read_text(encoding="utf-8"))
small_asr = json.loads((qa_dir / "anti-asr-small-windows.json").read_text(encoding="utf-8"))
base_asr = json.loads((qa_dir / "anti-asr-base-windows.json").read_text(encoding="utf-8"))

def norm(s):
    return re.sub(r"[^a-zäöüß0-9]+", " ", s.lower()).strip()

def get_words_in_range(words, start, end, pad=0.35):
    return [w for w in words if w["end"] > start - pad and w["start"] < end + pad]

import sys
sys.stdout.reconfigure(encoding="utf-8")

def get_window_words(asr_data, start, end, pad=0.35):
    out = []
    for win in asr_data["windows"]:
        for seg in win.get("segments", []):
            for w in seg.get("words", []):
                if w["end"] > start - pad and w["start"] < end + pad:
                    out.append(w)
    return out

cues_by_id = {c["id"]: c for c in muse["cues"]}
picks_ids = [p.get("cueId", p.get("id")) if isinstance(p, dict) else p for ch in muse["chapters"] for p in ch["picks"]]
special_ids = [3100029, 3100055, 3100062, 3100067, 3100078, 3100100, 3100102, 3100120, 3100128, 3100140, 3100141, 3100142, 3100143, 3100144, 3100158, 3100171, 3100172, 3100173, 3100182]
audit_ids = sorted(set(picks_ids + special_ids))

medium_words = [w for seg in medium_asr.get("segments", []) for w in seg.get("words", [])]

for cid in audit_ids:
    c = cues_by_id[cid]
    mw = get_words_in_range(medium_words, c["start"], c["end"], 0.25)
    sw = get_window_words(small_asr, c["start"], c["end"], 0.25)
    bw = get_window_words(base_asr, c["start"], c["end"], 0.25)
    m_txt = " ".join(w["word"].strip() for w in mw)
    s_txt = " ".join(w["word"].strip() for w in sw)
    b_txt = " ".join(w["word"].strip() for w in bw)
    flag = "PICK" if cid in picks_ids else "SPEC"
    if cid in picks_ids and cid in special_ids:
        flag = "BOTH"
    print(f"[{cid}][{flag}] ({c['start']:.2f}-{c['end']:.2f}) DE: {c['text']}")
    print(f"   MED  : {m_txt}")
    print(f"   SMALL: {s_txt}")
    print(f"   BASE : {b_txt}")
