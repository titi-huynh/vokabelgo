"""Independent local bounded ASR for Frieren S01E02 missing-line candidates.

Runs faster-whisper small and medium on candidate windows from
video/frieren_s01e02-web-v1.mp4
with word_timestamps=True, local_files_only=True, cpu_threads=3,
condition_on_previous_text=False, language="de", beam_size=5, temperature=0.0,
and NO initial_prompt or hotwords.
"""
import argparse
import hashlib
import json
import pathlib
import sys
import time

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")

root = pathlib.Path(__file__).resolve().parents[3]
qa_dir = pathlib.Path(__file__).resolve().parent
video_path = root / "video/frieren_s01e02-web-v1.mp4"
cand_path = qa_dir / "muse-candidates.json"
progress_path = qa_dir / "progress.txt"


def log_progress(msg: str):
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{stamp}] {msg}\n"
    with progress_path.open("a", encoding="utf-8") as f:
        f.write(line)
    print(line, end="", flush=True)


def run_windows(model_name: str, windows_spec: list, out_file: pathlib.Path, cand_sha: str, video_sha: str, audio_sha: str, audio, duration: float, resume: bool = False):
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
                    if (
                        ew.get("candidate") == w["candidate"]
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
                    log_progress(f"Resuming {out_file.name}: keeping {len(out_windows)}/{total} completed windows, starting from window {len(out_windows) + 1}.")
        except Exception as e:
            log_progress(f"Could not resume {out_file.name}: {e}")

    log_progress(f"Loading model={model_name} (device=cpu, compute_type=int8, cpu_threads=3, local_files_only=True)...")
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
        cand_id = w["candidate"]
        start = max(0.0, round(float(w["start"]), 3))
        end = min(duration, round(float(w["end"]), 3))
        w_t0 = time.time()
        s_idx = int(round(start * 16000))
        e_idx = int(round(end * 16000))
        clip = audio[s_idx:e_idx]
        segments_gen, _ = model.transcribe(
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
            segs.append({
                "start": round(start + float(s.start), 3),
                "end": round(start + float(s.end), 3),
                "text": s.text.strip(),
                "avg_logprob": float(s.avg_logprob),
                "no_speech_prob": float(s.no_speech_prob),
                "words": [
                    {
                        "start": round(start + float(wd.start), 3),
                        "end": round(start + float(wd.end), 3),
                        "word": wd.word,
                        "probability": float(wd.probability),
                    }
                    for wd in (s.words or [])
                ],
            })
        win_entry = {
            "candidate": cand_id,
            "start": start,
            "end": end,
            "crop": [start, end],
            "segments": segs,
        }
        if "label" in w:
            win_entry["label"] = w["label"]
        out_windows.append(win_entry)
        payload = {
            "model": model_name,
            "source": "video/frieren_s01e02-web-v1.mp4",
            "sourcePath": str(video_path),
            "sourceNote": "Archive 720p release preserving original audio (raw owner input no longer on machine)",
            "sourceVideoSha256": video_sha,
            "decodedAudioF32le16kSha256": audio_sha,
            "decodedPcmS16leSha256": "d7a7a3ef4f96167972d161326d5d6305a7ee94295a683f447c77edf0895d08d1",
            "candidateSha256": cand_sha,
            "method": "Independent local bounded ASR, no prompt or candidate text supplied",
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
            f"model={model_name} [{len(out_windows)}/{total}] candidate={cand_id}{label_str} ({start:.2f}-{end:.2f}s, {time.time()-w_t0:.1f}s): {texts}"
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["main", "tight", "context", "extra", "all"], default="main")
    parser.add_argument("--extra-spec", type=str, default=None, help="JSON file with extra crop windows")
    parser.add_argument("--suffix", type=str, default="extra", help="Output filename suffix for extra mode")
    parser.add_argument("--resume", action="store_true", help="Skip completed outputs/windows matching crop and options")
    args = parser.parse_args()

    cand_bytes = cand_path.read_bytes()
    cand_sha = hashlib.sha256(cand_bytes).hexdigest()
    cand_data = json.loads(cand_bytes.decode("utf-8"))

    log_progress(f"Hashing source video {video_path}...")
    h = hashlib.sha256()
    with video_path.open("rb") as vf:
        for chunk in iter(lambda: vf.read(1024 * 1024 * 8), b""):
            h.update(chunk)
    video_sha = h.hexdigest()

    log_progress(f"Decoding audio from {video_path} at 16kHz...")
    audio = decode_audio(str(video_path), sampling_rate=16000)
    duration = round(len(audio) / 16000.0, 3)
    audio_sha = hashlib.sha256(audio.tobytes()).hexdigest()
    log_progress(f"Audio decoded: {duration}s, video_sha256={video_sha}, pcm_sha256={audio_sha}")

    if args.mode in ("main", "all"):
        windows_spec = []
        for idx, c in enumerate(cand_data["candidates"], 1):
            w0, w1 = c["window"]
            windows_spec.append({
                "candidate": idx,
                "start": max(0.0, round(float(w0), 3)),
                "end": min(duration, round(float(w1), 3)),
            })
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}.json"
            run_windows(model_name, windows_spec, out_file, cand_sha, video_sha, audio_sha, audio, duration, resume=args.resume)
        log_progress("Completed main small + medium independent recognition across all 12 windows.")

    if args.mode in ("tight", "all"):
        tight_spec = json.loads((qa_dir / "extra_tight_spec.json").read_text(encoding="utf-8"))
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}-tight.json"
            run_windows(model_name, tight_spec, out_file, cand_sha, video_sha, audio_sha, audio, duration, resume=args.resume)
        log_progress("Completed tight small + medium independent recognition.")

    if args.mode in ("context", "all"):
        context_spec = json.loads((qa_dir / "extra_context_spec.json").read_text(encoding="utf-8"))
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}-context.json"
            run_windows(model_name, context_spec, out_file, cand_sha, video_sha, audio_sha, audio, duration, resume=args.resume)
        log_progress("Completed context small + medium independent recognition.")

    if args.mode == "extra" and args.extra_spec:
        spec_path = pathlib.Path(args.extra_spec)
        if not spec_path.is_absolute():
            spec_path = qa_dir / spec_path
        spec_list = json.loads(spec_path.read_text(encoding="utf-8"))
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}-{args.suffix}.json"
            run_windows(model_name, spec_list, out_file, cand_sha, video_sha, audio_sha, audio, duration, resume=args.resume)
        log_progress(f"Completed extra ({args.suffix}) small + medium recognition.")


if __name__ == "__main__":
    main()
