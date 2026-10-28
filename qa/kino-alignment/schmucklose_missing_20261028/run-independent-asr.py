"""Independent local recognition by Antigravity; JSON window spec is numeric only, never text prompts."""
import hashlib
import json
import pathlib
import time
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

qa = pathlib.Path(__file__).resolve().parent
root = qa.parents[2]
video = root / 'video/erdmaennchen_schmucklose.mp4'
spec_path = qa / 'anti-context-spec.json'
progress_path = qa / 'anti-progress.txt'

def write_json(file: pathlib.Path, data: object) -> None:
    file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8')

def log(text: str) -> None:
    with progress_path.open('a', encoding='utf8') as f:
        f.write(time.strftime('%Y-%m-%d %H:%M:%S ') + text + '\n')
    print(text, flush=True)

video_bytes = video.read_bytes()
assert len(video_bytes) == 269615835, f"Unexpected video byte size: {len(video_bytes)}"
video_sha = hashlib.sha256(video_bytes).hexdigest()
assert video_sha == '037acc3d885e731b24cc18649599191f55c1a184ba1627fb85562e8fd52b944a', f"Unexpected video SHA256: {video_sha}"

audio = decode_audio(str(video), sampling_rate=16000)
duration = len(audio) / 16000
pcm_sha = hashlib.sha256(audio.tobytes()).hexdigest()

spec = json.loads(spec_path.read_text(encoding='utf8'))
opts = dict(
    language='de',
    beam_size=5,
    temperature=0,
    word_timestamps=True,
    condition_on_previous_text=False,
    vad_filter=False,
    initial_prompt=None,
    hotwords=None,
)

for name in ('small', 'medium'):
    output = qa / f'independent-{name}-context.json'
    payload = {
        'model': name,
        'source': 'video/erdmaennchen_schmucklose.mp4',
        'sourceVideoBytes': len(video_bytes),
        'sourceVideoSha256': video_sha,
        'decodedAudioF32le16kSha256': pcm_sha,
        'duration': duration,
        'asrOptions': {
            **opts,
            'device': 'cpu',
            'compute_type': 'int8',
            'cpu_threads': 3,
            'local_files_only': True,
        },
        'humanListened': False,
        'method': 'Blind independent local bounded ASR by Antigravity; numeric crop only; no candidate text, prompt, or hotwords',
        'windows': [],
        'completed': 0,
        'total': len(spec),
    }
    log(f'START model={name} total_windows={len(spec)} video_sha={video_sha[:12]} pcm_sha={pcm_sha[:12]}')
    model = WhisperModel(name, device='cpu', compute_type='int8', cpu_threads=3, local_files_only=True)
    for w in spec:
        start = max(0.0, float(w['start']))
        end = min(duration, float(w['end']))
        begin = time.time()
        gen, _ = model.transcribe(audio[round(start * 16000):round(end * 16000)], **opts)
        segs = [
            {
                'start': round(start + s.start, 3),
                'end': round(start + s.end, 3),
                'text': s.text,
                'avg_logprob': s.avg_logprob,
                'no_speech_prob': s.no_speech_prob,
                'words': [
                    {
                        'word': t.word,
                        'start': round(start + t.start, 3),
                        'end': round(start + t.end, 3),
                        'probability': t.probability,
                    }
                    for t in (s.words or [])
                ],
            }
            for s in gen
        ]
        elapsed = round(time.time() - begin, 2)
        payload['windows'].append({
            **w,
            'crop': [start, end],
            'segments': segs,
            'elapsedSeconds': elapsed,
        })
        payload['completed'] += 1
        write_json(output, payload)
        log(f'{name} context {payload["completed"]}/{len(spec)} #{w["candidate"]} {start}-{end} ({elapsed}s): ' + ' | '.join(s['text'] for s in segs))
    log(f'DONE model={name} completed={payload["completed"]}/{len(spec)}')
    del model
