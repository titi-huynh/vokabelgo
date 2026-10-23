"""Recheck ambiguous short calls in their full local dialogue context."""
import json, pathlib, re, sys
import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer
sys.stdout.reconfigure(encoding='utf-8')
root = pathlib.Path(__file__).resolve().parents[1]
p = root/'qa/peppa-alignment/aligned-utterances-audit.json'
atoms = json.loads(p.read_text(encoding='utf-8'))
model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4, local_files_only=True)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='de')
audio = decode_audio(str(root/'video/Peppa_Wutz_Supermarkt.mp4'), sampling_rate=16000)
def tokens(s): return re.findall(r'\w+',s.lower())
for begin,end,parents in [(667,692.1,[78,79,80]),(425,442,[52,53]),(505.5,534,[61,62,63])]:
    group = [x for x in atoms if x['parentId'] in parents]
    encoded = model.encode(pad_or_trim(model.feature_extractor(audio[int(begin*16000):int(end*16000)])))
    raw = model.find_alignment(tokenizer,[tokenizer.encode(' '+' '.join(x['text'] for x in group))],encoded,int((end-begin)*100))[0]
    words = [dict(w,token=t) for w in raw for t in tokens(w['word'])]
    offset=0
    for cue in group:
        count=len(tokens(cue['text'])); window=words[offset:offset+count]; offset+=count
        assert [x['token'] for x in window] == tokens(cue['text'])
        nz=[x for x in window if x['end']>x['start']]
        if not nz: continue
        cue['refinedStart']=round(begin+nz[0]['start'],3)
        cue['refinedEnd']=round(begin+nz[-1]['end'],3)
        print(cue['id'],cue['refinedStart'],cue['refinedEnd'],round(float(np.mean([x['probability'] for x in window])),3),cue['text'],flush=True)
(root/'qa/peppa-alignment/refined-short-calls.json').write_text(json.dumps([x for x in atoms if 'refinedStart' in x],ensure_ascii=False,indent=2),encoding='utf-8')
