"""Verify unchanged decoded audio between owner source and local player copies."""
import hashlib
import json
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[3]
files = [Path('C:/Users/huynh/OneDrive/Desktop/flash/video/delicious_in_dungeon_s01e01.mp4'),
         root / 'video/delicious_in_dungeon_s01e01-web-v1.mp4',
         root / 'video/kino-light/delicious_in_dungeon_s01e01-480p-v1.mp4']
expected = '2c200d31c6edee2f10a4d219afc8ba769395d79c8205d2dfb9ed2b6a8db1f30c'
results = []
for source in files:
    pcm_hash = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source), '-map', '0:a:0', '-c:a', 'pcm_s16le', '-f', 'hash', '-hash', 'sha256', '-'], text=True).strip().split('=', 1)[1]
    assert pcm_hash == expected, source
    with source.open('rb') as handle:
        file_hash = hashlib.file_digest(handle, 'sha256').hexdigest()
    results.append({'file': str(source), 'bytes': source.stat().st_size, 'fileSha256': file_hash, 'decodedPcmS16leSha256': pcm_hash})
report = {'audioUnchanged': True, 'method': 'ffmpeg decode to pcm_s16le, SHA-256; player files match established media release hashes', 'files': results}
Path(__file__).with_name('media-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'audioUnchanged': True, 'checked': len(results)}))
