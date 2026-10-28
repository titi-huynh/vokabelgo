"""Independent local recognition; JSON window spec is numeric only, never text prompts."""
import argparse,hashlib,json,pathlib,time
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

qa=pathlib.Path(__file__).resolve().parent
root=qa.parents[2]
video=root/'video/erdmaennchen_schmucklose.mp4'
p=argparse.ArgumentParser();p.add_argument('--spec');p.add_argument('--suffix',default='main');p.add_argument('--models',nargs='+',default=['small','medium']);args=p.parse_args()
write=lambda file,data:file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def log(text):
    with(qa/'codex-progress.txt').open('a',encoding='utf8')as f:f.write(time.strftime('%H:%M:%S ')+text+'\n')
    print(text,flush=True)
video_sha=hashlib.sha256(video.read_bytes()).hexdigest();assert video_sha=='037acc3d885e731b24cc18649599191f55c1a184ba1627fb85562e8fd52b944a'
audio=decode_audio(str(video),sampling_rate=16000);duration=len(audio)/16000
if args.spec:spec=json.loads((qa/args.spec).read_text(encoding='utf8'))
else:
    candidates=json.loads((qa/'quet-cau-thieu--erdmaennchen-schmucklose.json').read_text(encoding='utf8'))['candidates']
    spec=[{'candidate':i,'start':c['window'][0],'end':c['window'][1]}for i,c in enumerate(candidates,1)]
write(qa/f'codex-{args.suffix}-spec.json',spec)
opts=dict(language='de',beam_size=5,temperature=0,word_timestamps=True,condition_on_previous_text=False,vad_filter=False,initial_prompt=None,hotwords=None)
for name in args.models:
    output=qa/f'codex-{name}-{args.suffix}.json'
    payload={'model':name,'source':'video/erdmaennchen_schmucklose.mp4','sourceVideoSha256':video_sha,'decodedAudioF32le16kSha256':hashlib.sha256(audio.tobytes()).hexdigest(),'duration':duration,'asrOptions':{**opts,'device':'cpu','compute_type':'int8','cpu_threads':3,'local_files_only':True},'humanListened':False,'method':'Local independent bounded ASR; only numeric crop supplied; no candidate text, prompt or hotwords','windows':[],'completed':0,'total':len(spec)}
    model=WhisperModel(name,device='cpu',compute_type='int8',cpu_threads=3,local_files_only=True)
    for w in spec:
        start=max(0,w['start']);end=min(duration,w['end']);begin=time.time()
        gen,_=model.transcribe(audio[round(start*16000):round(end*16000)],**opts)
        segs=[{'start':round(start+s.start,3),'end':round(start+s.end,3),'text':s.text,'avg_logprob':s.avg_logprob,'no_speech_prob':s.no_speech_prob,'words':[{'word':t.word,'start':round(start+t.start,3),'end':round(start+t.end,3),'probability':t.probability}for t in s.words or []]}for s in gen]
        payload['windows'].append({**w,'crop':[start,end],'segments':segs,'elapsedSeconds':round(time.time()-begin,2)});payload['completed']+=1;write(output,payload)
        log(f'{name} {args.suffix} {payload["completed"]}/{len(spec)} #{w["candidate"]} {start}-{end}: '+ ' | '.join(s['text']for s in segs))
    del model
