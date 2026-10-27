"""Final editorial exclusion, reproducible runtime build, and narrow registry update."""
import json
import pathlib
import re
import runpy
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[3]
folder = pathlib.Path(__file__).resolve().parent

def read(name):
    return json.loads((folder / name).read_text(encoding="utf-8-sig"))

def save(name, value):
    (folder / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

reviewed = read("reviewed-lesson.json")
cue_id = 3100067
reason = ("All three ASR models disagree on a low-confidence word between 'ihr' and 'hier' "
          "(zwar/zwei). Omitting that word for grammatical convenience does not establish "
          "the exact spoken answer. Exclude the cue, its focus pick and its vocabulary card.")
cue = next((c for c in reviewed["cues"] if c["id"] == cue_id), None)
if cue:
    original = dict(cue, reviewNeeded=True)
    reviewed["removedReviewNeeded"].append({"cue": original, "action": "excluded_from_runtime_all_picks_cards", "reason": reason})
    reviewed["cues"] = [c for c in reviewed["cues"] if c["id"] != cue_id]
    for chapter in reviewed["chapters"]:
        chapter["picks"] = [p for p in chapter["picks"] if p["id"] != cue_id]
    reviewed["flashcards"] = [c for c in reviewed["flashcards"] if c["cueId"] != cue_id]
    reviewed["coverage"] = "179 câu thoại chọn lọc; loại nhạc, câu chưa chắc và các khoảng không có lời rõ. Không phải bản chép đầy đủ từng chữ."
    reviewed["reviewNotes"] += " Codex final review: excluded 3100067 rather than treating a grammatically cleaned ASR guess as a graded answer; final 179 cues, 40 focus picks, 21 cards."
    for uncertain in reviewed["uncertain"]:
        if uncertain["start"] < 243.91 and uncertain["end"] > 242.15:
            uncertain["runtimeDecision"] = "Excluded cue 3100067, its pick and its card; unresolved word is not graded."
    save("reviewed-lesson.json", reviewed)
    changelog = read("changelog.json")
    changelog["changes"].append({"type": "codex_final_editorial_exclusion", "cueId": cue_id, "reason": reason})
    changelog["summary"].update(runtimeCueCount=179, removedReviewNeededIds=[3100055, 3100182, cue_id], pickCount=40, flashcardCount=21)
    save("changelog.json", changelog)

generator = folder / "generate_runtime_files.py"
source = generator.read_text(encoding="utf-8")
guard = "CARD_SPECS = [spec for spec in CARD_SPECS if spec[4] in {c['id'] for c in reviewed['cues']}]"
if guard not in source:
    source = source.replace("entries_js_lines = []", guard + "\n\nentries_js_lines = []")
    generator.write_text(source, encoding="utf-8")
runpy.run_path(str(generator))

practice = root / "kino-practice-data.js"
current = practice.read_text(encoding="utf-8")
baseline = subprocess.check_output(["git", "show", "HEAD:kino-practice-data.js"], cwd=root).decode("utf-8")
decoder = json.JSONDecoder()
def literal(text):
    start = text.index("{", text.index("const KINO_PRACTICE_DATA ="))
    data, consumed = decoder.raw_decode(text[start:])
    return data, start, start + consumed

data, start, end = literal(current)
old_data, old_start, old_end = literal(baseline)
entry = [{"part": i + 1, "picks": chapter["picks"]} for i, chapter in enumerate(reviewed["chapters"])]
other = {k: v for k, v in data.items() if k != "erdmaennchen_luftgehen"}
outside_unchanged = (other == old_data and current[:start] == baseline[:old_start] and current[end:] == baseline[old_end:])
if outside_unchanged:
    # Preserve every existing film byte-for-byte, avoiding the previous broad reindent.
    insertion = ',\n  "erdmaennchen_luftgehen": ' + json.dumps(entry, ensure_ascii=False, indent=2) + "\n"
    result = baseline[:old_end - 1].rstrip() + insertion + baseline[old_end - 1:]
else:
    # Preserve concurrent changes: replace only this film's literal value.
    field = current.index('"erdmaennchen_luftgehen":', start, end) + len('"erdmaennchen_luftgehen":')
    value_start = field + len(current[field:]) - len(current[field:].lstrip())
    _, count = decoder.raw_decode(current[value_start:])
    result = current[:value_start] + json.dumps(entry, ensure_ascii=False, indent=2) + current[value_start + count:]
practice.write_text(result, encoding="utf-8")

validator = folder / "validate_integration.js"
source = validator.read_text(encoding="utf-8")
for before, after in [
    ("reviewed.cues.length, 180", "reviewed.cues.length, 179"),
    ("180 runtime cues", "179 runtime cues"),
    ("reviewed.removedReviewNeeded.length, 2", "reviewed.removedReviewNeeded.length, 3"),
    ("record 2 excluded", "record 3 excluded"),
    ("allPicks.length, 41", "allPicks.length, 40"),
    ("Total picks must be 41", "Total picks must be 40"),
    ("reviewed.flashcards.length, 22", "reviewed.flashcards.length, 21"),
    ("Flashcards count must be 22", "Flashcards count must be 21"),
    ("aligned.length, 180", "aligned.length, 179"),
    ("lesson.flashcards.length, 22", "lesson.flashcards.length, 21"),
]:
    source = source.replace(before, after)
if "3100067 must not" not in source:
    source = source.replace("// 6.", "assert(!runtimeIds.has(3100067), '3100067 must not be a guessed runtime answer');\n\n// 6.")
validator.write_text(source, encoding="utf-8")

spec = root / "e2e/kino-erdmaennchen-luftgehen.spec.js"
source = spec.read_text(encoding="utf-8")
source = re.sub(r"\b180\b", "179", source)
source = re.sub(r"\b22\b", "21", source)
source = source.replace("[6, 6, 5, 6, 7, 6, 5]", "[6, 5, 5, 6, 7, 6, 5]")
source = source.replace("audit.totalPicks).toBe(41)", "audit.totalPicks).toBe(40)")
spec.write_text(source, encoding="utf-8")

subprocess.run(["node", "scripts/build-kino-metadata.cjs"], cwd=root, check=True)
status = read("integration-status.json")
status.update(status="awaiting_codex_final_checks", finalEditorialExclusion=cue_id)
status["counts"].update(runtimeCues=179, removedReviewNeeded=3, removedReviewNeededIds=[3100055, 3100182, cue_id], picks=40, picksPerChapter=[6, 5, 5, 6, 7, 6, 5], flashcards=21)
save("integration-status.json", status)
print(json.dumps({"finalCues": len(reviewed["cues"]), "picks": sum(len(c["picks"]) for c in reviewed["chapters"]), "cards": len(reviewed["flashcards"]), "otherFilmPracticeDataPreserved": other == old_data}, ensure_ascii=False))
