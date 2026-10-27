"""Independent local blind ASR for SpongeBob Pizza (video/spongebob_pizza.mp4).

Runs faster-whisper small and medium on neutral overlapping chunks (or extra specs)
from video/spongebob_pizza.mp4 with:
  device="cpu", compute_type="int8", cpu_threads=3, local_files_only=True,
  language="de", beam_size=5, temperature=0.0, word_timestamps=True,
  condition_on_previous_text=False, vad_filter=False,
  initial_prompt=None, hotwords=None.

No existing captions, old ASR, or candidate text are used as model input.
"""
import argparse
import hashlib
import json
import pathlib
import subprocess
import sys
import time
import numpy as np

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")

root = pathlib.Path(__file__).resolve().parents[3]
qa_dir = pathlib.Path(__file__).resolve().parent
video_path = root / "video/spongebob_pizza.mp4"
full_spec_path = qa_dir / "full_chunks_spec.json"
progress_path = qa_dir / "progress.txt"

EXPECTED_VIDEO_BYTES = 17860400
EXPECTED_VIDEO_SHA256 = "241c5cf57f3e8fe37942d779591275629bd3674669d733d63b8348027e6b0b98"


def log_progress(msg: str):
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{stamp}] {msg}\n"
    with progress_path.open("a", encoding="utf-8") as f:
        f.write(line)
    print(line, end="", flush=True)


