import hashlib
import json
import os
import time
from datetime import datetime, timezone

import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

QA_DIR = os.path.join("qa", "kino-alignment", "druck_s07e01_missing_20261028")
SPEC_PATH = os.path.join(QA_DIR, "anti-context-spec.json")
PROGRESS_PATH = os.path.join(QA_DIR, "anti-progress.txt")
VIDEO_PATH = os.path.join("video", "druck-s07e01.mp4")

SAMPLE_RATE = 16000

TRANSCRIBE_OPTIONS = {
    "language": "de",
    "beam_size": 5,
    "temperature": 0,
    "word_timestamps": True,
    "condition_on_previous_text": False,
    "vad_filter": False,
    "initial_prompt": None,
    "hotwords": None,
}

MODEL_CONFIG = {
    "device": "cpu",
    "compute_type": "int8",
    "cpu_threads": 3,
    "local_files_only": True,
}


def log_progress(msg: str) -> None:
    ts = datetime.now(timezone.utc).isoformat()
    line = f"[{ts}] {msg}\n"
    print(line, end="", flush=True)
    with open(PROGRESS_PATH, "a", encoding="utf-8") as f:
        f.write(line)
        f.flush()


def sha256_file(path: str) -> tuple[str, int]:
    h = hashlib.sha256()
    size = 0
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
            size += len(chunk)
    return h.hexdigest(), size


def sha256_array(arr: np.ndarray) -> str:
    contiguous = np.ascontiguousarray(arr, dtype=np.float32)
    return hashlib.sha256(contiguous.tobytes()).hexdigest()


def run_model(
    model_name: str,
    out_filename: str,
    spec: list[dict],
    audio: np.ndarray,
    video_meta: dict,
) -> None:
    log_progress(f"MODEL_START model={model_name}")
    t0 = time.time()
    model = WhisperModel(
        model_name,
        device=MODEL_CONFIG["device"],
        compute_type=MODEL_CONFIG["compute_type"],
        cpu_threads=MODEL_CONFIG["cpu_threads"],
        local_files_only=MODEL_CONFIG["local_files_only"],
    )
    log_progress(f"MODEL_LOADED model={model_name} elapsed={time.time() - t0:.2f}s")

    windows_out = []
    total_segments = 0
    total_words = 0

    for idx, item in enumerate(spec):
        cand_id = item["candidate"]
        start_s = float(item["start"])
        end_s = float(item["end"])
        start_sample = max(0, int(round(start_s * SAMPLE_RATE)))
        end_sample = min(len(audio), int(round(end_s * SAMPLE_RATE)))
        crop_audio = np.ascontiguousarray(audio[start_sample:end_sample], dtype=np.float32)
        crop_sha256 = sha256_array(crop_audio)

        c_t0 = time.time()
        segments_gen, info = model.transcribe(crop_audio, **TRANSCRIBE_OPTIONS)

        raw_segments = []
        crop_word_count = 0
        for seg in segments_gen:
            words_list = []
            if seg.words:
                for w in seg.words:
                    w_rel_start = float(w.start)
                    w_rel_end = float(w.end)
                    words_list.append(
                        {
                            "word": w.word,
                            "probability": float(w.probability),
                            "relativeStart": round(w_rel_start, 4),
                            "relativeEnd": round(w_rel_end, 4),
                            "start": round(start_s + w_rel_start, 4),
                            "end": round(start_s + w_rel_end, 4),
                        }
                    )
            crop_word_count += len(words_list)
            s_rel_start = float(seg.start)
            s_rel_end = float(seg.end)
            raw_segments.append(
                {
                    "id": seg.id,
                    "seek": seg.seek,
                    "relativeStart": round(s_rel_start, 4),
                    "relativeEnd": round(s_rel_end, 4),
                    "start": round(start_s + s_rel_start, 4),
                    "end": round(start_s + s_rel_end, 4),
                    "text": seg.text,
                    "avgLogprob": float(seg.avg_logprob),
                    "noSpeechProb": float(seg.no_speech_prob),
                    "compressionRatio": float(seg.compression_ratio),
                    "temperature": float(seg.temperature),
                    "words": words_list,
                }
            )

        c_elapsed = time.time() - c_t0
        total_segments += len(raw_segments)
        total_words += crop_word_count

        win_record = {
            "candidate": cand_id,
            "windowIndex": idx + 1,
            "crop": {
                "start": start_s,
                "end": end_s,
                "duration": round(end_s - start_s, 4),
                "startSample": start_sample,
                "endSample": end_sample,
                "sampleCount": int(end_sample - start_sample),
                "sampleRate": SAMPLE_RATE,
                "cropDecoded16kFloat32Sha256": crop_sha256,
            },
            "transcriptionInfo": {
                "language": info.language,
                "languageProbability": float(info.language_probability),
                "duration": float(info.duration),
            },
            "segmentCount": len(raw_segments),
            "wordCount": crop_word_count,
            "elapsedSeconds": round(c_elapsed, 3),
            "humanListened": False,
            "segments": raw_segments,
        }
        windows_out.append(win_record)

        log_progress(
            f"CROP_DONE model={model_name} candidate={cand_id} ({idx + 1}/{len(spec)}) "
            f"range={start_s:.2f}-{end_s:.2f}s segments={len(raw_segments)} words={crop_word_count} "
            f"elapsed={c_elapsed:.2f}s"
        )

    total_elapsed = time.time() - t0
    payload = {
        "schema": "antigravity-independent-blind-asr-v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "humanListened": False,
        "blindPhase": True,
        "promptedByCandidateText": False,
        "inferredWordsAdded": False,
        "model": {
            "name": model_name,
            **MODEL_CONFIG,
        },
        "transcribeOptions": TRANSCRIBE_OPTIONS,
        "source": video_meta,
        "summary": {
            "expectedWindowCount": len(spec),
            "completedWindowCount": len(windows_out),
            "complete": len(windows_out) == len(spec),
            "totalSegments": total_segments,
            "totalWords": total_words,
            "elapsedSeconds": round(total_elapsed, 3),
        },
        "windows": windows_out,
    }

    out_path = os.path.join(QA_DIR, out_filename)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    log_progress(
        f"MODEL_COMPLETE model={model_name} output={out_filename} "
        f"windows={len(windows_out)}/{len(spec)} totalSegments={total_segments} "
        f"totalWords={total_words} elapsed={total_elapsed:.2f}s"
    )


