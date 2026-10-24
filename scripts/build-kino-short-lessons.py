"""Build selected-dialogue Kino lessons from reviewed content, without editing media.

Usage: python scripts/build-kino-short-lessons.py qa/kino-alignment/KEY/lesson-content.json [...]
Source word timings and editorial decisions stay beside each input as QA evidence.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02}.{ms % 1000:03}"


def build(source):
    spec = json.loads(source.read_text(encoding="utf-8"))
    key, alias, symbol, stem = (spec[k] for k in ("key", "alias", "symbol", "stem"))
    assert re.fullmatch(r"[a-z0-9_]+", key) and re.fullmatch(r"[A-Z0-9_]+", symbol)
    assert re.fullmatch(r"[a-z0-9-]+", stem) and re.fullmatch(r"[a-z0-9-]+", alias)
    duration = spec["duration"]
    cues, chapters, vocabulary = (spec[k] for k in ("cues", "chapters", "vocabulary"))
    media = ROOT / spec["src"]
    assert media.is_file() and media.stat().st_size > 10000, f"Missing media: {media}"
    with media.open("rb") as f:
        assert not f.read(100).startswith(b"version https://git-lfs"), "LFS pointer is not video"
    assert cues and chapters and vocabulary
    ids = set()
    for i, c in enumerate(cues):
        assert isinstance(c["id"], int) and c["id"] not in ids, c
        ids.add(c["id"])
        assert 0 <= c["start"] < c["end"] <= duration, c
        assert not i or c["start"] >= cues[i - 1]["end"], c
        assert all(c.get(f, "").strip() for f in ("speaker", "text", "vi")), c
        c.setdefault("parentId", c["id"])
    assert chapters[0]["start"] == 0 and chapters[-1]["end"] == duration
    for i, p in enumerate(chapters):
        assert p["start"] < p["end"] and (not i or p["start"] == chapters[i - 1]["end"]), p
        assert 0 < len(p["picks"]) <= 7 and len(set(p["picks"])) == len(p["picks"]), p
        assert all(any(c["id"] == picked and c["start"] >= p["start"] and c["end"] <= p["end"] for c in cues) for picked in p["picks"]), p
    assert all(sum(c["start"] >= p["start"] and c["end"] <= p["end"] for p in chapters) == 1 for c in cues)
    deck = f"🎬 Video: {spec['series']} – {spec['episodeTitle']}"
    cards = []
    for v in vocabulary:
        cue = next(c for c in cues if c["id"] == v["cueId"])
        part = next(i for i, p in enumerate(chapters, 1) if cue["start"] >= p["start"] and cue["end"] <= p["end"])
        cards.append({**v, "id": f"vk_{key}_{v['id']}", "example": cue["text"], "deck": deck,
                      "tags": ["Video", spec["series"]], "videoKey": key,
                      "sourceUrl": f"?kino={alias}&part={part}"})
    assert len(set(v["id"] for v in cards)) == len(cards)
    total_seconds = round(duration)
    video = {"key": key, "series": spec["series"], "seriesIcon": spec["icon"],
             "episodeTitle": spec["episodeTitle"], "icon": spec["icon"],
             "title": f"{spec['icon']} {spec['series']} – {spec['episodeTitle']}",
             "src": spec["src"], "storageKey": f"kino_calibrated_{key}_v1",
             "syncKey": f"vokabelgo_kino_perfected_{key}_v1", "progressKey": f"vokabelgo_kino_progress_{key}",
             "fullDurationStr": f"{total_seconds // 60:02}:{total_seconds % 60:02}",
             "flashcardDeck": deck, "isExcerpt": True, "sourceUrl": spec["sourceUrl"]}
    chapter_data = {"title": spec["episodeTitle"], "series": spec["series"].upper(),
                    "summary": spec["summary"], "levelLabel": spec["levelLabel"],
                    "defaultMode": "all", "practiceModeVersion": 1, "contentVersion": 1, "isExcerpt": True,
                    "allLabel": "Các câu trong bài", "allDescription": "Lời thoại chọn lọc · Có thể chuyển sang các câu trọng tâm",
                    "storageKey": f"vokabelgo_kino_chapters_v1_{key}", "legacyKey": video["progressKey"],
                    "legacyCount": 0, "chapters": chapters, "vocabularyCount": len(cards)}
    data = {"video": video, "chapterData": chapter_data, "flashcards": cards}
    dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2)
    aligned = ("// Selected German–Vietnamese dialogue from the unchanged publisher clip; uncertain speech and music omitted.\n"
               f"const {symbol}_CAPTION_CUES = {dump(cues)};\n"
               f"const {symbol}_ALIGNED_UTTERANCES = {symbol}_CAPTION_CUES.map(cue => ({{ ...cue }}));\n")
    lesson = ("// Generated from reviewed lesson-content.json by scripts/build-kino-short-lessons.py.\n"
              f"const {symbol}_LESSON = (() => {{\n  const data = {dump(data)};\n"
              f"  data.chapterData.captionCues = {symbol}_CAPTION_CUES;\n  return data;\n}})();\n")
    (ROOT / f"{stem}-aligned.js").write_text(aligned, encoding="utf-8")
    (ROOT / f"{stem}-lesson.js").write_text(lesson, encoding="utf-8")
    for lang, field in (("de", "text"), ("vi", "vi")):
        vtt = "WEBVTT\n\n" + "\n\n".join(f"{c['id']}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c[field]}" for c in cues) + "\n"
        (source.parent / f"{key}.{lang}.vtt").write_text(vtt, encoding="utf-8")
    with media.open("rb") as f:
        digest = hashlib.file_digest(f, "sha256").hexdigest()
    result = {"key": key, "duration": duration, "practiceCues": len(cues), "captionCues": len(cues),
              "chapters": len(chapters), "vocabularyCount": len(cards), "videoSha256": digest,
              "isSelectedDialogue": True, "reviewMethod": spec.get("reviewMethod", "ASR and visual editorial review; no human native-speaker approval")}
    (source.parent / "build-summary.json").write_text(dump(result) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("content", nargs="+", type=Path)
    for content in parser.parse_args().content:
        build(content.resolve())
