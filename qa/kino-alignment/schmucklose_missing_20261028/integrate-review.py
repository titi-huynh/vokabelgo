"""Rebuild via existing lesson builder; original166 input rows remain unchanged."""
import json,pathlib,subprocess,sys
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
review=json.loads((qa/'review.json').read_text(encoding='utf8'))
ids=json.loads((qa/'source-id-audit.json').read_text(encoding='utf8'))
assert [c['id']for c in review['added']]==list(range(ids['newStartId'],ids['newStartId']+len(review['added'])))
payload={'baseRevision':review['baseRevision'],'baselineFile':'qa/kino-alignment/schmucklose_missing_20261028/baseline-cues-166.json','reviewFile':'qa/kino-alignment/schmucklose_missing_20261028/review.json','sourceVideoSha256':review['sourceVideoSha256'],'humanListened':False,'idReservation':ids,'added':review['added']}
(root/'qa/kino-alignment/erdmaennchen_schmucklose/missing-dialogue-20261028.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
subprocess.check_call([sys.executable,'scripts/build-erdmaennchen-schmucklose.py'],cwd=root)
subprocess.check_call(['node','scripts/build-kino-metadata.cjs'],cwd=root)
for lang in ['de','vi']:(qa/f'erdmaennchen_schmucklose.{lang}.vtt').write_bytes((root/f'qa/kino-alignment/erdmaennchen_schmucklose/erdmaennchen_schmucklose.{lang}.vtt').read_bytes())