def probe_video_duration(path: pathlib.Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


def run_windows(
    model_name: str,
    windows_spec: list,
    out_file: pathlib.Path,
    spec_sha: str,
    video_size: int,
    video_sha: str,
    ffprobe_duration: float,
    audio_f32_sha: str,
    audio_s16_sha: str,
    audio,
    duration: float,
    resume: bool = False,
):
    t0 = time.time()
    total = len(windows_spec)
    expected_options = {
        "device": "cpu",
        "compute_type": "int8",
        "cpu_threads": 3,
        "local_files_only": True,
        "language": "de",
        "beam_size": 5,
        "temperature": 0.0,
        "word_timestamps": True,
        "condition_on_previous_text": False,
        "vad_filter": False,
        "initial_prompt": None,
        "hotwords": None,
    }
    out_windows = []
    prior_elapsed = 0.0
    if resume and out_file.exists():
        try:
            existing = json.loads(out_file.read_text(encoding="utf-8"))
            if existing.get("model") == model_name and existing.get("asrOptions") == expected_options:
                existing_windows = existing.get("windows", [])
                prior_elapsed = float(existing.get("elapsedSeconds", 0.0))
                for idx, w in enumerate(windows_spec):
                    if idx >= len(existing_windows):
                        break
                    ew = existing_windows[idx]
                    start = max(0.0, round(float(w["start"]), 3))
                    end = min(duration, round(float(w["end"]), 3))
                    w_id = w.get("chunk", w.get("candidate", idx + 1))
                    ew_id = ew.get("chunk", ew.get("candidate"))
                    if (
                        ew_id == w_id
                        and ew.get("crop") == [start, end]
                        and ew.get("label") == w.get("label")
                    ):
                        out_windows.append(ew)
                    else:
                        break
                if len(out_windows) == total and existing.get("completed") == total and existing.get("total") == total:
                    log_progress(f"Skipping completed {out_file.name} ({total}/{total} windows match spec).")
                    return
                elif out_windows:
                    log_progress(
                        f"Resuming {out_file.name}: keeping {len(out_windows)}/{total} completed windows, starting from window {len(out_windows) + 1}."
                    )
        except Exception as e:
            log_progress(f"Could not resume {out_file.name}: {e}")

    log_progress(
        f"Loading model={model_name} (device=cpu, compute_type=int8, cpu_threads=3, local_files_only=True)..."
    )
    model = WhisperModel(
        model_name,
        device="cpu",
        compute_type="int8",
        cpu_threads=3,
        local_files_only=True,
    )
    start_idx = len(out_windows) + 1
    for idx in range(start_idx, total + 1):
        w = windows_spec[idx - 1]
        w_id = w.get("chunk", w.get("candidate", idx))
        start = max(0.0, round(float(w["start"]), 3))
        end = min(duration, round(float(w["end"]), 3))
        w_t0 = time.time()
        s_idx = int(round(start * 16000))
        e_idx = int(round(end * 16000))
        clip = audio[s_idx:e_idx]
        segments_gen, info = model.transcribe(
            clip,
            language="de",
            beam_size=5,
            word_timestamps=True,
            condition_on_previous_text=False,
            vad_filter=False,
            temperature=0.0,
            initial_prompt=None,
            hotwords=None,
        )
        segs = []
        for s in segments_gen:
            segs.append(
                {
                    "start": round(start + float(s.start), 3),
                    "end": round(start + float(s.end), 3),
                    "relStart": round(float(s.start), 3),
                    "relEnd": round(float(s.end), 3),
                    "text": s.text.strip(),
                    "rawText": s.text,
                    "avg_logprob": float(s.avg_logprob),
                    "no_speech_prob": float(s.no_speech_prob),
                    "compression_ratio": float(s.compression_ratio),
                    "words": [
                        {
                            "start": round(start + float(wd.start), 3),
                            "end": round(start + float(wd.end), 3),
                            "relStart": round(float(wd.start), 3),
                            "relEnd": round(float(wd.end), 3),
                            "word": wd.word,
                            "probability": float(wd.probability),
                        }
                        for wd in (s.words or [])
                    ],
                }
            )
        win_entry = {
            "chunk": w_id,
            "start": start,
            "end": end,
            "crop": [start, end],
            "sampleRange16k": [s_idx, e_idx],
            "segmentCount": len(segs),
            "segments": segs,
        }
        if "candidate" in w:
            win_entry["candidate"] = w["candidate"]
        if "label" in w:
            win_entry["label"] = w["label"]
        out_windows.append(win_entry)
        payload = {
            "model": model_name,
            "source": "video/spongebob_pizza.mp4",
            "sourcePath": str(video_path),
            "sourceNote": "Official Nickelodeon condensed clip (local owner file in workspace)",
            "sourceVideoBytes": video_size,
            "sourceVideoSha256": video_sha,
            "ffprobeDurationSeconds": ffprobe_duration,
            "decodedAudioDurationSeconds": duration,
            "decodedAudioSamples16k": int(len(audio)),
            "decodedAudioF32le16kSha256": audio_f32_sha,
            "decodedPcmS16le16kSha256": audio_s16_sha,
            "specSha256": spec_sha,
            "method": "Independent local blind ASR on neutral overlapping chunks, no prompt, hotwords, existing captions, or candidate text supplied",
            "asrOptions": expected_options,
            "humanListened": False,
            "completed": len(out_windows),
            "total": total,
            "elapsedSeconds": round(prior_elapsed + (time.time() - t0), 2),
            "windows": out_windows,
        }
        out_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        texts = " | ".join(s["text"] for s in segs) if segs else "(no segments)"
        label_str = f" [{w['label']}]" if "label" in w else ""
        log_progress(
            f"model={model_name} [{len(out_windows)}/{total}] chunk={w_id}{label_str} ({start:.3f}-{end:.3f}s, {len(segs)} segs, {time.time()-w_t0:.1f}s): {texts[:180]}..."
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["full", "extra"], default="full")
    parser.add_argument("--extra-spec", type=str, default=None, help="JSON file with extra crop windows")
    parser.add_argument("--suffix", type=str, default="extra", help="Output filename suffix for extra mode")
    parser.add_argument("--models", nargs="+", choices=["small", "medium"], default=["small", "medium"])
    parser.add_argument("--resume", action="store_true", help="Skip completed outputs/windows matching crop and options")
    args = parser.parse_args()

    if not video_path.exists():
        raise FileNotFoundError(f"Missing video file: {video_path}")

    video_size = video_path.stat().st_size
    log_progress(f"Validating and hashing source video {video_path} ({video_size} bytes)...")
    h = hashlib.sha256()
    with video_path.open("rb") as vf:
        for chunk in iter(lambda: vf.read(1024 * 1024 * 8), b""):
            h.update(chunk)
    video_sha = h.hexdigest()

    if video_size != EXPECTED_VIDEO_BYTES:
        raise ValueError(f"Video byte size mismatch: expected {EXPECTED_VIDEO_BYTES}, got {video_size}")
    if video_sha != EXPECTED_VIDEO_SHA256:
        raise ValueError(f"Video SHA256 mismatch: expected {EXPECTED_VIDEO_SHA256}, got {video_sha}")

    ffprobe_duration = probe_video_duration(video_path)
    log_progress(
        f"Source video verified: bytes={video_size}, sha256={video_sha}, ffprobe_duration={ffprobe_duration:.6f}s"
    )

    log_progress(f"Decoding audio from {video_path} at 16kHz mono float32...")
    audio = decode_audio(str(video_path), sampling_rate=16000)
    duration = round(len(audio) / 16000.0, 6)
    audio_f32_sha = hashlib.sha256(audio.tobytes()).hexdigest()
    pcm_s16 = np.clip(np.round(audio * 32767.0), -32768, 32767).astype("<i2")
    audio_s16_sha = hashlib.sha256(pcm_s16.tobytes()).hexdigest()
    log_progress(
        f"Audio decoded: {duration:.6f}s ({len(audio)} samples), f32le_sha256={audio_f32_sha}, s16le_sha256={audio_s16_sha}"
    )

    if args.mode == "full":
        spec_bytes = full_spec_path.read_bytes()
        spec_sha = hashlib.sha256(spec_bytes).hexdigest()
        windows_spec = json.loads(spec_bytes.decode("utf-8"))
        for model_name in args.models:
            out_file = qa_dir / f"independent-{model_name}-full.json"
            run_windows(
                model_name=model_name,
                windows_spec=windows_spec,
                out_file=out_file,
                spec_sha=spec_sha,
                video_size=video_size,
                video_sha=video_sha,
                ffprobe_duration=ffprobe_duration,
                audio_f32_sha=audio_f32_sha,
                audio_s16_sha=audio_s16_sha,
                audio=audio,
                duration=duration,
                resume=args.resume,
            )
        log_progress("Completed full independent recognition for requested models.")

    elif args.mode == "extra" and args.extra_spec:
        spec_path = pathlib.Path(args.extra_spec)
        if not spec_path.is_absolute():
            spec_path = qa_dir / spec_path
        spec_bytes = spec_path.read_bytes()
        spec_sha = hashlib.sha256(spec_bytes).hexdigest()
        spec_list = json.loads(spec_bytes.decode("utf-8"))
        for model_name in args.models:
            out_file = qa_dir / f"independent-{model_name}-{args.suffix}.json"
            run_windows(
                model_name=model_name,
                windows_spec=spec_list,
                out_file=out_file,
                spec_sha=spec_sha,
                video_size=video_size,
                video_sha=video_sha,
                ffprobe_duration=ffprobe_duration,
                audio_f32_sha=audio_f32_sha,
                audio_s16_sha=audio_s16_sha,
                audio=audio,
                duration=duration,
                resume=args.resume,
            )
        log_progress(f"Completed extra ({args.suffix}) recognition for requested models.")


if __name__ == "__main__":
    main()
