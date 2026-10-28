"""Build the Schmucklose lesson from reviewed bilingual rows and local word timings.

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
folder = root / "qa/kino-alignment/erdmaennchen_schmucklose"
duration = 722.48
rows = list(csv.DictReader((folder / "reviewed-lines.tsv").open(encoding="utf-8"), delimiter="\t"))
recognitions = json.loads((folder / "recognized-words.json").read_text(encoding="utf-8"))
rechecks = json.loads((folder / "medium-rechecks.json").read_text(encoding="utf-8"))
small_words = [w for s in recognitions for w in s["words"]]
medium_words = [w for r in rechecks for s in r["segments"] for w in s["words"]
                if w["start"] > r["start"] + .12 and w["end"] < r["end"] - .12 and w["end"] > w["start"]]

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
    return len(matches) / len(reference) if reference else 0, (begin if abs(begin-start) < .9 else start), (finish if abs(finish-end) < .9 else end)

captions, audit = [], []
for row in rows:
    cue_id = int(row["id"])
    cue = {"id": cue_id, "parentId": cue_id, "start": float(row["start"]),
           "end": float(row["end"]), "speaker": row["speaker"], "text": row["text"], "vi": row["vi"]}
    small = evidence(cue["text"], small_words, cue["start"], cue["end"])
    medium = evidence(cue["text"], medium_words, cue["start"], cue["end"])
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

# Independently verified additions keep exact word envelopes. The original rows
# continue through the unchanged alignment above; no new row can retime them.
supplement_file = folder / "missing-dialogue-20261028.json"
if supplement_file.exists():
    supplement = json.loads(supplement_file.read_text(encoding="utf-8"))
    frozen = json.loads((root / supplement["baselineFile"]).read_text(encoding="utf-8"))
    assert captions == frozen["captions"], "Published Schmucklose cues changed"
    published_ids = {c["id"] for c in captions}
    for item in supplement["added"]:
        assert item["id"] >= 1000280 and item["id"] not in published_ids
        cue = {key: item[key] for key in ["id", "parentId", "start", "end", "speaker", "text", "vi"]}
        assert 0 <= cue["start"] < cue["end"] <= duration
        captions.append(cue)
        audit.append({**cue, "verification": "independent-small-medium-literal",
                      "timingEvidence": item["timingEvidence"],
                      "smallWordCoverage": 1.0, "mediumWordCoverage": 1.0})
        published_ids.add(cue["id"])
    captions.sort(key=lambda c: c["start"])
    audit.sort(key=lambda c: c["start"])
    for before, after in zip(captions, captions[1:]):
        assert before["end"] <= after["start"], (before["id"], after["id"])

for name in ["caption-cues", "practice-cues"]:
    (folder / f"{name}.json").write_text(json.dumps(captions, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(folder / "aligned-utterances-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(root / "erdmaennchen-schmucklose-aligned.js").write_text(
    "// Selected dialogue from the unchanged local NDR/KiKA source; songs and uncertain speech are omitted.\n"
    + "const ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES = " + json.dumps(captions, ensure_ascii=False, indent=2) + ";\n"
    + "const ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES = ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES.map(cue => ({ ...cue }));\n", encoding="utf-8")

def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

for lang, field in [("de", "text"), ("vi", "vi")]:
    (folder / f"erdmaennchen_schmucklose.{lang}.vtt").write_text("WEBVTT\n\n" + "\n\n".join(
        f"{c['id']}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c[field]}" for c in captions)+"\n", encoding="utf-8")
summary = {"duration": duration, "practiceCues": len(captions), "captionCues": len(captions),
    "videoSha256": hashlib.file_digest((root / "video/erdmaennchen_schmucklose.mp4").open("rb"), "sha256").hexdigest(),
    "below80PercentWordSupport": [a["id"] for a in audit if max(a["smallWordCoverage"], a["mediumWordCoverage"]) < .8]}
(folder / "build-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
