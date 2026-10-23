"""Focused local second recognition contexts for ambiguous source spans."""
import json
from pathlib import Path
import sys
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding='utf-8')
root = Path(__file__).resolve().parents[1]
folder = root / 'qa/kino-alignment/frieren_s01e01'
audio = decode_audio(str(root / 'video/frieren_s01e01.mp4'), sampling_rate=16000)
model_name = 'medium' if '--medium' in sys.argv else 'small'
if '--base' in sys.argv:
    model_name = 'base'
model = WhisperModel(model_name, device='cpu', compute_type='int8', cpu_threads=2,
                     local_files_only=True)
spans = ([(129,138), (245,256), (727,731), (903,913), (1138,1152),
          (1334,1346), (1424,1436), (1530,1560)] if model_name == 'medium' else
         [(129,138), (245,256), (304,320), (322,334), (399,405),
          (727,731), (737,745), (849,857), (903,913)])
if '--late' in sys.argv:
    spans = [(1536,1544), (1544,1552), (1552,1560), (907,909), (728,730)]
if '--preview' in sys.argv:
    spans = [(1547,1560)]
results = []
for start, end in spans:
    segments, info = model.transcribe(audio[start*16000:end*16000], language='de',
        beam_size=5, condition_on_previous_text=False, word_timestamps=True,
        vad_filter=False, temperature=0)
    rows = [{'start':round(start+s.start,3), 'end':round(start+s.end,3),
             'text':s.text.strip(), 'avgLogProb':s.avg_logprob,
             'words':[{'start':round(start+w.start,3), 'end':round(start+w.end,3),
                       'word':w.word.strip(), 'probability':w.probability}
                      for w in s.words or []]} for s in segments]
    results.append({'start':start,'end':end,'segments':rows})
    suffix = '-preview' if '--preview' in sys.argv else '-late' if '--late' in sys.argv else ''
    (folder / f'focused-{model_name}{suffix}-review.json').write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{start}-{end}: ' + ' | '.join(r['text'] for r in rows), flush=True)
