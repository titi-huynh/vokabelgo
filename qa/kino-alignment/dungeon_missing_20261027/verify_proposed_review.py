"""Verify proposed-review.json against raw ASR outputs, 367 existing cues, chapter bounds, and baseline SHAs."""
import hashlib
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

root = pathlib.Path(__file__).resolve().parents[3]
qa_dir = pathlib.Path(__file__).resolve().parent

review = json.loads((qa_dir / "proposed-review.json").read_text(encoding="utf-8"))
baseline = json.loads((qa_dir / "baseline-cues-367.json").read_text(encoding="utf-8"))
aligned_shas = json.loads((qa_dir / "baseline-aligned-sha256.json").read_text(encoding="utf-8"))
existing_cues = baseline["cues"]

lesson_text = (root / "delicious-in-dungeon-s01e01-lesson.js").read_text(encoding="utf-8")
m_ch = re.search(r'"chapters"\s*:\s*(\[\s*\{.*?\}\s*\])\s*\}\s*,\s*"flashcards"', lesson_text, re.S)
chapters = json.loads(m_ch.group(1))


def sha256_file(p: pathlib.Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024 * 8), b""):
            h.update(chunk)
    return h.hexdigest()


def normalize_tokens(text: str):
    text = text.lower().replace("’", "'")
    name_map = {
        "falli": "falin",
        "vali": "falin",
        "fallen": "falin",
        "fali": "falin",
        "masse": "marcille",
        "marcel": "marcille",
    }
    return [name_map.get(t, t) for t in re.findall(r"\w+", text)]


# 1. Verify all 10 windows are accounted for
covered_windows = sorted(
    {x["candidate"] for x in review["added"]}
    | {x["candidate"] for x in review["excluded"]}
    | {x["candidate"] for x in review["reviewNeeded"]}
)
assert covered_windows == list(range(1, 11)), f"Missing windows: {covered_windows}"

# 2. Verify all runtime *-aligned.js files and lesson file are untouched
for fname, expected_sha in aligned_shas.items():
    actual_sha = sha256_file(root / fname)
    assert actual_sha == expected_sha, f"Modified aligned file {fname}"
assert sha256_file(root / "delicious-in-dungeon-s01e01-lesson.js") == baseline["lessonJsSha256"], "Lesson file modified"

# 3. Verify each added cue's evidence, timestamps, gaps, and chapter bounds
checks = []
all_cues = sorted(existing_cues + review["added"], key=lambda c: (c["start"], c["end"]))

# Check no overlaps in combined 367 + 8 cues (and strictly positive gap around all added cues)
added_ids = {c["id"] for c in review["added"]}
for i in range(len(all_cues) - 1):
    c1, c2 = all_cues[i], all_cues[i + 1]
    if c1["id"] in added_ids or c2["id"] in added_ids:
        assert c1["end"] < c2["start"], f"Overlap or zero gap around added cue: {c1['id']} ({c1['start']}-{c1['end']}) and {c2['id']} ({c2['start']}-{c2['end']})"
    else:
        assert c1["end"] <= c2["start"], f"Overlap between existing cues: {c1['id']} and {c2['id']}"

existing_ids = {c["id"] for c in existing_cues}
max_source_id = baseline["maxSourceReservationId"]

for entry in review["added"]:
    cid = entry["id"]
    assert cid > max_source_id and cid not in existing_ids, f"Invalid new ID {cid}"

    for label in ["smallEvidence", "mediumEvidence", "timingEvidence"]:
        ev = entry[label]
        ev_file = (root / ev["file"]).resolve()
        assert ev_file.is_relative_to(root), f"Outside root: {ev_file}"
        payload = json.loads(ev_file.read_text(encoding="utf-8"))
        raw_words = [
            w
            for win in payload["windows"]
            if win["candidate"] == ev["candidate"] and ("label" not in ev or win.get("label") == ev["label"])
            for seg in win["segments"]
            for w in seg["words"]
        ]
        for w in ev["words"]:
            assert any(
                all(w[k] == raw[k] for k in ["word", "start", "end", "probability"])
                for raw in raw_words
            ), f"Word not verbatim in raw: {cid} {label} {w}"
        assert normalize_tokens(" ".join(w["word"] for w in ev["words"])) == normalize_tokens(entry["text"]), (
            cid,
            label,
            normalize_tokens(" ".join(w["word"] for w in ev["words"])),
            normalize_tokens(entry["text"]),
        )

    t_words = entry["timingEvidence"]["words"]
    assert entry["rawStart"] == t_words[0]["start"], f"{cid} rawStart mismatch"
    assert entry["rawEnd"] == t_words[-1]["end"], f"{cid} rawEnd mismatch"
    assert entry["start"] <= entry["rawStart"] and entry["end"] >= entry["rawEnd"], f"{cid} cuts timing words"

    # Find chapter containing [start, end]
    matching_chapters = [
        idx + 1
        for idx, ch in enumerate(chapters)
        if entry["start"] >= ch["start"] and entry["end"] <= ch["end"]
    ]
    assert len(matching_chapters) == 1, f"{cid} ({entry['start']}-{entry['end']}) crosses chapter boundary: {matching_chapters}"

    # Find adjacent existing cues
    prev_existing = [c for c in existing_cues if c["end"] <= entry["start"]]
    next_existing = [c for c in existing_cues if c["start"] >= entry["end"]]
    prev_cue = prev_existing[-1] if prev_existing else None
    next_cue = next_existing[0] if next_existing else None

    checks.append({
        "id": cid,
        "candidate": entry["candidate"],
        "text": entry["text"],
        "rawStart": entry["rawStart"],
        "rawEnd": entry["rawEnd"],
        "chapter": matching_chapters[0],
        "gapAfterPrevExistingCue": round(entry["start"] - prev_cue["end"], 3) if prev_cue else None,
        "gapBeforeNextExistingCue": round(next_cue["start"] - entry["end"], 3) if next_cue else None,
        "rawWordsVerbatimMatch": True,
        "bothModelsSupportNormalizedText": True,
        "chosenTimingWordsNotCut": True,
        "fitsStrictlyInCueAndChapterGap": True,
    })

report = {
    "checkedAddedCues": len(checks),
    "allTenWindowsAccountedFor": True,
    "runtimeFilesUntouched": True,
    "normalization": "Case, punctuation, and canonical character names (Falin <- Falli/Vali/Fallen/Fali, Marcille <- Masse/Marcel); zero content-word or grammatical repair",
    "checks": checks,
}
(qa_dir / "proposal-evidence-verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"checkedAddedCues": len(checks), "pass": True}, indent=2))
