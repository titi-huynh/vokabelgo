"""Resolve substantive YouTube/local differences against unchanged local audio."""
import json
import pathlib
import sys

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/hans"
audio = decode_audio(str(root / "video/hans.mp4"), sampling_rate=16000)
model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=3, local_files_only=True)
checks = [
    (140, 154.5, [400134, 400135], "YouTube rannte versus edited trabte ... los"),
    (364, 375, [400188, 400189], "YouTube ein versus edited mein in the sung line"),
    (457, 467, [400218, 400219, 400220], "YouTube tu ihn versus edited Heb ihn"),
    (340, 353, [400182, 400183, 400184, 400185], "YouTube das ganze Feld versus Gänsefett"),
    (528, 546, [400237, 400238], "End of story and beginning of promotional outro"),
]
result = []
for start, end, ids, reason in checks:
    segments, _ = model.transcribe(audio[int(start*16000):int(end*16000)], language="de",
        beam_size=5, word_timestamps=True, condition_on_previous_text=False,
        vad_filter=False, temperature=0)
    found = [{"start": round(start+s.start, 3), "end": round(start+s.end, 3),
              "text": s.text.strip(), "avg_logprob": s.avg_logprob,
              "words": [{"start": round(start+w.start,3), "end": round(start+w.end,3),
                         "word": w.word.strip(), "probability": w.probability} for w in s.words or []]}
             for s in segments]
    result.append({"start":start,"end":end,"captionIds":ids,"reason":reason,"segments":found})
    (folder / "youtube-difference-medium-rechecks.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"{start}-{end}: " + " | ".join(s["text"] for s in found), flush=True)
