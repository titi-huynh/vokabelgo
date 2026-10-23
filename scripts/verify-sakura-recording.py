"""Match local German speech samples to existing user subtitle files."""
import difflib
import json
import re
import sys
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding='utf-8')
root=Path(__file__).resolve().parents[1]
folder=root/'qa/kino-alignment/sakura_s01e01'
source=next(Path('C:/Users/huynh/OneDrive/Desktop/baidang').glob('Episode 1 Staffel 1 von Cardcaptors*.mp4'))
def seconds(stamp):
    h,m,s=stamp.replace(',','.').split(':')
    return int(h)*3600+int(m)*60+float(s)
def parse_srt(file):
    text=file.read_text(encoding='utf-8-sig').replace('\r','')
    pattern=r'(?m)^(\d+)\n(\d\d:\d\d:\d\d,\d+)\s+-->\s+(\d\d:\d\d:\d\d,\d+)\s*\n'
    matches=list(re.finditer(pattern,text))
    return [{'number':int(m[1]),'start':seconds(m[2]),'end':seconds(m[3]),
             'text':text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)].strip()}
            for i,m in enumerate(matches)]
de=parse_srt(folder/'source-local-de.srt')
vi=parse_srt(folder/'source-local-vi.srt')
(folder/'source-subtitles.json').write_text(json.dumps({'de':de,'vi':vi},ensure_ascii=False,indent=2),encoding='utf-8')
def norm(text):
    return ' '.join(re.findall(r'\w+',text.lower().replace('ß','ss')))
candidates=[]
for i in range(len(de)):
    for length in (1,2,3):
        group=de[i:i+length]
        candidates.append((group[0]['start'],group[-1]['end'],group[0]['number'],norm(' '.join(c['text'] for c in group))))
audio=decode_audio(str(source),sampling_rate=16000)
model=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=2,local_files_only=True)
samples=[]
for start in (5,70,270,570,870,1130,1250,1310):
    segments,info=model.transcribe(audio[start*16000:(start+25)*16000],language=None,
        beam_size=3,word_timestamps=True,condition_on_previous_text=False,vad_filter=False)
    found=[]
    for segment in segments:
        normalized=norm(segment.text)
        best=max(candidates,key=lambda c:difflib.SequenceMatcher(None,normalized,c[3]).ratio())
        score=difflib.SequenceMatcher(None,normalized,best[3]).ratio()
        found.append({'start':round(start+segment.start,3),'end':round(start+segment.end,3),
            'text':segment.text.strip(),'score':round(score,3),'srtNumber':best[2],
            'srtStart':best[0],'offset':round(start+segment.start-best[0],3),
            'words':[{'start':round(start+w.start,3),'end':round(start+w.end,3),
                      'word':w.word.strip(),'probability':w.probability} for w in segment.words or []]})
    samples.append({'sampleStart':start,'language':info.language,'languageProbability':info.language_probability,'segments':found})
    (folder/'recording-speech-samples.json').write_text(json.dumps(samples,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'{start}s {info.language} {info.language_probability:.3f}: '+' | '.join(f"{r['text']} [cue{r['srtNumber']} offset{r['offset']} score{r['score']}]" for r in found),flush=True)
print(f'SUBTITLES de={len(de)} vi={len(vi)} emptyVI={[c["number"] for c in vi if not c["text"]]}',flush=True)
