"""Export the complete editorial comparison with the captured YouTube transcript.

Explicit cue mappings are editorial, not an accuracy score. YouTube recognition
errors are retained as evidence and are never copied directly into runtime data.
"""
import csv
import difflib
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/hans"
source = json.loads((folder / "youtube-transcript-check.json").read_text(encoding="utf-8"))
rechecks = json.loads((folder / "youtube-difference-medium-rechecks.json").read_text(encoding="utf-8"))
assert {c["start"] for c in rechecks} == {140,364,457,340,528}, "Finish all targeted acoustic checks before publishing the comparison"
captions = json.loads((folder / "caption-cues.json").read_text(encoding="utf-8"))
by_id = {c["id"]: c for c in captions}

# Boundaries differ between YouTube chunks and lesson sentences. A cue can span
# two adjacent source chunks; its exact exercise ID remains unchanged.
mapping = {
    11:(101,102),18:(102,103),25:(104,106),33:(106,106),38:(107,108),
    46:(109,112),55:(112,114),61:(114,115),70:(115,116),79:(116,118),
    86:(118,119),94:(119,122),102:(123,124),109:(124,127),116:(127,130),
    124:(130,131),131:(131,132),138:(132,134),146:(134,135),154:(136,137),
    161:(137,139),168:(140,142),177:(142,143),183:(144,146),193:(146,148),
    201:(148,150),208:(150,151),216:(151,153),225:(153,155),234:(155,156),
    242:(157,158),249:(159,162),258:(162,165),266:(165,166),272:(166,168),
    279:(168,169),287:(169,170),295:(170,172),303:(172,173),311:(173,176),
    319:(177,179),328:(179,181),336:(181,183),345:(183,185),355:(186,187),
    364:(187,189),372:(189,191),379:(192,194),387:(195,196),393:(197,199),
    399:(199,202),408:(202,205),416:(205,207),423:(208,210),432:(210,212),
    439:(213,215),448:(216,217),457:(218,221),468:(221,223),474:(223,225),
    481:(226,227),489:(227,228),497:(228,230),504:(230,232),511:(232,233),
    517:(234,236),525:(236,237),533:(237,238),
}
notes = {
    11:"YouTube mistakes prächtiges for richtiges and da reitet for bereitet. Uploader description supports the edited introduction.",
    18:"YouTube kugel rom is a recognition error for Kuh herum; uploader description supports the edited sentence.",
    25:"YouTube ganz unten an is Gans unterm Arm; uploader description also retains Nanu. Keep Lass uns as in uploader text/local recognition.",
    33:"Continuation of Lass uns doch mal sehen; no extra sentence is missing.",
    38:"Narrator and Hans's Meine Zeit ist um both retained.",
    46:"Uploader written description corroborates Gebt. YouTube nur als is Du hast, supported by uploader text.",
    55:"Reward and narration und gab retained together in complete practice unit 500111.",
    61:"YouTube sogar is zog; uploader description supports Hans zog ein Tuch. Keep relative das, not the uploader's spelling error dass.",
    70:"Sentence continuation and next narrator sentence both included.",
    79:"YouTube seinen/hätte and separated vorbei trat are recognition errors; uploader text supports sah er einen Reiter / Hans sagte / vorbeitrabte.",
    86:"Horse-riding comparison, stones and shoes all included; punctuation follows complete sentences.",
    94:"Final kommt schnell voran, rider question and narrator turn all included.",
    102:"YouTube dass sich is dass ich; uploader description supports the edited answer.",
    109:"Trade proposal begins here and continues in next chunk; no words omitted at exercise boundaries.",
    116:"Trade proposal, Hans's answer and beginning of narration all retained.",
    124:"YouTube halb is half; reins and riding instruction retained.",
    131:"YouTube uns abrufen is und Hopp, hopp rufen; local base/small recognition supports edited instruction. Als er retained.",
    138:"YouTube uns oder hinriss / schnellste are recognition errors for und so dahinritt / schnalzte; local overlapping checks support edited narration.",
    146:"YouTube rannte differs from trabte ... los. Independent base and small support trabte ... los; targeted medium has trat ... los. Retain existing wording, supported by stronger combined local evidence.",
    154:"YouTube ist / crew are es / Kuh; full farmer relative clause retained in practice unit 500136.",
    161:"YouTube an stand is Hans stand; farmer narration and Hans's complaint retained.",
    168:"YouTube coolster is Kuh ist da; Hans's complete complaint and cow comparison retained.",
    177:"Cow comparison and daily milk, butter and cheese all included.",
    183:"YouTube schluckte / ko / richtig are schlug / Kuh / willigte. Keep the wish and farmer's proposal, matching local recognition.",
    193:"YouTube wurde ist is wurde es; Hans's assent and satisfied walk retained.",
    201:"Heat, thirst and beginning of Hans's thought all retained.",
    208:"YouTube der band / kuren / seinen are Er band / Kuh an / seine. Keep the tree, leather cap and milking action.",
    216:"YouTube melden is melken; no milk and causal continuation retained.",
    225:"YouTube trat willi kuhn / runs are trat ihn die Kuh / Hans. Keep complete causal practice unit 500153.",
    234:"YouTube and base/small/medium support aus seinem Schubkarren. Retain aus without silently correcting the source to idiomatic auf; document the unusual source wording. Standing-up narration also retained.",
    242:"Hans's misfortune and butcher's indirect-speech explanation retained in practice unit 500157.",
    249:"YouTube taube is tauge. Keep the indirect-speech forms sei/gebe/tauge and all of Hans's meat preference.",
    258:"Preference, sausages and butcher's proposal all retained.",
    266:"YouTube man is nahm. Keep actual trade, not an additional invented character response.",
    272:"End of pig trade, satisfied walk and next narration retained.",
    279:"YouTube kann es / abend are Gans / Arm. Keep the boy with the white goose and Hans's account.",
    287:"Successful trades and boy's reaction retained.",
    295:"YouTube einem / sich are deinem / ich; preserve the boy's warning and beginning of village report.",
    303:"Village report and allegation both retained. Vietnamese states this as the boy's claim, not a narrator-established theft.",
    311:"Warning, fear and request for help all included.",
    319:"YouTube ganz is Gans; Hans's offer and boy's answer both retained.",
    328:"YouTube triebe is trieb es. Keep side-path action and Hans's relief.",
    336:"Hans's thought about a good trade and roast retained; no extra invented narrator line.",
    345:"YouTube das ganze Feld is Das Gänsefett. Local checks support goose fat, three months and feathers for a pillow.",
    355:"YouTube schleif rad is Schleifrad, corroborating the prior correction. Keep narrator and song introduction.",
    364:"YouTube die schleife / ein are Ich schleife / mein. Independent local base/small and targeted medium support the edited song.",
    372:"YouTube blick / seien are blieb / sah ihm. Keep the song ending and Hans watching.",
    379:"YouTube hier geht's is Dir geht's, supported by local recognition. Keep Hans's inference about the craftsman's livelihood.",
    387:"Craft value and having money in one's pocket both retained.",
    393:"YouTube ganz is Gans. It corroborates habe; keep narrator turn and Hans's reply.",
    399:"YouTube unter / q7 are Und das / Kuh gegen. Keep Hans listing the pig and cow trades; do not invent two extra question/answer turns.",
    408:"YouTube ein Pferd / einen Goldklumpen are dein Pferd / meinen Goldklumpen. Keep the craftsman's question, Hans's answer and gold question as separate speaker turns.",
    416:"YouTube ab is Arbeit. It corroborates Du wusstest without an extra Aber.",
    423:"YouTube dein Schleifer is ein Schleifer. Keep the career advice and beginning of whetstone instruction.",
    432:"YouTube wettstein is Wetzstein. Keep instruction, von selbst and Hier hast du einen.",
    439:"YouTube ganz is Gans. Keep zwar/aber together in practice unit 500213 and Hans's reaction.",
    448:"YouTube ganz / wettstein / schleife are Gans / Wetzstein / Schleifer. Keep second stone distinct from whetstone.",
    457:"YouTube alte lege / tu ihn are alte Nägel / Heb ihn. Independent base/small and targeted medium support the edited imperative; local timing override keeps this short cue complete.",
    468:"Hans's walk and wish retained.",
    474:"Wish fulfilled, Glückskind and tiredness retained.",
    481:"Food running out and repeated rests retained; next sentence begins in following chunk.",
    489:"Well, drinking and placing stones on rim all included.",
    497:"YouTube schließt is stieß. Keep accidental contact and consequence in practice unit 500229.",
    504:"YouTube vielen / spranger are fielen / sprang er; keep falling stones and beginning of gratitude narration.",
    511:"YouTube vorfreude is vor Freude. Complete sequence retained in practice unit 500231.",
    517:"YouTube fried is befreit. Keep thanking God, release from stones and beginning of final exclamation.",
    525:"Final exclamation and light-hearted return retained.",
    533:"YouTube liefer / bisher are lief er / bis er. The story ends with his mother; Nun kennst starts promotional outro, intentionally outside the four lessons.",
}
music = {0,34,353,565}
outro = {542,548,556}
assert set(mapping) == set(notes)
assert set(mapping)|music|outro == {s["start"] for s in source["segments"]}
rows=[]
for index, segment in enumerate(source["segments"]):
    start=segment["start"]
    ids=[400000+n for n in range(mapping[start][0],mapping[start][1]+1)] if start in mapping else []
    rows.append({"youtubeStart":start,"youtubeEnd":source["segments"][index+1]["start"] if index+1<len(source["segments"]) else 570.862585,
        "youtubeText":segment["text"],"classification":"story_and_outro" if start==533 else "story" if ids else "music" if start in music else "promotional_outro",
        "captionIds":ids,"editedGerman":" ".join(by_id[id]["text"] for id in ids),
        "editedVietnamese":" ".join(by_id[id]["vi"] for id in ids),
        "decision":notes.get(start,"Music marker: no spoken exercise." if start in music else "Promotional outro reviewed; remains in full video, outside story exercises."),
        "reviewLevel":"AI editorial comparison with source transcript and local recognition; not human-certified"})
