"""Build the selected bilingual lesson and audit from reviewed local speech evidence.

WDR's captions are shortened and belong to a different edit. They are retained as
reference only. Every exercise uses timings from the local, unchanged video.
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
folder = root / "qa/kino-alignment/trudes_fahrstuhl"
duration = 411.92
rows = list(csv.DictReader((folder / "reviewed-lines.tsv").open(encoding="utf-8"), delimiter="\t"))
# These lines have unresolved wording/timing; they are not used as graded answers.
excluded = {600155: "colloquial wording", 600167: "uncertain location of a short apology",
            600171: "vor/von disagreement", 600176: "uncertain diminutive"}
recognitions = json.loads((folder / "recognized-words.json").read_text(encoding="utf-8"))
rechecks = json.loads((folder / "medium-rechecks.json").read_text(encoding="utf-8"))
small_words = [w for s in recognitions for w in s["words"]]
medium_words = [w for r in rechecks for s in r["segments"] for w in s["words"]
                if w["start"] > r["start"] + .15 and w["end"] < r["end"] - .15 and w["end"] > w["start"]]

def tokens(text):
    return re.findall(r"\w+", text.lower().replace("ß", "ss").replace("’", "'"))

def coverage(text, words, start, end):
    expected = tokens(text)
    heard = tokens(" ".join(w["word"] for w in words
        if w["end"] > start - .45 and w["start"] < end + .45))
    count = sum(n for _, _, n in difflib.SequenceMatcher(None, expected, heard, autojunk=False).get_matching_blocks())
    return round(count / len(expected), 3)

def endpoints(text, words, start, end):
    reference, heard = tokens(text), []
    for word in words:
        if word["end"] > start - .45 and word["start"] < end + .45:
            heard.extend({**word, "token": token} for token in tokens(word["word"]))
    matches = {}
    for a, b, size in difflib.SequenceMatcher(None, reference, [w["token"] for w in heard], autojunk=False).get_matching_blocks():
        matches.update({a+i: b+i for i in range(size)})
    begin = heard[matches[0]]["start"] if 0 in matches else start
    finish = heard[matches[len(reference)-1]]["end"] if len(reference)-1 in matches else end
    return (begin if abs(begin-start) < .9 else start, finish if abs(finish-end) < .9 else end)

captions, audit = [], []
for row in rows:
    cue_id = int(row["id"])
    if cue_id in excluded:
        continue
    cue = {"id": cue_id, "parentId": cue_id, "start": float(row["start"]),
           "end": float(row["end"]), "speaker": row["speaker"], "text": row["text"], "vi": row["vi"]}
    small_support = coverage(cue["text"], small_words, cue["start"], cue["end"])
    medium_support = coverage(cue["text"], medium_words, cue["start"], cue["end"])
    preferred = medium_words if medium_support >= small_support else small_words
    cue["start"], cue["end"] = endpoints(cue["text"], preferred, cue["start"], cue["end"])
    captions.append(cue)
    audit.append({**cue, "smallWordCoverage": small_support, "mediumWordCoverage": medium_support})

for i, cue in enumerate(captions):
    cue["start"] = round(max(captions[i-1]["end"] if i else 0, cue["start"] - .07), 3)
    next_start = captions[i+1]["start"] if i+1 < len(captions) else duration
    cue["end"] = round(min(next_start, cue["end"] + .10), 3)
    assert 0 <= cue["start"] < cue["end"] <= duration, cue
    assert cue["text"] and cue["vi"], cue

runtime = []
for cue in captions:
    if cue["id"] == 600179:
        second = next(c for c in captions if c["id"] == 600180)
        runtime.append({**cue, "end": second["end"],
            "text": cue["text"] + " " + second["text"],
            "vi": cue["vi"] + " " + second["vi"], "sourceIds": [600179, 600180]})
    elif cue["id"] != 600180:
        runtime.append(cue.copy())
assert len({c["id"] for c in runtime}) == len(runtime)
for name, cues in [("caption-cues", captions), ("practice-cues", runtime)]:
    (folder / f"{name}.json").write_text(json.dumps(cues, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(folder / "aligned-utterances-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(root / "trudes-fahrstuhl-aligned.js").write_text(
    "// Selected speech from the unchanged local WDR video; not a transcript of every sound.\n"
    + "const TRUDES_FAHRSTUHL_CAPTION_CUES = " + json.dumps(captions, ensure_ascii=False, indent=2) + ";\n"
    + "const TRUDES_FAHRSTUHL_ALIGNED_UTTERANCES = " + json.dumps(runtime, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

for lang, field in [("de", "text"), ("vi", "vi")]:
    (folder / f"trudes_fahrstuhl.{lang}.vtt").write_text("WEBVTT\n\n" + "\n\n".join(
        f"{c['id']}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c[field]}" for c in captions)+"\n", encoding="utf-8")
summary = {"duration": duration, "practiceCues": len(runtime), "captionCues": len(captions),
    "excluded": excluded, "videoSha256": hashlib.file_digest((root / "video/trudes_fahrstuhl.mp4").open("rb"), "sha256").hexdigest(),
    "below80PercentWordSupport": [a["id"] for a in audit if max(a["smallWordCoverage"], a["mediumWordCoverage"]) < .8]}
(folder / "build-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
