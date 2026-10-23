"""Import the known PNG deliverables and inspect alpha without re-encoding images."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import shutil
import sys
import zipfile

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
NAMES = {"May_modular_background_v14.png", "apple-board.png", "porch-cushion.png", "vintage-viewer.png", "reading-chair.png", "play-table.png", "fishing-raft.png"}
ASSETS.mkdir(exist_ok=True)
if len(sys.argv) > 1:
    source = Path(sys.argv[1]).resolve(strict=True)
    shutil.copy2(source, ROOT / "May_modular_clean_v14.zip")
    with zipfile.ZipFile(source) as bundle:
        imported = set()
        for member in bundle.infolist():
            name = Path(member.filename).name
            if name not in NAMES:
                continue
            if name in imported:
                raise ValueError(f"Duplicate PNG in bundle: {name}")
            imported.add(name)
            (ASSETS / name).write_bytes(bundle.read(member))

atlas = ROOT.parent.parent / "assets" / "may-home-game" / "may-sprites.png"
shutil.copy2(atlas, ASSETS / "may-sprites.png")
report = {"background": "May_modular_background_v14.png", "assets": {}, "validation_errors": []}
optional = {name for name in ("vintage-viewer-stand-v14b.png",) if (ASSETS / name).is_file()}
for name in sorted(NAMES | {"may-sprites.png"} | optional):
    path = ASSETS / name
    if not path.is_file():
        report["validation_errors"].append(f"Missing file: {name}")
        continue
    with Image.open(path) as source_image:
        mode = source_image.mode
        rgba = source_image.convert("RGBA")
        alpha = rgba.getchannel("A")
        hist = alpha.histogram()
        total = rgba.width * rgba.height
        transparent = sum(hist[:8]) / total
        opaque = sum(hist[248:]) / total
        box = alpha.point(lambda value: 255 if value > 24 else 0).getbbox()
        if name == "may-sprites.png":
            frame = alpha.crop((0, 0, rgba.width // 2, rgba.height // 2))
            box = frame.point(lambda value: 255 if value > 24 else 0).getbbox()
        if not box:
            report["validation_errors"].append(f"Empty image: {name}")
            box = (0, 0, rgba.width, rgba.height)
        if name not in {"May_modular_background_v14.png", "may-sprites.png"} and (transparent < .1 or opaque < .01):
            report["validation_errors"].append(f"PNG lacks usable true alpha: {name}")
        report["assets"][name] = {
            "width": rgba.width, "height": rgba.height, "mode": mode,
            "transparent_fraction": round(transparent, 5), "opaque_fraction": round(opaque, 5),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size,
            "bounds": {"x": box[0], "y": box[1], "w": box[2]-box[0], "h": box[3]-box[1]},
            "provenance": "Existing built-in image_gen sprite atlas, reused unchanged" if name == "may-sprites.png" else "Muse modular v14"
        }
(ASSETS / "manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
if report["validation_errors"]:
    sys.exit(1)