covered={id for row in rows for id in row["captionIds"]}
assert covered == set(by_id), "Every caption must have an explicit source comparison"
result={"date":"2026-10-23","sourceUrl":source["url"],"status":"complete",
        "sourceSegmentsReviewed":len(rows),"storySegments":len(mapping),"musicSegments":len(music),
        "outroOnlySegments":len(outro),"captionsReviewed":len(covered),
        "captionIdsMissingFromComparison":sorted(set(by_id)-covered),
        "thisPassChanges":{"germanWording":[],"vietnameseCaptionIds":[400168],"vocabularyIds":["vk_hans_lieber"],"captionOrPracticeIdsChanged":False},
        "sourceFiles":["youtube-transcript-page.txt","youtube-transcript-check.json","independent-base-windows.json","independent-small-windows.json","youtube-difference-medium-rechecks.json"],
        "residualSourceUncertainties":[{"captionId":400155,"retained":"aus","alternative":"auf","decision":"Keep source-correlated wording; editorial decision complete, exact preposition not human-certified."}],
        "segments":rows}
(folder/"youtube-full-comparison.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
with (folder/"youtube-full-comparison.tsv").open("w",encoding="utf-8-sig",newline="") as stream:
    writer=csv.writer(stream,delimiter="\t")
    writer.writerow(["youtube_start","youtube_end","classification","caption_ids","youtube_text","edited_german","edited_vietnamese","editorial_decision"])
    for row in rows:
        writer.writerow([row["youtubeStart"],row["youtubeEnd"],row["classification"],",".join(map(str,row["captionIds"])),row["youtubeText"],row["editedGerman"],row["editedVietnamese"],row["decision"]])
print(json.dumps({k:v for k,v in result.items() if k not in ["segments","residualSourceUncertainties","sourceFiles"]}))
