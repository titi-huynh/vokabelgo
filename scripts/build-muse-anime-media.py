"""Prepare owner-supplied episodes for playback; publish the MP4s as media release assets.

The downloaded .mp4 inputs may actually contain MPEG-TS. Remux the original
H.264/AAC streams into a fast-start MP4 before serving them as video/mp4.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
KEYS = ('k_on_s01e01', 'delicious_in_dungeon_s01e01', 'frieren_s01e02', 'sakura_s01e02')


def run(args):
    return subprocess.check_output(args, text=True, encoding='utf8').strip()


def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)]))


def audio_hash(path):
    return run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0',
                '-c:a', 'pcm_s16le', '-f', 'hash', '-hash', 'sha256', '-'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, default=ROOT / 'video')
    parser.add_argument('--qa-dir', type=Path, default=ROOT / 'qa/kino-alignment/season1-episode2')
    parser.add_argument('--movie', action='append', choices=KEYS)
    opts = parser.parse_args()
    qa = opts.qa_dir.resolve()
    qa.mkdir(parents=True, exist_ok=True)
    (ROOT / 'video/kino-light').mkdir(parents=True, exist_ok=True)
    selected = tuple(dict.fromkeys(opts.movie or [k for k in KEYS if (opts.source_dir / f'{k}.mp4').exists() or (ROOT / 'video' / f'{k}-web-v1.mp4').exists()]))
    rows = []
    for key in selected:
        source = opts.source_dir / f'{key}.mp4'
        web = ROOT / 'video' / f'{key}-web-v1.mp4'
        if not source.exists() and web.exists():
            source = web
        light = ROOT / 'video/kino-light' / f'{key}-480p-v1.mp4'
        if not web.exists():
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
                            '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', '-movflags', '+faststart', str(web)], check=True)
        if not light.exists():
            print(f'Encoding {key} viewing copy', flush=True)
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(web),
                            '-map', '0:v:0', '-map', '0:a:0', '-vf', 'scale=-2:min(480\\,ih)',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-maxrate', '900k', '-bufsize', '1800k',
                            '-threads', '3', '-pix_fmt', 'yuv420p', '-g', '24', '-keyint_min', '24', '-sc_threshold', '0',
                            '-force_key_frames', 'expr:gte(t,n_forced*1)', '-c:a', 'copy', '-movflags', '+faststart', str(light)], check=True)
        original, full, small = probe(source), probe(web), probe(light)
        assert full['format']['format_name'].startswith('mov,mp4'), 'Web copy must be a real MP4'
        assert abs(float(full['format']['duration']) - float(small['format']['duration'])) < .05
        original_audio = audio_hash(source)
        assert original_audio == audio_hash(web) == audio_hash(light), 'Decoded audio samples changed'
        rows.append({
            'key': key, 'originalContainer': original['format']['format_name'],
            'original720p': web.relative_to(ROOT).as_posix(), 'viewing480p': light.relative_to(ROOT).as_posix(),
            'duration': float(full['format']['duration']), 'originalBytes': web.stat().st_size, 'viewingBytes': light.stat().st_size,
            'decodedAudioUnchanged': True, 'decodedAudioSha256': original_audio,
            'webSha256': hashlib.file_digest(web.open('rb'), 'sha256').hexdigest(),
            'viewingSha256': hashlib.file_digest(light.open('rb'), 'sha256').hexdigest(),
        })
        (qa / 'media.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf8')
        print(json.dumps(rows[-1]), flush=True)
    manifest_path = ROOT / 'kino-media-manifest.js'
    manifest = json.loads(manifest_path.read_text(encoding='utf8').split('const KINO_MEDIA_MANIFEST = ', 1)[1].strip().removesuffix(';'))
    for key in selected:
        manifest[key] = {'src': f'video/kino-light/{key}-480p-v1.mp4', 'label': 'Tiết kiệm 480p'}
    manifest_path.write_text('/* Viewing copies; audio is copied without re-encoding. */\nconst KINO_MEDIA_MANIFEST = '
                             + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n', encoding='utf8')


if __name__ == '__main__':
    main()
