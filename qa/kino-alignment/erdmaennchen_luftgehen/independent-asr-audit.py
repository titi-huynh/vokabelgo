import json
import pathlib
import sys
import time
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[3]
qa_dir = pathlib.Path(__file__).resolve().parent
video_path = root / "video" / "erdmaennchen_luftgehen.mp4"

lesson = json.load((qa_dir / "muse-lesson.json").open(encoding="utf-8"))
pick_ids = [p["id"] for ch in lesson["chapters"] for p in ch["picks"]]
special_ids = [
    3100017, 3100029, 3100052, 3100055, 3100061, 3100062, 3100067,
    3100078, 3100100, 3100101, 3100102, 3100120, 3100128, 3100140,
    3100141, 3100142, 3100143, 3100144, 3100158, 3100170, 3100171,
    3100172, 3100173, 3100180, 3100181, 3100182
]
target_ids = sorted(set(pick_ids + special_ids))
cue_map = {c["id"]: c for c in lesson["cues"]}

# Build short windows (pad 0.5s before/after, merge if gap <= 4.0s and total <= 25s)
raw_spans = []
for cid in target_ids:
    c = cue_map[cid]
    raw_spans.append((max(0.0, round(c["start"] - 0.5, 2)), min(692.44, round(c["end"] + 0.5, 2)), [cid]))
raw_spans.append((677.0, 682.5, [3100182]))
raw_spans.sort(key=lambda x: x[0])

windows = []
for s, e, cids in raw_spans:
    if windows and s <= windows[-1][1] + 4.0 and (max(windows[-1][1], e) - windows[-1][0]) <= 26.0:
        windows[-1] = (windows[-1][0], max(windows[-1][1], e), sorted(set(windows[-1][2] + cids)))
    else:
        windows.append((s, e, cids))

print(f"Total target cues: {len(target_ids)} across {len(windows)} windows "
      f"({sum(e - s for s, e, _ in windows):.1f}s total audio)", flush=True)

audio = decode_audio(str(video_path), sampling_rate=16000)

def run_model(model_name, out_filename):
    out_path = qa_dir / out_filename
    t0 = time.time()
    print(f"Loading cached {model_name}...", flush=True)
    model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
    out_windows = []
    for idx, (w_start, w_end, cids) in enumerate(windows):
        clip = audio[int(w_start * 16000):int(w_end * 16000)]
        segments, _ = model.transcribe(
            clip,
            language="de",
            beam_size=5,
            word_timestamps=True,
            condition_on_previous_text=False,
            vad_filter=False,
            repetition_penalty=1.1,
            no_repeat_ngram_size=3,
            max_new_tokens=96
        )
        segs = []
        for seg in segments:
            segs.append({
                "start": round(w_start + seg.start, 3),
                "end": round(w_start + seg.end, 3),
                "text": seg.text.strip(),
                "avg_logprob": round(seg.avg_logprob, 4),
                "words": [{
                    "start": round(w_start + w.start, 3),
                    "end": round(w_start + w.end, 3),
                    "word": w.word,
                    "probability": round(w.probability, 4)
                } for w in (seg.words or [])]
            })
        out_windows.append({
            "windowIndex": idx + 1,
            "start": w_start,
            "end": w_end,
            "cueIds": cids,
            "segments": segs
        })
        elapsed = round(time.time() - t0, 2)
        out_path.write_text(json.dumps({
            "model": model_name,
            "elapsedSeconds": elapsed,
            "completedWindows": idx + 1,
            "totalWindows": len(windows),
            "windows": out_windows
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[{model_name} {idx+1}/{len(windows)} {elapsed}s] {w_start:.2f}-{w_end:.2f} ({cids}): " +
              " | ".join(s["text"] for s in segs), flush=True)
    print(f"Finished {model_name} in {round(time.time() - t0, 2)}s", flush=True)

run_model("base", "anti-asr-base-windows.json")
run_model("small", "anti-asr-small-windows.json")
print("ALL ASR AUDITS COMPLETE", flush=True)
