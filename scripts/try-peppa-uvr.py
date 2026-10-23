"""Offline UVR-model trial. Creates review media only; never modifies the movie or app."""
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import sys
import time

os.environ.setdefault("OMP_NUM_THREADS", "3")
os.environ.setdefault("MKL_NUM_THREADS", "3")
sys.stdout.reconfigure(encoding="utf-8")

import torch
from audio_separator.separator import Separator

torch.set_num_threads(3)
torch.set_num_interop_threads(2)

root = Path(__file__).resolve().parents[1]
out = root / "review-assets" / "peppa-uvr-sample"
model_dir = root / "tmp" / "uvr-models"
model_name = "UVR-MDX-NET-Inst_HQ_4.onnx"
source = root / "video" / "Peppa_Wutz_Supermarkt.mp4"
clip = out / "01-original.wav"

def sha256(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()

started = time.perf_counter()
separator = Separator(
    model_file_dir=str(model_dir),
    output_dir=str(out),
    output_format="WAV",
    use_soundfile=True,
    normalization_threshold=0.99,
    amplification_threshold=0.0,
    mdx_params={
        "hop_length": 1024,
        "segment_size": 256,
        "overlap": 0.25,
        "batch_size": 1,
        "enable_denoise": True,
    },
)
separator.load_model(model_filename=model_name)
print("UVR model ready; separating the 31.6-second local scene...", flush=True)
separation_started = time.perf_counter()
files = separator.separate(str(clip), custom_output_names={
    "Instrumental": "02-background-uvr",
    "Vocals": "03-removed-voice-uvr",
})
report = {
    "source_movie": str(source),
    "source_sha256": sha256(source),
    "source_start_seconds": 11.0,
    "source_end_seconds": 42.6,
    "clip_duration_seconds": 31.6,
    "model": model_name,
    "model_sha256": sha256(model_dir / model_name),
    "model_source": "https://github.com/TRvlvr/model_repo/releases/download/all_public_uvr_models/" + model_name,
    "runner": "audio-separator (UVR model and UVR-derived MDX implementation; not the desktop GUI)",
    "audio_separator_version": importlib.metadata.version("audio-separator"),
    "torch_version": torch.__version__,
    "device": "CPU",
    "denoise": True,
    "overlap": 0.25,
    "amplification": "none; output is not raised to match the original dialogue loudness",
    "separation_seconds": round(time.perf_counter() - separation_started, 2),
    "initialization_and_separation_seconds": round(time.perf_counter() - started, 2),
    "outputs": files,
    "audio_uploaded": False,
    "notes": [
        "Two stems only: this does not isolate individual characters.",
        "Instrumental is an estimated background, not a guaranteed original music-and-effects stem.",
        "Effects and laughter may follow the removed voice stem; inspect both outputs.",
        "No application integration or source movie edits.",
    ],
}
(out / "processing-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2), flush=True)
