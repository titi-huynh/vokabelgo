"""Lesson-scoped existing source ID inventory; excludes machine word numbers."""
import json,pathlib,re,subprocess
root=pathlib.Path(__file__).resolve().parents[3];qa=pathlib.Path(__file__).resolve().parent
base='215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d'
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
names=[f for f in files if ('schmucklose' in f and pathlib.Path(f).suffix in {'.js','.json','.tsv','.md','.vtt','.txt','.py'}) or (f.startswith('qa/kino-alignment/') and f.endswith('.json') and any(t in f for t in ['baseline','review','cue','draft']))]
matches=[]
for name in names:
 text=subprocess.check_output(['git','show',f'{base}:{name}'],cwd=root).decode('utf8')
 if 'schmucklose' not in name:
  # Only structured matching lesson objects, not unrelated 1000xxx lessons.
  try:
   obj=json.loads(text)
  except ValueError:continue
  def scoped(o):
   if isinstance(o,dict):
    for key,v in o.items():
     if 'schmucklose' in key:yield v
     elif isinstance(v,(dict,list)):yield from scoped(v)
   elif isinstance(o,list):
    for v in o:yield from scoped(v)
  text=json.dumps(list(scoped(obj)),ensure_ascii=False)
 ids=sorted(set(int(x) for x in re.findall(r'(?<!\d)(1000\d{3})(?!\d)',text)))
 if ids:matches.append({'path':name,'ids':ids,'max':max(ids)})
out={'baseRevision':base,'lessonId':'erdmaennchen_schmucklose','maxRetainedSourceId':max(x['max']for x in matches),'conservativeReservedThroughId':1000279,'newStartId':1000280,'reservationIsInference':True,'reservationReason':'Source README documents a discarded179-cue draft before renumbering, but full draft is absent. If contiguous from1000101 it would reach1000279. Reserve that possible range conservatively; do not claim the absent IDs are independently observed. Muse266 is the retained-file maximum only.','sources':matches,'note':'Other lessons scoped by lesson key. Do not reuse possible discarded draft IDs.'}
(qa/'source-id-audit.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'files':len(matches),'maxRetainedSourceId':out['maxRetainedSourceId'],'reserveThrough':out['conservativeReservedThroughId'],'newStartId':out['newStartId']},ensure_ascii=False))
