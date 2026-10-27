"""Independent local bounded ASR for Erdmaennchen Nudeltrick missing-line candidates.

Runs faster-whisper small and medium on all 12 candidate windows from video/erdmaennchen_nudeltrick.mp4
with word_timestamps=True, local_files_only=True, cpu_threads=3, condition_on_previous_text=False,
language="de", and NO initial_prompt or hotwords.
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
video_path = root / "video/erdmaennchen_nudeltrick.mp4"
cand_path = qa_dir / "muse-candidates.json"
progress_path = qa_dir / "progress.txt"


def log_progress(msg: str):
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{stamp}] {msg}\n"
    with progress_path.open("a", encoding="utf-8") as f:
        f.write(line)
    print(line, end="", flush=True)


def run_windows(model_name: str, windows_spec: list, out_file: pathlib.Path, cand_sha: str, audio, duration: float):
    t0 = time.time()
    log_progress(f"Loading model={model_name} (cpu_threads=3, local_files_only=True)...")
    model = WhisperModel(
        model_name,
        device="cpu",
        compute_type="int8",
        cpu_threads=3,
        local_files_only=True,
    )
    out_Windows = []
    total = len(windows_spec)
    for idx, w in enumerate(windows_spec, 1):
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
            "segments": segs,
        }
        if "label" in w:
            win_entry["label"] = w["label"]
        out_Windows.append(win_entry)
        payload = {
            "model": model_name,
            "source": "video/erdmaennchen_nudeltrick.mp4",
            "candidateSha256": cand_sha,
            "method": "Independent local bounded ASR, no prompt or candidate text supplied",
            "humanListened": False,
            "completed": idx,
            "total": total,
            "elapsedSeconds": round(time.time() - t0, 2),
            "windows": out_Windows,
        }
        out_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        texts = " | ".join(s["text"] for s in segs) if segs else "(no segments)"
        log_progress(
            f"model={model_name} [{idx}/{total}] candidate={cand_id} ({start:.2f}-{end:.2f}s, {time.time()-w_t0:.1f}s): {texts}"
        )


TIGHT_SPEC = json.loads((qa_dir / "extra_tight_spec.json").read_text(encoding="utf-8"))

CONTEXT_SPEC = json.loads((qa_dir / "extra_context_spec.json").read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["main", "tight", "context", "all", "extra"], default="all")
    parser.add_argument("--extra-spec", type=str, default=None, help="JSON file with extra tight/context windows")
    parser.add_argument("--suffix", type=str, default="tight", help="Output filename suffix for extra mode")
    args = parser.parse_args()

    cand_bytes = cand_path.read_bytes()
    cand_sha = hashlib.sha256(cand_bytes).hexdigest()
    cand_data = json.loads(cand_bytes.decode("utf-8"))

    log_progress("Decoding audio from video/erdmaennchen_nudeltrick.mp4 at 16kHz...")
    audio = decode_audio(str(video_path), sampling_rate=16000)
    duration = round(len(audio) / 16000.0, 3)
    audio_sha = hashlib.sha256(audio.tobytes()).hexdigest()
    log_progress(f"Audio decoded: {duration}s, float32 PCM sha256={audio_sha}")

    if args.mode in ("main", "all"):
        windows_spec = []
        for idx, c in enumerate(cand_data["candidates"], 1):
            w0, w1 = c["window"]
            windows_spec.append({
                "candidate": idx,
                "start": max(0.0, round(w0 - 1.2, 3)),
                "end": min(duration, round(w1 + 1.2, 3)),
            })
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}.json"
            run_windows(model_name, windows_spec, out_file, cand_sha, audio, duration)
        log_progress("Completed main small + medium independent recognition across all 12 windows.")

    if args.mode in ("tight", "all"):
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}-tight.json"
            run_windows(model_name, TIGHT_SPEC, out_file, cand_sha, audio, duration)
        log_progress("Completed tight small + medium independent recognition.")

    if args.mode in ("context", "all"):
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}-context.json"
            run_windows(model_name, CONTEXT_SPEC, out_file, cand_sha, audio, duration)
        log_progress("Completed context small + medium independent recognition.")

    if args.mode == "extra" and args.extra_spec:
        spec_list = json.loads(pathlib.Path(args.extra_spec).read_text(encoding="utf-8"))
        for model_name in ["small", "medium"]:
            out_file = qa_dir / f"independent-{model_name}-{args.suffix}.json"
            run_windows(model_name, spec_list, out_file, cand_sha, audio, duration)
        log_progress(f"Completed extra ({args.suffix}) small + medium recognition.")


if __name__ == "__main__":
    main()
