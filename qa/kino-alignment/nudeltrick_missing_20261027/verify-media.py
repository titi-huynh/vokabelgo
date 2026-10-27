"""Verify that source recognition and player use the same compressed audio."""
import hashlib
import json
from pathlib import Path
import av

root = Path(__file__).resolve().parents[3]
results = []
for name in ["video/erdmaennchen_nudeltrick.mp4", "video/kino-light/erdmaennchen_nudeltrick-480p-v2.mp4"]:
    source = root / name
    digest = hashlib.sha256()
    count = 0
    with av.open(str(source)) as container:
        duration = container.duration / av.time_base
        audio = container.streams.audio[0]
        start = float(audio.start_time * audio.time_base)
        for packet in container.demux(audio):
            if packet.size:
                digest.update(bytes(packet))
                count += 1
    with source.open("rb") as handle:
        file_hash = hashlib.file_digest(handle, "sha256").hexdigest()
    results.append({"file": name, "fileSha256": file_hash, "durationSeconds": duration,
                    "audioStartSeconds": start, "audioPackets": count,
                    "audioPacketBytesSha256": digest.hexdigest()})
assert results[0]["fileSha256"] == "2a956e7509ea72730608ace97c91d94462a5337e30c0f01442450d86e99664f2"
assert results[0]["audioPacketBytesSha256"] == results[1]["audioPacketBytesSha256"], results
assert results[0]["audioStartSeconds"] == results[1]["audioStartSeconds"] == 0
report = {"method": "SHA-256 of concatenated nonempty compressed audio packet bytes, independently demuxed using PyAV; no re-encoding", "audioBitstreamIdentical": True, "files": results}
Path(__file__).with_name("media-verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
