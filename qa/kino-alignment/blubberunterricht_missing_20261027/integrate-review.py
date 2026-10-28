"""Rebuild only SpongeBob Blubberunterricht from immutable main source plus verified additions."""
import importlib.util,json,pathlib,subprocess,sys
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2];base='09f3b78c619b47961024396b02564c3005542012'
source_file='qa/kino-alignment/spongebob_blubberunterricht_20261026/lesson-content.json'
source=json.loads(subprocess.check_output(['git','show',f'{base}:{source_file}'],cwd=root))
review=json.loads((qa/'review.json').read_text(encoding='utf8'))
assert len(source['cues'])==19
published={c['id'] for c in source['cues']}
assert not published.intersection(c['id']for c in review['added'])
assert [c['id']for c in review['added']]==list(range(1600120,1600120+len(review['added'])))
source['cues']+= [{k:c[k]for k in ['id','start','end','speaker','text','vi']}for c in review['added']]
source['cues'].sort(key=lambda c:c['start'])
for a,b in zip(source['cues'],source['cues'][1:]):assert a['end']<=b['start'],(a,b)
source['missingDialogueReview']={'baseRevision':base,'reviewJson':'qa/kino-alignment/blubberunterricht_missing_20261027/review.json','candidateWindows':6,'preservedPublishedCues':19,'addedIds':[c['id']for c in review['added']],'humanListened':False,'sourceVideoSha256':'0e1ec80278f70b49d352a6ec31d760f610f72be2e204984a9aa0f8e39b32a42e','counts':review['counts']}
source['reviewMethod']='Preserved all 19 original published cues; new dialogue supported by independent local small/medium ASR and source frames. Uncertain words and songs excluded from learning data. No human listening approval.'
(root/source_file).write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
spec=importlib.util.spec_from_file_location('short_builder',root/'scripts/build-kino-short-lessons.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.build(root/source_file)
subprocess.check_call(['node','scripts/build-kino-metadata.cjs'],cwd=root)
for lang in ['de','vi']:(qa/f'spongebob_blubberunterricht.{lang}.vtt').write_bytes((root/source_file).parent.joinpath(f'spongebob_blubberunterricht.{lang}.vtt').read_bytes())
