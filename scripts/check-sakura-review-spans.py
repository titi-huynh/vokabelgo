"""Independent local medium-model checks on Sakura source uncertainties."""
import json
from pathlib import Path
import sys
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding='utf-8')
root=Path(__file__).resolve().parents[1]
folder=root/'qa/kino-alignment/sakura_s01e01'
source=next(Path('C:/Users/huynh/OneDrive/Desktop/baidang').glob('Episode 1 Staffel 1 von Cardcaptors*.mp4'))
audio=decode_audio(str(source),sampling_rate=16000)
model=WhisperModel('medium',device='cpu',compute_type='int8',cpu_threads=2,local_files_only=True)
result=[]
for start,end in [(20,34),(154,168),(652,687),(1290,1342.82)]:
    segments,info=model.transcribe(audio[int(start*16000):int(end*16000)],language='de',
        beam_size=5,word_timestamps=True,condition_on_previous_text=False,vad_filter=False)
    rows=[{'start':round(start+s.start,3),'end':round(start+s.end,3),'text':s.text.strip(),
           'avgLogProb':s.avg_logprob,
           'words':[{'start':round(start+w.start,3),'end':round(start+w.end,3),
                     'word':w.word.strip(),'probability':w.probability} for w in s.words or []]}
          for s in segments]
    result.append({'start':start,'end':end,'segments':rows})
    (folder/'focused-medium-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'{start}-{end}: '+' | '.join(s['text'] for s in rows),flush=True)
