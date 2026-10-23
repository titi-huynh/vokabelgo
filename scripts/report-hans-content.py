"""Write inspectable language-review evidence, separate from browser tests."""
import csv
import difflib
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/hans"
captions = json.loads((folder / "caption-cues.json").read_text(encoding="utf-8"))
units = json.loads((root / "hans-aligned.json").read_text(encoding="utf-8"))
before = json.loads((folder / "before-content-review.json").read_text(encoding="utf-8"))
groups = json.loads((folder / "practice-groups.json").read_text(encoding="utf-8"))
youtube_review = json.loads((folder / "youtube-full-comparison.json").read_text(encoding="utf-8"))
assert youtube_review["status"] == "complete" and youtube_review["captionsReviewed"] == len(captions)
assert not youtube_review["captionIdsMissingFromComparison"]

def tokens(text):
    return re.findall(r"\w+", text.lower().replace("ß", "ss"))

expanded = [id for c in units for id in c.get("legacyIds", [c["id"]])]
assert expanded == [c["id"] for c in captions], "Every subtitle must appear exactly once in practice"
by_id = {c["id"]: c for c in captions}
for unit in units:
    parts = [by_id[id] for id in unit.get("legacyIds", [unit["id"]])]
    assert tokens(unit["text"]) == tokens(" ".join(p["text"] for p in parts)), unit["id"]
    assert unit["start"] == parts[0]["start"] and unit["end"] == parts[-1]["end"]
for data in [captions, units]:
    for i, c in enumerate(data):
        assert c["text"].strip() and c["vi"].strip()
        assert c["start"] < c["end"] <= 539.4
        assert not i or c["start"] >= data[i-1]["end"]

# These are semantic roles in the edited story, not automatic speaker recognition.
roles = {}
for role, ids in {
    "giới thiệu": range(400101, 400107),
    "Hans": [400108,400109,400110,400118,400119,400123,400124,400129,400139,400140,
             400141,400142,400143,400144,400150,400161,400162,400163,400176,400177,
             400182,400183,400184,400185,400192,400199,400200,400201,400203,400205,
             400223,400224,400236],
    "ông chủ": [400112,400113],
    "người cưỡi ngựa": [400121,400126,400127,400131],
    "người bán thịt": [400165],
    "chàng trai": [400171,400172,400173,400174,400179],
    "người thợ mài": [400188,400189,400194,400195,400196,400197,400202,400204,
                     400207,400208,400209,400210,400211,400212,400213,400214,
                     400218,400219,400220]
}.items():
    roles.update({id: role for id in ids})
review_notes = {
    400110: "Gebt retained from full-context small/medium recognition and corroborated by the uploader's written YouTube description; an earlier short crop incorrectly suggested Gib.",
    400155: "All three recognizers and the source video's YouTube transcript at 03:54 favor aus. Editorial decision complete: retain source-correlated aus rather than silently substituting idiomatic auf. Unusual wording remains documented; exact audio is not human-certified.",
    400168: "Vietnamese polished after the complete source comparison; preserves the boy joining Hans with a white goose under his arm.",
    400173: "Vietnamese clarified the alleged stolen pig, preserving the boy's claim rather than stating it as fact.",
    400187: "Schleifrad confirmed in targeted base, small and medium rechecks; first full pass wrongly yielded Schleifer.",
    400189: "Vietnamese keeps both the literal cloak image and the wind-direction idiom.",
    400199: "habe restored from targeted small/base/medium; no speculative change to the neuter possessive mein.",
    400200: "Retained as Hans's retelling, not speculative extra question/answer turns.",
    400201: "Retained as Hans's retelling, not speculative extra question/answer turns.",
    400207: "Removed unsupported Aber; both independent windows and targeted medium start at Du."
}
unit_by_caption = {id: c["id"] for c in units for id in c.get("legacyIds", [c["id"]])}
with (folder / "content-review.tsv").open("w", encoding="utf-8-sig", newline="") as stream:
    writer = csv.writer(stream, delimiter="\t")
    writer.writerow(["caption_id", "start", "end", "semantic_speaker", "german", "vietnamese", "practice_unit", "review_note"])
    for c in captions:
        writer.writerow([c["id"], c["start"], c["end"], roles.get(c["id"], "người kể chuyện"),
                         c["text"], c["vi"], unit_by_caption[c["id"]], review_notes.get(c["id"], "")])

previous = {c["id"]: c for c in before}
changes = [{"id": c["id"], "beforeGerman": previous[c["id"]]["text"], "afterGerman": c["text"],
            "beforeVietnamese": previous[c["id"]]["vi"], "afterVietnamese": c["vi"]}
           for c in captions if c["id"] in previous and
           (c["text"] != previous[c["id"]]["text"] or c["vi"] != previous[c["id"]]["vi"])]
report = {
    "date": "2026-10-23", "timezone": "Asia/Saigon",
    "captions": len(captions), "practiceUnits": len(units), "groupedSentences": len(groups),
    "allCaptionIdsRetainedExactlyOnce": True, "groupingAddsOrRemovesSpokenWords": False,
    "partCounts": [sum(a <= c["start"] and c["end"] <= b for c in units)
                   for a,b in [(0,154.8),(154.8,274.6),(274.6,418.6),(418.6,539.4)]],
    "languageChanges": changes,
    "evidence": {"independentBaseWindows": 29, "independentSmallWindows": 29,
                 "targetedMediumClips": 5, "sourceVideoModified": False,
                 "sourceSubtitleAvailable": True,
                 "sourceSubtitleKind": "YouTube transcript containing recognition errors; not a verified manually edited full script",
                 "youtubeCrossCheck": {
                     "url": "https://www.youtube.com/watch?v=eyohPTKZBA8",
                     "pageEvidence": "youtube-transcript-page.txt",
                     "structuredEvidence": "youtube-transcript-check.json",
                     "screenshot": "review-assets/kino-hans-youtube-transcript.png",
                     "prepositionAt03m54s": "aus",
                     "uploaderDescriptionConfirmsGebt": True,
                     "runtimeTextChanged": True,
                     "fullComparison": "youtube-full-comparison.json",
                     "sourceSegmentsReviewed": youtube_review["sourceSegmentsReviewed"],
                     "captionsReviewed": youtube_review["captionsReviewed"],
                     "thisPassChanges": youtube_review["thisPassChanges"]}},
    "reviewLevel": "AI language editing and local multi-pass acoustic cross-check; not human-certified",
    "editorialStatus": "complete; ready for local lesson use",
    "requiresHumanAudioConfirmation": [],
    "residualSourceUncertainties": youtube_review["residualSourceUncertainties"],
    "limits": ["Agreement among recognizers is evidence, not proof of exact speech.",
               "Grouping preserves the current edited transcript; it does not independently prove that no speech was missed.",
               "Source promotional outro after the story remains outside the four lessons."]
}
(folder / "content-review-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"captions":len(captions),"practiceUnits":len(units),"groups":len(groups),
                  "changedLines":len(changes),"allCaptionIdsRetained":True,
                  "youtubeSegmentsReviewed":youtube_review["sourceSegmentsReviewed"],
                  "editorialStatus":report["editorialStatus"],
                  "needsHumanConfirmation":[]}, ensure_ascii=False))
