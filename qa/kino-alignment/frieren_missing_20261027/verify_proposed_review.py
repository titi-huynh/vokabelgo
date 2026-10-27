"""Verify proposed-review.json and raw ASR outputs against all task constraints."""
import json
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[3]
qa = Path(__file__).resolve().parent
base_rev = "d1204a4b47d41096f4e5b5d71e667be0de338413"

proposed = json.loads((qa / "proposed-review.json").read_text(encoding="utf-8"))
baseline = json.loads((qa / "baseline-cues-235.json").read_text(encoding="utf-8"))
source_raw = subprocess.check_output(
    ["git", "show", f"{base_rev}:qa/kino-alignment/season1-episode2/frieren_s01e02.json"],
    cwd=root,
).decode("utf-8")
source = json.loads(source_raw)
tight_spec = json.loads((qa / "extra_tight_spec.json").read_text(encoding="utf-8"))
context_spec = json.loads((qa / "extra_context_spec.json").read_text(encoding="utf-8"))
muse_cand = json.loads((qa / "muse-candidates.json").read_text(encoding="utf-8"))


def tokens(text: str) -> list[str]:
    return re.findall(r"\w+", text.lower().replace("’", "'"))


# 1. Verify all 6 independent ASR files are complete and match specs
expected_runs = {
    "independent-small.json": (12, [[round(float(c["window"][0]), 2), round(float(c["window"][1]), 2)] for c in muse_cand["candidates"]]),
    "independent-medium.json": (12, [[round(float(c["window"][0]), 2), round(float(c["window"][1]), 2)] for c in muse_cand["candidates"]]),
    "independent-small-tight.json": (27, [[round(float(w["start"]), 2), round(float(w["end"]), 2)] for w in tight_spec]),
    "independent-medium-tight.json": (27, [[round(float(w["start"]), 2), round(float(w["end"]), 2)] for w in tight_spec]),
    "independent-small-context.json": (10, [[round(float(w["start"]), 2), round(float(w["end"]), 2)] for w in context_spec]),
    "independent-medium-context.json": (10, [[round(float(w["start"]), 2), round(float(w["end"]), 2)] for w in context_spec]),
}

total_windows = 0
for fname, (exp_count, exp_crops) in expected_runs.items():
    data = json.loads((qa / fname).read_text(encoding="utf-8"))
    assert data["completed"] == exp_count, (fname, data.get("completed"), exp_count)
    assert data["total"] == exp_count, (fname, data.get("total"), exp_count)
    assert len(data["windows"]) == exp_count, (fname, len(data["windows"]), exp_count)
    actual_crops = [[round(float(w["crop"][0]), 2), round(float(w["crop"][1]), 2)] for w in data["windows"]]
    assert actual_crops == exp_crops, (fname, "crops mismatch")
    assert data["asrOptions"]["initial_prompt"] is None and data["asrOptions"]["hotwords"] is None, (fname, "prompt/hotwords must be None")
    assert data["humanListened"] is False, (fname, "humanListened must be False")
    total_windows += len(data["windows"])

assert total_windows == 98, f"Expected 98 total ASR window recognitions, got {total_windows}"
assert proposed["counts"]["asrWindowRecognitionsTotal"] == 98

# 2. Verify baseline and ID numbering
assert len(baseline["captions"]) == 235
assert len(baseline["units"]) == 235
published_ids = {c["id"] for c in baseline["captions"]}
source_ids = {c["id"] for c in source["cues"]}
assert max(published_ids) == 1300243
assert max(source_ids) == 1300247

added = proposed["added"]
expected_new_ids = list(range(1300248, 1300248 + len(added)))
assert [c["id"] for c in added] == expected_new_ids, "Added IDs must be sequential starting at 1300248"

