"""Build the Nudeltrick lesson from reviewed bilingual rows and local word timings.

The original NDR/KiKA media is never rewritten. Songs, uncertain speech and
non-dialogue sounds are intentionally omitted from the selected learning cues.
"""
import csv
import difflib
import hashlib
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/erdmaennchen_nudeltrick"
duration = 746.92
rows = list(csv.DictReader((folder / "reviewed-lines.tsv").open(encoding="utf-8"), delimiter="\t"))
recognitions = json.loads((folder / "recognized-words.json").read_text(encoding="utf-8"))
rechecks = json.loads((folder / "medium-rechecks.json").read_text(encoding="utf-8"))
small_words = [w for s in recognitions for w in s["words"]]
medium_words = [w for r in rechecks for s in r["segments"] for w in s["words"]
                if w["start"] > r["start"] + .12 and w["end"] < r["end"] - .12 and w["end"] > w["start"]]

missing_folder = root / "qa/kino-alignment/nudeltrick_missing_20261027"
def load_window_words(path):
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [w for win in data.get("windows", []) for s in win.get("segments", []) for w in s.get("words", [])
            if w["end"] > w["start"]]

ind_small_sets = [
    load_window_words(missing_folder / "independent-small.json"),
    load_window_words(missing_folder / "independent-small-context.json"),
    small_words,
]
ind_medium_sets = [
    load_window_words(missing_folder / "independent-medium.json"),
    load_window_words(missing_folder / "independent-medium-context.json"),
    medium_words,
]

def tokens(text):
    return re.findall(r"\w+", text.lower().replace("ß", "ss").replace("’", "'"))

def evidence(text, words, start, end):
    reference, heard = tokens(text), []
    for word in words:
        if word["end"] > start - .4 and word["start"] < end + .4:
            heard.extend({**word, "token": token} for token in tokens(word["word"]))
    matches = {}
    for a, b, size in difflib.SequenceMatcher(None, reference, [w["token"] for w in heard], autojunk=False).get_matching_blocks():
        matches.update({a+i: b+i for i in range(size)})
    begin = heard[matches[0]]["start"] if 0 in matches else start
    finish = heard[matches[len(reference)-1]]["end"] if len(reference)-1 in matches else end
    return len(matches) / len(reference), (begin if abs(begin-start) < .9 else start), (finish if abs(finish-end) < .9 else end)

def best_evidence(text, word_sets, start, end):
    candidates = [evidence(text, wset, start, end) for wset in word_sets if wset]
    return max(candidates, key=lambda item: item[0]) if candidates else (0.0, start, end)

captions, audit = [], []
for row in rows:
    cue_id = int(row["id"])
    cue = {"id": cue_id, "parentId": cue_id, "start": float(row["start"]),
           "end": float(row["end"]), "speaker": row["speaker"], "text": row["text"], "vi": row["vi"]}
    if cue_id <= 900225:
        small = evidence(cue["text"], small_words, cue["start"], cue["end"])
        medium = evidence(cue["text"], medium_words, cue["start"], cue["end"])
    else:
        small = best_evidence(cue["text"], ind_small_sets, cue["start"], cue["end"])
        medium = best_evidence(cue["text"], ind_medium_sets, cue["start"], cue["end"])
    best = medium if medium[0] >= small[0] else small
    supported = [item for item in [small, medium] if item[0] >= .8]
    # Keep a conservative envelope when both local models support the wording.
    # A slightly early lead-in is preferable to cutting the first spoken word.
    cue["start"] = min(item[1] for item in supported) if supported else best[1]
    cue["end"] = max(item[2] for item in supported) if supported else best[2]
    captions.append(cue)
    audit.append({**cue, "smallWordCoverage": round(small[0], 3), "mediumWordCoverage": round(medium[0], 3)})

for i, cue in enumerate(captions):
    cue["start"] = round(max(captions[i-1]["end"] if i else 0, cue["start"] - .10), 3)
    next_start = captions[i+1]["start"] if i+1 < len(captions) else duration
    cue["end"] = round(min(next_start, cue["end"] + .14), 3)
    assert 0 <= cue["start"] < cue["end"] <= duration, cue
    assert cue["text"] and cue["vi"] and cue["speaker"], cue
assert len({c["id"] for c in captions}) == len(captions)

for name in ["caption-cues", "practice-cues"]:
    (folder / f"{name}.json").write_text(json.dumps(captions, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(folder / "aligned-utterances-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(root / "erdmaennchen-nudeltrick-aligned.js").write_text(
    "// Selected dialogue from the unchanged local NDR/KiKA source; songs and uncertain speech are omitted.\n"
    + "const ERDMAENNCHEN_NUDELTRICK_CAPTION_CUES = " + json.dumps(captions, ensure_ascii=False, indent=2) + ";\n"
    + "const ERDMAENNCHEN_NUDELTRICK_ALIGNED_UTTERANCES = ERDMAENNCHEN_NUDELTRICK_CAPTION_CUES.map(cue => ({ ...cue }));\n", encoding="utf-8")

def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

for lang, field in [("de", "text"), ("vi", "vi")]:
    (folder / f"erdmaennchen_nudeltrick.{lang}.vtt").write_text("WEBVTT\n\n" + "\n\n".join(
        f"{c['id']}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c[field]}" for c in captions)+"\n", encoding="utf-8")
summary = {"duration": duration, "practiceCues": len(captions), "captionCues": len(captions),
    "videoSha256": hashlib.file_digest((root / "video/erdmaennchen_nudeltrick.mp4").open("rb"), "sha256").hexdigest(),
    "below80PercentWordSupport": [a["id"] for a in audit if max(a["smallWordCoverage"], a["mediumWordCoverage"]) < .8]}
(folder / "build-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
