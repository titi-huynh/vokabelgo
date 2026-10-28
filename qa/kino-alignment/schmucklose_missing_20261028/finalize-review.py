"""Final reviewed decisions; source ASR files remain immutable."""
import json,pathlib,re,hashlib,subprocess
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
def load(f):return json.loads((qa/f).read_text(encoding='utf8'))
def save(f,v):(qa/f).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def tokens(s):return re.findall(r'\w+',s.lower())
def ref(file,window,segment,first=0,last=None):
 data=load(file);w=data['windows'][window];seg=w['segments'][segment];words=seg['words'][first:last]
 return dict(file=file,windowIndex=window,candidate=w['candidate'],crop=w['crop'],segmentIndex=segment,wordRange=[first,len(seg['words']) if last is None else last],model=data['model'],text=''.join(t['word']for t in words).strip(),words=words)
def cue(id,candidate,speaker,text,vi,refs,frames,note):
 for r in refs:assert tokens(r['text'])==tokens(text),(text,r)
 assert {r['model']for r in refs}=={'small','medium'}
 words=[w for r in refs for w in r['words']]
 return dict(id=id,parentId=id,candidate=candidate,start=min(w['start']for w in words),end=max(w['end']for w in words),speaker=speaker,text=text,vi=vi,timingEvidence=refs,speakerEvidence={'method':'Source frames and dialogue turn context; no voice identification or human listening','frames':frames},note=note)