# 3. Verify each added cue's literal word evidence and timing
checks = []
for entry in added:
    assert entry["parentId"] == entry["id"], (entry["id"], "parentId != id")
    assert entry["id"] not in source_ids, (entry["id"], "reused existing source ID")
    assert entry["sourceEvidence"] == "qa/kino-alignment/season1-episode2/frieren_s01e02.json"
    assert 0 <= entry["start"] < entry["end"] <= 1560.102313, (entry["id"], "invalid bounds")

    for label in ["smallEvidence", "mediumEvidence", "timingEvidence"]:
        evidence = entry[label]
        file_path = (root / evidence["file"]).resolve()
        assert file_path.is_relative_to(root), (entry["id"], label, "outside repo")
        assert file_path.exists(), (entry["id"], label, "missing file")
        payload = json.loads(file_path.read_text(encoding="utf-8"))
        raw_words = [
            w
            for win in payload["windows"]
            if win["candidate"] == evidence["candidate"]
            for seg in win["segments"]
            for w in seg["words"]
        ]
        assert len(evidence["words"]) > 0, (entry["id"], label, "empty words")
        for w in evidence["words"]:
            assert any(
                all(w[k] == raw[k] for k in ["word", "start", "end", "probability"])
                for raw in raw_words
            ), (entry["id"], label, "word not found in raw JSON", w)
        assert tokens(" ".join(w["word"] for w in evidence["words"])) == tokens(entry["text"]), (
            entry["id"],
            label,
            "token mismatch",
            tokens(" ".join(w["word"] for w in evidence["words"])),
            tokens(entry["text"]),
        )

    timing = entry["timingEvidence"]["words"]
    assert entry["start"] <= timing[0]["start"] and entry["end"] >= timing[-1]["end"], (
        entry["id"],
        "cut timingEvidence words",
        entry["start"],
        timing[0]["start"],
        entry["end"],
        timing[-1]["end"],
    )
    checks.append({
        "id": entry["id"],
        "candidate": entry["candidate"],
        "rawWordsMatch": True,
        "bothModelsSupportNormalizedText": True,
        "chosenTimingWordsNotCut": True,
    })

# 4. Verify zero overlap with 235 published baseline cues and single-chapter containment
combined = sorted(
    [{"id": c["id"], "start": c["start"], "end": c["end"], "isNew": False} for c in baseline["captions"]]
    + [{"id": c["id"], "start": c["start"], "end": c["end"], "isNew": True} for c in added],
    key=lambda x: x["start"],
)
for i in range(1, len(combined)):
    prev_cue = combined[i - 1]
    curr_cue = combined[i]
    assert curr_cue["start"] >= prev_cue["end"], (
        "Overlap detected",
        prev_cue,
        curr_cue,
    )

chapters = baseline["lesson"]["chapterData"]["chapters"]
for entry in added:
    matching_chapters = [
        idx + 1
        for idx, ch in enumerate(chapters)
        if entry["start"] >= ch["start"] and entry["end"] <= ch["end"]
    ]
    assert len(matching_chapters) == 1, (
        entry["id"],
        "Cue must belong to exactly one chapter",
        entry["start"],
        entry["end"],
        matching_chapters,
    )

# 5. Verify all 12 candidate windows (1..12) are covered
covered_candidates = (
    {c["candidate"] for c in added}
    | {c["candidate"] for c in proposed["excluded"]}
    | {c["candidate"] for c in proposed["reviewNeeded"]}
)
assert covered_candidates == set(range(1, 13)), f"Missing candidates: {set(range(1, 13)) - covered_candidates}"

summary = {
    "pass": True,
    "asrFilesVerified": len(expected_runs),
    "totalUniqueWindowRecognitions": total_windows,
    "baselineCues": 235,
    "proposedAddedCues": len(added),
    "proposedTotalCues": len(combined),
    "newIdRange": [expected_new_ids[0], expected_new_ids[-1]],
    "candidatesCovered": sorted(covered_candidates),
    "allCuesInsideSingleChapter": True,
    "zeroOverlapWithBaseline": True,
    "literalWordEvidenceVerified": len(checks),
}
print(json.dumps(summary, indent=2))
