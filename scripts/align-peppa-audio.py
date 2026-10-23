"""Local speech timing audit; writes evidence, never edits the source movie."""
import json
import pathlib
import sys
import time
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')
root = pathlib.Path(__file__).resolve().parents[1]
out = root / 'qa' / 'peppa-alignment'
out.mkdir(parents=True, exist_ok=True)
started = time.time()
print('Loading locally cached small German speech model...', flush=True)
model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4, local_files_only=True)
segments, info = model.transcribe(str(root / 'video' / 'Peppa_Wutz_Supermarkt.mp4'),
                                  language='de', beam_size=5, word_timestamps=True,
                                  vad_filter=False, condition_on_previous_text=False)
result = []
for segment in segments:
    item = {'start': segment.start, 'end': segment.end, 'text': segment.text,
            'avg_logprob': segment.avg_logprob,
            'words': [{'start': w.start, 'end': w.end, 'word': w.word, 'probability': w.probability}
                      for w in (segment.words or [])]}
    result.append(item)
    print(f'{segment.start:.2f}-{segment.end:.2f} {segment.text}', flush=True)
    (out / 'recognized-words.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Done: {len(result)} segments in {time.time()-started:.1f}s', flush=True)
