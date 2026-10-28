"""Final editorial decisions; retain the independent raw recognition unchanged."""
import json,pathlib,re
qa=pathlib.Path(__file__).resolve().parent
read=lambda f:json.loads((qa/f).read_text(encoding='utf8'))
norm=lambda s:re.sub(r'[^\wäöüß]','',s.lower())

def evidence(file,index,text):
    data=read(file);w=data['windows'][index]
    words=[t for s in w['segments']for t in s['words']]
    wanted=[norm(t)for t in text.split()]
    matches=[words[i:i+len(wanted)]for i in range(len(words)-len(wanted)+1)if [norm(t['word'])for t in words[i:i+len(wanted)]]==wanted]
    assert len(matches)==1,(file,index,text,len(matches))
    selected=matches[0]
    return {'file':file,'model':data['model'],'windowIndex':index,'candidate':w.get('candidate'),'crop':w['crop'],'words':selected,'literalText':''.join(t['word']for t in selected).strip()}

def cue(id,candidate,speaker,text,vi,refs,speaker_evidence):
    support=[evidence(f,i,text)for f,i in refs]
    return dict(id=id,candidate=candidate,speaker=speaker,text=text,vi=vi,
        start=min(t['start']for e in support for t in e['words']),
        end=max(t['end']for e in support for t in e['words']),support=support,
        speakerEvidence=speaker_evidence,decision='add',
        note='Only case/punctuation normalized. Bounds include every selected literal timing word. Machine evidence and source frames; humanListened=false.')

added=[
    cue(1600120,2,'SpongeBob','Du hast nicht die richtige Technik.','Cậu chưa dùng đúng kỹ thuật.',
        [('codex-small-main.json',1),('codex-medium-main.json',1)],
        'Source frames40.4/42: SpongeBob mouth visibly changes during the sentence, Patrick closed at42; see frame-40.4.jpg and frame-42.jpg. Corrects the provisional Anti handoff attribution.'),
    cue(1600121,2,'Thaddäus','Dreimal nach rechts gucken.','Nhìn sang phải ba lần.',
        [('codex-small-recheck.json',4),('codex-medium-recheck.json',4)],
        'Source frames51.4/51.9/52.3: Thaddäus changes mouth shape while looking right; speaker-followup-contact-sheet.jpg. Visual/context attribution, not voice identification. Anti favors Thaddäus but leaves an offscreen-SpongeBob alternative; Muse should specifically check this label.'),
    cue(1600122,2,'Thaddäus',"Und jetzt geht's los, der Beckenstoß.",'Và giờ bắt đầu nào, đẩy hông!',
        [('codex-small-recheck.json',5),('codex-medium-recheck.json',5)],
        'Source frames53.3/54.3/55.2: Thaddäus changes mouth shape before making the hip thrust; speaker-followup-contact-sheet.jpg. Original1600107 is the later separate SpongeBob reminder. Visual/context attribution; Anti favors Thaddäus with an offscreen-SpongeBob alternative, specifically flagged for Muse review.'),
    cue(1600123,2,'Thaddäus','Und dies und dies und dies und das und das und das.','Rồi thế này, thế này, thế này, và thế kia, thế kia, thế kia.',
        [('codex-small-main.json',1),('codex-medium-main.json',1)],
        'Continuous Thaddäus demonstration with changing mouth positions at65.6/66.2/67; speaker-followup-contact-sheet.jpg. One complete twelve-word instruction, not separate one-word chant cues.'),
    cue(1600124,3,'Thaddäus','Danke, danke, danke!','Cảm ơn, cảm ơn, cảm ơn!',
        [('independent-small-full.json',1),('independent-medium-full.json',1)],
        'Thaddäus acknowledging the crowd at his doorway at117.4; frame-117.4.jpg and independent Anti handoff. Both full models have exactly three Danke tokens; tight medium corroborates three, tight small adds a fourth token aligned into the preceding chant.')
]

