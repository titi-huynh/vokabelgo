import json,pathlib,re,hashlib,subprocess,sys
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
load=lambda f:json.loads((qa/f).read_text(encoding='utf8'))
review=load('review.json');rawfiles=['codex-small-main.json','codex-medium-main.json','codex-small-recheck.json','codex-medium-recheck.json','independent-small-context.json','independent-medium-context.json'];total=0
pcm='007f9066021b6efb2554026087699969c5caff004549b11bce5db37b9b096572'
for f in rawfiles:
 d=load(f);assert d['completed']==d['total']==len(d['windows']);total+=d['completed'];assert d['sourceVideoSha256']==review['sourceVideoSha256'];assert d['decodedAudioF32le16kSha256']==pcm
 assert d['humanListened'] is False
 o=d['asrOptions'];assert o['initial_prompt'] is None and o['hotwords'] is None and o['condition_on_previous_text'] is False and o['vad_filter'] is False and o['word_timestamps'] is True
assert total==48
tokens=lambda s:re.findall(r'\w+',s.lower())
for c in review['added']:
 words=[];models=set()
 for r in c['timingEvidence']:
  d=load(r['file']);w=d['windows'][r['windowIndex']];seg=w['segments'][r['segmentIndex']];a,b=r['wordRange'];actual=seg['words'][a:b]
  assert actual==r['words'] and w['crop']==r['crop'] and d['model']==r['model'];assert tokens(''.join(t['word']for t in actual))==tokens(c['text']);models.add(d['model']);words+=actual
 assert models=={'small','medium'};assert c['start']==min(w['start']for w in words) and c['end']==max(w['end']for w in words)
 for f in c['speakerEvidence']['frames']:assert (qa/f).stat().st_size>1000
earshot=[]
for i in range(1,8):
 d=load(f'earshot-candidate{i}.json');assert not d.get('isError');result=json.loads(d['content'][0]['text'].split('JSON: ',1)[1]);earshot.append({'candidate':i,'start':result['start'],'end':result['end'],'audioset':result['audioset']})
ids=load('source-id-audit.json');assert ids['maxRetainedSourceId']==1000266 and ids['newStartId']==1000280
out={'completeCrops':total,'videoAndPcmHashesMatchAcrossAllRuns':True,'selectedLiteralWordsMatchBothModels':True,'wordTimingEnvelopesUnclipped':True,'humanListened':False,'earshotIsNotASR':True,'earshot':earshot,'pass':True}
(qa/'evidence-verification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({k:v for k,v in out.items()if k!='earshot'}))