def main() -> None:
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        f.write("")
    log_progress("BLIND_ASR_RUN_START runner=run-independent-asr.py")

    with open(SPEC_PATH, "r", encoding="utf-8") as f:
        spec = json.load(f)

    log_progress(f"SPEC_LOADED count={len(spec)} path={SPEC_PATH}")

    v_sha, v_bytes = sha256_file(VIDEO_PATH)
    log_progress(f"VIDEO_VERIFIED path={VIDEO_PATH} bytes={v_bytes} sha256={v_sha}")

    d_t0 = time.time()
    audio = decode_audio(VIDEO_PATH, sampling_rate=SAMPLE_RATE)
    audio = np.ascontiguousarray(audio, dtype=np.float32)
    audio_sha = sha256_array(audio)
    duration_s = len(audio) / float(SAMPLE_RATE)
    log_progress(
        f"AUDIO_DECODED samples={len(audio)} duration={duration_s:.4f}s "
        f"decoded16kFloat32Sha256={audio_sha} elapsed={time.time() - d_t0:.2f}s"
    )

    video_meta = {
        "videoPath": VIDEO_PATH.replace("\\", "/"),
        "videoBytes": v_bytes,
        "videoSha256": v_sha,
        "sampleRate": SAMPLE_RATE,
        "decodedSampleCount": int(len(audio)),
        "decodedDurationSeconds": round(duration_s, 4),
        "decoded16kFloat32Sha256": audio_sha,
    }

    run_model("small", "independent-small-context.json", spec, audio, video_meta)
    run_model("medium", "independent-medium-context.json", spec, audio, video_meta)

    log_progress("BLIND_ASR_RUN_COMPLETE status=SUCCESS")


if __name__ == "__main__":
    main()
