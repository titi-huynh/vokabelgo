"""Recognize both original Bluey movies locally, retaining word timing evidence."""
import json, pathlib, sys, time
from faster_whisper import WhisperModel
sys.stdout.reconfigure(encoding='utf-8')
root = pathlib.Path(__file__).resolve().parents[1]
model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4, local_files_only=True)
for key in sys.argv[1:] or ['pizzaschwester', 'babysitter']:
    folder = root/'qa/kino-alignment'/key
    folder.mkdir(parents=True,exist_ok=True)
    started=time.time()
    print(f'RECOGNIZING {key}',flush=True)
    segments,info=model.transcribe(str(root/'video'/f'{key}.mp4'),language='de',beam_size=5,
                                  word_timestamps=True,vad_filter=False,condition_on_previous_text=False)
    result=[]
    for s in segments:
        result.append({'start':s.start,'end':s.end,'text':s.text,'avg_logprob':s.avg_logprob,
                       'words':[{'start':w.start,'end':w.end,'word':w.word,'probability':w.probability} for w in s.words or []]})
        (folder/'recognized-words.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
        print(f'{key} {s.start:.2f}-{s.end:.2f} {s.text}',flush=True)
    (folder/'recognition-complete.json').write_text(json.dumps({'seconds':time.time()-started,'segments':len(result)}),encoding='utf-8')
    print(f'DONE {key} in {time.time()-started:.1f}s',flush=True)
