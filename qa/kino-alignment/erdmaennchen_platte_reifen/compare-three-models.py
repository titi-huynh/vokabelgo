import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

lesson = json.load(open("qa/kino-alignment/erdmaennchen_platte_reifen/muse-lesson.json", encoding="utf-8"))
med = json.load(open("qa/kino-alignment/erdmaennchen_platte_reifen/muse-asr-medium.json", encoding="utf-8"))
sma = json.load(open("qa/kino-alignment/erdmaennchen_platte_reifen/anti-asr-small-windows.json", encoding="utf-8"))
bas = json.load(open("qa/kino-alignment/erdmaennchen_platte_reifen/anti-asr-base-windows.json", encoding="utf-8"))

med_words = [w for s in med["segments"] for w in s.get("words", [])]
sma_words = [w for win in sma["windows"] for s in win["segments"] for w in s.get("words", [])]
bas_words = [w for win in bas["windows"] for s in win["segments"] for w in s.get("words", [])]

def get_span_words(words, start, end, pad=0.35):
    return [(w["word"], round(w["start"], 2), round(w["end"], 2), round(w["probability"], 3))
            for w in words if w["end"] > start - pad and w["start"] < end + pad]

picks = {p["id"] for ch in lesson["chapters"] for p in ch["picks"]}
cards = {f["cueId"] for f in lesson["flashcards"]}
special = {
    3200030, 3200032, 3200033, 3200037, 3200038, 3200039,
    3200061, 3200069, 3200070, 3200071, 3200073, 3200091, 3200092, 3200093,
    3200106, 3200107, 3200112, 3200116, 3200118, 3200122, 3200123, 3200124,
    3200134, 3200135, 3200136, 3200138, 3200147, 3200148, 3200149,
    3200154, 3200155, 3200157, 3200161, 3200162, 3200163, 3200164, 3200165,
    3200177, 3200180, 3200185, 3200186, 3200187, 3200192, 3200193, 3200196,
    3200198, 3200199, 3200200, 3200201, 3200203, 3200204, 3200207, 3200210,
    3200211, 3200212, 3200213, 3200214, 3200215, 3200216, 3200220, 3200223,
    3200225, 3200226, 3200227, 3200228, 3200229, 3200230, 3200231, 3200232,
    3200233, 3200237, 3200238, 3200239, 3200240, 3200241
}

check_ids = sorted(picks | cards | special)
cue_map = {c["id"]: c for c in lesson["cues"]}

for cid in check_ids:
    c = cue_map[cid]
    tags = []
    if c.get("reviewNeeded"): tags.append("REVIEW")
    if cid in picks: tags.append("PICK")
    if cid in cards: tags.append("CARD")
    print(f"\n=== {cid} [{'/'.join(tags)}] [{c['start']}-{c['end']}] ({c['speaker']}): {c['text']} ===")
    print("  VI :", c["vi"])
    print("  MED:", get_span_words(med_words, c["start"], c["end"], 0.25))
    print("  SMA:", get_span_words(sma_words, c["start"], c["end"], 0.25))
    print("  BAS:", get_span_words(bas_words, c["start"], c["end"], 0.25))
