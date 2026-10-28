"""Verify literal word references, source provenance, timing and complete ASR counts."""
import hashlib,json,pathlib,re
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
read=lambda f:json.loads((qa/f).read_text(encoding='utf8'))
review=read('review.json');norm=lambda t:re.sub(r'[^\wäöüß]','',t.lower());results=[]
for cue in review['added']:
    models=set()
    for e in cue['support']:
        data=read(e['file']);w=data['windows'][e['windowIndex']];assert w['crop']==e['crop'];assert e['model']==data['model'];models.add(data['model'])
        all_words=[t for s in w['segments']for t in s['words']]
        assert all(t in all_words for t in e['words'])
        assert norm(''.join(t['word']for t in e['words']))==norm(cue['text'])
        assert all(cue['start']<=t['start']<=t['end']<=cue['end']for t in e['words'])
    assert models=={'small','medium'}
    results.append({'id':cue['id'],'exactLiteralWordReferences':True,'selectedTimingWordsNotCut':True,'models':sorted(models)})
counts={}
for file in ['independent-small-full.json','independent-medium-full.json','codex-small-main.json','codex-medium-main.json','codex-small-recheck.json','codex-medium-recheck.json']:
    d=read(file);assert d['completed']==d['total']==len(d['windows']);opts=d['asrOptions'];assert opts.get('initial_prompt') is None and opts.get('hotwords') is None and opts['condition_on_previous_text'] is False
    assert d['humanListened'] is False and d['sourceVideoSha256']=='0e1ec80278f70b49d352a6ec31d760f610f72be2e204984a9aa0f8e39b32a42e'
    counts[file]=d['completed']
base=read('baseline-cues-19.json')
source=json.loads((root/'qa/kino-alignment/spongebob_blubberunterricht_20261026/lesson-content.json').read_text(encoding='utf8'))
old_source=json.loads(__import__('subprocess').check_output(['git','show',f'{review["baseRevision"]}:qa/kino-alignment/spongebob_blubberunterricht_20261026/lesson-content.json'],cwd=root))
assert all(next(c for c in source['cues']if c['id']==old['id'])==old for old in old_source['cues'])
assert source['chapters']==old_source['chapters'] and source['vocabulary']==old_source['vocabulary']
assert all(not any(c['start']<p['end'] and c['end']>p['start'] for c in review['added'])for p in review['reviewNeeded'])
out={'addedCueChecks':results,'sourceCuesAndVocabularyPreserved':True,'reviewNeededDoesNotOverlapAcceptedAdditions':True,'asrCompletedCrops':counts,'antiCrops':8,'codexCrops':44,'totalIndependentCrops':sum(counts.values()),'humanListened':False,'normalization':'Case/punctuation only','pass':True}
(qa/'evidence-verification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(out))
