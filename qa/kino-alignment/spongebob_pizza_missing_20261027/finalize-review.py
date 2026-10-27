"""Codex final editorial decisions. Raw recognition files are never rewritten."""
import json,pathlib,re
qa=pathlib.Path(__file__).resolve().parent
read=lambda f:json.loads((qa/f).read_text(encoding='utf8'))
def evidence(file,index,start,end):
    data=read(file);w=data['windows'][index]
    words=[t for s in w['segments']for t in s['words'] if t['start']>=start and t['end']<=end]
    assert words
    return {'file':file,'model':data['model'],'windowIndex':index,'candidate':w.get('candidate'),'crop':w['crop'],'words':words,'literalText':''.join(t['word']for t in words).strip()}
added=[
 {'id':1200163,'candidate':1,'speaker':'SpongeBob','text':'Hä?','vi':'Hả?','speakerEvidence':'frame-54.4.jpg','support':[evidence('codex-small-main.json',0,54,54.7),evidence('codex-medium-main.json',0,54,54.7)]},
 {'id':1200164,'candidate':3,'speaker':'Thaddäus','text':'Schön.','vi':'Hay lắm.','speakerEvidence':'frame-75.8.jpg','support':[evidence('codex-small-main.json',2,75.5,76),evidence('codex-medium-main.json',2,75.5,76)]},
 {'id':1200165,'candidate':4,'speaker':'SpongeBob','text':'Ich glaube fast, die Pizza wird kalt.','vi':'Tôi nghĩ bánh pizza sắp nguội mất rồi.','speakerEvidence':'frame-90.5.jpg','support':[evidence('codex-small-recheck.json',7,90,92.5),evidence('codex-medium-main.json',3,90,92.5)]}
]
normalize=lambda t:re.sub(r'[^\wäöüß]','',t.lower())
for c in added:
    assert all(normalize(e['literalText'])==normalize(c['text'])for e in c['support']),c
    c['start']=min(w['start']for e in c['support']for w in e['words']);c['end']=max(w['end']for e in c['support']for w in e['words'])
    c['timingEvidence']=c['support'];c['decision']='add';c['note']='Only punctuation/capitalization normalized. Bounds cover every selected literal timing word. Local machine evidence, not human listening approval.'
def part(candidate,start,end,reason,**extras):return dict(candidate=candidate,start=start,end=end,reason=reason,**extras)
review_needed=[
 part(1,52.1,added[0]['start'],'Auspacken/Ausparken remains crop/model dependent; do not choose the parking spelling from context.',variants=['Auspacken!','Ausparken!']),
 part(1,added[0]['end'],56.58,'Second short request in wider exchange before old cue 1200116; repeated Auspacken/Ausparken disagreement. Keep outside captions.',variants=['Auspacken.','Ausparken!']),
 part(2,60.92,65.94,'Pack/park and presence of Ich vary, with Perfekt hallucinations in wider small crop; no stable exact wording.',variants=['Pack aus!','Park aus!','Ich pack aus!','Ich park aus!','Mich pack aus!','Perfekt!']),
 part(3,65.94,68.72,'Shout differs between ans Steuer/ansteuern/ans Feuer; SpongeBob name distorted. Grammar/context is not sufficient to choose exact words.',variants=['Lass mich an, Stöberspund!','Lass mich ans Steuerspunk!','Lass mich ans Feuer!','Lass mich ansteuern, Spongebob!']),
 part(3,68.86,70.26,'Repeated Ich pack/park aus calls remain lexically unstable across full-context medium and small/targeted medium.',variants=["Ich pack' aus!",'Ich park aus!']),
 part(3,73.7,75.46,'Resolution before Schön disagrees on ausgepackt/ausgeparkt; do not repair from the visual parking joke.',variants=["Ich hab' ausgepackt.",'Ich hab ausgeparkt.']),
 part(3,76.34,77.72,'Reply after Schön has ausgepackt/ausgeparkt disagreement; only the separately stable Schön is accepted.',variants=['Du hast ausgepackt.','Du hast ausgeparkt.']),
 part(6,261.22,269.29,'Name/call varies (Spanisch/Sponge/Spongi/SpongeBob); some output includes the already-published Schwamm drüber tail. Earshot Speech 0.656/Music 0.677 does not verify exact German words.',variants=['Kommt rüber, Spanisch!','Komm drüber, Spongebob!','Spongi?','Sponge?']),
 part(7,270.9,274.41,'Main/tight/context ASR yields nonlexical Ha/Ah, prolonged HÄ or no stable words. Earshot Music 0.433/Speech 0.252 cannot settle whether it is a lexical call, sob or effect. Retain for human listening; do not declare absence of speech.',variants=['Ha ha ha...','HÄÄÄ...','Ah, ah...'])
]
excluded=[
 part(1,51.57,52.1,'Tail of existing 1200115; do not duplicate or adjust old timestamps.',existingCueId=1200115),
 part(3,77.92,79.18,'Existing 1200117; contextual ASR phrase overlaps the published question.',existingCueId=1200117),
 part(4,87.78,89.7,'Existing 1200119; only the following independent sentence is newly accepted.',existingCueId=1200119),
 part(4,92.66,104.3,'Song following the accepted spoken sentence; excluded under the package song policy, regardless of ASR lyric variants.',category='song'),
 part(5,168.18,197.83,'Krosse Krabbe Pizza singing/beatboxing performance; outside selected spoken dialogue per Muse package. Earshot gives singing hint z3.38 (unvalidated), Speech0.417/Groan0.449/Music0.334; classification is mixed and does not verify lyrics.',category='song'),
 part(6,260.6,261.22,'Tail of existing 1200154 Ach, Schwamm drüber.; no duplicate cue or timing change.',existingCueId=1200154)
]
result={'key':'spongebob_pizza','baseRevision':'20ce104c034033f47852a6e4c1c7c82f0cd6c85b','candidateWindows':7,'humanListened':False,'method':'Local independent small/medium on original unchanged source; no prompts/hotwords, plus frames and broad sound classification. Instability retained, not corrected using context.','added':added,'excluded':excluded,'reviewNeeded':review_needed,'counts':{'candidateWindows':7,'originalCaptions':60,'originalPracticeCues':60,'added':len(added),'captions':60+len(added),'practice':60+len(added),'excludedParts':len(excluded),'reviewNeededParts':len(review_needed)},'countingNote':'Parts are not windows: a window can have accepted, excluded and reviewNeeded portions.','idPolicy':{'firstNewId':1200163,'maxPublishedAndSourceDraftId':1200162,'neverReuseGaps':[1200120,1200134]},'normalizationNote':'Only case/punctuation is normalized. New Ich glaube fast has comma after fast; the lexical words are exact.','scopeNote':'All 60 original captions and practice cue objects, chapters, picks, vocabulary and other films remain unchanged. No merge/deploy.'}
(qa/'review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result['counts']))
