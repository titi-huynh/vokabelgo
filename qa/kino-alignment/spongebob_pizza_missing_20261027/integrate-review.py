"""Rebuild only SpongeBob Pizza from immutable main source plus verified additions."""
import importlib.util,json,pathlib,subprocess,sys
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2];base='20ce104c034033f47852a6e4c1c7c82f0cd6c85b'
source_file='qa/kino-alignment/spongebob_source_20261024/lesson-content.json'
source=json.loads(subprocess.check_output(['git','show',f'{base}:{source_file}'],cwd=root))
review=json.loads((qa/'review.json').read_text(encoding='utf8'))
assert len(source['cues'])==60
published={c['id'] for c in source['cues']}
assert not published.intersection(c['id']for c in review['added'])
assert [c['id']for c in review['added']]==list(range(1200163,1200163+len(review['added'])))
source['cues']+= [{k:c[k]for k in ['id','start','end','speaker','text','vi']}for c in review['added']]
source['cues'].sort(key=lambda c:c['start'])
for a,b in zip(source['cues'],source['cues'][1:]):assert a['end']<=b['start'],(a,b)
source['missingDialogueReview']={'baseRevision':base,'reviewJson':'qa/kino-alignment/spongebob_pizza_missing_20261027/review.json','candidateWindows':7,'preservedPublishedCues':60,'addedIds':[c['id']for c in review['added']],'humanListened':False,'sourceVideoSha256':'241c5cf57f3e8fe37942d779591275629bd3674669d733d63b8348027e6b0b98','counts':review['counts']}
source['reviewMethod']='Preserved all 60 original published cues; new dialogue supported by independent local small/medium ASR and source frames. Uncertain words and songs excluded from learning data. No human listening approval.'
(root/source_file).write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
spec=importlib.util.spec_from_file_location('short_builder',root/'scripts/build-kino-short-lessons.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.build(root/source_file)
subprocess.check_call(['node','scripts/build-kino-metadata.cjs'],cwd=root)
for lang in ['de','vi']:(qa/f'spongebob_pizza.{lang}.vtt').write_bytes((root/source_file).parent.joinpath(f'spongebob_pizza.{lang}.vtt').read_bytes())
