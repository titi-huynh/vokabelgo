import hashlib,json,pathlib,subprocess,sys
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
files=['erdmaennchen-schmucklose-aligned.js','kino-metadata.js']+['qa/kino-alignment/erdmaennchen_schmucklose/'+f for f in ['aligned-utterances-audit.json','build-summary.json','caption-cues.json','practice-cues.json','erdmaennchen_schmucklose.de.vtt','erdmaennchen_schmucklose.vi.vtt']]
hashes=lambda:{f:hashlib.sha256((root/f).read_bytes()).hexdigest()for f in files}
before=hashes();subprocess.check_call([sys.executable,'scripts/build-erdmaennchen-schmucklose.py'],cwd=root);subprocess.check_call(['node','scripts/build-kino-metadata.cjs'],cwd=root);after=hashes();assert before==after
(qa/'build-determinism.json').write_text(json.dumps({'allFilesIdenticalAfterExistingBuilderRerun':True,'files':after,'pass':True},indent=2)+'\n',encoding='utf8');print('Build deterministic: 8/8 files identical')