def part(candidate,start,end,reason,**extra):return dict(candidate=candidate,start=start,end=end,reason=reason,**extra)
review_needed=[
    part(1,13.68,18.08,'Technique/name tail and following instruction vary across full and bounded crops; do not select the phrase from the package or correct names using context.',variants=['Die Technik, Tadeus!','Die Technik hatte ich!','Die Technik hat ihn auch!','Jetzt drehen Sie es durch.','Jetzt rein, siehst du!']),
    part(2,31.4,33.5,'Warning/name ending remains unstable across independent crops. Keep the whole short exchange outside captions.',variants=['Hey, Tadeus, hör aufs Wunsch!','Hör auf, sponge!','Hör auf! Spanns!']),
    part(2,48.17,51.3,'First instruction alternates Erst/Schwer/Schweres and the next verb Sprehen/Prähen/Drehen. Two tight crops agree on Drehen but broader neutral outputs differ; do not resolve solely from the displayed turn. Ends at the first selected word of the separately confirmed Dreimal sentence.',variants=['Erst mache ich das.','Schwer ist, mach ich das.','Schweres mache ich das','Sprehen und stopp.','Prähen und Stopp','Drehen und Stopp.']),
    part(2,61.06,65.19,'Hip instruction and following deictic clause remain crop dependent, despite Hüftschwung agreeing in both main crops. Do not repair using the displayed action.',variants=['Hüftschwung','Hüftzwung','Hüpfgefroh','Hüftgefond','Hüft vor','hier vorn','hiervon','hier fahren']),
    part(2,67.91,69.94,'After the separately confirmed twelve-word dies/das instruction, outputs vary between repeated da, bababam and an unfinished und dann. No further lexical cue selected.',variants=['und da, da, da','und bababam bababam und dann']),
    part(3,112.56,117.02,'Name-and-Gene chant differs across models/crops; do not change Gene to Genie to fit the later joke. Separate confirmed thanks starts at117.02.',variants=['Tobias hat Gene!','Tadeus hat Gene!','Taddeus hat Gene!','Adios, Adkene!']),
    part(4,133,138.5,'Possible Das ruft! now matches both tight models and medium context, but is absent from broader medium/name-chant output and is embedded in strongly repetitive low-confidence audio. Retain for human review rather than treating tight agreement as definitive.',variants=['Das ruft!','Tadeus!'],evidenceNote='Includes completed codex-medium-recheck windows10/11; not a small-only hypothesis. Earshot mixed Music/Speech classifications cannot verify the German phrase.'),
    part(5,174.78,179.99,'Greeting1600119 already exists. Remaining introduction has predominantly Vor but tight small Für and an unresolved final name/call. Keep the whole incomplete introduction for review rather than publishing an isolated fragment or guessing the name.',variants=['Vor euch steht in der Tat...','Für euch steht in der Tat...','Adeo!','Adieu!','Adéus!','Adéu!']),
    part(6,179.99,183.47,'Short call is distinct in time from old1600119, but small/medium and context disagree on the actual words; not a verified new Ein Genie cue.',variants=['Ein Genie!','Angenie!','Anzune!','Ingenie!','...einschen nicht.'])
]
excluded=[
    part(1,13.24,13.68,'Tail of original1600103; preserve without duplication.',existingCueId=1600103),
    part(1,18.08,18.92,'Head of original1600104; preserve without duplication.',existingCueId=1600104),
    part(2,28.96,31.4,'Original1600106 inside the package window; package covered=0 is incorrect.',existingCueId=1600106),
    part(2,58.04,60,'Original1600107 inside the package window; no new copy.',existingCueId=1600107),
    part(2,60,61.06,'Original1600108 inside the package window; no new copy.',existingCueId=1600108),
    part(2,33.5,39.29,'Repeated Die Technik/Technik chant excluded by episode editorial policy; no one-word cue wall.',category='chant'),
    part(2,43.15,48.17,'Repeated Die Technik/Technik chant after the accepted complete sentence; policy exclusion.',category='chant'),
    part(2,55.5,58.04,'Uuh/Wuhu performance vocalization before original1600107; no stable independent lexical dialogue.',category='vocalization'),
    part(2,69.94,75.34,'Bubble-blowing prolonged scream/vocalization, not selected spoken dialogue.',category='vocalization'),
    part(3,112.28,112.56,'Tail of original1600118; do not duplicate.',existingCueId=1600118),
    part(4,126.2,133,'Repeated name chanting; excluded under package policy.',category='chant'),
    part(4,138.5,171.95,'Repeated name chanting; possible short shout is separately retained for review.',category='chant'),
    part(5,173.18,174.78,'Original1600119 Hallo, meine Freunde! already covers the greeting.',existingCueId=1600119)
]
result=dict(key='spongebob_blubberunterricht',baseRevision='09f3b78c619b47961024396b02564c3005542012',candidateWindows=6,humanListened=False,
    method='Independent original-source local small/medium, no text prompts/hotwords; literal raw word references plus source frames. Full Anti chunks and bounded Codex retakes use distinct crops. Earshot broad classification only, not word/speaker identification.',
    added=added,excluded=excluded,reviewNeeded=review_needed,
    counts=dict(candidateWindows=6,originalCaptions=19,originalPracticeCues=19,added=len(added),captions=19+len(added),practice=19+len(added),excludedParts=len(excluded),reviewNeededParts=len(review_needed)),
    countingNote='Parts are not windows; each window may contain accepted, excluded and reviewNeeded portions.',
    idPolicy=dict(firstNewId=1600120,maxPublishedAndSourceDraftId=1600119,neverReuseGaps=[]),
    normalizationNote='Case/punctuation only, including goes-to-text apostrophe in gehts/geht\'s; no lexical spelling substitution. Three Danke words selected from both full models, not silently deleting the fourth tight-small token.',
    scopeNote='All19 original caption/practice objects and all2 chapters/14 picks/12 cards remain unchanged. Selected spoken dialogue only. No merge or deploy.')
(qa/'review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result['counts']))
