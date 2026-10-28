"""Editorial result for all eight candidate windows; raw recognition stays intact."""
import json,pathlib
qa=pathlib.Path(__file__).resolve().parent
def part(candidate,start,end,reason,**extra):return dict(candidate=candidate,start=start,end=end,reason=reason,**extra)
held=[
 part(2,149.16,156.44,'Foreground call remains crop/timing dependent. Both gap-only crops contain Leute?, but they place it at149.16 vs154.26; wider crops restore the complete already-published500039 family-photo request. Do not duplicate that request or infer a separate repeated call.',variants=['Leute?','Leute, warte nach links.','Leute? Wollt ihr noch leckern?','Leute, wollt ihr noch ein letztes Familienfoto machen?']),
 part(3,216.6,220.07,'No stable lexical agreement: small main empty, medium main stock outro, both wider independent crops only recognize the existing counting/Cheese before this gap. Earshot Music0.52/Speech0.14 and siren-like hint z3.59 support a musical/effect reading but do not prove absence of speech. Retain for human review.',variants=["Das war\'s für heute, bis zum nächsten Mal, tschüss!",'No new words in wider context']),
 part(4,403.48,405.84,'Possible short classroom transition before the musical region is not settled. Anti medium alone suggests Kommt mit nach vorn; Codex retakes disagree or generate subtitle-credit text. Ja repetitions in some context crops partly overlap old500089; do not carve out a new Ja by truncating timing words.',variants=['Kommt mit nach vorn.','Ja, ja, ja.',"Ja, das war's",'Dann kommen wir in den Empfang.','Copyright WDR 2021','Untertitel im Auftrag des ZDF für funk, 2018']),
 part(5,485.24,489.92,'Between original500109 and500110: competing Oh/Jo/de/damn repetitions and isolated Oh, der ist hier; no exact small/medium agreement on a new spoken sentence. Earshot Music0.42/Speech0.31 is mixed and cannot settle wording.',variants=['Jo, de de de.','Oh, der ist hier.','Oh, damn, damn, damn.','Repeated Oh with unstable length']),
 part(7,866.4,868.6,'Very short gap: main small Das war ein vsmedium Das wars; gap-only medium Wow; wider Codex small Tschüss vsmedium Lass uns rein; both wider Anti models omit an intervening utterance. Earshot Speech0.56/Music0.36 does not identify words. Do not pick a plausible sentence from context.',variants=['Das war ein...',"Das war's.",'Wow!','Tschüss.','Lass uns rein.'])
]
excluded=[
 part(1,15.61,38.64,'Rap/song region under the episode package song policy; both independent models transcribe lyrical material, Earshot Music0.79. No lyrics added as study dialogue.',category='song'),
 part(1,38.64,40.6,'Existing500002; retain its official wording and published timing despite ASR KWB/KBB name variants.',category='already-covered',existingCueId=500002),
 part(1,40.72,42.19,'Head of original500003; no duplicate short version of the message.',category='already-covered',existingCueId=500003),
 part(2,142.68,146.84,'English background-song fragment in tight small/medium, plus earlier ASR estimates of the Oh Digga material already present in500038. Preserve500038 timing146.84–149.16; do not retime it or count an ASR timing offset as a new utterance.',category='song-and-existing-timing-offset',existingCueId=500038),
 part(2,146.84,149.16,'Original500038 already includes Oh Digga/Whoo/geil/Okay.',category='already-covered',existingCueId=500038),
 part(2,156.44,157.51,'Head of original500039 family-photo request.',category='already-covered',existingCueId=500039),
 part(4,405.84,421.55,'Music/lyric region under song policy: independent medium yields English lyrics; main small instead generates a credit string and main medium is empty. Earshot Music0.54/Speech0.34. SWR/WDR credit text is not verified foreground dialogue.',category='music-and-unverified-asr-artifact'),
 part(5,482.58,483.8,'Tail of original500108, including What?; keep all its words unchanged.',category='already-covered',existingCueId=500108),
 part(5,483.92,485.24,'Original500109 Safe haben die Style.; do not replace with Seyfani/Family/Army ASR variants or add a second cue.',category='already-covered',existingCueId=500109),
 part(5,489.92,490.67,'Head of original500110 Komm doch auch mal mit.; no shorter duplicate.',category='already-covered',existingCueId=500110),
 part(6,764.37,769.07,'No corroborated new dialogue: tight outputs disagree between Copyright WDR2020/2021, independent small loops a stock sentence then credits, independent medium empty. Earshot Music0.49/Speech0.31. Exclude generated credit/loop text; do not assert these strings were spoken.',category='music-and-unverified-asr-artifact'),
 part(7,865.4,866.4,'Tail of original500187; no replacement from approximate context-ASR wording.',category='already-covered',existingCueId=500187),
 part(7,868.6,869.07,'Head of original500188; preserve Müssen wir schon los? - Ja. exactly.',category='already-covered',existingCueId=500188),
 part(8,1132.53,1132.96,'Tail of original500259 Buh!; no duplicate.',category='already-covered',existingCueId=500259),
 part(8,1132.96,1135.08,'Nonlexical cheering/cry under package policy. Small main and both wider contexts yield no stable new lexical sentence; medium main generates an extended O loop. Earshot Music0.52/Speech0.42, no stable word identification.',category='vocalization'),
 part(8,1135.08,1136.33,'Head of original500260 Buuuh!; preserve existing exclamation.',category='already-covered',existingCueId=500260)
]
out=dict(key='druck_s07e01',baseRevision='215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d',candidateWindows=8,humanListened=False,
 method='Original unchanged video; independent local small/medium in numeric crops only. Anti blind wider-context recognition completed before comparison. Earshot local broad classifications and source frames supplement, not verify German words. No text prompts/hotwords.',
 added=[],excluded=excluded,reviewNeeded=held,
 counts=dict(candidateWindows=8,originalUtterances=268,added=0,finalUtterances=268,captionCues=268,practiceCues=268,chapters=7,picks=45,excludedParts=len(excluded),reviewNeededParts=len(held)),
 countingNote='Parts are not windows. Each of the8 windows can contain preserved coverage, excluded material and/or held parts. Zero additions is an intentional verified outcome, not an incomplete integration.',
 idPolicy=dict(maxPublishedId=500268,nextUnusedId=500269,maxParentId=268,nextUnusedParentId=269,newIdsAssigned=[],newParentIdsAssigned=[],oldParentIdsPreserved=True),
 normalizationNote='No published cue words, translations, timings, IDs, parentIds or schema fields changed. No new speaker field.',
 sourceNote='Existing source-file comment attributes German text to ARD EBU-TT; all existing268 objects frozen, no claim of new human listening approval.',
 scopeNote='Only review evidence and exact-branch automatic-deployment block; no merge/deploy, no other film or shared chapter/practice changes.')
(qa/'review.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(out['counts']))
