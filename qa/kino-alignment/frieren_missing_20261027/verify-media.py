"""Verify archive 720p and viewing 480p player copies against qa/kino-alignment/season1-episode2/media.json.

Note: Raw owner input for Frieren S01E02 is no longer present on this machine.
The project release archive video/frieren_s01e02-web-v1.mp4 (720p) preserves
the exact original audio stream (verified via decoded pcm_s16le SHA-256 in
qa/kino-alignment/season1-episode2/media.json).
"""
import hashlib
import json
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[3]
media_profile_path = root / "qa/kino-alignment/season1-episode2/media.json"
media_profiles = json.loads(media_profile_path.read_text(encoding="utf-8"))
frieren_profile = next(item for item in media_profiles if item["key"] == "frieren_s01e02")

expected_pcm_sha256 = "d7a7a3ef4f96167972d161326d5d6305a7ee94295a683f447c77edf0895d08d1"
expected_duration = 1560.102313

targets = [
    {
        "role": "archive720p_preserved_original_audio",
        "relPath": "video/frieren_s01e02-web-v1.mp4",
        "releaseUrl": "https://github.com/titi-huynh/vokabelgo-media/releases/download/media-v1/video--frieren_s01e02-web-v1.mp4",
        "expectedBytes": 252263102,
        "expectedSha256": "36d2a73f8fd1d0bbdc42728ed2bf163281e1896cbb4f2288ef85683d60fe3280",
    },
    {
        "role": "viewing480p_preserved_original_audio",
        "relPath": "video/kino-light/frieren_s01e02-480p-v1.mp4",
        "releaseUrl": "https://github.com/titi-huynh/vokabelgo-media/releases/download/media-v1/video--kino-light--frieren_s01e02-480p-v1.mp4",
        "expectedBytes": 136157599,
        "expectedSha256": "976039158c9ce8c084dab8cb69169a2a4af67c75b5add4aa234dd7e7cc9207eb",
    },
]

results = []
for item in targets:
    source = root / item["relPath"]
    assert source.exists(), f"Missing file: {source}"
    size = source.stat().st_size
    assert size == item["expectedBytes"], f"Byte mismatch for {source}: {size} != {item['expectedBytes']}"

    with source.open("rb") as handle:
        file_hash = hashlib.file_digest(handle, "sha256").hexdigest()
    assert file_hash == item["expectedSha256"], f"SHA256 mismatch for {source}: {file_hash} != {item['expectedSha256']}"

    pcm_out = subprocess.check_output(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(source),
            "-map",
            "0:a:0",
            "-c:a",
            "pcm_s16le",
            "-f",
            "hash",
            "-hash",
            "sha256",
            "-",
        ],
        text=True,
    ).strip()
    pcm_hash = pcm_out.split("=", 1)[1]
    assert pcm_hash == expected_pcm_sha256, f"Decoded PCM SHA256 mismatch for {source}: {pcm_hash} != {expected_pcm_sha256}"

    probe_out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(source),
        ],
        text=True,
    ).strip()
    duration = float(probe_out)
    assert abs(duration - expected_duration) < 1e-6, f"Duration mismatch for {source}: {duration} != {expected_duration}"

    results.append(
        {
            "role": item["role"],
            "file": str(source),
            "relPath": item["relPath"],
            "releaseUrl": item["releaseUrl"],
            "bytes": size,
            "fileSha256": file_hash,
            "decodedPcmS16leSha256": pcm_hash,
            "duration": duration,
        }
    )

report = {
    "key": "frieren_s01e02",
    "rawOwnerInputPresentOnMachine": False,
    "sourceNote": "Máy không còn raw input Frieren tập 2; sử dụng bản lưu trữ phát hành 720p (video/frieren_s01e02-web-v1.mp4) và 480p (video/kino-light/frieren_s01e02-480p-v1.mp4) từ kho media dự án giữ nguyên luồng âm thanh gốc theo hồ sơ qa/kino-alignment/season1-episode2/media.json.",
    "referenceMediaProfile": "qa/kino-alignment/season1-episode2/media.json",
    "audioUnchanged": True,
    "expectedDecodedPcmS16leSha256": expected_pcm_sha256,
    "expectedDuration": expected_duration,
    "method": "ffmpeg -map 0:a:0 -c:a pcm_s16le -f hash -hash sha256 (no audio recoding); SHA-256, byte size, and ffprobe format duration matched against season1-episode2/media.json",
    "files": results,
}

out_path = Path(__file__).with_name("media-verification.json")
out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"audioUnchanged": True, "rawOwnerInputPresentOnMachine": False, "checked": len(results)}, indent=2))
