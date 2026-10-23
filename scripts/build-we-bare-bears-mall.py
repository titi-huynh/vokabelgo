"""Build the We Bare Bears — Wir und die Mall clip lesson from reviewed bilingual rows and local word timings.

The original Cartoon Network Deutschland clip media is never rewritten. Songs, uncertain speech and
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
folder = root / "qa/kino-alignment/we_bare_bears_mall"
duration = 274.04
rows = list(csv.DictReader((folder / "reviewed-lines.tsv").open(encoding="utf-8"), delimiter="\t"))
recognitions = json.loads((folder / "recognized-words.json").read_text(encoding="utf-8"))
rechecks = json.loads((folder / "medium-rechecks.json").read_text(encoding="utf-8"))
base_rechecks = json.loads((folder / "base-rechecks.json").read_text(encoding="utf-8")) if (folder / "base-rechecks.json").exists() else []
second_review = json.loads((folder / "codex-second-review-rechecks.json").read_text(encoding="utf-8")) if (folder / "codex-second-review-rechecks.json").exists() else []
second_words = [w for r in second_review for s in r["segments"] for w in s["words"] if w["end"] > w["start"]]
override_path = folder / "editorial-timing-overrides.json"
timing_overrides = json.loads(override_path.read_text(encoding="utf-8")) if override_path.exists() else {}
small_words = [w for s in recognitions for w in s["words"]]
medium_words = [w for r in rechecks for s in r["segments"] for w in s["words"]
                if w["start"] > r["start"] + .12 and w["end"] < r["end"] - .12 and w["end"] > w["start"]]
base_words = [w for r in base_rechecks for s in r["segments"] for w in s["words"]
              if w["start"] > r["start"] + .12 and w["end"] < r["end"] - .12 and w["end"] > w["start"]]

def tokens(text):
    norm = text.lower().replace("ß", "ss").replace("’", "'").replace("kaufhauskopf", "kaufhaus cop").replace("kaufhose", "kaufhaus")
    out = re.findall(r"\w+", norm)
    synonyms = {"gris": "grizz", "chris": "grizz", "grace": "grizz",
                "grif": "griff", "graf": "griff", "reff": "griff", "riff": "griff",
                "kops": "cops", "korps": "cops", "estella": "esteller", "estellar": "esteller"}
    return [synonyms.get(t, t) for t in out]

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

captions, audit = [], []
for row in rows:
    cue_id = int(row["id"])
    cue = {"id": cue_id, "parentId": cue_id, "start": float(row["start"]),
           "end": float(row["end"]), "speaker": row["speaker"], "text": row["text"], "vi": row["vi"]}
    small = evidence(cue["text"], small_words, cue["start"], cue["end"])
    medium = evidence(cue["text"], medium_words, cue["start"], cue["end"])
    base = evidence(cue["text"], base_words, cue["start"], cue["end"]) if base_words else (0.0, cue["start"], cue["end"])
    candidates = [small, medium, base]
    second = evidence(cue["text"], second_words, cue["start"], cue["end"]) if second_words else (0.0, cue["start"], cue["end"])
    candidates.append(second)
    best = max(candidates, key=lambda item: item[0])
    supported = [item for item in candidates if item[0] >= .8]
    # Keep a conservative envelope when local models support the wording.
    # A slightly early lead-in is preferable to cutting the first spoken word.
    cue["start"] = min(item[1] for item in supported) if supported else best[1]
    cue["end"] = max(item[2] for item in supported) if supported else best[2]
    override = timing_overrides.get(str(cue_id))
    if override:
        cue["start"], cue["end"] = override["start"], override["end"]
    captions.append(cue)
    audit.append({**cue, "smallWordCoverage": round(small[0], 3), "mediumWordCoverage": round(medium[0], 3), "baseWordCoverage": round(base[0], 3), "secondReviewWordCoverage": round(second[0], 3), "timingOverride": override})

for i, cue in enumerate(captions):
    override = timing_overrides.get(str(cue["id"]), {})
    cue["start"] = round(max(captions[i-1]["end"] if i else 0, cue["start"] - override.get("lead", .10)), 3)
    next_start = captions[i+1]["start"] if i+1 < len(captions) else duration
    cue["end"] = round(min(next_start, cue["end"] + override.get("tail", .14)), 3)
    audit[i].update(start=cue["start"], end=cue["end"])
    assert 0 <= cue["start"] < cue["end"] <= duration, cue
    assert cue["text"] and cue["vi"] and cue["speaker"], cue
assert len({c["id"] for c in captions}) == len(captions)

for name in ["caption-cues", "practice-cues"]:
    (folder / f"{name}.json").write_text(json.dumps(captions, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(folder / "aligned-utterances-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(root / "we-bare-bears-mall-aligned.js").write_text(
    "// Selected dialogue from the unchanged local Cartoon Network Deutschland clip source; music and uncertain speech are omitted.\n"
    + "const WE_BARE_BEARS_MALL_CAPTION_CUES = " + json.dumps(captions, ensure_ascii=False, indent=2) + ";\n"
    + "const WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES = WE_BARE_BEARS_MALL_CAPTION_CUES.map(cue => ({ ...cue }));\n", encoding="utf-8")

def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

for lang, field in [("de", "text"), ("vi", "vi")]:
    (folder / f"we_bare_bears_mall.{lang}.vtt").write_text("WEBVTT\n\n" + "\n\n".join(
        f"{c['id']}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c[field]}" for c in captions)+"\n", encoding="utf-8")
summary = {"duration": duration, "practiceCues": len(captions), "captionCues": len(captions),
    "videoSha256": hashlib.file_digest((root / "video/we_bare_bears_mall.mp4").open("rb"), "sha256").hexdigest(),
    "below80PercentWordSupport": [a["id"] for a in audit if max(a["smallWordCoverage"], a["mediumWordCoverage"], a["baseWordCoverage"], a["secondReviewWordCoverage"]) < .8]}
(folder / "build-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
