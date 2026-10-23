"""Align the edited Hans script to local audio; preserve explicit lesson IDs.

Inputs: reviewed-lines.tsv + recognized-words.json. Outputs: runtime JS/JSON,
WebVTT (DE/VI), and an alignment audit. Never rewrites the source video.
"""
import csv
import difflib
import json
import pathlib
import re
import sys

import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/hans"
duration = 570.862585

def tokens(text):
    text = text.lower().replace("ß", "ss").replace("’", "'")
    return re.findall(r"\w+", text)

rows = list(csv.DictReader((folder / "reviewed-lines.tsv").open(encoding="utf-8"), delimiter="\t"))
heard = []
for segment in json.loads((folder / "recognized-words.json").read_text(encoding="utf-8")):
    for word in segment["words"]:
        for token in tokens(word["word"]):
            heard.append({**word, "token": token})
atoms, reference = [], []
for row in rows:
    begin = len(reference)
    reference.extend(tokens(row["text"]))
    atoms.append({"id": int(row["id"]), "parentId": int(row["id"]),
                  "text": row["text"], "vi": row["vi"], "_begin": begin, "_end": len(reference)})
mapping = {}
for a, b, count in difflib.SequenceMatcher(None, reference, [w["token"] for w in heard], autojunk=False).get_matching_blocks():
    mapping.update({a + i: b + i for i in range(count)})
for atom in atoms:
    matches = [mapping[i] for i in range(atom["_begin"], atom["_end"]) if i in mapping]
    if not matches:
        raise ValueError(f"No word evidence for {atom['id']}; review before building")
    atom["roughStart"] = heard[min(matches)]["start"]
    atom["roughEnd"] = heard[max(matches)]["end"]
    atom["start"], atom["end"] = atom["roughStart"], atom["roughEnd"]
    atom["matchCoverage"] = round(len(matches) / (atom["_end"] - atom["_begin"]), 3)
print(f"{len(atoms)} bilingual cues; word match coverage {len(mapping)/len(reference):.1%}", flush=True)

model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task="transcribe", language="de")
audio = decode_audio(str(root / "video/hans.mp4"), sampling_rate=16000)
i = 0
while i < len(atoms):
    j = i + 1
    while j < len(atoms) and atoms[j]["roughEnd"] - atoms[i]["roughStart"] < 23:
        j += 1
    group = atoms[i:j]
    context = atoms[max(0, i-1):min(len(atoms), j+1)]
    begin = max(0, context[0]["roughStart"] - .5)
    finish = min(duration, max(a["roughEnd"] for a in context) + .5, begin + 29.9)
    features = model.feature_extractor(audio[int(begin*16000):int(finish*16000)])
    encoded = model.encode(pad_or_trim(features))
    aligned = model.find_alignment(tokenizer, [tokenizer.encode(" " + " ".join(a["text"] for a in context))], encoded, int((finish-begin)*100))[0]
    words = []
    for word in aligned:
        words.extend({**word, "token": token} for token in tokens(word["word"]))
    offset = 0
    for atom in context:
        size = len(tokens(atom["text"]))
        span = words[offset:offset+size]
        offset += size
        assert [w["token"] for w in span] == tokens(atom["text"]), atom["id"]
        if atom not in group:
            continue
        probability = float(np.mean([w["probability"] for w in span]))
        atom["alignmentProbability"] = round(probability, 3)
        nonzero = [w for w in span if w["end"] > w["start"]]
        if nonzero and probability >= .18:
            start, end = begin + nonzero[0]["start"], begin + nonzero[-1]["end"]
            if abs(start - atom["roughStart"]) < 2 and abs(end - atom["roughEnd"]) < 2:
                atom["start"], atom["end"] = start, end
        # Preserve verified recognition endpoints when all words match there.
        if atom["_begin"] in mapping:
            atom["start"] = max(atom["start"], atom["roughStart"] - .14)
        if atom["_end"] - 1 in mapping:
            atom["end"] = max(atom["end"], atom["roughEnd"] - .04)
    print(f"Aligned {i+1}-{j}/{len(atoms)} at {begin:.2f}-{finish:.2f}", flush=True)
    i = j

# Short corrected imperative: the re-recognition evidence is saved alongside the audit.
overrides = {400220: (464.64, 465.82)}
for i, atom in enumerate(atoms):
    if atom["id"] in overrides:
        atom["start"], atom["end"] = overrides[atom["id"]]
    if i and atom["start"] < atoms[i-1]["end"]:
        boundary = (atom["start"] + atoms[i-1]["end"]) / 2
        atoms[i-1]["end"] = boundary
        atom["start"] = boundary
for i, atom in enumerate(atoms):
    atom["start"] = round(max(atoms[i-1]["end"] if i else 0, atom["start"] - .06), 3)
    atom["end"] = round(min(atom["end"] + .08, atoms[i+1]["start"] if i+1 < len(atoms) else duration), 3)
    atom.pop("_begin")
    atom.pop("_end")
    assert 0 <= atom["start"] < atom["end"] <= duration, atom
captions = [{k: a[k] for k in ["id", "parentId", "start", "end", "text", "vi"]} for a in atoms]
# Keep short readable subtitles separate from complete dictation units. Grouping
# is editorial, explicit and checked against every original spoken token.
groups = json.loads((folder / "practice-groups.json").read_text(encoding="utf-8"))
by_id = {c["id"]: c for c in captions}
positions = {c["id"]: i for i, c in enumerate(captions)}
first_group = {}
grouped_ids = set()
for group in groups:
    indices = [positions[id] for id in group["sourceIds"]]
    assert indices == list(range(indices[0], indices[-1] + 1)), group
    assert not grouped_ids.intersection(group["sourceIds"]), group
    combined = " ".join(by_id[id]["text"] for id in group["sourceIds"])
    assert tokens(combined) == tokens(group["text"]), f"Grouping must not add/remove spoken words: {group['id']}"
    first_group[group["sourceIds"][0]] = group
    grouped_ids.update(group["sourceIds"])
runtime = []
for cue in captions:
    group = first_group.get(cue["id"])
    if group:
        runtime.append({"id": group["id"], "parentId": group["id"],
            "start": by_id[group["sourceIds"][0]]["start"],
            "end": by_id[group["sourceIds"][-1]]["end"],
            "text": group["text"], "vi": group["vi"], "legacyIds": group["sourceIds"]})
    elif cue["id"] not in grouped_ids:
        runtime.append(cue)
assert len({a["id"] for a in runtime}) == len(runtime)
(folder / "aligned-utterances-audit.json").write_text(json.dumps(atoms, ensure_ascii=False, indent=2), encoding="utf-8")
(root / "hans-aligned.js").write_text("// Complete practice units and short captions share the same unchanged source audio.\nconst HANS_CAPTION_CUES = " + json.dumps(captions, ensure_ascii=False, indent=2) + ";\nconst HANS_ALIGNED_UTTERANCES = " + json.dumps(runtime, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
(root / "hans-aligned.json").write_text(json.dumps(runtime, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(folder / "caption-cues.json").write_text(json.dumps(captions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def stamp(value):
    ms = round(value * 1000)
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

for lang, field in [("de", "text"), ("vi", "vi")]:
    content = "WEBVTT\n\n" + "\n\n".join(f"{a['id']}\n{stamp(a['start'])} --> {stamp(a['end'])}\n{a[field]}" for a in captions) + "\n"
    (folder / f"hans.{lang}.vtt").write_text(content, encoding="utf-8")
print(f"Wrote {len(captions)} subtitle cues and {len(runtime)} complete practice units through {runtime[-1]['end']:.2f}s", flush=True)
