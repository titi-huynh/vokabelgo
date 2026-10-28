import hashlib,json,pathlib,re,subprocess
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2];base='215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d'
read=lambda f:json.loads((qa/f).read_text(encoding='utf8'))
video_sha='c2433e3cc318bfe477b85392446bb56c8568a2faa4f39eea15c98d0361aa1774';audio_sha='3c5233fe4caecf54d8a00cc80c40c2af9606b8e11f942d1e4eae8fb0498c240c'
counts={}
for model in ['small','medium']:
    for suffix,total in [('main',8),('recheck',7),('recheck2',2)]:
        file=f'codex-{model}-{suffix}.json';d=read(file);assert d['completed']==d['total']==len(d['windows'])==total
        assert d['model']==model and d['humanListened']is False and d['sourceVideoSha256']==video_sha and d['decodedAudioF32le16kSha256']==audio_sha
        o=d['asrOptions'];assert o['initial_prompt']is None and o['hotwords']is None and o['condition_on_previous_text']is False and o['local_files_only']is True
        counts[file]=total
    file=f'independent-{model}-context.json';d=read(file);assert d['summary']['complete'] and d['summary']['completedWindowCount']==d['summary']['expectedWindowCount']==len(d['windows'])==8
    assert d['source']['videoSha256']==video_sha and d['source']['decoded16kFloat32Sha256']==audio_sha
    assert d['model']['name']==model and d['model']['local_files_only']is True and d['humanListened']is False and d['promptedByCandidateText']is False and d['inferredWordsAdded']is False
    o=d['transcribeOptions'];assert o['initial_prompt']is None and o['hotwords']is None and o['condition_on_previous_text']is False
    counts[file]=8
assert sum(counts.values())==50
for i in range(1,9):assert read(f'earshot-candidate{i}.json')['result'].get('isError')is not True
review=read('review.json');assert review['added']==[] and len(review['reviewNeeded'])==5 and len(review['excluded'])==16
baseline=read('baseline-cues-268.json');assert all(not any(c['start']<p['end']and c['end']>p['start']for c in baseline['units'])for p in review['reviewNeeded'])
source_files=subprocess.run(['git','grep','-l','-E','"(id|cueId|parentId)"[[:space:]]*:[[:space:]]*500[0-9]{3}',base,'--','*.json'],cwd=root,capture_output=True,text=True,encoding='utf8')
assert source_files.returncode in [0,1]
paths=[s.split(':',1)[1]for s in source_files.stdout.splitlines()];found=[];other_film_refs=[]
known_films=set(json.loads(subprocess.check_output(['git','show',f'{base}:qa/kino-alignment/erdmaennchen_platte_reifen/baseline-practice-data.json'],cwd=root)))
def walk(obj,file,owner=None):
    if isinstance(obj,dict):
        if obj.get('key')in known_films:owner=obj['key']
        if obj.get('videoKey')in known_films:owner=obj['videoKey']
        for k,v in obj.items():
            if k in ['id','parentId','cueId']and isinstance(v,int)and 500000<=v<600000:
                record=dict(file=file,lessonScope=owner,field=k,id=v)
                (found if owner in [None,'druck_s07e01']else other_film_refs).append(record)
            walk(v,file,k if k in known_films else owner)
    elif isinstance(obj,list):
        for v in obj:walk(v,file,owner)
for file in paths:
    walk(json.loads(subprocess.check_output(['git','show',f'{base}:{file}'],cwd=root)),file)
max_id=max([c['id']for c in baseline['units']]+[c['id']for c in found]);assert max_id==500268
(qa/'source-id-audit.json').write_text(json.dumps(dict(baseRevision=base,lessonScope='druck_s07e01',filesSearched=paths,sourceReferences=found,excludedOtherLessonReferences=other_film_refs,maxPublishedOrDraftId=max_id,nextUnusedId=500269,nextUnusedParentId=269,allocatedNewIds=[],note='Mixed-film archival practice snapshots also contain historical Spy Family500xxx IDs; keep lesson scope instead of treating those as Druck draft IDs.'),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
out=dict(sourceVideoSha256=video_sha,decodedAudioF32le16kSha256=audio_sha,asrCompletedCrops=counts,codexCrops=34,antiCrops=16,totalCrops=50,earshotWindows=8,allRunsUnpromptedAndLocal=True,allRawFilesComplete=True,newCues=0,heldPartsOutsideLearning=True,oldIdAndParentIdPolicyPreserved=True,humanListened=False,pass_=True)
out['pass']=out.pop('pass_');(qa/'evidence-verification.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf8');print(json.dumps(out))