added=[
 cue(1000280,2,'Gräfin','Ja, natürlich.','Vâng, tất nhiên rồi.',[ref('codex-small-main.json',1,1),ref('codex-medium-main.json',1,1)],['frame-93.0.jpg','anti-frame-092.6s.jpg'],'Low Ja word probability in main small (~0.21), but literal repeats in both broader models and image turn. Gap-only cut produces Die war(en) natürlich; retained as contradictory crop evidence, not hidden.'),
 cue(1000281,2,'Gräfin','Hier.','Đây này.',[ref('codex-small-main.json',1,2),ref('codex-medium-main.json',1,2),ref('codex-medium-recheck.json',1,4,0,1)],['frame-94.7.jpg','anti-frame-094.3s.jpg'],'Both root models support Hier; Anti medium broad omits it. Kept as its own demonstrative utterance while showing the scarf, not part of the measurement.'),
 cue(1000282,2,'Gräfin','6,38 Meter.','6,38 mét.',[ref('independent-small-context.json',1,5),ref('codex-medium-main.json',1,3)],['frame-96.8.jpg','anti-frame-096.2s.jpg'],'Numeric rendering retained literally. Small main m. variant is not the selected Meter text evidence. Medium Meter timestamp has zero duration at 97.30, preserved verbatim; envelope includes the positive small word and the complete medium number, no manual endpoint clipping.'),
 cue(1000283,6,'Hannelore Elster','Ihr Schmuck?','Đồ trang sức của bà sao?',[ref('codex-small-main.json',5,1),ref('codex-medium-main.json',5,0,1,3),ref('independent-medium-context.json',5,2)],['frame-533.3.jpg','anti-frame-533.4s.jpg'],'Medium main inserts an extra Schmuck before Ihr; both broad models and both gap rechecks have only Ihr Schmuck. It is not taken as a separate new utterance. Speaker is Hannelore from open beak at533.4, Wilhelm beside her has mouth closed.'),
 cue(1000284,6,'Gräfin','Ja, mein Schmuck.','Vâng, đồ trang sức của tôi.',[ref('codex-small-main.json',5,2),ref('independent-medium-context.json',5,3)],['frame-534.5.jpg','frame-535.7.jpg','anti-frame-535.0s.jpg'],'Complete turn with pause before mein; envelope preserves all selected words, ends536.43 before unchanged old1000222 at536.46. No independent etwa/gestohlen utterance added from the following old question.')
]
review=[
 {'candidate':3,'start':202.28,'end':207.82,'reason':'Three repeated Das ist ... turns are supported in broad/gap crops, but literal word differs Papalapap/Pappalapap/Pappalapapp. Small main emits a fourth near-zero-time repetition; medium main first Das estimate touches old1000143. Do not silently choose spelling/count or rewrite the word from a dictionary. Keep the whole repeated turn for listening review; do not infer that there is no speech.','evidence':['codex-small-main.json','codex-medium-main.json','codex-small-recheck.json','codex-medium-recheck.json','independent-small-context.json','independent-medium-context.json'],'hypotheses':['Das ist Papalapap.','Das ist Pappalapap.','Das ist Pappalapapp.']},
 {'candidate':4,'start':257.04,'end':258.98,'reason':'Köstlich and the following full Wie kann man... sentence are already1000153/154. Und is a lead-in fragment of that old question, with timing moving from before old154 into it across models. No full independent new utterance can be added without retiming/rewriting a published cue. Keep the gap only pending review, old wording remains immutable.','evidence':['codex-small-main.json','codex-medium-main.json','codex-small-recheck.json','codex-medium-recheck.json','independent-small-context.json','independent-medium-context.json'],'hypotheses':['Und wie kann man nur so le...']},
 {'candidate':5,'start':391.22,'end':399.54,'reason':'Root main/gap/recheck small+medium mostly agree Augen wachen, whereas Anti small broad says Augen machen; no substitution by idiom/grammar. Leading Ja is partly estimated over old1000191; later broad-only shouts vary Steh mal/Stehen bleiben and einhechten/einhalten. Entire gap held, no partial word clipped to force an accepted cue.','evidence':['codex-small-main.json','codex-medium-main.json','codex-small-recheck.json','codex-medium-recheck.json','independent-small-context.json','independent-medium-context.json'],'hypotheses':['Da wird mein Flauschehäschen aber Augen wachen.','Da wird mein Flauschehäschen aber Augen machen.','Steh mal! Ich muss sofort einhechten!','Stehen bleiben! Sofort einhalten!']}
]
excluded=[]
def ex(c,s,e,kind,reason,ids=[]):excluded.append(dict(candidate=c,start=s,end=e,kind=kind,reason=reason,existingCueIds=ids))
ex(1,1.78,26.12,'opening-song','Opening theme is excluded by package policy; Earshot Music0.580 supports broad music classification, no word or speaker judgement.')
ex(2,90.9,91.82,'existing-dialogue','Können Sie das beweisen is old1000120; never add from shifted ASR.',[1000120])
ex(2,98.64,99.69,'existing-dialogue','Fein/Feins at cut edge resolves to beginning of old Feinste Strickware1000121 in both broad crops, not a separate compliment.',[1000121])
ex(3,201.72,202.28,'existing-dialogue','Old1000143 tail and early estimate of first repeated Das; old cue immutable.',[1000143])
ex(3,207.82,208.68,'existing-dialogue','Hier drin war... is beginning of complete old1000144, not an incomplete new sentence.',[1000144])
ex(4,255.89,257.04,'existing-dialogue','Köstlich belongs to old1000153; medium estimate slightly extends beyond its end.',[1000153])
ex(4,258.98,259.85,'existing-dialogue','Wie kann man... belongs to old1000154; no duplicate added from a truncated crop.',[1000154])
ex(6,531.51,532.22,'existing-dialogue','Schmuck tail is old1000221. Extra medium main Schmuck is unsupported as an additional turn by broad/gap crops; not a second new question.',[1000221])
ex(6,536.46,537.42,'existing-dialogue','gestört/gesto-/gestohlen is from following old1000222. Broad models resolve gestohlen/etwa gestohlen. Preserve old1000222 without adding duplicate or changing wording.',[1000222])
ex(7,659.13,659.8,'existing-dialogue','Dick is the tail of old1000247, not a new standalone word.',[1000247])
ex(7,659.8,662.02,'nonlexical-filler','Small main and both gap retakes give varying Oh/äh hesitation; broad models omit it. Selected-dialogue policy omits filler, no complete new sentence claimed.')
ex(7,662.02,663.88,'existing-dialogue','Hier/bitte/danke belongs to old1000248. Muse neighbour listing skips this cue; check baseline instead of assuming an empty gap to1000249.',[1000248])
out=dict(lessonId='erdmaennchen_schmucklose',baseRevision='215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d',sourceVideoSha256='037acc3d885e731b24cc18649599191f55c1a184ba1627fb85562e8fd52b944a',humanListened=False,method='Independent local small+medium ASR, numeric crops only; no prompt/hotwords. Conservative selected-word timing envelopes; no clamping, no grammar-based repairs.',counts=dict(candidateWindows=7,existingCues=166,added=5,finalCues=171,reviewNeededParts=len(review),excludedParts=len(excluded),codexCrops=34,antigravityCrops=14,totalCrops=48),added=added,reviewNeeded=review,excluded=excluded)
out['idAllocation']=load('source-id-audit.json')
out['reviewNeeded'][0]['speakerReview']='Frames show both Gräfin and Wilhelm during the exchange; no voice confirmation. Anti allows Gräfin but records Wilhelm as another possibility. Do not grade this line until text/count/speaker are reviewed.'
out['reviewNeeded'][2]['rawContextEnd']=400.12
out['reviewNeeded'][2]['rawContextOverlapNote']='Later broad-only shouts extend into unchanged old1000192 from399.54. The gap review interval ends at399.54; raw evidence is preserved in full and no accepted cue is clipped from it.'
save('review.json',out)
save('media-verification.json',dict(source='video/erdmaennchen_schmucklose.mp4',sourceOfLocalCopy='Existing primary checkout original, identical SHA/size to tracked LFS pointer and archived source-info',bytes=269615835,sha256=out['sourceVideoSha256'],duration=722.48,width=1280,height=720,decodedAudioF32le16kSha256=load('codex-small-main.json')['decodedAudioF32le16kSha256'],decodedAudioDuration=load('codex-small-main.json')['duration'],unmodifiedOriginal=True,humanListened=False))
print(json.dumps({'counts':out['counts'],'added':[{k:c[k]for k in ['id','start','end','speaker','text']}for c in added]},ensure_ascii=False,indent=2))
